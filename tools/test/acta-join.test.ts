import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { loadActaIndexes, actaSource, applyCuratedReferences, applyAssReadings, emptyScan, ACTA_SOURCES } from '../src/acta/join.js';
import { ACTA_CURATED_REFERENCES, ACTA_PAGE_CORRECTIONS, ACTA_PAGE_READINGS, ASS_READINGS } from '../src/acta/curation.js';
import { categoryForHeading } from '../src/acta/categories.js';
import { pagelessKey, sidecarPath, type PagesSidecar } from '../src/acta/recover.js';
import type { ActaEntry } from '../src/acta/index.js';
import type { ActaMatch, ActaMatchResult } from '../src/acta/match.js';
import type { DocumentRecord } from '../src/types.js';

describe('loadActaIndexes with the sidecars (spec §10.3)', () => {
  it('applies every sidecar of 1909-1925: no row is stale, and every recovered entry carries its source', () => {
    const { parsed } = loadActaIndexes();
    for (const year of [1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925]) {
      const r = parsed.get(String(year))!;
      expect(r, String(year)).toBeDefined();
      expect(r.stats.recovered, String(year)).toBeGreaterThan(0);
      for (const e of r.entries.filter((e) => e.pageSource !== undefined)) expect(e.page, e.incipit ?? e.raw).toBeGreaterThan(0);
    }
    expect(parsed.get('1917-I')!.stats.recovered).toBeGreaterThan(0);
  });
  it('gives a page to one claimant of an incipit only (controller ruling 18): in every sidecar, no two rows of one category and folded incipit share a page, and no row holds the page of a paged entry of the same category and incipit', () => {
    const { parsed } = loadActaIndexes();
    // The group a row claims a page in, as recover.ts keys it: the category id and the incipit's folded words.
    const fold = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/æ/g, 'ae').replace(/œ/g, 'oe').toLowerCase().match(/[a-z]+/g)?.join(' ') ?? '';
    const group = (e: { category: string; incipit: string | null }) => `${categoryForHeading(e.category)?.id ?? e.category}|${fold(e.incipit ?? '')}`;
    let sidecars = 0;
    for (const s of ACTA_SOURCES) {
      if (!existsSync(sidecarPath(s))) continue;
      sidecars++;
      const sc = JSON.parse(readFileSync(sidecarPath(s), 'utf8')) as PagesSidecar;
      const seen = new Map<string, string>();
      for (const r of sc.rows) {
        const k = `${group(r)}|${r.page}`;
        expect(seen.get(k), `${s.key}: ${r.key} shares p. ${r.page} with ${seen.get(k)}`).toBeUndefined();
        seen.set(k, r.key);
      }
      // The entries the index itself paged: those the sidecar and the readings did not supply.
      const paged = parsed.get(s.key)!.entries.filter((e) => e.pageSource === undefined && e.incipit !== null);
      const held = new Set(paged.map((e) => `${group(e)}|${e.page}`));
      for (const r of sc.rows) expect(held.has(`${group(r)}|${r.page}`), `${s.key}: ${r.key} holds p. ${r.page}, the page of a paged entry of its category and incipit`).toBe(false);
    }
    expect(sidecars).toBe(17);
  });
  it('keys every curated reading to a source that exists and applies it as `reading`', () => {
    const { parsed } = loadActaIndexes();
    // Task 9 wrote seventeen: the table is no longer empty, so the loop below is not vacuous.
    expect(Object.keys(ACTA_PAGE_READINGS).length).toBe(17);
    for (const [key, row] of Object.entries(ACTA_PAGE_READINGS)) {
      const [source] = key.split('|');
      expect(actaSource(source!), key).toBeDefined();
      const entry = parsed.get(source!)!.entries.find((e) => `${source}|${pagelessKey(e)}` === key);
      expect(entry, key).toBeDefined();
      expect(entry!.pageSource, key).toBe('reading');
      expect(entry!.page, key).toBe(row.page);
    }
  });
  it('applies every curated page correction: the entry carries the volume\'s page, the printed one beside it, and no other entry of the source cites the corrected page', () => {
    const { parsed } = loadActaIndexes();
    expect(Object.keys(ACTA_PAGE_CORRECTIONS).length).toBe(8);
    for (const [key, row] of Object.entries(ACTA_PAGE_CORRECTIONS)) {
      const [source] = key.split('|');
      expect(actaSource(source!), key).toBeDefined();
      const entry = parsed.get(source!)!.entries.find((e) => `${source}|${pagelessKey(e)}` === key);
      expect(entry, key).toBeDefined();
      expect(entry!.pageSource, key).toBe('corrected');
      expect(entry!.page, key).toBe(row.page);
      expect(entry!.printedPage, key).toBe(row.printed);
      expect(parsed.get(source!)!.entries.filter((e) => e.page === row.page && e.part === entry!.part), key).toHaveLength(1);
    }
  });

  it('writes the curated references of the Code\'s constitution and of Ubi arcano Dei, and no other', () => {
    const docs = readdirSync('data/documents').filter((f) => f.endsWith('.json')).flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[]);
    const by = Object.fromEntries(docs.map((d) => [d.id, d]));
    expect(Object.keys(ACTA_CURATED_REFERENCES).sort()).toEqual(['mag:benedict-xv/providentissima-mater-1917', 'mag:pius-xi/ubi-arcano-dei-consilio-1922']);
    expect(by['mag:benedict-xv/providentissima-mater-1917']!.acta).toEqual({ series: 'AAS', volume: 9, year: 1917, part: 'II', page: 5 });
    expect(by['mag:john-paul-ii/sacrae-disciplinae-leges-1983']!.acta).toBeUndefined();
    // Controller ruling 15: the Latin printing, not the Italian one the 1923 index's entry matched (AAS 15 (1923) 5).
    expect(by['mag:pius-xi/ubi-arcano-dei-consilio-1922']!.acta).toEqual({ series: 'AAS', volume: 14, year: 1922, page: 673 });
    expect(docs.filter((d) => d.acta?.volume === 15 && d.acta.page === 5)).toEqual([]);
  });
});

