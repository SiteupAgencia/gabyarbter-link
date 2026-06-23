import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AdminNav } from "./admin-nav";

export default function MaquiagemAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-30 backdrop-blur-xl bg-cream/80 border-b border-black/[0.06]">
        <div className="mx-auto max-w-2xl px-5 h-14 flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-[0.82rem] text-ink-soft hover:text-ink transition"
          >
            <ChevronLeft className="size-4" /> Painel
          </Link>
          {/* Alternador de painel: Maquiagem (atual) ↔ Yoga. <a> puro no Yoga
              porque /sopro é um app proxiado (sai do roteamento deste app). */}
          <div className="inline-flex items-center rounded-full hairline p-0.5 text-xs font-medium">
            <span className="rounded-full px-2.5 py-1 bg-terra/15 text-terra">Maquiagem</span>
            <a
              href="/sopro/admin"
              className="rounded-full px-2.5 py-1 text-sage-700 hover:bg-sage-50 transition"
            >
              Yoga
            </a>
          </div>
        </div>
        <div className="pb-2.5">
          <AdminNav />
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-5 py-7">{children}</div>
    </>
  );
}
