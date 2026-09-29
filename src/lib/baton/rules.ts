/**
 * Pure rules for the network engine: no database, no env, easy to test.
 * The engine (./engine.ts) gathers the facts and these functions decide.
 */

/** Max credited clicks one visitor can earn a single host within the window. */
export const MAX_CREDITED_PER_HOST = 3;
/** Fraud window for the per-visitor rules, in hours. */
export const CREDIT_WINDOW_HOURS = 24;

type HeaderReader = { get(name: string): string | null };

/** Client IP from proxy headers: first `x-forwarded-for` entry, else `x-real-ip`. */
export function clientIp(headers: HeaderReader) {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || "unknown";
}

export function isHttpUrl(value: string) {
  try {
    const { protocol } = new URL(value);
    return protocol === "http:" || protocol === "https:";
  } catch {
    return false;
  }
}

/** Adds `ref=baton` to a URL's query string (replacing any existing `ref`). Null for non-http(s) URLs. */
export function appendRef(url: string, ref = "baton") {
  if (!isHttpUrl(url)) return null;
  const next = new URL(url);
  next.searchParams.set("ref", ref);
  return next.toString();
}

/** Link scanners and crawlers follow redirects too; they never earn credits. */
export function isLikelyBot(userAgent: string) {
  if (!userAgent.trim()) return true;
  return /bot\b|bot\/|crawl|spider|slurp|preview|facebookexternalhit|embedly|whatsapp|telegram|discord|skypeuri/i.test(
    userAgent,
  );
}

export type CreditFacts = {
  hostActive: boolean;
  shownActive: boolean;
  /** The shown tool's balance right now. */
  shownCredits: number;
  /** Credited clicks by this visitor to the shown tool in the window. */
  visitorToShown: number;
  /** Credited clicks by this visitor from this host in the window. */
  visitorFromHost: number;
  bot?: boolean;
};

export type CreditDecision =
  | { credited: true }
  | {
      credited: false;
      reason: "inactive" | "no-credits" | "repeat-visitor" | "host-cap" | "bot";
    };

/** Whether a valid click moves a credit. Every "no" still redirects the visitor. */
export function creditDecision(facts: CreditFacts): CreditDecision {
  if (facts.bot) return { credited: false, reason: "bot" };
  if (!facts.hostActive || !facts.shownActive) return { credited: false, reason: "inactive" };
  if (facts.shownCredits < 1) return { credited: false, reason: "no-credits" };
  if (facts.visitorToShown >= 1) return { credited: false, reason: "repeat-visitor" };
  if (facts.visitorFromHost >= MAX_CREDITED_PER_HOST) {
    return { credited: false, reason: "host-cap" };
  }
  return { credited: true };
}

/** Plans that get to hide the "passed by Baton" mark. */
export const BADGE_FREE_PLANS = ["pro", "enterprise"] as const;

/** The small "passed by Baton" mark shows unless the host owner pays. */
export function showBadge(planId: string | null | undefined) {
  return !(planId && (BADGE_FREE_PLANS as readonly string[]).includes(planId));
}

/** `https://www.example.com/x` becomes `example.com`. */
export function displayHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

const CTX_PATTERN = /^[a-z0-9-]{1,64}$/;

/** A success-moment context is an artifact id; anything else is dropped. */
export function normalizeCtx(ctx: string | null | undefined, isArtifact: (id: string) => boolean) {
  const value = ctx?.trim().toLowerCase();
  return value && CTX_PATTERN.test(value) && isArtifact(value) ? value : null;
}

/** URL-safe slug: ASCII, lowercase, dashes, at most `max` characters. */
export function slugify(name: string, max = 40) {
  const slug = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, max)
    .replace(/-+$/g, "");
  return slug || "tool";
}
