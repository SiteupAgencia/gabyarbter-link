import { requireTeacher } from "@/lib/admin-guard";
import { ClientesList } from "./clientes-list";

export const dynamic = "force-dynamic";

export type ClientAgg = {
  phone: string;
  name: string;
  visits: number; // agendamentos não cancelados
  upcoming: number; // agendamentos futuros
  totalCents: number;
  lastVisitIso: string | null;
  nextIso: string | null;
  mostRecentIso: string;
};

export default async function ClientesPage() {
  const { supabase } = await requireTeacher();

  const { data: appts } = await supabase
    .from("make_appointments")
    .select("client_name, client_phone, starts_at, status, total_cents, amount_cents")
    .order("starts_at", { ascending: false });

  const nowMs = Date.now();
  const map = new Map<string, ClientAgg>();

  for (const a of appts ?? []) {
    const phone = a.client_phone;
    if (!phone) continue;

    let c = map.get(phone);
    if (!c) {
      // Primeira ocorrência = agendamento mais recente (ordenado desc).
      c = {
        phone,
        name: a.client_name,
        visits: 0,
        upcoming: 0,
        totalCents: 0,
        lastVisitIso: null,
        nextIso: null,
        mostRecentIso: a.starts_at,
      };
      map.set(phone, c);
    }

    const counts = a.status !== "cancelled" && a.status !== "no_show";
    if (!counts) continue;

    const startMs = new Date(a.starts_at).getTime();
    c.visits += 1;
    c.totalCents += a.total_cents ?? a.amount_cents ?? 0;

    if (a.status === "completed" || startMs < nowMs) {
      if (!c.lastVisitIso || startMs > new Date(c.lastVisitIso).getTime()) {
        c.lastVisitIso = a.starts_at;
      }
    }
    if (startMs >= nowMs && a.status !== "completed") {
      c.upcoming += 1;
      if (!c.nextIso || startMs < new Date(c.nextIso).getTime()) {
        c.nextIso = a.starts_at;
      }
    }
  }

  const clients = Array.from(map.values()).sort(
    (a, b) => new Date(b.mostRecentIso).getTime() - new Date(a.mostRecentIso).getTime(),
  );

  return (
    <div className="space-y-6 fade-up">
      <header>
        <h1 className="font-serif text-[1.75rem] leading-tight tracking-tight text-ink">
          Clientes
        </h1>
      </header>
      <ClientesList clients={clients} />
    </div>
  );
}
