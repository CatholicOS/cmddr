import { readFileSync, readdirSync, existsSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { checkDocuments, checkAssessments, type AssessmentLike } from './invariants.js';
import type { DocumentRecord } from '../types.js';

const documentSchema = JSON.parse(readFileSync('schema/document.schema.json', 'utf8'));
const genres = JSON.parse(readFileSync('data/genres.json', 'utf8')) as Array<
  { id: string; issuerTypes?: string[] }
>;

const ajv = new Ajv2020({ strict: false });
addFormats(ajv);
const validateDoc = ajv.compile<DocumentRecord>(documentSchema);

const docs: DocumentRecord[] = [];
let failures = 0;

const docFiles = existsSync('data/documents')
  ? readdirSync('data/documents').filter((f) => f.endsWith('.json'))
  : [];
for (const f of docFiles) {
  const parsed: unknown = JSON.parse(readFileSync(`data/documents/${f}`, 'utf8'));
  if (!Array.isArray(parsed)) {
    failures++;
    console.error(`schema  data/documents/${f}: expected the file's JSON root to be an array, got ${typeof parsed}`);
    continue;
  }
  for (const d of parsed as DocumentRecord[]) {
    docs.push(d);
    const valid: boolean = validateDoc(d);
    if (!valid) {
      failures++;
      console.error(`schema  ${d.id}: ${ajv.errorsText(validateDoc.errors)}`);
    }
  }
}

// Assessments are hand-curated and currently live only in the example bundles.
const assessments: AssessmentLike[] = [];
const documentIds = new Set(docs.map((d) => d.id));
for (const f of readdirSync('examples').filter((f) => f.endsWith('.json'))) {
  const bundle = JSON.parse(readFileSync(`examples/${f}`, 'utf8'));
  if (bundle.document) documentIds.add(bundle.document.id);
  if (Array.isArray(bundle.assessments)) assessments.push(...bundle.assessments);
}

for (const v of [...checkDocuments(docs, genres), ...checkAssessments(assessments, documentIds)]) {
  failures++;
  console.error(`rule ${v.rule}  ${v.id}: ${v.message}`);
}

console.log(`${docs.length} documents and ${assessments.length} assessments checked, ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
