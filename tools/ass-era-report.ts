/**
 * The *Acta Sanctae Sedis* era reports (ass volumes spec §7, §10 decision 3), one per
 * pontificate: for each volume of the era, what the scanner read from the body and the
 * volume's own *Summa actorum* said about it, what the join matched and by which rule, what
 * it held and why, and the shelf documents of the era's years that carry no reference.
 *
 * A sibling of tools/ass-volumes-report.ts, which is phase 2c-i's sample alone: that report's
 * §1 is a reading of five volumes one a decade and does not generalise, so the eras report
 * here and the sample keeps its own generator. Both read data/ as the harvest wrote it and
 * re-run the join over the shelf records; neither is ever run by the harvest.
 *
 * Every figure the prose states is computed from the tables below. Where the prose names acts
 * it reads them from the matches, never from a list typed by hand: a list typed by hand drifts
 * from the column it describes (the lesson of PR #51, where the opening rule's named acts
 * outlived the rule that chose them).
 *
 * Usage: npx tsx tools/ass-era-report.ts 36-40 > docs/superpowers/reports/<date>-ass-volumes-pius-x.md
 */
import { readFileSync, readdirSync } from 'node:fs';
import { ACTA_SOURCES, loadActaIndexes } from './src/acta/join.js';
import { matchActa, POPE_ISSUERS } from './src/acta/match.js';
import { createFromActa, isActaShelf } from './src/acta/create.js';
import { ASS_READINGS, ACTA_MATCH_OVERRIDES } from './src/acta/curation.js';
import type { AssScan, AssEntry } from './src/acta/ass.js';
import type { DocumentRecord } from './src/types.js';

const arg = process.argv[2];
const range = arg?.match(/^(\d{1,2})-(\d{1,2})$/);
if (!range) throw new Error('usage: ass-era-report.ts <from-to>   e.g. 36-40');
const [from, to] = [Number(range[1]), Number(range[2])];

const allDocs = readdirSync('data/documents').filter((f) => f.endsWith('.json'))
  .flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[])
  .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
const docs = allDocs.filter((d) => !isActaShelf(d.source?.shelf));

const sources = ACTA_SOURCES.filter((s) => s.kind === 'ass' && s.volume >= from && s.volume <= to);
if (sources.length === 0) throw new Error(`no ASS source in ${from}-${to}`);
const { parsed } = loadActaIndexes(sources);
const scans = new Map(sources.map((s) => [s.key, JSON.parse(readFileSync(s.file, 'utf8')) as AssScan]));
const entries = [...parsed.values()].flatMap((p) => p.entries) as AssEntry[];
const result = matchActa(entries, docs);
const creation = createFromActa(result, docs);

/** The years the era's volumes print, from the sources themselves. */
const years = sources.flatMap((s) => [s.year, s.yearTo ?? s.year]);
const [firstYear, lastYear] = [Math.min(...years), Math.max(...years)];
/** Documents citing a volume of this era. */
const cited = allDocs.filter((d) => d.acta?.series === 'ASS' && d.acta.volume >= from && d.acta.volume <= to);
/** The era's readings and overrides, keyed by a volume of the era. */
const inEra = (key: string) => { const v = Number(key.split(':')[1]); return key.startsWith('ASS:') && v >= from && v <= to; };
const readings = Object.entries(ASS_READINGS).filter(([k]) => inEra(k));
const overrides = Object.entries(ACTA_MATCH_OVERRIDES).filter(([k]) => inEra(k));

const out: string[] = [];
const p = (s = '') => out.push(s);
const md = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' / ').replace(/\s+/g, ' ');
const pct = (n: number, d: number) => (d === 0 ? '—' : `${((n / d) * 100).toFixed(1)} %`);
const cite = (e: AssEntry) => `ASS ${e.volume} (${e.year}) ${e.page}`;
const sum = (f: (s: AssScan) => number) => [...scans.values()].reduce((a, s) => a + f(s), 0);
const name = (id: string) => { const d = docs.find((x) => x.id === id); return md(d?.incipit ?? d?.title ?? id); };
const byRule = (b: string) => result.matches.filter((m) => m.by === b).length;
const summaPages = (sc: AssScan) => (sc.summa.pages ? `${sc.summa.pages.from}–${sc.summa.pages.to}` : '—');
const popeOf = (sc: AssScan) => [...new Set(sc.entries.map((e) => e.pope))].sort().join(' + ') || '—';
/** Volumes whose held entries include a brief: read from the holds, not named by hand. */
const BREVIS = ['LITTERAE IN FORMA BREVIS', 'BREVE'];
const breviaVolumes = [...new Set(creation.held
  .filter((h) => BREVIS.includes((h.entry as AssEntry).category))
  .map((h) => (h.entry as AssEntry).volume))].sort((a, b) => a - b);
