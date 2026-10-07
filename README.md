# App.AtlasHub.Si

O **app.atlashub.si**: onde um lead experimenta os agentes da AtlasHub.SI no contexto do seu negócio, antes de contratar.

> **Estado: V0.** Simulador em guião (sem LLM, sem backend) a funcionar com o PACK-001 · Confirmação de consultas.
> Tudo o que o lead vê é **simulação com dados fictícios**; nada é enviado nem executado fora do browser.

---

## 1. O que o app faz

```
atlashub.si (landing)                     Clara (qualifica o lead)
        │  "Experimente com o seu negócio"        │
        └──────────────► app.atlashub.si ◄────────┘
                              │
              ┌───────────────┼────────────────┐
              ▼               ▼                ▼
        Catálogo de       Simulador        Próximo passo
        packs (/)      /simulador/[slug]   Cloud · Presencial
                       · chat ao vivo      · AI Business Assessment
                       · timeline          · resumo copiável
                       · números do lead
                       · limites do agente
```

- **Catálogo** (`/`): lista os packs que estão em `demo`, `pilot` ou `ga`.
- **Simulador** (`/simulador/[slug]`): reproduz os cenários do pack (conversa de WhatsApp + percurso da automação + registo de eventos), recalcula o impacto com os números do lead e mostra os limites do agente.
- **Próximo passo**: Cloud ou presencial, e um botão que abre o WhatsApp da AtlasHub com um resumo da simulação (o lead revê e envia; o app não envia nada).

O simulador é **genérico**: não sabe nada de clínicas. Tudo o que mostra vem do pack (passos, cenários, métricas, textos da Clara, limites). Um pack novo aparece no app sem escrever código de UI.

## 2. De onde vêm os packs

