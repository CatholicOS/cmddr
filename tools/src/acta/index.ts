/**
 * Parser for the *Index documentorum chronologico ordine digestus* of an annual AAS
 * *Index generalis* (acta reference spec §2.2, §4.2), read from the pypdf text fixture in
 * tools/fixtures/acta/. Only the *Acta Summi Pontificis* parts are parsed -- one per pope
 * heading (*I – Acta Francisci Pp.*; the 2020 index adds *II – Acta Benedicti XVI*); the
 * dicasterial, synodal and *Diarium* parts are skipped and their headings recorded.
 *
 * Shapes honoured (each has a unit test on an excerpt):
 * - an entry spans lines until the line that ends in dot leaders (or two spaces) and a
 *   page number; a running header, always the first line of a page after the form feed,
 *   can interrupt it;
 * - the date is printed day-first from 2017 (`5 Dec. 2022`) and year-first in 2015-2016
 *   (`2014 Dec. 20`); `»` is a ditto mark inheriting the previous entry's value; a line
 *   that prints a month and no day (`  Sept. » Chengden.:`, 2018) is a defect, but its
 *   month still governs the ditto marks of the entries after it;
 * - month abbreviations vary (`Mar.`/`Mart.`, `Feb.`/`Febr.`, `Sep.`/`Sept.`, with or
 *   without the full stop);
 * - the incipit is printed in guillemets (`« Chi è fedele ».`) or bare (`Ius nativum.`),
 *   ended by a full stop or a colon; a constitution erecting a see prints a small-caps
 *   toponym instead (`VuCArien.:`), which OCR renders in mixed case, or (2017) a toponym
 *   and then the incipit in guillemets;
 * - a line-end hyphen breaks a word (`Sanc-` / `torum`), which pypdf renders with a
 *   space before the hyphen (`cele -`);
 * - the volume is read from the title page (`Vol. CXV`, or 2015's OCR `vol. CvII`).
 */
import { categoryForHeading, normaliseHeading } from './categories.js';

export interface ActaEntry {
  series: 'AAS';
  volume: number;
  year: number;
  page: number;
  /** The pope as the part heading names him, in the nominative: 'Franciscus', 'Benedictus XVI'. */
  pope: string;
  /** The category heading, in normalised upper case ('LITTERAE APOSTOLICAE MOTU PROPRIO DATAE'). */
  category: string;
  /** ISO date after ditto resolution. */
  date: string;
  /** The incipit, guillemets and trailing punctuation stripped; null when the entry prints none. */
  incipit: string | null;
  /**
   * Whether the incipit is printed in guillemets (`« Chi è fedele »`), the index's mark for
   * a vernacular incipit -- although the 2019 canonisation decretals wrap Latin ones too,
   * so the mark evidences the printing, not the language. False for a bare incipit and
   * for an entry without one.
   */
  quoted: boolean;
  /** The small-caps toponym of a constitution, as extracted ('VuCArien.'); null otherwise. */
  toponym: string | null;
  /** The rest of the entry text, leaders and page removed. */
  description: string;
  /** The entry's lines exactly as extracted, joined by newlines, for the report. */
  raw: string;
}

export interface ActaParseResult {
  volume: number;
  year: number;
  entries: ActaEntry[];
  /** Category headings (normalised) that categories.ts does not list, with the pope part. */
  unseenHeadings: string[];
  /** Headings of the parts skipped (dicasteries, synod, Diarium), in order. */
  skippedParts: string[];
  /** Lines and entries the parser could not read, each with the category it was under. */
  defects: { category: string; message: string }[];
}

