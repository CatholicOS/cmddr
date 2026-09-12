import { describe, it, expect } from 'vitest';
import { existsSync } from 'node:fs';
import {
  VATICAN_SLUG_TO_ISSUER, POPES, COUNCILS, shelvesFor,
  SOURCE_GENRE_TO_GENRE, CONCILIAR_REASSIGNMENTS,
  KNOWN_PONTIFF_IDS, KNOWN_COUNCIL_IDS,
  DATE_CORRECTIONS, DUPLICATE_MERGES, ADJUDICATED_DISTINCT, CIRCUMSCRIPTION_ERECTIONS,
  SERIES, seriesForShelf, isMessagesShelf, messagesSubShelf, SERIES_OCCASION_YEARS, SERIES_ORDINALS,
} from '../src/mappings/index.js';
import { fixtureName } from '../src/harvest/fixtures.js';

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

  it('maps every mapped slug onto a real pontiff or council id', () => {
    // VATICAN_SLUG_TO_ISSUER is derived from both POPES and COUNCILS (see the POPES
    // table describe block below), so its values now span both id vocabularies.
    for (const id of Object.values(VATICAN_SLUG_TO_ISSUER)) {
      expect(KNOWN_PONTIFF_IDS.has(id) || KNOWN_COUNCIL_IDS.has(id)).toBe(true);
    }
  });

});

