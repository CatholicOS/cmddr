/**
 * The page recovery of phase 2b-iii-b (acta volumes spec §10.3): for an entry the
 * chronological index opened without a page -- the OCR of AAS 1-17 (1909-1925) lost the
 * page column on most index pages, and the numbers are absent from the text layer in every
 * extraction mode (§10.1) -- the act's first page is read from the volume body, where every
 * act opens with its incipit and every page carries its number. The search is constrained
 * to the category's page runs from the volume's *Index generalis actorum* (which prints
 * runs, not pages: `LITTERAE APOSTOLICAE, 6-9, 185-194, …`), a tie between several hits is
 * settled by the act's own dating formula, and an incipit the OCR damaged on one side or
 * the other is retried with a bounded fuzzy match. A recovery is accepted only when it is
 * unique; everything else is reported, never guessed.
 *
 * The tool (tools/recover-acta-pages.ts) runs this once per volume against the whole-volume
 * text in the local store and writes the sidecar `aas-{vol}-{year}.pages.json` beside the
 * fixture, quoting the body line, the running header and the formula each page rests on;
 * the join reads the sidecar offline (applyPageRows, join.ts) and never the store.
 */
import { categoryForHeading } from './categories.js';
import type { ActaEntry, ActaParseResult, PagelessEntry } from './index.js';
import type { ActaSource } from './join.js';

/** The key a sidecar row and a curated reading name a pageless entry by: what the index line prints, minus the page. */
export const pagelessKey = (e: { date: string; category: string; incipit: string | null; description: string }): string =>
  `${e.date}|${e.category}|${e.incipit ?? ''}|${e.description.slice(0, 60)}`;

/** The sidecar beside a source's fixture: `tools/fixtures/acta/aas-13-1921.pages.json`. */
export const sidecarPath = (source: Pick<ActaSource, 'file'>): string => source.file.replace(/\.txt$/, '.pages.json');

/**
 * Where a recovered entry lands among `entries` that share its pope and category
 * (controller ruling 13): right after the last such entry whose date does not follow
 * it -- i.e. before the first later-dated one of the group; before the group's first
 * entry when every one of the group is later-dated; appended at the end when the pope
 * and category open no group at all. Every pre-existing entry keeps its position
 * relative to every other pre-existing entry -- only the recovered entry moves.
 */
function groupInsertionIndex(entries: readonly ActaEntry[], entry: ActaEntry): number {
  let firstOfGroup = -1;
  let lastNotLater = -1;
  for (let i = 0; i < entries.length; i++) {
    const e = entries[i]!;
    if (e.pope !== entry.pope || e.category !== entry.category) continue;
    if (firstOfGroup < 0) firstOfGroup = i;
    if (e.date <= entry.date) lastNotLater = i;
  }
  if (firstOfGroup < 0) return entries.length;
  return lastNotLater >= 0 ? lastNotLater + 1 : firstOfGroup;
}

/**
 * Give pageless entries their pages from sidecar rows or curated readings: each row's key
 * names a pageless entry, which becomes an entry with the page and `pageSource`, inserted
 * into its own pope/category group (`groupInsertionIndex`) rather than resorted among all
 * entries -- a full resort would reorder the parser's category-grouped entries, which a
 * category-by-category report (create.ts, the reports) depends on. A key no pageless entry
 * answers to is a stale row -- the fixture or the parser changed under it -- and a hard
 * error, as a stale correction is. Returns the number of entries moved.
 */
export function applyPageRows(result: ActaParseResult, rows: readonly { key: string; page: number; source: 'recovered' | 'reading' }[], label: string): number {
  let n = 0;
  for (const row of rows) {
    const i = result.pageless.findIndex((e) => pagelessKey(e) === row.key);
    if (i < 0) throw new Error(`stale page row ${row.key} in ${label}: no entry of the fixture is opened without a page under that key`);
    const [e] = result.pageless.splice(i, 1);
    const entry: ActaEntry = { ...e!, page: row.page, pageSource: row.source };
    result.entries.splice(groupInsertionIndex(result.entries, entry), 0, entry);
    result.stats.recovered++;
    n++;
  }
  return n;
}

export type PageRun = [number, number];

export interface IndexGeneralis {
  /** The 1-based page of the *Index generalis actorum* in the volume text, or null when none was found. */
  page: number | null;
  /** The page runs per category id (categories.ts), in print order. */
  runs: Map<string, PageRun[]>;
  /** Headings of the pope part the category table does not list, as printed. */
  unmapped: string[];
}

