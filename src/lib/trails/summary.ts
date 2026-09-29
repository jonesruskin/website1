/**
 * Client-safe trail data: what the index page and its filter need. Keep free of
 * server-only imports (the filter island imports from here).
 */
export type TrailSummary = {
  slug: string;
  title: string;
  promise: string;
  time: string;
  audience: string;
  from: string;
  to: string;
  /** Artifact ids every step takes / leaves with, for the "I have / I want" filter. */
  inputs: string[];
  outputs: string[];
  steps: { title: string; tool: string }[];
};

/** A trail matches when you have something it uses and want something it makes. */
export function matchesJourney(trail: TrailSummary, have: string, want: string) {
  const hasIt = !have || trail.from === have || trail.inputs.includes(have);
  const getsIt = !want || trail.to === want || trail.outputs.includes(want);
  return hasIt && getsIt;
}
