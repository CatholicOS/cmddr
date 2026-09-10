import { describe, it, expect } from 'vitest';
import { toDocument } from '../src/harvest/toDocument.js';
import { RECOVERED_INCIPITS } from '../src/mappings/index.js';
import { slugify } from '../src/slug.js';
import type { HarvestItem } from '../src/types.js';

/** An incipit-less shelf item, the shape that mints a provisional id today. */
const incipitless = (over: Partial<HarvestItem>): HarvestItem => ({
  title: 'Lettera Apostolica a qualcuno',
  incipit: null,
  date: '1941-11-23',
  sourceGenreLabel: 'apost_letters',
  url: 'https://www.vatican.va/x.html',
  languages: ['IT'],
  shelf: 'apost_letters',
  pageSlug: 'pius-xii',
  ...over,
});

const BOLIVIA_TITLE = "Epistola Apostolica all'Episcopato della Bolivia circa lo sviluppo "
  + 'dei Seminari e la sempre più efficiente formazione del clero';

describe('toDocument with a recovered incipit', () => {
  it('mints a name-based id for an incipit-less item the curated table names', () => {
    const d = toDocument(incipitless({ title: BOLIVIA_TITLE }), '2026-09-07');
    expect(d.id).toBe('mag:pius-xii/haud-mediocrem-1941');
    expect(d.idStatus).toBe('minted');
    expect(d.incipit).toBe('Haud mediocrem');
  });

  it('keeps the printed heading as the title, so nothing the source said is lost', () => {
    const d = toDocument(incipitless({ title: BOLIVIA_TITLE }), '2026-09-07');
    expect(d.title).toBe(BOLIVIA_TITLE);
  });

  it('leaves an incipit-less item the table does not name provisional', () => {
    const d = toDocument(incipitless({ title: 'Lettera Apostolica non catalogata' }), '2026-09-07');
    expect(d.idStatus).toBe('provisional');
    expect(d.incipit).toBeUndefined();
    expect(d.id).toBe('mag:pius-xii/apostolic-letter-1941-11-23');
  });

  it('never overrides an incipit the source itself printed', () => {
    // A recovered row must not shadow a real printed incipit: the table exists only for
    // the incipit-less shelf, and a heading that prints its own incipit always wins.
    const d = toDocument(incipitless({ title: BOLIVIA_TITLE, incipit: 'Rerum Novarum' }), '2026-09-07');
    expect(d.incipit).toBe('Rerum Novarum');
  });
});

describe('RECOVERED_INCIPITS', () => {
  const rows = Object.entries(RECOVERED_INCIPITS);

  it('holds the seventeen recovered incipits', () => {
    expect(rows).toHaveLength(17);
  });

  it('keys every row as pageSlug|title-slug|ISO-date, the shape the other curated tables use', () => {
    for (const [key] of rows) {
      const parts = key.split('|');
      expect(parts, key).toHaveLength(3);
      expect(slugify(parts[1]!), key).toBe(parts[1]);
      expect(parts[2], key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('quotes evidence for every row and names the standard it met', () => {
    for (const [key, row] of rows) {
      expect(row.incipit.trim(), key).not.toBe('');
      expect(row.evidence.length, key).toBeGreaterThan(40);
      expect(['aas', 'document'], key).toContain(row.source);
    }
  });

  it('cites Acta Apostolicae Sedis in the evidence of every aas-sourced row', () => {
    for (const [key, row] of rows.filter(([, r]) => r.source === 'aas')) {
      expect(row.evidence, key).toMatch(/AAS \d+/);
    }
  });

  it('records the three rows AAS does not itself cite by incipit', () => {
    const byDocument = rows.filter(([, r]) => r.source === 'document').map(([, r]) => r.incipit);
    expect(byDocument.sort()).toEqual([
      'Centesimo vertente anno', 'Confirma fratres tuos', 'Volvidos cinco anos',
    ]);
  });
});
