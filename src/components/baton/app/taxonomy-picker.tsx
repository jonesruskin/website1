"use client";

import { CheckIcon } from "lucide-react";
import { useId, useState, type ReactNode } from "react";

import { artifactGroups, artifactLabel, artifacts } from "@/lib/baton/taxonomy";
import { cn } from "@/lib/utils";

type TaxonomyPickerProps = {
  /** Form field name: every checked chip posts `name=<artifact id>`. */
  name: "inputs" | "outputs";
  legend: ReactNode;
  description: ReactNode;
  value: string[];
  onChange: (next: string[]) => void;
  max?: number;
  error?: string;
};

/**
 * Chip toggles grouped by kind of artifact. Each chip is a real checkbox
 * (visually hidden, focus ring on the chip), so it posts with the form,
 * works with Space, and is announced like any other checkbox. Groups are
 * native <details>, open when they already hold a selection.
 */
export function TaxonomyPicker({
  name,
  legend,
  description,
  value,
  onChange,
  max = 8,
  error,
}: TaxonomyPickerProps) {
  const uid = useId();
  const [initiallyOpen] = useState(
    () =>
      new Set(
        artifacts
          .filter((artifact) => value.includes(artifact.id))
          .map((artifact) => artifact.group),
      ),
  );
  const atMax = value.length >= max;
  const descriptionId = `${uid}-description`;
  const errorId = `${uid}-error`;

  function toggle(id: string, checked: boolean) {
    onChange(checked ? [...value, id] : value.filter((v) => v !== id));
  }

  return (
    <fieldset className="grid gap-3" aria-describedby={cn(descriptionId, error && errorId)}>
      <legend className="text-sm font-medium">{legend}</legend>
      <p id={descriptionId} className="-mt-1 text-sm text-pretty text-muted-foreground">
        {description}
      </p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
        <p
          aria-live="polite"
          className="font-mono text-xs tracking-widest text-muted-foreground uppercase"
        >
          {value.length} of {max} selected
        </p>
        {value.length > 0 && (
          <p className="text-sm">{value.map((id) => artifactLabel(id)).join(", ")}</p>
        )}
      </div>

      <div className="grid gap-2">
        {artifactGroups.map((group) => {
          const items = artifacts.filter((artifact) => artifact.group === group);
          const selected = items.filter((artifact) => value.includes(artifact.id)).length;
          return (
            <details
              key={group}
              open={initiallyOpen.has(group) || undefined}
              className="group rounded-lg border"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm font-medium outline-none select-none focus-visible:ring-2 focus-visible:ring-ring [&::-webkit-details-marker]:hidden">
                <span>{group}</span>
                <span className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                  {selected > 0 && (
                    <span className="rounded-full bg-foreground px-1.5 py-0.5 text-background">
                      {selected}
                    </span>
                  )}
                  <span aria-hidden className="transition-transform group-open:rotate-90">
                    ›
                  </span>
                </span>
              </summary>
              <div className="flex flex-wrap gap-1.5 px-3 pb-3">
                {items.map((artifact) => {
                  const checked = value.includes(artifact.id);
                  return (
                    <label key={artifact.id} className="relative">
                      <input
                        type="checkbox"
                        name={name}
                        value={artifact.id}
                        checked={checked}
                        disabled={!checked && atMax}
                        onChange={(event) => toggle(artifact.id, event.currentTarget.checked)}
                        className="peer sr-only"
                      />
                      <span
                        className={cn(
                          "inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border border-input bg-background px-3 text-xs font-medium transition-colors select-none hover:bg-accent sm:h-8",
                          "peer-checked:border-foreground peer-checked:bg-foreground peer-checked:text-background",
                          "peer-focus-visible:ring-3 peer-focus-visible:ring-ring/50",
                          "peer-disabled:cursor-not-allowed peer-disabled:opacity-40 peer-disabled:hover:bg-background",
                        )}
                      >
                        {checked && <CheckIcon aria-hidden className="size-3" />}
                        {artifact.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </details>
          );
        })}
      </div>

      {error && (
        <p id={errorId} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </fieldset>
  );
}
