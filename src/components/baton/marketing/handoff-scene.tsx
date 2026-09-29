"use client";

import { CheckIcon, FileTextIcon, MousePointer2Icon } from "lucide-react";
import { animate, motion, useInView } from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

import { BatonCard } from "./baton-card";
import { BatonPill } from "./baton-pill";
import { usePrefersReducedMotion } from "./use-media";

/**
 * The live handoff, built from real DOM: a compressor finishes, a Baton card
 * slides in, a cursor clicks it, and the baton is passed to a second tool that
 * lights up. It loops while on screen, pauses when off screen, and shows the
 * final frame under reduced motion.
 */

const HOLD = [700, 1900, 1100, 1000, 1100, 450, 1100, 3400] as const;
const FINAL = HOLD.length - 1;
const HANDOFF = [0.34, 1.4, 0.64, 1] as const;

function WindowChrome({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="flex h-10 items-center gap-3 border-b px-4">
      <span aria-hidden className="flex gap-1.5">
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
        <span className="size-2.5 rounded-full bg-border" />
      </span>
      <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
        {title}
      </span>
      {children}
    </div>
  );
}

export function HandoffScene({ className }: { className?: string }) {
  const [phase, setPhase] = useState(0);
  const sceneRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const flightRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLSpanElement>(null);
  const inView = useInView(sceneRef, { amount: 0.25 });
  const reduced = usePrefersReducedMotion();
  const shown = reduced ? FINAL : phase;

  // The loop: each phase holds for its duration, only while on screen.
  useEffect(() => {
    if (reduced || !inView) return;
    const timer = setTimeout(() => setPhase((p) => (p + 1) % HOLD.length), HOLD[phase]);
    return () => clearTimeout(timer);
  }, [phase, inView, reduced]);

  // Cursor and baton flight are imperative so they can follow measured positions.
  useEffect(() => {
    const scene = sceneRef.current;
    const cursor = cursorRef.current;
    const flight = flightRef.current;
    const button = cardRef.current?.querySelector<HTMLElement>("[data-card-cta]");
    const dock = dockRef.current;
    if (!scene || !cursor || !flight || !button || !dock) return;

    const at = (el: HTMLElement, fx = 0.5, fy = 0.5) => {
      const s = scene.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { x: r.left - s.left + r.width * fx, y: r.top - s.top + r.height * fy };
    };
    const stops: { stop: () => void }[] = [];
    const run = (...args: Parameters<typeof animate>) => {
      stops.push(animate(...args));
    };

    if (reduced) {
      run(cursor, { opacity: 0 }, { duration: 0 });
      run(flight, { opacity: 0 }, { duration: 0 });
    } else if (phase === 0) {
      const s = scene.getBoundingClientRect();
      run(cursor, { opacity: 0, x: s.width * 0.72, y: s.height * 0.16, scale: 1 }, { duration: 0 });
      run(flight, { opacity: 0 }, { duration: 0 });
    } else if (phase === 4) {
      const to = at(button, 0.62, 0.62);
      run(cursor, { opacity: 1, x: to.x, y: to.y }, { duration: 0.95, ease: [0.65, 0, 0.35, 1] });
    } else if (phase === 5) {
      run(cursor, { scale: [1, 0.8, 1] }, { duration: 0.34 });
      run(button, { scale: [1, 0.92, 1] }, { duration: 0.34 });
    } else if (phase === 6) {
      const from = at(button);
      const to = at(dock);
      const midY = Math.min(from.y, to.y) - 44;
      const midX = (from.x + to.x) / 2;
      run(flight, { x: from.x, y: from.y, scaleX: 1, rotate: -8 }, { duration: 0 });
      run(flight, { opacity: [0, 1, 1, 0] }, { duration: 1.05, times: [0, 0.08, 0.88, 1] });
      run(
        flight,
        {
          x: [from.x, midX, to.x],
          y: [from.y, midY, to.y],
          scaleX: [1, 1.8, 1],
          rotate: [-8, -22, 0],
        },
        { duration: 1.05, ease: HANDOFF, times: [0, 0.5, 1] },
      );
      run(cursor, { opacity: 0 }, { duration: 0.3, delay: 0.2 });
    }
    return () => stops.forEach((s) => s.stop());
  }, [phase, reduced]);

  const processing = shown >= 1 && shown < 2;
  const done = shown >= 2;
  const cardIn = shown >= 3;
  const lit = shown >= 7;

  return (
    <div
      ref={sceneRef}
      role="img"
      aria-label="Illustration of a handoff. A PDF compressor finishes, a Baton card offers an e-signature tool as the next step, the user clicks it, and the baton is passed to the signing tool."
      className={cn(
        "relative overflow-hidden rounded-3xl border bg-muted/60 p-4 sm:p-6 lg:p-7",
        className,
      )}
    >
      <div aria-hidden className="absolute inset-0 bg-lanes [--lane-gap:2.75rem]" />

      <div aria-hidden className="relative grid gap-4 sm:gap-5 md:grid-cols-[1.2fr_1fr]">
        {/* Window one: the tool that just finished its job. */}
        <div className="overflow-hidden rounded-xl border bg-card shadow-md">
          <WindowChrome title="Compressor" />
          <div className="flex flex-col gap-4 p-4 sm:p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                <FileTextIcon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">report.pdf</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {done ? "480 KB" : "2.1 MB"}
                </p>
              </div>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full origin-left rounded-full bg-foreground ease-in-out"
                style={{
                  width: shown >= 1 ? "100%" : "0%",
                  transitionProperty: "width",
                  transitionDuration: processing ? `${HOLD[1]}ms` : "0ms",
                }}
              />
            </div>
            <div className="relative h-5 font-mono text-xs">
              <span
                className={cn(
                  "absolute inset-0 flex items-center gap-2 text-muted-foreground transition-opacity duration-300",
                  done ? "opacity-0" : "opacity-100",
                )}
              >
                <span className="size-1.5 animate-signal-pulse rounded-full bg-signal" />
                Compressing…
              </span>
              <span
                className={cn(
                  "absolute inset-0 flex items-center gap-2 text-foreground transition-all duration-500",
                  done ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
                )}
              >
                <CheckIcon className="size-3.5 shrink-0 text-success" />
                <span className="truncate">Done · report.pdf 2.1 MB → 480 KB</span>
              </span>
            </div>
            <motion.div
              ref={cardRef}
              initial={false}
              animate={{
                opacity: cardIn ? 1 : 0,
                y: cardIn ? 0 : 32,
                scale: cardIn ? 1 : 0.94,
              }}
              transition={{ duration: reduced ? 0 : 0.8, ease: HANDOFF }}
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

        {/* Window two: the tool the user is passed to. */}
        <div
          className={cn(
            "self-start overflow-hidden rounded-xl border bg-card transition-[box-shadow,border-color] duration-700 md:mt-24",
            lit
              ? "border-signal shadow-[0_0_0_1px_var(--signal),0_20px_60px_-12px_color-mix(in_oklch,var(--signal)_60%,transparent)]"
              : "shadow-md",
          )}
        >
          <WindowChrome title="Signer">
            <span ref={dockRef} className="ml-auto grid h-4 w-11 place-items-center">
              <BatonPill
                glow
                className={cn(
                  "h-3 w-9 transition-all duration-500",
                  lit ? "scale-100 opacity-100" : "scale-50 opacity-0",
                )}
              />
            </span>
          </WindowChrome>
          <div className="flex flex-col gap-4 p-4 sm:p-5">
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg border border-dashed px-3 py-3 transition-colors duration-500",
                lit ? "border-signal bg-signal/10" : "border-input",
              )}
            >
              <span
                className={cn(
                  "grid size-9 shrink-0 place-items-center rounded-md transition-colors duration-500",
                  lit ? "bg-signal text-signal-foreground" : "bg-muted text-muted-foreground",
                )}
              >
                <FileTextIcon className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {lit ? "report.pdf" : "Drop a PDF here"}
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {lit ? "480 KB · from Compressor" : "Waiting for a file"}
                </p>
              </div>
            </div>
            <div className="relative h-14 border-b border-foreground/30">
              <span className="absolute bottom-2 left-0 font-mono text-xs text-muted-foreground">
                ×
              </span>
              <svg
                viewBox="0 0 160 48"
                fill="none"
                className="absolute inset-x-4 bottom-1 h-12 w-[calc(100%-2rem)] text-foreground"
              >
                <path
                  d="M4 34c10-26 18-30 20-22s-14 26-4 24 16-22 22-18-6 20 2 18 12-12 18-10 4 10 12 6 14-14 20-12-2 14 6 12 16-6 22-4"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  pathLength={1}
                  strokeDasharray={1}
                  style={{
                    strokeDashoffset: lit ? 0 : 1,
                    transition: lit ? "stroke-dashoffset 1.4s ease-in-out 0.35s" : "none",
                  }}
                />
              </svg>
            </div>
            <div className="flex items-center justify-between font-mono text-xs tracking-widest uppercase">
              <span className={lit ? "font-semibold text-signal-ink" : "text-muted-foreground"}>
                {lit ? "Passed · 1 credit" : "Idle"}
              </span>
              <span className="text-muted-foreground">Signer</span>
            </div>
          </div>
        </div>
      </div>

      {/* Roaming layers: cursor and the baton in flight. */}
      <div
        ref={flightRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 z-30 size-0 opacity-0"
      >
        <BatonPill
          glow
          className="absolute top-0 left-0 h-4 w-12 -translate-x-1/2 -translate-y-1/2"
        />
      </div>
      <div
        ref={cursorRef}
        aria-hidden
        className="pointer-events-none absolute top-0 left-0 z-40 opacity-0"
      >
        <MousePointer2Icon className="size-6 fill-foreground stroke-background drop-shadow-md" />
      </div>
    </div>
  );
}
