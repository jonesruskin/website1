import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { HandoffScene } from "./handoff-scene";
import { HeroTitle } from "./hero-title";
import { LaneLabel } from "./lane-label";

/** 01 · The hero: display type that stretches on load, and the live handoff beside the pitch. */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-title"
      className="grain relative overflow-x-clip pt-8 pb-16 sm:pt-12 sm:pb-20 lg:pb-24"
    >
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-lanes [mask-image:linear-gradient(to_bottom,transparent_22%,black_52%,transparent)] [--lane-gap:6.5rem] sm:[--lane-gap:8rem]"
      />
      <div className="container-page">
        <LaneLabel n={1}>Start line</LaneLabel>
        <div className="mt-6 sm:mt-8">
          <HeroTitle />
        </div>

        <div className="mt-10 grid gap-10 sm:mt-12 lg:mt-14 lg:grid-cols-12 lg:gap-12">
          <div className="flex animate-in flex-col gap-8 [animation-delay:900ms] [animation-fill-mode:backwards] lg:col-span-5 lg:pt-6">
            <p className="max-w-[34rem] text-lead text-foreground/80">
              Baton passes your users to the next tool they need, and passes theirs to you. One
              script tag. Fair, 1:1 credit exchange. Free.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="rounded-full pr-4 pl-6 font-semibold">
                <Link href="/sign-up">
                  Join the network
                  <ArrowRightIcon aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full px-6">
                <a href="#how">See how it works</a>
              </Button>
            </div>
            <p className="font-mono text-xs leading-relaxed tracking-widest text-muted-foreground uppercase">
              10 starter credits · Free forever on Relay · No card
            </p>
          </div>
          <div className="animate-in [animation-delay:1100ms] [animation-fill-mode:backwards] lg:col-span-7 lg:-mt-40 xl:-mt-52">
            <HandoffScene />
            <p className="mt-3 text-right font-mono text-xs tracking-widest text-muted-foreground uppercase">
              Live demo · illustrative
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
