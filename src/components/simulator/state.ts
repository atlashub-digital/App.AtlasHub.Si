// Estado do simulador num reducer puro: sem efeitos a mexer em estado, fácil de testar.
import type { Pack } from "@/lib/types";

export interface SimState {
  scenarioId: string;
  shown: number;
  playing: boolean;
  seen: string[];
  values: Record<string, number>;
}

export type SimAction =
  | { type: "pick"; id: string }
  | { type: "run"; total: number }
  | { type: "tick"; total: number }
  | { type: "step"; total: number }
  | { type: "reset" }
  | { type: "value"; key: string; value: number };

export function initialState(pack: Pack): SimState {
  return {
    scenarioId: pack.scenarios[0].id,
    shown: 0,
    playing: false,
    seen: [],
    values: Object.fromEntries(pack.metrics.inputs.map((i) => [i.key, i.default])),
  };
}

function advance(state: SimState, total: number): SimState {
  const shown = Math.min(state.shown + 1, total);
  const done = shown >= total;
  return {
    ...state,
    shown,
    playing: done ? false : state.playing,
    seen: done && !state.seen.includes(state.scenarioId) ? [...state.seen, state.scenarioId] : state.seen,
  };
}

export function reducer(state: SimState, action: SimAction): SimState {
  switch (action.type) {
    case "pick":
      return { ...state, scenarioId: action.id, shown: 0, playing: false };
    case "run":
      return { ...state, shown: state.shown >= action.total ? 0 : state.shown, playing: true };
    case "tick":
      return state.playing ? advance(state, action.total) : state;
    case "step":
      return advance({ ...state, playing: false }, action.total);
    case "reset":
      return { ...state, shown: 0, playing: false };
    case "value":
      return { ...state, values: { ...state.values, [action.key]: action.value } };
  }
}
