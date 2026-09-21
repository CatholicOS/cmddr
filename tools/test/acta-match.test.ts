import { describe, it, expect } from 'vitest';
import { matchActa, citedAt, incipitAgrees, incipitSlug, shiftDate, toponymStems, titleHasToponym, titleHasToponymInner, titleIsToponym } from '../src/acta/match.js';
import type { ActaEntry } from '../src/acta/index.js';
import type { DocumentRecord } from '../src/types.js';

const entry = (over: Partial<ActaEntry>): ActaEntry => ({
  series: 'AAS', volume: 115, year: 2023, page: 1, pope: 'Franciscus',
  category: 'LITTERAE APOSTOLICAE MOTU PROPRIO DATAE', date: '2023-02-20',
  incipit: null, quoted: false, toponym: null, description: '', raw: '', ...over,
});
const doc = (over: Partial<DocumentRecord> & { id: string }): DocumentRecord => ({
  title: over.id, idStatus: 'minted', genre: 'apostolic-letter', issuerId: 'rp:francis-i',
  issuerType: 'pope', date: '2023-02-20', characteristics: ['motu-proprio'], ...over,
});

describe('matchActa', () => {
  it('matches the only candidate of the class on the date, whatever the incipits say', () => {
    const r = matchActa(
      [entry({ incipit: 'Ius nativum', page: 263 })],
      [doc({ id: 'mag:francis-i/il-diritto-nativo-2023', incipit: 'Il Diritto Nativo' })],
    );
    expect(r.matches).toEqual([expect.objectContaining({ documentId: 'mag:francis-i/il-diritto-nativo-2023', by: 'unique' })]);
    expect(r.matches[0]!.entry.raw).toBeDefined();
    expect(r.unmatched).toEqual([]);
  });

  it('requires the class: same genre without the characteristic is a class mismatch, reported with the candidate', () => {
    const r = matchActa(
      [entry({ incipit: 'Fondo Pensioni' })],
      [doc({ id: 'mag:francis-i/apostolic-letter-2023-02-20', idStatus: 'provisional', characteristics: [] })],
    );
    expect(r.matches).toEqual([]);
    expect(r.unmatched).toHaveLength(1);
    expect(r.unmatched[0]!.sameDate.map((c) => c.id)).toEqual(['mag:francis-i/apostolic-letter-2023-02-20']);
  });

  it('tells several candidates apart by the incipit slug', () => {
    const docs = [
      doc({ id: 'mag:francis-i/mitis-iudex-dominus-iesus-2015', incipit: 'Mitis Iudex Dominus Iesus', date: '2015-08-15' }),
      doc({ id: 'mag:francis-i/mitis-et-misericors-iesus-2015', incipit: 'Mitis et misericors Iesus', date: '2015-08-15' }),
    ];
    const r = matchActa([
      entry({ incipit: 'Mitis et misericors Iesus', date: '2015-08-15', page: 946 }),
      entry({ incipit: 'Mitis Iudex Dominus Iesus', date: '2015-08-15', page: 958 }),
    ], docs);
    expect(r.matches.map((m) => [m.entry.page, m.documentId, m.by])).toEqual([
      [946, 'mag:francis-i/mitis-et-misericors-iesus-2015', 'incipit'],
      [958, 'mag:francis-i/mitis-iudex-dominus-iesus-2015', 'incipit'],
    ]);
  });

  it('tells several constitutions apart by the toponym against the title', () => {
    const docs = [
      doc({ id: 'mag:francis-i/cum-mirabilia-2022', genre: 'papal-bull', characteristics: ['apostolic-constitution'],
        date: '2022-12-14', title: 'Il Santo Padre ha eretto la Diocesi di Vucariensis (Nigeria)' }),
      doc({ id: 'mag:francis-i/alia-2022', genre: 'papal-bull', characteristics: ['apostolic-constitution'],
        date: '2022-12-14', title: 'Il Santo Padre ha eretto la Diocesi di Katsina (Nigeria)' }),
    ];
    const r = matchActa([entry({ category: 'CONSTITUTIONES APOSTOLICAE', toponym: 'VuCArien.', date: '2022-12-14' })], docs);
    expect(r.matches.map((m) => [m.documentId, m.by])).toEqual([['mag:francis-i/cum-mirabilia-2022', 'toponym']]);
  });

  it('reports what neither the incipit nor the toponym can separate as ambiguous, with every candidate', () => {
    const docs = [
      doc({ id: 'mag:francis-i/apostolic-letter-2013-10-13-1', idStatus: 'provisional', characteristics: [], date: '2013-10-13' }),
      doc({ id: 'mag:francis-i/apostolic-letter-2013-10-13-2', idStatus: 'provisional', characteristics: [], date: '2013-10-13' }),
    ];
    const r = matchActa([entry({ category: 'LITTERAE APOSTOLICAE', incipit: 'Spiritus Domini', date: '2013-10-13' })], docs);
    expect(r.matches).toEqual([]);
    expect(r.ambiguous).toHaveLength(1);
    expect(r.ambiguous[0]!.candidates.map((c) => c.id)).toEqual(docs.map((d) => d.id));
  });

  it('reports a candidate a day off as a near-miss and never matches it', () => {
    const r = matchActa(
      [entry({ incipit: 'Ius nativum', date: '2023-02-20' })],
      [doc({ id: 'mag:francis-i/ius-nativum-2023', incipit: 'Ius nativum', date: '2023-02-21' })],
    );
    expect(r.matches).toEqual([]);
    expect(r.unmatched[0]!.sameDate).toEqual([]);
    expect(r.unmatched[0]!.nearMisses.map((c) => [c.id, c.date])).toEqual([['mag:francis-i/ius-nativum-2023', '2023-02-21']]);
  });

  it('does not attempt a category the registry does not harvest, nor an unknown pope', () => {
    const r = matchActa([
      entry({ category: 'HOMILIAE', date: '2023-01-01' }),
      entry({ category: 'CONSISTORIA', date: '2023-01-01' }),
      entry({ pope: 'Leo XIV', date: '2025-05-09' }),
    ], [doc({ id: 'mag:francis-i/x-2023', genre: 'homily', characteristics: [], date: '2023-01-01' })]);
    expect(r.matches).toEqual([]);
    expect(r.skipped).toHaveLength(2);
    expect(r.unknownPope.map((e) => e.pope)).toEqual(['Leo XIV']);
  });

  it('matches an Urbi et Orbi filed under Nuntii, the one category with two registry classes', () => {
    const r = matchActa(
      [entry({ category: 'NUNTII', date: '2022-12-25', description: 'Nuntius et Benedictio « Urbi et Orbi » in sollemnitate Nativitatis Domini' })],
      [doc({ id: 'mag:francis-i/urbi-et-orbi-christmas-2022', genre: 'urbi-et-orbi', characteristics: [], date: '2022-12-25' })],
    );
    expect(r.matches.map((m) => m.documentId)).toEqual(['mag:francis-i/urbi-et-orbi-christmas-2022']);
  });

  it('matches only the issuer the pope heading names', () => {
    const r = matchActa(
      [entry({ pope: 'Benedictus XVI', category: 'LITTERAE APOSTOLICAE', date: '2010-05-30' })],
      [doc({ id: 'mag:francis-i/x-2010', characteristics: [], date: '2010-05-30' })],
    );
    expect(r.matches).toEqual([]);
    expect(r.unmatched).toHaveLength(1);
  });

  it('keeps neither claim when two entries match one document', () => {
    const r = matchActa([
      entry({ category: 'NUNTII', date: '2016-01-24', page: 157 }),
      entry({ category: 'NUNTII', date: '2016-01-24', page: 165 }),
    ], [doc({ id: 'mag:francis-i/world-communications-day-2016', genre: 'message', characteristics: [], date: '2016-01-24' })]);
    expect(r.matches).toEqual([]);
    expect(r.conflicts).toEqual([{
      documentId: 'mag:francis-i/world-communications-day-2016',
      entries: [expect.objectContaining({ page: 157 }), expect.objectContaining({ page: 165 })],
    }]);
  });

  it('resolves several claims on one document by the one entry the document names (acta volumes spec), releasing the others', () => {
    // AAS 70 (1978): three constitutions of 10 November 1977 against the shelf's one.
    const constitution = (over: Partial<ActaEntry>) => entry({
      pope: 'Paulus VI', category: 'CONSTITUTIONES APOSTOLICAE', date: '1977-11-10', year: 1978, volume: 70, ...over,
    });
    const shelf = doc({
      id: 'mag:paul-vi/avkaensis-1977', issuerId: 'rp:paul-vi', genre: 'papal-bull', characteristics: ['apostolic-constitution'],
      date: '1977-11-10', title: 'Avkaensis', incipit: 'Avkaensis',
    });
    const r = matchActa([
      constitution({ page: 81, toponym: 'MOHALESHOEKENSIS', incipit: 'Ut fert creditum' }),
      constitution({ page: 8, toponym: 'AVKAËNSIS', incipit: 'Verba Christi' }),
      constitution({ page: 82, toponym: 'AMBIKAPURENSIS', incipit: 'Votis concedere' }),
    ], [shelf]);
    expect(r.matches.map((m) => [m.entry.page, m.documentId, m.by])).toEqual([[8, 'mag:paul-vi/avkaensis-1977', 'toponym']]);
    expect(r.conflicts).toEqual([]);
    expect(r.unmatched.map((u) => [u.entry.page, u.sameDate.map((c) => c.id)])).toEqual([
      [81, ['mag:paul-vi/avkaensis-1977']], [82, ['mag:paul-vi/avkaensis-1977']],
    ]);
    // The incipit slug is evidence too; two evidenced claims, or none, keep neither.
    const letter = doc({ id: 'mag:paul-vi/plus-nongentos-1978', issuerId: 'rp:paul-vi', characteristics: [], date: '1978-03-11', incipit: 'Plus nongentos' });
    const l = matchActa([
      entry({ pope: 'Paulus VI', category: 'LITTERAE APOSTOLICAE', date: '1978-03-11', page: 284, incipit: 'Plus nongentos' }),
      entry({ pope: 'Paulus VI', category: 'LITTERAE APOSTOLICAE', date: '1978-03-11', page: 321, incipit: 'Valentinae archidioecesis' }),
    ], [letter]);
    expect(l.matches.map((m) => [m.entry.page, m.by])).toEqual([[284, 'incipit']]);
    const none = matchActa([
      entry({ pope: 'Paulus VI', category: 'LITTERAE APOSTOLICAE', date: '1978-03-11', page: 284, incipit: 'Alia' }),
      entry({ pope: 'Paulus VI', category: 'LITTERAE APOSTOLICAE', date: '1978-03-11', page: 321, incipit: 'Altera' }),
    ], [letter]);
    expect(none.matches).toEqual([]);
    expect(none.conflicts).toHaveLength(1);
  });

  it('matches a month-only entry by incipit within the month, and nothing else (acta volumes spec §4)', () => {
    const shelf = [
      doc({ id: 'mag:benedict-xv/alloquentes-proxime-1917', issuerId: 'rp:benedict-xv', date: '1917-03-25', incipit: 'Alloquentes proxime' }),
      doc({ id: 'mag:benedict-xv/nobilissimam-sacrarum-1917', issuerId: 'rp:benedict-xv', date: '1917-04-08', incipit: 'Nobilissimam sacrarum' }),
      doc({ id: 'mag:benedict-xv/alia-1917', issuerId: 'rp:benedict-xv', date: '1917-04-20', incipit: 'Alia' }),
    ];
    const mp = (over: Partial<ActaEntry>) => entry({ pope: 'Benedictus XV', year: 1917, volume: 9, part: 'I', ...over });
    const r = matchActa([
      mp({ date: '1917-03', incipit: 'Alloquentes proxime', page: 167 }),
      // The index's incipit is the full one, the shelf's is truncated: no match.
      mp({ date: '1917-04', incipit: 'Nobilissimam sacrarum aedium', page: 209 }),
      // A month-only entry without an incipit has nothing to match by.
      mp({ date: '1917-04', incipit: null, description: 'De clericorum Collegio', page: 210 }),
      // Two documents of the class with the incipit in the month: ambiguous.
      mp({ date: '1917-04', incipit: 'Alia', page: 211 }),
    ], [...shelf, doc({ id: 'mag:benedict-xv/alia-1917-04-30', issuerId: 'rp:benedict-xv', date: '1917-04-30', incipit: 'Alia' })]);
    expect(r.matches.map((m) => [m.entry.page, m.documentId, m.by])).toEqual([[167, 'mag:benedict-xv/alloquentes-proxime-1917', 'incipit-month']]);
    expect(r.unmatched.map((u) => [u.entry.page, u.sameDate.length, u.nearMisses.length])).toEqual([[209, 3, 0], [210, 3, 0]]);
    expect(r.ambiguous.map((a) => a.entry.page)).toEqual([211]);
  });

  it('maps every pope of the popes table, so a volume\'s genitive heading reaches the shelf', () => {
    const r = matchActa(
      [entry({ pope: 'Pius XI', category: 'LITTERAE ENCYCLICAE', date: '1931-05-15', incipit: 'Quadragesimo anno', year: 1931, volume: 23, page: 177 })],
      [doc({ id: 'mag:pius-xi/quadragesimo-anno-1931', issuerId: 'rp:pius-xi', genre: 'encyclical', characteristics: [], date: '1931-05-15', incipit: 'Quadragesimo anno' })],
    );
    expect(r.matches.map((m) => m.documentId)).toEqual(['mag:pius-xi/quadragesimo-anno-1931']);
    expect(matchActa([entry({ pope: 'LEONIS XIII', category: 'LITTERAE ENCYCLICAE', date: '1891-05-15' })], []).unknownPope).toHaveLength(1);
  });
});

