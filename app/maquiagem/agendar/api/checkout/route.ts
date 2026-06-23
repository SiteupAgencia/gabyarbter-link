import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMakeServiceBySlug, getMakeSettings } from "@/lib/make/queries";
import { notifyGabyNewBooking } from "@/lib/make/notify";
import { toE164 } from "@/lib/make/phone";

export const dynamic = "force-dynamic";

type Body = {
  serviceSlug?: string;
  startsAtIso?: string;
  clientName?: string;
  clientPhone?: string;
};

// Sem cobrança online: a Gaby prefere receber no dia (PIX, dinheiro ou cartão).
// O pedido entra como `pending_payment` = AGUARDANDO A GABY CONFIRMAR. Já reserva
// o horário (a exclusion constraint cobre pending_payment) e avisa a Gaby; quando
// ela confirma no painel, dispara o WhatsApp automático pra cliente.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Body | null;
  if (!body?.serviceSlug || !body?.startsAtIso || !body?.clientName || !body?.clientPhone) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const service = await getMakeServiceBySlug(body.serviceSlug);
  if (!service) {
    return NextResponse.json({ ok: false, error: "service_not_found" }, { status: 404 });
  }
  const settings = await getMakeSettings();

  const startsAt = new Date(body.startsAtIso);
  if (isNaN(startsAt.getTime())) {
    return NextResponse.json({ ok: false, error: "invalid_date" }, { status: 400 });
  }
  const minAdvanceMs = settings.min_advance_hours * 3600_000;
  if (startsAt.getTime() < Date.now() + minAdvanceMs - 60_000) {
    return NextResponse.json({ ok: false, error: "too_soon" }, { status: 400 });
  }
  // Teto de antecedência: o front respeita, mas um POST direto não. +1 dia de folga
  // pra não barrar o último dia da janela por arredondamento.
  const maxAdvanceMs = settings.max_advance_days * 86400_000;
  if (startsAt.getTime() > Date.now() + maxAdvanceMs + 86400_000) {
    return NextResponse.json({ ok: false, error: "too_far" }, { status: 400 });
  }

  const clientPhone = toE164(body.clientPhone);
  if (!clientPhone) {
    return NextResponse.json({ ok: false, error: "invalid_phone" }, { status: 400 });
  }

  const endsAt = new Date(startsAt.getTime() + service.duration_min * 60_000);

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { ok: false, error: "supabase_not_configured" },
      { status: 500 },
    );
  }

  const { data: appt, error: insertError } = await admin
    .from("make_appointments")
    .insert({
      service_id: service.id,
      client_name: body.clientName.trim(),
      client_phone: clientPhone,
      client_email: null,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: "pending_payment", // aguardando a Gaby confirmar
      total_cents: service.price_cents,
      deposit_cents: 0, // nada pago online — recebe tudo no dia
      amount_cents: 0,
      payment_method: null,
    })
    .select()
    .single();

  if (insertError || !appt) {
    // exclusion constraint (slot já ocupado) gera 23P01
    const code = (insertError as { code?: string } | null)?.code;
    if (code === "23P01") {
      return NextResponse.json({ ok: false, error: "slot_taken" }, { status: 409 });
    }
    return NextResponse.json(
      { ok: false, error: insertError?.message || "insert_failed" },
      { status: 500 },
    );
  }

  await notifyGabyNewBooking(appt.id);

  return NextResponse.json({ ok: true, appointmentId: appt.id });
}
