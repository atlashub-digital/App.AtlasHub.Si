import type { Metadata } from "next";
import MockupCanvas, { type MockScreen } from "@/components/MockupCanvas";
import library from "@/data/mockups/agent-library.json";

export const metadata: Metadata = { title: "Biblioteca de Agentes" };

// Visual Pack V1 · 04 — Employee Factory: Biblioteca de Agentes (dados ilustrativos).
export default function AgentLibrary() {
  return (
    <main>
      <h1 className="mk-sr">Employee Factory — Biblioteca de Agentes</h1>
      <MockupCanvas screen={library as MockScreen} />
    </main>
  );
}
