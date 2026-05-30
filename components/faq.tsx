import type { FaqItem } from "@/lib/seo/jsonld";

// FAQ visível na página. O FAQPage schema é renderizado separadamente
// via JsonLd com o mesmo array de itens — Google exige correspondência.
export function Faq({ title = "Perguntas frequentes", items }: { title?: string; items: FaqItem[] }) {
  return (
    <section className="px-6 py-16 max-w-2xl mx-auto">
      <h2 className="font-serif text-2xl text-ink mb-6 text-center">{title}</h2>
      <ul className="space-y-4">
        {items.map((f, i) => (
          <li key={i} className="rounded-2xl bg-paper border border-sand-deep/40 p-5">
            <details className="group">
              <summary className="flex items-start justify-between gap-4 cursor-pointer list-none">
                <h3 className="font-serif text-[17px] text-ink leading-snug">{f.q}</h3>
                <span
                  aria-hidden
                  className="shrink-0 mt-1 size-5 rounded-full border border-sand-deep/60 text-ink-soft flex items-center justify-center text-sm transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-3 text-[14.5px] text-ink-soft leading-relaxed">{f.a}</p>
            </details>
          </li>
        ))}
      </ul>
    </section>
  );
}
