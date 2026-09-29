"use client";

import { Trash2Icon } from "lucide-react";
import { useActionState, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { deleteToolAction, type BatonActionState } from "@/lib/baton/actions";

/** Delete with a real confirmation: a dialog that asks for the tool's name. */
export function DeleteTool({ id, name, credits }: { id: string; name: string; credits: number }) {
  const [state, action, pending] = useActionState<BatonActionState, FormData>(deleteToolAction, {
    status: "idle",
  });
  const [typed, setTyped] = useState("");
  const matches = typed.trim().toLowerCase() === name.trim().toLowerCase();

  return (
    <Dialog onOpenChange={(open) => !open && setTyped("")}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2Icon aria-hidden />
          Delete tool…
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form action={action} className="grid gap-4">
          <input type="hidden" name="id" value={id} />
          <DialogHeader>
            <DialogTitle>Delete {name}?</DialogTitle>
            <DialogDescription>
              This removes the tool, its {credits} {credits === 1 ? "credit" : "credits"}, its
              ledger and its stats for good. Cards for it stop appearing immediately, and the
              snippet on your site will render nothing. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="delete-confirm">
              Type <span className="font-mono">{name}</span> to confirm
            </Label>
            <Input
              id="delete-confirm"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          {state.status === "error" && state.message && (
            <Alert variant="destructive">
              <AlertDescription className="text-destructive">{state.message}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Keep it</Button>
            </DialogClose>
            <Button type="submit" variant="destructive" disabled={!matches || pending}>
              {pending ? "Deleting…" : "Delete forever"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
