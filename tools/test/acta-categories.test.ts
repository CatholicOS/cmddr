import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { ACTA_CATEGORIES, categoryForHeading, normaliseHeading } from '../src/acta/categories.js';
import { parseActaIndex } from '../src/acta/index.js';
import { ACTA_YEARS, actaFixturePath } from '../src/acta/join.js';

const genres = JSON.parse(readFileSync('data/genres.json', 'utf8')) as
  Array<{ id: string; allowedCharacteristics?: string[] }>;

describe('the AAS category table', () => {
  it('normalises a heading: roman numeral and dash dropped, case folded, whitespace collapsed', () => {
    expect(normaliseHeading('IV – LITTERAE APOSTOLICAE MOTU PROPRIO DATAE')).toBe('LITTERAE APOSTOLICAE MOTU PROPRIO DATAE');
    expect(normaliseHeading('XVIII  – ITINERA APOSTOLICA, VISITATIONES  ')).toBe('ITINERA APOSTOLICA, VISITATIONES');
    expect(normaliseHeading('IV. – ACTA CONGREGATIONUM')).toBe('ACTA CONGREGATIONUM');
    expect(normaliseHeading('Litterae Decretales')).toBe('LITTERAE DECRETALES');
  });

  it('maps every heading variant to its row, and an unseen one to null', () => {
    expect(categoryForHeading('II – ADHORTATIO APOSTOLICA POSTSYNODALIS')?.id).toBe('Adhortationes Apostolicae');
    expect(categoryForHeading('CHIROGRAPHI')?.id).toBe('Chirographa');
    expect(categoryForHeading('EPISTULA APOSTOLICA')?.classes).toEqual([{ genre: 'apostolic-letter', excludes: 'motu-proprio' }]);
    expect(categoryForHeading('NUNTII')?.classes.map((c) => c.genre)).toEqual(['message', 'urbi-et-orbi']);
    expect(categoryForHeading('ADHORTATIO')?.classes).toEqual([]);
    expect(categoryForHeading('LITTERAE INAUDITAE')).toBeNull();
  });

  it('lists each heading once, under one row', () => {
    const all = ACTA_CATEGORIES.flatMap((c) => c.headings);
    expect(new Set(all).size).toBe(all.length);
    expect(all.every((h) => h === normaliseHeading(h))).toBe(true);
  });

  it('names only genres and characteristics the Genre Registry has', () => {
    const byId = new Map(genres.map((g) => [g.id, g.allowedCharacteristics ?? []]));
    for (const c of ACTA_CATEGORIES) {
      for (const k of c.classes) {
        expect(byId.has(k.genre), c.id).toBe(true);
        for (const ch of [k.requires, k.excludes]) {
          if (ch !== undefined) expect(byId.get(k.genre), `${c.id}: ${ch}`).toContain(ch);
        }
      }
    }
  });

  it('follows the spec\'s table (§2.3) on what is harvested', () => {
    const harvested = (id: string) => ACTA_CATEGORIES.find((c) => c.id === id)!.harvested;
    expect(harvested('Litterae Encyclicae')).toBe('yes');
    expect(harvested('Constitutiones Apostolicae')).toBe('yes');
    expect(harvested('Litterae Apostolicae Motu proprio datae')).toBe('yes');
    expect(harvested('Litterae Decretales')).toBe('partly');
    expect(harvested('Nuntii')).toBe('partly');
    expect(harvested('Epistulae')).toBe('no');
    expect(harvested('Homiliae')).toBe('no');
    expect(harvested('Allocutiones')).toBe('no');
  });

  it('covers every heading the ten fixtures print (none is unseen)', () => {
    for (const year of ACTA_YEARS) {
      const r = parseActaIndex(readFileSync(actaFixturePath(year), 'utf8'), { year });
      expect(r.unseenHeadings, String(year)).toEqual([]);
    }
  });

  it('is printed in the fixtures, row by row, except the anticipated Bullae', () => {
    const seen = new Set<string>();
    for (const year of ACTA_YEARS) {
      const r = parseActaIndex(readFileSync(actaFixturePath(year), 'utf8'), { year });
      for (const e of r.entries) seen.add(e.category);
    }
    for (const c of ACTA_CATEGORIES) {
      const printed = c.headings.some((h) => seen.has(h));
      expect(printed, c.id).toBe(c.id !== 'Bullae');
    }
  });
});
