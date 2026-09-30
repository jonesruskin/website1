import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { Button } from "@/components/ui/button";
import { createMetadata } from "@/lib/metadata";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo/json-ld";

export const metadata = createMetadata({
  title: "For makers: put your tool on the network",
  description:
    "Your tool has a success moment. Add one line, call baton.pass(), and pass people to the next useful tool while other tools pass theirs to you.",
  path: "/makers",
});

const embed = `<script
  src="https://baton.run/embed.js"
  data-key="bk_…"
  async
></script>`;

const steps = [
  {
    title: "Say what your tool does",
    body: "Name, URL, category, and two lists from a shared vocabulary: what people bring to your tool, and what they leave with. That is all Baton needs to match you.",
    hint: "You get 10 starter credits",
  },
  {
    title: "Paste one line",
    body: "Add the embed script to your site, then call baton.pass() at the moment your tool finishes its job: file compressed, audio transcribed, logo exported.",
    hint: 'baton.pass({ ctx: "pdf" })',
  },
  {
    title: "Watch the first pass",
    body: "People finishing on your site see one card for the next tool. People finishing elsewhere may see yours. Impressions, clicks and credits show up in your dashboard.",
    hint: "One card, never a feed",
  },
] as const;

const rules = [
  {
    title: "No competitors",
    body: "Two tools in the same category are never paired unless both opt in.",
  },
  {
    title: "No repeat clicks",
    body: "A second click from the same visitor to the same tool within 24 hours isn't credited.",
  },
  {
    title: "A daily cap",
    body: "At most 3 credited clicks per visitor, per host, per day.",
  },
  {
    title: "No cookies, no profiles",
    body: "Visitors are identified only by an anonymous hash that rotates every day.",
  },
  {
    title: "Earn your place",
    body: "A tool with 0 credits isn't shown until it sends traffic of its own.",
  },
  {
    title: "Handshakes are mutual",
    body: "Paid plans can set up direct pairings, but both tools have to agree. Nobody can buy a spot on your site.",
  },
] as const;

const lanes = { "--lane-gap": "5rem" } as CSSProperties;

