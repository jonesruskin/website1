import "server-only";

import DodoPayments from "dodopayments";

import { paymentsEnv } from "@/env/payments";

import {
  mapEvent,
  parseProducts,
  productFor,
  verifyWebhook,
  webhookHeaders,
  type ProductMap,
} from "./dodo-map";
import type { Checkout, PaymentProvider } from "./types";

let client: DodoPayments | null = null;
function dodo() {
  client ??= new DodoPayments({
    bearerToken: paymentsEnv.DODO_PAYMENTS_API_KEY!,
    environment: paymentsEnv.DODO_PAYMENTS_ENVIRONMENT ?? "test_mode",
    maxRetries: 2,
  });
  return client;
}

let products: ProductMap | null = null;
function productMap() {
  products ??= parseProducts(paymentsEnv.DODO_PRODUCTS);
  return products;
}

/**
 * Dodo Payments as merchant of record. Subscriptions sell products created in
 * the Dodo dashboard; DODO_PRODUCTS maps billing's price keys to their ids.
 */
export const dodoProvider: PaymentProvider = {
  id: "dodo",

  async createCustomer({ email, name, metadata }) {
    const customer = await dodo().customers.create({
      email,
      name: name || email,
      ...(metadata && { metadata }),
    });
    return { id: customer.customer_id };
  },

  async createCheckout(input) {
    if (input.inlinePrice) {
      throw new Error("Dodo sells dashboard products only: pass `price`, not `inlinePrice`.");
    }
    if (!input.price) throw new Error("createCheckout needs `price`.");
    const session = await dodo().checkoutSessions.create({
      product_cart: [
        { product_id: productFor(productMap(), input.price), quantity: input.quantity ?? 1 },
      ],
      customer: input.customerId
        ? { customer_id: input.customerId }
        : input.customerEmail
          ? { email: input.customerEmail }
          : null,
      return_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: input.metadata ?? null,
      ...(input.mode === "subscription" &&
        input.trialDays && { subscription_data: { trial_period_days: input.trialDays } }),
    });
    if (!session.checkout_url) throw new Error("Dodo did not return a checkout URL.");
    return { id: session.session_id, url: session.checkout_url };
  },

  async createPortal({ customerId, returnUrl }) {
    const session = await dodo().customers.customerPortal.create(customerId, {
      return_url: returnUrl,
    });
    return { url: session.link };
  },

  async getCheckout(id) {
    try {
      const session = await dodo().checkoutSessions.retrieve(id);
      const paid = session.payment_status === "succeeded";
      return {
        id: session.id,
        status: paid ? "complete" : "open",
        paid,
        mode: "subscription",
        customerEmail: session.customer_email ?? undefined,
        metadata: {},
      } satisfies Checkout;
    } catch {
      return null;
    }
  },

  async parseWebhook(request) {
    const key = paymentsEnv.DODO_PAYMENTS_WEBHOOK_KEY;
    if (!key) throw new Error("DODO_PAYMENTS_WEBHOOK_KEY is not set.");
    const headers = webhookHeaders(request.headers);
    const event = verifyWebhook(await request.text(), headers, key);
    return mapEvent(headers["webhook-id"], event, productMap());
  },
};
