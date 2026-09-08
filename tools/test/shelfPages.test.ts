import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolveShelfPages } from '../src/harvest/shelfPages.js';

describe('resolveShelfPages', () => {
  it('reports an aggregate page that carries its own items', () => {
    const html = readFileSync('tools/fixtures/leo-xiii-encyclicals.html', 'utf8');
    expect(resolveShelfPages(html, 'encyclicals')).toEqual({ kind: 'aggregate' });
  });

  it('prefers the items even when year links are also present', () => {
    // Every shelf from Benedict XV on carries year links; where it also carries items,
    // those items are the whole shelf (spec §2.3) and the year links are navigation.
    const html = readFileSync('tools/fixtures/pius-xii-encyclicals.html', 'utf8');
    expect(resolveShelfPages(html, 'encyclicals')).toEqual({ kind: 'aggregate' });
  });

  it('reports the years of a page that carries only links', () => {
    const html = `<html><body>
      <a href="/content/x/it/apost_letters/1979.index.html">1979</a>
      <a href="/content/x/it/apost_letters/1981.index.html">1981</a>
      <a href="/content/x/it/apost_letters/1979.index.html">1979 again</a>
      <a href="/content/x/it/apost_letters.index.html">all</a>
    </body></html>`;
    expect(resolveShelfPages(html, 'apost_letters')).toEqual({ kind: 'years', years: ['1979', '1981'] });
  });

  it('ignores year links to other shelves in the page\'s sidebar navigation', () => {
    // John XXIII's apost_constitutions page (Task 13): its own year links run 1958-1962,
    // but its sidebar also links other shelves' year pages -- letters, speeches,
    // apost_letters, messages, homilies -- including a 1963 that belongs only to those
    // other shelves. Confirmed against the real fixture: apost_constitutions carries no
    // 1963.index.html of its own, so a naive `/YYYY.index.html$` match (with no shelf
    // scoping) would wrongly report 1963 here.
    const html = `<html><body>
      <a href="/content/john-xxiii/it/apost_constitutions/1958.index.html">1958</a>
      <a href="/content/john-xxiii/it/apost_constitutions/1962.index.html">1962</a>
      <a href="/content/john-xxiii/it/apost_letters/1963.index.html">1963</a>
      <a href="/content/john-xxiii/it/letters/1963.index.html">1963</a>
      <a href="/content/john-xxiii/it/speeches/1963.index.html">1963</a>
    </body></html>`;
    expect(resolveShelfPages(html, 'apost_constitutions'))
      .toEqual({ kind: 'years', years: ['1958', '1962'] });
  });

  it('throws on a page with neither items nor year links', () => {
    expect(() => resolveShelfPages('<html><body>gone</body></html>', 'apost_letters'))
      .toThrow(/neither items nor year links/);
  });
});
