import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-ink">
      <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-4 px-8 py-3.5">
        <Link href="/" className="flex items-center gap-2.5 text-xl tracking-tight no-underline">
          <span>
            Atlas<strong className="font-black">Hub</strong>
          </span>
          <span className="rounded bg-accent px-1.5 py-0.5 font-mono text-[11px] tracking-[0.12em] text-accent-ink">
            APP
          </span>
        </Link>
        <nav aria-label="Principal" className="flex gap-6 text-sm">
          <Link href="/" className="pb-1 text-mute no-underline hover:text-fg">
            Packs
          </Link>
          <a
            href="https://atlashub.si"
            className="pb-1 text-mute no-underline hover:text-fg"
          >
            atlashub.si ↗
          </a>
        </nav>
      </div>
    </header>
  );
}
