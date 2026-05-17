import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Users,
  Clock,
  Flower2,
  Quote,
} from "lucide-react";
import { Lotus } from "@/components/lotus";
import { cn } from "@/lib/utils";

// CTA leva pro cadastro do Sopro. Por enquanto cai no WhatsApp;
// trocar URL_CADASTRO_SOPRO quando o app subir.
const URL_CADASTRO_SOPRO = "https://wa.me/message/E6RZKY2Y72LEB1"; // TODO: pra Sopro
const URL_WHATSAPP = "https://wa.me/message/E6RZKY2Y72LEB1";

// Pacotes — confirmar com a Gaby se quer manter esse esquema de desconto
// (1 aula avulsa, e descontos progressivos em 5 e 10).
const PACOTES = [
  { aulas: 1,  total: 35,  destaque: false },
  { aulas: 5,  total: 160, destaque: true,  selo: "Mais escolhido" },
  { aulas: 10, total: 300, destaque: false, selo: "Maior economia" },
];

// Relatos — placeholder com nomes fictícios pra Gaby substituir
// por depoimentos reais quando tiver autorização das alunas.
const RELATOS = [
  {
    texto:
      "Procurei muito uma yoga que não fosse aulinha apressada. Achei. Saio das aulas leve, sem pressa de voltar pro celular.",
    nome: "Carolina",
    tempo: "8 meses de prática",
    iniciais: "CM",
  },
  {
    texto:
      "Comecei sem nunca ter feito yoga. A Gaby adapta cada postura, sem cobrança. Hoje pratico em casa também.",
    nome: "Renata",
    tempo: "1 ano de prática",
    iniciais: "RS",
  },
  {
    texto:
      "Faço maquiagem com a Gaby e descobri o yoga aqui. Virou parte da minha rotina semanal — não imagino mais sem.",
    nome: "Bianca",
    tempo: "4 meses de prática",
    iniciais: "BO",
  },
];

export default function YogaPage() {
  return (
    <main className="min-h-dvh safe-top safe-bottom">
      <Hero />
      <Separador />
      <ComoEAula />
      <Separador />
      <Relatos />
      <Pacotes />
      <Separador />
      <ComoAgendar />
      <CtaFinal />
      <FooterMini />
    </main>
  );
}

/* ============ HERO ============ */
function Hero() {
  return (
    <section className="relative h-[78vh] min-h-[560px] w-full overflow-hidden">
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
            "linear-gradient(180deg, rgba(20,20,18,0.20) 0%, rgba(20,20,18,0.50) 55%, rgba(20,20,18,0.90) 100%)",
        }}
      />
      <div className="absolute inset-0 flex flex-col items-center justify-end text-center text-paper px-6 pb-14 fade-up">
        <Lotus className="size-12 text-paper opacity-85 mb-4 breathe-soft" />
        <p className="text-[11px] uppercase tracking-[0.3em] opacity-75 mb-2">
          Erechim · RS
        </p>
        <h1 className="font-serif text-5xl sm:text-6xl leading-none tracking-tight">
          Yoga com a Gaby
        </h1>
        <p className="mt-5 text-[15px] sm:text-base opacity-90 max-w-sm font-serif italic">
          Presencial, em pequenos grupos.<br />
          Pra quem busca cuidado, não performance.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-1.5 text-[10.5px] uppercase tracking-[0.2em] opacity-85">
          <Chip>Hatha</Chip>
          <Chip>Vinyasa</Chip>
          <Chip>Ashtanga</Chip>
          <Chip>60 min</Chip>
        </div>
      </div>
    </section>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="border border-paper/40 rounded-full px-2.5 py-1">
      {children}
    </span>
  );
}

/* ============ SEPARADOR ORNAMENTAL ============ */
function Separador() {
  return (
    <div aria-hidden className="flex items-center justify-center gap-3 py-2 bg-cream">
      <span className="h-px w-12 bg-sand-deep/60" />
      <Lotus className="size-4 text-sage-500 opacity-60" />
      <span className="h-px w-12 bg-sand-deep/60" />
    </div>
  );
}

