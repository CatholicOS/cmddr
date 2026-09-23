/**
 * The chronological index the *Acta Sanctae Sedis* never printed, synthesised from a
 * volume's body (ass volumes spec §3, phase 2c). Every papal act in the ASS opens with a
 * caps class heading, the pope's name and a description, then the salutation line
 * (`LEO PP. XIII`), then the incipit, and closes with the pope's own dateline (`Datum Romae
 * apud S. Petrum die i Novembris An. MDCCCC, Pontificatus Nostri vicesimo tertio`) -- so
 * the body carries everything the AAS chronological index prints. An act is found from
 * its end (the dateline, or the heading for an allocution, which has none) and read from
 * its start (the nearest preceding class heading that is not a running head). Nothing is
 * guessed: what cannot be read from a quoted line is a defect row for the report and for a
 * curated reading (ASS_READINGS, curation.ts).
 *
 * The tool (tools/scan-ass.ts) runs this once per volume against the whole-volume text in
 * the local store and writes the entries fixture beside the summa fixture; the join reads
 * the fixture offline (join.ts) and never the store.
 */
// The vocabulary and the dates live beside this file (phase 2c-ii-a): re-exported so that
// every importer of the scanner -- the tools, the tests, the report -- keeps one import.
export { assDate } from './ass-dates.js';
export { CLASS_HEADINGS } from './ass-headings.js';

import { headerOf, headerAgrees } from './recover.js';
import { normaliseHeading } from './categories.js';
import type { ActaEntry } from './index.js';
import { DIGIT_OCR } from './summa.js';
import type { SummaCheck } from './summa.js';
import { ASS_PAGE_OFFSETS, type AssPageOffset } from './curation.js';
import { assDate } from './ass-dates.js';
import {
  HEADING_RE, SALUTATION_RE, ADDRESSEE_RE, GREETING_RE, INLINE_GREETING_RE, ABOVE_FORMULA_RE,
  SIGNED_DATELINE_RE, SIGNATURE_RE, RING_RE,
  isCaps, isOpening, isBreveOpening, breveTitle, popeOf, unaccent, joinBreaks, quotedLines, headingOf, capsAbove, blanksAfter,
} from './ass-headings.js';

export interface AssEvidence {
  /** The class heading line(s) as extracted, joined by ` / `. */
  heading: string;
  /** The salutation line (`LEO PP. XIII`), or null when none stands between the heading and the opening (an allocution). */
  salutation: string | null;
  /** The line the opening was read from. */
  opening: string;
  /** The dateline as extracted, or null for a heading-anchored entry. */
  dateline: string | null;
  /** The first non-blank line of the page the heading is on (its running header or page number). */
  header: string;
}

export interface AssEntry extends ActaEntry {
  series: 'ASS';
  incipit: null;
  opening: string;
  anchor: 'dateline' | 'heading' | 'reading';
  evidence: AssEvidence;
}

export interface AssDefect {
  /** The page (1-based, the PDF page) the defect was found on. */
  page: number;
  reason: 'no-heading' | 'no-date' | 'no-opening' | 'header-mismatch' | 'unknown-pope';
  /** The lines the scanner did find, as extracted. */
  lines: string[];
}

export interface AssScan {
  source: string;
  generated: string;
  text: string;
  volume: number;
  year: number;
  pages: number;
  entries: AssEntry[];
  defects: AssDefect[];
  summa: SummaCheck;
}

export interface Anchor {
  /** 1-based page. */
  page: number;
  /** 0-based line within the page. */
  line: number;
  kind: 'dateline' | 'heading';
  text: string;
}

// --- anchors -------------------------------------------------------------------------------

