"use client";

import type { MakeService } from "@/lib/make/types";
import { formatBRL } from "@/lib/utils";

export function ServiceStep({
  services,
  selectedId,
  onSelect,
}: {
  services: MakeService[];
  selectedId: string | null;
  onSelect: (svc: MakeService) => void;
}) {
  return (
    <section className="fade-up">
      <h1 className="font-serif text-3xl sm:text-4xl tracking-tight text-ink">
        Qual maquiagem?
      </h1>
      <p className="mt-2 text-ink-soft">
        Escolhe a técnica. Depois você escolhe data e horário.
      </p>

      <div className="mt-7 space-y-3">
        {services.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s)}
            className={`w-full text-left rounded-2xl border bg-cream p-5 elev-1 transition active:scale-[0.995] hover:elev-2 ${
              selectedId === s.id
                ? "border-sage-700 ring-2 ring-sage-200"
                : "border-sand hover:border-sage-200"
            }`}
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-serif text-xl text-ink leading-tight">{s.name}</h3>
              <p className="font-serif text-xl text-sage-700 shrink-0">
                {formatBRL(s.price_cents)}
              </p>
            </div>
            {s.description && (
              <p className="mt-2 text-sm text-ink-soft leading-relaxed">{s.description}</p>
            )}
            <div className="mt-3 flex items-center gap-3 text-xs text-ink-soft">
              <span className="inline-flex items-center gap-1">
                <Clock />
                {s.duration_min} min
              </span>
              <span aria-hidden className="h-3 w-px bg-sand" />
              <span>{paymentLabel(s.payment_methods)}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function paymentLabel(methods: string[]): string {
  if (methods.includes("cash")) return "Dinheiro presencial";
  if (methods.includes("pix") && methods.includes("credit_card")) return "Pix ou cartão online";
  if (methods.includes("pix")) return "Pix online";
  if (methods.includes("credit_card")) return "Cartão online";
  return "—";
}

function Clock() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3l2 1.5" />
    </svg>
  );
}
