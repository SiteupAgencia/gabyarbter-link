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
  title: {
    default: "Gaby Arbter — Yoga, Maquiagem e Ayurveda em Erechim/RS",
    template: "%s · Gaby Arbter",
  },
  description:
    "Mãe, maquiadora e professora de yoga em Erechim/RS. Aulas de yoga em pequenos grupos, maquiagem Express e Blindada, e o app Sopro pra agendar.",
  keywords: [
    "Gaby Arbter",
    "yoga Erechim",
    "maquiagem Erechim",
    "maquiagem RS",
    "professora de yoga Erechim",
    "maquiadora Erechim",
    "Ashtanga Erechim",
    "Sopro yoga",
    "ayurveda",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Gaby Arbter — Yoga, Maquiagem e Ayurveda em Erechim/RS",
    description:
      "Aulas de yoga em pequenos grupos, maquiagem Express e Blindada, e o app Sopro pra agendar. Em Erechim/RS.",
    url: "https://gabyarbter.com.br",
    siteName: "Gaby Arbter",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/photos/avatar.jpg",
        width: 1200,
        height: 1200,
        alt: "Gaby Arbter — yoga, maquiagem e ayurveda em Erechim",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Gaby Arbter — Yoga, Maquiagem em Erechim/RS",
    description:
      "Aulas em pequenos grupos, maquiagem Express e Blindada. Em Erechim/RS.",
    images: ["/photos/avatar.jpg"],
  },
  authors: [{ name: "Gaby Arbter", url: "https://www.instagram.com/gabyarbter/" }],
  creator: "Gaby Arbter",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
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
