import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import type { TrailSummary } from "@/lib/trails/summary";

import { ArtifactChip } from "./artifact-chip";
import { TrailLane } from "./trail-lane";

type TrailRowProps = {
  trail: TrailSummary;
  /** Zero-based position, shown as the lane number. */
  index: number;
  total: number;
};

const pad = (n: number) => String(n).padStart(2, "0");

/** One trail as a numbered lane: title and promise on the left, the run on the right. */
export function TrailRow({ trail, index, total }: TrailRowProps) {
  return (
    <li className="group/lane relative border-t py-8 transition-colors last:border-b hover:bg-accent/60 sm:py-10">
      <div className="grid gap-x-8 gap-y-6 lg:grid-cols-[4.5rem_minmax(0,1fr)_minmax(0,1.15fr)] lg:items-center">
        <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase lg:self-start lg:pt-2">
          {pad(index + 1)} / {pad(total)}
        </p>

        <div className="flex flex-col gap-3">
          <h3 className="font-display text-2xl leading-tight font-semibold tracking-tight sm:text-3xl">
            <Link
              href={`/trails/${trail.slug}`}
              className="outline-none after:absolute after:inset-0 after:content-[''] focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-offset-2 focus-visible:after:ring-offset-background"
            >
              {trail.title}
            </Link>
          </h3>
          <p className="max-w-prose text-pretty text-muted-foreground">{trail.promise}</p>
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            {trail.time} · {trail.steps.length} steps
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <ArtifactChip id={trail.from} />
            <ArtifactChip id={trail.to} kind="out" />
          </div>
          <TrailLane steps={trail.steps.length} />
          <p className="flex items-start justify-between gap-4 text-sm text-muted-foreground">
            <span className="min-w-0">
              {trail.steps
                .slice(0, 3)
                .map((step) => step.tool)
                .join(", ")}
              {trail.steps.length > 3 && ` +${trail.steps.length - 3} more`}
            </span>
            <ArrowRightIcon
              aria-hidden
              className="mt-0.5 size-4 shrink-0 transition-transform duration-[var(--motion-base)] ease-[var(--motion-ease-handoff)] group-hover/lane:translate-x-1"
            />
          </p>
        </div>
      </div>
    </li>
  );
}
