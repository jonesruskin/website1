import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { ActionForm } from "@/components/baton/app/action-form";
import { DeleteTool } from "@/components/baton/app/delete-tool";
import { LaneSection, MicroLabel, PageHead } from "@/components/baton/app/page-head";
import { ToolStudio } from "@/components/baton/app/tool-studio";
import { InstallStatus, StatusPill } from "@/components/baton/app/tool-status";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/session";
import { setToolStatusAction } from "@/lib/baton/actions";
import { formatNumber, hostOf } from "@/lib/baton/format";
import { getDirectory, getTool, getToolStats } from "@/lib/baton/queries";
import { STARTER_CREDITS } from "@/lib/baton/tools-core";
import siteConfig from "@/site.config";

export const metadata: Metadata = { title: "Edit tool", robots: { index: false } };

export default async function EditToolPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ created?: string }>;
}) {
  const { id } = await params;
  const { created } = await searchParams;
  const { user } = await requireSession(`/tools/${id}`);
  if (!z.uuid().safeParse(id).success) notFound();
  const tool = await getTool(user.id, id);
  if (!tool) notFound();

  const [directory, stats] = await Promise.all([getDirectory(user.id), getToolStats(tool.id, 7)]);
  const paused = tool.status === "paused";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <PageHead
        eyebrow={<>Card studio · {hostOf(tool.url)}</>}
        title={tool.name}
        description={
          <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <StatusPill status={tool.status} />
            <InstallStatus installedAt={tool.installedAt} />
          </span>
        }
        actions={
          <>
            <Button asChild variant="outline">
              <Link href="/tools">All tools</Link>
            </Button>
            <ActionForm
              action={setToolStatusAction}
              fields={{ id: tool.id, status: paused ? "active" : "paused" }}
              variant="outline"
              size="md"
              pendingLabel={paused ? "Resuming…" : "Pausing…"}
            >
              {paused ? "Resume" : "Pause"}
            </ActionForm>
          </>
        }
      />

      <dl className="grid grid-cols-2 divide-x divide-y overflow-hidden rounded-xl border bg-card shadow-xs sm:grid-cols-4 sm:divide-y-0">
        <div className="grid gap-1 p-4">
          <dt>
            <MicroLabel>Credits</MicroLabel>
          </dt>
          <dd className="font-mono text-2xl font-semibold text-signal-ink tabular-nums">
            {formatNumber(tool.credits)}
          </dd>
        </div>
        <div className="grid gap-1 p-4">
          <dt>
            <MicroLabel>Cards shown · {stats.days}d</MicroLabel>
          </dt>
          <dd className="font-mono text-2xl font-semibold tabular-nums">
            {formatNumber(stats.impressions)}
          </dd>
        </div>
        <div className="grid gap-1 p-4">
          <dt>
            <MicroLabel>Passes sent · {stats.days}d</MicroLabel>
          </dt>
          <dd className="font-mono text-2xl font-semibold tabular-nums">
            {formatNumber(stats.sent)}
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {stats.clickRate === null
                ? "no cards yet"
                : `${(stats.clickRate * 100).toFixed(1)}% click rate`}
            </span>
          </dd>
        </div>
        <div className="grid gap-1 p-4">
          <dt>
            <MicroLabel>Visitors received · {stats.days}d</MicroLabel>
          </dt>
          <dd className="font-mono text-2xl font-semibold tabular-nums">
            {formatNumber(stats.received)}
          </dd>
        </div>
      </dl>

      <ToolStudio
        tool={{
          id: tool.id,
          name: tool.name,
          url: tool.url,
          description: tool.description,
          category: tool.category,
          inputs: tool.inputs,
          outputs: tool.outputs,
          cardTitle: tool.cardTitle,
          cardBody: tool.cardBody,
          cardCta: tool.cardCta,
          allowSameCategory: tool.allowSameCategory,
          siteKey: tool.siteKey,
          installedAt: tool.installedAt?.toISOString() ?? null,
          credits: tool.credits,
        }}
        directory={directory}
        siteUrl={siteConfig.url}
        starterCredits={STARTER_CREDITS}
        created={created === "1"}
      />

      <LaneSection
        id="danger"
        index={3}
        title="Danger zone"
        className="mt-4 border-t border-destructive/30 pt-8"
        description="Deleting a tool is permanent. Pausing keeps everything and just stops cards from being shown for it."
      >
        <DeleteTool id={tool.id} name={tool.name} credits={tool.credits} />
      </LaneSection>
    </div>
  );
}
