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
import { checkSumma, locateSumma, parseSummaPapalPart, splitColumns, PAPAL_HEAD_FORMS } from './src/acta/summa.js';
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
    woven,
    wovenRows: parsed.rows.filter((r) => GLUED_LINE_RE.test(r.raw)).length,
    tail,
    maxRowPage: parsed.rows.length > 0 ? Math.max(...parsed.rows.map((r) => r.page)) : 0,
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
p('reopens at a later papal heading if one follows (ASS 8 (1874) 727-728 prints that shape). `**runs on**` in §1 marks');
p('only a papal part whose end is still a dicastery heading the parser does not know — the same defect from the other');
p('side, a volume\'s dicastery rows counted as the pope\'s and shown as unclaimed; none remain as of this survey.');
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
p('A volume\'s summa runs to its own last non-blank page in every case but one. ASS 38 (1905-06) prints, after its own');
p('Index Analyticus and Index Alphabeticus close on p. 432 with the volume\'s own `IMPRIMATUR`, a separately paginated');
p('*Supplementum ad "Acta S. Sedis"* -- a dossier of French Church-State-separation correspondence, its own front');
p('matter, and its own closing *Table des matières* -- bound in afterward and found here by its own opening heading:');
p();
p('| Vol | Summa | Supplement | Pages | Its own heading, as printed |');
p('|---|---|---|---|---|');
const tailed = surveyed.filter((s) => s.tail !== null);
for (const s of tailed) {
  const t = s.tail!;
  p(`| ${s.volume} | ${s.summa ? `${s.summa.from}–${s.summa.to}` : '—'} | ${t.from}–${t.to} | ${t.to - t.from + 1} | \`${md(t.heading)}\` |`);
}
p();
p('The volume\'s own index cites nothing past p. 415 (`Normae pro examinibus Concionatorum iuxta Notificationem diei io');
p('Aug. 1905 415`, under `EX VICARIATU URBIS`, ASS 38 (1905) 423) -- above the papal part\'s own highest row, p.');
for (const s of tailed) {
  p(`${s.maxRowPage} (ASS ${s.volume}) -- so the body the scanner reads, 1-${s.summa!.from - 1}, is the volume's real body, not a`);
  p(`measurement cut short: its ${s.acts} acts are its real yield. The supplement is indexed too, but as one row each`);
}
p('under `EX SECRETARIA STATUS` and `APPENDICES` (both citing its own `1-27S`/`1-273` pagination, ASS 38 (1905) 418');
p('and 423) -- a single item, not further per-document acts -- so nothing in `CLASS_HEADINGS` or the scanner\'s anchors');
p('would find acts in a dossier the volume\'s own index already treats as one citation, and no era should look here');
p('for a rule.');
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
