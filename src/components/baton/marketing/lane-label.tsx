import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Number of numbered lanes (sections) on the home page. */
export const LANES = 10;

const pad = (n: number) => String(n).padStart(2, "0");

/** The section index: "03 / 10 ── How it works", set like a lane marker on a track. */
export function LaneLabel({
  n,
  children,
  className,
}: {
  n: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 font-mono text-xs tracking-widest whitespace-nowrap uppercase",
        className,
      )}
    >
      <span className="font-semibold text-signal-ink">
        {pad(n)} / {pad(LANES)}
      </span>
      <span aria-hidden className="h-px w-8 bg-foreground/30 sm:w-14" />
      <span className="text-muted-foreground">{children}</span>
    </p>
  );
}
