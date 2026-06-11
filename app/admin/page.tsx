import { requireTeacher } from "@/lib/admin-guard";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Lotus } from "@/components/lotus";

export const dynamic = "force-dynamic";

export default async function AdminHub() {
  const { firstName } = await requireTeacher();

  return (
    <div className="mx-auto max-w-md px-5 py-12 sm:py-16 space-y-9 fade-up">
      <header className="text-center">
        <Lotus className="size-10 mx-auto mb-3" />
        <h1 className="font-serif text-3xl text-ink tracking-tight">Painel da Gaby</h1>
        <p className="text-ink-soft mt-1.5">
          Oi, {firstName} 🌸 — o que você quer cuidar agora?
        </p>
      </header>

      <div className="space-y-4">
        <BusinessCard
          href="/admin/maquiagem"
          emoji="💄"
          title="Maquiagem"
          subtitle="Agenda, clientes e bloqueios"
          tone="terra"
        />
        <BusinessCard
          href="/sopro/admin"
          emoji="🧘"
          title="Yoga · Sopro"
          subtitle="Aulas, alunas e check-ins"
          tone="sage"
          external
        />
      </div>

      <p className="text-center text-xs text-ink-mute">
        Dois negócios, um painel. É só escolher de qual você quer cuidar.
      </p>
    </div>
  );
}

function BusinessCard({
  href,
  emoji,
  title,
  subtitle,
  tone,
  external = false,
}: {
  href: string;
  emoji: string;
  title: string;
  subtitle: string;
  tone: "terra" | "sage";
  external?: boolean;
}) {
  const styles = {
    terra: { circle: "bg-terra-soft/30", border: "hover:border-terra-soft", bar: "bg-terra" },
    sage: { circle: "bg-sage-100", border: "hover:border-sage-300", bar: "bg-sage-500" },
  }[tone];

  const inner = (
    <>
      <span aria-hidden className={`absolute left-0 inset-y-0 w-1.5 rounded-l-2xl ${styles.bar}`} />
      <span
        className={`size-14 rounded-2xl ${styles.circle} inline-flex items-center justify-center text-2xl shrink-0`}
        aria-hidden
      >
        {emoji}
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-serif text-xl text-ink leading-tight">{title}</p>
        <p className="text-sm text-ink-soft mt-0.5">{subtitle}</p>
      </div>
      <ChevronRight className="size-5 text-ink-mute shrink-0" />
    </>
  );

  const cls = `relative flex items-center gap-4 rounded-2xl bg-white border border-sand ${styles.border} elev-1 hover:elev-2 transition-all p-5 pl-6`;

  return external ? (
    <a href={href} className={cls}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  );
}
