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
  const fromYmd = searchParams.get("from");
  const toYmd = searchParams.get("to");

  if (!slug || !fromYmd || !toYmd) {
    return NextResponse.json({ error: "missing params" }, { status: 400 });
  }

  const service = await getMakeServiceBySlug(slug);
  if (!service) return NextResponse.json({ error: "service_not_found" }, { status: 404 });

  const [schedule, blocked, settings] = await Promise.all([
    getMakeWeeklySchedule(),
    getMakeBlockedDatesBetween(fromYmd, toYmd),
    getMakeSettings(),
  ]);

  // Janela de busy: do início de `from` ao fim de `to`
  const fromIso = combineDateTime(fromYmd, "00:00:00").toISOString();
  const toIsoEnd = combineDateTime(toYmd, "23:59:59").toISOString();
  const busy = await getMakeBusySlots(fromIso, toIsoEnd);

  const days: Record<string, "open" | "closed"> = {};
  const now = new Date();

  for (const ymd of iterateDays(fromYmd, toYmd)) {
    const slots = calculateAvailableSlots({
      dateYmd: ymd,
      service,
      weeklySchedule: schedule,
      blockedDates: blocked,
      busySlots: busy,
      settings,
      now,
    });
    days[ymd] = slots.length > 0 ? "open" : "closed";
  }

  return NextResponse.json({ days });
}

function* iterateDays(fromYmd: string, toYmd: string): Generator<string> {
  const [fy, fm, fd] = fromYmd.split("-").map(Number);
  const [ty, tm, td] = toYmd.split("-").map(Number);
  const start = new Date(fy, fm - 1, fd);
  const end = new Date(ty, tm - 1, td);
  for (let cur = new Date(start); cur <= end; cur.setDate(cur.getDate() + 1)) {
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, "0");
    const d = String(cur.getDate()).padStart(2, "0");
    yield `${y}-${m}-${d}`;
  }
}
