import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Webhook do Mercado Pago.
 *
 * Configurar URL: https://gabyarbter.com.br/api/webhook/mp
 * O external_reference de cada preference = appointment id (UUID).
 *
 * Sem MERCADOPAGO_ACCESS_TOKEN configurado, este endpoint responde 200
 * silenciosamente (o stub do /api/checkout aprova direto).
 */
export async function POST(req: Request) {
  const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!mpToken) {
    return NextResponse.json({ ok: false, reason: "mp_not_configured" }, { status: 200 });
  }

  const body = (await req.json().catch(() => null)) as
    | { type?: string; data?: { id?: string }; action?: string }
    | null;

  if (!body || body.type !== "payment" || !body.data?.id) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  // busca o pagamento no MP
  const payRes = await fetch(`https://api.mercadopago.com/v1/payments/${body.data.id}`, {
    headers: { Authorization: `Bearer ${mpToken}` },
  });
  if (!payRes.ok) {
    return NextResponse.json({ error: "mp_lookup_failed" }, { status: 502 });
  }

  const payment = (await payRes.json()) as {
    status: string;
    external_reference?: string;
    id: number;
    payment_method_id?: string;
  };

  if (!payment.external_reference) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json(
      { ok: false, error: "supabase_not_configured" },
      { status: 500 },
    );
  }

  const apptId = payment.external_reference;
  const base = { mp_payment_id: String(payment.id), mp_status: payment.status };

  if (payment.status === "approved") {
    await admin
      .from("make_appointments")
      .update({
        ...base,
        status: "confirmed",
        payment_method:
          payment.payment_method_id === "pix" ? "pix" : "credit_card",
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", apptId);
    // TODO(Fase 2.4): WAHA notifica Gaby
  } else if (payment.status === "rejected" || payment.status === "cancelled") {
    await admin
      .from("make_appointments")
      .update({
        ...base,
        status: "cancelled",
        cancelled_at: new Date().toISOString(),
      })
      .eq("id", apptId);
  } else {
    await admin.from("make_appointments").update(base).eq("id", apptId);
  }

  return NextResponse.json({ ok: true });
}
