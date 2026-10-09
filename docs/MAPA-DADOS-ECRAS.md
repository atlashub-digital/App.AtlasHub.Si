# Mapa de dados dos ecrãs 1:1 — Painel e Biblioteca

Hoje os dois ecrãs são **imagens de fundo + texto real + links**, com dados ilustrativos (`src/data/mockups/*.json`, gerados pelo pipeline da maquete). Este mapa diz, para cada bloco, de onde viriam os dados reais quando a direção decidir ligar o Painel ao backend. É a especificação para o backend/DB; a UI terá de ser reconstruída em componentes (o `MockupCanvas` não aceita dados dinâmicos).

## Painel (`/`, maquete 05)

| Bloco | Valor ilustrativo | Fonte real (AI-WaaS) | Existe? |
|---|---|---|---|
| Saudação "Bem-vinda, Ana" / empresa | utilizador fictício | Supabase `auth.users` (nome) + `Tenant.name` via `GET /v1/me` | ❌ endpoint `/v1/me` em falta; tabela de perfis prevista no DATA-MODEL-v2, não implementada |
| Filtro "Últimos 30 dias" | — | parâmetro `from/to` nas consultas | ❌ parâmetros em falta |
| KPI Agentes em operação | 5 | `count(Deployment where state = 'active')` por tenant (estados: sandbox → pilot → active) | ⚠️ dado existe, falta agregado |
| KPI Tarefas executadas | 12.480 | `count(TaskRun where state = 'completed')` no período | ⚠️ idem |
| KPI Tempo poupado | 320 h | `sum(UsageRecord.quantity where metric = minutes_saved)` — **métrica ainda não registada** | ❌ definir métrica e fórmula homologada |
| KPI Satisfação | 96 % | Sem fonte (precisa de inquérito/CSAT por conversa) | ❌ |
| Equipa de Agentes (Clara, Rafael, Sofia, Miguel) | 4 perfis | `Deployment` + `Role` (nome comercial) + contagem de `TaskRun` | ⚠️ |
| Estado Online / Em execução | — | `Deployment.state` + último `TaskRun.state` | ⚠️ |
| Missões Ativas (progresso, prazo) | 4 missões | `CommerceMission` (`status`, `startsAt`, `endsAt`, `capacity`) — progresso precisa de definição | ⚠️ |
| Resultados (gráfico diário) | série 1–30 Out | `TaskRun` agrupado por dia | ⚠️ agregado em falta |
| Uso por área | 35/28/22/15 % | `TaskRun` por `Role`/segmento | ⚠️ |
| Integrações (Slack, Teams, HubSpot…) | ícones | `IntegrationConnection` (`provider`, `status`) | ⚠️ sem endpoint de leitura |
| Biblioteca de Agentes (atalho) | — | `GET /v1/public/catalog` | ✅ |
| Clara — "Conversar com a Clara" | link | `/assessment` → funil `/v1/public/leads` | ⚠️ ver INTEGRACAO-BACKEND §2.1 |

**Endpoint sugerido:** `GET /v1/dashboard?tenant=&from=&to=` (só leitura, RLS do tenant, agregados calculados no Postgres; cache curto), em vez de vários pedidos por bloco.

## Biblioteca (`/biblioteca`, maquete 04)

| Bloco | Fonte real | Existe? |
|---|---|---|
| Separadores AI Workforce Managed / Enterprise Transformation | `catalog_product.kind` | ✅ |
| Pesquisa, categorias, nível, ambiente | filtros sobre `GET /v1/public/catalog` | ⚠️ filtros no cliente ou query params novos |
| Cartões de perfil (nome, função, competências, tags) | `catalog_mission_template` + `catalog_mission_template_i18n` + `Role` | ✅ (8 missões em 5 línguas no seed) |
| Versão / ambiente / estado ("Pronto", "Piloto") | `PackRelease.version`, `Role.commercialState` | ⚠️ estado comercial hoje em demonstração — **não mostrar "Pronto" antes da homologação** |
| "Criar missão com X" | `POST /v1/public/trials` (teste 3/7 dias, aprovação humana) | ✅ endpoint existe |
| "Explorar perfil" | `/simulador/{slug}` (pack) | ✅ |
| Preços | `catalog_price` só `status = active` (hoje tudo `draft`) | ✅ regra já no backend |

## Regras

- Nunca mostrar como real um número sem fonte medida: enquanto a fonte não existir, o bloco fica com dados ilustrativos **e** o selo "Demonstração · dados ilustrativos".
- Agregados por tenant sempre sob RLS (`waas_runtime` + `app.tenant_id`).
