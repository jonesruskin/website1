import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * The baton: a signal-orange capsule with a grip band. Purely decorative, so it is
 * hidden from assistive tech. Size it with `h-* w-*` utilities.
 */
export function BatonPill({
  className,
  glow = false,
  ...props
}: ComponentProps<"span"> & { glow?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "relative inline-block h-3 w-9 shrink-0 overflow-hidden rounded-full bg-signal",
        "before:absolute before:inset-y-0 before:left-[68%] before:w-[8%] before:bg-signal-foreground/25",
        glow && "shadow-[0_0_32px_-2px_color-mix(in_oklch,var(--signal)_80%,transparent)]",
        className,
      )}
      {...props}
    />
  );
}
