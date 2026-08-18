import type { Metadata } from "next";
import { Bodoni_Moda, Fraunces, Newsreader } from "next/font/google";

const organic = Fraunces({
  variable: "--font-serif-organic",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const human = Newsreader({
  variable: "--font-serif-human",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const fashion = Bodoni_Moda({
  variable: "--font-serif-fashion",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Brand Hub — sistema vivo da marca",
  description:
    "Guia vivo de posicionamento, identidade, conteúdo e aplicação da marca Gaby Arbter.",
  alternates: { canonical: "https://marca.gabyarbter.com.br" },
  robots: { index: false, follow: false },
  openGraph: {
    title: "Gaby Arbter — Brand Hub",
    description: "Leveza com presença. Um sistema de marca para usar, não só admirar.",
    url: "https://marca.gabyarbter.com.br",
    images: [{ url: "/photos/avatar.jpg", width: 1200, height: 1200, alt: "Gaby Arbter" }],
  },
};

export default function BrandLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${organic.variable} ${human.variable} ${fashion.variable}`}>{children}</div>;
}
