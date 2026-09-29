import type { Metadata } from "next";

import { ClosingCta } from "@/components/baton/marketing/closing-cta";
import { Exchange } from "@/components/baton/marketing/exchange";
import { Founding } from "@/components/baton/marketing/founding";
import { Hero } from "@/components/baton/marketing/hero";
import { HomeFaq } from "@/components/baton/marketing/home-faq";
import { HowItWorks } from "@/components/baton/marketing/how-it-works";
import { JourneyTicker } from "@/components/baton/marketing/journey-ticker";
import { Pricing } from "@/components/baton/marketing/pricing";
import { Proof } from "@/components/baton/marketing/proof";
import { TrailsTeaser } from "@/components/baton/marketing/trails-teaser";
import { TryCard } from "@/components/baton/marketing/try-card";
import { WastedStory } from "@/components/baton/marketing/wasted-story";
import { pricingPlans } from "@/lib/billing/plans";
import { getFaqs } from "@/lib/faq";
import { createMetadata } from "@/lib/metadata";
import siteConfig from "@/site.config";

export const metadata: Metadata = {
  ...createMetadata({
    description:
      "Baton passes your users to the next tool they need, and passes theirs to you. One script tag, a fair 1:1 credit exchange, free.",
    path: "/",
  }),
  title: { absolute: "Baton: every tool ends in a dead end. Make yours a doorway." },
};

export default async function HomePage() {
  const faqs = (await getFaqs()).slice(0, 6);
  const plans = pricingPlans();

  return (
    <>
      <Hero />
      <JourneyTicker />
      <WastedStory />
      <HowItWorks />
      <TryCard />
      <Exchange />
      <Proof />
      <TrailsTeaser />
      <Founding />
      <Pricing plans={plans} locale={siteConfig.locale} />
      <HomeFaq items={faqs} />
      <ClosingCta />
    </>
  );
}
