import { ArrowUpRightIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { BatonTool } from "@/db/schema/baton";
import { formatNumber, hostOf, lane } from "@/lib/baton/format";
import type { ToolTotals } from "@/lib/baton/queries";
import { categoryLabel } from "@/lib/baton/taxonomy";

import { cn } from "@/lib/utils";

import { MicroLabel } from "./page-head";
import { InstallStatus, StatusPill } from "./tool-status";

/**
 * The lane board: one numbered row per tool, credits as the big number,
 * install status as a pulsing or solid dot, and the links you need next.
 */
export function ToolLanes({
  tools,
  totals,
  days,
}: {
  tools: BatonTool[];
  totals: Map<string, ToolTotals>;
  days: number;
}) {
  return (
    <ol className="divide-y overflow-hidden rounded-xl border bg-card shadow-xs">
      {tools.map((tool, index) => {
        const t = totals.get(tool.id) ?? { sent: 0, received: 0 };
        return (
          <li key={tool.id} className="relative">
            <span
              aria-hidden
              className={cn(
                "absolute inset-y-0 left-0 w-1",
                tool.status === "paused" ? "bg-border" : "bg-signal",
              )}
            />
            <div className="grid gap-x-6 gap-y-4 p-4 pl-5 sm:p-5 sm:pl-6 lg:grid-cols-[2.5rem_minmax(0,1.5fr)_8rem_minmax(0,1fr)_auto] lg:items-center">
              <span className="hidden font-mono text-sm text-muted-foreground lg:block">
                {lane(index)}
              </span>

              <div className="grid min-w-0 gap-1.5">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                  <span className="font-mono text-xs text-muted-foreground lg:hidden">
                    {lane(index)}
                  </span>
                  <h2 className="truncate font-display text-lg leading-tight font-semibold tracking-tight">
                    <Link href={`/tools/${tool.id}`} className="underline-offset-4 hover:underline">
                      {tool.name}
                    </Link>
                  </h2>
                  <StatusPill status={tool.status} />
                </div>
                <p className="truncate text-sm text-muted-foreground">
                  {hostOf(tool.url)} · {categoryLabel(tool.category)}
                </p>
              </div>

              <div className="flex items-baseline gap-2 lg:grid lg:gap-0">
                <p
                  className="font-mono text-4xl leading-none font-semibold text-signal-ink tabular-nums"
                  aria-label={`${tool.credits} credits`}
                >
                  {formatNumber(tool.credits)}
                </p>
                <MicroLabel aria-hidden className="lg:mt-1.5">
                  credits
                </MicroLabel>
              </div>

              <div className="grid gap-1.5">
                <InstallStatus installedAt={tool.installedAt} />
                <p className="font-mono text-xs text-muted-foreground">
                  {days}d · {formatNumber(t.sent)} sent · {formatNumber(t.received)} received
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 lg:justify-end">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/tools/${tool.id}`}>Edit</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/tools/${tool.id}#install`}>Snippet</Link>
                </Button>
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/network?tool=${tool.id}`}>Network</Link>
                </Button>
                <Button asChild variant="ghost" size="icon-sm">
                  <a href={tool.url} target="_blank" rel="noopener noreferrer">
                    <ArrowUpRightIcon aria-hidden />
                    <span className="sr-only">Open {tool.name} (new tab)</span>
                  </a>
                </Button>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
