"use client";

import { useTheme } from "next-themes";
import { useState } from "react";

import { cn } from "@/lib/utils";

type Mode = "auto" | "bone" | "night";

const modes: { id: Mode; label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "bone", label: "Bone" },
  { id: "night", label: "Night" },
];

/**
 * The card exactly as the embed draws it: bone or night surface, the orange
 * baton, a mono micro-label, title, body, one button, and the Baton mark.
 * Purely visual; the CTA is a span because nothing here should be clickable.
 */
export function CardFace({
  title,
  body,
  cta,
  via,
  className,
}: {
  title: string;
  body: string;
  cta: string;
  /** The artifact the previous tool just produced, e.g. "PDF". */
  via: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid w-full gap-3 rounded-2xl border bg-card p-5 text-card-foreground shadow-md",
        className,
      )}
    >
      <p className="flex items-center gap-2 font-mono text-[0.6875rem] tracking-widest text-muted-foreground uppercase">
        <span aria-hidden className="h-2 w-5 shrink-0 rounded-full bg-signal" />
        <span className="truncate">Next step · via {via}</span>
      </p>
      <p
        className="font-display text-xl leading-tight font-bold tracking-tight text-balance"
        style={{ fontStretch: "95%" }}
      >
        {title}
      </p>
      {body && <p className="text-sm text-pretty text-muted-foreground">{body}</p>}
      <span className="mt-1 inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground">
        {cta} <span aria-hidden>&nbsp;→</span>
      </span>
      <p className="flex items-center gap-1.5 font-mono text-[0.625rem] tracking-widest text-muted-foreground uppercase">
        passed by Baton
      </p>
    </div>
  );
}

/** The preview panel: a framed "success moment" with the card inside, and a theme switch. */
export function CardPreview({
  title,
  body,
  cta,
  via,
}: {
  title: string;
  body: string;
  cta: string;
  via: string;
}) {
  const [mode, setMode] = useState<Mode>("auto");
  const { resolvedTheme } = useTheme();
  // "dark" forces night tokens; "tone-inverted" flips them, which gives bone on a dark page.
  const surface =
    mode === "night" ? "dark" : mode === "bone" && resolvedTheme === "dark" ? "tone-inverted" : "";

  return (
    <div className="grid gap-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-mono text-xs tracking-widest uppercase">Live preview</h2>
        <div role="group" aria-label="Preview surface" className="flex rounded-md border p-0.5">
          {modes.map((m) => (
            <button
              key={m.id}
              type="button"
              aria-pressed={mode === m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "rounded-sm px-2.5 py-1 font-mono text-[0.6875rem] tracking-widest uppercase outline-none focus-visible:ring-2 focus-visible:ring-ring",
                mode === m.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>
      <div className="rounded-xl border bg-muted/60 bg-lanes p-3 [--lane-gap:1.75rem] sm:p-4">
        <p className="mb-3 flex items-center gap-2 font-mono text-[0.6875rem] tracking-widest text-muted-foreground uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-success" />
          Another tool just finished a job
        </p>
        <div className={cn("rounded-2xl", surface)}>
          <CardFace title={title} body={body} cta={cta} via={via} />
        </div>
      </div>
      <p className="text-xs text-pretty text-muted-foreground">
        This is how users of other tools will see your card, right after they get what they came
        for.
      </p>
    </div>
  );
}
