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
import { ACTA_SOURCES, loadActaIndexes, withinNoHeadingSpan } from './src/acta/join.js';
import { matchActa, POPE_ISSUERS } from './src/acta/match.js';
import { createFromActa, isActaShelf } from './src/acta/create.js';
import { ACTA_CATEGORIES } from './src/acta/categories.js';
import { ASS_READINGS, ACTA_MATCH_OVERRIDES, ASS_PAGE_OFFSETS } from './src/acta/curation.js';
import { POPES } from './src/mappings/pontiffs.js';
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
 * The era's pope and the others its volumes happen to print. A volume whose fascicles run past
 * a pope's death carries two -- ASS 36, Leo XIII to 20 July 1903 and Pius X after -- and a
 * volume printed wholly after one carries only the successor, which is why the era is named
 * for whoever most of its entries belong to and the rest are named beside him. Which volume
 * does which is read from the scans below (`twoPopeVolumes`, `otherPopeVolumes`) and never
 * listed here: the generator serves 2c-ii-b, -c and -d and must not be typed for one.
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
/** Volumes of the era none of whose entries are the era pope's -- ASS 11 is Leo XIII's alone. */
const otherPopeVolumes = sources
  .map((s) => ({ volume: s.volume, popes: [...new Set(scans.get(s.key)!.entries.map((e) => e.pope))] }))
  .filter((v) => v.popes.length > 0 && !v.popes.includes(eraPope));
/**
 * Whether the other popes' months fall before or after the era pope's. The subtitle said
 * "last months" for every era, which is false where the volumes run into a new pontificate
 * (ASS 11 prints Leo XIII's first months; ASS 36 Leo XIII's last). Read from the dates, and
 * only from the dates the scanner could read.
 */
const datesOf = (pope: string) => entries.filter((e) => e.pope === pope && !e.date.startsWith('????')).map((e) => e.date).sort();
const alsoWhen = alsoPopes.length === 0 ? ''
  : ((datesOf(alsoPopes[0]!)[0] ?? '') > (datesOf(eraPope).at(-1) ?? '') ? 'first' : 'last');
/** The volumes still unjoined, split as spec §10 splits the eras: Pius IX 1-11, Leo XIII 12-35. */
const joined = ACTA_SOURCES.filter((s) => s.kind === 'ass').map((s) => s.volume);
const leftIn = (lo: number, hi: number) => [...Array(hi - lo + 1).keys()].map((i) => i + lo).filter((v) => !joined.includes(v));
const inYears = (d: DocumentRecord, lo: number, hi: number) => d.date >= `${lo}-01-01` && d.date <= `${hi}-12-31`;

/**
 * The shelf the era's join could reach at all: every issuer with a record dated in the years
 * the volumes print, and how many of those records now carry a reference into them. This is
 * the ceiling, and where the shelf is thin it, and not the scanner, is what the yield hits.
 */
const citedIds = new Set(cited.map((d) => d.id));
const shelfInYears = docs.filter((d) => inYears(d, firstYear, lastYear));
const shelfIssuers = [...new Set(shelfInYears.map((d) => d.issuerId))]
  .sort((a, b) => shelfInYears.filter((d) => d.issuerId === b).length - shelfInYears.filter((d) => d.issuerId === a).length);
const shelfOf = (issuer: string, year?: number) =>
  shelfInYears.filter((d) => d.issuerId === issuer && (year === undefined || d.date.startsWith(String(year))));
const eraYears = [...Array(lastYear - firstYear + 1).keys()].map((i) => i + firstYear);
const citedInYears = shelfInYears.filter((d) => citedIds.has(d.id)).length;
/** The popes of the era's volumes whom vatican.va publishes as one flat list, with no shelves. */
const flatIssuers = shelfIssuers.filter((i) => POPES.find((x) => x.issuerId === i)?.era === 'flat');
const recordsOf = (issuer: string) => docs.filter((d) => d.issuerId === issuer).length;

/**
 * The summa's unclaimed rows, grouped by what the scan did at the row's page -- the honest
 * reading of a number that otherwise looks like a count of missed acts. The groups are
 * exclusive and in this order: a row whose page is beyond the volume's last page is no page
 * at all (the summa wrapped the row and its last token is the act's year); then a defect
 * standing on that very page; then a page inside a `no-heading` span, by the loader's own
 * rule (withinNoHeadingSpan, join.ts), where the act lies between the heading the scanner
 * could not find and the dateline it keyed the defect to; then the rows it never reached.
 */
