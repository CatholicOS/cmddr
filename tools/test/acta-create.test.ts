import { describe, it, expect } from 'vitest';
import {
  createFromActa, actaTitle, printedToponym, titleContainsIncipit, toActaDocument, isActaShelf,
  CREATED_CATEGORIES, NOT_CREATED,
} from '../src/acta/create.js';
import { matchActa } from '../src/acta/match.js';
import { categoryForHeading, ACTA_CATEGORIES } from '../src/acta/categories.js';
import { ACTA_INDEX_CORRECTIONS, ACTA_MATCH_OVERRIDES } from '../src/acta/curation.js';
import type { ActaEntry } from '../src/acta/index.js';
import type { DocumentRecord } from '../src/types.js';

const entry = (over: Partial<ActaEntry>): ActaEntry => ({
  series: 'AAS', volume: 115, year: 2023, page: 1, pope: 'Franciscus',
  category: 'LITTERAE APOSTOLICAE', date: '2023-02-20',
  incipit: 'Ius nativum', quoted: false, toponym: null, description: 'De patrimonio Sedis Apostolicae',
  raw: '20 Feb. 2023 Ius nativum. De patrimonio Sedis Apostolicae   .  .  .  .  .  .  263', ...over,
});
const doc = (over: Partial<DocumentRecord> & { id: string }): DocumentRecord => ({
  title: over.id, idStatus: 'minted', genre: 'apostolic-letter', issuerId: 'rp:francis-i',
  issuerType: 'pope', date: '2023-02-20', ...over,
});
/** Match then create, as the orchestrator does. */
const run = (entries: ActaEntry[], docs: DocumentRecord[]) => createFromActa(matchActa(entries, docs), docs, '2026-09-12');

describe('createFromActa: what is created (spec §2, §4)', () => {
  it('creates a record for an unmatched entry of a created category, minted from the incipit', () => {
    const r = run([entry({ page: 263 })], []);
    expect(r.held).toEqual([]);
    expect(r.created).toHaveLength(1);
    expect(r.created[0]!.record).toEqual({
      id: 'mag:francis-i/ius-nativum-2023',
      title: 'Ius nativum. De patrimonio Sedis Apostolicae',
      idStatus: 'minted',
      genre: 'apostolic-letter',
      issuerId: 'rp:francis-i',
      issuerType: 'pope',
      date: '2023-02-20',
      source: { url: null, shelf: 'aas/2023', retrieved: '2026-09-12' },
      incipit: 'Ius nativum',
      sourceGenreLabel: 'Litterae Apostolicae',
      acta: { series: 'AAS', volume: 115, year: 2023, page: 263 },
    });
  });

  it('gives a motu proprio its characteristic, and no incipitLang whether the incipit is bare or in guillemets', () => {
    const r = run([entry({
      category: 'LITTERAE APOSTOLICAE MOTU PROPRIO DATAE', incipit: 'Chi è fedele', quoted: true,
      description: 'De personis iuridicis instrumentalibus Curiae Romanae', date: '2022-12-05',
    })], []);
    const d = r.created[0]!.record;
    expect(d.id).toBe('mag:francis-i/chi-e-fedele-2022');
    expect(d.characteristics).toEqual(['motu-proprio']);
    expect(d.incipitLang).toBeUndefined();
    expect(run([entry({})], []).created[0]!.record.incipitLang).toBeUndefined();
    expect(d.title).toBe('« Chi è fedele ». De personis iuridicis instrumentalibus Curiae Romanae');
    expect(d.source!.shelf).toBe('aas/2023');
    expect(d.date).toBe('2022-12-05');
  });

  it('takes the provisional form for a constitution the index names by toponym only, the toponym in the title', () => {
    const r = run([entry({
      category: 'CONSTITUTIONES APOSTOLICAE', incipit: null, toponym: 'VuCArien.',
      description: 'In Nigeria, dismembrato territorio dioecesis Ialingoënsis, dioecesis Vucariensis conditur',
      raw: '14 Dec. 2022 VuCArien.: In Nigeria, dismembrato territorio dioecesis Ialingoënsis,\ndioecesis Vucariensis conditur   .  .  .  265',
      date: '2022-12-14', page: 265,
    })], []);
    const d = r.created[0]!.record;
    expect(d.id).toBe('mag:francis-i/papal-bull-2022-12-14');
    expect(d.idStatus).toBe('provisional');
    expect(d.genre).toBe('papal-bull');
    expect(d.characteristics).toEqual(['apostolic-constitution']);
    expect(d.incipit).toBeUndefined();
    expect(d.title).toBe('Vucarien.: In Nigeria, dismembrato territorio dioecesis Ialingoënsis, dioecesis Vucariensis conditur');
    expect(d.keywords).toBeUndefined();
    expect(d.actKind).toBeUndefined();
  });

  it('creates a canonisation decretal as a papal-bull without characteristics (the §2.1 decision)', () => {
    const r = run([entry({ category: 'LITTERAE DECRETALES', incipit: 'Et praedicabitur', quoted: true, description: 'Quibus Laurae Sanctorum honores decernuntur', date: '2013-05-12' })], []);
    const d = r.created[0]!.record;
    expect(d.genre).toBe('papal-bull');
    expect(d.characteristics).toBeUndefined();
    expect(d.sourceGenreLabel).toBe('Litterae Decretales');
  });

  it('creates for Benedict XVI, whose apost_letters shelf is harvested, under his own issuer', () => {
    const r = run([entry({ pope: 'Benedictus XVI', incipit: 'Testes christianae', quoted: true, date: '2010-06-06', year: 2020, volume: 112, page: 673 })], []);
    expect(r.created[0]!.record.id).toBe('mag:benedict-xvi/testes-christianae-2010');
    expect(r.created[0]!.record.source!.shelf).toBe('aas/2020');
  });

  it('creates two acts of one year with one incipit as two records (the orchestrator extends both to the full date)', () => {
    const r = run([
      entry({ incipit: 'Venite benedicti', date: '2013-04-07', page: 1246 }),
      entry({ incipit: 'Venite, benedicti', date: '2013-11-10', page: 747 }),
    ], []);
    expect(r.created.map((c) => c.record.id)).toEqual(['mag:francis-i/venite-benedicti-2013', 'mag:francis-i/venite-benedicti-2013']);
    expect(r.held).toEqual([]);
  });

  it('notes, without holding, an incipit-less shelf record of the genre a day off', () => {
    const r = run([entry({ incipit: 'Et dabo vobis', date: '2015-05-16' })],
      [doc({ id: 'mag:francis-i/apostolic-letter-2015-05-17', idStatus: 'provisional', date: '2015-05-17' })]);
    expect(r.created).toHaveLength(1);
    expect(r.created[0]!.notes).toEqual(['a provisional shelf record of the genre stands a day off: mag:francis-i/apostolic-letter-2015-05-17 (2015-05-17)']);
  });
});

