"use client";

import { useMemo, useState } from "react";
import { cn, formatBRL } from "@/lib/utils";

type Appt = {
  id: string;
  clientName: string;
  startsAt: string;
  status: string;
  totalCents: number;
  serviceName: string;
};

const TZ = "America/Sao_Paulo";
const pad = (n: number) => String(n).padStart(2, "0");

function ymdBR(iso: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date(iso));
}
function dateLabel(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ, day: "2-digit", month: "short",
  }).format(new Date(iso));
}
function monthShort(year: number, month0: number): string {
  return new Intl.DateTimeFormat("pt-BR", { month: "short", timeZone: "UTC" })
    .format(new Date(Date.UTC(year, month0, 1, 12)));
}

type Period = "month" | "prev" | "year" | "all";

export function FaturamentoClient({ appointments }: { appointments: Appt[] }) {
  const [period, setPeriod] = useState<Period>("month");

  const today = ymdBR(new Date().toISOString());
  const curYM = today.slice(0, 7);
  const curYear = today.slice(0, 4);
  const [cy, cm] = [Number(curYM.slice(0, 4)), Number(curYM.slice(5, 7)) - 1];
  const prevYM = `${new Date(Date.UTC(cy, cm - 1, 1, 12)).getUTCFullYear()}-${pad(
    new Date(Date.UTC(cy, cm - 1, 1, 12)).getUTCMonth() + 1,
  )}`;

  const inPeriod = useMemo(() => {
    return appointments.filter((a) => {
      const ymd = ymdBR(a.startsAt);
      if (period === "month") return ymd.slice(0, 7) === curYM;
      if (period === "prev") return ymd.slice(0, 7) === prevYM;
      if (period === "year") return ymd.slice(0, 4) === curYear;
      return true;
    });
  }, [appointments, period, curYM, prevYM, curYear]);

  const nowMs = Date.now();
  const total = inPeriod.reduce((s, a) => s + a.totalCents, 0);
  const count = inPeriod.length;
  const ticket = count > 0 ? Math.round(total / count) : 0;
  const realized = inPeriod
    .filter((a) => a.status === "completed" || new Date(a.startsAt).getTime() < nowMs)
    .reduce((s, a) => s + a.totalCents, 0);
  const expected = total - realized;

  // por serviço
  const byService = useMemo(() => {
    const m = new Map<string, { count: number; cents: number }>();
    for (const a of inPeriod) {
      const e = m.get(a.serviceName) ?? { count: 0, cents: 0 };
      e.count += 1;
      e.cents += a.totalCents;
      m.set(a.serviceName, e);
    }
    return Array.from(m.entries())
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.cents - a.cents);
  }, [inPeriod]);

  // últimos 6 meses (independente do filtro)
  const months = useMemo(() => {
    const byMonth = new Map<string, number>();
    for (const a of appointments) {
      const k = ymdBR(a.startsAt).slice(0, 7);
      byMonth.set(k, (byMonth.get(k) ?? 0) + a.totalCents);
    }
    const out: { key: string; label: string; cents: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(Date.UTC(cy, cm - i, 1, 12));
      const key = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
      out.push({ key, label: monthShort(d.getUTCFullYear(), d.getUTCMonth()), cents: byMonth.get(key) ?? 0 });
    }
    return out;
  }, [appointments, cy, cm]);
  const maxMonth = Math.max(1, ...months.map((m) => m.cents));

  const tabs: { id: Period; label: string }[] = [
    { id: "month", label: "Este mês" },
    { id: "prev", label: "Mês passado" },
    { id: "year", label: "Este ano" },
    { id: "all", label: "Tudo" },
  ];

  return (
    <div className="space-y-6">
      {/* Período */}
      <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1 scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setPeriod(t.id)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-1.5 text-sm font-medium transition border",
              period === t.id
                ? "bg-sage-700 text-cream border-sage-700"
                : "bg-white text-ink-soft border-sand hover:border-sage-300",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Destaque */}
      <div className="rounded-2xl bg-white border border-sand elev-1 p-5">
        <p className="text-xs uppercase tracking-wider text-ink-soft">Faturamento do período</p>
        <p className="font-serif text-4xl text-sage-700 mt-1 tabular-nums">{formatBRL(total)}</p>
        {expected > 0 && (
          <p className="text-sm text-ink-soft mt-2">
            {formatBRL(realized)} realizado · <span className="text-terra">{formatBRL(expected)} previsto</span>
          </p>
        )}
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-cream-soft border border-sand p-4">
          <p className="text-xs uppercase tracking-wider text-ink-soft">Atendimentos</p>
          <p className="font-serif text-2xl text-ink mt-1 tabular-nums">{count}</p>
        </div>
        <div className="rounded-2xl bg-cream-soft border border-sand p-4">
          <p className="text-xs uppercase tracking-wider text-ink-soft">Ticket médio</p>
          <p className="font-serif text-2xl text-ink mt-1 tabular-nums">{formatBRL(ticket)}</p>
        </div>
      </div>

      {/* Por mês */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.18em] font-semibold mb-3 text-ink-soft">
          Últimos 6 meses
        </h2>
        <div className="rounded-2xl bg-white border border-sand elev-1 p-4">
          <div className="flex items-end justify-between gap-2 h-28">
            {months.map((m) => (
              <div key={m.key} className="flex-1 flex flex-col items-center gap-1.5 min-w-0">
                <span className="text-[10px] tabular-nums text-ink-soft">
                  {m.cents > 0 ? Math.round(m.cents / 100) : ""}
                </span>
                <div className="w-full flex items-end justify-center" style={{ height: "72px" }}>
                  <div
                    className="w-7 rounded-t-md bg-sage-gradient"
                    style={{ height: `${Math.max(m.cents > 0 ? 6 : 0, (m.cents / maxMonth) * 72)}px` }}
                  />
                </div>
                <span className="text-[11px] text-ink-soft capitalize">{m.label.replace(".", "")}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Por serviço */}
      {byService.length > 0 && (
        <section>
          <h2 className="text-xs uppercase tracking-[0.18em] font-semibold mb-3 text-ink-soft">
            Por serviço
          </h2>
          <div className="space-y-2">
            {byService.map((s) => (
              <div key={s.name} className="rounded-xl bg-white border border-sand p-3.5">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="font-medium text-ink truncate">{s.name}</span>
                  <span className="tabular-nums text-sage-700 font-medium shrink-0">{formatBRL(s.cents)}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 rounded-full bg-sand overflow-hidden">
                    <div className="h-full bg-sage-500" style={{ width: `${total > 0 ? (s.cents / total) * 100 : 0}%` }} />
                  </div>
                  <span className="text-xs text-ink-soft tabular-nums shrink-0">
                    {s.count} {s.count === 1 ? "atend." : "atend."}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Lista */}
      <section>
        <h2 className="text-xs uppercase tracking-[0.18em] font-semibold mb-3 text-ink-soft">
          Atendimentos {count > 0 && <span className="text-ink-mute">· {count}</span>}
        </h2>
        {inPeriod.length === 0 ? (
          <div className="rounded-2xl bg-white/60 border border-sand p-8 text-center">
            <p className="text-ink-soft">Nada faturado nesse período ainda.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {inPeriod.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-white border border-sand p-3.5"
              >
                <div className="min-w-0">
                  <p className="font-medium text-ink truncate">{a.clientName}</p>
                  <p className="text-sm text-ink-soft truncate">
                    {a.serviceName} · <span className="capitalize">{dateLabel(a.startsAt)}</span>
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-medium tabular-nums text-ink">{formatBRL(a.totalCents)}</p>
                  {a.status === "completed" ? (
                    <span className="text-[11px] text-sage-700">concluído</span>
                  ) : new Date(a.startsAt).getTime() >= nowMs ? (
                    <span className="text-[11px] text-terra">previsto</span>
                  ) : (
                    <span className="text-[11px] text-ink-mute">atendido</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
