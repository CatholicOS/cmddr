import { describe, it, expect } from 'vitest';
import { parseSourceDate, easterSunday } from '../src/dates.js';

describe('parseSourceDate', () => {
  it('parses Italian month names', () => {
    expect(parseSourceDate('2 febbraio 1849')).toBe('1849-02-02');
    expect(parseSourceDate('25 dicembre 1750')).toBe('1750-12-25');
    expect(parseSourceDate('8 settembre 1899')).toBe('1899-09-08');
  });

  it('parses Latin month names', () => {
    expect(parseSourceDate('18 iulii 1870')).toBe('1870-07-18');
    expect(parseSourceDate('16 iunii 1872')).toBe('1872-06-16');
    expect(parseSourceDate('25 septembris 1865')).toBe('1865-09-25');
    expect(parseSourceDate('27 octobris 1871')).toBe('1871-10-27');
  });

  it('handles the ordinal first-of-month marker', () => {
    expect(parseSourceDate('1° novembre 1900')).toBe('1900-11-01');
    expect(parseSourceDate('1° maggio 1894')).toBe('1894-05-01');
  });

  it('ignores a place prefix', () => {
    expect(parseSourceDate('Roma, 25 ottobre 1893')).toBe('1893-10-25');
  });

  it('tolerates surrounding parentheses and whitespace', () => {
    expect(parseSourceDate('  (5 settembre 1895) ')).toBe('1895-09-05');
  });

  it('returns null when no date is present', () => {
    expect(parseSourceDate('Dum Multa')).toBeNull();
    expect(parseSourceDate('12 brumaio 1799')).toBeNull();
  });

  it('parses 29 February in a leap year', () => {
    expect(parseSourceDate('29 febbraio 1896')).toBe('1896-02-29');
  });

  it('rejects 29 February in a non-leap year', () => {
    expect(parseSourceDate('29 febbraio 1895')).toBeNull();
  });

  it('rejects 31 April', () => {
    expect(parseSourceDate('31 aprile 1895')).toBeNull();
  });

  it('still parses 31 January', () => {
    expect(parseSourceDate('31 gennaio 1895')).toBe('1895-01-31');
  });

  it("no longer treats vatican.va's own 'augusto'/'giungo' typos as month names", () => {
    // These two typos (Pius X's "Si consentanea (17 augusto 1904)"; Benedict XV's "Inter
    // Suebiae (14 giungo 1920)") were once aliased to month numbers here (see dates.ts).
    // Removed (review finding, 2026-09-08): harvest/shelf.ts's slug-date fallback now
    // strips the date parenthetical before falling back to the URL slug's own date even
    // when the printed date fails to parse, so parseSourceDate itself no longer needs to
    // recognise either typo for the two affected ids to resolve correctly.
    expect(parseSourceDate('17 augusto 1904')).toBeNull();
    expect(parseSourceDate('14 giungo 1920')).toBeNull();
  });
});

describe('easterSunday', () => {
  it('computes Easter Sunday by the Gregorian computus', () => {
    // Dates confirmed by the Urbi et Orbi shelves themselves (the URL slug of each Easter item).
    expect(easterSunday(1956)).toBe('1956-04-01');
    expect(easterSunday(1963)).toBe('1963-04-14');
    expect(easterSunday(1970)).toBe('1970-03-29');
    expect(easterSunday(2000)).toBe('2000-04-23');
    expect(easterSunday(2005)).toBe('2005-03-27');
    expect(easterSunday(2020)).toBe('2020-04-12');
    expect(easterSunday(2024)).toBe('2024-03-31');
    expect(easterSunday(2025)).toBe('2025-04-20');
    expect(easterSunday(2026)).toBe('2026-04-05');
  });

  it('rejects a pre-Gregorian or non-integer year', () => {
    expect(() => easterSunday(1500)).toThrow(/Gregorian/);
    expect(() => easterSunday(2024.5)).toThrow(/Gregorian/);
  });
});
