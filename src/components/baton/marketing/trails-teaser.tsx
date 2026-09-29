import { ArrowRightIcon, ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { BatonPill } from "./baton-pill";
import { DragScroll } from "./drag-scroll";
import { LaneLabel } from "./lane-label";

/** Hardcoded teasers. The /trails routes for these slugs are built separately. */
const trails = [
  {
    slug: "podcast-in-an-afternoon",
    title: "Podcast in an afternoon",
    steps: ["Record", "Clean", "Transcribe", "Clip", "Publish"],
  },
  {
    slug: "launch-a-landing-page",
    title: "Launch a landing page",
    steps: ["Write the copy", "Design", "Build", "Connect a domain", "Measure"],
  },
  {
    slug: "ship-a-pitch-deck",
    title: "Ship a pitch deck",
    steps: ["Outline", "Design slides", "Add charts", "Export PDF", "Share"],
  },
  {
    slug: "clean-up-a-scanned-contract",
    title: "Clean up a scanned contract",
    steps: ["Scan", "Straighten", "Read the text", "Compress", "Sign"],
  },
] as const;

const edge =
  "[--edge:max(1rem,calc((100%-var(--dial-measure))/2+1rem))] sm:[--edge:max(1.5rem,calc((100%-var(--dial-measure))/2+1.5rem))] lg:[--edge:max(2rem,calc((100%-var(--dial-measure))/2+2rem))]";

/** 07 · Trails teaser: baton is also for people. A draggable, snapping lane of journeys. */
export function TrailsTeaser() {
  return (
    <section
      aria-labelledby="trails-title"
      className="relative overflow-x-clip border-t py-24 sm:py-28 lg:py-36"
    >
      <div className="container-page">
        <LaneLabel n={7}>Trails</LaneLabel>
        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2
            id="trails-title"
            className="font-display text-[clamp(2.75rem,8.6vw,7.5rem)] leading-[0.88] font-extrabold tracking-[-0.045em] lg:col-span-8"
          >
            Baton is also for{" "}
            <span className="accent-serif text-[1.14em] font-normal">people.</span>
          </h2>
          <div className="flex flex-col items-start gap-5 lg:col-span-4 lg:justify-self-end">
            <p className="max-w-md text-lead text-muted-foreground">
              Trails are whole journeys, from idea to done, with the right tool at every handoff.
              Pick one and run it.
            </p>
            <Link
              href="/trails"
              className="group inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-widest uppercase underline-offset-8 hover:underline"
            >
              All trails
              <ArrowRightIcon
                aria-hidden
                className="size-4 transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
      </div>

      <div className={cn("mt-14 sm:mt-20", edge)}>
        <DragScroll
          role="region"
          aria-label="Trails, scroll or drag sideways"
          className="scroll-px-(--edge) px-(--edge)"
        >
          {trails.map((trail, i) => (
            <Link
              key={trail.slug}
              href={`/trails/${trail.slug}`}
              draggable={false}
              className="group relative flex w-[80vw] max-w-[24rem] shrink-0 snap-start flex-col rounded-3xl border bg-card p-6 transition-[border-color,transform,box-shadow] duration-300 outline-none hover:-translate-y-1 hover:border-foreground hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-[24rem] sm:p-8"
            >
              <div className="flex items-center justify-between font-mono text-xs tracking-widest uppercase">
                <span className="font-semibold text-signal-ink">
                  Trail {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-muted-foreground">{trail.steps.length} steps</span>
              </div>
              <h3 className="mt-6 min-h-[5.5rem] font-display text-4xl leading-[0.95] font-bold tracking-[-0.035em] text-balance">
                {trail.title}
              </h3>
              <ol className="relative mt-8 flex flex-col gap-4">
                <span
                  aria-hidden
                  className="absolute top-2 bottom-2 left-[0.4375rem] w-px bg-border transition-colors group-hover:bg-signal"
                />
                {trail.steps.map((step, s) => (
                  <li key={step} className="relative flex items-center gap-4 text-[0.9375rem]">
                    <span
                      aria-hidden
                      className={cn(
                        "relative z-10 size-3.5 rounded-full border-2 bg-card",
                        s === 0 ? "border-signal bg-signal" : "border-foreground/40",
                      )}
                    />
                    <span className={s === 0 ? "font-semibold" : "text-muted-foreground"}>
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
              <div className="mt-8 flex items-center justify-between border-t pt-5">
                <BatonPill className="h-2.5 w-7 transition-transform duration-300 group-hover:translate-x-2" />
                <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                  Walk this trail
                  <ArrowUpRightIcon aria-hidden className="size-4" />
                </span>
              </div>
            </Link>
          ))}
          <div aria-hidden className="w-px shrink-0" />
        </DragScroll>
        <p
          aria-hidden
          className="px-(--edge) font-mono text-xs tracking-widest text-muted-foreground uppercase"
        >
          ← Drag or swipe →
        </p>
      </div>
    </section>
  );
}
