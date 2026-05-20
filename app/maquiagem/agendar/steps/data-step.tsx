"use client";

import { useState } from "react";
import type { MakeService } from "@/lib/make/types";
import { formatBRL } from "@/lib/utils";
import { formatDateBR, formatTimeBR } from "@/lib/make/slots";
import type { AgendarState } from "../agendar-client";

export function DataStep({
  service,
  slot,
  state,
  update,
  onBack,
}: {
  service: MakeService;
  slot: { startsIso: string; endsIso: string };
  state: AgendarState;
  update: (patch: Partial<AgendarState>) => void;
  onBack: () => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isCash = service.payment_methods.includes("cash");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!state.clientName.trim() || !state.clientPhone.trim()) {
      setError("Preencha nome e WhatsApp.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/maquiagem/agendar/api/checkout`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          serviceSlug: service.slug,
          startsAtIso: slot.startsIso,
          clientName: state.clientName.trim(),
          clientPhone: state.clientPhone.trim(),
          clientEmail: state.clientEmail.trim() || null,
        }),
      });
      const json = (await res.json()) as
        | { ok: true; redirectUrl?: string; appointmentId: string; stub?: boolean }
        | { ok: false; error: string };

      if (!res.ok || !("ok" in json) || !json.ok) {
        setError(("error" in json && json.error) || "Não consegui criar o agendamento.");
        setSubmitting(false);
        return;
      }

      if (json.redirectUrl) {
        window.location.href = json.redirectUrl;
        return;
      }

      // stub ou cash → redirect interno pra página de confirmação
      window.location.href = `/maquiagem/agendar/sucesso?id=${json.appointmentId}`;
    } catch (e) {
      setError(String((e as Error).message || e));
      setSubmitting(false);
    }
  }

  return (
    <section className="fade-up">
      <button
        type="button"
        onClick={onBack}
        className="text-sm text-ink-soft hover:text-ink mb-4"
      >
        ← {formatTimeBR(new Date(slot.startsIso))}
      </button>

      <h1 className="font-serif text-3xl sm:text-4xl tracking-tight text-ink">
        Pra finalizar
      </h1>
      <p className="mt-2 text-ink-soft">Pra confirmar sua reserva.</p>

      <div className="mt-6 rounded-2xl bg-cream-soft/70 border border-sand p-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="font-serif text-lg text-ink">{service.name}</p>
          <p className="font-serif text-lg text-sage-700">
            {formatBRL(service.price_cents)}
          </p>
        </div>
        <p className="mt-1 text-sm text-ink-soft capitalize">
          {formatDateBR(state.date!)} · {formatTimeBR(new Date(slot.startsIso))}
        </p>
        <p className="mt-1 text-xs text-ink-soft">
          {isCash ? "Pagamento em dinheiro presencial" : "Pagamento online via Pix ou cartão"}
        </p>
      </div>

      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field
          label="Seu nome"
          value={state.clientName}
          onChange={(v) => update({ clientName: v })}
          placeholder="Nome completo"
          autoComplete="name"
          required
        />
        <Field
          label="WhatsApp"
          value={state.clientPhone}
          onChange={(v) => update({ clientPhone: v })}
          placeholder="(54) 9 9999-9999"
          autoComplete="tel"
          inputMode="tel"
          required
        />
        <Field
          label="Email (opcional)"
          value={state.clientEmail}
          onChange={(v) => update({ clientEmail: v })}
          placeholder="seu@email.com"
          autoComplete="email"
          inputMode="email"
        />

        {error && <p className="text-sm text-clay">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-base font-medium bg-sage-gradient text-cream elev-2 hover:opacity-95 disabled:opacity-60 transition"
        >
          {submitting
            ? "Reservando…"
            : isCash
              ? "Confirmar reserva"
              : `Pagar ${formatBRL(service.price_cents)}`}
        </button>

        <p className="text-xs text-ink-soft text-center leading-relaxed">
          {isCash
            ? "Sua data fica reservada. Pagamento em dinheiro presencial no dia."
            : "Você vai pra uma página segura pra pagar via Pix ou cartão. Cancelamento até 24h antes devolve."}
        </p>
      </form>
    </section>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">;

function Field({ label, value, onChange, ...rest }: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm text-ink mb-1.5 block">{label}</span>
      <input
        {...rest}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 rounded-xl border border-sand bg-cream px-4 text-base text-ink placeholder:text-ink-soft/60 focus:outline-none focus:border-sage-300 focus:ring-2 focus:ring-sage-100"
      />
    </label>
  );
}
