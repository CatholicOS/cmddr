import { describe, expect, it } from 'vitest';
import { checkSumma, locateSumma, normalisePage, parseSummaPapalPart, splitColumns } from '../src/acta/summa.js';

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

  it('reads the papal part under the headings the series prints beyond the sample (survey §4b)', () => {
    const cases: [string, string, string][] = [
      // [the heading as printed, the row that follows it, the heading parseSummaPapalPart should report]
      ['ACTA SOLEMNIORA ROMANI PONTIFICIS.', 'Allocutio habita die 20 Decembris 1867 . . 289', 'ACTA SOLEMNIORA ROMANI PONTIFICIS'],
      ['ACTA SOLEMNIORE ROM. PONTIFICIS', 'Litterae Apostolicae solemnissimae . . 118', 'ACTA SOLEMNIORE ROM. PONTIFICIS'],
      ['ACTA SOLEMNIORA ROM. PONriFICIS', 'Allocutio habita a SS.mo Patre . . 522', 'ACTA SOLEMNIORA ROM. PONriFICIS'],
      ['ACTA SOLEMNIORÂ', 'Sanctissimi Domini Nostri Pii . . 55', 'ACTA SOLEMNIORÂ'],
      ['LITTERAE APOSTOLICAE', 'Litterae Apostolicae ad Ducem . . 581', 'LITTERAE APOSTOLICAE'],
      ['LITTERAE ET RESPONSUM', 'Litterae Apostolicae; de Ordine s. Ba- . . 433', 'LITTERAE ET RESPONSUM'],
      ['LITTERAE MOTU PROPRIO', 'de curis adhibitis ab Episcopis . . 17', 'LITTERAE MOTU PROPRIO'],
      ['LITTERAE ROMANI PONTIFICIS', 'Litterae Sanctissimi D. N. Leonis . . 305', 'LITTERAE ROMANI PONTIFICIS'],
      ['LITTERAE R. PONTIFICIS', 'Litterae SSmi D. N. Leonis XIII . . 4', 'LITTERAE R. PONTIFICIS'],
      ['ACTA ROMAM PONTIFICIS', 'Epistola SSmi D. N. Leonis XIII ad . . 709', 'ACTA ROMAM PONTIFICIS'],
      // ASS 16 (1883) 557's OCR garble of `LITTERAE ROMANI PONTIFICIS`, printed as one line: `L TT E RA R ROMANI PONTIFICIS`.
      ['L TT E RA R ROMANI PONTIFICIS', 'Epistola SSMI D. N. LEONIS XIII AD EMOS CARDINALES . . 49', 'L TT E RA R ROMANI PONTIFICIS'],
    ];
    for (const [heading, row, reported] of cases) {
      const { rows, heading: read } = parseSummaPapalPart(`SUMMA ACTORUM\nQUAE IN HOC VOLUMINE CONTINENTUR\n${heading}\n${row}\nEX ACTIS CONSISTORIALIBUS\nDe Consistorio habito . . 99`);
      expect(read, heading).toBe(reported);
      expect(rows.map((r) => r.page), heading).toEqual([Number(row.match(/(\d+)\s*$/)![1])]);
    }
  });

  it('joins ASS 3 (1867) 665\'s papal heading across the two physical lines of its two-column page (`ACTA SOLEMNIORA ROMANI` / `PONTIFICIS.`) without leaking `ROMANI` into the first row -- the bug the brief\'s draft regex had, caught only against the real page', () => {
    const text = [
      '                                                             SUMMA ACTORUM',
      '                                   QUAE IN HOC TERTIO VOLUMINE CONTINENTUR.',
      '            ACTA SOLEMNIORA ROMANI                                                                 Allocutio habita die 20 Decembris 1867',
      '                                PONTIFICIS.                                                             de A ictoria relata io Nomentano et',
      '                                                                                                       Aretino certamine, deque fiorenti vita',
      '  Allocutio consistorialis diei 12 Iulii 1876                                                          catholicae Ecclesiae. .... 289',
    ].join('\n');
    const { rows, heading } = parseSummaPapalPart(text);
    expect(heading).toBe('ACTA SOLEMNIORA ROMANI PONTIFICIS');
    // The left column's first row, as printed -- not `ROMANI PONTIFICIS. Allocutio consistorialis …`,
    // which is what the unguarded draft regex left behind on the same line.
    expect(rows[0]!.raw).toBe('Allocutio consistorialis diei 12 Iulii 1876');
  });

  it('reads the mixed-case papal heading of ASS 9 (1876), where the class itself heads the part', () => {
    const { rows, heading } = parseSummaPapalPart('SUMMA ACTORUM\nQUAE IN HOC NONO VOLUMINE CONTINENTUR\nLitterae Apostolicae\nSS. D. Ii. P. Papae IX.\nLitterae Apostolicae ad Ducem Mutinae . . 581\nEX ACTIS CONSISTORIALIBUS\nDubia et responsa . . 557');
    expect(heading).toBe('Litterae Apostolicae');
    expect(rows.map((r) => r.page)).toEqual([581]);
  });

  it('does not read a dicastery heading as the papal part (ASS 2, 7, 26 open on one)', () => {
    for (const opener of ['EX ACTIS CONSISTORIALIBUS', 'EX ACTIS AD INSTAR CONSISTORIALIUM.', 'EX S. CONGR. RITUUM']) {
      const { rows, heading } = parseSummaPapalPart(`SUMMA ACTORUM\nQUAE IN HOC VOLUMINE CONTINENTUR\n${opener}\nDecretum quoddam . . 42`);
      expect(heading, opener).toBeNull();
      expect(rows, opener).toEqual([]);
    }
  });

  it('ends the papal part at a dicastery heading printed without the `EX` prefix (ASS 21 (1888) 750: `S. CONGR. INDICIS`)', () => {
    const { rows, end } = parseSummaPapalPart([
      'LITTERAE ET ACTA ROM. PONTIFICIS',
      'Litterae SSmi D. N. Leonis XIII ad Episcopos Hiberniae . . 3',
      'S. CONGR. INDICIS',
      'Decretum quo plures libri prohibentur . . 368',
    ].join('\n'));
    expect(end).toBe('S. CONGR. INDICIS');
    expect(rows.map((r) => r.page)).toEqual([3]);
  });

  it('reads the further forms `EX` is dropped from beyond the sample: ASS 21 (1888) 745\'s `S. CONGREGATIO CONCILII` (unabbreviated), ASS 3 (1867) 666\'s and ASS 4 (1868) 684\'s `ACTA CONSISTORIALIA` (a different noun, not `ACTIS`), and ASS 9 (1876) 669\'s title-case `Ex Actis Consistorialibus.`', () => {
    const cases: [string, string][] = [
      ['S. CONGREGATIO CONCILII', 'Gallipolitana curae animarum . . 13'],
      ['ACTA CONSISTORIALIA.', 'Acta authentica Consistorii secreti habiti die 12 Iulii 1867 . . 337'],
      ['ACTA CONSISTORIALIA', 'De Consistorio secreto habito die 22 Iunii 1868 . . 112'],
      ['Ex Actis Consistorialibus.', 'De Consistorio habito die 28 ianuarii 1876, pag. 73'],
    ];
    for (const [end, row] of cases) {
      const { rows, end: read } = parseSummaPapalPart(`SUMMA ACTORUM\nQUAE IN HOC VOLUMINE CONTINENTUR\nACTA ROMANI PONTIFICIS\nLitterae Apostolicae ad aliquem . . 5\n${end}\n${row}`);
      expect(read, end).toBe(end);
      expect(rows.map((r) => r.page), end).toEqual([5]);
    }
  });

  it('re-opens the papal part at a later papal heading (ASS 8 (1874) 727-728: `EX ACTIS CONSISTORIALIBUS.` closes the first part, `LITTERAE APOSTOLICAE.` on the next page reopens it, and the dicastery rows in between -- including a further dicastery heading, `EX AEDIBUS VATICANIS,`, that opens no papal heading of its own -- are skipped rather than counted)', () => {
    const text = [
      'ACTA ROMANI PONTIFICIS',
      'Sanctissimi Domini Nostri Pii Epistola Encyclica . . 181',
      'EX ACTIS CONSISTORIALIBUS.',
      'Nominationes complurium Episcoporum . . 498',
      'EX AEDIBUS VATICANIS,',
      'Allocutio habita die XXI. Dec. MDCCCLXXIV . . 177',
      'LITTERAE APOSTOLICAE.',
      'Litterae Apostolicae ad Doctorem Alphonsum Travaglini . . 496',
      'Litterae Apostolicae ad Baronem Nicolaum Taccone Gallucci . . 688',
      'EX S. CONGR. S. R. U. INQUISIT.',
      'Decretum quo duo prohibentur libri . . 269',
    ].join('\n');
    const { rows, heading, end } = parseSummaPapalPart(text);
    expect(heading).toBe('ACTA ROMANI PONTIFICIS');
    expect(end).toBe('EX S. CONGR. S. R. U. INQUISIT.');
    expect(rows.map((r) => r.page)).toEqual([181, 496, 688]);
  });

  it('reports no end when the part reopens and then runs to the text\'s end without a further dicastery heading', () => {
    const text = ['ACTA ROMANI PONTIFICIS', 'Epistola prima . . 5', 'EX ACTIS CONSISTORIALIBUS', 'Decretum . . 9', 'LITTERAE APOSTOLICAE', 'Epistola secunda . . 44'].join('\n');
    const { rows, end } = parseSummaPapalPart(text);
    expect(end).toBeNull();
    expect(rows.map((r) => r.page)).toEqual([5, 44]);
  });

  it('does not end the papal part on a row of its own that mentions a congregation in running text, mid-sentence and in mixed case (a saint\'s initial, `S. Ioannis`, is the same shape)', () => {
    const text = [
      'ACTA ROMANI PONTIFICIS',
      'Litterae SSmi D. N. Leonis XIII, quibus S. Congr. de Propaganda',
      '    Fide mandatur ut curam gerat . . 12',
      'S. Ioannis De Cuyo dioecesis erectio . . 439',
      'EX ACTIS CONSISTORIALIBUS',
      'De Consistorio habito . . 99',
    ].join('\n');
    const { rows, end } = parseSummaPapalPart(text);
    expect(end).toBe('EX ACTIS CONSISTORIALIBUS');
    expect(rows.map((r) => r.page)).toEqual([12, 439]);
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

describe('the first curation round (phase 2c-i, Task 4): the summa shapes the five volumes print', () => {
  const page761 = [
    '                                                                                                                                                          761',
    '                                         SUMMA ACTORUM',
    '          QUAE IN HOC VOLUMINE XXXIII CONTINENTUR',
    '',
    '              LITTERAE ET ACTA                                                            gustini ad Basilicam s. Petri in',
    '                     R. PONTIFICIS                                                        coelo aureo civitatis Papien­',
    '                                                                                          sis .198',
    'Litterae SSmi D. N. Leonis XIII ad                                                  Litterae SSmi D. N. Leonis XIII ad',
    '     Emum Vicarium, ut excitet Re­                                                        Emum Praesidem, occasione qua',
    '     veraque redeat concordia, p. 3                                                 Epistola Encyclica SSmi D. N. Leo­',
    'Litterae SSmi D. N. Leonis XIII ad                                                        nis XIII De Jesu Christo Redem­',
    '     Patriarcham et Episcopos Grae-                                                       ptore. ......... 273',
    '     co-Melchitas 65                                                                      stitutis vota simplicia profiten­',
    'Litterae in forma Brevis SSmi D.                                                          tium 341',
    '     N. Leonis XIII ad Archiepisco­                                                                 EX S. C. CONCILII',
    '     pum mediolanensem, quoad in-                                                   Senen. distributionum choralium;',
    '      res populi eligendos .... 3                                                       rario debeantur nonnullae dis- . 4',
  ].join('\n');
  it('locates a summa whose page-number line is padded past the sixty characters the heading regex allows (ASS 33 (1900) 761; ASS 12 (1879) 647)', () => {
    const body = 'body\n';
    const pages = [body, body, body, body, page761, '                                        INDEX GENERALIS\n rows'];
    expect(locateSumma(pages)).toEqual({ from: 5, to: 5 });
  });
  it('unweaves the two columns of ASS 1-33 so the left column\'s mid-line page tokens close rows (`co-Melchitas 65`, ASS 33 (1900) 761), and stops at `EX S. C. CONCILII`, whose stop admits no word boundary', () => {
    const { rows, heading, end } = parseSummaPapalPart(page761);
    expect(heading).toBe('LITTERAE ET ACTA');
    expect(end).toBe('EX S. C. CONCILII');
    expect(rows.map((r) => r.page)).toEqual([3, 65, 3, 198, 273, 341]);
    expect(rows[1]!.description).toBe('Litterae SSmi D. N. Leonis XIII ad Patriarcham et Episcopos Grae- co-Melchitas');
  });
  it('leaves a single-column page as printed (ASS 41\'s Index analyticus)', () => {
    expect(splitColumns(SUMMA_41)).toEqual(SUMMA_41.split('\n'));
  });
  it('reads the papal heading set over two lines (`LITTERAE` / `ET ACTA ROM. PONTIFICIS`, ASS 23 (1890) 752)', () => {
    const text = ['                      LITTERAE', '      ET ACTA ROM. PONTIFICIS', '', ' Litterae SSmi D. N. Leonis XIII', '     ad Cardinalem Lavigerie, occa­', '     in Africani profectum est. pag. 3', '      EX ACTIS CONSISTORIALIBUS', 'De Consistorio habito » 705'].join('\n');
    const { rows, heading, end } = parseSummaPapalPart(text);
    expect(heading).toBe('LITTERAE ET ACTA ROM. PONTIFICIS');
    expect(end).toBe('EX ACTIS CONSISTORIALIBUS');
    expect(rows.map((r) => r.page)).toEqual([3]);
  });
});
