import type { ReactNode } from "react";

import { SmoothScroll } from "@/components/baton/marketing/smooth-scroll";
import { SiteShell } from "@/components/site/site-shell";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <SiteShell>
      <SmoothScroll />
      {children}
    </SiteShell>
  );
}
