"use client";

import { useState, useTransition } from "react";
import { markFinalPaid, unmarkFinalPaid, markCompleted, markNoShow } from "./actions";
import { Check, Phone, Loader2, AlertCircle, CheckCheck, X } from "lucide-react";

const TZ = "America/Sao_Paulo";

type AppointmentRow = {
  id: string;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  starts_at: string;
  ends_at: string;
  status: string;
  total_cents: number;
  deposit_cents: number;
  amount_cents: number;
  final_paid_at: string | null;
  final_payment_method: string | null;
  payment_method: string | null;
  notes: string | null;
  service_id: string;
};

function timeBR(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ, hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function methodLabel(m: string | null): string {
  switch (m) {
    case "cash": return "Dinheiro";
    case "pix": return "PIX";
    case "credit_card": return "Cartão";
    default: return "—";
  }
}

export function AppointmentCard({ appt, serviceName }: { appt: AppointmentRow; serviceName: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const totalCents = appt.total_cents ?? appt.amount_cents;
  const depositCents = appt.deposit_cents ?? appt.amount_cents;
  const remainingCents = Math.max(0, totalCents - depositCents);
  const hasDeposit = depositCents > 0 && remainingCents > 0;
  const finalPaid = appt.final_paid_at !== null;
  const isCompleted = appt.status === "completed";
  const isPendingPayment = appt.status === "pending_payment";

  const phoneDigits = String(appt.client_phone).replace(/\D/g, "");

  async function run(fn: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erro inesperado");
      }
    });
  }

  return (
    <article className="rounded-2xl bg-white border border-neutral-200 p-4 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-xl tabular-nums text-neutral-900">{timeBR(appt.starts_at)}</span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-0.5">
                <CheckCheck className="size-3" /> Concluído
              </span>
            )}
            {isPendingPayment && (
              <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                <AlertCircle className="size-3" /> Aguardando pagamento
              </span>
            )}
          </div>
          <p className="font-medium text-neutral-900 mt-1 truncate">{appt.client_name}</p>
          <p className="text-sm text-neutral-500 mt-0.5">{serviceName}</p>
        </div>
        <a
          href={`https://wa.me/${phoneDigits}`}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1 text-sm text-emerald-700 hover:text-emerald-800 shrink-0"
        >
          <Phone className="size-4" />
          WhatsApp
        </a>
      </header>

      {/* Valores */}
      <div className="mt-3 rounded-xl bg-neutral-50 border border-neutral-200 p-3 text-sm">
        <div className="flex items-baseline justify-between">
          <span className="text-neutral-500">Total</span>
          <span className="font-medium tabular-nums text-neutral-900">{formatBRL(totalCents)}</span>
        </div>
        {hasDeposit && (
          <>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-neutral-500">Entrada (online) ✓</span>
              <span className="tabular-nums text-neutral-700">{formatBRL(depositCents)}</span>
            </div>
            <div className="flex items-baseline justify-between mt-1 pt-2 border-t border-neutral-200">
              <span className={finalPaid ? "text-emerald-700" : "text-rose-700"}>
                {finalPaid ? `Restante pago via ${methodLabel(appt.final_payment_method)} ✓` : "Falta receber no dia"}
              </span>
              <span className={`font-medium tabular-nums ${finalPaid ? "text-neutral-400 line-through" : "text-rose-700"}`}>
                {formatBRL(remainingCents)}
              </span>
            </div>
          </>
        )}
        {!hasDeposit && depositCents === totalCents && (
          <p className="text-xs text-neutral-500 mt-1">Pagamento integral online ✓</p>
        )}
      </div>

      {appt.notes && (
        <p className="mt-3 text-sm text-neutral-600 italic">"{appt.notes}"</p>
      )}

      {error && (
        <p className="mt-3 text-sm text-rose-700 inline-flex items-start gap-1.5">
          <AlertCircle className="size-4 mt-px shrink-0" />
          {error}
        </p>
      )}

      {/* Ações */}
      {!isCompleted && (
        <div className="mt-3 flex flex-wrap gap-2">
          {hasDeposit && !finalPaid && (
            <>
              <ActionButton
                onClick={() => run(() => markFinalPaid(appt.id, "pix"))}
                pending={pending}
                tone="primary"
              >
                <Check className="size-4" /> Pago via PIX
              </ActionButton>
              <ActionButton
                onClick={() => run(() => markFinalPaid(appt.id, "cash"))}
                pending={pending}
                tone="primary"
              >
                <Check className="size-4" /> Pago em dinheiro
              </ActionButton>
            </>
          )}
          {finalPaid && (
            <ActionButton
              onClick={() => run(() => unmarkFinalPaid(appt.id))}
              pending={pending}
              tone="ghost"
            >
              Desfazer pagamento
            </ActionButton>
          )}
          <ActionButton
            onClick={() => run(() => markCompleted(appt.id))}
            pending={pending}
            tone="secondary"
          >
            <CheckCheck className="size-4" /> Concluir
          </ActionButton>
          <ActionButton
            onClick={() => run(() => markNoShow(appt.id))}
            pending={pending}
            tone="danger"
          >
            <X className="size-4" /> No-show
          </ActionButton>
        </div>
      )}
    </article>
  );
}

function ActionButton({
  children, onClick, pending, tone,
}: {
  children: React.ReactNode;
  onClick: () => void;
  pending: boolean;
  tone: "primary" | "secondary" | "danger" | "ghost";
}) {
  const styles = {
    primary: "bg-rose-600 hover:bg-rose-700 text-white border-transparent",
    secondary: "bg-white hover:bg-neutral-50 text-neutral-700 border-neutral-300",
    danger: "bg-white hover:bg-rose-50 text-rose-700 border-rose-200",
    ghost: "bg-transparent hover:bg-neutral-100 text-neutral-500 border-transparent",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 ${styles}`}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
