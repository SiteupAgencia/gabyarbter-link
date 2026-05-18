import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Proxy transparente pro Sopro: /sopro e /sopro/* batem em yoga-checkin
  // (que tem basePath '/sopro'). O usuário vê tudo como gabyarbter.com.br,
  // cookies/sessão Supabase ficam no domínio principal.
  async rewrites() {
    return [
      {
        source: "/sopro",
        destination: "https://yoga-checkin.vercel.app/sopro",
      },
      {
        source: "/sopro/:path*",
        destination: "https://yoga-checkin.vercel.app/sopro/:path*",
      },
      // Proxy do fluxo de agendamento de maquiagem pro Sopro.
      // A landing /maquiagem fica neste app (estática); /maquiagem/agendar
      // e tudo embaixo é servido pelo yoga-checkin.
      {
        source: "/maquiagem/agendar",
        destination: "https://yoga-checkin.vercel.app/maquiagem/agendar",
      },
      {
        source: "/maquiagem/agendar/:path*",
        destination: "https://yoga-checkin.vercel.app/maquiagem/agendar/:path*",
      },
    ];
  },
};

export default nextConfig;
