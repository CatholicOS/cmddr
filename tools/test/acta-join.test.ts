import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { loadActaIndexes, actaSource, applyCuratedReferences, applyAssReadings, emptyScan, ACTA_SOURCES } from '../src/acta/join.js';
import { ACTA_CURATED_REFERENCES, ACTA_PAGE_CORRECTIONS, ACTA_PAGE_READINGS, ASS_READINGS } from '../src/acta/curation.js';
import { conciliarPartLines } from '../src/acta/conciliar.js';
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

  it('writes the curated references of the two the index cannot enter and the sixteen it enters in the council\'s part, and no other', () => {
    const docs = readdirSync('data/documents').filter((f) => f.endsWith('.json')).flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[]);
    const by = Object.fromEntries(docs.map((d) => [d.id, d]));
    // Phase 2d (acta volumes spec §12): the sixteen conciliar documents, whose entries stand in
    // `ACTA SS. OECUMENICI CONCILII VATICANI II`, a part index.ts reads as a part and skips.
    expect(Object.keys(ACTA_CURATED_REFERENCES).sort()).toEqual([
      'mag:benedict-xv/providentissima-mater-1917',
      'mag:pius-xi/ubi-arcano-dei-consilio-1922',
      'mag:vatican-ii/ad-gentes-1965',
      'mag:vatican-ii/apostolicam-actuositatem-1965',
      'mag:vatican-ii/christus-dominus-1965',
      'mag:vatican-ii/dei-verbum-1965',
      'mag:vatican-ii/dignitatis-humanae-1965',
      'mag:vatican-ii/gaudium-et-spes-1965',
      'mag:vatican-ii/gravissimum-educationis-1965',
      'mag:vatican-ii/inter-mirifica-1963',
      'mag:vatican-ii/lumen-gentium-1964',
      'mag:vatican-ii/nostra-aetate-1965',
      'mag:vatican-ii/optatam-totius-1965',
      'mag:vatican-ii/orientalium-ecclesiarum-1964',
      'mag:vatican-ii/perfectae-caritatis-1965',
      'mag:vatican-ii/presbyterorum-ordinis-1965',
      'mag:vatican-ii/sacrosanctum-concilium-1963',
      'mag:vatican-ii/unitatis-redintegratio-1964',
    ]);
    expect(by['mag:benedict-xv/providentissima-mater-1917']!.acta).toEqual({ series: 'AAS', volume: 9, year: 1917, part: 'II', page: 5 });
    expect(by['mag:john-paul-ii/sacrae-disciplinae-leges-1983']!.acta).toBeUndefined();
    // Controller ruling 15: the Latin printing, not the Italian one the 1923 index's entry matched (AAS 15 (1923) 5).
    expect(by['mag:pius-xi/ubi-arcano-dei-consilio-1922']!.acta).toEqual({ series: 'AAS', volume: 14, year: 1922, page: 673 });
    expect(docs.filter((d) => d.acta?.volume === 15 && d.acta.page === 5)).toEqual([]);
  });

  /**
   * Whether a row's evidence opens by naming the very reference the row cites: its head -- the text
   * before the first quotation -- must begin with the row's volume and year and must name the row's
   * page there.
   *
   * Bounded to the head on purpose. Every row also names the page its act is *subscribed* on, and
   * some name a third page besides, all of them after the head; an unanchored `p. N` is satisfied by
   * any of those, so a row mistyped to its subscription page passed (review round: this test's own
   * first form did, demonstrated on *Christus Dominus* at 696). The head is not required to read
   * `p. N` immediately, since a two-part volume names the part first (`AAS 9 (1917) part II ...
   * opens at p. 5`).
   */
  const citesItsOwnPage = (row: { acta: { volume: number; year: number; page: number }; evidence: string }) => {
    const head = row.evidence.split("'")[0]!;
    // No `\\b` after the closing paren: a paren and the space after it are both non-word, so there is
    // no boundary between them and `\\)\\b` can never match.
    return new RegExp(`^AAS ${row.acta.volume} \\(${row.acta.year}\\)`).test(head)
      && new RegExp(`\\bp\\. ${row.acta.page}\\b`).test(head);
  };

  it('opens every curated reference\'s evidence with the very reference the row cites', () => {
    // A transposed digit between the page read and the page cited would put a reference on a page
    // nothing was read on, and no pipeline check compares the two (phase 2d review focus 1).
    for (const [id, row] of Object.entries(ACTA_CURATED_REFERENCES)) {
      expect(citesItsOwnPage(row), `${id}: ${row.evidence.slice(0, 60)}`).toBe(true);
      expect(row.evidence.length, id).toBeGreaterThan(200);
    }
  });

  it('refuses a row whose cited page is only the page its act was subscribed on', () => {
    // *Christus Dominus* is cited at AAS 58 (1966) 673 and subscribed at p. 696, both quoted in its
    // evidence. Mistyping `page` to the subscription page must not pass.
    const real = ACTA_CURATED_REFERENCES['mag:vatican-ii/christus-dominus-1965']!;
    expect(real.evidence).toContain('subscribed at p. 696');
    expect(citesItsOwnPage(real)).toBe(true);
    expect(citesItsOwnPage({ ...real, acta: { ...real.acta, page: 696 } })).toBe(false);
  });

  /**
   * Whether a row's evidence quotes its index line at the line number it names: `l. 790` must be the
   * 790th line of that fixture as `sed -n 790p` counts it (a form feed does not open a line). The
   * text alone is checked by the test below; a re-extraction that shifted lines would leave the
   * numbers silently wrong (review round, PR #61).
   */
  const quotesItsNumberedLine = (row: { acta: { volume: number; year: number }; evidence: string }) => {
    const m = row.evidence.match(/`(aas-\d\d-\d{4}\.txt)` l\. (\d+), '([^']+)'/);
    if (m === null) return false;
    const numbered = readFileSync(`tools/fixtures/acta/${m[1]}`, 'utf8').split('\n')[Number(m[2]) - 1] ?? '';
    return numbered.replace(/\s+/g, ' ').trim().includes(m[3]!.replace(/\s+/g, ' ').trim());
  };

  it('quotes every conciliar row\'s index line at the fixture line number the row names', () => {
    const conciliar = Object.entries(ACTA_CURATED_REFERENCES).filter(([id]) => id.startsWith('mag:vatican-ii/'));
    expect(conciliar).toHaveLength(16);
    for (const [id, row] of conciliar) expect(quotesItsNumberedLine(row), id).toBe(true);
  });

  it('refuses a row whose named line number is not the line that prints its quote', () => {
    const real = ACTA_CURATED_REFERENCES['mag:vatican-ii/christus-dominus-1965']!;
    expect(quotesItsNumberedLine(real)).toBe(true);
    // Its line is 790; 791 prints the entry below it.
    expect(quotesItsNumberedLine({ ...real, evidence: real.evidence.replace('.txt` l. 790,', '.txt` l. 791,') })).toBe(false);
  });

  it('keeps every conciliar row live: the index line it quotes is still printed in its fixture', () => {
    // The rows are keyed by document id, so nothing else notices if a fixture's conciliar part
    // changes under them (phase 2d review focus 2).
    const conciliar = Object.entries(ACTA_CURATED_REFERENCES).filter(([id]) => id.startsWith('mag:vatican-ii/'));
    expect(conciliar).toHaveLength(16);
    for (const [id, row] of conciliar) {
      const file = `tools/fixtures/acta/aas-${row.acta.volume}-${row.acta.year}.txt`;
      const quoted = row.evidence.match(/`aas-\d\d-\d{4}\.txt` l\. \d+, '([^']+)'/);
      expect(quoted, id).not.toBeNull();
      const line = quoted![1]!.replace(/\s+/g, ' ').trim();
      expect(readFileSync(file, 'utf8').replace(/[ \t]+/g, ' '), `${id} -> ${file}`).toContain(line);
    }
  });

  it('pins the four conciliar parts and the eighteen entries they hold, sixteen of them the registry\'s', () => {
    // Measured 2026-09-27 (spec §12.1): AAS 54 one entry, 56 two, 57 three, 58 twelve. The two no
    // row names are the Fathers' *Nuntius* of 20 October 1962 (AAS 54 (1962) 822) and the *Nuntii a
    // Patribus* of 8 December 1965 (AAS 58 (1966) 10), whose place in the registry is undecided; a
    // nineteenth line means a fixture moved and a row may rest on nothing (review focus 3).
    const parts = [['54', 1962, 1], ['56', 1964, 2], ['57', 1965, 3], ['58', 1966, 12]] as const;
    let total = 0;
    for (const [vol, year, expected] of parts) {
      const lines = conciliarPartLines(readFileSync(`tools/fixtures/acta/aas-${vol}-${year}.txt`, 'utf8'));
      expect(lines.length, `AAS ${vol}`).toBe(expected);
      total += lines.length;
    }
    expect(total).toBe(18);
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
  // The two rows these unit tests exercise, taken from the real table. Phase 2d added sixteen
  // conciliar rows (spec §12), and the guard that refuses `an id no document carries` fires on
  // the first of them against a two-document corpus -- so each test names the rows it means
  // rather than relying on the table holding only these two, or on the order it iterates them.
  const twoRows = () => Object.fromEntries(Object.entries(ACTA_CURATED_REFERENCES).filter(([id]) => !id.startsWith('mag:vatican-ii/')));

  it('moves the match the row supersedes out of the matches and writes the row\'s page', () => {
    const docs = both();
    const result = empty();
    const other: ActaMatch = { entry: entry({ volume: 17, year: 1925, page: 593, incipit: 'Quas primas', date: '1925-12-11' }), documentId: 'mag:pius-xi/quas-primas-1925', by: 'unique' };
    result.matches.push(italian(), other);
    applyCuratedReferences(result, docs, twoRows());
    expect(result.matches).toEqual([other]);
    expect(result.superseded.map((m) => [m.documentId, m.entry.page])).toEqual([['mag:pius-xi/ubi-arcano-dei-consilio-1922', 5]]);
    expect(docs[1]!.acta).toEqual({ series: 'AAS', volume: 14, year: 1922, page: 673 });
    expect(docs[0]!.acta).toEqual({ series: 'AAS', volume: 9, year: 1917, part: 'II', page: 5 });
  });
  it('is a stale row when the supersedes key names no match of the document', () => {
    expect(() => applyCuratedReferences(empty(), both(), twoRows())).toThrow(/supersedes AAS:15:5, which the join did not match to it/);
    const result = empty();
    result.matches.push({ ...italian(), documentId: 'mag:pius-xi/quas-primas-1925' });   // the page matched to another document
    expect(() => applyCuratedReferences(result, both(), twoRows())).toThrow(/stale row/);
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
    expect(() => applyCuratedReferences(result, both(), twoRows())).toThrow(/which the join also matched/);
    const r2 = empty();
    r2.matches.push(italian(), { entry: entry({ volume: 9, year: 1917, part: 'I', page: 5, date: '1917-05-27' }), documentId: 'mag:benedict-xv/providentissima-mater-1917', by: 'unique' });
    expect(() => applyCuratedReferences(r2, both(), twoRows())).toThrow(/providentissima-mater-1917, which the join also matched/);
    expect(() => applyCuratedReferences(empty(), [doc('mag:pius-xi/ubi-arcano-dei-consilio-1922', '1922-12-23')], twoRows())).toThrow(/no document carries/);
  });
});

