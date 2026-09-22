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
/**
 * `ALPHABETICUS` admits the OCR's `-O` for `-US` (`INDEX ALPHABETICO`, ASS 38 (1905) 424,
 * the volume's own Index Alphabeticus heading, its own line, immediately after Index
 * Analyticus's seven pages): without it the search for the next index runs past the whole
 * Index Alphabeticus and finds none, so `to` fell through to the volume's end -- catching
 * ASS 38's own *Supplementum ad "Acta S. Sedis"* (433-699, a separately paginated dossier of
 * French Church-State-separation correspondence, its own front matter and its own closing
 * *Table des matières*, bound in after the volume's IMPRIMATUR on 432) as if it were still
 * the summa, 270 pages that are neither summa nor scanned body. `from` was already right:
 * body content (`Ex Vicariatu Urbis`, citing pages up to 415) runs to 416, and Index
 * Analyticus opens on 417 citing nothing past 415 -- so this volume's summa was never
 * mislocated at its start, only left unbounded at its end.
 */
const NEXT_INDEX_RE = /^[\s\S]{0,60}?(INDEX\s+GENERALIS|INDEX\s+ALPHABETIC(?:US|O)|INDEX\s+RERUM|INDEX\s+NOMINUM)/;
/**
 * A page's first three non-blank lines, trimmed and joined: what the two heading regexes
 * read. The layout mode pads the page-number line above the heading to the right margin
 * (`{150 spaces}761` then `SUMMA ACTORUM`, ASS 33 (1900) 761; ASS 12 (1879) 647), which
 * alone exceeds the sixty characters the regexes allow before the heading.
 */
const headOf = (page: string): string => page.split('\n').filter((l) => l.trim() !== '').slice(0, 3).map((l) => l.trim()).join(' ');

/**
 * The summa's pages: the first page from the volume's midpoint headed SUMMA ACTORUM (the
 * OCR's `ACTOKTJM`, `AGTORUM` admitted) or INDEX ANALYTICUS, to the page before the next
 * index heading, or the volume's end with trailing blank pages dropped.
 */