const MONTHS: Record<string, number> = {
  ian: 1, feb: 2, febr: 2, mar: 3, mart: 3, apr: 4, maii: 5, iun: 6, iul: 7, aug: 8,
  sep: 9, sept: 9, oct: 10, nov: 11, dec: 12,
};
const MONTH_RE = /^(Ian|Febr?|Mart?|Apr|Maii|Iun|Iul|Aug|Sept?|Oct|Nov|Dec)\.?$/;
// `5 Dec. 2022 …`, `» » » …`, `2014 Dec. 20 …`; 2017 once prints the year as `2017.`.
const DATE_LINE_RE = /^\s*(»|\d{1,4})\s+(»|[A-Z][a-z]{2,3}\.?)\s+(»|\d{1,4})\.?(?:\s+(.*))?$/;
/**
 * A date line whose day is not printed (`  Sept. » Chengden.: …`, AAS 2018 p. 689): the
 * entry cannot be dated and is reported, but the month it prints is what the ditto marks
 * of the following entries refer to, so it must still advance the ditto state.
 */
const DAYLESS_DATE_LINE_RE = /^\s*([A-Z][a-z]{2,3}\.?)\s+(»|\d{4})(?:\s+(.*))?$/;
const RUNNING_HEADER_RE =
  /^\s*(\d+\s+Acta Apostolic(?:ae|æ) Sedis\s*[–-]\s*Commentarium Officiale|Index documentorum chronologico ordine digestus\s+\d+)\s*$/;
