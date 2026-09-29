import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { artifactGroups, artifacts, categories } from "./taxonomy";

const doc = readFileSync(
  path.join(process.cwd(), "content/docs/network/inputs-and-outputs.mdx"),
  "utf8",
);

describe("docs: inputs and outputs", () => {
  it("lists every artifact, group and category in the taxonomy", () => {
    for (const artifact of artifacts) expect(doc).toContain(`\`${artifact.id}\``);
    for (const group of artifactGroups) expect(doc).toContain(`### ${group}`);
    for (const category of categories) expect(doc).toContain(`\`${category.id}\``);
  });
});
