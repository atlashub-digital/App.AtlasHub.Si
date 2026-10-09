# Ambientes e configuração — app.atlashub.si

## 1. Variáveis de ambiente

| Variável | Exposição | Obrigatória | Efeito | Produção (Vercel, 2026-10-09) |
|---|---|---|---|---|
| `WAAS_API_URL` | servidor | para assessment e portal | Base da API AI-WaaS. Tem de ser `https://` (exceto localhost). Sem ela usa `http://127.0.0.1:4000` | ❌ não definida |
| `SUPABASE_URL` | servidor | para login | URL do projeto Supabase do AI-WaaS | ❌ |
| `SUPABASE_PUBLISHABLE_KEY` | servidor | para login | Chave publishable (nunca `service_role`) | ❌ |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | browser | não | WhatsApp dos botões (defeito `5562991903462`) | — (usa defeito) |
| `NEXT_PUBLIC_DEMO_BADGE` | browser | não | `off` esconde o selo "Demonstração · dados ilustrativos" | — (selo visível) |
| `PACKS_DIR` | local (script) | não | Pasta do `atlas-agent-packs` para `npm run sync:catalog` | n/a |

Modelo: [`../.env.example`](../.env.example). `NEXT_PUBLIC_*` vão para o bundle: nunca segredos.

## 2. Infraestrutura

| Item | Valor |
|---|---|
| Hospedagem | Vercel, equipa AtlasHub, projeto `app-atlashub-si` |
| Repositório | `atlashub-digital/App.AtlasHub.Si`, `main` → produção automática |
| Runtime | Node ≥ 22; route handlers Node |
| CI | test → lint → typecheck → build |
| Backend | AI-WaaS: staging na VPS (projeto Compose isolado `ai-waas-staging`) e variante ligada ao Supabase |

## 3. Rede até à API — bloqueio atual

A API de staging escuta **só em loopback na VPS** (`127.0.0.1:14000` na variante VPS, `127.0.0.1:14100` na variante Supabase), sem rota no Caddy. A Vercel não lhe chega. Opções (decisão do owner da VPS, ver `atlas-ops`):

1. **Rota pública no Caddy** com hostname dedicado (ex.: `api-staging.atlashub.si`), TLS, rate limit por IP real (`X-Forwarded-For` de confiança só do Caddy), allowlist de caminhos `/v1/public/*`, `/v1/assessments`, `/v1/runs|approvals|usage`.
2. **Túnel** (Cloudflare Tunnel) só para a API, sem abrir portas.

Depois: `WAAS_API_URL=https://<hostname>` no ambiente Preview da Vercel primeiro, testar, e só então Production.

**Atenção ao rate limit:** a API limita 120 POST/min **por IP direto**. Com a Vercel à frente, todos os visitantes partilham poucos IPs → configurar o proxy de confiança no backend antes de abrir.

## 4. Testar localmente com o backend

```bash
# no AtlasHub-AI-WaaS
npm ci && scripts/staging.sh            # Postgres/Redis locais, migrations, seeds, API em :4000
# neste repositório
cp .env.example .env.local              # WAAS_API_URL=http://127.0.0.1:4000
npm run dev                              # http://localhost:3000/assessment
```

O portal precisa de um JWT válido: em staging local o AI-WaaS usa `AUTH_MODE=staging`; com Supabase, utilizadores de teste criados por `scripts/supabase-staging-setup.sh` (AI-WaaS) e memberships nos tenants A/B.
