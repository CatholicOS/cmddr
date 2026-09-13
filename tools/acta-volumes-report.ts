/**
 * The AAS volumes sample report (acta volumes spec §6): for each source of phase 2b-i --
 * the chronological-index pages of AAS 1 (1909), 9-I (1917), 23 (1931), 50 (1958) and 70
 * (1978), and the 2012 index PDF -- the parse rate, the entries, the headings and popes
 * that could not be mapped, what matched, what was created and what was held and why,
 * the entries dated more than a year before the volume, and the documents of the
 * volume's popes with no reference; and across the sample the category and pope
 * mappings decided, the toponym-plus-incipit constitutions read, the documents before
 * and after, and the shelf ids re-minted (expected none).
 *
 * A sibling of tools/acta-report.ts rather than a dimension of it: that report's prose
 * is the reading of the Francis decade. Like it, this one is NEVER run by the harvest;
 * it reads data/documents/ as the harvest wrote it, re-runs the join and the creator
 * over the shelf records alone and over every source (as the harvest does), and checks
 * that what the creator would create is what the data carries.
 *
 * Usage: npx tsx tools/acta-volumes-report.ts > docs/superpowers/reports/2026-09-13-acta-volumes-sample.md
 */
import { readFileSync, readdirSync } from 'node:fs';
import { ACTA_SOURCES, loadActaIndexes, sourceKeyOf, type ActaSource } from './src/acta/join.js';
import { matchActa, POPE_ISSUERS, isMonthOnly, type ActaCandidate, type ActaUnmatched } from './src/acta/match.js';
import { createFromActa, isActaShelf, CREATED_CATEGORIES, NOT_CREATED, type ActaHoldRow, type HoldReason } from './src/acta/create.js';
import { ACTA_CATEGORIES, categoryForHeading, type ActaCategory } from './src/acta/categories.js';
import { ACTA_POPES } from './src/acta/popes.js';
import { parseRate, harvestedParseRate, NESTED_TOC_HEADINGS, type ActaEntry } from './src/acta/index.js';
import { POPES } from './src/mappings/pontiffs.js';
import { assignProvisionalOrdinals, bareProvisionalId } from './src/harvest/ordinals.js';
import { slugify } from './src/slug.js';
import type { DocumentRecord } from './src/types.js';

const allDocs = readdirSync('data/documents').filter((f) => f.endsWith('.json'))
  .flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[])
  .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
const docs = allDocs.filter((d) => !isActaShelf(d.source?.shelf));
const bornInDataAll = allDocs.filter((d) => isActaShelf(d.source?.shelf));

/** The sample: every source that is not one of phase 1's ten index PDFs. */
const SAMPLE: readonly ActaSource[] = ACTA_SOURCES.filter((s) => s.year < 2015);
const sampleKeys = SAMPLE.map((s) => s.key);
const { parsed: parsedAll, missing } = loadActaIndexes();
const allEntries = [...parsedAll.values()].flatMap((p) => p.entries);
const resultAll = matchActa(allEntries, docs);
const creationAll = createFromActa(resultAll, docs);
const inSample = (e: { year: number; part?: 'I' | 'II' }): boolean => sampleKeys.includes(sourceKeyOf(e));
const entries = allEntries.filter(inSample);
const result = {
  matches: resultAll.matches.filter((m) => inSample(m.entry)),
  ambiguous: resultAll.ambiguous.filter((a) => inSample(a.entry)),
  unmatched: resultAll.unmatched.filter((u) => inSample(u.entry)),
  skipped: resultAll.skipped.filter(inSample),
  unknownPope: resultAll.unknownPope.filter(inSample),
  conflicts: resultAll.conflicts.filter((c) => c.entries.some(inSample)),
};
const creation = {
  created: creationAll.created.filter((c) => inSample(c.entry)),
  held: creationAll.held.filter((h) => inSample(h.entry)),
};
const bornInData = bornInDataAll.filter((d) => inSample({ year: d.acta!.year, ...(d.acta!.part ? { part: d.acta!.part } : {}) }));

const cat = (e: ActaEntry): ActaCategory | null => categoryForHeading(e.category);
const catId = (e: ActaEntry) => cat(e)?.id ?? e.category;
const harvestedness = (e: ActaEntry): 'yes' | 'partly' | 'no' | 'unknown' => cat(e)?.harvested ?? 'unknown';
const cite = (e: ActaEntry) => `AAS ${e.volume}${e.part ? `-${e.part}` : ''} (${e.year}) ${e.page}`;
const md = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' / ').replace(/\s+/g, ' ');
const cls = (c: { genre: string | null; characteristics: string[] }) => `${c.genre}${c.characteristics.length ? '+' + c.characteristics.join('+') : ''}`;
const label = (e: ActaEntry) => e.incipit !== null ? `*${md(e.incipit)}*` : e.toponym !== null ? `${md(e.toponym)}` : md(e.description.slice(0, 70));
const pct = (n: number | null) => n === null ? '—' : `${(n * 100).toFixed(1)} %`;
const entriesOf = (k: string) => entries.filter((e) => sourceKeyOf(e) === k);
const popesOf = (k: string) => [...new Set(entriesOf(k).map((e) => e.pope))];

const out: string[] = [];
const p = (s = '') => out.push(s);

const candidateList = (cs: ActaCandidate[]): string => cs.map((c) => `\`${c.id}\`${c.incipit ? ` (*${md(c.incipit)}*)` : ''}`).join(', ');

