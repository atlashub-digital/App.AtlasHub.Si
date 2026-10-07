"use client";

import { useEffect, useMemo, useReducer, useRef, useState } from "react";
import { OFFER, PRICE_PENDING, whatsappLink } from "@/config/site";
import { formatValue } from "@/lib/format";
import { evaluateMetrics } from "@/lib/metrics";
import { isFinished, stepStates, visibleEvents } from "@/lib/simulator";
import type { Pack } from "@/lib/types";
import { ChatPanel, ClaraPanel, EventLog, Eyebrow, Guardrails, ImpactPanel, Timeline } from "./parts";
import { initialState, reducer } from "./state";

/** Intervalo entre eventos na execução automática. */
const SPEED_MS = 900;

export function Simulator({ pack }: { pack: Pack }) {
  const [state, dispatch] = useReducer(reducer, pack, initialState);
  const [copied, setCopied] = useState(false);
  const chatRef = useRef<HTMLDivElement | null>(null);

  const scenario = pack.scenarios.find((s) => s.id === state.scenarioId) ?? pack.scenarios[0];
  const total = scenario.events.length;
  const finished = isFinished(scenario, state.shown);
  const events = visibleEvents(scenario, state.shown);
  const states = stepStates(pack.steps, scenario, state.shown);
  const results = useMemo(() => evaluateMetrics(pack.metrics, state.values), [pack.metrics, state.values]);

  // Execução automática: o reducer pára sozinho no último evento.
  useEffect(() => {
    if (!state.playing) return;
    const t = setInterval(() => dispatch({ type: "tick", total }), SPEED_MS);
    return () => clearInterval(t);
  }, [state.playing, total]);

  // Mantém a conversa no fim.
  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [state.shown]);

  // Clara: abertura do pack + frase do cenário que acabou + sugestões dos que faltam ver.
  const unseen = pack.scenarios.filter((s) => s.id !== scenario.id && !state.seen.includes(s.id));
  const claraMessages: string[] = [...(pack.clara?.intro ?? [`Preparei o pack ${pack.name}. Carregue em Executar.`])];
  if (finished && scenario.claraAfter) claraMessages.push(scenario.claraAfter);
  if (finished && unseen.length === 0 && pack.clara?.allDone) claraMessages.push(pack.clara.allDone);
  const quick = finished
    ? unseen.map((s) => ({ id: s.id, label: `Testar: ${s.label}`, onPick: () => dispatch({ type: "pick", id: s.id }) }))
    : [];

  const summary = buildSummary(pack, scenario.label, state.values, results);

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="mx-auto flex max-w-[1360px] flex-col gap-7 px-8 pb-[72px] pt-10">
      <section className="flex flex-wrap items-end justify-between gap-6">
        <div className="min-w-0 flex-[1_1_560px]">
          <div className="font-mono text-xs tracking-[0.16em] text-accent">
            LABORATÓRIO DE OPERAÇÕES / {pack.id} · {pack.segments.join(" · ").toUpperCase()}
          </div>
          <h1 className="mb-2.5 mt-2.5 text-5xl font-black uppercase leading-[0.95] tracking-[-0.05em] md:text-6xl">
            {pack.name}.
          </h1>
          <p className="m-0 max-w-[640px] text-[17px] text-mute">{pack.summary}</p>
        </div>
        <div className="flex flex-col items-start gap-3">
          <span className="rounded-md border border-[#6b4a12] px-2.5 py-1.5 font-mono text-[11px] tracking-[0.14em] text-warn">
            SIMULAÇÃO · DADOS FICTÍCIOS · SEM EXECUÇÃO EXTERNA
          </span>
          <div role="group" aria-label="Cenário" className="flex flex-wrap gap-2">
            {pack.scenarios.map((s) => {
              const on = s.id === scenario.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => dispatch({ type: "pick", id: s.id })}
                  className={
                    "min-h-11 cursor-pointer rounded-lg border px-4 py-2.5 text-sm " +
                    (on
                      ? "border-accent bg-accent font-bold text-accent-ink"
                      : "border-line2 bg-panel text-fg hover:border-accent")
                  }
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="flex flex-wrap items-stretch gap-5">
        <ClaraPanel pack={pack} messages={claraMessages} quick={quick} />
        <ChatPanel
          pack={pack}
          scenario={scenario}
          events={events}
          playing={state.playing}
          finished={finished}
          onRun={() => dispatch({ type: "run", total })}
          onStep={() => dispatch({ type: "step", total })}
          onReset={() => dispatch({ type: "reset" })}
          scrollRef={chatRef}
        />
        <div className="flex min-w-0 max-w-[400px] flex-[1_1_320px] flex-col gap-5">
          <Timeline steps={pack.steps} states={states} />
          <EventLog events={events} />
        </div>
      </section>

      <ImpactPanel
        pack={pack}
        values={state.values}
        results={results}
        onChange={(key, value) => dispatch({ type: "value", key, value })}
      />

      <Guardrails items={pack.guardrails} />

      <section aria-label="Próximo passo" className="flex flex-wrap gap-5">
        {pack.commercial.cloud && (
          <ModeCard
            tag="CLOUD"
            tagClass="text-accent"
            title="Ativar na nossa infraestrutura."
            text="O mesmo pack que acabou de testar, ligado aos seus sistemas e ao seu WhatsApp. Acompanhamento mensal das métricas."
            price={OFFER.cloud.priceLabel ?? PRICE_PENDING}
          />
        )}
        {pack.commercial.onsite && (
          <ModeCard
            tag="PRESENCIAL"
            tagClass="text-warn"
            title="Implementar com a sua equipa."
            text="Um responsável de produto na sua empresa: diagnóstico, regras, configuração e acompanhamento. Depois, pode passar para Cloud."
            price={OFFER.onsite.priceLabel ?? PRICE_PENDING}
          />
        )}
        <div className="flex min-w-0 flex-[1_1_300px] flex-col justify-center gap-3 rounded-lg border border-accent bg-panel2 p-[22px]">
          <div className="text-[17px] font-bold">Medir isto com os seus números reais</div>
          <a
            href={whatsappLink(`Olá, equipa AtlasHub. Gostaria de marcar um AI Business Assessment.\n\n${summary}`)}
            className="flex min-h-11 items-center justify-center rounded-lg bg-accent font-bold text-accent-ink no-underline"
          >
            Marcar AI Business Assessment →
          </a>
          <button
            type="button"
            onClick={copySummary}
            className="min-h-11 cursor-pointer rounded-lg border border-line2 bg-transparent text-sm text-fg hover:border-accent"
          >
            {copied ? "Resumo copiado" : "Copiar resumo da simulação"}
          </button>
          <p className="m-0 text-xs text-dim">
            O botão abre o WhatsApp com uma mensagem para rever e enviar. Nada é enviado automaticamente.
          </p>
        </div>
      </section>
    </main>
  );
}

