import "server-only";

import { and, count, desc, eq, gte, inArray, isNull, ne, or, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  batonBlock,
  batonClick,
  batonHandshake,
  batonImpression,
  batonLedger,
  batonTool,
} from "@/db/schema/baton";
import { getPlan } from "@/lib/billing/entitlements";
import { notify } from "@/lib/notifications/notify";

import { rankNextSteps, type MatchCandidate } from "./match";
import {
  appendRef,
  CREDIT_WINDOW_HOURS,
  creditDecision,
  displayHost,
  isLikelyBot,
  normalizeCtx,
  showBadge,
} from "./rules";
import { batonSecret } from "./secret";
import { artifactLabel, isArtifact } from "./taxonomy";
import { signClickToken, verifyClickToken, visitorHash } from "./token";

const CANDIDATE_CAP = 500;
const STATS_DAYS = 30;
const HOUR_MS = 3_600_000;

export class UnknownSiteKeyError extends Error {
  constructor() {
    super("Unknown or inactive site key.");
  }
}

export type PickedCard = {
  card: {
    title: string;
    body: string;
    cta: string;
    tool: { name: string; host: string };
    /** Human labels of the artifacts that connect the two tools, e.g. ["PDF"]. */
    via: string[];
  };
  /** True unless the host owner is on a plan that hides the Baton mark. */
  badge: boolean;
  /** Signed token for `/r/<token>`. */
  token: string;
};

type PickInput = {
  siteKey: string;
  ctx?: string | null;
  ip: string;
  userAgent: string;
  requestId: string;
};

/** Sum per tool over the last 30 days, for the candidates only. */
async function statsFor(toolIds: string[]) {
  const stats = new Map<string, { impressions: number; clicks: number }>();
  if (toolIds.length === 0) return stats;
  const since = new Date(Date.now() - STATS_DAYS * 24 * HOUR_MS);

  const [impressions, clicks] = await Promise.all([
    db
      .select({ toolId: batonImpression.shownToolId, n: count() })
      .from(batonImpression)
      .where(
        and(inArray(batonImpression.shownToolId, toolIds), gte(batonImpression.createdAt, since)),
      )
      .groupBy(batonImpression.shownToolId),
    // Credited clicks only: uncredited repeats cost nothing to fake, so they must not lift a tool's rank.
    db
      .select({ toolId: batonClick.shownToolId, n: count() })
      .from(batonClick)
      .where(
        and(
          inArray(batonClick.shownToolId, toolIds),
          eq(batonClick.credited, true),
          gte(batonClick.createdAt, since),
        ),
      )
      .groupBy(batonClick.shownToolId),
  ]);

  for (const row of impressions) stats.set(row.toolId, { impressions: row.n, clicks: 0 });
  for (const row of clicks) {
    const current = stats.get(row.toolId) ?? { impressions: 0, clicks: 0 };
    stats.set(row.toolId, { ...current, clicks: row.n });
  }
  return stats;
}

/**
 * Picks the one next-step card for a success moment on `siteKey`'s tool,
 * records the impression and returns the card with a signed click token.
 * Returns null when nothing matches. Throws UnknownSiteKeyError for a bad key.
 */
