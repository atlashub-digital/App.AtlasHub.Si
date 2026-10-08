import type { Guardrail, Pack, Scenario, ScenarioEvent, Step } from "@/lib/types";
import { formatValue } from "@/lib/format";
import { timestamp, type StepState } from "@/lib/simulator";

export function Eyebrow({ children }: { children: string }) {
  return <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan3">{children}</div>;
}

/* ───────── Clara ───────── */

export function ClaraPanel({
  pack,
  messages,
  quick,
}: {
  pack: Pack;
  messages: string[];
  quick: { id: string; label: string; onPick: () => void }[];
}) {
  return (
    <aside
      aria-label="Clara"
      className="ah-card ah-bar flex min-w-0 max-w-[380px] flex-[1_1_300px] flex-col"
    >
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <div className="flex size-11 flex-none items-center justify-center rounded-full bg-accent text-lg font-extrabold text-accent-ink shadow-[0_0_22px_rgba(22,216,237,0.45)]">
          C
        </div>
        <div>
          <div className="flex items-center gap-2 font-bold">Clara <span className="ah-chip border-ok/40 px-2! py-0! text-[10px] text-ok"><span className="ah-dot" aria-hidden="true" />online</span></div>
          <div className="text-xs text-mute">Orquestra a simulação · AtlasHub</div>
        </div>
      </div>
      <div className="flex grow flex-col gap-3 px-5 py-4">
        {messages.map((text) => (
          <div
            key={text}
            className="ah-rise rounded-[14px_14px_14px_4px] border border-line bg-panel2/80 px-4 py-3 text-sm text-fg"
          >
            {text}
          </div>
        ))}
        {quick.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {quick.map((q) => (
              <button
                key={q.id}
                type="button"
                onClick={q.onPick}
                className="ah-btn-ghost px-4! text-[15px]!"
              >
                {q.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {pack.clara?.context && pack.clara.context.length > 0 && (
        <div className="border-t border-line px-5 py-4">
          <Eyebrow>CONTEXTO RECOLHIDO</Eyebrow>
          <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-2.5 text-[13px]">
            {pack.clara.context.map((c) => (
              <div key={c.label}>
                <dt className="text-dim">{c.label}</dt>
                <dd className="m-0">{c.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </aside>
  );
}

/* ───────── Conversa ───────── */

function whoLabel(pack: Pack, ev: ScenarioEvent): string {
  if (ev.type === "agent") return pack.labels?.agent ?? "AGENTE";
  if (ev.type === "staff") return "EQUIPA";
  return pack.labels?.customer ?? "CLIENTE";
}

export function ChatPanel({
  pack,
  scenario,
  events,
  playing,
  finished,
  onRun,
  onStep,
  onReset,
  scrollRef,
}: {
  pack: Pack;
  scenario: Scenario;
  events: ScenarioEvent[];
  playing: boolean;
  finished: boolean;
  onRun: () => void;
  onStep: () => void;
  onReset: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const runLabel = playing ? "A executar…" : finished ? "Executar de novo" : "Executar";
  return (
    <div className="ah-card flex min-w-0 flex-[999_1_520px] flex-col overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div>
          <div className="font-bold">{pack.labels?.header ?? pack.name}</div>
          <div className="text-xs text-mute">{scenario.description}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRun}
            className="ah-btn"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="6 4 20 12 6 20 6 4" />
            </svg>
            {runLabel}
          </button>
          <button
            type="button"
            onClick={onStep}
            className="ah-btn-quiet"
          >
            Passo a passo
          </button>
          <button
            type="button"
            onClick={onReset}
            aria-label="Repor simulação"
            className="ah-btn-quiet size-11 p-0!"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 12a9 9 0 1 0 3-6.7" />
              <polyline points="3 3 3 9 9 9" />
            </svg>
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        aria-live="polite"
        className="flex max-h-[560px] min-h-[460px] grow flex-col gap-3 overflow-y-auto bg-chat/80 bg-[radial-gradient(rgba(53,91,117,0.35)_1px,transparent_1px)] bg-size-[22px_22px] p-5"
      >
        {events.length === 0 && (
          <div className="m-auto max-w-[340px] text-center text-dim">
            <div className="text-xs font-semibold tracking-[0.24em] text-cyan3">PRONTO</div>
            <p className="mt-2">Carregue em Executar para ver a simulação, ou avance passo a passo.</p>
          </div>
        )}
        {events.map((ev, i) => {
          if (ev.type === "system") {
            return (
              <div key={i} className="ah-rise flex justify-center">
                <div className="max-w-[90%] rounded-full border border-dashed border-line2 bg-panel2/80 px-3.5 py-1 text-center font-mono text-[11.5px] text-sys">
                  {ev.text}
                </div>
              </div>
            );
          }
          const agent = ev.type === "agent";
          return (
            <div key={i} className={"ah-rise flex " + (agent ? "justify-end" : "justify-start")}>
              <div
                className={
                  "max-w-[78%] border px-4 py-3 text-sm " +
                  (agent
                    ? "rounded-[16px_16px_4px_16px] border-agent-line bg-[linear-gradient(135deg,#0e3a52,#0b2a40)] shadow-[0_0_20px_rgba(22,216,237,0.08)]"
                    : "rounded-[16px_16px_16px_4px] border-line bg-user-bg")
                }
              >
                <div className={"mb-1 text-[11px] font-semibold tracking-[0.14em] " + (agent ? "text-cyan3" : "text-dim")}>
                  {whoLabel(pack, ev)}
                </div>
                <div>{ev.text}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────── Timeline e registo ───────── */

const TAG: Record<StepState, string> = { pending: "", done: "OK", active: "AGORA", skip: "NÃO NECESSÁRIA", human: "PESSOA" };


function tagClass(state: StepState): string {
  const base = "ml-auto flex-none pt-2 text-[10px] font-semibold tracking-[0.14em] ";
  if (state === "human") return base + "text-warn";
  if (state === "skip") return base + "text-dim";
  return base + "text-accent";
}

export function Timeline({ steps, states }: { steps: Step[]; states: StepState[] }) {
  return (
    <div className="ah-card px-5 py-[18px]">
      <Eyebrow>PERCURSO DA AUTOMAÇÃO</Eyebrow>
      <ol className="m-0 mt-3.5 flex list-none flex-col gap-1 p-0">
        {steps.map((step, i) => (
          <li key={step.id} className="relative flex items-start gap-3 py-2 [&:not(:last-child)]:after:absolute [&:not(:last-child)]:after:left-[16px] [&:not(:last-child)]:after:top-[44px] [&:not(:last-child)]:after:h-[calc(100%-38px)] [&:not(:last-child)]:after:w-px [&:not(:last-child)]:after:bg-line">
            <div className="ah-step" data-state={states[i]}>{String(i + 1).padStart(2, "0")}</div>
            <div className="min-w-0 pt-1.5">
              <div className={"text-sm font-bold " + (states[i] === "pending" ? "text-dim" : "text-fg")}>{step.label}</div>
              {step.description && <div className="text-xs text-dim">{step.description}</div>}
            </div>
            <div className={tagClass(states[i])}>{TAG[states[i]]}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function logLine(ev: ScenarioEvent): string {
  if (ev.tool) return `tool ▸ ${ev.tool}`;
  if (ev.guardrail) return `limite ▸ ${ev.guardrail}`;
  if (ev.type === "system") return ev.text;
  return ev.type === "agent" ? "mensagem do agente" : "mensagem do cliente";
}

export function EventLog({ events }: { events: ScenarioEvent[] }) {
  return (
    <div className="ah-card grow px-5 py-[18px]">
      <Eyebrow>REGISTO DE EVENTOS</Eyebrow>
      <div className="mt-3 flex flex-col gap-1.5 font-mono text-xs text-sys">
        {events.length === 0 && <div className="text-dim">À espera do gatilho…</div>}
        {events.map((ev, i) => (
          <div key={i} className="ah-rise flex gap-2.5">
            <span className="text-dim">{timestamp(i)}</span>
            <span className="min-w-0">{logLine(ev)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── Impacto ───────── */

export function ImpactPanel({
  pack,
  values,
  results,
  onChange,
}: {
  pack: Pack;
  values: Record<string, number>;
  results: Record<string, number>;
  onChange: (key: string, value: number) => void;
}) {
  const { inputs, outputs, disclaimer } = pack.metrics;
  return (
    <section aria-label="Impacto estimado" className="ah-card ah-bar flex flex-wrap gap-7 p-6">
      <div className="min-w-0 flex-[1_1_420px]">
        <Eyebrow>01 / OS SEUS NÚMEROS</Eyebrow>
        <p className="mb-4 mt-1.5 text-[13px] text-mute">Valores de exemplo. Substitua pelos seus.</p>
        <div className="flex flex-col gap-2.5">
          {inputs.map((inp) => {
            const step = inp.step ?? 1;
            const v = values[inp.key] ?? inp.default;
            const set = (n: number) =>
              onChange(inp.key, Math.min(inp.max ?? Infinity, Math.max(inp.min ?? -Infinity, n)));
            return (
              <div key={inp.key} className="flex items-center justify-between gap-3 border-b border-[#12293d] py-2">
                <span className="text-sm">{inp.label}</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => set(v - step)}
                    aria-label={`Diminuir: ${inp.label}`}
                    className="ah-btn-quiet size-11 p-0! text-lg!"
                  >
                    −
                  </button>
                  <span className="min-w-[110px] text-center text-base font-bold">{formatValue(v, inp.unit)}</span>
                  <button
                    type="button"
                    onClick={() => set(v + step)}
                    aria-label={`Aumentar: ${inp.label}`}
                    className="ah-btn-quiet size-11 p-0! text-lg!"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex min-w-0 flex-[1_1_420px] flex-col gap-3.5">
        <Eyebrow>02 / CAPACIDADE, NÃO PROMESSAS</Eyebrow>
        <div className="grid grid-cols-2 gap-3">
          {outputs.map((o, i) => (
            <div key={o.key} className="rounded-xl border border-line bg-panel2/70 p-4">
              <div className={"text-[34px] font-extrabold leading-none tracking-[-0.03em] tabular-nums " + (i === 1 ? "ah-accent" : "")}>
                {formatValue(results[o.key] ?? 0, o.unit)}
              </div>
              <div className="mt-2 text-[13px] text-mute">{o.label}</div>
            </div>
          ))}
        </div>
        <details className="text-xs text-dim">
          <summary className="cursor-pointer text-mute">Como calculamos</summary>
          <ul className="mt-2 flex list-none flex-col gap-1 p-0 font-mono">
            {outputs.map((o) => (
              <li key={o.key}>
                {o.key} = {o.formula}
              </li>
            ))}
          </ul>
        </details>
        <p className="m-0 text-xs text-dim">{disclaimer}</p>
      </div>
    </section>
  );
}

/* ───────── Próximo passo ───────── */

export function Guardrails({ items }: { items: Guardrail[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-label="Limites do agente" className="ah-card ah-bar p-6">
      <Eyebrow>LIMITES DO AGENTE (SEMPRE ATIVOS)</Eyebrow>
      <ul className="m-0 mt-3 grid list-none gap-2.5 p-0 md:grid-cols-2">
        {items.map((g) => (
          <li key={g.id} className="flex gap-3 text-sm text-mute">
            <span className="mt-0.5 inline-flex h-6 flex-none items-center rounded-full border border-warn/40 bg-warn/5 px-2 text-[10px] font-semibold leading-5 tracking-[0.1em] text-warn">
              {g.action.toUpperCase()}
            </span>
            <span>{g.rule}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