describe('createFromActa: what is held (spec §2, §3, §5)', () => {
  const reasons = (r: ReturnType<typeof run>) => r.held.map((h) => [h.reason, h.candidates.map((c) => c.id)]);

  it('does not create a matched entry', () => {
    const r = run([entry({})], [doc({ id: 'mag:francis-i/ius-nativum-2023', incipit: 'Ius nativum' })]);
    expect(r.created).toEqual([]);
    expect(r.held).toEqual([]);
  });

  it('holds a harvested category the registry does not create from the Acta, with the curated reason', () => {
    const r = run([entry({ category: 'EPISTULAE APOSTOLICAE', incipit: 'While we walk', description: 'Ad Episcopos Nigeriae', date: '2015-03-02' })], []);
    expect(reasons(r)).toEqual([['not-created-category', []]]);
    expect(r.held[0]!.note).toBe(NOT_CREATED['Epistulae Apostolicae']);
    const n = run([entry({ category: 'NUNTII', incipit: null, description: 'Pro LVI Die Mundiali Pacis' })], []);
    expect(reasons(n)).toEqual([['not-created-category', []]]);
  });

  it('holds a pope whose shelf for the class is not harvested, and an unknown pope', () => {
    // Benedict XVI's page lists no bulls shelf, so a decretal of his is held.
    const r = run([entry({ pope: 'Benedictus XVI', category: 'LITTERAE DECRETALES', incipit: 'Ego autem', date: '2010-05-30' })], []);
    expect(reasons(r)).toEqual([['shelf-not-harvested', []]]);
    const u = run([entry({ pope: 'Leo XIV', date: '2025-05-09' })], []);
    expect(reasons(u)).toEqual([['pope-not-harvested', []]]);
  });

  it('holds an entry dated before the pope\'s election: an earlier pontificate\'s act in brackets with no pope named', () => {
    const r = run([entry({ incipit: 'Admodum fideli', quoted: true, date: '2010-09-19', year: 2018, volume: 110, page: 1386 })], []);
    expect(reasons(r)).toEqual([['date-before-pontificate', []]]);
  });

  it('holds an ambiguous entry and both entries claiming one document, with the candidates', () => {
    const tarragona = [
      doc({ id: 'mag:francis-i/apostolic-letter-2013-10-13-1', idStatus: 'provisional', date: '2013-10-13' }),
      doc({ id: 'mag:francis-i/apostolic-letter-2013-10-13-2', idStatus: 'provisional', date: '2013-10-13' }),
    ];
    const a = run([entry({ incipit: 'Spiritus Domini', quoted: true, date: '2013-10-13' })], tarragona);
    expect(a.created).toEqual([]);
    expect(reasons(a)).toEqual([['ambiguous', tarragona.map((d) => d.id)]]);

    const c = run([
      entry({ category: 'LITTERAE APOSTOLICAE MOTU PROPRIO DATAE', incipit: 'Sedula Mater', date: '2016-08-15', page: 963 }),
      entry({ category: 'LITTERAE APOSTOLICAE MOTU PROPRIO DATAE', incipit: 'Humanam progressionem', date: '2016-08-15', page: 968 }),
    ], [doc({ id: 'mag:francis-i/apostolic-letter-2016-08-15', idStatus: 'provisional', date: '2016-08-15', characteristics: ['motu-proprio'] })]);
    expect(c.created).toEqual([]);
    expect(reasons(c)).toEqual([
      ['claimed-twice', ['mag:francis-i/apostolic-letter-2016-08-15']],
      ['claimed-twice', ['mag:francis-i/apostolic-letter-2016-08-15']],
    ]);
  });

  it('holds a class mismatch: a same-date record whose title carries the incipit (the discussion #30 shape)', () => {
    const shelf = doc({
      id: 'mag:francis-i/apostolic-letter-2015-05-28', idStatus: 'provisional', date: '2015-05-28',
      title: 'Lettera Apostolica in forma di “Motu Proprio” sulla Revisione dello Statuto del Fondo Pensioni Vaticano',
    });
    const r = run([entry({ category: 'LITTERAE APOSTOLICAE MOTU PROPRIO DATAE', incipit: 'Fondo Pensioni', quoted: true, date: '2015-05-28' })], [shelf]);
    expect(r.created).toEqual([]);
    expect(reasons(r)).toEqual([['class-mismatch', ['mag:francis-i/apostolic-letter-2015-05-28']]]);
  });

  it('holds a class mismatch by incipit slug, and by toponym in the title', () => {
    const bySlug = run([entry({ category: 'LITTERAE DECRETALES', incipit: 'Nihil per contentionem', date: '2015-05-17' })],
      [doc({ id: 'mag:francis-i/nihil-per-contentionem-2015', incipit: 'Nihil per contentionem', date: '2015-05-17' })]);
    expect(reasons(bySlug)).toEqual([['class-mismatch', ['mag:francis-i/nihil-per-contentionem-2015']]]);
    const byToponym = run([entry({ category: 'CONSTITUTIONES APOSTOLICAE', incipit: null, toponym: 'VuCArien.', description: 'dioecesis Vucariensis conditur', date: '2022-12-14' })],
      [doc({ id: 'mag:francis-i/x-2022', incipit: 'X', date: '2022-12-14', title: 'Lettera Apostolica: eretta la Diocesi di Vucariensis' })]);
    expect(reasons(byToponym)).toEqual([['class-mismatch', ['mag:francis-i/x-2022']]]);
  });

  it('holds a possible identity: a same-date record with no incipit, whatever its genre', () => {
    // vatican.va files a canonisation decretal on apost_letters as a Lettera Decretale
    // with no incipit; the Acta file it as Litterae Decretales with one.
    const r = run([entry({ category: 'LITTERAE DECRETALES', incipit: 'Nihil per contentionem', quoted: true, date: '2015-05-17' })],
      [doc({ id: 'mag:francis-i/apostolic-letter-2015-05-17', idStatus: 'provisional', date: '2015-05-17', title: 'Lettera Decretale con la quale …' })]);
    expect(r.created).toEqual([]);
    expect(reasons(r)).toEqual([['possible-identity', ['mag:francis-i/apostolic-letter-2015-05-17']]]);
    // A series message on the date, keyed by occasion and carrying no incipit, holds too.
    const s = run([entry({ incipit: 'Condividendo con l’amato fratello', quoted: true, date: '2015-08-06' })],
      [doc({ id: 'mag:francis-i/world-day-of-prayer-for-the-care-of-creation-2015', genre: 'message', date: '2015-08-06', series: { id: 'world-day-of-prayer-for-the-care-of-creation', year: 2015 } })]);
    expect(reasons(s)).toEqual([['possible-identity', ['mag:francis-i/world-day-of-prayer-for-the-care-of-creation-2015']]]);
  });

  it('holds a near-miss: a record of the genre a day off with the same incipit', () => {
    const r = run([entry({ incipit: 'Calicem quidem', date: '2022-01-22' })],
      [doc({ id: 'mag:francis-i/calicem-quidem-2022', incipit: 'Calicem quidem', date: '2022-01-21' })]);
    expect(r.created).toEqual([]);
    expect(reasons(r)).toEqual([['near-miss', ['mag:francis-i/calicem-quidem-2022']]]);
  });

  it('holds the same incipit elsewhere in the pontificate: same genre on any date, or any genre in the year', () => {
    const genre = run([entry({ category: 'CONSTITUTIONES APOSTOLICAE', incipit: 'Quo firmiores', date: '2017-05-04' })],
      [doc({ id: 'mag:francis-i/quo-firmiores-2013', incipit: 'Quo firmiores', genre: 'papal-bull', characteristics: ['apostolic-constitution'], date: '2013-05-01' })]);
    expect(reasons(genre)).toEqual([['same-incipit-elsewhere', ['mag:francis-i/quo-firmiores-2013']]]);
    // Another genre, another date, same year: the collision rule would re-mint the shelf id.
    const year = run([entry({ category: 'LITTERAE DECRETALES', incipit: 'Venite benedicti', date: '2022-05-15' })],
      [doc({ id: 'mag:francis-i/venite-benedicti-2022', incipit: 'Venite benedicti', date: '2022-11-06' })]);
    expect(reasons(year)).toEqual([['same-incipit-elsewhere', ['mag:francis-i/venite-benedicti-2022']]]);
    // Another genre, another year: two acts can share an incipit; created.
    const other = run([entry({ category: 'LITTERAE DECRETALES', incipit: 'Venite benedicti', date: '2022-05-15' })],
      [doc({ id: 'mag:francis-i/venite-benedicti-2013', incipit: 'Venite benedicti', date: '2013-11-10' })]);
    expect(other.created).toHaveLength(1);
  });

  it('holds both of two entries of one date with one incipit: the id scheme cannot tell them apart', () => {
    const r = run([
      entry({ category: 'LITTERAE DECRETALES', incipit: 'Vos autem', quoted: true, date: '2019-10-13', page: 1671 }),
      entry({ category: 'LITTERAE DECRETALES', incipit: 'Vos autem', quoted: true, date: '2019-10-13', page: 1674 }),
    ], []);
    expect(r.created).toEqual([]);
    expect(r.held.map((h) => h.reason)).toEqual(['id-collision', 'id-collision']);
    expect(r.held[0]!.note).toContain('AAS 115 (2023) 1671, 115 (2023) 1674');
  });

  it('holds an entry whose printed date is not a calendar date', () => {
    const r = run([entry({ date: '2023-02-30' })], []);
    expect(reasons(r)).toEqual([['unresolvable-date', []]]);
  });

  it('does not report a non-harvested category as a hold: it is not attempted', () => {
    const r = run([entry({ category: 'HOMILIAE', incipit: null, description: 'In sollemnitate Epiphaniae Domini' })], []);
    expect(r.created).toEqual([]);
    expect(r.held).toEqual([]);
  });

  it('matches, and so does not create, an entry the curated index corrections re-date', () => {
    const key = '2016:602';
    const row = ACTA_INDEX_CORRECTIONS[key]!;
    const e = entry({ category: 'LITTERAE APOSTOLICAE MOTU PROPRIO DATAE', incipit: 'De Concordia inter Codices', quoted: true,
      date: row.printed, year: 2016, volume: 108, page: 602 });
    const shelf = doc({ id: 'mag:francis-i/de-concordia-inter-codices-2016', incipit: 'De Concordia inter Codices', date: row.date, characteristics: ['motu-proprio'] });
    const m = matchActa([e], [shelf]);
    expect(m.matches.map((x) => [x.documentId, x.entry.date])).toEqual([['mag:francis-i/de-concordia-inter-codices-2016', '2016-05-31']]);
    expect(m.matches[0]!.entry.raw).toBe(e.raw);
    const r = createFromActa(m, [shelf], '2026-09-12');
    expect(r.created).toEqual([]);
    expect(r.held).toEqual([]);
    // A row applies only to the printed date it records: another date on the same page is left alone.
    const m2 = matchActa([{ ...e, date: '2016-04-30' }], [shelf]);
    expect(m2.matches).toEqual([]);
  });
});

