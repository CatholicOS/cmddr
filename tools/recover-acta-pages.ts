/**
 * Write the page sidecar of a volume whose chronological-index OCR lost the page column
 * (acta volumes spec §10.3; phase 2b-iii-b): parse the fixture, read the whole-volume text
 * from the local store (tools/fetch-acta.sh text <year>), recover each pageless entry's
 * page from the body (tools/src/acta/recover.ts) and write
 * tools/fixtures/acta/aas-{vol}-{year}[-{part}].pages.json, sorted by key, with every
 * recovered page's evidence and every unrecovered entry's reason. Deterministic for a
 * given fixture and text; re-run after either changes.
 *
 * Usage: npx tsx tools/recover-acta-pages.ts 1921
 *        npx tsx tools/recover-acta-pages.ts 1917-I
 *        npx tsx tools/recover-acta-pages.ts 1909-1925      # every volume source in the range
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { parseActaIndex } from './src/acta/index.js';
import { ACTA_SOURCES, actaSource, type ActaSource } from './src/acta/join.js';
import { findIndexGeneralis, parseIndexGeneralis, recoverPages, sidecarPath, type PagesSidecar } from './src/acta/recover.js';

const STORE = `${process.env['ACTA_SOURCES'] ?? `${homedir()}/development/sources/AAS`}/txt`;
const textPath = (s: ActaSource) => `${STORE}/aas-${String(s.volume).padStart(2, '0')}-${s.year}${s.part ? `-${s.part}` : ''}.txt`;

const arg = process.argv[2];
if (!arg) throw new Error('usage: recover-acta-pages.ts <source key | from-to>');
const range = arg.match(/^(\d{4})-(\d{4})$/);
const sources = range
  ? ACTA_SOURCES.filter((s) => s.kind === 'volume' && s.year >= Number(range[1]) && s.year <= Number(range[2]))
  : [actaSource(arg) ?? (() => { throw new Error(`unknown source ${arg}`); })()];

// The local calendar date, not UTC's: `toISOString` reads a day behind local midnight
// until the UTC clock itself crosses it (controller ruling 9, fix round 1).
const pad2 = (n: number) => String(n).padStart(2, '0');
const now = new Date();
const today = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
for (const s of sources) {
  const text = textPath(s);
  if (!existsSync(text)) { console.error(`${s.key}: no volume text at ${text} (run tools/fetch-acta.sh text ${s.year})`); continue; }
  const pages = readFileSync(text, 'utf8').split('\f');
  const parsed = parseActaIndex(readFileSync(s.file, 'utf8'), { year: s.year, volume: s.volume, ...(s.part ? { part: s.part } : {}), ...s.parse });
  // The pope's part precedes the indexes: the Index generalis's page, or the chronological
  // index's first page, bounds it -- computed before the runs are read, since the last
  // section run of the part extends to it (controller ruling 17).
  const generalisStart = findIndexGeneralis(pages);
  const indexStart = pages.findIndex((t, i) => i >= Math.floor(pages.length / 2) && /CHRONOLOGIC\w*\s+ORDINE\s+DIGEST/.test(t));
  const lastBodyPage = (generalisStart >= 0 ? generalisStart + 1 : indexStart >= 0 ? indexStart + 1 : pages.length) - 1;
  const generalis = parseIndexGeneralis(pages, lastBodyPage);
  // The paged entries count as claimants of their incipit (ruling 18).
  const { rows, unrecovered } = recoverPages(parsed.pageless, pages, generalis, { lastBodyPage, paged: parsed.entries });
  const byKey = (a: { key: string }, b: { key: string }) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
  const sidecar: PagesSidecar = {
    source: s.key, generated: today, text: `${text.replace(`${homedir()}`, '~')} (${pages.length} pages)`,
    rows: rows.sort(byKey), unrecovered: unrecovered.sort(byKey),
  };
  writeFileSync(sidecarPath(s), JSON.stringify(sidecar, null, 2) + '\n');
  const by = (k: string) => rows.filter((r) => r.rule === k).length;
  const why = (k: string) => unrecovered.filter((u) => u.reason === k).length;
  const datedFuzzy = rows.filter((r) => r.rule === 'dated' && r.fuzzy).length;
  console.log(`${s.key}: ${parsed.pageless.length} without a page -> recovered ${rows.length} (unique ${by('unique')}, dated ${by('dated')}${datedFuzzy ? ` (${datedFuzzy} fuzzy)` : ''}, fuzzy ${by('fuzzy')}); `
    + `unrecovered ${unrecovered.length} (none ${why('none')}, several ${why('several')}, outside-runs ${why('outside-runs')}, header-mismatch ${why('header-mismatch')}, claimants ${why('claimants')}, no-incipit ${why('no-incipit')}); `
    + `Index generalis ${generalis.page === null ? 'not found' : `p. ${generalis.page}, ${generalis.runs.size} categories`}${generalis.unmapped.length ? `, unmapped: ${generalis.unmapped.join('; ')}` : ''}`);
}
