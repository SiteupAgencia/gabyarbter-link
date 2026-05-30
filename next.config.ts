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

  // Link header pra agent discovery (RFC 8288 + draft api-catalog).
  // Aplicado nas páginas públicas de marketing pra agentes acharem o
  // catálogo de serviços bookáveis em /.well-known/api-catalog.
  async headers() {
    const linkHeader =
      '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"';
    return [
      { source: "/", headers: [{ key: "Link", value: linkHeader }] },
      { source: "/bio-insta", headers: [{ key: "Link", value: linkHeader }] },
      { source: "/maquiagem", headers: [{ key: "Link", value: linkHeader }] },
      { source: "/yoga", headers: [{ key: "Link", value: linkHeader }] },
    ];
  },
};

export default nextConfig;
