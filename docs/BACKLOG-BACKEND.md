# Backlog técnico — app.atlashub.si ↔ backend

**P0** bloqueia o uso real · **P1** antes de clientes reais · **P2** evolução.

| # | P | Área | Tarefa | Depende de | Aceitação |
|---|---|---|---|---|---|
| 1 | P0 | Infra | Hostname HTTPS público para a API AI-WaaS (staging) — ver AMBIENTES §3 | autorização owner VPS | `GET /health` 200 a partir da Vercel |
| 2 | P0 | Infra | Variáveis na Vercel: `WAAS_API_URL`, `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` (Preview → Production) | 1 | Assessment grava; login devolve 303 |
| 3 | P0 | Backend | Assessment com contacto: migrar para `consent-text` + `/v1/public/leads` (ou estender `/v1/assessments` com versão nova) | decisão de produto | Lead no CRM com consentimento versionado |
| 4 | P0 | Front | Formulário de assessment com nome, email/WhatsApp, consentimento da API; erro amigável em vez de exceção | 3 | Testes de formulário; sem página de erro genérica |
| 5 | P0 | Backend | Rate limit atrás de proxy (IP real do visitante) | 1 | 429 por visitante |
| 6 | P1 | Backend | `GET /v1/me` — perfil + memberships (tenants e papéis) | — | Portal sem campo de tenant manual |
| 7 | P1 | Front | Seletor de tenant no portal; tipos gerados do OpenAPI (`api-types.ts`) em vez de `any` | 6 | typecheck sem `any` no portal |
| 8 | P1 | Backend/Front | Refresh de sessão (refresh token em cookie HttpOnly separado) e "esqueci a palavra-passe" | 2 | Sessão > 1 h sem novo login |
| 9 | P1 | DB | Retenção e eliminação: `Assessment`, eventos, auditoria; exportação por titular/tenant | — | Jobs agendados + testes A/B |
| 10 | P1 | Infra | Supabase: *Leaked Password Protection*, política de palavras-passe, MFA opcional | — | Advisor sem avisos |
| 11 | P1 | Backend | Onboarding de clientes: utilizador Supabase + membership automática ao aceitar proposta (`quotes/accept` já cria o tenant) | — | Cliente entra no portal após pagamento |
| 12 | P2 | Backend | `GET /v1/dashboard` com agregados (ver MAPA-DADOS-ECRAS) e métrica homologada de "tempo poupado" | decisão de direção | Painel real com selo removido só nos blocos medidos |
| 13 | P2 | Front | `/packs` e biblioteca a partir de `GET /v1/public/catalog` (preços só `active`) | aprovação de preços | Catálogo em 5 línguas |
| 14 | P2 | Front | Teste gratuito 3/7 dias (`/v1/public/trials`) e aceitação de proposta (`/v1/public/quotes/accept`) | 3 | Funil completo em staging |
| 15 | P2 | Backend | Faturas no portal (`/v1/billing/invoices`) | 11 | Download do documento |
| 16 | P2 | Backend | Leitura de integrações (`IntegrationConnection`) para o bloco "Integrações" | — | Sem expor `secretRef` |
| 17 | P2 | Decisão | PT-PT vs PT-BR (`lang` do layout; `locale` do backend tem `pt-BR` por defeito) | — | Decisão registada |
