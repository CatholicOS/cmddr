import { describe, it, expect } from 'vitest';
import {
  VATICAN_SLUG_TO_ISSUER, POPES, shelvesFor,
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
    expect(VATICAN_SLUG_TO_ISSUER['pius-x']).toBe('rp:pius-x');
  });

  it('maps every mapped slug onto a real pontiff id', () => {
    for (const id of Object.values(VATICAN_SLUG_TO_ISSUER)) {
      expect(KNOWN_PONTIFF_IDS.has(id)).toBe(true);
    }
  });

});

describe('the POPES table', () => {
  it('describes each pope page, its era and its own shelf list', () => {
    expect(POPES.map((p) => p.pageSlug))
      .toEqual([
        'benedictus-xiv', 'pius-ix', 'leo-xiii', 'pius-x', 'pius-xi', 'pius-xii', 'benedict-xv',
      ]);
    expect(POPES.find((p) => p.pageSlug === 'leo-xiii')!.era).toBe('shelf');
    expect(POPES.find((p) => p.pageSlug === 'pius-ix')!.era).toBe('flat');
    expect(POPES.find((p) => p.pageSlug === 'pius-x')!.era).toBe('shelf');
  });

  it('gives the flat-era popes no shelves', () => {
    for (const slug of ['benedictus-xiv', 'pius-ix']) {
      expect(shelvesFor(slug)).toEqual([]);
    }
  });

  it("keeps Leo XIII's eight shelves exactly as harvested", () => {
    expect(shelvesFor('leo-xiii')).toEqual([
      'apost_constitutions', 'apost_letters', 'briefs', 'bulls',
      'encyclicals', 'letters', 'motu_proprio', 'speeches',
    ]);
  });

  it("keeps Pius X's six shelves, without bulls, briefs or speeches", () => {
    expect(shelvesFor('pius-x')).toEqual([
      'apost_constitutions', 'apost_exhortations', 'apost_letters',
      'encyclicals', 'letters', 'motu_proprio',
    ]);
  });

  it("keeps Pius XI's seven shelves, without apost_exhortations or speeches", () => {
    expect(shelvesFor('pius-xi')).toEqual([
      'apost_constitutions', 'apost_letters', 'briefs', 'bulls',
      'encyclicals', 'letters', 'motu_proprio',
    ]);
  });

  it("keeps Pius XII's eight shelves, without speeches (year-partitioned, spec §2.7)", () => {
    expect(shelvesFor('pius-xii')).toEqual([
      'apost_constitutions', 'apost_exhortations', 'apost_letters', 'briefs', 'bulls',
      'encyclicals', 'letters', 'motu_proprio',
    ]);
  });

  it('derives the slug->issuer map from the table, so the two cannot disagree', () => {
    expect(Object.keys(VATICAN_SLUG_TO_ISSUER).sort()).toEqual(POPES.map((p) => p.pageSlug).sort());
    for (const p of POPES) expect(VATICAN_SLUG_TO_ISSUER[p.pageSlug]).toBe(p.issuerId);
  });

  it('returns an empty shelf list for an unknown slug rather than throwing', () => {
    expect(shelvesFor('not-a-pope')).toEqual([]);
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
