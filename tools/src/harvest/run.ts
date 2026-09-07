import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
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
  const i = shelf === null ? -1 : SHELF_SPECIFICITY.indexOf(shelf);
  return i === -1 ? SHELF_SPECIFICITY.length : i;
};

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
for (const item of items) {
  const correctionKey = `${item.pageSlug}|${item.shelf}|${slugify(item.incipit)}|${item.date}`;
  const correction = DATE_CORRECTIONS[correctionKey];
  if (correction) item.date = correction.date;
}

// The vatican.va shelves are not disjoint: seven Leo XIII documents sit on both the
// encyclicals and the letters shelf. Keep the most specific shelf and remember the rest.
const merged = new Map<string, HarvestItem>();
for (const item of items) {
  const key = `${item.pageSlug}|${slugify(item.incipit)}|${item.date}`;
  const held = merged.get(key);
  if (!held) { merged.set(key, item); continue; }
  const [keep, drop] = rank(item.shelf) < rank(held.shelf) ? [item, held] : [held, item];
  const seen = new Set([...(keep.alsoShelvedAs ?? []), ...(drop.alsoShelvedAs ?? [])]);
  if (drop.shelf) seen.add(drop.shelf);
  merged.set(key, { ...keep, alsoShelvedAs: [...seen].sort() });
}
console.log(`${items.length} items -> ${merged.size} documents after cross-shelf dedupe`);

const byIssuer = new Map<string, DocumentRecord[]>();
for (const item of merged.values()) {
  const doc = toDocument(item, RETRIEVED);
  const key = issuerLocalPart(doc.issuerId);
  byIssuer.set(key, [...(byIssuer.get(key) ?? []), doc]);
}

if (!existsSync('data/documents')) mkdirSync('data/documents', { recursive: true });
for (const [key, docs] of byIssuer) {
  docs.sort((a, b) => (a.date === b.date ? a.id.localeCompare(b.id) : a.date.localeCompare(b.date)));
  writeFileSync(`data/documents/${key}.json`, JSON.stringify(docs, null, 2) + '\n');
  console.log(`${key}: ${docs.length}`);
}
