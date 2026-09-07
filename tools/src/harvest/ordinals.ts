import { mintProvisionalId, parseId } from '../ids.js';
import type { DocumentRecord } from '../types.js';

/**
 * A provisional id carries an ordinal only when more than one document of that genre
 * shares a date. Assigned here rather than in toDocument because only the orchestrator
 * can see the whole group. Ordinals are dense, 1-based, and assigned in title order so
 * the numbering is reproducible: without a deterministic sort, every harvest would
 * produce a different diff and the CI drift check would be meaningless. A lone
 * document in a group is left with no ordinal at all.
 *
 * Mutates the colliding records' `id` in place; `docs` need not be scoped to one
 * issuer, since a provisional `id` (before this pass runs) already embeds the issuer.
 */
export function assignProvisionalOrdinals(docs: DocumentRecord[]): void {
  const groups = new Map<string, DocumentRecord[]>();
  for (const d of docs.filter((d) => d.idStatus === 'provisional')) {
    groups.set(d.id, [...(groups.get(d.id) ?? []), d]);
  }
  for (const [baseId, group] of groups) {
    if (group.length < 2) continue;
    // baseId is itself a bare provisional id (mag:{issuer}/{genreSlug}-{date}, no
    // ordinal yet -- this pass is what adds one), so parseId recovers the genre slug
    // mintProvisionalId needs to rebuild it with an ordinal appended.
    const parts = parseId(baseId);
    if (!parts) continue;
    group.sort((a, b) => a.title.localeCompare(b.title));
    group.forEach((d, i) => {
      d.id = mintProvisionalId(d.issuerId, parts.slug, d.date, i + 1);
    });
  }
}
