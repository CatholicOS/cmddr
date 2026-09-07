import { describe, it, expect } from 'vitest';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import documentSchema from '../../schema/document.schema.json' with { type: 'json' };
import assessmentSchema from '../../schema/assessment.schema.json' with { type: 'json' };

function compile(schema: object) {
  const ajv = new Ajv2020({ strict: false });
  addFormats(ajv);
  return ajv.compile(schema);
}

/** ajv distinguishes an absent key from one whose value is undefined; strip them. */
function strip<T extends object>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;
}

const baseDoc = {
  id: 'mag:john-paul-ii/evangelium-vitae-1995',
  title: 'Evangelium Vitae',
  incipit: 'Evangelium Vitae',
  incipitLang: 'la',
  idStatus: 'minted',
  genre: 'encyclical',
  issuerId: 'rp:john-paul-ii',
  issuerType: 'pope',
  date: '1995-03-25',
  scope: 'universal',
  sigla: 'EV',
};

describe('document.schema.json', () => {
  const validate = compile(documentSchema);

  it('accepts a minted document', () => {
    expect(validate(baseDoc)).toBe(true);
  });

  it('rejects an unprefixed issuerId', () => {
    expect(validate({ ...baseDoc, issuerId: 'john-paul-ii' })).toBe(false);
  });

  it('accepts a conciliar document with promulgatedBy', () => {
    expect(validate(strip({
      ...baseDoc,
      id: 'mag:vatican-i/pastor-aeternus-1870',
      title: 'Pastor Aeternus', incipit: 'Pastor Aeternus',
      genre: 'constitution', descriptiveTitle: 'dogmatic',
      issuerId: 'oec:vatican-i', issuerType: 'ecumenical-council',
      promulgatedBy: 'rp:pius-ix', date: '1870-07-18', sigla: undefined,
    }))).toBe(true);
  });

  it('rejects the old short-sigla id form', () => {
    expect(validate({ ...baseDoc, id: 'EV' })).toBe(false);
  });

  it('rejects the md: prefix', () => {
    expect(validate({ ...baseDoc, id: 'md:john-paul-ii/evangelium-vitae-1995' })).toBe(false);
  });

  it('allows a null genre when sourceGenreLabel is present', () => {
    expect(validate(strip({
      ...baseDoc, id: 'mag:pius-ix/la-serie-1849', title: 'La Serie', incipit: 'La Serie',
      incipitLang: 'it', genre: null, sourceGenreLabel: 'Protesta',
      issuerId: 'rp:pius-ix', date: '1849-02-14', sigla: undefined,
    }))).toBe(true);
  });

  it('accepts a provisional id only when idStatus is provisional', () => {
    const provisional = {
      ...baseDoc, id: 'mag:francis-i/angelus-2015-03-22', idStatus: 'provisional',
      title: 'Angelus, 22 March 2015', genre: 'audience-catechesis',
      issuerId: 'rp:francis-i', date: '2015-03-22', sigla: undefined,
      incipit: undefined, incipitLang: undefined,
    };
    expect(validate(strip(provisional))).toBe(true);
  });

  it('requires incipit when idStatus is minted', () => {
    expect(validate(strip({ ...baseDoc, incipit: undefined }))).toBe(false);
  });

  it('records harvest provenance', () => {
    expect(validate({
      ...baseDoc,
      source: {
        url: 'https://www.vatican.va/content/leo-xiii/it/encyclicals/documents/x.html',
        shelf: 'encyclicals', alsoShelvedAs: ['letters'], languages: ['IT', 'LA'], retrieved: '2026-09-07',
      },
    })).toBe(true);
  });
});

describe('assessment.schema.json', () => {
  const validate = compile(assessmentSchema);
  const base = {
    document: 'mag:john-paul-ii/evangelium-vitae-1995',
    section: '62',
    register: 'ordinary-universal',
    intent: 'definitive',
    object: 'revealed',
    assent: 'fides-divina-et-catholica',
    provenance: { status: 'contested' },
  };

  it('accepts a # locus', () => {
    expect(validate({ ...base, id: 'mag:john-paul-ii/evangelium-vitae-1995#62' })).toBe(true);
  });

  it('accepts a document-wide #* locus', () => {
    expect(validate(strip({
      ...base, id: 'mag:john-paul-ii/evangelium-vitae-1995#*', section: '*',
      register: 'authentic-ordinary', intent: 'non-definitive',
      object: undefined, assent: 'religiosum-obsequium',
    }))).toBe(true);
  });

  it('rejects the old hyphen locus', () => {
    expect(validate({ ...base, id: 'EV-62', document: 'EV' })).toBe(false);
  });
});
