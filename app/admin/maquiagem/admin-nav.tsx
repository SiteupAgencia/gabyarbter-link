"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/admin/maquiagem", label: "Agenda" },
  { href: "/admin/maquiagem/clientes", label: "Clientes" },
  { href: "/admin/maquiagem/faturamento", label: "Faturamento" },
];

export function AdminNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/admin/maquiagem"
      ? pathname === "/admin/maquiagem" || pathname.startsWith("/admin/maquiagem/novo")
      : pathname.startsWith(href);

  return (
    <nav className="mx-auto max-w-2xl px-5">
      <div className="flex gap-1 p-1 rounded-2xl bg-cream-soft hairline">
        {tabs.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "flex-1 text-center py-2 rounded-[0.85rem] text-[0.82rem] font-medium transition",
              isActive(t.href)
                ? "bg-paper text-ink elev-soft"
                : "text-ink-soft hover:text-ink",
            )}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
