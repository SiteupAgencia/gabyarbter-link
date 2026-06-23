"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { MakeService, MakeSettings } from "@/lib/make/types";
import { formatBRL } from "@/lib/utils";
import { formatDateBR, formatTimeBR } from "@/lib/make/slots";

const WHATSAPP_URL = "https://wa.me/message/E6RZKY2Y72LEB1";

type Slot = { startsIso: string; endsIso: string };

export function TimeStep({
  service,
  settings,
  dateYmd,
  selectedSlot,
  onSelect,
  onBack,
}: {
  service: MakeService;
  settings: MakeSettings;
  dateYmd: string;
  selectedSlot: Slot | null;
  onSelect: (slot: Slot) => void;
  onBack: () => void;
}) {
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`/maquiagem/agendar/api/slots?service=${service.slug}&date=${dateYmd}`, {
      cache: "no-store",
    })
      .then(async (r) => {
        if (!r.ok) throw new Error("falha ao buscar horários");
        return r.json();
      })
      .then((data) => {
        if (cancelled) return;
        setSlots((data?.slots ?? []) as Slot[]);
      })
      .catch((e) => !cancelled && setError(String(e.message || e)))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [service.slug, dateYmd, reloadKey]);

  return (
    <section className="fade-up">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-ink-soft hover:text-ink mb-4"
      >
        ← {capitalize(formatDateBR(dateYmd))}
      </button>

      <h1 className="font-serif text-3xl sm:text-4xl tracking-tight text-ink">
        Qual horário?
      </h1>
      <p className="mt-2 text-ink-soft">
        Duração estimada: {service.duration_min} minutos.
      </p>

      <div className="mt-7">
        {loading && <p className="text-center text-ink-soft py-8">Buscando horários…</p>}

        {error && (
          <div className="rounded-[1.25rem] bg-terra/10 border border-terra/30 p-6 text-center">
            <p className="text-sm text-terra">Não consegui buscar os horários agora.</p>
            <div className="mt-4 flex flex-col items-center gap-2.5">
              <button
                type="button"
                onClick={() => setReloadKey((k) => k + 1)}
                className="inline-flex h-10 items-center rounded-full px-5 text-sm font-medium bg-sage-gradient text-cream elev-soft hover:opacity-95"
              >
                Tentar de novo
              </button>
              <Link
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener"
                className="text-sm text-sage-700 hover:text-sage-900 underline underline-offset-2"
              >
                Ou fala com a Gaby no WhatsApp
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && slots.length === 0 && (
          <div className="rounded-[1.25rem] bg-cream-soft/60 hairline p-6 text-center">
            <p className="font-serif text-lg text-ink">Sem horários nesse dia.</p>
            <p className="text-sm text-ink-soft mt-2">
              Volte e escolha outro dia, ou fale no WhatsApp pra encaixe.
            </p>
            <button
              type="button"
              onClick={onBack}
              className="mt-4 inline-flex h-10 items-center rounded-full px-5 text-sm border border-sage-300 text-sage-700 hover:bg-sage-50"
            >
              Escolher outro dia
            </button>
          </div>
        )}

        {!loading && !error && slots.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {slots.map((slot) => {
              const isSelected = selectedSlot?.startsIso === slot.startsIso;
              return (
                <button
                  key={slot.startsIso}
                  type="button"
                  onClick={() => onSelect(slot)}
                  className={[
                    "h-12 rounded-[0.9rem] text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-300",
                    isSelected
                      ? "bg-sage-700 text-cream elev-soft"
                      : "bg-paper hairline text-ink hover:bg-sage-50",
                  ].join(" ")}
                >
                  {formatTimeBR(new Date(slot.startsIso))}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <p className="mt-6 text-xs text-ink-soft text-center">
        {service.name} · {formatBRL(service.price_cents)}
      </p>
    </section>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
