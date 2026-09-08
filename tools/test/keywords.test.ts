import { describe, it, expect, afterEach } from 'vitest';
import { keywordsFor, isErectionCandidate, CIRCUMSCRIPTION_ERECTIONS } from '../src/mappings/keywords.js';
import { slugify } from '../src/slug.js';
import type { HarvestItem } from '../src/types.js';

const item = (over: Partial<HarvestItem>): HarvestItem => ({
  title: '', incipit: null, date: '2025-03-22', sourceGenreLabel: 'apost_constitutions',
  url: null, languages: ['IT'], shelf: 'apost_constitutions', pageSlug: 'francesco', ...over,
});

describe('keywordsFor', () => {
  it('tags an erection the heading states outright', () => {
    for (const title of [
      '"Spei accensa lucerna". Il Santo Padre ha eretto la nuova Diocesi di Caazapá (Paraguay)',
      '"Incomparabilis Magister". Il Santo Padre ha eretto la Provincia Ecclesiastica di Calicut',
      '"Quod Manifestatum". Il Santo Padre ha istituito in Cina la Diocesi di Lüliang',
      'Suavis Nutrix animarum: Il Santo Padre ha eretto la Diocesi di Bariadi',
    ]) {
      expect(keywordsFor(item({ title, incipit: 'X' })), title)
        .toEqual(['circumscription-erection']);
    }
  });

  it('tags nothing when the heading only names a document', () => {
    for (const title of ['Praedicate Evangelium', 'Avkaënsis', 'Ex Corde Ecclesiae',
                         'Vicariae potestatis in urbe']) {
      expect(keywordsFor(item({ title, incipit: title })), title).toEqual([]);
    }
  });

  it('tags a curated older erection from the table, not from its shape', () => {
    // Seeded by Task 20's curation pass; empty until then, so this asserts the mechanism
    // via a synthetic key rather than a real document.
    expect(keywordsFor(item({
      pageSlug: 'john-paul-ii', title: 'Usbekistaniae', incipit: 'Usbekistaniae',
      date: '2005-04-01',
    }))).toEqual([]);
  });
});

describe('isErectionCandidate', () => {
  it('flags a bare Latin toponym on the apostolic constitutions shelf', () => {
    for (const title of ['Avkaënsis', 'Boacensis', 'Usbekistaniae', 'Gambomensis',
                         'Katsinensis-Alensis']) {
      expect(isErectionCandidate(item({ pageSlug: 'john-paul-ii', title, incipit: title })), title)
        .toBe(true);
    }
  });

  it('does not flag a document with a real name', () => {
    for (const title of ['Sapientia Christiana', 'Ex Corde Ecclesiae', 'Constans nobis',
                         'Romano Pontifici Eligendo', 'Indulgentiarum Doctrina']) {
      expect(isErectionCandidate(item({ pageSlug: 'paul-vi', title, incipit: title })), title)
        .toBe(false);
    }
  });

  it('does not flag anything off the apostolic constitutions shelf', () => {
    expect(isErectionCandidate(item({ shelf: 'encyclicals', title: 'Avkaënsis' }))).toBe(false);
  });

  it('does not flag a pope whose headings state the act outright', () => {
    // Francis and Leo XIV are tagged textually; flagging them too would double-count.
    expect(isErectionCandidate(item({ pageSlug: 'francesco', title: 'Avkaënsis' }))).toBe(false);
  });

  it('flags a bare toponym even when a parenthetical alternate name or hyphenated twin see follows', () => {
    // The real Pius XII shape: a genuine erection heading rarely prints just one word.
    // 'Huanucensis-Huarazensis (Huariensis)', 'Palmensis - Lagensis (Palmensis et
    // Xapecoënsis)', 'Bathurstensis in Gambia', 'Aleppensis Chaldaeorum' -- the toponym
    // ending on the first word is the signal; a full-string match would miss all of these.
    for (const title of [
      'Huanucensis-Huarazensis (Huariensis)', 'Niangaraënsis (Dorumaënsis)',
      'Bathurstensis in Gambia', 'Aleppensis Chaldaeorum',
      'Palmensis - Lagensis (Palmensis et Xapecoënsis)',
    ]) {
      expect(isErectionCandidate(item({ pageSlug: 'pius-xii', title, incipit: title })), title)
        .toBe(true);
    }
  });

  it('does not flag a doctrinal constitution merely because a later word resembles a toponym', () => {
    for (const title of [
      'Vacantis Apostolicae Sedis', 'Provida Mater Ecclesia', 'Sacramentum Ordinis',
      'Episcopali Consecrationis',
    ]) {
      expect(isErectionCandidate(item({ pageSlug: 'pius-xii', title, incipit: title })), title)
        .toBe(false);
    }
  });

  // Carried finding from Task 11's review: Benedict XV is the reason
  // APOST_CONSTITUTIONS_SHELVES lists the hyphenated spelling ('apost-constitutions') beside
  // the underscored one, but nothing exercised it directly until now. Real headings from the
  // benedict-xv apost-constitutions fixture (Task 12): 'Catamarcensis-Saltensis' and
  // 'Treiensis' both flag true there.
  it('flags a toponym-shaped heading on the hyphenated apost-constitutions shelf', () => {
    expect(isErectionCandidate(item({
      pageSlug: 'benedict-xv', shelf: 'apost-constitutions',
      title: 'Catamarcensis-Saltensis', incipit: 'Catamarcensis-Saltensis',
    }))).toBe(true);
  });

  it('does not flag the same heading when it sits on a non-constitutions shelf', () => {
    expect(isErectionCandidate(item({
      pageSlug: 'benedict-xv', shelf: 'encyclicals',
      title: 'Catamarcensis-Saltensis', incipit: 'Catamarcensis-Saltensis',
    }))).toBe(false);
  });
});

describe('the CIRCUMSCRIPTION_ERECTIONS lookup path', () => {
  // Carried finding from Task 11's review: every existing test above runs against the
  // always-empty table, so a bug in how the lookup key is constructed (pageSlug, incipit
  // slug, date -- see keywordsFor's and isErectionCandidate's shared `curatedKey`) would stay
  // hidden until the curation task that populates it for real, where roughly 1,100
  // confirmations are keyed exactly this way. These tests inject a locally-populated entry
  // and exercise both directions, then remove it so the table stays empty for every other
  // test in this file and for the harvest itself.
  const pageSlug = 'pius-xii';
  const title = 'Bikoroënsis';
  const date = '1957-06-24';
  const key = `${pageSlug}|${slugify(title)}|${date}`;

  afterEach(() => {
    delete CIRCUMSCRIPTION_ERECTIONS[key];
  });

  it('keywordsFor tags a document whose key is present in the curated table', () => {
    expect(keywordsFor(item({ pageSlug, title, incipit: title, date }))).toEqual([]);
    CIRCUMSCRIPTION_ERECTIONS[key] = { note: 'test evidence: confirmed circumscription erection' };
    expect(keywordsFor(item({ pageSlug, title, incipit: title, date })))
      .toEqual(['circumscription-erection']);
  });

  it('isErectionCandidate does not re-flag a document already confirmed in the curated table', () => {
    const candidate = item({
      pageSlug, title, incipit: title, date, shelf: 'apost_constitutions',
    });
    // Unconfirmed, the toponym shape alone would flag it (as the earlier tests establish).
    expect(isErectionCandidate(candidate)).toBe(true);
    CIRCUMSCRIPTION_ERECTIONS[key] = { note: 'test evidence: confirmed circumscription erection' };
    expect(isErectionCandidate(candidate)).toBe(false);
  });
});