// The parts are numbered `II – `, `IV. – ` or (2018's Diarium) not at all.
const PART_HEADING_RE = /^\s*(?:[IVXL]+\.?\s*[–-]\s*)?(ACTA\s+[A-Z].*|DIARIUM\s+[A-Z].*|CARDINALIUM COMMISSIO.*)$/;
const POPE_PART_RE = /^ACTA\s+([A-Z]+)\s+(PP\.?|[IVXL]+)\s*$/;
const HEADING_RE = /^\s*[IVXL]+\.?\s*[–-]\s*[A-Z][A-Z .,'’()-]*$/;
const HEADING_CONTINUATION_RE = /^[A-Z][A-Z .,'’()-]*$/;
/** Dot leaders (once an ellipsis), or at least two spaces, then the page number ending the entry. */
const PAGE_END_RE = /(?:(?:\s*\.){2,}|\s*…|\s{2,})\s*(\d{1,4})\s*$/;
/**
 * A full line leaves room for neither leaders nor a second space: `… Erbil (Iraquia) 82`.
 * Accepted only on a line of at least 55 characters whose next line begins something
 * else (a date, a heading, the end), so a year closing a continuation line is never
 * read as a page; and never after another number, so an OCR-split page (`76 4`) is
 * reported rather than misread.
 */
const TIGHT_PAGE_END_RE = /^.{55,}[^\s\d] (\d{1,4})$/;
const VOLUME_RE = /\(An\.\s*(\d{4})?\s*et\s*[Vv]ol\.\s*([CDILMVXcdilmvx]+)\)/;

const ROMAN: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
export function romanToInt(s: string): number {
  const u = s.toUpperCase();
  let total = 0;
  for (let i = 0; i < u.length; i++) {
    const v = ROMAN[u[i]!];
    const next = ROMAN[u[i + 1] ?? ''] ?? 0;
    if (v === undefined) throw new Error(`Not a roman numeral: ${s}`);
    total += v < next ? -v : v;
  }
  return total;
}

/** The genitive of the part heading to the nominative the report prints. */
const POPE_NAMES: Record<string, string> = { FRANCISCI: 'Franciscus', BENEDICTI: 'Benedictus' };

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Join an entry's lines into one text: a line-end hyphen (pypdf prints `cele -` or
 * `Sanc-`) joins to a lower-case continuation without the hyphen, and to an upper-case
 * one with it (`Syro-` / `Malankarensium`); every other break is a space.
 */
export function joinLines(lines: string[]): string {
  let out = '';
  for (const line of lines) {
    const t = line.trim();
    if (out === '') { out = t; continue; }
    const m = out.match(/\s*-$/);
    if (m) {
      const stem = out.slice(0, out.length - m[0].length);
      out = /^[a-z]/.test(t) ? stem + t : `${stem}-${t}`;
    } else {
      out = `${out} ${t}`;
    }
  }
  // Runs of three or more spaces become two: a double space is a separator the index
  // uses in place of a full stop (splitEntryText), a single one is a word break.
  return out.replace(/\s{3,}/g, '  ').trim();
}

const ABBREVIATIONS = new Set(['card', 'rev', 'litt', 'cong', 'pont', 'sect', 'mons', 'prof']);

/**
 * Whether a word ending in a full stop is an abbreviation rather than the last word of an
 * incipit: a single letter (`S.`, `v.d.`), a capitalised pair (`Ss.`, `Em.mum`, `D.ni`) or
 * a listed one (`Card.`, `Rev.di`). `si'` (Laudato si') is not.
 */
const isAbbreviation = (word: string): boolean => {
  const letters = word.replace(/[^A-Za-zÀ-ÿ]/g, '');
  return letters.length <= 1 || (letters.length === 2 && /^[A-Z]/.test(letters))
    || ABBREVIATIONS.has(letters.toLowerCase());
};

/** A short opening phrase printed as an incipit, or null when the head is prose or ends in an abbreviation. */
function asIncipit(head: string): string | null {
  const h = head.replace(/\s+/g, ' ').trim();
  if (h === '' || /\d/.test(h) || !/^[A-Za-zÀ-ÿ]/.test(h) || /[a-z][A-Z]/.test(h)) return null;
  const words = h.split(' ');
  if (words.length > 8 || isAbbreviation(words[words.length - 1]!)) return null;
  return h;
}

/**
 * A toponym is OCR small caps (`VuCArien`, `de sAnCto petro sulA`), or begins in lower case
 * where an incipit is always capitalised (`tigren`, `isiolAnus`), or is a single Latin
 * adjective, abbreviated (`Voten.`) or in full (`Prisrensis-Priscensis`).
 */
const isToponym = (head: string): boolean =>
  /[a-z][A-Z]/.test(head) || /^[a-z]/.test(head)
  || (/^[A-Za-zÀ-ÿ]+\.?(\s*[–-]\s*[A-Za-zÀ-ÿ]+\.?)*$/.test(head)
    && /(en\.|ensis|ana|anus|anum|ae|inus|itana)$/.test(head.split(/\s*[–-]\s*/).pop()!)
    && !/^[A-Z][a-z]+$/.test(head));

/**
 * Split an entry's text into incipit / toponym / description. The incipit is the text in
 * guillemets, or the bare text before the first full stop, colon or double space (`While
 * we walk  Ad Episcopos Nigeriae`) that ends a word rather than an abbreviation; a head
 * ended by a colon or full stop that `isToponym` is a toponym instead. Runs of spaces
 * in `text` are significant: `joinLines` keeps a double space as one.
 */
export function splitEntryText(text: string): Pick<ActaEntry, 'incipit' | 'quoted' | 'toponym' | 'description'> {
  const tidy = (s: string) => s.replace(/\s+/g, ' ').trim();
  const strip = (s: string) => tidy(s.replace(/^[\s.:,;–-]+/, ''));
  const g = text.match(/^«\s*(.+?)\s*»(.*)$/s);
  if (g) return { incipit: tidy(g[1]!), quoted: true, toponym: null, description: strip(g[2]!) };

  // A toponym can be followed by the constitution's incipit in guillemets (the 2017
  // index: `DAnlIensIs. « Insita humanae naturae ». In Honduria …`, four entries); the
  // incipit is then read too, so the document mints from it rather than provisionally.
  const withToponym = (toponym: string, rest: string) => {
    const q = strip(rest).match(/^«\s*(.+?)\s*»(.*)$/s);
    return q
      ? { incipit: tidy(q[1]!), quoted: true, toponym, description: strip(q[2]!) }
      : { incipit: null, quoted: false, toponym, description: strip(rest) };
  };
  const colon = text.match(/^([^:]{1,80}?)\s*:(\s.*|)$/s);
  if (colon && isToponym(tidy(colon[1]!))) return withToponym(tidy(colon[1]!), colon[2]!);
  const dot = text.match(/^(\S{1,40}?)\.(\s.*|)$/s);
  if (dot && isToponym(dot[1]!)) return withToponym(`${dot[1]}.`, dot[2]!);
  // The first full stop or colon that ends a word (so `S.`, `Card.` and `Em.mum` are
  // passed over), followed by white space or the end; or a double space.
  const re = /\s?[.:](?=\s|$)|\s{2,}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const head = text.slice(0, m.index);
    const incipit = asIncipit(head);
    if (incipit !== null) {
      return { incipit, quoted: false, toponym: null, description: strip(text.slice(m.index + m[0].length)) };
    }
    // A prose head will not become an incipit by extending it; one ending in an
    // abbreviation might.
    const words = tidy(head).split(' ');
    if (words.length > 8 || /\d/.test(head) || !isAbbreviation(words[words.length - 1]!)) break;
  }
  return { incipit: null, quoted: false, toponym: null, description: tidy(text) };
}