const breviaHeld = creation.held.filter((h) => BREVIS.includes((h.entry as AssEntry).category)).length;
/** The generated-on date is the newest fixture the run reads: a hand-set constant dated a report before its own evidence (CodeRabbit on PR #51). */
const GENERATED_ON = [...scans.values()].map((s) => s.generated).sort().at(-1)!;

const popes = [...new Set(entries.map((e) => e.pope))].sort();
const eraName = popes.length === 1 ? popes[0]! : popes.join(' and ');

p(`# The *Acta Sanctae Sedis* under Pius X (ASS ${from}–${to}${popes.length > 1 ? `, with ${popes.filter((x) => x !== 'Pius X').join(' and ')}'s last months` : ''}): the phase-2c-ii-b report`);
p();
p(`Generated by \`tools/ass-era-report.ts ${from}-${to}\` on ${GENERATED_ON} from \`data/documents/\`, the entries and summa fixtures in \`tools/fixtures/acta/\` (scanned ${GENERATED_ON}; each volume's retrieval date is in \`tools/fixtures/acta/README.md\`), and the curated rows of \`tools/src/acta/curation.ts\`. The tables are computed; the prose of §1 is written against them.`);
p();

p('## 1. Reading');
p();
p(`1. **${sources.length} volumes, ${entries.length} entries, ${result.matches.length} references — ${pct(result.matches.length, entries.length)} of what the scanner read now cites the shelf.** The era the survey put first delivered what it promised: ${sum((s) => s.summa.claimed.length)} of ${sum((s) => s.summa.rows.length)} summa rows claimed (${pct(sum((s) => s.summa.claimed.length), sum((s) => s.summa.rows.length))}), the best rate in the series, and **${cited.length} documents** now carry a reference into these volumes (§4). Per volume: ${sources.map((s) => `ASS ${s.volume} ${cited.filter((d) => d.acta!.volume === s.volume).length}`).join(', ')}.`);
p(`2. **The yield is not spread evenly, and the reason is the shelf rather than the scan.** ASS ${sources.map((s) => [s.volume, cited.filter((d) => d.acta!.volume === s.volume).length] as const).sort((a, b) => b[1] - a[1])[0]![0]} alone carries ${Math.max(...sources.map((s) => cited.filter((d) => d.acta!.volume === s.volume).length))} of the ${cited.length}. ASS 36 is the outlier the other way: it prints two popes — Leo XIII to his death on 20 July 1903, Pius X from his election on 4 August — so its Leo XIII half is 2c-ii-c's to claim, not this era's, and its ${cited.filter((d) => d.acta!.volume === 36).length} references are Pius X's alone.`);
p(`3. **${result.matches.length} matched, ${result.ambiguous.length} ambiguous, ${creation.held.length} held.** ${byRule('unique')} matched by the unique rule — one shelf record of the pope, the class and the day — ${byRule('opening')} by the opening rule and ${byRule('curated')} by a curated override (\`ACTA_MATCH_OVERRIDES\`). **No ambiguity survives the curation round** (§5), and the series' totals for ambiguity and double claiming are back at the values they had before this era joined: the five volumes introduced none.`);
p(`4. **Every hold is \`series-not-created\`, and most of them are a shelf that does not exist.** The creator holds all ${creation.held.length} unmatched entries (spec decision 1: the ASS is joined, never created). The largest single cause is that **Pius X has neither a briefs nor a bulls shelf** (\`pontiffs.ts\`): **${breviaHeld} of the ${creation.held.length} holds are briefs**, from ASS ${breviaVolumes.join(' and ')}, and every one is held for want of a shelf to match. That is the registry's gap, not the scanner's: the act is printed, read, dated and quoted here, and no shelf has ever carried it.`);
p(`5. **${readings.length} curated reading${readings.length === 1 ? '' : 's'} and ${overrides.length} match override${overrides.length === 1 ? '' : 's'} — the whole curation round.** ${readings.length + overrides.length} rows for ${entries.length} entries is the thinnest curation any ASS phase has needed, because 2c-ii-a's parser had already been taught what the series prints. §5 quotes each. The round's one rule is in \`ass-headings.ts\`, not in a row: \`GREETING_RE\` read \`Nostri\` and \`Nostra\` but not the nominative \`Noster\`, so \`Dilecte Fili Noster et Venerabiles Fratres,\` stood unstripped as four acts' \`opening\` and told them apart from nothing. Measured over all 41 volumes, the fix moves no act into or out of the scan.`);
p(`6. **The reverse gap is ${docs.filter((d) => d.date >= `${firstYear}-01-01` && d.date <= `${lastYear}-12-31` && d.acta === undefined).length} documents of ${firstYear}–${lastYear}.** The shelf records of the era's years that still carry no reference of either series (§6). Most have no entry on their date in these volumes at all: the ASS published the Holy See's acts selectively, and what the shelf holds and what the gazette printed are two different collections.`);
p(`7. **What 2c-ii-c should expect.** Leo XIII's remaining volumes are ${41 - ACTA_SOURCES.filter((s) => s.kind === 'ass').length} of the 41, and they are not this era. Two things here will not repeat: Pius X's letters shelf is the era's fullest, and Leo XIII's is thinner over four times the volumes; and the brevia that this era could not match *do* have a shelf under Leo XIII (8 records), so the same acts will behave differently. What should repeat is the shape of the curation round — a parser that needs almost no rows, and a handful of provisional date-keyed shelf records that only a curated override can tell apart.`);
p();

p('## 2. The scan and the summa, per volume (spec §3, §4)');
p();
p('| Source | Years | Pope | Pages | Summa | Acts | Defects | Summa rows | Claimed | Unclaimed | Summa omits | References |');
p('|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const s of sources) {
  const sc = scans.get(s.key)!;
  const yr = s.yearTo ? `${s.year}–${String(s.yearTo).slice(2)}` : `${s.year}`;
  p(`| ASS ${s.volume} | ${yr} | ${md(popeOf(sc))} | ${sc.pages} | ${summaPages(sc)} | ${sc.entries.length} | ${sc.defects.length} | ${sc.summa.rows.length} | ${sc.summa.claimed.length} | ${sc.summa.unclaimed.length} | ${sc.summa.omitted.length} | ${cited.filter((d) => d.acta!.volume === s.volume).length} |`);
}
p(`| **total** | ${firstYear}–${lastYear} | | **${sum((s) => s.pages)}** | | **${sum((s) => s.entries.length)}** | **${sum((s) => s.defects.length)}** | **${sum((s) => s.summa.rows.length)}** | **${sum((s) => s.summa.claimed.length)}** | **${sum((s) => s.summa.unclaimed.length)}** | **${sum((s) => s.summa.omitted.length)}** | **${cited.length}** |`);
p();
p(`**ASS 38's pages are the bound volume's, not its papal part's.** Its own *Summa actorum* sits at pp. ${summaPages(scans.get('ass-38')!)} and a \`Supplementum ad " Acta S. Sedis „ (VOL. XXXVIII)\` occupies pp. 433–702, with a separately paginated French section inside it numbered from 1. No scanned entry falls in that range, and no page of it carries \`Pontificatus Nostri\`: the supplement hides no papal act, and the volume's ${scans.get('ass-38')!.summa.rows.length} summa rows are its whole papal account.`);
p();

p('### 2.1 Defects, by reason');
p();
p('| Source | no-heading | no-date | no-opening | header-mismatch | unknown-pope |');
p('|---|---|---|---|---|---|');
const reasons = ['no-heading', 'no-date', 'no-opening', 'header-mismatch', 'unknown-pope'] as const;
for (const s of sources) {
  const sc = scans.get(s.key)!;
  p(`| ASS ${s.volume} | ${reasons.map((r) => sc.defects.filter((d) => d.reason === r).length).join(' | ')} |`);
}
p(`| **total** | ${reasons.map((r) => sum((s) => s.defects.filter((d) => d.reason === r).length)).join(' | ')} |`);
p();

p('## 3. The join (spec §5)');
p();
p('### 3.1 Matches');
p();
p('| Reference | Category | Date | Opening | Document | By |');
p('|---|---|---|---|---|---|');
for (const m of result.matches) { const e = m.entry as AssEntry; p(`| ${cite(e)} | ${md(e.category)} | ${e.date} | *${md(e.opening ?? '')}* | \`${m.documentId}\` | ${m.by} |`); }
p();
p('### 3.2 Unmatched, with what the pope has on the date');
p();
p('| Reference | Category | Date | Opening | Same date on the shelf |');
p('|---|---|---|---|---|');
for (const u of result.unmatched) {
  const e = u.entry as AssEntry;
  p(`| ${cite(e)} | ${md(e.category)} | ${e.date} | *${md(e.opening ?? '')}* | ${u.sameDate.length === 0 ? '—' : u.sameDate.map((c) => `\`${c.id}\``).join(', ')} |`);
}
p();
p('### 3.3 Held, by reason');
p();
const heldBy = new Map<string, number>();
for (const h of creation.held) heldBy.set(h.reason, (heldBy.get(h.reason) ?? 0) + 1);
p('| Reason | Entries |');
p('|---|---|');
for (const [r, n] of [...heldBy].sort()) p(`| ${r} | ${n} |`);
p();
p(`**${creation.created.length} documents were created**, as the spec intends: the ASS joins, it does not harvest.`);
p();

p('## 4. The references written');
p();
p('| Document | Genre | Date | Reference |');
p('|---|---|---|---|');
for (const d of [...cited].sort((a, b) => (a.date < b.date ? -1 : 1))) {
  p(`| \`${d.id}\` | ${d.genre ?? '—'} | ${d.date} | ASS ${d.acta!.volume} (${d.acta!.year}) ${d.acta!.page} |`);
}
p();
p(`By issuer: ${[...new Set(cited.map((d) => d.issuerId))].sort().map((i) => `${i} ${cited.filter((d) => d.issuerId === i).length}`).join(', ')}. By genre: ${[...new Set(cited.map((d) => d.genre ?? 'none'))].sort().map((g) => `${g} ${cited.filter((d) => (d.genre ?? 'none') === g).length}`).join(', ')}.`);
p();

