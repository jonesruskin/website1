"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * The sticky header shell. It flips `data-scrolled` on scroll so the bar can detach
 * into a floating pill with CSS alone (no React state, no re-render per scroll).
 */
export function HeaderFrame({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => el.setAttribute("data-scrolled", String(window.scrollY > 24));
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      ref={ref}
      data-scrolled="false"
      className="group/header pointer-events-none sticky top-0 z-40 h-16"
    >
      {children}
    </header>
  );
}
