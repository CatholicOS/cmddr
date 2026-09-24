/**
 * The *Acta Sanctae Sedis* survey (phase 2c-ii-0): what the scanner reads in every volume
 * of the series -- first measured with what phase 2c-i built for the sample (ass volumes
 * spec §3, §4), before any era was planned and before any rule was written for one, and
 * re-run after each rule so that the report never claims a state the scanner has left.
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
import { scanVolume, headerAgreesASS, CLASS_HEADINGS, type AssDefect, type AssEntry } from './src/acta/ass.js';
import { checkSumma, locateSumma, parseSummaPapalPart, splitColumns, DIGIT_OCR, PAPAL_HEAD_FORMS } from './src/acta/summa.js';
import { headerAgrees, headerOf } from './src/acta/recover.js';
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
/** The ring of the Fisherman: the brevia of the Secretaria Brevium close with it. All four capitalisations the series prints (ass-headings.ts's RING_RE); the first survey of 2026-09-22 read only the lower-case `annulo`, and counted 83 brevia where this counts 105 on the same scanner. */
const RING = /[Aa]nnulo\s+[Pp]iscatoris/;

/**
 * A line of an unwoven summa page on which the two columns are still glued: a page token
 * that closes a row -- one of `ROW_END_RE`'s own leaders (`pag.`, `»`, `>`, `*`, `·`, a
 * run of stops) and the number after it -- with fifteen or more further characters of text
 * behind it, which on a two-column page can only be the other column (`Sacramenti. . . . . . » 94 Hubert Foiirnet, Sacerdotis fun-`,
 * ASS 10 (1877) 621). The leader is required, and not merely a space, so that a numeral
 * inside a description never reads as a glue -- a date (`editae die 9 februarii 1853
 * declarantes`, ASS 7 (1872) 751) or a quantity (`Indulgentia 50 dierum recitantibus`,
 * ASS 35 (1902) 759) carries none. It is a floor, not a count of the damage: a glue with no
 * token at the seam (`Ordinarios Brasiliae , qua utilia Epistola SSmi D. N. ad Eminentis-`,
 * ASS 27 (1894) 753) is invisible to it, so a page it names is woven for certain while a
 * page it passes over may still be woven on a line or two.
 */
const GLUED_LINE_RE = /(?:pag\.|»|>|\*|·|\.\s*\.|\.{2,})\s*(?=[\dOoiIlSsgB]{0,3}\d)[\dOoiIlSsgB]{1,4}(?:\s\d{1,2})?\s+\S.{14,}/;

/**
 * The corpus-wide offset scan (§5, the final fix wave of 2c-ii-a). A genuine page offset --
 * a stretch the scan skips, so that every printed number in it is the PDF page plus a
 * constant -- is invisible to the `header-mismatch` count, which is only ever raised where
 * an act opens; ASS 7 was found by hand and nothing said what else was there. This is the
 * test run over every page of every volume instead.
 *
 * A page **supports** a delta `d` when `headerAgrees` refuses its header, `headerAgreesASS`
 * admits it, and one of its header tokens normalises (`DIGIT_OCR`) to the page plus `d`,
 * `d` not zero -- that is, exactly the pages the relaxation lets through, since a misread
 * the relaxation already refuses can hide no offset. A page is **neutral** when its header
 * carries no readable number at all (the running title alone, which most verso pages of the
 * ASS print): it neither confirms an offset nor contradicts one, so a run bridges it. A
 * **run** is a maximal stretch beginning and ending on a supporting page, every page in it
 * supporting the same `d` or neutral, with at least `MIN_OFFSET_RUN` supporting pages.
 *
 * `headerAgreesASS` is called with volume 0, which `ASS_PAGE_OFFSETS` holds nothing for, so
 * ASS 7's own curated range still shows: a detector that cannot rediscover what is already
 * curated proves nothing about what is not.
 */
const MIN_OFFSET_RUN = 4;
interface OffsetRun {
  from: number;
  to: number;
  delta: number;
  /** The supporting pages in the run, and the neutral ones it bridges. */
  printed: number;
  bridged: number;
}
function offsetRuns(pages: readonly string[]): OffsetRun[] {
  const headerNumbers = (h: string): number[] => h.split(/\s+/)
    .map((t) => t.split('').map((c) => DIGIT_OCR[c] ?? c).join(''))
    .filter((d) => /^\d{1,4}$/.test(d)).map(Number);
  const supports: Set<number>[] = [];
  const neutral: boolean[] = [];
  pages.forEach((pg, i) => {
    const header = headerOf(pg);
    const ns = headerNumbers(header);
    neutral[i] = ns.length === 0;
    const set = new Set<number>();
    if (!headerAgrees(header, i + 1) && headerAgreesASS(header, i + 1, 0)) for (const n of ns) if (n !== i + 1) set.add(n - (i + 1));
    supports[i] = set;
  });
  const out: OffsetRun[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < pages.length; i++) for (const d of supports[i]!) {
    let a = i;
    while (a > 0 && (supports[a - 1]!.has(d) || neutral[a - 1]!)) a--;
    while (!supports[a]!.has(d)) a++;
    let b = i;
    while (b + 1 < pages.length && (supports[b + 1]!.has(d) || neutral[b + 1]!)) b++;
    while (!supports[b]!.has(d)) b--;
    let printed = 0;
    for (let k = a; k <= b; k++) if (supports[k]!.has(d)) printed++;
    const key = `${a}:${b}:${d}`;
    if (printed >= MIN_OFFSET_RUN && !seen.has(key)) { seen.add(key); out.push({ from: a + 1, to: b + 1, delta: d, printed, bridged: b - a + 1 - printed }); }
  }
  return out.sort((x, y) => x.from - y.from);
}

