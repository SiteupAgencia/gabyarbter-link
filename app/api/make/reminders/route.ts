import { NextResponse } from "next/server";
import { remindAppointmentsForTomorrow } from "@/lib/make/notify";

export const dynamic = "force-dynamic";

/**
 * Lembrete diário: avisa clientes com agendamento confirmado pra amanhã.
 * Chamado pelo Vercel Cron (ver vercel.json).
 *
 * Proteção: se CRON_SECRET estiver setado, exige header
 *   Authorization: Bearer <CRON_SECRET>
 * (o Vercel Cron envia isso automaticamente quando a env var existe).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
  }

  const result = await remindAppointmentsForTomorrow();
  return NextResponse.json({ ok: true, ...result });
}