describe('the curated match override', () => {
  const key = 'AAS:116:189';
  const row = ACTA_MATCH_OVERRIDES[key]!;
  const finis = entry({ category: 'LITTERAE APOSTOLICAE MOTU PROPRIO DATAE', incipit: 'Finis et modus', quoted: true,
    description: 'De limitibus et de rationibus administrationis ordinariae', date: '2024-01-16', year: 2024, volume: 116, page: 189 });
  const decree = doc({ id: 'mag:francis-i/apostolic-letter-2024-01-16-1', idStatus: 'provisional', date: '2024-01-16',
    characteristics: ['motu-proprio'], title: 'Decreto del Sommo Pontefice Francesco relativo alla pubblicazione di provvedimenti normativi' });
  const letter = doc({ id: 'mag:francis-i/apostolic-letter-2024-01-16-2', idStatus: 'provisional', date: '2024-01-16',
    title: "Lettera Apostolica in forma di Motu Proprio circa i limiti e le modalità dell'ordinaria amministrazione" });

  it('sends the entry to the document the row names, before and without the class rule', () => {
    expect(row.documentId).toBe(letter.id);
    const m = matchActa([finis], [decree, letter]);
    expect(m.matches.map((x) => [x.documentId, x.by])).toEqual([[letter.id, 'curated']]);
    expect(m.unmatched).toEqual([]);
    // Without the row the class rule picks the decree, the only candidate of the class.
    const plain = matchActa([{ ...finis, page: 190 }], [decree, letter]);
    expect(plain.matches.map((x) => [x.documentId, x.by])).toEqual([[decree.id, 'unique']]);
    // And the creator has nothing to make of an overridden entry.
    expect(createFromActa(m, [decree, letter], '2026-09-12').created).toEqual([]);
  });

  it('is ignored when the named document is not among the shelf records', () => {
    const m = matchActa([finis], [decree]);
    expect(m.matches.map((x) => [x.documentId, x.by])).toEqual([[decree.id, 'unique']]);
  });
});

