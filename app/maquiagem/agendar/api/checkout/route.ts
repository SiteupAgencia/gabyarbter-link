import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMakeServiceBySlug, getMakeSettings } from "@/lib/make/queries";
import { notifyGabyNewBooking } from "@/lib/make/notify";

export const dynamic = "force-dynamic";

type Body = {
  serviceSlug?: string;
  startsAtIso?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string | null;
};

// Sem cobrança online: a Gaby prefere receber no dia (PIX, dinheiro ou cartão).
// O agendamento entra confirmado na hora — reserva o horário e avisa a Gaby.
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
      client_phone: normalizePhone(body.clientPhone),
      client_email: body.clientEmail?.trim() || null,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: "confirmed",
      total_cents: service.price_cents,
      deposit_cents: 0, // nada pago online — recebe tudo no dia
      amount_cents: 0,
      payment_method: null,
      confirmed_at: new Date().toISOString(),
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

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("55")) return `+${digits}`;
  if (digits.length >= 10) return `+55${digits}`;
  return raw;
}
