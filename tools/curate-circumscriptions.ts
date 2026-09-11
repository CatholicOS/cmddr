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
  // A candidate the harvest could not give a URL, or one vatican.va will not serve, is
  // reported and skipped so that one bad record does not end the whole issuer's run.
  const url = d.source?.url;
  if (!url) { console.log(`NO-URL ${d.id}`); continue; }
  if (!existsSync(file)) {
    try {
      const res = await fetch(url);
      if (!res.ok) { console.log(`FETCH-FAILED ${d.id} ${res.status}`); continue; }
      writeFileSync(file, await res.text());
    } catch (err) {
      console.log(`FETCH-FAILED ${d.id} ${err instanceof Error ? err.message : String(err)}`);
      continue;
    }
  }
  const argumentum = extractArgumentum(readFileSync(file, 'utf8'));
  const verdict = argumentum.length < 20 ? 'ABSTAIN(no argumentum)'
    : UNION_IDIOMS.test(argumentum) ? 'unions'
    : ELEVATION_IDIOMS.test(argumentum) ? 'elevations'
    : ERECTION_IDIOMS.test(argumentum) ? 'erections'
    : 'ABSTAIN(unclassified)';
  console.log(JSON.stringify({ verdict, key: `${d.id.split('/')[0]!.replace('mag:', '')}`
    + `|${slugify(d.incipit ?? d.title)}|${d.date}`, argumentum, url }));
}
console.log(`# ${candidates.length} candidates for ${issuerId}`);
