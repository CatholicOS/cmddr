/**
 * The AAS join report (acta reference spec §4.4; AAS-only documents spec §6): what the
 * ten annual indexes 2015-2024 carry, what matched, what was created from the index for
 * the acts the shelves lack, what was held and why, and every entry and document that
 * did not match -- each classified. NEVER run by the harvest; it reads data/documents/ as
 * the harvest wrote it, re-runs the join and the creator over the shelf records alone
 * (the AAS-only records are set aside, so the report reproduces the harvest's decision
 * rather than matching the index against its own offspring), checks that what the
 * creator would create is what the data carries, and prints Markdown for
 * docs/superpowers/reports/. The beliefs it prints per unmatched entry are heuristics
 * named as such; the report's prose is where a human's reading goes.
 *
 * The join and the creator run over every source of ACTA_SOURCES, as the harvest does
 * (a document two sources' entries claim is a conflict either way); this report shows
 * the ten sources of 2015-2024, and tools/acta-volumes-report.ts the sample volumes of
 * phase 2b.
 *
 * Usage: npx tsx tools/acta-report.ts > docs/superpowers/reports/2026-09-12-acta-join-2015-2024.md
 */
import { readFileSync, readdirSync } from 'node:fs';
import { ACTA_YEARS, loadActaIndexes } from './src/acta/join.js';
import { matchActa, type ActaUnmatched, type ActaCandidate } from './src/acta/match.js';
import { createFromActa, isActaShelf, NOT_CREATED, type ActaHoldRow, type HoldReason } from './src/acta/create.js';
import { ACTA_CATEGORIES, categoryForHeading, type ActaCategory } from './src/acta/categories.js';
import { assignProvisionalOrdinals, bareProvisionalId } from './src/harvest/ordinals.js';
import type { ActaEntry } from './src/acta/index.js';
import { slugify } from './src/slug.js';
import type { DocumentRecord } from './src/types.js';

// Sorted by id: readdirSync's order is the platform's, and the report is a checked-in
// artefact whose candidate lists must not depend on it.
const allDocs = readdirSync('data/documents').filter((f) => f.endsWith('.json'))
  .flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[])
  .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
/** The shelf records: what the join and the creator see. */
const docs = allDocs.filter((d) => !isActaShelf(d.source?.shelf));
/** The records the harvest created from the index, as the data carries them. */
const bornInDataAll = allDocs.filter((d) => isActaShelf(d.source?.shelf));
const francis = docs.filter((d) => d.issuerId === 'rp:francis-i');
const { parsed: parsedAll, missing: missingAll } = loadActaIndexes();
const allEntries = [...parsedAll.values()].flatMap((p) => p.entries);
const resultAll = matchActa(allEntries, docs);
const creationAll = createFromActa(resultAll, docs);
// This report's scope: the ten index PDFs of 2015-2024.
const years = ACTA_YEARS.map(String).filter((y) => parsedAll.has(y));
const parsed = new Map(years.map((y) => [y, parsedAll.get(y)!]));
const missing = missingAll.filter((k) => ACTA_YEARS.map(String).includes(k));
const inScope = (e: ActaEntry): boolean => e.part === undefined && years.includes(String(e.year));
const entries = allEntries.filter(inScope);
const result = {
  matches: resultAll.matches.filter((m) => inScope(m.entry)),
  ambiguous: resultAll.ambiguous.filter((a) => inScope(a.entry)),
  unmatched: resultAll.unmatched.filter((u) => inScope(u.entry)),
  skipped: resultAll.skipped.filter(inScope),
  unknownPope: resultAll.unknownPope.filter(inScope),
  conflicts: resultAll.conflicts.filter((c) => c.entries.some(inScope)),
};
const creation = {
  created: creationAll.created.filter((c) => inScope(c.entry)),
  held: creationAll.held.filter((h) => inScope(h.entry)),
};
const bornInData = bornInDataAll.filter((d) => inScope({ year: d.acta!.year, part: d.acta!.part } as ActaEntry));

const cat = (e: ActaEntry): ActaCategory | null => categoryForHeading(e.category);
const catId = (e: ActaEntry) => cat(e)?.id ?? e.category;
// An unregistered heading is 'unknown', never silently 'no': matchActa skips such an entry,
// and the report must say so rather than count it among the categories not harvested.
const harvestedness = (e: ActaEntry): 'yes' | 'partly' | 'no' | 'unknown' => cat(e)?.harvested ?? 'unknown';
const unseenHeadings = new Map<string, number>();
for (const e of entries) if (cat(e) === null) unseenHeadings.set(e.category, (unseenHeadings.get(e.category) ?? 0) + 1);
const cite = (e: ActaEntry) => `AAS ${e.volume} (${e.year}) ${e.page}`;
const md = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' / ');
const cls = (c: ActaCandidate) => `${c.genre}${c.characteristics.length ? '+' + c.characteristics.join('+') : ''}`;
const label = (e: ActaEntry) => e.incipit !== null ? `*${md(e.incipit)}*` : e.toponym !== null ? `${md(e.toponym)}` : md(e.description.slice(0, 70));

const byDocId = new Map(docs.map((d) => [d.id, d]));
const matchedIds = new Set(result.matches.map((m) => m.documentId));
const entriesByDate = new Map<string, ActaEntry[]>();
for (const e of entries) entriesByDate.set(e.date, [...(entriesByDate.get(e.date) ?? []), e]);

const out: string[] = [];
const p = (s = '') => out.push(s);

/**
 * Hand-curated readings, keyed `${year}:${page}`, for the entries whose heuristic belief the
 * author checked against the act itself (vatican.va's document URL carries the act's date).
 * Each replaces the heuristic in the table; the heuristic stays for everything else.
 */
