import { describe, it, expect } from 'vitest';
import { applyPageCorrections, pagelessKey, parseIndexGeneralis, latinDate, formulaNear, findIncipit, recoverPages, applyPageRows } from '../src/acta/recover.js';
import { parseActaIndex, type ActaEntry, type ActaParseResult, type PagelessEntry } from '../src/acta/index.js';

describe('pagelessKey', () => {
  it('keys a pageless entry by date, category, incipit and the head of its description', () => {
    expect(pagelessKey({ date: '1921-01-06', category: 'LITTERAE ENCYCLICAE', incipit: 'Sacra propediem', description: 'Ad Patriarchas, Primates, Archiepiscopos, Episcopos aliosque locorum Ordinarios, pacem et communionem cum Apostolica Sede habentes' }))
      .toBe('1921-01-06|LITTERAE ENCYCLICAE|Sacra propediem|Ad Patriarchas, Primates, Archiepiscopos, Episcopos aliosque');
    expect(pagelessKey({ date: '1926-03-10', category: 'LITTERAE APOSTOLICAE', incipit: null, description: 'Short' })).toBe('1926-03-10|LITTERAE APOSTOLICAE||Short');
  });
});

// AAS 13 (1921) p. 571, pypdf default mode, as the store text carries it.
const AAS13_GENERALIS = `INDEX GENERALIS ACTORUM
(ANN. XIII — VOL. XIII)
I. - ACTA BENEDICTI PP. XV
EPISTOLAE ENCYCLICAE, 34, 209, 329.
CONSTITUTIONES APOSTOLICAE, 249-255,
299, 336, 370, 409, 457-469, 489.
LITTERAE APOSTOLICAE, 6-9,185-194,294-
307, 339-346, 372-377, 412-422, 469-
473, 491-494, 553.
EPISTOLAE, 10-12, 89-91, 127-131, 195 s.,
218-221, 256, 307, 346 s., 377, 423-429,
473, 494-496, 528-531, 554.
SERMO, 93.
PRECATIONUM FORMULAE, 369, 564.
SACRA CONSISTORIA, 121-126,281-289,521-
527.
II. - ACTA
SACRARUM CONGREGATIONUM
SUPREMA S. CONGREGATIO S. OFFICII :
a) Decreta, 42, 197.
`;

