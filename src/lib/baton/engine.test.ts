import { describe, expect, it } from "vitest";

import { EMBED_SOURCE } from "./embed-source";
import {
  appendRef,
  clientIp,
  creditDecision,
  displayHost,
  isLikelyBot,
  MAX_CREDITED_PER_HOST,
  MAX_CREDITED_PER_IP_PER_HOST,
  normalizeCtx,
  showBadge,
  slugify,
  type CreditFacts,
} from "./rules";
import { isArtifact } from "./taxonomy";

const headers = (init: Record<string, string>) => ({
  get: (name: string) => init[name.toLowerCase()] ?? null,
});

describe("appendRef", () => {
  it("adds ref=baton and keeps the rest of the URL", () => {
    expect(appendRef("https://tool.example/app?a=1#top")).toBe(
      "https://tool.example/app?a=1&ref=baton#top",
    );
    expect(appendRef("http://tool.example")).toBe("http://tool.example/?ref=baton");
  });
  it("replaces an existing ref instead of stacking", () => {
    expect(appendRef("https://tool.example/?ref=x&b=2")).toBe(
      "https://tool.example/?ref=baton&b=2",
    );
  });
  it("refuses anything that is not http(s)", () => {
    expect(appendRef("javascript:alert(1)")).toBeNull();
    expect(appendRef("data:text/html,hi")).toBeNull();
    expect(appendRef("ftp://x.example")).toBeNull();
    expect(appendRef("not a url")).toBeNull();
  });
});

describe("clientIp", () => {
  it("takes the first x-forwarded-for entry", () => {
    expect(clientIp(headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" }))).toBe("203.0.113.9");
  });
  it("falls back to x-real-ip, then unknown", () => {
    expect(clientIp(headers({ "x-real-ip": "198.51.100.4" }))).toBe("198.51.100.4");
    expect(clientIp(headers({}))).toBe("unknown");
  });
});

const facts = (over: Partial<CreditFacts> = {}): CreditFacts => ({
  hostActive: true,
  shownActive: true,
  shownCredits: 5,
  visitorToShown: 0,
  visitorFromHost: 0,
  ...over,
});

describe("creditDecision", () => {
  it("credits a clean click", () => {
    expect(creditDecision(facts())).toEqual({ credited: true });
  });
  it("caps one network address per host, however many user agents it rotates", () => {
    expect(creditDecision(facts({ ipFromHost: MAX_CREDITED_PER_IP_PER_HOST - 1 })).credited).toBe(
      true,
    );
    expect(creditDecision(facts({ ipFromHost: MAX_CREDITED_PER_IP_PER_HOST }))).toEqual({
      credited: false,
      reason: "ip-cap",
    });
  });
  it("does not credit a tool with no credits left", () => {
    expect(creditDecision(facts({ shownCredits: 0 }))).toEqual({
      credited: false,
      reason: "no-credits",
    });
  });
  it("credits the last credit", () => {
    expect(creditDecision(facts({ shownCredits: 1 })).credited).toBe(true);
  });
  it("does not credit the same visitor twice for the same shown tool", () => {
    expect(creditDecision(facts({ visitorToShown: 1 }))).toEqual({
      credited: false,
      reason: "repeat-visitor",
    });
  });
  it("caps credited clicks per visitor per host", () => {
    expect(creditDecision(facts({ visitorFromHost: MAX_CREDITED_PER_HOST - 1 })).credited).toBe(
      true,
    );
    expect(creditDecision(facts({ visitorFromHost: MAX_CREDITED_PER_HOST }))).toEqual({
      credited: false,
      reason: "host-cap",
    });
  });
  it("never credits bots or inactive tools", () => {
    expect(creditDecision(facts({ bot: true })).credited).toBe(false);
    expect(creditDecision(facts({ shownActive: false })).credited).toBe(false);
    expect(creditDecision(facts({ hostActive: false })).credited).toBe(false);
  });
});

describe("isLikelyBot", () => {
  it("flags crawlers, previewers and empty agents but not browsers", () => {
    expect(isLikelyBot("")).toBe(true);
    expect(
      isLikelyBot("Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"),
    ).toBe(true);
    expect(isLikelyBot("Slackbot-LinkExpanding 1.0")).toBe(true);
    expect(
      isLikelyBot("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/126 Safari/537.36"),
    ).toBe(false);
    expect(isLikelyBot("Mozilla/5.0 (X11; Linux x86_64) HeadlessChrome/126 Safari/537.36")).toBe(
      false,
    );
  });
});

describe("badge and helpers", () => {
  it("hides the badge only on paid plans", () => {
    expect(showBadge("free")).toBe(true);
    expect(showBadge(null)).toBe(true);
    expect(showBadge("pro")).toBe(false);
    expect(showBadge("enterprise")).toBe(false);
  });
  it("normalizes ctx to a known artifact id", () => {
    expect(normalizeCtx(" PDF ", isArtifact)).toBe("pdf");
    expect(normalizeCtx("<script>", isArtifact)).toBeNull();
    expect(normalizeCtx("nonsense", isArtifact)).toBeNull();
    expect(normalizeCtx(undefined, isArtifact)).toBeNull();
  });
  it("shows a bare host", () => {
    expect(displayHost("https://www.squeeze.app/x?y=1")).toBe("squeeze.app");
    expect(displayHost("nope")).toBe("");
  });
  it("slugifies names", () => {
    expect(slugify("Demo · Squeeze PDF")).toBe("demo-squeeze-pdf");
    expect(slugify("Café Déjà Vu!!")).toBe("cafe-deja-vu");
    expect(slugify("★★★")).toBe("tool");
    expect(slugify("a".repeat(100)).length).toBe(40);
  });
});

describe("embed script", () => {
  it("stays under 6,000 bytes and parses as a script", () => {
    expect(Buffer.byteLength(EMBED_SOURCE)).toBeLessThan(6000);
    expect(() => new Function(EMBED_SOURCE)).not.toThrow();
  });
  it("never writes API data as markup", () => {
    expect(EMBED_SOURCE).not.toMatch(
      /innerHTML|outerHTML|insertAdjacentHTML|document\.write|eval\(/,
    );
  });
  it("avoids syntax newer than ES2019", () => {
    expect(EMBED_SOURCE).not.toMatch(/\?\.|\?\?/);
  });
});