/** The heuristic belief for an unmatched entry, in the vocabulary of the phase-1 report. */
function belief(u: ActaUnmatched): string {
  const e = u.entry;
  const c = cat(e)!;
  const issuer = POPE_ISSUERS[e.pope];
  const began = ACTA_POPES.find((x) => x.issuerId === issuer)?.began;
  if (began !== undefined && e.date < began) return 'act of a previous pontificate printed in this volume; no document of this pope can match';
  if (isMonthOnly(e)) {
    return u.sameDate.length
      ? `**month-only date**: the pope has ${u.sameDate.length} document(s) of the class in ${e.date} (${candidateList(u.sameDate)}), none with this incipit`
      : `**month-only date**: nothing of the class in ${e.date} is harvested`;
  }
  const sameGenre = u.sameDate.filter((d) => c.classes.some((k) => k.genre === d.genre)
    && !(e.incipit !== null && d.incipit !== undefined && slugify(d.incipit) !== slugify(e.incipit)));
  if (sameGenre.length) {
    return `**class mismatch**: the shelf files \`${sameGenre.map((d) => d.id).join('`, `')}\` as ${sameGenre.map(cls).join(', ')}; not matched by rule, a filing difference to adjudicate`;
  }
  if (u.sameDate.length) {
    return `**another act of the date**: the shelf has ${candidateList(u.sameDate)} on ${e.date}, under another incipit or class`;
  }
  if (u.nearMisses.length) {
    return `**date discrepancy (±1 day)**: \`${u.nearMisses.map((d) => `${d.id}\` (${d.date})`).join(', `')}; reported, never matched`;
  }
  return '**shelf gap**: nothing of this date is harvested';
}

// ---------------------------------------------------------------------------------------
p('# The AAS volumes sample, 1909–2012: the phase-2b-i report');
p();
p('Generated by `npx tsx tools/acta-volumes-report.ts` from `data/documents/*.json` and `tools/fixtures/acta/` on 2026-09-13 —');
p('the report of phase 2b-i of [#25](https://github.com/CatholicOS/cmddr/issues/25) as the');
p('[acta volumes spec](../specs/2026-09-13-acta-volumes-design.md) §6 defines it. Six sources were chosen for their variance');
p('(spec §5): the chronological-index pages of AAS 1 (1909), 9-I (1917), 23 (1931), 50 (1958) and 70 (1978), extracted from');
p('the whole-volume OCR PDFs by `tools/fetch-acta.sh` in pypdf\'s layout mode, and the 2012 *Index generalis* PDF, extracted');
p('whole as in phase 1 (`tools/fixtures/acta/README.md` records page ranges, modes and retrieval). Each is parsed');
p('(`tools/src/acta/index.ts`, generalised across the century\'s typography and OCR), classified (`categories.ts`), its pope');
p('headings mapped (`popes.ts`), and matched to the shelf records of Pius X → Benedict XVI by issuer, date and incipit');
p('(`match.ts`); what did not match, in a category the registry creates from the *Acta* for that pope, became a document');
p('(`create.ts`, the phase-2a rule and guard unchanged), and everything else is listed here with its reason. The join and the');
p('creator run over every source at once, as the harvest does; the ten index PDFs of 2015–2024 keep their own report');
p('(`2026-09-12-acta-join-2015-2024.md`, regenerated). The *belief* beside an unmatched entry is the script\'s heuristic; the');
p('reading in the prose is the author\'s.');
if (missing.length) p(`\n**Missing fixtures:** ${missing.join(', ')}.`);
p();

// 1. Parse rate
p('## 1. Parse rate per source');
p();
p('Entries parsed over the lines of the pope parts that end in a page number (spec §4), with the lines consumed without an');
p('entry; the same over the harvested categories alone (what the join acts on); *opened without a page* counts the entries a');
p('date line opened that never reached a page number, *month-only* the entries the index dates to the month (a printed');
p('month, a blank day: kept, matched by incipit within the month, never created). A source under 95 % is explained below,');
p('not used silently.');
p();
p('| Source | PDF pages | Lines | Page lines | Entries | **Parse rate** | Harvested categories | Opened without a page | Month-only | Sub-items | Consumed | Unseen headings | Unmapped popes |');
p('|---|---|---|---|---|---|---|---|---|---|---|---|---|');
const README_PAGES: Record<string, string> = {
  '1909': '835–860 of 908', '1917-I': '595–607 of 639', '1931': '531–540 of 566', '1958': '1032–1047 of 1130', '1978': '1008–1017 of 1130', '2012': '1–64 (whole)',
};
for (const s of SAMPLE) {
  const r = parsedAll.get(s.key);
  if (!r) { p(`| ${s.key} | — | missing |`); continue; }
  const st = r.stats;
  const rate = parseRate(st);
  const hr = harvestedParseRate(st);
  p(`| ${s.key} | ${README_PAGES[s.key] ?? ''} | ${st.lines} | ${st.pageLines} | ${st.entries} | **${pct(rate)}**${rate !== null && rate < 0.95 ? ' ⚠' : ''} | ${st.harvestedEntries} / ${st.harvestedPageLines} = ${pct(hr)} | ${st.withoutPage} | ${st.monthOnly} | ${st.subItems} | ${st.consumed} | ${r.unseenHeadings.length ? r.unseenHeadings.map(md).join('; ') : 'none'} | ${r.unmappedPopes.length ? r.unmappedPopes.map(md).join('; ') : 'none'} |`);
}
p();
p('### The reading');
p();
// The reading quotes the six sample sources by name; a fixture missing from disk leaves a
// placeholder rather than a crash, so the sections that can render still do.
const sample = ['1909', '1917-I', '1931', '1958', '1978', '2012'].filter((k) => !parsedAll.has(k));
if (sample.length > 0) {
  p(`*(The reading is not rendered: the sample fixture${sample.length > 1 ? 's' : ''} ${sample.join(', ')} ${sample.length > 1 ? 'are' : 'is'} missing from tools/fixtures/acta/.)*`);
} else {
  const r1909 = parsedAll.get('1909')!, r1917 = parsedAll.get('1917-I')!, r1931 = parsedAll.get('1931')!;
  const r1958 = parsedAll.get('1958')!, r1978 = parsedAll.get('1978')!, r2012 = parsedAll.get('2012')!;
  p(`1. **The OCR of 1909 and 1917 lost the page column, and the PDFs carry no image to check it against.** The vatican.va`);
  p(`   \`-ocr.pdf\` volumes are typeset from the OCR text (Times fonts, no image object on any page checked), so their`);
  p(`   rendering reproduces the text layer's losses: on most index pages of AAS 1 and AAS 9-I the page column is absent`);
  p(`   (p. 839 of vol. 1 renders two page numbers at its foot and none above them). The parser opened ${r1909.stats.dateLines} entries in 1909`);
  p(`   and ${r1917.stats.dateLines} in 1917-I and could close ${r1909.stats.entries} and ${r1917.stats.entries} with a page: the rates of ${pct(parseRate(r1909.stats))} and ${pct(parseRate(r1917.stats))} measure the`);
  p(`   fixtures the files can yield, and the ${r1909.stats.withoutPage + r1917.stats.withoutPage} entries opened without a page are listed in §3 as defects, each`);
  p(`   with its date and text. Nothing is cited without a page: an \`acta\` reference needs one. The page numbers of these`);
  p(`   acts are in the volumes' *Index generalis rerum* (AAS 1 p. 833: *Litterae Apostolicae, 197, 229, 245 …*), listed per`);
  p(`   category in page order without dates -- a join by position that this phase does not attempt. The same OCR reads`);
  p(`   \`1910\` for 1916 on nine letters of Benedict XV in 1917-I, which the creator holds as dated before his election (§9).`);
  p(`2. **1909 prints no bare incipits and nests a table of contents.** The first volume's index names an act by its description`);
  p(`   (*Dioecesis Rockfordiensis in Statibus foederatis Americae septentrionalis conditur*), and prints an incipit only in`);
  p(`   guillemets after a genre word (*Constitutio « Sapienti Consilio »*, *Litt. encycl. « Communium rerum »*), so the fixture is`);
  p(`   parsed with \`bareIncipits: false\` and a description is never read as an incipit; the table of contents of *Sapienti*`);
  p(`   *Consilio* (the offices of the Curia, the *Lex propria* and the *Ordo servandus*, ${r1909.stats.subItems} lines) is consumed as sub-items of`);
  p(`   one entry. Two of those sub-items are acts of their own -- the *Lex propria S. R. Rotae et Signaturae Apostolicae* (29 June`);
  p(`   1908, AAS 1 p. 20) and the *Ordo servandus in SS. Congregationibus* (29 September 1908, p. 36) -- which the index lists`);
  p(`   only as chapters of the constitution; they are a finding, not entries.`);
  p(`3. **The columnar layout dates some acts to the month.** From 1909 to 1931 the index prints ANNO, MENSE and DIE in three`);
  p(`   columns and leaves a column blank for a ditto; a printed month with a blank day (*1917 Iul. Universalis Ecclesiae*`);
  p(`   *procuratio*, AAS 9-I p. 595, blank in the rendering too) is an act the index dates to the month only. ${r1909.stats.monthOnly + r1917.stats.monthOnly + r1931.stats.monthOnly + r1958.stats.monthOnly + r1978.stats.monthOnly} such`);
  p(`   entries in the sample (§1) are kept with a month-precision date, matched by incipit within the month where the shelf`);
  p(`   supplies the day (§5, *incipit-month*), and never created (§7, *unresolvable date*). An OCR-misread day (*» Mai. 80*,`);
  p(`   1978) reads the same way and is reported (§3).`);
  p(`4. **pypdf's default mode breaks the columns; its layout mode keeps them, and interleaves one page.** In the default mode the`);
  p(`   text layer of the OCR'd volumes emits each date column as a run of its own -- every month of the page, then every day,`);
  p(`   then the entries -- and no entry can be dated; the layout mode keeps each date on the line of its entry, at the cost of`);
  p(`   positional padding the parser ignores. On AAS 23 p. 531, where the OCR's line boxes overlap (the spec's "run-together"`);
  p(`   page), the layout mode interleaves two entries' words on one line and lands page numbers on the wrong entries, so`);
  p(`   \`fetch-acta.sh\` falls back to the default mode for that page (README) and the parser splits the run-together line at`);
  p(`   each page number a date follows: 1931 parses at ${pct(parseRate(r1931.stats))}, and Pius XI's four encyclicals of 1931 cite their pages.`);
  p(`5. **1958 and 1978 are clean and print toponym and incipit both.** ${pct(parseRate(r1958.stats))} and ${pct(parseRate(r1978.stats))} overall, ${pct(harvestedParseRate(r1958.stats))} and`);
  p(`   ${pct(harvestedParseRate(r1978.stats))} over the harvested categories: what 1958 loses below 95 % are the numbered items of its two consistories`);
  p(`   (*I. Consistorium secretum 393*, *II. Optio Ecclesiarum 393* …) and the *Possessio Romanae Cathedralis* line of John XXIII's`);
  p(`   part, which end in page numbers and are not acts. The constitutions read *SANTAREMENSIS (Obidensis). Cum sit. -* (1958) and`);
  p(`   *BOACENSIS. - Cum tempora.* (1978), so a document created from them mints from the incipit (§8). The 2012 index parses as`);
  p(`   2015–2016 do (${pct(parseRate(r2012.stats))} overall, ${pct(harvestedParseRate(r2012.stats))} over the harvested categories; the lines below the rate are the`);
  p(`   journeys section's undated *Die N.* lines, as in phase 1).`);
  p(`6. **AAS 9 part II carries no chronological index.** The second part of 1917 is the *Codex Iuris Canonici* itself, with the`);
  p(`   constitution *Providentissima Mater Ecclesia* (27 May 1917, p. 5) before it and the Code's own index after; no fixture`);
  p(`   exists for it, and \`acta.part\` is therefore \`"I"\` on every 1917 reference. The one act is on the bulls shelf`);
  p(`   (\`mag:benedict-xv/providentissima-mater-1917\`) and could take a hand-curated reference (*AAS 9-II (1917) 5*) in 2b-ii.`);
}
p();

// 2. Per source headline
p('## 2. Headline per source');
p();
p('| Source | Popes | Entries | In harvested categories | Matched | Ambiguous | Claimed twice | Unmatched | Created | Held | Non-harvested (counted) | Dated > 1 year before the volume | Documents of the popes without an entry |');
p('|---|---|---|---|---|---|---|---|---|---|---|---|---|');
const docsWithoutEntry = (k: string): DocumentRecord[] => {
  const s = SAMPLE.find((x) => x.key === k)!;
  const issuers = popesOf(k).map((pp) => POPE_ISSUERS[pp]).filter((x): x is string => x !== undefined);
  return docs.filter((d) => issuers.includes(d.issuerId) && d.date.startsWith(String(s.year)) && !d.acta);
};
const totals = { entries: 0, attempted: 0, matched: 0, ambiguous: 0, conflicts: 0, unmatched: 0, created: 0, held: 0, non: 0, early: 0, without: 0 };
for (const s of SAMPLE) {
  const es = entriesOf(s.key);
  const attempted = es.filter((e) => harvestedness(e) === 'yes' || harvestedness(e) === 'partly');
  const matched = result.matches.filter((m) => sourceKeyOf(m.entry) === s.key).length;
  const ambiguous = result.ambiguous.filter((a) => sourceKeyOf(a.entry) === s.key).length;
  const conflicts = result.conflicts.filter((c) => c.entries.some((e) => sourceKeyOf(e) === s.key)).length;
  const unmatched = result.unmatched.filter((u) => sourceKeyOf(u.entry) === s.key).length;
  const created = creation.created.filter((c) => sourceKeyOf(c.entry) === s.key).length;
  const held = creation.held.filter((h) => sourceKeyOf(h.entry) === s.key).length;
  const non = es.length - attempted.length;
  const early = es.filter((e) => Number(e.date.slice(0, 4)) < s.year - 1).length;
  const without = docsWithoutEntry(s.key).length;
  p(`| ${s.key} | ${popesOf(s.key).join(', ')} | ${es.length} | ${attempted.length} | ${matched} | ${ambiguous} | ${conflicts} | ${unmatched} | ${created} | ${held} | ${non} | ${early} | ${without} |`);
  totals.entries += es.length; totals.attempted += attempted.length; totals.matched += matched; totals.ambiguous += ambiguous;
  totals.conflicts += conflicts; totals.unmatched += unmatched; totals.created += created; totals.held += held; totals.non += non;
  totals.early += early; totals.without += without;
}
p(`| **Total** | | **${totals.entries}** | **${totals.attempted}** | **${totals.matched}** | **${totals.ambiguous}** | **${totals.conflicts}** | **${totals.unmatched}** | **${totals.created}** | **${totals.held}** | **${totals.non}** | **${totals.early}** | **${totals.without}** |`);
p();
p('*Unmatched* counts the entries of a harvested or partly harvested category the join left without a document (each is');
p('listed in §6 with a belief); *Created* and *Held* partition them, with the ambiguous and doubly-claimed entries, by the');
p('creator\'s rules (§8, §9). *Dated > 1 year before the volume* counts the acts a volume publishes late (spec §2: an entry can be');
p('dated years earlier; 1917 prints letters of 1910 and 1915). *Documents of the popes without an entry* counts the harvested');
p('shelf documents of the source\'s popes dated in the volume year that carry no `acta` (§11).');
p();
{
  const byHow = new Map<string, number>();
  for (const m of result.matches) byHow.set(m.by, (byHow.get(m.by) ?? 0) + 1);
  const created = creation.created;
  const byIssuer = new Map<string, number>();
  for (const c of created) byIssuer.set(c.record.issuerId, (byIssuer.get(c.record.issuerId) ?? 0) + 1);
  const toponymIncipit = entries.filter((e) => e.toponym !== null && e.incipit !== null).length;
  const guard = creation.held.filter((h) => ['class-mismatch', 'possible-identity', 'near-miss', 'same-incipit-elsewhere', 'id-collision', 'ocr-damaged'].includes(h.reason)).length;
  p('### The reading');
  p();
  p(`1. **${result.matches.length} references written, every one from a quoted index line (§12):** ${[...byHow].sort().map(([k, n]) => `${n} ${k}`).join(', ')}. The`);
  p(`   *incipit-month* matches are the month-only entries of §1.3; the *toponym* and *incipit* ones include the claims the`);
  p(`   evidence rule resolved (\`match.ts\`): where several constitutions of one day are entered against one shelf record of the`);
  p(`   day (10 November 1977: *Avkaënsis*, *Mohaleshoekensis*, *Ambikapurensis* against the shelf's *Avkaensis*), the entry the`);
  p(`   record names keeps the match and the others are released to the creator instead of all three being withheld.`);
  p(`2. **${created.length} documents created** (§8) -- ${[...byIssuer].sort().map(([k, n]) => `\`${k}\` ${n}`).join(', ')} -- and ${creation.held.length} entries held (§9), ${guard} of them by the`);
  p(`   duplicate guard. ${toponymIncipit} constitutions print toponym and incipit both (§1.5), so almost no provisional id is minted from the`);
  p(`   volumes; the *Epistulae* are created only where the pope's letters shelf is harvested (Pius XI, Pius XII, John Paul I in this`);
  p(`   sample) and held elsewhere (§9, *shelf not harvested*).`);
  p(`3. **A volume can reprint an act another volume already published, and a page can open two acts.** The 2020 index lists`);
  p(`   Benedict XVI's *Ibi vacabimus* (3 July 2011) at AAS 112 (2020) 479, and the 2012 index the same letter at AAS 104 (2012)`);
  p(`   482: two references to one act. Neither is created -- the id-collision rule holds both (the phase-1 report's 2020 count`);
  p(`   drops by one) -- and which is the citation of record (the first publication, presumably) is a curated decision for 2b-ii,`);
  p(`   not a rule. And AAS 70 (1978) p. 150 opens two short apostolic letters (*Sacra illa*, 9 January; *Quoniam beatissima*,`);
  p(`   11 January -- the volume's p. 150 prints both under one running header), which invariant 25's premise did not foresee: the`);
  p(`   page is curated in \`ACTA_SHARED_PAGES\` (\`curation.ts\`) with the page quoted, and the invariant exempts exactly those two.`);
  p(`   A page number the OCR misread with a leading zero (*030* for 930, AAS 50 p. 1035) is reported rather than cited.`);
  p(`4. **Documents of the sample's popes dated in the volume years without a reference** (§11): mostly the shelves' own December`);
  p(`   acts (the next volume's), the acts the cropped pages of 1909 and 1917 cannot cite, and the classes the index files under`);
  p(`   a category the registry does not attempt.`);
}
p();

// 3. Per category
p('## 3. Per source and per category, and the parser defects');
p();
p('Parsed / matched / ambiguous / unmatched for every category the sample prints, with the mapping decided for each heading');
p('(§4); a category of the *no* row is counted only.');
p();
p(`| Category | Harvested | ${sampleKeys.join(' | ')} |`);
p(`|---|---|${sampleKeys.map(() => '---').join('|')}|`);
for (const c of ACTA_CATEGORIES) {
  const cells = sampleKeys.map((k) => {
    const es = entriesOf(k).filter((e) => cat(e)?.id === c.id);
    if (es.length === 0) return '';
    if (c.harvested === 'no') return `${es.length}`;
    const m = result.matches.filter((x) => sourceKeyOf(x.entry) === k && cat(x.entry)?.id === c.id).length;
    const a = result.ambiguous.filter((x) => sourceKeyOf(x.entry) === k && cat(x.entry)?.id === c.id).length;
    const u = result.unmatched.filter((x) => sourceKeyOf(x.entry) === k && cat(x.entry)?.id === c.id).length;
    return `${es.length} / ${m} / ${a} / ${u}`;
  });
  if (cells.every((x) => x === '')) continue;
  p(`| ${c.id} | ${c.harvested} | ${cells.join(' | ')} |`);
}
p();
p('Parts skipped per source (dicasteries, tribunals, the death of Pius XII and the conclave of 1958, *Diarium*): '
  + sampleKeys.map((k) => `${k}: ${parsedAll.get(k)?.skippedParts.map(md).join(', ') || '—'}`).join('; ') + '.');
p();
p('### Parser defects');
p();
p('Lines the parser could not read into an entry, per source. The entries opened without a page number (the cropped');
p('columns of 1909 and 1917) are listed in full: each names the act the volume prints and the page the scan lacks.');
p();
for (const k of sampleKeys) {
  const r = parsedAll.get(k);
  if (!r) continue;
  const rows = r.defects.filter((d) => {
    const c = categoryForHeading(d.category);
    return !(c !== null && ['Itinera Apostolica', 'Secretaria Status', 'Vicariatus'].includes(c.id));
  });
  const counted = r.defects.length - rows.length;
  p(`<details><summary><b>${k}</b> — ${r.defects.length} defects${counted ? ` (${counted} in the journeys and Secretariat sections counted only)` : ''}</summary>`);
  p();
  p('| Category | Defect |');
  p('|---|---|');
  for (const d of rows) p(`| ${categoryForHeading(d.category)?.id ?? md(d.category)} | ${md(d.message.slice(0, 300))} |`);
  p();
  p('</details>');
  p();
}

// 4. Mappings
p('## 4. The mappings decided');
p();
p('### Category headings');
p();
p('Every heading the six sources print, as `normaliseHeading` renders it, with the row of `categories.ts` it maps to, the');
p('registry class, the harvestedness and whether the creator creates from it. A heading printed in an OCR spelling is listed as');
p('the fixture prints it. No heading was left `unknown` (§1).');
p();
p('| Heading (as printed) | Sources | Category row | Registry class | Harvested | Created from the Acta |');
p('|---|---|---|---|---|---|');
{
  const seen = new Map<string, Set<string>>();
  for (const e of entries) seen.set(e.category, (seen.get(e.category) ?? new Set()).add(sourceKeyOf(e)));
  for (const [h, ks] of [...seen].sort()) {
    const c = categoryForHeading(h);
    const createdFrom = c === null ? '—' : c.id in CREATED_CATEGORIES ? `yes (${CREATED_CATEGORIES[c.id]!.shelves.join('/')} shelf, per pope)` : c.id in NOT_CREATED ? `no: ${md(NOT_CREATED[c.id]!)}` : 'no (not harvested)';
    p(`| ${md(h)} | ${[...ks].join(', ')} | ${c?.id ?? '**unknown**'} | ${c === null || c.classes.length === 0 ? '—' : c.classes.map((k) => `\`${k.genre}\`${k.requires ? `+${k.requires}` : ''}${k.excludes ? ` (not ${k.excludes})` : ''}`).join(', ')} | ${c?.harvested ?? 'unknown'} | ${createdFrom} |`);
  }
}
p();
p('Decisions the spec left open, taken here with the evidence beside each row of `categories.ts`: *Epistula encyclica* (1958,');
p('*Ad Apostolorum Principis*) maps to the encyclicals row, since vatican.va\'s encyclicals shelf carries the act; the two-line');
p('*Adhortatio ad populorum belligerantium moderatores* (1917, *Dès le début*) to the exhortations row, since the');
p('apost_exhortations shelf carries it, unlike 2019\'s bare *Adhortatio*; *Motu proprio* alone (1909–1958) to the motu proprio');
p('row; *Apostolicae sub plumbo litterae* (1917) to the *sub plumbo* row; *Epistolae* to *Epistulae*, whose harvestedness becomes');
p('`partly` (the letters shelf is harvested for five popes), so the matcher attempts every *Epistula* and the creator creates');
p('only where the pope\'s letters shelf is harvested; *Nuntii scripto dati* (1958, 1978) to *Nuntii*, since Paul VI\'s are the');
p('harvested annual series; *Nuntii radiophonici* / *Nuncium radiophonicum* / *Nuntii radiotelevisifici* to a new row mapping to');
p('`message` and `urbi-et-orbi` as `partly` -- the Christmas and Easter *Urbi et Orbi* among them are on the harvested urbi');
p('shelves and match (§12) -- created from never, and counted for #27 (`medium`) rather than applied; *Sermo*/*Sermones* to a');
p('new row of the speeches class, not harvested; *Nuntii gratulatorii* and *Nuntii telegraphici* to rows of their own, not');
p('harvested; *Acta Sacri Consistorii* and *Sacra Consistoria* to *Consistoria* (the parser no longer takes the former for a');
p('part heading); *Chirographe* (OCR) to *Chirographa*; *Homilia*, *Conventio*, *Nuntius televisificus*, the plural');
p('*Adhortationes apostolicae postsynodales* and the 2012 *Litterae Apostolicae «Motu proprio» datae* to their rows.');
p();
p('### Pope headings');
p();
p('| Heading (as printed) | Sources | Label | Issuer | Pontificate began |');
p('|---|---|---|---|---|');
{
  const seenPopes = new Map<string, Set<string>>();
  for (const e of entries) seenPopes.set(e.pope, (seenPopes.get(e.pope) ?? new Set()).add(sourceKeyOf(e)));
  const printed: Record<string, string> = {
    'Pius X': 'I. — ACTA PII PP. X.', 'Benedictus XV': 'I. - ACTA BENEDICTI PP. XV', 'Pius XI': 'I. - ACTA PII PP. XI',
    'Pius XII': 'I - ACTA PII PP. XII', 'Ioannes XXIII': 'IV - ACTA IOANNIS PP. XXIII', 'Paulus VI': 'I - ACTA PAULI PP. VI',
    'Ioannes Paulus I': 'II - ACTA IOANNIS PAULI PP. I', 'Ioannes Paulus II': 'III - ACTA IOANNIS PAULI PP. II', 'Benedictus XVI': 'I – ACTA BENEDICTI XVI',
  };
  for (const pope of ACTA_POPES) {
    const ks = seenPopes.get(pope.pope);
    if (!ks) continue;
    p(`| ${printed[pope.pope] ?? pope.genitive} | ${[...ks].join(', ')} | ${pope.pope} | \`${pope.issuerId}\` | ${pope.began} |`);
  }
  const unmapped = sampleKeys.flatMap((k) => parsedAll.get(k)?.unmappedPopes ?? []);
  p();
  p(`Unmapped pope headings: ${unmapped.length ? unmapped.map(md).join('; ') : '**none**'}. The 1958 volume's *II - Acta in morte Pii PP. XII* and *III - Acta`);
  p('Conclavis* are not pope parts and are skipped with the dicasteries. The nested table of contents of 1909 consumed as');
  p(`sub-items is keyed on ${NESTED_TOC_HEADINGS.size} capitalised division titles listed in \`index.ts\`.`);
}
p();

