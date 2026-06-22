import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatBRL } from "@/lib/utils";
import { formatDateBR, formatTimeBR } from "@/lib/make/slots";

export const dynamic = "force-dynamic";

type SP = { id?: string };

export default async function SucessoPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const id = sp.id;

  if (!id) return <Shell><Bad message="Agendamento não encontrado." /></Shell>;

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return <Shell><Bad message="Sistema em manutenção. Tente em instantes." /></Shell>;
  }

  const { data: appt } = await admin
    .from("make_appointments")
    .select(
      "id, starts_at, ends_at, status, amount_cents, total_cents, payment_method, service:make_services(name)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!appt) {
    return <Shell><Bad message="Agendamento não encontrado." /></Shell>;
  }

  const startsAt = new Date(appt.starts_at);
  const serviceName =
    (Array.isArray((appt as any).service) ? (appt as any).service[0]?.name : (appt as any).service?.name) ??
    "Maquiagem";

  const isConfirmed = appt.status === "confirmed" || appt.status === "completed";

  return (
    <Shell>
      <div className="flex flex-col items-center text-center">
        <div className="size-14 rounded-full bg-sage-100 text-sage-700 inline-flex items-center justify-center mb-5">
          <Check />
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl text-ink leading-tight">
          {isConfirmed ? "Tá confirmado! 🪷" : "Pedido enviado! 🪷"}
        </h1>
        <p className="mt-3 text-ink-soft leading-relaxed">
          {isConfirmed
            ? "A Gaby te espera. Não precisa pagar nada agora — é só vir no dia."
            : "A Gaby vai te confirmar pelo WhatsApp pertinho. Assim que ela confirmar, tá garantido — e você não paga nada agora."}
        </p>
      </div>

      <div className="mt-8 rounded-[1.25rem] bg-paper hairline elev-soft p-6">
        <Row label="Serviço" value={serviceName} />
        <Row label="Dia" value={capitalize(formatDateBR(startsAt))} />
        <Row label="Horário" value={formatTimeBR(startsAt)} />
        <Row label="Onde" value="Estúdio em Erechim/RS" />
        <Row label="Valor" value={formatBRL(appt.total_cents ?? appt.amount_cents)} />
        <Row label="Pagamento" value="No dia · PIX, dinheiro ou cartão" />
      </div>

      <div className="mt-6 flex flex-col gap-2">
        <Link
          href="https://wa.me/message/E6RZKY2Y72LEB1"
          target="_blank"
          rel="noopener"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full px-6 text-base font-medium bg-sage-gradient text-cream elev-soft hover:opacity-95"
        >
          Falar com a Gaby
        </Link>
        <Link
          href="/maquiagem"
          className="inline-flex h-11 items-center justify-center rounded-full px-6 text-sm font-medium text-sage-700 border border-sage-200 hover:bg-sage-50"
        >
          Voltar pro início
        </Link>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh px-5 py-12 sm:py-16">
      <div className="mx-auto max-w-md">{children}</div>
    </main>
  );
}

function Bad({ message }: { message: string }) {
  return (
    <>
      <h1 className="font-serif text-3xl text-ink">Oops</h1>
      <p className="mt-3 text-ink-soft">{message}</p>
      <Link
        href="/maquiagem"
        className="mt-6 inline-flex h-11 items-center rounded-full px-6 text-sm border border-sage-200 text-sage-700"
      >
        Voltar
      </Link>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-2.5 border-b last:border-0 border-sand/60">
      <span className="text-xs uppercase tracking-wider text-ink-soft">{label}</span>
      <span className="text-sm text-ink font-medium text-right">{value}</span>
    </div>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 12.5l5 5L20 6" />
    </svg>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
