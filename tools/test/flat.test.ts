import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseFlatIndex } from '../src/harvest/flat.js';

const bxiv = parseFlatIndex(readFileSync('tools/fixtures/benedictus-xiv.html', 'utf8'), 'benedictus-xiv');
const pix = parseFlatIndex(readFileSync('tools/fixtures/pius-ix.html', 'utf8'), 'pius-ix');

describe('parseFlatIndex', () => {
  it('finds every document on each landing page', () => {
    expect(bxiv).toHaveLength(43);
    expect(pix).toHaveLength(77);
  });

  it('falls back to the genre label when the incipit is not wrapped in <i>', () => {
    // Exactly one Pius IX entry prints as `Epistola Ecclesia Dei (2 marzo 1871)` with no <i>.
    const ed = pix.find((d) => d.date === '1871-03-02')!;
    expect(ed.incipit).toBe('Ecclesia Dei');
    expect(ed.sourceGenreLabel).toBe('Epistola');
  });

  it('takes the incipit from <i>, not the truncated slug', () => {
    const bd = bxiv.find((d) => d.date === '1750-12-25')!;
    expect(bd.incipit).toBe('Benedictus Deus');
    expect(bd.sourceGenreLabel).toBe('Bolla');
    expect(bd.url).toContain('bolla--i-benedictus-deus');
  });

  it('parses Italian dates', () => {
    const up = pix.filter((d) => d.incipit.toLowerCase() === 'ubi primum');
    expect(up.map((d) => d.date).sort()).toEqual(['1847-06-17', '1849-02-02']);
    expect(up.every((d) => d.sourceGenreLabel === 'Enciclica')).toBe(true);
  });

  it('parses Latin dates', () => {
    // The live it.html page prints this entry's genre and date in Italian
    // ("Costituzione dogmatica ... 18 luglio 1870"); only the URL slug says
    // "constitutio-dogmatica...iulii...", and slugs are never parsed for content
    // (see task brief). The date still resolves to the correct ISO value either way.
    const pa = pix.find((d) => d.incipit === 'Pastor Aeternus')!;
    expect(pa.date).toBe('1870-07-18');
    expect(pa.sourceGenreLabel).toBe('Costituzione dogmatica');
  });

  it('records the page slug and available languages', () => {
    expect(pix.every((d) => d.pageSlug === 'pius-ix')).toBe(true);
    expect(pix.every((d) => d.shelf === null)).toBe(true);
    expect(pix.find((d) => d.incipit === 'Pastor Aeternus')!.languages.length).toBeGreaterThan(0);
  });

  it('yields a usable date and incipit for every item', () => {
    for (const d of [...bxiv, ...pix]) {
      expect(d.incipit, JSON.stringify(d)).not.toBe('');
      expect(d.date, JSON.stringify(d)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(d.sourceGenreLabel, JSON.stringify(d)).not.toBe('');
    }
  });
});
