import "server-only";

import { randomBytes } from "node:crypto";

import { count } from "drizzle-orm";
import { z } from "zod";

import { db } from "@/db";
import { batonLedger, batonTool, type BatonTool } from "@/db/schema/baton";

import { slugify } from "./rules";
import { artifactIds, categoryIds } from "./taxonomy";
import { createSiteKey } from "./token";

/** Credits every new tool starts with (also written to the ledger as reason `starter`). */
export const STARTER_CREDITS = 10;
/** The founding 100: the first tools on the network start with double credits. */
export const FOUNDING_TOOLS = 100;
export const FOUNDING_STARTER_CREDITS = STARTER_CREDITS * 2;

const artifactSet = new Set(artifactIds);
const artifactId = z.string().refine((id) => artifactSet.has(id), "Unknown artifact");

const httpUrl = z
  .string()
  .trim()
  .max(2048)
  .refine((value) => {
    try {
      const { protocol } = new URL(value);
      return protocol === "http:" || protocol === "https:";
    } catch {
      return false;
    }
  }, "Enter a full http(s) URL");

export const toolInputSchema = z.object({
  name: z.string().trim().min(2).max(60),
  url: httpUrl,
  description: z.string().trim().max(200).default(""),
  category: z.string().refine((id) => categoryIds.includes(id), "Unknown category"),
  /** What people bring to this tool. May be empty. */
  inputs: z.array(artifactId).max(8),
  /** What people leave with; at least one, or the tool can never host a card. */
  outputs: z.array(artifactId).min(1).max(8),
  cardTitle: z.string().trim().min(3).max(70),
  cardBody: z.string().trim().max(120).default(""),
  cardCta: z.string().trim().min(2).max(24),
  allowSameCategory: z.boolean().default(false),
});

export type ToolInput = z.infer<typeof toolInputSchema>;

function isUniqueViolation(error: unknown): boolean {
  const e = error as { code?: string; cause?: unknown } | null;
  if (!e) return false;
  return e.code === "23505" || (e.cause !== undefined && isUniqueViolation(e.cause));
}

const unique = <T>(items: readonly T[]) => [...new Set(items)];

/**
 * Creates a tool with its starter credits: the row, the `starter` ledger entry
 * and the cached balance are written in one transaction. Does not enforce plan
 * limits; callers check `getLimit(userId, "tools")` first.
 */
export async function createToolRecord(userId: string, input: ToolInput): Promise<BatonTool> {
  const base = slugify(input.name);

  for (let attempt = 0; attempt < 5; attempt++) {
    // Short random suffix; the unique index is the real guard, retried on collision.
    const slug = `${base}-${randomBytes(3).toString("hex")}`;
    try {
      return await db.transaction(async (tx) => {
        const [existing] = await tx.select({ n: count() }).from(batonTool);
        const starter =
          (existing?.n ?? 0) < FOUNDING_TOOLS ? FOUNDING_STARTER_CREDITS : STARTER_CREDITS;
        const [tool] = await tx
          .insert(batonTool)
          .values({
            userId,
            name: input.name,
            slug,
            url: input.url,
            description: input.description,
            category: input.category,
            inputs: unique(input.inputs),
            outputs: unique(input.outputs),
            cardTitle: input.cardTitle,
            cardBody: input.cardBody,
            cardCta: input.cardCta,
            allowSameCategory: input.allowSameCategory,
            siteKey: createSiteKey(),
            credits: starter,
          })
          .returning();
        if (!tool) throw new Error("Tool insert returned no row.");
        await tx
          .insert(batonLedger)
          .values({ toolId: tool.id, delta: starter, reason: "starter" });
        return tool;
      });
    } catch (error) {
      if (!isUniqueViolation(error) || attempt === 4) throw error;
    }
  }
  throw new Error("Could not allocate a unique tool slug.");
}

/** What a tool created right now starts with: double while the founding 100 are open. */
export async function currentStarterCredits() {
  const [existing] = await db.select({ n: count() }).from(batonTool);
  return (existing?.n ?? 0) < FOUNDING_TOOLS ? FOUNDING_STARTER_CREDITS : STARTER_CREDITS;
}
