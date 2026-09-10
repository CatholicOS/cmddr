import { slugify } from '../slug.js';
import type { HarvestItem } from '../types.js';

/**
 * Most specific shelf first: a document filed twice keeps the more specific genre.
 * `apost_exhortations` (Task 8 carried item): ranked here, after `motu_proprio` and before
 * the generic `letters` catch-all. It is a distinct, named formal genre like the six shelves
 * ahead of it -- not a generic bucket -- but pastoral exhortations carry no juridical force of
 * their own, unlike the acts above (constitutions, apostolic letters, bulls, briefs, motu
 * proprio), so it sits just below them. Previously absent, it fell through to the
 * least-specific rank (tied with `speeches` and any unknown shelf); harmless while Pius X
 * carried only one exhortation, but Pius XII carries eight, so an arbitrary tie-break here
 * could pick a same-date cross-shelf collision's winner arbitrarily in `keepMoreSpecific`.
 */
export const SHELF_SPECIFICITY = [
  'encyclicals', 'apost_constitutions', 'apost_letters', 'bulls',
  'briefs', 'motu_proprio', 'apost_exhortations', 'letters', 'speeches',
];
/**
 * Benedict XV hyphenates 'apost-constitutions' (spec §2.5) -- the same genre as
 * 'apost_constitutions' (see genres.ts), so it must rank identically, not fall through to
 * the least-specific default. Task 12 review: before this alias existed, the hyphenated
 * shelf ranked as unrecognised (tied with `speeches`), so `bulls` silently outranked it in
 * both of Benedict XV's apost-constitutions/bulls same-incipit-or-duplicate merges
 * ('Incruentum Altaris' and 'Bracarensis'/'Sedis huius') -- losing
 * `characteristics: ['apostolic-constitution']` on the surviving record even though the
 * underlying act genuinely is an apostolic constitution. See the merged-record
 * characteristic test in harvest-data.test.ts.
 */
const SHELF_ALIASES: Record<string, string> = { 'apost-constitutions': 'apost_constitutions' };
const rank = (shelf: string | null) => {
  // A flat-era (null) shelf and an unrecognised one both fall through to the same
  // least-specific rank; indexOf's own -1-for-not-found already covers a null shelf
  // once it is fed the empty string, so no separate branch is needed for it.
  const canonical = SHELF_ALIASES[shelf ?? ''] ?? (shelf ?? '');
  const i = SHELF_SPECIFICITY.indexOf(canonical);
  return i === -1 ? SHELF_SPECIFICITY.length : i;
};

/**
 * Keep the more specific shelf, folding the other's shelf into alsoShelvedAs. When the
 * dropped record's printed incipit is not merely a case/accent variant of the kept
 * one's (compared via slugify, so the seven same-spelling pass-1 merges never trigger
 * this), the dropped incipit is preserved as an alias rather than lost outright.
 */
export function keepMoreSpecific(
  a: HarvestItem,
  b: HarvestItem,
  // Defaulted on, not optional: a caller that omits it still reports its discard. Passing
  // a no-op is how a caller opts out, which makes silence a deliberate, visible choice.
  onDiscard: (message: string) => void = console.warn,
): HarvestItem {
  // Shelf specificity decides first. When two items tie on shelf rank -- which pass 3's
  // hand-curated merges routinely do, since both records usually sit on the same shelf --
  // the previous tie-break was insertion order, i.e. whichever the fixture happened to list
  // first. That is not a reason to prefer one record over another, and it silently discarded
  // the better one: the 1968 beatification letter is published twice on apost_letters, and
  // only one of the two pages prints its incipit. A printed incipit is strictly more
  // information than none, so it wins the tie; everything else keeps the previous ordering.
  const [keep, drop] = rank(a.shelf) < rank(b.shelf) ? [a, b]
    : rank(b.shelf) < rank(a.shelf) ? [b, a]
    : (a.incipit !== null && b.incipit === null) ? [a, b] : [b, a];
  const seen = new Set([...(keep.alsoShelvedAs ?? []), ...(drop.alsoShelvedAs ?? [])]);
  if (drop.shelf) seen.add(drop.shelf);
  // `alsoShelvedAs` means "the other shelves this act is also filed under". A same-shelf
  // merge -- the shape pass 3's curated duplicates usually take, since both pages sit on
  // one shelf -- would otherwise record the surviving record's own shelf as an "other"
  // shelf, which states nothing and reads as a second filing that does not exist.
  if (keep.shelf) seen.delete(keep.shelf);
  const aliases = new Set([...(keep.aliases ?? []), ...(drop.aliases ?? [])]);
  if (slugify(drop.incipit ?? drop.title) !== slugify(keep.incipit ?? keep.title)) {
    aliases.add(drop.incipit ?? drop.title);
  }
  // Every merge destroys a record, and a destroyed record must never be silent: John XXIII's
  // Rosary meditations were absorbed into the letter they accompany and nothing said so, which
  // is how the loss went unnoticed. Naming both URLs and the reason makes each discard
  // auditable from the harvest log, whichever pass performed it.
  onDiscard(
    `Merged and discarded ${drop.url ?? `'${drop.incipit ?? drop.title}'`} into `
    + `${keep.url ?? `'${keep.incipit ?? keep.title}'`} `
    + `(${rank(keep.shelf) === rank(drop.shelf)
      ? (keep.incipit !== null && drop.incipit === null
        ? 'same shelf rank; kept the record whose heading prints an incipit'
        : 'same shelf rank; kept the record seen first')
      : `kept the more specific shelf '${keep.shelf}' over '${drop.shelf}'`})`,
  );
  return {
    ...keep,
    alsoShelvedAs: [...seen].sort(),
    ...(aliases.size ? { aliases: [...aliases].sort() } : {}),
  };
}