type UnclaimedGroup = 'not a page' | 'a defect on the page' | 'inside a no-heading span' | 'never reached';
const UNCLAIMED_GROUPS: readonly UnclaimedGroup[] = ['a defect on the page', 'inside a no-heading span', 'not a page', 'never reached'];
const unclaimedRows = sources.flatMap((s) => {
  const sc = scans.get(s.key)!;
  const read = new Set((parsed.get(s.key)!.entries as AssEntry[]).filter((e) => e.anchor === 'reading').map((e) => e.page));
  return sc.summa.unclaimed.map((r) => ({
    volume: s.volume,
    page: r.page,
    group: (r.page > sc.pages ? 'not a page'
      : sc.defects.some((d) => d.page === r.page) ? 'a defect on the page'
        : withinNoHeadingSpan(sc, r.page) ? 'inside a no-heading span'
          : 'never reached') as UnclaimedGroup,
    reading: read.has(r.page),
  }));
});
const unclaimedIn = (g: UnclaimedGroup, volume?: number) =>
  unclaimedRows.filter((r) => r.group === g && (volume === undefined || r.volume === volume));
/** The reasons the scanner printed at the pages of the rows in the first group. */
const defectReasonsAtRows = [...sources.flatMap((s) => {
  const sc = scans.get(s.key)!;
  return sc.summa.unclaimed.flatMap((r) => sc.defects.filter((d) => d.page === r.page && r.page <= sc.pages).map((d) => d.reason));
}).reduce((m, r) => m.set(r, (m.get(r) ?? 0) + 1), new Map<string, number>())].sort();

/** Volumes of the era whose summa the parser finds no papal part in: their check is blind. */
const blindVolumes = sources.filter((s) => scans.get(s.key)!.summa.rows.length === 0).map((s) => s.volume);
/** The curated page-offset ranges of the era's volumes, and what falls inside them. */
const offsetVolumes = sources.filter((s) => ASS_PAGE_OFFSETS[s.volume] !== undefined).map((s) => {
  const sc = scans.get(s.key)!;
  const ranges = ASS_PAGE_OFFSETS[s.volume]!;
  const inside = (page: number) => ranges.some((o) => page >= o.from && page <= o.to);
  return {
    volume: s.volume, ranges,
    entries: (parsed.get(s.key)!.entries as AssEntry[]).filter((e) => inside(e.page)).map((e) => e.page),
    references: cited.filter((d) => d.acta!.volume === s.volume && inside(d.acta!.page)).map((d) => d.acta!.page),
    unclaimed: sc.summa.unclaimed.filter((r) => inside(r.page)).map((r) => r.page),
  };
});

/**
 * The acts a volume reprints from an earlier pontificate or an earlier decade -- as against
 * the acts it is simply late with. A volume's fascicles run from mid-year to mid-year and the
 * gazette ran behind: ASS 2 (1867) prints the acts of 1866 as a matter of course and ASS 39
 * (1906) a whole run of 1904. Two years is therefore the ordinary lag and the threshold here;
 * an act older than that is one the volume did not first publish, and the join cites it at the
 * volume that reprints it, with the act's own date. `lags` is printed beside the list so the
 * threshold can be judged against what the era's volumes actually do.
 */
const lagOf = (e: AssEntry) => sources.find((s) => s.volume === e.volume)!.year - Number(e.date.slice(0, 4));
const lags = entries.filter((e) => !e.date.startsWith('????')).map(lagOf).sort((a, b) => a - b);
const medianLag = lags.length === 0 ? 0 : lags[Math.floor(lags.length / 2)]!;
const reprinted = entries.filter((e) => !e.date.startsWith('????') && lagOf(e) > 2);
/** Entries the matcher never attempted, their category being one the registry does not harvest. */
const skippedEntries = result.skipped as AssEntry[];
const skippedWithRecord = skippedEntries.filter((e) => docs.some((d) => d.issuerId === POPE_ISSUERS[e.pope] && d.date === e.date));
/** Unmatched entries the pope has a record for on the day: the near-misses the class rule refused. */
const nearMisses = result.unmatched.filter((u) => u.sameDate.length > 0);
const gap = docs.filter((d) => inYears(d, firstYear, lastYear) && d.acta === undefined);
const gapWithEntry = gap.filter((d) => entries.some((e) => e.date === d.date && POPE_ISSUERS[e.pope] === d.issuerId));

