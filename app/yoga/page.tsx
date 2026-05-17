import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, Users, Clock, Flower2 } from "lucide-react";
import { Lotus } from "@/components/lotus";
import { cn } from "@/lib/utils";

// Página dedicada à aula de yoga.
// CTA leva pro cadastro no Sopro. Por enquanto cai no WhatsApp;
// trocar URL_CADASTRO_SOPRO quando o app subir.
const URL_CADASTRO_SOPRO = "https://wa.me/message/E6RZKY2Y72LEB1"; // TODO: pra Sopro
const URL_WHATSAPP = "https://wa.me/message/E6RZKY2Y72LEB1";

const PACOTES = [
  { aulas: 1,  total: 60,  destaque: false },
  { aulas: 5,  total: 275, destaque: true,  selo: "Mais escolhido" },
  { aulas: 10, total: 500, destaque: false, selo: "Maior economia" },
];

export default function YogaPage() {
  return (
    <main className="min-h-dvh safe-top safe-bottom">
      <Hero />
      <ComoEAula />
      <Pacotes />
      <ComoAgendar />
      <CtaFinal />
      <FooterMini />
    </main>
  );
}

/* ============ HERO ============ */
function Hero() {
  return (
    <section className="relative h-[68vh] min-h-[480px] w-full overflow-hidden">
      <Image
        src="/photos/turma-yoga.jpg"
        alt="Turma de yoga da Gaby em Erechim"
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,20,18,0.25) 0%, rgba(20,20,18,0.55) 60%, rgba(20,20,18,0.85) 100%)",
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-end text-center text-paper px-6 pb-12 fade-up">
        <Lotus className="size-12 text-paper opacity-80 mb-3 breathe-soft" />
        <h1 className="font-serif text-5xl sm:text-6xl leading-none tracking-tight">
          Yoga com a Gaby
        </h1>
        <p className="mt-4 text-[15px] sm:text-base opacity-90 max-w-sm">
          Presencial em Erechim. Pequenos grupos. Prática profunda — pra quem busca cuidado, não performance.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2 text-[11px] uppercase tracking-[0.18em] opacity-80">
          <span className="border border-paper/40 rounded-full px-2.5 py-1">Hatha</span>
          <span className="border border-paper/40 rounded-full px-2.5 py-1">Vinyasa</span>
          <span className="border border-paper/40 rounded-full px-2.5 py-1">60 min</span>
        </div>
      </div>
    </section>
  );
}

/* ============ COMO É A AULA ============ */
function ComoEAula() {
  return (
    <section className="px-6 py-16 max-w-md mx-auto">
      <h2 className="font-serif text-3xl text-ink leading-tight">
        Como é uma aula
      </h2>
      <p className="mt-4 text-[15px] text-ink-soft leading-relaxed">
        Cada encontro começa com respiração e termina em silêncio. No meio, prática —
        Hatha ou Vinyasa, dependendo do dia. Sempre adaptada pra quem chegou, pro corpo
        do dia, pro momento.
      </p>

      <ul className="mt-7 space-y-4">
        <Feature
          icon={<Users className="size-4" />}
          title="Pequenos grupos"
          desc="Até 12 alunas por aula. Atenção real, ajuste real."
        />
        <Feature
          icon={<Flower2 className="size-4" />}
          title="Pra teu corpo"
          desc="Sem cobrança de pose perfeita. Adapta o que precisar."
        />
        <Feature
          icon={<Clock className="size-4" />}
          title="60 minutos"
          desc="Aulas seg/qua/sex de manhã e à noite. Em Erechim."
        />
      </ul>

      <blockquote className="mt-9 pl-4 border-l-2 border-sage-200">
        <p className="font-serif italic text-ink text-lg leading-snug">
          “Aqui yoga não é performance. É presença.”
        </p>
        <footer className="mt-2 text-xs text-ink-mute uppercase tracking-widest">
          — Gaby
        </footer>
      </blockquote>
    </section>
  );
}

function Feature({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <li className="flex gap-3">
      <div className="shrink-0 size-9 rounded-full bg-sage-100 text-sage-700 flex items-center justify-center mt-0.5">
        {icon}
      </div>
      <div>
        <p className="font-medium text-ink text-[15px]">{title}</p>
        <p className="text-[13px] text-ink-soft mt-0.5">{desc}</p>
      </div>
    </li>
  );
}

