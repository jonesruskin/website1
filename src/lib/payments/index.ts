import "server-only";

import { paymentsEnv } from "@/env/payments";

import { dodoProvider } from "./dodo";
import { mockProvider } from "./mock";
import { stripeProvider } from "./stripe";
import type { PaymentProvider } from "./types";

/** True when no provider keys are configured and the local mock is in use. */
export const isMockPayments = !paymentsEnv.DODO_PAYMENTS_API_KEY && !paymentsEnv.STRIPE_SECRET_KEY;

/**
 * The active payment provider: Dodo Payments (merchant of record, works for
 * businesses in India) when its key is set, else Stripe, else the local mock.
 */
export const payments: PaymentProvider = paymentsEnv.DODO_PAYMENTS_API_KEY
  ? dodoProvider
  : paymentsEnv.STRIPE_SECRET_KEY
    ? stripeProvider
    : mockProvider;

export type * from "./types";
