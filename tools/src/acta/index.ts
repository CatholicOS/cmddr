/**
 * Parser for the *Index documentorum chronologico ordine digestus* of the *Acta Apostolicae
 * Sedis* (acta reference spec §2.2, §4.2; acta volumes spec §4), read from a pypdf text
 * fixture in tools/fixtures/acta/: an annual *Index generalis* PDF (2010-2024, extracted
 * whole) or the index pages of a whole-volume OCR PDF (1909-2002, extracted in pypdf's
 * layout mode). Only the *Acta Summi Pontificis* parts are parsed -- one per pope heading
 * (*I – Acta Francisci Pp.*; *I - Acta Pii Pp. XII* and *IV - Acta Ioannis Pp. XXIII* in
 * 1958; three in 1978); the dicasterial, synodal, conclave and *Diarium* parts are skipped
 * and their headings recorded.
 *
 * Shapes honoured (each has a unit test on an excerpt):
 * - an entry spans lines until the line that ends in dot leaders (or two spaces) and a
 *   page number; a running header, always the first line of a page after the form feed,
 *   can interrupt it, and the layout mode of the volumes can glue a header to a line's end;
 * - the date is printed day-first from 2017 (`5 Dec. 2022`), year-first in 2010-2016
 *   (`2014 Dec. 20`) and in every volume (`1931 Maii 15`); `»` is a ditto mark inheriting
 *   the previous entry's value; in the volumes' three-column layout (ANNO MENSE DIE) a
 *   blank year or month inherits too, while a printed month with a blank day is an entry
 *   the index dates to the month only (`1917 Iul. Universalis Ecclesiae procuratio`;
 *   measured against the page images of 1909 and 1917), which is kept with a
 *   month-precision date and matched by incipit within the month (match.ts) but never
 *   created; a blank day under a blank month is the previous entry's day; the 2018
 *   index's `  Sept. » Chengden.:` (a month and no day, outside the columnar layout) is
 *   the same month-only shape;
 * - month spellings across the century (`Ian.`, `Febr.`, `Mart.`/`Martii`, `Apr.`/`April.`,
 *   `Maii`/`Mai.`, `Iun.`/`Iunii`, `Iul.`/`Iulii`, `Aug.`, `Sept.`, `Oct.`, `Nov.`, `Dec.`
 *   and the full forms), with or without the full stop; stray OCR punctuation between
 *   date tokens (`1978 Ian. - 3`, `» . » 8`, `», » »`) is dropped, an OCR word there
 *   (`» Iunii Jl 29`) is not repaired -- the line reads as month-only and is reported;
 * - the incipit is printed in guillemets (`« Chi è fedele ».`) or bare (`Ius nativum.`),
 *   ended by a full stop or a colon, in the volumes followed by ` - ` and the description
 *   (`Humani generis redemptionem. - Ad Patriarchas …`); the 1909 index prints an incipit
 *   only in guillemets after a genre word (`Constitutio « Promulgandi », de …`) and its
 *   other entries are descriptions, so a fixture can say `bareIncipits: false`;
 * - a constitution erecting a see prints a small-caps toponym (`VuCArien.:`, rendered in
 *   mixed case by the text layer) or, in the volumes, the toponym in capitals followed by
 *   the incipit: `SANTAREMENSIS (Obidensis). Cum sit. - Distractis …` (1958),
 *   `BOACENSIS. - Cum tempora. Detracta …` (1978), so both are read;
 * - the 1909 index opens with the column header (`ANNO MENSE DIE`, `PAG.`) and prints the
 *   table of contents of *Sapienti Consilio* inside its entry (`1.° Congregatio Sancti
 *   Officii`, `» » » CAP. IV. - De horis …`, `II. - TRIBUNALIA.`): those lines are
 *   sub-items, consumed and counted, never entries or category headings;
 * - a line-end hyphen breaks a word (`Sanc-` / `torum`), which pypdf renders with a space
 *   before the hyphen (`cele -`) or as a soft hyphen (U+00AD, the volumes);
 * - the volume is read from the title page (`Vol. CXV`, or 2015's OCR `vol. CvII`) when it
 *   prints one, and is otherwise given by the caller (the volume fixtures carry no title
 *   page); `part` (`I`/`II`) is the caller's, for the double volumes.
 *
 * The parse rate (spec §4) is measured per fixture: entries parsed against the lines of
 * the pope parts that end in a page number, with the lines consumed without an entry
 * counted; `parseRate` computes it from the `stats` the result carries.
 */
import { categoryForHeading, normaliseHeading } from './categories.js';
import { labelForBracket, popeForGenitive } from './popes.js';

export interface ActaEntry {
  series: 'AAS';
  volume: number;
  year: number;
  /** The part of a double volume (`I`/`II`, 1917 and 1983); absent otherwise. */
  part?: 'I' | 'II';
  page: number;
  /** The pope as the part heading names him, in the nominative: 'Franciscus', 'Pius XII'. */
  pope: string;
  /** The category heading, in normalised upper case ('LITTERAE APOSTOLICAE MOTU PROPRIO DATAE'). */
  category: string;
  /**
   * ISO date after ditto resolution -- `YYYY-MM-DD`, or `YYYY-MM` for an entry the index
   * dates to the month only (a printed month and a blank day, in the volumes' columnar
   * layout). A month-only entry is matched by incipit within the month and never created.
   */
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
  /** The toponym of a constitution, as extracted ('VuCArien.', 'SANTAREMENSIS (Obidensis)'); null otherwise. */
  toponym: string | null;
  /** The rest of the entry text, leaders and page removed. */
  description: string;
  /** The entry's lines exactly as extracted, joined by newlines, for the report. */
  raw: string;
}

