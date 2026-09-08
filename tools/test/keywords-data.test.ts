import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const keywords = JSON.parse(readFileSync('data/keywords.json', 'utf8')) as
  Array<{ id: string; gloss: string; note: string }>;

describe('data/keywords.json', () => {
  it('is a non-empty array of slug-shaped ids', () => {
    expect(Array.isArray(keywords)).toBe(true);
    expect(keywords.length).toBeGreaterThan(0);
    for (const k of keywords) expect(k.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('gives every term a gloss and an evidence note', () => {
    for (const k of keywords) {
      expect(k.gloss, k.id).toBeTruthy();
      expect(k.note, k.id).toBeTruthy();
    }
  });

  it('defines circumscription-erection', () => {
    const ce = keywords.find((k) => k.id === 'circumscription-erection');
    expect(ce).toBeDefined();
    expect(ce!.gloss).toMatch(/diocese|circumscription/i);
  });

  it('defines circumscription-elevation, distinct from circumscription-erection', () => {
    const cv = keywords.find((k) => k.id === 'circumscription-elevation');
    expect(cv).toBeDefined();
    expect(cv!.gloss).toMatch(/rank|circumscription/i);
    expect(cv!.note).toMatch(/erection/i);
  });

  it('has unique ids', () => {
    expect(new Set(keywords.map((k) => k.id)).size).toBe(keywords.length);
  });
});