const READINGS: Readonly<Record<string, string>> = {
  // Phase 1 carried three more rows here -- De concordia inter Codices, Vultum Dei
  // quaerere, Episcopalis communio -- which now match: the first two by a curated index
  // correction (curation.ts), the third by the parser's day-less-date fix.
  '2017:697': '**shelf gap**: a second act with this incipit (the Myanmar nunciature, 4 May 2017); the shelf\'s *Quo firmiores* of 1 May 2013 (`mag:francis-i/quo-firmiores-2013`) erects the South Sudan nunciature, a different act -- held by the guard (§9, same incipit elsewhere) for the owner to release',
};

/** Francis documents whose printed incipit slugs equal to the entry's, on any date. */
const sameIncipit = (e: ActaEntry): DocumentRecord[] => {
  if (e.incipit === null) return [];
  const slug = slugify(e.incipit);
  return slug === '' ? [] : francis.filter((d) => d.incipit !== undefined && slugify(d.incipit) === slug);
};

/**
 * The heuristic belief for an unmatched entry of a harvested or partly harvested category.
 * The vocabulary: *shelf gap* (nothing of the date is harvested), *class mismatch* (the
 * shelf files the act under another class), *date discrepancy* (the act is harvested under
 * another date), *not harvested* (the class is out of scope today).
 */
function belief(u: ActaUnmatched): string {
  const e = u.entry;
  const c = cat(e)!;
  const curated = READINGS[`${e.year}:${e.page}`];
  if (curated !== undefined) return curated;
  if (e.date < '2013-03-13') return 'act of a previous pontificate printed in this volume; no Francis document can match';
  if (e.date.length === 7) return `**month-only date**: the index prints no day; ${u.sameDate.length ? `the shelf has ${u.sameDate.length} of the class in the month, none with this incipit` : 'nothing of the class in the month is harvested'}`;
  // A same-date document of the genre is the act filed under another class only if it
  // could be the same act: one that prints a different incipit is a different act.
  const sameGenre = u.sameDate.filter((d) => c.classes.some((k) => k.genre === d.genre)
    && !(e.incipit !== null && d.incipit !== undefined && slugify(d.incipit) !== slugify(e.incipit)));
  if (sameGenre.length) {
    return `**class mismatch**: the shelf files \`${sameGenre.map((d) => d.id).join('`, `')}\` as ${sameGenre.map(cls).join(', ')}; `
      + 'not matched by rule (spec §4.3), a filing difference to adjudicate';
  }
  const hint = c.id.startsWith('Nuntii') ? seriesHint(e.description) : null;
  // A message a day from a series message is the ordinary run of the calendar, not a
  // discrepancy; the near-miss is telling only where the entry reads as a series message.
  if (u.nearMisses.length && (!c.id.startsWith('Nuntii') || hint !== null)) {
    return `**date discrepancy (±1 day)**: \`${u.nearMisses.map((d) => `${d.id}\` (${d.date})`).join(', `')}; reported, never matched. `
      + 'Check the act\'s own dating formula before a DATE_CORRECTIONS row';
  }
  const elsewhere = sameIncipit(e);
  if (elsewhere.length) {
    return `**date discrepancy**: the shelf has this incipit as \`${elsewhere.map((d) => `${d.id}\` (${d.date})`).join(', `')}; `
      + 'the index\'s date is a ditto or a misprint, or the shelf\'s is -- check the act\'s own dating formula';
  }
  switch (c.id) {
    case 'Constitutiones Apostolicae':
      return '**shelf gap**: nothing of this date on apost_constitutions (a selection: 49 against the index\'s 117)';
    case 'Litterae Apostolicae':
      return '**shelf gap**: nothing of this date on apost_letters (a selection: 59 plain letters against the index\'s 206)';
    case 'Epistulae Apostolicae':
      return '**not harvested**: a letter to a named addressee, filed on the letters shelf (#4); nothing of this date is harvested';
    case 'Litterae Apostolicae Motu proprio datae':
      return '**shelf gap**: nothing of this date on motu_proprio or apost_letters';
    case 'Litterae Decretales':
      return '**shelf gap**: canonisation decretals are not on the bulls shelf, which holds only the two bulls of indiction';
    case 'Litterae Apostolicae sub plumbo datae':
      return '**shelf gap**: the sub plumbo cardinalatial-title erections of 2020 are on no harvested shelf';
    case 'Nuntii': case 'Nuntii televisifici': {
      return hint
        ? `**check**: reads as the ${hint} message, but no series document of this date is harvested -- the shelf's date against the index's`
        : '**not harvested**: an occasional message on the year-partitioned pont-messages shelf (#4)';
    }
    default:
      return '**shelf gap**: nothing of this date is harvested';
  }
}

/** `a-1, a-2, … a-7` collapses to `a-1…7` when every candidate differs only by its ordinal. */
function candidateList(cs: ActaCandidate[]): string {
  const m = cs.map((c) => c.id.match(/^(.*-\d{4}-\d{2}-\d{2})-(\d+)$/));
  if (cs.length > 3 && m.every((x) => x !== null) && new Set(m.map((x) => x![1])).size === 1) {
    return `the ${cs.length} provisional records \`${m[0]![1]}-${m[0]![2]}…${m[cs.length - 1]![2]}\``;
  }
  return cs.map((c) => `\`${c.id}\`${c.incipit ? ` (*${md(c.incipit)}*)` : ''}`).join(', ');
}

/** The annual series an entry's description names outright, by its *Dies Mundialis* (or *Quadragesima*, or *Urbi et Orbi*). */
function seriesHint(description: string): string | null {
  const day = /Di(?:e|ei|em|es) (?:Mundial|Internation)\w*/.test(description);
  const rules: [RegExp, string][] = [
    [/Pacis/, 'World Day of Peace'],
    [/Communication/, 'World Communications Day'],
    [/Migrant/, 'World Day of Migrants and Refugees'],
    [/Mission/, 'World Mission Day'],
    [/Infirm|Aegrot/, 'World Day of the Sick'],
    [/Vocation/, 'World Day of Prayer for Vocations'],
    [/Iuvenum/, 'World Youth Day'],
    [/Alimoni/, 'World Food Day'],
    [/Vitae Consecratae/, 'World Day for Consecrated Life'],
    [/Pauperum/, 'World Day of the Poor'],
    [/Avorum/, 'World Day for Grandparents and the Elderly'],
    [/Pueror/, 'World Children\'s Day'],
    [/creati/, 'World Day of Prayer for the Care of Creation'],
  ];
  if (/Quadragesim/.test(description)) return 'Lent';
  if (/Urbi et Orbi/.test(description)) return 'Urbi et Orbi';
  if (!day) return null;
  for (const [re, name] of rules) if (re.test(description)) return name;
  return null;
}

