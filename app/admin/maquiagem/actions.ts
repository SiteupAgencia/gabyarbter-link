"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { combineDateTime, weekdayInBR } from "@/lib/make/slots";
import { notifyClientConfirmed } from "@/lib/make/notify";
import { toE164 } from "@/lib/make/phone";
import {
  resolveManualAppointmentWindow,
  type AppointmentConflict,
} from "@/lib/make/manual-overlap";

type PaymentMethod = "cash" | "pix" | "credit_card";
type ManualEventKind = "block" | "commitment" | "party" | "yoga";

type ActionResult =
  | { ok: true; id: string }
  | { ok: false; error: string }
  | {
      ok: false;
      kind: "appointment_conflict";
      error: string;
      conflict: AppointmentConflict;
      requestedDurationMin: number;
      suggestedDurationMin: number | null;
    };
const MANUAL_EVENT_KINDS = new Set<ManualEventKind>(["block", "commitment", "party", "yoga"]);

export async function markFinalPaid(appointmentId: string, method: PaymentMethod) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not_authenticated");

  const { error } = await supabase
    .from("make_appointments")
    .update({
      final_paid_at: new Date().toISOString(),
      final_payment_method: method,
    })
    .eq("id", appointmentId);

  if (error) throw error;
  revalidatePath("/admin/maquiagem");
}

export async function unmarkFinalPaid(appointmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not_authenticated");

  const { error } = await supabase
    .from("make_appointments")
    .update({
      final_paid_at: null,
      final_payment_method: null,
    })
    .eq("id", appointmentId);

  if (error) throw error;
  revalidatePath("/admin/maquiagem");
}

export async function markCompleted(appointmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not_authenticated");

  const { error } = await supabase
    .from("make_appointments")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", appointmentId);

  if (error) throw error;
  revalidatePath("/admin/maquiagem");
}

export async function markNoShow(appointmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not_authenticated");

  const { error } = await supabase
    .from("make_appointments")
    .update({
      status: "no_show",
      cancelled_at: new Date().toISOString(),
    })
    .eq("id", appointmentId);

  if (error) throw error;
  revalidatePath("/admin/maquiagem");
}

/**
 * Gaby CONFIRMA o pedido do cliente → status confirmed + dispara o WhatsApp
 * automático de confirmação pra cliente (a automação do fluxo).
 */
export async function confirmBooking(appointmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not_authenticated");

  const { error } = await supabase
    .from("make_appointments")
    .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
    .eq("id", appointmentId);
  if (error) throw error;

  // Automação: avisa a cliente que tá confirmada (à prova de falha — nunca lança).
  await notifyClientConfirmed(appointmentId);
  revalidatePath("/admin/maquiagem");
}

/** Gaby RECUSA o pedido → cancela e libera o horário. */
export async function declineBooking(appointmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not_authenticated");

  const { error } = await supabase
    .from("make_appointments")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", appointmentId);
  if (error) throw error;
  revalidatePath("/admin/maquiagem");
}

/**
 * Cancela um agendamento JÁ CONFIRMADO (cliente desmarcou, imprevisto da Gaby…).
 * Vira status 'cancelled' → sai da agenda e LIBERA o horário pro online
 * (make_busy_slots só conta pending_payment/confirmed).
 */
export async function cancelBooking(appointmentId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not_authenticated");

  const { error } = await supabase
    .from("make_appointments")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", appointmentId);
  if (error) throw error;
  revalidatePath("/admin/maquiagem");
}

/**
 * Busca clientes JÁ cadastrados por nome (parcial) ou telefone (normalizado),
 * pra Gaby reaproveitar em vez de criar duplicado no novo agendamento.
 * Lê a view make_client_overview (uma linha por cliente). Nunca lança: retorna
 * [] em qualquer erro/sessão inválida.
 */
export async function searchMakeClients(input: {
  name?: string;
  phone?: string;
}): Promise<
  { key: string; name: string; phone: string | null; visits: number; isMigrated: boolean }[]
> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Sanitiza pro filtro .or() do PostgREST (vírgula/parênteses/curinga são sintaxe).
  const name = (input.name ?? "").trim().replace(/[%,()*]/g, " ").trim();
  const phone = toE164(input.phone ?? "");

  const filters: string[] = [];
  if (name.length >= 2) filters.push(`name.ilike.*${name}*`);
  if (phone) filters.push(`phone.eq.${phone}`);
  if (filters.length === 0) return [];

  const { data, error } = await supabase
    .from("make_client_overview")
    .select("client_key, name, phone, visits, is_migrated")
    .or(filters.join(","))
    .order("most_recent", { ascending: false })
    .limit(6);

  if (error) {
    console.warn("[make] searchMakeClients:", error.message);
    return [];
  }

  return (data ?? []).map((r) => ({
    key: r.client_key as string,
    name: r.name as string,
    phone: (r.phone as string | null) ?? null,
    visits: (r.visits as number) ?? 0,
    isMigrated: Boolean(r.is_migrated),
  }));
}

function overlaps(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && endA > startB;
}

function dayYmd(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

async function findMakeWindowConflict(
  supabase: Awaited<ReturnType<typeof createClient>>,
  startsAt: Date,
  endsAt: Date,
  excludeAppointmentId?: string,
): Promise<
  | { kind: "appointment"; appointment: AppointmentConflict }
  | { kind: "blocked"; error: string }
  | null
> {
  const startIso = startsAt.toISOString();
  const endIso = endsAt.toISOString();

  let apptQuery = supabase
    .from("make_appointments")
    .select("id, client_name, starts_at, ends_at")
    .in("status", ["pending_payment", "confirmed"])
    .lt("starts_at", endIso)
    .gt("ends_at", startIso)
    .limit(1);

  if (excludeAppointmentId) apptQuery = apptQuery.neq("id", excludeAppointmentId);

  const { data: appts, error: apptErr } = await apptQuery;
  if (apptErr) throw apptErr;
  const conflictingAppt = appts?.[0];
  if (conflictingAppt) {
    return {
      kind: "appointment",
      appointment: {
        id: String(conflictingAppt.id),
        clientName: String(conflictingAppt.client_name),
        startsAt: String(conflictingAppt.starts_at),
        endsAt: String(conflictingAppt.ends_at),
      },
    };
  }

  const ymd = dayYmd(startsAt);
  const { data: blocks, error: blockErr } = await supabase
    .from("make_blocked_dates")
    .select("all_day, start_time, end_time, reason")
    .eq("date", ymd);
  if (blockErr) throw blockErr;

  for (const b of blocks ?? []) {
    if (b.all_day) return { kind: "blocked", error: "Esse dia tem outro evento de dia inteiro." };
    if (!b.start_time || !b.end_time) continue;
    const bStart = combineDateTime(ymd, b.start_time);
    const bEnd = combineDateTime(ymd, b.end_time);
    if (overlaps(startsAt, endsAt, bStart, bEnd)) {
      return { kind: "blocked", error: "Esse horário cruza com outro evento da agenda." };
    }
  }

  const weekday = weekdayInBR(ymd);
  const { data: recurring, error: recErr } = await supabase
    .from("make_recurring_blocks")
    .select("start_time, end_time, reason")
    .eq("weekday", weekday)
    .eq("active", true);
  if (recErr) throw recErr;

  for (const r of recurring ?? []) {
    const rStart = combineDateTime(ymd, r.start_time);
    const rEnd = combineDateTime(ymd, r.end_time);
    if (overlaps(startsAt, endsAt, rStart, rEnd)) {
      return { kind: "blocked", error: "Esse horário cruza com um evento fixo da agenda." };
    }
  }

  const { data: yoga, error: yogaErr } = await supabase
    .from("classes")
    .select("starts_at, duration_minutes")
    .gte("starts_at", combineDateTime(ymd, "00:00:00").toISOString())
    .lt("starts_at", combineDateTime(ymd, "23:59:59").toISOString());

  if (yogaErr) {
    console.warn("[make] conflito com yoga não checado:", yogaErr.message);
    return null;
  }

  for (const c of yoga ?? []) {
    const cStart = new Date(c.starts_at);
    const cEnd = new Date(cStart.getTime() + Number(c.duration_minutes) * 60_000);
    if (overlaps(startsAt, endsAt, cStart, cEnd)) {
      return { kind: "blocked", error: "Esse horário cruza com uma aula de yoga." };
    }
  }

  return null;
}

/**
 * Agendamento manual feito pela Gaby (cliente que veio pelo Insta/WhatsApp).
 * Entra confirmado, sem cobrança online — recebe tudo no dia (deposit = 0).
 * Grava na MESMA agenda que o fluxo online lê, então a exclusion constraint
 * impede marcar em cima de outro agendamento.
 */
export async function createManualAppointment(input: {
  serviceId: string;
  clientName: string;
  clientPhone: string;
  dateYmd: string;
  startTime: string; // 'HH:MM'
  durationMin?: number;
  allowOverlap?: boolean;
  notes?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sessão expirada — entre de novo." };

  const name = input.clientName.trim();
  const phone = toE164(input.clientPhone);
  if (!name) return { ok: false, error: "Informe o nome da cliente." };
  if (!phone) return { ok: false, error: "Informe um telefone válido (com DDD)." };
  if (!input.serviceId) return { ok: false, error: "Escolha o serviço." };
  if (!input.dateYmd || !input.startTime) return { ok: false, error: "Escolha data e horário." };

  const { data: service, error: svcErr } = await supabase
    .from("make_services")
    .select("id, price_cents, duration_min")
    .eq("id", input.serviceId)
    .single();
  if (svcErr || !service) return { ok: false, error: "Serviço não encontrado." };

  const startsAt = combineDateTime(input.dateYmd, input.startTime);
  if (isNaN(startsAt.getTime())) return { ok: false, error: "Data/horário inválidos." };
  const durationMin = input.durationMin ?? Number(service.duration_min);
  const requestedEndsAt = new Date(startsAt.getTime() + durationMin * 60_000);
  const conflict = await findMakeWindowConflict(supabase, startsAt, requestedEndsAt);
  if (conflict?.kind === "blocked") return { ok: false, error: conflict.error };

  const window = resolveManualAppointmentWindow({
    startsAt,
    durationMin,
    appointmentConflict: conflict?.kind === "appointment" ? conflict.appointment : null,
    allowOverlap: input.allowOverlap === true,
  });
  if (!window.ok) {
    if (window.kind === "invalid_duration") return { ok: false, error: window.error };
    return {
      ok: false,
      kind: "appointment_conflict",
      error: "Já existe uma cliente nesse horário.",
      conflict: window.conflict,
      requestedDurationMin: window.requestedDurationMin,
      suggestedDurationMin: window.suggestedDurationMin,
    };
  }
  const endsAt = window.endsAt;

  const { data: appt, error } = await supabase
    .from("make_appointments")
    .insert({
      service_id: service.id,
      client_name: name,
      client_phone: phone,
      starts_at: startsAt.toISOString(),
      ends_at: endsAt.toISOString(),
      status: "confirmed",
      total_cents: service.price_cents,
      deposit_cents: 0,
      amount_cents: 0,
      payment_method: null,
      confirmed_at: new Date().toISOString(),
      notes: input.notes?.trim() || null,
      allow_overlap: window.isOverlap,
    })
    .select("id")
    .single();

  if (error || !appt) {
    const code = (error as { code?: string } | null)?.code;
    if (code === "23P01") return { ok: false, error: "Já existe um agendamento nesse horário." };
    return { ok: false, error: error?.message ?? "Não consegui salvar o agendamento." };
  }

  revalidatePath("/admin/maquiagem");
  return { ok: true, id: appt.id };
}

export async function rescheduleAppointment(input: {
  appointmentId: string;
  dateYmd: string;
  startTime: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sessão expirada — entre de novo." };

  if (!input.appointmentId) return { ok: false, error: "Agendamento não encontrado." };
  if (!input.dateYmd || !input.startTime) return { ok: false, error: "Escolha data e horário." };

  const { data: appt, error: apptErr } = await supabase
    .from("make_appointments")
    .select("id, status, service:make_services(duration_min)")
    .eq("id", input.appointmentId)
    .single();

  if (apptErr || !appt) return { ok: false, error: "Agendamento não encontrado." };
  if (!["pending_payment", "confirmed"].includes(String(appt.status))) {
    return { ok: false, error: "Só dá pra editar horário de pedido ou make confirmada." };
  }

  const service = Array.isArray(appt.service) ? appt.service[0] : appt.service;
  const durationMin = Number(service?.duration_min ?? 0);
  if (!durationMin) return { ok: false, error: "Serviço sem duração cadastrada." };

  const startsAt = combineDateTime(input.dateYmd, input.startTime);
  if (isNaN(startsAt.getTime())) return { ok: false, error: "Data/horário inválidos." };
  const endsAt = new Date(startsAt.getTime() + durationMin * 60_000);

  const conflict = await findMakeWindowConflict(supabase, startsAt, endsAt, input.appointmentId);
  if (conflict) {
    return {
      ok: false,
      error: conflict.kind === "blocked" ? conflict.error : "Já existe uma make nesse horário.",
    };
  }

  const { data: updated, error } = await supabase
    .from("make_appointments")
    .update({ starts_at: startsAt.toISOString(), ends_at: endsAt.toISOString() })
    .eq("id", input.appointmentId)
    .select("id")
    .single();

  if (error || !updated) {
    const code = (error as { code?: string } | null)?.code;
    if (code === "23P01") return { ok: false, error: "Já existe um agendamento nesse horário." };
    return { ok: false, error: error?.message ?? "Não consegui alterar o horário." };
  }

  revalidatePath("/admin/maquiagem");
  return { ok: true, id: updated.id };
}

/**
 * Bloqueio de horário (folga, yoga, almoço…).
 *  - recurring=false → make_blocked_dates (data única).
 *  - recurring=true  → make_recurring_blocks (toda semana no mesmo dia/horário,
 *    ex.: yoga toda terça 07:00–08:30). Sempre com faixa de horário.
 * O cálculo de slots já respeita as duas tabelas — derruba o horário no
 * agendamento online na hora.
 */
export async function createBlock(input: {
  dateYmd: string;
  allDay: boolean;
  startTime?: string; // 'HH:MM'
  endTime?: string;
  reason?: string;
  kind?: ManualEventKind;
  recurring?: boolean;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sessão expirada — entre de novo." };
  if (!input.dateYmd) return { ok: false, error: "Escolha a data." };
  const kind = input.kind && MANUAL_EVENT_KINDS.has(input.kind) ? input.kind : "block";

  // Recorrente: sempre por faixa de horário, num dia da semana.
  if (input.recurring) {
    if (!input.startTime || !input.endTime) {
      return { ok: false, error: "Informe início e fim do bloqueio." };
    }
    if (input.endTime <= input.startTime) {
      return { ok: false, error: "O fim precisa ser depois do início." };
    }
    const { data: block, error } = await supabase
      .from("make_recurring_blocks")
      .insert({
        weekday: weekdayInBR(input.dateYmd),
        start_time: input.startTime,
        end_time: input.endTime,
        reason: input.reason?.trim() || null,
        kind,
      })
      .select("id")
      .single();
    if (error || !block) {
      return { ok: false, error: error?.message ?? "Não consegui salvar o bloqueio." };
    }
    revalidatePath("/admin/maquiagem");
    return { ok: true, id: block.id };
  }

  let start_time: string | null = null;
  let end_time: string | null = null;
  if (!input.allDay) {
    if (!input.startTime || !input.endTime) {
      return { ok: false, error: "Informe início e fim, ou marque dia inteiro." };
    }
    if (input.endTime <= input.startTime) {
      return { ok: false, error: "O fim precisa ser depois do início." };
    }
    start_time = input.startTime;
    end_time = input.endTime;
  }

  const { data: block, error } = await supabase
    .from("make_blocked_dates")
    .insert({
      date: input.dateYmd,
      all_day: input.allDay,
      start_time,
      end_time,
      reason: input.reason?.trim() || null,
      kind,
    })
    .select("id")
    .single();

  if (error || !block) return { ok: false, error: error?.message ?? "Não consegui salvar o bloqueio." };

  revalidatePath("/admin/maquiagem");
  return { ok: true, id: block.id };
}

export async function deleteBlock(blockId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not_authenticated");

  const { error } = await supabase.from("make_blocked_dates").delete().eq("id", blockId);
  if (error) throw error;
  revalidatePath("/admin/maquiagem");
}

export async function deleteRecurringBlock(blockId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("not_authenticated");

  const { error } = await supabase.from("make_recurring_blocks").delete().eq("id", blockId);
  if (error) throw error;
  revalidatePath("/admin/maquiagem");
}