/* ============ COMO É A AULA ============ */
function ComoEAula() {
  return (
    <section className="px-6 py-16 max-w-md mx-auto">
      <p className="text-[11px] uppercase tracking-[0.25em] text-sage-700 mb-3">
        A prática
      </p>
      <h2 className="font-serif text-4xl text-ink leading-[1.05]">
        Como é uma aula
      </h2>
      <p className="mt-5 text-[15px] text-ink-soft leading-relaxed">
        Cada encontro começa com respiração e termina em silêncio. No meio, prática —
        <span className="text-ink"> Hatha</span>,
        <span className="text-ink"> Vinyasa</span> ou
        <span className="text-ink"> Ashtanga</span>, dependendo do dia.
        Sempre adaptada pra quem chegou, pro corpo do dia, pro momento.
      </p>

      <div className="mt-8 relative aspect-[4/5] rounded-2xl overflow-hidden bg-sand">
        <Image
          src="/photos/aula-detalhe.jpg"
          alt="Detalhe de uma prática de yoga"
          fill
          sizes="(max-width: 480px) 100vw, 28rem"
          className="object-cover"
        />
      </div>

      <ul className="mt-8 space-y-4">
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

      <blockquote className="mt-10 px-5 py-6 rounded-2xl bg-sage-50 border border-sage-100">
        <Quote aria-hidden className="size-5 text-sage-500 mb-2" />
        <p className="font-serif italic text-ink text-lg leading-snug">
          Aqui yoga não é performance. É presença.
        </p>
        <footer className="mt-3 text-[11px] text-sage-700 uppercase tracking-[0.2em]">
          — Gaby
        </footer>
      </blockquote>
    </section>
  );
}