/** The pope's own dateline: the anchor, then `Pontificatus Nostri` within the next three lines (a dicastery's `Datum Romae ex Secretaria …` has none). */
export const DATUM_RE = /Dat(?:um|\.)\s+[REB]om[ae]{1,2}|\bDat[oa]\s+(?:a|in)\s+Roma|\bDal\s+Vaticano|\bDal\s+Palazzo/;
/**
 * `Datum` at a line's end, its `Romae` on the next: the one break the anchor reads across,
 * and only in a dateline that carries the ring of the Fisherman (RING_RE) and
 * `Pontificatus Nostri` after it — `… ostensae. Datum / Romae apud S. Petrum, sub annulo
 * Piscatoris, die x septem­ / bris MDCCCLXXVIII, Pontificatus Nostri anno primo.` (ASS 11
 * (1878) 595). DATUM_RE and PONTIFICATUS_RE are unchanged by it: a dicastery's
 * `Datum Romae ex Secretaria …` carries neither the ring nor the pontificate's year, so it
 * anchors no more here than it does on one line. The `Datum` at the line end is required so
 * that the same dateline is never anchored twice — once on the line before it and once on
 * its own line, where the first rule already reads it.
 *
 * It yields exactly four anchors over the 41 volumes, counted on 2026-09-23, and they are
 * the whole of its effect: ASS 11 (1878) 595, which becomes the act at p. 594; ASS 6 (1870)
 * 327, whose act at p. 324 `headerAgrees` refuses (`S£4` for 324) and `headerAgreesASS`
 * (2c-ii Task 6) admits: `S` is a known digit lookalike, standing for any digit, so the
 * token's one true wrong character (`£`) is within the one-edit bound; ASS 27 (1894) 79,
 * which finds no heading; and ASS 28 (1895) 112, which is **a brief of Pius IX of `16 Maii
 * 1851` quoted inside the `COMPENDIUM FACTI` of a Congregation case**, guillemet and all.
 * Nothing in the anchor can tell a quoted brief from a printed one; that one is refused
 * only by `assDate`'s span bound (a year more than ten before the volume's first), so it is
 * a `no-date` defect rather than a spurious act. An in-span quotation with a pope's name
 * above it would be read as an act, and an era whose volumes quote recent briefs should
 * measure that before trusting the count (the survey's §3 says so where 2c-ii will read it).
 *
 * Three further ring datelines look like this shape and are *not* anchored, each for a
 * reason of its own rather than this rule's: ASS 22 (1889) 203 prints `pontificatus Nostri`
 * with a lower-case p, ASS 32 (1899) 755 the OCR's `Ponti- / catus Nostri`, and ASS 35
 * (1902) 570 the abbreviated `Pont. Nostri` — all three refused by PONTIFICATUS_RE, which
 * this does not loosen.
 */
const DATUM_BROKEN_RE = /\bDat(?:um|\.)\s*$/;
/** `Pontificatus Nostri`, the ASS's `Pontificatus nostri` (ASS 23 (1890) 222; ASS 41 (1908) 297; ASS 1 (1865)). */
export const PONTIFICATUS_RE = /Pontificatus\s+[NnÑ]ostri|(?:del|Del)\s+Nostro\s+Pontificato/;

/** The addressee set in capitals right after the by-line, with no blank line between (`Qua Pontifex dilaudat … / ricam pro catholico prelo favendo. / VENERABILI FRATRI / OTTOCARO EPISCOPO …`, ASS 41 (1908) 198; `A NOS TRÈS CHERS FILS`, ASS 41 361): where the heading block ends. */
const ADDRESSEE_CAPS_RE = /^\s*(?:VENERABILI(?:BUS)?\s+FRAT|DILECT(?:O|IS)\s+FILI|AL\s+SIGNOR|A\s+NOS\s|AUGUSTISSIMO|SERENISSIMO)/;
/** An allocution's own dating: `in Consistorio secreto diei 16 Decembris 1907`, `die 18 Dec. 1907 habita`. */
const HEADING_DATE_RE = /\bdie[i]?\s+(\d{1,2}|[ivxl]+)\s+([A-Za-z]+)\.?\s+(\d{4})/i;

