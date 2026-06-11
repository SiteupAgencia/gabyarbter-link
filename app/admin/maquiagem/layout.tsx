import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AdminNav } from "./admin-nav";

export default function MaquiagemAdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-30 backdrop-blur-md bg-cream/85 border-b border-sand/60">
        <div className="mx-auto max-w-2xl px-5 h-14 flex items-center justify-between">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1 text-sm text-ink-soft hover:text-ink transition"
          >
            <ChevronLeft className="size-4" /> Painel
          </Link>
          <span className="inline-flex items-center gap-2 font-serif text-base text-ink">
            <span className="size-2 rounded-full bg-terra" aria-hidden /> Maquiagem
          </span>
        </div>
        <AdminNav />
      </header>
      <div className="mx-auto max-w-2xl px-5 py-6">{children}</div>
    </>
  );
}
