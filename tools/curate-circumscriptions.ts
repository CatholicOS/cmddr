/**
 * Curation aid for the circumscription candidate queue. NEVER run by the harvest: it
 * fetches from vatican.va, like tools/fetch-fixtures.sh, and its output is a proposal a
 * human reads before anything is committed.
 *
 * Usage: npx tsx tools/curate-circumscriptions.ts <issuerId> [outDir]
 *   e.g. npx tsx tools/curate-circumscriptions.ts rp:pius-xii /tmp/curate
 *
 * Prints one line per candidate: proposed table, then the argumentum. A candidate whose
 * argumentum matches no idiom, or that has none at all, prints ABSTAIN -- read that
 * document yourself (spec §2.3: the triage abstains, it never contradicts).
 */
import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { isUnconfirmedCandidate, ERECTION_IDIOMS, ELEVATION_IDIOMS, UNION_IDIOMS } from './src/mappings/index.js';
import { extractArgumentum } from './src/harvest/argumentum.js';
import { slugify } from './src/slug.js';
import type { DocumentRecord } from './src/types.js';

const [issuerId, outDir = '/tmp/curate'] = process.argv.slice(2);
if (!issuerId) throw new Error('usage: curate-circumscriptions.ts <issuerId> [outDir]');
mkdirSync(outDir, { recursive: true });

const all = readdirSync('data/documents').filter((f) => f.endsWith('.json'))
  .flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[]);
const candidates = all.filter(isUnconfirmedCandidate).filter((d) => d.issuerId === issuerId);

for (const d of candidates) {
  const file = `${outDir}/${d.id.replace(/[^a-z0-9]/gi, '_')}.html`;
  if (!existsSync(file)) {
    const res = await fetch(d.source!.url!);
    if (!res.ok) { console.log(`FETCH-FAILED ${d.id} ${res.status}`); continue; }
    writeFileSync(file, await res.text());
  }
  const argumentum = extractArgumentum(readFileSync(file, 'utf8'));
  const verdict = argumentum.length < 20 ? 'ABSTAIN(no argumentum)'
    : UNION_IDIOMS.test(argumentum) ? 'unions'
    : ELEVATION_IDIOMS.test(argumentum) ? 'elevations'
    : ERECTION_IDIOMS.test(argumentum) ? 'erections'
    : 'ABSTAIN(unclassified)';
  console.log(JSON.stringify({ verdict, key: `${d.id.split('/')[0]!.replace('mag:', '')}`
    + `|${slugify(d.incipit ?? d.title)}|${d.date}`, argumentum, url: d.source!.url }));
}
console.log(`# ${candidates.length} candidates for ${issuerId}`);
