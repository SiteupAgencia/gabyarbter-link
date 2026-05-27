import { requireTeacher } from "@/lib/admin-guard";
import { AppointmentCard } from "./appointment-card";

export const dynamic = "force-dynamic";

const TZ = "America/Sao_Paulo";

function dayKeyBR(d: Date | string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date(d));
}

function dayLabel(ymd: string): string {
  const todayKey = dayKeyBR(new Date());
  const tomorrowKey = dayKeyBR(new Date(Date.now() + 86_400_000));
  if (ymd === todayKey) return "Hoje";
  if (ymd === tomorrowKey) return "Amanhã";
  // ymd vem como "2026-05-30" — converter pra Date no fuso BR pra formatar
  const d = new Date(`${ymd}T12:00:00-03:00`);
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ, weekday: "long", day: "numeric", month: "long",
  }).format(d);
}

export default async function AdminPage() {
  const { supabase } = await requireTeacher();
  const now = new Date();
  const horizon = new Date(now.getTime() + 30 * 86_400_000); // 30 dias

  // Próximos confirmados ou pending_payment com pendência presencial.
  // Inclui também 'completed' que ainda têm restante não marcado (pra
  // a Gaby achar quem ela esqueceu de marcar pago).
  const { data: appointments } = await supabase
    .from("make_appointments")
    .select(`
      id, client_name, client_phone, client_email,
      starts_at, ends_at, status,
      total_cents, deposit_cents, amount_cents,
      final_paid_at, final_payment_method,
      payment_method, notes, service_id
    `)
    .gte("starts_at", new Date(now.getTime() - 86_400_000).toISOString()) // até 1 dia no passado
    .lte("starts_at", horizon.toISOString())
    .in("status", ["confirmed", "pending_payment", "completed"])
    .order("starts_at", { ascending: true });

  // Catálogo de serviços pra mostrar nome
  const { data: services } = await supabase
    .from("make_services")
    .select("id, name");
  const serviceMap = new Map((services ?? []).map((s) => [s.id, s.name]));

  // Agrupa por dia (em SP)
  const groups = new Map<string, typeof appointments>();
  for (const appt of appointments ?? []) {
    const key = dayKeyBR(appt.starts_at);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(appt);
  }

  if ((appointments?.length ?? 0) === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-neutral-500">Nenhum agendamento próximo.</p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <header>
        <h1 className="font-serif text-2xl text-neutral-900">Próximos agendamentos</h1>
        <p className="text-sm text-neutral-500 mt-1">
          {appointments?.length} {appointments?.length === 1 ? "agendamento" : "agendamentos"}
        </p>
      </header>

      {Array.from(groups.entries()).map(([ymd, items]) => {
        const todayKey = dayKeyBR(new Date());
        const isToday = ymd === todayKey;
        return (
          <section key={ymd}>
            <h2 className={`text-xs uppercase tracking-[0.18em] font-semibold mb-3 ${isToday ? "text-rose-700" : "text-neutral-500"}`}>
              {dayLabel(ymd)}
              {isToday && <span className="ml-2 inline-block size-1.5 rounded-full bg-rose-500 align-middle" />}
            </h2>
            <div className="space-y-3">
              {(items ?? []).map((appt) => (
                <AppointmentCard
                  key={appt.id}
                  appt={appt}
                  serviceName={serviceMap.get(appt.service_id) ?? "Maquiagem"}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
