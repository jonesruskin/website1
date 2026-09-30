import { LockIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { LaneSection, MicroLabel, PageHead } from "@/components/baton/app/page-head";
import { PassesChart } from "@/components/baton/app/passes-chart";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { requireSession } from "@/lib/auth/session";
import { hasStudio } from "@/lib/baton/plan-features";
import { formatDelta, formatNumber, ledgerReason, ledgerReasons, plural } from "@/lib/baton/format";
import {
  clampStatsDays,
  getLedger,
  getLedgerTotals,
  getOverview,
  listTools,
} from "@/lib/baton/queries";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Credits", robots: { index: false } };

const PAGE_SIZE = 15;
const MAX_PAGE = 10_000;
const RANGES = [7, 14, 30, 90] as const;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

export default async function CreditsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string | string[]; page?: string | string[] }>;
}) {
  const { user } = await requireSession("/credits");
  const query = await searchParams;
  const requested = Number(first(query.range));
  // Clamped: an absurd ?page= would overflow the SQL offset.
  const page = Math.min(MAX_PAGE, Math.max(1, Math.floor(Number(first(query.page))) || 1));

  const { maxDays } = await clampStatsDays(user.id, 7);
  const range = RANGES.includes(requested as (typeof RANGES)[number])
    ? Math.min(requested, maxDays)
    : Math.min(14, maxDays);

  const [tools, overview, ledger, totals, studio] = await Promise.all([
    listTools(user.id),
    getOverview(user.id, range),
    getLedger(user.id, { limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
    getLedgerTotals(user.id),
    hasStudio(user.id),
  ]);
  const pageCount = Math.max(1, Math.ceil(ledger.total / PAGE_SIZE));
  const broke = tools.filter((tool) => tool.credits < 1);
  const href = (p: number) => `/credits?range=${range}${p > 1 ? `&page=${p}` : ""}#ledger`;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      <PageHead
        eyebrow="Credits"
        title="Your balance"
        description="Every pass you make earns a credit. Every visitor another tool receives from you costs one. Nothing else moves them."
      />

      <section
        aria-label="Balance"
        className="relative grid gap-8 overflow-hidden rounded-xl border bg-card p-6 [--lane-gap:2.75rem] sm:p-10 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end"
      >
        <div className="relative grid gap-3">
          <MicroLabel>Balance across {plural(tools.length, "tool")}</MicroLabel>
          <p
            className="font-mono text-[clamp(5rem,22vw,10rem)] leading-[0.85] font-semibold tracking-tighter text-signal-ink tabular-nums"
            aria-label={`${overview.credits} credits`}
          >
            {formatNumber(overview.credits)}
          </p>
        </div>
        <dl className="relative grid grid-cols-2 gap-4 lg:grid-cols-1">
          <div className="grid gap-1 border-t pt-3">
            <dt>
              <MicroLabel>Earned, all time</MicroLabel>
            </dt>
            <dd className="font-mono text-2xl font-semibold tabular-nums">
              {formatDelta(totals.earned)}
            </dd>
          </div>
          <div className="grid gap-1 border-t pt-3">
            <dt>
              <MicroLabel>Spent, all time</MicroLabel>
            </dt>
            <dd className="font-mono text-2xl font-semibold tabular-nums">
              {formatDelta(-totals.spent)}
            </dd>
          </div>
        </dl>
        {tools.length > 1 && (
          <ul className="relative grid gap-2 border-t pt-4 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <li key={tool.id} className="flex items-baseline justify-between gap-3 text-sm">
                <Link
                  href={`/tools/${tool.id}`}
                  className="truncate underline-offset-4 hover:underline"
                >
                  {tool.name}
                </Link>
                <span className="font-mono tabular-nums">{formatNumber(tool.credits)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {tools.length === 0 && (
        <Alert>
          <AlertDescription>
            <p>
              You don&apos;t have a tool yet.{" "}
              <Link
                href="/tools/new"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Add one
              </Link>{" "}
              to get 10 starter credits.
            </p>
          </AlertDescription>
        </Alert>
      )}
      {broke.length > 0 && (
        <Alert variant="warning">
          <AlertDescription>
            <p className="text-foreground">
              {broke.map((tool) => tool.name).join(", ")} {broke.length === 1 ? "has" : "have"} no
              credits, so {broke.length === 1 ? "its" : "their"} card isn&apos;t shown. Passes from
              your own tools earn credits back.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <LaneSection
        id="activity"
        index={1}
        total={2}
        title="Sent and received"
        description={`The last ${range} days, by day (UTC). Only clicks that moved credits are counted.`}
        actions={
          <nav aria-label="Time range" className="flex items-center gap-1 rounded-md border p-0.5">
            {RANGES.map((r) => {
              const locked = r > maxDays;
              const active = r === range;
              if (locked) {
                return (
                  <span
                    key={r}
                    aria-disabled="true"
                    title="Longer history is part of a paid plan"
                    className="flex items-center gap-1 rounded-sm px-2.5 py-1 font-mono text-xs text-muted-foreground/60"
                  >
                    <LockIcon aria-hidden className="size-3" />
                    {r}d
                  </span>
                );
              }
              return (
                <Link
                  key={r}
                  href={`/credits?range=${r}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-sm px-2.5 py-1 font-mono text-xs transition-colors",
                    active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {r}d
                </Link>
              );
            })}
          </nav>
        }
      >
        <div className="rounded-xl border bg-card p-4 sm:p-6">
          <PassesChart id="credits-chart" series={overview.series} />
        </div>
        {maxDays < 90 && (
          <p className="mt-3 text-sm text-muted-foreground">
            Your plan keeps {maxDays} days of stats.{" "}
            <Link
              href="/pricing"
              className="font-medium text-foreground underline underline-offset-4"
            >
              Longer history on paid plans
            </Link>
            .
          </p>
        )}
      </LaneSection>

      <LaneSection
        id="ledger"
        index={2}
        total={2}
        title="Ledger"
        description="Every credit that ever moved, newest first. Your balance is the sum of this list."
        actions={
          studio ? (
            <Button asChild variant="outline" size="sm">
              <a href="/credits/export" download>
                Export CSV
              </a>
            </Button>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <Link href="/pricing">CSV export · Studio</Link>
            </Button>
          )
        }
      >
        {ledger.rows.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            Nothing here yet. Your first entry appears when you add a tool.
          </p>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card">
            <Table>
              <caption className="sr-only">
                Credit ledger, page {page} of {pageCount}
              </caption>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead scope="col">When</TableHead>
                  <TableHead scope="col" className="hidden sm:table-cell">
                    Tool
                  </TableHead>
                  <TableHead scope="col">What happened</TableHead>
                  <TableHead scope="col" className="text-right">
                    Credits
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledger.rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="font-mono text-xs whitespace-nowrap text-muted-foreground">
                      <time dateTime={row.createdAt.toISOString()}>
                        {row.createdAt.toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                          timeZone: "UTC",
                        })}
                      </time>
                    </TableCell>
                    <TableCell className="hidden max-w-40 truncate sm:table-cell">
                      {row.toolName}
                    </TableCell>
                    <TableCell>
                      <span className="whitespace-nowrap">{ledgerReason(row.reason)}</span>
                      <span className="block truncate text-xs text-muted-foreground sm:hidden">
                        {row.toolName}
                      </span>
                      <span className="hidden text-xs text-muted-foreground lg:block">
                        {ledgerReasons[row.reason]?.hint}
                      </span>
                    </TableCell>
                    <TableCell
                      className={cn(
                        "text-right font-mono font-semibold tabular-nums",
                        row.delta > 0 ? "text-signal-ink" : "text-foreground",
                      )}
                    >
                      {formatDelta(row.delta)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <Pagination page={page} pageCount={pageCount} href={href} className="mt-4" />
        {tools.length > 0 && (
          <div className="mt-6">
            <Button asChild variant="outline" size="sm">
              <Link href="/network">See who you could pass to</Link>
            </Button>
          </div>
        )}
      </LaneSection>
    </div>
  );
}
