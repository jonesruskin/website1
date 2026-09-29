import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { TrailBrowser } from "@/components/trails/trail-browser";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/metadata";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo/json-ld";
import { getTrails, toSummary } from "@/lib/trails/trails";

export const metadata = createMetadata({
  title: "Trails: routes between free tools",
  description:
    "Step-by-step routes from what you have to what you want, built from free and open-source tools. Each step hands its result to the next.",
  path: "/trails",
});

export default async function TrailsPage() {
  const trails = await getTrails();

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Trails", path: "/trails" }])} />

      <header
        className="relative overflow-hidden border-b bg-lanes"
        style={{ "--lane-gap": "4.5rem" } as CSSProperties}
      >
        <div className="container-page grid gap-8 pt-14 pb-14 sm:pt-20 sm:pb-20 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <div className="flex flex-col gap-6">
            <p className="font-mono text-xs tracking-widest text-signal-ink uppercase">
              Trails · routes between free tools
            </p>
            <h1 className="text-display font-display text-balance" style={{ fontStretch: "82%" }}>
              From what you have to what you <span className="accent-serif">want</span>.
            </h1>
          </div>
          <div className="flex flex-col gap-5">
            <p className="text-lead text-muted-foreground">
              A trail is a short route through free and open-source tools. Each step says what you
              bring, what you leave with, and why this tool is the one. The result is handed to the
              next step like a baton.
            </p>
            <p className="text-sm text-muted-foreground">
              We link to official homepages only, with no affiliate links. None of these tools pay
              to be here.
            </p>
          </div>
        </div>
      </header>

      <section aria-labelledby="trail-list" className="container-page py-12 sm:py-16">
        <h2 id="trail-list" className="sr-only">
          All trails
        </h2>
        <TrailBrowser trails={trails.map(toSummary)} />
      </section>

      <section className="tone-inverted border-t bg-background bg-lanes text-foreground">
        <div className="container-page grid gap-8 py-16 sm:py-24 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end">
          <div className="flex flex-col gap-5">
            <p className="font-mono text-xs tracking-widest text-signal-ink uppercase">
              Why trails exist
            </p>
            <h2 className="text-heading" style={{ fontStretch: "85%" }}>
              Trails are what Baton does at the <span className="accent-serif">success moment</span>
              .
            </h2>
            <p className="max-w-2xl text-lead text-muted-foreground">
              The second a tool finishes its job, people are ready for the next one. Baton lets
              makers pass them on with a single card. Trails are the same idea written down for
              people.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4">
            <p className="text-lead">Built a tool for one of these steps?</p>
            <Button asChild size="lg">
              <Link href="/makers">
                Put it on the network <ArrowRightIcon aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
