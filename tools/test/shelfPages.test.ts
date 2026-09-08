import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolveShelfPages } from '../src/harvest/shelfPages.js';

describe('resolveShelfPages', () => {
  it('reports an aggregate page that carries its own items', () => {
    const html = readFileSync('tools/fixtures/leo-xiii-encyclicals.html', 'utf8');
    expect(resolveShelfPages(html)).toEqual({ kind: 'aggregate' });
  });

  it('prefers the items even when year links are also present', () => {
    // Every shelf from Benedict XV on carries year links; where it also carries items,
    // those items are the whole shelf (spec §2.3) and the year links are navigation.
    const html = readFileSync('tools/fixtures/pius-xii-encyclicals.html', 'utf8');
    expect(resolveShelfPages(html)).toEqual({ kind: 'aggregate' });
  });

  it('reports the years of a page that carries only links', () => {
    const html = `<html><body>
      <a href="/content/x/it/apost_letters/1979.index.html">1979</a>
      <a href="/content/x/it/apost_letters/1981.index.html">1981</a>
      <a href="/content/x/it/apost_letters/1979.index.html">1979 again</a>
      <a href="/content/x/it/apost_letters.index.html">all</a>
    </body></html>`;
    expect(resolveShelfPages(html)).toEqual({ kind: 'years', years: ['1979', '1981'] });
  });

  it('throws on a page with neither items nor year links', () => {
    expect(() => resolveShelfPages('<html><body>gone</body></html>'))
      .toThrow(/neither items nor year links/);
  });
});
