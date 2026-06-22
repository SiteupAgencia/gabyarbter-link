import { requireTeacher } from "@/lib/admin-guard";
import { getMakeClientOverview } from "@/lib/make/queries";
import { ClientesList } from "./clientes-list";

export const dynamic = "force-dynamic";

export type ClientAgg = {
  key: string; // identidade do cliente: uuid do TuaAgenda (migrado) ou telefone E.164
  name: string;
  phone: string | null;
  visits: number;
  upcoming: number;
  totalCents: number;
  lastVisitIso: string | null;
  nextIso: string | null;
  isMigrated: boolean;
};

export default async function ClientesPage() {
  await requireTeacher();

  // Lê a view make_client_overview: 1 linha por cliente (identidade = id OU telefone),
  // já agregada no servidor e incluindo quem NÃO tem telefone (migrados do TuaAgenda).
  const rows = await getMakeClientOverview();
  const clients: ClientAgg[] = rows.map((r) => ({
    key: r.client_key,
    name: r.name,
    phone: r.phone,
    visits: r.visits,
    upcoming: r.upcoming,
    totalCents: r.total_cents,
    lastVisitIso: r.last_visit,
    nextIso: r.next_at,
    isMigrated: r.is_migrated,
  }));

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