// 5. Ambiguous and conflicts
p('## 5. Ambiguous entries and documents claimed twice');
p();
p('| Reference | Date | Category | Entry | Candidates |');
p('|---|---|---|---|---|');
for (const a of result.ambiguous) p(`| ${cite(a.entry)} | ${a.entry.date} | ${catId(a.entry)} | ${label(a.entry)} | ${candidateList(a.candidates)} |`);
p();
if (result.conflicts.length) {
  p('| Document | Entries |');
  p('|---|---|');
  for (const c of result.conflicts) p(`| \`${c.documentId}\` | ${c.entries.map((e) => `${cite(e)}: ${label(e)}`).join('; ')} |`);
} else {
  p('No document of the sample is claimed twice after the evidence rule (§2.1).');
}
p();

// 6. Unmatched
p('## 6. Unmatched entries in harvested and partly harvested categories');
p();
const groups = new Map<string, ActaUnmatched[]>();
for (const u of result.unmatched) {
  const k = `${sourceKeyOf(u.entry)} · ${catId(u.entry)}`;
  groups.set(k, [...(groups.get(k) ?? []), u]);
}
for (const [k, us] of groups) {
  p(`<details><summary><b>${k}</b> — ${us.length} unmatched</summary>`);
  p();
  p('| Reference | Pope | Date | Entry | Belief |');
  p('|---|---|---|---|---|');
  for (const u of us) {
    p(`| ${cite(u.entry)} | ${u.entry.pope} | ${u.entry.date} | ${label(u.entry)}${u.entry.description && u.entry.incipit !== null ? ` — ${md(u.entry.description.slice(0, 90))}` : ''} | ${md(belief(u))} |`);
  }
  p();
  p('</details>');
  p();
}

