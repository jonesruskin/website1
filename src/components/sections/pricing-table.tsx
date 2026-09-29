import { CheckIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Section } from "@/components/sections/kit/section";
import { SectionHeader } from "@/components/sections/kit/section-header";
import type { SectionTone } from "@/components/sections/kit/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type PricingPlan = {
  id: string;
  name: string;
  description?: string;
  /** Amounts in major units (e.g. 12 = $12). `null` renders `customPriceLabel`. */
  price: { monthly: number | null; yearly?: number | null };
  currency?: string;
  customPriceLabel?: string;
  features: string[];
  /**
   * Where the button goes. Pass `{ monthly, yearly }` to send each interval to
   * its own URL (the right one shows with the CSS toggle).
   */
  cta: { label: string; href: string | { monthly: string; yearly: string } };
  highlighted?: boolean;
  badge?: string;
};

export type PricingTableProps = {
  eyebrow?: ReactNode;
  title?: ReactNode;
  description?: ReactNode;
  plans: PricingPlan[];
  /** Show the monthly/yearly switch when any plan has a yearly price. */
  showIntervalToggle?: boolean;
  labels?: {
    monthly?: string;
    yearly?: string;
    perMonth?: string;
    perYear?: string;
    /** Shown next to "Yearly", e.g. "Save 20%". */
    yearlyHint?: string;
    interval?: string;
  };
  locale?: string;
  /** Unique per page if you render more than one table. */
  name?: string;
  tone?: SectionTone;
  className?: string;
};

function formatPrice(amount: number, currency: string, locale?: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * The monthly/yearly toggle is pure CSS: two radio inputs and `:has()`. No
 * client JavaScript, works before hydration, and remains keyboard accessible.
 */
export function PricingTable({
  eyebrow,
  title,
  description,
  plans,
  showIntervalToggle = true,
  labels = {},
  locale,
  name = "billing-interval",
  tone,
  className,
}: PricingTableProps) {
  const hasYearly = plans.some((plan) => plan.price.yearly != null);
  const toggle = showIntervalToggle && hasYearly;
  // Literal class names so Tailwind can see them.
  const hideWhenYearly = "group-has-[[data-interval=yearly]:checked]/pricing:hidden";
  const showWhenYearly = "group-has-[[data-interval=yearly]:checked]/pricing:inline";
  const showWhenYearlyFlex = "group-has-[[data-interval=yearly]:checked]/pricing:inline-flex";

  return (
    <Section tone={tone} className={cn("group/pricing", className)}>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        align="center"
        className="mb-10"
      />
      {toggle && (
        <fieldset className="mb-12 flex justify-center">
          <legend className="sr-only">{labels.interval ?? "Billing interval"}</legend>
          <div className="inline-flex rounded-full bg-muted p-1 text-sm">
            {(["monthly", "yearly"] as const).map((interval) => (
              <label
                key={interval}
                className="flex cursor-pointer items-center gap-2 rounded-full px-4 py-1.5 font-medium text-muted-foreground transition-colors has-[:checked]:bg-background has-[:checked]:text-foreground has-[:checked]:shadow-xs has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring"
              >
                <input
                  type="radio"
                  name={name}
                  value={interval}
                  data-interval={interval}
                  defaultChecked={interval === "monthly"}
                  className="sr-only"
                />
                {interval === "monthly"
                  ? (labels.monthly ?? "Monthly")
                  : (labels.yearly ?? "Yearly")}
                {interval === "yearly" && labels.yearlyHint && (
                  <span className="text-xs font-semibold text-success">{labels.yearlyHint}</span>
                )}
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <ul
        className={cn(
          "mx-auto grid max-w-5xl gap-6",
          plans.length >= 3 ? "lg:grid-cols-3" : "md:grid-cols-2",
          plans.length === 2 && "max-w-3xl",
        )}
      >
        {plans.map((plan, planIndex) => {
          const currency = plan.currency ?? "USD";
          const monthly = plan.price.monthly;
          const yearlyPrice = plan.price.yearly;
          return (
            <li
              key={plan.id}
              className={cn(
                "relative flex flex-col gap-6 rounded-2xl border bg-card p-6 sm:p-8",
                plan.highlighted && "border-2 border-foreground shadow-lg",
              )}
            >
              {plan.badge && (
                <span className="absolute -top-3 left-6 rounded-full bg-signal px-3 py-1 font-mono text-[0.6875rem] font-semibold tracking-widest text-signal-foreground uppercase sm:left-8">
                  {plan.badge}
                </span>
              )}
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-display text-2xl font-semibold tracking-tight">{plan.name}</h3>
                <span
                  aria-hidden
                  className="font-mono text-xs tracking-widest text-muted-foreground uppercase"
                >
                  {String(planIndex + 1).padStart(2, "0")} / {String(plans.length).padStart(2, "0")}
                </span>
              </div>
              {plan.description && (
                <p className="-mt-3 text-sm text-muted-foreground">{plan.description}</p>
              )}
              <p className="flex items-baseline gap-1">
                {monthly === null ? (
                  <span className="font-display text-5xl font-bold tracking-tighter">
                    {plan.customPriceLabel ?? "Custom"}
                  </span>
                ) : (
                  <>
                    <span
                      className={cn(
                        "font-display text-5xl font-bold tracking-tighter tabular-nums",
                        toggle && yearlyPrice != null && hideWhenYearly,
                      )}
                      style={{ fontStretch: "85%" }}
                    >
                      {formatPrice(monthly, currency, locale)}
                    </span>
                    <span
                      className={cn(
                        "text-sm text-muted-foreground",
                        toggle && yearlyPrice != null && hideWhenYearly,
                      )}
                    >
                      {labels.perMonth ?? "/month"}
                    </span>
                    {toggle && yearlyPrice != null && (
                      <>
                        <span
                          className={cn(
                            "hidden font-display text-5xl font-bold tracking-tighter tabular-nums",
                            showWhenYearly,
                          )}
                          style={{ fontStretch: "85%" }}
                        >
                          {formatPrice(yearlyPrice, currency, locale)}
                        </span>
                        <span
                          className={cn("hidden text-sm text-muted-foreground", showWhenYearly)}
                        >
                          {labels.perYear ?? "/year"}
                        </span>
                      </>
                    )}
                  </>
                )}
              </p>
              {typeof plan.cta.href === "string" || !toggle ? (
                <Button
                  asChild
                  variant={plan.highlighted ? "primary" : "outline"}
                  size="lg"
                  className="w-full"
                >
                  {/* Plain anchors: CTAs often hit checkout routes, which must never be prefetched. */}
                  <a
                    href={typeof plan.cta.href === "string" ? plan.cta.href : plan.cta.href.monthly}
                  >
                    {plan.cta.label}
                  </a>
                </Button>
              ) : (
                <>
                  <Button
                    asChild
                    variant={plan.highlighted ? "primary" : "outline"}
                    size="lg"
                    className={cn("w-full", hideWhenYearly)}
                  >
                    <a href={plan.cta.href.monthly}>{plan.cta.label}</a>
                  </Button>
                  <Button
                    asChild
                    variant={plan.highlighted ? "primary" : "outline"}
                    size="lg"
                    className={cn("hidden w-full", showWhenYearlyFlex)}
                  >
                    <a href={plan.cta.href.yearly}>{plan.cta.label}</a>
                  </Button>
                </>
              )}
              <ul className="flex flex-col gap-3 text-sm">
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
    </Section>
  );
}
