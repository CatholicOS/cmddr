import { describe, it, expect } from 'vitest';
import { renderIssuerMd } from '../src/render/issuerMd.js';
import { renderGenreMd } from '../src/render/genreMd.js';
import { renderIndexMd } from '../src/render/indexMd.js';
import type { DocumentRecord } from '../src/types.js';

const docs: DocumentRecord[] = [
  { id: 'mag:leo-xiii/rerum-novarum-1891', title: 'Rerum Novarum', incipit: 'Rerum Novarum',
    idStatus: 'minted', genre: 'encyclical', issuerId: 'rp:leo-xiii', issuerType: 'pope',
    date: '1891-05-15' },
  { id: 'mag:leo-xiii/immortale-dei-1885', title: 'Immortale Dei', incipit: 'Immortale Dei',
    idStatus: 'minted', genre: 'encyclical', issuerId: 'rp:leo-xiii', issuerType: 'pope',
    date: '1885-11-01' },
];

const conciliar: DocumentRecord = {
  id: 'mag:vatican-i/pastor-aeternus-1870', title: 'Pastor Aeternus', incipit: 'Pastor Aeternus',
  idStatus: 'minted', genre: 'constitution', issuerId: 'oec:vatican-i',
  issuerType: 'ecumenical-council', promulgatedBy: 'rp:pius-ix', date: '1870-07-18',
};

const provisional: DocumentRecord = {
  id: 'mag:pius-xii/apostolic-letter-1958-08-11', title: 'Lettera Apostolica che proclama…',
  // incipit is still a required string on DocumentRecord as of this task; a provisional
  // record has none, represented here as '' (falsy, same as the future optional-undefined case).
  incipit: '', idStatus: 'provisional', genre: 'apostolic-letter', issuerId: 'rp:pius-xii',
  issuerType: 'pope', date: '1958-08-11',
};

describe('renderIssuerMd', () => {
  const md = renderIssuerMd('leo-xiii', docs);

  it('omits the issuer column, which is constant in this view', () => {
    expect(md).toContain('| ID | Title | Incipit | Genre | Date | Promulgated by |');
    expect(md).not.toContain('| Issuer |');
  });

  it('emits one row per document, sorted chronologically', () => {
    expect(md.split('\n').filter((l) => l.startsWith('| `mag:'))).toHaveLength(2);
    expect(md.indexOf('immortale-dei')).toBeLessThan(md.indexOf('rerum-novarum'));
  });

  it('names the issuer and marks the file as generated', () => {
    expect(md).toContain('rp:leo-xiii');
    expect(md).toMatch(/generated/i);
  });

  it('shows the promulgator for a conciliar document', () => {
    expect(renderIssuerMd('vatican-i', [conciliar])).toContain('`rp:pius-ix`');
  });
});

describe('renderGenreMd', () => {
  const md = renderGenreMd('encyclical', docs);

  it('omits the genre column, which is constant in this view', () => {
    expect(md).toContain('| ID | Title | Incipit | Issuer | Date | Promulgated by |');
    expect(md).not.toContain('| Genre |');
  });

  it('shows the issuer, which varies in this view', () => {
    expect(md).toContain('`rp:leo-xiii`');
  });

  it('titles the unmapped page for a null genre', () => {
    const un = renderGenreMd(null, [{ ...docs[0]!, genre: null, sourceGenreLabel: 'Editto' }]);
    expect(un).toMatch(/unmapped/i);
    expect(un).toContain('Editto');
  });
});

describe('both views', () => {
  it('marks a provisional id with a dagger and footnotes it', () => {
    for (const md of [renderIssuerMd('pius-xii', [provisional]), renderGenreMd('apostolic-letter', [provisional])]) {
      expect(md).toContain('`mag:pius-xii/apostolic-letter-1958-08-11` †');
      expect(md).toMatch(/† .*provisional/i);
    }
  });

  it('leaves the incipit cell empty for a provisional record', () => {
    const row = renderIssuerMd('pius-xii', [provisional])
      .split('\n').find((l) => l.startsWith('| `mag:'))!;
    expect(row.split('|')[3]!.trim()).toBe('');
  });

  it('escapes a pipe in scraped text so it cannot break the table', () => {
    const piped = { ...docs[0]!, title: 'A | B', incipit: 'A | B' };
    expect(renderIssuerMd('leo-xiii', [piped])).toContain('A \\| B');
  });
});

describe('renderIndexMd', () => {
  const md = renderIndexMd([...docs, conciliar, provisional]);

  it('counts documents per issuer and links the view', () => {
    expect(md).toContain('[`rp:leo-xiii`](documents/by-issuer/leo-xiii.md)');
    expect(md).toContain('[`oec:vatican-i`](documents/by-issuer/vatican-i.md)');
    expect(md).toMatch(/rp:leo-xiii.*\| 2 \|/);
  });

  it('gives each issuer its date range', () => {
    expect(md).toContain('1885-11-01 – 1891-05-15');
  });

  it('counts documents per genre and links the view', () => {
    expect(md).toContain('[`encyclical`](documents/by-genre/encyclical.md)');
    expect(md).toContain('[`constitution`](documents/by-genre/constitution.md)');
  });

  it('reports the total and the provisional share', () => {
    expect(md).toContain('4 documents');
    expect(md).toMatch(/1 .*provisional/i);
  });

  it('states coverage, naming what is deliberately absent', () => {
    expect(md).toMatch(/## Coverage/);
    expect(md).toMatch(/speeches|occasional/i);
  });
});
