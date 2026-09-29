"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { createToolAction, updateToolAction, type BatonActionState } from "@/lib/baton/actions";
import { suggestPartners } from "@/lib/baton/partners";
import type { DirectoryEntry } from "@/lib/baton/queries";
import { artifactLabel, categories } from "@/lib/baton/taxonomy";

import { CardPreview } from "./card-preview";
import { EmbedSnippet } from "./embed-snippet";
import { LaneSection } from "./page-head";
import { PartnerRows } from "./partner-rows";
import { TaxonomyPicker } from "./taxonomy-picker";
import { InstallStatus } from "./tool-status";

export type StudioTool = {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  inputs: string[];
  outputs: string[];
  cardTitle: string;
  cardBody: string;
  cardCta: string;
  allowSameCategory: boolean;
  siteKey: string;
  installedAt: string | null;
  credits: number;
};

type ToolStudioProps = {
  /** Present when editing. */
  tool?: StudioTool;
  directory: DirectoryEntry[];
  siteUrl: string;
  starterCredits: number;
  /** Just created: show the welcome note and point at the install step. */
  created?: boolean;
};

const Count = ({ value, max }: { value: string; max: number }) => (
  <span aria-hidden className="ml-auto font-mono text-xs text-muted-foreground">
    {value.length}/{max}
  </span>
);

/**
 * The card studio: form on the left, a sticky live preview on the right, then
 * the install snippet and live partner suggestions. All of it reads the same
 * draft state, so what you type is what the preview, the snippet's ctx and the
 * suggestions show, before anything is saved.
 */
