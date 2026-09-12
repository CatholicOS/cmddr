import { describe, it, expect } from 'vitest';
import { matchActa, shiftDate, toponymStems } from '../src/acta/match.js';
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
});

describe('toponymStems', () => {
  it('expands an abbreviated Latin adjective and splits a double toponym', () => {
    expect(toponymStems('VuCArien.')).toEqual(['vucarien', 'vucariensis', 'vucariensi']);
    expect(toponymStems('Cuneen. – fossAnen.')).toEqual(['cuneen', 'cuneensis', 'cuneensi', 'fossanen', 'fossanensis', 'fossanensi']);
    expect(toponymStems('isiolAnus')).toEqual(['isiolanus']);
  });
});

describe('shiftDate', () => {
  it('moves across month and year boundaries', () => {
    expect(shiftDate('2023-01-01', -1)).toBe('2022-12-31');
    expect(shiftDate('2024-02-28', 1)).toBe('2024-02-29');
  });
});