/** Read the printed date tokens against the previous entry's date; null when a ditto has nothing to inherit. */
function resolveDate(
  a: string, b: string, c: string, prev: { day: number | null; month: number; year: number } | null,
): { day: number; month: number; year: number } | null {
  // Day-first (`5 Dec. 2022`, `30 Sep. »`) from 2017; year-first (`2014 Dec. 20`,
  // `» » 22`) in 2015-2016. The layout is read off each line from where the four-digit
  // and the one-or-two-digit number stand, so an index mixing them would still parse.
  const yearFirst = /^\d{4}$/.test(a) || /^\d{1,2}$/.test(c);
  const [dayTok, yearTok] = yearFirst ? [c, a] : [a, c];
  const monthTok = b;
  const day = dayTok === '»' ? (prev?.day ?? undefined) : Number(dayTok);
  const year = yearTok === '»' ? prev?.year : Number(yearTok);
  const month = monthTok === '»' ? prev?.month : MONTHS[monthTok.replace(/\.$/, '').toLowerCase()];
  if (day === undefined || month === undefined || year === undefined) return null;
  if (!MONTH_RE.test(monthTok) && monthTok !== '»') return null;
  if (day < 1 || day > 31 || year < 1900) return null;
  return { day, month, year };
}

export function parseActaIndex(text: string, opts: { year?: number } = {}): ActaParseResult {
  const vol = text.match(VOLUME_RE);
  if (!vol) throw new Error('No "(An. YYYY et Vol. ...)" heading found in the index text');
  const volume = romanToInt(vol[2]!);
  const printedYear = vol[1] ? Number(vol[1]) : undefined;
  const year = opts.year ?? printedYear ?? volume + 1908;
  if (printedYear !== undefined && printedYear !== year) {
    throw new Error(`The index prints An. ${printedYear} but the fixture is for ${year}`);
  }

  // Lines of the whole text, with every running header dropped: a header is always the
  // first line of a page (after the form feed), and pypdf may glue the previous page's
  // last line to it, so the split is on the form feed first.
  const lines: string[] = [];
  for (const page of text.split('\f')) {
    for (const line of page.split('\n')) {
      if (RUNNING_HEADER_RE.test(line)) continue;
      lines.push(line.replace(/\s+$/, ''));
    }
  }
  const start = lines.findIndex((l) => /^\s*CHRONOLOGICO ORDINE DIGESTUS\s*$/.test(l));
  if (start < 0) throw new Error('No "CHRONOLOGICO ORDINE DIGESTUS" heading found');
  const end = lines.findIndex((l, i) => i > start && /^\s*(INDICES NOMINUM|I – INDEX NOMINUM|INDEX NOMINUM PERSONARUM)/.test(l));

  const result: ActaParseResult = { volume, year, entries: [], unseenHeadings: [], skippedParts: [], defects: [] };
  let pope: string | null = null;
  let category: string | null = null;
  let headingLines: string[] = [];     // the raw lines of the current category heading
  let headingOpen = false;             // the previous line was a category heading (continuations attach)
  let prev: { day: number | null; month: number; year: number } | null = null;
  // `date` is null for an entry whose day is not printed: read to its page, then reported.
  let open: { lines: string[]; date: string | null; category: string; pope: string } | null = null;
  const unseen = new Set<string>();

  const defect = (cat: string | null, message: string) =>
    result.defects.push({ category: cat ?? '(none)', message });
  const flushDefect = () => {
    if (!open) return;
    const what = open.date === null ? 'entry without a day' : 'entry without a page number';
    defect(open.category, `${what}: ${open.lines.map((l) => l.trim()).join(' / ')}`);
    open = null;
  };

  for (let i = start + 1; i < (end < 0 ? lines.length : end); i++) {
    const line = lines[i]!;
    if (line.trim() === '') continue;

    const part = line.match(PART_HEADING_RE);
    if (part) {
      flushDefect();
      const m = part[1]!.replace(/\s+/g, ' ').trim().match(POPE_PART_RE);
      if (m) {
        const name = POPE_NAMES[m[1]!];
        pope = name === undefined ? m[1]! : m[2]!.startsWith('PP') ? name : `${name} ${m[2]}`;
      } else {
        pope = null;
        result.skippedParts.push(line.replace(/\s+/g, ' ').trim());
      }
      category = null;
      headingOpen = false;
      continue;
    }

    if (pope === null) continue;   // inside a skipped part

    if (HEADING_RE.test(line) && !DATE_LINE_RE.test(line)) {
      flushDefect();
      headingLines = [line];
      category = normaliseHeading(line);
      headingOpen = true;
      continue;
    }
    // An all-capitals line between entries is a heading too: the second line of a
    // two-line heading when one has just opened (`VISITATIONES, PEREGRINATIONES, ITINERA`),
    // otherwise a heading printed without a roman numeral (the 2020 *Litterae Apostolicae*
    // of Benedict XVI's part). Inside an entry such a line is a continuation (`CRU)`).
    if (open === null && HEADING_CONTINUATION_RE.test(line.trim()) && /[A-Z]{3}/.test(line)) {
      headingLines = headingOpen ? [...headingLines, line] : [line];
      category = normaliseHeading(headingLines.join(' '));
      headingOpen = true;
      continue;
    }
    headingOpen = false;
    if (category === null) {
      defect(null, `${pope}: line before any category heading: ${line.trim()}`);
      continue;
    }

    const d = line.match(DATE_LINE_RE);
    const dayless = d ? null : line.match(DAYLESS_DATE_LINE_RE);
    if (d && (d[2] === '»' || MONTH_RE.test(d[2]!))) {
      flushDefect();
      const date = resolveDate(d[1]!, d[2]!, d[3]!, prev);
      if (date === null) {
        defect(category, `unreadable date: ${line.trim()}`);
        prev = null;
        continue;
      }
      prev = date;
      open = {
        lines: [line], category, pope,
        date: `${date.year}-${pad(date.month)}-${pad(date.day)}`,
      };
    } else if (dayless && MONTH_RE.test(dayless[1]!)) {
      // No day: the entry is read to its page and reported (never dated by a guess), and
      // the ditto state takes the month and year it prints with no day to inherit, so a
      // `» »` on the next entry resolves to this month and its own printed day, and a
      // `»` day is unreadable rather than a previous entry's.
      flushDefect();
      const month = MONTHS[dayless[1]!.replace(/\.$/, '').toLowerCase()];
      // Read through a closure: the control-flow analysis narrows `prev` to its
      // initialiser here and would type the inherited year as never.
      const inheritedYear = (): number | undefined => prev?.year;
      const year = dayless[2] === '»' ? inheritedYear() : Number(dayless[2]);
      if (month === undefined || year === undefined) {
        defect(category, `unreadable date: ${line.trim()}`);
        prev = null;
        continue;
      }
      prev = { day: null, month, year };
      open = { lines: [line], category, pope, date: null };
    } else if (open === null) {
      defect(category, `line outside any entry: ${line.trim()}`);
      continue;
    } else {
      open.lines.push(line);
    }

    // Does the entry end on this line?
    const last = open.lines[open.lines.length - 1]!;
    let pageMatch = last.match(PAGE_END_RE);
    let pageTail = pageMatch?.[0].length ?? 0;
    if (!pageMatch) {
      const tight = last.match(TIGHT_PAGE_END_RE);
      const next = lines.slice(i + 1).find((l) => l.trim() !== '') ?? '';
      const nextOpens = next === '' || DATE_LINE_RE.test(next) || HEADING_RE.test(next)
        || PART_HEADING_RE.test(next) || HEADING_CONTINUATION_RE.test(next.trim());
      if (tight && nextOpens) { pageMatch = tight; pageTail = tight[1]!.length + 1; }
    }
    if (!pageMatch) {
      if (open.lines.length > 8) flushDefect();
      continue;
    }
    if (open.date === null) { flushDefect(); continue; }
    const page = Number(pageMatch[1]);
    const body = open.lines.map((l, k) => (k === 0 ? (l.match(DATE_LINE_RE)?.[4] ?? '') : l));
    body[body.length - 1] = body[body.length - 1]!.slice(0, -pageTail);
    // A lone leader dot left before a double-space page (`sui iuris   .  484`) is not text.
    let entryText = joinLines(body).replace(/(\s\.)+$/, '');
    let entryDate = open.date;
    let entryPope = open.pope;
    // An act of an earlier pontificate printed in this volume carries its own date, and
    // sometimes its pope, in brackets before the incipit: `11 Maii 2018 [2010 Sept. 19]
    // « Admodum fideli »`, `[Benedictus XVI: 2010 Apr. 25]` (2018), `[Benedictus PP. XVI:
    // 6 Iun. 2010]` (2020, 2021 -- day-first, and with the `PP.`). The bracketed date is
    // the act's date; the printed one stays in `raw`. A bracket that names no pope leaves
    // the entry under the part's pope, and the creator holds it by its date (create.ts).
    const bracket = entryText.match(
      /^\[(?:([A-Za-z]+(?: PP\.)?(?: [IVXL]+)?):\s*)?(?:(\d{4})\s+([A-Z][a-z]{2,3})\.?\s+(\d{1,2})|(\d{1,2})\s+([A-Z][a-z]{2,3})\.?\s+(\d{4}))\]\s*/,
    );
    if (bracket) {
      const inner = bracket[2] !== undefined
        ? resolveDate(bracket[2], bracket[3]!, bracket[4]!, null)
        : resolveDate(bracket[5]!, bracket[6]!, bracket[7]!, null);
      if (inner) {
        entryDate = `${inner.year}-${pad(inner.month)}-${pad(inner.day)}`;
        if (bracket[1]) entryPope = bracket[1].replace(' PP.', '');
        entryText = entryText.slice(bracket[0].length);
      }
    }
    if (categoryForHeading(open.category) === null) unseen.add(`${open.pope}: ${open.category}`);
    result.entries.push({
      series: 'AAS', volume, year, page,
      pope: entryPope, category: open.category, date: entryDate,
      ...splitEntryText(entryText),
      raw: open.lines.map((l) => l.replace(/\s+$/, '')).join('\n'),
    });
    open = null;
  }
  flushDefect();
  result.unseenHeadings = [...unseen];
  return result;
}