describe('applyCuratedReferences (controller ruling 15: a curated reference may displace the match it names)', () => {
  const entry = (over: Partial<ActaEntry>): ActaEntry => ({
    series: 'AAS', volume: 15, year: 1923, page: 5, pope: 'Pius XI', category: 'LITTERAE ENCYCLICAE', date: '1922-12-23',
    incipit: 'Fin dal primo momento', quoted: false, toponym: null, description: 'Ai venerabili fratelli', raw: '1922 dec. 23 Fin dal primo momento', ...over,
  });
  const doc = (id: string, date: string): DocumentRecord => ({ id, title: id, idStatus: 'minted', genre: 'encyclical', issuerId: 'rp:pius-xi', issuerType: 'pope', date });
  const empty = (): ActaMatchResult => ({ matches: [], ambiguous: [], unmatched: [], skipped: [], unknownPope: [], conflicts: [], reprints: [], sharedPages: [], superseded: [] });
  const both = () => [doc('mag:benedict-xv/providentissima-mater-1917', '1917-05-27'), doc('mag:pius-xi/ubi-arcano-dei-consilio-1922', '1922-12-23')];
  const italian = (): ActaMatch => ({ entry: entry({}), documentId: 'mag:pius-xi/ubi-arcano-dei-consilio-1922', by: 'unique' });

  it('moves the match the row supersedes out of the matches and writes the row\'s page', () => {
    const docs = both();
    const result = empty();
    const other: ActaMatch = { entry: entry({ volume: 17, year: 1925, page: 593, incipit: 'Quas primas', date: '1925-12-11' }), documentId: 'mag:pius-xi/quas-primas-1925', by: 'unique' };
    result.matches.push(italian(), other);
    applyCuratedReferences(result, docs);
    expect(result.matches).toEqual([other]);
    expect(result.superseded.map((m) => [m.documentId, m.entry.page])).toEqual([['mag:pius-xi/ubi-arcano-dei-consilio-1922', 5]]);
    expect(docs[1]!.acta).toEqual({ series: 'AAS', volume: 14, year: 1922, page: 673 });
    expect(docs[0]!.acta).toEqual({ series: 'AAS', volume: 9, year: 1917, part: 'II', page: 5 });
  });
  it('is a stale row when the supersedes key names no match of the document', () => {
    expect(() => applyCuratedReferences(empty(), both())).toThrow(/supersedes AAS:15:5, which the join did not match to it/);
    const result = empty();
    result.matches.push({ ...italian(), documentId: 'mag:pius-xi/quas-primas-1925' });   // the page matched to another document
    expect(() => applyCuratedReferences(result, both())).toThrow(/stale row/);
  });
  it('refuses a `supersedes` on a row that cites a part or names a two-part volume: overrideKey carries no part, so the displaced match cannot be named (Task 9 review)', () => {
    const sacrae = doc('mag:john-paul-ii/sacrae-disciplinae-leges-1983', '1983-01-25');
    const partRow = { 'mag:john-paul-ii/sacrae-disciplinae-leges-1983': { acta: { series: 'AAS' as const, volume: 75, year: 1983, part: 'II' as const, page: 7 }, supersedes: 'AAS:75:7', evidence: 'test' } };
    const volumeRow = { 'mag:john-paul-ii/sacrae-disciplinae-leges-1983': { acta: { series: 'AAS' as const, volume: 76, year: 1984, page: 7 }, supersedes: 'AAS:9:7', evidence: 'test' } };
    for (const rows of [partRow, volumeRow]) {
      const result = { ...empty(), matches: [{ entry: entry({ volume: 75, year: 1983, part: 'II', page: 7 }), documentId: sacrae.id, by: 'unique' as const }] };
      expect(() => applyCuratedReferences(result, [sacrae], rows)).toThrow(/overrideKey carries no part/);
    }
    // The table's own rows pass: the part-bearing row has no `supersedes`, the superseding row no part.
    expect(Object.entries(ACTA_CURATED_REFERENCES).filter(([, r]) => r.supersedes !== undefined && (r.acta.part !== undefined || [9, 75].includes(Number(r.supersedes.split(':')[1]))))).toEqual([]);
  });
  it('still refuses a row on a document the join matched elsewhere, and an id no document carries', () => {
    const result = empty();
    result.matches.push(italian(), { entry: entry({ volume: 14, year: 1922, page: 673, incipit: 'Ubi arcano Dei consilio' }), documentId: 'mag:pius-xi/ubi-arcano-dei-consilio-1922', by: 'incipit' });
    expect(() => applyCuratedReferences(result, both())).toThrow(/which the join also matched/);
    const r2 = empty();
    r2.matches.push(italian(), { entry: entry({ volume: 9, year: 1917, part: 'I', page: 5, date: '1917-05-27' }), documentId: 'mag:benedict-xv/providentissima-mater-1917', by: 'unique' });
    expect(() => applyCuratedReferences(r2, both())).toThrow(/providentissima-mater-1917, which the join also matched/);
    expect(() => applyCuratedReferences(empty(), [doc('mag:pius-xi/ubi-arcano-dei-consilio-1922', '1922-12-23')])).toThrow(/no document carries/);
  });
});

