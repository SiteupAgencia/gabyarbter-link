import type { Metadata } from "next";
import { getActiveMakeVoucher, getMakeServices, getMakeSettings } from "@/lib/make/queries";
import { AgendarClient } from "./agendar-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Agendar maquiagem · Gaby Arbter",
  description: "Escolha o serviço, data e horário pra sua maquiagem em Erechim.",
};

// ?o=<codigo> vem do QR de voucher impresso (make_campaigns)
type SP = { service?: string; o?: string };

export default async function AgendarPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const [services, settings, voucher] = await Promise.all([
    getMakeServices(),
    getMakeSettings(),
    getActiveMakeVoucher(sp.o),
  ]);

  return (
    <AgendarClient
      services={services}
      settings={settings}
      preselectedSlug={sp.service ?? voucher?.serviceSlug ?? null}
      voucher={voucher}
    />
  );
}
