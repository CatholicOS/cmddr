import { describe, it, expect } from 'vitest';
import { toDocument } from '../src/harvest/toDocument.js';
import type { HarvestItem } from '../src/types.js';

const item = (over: Partial<HarvestItem>): HarvestItem => ({
  title: 'Rerum Novarum', incipit: 'Rerum Novarum', date: '1891-05-15', sourceGenreLabel: 'encyclicals',
  url: 'https://www.vatican.va/x.html', languages: ['IT'], shelf: 'encyclicals',
  pageSlug: 'leo-xiii', ...over,
});

describe('toDocument', () => {
  it('builds a minted papal record', () => {
    const d = toDocument(item({}), '2026-09-07');
    expect(d.id).toBe('mag:leo-xiii/rerum-novarum-1891');
    expect(d.issuerId).toBe('rp:leo-xiii');
    expect(d.issuerType).toBe('pope');
    expect(d.genre).toBe('encyclical');
    expect(d.idStatus).toBe('minted');
    expect(d.incipit).toBe('Rerum Novarum');
    expect(d.source!.retrieved).toBe('2026-09-07');
    // sourceGenreLabel is preserved even when genre is non-null (spec §4.1).
    expect(d.sourceGenreLabel).toBe('encyclicals');
  });

  it('reassigns conciliar documents to their council', () => {
    const d = toDocument(item({
      title: 'Pastor Aeternus', incipit: 'Pastor Aeternus', date: '1870-07-18',
      sourceGenreLabel: 'Constitutio dogmatica', shelf: null, pageSlug: 'pius-ix',
    }), '2026-09-07');
    expect(d.id).toBe('mag:vatican-i/pastor-aeternus-1870');
    expect(d.issuerId).toBe('oec:vatican-i');
    expect(d.issuerType).toBe('ecumenical-council');
    expect(d.promulgatedBy).toBe('rp:pius-ix');
    expect(d.genre).toBe('constitution');
    expect(d.descriptiveTitle).toBe('dogmatic');
  });

  it('maps an apostolic constitution to papal-bull with a characteristic', () => {
    const d = toDocument(item({
      title: 'Conditae a Christo', incipit: 'Conditae a Christo', date: '1900-12-08',
      sourceGenreLabel: 'apost_constitutions', shelf: 'apost_constitutions',
    }), '2026-09-07');
    expect(d.genre).toBe('papal-bull');
    expect(d.characteristics).toEqual(['apostolic-constitution']);
  });

  it('keeps an unmapped genre null and preserves the raw label', () => {
    const d = toDocument(item({
      title: 'La Serie', incipit: 'La Serie', date: '1849-02-14', sourceGenreLabel: 'Protesta',
      shelf: null, pageSlug: 'pius-ix',
    }), '2026-09-07');
    expect(d.genre).toBeNull();
    expect(d.sourceGenreLabel).toBe('Protesta');
    expect(d.id).toBe('mag:pius-ix/la-serie-1849');
  });

  it('keeps the id slug round-trippable from the incipit', () => {
    const d = toDocument(item({
      title: "Dall'alto dell'Apostolico Seggio", incipit: "Dall'alto dell'Apostolico Seggio", date: '1890-10-15',
    }), '2026-09-07');
    expect(d.id).toBe('mag:leo-xiii/dall-alto-dell-apostolico-seggio-1890');
  });

  it('throws on an unknown pope slug rather than guessing', () => {
    // 'francesco' (Francis, Task 18) is now a real, mapped pope slug -- a genuinely
    // unmapped one is needed to exercise this guard.
    expect(() => toDocument(item({ pageSlug: 'nonexistent-pope' }), '2026-09-07'))
      .toThrow(/nonexistent-pope/);
  });

  const conciliarItem = (over: Partial<HarvestItem>): HarvestItem => item({
    title: 'Lumen Gentium', incipit: 'Lumen Gentium', date: '1964-11-21',
    sourceGenreLabel: 'Costituzione dogmatica', shelf: null,
    pageSlug: 'ii_vatican_council', url: 'https://www.vatican.va/x.html', ...over,
  });

  it('builds a Vatican II constitution', () => {
    const d = toDocument(conciliarItem({}), '2026-09-08');
    expect(d.id).toBe('mag:vatican-ii/lumen-gentium-1964');
    expect(d.issuerId).toBe('oec:vatican-ii');
    expect(d.issuerType).toBe('ecumenical-council');
    expect(d.genre).toBe('constitution');
    expect(d.descriptiveTitle).toBe('dogmatic');
    expect(d.idStatus).toBe('minted');
    expect(d.sourceGenreLabel).toBe('Costituzione dogmatica');
  });

  it('records Paul VI as the promulgator of every Vatican II document', () => {
    expect(toDocument(conciliarItem({}), '2026-09-08').promulgatedBy).toBe('rp:paul-vi');
    expect(toDocument(conciliarItem({
      title: 'Inter Mirifica', incipit: 'Inter Mirifica', date: '1963-12-04',
      sourceGenreLabel: 'Decreto',
    }), '2026-09-08').promulgatedBy).toBe('rp:paul-vi');
  });

  it('maps a conciliar decree to the decree genre', () => {
    const d = toDocument(conciliarItem({
      title: 'Ad Gentes', incipit: 'Ad Gentes', date: '1965-12-07',
      sourceGenreLabel: 'Decreto',
    }), '2026-09-08');
    expect(d.id).toBe('mag:vatican-ii/ad-gentes-1965');
    expect(d.genre).toBe('decree');
    expect(d.descriptiveTitle).toBeUndefined();
  });

  it('maps a conciliar declaration to the declaration genre', () => {
    const d = toDocument(conciliarItem({
      title: 'Nostra Aetate', incipit: 'Nostra Aetate', date: '1965-10-28',
      sourceGenreLabel: 'Dichiarazione',
    }), '2026-09-08');
    expect(d.genre).toBe('declaration');
  });

  it('gives an unqualified conciliar constitution no descriptiveTitle', () => {
    const d = toDocument(conciliarItem({
      title: 'Sacrosanctum Concilium', incipit: 'Sacrosanctum Concilium',
      date: '1963-12-04', sourceGenreLabel: 'Costituzione',
    }), '2026-09-08');
    expect(d.genre).toBe('constitution');
    expect(d.descriptiveTitle).toBeUndefined();
  });

  it('leaves a papal decreto mapped to no genre', () => {
    // Pius IX's flat page prints papal decrees, for which the Genre Registry has no
    // row. 'decree' is issuerTypes: ['ecumenical-council'], so mapping this to it
    // would fail invariant 17.
    const d = toDocument(item({
      title: 'Quod aliquantulum', incipit: 'Quod aliquantulum', date: '1847-03-01',
      sourceGenreLabel: 'Decreto', shelf: null, pageSlug: 'pius-ix',
    }), '2026-09-08');
    expect(d.issuerType).toBe('pope');
    expect(d.genre).toBeNull();
    expect(d.sourceGenreLabel).toBe('Decreto');
  });

  it('keeps Vatican I on its reassignment route, promulgated by Pius IX', () => {
    const d = toDocument(item({
      title: 'Dei Filius', incipit: 'Dei Filius', date: '1870-04-24',
      sourceGenreLabel: 'Costituzione dogmatica', shelf: null, pageSlug: 'pius-ix',
    }), '2026-09-08');
    expect(d.id).toBe('mag:vatican-i/dei-filius-1870');
    expect(d.promulgatedBy).toBe('rp:pius-ix');
    expect(d.descriptiveTitle).toBe('dogmatic');
  });
});

