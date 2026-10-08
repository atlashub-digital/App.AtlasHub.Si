import type { CSSProperties } from "react";

// Pixel-faithful rendering of a Visual Pack V1 mockup: the plate (mockup image with the text
// removed) is the background; every line of copy is live text placed on top in mockup
// coordinates; interactive areas are real links. Everything scales with the container
// (container query units), so the composition stays identical at any desktop width.
// Data: src/data/mockups/*.json (generated from the approved mockups — see design/visual-pack-v1).

export type MockText = {
  t: string; // text; {…} marks an accent-coloured span
  x: number;
  y: number;
  s: number; // font-size in mockup px
  w: number; // font-weight
  f: "figtree" | "bsc";
  c: string;
  a?: string;
  ls?: number;
  tag?: "h1" | "h2" | "h3" | "span";
};
export type MockLink = { r: number[]; href: string; label: string };
export type MockScreen = {
  id: string;
  title: string;
  W: number;
  H: number;
  bg: string;
  items: MockText[];
  links: MockLink[];
};

function Parts({ text, accent }: { text: string; accent?: string }) {
  const out: React.ReactNode[] = [];
  let i = 0;
  for (const m of text.matchAll(/\{([^}]*)\}|([^{}]+)/g)) {
    if (m[1] !== undefined) out.push(<span key={i++} style={{ color: accent }}>{m[1]}</span>);
    else out.push(m[2]);
  }
  return <>{out}</>;
}

type Vars = CSSProperties & Record<`--${string}`, string | number>;

export default function MockupCanvas({ screen, priority = true }: { screen: MockScreen; priority?: boolean }) {
  const { W, H } = screen;
  return (
    <div className="mk" data-mockup={screen.id}>
      <div className="mk-stage" style={{ aspectRatio: `${W} / ${H}`, "--W": W } as Vars}>
        {/* eslint-disable-next-line @next/next/no-img-element -- static plate, sized by the stage */}
        <img className="mk-bg" src={screen.bg} alt="" width={W} height={H} fetchPriority={priority ? "high" : "auto"} decoding="async" />
        {screen.items.map((it, i) => {
          const Tag = it.tag ?? "p";
          const style: Vars = {
            "--x": it.x,
            "--y": it.y,
            "--s": it.s,
            "--ls": it.ls ?? 0,
            fontWeight: it.w,
            color: it.c,
          };
          return (
            <Tag key={i} className={it.f === "bsc" ? "mk-t mk-c" : "mk-t"} style={style}>
              <Parts text={it.t} accent={it.a} />
            </Tag>
          );
        })}
        {screen.links.map((l, i) => {
          const [x1, y1, x2, y2] = l.r;
          const style: Vars = { "--x": x1, "--y": y1, "--lw": x2 - x1, "--lh": y2 - y1 };
          const external = /^https?:/.test(l.href);
          return (
            <a key={`l${i}`} className="mk-a" href={l.href} aria-label={l.label} style={style} {...(external ? { rel: "noopener" } : {})}>
              <span className="mk-sr">{l.label}</span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
