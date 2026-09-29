import { ArrowRightIcon, PlusIcon } from "lucide-react";
import Link from "next/link";

import type { FaqEntry } from "@/lib/faq";

import { LaneLabel } from "./lane-label";

/** 10 · FAQ: native disclosures set as numbered lanes. Renders nothing without questions. */
export function HomeFaq({ items }: { items: FaqEntry[] }) {
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="faq-title" className="relative border-t py-24 sm:py-28 lg:py-36">
      <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-28">
            <LaneLabel n={10}>Questions</LaneLabel>
            <h2
              id="faq-title"
              className="mt-6 font-display text-[clamp(2.75rem,7vw,6rem)] leading-[0.9] font-extrabold tracking-[-0.045em]"
            >
              Questions, <span className="accent-serif text-[1.14em] font-normal">answered.</span>
            </h2>
            <Link
              href="/faq"
              className="group mt-8 inline-flex items-center gap-2 font-mono text-xs font-semibold tracking-widest uppercase underline-offset-8 hover:underline"
            >
              Every question
              <ArrowRightIcon
                aria-hidden
                className="size-4 transition-transform group-hover:translate-x-1"
              />
            </Link>
          </div>
        </div>
        <div className="border-t border-foreground lg:col-span-7">
          {items.map((item, i) => (
            <details key={item.question} name="home-faq" className="group border-b">
              <summary className="flex cursor-pointer list-none items-start gap-4 rounded-sm py-6 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:gap-6 [&::-webkit-details-marker]:hidden">
                <span className="mt-1.5 w-6 shrink-0 font-mono text-xs font-semibold text-signal-ink">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 font-display text-xl leading-tight font-bold tracking-[-0.02em] text-balance sm:text-2xl">
                  {item.question}
                </span>
                <PlusIcon
                  aria-hidden
                  className="mt-1 size-5 shrink-0 transition-transform duration-300 group-open:rotate-45"
                />
              </summary>
              <div className="flex flex-col gap-3 pr-9 pb-6 pl-10 leading-relaxed text-muted-foreground sm:pl-12">
                {item.answer.split(/\n{2,}/).map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