describe('matchActa on the volumes of 1979-2002 (phase 2b-ii-c)', () => {
  it('compares an incipit with the shelf\'s trailing parenthesis dropped (incipitSlug), on both sides', () => {
    expect(incipitSlug('Tanta est (Episcopus Ipialensis)')).toBe('tanta-est');
    expect(incipitSlug('Constat Christifideles («Nossa Senhora da Luz»)')).toBe('constat-christifideles');
    expect(incipitSlug('Caritas Christi (Ludovico a Casaurea)')).toBe('caritas-christi');
    expect(incipitSlug('Qui a pueris')).toBe('qui-a-pueris');
    const docs = [
      doc({ id: 'mag:john-paul-ii/tanta-est-episcopus-ipialensis-1981', issuerId: 'rp:john-paul-ii', incipit: 'Tanta est (Episcopus Ipialensis)', title: 'Tanta est (Episcopus Ipialensis)', date: '1981-02-18', characteristics: [] }),
      doc({ id: 'mag:john-paul-ii/quod-ait-1981', issuerId: 'rp:john-paul-ii', incipit: 'Quod ait', title: 'Quod ait', date: '1981-02-18', characteristics: [] }),
    ];
    const r = matchActa([entry({ pope: 'Ioannes Paulus II', category: 'LITTERAE APOSTOLICAE', incipit: 'Tanta est', date: '1981-02-18', year: 1981, volume: 73, page: 4 })], docs);
    expect(r.matches.map((m) => [m.documentId, m.by])).toEqual([['mag:john-paul-ii/tanta-est-episcopus-ipialensis-1981', 'incipit']]);
  });

  it('re-points a two-page entry to the page a corrigendum keyed by its first page cites, instead of holding it (citedAt)', () => {
    // The 2014 index cites one act at `138, 261`; a corrigendum keyed AAS:106:138 whose
    // citation of record is AAS:106:261 means the act is cited at 261, and nothing is a reprint.
    const two = entry({ pope: 'Benedictus XVI', category: 'LITTERAE APOSTOLICAE', incipit: 'Deus caritas', date: '2011-10-08', year: 2014, volume: 106, page: 138, alsoPages: [261] });
    const row = { kind: 'corrigendum' as const, citationOf: 'AAS:106:261', indexLines: ['a', 'b'] as const, evidence: 'test' };
    const cited = citedAt(two, { 'AAS:106:138': row });
    expect(cited.reprint).toBe(false);
    expect(cited.entry.page).toBe(261);
    expect(cited.entry.alsoPages).toBeUndefined();
    // A row keyed by the entry's page whose citation is another entry's page: a reprint, as before.
    expect(citedAt(two, { 'AAS:106:138': { ...row, citationOf: 'AAS:104:482' } })).toEqual({ entry: two, reprint: true });
    // No row: untouched.
    expect(citedAt(two, {})).toEqual({ entry: two, reprint: false });
  });

  it('lists the later printing of an act printed twice as a reprint, never a claim', () => {
    const docs = [doc({ id: 'mag:benedict-xvi/ibi-vacabimus-2011', issuerId: 'rp:benedict-xvi', incipit: 'Ibi vacabimus', date: '2011-07-03', characteristics: [] })];
    const r = matchActa([
      entry({ pope: 'Benedictus XVI', category: 'LITTERAE APOSTOLICAE', incipit: 'Ibi vacabimus', date: '2011-07-03', year: 2012, volume: 104, page: 482 }),
      entry({ pope: 'Benedictus XVI', category: 'LITTERAE APOSTOLICAE', incipit: 'Ibi vacabimus', date: '2011-07-03', year: 2020, volume: 112, page: 479 }),
    ], docs);
    expect(r.matches.map((m) => [m.entry.year, m.documentId])).toEqual([[2012, 'mag:benedict-xvi/ibi-vacabimus-2011']]);
    expect(r.reprints.map((e) => e.year)).toEqual([2020]);
    expect(r.conflicts).toEqual([]);
  });

  it('withholds both references of a page two matched documents cite unless ACTA_SHARED_PAGES lists the pair', () => {
    const docs = [
      doc({ id: 'mag:john-paul-ii/pro-nostro-1979', issuerId: 'rp:john-paul-ii', incipit: 'Pro Nostro', date: '1979-05-02', characteristics: [] }),
      doc({ id: 'mag:john-paul-ii/qui-a-pueris-1979', issuerId: 'rp:john-paul-ii', incipit: 'Qui a pueris', date: '1979-05-05', characteristics: [] }),
      doc({ id: 'mag:john-paul-ii/portus-blairensis-1984', issuerId: 'rp:john-paul-ii', title: 'Portus Blairensis', date: '1984-06-22', genre: 'papal-bull', characteristics: ['apostolic-constitution'] }),
      doc({ id: 'mag:john-paul-ii/cabindana-1984', issuerId: 'rp:john-paul-ii', title: 'Cabindana', date: '1984-07-02', genre: 'papal-bull', characteristics: ['apostolic-constitution'] }),
    ];
    const jp2 = (over: Partial<ActaEntry>) => entry({ pope: 'Ioannes Paulus II', category: 'LITTERAE APOSTOLICAE', ...over });
    const r = matchActa([
      // AAS 71 (1979) 920: curated, both cited.
      jp2({ incipit: 'Pro Nostro', date: '1979-05-02', year: 1979, volume: 71, page: 920 }),
      jp2({ incipit: 'Qui a pueris', date: '1979-05-05', year: 1979, volume: 71, page: 920 }),
      // AAS 76 (1984) 946: not curated (Cabinda opens at 947), neither cited.
      jp2({ category: 'CONSTITUTIONES APOSTOLICAE', incipit: 'EX quo', toponym: 'PORTUS BLAIRENSIS', date: '1984-06-22', year: 1984, volume: 76, page: 946 }),
      jp2({ category: 'CONSTITUTIONES APOSTOLICAE', incipit: 'Catholicae prosperitas', toponym: 'CABINDANA', date: '1984-07-02', year: 1984, volume: 76, page: 946 }),
    ], docs);
    expect(r.matches.map((m) => m.documentId).sort()).toEqual(['mag:john-paul-ii/pro-nostro-1979', 'mag:john-paul-ii/qui-a-pueris-1979']);
    expect(r.sharedPages.map((sp) => [sp.page, sp.matches.map((m) => m.documentId)])).toEqual([['AAS:76:946', ['mag:john-paul-ii/portus-blairensis-1984', 'mag:john-paul-ii/cabindana-1984']]]);
  });
});