// 7. Entries dated more than a year before the volume
p('## 7. Entries dated more than a year before the volume');
p();
p('| Reference | Pope | Date | Category | Entry | Outcome |');
p('|---|---|---|---|---|---|');
const outcome = (e: ActaEntry): string => {
  const m = result.matches.find((x) => x.entry === e);
  if (m) return `matched \`${m.documentId}\` (${m.by})`;
  const c = creation.created.find((x) => x.entry === e);
  if (c) return `created \`${dataIdOf(c.record)}\``;
  const h = creation.held.find((x) => x.entry === e);
  if (h) return `held (${h.reason})`;
  return result.unmatched.some((u) => u.entry === e) ? 'unmatched' : 'not attempted';
};
const bornKey = (d: DocumentRecord) => `${d.issuerId}|${d.date}|${d.acta!.year}${d.acta!.part ?? ''}:${d.acta!.page}`;
const bornByKey = new Map(bornInData.map((d) => [bornKey(d), d]));
function dataIdOf(d: DocumentRecord): string { return bornByKey.get(bornKey(d))?.id ?? d.id; }
for (const s of SAMPLE) {
  for (const e of entriesOf(s.key).filter((e) => Number(e.date.slice(0, 4)) < s.year - 1)) {
    p(`| ${cite(e)} | ${e.pope} | ${e.date} | ${catId(e)} | ${label(e)} | ${outcome(e)} |`);
  }
}
p();