/**
 * What the series as a whole leaves behind, for the phase that takes the reverse gap on: the
 * years every joined volume prints, and the shelf records of those years carrying no reference
 * of either series. Computed over every ASS source, not over this era's range.
 */
const seriesSources = ACTA_SOURCES.filter((s) => s.kind === 'ass');
const seriesYears = seriesSources.flatMap((s) => [s.year, s.yearTo ?? s.year]);
const [seriesFrom, seriesTo] = [Math.min(...seriesYears), Math.max(...seriesYears)];
const seriesShelf = docs.filter((d) => inYears(d, seriesFrom, seriesTo));
const seriesGap = seriesShelf.filter((d) => d.acta === undefined);
const seriesRefs = allDocs.filter((d) => d.acta?.series === 'ASS').length;
const seriesIssuers = [...new Set(seriesShelf.map((d) => d.issuerId))]
  .sort((a, b) => seriesGap.filter((d) => d.issuerId === b).length - seriesGap.filter((d) => d.issuerId === a).length);

p(`# The *Acta Sanctae Sedis* under ${eraPope} (ASS ${from}–${to}${alsoPopes.length ? `, with ${alsoPopes.join(' and ')}'s ${alsoWhen} months` : ''})`);
p();
p(`Generated by \`tools/ass-era-report.ts ${from}-${to}\` on ${GENERATED_ON} from \`data/documents/\`, the entries and summa fixtures in \`tools/fixtures/acta/\` (scanned ${GENERATED_ON}; each volume's retrieval date is in \`tools/fixtures/acta/README.md\`), and the curated rows of \`tools/src/acta/curation.ts\`. The tables are computed; the prose of §1 is written against them.`);
p();

p('## 1. Reading');
p();
p(`1. **${sources.length} volumes, ${entries.length} entries, ${result.matches.length} references — ${pct(result.matches.length, entries.length)} of what the scanner read now cites the shelf.** ${sum((s) => s.summa.claimed.length)} of ${sum((s) => s.summa.rows.length)} summa rows claimed (${pct(sum((s) => s.summa.claimed.length), sum((s) => s.summa.rows.length))}), and **${cited.length} documents** now carry a reference into these volumes (§4). Per volume: ${sources.map((s) => `ASS ${s.volume} ${cited.filter((d) => d.acta!.volume === s.volume).length}`).join(', ')}.${sampledHere.length === 0 ? '' : ` Of these volumes ${sampledHere.map((v) => `ASS ${v}`).join(' and ')} ${sampledHere.length === 1 ? 'was' : 'were'} joined by phase 2c-i, one volume a decade, and ${sampledHere.length === 1 ? 'carries' : 'carry'} ${sampledRefs} of the references above; the ${sources.length - sampledHere.length} the era itself added carry ${cited.length - sampledRefs}.`}`);
p(`2. **The yield is not spread evenly, and the reason is the shelf rather than the scan.** ASS ${topVolume} alone carries ${Math.max(...sources.map((s) => cited.filter((d) => d.acta!.volume === s.volume).length))} of the ${cited.length}${twoPopeVolumes.length === 0 && otherPopeVolumes.length === 0 ? '.' : `. The era's volumes do not divide by pontificate: ${twoPopeVolumes.length === 0 ? '' : `${twoPopeVolumes.map((v) => `ASS ${v.volume} prints ${v.popes.join(' and ')}`).join('; ')}`}${twoPopeVolumes.length > 0 && otherPopeVolumes.length > 0 ? ', and ' : ''}${otherPopeVolumes.length === 0 ? '' : `${otherPopeVolumes.map((v) => `ASS ${v.volume} prints no act of ${eraPope} at all (${v.popes.join(' and ')})`).join('; ')}`} -- a volume's fascicles run past its title year and past a death. So the ${cited.length} references are not all ${eraPope}'s: by issuer they are ${[...new Set(cited.map((d) => d.issuerId))].sort().map((i) => `\`${i}\` ${cited.filter((d) => d.issuerId === i).length}`).join(', ')}.`}`);
p(`3. **${result.matches.length} matched, ${result.ambiguous.length} ambiguous, ${creation.held.length} held.** ${byRule('unique')} matched by the unique rule — one shelf record of the pope, the class and the day — ${byRule('opening')} by the opening rule and ${byRule('curated')} by a curated override (\`ACTA_MATCH_OVERRIDES\`). **No ambiguity survives the curation round** (§5), and the series' totals for ambiguity and double claiming stand where they did before this era joined: it introduced none.`);
p(`4. **${creation.held.length} entries held, ${heldNotCreated} of them \`series-not-created\`${heldOther.length === 0 ? '' : ` and ${heldOther.map(([r, n]) => `${n} \`${r}\``).join(', ')}`}${breviaHeld === 0 ? '' : '; the largest single group is the brevia'}.** The creator writes no document from the ASS at all (spec decision 1: the series is joined, never created), so an entry with no shelf record is held \`series-not-created\`${heldOther.length === 0 ? '' : ', and the rest for the reason named'}.${breviaHeld === 0 ? '' : ` **${breviaHeld} of the ${creation.held.length} holds are briefs**, from ${breviaVolumes.map((v) => `ASS ${v}`).join(', ')}. `
  + `${briefsShelf === 0 ? `${eraPope} has no briefs shelf at all (\`pontiffs.ts\`), so every brief these volumes print is held for want of one.` : `${eraPope}'s briefs shelf holds ${briefsShelf} records, and that is the whole of what ${breviaHeld} printed brevia can match against: the shelf is thin, not absent.`} `
  + `Either way the gap is the registry's and not the scanner's -- the act is printed, read, dated and quoted here, and no shelf has carried it.`}`);
p(`5. **${readings.length} curated reading${readings.length === 1 ? '' : 's'} and ${overrides.length} match override${overrides.length === 1 ? '' : 's'} -- the curation round.** ${readings.length + overrides.length} rows for ${entries.length} entries, the parser of 2c-ii-a having already been taught what the series prints. §5 quotes each, with the finding it answers and the lines it rests on. Where a shape recurred across volumes the round wrote a rule and measured it over all 41 volumes before accepting it; the phase's own commits say which.`);
p(`6. **The reverse gap is ${gap.length} documents of ${firstYear}–${lastYear}.** The shelf records of the era's years that still carry no reference of either series (§6.2). ${gapWithEntry.length} of them have an entry of the same issuer and date in these very volumes, and each is refused for a reason the tables print: ${nearMisses.filter((u) => gap.some((d) => u.sameDate.some((c) => c.id === d.id))).length} where the volume's class heading and the registry's genre disagree (§3.2 names the record beside the entry), ${skippedWithRecord.filter((e) => gap.some((d) => d.date === e.date && d.issuerId === POPE_ISSUERS[e.pope])).length} in a category the registry does not harvest (${[...new Set(skippedEntries.map((e) => e.category))].sort().join(', ')}: skipped before the class rule is ever asked). The other ${gap.length - gapWithEntry.length} the gazette did not print on their day at all: the ASS published the Holy See's acts selectively, and what the shelf holds and what the gazette printed are two different collections.`);
p(`7. **The shelf is the ceiling, and §6.1 counts it.** The registry holds ${shelfInYears.length} records dated ${firstYear}–${lastYear} against the ${entries.length} entries the scanner read, and ${citedInYears} of them now carry a reference: ${shelfIssuers.map((i) => `\`${i}\` ${shelfOf(i).length}, ${shelfOf(i).filter((d) => citedIds.has(d.id)).length} cited`).join('; ')}.${flatIssuers.length === 0 ? '' : ` ${flatIssuers.map((i) => `\`${i}\` is a flat-era pope (pontiffs.ts: \`era: 'flat'\`, no shelves), so all ${recordsOf(i)} of his records carry \`source.shelf: null\` and the class the join matches on is the genre alone`).join('; ')}.`}${eraIssuer === undefined || eraYears.filter((y) => shelfOf(eraIssuer, y).length === 0).length === 0 ? '' : ` ${eraYears.filter((y) => shelfOf(eraIssuer!, y).length === 0).map(String).join(', ')} hold no record of \`${eraIssuer}\` at all, so no volume of those years can match one of his however well it is read.`}${cited.length - citedInYears === 0 ? '' : ` ${cited.length - citedInYears} of the ${cited.length} references is on a record dated outside the era's years: the volumes reprint older acts (finding 10).`}`);
p(`8. **The ${unclaimedRows.length} unclaimed summa rows are not ${unclaimedRows.length} acts the scanner missed.** Grouped by what the scan did at the row's page (§2.2): ${UNCLAIMED_GROUPS.map((g) => `${unclaimedIn(g).length} ${g}`).join(', ')}. The ${unclaimedIn('a defect on the page').length} the scanner reached and refused with a printed reason (${defectReasonsAtRows.map(([r, n]) => `${r} ${n}`).join(', ')}${defectReasonsAtRows.reduce((a, [, n]) => a + n, 0) === unclaimedIn('a defect on the page').length ? '' : `; these sum to ${defectReasonsAtRows.reduce((a, [, n]) => a + n, 0)}, a page carrying two defects being counted under each`}); the ${unclaimedIn('inside a no-heading span').length} it found the act's closing dateline for and could not walk back to a heading from, so the defect is keyed to the dateline's page and the summa's row to the act's opening page; the ${unclaimedIn('not a page').length} name no act at all, the summa having wrapped the row so that its last token -- the act's year -- is read as its page. Only ${unclaimedIn('never reached').length} are rows the scan never reached, and ${unclaimedRows.filter((r) => r.reading).length} of the ${unclaimedRows.length} are answered by a curated reading (§5.1).`);
p(`9. **${blindVolumes.length === 0 ? 'Every volume of the era has a papal part its summa can be read for' : `${blindVolumes.length} volume${blindVolumes.length === 1 ? '' : 's'} of the era ${blindVolumes.length === 1 ? 'finds' : 'find'} no papal part in the summa, and there the completeness check is blind`}${blindVolumes.length === 0 ? '' : ` (${blindVolumes.map((v) => `ASS ${v}`).join(', ')}: 0 rows, every act reported as omitted)`}.** The summa is the check and not the source: a volume with no readable papal part still scans and still joins, and the count of what it omits is an artefact of the check rather than a statement about the volume.${offsetVolumes.length === 0 ? '' : ` ${offsetVolumes.map((o) => `ASS ${o.volume} carries the series' one genuine page offset (\`ASS_PAGE_OFFSETS\`: PDF pp. ${o.ranges.map((r) => `${r.from}–${r.to}`).join(', ')}, printing ${o.ranges.map((r) => (r.delta > 0 ? `+${r.delta}` : String(r.delta))).join('/')}), and today ${o.entries.length === 0 ? 'no entry opens inside it' : `${o.entries.length} entr${o.entries.length === 1 ? 'y opens' : 'ies open'} inside it (pp. ${o.entries.join(', ')})`} and ${o.references.length === 0 ? 'no reference cites a page in it' : `${o.references.length} reference${o.references.length === 1 ? '' : 's'} cites a page in it (pp. ${o.references.join(', ')})`}; ${o.unclaimed.length} of its unclaimed rows cite a printed page inside the range (${o.unclaimed.join(', ')}), which is where the offset is visible from the summa's side`).join('. ')}.`}`);
p(`10. **The volumes reprint acts of earlier years, and the join cites the act at the volume that reprints it.** ${reprinted.length === 0 ? 'No entry of this era is dated earlier than the year before its volume\'s first, so the class does not arise here.' : `${reprinted.length} entr${reprinted.length === 1 ? 'y is' : 'ies are'} dated more than two years before their volume's first year, two years being the gazette's own lag (the median entry of this era is ${medianLag} year${medianLag === 1 ? '' : 's'} older than its volume and ${lags.filter((l) => l === 1 || l === 2).length} stand at one or two) -- ${reprinted.slice(0, 12).map((e) => `${cite(e)}, ${e.date}`).join('; ')}${reprinted.length > 12 ? `, and ${reprinted.length - 12} more (§3.1 and §3.2 carry every date)` : ''} -- and ${reprinted.filter((e) => cited.some((d) => d.acta!.volume === e.volume && d.acta!.page === e.page)).length} of them carr${reprinted.filter((e) => cited.some((d) => d.acta!.volume === e.volume && d.acta!.page === e.page)).length === 1 ? 'ies' : 'y'} a reference today, with the act's own date and the reprinting volume's page.`} Whether that is the right citation of record for a reprint, or whether such an entry should be held, is the open question of [#56](https://github.com/CatholicOS/cmddr/issues/56); the reference written here states where the act is printed, which is all a gazette citation claims.`);
p(`11. **What 2c-iii inherits, this being the last era of 2c-ii.** ${leftIn(1, 41).length === 0 ? `All ${joined.length} volumes of the series are joined, and they have written ${seriesRefs} references between them.` : `${leftIn(1, 41).length} volumes of the 41 are still unjoined, and spec §10 splits them by pontificate: **${leftIn(12, 35).length}** of Leo XIII (ASS 12–35, the sampled excepted) and **${leftIn(1, 11).length}** of Pius IX (ASS 1–11, ASS 1 excepted).`} What is left is the reverse gap over the whole series: **${seriesGap.length} of the ${seriesShelf.length} shelf records dated ${seriesFrom}–${seriesTo} carry no reference of either series** -- ${seriesIssuers.map((i) => `\`${i}\` ${seriesGap.filter((d) => d.issuerId === i).length} of ${seriesShelf.filter((d) => d.issuerId === i).length}`).join(', ')}. That is not a scanning residue: it is the difference between what vatican.va shelves and what the gazette printed, and closing any of it means reading the volumes for acts the summa never listed.`);
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
/**
 * Notes a single volume earns, each gated on that volume being in the range and each
 * counting from that volume's own scan. The shape is ASS 38's, below: a volume the era had
 * to read for something the tables cannot say by themselves.
 */
const ass1 = scans.get('ass-1');
if (ass1) {
  p(`**ASS 1's summa finds no papal part, so its completeness check is vacuous.** ${ass1.summa.rows.length} rows, and the ${ass1.summa.omitted.length} act the scanner read by rule is reported as omitted for want of a row to claim it. The join sees ${(parsed.get('ass-1')!.entries as AssEntry[]).length} entries there, all ${(parsed.get('ass-1')!.entries as AssEntry[]).filter((e) => e.anchor === 'reading').length} of them curated readings -- one of which replaces the act the scanner read. It is the oldest volume of the series and the one whose spellings the rest of the era inherits.`);
  p();
}
const ass2 = scans.get('ass-2');
if (ass2) {
  p(`**The earliest volumes set V for U, and repairing it bought a complete reading rather than a reference.** ASS 1 and ASS 2 head their allocutions \`ALLOCVTIO\`, which \`HEADING_OCR\` (ass-headings.ts) now repairs; the rule was measured over all 41 volumes before it was accepted (phase 2c-ii-d, commit \`48bc42a\`) and its movement is confined to those two volumes, no running header opening an act. Not one reference came of it: all ${skippedEntries.filter((e) => e.category === 'ALLOCUTIO').length} allocutions the era's volumes print are skipped before the class rule is asked, \`Allocutiones\` being \`harvested: 'no'\` (categories.ts). The one-T half of the same ruling -- \`LITERAE\` and \`LITERAE APOSTOLICAE\` as class headings -- was measured the same way and rejected, reading no act anywhere in the series; the acts ASS 2 prints under a one-T spelling or under none are curated readings instead (§5.1), which is what the discipline prefers to a rule that fires for no gain.`);
  p();
}
const ass7 = scans.get('ass-7');
if (ass7) {
  p(`**ASS 7 has a papal part, and it is named for the manner of the acts rather than for the pope.** Its summa opens the pope's section \`EX ACTIS AD INSTAR CONSISTORIALIUM.\`, which \`DICASTERY_RE\` also matches, so the volume was reported as having none until this era taught \`PAPAL_HEAD_FORMS\` the one-volume form: the check now reads ${ass7.summa.rows.length} rows, ${ass7.summa.claimed.length} claimed and ${ass7.summa.unclaimed.length} unclaimed. The new check paid at once by naming what the store cannot hold: printed pp. 496–497 are absent from the store's PDF altogether (the evidence is quoted in \`ASS_PAGE_OFFSETS\`, curation.ts), so the act the summa lists at printed p. 496 opens on a page no scan of this file contains and no rule can ever reach it.`);
  p();
}
const ass8 = scans.get('ass-8');
if (ass8) {
  p(`**Two classes of act the reader cannot reach, both of them ASS 8's to show.** Of the rows the scan never reached there (§2.2), some were read in the store by hand and deliberately left uncurated. One class is the **reprint**: an act of an earlier pontificate or decade printed again years later, whose own closing dateline falls outside the volume's span -- and one of ASS 8's shows a limit of the reader rather than of the volume, \`DATUM_RE\` (ass.ts) matching only a dateline given at Rome, so a papal dateline given anywhere else is invisible to the scanner. The other class is the **act with no admissible key**: the summa's row cites a page the act does not open on, while the act's own page answers no finding of the scan, so a reading keyed there would be stale by the loader's own rule. Both classes, and the question of what a reprint's citation of record should be, are [#56](https://github.com/CatholicOS/cmddr/issues/56)'s.`);
  p();
}
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