describe('parseIndexGeneralis', () => {
  it('reads the page runs of the pope part, per category, joining a run the line break splits and reading `s.` as the next page', () => {
    // The pope's part of AAS 13 ends at p. 570, the page before the Index generalis (p. 571).
    const g = parseIndexGeneralis(['front matter', 'body', AAS13_GENERALIS, 'INDEX DOCUMENTORUM\nCHRONOLOGICO ORDINE DIGESTUS'], 570);
    expect(g.page).toBe(3);
    // A singleton run (`209` alone, not `209-...`) is a section start (controller ruling
    // 11): extended to the page before the next section start of any category -- so `209`
    // (Litterae Encyclicae) runs to 217, the page before Epistulae's own `218-221` starts.
    // An explicit range (`249-255`) and a `195 s.` pair (`[195, 196]`) are untouched.
    expect(g.runs.get('Litterae Encyclicae')).toEqual([[34, 88], [209, 217], [329, 335]]);
    expect(g.runs.get('Constitutiones Apostolicae')).toEqual([[249, 255], [299, 306], [336, 338], [370, 371], [409, 411], [457, 469], [489, 490]]);
    expect(g.runs.get('Litterae Apostolicae')).toEqual([[6, 9], [185, 194], [294, 307], [339, 346], [372, 377], [412, 422], [469, 473], [491, 494], [553, 553]]);
    expect(g.runs.get('Epistulae')).toEqual([[10, 12], [89, 91], [127, 131], [195, 196], [218, 221], [256, 280], [307, 328], [346, 347], [377, 408], [423, 429], [473, 488], [494, 496], [528, 531], [554, 563]]);
    expect(g.runs.get('Sermones')).toEqual([[93, 120]]);
    // `PRECATIONUM FORMULAE` is the categories table's `Orationes` row (categories.ts):
    // the only prayer heading AAS 13 prints (no `ORATIO`). `369` abuts the next section's
    // own start (370, Constitutiones) and stays one page; `564`, the last start of the
    // part, runs to the part's end, 570 (controller ruling 17).
    expect(g.runs.get('Orationes')).toEqual([[369, 369], [564, 570]]);
    // The pope part ends at the dicasteries' part; nothing of it is read.
    expect(g.runs.has('Consistoria')).toBe(true);
    expect([...g.runs.keys()].some((k) => /OFFICII|Decreta/.test(k))).toBe(false);
    expect(g.unmapped).toEqual([]);
  });

  it('returns no page and no runs when the volume has no Index generalis', () => {
    const g = parseIndexGeneralis(['a', 'b', 'INDEX DOCUMENTORUM\nCHRONOLOGICO ORDINE DIGESTUS']);
    expect(g.page).toBeNull();
    expect(g.runs.size).toBe(0);
  });

  // AAS 1 (1909) p. 833, pypdf default mode, as the store text carries it.
  const AAS1_GENERALIS_RERUM = `I.
INDEX GENERALIS RERUM
ACTA PII PP. X.
LITTERAE APOSTOLICAE, 197, 229, 245,
269, 301, 389, 447, 477, 573, 605,
637, 669, 725, 757, 781, 802.
LITTERAE ENCYCLICAE, 333.
MOTU PROPRIO, 445, 801.
`;

  it('reads the page runs when the volume heads the table `INDEX GENERALIS RERUM`, not `...ACTORUM` (AAS 1-12, 1909-1920)', () => {
    // The pope's part of AAS 1 ends at p. 832, the page before the Index generalis (p. 833).
    const g = parseIndexGeneralis(['front matter', 'body', AAS1_GENERALIS_RERUM, 'INDEX DOCUMENTORUM\nCHRONOLOGICO ORDINE DIGESTUS'], 832);
    expect(g.page).toBe(3);
    // Every run here is a singleton (a bare page, not a range), so every one is a section
    // start extended to the page before the next section start of any category (ruling
    // 11) -- `802` is the last, so it runs to the part's end (ruling 17).
    expect(g.runs.get('Litterae Apostolicae')).toEqual([
      [197, 228], [229, 244], [245, 268], [269, 300], [301, 332], [389, 444], [447, 476],
      [477, 572], [573, 604], [605, 636], [637, 668], [669, 724], [725, 756], [757, 780], [781, 800], [802, 832],
    ]);
    expect(g.runs.get('Litterae Encyclicae')).toEqual([[333, 388]]);
    expect(g.runs.get('Litterae Apostolicae Motu proprio datae')).toEqual([[445, 446], [801, 801]]);
  });

  it('extends a singleton run to the page before the next section start of any category, not just its own (AAS 4, 1912, p. 745: `EPISTOLAE, 23, 51, 98, 138, …`; *Est sane* opens at p. 140, inside the section starting at 138, not on 138 itself)', () => {
    const text = `INDEX GENERALIS RERUM
ACTA PII PP. X.
EPISTOLAE, 23, 98.
LITTERAE APOSTOLICAE, 49, 137.
`;
    const g = parseIndexGeneralis(['front matter', 'body', text, 'INDEX DOCUMENTORUM\nCHRONOLOGICO ORDINE DIGESTUS']);
    expect(g.runs.get('Epistulae')).toEqual([[23, 48], [98, 136]]);
    // No last page given: the last start keeps its own page.
    expect(g.runs.get('Litterae Apostolicae')).toEqual([[49, 97], [137, 137]]);
  });

  it('extends the last singleton run of the part to the part\'s last page when it is given (controller ruling 17; AAS 7, 1915: the last `EPISTOLAE` start 589 runs to the part\'s end, where *Communis vestra* to the Brazilian bishops opens at p. 591)', () => {
    const text = `INDEX GENERALIS RERUM
ACTA BENEDICTI PP. XV
EPISTOLAE, 507, 589.
LITTERAE APOSTOLICAE, 553.
SACRAE CONGREGATIONES.
`;
    const g = parseIndexGeneralis(['front matter', 'body', text, 'INDEX DOCUMENTORUM\nCHRONOLOGICO ORDINE DIGESTUS'], 600);
    expect(g.runs.get('Epistulae')).toEqual([[507, 552], [589, 600]]);
    expect(g.runs.get('Litterae Apostolicae')).toEqual([[553, 588]]);
    // A last page at or before the start extends nothing.
    expect(parseIndexGeneralis(['front matter', 'body', text, 'INDEX DOCUMENTORUM\nCHRONOLOGICO ORDINE DIGESTUS'], 589).runs.get('Epistulae')).toEqual([[507, 552], [589, 589]]);
  });

  it('sets no run list for a heading whose pages it cannot read (AAS 16, 1924, p. 507: `LITTERAE ENCYCLICAE, 5 (12)`), so the category is searched over the whole part, not excluded from every page', () => {
    const text = `INDEX GENERALIS ACTORUM
I. - ACTA PII PP. XI
LITTERAE ENCYCLICAE, 5 (12)
EPISTOLA APOSTOLICA, 133.
MOTU PROPRIO, 177, 181, 417
II. - ACTA
SACRARUM CONGREGATIONUM
`;
    const g = parseIndexGeneralis(['front matter', 'body', text, 'INDEX DOCUMENTORUM\nCHRONOLOGICO ORDINE DIGESTUS'], 500);
    expect(g.runs.has('Litterae Encyclicae')).toBe(false);
    expect(g.runs.get('Litterae Apostolicae Motu proprio datae')).toEqual([[177, 180], [181, 416], [417, 500]]);
    expect(g.unmapped).toEqual([]);
  });

  it('detects the pope part when the OCR garbles the pope\'s name (AAS 16, 1924, p. 507: `I. - ACTA £\'11 PP. XI`, `PII` misread)', () => {
    const text = `INDEX GENERALIS ACTORUM
I. - ACTA £'11 PP. XI
LITTERAE ENCYCLICAE, 5.
`;
    const g = parseIndexGeneralis(['front matter', 'body', text, 'INDEX DOCUMENTORUM\nCHRONOLOGICO ORDINE DIGESTUS']);
    expect(g.runs.get('Litterae Encyclicae')).toEqual([[5, 5]]);
  });

  it('ends the pope part at a numeral the OCR misreads past roman letters (AAS 17, 1925, p. 672: `IL - ACTA` / `SACRARUM CONGREGATIONUM`, `II.` misread)', () => {
    const text = `INDEX GENERALIS ACTORUM
I. - ACTA PII PP. XI
LITTERAE ENCYCLICAE, 593.
IL - ACTA
SACRARUM CONGREGATIONUM
SUPREMA S. CONGREGATIO S. OFFICII, 69.
`;
    const g = parseIndexGeneralis(['front matter', 'body', text, 'INDEX DOCUMENTORUM\nCHRONOLOGICO ORDINE DIGESTUS']);
    expect(g.runs.get('Litterae Encyclicae')).toEqual([[593, 593]]);
    expect(g.runs.has('SUPREMA S. CONGREGATIO S. OFFICII')).toBe(false);
    expect(g.unmapped).toEqual([]);
  });

  it('ends the pope part at `SACRAE CONGREGATIONES`, which carries no `ACTA` token (AAS 2, 1910, p. 979: `SERMO, 906.` / `SACRAE CONGREGATIONES.` / `S. CONGREGATIO S. OFFICII, 55, 100, ...`)', () => {
    const text = `INDEX GENERALIS RERUM
ACTA PII PP. X.
SERMO, 906.
SACRAE CONGREGATIONES.
S. CONGREGATIO S. OFFICII, 55, 100, 477.
`;
    const g = parseIndexGeneralis(['front matter', 'body', text, 'INDEX DOCUMENTORUM\nCHRONOLOGICO ORDINE DIGESTUS']);
    expect(g.runs.get('Sermones')).toEqual([[906, 906]]);
    expect(g.runs.has('S. CONGREGATIO S. OFFICII')).toBe(false);
    expect(g.unmapped).toEqual([]);
  });
});

