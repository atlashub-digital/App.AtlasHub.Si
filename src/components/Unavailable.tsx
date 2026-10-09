import Link from "next/link";

/** Honest state for a server-backed feature that is not available in this deployment (go-live rule). */
export function Unavailable({ eyebrow, title, text, whatsapp, cta, bare = false }: { eyebrow: string; title: string; text: string; whatsapp: string; cta: string; bare?: boolean }) {
  return (
    <div className={bare ? "" : "ah-card ah-bar ah-rise p-6 sm:p-8"} role="status">
      <p className="ah-eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-mute">{text}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="ah-btn">
          {cta} ↗
        </a>
        <Link href="/packs" className="ah-btn-quiet">
          Ver os simuladores
        </Link>
      </div>
      <p className="mt-4 text-xs text-dim">O WhatsApp abre com uma mensagem para rever e enviar. Nada é enviado automaticamente.</p>
    </div>
  );
}
