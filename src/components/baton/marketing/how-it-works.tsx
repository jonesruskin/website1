"use client";

import { motion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

import { CopyButton } from "@/components/ui/copy-button";
import { cn } from "@/lib/utils";

import { BatonPill } from "./baton-pill";
import { LaneLabel } from "./lane-label";
import { usePrefersReducedMotion } from "./use-media";

const INSTALL = `<script async src="https://baton.run/embed.js" data-key="bk_your_key"></script>`;
const PASS = `// the file is ready, the transcript is on screen…
baton.pass({ ctx: "pdf" });`;

/** An inverted mono block with a copy button. Tone flips with the page, contrast stays AA. */
function CodeBlock({ file, code, children }: { file: string; code: string; children: ReactNode }) {
  return (
    <div className="tone-inverted min-w-0 overflow-hidden rounded-xl border bg-background text-foreground shadow-md">
      <div className="flex items-center justify-between gap-3 border-b py-1.5 pr-1.5 pl-4">
        <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          {file}
        </span>
        <CopyButton value={code} label="Copy" size="sm" variant="ghost" />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[0.8125rem] leading-relaxed sm:p-5 sm:text-sm">
        <code>{children}</code>
      </pre>
    </div>
  );
}

const lanes = [
  {
    n: "1",
    title: "Install one tag",
    text: "Paste a single script tag before the closing body tag. It loads async and never blocks your page. That is the whole integration.",
    body: (
      <CodeBlock file="index.html" code={INSTALL}>
        <span className="text-muted-foreground">{"<"}</span>
        <span className="text-signal-ink">script</span> async{" "}
        <span className="text-muted-foreground">src=</span>
        <span className="text-signal-ink">{'"https://baton.run/embed.js"'}</span>
        {"\n         "}
        data-key=<span className="text-signal-ink">{'"bk_your_key"'}</span>
        <span className="text-muted-foreground">{"></"}</span>
        <span className="text-signal-ink">script</span>
        <span className="text-muted-foreground">{">"}</span>
      </CodeBlock>
    ),
  },
  {
    n: "2",
    title: (
      <>
        Call <span className="font-mono text-[0.85em] font-semibold tracking-normal">pass()</span>{" "}
        at your success moment
      </>
    ),
    text: "The file is ready. The transcript is on screen. That is the moment. One call and Baton shows one card for the one tool that fits the journey.",
    body: (
      <CodeBlock file="done.js" code={PASS}>
        <span className="text-muted-foreground">
          {"// the file is ready, the transcript is on screen…"}
        </span>
        {"\n"}
        baton.<span className="text-signal-ink">pass</span>({"{ ctx: "}
        <span className="text-signal-ink">{'"pdf"'}</span>
        {" }"});
      </CodeBlock>
    ),
  },
  {
    n: "3",
    title: "Earn when you send, spend when you receive",
    text: "Every click you send earns 1 credit. Every visitor you receive costs 1. You get exactly as much as you give, and you start with 10 credits.",
    body: (
      <div className="tone-inverted min-w-0 rounded-xl border bg-background p-4 font-mono text-[0.8125rem] leading-loose text-foreground shadow-md sm:p-5 sm:text-sm">
        <p className="flex gap-4">
          <span className="w-6 shrink-0 font-semibold text-signal-ink">+1</span>
          <span>A visitor you sent clicked through</span>
        </p>
        <p className="flex gap-4">
          <span className="w-6 shrink-0 font-semibold text-muted-foreground">−1</span>
          <span>A visitor you received</span>
        </p>
        <p className="mt-2 flex gap-4 border-t pt-3">
          <span className="w-6 shrink-0 text-muted-foreground">=</span>
          <span>Fair, by construction.</span>
        </p>
      </div>
    ),
  },
] as const;

const pillSize = "h-[calc(var(--g)*0.85)] w-[calc(var(--g)*2)]";

/** A stretch of running track. The baton rides it while this strip crosses the viewport's middle. */
function Strip({
  reverse = false,
  visible,
  finish = false,
  reduced,
}: {
  reverse?: boolean;
  /** "first" is parked here before it runs, "last" stays parked after. */
  visible: "first" | "mid" | "last";
  finish?: boolean;
  reduced: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ["center 66%", "center 34%"],
  });
  // The pill's carrier spans exactly the distance it travels, so a percentage translate moves it
  // along the strip with a transform only (no layout, no layout shift).
  const x = useTransform(p, (v) => {
    const t = reduced && finish ? 1 : v;
    return `${(reverse ? 1 - t : t) * 100}%`;
  });
  const opacity = useTransform(p, (v): number => {
    if (reduced) return finish ? 1 : 0;
    if (visible === "first") return v < 1 ? 1 : 0;
    if (visible === "last") return v > 0 ? 1 : 0;
    return v > 0 && v < 1 ? 1 : 0;
  });
  const trail = useTransform(p, (v) => (reduced ? (finish ? 1 : 0) : v));

  return (
    <div
      ref={ref}
      aria-hidden
      className="relative h-12 overflow-x-clip border-y bg-[repeating-linear-gradient(to_right,var(--lane)_0,var(--lane)_1px,transparent_1px,transparent_1.5rem)]"
    >
      <motion.div
        className={cn(
          "absolute inset-y-0 bg-signal/15",
          reverse ? "right-0 origin-right" : "left-0 origin-left",
          "w-full",
        )}
        style={{ scaleX: trail }}
      />
      {finish && (
        <span className="absolute inset-y-0 right-0 w-3 bg-[conic-gradient(var(--foreground)_25%,transparent_0_50%,var(--foreground)_0_75%,transparent_0)] bg-size-[0.75rem_0.75rem]" />
      )}
      <motion.div
        className="absolute top-1/2 left-(--g) z-10 h-0 w-[calc(100%-2*var(--g))]"
        style={{ x, opacity }}
      >
        <BatonPill
          glow
          className={cn("absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2", pillSize)}
        />
      </motion.div>
    </div>
  );
}