describe('the POPES table', () => {
  it('describes each pope page, its era and its own shelf list', () => {
    expect(POPES.map((p) => p.pageSlug))
      .toEqual([
        'benedictus-xiv', 'pius-ix', 'leo-xiii', 'pius-x', 'pius-xi', 'pius-xii', 'benedict-xv',
        'john-xxiii', 'paul-vi', 'john-paul-i', 'john-paul-ii', 'benedict-xvi', 'francesco',
        'leo-xiv',
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

  it("keeps Pius XII's eight formal shelves, without speeches (year-partitioned, spec §2.7), plus its one Messaggi sub-shelf", () => {
    expect(shelvesFor('pius-xii')).toEqual([
      'apost_constitutions', 'apost_exhortations', 'apost_letters', 'briefs', 'bulls',
      'encyclicals', 'letters', 'motu_proprio', 'messages/urbi',
    ]);
  });

  it('lists the Messaggi sub-shelves of messages spec §2.2 for every pope from Pius XII on, never pont-messages', () => {
    const messagesOf = (slug: string) => shelvesFor(slug).filter(isMessagesShelf).map(messagesSubShelf);
    expect(messagesOf('pius-xii')).toEqual(['urbi']);
    expect(messagesOf('john-xxiii')).toEqual(['urbi_et_orbi']);
    expect(messagesOf('paul-vi')).toEqual([
      'peace', 'communications', 'lent', 'migration', 'missions', 'sick', 'vocations', 'urbi_et_orbi',
    ]);
    // John Paul I's three messages sit on the landing page itself; left to the pont-messages PR.
    expect(messagesOf('john-paul-i')).toEqual([]);
    expect(messagesOf('john-paul-ii')).toEqual([
      'peace', 'communications', 'lent', 'migration', 'missions', 'sick', 'vocations', 'youth',
      'food', 'consecrated_life', 'tourism', 'literacy', 'urbi',
    ]);
    expect(messagesOf('benedict-xvi')).toEqual([
      'peace', 'communications', 'lent', 'migration', 'missions', 'sick', 'vocations', 'youth',
      'food', 'urbi',
    ]);
    expect(messagesOf('francesco')).toEqual([
      'peace', 'communications', 'lent', 'migration', 'missions', 'sick', 'vocations', 'youth',
      'food', 'consecrated_life', 'poveri', 'nonni', 'bambini', 'cura-creato', 'urbi',
    ]);
    expect(messagesOf('leo-xiv')).toEqual([
      'peace', 'communications', 'lent', 'migration', 'mission', 'sick', 'vocations', 'youth',
      'poor', 'grandparents', 'creation', 'urbi',
    ]);
    for (const p of POPES) {
      for (const s of p.shelves) expect(s, p.pageSlug).not.toMatch(/pont[-_]messages/);
    }
  });

  it('names a checked-in fixture for every shelf of every shelf-era pope', () => {
    for (const p of POPES) {
      if (p.era !== 'shelf') continue;
      for (const s of p.shelves) {
        expect(existsSync(`tools/fixtures/${fixtureName(p.pageSlug, s)}.html`), `${p.pageSlug}/${s}`).toBe(true);
      }
    }
    expect(fixtureName('francesco', 'messages/peace')).toBe('francesco-messages-peace');
    expect(fixtureName('john-paul-ii', 'apost_letters', '1999')).toBe('john-paul-ii-apost_letters-1999');
  });

  it('derives the slug->issuer map from POPES and COUNCILS, so none can disagree', () => {
    const expectedSlugs = [...POPES.map((p) => p.pageSlug), ...COUNCILS.map((c) => c.pageSlug)];
    expect(Object.keys(VATICAN_SLUG_TO_ISSUER).sort()).toEqual(expectedSlugs.sort());
    for (const p of POPES) expect(VATICAN_SLUG_TO_ISSUER[p.pageSlug]).toBe(p.issuerId);
    for (const c of COUNCILS) expect(VATICAN_SLUG_TO_ISSUER[c.pageSlug]).toBe(c.issuerId);
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

  it('treats motu proprio as an apostolic-letter characteristic, not a genre (#10)', () => {
    for (const label of ['motu proprio', 'motu_proprio']) {
      const m = SOURCE_GENRE_TO_GENRE[label]!;
      expect(m.genre, label).toBe('apostolic-letter');
      expect(m.characteristics, label).toEqual(['motu-proprio']);
    }
    expect(Object.values(SOURCE_GENRE_TO_GENRE).some((m) => m.genre === 'motu-proprio')).toBe(false);
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

describe('shelf -> series (messages spec §5.2)', () => {
  it('resolves every messages/* shelf of POPES to exactly one series, or to the Urbi et Orbi pair', () => {
    for (const p of POPES) {
      for (const s of p.shelves.filter(isMessagesShelf)) {
        const r = seriesForShelf(s);
        expect(r, s).not.toBeNull();
        if (r!.kind === 'urbi') {
          expect(r!.christmas.id).toBe('urbi-et-orbi-christmas');
          expect(r!.easter.id).toBe('urbi-et-orbi-easter');
        } else {
          expect(r!.row.shelves, s).toContain(messagesSubShelf(s));
        }
      }
    }
  });

  it("maps Leo XIV's renamed sub-shelves onto the series their predecessors' slugs map to", () => {
    const id = (s: string) => { const r = seriesForShelf(s)!; return r.kind === 'series' ? r.row.id : 'urbi'; };
    expect(id('messages/mission')).toBe(id('messages/missions'));
    expect(id('messages/poor')).toBe(id('messages/poveri'));
    expect(id('messages/grandparents')).toBe(id('messages/nonni'));
    expect(id('messages/creation')).toBe(id('messages/cura-creato'));
    expect(id('messages/urbi')).toBe('urbi');
    expect(id('messages/urbi_et_orbi')).toBe('urbi');
  });

  it('returns null for a formal shelf and throws for an unclaimed Messaggi sub-shelf', () => {
    expect(seriesForShelf('encyclicals')).toBeNull();
    expect(seriesForShelf(null)).toBeNull();
    expect(() => seriesForShelf('messages/pont-messages')).toThrow(/claimed by no row/);
  });

  it('loads the series vocabulary from data/series.json', () => {
    expect(SERIES.map((s) => s.id)).toContain('world-day-of-peace');
    expect(SERIES.find((s) => s.id === 'world-day-of-peace')!.firstYear).toBe(1968);
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

/**
 * The cardinal rule of every curated table in this project: an entry is evidence, cited in
 * its own note, or it does not exist (spec's standing rule; see incipit-rules.ts's own
 * deletion notes for the discipline this enforces). data/keywords.json already has this
 * check (keywords-data.test.ts); this is its counterpart for every hand-curated TypeScript
 * table that carries a `note` field, so a future entry cannot be added without one slipping
 * past review (review finding, 2026-09-07).
 */
describe('every curated table entry carries a non-empty note', () => {
  it('DATE_CORRECTIONS', () => {
    for (const [key, entry] of Object.entries(DATE_CORRECTIONS)) {
      expect(entry.note, key).toBeTruthy();
    }
  });

  it('DUPLICATE_MERGES', () => {
    for (const [key, entry] of Object.entries(DUPLICATE_MERGES)) {
      expect(entry.note, key).toBeTruthy();
    }
  });

  it('ADJUDICATED_DISTINCT', () => {
    for (const [key, entry] of Object.entries(ADJUDICATED_DISTINCT)) {
      expect(entry.note, key).toBeTruthy();
    }
  });

  it('CIRCUMSCRIPTION_ERECTIONS', () => {
    for (const [key, entry] of Object.entries(CIRCUMSCRIPTION_ERECTIONS)) {
      expect(entry.note, key).toBeTruthy();
    }
  });

  it('SERIES_OCCASION_YEARS and SERIES_ORDINALS quote the heading in their evidence', () => {
    for (const [key, entry] of Object.entries(SERIES_OCCASION_YEARS)) {
      expect(entry.evidence, key).toMatch(/[Hh]eading/);
      expect(Number.isInteger(entry.year), key).toBe(true);
      expect(key.split('|'), key).toHaveLength(4);
      expect(key.split('|')[1], key).toMatch(/^messages\//);
    }
    for (const [key, entry] of Object.entries(SERIES_ORDINALS)) {
      expect(entry.evidence, key).toMatch(/[Hh]eading/);
      expect(entry.printed, key).toBeTruthy();
      expect(entry.ordinal, key).toBeGreaterThanOrEqual(1);
      expect(key.split('|')[1], key).toMatch(/^messages\//);
    }
  });
});