// ---------------------------------------------------------------------------------------
p('# The AAS join, 2015–2024: the phase-1 and phase-2a report');
p();
p('Generated by `npx tsx tools/acta-report.ts` from `data/documents/*.json` and `tools/fixtures/acta/` on 2026-09-12 — the');
p('deliverable of phase 1 of [#25](https://github.com/CatholicOS/cmddr/issues/25) as the');
p('[phase-1 spec](../specs/2026-09-12-acta-reference-design.md) §4.4 defines it, extended by phase 2a as the');
p('[AAS-only documents spec](../specs/2026-09-13-acta-only-documents-design.md) §6 defines it. Every entry of the *Acta Summi Pontificis* part of');
p('the *Index documentorum chronologico ordine digestus* of the ten annual *Index generalis* PDFs (`tools/fixtures/acta/README.md`');
p('records extractor and retrieval) is parsed (`tools/src/acta/index.ts`), classified (`categories.ts`) and matched to a harvested');
p('document by issuer, date and incipit (`match.ts`, with the curated index corrections of `curation.ts`). What matched is written');
p('as `document.acta`; what did not, in a category the registry creates from the *Acta*, becomes a document of its own unless a');
p('rule or the duplicate guard holds it (`create.ts`, §8 and §9); everything else is listed here. The report re-runs the join and');
p('the creator over the shelf records alone and checks the creator\'s output against the AAS-only records the data carries (§8).');
p('The *belief* printed beside each unmatched entry is the report script\'s heuristic; the reading in the prose is the author\'s.');
if (missing.length) p(`\n**Missing fixtures:** ${missing.join(', ')}.`);
p();
p('## 1. Headline');
p();
p('| Volume year | Parsed | In harvested categories | Matched | Ambiguous | Claimed twice | Unmatched (harvested) | Unmatched (partly harvested) | Created | Held | Non-harvested (counted) | Francis documents without an entry |');
p('|---|---|---|---|---|---|---|---|---|---|---|---|');
const totals = { parsed: 0, attempted: 0, matched: 0, ambiguous: 0, conflicts: 0, unY: 0, unP: 0, created: 0, held: 0, non: 0, without: 0 };
for (const y of years) {
  const es = parsed.get(y)!.entries;
  const attempted = es.filter((e) => harvestedness(e) === 'yes' || harvestedness(e) === 'partly');
  const matched = result.matches.filter((m) => String(m.entry.year) === y).length;
  const ambiguous = result.ambiguous.filter((a) => String(a.entry.year) === y).length;
  const conflicts = result.conflicts.filter((c) => c.entries.some((e) => String(e.year) === y)).length;
  const unY = result.unmatched.filter((u) => String(u.entry.year) === y && harvestedness(u.entry) === 'yes').length;
  const unP = result.unmatched.filter((u) => String(u.entry.year) === y && harvestedness(u.entry) === 'partly').length;
  const created = creation.created.filter((c) => String(c.entry.year) === y).length;
  const held = creation.held.filter((h) => String(h.entry.year) === y).length;
  const non = es.length - attempted.length;
  const without = francis.filter((d) => d.date.startsWith(y) && !d.acta).length;
  p(`| ${y} | ${es.length} | ${attempted.length} | ${matched} | ${ambiguous} | ${conflicts} | ${unY} | ${unP} | ${created} | ${held} | ${non} | ${without} |`);
  totals.parsed += es.length; totals.attempted += attempted.length; totals.matched += matched; totals.ambiguous += ambiguous;
  totals.conflicts += conflicts; totals.unY += unY; totals.unP += unP; totals.created += created; totals.held += held;
  totals.non += non; totals.without += without;
}
p(`| **Total** | **${totals.parsed}** | **${totals.attempted}** | **${totals.matched}** | **${totals.ambiguous}** | **${result.conflicts.length}** | **${totals.unY}** | **${totals.unP}** | **${totals.created}** | **${totals.held}** | **${totals.non}** | **${totals.without}** |`);
p();
p('*Claimed twice* counts documents two entries of the year both match (neither is written; §5; one pair spans 2021 and 2022,');
p('so the years sum to one more than the total). *Created* counts the AAS-only documents made from the year\'s entries (§8) and');
p('*Held* the entries in a harvested category that were neither matched nor created, with the reason (§9); the two sum, with');
p('*Matched*, to *In harvested categories* (a document claimed twice holds both its entries). *Francis documents without an');
p('entry* counts the harvested shelf documents dated in the volume year that carry no `acta` (§11); the December ones belong to the next');
p('volume, and 2024\'s December acts to the 2025 index, which does not exist yet.');
p();
const byHow = { unique: 0, incipit: 0, toponym: 0, curated: 0, 'incipit-month': 0 };
for (const m of result.matches) byHow[m.by]++;
const decretals = result.unmatched.filter((u) => catId(u.entry) === 'Litterae Decretales').length;
const nuntiiTotal = entries.filter((e) => catId(e).startsWith('Nuntii')).length;
const matchedMessages = result.matches.filter((m) => catId(m.entry).startsWith('Nuntii')).length;
p('### The reading');
p();
p(`1. **Where the join fires it is evidenced.** ${result.matches.length} matches: ${byHow.unique} the only candidate of the class on the`);
p(`   date, ${byHow.incipit} told apart by the incipit slug, ${byHow.toponym} by the toponym (no two constitutions of one date needed it), and`);
p(`   ${byHow.curated} by a curated override (\`curation.ts\`: *Finis et modus*, AAS 116 (2024) 189, which the class rule had sent to the`);
p('   decree of the same date because the letter it names is on apost_letters alone — a measured harm of the discussion #30');
p('   question). Every one rests on an index line quoted in §12,');
p('   and every Francis encyclical and exhortation of the ten volumes is among them. Nothing was written that the rules could not');
p('   evidence: the 40 ambiguous entries (§4) and the 12 documents two entries claim (§5) stay without a reference.');
p('2. **The Francis shelves are selections, and the index is the record.** The index names 117 apostolic constitutions and 206');
p('   apostolic letters over 2015–2024; vatican.va\'s apost_constitutions and apost_letters shelves carry 49 and 59 (plain) for the');
p('   same pontificate, and the *bulls* shelf none of the ' + decretals + ' canonisation decretals. Almost every unmatched entry of §6 is a');
p('   **shelf gap** of this kind, and every one prints an incipit, a date and a page: phase 2a made ' + creation.created.length + ' of them documents (§8)');
p('   and held ' + creation.held.length + ' with a reason (§9).');
p('3. **The index\'s chronology is not reliable at the ditto mark — and once it was the parser.** Two acts the shelf holds are');
p('   entered under the wrong month (*Vultum Dei quaerere* reads 29 July for 29 June; *De concordia inter Codices* 31 March for');
p('   31 May) and are matched by the curated corrections of `curation.ts`, each quoting the act\'s own dating formula. The third');
p('   phase-1 reading, *Episcopalis communio* at 15 May, was the parser\'s: the index prints `Sept. » Chengden.:` with no day two');
p('   entries before it, the line was skipped, and the ditto months after it inherited May. Read as printed, *Episcopalis communio*');
p('   is 15 September 2018 and *Prisrensis-Priscensis* 5 September 2018 (§3 still lists the day-less line as a defect).');
p('4. **The shelf truncates incipits; the index does not.** *Ad aptius consulendum* (2015-03-19) is *Ad aptius* on the shelf, and');
p('   *Ad aptius* (2015-12-18) is *Ad aptius consulendum* — the truncation runs both ways — and *Nos, qui successimus* is *Nos, qui*.');
p('   All three are ambiguous only for this reason (§4). The 25 Tarragona beatification letters of 13 October 2013, provisional on');
p('   the shelf because vatican.va prints no incipit for them, each have one in the index (*Spiritus Domini*, *Qui enim voluerit*,');
p('   …); telling the seven shelf records apart needs the documents\' own text, which is a RECOVERED_INCIPITS job for the owner.');
p(`5. **Messages need an occasion, not a date.** The index carries ${nuntiiTotal} *Nuntii* (video messages included) and ${matchedMessages}`);
p('   matched, among them the twenty Christmas and Easter *Urbi et Orbi* the index files as *Nuntius et Benedictio* (the one');
p('   category that maps to two registry classes, `message` and `urbi-et-orbi`). Where two *Nuntii* fall on the date of one series');
p('   message the match is withheld (§5), and two series messages on one date are ambiguous (§4, 8 December 2016): the entry\'s');
p('   description names the *Dies Mundialis* every time, so a series discriminator is the phase-2 rule to add — or the');
p('   pont-messages harvest (#4) first, which gives every occasional *Nuntius* a candidate.');
p('6. **Filing differences, not defects.** Three acts the index files as *Motu proprio datae* are on apost_letters only, so the');
p('   registry carries no `motu-proprio` characteristic and the class rule declines them (§6, discussion #30); the guard holds all');
p('   three (§9: one as a class mismatch by its title, two as possible identities of the incipit-less shelf records). The four');
p('   *sub plumbo* letters of 28 November 2020 (cardinalatial titles) are on no harvested shelf and are created as papal bulls,');
p('   provisional, from the index (§8). Whether the characteristic should follow the index is the owner\'s call; the matcher was');
p('   not loosened to decide it.');
p('7. **Source defects the parser sees** (§3): a constitution whose day is not printed (*Chengden.*, 2018) and one whose page is');
p('   not (*Ioinvillen.*, 2024) — both in a harvested category, both unrecoverable from the text layer — and OCR slips elsewhere');
p('   (a page split `76 4`, ditto marks read `? ?`, a page glued to a footnote digit). None is absorbed.');
{
  const born = creation.created;
  const byClass = new Map<string, number>();
  for (const c of born) {
    const k = `${c.record.genre}${c.record.characteristics?.length ? '+' + c.record.characteristics.join('+') : ''}`;
    byClass.set(k, (byClass.get(k) ?? 0) + 1);
  }
  const provisional = born.filter((c) => c.record.idStatus === 'provisional').length;
  const quoted = born.filter((c) => c.entry.quoted).length;
  const minted = born.length - provisional;
  const guard = creation.held.filter((h) => ['class-mismatch', 'possible-identity', 'near-miss', 'same-incipit-elsewhere', 'id-collision'].includes(h.reason)).length;
  p(`8. **The shelves\' gaps are now documents, and the guard held ${guard}.** ${born.length} AAS-only documents (§8): `
    + [...byClass].sort().map(([k, n]) => `${n} ${k}`).join(', ') + `; ${provisional} provisional (a constitution the index names`);
  p('   by toponym only), and the rest minted from the index\'s incipit exactly as a shelf incipit mints. None carries `incipitLang`:');
  p(`   the index wraps the beatification letters\' Latin incipits in guillemets as it does vernacular ones (${quoted} of the ${minted} minted`);
  p('   records are quoted), so the guillemets mark a quotation, not a language, and the shelf harvest sets the field nowhere (spec §4,');
  p('   corrected in PR #32).');
  const decretalHolds = creation.held.filter((h) => h.reason === 'possible-identity' && catId(h.entry) === 'Litterae Decretales');
  const decretalDates = new Set(decretalHolds.map((h) => h.entry.date)).size;
  p('   The guard is wider than the matcher on purpose: vatican.va files canonisation decretals on apost_letters as *Lettera');
  p('   Decretale* with no incipit, so *possible identity* looks at every incipit-less record of the date whatever its genre, and');
  p(`   ${decretalHolds.length} decretals of ${decretalDates} canonisation days are held rather than doubled (§9). A hold is released by hand; a duplicate is not.`);
}
p();

