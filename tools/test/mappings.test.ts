import { describe, it, expect } from 'vitest';
import {
  VATICAN_SLUG_TO_ISSUER, PILOT_POPES, SHELVES,
  SOURCE_GENRE_TO_GENRE, CONCILIAR_REASSIGNMENTS,
  KNOWN_PONTIFF_IDS, KNOWN_COUNCIL_IDS,
} from '../src/mappings/index.js';

describe('vendored registries', () => {
  it('loads every pontiff and council id', () => {
    expect(KNOWN_PONTIFF_IDS.size).toBe(265);
    expect(KNOWN_COUNCIL_IDS.size).toBe(21);
    expect(KNOWN_PONTIFF_IDS.has('rp:leo-xiii')).toBe(true);
    expect(KNOWN_COUNCIL_IDS.has('oec:vatican-i')).toBe(true);
  });
});

describe('pontiff slug mapping', () => {
  it('maps vatican.va slugs, which differ from CRPDR ids', () => {
    expect(VATICAN_SLUG_TO_ISSUER['benedictus-xiv']).toBe('rp:benedict-xiv');
    expect(VATICAN_SLUG_TO_ISSUER['pius-ix']).toBe('rp:pius-ix');
    expect(VATICAN_SLUG_TO_ISSUER['leo-xiii']).toBe('rp:leo-xiii');
  });

  it('maps every mapped slug onto a real pontiff id', () => {
    for (const id of Object.values(VATICAN_SLUG_TO_ISSUER)) {
      expect(KNOWN_PONTIFF_IDS.has(id)).toBe(true);
    }
  });

  it('describes the pilot corpus and its eras', () => {
    expect(PILOT_POPES.map((p) => p.pageSlug))
      .toEqual(['benedictus-xiv', 'pius-ix', 'leo-xiii']);
    expect(PILOT_POPES.find((p) => p.pageSlug === 'leo-xiii')!.era).toBe('shelf');
    expect(PILOT_POPES.find((p) => p.pageSlug === 'pius-ix')!.era).toBe('flat');
    expect(SHELVES).toHaveLength(8);
  });
});

describe('genre mapping', () => {
  it('maps the common source labels', () => {
    expect(SOURCE_GENRE_TO_GENRE['enciclica']!.genre).toBe('encyclical');
    expect(SOURCE_GENRE_TO_GENRE['bolla']!.genre).toBe('papal-bull');
    expect(SOURCE_GENRE_TO_GENRE['breve']!.genre).toBe('brief');
    expect(SOURCE_GENRE_TO_GENRE['allocuzione']!.genre).toBe('discourse-address');
    expect(SOURCE_GENRE_TO_GENRE['allocutio']!.genre).toBe('discourse-address');
  });

  it('treats apostolic constitution as a papal-bull characteristic, not a genre', () => {
    const m = SOURCE_GENRE_TO_GENRE['costituzione apostolica']!;
    expect(m.genre).toBe('papal-bull');
    expect(m.characteristics).toEqual(['apostolic-constitution']);
  });

  it('maps a dogmatic constitution to the conciliar genre with its descriptive title', () => {
    const m = SOURCE_GENRE_TO_GENRE['constitutio dogmatica']!;
    expect(m.genre).toBe('constitution');
    expect(m.descriptiveTitle).toBe('dogmatic');
    expect(m.issuerType).toBe('ecumenical-council');
  });

  it('leaves genres the registry does not define unmapped', () => {
    for (const label of ['decreto', 'proclama', 'protesta', 'editto']) {
      expect(SOURCE_GENRE_TO_GENRE[label]!.genre).toBeNull();
    }
  });
});

describe('conciliar reassignments', () => {
  it('moves the two Vatican I constitutions off Pius IX', () => {
    expect(CONCILIAR_REASSIGNMENTS['pius-ix|dei-filius|1870-04-24'])
      .toEqual({ issuerId: 'oec:vatican-i', promulgatedBy: 'rp:pius-ix' });
    expect(CONCILIAR_REASSIGNMENTS['pius-ix|pastor-aeternus|1870-07-18'])
      .toEqual({ issuerId: 'oec:vatican-i', promulgatedBy: 'rp:pius-ix' });
  });
});