describe('createFromActa on the volumes (acta volumes spec §5)', () => {
  const pius = (over: Partial<ActaEntry>) => entry({
    pope: 'Pius XI', year: 1931, volume: 23, category: 'CONSTITUTIONES APOSTOLICAE', date: '1931-03-27',
    incipit: 'Pastoris aeterni', description: 'Lacus Salsi et Sacramentensis: dismembrationis et erectionis novae dioecesis Renensis',
    raw: '1931 Martii        27   Pastoris aeterni. - Lacus Salsi et Sacramentensis: dismem­ / brationis et erectionis novae dioecesis Renensis .... 366',
    page: 366, ...over,
  });

  it('cites the whole-volume PDF as source.url for a volume source, with the fixture\'s retrieval date', () => {
    const r = run([pius({})], []);
    expect(r.created).toHaveLength(1);
    expect(r.created[0]!.record).toMatchObject({
      id: 'mag:pius-xi/pastoris-aeterni-1931', issuerId: 'rp:pius-xi', genre: 'papal-bull', characteristics: ['apostolic-constitution'],
      source: { url: 'https://www.vatican.va/archive/aas/documents/AAS-23-1931-ocr.pdf', shelf: 'aas/1931', retrieved: '2026-09-12' },
      acta: { series: 'AAS', volume: 23, year: 1931, page: 366 },
    });
    // The retrieval date defaults to the source's when none is given.
    const d = createFromActa(matchActa([pius({})], []), []);
    expect(d.created[0]!.record.source!.retrieved).toBe('2026-09-13');
    // A part carries into acta.part and into the URL.
    const part = createFromActa(matchActa([entry({
      pope: 'Benedictus XV', year: 1917, volume: 9, part: 'I', page: 53, date: '1915-08-11', incipit: 'Benigne annuentes',
      description: 'Plenaria indulgentia conceditur pro festo Bb. Agathangeli et Cassiani',
    })], []), []);
    expect(part.created[0]!.record.acta).toEqual({ series: 'AAS', volume: 9, year: 1917, part: 'I', page: 53 });
    expect(part.created[0]!.record.source!.url).toBe('https://www.vatican.va/archive/aas/documents/AAS-09-I-1917-ocr.pdf');
    // An index PDF (2012) has no volume URL.
    const idx = run([entry({ pope: 'Benedictus XVI', year: 2012, volume: 104, page: 404, date: '2012-01-10', incipit: 'Quo aptius' })], []);
    expect(idx.created[0]!.record.source).toEqual({ url: null, shelf: 'aas/2012', retrieved: '2026-09-12' });
  });

  it('creates an Epistula only for a pope whose letters shelf is harvested', () => {
    const letter = (pope: string, date: string) => entry({
      pope, category: 'EPISTOLAE', date, year: 1931, volume: 23, incipit: 'Quoniam annus', description: 'Ad R. P. D. Iulium Zichy', page: 49,
    });
    const created = run([letter('Pius XI', '1930-12-13')], []);
    expect(created.created.map((c) => [c.record.id, c.record.genre, c.record.sourceGenreLabel])).toEqual([['mag:pius-xi/quoniam-annus-1930', 'letter', 'Epistulae']]);
    const held = run([letter('Benedictus XV', '1917-12-13'), letter('Franciscus', '2023-12-13')], []);
    expect(held.held.map((h) => h.reason)).toEqual(['shelf-not-harvested', 'shelf-not-harvested']);
  });

  it('holds an entry whose page a matched document or another entry already cites, the note agreeing in number', () => {
    const notes = (r: ReturnType<typeof run>) => r.held.map((h) => [h.reason, h.note.replace(/ the same page .*$/, '')]);
    // A matched shelf document alone on the page: singular.
    const shelf = doc({ id: 'mag:francis-i/ius-nativum-2023', incipit: 'Ius nativum', date: '2023-02-20' });
    const one = run([entry({ page: 263 }), entry({ incipit: 'Alterum opus', date: '2023-02-21', page: 263 })], [shelf]);
    expect(notes(one)).toEqual([['page-shared', 'a matched shelf document cites']]);
    // Two other entries of the index and no match: plural.
    const three = run([
      entry({ incipit: 'Primum opus', date: '2023-02-21', page: 264 }),
      entry({ incipit: 'Alterum opus', date: '2023-02-22', page: 264 }),
      entry({ incipit: 'Tertium opus', date: '2023-02-23', page: 264 }),
    ], []);
    expect(notes(three)).toEqual(Array(3).fill(['page-shared', '2 other entries of the index cite']));
    // A match and one other entry: plural.
    const mixed = run([entry({ page: 263 }), entry({ incipit: 'Alterum opus', date: '2023-02-21', page: 263 }), entry({ incipit: 'Tertium opus', date: '2023-02-22', page: 263 })], [shelf]);
    expect(notes(mixed)).toEqual(Array(2).fill(['page-shared', 'a matched shelf document and 1 other entry of the index cite']));
  });

  it('never creates a month-only entry, and holds an OCR-damaged incipit or toponym', () => {
    const month = run([pius({ date: '1929-03', incipit: 'Pro munere', page: 317 })], []);
    expect(month.created).toEqual([]);
    expect(month.held.map((h) => [h.reason, h.note.slice(0, 30)])).toEqual([['unresolvable-date', 'the index dates the entry to 1']]);
    const damaged = run([
      pius({ toponym: 'B (IARENSIS', incipit: null, description: 'Peramplum Berberatensis. In Africae Mediae natione dioecesis Buarensis constituitur', page: 280, date: '1978-02-27', pope: 'Paulus VI', year: 1978, volume: 70 }),
      pius({ incipit: 'Tui in S. C. de Propaganda Fide', page: 281 }),
      pius({ incipit: 'Cum sit', page: 282 }),
      // The OCR of a volume (phase 2b-ii-a): a mark, a digit, a full stop, a lower-case initial no incipit carries.
      pius({ incipit: 'Providet!tissimum Deum', page: 283 }),
      pius({ incipit: 'Quae. feliciter', page: 284 }),
      pius({ incipit: 'ut tibi iisque', page: 285 }),
      pius({ incipit: 'Honesta"quaelibet', page: 286 }),
      // A lone capital hyphenated to the see (`G-UYANAE`, AAS 51 (1959) 21; `G-AUHATINAE`, AAS 62 (1970) 29; phase 2b-ii-b).
      pius({ toponym: 'G-UYANAE HOLLANDICAE (Paramariboënsis)', incipit: 'Cum apostolicus', description: 'Apostolicus Vicariatus', page: 287, category: 'CONSTITUTIONES APOSTOLICAE' }),
    ], []);
    expect(damaged.held.map((h) => [h.entry.page, h.reason])).toEqual([[280, 'ocr-damaged'], [283, 'ocr-damaged'], [284, 'ocr-damaged'], [285, 'ocr-damaged'], [286, 'ocr-damaged'], [287, 'ocr-damaged']]);
    expect(damaged.created.map((c) => c.entry.page)).toEqual([281, 282]);
    // The index PDFs are typeset: a digit or a full stop in an incipit is the print (`Lex N. DCXXVI`, 2019).
    const typeset = run([
      entry({ pope: 'Franciscus', year: 2019, volume: 111, category: 'LITTERAE APOSTOLICAE MOTU PROPRIO DATAE', date: '2019-06-01', page: 1, incipit: 'Lex N. DCXXVI', description: 'De re', raw: 'x' }),
      entry({ pope: 'Franciscus', year: 2019, volume: 111, category: 'LITTERAE APOSTOLICAE', date: '2019-11-30', page: 2, incipit: 'Il 30 novembre 2019', quoted: true, description: 'De re', raw: 'x' }),
    ], []);
    expect(typeset.created.map((c) => c.entry.page)).toEqual([1, 2]);
    // A toponym-and-incipit constitution of 1958 mints from the incipit, the toponym in the title.
    const both = run([entry({
      pope: 'Pius XII', year: 1958, volume: 50, category: 'CONSTITUTIONES APOSTOLICAE', date: '1957-04-10', page: 24,
      toponym: 'SANTAREMENSIS (Obidensis)', incipit: 'Cum sit', description: 'Distractis quibusdam municipiis',
      raw: '1957 Apr. 10 SANTAREMENSIS (Obidensis). Cum sit. - Distractis quibusdam municipiis 24',
    })], []);
    expect(both.created[0]!.record).toMatchObject({ id: 'mag:pius-xii/cum-sit-1957', title: 'Santaremensis (Obidensis). Cum sit. Distractis quibusdam municipiis' });
  });
});