// AAS 1-12 (1909-1920) title the same table `INDEX GENERALIS RERUM`, not `...ACTORUM`
// (AAS 1 (1909) 833: `INDEX GENERALIS RERUM` / `ACTA PII PP. X.` / `CONSTITUTIONES, 5, 7,`
// / `LITTERAE APOSTOLICAE, 197, 229, ...` -- the same heading/comma/page-run structure).
const GENERALIS_RE = /INDEX\s+GENERALIS\s+(?:ACTORUM|RERUM)/;
/** The pope part's end: the dicasteries' part (`II. - ACTA SACRARUM CONGREGATIONUM`, `ACTA SS. CONGREGATIONUM`) or the next index. */
// The numeral prefix's class matches the parser's own `PART_HEADING_RE` (index.ts): AAS 17
// (1925) reads the part end `IL - ACTA` (roman `II.` misread as `IL`) on its own line,
// before `SACRARUM CONGREGATIONUM` on the next. AAS 1-7 (1909-1915) bound the dicasteries'
// part with `SACRAE CONGREGATIONES.` alone, no `ACTA` token: AAS 2 (1910) 979 reads `SERMO,
// 906.` then `SACRAE CONGREGATIONES.` on its own line, before `S. CONGREGATIO S. OFFICII,
// 55, 100, ...`.
const PART_END_RE = /^\s*(?:[A-Za-z0-9]{1,4}\.?\s*[–—-]\s*)?ACTA\s*$|^\s*(?:[A-Za-z0-9]{1,4}\.?\s*[–—-]\s*)?ACTA\s+(?:SACRARUM|SS\.)\s+CONGREGATION|^\s*(?:[A-Za-z0-9]{1,4}\.?\s*[–—-]\s*)?SACRAE\s+CONGREGATIONES\.?\s*$|^\s*INDEX\s+DOCUMENTORUM/;
/** `EPISTOLAE, 10-12, 89-91, 195 s.,` -- a heading in capitals, a comma, then pages. */
const HEADING_LINE_RE = /^\s*([A-Z][A-Z .'’]+?)\s*[,:]\s*(.*)$/;
/** A continuation line: pages only. */
const PAGES_LINE_RE = /^\s*[\d\s,.\-–s]+$/;

/**
 * The *Index generalis actorum* at the head of a volume's indexes: per category of the
 * pope's part, the pages the volume prints its acts at, as runs. The page is searched from
 * the volume's midpoint (the indexes sit in the tail). A run the line break splits
 * (`294-` / `307`) is joined before reading; `195 s.` (*et sequens*) is the page and the
 * next. A singleton run (`readRuns` reads one bare page, not a range) is not a single-page
 * act but a section start -- the *Index generalis* prints, per category, the page each
 * fascicle's section for that category opens at, not the page of every act in it (AAS 4
 * (1912) 745: `EPISTOLAE, 23, 51, 98, 138, …`; the letter *Est sane* opens at p. 140,
 * inside the section that starts at 138, not on 138 itself) -- so it is extended, after
 * every category is read, to the page before the next section start of *any* category; the
 * run with no later start -- the last section of the pope's part -- extends to
 * `lastBodyPage`, the part's last page (controller ruling 17; the CLI passes the page
 * before the *Index generalis*), and keeps its own page when none is given. A heading whose
 * page list reads as empty (AAS 16 (1924) 507: `LITTERAE ENCYCLICAE, 5 (12)`, which
 * `readRuns` skips) sets no run list at all: an empty list would exclude every page, where
 * no list searches the whole part with the formula required (`recoverPages`). Measured on
 * AAS 13 (1921) p. 571 and AAS 4 (1912) p. 745.
 */
export function parseIndexGeneralis(pages: readonly string[], lastBodyPage?: number): IndexGeneralis {
  const start = findIndexGeneralis(pages);
  const runs = new Map<string, PageRun[]>();
  const unmapped: string[] = [];
  if (start < 0) return { page: null, runs, unmapped };
  // The part may run onto the next page; read until the pope part ends.
  const text = pages.slice(start, start + 3).join('\n');
  const lines = text.split('\n').map((l) => l.replace(/\s+$/, ''));
  let inPope = false;
  let heading: string | null = null;
  let buffer = '';
  const flush = () => {
    if (heading === null) return;
    const cat = categoryForHeading(heading);
    const id = cat?.id ?? heading;
    if (cat === null) unmapped.push(heading);
    const rs = readRuns(buffer);
    if (rs.length > 0) runs.set(id, [...(runs.get(id) ?? []), ...rs]);
    heading = null;
    buffer = '';
  };
  for (const line of lines) {
    // The pope's name token is any run of non-space characters, not `[A-Z]+`: AAS 16
    // (1924) 507 reads the opening line `I. - ACTA £'11 PP. XI` (`PII` garbled to `£'11`).
    if (!inPope) { if (/^\s*(?:[IVX]+\.?\s*[–—-]\s*)?ACTA\s+\S+\s+PP\./.test(line)) inPope = true; continue; }
    if (PART_END_RE.test(line)) { flush(); break; }
    const h = line.match(HEADING_LINE_RE);
    if (h && !PAGES_LINE_RE.test(line)) { flush(); heading = h[1]!.trim(); buffer = h[2]!; continue; }
    if (heading !== null && PAGES_LINE_RE.test(line)) buffer += ' ' + line.trim();
  }
  flush();
  extendSingletonRuns(runs, lastBodyPage);
  return { page: start + 1, runs, unmapped };
}

/** The 0-based index of the *Index generalis* page in the volume text, searched from the midpoint, or -1. */
export const findIndexGeneralis = (pages: readonly string[]): number =>
  pages.findIndex((t, i) => i >= Math.floor(pages.length / 2) && GENERALIS_RE.test(t));

/**
 * A singleton run `[s, s]` is a section start (see `parseIndexGeneralis`'s comment):
 * extended in place to end the page before the next section start of any category in the
 * pope's part, collected once over every category before any run is extended, so the
 * result does not depend on the categories' print order; the singleton no start follows
 * ends at `lastBodyPage` when that is given and lies past it (AAS 7 (1915): the last
 * `EPISTOLAE` start 589 runs to the part's end, where the letter *Communis vestra* to the
 * Brazilian bishops opens at p. 591). An explicit range or a `195 s.` pair (already
 * `[195, 196]`) is untouched.
 */
function extendSingletonRuns(runs: Map<string, PageRun[]>, lastBodyPage?: number): void {
  const starts = [...runs.values()].flatMap((rs) => rs.map(([s]) => s)).sort((a, b) => a - b);
  for (const rs of runs.values()) {
    for (const r of rs) {
      if (r[0] !== r[1]) continue;
      const next = starts.find((s) => s > r[0]);
      if (next !== undefined) r[1] = next - 1;
      else if (lastBodyPage !== undefined && lastBodyPage > r[0]) r[1] = lastBodyPage;
    }
  }
}

/** `6-9,185-194,294- 307, 195 s., 553.` -> runs; a dangling `294-` joins the number after it. */
function readRuns(text: string): PageRun[] {
  const joined = text.replace(/(\d)\s*[-–]\s+(\d)/g, '$1-$2').replace(/\.\s*$/, '');
  const out: PageRun[] = [];
  for (const tok of joined.split(/\s*,\s*/)) {
    const t = tok.trim();
    if (t === '') continue;
    const range = t.match(/^(\d+)\s*[-–]\s*(\d+)$/);
    const seq = t.match(/^(\d+)\s*s\.?$/);
    const one = t.match(/^(\d+)$/);
    if (range) out.push([Number(range[1]), Number(range[2])]);
    else if (seq) out.push([Number(seq[1]), Number(seq[1]) + 1]);
    else if (one) out.push([Number(one[1]), Number(one[1])]);
    // Anything else (`iv, v`, an OCR fragment) is skipped: a run that cannot be read constrains nothing.
  }
  return out;
}

const MONTHS: Record<string, number> = {
  ianuarii: 1, februarii: 2, martii: 3, aprilis: 4, maii: 5, iunii: 6, iulii: 7, augusti: 8, septembris: 9, octobris: 10, novembris: 11, decembris: 12,
};
const UNITS: Record<string, number> = {
  prima: 1, primo: 1, secunda: 2, secundo: 2, altera: 2, tertia: 3, tertio: 3, quarta: 4, quarto: 4, quinta: 5, quinto: 5,
  sexta: 6, sexto: 6, septima: 7, septimo: 7, octava: 8, octavo: 8, nona: 9, nono: 9,
};
const TENS: Record<string, number> = { decima: 10, decimo: 10, vigesima: 20, vigesimo: 20, vicesima: 20, vicesimo: 20, trigesima: 30, trigesimo: 30 };
const TEENS: Record<string, number> = { undecima: 11, duodecima: 12, undecimo: 11, duodecimo: 12 };
const ROMAN: Record<string, number> = { i: 1, v: 5, x: 10, l: 50, c: 100, d: 500, m: 1000 };

/** A roman numeral in either case (`MDCCCCXXX`, `xxx`, `xn` is not one); null when a character is not a numeral. */
function roman(s: string): number | null {
  const u = s.toLowerCase();
  let total = 0;
  for (let i = 0; i < u.length; i++) {
    const v = ROMAN[u[i]!];
    if (v === undefined) return null;
    const next = ROMAN[u[i + 1] ?? ''] ?? 0;
    total += v < next ? -v : v;
  }
  return total > 0 ? total : null;
}

/** `decimatertia`, `decima tertia`, `trigesima prima`, `duodecima`, `nona` -> a day number. */
function ordinalDay(words: string[]): number | null {
  const w = words.join(' ').replace(/(decima|vigesima|vicesima|trigesima)(prima|secunda|tertia|quarta|quinta|sexta|septima|octava|nona)/g, '$1 $2').split(/\s+/);
  let n = 0;
  for (const x of w) {
    if (TEENS[x] !== undefined) n += TEENS[x]!;
    else if (TENS[x] !== undefined) n += TENS[x]!;
    else if (UNITS[x] !== undefined) n += UNITS[x]!;
    else return null;
  }
  return n >= 1 && n <= 31 ? n : null;
}

/** `millesimo nongentesimo [ac] trigesimo [primo]` (the OCR's `nnllesimo`, `noningentesimo`) -> a year. */
function ordinalYear(text: string): number | null {
  const m = text.match(/[mn]\w{1,3}lesimo\s+non\w*gentesimo(?:\s+ac)?(?:\s+(decimo|vigesimo|vicesimo|trigesimo|quadragesimo))?(?:\s+(primo|secundo|tertio|quarto|quinto|sexto|septimo|octavo|nono))?/);
  if (!m) return null;
  const tens: Record<string, number> = { decimo: 10, vigesimo: 20, vicesimo: 20, trigesimo: 30, quadragesimo: 40 };
  return 1900 + (m[1] ? tens[m[1]]! : 0) + (m[2] ? UNITS[m[2]]! : 0);
}

/** The dating formula's anchor as the OCR reads it (`Datum Romae`, `Datum Eomae`, `Datum Bomae`). */
const DATUM_RE = /Datum [REB]omae/;
/** The anchor with the formula after it: the 260 characters `latinDate` reads. */
const DATUM_TAIL_RE = new RegExp(`${DATUM_RE.source}[^]{0,260}`);

/**
 * The date of an act from its own dating formula: `Datum Romae apud Sanctum Petrum, die
 * xxx mensis Martii anno MDCCCCXXX, Pontificatus Nostri nono` -- the day in roman
 * numerals, arabic numerals or ordinal words (`decimatertia`, `trigesima prima`), the
 * month in the genitive, the year in roman numerals, arabic numerals or ordinal words
 * (`millesimo nongentesimo ac trigesimo`), which the constitutions set before the day, or
 * in roman numerals right after the month with no `anno` (`die x novembris MCMXV`, AAS 7
 * (1915) 569). The OCR reads `Eomae`, `Bomae`, `nnllesimo`; the anchor admits them. When
 * neither `anno …`, the year after the month nor an ordinal year is read, a bare
 * four-digit year anywhere in the formula (1800-2100) is taken (`die 23 Aprilis 1930.`).
 * Null when the text has no formula, or the formula no readable day, month or year.
 */
export function latinDate(text: string): string | null {
  const t = text.replace(/­/g, '').replace(/\s+/g, ' ');
  const anchor = t.search(DATUM_RE);
  if (anchor < 0) return null;
  const f = t.slice(anchor, anchor + 260).toLowerCase();
  const dm = f.match(/\bdie\s+([a-z0-9]+(?:\s+(?:prima|secunda|tertia|quarta|quinta|sexta|septima|octava|nona))?)\s+(?:mensis\s+)?([a-z]+)/);
  if (!dm) return null;
  const month = MONTHS[dm[2]!];
  if (month === undefined) return null;
  const dayTok = dm[1]!;
  const day = /^\d+$/.test(dayTok) ? Number(dayTok) : (roman(dayTok) ?? ordinalDay(dayTok.split(/\s+/)));
  if (day === null || day < 1 || day > 31) return null;
  const ym = f.match(/\banno\s+(?:domini\s+)?(?:(\d{4})|([mdclxvi]{4,})\b)/);
  // The roman year right after the month, no `anno` before it: `die x novembris MCMXV,
  // Pontificatus Nostri anno secundo` (AAS 7 (1915) 569; the form Benedict XV's letters of
  // 1914-1919 print), read only when no `anno …` year is.
  const afterMonth = f.match(new RegExp(`\\b${dm[2]}\\s*,?\\s+([mdclxvi]{4,})\\b`));
  const bare = f.match(/\b(1[89]\d{2}|20\d{2}|21\d{2})\b/);
  const year = ym ? (ym[1] ? Number(ym[1]) : roman(ym[2]!)) : (afterMonth ? roman(afterMonth[1]!) : null) ?? ordinalYear(f) ?? (bare ? Number(bare[1]) : null);
  if (year === null || year < 1800 || year > 2100) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${year}-${pad(month)}-${pad(day)}`;
}

/**
 * A page's lines with a word the line break split joined back (a soft hyphen, or
 * `letter-\n letter`), case and diacritics kept: the one line space `findIncipit` finds a
 * hit in (`lineIndex`) and `formulaNear` reads from (`fromLine`), so the index means the
 * same line in both -- a page with hyphen breaks above the hit (AAS 16 (1924) 269 has four
 * before *Ex hac*) would otherwise place `fromLine` above the hit in the raw lines and let
 * the previous act's formula through.
 */
const joinedLines = (page: string): string[] => page.replace(/­\s*\n\s*/g, '').replace(/([a-z])-\s*\n\s*([a-z])/gi, '$1$2').split('\n');

/**
 * The first dating formula on pages `from`..`upto` (1-based, inclusive) of the volume text,
 * with its page and text; `fromLine` starts the first page at that line of its joined
 * lines (`joinedLines`, the space `findIncipit`'s `lineIndex` is in), so a formula printed
 * above the act's opening -- the previous act's, ending at the top of the page (AAS 16
 * (1924) 269: *Ex hac* opens below the 15 April formula of the letter before it) -- is not
 * read as the act's.
 */
export function formulaNear(pages: readonly string[], from: number, upto: number, fromLine = 0): { page: number; date: string; text: string } | null {
  for (let p = from; p <= Math.min(upto, pages.length); p++) {
    const t = p === from && fromLine > 0 ? joinedLines(pages[p - 1]!).slice(fromLine).join('\n') : pages[p - 1]!;
    const m = t.replace(/­/g, '').replace(/\s+/g, ' ').match(DATUM_TAIL_RE);
    if (!m) continue;
    const date = latinDate(m[0]);
    if (date !== null) return { page: p, date, text: m[0].slice(0, 200) };
  }
  return null;
}

export interface RecoveredRow {
  key: string; date: string; category: string; incipit: string;
  page: number;
  /** What accepted the page: the only hit in the runs; the hit whose dating formula gives the entry's date; the only fuzzy hit. */
  rule: 'unique' | 'dated' | 'fuzzy';
  /** Set on a `dated` row whose hit was found by the fuzzy retry (one OCR character off), not exactly. */
  fuzzy?: true;
  /** The body line the incipit opens, as the text prints it. */
  bodyLine: string;
  /** The page's first line (its running header, or the fascicle cover's title line). */
  header: string;
  /** The dating formula that settled a tie, quoted. */
  formula?: string;
}
export interface UnrecoveredRow {
  key: string; date: string; category: string; incipit: string | null;
  /** `claimants`: another entry of the same category and incipit was given, or already holds, the same page (controller ruling 18). */
  reason: 'no-incipit' | 'none' | 'several' | 'outside-runs' | 'header-mismatch' | 'claimants';
  /** The pages the incipit was found on, where there were any. */
  candidates?: number[];
}
export interface PagesSidecar {
  /** The source key (`1921`, `1917-I`). */
  source: string;
  generated: string;
  /** The store file the body was read from, with its page count. */
  text: string;
  rows: RecoveredRow[];
  unrecovered: UnrecoveredRow[];
}

/** Lower case, diacritics folded, soft hyphens dropped, a word the line break split joined, spaces collapsed (newlines kept). */
function fold(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/æ/g, 'ae').replace(/œ/g, 'oe')
    .replace(/­\s*\n\s*/g, '').replace(/([a-z])-\s*\n\s*([a-z])/gi, '$1$2')
    .toLowerCase().replace(/[ \t]+/g, ' ');
}

const WORD = /[a-z]+/g;

/** Levenshtein distance capped at 2. */
function dist(a: string, b: string): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 1) return 2;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let left = i;
    let diag = prev[0]!;
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cur = Math.min(prev[j]! + 1, left + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = prev[j]!; prev[j] = cur; left = cur;
    }
  }
  return Math.min(prev[b.length]!, 2);
}

/**
 * Whether the page opens an act with the incipit: the incipit's words in order, at the
 * head of a paragraph, and not inside running text. A paragraph head is the salutation's
 * dash (`Ad perpetuam rei memoriam. — Quo maiori rerum`; the OCR's `-`, `—•`), or the
 * start of a line whose previous non-blank line is not running text -- a heading or the
 * pope's name in capitals, a numeral, a salutation or sentence ending in a mark
 * (`Signor Cardinale,`, `benedictionem.`), or nothing at all. A line that continues a
 * sentence (`Moderator Generalis Associationis titulo Nostrae Dominae a Salute` /
 * `Parisiis canonice erectae`, AAS 11 (1919) 109) opens no act, whatever word it starts
 * with; nor does a word after a full stop inside a line (`praescriptum Constit.
 * Promulgandi`, AAS 1 (1909) 71; `constanter. Sollertiae vestrae`, AAS 2 (1910) 562) --
 * the first sidecars accepted all three and cited two of them, and *Ex hac* (AAS 16 (1924)
 * 269) was given p. 270 by a formula read above its opening (`formulaNear`). Measured
 * 2026-09-21 over the seventeen volumes after the change: of 759 pages accepted, 646
 * follow the dash and 113 open a line under a heading, a numeral or a salutation; the
 * regeneration (740 rows to 759) lost six -- three of the five wrong pages (the other two,
 * *Promulgandi* and *Ex hac*, moved to their true pages) and three consistories that open
 * mid-sentence -- and gained 25 openings the false hits had made `several` (the final
 * review's regeneration then brought the rows to 770; the report's §1b has the counts).
 * Exact by default; `fuzzy` admits one differing character per
 * word of five letters or more (the OCR's `e`/`c`, `o`/`a`, `t`/`l`), nothing in a
 * shorter word. The hit's line index is returned for the dated rule, which reads the
 * formula from that line on.
 */
export function findIncipit(page: string, incipit: string, fuzzy: boolean): { line: string; lineIndex: number } | null {
  const want = fold(incipit).match(WORD) ?? [];
  if (want.length === 0) return null;
  const folded = fold(page);
  const lines = folded.split('\n');
  // Joined the same way as `fold` (soft hyphen, `letter-\n letter`), case and diacritics
  // kept, so `rawLines` stays index-aligned with `lines` -- and with what `formulaNear`
  // slices at `lineIndex`.
  const rawLines = joinedLines(page);
  // Running text, which the next line continues: a line with a lower-case word that ends
  // in no mark (the sentence goes on), or ends in a full stop that is not a salutation's
  // or the memorial formula's (`1.° Quaenam sit huius Congregationis auctoritas statuitur
  // in Const.` / `Sapienti consilio.`, AAS 1 (1909) 100, the Ordo servandus citing the
  // constitution that opens at p. 7).
  const continues = (raw: string): boolean => {
    const t = raw.trim();
    if (!/[a-z]{2}/.test(t)) return false;
    if (/[,:;!?»)]$/.test(t)) return false;
    if (/\.$/.test(t)) return !/benedictionem|memoriam|salutem|benedizione|bénédiction/i.test(t);
    return true;
  };
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li]!;
    const prev = rawLines.slice(0, li).map((l) => l.trim()).filter((l) => l !== '').pop();
    // Candidate heads: the line start (a paragraph head only under a line that is not
    // running text), and each position after a dash.
    // The dash as the OCR draws it: `— `, `—`, `.— `, `-—-`, `=—`, `•—•`, or a bare hyphen
    // between spaces (`benedictionem. - Placet`), also at the line's end.
    const heads = [...(prev === undefined || !continues(prev) ? [0] : []), ...[...line.matchAll(/[-=•]*[—–][-=•]*\s*|(?<=\s)-(?:\s+|$)/g)].map((m) => m.index! + m[0].length)];
    for (const h of heads) {
      const tail = line.slice(h) + ' ' + (lines[li + 1] ?? '');
      const got = [...tail.matchAll(WORD)].slice(0, want.length).map((m) => m[0]);
      if (got.length < want.length) continue;
      const ok = want.every((w, i) => w === got[i] || (fuzzy && w.length >= 5 && got[i]!.length >= 5 && dist(w, got[i]!) <= 1));
      if (ok) return { line: (rawLines[li] ?? line).trim(), lineIndex: li };
    }
  }
  return null;
}

