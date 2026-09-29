"use server";

import { and, count, eq, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { db } from "@/db";
import { batonBlock, batonHandshake, batonTool } from "@/db/schema/baton";
import { requireSession } from "@/lib/auth/session";
import { getLimit, getPlan } from "@/lib/billing/entitlements";
import { notify } from "@/lib/notifications/notify";

import { categoryIds, categoryLabel } from "./taxonomy";
import { countProposedHandshakes, getTool } from "./queries";
import { createToolRecord, toolInputSchema } from "./tools-core";

export type BatonActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  errors?: Record<string, string[] | undefined>;
  /** The message is about a plan limit: the UI adds a link to /pricing. */
  upgrade?: boolean;
};

const ok = (message: string): BatonActionState => ({ status: "success", message });
const fail = (message: string, extra: Partial<BatonActionState> = {}): BatonActionState => ({
  status: "error",
  message,
  ...extra,
});

const id = z.uuid();

function refresh() {
  for (const path of ["/tools", "/network", "/credits", "/dashboard"]) revalidatePath(path);
  revalidatePath("/tools/[id]", "page");
}

function parseToolForm(formData: FormData) {
  const text = (name: string) => String(formData.get(name) ?? "");
  return toolInputSchema.safeParse({
    name: text("name"),
    url: text("url").trim(),
    description: text("description"),
    category: text("category"),
    inputs: [...new Set(formData.getAll("inputs").map(String))],
    outputs: [...new Set(formData.getAll("outputs").map(String))],
    cardTitle: text("cardTitle"),
    cardBody: text("cardBody"),
    cardCta: text("cardCta"),
    allowSameCategory: formData.get("allowSameCategory") === "on",
  });
}

async function toolLimitError(userId: string): Promise<BatonActionState | null> {
  const [limit, plan, [row]] = await Promise.all([
    getLimit(userId, "tools"),
    getPlan(userId),
    db.select({ value: count() }).from(batonTool).where(eq(batonTool.userId, userId)),
  ]);
  if ((row?.value ?? 0) < limit) return null;
  return fail(
    `The ${plan?.name ?? "current"} plan includes ${limit === 1 ? "1 tool" : `${limit} tools`}, and you're using ${limit === 1 ? "it" : "them all"}. Upgrade to add more.`,
    { upgrade: true },
  );
}

export async function createToolAction(
  _: BatonActionState,
  formData: FormData,
): Promise<BatonActionState> {
  const { user } = await requireSession("/tools/new");
  const parsed = parseToolForm(formData);
  if (!parsed.success) {
    return fail("Check the highlighted fields.", {
      errors: z.flattenError(parsed.error).fieldErrors,
    });
  }
  const limited = await toolLimitError(user.id);
  if (limited) return limited;

  const tool = await createToolRecord(user.id, parsed.data);
  refresh();
  redirect(`/tools/${tool.id}?created=1`);
}

export async function updateToolAction(
  _: BatonActionState,
  formData: FormData,
): Promise<BatonActionState> {
  const toolId = id.safeParse(formData.get("id"));
  if (!toolId.success) return fail("That tool doesn't exist.");
  const { user } = await requireSession(`/tools/${toolId.data}`);
  const tool = await getTool(user.id, toolId.data);
  if (!tool) return fail("That tool doesn't exist.");

  const parsed = parseToolForm(formData);
  if (!parsed.success) {
    return fail("Check the highlighted fields.", {
      errors: z.flattenError(parsed.error).fieldErrors,
    });
  }
  await db
    .update(batonTool)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(and(eq(batonTool.id, tool.id), eq(batonTool.userId, user.id)));
  refresh();
  return ok("Saved. The card updates on your site within a minute.");
}

export async function deleteToolAction(
  _: BatonActionState,
  formData: FormData,
): Promise<BatonActionState> {
  const toolId = id.safeParse(formData.get("id"));
  if (!toolId.success) return fail("That tool doesn't exist.");
  const { user } = await requireSession("/tools");
  const tool = await getTool(user.id, toolId.data);
  if (!tool) return fail("That tool doesn't exist.");
  await db.delete(batonTool).where(and(eq(batonTool.id, tool.id), eq(batonTool.userId, user.id)));
  refresh();
  redirect("/tools");
}

