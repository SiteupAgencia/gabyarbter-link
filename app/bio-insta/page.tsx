import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  PlayCircle,
  Sparkles,
  GraduationCap,
  MapPin,
  ArrowUpRight,
} from "lucide-react";
import { Lotus } from "@/components/lotus";
import {
  InstagramIcon,
  YoutubeIcon,
  WhatsappIcon,
} from "@/components/brand-icons";
import { cn } from "@/lib/utils";
import { JsonLd, gabyPerson, siteWebSite } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Gaby Arbter — Yoga, Maquiagem e Ayurveda em Erechim/RS",
  description:
    "Mãe, maquiadora e professora de yoga em Erechim/RS. Conheça aulas de yoga, agendamento de maquiagem, curso de automaquiagem e o app Sopro.",
  alternates: { canonical: "/bio-insta" },
  openGraph: {
    title: "Gaby Arbter — Yoga, Maquiagem e Ayurveda em Erechim/RS",
    description:
      "Mãe, maquiadora e professora de yoga em Erechim/RS. Aulas, agendamento, curso e o app Sopro.",
    url: "https://gabyarbter.com.br/bio-insta",
    images: [
      {
        url: "/photos/avatar.jpg",
        width: 1200,
        height: 1200,
        alt: "Gaby Arbter — Erechim/RS",
      },
    ],
  },
};

// URLs reais (extraídas do Linktree atual em 2026-05-16).
// Quando o Sopro for pro ar, trocar URL_YOGA pelo domínio dele.
const URL_YOUTUBE_AULA = "https://youtu.be/qh38626wbY0?si=lt53dj3pAlutrqst";
const URL_AGENDAR_MAQUIAGEM = "/maquiagem";
const URL_YOGA = "/yoga"; // landing dedicada — leva pro cadastro do Sopro
const URL_CURSO_AUTOMAQUIAGEM = "https://pay.hotmart.com/Y79914073O";

const URL_INSTAGRAM = "https://www.instagram.com/gabyarbter/";
const URL_WHATSAPP = "https://wa.me/message/E6RZKY2Y72LEB1";
const URL_YOUTUBE_CANAL = "https://www.youtube.com/@gabyarbter";

export default function Home() {
  return (
    <main className="min-h-dvh safe-top safe-bottom flex flex-col items-center px-5 py-10 relative overflow-hidden">
      <JsonLd data={[gabyPerson, siteWebSite]} />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 size-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgba(184,115,85,0.10) 0%, rgba(184,115,85,0.03) 40%, transparent 70%)",
        }}
      />

      <div className="w-full max-w-md space-y-10 relative">
        <Hero />
        <Cards />
        <SobreYoga />
        <SobreGaby />
        <Footer />
      </div>
    </main>
  );
}

/* ============================================
   HERO — foto + nome + tagline
   ============================================ */
function Hero() {
  return (
    <header className="text-center fade-up">
      <div className="relative w-32 h-32 mx-auto mb-5">
        <div
          aria-hidden
          className="absolute inset-0 rounded-full bg-sand-deep/40 breathe-soft"
        />
        <div className="absolute inset-1 rounded-full overflow-hidden bg-sand">
          <Image
            src="/photos/avatar.jpg"
            alt="Gaby Arbter"
            fill
            sizes="128px"
            priority
            className="object-cover object-[center_30%]"
          />
        </div>
      </div>

      <h1 className="font-serif text-5xl text-ink leading-none tracking-tight">
        Gaby Arbter
      </h1>

      <p className="mt-5 text-[15px] text-ink-soft italic font-serif leading-snug max-w-xs mx-auto">
        “Se vê beleza aqui, há tanta beleza aí, que é impossível não ver beleza em tudo.”
      </p>

      <div className="mt-5 flex flex-wrap justify-center gap-1.5">
        {["Yoga", "Maquiagem", "Ayurveda", "Mãe"].map((t) => (
          <span
            key={t}
            className="text-[11px] uppercase tracking-[0.18em] text-ink-soft bg-paper border border-sand-deep/60 rounded-full px-2.5 py-1"
          >
            {t}
          </span>
        ))}
      </div>

      <p className="mt-4 text-xs text-ink-mute flex items-center justify-center gap-1">
        <MapPin className="size-3" />
        Erechim, RS
      </p>
    </header>
  );
}

/* ============================================
   CARDS — as 4 portas
   ============================================ */
function Cards() {
  return (
    <section className="space-y-3 fade-up" style={{ animationDelay: "120ms" }}>
      <PortaCard
        href={URL_YOUTUBE_AULA}
        icon={<PlayCircle className="size-5" />}
        title="Aula de yoga grátis"
        subtitle="Pra iniciantes — acalma e renova"
        tone="soft"
      />
      <PortaCard
        href={URL_AGENDAR_MAQUIAGEM}
        icon={<Sparkles className="size-5" />}
        title="Maquiagem"
        subtitle="Express e Blindada · a partir de R$ 175"
        tone="primary"
      />
      <PortaCard
        href={URL_YOGA}
        icon={<Lotus className="size-5" />}
        title="Aulas de yoga em Erechim"
        subtitle="Pratique semanal com a gente"
        tone="sage"
      />
      <PortaCard
        href={URL_CURSO_AUTOMAQUIAGEM}
        icon={<GraduationCap className="size-5" />}
        title="Curso de automaquiagem"
        subtitle="Aprenda a se maquiar com leveza"
        tone="soft"
      />
    </section>
  );
}

