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
 * The volumes of 1932-1957 (AAS 24-49, phase 2b-ii-a; acta volumes spec §9) added, each
 * measured on a named volume and unit-tested on its excerpt:
 * - the pope heading in the OCR's spellings (`1 - ACTA PII PP. XII`, `ACTA Pii PP. XII`,
 *   `PP. Xll`), normalised before the popes-table lookup and recorded as printed
 *   (`popeHeadings`); a category numeral read `IY.`, `XJV`, `i.`, `1`, `I r-`, `XI •-`; a
 *   known heading in mixed case (`XIV - Sacra Consistoria`); the column header as `PAO.`,
 *   `PAS.`, `PAß.`, `PA6.`, `PAe`, `FAS`, `PV(J.`; an act printed before the first category
 *   heading (1933's bull of indiction), reported, its date feeding the ditto chain;
 * - the ditto as `»>`, `>>`, `))`, `.)`, `y>`, `«` (only where a date token follows) or a lone
 *   letter (`» h 3`, `» D »`); junk stuck to a token (`.16`, `20\`, `.Martii`, `Nov,.`,
 *   `1947 Oct. ; 20`); a doubled token (`» Apr. Apr. 1`); the OCR months of OCR_MONTHS,
 *   admitted only where a day follows, and any other word there an unreadable month that
 *   the dittos after it inherit as unreadable until one is printed; a year no volume can
 *   print (`1047`, `3950`, `1963`), read as the one year of the volume's span a digit off
 *   and noted on the entry and its dittos (`dateNote`, `dateNoteRef`), a year the volume
 *   could print (`1919` for 1948 and 1949 alike) never repaired; a year the index does not
 *   print -- a ditto in the year column with nothing above it, a broken token (`19 IS`,
 *   `19Ö4`, `1ÍS50`), an impossible year no repair fits (`3918`) -- dates the entry
 *   `????-MM-DD`, inherited by the dittos after it, for a curated correction to supply;
 * - a date the layout mode set beside the last line of the entry before, given to the
 *   blank-dated entry after it; a blank-dated entry at the page's hanging indent, shaped
 *   as an entry opens, and a continuation line at the entry column that is not, on a page
 *   whose entries open `Incipit. - …`; a blank-dated entry dated by its own description
 *   (`… datus, die 16 mensis Aprilis, anno 1939`);
 * - a page glued to a leader dot (`.154`) or followed by junk (`47'`, `226 ,`), an entry of
 *   up to twenty lines, the translations listed under an act consumed as sub-items outside
 *   the parse rate (TRANSLATION_RE), a header's page number fused to a word cut off;
 * - the incipit's dash without its spaces (`Quae rei sacrae.-Fines`), a comma for the full
 *   stop, a bullet before the dash (`•-`), a stray mark before the incipit (`.Mirabilis`); a
 *   mixed-case see with its vernacular in parentheses (`De Sienhsien (De Kinghsien). -`),
 *   a see and an incipit both ended by a full stop (`Riopretensis. Decessor Noster. -`),
 *   a see-shaped head under the constitutions (`Kaying. -`, `Urbis. -`) and, under the
 *   letters, a diocese the index enters an act under (`Passaviensis dioecesis. -`); the
 *   addressee of a letter entered without an incipit (`Ad Emum P. D. …`) never an incipit.
 *
 * The volumes of 1959-1977 (AAS 51-69, phase 2b-ii-b) added, each measured on a named volume
 * and unit-tested on its excerpt:
 * - a page in pypdf's default mode (fetch-acta.sh falls back to it where the layout mode
 *   fuses lines, most pages of AAS 52, 54-58, 60 and 68): every line at the margin, so the
 *   page is *flat* -- no blank-dated entry is looked for on it -- and the index's title,
 *   which that mode renders after the first page's entries, is skipped wherever it stands;
 *   a volume fixture is read from its first line, since it is the index's pages;
 * - the pope heading with a full stop after the word (`I - ACTA. PAULI PP. VI`, AAS 67) or
 *   with digits in the name (`II - ACTA I0A1OTS PP. XXIII`, AAS 51: an OCR genitive listed
 *   in popes.ts); the synod's part numbered without the word (`II - SYNODUS EPISCOPORUM`, AAS 69);
 * - headings unnumbered and in mixed case (`Litterae Encyclicae`, `Litterae Apostolicae`,
 *   AAS 59, 1967), read as headings only where the words are a known category; the column
 *   header glued to a heading (`XIV - NUNTII SCRIPTO DATI PAG.`, AAS 51, 66); an OCR `^`
 *   after a heading's second line (AAS 52); the numeral as `XI- -` (AAS 66);
 * - the ditto as `%` (AAS 52), `->` (AAS 53), `Ä` (AAS 58); the months `Maü`, `Dee`, `Mail`,
 *   `Eebr`, `lui` (OCR_MONTHS); a year with its last digit broken (`196S`, AAS 55), `????`;
 * - the page number alone on its line where the default mode lost the entry's other lines
 *   (AAS 58), read as the page unless the line before already ends in one (AAS 48); a page
 *   with a quote before it (`'563`, AAS 58).
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
  /**
   * A reading the parser took of the date beyond what the line prints -- an OCR digit
   * of the year repaired (`1047` for 1947), a ditto year with nothing before it read as
   * the volume year -- reported beside the entry; the creator never mints from it.
   */
  dateNote?: string;
  /** For a note inherited by ditto: the curation key (`year:page`) of the entry whose line carried the misread token, so one curated confirmation of that entry confirms the chain. */
  dateNoteRef?: string;
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
  /** Sub-item lines consumed (the 1909 table of contents of *Sapienti Consilio*; the translations the volumes of 1939-1957 list under an act). */
  subItems: number;
  /** Of the sub-items, the translation lines (`E textu latino versio anglica 645`): the act again in another language, outside the parse rate's denominator. */
  translations: number;
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
  /** Every pope part heading as printed, in order (`1 - ACTA PII PP. XII`, `I - ACTA Pii PP. XII`): the report lists the OCR variants. */
  popeHeadings: string[];
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
/**
 * The OCR's misreadings of a month in the volumes' month column, each measured on the
 * volumes of 1932-1957 and unambiguous: no other Latin month shares the letters. `Man` /
 * `Mah` for *Maii* (AAS 25 (1933) 516 `1932 Man 2 Apostolica Sedes`, whose constitution
 * is dated *die secunda mensis Maii* at AAS 25 p. 28; AAS 25 p. 520 `» Mah 1 Singulari
 * quodam`; AAS 27 (1935) `1934 Man .1 Clarissima Agrigentina civitas`), `Marth` for
 * *Martii* (AAS 25), `Innii` for *Iunii* (AAS 34, 1942), `Apri` / `Âpr` for *Apr.* (AAS
 * 42, 1950), `Ott` for *Oct.* (AAS 45, 1953), `Noy` / `NOY` / `NOV` / `NOT` / `ÏTov` for
 * *Nov.* (AAS 24, 26, 33, 35, 41), `Oet` for *Oct.* (AAS 47 (1955) 867, `19Ö4 Oet. 7 Ad
 * Sinarum gentem`, the encyclical of 7 October 1954), `Doc` / `Deo` for *Dec.* (AAS 28 (1936) `1935 Doc. 26
 * Ad catholici sacerdotii`, the encyclical of 20 December 1935 -- the day too is the OCR's;
 * AAS 46 (1954) `1953 Deo. 14 Decretum`). A misreading not listed here is an unreadable
 * month, reported, never inherited from the entry before (readDateLine).
 */
const OCR_MONTHS: Record<string, number> = {
  Man: 5, Mah: 5, Marth: 3, Innii: 6, Apri: 4, Âpr: 4, Ott: 10, Oet: 10, Noy: 11, NOY: 11, NOV: 11, NOT: 11, ÏTov: 11, Doc: 12,
  // The volumes of 1959-1977 (AAS 51-69, phase 2b-ii-b): `Maü` for *Maii* (AAS 54 (1962)
  // 894, `1961 Maü 5 URBIS. Inter frequentissima`), `Mail` for *Maii* (AAS 66 (1974) 762,
  // `» Mail 11 Mira eademque`), `Dee` for *Dec.* (AAS 66 (1974) 762, `1973 Dee. 13 Quod
  // pastorale`, the letter of 13 December 1973 erecting the delegation in Chad), `Eebr`
  // for *Febr.* (AAS 55 (1963) 1077, `Eebr. 9 Ad praelatos … Tribunalis Sacrae Romanae
  // Rotae`), `lui` for *Iul.* (AAS 61 (1969) 840, `» lui. 26 Fidelium Hispanorum`).
  Maü: 5, Mail: 5, Dee: 12, Eebr: 2, lui: 7,
};
/**
 * The month a token names: a Latin month in any of the century's spellings, case-folded
 * (`ian.`, AAS 40), or -- only where `dayFollows`, so that a word opening a continuation
 * line (`Deo dicatum 14`, `Man …`) is never a month -- one of the OCR misreadings above.
 */
const monthOf = (token: string, columnar: boolean, dayFollows = false): number | undefined => {
  if (!columnar) return ABBREVIATED_MONTH_RE.test(token) ? MONTHS[token.replace(/\.$/, '').toLowerCase()] : undefined;
  if (!/^[A-Za-zÂÏ][a-zü]{1,9}\.?$/i.test(token)) return undefined;
  const bare = token.replace(/\.$/, '');
  return MONTHS[bare.toLowerCase()] ?? (dayFollows ? OCR_MONTHS[bare] : undefined);
};
const DITTO_RE = /^»[,.]?$/;
/**
 * The volumes' OCR renders a `»` as `»>`, `>>`, `))`, `.)`, `j>`, `f>`, `•»`, `«`, or as a
 * lone letter (`h`, `s`, `i`, `D`) where the ditto stands (AAS 24-49, measured in
 * readDateLine's comment): after the junk characters are stripped from a token, one of
 * these in a date column is a ditto. A lone letter is one only where a date token has
 * already been read on the line and a day or a capitalised word follows.
 */
const COLUMNAR_DITTO_RE = /^[a-z]?[»>)]{1,2}$/;
/** `«` for `»` (AAS 43 (1951) `» « 11 Africa Meridionalis`), `%` for `»` (AAS 52 (1960) 1033, `% » » PORTUS MORESBY`): a ditto only where a date token follows (readDateLine). */
const COLUMNAR_DITTO_INNER_RE = /^[«%]$/;
/** A lone letter where a ditto stands (`» h 3`, `» D »`; `Ä » 20`, AAS 58 (1966) 1207). */
const COLUMNAR_DITTO_LETTER_RE = /^[a-zA-ZÀ-ÿ]$/;
/** Stray OCR punctuation between date tokens (`1978 Ian. - 3`, `» . » 8`, `1950 Ian. • 14`, `1947 Oct. ; 20`). */
const DATE_JUNK_RE = /^[-–—.,'^•;:*"]$/;
/** The junk the OCR sticks to a date token: `.16`, `20\\`, `.Martii`, `Nov,.`, `Aug-`, `2$>`, `->` for `»` (AAS 53 (1961) 843). */
const TOKEN_JUNK_RE = /^[-.,'"•^*:;\\/(]+|[.,'"•^*:;\\/-]+$/g;
const YEAR_TOKEN_RE = /^\d{4}\.?$/;
const DAY_TOKEN_RE = /^\d{1,2}$/;
/** A month-shaped word that is not a month: an OCR misreading the table above does not list. */
const WORD_TOKEN_RE = /^[A-Za-zÀ-ÿ]{3,10}\.?$/;

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
/** The chronological index's title lines (`INDEX DOCUMENTORUM` / `CHRONOLOGICO ORDINE DIGESTUS`), which a volume fixture opens with. */
const TITLE_LINE_RE = /^\s*(?:INDEX DOCUMENTORUM|CHRONOLOGICO ORDINE DIGESTUS)\s*$/;
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
/**
 * The column header of the volumes: `ANNO MENSE DIE`, `MENSE I DIE`, `PAG.`, in any OCR
 * spelling -- the 1932-1957 volumes print `PAG.` 133 times and `PAO.`, `PAS.`, `PAß.`,
 * `PA6.`, `PAe`, `FAS`, `PV(J.`, `PAG..`, `PAG»`, `, PAG.` beside it (measured over the 26 fixtures).
 */
const COLUMN_HEADER_RE = /^[\s.,'"•»-]*(?:(?:ANNO|MENSE|DIE|DXE|D1E|PA[GSOEeß6]|FAS|PV\(J|I|i|')[\s.,'"•»-]*)+$/;
// The parts are numbered `II – `, `IV. – `, `I. — ` or (2018's Diarium) not at all.
// The OCR reads the numeral as `1` (AAS 32, 1940: `1 - ACTA PII PP. XII`), `IL` (`IL - ACTA
// SS. CONGREGATIONUM`, AAS 25) or `U` (`U - ACTA SS. CONGREGATIONUM`, AAS 32): any short
// token before the dash is the numeral, since the words after it are what is read. AAS 67
// (1975) sets a full stop after the word (`I - ACTA. PAULI PP. VI`), and AAS 51 (1959)
// reads John XXIII's name as `I0A1OTS` (`II - ACTA I0A1OTS PP. XXIII`), digits inside the
// word: both are read, the second through the popes table's OCR spellings (popes.ts).
// AAS 69 (1977) numbers the synod's part without the word (`II - SYNODUS EPISCOPORUM`, p.
// 764, the pope's three allocutions at the fifth synod), between the pope's part and the
// dicasteries': a part, skipped as `ACTA SYNODI EPISCOPORUM` is.
const PART_HEADING_RE = /^\s*(?:[A-Za-z0-9]{1,4}\.?\s*r?[–—-]\s*)?(ACTA\.?\s+[A-Za-z].*|DIARIUM\s+[A-Z].*|CARDINALIUM COMMISSIO.*|SYNODUS EPISCOPORUM\s*)$/;
/** `ACTA PII PP. X.`, `ACTA IOANNIS PAULI PP. II`, `ACTA BENEDICTI XVI`, `ACTA FRANCISCI PP.`: name words, optional `PP.`, optional numeral. */
const POPE_PART_RE = /^ACTA\s+([A-Z][A-Z0-9]*(?:\s+[A-Z][A-Z0-9]*)*?)(?:\s+PP\.?)?(?:\s+([IVXL]+))?\.?\s*$/;
/**
 * A pope heading as the OCR prints it, normalised for the popes table: the name words
 * upper-cased (`ACTA Pii PP. XII`, AAS 33, 1941), an `l` in the numeral read as `I`
 * (`ACTA PII PP. Xll`, AAS 41, 1949), the full stop after `ACTA` dropped (`ACTA. PAULI
 * PP. VI`, AAS 67, 1975). The heading as printed is kept on the result (`popeHeadings`)
 * so the report can list every variant.
 */
const normalisePopeHeading = (heading: string): string => {
  const words = heading.replace(/\s+/g, ' ').trim().toUpperCase().replace(/^ACTA\.\s/, 'ACTA ').split(' ');
  // No pope of the AAS bears a numeral with an L (the highest is XXIII): an L in the
  // last word is the OCR's lower-case l for I.
  const last = words[words.length - 1]!;
  if (/^[IVXL]+\.?$/.test(last) && words.length > 1) words[words.length - 1] = last.replace(/L/g, 'I');
  return words.join(' ');
};
/** The 1917 index numbers *Acta Sacri Consistorii* among the pope's categories; it is not a part. */
const CONSISTORY_CATEGORY_RE = /^ACTA\s+(?:SACRI\s+)?CONSISTORII/;
// The numeral in any OCR reading (`IY.`, `XJV`, `i.`, `I r-`; AAS 25, 26, 42): the
// heading's words decide the category, and normaliseHeading drops the numeral the same way.
const HEADING_RE = /^\s*[IVXLJYivxl1]+[.-]?\s*[r•]?\s*[–—-]\s*[A-Z][A-ZÀ-Ý .,'’():«»-]*$/;
/**
 * The OCR of AAS 46 (1954) 801 sets one heading in mixed case (`XIV - Sacra Consistoria`),
 * and AAS 59 (1967) prints its headings unnumbered, several in mixed case (`Litterae
 * Encyclicae`, `Epistula Apostolica`, `Adhortationes Apostolicae`, `Litterae Apostolicae`,
 * `Nuntii Telegraphici`, pp. 1140-1152): a heading only when the words are a known category.
 */
const MIXED_CASE_HEADING_RE = /^\s*(?:[IVXL]+\.?\s*[–—-]\s*)?[A-Z][a-z]+(?: [A-Za-z]+){0,4}\.?$/;
/** The second line of a heading, or an unnumbered one; AAS 52 (1960) 1033 ends one in an OCR `^` (`MOTU PROPRIO DATAE^`), AAS 68 (1976) 756 sets the guillemets apart (`« MOTU PROPRIO» DATAE`). */
const HEADING_CONTINUATION_RE = /^[A-Z][A-Z .,'’():«»-]*\^?$/;
/** The column header glued to a heading's line (`XIV - NUNTII SCRIPTO DATI PAG.`, AAS 51 (1959) 946; AAS 66 (1974) 762, 764). */
const HEADING_GLUED_PAG_RE = /^(\s*(?:[IVXL]+\s*[–—-]\s*)?[A-Z][A-Z «»]+?)\s+PA[GS]\.?\s*$/;
/**
 * Dot leaders (once an ellipsis), or at least two spaces, then the page number ending the
 * entry; in the volumes a single leader dot can be glued to the page (`Orientali .154`,
 * AAS 30, 1938) and OCR junk can follow it (`47'`, `226 ,`, `549-`; AAS 24, 32).
 */
const PAGE_END_RE = /(?:(?:\s*\.){2,}|\s*…|\s{2,}|\s\.)\s*['’]?(\d{1,4})[.,'’-]?(?:\s*,)?\s*$/;
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
const COLUMNAR_PAGE_END_RE = /^.*(?:[^\s\d]|\b1[89]\d\d) ['’]?(\d{1,4})[.,'’-]?(?:\s*,)?$/;
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
 * The translations the volumes of 1939-1957 list under an act, each with its own page
 * (`E textu latino versio anglica 645`, AAS 31 (1939); `Eius versiones a Statione
 * radiophonica Civitatis Vaticanae editae :` / `lingua gallica … 205`, AAS 33 (1941);
 * `e lingua lusitana versio italica 270`, AAS 34): the same act again, consumed as
 * sub-items of the entry before, never entries.
 */
const TRANSLATION_RE = /^\s*(?:[Ee] textu \w+ versio\b|[Ee] lingua \w+ versio\b|lingua [a-zñ]+\b|Eius versio(?:nes)?\b|Versio(?:nes)? [a-z]+\b)/;
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

const ABBREVIATIONS = new Set(['card', 'rev', 'litt', 'cong', 'pont', 'sect', 'mons', 'prof', 'encycl', 'ven', 'em', 'emi', 'emum', 'emus', 'rmi', 'rmo', 'tit', 'presb', 'praef', 'apost', 'archiep', 'ep']);

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
  if (h === '' || /[\d()«»]/.test(h) || !/^[A-Za-zÀ-ÿ]/.test(h) || /[a-z][A-Z]/.test(h)) return null;
  // The addressee of a letter the index enters without an incipit (`Ad Emum P. D.
  // Alexandrum tit. Sanctae Mariae in Cosmedin …`, AAS 47 (1955) 211) is description.
  if (/^Ad (?:Emum|Emos|Emum|Excmum|Excmos|Revmum|Revmos|Revmam|Em\.|Exc\.|R\. P\.|P\. D\.|Venerabil|Dilect|Patres|Episcop|Archiepiscop|Sacerdot|Clerum|Moderator|Praesid|Legat|Delegat|Sodales|Christifidel)/.test(h)) return null;
  const words = h.split(' ');
  if (words.length > 8 || isAbbreviation(words[words.length - 1]!)) return null;
  return h;
}

/**
 * A head shaped as a see, the volumes' way of naming a constitution without an incipit
 * or before one: `Urbis` / `Vrbis` (Rome), `De Kaying`, `S. Didaci`, `Viterbien. et Sancti
 * Martini ad Montem Ciminum`, `Satmarien. et Magnovaradinen. Latinorum et Aliarum`,
 * `Portuensis et S. Rufinae`, `B. M. V. de Monteserrato Fluminis Ianuarii` (an abbey):
 * every word capitalised or a connector, and a Latin see-adjective, an abbreviated one
 * (`-en.`), a `De`, an `S.` or an *Aliarum* among them. A single capitalised word is one
 * only when it ends as a see-adjective does (`Riopretensis`), so a one-word incipit
 * (`Quoniam`, `Expedit`) stays an incipit.
 */
const SEE_WORD_RE = /(ensis|ensi|ense|en\.|anae|anum|itana|itanae|orum)$/;
function isSeeHead(head: string, constitution = false): boolean {
  if (/^(?:Urbis|Vrbis)$/.test(head)) return true;
  if (/[a-z][A-Z]/.test(head) || /\d/.test(head)) return false;
  const words = head.split(/\s+/);
  if (!words.every((w) => /^(?:[A-ZÀ-Ý][\wÀ-ÿ'’-]*\.?|et|de|in|seu|ad|atque|ac|aliarum|Aliarum|aliorum|Aliorum|S\.|Ss\.|SS\.|B\.|M\.|V\.|[-–]),?$/.test(w))) return false;
  // Under *Constitutiones Apostolicae* a lone capitalised word before the dash is the see
  // (`Kaying. - Praefectura Apostolica de Kaying …`, AAS 28 (1936) 99); elsewhere only a
  // see-adjective is (`Riopretensis`), and `Quoniam` stays an incipit.
  if (words.length === 1) return constitution || /^[A-ZÀ-Ý][a-zà-ÿ]{3,}(?:ensis|ensi|itana)$/.test(head);
  return /^(?:De|DE|S\.|Ss\.|B\.)(?:\s|$)/.test(head) || /\b[Aa]liarum$/.test(head) || words.some((w) => /^[A-ZÀ-Ý]/.test(w) && SEE_WORD_RE.test(w));
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
  /^((?:[A-ZÀ-ÝË][A-ZÀ-ÝË'’-]*|[-–]|\([^)]*\)|«[^»]*»|(?:et|de|in|Aliarum|aliarum)\b)(?:[ ,.]+(?:[A-ZÀ-ÝË][A-ZÀ-ÝË'’-]*|[-–]|\([^)]*\)|«[^»]*»|(?:et|de|in|Aliarum|aliarum)\b))*)(?<!\b[A-Z])\.,?\s*(?:[-–—]\s+)?(?=[A-Za-zÀ-ÿ«])/;

/**
 * A mixed-case toponym with its vernacular in parentheses before the dash (the volumes
 * of 1932-1957): capitalised Latin words (`S.`, `de`, `et`, `seu`, `in`, `atque`, `ac`,
 * `aliarum` between them, a hyphen or comma joining two), a parenthesis, a full stop
 * and/or a dash, then text. The parenthesis is what tells it from an incipit.
 */
const MIXED_TOPONYM_RE =
  /^((?!Ad\b)(?:[A-ZÀ-Ý][\wÀ-ÿ'’]*\.?|S\.|Ss\.|B\.)(?:(?:[ ,]+|-)(?:[A-ZÀ-Ý][\wÀ-ÿ'’]*\.?|et|de|in|seu|atque|ac|aliarum|Aliarum|aliorum|S\.|Ss\.|B\.))*\s*\([^)]{2,60}\))\s*(?:\.?\s*[-–—]+\s*|\.\s+)(?=[A-Za-zÀ-ÿ«])/;

/**
 * Split an entry's text into incipit / toponym / description. The incipit is the text in
 * guillemets, or the bare text before the first full stop, colon or double space (`While
 * we walk  Ad Episcopos Nigeriae`) that ends a word rather than an abbreviation; a head
 * ended by a colon or full stop that `isToponym` is a toponym instead, as is the volumes'
 * caps toponym before an incipit. A ` - ` between incipit and description (the volumes'
 * convention, `Ius nativum. - De …`) is stripped with the full stop. Runs of spaces in
 * `text` are significant: `joinLines` keeps a double space as one.
 */
export function splitEntryText(text: string, opts: { bareIncipits?: boolean; constitution?: boolean } = {}): Pick<ActaEntry, 'incipit' | 'quoted' | 'toponym' | 'description'> {
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
  // The volumes of 1932-1957 set a constitution's toponym in mixed case with the
  // vernacular in parentheses, then the dash: `De Sienhsien (De Kinghsien). - Vicariatus
  // Apostolicus …`, `Sancti Caroli Ancudiae (Portus Montt). - A Dioecesi …`,
  // `Mysuriensis-Coimbatorensis (Bangalorensis). - …`, `S. Ludovici de Maragnano, S.
  // Ioseph de Grajahu (Pinerensis). -` (AAS 31-34); from 1946 an incipit can follow the
  // parenthesis as in 1958 (`Aleppensis (Berytensis). Solent caeli. - Ex territorio`).
  const mixed = bare ? text.match(MIXED_TOPONYM_RE) : null;
  if (mixed) return withToponym(tidy(mixed[1]!), text.slice(mixed[0].length));
  // The volumes' `Incipit. - Description` (1917-1978), where the description may itself
  // open with a toponym and a colon (1931: `Sollicitudo. - Goyasen.: de dioecesis …`).
  // The OCR of the volumes sets the dash without its spaces (`Quae rei sacrae.-Fines`,
  // AAS 24, 1932) or doubles the full stop (`Ad pastorale ministerium..-De`).
  const dash = bare ? text.match(/^([^«»:]{1,60}?)(?:\.{1,2}|,)\s*•?\s*[-–—]\s*(?=[A-Z«(])(.*)$/s) : null;
  if (dash) {
    // A toponym before the incipit, both ended by a full stop (`Portuensis et S. Rufinae.
    // Qui cognoverit. - In cathedrali templo …`, AAS 45 (1953) 326; `Riopretensis. Decessor
    // Noster. -`, `De Ambanja. Ad potioris dignitatis. -`, AAS 43 (1951)): the head splits at
    // its first full stop where what precedes it is shaped as a see -- a Latin adjective
    // (`-ensis`, `-en.`), `De …`, `S. …`, `… et Aliarum` -- and what follows is a short
    // capitalised incipit.
    // Under *Constitutiones Apostolicae* two full-stop-ended heads before the dash are the
    // see and the incipit whatever the see's shape (`Africa Meridionalis. Suprema Nobis. -`,
    // AAS 43 (1951)); elsewhere the first must be shaped as a see.
    const two = dash[1]!.match(/^(.{2,60}?(?<!\b[A-Z]|\bSs|\bSS|\bBB))\.\s+([A-Z][^.]{1,50})$/s);
    if (isSeeHead(tidy(dash[1]!), opts.constitution) && /\b[Aa]liarum$/.test(tidy(dash[1]!))) return withToponym(tidy(dash[1]!), dash[2]!);
    if (two && (opts.constitution ? /^[A-ZÀ-Ý]/.test(two[1]!) && !/[a-z][A-Z]/.test(two[1]!) : isSeeHead(tidy(two[1]!)))
      && asIncipit(two[2]!) !== null && two[2]!.trim().split(/\s+/).length <= 5) {
      return { incipit: asIncipit(two[2]!)!, quoted: false, toponym: tidy(two[1]!), description: strip(dash[2]!) };
    }
    // A whole head that is a see: under the constitutions any see-shaped head; elsewhere
    // (a letter can begin *Cum in Republica Estoniensi* or *De Romanorum Pontificum*) only
    // `Urbis` or `… et Aliarum`.
    // (the apostolic letters of the 1930s for a minor basilica are entered under the
    // diocese: `Passaviensis dioecesis. - Abbatiale templum …`, `Ventimiliensium Episcopus. -`).
    if (isSeeHead(tidy(dash[1]!), opts.constitution)
      && (opts.constitution || /^(?:Urbis|Vrbis)$|\b[Aa]liarum$|(?:[Aa]rchi)?[Dd]ioecesis$|Episcopus$/.test(tidy(dash[1]!)))) return withToponym(tidy(dash[1]!), dash[2]!);
  }
  const dashIncipit = dash && !isToponym(`${tidy(dash[1]!)}.`) ? asIncipit(dash[1]!) : null;
  if (dashIncipit !== null) return { incipit: dashIncipit, quoted: false, toponym: null, description: strip(dash![2]!) };
  const colon = text.match(/^([^:]{1,80}?)\s*:(\s.*|)$/s);
  if (colon && isToponym(tidy(colon[1]!))) return withToponym(tidy(colon[1]!), colon[2]!);
  const dot = text.match(/^(\S{1,40}?)\.(\s.*|\s*[-–—]+\s.*|)$/s);
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

/**
 * The date state the ditto marks inherit. `month` is null after an entry whose month the
 * OCR misread beyond the table (`» Ott. 3` is listed; an unlisted word is not): the
 * entries after it that inherit the month are unreadable too, until a printed month.
 */
interface DateState {
  day: number | null;
  month: number | null;
  /**
   * Null where the index prints no readable year: a `»` in the year column with nothing
   * above it to inherit (AAS 42 (1950) 911, the volume's first entries), a year token the
   * OCR has broken (`19 IS`, `19Ö4`, `3918`) that no one-digit repair fits. The entry is
   * dated `????-MM-DD` and the dittos after it inherit the null until a year is printed;
   * a curated correction (curation.ts) supplies the year from the act itself.
   */
  year: number | null;
  /** The year is the parser's reading (an OCR digit repaired): inherited by the dittos after it, with the note. */
  note?: string;
  /** The curation key (`year:page`) of the entry whose line carried the misread token, set when that entry closes; the dittos inherit it. */
  noteRef?: string;
}

/** A date line read: the resolved date (day null for a month-only entry), and the text after the date tokens. */
interface DateLine {
  date: DateState | null;
  /** Why the date did not resolve: a ditto with nothing to inherit, a day out of range. */
  unreadable?: string;
  /** A reading the parser took that the report should show beside the entry (an OCR year repaired). */
  note?: string;
  /** For an unreadable month: what the entries after it inherit (the year; the month stays unreadable until one is printed). */
  state?: DateState;
  /** How many date tokens were read (a lone month before lower-case text is a continuation line, not a date). */
  tokens: number;
  text: string;
}

type DateToken = { kind: 'ditto' } | { kind: 'year'; n: number | null } | { kind: 'month'; n: number | null } | { kind: 'day'; n: number | null };

/**
 * Read the date tokens at the head of a line, tolerant of the layout mode's spacing and
 * of stray punctuation between them; null when the line opens no entry. `volumeYear`
 * bounds the OCR-year repair below.
 */
function readDateLine(line: string, prev: DateState | null, columnar: boolean, volumeYear?: number): DateLine | null {
  const tokens = line.trim().split(/\s+/);
  // OCR punctuation stuck to the first token (`.1978 Sept. 3`); an `i` or `l` for the
  // year's first digit (`i944 Maii 11`, `i 945 Apr. 15`, AAS 37, 1945), split or not.
  let joined = 0;   // tokens of the line merged into one (the split year), so the text starts one token later
  if (columnar && tokens[0] !== undefined) {
    // The default extraction mode glues the column header to the first entry of a page
    // (`PAG. 19Ö4 Oet. 7 Ad Sinarum gentem`, AAS 47 (1955) 867): dropped where date tokens follow.
    if (/^PA[GSOEeß6]\.?$/.test(tokens[0]) && tokens.length > 2 && (YEAR_TOKEN_RE.test(tokens[1]!) || /^\d{2}[^\d\s]{1,2}\d$/.test(tokens[1]!) || DITTO_RE.test(tokens[1]!))) { tokens.shift(); joined = 1; }
    tokens[0] = tokens[0]!.replace(/^[.,'^"]+(?=\d)/, '').replace(/^(\d{2})\.(\d{2})$/, '$1$2');
    if (/^[il]$/.test(tokens[0]) && /^\d{3}$/.test(tokens[1] ?? '')) { tokens.splice(0, 2, `1${tokens[1]}`); joined = 1; }
    else if (/^[il]\d{3}$/.test(tokens[0])) tokens[0] = `1${tokens[0].slice(1)}`;
    // A year split into two damaged halves before a month (`19 IS Ian. 10 ICENSIS`, AAS 41
    // (1949) 662, for 1948), or a four-character token with a digit broken (`19Ö4 Oet. 7`,
    // AAS 47): the year is unprinted, not the day 19.
    else if (/^\d{2}$/.test(tokens[0]) && /^[A-Za-z0-9]{2}$/.test(tokens[1] ?? '') && monthOf(tokens[2] ?? '', true, true) !== undefined) { tokens.splice(0, 2, '????'); joined = 1; }
    // … or the last digit broken (`196S Nov. 4 Summi Dei`, `196S Sept. 14 Cum proximus`, AAS
    // 55 (1963) 1081): the year is unprinted here too.
    else if (/^\d{2}[^\d\s]{1,2}\d$|^\d[^\d\s]{1,2}\d{2}$|^\d{3}[^\d\s]$/.test(tokens[0]) && monthOf(tokens[1] ?? '', true, true) !== undefined) tokens[0] = '????';
  }
  const seq: DateToken[] = [];
  let i = 0;
  const seen = new Set<string>();
  let note: string | undefined;
  // The index PDFs print exactly three tokens; the columnar volumes any subset.
  const limit = columnar ? Infinity : 3;
  for (; i < tokens.length && seq.length < limit; i++) {
    const raw = tokens[i]!;
    // The volumes' OCR sticks punctuation to a date token (`.16`, `20\`, `.Martii`,
    // `Nov,.`, `Aug-`) and misdraws the ditto (`»>`, `))`, `.)`, `«`): read through it.
    const t = columnar ? raw.replace(TOKEN_JUNK_RE, '') : raw;
    if (DITTO_RE.test(raw) || (columnar && COLUMNAR_DITTO_RE.test(t))) { seq.push({ kind: 'ditto' }); continue; }
    // `«` for `»` (`» « 11 Africa Meridionalis`, AAS 43; `« Apr. 20 Romanorum Pontificum`,
    // AAS 24): a ditto only where a date token follows, since a guillemet also opens the
    // entry's own incipit (`» » » « Quasi semine ». - …`) or a quoted name on a
    // continuation line (`« de Indore » erigitur 59`).
    if (columnar && COLUMNAR_DITTO_INNER_RE.test(t) && i + 1 < tokens.length && !seen.has('day')) {
      const after = tokens[i + 1]!.replace(TOKEN_JUNK_RE, '');
      if (DAY_TOKEN_RE.test(after) || DITTO_RE.test(tokens[i + 1]!) || COLUMNAR_DITTO_RE.test(after) || monthOf(after, true, true) !== undefined) {
        seq.push({ kind: 'ditto' });
        continue;
      }
    }
    if ((DATE_JUNK_RE.test(raw) || (columnar && t === '')) && (seq.length > 0 || (columnar && i === 0))) continue;
    // A lone letter where a ditto stands (`» h 3 Quae rei sacrae`, `» D » De Leopoldville`,
    // `» s » Montana`, 1932-1957): a ditto, when a date token precedes it and a day, a
    // ditto or a capitalised word follows.
    if (columnar && !seen.has('day') && COLUMNAR_DITTO_LETTER_RE.test(t) && i + 1 < tokens.length) {
      const after = tokens[i + 1]!.replace(TOKEN_JUNK_RE, '');
      if ((seq.length > 0 && (DAY_TOKEN_RE.test(after) || DITTO_RE.test(tokens[i + 1]!) || COLUMNAR_DITTO_RE.test(after)))
        || (seq.length === 0 && i === 0 && (monthOf(after, true) !== undefined || DITTO_RE.test(tokens[i + 1]!) || COLUMNAR_DITTO_RE.test(after)))) {
        seq.push({ kind: 'ditto' });
        continue;
      }
    }
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
    if (t === '????') tok = { kind: 'year', n: null };
    else if (YEAR_TOKEN_RE.test(t)) {
      let n = Number(t.replace(/\.$/, ''));
      // The OCR reads a `9` as `0`, a `1` as `3`, a `5` as `6` in the year column (`1047
      // Maii 15`, AAS 39 (1947) 654, the canonisation of Nicholas of Flüe; `1048 Maii 1`,
      // AAS 40 (1948), *Auspicia quaedam*; `3950 Dec. 10`, AAS 42 (1950); `1963 Apr. 29
      // Daniae (Hafniae)`, AAS 45 (1953), the erection of Copenhagen; `1964 Maii 30 Cum
      // Christus Iesus`, AAS 47 (1955), the canonisation of Pius X): a four-digit token
      // that no volume can print -- outside the century, or after the volume's own year
      // -- reads as the year of the volume's span it differs from by exactly one digit,
      // when there is one such year, and the reading is noted on the entry and on the
      // dittos that inherit it: the matcher may find the shelf record on the noted date,
      // the creator mints nothing from it unless a curated row confirms the reading
      // against the act (curation.ts). A year the volume *could* print is never
      // repaired, however implausible, because the OCR's digits do not keep to one: AAS
      // 41 (1949) prints `1919` for 1949 (*Conflictatio bonorum*, 11 February 1949) and
      // for 1948 (*Guayaquilensis*, 15 July 1948) alike, and `1910` in AAS 9 (1917)
      // could be 1916 or 1917; such an entry is held by the creator as dated before the
      // pontificate, and corrected only by a curated row quoting the act.
      if (columnar && volumeYear !== undefined && (n < 1900 || n > volumeYear + 1)) {
        const candidates = [volumeYear, volumeYear - 1].filter((y) => {
          const a = String(y), b = String(n);
          return a.length === b.length && [...a].filter((c, k) => c !== b[k]).length === 1;
        });
        if (candidates.length === 1) { note = `year ${n} read as ${candidates[0]} (an OCR digit)`; n = candidates[0]!; }
        // No such year (`3918`, AAS 41; `1961`, AAS 45): the year is unprinted.
        else { tok = { kind: 'year', n: null }; }
      }
      if (tok === null) tok = { kind: 'year', n };
    } else if (DAY_TOKEN_RE.test(t)) tok = { kind: 'day', n: Number(t) };
    else {
      const after = i + 1 < tokens.length ? tokens[i + 1]!.replace(TOKEN_JUNK_RE, '') : '';
      const m = monthOf(t, columnar, DAY_TOKEN_RE.test(after) || DITTO_RE.test(after) || COLUMNAR_DITTO_RE.test(after));
      if (m !== undefined) tok = { kind: 'month', n: m };
      // A month-shaped word the tables do not list, where a month stands (after the year
      // or a ditto, before a day): an OCR misreading -- the month is unreadable, and so are
      // the entries that inherit it. A digit-bearing token that is not a day, in the day's
      // place after a month (`2$>` for 29), is an unreadable day.
      else if (columnar && (seq.length > 0 || i === 0) && !seen.has('month') && !seen.has('day') && WORD_TOKEN_RE.test(t)
        && i + 1 < tokens.length && DAY_TOKEN_RE.test(tokens[i + 1]!.replace(TOKEN_JUNK_RE, ''))
        && (seq.length > 0 || (/^[A-ZÀ-Ý]/.test(t) && i + 2 < tokens.length && /^[A-Z«]/.test(tokens[i + 2]!)))) tok = { kind: 'month', n: null };
      else if (columnar && seen.has('month') && !seen.has('day') && /\d/.test(t) && /^[\dA-Za-z$§!?>)\\]{1,4}$/.test(t)) tok = { kind: 'day', n: null };
    }
    // A repeated token (`» Apr. Apr. 1`, AAS 26 (1934)) is the OCR's doubling: skipped.
    if (tok !== null && seen.has(tok.kind)) {
      const prevTok = seq.find((x) => x.kind === tok!.kind);
      if (prevTok && 'n' in prevTok && 'n' in tok && prevTok.n === tok.n) continue;
      break;
    }
    if (tok === null) break;
    seen.add(tok.kind);
    seq.push(tok);
  }
  if (seq.length === 0) return null;
  // A lone number and a dash open a heading whose numeral the OCR read as a digit (`1 -
  // LITTERAE DECRETALES`, AAS 33, 1941), not a day.
  if (columnar && seq.length === 1 && seq[0]!.kind === 'day' && /^[-–—]$/.test(tokens[1] ?? '')) return null;
  // The text is what follows the consumed tokens, spacing kept (a double space matters).
  let rest = line.replace(/^\s+/, '');
  for (let k = 0; k < i + joined; k++) rest = rest.replace(/^\S+\s*/, '');
  const text = rest;

  if (!columnar) {
    // The index PDFs: three positional tokens, day-first (`5 Dec. 2022`, `30 Sep. »`,
    // `» » »`) or year-first (`2014 Dec. 20`, `» » 22`), the layout read off each line
    // from where the four-digit and the one-or-two-digit number stand; or a month with a
    // year or a ditto and no day (`Sept. » Chengden.:`), which is month-only.
    const at = (k: number) => seq[k];
    if (seq.length === 2 && at(0)!.kind === 'month' && (at(1)!.kind === 'year' || at(1)!.kind === 'ditto')) {
      const year = at(1)!.kind === 'year' ? (at(1) as { n: number | null }).n : prev?.year;
      if (year === undefined || year === null) return { date: null, unreadable: 'a ditto with nothing to inherit', text, tokens: seq.length };
      return { date: { day: null, month: (at(0) as { n: number }).n, year }, text, tokens: seq.length };
    }
    if (seq.length !== 3) return null;
    const yearFirst = at(0)!.kind === 'year' || at(2)!.kind === 'day';
    const [yTok, mTok, dTok] = yearFirst ? [at(0)!, at(1)!, at(2)!] : [at(2)!, at(1)!, at(0)!];
    if ((yTok.kind !== 'year' && yTok.kind !== 'ditto') || (mTok.kind !== 'month' && mTok.kind !== 'ditto')
      || (dTok.kind !== 'day' && dTok.kind !== 'ditto')) return null;
    const year = yTok.kind === 'year' ? yTok.n : prev?.year;
    const month = mTok.kind === 'month' ? mTok.n : prev?.month;
    const day = dTok.kind === 'day' ? dTok.n : prev?.day;
    if (year === undefined || year === null || month === undefined || month === null || day === undefined) {
      return { date: null, unreadable: 'a ditto with nothing to inherit', text, tokens: seq.length };
    }
    if (day === null) return { date: null, unreadable: 'a ditto day after a month-only entry', text, tokens: seq.length };
    if (day < 1 || day > 31 || year < 1900) return { date: null, unreadable: 'out of range', text, tokens: seq.length };
    return { date: { day, month, year }, text, tokens: seq.length };
  }

  // The columnar layout: typed tokens stand for themselves; a `»` stands for the next
  // missing column in ANNO MENSE DIE order; a blank year or month inherits; a blank day
  // inherits only under a blank month, and is otherwise the month-only shape.
  const typed = { year: seq.find((t) => t.kind === 'year'), month: seq.find((t) => t.kind === 'month'), day: seq.find((t) => t.kind === 'day') };
  // `8. Fidei in Argentina` (AAS 40 (1948) 572) opens with the OCR's `8` for `S.`.
  const opensText = /^(?:[A-Za-zÀ-ÿ«"'(\[$]|8\.\s*[A-Z])/.test(text.trim().replace(/^[/•*.-]+\s*/, ''));
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
  let year: number | null | undefined = yHow === 'typed' ? (typed.year as { n: number | null }).n : prev?.year;
  let noteRef: string | undefined;
  if (yHow !== 'typed' && prev?.note !== undefined) { note = prev.note; noteRef = prev.noteRef; }
  const month = mHow === 'typed' ? (typed.month as { n: number | null }).n : prev?.month;
  // A ditto in the year column with nothing before it -- at the head of a part (AAS 42
  // (1950) 911: `» Nov,. 1 Munificentissimus Deus`, the volume's first entry, whose
  // printed year the OCR lost) -- or a year token the OCR has broken beyond repair: the
  // year is not printed, and the volume year would be a guess (a part's first entries
  // can be the December before). The entry is kept with a `????` year, which a curated
  // correction supplies from the act itself, and every ditto after it inherits the blank
  // until a year is printed; the creator never mints an entry so dated.
  if (year === undefined && yHow === 'ditto' && month !== undefined) year = null;
  if (year === null && !note) note = 'the year column prints a ditto with nothing above it, or a token the OCR has broken: the year is not printed';
  if (year === undefined || month === undefined) return { date: null, unreadable: 'nothing to inherit', text, tokens: seq.length };
  if (month === null) {
    // The month is the OCR's, here or on the entry this one inherits from: the year is
    // kept for the entries after, the entry itself is unreadable.
    return {
      date: null, state: { year, month: null, day: null }, text, tokens: seq.length, ...(note ? { note } : {}),
      unreadable: mHow === 'typed' ? `unreadable month '${tokens[seq.findIndex((t) => t.kind === 'month')]}'` : 'inherits an unreadable month',
    };
  }
  let day: number | null;
  if (dHow === 'typed') day = (typed.day as { n: number | null }).n;
  else if (dHow === 'ditto') {
    if (prev === null) return { date: null, unreadable: 'a ditto with nothing to inherit', text, tokens: seq.length, ...(note ? { note } : {}) };
    day = prev.day;
  } else day = mHow === 'blank' ? (prev?.day ?? null) : null;
  if (year !== null && (year < 1900 || (volumeYear !== undefined && year > volumeYear + 1))) return { date: null, unreadable: `year ${year} out of range`, text, tokens: seq.length };
  // An OCR-misread day (`» Mai. 80`, `» Nov. 38`; `2$>`): the month is read, the day is
  // not -- the entry is month-only and reported, and the ditto chain after it keeps the month.
  if (dHow === 'typed' && (typed.day as { n: number | null }).n === null) {
    return { date: { day: null, month, year, ...(note ? { note } : {}) }, unreadable: `day '${tokens[seq.findIndex((t) => t.kind === 'day')]}' unreadable, read as month-only`, text, tokens: seq.length, ...(note ? { note } : {}) };
  }
  if (day !== null && (day < 1 || day > 31)) return { date: { day: null, month, year, ...(note ? { note } : {}) }, unreadable: `day ${day} out of range, read as month-only`, text, tokens: seq.length, ...(note ? { note } : {}) };
  return { date: { day, month, year, ...(note ? { note } : {}), ...(noteRef ? { noteRef } : {}) }, text, tokens: seq.length, ...(note ? { note } : {}) };
}

/** The bracketed date (and pope) of an earlier act before its incipit, in the index PDFs. */
const BRACKET_RE =
  /^\[(?:([A-Za-z]+(?: PP\.)?(?: [IVXL]+)?):\s*)?(?:(\d{4})\s+([A-Z][a-z]{2,3})\.?\s+(\d{1,2})|(\d{1,2})\s+([A-Z][a-z]{2,3})\.?\s+(\d{4}))\]\s*/;

const isoOf = (d: DateState): string => `${d.year ?? '????'}-${pad(d.month!)}${d.day === null ? '' : `-${pad(d.day)}`}`;

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
      // A header glued to a line is cut off, with its page number where that is fused to
      // the line's last word (`Mardensi Armenorum790   Index documentorum`, AAS 46 (1954)
      // 790); where the OCR has fused it with the entry's own page (`appellandae. 33788
      // Index documentorum`, 337 and 788 sharing a digit) the entry keeps the fused number
      // and is reported without a page.
      if (GLUED_HEADER_RE.test(line)) line = line.replace(/(?<=[a-zà-ÿ])\d{3,4}(?=\s{3,})/, '').replace(GLUED_HEADER_RE, '');
      // The index's own title, wherever the extraction sets it (the default mode renders
      // it after the first page's entries, AAS 52 (1960) 1032): never a category heading.
      if (columnar && TITLE_LINE_RE.test(line)) continue;
      if (columnar) line = line.replace(HEADING_GLUED_PAG_RE, '$1');
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
  // The continuation column of a page: the modal indentation of its undated lines. In
  // the layout mode of 1939-1957 a dated entry's text can sit right after its date
  // (`1941 Febr. 24 It is with heartfelt affection`, column 14) while a blank-dated
  // entry keeps the page's hanging indent (`Tui in S. C. de Propaganda Fide`, column
  // 33, against continuations at 35; AAS 33 (1941) 533), so a capitalised line indented
  // one to eight columns less than the continuations, shaped as an entry opens
  // (`Incipit. - …`, `Toponym (vernacular). - …`), is an entry too.
  const contColOf = new Map<number, number>();
  // Whether a page's dated entries open as `Incipit. - Description` / `Toponym
  // (vernacular). - …` (the volumes from 1917 on; 1909 prints descriptions): where at
  // least three in five do, a blank-dated line must too, so that a continuation line
  // the OCR set at the entry column and opened with a capital (`Sanctorum honores
  // decernuntur 161`, AAS 47 (1955) 869; `Index clericorum conclavistarum 142`, AAS 31
  // (1939) 739) is not read as an entry of its own.
  const ENTRY_OPENING_RE = /^[A-Z«$][^\n]{1,80}?(?:[.)]\s*•?\s*[-–—]\s|\)\.\s[A-Z])/;
  const shapedPages = new Set<number>();
  // A page extracted in pypdf's default mode (fetch-acta.sh falls back to it where the
  // layout mode fused lines: most pages of AAS 52, 54-58, 60 and 68, 1960-1968 and 1976)
  // has no column geometry at all -- every line starts at the margin, the date on the
  // entry's line and the continuations unindented -- so a capitalised continuation
  // (`Patronam et S. Ioannes Maria Vianney`, AAS 52 (1960) 1035) is not at any entry
  // column and must never be read as a blank-dated entry. Such a *flat* page is told by
  // its indentation: no line of it is indented four columns or more.
  const flatPages = new Set<number>();
  if (columnar) {
    const cols = new Map<number, number[]>();
    const conts = new Map<number, Map<number, number>>();
    const shapes = new Map<number, [number, number]>();
    const indented = new Set<number>();
    lines.forEach((line, i) => { if (line.trim() !== '' && line.length - line.trimStart().length >= 4) indented.add(pageOf[i]!); });
    for (let p = 0; p < text.split('\f').length; p++) if (!indented.has(p)) flatPages.add(p);
    lines.forEach((line, i) => {
      if (line.trim() === '') return;
      const p = pageOf[i]!;
      const d = readDateLine(line, { day: 1, month: 1, year: 1900 }, true, year);
      if (d && d.text.trim() !== '') {
        cols.set(p, [...(cols.get(p) ?? []), line.length - d.text.trimStart().length]);
        const sh = shapes.get(p) ?? [0, 0];
        shapes.set(p, [sh[0] + (ENTRY_OPENING_RE.test(d.text.trim()) ? 1 : 0), sh[1] + 1]);
        return;
      }
      const indent = line.length - line.trimStart().length;
      if (indent < 8 || HEADING_RE.test(line) || HEADING_CONTINUATION_RE.test(line.trim())) return;
      const m = conts.get(p) ?? new Map<number, number>();
      m.set(indent, (m.get(indent) ?? 0) + 1);
      conts.set(p, m);
    });
    for (const [p, cs] of cols) {
      const sorted = [...cs].sort((a, b) => a - b);
      entryColOf.set(p, sorted[Math.floor(sorted.length / 2)]!);
    }
    for (const [p, m] of conts) {
      const [indent] = [...m].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]!;
      if (m.get(indent)! >= 3) contColOf.set(p, indent);
    }
    for (const [p, [shaped, all]] of shapes) if (all >= 3 && shaped / all >= 0.6) shapedPages.add(p);
  }
  const atEntryColumn = (i: number): boolean => {
    if (flatPages.has(pageOf[i]!)) return false;
    const col = entryColOf.get(pageOf[i]!);
    const line = lines[i]!;
    const indent = line.length - line.trimStart().length;
    if (col !== undefined && indent <= col + 2) return !shapedPages.has(pageOf[i]!) || ENTRY_OPENING_RE.test(line.trim());
    const cont = contColOf.get(pageOf[i]!);
    return cont !== undefined && indent >= cont - 8 && indent <= cont - 1 && ENTRY_OPENING_RE.test(line.trim());
  };
  // The index PDFs are extracted whole, so the chronological index is found by its
  // title; a volume fixture *is* the index's pages (fetch-acta.sh located them by that
  // title), and where its first page is in pypdf's default mode the title is rendered
  // after the page's entries (AAS 52 (1960) 1032: `I - ACTA PII PP. XII` … then `INDEX
  // DOCUMENTORUM` / `CHRONOLOGICO ORDINE DIGESTUS` as the page's last lines), so a
  // volume is read from its first line -- everything before the first pope part is
  // skipped in any case.
  const titleAt = lines.findIndex((l) => /^\s*CHRONOLOGICO ORDINE DIGESTUS\s*$/.test(l));
  if (titleAt < 0 && !columnar) throw new Error('No "CHRONOLOGICO ORDINE DIGESTUS" heading found');
  const start = columnar ? -1 : titleAt;
  const end = lines.findIndex((l, i) => i > start && /^\s*(INDICES NOMINUM|I – INDEX NOMINUM|INDEX NOMINUM PERSONARUM|INDEX ANALYTICUS|INDEX RERUM|INDEX ALPHABETICUS)/.test(l));

  const stats: ActaParseStats = { lines: 0, pageLines: 0, harvestedPageLines: 0, harvestedEntries: 0, dateLines: 0, entries: 0, monthOnly: 0, withoutPage: 0, subItems: 0, translations: 0, consumed: 0 };
  const result: ActaParseResult = {
    volume, year, ...(opts.part ? { part: opts.part } : {}),
    entries: [], unseenHeadings: [], unmappedPopes: [], popeHeadings: [], skippedParts: [], defects: [], stats,
  };
  let pope: string | null = null;
  let category: string | null = null;
  let headingLines: string[] = [];     // the raw lines of the current category heading
  let headingOpen = false;             // the previous line was a category heading (continuations attach)
  let prev: DateState | null = null;
  // `date` carries a month-only value for an entry whose day is not printed.
  let open: { lines: string[]; text: string; date: string; category: string; pope: string; note?: string; state?: DateState; blankDated?: boolean } | null = null;
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
  const isHeading = (l: string) => (HEADING_RE.test(l) || (columnar && MIXED_CASE_HEADING_RE.test(l) && categoryForHeading(normaliseHeading(l)) !== null))
    && readDateLine(l, null, columnar, year) === null;
  const isDateLine = (l: string) => readDateLine(l, prev ?? { day: 1, month: 1, year: 1900 }, columnar, year) !== null;
  // A blank-dated entry of the columnar layout (see `atEntryColumn`): capitalised, at the
  // entry column, not a heading. Used where the line is read and where the line before it
  // asks whether the next line opens something (a page after one space closes an entry
  // only then).
  const isBlankDatedEntry = (i: number): boolean => columnar && atEntryColumn(i) && /^[A-Z«]/.test(lines[i]!.trim())
    && !HEADING_CONTINUATION_RE.test(lines[i]!.trim()) && !HEADING_RE.test(lines[i]!) && !PART_HEADING_RE.test(lines[i]!);
  // The date the layout mode set beside the last line of the entry before (`» Apr. 4
  // rum stationalium evehuntur . 363` / `Paterna caritas. - Sancta Teresia …`, AAS 27
  // (1935) 509): a date line whose text opens in lower case continues the open entry, and
  // its date, when it is not the open entry's own, is the next blank-dated entry's.
  let pending: DateState | null = null;
  let blankDated = false;   // the line being read has no date column at all
  let translationOpen = false;   // the line before was a translation sub-item (its continuation is one too)

  for (let i = start + 1; i < (end < 0 ? lines.length : end); i++) {
    const line = lines[i]!;
    if (line.trim() === '') continue;

    const part = line.match(PART_HEADING_RE);
    if (part && !CONSISTORY_CATEGORY_RE.test(part[1]!.replace(/\s+/g, ' ').trim())) {
      flushDefect();
      const heading = normalisePopeHeading(part[1]!);
      const m = heading.match(POPE_PART_RE);
      const known = m ? popeForGenitive(`${m[1]} ${m[2] ?? ''}`) : null;
      if (known) {
        pope = known.pope;
        result.popeHeadings.push(line.replace(/\s+/g, ' ').trim());
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
    // A translation listed under an act (`lingua gallica … 205`) is the act again, not
    // an entry the rate could count: outside the denominator (stats.translations counts it).
    const translation = columnar && TRANSLATION_RE.test(line);
    if (translation) stats.translations++;
    // A page number alone on its line (the layout mode a line below its entry, the default
    // mode where the OCR lost the entry's other lines) is a page line of the denominator too.
    const bareNumberLine = columnar && /^\s*\d{1,4}\s*$/.test(line) && Number(line) < 1500;
    if ((PAGE_END_RE.test(line) || (tightEnd && Number(tightEnd[1]) < 1500) || bareNumberLine) && !translation) {
      stats.pageLines++;
      if (harvestedHere) stats.harvestedPageLines++;
    }

    // The 1909 table of contents inside *Sapienti Consilio*: a capitalised division title
    // listed above, or a numbered office, chapter or article, with or without ditto marks
    // before it. Consumed and counted; the ditto state still advances on a dated one.
    blankDated = false;
    let dated = readDateLine(line, prev, columnar, year);
    // A continuation line that opens with a month's name or a lone mark (`Aprilis a. 1934
    // 11`, AAS 25 (1933) 517) is text, not a date: one token and lower-case text after it.
    if (dated !== null && columnar && open !== null && dated.tokens === 1 && /^[a-z]/.test(dated.text.trim())) dated = null;
    // A blank-dated entry of the columnar layout (see `atEntryColumn`): capitalised, at
    // the entry column, and only where a date has been read before on this part.
    // (`prev` is read through a local: the control-flow analysis narrows it to null
    // otherwise, since the closures above assign it.)
    const inherited = (): DateState | null => prev;
    const inheritedDate = inherited();
    if (dated === null && columnar && (inheritedDate !== null || pending !== null) && isBlankDatedEntry(i)) {
      const from: DateState = pending ?? inheritedDate!;
      dated = from.month === null
        ? { date: null, state: from, unreadable: 'inherits an unreadable month', text: line.trimStart(), tokens: 0 }
        : { date: { day: from.day, month: from.month, year: from.year }, text: line.trimStart(), tokens: 0 };
      blankDated = true;
    }
    pending = null;
    const body = dated ? dated.text : line;
    // The nested table of contents of Sapienti Consilio is a shape of AAS 1 alone; elsewhere
    // a heading such as APPENDIX or SACRA ROMANA ROTA inside the pope's part is a heading and
    // must reach isHeading (CodeRabbit, PR #33).
    // A translation line's own continuation (`Eius versiones a Statione radiophonica Civitatis Vati-` /
    // `canae editae :`) is consumed with it.
    const translationLine: boolean = columnar && dated === null && (TRANSLATION_RE.test(line) || (translationOpen && /^\s+[a-z]/.test(line) && !isBlankDatedEntry(i)));
    translationOpen = translationLine;
    if ((volume === 1 && NESTED_TOC_HEADINGS.has(normaliseHeading(line))) || SUB_ITEM_RE.test(body) || SUB_ITEM_RE.test(line) || translationLine) {
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
      // An act the index prints before its first category heading (AAS 25 (1933) 515: the
      // bull of indiction of the Holy Year, `1933 Ian. 6 INDICTIO Anni Sancti … 5`) is
      // reported, and its date still governs the ditto marks of the entries after it.
      stats.consumed++;
      defect(null, `${pope}: line before any category heading: ${line.trim()}`);
      if (dated?.date) prev = dated.date;
      continue;
    }

    // The layout mode repeats the date at the top of a page where an entry runs on from
    // the previous one (`» Dec. 16 URAWAËNSIS. Qui superna Dei. - … Urawaën-` / `1957
    // Dec. 16 sis, in Iaponia …`): a date line that opens in lower case with the open
    // entry's own date is its continuation.
    const continues = dated !== null && open !== null && columnar && /^[a-z]/.test(dated.text.trim());
    if (continues && dated!.date !== null && isoOf(dated!.date) !== open!.date) pending = dated!.date;
    if (columnar && INTERLEAVED_RE.test(line)) {
      // The layout mode interleaved two entries here: nothing on the line is trusted.
      flushDefect();
      stats.consumed++;
      defect(category, `interleaved line (two entries' words on one line): ${line.trim()}`);
      if (dated?.date) prev = dated.date;
      continue;
    }
    let bareNumber = false;
    let junkNumberSkipped = false;
    const lastTight = open !== null ? open.lines[open.lines.length - 1]!.match(COLUMNAR_PAGE_END_RE) : null;
    if (columnar && open !== null && /^\s*\d{1,4}\s*$/.test(line) && Number(line) < 1500 && !(lastTight && Number(lastTight[1]) < 1500)) {
      // The page number alone on a line (the layout mode set it a line below its entry; the
      // default mode of AAS 58 (1966) 1207 sets it so where the OCR lost the entry's other
      // lines: `1965 Dec. 11 Illustri laude. - Titulo ac privilegiis Basilicae Minoris ecclesia` / `569`).
      // Not where the entry's last line already ends in a page (`… nuncupandus 647` / `9`,
      // AAS 48 (1956) 861, the `9` being the OCR's for the next entry's ditto): that page
      // is the entry's, and the bare number is read as the junk it is.
      open.lines.push(line);
      bareNumber = true;
    } else if (columnar && open !== null && /^\s*\d{1,4}\s*$/.test(line) && Number(line) < 1500 && lastTight && Number(lastTight[1]) < 1500) {
      junkNumberSkipped = true;
      stats.consumed++;
      defect(category, `a bare number after a page-ended line, not read as a page: ${line.trim()}`);
      // The open entry closes on its own page below.
    } else if (dated && !continues) {
      flushDefect();
      if (dated.date === null) {
        stats.consumed++;
        defect(category, `unreadable date (${dated.unreadable}): ${line.trim()}`);
        prev = dated.state ?? null;
        continue;
      }
      if (dated.unreadable) defect(category, `${dated.unreadable}: ${line.trim()}`);
      if (dated.note) defect(category, `${dated.note}: ${line.trim()}`);
      stats.dateLines++;
      prev = dated.date;
      open = { lines: [line], text: dated.text, category, pope, date: isoOf(dated.date), ...(dated.note ? { note: dated.note, state: dated.date } : {}), ...(blankDated ? { blankDated } : {}) };
    } else if (open === null) {
      stats.consumed++;
      defect(category, `line outside any entry: ${line.trim()}`);
      continue;
    } else {
      // A continuation; a repeated date at a page top is dropped from the text.
      open.lines.push(continues ? ' '.repeat(30) + dated!.text : line);
    }

    // Does the entry end on this line?
    const last = open.lines[open.lines.length - 1]!;
    let pageMatch = bareNumber ? last.match(/^\s*(\d{1,4})\s*$/) : last.match(PAGE_END_RE);
    let pageTail = pageMatch?.[0].length ?? 0;
    if (!pageMatch) {
      const tight = last.match(columnar ? COLUMNAR_PAGE_END_RE : TIGHT_PAGE_END_RE);
      const nextAt = lines.findIndex((l, k) => k > i && l.trim() !== '');
      const next = nextAt < 0 ? '' : lines[nextAt]!;
      const nextOpens = next === '' || junkNumberSkipped || isDateLine(next) || HEADING_RE.test(next) || isHeading(next)
        || PART_HEADING_RE.test(next) || HEADING_CONTINUATION_RE.test(next.trim())
        || SUB_ITEM_RE.test(next) || (volume === 1 && NESTED_TOC_HEADINGS.has(normaliseHeading(next)))
        || (nextAt >= 0 && isBlankDatedEntry(nextAt)) || (columnar && TRANSLATION_RE.test(next));
      if (tight && nextOpens && Number(tight[1]) < 1500) { pageMatch = tight; pageTail = tight[0].length - tight[0].search(/ \d{1,4}[.,]?$/); }
    }
    if (!pageMatch) {
      // The volumes' letters to several addressees run to sixteen lines (AAS 46 (1954)
      // 787, *Quamquam*, eight abbots general).
      if (open.lines.length > (columnar ? 20 : 8)) flushDefect();
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
    // The layout mode's runs of spaces are positional and mean nothing; a stray mark the
    // OCR set before the incipit (`.Mirabilis Deus. -`, AAS 25 (1933) 518) is not text.
    if (columnar) entryText = entryText.replace(/\s{2,}/g, ' ').replace(/^[.•*'"]+(?=[A-Z«])/, '');
    let entryDate = open.date;
    let entryPope = open.pope;
    // An entry with no date column that dates itself in its description -- Pius XII's
    // radio messages of 1939 (`Con inmenso gozo. - A Ssmo D. N. Pio … ad universos
    // Hispaniae christifideles datus, die 16 mensis Aprilis, anno 1939`, AAS 31 (1939)
    // 740) -- takes that printed date rather than the entry's before it.
    const formula = open.blankDated ? entryText.match(/\bdie (\d{1,2}|[ivxl]{1,6}) (?:mensis )?([A-Z][a-z]{2,10}),? (?:mensis,? )?anno (\d{4})\b/) : null;
    if (formula) {
      const d = /^\d/.test(formula[1]!) ? Number(formula[1]) : romanToInt(formula[1]!);
      const m = monthOf(formula[2]!, true);
      if (m !== undefined && d >= 1 && d <= 31) entryDate = `${formula[3]}-${pad(m)}-${pad(d)}`;
    }
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
    // The entry whose own line carried a repaired year: the dittos after it inherit its
    // reference, so that one curated confirmation of this entry confirms the chain.
    if (open.state !== undefined && open.state.note !== undefined && open.state.noteRef === undefined) open.state.noteRef = `${year}:${page}`;
    if (categoryForHeading(open.category) === null) unseen.add(`${open.pope}: ${open.category}`);
    if (entryDate.length === 7) stats.monthOnly++;
    stats.entries++;
    if ((categoryForHeading(open.category)?.harvested ?? 'no') !== 'no') stats.harvestedEntries++;
    result.entries.push({
      series: 'AAS', volume, year, ...(opts.part ? { part: opts.part } : {}), page,
      pope: entryPope, category: open.category, date: entryDate, ...(open.note ? { dateNote: open.note } : {}), ...(open.state?.noteRef ? { dateNoteRef: open.state.noteRef } : {}),
      ...splitEntryText(entryText, { bareIncipits, constitution: categoryForHeading(open.category)?.classes.some((c) => c.requires === 'apostolic-constitution') ?? false }),
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
