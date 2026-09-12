import { mintProvisionalId, parseId } from '../ids.js';
import type { DocumentRecord } from '../types.js';

/** A provisional id without its ordinal: `…-2013-10-13-3` -> `…-2013-10-13`. Only a suffix
 *  after the full date is an ordinal, so the day segment is never misread as one. */
export const bareProvisionalId = (id: string): string => id.replace(/(-\d{4}-\d{2}-\d{2})-\d+$/, '$1');

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
 *
 * Idempotent: records are grouped by their *bare* id (the ordinal a previous pass
 * appended is stripped first), so the pass can run again over a set that has grown --
 * the orchestrator runs it over the shelf records, then once more after the AAS-only
 * records are appended (AAS-only documents spec §6) -- and a record whose group has
 * grown or shrunk is renumbered rather than left with a stale ordinal.
 */
export function assignProvisionalOrdinals(docs: DocumentRecord[]): void {
  const groups = new Map<string, DocumentRecord[]>();
  for (const d of docs.filter((d) => d.idStatus === 'provisional')) {
    const bare = bareProvisionalId(d.id);
    groups.set(bare, [...(groups.get(bare) ?? []), d]);
  }
  for (const [baseId, group] of groups) {
    if (group.length < 2) {
      // A lone record carries no ordinal; one left over from a larger group loses it.
      group[0]!.id = baseId;
      continue;
    }
    // baseId is a bare provisional id (mag:{issuer}/{genreSlug}-{date}, no ordinal),
    // so parseId recovers the genre slug mintProvisionalId needs to rebuild it with an
    // ordinal appended.
    const parts = parseId(baseId);
    if (!parts) continue;
    // Codepoint order, not locale collation: `localeCompare` orders accented Latin
    // characters differently depending on the ICU data available at runtime (small-ICU
    // Node builds only bundle a handful of locales, so behaviour can silently diverge
    // from a full-ICU build or a different LANG). Since this ordering mints the `-1`/`-2`
    // ordinal suffix baked into an id, it must be identical on every machine and CI
    // runner regardless of locale, or the harvest becomes non-reproducible. Review
    // finding, 2026-09-07: 3 of 14 multi-member ordinal groups order differently under
    // codepoint vs. locale collation (e.g. 'la Beata María' vs. 'Laura di Santa Caterina').
    group.sort((a, b) => (a.title < b.title ? -1 : a.title > b.title ? 1 : 0));
    group.forEach((d, i) => {
      d.id = mintProvisionalId(d.issuerId, parts.slug, d.date, i + 1);
    });
  }
}
