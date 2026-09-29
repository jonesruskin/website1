import { apiRoute } from "@/lib/api/route";
import { listTools } from "@/lib/baton/queries";

/** GET /api/v1/tools: the key owner's tools with their credit balances. */
export const GET = apiRoute({ scope: "read" }, async ({ principal }) => {
  const tools = await listTools(principal.userId);
  return {
    data: tools.map((tool) => ({
      id: tool.id,
      name: tool.name,
      slug: tool.slug,
      url: tool.url,
      category: tool.category,
      inputs: tool.inputs,
      outputs: tool.outputs,
      status: tool.status,
      credits: tool.credits,
      siteKey: tool.siteKey,
      live: Boolean(tool.installedAt),
      installedAt: tool.installedAt,
      createdAt: tool.createdAt,
    })),
  };
});
