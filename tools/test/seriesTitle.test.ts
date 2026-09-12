import { describe, it, expect } from 'vitest';
import { readOrdinal, readOccasionYear, romanToInt } from '../src/harvest/seriesTitle.js';

describe('romanToInt', () => {
  it('reads strict Roman numerals', () => {
    expect(romanToInt('I')).toBe(1);
    expect(romanToInt('IV')).toBe(4);
    expect(romanToInt('IX')).toBe(9);
    expect(romanToInt('XL')).toBe(40);
    expect(romanToInt('L')).toBe(50);
    expect(romanToInt('LVIII')).toBe(58);
    expect(romanToInt('XCVII')).toBe(97);
    expect(romanToInt('CX')).toBe(110);
  });

  it('rejects what is not a numeral', () => {
    for (const s of ['', 'IIII', 'XXXIIII', 'XXXX', 'IX-X', 'VV', 'IL', 'la', 'Messaggio']) {
      expect(romanToInt(s), s).toBeNull();
    }
  });
});

describe('readOrdinal', () => {
  it('reads a Roman numeral heading the title', () => {
    expect(readOrdinal('LVIII Giornata Mondiale della Pace 2025 - “Rimetti a noi i nostri debiti”'))
      .toEqual({ kind: 'read', value: 58, form: 'roman', printed: 'LVIII' });
    expect(readOrdinal('I Giornata Mondiale della Pace 1968: 1° Gennaio, Giornata Mondiale della Pace'))
      .toEqual({ kind: 'read', value: 1, form: 'roman', printed: 'I' });
    expect(readOrdinal('L Giornata Mondiale di Preghiera per le Vocazioni, 2013').kind).toBe('read');
  });

  it('reads an Arabic ordinal with any of the printed suffixes', () => {
    expect(readOrdinal('Messaggio per la 110ª Giornata Mondiale del Migrante e del Rifugiato 2024'))
      .toEqual({ kind: 'read', value: 110, form: 'arabic', printed: '110ª' });
    expect(readOrdinal('Messaggio per la 62a Giornata Mondiale di Preghiera per le Vocazioni 2025'))
      .toMatchObject({ kind: 'read', value: 62, form: 'arabic', printed: '62a' });
    expect(readOrdinal('Messaggio del Santo Padre per la 100ma Giornata Mondiale delle Missioni [18 ottobre 2026]'))
      .toMatchObject({ kind: 'read', value: 100, form: 'arabic' });
  });

  it('reads an ordinal that follows "per la" / "per l\'" / "alla" rather than heading the title', () => {
    expect(readOrdinal('Messaggio del Santo Padre Leone XIV per la LIX Giornata Mondiale della Pace 2026'))
      .toMatchObject({ value: 59 });
    expect(readOrdinal("Messaggio del Santo Padre per l'XI Giornata Mondiale di Preghiera per la Cura del Creato [1° settembre 2026]"))
      .toMatchObject({ value: 11 });
    expect(readOrdinal('Videomessaggio del Santo Padre ai giovani in preparazione alla XXXIV Giornata Mondiale della Gioventù 2019 [Panama, 22-27 gennaio 2019]'))
      .toMatchObject({ value: 34 });
  });

  it('finds no ordinal where the word before Giornata is an ordinary word, or Giornata opens the title', () => {
    expect(readOrdinal('Messaggio per la Giornata Missionaria Mondiale 2025')).toEqual({ kind: 'none' });
    expect(readOrdinal('Giornata Mondiale delle Migrazioni, 2005')).toEqual({ kind: 'none' });
    expect(readOrdinal('Messaggio in occasione della Giornata Mondiale dell’Alimentazione 2012')).toEqual({ kind: 'none' });
    expect(readOrdinal('Quaresima 2015: Rinfrancate i vostri cuori (Gc 5,8)')).toEqual({ kind: 'none' });
    expect(readOrdinal('Messaggio al Cardinale Sebastiano Baggio in occasione della «Giornata del Migrante»')).toEqual({ kind: 'none' });
  });

  it('reports, never guesses, a token in the ordinal position that is not a numeral', () => {
    expect(readOrdinal('XXXIIII Giornata Mondiale del Malato, 2025')).toEqual({ kind: 'unreadable', printed: 'XXXIIII' });
    expect(readOrdinal('IX-X Giornata Mondiale della Gioventù, 1994-1995')).toEqual({ kind: 'unreadable', printed: 'IX-X' });
  });
});

describe('readOccasionYear', () => {
  it('reads the one four-digit year the title prints', () => {
    expect(readOccasionYear('LVIII Giornata Mondiale della Pace 2025 - “Rimetti a noi i nostri debiti”')).toEqual({ kind: 'read', value: 2025 });
    expect(readOccasionYear('Quaresima 2015: Rinfrancate i vostri cuori (Gc 5,8)')).toEqual({ kind: 'read', value: 2015 });
    expect(readOccasionYear('XXXIX Giornata Mondiale delle Comunicazioni Sociali, 2005 -I mezzi di comunicazione')).toEqual({ kind: 'read', value: 2005 });
    expect(readOccasionYear('Messaggio del Santo Padre in occasione della Giornata Mondiale di Preghiera per la Cura del Creato [1° settembre 2024]')).toEqual({ kind: 'read', value: 2024 });
  });

  it('accepts the same year printed twice', () => {
    expect(readOccasionYear('Videomessaggio … alla XXXIV Giornata Mondiale della Gioventù 2019 [Panama, 22-27 gennaio 2019]')).toEqual({ kind: 'read', value: 2019 });
  });

  it('reports a title with no year, and one with two different years, rather than reading date', () => {
    expect(readOccasionYear('Messaggio per la Giornata Mondiale del Turismo')).toEqual({ kind: 'none' });
    expect(readOccasionYear('XXIX Giornata Mondiale della Vita Consacrata - Festa della Presentazione del Signore')).toEqual({ kind: 'none' });
    expect(readOccasionYear('XXXVII Giornata Mondiale della Gioventù, 2022-2023: «Maria si alzò e andò in fretta» (Lc 1,39)'))
      .toEqual({ kind: 'ambiguous', printed: [2022, 2023] });
  });

  it('ignores scripture references and day numbers', () => {
    expect(readOccasionYear('Quaresima 2014: Si è fatto povero per arricchirci con la sua povertà (cfr 2 Cor 8,9)')).toEqual({ kind: 'read', value: 2014 });
    expect(readOccasionYear('IV Giornata Mondiale dei Nonni e degli Anziani, 2024: “Nella vecchiaia non abbandonarmi” (cfr. Sal 71,9)')).toEqual({ kind: 'read', value: 2024 });
  });
});
