import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { extractArgumentum } from '../src/harvest/argumentum.js';

describe('extractArgumentum', () => {
  it('reads the capitals line an apostolic constitution prints under its toponym', () => {
    const html = '<div>CONSTITUTIO APOSTOLICA DIUGUENSIS* IN BENINO NOVA CONDITUR DIOECESIS '
      + 'DIUGUENSIS Quo efficacius Evangelii nuntius ad omnes perveniret</div>';
    expect(extractArgumentum(html))
      .toBe('DIUGUENSIS* IN BENINO NOVA CONDITUR DIOECESIS DIUGUENSIS');
  });

  it('stops at the first mixed-case word, where the narrative body begins', () => {
    const html = '<div>CONSTITUTIO APOSTOLICA TREIENSIS * DE UNIONE DIOECESIS TREIENSIS CUM '
      + 'DIOECESI SANCTI SEVERINI Boni Pastoris, idest Iesu Christi</div>';
    expect(extractArgumentum(html)).not.toContain('Boni');
    expect(extractArgumentum(html)).toContain('DE UNIONE');
  });

  it('returns only the toponym when the document prints no argumentum, short enough for the script to abstain', () => {
    // 14 of the 742 print none; they are read individually rather than guessed at.
    expect(extractArgumentum('<div>CONSTITUTIO APOSTOLICA KYRGYZSTANIAE* Ad aptius '
      + 'consulendum spirituali bono</div>')).toBe('KYRGYZSTANIAE*');
  });

  it('is not fooled by a short capitalised word inside the body', () => {
    // 'In' is capitalised but is body text; a naive uppercase test keeps it.
    const html = '<div>CONSTITUTIO APOSTOLICA MAUMERENSIS * In Indonesia archidioecesis</div>';
    expect(extractArgumentum(html)).toBe('MAUMERENSIS *');
  });

  it('decodes HTML entities in the argumentum instead of tripping the case test on them', () => {
    // Older apostolic-constitution pages markup diacritics and guillemets as named
    // entities -- 'Bikoro&Euml;nsis', '&laquo;Nullius&raquo;'. Left undecoded, '&Euml;'
    // reads as the mixed-case letters 'Euml' and breaks the loop on the very first word.
    const html = '<div>CONSTITUTIO APOSTOLICA BIKORO&Euml;NSIS * APOSTOLICA PRAEFECTURA '
      + '&laquo;NULLIUS&raquo; BIKORO&Euml;NSIS AD GRADUM EVEHITUR Cum noverimus apostolicam</div>';
    expect(extractArgumentum(html))
      .toBe('BIKOROËNSIS * APOSTOLICA PRAEFECTURA «NULLIUS» BIKOROËNSIS AD GRADUM EVEHITUR');
  });
});