/** The corner between lanes: the baton turns, drops, and turns again. */
function Drop({ side, reduced }: { side: "left" | "right"; reduced: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress: p } = useScroll({
    target: ref,
    offset: ["start 34%", "end 66%"],
  });
  const y = useTransform(p, (v) => `${v * 100}%`);
  const rotate = useTransform(p, [0, 0.12, 0.88, 1], [0, 90, 90, 0]);
  const opacity = useTransform(p, (v): number => (!reduced && v > 0 && v < 1 ? 1 : 0));

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn(
        "pointer-events-none absolute -top-6 bottom-6 z-10 w-0 border-l border-dashed border-foreground/25",
        side === "right" ? "right-(--g)" : "left-(--g)",
      )}
    >
      <motion.div className="absolute inset-y-0 left-0 w-0" style={{ y, opacity }}>
        <motion.div className="absolute top-0 left-0 size-0" style={{ rotate }}>
          <BatonPill
            glow
            className={cn("absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2", pillSize)}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}

/** 03 · How it works: three lanes laid out like a running track, the baton travelling between them. */
export function HowItWorks() {
  const reduced = usePrefersReducedMotion();
  return (
    <section
      id="how"
      aria-labelledby="how-title"
      className="relative scroll-mt-16 py-24 sm:py-28 lg:py-36"
    >
      <div className="container-page">
        <LaneLabel n={3}>How it works</LaneLabel>
        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2
            id="how-title"
            className="font-display text-[clamp(2.75rem,8.6vw,7.5rem)] leading-[0.88] font-extrabold tracking-[-0.045em] lg:col-span-8"
          >
            Three lanes.
            <br />
            One <span className="accent-serif text-[1.14em] font-normal">baton.</span>
          </h2>
          <p className="max-w-md text-lead text-muted-foreground lg:col-span-4 lg:justify-self-end">
            A relay, run on the attention you already earned. You pass it on, someone passes it to
            you.
          </p>
        </div>
      </div>

      <div className="container-page mt-14 sm:mt-20">
        <div className="relative border-t [--g:1.25rem] lg:[--g:2rem]">
          {lanes.map((lane, i) => (
            <div key={lane.n} className="relative">
              {i > 0 && <Drop side={i % 2 === 1 ? "right" : "left"} reduced={reduced} />}
              <div
                className={cn(
                  "grid min-h-[22rem] gap-8 py-12 lg:grid-cols-12 lg:items-center lg:gap-14 lg:py-16",
                  i === 1 && "pr-10 lg:pr-20",
                  i === 2 && "pl-10 lg:pl-20",
                )}
              >
                <div className={cn("lg:col-span-5", i === 1 && "lg:order-2")}>
                  <p
                    aria-hidden
                    className="font-display text-[7rem] leading-[0.8] font-extrabold tracking-tighter text-transparent [-webkit-text-stroke:2px_var(--foreground)] lg:text-[11rem]"
                    style={{ fontStretch: "125%" }}
                  >
                    {lane.n}
                  </p>
                  <h3 className="mt-5 max-w-[20ch] font-display text-3xl leading-[0.98] font-bold tracking-[-0.03em] text-balance sm:text-4xl">
                    {lane.title}
                  </h3>
                  <p className="mt-4 max-w-md text-muted-foreground">{lane.text}</p>
                </div>
                <div className={cn("min-w-0 lg:col-span-7", i === 1 && "lg:order-1")}>
                  {lane.body}
                </div>
              </div>
              <Strip
                reverse={i % 2 === 1}
                visible={i === 0 ? "first" : i === lanes.length - 1 ? "last" : "mid"}
                finish={i === lanes.length - 1}
                reduced={reduced}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
