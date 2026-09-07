import { describe, it, expect } from 'vitest';
import { toDocument } from '../src/harvest/toDocument.js';
import type { HarvestItem } from '../src/types.js';

const item = (over: Partial<HarvestItem>): HarvestItem => ({
  incipit: 'Rerum Novarum', date: '1891-05-15', sourceGenreLabel: 'encyclicals',
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
  });

  it('reassigns conciliar documents to their council', () => {
    const d = toDocument(item({
      incipit: 'Pastor Aeternus', date: '1870-07-18',
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
      incipit: 'Conditae a Christo', date: '1900-12-08',
      sourceGenreLabel: 'apost_constitutions', shelf: 'apost_constitutions',
    }), '2026-09-07');
    expect(d.genre).toBe('papal-bull');
    expect(d.characteristics).toEqual(['apostolic-constitution']);
  });

  it('keeps an unmapped genre null and preserves the raw label', () => {
    const d = toDocument(item({
      incipit: 'La Serie', date: '1849-02-14', sourceGenreLabel: 'Protesta',
      shelf: null, pageSlug: 'pius-ix',
    }), '2026-09-07');
    expect(d.genre).toBeNull();
    expect(d.sourceGenreLabel).toBe('Protesta');
    expect(d.id).toBe('mag:pius-ix/la-serie-1849');
  });

  it('keeps the id slug round-trippable from the incipit', () => {
    const d = toDocument(item({ incipit: "Dall'alto dell'Apostolico Seggio", date: '1890-10-15' }), '2026-09-07');
    expect(d.id).toBe('mag:leo-xiii/dall-alto-dell-apostolico-seggio-1890');
  });

  it('throws on an unknown pope slug rather than guessing', () => {
    expect(() => toDocument(item({ pageSlug: 'francesco' }), '2026-09-07')).toThrow(/francesco/);
  });
});
