import { readFileSync, writeFileSync, mkdirSync, existsSync, rmSync } from 'node:fs';
import { parseFlatIndex } from './flat.js';
import { parseShelfIndex } from './shelf.js';
import { toDocument } from './toDocument.js';
import { PILOT_POPES, SHELVES, DATE_CORRECTIONS } from '../mappings/index.js';
import { issuerLocalPart } from '../ids.js';
import { slugify } from '../slug.js';
import type { DocumentRecord, HarvestItem } from '../types.js';

/** Most specific shelf first: a document filed twice keeps the more specific genre. */
const SHELF_SPECIFICITY = [
  'encyclicals', 'apost_constitutions', 'apost_letters', 'bulls',
  'briefs', 'motu_proprio', 'letters', 'speeches',
];
const rank = (shelf: string | null) => {
  // A flat-era (null) shelf and an unrecognised one both fall through to the same
  // least-specific rank; indexOf's own -1-for-not-found already covers a null shelf
  // once it is fed the empty string, so no separate branch is needed for it.
  const i = SHELF_SPECIFICITY.indexOf(shelf ?? '');
  return i === -1 ? SHELF_SPECIFICITY.length : i;
};

/** Keep the more specific shelf, folding the other's shelf into alsoShelvedAs. */
function keepMoreSpecific(a: HarvestItem, b: HarvestItem): HarvestItem {
  const [keep, drop] = rank(a.shelf) < rank(b.shelf) ? [a, b] : [b, a];
  const seen = new Set([...(keep.alsoShelvedAs ?? []), ...(drop.alsoShelvedAs ?? [])]);
  if (drop.shelf) seen.add(drop.shelf);
  return { ...keep, alsoShelvedAs: [...seen].sort() };
}

/** The trailing document slug of a resolved vatican.va URL, e.g. `hf_..._05051888_in-plurimis.html`
 *  -> `in-plurimis`. Null when the URL is absent or does not carry the `_{DDMMYYYY|YYYYMMDD}_` shape. */
function urlDocSlug(url: string | null): string | null {
  const m = url?.match(/_\d{8}_([a-z0-9-]+)\.html/);
  return m ? m[1]! : null;
}

const RETRIEVED = process.env.RETRIEVED ?? new Date().toISOString().slice(0, 10);
const fixture = (n: string) => readFileSync(`tools/fixtures/${n}.html`, 'utf8');

const items: HarvestItem[] = [];
for (const pope of PILOT_POPES) {
  if (pope.era === 'flat') {
    items.push(...parseFlatIndex(fixture(pope.pageSlug), pope.pageSlug));
  } else {
    for (const shelf of SHELVES) {
      items.push(...parseShelfIndex(fixture(`${pope.pageSlug}-${shelf}`), pope.pageSlug, shelf));
    }
  }
}

// Hand-curated corrections to demonstrable transcription errors on the source pages
// (spec §5.2, mapping tables). Applied before dedupe so the corrected date participates
// in the merge key; the adapters themselves stay pure readers of what the page prints.
// DATE_CORRECTIONS keys on the *printed* date (what the adapters emit above);
// CONCILIAR_REASSIGNMENTS (applied later, in toDocument) keys on the *corrected* one.
for (const [i, item] of items.entries()) {
  const correctionKey = `${item.pageSlug}|${item.shelf}|${slugify(item.incipit)}|${item.date}`;
  const correction = DATE_CORRECTIONS[correctionKey];
  if (correction) items[i] = { ...item, date: correction.date };
}

// The vatican.va shelves are not disjoint. Pass 1: a document filed under the same
// incipit and date on two shelves (seven Leo XIII cases) merges on (pageSlug, incipit-slug,
// date). Keep the most specific shelf and remember the rest.
const merged = new Map<string, HarvestItem>();
for (const item of items) {
  const key = `${item.pageSlug}|${slugify(item.incipit)}|${item.date}`;
  const held = merged.get(key);
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
console.log(`${items.length} items -> ${mergedByUrlSlug.size} documents after cross-shelf dedupe`);

// Anything still sharing (pageSlug, date) across two different shelves escaped both
// merge passes above: neither the printed incipit nor the URL slug agreed. That does
// not mean they are the same document -- it means a human must look. Surface every
// such pair loudly rather than silently keeping (or silently dropping) either one.
const byPageDate = new Map<string, HarvestItem[]>();
for (const item of mergedByUrlSlug.values()) {
  const key = `${item.pageSlug}|${item.date}`;
  byPageDate.set(key, [...(byPageDate.get(key) ?? []), item]);
}
for (const group of byPageDate.values()) {
  for (let i = 0; i < group.length; i++) {
    for (let j = i + 1; j < group.length; j++) {
      const a = group[i]!, b = group[j]!;
      if (a.shelf === b.shelf) continue;
      console.warn(
        `Unmerged same-date cross-shelf pair on ${a.pageSlug} (${a.date}): `
        + `'${a.incipit}' (${a.shelf}) vs '${b.incipit}' (${b.shelf})`,
      );
    }
  }
}

const byIssuer = new Map<string, DocumentRecord[]>();
for (const item of mergedByUrlSlug.values()) {
  const doc = toDocument(item, RETRIEVED);
  const key = issuerLocalPart(doc.issuerId);
  byIssuer.set(key, [...(byIssuer.get(key) ?? []), doc]);
}

// Regenerate from scratch so a stale file from a removed reassignment cannot linger
// and be read as live data by the validator or renderer.
if (existsSync('data/documents')) rmSync('data/documents', { recursive: true });
mkdirSync('data/documents', { recursive: true });
for (const [key, docs] of byIssuer) {
  docs.sort((a, b) => (a.date === b.date ? a.id.localeCompare(b.id) : a.date.localeCompare(b.date)));
  writeFileSync(`data/documents/${key}.json`, JSON.stringify(docs, null, 2) + '\n');
  console.log(`${key}: ${docs.length}`);
}
