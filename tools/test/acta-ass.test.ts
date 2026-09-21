import { describe, expect, it } from 'vitest';
import { assDate, findAnchors, scanVolume } from '../src/acta/ass.js';

const SPAN = { from: 1900, to: 1901 };

describe('assDate (ass volumes spec §3): the three spellings of the ASS dateline and the OCR of its numerals', () => {
  it('reads an arabic day and year', () => {
    expect(assDate('Datum Romae apud Sanctum Petrum, die 28 augusti 1879, Pontificatus Nostri anno secundo.', { from: 1879, to: 1879 })).toBe('1879-08-28');
  });
  it('reads a roman day and an `anno` roman year', () => {
    expect(assDate('Datum Romae apud S. Petrum die XXI Iulii anno MDCCCC, Pontificatus Nostri XXIII.', SPAN)).toBe('1900-07-21');
  });
  it('reads `An.` and `a.` before the year, which latinDate does not (ASS 33 p. 273, ASS 41 p. 19)', () => {
    expect(assDate('Datum Romae apud S. Petrum die i Novembris An. MDCCCC, Pontificatus Nostri vicesimo tertio.', SPAN)).toBe('1900-11-01');
    expect(assDate('Datum Romae apud S. Petrum, die xxv Iunii a. MDCCCCV, Pontificatus Nostri secundo.', { from: 1905, to: 1905 })).toBe('1905-06-25');
  });
  it('repairs the OCR of a roman numeral within the volume span: G for C, H for II, n for ii, an accented I (ASS 33 p. 285; ASS 41 pp. 297, 298, 491)', () => {
    expect(assDate('Datum Romae apud S. Petrum die i Novembris An. MDCGCC, Pontificatus Nostri vicesimo tertio.', SPAN)).toBe('1900-11-01');
    expect(assDate('Datum Romae apud S. Petrum, die xix Februarii MCMVHI, Pontificatus nostri anno quinto.', { from: 1908, to: 1908 })).toBe('1908-02-19');
    expect(assDate('Datum Romae apud Sanctum Petrum, die xxin Martii MCMViii, Pontificatus Nostri anno quinto.', { from: 1908, to: 1908 })).toBe('1908-03-23');
    expect(assDate('Datum Romae apud S. Petrum, die xxxi Martii MCMVIÌI, Pontificatus Nostri anno quinto.', { from: 1908, to: 1908 })).toBe('1908-03-31');
  });
  it('reads the year the constitutions spell in ordinal words before the day', () => {
    expect(assDate('Datum Romae apud Sanctum Petrum anno Incarnationis Dominicae millesimo nongentesimo octavo, tertio Kalendas Iulias, Pontificatus Nostri anno quinto.', { from: 1908, to: 1908 })).toBeNull();
    // The Kalends form is not read by rule (one act in the sample, *Sapienti consilio*): null, so the tool emits a defect and a curated reading supplies the date.
  });
  it('rejects a year more than ten years before the span, accepts one the ASS prints years late, rejects one after the span plus one, and rejects a formula without a day', () => {
    expect(assDate('Datum Romae apud S. Petrum die XXI Iulii anno MDCCCLXX, Pontificatus Nostri XXIII.', SPAN)).toBeNull();
    // ASS 41 (1908) prints nine letters of 1905 at pp. 12-20: printed years late, not early -- accepted.
    expect(assDate('Datum Romae apud S. Petrum, die xxv Iunii a. MDCCCCV, Pontificatus Nostri secundo.', { from: 1908, to: 1908 })).toBe('1905-06-25');
    expect(assDate('Datum Romae apud S. Petrum die iii Ianuarii anno MCMX, Pontificatus Nostri septimo.', { from: 1908, to: 1908 })).toBeNull();
    expect(assDate('Datum Romae ex Secretaria eiusdem sac. Congregationis 1879.', { from: 1879, to: 1879 })).toBeNull();
  });
  it('reads an Italian dateline (`Dal Vaticano, 20 Settembre 1900`)', () => {
    expect(assDate('Dal Vaticano, 20 Settembre 1900. Del Nostro Pontificato l\'anno XXIII.', SPAN)).toBe('1900-09-20');
  });
});