// 8. Created
p('## 8. Created from the Acta');
p();
{
  const normalised = (d: DocumentRecord): string => { const { id: _id, ...rest } = d; return JSON.stringify(rest, Object.keys(rest).sort()); };
  const fromCreator = new Map(creation.created.map((c) => [bornKey(c.record), c.record]));
  const onlyData = bornInData.filter((d) => !fromCreator.has(bornKey(d))).map((d) => d.id);
  const onlyCreator = creation.created.filter((c) => !bornByKey.has(bornKey(c.record))).map((c) => c.record.id);
  const differing = bornInData.filter((d) => { const c = fromCreator.get(bornKey(d)); return c !== undefined && normalised(c) !== normalised(d); }).map((d) => d.id);
  p(`The data carries **${bornInData.length}** AAS-only records from the sample and the creator, re-run here over the shelf records, produces **${creation.created.length}**`
    + (onlyData.length === 0 && onlyCreator.length === 0 && differing.length === 0
      ? ' — the same set, entry for entry, and the same records field for field (ids aside, which the collision and ordinal passes assign).'
      : ` — **not the same**: only in the data ${onlyData.map((id) => `\`${id}\``).join(', ') || '—'}; only from the creator ${onlyCreator.map((id) => `\`${id}\``).join(', ') || '—'}; differing ${differing.map((id) => `\`${id}\``).join(', ') || '—'}.`));
  p();
  p('Each record carries `source.url` = the whole-volume PDF for a volume source and `null` for the 2012 index (spec 2a §4), the');
  p('fixture\'s `retrieved` date, `source.shelf` `aas/{year}`, and `acta.part` `"I"` for 1917.');
  p();
  p(`| Category | ${sampleKeys.join(' | ')} | Total |`);
  p(`|---|${sampleKeys.map(() => '---').join('|')}|---|`);
  const cats = [...new Set(creation.created.map((c) => catId(c.entry)))];
  for (const c of ACTA_CATEGORIES.filter((c) => cats.includes(c.id))) {
    const ns = sampleKeys.map((k) => creation.created.filter((x) => sourceKeyOf(x.entry) === k && catId(x.entry) === c.id).length);
    p(`| ${c.id} | ${ns.join(' | ')} | ${ns.reduce((a, b) => a + b, 0)} |`);
  }
  const ns = sampleKeys.map((k) => creation.created.filter((x) => sourceKeyOf(x.entry) === k).length);
  p(`| **Total** | ${ns.map((n) => `**${n}**`).join(' | ')} | **${ns.reduce((a, b) => a + b, 0)}** |`);
  p();
  const byClass = new Map<string, number>();
  for (const c of creation.created) byClass.set(cls({ genre: c.record.genre, characteristics: c.record.characteristics ?? [] }), (byClass.get(cls({ genre: c.record.genre, characteristics: c.record.characteristics ?? [] })) ?? 0) + 1);
  p('By class: ' + [...byClass].sort().map(([k, n]) => `${k} ${n}`).join('; ') + '. Provisional (no incipit read): '
    + creation.created.filter((c) => c.record.idStatus === 'provisional').length + '.');
  p();
  const constitutions = creation.created.filter((c) => c.record.characteristics?.includes('apostolic-constitution'));
  const spec = constitutions.filter((c) => /conditur|erigitur|dismembrat|extollitur|constituitur|evehitur|attollitur/.test(c.record.title));
  p(`**Circumscription material.** Of the ${constitutions.length} AAS-born constitutions of the sample, the index describes ${spec.length} with an erection or elevation`);
  p('verb (*conditur*, *erigitur*, *constituitur*, *dismembrato*, *evehitur*, *attollitur*, *extollitur*); none carries `keywords` or `actKind` (spec 2a §4).');
  p();
  p('### Shelf ids re-minted by densification');
  p();
  const copies = docs.map((d) => ({ ...d }));
  assignProvisionalOrdinals(copies);
  const changed = copies.map((c, i) => [docs[i]!.id, c.id] as const).filter(([a, b]) => a !== b);
  const shared = bornInDataAll.filter((b) => b.idStatus === 'provisional'
    && docs.some((d) => d.idStatus === 'provisional' && bareProvisionalId(d.id) === bareProvisionalId(b.id)));
  if (changed.length === 0 && shared.length === 0) {
    p('**None.** No AAS-only provisional record shares an ordinal group (issuer, genre, date) with a shelf provisional record, and');
    p('the shelf\'s ordinals are what a pass over the shelf records alone assigns; no minted shelf id gained a full-date suffix.');
  } else {
    p('| Shelf id in the data | Without the AAS-only records |');
    p('|---|---|');
    for (const [a, b] of changed) p(`| \`${a}\` | \`${b}\` |`);
    if (shared.length) p('\nAAS-only records sharing an ordinal group with a shelf record: ' + shared.map((d) => `\`${d.id}\``).join(', ') + '.');
  }
  p();
  p('### Every created record, with the index line it rests on');
  p();
  for (const k of sampleKeys) {
    const cs = creation.created.filter((c) => sourceKeyOf(c.entry) === k);
    if (cs.length === 0) continue;
    p(`<details><summary><b>${k}</b> — ${cs.length} created</summary>`);
    p();
    p('| Reference | Category | Id | Title | Index line | Note |');
    p('|---|---|---|---|---|---|');
    for (const c of cs) {
      p(`| ${cite(c.entry)} | ${catId(c.entry)} | \`${dataIdOf(c.record)}\`${c.record.idStatus === 'provisional' ? ' †' : ''} | ${md(c.record.title)} | \`${md(c.entry.raw).replace(/`/g, '\'')}\` | ${md(c.notes.join('; '))} |`);
    }
    p();
    p('</details>');
    p();
  }
  p('† A provisional id (no incipit read from the index); the id is as the data carries it, after the collision and ordinal passes.');
  p();
}