describe('createFromActa on the volumes of 1979-2002 and the index PDFs of 2010-2014 (acta volumes spec §9, phase 2b-ii-c)', () => {
  const jp2 = (over: Partial<ActaEntry>) => entry({
    pope: 'Ioannes Paulus II', year: 1983, volume: 75, part: 'I', category: 'CONSTITUTIONES APOSTOLICAE', date: '1982-09-10',
    toponym: 'SAMOA-PAGOPAGENSIS', incipit: 'Studiose quidem', description: 'Regio civili ratione «Samoa Americana» appellata a dioecesi Samoa-Apiana et Tokelauana distrahitur',
    raw: '1982 Sept. 10 SAMOA-PAGOPAGENSIS. Studiose quidem. - Regio civili ratione / «Samoa Americana» appellata … 5', page: 5, ...over,
  });
  const jdoc = (over: Partial<DocumentRecord> & { id: string }) => doc({ issuerId: 'rp:john-paul-ii', ...over });

  it('cites the 1983 part-I PDF by the name the index page gives it, with part I on the reference', () => {
    const r = run([jp2({})], []);
    expect(r.created[0]!.record).toMatchObject({
      id: 'mag:john-paul-ii/studiose-quidem-1982', title: 'Samoa-Pagopagensis. Studiose quidem. Regio civili ratione «Samoa Americana» appellata a dioecesi Samoa-Apiana et Tokelauana distrahitur',
      source: { url: 'https://www.vatican.va/archive/aas/documents/AAS-75-1983-I-ocr.pdf', shelf: 'aas/1983', retrieved: '2026-09-12' },
      acta: { series: 'AAS', volume: 75, year: 1983, part: 'I', page: 5 },
    });
    // An index PDF of 2010-2014 cites null, as 2015-2024 do.
    const b = run([entry({ pope: 'Benedictus XVI', year: 2010, volume: 102, date: '2008-10-19', page: 205, incipit: 'Coniuges christiani', quoted: true, description: 'Venerabilibus Dei Servis Ludovico Martin et Zélie Mariae Guérin Beatorum honores decernuntur' })], []);
    expect(b.created[0]!.record.source).toEqual({ url: null, shelf: 'aas/2010', retrieved: '2026-09-12' });
  });

  it('holds an incipit the OCR split, set in capitals or opened with a J before a consonant, and lets the words A, E, O, I, È stand', () => {
    const r = run([
      jp2({ incipit: 'M ementote sermonis', page: 905, year: 1996, volume: 88, part: undefined, category: 'LITTERAE DECRETALES', date: '1995-05-21', toponym: null }),
      jp2({ incipit: 'QUO maius', page: 597, date: '1983-02-10', toponym: 'ACAPUICANA' }),
      jp2({ incipit: 'Jn vita eorum', page: 221, year: 1993, volume: 85, part: undefined, category: 'LITTERAE DECRETALES', date: '1991-11-17', toponym: null }),
      jp2({ incipit: 'A Domino est', page: 750, year: 2013, volume: 105, part: undefined, category: 'LITTERAE APOSTOLICAE', date: '2011-05-15', toponym: null, pope: 'Benedictus XVI' }),
      jp2({ incipit: 'E supremi', page: 6, date: '1982-09-11', toponym: null, category: 'LITTERAE APOSTOLICAE' }),
      jp2({ incipit: 'È certo ben noto', page: 7, date: '1982-09-12', toponym: null, category: 'LITTERAE APOSTOLICAE' }),
      jp2({ incipit: 'I rapidi progressi', page: 8, date: '1982-09-13', toponym: null, category: 'LITTERAE APOSTOLICAE' }),
      // A lone capital before the dash of a double see: the OCR's fragment of *Tamalensis* (AAS 48 (1956) 862).
      jp2({ toponym: 'S - KETAËNSIS (Navrongensis)', incipit: 'Semper fuit', page: 649, date: '1956-04-23', pope: 'Pius XII', year: 1956, volume: 48, part: undefined }),
    ], []);
    expect(r.held.map((h) => [h.entry.page, h.reason])).toEqual([[905, 'ocr-damaged'], [597, 'ocr-damaged'], [221, 'ocr-damaged'], [649, 'ocr-damaged']]);
    expect(r.created.map((c) => c.record.id)).toEqual([
      'mag:benedict-xvi/a-domino-est-2011', 'mag:john-paul-ii/e-supremi-1982', 'mag:john-paul-ii/e-certo-ben-noto-1982', 'mag:john-paul-ii/i-rapidi-progressi-1982',
    ]);
  });

  it('holds the later printing of an act the Acta print twice (ACTA_REPRINTS), and an entry cited at two pages no row settles', () => {
    // *Ibi vacabimus*: AAS 104 (2012) 482 the record, AAS 112 (2020) 479 a reprint; the same entry twice would otherwise collide.
    const twice = [
      entry({ pope: 'Benedictus XVI', year: 2012, volume: 104, page: 482, date: '2011-07-03', incipit: 'Ibi vacabimus', quoted: true, description: 'Venerabili Dei Servo Ioanni Scheffler, Beatorum honores decernuntur' }),
      entry({ pope: 'Benedictus XVI', year: 2020, volume: 112, page: 479, date: '2011-07-03', incipit: 'Ibi vacabimus', quoted: true, description: 'Venerabili Servo Dei Ioanni Scheffler Beatorum honores decernuntur' }),
    ];
    const r = run(twice, []);
    expect(r.created.map((c) => [c.record.id, c.record.acta!.year, c.record.acta!.page])).toEqual([['mag:benedict-xvi/ibi-vacabimus-2011', 2012, 482]]);
    expect(r.held.map((h) => [h.entry.page, h.reason, h.note.slice(0, 70)])).toEqual([[479, 'reprint', 'the later printing of an act the Acta print twice; the citation of rec']]);
    // *Deus caritas* at `138, 261` (the 2014 index): created at 138 because the row keys 261 to 138; the same
    // entry with a page no row settles is held.
    const dc = (page: number, alsoPages: number[]) => entry({ pope: 'Benedictus XVI', year: 2014, volume: 106, page, alsoPages, date: '2011-10-08', incipit: 'Deus caritas', quoted: true, description: 'Venerabili Servae Dei Mariae Janer Anglarill Beatorum honores decernuntur' });
    expect(run([dc(138, [261])], []).created.map((c) => c.record.acta!.page)).toEqual([138]);
    const unsettled = run([dc(138, [300])], []);
    expect(unsettled.created).toEqual([]);
    expect(unsettled.held.map((h) => [h.reason, h.note.slice(0, 50)])).toEqual([['reprint', 'the index cites the act at pages 138, 300; the cit']]);
  });

  it('holds a possible identity for an entry printing neither incipit nor toponym beside a same-date record of the genre', () => {
    // AAS 91 (1999) 849, `Nova statuta Academiarum theologicarum approbantur`, beside the shelf's *Inter munera academiarum*.
    const r = run([jp2({ year: 1999, volume: 91, part: undefined, page: 849, category: 'LITTERAE APOSTOLICAE MOTU PROPRIO DATAE', date: '1999-01-28', incipit: null, toponym: null, description: 'Nova statuta Academiarum theologicarum approbantur' })],
      [jdoc({ id: 'mag:john-paul-ii/inter-munera-academiarum-1999', date: '1999-01-28', incipit: 'Inter Munera Academiarum', title: 'Inter Munera Academiarum' })]);
    expect(r.created).toEqual([]);
    expect(r.held.map((h) => [h.reason, h.candidates.map((c) => c.id)])).toEqual([['possible-identity', ['mag:john-paul-ii/inter-munera-academiarum-1999']]]);
    // With an incipit, the same shelf record is an ordinary class mismatch or nothing.
    const withIncipit = run([jp2({ year: 1999, volume: 91, part: undefined, page: 849, category: 'LITTERAE APOSTOLICAE MOTU PROPRIO DATAE', date: '1999-01-28', incipit: 'Inter munera', toponym: null, description: 'Nova statuta' })],
      [jdoc({ id: 'mag:john-paul-ii/alia-1999', date: '1999-01-28', incipit: 'Alia res', title: 'Alia res' })]);
    expect(withIncipit.created).toHaveLength(1);
  });

  it('sees through the shelf\'s parenthesised incipit in the guard: the same incipit elsewhere in the year holds', () => {
    // The shelf's `Constat Christifideles (Sanctus Franciscus Assisiensis)` of 2 August 1982 against the index's
    // *Constat Christifideles* of 11 August 1982 (AAS 74 (1982) 1105).
    const r = run([jp2({ year: 1982, volume: 74, part: undefined, page: 1105, category: 'LITTERAE APOSTOLICAE', date: '1982-08-11', incipit: 'Constat Christifideles', toponym: null, description: 'Beata Maria Virgo Regina' })],
      [jdoc({ id: 'mag:john-paul-ii/constat-christifideles-sanctus-franciscus-assisiensis-1982', date: '1982-08-02', incipit: 'Constat Christifideles (Sanctus Franciscus Assisiensis)', title: 'Constat Christifideles (Sanctus Franciscus Assisiensis)' })]);
    expect(r.created).toEqual([]);
    expect(r.held.map((h) => h.reason)).toEqual(['same-incipit-elsewhere']);
  });

  it('holds an Epistula and a decretal of Benedict XVI (no letters or bulls shelf), and creates a decretal of John Paul II (bulls harvested)', () => {
    const r = run([
      jp2({ year: 2011, volume: 103, part: undefined, page: 168, category: 'LITTERAE DECRETALES', date: '2009-04-26', incipit: 'Accipite armaturam', quoted: true, toponym: null, description: 'Quibus beato Nonio Sanctorum honores decernuntur', pope: 'Benedictus XVI' }),
      jp2({ year: 1994, volume: 86, part: undefined, page: 305, category: 'LITTERAE DECRETALES', date: '1992-05-31', incipit: 'Notum feci vobis', quoted: true, toponym: null, description: 'Beatus Claudius La Colombière Sanctus renuntiatur' }),
      jp2({ year: 1980, volume: 72, part: undefined, page: 5, category: 'EPISTULAE', date: '1980-01-02', incipit: null, toponym: null, description: 'Ad Patriarchas' }),
    ], []);
    expect(r.created.map((c) => c.record.id)).toEqual(['mag:john-paul-ii/notum-feci-vobis-1992']);
    expect(r.held.map((h) => [h.entry.page, h.reason])).toEqual([[168, 'shelf-not-harvested'], [5, 'shelf-not-harvested']]);
  });
});

