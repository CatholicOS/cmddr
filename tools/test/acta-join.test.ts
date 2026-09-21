import { describe, it, expect } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import { loadActaIndexes, actaSource } from '../src/acta/join.js';
import { ACTA_CURATED_REFERENCES, ACTA_PAGE_READINGS } from '../src/acta/curation.js';
import { pagelessKey } from '../src/acta/recover.js';
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
  it('writes the curated references of the Codes\' constitutions and no other', () => {
    const docs = readdirSync('data/documents').filter((f) => f.endsWith('.json')).flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[]);
    const by = Object.fromEntries(docs.map((d) => [d.id, d]));
    expect(Object.keys(ACTA_CURATED_REFERENCES)).toEqual(['mag:benedict-xv/providentissima-mater-1917']);
    expect(by['mag:benedict-xv/providentissima-mater-1917']!.acta).toEqual({ series: 'AAS', volume: 9, year: 1917, part: 'II', page: 5 });
    expect(by['mag:john-paul-ii/sacrae-disciplinae-leges-1983']!.acta).toBeUndefined();
  });
});
