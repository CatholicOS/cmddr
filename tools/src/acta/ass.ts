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
import { latinDate, headerOf, headerAgrees } from './recover.js';
import { normaliseHeading } from './categories.js';
import { ACTA_POPES } from './popes.js';
import type { ActaEntry } from './index.js';
import type { SummaCheck } from './summa.js';

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

// --- dates ---------------------------------------------------------------------------------

/**
 * The OCR's readings of the letters of a roman numeral, measured on the sample: `MDCGCC`
 * (ASS 33 p. 285), `MCMVHI` (ASS 41 p. 297), `xxin` for `xxiii` (ASS 41 p. 298),
 * `MCMVIÌI` (ASS 41 p. 491). Applied to a numeral token only, never to a word.
 */
const ROMAN_OCR: Readonly<Record<string, string>> = { g: 'c', h: 'ii', n: 'ii', ì: 'i', í: 'i', î: 'i', ï: 'i', j: 'i' };
const repairRoman = (token: string): string => token.toLowerCase().split('').map((c) => ROMAN_OCR[c] ?? c).join('');
const ROMAN_TOKEN = /^[mdclxvighnìíîïj]+$/i;

const IT_MONTHS: Readonly<Record<string, number>> = {
  gennaio: 1, febbraio: 2, marzo: 3, aprile: 4, maggio: 5, giugno: 6, luglio: 7, agosto: 8, settembre: 9, ottobre: 10, novembre: 11, dicembre: 12,
};

/**
 * The date of an ASS act from its own dateline, on top of `latinDate` (recover.ts): the
 * ASS abbreviates `anno` to `An.` and `a.` before the year (`die i Novembris An. MDCCCC`,
 * `die xxv Iunii a. MDCCCCV`), and its OCR misreads letters of the roman numerals
 * (ROMAN_OCR) -- both repaired in the text before `latinDate` reads it, the numeral repair
 * on numeral-shaped tokens after `die`, `anno`/`an.`/`a.` and the month only. An Italian
 * dateline (`Dal Vaticano, 20 Settembre 1900`) is read by its own month table. A year more
 * than ten years before the volume's first year, or after its last year plus one, is
 * rejected: the ASS reprint an act years late (ASS 41 (1908) prints nine letters of 1905 at
 * pp. 12-20), never early; the bound is what stops an OCR-mangled year becoming a value.
 * Null when no readable date; the caller reports a defect.
 */
