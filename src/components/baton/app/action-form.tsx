"use client";

import Link from "next/link";
import { useActionState, type ReactNode } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import type { BatonActionState } from "@/lib/baton/actions";
import { cn } from "@/lib/utils";

type ActionFormProps = {
  action: (state: BatonActionState, formData: FormData) => Promise<BatonActionState>;
  /** Sent as hidden inputs. */
  fields: Record<string, string>;
  children: ReactNode;
  pendingLabel?: string;
  variant?: ButtonProps["variant"];
  size?: ButtonProps["size"];
  className?: string;
  /** Where the message appears: under the button (default) or not at all. */
  showMessage?: boolean;
};

/**
 * A one-button form for row-level actions (propose, accept, block, pause …).
 * Runs a server action with useActionState and announces the outcome, with an
 * upgrade link when the action was refused by a plan limit.
 */
export function ActionForm({
  action,
  fields,
  children,
  pendingLabel,
  variant = "outline",
  size = "sm",
  className,
  showMessage = true,
}: ActionFormProps) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" });
  return (
    <form action={formAction} className={cn("grid gap-1.5", className)}>
      {Object.entries(fields).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <Button
        type="submit"
        variant={variant}
        size={size}
        disabled={pending}
        className="justify-self-start"
      >
        {pending ? (pendingLabel ?? children) : children}
      </Button>
      <div role="status" aria-live="polite" className="empty:hidden">
        {showMessage && state.message && (
          <p
            className={cn(
              "text-xs",
              state.status === "error" ? "text-destructive" : "text-muted-foreground",
            )}
          >
            {state.message}
            {state.upgrade && (
              <>
                {" "}
                <Link
                  href="/pricing"
                  className="font-medium text-foreground underline underline-offset-4"
                >
                  See plans
                </Link>
              </>
            )}
          </p>
        )}
      </div>
    </form>
  );
}
