import { ArrowRightIcon, ExternalLinkIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { artifactLabel } from "@/lib/baton/taxonomy";
import { inputSource, type Trail, type TrailPricing } from "@/lib/trails/trails";
import { cn } from "@/lib/utils";

import { ArtifactChip } from "./artifact-chip";

const pad = (n: number) => String(n).padStart(2, "0");

const pricingBadge: Record<TrailPricing, "success" | "secondary" | "outline"> = {
  "Open source": "success",
  Free: "secondary",
  "Free tier": "outline",
};

/** The vertical line, drawn in two shapes: beside a step, and through a handoff. */
const line = "bg-foreground w-0.5";

/** A node on the track: a dot with a mono label inside. */
function Node({
  children,
  tone = "plain",
}: {
  children?: ReactNode;
  tone?: "plain" | "signal" | "ink";
}) {
  return (
    <span
      className={cn(
        "relative z-10 grid shrink-0 place-items-center rounded-full border-2 border-foreground font-mono text-xs font-semibold",
        tone === "signal" && "size-10 bg-signal text-signal-foreground",
        tone === "ink" && "size-4 bg-foreground",
        tone === "plain" && "size-10 bg-background",
      )}
    >
      {children}
    </span>
  );
}

/**
 * The trail as a relay track: numbered nodes down one lane, with the baton
 * (the artifact a step leaves you with) handed to the next step.
 */
export function RelayTrack({ trail }: { trail: Trail }) {
  const last = trail.steps.length - 1;

  return (
    <ol className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 sm:gap-x-8">
      {/* Start */}
      <li className="contents">
        <div className="flex flex-col items-center">
          <Node tone="ink" />
          <span className={`${line} h-6 flex-1`} />
        </div>
        <div className="-mt-1 flex flex-wrap items-center gap-x-3 gap-y-2 pb-6">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            Start with
          </p>
          <ArtifactChip id={trail.from} kind="in" />
        </div>
      </li>

      {trail.steps.map((step, index) => {
        const source = inputSource(trail, index);
        return (
          <li key={step.title} className="contents">
            {/* Track column beside the step */}
            <div className="flex flex-col items-center">
              <Node tone={index === last ? "signal" : "plain"}>{pad(index + 1)}</Node>
              <span className={`${line} flex-1`} />
            </div>

            {/* The step */}
            <article
              id={`step-${index + 1}`}
              className="flex reveal scroll-mt-24 flex-col gap-5 rounded-2xl border bg-card p-5 sm:p-7"
            >
              <div className="flex flex-col gap-3">
                <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                  Step {pad(index + 1)} ·{" "}
                  {source.kind === "start"
                    ? "uses what you started with"
                    : `uses what step ${pad(source.step)} left you`}
                </p>
                <h2
                  className="font-display text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-3xl"
                  style={{ fontStretch: "90%" }}
                >
                  {step.title}
                </h2>
                <p className="text-lg text-pretty">{step.why}</p>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                  You bring
                </span>
                <ArtifactChip id={step.input} kind="in" />
                <ArrowRightIcon aria-hidden className="size-4 text-muted-foreground" />
                <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                  You leave with
                </span>
                <ArtifactChip id={step.output} kind="out" />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-4">
                <a
                  href={step.tool.url}
                  target="_blank"
                  rel="noopener"
                  className="group/tool inline-flex items-center gap-2 font-medium text-foreground underline decoration-foreground/40 underline-offset-4 hover:decoration-foreground"
                >
                  {step.tool.name}
                  <ExternalLinkIcon aria-hidden className="size-3.5" />
                  <span className="sr-only">(opens the official site in a new tab)</span>
                </a>
                <Badge variant={pricingBadge[step.tool.pricing]}>{step.tool.pricing}</Badge>
              </div>
            </article>

            {/* The handoff to the next step */}
            {index < last && (
              <>
                <div className="relative flex justify-center" aria-hidden>
                  <span className={`${line} h-full`} />
                  <span className="absolute top-1/2 h-9 w-3 -translate-y-1/2 rounded-full bg-signal" />
                </div>
                <div className="flex min-h-16 flex-wrap items-center gap-x-3 gap-y-1 py-2">
                  <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                    Baton to step {pad(index + 2)}
                  </p>
                  <ArtifactChip id={step.output} kind="out" />
                  <span className="sr-only">
                    Hand your {artifactLabel(step.output)} to step {index + 2}.
                  </span>
                </div>
              </>
            )}
          </li>
        );
      })}

      {/* Finish */}
      <li className="contents">
        <div className="flex flex-col items-center">
          <span className={`${line} h-6`} />
          <Node tone="signal" />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 pt-6">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            You finish with
          </p>
          <ArtifactChip id={trail.to} kind="out" />
        </div>
      </li>
    </ol>
  );
}
