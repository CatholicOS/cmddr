/**
 * The *Summa actorum* (ASS 41: *Index analyticus*) that ends every ASS volume, read as the
 * check on the scanner's completeness (ass volumes spec §4): its papal part lists the
 * pope's acts by description and page -- no incipit, no date -- in two columns the OCR
 * interleaves. It is parsed loosely: a row is any run of lines ending in a page number,
 * and its description is kept as printed, interleaving and all, for the report; the pages
 * are what the check reads. Every summa page must be the page of one scanned act
 * (`claimed`); a summa page no act sits on is an act the scan missed or paged wrongly
 * (`unclaimed`, resolved by a curated reading, ASS_READINGS); a scanned act on no summa
 * page is listed (`omitted`) -- the summa lists selectively, so it is a finding, not a defect.
 */
export interface SummaRow {
  /** The row's text, line breaks and leaders removed, page removed. */
  description: string;
  page: number;
  /** The lines as extracted, joined by ` / `. */
  raw: string;
}

export interface SummaCheck {
  /** The summa's pages in the volume (1-based, inclusive), or null when none was located. */
  pages: { from: number; to: number } | null;
  rows: SummaRow[];
  /** Summa pages a scanned act sits on. */
  claimed: number[];
  /** Summa rows no scanned act sits on. */
  unclaimed: SummaRow[];
  /** Pages of scanned acts the summa does not list. */
  omitted: number[];
}

const SUMMA_HEAD_RE = /^[\s\S]{0,60}?(SUMMA\s+A[CGO]TO[RKT]?[UTJ]*M|INDEX\s+ANALYTICUS)/;
const NEXT_INDEX_RE = /^[\s\S]{0,60}?(INDEX\s+GENERALIS|INDEX\s+ALPHABETICUS|INDEX\s+RERUM|INDEX\s+NOMINUM)/;

/**
 * The summa's pages: the first page from the volume's midpoint headed SUMMA ACTORUM (the
 * OCR's `ACTOKTJM`, `AGTORUM` admitted) or INDEX ANALYTICUS, to the page before the next
 * index heading, or the volume's end with trailing blank pages dropped.
 */
export function locateSumma(pages: readonly string[]): { from: number; to: number } | null {
  const n = pages.length;
  let from = -1;
  for (let i = Math.floor(n / 2); i < n; i++) if (SUMMA_HEAD_RE.test(pages[i]!)) { from = i; break; }
  if (from < 0) return null;
  let to = n;
  for (let i = from + 1; i < n; i++) if (NEXT_INDEX_RE.test(pages[i]!)) { to = i; break; }
  while (to - 1 > from && pages[to - 1]!.trim() === '') to--;
  return { from: from + 1, to };
}

/** The OCR's letters for digits in a page number: `ig3` → 193, `3oo` → 300, `3oi` → 301, `i3o` → 130. Spaces inside a number are dropped (`6 19`). */
const DIGIT_OCR: Readonly<Record<string, string>> = { o: '0', O: '0', i: '1', I: '1', l: '1', S: '5', s: '5', g: '9', B: '8' };
export function normalisePage(token: string): number | null {
  const digits = token.replace(/\s+/g, '').split('').map((c) => DIGIT_OCR[c] ?? c).join('');
  if (!/^\d{1,4}$/.test(digits)) return null;
  const n = Number(digits);
  return n >= 1 ? n : null;
}

const PAPAL_HEAD_RE = /^\s*(?:\d+\s+)?(LITTERAE\s+ET\s+A(?:LLOCUTIONES|CTA)(?:\s+R\.\s*PONTIFICIS|\s+APOSTOLICAE)?|ACTA\s+ROMANI\s+PONTIFICIS)/;
const DICASTERY_RE = /^\s*(EX\s+(?:S\.|SS\.|SACRA|SECRETARIA|ACTIS|AEDIBUS|SUPREMA|CANCELLARIA|DATARIA)\b.*)$/;
/**
 * A row's end: a page token after a leader, a sign or a space, possibly `N et M`, possibly
 * a trailing stop. The token may start with an OCR letter (`ig3`), but a lookahead requires
 * a genuine digit within its first four characters, so a short Latin word made entirely of
 * OCR-digit-letters (`iis`, `sis`) never reads as a page and closes a row.
 */
