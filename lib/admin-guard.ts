import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Garante que o usuário logado é teacher (Gaby/André). Caso não, redireciona
 * pro login do Sopro — que compartilha o mesmo Supabase via cookie no domínio
 * gabyarbter.com.br (rewrite no next.config). Quem nunca logou cai direto no
 * fluxo de OTP por SMS do Sopro.
 */
export async function requireTeacher() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/sopro/entrar?next=/admin");
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "teacher") {
    redirect("/sopro/entrar?next=/admin");
  }
  return { supabase, userId: user.id, firstName: profile.full_name?.split(" ")[0] ?? "Gaby" };
}
