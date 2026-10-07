import type { Guardrail, Pack, Scenario, ScenarioEvent, Step } from "@/lib/types";
import { formatValue } from "@/lib/format";
import { timestamp, type StepState } from "@/lib/simulator";

export function Eyebrow({ children }: { children: string }) {
  return <div className="font-mono text-[11px] tracking-[0.16em] text-dim">{children}</div>;
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
      className="flex min-w-0 max-w-[380px] flex-[1_1_300px] flex-col rounded-lg border border-line bg-panel"
    >
      <div className="flex items-center gap-3 border-b border-line px-5 py-4">
        <div className="flex size-10 items-center justify-center rounded-full border border-accent bg-panel2 font-black text-accent">
          C
        </div>
        <div>
          <div className="font-bold">Clara</div>
          <div className="text-xs text-mute">Orquestra a simulação · AtlasHub</div>
        </div>
      </div>
      <div className="flex grow flex-col gap-3 px-5 py-4">
        {messages.map((text) => (
          <div
            key={text}
            className="rounded-[8px_8px_8px_2px] border border-line bg-panel2 px-3.5 py-3 text-sm text-fg"
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
                className="min-h-11 cursor-pointer rounded-lg border border-accent bg-transparent px-3.5 py-2 text-[13px] text-fg hover:bg-panel2"
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
    <div className="flex min-w-0 flex-[999_1_520px] flex-col rounded-lg border border-line bg-panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5">
        <div>
          <div className="font-bold">{pack.labels?.header ?? pack.name}</div>
          <div className="text-xs text-mute">{scenario.description}</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRun}
            className="flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border-0 bg-accent px-[18px] py-2.5 text-sm font-bold text-accent-ink"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="6 4 20 12 6 20 6 4" />
            </svg>
            {runLabel}
          </button>
          <button
            type="button"
            onClick={onStep}
            className="min-h-11 cursor-pointer rounded-lg border border-line2 bg-transparent px-3.5 py-2.5 text-sm text-fg hover:bg-panel2"
          >
            Passo a passo
          </button>
          <button
            type="button"
            onClick={onReset}
            aria-label="Repor simulação"
            className="flex size-11 cursor-pointer items-center justify-center rounded-lg border border-line2 bg-transparent text-fg hover:bg-panel2"
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
        className="flex max-h-[560px] min-h-[460px] grow flex-col gap-2.5 overflow-y-auto bg-chat p-5"
      >
        {events.length === 0 && (
          <div className="m-auto max-w-[340px] text-center text-dim">
            <div className="font-mono text-xs tracking-[0.16em] text-accent">PRONTO</div>
            <p className="mt-2">Carregue em Executar para ver a simulação, ou avance passo a passo.</p>
          </div>
        )}
        {events.map((ev, i) => {
          if (ev.type === "system") {
            return (
              <div key={i} className="flex justify-center">
                <div className="max-w-[90%] rounded-md border border-dashed border-line bg-panel2 px-2.5 py-1 text-center font-mono text-[11.5px] text-sys">
                  {ev.text}
                </div>
              </div>
            );
          }
          const agent = ev.type === "agent";
          return (
            <div key={i} className={agent ? "flex justify-end" : "flex justify-start"}>
              <div
                className={
                  "max-w-[74%] border px-3.5 py-2.5 text-sm " +
                  (agent
                    ? "rounded-[10px_10px_2px_10px] border-agent-line bg-agent-bg"
                    : "rounded-[10px_10px_10px_2px] border-line bg-user-bg")
                }
              >
                <div className={"mb-0.5 font-mono text-[11px] tracking-[0.06em] " + (agent ? "text-accent" : "text-mute")}>
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

function dotClass(state: StepState): string {
  const base =
    "flex size-[30px] flex-none items-center justify-center rounded-full font-mono text-[11px] font-bold ";
  switch (state) {
    case "done":
    case "active":
      return base + "bg-accent text-accent-ink";
    case "human":
      return base + "bg-warn text-accent-ink";
    case "skip":
      return base + "border border-dim text-dim";
    default:
      return base + "border border-line2 text-dim";
  }
}

function tagClass(state: StepState): string {
  const base = "ml-auto flex-none font-mono text-[10px] tracking-[0.1em] ";
  if (state === "human") return base + "text-warn";
  if (state === "skip") return base + "text-dim";
  return base + "text-accent";
}

export function Timeline({ steps, states }: { steps: Step[]; states: StepState[] }) {
  return (
    <div className="rounded-lg border border-line bg-panel px-5 py-[18px]">
      <Eyebrow>PERCURSO DA AUTOMAÇÃO</Eyebrow>
      <ol className="m-0 mt-3.5 flex list-none flex-col gap-1 p-0">
        {steps.map((step, i) => (
          <li key={step.id} className="flex items-start gap-3 py-2">
            <div className={dotClass(states[i])}>{String(i + 1).padStart(2, "0")}</div>
            <div className="min-w-0">
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
    <div className="grow rounded-lg border border-line bg-panel px-5 py-[18px]">
      <Eyebrow>REGISTO DE EVENTOS</Eyebrow>
      <div className="mt-3 flex flex-col gap-1.5 font-mono text-xs text-sys">
        {events.length === 0 && <div className="text-dim">À espera do gatilho…</div>}
        {events.map((ev, i) => (
          <div key={i} className="flex gap-2.5">
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
    <section aria-label="Impacto estimado" className="flex flex-wrap gap-7 rounded-lg border border-line bg-panel p-6">
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
                    className="size-11 cursor-pointer rounded-lg border border-line2 bg-panel2 text-lg text-fg hover:border-accent"
                  >
                    −
                  </button>
                  <span className="min-w-[110px] text-center text-base font-bold">{formatValue(v, inp.unit)}</span>
                  <button
                    type="button"
                    onClick={() => set(v + step)}
                    aria-label={`Aumentar: ${inp.label}`}
                    className="size-11 cursor-pointer rounded-lg border border-line2 bg-panel2 text-lg text-fg hover:border-accent"
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
            <div key={o.key} className="rounded-lg bg-panel2 p-4">
              <div className={"text-[34px] font-black leading-none tracking-[-0.04em] " + (i === 1 ? "text-accent" : "")}>
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
    <section aria-label="Limites do agente" className="rounded-lg border border-line bg-panel p-6">
      <Eyebrow>LIMITES DO AGENTE (SEMPRE ATIVOS)</Eyebrow>
      <ul className="m-0 mt-3 grid list-none gap-2.5 p-0 md:grid-cols-2">
        {items.map((g) => (
          <li key={g.id} className="flex gap-3 text-sm text-mute">
            <span className="mt-0.5 flex-none rounded border border-line2 px-1.5 font-mono text-[10px] leading-5 tracking-[0.08em] text-warn">
              {g.action.toUpperCase()}
            </span>
            <span>{g.rule}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
