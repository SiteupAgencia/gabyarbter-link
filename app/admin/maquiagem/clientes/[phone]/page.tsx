import { requireTeacher } from "@/lib/admin-guard";
import Link from "next/link";
import { Phone, CalendarClock } from "lucide-react";
import { formatBRL, formatPhoneBR } from "@/lib/utils";
import { Avatar } from "../../avatar";

export const dynamic = "force-dynamic";

const TZ = "America/Sao_Paulo";

function dateTimeBR(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ, day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

function serviceNameOf(row: { service?: unknown }): string {
  const s = row.service as { name?: string } | { name?: string }[] | null | undefined;
  if (Array.isArray(s)) return s[0]?.name ?? "Maquiagem";
  return s?.name ?? "Maquiagem";
}

const STATUS: Record<string, { label: string; cls: string }> = {
  confirmed: { label: "Confirmado", cls: "text-sage-700 bg-sage-50 border-sage-100" },
  completed: { label: "Concluído", cls: "text-sage-700 bg-sage-50 border-sage-100" },
  pending_payment: { label: "Aguardando", cls: "text-terra bg-terra-soft/20 border-terra-soft/40" },
  cancelled: { label: "Cancelado", cls: "text-ink-mute bg-sand/40 border-sand" },
  no_show: { label: "No-show", cls: "text-ink-mute bg-sand/40 border-sand" },
};

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ phone: string }>;
}) {
  const { phone } = await params;
  const { supabase } = await requireTeacher();

  const { data: appts } = await supabase
    .from("make_appointments")
    .select("id, client_name, client_phone, starts_at, status, total_cents, amount_cents, notes, final_paid_at, final_payment_method, service:make_services(name)")
    .eq("client_phone", phone)
    .order("starts_at", { ascending: false });

  if (!appts || appts.length === 0) {
    return (
      <div className="space-y-4 fade-up">
        <Link href="/admin/maquiagem/clientes" className="inline-flex text-sm text-ink-soft hover:text-ink transition">
          ← Clientes
        </Link>
        <p className="text-ink-soft">Cliente não encontrada.</p>
      </div>
    );
  }

  const name = appts[0].client_name;
  const phoneDigits = phone.replace(/\D/g, "");
  const nowMs = Date.now();

  const active = appts.filter((a) => a.status !== "cancelled" && a.status !== "no_show");
  const totalCents = active.reduce((sum, a) => sum + (a.total_cents ?? a.amount_cents ?? 0), 0);
  const next = active
    .filter((a) => new Date(a.starts_at).getTime() >= nowMs && a.status !== "completed")
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())[0];

  return (
    <div className="space-y-6 fade-up">
      <Link href="/admin/maquiagem/clientes" className="inline-flex text-sm text-ink-soft hover:text-ink transition">
        ← Clientes
      </Link>

      {/* Cabeçalho */}
      <div className="flex items-center gap-4">
        <Avatar name={name} seed={phone} size={56} />
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-2xl text-ink leading-tight truncate">{name}</h1>
          <p className="text-sm text-ink-soft mt-0.5">{formatPhoneBR(phone)}</p>
        </div>
        <a
          href={`https://wa.me/${phoneDigits}`}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 rounded-full bg-sage-gradient text-cream px-4 py-2 text-sm font-medium elev-1 hover:opacity-95 transition shrink-0"
        >
          <Phone className="size-4" /> WhatsApp
        </a>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white border border-sand elev-1 p-4">
          <p className="text-xs uppercase tracking-wider text-ink-soft">Atendimentos</p>
          <p className="font-serif text-2xl text-ink mt-1 tabular-nums">{active.length}</p>
        </div>
        <div className="rounded-2xl bg-white border border-sand elev-1 p-4">
          <p className="text-xs uppercase tracking-wider text-ink-soft">Total</p>
          <p className="font-serif text-2xl text-sage-700 mt-1 tabular-nums">{formatBRL(totalCents)}</p>
        </div>
      </div>

      {/* Próximo agendamento */}
      {next && (
        <div className="rounded-2xl bg-sage-50 border border-sage-100 p-4 flex items-center gap-3">
          <CalendarClock className="size-5 text-sage-700 shrink-0" />
          <div>
            <p className="text-xs uppercase tracking-wider text-sage-700 font-semibold">Próximo</p>
            <p className="text-ink mt-0.5 capitalize">
              {dateTimeBR(next.starts_at)} · {serviceNameOf(next)}
            </p>
          </div>
        </div>
      )}

      {/* Histórico */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.18em] font-semibold mb-3 text-ink-soft">Histórico</h2>
        <ul className="space-y-2">
          {appts.map((a) => {
            const st = STATUS[a.status] ?? { label: a.status, cls: "text-ink-mute bg-sand/40 border-sand" };
            const cancelled = a.status === "cancelled" || a.status === "no_show";
            return (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-2xl bg-white border border-sand elev-1 p-3.5"
              >
                <div className="min-w-0">
                  <p className={`font-medium capitalize ${cancelled ? "text-ink-mute line-through" : "text-ink"}`}>
                    {dateTimeBR(a.starts_at)}
                  </p>
                  <p className="text-sm text-ink-soft mt-0.5 truncate">{serviceNameOf(a)}</p>
                  {a.notes && <p className="text-xs text-ink-soft italic mt-0.5">&ldquo;{a.notes}&rdquo;</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-medium tabular-nums ${cancelled ? "text-ink-mute" : "text-ink"}`}>
                    {formatBRL(a.total_cents ?? a.amount_cents ?? 0)}
                  </p>
                  <span className={`inline-flex items-center text-[11px] rounded-full border px-2 py-0.5 mt-1 ${st.cls}`}>
                    {st.label}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
