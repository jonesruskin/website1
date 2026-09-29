import "server-only";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { user } from "@/db/schema/auth";
import { batonTool } from "@/db/schema/baton";

import { createToolRecord, type ToolInput } from "./tools-core";

type DemoTool = Omit<ToolInput, "url" | "description" | "allowSameCategory"> & { owner: 0 | 1 };

const owners = [
  { id: "demo-user-a", name: "Demo · Maker A", email: "demo-a@baton.demo" },
  { id: "demo-user-b", name: "Demo · Maker B", email: "demo-b@baton.demo" },
] as const;

/**
 * Eight tools that form journeys across two owners: PDF to signature,
 * audio to transcript to summary, idea to logo to social post, and so on.
 * Same-category pairs never match, so owners are mixed on purpose.
 */
const tools: DemoTool[] = [
  {
    owner: 0,
    name: "Demo · Squeeze PDF",
    category: "documents",
    inputs: ["pdf", "document", "signature"],
    outputs: ["pdf"],
    cardTitle: "Shrink that PDF before you send it",
    cardBody: "Drop it in, get a file a third of the size. No sign-up.",
    cardCta: "Compress a PDF",
  },
  {
    owner: 0,
    name: "Demo · Transcribe Now",
    category: "audio",
    inputs: ["audio", "voice", "podcast"],
    outputs: ["transcript", "text"],
    cardTitle: "Turn that recording into text",
    cardBody: "Upload audio, get a clean transcript in minutes.",
    cardCta: "Transcribe audio",
  },
  {
    owner: 0,
    name: "Demo · Logo Lab",
    category: "images",
    inputs: ["idea", "summary"],
    outputs: ["logo", "image"],
    cardTitle: "Give the idea a logo",
    cardBody: "Type a name and pick a mark. Vector files included.",
    cardCta: "Make a logo",
  },
  {
    owner: 0,
    name: "Demo · Shortlink",
    category: "web",
    inputs: ["link", "website", "social-post"],
    outputs: ["link", "qr"],
    cardTitle: "Shorten it and add a QR code",
    cardBody: "One tidy link that tracks its own clicks.",
    cardCta: "Shorten a link",
  },
  {
    owner: 1,
    name: "Demo · Sign Quick",
    category: "productivity",
    inputs: ["pdf", "document"],
    outputs: ["signature", "pdf"],
    cardTitle: "Need it signed? Do it here",
    cardBody: "Add a signature and send the PDF back in one step.",
    cardCta: "Sign a document",
  },
  {
    owner: 1,
    name: "Demo · Summarize It",
    category: "writing",
    inputs: ["text", "transcript", "article"],
    outputs: ["summary"],
    cardTitle: "Get the short version",
    cardBody: "Paste text, get five bullets you can actually use.",
    cardCta: "Summarize text",
  },
  {
    owner: 1,
    name: "Demo · Sheet Charts",
    category: "data",
    inputs: ["csv", "spreadsheet", "data"],
    outputs: ["chart"],
    cardTitle: "Chart your spreadsheet",
    cardBody: "Drop a CSV and get a shareable chart.",
    cardCta: "Make a chart",
  },
  {
    owner: 1,
    name: "Demo · Post Scheduler",
    category: "marketing",
    inputs: ["image", "summary", "article", "social-post", "video", "chart", "link"],
    outputs: ["schedule", "social-post"],
    cardTitle: "Schedule it for later",
    cardBody: "Queue this for the times your audience is online.",
    cardCta: "Schedule a post",
  },
];

/** Creates the demo users and tools that do not exist yet. Safe to run repeatedly. */
export async function seedDemoNetwork(origin: string) {
  await db
    .insert(user)
    .values(owners.map((o) => ({ ...o, emailVerified: true })))
    .onConflictDoNothing();

  let created = 0;
  for (const demo of tools) {
    const { owner, ...rest } = demo;
    const userId = owners[owner].id;
    const [existing] = await db
      .select({ id: batonTool.id })
      .from(batonTool)
      .where(and(eq(batonTool.userId, userId), eq(batonTool.name, demo.name)))
      .limit(1);
    if (existing) continue;
    const slug = demo.name
      .replace(/^Demo · /, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-");
    await createToolRecord(userId, {
      ...rest,
      url: `${origin}/dev/baton/landing?tool=${slug}`,
      description: "Demo tool seeded from /dev/baton.",
      allowSameCategory: false,
    });
    created += 1;
  }
  return created;
}