describe('latinDate', () => {
  it('reads the day in roman numerals, the year in roman numerals (MDCCCC and MCM)', () => {
    expect(latinDate('Datum Romae apud Sanctum Petrum, sub anulo Piscatoris, die xxx mensis Martii anno MDCCCCXXX, Pontificatus Nostri nono.')).toBe('1930-03-30');
    expect(latinDate('Datum Romae apud Sanctum Petrum die xx mensis Aprilis, in festo Paschae Resurrectionis D. N. I. C, anno MDCCCCXXX, Pontificatus Nostri nono.')).toBe('1930-04-20');
    expect(latinDate('Datum Romae, apud S. Petrum, die xii mensis Augusti, anno MCMXXI, Pontificatus Nostri septimo.')).toBe('1921-08-12');
  });
  it('reads the day and the year as ordinal words, in either order, with the OCR\'s misreadings of the words', () => {
    expect(latinDate('Datum Romae apud Sanctum Petrum, anno Domini millesimo nongentesimo ac trigesimo, die decimatertia mensis Augusti, Pontificatus Nostri anno nono.')).toBe('1930-08-13');
    expect(latinDate('Datum Romae, apud Sanctum Petrum, anno Domini nnllesimo nongentesimo trigesimo, die duodecima mensis Februarii, Pontificatus Nostri anno nono.')).toBe('1930-02-12');
    expect(latinDate('Datum Romae apud S. Petrum, anno Domini millesimo nongentesimo trigesimo, die trigesima prima mensis Ianuarii, Pontificatus Nostri anno octavo.')).toBe('1930-01-31');
    expect(latinDate('Datum Eomae, apud Sanctum Petrum, anno Domini millesimo nongentesimo vigesimo octavo die decimanona mensis Maii, Pontificatus Nostri anno septimo.')).toBe('1928-05-19');
  });
  it('reads the roman year right after the month when no `anno` precedes it (AAS 7, 1915, p. 569: `die x novembris MCMXV, Pontificatus Nostri anno secundo`)', () => {
    expect(latinDate('Datum Romae apud S. Petrum, die x novembris MCMXV, Pontifica­tus Nostri anno secundo.')).toBe('1915-11-10');
    expect(latinDate('Datum Romae apud S. Petrum, die ix decembris MCMXV, Pontificatus Nostri anno secundo.')).toBe('1915-12-09');
    // `Pontificatus Nostri anno secundo` is not a year, and `anno …` still wins over the year after the month.
    expect(latinDate('Datum Romae apud S. Petrum, die ix decembris, Pontificatus Nostri anno secundo.')).toBeNull();
    expect(latinDate('Datum Romae apud S. Petrum, die ix decembris MCMXV anno MCMXVI.')).toBe('1916-12-09');
  });
  it('reads arabic numerals, and returns null for text without a formula', () => {
    expect(latinDate('Datum Romae, ex aedibus Sacrae Congregationis Consistorialis, die 23 Aprilis 1930.')).toBe('1930-04-23');
    expect(latinDate('Datum Romae apud Sanctum Petrum, die 6 mensis Aprilis anno 1930, Pontificatus Nostri nono.')).toBe('1930-04-06');
    expect(latinDate('Ad perpetuam rei memoriam. — Quo maiori rerum fidei incremento')).toBeNull();
    expect(latinDate('Datum Romae apud Sanctum Petrum, die festo, Pontificatus Nostri nono.')).toBeNull();
  });
});

describe('formulaNear', () => {
  it('finds the first formula on or after a page, up to a limit, and says which page', () => {
    const pages = ['', 'opening of the act', 'more text', 'ends. Datum Romae apud Sanctum Petrum, die xxx mensis Martii anno MDCCCCXXX, Pontificatus Nostri nono. E. CARD. PACELLI', 'Datum Romae die i mensis Ianuarii anno MDCCCCXXXI'];
    expect(formulaNear(pages, 2, 4)).toMatchObject({ page: 4, date: '1930-03-30' });
    expect(formulaNear(pages, 5, 5)).toMatchObject({ page: 5, date: '1931-01-01' });
    expect(formulaNear(pages, 1, 3)).toBeNull();
  });
  it('reads the first page from a given line, so a formula above the act\'s opening is not the act\'s', () => {
    const pages = ['Datum Romae die i mensis Ianuarii anno MDCCCCXXXI. \nIV \nAd futuram rei memoriam. — Ex hac \nDatum Romae die xvi mensis Aprilis anno MDCCCCXXIV.'];
    expect(formulaNear(pages, 1, 1)).toMatchObject({ date: '1931-01-01' });
    expect(formulaNear(pages, 1, 1, 2)).toMatchObject({ date: '1924-04-16' });
  });
});