export interface ActaParseStats {
  /** Lines of the pope parts (blank lines and headers excluded). */
  lines: number;
  /** Lines of the pope parts that end in a page number -- the denominator of the parse rate. */
  pageLines: number;
  /** The same, under a category heading the registry harvests (`yes` or `partly`), and the entries parsed there. */
  harvestedPageLines: number;
  harvestedEntries: number;
  /** Lines that opened an entry (a date was read). */
  dateLines: number;
  /** Entries parsed, with a page. */
  entries: number;
  /** Entries whose date is month-only (a printed month, no day). */
  monthOnly: number;
  /** Entries opened by a date line that never reached a page number (flushed as defects). */
  withoutPage: number;
  /** Sub-item lines consumed (the 1909 table of contents of *Sapienti Consilio*). */
  subItems: number;
  /** Lines of the pope parts consumed without producing an entry: sub-items, defects, subtitles. */
  consumed: number;
}

export interface ActaParseResult {
  volume: number;
  year: number;
  part?: 'I' | 'II';
  entries: ActaEntry[];
  /** Category headings (normalised) that categories.ts does not list, with the pope part. */
  unseenHeadings: string[];
  /** Pope part headings the popes table does not list (`ACTA LEONIS PP. XIII`), as printed. */
  unmappedPopes: string[];
  /** Headings of the parts skipped (dicasteries, synod, conclave, Diarium), in order. */
  skippedParts: string[];
  /** Lines and entries the parser could not read, each with the category it was under. */
  defects: { category: string; message: string }[];
  stats: ActaParseStats;
}

export interface ActaParseOptions {
  year?: number;
  /** The volume, for a fixture without a title page (the volume fixtures). Checked against the printed one when both exist. */
  volume?: number;
  part?: 'I' | 'II';
  /**
   * The volumes' three-column layout (ANNO MENSE DIE), where a blank year or month is a
   * ditto and a printed month with a blank day is a month-only date. Off for the index
   * PDFs, where every ditto is a printed `»` and a bare `12 …` line is a continuation.
   */
  columnar?: boolean;
  /**
   * Whether a bare head before the first full stop can be an incipit (`Ius nativum. De
   * …`). False for the 1909 index, which prints incipits only in guillemets after a genre
   * word and describes every other act without one (measured on the fixture: no entry of
   * AAS 1 prints a bare incipit), so that a short description is never read as one.
   */
  bareIncipits?: boolean;
}

const MONTHS: Record<string, number> = {
  ian: 1, ianuarii: 1, feb: 2, febr: 2, februarii: 2, mar: 3, mart: 3, martii: 3,
  apr: 4, april: 4, aprilis: 4, mai: 5, maii: 5, iun: 6, iunii: 6, iul: 7, iulii: 7,
  aug: 8, augusti: 8, sep: 9, sept: 9, septembris: 9, oct: 10, octobris: 10,
  nov: 11, novembris: 11, dec: 12, decembris: 12,
};
/**
 * The month a token names. The index PDFs print the abbreviations only (`Ian.` … `Dec.`,
 * `Maii`), and a full form there (`25 Novembris 2018`) is prose inside an entry; the
 * volumes print both (`Iunii`, `Martii`, `April.`).
 */
