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
    ];
  },
};

export default nextConfig;
