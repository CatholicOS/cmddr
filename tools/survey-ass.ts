/**
 * The *Acta Sanctae Sedis* survey (phase 2c-ii-0): what the scanner built for the sample
 * (ass volumes spec §3, §4) reads in every volume of the series, measured before any era
 * is planned and before any rule is written for it.
 *
 * It is a measurement and nothing else. It adds no source to ACTA_SOURCES, writes no
 * fixture, touches no document: it reads each volume's text from the local store
 * (tools/fetch-acta.sh ass 1-41), runs `locateSumma`, `scanVolume` and `checkSumma` over
 * it exactly as `tools/scan-ass.ts` would, and prints a report. What it cannot answer it
 * counts as a candidate for a human to confirm -- the heading spellings the sample never
 * printed, the brevia of the Secretaria Brevium -- never as a rule.
 *
 * The four questions it exists to answer (the sample's era report, finding 15):
 *   1. the yield by decade, which is what decides how 2c-ii is split into eras;
 *   2. how many acts the Secretaria Brevium would add across the series, so the owner
 *      rules on the brevia with the corpus-wide number in hand;
 *   3. which caps headings the volumes print that `CLASS_HEADINGS` does not list, each
 *      with the volume and page that prints it, so an era can quote its evidence;
 *   4. whether `header-mismatch` is OCR noise everywhere or a real page offset somewhere.
 *
 * Usage: npx tsx tools/survey-ass.ts > docs/superpowers/reports/<date>-ass-survey.md
 *        npx tsx tools/survey-ass.ts 12 23 41     # only these volumes, to the terminal
 */
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { scanVolume, CLASS_HEADINGS, type AssDefect, type AssEntry } from './src/acta/ass.js';
import { checkSumma, locateSumma, parseSummaPapalPart } from './src/acta/summa.js';
import { ACTA_SOURCES } from './src/acta/join.js';
import type { DocumentRecord } from './src/types.js';
import { readdirSync } from 'node:fs';

const STORE = `${process.env['ACTA_SOURCES'] ?? `${homedir()}/development/sources/ASS`}`;
const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * The volumes and the years each covers, read off the index page in the store
 * (`ASS 33 [1900-1]`, `ASS 31 [1899-900]`, `ASS 16 [1883-84]`): the second year is printed
 * abbreviated to as many digits as it takes, so it is completed from the first.
 */
function volumesFromIndex(): { volume: number; year: number; yearTo: number }[] {
  const html = `${STORE}/pdf/index_it.htm`;
  if (!existsSync(html)) throw new Error(`no ASS index page at ${html} (run tools/fetch-acta.sh ass 1)`);
  const out: { volume: number; year: number; yearTo: number }[] = [];
  for (const m of readFileSync(html, 'utf8').matchAll(/>ASS\s+(\d{1,2})\s*\[(\d{4})(?:-(\d{1,3}))?\]/g)) {
    const volume = Number(m[1]);
    const year = Number(m[2]);
    let yearTo = year;
    if (m[3] !== undefined) {
      const unit = 10 ** m[3].length;
      yearTo = year - (year % unit) + Number(m[3]);
      if (yearTo < year) yearTo += unit;
    }
    out.push({ volume, year, yearTo });
  }
  return out.sort((a, b) => a.volume - b.volume);
}

const textPath = (v: { volume: number; year: number }) => `${STORE}/txt/ass-${pad2(v.volume)}-${v.year}.txt`;

