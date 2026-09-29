"use client";

import { ArrowRightIcon, MinusIcon, PlusIcon } from "lucide-react";
import { AnimatePresence, MotionConfig, motion } from "motion/react";
import Link from "next/link";
import { useId, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { demoCatalog, popularArtifacts, type DemoTool } from "@/lib/baton/demo-catalog";
import { journeyFit, rankNextSteps, type MatchCandidate } from "@/lib/baton/match";
import {
  artifactGroups,
  artifactLabel,
  artifacts,
  categories,
  type CategoryId,
} from "@/lib/baton/taxonomy";
import { cn } from "@/lib/utils";

import { BatonCard } from "./baton-card";
import { LaneLabel } from "./lane-label";

const chip =
  "inline-flex h-9 items-center rounded-full border px-3.5 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** A multi-select chip picker: popular artifacts first, the full taxonomy behind "More". */
function ChipPicker({
  legend,
  hint,
  value,
  onChange,
}: {
  legend: string;
  hint?: string;
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [more, setMore] = useState(false);
  const moreId = useId();
  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  const popular = new Set<string>(popularArtifacts);
  const button = (id: string) => (
    <button
      key={id}
      type="button"
      aria-pressed={value.includes(id)}
      onClick={() => toggle(id)}
      className={cn(
        chip,
        value.includes(id)
          ? "border-foreground bg-foreground text-background"
          : "border-input bg-background text-foreground hover:bg-accent",
      )}
    >
      {artifactLabel(id)}
    </button>
  );

  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 text-sm font-medium">{legend}</legend>
      {hint && <p className="mb-3 text-sm text-muted-foreground">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {popularArtifacts.map(button)}
        {value.filter((id) => !popular.has(id)).map(button)}
        <button
          type="button"
          aria-expanded={more}
          aria-controls={moreId}
          onClick={() => setMore((m) => !m)}
          className={cn(chip, "gap-1.5 border-dashed border-input bg-transparent hover:bg-accent")}
        >
          {more ? (
            <MinusIcon aria-hidden className="size-3.5" />
          ) : (
            <PlusIcon aria-hidden className="size-3.5" />
          )}
          {more ? "Fewer" : "More kinds"}
        </button>
      </div>
      {more && (
        <div id={moreId} className="mt-4 flex flex-col gap-4 border-t pt-4">
          {artifactGroups.map((group) => (
            <div key={group}>
              <p className="mb-2 font-mono text-xs tracking-widest text-muted-foreground uppercase">
                {group}
              </p>
              <div className="flex flex-wrap gap-2">
                {artifacts
                  .filter((a) => a.group === group && !popular.has(a.id))
                  .map((a) => button(a.id))}
              </div>
            </div>
          ))}
        </div>
      )}
    </fieldset>
  );
}

type Row = { tool: DemoTool; score: number; via: string[] };

function Results({
  title,
  caption,
  rows,
  empty,
}: {
  title: string;
  caption: string;
  rows: Row[];
  empty: string;
}) {
  const top = Math.max(0.0001, ...rows.map((r) => r.score));
  return (
    <div className="min-w-0">
      <div className="flex items-baseline justify-between gap-4 border-b border-foreground pb-3">
        <h3 className="font-display text-xl font-bold tracking-tight">{title}</h3>
        <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          {rows.length} {rows.length === 1 ? "match" : "matches"}
        </span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{caption}</p>
      {rows.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          {empty}
        </p>
      ) : (
        <motion.ul layout className="mt-2">
          <AnimatePresence initial={false} mode="popLayout">
            {rows.map((row, i) => (
              <motion.li
                key={row.tool.id}
                layout
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
                className="flex items-center gap-4 border-b py-3.5"
              >
                <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground tabular-nums">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{row.tool.name}</p>
                  <p className="truncate text-sm text-muted-foreground">
                    <span className="font-mono text-xs tracking-widest text-signal-ink uppercase">
                      via {row.via.map(artifactLabel).join(" + ")}
                    </span>
                    <span aria-hidden> · </span>
                    {row.tool.pitch}
                  </p>
                </div>
                <div
                  aria-hidden
                  className="hidden h-1.5 w-16 shrink-0 overflow-hidden rounded-full bg-muted sm:block"
                >
                  <motion.div
                    className="h-full origin-left rounded-full bg-signal"
                    animate={{ scaleX: Math.max(0.12, row.score / top) }}
                    style={{ width: "100%" }}
                  />
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      )}
    </div>
  );
}

/** 04 · Try your card: the real matching engine, running in the page. */
export function TryCard() {
  const nameId = useId();
  const catId = useId();
  const titleId = useId();
  const ctaId = useId();
  const [name, setName] = useState("Compressor");
  const [outputs, setOutputs] = useState<string[]>(["pdf", "image"]);
  const [inputs, setInputs] = useState<string[]>(["pdf", "image"]);
  const [category, setCategory] = useState<CategoryId>("documents");
  const [title, setTitle] = useState("Shrink any file in seconds");
  const [cta, setCta] = useState("Compress");

  const you: MatchCandidate = { id: "you", ownerId: "you", category, inputs, outputs, credits: 10 };

  // Who you'd pass to: the real engine, your outputs against the catalog's inputs.
  const passTo: Row[] = rankNextSteps(you, demoCatalog, { limit: 5 }).map((r) => ({
    tool: r.tool,
    score: r.score,
    via: r.via,
  }));

  // Who'd pass to you: each catalog tool as the host, with your tool as the only candidate.
  const passFrom: Row[] = demoCatalog
    .flatMap((tool) => {
      const [match] = rankNextSteps(tool, [you]);
      return match ? [{ tool, score: match.score, via: match.via }] : [];
    })
    .sort((a, b) => b.score - a.score || a.tool.id.localeCompare(b.tool.id))
    .slice(0, 5);

  const heldBack = demoCatalog.filter(
    (t) =>
      t.category === category &&
      (journeyFit(outputs, t.inputs).fit > 0 || journeyFit(t.outputs, inputs).fit > 0),
  );

  const via = passFrom[0]?.via[0] ?? inputs[0] ?? outputs[0];
  const label = name.trim() || "Your tool";

  return (
    <MotionConfig reducedMotion="user">
      <section
        aria-labelledby="try-title"
        className="relative border-y bg-muted/50 py-24 sm:py-28 lg:py-36"
      >
        <div className="container-page">
          <LaneLabel n={4}>Try your card</LaneLabel>
          <div className="mt-6 grid gap-6 lg:grid-cols-12 lg:items-end">
            <h2
              id="try-title"
              className="font-display text-[clamp(2.75rem,8.6vw,7.5rem)] leading-[0.88] font-extrabold tracking-[-0.045em] lg:col-span-8"
            >
              Try your <span className="accent-serif text-[1.14em] font-normal">card.</span>
            </h2>
            <p className="max-w-md text-lead text-muted-foreground lg:col-span-4 lg:justify-self-end">
              Describe your tool. Baton&apos;s real matching engine runs right here in your browser,
              over the example tools below.
            </p>
          </div>

          <div className="mt-14 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:gap-x-16 lg:gap-y-10">
            {/* Inputs */}
            <form
              onSubmit={(e) => e.preventDefault()}
              className="order-2 flex min-w-0 flex-col gap-8 lg:col-span-5 lg:col-start-1 lg:row-span-2 lg:row-start-1"
              aria-label="Describe your tool"
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor={nameId}>Tool name</Label>
                  <Input
                    id={nameId}
                    value={name}
                    maxLength={32}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Compressor"
                    className="h-11"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={catId}>Category</Label>
                  <NativeSelect
                    id={catId}
                    value={category}
                    onChange={(e) => setCategory(e.target.value as CategoryId)}
                    className="[&_select]:h-11"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
              </div>
              <ChipPicker
                legend="What does your user leave with?"
                hint="Pick every result your tool hands over."
                value={outputs}
                onChange={setOutputs}
              />
              <ChipPicker
                legend="And what does your tool take in?"
                hint="This is who could pass users to you."
                value={inputs}
                onChange={setInputs}
              />
              <div className="grid gap-5 sm:grid-cols-[1.6fr_1fr]">
                <div className="flex flex-col gap-2">
                  <Label htmlFor={titleId}>Card title</Label>
                  <Input
                    id={titleId}
                    value={title}
                    maxLength={48}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor={ctaId}>Button</Label>
                  <Input
                    id={ctaId}
                    value={cta}
                    maxLength={20}
                    onChange={(e) => setCta(e.target.value)}
                    className="h-11"
                  />
                </div>
              </div>
            </form>

            {/* The card, live */}
            <div className="order-1 min-w-0 lg:col-span-7 lg:col-start-6 lg:row-start-1">
              <div>
                <p className="mb-3 font-mono text-xs tracking-widest text-muted-foreground uppercase">
                  Your card, as another tool&apos;s users see it
                </p>
                <div className="rounded-3xl border bg-background p-4 sm:p-8">
                  <BatonCard
                    via={via ? artifactLabel(via) : "…"}
                    title={title.trim() || "Your card title"}
                    cta={cta.trim() || "Open"}
                    tool={label}
                    className="mx-auto max-w-md"
                  />
                </div>
              </div>
            </div>

            {/* Matches */}
            <div className="order-3 flex min-w-0 flex-col gap-10 lg:col-span-7 lg:col-start-6 lg:row-start-2">
              <div className="grid gap-10 xl:grid-cols-2" aria-live="polite">
                <Results
                  title="Who you'd pass to"
                  caption="Tools that take what your users leave with."
                  rows={passTo}
                  empty="Pick what your user leaves with to see where you'd pass them."
                />
                <Results
                  title="Who'd pass to you"
                  caption="Tools whose users leave with what you take in."
                  rows={passFrom}
                  empty="Pick what your tool takes in to see who could pass users to you."
                />
              </div>

              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                {heldBack.length > 0 && (
                  <p>
                    <span className="font-mono text-xs tracking-widest text-signal-ink uppercase">
                      Rule in action
                    </span>{" "}
                    {heldBack.length} example{heldBack.length === 1 ? "" : "s"} (
                    {heldBack.map((t) => t.name).join(", ")}) held back: same category means
                    competitor, and competitors are never paired.
                  </p>
                )}
                <p className="font-mono text-xs tracking-widest uppercase">
                  Examples of tools on the network · 24 archetypes, made-up owners, 10 credits each
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <Button asChild size="lg" className="rounded-full pr-4 pl-6 font-semibold">
                  <Link href="/sign-up">
                    Claim this card
                    <ArrowRightIcon aria-hidden />
                  </Link>
                </Button>
                <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                  Free · 10 starter credits
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MotionConfig>
  );
}