/** The page's first non-blank line: `574 Index documentorum`, `Acta Pii PP. XI 483`, `Annus XXII - Vol. XXII 1 Maii 1930 Num. 5`. */
const headerOf = (page: string): string => (page.split('\n').find((l) => l.trim() !== '') ?? '').trim();
/**
 * Whether the header contradicts the page's own number. It agrees when it prints the number
 * as a whole token, when it is a fascicle cover (`Num. 5`), when it prints no digit at all
 * (the OCR dropped the number: `Acta Pii PP. X.`, `Acta Apostolicae Sedis. - Commentarium
 * Officiale.`), or when it prints the number with one character wrong -- a token of the
 * same length within one edit of it (`34i Acta Apostolicae ...` for 344, `Acta PU PP. X.
 * Í31` for 131, `2^4 Acta ...` for 224); the token keeps a digit, so a lone `-` or `.`
 * never stands in for a one-digit page. A token that is all digits and differs prints
 * another number, and refuses. Of the 98 pages refused before this rule (measured
 * 2026-09-21 over the seventeen sidecars), 74 printed no digit and 7 the number with one
 * character wrong; the 17 left carry an extra character (`488*`, `344;`) or a damaged
 * cover (`Num: 16`, `Nun. 13`, `Num. U`) and stay refused.
 */
