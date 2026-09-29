import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** The baton: a small orange capsule. Decorative. */
export function BatonPill({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("inline-block h-2 w-6 rounded-full bg-signal", className)} />
  );
}

/** Decorative lane lines that fade out toward the text. Put inside a `relative overflow-hidden` parent. */
export function Lanes({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 bg-lanes [mask-image:linear-gradient(to_left,black,transparent_65%)]",
        className,
      )}
    />
  );
}

/** Mono micro-label used for section indices and captions. */
export function MicroLabel({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("font-mono text-xs tracking-widest text-muted-foreground uppercase", className)}
      {...props}
    />
  );
}

/** The h1 block of every maker-app page: lane label, title, description, actions. */
export function PageHead({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header
      className={cn(
        "flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between",
        className,
      )}
    >
      <div className="grid min-w-0 gap-2">
        <MicroLabel className="flex items-center gap-2">
          <BatonPill />
          {eyebrow}
        </MicroLabel>
        <h1
          className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl"
          style={{ fontStretch: "92%" }}
        >
          {title}
        </h1>
        {description && (
          <p className="max-w-prose text-sm text-pretty text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

/** A numbered section inside a page: "01 / 04" index, title, optional description and actions. */
export function LaneSection({
  index,
  total,
  title,
  description,
  actions,
  id,
  children,
  className,
}: {
  index: number;
  total?: number;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className={cn("scroll-mt-20", className)}>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b pb-3">
        <div className="grid gap-1">
          <MicroLabel>
            {String(index).padStart(2, "0")}
            {total ? ` / ${String(total).padStart(2, "0")}` : ""}
          </MicroLabel>
          <h2 id={headingId} className="font-display text-xl font-semibold tracking-tight">
            {title}
          </h2>
        </div>
        {actions}
      </div>
      {description && (
        <p className="mt-3 max-w-prose text-sm text-pretty text-muted-foreground">{description}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}
