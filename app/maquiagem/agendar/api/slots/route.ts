import { NextResponse } from "next/server";
import {
  getMakeBlockedDatesBetween,
  getMakeBusySlots,
  getMakeServiceBySlug,
  getMakeSettings,
  getMakeWeeklySchedule,
} from "@/lib/make/queries";
import { calculateAvailableSlots, combineDateTime } from "@/lib/make/slots";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("service");
  const dateYmd = searchParams.get("date");

  if (!slug || !dateYmd) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  const service = await getMakeServiceBySlug(slug);
  if (!service) return NextResponse.json({ error: "service_not_found" }, { status: 404 });

  const [schedule, blocked, settings] = await Promise.all([
    getMakeWeeklySchedule(),
    getMakeBlockedDatesBetween(dateYmd, dateYmd),
    getMakeSettings(),
  ]);

  const dayStartIso = combineDateTime(dateYmd, "00:00:00").toISOString();
  const dayEndIso = combineDateTime(dateYmd, "23:59:59").toISOString();
  const busy = await getMakeBusySlots(dayStartIso, dayEndIso);

  const slots = calculateAvailableSlots({
    dateYmd,
    service,
    weeklySchedule: schedule,
    blockedDates: blocked,
    busySlots: busy,
    settings,
    now: new Date(),
  });

  return NextResponse.json({
    slots: slots.map((s) => ({
      startsIso: s.starts_at.toISOString(),
      endsIso: s.ends_at.toISOString(),
    })),
  });
}
