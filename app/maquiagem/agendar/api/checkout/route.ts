import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMakeServiceBySlug, getMakeSettings } from "@/lib/make/queries";

export const dynamic = "force-dynamic";

type Body = {
  serviceSlug?: string;
  startsAtIso?: string;
  clientName?: string;
  clientPhone?: string;
  clientEmail?: string | null;
};

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

  const isCash = service.payment_methods.includes("cash");

  // Dinheiro: confirma direto (sem MP)
  // Online: status pending_payment até webhook MP confirmar
  const initialStatus = isCash ? "confirmed" : "pending_payment";

  const { data: appt, error: insertError } = await admin
    .from("make_appointments")
    .insert({
      service_id: service.id,
      client_name: body.clientName.trim(),
      client_phone: normalizePhone(body.clientPhone),
      client_email: body.clientEmail?.trim() || null,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: initialStatus,
      amount_cents: service.price_cents,
      payment_method: isCash ? "cash" : null,
      confirmed_at: isCash ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (insertError || !appt) {
    // exclusion constraint (slot já ocupado) gera 23P01
    const code = (insertError as { code?: string } | null)?.code;
    if (code === "23P01") {
      return NextResponse.json(
        { ok: false, error: "slot_taken" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { ok: false, error: insertError?.message || "insert_failed" },
      { status: 500 },
    );
  }

  // Dinheiro: pronto
  if (isCash) {
    // TODO: disparar WAHA pra Gaby (Fase 2.4)
    return NextResponse.json({
      ok: true,
      appointmentId: appt.id,
      stub: false,
    });
  }

  // Online: STUB ou MP real
  const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

  if (!mpToken) {
    // STUB: aprova imediato pra testar UI
    await admin
      .from("make_appointments")
      .update({
        status: "confirmed",
        payment_method: "stub",
        mp_status: "stub_approved",
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", appt.id);

    // TODO: WAHA notifica Gaby
    return NextResponse.json({
      ok: true,
      appointmentId: appt.id,
      stub: true,
    });
  }

  // MP real: criar preference.
  const origin =
    req.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://gabyarbter.com.br";
  const successUrl = `${origin}/maquiagem/agendar/sucesso?id=${appt.id}`;
  const pendingUrl = `${origin}/maquiagem/agendar/sucesso?id=${appt.id}&status=pending`;
  const failureUrl = `${origin}/maquiagem/agendar/sucesso?id=${appt.id}&status=fail`;
  const webhookUrl = `${origin}/api/webhook/mp`;

  const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${mpToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          title: service.name,
          quantity: 1,
          unit_price: service.price_cents / 100,
          currency_id: "BRL",
        },
      ],
      external_reference: appt.id,
      payer: {
        name: body.clientName.trim(),
        email: body.clientEmail?.trim() || undefined,
      },
      back_urls: {
        success: successUrl,
        pending: pendingUrl,
        failure: failureUrl,
      },
      auto_return: "approved",
      notification_url: webhookUrl,
    }),
  });

  if (!mpRes.ok) {
    const text = await mpRes.text();
    return NextResponse.json(
      { ok: false, error: `mp_create_preference: ${text}` },
      { status: 502 },
    );
  }

  const mp = (await mpRes.json()) as { id: string; init_point: string };

  await admin
    .from("make_appointments")
    .update({ mp_preference_id: mp.id })
    .eq("id", appt.id);

  return NextResponse.json({
    ok: true,
    appointmentId: appt.id,
    redirectUrl: mp.init_point,
  });
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("55")) return `+${digits}`;
  if (digits.length >= 10) return `+55${digits}`;
  return raw;
}