const headerAgrees = (header: string, n: number): boolean => {
  if (/\bNum\.\s*\d/.test(header) || !/\d/.test(header)) return true;
  const digits = String(n);
  return header.split(/\s+/).some((t) => t === digits || (t.length === digits.length && /\d/.test(t) && !/^\d+$/.test(t) && dist(t, digits) <= 1));
};

const inRuns = (runs: PageRun[] | undefined, p: number): boolean =>
  runs === undefined || runs.some(([a, b]) => p >= a - 1 && p <= b + 1);

/** The group an entry claims a page in: its category id and its incipit's folded words (what `findIncipit` compares). */
const claimKey = (e: { category: string; incipit: string | null }): string =>
  `${categoryForHeading(e.category)?.id ?? e.category}|${(fold(e.incipit ?? '').match(WORD) ?? []).join(' ')}`;

/**
 * The recovery (spec §10.3.2). For each pageless entry with an incipit: the pages of the
 * pope's part (1..lastBodyPage) that open an act with it, within the category's runs from
 * the Index generalis (±1 page, for the runs' own OCR). One hit is accepted (`unique`);
 * several are settled by the dating formula on and inside each hit's own span (`dated`) --
 * up to the next candidate hit and not past the end of the Index generalis run (±1) that
 * put this hit `inside`, so an unrelated act further down the page range never confirms a
 * wrong page -- the one whose date is the entry's; none is retried fuzzily (`fuzzy`, unique
 * only). A category the Index generalis has no run for is searched over the whole part and
 * accepted only when the formula confirms the date, within 8 pages of the hit. A hit whose
 * running header prints another number is not a page (`header-mismatch`). Anything else is
 * reported with its reason.
 *
 * An incipit several entries of one category carry (controller ruling 18) -- counted over
 * the pageless entries and over the volume's paged entries, `opts.paged` -- is never taken
 * by the `unique` or `fuzzy` rule, whose one hit may be the other entry's page (AAS 7 (1915)
 * indexes two letters *Communis vestra*, 10 November 1915, to the Ligurian and the Brazilian
 * bishops; the body opens them at pp. 569 and 591, and the second lay past the category's
 * last run before ruling 17): the formula alone settles such a group, a fuzzy hit it
 * settles being marked `fuzzy: true`. After the loop, a page two rows of one group were
 * given, or a row was given while a paged entry of the group already holds it, goes to
 * neither: both are reported `claimants` with the page as their candidate. A page two acts
 * of *different* incipits share (ACTA_SHARED_PAGES) is untouched.
 */