describe('createFromActa on the Acta Sanctae Sedis (ass volumes spec, decision 1)', () => {
  it('holds every unmatched ASS entry as series-not-created and creates nothing from the ASS', () => {
    const ass: ActaEntry = { series: 'ASS', volume: 33, year: 1900, page: 286, pope: 'Leo XIII', category: 'LITTERAE APOSTOLICAE', date: '1900-10-20', incipit: null, quoted: false, toponym: null, description: 'de Collegio Clericorum Lusitanorum', raw: '', opening: 'Quod iam diu optabamus, ut Collegium Lusitanum', anchor: 'dateline', evidence: { heading: '', salutation: null, opening: '', dateline: null, header: '' } };
    const result = matchActa([ass], []);
    const creation = createFromActa(result, []);
    expect(creation.created).toEqual([]);
    expect(creation.held).toMatchObject([{ reason: 'series-not-created', entry: { page: 286 } }]);
    // Held before the class and shelf rules: a same-date shelf record of the class is a match, not a hold.
    const shelf = doc({ id: 'mag:leo-xiii/quod-iam-diu-1900', issuerId: 'rp:leo-xiii', date: '1900-10-20', incipit: 'Quod iam diu' });
    const matched = run([ass], [shelf]);
    expect(matched.created).toEqual([]);
    expect(matched.held).toEqual([]);
  });
});

