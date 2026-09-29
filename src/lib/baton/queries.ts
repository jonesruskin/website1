import "server-only";

import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  ne,
  or,
  sql,
  sum,
  type AnyColumn,
} from "drizzle-orm";

import { db } from "@/db";
import {
  batonBlock,
  batonClick,
  batonHandshake,
  batonImpression,
  batonLedger,
  batonTool,
  type BatonBlock,
  type BatonHandshake,
  type BatonLedgerEntry,
  type BatonTool,
} from "@/db/schema/baton";
import { getLimit } from "@/lib/billing/entitlements";

import {
  suggestPartners,
  type DirectoryTool,
  type Partner,
  type SuggestedPartners,
} from "./partners";

/*
 * The data layer of the maker app. Every function that takes a userId scopes to
 * that user's own tools. Functions that take a toolId expect the caller to have
 * loaded the tool through getTool(userId, id) first.
 *
 * Counts use credited clicks only, so they always agree with the ledger.
 */

const DAY_MS = 86_400_000;
/** Used when a plan sets no statsDays limit. */
const MAX_STATS_DAYS = 365;

const dayKey = (column: AnyColumn) => sql<string>`to_char(${column}, 'YYYY-MM-DD')`;

export type DailyPoint = { date: string; sent: number; received: number; impressions: number };

export type Overview = {
  /** The window actually used (requested days, clamped by the plan). */
  days: number;
  /** The plan's longest window. */
  maxDays: number;
  credits: number;
  toolCount: number;
  sent: number;
  received: number;
  impressions: number;
  series: DailyPoint[];
};

export type ToolStats = Omit<Overview, "credits" | "toolCount"> & { clickRate: number | null };

/** Clamps a requested window to [1, plan statsDays]. */
export async function clampStatsDays(userId: string, requested: number) {
  const limit = await getLimit(userId, "statsDays");
  const maxDays = Number.isFinite(limit) ? limit : MAX_STATS_DAYS;
  const wanted = Number.isFinite(requested) ? Math.floor(requested) : 7;
  return { days: Math.max(1, Math.min(wanted, maxDays)), maxDays };
}

/** UTC calendar days ending today, oldest first, and the start of the first one. */
function dayWindow(days: number) {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const since = new Date(today.getTime() - (days - 1) * DAY_MS);
  const keys = Array.from({ length: days }, (_, i) =>
    new Date(since.getTime() + i * DAY_MS).toISOString().slice(0, 10),
  );
  return { since, keys };
}

async function buildSeries(toolIds: string[], days: number) {
  const { since, keys } = dayWindow(days);
  const points = new Map<string, DailyPoint>(
    keys.map((date) => [date, { date, sent: 0, received: 0, impressions: 0 }]),
  );
  if (toolIds.length === 0)
    return { series: [...points.values()], sent: 0, received: 0, impressions: 0 };

  const [sentRows, receivedRows, impressionRows] = await Promise.all([
    db
      .select({ day: dayKey(batonClick.createdAt), value: count() })
      .from(batonClick)
      .where(
        and(
          inArray(batonClick.hostToolId, toolIds),
          eq(batonClick.credited, true),
          gte(batonClick.createdAt, since),
        ),
      )
      .groupBy(dayKey(batonClick.createdAt)),
    db
      .select({ day: dayKey(batonClick.createdAt), value: count() })
      .from(batonClick)
      .where(
        and(
          inArray(batonClick.shownToolId, toolIds),
          eq(batonClick.credited, true),
          gte(batonClick.createdAt, since),
        ),
      )
      .groupBy(dayKey(batonClick.createdAt)),
    db
      .select({ day: dayKey(batonImpression.createdAt), value: count() })
      .from(batonImpression)
      .where(
        and(inArray(batonImpression.hostToolId, toolIds), gte(batonImpression.createdAt, since)),
      )
      .groupBy(dayKey(batonImpression.createdAt)),
  ]);

  for (const row of sentRows) {
    const point = points.get(row.day);
    if (point) point.sent = row.value;
  }
  for (const row of receivedRows) {
    const point = points.get(row.day);
    if (point) point.received = row.value;
  }
  for (const row of impressionRows) {
    const point = points.get(row.day);
    if (point) point.impressions = row.value;
  }

  const series = [...points.values()];
  return {
    series,
    sent: series.reduce((total, p) => total + p.sent, 0),
    received: series.reduce((total, p) => total + p.received, 0),
    impressions: series.reduce((total, p) => total + p.impressions, 0),
  };
}

