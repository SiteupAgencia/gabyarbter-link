"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const tabs = [
  { href: "/admin/maquiagem", label: "Agenda" },
  { href: "/admin/maquiagem/clientes", label: "Clientes" },
];

export function AdminNav() {
  const pathname = usePathname();
  const onClientes = pathname.startsWith("/admin/maquiagem/clientes");

  return (
    <nav className="mx-auto max-w-2xl px-5 flex gap-5">
      {tabs.map((t) => {
        const active = t.href === "/admin/maquiagem/clientes" ? onClientes : !onClientes;
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "py-2.5 text-sm font-medium border-b-2 transition -mb-px",
              active
                ? "border-sage-700 text-sage-700"
                : "border-transparent text-ink-soft hover:text-ink",
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
