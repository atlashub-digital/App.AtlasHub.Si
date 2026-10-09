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

/**
 * What the lead can be told after submitting the assessment. Only a 2xx confirms the record and only a 4xx
 * confirms it was refused; a timeout, a network failure or a 5xx may still have been persisted, so the result
 * is unknown and the lead must not be told that nothing was saved (nor nudged to resubmit).
 */
export type Outcome = "sent" | "rejected" | "unknown";
export function submissionOutcome(status: number | null): Outcome {
  if (status === null) return "unknown";
  if (status >= 200 && status < 300) return "sent";
  if (status >= 400 && status < 500) return "rejected";
  return "unknown";
}