describe('loadActaIndexes with an ASS source (ass volumes spec §5)', () => {
  it('reads the entries fixture of every ass source into a parse result whose entries are the fixture\'s plus the curated readings, with no pageless entry and the scan\'s defects', () => {
    const sources = ACTA_SOURCES.filter((s) => s.kind === 'ass');
    expect(sources.map((s) => s.key)).toEqual(['ass-1', 'ass-12', 'ass-23', 'ass-33', 'ass-41']);
    const { parsed, missing } = loadActaIndexes(sources);
    expect(missing).toEqual([]);
    for (const s of sources) {
      const r = parsed.get(s.key)!;
      const fixture = JSON.parse(readFileSync(s.file, 'utf8'));
      const readings = Object.keys(ASS_READINGS).filter((k) => k.startsWith(`ASS:${s.volume}:`));
      const replaced = readings.filter((k) => fixture.entries.some((e: { page: number }) => `ASS:${s.volume}:${e.page}` === k)).length;
      expect(r.volume).toBe(s.volume);
      expect(r.year).toBe(s.year);
      expect(r.entries).toHaveLength(fixture.entries.length + readings.length - replaced);
      // ASS 1's scan is empty (acta-ass.test.ts): its three acts are readings, so no source is left without an entry.
      expect(r.entries.length, s.key).toBeGreaterThan(0);
      expect(r.entries.filter((e) => e.anchor === 'reading')).toHaveLength(readings.length);
      expect(r.pageless).toEqual([]);
      expect(r.defects).toHaveLength(fixture.defects.length);
      expect(r.entries.every((e) => e.series === 'ASS' && e.incipit === null && typeof e.opening === 'string')).toBe(true);
      // Sorted by page, the readings in their place.
      expect(r.entries.map((e) => e.page)).toEqual([...r.entries.map((e) => e.page)].sort((a, b) => a - b));
    }
  });
  const reading = { pope: 'Leo XIII', category: 'LITTERAE', date: '1900-01-01', opening: 'a b c', description: 'd', evidence: 'e' };
  const row = { description: 'Litterae', page: 3, raw: 'Litterae 3' };
  it('rejects a reading that answers no finding', () => {
    // A summa with a row, so the scan is not the empty one every reading answers (ASS 1).
    expect(() => applyAssReadings({ ...emptyScan(), summa: { pages: null, rows: [row], claimed: [], unclaimed: [row], omitted: [] } }, 33, 1900, { 'ASS:33:999': reading }))
      .toThrow(/stale reading ASS:33:999/);
    // The unclaimed row's page answers.
    expect(applyAssReadings({ ...emptyScan(), summa: { pages: null, rows: [row], claimed: [], unclaimed: [row], omitted: [] } }, 33, 1900, { 'ASS:33:3': reading }))
      .toMatchObject([{ page: 3, anchor: 'reading', series: 'ASS', volume: 33, year: 1900, incipit: null, opening: 'a b c' }]);
  });
  it('accepts a reading at any page from the previous anchor through a no-heading defect\'s page, which is the dateline\'s, not the heading\'s (the Task 4 ruling)', () => {
    const scanned = (page: number) => ({ ...reading, series: 'ASS' as const, volume: 23, year: 1890, page, incipit: null, quoted: false, toponym: null, raw: '', anchor: 'dateline' as const, evidence: { heading: '', salutation: null, opening: '', dateline: null, header: '' } });
    const scan = { ...emptyScan(), entries: [scanned(518)], defects: [{ page: 526, reason: 'no-heading' as const, lines: [] }], summa: { pages: null, rows: [row], claimed: [], unclaimed: [], omitted: [] } };
    // ASS 23 (1890-91): the motu proprio at p. 522, whose dateline the scanner found at p. 526 (ASS_READINGS).
    expect(applyAssReadings(scan, 23, 1890, { 'ASS:23:522': reading }).map((e) => [e.page, e.anchor])).toEqual([[518, 'dateline'], [522, 'reading']]);
    expect(applyAssReadings(scan, 23, 1890, { 'ASS:23:518': reading }).map((e) => [e.page, e.anchor])).toEqual([[518, 'reading']]);
    expect(applyAssReadings(scan, 23, 1890, { 'ASS:23:526': reading }).map((e) => e.page)).toEqual([518, 526]);
    expect(() => applyAssReadings(scan, 23, 1890, { 'ASS:23:517': reading })).toThrow(/stale reading ASS:23:517/);
    expect(() => applyAssReadings(scan, 23, 1890, { 'ASS:23:527': reading })).toThrow(/stale reading ASS:23:527/);
    // A `no-date` defect answers at its own page only.
    const noDate = { ...scan, defects: [{ page: 526, reason: 'no-date' as const, lines: [] }] };
    expect(() => applyAssReadings(noDate, 23, 1890, { 'ASS:23:522': reading })).toThrow(/stale reading ASS:23:522/);
    // The first no-heading defect of a volume reaches back to page 1.
    const first = { ...scan, entries: [], defects: [{ page: 526, reason: 'no-heading' as const, lines: [] }] };
    expect(applyAssReadings(first, 23, 1890, { 'ASS:23:1': reading }).map((e) => e.page)).toEqual([1]);
  });
  it('accepts every reading of a volume whose scan and summa are both empty (ASS 1)', () => {
    expect(applyAssReadings(emptyScan(), 1, 1865, { 'ASS:1:193': reading, 'ASS:1:744': reading }).map((e) => e.page)).toEqual([193, 744]);
    // Defects alone do not make a scan non-empty: ASS 1's three no-heading defects sit beside no entry and no summa row.
    expect(applyAssReadings({ ...emptyScan(), defects: [{ page: 325, reason: 'no-heading', lines: [] }] }, 1, 1865, { 'ASS:1:744': reading }).map((e) => e.page)).toEqual([744]);
  });
});