// Per year and category
p('## 2. Per year and per category');
p();
p('Parsed / matched / ambiguous / unmatched, for every category the index prints; an entry withheld because its document is');
p('claimed twice (§5) is in none of the last three. A category of the *no* row is not attempted (its count is the material');
p('for a future harvest); *partly* marks a class only part of which is on a harvested shelf.');
p();
p(`| Category | Harvested | ${years.map((y) => `${y}`).join(' | ')} |`);
p(`|---|---|${years.map(() => '---').join('|')}|`);
for (const c of ACTA_CATEGORIES) {
  const cellsFor = years.map((y) => {
    const es = parsed.get(y)!.entries.filter((e) => cat(e)?.id === c.id);
    if (es.length === 0) return '';
    if (c.harvested === 'no') return `${es.length}`;
    const m = result.matches.filter((x) => String(x.entry.year) === y && cat(x.entry)?.id === c.id).length;
    const a = result.ambiguous.filter((x) => String(x.entry.year) === y && cat(x.entry)?.id === c.id).length;
    const u = result.unmatched.filter((x) => String(x.entry.year) === y && cat(x.entry)?.id === c.id).length;
    return `${es.length} / ${m} / ${a} / ${u}`;
  });
  if (cellsFor.every((x) => x === '')) continue;
  p(`| ${c.id} | ${c.harvested} | ${cellsFor.join(' | ')} |`);
}
p();
if (unseenHeadings.size === 0) {
  p('Unseen category headings: **none** — every heading printed in the ten indexes is a row of `categories.ts`. Parts skipped per');
} else {
  p(`Unseen category headings: **${unseenHeadings.size}**, whose entries \`matchActa\` skipped and which count under no harvestedness above — `);
  p([...unseenHeadings].sort().map(([h, n]) => `*${md(h)}* (${n})`).join(', ') + '. Each needs a row of `categories.ts`. Parts skipped per');
}
p('year (dicasteries, synod, *Diarium*): ' + years.map((y) => `${y}: ${parsed.get(y)!.skippedParts.length}`).join('; ') + '.');
p();

