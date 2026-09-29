import { z } from "zod";

import { apiRoute } from "@/lib/api/route";
import { requireStudioForKeys } from "@/lib/baton/plan-features";
import { getOverview } from "@/lib/baton/queries";

/**
 * GET /api/v1/stats?days=7: credits, passes sent and received, cards shown, and a
 * daily series across all of the key owner's tools. `days` is clamped by the plan.
 */
export const GET = apiRoute(
  { scope: "read", query: z.object({ days: z.coerce.number().int().min(1).max(365).default(7) }) },
  async ({ principal, query }) => {
    await requireStudioForKeys(principal);
    return { data: await getOverview(principal.userId, query.days) };
  },
);
