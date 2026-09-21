import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { loadActaIndexes, actaSource, applyCuratedReferences } from '../src/acta/join.js';
import { ACTA_CURATED_REFERENCES, ACTA_PAGE_READINGS } from '../src/acta/curation.js';
import { pagelessKey } from '../src/acta/recover.js';
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
