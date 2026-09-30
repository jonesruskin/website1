import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const isProduction = process.env.NODE_ENV === "production";
/** Dodo Payments (merchant of record) is used when its key is set; Stripe is then optional. */
const usesDodo = Boolean(process.env.DODO_PAYMENTS_API_KEY);
const stripeRequired = isProduction && !usesDodo;

export const paymentsEnv = createEnv({
  server: {
    STRIPE_SECRET_KEY: stripeRequired ? z.string().startsWith("sk_") : z.string().optional(),
    STRIPE_WEBHOOK_SECRET: stripeRequired
      ? z.string().startsWith("whsec_")
      : z.string().optional(),
    DODO_PAYMENTS_API_KEY: z.string().optional(),
    DODO_PAYMENTS_WEBHOOK_KEY:
      isProduction && usesDodo ? z.string().min(1) : z.string().optional(),
    DODO_PAYMENTS_ENVIRONMENT: z.enum(["test_mode", "live_mode"]).default("test_mode"),
    /** Plan price keys to Dodo product ids: "pro_monthly=pdt_…,pro_yearly=pdt_…". */
    DODO_PRODUCTS: isProduction && usesDodo ? z.string().min(1) : z.string().optional(),
  },
  runtimeEnv: {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    DODO_PAYMENTS_API_KEY: process.env.DODO_PAYMENTS_API_KEY,
    DODO_PAYMENTS_WEBHOOK_KEY: process.env.DODO_PAYMENTS_WEBHOOK_KEY,
    DODO_PAYMENTS_ENVIRONMENT: process.env.DODO_PAYMENTS_ENVIRONMENT,
    DODO_PRODUCTS: process.env.DODO_PRODUCTS,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
