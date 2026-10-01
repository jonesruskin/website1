import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

/** Environment variables every site uses. Module fragments live next to this file. */
export const coreEnv = createEnv({
  shared: {
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },
  server: {
    VERCEL_PROJECT_PRODUCTION_URL: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_SITE_URL: z.url().optional(),
    /** "1" in static preview builds (GitHub Pages): shows a banner, server features are off. */
    NEXT_PUBLIC_STATIC_PREVIEW: z.enum(["1"]).optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_PROJECT_PRODUCTION_URL: process.env.VERCEL_PROJECT_PRODUCTION_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_STATIC_PREVIEW: process.env.NEXT_PUBLIC_STATIC_PREVIEW,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