export async function setToolStatusAction(
  _: BatonActionState,
  formData: FormData,
): Promise<BatonActionState> {
  const parsed = z
    .object({ id, status: z.enum(["active", "paused"]) })
    .safeParse({ id: formData.get("id"), status: formData.get("status") });
  if (!parsed.success) return fail("That didn't look right. Reload and try again.");
  const { user } = await requireSession("/tools");
  const tool = await getTool(user.id, parsed.data.id);
  if (!tool) return fail("That tool doesn't exist.");
  await db
    .update(batonTool)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(and(eq(batonTool.id, tool.id), eq(batonTool.userId, user.id)));
  refresh();
  return ok(
    parsed.data.status === "paused" ? "Paused. No cards will be shown for it." : "Resumed.",
  );
}

/* ─── Handshakes ─────────────────────────────────────────────────────── */

export async function proposeHandshakeAction(
  _: BatonActionState,
  formData: FormData,
): Promise<BatonActionState> {
  const parsed = z
    .object({
      fromToolId: id,
      toToolId: id,
      note: z.string().trim().max(200).optional(),
    })
    .safeParse({
      fromToolId: formData.get("fromToolId"),
      toToolId: formData.get("toToolId"),
      note: (formData.get("note") as string | null) || undefined,
    });
  if (!parsed.success) return fail("That didn't look right. Reload and try again.");
  const { fromToolId, toToolId, note } = parsed.data;

  const { user } = await requireSession("/network");
  const from = await getTool(user.id, fromToolId);
  if (!from) return fail("Pick one of your own tools to propose from.");

  const limit = await getLimit(user.id, "handshakes");
  if (limit < 1) {
    return fail("Handshakes are a paid feature: direct pairings that rank first on both sides.", {
      upgrade: true,
    });
  }
  if ((await countProposedHandshakes(user.id)) >= limit) {
    return fail(`You've used all ${limit} handshakes on your plan. Upgrade for more.`, {
      upgrade: true,
    });
  }

  const [to] = await db.select().from(batonTool).where(eq(batonTool.id, toToolId)).limit(1);
  if (!to || to.userId === user.id) return fail("You can only propose to other makers' tools.");

  const [existing] = await db
    .select()
    .from(batonHandshake)
    .where(
      or(
        and(eq(batonHandshake.fromToolId, from.id), eq(batonHandshake.toToolId, to.id)),
        and(eq(batonHandshake.fromToolId, to.id), eq(batonHandshake.toToolId, from.id)),
      ),
    )
    .limit(1);
  if (existing) {
    const theirs = existing.fromToolId === to.id;
    if (existing.status === "accepted") return fail(`${to.name} is already a partner.`);
    if (existing.status === "declined") {
      return fail(`${theirs ? "You declined" : "They declined"} this pairing already.`);
    }
    return fail(
      theirs
        ? `${to.name} already proposed a handshake to you. Accept it in your inbox.`
        : "You've already proposed this handshake. It's waiting on their answer.",
    );
  }

  await db
    .insert(batonHandshake)
    .values({ fromToolId: from.id, toToolId: to.id, note: note ?? null });
  await notify(to.userId, {
    type: "handshake",
    title: `${from.name} proposed a handshake`,
    body: `They'd like ${from.name} and ${to.name} to rank first for each other.${note ? ` "${note}"` : ""}`,
    href: `/network?tool=${to.id}`,
  });
  refresh();
  return ok(`Proposed to ${to.name}. You'll get a notification when they answer.`);
}

export async function respondHandshakeAction(
  _: BatonActionState,
  formData: FormData,
): Promise<BatonActionState> {
  const parsed = z
    .object({ id, decision: z.enum(["accept", "decline"]) })
    .safeParse({ id: formData.get("id"), decision: formData.get("decision") });
  if (!parsed.success) return fail("That didn't look right. Reload and try again.");
  const { user } = await requireSession("/network");

  const [row] = await db
    .select({ handshake: batonHandshake, from: batonTool })
    .from(batonHandshake)
    .innerJoin(batonTool, eq(batonHandshake.fromToolId, batonTool.id))
    .where(eq(batonHandshake.id, parsed.data.id))
    .limit(1);
  if (!row) return fail("That handshake no longer exists.");
  const to = await getTool(user.id, row.handshake.toToolId);
  if (!to) return fail("Only the tool's owner can answer a handshake.");
  if (row.handshake.status !== "pending") return fail("This handshake was already answered.");

  const accepted = parsed.data.decision === "accept";
  await db
    .update(batonHandshake)
    .set({ status: accepted ? "accepted" : "declined", respondedAt: new Date() })
    .where(eq(batonHandshake.id, row.handshake.id));
  await notify(row.from.userId, {
    type: "handshake",
    title: accepted ? `${to.name} accepted your handshake` : `${to.name} declined your handshake`,
    body: accepted
      ? `${row.from.name} and ${to.name} now rank first for each other.`
      : "You can still reach them through regular matching.",
    href: `/network?tool=${row.from.id}`,
  });
  refresh();
  return ok(accepted ? `Accepted. ${row.from.name} and ${to.name} now rank first.` : "Declined.");
}

