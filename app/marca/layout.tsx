import type { Metadata } from "next";

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
  return children;
}