/**
 * A token's distance from the page number, a `DIGIT_OCR` letter (summa.ts) standing for
 * *any* digit rather than the one it is keyed to -- so `S` costs nothing against `8` as it
 * does against `5`, since the check only asks whether the position could be a digit, not
 * which one. Capped like `dist` (recover.ts): a length difference over one is never worth
 * counting further.
 */
function digitDist(token: string, digits: string): number {
  const m = token.length;
  const n = digits.length;
  if (Math.abs(m - n) > 1) return 2;
  const row = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let diag = row[0]!;
    row[0] = i;
    for (let j = 1; j <= n; j++) {
      const a = token[i - 1]!;
      const b = digits[j - 1]!;
      const sub = a === b || (Object.prototype.hasOwnProperty.call(DIGIT_OCR, a) && /\d/.test(b)) ? 0 : 1;
      const cur = Math.min(row[j]! + 1, row[j - 1]! + 1, diag + sub);
      diag = row[j]!;
      row[j] = cur;
    }
  }
  return row[n]!;
}

/**
 * The offset range `volume` and `page` (a PDF page) fall inside, if any (`ASS_PAGE_OFFSETS`,
 * curation.ts) -- the one genuine page offset the whole-series survey found (ASS 7 (1872),
 * PDF pp. 496-547, printed two more than the PDF page), where `headerAgreesASS`'s relaxation
 * must not apply: inside it, a clean digit-for-digit misread is not OCR noise, it is the
 * offset itself, and the page must be refused as `headerAgrees` alone refuses it.
 */
const assPageOffset = (volume: number, page: number): AssPageOffset | null =>
  (ASS_PAGE_OFFSETS[volume] ?? []).find((r) => page >= r.from && page <= r.to) ?? null;

/**
 * The ASS-only relaxation of `headerAgrees` (2c-ii Task 6, on the evidence of the
 * whole-series survey, `docs/superpowers/reports/2026-09-22-ass-survey.md` §5):
 * `headerAgrees` itself is untouched, so the AAS page recovery (recover.ts, phase 2b-iii-b)
 * keeps its stricter rule, but the ASS scanner tries this first when `headerAgrees`
 * refuses -- unless `volume` and `n` fall inside a known page offset (`ASS_PAGE_OFFSETS`,
 * curation.ts: ASS 7 (1872) pp. 496-547), where the relaxation is exactly what would hide
 * the offset and the page is refused as before (fix round 1 of 2c-ii Task 6). Two
 * differences from `headerAgrees` outside such a range: a `DIGIT_OCR` letter stands for any
 * digit rather than the one it is keyed to (`4SI` agrees with 481 -- `S` and `I` are known
 * digit lookalikes, not literally 5 and 1, so only the token's `4` is checked against the
 * page's), and, unlike `headerAgrees`, an all-digit token one edit from the page agrees too
 * (`302` for 502) -- a clean digit-for-digit misread `headerAgrees` refuses everywhere, but
 * which the ASS's OCR prints repeatedly (3/5 confused at ASS 4 (1868) 502, 675; ASS 6
 * (1870) 337; ASS 20 (1887) 593; ASS 30 (1897) 563; ASS 33 (1900) 355, 385; ASS 34 (1901)
 * 623, 634; ASS 35 (1902) 234, 578; 5/8 at ASS 10 (1877) 577, 35 (1902) 578), each confirmed
 * against its volume's neighbouring pages, never a run over the 48 mismatches the survey
 * measured (§5, finding 15d) -- ASS 7's offset is a different thing, a stretch of pages the
 * scan skips outright, not a mismatch the survey's 48 counted (its defects there are all
 * `no-heading`, so no page in the range ever reached this check before). Two adjacent
 * header tokens are also tried joined, for a number a stray space or stop splits in two
 * (`ol 2` for 312, `5.3 i` for 531).
 *
 * Measured over the 48 header-mismatch pages of the whole series (2026-09-23 survey): 40
 * agree by this rule. The other 8 stay refused -- three already answered by a curated
 * reading regardless (ASS_READINGS, curation.ts: ASS 33 (1900) 449 `U9`, ASS 41 (1908) 298
 * and 495, whose page numbers split across two OCR lines the way `headerOf`'s single line
 * cannot reach) and five not, each confirmed OCR noise by its neighbours but too far from
 * the page to admit safely, without also risking accepting a page whose header truly
 * disagrees: ASS 8 (1874) 373 `575` and 686 `G8fí` (a second digit misread in the same
 * token), ASS 10 (1877) 49 `4<¡` (a stray symbol, not a digit lookalike), ASS 13 (1880) 3
 * (a reprint's front matter, no header printed at all, with a stray digit in the running
 * text the check reads as one), and ASS 16 (1883) 241 `144` (two digits wrong).
 */
