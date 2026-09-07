import { describe, it, expect } from 'vitest';
import { renderDocumentsMd } from '../src/render/documentsMd.js';
import type { DocumentRecord } from '../src/types.js';

const docs: DocumentRecord[] = [
  { id: 'mag:leo-xiii/rerum-novarum-1891', title: 'Rerum Novarum', incipit: 'Rerum Novarum',
    idStatus: 'minted', genre: 'encyclical', issuerId: 'rp:leo-xiii', issuerType: 'pope',
    date: '1891-05-15' },
  { id: 'mag:vatican-i/pastor-aeternus-1870', title: 'Pastor Aeternus', incipit: 'Pastor Aeternus',
    idStatus: 'minted', genre: 'constitution', issuerId: 'oec:vatican-i',
    issuerType: 'ecumenical-council', promulgatedBy: 'rp:pius-ix', date: '1870-07-18' },
];

describe('renderDocumentsMd', () => {
  const md = renderDocumentsMd(docs);

  it('emits a table header and one row per document', () => {
    expect(md).toContain('| ID | Incipit | Genre | Issuer | Date |');
    expect(md.split('\n').filter((l) => l.startsWith('| `mag:'))).toHaveLength(2);
  });

  it('sorts chronologically', () => {
    expect(md.indexOf('pastor-aeternus')).toBeLessThan(md.indexOf('rerum-novarum'));
  });

  it('backticks ids and shows the promulgator', () => {
    expect(md).toContain('`mag:vatican-i/pastor-aeternus-1870`');
    expect(md).toContain('`oec:vatican-i`');
    expect(md).toContain('`rp:pius-ix`');
  });

  it('marks a generated file', () => {
    expect(md).toMatch(/generated/i);
  });
});
