"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

type Tool = {
  id: string;
  name: string;
  category: string;
  siteKey: string;
  credits: number;
  inputs: string[];
  outputs: string[];
};

type BatonGlobal = { pass(opts?: { ctx?: string; target?: Element | string }): Promise<boolean> };

const selectClass =
  "border-input bg-background focus-visible:ring-ring h-9 rounded-md border px-2 text-sm focus-visible:ring-2 focus-visible:outline-none";

/** Loads the real /embed.js with a tool's key, exactly as a host site would, then calls baton.pass(). */
export function Playground({ tools }: { tools: Tool[] }) {
  const [position, setPosition] = useState<"toast" | "inline">("toast");
  const [theme, setTheme] = useState<"auto" | "light" | "dark">("auto");
  const [ctx, setCtx] = useState("");
  const [status, setStatus] = useState("");

  function run(tool: Tool) {
    document
      .querySelectorAll("baton-card, script[data-baton-playground]")
      .forEach((n) => n.remove());
    Reflect.deleteProperty(window, "baton");

    const script = document.createElement("script");
    script.src = "/embed.js";
    script.dataset.key = tool.siteKey;
    script.dataset.theme = theme;
    script.dataset.position = position;
    script.dataset.batonPlayground = "";
    script.onload = async () => {
      const baton = (window as unknown as { baton?: BatonGlobal }).baton;
      const shown = await baton?.pass({
        ctx: ctx.trim() || undefined,
        target: position === "inline" ? "#baton-slot" : undefined,
      });
      setStatus(
        shown
          ? `Card shown for ${tool.name}.`
          : `No card for ${tool.name} (204: nothing matches, or an error).`,
      );
    };
    script.onerror = () => setStatus("Could not load /embed.js.");
    document.body.appendChild(script);
    setStatus(`Loading embed for ${tool.name}…`);
  }

  return (
    <section aria-labelledby="pg-h" className="mt-10">
      <h2 id="pg-h" className="text-heading">
        Success moments
      </h2>
      <p className="mt-2 max-w-prose text-sm text-muted-foreground">
        Each button loads <code className="font-mono">/embed.js</code> with that tool&apos;s site
        key and calls <code className="font-mono">baton.pass()</code>.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <label className="grid gap-1 text-sm">
          <span className="text-eyebrow text-muted-foreground">Position</span>
          <select
            className={selectClass}
            value={position}
            onChange={(e) => setPosition(e.target.value as "toast" | "inline")}
          >
            <option value="toast">toast</option>
            <option value="inline">inline</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-eyebrow text-muted-foreground">Theme</span>
          <select
            className={selectClass}
            value={theme}
            onChange={(e) => setTheme(e.target.value as "auto" | "light" | "dark")}
          >
            <option value="auto">auto</option>
            <option value="light">light</option>
            <option value="dark">dark</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          <span className="text-eyebrow text-muted-foreground">ctx (optional, e.g. pdf)</span>
          <input
            className={`${selectClass} w-40 font-mono`}
            value={ctx}
            onChange={(e) => setCtx(e.target.value)}
            placeholder="pdf"
          />
        </label>
      </div>

      <p role="status" className="mt-3 min-h-5 font-mono text-xs text-muted-foreground">
        {status}
      </p>
      <div id="baton-slot" className="mt-2 min-h-4" />

      <div className="mt-4 overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[42rem] text-left text-sm">
          <thead className="bg-muted text-eyebrow text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">Tool</th>
              <th className="px-3 py-2 font-medium">Site key</th>
              <th className="px-3 py-2 text-right font-medium">Credits</th>
              <th className="px-3 py-2 font-medium">Outputs → inputs</th>
              <th className="px-3 py-2">
                <span className="sr-only">Action</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tools.map((tool) => (
              <tr key={tool.id}>
                <td className="px-3 py-2">
                  <span className="font-medium">{tool.name}</span>
                  <span className="block font-mono text-xs text-muted-foreground">
                    {tool.category}
                  </span>
                </td>
                <td className="px-3 py-2 font-mono text-xs">{tool.siteKey}</td>
                <td className="px-3 py-2 text-right font-mono">{tool.credits}</td>
                <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                  {tool.outputs.join(", ")} → {tool.inputs.join(", ") || "none"}
                </td>
                <td className="px-3 py-2 text-right">
                  <Button size="sm" variant="outline" onClick={() => run(tool)}>
                    Pass from here
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