function ModeCard({
  tag,
  tagClass,
  title,
  text,
  price,
}: {
  tag: string;
  tagClass: string;
  title: string;
  text: string;
  price: string;
}) {
  return (
    <div className="min-w-0 flex-[1_1_360px] rounded-lg border border-line bg-panel p-[22px]">
      <Eyebrow>{tag}</Eyebrow>
      <h2 className={"mb-2 mt-1.5 text-[26px] font-black tracking-[-0.035em] " + tagClass}>{title}</h2>
      <p className="m-0 mb-3.5 text-sm text-mute">{text}</p>
      <div className="text-sm text-dim">{price}</div>
    </div>
  );
}

function buildSummary(
  pack: Pack,
  scenarioLabel: string,
  values: Record<string, number>,
  results: Record<string, number>,
): string {
  const ins = pack.metrics.inputs.map((i) => `- ${i.label}: ${formatValue(values[i.key] ?? i.default, i.unit)}`);
  const outs = pack.metrics.outputs.map((o) => `- ${o.label}: ${formatValue(results[o.key] ?? 0, o.unit)}`);
  return [
    `Simulação · ${pack.name} (${pack.id} v${pack.version}) · cenário «${scenarioLabel}»`,
    "",
    "Os meus números:",
    ...ins,
    "",
    "Resultado (hipótese):",
    ...outs,
    "",
    pack.metrics.disclaimer,
  ].join("\n");
}
