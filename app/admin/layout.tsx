import { requireTeacher } from "@/lib/admin-guard";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { firstName } = await requireTeacher();

  return (
    <main className="min-h-dvh bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="max-w-3xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/admin" className="font-serif text-lg tracking-tight text-neutral-900">
            Maquiagem · admin
          </Link>
          <span className="text-sm text-neutral-500">Olá, {firstName}</span>
        </div>
      </header>
      <div className="max-w-3xl mx-auto px-5 py-6">
        {children}
      </div>
    </main>
  );
}
