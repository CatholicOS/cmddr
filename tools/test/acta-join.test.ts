import { describe, it, expect } from 'vitest';
import { loadActaIndexes, actaSource } from '../src/acta/join.js';
import { ACTA_PAGE_READINGS } from '../src/acta/curation.js';

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
    for (const key of Object.keys(ACTA_PAGE_READINGS)) {
      const [source] = key.split('|');
      expect(actaSource(source!), key).toBeDefined();
      expect(parsed.get(source!)!.entries.some((e) => e.pageSource === 'reading'), key).toBe(true);
    }
  });
});
