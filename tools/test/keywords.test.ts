import { describe, it, expect } from 'vitest';
import { keywordsFor, isErectionCandidate } from '../src/mappings/keywords.js';
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
});