// 9. Held
p('## 9. Held');
p();
const HOLD_LABELS: Record<HoldReason, string> = {
  'not-created-category': 'Category not created from the Acta',
  'shelf-not-harvested': 'Shelf not harvested for the pope',
  'pope-not-harvested': 'Pope not harvested',
  'date-before-pontificate': 'Date before the pontificate',
  'ambiguous': 'Ambiguous (§5)',
  'claimed-twice': 'Claimed twice (§5)',
  'unresolvable-date': 'Unresolvable date (month-only)',
  'curated': 'Curated hold (ACTA_HOLDS)',
  'class-mismatch': 'Guard: class mismatch',
  'possible-identity': 'Guard: possible identity',
  'near-miss': 'Guard: near-miss',
  'same-incipit-elsewhere': 'Guard: same incipit elsewhere',
  'id-collision': 'Id collision',
  'ocr-damaged': 'OCR-damaged incipit or toponym',
};
{
  const byReason = new Map<HoldReason, ActaHoldRow[]>();
  for (const h of creation.held) byReason.set(h.reason, [...(byReason.get(h.reason) ?? []), h]);
  p('| Reason | Held | Of which per source |');
  p('|---|---|---|');
  for (const reason of Object.keys(HOLD_LABELS) as HoldReason[]) {
    const hs = byReason.get(reason) ?? [];
    if (hs.length === 0) continue;
    const per = new Map<string, number>();
    for (const h of hs) per.set(sourceKeyOf(h.entry), (per.get(sourceKeyOf(h.entry)) ?? 0) + 1);
    p(`| ${HOLD_LABELS[reason]} | ${hs.length} | ${[...per].map(([k, n]) => `${k} ${n}`).join('; ')} |`);
  }
  p(`| **Total** | **${creation.held.length}** | |`);
  p();
  for (const reason of Object.keys(HOLD_LABELS) as HoldReason[]) {
    const hs = byReason.get(reason) ?? [];
    if (hs.length === 0) continue;
    p(`<details><summary><b>${HOLD_LABELS[reason]}</b> — ${hs.length}</summary>`);
    p();
    p('| Reference | Pope | Date | Category | Entry | Candidates | Note |');
    p('|---|---|---|---|---|---|---|');
    for (const h of hs) {
      p(`| ${cite(h.entry)} | ${h.entry.pope} | ${h.entry.date} | ${catId(h.entry)} | ${label(h.entry)} | ${h.candidates.length ? candidateList(h.candidates) : '—'} | ${md(h.note)} |`);
    }
    p();
    p('</details>');
    p();
  }
}

