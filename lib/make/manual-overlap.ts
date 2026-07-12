export const MIN_MANUAL_DURATION_MIN = 15;

export type AppointmentConflict = {
  id: string;
  clientName: string;
  startsAt: string;
  endsAt: string;
};

type WindowResult =
  | { ok: true; endsAt: Date; isOverlap: boolean }
  | {
      ok: false;
      kind: "appointment_conflict";
      conflict: AppointmentConflict;
      requestedDurationMin: number;
      suggestedDurationMin: number | null;
    }
  | { ok: false; kind: "invalid_duration"; error: string };

export function resolveManualAppointmentWindow(input: {
  startsAt: Date;
  durationMin: number;
  appointmentConflict: AppointmentConflict | null;
  allowOverlap: boolean;
}): WindowResult {
  if (!Number.isInteger(input.durationMin) || input.durationMin < MIN_MANUAL_DURATION_MIN) {
    return {
      ok: false,
      kind: "invalid_duration",
      error: `O atendimento precisa ter pelo menos ${MIN_MANUAL_DURATION_MIN} minutos.`,
    };
  }

  const endsAt = new Date(input.startsAt.getTime() + input.durationMin * 60_000);
  if (input.appointmentConflict && !input.allowOverlap) {
    const availableMinutes = Math.floor(
      (new Date(input.appointmentConflict.startsAt).getTime() - input.startsAt.getTime()) / 60_000,
    );
    return {
      ok: false,
      kind: "appointment_conflict",
      conflict: input.appointmentConflict,
      requestedDurationMin: input.durationMin,
      suggestedDurationMin:
        availableMinutes >= MIN_MANUAL_DURATION_MIN ? availableMinutes : null,
    };
  }

  return { ok: true, endsAt, isOverlap: Boolean(input.appointmentConflict) };
}