interface VolumeSurvey {
  volume: number;
  year: number;
  yearTo: number;
  pages: number;
  summa: { from: number; to: number } | null;
  summaHeading: string | null;
  summaEnd: string | null;
  /** Whether the papal part was reopened at a later papal heading (summa.ts): what tells the two meanings of `summaEnd === null` apart (§1's legend). */
  summaReopened: boolean;
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
   * Pages of the whole volume (not only where an act opens) whose header `headerAgrees`
   * refuses and `headerAgreesASS` admits: the corpus-wide latitude the relaxation holds
   * open, counted over every page so the next rule that reads more acts inherits the
   * number rather than rediscovering it (2c-ii Task 6, fix round 1).
   */
  latitude: number;
  /**
   * Where `parseSummaPapalPart` found no papal heading, the summa's own opening lines: the
   * spellings an era would have to teach it, quoted from the page rather than guessed.
   */
  summaOpening: string[];
  /** Summa pages `splitColumns` leaves woven, with the glued lines found on each (§4c). */
  woven: { page: number; glued: number }[];
  /** Papal-part rows whose text is two columns glued: the rows §4c costs this volume. */
  wovenRows: number;
  /**
   * A supplement bound in after the summa's own end -- its own document, not an index the
   * summa's own `to` boundary was ever meant to reach (§4d): found by a heading of the shape
   * `Supplementum ad "Acta S. Sedis"` anywhere from the summa's end to the volume's own last
   * non-blank page. `null` for every volume that prints none.
   */
  tail: { from: number; to: number; heading: string } | null;
  /** The highest page any papal-part row cites (§4d), or 0 where there are no rows. */
  maxRowPage: number;
  /** Runs of pages whose headers print a constant offset from the page, over the whole volume (§5). */
  offsets: OffsetRun[];
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

  // The columns that stay woven (§4c): a summa page `splitColumns` hands back with the two
  // columns' text still glued, counted over the unwoven output so that a page it cut at the
  // wrong gutter is caught as well as one it could not cut at all.
  const woven: { page: number; glued: number }[] = [];
  if (summa) {
    for (let p = summa.from; p <= summa.to; p++) {
      const glued = splitColumns(pages[p - 1] ?? '').filter((l) => GLUED_LINE_RE.test(l)).length;
      if (glued > 0) woven.push({ page: p, glued });
    }
  }

