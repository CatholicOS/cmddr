/**
 * The AAS join as the harvest applies it (acta reference spec §4.3; acta volumes spec
 * §3, §5): parse every checked-in index fixture, match their entries to the built
 * documents, and write `acta` on every matched document. The fixtures are a checked-in
 * input like every other, so `npm run harvest` stays byte-deterministic.
 */
import { readFileSync, existsSync } from 'node:fs';
import { parseActaIndex, type ActaEntry, type ActaParseResult } from './index.js';
import { matchActa, type ActaMatchResult } from './match.js';
import { ACTA_CURATED_REFERENCES, ACTA_PAGE_CORRECTIONS, ACTA_PAGE_READINGS, overrideKey, type CuratedReference } from './curation.js';
import { applyPageCorrections, applyPageRows, sidecarPath, type PagesSidecar } from './recover.js';
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
  /** The key the reports and tests use: the volume year, with the part for a double volume (`1917-I`); for the ASS, `ass-{volume}` (ASS 2 and 3 are both 1867). */
  key: string;
  year: number;
  /** The last year of a two-year ASS volume (ASS 33: 1901); absent otherwise. `acta.year` stays the first (ass volumes spec, decision 3). */
  yearTo?: number;
  volume: number;
  part?: 'I' | 'II';
  /** An annual index PDF, the index pages of an AAS volume, or an ASS volume's synthesised entries (ass.ts). */
  kind: 'index' | 'volume' | 'ass';
  /** The fixture: the extracted index text, or for an `ass` source the entries JSON the scanner writes. */
  file: string;
  /** For an `ass` source, the summa fixture beside the entries. */
  summaFile?: string;
  url: string | null;
  retrieved: string;
  /** The parser options the fixture needs (index.ts): the columnar layout, and whether bare incipits are printed. Unused by an `ass` source. */
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
const ASS_URL = (file: string) => `https://www.vatican.va/archive/ass/documents/${file}`;
/** An ASS volume (ass volumes spec §2): `file` is the PDF's name as the ASS index page links it. */
const ass = (volume: number, year: number, file: string, retrieved: string, yearTo?: number): ActaSource => ({
  key: `ass-${volume}`, year, ...(yearTo !== undefined ? { yearTo } : {}), volume, kind: 'ass',
  file: `tools/fixtures/acta/ass-${String(volume).padStart(2, '0')}-${year}.entries.json`,
  summaFile: `tools/fixtures/acta/ass-${String(volume).padStart(2, '0')}-${year}.summa.txt`,
  url: ASS_URL(file), retrieved,
  parse: { columnar: false, bareIncipits: false },
});

/**
 * Every source with a fixture, in volume order. The six sources of phase 2b-i (the
 * sample of the acta volumes spec §5), the twenty-six volumes of phase 2b-ii-a (AAS
 * 24-49, 1932-1957), the nineteen of phase 2b-ii-b (AAS 51-69, 1959-1977; spec §9) and
 * the twenty-four of phase 2b-ii-c (AAS 71-94, 1979-2002, with the index PDFs of 2010,
 * 2011, 2013 and 2014), and the seven index PDFs of 2003-2009 (phase 2b', spec §11)
 * precede the ten annual index PDFs of phase 1.
 * AAS 9 (1917) part II is the *Codex Iuris Canonici* itself and carries no chronological
 * index (its one papal act, *Providentissima Mater Ecclesia*, is on the bulls shelf as
 * `mag:benedict-xv/providentissima-mater-1917`), so only part I has a fixture.
 * The five ASS volumes of phase 2c-i (ass volumes spec §2) come first, keyed by volume.
 */