describe('loadActaIndexes with an ASS source (ass volumes spec §5)', () => {
  it('reads the entries fixture of every ass source into a parse result whose entries are the fixture\'s plus the curated readings, with no pageless entry and the scan\'s defects', () => {
    const sources = ACTA_SOURCES.filter((s) => s.kind === 'ass');
    // 2c-i's five sample volumes, then 2c-ii-b's five of Pius X (spec §10 decision 3).
    // 2c-i's five sample volumes, 2c-ii-b's five of Pius X, then 2c-ii-c's twenty-one of
    // Leo XIII, then 2c-ii-d's ten of Pius IX (spec §10 decision 3). ACTA_SOURCES order,
    // not numeric order.
    expect(sources.map((s) => s.key)).toEqual([
      'ass-1', 'ass-12', 'ass-23', 'ass-33', 'ass-41', 'ass-36',
      'ass-37', 'ass-38', 'ass-39', 'ass-40', 'ass-13', 'ass-14',
      'ass-15', 'ass-16', 'ass-17', 'ass-18', 'ass-19', 'ass-20',
      'ass-21', 'ass-22', 'ass-24', 'ass-25', 'ass-26', 'ass-27',
      'ass-28', 'ass-29', 'ass-30', 'ass-31', 'ass-32', 'ass-34',
      'ass-35', 'ass-2', 'ass-3', 'ass-4', 'ass-5', 'ass-6', 'ass-7',
      'ass-8', 'ass-9', 'ass-10', 'ass-11',
    ]);
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

  it('reads ASS 8\'s two transposed leaves at the pages the volume prints, not the pages the file sets them at (#56 §2)', () => {
    // The store's PDF of ASS 8 has the leaves printed 623 and 625 exchanged: reading order runs
    // PDF 622 -> 625 -> 624 -> 623 -> 626, proved by a word broken across the leaves (PDF 625 ends
    // `... nun-`, PDF 624 opens `cupati`) and by PDF 622 ending `... sinat ab ipso,` where PDF 625
    // opens `nec commoveri ab adversis`. Re-fetched 2026-09-27: byte-identical to the store's copy
    // (sha256 5bc48307...), and vatican.va's ASS index links one file for the volume, so the
    // disorder is the only scan there is.
    //
    // Two consequences, both curated (ASS_READINGS): the scan dated the *Credente Cattolico*
    // letter at printed 622 from the *Mella* brief's dateline on PDF 624, the walk-back having
    // crossed the exchanged leaves, and the brief itself went unread.
    const { parsed } = loadActaIndexes(ACTA_SOURCES.filter((s) => s.key === 'ass-8'));
    const byPage = new Map(parsed.get('ass-8')!.entries.map((e) => [e.page, e]));

    // The letter to the directors of *il Credente cattolico*: its own close is dated 28 June 1875
    // (PDF 625 l. 9, printed 623), not the 22 June the brief carries.
    expect(byPage.get(622)?.date).toBe('1875-06-28');
    expect(byPage.get(622)?.anchor).toBe('reading');

    // The brief to Count Eduardo Arborio Mella, at the page the volume prints it on.
    expect(byPage.get(623)?.date).toBe('1875-06-22');
    expect(byPage.get(623)?.category).toBe('LITTERAE APOSTOLICAE');
    expect(byPage.get(623)?.opening).toMatch(/^Qui animi causa bonas excolunt artes/);
    expect(byPage.get(623)?.anchor).toBe('reading');

    // Neither writes a reference: Pius IX's shelf holds two records dated 1875, neither in June.
    // What they fix is the volume's accounting and a wrong date in committed data.
  });

  it('keys every ASS reading to the page the volume prints, and makes a row say so where that is not the PDF page it was read at', () => {
    // A reading's key is the printed page, never the PDF page (ass volumes spec §10): a scan can set
    // the leaves out of order, as ASS 8's does. A row keyed at a page it was not read at must say
    // which page it was read at, in these words, so the divergence is never silent.
    const disclosing = Object.entries(ASS_READINGS).filter(([, r]) => /the act was read at PDF p\. \d+/.test(r.evidence));
    expect(disclosing.map(([k]) => k)).toEqual(['ASS:8:623']);
    expect(disclosing[0]![1].evidence).toContain('the act was read at PDF p. 625');
    // And that row alone may not be checked against its own running head, which is the artifact:
    // PDF 623 prints `623` where the leaf is the volume's 625, so its evidence argues from reading
    // order instead. All 57 keys were verified against the store on 2026-09-27 (see the table's
    // doc comment); a new row of this shape must be added here deliberately.
    expect(disclosing[0]![1].evidence).toMatch(/reading order/i);
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
