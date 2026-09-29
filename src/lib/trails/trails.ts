import "server-only";

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { cache } from "react";
import { z } from "zod";

import { isArtifact } from "@/lib/baton/taxonomy";

import type { TrailSummary } from "./summary";

export const pricingKinds = ["Free", "Free tier", "Open source"] as const;

const artifactField = z.string().refine(isArtifact, { message: "Unknown artifact id" });

const stepSchema = z.object({
  title: z.string().min(1),
  /** One honest sentence: why this tool, and any catch. */
  why: z.string().min(1),
  tool: z.object({
    name: z.string().min(1),
    /** Official homepage. Always https. */
    url: z.url().refine((value) => value.startsWith("https://"), "Use an https URL"),
    pricing: z.enum(pricingKinds),
  }),
  input: artifactField,
  output: artifactField,
});

export const trailSchema = z
  .object({
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    title: z.string().min(1),
    /** One line. */
    promise: z.string().min(1),
    /** Human estimate, e.g. "About 3 hours". */
    time: z.string().min(1),
    /** The same estimate in minutes, for structured data. */
    minutes: z.number().int().positive(),
    audience: z.string().min(1),
    /** Optional caveat shown above the steps. */
    note: z.string().optional(),
    from: artifactField,
    to: artifactField,
    steps: z.array(stepSchema).min(2),
  })
  .superRefine((trail, ctx) => {
    // Every step's input must already be in your hands: what you started with,
    // or something an earlier step produced. That is what the "baton" means.
    const available = new Set<string>([trail.from]);
    trail.steps.forEach((step, index) => {
      if (!available.has(step.input)) {
        ctx.addIssue({
          code: "custom",
          path: ["steps", index, "input"],
          message: `"${step.input}" isn't the trail's start or an earlier step's output`,
        });
      }
      available.add(step.output);
    });
    if (trail.steps.at(-1)?.output !== trail.to) {
      ctx.addIssue({
        code: "custom",
        path: ["to"],
        message: "`to` must equal the last step's output",
      });
    }
  });

export type Trail = z.output<typeof trailSchema>;
export type TrailStep = Trail["steps"][number];
export type TrailPricing = TrailStep["tool"]["pricing"];

const DIRECTORY = path.join(process.cwd(), "content", "trails");

const load = cache(async (): Promise<Trail[]> => {
  const files = (await readdir(DIRECTORY).catch(() => [] as string[]))
    .filter((file) => file.endsWith(".json"))
    .sort();
  const trails = await Promise.all(
    files.map(async (file) => {
      const parsed = trailSchema.safeParse(
        JSON.parse(await readFile(path.join(DIRECTORY, file), "utf8")),
      );
      if (!parsed.success) {
        throw new Error(`Invalid content/trails/${file}\n${z.prettifyError(parsed.error)}`);
      }
      if (`${parsed.data.slug}.json` !== file) {
        throw new Error(
          `content/trails/${file}: slug "${parsed.data.slug}" must match the file name`,
        );
      }
      return parsed.data;
    }),
  );
  return trails;
});

export async function getTrails() {
  return load();
}

export async function getTrail(slug: string) {
  return (await load()).find((trail) => trail.slug === slug) ?? null;
}

export async function trailParams() {
  return (await load()).map((trail) => ({ slug: trail.slug }));
}

export function trailHref(trail: Pick<Trail, "slug">) {
  return `/trails/${trail.slug}`;
}

/** Distinct tools in a trail, in order of first use. */
export function trailTools(trail: Trail) {
  const seen = new Set<string>();
  return trail.steps
    .map((step) => step.tool)
    .filter((tool) => !seen.has(tool.name) && seen.add(tool.name));
}

export function toSummary(trail: Trail): TrailSummary {
  return {
    slug: trail.slug,
    title: trail.title,
    promise: trail.promise,
    time: trail.time,
    audience: trail.audience,
    from: trail.from,
    to: trail.to,
    inputs: [...new Set(trail.steps.map((step) => step.input))],
    outputs: [...new Set(trail.steps.map((step) => step.output))],
    steps: trail.steps.map((step) => ({ title: step.title, tool: step.tool.name })),
  };
}

/** Where a step's input comes from: the trail's start, or the latest earlier step that made it. */
export function inputSource(
  trail: Trail,
  index: number,
): { kind: "start" } | { kind: "step"; step: number } {
  const input = trail.steps[index]!.input;
  for (let i = index - 1; i >= 0; i--) {
    if (trail.steps[i]!.output === input) return { kind: "step", step: i + 1 };
  }
  return { kind: "start" };
}
