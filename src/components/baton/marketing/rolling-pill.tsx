"use client";

import { motion } from "motion/react";

import { BatonPill } from "./baton-pill";
import { usePrefersReducedMotion } from "./use-media";

/** A dropped baton, rolling along its lane forever. Parked and tilted under reduced motion. */
export function RollingPill() {
  const reduced = usePrefersReducedMotion();
  return (
    <div
      aria-hidden
      className="relative h-20 overflow-hidden border-y bg-[repeating-linear-gradient(to_right,var(--lane)_0,var(--lane)_1px,transparent_1px,transparent_2rem)]"
    >
      <motion.div
        className="absolute top-1/2 left-0 -mt-3.5"
        initial={{ x: "-4rem", rotate: 0 }}
        animate={
          reduced ? { x: "38vw", rotate: 24 } : { x: ["-4rem", "calc(100vw)"], rotate: [0, 1080] }
        }
        transition={
          reduced
            ? { duration: 0 }
            : { duration: 6.5, ease: "linear", repeat: Infinity, repeatDelay: 0.6 }
        }
      >
        <BatonPill glow className="h-7 w-16" />
      </motion.div>
    </div>
  );
}
