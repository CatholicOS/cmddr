/**
 * The AAS join as the harvest applies it (acta reference spec §4.3; acta volumes spec
 * §3, §5): parse every checked-in index fixture, match their entries to the built
 * documents, and write `acta` on every matched document. The fixtures are a checked-in
 * input like every other, so `npm run harvest` stays byte-deterministic.
 */
import { readFileSync, existsSync } from 'node:fs';
import { parseActaIndex, type ActaEntry, type ActaParseResult } from './index.js';
import { matchActa, type ActaMatchResult } from './match.js';
import type { DocumentRecord } from '../types.js';

/**
 * One index source: an annual *Index generalis* PDF (`kind: 'index'`, extracted whole)
 * or the chronological-index pages of a whole-volume OCR PDF (`kind: 'volume'`,
 * extracted in pypdf's layout mode; tools/fetch-acta.sh). `url` is the PDF a document
 * created from the source cites as `source.url`: the whole-volume PDF for 1909-2002, and
 * null for the fascicle era, where the monthly fascicle holding a page is not derivable
 * from the index (AAS-only documents spec §4). `retrieved` is the fixture's fetch date
 * (tools/fixtures/acta/README.md), stamped as `source.retrieved` on those documents;
 * update both together when a fixture is refreshed (the RETRIEVED override the pope
 * fixtures honour applies here too).
 */
export interface ActaSource {
  /** The key the reports and tests use: the volume year, with the part for a double volume (`1917-I`). */
  key: string;
  year: number;
  volume: number;
  part?: 'I' | 'II';
  kind: 'index' | 'volume';
  file: string;
  url: string | null;
  retrieved: string;
  /** The parser options the fixture needs (index.ts): the columnar layout, and whether bare incipits are printed. */
  parse: { columnar: boolean; bareIncipits: boolean };
}

const VOLUME_URL = (vol: number, year: number, part?: 'I' | 'II') =>
  `https://www.vatican.va/archive/aas/documents/AAS-${String(vol).padStart(2, '0')}-${part ? `${part}-` : ''}${year}-ocr.pdf`;
const volume = (year: number, retrieved: string, extra: Partial<ActaSource> = {}): ActaSource => {
  const vol = year - 1908;
  const part = extra.part;
  return {
    key: part ? `${year}-${part}` : `${year}`, year, volume: vol, ...(part ? { part } : {}), kind: 'volume',
    file: `tools/fixtures/acta/aas-${String(vol).padStart(2, '0')}-${year}${part ? `-${part}` : ''}.txt`,
    url: VOLUME_URL(vol, year, part), retrieved,
    parse: { columnar: true, bareIncipits: true },
    ...extra,
  };
};
const index = (year: number, retrieved: string): ActaSource => ({
  key: `${year}`, year, volume: year - 1908, kind: 'index',
  file: `tools/fixtures/acta/aas-indice-${year}.txt`, url: null, retrieved,
  parse: { columnar: false, bareIncipits: true },
});

/**
 * Every source with a fixture, in volume order. The six sources of phase 2b-i (the
 * sample of the acta volumes spec §5) precede the ten annual index PDFs of phase 1.
 * AAS 9 (1917) part II is the *Codex Iuris Canonici* itself and carries no chronological
 * index (its one papal act, *Providentissima Mater Ecclesia*, is on the bulls shelf as
 * `mag:benedict-xv/providentissima-mater-1917`), so only part I has a fixture.
 */
export const ACTA_SOURCES: readonly ActaSource[] = [
  // AAS 1: the page column is cropped from the scan on most index pages, and the index
  // prints incipits only in guillemets after a genre word (`Constitutio « Promulgandi »`),
  // describing every other act without one -- measured on the fixture, sample report §2.
  volume(1909, '2026-09-13', { parse: { columnar: true, bareIncipits: false } }),
  volume(1917, '2026-09-13', { part: 'I' }),
  volume(1931, '2026-09-13'),
  volume(1958, '2026-09-13'),
  volume(1978, '2026-09-13'),
  index(2012, '2026-09-13'),
  ...[2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024].map((y) => index(y, '2026-09-12')),
];

/** The years whose annual *Index generalis* vatican.va publishes as a separate PDF and phase 1 joined. */
export const ACTA_YEARS: readonly number[] = ACTA_SOURCES.filter((s) => s.kind === 'index' && s.year >= 2015).map((s) => s.year);

export const actaSource = (key: string): ActaSource | undefined => ACTA_SOURCES.find((s) => s.key === key);
export const sourceKeyOf = (e: { year: number; part?: 'I' | 'II' }): string => (e.part ? `${e.year}-${e.part}` : `${e.year}`);
/** The source an entry was parsed from. */
export const sourceOfEntry = (e: { year: number; part?: 'I' | 'II' }): ActaSource | undefined => actaSource(sourceKeyOf(e));

/**
 * The date the ten phase-1 index fixtures were fetched (tools/fixtures/acta/README.md).
 * Kept for the tests that pin it; every source carries its own `retrieved` above.
 */
export const ACTA_FIXTURES_RETRIEVED = '2026-09-12';

/** Parse every fixture present; a missing one is skipped and named, not fatal. */
export function loadActaIndexes(sources: readonly ActaSource[] = ACTA_SOURCES): { parsed: Map<string, ActaParseResult>; missing: string[] } {
  const parsed = new Map<string, ActaParseResult>();
  const missing: string[] = [];
  for (const s of sources) {
    if (!existsSync(s.file)) { missing.push(s.key); continue; }
    parsed.set(s.key, parseActaIndex(readFileSync(s.file, 'utf8'), {
      year: s.year, volume: s.volume, ...(s.part ? { part: s.part } : {}), ...s.parse,
    }));
  }
  return { parsed, missing };
}

export interface ActaJoin {
  parsed: Map<string, ActaParseResult>;
  missing: string[];
  entries: ActaEntry[];
  result: ActaMatchResult;
}

/**
 * Match every parsed entry against `docs` and write `acta` on the matched documents.
 * Matching runs over all sources at once so a document claimed by two sources' entries
 * is a conflict (match.ts) rather than a silent overwrite.
 */
export function applyActa(docs: DocumentRecord[]): ActaJoin {
  const { parsed, missing } = loadActaIndexes();
  const entries = [...parsed.values()].flatMap((p) => p.entries);
  const result = matchActa(entries, docs);
  const byId = new Map(docs.map((d) => [d.id, d]));
  for (const m of result.matches) {
    const { series, volume, year, part, page } = m.entry;
    byId.get(m.documentId)!.acta = { series, volume, year, ...(part ? { part } : {}), page };
  }
  return { parsed, missing, entries, result };
}
