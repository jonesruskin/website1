import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { desc } from "drizzle-orm";

import { db } from "@/db";
import { batonClick, batonTool } from "@/db/schema/baton";
import { Button } from "@/components/ui/button";

import { seedDemoAction } from "./actions";
import { Playground } from "./playground";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Baton playground", robots: { index: false } };

/** Development only: try the whole loop (card, click, credits) against the local database. */
export default async function BatonPlaygroundPage() {
  if (process.env.NODE_ENV === "production") notFound();

  const tools = await db.select().from(batonTool).orderBy(batonTool.name);
  const names = new Map(tools.map((t) => [t.id, t.name]));
  const clicks = await db
    .select({
      id: batonClick.id,
      hostToolId: batonClick.hostToolId,
      shownToolId: batonClick.shownToolId,
      credited: batonClick.credited,
      createdAt: batonClick.createdAt,
    })
    .from(batonClick)
    .orderBy(desc(batonClick.createdAt))
    .limit(8);

  return (
    <main className="container-page py-12">
      <p className="text-eyebrow text-muted-foreground">Development</p>
      <h1 className="mt-2 text-heading">Baton playground</h1>
      <p className="mt-2 max-w-prose text-sm text-muted-foreground">
        Not available in production. Seed a demo network, pass from any tool, click the card, then
        reload to watch credits move.
      </p>

      <form action={seedDemoAction} className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="submit" variant="secondary">
          Seed demo network
        </Button>
        <span className="text-sm text-muted-foreground">
          Two demo users, eight &ldquo;Demo ·&rdquo; tools, 10 starter credits each. Safe to repeat.
        </span>
      </form>

      {tools.length === 0 ? (
        <p className="mt-10 rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No tools yet. Seed the demo network to begin.
        </p>
      ) : (
        <Playground
          tools={tools.map((t) => ({
            id: t.id,
            name: t.name,
            category: t.category,
            siteKey: t.siteKey,
            credits: t.credits,
            inputs: t.inputs,
            outputs: t.outputs,
          }))}
        />
      )}

      <section aria-labelledby="clicks-h" className="mt-12">
        <h2 id="clicks-h" className="text-heading">
          Latest clicks
        </h2>
        {clicks.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">None yet.</p>
        ) : (
          <ul className="mt-3 divide-y rounded-lg border font-mono text-xs">
            {clicks.map((click) => (
              <li key={click.id} className="flex flex-wrap gap-x-4 gap-y-1 px-3 py-2">
                <span>{names.get(click.hostToolId) ?? click.hostToolId}</span>
                <span className="text-muted-foreground">→</span>
                <span>{names.get(click.shownToolId) ?? click.shownToolId}</span>
                <span className={click.credited ? "text-success" : "text-muted-foreground"}>
                  {click.credited ? "credited" : "not credited"}
                </span>
                <time
                  dateTime={click.createdAt.toISOString()}
                  className="ml-auto text-muted-foreground"
                >
                  {click.createdAt.toLocaleTimeString()}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