export async function listTools(userId: string): Promise<BatonTool[]> {
  return db
    .select()
    .from(batonTool)
    .where(eq(batonTool.userId, userId))
    .orderBy(asc(batonTool.createdAt));
}

export async function getTool(userId: string, id: string): Promise<BatonTool | null> {
  const [tool] = await db
    .select()
    .from(batonTool)
    .where(and(eq(batonTool.id, id), eq(batonTool.userId, userId)))
    .limit(1);
  return tool ?? null;
}

/** Cheap checks for onboarding and the "next move" card. */
export async function toolFlags(userId: string) {
  const rows = await db
    .select({ id: batonTool.id, installedAt: batonTool.installedAt })
    .from(batonTool)
    .where(eq(batonTool.userId, userId));
  return { hasTool: rows.length > 0, hasLiveTool: rows.some((row) => row.installedAt) };
}

export async function getOverview(userId: string, days: number): Promise<Overview> {
  const [{ days: window, maxDays }, tools] = await Promise.all([
    clampStatsDays(userId, days),
    db
      .select({ id: batonTool.id, credits: batonTool.credits })
      .from(batonTool)
      .where(eq(batonTool.userId, userId)),
  ]);
  const totals = await buildSeries(
    tools.map((tool) => tool.id),
    window,
  );
  return {
    days: window,
    maxDays,
    credits: tools.reduce((total, tool) => total + tool.credits, 0),
    toolCount: tools.length,
    ...totals,
  };
}

/** Per-tool stats. Clamps `days` by the owner's plan. */
export async function getToolStats(toolId: string, days: number): Promise<ToolStats> {
  const [owner] = await db
    .select({ userId: batonTool.userId })
    .from(batonTool)
    .where(eq(batonTool.id, toolId))
    .limit(1);
  const { days: window, maxDays } = owner
    ? await clampStatsDays(owner.userId, days)
    : { days: Math.max(1, Math.floor(days) || 7), maxDays: MAX_STATS_DAYS };
  const totals = await buildSeries(owner ? [toolId] : [], window);
  return {
    days: window,
    maxDays,
    ...totals,
    clickRate: totals.impressions > 0 ? totals.sent / totals.impressions : null,
  };
}

export type ToolTotals = { sent: number; received: number };

/** Sent/received clicks per tool over a window, for the lane board. */
export async function getToolTotals(
  userId: string,
  days: number,
): Promise<Map<string, ToolTotals>> {
  const { days: window } = await clampStatsDays(userId, days);
  const { since } = dayWindow(window);
  const tools = await listTools(userId);
  const ids = tools.map((tool) => tool.id);
  const totals = new Map<string, ToolTotals>(ids.map((id) => [id, { sent: 0, received: 0 }]));
  if (ids.length === 0) return totals;

  const [sent, received] = await Promise.all([
    db
      .select({ id: batonClick.hostToolId, value: count() })
      .from(batonClick)
      .where(
        and(
          inArray(batonClick.hostToolId, ids),
          eq(batonClick.credited, true),
          gte(batonClick.createdAt, since),
        ),
      )
      .groupBy(batonClick.hostToolId),
    db
      .select({ id: batonClick.shownToolId, value: count() })
      .from(batonClick)
      .where(
        and(
          inArray(batonClick.shownToolId, ids),
          eq(batonClick.credited, true),
          gte(batonClick.createdAt, since),
        ),
      )
      .groupBy(batonClick.shownToolId),
  ]);
  for (const row of sent) {
    const entry = totals.get(row.id);
    if (entry) entry.sent = row.value;
  }
  for (const row of received) {
    const entry = totals.get(row.id);
    if (entry) entry.received = row.value;
  }
  return totals;
}

export type LedgerRow = BatonLedgerEntry & { toolName: string };

export async function getLedger(
  userId: string,
  { limit = 20, offset = 0 }: { limit?: number; offset?: number } = {},
): Promise<{ rows: LedgerRow[]; total: number }> {
  const owned = eq(batonTool.userId, userId);
  const [rows, [totalRow]] = await Promise.all([
    db
      .select({ entry: batonLedger, toolName: batonTool.name })
      .from(batonLedger)
      .innerJoin(batonTool, eq(batonLedger.toolId, batonTool.id))
      .where(owned)
      .orderBy(desc(batonLedger.createdAt), desc(batonLedger.id))
      .limit(Math.min(Math.max(limit, 1), 100))
      .offset(Math.max(offset, 0)),
    db
      .select({ value: count() })
      .from(batonLedger)
      .innerJoin(batonTool, eq(batonLedger.toolId, batonTool.id))
      .where(owned),
  ]);
  return {
    rows: rows.map((row) => ({ ...row.entry, toolName: row.toolName })),
    total: totalRow?.value ?? 0,
  };
}

