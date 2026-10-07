// Copia dist/catalog.json de atlas-agent-packs para src/data/catalog.json.
// Uso: npm run sync:catalog            (usa ../atlas-agent-packs)
//      PACKS_DIR=/caminho npm run sync:catalog
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packsDir = resolve(process.env.PACKS_DIR ?? join(root, "..", "atlas-agent-packs"));
const from = join(packsDir, "dist", "catalog.json");
const to = join(root, "src", "data", "catalog.json");

if (!existsSync(from)) {
  console.error(`Não encontrei ${from}\nCorra "npm run check" em atlas-agent-packs (ou defina PACKS_DIR).`);
  process.exit(1);
}
const cat = JSON.parse(readFileSync(from, "utf8"));
if (cat.schemaVersion !== 1) {
  console.error(`schemaVersion ${cat.schemaVersion} não suportado por este app (esperado 1).`);
  process.exit(1);
}
mkdirSync(dirname(to), { recursive: true });
copyFileSync(from, to);
console.log(`✓ catálogo v${cat.catalogVersion} · ${cat.packs.length} pack(s) → src/data/catalog.json`);
console.log("  Lembre-se de fazer commit com a versão do catálogo na mensagem.");
