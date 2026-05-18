import type { Metadata } from "next";
import { getMakeServices, getMakeSettings } from "@/lib/make/queries";
import { AgendarClient } from "./agendar-client";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Agendar maquiagem · Gaby Arbter",
  description: "Escolha o serviço, data e horário pra sua maquiagem em Erechim.",
};

type SP = { service?: string };

export default async function AgendarPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const [services, settings] = await Promise.all([
    getMakeServices(),
    getMakeSettings(),
  ]);

  return (
    <AgendarClient
      services={services}
      settings={settings}
      preselectedSlug={sp.service ?? null}
    />
  );
}
