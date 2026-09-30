import { CheckIcon } from "lucide-react";

import type { PricingPlan } from "@/components/sections/pricing-table";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { LaneLabel } from "./lane-label";

function formatPrice(amount: number, currency: string, locale?: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Literal class names so Tailwind can see them.
const hideWhenYearly = "group-has-[[data-interval=yearly]:checked]/pricing:hidden";
const showWhenYearly = "group-has-[[data-interval=yearly]:checked]/pricing:inline";
const showWhenYearlyFlex = "group-has-[[data-interval=yearly]:checked]/pricing:inline-flex";

/**
 * 09 · Pricing, set as lanes. Reads the same plans as the pricing page (`pricingPlans()`),
 * and keeps the pure-CSS monthly/yearly switch and the checkout-safe plain-anchor CTAs.
 */
export function Pricing({ plans, locale }: { plans: PricingPlan[]; locale?: string }) {
  const paid = plans.filter((p) => (p.price.yearly ?? 0) > 0);
  const toggle = paid.length > 0;
  const saving = paid
    .map((p) =>
      p.price.monthly && p.price.yearly ? 1 - p.price.yearly / (p.price.monthly * 12) : 0,
    )
    .reduce((best, v) => Math.max(best, v), 0);

  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      className="group/pricing relative scroll-mt-16 py-24 sm:py-28 lg:py-36"
    >
      <div className="container-page">
        <LaneLabel n={9}>Pricing</LaneLabel>
        <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end">
          <h2
            id="pricing-title"
            className="font-display text-[clamp(2.75rem,8.6vw,7.5rem)] leading-[0.88] font-extrabold tracking-[-0.045em] lg:col-span-8"
          >
            Start free.
            <br />
            Stay <span className="accent-serif text-[1.14em] font-normal">fair.</span>
          </h2>
          <p className="max-w-md text-lead text-muted-foreground lg:col-span-4 lg:justify-self-end">
            The exchange is the product, and it is free for good. Pay when you need more lanes, not
            to buy your way up the list.
          </p>
        </div>

        {toggle && (
          <fieldset className="mt-12">
            <legend className="sr-only">Billing interval</legend>
            <div className="inline-flex rounded-full border p-1 text-sm">
              {(["monthly", "yearly"] as const).map((interval) => (
                <label
                  key={interval}
                  className="flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 font-medium text-muted-foreground transition-colors has-[:checked]:bg-foreground has-[:checked]:text-background has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background"
                >
                  <input
                    type="radio"
                    name="home-billing-interval"
                    value={interval}
                    data-interval={interval}
                    defaultChecked={interval === "monthly"}
                    className="sr-only"
                  />
                  {interval === "monthly" ? "Monthly" : "Yearly"}
                  {interval === "yearly" && saving >= 0.05 && (
                    <span className="font-mono text-xs tracking-widest uppercase">
                      Save {Math.round(saving * 100)}%
                    </span>
                  )}
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <ul
          className={cn(
            "mt-10 grid border-t border-foreground lg:mt-14",
            plans.length >= 3 ? "lg:grid-cols-[1fr_1.1fr_1fr]" : "lg:grid-cols-2",
          )}
        >
          {plans.map((plan, i) => {
            const currency = plan.currency ?? "USD";
            const monthly = plan.price.monthly;
            const yearly = plan.price.yearly;
            const free = monthly === 0;
            const yearlyDiffers = toggle && yearly != null && !free;
            return (
              <li
                key={plan.id}
                className={cn(
                  "relative flex flex-col gap-8 border-b py-10 lg:border-b-0 lg:py-14",
                  i > 0 && "lg:border-l lg:pl-10",
                  i < plans.length - 1 && "lg:pr-10",
                  plan.highlighted &&
                    "before:absolute before:inset-x-0 before:-top-px before:h-1 before:bg-signal",
                )}
              >
                <div className="flex h-7 items-center justify-between gap-3 font-mono text-xs tracking-widest uppercase">
                  <span className="text-muted-foreground">
                    Lane {String(i + 1).padStart(2, "0")}
                  </span>
                  {plan.badge && (
                    <span className="rounded-full bg-signal px-3 py-1 font-semibold text-signal-foreground">
                      {plan.badge}
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-display text-4xl leading-none font-extrabold tracking-[-0.04em]">
                    {plan.name}
                  </h3>
                  {plan.description && (
                    <p className="mt-3 max-w-xs text-muted-foreground">{plan.description}</p>
                  )}
                </div>
                <p className="flex items-baseline gap-2">
                  {monthly === null ? (
                    <span className="font-display text-6xl font-extrabold tracking-[-0.05em]">
                      {plan.customPriceLabel ?? "Custom"}
                    </span>
                  ) : (
                    <>
                      <span
                        className={cn(
                          "font-display text-7xl leading-none font-extrabold tracking-[-0.06em] tabular-nums",
                          yearlyDiffers && hideWhenYearly,
                        )}
                        style={{ fontStretch: "115%" }}
                      >
                        {formatPrice(monthly, currency, locale)}
                      </span>
                      <span
                        className={cn(
                          "font-mono text-xs tracking-widest text-muted-foreground uppercase",
                          yearlyDiffers && hideWhenYearly,
                        )}
                      >
                        {free ? "forever" : "/ month"}
                      </span>
                      {yearlyDiffers && (
                        <>
                          <span
                            className={cn(
                              "hidden font-display text-7xl leading-none font-extrabold tracking-[-0.06em] tabular-nums",
                              showWhenYearly,
                            )}
                            style={{ fontStretch: "115%" }}
                          >
                            {formatPrice(yearly, currency, locale)}
                          </span>
                          <span
                            className={cn(
                              "hidden font-mono text-xs tracking-widest text-muted-foreground uppercase",
                              showWhenYearly,
                            )}
                          >
                            / year
                          </span>
                        </>
                      )}
                    </>
                  )}
                </p>
                {typeof plan.cta.href === "string" || !yearlyDiffers ? (
                  <Button
                    asChild
                    size="lg"
                    variant={plan.highlighted || free ? "primary" : "outline"}
                    className="w-full rounded-full font-semibold"
                  >
                    {/* Plain anchors: CTAs often hit checkout routes, which must never be prefetched. */}
                    <a
                      href={
                        typeof plan.cta.href === "string" ? plan.cta.href : plan.cta.href.monthly
                      }
                    >
                      {plan.cta.label}
                    </a>
                  </Button>
                ) : (
                  <>
                    <Button
                      asChild
                      size="lg"
                      variant={plan.highlighted ? "primary" : "outline"}
                      className={cn("w-full rounded-full font-semibold", hideWhenYearly)}
                    >
                      <a href={plan.cta.href.monthly}>{plan.cta.label}</a>
                    </Button>
                    <Button
                      asChild
                      size="lg"
                      variant={plan.highlighted ? "primary" : "outline"}
                      className={cn("hidden w-full rounded-full font-semibold", showWhenYearlyFlex)}
                    >
                      <a href={plan.cta.href.yearly}>{plan.cta.label}</a>
                    </Button>
                  </>
                )}
                <ul className="flex flex-col gap-3 border-t pt-8 text-[0.9375rem]">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-3">
                      <CheckIcon aria-hidden className="mt-0.5 size-4 shrink-0 text-signal-ink" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
