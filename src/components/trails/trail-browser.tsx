"use client";

import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useId, useMemo, useState } from "react";

import { NativeSelect } from "@/components/ui/native-select";
import { artifactGroups, artifacts } from "@/lib/baton/taxonomy";
import { matchesJourney, type TrailSummary } from "@/lib/trails/summary";

import { TrailRow } from "./trail-row";

/** Only artifacts some trail actually uses, grouped the way the taxonomy groups them. */
function optionGroups(ids: Set<string>) {
  return artifactGroups
    .map((group) => ({
      group,
      items: artifacts.filter((artifact) => artifact.group === group && ids.has(artifact.id)),
    }))
    .filter((entry) => entry.items.length > 0);
}

/**
 * The demand-side filter, "I have a ___ → I want a ___", over the trail lanes.
 * Every trail is server-rendered, so the list reads fine before this hydrates.
 */
export function TrailBrowser({ trails }: { trails: TrailSummary[] }) {
  const id = useId();
  const [have, setHave] = useState("");
  const [want, setWant] = useState("");

  const haveOptions = useMemo(
    () => optionGroups(new Set(trails.flatMap((trail) => [trail.from, ...trail.inputs]))),
    [trails],
  );
  const wantOptions = useMemo(
    () => optionGroups(new Set(trails.flatMap((trail) => [trail.to, ...trail.outputs]))),
    [trails],
  );

  const shown = trails.filter((trail) => matchesJourney(trail, have, want));
  const filtering = Boolean(have || want);

  const select = (
    name: string,
    label: string,
    value: string,
    onChange: (value: string) => void,
    groups: ReturnType<typeof optionGroups>,
  ) => (
    <div className="flex min-w-0 flex-1 flex-col gap-2">
      <label
        htmlFor={`${id}-${name}`}
        className="font-mono text-xs tracking-widest text-muted-foreground uppercase"
      >
        {label}
      </label>
      <NativeSelect
        id={`${id}-${name}`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Anything</option>
        {groups.map(({ group, items }) => (
          <optgroup key={group} label={group}>
            {items.map((artifact) => (
              <option key={artifact.id} value={artifact.id}>
                {artifact.label}
              </option>
            ))}
          </optgroup>
        ))}
      </NativeSelect>
    </div>
  );

  return (
    <div className="flex flex-col gap-10">
      <form
        onSubmit={(event) => event.preventDefault()}
        aria-label="Find a trail"
        className="rounded-2xl border bg-card p-5 sm:p-6"
      >
        <div className="flex flex-col gap-4 md:flex-row md:items-end">
          {select("have", "I have", have, setHave, haveOptions)}
          <span
            aria-hidden
            className="hidden pb-3 text-signal-ink md:block"
            style={{ fontStretch: "125%" }}
          >
            <ArrowRightIcon className="size-6" />
          </span>
          {select("want", "I want", want, setWant, wantOptions)}
          {filtering && (
            <button
              type="button"
              onClick={() => {
                setHave("");
                setWant("");
              }}
              className="h-12 shrink-0 rounded-md px-3 text-sm text-muted-foreground underline underline-offset-4 outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      <p
        role="status"
        className="-mb-6 font-mono text-xs tracking-widest text-muted-foreground uppercase"
      >
        {filtering ? `${shown.length} of ${trails.length} trails` : `${trails.length} trails`}
      </p>

      {shown.length > 0 ? (
        <ol className="flex flex-col">
          {shown.map((trail, index) => (
            <TrailRow key={trail.slug} trail={trail} index={index} total={shown.length} />
          ))}
        </ol>
      ) : (
        <div className="flex flex-col items-start gap-4 border-y py-12">
          <p className="font-display text-2xl font-semibold tracking-tight">
            No trail runs that route yet.
          </p>
          <p className="max-w-prose text-muted-foreground">
            Try loosening one side of the filter. And if you make a tool that starts from the first
            thing or finishes with the second, that is a gap the network would like you to fill.
          </p>
          <Link
            href="/makers"
            className="inline-flex items-center gap-2 text-sm font-medium text-foreground underline underline-offset-4"
          >
            Put your tool on the network <ArrowRightIcon aria-hidden className="size-4" />
          </Link>
        </div>
      )}
    </div>
  );
}
