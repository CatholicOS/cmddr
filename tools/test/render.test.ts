import { describe, it, expect } from 'vitest';
import { renderIssuerMd } from '../src/render/issuerMd.js';
import { renderGenreMd } from '../src/render/genreMd.js';
import { renderIndexMd } from '../src/render/indexMd.js';
import { renderKeywordMd } from '../src/render/keywordMd.js';
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
  // incipit is optional on DocumentRecord and is omitted entirely for a provisional
  // record -- this is the shape the harvest actually emits (see toDocument.ts).
  idStatus: 'provisional', genre: 'apostolic-letter', issuerId: 'rp:pius-xii',
  issuerType: 'pope', date: '1958-08-11',
};

describe('renderIssuerMd', () => {
  const md = renderIssuerMd('leo-xiii', docs);

  it('omits the issuer column, which is constant in this view', () => {
    expect(md).toContain('| ID | Title | Incipit | Genre | Date | Promulgated by | AAS |');
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

  it('prints the AAS reference as the conventional short citation, and nothing without one', () => {
    const cited: DocumentRecord = {
      ...docs[0]!, id: 'mag:francis-i/laudate-deum-2023', title: 'Laudate Deum', incipit: 'Laudate Deum',
      genre: 'apostolic-exhortation', issuerId: 'rp:francis-i', date: '2023-10-04',
      acta: { series: 'AAS', volume: 115, year: 2023, page: 1041 },
    };
    const out = renderIssuerMd('francis-i', [cited]);
    expect(out).toContain('| 2023-10-04 |  | AAS 115 (2023) 1041 |');
    expect(renderGenreMd('apostolic-exhortation', [cited])).toContain('| AAS 115 (2023) 1041 |');
    expect(md.split('\n').filter((l) => l.startsWith('| `mag:')).every((l) => l.endsWith('|  |'))).toBe(true);
  });
});

describe('renderGenreMd', () => {
  const md = renderGenreMd('encyclical', docs);

  it('omits the genre column, which is constant in this view', () => {
    expect(md).toContain('| ID | Title | Incipit | Issuer | Date | Promulgated by | AAS |');
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

describe('renderKeywordMd', () => {
  const tagged: DocumentRecord = {
    id: 'mag:john-paul-ii/usbekistaniae-2005', title: 'Usbekistaniae', incipit: 'Usbekistaniae',
    idStatus: 'minted', genre: 'papal-bull', issuerId: 'rp:john-paul-ii', issuerType: 'pope',
    date: '2005-04-01', keywords: ['circumscription-erection'],
  };
  const md = renderKeywordMd('circumscription-erection', [tagged]);

  it('shows issuer and genre, both of which vary in this view', () => {
    expect(md).toContain('| ID | Title | Incipit | Genre | Issuer | Date |');
  });

  it('names the keyword and marks the file as generated', () => {
    expect(md).toContain('circumscription-erection');
    expect(md).toMatch(/generated/i);
  });

  it('carries the same authority disclaimer the schema gives the keyword field', () => {
    expect(md).toMatch(/makes no claim about.*authority/i);
  });

  it('emits one row per document, sorted chronologically', () => {
    const other: DocumentRecord = {
      ...tagged, id: 'mag:john-paul-ii/gambomensis-2000', incipit: 'Gambomensis',
      date: '2000-01-01',
    };
    const two = renderKeywordMd('circumscription-erection', [tagged, other]);
    expect(two.indexOf('gambomensis')).toBeLessThan(two.indexOf('usbekistaniae'));
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
    expect(md).toMatch(/encyclical.*\| 2 \|/);
  });

  it('reports the total and the provisional share', () => {
    expect(md).toContain('4 documents');
    expect(md).toMatch(/1 .*provisional/i);
  });

  it('states the provisional count plainly when there are none, instead of explaining a mechanism for zero', () => {
    const none = renderIndexMd(docs);
    expect(none).toContain('2 documents');
    expect(none).toMatch(/none of which carry a provisional identifier/i);
    expect(none).not.toMatch(/genre-and-date based/);
  });

  it('states coverage, naming what is deliberately absent', () => {
    expect(md).toMatch(/## Coverage/);
    expect(md).toMatch(/speeches|occasional/i);
  });

  it('names the councils vatican.va does not publish', () => {
    expect(md).toMatch(/nineteen/);
    expect(md).toMatch(/Councils before 1870/);
  });

  it('counts John XXIII among the year-partitioned letters shelves', () => {
    // His letters shelf is year-partitioned (1958-1963) and unharvested, like Benedict
    // XV's and Paul VI's onward; the note used to begin at Benedict XV.
    expect(md).toMatch(/John XXIII, Benedict XV, and Paul VI onward/);
  });

  it('omits the By keyword section entirely when no document carries a keyword', () => {
    expect(md).not.toMatch(/## By keyword/);
  });

  it('adds a By keyword section, linking the view, only when a document carries one', () => {
    const keyworded: DocumentRecord = {
      ...docs[0]!, id: 'mag:john-paul-ii/usbekistaniae-2005', issuerId: 'rp:john-paul-ii',
      date: '2005-04-01', keywords: ['circumscription-erection'],
    };
    const withKw = renderIndexMd([...docs, keyworded]);
    expect(withKw).toMatch(/## By keyword/);
    expect(withKw).toContain('[`circumscription-erection`](documents/by-keyword/circumscription-erection.md)');
    expect(withKw).toMatch(/circumscription-erection.*\| 1 \|/);
  });

  it('marks an issuer with AAS-only documents in the shelves column and counts them in Coverage, from the data', () => {
    const born: DocumentRecord = {
      ...docs[0]!, id: 'mag:francis-i/ius-nativum-2023', title: 'Ius nativum. De patrimonio Sedis Apostolicae',
      incipit: 'Ius nativum', issuerId: 'rp:francis-i', date: '2023-02-20', genre: 'apostolic-letter',
      source: { url: null, shelf: 'aas/2023', retrieved: '2026-09-12' },
      acta: { series: 'AAS', volume: 115, year: 2023, page: 263 },
    };
    const withBorn = renderIndexMd([...docs, born]);
    expect(withBorn).toMatch(/rp:francis-i.*; AAS index 2023–2023 \(1 AAS-only\) \|/);
    expect(withBorn).toMatch(/1 documents are created from the annual \*Acta Apostolicae Sedis\* index/);
    const none = renderIndexMd(docs);
    expect(none).not.toMatch(/AAS-only\)/);
    expect(none).toMatch(/No document is yet created from the \*Acta Apostolicae Sedis\* index/);
  });

  it('reports the remaining candidate count in Coverage, generated from the data', () => {
    // A toponym-shaped apostolic constitution of a pope whose headings are not textually
    // tagged, and which carries no keyword yet, is exactly what the harvest itself flags
    // as an unconfirmed candidate (keywords.ts, isErectionCandidate) -- the same shape here.
    const candidate: DocumentRecord = {
      ...docs[0]!, id: 'mag:john-paul-ii/gambomensis-2000', title: 'Gambomensis',
      incipit: 'Gambomensis', issuerId: 'rp:john-paul-ii', date: '2000-01-01',
      characteristics: ['apostolic-constitution'],
      source: { url: null, shelf: 'apost_constitutions', languages: [], retrieved: '2026-09-07' },
    };
    const withCandidate = renderIndexMd([...docs, candidate]);
    expect(withCandidate).toMatch(/1 apostolic constitution.*still await adjudication/is);
    // The bold lead is generated with the count, so the bullet cannot contradict itself.
    expect(withCandidate).toContain('**Circumscription curation is incomplete.**');
    expect(withCandidate).not.toContain('curation is complete');
    const none = renderIndexMd(docs);
    expect(none).toMatch(/every candidate has been adjudicated/i);
    expect(none).toContain('**Circumscription curation is complete.**');
    expect(none).not.toContain('incomplete');
  });

  it('reports the circumscription queue as finished rather than naming a number', () => {
    expect(md).toMatch(/every candidate has been adjudicated/i);
    expect(md).not.toMatch(/have not yet been confirmed/);
  });

  it('groups by the issuer local part shared with the file tree, not the full issuerId, ' +
    'so two issuers filing under the same local part collapse into one row for one file', () => {
    const sharedLocalA: DocumentRecord = {
      ...docs[0]!, id: 'mag:shared-local/doc-a-1900', issuerId: 'rp:shared-local',
      issuerType: 'pope', date: '1900-01-01',
    };
    const sharedLocalB: DocumentRecord = {
      ...docs[0]!, id: 'mag:shared-local/doc-b-1901', issuerId: 'oec:shared-local',
      issuerType: 'ecumenical-council', date: '1901-01-01',
    };
    const merged = renderIndexMd([sharedLocalA, sharedLocalB]);
    const rows = merged.split('\n')
      .filter((l) => l.includes('documents/by-issuer/shared-local.md'));
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatch(/\| 2 \|/);
  });
});
