import "server-only";

import { ApiError, type Principal } from "@/lib/api/route";
import { hasPlan } from "@/lib/billing/entitlements";

/** Plan ids that include the Studio features (stats API by key, CSV export). */
export const STUDIO_PLAN_IDS = ["enterprise"] as const;

/** Stats API access with an API key and CSV export of the ledger are Studio features. */
export function hasStudio(userId: string) {
  return hasPlan(userId, ...STUDIO_PLAN_IDS);
}

/** API keys reach Baton data on the Studio plan; first-party browser sessions always can. */
export async function requireStudioForKeys(principal: Principal) {
  if (principal.type === "key" && !(await hasStudio(principal.userId))) {
    throw new ApiError(403, "API access to Baton data is part of the Studio plan. See /pricing.");
  }
}
