import { describe, it, expect, vi } from 'vitest';
import { keepMoreSpecific, SHELF_SPECIFICITY } from '../src/harvest/merge.js';
import type { HarvestItem } from '../src/types.js';

const item = (over: Partial<HarvestItem>): HarvestItem => ({
  title: 'Rerum Novarum', incipit: 'Rerum Novarum', date: '1891-05-15',
  sourceGenreLabel: 'encyclicals', url: 'https://www.vatican.va/a.html',
  languages: ['IT'], shelf: 'encyclicals', pageSlug: 'leo-xiii', ...over,
});

describe('keepMoreSpecific', () => {
  it('keeps the more specific shelf and remembers the other', () => {
    const enc = item({ shelf: 'encyclicals' });
    const lett = item({ shelf: 'letters' });
    const kept = keepMoreSpecific(lett, enc, () => {});
    expect(kept.shelf).toBe('encyclicals');
    expect(kept.alsoShelvedAs).toEqual(['letters']);
  });

  it('prefers the record whose heading printed an incipit when shelves tie', () => {
    const named = item({ shelf: 'apost_letters', incipit: 'Quem ad modum', title: 'Quem ad modum' });
    const unnamed = item({ shelf: 'apost_letters', incipit: null, title: 'Venerabili Dei Famulae' });
    // Either argument order must reach the same answer -- insertion order is not evidence.
    expect(keepMoreSpecific(named, unnamed, () => {}).incipit).toBe('Quem ad modum');
    expect(keepMoreSpecific(unnamed, named, () => {}).incipit).toBe('Quem ad modum');
  });

  it('never records the surviving record\'s own shelf as another shelf', () => {
    const a = item({ shelf: 'apost_letters', incipit: null, title: 'A' });
    const b = item({ shelf: 'apost_letters', incipit: null, title: 'B' });
    expect(keepMoreSpecific(a, b, () => {}).alsoShelvedAs ?? []).not.toContain('apost_letters');
  });

  it('announces the discarded record, naming both URLs and why one was kept', () => {
    // Every merge destroys a record. The 1961 Rosary meditations were lost for exactly this
    // reason and nothing said so, so a discard must never be silent.
    const onDiscard = vi.fn();
    const enc = item({ shelf: 'encyclicals', url: 'https://www.vatican.va/keep.html' });
    const lett = item({ shelf: 'letters', url: 'https://www.vatican.va/drop.html' });
    keepMoreSpecific(lett, enc, onDiscard);
    expect(onDiscard).toHaveBeenCalledTimes(1);
    const message = String(onDiscard.mock.calls[0]![0]);
    expect(message).toContain('keep.html');
    expect(message).toContain('drop.html');
    expect(message).toMatch(/shelf|incipit/);
  });

  it('ranks every messages/* shelf at the least-specific end, beside letters (messages spec §5.2)', () => {
    // A message also filed on a formal shelf keeps that shelf and records the messages
    // filing only in alsoShelvedAs; the two spellings of the Urbi et Orbi shelf rank alike.
    for (const formal of ['encyclicals', 'apost_letters', 'apost_exhortations', 'letters']) {
      const kept = keepMoreSpecific(item({ shelf: 'messages/peace', incipit: null }), item({ shelf: formal }), () => {});
      expect(kept.shelf, formal).toBe(formal);
      expect(kept.alsoShelvedAs, formal).toEqual(['messages/peace']);
    }
    const speeches = keepMoreSpecific(item({ shelf: 'speeches' }), item({ shelf: 'messages/urbi_et_orbi' }), () => {});
    expect(speeches.shelf).toBe('messages/urbi_et_orbi');
    expect(SHELF_SPECIFICITY.indexOf('messages/*')).toBe(SHELF_SPECIFICITY.indexOf('letters') + 1);
  });

  it('announces through console.warn when a caller passes no handler', () => {
    // The notice defaults on rather than off: a caller that forgets the handler still gets it,
    // which is the whole reason this lives in keepMoreSpecific instead of at each call site.
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    try {
      keepMoreSpecific(item({ shelf: 'letters' }), item({ shelf: 'encyclicals' }));
      expect(warnSpy).toHaveBeenCalledTimes(1);
      expect(String(warnSpy.mock.calls[0]![0])).toContain('Merged and discarded');
    } finally {
      warnSpy.mockRestore();
    }
  });
});
