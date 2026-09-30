import type { CSSProperties } from "react";

import { Faq } from "@/components/sections/faq";
import { PricingTable } from "@/components/sections/pricing-table";
import { billingConfig } from "@/lib/billing/config";
import { pricingPlans } from "@/lib/billing/plans";
import { getFaqs } from "@/lib/faq";
import { createMetadata } from "@/lib/metadata";
import { faqJsonLd, JsonLd } from "@/lib/seo/json-ld";
import siteConfig from "@/site.config";

export const metadata = createMetadata({
  title: "Pricing",
  description: `Joining the network is free. Paid plans add tools, handshakes and longer stats. Credits are earned, never sold.`,
  path: "/pricing",
});

/** How the exchange looks on each plan. Numbers come from site.config, the rest is the rule. */
const creditNotes: Record<string, string> = {
  free: "One tool, starting with 10 credits (20 for the founding 100). Earn one for every click you send, spend one for every visitor you receive. At zero, your tool waits to be shown until it has sent someone.",
  pro: "The same exchange across up to five tools, each with its own balance. Handshakes let you pair directly with tools that agree, and they rank first.",
  enterprise:
    "The same exchange across a whole portfolio, with unlimited tools and handshakes, a year of stats, API access and CSV export of your ledger.",
};

export default async function PricingPage() {
  const plans = pricingPlans();
  const faqs = await getFaqs({ tag: "pricing" });
  const yearlySaving = plans
    .map((plan) =>
      plan.price.monthly && plan.price.yearly
        ? 1 - plan.price.yearly / (plan.price.monthly * 12)
        : 0,
    )
    .reduce((best, value) => Math.max(best, value), 0);

  return (
    <>
      {faqs.length > 0 && (
        <JsonLd
          data={faqJsonLd(faqs.map((item) => ({ question: item.question, answer: item.answer })))}
        />
      )}

      <header className="border-b bg-lanes" style={{ "--lane-gap": "4.5rem" } as CSSProperties}>
        <div className="container-page flex flex-col gap-6 pt-14 pb-14 sm:pt-20 sm:pb-20">
          <p className="font-mono text-xs tracking-widest text-signal-ink uppercase">Pricing</p>
          <h1
            className="max-w-4xl text-display font-display text-balance"
            style={{ fontStretch: "80%" }}
          >
            Free to pass. Paid to <span className="accent-serif">scale</span>.
          </h1>
          <p className="max-w-2xl text-lead text-muted-foreground">
            Joining the network costs nothing. Plans add more tools, direct pairings and longer
            stats. They never sell credits, and they never buy rank with strangers: a pairing only
            ranks first when both makers agree.
            {billingConfig.trialDays
              ? ` Paid plans start with a ${billingConfig.trialDays}-day free trial, and you can cancel any time.`
              : " Cancel any time."}
          </p>
        </div>
      </header>

      <section aria-labelledby="credits-heading" className="container-page py-14 sm:py-20">
        <div className="mb-10 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-end">
          <div className="flex flex-col gap-4">
            <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              How credits work on each plan
            </p>
            <h2 id="credits-heading" className="text-heading" style={{ fontStretch: "85%" }}>
              One rule, <span className="accent-serif">every</span> plan.
            </h2>
          </div>
          <p className="max-w-xl text-pretty text-muted-foreground">
            A click you send earns 1 credit. A visitor you receive costs 1. That is the whole
            exchange, and it is the same on Relay, Anchor and Studio. The first 100 tools on the
            network keep double starter credits.
          </p>
        </div>
        <ol className="grid gap-x-10 md:grid-cols-3">
          {billingConfig.plans.map((plan, index) => (
            <li key={plan.id} className="flex flex-col gap-3 border-t py-6">
              <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                {String(index + 1).padStart(2, "0")} · {plan.name}
              </p>
              <p className="text-pretty">{creditNotes[plan.id]}</p>
            </li>
          ))}
        </ol>
      </section>

      <PricingTable
        className="pt-4 sm:pt-4"
        plans={plans}
        locale={siteConfig.locale}
        labels={
          yearlySaving >= 0.05 ? { yearlyHint: `Save ${Math.round(yearlySaving * 100)}%` } : {}
        }
      />

      {faqs.length > 0 && (
        <Faq
          layout="split"
          name="pricing-faq"
          className="border-t"
          eyebrow="Questions"
          title={
            <>
              Before you <span className="accent-serif">pay</span>.
            </>
          }
          description="The short answers on plans, credits and handshakes. The rest are in the FAQ."
          items={faqs.map((item) => ({
            question: item.question,
            answer: (
              <div className="flex flex-col gap-3">
                {item.answer.split(/\n{2,}/).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            ),
          }))}
        />
      )}
    </>
  );
}