const ROW_END_RE = /^(.*?)(?:\s*(?:pag\.|»|>|\*|·|\.{2,}|\s))\s*(?=[\dOoiIlSsgB]{0,3}\d)([\dOoiIlSsgB][\dOoiIlSsgB]{0,3}(?:\s\d{1,2})?)(?:\s+et\s+(\d[\dOoiIlSsgB]{0,3}))?\s*\.?\s*$/;

/**
 * The rows of the papal part: from the papal heading (or the summa's first line, when the
 * heading is interleaved into a row, as ASS 12's `LITTERAE ET ALLOCUTIONES Motu Proprio …`)
 * to the first dicastery heading. A row accumulates lines until one ends in a page token;
 * `N et M` yields two rows of one description. Lines that are only a running header
 * (`8oo Index analyticus`, `SUMMA ACTORUM.`) are skipped. A page token may start with an
 * OCR letter (`ig3`) but must contain a genuine digit, so a short Latin word (`iis`) never
 * closes a row.
 */
export function parseSummaPapalPart(text: string): { rows: SummaRow[]; heading: string | null; end: string | null } {
  const lines = text.split('\n');
  let start = -1;
  let heading: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i]!.match(PAPAL_HEAD_RE);
    if (m) { start = i; heading = m[1]!.replace(/\s+/g, ' ').trim(); break; }
  }
  if (start < 0) return { rows: [], heading: null, end: null };
  const rows: SummaRow[] = [];
  let acc: string[] = [];
  let end: string | null = null;
  for (let i = start; i < lines.length; i++) {
    const line = lines[i]!;
    const d = line.match(DICASTERY_RE);
    if (d) { end = d[1]!.replace(/\s+/g, ' ').trim(); break; }
    if (line.trim() === '' || /^\s*(?:\d[\dOoiIl]{0,3}\s+)?(?:Index analyticus|SUMMA\.?\s+A[CGO]TO[RKT]?[UTJ]*M\.?)\s*(?:\d[\dOoiIl]{0,3})?\s*$/.test(line)) continue;
    const content = i === start ? line.replace(PAPAL_HEAD_RE, '').trim() : line;
    if (content.trim() === '') continue;
    acc.push(content.trim());
    const m = content.match(ROW_END_RE);
    if (!m) continue;
    const page = normalisePage(m[2]!);
    const raw = acc.join(' / ');
    const description = acc.slice(0, -1).concat(m[1]!.trim()).join(' ').replace(/­\s*/g, '').replace(/\s*[.»>*·]+\s*$/, '').replace(/\s+/g, ' ').trim();
    acc = [];
    if (page === null) continue;
    rows.push({ description, page, raw });
    const second = m[3] ? normalisePage(m[3]) : null;
    if (second !== null) rows.push({ description, page: second, raw });
  }
  return { rows, heading, end };
}

export function checkSumma(entries: readonly { page: number }[], summa: { pages: { from: number; to: number } | null; rows: SummaRow[] }): SummaCheck {
  const actPages = new Set(entries.map((e) => e.page));
  const rowPages = new Set(summa.rows.map((r) => r.page));
  return {
    pages: summa.pages,
    rows: summa.rows,
    claimed: [...new Set(summa.rows.filter((r) => actPages.has(r.page)).map((r) => r.page))],
    unclaimed: summa.rows.filter((r) => !actPages.has(r.page)),
    omitted: [...new Set(entries.filter((e) => !rowPages.has(e.page)).map((e) => e.page))],
  };
}
