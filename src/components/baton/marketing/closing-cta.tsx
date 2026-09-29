"use client";

import { ArrowRightIcon } from "lucide-react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import Link from "next/link";
import { useRef } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { BatonPill } from "./baton-pill";
import { usePrefersReducedMotion } from "./use-media";
import { useRange } from "./use-range";

/** The closing call: a giant "Pass it on." and the baton landing in the end zone. */
export function ClosingCta() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "start 45%"] });
  // A spring gives the landing its overshoot and settle.
  const eased = useSpring(scrollYProgress, { stiffness: 90, damping: 13, mass: 0.9 });
  const x = useTransform(eased, (v) => `${(reduced ? 1 : v) * 100}%`);
  const glow = useRange(scrollYProgress, [0.82, 1], [0, 1]);

  return (
    <section
      aria-labelledby="closing-title"
      className="tone-inverted grain relative overflow-hidden bg-background py-24 text-foreground sm:py-32 lg:py-44"
    >
      <div className="container-page">
        <p className="flex items-center gap-3 font-mono text-xs tracking-widest whitespace-nowrap uppercase">
          <span className="font-semibold text-signal-ink">Finish</span>
          <span aria-hidden className="h-px w-8 bg-foreground/30 sm:w-14" />
          <span className="text-muted-foreground">End zone</span>
        </p>
        <h2
          id="closing-title"
          className="mt-8 font-display text-[21vw] leading-[0.82] font-extrabold tracking-[-0.055em] min-[1700px]:text-[19rem] sm:text-[16vw] lg:text-[18.5vw]"
        >
          Pass it <span className="accent-serif text-[1.08em] font-normal">on.</span>
        </h2>

        {/* The track to the end zone. */}
        <div
          ref={ref}
          aria-hidden
          className="relative mt-12 h-20 border-y [--zone:min(38%,26rem)] sm:mt-16 sm:h-24"
        >
          <div className="absolute inset-0 bg-[repeating-linear-gradient(to_right,var(--lane)_0,var(--lane)_1px,transparent_1px,transparent_2rem)]" />
          <div className="absolute inset-y-0 right-0 w-(--zone) overflow-hidden border-l-2 border-foreground bg-[repeating-linear-gradient(135deg,transparent_0,transparent_0.5rem,var(--lane)_0.5rem,var(--lane)_0.625rem)]">
            <motion.div
              className="absolute inset-0 bg-signal/25"
              style={{ opacity: reduced ? 1 : glow }}
            />
            <span className="absolute right-3 bottom-2 font-mono text-xs tracking-widest uppercase">
              End zone
            </span>
          </div>
          <motion.div
            className="absolute top-1/2 left-2 z-10 h-0 w-[calc(100%-0.5rem-var(--zone)*0.62-3rem)]"
            style={{ x }}
          >
            <BatonPill
              glow
              className={cn("absolute top-0 left-0 h-6 w-[3rem] -translate-y-1/2 sm:h-7")}
            />
          </motion.div>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-5">
          <Button asChild size="lg" className="h-14 rounded-full pr-5 pl-8 text-lg font-semibold">
            <Link href="/sign-up">
              Join the network
              <ArrowRightIcon aria-hidden className="size-5" />
            </Link>
          </Button>
          <p className="font-mono text-xs leading-relaxed tracking-widest text-muted-foreground uppercase">
            Free forever on Relay · 10 starter credits · One script tag
          </p>
        </div>
      </div>
    </section>
  );
}
