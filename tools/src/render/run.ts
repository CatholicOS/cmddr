import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { renderDocumentsMd } from './documentsMd.js';
import type { DocumentRecord } from '../types.js';

const docs: DocumentRecord[] = readdirSync('data/documents')
  .filter((f) => f.endsWith('.json'))
  .flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[]);

if (!existsSync('registry')) mkdirSync('registry', { recursive: true });
writeFileSync('registry/documents.md', renderDocumentsMd(docs));
console.log(`registry/documents.md: ${docs.length} documents`);