describe('toponymStems', () => {
  it('expands an abbreviated Latin adjective and splits a double toponym', () => {
    expect(toponymStems('VuCArien.')).toEqual(['vucarien', 'vucariensis', 'vucariensi']);
    expect(toponymStems('Cuneen. – fossAnen.')).toEqual(['cuneen', 'cuneensis', 'cuneensi', 'fossanen', 'fossanensis', 'fossanensi']);
    expect(toponymStems('isiolAnus')).toEqual(['isiolanus']);
  });
});

describe('titleHasToponym (the volumes of 1959-1977)', () => {
  it('needs every word of the head, or every word of the parenthesis, in the title', () => {
    // Paul VI's shelf titles an erection by the mother see to 1964 and by the new see from 1965; John XXIII's by both.
    expect(titleHasToponym('Cordubensis', 'CORDUBENSIS (Crucis Axeatae)')).toBe(true);
    expect(titleHasToponym('Voniuensis', 'CHUNCHEONENSIS (Voniuensis)')).toBe(true);
    expect(titleHasToponym('Durangensis - Sinaloensis (Mazatlanensis), con la quale …', 'DURANGENSIS-SINALOENSIS (Mazatlanensis)')).toBe(true);
    // Not a stem anywhere: Durango's other erection of the day, Chihuahua, does not carry Sinaloa.
    expect(titleHasToponym('Durangensis (Chihuahuensis), con la quale …', 'DURANGENSIS-SINALOENSIS (Mazatlanensis)')).toBe(false);
    expect(titleHasToponym('Resistenciae', 'CORDUBENSIS (Crucis Axeatae)')).toBe(false);
    // The 2017-2024 index's abbreviated adjective still meets its full form; a double see needs both.
    expect(titleHasToponym('Vucariensis', 'VuCArien.')).toBe(true);
    expect(titleHasToponym('Cuneensis - Fossanensis', 'Cuneen. – fossAnen.')).toBe(true);
    expect(titleHasToponym('Cuneensis', 'Cuneen. – fossAnen.')).toBe(false);
  });

  it('separates two titles carrying the head by the new see, and by the exact toponym', () => {
    expect(titleHasToponymInner('Durangensis (Chihuahuensis)', 'DURANGENSIS (Chihuahuensis)')).toBe(true);
    expect(titleHasToponymInner('Durangensis - Sinaloensis (Mazatlanensis)', 'DURANGENSIS (Chihuahuensis)')).toBe(false);
    expect(titleHasToponymInner('Cordubensis', 'CORDUBENSIS (Crucis Axeatae)')).toBe(false);
    expect(titleIsToponym('Liberopolitanae', 'LIBEROPOLITANAE')).toBe(true);
    expect(titleIsToponym('Liberopolitanae (Muilaënsis)', 'LIBEROPOLITANAE')).toBe(false);
    // Durango, 22 November 1958: two erections from one mother see, told apart in the matcher.
    const docs = [
      doc({ id: 'mag:john-xxiii/durangensis-chihuahuensis-1958', title: 'Durangensis (Chihuahuensis), con la quale …', issuerId: 'rp:john-xxiii', genre: 'papal-bull', characteristics: ['apostolic-constitution'], date: '1958-11-22', incipit: 'Durangensis (Chihuahuensis)' }),
      doc({ id: 'mag:john-xxiii/papal-bull-1958-11-22', title: 'Durangensis - Sinaloensis (Mazatlanensis), con la quale …', idStatus: 'provisional', issuerId: 'rp:john-xxiii', genre: 'papal-bull', characteristics: ['apostolic-constitution'], date: '1958-11-22' }),
    ];
    const r = matchActa([
      entry({ pope: 'Ioannes XXIII', year: 1959, volume: 51, page: 406, category: 'CONSTITUTIONES APOSTOLICAE', date: '1958-11-22', toponym: 'DURANGENSIS-SINALOENSIS (Mazatlanensis)', incipit: 'Qui hominum' }),
      entry({ pope: 'Ioannes XXIII', year: 1959, volume: 51, page: 400, category: 'CONSTITUTIONES APOSTOLICAE', date: '1958-11-22', toponym: 'DURANGENSIS (Chihuahuensis)', incipit: 'Ex quo' }),
    ], docs);
    expect(r.matches.map((m) => [m.entry.page, m.documentId, m.by])).toEqual([
      [406, 'mag:john-xxiii/papal-bull-1958-11-22', 'toponym'], [400, 'mag:john-xxiii/durangensis-chihuahuensis-1958', 'toponym'],
    ]);
  });
});

