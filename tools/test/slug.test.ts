import { describe, it, expect } from 'vitest';
import { slugify } from '../src/slug.js';

describe('slugify', () => {
  it('lowercases and hyphenates plain Latin incipits', () => {
    expect(slugify('Rerum Novarum')).toBe('rerum-novarum');
    expect(slugify('Tametsi Futura Prospicientibus')).toBe('tametsi-futura-prospicientibus');
    expect(slugify('Adiutricem populi')).toBe('adiutricem-populi');
  });

  it('handles vernacular incipits', () => {
    expect(slugify('Depuis le Jour')).toBe('depuis-le-jour');
    expect(slugify('Au Milieu Des Sollicitudes')).toBe('au-milieu-des-sollicitudes');
    expect(slugify('Spesse Volte')).toBe('spesse-volte');
  });

  it('strips Italian grave accents', () => {
    expect(slugify('La tarda età')).toBe('la-tarda-eta');
    expect(slugify('È giunto')).toBe('e-giunto');
    expect(slugify('Più volte')).toBe('piu-volte');
    expect(slugify('Vi è ben noto')).toBe('vi-e-ben-noto');
  });

  it('turns apostrophes into hyphens', () => {
    expect(slugify("Dall'alto dell'Apostolico Seggio")).toBe('dall-alto-dell-apostolico-seggio');
    expect(slugify('Dall’alto')).toBe('dall-alto');
  });

  it('folds non-decomposable letters', () => {
    expect(slugify('Præclara Gratulationis')).toBe('praeclara-gratulationis');
  });

  it('collapses punctuation runs and trims', () => {
    expect(slugify('  Non mediocri,  Roma.  ')).toBe('non-mediocri-roma');
  });
});
