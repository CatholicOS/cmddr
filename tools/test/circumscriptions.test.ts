import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { slugify } from '../src/slug.js';
import {
  CIRCUMSCRIPTION_ERECTIONS, CIRCUMSCRIPTION_ELEVATIONS, CIRCUMSCRIPTION_UNIONS,
  CANDIDATE_ADJUDICATIONS, ERECTION_IDIOMS, ELEVATION_IDIOMS, UNION_IDIOMS,
  ARGUMENTUM_AUDIT_EXEMPTIONS, keywordsFor, isUnconfirmedCandidate,
} from '../src/mappings/index.js';
import type { DocumentRecord, HarvestItem } from '../src/types.js';

const keywordIds = new Set((JSON.parse(readFileSync('data/keywords.json', 'utf8')) as
  Array<{ id: string }>).map((k) => k.id));

const item = (over: Partial<HarvestItem>): HarvestItem => ({
  title: 'Treiensis', incipit: 'Treiensis', date: '1920-02-20',
  sourceGenreLabel: 'apost_constitutions', url: null, languages: ['LA'],
  shelf: 'apost_constitutions', pageSlug: 'benedict-xv', ...over,
});

const record = (over: Partial<DocumentRecord>): DocumentRecord => ({
  id: 'mag:benedict-xv/treiensis-1920', title: 'Treiensis', incipit: 'Treiensis',
  idStatus: 'minted', genre: 'papal-bull', issuerId: 'rp:benedict-xv', issuerType: 'pope',
  date: '1920-02-20',
  source: { url: null, shelf: 'apost_constitutions', languages: ['LA'], retrieved: '2026-09-07' },
  ...over,
});

describe('the circumscription tables', () => {
  const tables = [
    ['erections', CIRCUMSCRIPTION_ERECTIONS, ERECTION_IDIOMS],
    ['elevations', CIRCUMSCRIPTION_ELEVATIONS, ELEVATION_IDIOMS],
    ['unions', CIRCUMSCRIPTION_UNIONS, UNION_IDIOMS],
  ] as const;

  it('quotes an argumentum whose Latin fits the table it sits in', () => {
    // This audits the sorting rather than trusting it: an erection row quoting EVEHITUR
    // is a misfiled document, and one misfiled row usually means a misfiled instalment.
    for (const [name, table, idioms] of tables) {
      for (const [key, row] of Object.entries(table)) {
        expect(row.argumentum.trim(), `${name} ${key}`).not.toBe('');
        // A page that prints no act at all (Ruling 14) is exempt from the regex, never from
        // being quoted: the row's note carries the body's operative clause instead.
        if (ARGUMENTUM_AUDIT_EXEMPTIONS.has(key)) continue;
        expect(row.argumentum, `${name} ${key}`).toMatch(idioms);
      }
    }
  });

  it('exempts from the idiom audit only keys that sit in one of the four tables', () => {
    // A stale exemption -- a key retyped, or a row moved or removed -- must fail loudly
    // rather than silently exempt nothing.
    const all = new Set([...tables.map(([, t]) => t), CANDIDATE_ADJUDICATIONS]
      .flatMap((t) => Object.keys(t)));
    for (const key of ARGUMENTUM_AUDIT_EXEMPTIONS) {
      expect(all.has(key), `exempted key matches no row: ${key}`).toBe(true);
    }
  });

  it('never lists one document in two tables', () => {
    const seen = new Map<string, string>();
    for (const [name, table] of [...tables.map(([n, t]) => [n, t] as const),
      ['adjudications', CANDIDATE_ADJUDICATIONS] as const]) {
      for (const key of Object.keys(table)) {
        expect(seen.get(key), `${key} is in both ${seen.get(key)} and ${name}`).toBeUndefined();
        seen.set(key, name);
      }
    }
  });

  it('keys every row as pageSlug|slug|ISO-date', () => {
    for (const [name, table] of [...tables.map(([n, t]) => [n, t] as const),
      ['adjudications', CANDIDATE_ADJUDICATIONS] as const]) {
      for (const key of Object.keys(table)) {
        const parts = key.split('|');
        expect(parts, `${name} ${key}`).toHaveLength(3);
        expect(parts[2], `${name} ${key}`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it('matches every row to a harvested record, in both directions', () => {
    // The closed-set rule the Vatican II and recovered-incipit tables already use: a row that
    // matches nothing is a curation error -- a title that changed on vatican.va, or a key typed
    // by hand -- and must fail loudly rather than sit unnoticed while its document stays in the
    // queue. Reconstructs each record's key the way isUnconfirmedCandidate does.
    const all = readdirSync('data/documents').filter((f) => f.endsWith('.json'))
      .flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[]);
    const bySlugDate = new Set(all.map((d) => `${slugify(d.incipit ?? d.title)}|${d.date}`));
    for (const [name, table] of [...tables.map(([n, t]) => [n, t] as const),
      ['adjudications', CANDIDATE_ADJUDICATIONS] as const]) {
      for (const key of Object.keys(table)) {
        const [, slug, date] = key.split('|');
        expect(bySlugDate.has(`${slug}|${date}`), `${name} row matches no record: ${key}`)
          .toBe(true);
      }
    }
  });

  it('names the act and quotes the document for every adjudication', () => {
    for (const [key, row] of Object.entries(CANDIDATE_ADJUDICATIONS)) {
      expect(row.act.trim(), key).not.toBe('');
      expect(row.argumentum.trim(), key).not.toBe('');
      expect(row.note.length, key).toBeGreaterThan(30);
    }
  });
});

describe('circumscription-union', () => {
  it('is a registered keyword', () => {
    expect(keywordIds.has('circumscription-union')).toBe(true);
  });

  it('is awarded to a document in the unions table', () => {
    expect(keywordsFor(item({}))).toContain('circumscription-union');
  });

  it('is not awarded to a document that is in no table', () => {
    expect(keywordsFor(item({ title: 'Nullibiensis', incipit: 'Nullibiensis' }))).toEqual([]);
  });
});

describe('isUnconfirmedCandidate', () => {
  it('retires a candidate that carries any circumscription keyword', () => {
    expect(isUnconfirmedCandidate(record({ keywords: ['circumscription-union'] }))).toBe(false);
    expect(isUnconfirmedCandidate(record({ keywords: ['circumscription-elevation'] }))).toBe(false);
  });

  it('retires a candidate recorded in CANDIDATE_ADJUDICATIONS', () => {
    // Without this, a document read and judged not to be a circumscription act stays in the
    // count forever -- the defect the whole spec exists to fix (spec §1).
    expect(isUnconfirmedCandidate(record({
      id: 'mag:benedict-xv/bracarensis-1919', title: 'Bracarensis', incipit: 'Bracarensis',
      date: '1919-05-14',
    }))).toBe(false);
  });

  it('still counts a toponym-shaped candidate in no table at all', () => {
    expect(isUnconfirmedCandidate(record({
      id: 'mag:benedict-xv/nullibiensis-1920', title: 'Nullibiensis', incipit: 'Nullibiensis',
      date: '1920-01-01',
    }))).toBe(true);
  });
});
