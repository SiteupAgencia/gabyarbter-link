import { requireTeacher } from "@/lib/admin-guard";
import { FaturamentoClient } from "./faturamento-client";

export const dynamic = "force-dynamic";

export default async function FaturamentoPage() {
  const { supabase } = await requireTeacher();

  const [{ data: appointments }, { data: services }] = await Promise.all([
    supabase
      .from("make_appointments")
      .select("id, client_name, starts_at, status, total_cents, amount_cents, service_id")
      .in("status", ["confirmed", "completed"])
      .order("starts_at", { ascending: false }),
    supabase.from("make_services").select("id, name"),
  ]);

  const serviceMap = new Map((services ?? []).map((s) => [s.id, s.name]));
  const appts = (appointments ?? []).map((a) => ({
    id: a.id,
    clientName: a.client_name,
    startsAt: a.starts_at,
    status: a.status,
    totalCents: a.total_cents ?? a.amount_cents ?? 0,
    serviceName: serviceMap.get(a.service_id) ?? "Maquiagem",
  }));

  return (
    <div className="space-y-6 fade-up">
      <header>
        <h1 className="font-serif text-[1.75rem] leading-tight tracking-tight text-ink">
          Faturamento
        </h1>
      </header>
      <FaturamentoClient appointments={appts} />
    </div>
  );
}