export async function pickCard(input: PickInput): Promise<PickedCard | null> {
  const [host] = await db
    .select()
    .from(batonTool)
    .where(and(eq(batonTool.siteKey, input.siteKey), eq(batonTool.status, "active")))
    .limit(1);
  if (!host) throw new UnknownSiteKeyError();

  const ctx = normalizeCtx(input.ctx, isArtifact);

  const [rows, blocks, handshakes] = await Promise.all([
    db
      .select()
      .from(batonTool)
      .where(
        and(
          eq(batonTool.status, "active"),
          ne(batonTool.userId, host.userId),
          gte(batonTool.credits, 1),
        ),
      )
      .orderBy(desc(batonTool.credits), batonTool.id)
      .limit(CANDIDATE_CAP),
    db.select().from(batonBlock).where(eq(batonBlock.toolId, host.id)),
    db
      .select()
      .from(batonHandshake)
      .where(
        and(
          eq(batonHandshake.status, "accepted"),
          or(eq(batonHandshake.fromToolId, host.id), eq(batonHandshake.toToolId, host.id)),
        ),
      ),
  ]);

  const stats = await statsFor(rows.map((row) => row.id));
  const candidates = rows.map((row) => ({
    ...row,
    ownerId: row.userId,
    impressions: stats.get(row.id)?.impressions ?? 0,
    clicks: stats.get(row.id)?.clicks ?? 0,
  })) satisfies MatchCandidate[];

  const [top] = rankNextSteps({ ...host, ownerId: host.userId }, candidates, {
    ctx,
    seed: input.requestId,
    limit: 1,
    handshakes: new Set(
      handshakes.map((h) => (h.fromToolId === host.id ? h.toToolId : h.fromToolId)),
    ),
    blockedToolIds: new Set(blocks.flatMap((b) => (b.blockedToolId ? [b.blockedToolId] : []))),
    blockedCategories: new Set(
      blocks.flatMap((b) => (b.blockedCategory ? [b.blockedCategory] : [])),
    ),
  });
  if (!top) return null;

  const secret = batonSecret();
  const [impression] = await db
    .insert(batonImpression)
    .values({
      hostToolId: host.id,
      shownToolId: top.tool.id,
      ctx,
      visitorHash: visitorHash(input.ip, input.userAgent, secret),
    })
    .returning({ id: batonImpression.id });
  if (!impression) return null;

  // First card ever served for this tool proves the install.
  const [installed] = await db
    .update(batonTool)
    .set({ installedAt: new Date() })
    .where(and(eq(batonTool.id, host.id), isNull(batonTool.installedAt)))
    .returning({ id: batonTool.id });
  if (installed) {
    await safeNotify(host.userId, {
      title: `${host.name} is live on Baton`,
      body: "The embed just rendered on your site. Cards are on their way.",
      href: `/tools/${host.id}`,
      type: "baton",
    });
  }

  const plan = await getPlan(host.userId).catch(() => null);

  return {
    card: {
      title: top.tool.cardTitle,
      body: top.tool.cardBody,
      cta: top.tool.cardCta,
      tool: { name: top.tool.name, host: displayHost(top.tool.url) },
      via: top.via.map(artifactLabel),
    },
    badge: showBadge(plan?.id),
    token: signClickToken({ i: impression.id, h: host.id, s: top.tool.id }, secret),
  };
}

async function safeNotify(userId: string, input: Parameters<typeof notify>[1]) {
  try {
    await notify(userId, input);
  } catch (error) {
    console.error("[baton] notification failed", error);
  }
}

type RedeemInput = { token: string; ip: string; userAgent: string };

/** Site root: the destination when a tool URL is missing or not http(s). */
const SITE_ROOT = "/";

/**
 * Redeems a click token: records the click, moves the credit when the rules
 * allow, and returns where to send the visitor. Null means the token is
 * invalid, expired or points at nothing; the caller sends the visitor home.
 */
