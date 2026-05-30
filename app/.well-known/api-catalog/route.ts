import { NextResponse } from "next/server";

/**
 * Catálogo de serviços bookáveis (formato Linkset, RFC 9264 / draft IETF
 * api-catalog). Permite que agentes descubram os fluxos de agendamento da
 * Gaby (maquiagem e yoga) e cheguem nas páginas onde podem agir.
 *
 * Referenciado por:
 *   - robots.txt (indireto, via header Link)
 *   - HTTP header `Link: </.well-known/api-catalog>; rel="api-catalog"` na home
 */
export const dynamic = "force-static";

const SITE = "https://gabyarbter.com.br";

export function GET() {
  const body = {
    linkset: [
      {
        anchor: `${SITE}/`,
        // service-doc aponta pra páginas humanas que descrevem o serviço;
        // service-desc seria pra OpenAPI quando tivermos.
        "service-doc": [
          {
            href: `${SITE}/maquiagem`,
            title: "Maquiagem — agendamento em Erechim/RS",
            type: "text/html",
            hreflang: "pt-BR",
          },
          {
            href: `${SITE}/yoga`,
            title: "Yoga — aulas e plano Mensal Sopro em Erechim/RS",
            type: "text/html",
            hreflang: "pt-BR",
          },
        ],
        author: [
          {
            href: `${SITE}/bio-insta`,
            title: "Gaby Arbter — bio e links",
          },
        ],
      },
    ],
  };

  return NextResponse.json(body, {
    headers: {
      "content-type": "application/linkset+json",
      // Cache leve no CDN — catálogo muda raramente
      "cache-control": "public, max-age=300, s-maxage=3600",
    },
  });
}
