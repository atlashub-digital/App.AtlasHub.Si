import Link from "next/link";
import { catalogVersion, packs } from "@/lib/catalog";

export default function Home() {
  return (
    <main className="mx-auto flex max-w-[1360px] flex-col gap-10 px-8 pb-20 pt-12">
      <section className="max-w-3xl">
        <p className="font-mono text-xs tracking-[0.16em] text-accent">LABORATÓRIO DE OPERAÇÕES</p>
        <h1 className="mt-3 text-5xl font-black leading-[0.95] tracking-[-0.05em] md:text-7xl">
          VEJA O AGENTE A TRABALHAR NO SEU NEGÓCIO.
        </h1>
        <p className="mt-5 text-lg text-mute">
          A AtlasHub opera e supervisiona colaboradores digitais como serviço gerido. A Clara ajuda a escolher o escopo; experimente uma demonstração antes do assessment. Tudo é simulação com
          dados fictícios: nada é enviado nem executado.
        </p>
      </section>

      <section aria-label="Catálogo de funções geridas" className="space-y-2"><h2 className="text-2xl font-bold">Colaboradores digitais geridos</h2><p>Rececionista Digital, Assistente Comercial e Secretária Administrativa: demonstração. Consultor Imobiliário, Assistente E-commerce, Marketing, Financeiro Administrativo e RH: planeados. Nenhum perfil é anunciado como operacional antes da homologação.</p></section>
      <nav className="flex gap-6"><Link href="/assessment">Falar com a Clara · Assessment</Link><Link href="/portal">Portal do cliente</Link></nav>
      <section aria-label="Packs disponíveis" className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {packs.map((pack) => (
          <Link
            key={pack.id}
            href={`/simulador/${pack.slug}`}
            className="group flex flex-col gap-3 rounded-lg border border-line bg-panel p-6 no-underline transition-colors hover:border-accent"
          >
            <div className="flex items-center justify-between font-mono text-[11px] tracking-[0.14em] text-dim">
              <span>{pack.id}</span>
              <span className="rounded border border-line2 px-2 py-0.5">{pack.status.toUpperCase()}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">{pack.name}</h2>
            <p className="text-sm text-mute">{pack.summary}</p>
            <p className="mt-auto pt-2 text-sm text-accent group-hover:underline">Abrir simulador →</p>
          </Link>
        ))}
      </section>

      <p className="font-mono text-xs text-dim">catálogo v{catalogVersion}</p>
    </main>
  );
}