export default function MakersPage() {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "For makers", path: "/makers" }])} />

      {/* Hero */}
      <header className="border-b bg-lanes" style={lanes}>
        <div className="container-page grid grid-cols-[minmax(0,1fr)] gap-10 pt-14 pb-16 sm:pt-20 sm:pb-24 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] lg:items-end lg:gap-16">
          <div className="flex flex-col gap-7">
            <p className="font-mono text-xs tracking-widest text-signal-ink uppercase">
              For makers · you came from a card
            </p>
            <h1 className="text-display font-display text-balance" style={{ fontStretch: "78%" }}>
              Your tool has a success moment. <span className="accent-serif">Use it.</span>
            </h1>
            <p className="max-w-2xl text-lead text-muted-foreground">
              The second your tool finishes its job, your user is holding a result and wondering
              what comes next. Baton fills that moment with one card for the most useful next tool,
              and other tools do the same for you.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/sign-up">
                  Put your tool on the network <ArrowRightIcon aria-hidden />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/docs/getting-started">Read the two-minute install</Link>
              </Button>
            </div>
          </div>

          <figure className="flex flex-col gap-3">
            <div className="overflow-x-auto rounded-2xl border bg-card p-5 shadow-md">
              <p className="mb-3 font-mono text-xs tracking-widest text-muted-foreground uppercase">
                The whole install
              </p>
              <pre className="font-mono text-sm leading-6" tabIndex={0}>
                <code>{embed}</code>
              </pre>
            </div>
            <figcaption className="text-sm text-muted-foreground">
              Then call <code className="font-mono text-foreground">baton.pass()</code> when your
              tool succeeds. That is the whole integration.
            </figcaption>
          </figure>
        </div>
      </header>

      {/* 01: two minutes */}
      <section aria-labelledby="two-minutes" className="container-page py-16 sm:py-24">
        <div className="mb-10 flex flex-col gap-4 sm:mb-14">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
            01 / 04 · Setup
          </p>
          <h2 id="two-minutes" className="text-heading" style={{ fontStretch: "85%" }}>
            What happens in <span className="accent-serif">two minutes</span>.
          </h2>
        </div>
        <ol className="flex flex-col">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="grid reveal items-start gap-x-8 gap-y-3 border-t py-8 last:border-b sm:py-10 md:grid-cols-[7rem_minmax(0,1fr)_minmax(0,1fr)]"
            >
              <span
                className="font-display text-6xl leading-none font-bold tracking-tighter sm:text-7xl"
                style={{ fontStretch: "70%" }}
                aria-hidden
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="font-display text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-3xl">
                {step.title}
              </h3>
              <div className="flex flex-col gap-3">
                <p className="text-pretty text-muted-foreground">{step.body}</p>
                <p className="font-mono text-xs tracking-widest text-signal-ink uppercase">
                  {step.hint}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 02: the exchange */}
      <section
        aria-labelledby="exchange"
        className="tone-inverted border-y bg-background bg-lanes text-foreground"
        style={lanes}
      >
        <div className="container-page py-16 sm:py-24">
          <div className="mb-10 flex max-w-3xl flex-col gap-4 sm:mb-14">
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              02 / 04 · The exchange
            </p>
            <h2 id="exchange" className="text-heading" style={{ fontStretch: "85%" }}>
              Send a visitor, earn a credit.{" "}
              <span className="accent-serif">Receive one, spend one.</span>
            </h2>
          </div>

          <div className="grid gap-px overflow-hidden rounded-2xl border bg-border md:grid-cols-2">
            <div className="flex flex-col gap-4 bg-background p-6 sm:p-10">
              <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                A click you send
              </p>
              <p
                className="font-display text-8xl leading-none font-bold tracking-tighter text-signal-ink sm:text-9xl"
                style={{ fontStretch: "70%" }}
              >
                +1
              </p>
              <p className="text-muted-foreground">
                Someone finishes on your site, clicks the card, and lands on another tool. You earn
                one credit.
              </p>
            </div>
            <div className="flex flex-col gap-4 bg-background p-6 sm:p-10">
              <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                A visitor you receive
              </p>
              <p
                className="font-display text-8xl leading-none font-bold tracking-tighter text-foreground sm:text-9xl"
                style={{ fontStretch: "70%" }}
              >
                −1
              </p>
              <p className="text-muted-foreground">
                Someone finishes on another site, clicks your card, and lands on your tool. One
                credit is spent.
              </p>
            </div>
          </div>

          <p className="mt-8 max-w-3xl text-lead text-muted-foreground">
            Credits move one for one, so there is nothing to bid on and no slot to buy. Every new
            tool starts with 10, which is enough to be shown before you have sent anyone anywhere.
          </p>
        </div>
      </section>

      {/* 03: fairness */}
      <section aria-labelledby="fairness" className="container-page py-16 sm:py-24">
        <div className="mb-10 grid gap-4 sm:mb-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              03 / 04 · Fairness
            </p>
            <h2 id="fairness" className="text-heading" style={{ fontStretch: "85%" }}>
              Rules that keep the track <span className="accent-serif">clean</span>.
            </h2>
          </div>
          <p className="max-w-xl text-pretty text-muted-foreground">
            Recommendation networks fail when they become ad slots or get farmed. These are the
            rules that stop both, and the{" "}
            <Link
              href="/docs/network/fairness"
              className="text-foreground underline underline-offset-4"
            >
              docs spell them out
            </Link>
            .
          </p>
        </div>
        <ol className="grid gap-x-10 md:grid-cols-2">
          {rules.map((rule, index) => (
            <li key={rule.title} className="flex gap-5 border-t py-6">
              <span className="pt-1 font-mono text-xs tracking-widest text-muted-foreground uppercase">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-display text-xl font-semibold tracking-tight">{rule.title}</h3>
                <p className="text-pretty text-muted-foreground">{rule.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* 04: founding 100 */}
      <section aria-labelledby="founding" className="container-page pb-16 sm:pb-24">
        <div className="relative grid gap-8 overflow-hidden rounded-3xl bg-signal p-8 text-signal-foreground sm:p-14 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-center lg:gap-16">
          <p
            aria-hidden
            className="font-display text-[8rem] leading-[0.8] font-black tracking-tighter sm:text-[12rem]"
            style={{ fontStretch: "62%" }}
          >
            100
          </p>
          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs tracking-widest uppercase">
              04 / 04 · The founding 100
            </p>
            <h2
              id="founding"
              className="font-display text-3xl leading-none font-bold tracking-tight text-balance sm:text-5xl"
              style={{ fontStretch: "85%" }}
            >
              The first 100 tools keep double starter credits.
            </h2>
            <p className="max-w-xl text-lg text-pretty">
              Join early and your tool starts with 20 credits instead of 10, and keeps the bonus. It
              is counted by sign-up order, and we&apos;ll say plainly when the 100 are gone.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="tone-inverted border-t bg-background bg-lanes text-foreground"
        style={lanes}
      >
        <div className="container-page flex flex-col items-start gap-8 py-16 sm:py-24 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-3xl flex-col gap-4">
            <h2 className="text-display" style={{ fontStretch: "78%" }}>
              Two minutes. One line. <span className="accent-serif">Your move.</span>
            </h2>
            <p className="text-lead text-muted-foreground">
              The Relay plan is free for one tool, for good.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/sign-up">
                Create your account <ArrowRightIcon aria-hidden />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/pricing">See plans</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
