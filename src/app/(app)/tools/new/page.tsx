import type { Metadata } from "next";
import Link from "next/link";

import { PageHead } from "@/components/baton/app/page-head";
import { ToolStudio } from "@/components/baton/app/tool-studio";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { requireSession } from "@/lib/auth/session";
import { getLimit, getPlan } from "@/lib/billing/entitlements";
import { getDirectory, listTools } from "@/lib/baton/queries";
import { currentStarterCredits } from "@/lib/baton/tools-core";
import siteConfig from "@/site.config";

export const metadata: Metadata = { title: "Add a tool", robots: { index: false } };

export default async function NewToolPage() {
  const { user } = await requireSession("/tools/new");
  const [tools, limit, plan, directory] = await Promise.all([
    listTools(user.id),
    getLimit(user.id, "tools"),
    getPlan(user.id),
    getDirectory(user.id),
  ]);
  const atLimit = tools.length >= limit;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
      <PageHead
        eyebrow="Card studio · new tool"
        title="Add a tool"
        description="Describe the journey, write the card people will see, and preview it as you go."
        actions={
          <Button asChild variant="outline">
            <Link href="/tools">All tools</Link>
          </Button>
        }
      />
      {atLimit ? (
        <Alert>
          <AlertTitle>You&apos;re using every tool your plan includes</AlertTitle>
          <AlertDescription>
            <p>
              {plan?.name ?? "Your"} plan has room for {limit} {limit === 1 ? "tool" : "tools"}.{" "}
              <Link
                href="/pricing"
                className="font-medium text-foreground underline underline-offset-4"
              >
                Upgrade on the pricing page
              </Link>{" "}
              to add more, or{" "}
              <Link
                href="/tools"
                className="font-medium text-foreground underline underline-offset-4"
              >
                edit an existing tool
              </Link>
              .
            </p>
          </AlertDescription>
        </Alert>
      ) : (
        <ToolStudio
          directory={directory}
          siteUrl={siteConfig.url}
          starterCredits={await currentStarterCredits()}
        />
      )}
    </div>
  );
}
