"use client";

import { motion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * One word of display type. The invisible sizer holds the word's FINAL width so
 * the line breaks (and everything below) never move while the visible copy
 * breathes from a condensed width to normal on the variable font's width axis.
 * `motion-reduce` pins the final width with CSS, before any script runs.
 */
function Word({ children, delay }: { children: string; delay: number }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <span aria-hidden className="invisible">
        {children}
      </span>
      <motion.span
        className="absolute inset-0 motion-reduce:[font-stretch:100%]!"
        initial={{ fontStretch: "62%" }}
        animate={{ fontStretch: "100%" }}
        transition={{ duration: 1.1, delay, ease: EASE }}
      >
        {children}
      </motion.span>
    </span>
  );
}

function Words({ text, start }: { text: string; start: number }) {
  const words = text.split(" ");
  return words.map((word, i) => (
    <span key={`${word}-${i}`}>
      <Word delay={start + i * 0.08}>{word}</Word>
      {i < words.length - 1 ? " " : null}
    </span>
  ));
}

/** The hero h1: three stacked lines, width-axis animation staggered per word. */
export function HeroTitle() {
  return (
    <h1 id="hero-title" className="font-display tracking-[-0.045em]">
      <span className="block max-w-[16ch] text-[clamp(1.75rem,4.6vw,4rem)] leading-[0.98] font-semibold text-muted-foreground sm:max-w-none">
        <Words text="Every tool ends in a dead end." start={0.05} />
      </span>
      <span className="mt-3 block text-[13.6vw] leading-[0.86] font-extrabold sm:text-[13vw] lg:mt-5 lg:text-[min(9.8vw,8.75rem)]">
        <Words text="Make yours a" start={0.55} />
        <span className="relative mt-1 block w-fit">
          <motion.span
            className="inline-block pr-[0.06em] accent-serif text-[1.22em] leading-[0.9] font-normal tracking-[-0.03em] text-foreground motion-reduce:transform-none! motion-reduce:opacity-100!"
            initial={{ opacity: 0, y: "0.2em", rotate: -2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 1, delay: 1.05, ease: EASE }}
          >
            doorway.
          </motion.span>
          <motion.span
            aria-hidden
            className="absolute right-[0.06em] -bottom-[0.02em] left-[0.04em] h-[0.09em] origin-left rounded-full bg-signal motion-reduce:transform-none!"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.9, delay: 1.5, ease: [0.34, 1.4, 0.64, 1] }}
          />
        </span>
      </span>
    </h1>
  );
}
