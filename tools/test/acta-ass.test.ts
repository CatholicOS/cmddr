import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { assDate, findAnchors, scanVolume } from '../src/acta/ass.js';
import { ACTA_SOURCES } from '../src/acta/join.js';
import { checkSumma, locateSumma, parseSummaPapalPart } from '../src/acta/summa.js';

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
  it('does not read the Kalends formula the constitutions spell in ordinal words: null, so the act is a defect a curated reading answers (ASS 41 (1908) 425, 619)', () => {
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

describe('the first curation round (phase 2c-i, Task 4): the dateline shapes the five volumes print', () => {
  it('reads `an.` and `ann.` before an arabic year (ASS 12 (1879) 115: `die 4 Augusti ann. 1879`; ASS 41 (1908) 195: `die xxvn Maii an. MCMVII`)', () => {
    expect(assDate('Datum Romae apud S. Petrum, die 4 Augusti ann. 1879. Pontificatus Nostri anno secundo', { from: 1879, to: 1879 })).toBe('1879-08-04');
    expect(assDate('Datum Romae apud S. Petrum, die xxvn Maii an. MCMVII, Pontificatus Nostri quarto.', { from: 1908, to: 1908 })).toBe('1907-05-27');
  });
  it('reads the year 1900 spelt `MCM`, the one year of the series three letters spell (ASS 33 (1900) 130: `die XXXI Augusti an. MCM`; 348: `die xix Decembris MCM`)', () => {
    expect(assDate('Datum Romae apud S. Petrum die XXXI Augusti an. MCM, Pontificatus Nostri vicesimo tertio.', SPAN)).toBe('1900-08-31');
    expect(assDate('Datum Romae apud S. Petrum, die xix Decembris MCM, Pontificatus Nostri anno vicesimo tertio.', SPAN)).toBe('1900-12-19');
  });
  it('drops the stop the early volumes print after the day (ASS 23 (1890) 522: `die III. Martii MDCCCXCI`; ASS 1 (1865) 581: `die XII. / Februarii Anno MDCCCLXVI`)', () => {
    expect(assDate('Datum Romae apud S. Petrum, die III. Martii MDCCCXCI, Pontificatus Nostri Decimo quarto.', { from: 1890, to: 1891 })).toBe('1891-03-03');
    expect(assDate('Datum Romae apud S. Petrum sub Annulo Piscatoris die XII. Februarii Anno MDCCCLXVI. Pontificatus Nostri Anno Vicesimo.', { from: 1865, to: 1866 })).toBe('1866-02-12');
  });
  it('never takes the pontificate\'s own year for the date (ASS 23 (1890) 439: `die I Ianuarii MDCCCXCI. Pontificatus Nostri anno XIII`, where `anno XIII` is the first `anno …` numeral)', () => {
    expect(assDate('exhibitae vel ostensae. Datum Romae apud S. Petrum sub annulo Piscatoris die I Ianuarii MDCCCXCI. Pontificatus Nostri anno XIII.', { from: 1890, to: 1891 })).toBe('1891-01-01');
  });
  it('reads the Italian datelines with `presso S. Pietro`, `il giorno` and `dell\'anno` (ASS 23 (1890) 206; ASS 33 (1900) 642, 715), and the French ones of ASS 41 (1908) 364 and ASS 33 (1900) 363, 722', () => {
    expect(assDate('Dato a Roma presso S. Pietro, li 15 Ottobre 1890, anno decimoterzo del Nostro Pontificato.', { from: 1890, to: 1891 })).toBe('1890-10-15');
    expect(assDate("Dato a Roma, presso S. Pietro, il giorno 28 marzo dell'anno 1901, vigesimoquarto del Nostro Pontificato.", SPAN)).toBe('1901-03-28');
    expect(assDate('Dato a Roma presso S. Pietro il giorno 11 Giugno 1901, del Nostro Pontificato anno vigesimo quarto.', SPAN)).toBe('1901-06-11');
    expect(assDate("Donné à Rome, 17 Mai de l'année 1908, de Notre Pontificat la cinquième.", { from: 1908, to: 1908 })).toBe('1908-05-17');
    // `l'an` (ASS 33 (1900) 363, the year on the next line) and `l'année` (ASS 33 722; ASS 41 364) are both printed.
    expect(assDate("Donné à Rome, près de Saint-Pierre, le 23 Décembre de l'an 1900, de Notre Pontificat le vingt-troisième.", SPAN)).toBe('1900-12-23');
    expect(assDate("Donné à Rome près Saint Pierre le 29 Juin de l'année 1901, vingtqUatrième de Notre Pontificat.", SPAN)).toBe('1901-06-29');
  });
  it('reads a signed dateline that prints no `Datum Romae` (ASS 41 (1908) 621: `Ex aedibus Vaticanis, die 9 Iulii 1908.`; 19: `Dalle stanze del Vaticano, il 23 Giugno 1905.`)', () => {
    expect(assDate('Ex aedibus Vaticanis, die 9 Iulii 1908.', { from: 1908, to: 1908 })).toBe('1908-07-09');
    expect(assDate('Dalle stanze del Vaticano, il 23 Giugno 1905.', { from: 1908, to: 1908 })).toBe('1905-06-23');
  });
});

describe('the first curation round: the anchors the five volumes print', () => {
  it('anchors on `Pon­ / tificatus Nostri` broken at the line end (ASS 33 (1900) 4) and on the lower-case `Pontificatus nostri` (ASS 23 (1890) 222)', () => {
    const p4 = ['timus.', '        Datum Romae, apud S. Petrum die VIII Iunii MCM Pon­', 'tificatus Nostri anno vigesimo tertio.'].join('\n');
    const p222 = ['         Datum Romae apud Sanet. Petrum Idibus Octobris anno', 'MDCCCLXXXX. Pontificatus nostri XIII.'].join('\n');
    expect(findAnchors([p4])).toMatchObject([{ page: 1, line: 1, kind: 'dateline' }]);
    expect(findAnchors([p222])).toMatchObject([{ page: 1, line: 0, kind: 'dateline' }]);
  });
  it('anchors a private letter on its place-and-date line followed by the pope\'s signature (ASS 41 (1908) 19; 621; ASS 33 (1900) 198 with the OCR\'s `LEO PP. XIIL`; the French letters of ASS 33 363 and 722), and not a dicastery\'s dateline signed by its cardinal', () => {
    const p19 = ["cuore l'Apostolica benedizione.", '          Dalle stanze del Vaticano, il 23 Giugno 1905.', '', '                                            PIUS PP. X'].join('\n');
    const p621 = ['        Ex aedibus Vaticanis, die 9 Iulii 1908.', '', '                                            PIUS PP. X'].join('\n');
    const p198 = ["l'Apostolica benedizione.", '                  Dal Vaticano li 19 agosto 1900.', '', '                                     LEO PP. XIIL'].join('\n');
    const p363 = ['        Donné à Rome, près de Saint-Pierre, le 23 Décembre de', "l'an 1900, de Notre Pontificat le vingt-troisième.", '', '                                                LEO PP. XIII.'].join('\n');
    const p722 = ["            Donné à Rome près Saint Pierre le 29 Juin de l'année 1901,", ' vingtqUatrième de Notre Pontificat.', '', '                                                           LEON XIII PAPE.'].join('\n');
    const decree = ['         Datum Romae ex Secretaria S. Congregationis die 9 Iulii 1908.', '', '                     A. Card. Di PIETRO, Praef.'].join('\n');
    expect(findAnchors([p363])).toMatchObject([{ page: 1, line: 0, kind: 'dateline' }]);
    expect(findAnchors([p722])).toMatchObject([{ page: 1, line: 0, kind: 'dateline' }]);
    expect(findAnchors([p19])).toMatchObject([{ page: 1, line: 1, kind: 'dateline' }]);
    expect(findAnchors([p621])).toMatchObject([{ page: 1, line: 0, kind: 'dateline' }]);
    expect(findAnchors([p198])).toMatchObject([{ page: 1, line: 1, kind: 'dateline' }]);
    expect(findAnchors([decree])).toEqual([]);
  });
});

describe('the first curation round: the heading shapes the five volumes print', () => {
  const opts33 = { volume: 33, year: 1900, yearTo: 1901, lastBodyPage: 9 };
  it('reads the pope from the caps block the 1879 volume sets above the class heading, through the blank lines after a lone class word, past the dative addressee to the salutation (ASS 12 (1879) 97)', () => {
    const page = [
      '                                                                                                       97',
      '                          SANCTISSIMI DOMINI NOSTRI', '', '                                     LEONIS', '', '                                DIVINA PROVIDENTIA', '', '                       PAPAE XIII.', '', '',
      '                              EPISTOLA ENCYCLICA.', '', '',
      '           AD PATRIARCHAS PRIMATES ARCHIEPISCOPOS ET EriSCOPOS', '                                 UNIVERSOS CATHOLICI ORBIS', '        GRATIAM ET COMMUNIONEM CUM APOSTOLICA SEDE HABENTES.', '', '', '', '', '', '', '',
      '        Venerabilibus Fratribus Patriarchis Primatibus Archiepiscopis et Episcopis', '                      Universis Catholici Orbis Gratiani et Communionem', '                                 cum Apostolica Sede Habentibus.', '', '',
      '                                          LEO PP. XIII', '',
      '               Venerabilibus Fratribus Salutem et Apostolicam Benedictionem', '',
      '        Aeterni Patris Unigenitus Filius, qui in terris apparuit,', 'ut humanum genus ...',
      '       Datum Romae apud S. Petrum, die 4 Augusti ann. 1879.', 'Pontificatus Nostri anno secundo',
    ].join('\n');
    // The page is the volume's 97th, as its header says (blank pages before it).
    const { entries, defects } = scanVolume([...Array.from({ length: 96 }, () => ''), page], { volume: 12, year: 1879, yearTo: 1879, lastBodyPage: 97 });
    expect(defects).toEqual([]);
    expect(entries[0]).toMatchObject({ category: 'EPISTOLA ENCYCLICA', pope: 'Leo XIII', date: '1879-08-04', page: 97, opening: 'Aeterni Patris Unigenitus Filius, qui in terris apparuit,', evidence: { salutation: 'LEO PP. XIII' } });
    expect(entries[0]!.evidence.heading).toBe('SANCTISSIMI DOMINI NOSTRI / LEONIS / DIVINA PROVIDENTIA / PAPAE XIII. / EPISTOLA ENCYCLICA. / AD PATRIARCHAS PRIMATES ARCHIEPISCOPOS ET EriSCOPOS / UNIVERSOS CATHOLICI ORBIS / GRATIAM ET COMMUNIONEM CUM APOSTOLICA SEDE HABENTES.');
  });
  it('opens an act on a heading whose block names no pope when the salutation follows past the caps addressee (ASS 41 (1908) 34, 299), reading the opening after the two-line greeting', () => {
    const page = [
      '                                                   MOTU PROPRIO', 'Quo reformatur Collegium Poenitentiariorum Franciscanum', '           Basilicae Lateranensis.', '',
      '                                                              PIUS PP. X',
      '          Singulari curare studio, ut praeclarus Ordo Fratrum Mi­', ' norum in omnibus rebus suum decus dignitatemque retineat,',
      '        Datum Romae apud S. Petrum, die xvn Septembris', 'anno MCMVII, Pontificatus Nostri quinto.', '', '                                                        PIUS PP. X', '',
      '                                                 EPISTOLA', 'Qua Pontifex gratias agit ob comparatam domum pro Inter-', '         nuntio Apostolico Reipublicae Argentinae.', '', '',
      '                                                   VENERABILI FRATRI', '', '                    MARIANO ANTONIO ARCHIEPISCOPO BONAERENSI', '', '                                                                                                       BONUM AEREM',
      '                                                          PIUS PP. x', '                            Venerabilis Frater et dilecte Fili,', '                       salutem et Apostolicam benedictionem.', '',
      '         Studiosa erga Iesu Christi Vicarium voluntas Argentino-', 'rum, Nobis quidem satis superque iam cognita, non mira­',
      '        Datum Romae apud S. Petrum, die xxiv Aprilis MCMVIII,', 'Pontificatus Nostri anno quinto.',
    ].join('\n');
    const { entries, defects } = scanVolume([page], { volume: 41, year: 1908, yearTo: 1908, lastBodyPage: 1 });
    expect(defects).toEqual([]);
    expect(entries.map((e) => [e.category, e.date, e.opening, e.evidence.salutation])).toEqual([
      ['MOTU PROPRIO', '1907-09-17', 'Singulari curare studio, ut praeclarus Ordo Fratrum Minorum', 'PIUS PP. X'],
      ['EPISTOLA', '1908-04-24', 'Studiosa erga Iesu Christi Vicarium voluntas Argentinorum, Nobis', 'PIUS PP. x'],
    ]);
    expect(entries[1]!.description).toBe('Qua Pontifex gratias agit ob comparatam domum pro Inter- nuntio Apostolico Reipublicae Argentinae.');
  });
  /** A volume of `page - 1` blank pages and this one, so that the running header the page prints is the PDF page (headerAgrees, as ASS 12 (1879) 97 above). */
  const atPage = (page: number, lines: string[]): string[] => [...Array.from({ length: page - 1 }, () => ''), lines.join('\n')];
  it('reads the class tail `in forma brevis` with a lower-case b as the same class the other volumes print with a capital one (ASS 23 (1890) 437 against ASS 33 (1900) 3, 129, 198, 577)', () => {
    const lines = [
      '                                                                                                                  437',
      '  LITTERAE in forma brevis Sanctissimi D. N. Leonis XIII quibus indulgen\u00ad',
      '          tiae conceduntur, occasione qua solemnia fiunt in honorem s. Aloisii',
      '          Gonzagae Xl Kalendas iulias huius anni, elapso, ab eius morte, spatio',
      '          trium saeculorum.',
      '',
      '',
      '           Opportune quidem et auspicato contingit, ut XI kalendas',
      ' iulias hoc anno sacra solemnia in honorem SANCTI ALOISII GON\u00ad',
      '',
      'exhibitae vel ostensae. Datum Romae apud S. Petrum sub annulo Piscatoris die I Ianuarii MDCCCXCI. Pontificatus Nostri anno XIII.',
    ];
    const { entries, defects } = scanVolume(atPage(437, lines), { volume: 23, year: 1890, yearTo: 1891, lastBodyPage: 437 });
    expect(defects).toEqual([]);
    expect(entries.map((e) => [e.category, e.page, e.date])).toEqual([['LITTERAE IN FORMA BREVIS', 437, '1891-01-01']]);
    // The tail is the class's, so the description begins after it and not with `in forma brevis`.
    expect(entries[0]!.description).toBe('Sanctissimi D. N. Leonis XIII quibus indulgen\u00ad tiae conceduntur, occasione qua solemnia fiunt in honorem s. Aloisii Gonzagae Xl Kalendas iulias huius anni, elapso, ab eius morte, spatio trium saeculorum.');
    // The same heading with the capital B the other four print reads the same class.
    const capital = lines.map((l) => l.replace('in forma brevis', 'in forma Brevis'));
    expect(scanVolume(atPage(437, capital), { volume: 23, year: 1890, yearTo: 1891, lastBodyPage: 437 }).entries.map((e) => e.category)).toEqual(['LITTERAE IN FORMA BREVIS']);
  });
  it('reads the opening past a greeting whose last words share the opening\'s line and which GREETING_RE does not close on (ASS 23 (1890) 449: `Benedictionem. Praeclarum studium, quo incensi estis, ut ex`)', () => {
    const lines = [
      '                                                                                                                  449',
      '',
      ' LITTERAE SSmi D. N. Leonis XIII ad Eminentissimum Parocchi, Vicarium',
      '          Urbis, et ad curatores saecularium solemnium s. Gregorii Magni, ob',
      '          delatam ei ante annos 1300 summam Ecclesiae potestatem.',
      '',
      '',
      '         Dilecte Fili Noster, et Dilecti Filii, Salutem et Apostolicam',
      ' Benedictionem. Praeclarum studium, quo incensi estis, ut ex',
      ' vestris litteris agnovimus, ad memoriam celebrandam S. Gre\u00ad',
      ' gorii Primi, huius Romanae Ecclesiae Antistitis, saeculo tertiode\u00ad',
      '',
      '  Datum Romae apud Sanctum Petrum die x Februarii Anno MDCccxci Pontificatus Nostri Decimotertio.',
    ];
    const { entries, defects } = scanVolume(atPage(449, lines), { volume: 23, year: 1890, yearTo: 1891, lastBodyPage: 449 });
    expect(defects).toEqual([]);
    expect(entries.map((e) => [e.opening, e.evidence.opening])).toEqual([[
      'Praeclarum studium, quo incensi estis, ut ex vestris',
      'Praeclarum studium, quo incensi estis, ut ex',
    ]]);
  });
  it('reads a greeting broken before its `salutem` as the opening, which is why ASS 41 (1908) 12 is a curated reading and not a rule (`Augustissime et potentissime Imperator, / salutem et prosperitatem.`; p. 18 l. 13 sets the same greeting on one line, which GREETING_RE reads whole)', () => {
    const lines = [
      '12                                                      Epistola',
      '',
      '                                                EPISTOLA',
      'Qua Pontifex grati animi sensus profitetur erga imperatorem',
      '       Sinarum.',
      '',
      '          AUGUSTISSIMO POTENTISSIMOQUE IMPERATORI SINARUM',
      '                                                                                              PEKINUM',
      '                                                 PIUS PP. x',
      '                     Augustissime et potentissime Imperator,',
      '                                     salutem et prosperitatem.',
      '',
      '       Quibus Nos litteris septuagesimum aetatis annum faustum',
      'et felicem Maiestati Suae Imperatrici Sinarum ominabamur,',
      '',
      '   Datum Romae apud S. Petrum, die VIII Iunii MDCCCCV, Pontificatus Nostri anno secundo.',
    ];
    const { entries, defects } = scanVolume(atPage(12, lines), { volume: 41, year: 1908, yearTo: 1908, lastBodyPage: 12 });
    expect(defects).toEqual([]);
    // The scanner stops at the greeting's first line, so the opening it records is the
    // greeting; ASS_READINGS `ASS:41:12` supplies the act's own first words (spec §6).
    expect(entries.map((e) => [e.category, e.date, e.opening])).toEqual([[
      'EPISTOLA', '1905-06-08', 'Augustissime et potentissime Imperator, salutem et prosperitatem.',
    ]]);
  });
  it('never opens an act on a running head with a trailing page number, whatever the body names (ASS 33 (1900) 201: `LITTERAE 201` over `Benedictus XIII Pontifex Maximus`; ASS 1 (1865) 195: `ALLOCUTIO SS. D. N. PII PAPAE IX. 195`)', () => {
    const pages = [
      ['                                                          LITTERAE 201', 'Episcopus cum Capitulo Cathedralis ; tertiam magister seu prae­', 'ses municipii Papiensis, id quod Benedictus XIII Pontifex Ma­', 'ximus largitus est: ut Episcopo et Capitulo Cathedralis ius as­', '', '         Datum Romae apud S. Petrum sub annulo Piscatoris die', 'XIV Septembris MCM. Pontificatus Nostri Anno Vigesimo tertio.'].join('\n'),
      ['ALLOCUTIO SS. D. N. PII PAPAE IX. 195', 'patent omnibus leges, quibus reguntur, patent quae iuxta Evan­', 'gelii doctrinam exercentur opera charitatis.'].join('\n'),
    ];
    expect(findAnchors(pages).filter((a) => a.kind === 'heading')).toEqual([]);
    const { entries, defects } = scanVolume(pages, { ...opts33, lastBodyPage: 2 });
    expect(entries).toEqual([]);
    expect(defects).toMatchObject([{ page: 1, reason: 'no-heading' }]);
  });
  it('reads the pope from `Leonis Divina Providentia Papae XIII` and the OCR\'s numerals `Xlii`, `Xiil`, `XÍII` (ASS 33 (1900) 341, 449, 642; ASS 23 (1890) 526), and `LEO EPISCOPUS` alone as the pope of the volume\'s year (ASS 33 349)', () => {
    const act = (heading: string, salutation: string) => [
      `   ${heading}`, '', `                     ${salutation}`, '', '   Dilecti Filii, salutem et Apostolicam benedictionem.', '', '   Conditae a Christo Ecclesiae ea vis divinitus inest ac fe­', 'cunditas, ut multas anteactis temporibus, plurimas aetate hac',
      '        Datum Romae apud S. Petrum, die xix Decembris MCM, Pontificatus Nostri anno vicesimo tertio.',
    ].join('\n');
    const popes = (pages: string[], year: number, yearTo: number) => scanVolume(pages, { volume: 33, year, yearTo, lastBodyPage: pages.length }).entries.map((e) => e.pope);
    expect(popes([act('CONSTITUTIO APOSTOLICA Sanctissimi Domini Nostri Leonis Divina Providentia / Papae XIII de Religiosorum Institutis.'.replace(' / ', '\n'), 'LEO EPISCOPUS')], 1900, 1901)).toEqual(['Leo XIII']);
    expect(popes([act('EPISTOLA Sanctissimi D. N. Leonis Xlii ad comitem de Ballestrem.', 'LEO PP. XIII')], 1900, 1901)).toEqual(['Leo XIII']);
    expect(popes([act('LITTERAE SS.mi Patris Leonis Xiil ad E.mum Archiepiscopum Vestmonasteriensem.', 'LEO PP. XIII')], 1900, 1901)).toEqual(['Leo XIII']);
    expect(popes([act('LITTERAE SSmi D. N. Leonis XÍII ad Abbatem Solesmensem.', 'LEO PP. XIII')], 1900, 1901)).toEqual(['Leo XIII']);
    expect(popes([act('LITTERAE SS.mi D. N. Leonis, quibus universalis iubilaeus extenditur.', 'LEO EPISCOPUS')], 1900, 1901)).toEqual(['Leo XIII']);
    expect(popes([act('CONSTITUTIO APOSTOLICA / De promulgatione legum et evulgatione actorum S. Sedis.'.replace(' / ', '\n'), 'PIUS EPISCOPUS')], 1908, 1908)).toEqual(['Pius X']);
    // A name a numeral follows that the table lacks is another pope's, and stays unread.
    expect(scanVolume([act('EPISTOLA quam Leonis XII decessor scripsit.', 'LEO EPISCOPUS')], { volume: 33, year: 1900, yearTo: 1901, lastBodyPage: 1 }).entries.map((e) => e.pope)).toEqual(['Leo XIII']);
  });
  it('reads the opening after a greeting set on its own line (ASS 33 (1900) 577: `Dilecti filii, salutem et Apostolicam benedictionem. Saecu­`) and past a dative addressee and its continuation (ASS 33 641: `Dilecto Filio Bartholomeo Froget Sodali Dominicano. / Pictavium.`)', () => {
    const p577 = [
      ' LITTERAE in forma Brevis SSmi O. N. Leonis XIII, occasione anni centesimi ab in­', '          stitutione nobilis cohortis Sacratissimum Principem protuentis.', '',
      '                                                       LEO PP. XIII.', ' Dilectis Filiis Protector ¿bus Nostri Lateris Merentibus et Emeritis.', '',
      '          Dilecti filii, salutem et Apostolicam benedictionem. Saecu­', 'laris eventus faustitas, quae nobilem cohortem vestram hisce', ' diebus laetitia merito perfundit, non ita cadit in rationem rerum',
      'trariis quibuscumque. Datum Romae apud Sanctum Petrum sub Annulo Piscatoris die 11 maii 1901. Pontificatus Nostri Anno Vicesimo quarto.',
    ].join('\n');
    const p641 = [
      'LITTERAE SS.mi Patris Leonis XIII ad auctorem libri in quo exposita est admira­', '        bilis inhabitatio Sancti Spiritus in animis iustis.', '',
      '           Dilecto Filio Bartholomeo Froget Sodali Dominicano.', '                                                                                                              Pictavium.', '',
      '          Dilecte Fili, salutem et Apostolicam Benedictionem. — De', 'ingenii doctrinaeque fructibus quos nobis frequentes catholico­', 'rum exhibet pietas, ii profecto solent multo accidere gratiores',
      '          Datum Romae apud Sanctum Petrum die 20 februarii 1901, Pontificatus Nostri vicesimo quarto.',
    ].join('\n');
    const { entries, defects } = scanVolume([p577, p641], { ...opts33, lastBodyPage: 2 });
    expect(defects).toEqual([]);
    expect(entries.map((e) => e.opening)).toEqual([
      'Saecularis eventus faustitas, quae nobilem cohortem vestram hisce',
      'De ingenii doctrinaeque fructibus quos nobis frequentes catholicorum',
    ]);
  });
  it('reads the OCR\'s `IITTERAE` as LITTERAE (ASS 33 (1900) 643), `LITTERAE Encyclicae` and `LETTERA Enciclica` with their class (ASS 23 (1890) 206, 193), and `CHIROGRAPHUM` (ASS 33 714)', () => {
    const tail = ['', '   Dilecte Fili, salutem et Apostolicam Benedictionem.', '', '   Iucundas scito Nobis communes litteras vestras fuisse. Me­', 'moriam beneficiorum colere, multoque magis ferre prae se pa­', '        Datum Romae apud S. Petrum, die 17 Maii anno 1901. Pontificatus Nostri vicesimo quarto.'];
    const heads = [
      'IITTERAE SSmi D. N. Leonis XIII ad Herbertum Story Praefectum et Vice-Cancel-',
      '        LITTERAE Encyclicae SS. D. N. Leonis XIII ad Episcopos, Clerum',
      '                 LETTERA Enciclica del Papa Leone XIII ai Vescovi, al Clero',
      'CHIROGRAPHUM Sanctissimi D. N. Leonis XIII quoad officia vacabilia Cancellariae',
    ];
    const pages = heads.map((h) => [h, ...tail].join('\n'));
    const { entries, defects } = scanVolume(pages, { ...opts33, lastBodyPage: 4 });
    expect(defects).toEqual([]);
    expect(entries.map((e) => e.category)).toEqual(['LITTERAE', 'LITTERAE ENCYCLICAE', 'LETTERA ENCICLICA', 'CHIROGRAPHUM']);
    expect(entries[0]!.evidence.heading).toBe('IITTERAE SSmi D. N. Leonis XIII ad Herbertum Story Praefectum et Vice-Cancel-');
  });
});

describe('the brevia of the Secretaria Brevium (phase 2c-ii-a): the ring of the Fisherman, the descriptive title, the pope\'s own name', () => {
  /**
   * ASS 41 (1908) 300-301 as printed, the page number dropped from p. 301's running head
   * and p. 300's first seven lines elided (the previous letter's body). Two acts stand
   * here: a letter to the Argentine bishops whose dateline carries no ring, and, under the
   * dicastery heading `EX SECRETARIA BREVIUM`, a breve of Pius X -- a descriptive title
   * where a class word should stand, the pope's name alone, the brief's own address
   * formula, and the ring dateline with the Secretary of Briefs' countersignature under it.
   */
  const BREVE_41 = [
    [
      ' divinorum munerum, ac testem peculiaris benevolentiae No­',
      ' strae, tibi, Venerabilis Frater, tuis in Episcopatu Collegis,',
      ' atque omni clero et populo Reipublicae Argentinae Aposto­',
      'licam benedictionem peramanter impertimus.',
      '         Datum Romae apud S. Petrum, die xxiv Aprilis MCMVIII,',
      ' Pontificatus Nostri anno quinto.',
      '',
      '                                                         PIUS PP. X',
      '',
      '                               EX SECRETARIA BREVIUM',
      '',
      '',
      'Indulgentia toties quoties pro visitantibus ecclesias congre­',
      '          gationis SS. Sacramenti in festo Corporis Christi.',
      '',
      '                                                        PIUS PP. X',
      '                                        AD FUTURAM REI MEMORIAM',
      '',
      '         Neminem latet festum SSmi Corporis Christi Domini in­',
      'ter alias Ecclesiae sollemnitates omni modo eminere, ideo­',
      'que Nobis nihil est antiquius quam ut dies quo Mysterium',
      'illud recolitur etiam caelesti indulgentiarum thesauro per uni­',
      'versum terrarum orbem eniteat. Hoc consilio votis hodierni',
    ].join('\n'),
    [
      '                                                Ex Secretaria Brevium',
      '',
      'gregationis SSmi Sacramenti ubique terrarum existentem de­',
      'vote visitent, ibique pro christianorum Principum concordia,',
      'dimus. Contrariis non obstantibus quibuscumque. Praesentibus',
      'perpetuo valituris.',
      '        Datum Romae apud S. Petrum sub annulo Piscatoris, die',
      'xxx Iulii MCMVi, Pontificatus Nostri anno tertio.',
      '',
      '                                                                        Pro Dno Card. MACCHI',
      '                                                                                        N. Marini.',
    ].join('\n'),
  ];

  it('reads a breve of Pius X from the ring of the Fisherman back to the descriptive title above the pope\'s own name (ASS 41 (1908) 300-301)', () => {
    const { entries, defects } = scanVolume(BREVE_41, { volume: 41, year: 1908, yearTo: 1908, lastBodyPage: 2 });
    expect(entries).toHaveLength(1);
    const e = entries[0]!;
    expect(e.category).toBe('BREVE');
    expect(e.pope).toBe('Pius X');
    expect(e.date).toBe('1906-07-30');
    expect(e.page).toBe(1);
    expect(e.anchor).toBe('dateline');
    expect(e.opening).toBe('Neminem latet festum SSmi Corporis Christi Domini inter');
    expect(e.evidence.heading).toBe('Indulgentia toties quoties pro visitantibus ecclesias congre­ / gationis SS. Sacramenti in festo Corporis Christi.');
    expect(e.evidence.salutation).toBe('PIUS PP. X');
    expect(e.evidence.dateline).toBe('Datum Romae apud S. Petrum sub annulo Piscatoris, die xxx Iulii MCMVi, Pontificatus Nostri anno tertio.');
    // The letter above it closes `Datum Romae apud S. Petrum, die xxiv Aprilis MCMVIII` --
    // no ring -- and no class heading stands behind it on the page quoted here: it stays a
    // `no-heading` defect, so the ring is what admits the breve and nothing else does.
    expect(defects).toEqual([{ page: 1, reason: 'no-heading', lines: ['Datum Romae apud S. Petrum, die xxiv Aprilis MCMVIII,', 'Pontificatus Nostri anno quinto.'] }]);
  });

  /**
   * ASS 9 (1876) 279-280 as printed: a breve of Pius IX under a Congregation's heading, and
   * under the breve the Congregation's own attestation of it, which its Substitute signs in
   * his own name (`Ex Secretaria eiusdem S. C. die 6 Maii 1876.` / `Dominicus Sarra,
   * Substitutus.`). The breve is the pope's -- his name stands alone over it and it closes
   * under his ring -- and the attestation is not: it prints no dateline the scanner anchors
   * on and no name of a pope, and yields neither an anchor nor an entry. The Cardinal
   * Prefect's countersignature under the ring (`F. Card. ASQUINIUS.`) is an attestation too,
   * and stands after the dateline, never where the pope's name stands.
   */
  const BREVE_9 = [
    [
      '          EX S. CONGREGATIONE INDULGENTIARUM',
      '',
      '',
      'Sanctissimi D. N. Pii Papae IX Breve, quo variae largiuntur in­',
      '',
      '         1.',
      '        dulgentiae recitantibus officium Immaculatae Conceptionis',
      '',
      '                                             PIUS PP. IX.',
      '                                AD PERPETUAM REI MEMORIAM.',
      '        Quae in animis Christifidelium erga Deiparam Imma­',
      'culatam amori excitando idonea et apta videntur, ea li­',
      'benter, cum a nobis postulantur, concedere solemus ; spes',
    ].join('\n'),
    [
      '280                                  Ex S. C. Indulgentiarum',
      '',
      'atque ut praesentes Litterae Apostolicae Secretariae In­',
      'dulgentiis et Sacris Reliquiis praepositae exhibeantur.',
      'Datum Romae apud S. Petrum sub annulo Piscatoris die',
      'xxxi martii MDCCCLXXVI, Pontificatus Nostri anno Trige­',
      'simo.',
      '                                                                   F. Card. ASQUINIUS.',
      '',
      '       Praesentes Litterae Apostolicae in forma Brevis sub',
      'datum Romae die 31 martii 1876 exhibitae fuerunt in Se­',
      'cretaria Sac. Congregationis Indulgentiis Sacrisque Re­',
      'liquiis praepositae iuxta praescripta in Decreto sub die',
      '14 aprilis 1856 ipsius S. Congregationis. In quorum',
      'fidem etc. Ex Secretaria eiusdem S. C. die 6 Maii 1876.',
      '                                                  Dominicus Sarra, Substitutus.',
    ].join('\n'),
  ];

  it('reads a breve of Pius IX the same way thirty-two years earlier, and reads nothing from the Congregation\'s own attestation under it (ASS 9 (1876) 279-280)', () => {
    const { entries, defects } = scanVolume(BREVE_9, { volume: 9, year: 1876, yearTo: 1876, lastBodyPage: 2 });
    expect(entries).toHaveLength(1);
    const e = entries[0]!;
    expect(e.category).toBe('BREVE');
    expect(e.pope).toBe('Pius IX');
    expect(e.date).toBe('1876-03-31');
    expect(e.page).toBe(1);
    expect(e.opening).toBe('Quae in animis Christifidelium erga Deiparam Immaculatam amori');
    // The `1.` the OCR sets between the title's two lines carries a page number's shape, so
    // the title is read from the line under it: what is above a page number is another page's.
    expect(e.evidence.heading).toBe('dulgentiae recitantibus officium Immaculatae Conceptionis');
    expect(e.evidence.salutation).toBe('PIUS PP. IX.');
    expect(defects).toEqual([]);
  });
});

describe('the entries fixtures are what the scanner writes from the store text (skipped when the store is absent)', () => {
  const store = `${process.env['ACTA_SOURCES'] ?? `${homedir()}/development/sources/ASS`}/txt`;
  for (const s of ACTA_SOURCES.filter((x) => x.kind === 'ass')) {
    const text = `${store}/ass-${String(s.volume).padStart(2, '0')}-${s.year}.txt`;
    it.skipIf(!existsSync(text))(`${s.key}: re-scanning the store text gives the fixture's entries, defects and summa check`, () => {
      const pages = readFileSync(text, 'utf8').split('\f');
      const fixture = JSON.parse(readFileSync(s.file, 'utf8'));
      const summaPages = locateSumma(pages);
      const lastBodyPage = summaPages ? summaPages.from - 1 : pages.length;
      const { entries, defects } = scanVolume(pages, { volume: s.volume, year: s.year, yearTo: s.yearTo ?? s.year, lastBodyPage });
      const summaText = summaPages ? pages.slice(summaPages.from - 1, summaPages.to).join('\f') + '\n' : '';
      expect(readFileSync(s.summaFile!, 'utf8')).toBe(summaText);
      expect(entries).toEqual(fixture.entries);
      expect(defects).toEqual(fixture.defects);
      expect(checkSumma(entries, { pages: summaPages, rows: parseSummaPapalPart(summaText).rows })).toEqual(fixture.summa);
    });
  }
});

describe('the entries fixtures are well-formed (runs offline)', () => {
  for (const s of ACTA_SOURCES.filter((x) => x.kind === 'ass')) {
    it(`${s.key}: every entry carries series ASS, the source's volume and year, a page within the volume, a pope the table names, a date or the unreadable marker, an opening of three to eight words and its five evidence lines`, () => {
      const fixture = JSON.parse(readFileSync(s.file, 'utf8'));
      expect(fixture.source).toBe(s.key);
      // ASS 1 (1865-66) is the one sample volume the scanner reads no act from: its papal
      // acts print no class heading of the list (`ALLOCVTIO`, `LITERAE APOSTOLICAE` under
      // the Secretaria Brevium with an editorial preface) -- the Task 4 report, ASS 1. The
      // fixture is the scan, and the scan is empty; its three acts are ASS_READINGS rows,
      // and Task 5's loader test asserts entries > 0 after the readings for every source.
      if (s.volume !== 1) expect(fixture.entries.length).toBeGreaterThan(0);
      for (const e of fixture.entries) {
        expect(e.series).toBe('ASS');
        expect(e.volume).toBe(s.volume);
        expect(e.year).toBe(s.year);
        expect(e.page).toBeGreaterThanOrEqual(1);
        expect(e.page).toBeLessThanOrEqual(fixture.pages);
        expect(['Pius IX', 'Leo XIII', 'Pius X']).toContain(e.pope);
        expect(e.date).toMatch(/^(\d{4}-\d{2}-\d{2}|\?\?\?\?-\?\?-\?\?)$/);
        expect(e.incipit).toBeNull();
        expect(e.opening.split(' ').length).toBeGreaterThanOrEqual(3);
        expect(e.opening.split(' ').length).toBeLessThanOrEqual(8);
        expect(['dateline', 'heading']).toContain(e.anchor);
        expect(Object.keys(e.evidence).sort()).toEqual(['dateline', 'header', 'heading', 'opening', 'salutation']);
      }
      // One page opens one act -- except the pages two short letters share, which the join's shared-page check reports.
      const pages = fixture.entries.map((e: { page: number }) => e.page);
      expect(new Set(pages).size).toBeGreaterThanOrEqual(pages.length - 6);
    });
  }
});
