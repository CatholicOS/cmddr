import { describe, it, expect } from 'vitest';
import { parseSourceDate } from '../src/dates.js';

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

  it("tolerates vatican.va's own 'augusto' typo for August", () => {
    // Printed verbatim on the Pius X letters shelf as "Si consentanea (17 augusto
    // 1904)"; the item's own URL slug (..._19040817_si-consentanea.html) confirms
    // 17 August 1904.
    expect(parseSourceDate('17 augusto 1904')).toBe('1904-08-17');
  });
});
