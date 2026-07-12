import assert from "node:assert/strict";
import test from "node:test";

import { resolveManualAppointmentWindow } from "./manual-overlap.ts";

const conflict = {
  id: "existing-1",
  clientName: "Ana",
  startsAt: "2026-07-18T16:00:00.000Z",
  endsAt: "2026-07-18T17:30:00.000Z",
};

test("asks for confirmation when another client overlaps the requested window", () => {
  const result = resolveManualAppointmentWindow({
    startsAt: new Date("2026-07-18T15:30:00.000Z"),
    durationMin: 90,
    appointmentConflict: conflict,
    allowOverlap: false,
  });

  assert.deepEqual(result, {
    ok: false,
    kind: "appointment_conflict",
    conflict,
    requestedDurationMin: 90,
    suggestedDurationMin: 30,
  });
});

test("accepts a shorter duration when it ends before the existing client", () => {
  const result = resolveManualAppointmentWindow({
    startsAt: new Date("2026-07-18T15:30:00.000Z"),
    durationMin: 30,
    appointmentConflict: null,
    allowOverlap: false,
  });

  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.endsAt.toISOString(), "2026-07-18T16:00:00.000Z");
});

test("allows the overlap only after explicit confirmation", () => {
  const result = resolveManualAppointmentWindow({
    startsAt: new Date("2026-07-18T15:30:00.000Z"),
    durationMin: 90,
    appointmentConflict: conflict,
    allowOverlap: true,
  });

  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.endsAt.toISOString(), "2026-07-18T17:00:00.000Z");
    assert.equal(result.isOverlap, true);
  }
});

test("rejects durations shorter than 15 minutes", () => {
  const result = resolveManualAppointmentWindow({
    startsAt: new Date("2026-07-18T15:30:00.000Z"),
    durationMin: 10,
    appointmentConflict: null,
    allowOverlap: false,
  });

  assert.deepEqual(result, {
    ok: false,
    kind: "invalid_duration",
    error: "O atendimento precisa ter pelo menos 15 minutos.",
  });
});
