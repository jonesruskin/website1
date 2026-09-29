"use client";

import { useSyncExternalStore } from "react";

function useMedia(query: string, serverValue = false) {
  return useSyncExternalStore(
    (notify) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", notify);
      return () => list.removeEventListener("change", notify);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/** Hydration-safe `prefers-reduced-motion`: false on the server, live afterwards. */
export function usePrefersReducedMotion() {
  return useMedia("(prefers-reduced-motion: reduce)");
}

/** True when the primary pointer is coarse (touch). */
export function useCoarsePointer() {
  return useMedia("(pointer: coarse)");
}
