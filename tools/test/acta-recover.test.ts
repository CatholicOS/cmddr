import { describe, it, expect } from 'vitest';
import { pagelessKey, parseIndexGeneralis, latinDate, formulaNear, findIncipit, recoverPages } from '../src/acta/recover.js';

describe('pagelessKey', () => {
  it('keys a pageless entry by date, category, incipit and the head of its description', () => {
    expect(pagelessKey({ date: '1921-01-06', category: 'LITTERAE ENCYCLICAE', incipit: 'Sacra propediem', description: 'Ad Patriarchas, Primates, Archiepiscopos, Episcopos aliosque locorum Ordinarios, pacem et communionem cum Apostolica Sede habentes' }))
      .toBe('1921-01-06|LITTERAE ENCYCLICAE|Sacra propediem|Ad Patriarchas, Primates, Archiepiscopos, Episcopos aliosque locor');
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
    const g = parseIndexGeneralis(['front matter', 'body', AAS13_GENERALIS, 'INDEX DOCUMENTORUM\nCHRONOLOGICO ORDINE DIGESTUS']);
    expect(g.page).toBe(3);
    expect(g.runs.get('Litterae Encyclicae')).toEqual([[34, 34], [209, 209], [329, 329]]);
    expect(g.runs.get('Constitutiones Apostolicae')).toEqual([[249, 255], [299, 299], [336, 336], [370, 370], [409, 409], [457, 469], [489, 489]]);
    expect(g.runs.get('Litterae Apostolicae')).toEqual([[6, 9], [185, 194], [294, 307], [339, 346], [372, 377], [412, 422], [469, 473], [491, 494], [553, 553]]);
    expect(g.runs.get('Epistulae')).toEqual([[10, 12], [89, 91], [127, 131], [195, 196], [218, 221], [256, 256], [307, 307], [346, 347], [377, 377], [423, 429], [473, 473], [494, 496], [528, 531], [554, 554]]);
    expect(g.runs.get('Sermones')).toEqual([[93, 93]]);
    // The pope part ends at the dicasteries' part; nothing of it is read.
    expect(g.runs.has('Consistoria')).toBe(true);
    expect([...g.runs.keys()].some((k) => /OFFICII|Decreta/.test(k))).toBe(false);
    expect(g.unmapped).toEqual(['PRECATIONUM FORMULAE']);
  });

  it('returns no page and no runs when the volume has no Index generalis', () => {
    const g = parseIndexGeneralis(['a', 'b', 'INDEX DOCUMENTORUM\nCHRONOLOGICO ORDINE DIGESTUS']);
    expect(g.page).toBeNull();
    expect(g.runs.size).toBe(0);
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
    expect(findIncipit('Ad perpetuam rei memoriam. — Quo maio-\nri rerum fidei', 'Quo maiori rerum', false)).not.toBeNull();
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
  it('settles two acts of one incipit by the dating formula, and reports the one whose date no formula gives', () => {
    const { rows, unrecovered } = recoverPages([
      entry('1921-03-05', 'LITTERAE APOSTOLICAE', 'Constat apprime', 'First'),
      entry('1921-05-20', 'LITTERAE APOSTOLICAE', 'Constat apprime', 'Second'),
      entry('1921-09-09', 'LITTERAE APOSTOLICAE', 'Constat apprime', 'Third'),
    ], BODY, generalis, { lastBodyPage: 7 });
    expect(rows.map((r) => [r.page, r.rule, r.formula?.slice(0, 11)])).toEqual([[3, 'dated', 'Datum Romae'], [4, 'dated', 'Datum Romae']]);
    expect(unrecovered).toEqual([expect.objectContaining({ reason: 'several', candidates: [3, 4] })]);
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
  it('searches the whole pope part, and requires the dating formula, when the Index generalis has no run for the category', () => {
    const noRuns = { page: null, runs: new Map<string, [number, number][]>(), unmapped: [] as string[] };
    const { rows, unrecovered } = recoverPages([entry('1921-06-01', 'LITTERAE APOSTOLICAE', 'Quae catholico nomini'), entry('1921-01-06', 'LITTERAE ENCYCLICAE', 'Sacra propediem')], BODY, noRuns, { lastBodyPage: 7 });
    expect(rows).toEqual([expect.objectContaining({ page: 5, rule: 'dated' })]);
    expect(unrecovered).toEqual([expect.objectContaining({ incipit: 'Sacra propediem', reason: 'several', candidates: [1] })]);
  });
});
