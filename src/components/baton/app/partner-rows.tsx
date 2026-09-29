import type { ReactNode } from "react";

import { Badge } from "@/components/ui/badge";
import { hostOf } from "@/lib/baton/format";
import { artifactLabel, categoryLabel } from "@/lib/baton/taxonomy";
import { cn } from "@/lib/utils";

export type PartnerRow = {
  id: string;
  name: string;
  url?: string;
  category: string;
  via: string[];
  handshake?: boolean;
};

/** The artifacts that connect two tools, as small mono chips. */
export function ViaChips({ via, className }: { via: string[]; className?: string }) {
  return (
    <ul aria-label="Connected through" className={cn("flex flex-wrap gap-1", className)}>
      {via.map((id) => (
        <li
          key={id}
          className="rounded-full border bg-muted px-2 py-0.5 font-mono text-[0.6875rem] tracking-wide text-foreground"
        >
          {artifactLabel(id)}
        </li>
      ))}
    </ul>
  );
}

/**
 * Suggested partners as numbered lanes. Purely presentational: it renders the
 * same in the tool studio (live, in the browser) and on the network page.
 */
export function PartnerRows({
  rows,
  empty,
  actions,
  className,
}: {
  rows: PartnerRow[];
  empty: ReactNode;
  actions?: (row: PartnerRow) => ReactNode;
  className?: string;
}) {
  if (rows.length === 0) {
    return (
      <p
        className={cn(
          "rounded-lg border border-dashed p-4 text-sm text-muted-foreground",
          className,
        )}
      >
        {empty}
      </p>
    );
  }
  return (
    <ol className={cn("divide-y rounded-lg border", className)}>
      {rows.map((row, index) => (
        <li key={row.id} className="grid gap-2 p-3 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:gap-3">
          <span className="hidden pt-0.5 font-mono text-xs text-muted-foreground sm:block">
            {String(index + 1).padStart(2, "0")}
          </span>
          <div className="grid min-w-0 gap-1.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className="truncate text-sm font-medium">{row.name}</p>
              {row.handshake && <Badge variant="outline">Handshake</Badge>}
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {categoryLabel(row.category)}
              {row.url ? ` · ${hostOf(row.url)}` : ""}
            </p>
            <ViaChips via={row.via} />
          </div>
          {actions && (
            <div className="flex flex-wrap items-start gap-2 sm:justify-end">{actions(row)}</div>
          )}
        </li>
      ))}
    </ol>
  );
}
