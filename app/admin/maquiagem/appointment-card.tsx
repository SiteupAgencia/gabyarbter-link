"use client";

import { useState, useTransition } from "react";
import {
  markFinalPaid,
  unmarkFinalPaid,
  markCompleted,
  markNoShow,
  confirmBooking,
  declineBooking,
} from "./actions";
import { Check, Phone, Loader2, AlertCircle, CheckCheck, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

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

export function AppointmentCard({
  appt,
  serviceName,
  visitNumber,
}: {
  appt: AppointmentRow;
  serviceName: string;
  visitNumber?: number;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const totalCents = appt.total_cents ?? appt.amount_cents;
  const depositCents = appt.deposit_cents ?? appt.amount_cents;
  const remainingCents = Math.max(0, totalCents - depositCents);
  const finalPaid = appt.final_paid_at !== null;
  const hasDeposit = depositCents > 0 && remainingCents > 0;
  const dueOnDay = !finalPaid && remainingCents > 0;
  const isCompleted = appt.status === "completed";
  const isRequest = appt.status === "pending_payment"; // pedido aguardando a Gaby confirmar

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
    <article
      className={cn(
        "rounded-[1.25rem] p-4 transition",
        isRequest ? "bg-terra-soft/[0.10] border border-terra-soft/45 elev-soft" : "bg-paper hairline elev-soft",
      )}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-serif text-xl tabular-nums text-ink">{timeBR(appt.starts_at)}</span>
            {isRequest && (
              <span className="inline-flex items-center gap-1 text-xs text-terra bg-terra-soft/25 rounded-full px-2.5 py-0.5">
                <AlertCircle className="size-3" /> Pedido · confirme
              </span>
            )}
            {isCompleted && (
              <span className="inline-flex items-center gap-1 text-xs text-sage-700 bg-sage-50 rounded-full px-2.5 py-0.5">
                <CheckCheck className="size-3" /> Concluído
              </span>
            )}
            {visitNumber != null && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-xs rounded-full px-2.5 py-0.5",
                  visitNumber <= 1
                    ? "text-sage-700 bg-sage-50"
                    : "text-ink-soft bg-sand/40",
                )}
              >
                {visitNumber <= 1 ? (
                  <><Sparkles className="size-3" /> cliente nova</>
                ) : (
                  `${visitNumber}ª vez`
                )}
              </span>
            )}
          </div>
          <p className="font-medium text-ink mt-1 truncate">{appt.client_name}</p>
          <p className="text-sm text-ink-soft mt-0.5">{serviceName}</p>
        </div>
        <a
          href={`https://wa.me/${phoneDigits}`}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1 text-sm text-sage-700 hover:text-sage-900 transition shrink-0"
        >
          <Phone className="size-4" />
          WhatsApp
        </a>
      </header>

      {/* Valores */}
      <div className="mt-3 rounded-[0.9rem] bg-cream-soft hairline p-3 text-sm">
        <div className="flex items-baseline justify-between">
          <span className="text-ink-soft">Total</span>
          <span className="font-medium tabular-nums text-ink">{formatBRL(totalCents)}</span>
        </div>
        {hasDeposit && (
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-ink-soft">Entrada (online) ✓</span>
            <span className="tabular-nums text-ink-soft">{formatBRL(depositCents)}</span>
          </div>
        )}
        {remainingCents > 0 && (
          <div className="flex items-baseline justify-between mt-1 pt-2 hairline-t">
            <span className={finalPaid ? "text-sage-700" : "text-terra"}>
              {finalPaid
                ? `${hasDeposit ? "Restante" : "Pago"} via ${methodLabel(appt.final_payment_method)} ✓`
                : hasDeposit
                  ? "Falta receber no dia"
                  : "A receber no dia"}
            </span>
            <span className={cn("font-medium tabular-nums", finalPaid ? "text-ink-mute line-through" : "text-terra")}>
              {formatBRL(remainingCents)}
            </span>
          </div>
        )}
        {remainingCents === 0 && totalCents > 0 && (
          <p className="text-xs text-ink-soft mt-1">Pago integralmente ✓</p>
        )}
      </div>

      {appt.notes && (
        <p className="mt-3 text-sm text-ink-soft italic">&ldquo;{appt.notes}&rdquo;</p>
      )}

      {error && (
        <p className="mt-3 text-sm text-terra inline-flex items-start gap-1.5">
          <AlertCircle className="size-4 mt-px shrink-0" />
          {error}
        </p>
      )}

      {/* Ações */}
      {isRequest ? (
        <div className="mt-3 flex flex-wrap gap-2">
          <ActionButton onClick={() => run(() => confirmBooking(appt.id))} pending={pending} tone="primary">
            <Check className="size-4" /> Confirmar
          </ActionButton>
          <ActionButton onClick={() => run(() => declineBooking(appt.id))} pending={pending} tone="danger">
            <X className="size-4" /> Recusar
          </ActionButton>
        </div>
      ) : !isCompleted ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {dueOnDay && (
            <>
              <ActionButton onClick={() => run(() => markFinalPaid(appt.id, "pix"))} pending={pending} tone="primary">
                <Check className="size-4" /> Pago via PIX
              </ActionButton>
              <ActionButton onClick={() => run(() => markFinalPaid(appt.id, "cash"))} pending={pending} tone="primary">
                <Check className="size-4" /> Pago em dinheiro
              </ActionButton>
            </>
          )}
          {finalPaid && (
            <ActionButton onClick={() => run(() => unmarkFinalPaid(appt.id))} pending={pending} tone="ghost">
              Desfazer pagamento
            </ActionButton>
          )}
          <ActionButton onClick={() => run(() => markCompleted(appt.id))} pending={pending} tone="secondary">
            <CheckCheck className="size-4" /> Concluir
          </ActionButton>
          <ActionButton onClick={() => run(() => markNoShow(appt.id))} pending={pending} tone="danger">
            <X className="size-4" /> No-show
          </ActionButton>
        </div>
      ) : null}
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
    primary: "bg-sage-gradient text-cream border-transparent hover:opacity-95",
    secondary: "bg-white hover:bg-cream-soft text-ink border-sand",
    danger: "bg-white hover:bg-terra-soft/10 text-terra border-terra-soft/50",
    ghost: "bg-transparent hover:bg-sand/40 text-ink-soft border-transparent",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-2 rounded-full border text-sm font-medium transition disabled:opacity-50",
        styles,
      )}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
