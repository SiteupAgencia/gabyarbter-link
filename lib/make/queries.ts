import { createClient } from "@/lib/supabase/server";
import type {
  MakeBlockedDate,
  MakeBusySlot,
  MakeService,
  MakeWeeklySchedule,
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
