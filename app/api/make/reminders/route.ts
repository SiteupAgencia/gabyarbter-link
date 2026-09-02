import { NextResponse } from "next/server";
import { remindAppointmentsForTomorrow } from "@/lib/make/notify";

export const dynamic = "force-dynamic";

/**
 * Lembrete diário: avisa clientes com agendamento confirmado pra amanhã.
 * Chamado pelo Vercel Cron (ver vercel.json).
 *
 * Proteção: exige header Authorization: Bearer <CRON_SECRET>.
 * Sem a env var a rota responde 503 e não envia nada (fail closed).
 * O Vercel Cron envia o header automaticamente quando a env var existe.
 */
export async function GET(req: Request) {
  // Falha fechada: sem CRON_SECRET ninguém dispara lembrete (nem o próprio Vercel).
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.error("reminders: CRON_SECRET ausente; execução recusada");
    return NextResponse.json({ ok: false, error: "cron_secret_missing" }, { status: 503 });
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const result = await remindAppointmentsForTomorrow();
  return NextResponse.json({ ok: true, ...result });
}