// Parser defects
p('## 3. Parser defects');
p();
p('Lines the parser could not read into an entry. The journeys section (*Itinera Apostolica*) re-lists each journey\'s homilies');
p('and addresses under `Dies N.` lines with no date and is entirely of this kind; the Secretariat of State\'s sub-headings');
p('(*Rescripta ex Audientia:*) likewise. Those are counted; everything else is listed.');
p();
const defectRows: string[] = [];
const defectCounts = new Map<string, number>();
for (const y of years) {
  for (const d of parsed.get(y)!.defects) {
    const c = categoryForHeading(d.category);
    if (c === null || c.harvested === 'no') {
      const k = `${c?.id ?? d.category}`;
      defectCounts.set(k, (defectCounts.get(k) ?? 0) + 1);
      if (c !== null && ['Itinera Apostolica', 'Secretaria Status', 'Vicariatus'].includes(c.id)) continue;
    }
    defectRows.push(`| ${y} | ${c?.id ?? d.category} | ${md(d.message)} |`);
  }
}
p('| Year | Category | Defect |');
p('|---|---|---|');
for (const r of defectRows) p(r);
p();
p('Counted only: ' + [...defectCounts].sort().map(([k, n]) => `${k} ${n}`).join('; ') + '.');
p();

// Ambiguous
p('## 4. Ambiguous entries');
p();
p('Several candidates of the class on the date, and neither the incipit slug nor the toponym separates them. Nothing is written.');
p();
p('| Reference | Date | Category | Entry | Candidates |');
p('|---|---|---|---|---|');
for (const a of result.ambiguous) {
  p(`| ${cite(a.entry)} | ${a.entry.date} | ${catId(a.entry)} | ${label(a.entry)} | ${candidateList(a.candidates)} |`);
}
p();

// Conflicts
p('## 5. Documents claimed by two entries');
p();
p('One document is the only candidate of its class on the date for two entries of the index. One page opens one act, so both');
p('claims are withheld and reported (`match.ts`): every case is two *Nuntii* on the date of one series message, except the');
p('two beatification letters of 15 August 2016 that share a provisional record.');
p();
p('| Document | Entries |');
p('|---|---|');
for (const c of result.conflicts) {
  p(`| \`${c.documentId}\` | ${c.entries.map((e) => `${cite(e)}: ${label(e)}`).join('; ')} |`);
}
p();

// Unmatched harvested
const unmatchedBy = (h: 'yes' | 'partly') => {
  const groups = new Map<string, ActaUnmatched[]>();
  for (const u of result.unmatched) {
    if (harvestedness(u.entry) !== h) continue;
    const k = catId(u.entry);
    groups.set(k, [...(groups.get(k) ?? []), u]);
  }
  return groups;
};
const printUnmatched = (u: ActaUnmatched) =>
  p(`| ${cite(u.entry)} | ${u.entry.date} | ${label(u.entry)}${u.entry.description && u.entry.incipit !== null ? ` — ${md(u.entry.description.slice(0, 90))}` : ''} | ${md(belief(u))} |`);

p('## 6. Unmatched entries in harvested categories');
p();
p('Each is a candidate gap in the shelf harvest, a parser defect or a matcher defect; the belief column says which. The two');
p('dominant shapes are both **shelf gaps**: vatican.va\'s Francis shelves for constitutions and apostolic letters are');
p('selections, not the record — the index names 117 apostolic constitutions and 206 apostolic letters over the ten years');
p('against 49 and 59 on the shelves.');
p();
for (const [k, us] of unmatchedBy('yes')) {
  p(`<details><summary><b>${k}</b> — ${us.length} unmatched</summary>`);
  p();
  p('| Reference | Date | Entry | Belief |');
  p('|---|---|---|---|');
  for (const u of us) printUnmatched(u);
  p();
  p('</details>');
  p();
}