const HEADER = (n: number) => `${n} Acta Apostolicae Sedis - Commentarium Officiale`;
const BODY: string[] = [
  /* 1 */ 'Annus XIII - Vol. XIII 24 Ianuarii 1921 Num. 1 \nACTA APOSTOLICAE SEDIS \nEPISTOLA ENCYCLICA \nSacra propediem celebrari sollemnia, cum septingenti \nerunt anni',
  /* 2 */ `${HEADER(2)} \ntext of the encyclical, which mentions sacra propediem again in passing`,
  /* 3 */ `${HEADER(3)} \nLITTERAE APOSTOLICAE \nI \nPIUS PP. XI \nAd futuram rei memoriam. — Constat apprime quam sit \nDatum Romae apud Sanctum Petrum, die v mensis Martii anno MDCCCCXXI, Pontificatus Nostri septimo.`,
  /* 4 */ `Acta Benedicti PP. XV 4 \nII \nAd futuram rei memoriam. — Constat apprime alia res \nDatum Romae apud Sanctum Petrum, die xx mensis Maii anno MDCCCCXXI, Pontificatus Nostri septimo.`,
  /* 5 */ `${HEADER(5)} \nIII \nAd perpetuam rei memoriam. — Quae catholico nomini bene \nDatum Romae, die i mensis Iunii anno MDCCCCXXI.`,
  /* 6 */ `${HEADER(6)} \nEPISTOLAE \nDilecte fili. — Quoniam annus mox celebrabitur`,
  /* 7 */ `${HEADER(7)} \nIV \nAd futuram rei memoriam. — Placet oculos Nostris \nDatum Romae die ii mensis Iulii anno MDCCCCXXI.`,
  /* 8 */ 'INDEX GENERALIS ACTORUM \nI. - ACTA BENEDICTI PP. XV \nEPISTOLAE ENCYCLICAE, 1. \nLITTERAE APOSTOLICAE, 3-5, 7. \nEPISTOLAE, 6. \nII. - ACTA SACRARUM CONGREGATIONUM',
];
const entry = (date: string, category: string, incipit: string | null, description = 'Ad aliquem'): import('../src/acta/index.js').PagelessEntry =>
  ({ series: 'AAS', volume: 13, year: 1921, pope: 'Benedictus XV', category, date, incipit, quoted: false, toponym: null, description, raw: '' });

describe('findIncipit', () => {
  it('finds an incipit at the head of a paragraph -- after the salutation dash or at a line start -- and not inside running text', () => {
    expect(findIncipit(BODY[0]!, 'Sacra propediem', false)).toMatchObject({ line: 'Sacra propediem celebrari sollemnia, cum septingenti' });
    expect(findIncipit(BODY[1]!, 'Sacra propediem', false)).toBeNull();
    expect(findIncipit(BODY[2]!, 'Constat apprime', false)).toMatchObject({ line: 'Ad futuram rei memoriam. — Constat apprime quam sit' });
  });
  it('folds case, diacritics and soft hyphens, and joins a word the line break split', () => {
    expect(findIncipit('Ad perpetuam rei memoriam. — Quæ cathólico no­\nmini bene', 'Quae catholico nomini', false)).not.toBeNull();
    expect(findIncipit('Ad perpetuam rei memoriam. — Quo maio-\nri rerum fidei', 'Quo maiori rerum', false)).toEqual({ line: 'Ad perpetuam rei memoriam. — Quo maiori rerum fidei', lineIndex: 0 });
    expect(findIncipit('Prima li-\nnea longa.\nAd futuram rei memoriam. — Constat apprime quam sit', 'Constat apprime', false)).toEqual({ line: 'Ad futuram rei memoriam. — Constat apprime quam sit', lineIndex: 1 });
  });
  it('does not take a word that opens a line inside running text for a paragraph head (AAS 11, 1919, p. 109: `… titulo Nostrae Dominae a Salute` / `Parisiis canonice erectae`, inside *Dilectus filius*)', () => {
    const page = 'Acta Benedicti PP. XV 109 \nAd perpetuam rei memoriam. — Dilectus filius Iosephus Maubon, \nModerator Generalis Associationis titulo Nostrae Dominae a Salute \nParisiis canonice erectae, enixis nos precibus flagitat, ut nonnullas';
    expect(findIncipit(page, 'Parisiis', false)).toBeNull();
    expect(findIncipit(page, 'Dilectus filius', false)).toMatchObject({ lineIndex: 1 });
  });
  it('takes a line start for a paragraph head under a heading, a numeral, a salutation ending in a comma, or the memorial formula without its dash -- not under a sentence broken at an abbreviation (AAS 1, 1909, p. 100: `… statuitur in Const.` / `Sapienti consilio. In iis vero`)', () => {
    expect(findIncipit('PIUS PP. x. \nAbhinc duos annos, cum Constitutionem', 'Abhinc duos annos', false)).not.toBeNull();
    expect(findIncipit('II \nSuessionensis', 'Suessionensis', false)).not.toBeNull();
    expect(findIncipit('Signor Cardinale, \nFin dai primordi del nostro Pontificato', 'Fin dai primordi', false)).not.toBeNull();
    expect(findIncipit('Ad perpetuam rei memoriam. \nCum incolarum numerus', 'Cum incolarum', false)).not.toBeNull();
    expect(findIncipit('1.° Quaenam sit huius Congregationis auctoritas statuitur in Const. \nSapienti consilio. In iis vero quae ad internam disciplinam', 'Sapienti Consilio', false)).toBeNull();
  });
  it('does not take a word after a full stop inside a line for a paragraph head (AAS 1, 1909, p. 71: `Iuxta praescriptum Constit. Promulgandi`; AAS 2, 1910, p. 562: `constanter. Sollertiae vestrae`), and reads the dash as the OCR draws it', () => {
    expect(findIncipit('ORDO SERVANDUS \nIuxta praescriptum Constit. Promulgandi, quae hac ipsa die vulgatur', 'Promulgandi', false)).toBeNull();
    expect(findIncipit('EPISTOLAE \nadhibete constanter. Sollertiae vestrae Eum profecto', 'Solertiae', true)).toBeNull();
    for (const dash of ['. —Delectarunt', '.— Cuncta', '. -—- Plane', '. =— Quae', '. •—• Ante', '. - Placet', '.—-Inter']) {
      const [w] = dash.match(/[A-Z][a-z]+/)!;
      expect(findIncipit(`HEADING \nVenerabilis Frater, salutem et apostolicam benedictionem${dash} Nos tuae`, w, false), dash).not.toBeNull();
    }
    expect(findIncipit('HEADING \nDilecte Fili, salutem et apostolicam benedictionem. -\nVix poteras', 'Vix poteras', false)).not.toBeNull();
  });
  it('in fuzzy mode admits one wrong character per word of five letters or more, and nothing in a shorter word', () => {
    expect(findIncipit(BODY[6]!, 'Placet oculog', false)).toBeNull();
    expect(findIncipit(BODY[6]!, 'Placet oculog', true)).toMatchObject({ line: 'Ad futuram rei memoriam. — Placet oculos Nostris' });
    expect(findIncipit(BODY[6]!, 'Placet oculogg', true)).toBeNull();
    expect(findIncipit(BODY[6]!, 'Plaset oculis', true)).not.toBeNull();
    expect(findIncipit(BODY[6]!, 'Pl oculis', true)).toBeNull();
  });
});

