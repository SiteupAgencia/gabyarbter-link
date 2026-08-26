import { ArrowLeftRight } from "lucide-react";

export function SystemSwitch() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 safe-bottom pointer-events-none">
      <div className="mx-auto max-w-2xl px-5 pb-3 pointer-events-auto">
        <a
          href="/sopro/admin"
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border border-sage-200/70 bg-white/90 px-4 py-2 text-xs font-semibold text-sage-700 backdrop-blur-xl transition-colors hover:bg-sage-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sage-500/40 elev-soft"
          aria-label="Trocar do sistema de Maquiagem para o Yoga"
        >
          <ArrowLeftRight className="size-4" aria-hidden="true" />
          Ir para Yoga
        </a>
      </div>
    </div>
  );
}
