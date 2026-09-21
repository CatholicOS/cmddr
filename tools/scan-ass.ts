/**
 * Write the two fixtures of an ASS volume (ass volumes spec §2-§4, phase 2c): read the
 * whole-volume text from the local store (tools/fetch-acta.sh ass <vol>), locate the
 * *Summa actorum* and copy its pages to tools/fixtures/acta/ass-{vol}-{year}.summa.txt,
 * scan the body before it for the papal acts (tools/src/acta/ass.ts) and check them
 * against the summa's papal part (tools/src/acta/summa.ts), and write
 * tools/fixtures/acta/ass-{vol}-{year}.entries.json with every entry's evidence, every
 * defect's lines and the check. Deterministic for a given text; re-run after the scanner
 * changes. Prints the counts for the fixtures README row.
 *
 * Usage: npx tsx tools/scan-ass.ts ass-33
 *        npx tsx tools/scan-ass.ts sample        # the five volumes of phase 2c-i
 *        npx tsx tools/scan-ass.ts 1-41           # a range of volumes
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { scanVolume, type AssScan } from './src/acta/ass.js';
import { checkSumma, locateSumma, parseSummaPapalPart } from './src/acta/summa.js';
import { ACTA_SOURCES, actaSource, type ActaSource } from './src/acta/join.js';

const STORE = `${process.env['ACTA_SOURCES'] ?? `${homedir()}/development/sources/ASS`}/txt`;
const textPath = (s: ActaSource) => `${STORE}/ass-${String(s.volume).padStart(2, '0')}-${s.year}.txt`;

const arg = process.argv[2];
if (!arg) throw new Error('usage: scan-ass.ts <ass-N | sample | from-to>');
const range = arg.match(/^(\d{1,2})-(\d{1,2})$/);
const sources: ActaSource[] = arg === 'sample'
  ? ACTA_SOURCES.filter((s) => s.kind === 'ass')
  : range
    ? ACTA_SOURCES.filter((s) => s.kind === 'ass' && s.volume >= Number(range[1]) && s.volume <= Number(range[2]))
    : [actaSource(arg) ?? (() => { throw new Error(`unknown source ${arg}`); })()];

const pad2 = (n: number) => String(n).padStart(2, '0');
const now = new Date();
const today = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;

for (const s of sources) {
  if (s.kind !== 'ass') throw new Error(`${s.key} is not an ASS source`);
  const text = textPath(s);
  if (!existsSync(text)) { console.error(`${s.key}: no volume text at ${text} (run tools/fetch-acta.sh ass ${s.volume})`); continue; }
  const pages = readFileSync(text, 'utf8').split('\f');
  const summaPages = locateSumma(pages);
  const lastBodyPage = summaPages ? summaPages.from - 1 : pages.length;
  const summaText = summaPages ? pages.slice(summaPages.from - 1, summaPages.to).join('\f') + '\n' : '';
  const { entries, defects } = scanVolume(pages, { volume: s.volume, year: s.year, yearTo: s.yearTo ?? s.year, lastBodyPage });
  const parsed = parseSummaPapalPart(summaText);
  const summa = checkSumma(entries, { pages: summaPages, rows: parsed.rows });
  const scan: AssScan = {
    source: s.key, generated: today, text: `${text.replace(homedir(), '~')} (${pages.length} pages)`,
    volume: s.volume, year: s.year, pages: pages.length, entries, defects, summa,
  };
  writeFileSync(s.summaFile!, summaText);
  writeFileSync(s.file, JSON.stringify(scan, null, 2) + '\n');
  const byReason = (r: string) => defects.filter((d) => d.reason === r).length;
  console.log(`${s.key}: ${pages.length} pages; summa ${summaPages ? `${summaPages.from}-${summaPages.to} (${parsed.heading ?? 'no papal heading'} … ${parsed.end ?? 'no dicastery heading'})` : 'NOT FOUND'}; `
    + `${entries.length} acts scanned (${entries.filter((e) => e.anchor === 'heading').length} from a heading), ${defects.length} defects `
    + `(no-heading ${byReason('no-heading')}, no-date ${byReason('no-date')}, no-opening ${byReason('no-opening')}, header-mismatch ${byReason('header-mismatch')}, unknown-pope ${byReason('unknown-pope')}); `
    + `summa rows ${parsed.rows.length}: claimed ${summa.claimed.length}, unclaimed ${summa.unclaimed.length}; acts the summa omits ${summa.omitted.length}`);
  for (const d of defects) console.log(`  defect p.${d.page} ${d.reason}: ${d.lines.join(' / ').slice(0, 160)}`);
  for (const r of summa.unclaimed) console.log(`  unclaimed p.${r.page}: ${r.description.slice(0, 120)}`);
}