describe('recoverPages', () => {
  const generalis = parseIndexGeneralis(BODY);
  it('accepts a unique hit within the category\'s runs, quoting the body line and the running header', () => {
    const { rows, unrecovered } = recoverPages([entry('1921-01-06', 'LITTERAE ENCYCLICAE', 'Sacra propediem')], BODY, generalis, { lastBodyPage: 7 });
    expect(unrecovered).toEqual([]);
    expect(rows).toEqual([expect.objectContaining({ page: 1, rule: 'unique', incipit: 'Sacra propediem', header: 'Annus XIII - Vol. XIII 24 Ianuarii 1921 Num. 1', bodyLine: 'Sacra propediem celebrari sollemnia, cum septingenti' })]);
  });
  it('settles two acts of one incipit by the dating formula (both `dated`, controller ruling 18 unchanged), and reports the one whose date no formula gives', () => {
    const { rows, unrecovered } = recoverPages([
      entry('1921-03-05', 'LITTERAE APOSTOLICAE', 'Constat apprime', 'First'),
      entry('1921-05-20', 'LITTERAE APOSTOLICAE', 'Constat apprime', 'Second'),
      entry('1921-09-09', 'LITTERAE APOSTOLICAE', 'Constat apprime', 'Third'),
    ], BODY, generalis, { lastBodyPage: 7 });
    expect(rows.map((r) => [r.page, r.rule, r.formula?.slice(0, 11)])).toEqual([[3, 'dated', 'Datum Romae'], [4, 'dated', 'Datum Romae']]);
    expect(rows.every((r) => r.fuzzy === undefined)).toBe(true);
    expect(unrecovered).toEqual([expect.objectContaining({ reason: 'several', candidates: [3, 4] })]);
  });
  it('gives a page to one claimant of an incipit only: two pageless entries of one incipit and one body hit are both `claimants` with the page as candidate (controller ruling 18; AAS 7, 1915: two letters *Communis vestra* of 10 November, one hit at p. 569)', () => {
    // Both entries carry the hit's date, so the formula would settle each on p. 5 alone.
    const { rows, unrecovered } = recoverPages([
      entry('1921-06-01', 'LITTERAE APOSTOLICAE', 'Quae catholico nomini', 'To the Ligurian bishops'),
      entry('1921-06-01', 'LITTERAE APOSTOLICAE', 'Quae catholico nomini', 'To the Brazilian bishops'),
    ], BODY, generalis, { lastBodyPage: 7 });
    expect(rows).toEqual([]);
    expect(unrecovered.map((u) => [u.reason, u.candidates])).toEqual([['claimants', [5]], ['claimants', [5]]]);
    expect(unrecovered.map((u) => u.key)).toEqual([
      '1921-06-01|LITTERAE APOSTOLICAE|Quae catholico nomini|To the Ligurian bishops',
      '1921-06-01|LITTERAE APOSTOLICAE|Quae catholico nomini|To the Brazilian bishops',
    ]);
  });
  it('counts the volume\'s paged entries as claimants: one pageless entry whose incipit a paged entry of the category carries, with one body hit, is `claimants`, not `unique`', () => {
    const paged = [{ category: 'LITTERAE APOSTOLICAE', incipit: 'Quae catholico nomini', page: 5 }];
    const { rows, unrecovered } = recoverPages([entry('1921-06-01', 'LITTERAE APOSTOLICAE', 'Quae catholico nomini')], BODY, generalis, { lastBodyPage: 7, paged });
    expect(rows).toEqual([]);
    expect(unrecovered).toEqual([expect.objectContaining({ reason: 'claimants', candidates: [5] })]);
    // Without the paged claimant the same hit is `unique`; with a paged claimant of another
    // category or another incipit it still is.
    expect(recoverPages([entry('1921-06-01', 'LITTERAE APOSTOLICAE', 'Quae catholico nomini')], BODY, generalis, { lastBodyPage: 7 }).rows).toEqual([expect.objectContaining({ page: 5, rule: 'unique' })]);
    expect(recoverPages([entry('1921-06-01', 'LITTERAE APOSTOLICAE', 'Quae catholico nomini')], BODY, generalis, { lastBodyPage: 7, paged: [{ category: 'EPISTOLAE', incipit: 'Quae catholico nomini', page: 5 }, { category: 'LITTERAE APOSTOLICAE', incipit: 'Alia verba', page: 5 }] }).rows)
      .toEqual([expect.objectContaining({ page: 5, rule: 'unique' })]);
    // A contested incipit whose one hit's formula gives another date is `several`, never the page.
    expect(recoverPages([entry('1921-06-02', 'LITTERAE APOSTOLICAE', 'Quae catholico nomini')], BODY, generalis, { lastBodyPage: 7, paged }).unrecovered)
      .toEqual([expect.objectContaining({ reason: 'several', candidates: [5] })]);
  });
  it('marks a tie settled by the formula among fuzzy hits as `dated` with `fuzzy: true`', () => {
    const body = [
      `${HEADER(1)} \nLITTERAE APOSTOLICAE \nI \nAd futuram rei memoriam. — Placet oculos Nostris \nfiller with no formula`,
      `${HEADER(2)} \nII \nAd futuram rei memoriam. — Placet oculos Nostris \nDatum Romae die ii mensis Iulii anno MDCCCCXXI.`,
    ];
    const g = { page: null, runs: new Map<string, [number, number][]>([['Litterae Apostolicae', [[1, 2]]]]), unmapped: [] as string[] };
    const { rows, unrecovered } = recoverPages([entry('1921-07-02', 'LITTERAE APOSTOLICAE', 'Placet oculog')], body, g, { lastBodyPage: 2 });
    expect(unrecovered).toEqual([]);
    expect(rows).toEqual([expect.objectContaining({ page: 2, rule: 'dated', fuzzy: true, bodyLine: 'Ad futuram rei memoriam. — Placet oculos Nostris' })]);
    expect(rows[0]!.formula).toMatch(/^Datum Romae die ii mensis Iulii/);
  });
  it('retries a missed incipit fuzzily, accepts a unique fuzzy hit, and reports a miss', () => {
    const { rows, unrecovered } = recoverPages([entry('1921-07-02', 'LITTERAE APOSTOLICAE', 'Placet oculog'), entry('1921-07-03', 'LITTERAE APOSTOLICAE', 'Nihil tale')], BODY, generalis, { lastBodyPage: 7 });
    expect(rows).toEqual([expect.objectContaining({ page: 7, rule: 'fuzzy' })]);
    expect(unrecovered).toEqual([expect.objectContaining({ incipit: 'Nihil tale', reason: 'none' })]);
  });
  it('reports a hit outside every run of the category, an entry without an incipit, and a page whose header disagrees', () => {
    const { rows, unrecovered } = recoverPages([
      entry('1921-06-01', 'LITTERAE ENCYCLICAE', 'Quae catholico nomini'),   // on p. 5, a Litterae Apostolicae page; Litterae Encyclicae run is 1
      entry('1921-06-06', 'EPISTOLAE', null),
    ], BODY, generalis, { lastBodyPage: 7 });
    expect(rows).toEqual([]);
    expect(unrecovered.map((u) => u.reason)).toEqual(['outside-runs', 'no-incipit']);
    const bad = BODY.map((p, i) => (i === 4 ? p.replace(HEADER(5), HEADER(9)) : p));
    const r2 = recoverPages([entry('1921-06-01', 'LITTERAE APOSTOLICAE', 'Quae catholico nomini')], bad, parseIndexGeneralis(bad), { lastBodyPage: 7 });
    expect(r2.unrecovered).toEqual([expect.objectContaining({ reason: 'header-mismatch', candidates: [5] })]);
  });
  it('accepts a header that prints no digit at all (the OCR dropped the number: `Acta Pii PP. X.`), quoting it as read', () => {
    const numberless = BODY.map((p, i) => (i === 4 ? p.replace(HEADER(5), 'Acta Benedicti PP. XV') : p));
    const { rows, unrecovered } = recoverPages([entry('1921-06-01', 'LITTERAE APOSTOLICAE', 'Quae catholico nomini')], numberless, parseIndexGeneralis(numberless), { lastBodyPage: 7 });
    expect(unrecovered).toEqual([]);
    expect(rows).toEqual([expect.objectContaining({ page: 5, rule: 'unique', header: 'Acta Benedicti PP. XV' })]);
  });
  it('accepts a header that prints the number with one character wrong (AAS 3, 1911, p. 344: `34i Acta Apostolicae ...`), and still refuses one that prints another number', () => {
    const header = '34i Acta Apostolicae Sedis. - Commentarium Officiale.';
    const body = (h: string) => [
      ...Array.from({ length: 343 }, (_, i) => `${i + 1} Acta Apostolicae Sedis. - Commentarium Officiale. \nfiller`),
      `${h} \nAd futuram rei memoriam. — Deferendo nuper honoribus \nDatum Romae die i mensis Iunii anno MDCCCCXI.`,
    ];
    const g = { page: null, runs: new Map<string, [number, number][]>([['Litterae Apostolicae', [[340, 344]]]]), unmapped: [] as string[] };
    const e = [entry('1911-06-01', 'LITTERAE APOSTOLICAE', 'Deferendo nuper')];
    const ok = recoverPages(e, body(header), g, { lastBodyPage: 344 });
    expect(ok.unrecovered).toEqual([]);
    expect(ok.rows).toEqual([expect.objectContaining({ page: 344, rule: 'unique', header })]);
    const other = recoverPages(e, body('341 Acta Apostolicae Sedis. - Commentarium Officiale.'), g, { lastBodyPage: 344 });
    expect(other.rows).toEqual([]);
    expect(other.unrecovered).toEqual([expect.objectContaining({ reason: 'header-mismatch', candidates: [344] })]);
  });
  it('searches the whole pope part, and requires the dating formula, when the Index generalis has no run for the category', () => {
    const noRuns = { page: null, runs: new Map<string, [number, number][]>(), unmapped: [] as string[] };
    const { rows, unrecovered } = recoverPages([entry('1921-06-01', 'LITTERAE APOSTOLICAE', 'Quae catholico nomini'), entry('1921-01-06', 'LITTERAE ENCYCLICAE', 'Sacra propediem')], BODY, noRuns, { lastBodyPage: 7 });
    expect(rows).toEqual([expect.objectContaining({ page: 5, rule: 'dated' })]);
    expect(unrecovered).toEqual([expect.objectContaining({ incipit: 'Sacra propediem', reason: 'several', candidates: [1] })]);
  });
  it('settles a tie only by a formula inside the act\'s own run: an unrelated act\'s formula beyond the run confirms nothing', () => {
    const body = [
      'Acta Pii PP. XI 1 \nAd futuram rei memoriam. — Common incipit phrase',
      '2 Acta Apostolicae Sedis - Commentarium Officiale \nAd futuram rei memoriam. — Common incipit phrase',
      '3 Acta Apostolicae Sedis - Commentarium Officiale \nfiller with no formula',
      'Acta Pii PP. XI 4 \nUNRELATED ACT ENTIRELY. — Something else \nDatum Romae apud Sanctum Petrum, die i mensis Ianuarii anno MDCCCCXXV.',
    ];
    const g = { page: null, runs: new Map<string, [number, number][]>([['Litterae Apostolicae', [[1, 2]]]]), unmapped: [] as string[] };
    const { rows, unrecovered } = recoverPages([entry('1925-01-01', 'LITTERAE APOSTOLICAE', 'Common incipit phrase')], body, g, { lastBodyPage: 4 });
    expect(rows).toEqual([]);
    expect(unrecovered).toEqual([expect.objectContaining({ reason: 'several', candidates: [1, 2] })]);
  });
  it('settles a tie by a formula from the hit\'s own line on: the previous act\'s formula at the top of the page confirms nothing (AAS 16, 1924, p. 269: *Ex hac* opens under the 15 April formula of the letter before it, and its own is on p. 270)', () => {
    const body = [
      'Acta Pii PP. XI \nDatum Romae apud Sanctum Petrum, die xv mensis aprilis, anno MDCCCCXXIV. \nIV \nPIUS PP. XI \nAd futuram rei memoriam. — Ex hac beati Petri cathedra',
      'Acta Apostolicae Sedis - Commentarium Officiale \ntibus continetur. Ex hac vero parte territorii \nDatum Romae apud Sanctum Petrum, die xvi mensis aprilis, anno MDCCCCXXIV.',
      'Acta Pii PP. XI \nV \nPIUS PP. XI \nAd futuram rei memoriam. — Ex hac divi Petri cathedra \nDatum Romae apud Sanctum Petrum, die v mensis decembris, anno MDCCCCXXIV.',
    ];
    const g = { page: null, runs: new Map<string, [number, number][]>([['Litterae Apostolicae', [[1, 3]]]]), unmapped: [] as string[] };
    const { rows } = recoverPages([entry('1924-04-16', 'LITTERAE APOSTOLICAE', 'Ex hac'), entry('1924-12-05', 'LITTERAE APOSTOLICAE', 'Ex hac', 'Other')], body, g, { lastBodyPage: 3 });
    expect(rows.map((r) => [r.page, r.rule, r.date])).toEqual([[1, 'dated', '1924-04-16'], [3, 'dated', '1924-12-05']]);
  });
  it('reads the tie\'s formula from the hit\'s line in the same joined-line space the incipit was found in: hyphen breaks above the hit do not shift the window over the previous act\'s formula', () => {
    // Three words the line break split (`impertimus`, `Pontifi-` / `catus`, `Se­` / `cretis` with a soft hyphen)
    // sit above the previous act's formula, which sits two lines above the hit: joined, the hit is line 4 and
    // the formula line 2; in the raw lines the formula is line 5. A window started at raw line 4 would hold it.
    const body = [
      'Acta Pii PP. XI \nbenedictionem amantissime imper-\ntimus, Pontifi-\ncatus Nostri tertio, a Se­\ncretis Status. \nDatum Romae apud Sanctum Petrum, die xv mensis aprilis, anno MDCCCCXXIV. \nIV \nAd futuram rei memoriam. — Ex hac beati Petri cathedra',
      'Acta Apostolicae Sedis - Commentarium Officiale \ntibus continetur. \nDatum Romae apud Sanctum Petrum, die xvi mensis aprilis, anno MDCCCCXXIV.',
      'Acta Pii PP. XI \nV \nPIUS PP. XI \nAd futuram rei memoriam. — Ex hac divi Petri cathedra \nfiller with no formula',
    ];
    expect(findIncipit(body[0]!, 'Ex hac', false)).toMatchObject({ lineIndex: 4 });
    expect(formulaNear(body, 1, 1, 4)).toBeNull();
    expect(formulaNear(body, 1, 2, 4)).toMatchObject({ page: 2, date: '1924-04-16' });
    const g = { page: null, runs: new Map<string, [number, number][]>([['Litterae Apostolicae', [[1, 3]]]]), unmapped: [] as string[] };
    const { rows, unrecovered } = recoverPages([entry('1924-04-15', 'LITTERAE APOSTOLICAE', 'Ex hac', 'Earlier'), entry('1924-04-16', 'LITTERAE APOSTOLICAE', 'Ex hac')], body, g, { lastBodyPage: 3 });
    // The 15 April entry finds no formula of its own inside either hit's span (the one above p. 1's hit is not the hit's), and the
    // 16 April entry takes the formula after its hit, on p. 2.
    expect(unrecovered).toEqual([expect.objectContaining({ date: '1924-04-15', reason: 'several', candidates: [1, 3] })]);
    expect(rows.map((r) => [r.page, r.rule, r.date])).toEqual([[1, 'dated', '1924-04-16']]);
  });
});