/** Withdraw a pending proposal, or end an accepted handshake. Either side can. */
export async function removeHandshakeAction(
  _: BatonActionState,
  formData: FormData,
): Promise<BatonActionState> {
  const parsed = id.safeParse(formData.get("id"));
  if (!parsed.success) return fail("That didn't look right. Reload and try again.");
  const { user } = await requireSession("/network");
  const [row] = await db
    .select()
    .from(batonHandshake)
    .where(eq(batonHandshake.id, parsed.data))
    .limit(1);
  if (!row) return ok("Already gone.");
  const [mine, theirs] = await Promise.all([
    getTool(user.id, row.fromToolId),
    getTool(user.id, row.toToolId),
  ]);
  if (!mine && !theirs) return fail("That handshake isn't yours.");
  await db.delete(batonHandshake).where(eq(batonHandshake.id, row.id));
  refresh();
  return ok("Removed.");
}

/* ─── Blocklist ──────────────────────────────────────────────────────── */

export async function blockAction(
  _: BatonActionState,
  formData: FormData,
): Promise<BatonActionState> {
  const parsed = z
    .object({
      toolId: id,
      blockedToolId: id.optional(),
      blockedCategory: z.enum(categoryIds as [string, ...string[]]).optional(),
    })
    .safeParse({
      toolId: formData.get("toolId"),
      blockedToolId: (formData.get("blockedToolId") as string | null) || undefined,
      blockedCategory: (formData.get("blockedCategory") as string | null) || undefined,
    });
  if (!parsed.success) return fail("Pick a category or a tool to block.");
  const { toolId, blockedToolId, blockedCategory } = parsed.data;
  if (!blockedToolId && !blockedCategory) return fail("Pick a category or a tool to block.");

  const { user } = await requireSession("/network");
  const tool = await getTool(user.id, toolId);
  if (!tool) return fail("That tool doesn't exist.");

  let label = blockedCategory ? categoryLabel(blockedCategory) : "";
  if (blockedToolId) {
    const [target] = await db
      .select({ id: batonTool.id, name: batonTool.name, userId: batonTool.userId })
      .from(batonTool)
      .where(eq(batonTool.id, blockedToolId))
      .limit(1);
    if (!target) return fail("That tool doesn't exist.");
    if (target.userId === user.id) return fail("Your own tools are never paired with each other.");
    label = target.name;
  }

  const existing = await db
    .select({
      id: batonBlock.id,
      blockedToolId: batonBlock.blockedToolId,
      blockedCategory: batonBlock.blockedCategory,
    })
    .from(batonBlock)
    .where(eq(batonBlock.toolId, tool.id));
  const duplicate = existing.some((row) =>
    blockedToolId ? row.blockedToolId === blockedToolId : row.blockedCategory === blockedCategory,
  );
  if (duplicate) return ok(`${label} is already blocked.`);

  await db.insert(batonBlock).values({
    toolId: tool.id,
    blockedToolId: blockedToolId ?? null,
    blockedCategory: blockedToolId ? null : (blockedCategory ?? null),
  });
  refresh();
  return ok(`${label} will never be shown in ${tool.name}.`);
}

export async function unblockAction(
  _: BatonActionState,
  formData: FormData,
): Promise<BatonActionState> {
  const parsed = id.safeParse(formData.get("id"));
  if (!parsed.success) return fail("That didn't look right. Reload and try again.");
  const { user } = await requireSession("/network");
  const [row] = await db
    .select({ id: batonBlock.id, toolId: batonBlock.toolId })
    .from(batonBlock)
    .where(eq(batonBlock.id, parsed.data))
    .limit(1);
  if (!row) return ok("Already unblocked.");
  if (!(await getTool(user.id, row.toolId))) return fail("That block isn't yours.");
  await db.delete(batonBlock).where(eq(batonBlock.id, row.id));
  refresh();
  return ok("Unblocked.");
}
