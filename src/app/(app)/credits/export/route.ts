import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth/session";
import { hasStudio } from "@/lib/baton/plan-features";
import { getLedger } from "@/lib/baton/queries";

const MAX_ROWS = 10_000;
const PAGE = 100;

/** Quotes a CSV field and neutralises spreadsheet formulas (=, +, -, @ at the start). */
function field(value: string | number) {
  const text = String(value);
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

/** GET /credits/export: the signed-in user's full credit ledger as CSV (Studio plan). */
export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.redirect(new URL("/sign-in?next=/credits", request.url));
  }
  if (!(await hasStudio(session.user.id))) {
    return NextResponse.redirect(new URL("/pricing", request.url));
  }

  const lines = [["date", "tool", "reason", "delta", "click_id"].map(field).join(",")];
  for (let offset = 0; offset < MAX_ROWS; offset += PAGE) {
    const { rows } = await getLedger(session.user.id, { limit: PAGE, offset });
    for (const row of rows) {
      lines.push(
        [row.createdAt.toISOString(), row.toolName, row.reason, row.delta, row.clickId ?? ""]
          .map(field)
          .join(","),
      );
    }
    if (rows.length < PAGE) break;
  }

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(`${lines.join("\n")}\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="baton-ledger-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
