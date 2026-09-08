import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { parseFlatIndex } from './flat.js';
import { parseShelfIndex } from './shelf.js';
import { resolveShelfPages } from './shelfPages.js';
import { toDocument } from './toDocument.js';
import { parseCouncilIndex } from './council.js';
import { assignProvisionalOrdinals } from './ordinals.js';
import {
  POPES, COUNCILS, DATE_CORRECTIONS, DUPLICATE_MERGES, ADJUDICATED_DISTINCT, isErectionCandidate,
} from '../mappings/index.js';
import { issuerLocalPart, mintId } from '../ids.js';
import { slugify } from '../slug.js';
import type { DocumentRecord, HarvestItem } from '../types.js';

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
const SHELF_SPECIFICITY = [
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
function keepMoreSpecific(a: HarvestItem, b: HarvestItem): HarvestItem {
  const [keep, drop] = rank(a.shelf) < rank(b.shelf) ? [a, b] : [b, a];
  const seen = new Set([...(keep.alsoShelvedAs ?? []), ...(drop.alsoShelvedAs ?? [])]);
  if (drop.shelf) seen.add(drop.shelf);
  const aliases = new Set([...(keep.aliases ?? []), ...(drop.aliases ?? [])]);
  if (slugify(drop.incipit ?? drop.title) !== slugify(keep.incipit ?? keep.title)) {
    aliases.add(drop.incipit ?? drop.title);
  }
  return {
    ...keep,
    alsoShelvedAs: [...seen].sort(),
    ...(aliases.size ? { aliases: [...aliases].sort() } : {}),
  };
}

/** The trailing document slug of a resolved vatican.va URL, e.g. `hf_..._05051888_in-plurimis.html`
 *  -> `in-plurimis`. Null when the URL is absent or does not carry the `_{DDMMYYYY|YYYYMMDD}_` shape. */
function urlDocSlug(url: string | null): string | null {
  const m = url?.match(/_\d{8}_([a-z0-9-]+)\.html/);
  return m ? m[1]! : null;
}

/** The date the checked-in *pope* fixtures in tools/fixtures/ were fetched from vatican.va.
 *  This is the source-of-truth default for pope fixtures; must be updated whenever those
 *  fixtures are refreshed. A council fixture's retrieval date lives on its own COUNCILS row
 *  (tools/src/mappings/councils.ts) instead and must be updated there -- see retrievedFor
 *  below, which never restamps this value onto a council's records.
 *  Can be overridden with the RETRIEVED env var for testing or when refreshing fixtures. */
const FIXTURES_RETRIEVED = '2026-09-07';
/**
 * The fetch date to stamp on one item's record. A council is fetched separately from the
 * pope pages and carries its own date, so FIXTURES_RETRIEVED is not restamped onto it and
 * it is not stamped with a date a day before its own fixture was fetched. An explicit
 * RETRIEVED override still wins over both, for a whole-corpus refresh.
 */
const retrievedFor = (item: HarvestItem): string =>
  process.env.RETRIEVED
  ?? COUNCILS.find((c) => c.pageSlug === item.pageSlug)?.retrieved
  ?? FIXTURES_RETRIEVED;
const fixture = (n: string) => readFileSync(`tools/fixtures/${n}.html`, 'utf8');

const items: HarvestItem[] = [];
for (const pope of POPES) {
  if (pope.era === 'flat') {
    items.push(...parseFlatIndex(fixture(pope.pageSlug), pope.pageSlug));
  } else {
    for (const shelf of pope.shelves) {
      const index = fixture(`${pope.pageSlug}-${shelf}`);
      const pages = resolveShelfPages(index, shelf);
      if (pages.kind === 'aggregate') {
        items.push(...parseShelfIndex(index, pope.pageSlug, shelf));
      } else {
        for (const year of pages.years) {
          items.push(...parseShelfIndex(
            fixture(`${pope.pageSlug}-${shelf}-${year}`), pope.pageSlug, shelf));
        }
      }
    }
  }
}

// Councils are read from their own archive index, not from a pope's page. Their items
// carry `shelf: null` and a council pageSlug, so the three dedupe passes below -- all
// keyed on pageSlug -- can never merge a conciliar act with a papal one.
for (const council of COUNCILS) {
  items.push(...parseCouncilIndex(fixture(council.pageSlug), council));
}

// Hand-curated corrections to demonstrable transcription errors on the source pages
// (spec §5.2, mapping tables). Applied before dedupe so the corrected date participates
// in the merge key; the adapters themselves stay pure readers of what the page prints.
// DATE_CORRECTIONS keys on the *printed* date (what the adapters emit above);
// CONCILIAR_REASSIGNMENTS (applied later, in toDocument) keys on the *corrected* one.
for (const [i, item] of items.entries()) {
  const correctionKey = `${item.pageSlug}|${item.shelf}|${slugify(item.incipit ?? item.title)}|${item.date}`;
  const correction = DATE_CORRECTIONS[correctionKey];
  if (correction) items[i] = { ...item, date: correction.date };
}

// The vatican.va shelves are not disjoint. Pass 1: a document filed under the same
// incipit and date on two shelves (seven Leo XIII cases) merges on (pageSlug, incipit-slug,
// date). Keep the most specific shelf and remember the rest.
//
// The merge key deliberately omits shelf, since its whole purpose is to catch the same
// act filed twice *across* shelves. But that means two genuinely distinct documents
// sharing (pageSlug, incipit-slug, date) on the *same* shelf collide here too -- and
// keepMoreSpecific, seeing equal shelf rank, silently keeps whichever was seen first in
// iteration order and drops the other with no trace (review finding, 2026-09-07; this is
// the mechanism the BARE_GENRE_SLUGS 'sub-plumbo' entry patches around for the three
// "sub plumbo" cardinalatial-title erections that would otherwise all collide on this
// same key). Warn whenever the two colliding items share a shelf, so a same-shelf
// collision is never mistaken for the intentional cross-shelf case this pass exists for.
const merged = new Map<string, HarvestItem>();
for (const item of items) {
  const key = `${item.pageSlug}|${slugify(item.incipit ?? item.title)}|${item.date}`;
  const held = merged.get(key);
  if (held && held.shelf === item.shelf) {
    console.warn(
      `Same-shelf merge collision on ${item.pageSlug}/${item.shelf ?? 'flat'} (${item.date}): `
      + `'${held.incipit ?? held.title}' and '${item.incipit ?? item.title}' share a merge `
      + 'key -- one is being silently dropped unless genuinely a duplicate',
    );
  }
  merged.set(key, held ? keepMoreSpecific(item, held) : item);
}

// Pass 2 (mechanical): two more Leo XIII documents are the same act filed under
// *different* printed incipits on the encyclicals and letters shelves (In Plurimis /
// In plurimis maximisque; Non mediocri / Non mediocri cura), so pass 1's incipit key
// misses them. Proven instead by the shared trailing slug of their vatican.va document
// URL. Falls back to the pass-1 key (already unique) when no URL slug is available.
const mergedByUrlSlug = new Map<string, HarvestItem>();
for (const [key1, item] of merged) {
  const docSlug = urlDocSlug(item.url);
  const key2 = docSlug ? `${item.pageSlug}|${item.date}|${docSlug}` : key1;
  const held = mergedByUrlSlug.get(key2);
  mergedByUrlSlug.set(key2, held ? keepMoreSpecific(item, held) : item);
}

// Pass 3 (hand-curated): three more Leo XIII documents are the same act filed under
// entirely different printed incipits on the encyclicals/letters shelves, with
// different URL document-slugs too -- so neither pass 1 nor pass 2 catches them.
// Proven instead by comparing the full texts against vatican.va (DUPLICATE_MERGES,
// mapping tables). Re-keys every item on its own canonical (pageSlug, incipit-slug,
// date) -- substituting the dropped item's incipit for the kept one's where the table
// says so -- rather than reusing pass 2's map key, whose format varies depending on
// whether a URL document-slug was found and so cannot be relied on to already agree
// between a dup-table hit and its untouched merge partner.
const mergedByDuplicateTable = new Map<string, HarvestItem>();
for (const item of mergedByUrlSlug.values()) {
  const dupKey = `${item.pageSlug}|${item.shelf}|${slugify(item.incipit ?? item.title)}|${item.date}`;
  const dup = DUPLICATE_MERGES[dupKey];
  const canonicalIncipit = dup ? dup.mergeIntoIncipit : (item.incipit ?? item.title);
  const key3 = `${item.pageSlug}|${slugify(canonicalIncipit)}|${item.date}`;
  const held = mergedByDuplicateTable.get(key3);
  mergedByDuplicateTable.set(key3, held ? keepMoreSpecific(item, held) : item);
}
console.log(`${items.length} items -> ${mergedByDuplicateTable.size} documents after cross-shelf dedupe`);

// Anything still sharing (pageSlug, date) across two different shelves escaped all
// three merge passes above: neither the printed incipit, the URL slug, nor the
// hand-curated duplicate table accounted for it. That does not mean they are the same
// document -- it means a human must look. Surface every such pair loudly rather than
// silently keeping (or silently dropping) either one, unless the pair has been adjudicated
// as genuinely distinct and should not warn.
const byPageDate = new Map<string, HarvestItem[]>();
for (const item of mergedByDuplicateTable.values()) {
  const key = `${item.pageSlug}|${item.date}`;
  byPageDate.set(key, [...(byPageDate.get(key) ?? []), item]);
}
for (const group of byPageDate.values()) {
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const a = group[i]!, b = group[j]!;
      if (a.shelf === b.shelf) continue;
      // Check if this pair is adjudicated as genuinely distinct (and should not warn)
      const slugA = slugify(a.incipit ?? a.title);
      const slugB = slugify(b.incipit ?? b.title);
      // Key uses sorted order of incipits to ensure consistent lookup
      const [slug1, slug2] = slugA < slugB ? [slugA, slugB] : [slugB, slugA];
      const adjudicatedKey = `${a.pageSlug}|${a.date}|${slug1}|${slug2}`;
      if (ADJUDICATED_DISTINCT[adjudicatedKey]) continue;
      console.warn(
        `Unmerged same-date cross-shelf pair on ${a.pageSlug} (${a.date}): `
        + `'${a.incipit ?? a.title}' (${a.shelf}) vs '${b.incipit ?? b.title}' (${b.shelf})`,
      );
    }
  }
}

