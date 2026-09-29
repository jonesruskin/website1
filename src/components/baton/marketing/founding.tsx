import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { LaneLabel } from "./lane-label";

/** 08 · Founding makers: an honest band. No counts of who joined, just the offer. */
export function Founding() {
  return (
    <section
      aria-labelledby="founding-title"
      className="tone-inverted grain relative overflow-hidden bg-background py-24 text-foreground sm:py-32 lg:py-40"
    >
      <div className="container-page">
        <LaneLabel n={8}>Founding makers</LaneLabel>
        <div className="mt-8 grid gap-12 lg:grid-cols-12 lg:items-end lg:gap-16">
          <div className="lg:col-span-7">
            <h2
              id="founding-title"
              className="font-display text-[clamp(2.75rem,8.6vw,7.5rem)] leading-[0.88] font-extrabold tracking-[-0.045em]"
            >
              The first <span className="accent-serif text-[1.14em] font-normal">100</span> tools.
            </h2>
            <p className="mt-8 max-w-xl text-lead text-foreground/80">
              We&apos;re opening the network to the first 100 tools. Founding makers keep the free
              Relay plan&apos;s 1:1 exchange forever and get double starter credits.
            </p>
            <dl className="mt-10 grid max-w-xl grid-cols-2 gap-x-6 gap-y-6 border-t pt-6 font-mono text-xs tracking-widest uppercase">
              <div>
                <dt className="text-muted-foreground">Starter credits</dt>
                <dd className="mt-1 font-display text-4xl font-extrabold tracking-tight text-signal normal-case">
                  20
                </dd>
                <dd className="mt-1 text-muted-foreground">Double the usual 10</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">The exchange</dt>
                <dd className="mt-1 font-display text-4xl font-extrabold tracking-tight text-signal normal-case">
                  1:1
                </dd>
                <dd className="mt-1 text-muted-foreground">Yours forever on Relay</dd>
              </div>
            </dl>
            <div className="mt-10">
              <Button asChild size="lg" className="rounded-full pr-4 pl-6 font-semibold">
                <Link href="/sign-up">
                  Claim a founding lane
                  <ArrowRightIcon aria-hidden />
                </Link>
              </Button>
            </div>
          </div>

          {/* One hundred starting blocks, one baton each. */}
          <div aria-hidden className="lg:col-span-5">
            <div className="grid grid-cols-10 gap-x-2 gap-y-3 sm:gap-x-3 sm:gap-y-4">
              {Array.from({ length: 100 }, (_, i) => (
                <span
                  key={i}
                  className={
                    i === 99
                      ? "h-2 animate-signal-pulse rounded-full bg-signal"
                      : "h-2 rounded-full bg-foreground/20"
                  }
                />
              ))}
            </div>
            <p className="mt-5 flex justify-between font-mono text-xs tracking-widest text-muted-foreground uppercase">
              <span>100 lanes</span>
              <span>One tool each</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
