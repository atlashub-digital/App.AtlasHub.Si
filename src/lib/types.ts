// Tipos do catálogo gerado por atlas-agent-packs (dist/catalog.json).
// Mantêm-se à mão em sincronia com docs/PACK-SPEC.md do repositório de packs.

export type PackStatus = "demo" | "pilot" | "ga";
export type EventType = "system" | "agent" | "patient" | "customer" | "staff";
export type HumanReview = "skip" | "required" | "optional";

export interface Step {
  id: string;
  label: string;
  description?: string;
}

export interface ScenarioEvent {
  type: EventType;
  step: string;
  text: string;
  tool?: string;
  guardrail?: string;
}

export interface Scenario {
  id: string;
  label: string;
  description: string;
  humanReview: HumanReview;
  claraAfter?: string;
  events: ScenarioEvent[];
  expect?: { status?: string; handoff?: boolean };
}

export interface MetricInput {
  key: string;
  label: string;
  unit: string;
  default: number;
  min?: number;
  max?: number;
  step?: number;
}

export interface MetricOutput {
  key: string;
  label: string;
  unit?: string;
  formula: string;
}

export interface Metrics {
  inputs: MetricInput[];
  outputs: MetricOutput[];
  disclaimer: string;
}

export interface Guardrail {
  id: string;
  rule: string;
  action: "handoff" | "block" | "log";
}

export interface Integration {
  id: string;
  kind: string;
  required: boolean;
  description: string;
}

export interface ClaraScript {
  intro: string[];
  allDone?: string;
  context?: { label: string; value: string }[];
}

export interface DemoLabels {
  header: string;
  agent: string;
  customer: string;
}

export interface Pack {
  id: string;
  slug: string;
  version: string;
  status: PackStatus;
  name: string;
  summary: string;
  locale: string;
  segments: string[];
  equation: string[];
  channels: string[];
  commercial: { cloud: boolean; onsite: boolean };
  steps: Step[];
  guardrails: Guardrail[];
  integrations: Integration[];
  metrics: Metrics;
  clara?: ClaraScript;
  labels?: DemoLabels;
  scenarios: Scenario[];
  source: string;
}

export interface Catalog {
  catalogVersion: string;
  schemaVersion: 1;
  packs: Pack[];
}
