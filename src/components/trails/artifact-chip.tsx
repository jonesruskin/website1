import { artifactLabel } from "@/lib/baton/taxonomy";
import { cn } from "@/lib/utils";

type ArtifactChipProps = {
  id: string;
  /** "in" is what you bring; "out" is what you leave with (filled with the signal). */
  kind?: "in" | "out" | "plain";
  className?: string;
};

/** A journey artifact from the shared taxonomy, drawn as a small mono capsule. */
export function ArtifactChip({ id, kind = "plain", className }: ArtifactChipProps) {
  return (
    <span
      data-artifact={id}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 font-mono text-[0.6875rem] leading-none font-medium tracking-widest whitespace-nowrap uppercase",
        kind === "out"
          ? "border-transparent bg-signal text-signal-foreground"
          : "border-foreground/40 bg-card text-foreground",
        className,
      )}
    >
      {artifactLabel(id)}
    </span>
  );
}
