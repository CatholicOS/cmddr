import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseCouncilIndex } from '../src/harvest/council.js';
import { COUNCILS, VATICAN_II_DOCUMENTS } from '../src/mappings/index.js';
import { slugify } from '../src/slug.js';

const vaticanII = COUNCILS[0]!;
const html = readFileSync('tools/fixtures/ii_vatican_council.html', 'utf8');
const items = parseCouncilIndex(html, vaticanII);
const by = (incipit: string) => items.find((i) => i.incipit === incipit)!;

describe('parseCouncilIndex', () => {
  it('reads all sixteen documents', () => {
    expect(items).toHaveLength(16);
  });

  it('gives every item the council page slug and no shelf', () => {
    for (const i of items) {
      expect(i.pageSlug).toBe('ii_vatican_council');
      expect(i.shelf).toBeNull();
    }
  });

  it('never emits a null incipit, because a conciliar title is its incipit', () => {
    // No Vatican II record can be provisional: extractIncipit is not involved at all.
    for (const i of items) {
      expect(i.incipit).not.toBeNull();
      expect(i.title).toBe(i.incipit);
    }
  });

  it('reads the date from the URL slug', () => {
    expect(by('Lumen Gentium').date).toBe('1964-11-21');
    expect(by('Gaudium et Spes').date).toBe('1965-12-07');
    expect(by('Sacrosanctum Concilium').date).toBe('1963-12-04');
  });

  it('agrees with every printed date in the curated table', () => {
    for (const i of items) {
      const row = VATICAN_II_DOCUMENTS[slugify(i.incipit!)]!;
      expect(i.date, i.incipit!).toBe(row.printedDate);
    }
  });

  it('takes the genre label from the curated table, not the section heading', () => {
    expect(by('Lumen Gentium').sourceGenreLabel).toBe('Costituzione dogmatica');
    expect(by('Sacrosanctum Concilium').sourceGenreLabel).toBe('Costituzione');
    expect(by('Nostra Aetate').sourceGenreLabel).toBe('Dichiarazione');
    expect(by('Ad Gentes').sourceGenreLabel).toBe('Decreto');
  });

  it('resolves the Italian document page as the source url', () => {
    expect(by('Lumen Gentium').url).toBe(
      'https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/'
      + 'vat-ii_const_19641121_lumen-gentium_it.html');
  });

  it('maps language suffixes to registry codes, reading lt as Latin', () => {
    const langs = by('Lumen Gentium').languages;
    expect(langs).toContain('LA');
    expect(langs).not.toContain('LT');
    expect(langs).toContain('DE');   // _ge.html
    expect(langs).toContain('ES');   // _sp.html
    expect(langs).toContain('PT');   // _po.html
    expect(langs).toContain('ZH');   // /chinese/concilio/*.pdf
    expect(langs).toContain('IT');
  });

  it('picks up the languages that occur on only one or two documents', () => {
    expect(by('Nostra Aetate').languages).toContain('HR');
    expect(by('Dei Verbum').languages).toContain('HE');   // a PDF under documents/
    expect(by('Ad Gentes').languages).not.toContain('AR');
  });

  it('emits no duplicate language code for a document', () => {
    for (const i of items) {
      expect(new Set(i.languages).size, i.incipit!).toBe(i.languages.length);
    }
  });

  it('throws when the index carries a document the curated table does not name', () => {
    const stray = html.replace(
      'vat-ii_const_19641121_lumen-gentium_it.html',
      'vat-ii_const_19641121_lumen-fictum_it.html')
      .replace('<b>Lumen Gentium</b>', '<b>Lumen Fictum</b>');
    expect(() => parseCouncilIndex(stray, vaticanII))
      .toThrow(/not in the curated table/i);
  });

  it('throws when a curated row matches no item on the page', () => {
    const short = html.replace(/<li><a href="documents\/vat-ii_decree_19631204_inter-mirifica_it\.html"[\s\S]*?<\/li>/, '');
    expect(() => parseCouncilIndex(short, vaticanII))
      .toThrow(/matched no item/i);
  });

  it('throws when a section heading disagrees with the curated table', () => {
    const moved = html.replace('<b>Dichiarazioni</b>', '<b>Decreti</b>');
    expect(() => parseCouncilIndex(moved, vaticanII)).toThrow(/section/i);
  });

  it('throws on an unknown language suffix rather than dropping it', () => {
    const odd = html.replace('_lumen-gentium_ar.html', '_lumen-gentium_qq.html');
    expect(() => parseCouncilIndex(odd, vaticanII)).toThrow(/language suffix/i);
  });

  it('throws when the URL date disagrees with the date the document prints', () => {
    // The cross-check that makes the URL-derived date safe to trust (spec §2.3, §6).
    const wrong = html.replace('vat-ii_const_19641121_lumen-gentium_it.html',
                               'vat-ii_const_19641122_lumen-gentium_it.html');
    expect(() => parseCouncilIndex(wrong, vaticanII)).toThrow(/disagreement/i);
  });

  it('throws when an anchor carries no date in its slug', () => {
    const undated = html.replace('vat-ii_const_19641121_lumen-gentium_it.html',
                                 'vat-ii_const_lumen-gentium_it.html');
    expect(() => parseCouncilIndex(undated, vaticanII)).toThrow(/date/i);
  });
});
