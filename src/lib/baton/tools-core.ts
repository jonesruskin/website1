import "server-only";

import { eq } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { batonLedger, batonTool, type BatonTool } from "@/db/schema/baton";

import { artifactIds, categoryIds } from "./taxonomy";
import { createSiteKey } from "./token";

/** Credits every new tool starts with, recorded in the ledger as `starter`. */
export const STARTER_CREDITS = 10;

const artifactList = artifactIds as [string, ...string[]];

/** What a maker submits when registering or editing a tool. Shared by the dashboard and the API. */
export const toolInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be 2 to 60 characters.")
    .max(60, "Name must be 2 to 60 characters."),
  url: z
    .url({ protocol: /^https?$/, error: "Enter a full http(s) URL, e.g. https://example.com." })
    .max(500, "That URL is too long."),
  description: z.string().trim().max(200, "Keep the description under 200 characters."),
  category: z.enum(categoryIds as [string, ...string[]], { error: "Pick the closest category." }),
  inputs: z.array(z.enum(artifactList)).max(8, "Pick up to 8 inputs."),
  outputs: z
    .array(z.enum(artifactList))
    .min(1, "Pick at least one output: what do people leave with?")
    .max(8, "Pick up to 8 outputs."),
  cardTitle: z
    .string()
    .trim()
    .min(3, "The card title needs 3 to 70 characters.")
    .max(70, "The card title needs 3 to 70 characters."),
  cardBody: z.string().trim().max(120, "Keep the card text under 120 characters."),
  cardCta: z
    .string()
    .trim()
    .min(2, "The button needs 2 to 24 characters.")
    .max(24, "The button needs 2 to 24 characters."),
  allowSameCategory: z.boolean().default(false),
});

export type ToolInput = z.infer<typeof toolInputSchema>;

function slugify(name: string) {
  const base = name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
  return base || "tool";
}

/**
 * Inserts the tool with its starter credits and the matching ledger row in one
 * transaction. The slug is unique: a collision gets a short random suffix.
 */
export async function createToolRecord(userId: string, input: ToolInput): Promise<BatonTool> {
  const base = slugify(input.name);
  return db.transaction(async (tx) => {
    let slug = base;
    for (let attempt = 0; attempt < 6; attempt++) {
      const [taken] = await tx
        .select({ id: batonTool.id })
        .from(batonTool)
        .where(eq(batonTool.slug, slug))
        .limit(1);
      if (!taken) break;
      slug = `${base}-${Math.random().toString(36).slice(2, 6)}`;
    }

    const [tool] = await tx
      .insert(batonTool)
      .values({
        userId,
        name: input.name,
        slug,
        url: input.url,
        description: input.description,
        category: input.category,
        inputs: input.inputs,
        outputs: input.outputs,
        cardTitle: input.cardTitle,
        cardBody: input.cardBody,
        cardCta: input.cardCta,
        allowSameCategory: input.allowSameCategory,
        siteKey: createSiteKey(),
        credits: STARTER_CREDITS,
      })
      .returning();
    if (!tool) throw new Error("Could not create the tool.");

    await tx
      .insert(batonLedger)
      .values({ toolId: tool.id, delta: STARTER_CREDITS, reason: "starter" });
    return tool;
  });
}
