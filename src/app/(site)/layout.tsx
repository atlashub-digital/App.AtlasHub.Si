import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";

// Classic app pages (catalog, simulators, assessment, portal): shared header.
export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <div className="ah-page">{children}</div>
    </>
  );
}
