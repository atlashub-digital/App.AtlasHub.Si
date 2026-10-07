import { test } from "node:test";
import assert from "node:assert/strict";
import catalog from "../src/data/catalog.json" with { type: "json" };
import { evaluateMetrics, parse } from "../src/lib/metrics.ts";

const pack = catalog.packs.find((p) => p.id === "PACK-001")!;

test("PACK-001: valores de exemplo (têm de coincidir com atlas-agent-packs)", () => {
  const r = evaluateMetrics(pack.metrics as never);
  assert.equal(r.no_shows, 96);
  assert.equal(r.recovered_appointments, 29);
  assert.equal(r.recovered_revenue, 5800);
  assert.equal(r.manual_hours, 40);
});

test("inputs limitados a min/max", () => {
  const r = evaluateMetrics(pack.metrics as never, { appointments_per_month: 1000, no_show_rate: 500 });
  assert.equal(r.no_show_rate, 60);
  assert.equal(r.no_shows, 600);
});

test("o avaliador recusa código", () => {
  assert.throws(() => parse("process.exit(1)"));
  assert.throws(() => parse("a; b"));
  assert.throws(() => parse("foo(1)"));
});