/** Three pages of a volume in the layout mode's shape: an act that opens on p. 2 and closes on p. 3, after a decree with a dicastery dateline on p. 1. The page numbers the headers print are the PDF pages (2, 3), as in the volumes, where the scanner checks the header against the page (`headerAgrees`). */
const PAGES = [
  [
    '                        DECRETUM',
    'Sacra Congregatio ... respondit.',
    '         Datum Romae ex Secretaria eiusdem sac. Congregationis die 20 Septembris 1879.',
    '',
  ].join('\n'),
  [
    '                                                          2',
    '          EPISTOLA ENCYCLICA Sanctissimi Domini Nostri LEONIS PAPAE XIII.',
    '                                           DE IESU CHRISTO REDEMPTORE.',
    '',
    '                                                        LEO PP. XIII',
    '',
    '      Venerabiles Fratres Salutem et Apostolicam Benedictionem.',
    '',
    '          Tametsi futura prospicientibus, vacuo a sollicitudine animo',
    'esse non licet, immo vero non paucae sunt nec leves extime-',
    'scendae formidines.',
  ].join('\n'),
  [
    '3                                             EPISTOLA ENCYCLICA',
    'communi studio summisque precibus flectere ad misericordiam',
    '         Datum Romae apud S. Petrum die i Novembris An. MDCGCC,',
    'Pontificatus Nostri vicesimo tertio.',
    '',
    '                                                     LEO PP. XIII.',
  ].join('\n'),
];

describe('findAnchors (spec §3): the pope\'s dateline, not a dicastery\'s; an allocution\'s heading', () => {
  it('anchors on `Datum Romae` followed within three lines by `Pontificatus Nostri`, and not on a Congregation\'s `Datum Romae ex Secretaria`', () => {
    const anchors = findAnchors(PAGES);
    expect(anchors).toHaveLength(1);
    expect(anchors[0]).toMatchObject({ page: 3, line: 2, kind: 'dateline' });
    expect(anchors[0]!.text).toContain('Datum Romae apud S. Petrum die i Novembris An. MDCGCC');
  });
  it('anchors an allocution on its heading, since it has no dateline (ASS 12 p. 13)', () => {
    const page = ['                                   la', '', '                ALLOCUTIO', '', '          SANCTISSIMI DOMINI NOSTRI LEONIS XIII', '     AD CATHOLICARUM EPHEMERIDUM REPRAESENTANTES', '', '       Ingenti sane laetitia suavique animi iucunditate hodie per-', 'fundimur ex conspectu frequentiaque vestra, filii dilectissimi,'].join('\n');
    const anchors = findAnchors([page]);
    expect(anchors).toEqual([{ page: 1, line: 2, kind: 'heading', text: 'ALLOCUTIO' }]);
  });
  it('anchors an Italian letter on `Del Nostro Pontificato`', () => {
    const page = ['Signor Cardinale,', 'I luttuosi avvenimenti ...', '   Dal Vaticano, 20 Settembre 1900.', '   Del Nostro Pontificato l\'anno XXIII.', '                     LEONE PP. XIII'].join('\n');
    expect(findAnchors([page])).toMatchObject([{ page: 1, line: 2, kind: 'dateline' }]);
  });
});

