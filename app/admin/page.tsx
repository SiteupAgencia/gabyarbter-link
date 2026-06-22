import { requireTeacher } from "@/lib/admin-guard";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Lotus } from "@/components/lotus";

export const dynamic = "force-dynamic";

function Lipstick({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="8.6" y="12" width="6.8" height="9" rx="1.5" />
      <path d="M9.7 12V6.6l4.6-2.4V12" />
    </svg>
  );
}

export default async function AdminHub() {
  const { firstName } = await requireTeacher();

  return (
    <div className="mx-auto max-w-md px-6 pt-20 pb-16 sm:pt-24 fade-up">
      <header className="text-center mb-11">
        <Lotus className="size-11 mx-auto mb-5" />
        <h1 className="font-serif text-[2.05rem] leading-[1.1] tracking-[-0.02em] text-ink">
          Painel da Gaby
        </h1>
        <p className="text-ink-soft mt-2 text-[0.97rem]">
          Oi, {firstName} — o que você quer cuidar hoje?
        </p>
      </header>

      <div className="space-y-3.5">
        <BusinessCard
          href="/admin/maquiagem"
          icon={<Lipstick className="size-[1.35rem] text-terra" />}
          tile="bg-terra-soft/25"
          title="Maquiagem"
          subtitle="Agenda, clientes e faturamento"
        />
        <BusinessCard
          href="/sopro/admin"
          icon={<Lotus className="size-[1.45rem]" />}
          tile="bg-sage-100"
          title="Yoga · Sopro"
          subtitle="Aulas, alunas e check-ins"
          external
        />
      </div>

      <p className="text-center text-[0.78rem] text-ink-mute mt-10">
        Dois negócios, um cuidado só.
      </p>
    </div>
  );
}

function BusinessCard({
  href,
  icon,
  tile,
  title,
  subtitle,
  external = false,
}: {
  href: string;
  icon: React.ReactNode;
  tile: string;
  title: string;
  subtitle: string;
  external?: boolean;
}) {
  const inner = (
    <>
      <span
        className={`size-[3.25rem] rounded-[1.05rem] ${tile} inline-flex items-center justify-center shrink-0`}
        aria-hidden
      >
        {icon}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-serif text-[1.3rem] text-ink leading-tight">{title}</p>
        <p className="text-[0.86rem] text-ink-soft mt-0.5">{subtitle}</p>
      </div>
      <ChevronRight className="size-5 text-sand-deep shrink-0" strokeWidth={2.25} />
    </>
  );

  const cls =
    "flex items-center gap-4 rounded-[1.4rem] bg-paper hairline elev-soft hover:elev-soft-lg hover:-translate-y-0.5 transition-all duration-200 p-4 pr-5";

  return external ? (
    <a href={href} className={cls}>{inner}</a>
  ) : (
    <Link href={href} className={cls}>{inner}</Link>
  );
}
