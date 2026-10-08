# Round 1 frontend

Simulador V0 preservado; catálogo inclui PACK-001/002/003 demo. Comunicação de serviço gerido e assessment por Clara determinística, sem LLM. Portal consulta API por JWT server-side em cookie HttpOnly; API verifica tenant e membership. Nunca usar service_role no browser. Cookie temporário sem refresh automático: voltar ao login após expiração.

Configurar WAAS_API_URL, SUPABASE_URL e SUPABASE_PUBLISHABLE_KEY no ambiente server-side. Login chama Supabase Auth password grant. Memberships devem usar UUIDs reais de auth.users no backend; não basta criar conta Supabase. O teste local injeta JWT sintético somente via Playwright, sem criar endpoint de login privilegiado para staging.

npm test/lint/typecheck/build passaram; browser real verificou demos, assessment e portal A/B. Login Supabase real, deploy Vercel e preview remoto não verificados por ausência de acesso/configuração. Nenhuma produção alterada. Testes existentes selecionam PACK-001 por ID, porque posição do catálogo muda com novos packs; assertions preservadas.