describe('applyPageCorrections', () => {
  const parse = () => parseActaIndex(`                                  H

                             INDEX DOCUMENTORUM
               CHRONOLOGICO ORDINE DIGESTUS

                                  I. - ACTA PII PP. XI

                                                         I. - LITTERAE ENCYCLICAE.
1930          Apr.         20      Ad salutem. - Ad venerabiles fratres 201
              Dec.         31      Casti connubii. - Ad venerabiles fratres 530
`, { year: 1930, volume: 22, columnar: true });
  it('replaces the page the index prints with the page the volume opens the act at, keeping the printed one', () => {
    const r = parse();
    const n = applyPageCorrections(r, [{ key: '1930-12-31|LITTERAE ENCYCLICAE|Casti connubii|Ad venerabiles fratres', printed: 530, page: 539 }], 'test');
    expect(n).toBe(1);
    expect(r.entries.map((e) => [e.incipit, e.page, e.printedPage, e.pageSource])).toEqual([['Ad salutem', 201, undefined, undefined], ['Casti connubii', 539, 530, 'corrected']]);
  });
  it('refuses a row whose entry the parser no longer opens, and one whose printed page the index no longer reads', () => {
    expect(() => applyPageCorrections(parse(), [{ key: '1930-12-31|LITTERAE ENCYCLICAE|Casti connubii|Something else', printed: 530, page: 539 }], 'ACTA_PAGE_CORRECTIONS'))
      .toThrow(/stale page correction .* ACTA_PAGE_CORRECTIONS/);
    expect(() => applyPageCorrections(parse(), [{ key: '1930-12-31|LITTERAE ENCYCLICAE|Casti connubii|Ad venerabiles fratres', printed: 531, page: 539 }], 'ACTA_PAGE_CORRECTIONS'))
      .toThrow(/prints 530, not 531/);
  });
});

