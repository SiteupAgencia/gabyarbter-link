import { requireTeacher } from "@/lib/admin-guard";
import { getMakeRevenueAppointments } from "@/lib/make/queries";
import { FaturamentoClient } from "./faturamento-client";

export const dynamic = "force-dynamic";

export default async function FaturamentoPage() {
  const { supabase } = await requireTeacher();

  const [appointments, { data: services }] = await Promise.all([
    getMakeRevenueAppointments(), // paginado: soma TODO o histórico, sem truncar em 1000
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
