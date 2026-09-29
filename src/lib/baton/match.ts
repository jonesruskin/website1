/**
 * The matching engine: given the tool where a success moment just happened,
 * rank which tool to pass the user to next. Pure and deterministic (for a given
 * seed), shared by the card API and the landing page demo.
 *
 * Score = journey fit (host outputs ∩ candidate inputs)
 *       + accepted handshake bonus
 *       × quality (smoothed click-through rate vs the network baseline)
 *       + a small seeded jitter so equal candidates take turns.
 * Eligibility: active, not the host or the host owner's own tool, credits ≥ 1,
 * not blocked by the host, not a same-category competitor (unless both opt in).
 */

export type MatchCandidate = {
  id: string;
  ownerId: string;
  category: string;
  inputs: readonly string[];
  outputs: readonly string[];
  status?: string;
  credits: number;
  allowSameCategory?: boolean;
  impressions?: number;
  clicks?: number;
};

export type MatchHost = Omit<MatchCandidate, "credits"> & { credits?: number };

export type MatchOptions = {
  /** The specific output of this success moment (e.g. "pdf"). Narrows the host's outputs. */
  ctx?: string | null;
  /** Tool ids the host has an accepted handshake with (either direction). */
  handshakes?: ReadonlySet<string>;
  blockedToolIds?: ReadonlySet<string>;
  blockedCategories?: ReadonlySet<string>;
  /** Seeds the rotation jitter; use the impression request id. */
  seed?: string;
  limit?: number;
};

export type MatchResult<T extends MatchCandidate = MatchCandidate> = {
  tool: T;
  score: number;
  /** Artifacts that connect the two tools, e.g. ["pdf"]. */
  via: string[];
  handshake: boolean;
};

/** Network-wide baseline click-through rate the quality term is measured against. */
export const BASELINE_CTR = 0.06;
const PRIOR_IMPRESSIONS = 40;
const HANDSHAKE_BONUS = 1.2;
const JITTER = 0.12;

/** Bayesian-smoothed CTR: new tools start at the baseline and earn their way up or down. */
export function smoothedCtr(clicks = 0, impressions = 0) {
  return (clicks + BASELINE_CTR * PRIOR_IMPRESSIONS) / (impressions + PRIOR_IMPRESSIONS);
}

/** Quality multiplier in [0.6, 1.4]. */
export function qualityFactor(clicks = 0, impressions = 0) {
  const ratio = smoothedCtr(clicks, impressions) / BASELINE_CTR;
  return Math.min(1.4, Math.max(0.6, 0.6 + 0.4 * ratio));
}

/** Deterministic 0..1 from a string (FNV-1a + xorshift). */
export function seededRandom(seed: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  h ^= h << 13;
  h ^= h >>> 17;
  h ^= h << 5;
  return (h >>> 0) / 0xffffffff;
}

export function journeyFit(hostOutputs: readonly string[], candidateInputs: readonly string[]) {
  const inputs = new Set(candidateInputs);
  const via = [...new Set(hostOutputs)].filter((o) => inputs.has(o));
  if (via.length === 0) return { fit: 0, via };
  // Reward overlap, and prefer specialists (few inputs, all matching) over catch-alls.
  const breadth = Math.min(via.length, 3) / 3;
  const precision = via.length / Math.max(1, inputs.size);
  return { fit: 0.55 * breadth + 0.45 * precision + 0.4, via };
}

export function isEligible(host: MatchHost, candidate: MatchCandidate, options: MatchOptions = {}) {
  if (candidate.id === host.id) return false;
  if (candidate.ownerId === host.ownerId) return false;
  if ((candidate.status ?? "active") !== "active") return false;
  if (candidate.credits < 1) return false;
  if (options.blockedToolIds?.has(candidate.id)) return false;
  if (options.blockedCategories?.has(candidate.category)) return false;
  if (
    candidate.category === host.category &&
    !(host.allowSameCategory && candidate.allowSameCategory)
  ) {
    return false;
  }
  return true;
}

export function rankNextSteps<T extends MatchCandidate>(
  host: MatchHost,
  candidates: readonly T[],
  options: MatchOptions = {},
): MatchResult<T>[] {
  const outputs =
    options.ctx && host.outputs.includes(options.ctx) ? [options.ctx] : [...host.outputs];
  const seed = options.seed ?? "";
  const results: MatchResult<T>[] = [];

  for (const tool of candidates) {
    if (!isEligible(host, tool, options)) continue;
    const handshake = options.handshakes?.has(tool.id) ?? false;
    const { fit, via } = journeyFit(outputs, tool.inputs);
    if (fit === 0 && !handshake) continue;
    const quality = qualityFactor(tool.clicks, tool.impressions);
    const jitter = seed ? seededRandom(`${seed}:${tool.id}`) * JITTER : 0;
    const score = (fit + (handshake ? HANDSHAKE_BONUS : 0)) * quality + jitter;
    results.push({ tool, score: Math.round(score * 1000) / 1000, via, handshake });
  }

  results.sort((a, b) => b.score - a.score || a.tool.id.localeCompare(b.tool.id));
  return options.limit ? results.slice(0, options.limit) : results;
}