// The brief's own draft of these two describe blocks used pageSlug 'pius-xii'/'pius-xi',
// which are not (yet) in VATICAN_SLUG_TO_ISSUER -- only benedict-xiv, pius-ix, leo-xiii
// and pius-x are harvested as of this task -- so toDocument would throw before reaching
// the code under test. Rewritten against 'pius-x', which is already mapped, keeping the
// same shapes and intent.
describe('toDocument on a heading with no recoverable incipit', () => {
  const heading: HarvestItem = {
    title: 'Lettera Apostolica (breve) che proclama Santa Chiara Patrona Celeste della Televisione',
    incipit: null,
    date: '1958-02-14', sourceGenreLabel: 'apost_letters', url: null,
    languages: ['IT'], shelf: 'apost_letters', pageSlug: 'pius-x',
  };

  it('mints a provisional id from the genre and the full date', () => {
    const d = toDocument(heading, '2026-09-07');
    expect(d.idStatus).toBe('provisional');
    expect(d.id).toBe('mag:pius-x/apostolic-letter-1958-02-14');
  });

  it('keeps the full heading as the title and omits the incipit entirely', () => {
    const d = toDocument(heading, '2026-09-07');
    expect(d.title).toBe(heading.title);
    expect('incipit' in d).toBe(false);
  });

  it('falls back to the source label when the genre is unmapped', () => {
    const d = toDocument({ ...heading, sourceGenreLabel: 'Proclama' }, '2026-09-07');
    expect(d.id).toBe('mag:pius-x/proclama-1958-02-14');
  });
});

describe('toDocument on a heading with an incipit', () => {
  it('still mints from the incipit and records the title separately', () => {
    const d = toDocument({
      title: 'Mirabilis Deus, col quale il Pontefice attribuisce a Don Giovanni Bosco',
      incipit: 'Mirabilis Deus',
      date: '1934-04-01', sourceGenreLabel: 'briefs', url: null,
      languages: ['IT'], shelf: 'briefs', pageSlug: 'pius-x',
    }, '2026-09-07');
    expect(d.idStatus).toBe('minted');
    expect(d.id).toBe('mag:pius-x/mirabilis-deus-1934');
    expect(d.incipit).toBe('Mirabilis Deus');
    expect(d.title).toBe('Mirabilis Deus, col quale il Pontefice attribuisce a Don Giovanni Bosco');
  });
});
