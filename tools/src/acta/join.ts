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
  parse: { columnar: boolean; bareIncipits: boolean; fullLine?: 40 | 55 };
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
const index = (year: number, retrieved: string, extra: Partial<ActaSource['parse']> = {}): ActaSource => ({
  key: `${year}`, year, volume: year - 1908, kind: 'index',
  file: `tools/fixtures/acta/aas-indice-${year}.txt`, url: null, retrieved,
  parse: { columnar: false, bareIncipits: true, ...extra },
});

/**
 * Every source with a fixture, in volume order. The six sources of phase 2b-i (the
 * sample of the acta volumes spec §5), the twenty-six volumes of phase 2b-ii-a (AAS
 * 24-49, 1932-1957), the nineteen of phase 2b-ii-b (AAS 51-69, 1959-1977; spec §9) and
 * the twenty-four of phase 2b-ii-c (AAS 71-94, 1979-2002, with the index PDFs of 2010,
 * 2011, 2013 and 2014) precede the ten annual index PDFs of phase 1.
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
  // Phase 2b-ii-a (acta volumes spec §9): AAS 24-49, the volumes of 1932-1957 -- Pius XI to
  // his death in February 1939, Pius XII from his election (AAS 31, 1939, carries both).
  ...Array.from({ length: 1957 - 1932 + 1 }, (_, i) => volume(1932 + i, '2026-09-13')),
  volume(1958, '2026-09-13'),
  // Phase 2b-ii-b (spec §9): AAS 51-69, the volumes of 1959-1977 -- John XXIII (AAS 51
  // opens with Pius XII's last acts) to Paul VI (AAS 55, 1963, carries both).
  ...Array.from({ length: 1977 - 1959 + 1 }, (_, i) => volume(1959 + i, '2026-09-13')),
  volume(1978, '2026-09-13'),
  // Phase 2b-ii-c (spec §9): AAS 71-94, the volumes of 1979-2002 -- John Paul II from his
  // first full year -- and the index PDFs of 2010, 2011, 2013 and 2014 (Benedict XVI; the
  // 2013 index carries Francis's first year too). AAS 75 (1983) is a double volume whose
  // part II is the *Codex Iuris Canonici* of 1983 (355 pages: *Sacrae disciplinae leges* of
  // 25 January 1983 at pp. VII-XIV, the Code, its index, and an appendix of corrigenda of
  // 22 September 1983) with no chronological index, as AAS 9-II is the Code of 1917; only
  // part I has a fixture, and every 1983 reference carries `part: "I"`. The index page
  // names the 1983 parts after the year (`AAS-75-1983-I-ocr.pdf`), where 1917's come
  // before it (`AAS-09-I-1917-ocr.pdf`): the URL is the page's, not a pattern's.
  ...Array.from({ length: 1982 - 1979 + 1 }, (_, i) => volume(1979 + i, '2026-09-13')),
  volume(1983, '2026-09-13', { part: 'I', url: 'https://www.vatican.va/archive/aas/documents/AAS-75-1983-I-ocr.pdf' }),
  ...Array.from({ length: 2002 - 1984 + 1 }, (_, i) => volume(1984 + i, '2026-09-13')),
  // The 2010 and 2011 index PDFs are set in a narrower column than 2012-2024 (their full
  // lines run to 40-60 characters), so a page after one space closes a line of 40 (index.ts).
  index(2010, '2026-09-13', { fullLine: 40 }),
  index(2011, '2026-09-13', { fullLine: 40 }),
  index(2012, '2026-09-13'),
  index(2013, '2026-09-13'),
  index(2014, '2026-09-13'),
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
