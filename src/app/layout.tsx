import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import "./mockup.css";

export const metadata: Metadata = {
  title: { default: "AtlasHub App", template: "%s · AtlasHub App" },
  description:
    "Experimente os agentes da AtlasHub no contexto do seu negócio: simulações com dados fictícios, sem execução externa.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt">
      <body className="min-h-screen bg-ink text-fg antialiased">
        {children}
      </body>
    </html>
  );
}