export function recoverPages(pageless: readonly PagelessEntry[], pages: readonly string[], generalis: IndexGeneralis, opts: { lastBodyPage: number; paged?: readonly Pick<ActaEntry, 'category' | 'incipit' | 'page'>[] }): { rows: RecoveredRow[]; unrecovered: UnrecoveredRow[] } {
  const rows: RecoveredRow[] = [];
  const unrecovered: UnrecoveredRow[] = [];
  const last = Math.min(opts.lastBodyPage, pages.length);
  const claimants = new Map<string, number>();
  for (const e of [...pageless, ...(opts.paged ?? [])]) {
    if (e.incipit === null) continue;
    const k = claimKey(e);
    claimants.set(k, (claimants.get(k) ?? 0) + 1);
  }
  for (const e of pageless) {
    const key = pagelessKey(e);
    const base = { key, date: e.date, category: e.category, incipit: e.incipit };
    if (e.incipit === null) { unrecovered.push({ ...base, reason: 'no-incipit' }); continue; }
    const cat = categoryForHeading(e.category)?.id ?? e.category;
    const runs = generalis.runs.get(cat);
    const contested = (claimants.get(claimKey(e)) ?? 0) >= 2;
    const hits = (fuzzy: boolean) => {
      const all: { page: number; line: string; lineIndex: number }[] = [];
      for (let p = 1; p <= last; p++) {
        const f = findIncipit(pages[p - 1]!, e.incipit!, fuzzy);
        if (f) all.push({ page: p, line: f.line, lineIndex: f.lineIndex });
      }
      return all;
    };
    const decide = (all: { page: number; line: string; lineIndex: number }[], rule: 'unique' | 'fuzzy'): boolean => {
      if (all.length === 0) return false;
      const inside = all.filter((h) => inRuns(runs, h.page));
      if (inside.length === 0) { unrecovered.push({ ...base, reason: 'outside-runs', candidates: all.map((h) => h.page) }); return true; }
      const accept = (h: { page: number; line: string }, r: RecoveredRow['rule'], formula?: string) => {
        const header = headerOf(pages[h.page - 1]!);
        if (!headerAgrees(header, h.page)) { unrecovered.push({ ...base, reason: 'header-mismatch', candidates: [h.page] }); return; }
        rows.push({ ...base, incipit: e.incipit!, page: h.page, rule: r, ...(r === 'dated' && rule === 'fuzzy' ? { fuzzy: true as const } : {}), bodyLine: h.line, header, ...(formula ? { formula } : {}) });
      };
      if (inside.length === 1 && runs !== undefined && !contested) { accept(inside[0]!, rule); return true; }
      // Several hits, no runs to constrain them, or an incipit another entry of the
      // category also carries: the act's own dating formula decides -- but only a formula
      // inside the act's own span (from the hit's line, up to the next candidate, and not
      // past the end of the Index generalis run that put this hit `inside`, ±1 for the
      // run's own OCR): an unrelated act's formula further down the page range, or the
      // previous act's above the hit on its page, confirms nothing.
      const runEndFor = (p: number): number | undefined => runs?.find(([a, b]) => p >= a - 1 && p <= b + 1)?.[1];
      const dated = inside
        .map((h) => {
          const next = inside.find((o) => o.page > h.page)?.page;
          const upto = runs !== undefined
            ? Math.min(next !== undefined ? next - 1 : Infinity, runEndFor(h.page)! + 1)
            : Math.min(next !== undefined ? next - 1 : h.page + 8, h.page + 8);
          // From the hit's own line on: a formula above it on the page is the previous act's.
          return { h, formula: formulaNear(pages, h.page, Math.min(upto, last), h.lineIndex) };
        })
        .filter((x) => x.formula?.date === e.date);
      if (dated.length === 1) {
        accept(dated[0]!.h, 'dated', dated[0]!.formula!.text);
      } else {
        unrecovered.push({ ...base, reason: 'several', candidates: inside.map((h) => h.page) });
      }
      return true;
    };
    if (decide(hits(false), 'unique')) continue;
    if (decide(hits(true), 'fuzzy')) continue;
    unrecovered.push({ ...base, reason: 'none' });
  }
  // One page to one claimant of a group (ruling 18): the pages the paged entries of each
  // group hold, then the rows' -- a row on a page of its group's paged entry or of another
  // row of the group is withdrawn, with the page as its candidate.
  const held = new Map<string, Set<number>>();
  for (const e of opts.paged ?? []) {
    if (e.incipit === null) continue;
    const k = claimKey(e);
    held.set(k, (held.get(k) ?? new Set()).add(e.page));
  }
  const given = new Map<string, RecoveredRow[]>();
  for (const r of rows) {
    const k = `${claimKey(r)}|${r.page}`;
    given.set(k, [...(given.get(k) ?? []), r]);
  }
  const withdrawn = new Set(rows.filter((r) => held.get(claimKey(r))?.has(r.page) || given.get(`${claimKey(r)}|${r.page}`)!.length > 1));
  for (const r of withdrawn) unrecovered.push({ key: r.key, date: r.date, category: r.category, incipit: r.incipit, reason: 'claimants', candidates: [r.page] });
  return { rows: rows.filter((r) => !withdrawn.has(r)), unrecovered };
}
