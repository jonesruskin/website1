"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { NativeSelect } from "@/components/ui/native-select";
import { blockAction, type BatonActionState } from "@/lib/baton/actions";
import { cn } from "@/lib/utils";

/** Block a whole category of tools: pick one, press Block. */
export function BlockCategoryForm({
  toolId,
  options,
}: {
  toolId: string;
  options: { id: string; label: string }[];
}) {
  const [state, action, pending] = useActionState<BatonActionState, FormData>(blockAction, {
    status: "idle",
  });
  if (options.length === 0) return null;
  return (
    <form action={action} className="grid gap-2">
      <input type="hidden" name="toolId" value={toolId} />
      <div className="flex flex-wrap items-end gap-2">
        <Field
          id={`block-category-${toolId}`}
          label="Block a whole category"
          className="min-w-56 flex-1 sm:max-w-xs"
        >
          {(control) => (
            <NativeSelect {...control} name="blockedCategory" required defaultValue="">
              <option value="" disabled>
                Choose a category
              </option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </NativeSelect>
          )}
        </Field>
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? "Blocking…" : "Block"}
        </Button>
      </div>
      <div role="status" aria-live="polite" className="empty:hidden">
        {state.message && (
          <p
            className={cn(
              "text-xs",
              state.status === "error" ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}
