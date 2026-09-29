import { describe, expect, it } from "vitest";

import { CLICK_TOKEN_TTL_SECONDS, createSiteKey, signClickToken, verifyClickToken, visitorHash } from "./token";

const secret = "test-secret-test-secret-test-secret";
const payload = { i: "imp", h: "host", s: "shown" };

describe("click tokens", () => {
  it("round-trips", () => {
    const token = signClickToken(payload, secret);
    expect(verifyClickToken(token, secret)).toMatchObject(payload);
  });
  it("rejects tampering, wrong secrets and garbage", () => {
    const token = signClickToken(payload, secret);
    const [body, sig] = token.split(".");
    const forged = Buffer.from(JSON.stringify({ ...payload, s: "other", e: 9e9 })).toString("base64url");
    expect(verifyClickToken(`${forged}.${sig}`, secret)).toBeNull();
    expect(verifyClickToken(`${body}.${sig}x`, secret)).toBeNull();
    expect(verifyClickToken(token, "another-secret")).toBeNull();
    expect(verifyClickToken("nope", secret)).toBeNull();
    expect(verifyClickToken(`${token}.x`, secret)).toBeNull();
  });
  it("expires", () => {
    const now = Date.now();
    const token = signClickToken(payload, secret, now);
    expect(verifyClickToken(token, secret, now + (CLICK_TOKEN_TTL_SECONDS + 1) * 1000)).toBeNull();
  });
});

describe("visitorHash", () => {
  it("is stable within a day and rotates across days", () => {
    const d1 = new Date("2026-09-29T10:00:00Z");
    const d1b = new Date("2026-09-29T22:00:00Z");
    const d2 = new Date("2026-09-30T10:00:00Z");
    expect(visitorHash("1.2.3.4", "ua", secret, d1)).toBe(visitorHash("1.2.3.4", "ua", secret, d1b));
    expect(visitorHash("1.2.3.4", "ua", secret, d1)).not.toBe(visitorHash("1.2.3.4", "ua", secret, d2));
  });
});

it("creates distinct site keys", () => {
  const a = createSiteKey();
  expect(a).toMatch(/^bk_[\w-]{20}$/);
  expect(createSiteKey()).not.toBe(a);
});
