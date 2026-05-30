import type { MetadataRoute } from "next";

// Paths privados ou sem valor de SEO. Repetidos pra cada User-agent porque,
// pela RFC 9309, um bot que casa com um bloco específico ignora o bloco `*`.
const DISALLOW = [
  "/admin",                      // painel da Gaby pra maquiagem
  "/api/",                       // endpoints internos
  "/maquiagem/agendar/api/",     // endpoints do checkout
  "/maquiagem/agendar/sucesso",  // retorno de pagamento (conteúdo dinâmico)
  "/sopro/admin",                // painel da professora (app)
  "/sopro/agenda",               // app privado (aluna)
  "/sopro/conta",
  "/sopro/creditos",
  "/sopro/entrar",               // form de login
  "/sopro/cadastro",             // form de cadastro
];

// Política pra bots de IA: liberamos todos os principais explicitamente.
// Objetivo é GEO — a gente QUER ser citada por ChatGPT, Claude, Gemini etc.
const AI_BOTS = [
  // OpenAI
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  // Anthropic
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  // Google (precisa do opt-in pro Gemini/Bard usarem o conteúdo)
  "Google-Extended",
  // Perplexity
  "PerplexityBot",
  "Perplexity-User",
  // Apple
  "Applebot-Extended",
  // Meta
  "meta-externalagent",
  // Outros
  "Amazonbot",
  "DuckAssistBot",
  "CCBot", // Common Crawl alimenta vários LLMs open-source
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...AI_BOTS.map((bot) => ({
        userAgent: bot,
        allow: "/",
        disallow: DISALLOW,
      })),
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },
    ],
    sitemap: "https://gabyarbter.com.br/sitemap.xml",
    host: "https://gabyarbter.com.br",
  };
}
