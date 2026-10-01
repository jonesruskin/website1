import { coreEnv } from "@/env/core";

/**
 * Shown only in static preview builds (GitHub Pages). Those builds have no
 * server, so sign-up, the dashboard and forms are switched off; say so up front.
 */
export function PreviewBanner() {
  if (coreEnv.NEXT_PUBLIC_STATIC_PREVIEW !== "1") return null;
  return (
    <aside
      aria-label="Preview notice"
      className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 print:hidden"
    >
      <p className="tone-inverted flex max-w-full items-center gap-2.5 rounded-full border bg-background px-4 py-2 text-xs text-foreground shadow-lg">
        <span aria-hidden className="h-2 w-5 shrink-0 rounded-full bg-signal" />
        <span>
          <strong className="font-semibold">Static preview.</strong> Sign-up, the dashboard and
          forms need the full deploy.
        </span>
      </p>
    </aside>
  );
}
