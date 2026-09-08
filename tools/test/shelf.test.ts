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
    expect(letters.find((d) => d.incipit?.toLowerCase() === 'in amplissimo')!.date).toBe('1902-04-15');
    expect(enc.find((d) => d.incipit?.toLowerCase() === 'in amplissimo')!.date).toBe('1902-04-15');
    expect(load('speeches').find((d) => d.incipit?.toLowerCase() === 'ubi primum')!.date)
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

describe('parseShelfIndex on Pius X', () => {
  const loadPiusX = (shelf: string) =>
    parseShelfIndex(readFileSync(`tools/fixtures/pius-x-${shelf}.html`, 'utf8'), 'pius-x', shelf);
  const allPiusX = shelvesFor('pius-x').flatMap((s) => loadPiusX(s));

  it('reads the same markup as the Leo XIII shelves', () => {
    expect(loadPiusX('encyclicals')).toHaveLength(16);
    expect(loadPiusX('apost_exhortations')).toHaveLength(1);
    expect(loadPiusX('letters')).toHaveLength(189);
  });

  it('reads bare incipits, which is why Pius X needs no new parsing', () => {
    const mp = loadPiusX('motu_proprio');
    expect(mp.find((d) => d.date === '1914-01-16')!.incipit).toBe('Quanta semper cura');
    expect(loadPiusX('letters').find((d) => d.date === '1914-01-20')!.incipit)
      .toBe('Iucunda equidem');
    expect(loadPiusX('apost_exhortations')[0]!.incipit).toBe('Haerent Animo');
  });

  it('yields a usable date and incipit for every item', () => {
    for (const d of allPiusX) {
      expect(d.incipit, JSON.stringify(d)).not.toBe('');
      expect(d.date, JSON.stringify(d)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe('parseShelfIndex falls back to the URL slug date (Task 8)', () => {
  // Two real pius-xii/letters headings carry no printed date at all -- the date exists
  // only in the URL slug. Before this fix, `open <= 0` on the missing '(' silently dropped
  // both with no trace; the fix falls back to the slug date and warns rather than dropping.
  const letters = parseShelfIndex(
    readFileSync('tools/fixtures/pius-xii-letters.html', 'utf8'), 'pius-xii', 'letters',
  );

  it('recovers both undated headings using their URL slug date', () => {
    const cinemaRadioTv = letters.find((d) => d.title === 'Pontificia Commissione per la Cinematografia, la Radio e la Televisione');
    expect(cinemaRadioTv?.date).toBe('1954-12-16'); // hf_p-xii_lett_16121954_statute-cinema-radio-tv.html
    const cinema = letters.find((d) => d.title === 'Pontificia Commissione per la Cinematografia');
    expect(cinema?.date).toBe('1952-01-01'); // hf_p-xii_lett_01011952_cinematographic-commission.html
  });

  it('never silently drops an item: every div.item on the fixture yields a parsed item', () => {
    const html = readFileSync('tools/fixtures/pius-xii-letters.html', 'utf8');
    const divCount = (html.match(/class="item"/g) ?? []).length;
    expect(letters).toHaveLength(divCount);
  });
});

describe('parseShelfIndex strips a bare trailing date with no enclosing parens (Task 14)', () => {
  // Two real paul-vi/apost_letters headings print their date directly after a comma, with
  // no wrapping parens at all -- a shape no earlier pontificate's fixtures exercise. Before
  // this fix, `open <= 0` meant the date was never split off headingText, so it rode into
  // extractIncipit and was baked into the incipit/id verbatim.
  const apl = parseShelfIndex(
    readFileSync('tools/fixtures/paul-vi-apost_letters.html', 'utf8'), 'paul-vi', 'apost_letters',
  );

  it('parses the date and leaves it out of the title', () => {
    const ms = apl.find((d) => d.title === 'Multiformis Sapientia Dei');
    expect(ms?.date).toBe('1970-09-27'); // hf_p-vi_apl_19700927_multiformis-sapientia.html
    expect(ms?.incipit).toBe('Multiformis Sapientia Dei');

    const me = apl.find((d) => d.title === 'Mirabilis in Ecclesia Deus');
    expect(me?.date).toBe('1970-10-04'); // hf_p-vi_apl_19701004_mirabilis-in-ecclesia.html
    expect(me?.incipit).toBe('Mirabilis in Ecclesia Deus');
  });

  it('does not touch a heading with no trailing date at all', () => {
    // 'Nomina del Card. Ugo Poletti a Vicario Generale, 6 marzo 1973' has the same bare
    // trailing-date shape and is stripped the same way, but a heading with no such
    // trailing date must fall through unchanged to the ordinary URL-slug fallback.
    const causas = apl.find((d) => d.title === 'Lettera Apostolica Causas matrimoniales');
    expect(causas?.date).toBe('1971-03-28'); // URL-slug fallback, unaffected by this change
  });
});
