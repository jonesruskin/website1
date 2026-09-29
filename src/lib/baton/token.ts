import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";

/**
 * Signed click tokens. The card API hands out `/r/<token>` links; the redirect
 * verifies the signature before it credits anyone, so a click can't be forged
 * for an impression that never happened, or pointed at another tool.
 *
 * Kept free of `server-only` and env imports so it can be unit tested; callers
 * pass the secret (see ./secret.ts).
 */

export type ClickPayload = {
  /** Impression id. */
  i: string;
  /** Host tool id (earns the credit). */
  h: string;
  /** Shown tool id (spends the credit, receives the visitor). */
  s: string;
  /** Expiry, unix seconds. */
  e: number;
};

export const CLICK_TOKEN_TTL_SECONDS = 60 * 60 * 24;

const b64url = (input: Buffer | string) => Buffer.from(input).toString("base64url");

function mac(secret: string, body: string) {
  return createHmac("sha256", `${secret}:baton-click`).update(body).digest("base64url");
}

export function signClickToken(payload: Omit<ClickPayload, "e">, secret: string, now = Date.now()) {
  const full: ClickPayload = { ...payload, e: Math.floor(now / 1000) + CLICK_TOKEN_TTL_SECONDS };
  const body = b64url(JSON.stringify(full));
  return `${body}.${mac(secret, body)}`;
}

export function verifyClickToken(token: string, secret: string, now = Date.now()): ClickPayload | null {
  const [body, signature, extra] = token.split(".");
  if (!body || !signature || extra !== undefined) return null;
  const expected = Buffer.from(mac(secret, body));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as ClickPayload;
    if (
      typeof payload.i !== "string" ||
      typeof payload.h !== "string" ||
      typeof payload.s !== "string" ||
      typeof payload.e !== "number"
    ) {
      return null;
    }
    if (payload.e * 1000 < now) return null;
    return payload;
  } catch {
    return null;
  }
}

/**
 * Privacy-preserving visitor fingerprint for fraud rules: rotates daily, so the
 * same person can't be followed across days and raw IPs are never stored.
 */
export function visitorHash(ip: string, userAgent: string, secret: string, now = new Date()) {
  const day = now.toISOString().slice(0, 10);
  return createHash("sha256").update(`${secret}:${day}:${ip}:${userAgent}`).digest("hex").slice(0, 32);
}

/** Public embed key: "bk_" + 20 random base62-ish chars. */
export function createSiteKey() {
  return `bk_${randomBytes(15).toString("base64url")}`;
}