/** Lifetime credits earned and spent by the user's tools, from the ledger. */
export async function getLedgerTotals(userId: string) {
  const [row] = await db
    .select({
      earned: sum(sql`case when ${batonLedger.delta} > 0 then ${batonLedger.delta} else 0 end`),
      spent: sum(sql`case when ${batonLedger.delta} < 0 then -${batonLedger.delta} else 0 end`),
    })
    .from(batonLedger)
    .innerJoin(batonTool, eq(batonLedger.toolId, batonTool.id))
    .where(eq(batonTool.userId, userId));
  return { earned: Number(row?.earned ?? 0), spent: Number(row?.spent ?? 0) };
}

/** Other makers' tools with the click history the ranking uses. */
async function loadDirectory(excludeUserId: string, limit = 500): Promise<DirectoryTool[]> {
  const tools = await db
    .select()
    .from(batonTool)
    .where(and(ne(batonTool.userId, excludeUserId), eq(batonTool.status, "active")))
    .orderBy(desc(batonTool.createdAt))
    .limit(limit);
  if (tools.length === 0) return [];
  const ids = tools.map((tool) => tool.id);
  const [shown, clicked] = await Promise.all([
    db
      .select({ id: batonImpression.shownToolId, value: count() })
      .from(batonImpression)
      .where(inArray(batonImpression.shownToolId, ids))
      .groupBy(batonImpression.shownToolId),
    db
      .select({ id: batonClick.shownToolId, value: count() })
      .from(batonClick)
      .where(and(inArray(batonClick.shownToolId, ids), eq(batonClick.credited, true)))
      .groupBy(batonClick.shownToolId),
  ]);
  const impressions = new Map(shown.map((row) => [row.id, row.value]));
  const clicks = new Map(clicked.map((row) => [row.id, row.value]));
  return tools.map((tool) => ({
    id: tool.id,
    ownerId: tool.userId,
    name: tool.name,
    url: tool.url,
    cardTitle: tool.cardTitle,
    category: tool.category,
    inputs: tool.inputs,
    outputs: tool.outputs,
    status: tool.status,
    credits: tool.credits,
    allowSameCategory: tool.allowSameCategory,
    impressions: impressions.get(tool.id) ?? 0,
    clicks: clicks.get(tool.id) ?? 0,
  }));
}

/** A slim, public-safe copy of the directory for the browser, to compute suggestions live. */
export type DirectoryEntry = Pick<
  DirectoryTool,
  "id" | "name" | "category" | "inputs" | "outputs" | "allowSameCategory" | "credits" | "ownerId"
>;

export async function getDirectory(userId: string): Promise<DirectoryEntry[]> {
  const directory = await loadDirectory(userId);
  return directory.map((tool) => ({
    id: tool.id,
    name: tool.name,
    category: tool.category,
    inputs: tool.inputs,
    outputs: tool.outputs,
    allowSameCategory: tool.allowSameCategory,
    // Only whether they can be shown matters to the engine; never expose balances.
    credits: tool.credits > 0 ? 1 : 0,
    ownerId: "other",
  }));
}

/**
 * "Tools you'd pass to" and "tools that would pass to you" for a saved tool,
 * honoring blocklists (both sides), accepted handshakes and eligibility.
 */