const ABBREVIATED_MONTH_RE = /^(Ian|Febr?|Mart?|Apr|Maii|Iun|Iul|Aug|Sept?|Oct|Nov|Dec)\.?$/;
const monthOf = (token: string, columnar: boolean): number | undefined => {
  if (!columnar) return ABBREVIATED_MONTH_RE.test(token) ? MONTHS[token.replace(/\.$/, '').toLowerCase()] : undefined;
  return /^[A-Za-z][a-z]{2,9}\.?$/.test(token) ? MONTHS[token.replace(/\.$/, '').toLowerCase()] : undefined;
};
const DITTO_RE = /^»[,.]?$/;
/** Stray OCR punctuation between date tokens (`1978 Ian. - 3`, `» . » 8`). */
const DATE_JUNK_RE = /^[-–—.,'^]$/;
const YEAR_TOKEN_RE = /^\d{4}\.?$/;
const DAY_TOKEN_RE = /^\d{1,2}$/;

/**
 * A running header: the first non-blank line of a page (`1468 Acta Apostolicæ Sedis –
 * Commentarium Officiale`, `Index documentorum chronologico ordine digestus 1469`, the
 * volumes' `836 Index documentorum` / `chronologico ordine digestus. 837`, or the bare
 * page number left when the OCR lost the words), and the phase-1 forms wherever they stand.
 */
const RUNNING_HEADER_RE =
  /^\s*(\d+\s+Acta Apostolic(?:ae|æ) Sedis\s*[–-]\s*Commentarium Officiale|Index documentorum chronologico ordine digestus\s+\d+)\s*$/;
const PAGE_TOP_HEADER_RE = /Index documentor|chronologico ordi\w*ne digest|^\s*[^\s\d]{0,2}\d{1,4}\s*$/;
/** A header the layout mode glued to the end of a line: `… Coloniensem,536   Index documentorum`. */
const GLUED_HEADER_RE = /(?<=\S)\s{3,}(?:\d{1,4}\s+)?(?:Index documentor.*|chronologico ordi\w*ne digest.*)$/;
/** A line of OCR noise: one or two characters that are neither capitals, digits nor ditto marks (`i`, `^`, `•`). */
const NOISE_LINE_RE = /^\s*[^\sA-Z0-9«»]{1,2}\s*$/;
/**
 * The default extraction mode runs several entries onto one physical line where the
 * OCR's line boxes overlap (AAS 23 p. 531; fetch-acta.sh falls back to that mode for
 * such a page): the page number is the only reliable terminator, and a line is split
 * after a page number that a date's tokens follow (`… « Kerum novarum ». . 177 » Iunii
 * Jl 29 Non abbiamo bisogno …`).
 */
const RUN_TOGETHER_RE = /((?:\s\.|\s•)*\s\d{1,4})\s+(?=(?:»[,.]?|\d{4})\s+(?:»[,.]?|[A-Z][a-z]{2,9}\.?)\s)/g;
/**
 * A line the layout mode interleaved from two entries: prose, a wide gap, prose (the
 * safety net behind fetch-acta.sh's fallback; the line and its entry are reported, and
 * no page is read from it).
 */
const INTERLEAVED_RE = /[A-Za-z]{2,},? [A-Za-z]{2,}[,.]? {12,}[A-Za-z]/;
/** The column header of the volumes: `ANNO MENSE DIE`, `MENSE I DIE`, `PAG.`, in any OCR spelling. */
const COLUMN_HEADER_RE = /^\s*(?:(?:ANNO|MENSE|DIE|DXE|D1E|PAG\.?|I|')\s*)+$/;
// The parts are numbered `II – `, `IV. – `, `I. — ` or (2018's Diarium) not at all.
const PART_HEADING_RE = /^\s*(?:[IVXL]+\.?\s*[–—-]\s*)?(ACTA\s+[A-Z].*|DIARIUM\s+[A-Z].*|CARDINALIUM COMMISSIO.*)$/;
/** `ACTA PII PP. X.`, `ACTA IOANNIS PAULI PP. II`, `ACTA BENEDICTI XVI`, `ACTA FRANCISCI PP.`: name words, optional `PP.`, optional numeral. */
const POPE_PART_RE = /^ACTA\s+([A-Z]+(?:\s+[A-Z]+)*?)(?:\s+PP\.?)?(?:\s+([IVXL]+))?\.?\s*$/;
/** The 1917 index numbers *Acta Sacri Consistorii* among the pope's categories; it is not a part. */
const CONSISTORY_CATEGORY_RE = /^ACTA\s+(?:SACRI\s+)?CONSISTORII/;
const HEADING_RE = /^\s*[IVXL]+\.?\s*[–—-]\s*[A-Z][A-Z .,'’():«»-]*$/;
const HEADING_CONTINUATION_RE = /^[A-Z][A-Z .,'’():-]*$/;
/** Dot leaders (once an ellipsis), or at least two spaces, then the page number ending the entry. */
const PAGE_END_RE = /(?:(?:\s*\.){2,}|\s*…|\s{2,})\s*(\d{1,4})[.,]?\s*$/;
/**
 * A full line leaves room for neither leaders nor a second space: `… Erbil (Iraquia) 82`,
 * and the volumes' layout mode prints the page after one space as often as not
 * (`riae Virginis Caelo receptae 449`). Accepted only on a line of at least 55 characters
 * whose next line begins something else (a date, a heading, the end), so a year closing
 * a continuation line is never read as a page; and never after another number, so an
 * OCR-split page (`76 4`) is reported rather than misread.
 */
const TIGHT_PAGE_END_RE = /^.{55,}[^\s\d] (\d{1,4})$/;
/**
 * The same in the volumes' layout mode, where a line's length says nothing (the text
 * column is indented) and the page follows one space as often as leaders: any line
 * ending in a word and a number below 1500 (no AAS volume reaches it; a year does),
 * still only when the next line opens something else.
 */
const COLUMNAR_PAGE_END_RE = /^.*[^\s\d] (\d{1,4})[.,]?$/;
const VOLUME_RE = /\(An\.\s*(\d{4})?\s*et\s*[Vv]ol\.\s*([CDILMVXcdilmvx]+)\)/;
/**
 * The table of contents of *Sapienti Consilio* the 1909 index prints inside the
 * constitution's entry: numbered offices (`1.° Congregatio Sancti Officii`), chapters and
 * articles of the *Lex propria* and the *Ordo servandus* (`CAP. IV. - De horis …`, `Art.
 * I. - Sacra Poenitentiaria`, `Sect. I. - Pro privatis`, `TIT. I. - SACRA ROMANA ROTA.`,
 * `PARS ALTERA. - Normae Peculiares.`, `APPENDIX`) -- sub-items of one act, not acts.
 */
const SUB_ITEM_RE = /^\s*(?:\d{1,2}\.\s*[°o]\s|\d{1,2}\.\s*-\s|CAP\.\s|Art\.\s|Sect\.\s|TIT\.\s|PARS\s|APPENDIX\b)/;
/**
 * The capitalised lines of that table of contents which the heading rule would otherwise
 * read as category headings, as the 1909 fixture prints them (normalised): the divisions
 * of the Curia and the titles of the *Lex propria* and the *Ordo servandus* (two of which
 * are acts of their own -- 29 June and 29 September 1908 -- listed in the index only as
 * sub-items of *Sapienti Consilio*, a finding of the sample report).
 */
export const NESTED_TOC_HEADINGS: ReadonlySet<string> = new Set([
  'TRIBUNALIA', 'OFFICIA', 'LEX PROPRIA', 'SACRAE ROMANAE ROTAE ET SIGNATURAE APOSTOLICAE',
  'SACRA ROMANA ROTA', 'SIGNATURA APOSTOLICA', 'DE ADVOCATIS PENES SACRAM ROTAM', 'ET APOSTOLICAM SIGNATURAM',
  'APPENDIX', 'DE TAXATIONE EXPENSARUM IUDICIALIUM', 'ORDO SERVANDUS',
  'IN SACRIS CONGREGATIONIS TRIBUNALIS OFFICIIS', 'ROMANAE CURIAE',
]);

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

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Join an entry's lines into one text: a line-end hyphen (pypdf prints `cele -` or
 * `Sanc-`; the volumes a soft hyphen, U+00AD) joins to a lower-case continuation without
 * the hyphen, and to an upper-case one with it (`Syro-` / `Malankarensium`); every other
 * break is a space. A soft hyphen inside a line is dropped.
 */
export function joinLines(lines: string[]): string {
  let out = '';
  for (const line of lines) {
    const t = line.trim().replace(/­$/, '-').replace(/­/g, '');
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

const ABBREVIATIONS = new Set(['card', 'rev', 'litt', 'cong', 'pont', 'sect', 'mons', 'prof', 'encycl', 'ven', 'em', 'emi', 'emum', 'emus', 'rmi', 'rmo']);

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
  if (h === '' || /[\d()]/.test(h) || !/^[A-Za-zÀ-ÿ]/.test(h) || /[a-z][A-Z]/.test(h)) return null;
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
 * The volumes' toponym in capitals at the head of a constitution's entry, with an optional
 * vernacular in parentheses, ended by a full stop (1958: `SANTAREMENSIS (Obidensis).`,
 * `CORUMBENSIS - REGISTRENSIS (Campi Grandis - Auratopolitanae).`, `S. PAULI DE
 * MINNESOTA (Novae Ulmae).`, `DE BRITANNIA.`) or by a full stop and a dash (1978:
 * `BOACENSIS. -`, `OLOMUCENSIS et Aliarum. -`, `S. MARIAE A PATROCINIO. -`). The head must
 * carry a run of at least four capitals, so an abbreviation (`S. `) or a caps sub-heading
 * of the 2015-2024 indexes never qualifies; the OCR's stray characters inside a word
 * (`B (IARENSIS`, `B.ABAULENSIS`) are kept as printed.
 */
const CAPS_TOPONYM_RE =
  /^((?:[A-ZÀ-ÝË][A-ZÀ-ÝË'’-]*|[-–]|\([^)]*\)|(?:et|de|in|Aliarum|aliarum)\b)(?:[ ,.]+(?:[A-ZÀ-ÝË][A-ZÀ-ÝË'’-]*|[-–]|\([^)]*\)|(?:et|de|in|Aliarum|aliarum)\b))*)\.,?\s*(?:[-–—]\s+)?(?=[A-Za-zÀ-ÿ«])/;

/**
 * Split an entry's text into incipit / toponym / description. The incipit is the text in
 * guillemets, or the bare text before the first full stop, colon or double space (`While
 * we walk  Ad Episcopos Nigeriae`) that ends a word rather than an abbreviation; a head
 * ended by a colon or full stop that `isToponym` is a toponym instead, as is the volumes'
 * caps toponym before an incipit. A ` - ` between incipit and description (the volumes'
 * convention, `Ius nativum. - De …`) is stripped with the full stop. Runs of spaces in
 * `text` are significant: `joinLines` keeps a double space as one.
 */
export function splitEntryText(text: string, opts: { bareIncipits?: boolean } = {}): Pick<ActaEntry, 'incipit' | 'quoted' | 'toponym' | 'description'> {
  const bare = opts.bareIncipits ?? true;
  const tidy = (s: string) => s.replace(/\s+/g, ' ').trim();
  const strip = (s: string) => tidy(s.replace(/^[\s.:,;–—-]+/, ''));
  // A genre word before the guillemets (1909: `Constitutio « Sapienti Consilio »`, `Litt.
  // encycl. « Communium rerum », de …`) is not part of the incipit; it stays in `raw`.
  // Only where the fixture prints no bare incipits: elsewhere a quoted phrase after prose
  // is a name inside a description (`Ad Praesidem « Mundialis Oeconomici Fori »`).
  const g = text.match(bare
    ? /^«\s*(.+?)\s*»(.*)$/s
    : /^(?:(?:Constitutio|Litt\.|Litterae|encycl\.|Epistola|Bulla|Decretum|Motu proprio)\s+){0,2}«\s*(.+?)\s*»(.*)$/s);
  if (g) return { incipit: tidy(g[1]!), quoted: true, toponym: null, description: strip(g[2]!) };

  // A toponym can be followed by the constitution's incipit in guillemets (the 2017
  // index: `DAnlIensIs. « Insita humanae naturae ». In Honduria …`, four entries) or bare
  // (the volumes: `SANTAREMENSIS (Obidensis). Cum sit. - Distractis …`); the incipit is then
  // read too, so the document mints from it rather than provisionally.
  const withToponym = (toponym: string, rest: string) => {
    const q = strip(rest).match(/^«\s*(.+?)\s*»(.*)$/s);
    if (q) return { incipit: tidy(q[1]!), quoted: true, toponym, description: strip(q[2]!) };
    // A bare incipit after the toponym is short (`Cum sit`, `Tutius ut consuleretur`);
    // a longer head is the description, which a full stop inside it must not split.
    const b = bare ? strip(rest).match(/^([^.:«»]{1,60}?)\.(\s.*|)$/s) : null;
    const incipit = b && b[1]!.trim().split(/\s+/).length <= 4 ? asIncipit(b[1]!) : null;
    return incipit !== null
      ? { incipit, quoted: false, toponym, description: strip(b![2]!) }
      : { incipit: null, quoted: false, toponym, description: strip(rest) };
  };
  const caps = text.match(CAPS_TOPONYM_RE);
  if (caps && /[A-ZÀ-ÝË]{4}/.test(caps[1]!) && !/^[A-Z]+$/.test(tidy(text))) {
    return withToponym(tidy(caps[1]!), text.slice(caps[0].length));
  }
  // The volumes' `Incipit. - Description` (1917-1978), where the description may itself
  // open with a toponym and a colon (1931: `Sollicitudo. - Goyasen.: de dioecesis …`).
  const dash = bare ? text.match(/^([^«»:]{1,60}?)\.\s*[-–—]\s+(.*)$/s) : null;
  const dashIncipit = dash && !isToponym(`${tidy(dash[1]!)}.`) ? asIncipit(dash[1]!) : null;
  if (dashIncipit !== null) return { incipit: dashIncipit, quoted: false, toponym: null, description: strip(dash![2]!) };
  const colon = text.match(/^([^:]{1,80}?)\s*:(\s.*|)$/s);
  if (colon && isToponym(tidy(colon[1]!))) return withToponym(tidy(colon[1]!), colon[2]!);
  const dot = text.match(/^(\S{1,40}?)\.(\s.*|)$/s);
  if (dot && isToponym(dot[1]!)) return withToponym(`${dot[1]}.`, dot[2]!);
  if (!bare) return { incipit: null, quoted: false, toponym: null, description: tidy(text) };
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

interface DateState { day: number | null; month: number; year: number }

/** A date line read: the resolved date (day null for a month-only entry), and the text after the date tokens. */
interface DateLine {
  date: DateState | null;
  /** Why the date did not resolve: a ditto with nothing to inherit, a day out of range. */
  unreadable?: string;
  text: string;
}

type DateToken = { kind: 'ditto' } | { kind: 'year'; n: number } | { kind: 'month'; n: number } | { kind: 'day'; n: number };

/**
 * Read the date tokens at the head of a line, tolerant of the layout mode's spacing and
 * of stray punctuation between them; null when the line opens no entry.
 */
function readDateLine(line: string, prev: DateState | null, columnar: boolean): DateLine | null {
  const tokens = line.trim().split(/\s+/);
  // OCR punctuation stuck to the first token (`.1978 Sept. 3`).
  if (columnar && tokens[0] !== undefined) tokens[0] = tokens[0].replace(/^[.,'^]+(?=\d)/, '');
  const seq: DateToken[] = [];
  let i = 0;
  const seen = new Set<string>();
  // The index PDFs print exactly three tokens; the columnar volumes any subset.
  const limit = columnar ? Infinity : 3;
  for (; i < tokens.length && seq.length < limit; i++) {
    const t = tokens[i]!;
    if (DITTO_RE.test(t)) { seq.push({ kind: 'ditto' }); continue; }
    if (DATE_JUNK_RE.test(t) && seq.length > 0) continue;
    // An OCR-misread day in the columnar layout (`» Maii la Deus scientiarum`, `Aug. ii
    // Indulgentiae`, `» Iunii Jl 29 Non abbiamo`): a token of one or two letters after a
    // month where a day stands, followed by a day or by capitalised text, is noise -- the
    // day is unreadable (month-only) unless a day token follows it.
    if (columnar && seq.length > 0 && seq[seq.length - 1]!.kind !== 'day' && !seen.has('day')
      && /^(?:[a-z]{1,2}|[A-Z][a-z])$/.test(t) && i + 1 < tokens.length
      && (DAY_TOKEN_RE.test(tokens[i + 1]!) || (/^[a-z]{1,2}$/.test(t) && /^[A-Z«]/.test(tokens[i + 1]!)))) {
      continue;
    }
    let tok: DateToken | null = null;
    if (YEAR_TOKEN_RE.test(t)) tok = { kind: 'year', n: Number(t.replace(/\.$/, '')) };
    else if (DAY_TOKEN_RE.test(t)) tok = { kind: 'day', n: Number(t) };
    else {
      const m = monthOf(t, columnar);
      if (m !== undefined) tok = { kind: 'month', n: m };
    }
    if (tok === null || seen.has(tok.kind)) break;
    seen.add(tok.kind);
    seq.push(tok);
  }
  if (seq.length === 0) return null;
  // The text is what follows the consumed tokens, spacing kept (a double space matters).
  let rest = line.replace(/^\s+/, '');
  for (let k = 0; k < i; k++) rest = rest.replace(/^\S+\s*/, '');
  const text = rest;

  if (!columnar) {
    // The index PDFs: three positional tokens, day-first (`5 Dec. 2022`, `30 Sep. »`,
    // `» » »`) or year-first (`2014 Dec. 20`, `» » 22`), the layout read off each line
    // from where the four-digit and the one-or-two-digit number stand; or a month with a
    // year or a ditto and no day (`Sept. » Chengden.:`), which is month-only.
    const at = (k: number) => seq[k];
    if (seq.length === 2 && at(0)!.kind === 'month' && (at(1)!.kind === 'year' || at(1)!.kind === 'ditto')) {
      const year = at(1)!.kind === 'year' ? (at(1) as { n: number }).n : prev?.year;
      if (year === undefined) return { date: null, unreadable: 'a ditto with nothing to inherit', text };
      return { date: { day: null, month: (at(0) as { n: number }).n, year }, text };
    }
    if (seq.length !== 3) return null;
    const yearFirst = at(0)!.kind === 'year' || at(2)!.kind === 'day';
    const [yTok, mTok, dTok] = yearFirst ? [at(0)!, at(1)!, at(2)!] : [at(2)!, at(1)!, at(0)!];
    if ((yTok.kind !== 'year' && yTok.kind !== 'ditto') || (mTok.kind !== 'month' && mTok.kind !== 'ditto')
      || (dTok.kind !== 'day' && dTok.kind !== 'ditto')) return null;
    const year = yTok.kind === 'year' ? yTok.n : prev?.year;
    const month = mTok.kind === 'month' ? mTok.n : prev?.month;
    const day = dTok.kind === 'day' ? dTok.n : prev?.day;
    if (year === undefined || month === undefined || day === undefined) {
      return { date: null, unreadable: 'a ditto with nothing to inherit', text };
    }
    if (day === null) return { date: null, unreadable: 'a ditto day after a month-only entry', text };
    if (day < 1 || day > 31 || year < 1900) return { date: null, unreadable: 'out of range', text };
    return { date: { day, month, year }, text };
  }

  // The columnar layout: typed tokens stand for themselves; a `»` stands for the next
  // missing column in ANNO MENSE DIE order; a blank year or month inherits; a blank day
  // inherits only under a blank month, and is otherwise the month-only shape.
  const typed = { year: seq.find((t) => t.kind === 'year'), month: seq.find((t) => t.kind === 'month'), day: seq.find((t) => t.kind === 'day') };
  const opensText = /^[A-Za-zÀ-ÿ«"'(\[]/.test(text.trim());
  // A bare number and text is an entry (`11 Regia primitiva …`); a bare number alone (a
  // page number the layout set on a line of its own), or a date followed by nothing
  // that reads as text, is not a date line.
  if (!opensText) return null;
  let dittos = seq.filter((t) => t.kind === 'ditto').length;
  const take = (have: DateToken | undefined): 'typed' | 'ditto' | 'blank' => {
    if (have) return 'typed';
    if (dittos > 0) { dittos--; return 'ditto'; }
    return 'blank';
  };
  const yHow = take(typed.year);
  const mHow = take(typed.month);
  const dHow = take(typed.day);
  const year = yHow === 'typed' ? (typed.year as { n: number }).n : prev?.year;
  const month = mHow === 'typed' ? (typed.month as { n: number }).n : prev?.month;
  if (year === undefined || month === undefined) return { date: null, unreadable: 'nothing to inherit', text };
  let day: number | null;
  if (dHow === 'typed') day = (typed.day as { n: number }).n;
  else if (dHow === 'ditto') {
    if (prev === null) return { date: null, unreadable: 'a ditto with nothing to inherit', text };
    day = prev.day;
  } else day = mHow === 'blank' ? (prev?.day ?? null) : null;
  if (year < 1900) return { date: null, unreadable: 'out of range', text };
  // An OCR-misread day (`» Mai. 80`): the month is read, the day is not -- the entry is
  // month-only and reported, and the ditto chain after it keeps the month.
  if (day !== null && (day < 1 || day > 31)) return { date: { day: null, month, year }, unreadable: `day ${day} out of range, read as month-only`, text };
  return { date: { day, month, year }, text };
}

/** The bracketed date (and pope) of an earlier act before its incipit, in the index PDFs. */
const BRACKET_RE =
  /^\[(?:([A-Za-z]+(?: PP\.)?(?: [IVXL]+)?):\s*)?(?:(\d{4})\s+([A-Z][a-z]{2,3})\.?\s+(\d{1,2})|(\d{1,2})\s+([A-Z][a-z]{2,3})\.?\s+(\d{4}))\]\s*/;

const isoOf = (d: DateState): string => d.day === null ? `${d.year}-${pad(d.month)}` : `${d.year}-${pad(d.month)}-${pad(d.day)}`;

export function parseActaIndex(text: string, opts: ActaParseOptions = {}): ActaParseResult {
  const vol = text.match(VOLUME_RE);
  if (!vol && opts.volume === undefined) throw new Error('No "(An. YYYY et Vol. ...)" heading found in the index text and no volume given');
  const printedVolume = vol ? romanToInt(vol[2]!) : undefined;
  if (printedVolume !== undefined && opts.volume !== undefined && printedVolume !== opts.volume) {
    throw new Error(`The index prints Vol. ${printedVolume} but the fixture is for volume ${opts.volume}`);
  }
  const volume = opts.volume ?? printedVolume!;
  const printedYear = vol?.[1] ? Number(vol[1]) : undefined;
  const year = opts.year ?? printedYear ?? volume + 1908;
  if (printedYear !== undefined && printedYear !== year) {
    throw new Error(`The index prints An. ${printedYear} but the fixture is for ${year}`);
  }
  const columnar = opts.columnar ?? false;
  const bareIncipits = opts.bareIncipits ?? true;

  // Lines of the whole text, with every running header dropped: a header is always the
  // first line of a page (after the form feed), and pypdf may glue the previous page's
  // last line to it, so the split is on the form feed first. The layout mode can also
  // glue a header to the end of a line, which is cut off.
  const lines: string[] = [];
  const pageOf: number[] = [];
  text.split('\f').forEach((page, p) => {
    let first = true;
    for (const raw of page.split('\n')) {
      let line = raw.replace(/\s+$/, '');
      if (line.trim() !== '' && first) {
        first = false;
        if (PAGE_TOP_HEADER_RE.test(line)) continue;
      }
      if (RUNNING_HEADER_RE.test(line) || COLUMN_HEADER_RE.test(line) || NOISE_LINE_RE.test(line)) continue;
      line = line.replace(GLUED_HEADER_RE, '');
      for (const piece of columnar ? line.replace(RUN_TOGETHER_RE, '$1\n').split('\n') : [line]) {
        lines.push(piece);
        pageOf.push(p);
      }
    }
  });
  // The columnar layout can leave all three date columns blank -- the entry inherits
  // the whole date -- and such an entry's first line differs from a continuation line
  // only by its column: the text of an entry starts where the text of the page's dated
  // entries starts, a continuation is indented further. The entry column is measured
  // per page (the layout mode's scale differs from page to page) as the median of the
  // dated entries' text columns, so a line the OCR set apart (1909's `1908 Ian. 29
  // Constitutio « Sapienti Consilio »`, at a column of its own) does not skew it.
  const entryColOf = new Map<number, number>();
  if (columnar) {
    const cols = new Map<number, number[]>();
    lines.forEach((line, i) => {
      const d = readDateLine(line, { day: 1, month: 1, year: 1900 }, true);
      if (!d || d.text.trim() === '') return;
      const p = pageOf[i]!;
      cols.set(p, [...(cols.get(p) ?? []), line.length - d.text.trimStart().length]);
    });
    for (const [p, cs] of cols) {
      const sorted = [...cs].sort((a, b) => a - b);
      entryColOf.set(p, sorted[Math.floor(sorted.length / 2)]!);
    }
  }
  const atEntryColumn = (i: number): boolean => {
    const col = entryColOf.get(pageOf[i]!);
    const line = lines[i]!;
    return col !== undefined && line.length - line.trimStart().length <= col + 2;
  };
  const start = lines.findIndex((l) => /^\s*CHRONOLOGICO ORDINE DIGESTUS\s*$/.test(l));
  if (start < 0) throw new Error('No "CHRONOLOGICO ORDINE DIGESTUS" heading found');
  const end = lines.findIndex((l, i) => i > start && /^\s*(INDICES NOMINUM|I – INDEX NOMINUM|INDEX NOMINUM PERSONARUM|INDEX ANALYTICUS|INDEX RERUM|INDEX ALPHABETICUS)/.test(l));

  const stats: ActaParseStats = { lines: 0, pageLines: 0, harvestedPageLines: 0, harvestedEntries: 0, dateLines: 0, entries: 0, monthOnly: 0, withoutPage: 0, subItems: 0, consumed: 0 };
  const result: ActaParseResult = {
    volume, year, ...(opts.part ? { part: opts.part } : {}),
    entries: [], unseenHeadings: [], unmappedPopes: [], skippedParts: [], defects: [], stats,
  };
  let pope: string | null = null;
  let category: string | null = null;
  let headingLines: string[] = [];     // the raw lines of the current category heading
  let headingOpen = false;             // the previous line was a category heading (continuations attach)
  let prev: DateState | null = null;
  // `date` carries a month-only value for an entry whose day is not printed.
  let open: { lines: string[]; text: string; date: string; category: string; pope: string } | null = null;
  const unseen = new Set<string>();
  const unmapped = new Set<string>();

  const defect = (cat: string | null, message: string) =>
    result.defects.push({ category: cat ?? '(none)', message });
  const flushDefect = () => {
    if (!open) return;
    stats.withoutPage++;
    stats.consumed += open.lines.length;
    defect(open.category, `entry without a page number: ${open.lines.map((l) => l.trim()).join(' / ')}`);
    open = null;
  };
  const isHeading = (l: string) => HEADING_RE.test(l) && readDateLine(l, null, columnar) === null;
  const isDateLine = (l: string) => readDateLine(l, prev ?? { day: 1, month: 1, year: 1900 }, columnar) !== null;

  for (let i = start + 1; i < (end < 0 ? lines.length : end); i++) {
    const line = lines[i]!;
    if (line.trim() === '') continue;

    const part = line.match(PART_HEADING_RE);
    if (part && !CONSISTORY_CATEGORY_RE.test(part[1]!.replace(/\s+/g, ' ').trim())) {
      flushDefect();
      const heading = part[1]!.replace(/\s+/g, ' ').trim();
      const m = heading.match(POPE_PART_RE);
      const known = m ? popeForGenitive(`${m[1]} ${m[2] ?? ''}`) : null;
      if (known) {
        pope = known.pope;
      } else if (m && /^[A-Z]+$/.test(m[1]!) && m[2] !== undefined) {
        // A pope's part the table does not list (`ACTA LEONIS PP. XIII`): parsed under
        // the genitive as printed, so the report can count what it carries.
        pope = `${m[1]} ${m[2]}`;
        unmapped.add(heading);
      } else {
        pope = null;
        result.skippedParts.push(line.replace(/\s+/g, ' ').trim());
      }
      category = null;
      headingOpen = false;
      prev = null;
      continue;
    }

    if (pope === null) continue;   // inside a skipped part
    stats.lines++;
    const tightEnd = line.match(columnar ? COLUMNAR_PAGE_END_RE : TIGHT_PAGE_END_RE);
    const harvestedHere = category !== null && (categoryForHeading(category)?.harvested ?? 'no') !== 'no';
    if (PAGE_END_RE.test(line) || (tightEnd && Number(tightEnd[1]) < 1500)) {
      stats.pageLines++;
      if (harvestedHere) stats.harvestedPageLines++;
    }

    // The 1909 table of contents inside *Sapienti Consilio*: a capitalised division title
    // listed above, or a numbered office, chapter or article, with or without ditto marks
    // before it. Consumed and counted; the ditto state still advances on a dated one.
    let dated = readDateLine(line, prev, columnar);
    // A blank-dated entry of the columnar layout (see `atEntryColumn`): capitalised, at
    // the entry column, and only where a date has been read before on this part.
    // (`prev` is read through a local: the control-flow analysis narrows it to null
    // otherwise, since the closures above assign it.)
    const inherited = (): DateState | null => prev;
    const inheritedDate = inherited();
    if (dated === null && columnar && inheritedDate !== null && atEntryColumn(i) && /^[A-Z«]/.test(line.trim())
      && !HEADING_CONTINUATION_RE.test(line.trim())) {
      dated = { date: { day: inheritedDate.day, month: inheritedDate.month, year: inheritedDate.year }, text: line.trimStart() };
    }
    const body = dated ? dated.text : line;
    if (NESTED_TOC_HEADINGS.has(normaliseHeading(line)) || SUB_ITEM_RE.test(body)) {
      flushDefect();
      stats.subItems++;
      stats.consumed++;
      if (dated?.date) prev = dated.date;
      continue;
    }

    if (isHeading(line)) {
      flushDefect();
      headingLines = [line];
      category = normaliseHeading(line);
      headingOpen = true;
      continue;
    }
    // An all-capitals line between entries is a heading too: the second line of a
    // two-line heading when one has just opened (`VISITATIONES, PEREGRINATIONES, ITINERA`;
    // 1917's `ADHORTATIO` / `AD POPULORUM BELLIGERANTIUM MODERATORES`), otherwise a heading
    // printed without a roman numeral (the 2020 *Litterae Apostolicae* of Benedict XVI's
    // part). Inside an entry such a line is a continuation (`CRU)`). A second line that
    // makes a known heading unknown is a subtitle (1917's `LITTERAE ENCYCLICAE` / `DE
    // PRAEDICATIONE DIVINI VERBI.`), consumed.
    if (open === null && HEADING_CONTINUATION_RE.test(line.trim()) && /[A-Z]{3}/.test(line)) {
      if (headingOpen) {
        const joined = normaliseHeading([...headingLines, line].join(' '));
        if (categoryForHeading(joined) !== null || categoryForHeading(category!) === null) {
          headingLines = [...headingLines, line];
          category = joined;
        } else {
          stats.consumed++;
        }
      } else {
        headingLines = [line];
        category = normaliseHeading(line);
      }
      headingOpen = true;
      continue;
    }
    headingOpen = false;
    if (category === null) {
      stats.consumed++;
      defect(null, `${pope}: line before any category heading: ${line.trim()}`);
      continue;
    }

    // The layout mode repeats the date at the top of a page where an entry runs on from
    // the previous one (`» Dec. 16 URAWAËNSIS. Qui superna Dei. - … Urawaën-` / `1957
    // Dec. 16 sis, in Iaponia …`): a date line that opens in lower case with the open
    // entry's own date is its continuation.
    const continues = dated !== null && open !== null && dated.date !== null && columnar
      && isoOf(dated.date) === open.date && /^[a-z]/.test(dated.text.trim());
    if (columnar && INTERLEAVED_RE.test(line)) {
      // The layout mode interleaved two entries here: nothing on the line is trusted.
      flushDefect();
      stats.consumed++;
      defect(category, `interleaved line (two entries' words on one line): ${line.trim()}`);
      if (dated?.date) prev = dated.date;
      continue;
    }
    if (columnar && open !== null && /^\s*\d{1,4}\s*$/.test(line) && Number(line) < 1500) {
      // The page number alone on a line (the layout mode set it a line below its entry).
      open.lines.push(line);
    } else if (dated && !continues) {
      flushDefect();
      if (dated.date === null) {
        stats.consumed++;
        defect(category, `unreadable date (${dated.unreadable}): ${line.trim()}`);
        prev = null;
        continue;
      }
      if (dated.unreadable) defect(category, `${dated.unreadable}: ${line.trim()}`);
      stats.dateLines++;
      prev = dated.date;
      open = { lines: [line], text: dated.text, category, pope, date: isoOf(dated.date) };
    } else if (open === null) {
      stats.consumed++;
      defect(category, `line outside any entry: ${line.trim()}`);
      continue;
    } else {
      // A continuation; a repeated date at a page top is dropped from the text.
      open.lines.push(continues ? line.replace(/^\s*\S+(\s+\S+){2}\s*/, ' '.repeat(30)) : line);
    }

    // Does the entry end on this line?
    const last = open.lines[open.lines.length - 1]!;
    let pageMatch = last.match(PAGE_END_RE);
    let pageTail = pageMatch?.[0].length ?? 0;
    if (!pageMatch) {
      const tight = last.match(columnar ? COLUMNAR_PAGE_END_RE : TIGHT_PAGE_END_RE);
      const next = lines.slice(i + 1).find((l) => l.trim() !== '') ?? '';
      const nextOpens = next === '' || isDateLine(next) || HEADING_RE.test(next)
        || PART_HEADING_RE.test(next) || HEADING_CONTINUATION_RE.test(next.trim())
        || SUB_ITEM_RE.test(next) || NESTED_TOC_HEADINGS.has(normaliseHeading(next));
      if (tight && nextOpens && Number(tight[1]) < 1500) { pageMatch = tight; pageTail = tight[0].length - tight[0].search(/ \d{1,4}[.,]?$/); }
    }
    if (!pageMatch) {
      if (open.lines.length > 8) flushDefect();
      continue;
    }
    // A page number with a leading zero is an OCR misreading (`030` for 930, AAS 50 p.
    // 1035): the entry is reported without a page rather than cited at a wrong one.
    if (/^0/.test(pageMatch[1]!)) { flushDefect(); continue; }
    const page = Number(pageMatch[1]);
    const bodyLines = open.lines.map((l, k) => (k === 0 ? open!.text : l));
    bodyLines[bodyLines.length - 1] = bodyLines[bodyLines.length - 1]!.slice(0, -pageTail);
    // A lone leader dot left before a double-space page (`sui iuris   .  484`) is not text.
    // The double space is a separator only in the index PDFs' typography; the layout
    // mode's runs of spaces are positional and mean nothing.
    let entryText = joinLines(bodyLines).replace(/(\s\.)+$/, '');
    if (columnar) entryText = entryText.replace(/\s{2,}/g, ' ');
    let entryDate = open.date;
    let entryPope = open.pope;
    // An act of an earlier pontificate printed in this volume carries its own date, and
    // sometimes its pope, in brackets before the incipit: `11 Maii 2018 [2010 Sept. 19]
    // « Admodum fideli »`, `[Benedictus XVI: 2010 Apr. 25]` (2018), `[Benedictus PP. XVI:
    // 6 Iun. 2010]` (2020, 2021 -- day-first, and with the `PP.`). The bracketed date is
    // the act's date; the printed one stays in `raw`. A bracket that names no pope leaves
    // the entry under the part's pope, and the creator holds it by its date (create.ts).
    const bracket = entryText.match(BRACKET_RE);
    if (bracket) {
      const [yTok, mTok, dTok] = bracket[2] !== undefined
        ? [bracket[2], bracket[3]!, bracket[4]!] : [bracket[7]!, bracket[6]!, bracket[5]!];
      const month = monthOf(mTok, false);
      if (month !== undefined) {
        entryDate = `${yTok}-${pad(month)}-${pad(Number(dTok))}`;
        if (bracket[1]) entryPope = labelForBracket(bracket[1]);
        entryText = entryText.slice(bracket[0].length);
      }
    }
    if (categoryForHeading(open.category) === null) unseen.add(`${open.pope}: ${open.category}`);
    if (entryDate.length === 7) stats.monthOnly++;
    stats.entries++;
    if ((categoryForHeading(open.category)?.harvested ?? 'no') !== 'no') stats.harvestedEntries++;
    result.entries.push({
      series: 'AAS', volume, year, ...(opts.part ? { part: opts.part } : {}), page,
      pope: entryPope, category: open.category, date: entryDate,
      ...splitEntryText(entryText, { bareIncipits }),
      raw: open.lines.map((l) => l.replace(/\s+$/, '')).join('\n'),
    });
    open = null;
  }
  flushDefect();
  result.unseenHeadings = [...unseen];
  result.unmappedPopes = [...unmapped];
  return result;
}

/**
 * The parse rate of a fixture (acta volumes spec §4): entries parsed over the lines of
 * the pope parts that end in a page number. Where a scan crops the page column (AAS 1,
 * 1909), the denominator is small and the rate says little; the report prints the
 * entries opened without a page beside it.
 */
export function parseRate(stats: ActaParseStats): number | null {
  return stats.pageLines === 0 ? null : stats.entries / stats.pageLines;
}

/** The parse rate over the harvested categories alone: what the join can act on. */
export function harvestedParseRate(stats: ActaParseStats): number | null {
  return stats.harvestedPageLines === 0 ? null : stats.harvestedEntries / stats.harvestedPageLines;
}
