import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const series = JSON.parse(readFileSync('data/series.json', 'utf8')) as
  Array<{ id: string; label: string; gloss: string; numbered: boolean; note: string }>;

describe('data/series.json', () => {
  it('is a non-empty array of slug-shaped ids', () => {
    expect(Array.isArray(series)).toBe(true);
    expect(series.length).toBeGreaterThan(0);
    for (const s of series) expect(s.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('gives every occasion a label, a gloss, a numbered flag and an evidence note', () => {
    for (const s of series) {
      expect(s.label, s.id).toBeTruthy();
      expect(s.gloss, s.id).toBeTruthy();
      expect(typeof s.numbered, s.id).toBe('boolean');
      expect(s.note, s.id).toMatch(/vatican\.va/);
    }
  });

  it('has unique ids', () => {
    expect(new Set(series.map((s) => s.id)).size).toBe(series.length);
  });

  it('holds the sixteen vatican.va message sub-shelves named in #16, slug-normalised', () => {
    expect(series.map((s) => s.id).sort()).toEqual([
      'bambini', 'communications', 'consecrated-life', 'cura-creato', 'food', 'lent',
      'literacy', 'migration', 'missions', 'nonni', 'peace', 'poveri', 'sick', 'tourism',
      'vocations', 'youth',
    ]);
  });

  it('numbers the World Day of Peace and World Communications Day, but not Lent (#16)', () => {
    const by = Object.fromEntries(series.map((s) => [s.id, s]));
    expect(by['peace']!.numbered).toBe(true);
    expect(by['communications']!.numbered).toBe(true);
    expect(by['lent']!.numbered).toBe(false);
  });
});
