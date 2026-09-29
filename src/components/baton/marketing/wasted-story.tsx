"use client";

import { CheckIcon, DownloadIcon } from "lucide-react";
import { motion, useScroll, useTransform, type MotionValue, type MotionStyle } from "motion/react";
import { useRef } from "react";

import { cn } from "@/lib/utils";

import { BatonCard } from "./baton-card";
import { BatonPill } from "./baton-pill";
import { LaneLabel } from "./lane-label";
import { usePrefersReducedMotion } from "./use-media";
import { useRange } from "./use-range";

const TABS = 8;
/** Progress at which the last tab closes, and the first tab starts to close. */
const CLOSE_FROM = 0.34;
const CLOSE_TO = 0.6;

/** A browser tab that closes as the story passes its moment (last tab closes first). */
function Tab({ p, index, reduced }: { p: MotionValue<number>; index: number; reduced: boolean }) {
  const span = (CLOSE_TO - CLOSE_FROM) / TABS;
  const start = CLOSE_FROM + (TABS - 1 - index) * span;
  // Tabs keep their slot and shrink from the left edge with a transform: no layout shift.
  const scaleX = useRange(p, [start, start + span * 0.9], [1, 0]);
  const opacity = useRange(p, [start, start + span * 0.9], [1, 0]);
  return (
    <motion.span
      style={reduced ? { scaleX: 0, opacity: 0 } : { scaleX, opacity }}
      className={
        index === 0
          ? "flex h-8 w-[4.5rem] shrink-0 origin-left items-center gap-1.5 overflow-hidden rounded-t-md border border-b-0 bg-card px-2"
          : "flex h-7 w-[4.5rem] shrink-0 origin-left items-center gap-1.5 self-end overflow-hidden rounded-t-md bg-background/70 px-2"
      }
    >
      <span className="size-2 shrink-0 rounded-full bg-muted-foreground/60" />
      <span className="h-1.5 w-8 shrink-0 rounded-full bg-muted-foreground/30" />
    </motion.span>
  );
}

const beat =
  "col-start-1 row-start-1 font-display leading-[0.9] tracking-[-0.045em] text-[15vw] sm:text-[11vw] lg:text-[7.4vw] motion-reduce:col-auto motion-reduce:row-auto";

