# feat: add managed-service assessment and tenant portal

The simulator remains available while the app adds AtlasHub managed-service messaging, consented assessment submission and an authenticated tenant portal for runs, approvals and usage. Login uses server-side Supabase Auth; JWT is stored in an HttpOnly cookie and verified by the backend against active memberships. PACK-002/003 appear as demos, and the strategic catalog distinguishes planned profiles from operational services.

Synchronizes catalog v0.2.0. Existing simulator tests select PACK-001 by ID rather than catalog position. Local tests, lint, typecheck, build and Chromium checks passed, including anonymous redirect, assessment and cross-tenant denial using a synthetic JWT. Real Supabase login and remote preview remain unverified; see ROUND-1.md.
