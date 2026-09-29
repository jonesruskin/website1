import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { getLimit } from "@/lib/billing/entitlements";
import { formatNumber, plural } from "@/lib/baton/format";
import {
  countPendingIncoming,
  countProposedHandshakes,
  getOverview,
  listTools,
} from "@/lib/baton/queries";
import { STARTER_CREDITS } from "@/lib/baton/tools-core";
import type { BatonTool } from "@/db/schema/baton";

import { BatonPill, MicroLabel } from "./page-head";
import { PassesSparkline } from "./passes-chart";

type Move = { title: string; body: string; cta: string; href: string };

/** The single most useful thing to do next, in order of how much it unblocks. */
function nextMove(input: {
  tools: BatonTool[];
  pendingIncoming: number;
  handshakeLimit: number;
  proposed: number;
}): Move {
  const { tools, pendingIncoming, handshakeLimit, proposed } = input;
  if (tools.length === 0) {
    return {
      title: "Add your first tool",
      body: `Describe what it produces, write one card, and start with ${STARTER_CREDITS} credits.`,
      cta: "Add a tool",
      href: "/tools/new",
    };
  }
  const waiting = tools.find((tool) => !tool.installedAt);
  if (waiting) {
    return {
      title: `Install the snippet on ${waiting.name}`,
      body: "Paste one script tag and call baton.pass() when the job is done. The first card it shows marks the tool live.",
      cta: "Get the snippet",
      href: `/tools/${waiting.id}#install`,
    };
  }
  if (pendingIncoming > 0) {
    return {
      title: `Answer ${plural(pendingIncoming, "handshake request")}`,
      body: "Another maker wants to pair with you. Accepted pairs rank first for each other.",
      cta: "Open your inbox",
      href: "/network#handshakes",
    };
  }
  const broke = tools.find((tool) => tool.credits < 1);
  if (broke) {
    return {
      title: `${broke.name} is out of credits`,
      body: "Its card isn't shown until it earns one. Every pass from your own tools earns a credit.",
      cta: "See the ledger",
      href: "/credits",
    };
  }
  if (handshakeLimit > 0 && proposed === 0) {
    return {
      title: "Propose a handshake",
      body: "Pick a tool you trust and pair with it directly. Accepted pairs rank first, on both sides.",
      cta: "Find a partner",
      href: `/network?tool=${tools[0]!.id}#passes-to`,
    };
  }
  return {
    title: "See who fits next",
    body:
      handshakeLimit > 0
        ? "Check who you'd pass to and who would pass to you."
        : "Check who you'd pass to and who would pass to you. Direct handshakes are part of the paid plans.",
    cta: "Open your network",
    href: `/network?tool=${tools[0]!.id}`,
  };
}

/**
 * The Baton strip at the top of the dashboard: balance, a 7-day sparkline of
 * passes, and one "next move". Server component, scoped to the signed-in user.
 */
export async function BatonOverview({ userId }: { userId: string }) {
  const [tools, overview, handshakeLimit, proposed, pendingIncoming] = await Promise.all([
    listTools(userId),
    getOverview(userId, 7),
    getLimit(userId, "handshakes"),
    countProposedHandshakes(userId),
    countPendingIncoming(userId),
  ]);
  const move = nextMove({ tools, pendingIncoming, handshakeLimit, proposed });
  const sparkLabel = `Passes over the last ${overview.days} days: ${overview.sent} sent, ${overview.received} received.`;

  return (
    <section
      aria-label="Baton overview"
      className="grid gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1.2fr_1.2fr]"
    >
      <div className="grid content-between gap-6 rounded-xl border bg-card p-5 shadow-xs">
        <MicroLabel className="flex items-center gap-2">
          <BatonPill />
          Credits
        </MicroLabel>
        <div className="grid gap-2">
          <p
            className="font-mono text-7xl leading-[0.85] font-semibold tracking-tighter text-signal-ink tabular-nums"
            aria-label={`${overview.credits} credits`}
          >
            {formatNumber(overview.credits)}
          </p>
          <p className="text-sm text-muted-foreground">
            {tools.length === 0
              ? `New tools start with ${STARTER_CREDITS}.`
              : `across ${plural(tools.length, "tool")}. Each pass earns +1.`}
          </p>
        </div>
        <Link
          href="/credits"
          className="inline-flex items-center gap-1 text-sm font-medium text-foreground underline-offset-4 hover:underline"
        >
          Ledger <ArrowRightIcon aria-hidden className="size-3.5" />
        </Link>
      </div>

      <div className="grid content-between gap-5 rounded-xl border bg-card p-5 shadow-xs">
        <MicroLabel>Passes · last {overview.days} days</MicroLabel>
        <dl className="grid grid-cols-2 gap-4">
          <div className="grid gap-1">
            <dt className="flex items-center gap-2 text-sm">
              <span aria-hidden className="h-2 w-4 rounded-full bg-signal" />
              Sent
            </dt>
            <dd className="font-mono text-4xl leading-none font-semibold tabular-nums">
              {formatNumber(overview.sent)}
            </dd>
          </div>
          <div className="grid gap-1">
            <dt className="flex items-center gap-2 text-sm">
              <span aria-hidden className="h-2 w-4 rounded-full bg-foreground/50" />
              Received
            </dt>
            <dd className="font-mono text-4xl leading-none font-semibold tabular-nums">
              {formatNumber(overview.received)}
            </dd>
          </div>
        </dl>
        <PassesSparkline series={overview.series} label={sparkLabel} />
      </div>

      <div className="grid content-between gap-5 rounded-xl border bg-card p-5 shadow-xs md:col-span-2 xl:col-span-1">
        <MicroLabel className="relative flex items-center gap-2">
          <BatonPill />
          Your next move
        </MicroLabel>
        <div className="relative grid gap-2">
          <h2
            className="font-display text-2xl leading-tight font-bold tracking-tight text-balance"
            style={{ fontStretch: "92%" }}
          >
            {move.title}
          </h2>
          <p className="text-sm text-pretty text-muted-foreground">{move.body}</p>
        </div>
        <div className="relative">
          <Button asChild>
            <Link href={move.href}>
              {move.cta}
              <ArrowRightIcon aria-hidden />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