describe('scanVolume (spec §3): an act read from its dateline back to its heading', () => {
  const opts = { volume: 33, year: 1900, yearTo: 1901, lastBodyPage: 3 };
  it('reads category, pope, description, opening, date and page, and quotes the five lines', () => {
    const { entries, defects } = scanVolume(PAGES, opts);
    expect(defects).toEqual([]);
    expect(entries).toHaveLength(1);
    const e = entries[0]!;
    expect(e).toMatchObject({
      series: 'ASS', volume: 33, year: 1900, page: 2, pope: 'Leo XIII', category: 'EPISTOLA ENCYCLICA',
      date: '1900-11-01', incipit: null, quoted: false, toponym: null, anchor: 'dateline',
      opening: 'Tametsi futura prospicientibus, vacuo a sollicitudine animo esse',
      description: 'Sanctissimi Domini Nostri LEONIS PAPAE XIII. DE IESU CHRISTO REDEMPTORE.',
    });
    expect(e.evidence).toEqual({
      heading: 'EPISTOLA ENCYCLICA Sanctissimi Domini Nostri LEONIS PAPAE XIII. / DE IESU CHRISTO REDEMPTORE.',
      salutation: 'LEO PP. XIII',
      opening: 'Tametsi futura prospicientibus, vacuo a sollicitudine animo',
      dateline: 'Datum Romae apud S. Petrum die i Novembris An. MDCGCC, Pontificatus Nostri vicesimo tertio.',
      header: '2',
    });
    expect(e.raw).toBe('EPISTOLA ENCYCLICA Sanctissimi Domini Nostri LEONIS PAPAE XIII. / DE IESU CHRISTO REDEMPTORE.');
  });
  it('does not stop the walk-back at a running head (`3   EPISTOLA ENCYCLICA` at the top of the closing page, followed by body text)', () => {
    const { entries } = scanVolume(PAGES, opts);
    expect(entries[0]!.page).toBe(2);
  });
  it('does not stop the walk-back at a running head followed by a blank line, even when the body after it names `Pontifex` (`274 EPISTOLA ENCYCLICA`, ASS 41 (1908) 65)', () => {
    const pages = [
      PAGES[0]!,
      PAGES[1]!,
      [
        '274                                           EPISTOLA ENCYCLICA',
        '',
        'communi studio summisque precibus flectere ad misericordiam',
        'his verbis Pontifex adloquitur populum suum sine mora,',
        '         Datum Romae apud S. Petrum die i Novembris An. MDCGCC,',
        'Pontificatus Nostri vicesimo tertio.',
        '',
        '                                                     LEO PP. XIII.',
      ].join('\n'),
    ];
    const { entries, defects } = scanVolume(pages, opts);
    expect(defects).toEqual([]);
    expect(entries).toHaveLength(1);
    expect(entries[0]!.page).toBe(2);
  });
  it('reports an anchor with no heading before it (and after the previous anchor) as `no-heading`, with the dateline quoted', () => {
    const pages = [['Body of a decree.', '   Datum Romae apud S. Petrum die 3 Martii 1901,', 'Pontificatus Nostri vicesimo quarto.'].join('\n')];
    const { entries, defects } = scanVolume(pages, { ...opts, lastBodyPage: 1 });
    expect(entries).toEqual([]);
    expect(defects).toEqual([{ page: 1, reason: 'no-heading', lines: ['Datum Romae apud S. Petrum die 3 Martii 1901,', 'Pontificatus Nostri vicesimo quarto.'] }]);
  });
  it('reports an unreadable date as `no-date`, keeping the heading and the dateline in the lines', () => {
    const pages = [PAGES[0]!, PAGES[1]!, PAGES[2]!.replace('die i Novembris An. MDCGCC', 'anno Incarnationis Dominicae millesimo nongentesimo, tertio Kalendas Iulias')];
    const { entries, defects } = scanVolume(pages, opts);
    expect(entries).toEqual([]);
    expect(defects).toHaveLength(1);
    expect(defects[0]).toMatchObject({ page: 2, reason: 'no-date' });
    expect(defects[0]!.lines[0]).toContain('EPISTOLA ENCYCLICA');
  });
  it('reads an allocution from its heading: opening after the heading block, date `????-??-??` when the heading prints none, anchor `heading`', () => {
    const page = ['                                   la', '', '                ALLOCUTIO', '', '          SANCTISSIMI DOMINI NOSTRI LEONIS XIII', '     AD CATHOLICARUM EPHEMERIDUM REPRAESENTANTES', '', '       Ingenti sane laetitia suavique animi iucunditate hodie per-', 'fundimur ex conspectu frequentiaque vestra, filii dilectissimi,'].join('\n');
    const { entries, defects } = scanVolume([page], { volume: 12, year: 1879, yearTo: 1879, lastBodyPage: 1 });
    expect(defects).toEqual([]);
    expect(entries[0]).toMatchObject({
      category: 'ALLOCUTIO', pope: 'Leo XIII', page: 1, date: '????-??-??', anchor: 'heading',
      opening: 'Ingenti sane laetitia suavique animi iucunditate hodie perfundimur',
      evidence: { salutation: null, dateline: null, header: 'la' },
    });
  });
  it('dates an allocution from its own heading (`in Consistorio secreto diei 16 Decembris 1907`)', () => {
    const page = ['                ALLOCUTIO', '  quam Pius X habuit in Consistorio secreto diei 16 Decembris 1907,', '  de mendaci ac insolenti modernistarum superbia.', '', '   Venerabiles Fratres,', '', '   Quum novissime ad vos verba fecimus, iam tum ...'].join('\n');
    const { entries } = scanVolume([page], { volume: 41, year: 1908, yearTo: 1908, lastBodyPage: 1 });
    expect(entries[0]).toMatchObject({ pope: 'Pius X', date: '1907-12-16', anchor: 'heading', opening: 'Quum novissime ad vos verba fecimus, iam tum' });
  });
  it('reads two acts that open on one page, each from its own anchor', () => {
    const page = [
      '                                                          1',
      '                              EPISTOLA',
      '   Qua Pius X abolet scholas Pontificii Seminarii Vaticani.',
      '',
      '                                                    PIUS PP. X',
      '   Dilecte Fili Noster, salutem et Apostolicam Benedictionem.',
      '   Quum Seminarium Vaticanum, quod Nos ipsi ... constituimus.',
      '         Datum Romae apud S. Petrum, die xxv Iunii a. MDCCCCV, Pontificatus Nostri secundo.',
      '                              EPISTOLA',
      '   Qua Pius X laetatur de habito Concilio provinciali Burgensi.',
      '',
      '                                                    PIUS PP. X',
      '   Venerabilis Frater, salutem et Apostolicam Benedictionem.',
      '   Libenter accepimus litteras tuas quibus ... significas.',
      '         Datum Romae apud S. Petrum, die xxx Iunii a. MDCCCCV, Pontificatus Nostri secundo.',
    ].join('\n');
    // ASS 41 is the 1908 volume (year: 1908, the span Task 4 will pass), and prints this
    // pair's 1905 dates at pp. 12-20: the sanity bound (assDate) reaches ten years back and
    // one year forward of the span, which admits them without widening the volume's own span.
    const { entries, defects } = scanVolume([page], { volume: 41, year: 1908, yearTo: 1908, lastBodyPage: 1 });
    expect(defects).toEqual([]);
    expect(entries.map((e) => [e.date, e.opening.split(' ').slice(0, 2).join(' ')])).toEqual([['1905-06-25', 'Quum Seminarium'], ['1905-06-30', 'Libenter accepimus']]);
    expect(entries.every((e) => e.page === 1 && e.category === 'EPISTOLA' && e.pope === 'Pius X')).toBe(true);
    // The dateline-slice fix (stop at a blank or a heading line) is what keeps each entry's
    // own dateline from swallowing the other act's heading, since the two acts sit on one
    // page with no blank line between the first dateline and the second heading.
    expect(entries[0]!.evidence.dateline).toBe('Datum Romae apud S. Petrum, die xxv Iunii a. MDCCCCV, Pontificatus Nostri secundo.');
    expect(entries[1]!.evidence.dateline).toBe('Datum Romae apud S. Petrum, die xxx Iunii a. MDCCCCV, Pontificatus Nostri secundo.');
  });
  it('reports a page whose running header prints another number as `header-mismatch`', () => {
    const pages = [PAGES[0]!, PAGES[1]!.replace(/^\s*2\n/, '   291\n'), PAGES[2]!];
    const { entries, defects } = scanVolume(pages, opts);
    expect(entries).toEqual([]);
    expect(defects[0]).toMatchObject({ page: 2, reason: 'header-mismatch' });
  });
  it('ignores an anchor after `lastBodyPage` (the summa quotes no dateline, but the bound is kept anyway)', () => {
    const { entries } = scanVolume(PAGES, { ...opts, lastBodyPage: 2 });
    expect(entries).toEqual([]);
  });
});