function Feature({
  icon, title, desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
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

/* ============ RELATOS ============ */
function Relatos() {
  return (
    <section className="px-6 py-16 bg-cream-soft border-y border-sand-deep/30">
      <div className="max-w-md mx-auto">
        <p className="text-[11px] uppercase tracking-[0.25em] text-sage-700 mb-3 text-center">
          Quem pratica
        </p>
        <h2 className="font-serif text-4xl text-ink leading-[1.05] text-center">
          Relatos
        </h2>

        <div className="mt-10 space-y-5">
          {RELATOS.map((r, i) => (
            <RelatoCard key={i} {...r} />
          ))}
        </div>
      </div>
    </section>
  );
}

function RelatoCard({
  texto, nome, tempo, iniciais,
}: {
  texto: string;
  nome: string;
  tempo: string;
  iniciais: string;
}) {
  return (
    <article className="rounded-2xl bg-paper border border-sand-deep/40 p-6 shadow-[0_4px_18px_-12px_rgba(60,60,55,0.18)]">
      <Quote aria-hidden className="size-5 text-terra-soft mb-3" />
      <p className="font-serif italic text-ink text-[17px] leading-snug">
        {texto}
      </p>
      <footer className="mt-5 flex items-center gap-3">
        <div className="size-9 rounded-full bg-sage-100 text-sage-700 flex items-center justify-center text-[11px] font-medium tracking-wider">
          {iniciais}
        </div>
        <div>
          <p className="text-[13px] text-ink font-medium leading-tight">{nome}</p>
          <p className="text-[11px] text-ink-mute mt-0.5">{tempo}</p>
        </div>
      </footer>
    </article>
  );
}

/* ============ PACOTES ============ */
function Pacotes() {
  return (
    <section className="px-6 py-16 bg-cream">
      <div className="max-w-md mx-auto">
        <p className="text-[11px] uppercase tracking-[0.25em] text-sage-700 mb-3">
          Investimento
        </p>
        <h2 className="font-serif text-4xl text-ink leading-[1.05]">
          Pacotes
        </h2>
        <p className="mt-4 text-[15px] text-ink-soft leading-relaxed">
          Avulsa ou em pacote — quanto mais aulas, menos custa cada uma.
          Pagamento por PIX ou cartão.
        </p>

        <div className="mt-8 space-y-4">
          {PACOTES.map((p) => (
            <PacoteCard key={p.aulas} {...p} />
          ))}
        </div>

        <p className="mt-6 text-center text-[11px] text-ink-mute">
          Os créditos ficam no app — você usa quando quiser, sem prazo curto.
        </p>
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
  const porAula = (total / aulas).toFixed(0);
  const desconto = aulas === 1 ? null : Math.round((1 - total / (aulas * 35)) * 100);

  return (
    <div
      className={cn(
        "relative rounded-2xl p-6 border transition-all",
        destaque
          ? "bg-sage-700 text-paper border-sage-700 shadow-[0_12px_32px_-16px_rgba(92,112,80,0.45)]"
          : "bg-paper text-ink border-sand-deep/50 shadow-[0_4px_18px_-12px_rgba(60,60,55,0.18)]"
      )}
    >
      {selo && (
        <span
          className={cn(
            "absolute -top-3 right-5 text-[9.5px] uppercase tracking-[0.18em] px-3 py-1 rounded-full font-medium",
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
          <p
            className={cn(
              "text-[12px] mt-1.5",
              destaque ? "text-paper/80" : "text-ink-soft"
            )}
          >
            R$ {porAula} <span className="opacity-70">por aula</span>
          </p>
        </div>

        <div className="text-right">
          <p className="font-serif text-4xl leading-none tracking-tight">
            R$ {total}
          </p>
          {desconto !== null && desconto > 0 && (
            <p
              className={cn(
                "text-[10px] uppercase tracking-[0.18em] mt-1.5",
                destaque ? "text-paper/70" : "text-terra"
              )}
            >
              economia {desconto}%
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
      <p className="text-[11px] uppercase tracking-[0.25em] text-sage-700 mb-3">
        Por onde começar
      </p>
      <h2 className="font-serif text-4xl text-ink leading-[1.05]">
        Como agendar
      </h2>
      <p className="mt-4 text-[15px] text-ink-soft leading-relaxed">
        Tudo pelo app <span className="font-medium text-ink">Sopro</span> —
        de graça, instalado em 1 minuto.
      </p>

      <ol className="mt-8 space-y-6">
        <Step
          n={1}
          title="Cadastro grátis"
          desc="Só nome e WhatsApp. Recebe um código no WhatsApp pra confirmar — sem senha, sem email."
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

function Step({
  n, title, desc,
}: { n: number; title: string; desc: string }) {
  return (
    <li className="flex gap-4">
      <div className="shrink-0 size-10 rounded-full border border-sage-300/60 text-sage-700 flex items-center justify-center font-serif text-xl bg-paper">
        {n}
      </div>
      <div className="pt-1.5">
        <p className="font-medium text-ink text-[15px] leading-tight">{title}</p>
        <p className="text-[13px] text-ink-soft mt-1.5 leading-relaxed">{desc}</p>
      </div>
    </li>
  );
}

/* ============ CTA FINAL ============ */
function CtaFinal() {
  return (
    <section className="px-6 py-16 bg-sage-700 text-paper text-center relative overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, white 1px, transparent 1.5px), radial-gradient(circle at 70% 80%, white 1px, transparent 1.5px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="max-w-md mx-auto relative">
        <Lotus className="size-10 mx-auto text-paper/80 mb-4" />
        <h2 className="font-serif text-4xl leading-[1.05]">
          Vem fazer sua primeira aula
        </h2>
        <p className="mt-4 text-[15px] text-paper/85 leading-relaxed max-w-xs mx-auto">
          O cadastro é grátis e dura 1 minuto. Depois é só escolher seu pacote
          e reservar.
        </p>

        <Link
          href={URL_CADASTRO_SOPRO}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center justify-center gap-2 h-13 px-8 py-4 rounded-full bg-terra text-paper font-medium text-[15px] shadow-[0_8px_24px_-8px_rgba(184,115,85,0.55)] hover:bg-[#a3614a] transition-colors active:scale-[0.98]"
        >
          Quero fazer cadastro
          <ArrowRight className="size-4" />
        </Link>

        <p className="mt-6 text-[12px] text-paper/65">
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
    <footer className="px-6 py-10 text-center bg-cream">
      <Link
        href="/bio-insta"
        className="inline-flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink transition-colors"
      >
        <ArrowLeft className="size-3.5" />
        Outras coisas que faço
      </Link>
      <p className="mt-3 text-[11px] text-ink-mute">
        Gaby Arbter · Erechim · RS
      </p>
    </footer>
  );
}
