import { describe, expect, it } from "vitest";

import {
  isEligible,
  journeyFit,
  qualityFactor,
  rankNextSteps,
  seededRandom,
  smoothedCtr,
  type MatchCandidate,
} from "./match";

const tool = (over: Partial<MatchCandidate> & { id: string }): MatchCandidate => ({
  ownerId: `owner-${over.id}`,
  category: "other",
  inputs: [],
  outputs: [],
  credits: 10,
  ...over,
});

const host = tool({ id: "compress", category: "documents", outputs: ["pdf"], inputs: ["pdf"] });

describe("journeyFit", () => {
  it("is zero without overlap", () => {
    expect(journeyFit(["pdf"], ["audio"]).fit).toBe(0);
  });
  it("prefers specialists over catch-alls", () => {
    const specialist = journeyFit(["pdf"], ["pdf"]).fit;
    const catchAll = journeyFit(["pdf"], ["pdf", "image", "video", "audio", "text"]).fit;
    expect(specialist).toBeGreaterThan(catchAll);
  });
  it("reports connecting artifacts", () => {
    expect(journeyFit(["pdf", "image"], ["image", "pdf"]).via.sort()).toEqual(["image", "pdf"]);
  });
});

describe("eligibility", () => {
  it("excludes self, same owner, broke, paused and blocked tools", () => {
    expect(isEligible(host, host)).toBe(false);
    expect(isEligible(host, tool({ id: "a", ownerId: host.ownerId }))).toBe(false);
    expect(isEligible(host, tool({ id: "b", credits: 0 }))).toBe(false);
    expect(isEligible(host, tool({ id: "c", status: "paused" }))).toBe(false);
    expect(isEligible(host, tool({ id: "d" }), { blockedToolIds: new Set(["d"]) })).toBe(false);
    expect(isEligible(host, tool({ id: "e", category: "video" }), { blockedCategories: new Set(["video"]) })).toBe(false);
  });
  it("never pairs competitors unless both opt in", () => {
    const rival = tool({ id: "rival", category: "documents", allowSameCategory: true });
    expect(isEligible(host, rival)).toBe(false);
    expect(isEligible({ ...host, allowSameCategory: true }, rival)).toBe(true);
  });
});

describe("rankNextSteps", () => {
  const sign = tool({ id: "sign", category: "productivity", inputs: ["pdf"] });
  const podcast = tool({ id: "podcast", category: "audio", inputs: ["audio"] });
  const ocr = tool({ id: "ocr", category: "writing", inputs: ["pdf", "image", "screenshot"] });

  it("only returns tools that take what the host produces", () => {
    const ids = rankNextSteps(host, [sign, podcast, ocr]).map((r) => r.tool.id);
    expect(ids).toContain("sign");
    expect(ids).toContain("ocr");
    expect(ids).not.toContain("podcast");
  });

  it("ranks accepted handshakes first, even without journey overlap", () => {
    const ranked = rankNextSteps(host, [sign, podcast, ocr], { handshakes: new Set(["podcast"]) });
    expect(ranked[0]?.tool.id).toBe("podcast");
    expect(ranked[0]?.handshake).toBe(true);
  });

  it("narrows to the moment's context", () => {
    const multi = { ...host, outputs: ["pdf", "audio"] };
    expect(rankNextSteps(multi, [sign, podcast]).length).toBe(2);
    expect(rankNextSteps(multi, [sign, podcast], { ctx: "audio" }).map((r) => r.tool.id)).toEqual(["podcast"]);
  });

  it("is deterministic for a seed and respects limit", () => {
    const a = rankNextSteps(host, [sign, ocr], { seed: "imp-1" });
    const b = rankNextSteps(host, [sign, ocr], { seed: "imp-1" });
    expect(a).toEqual(b);
    expect(rankNextSteps(host, [sign, ocr], { limit: 1 })).toHaveLength(1);
  });

  it("rewards tools people actually click", () => {
    const loved = tool({ id: "loved", category: "productivity", inputs: ["pdf"], impressions: 1000, clicks: 200 });
    const ignored = tool({ id: "ignored", category: "writing", inputs: ["pdf"], impressions: 1000, clicks: 2 });
    expect(rankNextSteps(host, [ignored, loved])[0]?.tool.id).toBe("loved");
  });
});

describe("quality and randomness", () => {
  it("starts new tools at the baseline", () => {
    expect(smoothedCtr(0, 0)).toBeCloseTo(0.06);
    expect(qualityFactor(0, 0)).toBeCloseTo(1);
  });
  it("clamps quality", () => {
    expect(qualityFactor(10_000, 10_000)).toBe(1.4);
    expect(qualityFactor(0, 100_000)).toBeCloseTo(0.6, 1);
  });
  it("seededRandom is in [0,1] and stable", () => {
    const r = seededRandom("x");
    expect(r).toBeGreaterThanOrEqual(0);
    expect(r).toBeLessThanOrEqual(1);
    expect(seededRandom("x")).toBe(r);
  });
});
