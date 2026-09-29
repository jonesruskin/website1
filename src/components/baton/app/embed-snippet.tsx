import { CopyButton } from "@/components/ui/copy-button";

import { MicroLabel } from "./page-head";

function CodeBlock({ label, code, copyLabel }: { label: string; code: string; copyLabel: string }) {
  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <MicroLabel>{label}</MicroLabel>
        <CopyButton value={code} label={copyLabel} size="sm" />
      </div>
      <pre
        tabIndex={0}
        className="overflow-x-auto rounded-lg border bg-muted p-4 font-mono text-xs leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

/** The two things a maker pastes: the script tag, and the pass() call. */
export function EmbedSnippet({
  siteUrl,
  siteKey,
  ctx,
}: {
  siteUrl: string;
  /** Undefined before the tool exists: a placeholder is shown instead. */
  siteKey?: string;
  /** The artifact this moment produces, e.g. "pdf". */
  ctx: string;
}) {
  const script = `<script src="${siteUrl}/embed.js" data-key="${siteKey ?? "bk_…"}" async></script>`;
  const pass = `// The moment your tool has done its job:\nbaton.pass({ ctx: "${ctx}" });`;
  return (
    <div className="grid gap-5">
      <CodeBlock label="1 · Paste before </body>" code={script} copyLabel="Copy tag" />
      <CodeBlock label="2 · Call at the success moment" code={pass} copyLabel="Copy code" />
      <p className="text-sm text-pretty text-muted-foreground">
        Optional attributes on the tag: <code className="font-mono text-xs">data-ctx</code> (default
        output), <code className="font-mono text-xs">data-theme</code> (auto, light, dark) and{" "}
        <code className="font-mono text-xs">data-position</code> (inline or toast).
        {!siteKey && " Your real key appears here as soon as you save the tool."}
      </p>
    </div>
  );
}
