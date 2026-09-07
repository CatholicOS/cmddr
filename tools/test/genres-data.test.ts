import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import genreSchema from '../../schema/genre.schema.json' with { type: 'json' };

const genres = JSON.parse(readFileSync('data/genres.json', 'utf8')) as Array<Record<string, unknown>>;

describe('data/genres.json', () => {
  it('validates against genre.schema.json', () => {
    const ajv = new Ajv2020({ strict: false });
    const validate = ajv.compile(genreSchema);
    for (const g of genres) {
      const ok = validate(g);
      if (!ok) throw new Error(`${g.id}: ${JSON.stringify(validate.errors)}`);
      expect(ok).toBe(true);
    }
  });

  it('transcribes all sixteen rows of README Table 1', () => {
    expect(genres).toHaveLength(16);
    expect(genres.map((g) => g.id)).toEqual([
      'constitution', 'decree', 'declaration', 'papal-bull', 'encyclical',
      'apostolic-exhortation', 'apostolic-letter', 'motu-proprio', 'brief', 'letter',
      'discourse-address', 'homily', 'prayer', 'audience-catechesis',
      'episcopal-pastoral-letter', 'episcopal-homily',
    ]);
  });

  it('has unique ids', () => {
    expect(new Set(genres.map((g) => g.id)).size).toBe(genres.length);
  });

  it('keeps the conciliar ceiling at extraordinary and the encyclical ceiling below it', () => {
    const by = Object.fromEntries(genres.map((g) => [g.id as string, g]));
    expect(by['constitution']!.ceiling).toBe('extraordinary');
    expect(by['decree']!.ceiling).toBe('extraordinary');
    expect(by['declaration']!.ceiling).toBe('extraordinary');
    expect(by['encyclical']!.ceiling).toBe('ordinary-universal');
    expect(by['apostolic-letter']!.ceiling).toBe('ordinary-universal');
    expect(by['homily']!.ceiling).toBe('authentic-ordinary');
  });

  it('ranks the conciliar genres by presumptive weight', () => {
    const by = Object.fromEntries(genres.map((g) => [g.id as string, g]));
    expect(by['constitution']!.presumptiveWeight).toBeGreaterThan(
      by['decree']!.presumptiveWeight as number);
    expect(by['decree']!.presumptiveWeight).toBeGreaterThan(
      by['declaration']!.presumptiveWeight as number);
  });

  it('gives bishops local scope only', () => {
    for (const g of genres) {
      if ((g.issuerTypes as string[]).includes('bishop')) expect(g.defaultScope).toBe('local');
    }
  });
});
