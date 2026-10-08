import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Simulator } from "@/components/simulator/Simulator";
import { getPack, packs } from "@/lib/catalog";

export const dynamicParams = false;

export function generateStaticParams() {
  return packs.map((p) => ({ slug: p.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pack = getPack(slug);
  return { title: pack ? `Simulador · ${pack.name}` : "Simulador" };
}

export default async function SimulatorPage({ params }: Props) {
  const { slug } = await params;
  const pack = getPack(slug);
  if (!pack) notFound();
  return <Simulator pack={pack} />;
}