p('## 7. Unmatched entries in partly harvested categories');
p();
p('The decretals, the *sub plumbo* letters and the messages, where the registry harvests part of the class today.');
p();
for (const [k, us] of unmatchedBy('partly')) {
  p(`<details><summary><b>${k}</b> — ${us.length} unmatched</summary>`);
  p();
  p('| Reference | Date | Entry | Belief |');
  p('|---|---|---|---|');
  for (const u of us) printUnmatched(u);
  p();
  p('</details>');
  p();
}

// Created from the Acta (AAS-only documents spec §6)
p('## 8. Created from the Acta');
p();
p('The AAS-only documents (`tools/src/acta/create.ts`): an entry the join left unmatched, in a category the registry creates from');
p('the *Acta* (encyclicals, exhortations, constitutions, motu proprio, apostolic letters, and the bull class — decretals, *sub plumbo*');
p('letters — insofar as the pope\'s shelf for the class is harvested), dated within the pontificate, not ambiguous, not claiming a');
p('document another entry claims, named by no curated hold, and clear of the duplicate guard (§9). Each becomes a record with the');
p('id the shelf\'s rule would mint from the index\'s incipit (provisional, `{genre}-{date}`, for a constitution the index names by');
p('toponym only), the index entry as its title, `source.shelf` `aas/{year}` with `url: null`, and `acta` as its citation and its source.');
p();
// The data carries what the harvest created after the collision and ordinal passes; the
// report's creator output is pre-pass. Records are paired by (issuer, date, acta page) --
// the only fields those passes never touch -- and then compared whole, with the id (the one
// field the passes legitimately rewrite) set aside, so that a creator/data disagreement in
// any other field is reported as a difference rather than hidden behind a matching key.
const bornKey = (d: DocumentRecord) => `${d.issuerId}|${d.date}|${d.acta!.year}:${d.acta!.page}`;
const bornByKey = new Map(bornInData.map((d) => [bornKey(d), d]));
const dataIdOf = (d: DocumentRecord): string => bornByKey.get(bornKey(d))?.id ?? d.id;
const normalised = (d: DocumentRecord): string => {
  const { id: _id, ...rest } = d;
  return JSON.stringify(rest, Object.keys(rest).sort());
};
{
  const fromCreator = new Map(creation.created.map((c) => [bornKey(c.record), c.record]));
  const onlyData = bornInData.filter((d) => !fromCreator.has(bornKey(d))).map((d) => d.id);
  const onlyCreator = creation.created.filter((c) => !bornByKey.has(bornKey(c.record))).map((c) => c.record.id);
  const differing = bornInData.filter((d) => {
    const c = fromCreator.get(bornKey(d));
    return c !== undefined && normalised(c) !== normalised(d);
  }).map((d) => d.id);
  p(`The data carries **${bornInData.length}** AAS-only records and the creator, re-run here over the shelf records, produces **${creation.created.length}**`
    + (onlyData.length === 0 && onlyCreator.length === 0 && differing.length === 0
      ? ' — the same set, entry for entry, and the same records field for field (ids aside, which the collision and ordinal passes assign).'
      : ` — **not the same**: only in the data ${onlyData.map((id) => `\`${id}\``).join(', ') || '—'}; only from the creator ${onlyCreator.map((id) => `\`${id}\``).join(', ') || '—'}; differing in a field other than the id ${differing.map((id) => `\`${id}\``).join(', ') || '—'}.`));
}
p();
p('### Per year and category');
p();
{
  const cats = [...new Set(creation.created.map((c) => catId(c.entry)))];
  p(`| Category | ${years.join(' | ')} | Total |`);
  p(`|---|${years.map(() => '---').join('|')}|---|`);
  for (const c of ACTA_CATEGORIES.filter((c) => cats.includes(c.id))) {
    const ns = years.map((y) => creation.created.filter((x) => String(x.entry.year) === y && catId(x.entry) === c.id).length);
    p(`| ${c.id} | ${ns.join(' | ')} | ${ns.reduce((a, b) => a + b, 0)} |`);
  }
  const ns = years.map((y) => creation.created.filter((x) => String(x.entry.year) === y).length);
  p(`| **Total** | ${ns.map((n) => `**${n}**`).join(' | ')} | **${ns.reduce((a, b) => a + b, 0)}** |`);
}
p();
{
  const byIssuer = new Map<string, number>();
  for (const c of creation.created) byIssuer.set(c.record.issuerId, (byIssuer.get(c.record.issuerId) ?? 0) + 1);
  const byClass = new Map<string, number>();
  for (const c of creation.created) {
    const k = `${c.record.genre}${c.record.characteristics?.length ? '+' + c.record.characteristics.join('+') : ''}`;
    byClass.set(k, (byClass.get(k) ?? 0) + 1);
  }
  p('By issuer: ' + [...byIssuer].sort().map(([k, n]) => `\`${k}\` ${n}`).join('; ') + '. By class: '
    + [...byClass].sort().map(([k, n]) => `${k} ${n}`).join('; ') + '. Provisional (toponym only): '
    + creation.created.filter((c) => c.record.idStatus === 'provisional').length + '.');
  p();
  // The material for a circumscription-keyword PR (spec §4): the index's own verbs.
  const constitutions = creation.created.filter((c) => c.record.characteristics?.includes('apostolic-constitution'));
  const VERBS: [string, RegExp][] = [
    ['conditur / constituitur / erigitur (erection)', /\b(conditur|constituitur|erigitur|constituuntur|conduntur)\b/],
    ['dismembrato / dismembratis (from another see\'s territory)', /\bdismembrat/],
    ['extollitur / evehitur / attollitur (elevation)', /\b(extollitur|evehitur|attollitur|evehuntur)\b/],
    ['iunguntur / in unam (union)', /\b(iunguntur|in unam)\b/],
  ];
  const any = constitutions.filter((c) => VERBS.some(([, re]) => re.test(c.record.title)));
  const spec = constitutions.filter((c) => /conditur|erigitur|dismembrato|extollitur/.test(c.record.title));
  p(`**Circumscription material.** Of the ${constitutions.length} AAS-born constitutions, the index describes ${spec.length} with *conditur*, *erigitur*,`);
  p(`*dismembrato* or *extollitur* (the spec\'s four words), and ${any.length} with any of the erection, elevation or union verbs below; none carries a`);
  p('`keywords` or `actKind` yet (spec §4) — the count is the material for a circumscription-keyword PR of its own.');
  p();
  p('| Verb | Constitutions |');
  p('|---|---|');
  for (const [label, re] of VERBS) p(`| ${label} | ${constitutions.filter((c) => re.test(c.record.title)).length} |`);
  const neither = constitutions.filter((c) => !VERBS.some(([, re]) => re.test(c.record.title)));
  p(`| none of these | ${neither.length} |`);
  p();
  if (neither.length) {
    p('Without any of the verbs: ' + neither.map((c) => `\`${dataIdOf(c.record)}\` (${md(c.record.title.slice(0, 80))}…)`).join('; ') + '.');
    p();
  }
}
p('### Shelf ids re-minted by densification');
p();
{
  // Would the shelf's provisional ordinals be the same without the AAS-only records? Re-run
  // the ordinal pass over copies of the shelf records alone and compare.
  const copies = docs.map((d) => ({ ...d }));
  assignProvisionalOrdinals(copies);
  const changed = copies.map((c, i) => [docs[i]!.id, c.id] as const).filter(([a, b]) => a !== b);
  const shared = bornInData.filter((b) => b.idStatus === 'provisional'
    && docs.some((d) => d.idStatus === 'provisional' && bareProvisionalId(d.id) === bareProvisionalId(b.id)));
  if (changed.length === 0 && shared.length === 0) {
    p('**None.** No AAS-only provisional record shares an ordinal group (issuer, genre, date) with a shelf provisional record, and');
    p('the shelf\'s ordinals are what a pass over the shelf records alone assigns; no minted shelf id gained a full-date suffix either');
    p('(the guard\'s *same incipit elsewhere* holds an entry whose incipit a shelf record of the year already carries).');
  } else {
    p('| Shelf id in the data | Without the AAS-only records |');
    p('|---|---|');
    for (const [a, b] of changed) p(`| \`${a}\` | \`${b}\` |`);
    if (shared.length) p('\nAAS-only records sharing an ordinal group with a shelf record: ' + shared.map((d) => `\`${d.id}\``).join(', ') + '.');
  }
}
p();
p('### Every created record, with the index line it rests on');
p();
for (const y of years) {
  const cs = creation.created.filter((c) => String(c.entry.year) === y);
  if (cs.length === 0) continue;
  p(`<details><summary><b>${y}</b> — ${cs.length} created</summary>`);
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
p('† A provisional id (the index names the constitution by toponym only); the id is as the data carries it, after the');
p('collision and ordinal passes of the harvest.');
p();

// Held (AAS-only documents spec §3, §6)
p('## 9. Held');
p();
p('Every entry of a harvested category that was neither matched nor created, per reason. The four guard reasons of spec §3 —');
p('*class mismatch*, *possible identity*, *near-miss*, *same incipit elsewhere* — carry the candidate ids; the rest are the');
p('creation conditions of §2 (a category not created from the *Acta*, a shelf not harvested for the pope, an act of an earlier');
p('pontificate, an ambiguous entry, a document two entries claim) and the one case the identifier scheme cannot resolve (two');
p('entries of one date with one incipit). A hold is released by a curated row, never by loosening a rule.');
p();
const HOLD_LABELS: Record<HoldReason, string> = {
  'not-created-category': 'Category not created from the Acta (the shelf that carries the class is not harvested)',
  'shelf-not-harvested': 'Shelf not harvested for the pope',
  'pope-not-harvested': 'Pope not harvested',
  'date-before-pontificate': 'Date before the pontificate',
  'ambiguous': 'Ambiguous (§4)',
  'claimed-twice': 'Claimed twice (§5)',
  'unresolvable-date': 'Unresolvable date',
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
  p('| Reason | Held | Of which per category |');
  p('|---|---|---|');
  for (const reason of Object.keys(HOLD_LABELS) as HoldReason[]) {
    const hs = byReason.get(reason) ?? [];
    if (hs.length === 0) continue;
    const perCat = new Map<string, number>();
    for (const h of hs) perCat.set(catId(h.entry), (perCat.get(catId(h.entry)) ?? 0) + 1);
    p(`| ${HOLD_LABELS[reason]} | ${hs.length} | ${[...perCat].map(([k, n]) => `${k} ${n}`).join('; ')} |`);
  }
  p(`| **Total** | **${creation.held.length}** | |`);
  p();
  for (const reason of Object.keys(HOLD_LABELS) as HoldReason[]) {
    const hs = byReason.get(reason) ?? [];
    if (hs.length === 0) continue;
    p(`<details><summary><b>${HOLD_LABELS[reason]}</b> — ${hs.length}</summary>`);
    p();
    if (reason === 'not-created-category') {
      p('Per category, with the reason recorded in `create.ts` (NOT_CREATED); the entries themselves are listed in §6 and §7.');
      p();
      p('| Category | Held | Why |');
      p('|---|---|---|');
      const perCat = new Map<string, number>();
      for (const h of hs) perCat.set(catId(h.entry), (perCat.get(catId(h.entry)) ?? 0) + 1);
      for (const [k, n] of perCat) p(`| ${k} | ${n} | ${md(NOT_CREATED[k] ?? '')} |`);
    } else {
      p('| Reference | Date | Category | Entry | Candidates | Note |');
      p('|---|---|---|---|---|---|');
      for (const h of hs) {
        p(`| ${cite(h.entry)} | ${h.entry.date} | ${catId(h.entry)} | ${label(h.entry)} | ${h.candidates.length ? candidateList(h.candidates) : '—'} | ${md(h.note)} |`);
      }
    }
    p();
    p('</details>');
    p();
  }
}

// Non-harvested
p('## 10. Non-harvested categories');
p();
p('Counted per category and year: the material for the *letters*, *speeches*, *homilies* and *pont-messages* harvests.');
p();
p(`| Category | Registry | ${years.join(' | ')} | Total |`);
p(`|---|---|${years.map(() => '---').join('|')}|---|`);
for (const c of ACTA_CATEGORIES.filter((c) => c.harvested === 'no')) {
  const ns = years.map((y) => parsed.get(y)!.entries.filter((e) => cat(e)?.id === c.id).length);
  if (ns.every((n) => n === 0)) continue;
  p(`| ${c.id} | ${c.classes.length ? c.classes.map((k) => `\`${k.genre}\``).join(", ") : "—"} | ${ns.join(' | ')} | ${ns.reduce((a, b) => a + b, 0)} |`);
}
p();

// Docs without entries
p('## 11. Francis documents with no AAS entry');
p();
p('Harvested Francis shelf documents dated within the ten volume years that carry no `acta`, per genre. A document dated in December');
p('belongs to the next year\'s volume (December 2024 to the 2025 index, which does not exist yet); a decree vatican.va files on');
p('motu_proprio is a *Decretum* in the index (not harvested); and an act the index lists on the date under another class is an');
p('entry of §4–§7. The formal genres are listed, since an encyclical or constitution absent from AAS would be surprising.');
p();
const window = francis.filter((d) => d.date >= '2015-01-01' && d.date <= '2024-12-31' && !d.acta);
const byGenre = new Map<string, DocumentRecord[]>();
for (const d of window) {
  const k = `${d.genre}${d.characteristics?.length ? '+' + d.characteristics.join('+') : ''}`;
  byGenre.set(k, [...(byGenre.get(k) ?? []), d]);
}
p('| Genre class | Without an entry | Of which dated December | Harvested in the window |');
p('|---|---|---|---|');
for (const [k, ds] of [...byGenre].sort((a, b) => b[1].length - a[1].length)) {
  const total = francis.filter((d) => d.date >= '2015-01-01' && d.date <= '2024-12-31'
    && `${d.genre}${d.characteristics?.length ? '+' + d.characteristics.join('+') : ''}` === k).length;
  p(`| ${k} | ${ds.length} | ${ds.filter((d) => d.date.slice(5, 7) === '12').length} | ${total} |`);
}
p();
const FORMAL = new Set(['encyclical', 'apostolic-exhortation', 'papal-bull', 'apostolic-letter']);
p('<details><summary><b>Formal genres, listed</b> (encyclical, exhortation, bull, apostolic letter with or without motu-proprio)</summary>');
p();
p('| Document | Date | Class | Index entries on this date | Reading |');
p('|---|---|---|---|---|');
for (const d of window.filter((d) => FORMAL.has(d.genre ?? '')).sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : a.id < b.id ? -1 : 1)) {
  const k = `${d.genre}${d.characteristics?.length ? '+' + d.characteristics.join('+') : ''}`;
  const same = entriesByDate.get(d.date) ?? [];
  const sameTxt = same.length ? same.map((e) => `${catId(e)} (${cite(e)}: ${label(e)})`).join('; ') : '—';
  let reading: string;
  if (d.date.slice(5, 7) === '12' && d.date.slice(0, 4) === '2024') reading = 'December 2024: the 2025 volume';
  else if (same.some((e) => result.ambiguous.some((a) => a.entry === e && a.candidates.some((c) => c.id === d.id)))) reading = 'ambiguous (§4)';
  else if (same.some((e) => result.conflicts.some((c) => c.documentId === d.id))) reading = 'claimed twice (§5)';
  else if (same.some((e) => harvestedness(e) === 'no')) reading = `the index files the act of this date under ${same.filter((e) => harvestedness(e) === 'no').map(catId).join(', ')}, not harvested`;
  else if (same.some((e) => harvestedness(e) === 'yes' || harvestedness(e) === 'partly')) reading = 'class mismatch or another act of the date (§6)';
  else reading = 'no index entry on this date: not in AAS 2015–2024 under any category';
  p(`| \`${d.id}\` | ${d.date} | ${k} | ${md(sameTxt)} | ${md(reading)} |`);
}
p();
p('</details>');
p();

