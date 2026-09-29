import { NextResponse, type NextRequest } from "next/server";

import { redeemClick } from "@/lib/baton/engine";
import { clientIp } from "@/lib/baton/rules";

export const dynamic = "force-dynamic";

const HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

/** The signed click redirect. Whatever goes wrong, the visitor lands somewhere sensible, never on a 500. */
export async function GET(request: NextRequest, context: { params: Promise<{ token: string }> }) {
  const home = new URL("/", request.nextUrl.origin);
  try {
    const { token } = await context.params;
    const destination = await redeemClick({
      token,
      ip: clientIp(request.headers),
      userAgent: request.headers.get("user-agent") ?? "",
    });
    const target = destination ? new URL(destination, request.nextUrl.origin) : home;
    return NextResponse.redirect(target, { status: 302, headers: HEADERS });
  } catch (error) {
    console.error("[baton] redirect", error);
    return NextResponse.redirect(home, { status: 302, headers: HEADERS });
  }
}
