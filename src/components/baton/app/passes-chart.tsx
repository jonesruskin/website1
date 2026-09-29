import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNumber, shortDate } from "@/lib/baton/format";
import type { DailyPoint } from "@/lib/baton/queries";
import { cn } from "@/lib/utils";

/** Rounds up to a tidy axis maximum: 4, 5, 10, 20, 50 … */
function niceMax(value: number) {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  for (const step of [1, 2, 5, 10]) {
    if (value <= step * magnitude) return step * magnitude;
  }
  return 10 * magnitude;
}

const SLOT = 100;
const HEIGHT = 200;

/**
 * Passes sent vs received per day: paired bars in one inline SVG. The SVG holds
 * only shapes (it stretches to any width without distorting text); the axis
 * labels are HTML. Every bar has a <title>, the chart has a name and
 * description, and a table with the same numbers sits behind a disclosure.
 */
export function PassesChart({
  series,
  id,
  className,
}: {
  series: DailyPoint[];
  id: string;
  className?: string;
}) {
  const peak = Math.max(0, ...series.flatMap((p) => [p.sent, p.received]));
  const top = niceMax(peak);
  const totalSent = series.reduce((sum, p) => sum + p.sent, 0);
  const totalReceived = series.reduce((sum, p) => sum + p.received, 0);
  const y = (value: number) => HEIGHT - (value / top) * HEIGHT;
  const barHeight = (value: number) => (value === 0 ? 0 : Math.max(3, (value / top) * HEIGHT));
  const first = series[0];
  const last = series[series.length - 1];
  const middle = series[Math.floor(series.length / 2)];
  const titleId = `${id}-title`;
  const descId = `${id}-desc`;

  return (
    <figure className={cn("grid gap-4", className)}>
      <div className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-2">
        <div
          aria-hidden
          className="flex h-44 flex-col justify-between text-right font-mono text-[0.6875rem] leading-none text-muted-foreground tabular-nums sm:h-52"
        >
          <span>{top}</span>
          <span>{top / 2}</span>
          <span>0</span>
        </div>
        <svg
          role="img"
          aria-labelledby={`${titleId} ${descId}`}
          viewBox={`0 0 ${SLOT * series.length} ${HEIGHT}`}
          preserveAspectRatio="none"
          className="h-44 w-full overflow-visible sm:h-52"
        >
          <title
            id={titleId}
          >{`Passes sent and visitors received per day, ${first ? shortDate(first.date) : ""} to ${last ? shortDate(last.date) : ""}`}</title>
          <desc
            id={descId}
          >{`${formatNumber(totalSent)} passes sent and ${formatNumber(totalReceived)} visitors received in ${series.length} days. Highest single day: ${formatNumber(peak)}.`}</desc>
          {[0, 0.5, 1].map((fraction) => (
            <line
              key={fraction}
              x1={0}
              x2={SLOT * series.length}
              y1={HEIGHT * fraction}
              y2={HEIGHT * fraction}
              className={fraction === 1 ? "stroke-foreground/40" : "stroke-border"}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
              strokeDasharray={fraction === 1 ? undefined : "2 4"}
            />
          ))}
          {series.map((point, i) => (
            <g key={point.date}>
              <rect
                x={i * SLOT + 14}
                y={y(point.sent)}
                width={34}
                height={barHeight(point.sent)}
                className="fill-signal"
              >
                <title>{`${shortDate(point.date)}: ${point.sent} ${point.sent === 1 ? "pass" : "passes"} sent`}</title>
              </rect>
              <rect
                x={i * SLOT + 52}
                y={y(point.received)}
                width={34}
                height={barHeight(point.received)}
                className="fill-foreground/70"
              >
                <title>{`${shortDate(point.date)}: ${point.received} ${point.received === 1 ? "visitor" : "visitors"} received`}</title>
              </rect>
            </g>
          ))}
        </svg>
        <span />
        <div
          aria-hidden
          className="mt-2 flex justify-between font-mono text-[0.6875rem] text-muted-foreground"
        >
          <span>{first && shortDate(first.date)}</span>
          {series.length > 6 && (
            <span className="hidden sm:inline">{middle && shortDate(middle.date)}</span>
          )}
          <span>{last && shortDate(last.date)}</span>
        </div>
      </div>

      <figcaption className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-3 w-3 rounded-[2px] bg-signal" />
          Passes sent
          <span className="font-mono text-xs text-muted-foreground">
            {formatNumber(totalSent)} · +1 each
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-3 w-3 rounded-[2px] bg-foreground/70" />
          Visitors received
          <span className="font-mono text-xs text-muted-foreground">
            {formatNumber(totalReceived)} · −1 each
          </span>
        </span>
      </figcaption>

      <details className="group">
        <summary className="w-fit cursor-pointer rounded-sm text-sm text-muted-foreground underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
          View as a table
        </summary>
        <div className="mt-3 max-h-72 overflow-y-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Day</TableHead>
                <TableHead scope="col" className="text-right">
                  Sent
                </TableHead>
                <TableHead scope="col" className="text-right">
                  Received
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...series].reverse().map((point) => (
                <TableRow key={point.date}>
                  <TableCell>{shortDate(point.date)}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">{point.sent}</TableCell>
                  <TableCell className="text-right font-mono tabular-nums">
                    {point.received}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </details>
    </figure>
  );
}

/** A 7-day two-line sparkline for the dashboard. Shapes only; the numbers sit beside it. */
export function PassesSparkline({ series, label }: { series: DailyPoint[]; label: string }) {
  const peak = Math.max(1, ...series.flatMap((p) => [p.sent, p.received]));
  const W = 140;
  const H = 44;
  const step = series.length > 1 ? W / (series.length - 1) : W;
  const points = (pick: (p: DailyPoint) => number) =>
    series
      .map((p, i) => `${(i * step).toFixed(1)},${(H - 3 - (pick(p) / peak) * (H - 8)).toFixed(1)}`)
      .join(" ");
  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      className="h-11 w-full overflow-visible"
    >
      <line
        x1={0}
        x2={W}
        y1={H - 3}
        y2={H - 3}
        className="stroke-border"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      />
      <polyline
        points={points((p) => p.received)}
        fill="none"
        className="stroke-foreground/50"
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <polyline
        points={points((p) => p.sent)}
        fill="none"
        className="stroke-signal"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
