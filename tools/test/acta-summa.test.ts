import { describe, expect, it } from 'vitest';
import { checkSumma, locateSumma, normalisePage, parseSummaPapalPart } from '../src/acta/summa.js';

describe('normalisePage (spec §4): the OCR of a page number in the summa', () => {
  it('reads the digits and the letters the OCR puts for them: ig3 → 193, 3oo → 300, 3oi → 301, i3o → 130, 6 19 → 619, 5 80 → 580', () => {
    for (const [tok, n] of [['427', 427], ['ig3', 193], ['3oo', 300], ['3oi', 301], ['i3o', 130], ['6 19', 619], ['5 80', 580], ['8oo', 800]] as const) {
      expect(normalisePage(tok), tok).toBe(n);
    }
  });
  it('rejects a token that is not a page: a word, an empty string, 0', () => {
    expect(normalisePage('pag')).toBeNull();
    expect(normalisePage('')).toBeNull();
    expect(normalisePage('0')).toBeNull();
  });
});

const SUMMA_41 = [
  '                     INDEX ANALYTICUS',
  '',
  '                             ACTA ROMANI PONTIFICIS',
  '',
  'Constitutio Apostolica de Romana Curia pag. 427',
  'Lex propria sacrae Romanae Rotae et Signaturae Apostolicae . » 440',
  'Ordo servandus in sacris Congregationibus, Tribunalibus, Officiis',
  '        Romanae Curiae 462 et 683',
  'Constitutio Apostolica de promulgatione legum et evulgatione acto­',
  '        rum S. Sedis » 6 19',
  'Epistola qua Pius X laudat Archiepiscopum Quebecen, ob promotam',
  '        actionem socialem catholicam » ig3',
  'Allocutio Pii PP. X die 18 Dec. 1907 habita ad novos Cardinales. » 31',
  '',
  '                                     EX SECRETARIA BREVIUM',
  '',
  'Pontifex laudat Collegium Americanum Lovanii in Belgio occasione',
  '        quinquagesimi anni ab erectione > 37',
].join('\n');

describe('parseSummaPapalPart (spec §4): the papal part, loosely', () => {
  it('reads one row per page-ended run, two rows for `462 et 683`, and stops at the first dicastery heading', () => {
    const { rows, heading, end } = parseSummaPapalPart(SUMMA_41);
    expect(heading).toBe('ACTA ROMANI PONTIFICIS');
    expect(end).toBe('EX SECRETARIA BREVIUM');
    expect(rows.map((r) => r.page)).toEqual([427, 440, 462, 683, 619, 193, 31]);
    expect(rows[2]!.description).toBe('Ordo servandus in sacris Congregationibus, Tribunalibus, Officiis Romanae Curiae');
    expect(rows[4]!.description).toBe('Constitutio Apostolica de promulgatione legum et evulgatione actorum S. Sedis');
    expect(rows[4]!.raw).toBe('Constitutio Apostolica de promulgatione legum et evulgatione acto­ / rum S. Sedis » 6 19');
  });
  it('reads the 1879 and 1900 headings (`LITTERAE ET ALLOCUTIONES APOSTOLICAE`, `LITTERAE ET ACTA R. PONTIFICIS`) and an interleaved column as rows all the same', () => {
    const text = [
      '647 SUMMA ACTOKTJM QUAE IN HOC VOLUMINE XII CONTINENTUR',
      'LITTERAE ET ALLOCUTIONES Motu Proprio SS. D. N. Leonis',
      'APOSTOLICAE XIII, quo deputatio trium Emorum',
      'Allocutio SSmi D. N. Leonis XIII ad Cardinalium constituitur . . 337',
      'ephemeridum repraesentantes . . 13',
      'EX ACTIS CONSISTORIALIBUS',
      'De Consistorio habito die 19 Septembris 1879 . . 147',
    ].join('\n');
    const { rows, heading } = parseSummaPapalPart(text);
    expect(heading).toBe('LITTERAE ET ALLOCUTIONES');
    expect(rows.map((r) => r.page)).toEqual([337, 13]);
  });
  it('returns no rows and a null heading when the text has no papal part', () => {
    expect(parseSummaPapalPart('INDEX GENERALIS CONCLUSIONUM\nAbbas . . 12')).toEqual({ rows: [], heading: null, end: null });
  });
  it('does not close a row on a Latin word that reduces to a well-formed page number (`iis` → 115): the row closes only at the next genuine page token', () => {
    const text = [
      'ACTA ROMANI PONTIFICIS',
      '',
      'Epistola qua mandatur ut quae omnia mandata tradantur iis',
      '        qui curam animarum habent » 44',
    ].join('\n');
    const { rows } = parseSummaPapalPart(text);
    expect(rows).toEqual([{
      description: 'Epistola qua mandatur ut quae omnia mandata tradantur iis qui curam animarum habent',
      page: 44,
      raw: 'Epistola qua mandatur ut quae omnia mandata tradantur iis / qui curam animarum habent » 44',
    }]);
  });
  it('does not close a row on `sis` either (→ 515), a middle line ending in a bare OCR-digit-letter word', () => {
    const text = [
      'ACTA ROMANI PONTIFICIS',
      '',
      'Epistola ad omnes qui hoc munus obeunt sis',
      '        gerendum suscipiant » 12',
    ].join('\n');
    const { rows } = parseSummaPapalPart(text);
    expect(rows).toEqual([{
      description: 'Epistola ad omnes qui hoc munus obeunt sis gerendum suscipiant',
      page: 12,
      raw: 'Epistola ad omnes qui hoc munus obeunt sis / gerendum suscipiant » 12',
    }]);
  });
});

describe('locateSumma: the summa pages, from the volume\'s midpoint', () => {
  it('finds the first page headed SUMMA ACTORUM or INDEX ANALYTICUS and ends before the next index heading', () => {
    const pages = ['body', 'body', 'body', '   647 SUMMA ACTORUM QUAE IN HOC VOLUMINE XII CONTINENTUR', '648 SUMMA. ACTORUM. more', '  INDEX GENERALIS CONCLUSIONUM', 'more'];
    expect(locateSumma(pages)).toEqual({ from: 4, to: 5 });
  });
  it('admits the OCR\'s ACTOKTJM and AGTORUM, and runs to the volume\'s end when no index follows, dropping blank pages', () => {
    expect(locateSumma(['b', 'b', 'b', '  SUMMA ACTOKTJM', 'x', '', ''])).toEqual({ from: 4, to: 5 });
    expect(locateSumma(['b', 'b', 'b', '  SUMMA AGTORUM', 'x'])).toEqual({ from: 4, to: 5 });
  });
  it('returns null when no summa is found', () => {
    expect(locateSumma(['b', 'b', 'b', 'b'])).toBeNull();
  });
});

describe('checkSumma (spec §4): every summa page must be a scanned act\'s page, and every act should sit on a summa page', () => {
  it('splits the rows into claimed and unclaimed and lists the acts the summa omits', () => {
    const rows = [{ description: 'a', page: 427, raw: 'a 427' }, { description: 'b', page: 619, raw: 'b 619' }, { description: 'c', page: 193, raw: 'c 193' }];
    const check = checkSumma([{ page: 427 }, { page: 619 }, { page: 21 }], { pages: { from: 799, to: 809 }, rows });
    expect(check).toEqual({ pages: { from: 799, to: 809 }, rows, claimed: [427, 619], unclaimed: [rows[2]], omitted: [21] });
  });
});