export const headerAgreesASS = (header: string, n: number, volume: number): boolean => {
  if (headerAgrees(header, n)) return true;
  if (assPageOffset(volume, n) !== null) return false;
  const digits = String(n);
  const toks = header.split(/\s+/).filter((t) => t !== '');
  const pairs = toks.slice(0, -1).map((t, i) => t + toks[i + 1]);
  return [...toks, ...pairs].some((t) => /\d/.test(t) && digitDist(t, digits) <= 1);
};

/**
 * The index of the first line from `from` that is neither blank, a greeting, a caps line
 * (the addressee set in capitals, a by-line), nor an addressee in the dative with the
 * lines that continue it to the next blank line -- the preamble between a heading block
 * and the salutation, and between the salutation and the opening -- bounded at `limit`.
 */
const pastPreamble = (lines: readonly string[], from: number, limit: number): number => {
  let k = from;
  while (k < limit) {
    const l = lines[k]!;
    if (SALUTATION_RE.test(l)) break;
    // The dative before the vocative: `Venerabili Fratri Nostro` is an addressee, which the greeting's `Venerabil\w+` would otherwise take (ASS 12 (1879) 225).
    if (ADDRESSEE_RE.test(l)) {
      k++;
      while (k < limit && lines[k]!.trim() !== '' && !GREETING_RE.test(lines[k]!) && !SALUTATION_RE.test(lines[k]!)) k++;
      continue;
    }
    if (l.trim() === '' || GREETING_RE.test(l) || isCaps(l)) { k++; continue; }
    // A greeting broken before its `salutem` is not skipped: its first line carries none
    // of GREETING_RE's vocabulary, so the act's opening is read from the greeting itself
    // (`Augustissime et potentissime Imperator, / salutem et prosperitatem.`, ASS 41
    // (1908) 12 ll. 34-35, where p. 18 l. 13 sets the same greeting on one line and
    // GREETING_RE reads it whole). One act of the sample prints the shape, so it is a
    // curated reading (ASS_READINGS `ASS:41:12`, spec §6) and not a rule here; 2c-ii
    // counts how often the break recurs before one is written.
    break;
  }
  return k;
};

/**
 * The salutation line after a heading block, or null: from `from`, past the preamble
 * lines (pastPreamble: blanks, greetings, the addressee set in capitals or in the dative
 * with its continuation), within sixteen lines. The acts of ASS 41 set the addressee between the by-line and the
 * salutation (`VENERABILI FRATRI / MARIANO ANTONIO ARCHIEPISCOPO BONAERENSI / BONUM
 * AEREM / PIUS PP. X`, p. 299; pp. 18, 65, 298, 495, 578); ASS 12 (1879) 97 sets seven
 * blank lines and the addressee before `LEO PP. XIII`.
 */
export const salutationAfter = (lines: readonly string[], from: number, limit: number): number | null => {
  const k = pastPreamble(lines, from, Math.min(lines.length, from + 16, limit));
  return k < Math.min(lines.length, from + 16, limit) && SALUTATION_RE.test(lines[k]!) ? k : null;
};

