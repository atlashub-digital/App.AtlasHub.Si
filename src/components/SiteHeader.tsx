"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { whatsappLink } from "@/config/site";

const NAV = [
  { href: "/", label: "Painel" },
  { href: "/biblioteca", label: "Biblioteca" },
  { href: "/packs", label: "Simuladores" },
];

/** Marca como nas maquetes: símbolo oficial + ATLASHUB.SI / AI WORKFORCE. */
export function Brand() {
  return (
    <Link href="/" aria-label="AtlasHub.SI — painel" className="flex min-h-11 items-center gap-3 no-underline">
      <Image
        src="/assets/atlashub-logo.webp"
        width={40}
        height={40}
        alt=""
        priority
        className="rounded-full shadow-[0_0_18px_rgba(22,216,237,0.35)]"
      />
      <span className="flex flex-col leading-none">
        <strong className="text-[19px] font-extrabold tracking-[0.06em] text-fg">
          ATLASHUB<span className="text-accent">.SI</span>
        </strong>
        <small className="mt-1.5 text-[9px] font-semibold tracking-[0.34em] text-[#9fb5cb]">AI WORKFORCE</small>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const path = usePathname();
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-ink/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1360px] flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 sm:gap-x-8 py-3 sm:px-8">
        <Brand />
        <nav aria-label="Principal" className="order-3 flex w-full gap-7 sm:order-none sm:w-auto">
          {NAV.map((item) => {
            const on = item.href === "/" ? path === "/" : path.startsWith(item.href) || (item.href === "/packs" && path.startsWith("/simulador"));
            return (
              <Link key={item.href} href={item.href} className="ah-nav-link" aria-current={on ? "page" : undefined}>
                {item.label}
              </Link>
            );
          })}
          <a href="https://atlashub.si" className="ah-nav-link hidden md:inline">
            atlashub.si ↗
          </a>
        </nav>
        <a
          href={whatsappLink("Olá, equipa AtlasHub. Estou a explorar a plataforma e gostaria de falar convosco.")}
          target="_blank"
          rel="noopener noreferrer"
          className="ah-btn min-h-10! px-4! text-[15px]! sm:min-h-11! sm:px-5! sm:text-base!"
        >
          Falar connosco
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14M13 6l6 6-6 6" />
          </svg>
        </a>
      </div>
    </header>
  );
}
