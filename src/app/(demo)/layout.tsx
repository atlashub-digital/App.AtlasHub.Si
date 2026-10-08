import type { ReactNode } from "react";

const showBadge = process.env.NEXT_PUBLIC_DEMO_BADGE !== "off";

// Visual Pack V1 screens rendered 1:1 from the approved mockups, with illustrative data.
export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      {showBadge && <p className="mk-badge">Demonstração · dados ilustrativos</p>}
    </>
  );
}