/** The first word of each class heading the scanner knows, for the candidate-heading scan. */
const KNOWN_FIRST_WORDS = new Set(CLASS_HEADINGS.map((h) => h.split(' ')[0]!));
/** The pope named where an act opens -- the same evidence `isOpening` looks for, restated here because the survey may not import the scanner's internals. */
const POPE_NEAR = /\b(LEO|LEONIS|LEONE|PIUS|PII|PIO)\b|SANCTISSIMI|Sanctissimi|SS(?:MI|mi)?\.?\s*D\.\s*N\.|\bPontifex\b/;
/** A caps line that could be a class heading: three or more capitals in its first word, no lower case in it. */
const CAPS_LINE = /^\s*(?:\d[\dOoiIla]{0,3}\s+)?([A-ZÀ-Þ]{3,}(?:[ .'’-]+[A-ZÀ-Þ.]{2,})*)\s*$/;
/** The ring of the Fisherman: the brevia of the Secretaria Brevium close with it. */
const RING = /annulo\s+Piscatoris|annulo\s+piscatoris/;

interface VolumeSurvey {
  volume: number;
  year: number;
  yearTo: number;
  pages: number;
  summa: { from: number; to: number } | null;
  summaHeading: string | null;
  summaEnd: string | null;
  rows: number;
  claimed: number;
  unclaimed: number;
  omitted: number;
  acts: number;
  byAnchor: { dateline: number; heading: number };
  defects: Record<AssDefect['reason'], number>;
  /** `no-heading` defects whose quoted lines carry the ring formula: the brevia the scanner skips. */
  brevia: number;
  /** Caps lines with a pope formula under them whose first word no class heading carries, as `SPELLING` -> [volume:page, …]. */
  candidates: Map<string, string[]>;
  /** Pages whose running header contradicts the page number, with the header, for the `header-mismatch` question. */
  mismatches: { page: number; header: string }[];
  /**
   * Where `parseSummaPapalPart` found no papal heading, the summa's own opening lines: the
   * spellings an era would have to teach it, quoted from the page rather than guessed.
   */
  summaOpening: string[];
}

function surveyVolume(v: { volume: number; year: number; yearTo: number }): VolumeSurvey | null {
  const path = textPath(v);
  if (!existsSync(path)) return null;
  const pages = readFileSync(path, 'utf8').split('\f');
  const summa = locateSumma(pages);
  const lastBodyPage = summa ? summa.from - 1 : pages.length;
  const summaText = summa ? pages.slice(summa.from - 1, summa.to).join('\f') + '\n' : '';
  const parsed = parseSummaPapalPart(summaText);
  const { entries, defects } = summa === null
    ? { entries: [] as AssEntry[], defects: [] as AssDefect[] }
    : scanVolume(pages, { volume: v.volume, year: v.year, yearTo: v.yearTo, lastBodyPage });
  const check = checkSumma(entries, { pages: summa, rows: parsed.rows });
  const byReason = { 'no-heading': 0, 'no-date': 0, 'no-opening': 0, 'header-mismatch': 0, 'unknown-pope': 0 } as Record<AssDefect['reason'], number>;
  for (const d of defects) byReason[d.reason]++;

  // The brevia: a `no-heading` defect is the scanner reaching an act's close and finding no
  // class heading behind it; where that close is the ring of the Fisherman, the act is a breve.
  const brevia = defects.filter((d) => d.reason === 'no-heading' && d.lines.some((l) => RING.test(l))).length;

  // Candidate headings: a caps line with a pope formula within the four lines under it,
  // whose first word no class heading carries. A candidate, never a rule: the era that
  // adopts one quotes the page printed here.
  const candidates = new Map<string, string[]>();
  for (let p = 0; p < lastBodyPage && p < pages.length; p++) {
    const lines = pages[p]!.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const m = lines[i]!.match(CAPS_LINE);
      if (!m) continue;
      const spelling = m[1]!.replace(/\s+/g, ' ').trim();
      if (KNOWN_FIRST_WORDS.has(spelling.split(' ')[0]!)) continue;
      if (spelling.length < 5 || spelling.length > 60) continue;
      const under = lines.slice(i + 1, i + 5).join(' ');
      if (!POPE_NEAR.test(under)) continue;
      const at = `${v.volume}:${p + 1}`;
      candidates.set(spelling, [...(candidates.get(spelling) ?? []), at]);
    }
  }

  return {
    volume: v.volume, year: v.year, yearTo: v.yearTo, pages: pages.length,
    summa, summaHeading: parsed.heading, summaEnd: parsed.end,
    rows: parsed.rows.length, claimed: check.claimed.length, unclaimed: check.unclaimed.length, omitted: check.omitted.length,
    acts: entries.length,
    byAnchor: { dateline: entries.filter((e) => e.anchor === 'dateline').length, heading: entries.filter((e) => e.anchor === 'heading').length },
    defects: byReason,
    brevia,
    candidates,
    mismatches: defects.filter((d) => d.reason === 'header-mismatch').map((d) => ({ page: d.page, header: (d.lines[0] ?? '').trim().slice(0, 40) })),
    summaOpening: parsed.heading !== null || summa === null ? []
      : pages.slice(summa.from - 1, summa.from + 1).flatMap((pg) => pg.split('\n'))
        .map((l) => l.trim()).filter((l) => l !== '' && !/^\d{1,4}$/.test(l)).slice(0, 6),
  };
}

// --- the report ----------------------------------------------------------------------------

const only = process.argv.slice(2).map(Number).filter((n) => !Number.isNaN(n));
const volumes = volumesFromIndex().filter((v) => only.length === 0 || only.includes(v.volume));
const sampled = new Set(ACTA_SOURCES.filter((s) => s.kind === 'ass').map((s) => s.volume));
const surveyed: VolumeSurvey[] = [];
const missing: number[] = [];
for (const v of volumes) {
  const s = surveyVolume(v);
  if (s === null) { missing.push(v.volume); continue; }
  surveyed.push(s);
}

const out: string[] = [];
const p = (s = '') => out.push(s);
const md = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' / ').replace(/\s+/g, ' ');
const pct = (a: number, b: number) => (b === 0 ? '—' : `${((a / b) * 100).toFixed(0)} %`);
const sum = (f: (s: VolumeSurvey) => number, rows = surveyed) => rows.reduce((n, s) => n + f(s), 0);
const years = (s: VolumeSurvey) => (s.yearTo === s.year ? `${s.year}` : `${s.year}–${String(s.yearTo).slice(-2)}`);
/** The pontificate a volume's first year falls in: Pius IX to 7 February 1878, Leo XIII to 20 July 1903, then Pius X. */
/**
 * The pontificate a volume is grouped under, by its first year. Two volumes span a
 * conclave and carry both popes' acts -- ASS 11 (1878: Pius IX died 7 February, Leo XIII
 * was elected on the 20th) and ASS 36 (1903-4: Leo XIII died 20 July, Pius X was elected
 * 4 August) -- and are marked, since an era drawn by pontificate has to decide where they
 * go.
 */
const SPANS_CONCLAVE: Readonly<Record<number, string>> = { 11: 'Pius IX + Leo XIII', 36: 'Leo XIII + Pius X' };
const pope = (s: VolumeSurvey) => SPANS_CONCLAVE[s.volume] ?? (s.year < 1878 ? 'Pius IX' : s.year < 1903 ? 'Leo XIII' : 'Pius X');
const decade = (s: VolumeSurvey) => `${Math.floor(s.year / 10) * 10}s`;

const today = new Date();
const iso = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;

p('# The *Acta Sanctae Sedis*, all 41 volumes: the 2c-ii survey');
p();
p(`Generated by \`tools/survey-ass.ts\` on ${iso} from the volume texts in the local store, with the scanner and the`);
p('summa reader as phase 2c-i merged them ([ass volumes spec](../specs/2026-09-21-ass-volumes-design.md) §3, §4). It is a');
p('measurement: no source was added, no fixture written, no document touched. Its purpose is to decide how 2c-ii is split');
p(`into eras, and to put three numbers in front of the owner before any rule is written for them. ${surveyed.length} volumes read`);
p(`${only.length ? `(only ${only.join(', ')}, as asked on the command line)` : missing.length ? `(${missing.length} missing from the store: ${missing.join(', ')})` : '(every volume of the series)'};`);
p(`the five of the sample (${[...sampled].sort((a, b) => a - b).join(', ')}) are surveyed too, and their numbers are the ones phase 2c-i`);
p('measured, so a difference here would be a defect.');
p();
p('## 1. The yield, by volume');
p();
p('`acts` is what the scanner reads by rule, before any curated reading. A volume whose summa was not located is not');
p('scanned at all (`tools/scan-ass.ts` refuses to write a fixture for it), and shows as — throughout.');
p();
p('| Vol | Years | Pope | Pages | Summa | Papal heading | Part ends at | Acts | dateline | heading | Rows | Claimed | Unclaimed | Omitted | Defects | of them brevia | Sample |');
p('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const s of surveyed) {
  const defects = sum((x) => Object.values(x.defects).reduce((a, b) => a + b, 0), [s]);
  p(`| ${s.volume} | ${years(s)} | ${pope(s)} | ${s.pages} | ${s.summa ? `${s.summa.from}–${s.summa.to}` : '**none**'} | ${s.summaHeading ? md(s.summaHeading) : '—'} | ${s.summaHeading === null ? '—' : s.summaEnd ? md(s.summaEnd) : '**runs on**'} | ${s.acts} | ${s.byAnchor.dateline} | ${s.byAnchor.heading} | ${s.rows} | ${s.claimed} | ${s.unclaimed} | ${s.omitted} | ${defects} | ${s.brevia} | ${sampled.has(s.volume) ? '✓' : ''} |`);
}
p();
p('## 2. The yield, by decade — what decides the era split');
p();
p('“Claimed” is the share of the summa\'s papal rows a scanned act sits on: the completeness check of spec §4, and the');
p('only honest measure of what the scanner reads in a volume it has not been curated against.');
p();
p('| Decade | Volumes | Pages | Acts | Summa rows | Claimed | Claimed % | Defects | Brevia | Volumes with no summa |');
p('|---|---|---|---|---|---|---|---|---|---|');
for (const d of [...new Set(surveyed.map(decade))]) {
  const rows = surveyed.filter((s) => decade(s) === d);
  const claimed = sum((s) => s.claimed, rows);
  const rowsN = sum((s) => s.rows, rows);
  p(`| ${d} | ${rows.length} | ${sum((s) => s.pages, rows)} | ${sum((s) => s.acts, rows)} | ${rowsN} | ${claimed} | ${pct(claimed, rowsN)} | ${sum((s) => Object.values(s.defects).reduce((a, b) => a + b, 0), rows)} | ${sum((s) => s.brevia, rows)} | ${rows.filter((s) => s.summa === null).length} |`);
}
p();
p('| Pontificate | Volumes | Acts | Summa rows | Claimed % |');
p('|---|---|---|---|---|');
for (const n of ['Pius IX', 'Pius IX + Leo XIII', 'Leo XIII', 'Leo XIII + Pius X', 'Pius X']) {
  const rows = surveyed.filter((s) => pope(s) === n);
  if (rows.length === 0) continue;
  p(`| ${n} | ${rows.length} (${rows.map((s) => s.volume).join(', ')}) | ${sum((s) => s.acts, rows)} | ${sum((s) => s.rows, rows)} | ${pct(sum((s) => s.claimed, rows), sum((s) => s.rows, rows))} |`);
}
p();
p('## 3. The brevia of the Secretaria Brevium (the owner\'s decision)');
p();
p(`Across the series the scanner reaches **${sum((s) => s.brevia)}** acts that close with the ring of the Fisherman and have no class`);
p('heading behind them — the shape the sample\'s report counted at 15 in five volumes (finding 15b). They are `no-heading`');
p('defects today, reported and not read. Reading them means anchoring on the ring formula rather than on a heading, which');
p('moves every volume\'s counts, the sample\'s included; the numbers per volume are in §1 and per decade in §2.');
p();
p('| Decade | Brevia | as a share of that decade\'s defects |');
p('|---|---|---|');
for (const d of [...new Set(surveyed.map(decade))]) {
  const rows = surveyed.filter((s) => decade(s) === d);
  const defects = sum((s) => Object.values(s.defects).reduce((a, b) => a + b, 0), rows);
  p(`| ${d} | ${sum((s) => s.brevia, rows)} | ${pct(sum((s) => s.brevia, rows), defects)} |`);
}
p();
p('## 4. Candidate class headings the scanner does not know');
p();
p('A caps line with a pope formula in the four lines under it, whose first word no `CLASS_HEADINGS` entry carries. These');
p('are **candidates for a human to read**, not rules and not defects: the era that adopts one quotes the page printed');
p('here, and the many that are addressees, running titles or body capitals are expected to fall away on reading.');
p();
const allCandidates = new Map<string, string[]>();
for (const s of surveyed) for (const [k, v] of s.candidates) allCandidates.set(k, [...(allCandidates.get(k) ?? []), ...v]);
const ranked = [...allCandidates].sort((a, b) => b[1].length - a[1].length || (a[0] < b[0] ? -1 : 1));
p(`${ranked.length} distinct spellings over ${sum((s) => s.candidates.size)} occurrences; the 40 most frequent:`);
p();
p('| Spelling | Occurrences | Volumes:pages (first five) |');
p('|---|---|---|');
for (const [spelling, at] of ranked.slice(0, 40)) p(`| \`${md(spelling)}\` | ${at.length} | ${at.slice(0, 5).join(', ')}${at.length > 5 ? ', …' : ''} |`);
p();
p('## 4b. The summa headings the parser does not know');
p();
p('`parseSummaPapalPart` knows the eleven papal-heading forms quoted in its own doc comment — the sample\'s three');
p('(`LITTERAE ET ALLOCUTIONES`, `LITTERAE ET ACTA R. PONTIFICIS`, `ACTA ROMANI PONTIFICIS`) and the eight the');
p('whole-series survey found. Where it finds none, the summa is read as having no papal part at all and the volume');
p('claims nothing — which is why a volume can scan acts and still show 0 rows. These are the volumes\' own opening');
p('lines, quoted from the page: the spellings an era would teach the parser, and the reason the yield of §2 is a floor');
p('and not a measurement for them.');
p();
p('| Vol | The summa\'s first lines, as printed |');
p('|---|---|');
for (const s of surveyed.filter((x) => x.summaOpening.length > 0)) {
  p(`| ${s.volume} | ${s.summaOpening.map((l) => `\`${md(l)}\``).join(' / ')} |`);
}
p();
p('The part now pauses at the first dicastery heading `DICASTERY_RE` knows, rather than stopping outright, and');
p('reopens at a later papal heading if one follows (ASS 8 (1874) 727-728 prints that shape). `**runs on**` in §1 marks');
p('only a papal part whose end is still a dicastery heading the parser does not know — the same defect from the other');
p('side, a volume\'s dicastery rows counted as the pope\'s and shown as unclaimed; none remain as of this survey.');
p();
p('## 5. `header-mismatch`: OCR noise, or a page offset?');
p();
p(`**${sum((s) => s.defects['header-mismatch'])}** across the series. A volume whose pages are genuinely offset would show them in a run, at every`);
p('page; the sample showed six, scattered, every one the OCR\'s reading of the right number (finding 15d).');
p();
p('| Vol | Count | Pages, with the header as read |');
p('|---|---|---|');
for (const s of surveyed.filter((x) => x.mismatches.length > 0)) {
  p(`| ${s.volume} | ${s.mismatches.length} | ${s.mismatches.slice(0, 8).map((m) => `${m.page} \`${md(m.header)}\``).join('; ')}${s.mismatches.length > 8 ? '; …' : ''} |`);
}
p();
p('## 6. The join target: what the shelves hold for these years');
p();
const docs = readdirSync('data/documents').filter((f) => f.endsWith('.json'))
  .flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[])
  .filter((d) => d.date >= '1865-01-01' && d.date <= '1908-12-31' && !(d.source?.shelf ?? '').startsWith('aas/'));
p('Shelf documents dated in each volume\'s years, and how many already carry a reference of either series. A volume whose');
p('shelf column is thin can yield few references however well it scans — the join needs a record to write on.');
p();
p('| Decade | Shelf documents | With a reference | Without |');
p('|---|---|---|---|');
for (const d of [...new Set(surveyed.map(decade))]) {
  const rows = surveyed.filter((s) => decade(s) === d);
  const from = Math.min(...rows.map((s) => s.year));
  const to = Math.max(...rows.map((s) => s.yearTo));
  const inEra = docs.filter((x) => Number(x.date.slice(0, 4)) >= from && Number(x.date.slice(0, 4)) <= to);
  p(`| ${d} (${from}–${to}) | ${inEra.length} | ${inEra.filter((x) => x.acta).length} | ${inEra.filter((x) => !x.acta).length} |`);
}
p();
p('## 7. Totals');
p();
p(`${surveyed.length} volumes, ${sum((s) => s.pages)} pages; **${sum((s) => s.acts)} acts** read by rule; ${sum((s) => s.rows)} summa rows of which ${sum((s) => s.claimed)} claimed`);
p(`(${pct(sum((s) => s.claimed), sum((s) => s.rows))}); ${sum((s) => Object.values(s.defects).reduce((a, b) => a + b, 0))} defects, ${sum((s) => s.brevia)} of them brevia; ${surveyed.filter((s) => s.summa === null).length} volumes with no summa located.`);
process.stdout.write(out.join('\n') + '\n');
