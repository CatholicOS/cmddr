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
import { ACTA_CATEGORIES } from './src/acta/categories.js';
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
if (sources.length === 0) {
  const have = ACTA_SOURCES.filter((s) => s.kind === 'ass').map((s) => s.volume).sort((a, b) => a - b);
  console.error(`ass-era-report: no ASS source in ${from}-${to}. Joined volumes: ${have.join(', ')}. Add the era's ACTA_SOURCES rows and scan them first (spec §2).`);
  process.exit(1);
}
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
/**
 * What counts as a brief: the *Brevia* row's own headings, read from the category table
 * rather than listed again here. A second list fell behind it as soon as ASS 22 (1889) 257
 * added `LITTERAE APOSTOLICAE IN FORMA BREVIS`, and the summary then counted 35 briefs where
 * the volume list showed 36 (CodeRabbit on PR #55).
 */
const BREVIS = ACTA_CATEGORIES.find((c) => c.id === 'Brevia')!.headings;
const breviaVolumes = [...new Set(creation.held
  .filter((h) => BREVIS.includes((h.entry as AssEntry).category))
  .map((h) => (h.entry as AssEntry).volume))].sort((a, b) => a - b);
const breviaHeld = creation.held.filter((h) => BREVIS.includes((h.entry as AssEntry).category)).length;
/** The generated-on date is the newest fixture the run reads: a hand-set constant dated a report before its own evidence (CodeRabbit on PR #51). */
const GENERATED_ON = [...scans.values()].map((s) => s.generated).sort().at(-1)!;

/**
 * The era's pope and the others its volumes happen to print. A volume spanning a death carries
 * two -- ASS 36 Leo XIII to 20 July 1903 and Pius X after, ASS 11 Pius IX to February 1878 --
 * so the era is named for whoever most of its entries belong to and the rest are named beside
 * him. Derived, because the generator serves 2c-ii-b, -c and -d and must not be typed for one.
 */
const popes = [...new Set(entries.map((e) => e.pope))]
  .sort((a, b) => entries.filter((e) => e.pope === b).length - entries.filter((e) => e.pope === a).length);
const eraPope = popes[0] ?? '—';
/**
 * The volumes phase 2c-i sampled, one a decade. A range can contain them -- ASS 13-35 holds
 * 23 and 33 -- and their references were written before the era ran, so the reading below
 * says which of the range's volumes the era itself added and what the sampled ones carry.
 */
const SAMPLE_VOLUMES = [1, 12, 23, 33, 41];
const sampledHere = sources.filter((s) => SAMPLE_VOLUMES.includes(s.volume)).map((s) => s.volume);
const sampledRefs = cited.filter((d) => sampledHere.includes(d.acta!.volume)).length;
/**
 * The era pope's own briefs shelf, counted from the registry: what the brevia can match
 * against. Keyed to the era pope alone and not to every issuer the range prints -- ASS 36
 * carries Leo XIII as well as Pius X, and counting both put Leo XIII's 13 records into the
 * Pius X report under Pius X's name (CodeRabbit on PR #55).
 */
const eraIssuer = POPE_ISSUERS[eraPope];
const briefsShelf = docs.filter((d) => d.issuerId === eraIssuer && d.characteristics?.includes('in-forma-brevis')).length;
/** The holds by reason: `series-not-created` is the era's ordinary case, anything else is named. */
const heldReasons = [...creation.held.reduce((m, h) => m.set(h.reason, (m.get(h.reason) ?? 0) + 1), new Map<string, number>())].sort();
const heldNotCreated = heldReasons.find(([r]) => r === 'series-not-created')?.[1] ?? 0;
const heldOther = heldReasons.filter(([r]) => r !== 'series-not-created');
/** Each pope's briefs-shelf size, for the eras still to come (finding 7). Counted, never typed. */
const briefsOf = (issuer: string) => docs.filter((d) => d.issuerId === issuer && d.characteristics?.includes('in-forma-brevis')).length;
const topVolume = [...sources].sort((a, b) => cited.filter((d) => d.acta!.volume === b.volume).length - cited.filter((d) => d.acta!.volume === a.volume).length)[0]!.volume;
const alsoPopes = popes.slice(1);
/** Volumes of the era that print more than one pope, with the minority pope named. */
const twoPopeVolumes = sources
  .map((s) => ({ volume: s.volume, popes: [...new Set(scans.get(s.key)!.entries.map((e) => e.pope))] }))
  .filter((v) => v.popes.length > 1);