describe('the created-category table', () => {
  it('names only categories of categories.ts with exactly one class, and every harvested category is created or explained', () => {
    for (const id of Object.keys(CREATED_CATEGORIES)) {
      const c = ACTA_CATEGORIES.find((x) => x.id === id);
      expect(c, id).toBeDefined();
      expect(c!.classes, id).toHaveLength(1);
      expect(c!.harvested, id).not.toBe('no');
    }
    for (const c of ACTA_CATEGORIES.filter((c) => c.harvested !== 'no')) {
      expect(c.id in CREATED_CATEGORIES || c.id in NOT_CREATED, c.id).toBe(true);
    }
    expect(categoryForHeading('LITTERAE DECRETALES')!.id in CREATED_CATEGORIES).toBe(true);
  });
});

describe('actaTitle and printedToponym', () => {
  it('repairs the small capitals of a toponym and nothing else', () => {
    expect(printedToponym('VuCArien.')).toBe('Vucarien.');
    expect(printedToponym('de sAnCto petro sulA')).toBe('De Sancto Petro Sula');
    expect(printedToponym('Cuneen. – fossAnen.')).toBe('Cuneen. – Fossanen.');
    expect(printedToponym('Prisrensis-Priscensis')).toBe('Prisrensis-Priscensis');
    expect(printedToponym('phIlArChIIs A rAbICIs unItIs')).toBe('Philarchiis A Rabicis Unitis');
    expect(printedToponym('siunAën.')).toBe('Siunaën.');
  });

  it('keeps the colon or full stop the index prints after the toponym, and the incipit where one follows', () => {
    expect(actaTitle(entry({ incipit: null, toponym: 'ChiAngrAien.', description: 'In Thailandia nova conditur dioecesis Chiangraiensis', raw: '25 Apr. 2018 ChiAngrAien. In Thailandia nova conditur dioecesis Chian -\ngraiensis.  .  .  928' })))
      .toBe('Chiangraien. In Thailandia nova conditur dioecesis Chiangraiensis');
    expect(actaTitle(entry({ incipit: null, toponym: 'isiolAnus', description: 'In Kenia Vicariatus', raw: ' 1 Ian. 2023 isiolAnus: In Kenia Vicariatus  .  . 12' })))
      .toBe('Isiolanus: In Kenia Vicariatus');
    expect(actaTitle(entry({ incipit: 'Insita humanae naturae', quoted: true, toponym: 'DAnlIensIs.', description: 'In Honduria dioecesis Danliensis conditur', raw: '2017 Ian. 2 DAnlIensIs. « Insita humanae naturae ». In Honduria dioecesis Danliensis conditur  . 207' })))
      .toBe('Danliensis. « Insita humanae naturae ». In Honduria dioecesis Danliensis conditur');
  });

  it('prints a bare incipit with its full stop, a guillemet one in guillemets, and a description alone', () => {
    expect(actaTitle(entry({}))).toBe('Ius nativum. De patrimonio Sedis Apostolicae');
    expect(actaTitle(entry({ incipit: 'Vos estis lux mundi', quoted: true, description: '' }))).toBe('« Vos estis lux mundi »');
    expect(actaTitle(entry({ incipit: null, description: 'Statutum Dicasterii pro Laicis, Familia et Vita' }))).toBe('Statutum Dicasterii pro Laicis, Familia et Vita');
  });
});

describe('helpers', () => {
  it('titleContainsIncipit is case- and accent-insensitive and word-bounded', () => {
    expect(titleContainsIncipit('Revisione dello Statuto del Fondo Pensioni Vaticano', 'fondo pensioni')).toBe(true);
    expect(titleContainsIncipit('Lettera «Perché l’amore»', 'Perche l amore')).toBe(true);
    expect(titleContainsIncipit('Fondi pensionistici', 'Fondo Pensioni')).toBe(false);
  });

  it('isActaShelf recognises the aas/{year} form only', () => {
    expect(isActaShelf('aas/2023')).toBe(true);
    expect(isActaShelf('apost_letters')).toBe(false);
    expect(isActaShelf(null)).toBe(false);
    expect(isActaShelf(undefined)).toBe(false);
  });

  it('toActaDocument stamps the retrieval date it is given', () => {
    const d = toActaDocument(entry({}), 'rp:francis-i', { genre: 'apostolic-letter' }, categoryForHeading('LITTERAE APOSTOLICAE')!, '2030-01-01');
    expect(d.source!.retrieved).toBe('2030-01-01');
  });
});