// 10. Before and after
p('## 10. Documents before and after');
p();
p('The shelf records (before) and the shelf records with every AAS-only document the data carries (after), per pope of the');
p('sample and in total; the phase-2a records of 2015–2024 are in the *after* column too, so the totals are the registry\'s.');
p();
p('| Issuer | Shelf records | AAS-only records | Of which from the sample | After |');
p('|---|---|---|---|---|');
{
  const issuers = [...new Set([...ACTA_POPES.map((x) => x.issuerId)])];
  let tb = 0, ta = 0, ts = 0;
  for (const issuer of issuers) {
    const before = docs.filter((d) => d.issuerId === issuer).length;
    const born = bornInDataAll.filter((d) => d.issuerId === issuer).length;
    const fromSample = bornInData.filter((d) => d.issuerId === issuer).length;
    if (before + born === 0) continue;
    tb += before; ta += born; ts += fromSample;
    p(`| \`${issuer}\` | ${before} | ${born} | ${fromSample} | ${before + born} |`);
  }
  p(`| **Popes of the AAS** | **${tb}** | **${ta}** | **${ts}** | **${tb + ta}** |`);
  p(`| **Registry** | **${docs.length}** | **${bornInDataAll.length}** | **${bornInData.length}** | **${allDocs.length}** |`);
}
p();

