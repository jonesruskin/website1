import { rankNextSteps, type MatchCandidate, type MatchHost } from "./match";

/**
 * Suggested partners, both ways, from the same engine the card API uses.
 * Pure and free of server imports so the tool studio can recompute it live in
 * the browser while the maker edits the journey.
 */

export type DirectoryTool = MatchCandidate & {
  name: string;
  url?: string;
  cardTitle?: string;
};

export type Partner<T extends MatchCandidate = DirectoryTool> = {
  tool: T;
  via: string[];
  handshake: boolean;
  score: number;
};

export type PartnerOptions = {
  /** Tools this tool refuses to show. */
  blockedToolIds?: ReadonlySet<string>;
  blockedCategories?: ReadonlySet<string>;
  /** Tool ids with an accepted handshake with this tool. */
  handshakes?: ReadonlySet<string>;
  /** What each other tool blocks, keyed by that tool's id (so it would never pass to us). */
  hostBlocks?: ReadonlyMap<
    string,
    { toolIds: ReadonlySet<string>; categories: ReadonlySet<string> }
  >;
  limit?: number;
};

export type SuggestedPartners<T extends MatchCandidate = DirectoryTool> = {
  /** Tools this tool would pass its users to. */
  passesTo: Partner<T>[];
  /** Tools that would pass their users to this one. */
  receivesFrom: Partner<T>[];
};

export function suggestPartners<T extends DirectoryTool>(
  me: MatchHost & { credits: number },
  directory: readonly T[],
  options: PartnerOptions = {},
): SuggestedPartners<T> {
  const limit = options.limit ?? 6;

  const passesTo = rankNextSteps(me, directory, {
    blockedToolIds: options.blockedToolIds,
    blockedCategories: options.blockedCategories,
    handshakes: options.handshakes,
    limit,
  }).map(({ tool, via, handshake, score }) => ({ tool, via, handshake, score }));

  const receivesFrom: Partner<T>[] = [];
  for (const other of directory) {
    const blocks = options.hostBlocks?.get(other.id);
    const [match] = rankNextSteps(other, [me as unknown as MatchCandidate], {
      blockedToolIds: blocks?.toolIds,
      blockedCategories: blocks?.categories,
      handshakes: options.handshakes?.has(other.id) ? new Set([me.id]) : undefined,
      limit: 1,
    });
    if (match) {
      receivesFrom.push({
        tool: other,
        via: match.via,
        handshake: match.handshake,
        score: match.score,
      });
    }
  }
  receivesFrom.sort((a, b) => b.score - a.score || a.tool.id.localeCompare(b.tool.id));

  return { passesTo, receivesFrom: receivesFrom.slice(0, limit) };
}
