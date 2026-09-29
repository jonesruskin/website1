"use client";

import { AnimatePresence, MotionConfig, motion, useInView } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

import { BatonPill } from "./baton-pill";
import { LaneLabel } from "./lane-label";
import { usePrefersReducedMotion } from "./use-media";

/**
 * The ledger is a pure function of one integer: how many handoffs have happened.
 * "a" sends a visitor to "b" (a +1, b −1) or the other way round. One full cycle
 * of six nets to zero, so the balances always return to where they started.
 */
const CYCLE = ["a", "b", "b", "a", "a", "b"] as const;
const START = 10;
const HANDOFF = [0.34, 1.4, 0.64, 1] as const;

const sender = (i: number) => CYCLE[i % CYCLE.length]!;

function balances(n: number) {
  let a = START;
  let b = START;
  let sentA = 0;
  let sentB = 0;
  for (let i = 0; i < n; i++) {
    if (sender(i) === "a") {
      a += 1;
      b -= 1;
      sentA += 1;
    } else {
      b += 1;
      a -= 1;
      sentB += 1;
    }
  }
  return { a, b, sentA, sentB };
}

const rules = [
  "1 click sent = 1 credit.",
  "No pay-to-rank on free.",
  "Competitors are never paired.",
  "Duplicate clicks don't count.",
  "Daily-rotating anonymous visitor hashes, no cookies.",
];

/** One split-flap digit: a strip of 0–9 that rolls to the value, with the hinge line across the middle. */
function Flap({ digit }: { digit: number }) {
  return (
    <span className="relative block h-[1.08em] w-[0.72em] overflow-hidden rounded-[0.09em] bg-muted shadow-inner">
      <motion.span
        className="absolute inset-x-0 top-0 flex h-[1080%] flex-col items-center"
        initial={false}
        animate={{ y: `${-digit * 10}%` }}
        transition={{ duration: 0.8, ease: HANDOFF }}
      >
        {Array.from({ length: 10 }, (_, d) => (
          <span key={d} className="grid h-[10%] place-items-center leading-none tabular-nums">
            {d}
          </span>
        ))}
      </motion.span>
      <span aria-hidden className="absolute inset-x-0 top-1/2 h-px bg-background/70" />
    </span>
  );
}

function Odometer({ value, label }: { value: number; label: string }) {
  const clamped = Math.max(0, Math.min(99, value));
  const tens = Math.floor(clamped / 10);
  const ones = clamped % 10;
  return (
    <span
      role="img"
      aria-label={`${label}: ${value} credits`}
      className="inline-flex gap-[0.08em] font-display text-[4.5rem] leading-none font-extrabold sm:text-[6.5rem]"
    >
      <Flap digit={tens} />
      <Flap digit={ones} />
    </span>
  );
}

function Column({
  name,
  value,
  sent,
  received,
  side,
  delta,
}: {
  name: string;
  value: number;
  sent: number;
  received: number;
  side: "a" | "b";
  delta: "+1" | "−1" | null;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-4", side === "b" && "items-end text-right")}>
      <div
        className={cn(
          "flex h-5 w-full items-center justify-start gap-3",
          side === "b" && "flex-row-reverse",
        )}
      >
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">{name}</p>
        <AnimatePresence mode="wait">
          {delta && (
            <motion.span
              key={`${delta}-${sent}-${received}`}
              aria-hidden
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: HANDOFF }}
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-xs font-semibold",
                delta === "+1"
                  ? "bg-signal text-signal-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {delta}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <Odometer value={value} label={name} />
      <p className="font-mono text-xs tracking-wider text-muted-foreground uppercase tabular-nums sm:tracking-widest">
        {sent} sent · {received} received
      </p>
    </div>
  );
}

