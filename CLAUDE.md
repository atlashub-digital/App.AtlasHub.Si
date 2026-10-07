# CLAUDE.md — App.AtlasHub.Si

O app.atlashub.si: simulador V0 em guião (sem LLM, sem backend) onde um lead experimenta os packs de `atlas-agent-packs`. Next 16, React 19, Tailwind 4, TypeScript estrito. Detalhe: `README.md`.

## Comandos
Node ≥ 22.

- `npm ci` — instalar (o lockfile está commitado; ao mudar dependências usar `npm install <pacote>` e commitar o `package-lock.json`).
- `npm run dev` — http://localhost:3000
- `npm test` — testes da lógica com `node --test` (sem dependências extra).
- `npm run lint` · `npm run typecheck` · `npm run build` — a CI corre test → lint → typecheck → build; correr os quatro antes de commitar.
- `npm run sync:catalog` — copia `dist/catalog.json` de `../atlas-agent-packs` (ou `PACKS_DIR=…`).

## Regras de ouro
1. O simulador é genérico: nada de casos especiais por pack na UI. Se um pack precisa de algo novo, estende-se o contrato (schema em atlas-agent-packs + suporte aqui).
2. `src/lib/` e `src/components/simulator/state.ts` são TypeScript puro (sem React/Next) e testam-se com `node --test`. A UI só compõe.
3. Tudo o que o lead vê é simulação com dados fictícios; nada é enviado nem executado fora do browser.
4. Nunca inventar números: resultados mostram sempre o `disclaimer`; preços `null` em `src/config/site.ts` mostram "Valor definido no AI Business Assessment".
5. Nunca segredos nem dados reais de leads, clientes ou pacientes.
6. Acessibilidade: alvos ≥ 44 px, `button`/`a` reais, `aria-label` em botões só com ícone, `aria-live` na conversa.

## O que não mexer
- `src/data/catalog.json` é gerado: só muda via `npm run sync:catalog`, num commit `chore(catalog): atlas-agent-packs v0.X.Y`. Textos da Clara, cenários e métricas mudam no pack, não aqui.
- `src/lib/metrics.ts` é port de `atlas-agent-packs/lib/metrics.mjs` e tem de se comportar de forma idêntica (mesmos valores do PACK-001 nos testes dos dois repositórios).
- Comportamento do simulador (reducer em `state.ts`, ações `pick`/`run`/`tick`/`step`/`reset`/`value`) só muda com testes atualizados.
- Decisão pendente PT-PT vs PT-BR: não mudar o `lang` de `layout.tsx` sem decisão.