p('### 2.2 Unclaimed summa rows, by what the scan did at the page');
p();
p('A row the volume\'s own summa prints and the scan claimed no act for. The groups are exclusive, computed per row from the scan alone, and the `no-heading` span is the loader\'s own (`withinNoHeadingSpan`, join.ts), the rule by which a curated reading is admitted at a page the defect is not keyed to.');
p();
p(`| Source | ${UNCLAIMED_GROUPS.join(' | ')} | Pages never reached |`);
p(`|---|${UNCLAIMED_GROUPS.map(() => '---').join('|')}|---|`);
for (const s of sources) {
  const never = unclaimedIn('never reached', s.volume).map((r) => r.page);
  p(`| ASS ${s.volume} | ${UNCLAIMED_GROUPS.map((g) => unclaimedIn(g, s.volume).length).join(' | ')} | ${never.length === 0 ? '—' : never.sort((a, b) => a - b).join(', ')} |`);
}
p(`| **total** | ${UNCLAIMED_GROUPS.map((g) => `**${unclaimedIn(g).length}**`).join(' | ')} | **${unclaimedIn('never reached').length}** |`);
p();
p(`Of the ${unclaimedRows.length} rows, ${unclaimedRows.filter((r) => r.reading).length} are answered by a curated reading at the same page (§5.1).${unclaimedIn('not a page').length === 0 ? '' : ` The ${unclaimedIn('not a page').length} of the third column cite no page of the volume at all -- their number is larger than the volume's last page (${sources.map((s) => `ASS ${s.volume} ${scans.get(s.key)!.pages}`).join(', ')}) -- the summa having wrapped the row so that the act's year stands where its page should.`}`);
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

