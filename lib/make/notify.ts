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

/**
 * Avisa a Gaby (WhatsApp) que entrou um novo PEDIDO de maquiagem (aguardando
 * ela confirmar no painel). À prova de falha: nunca lança.
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

    const firstName = String(appt.client_name).trim().split(/\s+/)[0];
    const when = formatWhen(appt.starts_at);
    const totalCents = appt.total_cents ?? appt.amount_cents;

    const text = [
      `🌸 *Novo pedido de maquiagem!*`,
      ``,
      `*${appt.client_name}*`,
      `${serviceName}`,
      `🗓️ ${when}`,
      `💰 ${formatBRL(totalCents)} · no dia`,
      `📱 ${appt.client_phone}`,
      ``,
      `Confirme no painel pra avisar a ${firstName} automaticamente:`,
      `https://gabyarbter.com.br/admin/maquiagem`,
    ].join("\n");

    await sendWhatsAppText(gaby, text);
  } catch (e) {
    console.error("[notify] erro ao avisar Gaby:", e instanceof Error ? e.message : e);
  }
}

/**
 * Dispara o WhatsApp de CONFIRMAÇÃO pra cliente quando a Gaby aprova o pedido
 * no painel. É a automação do fluxo de confirmação. À prova de falha: nunca lança.
 */
export async function notifyClientConfirmed(appointmentId: string): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data: appt } = await admin
      .from("make_appointments")
      .select("client_name, client_phone, starts_at, total_cents, amount_cents, service_id")
      .eq("id", appointmentId)
      .single();
    if (!appt) return;

    const { data: service } = await admin
      .from("make_services")
      .select("name")
      .eq("id", appt.service_id)
      .single();
    const serviceName = service?.name ?? "maquiagem";
    const firstName = String(appt.client_name).trim().split(/\s+/)[0];
    const totalCents = appt.total_cents ?? appt.amount_cents;

    const text = [
      `Oi ${firstName}! Aqui é a Gaby ✨`,
      ``,
      `Tá confirmada sua *${serviceName}* ${formatWhen(appt.starts_at)}! 🪷`,
      `Te espero no salão SOUL — Rua Marcos Uchoa, 225 (em frente à Progym).`,
      ``,
      `No dia, é só trazer ${formatBRL(totalCents)} (PIX, dinheiro ou cartão).`,
      ``,
      `Qualquer mudança, é só me chamar por aqui 💛`,
    ].join("\n");

    await sendWhatsAppText(appt.client_phone, text);
  } catch (e) {
    console.error("[notify] erro ao confirmar com a cliente:", e instanceof Error ? e.message : e);
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
        `Te espero no salão SOUL — Rua Marcos Uchoa, 225 (em frente à Progym) 🪷`,
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
