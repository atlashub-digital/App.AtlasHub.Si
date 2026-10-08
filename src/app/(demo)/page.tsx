import type { Metadata } from "next";
import MockupCanvas, { type MockScreen } from "@/components/MockupCanvas";
import dashboard from "@/data/mockups/dashboard.json";

export const metadata: Metadata = { title: "Início" };

// Visual Pack V1 · 05 — App: painel da operação (dados ilustrativos).
export default function Dashboard() {
  return (
    <main>
      <h1 className="mk-sr">Painel da operação — Bem-vinda, Ana</h1>
      <MockupCanvas screen={dashboard as MockScreen} />
    </main>
  );
}
