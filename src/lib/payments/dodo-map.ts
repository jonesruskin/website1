/**
 * Pure pieces of the Dodo Payments adapter: product mapping, status and event
 * normalization, and webhook signature checks. No env, no network, so it is
 * unit tested directly (./dodo-map.test.ts). The client lives in ./dodo.ts.
 *
 * Dodo is a merchant of record: it is the legal seller, collects VAT/GST
 * worldwide and pays out to the business (including to Indian bank accounts).
 */
import { Webhook } from "standardwebhooks";

import type { Checkout, PaymentEvent, Subscription, SubscriptionStatus } from "./types";

/** Billing's price keys ("pro_monthly") → Dodo product ids ("pdt_…"), from DODO_PRODUCTS. */
export type ProductMap = ReadonlyMap<string, string>;

/** Parses "pro_monthly=pdt_a, pro_yearly=pdt_b" (commas or newlines). Ignores blank entries. */
export function parseProducts(raw: string | undefined | null): ProductMap {
  const map = new Map<string, string>();
  for (const entry of (raw ?? "").split(/[,\n]/)) {
    const [key, id] = entry.split("=").map((part) => part.trim());
    if (key && id) map.set(key, id);
  }
  return map;
}

/** The Dodo product for a price key; a raw "pdt_…" id passes through unchanged. */
export function productFor(products: ProductMap, key: string) {
  if (key.startsWith("pdt_")) return key;
  const id = products.get(key);
  if (!id) {
    throw new Error(
      `No Dodo product for "${key}". Add it to DODO_PRODUCTS, e.g. ${key}=pdt_… (see DEPLOY.md).`,
    );
  }
  return id;
}

/** Reverse lookup, so webhook subscriptions resolve to the same keys billing uses. */
export function keyForProduct(products: ProductMap, productId: string) {
  for (const [key, id] of products) if (id === productId) return key;
  return productId;
}

type DodoStatus =
  | "pending"
  | "active"
  | "on_hold"
  | "paused"
  | "cancelled"
  | "failed"
  | "expired"
  | "past_due";

/**
 * Dodo → normalized status. `on_hold` means a renewal failed and Dodo is
 * retrying, so it keeps access as past_due, like Stripe's dunning window.
 */
export function toStatus(status: string): SubscriptionStatus {
  const map: Record<DodoStatus, SubscriptionStatus> = {
    pending: "incomplete",
    active: "active",
    on_hold: "past_due",
    past_due: "past_due",
    paused: "paused",
    cancelled: "canceled",
    failed: "incomplete",
    expired: "canceled",
  };
  return map[status as DodoStatus] ?? "incomplete";
}

/** The subset of Dodo's Subscription object the adapter reads. */
export type DodoSubscription = {
  subscription_id: string;
  status: string;
  product_id: string;
  customer: { customer_id: string };
  next_billing_date?: string | null;
  cancel_at_next_billing_date?: boolean | null;
  created_at?: string | null;
  trial_period_days?: number | null;
  subscription_period_interval?: string | null;
  payment_frequency_interval?: string | null;
  metadata?: Record<string, string> | null;
};

const DAY = 86_400_000;

export function toSubscription(data: DodoSubscription, products: ProductMap): Subscription {
  const interval = (data.payment_frequency_interval ?? data.subscription_period_interval ?? "")
    .toString()
    .toLowerCase();
  const created = data.created_at ? new Date(data.created_at) : null;
  const trialDays = data.trial_period_days ?? 0;
  const trialEnd = created && trialDays > 0 ? new Date(created.getTime() + trialDays * DAY) : null;
  const inTrial = trialEnd !== null && trialEnd.getTime() > Date.now();
  const status = toStatus(data.status);
  return {
    id: data.subscription_id,
    customerId: data.customer.customer_id,
    status: status === "active" && inTrial ? "trialing" : status,
    price: keyForProduct(products, data.product_id),
    interval: interval === "year" ? "year" : interval === "month" ? "month" : null,
    currentPeriodEnd: data.next_billing_date ? new Date(data.next_billing_date) : null,
    cancelAtPeriodEnd: Boolean(data.cancel_at_next_billing_date),
    trialEnd,
    metadata: { ...(data.metadata ?? {}) },
  };
}

/** The subset of Dodo's Payment object the adapter reads. */
export type DodoPayment = {
  payment_id: string;
  customer: { customer_id: string; email?: string | null };
  subscription_id?: string | null;
  total_amount?: number | null;
  currency?: string | null;
  metadata?: Record<string, string> | null;
};

export type DodoWebhookEvent = { type: string; data: unknown };

const SUBSCRIPTION_UPDATED = new Set([
  "subscription.active",
  "subscription.renewed",
  "subscription.updated",
  "subscription.plan_changed",
  "subscription.on_hold",
  "subscription.past_due",
  "subscription.paused",
  "subscription.unpaused",
]);
const SUBSCRIPTION_ENDED = new Set([
  "subscription.cancelled",
  "subscription.expired",
  "subscription.failed",
]);

/**
 * Dodo event → normalized event, or null for events billing doesn't need.
 * `id` is the delivery's webhook-id header, stable across retries, so handlers
 * stay idempotent.
 */
export function mapEvent(
  id: string,
  event: DodoWebhookEvent,
  products: ProductMap,
): PaymentEvent | null {
  if (SUBSCRIPTION_UPDATED.has(event.type)) {
    return {
      type: "subscription.updated",
      id,
      subscription: toSubscription(event.data as DodoSubscription, products),
    };
  }
  if (SUBSCRIPTION_ENDED.has(event.type)) {
    return {
      type: "subscription.deleted",
      id,
      subscription: toSubscription(event.data as DodoSubscription, products),
    };
  }
  if (event.type === "payment.succeeded") {
    const payment = event.data as DodoPayment;
    const checkout: Checkout = {
      id: payment.payment_id,
      status: "complete",
      paid: true,
      mode: payment.subscription_id ? "subscription" : "payment",
      customerId: payment.customer.customer_id,
      customerEmail: payment.customer.email ?? undefined,
      subscriptionId: payment.subscription_id ?? undefined,
      amountTotal: payment.total_amount ?? undefined,
      currency: payment.currency?.toLowerCase(),
      metadata: { ...(payment.metadata ?? {}) },
    };
    return { type: "checkout.completed", id, checkout };
  }
  if (event.type === "payment.failed") {
    const payment = event.data as DodoPayment;
    return {
      type: "invoice.payment_failed",
      id,
      customerId: payment.customer.customer_id,
      subscriptionId: payment.subscription_id ?? undefined,
    };
  }
  return null;
}

export type WebhookHeaders = {
  "webhook-id": string;
  "webhook-timestamp": string;
  "webhook-signature": string;
};

/** Reads the Standard Webhooks headers Dodo signs with; throws when any is missing. */
export function webhookHeaders(headers: Headers): WebhookHeaders {
  const read = (name: keyof WebhookHeaders) => {
    const value = headers.get(name);
    if (!value) throw new Error(`Missing ${name} header.`);
    return value;
  };
  return {
    "webhook-id": read("webhook-id"),
    "webhook-timestamp": read("webhook-timestamp"),
    "webhook-signature": read("webhook-signature"),
  };
}

/**
 * Verifies a delivery (HMAC-SHA256 over id.timestamp.body, 5-minute tolerance)
 * and returns the parsed event. Throws on a bad signature or stale timestamp.
 */
export function verifyWebhook(body: string, headers: WebhookHeaders, key: string) {
  return new Webhook(key).verify(body, headers) as DodoWebhookEvent;
}
