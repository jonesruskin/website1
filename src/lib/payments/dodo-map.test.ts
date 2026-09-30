import { Webhook } from "standardwebhooks";
import { describe, expect, it } from "vitest";

import {
  keyForProduct,
  mapEvent,
  parseProducts,
  productFor,
  toStatus,
  toSubscription,
  verifyWebhook,
  webhookHeaders,
  type DodoSubscription,
} from "./dodo-map";

const products = parseProducts("pro_monthly=pdt_pm, pro_yearly=pdt_py\nenterprise_monthly=pdt_em,,bad");

const sub = (over: Partial<DodoSubscription> = {}): DodoSubscription => ({
  subscription_id: "sub_1",
  status: "active",
  product_id: "pdt_pm",
  customer: { customer_id: "cus_1" },
  next_billing_date: "2026-11-01T00:00:00Z",
  cancel_at_next_billing_date: false,
  created_at: "2026-01-01T00:00:00Z",
  trial_period_days: 0,
  payment_frequency_interval: "Month",
  metadata: { userId: "u1", planId: "pro" },
  ...over,
});

describe("products", () => {
  it("parses comma and newline lists and skips junk", () => {
    expect([...products.entries()]).toEqual([
      ["pro_monthly", "pdt_pm"],
      ["pro_yearly", "pdt_py"],
      ["enterprise_monthly", "pdt_em"],
    ]);
  });
  it("maps keys both ways and passes raw ids through", () => {
    expect(productFor(products, "pro_yearly")).toBe("pdt_py");
    expect(productFor(products, "pdt_raw")).toBe("pdt_raw");
    expect(keyForProduct(products, "pdt_em")).toBe("enterprise_monthly");
    expect(keyForProduct(products, "pdt_unknown")).toBe("pdt_unknown");
  });
  it("explains a missing product", () => {
    expect(() => productFor(products, "enterprise_yearly")).toThrow(/DODO_PRODUCTS/);
  });
});

describe("subscriptions", () => {
  it("normalizes statuses, keeping access while a renewal retries", () => {
    expect(toStatus("active")).toBe("active");
    expect(toStatus("on_hold")).toBe("past_due");
    expect(toStatus("cancelled")).toBe("canceled");
    expect(toStatus("expired")).toBe("canceled");
    expect(toStatus("something_new")).toBe("incomplete");
  });
  it("maps a Dodo subscription onto billing's shape", () => {
    expect(toSubscription(sub(), products)).toEqual({
      id: "sub_1",
      customerId: "cus_1",
      status: "active",
      price: "pro_monthly",
      interval: "month",
      currentPeriodEnd: new Date("2026-11-01T00:00:00Z"),
      cancelAtPeriodEnd: false,
      trialEnd: null,
      metadata: { userId: "u1", planId: "pro" },
    });
  });
  it("reports trials and yearly intervals", () => {
    const now = new Date().toISOString();
    const s = toSubscription(
      sub({ created_at: now, trial_period_days: 14, payment_frequency_interval: "Year", product_id: "pdt_py" }),
      products,
    );
    expect(s.status).toBe("trialing");
    expect(s.interval).toBe("year");
    expect(s.price).toBe("pro_yearly");
    expect(s.trialEnd).toBeInstanceOf(Date);
  });
});

describe("events", () => {
  it("maps subscription lifecycle events", () => {
    expect(mapEvent("e1", { type: "subscription.active", data: sub() }, products)?.type).toBe(
      "subscription.updated",
    );
    expect(mapEvent("e2", { type: "subscription.on_hold", data: sub({ status: "on_hold" }) }, products)).toMatchObject({
      type: "subscription.updated",
      subscription: { status: "past_due" },
    });
    expect(mapEvent("e3", { type: "subscription.cancelled", data: sub({ status: "cancelled" }) }, products)?.type).toBe(
      "subscription.deleted",
    );
  });
  it("links the customer on a successful subscription payment", () => {
    const event = mapEvent(
      "e4",
      {
        type: "payment.succeeded",
        data: { payment_id: "pay_1", customer: { customer_id: "cus_1", email: "a@b.co" }, subscription_id: "sub_1", total_amount: 1200, currency: "USD", metadata: { userId: "u1" } },
      },
      products,
    );
    expect(event).toMatchObject({
      type: "checkout.completed",
      id: "e4",
      checkout: { mode: "subscription", customerId: "cus_1", metadata: { userId: "u1" }, currency: "usd" },
    });
  });
  it("turns a failed payment into a dunning email trigger", () => {
    expect(
      mapEvent("e5", { type: "payment.failed", data: { payment_id: "p", customer: { customer_id: "cus_1" }, subscription_id: "sub_1" } }, products),
    ).toEqual({ type: "invoice.payment_failed", id: "e5", customerId: "cus_1", subscriptionId: "sub_1" });
  });
  it("ignores events billing doesn't need", () => {
    expect(mapEvent("e6", { type: "payout.success", data: {} }, products)).toBeNull();
  });
});

describe("webhook signatures", () => {
  const secret = `whsec_${Buffer.from("a-test-signing-secret-32-bytes!!").toString("base64")}`;
  const body = JSON.stringify({ type: "subscription.active", data: sub() });
  const sign = (payload: string, at = new Date()) => {
    const id = "msg_1";
    return new Headers({
      "webhook-id": id,
      "webhook-timestamp": String(Math.floor(at.getTime() / 1000)),
      "webhook-signature": new Webhook(secret).sign(id, at, payload),
    });
  };

  it("accepts a correctly signed delivery", () => {
    const event = verifyWebhook(body, webhookHeaders(sign(body)), secret);
    expect(event.type).toBe("subscription.active");
  });
  it("rejects a tampered body, a wrong key and a stale timestamp", () => {
    const headers = webhookHeaders(sign(body));
    expect(() => verifyWebhook(body.replace("active", "cancelled"), headers, secret)).toThrow();
    const other = `whsec_${Buffer.from("another-secret-another-secret-!!").toString("base64")}`;
    expect(() => verifyWebhook(body, headers, other)).toThrow();
    const stale = webhookHeaders(sign(body, new Date(Date.now() - 60 * 60 * 1000)));
    expect(() => verifyWebhook(body, stale, secret)).toThrow();
  });
  it("requires every signature header", () => {
    expect(() => webhookHeaders(new Headers({ "webhook-id": "x" }))).toThrow(/webhook-timestamp/);
  });
});
