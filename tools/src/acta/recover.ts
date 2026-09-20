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
import type { ActaEntry, PagelessEntry } from './index.js';

/** The key a sidecar row and a curated reading name a pageless entry by: what the index line prints, minus the page. */
export const pagelessKey = (e: { date: string; category: string; incipit: string | null; description: string }): string =>
  `${e.date}|${e.category}|${e.incipit ?? ''}|${e.description.slice(0, 66)}`;

export type PageRun = [number, number];

export interface IndexGeneralis {
  /** The 1-based page of the *Index generalis actorum* in the volume text, or null when none was found. */
  page: number | null;
  /** The page runs per category id (categories.ts), in print order. */
  runs: Map<string, PageRun[]>;
  /** Headings of the pope part the category table does not list, as printed. */
  unmapped: string[];
}

const GENERALIS_RE = /INDEX\s+GENERALIS\s+ACTORUM/;
/** The pope part's end: the dicasteries' part (`II. - ACTA SACRARUM CONGREGATIONUM`, `ACTA SS. CONGREGATIONUM`) or the next index. */
const PART_END_RE = /^\s*(?:[IVX]+\.?\s*[–—-]\s*)?ACTA\s*$|^\s*(?:[IVX]+\.?\s*[–—-]\s*)?ACTA\s+(?:SACRARUM|SS\.)\s+CONGREGATION|^\s*INDEX\s+DOCUMENTORUM/;
/** `EPISTOLAE, 10-12, 89-91, 195 s.,` -- a heading in capitals, a comma, then pages. */
const HEADING_LINE_RE = /^\s*([A-Z][A-Z .'’]+?)\s*[,:]\s*(.*)$/;
/** A continuation line: pages only. */
const PAGES_LINE_RE = /^\s*[\d\s,.\-–s]+$/;

/**
 * The *Index generalis actorum* at the head of a volume's indexes: per category of the
 * pope's part, the pages the volume prints its acts at, as runs. The page is searched from
 * the volume's midpoint (the indexes sit in the tail). A run the line break splits
 * (`294-` / `307`) is joined before reading; `195 s.` (*et sequens*) is the page and the
 * next. Measured on AAS 13 (1921) p. 571.
 */
export function parseIndexGeneralis(pages: readonly string[]): IndexGeneralis {
  const start = pages.findIndex((t, i) => i >= Math.floor(pages.length / 2) && GENERALIS_RE.test(t));
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
    runs.set(id, [...(runs.get(id) ?? []), ...readRuns(buffer)]);
    heading = null;
    buffer = '';
  };
  for (const line of lines) {
    if (!inPope) { if (/^\s*(?:[IVX]+\.?\s*[–—-]\s*)?ACTA\s+[A-Z]+\s+PP\./.test(line)) inPope = true; continue; }
    if (PART_END_RE.test(line)) { flush(); break; }
    const h = line.match(HEADING_LINE_RE);
    if (h && !PAGES_LINE_RE.test(line)) { flush(); heading = h[1]!.trim(); buffer = h[2]!; continue; }
    if (heading !== null && PAGES_LINE_RE.test(line)) buffer += ' ' + line.trim();
  }
  flush();
  return { page: start + 1, runs, unmapped };
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

/**
 * The date of an act from its own dating formula: `Datum Romae apud Sanctum Petrum, die
 * xxx mensis Martii anno MDCCCCXXX, Pontificatus Nostri nono` -- the day in roman
 * numerals, arabic numerals or ordinal words (`decimatertia`, `trigesima prima`), the
 * month in the genitive, the year in roman numerals, arabic numerals or ordinal words
 * (`millesimo nongentesimo ac trigesimo`), which the constitutions set before the day. The
 * OCR reads `Eomae`, `Bomae`, `nnllesimo`; the anchor admits them. When neither `anno …`
 * nor an ordinal year is read, a bare four-digit year anywhere in the formula (1800-2100)
 * is taken (`die 23 Aprilis 1930.`). Null when the text has no formula, or the formula no
 * readable day, month or year.
 */
export function latinDate(text: string): string | null {
  const t = text.replace(/­/g, '').replace(/\s+/g, ' ');
  const anchor = t.search(/Datum [REB]omae/);
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
  const bare = f.match(/\b(1[89]\d{2}|20\d{2}|21\d{2})\b/);
  const year = ym ? (ym[1] ? Number(ym[1]) : roman(ym[2]!)) : (ordinalYear(f) ?? (bare ? Number(bare[1]) : null));
  if (year === null || year < 1800 || year > 2100) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** The first dating formula on pages `from`..`upto` (1-based, inclusive) of the volume text, with its page and text. */
export function formulaNear(pages: readonly string[], from: number, upto: number): { page: number; date: string; text: string } | null {
  for (let p = from; p <= Math.min(upto, pages.length); p++) {
    const t = pages[p - 1]!;
    const m = t.replace(/­/g, '').replace(/\s+/g, ' ').match(/Datum [REB]omae[^]{0,260}/);
    if (!m) continue;
    const date = latinDate(m[0]);
    if (date !== null) return { page: p, date, text: m[0].slice(0, 200) };
  }
  return null;
}
