# Dados e privacidade — app.atlashub.si

## 1. Dados por ecrã

| Ecrã | Dados pessoais | Sai do browser? | Onde fica |
|---|---|---|---|
| Painel, Biblioteca | nenhum (nomes e fotos fictícios) | não | — |
| Simuladores | nenhum; só números de negócio do visitante | só se ele carregar no WhatsApp (mensagem que ele revê e envia) ou copiar o resumo | WhatsApp da AtlasHub |
| Assessment | empresa + necessidade (texto livre) | sim, servidor → API | `Assessment` (AI-WaaS) — **sem tenant, sem contacto** |
| Login | email + palavra-passe | sim, servidor → Supabase Auth | Supabase Auth (nunca gravados no app) |
| Portal | dados operacionais do tenant (IDs, estados, ações) | leitura | AI-WaaS (RLS) |

## 2. Cookies

| Cookie | Conteúdo | Flags | Duração |
|---|---|---|---|
| `waas_session` | JWT de acesso Supabase | HttpOnly, Secure (https), SameSite=Strict, path `/` | ≤ 1 h |

Sem analytics, sem localStorage, sem cookies de terceiros. O cookie é estritamente necessário (não exige banner de consentimento), mas deve constar do aviso de privacidade.

## 3. Riscos e tratamentos

| Risco | Tratamento |
|---|---|
| Texto livre do assessment pode trazer dados clínicos ou de terceiros | Aviso já no formulário; no backend: limite de tamanho (já), classificação/redação opcional, retenção curta, nunca enviar a LLM sem base legal |
| Assessment sem consentimento versionado | Migrar para `crm_consent` (`textVersion`, `evidence`) via `/v1/public/leads` |
| Tenant escrito à mão | O backend já recusa sem membership (404/403), mas o seletor via `/v1/me` evita tentativa e erro |
| Sessão sem revogação | Logout apaga o cookie local; o JWT continua válido até expirar (≤ 1 h). Aceitável em staging; em produção avaliar tokens mais curtos ou lista de revogação |
| Dados de staging | Só sintéticos. Proibido usar dados reais de clientes ou pacientes (regra 5 do `CLAUDE.md`) |

## 4. Antes de abrir a clientes reais

- [ ] Aviso de privacidade e termos publicados e ligados no rodapé/login.
- [ ] Exportação/eliminação por titular e por tenant (backlog AI-WaaS).
- [ ] Retenção definida para `Assessment`, `TaskEvent`, `AuditEvent`, `UsageRecord`.
- [ ] Transferência internacional (Supabase/região) formalizada.
- [ ] *Leaked Password Protection* e política de palavras-passe no Supabase Auth.