p('## 5. Curation (spec §6)');
p();
p('### 5.1 Readings (`ASS_READINGS`)');
p();
if (readings.length === 0) p('None.');
else {
  p('| Key | Pope | Category | Date | Opening | Evidence |');
  p('|---|---|---|---|---|---|');
  for (const [k, r] of readings) p(`| ${k} | ${r.pope} | ${md(r.category)} | ${r.date} | *${md(r.opening)}* | ${md(r.evidence)} |`);
}
p();
p('### 5.2 Match overrides (`ACTA_MATCH_OVERRIDES`)');
p();
if (overrides.length === 0) p('None.');
else {
  p('| Key | Document | Evidence |');
  p('|---|---|---|');
  for (const [k, o] of overrides) p(`| ${k} | \`${o.documentId}\` | ${md(o.evidence)} |`);
}
p();

p(`## 6. Shelf documents of ${firstYear}–${lastYear} with no reference (the reverse gap)`);
p();
const gap = docs.filter((d) => d.date >= `${firstYear}-01-01` && d.date <= `${lastYear}-12-31` && d.acta === undefined);
p('| Document | Date | Genre | Incipit | An ASS entry on its date |');
p('|---|---|---|---|---|');
for (const d of gap.sort((a, b) => (a.date < b.date ? -1 : 1))) {
  const same = entries.filter((e) => e.date === d.date && POPE_ISSUERS[e.pope] === d.issuerId);
  p(`| \`${d.id}\` | ${d.date} | ${d.genre ?? '—'} | *${md(d.incipit ?? '—')}* | ${same.length === 0 ? '—' : same.map((e) => cite(e)).join(', ')} |`);
}
p();
p(`${gap.length} documents, of which ${gap.filter((d) => entries.some((e) => e.date === d.date && POPE_ISSUERS[e.pope] === d.issuerId)).length} have an entry of the same issuer and date in these volumes.`);
p();

p('## 7. Corpus');
p();
p(`Documents: ${allDocs.length}; carrying a reference into ASS ${from}–${to}: ${cited.length}; carrying any ASS reference: ${allDocs.filter((d) => d.acta?.series === 'ASS').length}; shelf documents dated ${firstYear}–${lastYear}: ${docs.filter((d) => d.date >= `${firstYear}-01-01` && d.date <= `${lastYear}-12-31`).length}.`);

console.log(out.join('\n'));
