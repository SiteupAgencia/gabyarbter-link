import type { MetadataRoute } from "next";

const SITE = "https://gabyarbter.com.br";

export default function sitemap(): MetadataRoute.Sitemap {
  // `/` redireciona pra `/bio-insta`, então a URL canônica é a do bio-insta
  // (não inclui `/` pra não confundir o Google com 2 entradas pra mesma página).
  const now = new Date();
  return [
    {
      url: `${SITE}/bio-insta`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1.0,
    },
    {
      url: `${SITE}/maquiagem`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE}/yoga`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];
}
