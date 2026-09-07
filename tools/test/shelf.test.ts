import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseShelfIndex } from '../src/harvest/shelf.js';
import { shelvesFor } from '../src/mappings/index.js';

const load = (shelf: string) =>
  parseShelfIndex(readFileSync(`tools/fixtures/leo-xiii-${shelf}.html`, 'utf8'), 'leo-xiii', shelf);

const enc = load('encyclicals');
const all = shelvesFor('leo-xiii').flatMap((s) => load(s));

describe('parseShelfIndex', () => {
  it('finds every encyclical, linked or not', () => {
    expect(enc).toHaveLength(86);
  });

  it('finds the whole Leo XIII corpus across the eight shelves', () => {
    // Raw item count, before the orchestrator's cross-shelf dedupe in Task 11.
    expect(all).toHaveLength(275);
  });

  it('takes the date from the printed text, because slug formats differ by shelf', () => {
    // The encyclicals shelf slugs DDMMYYYY (…_enc_15041902_…) while the other seven slug
    // YYYYMMDD (…_let_19020415_…). Both entries below are the same date.
    const letters = load('letters');
    expect(letters.find((d) => d.incipit.toLowerCase() === 'in amplissimo')!.date).toBe('1902-04-15');
    expect(enc.find((d) => d.incipit.toLowerCase() === 'in amplissimo')!.date).toBe('1902-04-15');
    expect(load('speeches').find((d) => d.incipit.toLowerCase() === 'ubi primum')!.date)
      .toBe('1878-03-28');
  });

  it('takes the incipit from the heading text, never the abbreviated slug', () => {
    const cases: [string, string][] = [
      ['1895-09-05', 'Adiutricem populi'],
      ['1896-05-01', 'Insignes Deo'],
      ['1895-01-06', 'Longinqua oceani'],
      ['1894-03-19', 'Caritatis providentiaeque'],
    ];
    for (const [date, incipit] of cases) {
      expect(enc.find((d) => d.date === date)!.incipit).toBe(incipit);
    }
  });

  it('resolves URLs that appear only in the translation field', () => {
    const linked = enc.filter((d) => d.url !== null);
    expect(linked).toHaveLength(86);
    expect(enc.find((d) => d.incipit === 'Dum Multa')!.url).not.toBeNull();
  });

  it('handles the ordinal first-of-month and a place prefix', () => {
    expect(enc.find((d) => d.incipit === 'Tametsi Futura Prospicientibus')!.date).toBe('1900-11-01');
    expect(enc.find((d) => d.incipit === 'Non mediocri')!.date).toBe('1893-10-25');
  });

  it('preserves vernacular and accented incipits', () => {
    expect(enc.some((d) => d.incipit === 'Depuis le Jour')).toBe(true);
    expect(enc.some((d) => d.incipit === 'Spesse Volte')).toBe(true);
    expect(enc.some((d) => d.incipit === "Dall'alto dell'Apostolico Seggio")).toBe(true);
    expect(all.some((d) => d.incipit === 'La tarda età')).toBe(true);
  });

  it('labels every item with its shelf', () => {
    expect(enc.every((d) => d.shelf === 'encyclicals')).toBe(true);
    expect(all.every((d) => d.pageSlug === 'leo-xiii')).toBe(true);
  });

  it('yields a usable date and incipit for every item', () => {
    for (const d of all) {
      expect(d.incipit, JSON.stringify(d)).not.toBe('');
      expect(d.date, JSON.stringify(d)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
