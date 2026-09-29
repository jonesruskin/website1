import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { BatonPill, Lanes, MicroLabel, PageHead } from "@/components/baton/app/page-head";
import { ToolLanes } from "@/components/baton/app/tool-lanes";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/session";
import { getLimit } from "@/lib/billing/entitlements";
import { getToolTotals, listTools } from "@/lib/baton/queries";
import { STARTER_CREDITS } from "@/lib/baton/tools-core";

export const metadata: Metadata = { title: "Tools", robots: { index: false } };

export default async function ToolsPage() {
  const { user } = await requireSession("/tools");
  const [tools, limit, totals] = await Promise.all([
    listTools(user.id),
    getLimit(user.id, "tools"),
    getToolTotals(user.id, 7),
  ]);
  const atLimit = tools.length >= limit;
  const limitLabel = Number.isFinite(limit) ? String(limit) : "∞";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <PageHead
        eyebrow={`Lane board · ${tools.length} of ${limitLabel}`}
        title="Your tools"
        description="Each tool runs its own lane: a card that other tools show at their success moment, and a snippet that shows theirs at yours."
        actions={
          tools.length > 0 &&
          (atLimit ? (
            <Button asChild variant="outline">
              <Link href="/pricing">Upgrade for more tools</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/tools/new">
                <PlusIcon aria-hidden />
                Add a tool
              </Link>
            </Button>
          ))
        }
      />

      {tools.length === 0 ? (
        <section
          aria-labelledby="empty-title"
          className="relative grid gap-8 overflow-hidden rounded-xl border bg-card p-6 [--lane-gap:3.5rem] sm:p-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center"
        >
          <Lanes />
          <div className="relative grid gap-5">
            <MicroLabel className="flex items-center gap-2">
              <BatonPill />
              Lane 01 · empty
            </MicroLabel>
            <h2
              id="empty-title"
              className="font-display text-4xl leading-[0.95] font-bold tracking-tight text-balance sm:text-5xl"
              style={{ fontStretch: "80%" }}
            >
              Your first tool starts with{" "}
              <span className="text-signal-ink">{STARTER_CREDITS} credits</span>.
            </h2>
            <p className="max-w-prose text-pretty text-muted-foreground">
              Tell Baton what people leave your tool with and what they bring to it. Write one card,
              paste one script tag, and call <code className="font-mono text-sm">baton.pass()</code>{" "}
              when the job is done.
            </p>
            <div>
              <Button asChild size="lg">
                <Link href="/tools/new">
                  <PlusIcon aria-hidden />
                  Add your first tool
                </Link>
              </Button>
            </div>
          </div>
          <ol className="relative grid gap-3 font-mono text-xs tracking-widest uppercase">
            {[
              ["01", "Describe the journey", "Outputs in, inputs out"],
              ["02", "Write the card", "One title, one button"],
              ["03", "Paste the snippet", "Live on the first pass"],
            ].map(([n, title, hint]) => (
              <li
                key={n}
                className="flex items-baseline gap-4 rounded-lg border bg-background/80 p-4"
              >
                <span className="text-lg text-signal-ink">{n}</span>
                <span className="grid gap-0.5">
                  <span className="text-foreground">{title}</span>
                  <span className="tracking-normal text-muted-foreground normal-case">{hint}</span>
                </span>
              </li>
            ))}
          </ol>
        </section>
      ) : (
        <>
          {atLimit && (
            <Alert>
              <AlertDescription>
                <p>
                  You&apos;re using all {limitLabel} {limit === 1 ? "tool" : "tools"} on your plan.{" "}
                  <Link
                    href="/pricing"
                    className="font-medium text-foreground underline underline-offset-4"
                  >
                    See plans
                  </Link>{" "}
                  to add more.
                </p>
              </AlertDescription>
            </Alert>
          )}
          <ToolLanes tools={tools} totals={totals} days={7} />
        </>
      )}
    </div>
  );
}
