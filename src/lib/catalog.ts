// Único ponto de acesso ao catálogo de packs.
// O ficheiro src/data/catalog.json vem de atlas-agent-packs (npm run sync:catalog) e é versionado aqui,
// para o build não depender de acesso a repositórios privados.
import raw from "@/data/catalog.json";
import type { Catalog, Pack } from "./types";

const catalog = raw as unknown as Catalog;

export const packs: Pack[] = catalog.packs;
export const catalogVersion: string = catalog.catalogVersion;

export function getPack(slug: string): Pack | undefined {
  return packs.find((p) => p.slug === slug);
}