export function assDate(text: string, span: { from: number; to: number }): string | null {
  const t = text.replace(/­/g, '').replace(/\s+/g, ' ');
  const inSpan = (iso: string | null): string | null => {
    if (iso === null) return null;
    const y = Number(iso.slice(0, 4));
    return y >= span.from - 10 && y <= span.to + 1 ? iso : null;
  };
  // Latin: normalise `An.`/`a.` to `anno`; repair the day token after `die` (pass 1) and any
  // numeral-shaped token of four letters or more that needs a repair (pass 2: a year --
  // `MDCGCC`, `MCMVHI` -- never a Latin word, which the length and the need for a repair
  // exclude; two passes, since one global regex would consume `Novembris anno` and skip
  // the year after it).
  const needsRepair = /[ghnìíîïj]/i;
  // The trailing `\b` a plain ASCII word boundary would use breaks a token at an accented
  // letter (`Ì`, not a `\w` character to the engine), truncating `MCMVIÌI` to `MCMVI` before
  // the repair ever sees the rest of it (ASS 41 p. 491): the boundary is written out against
  // the same letter set the token itself admits, so it does not end early on one of them.
  const NOT_ROMAN_LETTER = 'A-Za-zìíîïÌÍÎÏ';
  const latin = t
    .replace(/\b(?:An|a)\.\s+(?=[MDCLXVIGHNmdclxvighn])/g, 'anno ')
    .replace(/\b(die)\s+([A-Za-zìíîï]{1,6})\b/g, (m, lead: string, tok: string) => (ROMAN_TOKEN.test(tok) && needsRepair.test(tok) ? `${lead} ${repairRoman(tok)}` : m))
    .replace(new RegExp(`(?<![${NOT_ROMAN_LETTER}])([MDCLXVIGHNmdclxvighnìíîïÌÍÎÏj]{4,})(?![${NOT_ROMAN_LETTER}])`, 'g'), (tok: string) => (needsRepair.test(tok) && /^[mdclxvi]+$/.test(repairRoman(tok)) ? repairRoman(tok) : tok));
  const fromLatin = inSpan(latinDate(latin));
  if (fromLatin !== null) return fromLatin;
  // Italian: `Dal Vaticano, 20 Settembre 1900` / `Dato a Roma, li 3 Marzo 1901`.
  const it = t.match(/\b(?:Dal|Dato|Data|Roma|Vaticano)\b[^.]{0,60}?\b(?:li|il|addì)?\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (it) {
    const month = IT_MONTHS[it[2]!.toLowerCase()];
    const day = Number(it[1]);
    if (month !== undefined && day >= 1 && day <= 31) return inSpan(`${it[3]}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  }
  return null;
}

// --- anchors -------------------------------------------------------------------------------

/** The pope's own dateline: the anchor, then `Pontificatus Nostri` within the next three lines (a dicastery's `Datum Romae ex Secretaria …` has none). */
const DATUM_RE = /Dat(?:um|\.)\s+[REB]om[ae]{1,2}|\bDat[oa]\s+(?:a|in)\s+Roma|\bDal\s+Vaticano|\bDal\s+Palazzo/;
const PONTIFICATUS_RE = /Pontificatus\s+[NÑ]ostri|(?:del|Del)\s+Nostro\s+Pontificato/;

/**
 * The class headings a papal act opens with in the ASS, longest first so that `EPISTOLA
 * ENCYCLICA` is read before `EPISTOLA` (spec §3; extended only by what a sample volume
 * prints, each addition quoted). `LITTERAE in forma Brevis` is matched case-insensitively
 * on its tail.
 */
export const CLASS_HEADINGS: readonly string[] = [
  'EPISTOLA ENCYCLICA', 'LITTERAE ENCYCLICAE', 'LITTERAE APOSTOLICAE', 'LITTERAE DECRETALES',
  'CONSTITUTIO APOSTOLICA', 'MOTU PROPRIO', 'ALLOCUTIO', 'EXHORTATIO', 'CHIROGRAPHUS', 'BREVE', 'LITTERAE', 'EPISTOLA',
];
const HEADING_RE = new RegExp(`^\\s*(?:\\d[\\dOoiIla]{0,3}\\s+)?(?:ACTA ROMANI PONTIFICIS\\s+)?(${CLASS_HEADINGS.join('|')})(\\s+in forma Brevis)?\\b\\.?(.*)$`);
/**
 * The pope named in a heading block or a salutation: the genitive of the heading
 * (`SANCTISSIMI DOMINI NOSTRI LEONIS XIII`, `SSmi. D. N. Leonis XIII`, `Pii PP. X`), the
 * nominative of the description (`Qua Pius X laudat`) or of the salutation (`LEO PP.
 * XIII`, `PIUS PP. X`, `LEO EPISCOPUS`), the Italian `LEONE PP. XIII`.
 */
const POPE_RE = /\b(LEONIS|LEO|LEONE|PII|PIUS|PIO)\b\s*(?:PAPAE|PP\.?|Pp\.?|EPISCOPUS|div\.\s*prov\.\s*(?:Papae|PP\.?)|Div\.\s*Prov\.\s*(?:Papae|PP\.?))?\s*(XIII|IX|X)\b/i;
const SALUTATION_RE = /^\s*(LEO|PIUS|LEONE|PIO)\s+(PP\.?|PAPA|EPISCOPUS)\b[^\n]{0,40}$/;
/** An address line between the salutation and the opening: `Venerabiles Fratres Salutem et Apostolicam Benedictionem.`, `Dilecte Fili Noster, salutem …`, `Venerabiles Fratres,`. */
const ADDRESS_RE = /^\s*(?:Venerabil|Dilect|Signor|Salutem|Carissim)|Benedictionem\.?\s*$|salutem et Apostolicam/i;
/** An allocution's own dating: `in Consistorio secreto diei 16 Decembris 1907`, `die 18 Dec. 1907 habita`. */
const HEADING_DATE_RE = /\bdie[i]?\s+(\d{1,2}|[ivxl]+)\s+([A-Za-z]+)\.?\s+(\d{4})/i;

/** What an act's heading block names that a running head and a body line do not: the pope (POPE_RE), the formula `SSmi D. N.` / `Sanctissimi Domini Nostri`, or `Pontifex` / `SSmus Pater` in the description (`Qua Pontifex mittit Legatum …`, ASS 41 (1908) 65). */
const OPENING_FORMULA_RE = new RegExp(`${POPE_RE.source}|SANCTISSIMI|Sanctissimi|SS(?:MI|mi|ÑI)?\\.?\\s*[DO]\\.?\\s*N\\.|\\bPontifex\\b|SS(?:mus|MUS)\\.?\\s+Pater`, 'i');

/**
 * Whether the heading line at `lines[i]` names nothing else of its own and carries no
 * leading page number: `ALLOCUTIO` alone, versus `274 EPISTOLA ENCYCLICA` -- a running
 * head, whose leading digits `HEADING_RE` swallows into the same uncaptured group as a
 * real heading's own leading whitespace, so its rest-of-line capture (`$3`) is empty too,
 * and the captured groups alone cannot tell the two apart. Checked against the raw line,
 * not the captured groups, only a heading truly alone on its line carries a blank line
 * before its by-line (`ALLOCUTIO`, blank, `SANCTISSIMI DOMINI NOSTRI LEONIS XIII`, ASS 12
 * (1879) 13), which the block reader skips once; a running head's blank line, if any, stays
 * a stop, so a body word like `Pontifex` after it is never read into its block (ASS 41
 * (1908) 65).
 */
const headingAlone = (lines: readonly string[], i: number): boolean => {
  const line = lines[i]!;
  const h = line.match(HEADING_RE);
  return h !== null && !h[2] && h[3]!.trim() === '' && !/^\s*\d[\dOoiIla]{0,3}\s+/.test(line);
};

/**
 * Whether the class heading at `lines[i]` opens an act: its heading block -- the line and
 * the lines after it to the first blank line, four at most (plus the one blank line a bare
 * class word skips before its by-line, headingAlone) -- carries the opening formula
 * (OPENING_FORMULA_RE). A running head (`274 EPISTOLA ENCYCLICA`, `EPISTOLA ENCYCLICA Hi`
 * for the OCR's 111, ASS 12 (1879)) is followed by body text and fails the test, whether or
 * not a blank line comes after it (headingAlone excludes it by its leading page number, so
 * the blank is never skipped and the body is never read into its block); a bare class word
 * (`ALLOCUTIO`) is followed by one blank line and then its by-line (`SANCTISSIMI DOMINI
 * NOSTRI LEONIS XIII`, ASS 12 (1879) 13) and passes. A body line whose first words the OCR
 * set in capitals as a class word is excluded the same way.
 */
const isOpening = (lines: readonly string[], i: number): boolean => {
  if (!HEADING_RE.test(lines[i]!)) return false;
  const block: string[] = [lines[i]!];
  let k = i + 1;
  if (headingAlone(lines, i) && lines[k]?.trim() === '') k++;
  for (; k < Math.min(lines.length, i + 4); k++) {
    if (lines[k]!.trim() === '') break;
    block.push(lines[k]!);
  }
  return OPENING_FORMULA_RE.test(block.join(' '));
};

/**
 * The lines quoted from `start` on -- a dateline, or the lines above an anchor with no
 * heading before it -- stopping at a blank line or the next act's heading, capped at
 * `max`: shared by the dateline extraction (readAct), the anchor's own quoted text
 * (findAnchors) and the `no-heading` defect's lines (readAct), so a run-on page (two acts
 * with no blank between them, ASS 41 (1908); an anchor with nothing above it) is bounded
 * the same way everywhere the body is quoted.
 */
const quotedLines = (lines: readonly string[], start: number, max = 3): string[] => {
  const out: string[] = [lines[start]!];
  for (let k = start + 1; k < Math.min(lines.length, start + max); k++) {
    if (lines[k]!.trim() === '' || HEADING_RE.test(lines[k]!)) break;
    out.push(lines[k]!);
  }
  return out;
};

/**
 * Every anchor of the body, in page order: the pope's datelines (`dateline`) and the
 * allocution headings (`heading`, since an allocution closes without a dateline). A
 * heading line is an anchor only when it opens an act (isOpening).
 */
export function findAnchors(pages: readonly string[]): Anchor[] {
  const anchors: Anchor[] = [];
  pages.forEach((page, p) => {
    const lines = page.split('\n');
    lines.forEach((line, i) => {
      if (DATUM_RE.test(line) && PONTIFICATUS_RE.test(lines.slice(i, i + 4).join(' '))) {
        anchors.push({ page: p + 1, line: i, kind: 'dateline', text: quotedLines(lines, i).map((l) => l.trim()).join(' ').replace(/­/g, '') });
        return;
      }
      const h = line.match(HEADING_RE);
      if (h && h[1] === 'ALLOCUTIO' && isOpening(lines, i)) {
        anchors.push({ page: p + 1, line: i, kind: 'heading', text: line.trim() });
      }
    });
  });
  return anchors;
}

// --- the scan ------------------------------------------------------------------------------

const popeOf = (text: string): string | null => {
  const m = text.match(POPE_RE);
  if (!m) return null;
  const numeral = m[2]!.toUpperCase();
  const name = m[1]!.toUpperCase().startsWith('L') ? 'LEONIS' : 'PII';
  return ACTA_POPES.find((p) => p.genitive === `${name} ${numeral}`)?.pope ?? null;
};

/** Words of a line with the soft hyphens and the `letter-` line breaks joined. */
const joinBreaks = (lines: readonly string[]): string => lines.join('\n').replace(/­\s*\n\s*/g, '').replace(/([a-z])-\s*\n\s*([a-z])/gi, '$1$2').replace(/\s+/g, ' ').trim();

interface Located { page: number; line: number }

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
    outer: for (let p = anchor.page; p >= 1; p--) {
      const lines = at(p);
      const start = p === anchor.page ? anchor.line - 1 : lines.length - 1;
      const stop = floor !== null && floor.page === p ? floor.line + 1 : 0;
      for (let i = start; i >= stop; i--) {
        if (isOpening(lines, i)) { heading = { page: p, line: i }; break outer; }
      }
      if (floor !== null && floor.page === p) break;
    }
  }
  const anchorLines = quotedLines(at(anchor.page), anchor.line).map((l) => l.trim());
  if (heading === null) return { defect: { page: anchor.page, reason: 'no-heading', lines: anchorLines } };

  // 2. The heading block: from the heading line to the first blank line (or the salutation),
  // skipping the one blank line after a lone class word (headingAlone).
  const hl = at(heading.page);
  const block: string[] = [hl[heading.line]!.trim()];
  let i = heading.line + 1;
  if (headingAlone(hl, heading.line) && hl[i]?.trim() === '') i++;
  for (; i < hl.length && hl[i]!.trim() !== '' && !SALUTATION_RE.test(hl[i]!); i++) block.push(hl[i]!.trim());
  const headingText = block.join(' / ');
  const h = hl[heading.line]!.match(HEADING_RE)!;
  const category = normaliseHeading(h[2] ? `${h[1]} in forma Brevis` : h[1]!);
  // 3. The salutation, within the next six lines after the block; then the address lines; then the opening line.
  let salutation: string | null = null;
  let j = i;
  for (let k = i; k < Math.min(hl.length, i + 6); k++) {
    if (SALUTATION_RE.test(hl[k]!)) { salutation = hl[k]!.trim(); j = k + 1; break; }
  }
  while (j < hl.length && (hl[j]!.trim() === '' || ADDRESS_RE.test(hl[j]!))) j++;
  // The opening: the first eight words from the opening line onward (line breaks joined), stopping at the anchor line on the same page.
  const bodyEnd = anchor.page === heading.page && anchor.kind === 'dateline' ? anchor.line : hl.length;
  const openingLines = hl.slice(j, Math.min(bodyEnd, j + 3));
  const words = joinBreaks(openingLines).split(' ').filter((w) => w !== '');
  if (words.length < 3) return { defect: { page: heading.page, reason: 'no-opening', lines: [headingText, ...(salutation ? [salutation] : []), ...openingLines.map((l) => l.trim())] } };
  const opening = words.slice(0, 8).join(' ');
  // 4. The pope, from the block, the salutation or the description.
  const pope = popeOf([headingText, salutation ?? ''].join(' '));
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
  // 6. The page: the PDF page, which the running header must not contradict.
  const header = headerOf(pages[heading.page - 1]!);
  if (!headerAgrees(header, heading.page)) return { defect: { page: heading.page, reason: 'header-mismatch', lines: [header, headingText] } };
  const description = block.slice(0, 1).map((l) => l.replace(HEADING_RE, '$3').trim()).concat(block.slice(1)).join(' ').replace(/\s+/g, ' ').trim();
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
