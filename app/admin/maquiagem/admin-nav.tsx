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
    <nav className="mx-auto max-w-2xl px-5 flex gap-5">
      {tabs.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={cn(
            "py-2.5 text-sm font-medium border-b-2 transition -mb-px",
            isActive(t.href)
              ? "border-sage-700 text-sage-700"
              : "border-transparent text-ink-soft hover:text-ink",
          )}
        >
          {t.label}
        </Link>
      ))}
    </nav>
  );
}
