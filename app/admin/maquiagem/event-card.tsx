"use client";

import { useState, useTransition } from "react";
import { AlertCircle, Loader2, Trash2 } from "lucide-react";
import { CALENDAR_KIND_META } from "@/lib/make/calendar";
import type { MakeCalendarKind } from "@/lib/make/types";
import { cn } from "@/lib/utils";
import { deleteBlock, deleteRecurringBlock } from "./actions";

type ManualKind = Exclude<MakeCalendarKind, "make">;

export function EventCard({
  id,
  kind,
  title,
  subtitle,
  recurring = false,
  readonly = false,
}: {
  id: string;
  kind: ManualKind;
  title: string;
  subtitle: string;
  recurring?: boolean;
  readonly?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const meta = CALENDAR_KIND_META[kind];
  const Icon = meta.icon;

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
    <article className={cn("rounded-[1.25rem] p-4 transition", meta.cardClass)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <Icon className="size-4 text-ink-soft mt-1 shrink-0" />
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.16em] text-ink-mute font-semibold">
              {recurring ? `${meta.label} fixo` : meta.label}
            </p>
            <p className="font-medium text-ink truncate">{title}</p>
            <p className="text-sm text-ink-soft mt-0.5">{subtitle}</p>
          </div>
        </div>
        {!readonly && (
          <button
            type="button"
            onClick={remove}
            disabled={pending}
            aria-label="Remover evento"
            className="shrink-0 text-ink-mute hover:text-terra transition disabled:opacity-50 p-1"
          >
            {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
          </button>
        )}
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