Os packs vivem em [`atlas-agent-packs`](https://github.com/atlashub-digital/atlas-agent-packs). Esse repositório gera um `dist/catalog.json`; **este app guarda uma cópia versionada em `src/data/catalog.json`**.

```
atlas-agent-packs  ──npm run build──►  dist/catalog.json
                                              │
                         npm run sync:catalog │  (copia)
                                              ▼
App.AtlasHub.Si                        src/data/catalog.json  ──► src/lib/catalog.ts ──► páginas
```

Porquê uma cópia no repositório e não uma dependência npm? Porque `atlas-agent-packs` é privado e o build do Vercel não deve depender de credenciais para o instalar. A cópia é explícita, revista em PR e a versão do catálogo aparece no rodapé da home. Quando houver mais do que um consumidor, publica-se `@atlashub/agent-packs` num registo privado.

## 3. Estrutura

```
App.AtlasHub.Si/
├── src/
│   ├── app/
│   │   ├── layout.tsx                  casca: cabeçalho, metadados, tema
│   │   ├── page.tsx                    catálogo de packs
│   │   ├── simulador/[slug]/page.tsx   uma página por pack (estática)
│   │   └── globals.css                 tokens do design (Tailwind v4 @theme)
│   ├── components/
│   │   ├── SiteHeader.tsx
│   │   └── simulator/
│   │       ├── Simulator.tsx           composição + efeitos (timer, scroll)
│   │       ├── state.ts                reducer puro do simulador
│   │       └── parts.tsx               Clara, chat, timeline, registo, impacto, limites
│   ├── lib/
│   │   ├── types.ts                    tipos do catálogo
│   │   ├── catalog.ts                  acesso ao catálogo (packs, getPack)
│   │   ├── metrics.ts                  avaliador seguro das fórmulas (sem eval)
│   │   ├── simulator.ts                lógica pura: estado da timeline, eventos visíveis
│   │   └── format.ts                   formatação pt-BR (R$, %, h, min)
│   ├── config/site.ts                  WhatsApp e preços das modalidades
│   └── data/catalog.json              cópia do catálogo (gerada)
├── scripts/sync-catalog.mjs            traz o catálogo de atlas-agent-packs
├── tests/                              metrics.test.ts · simulator.test.ts
└── .github/workflows/ci.yml            testes · lint · typecheck · build
```

**Regra de arquitetura:** `lib/` e `components/simulator/state.ts` são TypeScript puro, sem React nem Next, e testam-se com `node --test`. A UI só compõe.

## 4. Primeiros passos

Requisitos: Node ≥ 22.

```bash
git clone git@github.com:atlashub-digital/App.AtlasHub.Si.git && cd App.AtlasHub.Si
npm ci
npm run dev            # http://localhost:3000
```

> O `package-lock.json` está no repositório e a CI usa `npm ci`. Ao adicionar ou atualizar dependências, usar `npm install <pacote>` e fazer commit do lockfile.

Scripts:

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm test` | Testes da lógica (Node, sem dependências extra) |
| `npm run lint` | ESLint (config Next, igual ao Editions) |
| `npm run typecheck` | `next typegen && tsc --noEmit` |
| `npm run build` | Build de produção |
| `npm run sync:catalog` | Copia `dist/catalog.json` de `../atlas-agent-packs` (ou `PACKS_DIR=…`) |

## 5. O contrato com os packs

O simulador usa estes campos do catálogo (ver `docs/PACK-SPEC.md` em atlas-agent-packs):

| Do pack | Onde aparece |
|---|---|
| `name`, `summary`, `id`, `segments` | Título e cabeçalho |
| `steps[]` | Timeline "Percurso da automação" |
| `scenarios[]` (`events[]`, `humanReview`, `claraAfter`) | Chat, registo de eventos, estado dos passos |
| `labels` | Textos do chat (quem fala) |
| `clara` (`intro`, `allDone`, `context`) | Painel da Clara |
| `metrics` (`inputs`, `outputs`, `disclaimer`) | Painel "Os seus números" e cartões de resultado |
| `guardrails[]` | Secção "Limites do agente" |
| `commercial` (`cloud`, `onsite`) | Cartões do próximo passo |
| `version` | Resumo copiado e WhatsApp (rastreabilidade) |

Se `schemaVersion` do catálogo mudar, `sync:catalog` recusa a cópia até o app ser atualizado.

### Atualizar ou adicionar um pack

```bash
# em atlas-agent-packs
npm run check            # valida, testa e gera dist/catalog.json
# em App.AtlasHub.Si
npm run sync:catalog
npm test                 # confirma que os cenários e as métricas continuam coerentes
git add src/data/catalog.json && git commit -m "chore(catalog): atlas-agent-packs v0.X.Y"
```

Nenhum ficheiro de UI muda. Se o pack novo precisar de algo que o simulador ainda não mostra, o pedido é **estender o contrato** (campo novo no schema do pack + suporte aqui), não um caso especial no componente.

## 6. Como o simulador funciona

- **Estado:** um reducer puro (`state.ts`) com as ações `pick`, `run`, `tick`, `step`, `reset`, `value`. O timer só dispara `tick`; o reducer pára sozinho no último evento e regista o cenário como visto.
- **Clara (V0):** não é um LLM. Fala com os textos do pack (`clara.intro`, `scenario.claraAfter`, `clara.allDone`) e sugere os cenários ainda não vistos.
- **Métricas:** `evaluateMetrics` calcula as fórmulas do pack com os valores do lead, limitados a `min`/`max`. Fórmulas só aceitam números, nomes de variáveis, `+ - * / ( )` e `round/min/max`. `lib/metrics.ts` é um port de `atlas-agent-packs/lib/metrics.mjs` e **tem de se comportar de forma idêntica**: ambos os repositórios testam os mesmos valores do PACK-001.
- **Resultados são hipóteses:** o `disclaimer` do pack aparece sempre; a secção "Como calculamos" mostra as fórmulas.
- **Sem backend:** nada é guardado. O botão "Copiar resumo" e o link de WhatsApp levam os números do lead para onde ele decidir.

## 7. Configuração

| Variável | Para quê | Omissão |
|---|---|---|
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Destino do botão "Marcar AI Business Assessment" | `5562991903462` (landing) |

Preços das modalidades: `src/config/site.ts` (`OFFER`). Enquanto forem `null`, o app mostra "Valor definido no AI Business Assessment" e **nunca inventa um valor**. Preencher quando os preços fixos forem aprovados.

## 8. Design

Tokens extraídos do atlashub.si e do Editions (em `globals.css`, `@theme`): fundo `#040C18`, painéis `#071422`/`#0B2034`, ciano `#16D8ED`, âmbar `#F5A524` para "entra uma pessoa", Arial pesado em maiúsculas nos títulos e monoespaçado nas etiquetas. Stack igual ao Editions: Next 16, React 19, Tailwind 4, TypeScript estrito.

Convenções:
- Alvos de toque ≥ 44 px; `button`/`a` reais; `aria-label` em botões só com ícone; `aria-live` na conversa.
- Sem números de resultados inventados, sem placeholders visíveis ao lead.
- Dados sempre fictícios e rotulados como simulação.

## 9. Testes e CI

- `tests/metrics.test.ts`: valores do PACK-001, limites min/max, recusa de código.
- `tests/simulator.test.ts`: coerência do catálogo, estado da timeline (`skip` vs `human`), reducer (executar até ao fim, recomeçar, mudar de cenário).
- CI: testes → lint → typecheck → build, em cada push e PR.

**O que já foi verificado e o que não foi.** A lógica foi testada (10 testes) e o componente foi corrido num browser real com um teste de fumo (passo a passo, execução automática, cenários, alteração de números, link de WhatsApp: sem erros). O que **ainda não correu** foi `next build`, `lint` e `typecheck` com as dependências reais, nem o estilo com o Tailwind compilado (o ambiente de criação não tinha acesso à rede). O primeiro run da CI é a verificação: se falhar, corrigir antes de qualquer outra mudança.

## 10. Deploy

Vercel, `main` → produção, branches → previews. Sem variáveis obrigatórias. Domínio: `app.atlashub.si`.

## 11. Roadmap

| Fase | O quê |
|---|---|
| V0 (este repositório) | Simulador em guião, 1 pack, sem backend |
| V1 | Agente real (Hermes) em sandbox com `binding.demo`: o lead escreve o que quiser |
| V1 | Supabase: `leads`, `simulations` (com `pack_id` + `pack_version`), `meetings`; Auth + RLS |
| V2 | Clara real a orquestrar o fluxo e a personalizar o cenário com os dados do lead (com consentimento LGPD) |
| V2 | Comercial: propostas, negócios e área de cliente |

Desenho dos dados e das tabelas: ver `docs/APP-INTEGRATION.md` em atlas-agent-packs.

## 12. Perguntas frequentes

**Porque é que o simulador não usa um LLM?** Em V0 o objetivo é uma demo rápida, previsível e sem custos nem riscos. O agente real entra em V1, sobre o mesmo pack.

**Um pack novo precisa de código aqui?** Não. Se o catálogo o inclui, aparece na home e em `/simulador/<slug>`.

**Onde mudo o que a Clara diz?** No pack (`clara`, `claraAfter`), não no app.

**Onde mudo o idioma do app?** O `lang` está em `layout.tsx`; as mensagens do agente têm o idioma do pack (`locale`). Decisão pendente: interface em PT-PT ou PT-BR (a landing atual está em PT-PT).

Repositório privado. Nunca segredos, nunca dados reais de leads, clientes ou pacientes.
