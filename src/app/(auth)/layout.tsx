import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { PreviewBanner } from "@/components/site/preview-banner";
import siteConfig from "@/site.config";

/**
 * Auth screens render without the marketing header and footer. On desktop the
 * left half is a bone-paper track with the wordmark stretched across it; the
 * form (each page's AuthCard) sits on the right. On small screens only the form.
 */
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="lg:grid lg:min-h-dvh lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
      <aside
        className="[container-type:inline-size] grain relative hidden overflow-hidden border-r bg-lanes lg:flex lg:flex-col lg:justify-between lg:p-12"
        style={{ "--lane-gap": "6rem" } as CSSProperties}
      >
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-sm font-mono text-xs tracking-widest text-muted-foreground uppercase outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span aria-hidden className="h-3 w-9 rounded-full bg-signal" />
            Back to {siteConfig.name}
          </Link>
        </div>

        <div className="relative flex flex-col gap-8">
          <p
            className="max-w-md font-display text-4xl leading-none font-bold tracking-tight text-balance xl:text-5xl"
            style={{ fontStretch: "80%" }}
          >
            Pass people on at the moment that <span className="accent-serif">matters</span>.
          </p>
          <p
            aria-hidden
            className="-mb-[0.16em] -ml-[0.04em] font-display leading-[0.8] font-black tracking-tighter whitespace-nowrap select-none"
            style={{ fontSize: "29cqi", fontStretch: "125%" }}
          >
            {siteConfig.name}
          </p>
        </div>
      </aside>

      <div className="bg-background lg:bg-card">{children}</div>
      <PreviewBanner />
    </div>
  );
}