export const ACTA_SOURCES: readonly ActaSource[] = [
  // Phase 2c-i (ass volumes spec §2): the five sample volumes of the Acta Sanctae Sedis --
  // one a decade, every pope of the series -- read from the entries the scanner writes
  // (ass.ts, tools/scan-ass.ts), not from an index the volumes never print.
  ass(1, 1865, 'ASS-01-1865-66-ocr.pdf', '2026-09-21', 1866),
  ass(12, 1879, 'ASS-12-1879-ocr.pdf', '2026-09-21'),
  ass(23, 1890, 'ASS-23-1890-91-ocr.pdf', '2026-09-21', 1891),
  ass(33, 1900, 'ASS-33-1900-1-ocr.pdf', '2026-09-21', 1901),
  ass(41, 1908, 'ASS-41-1908-ocr.pdf', '2026-09-21'),
  // Phase 2b-iii-b (spec §10): AAS 1-17, the volumes of 1909-1925, whose OCR lost the page
  // column on most index pages -- the pages come back from the volume body through the
  // sidecars (recover.ts). 1909 and 1917-I, the sample's, re-extracted on 2026-09-20 with
  // the interleaving fallback of 2b-ii-b. AAS 1 prints incipits only in guillemets after
  // a genre word (sample report §2), hence `bareIncipits: false`.
  volume(1909, '2026-09-20', { parse: { columnar: true, bareIncipits: false } }),
  ...Array.from({ length: 1916 - 1910 + 1 }, (_, i) => volume(1910 + i, '2026-09-20')),
  volume(1917, '2026-09-20', { part: 'I' }),
  ...Array.from({ length: 1925 - 1918 + 1 }, (_, i) => volume(1918 + i, '2026-09-20')),
  // Phase 2b-iii-a (spec §10): the early volumes whose OCR kept the page column -- AAS
  // 18-22 (1926-1930, Pius XI). The volumes of 1910-1925 lost it on most index pages and
  // wait for the page recovery of 2b-iii-b.
  ...Array.from({ length: 1930 - 1926 + 1 }, (_, i) => volume(1926 + i, '2026-09-18')),
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
  // Phase 2b' (spec §11): the annual index PDFs of 2003-2009, served at
  // `documents/AAS-Index-2002-2009/AAS-Index-{year}.pdf` where the index page links them
  // wrongly, extracted in the layout mode with the spaces collapsed (the fixtures README).
  // John Paul II to 2005, Benedict XVI from 2005. Both popes' acts are indexed in 2005 and
  // in 2006, but only 2005 gives each a numbered part of its own (`I - ACTA IOANNIS PAULI
  // PP. II`, `II - ACTA BENEDICTI PP. XVI`); 2006 prints the two headings bare, under the
  // one part `I - ACTA SUMMI PONTIFICIS` (`ACTA BENEDICTI XVI`, `ACTA IOANNIS PAULI II`,
  // aas-indice-2006.txt ll. 128 and 476), and the parser reads both as pope headings.
  // `url` is null as for every index PDF: the fascicle holding a page is not
  // derivable from the index.
  // These seven are set in the narrow column of 2010-2011, not the wide one of 2012-2024,
  // so they take the same `fullLine: 40`. Without it an entry whose page follows one space
  // at the end of a *short* continuation line is never closed: the parser reports it as an
  // entry without a page and drops it, and the line counts in neither term of the parse
  // rate, so the loss is silent (`» Dec. 2 « Humiliter in Christo ». - Venerabili Dei Servae
  // Lindalvae / Justo de Oliveira caelitum Beatorum tribuitur dignitas 619`, 2008). Measured
  // over the seven fixtures, entry by entry (task 5 report §2 and its fix report): with the
  // option, 20 of the 21 pageless entries come back -- 13 of them in categories the registry
  // harvests -- and not one entry of any year changes or is lost (the entry sets are strict
  // supersets). Being read is not the same as reaching a record: of those 13, five match a
  // shelf document (among them the constitution *In Kyrgyzstania*, AAS 98 (2006) 308) and
  // three are created, while one is held on an unharvested shelf and four reach no record at
  // all -- the constitution *Maturescens Catholica* (AAS 95 (2003) 381) and the letters *Qui
  // autem pespexerit* (96 (2004) 524) and *Da, mihi, Iesu* (97 (2005) 23) are held
  // `ambiguous` against several shelf records of their class and date, and *Iesus "cum
  // dilexisset"* (98 (2006) 660) `ocr-damaged`. What the option buys them is that they are
  // now read and held with a reason instead of vanishing; releasing them is curation. No other
  // fixture can move: `fullLine` is a per-source option, carried by 2010, 2011 and these
  // seven alone. The one entry still not closed is 2006's journey line, where the layout
  // mode fused a page to the next journey's opener (ITINERA APOSTOLICA, not harvested).
  ...[2003, 2004, 2005, 2006, 2007, 2008, 2009].map((y) => index(y, '2026-09-21', { fullLine: 40 })),
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
export const sourceKeyOf = (e: { series?: string; volume?: number; year: number; part?: 'I' | 'II' }): string =>
  e.series === 'ASS' ? `ass-${e.volume}` : e.part ? `${e.year}-${e.part}` : `${e.year}`;
/** The source an entry was parsed from (or, for the ASS, scanned into). */
export const sourceOfEntry = (e: { series?: string; volume?: number; year: number; part?: 'I' | 'II' }): ActaSource | undefined => actaSource(sourceKeyOf(e));

/**
 * The date the ten phase-1 index fixtures were fetched (tools/fixtures/acta/README.md).
 * Kept for the tests that pin it; every source carries its own `retrieved` above.
 */
export const ACTA_FIXTURES_RETRIEVED = '2026-09-12';

/**
 * Parse every fixture present; a missing one is skipped and named, not fatal. Pageless
 * entries then get their pages from the curated readings first, then the sidecar (spec
 * §10.3.3, §10.3.5): a page read by hand outranks one recovered by rule, and a key both
 * name is applied once, from the reading.
 */
export function loadActaIndexes(sources: readonly ActaSource[] = ACTA_SOURCES): { parsed: Map<string, ActaParseResult>; missing: string[] } {
  const parsed = new Map<string, ActaParseResult>();
  const missing: string[] = [];
  for (const s of sources) {
    // An `ass` source's fixture is the entries JSON the scanner writes, not index text: read
    // by Task 5 of phase 2c-i (ass volumes spec §5), skipped here until then so the AAS
    // parser is never fed it.
    if (s.kind === 'ass') continue;
    if (!existsSync(s.file)) { missing.push(s.key); continue; }
    const r = parseActaIndex(readFileSync(s.file, 'utf8'), {
      year: s.year, volume: s.volume, ...(s.part ? { part: s.part } : {}), ...s.parse,
    });
    // The curated readings first, then the sidecar (spec §10.3.3, §10.3.5): a page read by
    // hand outranks one recovered by rule, and a key both name is applied once.
    // A page the index prints wrongly for an entry it dates and names (the OCR's `530` for
    // *Casti connubii* at 539, the index's own `946` for a constitution that opens at 947) is
    // replaced from the curated table first, so the matcher, the creator and the shared-page
    // check see the act's page.
    applyPageCorrections(r, Object.entries(ACTA_PAGE_CORRECTIONS).filter(([k]) => k.startsWith(`${s.key}|`))
      .map(([k, v]) => ({ key: k.slice(s.key.length + 1), printed: v.printed, page: v.page })), 'ACTA_PAGE_CORRECTIONS');
    const readings = Object.entries(ACTA_PAGE_READINGS).filter(([k]) => k.startsWith(`${s.key}|`))
      .map(([k, v]) => ({ key: k.slice(s.key.length + 1), page: v.page, source: 'reading' as const }));
    applyPageRows(r, readings, 'ACTA_PAGE_READINGS');
    const sidecar = sidecarPath(s);
    if (existsSync(sidecar)) {
      const sc = JSON.parse(readFileSync(sidecar, 'utf8')) as PagesSidecar;
      const read = new Set(readings.map((x) => x.key));
      applyPageRows(r, sc.rows.filter((row) => !read.has(row.key)).map((row) => ({ key: row.key, page: row.page, source: 'recovered' as const })), sidecar);
    }
    parsed.set(s.key, r);
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
 * Match every parsed entry against `docs` and write `acta` on the matched documents,
 * then the curated references (ACTA_CURATED_REFERENCES) on theirs. Matching runs over all
 * sources at once so a document claimed by two sources' entries is a conflict (match.ts)
 * rather than a silent overwrite.
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
  applyCuratedReferences(result, docs);
  return { parsed, missing, entries, result };
}

/**
 * The references no entry can give (ACTA_CURATED_REFERENCES): written after the matches,
 * and never over one -- unless the row names the match it displaces (`supersedes`,
 * controller ruling 15), which then moves from `matches` to `superseded`: not a claim, not
 * a record, listed by the reports beside the reprints. A row naming a document the join
 * matched without naming the match, a `supersedes` key that names no match of the
 * document, a `supersedes` on a row that cites a part or names a two-part volume (the key
 * carries no part), and an id no document carries are each an error. The report tools call this
 * after matchActa, as applyActa does, so their §5 and the data agree.
 */
export function applyCuratedReferences(result: ActaMatchResult, docs: DocumentRecord[], table: Readonly<Record<string, CuratedReference>> = ACTA_CURATED_REFERENCES): void {
  const byId = new Map(docs.map((d) => [d.id, d]));
  for (const [id, row] of Object.entries(table)) {
    const d = byId.get(id);
    if (d === undefined) throw new Error(`ACTA_CURATED_REFERENCES names ${id}, which no document carries`);
    if (row.supersedes !== undefined) {
      // `overrideKey` is series, volume and page -- no part -- so a key of a two-part
      // volume (AAS 9 (1917), AAS 75 (1983)) names one page of each part, and a row that
      // cites a part cannot say which match it displaces: refused until the key carries one.
      const volume = Number(row.supersedes.split(':')[1]);
      if (row.acta.part !== undefined || volume === 9 || volume === 75) {
        throw new Error(`ACTA_CURATED_REFERENCES ${id} supersedes ${row.supersedes} in a two-part volume, but overrideKey carries no part: the match it displaces cannot be named`);
      }
      const i = result.matches.findIndex((m) => m.documentId === id && overrideKey(m.entry) === row.supersedes);
      if (i < 0) throw new Error(`ACTA_CURATED_REFERENCES ${id} supersedes ${row.supersedes}, which the join did not match to it (stale row)`);
      const [m] = result.matches.splice(i, 1);
      result.superseded.push(m!);
    }
    if (result.matches.some((m) => m.documentId === id)) throw new Error(`ACTA_CURATED_REFERENCES names ${id}, which the join also matched`);
    d.acta = { ...row.acta };
  }
}