/**
 * Every anchor of the body, in page order: the pope's datelines (`dateline`) and the
 * allocution headings (`heading`, since an allocution closes without a dateline). A
 * heading line is an anchor only when it opens an act (isOpening). Three datelines are
 * read: the pope's own (DATUM_RE with PONTIFICATUS_RE behind it), his private letters'
 * signed one (SIGNED_DATELINE_RE with SIGNATURE_RE under it), and, since phase 2c-ii-a,
 * the brevia's, which is the first with its `Datum` broken to the line end (DATUM_BROKEN_RE)
 * and the ring of the Fisherman in it.
 */
export function findAnchors(pages: readonly string[]): Anchor[] {
  const anchors: Anchor[] = [];
  pages.forEach((page, p) => {
    const lines = page.split('\n');
    lines.forEach((line, i) => {
      // The window's line breaks are joined first: the ASS breaks `Pon­ / tificatus` at the
      // line end (ASS 33 (1900) 3, 449; ASS 12 (1879) 481; ASS 23; ASS 41).
      if ((DATUM_RE.test(line) && PONTIFICATUS_RE.test(joinBreaks(lines.slice(i, i + 4))))
        || (DATUM_BROKEN_RE.test(line) && RING_RE.test(joinBreaks(lines.slice(i, i + 2)))
          && DATUM_RE.test(joinBreaks(lines.slice(i, i + 2))) && PONTIFICATUS_RE.test(joinBreaks(lines.slice(i, i + 5))))
        || (SIGNED_DATELINE_RE.test(line) && /\d{4}/.test(joinBreaks(lines.slice(i, i + 2))) && lines.slice(i + 1, i + 5).some((l) => SIGNATURE_RE.test(l)))) {
        anchors.push({ page: p + 1, line: i, kind: 'dateline', text: quotedLines(lines, i).map((l) => l.trim()).join(' ').replace(/­/g, '') });
        return;
      }
      const h = headingOf(line);
      if (h && h[1] === 'ALLOCUTIO' && isOpening(lines, i)) {
        anchors.push({ page: p + 1, line: i, kind: 'heading', text: line.trim() });
      }
    });
  });
  return anchors;
}

// --- the scan ------------------------------------------------------------------------------

interface Located { page: number; line: number }

/**
 * The nearest line at or before `anchor` that `opens` accepts, walking back line by line
 * and page by page, no earlier than `floor` (the previous anchor): readAct's step 1, run
 * once over the class headings and once, for a breve, over the pope's own name.
 */
function walkBack(pages: readonly string[], anchor: Anchor, floor: Located | null, opens: (lines: readonly string[], i: number) => boolean): Located | null {
  for (let p = anchor.page; p >= 1; p--) {
    const lines = pages[p - 1]!.split('\n');
    const start = p === anchor.page ? anchor.line - 1 : lines.length - 1;
    const stop = floor !== null && floor.page === p ? floor.line + 1 : 0;
    for (let i = start; i >= stop; i--) if (opens(lines, i)) return { page: p, line: i };
    if (floor !== null && floor.page === p) break;
  }
  return null;
}

/**
 * Read one act: from `anchor` back to its heading, no earlier than `floor` (the previous
 * anchor), then forward from the heading to the salutation and the opening. Returns the
 * entry, or the defect that stopped the reading.
 */
