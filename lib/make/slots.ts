import type {
  MakeBlockedDate,
  MakeBusySlot,
  MakeRecurringBlock,
  MakeService,
  MakeSettings,
  MakeSlot,
  MakeWeeklySchedule,
} from "./types";

// Brasil não tem mais horário de verão; offset fixo -03:00 pra Erechim/RS.
const BRASIL_OFFSET = "-03:00";

export function combineDateTime(dateYmd: string, timeHms: string): Date {
  const t = timeHms.length === 5 ? `${timeHms}:00` : timeHms;
  return new Date(`${dateYmd}T${t}${BRASIL_OFFSET}`);
}

export function weekdayInBR(dateYmd: string): number {
  // Trata YYYY-MM-DD como meia-noite local BR e devolve o dia da semana 0-6.
  const d = combineDateTime(dateYmd, "00:00:00");
  // getUTCDay funciona porque a Date está em UTC equivalente à meia-noite BR.
  return new Date(d.getTime() + 3 * 3600 * 1000).getUTCDay();
}

export function formatYmdBR(d: Date): string {
  const f = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return f.format(d); // 'YYYY-MM-DD'
}

export type CalculateSlotsInput = {
  dateYmd: string; // 'YYYY-MM-DD' (local BR)
  service: Pick<MakeService, "duration_min">;
  weeklySchedule: MakeWeeklySchedule[];
  blockedDates: MakeBlockedDate[];
  recurringBlocks?: MakeRecurringBlock[];
  busySlots: MakeBusySlot[];
  settings: Pick<MakeSettings, "buffer_minutes" | "slot_step_minutes" | "min_advance_hours">;
  now: Date;
};

export function calculateAvailableSlots({
  dateYmd,
  service,
  weeklySchedule,
  blockedDates,
  recurringBlocks = [],
  busySlots,
  settings,
  now,
}: CalculateSlotsInput): MakeSlot[] {
  const weekday = weekdayInBR(dateYmd);
  const ranges = weeklySchedule.filter((s) => s.weekday === weekday && s.active);
  if (ranges.length === 0) return [];

  const dayBlocks = blockedDates.filter((b) => b.date === dateYmd);
  if (dayBlocks.some((b) => b.all_day)) return [];

  // Bloqueios pontuais (data) + recorrentes (dia da semana) viram faixas
  // que removem os slots sobrepostos.
  const partialBlocks = [
    ...dayBlocks
      .filter((b) => !b.all_day && b.start_time && b.end_time)
      .map((b) => ({
        start: combineDateTime(dateYmd, b.start_time!),
        end: combineDateTime(dateYmd, b.end_time!),
      })),
    ...recurringBlocks
      .filter((b) => b.weekday === weekday && b.active)
      .map((b) => ({
        start: combineDateTime(dateYmd, b.start_time),
        end: combineDateTime(dateYmd, b.end_time),
      })),
  ];

  const busy = busySlots.map((b) => ({
    start: new Date(b.starts_at),
    end: new Date(b.ends_at),
  }));

  const stepMs = settings.slot_step_minutes * 60_000;
  const durationMs = service.duration_min * 60_000;
  const bufferMs = settings.buffer_minutes * 60_000;
  const minAdvanceMs = settings.min_advance_hours * 3600_000;
  const earliestStart = new Date(now.getTime() + minAdvanceMs);

  const slots: MakeSlot[] = [];

  for (const range of ranges) {
    const rangeStart = combineDateTime(dateYmd, range.start_time);
    const rangeEnd = combineDateTime(dateYmd, range.end_time);

    let cursor = rangeStart;
    while (cursor.getTime() + durationMs <= rangeEnd.getTime()) {
      const slotStart = cursor;
      const slotEnd = new Date(cursor.getTime() + durationMs);

      // antecedência mínima
      if (slotStart < earliestStart) {
        cursor = new Date(cursor.getTime() + stepMs);
        continue;
      }

      // bloqueios parciais
      const blocked = partialBlocks.some(
        (b) => slotStart < b.end && slotEnd > b.start,
      );
      if (blocked) {
        cursor = new Date(cursor.getTime() + stepMs);
        continue;
      }

      // overlap com agendamentos existentes (considera buffer dos dois lados)
      const overlap = busy.some((b) => {
        const slotStartWithBuffer = new Date(slotStart.getTime() - bufferMs);
        const slotEndWithBuffer = new Date(slotEnd.getTime() + bufferMs);
        return b.start < slotEndWithBuffer && b.end > slotStartWithBuffer;
      });
      if (overlap) {
        cursor = new Date(cursor.getTime() + stepMs);
        continue;
      }

      slots.push({ starts_at: slotStart, ends_at: slotEnd });
      cursor = new Date(cursor.getTime() + stepMs);
    }
  }

  return slots;
}

export function buildSettings(rows: { key: string; value: string }[]): MakeSettings {
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    buffer_minutes: Number(map.get("buffer_minutes") ?? 15),
    min_advance_hours: Number(map.get("min_advance_hours") ?? 12),
    max_advance_days: Number(map.get("max_advance_days") ?? 1825),
    cancel_refund_hours: Number(map.get("cancel_refund_hours") ?? 24),
    slot_step_minutes: Number(map.get("slot_step_minutes") ?? 15),
    timezone: map.get("timezone") ?? "America/Sao_Paulo",
    deposit_percent: Number(map.get("deposit_percent") ?? 30),
  };
}

export function formatTimeBR(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatDateBR(d: Date | string): string {
  const date = typeof d === "string" ? combineDateTime(d, "12:00:00") : d;
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    weekday: "long",
    day: "2-digit",
    month: "long",
  }).format(date);
}