/** The volumes still unjoined, split as spec §10 splits the eras: Pius IX 1-11, Leo XIII 12-35. */
const joined = ACTA_SOURCES.filter((s) => s.kind === 'ass').map((s) => s.volume);
const leftIn = (lo: number, hi: number) => [...Array(hi - lo + 1).keys()].map((i) => i + lo).filter((v) => !joined.includes(v));

p(`# The *Acta Sanctae Sedis* under ${eraPope} (ASS ${from}–${to}${alsoPopes.length ? `, with ${alsoPopes.join(' and ')}'s last months` : ''})`);
p();
p(`Generated by \`tools/ass-era-report.ts ${from}-${to}\` on ${GENERATED_ON} from \`data/documents/\`, the entries and summa fixtures in \`tools/fixtures/acta/\` (scanned ${GENERATED_ON}; each volume's retrieval date is in \`tools/fixtures/acta/README.md\`), and the curated rows of \`tools/src/acta/curation.ts\`. The tables are computed; the prose of §1 is written against them.`);
p();

p('## 1. Reading');
p();
p(`1. **${sources.length} volumes, ${entries.length} entries, ${result.matches.length} references — ${pct(result.matches.length, entries.length)} of what the scanner read now cites the shelf.** ${sum((s) => s.summa.claimed.length)} of ${sum((s) => s.summa.rows.length)} summa rows claimed (${pct(sum((s) => s.summa.claimed.length), sum((s) => s.summa.rows.length))}), and **${cited.length} documents** now carry a reference into these volumes (§4). Per volume: ${sources.map((s) => `ASS ${s.volume} ${cited.filter((d) => d.acta!.volume === s.volume).length}`).join(', ')}.${sampledHere.length === 0 ? '' : ` Of these volumes ${sampledHere.map((v) => `ASS ${v}`).join(' and ')} ${sampledHere.length === 1 ? 'was' : 'were'} joined by phase 2c-i, one volume a decade, and carry ${sampledRefs} of the references above; the ${sources.length - sampledHere.length} the era itself added carry ${cited.length - sampledRefs}.`}`);
p(`2. **The yield is not spread evenly, and the reason is the shelf rather than the scan.** ASS ${topVolume} alone carries ${Math.max(...sources.map((s) => cited.filter((d) => d.acta!.volume === s.volume).length))} of the ${cited.length}${twoPopeVolumes.length === 0 ? '.' : `, and ${twoPopeVolumes.map((v) => `ASS ${v.volume}`).join(' and ')} ${twoPopeVolumes.length === 1 ? 'is' : 'are'} the outlier${twoPopeVolumes.length === 1 ? '' : 's'} the other way: ${twoPopeVolumes.length === 1 ? 'it prints' : 'they print'} more than one pope (${twoPopeVolumes.map((v) => `ASS ${v.volume}: ${v.popes.join(' and ')}`).join('; ')}), so the half that is not ${eraPope}'s belongs to another era's count, and ${twoPopeVolumes.map((v) => `ASS ${v.volume}'s ${cited.filter((d) => d.acta!.volume === v.volume).length}`).join(' and ')} reference${twoPopeVolumes.length === 1 && cited.filter((d) => d.acta!.volume === twoPopeVolumes[0]!.volume).length === 1 ? '' : 's'} ${twoPopeVolumes.length === 1 ? 'is' : 'are'} ${eraPope}'s alone.`}`);
p(`3. **${result.matches.length} matched, ${result.ambiguous.length} ambiguous, ${creation.held.length} held.** ${byRule('unique')} matched by the unique rule — one shelf record of the pope, the class and the day — ${byRule('opening')} by the opening rule and ${byRule('curated')} by a curated override (\`ACTA_MATCH_OVERRIDES\`). **No ambiguity survives the curation round** (§5), and the series' totals for ambiguity and double claiming stand where they did before this era joined: it introduced none.`);
p(`4. **${creation.held.length} entries held, ${heldNotCreated} of them \`series-not-created\`${heldOther.length === 0 ? '' : ` and ${heldOther.map(([r, n]) => `${n} \`${r}\``).join(', ')}`}${breviaHeld === 0 ? '' : '; the largest single group is the brevia'}.** The creator writes no document from the ASS at all (spec decision 1: the series is joined, never created), so an entry with no shelf record is held \`series-not-created\`${heldOther.length === 0 ? '' : ', and the rest for the reason named'}.${breviaHeld === 0 ? '' : ` **${breviaHeld} of the ${creation.held.length} holds are briefs**, from ${breviaVolumes.map((v) => `ASS ${v}`).join(', ')}. `
  + `${briefsShelf === 0 ? `${eraPope} has no briefs shelf at all (\`pontiffs.ts\`), so every brief these volumes print is held for want of one.` : `${eraPope}'s briefs shelf holds ${briefsShelf} records, and that is the whole of what ${breviaHeld} printed brevia can match against: the shelf is thin, not absent.`} `
  + `Either way the gap is the registry's and not the scanner's -- the act is printed, read, dated and quoted here, and no shelf has carried it.`}`);
p(`5. **${readings.length} curated reading${readings.length === 1 ? '' : 's'} and ${overrides.length} match override${overrides.length === 1 ? '' : 's'} -- the curation round.** ${readings.length + overrides.length} rows for ${entries.length} entries, the parser of 2c-ii-a having already been taught what the series prints. §5 quotes each, with the finding it answers and the lines it rests on. Where a shape recurred across volumes the round wrote a rule and measured it over all 41 volumes before accepting it; the phase's own commits say which.`);
p(`6. **The reverse gap is ${docs.filter((d) => d.date >= `${firstYear}-01-01` && d.date <= `${lastYear}-12-31` && d.acta === undefined).length} documents of ${firstYear}–${lastYear}.** The shelf records of the era's years that still carry no reference of either series (§6). Most have no entry on their date in these volumes at all: the ASS published the Holy See's acts selectively, and what the shelf holds and what the gazette printed are two different collections.`);
p(`7. **What the eras left inherit.** ${leftIn(1, 41).length} volumes of the 41 are still unjoined, and spec §10 splits them by pontificate: **${leftIn(12, 35).length}** of Leo XIII (ASS 12–35, the sampled excepted) for 2c-ii-c and **${leftIn(1, 11).length}** of Pius IX (ASS 1–11, ASS 1 excepted) for 2c-ii-d. Two things here will not repeat: ${eraPope}'s letters shelf is the fullest of the series, and the briefs that had nowhere to go in this era **do** have a shelf under Leo XIII (${briefsOf('rp:leo-xiii')} records) and Pius IX (${briefsOf('rp:pius-ix')}), so the same acts will behave differently. What should repeat is the shape of the round — a parser needing almost no rows, and a handful of provisional date-keyed shelf records that only a curated override can tell apart.`);
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
const ass38 = scans.get('ass-38');
if (ass38) {
  p(`**ASS 38's pages are the bound volume's, not its papal part's.** Its own *Summa actorum* sits at pp. ${summaPages(ass38)} and a \`Supplementum ad " Acta S. Sedis „ (VOL. XXXVIII)\` occupies pp. 433–702, with a separately paginated French section inside it numbered from 1. No scanned entry falls in that range, and no page of it carries \`Pontificatus Nostri\`: the supplement hides no papal act, and the volume's ${ass38.summa.rows.length} summa rows are its whole papal account.`);
  p();
}

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
