import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { renderIssuerMd } from './issuerMd.js';
import { renderGenreMd } from './genreMd.js';
import { renderKeywordMd } from './keywordMd.js';
import { renderIndexMd, genreFile } from './indexMd.js';
import { issuerLocalPart } from '../ids.js';
import type { DocumentRecord } from '../types.js';

const docs: DocumentRecord[] = readdirSync('data/documents')
  .filter((f) => f.endsWith('.json'))
  .flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[]);

// Regenerate the tree from scratch so a view for a removed issuer, genre or keyword cannot linger.
if (existsSync('registry/documents')) rmSync('registry/documents', { recursive: true });
mkdirSync('registry/documents/by-issuer', { recursive: true });
mkdirSync('registry/documents/by-genre', { recursive: true });
mkdirSync('registry/documents/by-keyword', { recursive: true });

const byIssuer = new Map<string, DocumentRecord[]>();
const byGenre = new Map<string | null, DocumentRecord[]>();
const byKeyword = new Map<string, DocumentRecord[]>();
for (const d of docs) {
  const i = issuerLocalPart(d.issuerId);
  byIssuer.set(i, [...(byIssuer.get(i) ?? []), d]);
  byGenre.set(d.genre, [...(byGenre.get(d.genre) ?? []), d]);
  for (const k of d.keywords ?? []) byKeyword.set(k, [...(byKeyword.get(k) ?? []), d]);
}

for (const [issuer, ds] of byIssuer) {
  writeFileSync(`registry/documents/by-issuer/${issuer}.md`, renderIssuerMd(issuer, ds));
}
for (const [genre, ds] of byGenre) {
  writeFileSync(`registry/documents/by-genre/${genreFile(genre)}.md`, renderGenreMd(genre, ds));
}
for (const [keyword, ds] of byKeyword) {
  writeFileSync(`registry/documents/by-keyword/${keyword}.md`, renderKeywordMd(keyword, ds));
}
writeFileSync('registry/documents.md', renderIndexMd(docs));

console.log(
  `registry/documents.md + ${byIssuer.size} issuer, ${byGenre.size} genre and ${byKeyword.size} `
  + `keyword views: ${docs.length} documents`,
);