// 11. Docs without entries
p('## 11. Documents of the sample\'s popes with no AAS entry');
p();
p('Harvested shelf documents of each source\'s popes dated in the volume year that carry no `acta`, per genre class; the');
p('formal genres are listed. A December act belongs to the next volume; an act the cropped columns of 1909 and 1917 cannot');
p('cite is in §3; a class the index files under a category the registry does not attempt (*Epistulae* for a pope whose');
p('letters shelf is not harvested, homilies, allocutions) is counted in §3.');
p();
const FORMAL = new Set(['encyclical', 'apostolic-exhortation', 'papal-bull', 'apostolic-letter']);
const entriesByDate = new Map<string, ActaEntry[]>();
for (const e of entries) entriesByDate.set(e.date, [...(entriesByDate.get(e.date) ?? []), e]);
for (const s of SAMPLE) {
  const ds = docsWithoutEntry(s.key);
  const byGenre = new Map<string, number>();
  for (const d of ds) byGenre.set(cls({ genre: d.genre, characteristics: d.characteristics ?? [] }), (byGenre.get(cls({ genre: d.genre, characteristics: d.characteristics ?? [] })) ?? 0) + 1);
  p(`<details><summary><b>${s.key}</b> — ${ds.length} without an entry (${[...byGenre].sort((a, b) => b[1] - a[1]).map(([k, n]) => `${k} ${n}`).join('; ') || '—'})</summary>`);
  p();
  p('| Document | Date | Class | Index entries on this date | Reading |');
  p('|---|---|---|---|---|');
  for (const d of ds.filter((d) => FORMAL.has(d.genre ?? '')).sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1)) {
    const same = entriesByDate.get(d.date) ?? [];
    const sameTxt = same.length ? same.map((e) => `${catId(e)} (${cite(e)}: ${label(e)})`).join('; ') : '—';
    const monthOnly = entries.filter((e) => isMonthOnly(e) && d.date.startsWith(e.date) && e.pope !== undefined && POPE_ISSUERS[e.pope] === d.issuerId);
    let reading: string;
    if (d.date.slice(5, 7) === '12') reading = 'December: the next volume';
    else if (same.some((e) => result.ambiguous.some((a) => a.entry === e && a.candidates.some((c) => c.id === d.id)))) reading = 'ambiguous (§5)';
    else if (same.some((e) => result.conflicts.some((c) => c.documentId === d.id))) reading = 'claimed twice (§5)';
    else if (same.some((e) => harvestedness(e) === 'no')) reading = `the index files the act of this date under ${same.filter((e) => harvestedness(e) === 'no').map(catId).join(', ')}, not harvested`;
    else if (same.length) reading = 'class mismatch or another act of the date (§6)';
    else if (monthOnly.length) reading = `a month-only entry of ${monthOnly[0]!.date} may be it (${monthOnly.map((e) => `${cite(e)}: ${label(e)}`).join('; ')})`;
    else if ((parsedAll.get(s.key)?.defects ?? []).some((x) => x.message.includes('without a page number'))) reading = 'no dated entry: possibly among the entries without a page (§3), or not in this volume';
    else reading = 'no index entry on this date';
    p(`| \`${d.id}\` | ${d.date} | ${cls({ genre: d.genre, characteristics: d.characteristics ?? [] })} | ${md(sameTxt)} | ${md(reading)} |`);
  }
  p();
  p('</details>');
  p();
}

// 12. Every match
p('## 12. Every match, with the index line it rests on');
p();
for (const k of sampleKeys) {
  const ms = result.matches.filter((m) => sourceKeyOf(m.entry) === k);
  p(`<details><summary><b>${k}</b> — ${ms.length} matched</summary>`);
  p();
  p('| Reference | Category | Document | By | Index line |');
  p('|---|---|---|---|---|');
  for (const m of ms) p(`| ${cite(m.entry)} | ${catId(m.entry)} | \`${m.documentId}\` | ${m.by} | \`${md(m.entry.raw).replace(/`/g, '\'')}\` |`);
  p();
  p('</details>');
  p();
}

// 13. Non-harvested counts and the #27 evidence
p('## 13. Non-harvested categories, and the evidence for #27');
p();
p(`| Category | Registry | ${sampleKeys.join(' | ')} | Total |`);
p(`|---|---|${sampleKeys.map(() => '---').join('|')}|---|`);
for (const c of ACTA_CATEGORIES.filter((c) => c.harvested === 'no' || c.id === 'Nuntii radiophonici')) {
  const ns = sampleKeys.map((k) => entriesOf(k).filter((e) => cat(e)?.id === c.id).length);
  if (ns.every((n) => n === 0)) continue;
  p(`| ${c.id} | ${c.classes.length ? c.classes.map((k) => `\`${k.genre}\``).join(', ') : '—'} | ${ns.join(' | ')} | ${ns.reduce((a, b) => a + b, 0)} |`);
}
p();
{
  const radio = entries.filter((e) => cat(e)?.id === 'Nuntii radiophonici');
  const matchedRadio = result.matches.filter((m) => cat(m.entry)?.id === 'Nuntii radiophonici');
  p(`The sample prints ${radio.length} radio (and radio-television) messages under *Nuntii radiophonici* and its variants, from *Qui arcano Dei*`);
  p(`(12 February 1931, the first) on; ${matchedRadio.length} matched harvested *Urbi et Orbi* records (${matchedRadio.map((m) => `\`${m.documentId}\``).join(', ')}). That is the`);
  p('count #27 asks for (`medium: radio`), recorded here and applied nowhere: no AAS-born record carries `medium`.');
}
p();
process.stdout.write(out.join('\n') + '\n');
void POPES;