// Circumscription erections filed under a bare Latin toponym with no textual marker
// (Paul VI, John Paul II, Benedict XVI, Pius XII) cannot be tagged from the index page --
// only flagged for a human to confirm into CIRCUMSCRIPTION_ERECTIONS (spec §4.5). This
// warns; it never writes a keyword itself (that happens, if at all, in toDocument via
// keywordsFor, driven only by the heading text or the curated table).
const candidates = [...mergedByDuplicateTable.values()].filter(isErectionCandidate);
for (const c of candidates) {
  console.warn(
    `Circumscription-erection candidate ${c.pageSlug} ${c.shelf} ${c.date}: '${c.title}'`,
  );
}
if (candidates.length) {
  console.warn(`  ${candidates.length} candidates await confirmation into CIRCUMSCRIPTION_ERECTIONS`);
}

const allDocs = [...mergedByDuplicateTable.values()]
  .map((item) => toDocument(item, retrievedFor(item)));

// Two distinct documents from the same issuer can share both an incipit slug and a year
// without being duplicates -- e.g. Pius X's two unrelated "Constat apprime" apostolic
// letters of 1910 (4 May, granting a domestic-prelate title; 21 June, raising Lviv
// cathedral to a minor basilica). mintId's default year-only suffix then collides; the
// resolution (spec invariant 11) is to re-mint every id in the colliding group with its
// full date, which is always unique since pass 1's merge key already includes it.
// A provisional id already carries its own full date and is never name-based, so it
// cannot collide the way two minted ids can (its own ordinal pass, below, handles its
// one collision mode: two of the same genre on the same date). Only minted records
// participate here.
const collisionGroups = new Map<string, DocumentRecord[]>();
for (const doc of allDocs) {
  if (doc.idStatus !== 'minted') continue;
  const key = `${issuerLocalPart(doc.issuerId)}|${slugify(doc.incipit ?? doc.title)}|${doc.date.slice(0, 4)}`;
  collisionGroups.set(key, [...(collisionGroups.get(key) ?? []), doc]);
}
for (const group of collisionGroups.values()) {
  if (group.length < 2) continue;
  for (const doc of group) {
    doc.id = mintId(doc.issuerId, doc.incipit ?? doc.title, doc.date, { fullDate: true });
  }
}