export function locateSumma(pages: readonly string[]): { from: number; to: number } | null {
  const n = pages.length;
  let from = -1;
  for (let i = Math.floor(n / 2); i < n; i++) if (SUMMA_HEAD_RE.test(headOf(pages[i]!))) { from = i; break; }
  if (from < 0) return null;
  let to = n;
  for (let i = from + 1; i < n; i++) if (NEXT_INDEX_RE.test(headOf(pages[i]!))) { to = i; break; }
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

/**
 * A papal-heading form the summa prints, cited at the volume (and page, where known) that
 * prints it -- the citation-beside-the-alternative discipline `DICASTERY_RE` already keeps,
 * carried into data here so a heading *count* typed into prose can never go stale again (fix
 * round 2 of Task 3: the survey's prose said "the parser knows the three forms the sample
 * printed" after the whole-series survey had already taught it eight more, and the first
 * attempt to correct that number by hand still undercounted `PAPAL_HEAD_RE`'s own
 * alternatives). `pattern` is one alternative's regex source; several entries share a
 * `pattern` where one alternative reads more than one printed spelling (`LITTERAE ROMANI
 * PONTIFICIS` and `LITTERAE R. PONTIFICIS`, both ASS 16 (1883) 557 and 17-19, read by the one
 * `LITTERAE\s+R(?:OMANI|\.)\s*PONTIFICIS` branch). `PAPAL_HEAD_RE` is built below by joining
 * the distinct patterns, in order of first appearance, so it cannot diverge from what this
 * table cites, and its count of forms is `PAPAL_HEAD_FORMS.length` wherever one is needed.
 *
 * The mixed-case form is admitted for `Litterae Apostolicae` alone, and only as a whole
 * line: the caps forms cannot be relaxed without reading a row's own first words as a
 * heading, since every row opens `Litterae SSmi D. N. …`.
 *
 * A trailing stop (ASS 3's `ACTA SOLEMNIORA ROMANI PONTIFICIS.`) is consumed after the
 * alternatives rather than inside the SOLEMNIOR one, so it is dropped from every
 * alternative's reported heading and never left on the line to leak into the first row.
 *
 * ASS 3 also prints `ACTA SOLEMNIORA ROMANI` and `PONTIFICIS.` as two physical lines of a
 * two-column page (665) -- `ROMANI` already on the first line, unlike ASS 8's bare
 * `ACTA SOLEMNIORÂ` (727), where the whole of `ROMANI PONTIFICIS.` sits on the next line.
 * A trailing `(?!\s*ROM)` on the SOLEMNIOR alternative refuses a bare match immediately
 * followed by an orphaned `ROM…`, so the regex does not itself half-match and leak
 * `ROMANI` into the first row; `parseSummaPapalPart`'s two-line join (below) then joins the
 * line with the next and re-matches whole.
 */
export const PAPAL_HEAD_FORMS: readonly { pattern: string; prints: string; at: string }[] = [
  { pattern: 'LITTERAE\\s+ET\\s+A(?:LLOCUTIONES|CTA)(?:\\s+R(?:OM)?\\.\\s*PONTIFICIS|\\s+APOSTOLICAE)?', prints: 'LITTERAE ET ALLOCUTIONES APOSTOLICAE', at: 'ASS 12 (1879) 647, and 13' },
  { pattern: 'LITTERAE\\s+ET\\s+A(?:LLOCUTIONES|CTA)(?:\\s+R(?:OM)?\\.\\s*PONTIFICIS|\\s+APOSTOLICAE)?', prints: 'LITTERAE ET ACTA ROM. PONTIFICIS', at: 'ASS 21 (1888) 744, and 22-25, 27-34' },
  { pattern: 'LITTERAE\\s+ET\\s+A(?:LLOCUTIONES|CTA)(?:\\s+R(?:OM)?\\.\\s*PONTIFICIS|\\s+APOSTOLICAE)?', prints: 'LITTERAE ET ACTA R. PONTIFICIS', at: 'ASS 33 (1900) 761, over R. PONTIFICIS on the next line' },
  { pattern: 'ACTA\\s+(?:ROMANI|ROMAM)\\s+PONTIFICIS', prints: 'ACTA ROMANI PONTIFICIS', at: 'ASS 36 (1903), and 37-41' },
  { pattern: 'ACTA\\s+(?:ROMANI|ROMAM)\\s+PONTIFICIS', prints: 'ACTA ROMAM PONTIFICIS', at: "ASS 35's OCR of ROMANI" },
  { pattern: 'ACTA\\s+SOLEMNIOR[AEÂ](?:\\s+ROM(?:ANI|\\.)?\\s*PON[TRr]?[iI]?FICIS)?(?!\\s*ROM)', prints: 'ACTA SOLEMNIORA ROMANI PONTIFICIS', at: 'ASS 3 (1867) 665' },
  { pattern: 'ACTA\\s+SOLEMNIOR[AEÂ](?:\\s+ROM(?:ANI|\\.)?\\s*PON[TRr]?[iI]?FICIS)?(?!\\s*ROM)', prints: 'ACTA SOLEMNIORE ROM. PONTIFICIS', at: "ASS 4 (1868) 684 (the OCR's -E for -A)" },
  { pattern: 'ACTA\\s+SOLEMNIOR[AEÂ](?:\\s+ROM(?:ANI|\\.)?\\s*PON[TRr]?[iI]?FICIS)?(?!\\s*ROM)', prints: 'ACTA SOLEMNIORA ROM. PONriFICIS', at: "ASS 5 (1869) 691, and 6 (the OCR's r for T)" },
  { pattern: 'ACTA\\s+SOLEMNIOR[AEÂ](?:\\s+ROM(?:ANI|\\.)?\\s*PON[TRr]?[iI]?FICIS)?(?!\\s*ROM)', prints: 'ACTA SOLEMNIORÂ', at: 'ASS 8 (1874) 727, over ROMANI PONTIFICIS' },
  { pattern: 'LITTERAE\\s+ET\\s+RESPONSUM', prints: 'LITTERAE ET RESPONSUM', at: 'ASS 14 (1881) 569, over ROMANI PONTIFICIS' },
  { pattern: 'LITTERAE\\s+MOTU\\s+PROPRIO', prints: 'LITTERAE MOTU PROPRIO', at: 'ASS 15 (1882) 603, over ET CONSTITUTIO R. PONTIFICIS' },
  { pattern: 'L\\s?TT\\s?E\\s?RA\\s?[ER]?\\s+ROMANI\\s+PONTIFICIS', prints: 'L TT E RA R ROMANI PONTIFICIS', at: "ASS 16 (1883) 557, the OCR's garble of LITTERAE ROMANI PONTIFICIS" },
  { pattern: 'LITTERAE\\s+R(?:OMANI|\\.)\\s*PONTIFICIS', prints: 'LITTERAE ROMANI PONTIFICIS', at: 'ASS 16 (1883) 557, and 17-19' },
  { pattern: 'LITTERAE\\s+R(?:OMANI|\\.)\\s*PONTIFICIS', prints: 'LITTERAE R. PONTIFICIS', at: 'ASS 16 (1883) 557, and 17-19' },
  { pattern: 'LITTERAE\\s+APOSTOLICAE', prints: 'LITTERAE APOSTOLICAE', at: 'ASS 10 (1877) 616, and 11' },
  { pattern: 'Litterae\\s+Apostolicae\\s*$', prints: 'Litterae Apostolicae', at: 'ASS 9 (1876) 669, over SS. D. Ii. P. Papae IX.' },
];
const PAPAL_HEAD_RE = new RegExp(`^\\s*(?:\\d+\\s+)?(${[...new Set(PAPAL_HEAD_FORMS.map((f) => f.pattern))].join('|')})\\.?`);
/**
 * A dicastery heading, which ends the pope's part. The abbreviated forms end in a stop
 * (`EX S. C. CONCILII`, ASS 33 (1900) 762; `EX S.APOSTOLICA POENITENTIARIA`, ASS 1 (1865)
 * 747), after which no word boundary follows, so the boundary is written per alternative
 * on the spelt-out words only.
 *
 * `EX` is required before the abbreviated `S.`/`SS.` forms because a bare `S.` is also how
 * the summa abbreviates a saint's name (`3. Ioannis De Cuyo` -- OCR for `S. Ioannis`, ASS 3
 * (1867) 666): without `EX`, a row naming a saint would end the part. Two forms of dicastery
 * heading are dropped from the evidence anyway, since some volumes print them without `EX`:
 *   - ASS 21 (1888) heads every dicastery of its summa bare, never with `EX`
 *     (`S. CONGREGATIO CONCILII` 745, `S. CONGREGATIO RITUUM` / `S. CONGR. INDULGENTIARUM`
 *     749, `S. CONGR. INDICIS` / `S. POENITENTIARIA APOST.` 750); ASS 24 (1891) 758 prints
 *     `S. CONGR. IMMUNITATIS` bare the same way -- so the abbreviated forms are admitted
 *     bare only when followed by a spelt-out dicastery word actually printed that way
 *     (`CONGR.`, `CONGREGATIO`, `POENITENTIARIA`), never by a bare `C.` alone, which stays
 *     `EX`-only (too close to a saint's initial, same as `S.` bare). `CONGREGATIONE` and
 *     `CONGREGATIONIS` are not admitted bare: a corpus-wide search found neither printed
 *     bare in any summa (`CONGREGATIONIS` appears bare once, ASS 6 (1870) 546, but as the
 *     genitive of a document's own title -- `S. CONGREGATIONIS FIDEI PROPAGANDAE
 *     PRAEPOSITAE...`, an *Instructio*'s heading in the volume's body -- not a summa
 *     dicastery heading).
 *   - ASS 3 (1867) 666 and ASS 4 (1868) 684 head the consistorial acts `ACTA CONSISTORIALIA`
 *     -- `ACTA`, not `ACTIS`, and never with `EX` -- always in full capitals.
 * ASS 9 (1876) prints its own headings in title case with `Ex`, never in capitals
 * (`Ex Actis Consistorialibus.` 669, over `Ex Secretaria Brevium.` on the same page) --
 * admitted as the two literal phrases printed, not a general title-case pattern, since a
 * row's own text can open a wrapped line with `Ex ...` in ordinary Latin prose.
 *
 * `SUPREMA` and `CANCELLARIA` bare after `EX` were in an earlier draft of this regex but
 * print in no volume's summa (a corpus-wide search of all 41 volumes found neither, with or
 * without `EX`), so they are dropped; `DATARIA` likewise never prints bare, only as
 * `EX S. DATARIA APOST.` (ASS 28 (1895) 761) and `EX S. DATARIA APOSTOLICA` (ASS 33 (1900)
 * 766), which the abbreviated `S{1,2}\.` branch already reads.
 */
const DICASTERY_RE = /^\s*(EX\s+(?:S{1,2}\.|SACRA\b|SECRETARIA\b|ACTIS\b|AEDIBUS\b).*|S{1,2}\.\s*(?:CONGR\.|CONGREGATIO\b|POENITENTIARIA\b).*|ACTA\s+CONSISTORIALIA\b.*|Ex\s+Actis\s+Consistorialibus\b.*|Ex\s+Secretaria\s+Brevium\b.*)$/;

/** A line that is only the summa's running header (`8oo Index analyticus`, `SUMMA ACTORUM.`, `762 SUMMA {60 spaces} ACTORUM`) or a bare page number (`761`, padded to the margin, ASS 33 (1900) 761), whitespace collapsed. */
const HEADER_LINE_RE = /^\s*(?:(?:\d[\dOoiIl]{0,3}\s+)?(?:Index analyticus|SUMMA\.?\s+A[CGO]TO[RKT]?[UTJ]*M\.?)\s*(?:\d[\dOoiIl]{0,3})?\s*-?|\d[\dOoiIl]{0,3})\s*$/;

/**
 * A page's lines with its two columns unwoven: the summae of ASS 1-33 are set in two
 * columns, which the layout mode prints side by side on one line (`     co-Melchitas 65
 * {70 spaces} stitutis vota simplicia profiten­`, ASS 33 (1900) 761), so the left
 * column's page tokens sit mid-line and close no row. The gutter is the rightmost column
 * that the most lines' runs of four or more spaces cover (the right column's first lines
 * start there; its continuation lines are indented five columns deeper, so a text start
 * would cut only one kind), at column 25 or beyond and on four or more lines; each line is
 * cut at the run covering the gutter (within two columns of it), the left parts first and
 * the right parts after them, and the header line dropped. A page with no such gutter
 * (ASS 41's single-column *Index analyticus*) is returned as printed.
 */
export function splitColumns(page: string): string[] {
  const lines = page.split('\n').filter((l) => !HEADER_LINE_RE.test(l.replace(/\s+/g, ' ')));
  // A line's runs of four or more spaces, the leading run included: a line the left column
  // leaves empty (`{90 spaces}sis .198`, ASS 33 (1900) 761) is the right column's alone.
  const gapsOf = (l: string): { from: number; to: number }[] => [...l.matchAll(/(^|\S)(\s{4,})(?=\S)/g)].map((m) => ({ from: m.index! + m[1]!.length, to: m.index! + m[1]!.length + m[2]!.length }));
  const width = Math.max(0, ...lines.map((l) => l.length));
  const coverage = new Array<number>(width + 1).fill(0);
  for (const l of lines) for (const g of gapsOf(l)) for (let c = Math.max(25, g.from); c < g.to; c++) coverage[c]!++;
  let gutter = -1;
  let most = 0;
  for (let c = 25; c <= width; c++) if (coverage[c]! >= most && coverage[c]! > 0) { most = coverage[c]!; gutter = c; }
  if (gutter < 0 || most < 4) return lines;
  const left: string[] = [];
  const right: string[] = [];
  for (const l of lines) {
    const g = gapsOf(l).find((x) => x.from <= gutter + 2 && x.to >= gutter - 1);
    if (g) { left.push(l.slice(0, g.from)); right.push(l.slice(g.to)); } else left.push(l);
  }
  return left.concat(right);
}
/**
 * A row's end: a page token after a leader, a sign, a space or a single stop glued to the
 * number (`sis .198`, ASS 33 (1900) 761), possibly `N et M`, possibly a trailing stop. The token may start with an OCR letter (`ig3`), but a lookahead requires
 * a genuine digit within its first four characters, so a short Latin word made entirely of
 * OCR-digit-letters (`iis`, `sis`) never reads as a page and closes a row.
 */
const ROW_END_RE = /^(.*?)(?:\s*(?:pag\.|»|>|\*|·|\.+|\s))\s*(?=[\dOoiIlSsgB]{0,3}\d)([\dOoiIlSsgB][\dOoiIlSsgB]{0,3}(?:\s\d{1,2})?)(?:\s+et\s+(\d[\dOoiIlSsgB]{0,3}))?\s*\.?\s*$/;

/**
 * The rows of the papal part: from the papal heading (or the summa's first line, when the
 * heading is interleaved into a row, as ASS 12's `LITTERAE ET ALLOCUTIONES Motu Proprio …`),
 * pausing at the first dicastery heading and reopening at a later papal one -- ASS 8 (1874)
 * 727-728 prints a second `LITTERAE APOSTOLICAE.` heading after its first part's `EX ACTIS
 * CONSISTORIALIBUS.` closes it, with nine further papal rows before the next dicastery
 * heading closes the part for good -- so a dicastery section between two papal ones is
 * skipped rather than counted, and `end` reports the dicastery heading that closes the part,
 * not one merely passed over while paused. A row accumulates lines until one ends in a page
 * token; `N et M` yields two rows of one description. Lines that are only a running header
 * (`8oo Index analyticus`, `SUMMA ACTORUM.`) are skipped. A page token may start with an
 * OCR letter (`ig3`) but must contain a genuine digit, so a short Latin word (`iis`) never
 * closes a row.
 */
export function parseSummaPapalPart(text: string): { rows: SummaRow[]; heading: string | null; end: string | null } {
  const lines = text.split('\f').flatMap(splitColumns);
  let start = -1;
  let heading: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i]!.match(PAPAL_HEAD_RE);
    if (m) { start = i; heading = m[1]!.replace(/\s+/g, ' ').trim(); break; }
    // The heading set over two lines, the first a lone class word (`LITTERAE` / `ET ACTA
    // ROM. PONTIFICIS`, ASS 23 (1890) 752) or ending mid-word before the class noun
    // (`ACTA SOLEMNIORA ROMANI` / `PONTIFICIS.`, ASS 3 (1867) 665) -- joined, and the
    // second line consumed.
    if (/^\s*(?:LITTERAE|ACTA\s+SOLEMNIOR[AEÂ]\s+ROM(?:ANI|\.)?)\s*$/.test(lines[i]!) && i + 1 < lines.length) {
      const two = `${lines[i]!.trim()} ${lines[i + 1]!.trim()}`.match(PAPAL_HEAD_RE);
      if (two) { lines[i] = two[0]; lines[i + 1] = ''; start = i; heading = two[1]!.replace(/\s+/g, ' ').trim(); break; }
    }
  }
  if (start < 0) return { rows: [], heading: null, end: null };
  const rows: SummaRow[] = [];
  let acc: string[] = [];
  let end: string | null = null;
  // Once a dicastery heading is read, the part is paused rather than abandoned: a later
  // papal heading re-opens it (ASS 8 (1874) 728's `LITTERAE APOSTOLICAE`, after its first
  // part closed at `EX ACTIS CONSISTORIALIBUS.` on 727) and its rows are appended, so a
  // dicastery section between two papal ones is skipped rather than counted. While paused,
  // only a papal heading is looked for; every other paused line, dicastery headings
  // included, is ignored, so `end` keeps reporting the first dicastery heading of the
  // *closing* part, not a dicastery heading passed over while still paused.
  let paused = false;
  for (let i = start; i < lines.length; i++) {
    const line = lines[i]!;
    let stripHead = i === start;
    if (paused) {
      if (!PAPAL_HEAD_RE.test(line)) continue;
      paused = false;
      end = null;
      acc = [];
      stripHead = true;
    } else {
      const d = line.match(DICASTERY_RE);
      if (d) { end = d[1]!.replace(/\s+/g, ' ').trim(); paused = true; acc = []; continue; }
    }
    if (line.trim() === '' || HEADER_LINE_RE.test(line.replace(/\s+/g, ' '))) continue;
    const content = stripHead ? line.replace(PAPAL_HEAD_RE, '').trim() : line;
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