  // A supplement bound in after the summa's own end (§4d): the volume's own last non-blank
  // page, then a search from the summa's end (its excluded next-index page included, since
  // a supplement can follow that too) for a page opening with the supplement's own heading.
  let volumeEnd = pages.length;
  while (volumeEnd > 0 && pages[volumeEnd - 1]!.trim() === '') volumeEnd--;
  const TAIL_RE = /Supplementum\s+ad\s+["“]?\s*Acta\s+S\.?\s+Sedis/i;
  let tail: VolumeSurvey['tail'] = null;
  if (summa) {
    for (let p = summa.to; p < volumeEnd; p++) {
      const line = (pages[p] ?? '').split('\n').find((l) => l.trim() !== '')?.trim();
      if (line !== undefined && TAIL_RE.test(line)) { tail = { from: p + 1, to: volumeEnd, heading: line.replace(/\s+/g, ' ') }; break; }
    }
  }

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

  // The corpus-wide latitude (§5): every page of the volume, not only the ones an act opens
  // on, whose header `headerAgrees` refuses and `headerAgreesASS` admits.
  let latitude = 0;
  for (let p = 1; p <= pages.length; p++) {
    const header = headerOf(pages[p - 1] ?? '');
    if (!headerAgrees(header, p) && headerAgreesASS(header, p, v.volume)) latitude++;
  }

  return {
    volume: v.volume, year: v.year, yearTo: v.yearTo, pages: pages.length,
    summa, summaHeading: parsed.heading, summaEnd: parsed.end, summaReopened: parsed.reopened,
    rows: parsed.rows.length, claimed: check.claimed.length, unclaimed: check.unclaimed.length, omitted: check.omitted.length,
    acts: entries.length,
    byAnchor: { dateline: entries.filter((e) => e.anchor === 'dateline').length, heading: entries.filter((e) => e.anchor === 'heading').length },
    defects: byReason,
    brevia,
    candidates,
    mismatches: defects.filter((d) => d.reason === 'header-mismatch').map((d) => ({ page: d.page, header: (d.lines[0] ?? '').trim().slice(0, 40) })),
    latitude,
    summaOpening: parsed.heading !== null || summa === null ? []
      : pages.slice(summa.from - 1, summa.from + 1).flatMap((pg) => pg.split('\n'))
        .map((l) => l.trim()).filter((l) => l !== '' && !/^\d{1,4}$/.test(l)).slice(0, 6),
    woven,
    wovenRows: parsed.rows.filter((r) => GLUED_LINE_RE.test(r.raw)).length,
    tail,
    maxRowPage: parsed.rows.length > 0 ? Math.max(...parsed.rows.map((r) => r.page)) : 0,
    offsets: offsetRuns(pages),
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

/**
 * The date this report was last generated, as `GENERATED_ON` is in the phase-2c-i sibling
 * (`tools/ass-volumes-report.ts`): bumped by hand when the report is regenerated, so that a
 * re-run is reproducible. Read from the clock, the line changed whenever the calendar did
 * and put a spurious date into a commit whose only real change was elsewhere -- and the
 * three remaining 2c-ii tasks all verify themselves by diffing this report.
 */
const GENERATED_ON = '2026-09-23';

p('# The *Acta Sanctae Sedis*, all 41 volumes: the 2c-ii survey');
p();
p(`Generated by \`tools/survey-ass.ts\` on ${GENERATED_ON} from the volume texts in the local store, with the scanner and the`);
p('summa reader as they now stand ([ass volumes spec](../specs/2026-09-21-ass-volumes-design.md) §3, §4). It is a');
p('measurement: no source was added, no fixture written, no document touched. Its purpose was to decide how 2c-ii is');
p('split into eras and to put three numbers in front of the owner before any rule was written for them; it is re-run');
p(`after each rule, and this printing is the one of phase 2c-ii-a, which read the brevia (§3). ${surveyed.length} volumes read`);
p(`${only.length ? `(only ${only.join(', ')}, as asked on the command line)` : missing.length ? `(${missing.length} missing from the store: ${missing.join(', ')})` : '(every volume of the series)'};`);
p(`the five of the sample (${[...sampled].sort((a, b) => a - b).join(', ')}) are surveyed too, and their numbers are the ones their entries`);
p('fixtures carry, so a difference here would be a defect.');
p();
p('## 1. The yield, by volume');
p();
p('`acts` is what the scanner reads by rule, before any curated reading. A volume whose summa was not located is not');
p('scanned at all (`tools/scan-ass.ts` refuses to write a fixture for it), and shows as — throughout.');
p();
p('**“Part ends at” has three readings, and they are not the same finding.** A dicastery heading is the ordinary case:');
p('the papal part closed where the volume closed it. `**runs on**` is a **defect** — the parser met no dicastery heading');
p('it knows before the summa ended, so the dicasteries\' own rows are counted as the pope\'s and show as unclaimed (§4b).');
p('`**reopened, to the end**` is **not** a defect: the part paused at a dicastery heading, reopened at a later papal one');
p('(the shape ASS 8 (1874) 727-728 prints), and the papal rows after the reopening are the last thing the summa prints,');
p('so there is no closing heading to report. Both print no heading, and before this wave both printed `**runs on**`.');
p();
p('| Vol | Years | Pope | Pages | Summa | Papal heading | Part ends at | Acts | dateline | heading | Rows | Claimed | Unclaimed | Omitted | Defects | of them brevia | Sample |');
p('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const s of surveyed) {
  const defects = sum((x) => Object.values(x.defects).reduce((a, b) => a + b, 0), [s]);
  p(`| ${s.volume} | ${years(s)} | ${pope(s)} | ${s.pages} | ${s.summa ? `${s.summa.from}–${s.summa.to}` : '**none**'} | ${s.summaHeading ? md(s.summaHeading) : '—'} | ${s.summaHeading === null ? '—' : s.summaEnd ? md(s.summaEnd) : s.summaReopened ? '**reopened, to the end**' : '**runs on**'} | ${s.acts} | ${s.byAnchor.dateline} | ${s.byAnchor.heading} | ${s.rows} | ${s.claimed} | ${s.unclaimed} | ${s.omitted} | ${defects} | ${s.brevia} | ${sampled.has(s.volume) ? '✓' : ''} |`);
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
p('The owner ruled the brevia in on 2026-09-22 (spec §10) and phase 2c-ii-a wrote the rule: where an act closes under the');
p('ring of the Fisherman and no class heading stands behind it, the walk-back reads it from the pope\'s own name standing');
p('alone, takes the descriptive title above that name as the act\'s description, and gives it the class `BREVE`. Across the');
p('series that turned **61** of the 107 such defects into acts. The counts of §1 and §2 moved by more than that one');
p('number, so here is the ledger, measured per anchor over all 41 volumes under both checkouts rather than per defect row:');
p();
p('| | before | after | |');
p('|---|---|---|---|');
p('| acts | 380 | **442** | +62: the 61 above, and ASS 11 (1878) 594, which was no defect before at all — the rule\'s third dateline anchor, `DATUM_BROKEN_RE`, found it |');
p('| defects | 386 | **328** | −58: 79 removed (the 107 less the 28 left below) and 21 added |');
p('| anchors | 766 | 770 | +4, all `DATUM_BROKEN_RE` |');
p();
p('The 21 added defect rows are **10 `header-mismatch`, 9 `no-date`, 1 `unknown-pope`, 1 `no-heading`**, and they are two');
p('populations: **18 are ring-bearing defects that landed on an honester reason** than `no-heading` (9 `header-mismatch`,');
p('8 `no-date`, 1 `unknown-pope`) — the rule read the breve and the page or the date then refused it — and **3 are the');
p('other sites the third anchor found** (ASS 6 (1870) 324 `header-mismatch`, ASS 27 (1894) 79 `no-heading`, and, from the');
p('anchor at ASS 28 (1895) 112, the `no-date` at p. 111 — the quoted brief of the next paragraph). So the 107 divide:');
p('**61** became an entry, 9 `header-mismatch`, 8 `no-date`, 1 `unknown-pope`, and 28 are left.');
p();
p('**Two counts of the same population, and both are printed here.** The **107** is counted on the anchor text the rule');
p('gates on. The **105** is the same population counted on the defect\'s quoted lines — the measure the `of them brevia`');
p('columns of §1 and §2 use, and the one that now shows 28 — which misses two datelines that break `Annulo­ /');
p('Piscatoris` across the line end (ASS 9 (1876) 238, ASS 10 (1877) 93). Both end at the same 28. The survey of');
p('2026-09-22 measured 83 here because its own regex read only the lower-case `annulo`; the series prints `Annulo` 54');
p('times as well, and both are read now, which is why the figure the ruling was taken on should be read as 105, not 83.');
p();
p(`**${sum((s) => s.brevia)}** are left, and they are what the rule does not reach: a breve whose running header the OCR damaged, one`);
p('whose dateline prints no `die`, and — the shape 2c-ii should watch — **a brief quoted inside a later act**. The ASS');
p('reprint older briefs inside narratives and inside dicastery decisions, guillemets and all: ASS 28 (1895) 112 prints a');
p('brief of Pius IX of `16 Maii 1851` inside the `COMPENDIUM FACTI` of a Congregation case, and the ring anchor fires on');
p('the quotation. That one was stopped by `assDate`\'s span bound alone (a year more than ten before the volume\'s first is');
p('refused, so it is a `no-date` defect and not an act). **An in-span quotation with a pope\'s name above it would read as');
p('a spurious act**, and nothing in the rule would catch it: an era that meets a volume quoting recent briefs should');
p('measure that before trusting its brevia count.');
p();
p('**The second hazard of the same rule, recorded here and deliberately not fixed: one act is filed under the wrong');
p('class.** Where the walk-back finds no class word on the heading line, `readAct` (`ass.ts`) falls back to the class');
p('`BREVE`, which is right for the *Secretaria Brevium* — a breve\'s heading is a descriptive title and the ring it');
p('closes under declares its class — but it is a fallback, not a reading. **ASS 21 (1888) p. 513** prints');
p('`CONSTITUTIO SSmi D. N. Leonis XIII de Licaeo magno Quebecensi.` (l. 3) over `LEO PP. XIII.` (l. 5) and closes under');
p('the ring, so the scanner reads it, takes that line as its description, finds in it no class word `CLASS_HEADINGS`');
p('knows, and files it `BREVE` — shelf class `brief` — where the volume itself says *Constitutio*. All **89** `BREVE`');
p('entries the series yields were checked, and this is the only one whose own description names a different class.');
p();
p('**The rule for it is an era\'s to decide, not this phase\'s.** Adding a bare `CONSTITUTIO` to `CLASS_HEADINGS` would');
p('fire wherever that word opens a caps line anywhere in the 30,021 pages, the bodies of acts that quote a constitution');
p('included, and that blast radius has not been measured. The era that takes ASS 21 measures it before writing the rule,');
p('or answers this one page with a curated reading; until then the entry stands as it is, recorded here with the volume,');
p('the page and the printed heading so it cannot be lost.');
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
p(`\`parseSummaPapalPart\` knows ${PAPAL_HEAD_FORMS.length} papal-heading forms, each cited in its own doc comment at`);
p(`the volume that prints it (\`PAPAL_HEAD_FORMS\`, \`tools/src/acta/summa.ts\`) — for example \`${PAPAL_HEAD_FORMS[0]!.prints}\``);
p(`(${PAPAL_HEAD_FORMS[0]!.at}) and \`${PAPAL_HEAD_FORMS[PAPAL_HEAD_FORMS.length - 1]!.prints}\` (${PAPAL_HEAD_FORMS[PAPAL_HEAD_FORMS.length - 1]!.at}).`);
p('Where it finds none, the summa is read as having no papal part at all and the volume claims nothing — which is why');
p('a volume can scan acts and still show 0 rows. These are the volumes\' own opening lines, quoted from the page: the');
p('spellings an era would teach the parser, and the reason the yield of §2 is a floor and not a measurement for them.');
p();
p('| Vol | The summa\'s first lines, as printed |');
p('|---|---|');
for (const s of surveyed.filter((x) => x.summaOpening.length > 0)) {
  p(`| ${s.volume} | ${s.summaOpening.map((l) => `\`${md(l)}\``).join(' / ')} |`);
}
p();
p('The part now pauses at the first dicastery heading `DICASTERY_RE` knows, rather than stopping outright, and');
p('reopens at a later papal heading if one follows (ASS 8 (1874) 727-728 prints that shape).');
p();
p('**What `**runs on**` in §1 does and does not say.** It marks the narrow case where the parser reached the summa\'s');
p('end without meeting any dicastery heading at all, and no volume shows it. **That is not the same as saying no papal');
p('part still carries dicastery rows.** A part that runs past a heading the parser does not know and stops at a later');
p('one it does know reports that later heading and shows no marker, while the rows in between — the dicastery\'s — have');
p('already been counted as the pope\'s. Until the final fix wave of 2c-ii-a three volumes were in exactly that state,');
p('printing `EX SACRO CONSISTORIO` (ASS 37 (1904) 799, ASS 38 (1905) 417, ASS 40 (1907) 770), which `SACRA\\b` does not');
p('match, and `ACTA ROMANARUM CONGREGATIONUM` (ASS 35 760, 36 760, 37 800, 38 418, 39 626, 40 771, 41 801); both forms');
p('are now read, and the rows they were costing are gone from the papal parts of ASS 37, 38 and 40 (§7 fell from 668');
p('rows to 658 and 344 claimed to 342 — the claimed share **rises**, because what left was never the pope\'s).');
p();
p('**One volume is still in that state, and no rule can reach it: ASS 27 (1894).** Its papal part carries 47 rows, of');
p('which 4 are claimed and 43 unclaimed, and only the first five rows are the pope\'s: rows 7-47, forty-one of the');
p('forty-seven, are the Congregation of the Council\'s own case rows (`Firmana postulatum circa resignationem');
p('beneficiorum`, `Varsavien, dispensationis matrimonii`, `Nolana annuae praestationis`, …). **The cause is not a');
p('spelling the parser lacks.** The volume\'s first dicastery heading falls on summa p. 753, one of the woven pages of');
p('§4c, and the extraction has destroyed it: all that survives of it in the text is the bare word `EX`, glued to the end');
p('of the left column\'s line 33 — `Propagarne Fidei » fovetur et EX` — with the rest of the heading absent from the');
p('page altogether. No `^\\s*EX` can match that, and there is no heading left to teach the parser. The part therefore');
p('runs on to the first heading a later page does not damage, `EX S. CONGR. RITUUM` (p. 756), and the rows between are');
p('counted as the pope\'s. **This is §4c seen from the other side**: a loss for an era to curate by hand, not a rule to');
p('write. ASS 27\'s **43 unclaimed rows are a known floor**, and every claimed percentage that includes the volume —');
p('the 1890s row of §2, the Leo XIII row, and 2c-ii-c\'s own span — is a floor by that much.');
p();
p('**And it is the only one left that can be looked for.** Every caps line inside every volume\'s papal part — between the');
p('papal heading and the heading the part ends at — was read: across all 41 summae not one of them is a dicastery');
p('heading. They are second lines of the papal heading itself (`ET ACTA ROM. PONTIFICIS`, `R. PONTIFICIS`, `PUBLICI');
p('IURIS FACTA`), the summa\'s own subtitle (`QUAE IN HOC VOLUMINE XXI. CONTINENTUR`), or, in ASS 16, body capitals from');
p('the column the extraction interleaved. **The search has one blind spot and ASS 27 is in it**: a heading the');
p('extraction has destroyed leaves no caps line to find, which is why that volume was caught by its unclaimed count and');
p('not by this search. A volume whose unclaimed rows run far ahead of its claimed ones is the signal to read next.');
p();
p('## 4c. The summa pages whose two columns stay woven');
p();
p('The summae of ASS 1-36 are set in two columns, which the layout mode prints side by side on one line, so the left');
p('column\'s page tokens sit mid-line and close no row. `splitColumns` unweaves them by finding the gutter -- the column');
p('the most lines\' runs of four or more spaces cover, at column 25 or beyond and on four or more lines -- and cutting');
p('each line there. Where the columns touch, no run covers one column on enough lines, and the page comes back as');
p(`printed: a row's description is the two columns' text glued and its page token may belong to the other column. That`);
const wovenVols = surveyed.filter((x) => x.woven.length > 0);
const wovenPages = sum((x) => x.woven.length);
p(`happens on **${wovenPages}** ${wovenPages === 1 ? 'page' : 'pages'} of **${wovenVols.length}** ${wovenVols.length === 1 ? 'volume' : 'volumes'}, carrying ${sum((x) => x.woven.reduce((n, w) => n + w.glued, 0))} glued lines between them.`);
p();
p('These are counted by a leader-anchored measure over `splitColumns`\' own output — a page token introduced by one of');
p('`ROW_END_RE`\'s leaders with fifteen or more further characters behind it (`GLUED_LINE_RE`) — and not by a heuristic');
p('over the raw page\'s spacing. An earlier spacing heuristic was unreliable in both directions: it flagged pages of the');
p('single-column *Index analyticus* of ASS 37 and 39-41, whose columns do not exist, and missed genuinely woven pages,');
p('among them ASS 23 (1890) 753 — the page phase 2c-i curated — and ASS 35 (1902) 762. The count above is the one to');
p('use.');
p();
p('| Vol | Summa | Woven pages (glued lines) | Papal rows | of them glued |');
p('|---|---|---|---|---|');
for (const s of wovenVols) {
  p(`| ${s.volume} | ${s.summa ? `${s.summa.from}–${s.summa.to}` : '—'} | ${s.woven.map((w) => `${w.page} (${w.glued})`).join(', ')} | ${s.rows} | ${s.wovenRows} |`);
}
p();
p('**No rule can unweave these pages, and none was written.** Read with `cat -A`, the two columns of ASS 27 (1894) 753');
p('are one space apart -- `Epistola SSmi D. N. Leonis XIII ad tes 583`, where the left column\'s `… ad` is butted');
p('straight against the right column\'s `tes 583` -- and so are those of ASS 23 (1890) 753 (`Motti-Proprio SSmi D. N.');
p('Leo- tita gtatia indui gel ur Episcopo`) and ASS 26 (1893) 756 (`nis ven. Servae Dei luliae Bil- Toletana seu');
p('Corduben. decretum`). Widening the gutter search from runs of four spaces to runs of three, or even of two, moves');
p('the gutter it finds on **none** of these pages: the run it would look for does not exist, because the extraction has');
p('collapsed the space between the columns to a single character. Nor are the columns still aligned: on ASS 27 (1894)');
p('753 the right column begins at character 35, 36, 37 and 39 on four consecutive lines, so a cut at a fixed column');
p('would fall inside the left column\'s last word. Nor would cutting at the seam\'s own page token do: the tokens are');
p('too few. On ASS 27 (1894) 753, 26 of the 38 lines carry both columns, and 3 of them show a leader and a page token');
p('at the seam; on ASS 27 (1894) 754, 3 of 33; on ASS 23 (1890) 753, 8 of 30; on ASS 26 (1893) 756, 11 of 25. A rule');
p('reading the token would leave the other four in five glued, and would guess wrong wherever a description carries a');
p('numeral of its own. These pages are a **loss for the eras to curate**, as phase 2c-i curated ASS 23 (1890) 753, not');
p('a rule to write.');
p();
p('The opposite defect -- a single column the detector cut anyway -- does not occur. ASS 7 and ASS 11 set their summae');
p('in one column and no page of either is cut; ASS 37-41\'s single-column *Index analyticus* has a handful of pages cut,');
p('but on every one of them the only lines cut are centred headings and running titles, whose leading indent is the run');
p('the search found (`EX SACRA POENITENTIARIA`, ASS 40 (1907) 781; `Index alphabeticus`, ASS 39 (1906) 635). No line of');
p('index text is bisected.');
p();
p('Most of the woven pages cost the check nothing: they fall in the dicastery sections, which `parseSummaPapalPart` does');
p('not read. The last two columns of the table are the price actually paid -- the volumes whose papal part is set on a');
p('woven page, and the rows of it that come out glued. Each glued row is two rows lost at once: the left column\'s, whose');
p('description runs on, and the right column\'s, whose page the row carries instead.');
p();
p('## 4d. A volume with a supplement bound in after its own summa');
p();
const tailed = surveyed.filter((s) => s.tail !== null);
// The prose of this section was read off ASS 38's own pages and holds for ASS 38 alone; the
// loop below prints a row for whatever the search finds. Guarded so that a volume newly
// appearing here is announced as unread rather than described in ASS 38's words.
if (tailed.length === 0) {
  p('No volume of the series prints a supplement after its own summa. (The search is for a heading of the shape');
  p('`Supplementum ad "Acta S. Sedis"` on any page from the summa\'s end to the volume\'s own last non-blank page.)');
} else if (tailed.length === 1 && tailed[0]!.volume === 38) {
  p('A volume\'s summa runs to its own last non-blank page in every case but one. ASS 38 (1905-06) prints, after its own');
  p('Index Analyticus and Index Alphabeticus close on p. 432 with the volume\'s own `IMPRIMATUR`, a separately paginated');
  p('*Supplementum ad "Acta S. Sedis"* -- a dossier of French Church-State-separation correspondence, its own front');
  p('matter, and its own closing *Table des matières* -- bound in afterward and found here by its own opening heading:');
} else {
  p(`A volume's summa runs to its own last non-blank page in every case but ${tailed.length}: ASS ${tailed.map((x) => x.volume).join(', ')}. Each prints,`);
  p('after its own index closes, a separately paginated *Supplementum ad "Acta S. Sedis"*, found here by its own opening');
  p('heading. **Only ASS 38 has been read by hand** (the paragraph after the table); any other volume in this table is a');
  p('new finding and its numbers below are unconfirmed.');
}
p();
p('| Vol | Summa | Supplement | Pages | Its own heading, as printed |');
p('|---|---|---|---|---|');
for (const s of tailed) {
  const t = s.tail!;
  p(`| ${s.volume} | ${s.summa ? `${s.summa.from}–${s.summa.to}` : '—'} | ${t.from}–${t.to} | ${t.to - t.from + 1} | \`${md(t.heading)}\` |`);
}
p();
const ass38 = tailed.find((x) => x.volume === 38);
if (ass38) {
  p('The volume\'s own index cites nothing past p. 415 (`Normae pro examinibus Concionatorum iuxta Notificationem diei io');
  p('Aug. 1905 415`, under `EX VICARIATU URBIS`, ASS 38 (1905) 423) -- above the papal part\'s own highest row, p.');
  p(`${ass38.maxRowPage} -- so the body the scanner reads, 1-${ass38.summa!.from - 1}, is the volume's real body, not a`);
  p(`measurement cut short: its ${ass38.acts} acts are its real yield. The supplement is indexed too, but as one row each`);
  p('under `EX SECRETARIA STATUS` and `APPENDICES` (both citing its own `1-27S`/`1-273` pagination, ASS 38 (1905) 418');
  p('and 423) -- a single item, not further per-document acts -- so nothing in `CLASS_HEADINGS` or the scanner\'s anchors');
  p('would find acts in a dossier the volume\'s own index already treats as one citation, and no era should look here');
  p('for a rule.');
}
for (const s of tailed.filter((x) => x.volume !== 38)) {
  p(`**ASS ${s.volume}'s supplement has not been read by hand.** Its papal part's highest row is p. ${s.maxRowPage}, the body the scanner`);
  p(`reads is 1-${s.summa!.from - 1} and yields ${s.acts} acts; whether its own index treats the supplement as a single citation, as`);
  p('ASS 38\'s does, is for the era that takes the volume to read off the page.');
}
p();
p('## 5. `header-mismatch`: OCR noise, or a page offset?');
p();
p(`**${sum((s) => s.defects['header-mismatch'])}** across the series, down from 48 (2c-ii Task 6, on this survey's evidence): every one of the 48 was the OCR's`);
p('reading of the right number, confirmed against its volume\'s neighbouring pages, and none of the 48 sits in a run -- a volume whose pages are');
p('genuinely offset would show them in a run, at every page (the sample\'s own 9 fell to 3, finding 15d). That is what the 48 measures, and no');
p('more: the series *does* hold a genuine offset the 48 never counted, because no act ever opened inside it to be checked, and the scan below');
p('is what settles how many such stretches there are.');
p('`headerAgreesASS` (ass.ts) is the ASS-only relaxation the ruling took: a `DIGIT_OCR` letter (summa.ts) stands for any digit rather than the');
p('one it is keyed to, and, unlike `headerAgrees` itself (recover.ts, kept as it was for the AAS page recovery), an all-digit token one edit from');
p('the page agrees too. 40 of the 48 agree by that rule; the other 8 below are two edits or worse, or a page number the OCR splits across two');
p('lines `headerOf`\'s single line cannot reach -- three of them (ASS 33 p. 449, ASS 41 pp. 298, 495) already answered by a curated reading');
p('regardless (`ASS_READINGS`, curation.ts), five not (ASS 8 pp. 373, 686; ASS 10 p. 49; ASS 13 p. 3; ASS 16 p. 241), each confirmed OCR noise');
p('the same way but too far from the page to admit without also risking a page whose header truly disagrees.');
p();
const runs = surveyed.flatMap((s) => s.offsets.map((r) => ({ volume: s.volume, ...r })));
const runVols = [...new Set(runs.map((r) => r.volume))];
p(`**The offset scan, run over every page of the series.** The argument above — that a genuine offset would show as a *run* and that the 48`);
p('show none — was made from the 48 pages where an act happens to open, which is the one place an offset is guaranteed not to be looked for.');
p(`So it was run properly: over all ${sum((s) => s.pages).toLocaleString('en-US')} pages, a page **supports** a delta when \`headerAgrees\` refuses its header, \`headerAgreesASS\``);
p('admits it, and one of its header tokens normalises to the page plus that delta; a page whose header carries no number at all is bridged;');
p(`and a **run** is a stretch of at least ${MIN_OFFSET_RUN} supporting pages sharing one delta. \`headerAgreesASS\` is asked with volume 0, which \`ASS_PAGE_OFFSETS\``);
p(`holds nothing for, so ASS 7's own curated range still shows. **${runs.length} runs, in ${runVols.length} volumes**, and they fall into three kinds:`);
p();
p('| Vol | PDF pages | Delta | Pages printing it | Bridged | What it is |');
p('|---|---|---|---|---|---|');
const KIND: Readonly<Record<string, string>> = {
  '7': 'the ASS 7 offset (below), in fragments because the pages where +2 changes two digits are refused',
  '16': 'the volume\'s separately paginated **supplement** (the PDF is named `…+supplemento-17-96`; its pages are headed `APPENDIX XXXII.`, p. 587) -- not the volume\'s own pagination',
  '38': 'the separately paginated French ***Supplementum*** of §4d, numbered from 1 -- not the volume\'s own pagination',
};
for (const r of runs) {
  p(`| ${r.volume} | ${r.from}–${r.to} | ${r.delta > 0 ? '+' : ''}${r.delta} | ${r.printed} | ${r.bridged} | ${KIND[String(r.volume)] ?? 'a repeated **digit misread** (below)'} |`);
}
p();
p('**One is a genuine offset, and the relaxation is guarded against it.** ASS 7 (1872) skips printed pp. 496-497 in the scan: PDF');
p('p. 495 prints `495` (correct), PDF p. 496 prints `498 Litterae Apostolicae` (the offset begins), and the +2 delta holds unbroken to PDF');
p('p. 547 (`549`), closing at PDF p. 548, which prints `548` again. The range sits inside the scanned body (the volume\'s summa begins at PDF');
p('p. 751), but no act opens there today -- its defects in that stretch are all `no-heading`, so no page in it ever reached the header check --');
p('which is why the 48 above never counted it and why nothing downstream moved when it was found. It is curated, not folded into the rule:');
p('`ASS_PAGE_OFFSETS` (curation.ts) keys volume 7 to PDF pp. 496-547, and `headerAgreesASS` refuses inside a listed range exactly as');
p('`headerAgrees` alone does, so an era that later reads an act at PDF p. 500 is not handed page 502. The scan reports it in fragments');
p('rather than as one range because the relaxation refuses the pages where +2 changes two digits (`510` for 508), which is the scan working');
p('as defined: it can only see what the relaxation can let through.');
p();
p('**Three of the runs are separately paginated matter bound into the volume, not an offset of anything.** ASS 16\'s supplement');
p('(the PDF is named `ASS-16-1883-84-1-576+supplemento-17-96`, and its pages carry `APPENDIX XXXII.` from PDF p. 587) and ASS 38\'s');
p('*Supplementum ad "Acta S. Sedis"* (§4d, paginated 1-273) each carry their own numbering and print two-digit numbers; the relaxation');
p('admits them against a three-digit PDF page only because a two-digit token is one edit from a three-digit one. They are real latitude');
p('and no offset: an era reading in them would be reading the supplement\'s own pages, which the volume\'s index already treats as one');
p('citation.');
p();
p('**Every other run is one digit misread, repeating across a signature -- and none of them is an offset.** They are the 3/5 confusion the');
p('paragraph above already documents, and once the 5/8 (ASS 13): +200 is a `3` read as `5` in the hundreds (ASS 8 374-378, ASS 29 385-391,');
p('ASS 33 387-390), +300 a `5` read as `8` (ASS 13 518-521), and **+20 a `3` read as `5` in the tens** — the two runs that look most like an');
p('offset, **ASS 29 (1896) PDF pp. 530-533** (headers print `550`-`553`) and **ASS 33 (1900) PDF pp. 436-439** (headers print `456`-`459`),');
p('the latter in a volume the sample uses as a fixture. `headerAgreesASS` admits all eight of those pages, so the question is not academic.');
p();
p('**They are misreads, and the volumes prove it themselves.** A page offset means the printed numbers in the range exist nowhere else in the');
p('volume; here they do. ASS 29 PDF p. 550 prints `550 CASTRIMARIS` and PDF p. 552 prints `552`, under a different running title from the');
p('`VARSAVIEN. SEU PARISIEN.` of PDF pp. 530-533 — the same printed numbers in two physical places, which only a misread can produce.');
p('ASS 33 is the same: PDF p. 456 prints `456 EX S. G. CONCILII` and PDF p. 458 `458 EX S. G. CONCILII` (`CAESENATEN. SEU RAVENNATE`),');
p('while PDF pp. 436-439 print `456`-`459` under `EX S. C. RITUUM`. Both runs are bounded by pages printing the correct number — ASS 29');
p('p. 529 `529` and p. 534 `534`, ASS 33 p. 435 `435` and p. 440 `440` — and a pagination cannot skip twenty pages and then un-skip them');
p('four pages later. The same test disposes of the +200 runs (ASS 29 and ASS 33 both print `586`-`591` at PDF pp. 586-591, under other');
p('running titles; ASS 8 prints `576` and `578` at PDF pp. 576 and 578) and of ASS 13, whose volume has only 592 pages and so has no p. 818');
p('at all. **Nothing is added to `ASS_PAGE_OFFSETS`**: an entry there would refuse pages whose headers are merely misread, which is the');
p('opposite of what the table is for.');
p();
p(`**The relaxation's corpus-wide latitude**, now that ASS 7's range is guarded: \`headerAgreesASS\` admits **${sum((s) => s.latitude).toLocaleString('en-US')}**`);
p(`of the series' **${sum((s) => s.pages).toLocaleString('en-US')}** pages (${(100 * sum((s) => s.latitude) / sum((s) => s.pages)).toFixed(1)} %) that \`headerAgrees\` refuses, counted over every page of every`);
p('volume, not only the 48 above where an act happened to open -- so the next rule that reads more acts from the body inherits the latitude');
p('knowingly rather than rediscovering it.');
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