const byIssuer = new Map<string, DocumentRecord[]>();
for (const doc of allDocs) {
  const key = issuerLocalPart(doc.issuerId);
  byIssuer.set(key, [...(byIssuer.get(key) ?? []), doc]);
}

// See ordinals.ts for the ordinal-assignment rules (dense, 1-based, sorted by title).
for (const docs of byIssuer.values()) {
  assignProvisionalOrdinals(docs);
}

// A provisional id names a document the incipit rules could not name -- a curation
// queue, surfaced loudly rather than silently, one warning per record plus a per-issuer
// tally.
for (const [issuer, docs] of byIssuer) {
  for (const d of docs.filter((d) => d.idStatus === 'provisional')) {
    console.warn(
      `Provisional id (no incipit recoverable) ${d.issuerId} `
      + `${d.source?.shelf ?? 'flat'} ${d.date}: '${d.title}'`,
    );
  }
  const n = docs.filter((d) => d.idStatus === 'provisional').length;
  if (n > 0) console.warn(`  ${issuer}: ${n} of ${docs.length} provisional`);
}

// Regenerate from scratch so a stale file from a removed reassignment cannot linger
// and be read as live data by the validator or renderer.
if (existsSync('data/documents')) rmSync('data/documents', { recursive: true });
mkdirSync('data/documents', { recursive: true });
for (const [key, docs] of byIssuer) {
  // Codepoint order, not locale collation -- see ordinals.ts for why: this sort determines
  // the byte order of a checked-in data/documents/*.json file, so it must be identical on
  // every machine and CI runner regardless of ICU data or LANG. `date` (ISO) and `id` are
  // both plain ASCII, so `<`/`>` is a correct, locale-independent stand-in.
  docs.sort((a, b) => (a.date === b.date
    ? (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)
    : (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)));
  writeFileSync(`data/documents/${key}.json`, JSON.stringify(docs, null, 2) + '\n');
  console.log(`${key}: ${docs.length}`);
}
