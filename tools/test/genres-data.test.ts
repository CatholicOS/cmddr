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

  it('transcribes all seventeen rows of README Table 1', () => {
    // #10: motu proprio is a characteristic of apostolic-letter, not a row; #15 adds
    // urbi-et-orbi; #4 adds message, placed after audience-catechesis and before urbi-et-orbi.
    expect(genres).toHaveLength(17);
    expect(genres.map((g) => g.id)).toEqual([
      'constitution', 'decree', 'declaration', 'papal-bull', 'encyclical',
      'apostolic-exhortation', 'apostolic-letter', 'brief', 'letter',
      'discourse-address', 'homily', 'prayer', 'audience-catechesis', 'message', 'urbi-et-orbi',
      'episcopal-pastoral-letter', 'episcopal-homily',
    ]);
  });

  it('caps the message at authentic-ordinary: one row for every occasion, not one per sub-shelf (#4)', () => {
    const row = genres.find((g) => g.id === 'message')!;
    expect(row).toBeDefined();
    expect(row.issuerTypes).toEqual(['pope']);
    expect(row.defaultScope).toBe('universal');
    expect(row.defaultRegister).toBe('authentic-ordinary');
    expect(row.ceiling).toBe('authentic-ordinary');
    expect(row.allowedCharacteristics).toBeUndefined();
    expect(row.description).toMatch(/World Day/);
  });

  it('allows characteristics only where README lists them', () => {
    const by = Object.fromEntries(genres.map((g) => [g.id as string, g]));
    expect(by['papal-bull']!.allowedCharacteristics)
      .toEqual(['apostolic-constitution', 'dogmatic-definition']);
    expect(by['apostolic-letter']!.allowedCharacteristics).toEqual(['motu-proprio']);
    for (const g of genres) {
      if (g.id === 'papal-bull' || g.id === 'apostolic-letter') continue;
      expect(g.allowedCharacteristics, g.id as string).toBeUndefined();
    }
  });

  it('rejects an allowedCharacteristics entry outside the characteristics vocabulary', () => {
    const ajv = new Ajv2020({ strict: false });
    const validate = ajv.compile(genreSchema);
    const row = genres.find((g) => g.id === 'apostolic-letter')!;
    expect(validate({ ...row, allowedCharacteristics: ['motu-proprio', 'encyclical'] })).toBe(false);
    expect(validate({ ...row, allowedCharacteristics: ['motu-proprio', 'motu-proprio'] })).toBe(false);
  });

  it('caps Urbi et Orbi at authentic-ordinary: the blessing is the act, the address is assessed per statement (#15)', () => {
    const row = genres.find((g) => g.id === 'urbi-et-orbi')!;
    expect(row).toBeDefined();
    expect(row.issuerTypes).toEqual(['pope']);
    expect(row.defaultScope).toBe('universal');
    expect(row.defaultRegister).toBe('authentic-ordinary');
    expect(row.ceiling).toBe('authentic-ordinary');
    expect(row.description).toMatch(/blessing/i);
    expect(row.description).toMatch(/indulgence/i);
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

  it('presumes local scope for the papal letter and universal scope for every other papal genre', () => {
    // #11: on vatican.va's *Lettere* shelves the universally-addressed letter is the visible
    // minority, so `letter` alone among the papal genres leans local. `apostolic-letter` keeps
    // the universal presumption even though the genre spans local governance too.
    for (const g of genres) {
      if (!(g.issuerTypes as string[]).includes('pope')) continue;
      expect(g.defaultScope, g.id as string).toBe(g.id === 'letter' ? 'local' : 'universal');
    }
  });
});
