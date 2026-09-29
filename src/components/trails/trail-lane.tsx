import { cn } from "@/lib/utils";

type TrailLaneProps = {
  /** Number of steps; one dot each. */
  steps: number;
  className?: string;
};

/**
 * A trail drawn as one running lane: the baton at the start line, a dot per step,
 * and the last dot filled as the finish. Decorative; the steps are listed in text.
 */
export function TrailLane({ steps, className }: TrailLaneProps) {
  return (
    <div aria-hidden className={cn("flex items-center", className)}>
      <span className="h-2.5 w-7 shrink-0 rounded-full bg-signal" />
      {Array.from({ length: steps }, (_, index) => {
        const last = index === steps - 1;
        return (
          <span key={index} className="flex min-w-0 flex-1 items-center">
            <span className="h-0.5 min-w-3 flex-1 bg-foreground" />
            <span
              className={cn(
                "shrink-0 rounded-full border-2 transition-transform duration-[var(--motion-base)] group-hover/lane:scale-110",
                last
                  ? "size-5 border-foreground bg-signal"
                  : "size-3.5 border-foreground bg-background",
              )}
            />
          </span>
        );
      })}
    </div>
  );
}
