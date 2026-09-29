import { ArrowRightIcon, ChevronRightIcon } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";

import { ArtifactChip } from "@/components/trails/artifact-chip";
import { RelayTrack } from "@/components/trails/relay-track";
import { TrailLane } from "@/components/trails/trail-lane";
import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/metadata";
import { breadcrumbJsonLd, howToJsonLd, JsonLd } from "@/lib/seo/json-ld";
import { getTrail, getTrails, trailHref, trailParams, trailTools } from "@/lib/trails/trails";

type Props = { params: Promise<{ slug: string }> };

export const generateStaticParams = trailParams;
export const dynamicParams = false;

export async function generateMetadata({ params }: Props) {
  const trail = await getTrail((await params).slug);
  if (!trail) return {};
  return createMetadata({
    title: trail.title,
    description: `${trail.promise} ${trail.steps.length} steps, ${trail.time.toLowerCase()}.`,
    path: trailHref(trail),
    image: false, // this route ships its own opengraph-image
  });
}

export default async function TrailPage({ params }: Props) {
  const { slug } = await params;
  const trail = await getTrail(slug);
  if (!trail) notFound();

  const tools = trailTools(trail);
  const more = (await getTrails()).filter((other) => other.slug !== trail.slug).slice(0, 3);
  const path = trailHref(trail);

  return (
    <>
      <JsonLd
        data={[
          howToJsonLd({
            name: trail.title,
            description: trail.promise,
            path,
            minutes: trail.minutes,
            tools: tools.map((tool) => tool.name),
            steps: trail.steps.map((step, index) => ({
              name: step.title,
              text: `${step.why} Tool: ${step.tool.name}.`,
              url: `${path}#step-${index + 1}`,
            })),
          }),
          breadcrumbJsonLd([
            { name: "Trails", path: "/trails" },
            { name: trail.title, path },
          ]),
        ]}
      />

      <header className="border-b bg-lanes" style={{ "--lane-gap": "4.5rem" } as CSSProperties}>
        <div className="container-page flex flex-col gap-8 pt-10 pb-12 sm:pt-14 sm:pb-16">
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 text-sm text-muted-foreground">
              <li className="flex items-center gap-1">
                <Link href="/trails" className="transition-colors hover:text-foreground">
                  Trails
                </Link>
                <ChevronRightIcon aria-hidden className="size-3.5" />
              </li>
              <li aria-current="page" className="text-foreground">
                {trail.title}
              </li>
            </ol>
          </nav>

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
            <div className="flex flex-col gap-5">
              <p className="font-mono text-xs tracking-widest text-signal-ink uppercase">
                Trail · {trail.steps.length} steps · {trail.time}
              </p>
              <h1 className="text-display font-display text-balance" style={{ fontStretch: "82%" }}>
                {trail.title}
              </h1>
              <p className="max-w-2xl text-lead text-muted-foreground">{trail.promise}</p>
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 border-t pt-5 text-sm">
              <div className="col-span-2 flex flex-col gap-1">
                <dt className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                  Who it is for
                </dt>
                <dd>{trail.audience}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                  Time
                </dt>
                <dd>{trail.time}</dd>
              </div>
              <div className="flex flex-col gap-1">
                <dt className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                  Tools
                </dt>
                <dd>{tools.length}, all free to start</dd>
              </div>
            </dl>
          </div>

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <ArtifactChip id={trail.from} kind="in" />
              <ArtifactChip id={trail.to} kind="out" />
            </div>
            <TrailLane steps={trail.steps.length} />
          </div>
        </div>
      </header>

      <section aria-label="Steps" className="container-page py-12 sm:py-16">
        {trail.note && (
          <p className="mb-10 max-w-3xl rounded-xl border bg-muted p-4 text-sm leading-6">
            <strong className="font-semibold">A note.</strong> {trail.note}
          </p>
        )}
        <div className="max-w-4xl">
          <RelayTrack trail={trail} />
        </div>
      </section>

      <section className="tone-inverted border-t bg-background bg-lanes text-foreground">
        <div className="container-page grid gap-8 py-16 sm:py-24 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end">
          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs tracking-widest text-signal-ink uppercase">
              For makers
            </p>
            <h2 className="text-heading" style={{ fontStretch: "85%" }}>
              Build a tool for one of these steps?{" "}
              <span className="accent-serif">Put it on the network.</span>
            </h2>
          </div>
          <div className="flex flex-col items-start gap-4">
            <p className="text-lead text-muted-foreground">
              When your tool finishes its job, Baton shows one card for the most useful next tool.
              Setup takes about two minutes.
            </p>
            <Button asChild size="lg">
              <Link href="/makers">
                Put it on the network <ArrowRightIcon aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {more.length > 0 && (
        <section aria-labelledby="more-trails" className="container-page py-14 sm:py-20">
          <h2
            id="more-trails"
            className="mb-6 font-mono text-xs tracking-widest text-muted-foreground uppercase"
          >
            More trails
          </h2>
          <ul className="grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-3">
            {more.map((other) => (
              <li key={other.slug} className="bg-background">
                <Link
                  href={trailHref(other)}
                  className="flex h-full flex-col gap-3 p-5 outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
                >
                  <span className="font-display text-lg font-semibold tracking-tight">
                    {other.title}
                  </span>
                  <span className="text-sm text-muted-foreground">{other.promise}</span>
                  <TrailLane steps={other.steps.length} className="mt-auto pt-2" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
