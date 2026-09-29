import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/** Active / paused, as a pill with a dot. */
export function StatusPill({ status, className }: { status: string; className?: string }) {
  const paused = status === "paused";
  return (
    <Badge
      variant={paused ? "warning" : "success"}
      className={cn("rounded-full px-2.5", className)}
    >
      <span
        aria-hidden
        className={cn("size-1.5 rounded-full", paused ? "bg-warning" : "bg-success")}
      />
      {paused ? "Paused" : "Active"}
    </Badge>
  );
}

/** Whether the embed has rendered on the maker's site yet. */
export function InstallStatus({
  installedAt,
  className,
}: {
  installedAt: Date | string | null;
  className?: string;
}) {
  if (installedAt) {
    const since = new Date(installedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
    return (
      <span className={cn("inline-flex items-center gap-2 text-sm", className)}>
        <span aria-hidden className="size-2 rounded-full bg-success" />
        <span className="font-medium">Live</span>
        <span className="text-xs text-muted-foreground">since {since}</span>
      </span>
    );
  }
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm", className)}>
      <span aria-hidden className="size-2 animate-signal-pulse rounded-full bg-signal" />
      <span>Waiting for first pass</span>
    </span>
  );
}
