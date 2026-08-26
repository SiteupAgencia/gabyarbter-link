import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { AdminNav } from "./admin-nav";
import { SystemSwitch } from "../../../components/system-switch";

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
        </div>
        <div className="pb-2.5">
          <AdminNav />
        </div>
      </header>
      <div className="mx-auto max-w-2xl px-5 py-7 pb-28">{children}</div>
      <SystemSwitch />
    </>
  );
}
