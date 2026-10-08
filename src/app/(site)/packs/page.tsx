import Link from "next/link";
import type { CSSProperties } from "react";
import { whatsappLink } from "@/config/site";
import { catalogVersion, packs } from "@/lib/catalog";

export const metadata = { title: "Simuladores · AtlasHub" };

export default function Packs() {
  return (
    <main className="mx-auto flex max-w-[1360px] flex-col gap-12 px-4 pb-24 pt-12 sm:px-8 md:pt-16">
      <section className="grid items-end gap-8 lg:grid-cols-[1.3fr_1fr]">
        <div className="ah-rise">
          <p className="ah-eyebrow">Laboratório de operações</p>
          <h1 className="mt-4 text-[clamp(38px,5.4vw,72px)] font-extrabold leading-[1.02] tracking-[-0.035em]">
            Veja o agente a trabalhar.
            <br />
            <span className="ah-accent">No seu negócio.</span>
          </h1>
          <p className="mt-6 max-w-[640px] text-lg text-mute">
            A AtlasHub opera e supervisiona colaboradores digitais como serviço gerido. Escolha uma função, execute a
            simulação e veja cada passo, cada limite e o impacto estimado. Tudo é simulação com dados fictícios: nada é
            enviado nem executado.
          </p>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <a href="#simuladores" className="ah-btn">
              Escolher um simulador
              <Arrow />
            </a>
            <Link href="/assessment" className="ah-btn-ghost">
              Falar com a Clara · Assessment
              <Arrow />
            </Link>
          </div>
        </div>
        <aside className="ah-card ah-bar ah-rise p-6" style={{ "--d": "0.12s" } as CSSProperties}>
          <h2 className="text-xl font-bold">Colaboradores digitais geridos</h2>
          <p className="mt-2 text-sm text-mute">
            Oito colaboradores em demonstração. Em cada um, as ações com impacto externo exigem aprovação humana.
            Nenhum perfil é anunciado como operacional antes da homologação.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <Link href="/portal" className="ah-btn-quiet">
              Portal do cliente
            </Link>
            <a
              href={whatsappLink("Olá, equipa AtlasHub. Vi os simuladores e gostaria de falar sobre um caso da minha empresa.")}
              target="_blank"
              rel="noopener noreferrer"
              className="ah-btn-quiet"
            >
              WhatsApp ↗
            </a>
          </div>
        </aside>
      </section>

      <section id="simuladores" aria-label="Simuladores disponíveis" className="scroll-mt-28">
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-2xl font-bold tracking-[-0.02em]">Escolha um colaborador digital</h2>
          <span className="ah-chip text-warn">
            <span className="ah-dot" aria-hidden="true" />
            Demonstração · dados fictícios
          </span>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {packs.map((pack, i) => (
            <Link
              key={pack.id}
              href={`/simulador/${pack.slug}`}
              className="ah-card ah-card-link ah-rise group flex flex-col gap-3 p-6 no-underline"
              style={{ "--d": `${0.05 * i + 0.1}s` } as CSSProperties}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-semibold tracking-[0.2em] text-cyan3">{pack.id}</span>
                <span className="ah-chip text-[11px] text-mute">{pack.status.toUpperCase()}</span>
              </div>
              <h3 className="text-[22px] font-bold leading-tight tracking-[-0.02em]">{pack.name}</h3>
              <p className="text-sm text-mute">{pack.summary}</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {pack.segments.slice(0, 3).map((s) => (
                  <span key={s} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-dim">
                    {s}
                  </span>
                ))}
              </div>
              <span className="mt-auto inline-flex items-center gap-2 pt-3 text-sm font-semibold text-cyan3 transition-[gap] group-hover:gap-3">
                Abrir simulador <Arrow />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <p className="text-xs text-dim">Catálogo v{catalogVersion}</p>
    </main>
  );
}

function Arrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
