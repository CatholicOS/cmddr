import { describe, it, expect } from 'vitest';
import { checkDocuments, checkAssessments, type GenreLike } from '../src/validate/invariants.js';
import type { DocumentRecord } from '../src/types.js';

const GENRES: GenreLike[] = [
  { id: 'encyclical', issuerTypes: ['pope'] },
  { id: 'constitution', issuerTypes: ['ecumenical-council'] },
  { id: 'papal-bull', issuerTypes: ['pope'] },
];

const good: DocumentRecord = {
  id: 'mag:leo-xiii/rerum-novarum-1891', title: 'Rerum Novarum', incipit: 'Rerum Novarum',
  idStatus: 'minted', genre: 'encyclical', issuerId: 'rp:leo-xiii', issuerType: 'pope',
  date: '1891-05-15',
};
const rules = (docs: DocumentRecord[]) => checkDocuments(docs, GENRES).map((v) => v.rule);

describe('checkDocuments', () => {
  it('passes a well-formed record', () => {
    expect(checkDocuments([good], GENRES)).toEqual([]);
  });

  it('8: flags a malformed or duplicated id', () => {
    expect(rules([{ ...good, id: 'md:leo-xiii/rerum-novarum-1891' }])).toContain(8);
    expect(rules([good, { ...good, date: '1891-05-16' }])).toContain(8);
  });

  it('9: flags a namespace that disagrees with issuerId', () => {
    expect(rules([{ ...good, issuerId: 'rp:pius-ix' }])).toContain(9);
  });

  it('10: flags a year that disagrees with the date', () => {
    expect(rules([{ ...good, date: '1892-05-15' }])).toContain(10);
  });

  it('11: flags an unresolved same-issuer/incipit/year collision', () => {
    const a = { ...good, id: 'mag:pius-ix/ubi-primum-1849', incipit: 'Ubi primum',
      title: 'Ubi primum', issuerId: 'rp:pius-ix', date: '1849-02-02' };
    const b = { ...a, date: '1849-06-17' };
    expect(rules([a, b])).toContain(11);

    const a2 = { ...a, id: 'mag:pius-ix/ubi-primum-1849-02-02' };
    const b2 = { ...b, id: 'mag:pius-ix/ubi-primum-1849-06-17' };
    expect(rules([a2, b2])).not.toContain(11);
  });

  it('12: flags an id slug that does not round-trip from the incipit', () => {
    expect(rules([{ ...good, id: 'mag:leo-xiii/adiutricem-1891' }])).toContain(12);
  });

  it('13: flags an issuer absent from the vendored registries', () => {
    expect(rules([{ ...good, id: 'mag:nemo-i/rerum-novarum-1891', issuerId: 'rp:nemo-i' }]))
      .toContain(13);
    expect(rules([{ ...good, promulgatedBy: 'rp:nemo-i' }])).toContain(13);
  });

  it('15: flags an unknown genre, and a null genre with no source label', () => {
    expect(rules([{ ...good, genre: 'sonnet' }])).toContain(15);
    expect(rules([{ ...good, genre: null }])).toContain(15);
    expect(rules([{ ...good, genre: null, sourceGenreLabel: 'Protesta' }])).not.toContain(15);
  });

  it('accepts a well-formed provisional record', () => {
    expect(checkDocuments([{
      ...good, id: 'mag:francis-i/angelus-2015-03-22', idStatus: 'provisional',
      issuerId: 'rp:francis-i', date: '2015-03-22',
    }], GENRES)).toEqual([]);
  });

  it('13: an unresolvable issuer does not suppress rules 10, 12 and 15', () => {
    const result = rules([{
      ...good, issuerId: 'leo-xiii', date: '1892-05-15', genre: 'sonnet',
    }]);
    expect(result).toContain(13);
    expect(result).toContain(10);
    expect(result).toContain(15);
  });

  it('accepts a conciliar record namespaced under its council', () => {
    expect(checkDocuments([{
      id: 'mag:vatican-i/pastor-aeternus-1870', title: 'Pastor Aeternus',
      incipit: 'Pastor Aeternus', idStatus: 'minted', genre: 'constitution',
      issuerId: 'oec:vatican-i', issuerType: 'ecumenical-council',
      promulgatedBy: 'rp:pius-ix', date: '1870-07-18',
    }], GENRES)).toEqual([]);
  });

  it('16: flags an oec: issuerId whose issuerType is not ecumenical-council', () => {
    expect(rules([{ ...good, issuerId: 'oec:vatican-i', id: 'mag:vatican-i/rerum-novarum-1891' }]))
      .toContain(16);
  });

  it('16: flags an ecumenical-council issuerType whose issuerId is not oec:', () => {
    expect(rules([{ ...good, issuerType: 'ecumenical-council' }])).toContain(16);
  });

  it('17: passes when issuerType is one of the genre\'s issuerTypes', () => {
    expect(rules([good])).not.toContain(17);
  });

  it('17: flags an issuerType not among the genre\'s issuerTypes', () => {
    expect(rules([{ ...good, issuerType: 'bishop' }])).toContain(17);
  });
});

describe('checkAssessments', () => {
  const DOCS = new Set(['mag:john-paul-ii/evangelium-vitae-1995']);
  const ok = {
    id: 'mag:john-paul-ii/evangelium-vitae-1995#62',
    document: 'mag:john-paul-ii/evangelium-vitae-1995',
    section: '62',
  };

  it('passes a well-formed locus', () => {
    expect(checkAssessments([ok], DOCS)).toEqual([]);
  });

  it('passes a document-wide locus', () => {
    expect(checkAssessments([{
      id: 'mag:john-paul-ii/evangelium-vitae-1995#*',
      document: 'mag:john-paul-ii/evangelium-vitae-1995', section: '*',
    }], DOCS)).toEqual([]);
  });

  it('14: flags a locus whose prefix is not its parent document', () => {
    expect(checkAssessments([{ ...ok, id: 'mag:leo-xiii/rerum-novarum-1891#62' }], DOCS)
      .map((v) => v.rule)).toContain(14);
  });

  it('14: flags a locus whose section disagrees with the id', () => {
    expect(checkAssessments([{ ...ok, section: '57' }], DOCS).map((v) => v.rule)).toContain(14);
  });

  it('14: flags the old hyphen locus', () => {
    expect(checkAssessments([{ ...ok, id: 'EV-62' }], DOCS).map((v) => v.rule)).toContain(14);
  });

  it('14: flags a reference to a document that does not exist', () => {
    expect(checkAssessments([{
      id: 'mag:pius-ix/nemo-1849#1', document: 'mag:pius-ix/nemo-1849', section: '1',
    }], DOCS).map((v) => v.rule)).toContain(14);
  });
});