export async function getSuggestedPartners(toolId: string, limit = 6): Promise<SuggestedPartners> {
  const [tool] = await db.select().from(batonTool).where(eq(batonTool.id, toolId)).limit(1);
  if (!tool) return { passesTo: [], receivesFrom: [] };

  const [directory, myBlocks, blocksOnMe, accepted, [impressions], [clicks]] = await Promise.all([
    loadDirectory(tool.userId),
    db.select().from(batonBlock).where(eq(batonBlock.toolId, tool.id)),
    db
      .select()
      .from(batonBlock)
      .where(
        or(eq(batonBlock.blockedToolId, tool.id), eq(batonBlock.blockedCategory, tool.category)),
      ),
    db
      .select()
      .from(batonHandshake)
      .where(
        and(
          eq(batonHandshake.status, "accepted"),
          or(eq(batonHandshake.fromToolId, tool.id), eq(batonHandshake.toToolId, tool.id)),
        ),
      ),
    db
      .select({ value: count() })
      .from(batonImpression)
      .where(eq(batonImpression.shownToolId, tool.id)),
    db
      .select({ value: count() })
      .from(batonClick)
      .where(and(eq(batonClick.shownToolId, tool.id), eq(batonClick.credited, true))),
  ]);

  const hostBlocks = new Map<string, { toolIds: Set<string>; categories: Set<string> }>();
  for (const block of blocksOnMe) {
    const entry = hostBlocks.get(block.toolId) ?? { toolIds: new Set(), categories: new Set() };
    if (block.blockedToolId) entry.toolIds.add(block.blockedToolId);
    if (block.blockedCategory) entry.categories.add(block.blockedCategory);
    hostBlocks.set(block.toolId, entry);
  }

  return suggestPartners(
    {
      id: tool.id,
      ownerId: tool.userId,
      category: tool.category,
      inputs: tool.inputs,
      outputs: tool.outputs,
      status: tool.status,
      credits: tool.credits,
      allowSameCategory: tool.allowSameCategory,
      impressions: impressions?.value ?? 0,
      clicks: clicks?.value ?? 0,
    },
    directory,
    {
      limit,
      blockedToolIds: new Set(myBlocks.flatMap((b) => (b.blockedToolId ? [b.blockedToolId] : []))),
      blockedCategories: new Set(
        myBlocks.flatMap((b) => (b.blockedCategory ? [b.blockedCategory] : [])),
      ),
      handshakes: new Set(
        accepted.map((h) => (h.fromToolId === tool.id ? h.toToolId : h.fromToolId)),
      ),
      hostBlocks,
    },
  );
}

export type { Partner };

export type HandshakeRow = BatonHandshake & {
  direction: "incoming" | "outgoing";
  /** The other side of the pairing. */
  partner: { id: string; name: string; url: string; category: string };
};

export async function listHandshakes(toolId: string): Promise<HandshakeRow[]> {
  const rows = await db
    .select()
    .from(batonHandshake)
    .where(or(eq(batonHandshake.fromToolId, toolId), eq(batonHandshake.toToolId, toolId)))
    .orderBy(desc(batonHandshake.createdAt));
  if (rows.length === 0) return [];
  const partnerIds = rows.map((row) => (row.fromToolId === toolId ? row.toToolId : row.fromToolId));
  const partners = await db
    .select({
      id: batonTool.id,
      name: batonTool.name,
      url: batonTool.url,
      category: batonTool.category,
    })
    .from(batonTool)
    .where(inArray(batonTool.id, partnerIds));
  const byId = new Map(partners.map((p) => [p.id, p]));
  return rows.flatMap((row) => {
    const outgoing = row.fromToolId === toolId;
    const partner = byId.get(outgoing ? row.toToolId : row.fromToolId);
    return partner
      ? [{ ...row, direction: outgoing ? ("outgoing" as const) : ("incoming" as const), partner }]
      : [];
  });
}

/** Handshakes the user has proposed (pending or accepted) across all tools: what the plan limit counts. */
export async function countProposedHandshakes(userId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(batonHandshake)
    .innerJoin(batonTool, eq(batonHandshake.fromToolId, batonTool.id))
    .where(
      and(eq(batonTool.userId, userId), inArray(batonHandshake.status, ["pending", "accepted"])),
    );
  return row?.value ?? 0;
}

/** Pending handshakes waiting on this user, across all their tools. */
export async function countPendingIncoming(userId: string) {
  const [row] = await db
    .select({ value: count() })
    .from(batonHandshake)
    .innerJoin(batonTool, eq(batonHandshake.toToolId, batonTool.id))
    .where(and(eq(batonTool.userId, userId), eq(batonHandshake.status, "pending")));
  return row?.value ?? 0;
}

export type BlockRow = BatonBlock & { toolName: string | null };

export async function listBlocks(toolId: string): Promise<BlockRow[]> {
  const rows = await db
    .select({ block: batonBlock, toolName: batonTool.name })
    .from(batonBlock)
    .leftJoin(batonTool, eq(batonBlock.blockedToolId, batonTool.id))
    .where(eq(batonBlock.toolId, toolId))
    .orderBy(desc(batonBlock.createdAt));
  return rows.map((row) => ({ ...row.block, toolName: row.toolName }));
}
