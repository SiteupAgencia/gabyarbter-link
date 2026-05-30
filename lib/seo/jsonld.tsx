import * as React from "react";

/**
 * Renderiza um bloco JSON-LD seguro pra Server Components.
 * - Usa application/ld+json
 * - Escapa `<` pra evitar quebrar o parser HTML (XSS defensivo)
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return (
    <script
      type="application/ld+json"
      // Server Component: conteúdo controlado por nós, seguro
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}

const SITE = "https://gabyarbter.com.br";

// ---------- Entidades reutilizáveis ----------

export const gabyPerson = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE}/#gaby`,
  name: "Gaby Arbter",
  givenName: "Gaby",
  familyName: "Arbter",
  jobTitle: "Professora de yoga, maquiadora e praticante de ayurveda",
  description:
    "Mãe, professora de yoga e maquiadora em Erechim/RS. Trabalha com cuidado ancestral aplicado ao agora — yoga, maquiagem e ayurveda.",
  url: SITE,
  image: `${SITE}/photos/avatar.jpg`,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Erechim",
    addressRegion: "RS",
    addressCountry: "BR",
  },
  sameAs: [
    "https://www.instagram.com/gabyarbter/",
    "https://www.youtube.com/@gabyarbter",
  ],
  knowsAbout: ["Yoga", "Hatha", "Ashtanga", "Maquiagem", "Ayurveda", "Cuidado feminino"],
  knowsLanguage: ["pt-BR"],
};

export const beautySalon = {
  "@context": "https://schema.org",
  "@type": "BeautySalon",
  "@id": `${SITE}/maquiagem#business`,
  name: "Gaby Arbter Maquiagem",
  description:
    "Maquiagem Express e Maquiagem Blindada em Erechim/RS. Atendimento em estúdio, sextas e sábados, com agendamento online e entrada via PIX.",
  url: `${SITE}/maquiagem`,
  image: `${SITE}/maquiagem/hero-makes.jpg`,
  telephone: "+5554999936343",
  priceRange: "R$ 175 - R$ 215",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Erechim",
    addressRegion: "RS",
    addressCountry: "BR",
  },
  areaServed: { "@type": "City", name: "Erechim" },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Friday", "Saturday"],
      opens: "09:00",
      closes: "18:00",
    },
  ],
  founder: { "@id": `${SITE}/#gaby` },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Serviços de maquiagem",
    itemListElement: [
      {
        "@type": "Offer",
        priceCurrency: "BRL",
        price: "175.00",
        availability: "https://schema.org/InStock",
        itemOffered: {
          "@type": "Service",
          name: "Maquiagem Express",
          description: "Maquiagem rápida, aproximadamente 30 minutos. Pele natural e luminosa.",
          serviceType: "Maquiagem",
          provider: { "@id": `${SITE}/#gaby` },
        },
      },
      {
        "@type": "Offer",
        priceCurrency: "BRL",
        price: "200.00",
        priceSpecification: [
          { "@type": "PriceSpecification", price: "200.00", priceCurrency: "BRL", description: "Pagamento em dinheiro" },
          { "@type": "PriceSpecification", price: "215.00", priceCurrency: "BRL", description: "Pagamento via PIX ou cartão" },
        ],
        availability: "https://schema.org/InStock",
        itemOffered: {
          "@type": "Service",
          name: "Maquiagem Blindada",
          description: "Maquiagem HD de longa duração, aproximadamente 45 minutos. Pele resistente, traços valorizados.",
          serviceType: "Maquiagem HD",
          provider: { "@id": `${SITE}/#gaby` },
        },
      },
    ],
  },
};

export const yogaStudio = {
  "@context": "https://schema.org",
  "@type": ["ExerciseGym", "LocalBusiness"],
  "@id": `${SITE}/yoga#business`,
  name: "Sopro · Yoga com Gaby Arbter",
  description:
    "Aulas de yoga em Erechim/RS em pequenos grupos (até 14 pessoas). Segundas 18:00 e 19:10, e Ashtanga nas quartas-feiras às 07:00.",
  url: `${SITE}/yoga`,
  image: `${SITE}/photos/turma-yoga.jpg`,
  priceRange: "R$ 40 - R$ 320",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Erechim",
    addressRegion: "RS",
    addressCountry: "BR",
  },
  areaServed: { "@type": "City", name: "Erechim" },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday"],
      opens: "18:00",
      closes: "20:10",
    },
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Wednesday"],
      opens: "07:00",
      closes: "08:00",
    },
  ],
  founder: { "@id": `${SITE}/#gaby` },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Aulas e planos de yoga",
    itemListElement: [
      {
        "@type": "Offer",
        priceCurrency: "BRL",
        price: "40.00",
        availability: "https://schema.org/InStock",
        itemOffered: { "@type": "Service", name: "Aula avulsa de yoga", provider: { "@id": `${SITE}/#gaby` } },
      },
      {
        "@type": "Offer",
        priceCurrency: "BRL",
        price: "180.00",
        availability: "https://schema.org/InStock",
        itemOffered: {
          "@type": "Service",
          name: "Mensal Sopro",
          description: "4 aulas no mês + passe livre nas quartas-feiras.",
          provider: { "@id": `${SITE}/#gaby` },
        },
      },
      {
        "@type": "Offer",
        priceCurrency: "BRL",
        price: "320.00",
        availability: "https://schema.org/InStock",
        itemOffered: { "@type": "Service", name: "Pacote de 10 aulas", provider: { "@id": `${SITE}/#gaby` } },
      },
    ],
  },
};

export const siteWebSite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE}/#website`,
  name: "Gaby Arbter",
  url: SITE,
  inLanguage: "pt-BR",
  publisher: { "@id": `${SITE}/#gaby` },
};

// FAQ visíveis e correspondentes nas páginas (Google exige que Q&A
// também apareça pra usuária; senão é tratado como spam).

export type FaqItem = { q: string; a: string };

export const maquiagemFaqs: FaqItem[] = [
  {
    q: "Quanto custa uma maquiagem em Erechim com a Gaby?",
    a: "A Maquiagem Express custa R$ 175 e dura cerca de 30 minutos — ideal pra eventos rápidos. A Maquiagem Blindada custa R$ 200 em dinheiro ou R$ 215 no PIX/cartão e dura cerca de 45 minutos, com acabamento HD de longa duração.",
  },
  {
    q: "Onde fica o estúdio?",
    a: "O atendimento acontece em estúdio em Erechim/RS. O endereço completo é enviado por WhatsApp logo após a confirmação do agendamento.",
  },
  {
    q: "Quais dias da semana atende?",
    a: "Atendimento às sextas-feiras e sábados. A disponibilidade real de horários aparece em tempo no agendamento online em gabyarbter.com.br/maquiagem.",
  },
  {
    q: "Como funciona o pagamento? Precisa pagar entrada?",
    a: "Sim. Pra confirmar a agenda você paga 30% do valor como sinal, via PIX ou cartão. O restante é pago presencialmente no dia, em PIX (sem taxa) ou dinheiro.",
  },
  {
    q: "Faz maquiagem de noiva?",
    a: "Sim, sob consulta. Como o atendimento de noiva tem tempo e demanda maiores, vale combinar diretamente pelo WhatsApp pra alinhar duração, valor e detalhes do dia.",
  },
  {
    q: "Como faço pra agendar?",
    a: "Pelo site gabyarbter.com.br/maquiagem: escolhe o serviço, a data e o horário, paga a entrada via PIX ou cartão e recebe a confirmação por WhatsApp.",
  },
];

export const yogaFaqs: FaqItem[] = [
  {
    q: "Onde acontecem as aulas de yoga da Gaby?",
    a: "As aulas acontecem em Erechim/RS, em estúdio próprio. Detalhes do endereço são enviados após o cadastro no app Sopro em gabyarbter.com.br/sopro.",
  },
  {
    q: "Que dias e horários?",
    a: "Segundas-feiras às 18:00 e 19:10 (Yoga noite, fluxo adaptável a qualquer nível) e quartas-feiras às 07:00 (Ashtanga, prática mais intensa pra quem já tem alguma vivência).",
  },
  {
    q: "Quanto custa a aula de yoga?",
    a: "Aula avulsa: R$ 40. Pacote de 10 aulas: R$ 320 (R$ 32 por aula). Mensal Sopro: R$ 180 com 4 aulas no mês mais passe livre nas quartas-feiras (Ashtanga ilimitada).",
  },
  {
    q: "Como funciona o Mensal Sopro?",
    a: "Por R$ 180 no mês, você usa 4 aulas (segundas) à sua escolha mais entra em todas as quartas (Ashtanga) sem limite. Vence em 35 dias após a compra.",
  },
  {
    q: "As aulas têm muitas pessoas?",
    a: "Não. Cada aula tem até 14 vagas, pra garantir atenção real e ajuste real. Quando lota, a aluna entra automaticamente na lista de espera.",
  },
  {
    q: "Preciso ter experiência de yoga antes?",
    a: "Não pra as aulas de segunda — são adaptáveis a iniciantes e a quem já pratica. A Ashtanga da quarta de manhã é mais intensa; recomendo pra quem já tem alguma vivência.",
  },
  {
    q: "Como reservo uma aula?",
    a: "Pelo app Sopro em gabyarbter.com.br/sopro: cadastra, compra créditos via PIX ou cartão, e reserva o horário. Lembrete automático por WhatsApp.",
  },
];

export function buildFaqSchema(faqs: FaqItem[], pageUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${pageUrl}#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}
