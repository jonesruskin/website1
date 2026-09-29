"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/**
 * Lenis smooth scrolling for the marketing pages. Off under reduced motion and
 * on touch devices (native momentum scrolling is already better there), and it
 * follows changes to either preference live.
 */
export function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarse = window.matchMedia("(pointer: coarse)");
    let lenis: Lenis | null = null;

    const sync = () => {
      const enabled = !reduce.matches && !coarse.matches;
      if (enabled && !lenis) {
        lenis = new Lenis({ autoRaf: true, lerp: 0.11, anchors: { offset: -72 } });
      } else if (!enabled && lenis) {
        lenis.destroy();
        lenis = null;
      }
    };

    sync();
    reduce.addEventListener("change", sync);
    coarse.addEventListener("change", sync);
    return () => {
      reduce.removeEventListener("change", sync);
      coarse.removeEventListener("change", sync);
      lenis?.destroy();
    };
  }, []);

  return null;
}