describe('shiftDate', () => {
  it('moves across month and year boundaries', () => {
    expect(shiftDate('2023-01-01', -1)).toBe('2022-12-31');
    expect(shiftDate('2024-02-28', 1)).toBe('2024-02-29');
  });
});

describe('the opening-prefix rule for ASS entries (ass volumes spec §5)', () => {
  const assEntry = (opening: string, page = 273): ActaEntry => ({
    series: 'ASS', volume: 33, year: 1900, page, pope: 'Leo XIII', category: 'EPISTOLA ENCYCLICA', date: '1900-11-01',
    incipit: null, quoted: false, toponym: null, description: 'De Iesu Christo Redemptore', raw: '', opening, anchor: 'dateline',
    evidence: { heading: '', salutation: null, opening, dateline: null, header: '' },
  });
  const tametsi = doc({ id: 'mag:leo-xiii/tametsi-futura-1900', issuerId: 'rp:leo-xiii', date: '1900-11-01', genre: 'encyclical', characteristics: [], incipit: 'Tametsi futura', title: 'Tametsi futura' });
  const other = doc({ id: 'mag:leo-xiii/other-1900', issuerId: 'rp:leo-xiii', date: '1900-11-01', genre: 'encyclical', characteristics: [], incipit: 'Tametsi', title: 'Tametsi' });
  const third = doc({ id: 'mag:leo-xiii/tametsi-fut-1900', issuerId: 'rp:leo-xiii', date: '1900-11-01', genre: 'encyclical', characteristics: [], incipit: 'Tametsi fut', title: 'x' });
  const opening = 'Tametsi futura prospicientibus, vacuo a sollicitudine animo esse';
  it('matches the one candidate of the class on the date without reading the opening (`unique`)', () => {
    const r = matchActa([assEntry(opening)], [tametsi]);
    expect(r.matches).toMatchObject([{ documentId: 'mag:leo-xiii/tametsi-futura-1900', by: 'unique' }]);
  });
  it('tells two candidates apart by the incipit slug as a word-boundary prefix of the opening slug (`opening`), and both candidates are prefixes → ambiguous', () => {
    const r = matchActa([assEntry(opening)], [tametsi, other]);
    // `tametsi` and `tametsi-futura` are both word-boundary prefixes: nothing separates them.
    expect(r.matches).toEqual([]);
    expect(r.ambiguous).toHaveLength(1);
    const r2 = matchActa([assEntry(opening)], [tametsi, third]);
    expect(r2.matches).toMatchObject([{ documentId: 'mag:leo-xiii/tametsi-futura-1900', by: 'opening' }]);
  });
  it('does not read `tametsi-fut` as a prefix of `tametsi-futura` (word boundary)', () => {
    const fourth = doc({ id: 'mag:leo-xiii/alia-1900', issuerId: 'rp:leo-xiii', date: '1900-11-01', genre: 'encyclical', characteristics: [], incipit: 'Alia verba', title: 'y' });
    const r = matchActa([assEntry(opening)], [third, fourth]);
    expect(r.matches).toEqual([]);
    expect(r.ambiguous).toHaveLength(1);
  });
  it('agrees when the opening is the incipit exactly, and never when the document prints no incipit', () => {
    expect(incipitAgrees({ incipit: null, opening: 'Tametsi futura' }, { incipit: 'Tametsi futura' })).toBe(true);
    expect(incipitAgrees({ incipit: null, opening: 'Tametsi futura' }, {})).toBe(false);
    expect(incipitAgrees({ incipit: null }, { incipit: 'Tametsi futura' })).toBe(false);
    // An AAS entry keeps the equality rule: the printed incipit, never a prefix.
    expect(incipitAgrees({ incipit: 'Tametsi futura', opening: 'Tametsi futura prospicientibus' }, { incipit: 'Tametsi futura' })).toBe(true);
    expect(incipitAgrees({ incipit: 'Tametsi futura prospicientibus' }, { incipit: 'Tametsi futura' })).toBe(false);
  });
  it('keeps the claim with the opening evidence when two ASS entries claim one document', () => {
    const r = matchActa([assEntry(opening, 273), assEntry('Alia verba prorsus diversa hic leguntur nunc', 300)], [tametsi]);
    expect(r.matches).toMatchObject([{ entry: { page: 273 }, by: 'opening' }]);
    expect(r.unmatched).toMatchObject([{ entry: { page: 300 } }]);
    expect(r.conflicts).toEqual([]);
  });
  it('leaves an ASS entry with the unreadable date marker unmatched and without near-misses', () => {
    const r = matchActa([{ ...assEntry('Ingenti sane laetitia suavique animi iucunditate hodie perfundimur'), date: '????-??-??', category: 'EPISTOLA' }], [tametsi]);
    expect(r.unmatched).toMatchObject([{ sameDate: [], nearMisses: [] }]);
  });
});