type Tone = "soft" | "primary" | "sage";

function PortaCard({
  href,
  icon,
  title,
  subtitle,
  tone = "soft",
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  tone?: Tone;
}) {
  // Links internos (começam com /) abrem na mesma aba; externos em nova.
  const isExternal = href.startsWith("http");
  return (
    <Link
      href={href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className={cn(
        "group flex items-center gap-4 rounded-2xl px-5 py-4 border transition-all active:scale-[0.99]",
        tone === "soft" &&
          "bg-paper border-sand-deep/40 hover:border-sage-200 hover:shadow-[0_8px_24px_-12px_rgba(122,141,107,0.25)]",
        tone === "primary" &&
          "bg-terra text-paper border-terra hover:bg-[#a3614a]",
        tone === "sage" &&
          "bg-sage-50 border-sage-100 hover:bg-sage-100/70 hover:border-sage-200"
      )}
    >
      <div
        className={cn(
          "shrink-0 size-11 rounded-full flex items-center justify-center transition-colors",
          tone === "soft" && "bg-sand text-sage-700",
          tone === "primary" && "bg-paper/15 text-paper",
          tone === "sage" && "bg-paper text-sage-700"
        )}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-[15px] font-medium leading-tight",
            tone === "primary" ? "text-paper" : "text-ink"
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            "text-[12px] mt-0.5 leading-tight",
            tone === "primary" ? "text-paper/80" : "text-ink-soft"
          )}
        >
          {subtitle}
        </p>
      </div>

      <ArrowUpRight
        className={cn(
          "shrink-0 size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
          tone === "primary" ? "text-paper/80" : "text-ink-mute"
        )}
      />
    </Link>
  );
}

/* ============================================
   SOBRE YOGA — bloco extendido com foto
   ============================================ */
function SobreYoga() {
  return (
    <section
      className="fade-up rounded-2xl overflow-hidden bg-paper border border-sand-deep/40"
      style={{ animationDelay: "240ms" }}
    >
      <div className="relative aspect-[3/4] bg-sand">
        <Image
          src="/photos/turma-yoga.jpg"
          alt="Turma de yoga da Gaby em Erechim"
          fill
          sizes="(max-width: 480px) 100vw, 28rem"
          className="object-cover"
        />
      </div>

      <div className="p-6">
        <h2 className="font-serif text-2xl text-ink leading-tight">
          Yoga aqui é prática real
        </h2>
        <p className="mt-3 text-[14px] text-ink-soft leading-relaxed">
          Aulas em Erechim. Pequenos grupos, presença antes de performance.
          Quem vem, volta — e depois traz uma amiga.
        </p>
        <Link
          href={URL_YOGA}
          className="mt-4 inline-flex items-center gap-1.5 text-sage-700 font-medium text-sm hover:gap-2 transition-all"
        >
          Conhecer as aulas <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    </section>
  );
}

/* ============================================
   SOBRE GABY — mini bio
   ============================================ */
function SobreGaby() {
  return (
    <section
      className="fade-up text-center px-4"
      style={{ animationDelay: "360ms" }}
    >
      <p className="font-serif italic text-ink-soft text-[15px] leading-relaxed">
        Sou Gaby. Mãe, maquiadora, professora de yoga.
        <br />
        Tudo o que faço respira a mesma coisa:{" "}
        <span className="text-ink">cuidado</span>.
      </p>
    </section>
  );
}

/* ============================================
   FOOTER — redes
   ============================================ */
function Footer() {
  return (
    <footer className="fade-up pt-6 pb-2" style={{ animationDelay: "480ms" }}>
      <div className="flex items-center justify-center gap-3">
        <SocialIcon href={URL_INSTAGRAM} label="Instagram">
          <InstagramIcon className="size-4" />
        </SocialIcon>
        <SocialIcon href={URL_WHATSAPP} label="WhatsApp">
          <WhatsappIcon className="size-4" />
        </SocialIcon>
        <SocialIcon href={URL_YOUTUBE_CANAL} label="YouTube">
          <YoutubeIcon className="size-4" />
        </SocialIcon>
      </div>
      <p className="mt-4 text-center text-[11px] text-ink-mute">
        Erechim · RS
      </p>
    </footer>
  );
}

function SocialIcon({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="size-10 rounded-full bg-paper border border-sand-deep/50 flex items-center justify-center text-ink-soft hover:text-sage-700 hover:border-sage-200 transition-colors"
    >
      {children}
    </Link>
  );
}
