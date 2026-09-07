import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { checkDocuments } from '../src/validate/invariants.js';
import type { DocumentRecord } from '../src/types.js';

const load = (n: string) =>
  JSON.parse(readFileSync(`data/documents/${n}.json`, 'utf8')) as DocumentRecord[];
const genreIds = new Set(
  (JSON.parse(readFileSync('data/genres.json', 'utf8')) as Array<{ id: string }>).map((g) => g.id));

const all = [...load('benedict-xiv'), ...load('pius-ix'), ...load('leo-xiii'), ...load('vatican-i')];

describe('the harvested pilot corpus', () => {
  it('holds the whole pilot corpus', () => {
    // 395 raw items in; six Leo XIII documents are filed on both the encyclicals
    // and letters shelves and merge into one record each, leaving 389.
    expect(all).toHaveLength(389);
  });

  it('deduplicates the six twice-shelved Leo XIII documents', () => {
    const twice = all.filter((d) => (d.source?.alsoShelvedAs?.length ?? 0) > 0);
    expect(twice).toHaveLength(6);
    expect(twice.map((d) => d.incipit.toLowerCase()).sort()).toEqual([
      'in amplissimo', 'omnibus compertum', 'permoti nos',
      'quam aerumnosa', 'quod anniversarius', 'urbanitatis veteris',
    ]);
    for (const d of twice) {
      expect(d.source!.shelf).toBe('encyclicals');
      expect(d.source!.alsoShelvedAs).toEqual(['letters']);
    }
  });

  it('satisfies every invariant', () => {
    expect(checkDocuments(all, genreIds)).toEqual([]);
  });

  it('files the two Vatican I constitutions under the council', () => {
    const v1 = load('vatican-i');
    expect(v1.map((d) => d.id).sort()).toEqual([
      'mag:vatican-i/dei-filius-1870', 'mag:vatican-i/pastor-aeternus-1870',
    ]);
    expect(v1.every((d) => d.promulgatedBy === 'rp:pius-ix')).toBe(true);
    expect(load('pius-ix').some((d) => d.incipit === 'Pastor Aeternus')).toBe(false);
  });

  it('distinguishes the four Ubi Primum documents', () => {
    const ids = all.filter((d) => d.incipit.toLowerCase().startsWith('ubi primum')).map((d) => d.id);
    expect(ids).toEqual(expect.arrayContaining([
      'mag:benedict-xiv/ubi-primum-1740',
      'mag:pius-ix/ubi-primum-1847',
      'mag:pius-ix/ubi-primum-1849',
    ]));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('disambiguates the two same-year Magni Nobis documents by full date', () => {
    const ids = all.filter((d) => d.incipit === 'Magni Nobis').map((d) => d.id).sort();
    expect(ids).toEqual([
      'mag:leo-xiii/magni-nobis-1889-03-07', 'mag:leo-xiii/magni-nobis-1889-05-07',
    ]);
  });

  it('leaves the TBD shelf empty', () => {
    expect(all.filter((d) => d.idStatus === 'provisional')).toEqual([]);
  });

  it('preserves unmapped genres rather than inventing rows', () => {
    const unmapped = all.filter((d) => d.genre === null);
    expect(unmapped.length).toBeGreaterThan(0);
    expect(unmapped.every((d) => Boolean(d.sourceGenreLabel))).toBe(true);
  });
});
