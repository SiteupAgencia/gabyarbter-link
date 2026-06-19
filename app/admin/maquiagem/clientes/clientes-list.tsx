"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn, formatBRL } from "@/lib/utils";
import { Avatar } from "../avatar";
import type { ClientAgg } from "./page";

type Filter = "all" | "upcoming" | "top";

export function ClientesList({ clients }: { clients: ClientAgg[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    let list = clients;
    if (filter === "upcoming") list = list.filter((c) => c.upcoming > 0);
    if (filter === "top") list = [...list].sort((a, b) => b.totalCents - a.totalCents).slice(0, 15);

    if (query.trim()) {
      const q = query.toLowerCase();
      const qd = query.replace(/\D/g, "");
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (qd.length > 0 && (c.phone ?? "").replace(/\D/g, "").includes(qd)),
      );
    }
    return list;
  }, [clients, filter, query]);

  const tabs: { id: Filter; label: string; count?: number }[] = [
    { id: "all", label: "Todas", count: clients.length },
    { id: "upcoming", label: "Com agendamento", count: clients.filter((c) => c.upcoming > 0).length },
    { id: "top", label: "Top" },
  ];

  return (
    <>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-ink-mute pointer-events-none" />
        <input
          placeholder="Buscar por nome ou telefone…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-sand bg-white pl-10 pr-3.5 py-2.5 text-ink placeholder:text-ink-mute focus:border-sage-300 focus:ring-2 focus:ring-sage-100 outline-none transition"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto -mx-5 px-5 pb-1 scrollbar-none">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={cn(
              "shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm font-medium transition border",
              filter === t.id
                ? "bg-sage-700 text-cream border-sage-700"
                : "bg-white text-ink-soft border-sand hover:border-sage-300",
            )}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={cn("tabular-nums text-xs", filter === t.id ? "text-cream/70" : "text-ink-mute")}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white/60 border border-sand p-8 text-center">
          <p className="font-serif text-xl mb-1 text-ink">Ninguém por aqui ainda</p>
          <p className="text-sm text-ink-soft">
            {query.trim() ? "Tente buscar de outro jeito." : "As clientes aparecem aqui conforme os agendamentos entram."}
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((c) => {
            const when =
              c.upcoming > 0 && c.nextIso
                ? `próxima ${formatDistanceToNow(new Date(c.nextIso), { locale: ptBR, addSuffix: true })}`
                : c.lastVisitIso
                  ? `última ${formatDistanceToNow(new Date(c.lastVisitIso), { locale: ptBR, addSuffix: true })}`
                  : "sem atendimentos";
            return (
              <li key={c.key}>
                <Link
                  href={`/admin/maquiagem/clientes/${encodeURIComponent(c.key)}`}
                  className="flex items-center gap-3 rounded-2xl bg-white border border-sand elev-1 hover:elev-2 transition-all p-3.5"
                >
                  <Avatar name={c.name} seed={c.key} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate text-ink">{c.name}</p>
                      {c.upcoming > 0 && (
                        <span className="shrink-0 inline-flex items-center rounded-full bg-sage-100 text-sage-700 px-2 py-0.5 text-[11px] font-medium">
                          agendada
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-ink-soft mt-0.5">
                      {c.visits} {c.visits === 1 ? "atendimento" : "atendimentos"} · {formatBRL(c.totalCents)} · {when}
                    </p>
                  </div>
                  <span className="shrink-0 text-ink-mute">›</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
