import { ArrowLeftIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { RollingPill } from "@/components/baton/marketing/rolling-pill";
import { SiteShell } from "@/components/site/site-shell";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <SiteShell>
      <section className="grain relative flex min-h-[70dvh] flex-col justify-center overflow-hidden py-16 sm:py-24">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-lanes mask-y-from-60% mask-y-to-100% [--lane-gap:6rem]"
        />
        <div className="container-page">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            <span className="font-semibold text-signal-ink">404</span> · Off the track
          </p>
          <h1 className="mt-6 font-display text-[16vw] leading-[0.86] font-extrabold tracking-[-0.055em] text-balance sm:text-[12vw] lg:text-[10rem]">
            Dropped the <span className="accent-serif text-[1.1em] font-normal">baton.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lead text-muted-foreground">
            This page isn&apos;t on the track. Someone fumbled the handoff, and the link rolled
            away. Let&apos;s get you back in your lane.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full pr-6 pl-5 font-semibold">
              <Link href="/">
                <ArrowLeftIcon aria-hidden />
                Pass it back home
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full px-6">
              <Link href="/#how">See how it works</Link>
            </Button>
          </div>
        </div>
        <div className="mt-16 sm:mt-24">
          <RollingPill />
        </div>
      </section>
    </SiteShell>
  );
}