// Matches, for audit
p('## 12. Every match, with the index line it rests on');
p();
p('The join can be audited line by line: the entry\'s text exactly as extracted, beside the document it was written to.');
p('*By* says what decided it — the only candidate of the class on the date (`unique`), the incipit slug, or the toponym.');
p();
for (const y of years) {
  const ms = result.matches.filter((m) => String(m.entry.year) === y);
  p(`<details><summary><b>${y}</b> — ${ms.length} matched</summary>`);
  p();
  p('| Reference | Category | Document | By | Index line |');
  p('|---|---|---|---|---|');
  for (const m of ms) {
    p(`| ${cite(m.entry)} | ${catId(m.entry)} | \`${m.documentId}\` | ${m.by} | \`${md(m.entry.raw).replace(/`/g, '\'')}\` |`);
  }
  p();
  p('</details>');
  p();
}

// Non-Francis
const otherPopes = entries.filter((e) => e.pope !== 'Franciscus');
if (otherPopes.length) {
  p('## 13. Entries of other pontificates');
  p();
  p('| Reference | Pope | Date | Category | Entry | Outcome |');
  p('|---|---|---|---|---|---|');
  for (const e of otherPopes) {
    const outcome = result.matches.some((m) => m.entry === e) ? 'matched'
      : creation.created.some((c) => c.entry === e) ? `created (\`${creation.created.find((c) => c.entry === e)!.record.id}\`)`
      : creation.held.some((h) => h.entry === e) ? `held (${creation.held.find((h) => h.entry === e)!.reason})`
      : result.unmatched.some((u) => u.entry === e) ? 'unmatched (not on the shelf)' : 'not attempted';
    p(`| ${cite(e)} | ${e.pope} | ${e.date} | ${catId(e)} | ${label(e)} | ${outcome} |`);
  }
  p();
}

process.stdout.write(out.join('\n') + '\n');
void byDocId; void matchedIds;
