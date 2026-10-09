# Documentação técnica — app.atlashub.si

Ponto de entrada para quem vai rever ou implementar o **backend, a base de dados e a infraestrutura** por trás do app. O app é um front Next.js; os dados reais vivem no **AtlasHub-AI-WaaS** (API NestJS + Supabase/Postgres com RLS por tenant).

| Documento | Para quem | O que responde |
|---|---|---|
| [ARQUITETURA.md](ARQUITETURA.md) | todos | Rotas, o que é ilustrativo, simulado ou real; fluxos de autenticação |
| [INTEGRACAO-BACKEND.md](INTEGRACAO-BACKEND.md) | backend | Cada chamada à API (pedido, resposta, erros), estado em produção e lacunas |
| [MAPA-DADOS-ECRAS.md](MAPA-DADOS-ECRAS.md) | backend · DB | Cada bloco do Painel e da Biblioteca → tabela/endpoint que o alimentará |
| [DADOS-E-PRIVACIDADE.md](DADOS-E-PRIVACIDADE.md) | DB · jurídico | Dados pessoais, sessão, cookies, consentimento |
| [AMBIENTES.md](AMBIENTES.md) | infra · DevOps | Variáveis, estado real na Vercel, rede até à API |
| [BACKLOG-BACKEND.md](BACKLOG-BACKEND.md) | gestão técnica | Tarefas por área e prioridade |

Já existentes: [`../README.md`](../README.md) (produto, simulador, contrato dos packs), [`../CLAUDE.md`](../CLAUDE.md) (regras do repositório), [`../ROUND-1.md`](../ROUND-1.md) (entrega do portal).

## Ecossistema

| Repositório | Papel |
|---|---|
| `App.AtlasHub.Si` (este) | Painel e biblioteca (ecrãs 1:1), simuladores, assessment, portal do cliente |
| `AtlasHub.Si` | Site público e Clara de pré-análise (`docs/`) |
| `AtlasHub-AI-WaaS` | **Backend** — API, worker, 8 roles, CRM, faturação, RLS (`docs/API.md`, `docs/DATA-MODEL-v2.md`, `docs/FRONTENDS.md`, `packages/contracts/openapi.json`) |
| `atlas-agent-packs` | Fonte de `src/data/catalog.json` (`npm run sync:catalog`) |

> Estado em 2026-10-09: **nenhuma variável de ambiente na Vercel** (`app-atlashub-si`). Em produção, o envio do assessment falha e o login devolve 503. Os simuladores, o painel e a biblioteca funcionam (não dependem de backend). Ver [AMBIENTES.md](AMBIENTES.md).