describe('applyPageRows', () => {
  const parse = () => parseActaIndex(`                                  H

                             INDEX DOCUMENTORUM
               CHRONOLOGICO ORDINE DIGESTUS

                                  I. - ACTA BENEDICTI PP. XV

                                                         I. - LITTERAE ENCYCLICAE.
1921          Ian.          6      Sacra propediem. - Ad Patriarchas, Primates
             Apr.         30       In praeclara summorum. - Dilectis filiis 209
`, { year: 1921, volume: 13, columnar: true });
  it('moves a pageless entry to the entries with the page and its source, in date order, and counts it', () => {
    const r = parse();
    const n = applyPageRows(r, [{ key: '1921-01-06|LITTERAE ENCYCLICAE|Sacra propediem|Ad Patriarchas, Primates', page: 33, source: 'recovered' }], 'test');
    expect(n).toBe(1);
    expect(r.pageless).toEqual([]);
    expect(r.entries.map((e) => [e.incipit, e.page, e.pageSource])).toEqual([['Sacra propediem', 33, 'recovered'], ['In praeclara summorum', 209, undefined]]);
    expect(r.stats.recovered).toBe(1);
  });
  it('refuses a row whose entry the parser no longer opens', () => {
    expect(() => applyPageRows(parse(), [{ key: '1921-01-06|LITTERAE ENCYCLICAE|Sacra propediem|Something else', page: 33, source: 'recovered' }], 'aas-13-1921.pages.json'))
      .toThrow(/stale page row .* aas-13-1921\.pages\.json/);
  });
  // Controller ruling 13: applyPageRows inserts a recovered entry into its own pope/category
  // group instead of resorting `entries` -- a full resort would reorder the parser's
  // category-grouped entries, which the category-by-category reports and create.ts depend on.
  const withPage = (e: PagelessEntry, page: number): ActaEntry => ({ ...e, page }) as ActaEntry;
  const buildResult = (entries: ActaEntry[], pageless: PagelessEntry[]): ActaParseResult => ({
    volume: 13, year: 1921, entries, pageless, unseenHeadings: [], unmappedPopes: [], popeHeadings: [], skippedParts: [], defects: [],
    stats: { lines: 0, pageLines: 0, harvestedPageLines: 0, harvestedEntries: 0, dateLines: 0, entries: entries.length, monthOnly: 0, withoutPage: pageless.length, subItems: 0, translations: 0, consumed: 0, recovered: 0 },
  });
  it('inserts a recovered entry into its own category group, before the first later-dated entry of that group, leaving other groups and pre-existing order untouched', () => {
    const a1 = withPage(entry('1921-01-01', 'LITTERAE ENCYCLICAE', 'Alpha primum'), 10);
    const a3 = withPage(entry('1921-03-01', 'LITTERAE ENCYCLICAE', 'Alpha tertium'), 30);
    const b1 = withPage(entry('1921-02-01', 'LITTERAE APOSTOLICAE', 'Beta primum'), 20);
    const a2 = entry('1921-02-15', 'LITTERAE ENCYCLICAE', 'Alpha secundum');
    // The parser's own order (category by category, not date order across categories).
    const r = buildResult([a1, a3, b1], [a2]);
    const n = applyPageRows(r, [{ key: pagelessKey(a2), page: 50, source: 'recovered' }], 'test');
    expect(n).toBe(1);
    expect(r.entries.map((e) => e.incipit)).toEqual(['Alpha primum', 'Alpha secundum', 'Alpha tertium', 'Beta primum']);
  });
  it('appends a recovered entry at the end when its pope/category opens no group among the entries', () => {
    const a1 = withPage(entry('1921-01-01', 'LITTERAE ENCYCLICAE', 'Alpha primum'), 10);
    const c1 = entry('1921-01-15', 'EPISTOLAE', 'Gamma primum');
    const r = buildResult([a1], [c1]);
    applyPageRows(r, [{ key: pagelessKey(c1), page: 15, source: 'recovered' }], 'test');
    expect(r.entries.map((e) => e.incipit)).toEqual(['Alpha primum', 'Gamma primum']);
  });
});
