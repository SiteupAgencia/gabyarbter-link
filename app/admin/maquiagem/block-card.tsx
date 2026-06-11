"use client";

import { useState, useTransition } from "react";
import { Lock, Repeat, Trash2, Loader2, AlertCircle } from "lucide-react";
import { deleteBlock, deleteRecurringBlock } from "./actions";

export function BlockCard({
  id,
  title,
  subtitle,
  recurring = false,
}: {
  id: string;
  title: string;
  subtitle: string;
  recurring?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function remove() {
    setError(null);
    startTransition(async () => {
      try {
        await (recurring ? deleteRecurringBlock(id) : deleteBlock(id));
      } catch {
        setError("Não consegui remover.");
      }
    });
  }

  return (
    <article className="rounded-2xl bg-sand/30 border border-dashed border-sand-deep p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          {recurring ? (
            <Repeat className="size-4 text-ink-mute mt-1 shrink-0" />
          ) : (
            <Lock className="size-4 text-ink-mute mt-1 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink-mute font-semibold">
              {recurring ? "Bloqueio fixo" : "Bloqueio"}
            </p>
            <p className="font-medium text-ink truncate">{title}</p>
            <p className="text-sm text-ink-soft mt-0.5">{subtitle}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={remove}
          disabled={pending}
          aria-label="Remover bloqueio"
          className="shrink-0 text-ink-mute hover:text-terra transition disabled:opacity-50 p-1"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-xs text-terra inline-flex items-center gap-1.5">
          <AlertCircle className="size-3.5" />
          {error}
        </p>
      )}
    </article>
  );
}
