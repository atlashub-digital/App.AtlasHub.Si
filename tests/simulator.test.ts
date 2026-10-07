import { test } from "node:test";
import assert from "node:assert/strict";
import catalog from "../src/data/catalog.json" with { type: "json" };
import { stepStates, timestamp } from "../src/lib/simulator.ts";
import { initialState, reducer } from "../src/components/simulator/state.ts";
import type { Pack } from "../src/lib/types.ts";

const pack = catalog.packs[0] as unknown as Pack;
const byId = (id: string) => pack.scenarios.find((s) => s.id === id)!;

test("o catálogo é coerente: passos e cenários existem", () => {
  assert.ok(pack.scenarios.length > 0);
  const ids = new Set(pack.steps.map((s) => s.id));
  for (const sc of pack.scenarios) for (const ev of sc.events) assert.ok(ids.has(ev.step), `${sc.id}: ${ev.step}`);
});

test("timeline: tudo pendente antes de começar, tudo feito no fim", () => {
  const sc = byId("confirm");
  assert.ok(stepStates(pack.steps, sc, 0).every((s) => s === "pending"));
  const end = stepStates(pack.steps, sc, sc.events.length);
  assert.ok(end.every((s) => s !== "pending" && s !== "active"));
});

test("timeline: revisão humana 'skip' vs 'required'", () => {
  const i = pack.steps.findIndex((s) => s.id === "human");
  assert.equal(stepStates(pack.steps, byId("confirm"), byId("confirm").events.length)[i], "skip");
  const ex = byId("clinical-exception");
  assert.equal(stepStates(pack.steps, ex, ex.events.length)[i], "human");
});

test("reducer: executar até ao fim marca o cenário como visto e pára", () => {
  const sc = byId("confirm");
  const total = sc.events.length;
  let s = reducer(initialState(pack), { type: "pick", id: sc.id });
  s = reducer(s, { type: "run", total });
  for (let i = 0; i < total + 3; i++) s = reducer(s, { type: "tick", total });
  assert.equal(s.shown, total);
  assert.equal(s.playing, false);
  assert.deepEqual(s.seen, [sc.id]);
});

test("reducer: tick ignorado quando não está a executar; run depois do fim recomeça", () => {
  const total = byId("confirm").events.length;
  let s = initialState(pack);
  assert.equal(reducer(s, { type: "tick", total }).shown, 0);
  s = { ...s, shown: total };
  s = reducer(s, { type: "run", total });
  assert.equal(s.shown, 0);
  assert.equal(s.playing, true);
});

test("reducer: mudar de cenário repõe o ecrã mas mantém os valores e os vistos", () => {
  const total = byId("confirm").events.length;
  let s = reducer(initialState(pack), { type: "value", key: "appointments_per_month", value: 1200 });
  s = reducer(reducer(s, { type: "step", total }), { type: "pick", id: "reschedule" });
  assert.equal(s.shown, 0);
  assert.equal(s.values.appointments_per_month, 1200);
});

test("timestamp", () => {
  assert.equal(timestamp(0), "00:01");
  assert.equal(timestamp(59), "01:00");
});
