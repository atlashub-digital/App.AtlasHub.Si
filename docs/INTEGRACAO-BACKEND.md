# Integração com o backend — app.atlashub.si

Todas as chamadas partem do **servidor Next** (server actions, route handlers, server components) — nunca do browser. Base: `WAAS_API_URL` (`src/lib/waas.ts`; tem de ser `https://` fora de localhost). Contrato de referência: `AtlasHub-AI-WaaS/packages/contracts/openapi.json`.

## 1. Inventário

| # | Ecrã | Código | Chamada | Auth | Estado em produção |
|---|---|---|---|---|---|
| 1 | `/assessment` | `src/app/(site)/assessment/page.tsx` (server action) | `POST {WAAS}/v1/assessments` | pública | ❌ `WAAS_API_URL` ausente → tenta `127.0.0.1:4000` → erro 500 |
| 2 | `/login` | `src/app/api/session/route.ts` | `POST {SUPABASE_URL}/auth/v1/token?grant_type=password` | `apikey` publishable | ❌ 503 "Login Supabase ainda não configurado" |
| 3 | `/portal` | `src/app/(site)/portal/page.tsx` | `GET {WAAS}/v1/runs?tenant=` | Bearer (cookie) | ⛔ inacessível sem login |
| 4 | `/portal` | idem | `GET {WAAS}/v1/approvals?tenant=` | Bearer | ⛔ |
| 5 | `/portal` | idem | `GET {WAAS}/v1/usage?tenant=` | Bearer | ⛔ |
| 6 | `/portal` | idem (server action) | `POST {WAAS}/v1/approvals/{id}/decide` `{tenant, decision}` | Bearer | ⛔ |
| 7 | `/api/logout` | `src/app/api/logout/route.ts` | — (apaga cookie) | — | ✅ |

## 2. Detalhe

### 2.1 Assessment — `POST /v1/assessments`

Pedido enviado: `{ business: string ≤120, need: string ≤1000, consent: true }` (timeout 10 s). Sucesso → redirect `/assessment?sent=1`. Falha → exceção → página de erro do Next.

Backend (`services/api/src/main.ts`): schema estrito igual; grava em `Assessment` (`id, business, need, consent, createdAt`), escopo `public_intake`, rate limit 120 POST/min por IP.

**Lacunas (P0):**
- O pedido **não tem contacto** (nem email, nem WhatsApp, nem nome): a AtlasHub não consegue responder a quem o enviou.
- `Assessment` não tem `tenantId` nem ligação ao CRM (`crm_lead`), nem prova de consentimento versionada.
- Erro de rede mostra a página de erro genérica.

**Tratamento proposto:** migrar o assessment para o funil comercial já existente — `GET /v1/public/consent-text?purpose=contact_sales` + `POST /v1/public/leads` com `source: "simulator"` (ou `"clara"`), `fullName`, `email`, `phone`, `company`, `interestRoles`, `locale`, `consent`, `consentTextVersion`, e o texto da necessidade numa `crm_activity`. Manter `/v1/assessments` só para compatibilidade, ou deprecá-lo com versão. No front: adicionar campos de contacto e um estado de erro em vez da exceção.

### 2.2 Login — Supabase password grant

Pedido: `form(email, password)` → Supabase. Resposta usada: `access_token`, `expires_in`. Cookie `waas_session` (HttpOnly, `Secure` em https, `SameSite=Strict`, `maxAge = min(expires_in, 3600)`). Verificação `Origin == origem do app` → 403.

**Lacunas:** sem refresh; sem "esqueci a palavra-passe"; sem MFA; sem rate limit do lado do app (o Supabase limita); ativar *Leaked Password Protection* no Auth (aviso do advisor no Checkpoint 8). Os utilizadores precisam de **membership** no AI-WaaS (`POST /v1/tenants/{id}/memberships` com o UUID de `auth.users`) — criar conta Supabase não chega.

### 2.3 Portal

- `GET /v1/runs|approvals|usage?tenant=<id>` com `Authorization: Bearer <jwt>`; `null` em qualquer não-2xx → ecrã "Acesso indisponível".
- Formas usadas pelo front: run `{id, state}`; approval `{id, state, requestedAction}`; usage = array (só `length`).
- `POST /v1/approvals/{id}/decide` `{tenant, decision: "approved"|"rejected"}`; timeout de aprovação no backend: 1 h.

**Lacunas:**
- O utilizador escreve o identificador do tenant à mão → falta `GET /v1/me` (perfil + memberships) no backend e um seletor no front.
- O consumo mostra só a contagem; custos reais e orçamento de canal/LLM ainda pendentes no backend.
- Sem paginação nas listas.

## 3. Endpoints do backend ainda **não usados** pelo app (oportunidades)

| Endpoint AI-WaaS | Uso possível no app |
|---|---|
| `GET /v1/public/catalog?locale=&currency=` | `/packs` e biblioteca com missões e preços aprovados (hoje: `catalog.json` estático; preços em `draft`) |
| `POST /v1/public/simulate` | Validar as métricas do simulador do lado servidor (atenção: tem de dar os mesmos valores que `metrics.ts`) |
| `POST /v1/public/trials` | Botão "Teste gratuito 3/7 dias" com aprovação humana |
| `POST /v1/public/quotes/accept` | Página de aceitação de proposta (token) → cria tenant, fatura, pagamento |
| `GET /v1/billing/invoices`, `/{id}/document` | Faturas no portal |
| `GET /v1/tenants/{id}/deployments` | "Meus Agentes" real no painel |
| `GET /v1/ops/metrics`, `/v1/ops/incidents` | Visão de operador (não cliente) |

## 4. Regras de integração (vêm do AI-WaaS)

- O front nunca envia `tenant_id` como autoridade: o backend reconcilia com a membership.
- Ações com impacto externo são sempre `approval` no backend; o front só mostra e decide.
- Contratos OpenAPI só mudam com versão; gerar tipos de `api-types.ts` em vez de tipar à mão (`any` hoje no portal).
