import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

interface SeriesRow {
  id: string; label: string; shelves: string[]; numbered: boolean; firstYear?: number;
  gloss: string; note: string;
}
const series = JSON.parse(readFileSync('data/series.json', 'utf8')) as SeriesRow[];
const by = Object.fromEntries(series.map((s) => [s.id, s]));

/** The two Urbi et Orbi rows share the `urbi`/`urbi_et_orbi` shelves and are told apart by date. */
const URBI = ['urbi-et-orbi-christmas', 'urbi-et-orbi-easter'];

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

  it('names the sixteen occasions of #16 in canonical English, plus the two Urbi et Orbi series', () => {
    expect(series.map((s) => s.id).sort()).toEqual([
      'lent',
      'urbi-et-orbi-christmas', 'urbi-et-orbi-easter',
      'world-childrens-day', 'world-communications-day', 'world-day-for-consecrated-life',
      'world-day-of-grandparents-and-the-elderly', 'world-day-of-migrants-and-refugees',
      'world-day-of-peace', 'world-day-of-prayer-for-the-care-of-creation',
      'world-day-of-prayer-for-vocations', 'world-day-of-the-poor', 'world-day-of-the-sick',
      'world-food-day', 'world-literacy-day', 'world-mission-day', 'world-tourism-day',
      'world-youth-day',
    ]);
  });

  it('lists at least one vatican.va sub-shelf slug per series', () => {
    for (const s of series) {
      expect(Array.isArray(s.shelves), s.id).toBe(true);
      expect(s.shelves.length, s.id).toBeGreaterThan(0);
      for (const shelf of s.shelves) expect(shelf, s.id).toMatch(/^[a-z0-9_-]+$/);
    }
  });

  it('maps every shelf slug to exactly one series, except the shared Urbi et Orbi shelves', () => {
    // The harvester's only way from a shelf to a series is this list, so a slug on two
    // rows would make the mapping ambiguous. The one deliberate exception: `urbi` and
    // `urbi_et_orbi` carry both the Christmas and the Easter series (and the rest of
    // the Urbi et Orbi), and the date -- not the shelf -- decides between them.
    const owners = new Map<string, string[]>();
    for (const s of series) {
      for (const shelf of s.shelves) owners.set(shelf, [...(owners.get(shelf) ?? []), s.id]);
    }
    for (const [shelf, ids] of owners) {
      if (shelf === 'urbi' || shelf === 'urbi_et_orbi') {
        expect(ids.sort(), shelf).toEqual(URBI);
      } else {
        expect(ids, shelf).toHaveLength(1);
      }
    }
    for (const id of URBI) expect(by[id]!.shelves.sort()).toEqual(['urbi', 'urbi_et_orbi']);
  });

  it("carries Leo XIV's renamed sub-shelves beside their predecessors' slugs", () => {
    expect(by['world-mission-day']!.shelves).toEqual(['missions', 'mission']);
    expect(by['world-day-of-the-poor']!.shelves).toEqual(['poveri', 'poor']);
    expect(by['world-day-of-grandparents-and-the-elderly']!.shelves).toEqual(['nonni', 'grandparents']);
    expect(by['world-day-of-prayer-for-the-care-of-creation']!.shelves).toEqual(['cura-creato', 'creation']);
  });

  it('numbers the World Day of Peace and World Communications Day, but not Lent (#16)', () => {
    expect(by['world-day-of-peace']!.numbered).toBe(true);
    expect(by['world-communications-day']!.numbered).toBe(true);
    expect(by['lent']!.numbered).toBe(false);
  });

  it('records firstYear only where a shelf reaches the first occasion, as a four-digit integer', () => {
    // Each of these is verified by an 'I Giornata…' title on the shelf the note names.
    expect(Object.fromEntries(series.filter((s) => s.firstYear !== undefined)
      .map((s) => [s.id, s.firstYear]))).toEqual({
      'world-day-of-peace': 1968,
      'world-communications-day': 1967,
      'world-day-of-prayer-for-vocations': 1964,
      'world-day-of-the-sick': 1993,
      'world-day-of-the-poor': 2017,
      'world-day-of-grandparents-and-the-elderly': 2021,
      'world-childrens-day': 2024,
      'world-food-day': 1981,
      'world-day-for-consecrated-life': 1997,
    });
    for (const s of series) {
      if (s.firstYear === undefined) continue;
      expect(Number.isInteger(s.firstYear), s.id).toBe(true);
      expect(s.firstYear, s.id).toBeGreaterThanOrEqual(1000);
      expect(s.firstYear, s.id).toBeLessThanOrEqual(9999);
      expect(s.numbered, `${s.id}: a first year is only checkable against an ordinal`).toBe(true);
      expect(s.note, s.id).toMatch(/I Giornata/);
    }
  });

  it('leaves firstYear absent where no shelf reaches a first occasion', () => {
    for (const id of ['world-youth-day', 'world-day-of-migrants-and-refugees', 'world-mission-day',
      'world-day-of-prayer-for-the-care-of-creation', 'lent', ...URBI]) {
      expect(by[id]!.firstYear, id).toBeUndefined();
    }
  });

  it('never numbers the Urbi et Orbi series', () => {
    for (const id of URBI) expect(by[id]!.numbered, id).toBe(false);
  });
});