function readAct(pages: readonly string[], anchor: Anchor, floor: Located | null, opts: { volume: number; year: number; yearTo: number }): { entry?: AssEntry; defect?: AssDefect } {
  const at = (p: number) => pages[p - 1]!.split('\n');
  // 1. The heading: walk back line by line, page by page, to the nearest class heading that is not a running head.
  let heading: Located | null = null;
  if (anchor.kind === 'heading') heading = { page: anchor.page, line: anchor.line };
  else {
    heading = walkBack(pages, anchor, floor, isOpening);
    // The brevia of the *Secretaria Brevium* (spec §10, phase 2c-ii-a): an act that closes
    // under the ring of the Fisherman and has no class heading behind it is read from the
    // pope's own name (isBreveOpening), the descriptive title above it standing where the
    // class word stands elsewhere. The second walk runs only where the first found nothing
    // and only under the ring, so no act a class heading already opens is read differently
    // and nothing but a breve is added.
    if (heading === null && RING_RE.test(anchor.text)) {
      const salutation = walkBack(pages, anchor, floor, isBreveOpening);
      if (salutation !== null) heading = { page: salutation.page, line: breveTitle(at(salutation.page), salutation.line)! };
    }
  }
  const anchorLines = quotedLines(at(anchor.page), anchor.line).map((l) => l.trim());
  if (heading === null) return { defect: { page: anchor.page, reason: 'no-heading', lines: anchorLines } };

  // 2. The heading block: the caps lines above the heading (capsAbove), then from the
  // heading line to the first blank line (or the salutation), skipping the blank lines
  // after a lone class word (headingAlone).
  const hl = at(heading.page);
  // The caps lines above the heading are the block's only when they are the pope's (ABOVE_FORMULA_RE): a signatory's name in capitals above the next act (`I. CUGNONIUS`, ASS 33 (1900) 355) is not.
  const capsUp = capsAbove(hl, heading.line);
  const above = ABOVE_FORMULA_RE.test(capsUp.join(' ')) ? capsUp : [];
  const block: string[] = [hl[heading.line]!.trim()];
  let i = heading.line + 1 + blanksAfter(hl, heading.line);
  for (; i < hl.length && hl[i]!.trim() !== '' && !SALUTATION_RE.test(hl[i]!) && !ADDRESSEE_CAPS_RE.test(hl[i]!); i++) block.push(hl[i]!.trim());
  const headingText = above.concat(block).join(' / ');
  // The class, from the heading's own class word -- or `BREVE`, the class of the one act
  // the walk-back opens on a line that carries none: a breve of the *Secretaria Brevium*,
  // whose title is a description and whose class the ring it closes under declares
  // (categories.ts's `Brevia` row, shelf class `brief`).
  const h = headingOf(hl[heading.line]!);
  const category = h === null ? 'BREVE' : normaliseHeading(h[2] ? `${h[1]} in forma Brevis` : h[1]!);
  // 3. The salutation, past the preamble after the block (salutationAfter); then the
  // preamble lines after it; then the opening line. The opening stops at the anchor line
  // on the same page.
  const bodyEnd = anchor.page === heading.page && anchor.kind === 'dateline' ? anchor.line : hl.length;
  let salutation: string | null = null;
  let j = i;
  const sal = salutationAfter(hl, i, bodyEnd);
  if (sal !== null) { salutation = hl[sal]!.trim(); j = sal + 1; }
  // The preamble after the salutation (pastPreamble), except that a greeting line with the
  // opening after it (INLINE_GREETING_RE) is the opening's line -- the line pastPreamble
  // *stops* at included, since a greeting whose last words GREETING_RE does not close on
  // is exactly the line it stops at (`Benedictionem. Praeclarum studium, quo incensi
  // estis, ut ex`, ASS 23 (1890) 449; the opening would otherwise be read from the
  // greeting's last word).
  let inline: string | null = null;
  const past = pastPreamble(hl, j, bodyEnd);
  const withOpening = hl.slice(j, Math.min(past + 1, bodyEnd)).findIndex((l) => INLINE_GREETING_RE.test(l) && GREETING_RE.test(l.match(INLINE_GREETING_RE)![1]!));
  if (withOpening >= 0) { j += withOpening; inline = hl[j]!.match(INLINE_GREETING_RE)![2]!; } else j = past;
  // The opening: the first eight words from the opening line onward (line breaks joined,
  // the guillemets of ASS 1 dropped), from the text after an inline greeting when the
  // greeting shares the line (INLINE_GREETING_RE).
  const openingLines = inline !== null ? [inline, ...hl.slice(j + 1, Math.min(bodyEnd, j + 3))] : hl.slice(j, Math.min(bodyEnd, j + 3));
  const words = joinBreaks(openingLines).split(' ').filter((w) => /[A-Za-z0-9]/.test(w)).map((w) => w.replace(/^[«»<>]+|[«»<>]+$/g, '')).filter((w) => w !== '');
  if (words.length < 3) return { defect: { page: heading.page, reason: 'no-opening', lines: [headingText, ...(salutation ? [salutation] : []), ...openingLines.map((l) => l.trim())] } };
  const opening = words.slice(0, 8).join(' ');
  // 4. The pope, from the block (its line breaks joined: `Pa­ / pae XIII`, ASS 33 (1900) 385), the salutation or the description.
  const pope = popeOf([joinBreaks(above.concat(block)), salutation ?? ''].join(' '), opts.year);
  if (pope === null) return { defect: { page: heading.page, reason: 'unknown-pope', lines: [headingText, ...(salutation ? [salutation] : [])] } };
  // 5. The date: the dateline, or the allocution's own heading, else the unreadable marker.
  const span = { from: opts.year, to: opts.yearTo };
  let date: string | null;
  let dateline: string | null = null;
  if (anchor.kind === 'dateline') {
    // The dateline's own lines only (quotedLines): a dateline on one line does not swallow
    // the act that follows it with no blank between them (ASS 41 (1908), two acts on one page).
    dateline = joinBreaks(quotedLines(at(anchor.page), anchor.line));
    date = assDate(dateline, span);
    if (date === null) return { defect: { page: heading.page, reason: 'no-date', lines: [headingText, dateline] } };
  } else {
    const hd = headingText.match(HEADING_DATE_RE);
    const iso = hd ? assDate(`Datum Romae die ${hd[1]} ${hd[2]} anno ${hd[3]}`, span) : null;
    date = iso ?? '????-??-??';
  }
  // 6. The page: the PDF page, which the running header must not contradict
  // (headerAgreesASS, the ASS-only relaxation of headerAgrees; 2c-ii Task 6).
  const header = headerOf(pages[heading.page - 1]!);
  if (!headerAgreesASS(header, heading.page, opts.volume)) return { defect: { page: heading.page, reason: 'header-mismatch', lines: [header, headingText] } };
  const description = block.slice(0, 1).map((l) => unaccent(l).replace(HEADING_RE, '$3').trim()).concat(block.slice(1)).join(' ').replace(/\s+/g, ' ').trim();
  return {
    entry: {
      series: 'ASS', volume: opts.volume, year: opts.year, page: heading.page, pope, category, date,
      incipit: null, quoted: false, toponym: null, description, raw: headingText,
      opening, anchor: anchor.kind,
      evidence: { heading: headingText, salutation, opening: joinBreaks(openingLines.slice(0, 1)), dateline, header },
    },
  };
}

/**
 * Every papal act of a volume body, in page order: each anchor (findAnchors) on or before
 * `lastBodyPage` read back to its heading, no earlier than the previous anchor. Entries and
 * defects are disjoint: an anchor yields one or the other.
 */
export function scanVolume(pages: readonly string[], opts: { volume: number; year: number; yearTo: number; lastBodyPage: number }): { entries: AssEntry[]; defects: AssDefect[] } {
  const entries: AssEntry[] = [];
  const defects: AssDefect[] = [];
  const anchors = findAnchors(pages).filter((a) => a.page <= opts.lastBodyPage);
  let previous: Located | null = null;
  for (const a of anchors) {
    const r = readAct(pages, a, previous, opts);
    if (r.entry) entries.push(r.entry); else defects.push(r.defect!);
    previous = { page: a.page, line: a.line };
  }
  return { entries, defects };
}
