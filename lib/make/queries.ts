import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  MakeBlockedDate,
  MakeBusySlot,
  MakeRecurringBlock,
  MakeService,
  MakeWeeklySchedule,
  YogaClassEvent,
} from "./types";
import { buildSettings } from "./slots";

export async function getMakeServices(): Promise<MakeService[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("make_services")
    .select("*")
    .eq("active", true)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as MakeService[];
}

export async function getMakeServiceBySlug(slug: string): Promise<MakeService | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("make_services")
    .select("*")
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  return (data as MakeService | null) ?? null;
}

export async function getMakeWeeklySchedule(): Promise<MakeWeeklySchedule[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("make_weekly_schedule")
    .select("*")
    .eq("active", true);
  if (error) throw error;
  return (data ?? []) as MakeWeeklySchedule[];
}

export async function getMakeBlockedDatesBetween(
  fromYmd: string,
  toYmd: string,
): Promise<MakeBlockedDate[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("make_blocked_dates")
    .select("*")
    .gte("date", fromYmd)
    .lte("date", toYmd);
  if (error) throw error;
  return (data ?? []) as MakeBlockedDate[];
}

export async function getMakeRecurringBlocks(): Promise<MakeRecurringBlock[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("make_recurring_blocks")
    .select("*")
    .eq("active", true);
  // Resiliente: se a migration onda14 ainda não rodou, não derruba a
  // disponibilidade online — só ignora os bloqueios recorrentes.
  if (error) {
    console.warn("[make] make_recurring_blocks indisponível:", error.message);
    return [];
  }
  return (data ?? []) as MakeRecurringBlock[];
}

export async function getYogaClassesSince(fromIso: string): Promise<YogaClassEvent[]> {
  let supabase;
  try {
    supabase = createAdminClient();
  } catch {
    supabase = await createClient();
  }

  const { data, error } = await supabase
    .from("classes")
    .select("id, title, starts_at, duration_minutes, location")
    .gte("starts_at", fromIso)
    .order("starts_at", { ascending: true });

  // Resiliente: se o schema do Sopro não estiver disponível em algum ambiente
  // local, o admin da make continua funcionando sem os eventos de yoga.
  if (error) {
    console.warn("[make] classes do yoga indisponíveis:", error.message);
    return [];
  }

  return (data ?? []) as YogaClassEvent[];
}

export async function getMakeBusySlots(
  fromIso: string,
  toIso: string,
): Promise<MakeBusySlot[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("make_busy_slots", {
    p_from: fromIso,
    p_to: toIso,
  });
  if (error) throw error;
  return (data ?? []) as MakeBusySlot[];
}

export async function getMakeSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase.from("make_settings").select("key,value");
  if (error) throw error;
  return buildSettings(data ?? []);
}

// ---- Paginação: o PostgREST limita o nº de linhas por request; pra somar
//      faturamento ou listar todos os clientes sem truncar, paginamos por range. ----
async function fetchAllRange<T>(
  build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
  page = 1000,
): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; from < 200_000; from += page) {
    const { data, error } = await build(from, from + page - 1);
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    out.push(...rows);
    if (rows.length < page) break;
  }
  return out;
}

export type MakeClientRow = {
  client_key: string;
  name: string;
  phone: string | null;
  email: string | null;
  birthday: string | null;
  city: string | null;
  tuaagenda_id: string | null;
  is_migrated: boolean;
  visits: number;
  upcoming: number;
  total_cents: number;
  last_visit: string | null;
  next_at: string | null;
  most_recent: string;
};

/** Lista do CRM: uma linha por cliente (identidade = id ou telefone), inclui quem não tem telefone. */
export async function getMakeClientOverview(): Promise<MakeClientRow[]> {
  const supabase = await createClient();
  return fetchAllRange<MakeClientRow>((from, to) =>
    supabase
      .from("make_client_overview")
      .select("*")
      .order("most_recent", { ascending: false })
      .range(from, to),
  );
}

/** Detalhe de um cliente por client_key (uuid do TuaAgenda OU telefone E.164). */
export async function getMakeClientDetail(key: string) {
  const supabase = await createClient();
  const byId = /^[0-9a-f]{8}-[0-9a-f]{4}-/.test(key); // uuid => migrado; senão telefone
  const apptQuery = supabase
    .from("make_appointments")
    .select(
      "id, client_name, client_phone, starts_at, status, total_cents, amount_cents, notes, final_paid_at, final_payment_method, service:make_services(name)",
    )
    .order("starts_at", { ascending: false });

  const [{ data: overview }, { data: appts }] = await Promise.all([
    supabase.from("make_client_overview").select("*").eq("client_key", key).maybeSingle(),
    byId ? apptQuery.eq("tuaagenda_client_id", key) : apptQuery.eq("client_phone", key),
  ]);
  return { overview: (overview as MakeClientRow | null) ?? null, appts: appts ?? [] };
}

export type MakeRevenueRow = {
  id: string;
  client_name: string;
  starts_at: string;
  status: string;
  total_cents: number | null;
  amount_cents: number | null;
  service_id: string;
};

/** Atendimentos pro Faturamento: todos confirmados/concluídos (paginado, sem truncar em 1000). */
export async function getMakeRevenueAppointments(): Promise<MakeRevenueRow[]> {
  const supabase = await createClient();
  return fetchAllRange<MakeRevenueRow>((from, to) =>
    supabase
      .from("make_appointments")
      .select("id, client_name, starts_at, status, total_cents, amount_cents, service_id")
      .in("status", ["confirmed", "completed"])
      .order("starts_at", { ascending: false })
      .range(from, to),
  );
}
