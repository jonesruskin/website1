import Link from "next/link";

import { cn } from "@/lib/utils";

import { BatonPill } from "./baton-pill";

/** The logo: a tilted baton pill that levels out on hover, and the word "Baton". */
export function Wordmark({ className, name = "Baton" }: { className?: string; name?: string }) {
  return (
    <Link
      href="/"
      aria-label={`${name}, home`}
      className={cn(
        "group/logo -ml-2 inline-flex items-center gap-2.5 rounded-full px-2 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <BatonPill className="h-2.5 w-6 -rotate-[28deg] transition-transform duration-500 ease-(--motion-ease-handoff) group-hover/logo:rotate-0 motion-reduce:transition-none" />
      <span
        aria-hidden
        className="font-display text-[1.375rem] leading-none font-extrabold tracking-[-0.045em]"
        style={{ fontStretch: "112%" }}
      >
        {name}
      </span>
    </Link>
  );
}
