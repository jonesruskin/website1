import { PlusIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { ActionForm } from "@/components/baton/app/action-form";
import { BlockCategoryForm } from "@/components/baton/app/block-category-form";
import { LaneSection, MicroLabel, PageHead } from "@/components/baton/app/page-head";
import { PartnerRows } from "@/components/baton/app/partner-rows";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/session";
import { getLimit } from "@/lib/billing/entitlements";
import {
  blockAction,
  proposeHandshakeAction,
  removeHandshakeAction,
  respondHandshakeAction,
  unblockAction,
} from "@/lib/baton/actions";
import { hostOf, shortDate } from "@/lib/baton/format";
import {
  countProposedHandshakes,
  getSuggestedPartners,
  listBlocks,
  listHandshakes,
  listTools,
} from "@/lib/baton/queries";
import { categories, categoryLabel } from "@/lib/baton/taxonomy";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Network", robots: { index: false } };

export default async function NetworkPage({
  searchParams,
}: {
  searchParams: Promise<{ tool?: string | string[] }>;
}) {
  const { user } = await requireSession("/network");
  const tools = await listTools(user.id);

  if (tools.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <PageHead
          eyebrow="Network"
          title="Your network"
          description="See which tools you'd pass users to, which would pass users to you, and who you've paired with."
        />
        <div className="grid justify-items-start gap-4 rounded-xl border border-dashed bg-card p-8">
          <h2 className="font-display text-xl font-semibold">Add a tool to see your network</h2>
          <p className="max-w-prose text-sm text-muted-foreground">
            Partners are found from your tool&apos;s journey: what people leave with, and what they
            bring. Add a tool and they show up here.
          </p>
          <Button asChild>
            <Link href="/tools/new">
              <PlusIcon aria-hidden />
              Add a tool
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const query = await searchParams;
  const requested = Array.isArray(query.tool) ? query.tool[0] : query.tool;
  const tool = tools.find((t) => t.id === requested) ?? tools[0]!;

  const [partners, handshakes, blocks, limit, used] = await Promise.all([
    getSuggestedPartners(tool.id, 8),
    listHandshakes(tool.id),
    listBlocks(tool.id),
    getLimit(user.id, "handshakes"),
    countProposedHandshakes(user.id),
  ]);

  const paired = new Map(handshakes.map((h) => [h.partner.id, h]));
  const canPropose = limit > 0;
  const limitLabel = Number.isFinite(limit) ? String(limit) : "unlimited";
  const pendingIn = handshakes.filter((h) => h.status === "pending" && h.direction === "incoming");
  const pendingOut = handshakes.filter((h) => h.status === "pending" && h.direction === "outgoing");
  const accepted = handshakes.filter((h) => h.status === "accepted");
  const declined = handshakes.filter((h) => h.status === "declined");
  const blockedCategories = new Set(
    blocks.flatMap((b) => (b.blockedCategory ? [b.blockedCategory] : [])),
  );

  const proposeAction = (partnerId: string) => {
    const existing = paired.get(partnerId);
    if (existing?.status === "accepted") return null;
    if (existing?.status === "pending") {
      return (
        <span className="py-1.5 text-xs text-muted-foreground">
          {existing.direction === "incoming" ? "Waiting on your answer" : "Handshake pending"}
        </span>
      );
    }
    if (existing?.status === "declined") return null;
    if (!canPropose) {
      return (
        <Button asChild variant="ghost" size="sm">
          <Link href="/pricing">Handshakes: upgrade</Link>
        </Button>
      );
    }
    return (
      <ActionForm
        action={proposeHandshakeAction}
        fields={{ fromToolId: tool.id, toToolId: partnerId }}
        pendingLabel="Proposing…"
      >
        Propose handshake
      </ActionForm>
    );
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10">
      <PageHead
        eyebrow="Network"
        title="Your network"
        description="Who you'd pass users to, who'd pass users to you, and the pairings you've agreed. Suggestions come from the same matching the cards use."
      />

      <nav aria-label="Choose a tool" className="-mt-4">
        <MicroLabel className="mb-2">Showing lane</MicroLabel>
        <ul className="flex flex-wrap gap-2">
          {tools.map((t, index) => {
            const active = t.id === tool.id;
            return (
              <li key={t.id}>
                <Link
                  href={`/network?tool=${t.id}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors",
                    active
                      ? "border-foreground bg-foreground text-background"
                      : "bg-card hover:bg-accent",
                  )}
                >
                  <span
                    className={cn(
                      "font-mono text-xs",
                      active ? "opacity-70" : "text-muted-foreground",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  {t.name}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {tool.credits < 1 && (
        <Alert variant="warning">
          <AlertDescription>
            <p className="text-foreground">
              {tool.name} has no credits, so no tool will show its card until it earns some. Passes
              from your own tools earn one credit each.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
        <LaneSection
          id="passes-to"
          index={1}
          total={4}
          title="Passes to"
          description={`Tools whose users would want what ${tool.name}'s users leave with. Your card for them is one click away from a credit.`}
        >
          <PartnerRows
            rows={partners.passesTo.map((p) => ({
              id: p.tool.id,
              name: p.tool.name,
              url: p.tool.url,
              category: p.tool.category,
              via: p.via,
              handshake: p.handshake,
            }))}
            empty="No tool takes what your users leave with yet. Broaden your outputs, or check back as the network grows."
            actions={(row) => (
              <>
                {proposeAction(row.id)}
                <ActionForm
                  action={blockAction}
                  fields={{ toolId: tool.id, blockedToolId: row.id }}
                  variant="ghost"
                  pendingLabel="Blocking…"
                >
                  Block
                </ActionForm>
              </>
            )}
          />
        </LaneSection>

        <LaneSection
          id="receives-from"
          index={2}
          total={4}
          title="Receives from"
          description={`Tools whose users leave with what ${tool.name}'s users bring. They'd show your card at their success moment.`}
        >
          <PartnerRows
            rows={partners.receivesFrom.map((p) => ({
              id: p.tool.id,
              name: p.tool.name,
              url: p.tool.url,
              category: p.tool.category,
              via: p.via,
              handshake: p.handshake,
            }))}
            empty={
              tool.inputs.length === 0
                ? "Add inputs to your tool so others know what your users bring."
                : "No tool produces what your users bring yet."
            }
            actions={(row) => proposeAction(row.id)}
          />
        </LaneSection>
      </div>

      <LaneSection
        id="handshakes"
        index={3}
        total={4}
        title="Handshakes"
        description="A handshake is a direct pairing between two tools. Accepted pairs rank first for each other, whether or not their journeys overlap."
        actions={
          canPropose ? (
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              {used} of {limitLabel} used
            </p>
          ) : undefined
        }
      >
        {!canPropose && (
          <Alert className="mb-5">
            <AlertDescription>
              <p>
                Proposing handshakes is part of the paid plans. You can still accept and decline the
                ones you receive.{" "}
                <Link
                  href="/pricing"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  Compare plans
                </Link>
              </p>
            </AlertDescription>
          </Alert>
        )}

        {handshakes.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No handshakes for {tool.name} yet. Propose one from a suggested partner above.
          </p>
        ) : (
          <div className="grid gap-6">
            {pendingIn.length > 0 && (
              <div className="grid gap-2">
                <h3 className="font-mono text-xs tracking-widest uppercase">
                  Waiting on you · {pendingIn.length}
                </h3>
                <ul className="divide-y rounded-lg border">
                  {pendingIn.map((h) => (
                    <li
                      key={h.id}
                      className="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start"
                    >
                      <div className="grid min-w-0 gap-1">
                        <p className="text-sm font-medium">{h.partner.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {categoryLabel(h.partner.category)} · {hostOf(h.partner.url)} · proposed{" "}
                          {shortDate(h.createdAt.toISOString().slice(0, 10))}
                        </p>
                        {h.note && <p className="text-sm">&ldquo;{h.note}&rdquo;</p>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <ActionForm
                          action={respondHandshakeAction}
                          fields={{ id: h.id, decision: "accept" }}
                          variant="primary"
                          pendingLabel="Accepting…"
                        >
                          Accept
                        </ActionForm>
                        <ActionForm
                          action={respondHandshakeAction}
                          fields={{ id: h.id, decision: "decline" }}
                          pendingLabel="Declining…"
                        >
                          Decline
                        </ActionForm>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {pendingOut.length > 0 && (
              <div className="grid gap-2">
                <h3 className="font-mono text-xs tracking-widest uppercase">
                  Proposed by you · {pendingOut.length}
                </h3>
                <ul className="divide-y rounded-lg border">
                  {pendingOut.map((h) => (
                    <li
                      key={h.id}
                      className="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                    >
                      <div className="grid min-w-0 gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium">{h.partner.name}</p>
                          <Badge variant="warning">Pending</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {categoryLabel(h.partner.category)} · {hostOf(h.partner.url)}
                        </p>
                      </div>
                      <ActionForm
                        action={removeHandshakeAction}
                        fields={{ id: h.id }}
                        variant="ghost"
                        pendingLabel="Withdrawing…"
                      >
                        Withdraw
                      </ActionForm>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {accepted.length > 0 && (
              <div className="grid gap-2">
                <h3 className="font-mono text-xs tracking-widest uppercase">
                  Accepted · {accepted.length}
                </h3>
                <ul className="divide-y rounded-lg border">
                  {accepted.map((h) => (
                    <li
                      key={h.id}
                      className="grid gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                    >
                      <div className="grid min-w-0 gap-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium">{h.partner.name}</p>
                          <Badge variant="success">Ranks first</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {categoryLabel(h.partner.category)} · {hostOf(h.partner.url)}
                        </p>
                      </div>
                      <ActionForm
                        action={removeHandshakeAction}
                        fields={{ id: h.id }}
                        variant="ghost"
                        pendingLabel="Ending…"
                      >
                        End handshake
                      </ActionForm>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {declined.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {declined.length} declined: {declined.map((h) => h.partner.name).join(", ")}.
              </p>
            )}
          </div>
        )}
      </LaneSection>

      <LaneSection
        id="blocklist"
        index={4}
        total={4}
        title="Blocklist"
        description={`Tools and categories ${tool.name} will never show a card for. Block a tool from the “Passes to” list above, or a whole category here.`}
      >
        <div className="grid gap-6">
          {blocks.length === 0 ? (
            <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              Nothing blocked. Competitors in your own category are already excluded unless both
              sides opt in.
            </p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {blocks.map((b) => (
                <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <Badge variant="outline">{b.blockedCategory ? "Category" : "Tool"}</Badge>
                    <p className="truncate text-sm font-medium">
                      {b.blockedCategory
                        ? categoryLabel(b.blockedCategory)
                        : (b.toolName ?? "Removed tool")}
                    </p>
                  </div>
                  <ActionForm
                    action={unblockAction}
                    fields={{ id: b.id }}
                    variant="ghost"
                    pendingLabel="Unblocking…"
                  >
                    Unblock
                  </ActionForm>
                </li>
              ))}
            </ul>
          )}
          <BlockCategoryForm
            toolId={tool.id}
            options={categories.filter((c) => !blockedCategories.has(c.id))}
          />
        </div>
      </LaneSection>
    </div>
  );
}