/* ============ PACOTES ============ */
function Pacotes() {
  return (
    <section className="px-6 py-16 bg-cream-soft border-y border-sand-deep/40">
      <div className="max-w-md mx-auto">
        <h2 className="font-serif text-3xl text-ink leading-tight">
          Pacotes
        </h2>
        <p className="mt-3 text-[15px] text-ink-soft leading-relaxed">
          Compra avulsa ou em pacote — quanto mais aulas, menos pagas por aula.
          Pagamento por PIX ou cartão.
        </p>

        <div className="mt-7 space-y-3">
          {PACOTES.map((p) => (
            <PacoteCard key={p.aulas} {...p} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PacoteCard({
  aulas, total, destaque, selo,
}: {
  aulas: number;
  total: number;
  destaque?: boolean;
  selo?: string;
}) {
  const porAula = Math.floor(total / aulas);
  return (
    <div
      className={cn(
        "relative rounded-2xl p-5 border transition-all",
        destaque
          ? "bg-sage-700 text-paper border-sage-700"
          : "bg-paper text-ink border-sand-deep/50"
      )}
    >
      {selo && (
        <span
          className={cn(
            "absolute -top-2.5 right-4 text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full font-medium",
            destaque ? "bg-terra text-paper" : "bg-sand text-ink"
          )}
        >
          {selo}
        </span>
      )}
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="font-serif text-2xl leading-none">
            {aulas} {aulas === 1 ? "aula" : "aulas"}
          </p>
          <p className={cn("text-xs mt-1", destaque ? "text-paper/75" : "text-ink-soft")}>
            R$ {porAula} por aula
          </p>
        </div>
        <div className="text-right">
          <p className="font-serif text-3xl leading-none">R$ {total}</p>
          {aulas > 1 && (
            <p className={cn("text-[10px] uppercase tracking-widest mt-1", destaque ? "text-paper/70" : "text-ink-mute")}>
              {aulas === 5 ? "economiza 8%" : "economiza 17%"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============ COMO AGENDAR ============ */
function ComoAgendar() {
  return (
    <section className="px-6 py-16 max-w-md mx-auto">
      <h2 className="font-serif text-3xl text-ink leading-tight">
        Como agendar
      </h2>
      <p className="mt-3 text-[15px] text-ink-soft leading-relaxed">
        Tudo pelo app <span className="font-medium text-ink">Sopro</span> —
        de graça, instalado em 1 minuto.
      </p>

      <ol className="mt-7 space-y-5">
        <Step
          n={1}
          title="Faz cadastro grátis"
          desc="Só nome e WhatsApp. Recebe um código por WhatsApp pra confirmar — sem senha, sem email."
        />
        <Step
          n={2}
          title="Escolhe seu pacote"
          desc="Pode começar com 1 aula avulsa pra experimentar. Pagamento por PIX ou cartão direto no app."
        />
        <Step
          n={3}
          title="Reserva no horário que quiser"
          desc="Vê a agenda da semana, escolhe o dia, faz check-in com 1 toque. Cancela até 2h antes que devolvemos o crédito."
        />
      </ol>
    </section>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <li className="flex gap-4">
      <div className="shrink-0 size-9 rounded-full border border-sage-200 text-sage-700 flex items-center justify-center font-serif text-lg">
        {n}
      </div>
      <div className="pt-1">
        <p className="font-medium text-ink text-[15px] leading-tight">{title}</p>
        <p className="text-[13px] text-ink-soft mt-1 leading-relaxed">{desc}</p>
      </div>
    </li>
  );
}

/* ============ CTA FINAL ============ */
function CtaFinal() {
  return (
    <section className="px-6 py-14 bg-sage-700 text-paper text-center">
      <div className="max-w-md mx-auto">
        <Lotus className="size-10 mx-auto text-paper/80 mb-4" />
        <h2 className="font-serif text-3xl sm:text-4xl leading-tight">
          Vem fazer sua primeira aula
        </h2>
        <p className="mt-3 text-[15px] text-paper/85 leading-relaxed max-w-xs mx-auto">
          O cadastro é grátis e dura 1 minuto. Depois é só escolher um pacote
          e reservar.
        </p>

        <Link
          href={URL_CADASTRO_SOPRO}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-7 inline-flex items-center justify-center gap-2 h-13 px-7 py-3.5 rounded-full bg-terra text-paper font-medium text-[15px] hover:bg-[#a3614a] transition-colors active:scale-[0.98]"
        >
          Quero fazer cadastro
          <ArrowRight className="size-4" />
        </Link>

        <p className="mt-5 text-[12px] text-paper/60">
          Dúvida antes?{" "}
          <Link
            href={URL_WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-paper"
          >
            Manda mensagem
          </Link>
        </p>
      </div>
    </section>
  );
}

/* ============ FOOTER MINI ============ */
function FooterMini() {
  return (
    <footer className="px-6 py-8 text-center bg-cream">
      <Link
        href="/bio-insta"
        className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Outras coisas que faço
      </Link>
      <p className="mt-3 text-[11px] text-ink-mute">Gaby Arbter · Erechim · RS</p>
    </footer>
  );
}
