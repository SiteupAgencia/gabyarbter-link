import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const serif = Cormorant_Garamond({
  variable: "--font-serif-display",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const sans = Inter({
  variable: "--font-sans-body",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://gabyarbter.com.br"),
  title: "Gaby Arbter — Yoga, Maquiagem, Ayurveda",
  description:
    "Se vê beleza aqui, há tanta beleza aí, que é impossível não ver beleza em tudo. Mãe, maquiadora e professora de yoga em Erechim.",
  openGraph: {
    title: "Gaby Arbter",
    description:
      "Yoga, maquiagem, ayurveda e maternidade — em Erechim. Aulas, agendamento, curso e o app Sopro.",
    url: "https://gabyarbter.com.br",
    siteName: "Gaby Arbter",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gaby Arbter",
    description:
      "Yoga, maquiagem, ayurveda e maternidade — em Erechim.",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f1e5",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" className={`${serif.variable} ${sans.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
