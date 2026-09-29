import { randomUUID } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { pickCard, UnknownSiteKeyError } from "@/lib/baton/engine";
import { clientIp } from "@/lib/baton/rules";
import { rateLimit, rateLimitHeaders } from "@/lib/rate-limit";
import { absoluteUrl } from "@/lib/url";

export const dynamic = "force-dynamic";

/** Public, cross-origin, credential-free: any host site may call it from the browser. */
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
  "Cache-Control": "no-store",
} as const;

const query = z.object({
  key: z.string().regex(/^bk_[A-Za-z0-9_-]{8,64}$/),
  ctx: z.string().trim().max(64).optional(),
});

function respond(status: number, body?: unknown, extra: Record<string, string> = {}) {
  const headers = { ...CORS, ...extra };
  if (body === undefined) return new NextResponse(null, { status, headers });
  return NextResponse.json(body, { status, headers });
}

export function OPTIONS() {
  return respond(204);
}

export async function GET(request: NextRequest) {
  try {
    const parsed = query.safeParse(Object.fromEntries(request.nextUrl.searchParams));
    if (!parsed.success) return respond(400, { error: "Invalid key or ctx." });

    const ip = clientIp(request.headers);
    const limit = await rateLimit(`baton-card:${ip}`, { limit: 60, window: "1 m" });
    if (!limit.success) {
      return respond(429, { error: "Too many requests." }, rateLimitHeaders(limit));
    }

    const picked = await pickCard({
      siteKey: parsed.data.key,
      ctx: parsed.data.ctx,
      ip,
      userAgent: request.headers.get("user-agent") ?? "",
      requestId: randomUUID(),
    });
    if (!picked) return respond(204);

    // Production links use the canonical site URL. In development it usually isn't the
    // origin being served, so links follow the request and the whole loop works locally.
    const link = (path: string) =>
      process.env.NODE_ENV === "production"
        ? absoluteUrl(path)
        : `${request.nextUrl.origin}${path}`;

    return respond(200, {
      card: { ...picked.card, href: link(`/r/${picked.token}`) },
      badge: picked.badge,
      poweredBy: link("/makers?ref=card"),
    });
  } catch (error) {
    if (error instanceof UnknownSiteKeyError) return respond(404, { error: "Unknown site key." });
    console.error("[baton] card", error);
    return respond(500, { error: "Something went wrong." });
  }
}