/** 02 · The wasted moment: a scroll-pinned story in three beats. */
export function WastedStory() {
  const ref = useRef<HTMLElement>(null);
  const reduced = usePrefersReducedMotion();
  const { scrollYProgress: p } = useScroll({ target: ref, offset: ["start start", "end end"] });

  // Beat visibility.
  const o1 = useRange(p, [0, 0.26, 0.32], [1, 1, 0]);
  const y1 = useRange(p, [0, 0.26, 0.32], [0, 0, -36]);
  const o2 = useRange(p, [0.34, 0.4, 0.56, 0.62], [0, 1, 1, 0]);
  const y2 = useRange(p, [0.34, 0.4, 0.56, 0.62], [36, 0, 0, -36]);
  const o3 = useRange(p, [0.64, 0.72, 1], [0, 1, 1]);
  const y3 = useRange(p, [0.64, 0.72, 1], [36, 0, 0]);

  // The screen: dims, counts tabs down, then relights with a card.
  const dim = useRange(p, [0.3, 0.36, 0.6, 0.7], [0, 0.96, 0.96, 0.9]);
  const buttonOpacity = useRange(p, [0.6, 0.7], [1, 0]);
  const counterOpacity = useRange(p, [0.34, 0.4, 0.56, 0.62], [0, 1, 1, 0]);
  const tabsOpen = useRange(p, [CLOSE_FROM, CLOSE_TO], [TABS, 0]);
  const count = useTransform(tabsOpen, (v) => String(Math.round(v)).padStart(2, "0"));
  const cardOpacity = useRange(p, [0.68, 0.8], [0, 1]);
  const cardY = useRange(p, [0.68, 0.8], [56, 0]);
  const nextTabY = useRange(p, [0.7, 0.8], [12, 0]);
  const nextTabO = useRange(p, [0.7, 0.8], [0, 1]);
  const laneScale = p;
  const pillX = useTransform(p, (v) => `${v * 100}%`);

  const fixed = (moving: MotionValue<number>, value: number): MotionStyle["opacity"] =>
    reduced ? value : moving;

  return (
    <section
      ref={ref}
      aria-labelledby="wasted-title"
      className="relative h-[260vh] motion-reduce:h-auto"
    >
      <div className="sticky top-0 flex h-dvh flex-col overflow-hidden pt-24 pb-6 motion-reduce:static motion-reduce:h-auto motion-reduce:py-24 lg:pt-28">
        <div className="container-page flex flex-1 flex-col">
          <LaneLabel n={2}>The wasted moment</LaneLabel>
          <h2 id="wasted-title" className="sr-only">
            The moment right after success is wasted
          </h2>

          <div className="mt-6 grid flex-1 content-start gap-6 motion-reduce:gap-12 lg:mt-8 lg:grid-cols-[1fr_1.05fr] lg:content-center lg:gap-14">
            {/* The type: one idea per beat, stacked in one cell and crossfaded by scroll. */}
            <div className="grid content-center motion-reduce:flex motion-reduce:flex-col motion-reduce:gap-8">
              <motion.p
                className={cn(beat, "text-[26vw] sm:text-[17vw] lg:text-[11vw]")}
                style={{
                  opacity: fixed(o1, 1),
                  y: reduced ? 0 : y1,
                  fontStretch: "125%",
                  fontWeight: 800,
                }}
              >
                Done.
                <span className="mt-3 block max-w-[24rem] font-sans text-base leading-snug font-normal tracking-normal text-muted-foreground [font-stretch:100%] sm:text-lg lg:text-xl">
                  The file downloads. The transcript appears. The logo exports.
                </span>
              </motion.p>
              <motion.p
                className={beat}
                style={{
                  opacity: fixed(o2, 1),
                  y: reduced ? 0 : y2,
                  fontStretch: "62%",
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                …then nothing.
                <span className="mt-3 block max-w-[24rem] font-sans text-base leading-snug font-normal tracking-normal text-muted-foreground [font-stretch:100%] sm:text-lg lg:text-xl">
                  The tab closes. Your best attention walks out the door.
                </span>
              </motion.p>
              <motion.p
                className={beat}
                style={{
                  opacity: fixed(o3, 1),
                  y: reduced ? 0 : y3,
                  fontStretch: "100%",
                  fontWeight: 800,
                }}
              >
                Unless you pass the <span className="accent-serif text-[1.12em]">baton.</span>
                <span className="mt-3 block max-w-[24rem] font-sans text-base leading-snug font-normal tracking-normal text-muted-foreground [font-stretch:100%] sm:text-lg lg:text-xl">
                  One card, for the one tool they need next.
                </span>
              </motion.p>
            </div>

            {/* The screen. */}
            <div
              aria-hidden
              className="relative min-h-72 self-center overflow-hidden rounded-2xl border bg-muted shadow-lg sm:min-h-80 lg:h-[min(30rem,62dvh)]"
            >
              <div className="relative flex h-11 items-end gap-1 border-b bg-muted px-3">
                {Array.from({ length: TABS }, (_, i) => (
                  <Tab key={i} p={p} index={i} reduced={reduced} />
                ))}
                <motion.span
                  style={reduced ? { opacity: 1 } : { y: nextTabY, opacity: nextTabO }}
                  className="absolute bottom-0 left-3 flex h-8 w-[6.5rem] items-center gap-1.5 overflow-hidden rounded-t-md border border-b-0 bg-card px-2 font-mono text-xs whitespace-nowrap"
                >
                  <BatonPill className="h-1.5 w-4" />
                  Signer
                </motion.span>
              </div>
              <div className="absolute inset-x-0 top-11 bottom-0 grid place-items-center bg-card p-6">
                <div className="flex flex-col items-center gap-4 text-center">
                  <span className="grid size-14 place-items-center rounded-full bg-success text-success-foreground">
                    <CheckIcon className="size-7" strokeWidth={3} />
                  </span>
                  <div>
                    <p className="font-display text-2xl font-bold tracking-tight">
                      report.pdf is ready
                    </p>
                    <p className="mt-1 font-mono text-xs tracking-widest text-muted-foreground uppercase">
                      480 KB · saved
                    </p>
                  </div>
                  <motion.span
                    style={{ opacity: reduced ? 0 : buttonOpacity }}
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background"
                  >
                    <DownloadIcon className="size-4" /> Download again
                  </motion.span>
                </div>
                <motion.div
                  className="absolute inset-0 bg-background"
                  style={{ opacity: reduced ? 0.9 : dim }}
                />
                <motion.div
                  className="absolute inset-0 grid place-items-center"
                  style={{ opacity: reduced ? 0 : counterOpacity }}
                >
                  <div className="text-center font-mono uppercase">
                    <p className="text-xs tracking-widest text-muted-foreground">Tabs open</p>
                    <motion.p className="font-display text-[6rem] leading-none font-extrabold tracking-tighter tabular-nums sm:text-[8rem]">
                      {count}
                    </motion.p>
                    <p className="text-xs tracking-widest text-muted-foreground">
                      Illustration · nobody stayed
                    </p>
                  </div>
                </motion.div>
                <motion.div
                  className="absolute inset-x-4 bottom-4 sm:right-6 sm:left-auto sm:w-[22rem]"
                  style={reduced ? { opacity: 1 } : { opacity: cardOpacity, y: cardY }}
                >
                  <BatonCard
                    via="PDF"
                    title="Sign it in 30 seconds"
                    cta="Open"
                    tool="E-signature tool"
                  />
                </motion.div>
              </div>
            </div>
          </div>

          {/* Progress along the lane. */}
          <div aria-hidden className="relative mt-6 h-12 motion-reduce:hidden">
            <div className="absolute inset-x-0 top-3 h-px bg-border" />
            <motion.div
              className="absolute inset-x-0 top-3 h-0.5 origin-left bg-signal"
              style={{ scaleX: laneScale }}
            />
            <motion.div
              className="absolute top-0.5 left-0 w-[calc(100%-3rem)]"
              style={{ x: pillX }}
            >
              <BatonPill glow className="h-5 w-12" />
            </motion.div>
            <div className="absolute inset-x-0 top-8 flex justify-between font-mono text-xs tracking-widest text-muted-foreground uppercase">
              <span>01 Done</span>
              <span>02 Nothing</span>
              <span>03 Baton</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
