import { ArrowUpRightIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { BatonPill } from "./baton-pill";

type BatonCardProps = {
  /** Artifact label the journey runs through, e.g. "PDF". */
  via: string;
  title: string;
  cta: string;
  /** The tool this card is for. */
  tool?: string;
  className?: string;
};

/**
 * The Baton card as a visual: ONE next step, matched by journey. Presentational
 * only (the CTA is a span), so it is safe inside demos and illustrations.
 */
export function BatonCard({ via, title, cta, tool, className }: BatonCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-card p-4 text-card-foreground shadow-lg sm:p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3 font-mono text-xs tracking-widest uppercase">
        <span className="min-w-0 truncate font-semibold text-signal-ink">
          Next step · via {via}
        </span>
        <BatonPill className="h-2.5 w-7" />
      </div>
      <p
        className="mt-3 font-display text-2xl leading-[1.02] font-bold tracking-tight text-balance sm:text-[1.75rem]"
        style={{ fontStretch: "82%" }}
      >
        {title}
      </p>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-sm text-muted-foreground">{tool ?? " "}</span>
        <span
          data-card-cta
          className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-signal px-4 text-sm font-semibold text-signal-foreground"
        >
          {cta}
          <ArrowUpRightIcon aria-hidden className="size-4" />
        </span>
      </div>
    </div>
  );
}