export function ToolStudio({ tool, directory, siteUrl, starterCredits, created }: ToolStudioProps) {
  const editing = Boolean(tool);
  const [state, formAction, pending] = useActionState<BatonActionState, FormData>(
    editing ? updateToolAction : createToolAction,
    { status: "idle" },
  );

  const [name, setName] = useState(tool?.name ?? "");
  const [url, setUrl] = useState(tool?.url ?? "");
  const [description, setDescription] = useState(tool?.description ?? "");
  const [category, setCategory] = useState(tool?.category ?? "");
  const [outputs, setOutputs] = useState<string[]>(tool?.outputs ?? []);
  const [inputs, setInputs] = useState<string[]>(tool?.inputs ?? []);
  const [cardTitle, setCardTitle] = useState(tool?.cardTitle ?? "");
  const [cardBody, setCardBody] = useState(tool?.cardBody ?? "");
  const [cardCta, setCardCta] = useState(tool?.cardCta ?? "Open");
  const [allowSame, setAllowSame] = useState(tool?.allowSameCategory ?? false);

  const errors = state.errors ?? {};

  // Cheap enough to recompute on every keystroke; the React Compiler memoizes it.
  const partners = suggestPartners(
    {
      id: tool?.id ?? "draft",
      ownerId: "me",
      category,
      inputs,
      outputs,
      status: "active",
      credits: tool?.credits ? tool.credits : starterCredits,
      allowSameCategory: allowSame,
    },
    directory,
    { limit: 5 },
  );

  const previewName = name.trim() || "Your tool";
  const via = inputs[0] ? artifactLabel(inputs[0]) : "what they made";
  const saveLabel = editing ? "Save changes" : "Create tool";
  const submit = (
    <div className="flex flex-wrap items-center gap-3">
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Saving…" : saveLabel}
      </Button>
      {!editing && (
        <p className="text-xs text-muted-foreground">Includes {starterCredits} starter credits.</p>
      )}
    </div>
  );

  return (
    <>
      <form
        action={formAction}
        className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start xl:grid-cols-[minmax(0,1fr)_27rem] xl:gap-12"
      >
        {tool && <input type="hidden" name="id" value={tool.id} />}

        <div className="grid gap-10">
          {created && (
            <Alert variant="success">
              <AlertDescription className="text-foreground">
                <p>
                  <strong>{tool?.name}</strong> is on the network with {starterCredits} starter
                  credits. One step left: install the snippet below, then call{" "}
                  <code className="font-mono text-xs">baton.pass()</code>.
                </p>
              </AlertDescription>
            </Alert>
          )}
          {state.message && (
            <Alert variant={state.status === "success" ? "success" : "destructive"}>
              <AlertDescription
                className={state.status === "success" ? "text-foreground" : "text-destructive"}
              >
                <p>
                  {state.message}
                  {state.upgrade && (
                    <>
                      {" "}
                      <Link
                        href="/pricing"
                        className="font-medium text-foreground underline underline-offset-4"
                      >
                        Compare plans
                      </Link>
                    </>
                  )}
                </p>
              </AlertDescription>
            </Alert>
          )}

          <LaneSection index={1} total={3} title="The tool" id="studio-tool">
            <div className="grid gap-5">
              <Field id="tool-name" label="Name" error={errors.name}>
                {(control) => (
                  <Input
                    {...control}
                    name="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    minLength={2}
                    maxLength={60}
                    autoComplete="off"
                    placeholder="e.g. Squeeze PDF"
                  />
                )}
              </Field>
              <Field
                id="tool-url"
                label="Website URL"
                description="Where the card sends people. Must start with https://"
                error={errors.url}
              >
                {(control) => (
                  <Input
                    {...control}
                    name="url"
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    required
                    inputMode="url"
                    autoComplete="off"
                    placeholder="https://"
                  />
                )}
              </Field>
              <Field
                id="tool-description"
                label={
                  <>
                    Description{" "}
                    <span className="font-normal text-muted-foreground">(optional)</span>
                    <Count value={description} max={200} />
                  </>
                }
                description="One sentence on what it does. Only you see this."
                error={errors.description}
              >
                {(control) => (
                  <Textarea
                    {...control}
                    name="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={200}
                    rows={2}
                    className="min-h-16"
                  />
                )}
              </Field>
              <Field
                id="tool-category"
                label="Category"
                description="Tools in the same category are competitors and are never paired unless both opt in."
                error={errors.category}
              >
                {(control) => (
                  <NativeSelect
                    {...control}
                    name="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                      Choose a category
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.label}
                      </option>
                    ))}
                  </NativeSelect>
                )}
              </Field>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="tool-same-category"
                  name="allowSameCategory"
                  checked={allowSame}
                  onCheckedChange={(checked) => setAllowSame(checked === true)}
                  className="mt-0.5"
                />
                <Label htmlFor="tool-same-category" className="grid gap-0.5 font-normal">
                  <span className="text-sm font-medium">Open to same-category pairings</span>
                  <span className="text-sm leading-snug text-muted-foreground">
                    Off by default. Both tools must opt in before they are shown to each other.
                  </span>
                </Label>
              </div>
            </div>
          </LaneSection>

          <LaneSection
            index={2}
            total={3}
            title="The journey"
            id="studio-journey"
            description="Matching is journey-based: what your users leave with is matched to what other tools' users bring."
          >
            <div className="grid gap-8">
              <TaxonomyPicker
                name="outputs"
                legend="Outputs: what people leave with"
                description="When your tool has done its job, what does the user hold? Pick 1 to 8."
                value={outputs}
                onChange={setOutputs}
                error={errors.outputs?.[0]}
              />
              <TaxonomyPicker
                name="inputs"
                legend={
                  <>
                    Inputs: what people bring{" "}
                    <span className="font-normal text-muted-foreground">(optional)</span>
                  </>
                }
                description="What does someone need in hand before your tool is useful? Pick up to 8. Narrow is better than broad."
                value={inputs}
                onChange={setInputs}
                error={errors.inputs?.[0]}
              />
            </div>
          </LaneSection>

          <LaneSection
            index={3}
            total={3}
            title="The card"
            id="studio-card"
            description="Shown once, at someone else's success moment. Say what they get next, not what you are."
          >
            <div className="grid gap-5">
              <Field
                id="tool-card-title"
                label={
                  <>
                    Title
                    <Count value={cardTitle} max={70} />
                  </>
                }
                error={errors.cardTitle}
              >
                {(control) => (
                  <Input
                    {...control}
                    name="cardTitle"
                    value={cardTitle}
                    onChange={(e) => setCardTitle(e.target.value)}
                    required
                    minLength={3}
                    maxLength={70}
                    autoComplete="off"
                    placeholder="e.g. Sign it in two minutes"
                  />
                )}
              </Field>
              <Field
                id="tool-card-body"
                label={
                  <>
                    Text <span className="font-normal text-muted-foreground">(optional)</span>
                    <Count value={cardBody} max={120} />
                  </>
                }
                error={errors.cardBody}
              >
                {(control) => (
                  <Textarea
                    {...control}
                    name="cardBody"
                    value={cardBody}
                    onChange={(e) => setCardBody(e.target.value)}
                    maxLength={120}
                    rows={2}
                    className="min-h-16"
                  />
                )}
              </Field>
              <Field
                id="tool-card-cta"
                label={
                  <>
                    Button
                    <Count value={cardCta} max={24} />
                  </>
                }
                error={errors.cardCta}
                className="max-w-xs"
              >
                {(control) => (
                  <Input
                    {...control}
                    name="cardCta"
                    value={cardCta}
                    onChange={(e) => setCardCta(e.target.value)}
                    required
                    minLength={2}
                    maxLength={24}
                    autoComplete="off"
                  />
                )}
              </Field>
            </div>
          </LaneSection>

          <div className="lg:hidden">{submit}</div>
        </div>

        <aside
          aria-label="Card preview"
          className="order-first grid gap-5 lg:sticky lg:top-20 lg:order-last"
        >
          <CardPreview
            title={cardTitle.trim() || `${previewName}: your card title`}
            body={
              cardBody.trim() ||
              (cardTitle.trim() ? "" : "One line that says why it is the natural next step.")
            }
            cta={cardCta.trim() || "Open"}
            via={via}
          />
          <div className="hidden lg:block">{submit}</div>
        </aside>
      </form>

      <div className="grid gap-12 border-t pt-10 lg:grid-cols-2 lg:gap-16">
        <LaneSection
          id="install"
          index={1}
          title="Install"
          description={
            editing
              ? "One script tag, one function call. The first card it renders marks the tool live."
              : "One script tag, one function call. You'll get your personal key when you save."
          }
          actions={editing && tool ? <InstallStatus installedAt={tool.installedAt} /> : undefined}
        >
          <EmbedSnippet siteUrl={siteUrl} siteKey={tool?.siteKey} ctx={outputs[0] ?? "pdf"} />
        </LaneSection>

        <LaneSection
          id="partners"
          index={2}
          title="Suggested partners"
          description="Computed from your journey as you edit it. Blocklists and handshakes are applied on the network page."
          actions={
            editing && tool ? (
              <Button asChild variant="outline" size="sm">
                <Link href={`/network?tool=${tool.id}`}>Open network</Link>
              </Button>
            ) : undefined
          }
        >
          <div className="grid gap-6" aria-live="polite">
            <div className="grid gap-2">
              <h3 className="font-mono text-xs tracking-widest uppercase">You&apos;d pass to</h3>
              <PartnerRows
                rows={partners.passesTo.map((p) => ({
                  id: p.tool.id,
                  name: p.tool.name,
                  category: p.tool.category,
                  via: p.via,
                }))}
                empty={
                  outputs.length === 0
                    ? "Pick at least one output to see which tools fit your users next."
                    : "No tool takes what your users leave with yet. Broaden your outputs, or check back as the network grows."
                }
              />
            </div>
            <div className="grid gap-2">
              <h3 className="font-mono text-xs tracking-widest uppercase">Would pass to you</h3>
              <PartnerRows
                rows={partners.receivesFrom.map((p) => ({
                  id: p.tool.id,
                  name: p.tool.name,
                  category: p.tool.category,
                  via: p.via,
                }))}
                empty={
                  inputs.length === 0
                    ? "Pick what your users bring to see which tools would send them to you."
                    : "No tool produces what your users bring yet."
                }
              />
            </div>
          </div>
        </LaneSection>
      </div>
    </>
  );
}
