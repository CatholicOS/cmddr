import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  COUNCILS, VATICAN_II_DOCUMENTS, ARCHIVE_LANGUAGE_SUFFIXES,
  CONCILIAR_SOURCE_GENRE_TO_GENRE, SOURCE_GENRE_TO_GENRE, VATICAN_SLUG_TO_ISSUER,
} from '../src/mappings/index.js';
import { slugify } from '../src/slug.js';

const genres = JSON.parse(readFileSync('data/genres.json', 'utf8')) as
  Array<{ id: string; issuerTypes?: string[] }>;

describe('COUNCILS', () => {
  it('holds Vatican II, promulgated throughout by Paul VI', () => {
    expect(COUNCILS).toHaveLength(1);
    expect(COUNCILS[0]!.pageSlug).toBe('ii_vatican_council');
    expect(COUNCILS[0]!.issuerId).toBe('oec:vatican-ii');
    // All sixteen documents open 'PAOLO VESCOVO SERVO DEI SERVI DI DIO' (spec 2.5).
    // John XXIII convoked the council but died before any document was promulgated.
    expect(COUNCILS[0]!.promulgatedBy).toBe('rp:paul-vi');
  });

  it('carries its own document table', () => {
    expect(COUNCILS[0]!.documents).toBe(VATICAN_II_DOCUMENTS);
  });

  it('resolves the council page slug to its COECDR id', () => {
    expect(VATICAN_SLUG_TO_ISSUER['ii_vatican_council']).toBe('oec:vatican-ii');
  });

  it('keeps every pope slug resolving as before', () => {
    expect(VATICAN_SLUG_TO_ISSUER['leo-xiii']).toBe('rp:leo-xiii');
    expect(VATICAN_SLUG_TO_ISSUER['francesco']).toBe('rp:francis-i');
  });

  it('records when its own fixture was fetched, independently of the pope fixtures', () => {
    expect(COUNCILS[0]!.retrieved).toBe('2026-09-08');
  });
});

describe('VATICAN_II_DOCUMENTS', () => {
  const rows = Object.entries(VATICAN_II_DOCUMENTS);

  it('holds sixteen documents, 4 constitutions / 3 declarations / 9 decrees', () => {
    expect(rows).toHaveLength(16);
    const bySection = (s: string) => rows.filter(([, r]) => r.section === s);
    expect(bySection('Costituzioni')).toHaveLength(4);
    expect(bySection('Dichiarazioni')).toHaveLength(3);
    expect(bySection('Decreti')).toHaveLength(9);
  });

  it('is keyed by its own incipit slug', () => {
    for (const [key] of rows) expect(slugify(key)).toBe(key);
    expect(VATICAN_II_DOCUMENTS['gaudium-et-spes']).toBeDefined();
  });

  it('gives Sacrosanctum Concilium no descriptiveTitle, because it prints no qualifier', () => {
    const sc = VATICAN_II_DOCUMENTS['sacrosanctum-concilium']!;
    expect(sc.heading).toBe('COSTITUZIONE SULLA SACRA LITURGIA');
    expect(sc.descriptiveTitle).toBeUndefined();
    expect(sc.sourceGenreLabel).toBe('Costituzione');
  });

  it('marks the two dogmatic constitutions and the one pastoral constitution', () => {
    const qualified = rows.filter(([, r]) => r.descriptiveTitle !== undefined)
      .map(([k, r]) => [k, r.descriptiveTitle]);
    expect(qualified.sort()).toEqual([
      ['dei-verbum', 'dogmatic'],
      ['gaudium-et-spes', 'pastoral'],
      ['lumen-gentium', 'dogmatic'],
    ]);
  });

  it('quotes a heading that actually contains the recorded genre label', () => {
    for (const [key, r] of rows) {
      expect(r.heading.startsWith(r.sourceGenreLabel.toUpperCase()), key).toBe(true);
    }
  });

  it('records an ISO printed date for every document', () => {
    for (const [key, r] of rows) {
      expect(r.printedDate, key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe('CONCILIAR_SOURCE_GENRE_TO_GENRE', () => {
  it('maps every label the curated table uses', () => {
    for (const [key, r] of Object.entries(VATICAN_II_DOCUMENTS)) {
      const mapping = CONCILIAR_SOURCE_GENRE_TO_GENRE[r.sourceGenreLabel.toLowerCase()];
      expect(mapping, key).toBeDefined();
      expect(mapping!.genre, key).not.toBeNull();
    }
  });

  it('maps only to genres the Genre Registry allows a council to issue', () => {
    const allowed = new Map(genres.map((g) => [g.id, g.issuerTypes ?? []]));
    for (const [label, mapping] of Object.entries(CONCILIAR_SOURCE_GENRE_TO_GENRE)) {
      expect(allowed.get(mapping.genre!), label).toContain('ecumenical-council');
    }
  });

  it("does not disturb the shared map's papal 'decreto'", () => {
    // A papal decree has no Genre Registry row; 'decree' is council-only, so pointing
    // the shared key at it would fail invariant 17 for every Pius IX decree.
    expect(CONCILIAR_SOURCE_GENRE_TO_GENRE['decreto']!.genre).toBe('decree');
    expect(SOURCE_GENRE_TO_GENRE['decreto']!.genre).toBeNull();
  });

  it('agrees with the conciliar genre map on every descriptiveTitle', () => {
    for (const [key, r] of Object.entries(VATICAN_II_DOCUMENTS)) {
      const mapped = CONCILIAR_SOURCE_GENRE_TO_GENRE[r.sourceGenreLabel.toLowerCase()]!;
      expect(mapped.descriptiveTitle, key).toBe(r.descriptiveTitle);
    }
  });
});

describe('ARCHIVE_LANGUAGE_SUFFIXES', () => {
  it('maps lt to Latin, not Lithuanian', () => {
    expect(ARCHIVE_LANGUAGE_SUFFIXES['lt']).toBe('LA');
  });

  it('maps the other suffixes that diverge from ISO', () => {
    expect(ARCHIVE_LANGUAGE_SUFFIXES['ge']).toBe('DE');
    expect(ARCHIVE_LANGUAGE_SUFFIXES['sp']).toBe('ES');
    expect(ARCHIVE_LANGUAGE_SUFFIXES['po']).toBe('PT');
  });
});
