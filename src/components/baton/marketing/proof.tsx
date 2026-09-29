import { LaneLabel } from "./lane-label";

/** 06 · Why now: one enormous number, one sourced claim, one honest paragraph. */
export function Proof() {
  return (
    <section
      aria-labelledby="proof-title"
      className="relative overflow-x-clip py-24 sm:py-28 lg:py-36"
    >
      <div className="container-page">
        <LaneLabel n={6}>Why now</LaneLabel>
        <h2 id="proof-title" className="sr-only">
          Recommendations already drive about half of new newsletter subscriptions
        </h2>

        <div className="mt-8 sm:mt-12">
          <p
            className="reveal font-display text-[31vw] leading-[0.8] font-extrabold tracking-[-0.06em] whitespace-nowrap lg:text-[min(31vw,30rem)]"
            style={{ fontStretch: "125%" }}
          >
            <span className="-mr-[0.04em] text-signal" aria-hidden>
              ~
            </span>
            <span aria-hidden>50</span>
            <span aria-hidden className="accent-serif text-[0.86em] font-normal text-signal">
              %
            </span>
            <span className="sr-only">About 50 percent</span>
          </p>
          <p className="mt-6 max-w-xl font-display text-2xl leading-tight font-semibold tracking-tight text-balance sm:text-3xl">
            of new Substack subscriptions come through its Recommendations and app network.
            <a
              href="#proof-footnote"
              aria-label="Footnote 1"
              className="ml-1 align-super font-mono text-xs font-semibold text-signal-ink underline-offset-4 hover:underline"
            >
              [1]
            </a>
          </p>
        </div>

        <div className="mt-16 grid gap-10 border-t border-foreground pt-10 lg:mt-24 lg:grid-cols-12 lg:gap-16 lg:pt-14">
          <p className="reveal font-display text-[clamp(2rem,4.4vw,4rem)] leading-[0.98] font-bold tracking-[-0.035em] text-balance lg:col-span-7">
            Newsletters solved discovery with recommendations.{" "}
            <span className="accent-serif text-[1.1em] font-normal">Tools never did.</span>
          </p>
          <div className="flex flex-col gap-5 text-lg leading-relaxed text-muted-foreground lg:col-span-5">
            <p>
              A writer you trust says &ldquo;read this too&rdquo; and it works, because it lands
              when the reader is already convinced. Tools have that exact moment: the second a job
              finishes. Today it ends in a closed tab.
            </p>
            <p>
              Baton is the recommendation layer tools never got. Matched by journey, paid in
              credits, and honest about what it is. It is new, so you will not find customer logos
              or invented numbers here.
            </p>
          </div>
        </div>

        <p
          id="proof-footnote"
          className="mt-14 max-w-2xl scroll-mt-24 font-mono text-xs leading-relaxed tracking-wide text-muted-foreground"
        >
          [1] Substack states that its Recommendations and app network drive about half of new
          subscriptions. Source:{" "}
          <a
            href="https://substack.com/growthfeatures"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground underline underline-offset-4 hover:text-signal-ink"
          >
            substack.com/growthfeatures
          </a>
          . A claim about newsletters, not a claim about Baton.
        </p>
      </div>
    </section>
  );
}
