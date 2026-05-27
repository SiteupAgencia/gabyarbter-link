import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { notifyGabyNewBooking, notifyGabyAppointmentFreed } from "@/lib/make/notify";

/**
 * Webhook do Asaas.
 *
 * Configurar no painel Asaas → Integrações → Webhooks:
 *   URL: https://gabyarbter.com.br/api/webhook/asaas
 *   Eventos: PAYMENT_CONFIRMED, PAYMENT_RECEIVED, PAYMENT_OVERDUE,
 *            PAYMENT_REFUNDED, PAYMENT_DELETED
 *
 * Opcional: setar um token no painel → vem no header `asaas-access-token`.
 * Se ASAAS_WEBHOOK_TOKEN estiver setado, validamos.
 */
type AsaasWebhook = {
  event?: string;
  payment?: {
    id?: string;
    status?: string;
    billingType?: string;
    externalReference?: string;
  };
};

export async function POST(req: Request) {
  // Validação opcional de token
  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
  if (expectedToken) {
    const got = req.headers.get("asaas-access-token");
    if (got !== expectedToken) {
      return NextResponse.json({ ok: false, error: "invalid_token" }, { status: 401 });
    }
  }

  const body = (await req.json().catch(() => null)) as AsaasWebhook | null;
  const event = body?.event;
  const payment = body?.payment;

  if (!event || !payment?.externalReference) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return NextResponse.json({ ok: false, error: "supabase_not_configured" }, { status: 500 });
  }

  const apptId = payment.externalReference;
  const base = {
    asaas_payment_id: payment.id ?? null,
    mp_status: payment.status ?? null, // reusa coluna existente p/ status do provedor
  };

  const paymentMethod =
    payment.billingType === "PIX"
      ? "pix"
      : payment.billingType === "CREDIT_CARD"
        ? "credit_card"
        : "online";

  switch (event) {
    case "PAYMENT_CONFIRMED":
    case "PAYMENT_RECEIVED": {
      const { data: confirmed } = await admin
        .from("make_appointments")
        .update({
          ...base,
          status: "confirmed",
          payment_method: paymentMethod,
          confirmed_at: new Date().toISOString(),
        })
        .eq("id", apptId)
        .eq("status", "pending_payment") // não rebaixa algo já cancelado
        .select("id")
        .maybeSingle();
      // Avisa a Gaby só na transição real pending_payment -> confirmed.
      // Se o Asaas reenviar o evento, `confirmed` vem null e não duplica.
      if (confirmed) {
        await notifyGabyNewBooking(apptId);
      }
      break;
    }

    case "PAYMENT_REFUNDED": {
      const { data: prevRefund } = await admin
        .from("make_appointments")
        .select("status")
        .eq("id", apptId)
        .maybeSingle();
      await admin
        .from("make_appointments")
        .update({ ...base, status: "refunded", cancelled_at: new Date().toISOString() })
        .eq("id", apptId);
      // Só avisa liberação se havia um horário de fato reservado (confirmado).
      if (prevRefund?.status === "confirmed") {
        await notifyGabyAppointmentFreed(apptId, "reembolso");
      }
      break;
    }

    case "PAYMENT_OVERDUE":
    case "PAYMENT_DELETED":
      await admin
        .from("make_appointments")
        .update({ ...base, status: "cancelled", cancelled_at: new Date().toISOString() })
        .eq("id", apptId)
        .eq("status", "pending_payment");
      break;

    default:
      // outros eventos: só registra o status do provedor
      await admin.from("make_appointments").update(base).eq("id", apptId);
  }

  return NextResponse.json({ ok: true });
}
