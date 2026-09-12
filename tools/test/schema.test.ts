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

  it('requires incipit when idStatus is minted and no series is set', () => {
    expect(validate(strip({ ...baseDoc, incipit: undefined }))).toBe(false);
  });

  describe('the series form of a minted id (#4)', () => {
    const peace = strip({
      ...baseDoc, id: 'mag:francis-i/world-day-of-peace-2025',
      title: 'LVIII Giornata Mondiale della Pace 2025 - “Rimetti a noi i nostri debiti, concedici la tua pace”',
      genre: 'message', issuerId: 'rp:francis-i', date: '2024-12-08',
      incipit: undefined, incipitLang: undefined, sigla: undefined,
      series: { id: 'world-day-of-peace', year: 2025, ordinal: 58 },
    });

    it('accepts a minted document with a series and no incipit', () => {
      expect(validate(peace)).toBe(true);
    });

    it('still accepts a minted document with an incipit and no series', () => {
      expect(validate(baseDoc)).toBe(true);
    });

    it('rejects a minted document with neither incipit nor series', () => {
      expect(validate(strip({ ...peace, series: undefined }))).toBe(false);
    });

    it('accepts a dated-only series with a year but no ordinal', () => {
      expect(validate({
        ...peace, id: 'mag:francis-i/lent-2015', series: { id: 'lent', year: 2015 },
      })).toBe(true);
    });

    it('rejects a provisional document that carries a series: the series form is minted by rule', () => {
      expect(validate({
        ...peace, idStatus: 'provisional', id: 'mag:francis-i/message-2024-12-08',
      })).toBe(false);
    });
  });

  it('accepts a minted id extended to the full date to resolve a collision', () => {
    expect(validate(strip({
      ...baseDoc, id: 'mag:pius-ix/ubi-primum-1849-02-02', title: 'Ubi Primum', incipit: 'Ubi Primum',
      issuerId: 'rp:pius-ix', date: '1849-02-02', sigla: undefined,
    }))).toBe(true);
  });

  it('rejects a minted id with a stray ordinal suffix', () => {
    expect(validate({ ...baseDoc, id: 'mag:john-paul-ii/evangelium-vitae-1995-3', idStatus: 'minted' })).toBe(false);
  });

  it('rejects a provisional id with a bare year', () => {
    expect(validate(strip({
      ...baseDoc, id: 'mag:francis-i/angelus-2015', idStatus: 'provisional',
      title: 'Angelus', genre: 'audience-catechesis', issuerId: 'rp:francis-i', date: '2015-03-22',
      sigla: undefined, incipit: undefined, incipitLang: undefined,
    }))).toBe(false);
  });

  it('accepts a provisional id with an optional ordinal', () => {
    expect(validate(strip({
      ...baseDoc, id: 'mag:francis-i/angelus-2015-03-22-2', idStatus: 'provisional',
      title: 'Angelus, 22 March 2015', genre: 'audience-catechesis', issuerId: 'rp:francis-i', date: '2015-03-22',
      sigla: undefined, incipit: undefined, incipitLang: undefined,
    }))).toBe(true);
  });

  it('rejects a document omitting idStatus, even one with an otherwise-loose id', () => {
    expect(validate(strip({ ...baseDoc, id: 'mag:leo-xiii/rerum-novarum', idStatus: undefined }))).toBe(false);
  });

  describe('actKind (#15)', () => {
    it('accepts each of the three kinds', () => {
      for (const actKind of ['teaching', 'governance', 'liturgical']) {
        expect(validate({ ...baseDoc, actKind }), actKind).toBe(true);
      }
    });

    it('rejects a kind outside the enum', () => {
      expect(validate({ ...baseDoc, actKind: 'juridical' })).toBe(false);
    });
  });

  describe('medium (#27)', () => {
    it('accepts each of the two media', () => {
      for (const medium of ['radio', 'video']) {
        expect(validate({ ...baseDoc, medium }), medium).toBe(true);
      }
    });

    it('rejects a medium outside the enum', () => {
      expect(validate({ ...baseDoc, medium: 'television' })).toBe(false);
      expect(validate({ ...baseDoc, medium: 'Radiomessaggio' })).toBe(false);
    });
  });

  describe('series (#16)', () => {
    it('accepts a numbered series entry', () => {
      expect(validate({ ...baseDoc, series: { id: 'world-day-of-peace', year: 2018, ordinal: 51 } })).toBe(true);
    });

    it('accepts a dated-only series entry with no ordinal', () => {
      expect(validate({ ...baseDoc, series: { id: 'lent', year: 2015 } })).toBe(true);
    });

    it('requires the id', () => {
      expect(validate({ ...baseDoc, series: { year: 2018, ordinal: 51 } })).toBe(false);
    });

    it('requires the occasion year (#4): a series document without one has no id', () => {
      expect(validate({ ...baseDoc, series: { id: 'world-day-of-peace', ordinal: 51 } })).toBe(false);
    });

    it('rejects a year that is not a four-digit integer', () => {
      expect(validate({ ...baseDoc, series: { id: 'lent', year: 15 } })).toBe(false);
      expect(validate({ ...baseDoc, series: { id: 'lent', year: 2015.5 } })).toBe(false);
      expect(validate({ ...baseDoc, series: { id: 'lent', year: '2015' } })).toBe(false);
    });

    it('rejects an id that is not slug-shaped', () => {
      expect(validate({ ...baseDoc, series: { id: 'consecrated_life', year: 2023 } })).toBe(false);
    });

    it('rejects an ordinal of 0 and a non-integer ordinal', () => {
      expect(validate({ ...baseDoc, series: { id: 'world-day-of-peace', year: 2018, ordinal: 0 } })).toBe(false);
      expect(validate({ ...baseDoc, series: { id: 'world-day-of-peace', year: 2018, ordinal: 51.5 } })).toBe(false);
    });

    it('rejects an unknown property on the series object', () => {
      expect(validate({ ...baseDoc, series: { id: 'world-day-of-peace', year: 2018, shelf: 'peace' } })).toBe(false);
    });
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

  it('accepts the three characteristics and rejects any other', () => {
    // The vocabulary is flat; which genre may bear which is invariant 22, not the schema.
    for (const c of ['apostolic-constitution', 'dogmatic-definition', 'motu-proprio']) {
      expect(validate({ ...baseDoc, characteristics: [c] }), c).toBe(true);
    }
    expect(validate({ ...baseDoc, characteristics: ['encyclical'] })).toBe(false);
    expect(validate({ ...baseDoc, characteristics: ['motu-proprio', 'motu-proprio'] })).toBe(false);
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
