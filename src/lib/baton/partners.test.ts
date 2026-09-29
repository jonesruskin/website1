import { describe, expect, it } from "vitest";

import { suggestPartners, type DirectoryTool } from "./partners";

const dir = (over: Partial<DirectoryTool> & { id: string }): DirectoryTool => ({
  name: over.id,
  ownerId: `owner-${over.id}`,
  category: "other",
  inputs: [],
  outputs: [],
  credits: 5,
  ...over,
});

const me = {
  id: "me",
  ownerId: "me-owner",
  category: "documents",
  inputs: ["pdf"],
  outputs: ["pdf"],
  credits: 10,
};

describe("suggestPartners", () => {
  const sign = dir({
    id: "sign",
    category: "productivity",
    inputs: ["pdf"],
    outputs: ["signature", "pdf"],
  });
  const podcast = dir({ id: "podcast", category: "audio", inputs: ["audio"], outputs: ["audio"] });

  it("finds tools you'd pass to and tools that would pass to you", () => {
    const result = suggestPartners(me, [sign, podcast]);
    expect(result.passesTo.map((p) => p.tool.id)).toEqual(["sign"]);
    expect(result.receivesFrom.map((p) => p.tool.id)).toEqual(["sign"]);
    expect(result.passesTo[0]?.via).toEqual(["pdf"]);
  });

  it("does not receive from tools that block you, and needs credits to be shown", () => {
    const blocks = new Map([["sign", { toolIds: new Set(["me"]), categories: new Set<string>() }]]);
    expect(suggestPartners(me, [sign], { hostBlocks: blocks }).receivesFrom).toEqual([]);
    expect(suggestPartners({ ...me, credits: 0 }, [sign]).receivesFrom).toEqual([]);
  });

  it("honors your own blocklist and skips competitors", () => {
    expect(
      suggestPartners(me, [sign], { blockedCategories: new Set(["productivity"]) }).passesTo,
    ).toEqual([]);
    const rival = dir({ id: "rival", category: "documents", inputs: ["pdf"], outputs: ["pdf"] });
    expect(suggestPartners(me, [rival]).passesTo).toEqual([]);
  });

  it("marks accepted handshakes and respects the limit", () => {
    const result = suggestPartners(me, [sign, dir({ id: "b", category: "web", inputs: ["pdf"] })], {
      handshakes: new Set(["sign"]),
      limit: 1,
    });
    expect(result.passesTo).toHaveLength(1);
    expect(result.passesTo[0]).toMatchObject({ handshake: true });
  });
});
