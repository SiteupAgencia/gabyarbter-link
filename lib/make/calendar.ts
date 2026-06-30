import {
  CalendarDays,
  Lock,
  PartyPopper,
  Sparkles,
  StretchHorizontal,
  type LucideIcon,
} from "lucide-react";
import type { MakeCalendarKind } from "./types";

export const CALENDAR_KIND_META: Record<
  MakeCalendarKind,
  {
    label: string;
    shortLabel: string;
    dotClass: string;
    cardClass: string;
    icon: LucideIcon;
  }
> = {
  make: {
    label: "Make",
    shortLabel: "Make",
    dotClass: "bg-sage-500",
    cardClass: "bg-paper hairline elev-soft",
    icon: Sparkles,
  },
  yoga: {
    label: "Yoga",
    shortLabel: "Yoga",
    dotClass: "bg-sky-500",
    cardClass: "bg-sky-50 border border-sky-100",
    icon: StretchHorizontal,
  },
  commitment: {
    label: "Compromisso",
    shortLabel: "Comp.",
    dotClass: "bg-violet-500",
    cardClass: "bg-violet-50 border border-violet-100",
    icon: CalendarDays,
  },
  party: {
    label: "Festa",
    shortLabel: "Festa",
    dotClass: "bg-terra",
    cardClass: "bg-terra-soft/[0.12] border border-terra-soft/45",
    icon: PartyPopper,
  },
  block: {
    label: "Bloqueio",
    shortLabel: "Bloq.",
    dotClass: "bg-ink-mute",
    cardClass: "bg-cream-soft/70 border border-dashed border-sand-deep/60",
    icon: Lock,
  },
};

const TZ = "America/Sao_Paulo";

export function timeBR(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function timeRangeBR(startsAt: string, endsAt: string): string {
  return `${timeBR(startsAt)} até ${timeBR(endsAt)}`;
}

export function addMinutesIso(startsAt: string, minutes: number): string {
  return new Date(new Date(startsAt).getTime() + minutes * 60_000).toISOString();
}