/** 05 · The exchange: a ledger of credits moving 1:1, and the rules that keep it fair. */
export function Exchange() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const reduced = usePrefersReducedMotion();
  const [n, setN] = useState<number>(CYCLE.length);

  useEffect(() => {
    if (reduced || !inView) return;
    const id = setInterval(() => setN((v) => v + 1), 2200);
    return () => clearInterval(id);
  }, [inView, reduced]);

  const { a, b, sentA, sentB } = balances(n);
  const last = n > 0 ? sender(n - 1) : null;
  const recent = Array.from({ length: Math.min(4, n) }, (_, k) => n - 1 - k);

  return (
    <MotionConfig reducedMotion="user">
      <section aria-labelledby="exchange-title" className="relative py-24 sm:py-28 lg:py-36">
        <div className="container-page">
          <LaneLabel n={5}>The exchange</LaneLabel>
          <h2
            id="exchange-title"
            className="mt-6 max-w-[14ch] font-display text-[clamp(2.75rem,8.6vw,7.5rem)] leading-[0.88] font-extrabold tracking-[-0.045em] sm:max-w-[16ch]"
          >
            Fair down to the <span className="accent-serif text-[1.14em] font-normal">credit.</span>
          </h2>

          <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-16">
            {/* The ledger */}
            <div ref={ref} className="lg:col-span-7">
              <div className="tone-inverted overflow-hidden rounded-3xl border bg-background text-foreground shadow-lg">
                <div className="flex items-center justify-between gap-4 border-b px-5 py-3 sm:px-8">
                  <p className="flex items-center gap-2 font-mono text-xs tracking-widest text-muted-foreground uppercase">
                    <span
                      aria-hidden
                      className="size-1.5 animate-signal-pulse rounded-full bg-signal"
                    />
                    Ledger
                  </p>
                  <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                    Illustration · two example tools
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 px-5 pt-8 pb-6 sm:px-8 sm:pt-10">
                  <Column
                    name="Compressor"
                    value={a}
                    sent={sentA}
                    received={sentB}
                    side="a"
                    delta={last === "a" ? "+1" : last === "b" ? "−1" : null}
                  />
                  <Column
                    name="Signer"
                    value={b}
                    sent={sentB}
                    received={sentA}
                    side="b"
                    delta={last === "b" ? "+1" : last === "a" ? "−1" : null}
                  />
                </div>
                {/* The transfer lane */}
                <div aria-hidden className="relative mx-5 h-10 border-y sm:mx-8">
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(to_right,var(--lane)_0,var(--lane)_1px,transparent_1px,transparent_1.25rem)]" />
                  {last && (
                    <motion.div
                      key={n}
                      className="absolute inset-y-0 left-[6%] w-[88%]"
                      initial={{ x: last === "a" ? "0%" : "100%" }}
                      animate={{ x: last === "a" ? "100%" : "0%" }}
                      transition={{ duration: 1, ease: HANDOFF }}
                    >
                      <BatonPill
                        glow
                        className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2"
                      />
                    </motion.div>
                  )}
                </div>
                <ol
                  className="px-5 py-5 font-mono text-xs leading-loose sm:px-8 sm:text-sm"
                  aria-label="Recent handoffs"
                >
                  <AnimatePresence initial={false} mode="popLayout">
                    {recent.map((idx) => {
                      const from = sender(idx) === "a" ? "Compressor" : "Signer";
                      const to = sender(idx) === "a" ? "Signer" : "Compressor";
                      return (
                        <motion.li
                          key={idx}
                          layout
                          initial={{ opacity: 0, y: -12 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.45 }}
                          className="flex items-center justify-between gap-3 border-b border-dashed py-1.5 last:border-0"
                        >
                          <span className="min-w-0 truncate">
                            <span className="text-muted-foreground">
                              #{String(idx + 1).padStart(3, "0")}
                            </span>{" "}
                            {from} → {to}
                          </span>
                          <span className="shrink-0 text-signal-ink">
                            +1<span className="hidden sm:inline"> sent</span> · −1
                            <span className="hidden sm:inline"> received</span>
                          </span>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ol>
                <p className="border-t px-5 py-3 font-mono text-xs tracking-widest text-muted-foreground uppercase sm:px-8">
                  Credits created out of thin air: 0 · Total always {START * 2}
                </p>
              </div>
            </div>

            {/* The rules */}
            <div className="lg:col-span-5">
              <p className="max-w-md text-lead text-muted-foreground">
                Every click you send earns 1 credit. Every visitor you receive costs 1. You get
                exactly as much as you give. No one can buy their way to the top of a free plan.
              </p>
              <ul className="mt-10 border-t border-foreground">
                {rules.map((rule, i) => (
                  <li
                    key={rule}
                    className="flex reveal items-baseline gap-4 border-b py-4 font-mono text-sm leading-snug"
                  >
                    <span className="w-6 shrink-0 text-xs font-semibold text-signal-ink">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