export async function redeemClick(input: RedeemInput): Promise<string | null> {
  const secret = batonSecret();
  const payload = verifyClickToken(input.token, secret);
  if (!payload) return null;

  const [impression] = await db
    .select()
    .from(batonImpression)
    .where(eq(batonImpression.id, payload.i))
    .limit(1);
  if (!impression || impression.hostToolId !== payload.h || impression.shownToolId !== payload.s) {
    return null;
  }

  const visitor = visitorHash(input.ip, input.userAgent, secret);
  const bot = isLikelyBot(input.userAgent);

  const outcome = await db.transaction(async (tx) => {
    // Lock both balances in id order (no deadlocks between opposite pairs).
    // It also serializes concurrent clicks for the same host or shown tool, so
    // the per-visitor counts below can't be raced past their limits.
    const locked = await tx
      .select({
        id: batonTool.id,
        userId: batonTool.userId,
        name: batonTool.name,
        url: batonTool.url,
        status: batonTool.status,
        credits: batonTool.credits,
      })
      .from(batonTool)
      .where(inArray(batonTool.id, [payload.h, payload.s]))
      .orderBy(batonTool.id)
      .for("update");
    const host = locked.find((tool) => tool.id === payload.h);
    const shown = locked.find((tool) => tool.id === payload.s);
    if (!shown) return null;
    const destination = appendRef(shown.url) ?? SITE_ROOT;
    if (!host) return { destination, first: { sent: false, received: false } };

    const since = new Date(Date.now() - CREDIT_WINDOW_HOURS * HOUR_MS);
    const creditedSince = [
      eq(batonClick.visitorHash, visitor),
      eq(batonClick.credited, true),
      gte(batonClick.createdAt, since),
    ];
    // Sequential on purpose: one connection, one transaction.
    const [toShown] = await tx
      .select({ n: count() })
      .from(batonClick)
      .where(and(...creditedSince, eq(batonClick.shownToolId, shown.id)));
    const [fromHost] = await tx
      .select({ n: count() })
      .from(batonClick)
      .where(and(...creditedSince, eq(batonClick.hostToolId, host.id)));

    const decision = creditDecision({
      hostActive: host.status === "active",
      shownActive: shown.status === "active",
      shownCredits: shown.credits,
      visitorToShown: toShown?.n ?? 0,
      visitorFromHost: fromHost?.n ?? 0,
      bot,
    });

    // The unique impression_id makes a repeat of the same link a silent no-op.
    const [click] = await tx
      .insert(batonClick)
      .values({
        impressionId: impression.id,
        hostToolId: host.id,
        shownToolId: shown.id,
        visitorHash: visitor,
        credited: decision.credited,
      })
      .onConflictDoNothing({ target: batonClick.impressionId })
      .returning({ id: batonClick.id });
    const none = { sent: false, received: false };
    if (!click || !decision.credited) return { destination, first: none };

    // Guarded decrement: never below zero, whatever else is going on.
    const spent = await tx
      .update(batonTool)
      .set({ credits: sql`${batonTool.credits} - 1`, updatedAt: new Date() })
      .where(and(eq(batonTool.id, shown.id), gte(batonTool.credits, 1)))
      .returning({ id: batonTool.id });
    if (spent.length === 0) {
      await tx.update(batonClick).set({ credited: false }).where(eq(batonClick.id, click.id));
      return { destination, first: none };
    }
    await tx
      .update(batonTool)
      .set({ credits: sql`${batonTool.credits} + 1`, updatedAt: new Date() })
      .where(eq(batonTool.id, host.id));
    await tx.insert(batonLedger).values([
      { toolId: host.id, delta: 1, reason: "click_sent", clickId: click.id },
      { toolId: shown.id, delta: -1, reason: "click_received", clickId: click.id },
    ]);

    // "First ever" is per owner, across all of their tools.
    const [sent] = await tx
      .select({ n: count() })
      .from(batonClick)
      .innerJoin(batonTool, eq(batonTool.id, batonClick.hostToolId))
      .where(and(eq(batonTool.userId, host.userId), eq(batonClick.credited, true)));
    const [received] = await tx
      .select({ n: count() })
      .from(batonClick)
      .innerJoin(batonTool, eq(batonTool.id, batonClick.shownToolId))
      .where(and(eq(batonTool.userId, shown.userId), eq(batonClick.credited, true)));

    return {
      destination,
      first: { sent: sent?.n === 1, received: received?.n === 1 },
      notify: { host, shown },
    };
  });

  if (!outcome) return null;

  if (outcome.notify) {
    const { host, shown } = outcome.notify;
    if (outcome.first.sent) {
      await safeNotify(host.userId, {
        title: "Your first credit landed",
        body: `Someone finished a task in ${host.name} and followed your card to ${shown.name}. +1 credit.`,
        href: `/tools/${host.id}`,
        type: "baton",
      });
    }
    if (outcome.first.received) {
      await safeNotify(shown.userId, {
        title: "Your first visitor arrived",
        body: `${shown.name} just received a visitor from ${host.name}. That cost 1 credit.`,
        href: `/tools/${shown.id}`,
        type: "baton",
      });
    }
  }

  return outcome.destination;
}
