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
