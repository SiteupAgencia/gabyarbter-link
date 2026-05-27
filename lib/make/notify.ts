import { createAdminClient } from "@/lib/supabase/admin";
import { sendWhatsAppText } from "@/lib/waha";

const TZ = "America/Sao_Paulo";

function formatWhen(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function paymentLabel(method: string | null): string {
  switch (method) {
    case "cash":
      return "Dinheiro (presencial)";
    case "pix":
      return "Pix";
    case "credit_card":
      return "Cartão";
    case "stub":
      return "Teste (stub)";
    default:
      return "Online";
  }
}

/**
 * Avisa a Gaby (WhatsApp) que entrou um novo agendamento de maquiagem confirmado.
 * À prova de falha: nunca lança — a notificação não pode quebrar checkout/webhook.
 */
export async function notifyGabyNewBooking(appointmentId: string): Promise<void> {
  try {
    const gaby = process.env.GABY_WHATSAPP;
    if (!gaby) {
      console.warn("[notify] GABY_WHATSAPP não setado — aviso pulado");
      return;
    }

    const admin = createAdminClient();

    const { data: appt } = await admin
      .from("make_appointments")
      .select("client_name, client_phone, starts_at, amount_cents, total_cents, deposit_cents, payment_method, service_id")
      .eq("id", appointmentId)
      .single();
    if (!appt) {
      console.warn(`[notify] appointment ${appointmentId} não encontrado`);
      return;
    }

    const { data: service } = await admin
      .from("make_services")
      .select("name")
      .eq("id", appt.service_id)
      .single();
    const serviceName = service?.name ?? "Maquiagem";

    const phoneDigits = String(appt.client_phone).replace(/\D/g, "");
    const firstName = String(appt.client_name).trim().split(/\s+/)[0];
    const when = formatWhen(appt.starts_at);

    const totalCents = appt.total_cents ?? appt.amount_cents;
    const depositCents = appt.deposit_cents ?? appt.amount_cents;
    const remainingCents = Math.max(0, totalCents - depositCents);
    const hasDeposit = depositCents > 0 && remainingCents > 0;

    // Linhas pra cliente — divide entrada e restante só quando faz sentido
    const clientMoneyLines = hasDeposit
      ? [
          `Entrada de ${formatBRL(depositCents)} já tá paga ✓`,
          `No dia, falta receber ${formatBRL(remainingCents)} (PIX ou dinheiro).`,
        ]
      : [`Valor: ${formatBRL(totalCents)} (no dia).`];

    // Mensagem pronta pra Gaby enviar à cliente
    const confirmMsg = [
      `Oi ${firstName}! Aqui é a Gaby ✨`,
      ``,
      `Confirmando sua ${serviceName} ${when}.`,
      `Te espero no meu estúdio em Erechim 🪷`,
      ``,
      ...clientMoneyLines,
      ``,
      `Qualquer dúvida ou mudança, é só me chamar!`,
    ].join("\n");
    const confirmLink = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(confirmMsg)}`;

    // Linha de valor pra Gaby — discrimina entrada e restante quando há
    const gabyMoneyLine = hasDeposit
      ? `💰 ${formatBRL(totalCents)} · entrada ${formatBRL(depositCents)} ✓ · falta ${formatBRL(remainingCents)}`
      : `💰 ${formatBRL(totalCents)} · ${paymentLabel(appt.payment_method)}`;

    const text = [
      `🌸 *Novo agendamento de maquiagem!*`,
      ``,
      `*${appt.client_name}*`,
      `${serviceName}`,
      `🗓️ ${when}`,
      gabyMoneyLine,
      `📱 ${appt.client_phone}`,
      ``,
      `✅ *Confirmar com a ${firstName}* — toca, revisa e envia:`,
      confirmLink,
    ].join("\n");

    await sendWhatsAppText(gaby, text);
  } catch (e) {
    console.error("[notify] erro ao avisar Gaby:", e instanceof Error ? e.message : e);
  }
}

/**
 * Avisa a Gaby que um horário liberou (cancelamento/reembolso de algo que
 * estava confirmado). À prova de falha: nunca lança.
 */
export async function notifyGabyAppointmentFreed(
  appointmentId: string,
  reason: string,
): Promise<void> {
  try {
    const gaby = process.env.GABY_WHATSAPP;
    if (!gaby) return;

    const admin = createAdminClient();
    const { data: appt } = await admin
      .from("make_appointments")
      .select("client_name, starts_at, service_id")
      .eq("id", appointmentId)
      .single();
    if (!appt) return;

    const { data: service } = await admin
      .from("make_services")
      .select("name")
      .eq("id", appt.service_id)
      .single();
    const serviceName = service?.name ?? "Maquiagem";

    const text = [
      `🗓️ *Um horário liberou*`,
      ``,
      `${appt.client_name} — ${serviceName}`,
      `Era ${formatWhen(appt.starts_at)}`,
      `Motivo: ${reason}`,
      ``,
      `Esse horário voltou a ficar disponível pra agendamento.`,
    ].join("\n");

    await sendWhatsAppText(gaby, text);
  } catch (e) {
    console.error("[notify] erro ao avisar liberação:", e instanceof Error ? e.message : e);
  }
}

function brtDayRangeUtc(daysFromNow: number): { start: string; end: string } {
  // Brasil não usa horário de verão (UTC-3 fixo). Pega a data atual em SP e
  // monta o range [00:00, 24:00) do dia alvo em ISO/UTC.
  const todayBRT = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const start = new Date(`${todayBRT}T00:00:00-03:00`);
  start.setDate(start.getDate() + daysFromNow);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

/**
 * Manda lembrete WhatsApp pra cada cliente com agendamento confirmado amanhã.
 * Chamado pelo cron (/api/make/reminders). Nunca lança.
 */
export async function remindAppointmentsForTomorrow(): Promise<{ sent: number; total: number }> {
  let sent = 0;
  let total = 0;
  try {
    const admin = createAdminClient();
    const { start, end } = brtDayRangeUtc(1);
    const { data: appts } = await admin
      .from("make_appointments")
      .select("client_name, client_phone, starts_at, total_cents, deposit_cents, amount_cents, final_paid_at, service_id")
      .eq("status", "confirmed")
      .gte("starts_at", start)
      .lt("starts_at", end)
      .order("starts_at", { ascending: true });

    total = appts?.length ?? 0;
    for (const appt of appts ?? []) {
      const { data: service } = await admin
        .from("make_services")
        .select("name")
        .eq("id", appt.service_id)
        .single();
      const serviceName = service?.name ?? "maquiagem";
      const firstName = String(appt.client_name).trim().split(/\s+/)[0];

      const totalCents = appt.total_cents ?? appt.amount_cents;
      const depositCents = appt.deposit_cents ?? appt.amount_cents;
      const remainingCents = appt.final_paid_at ? 0 : Math.max(0, totalCents - depositCents);

      const moneyLine = remainingCents > 0
        ? `No dia, é só trazer ${formatBRL(remainingCents)} (PIX ou dinheiro). 💛`
        : null;

      const text = [
        `Oi ${firstName}! 🌸`,
        ``,
        `Passando pra lembrar da sua ${serviceName}: ${formatWhen(appt.starts_at)}.`,
        `Te espero no meu estúdio em Erechim 🪷`,
        ...(moneyLine ? [``, moneyLine] : []),
        ``,
        `Se precisar remarcar, é só me chamar por aqui!`,
      ].join("\n");
      if (await sendWhatsAppText(appt.client_phone, text)) sent++;
    }
  } catch (e) {
    console.error("[notify] erro nos lembretes:", e instanceof Error ? e.message : e);
  }
  return { sent, total };
}
