// Lógica pura do simulador (sem React): fácil de testar.
import type { Scenario, ScenarioEvent, Step } from "./types";

export type StepState = "pending" | "active" | "done" | "skip" | "human";

/** Estado de cada passo da timeline depois de `shown` eventos do cenário. */
export function stepStates(steps: Step[], scenario: Scenario, shown: number): StepState[] {
  const total = scenario.events.length;
  const finished = shown >= total;
  const last =
    shown > 0
      ? steps.findIndex((s) => s.id === scenario.events[Math.min(shown, total) - 1].step)
      : -1;
  return steps.map((step, i) => {
    let state: StepState = "pending";
    if (finished || i < last) state = "done";
    else if (i === last) state = "active";
    if (step.id === "human" && state !== "pending") {
      if (scenario.humanReview === "skip") state = "skip";
      else if (scenario.humanReview === "required") state = "human";
    }
    return state;
  });
}

export function visibleEvents(scenario: Scenario, shown: number): ScenarioEvent[] {
  return scenario.events.slice(0, shown);
}

export function isFinished(scenario: Scenario, shown: number): boolean {
  return shown >= scenario.events.length;
}

/** Marca de tempo fictícia do registo de eventos: 00:01, 00:02… */
export function timestamp(index: number): string {
  const s = index + 1;
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}
