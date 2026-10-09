// Which server-backed features are really available in this deployment. Pure: tested with node --test.
// Rule (go-live 09/10): never show a form that cannot complete — show an honest notice + WhatsApp instead.

export type Env = Record<string, string | undefined>;

const httpsOrLocal = (value: string | undefined) => {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || ["127.0.0.1", "localhost"].includes(url.hostname);
  } catch {
    return false;
  }
};

export function features(env: Env) {
  const core = httpsOrLocal(env.WAAS_API_URL);
  const auth = httpsOrLocal(env.SUPABASE_URL) && Boolean(env.SUPABASE_PUBLISHABLE_KEY);
  return {
    /** POST /v1/assessments reachable. */
    assessment: core,
    /** Client portal needs both Supabase Auth and the Core. */
    portal: core && auth,
  };
}
