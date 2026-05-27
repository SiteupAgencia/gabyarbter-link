"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type PaymentMethod = "cash" | "pix" | "credit_card";

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
  revalidatePath("/admin");
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
  revalidatePath("/admin");
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
  revalidatePath("/admin");
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
  revalidatePath("/admin");
}