p(`## 6. The shelf of ${firstYear}–${lastYear}: the ceiling, and the reverse gap`);
p();
p('### 6.1 What the shelf holds of the era\'s years, and what now cites the volumes');
p();
p(`| Year | ${shelfIssuers.map((i) => `\`${i}\``).join(' | ')} |`);
p(`|---|${shelfIssuers.map(() => '---').join('|')}|`);
for (const y of eraYears) {
  p(`| ${y} | ${shelfIssuers.map((i) => {
    const n = shelfOf(i, y);
    return n.length === 0 ? '—' : `${n.length} (${n.filter((d) => citedIds.has(d.id)).length} cited)`;
  }).join(' | ')} |`);
}
p(`| **total** | ${shelfIssuers.map((i) => `**${shelfOf(i).length}** (${shelfOf(i).filter((d) => citedIds.has(d.id)).length} cited)`).join(' | ')} |`);
p();
p(`A year with no record is a year no reading can reach: the join writes a reference on a record that exists, and mints none (spec decision 1). ${shelfInYears.length} records, ${citedInYears} of them cited, against the ${entries.length} entries the scanner read and the ${sum((s) => s.summa.rows.length)} rows the volumes' own summae list.`);
p();
p('### 6.2 Shelf documents with no reference (the reverse gap)');
p();
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
