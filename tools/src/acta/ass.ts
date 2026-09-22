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
const FR_MONTHS: Readonly<Record<string, number>> = {
  janvier: 1, février: 2, fevrier: 2, mars: 3, avril: 4, mai: 5, juin: 6, juillet: 7, août: 8, aout: 8, septembre: 9, octobre: 10, novembre: 11, décembre: 12, decembre: 12,
};

/**
 * The date of an ASS act from its own dateline, on top of `latinDate` (recover.ts): the
 * ASS abbreviates `anno` to `An.`, `an.`, `ann.` and `a.` before the year (`die i Novembris
 * An. MDCCCC`, `die xxv Iunii a. MDCCCCV`), and its OCR misreads letters of the roman
 * numerals (ROMAN_OCR) -- both repaired in the text before `latinDate` reads it, the numeral
 * repair on numeral-shaped tokens after `die`, `anno`/`an.`/`a.` and the month only. An
 * Italian dateline (`Dal Vaticano, 20 Settembre 1900`) and a French one (`Donné à Rome, 17
 * Mai de l'année 1908`) are read by their own month tables. A year more
 * than ten years before the volume's first year, or after its last year plus one, is
 * rejected: the ASS reprint an act years late (ASS 41 (1908) prints nine letters of 1905 at
 * pp. 12-20), never early; the bound is what stops an OCR-mangled year becoming a value.
 * Null when no readable date; the caller reports a defect.
 */
export function assDate(text: string, span: { from: number; to: number }): string | null {
  // The `Pontificatus Nostri …` tail is dropped before the year is read: the pontificate's
  // own year in roman numerals (`Pontificatus Nostri anno XIII`, ASS 23 (1890) 437, 518;
  // `anno XXIII`, ASS 33) is otherwise the first `anno …` numeral `latinDate` finds, and 13
  // is no year.
  const t0 = text.replace(/­/g, '').replace(/\s+/g, ' ').replace(/Pontificatus\s+[NÑ]ostri[\s\S]*$/i, '');
  // A signed dateline without the `Datum Romae` anchor latinDate reads from (`Ex aedibus
  // Vaticanis, die 9 Iulii 1908.`, ASS 41 (1908) 621) is given one.
  const t = /Datum [REB]omae/.test(t0) ? t0 : `Datum Romae ${t0}`;
  const inSpan = (iso: string | null): string | null => {
    if (iso === null) return null;
    const y = Number(iso.slice(0, 4));
    return y >= span.from - 10 && y <= span.to + 1 ? iso : null;
  };
  // Latin: normalise `An.`/`an.`/`ann.`/`a.` to `anno` (ASS 12 (1879) 115, 228; ASS 33 (1900)
  // 129; ASS 41 (1908) 193); drop the stop the early volumes print after the day (`die
  // III. Martii`, ASS 23 (1890) 518; `die XII. / Februarii`, ASS 1 (1865) 581); spell the
  // year 1900 additively (`MCM` → `MDCCCC`, ASS 33 (1900) 129, 348: latinDate reads a roman
  // year of four letters or more, and 1900 is the one year of the series three letters
  // spell); repair the day token after `die` (pass 1) and any numeral-shaped token of four
  // letters or more that needs a repair (pass 2: a year -- `MDCGCC`, `MCMVHI`; two passes,
  // since one global regex would consume `Novembris anno` and skip the year after it).
  // Pass 2 is *not* guarded by "no Latin word is spelt in these letters": `nihil`, `mihi`
  // and `hinc` are, and each would be rewritten. What bounds it is where it runs and what
  // reads the result. It runs over a dateline alone, whose `Pontificatus Nostri …` tail is
  // already stripped above, so the words it can meet are the dating formula's; and
  // `latinDate` takes a repaired token only in the day and year positions of that formula,
  // after which `inSpan` rejects any year outside the volume's span. A word rewritten
  // anywhere else in the line is never read (`Datum Romae apud S. Petrum, nihil, die 3 Maii
  // 1900.` still reads 1900-05-03).
  const needsRepair = /[ghnìíîïj]/i;
  // The trailing `\b` a plain ASCII word boundary would use breaks a token at an accented
  // letter (`Ì`, not a `\w` character to the engine), truncating `MCMVIÌI` to `MCMVI` before
  // the repair ever sees the rest of it (ASS 41 p. 491): the boundary is written out against
  // the same letter set the token itself admits, so it does not end early on one of them.
  const NOT_ROMAN_LETTER = 'A-Za-zìíîïÌÍÎÏ';
  const latin = t
    .replace(/\b(?:An|an|ann|a)\.\s+(?=[MDCLXVIGHNmdclxvighn])/g, 'anno ')
    .replace(/\b(die\s+[A-Za-zìíîï0-9]{1,6})\.\s+(?=[A-Za-z])/g, '$1 ')
    .replace(/\bMCM\b/g, 'MDCCCC')
    .replace(/\b(die)\s+([A-Za-zìíîï]{1,6})\b/g, (m, lead: string, tok: string) => (ROMAN_TOKEN.test(tok) && needsRepair.test(tok) ? `${lead} ${repairRoman(tok)}` : m))
    .replace(new RegExp(`(?<![${NOT_ROMAN_LETTER}])([MDCLXVIGHNmdclxvighnìíîïÌÍÎÏj]{4,})(?![${NOT_ROMAN_LETTER}])`, 'g'), (tok: string) => (needsRepair.test(tok) && /^[mdclxvi]+$/.test(repairRoman(tok)) ? repairRoman(tok) : tok));
  const fromLatin = inSpan(latinDate(latin));
  if (fromLatin !== null) return fromLatin;
  // Italian: `Dal Vaticano, 20 Settembre 1900` / `Dato a Roma presso S. Pietro, li 15 Ottobre
  // 1890` (ASS 23 (1890) 129) / `Dato a Roma, presso S. Pietro, il giorno 28 marzo dell'anno
  // 1901` (ASS 33 (1900) 641; `il giorno 11 Giugno 1901`, 715).
  // The French `Donné à Rome, 17 Mai de l'année 1908` (ASS 41 (1908) 364; `de l'année 1901`, ASS 33 (1900) 722; `de l'an 1900`, ASS 33 363) by the same rule with its own months.
  const it = t.match(/\b(?:Dal|Dalle|Dato|Data|Roma|Vaticano|Rome)\b.{0,80}?\b(?:li|il giorno|il|addì|le)?\s*(\d{1,2})\s+([A-Za-zÀ-ÿ]+)\s+(?:dell[’']anno\s+|de l[’']an(?:née)?\s+)?(\d{4})/);
  if (it) {
    const month = IT_MONTHS[it[2]!.toLowerCase()] ?? FR_MONTHS[it[2]!.toLowerCase()];
    const day = Number(it[1]);
    if (month !== undefined && day >= 1 && day <= 31) return inSpan(`${it[3]}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  }
  return null;
}

// --- anchors -------------------------------------------------------------------------------

/** The pope's own dateline: the anchor, then `Pontificatus Nostri` within the next three lines (a dicastery's `Datum Romae ex Secretaria …` has none). */
const DATUM_RE = /Dat(?:um|\.)\s+[REB]om[ae]{1,2}|\bDat[oa]\s+(?:a|in)\s+Roma|\bDal\s+Vaticano|\bDal\s+Palazzo/;
/**
 * The dateline of the pope's private letters, which print no `Pontificatus Nostri`: the
 * place and date, then the pope's signature within four lines (SIGNATURE_RE). The rule
 * rests on the eight anchors it yields in the sample, every one a `Dal` / `Dalle` / `Donné`
 * / `Ex aedibus` line: ASS 33 (1900) 3 (`Dal Vaticano 16 luglio 1900.` / `LEO PP. XIII`),
 * 198 (`Dal Vaticano li 19 agosto 1900.` / `LEO PP. XIIL`), 363 (`Donné à Rome, près de
 * Saint-Pierre, le 23 Décembre de / l'an 1900`, the year on the next line, / `LEO PP.
 * XIII.`), 722 (`Donné à Rome près Saint Pierre le 29 Juin de l'année 1901,` / `LEON XIII
 * PAPE.`); ASS 41 (1908) 19 (`Dalle stanze del Vaticano, il 23 Giugno 1905.` / `PIUS PP.
 * X`), 364 (`Donné à Rome, 17 Mai de l'année 1908`), 615 (`Dal Vaticano, li 9 Maggio
 * 1908.`), 621 (`Ex aedibus Vaticanis, die 9 Iulii 1908.`). A `Datum Romae` without
 * `Pontificatus Nostri` is a dicastery's (spec §3) and is not admitted here. (`Romae ex
 * Aedibus Vaticanis, die Pentecostes, 1 Iunii 1879.`, ASS 12 (1879) 12, prints no
 * signature within four lines and stays a reading.)
 */
const SIGNED_DATELINE_RE = /^\s*(?:Dal\s+Vaticano|Dalle\s+stanze|(?:Romae\s+)?[Ee]x\s+[Aa]edibus\s+Vaticanis|Donné\s+à\s+Rome)\b/;
/** The signature: `PIUS PP. X` (ASS 41 (1908) 19), `LEO PP. XIII` (ASS 33 (1900) 3), the OCR's `LEO PP. XIIL` (ASS 33 198), the French letters' `LEON XIII PAPE.` (ASS 33 722). */
const SIGNATURE_RE = /^\s*(?:(?:LEO|PIUS)\s+PP\.?\s*(?:X-?[Il1L]{3,4}|IX|X)|LEON\s+XIII\s+PAPE)\.?\s*$/;
/** `Pontificatus Nostri`, the ASS's `Pontificatus nostri` (ASS 23 (1890) 222; ASS 41 (1908) 297; ASS 1 (1865)). */
const PONTIFICATUS_RE = /Pontificatus\s+[NnÑ]ostri|(?:del|Del)\s+Nostro\s+Pontificato/;

/**
 * The class headings a papal act opens with in the ASS, longest first so that `EPISTOLA
 * ENCYCLICA` is read before `EPISTOLA` (spec §3; extended only by what a sample volume
 * prints, each addition quoted). The tail `in forma Brevis` is not one of them but an
 * optional group of HEADING_RE below, which reads its `B` in either case because the
 * sample prints both: `LITTERAE in forma Brevis` (ASS 33 (1900) 3, 129, 198, 577) and
 * `LITTERAE in forma brevis Sanctissimi D. N. Leonis XIII quibus indulgen-/tiae
 * conceduntur` (ASS 23 (1890) 437, the one line of the five volumes that prints it so).
 */
export const CLASS_HEADINGS: readonly string[] = [
  'EPISTOLA ENCYCLICA', 'LITTERAE ENCYCLICAE', 'LITTERAE APOSTOLICAE',
  'CONSTITUTIO APOSTOLICA', 'MOTU PROPRIO', 'ALLOCUTIO', 'EXHORTATIO',
  // The sample heads the chirograph `CHIROGRAPHUM` (ASS 33 (1900) 714, and the summa's row
  // `Chirographum SS. D. N. Leonis XIII`); no ASS volume of the sample prints the singular
  // `CHIROGRAPHUS`, which the AAS volumes of 1933-1955 do (categories.ts's Chirographa row;
  // the fixtures aas-25-1933, aas-34-1942 and aas-35-1943 print it). Both forms are listed:
  // the -US form is the sister series' own spelling, not a guess, and 2c-ii will say whether
  // any ASS volume prints it.
  'CHIROGRAPHUM', 'CHIROGRAPHUS', 'BREVE',
  // The Italian acts' headings: `LETTERA Enciclica del Papa Leone XIII ai Vescovi, al Clero e al Popolo d'Italia` (ASS 23 (1890) 193), `LETTERA / DI / SUA SANTITÀ PAPA LEONE XIII` (ASS 12 (1879) 3).
  'LETTERA ENCICLICA', 'LETTERA',
  'LITTERAE', 'EPISTOLA',
];
/** A two-word heading's second word as the volumes set it: in capitals, or in lower case after the caps class word (`LITTERAE Encyclicae`, ASS 23 (1890) 206; `LITTERAE apostolicae`, ASS 23 513; `LETTERA Enciclica`, ASS 23 193). */
const headingPattern = (h: string): string => h.split(' ').map((w, i) => (i === 0 ? w : `(?:${w}|${w[0]}${w.slice(1).toLowerCase()}|${w.toLowerCase()})`)).join('\\s+');
/** The OCR's spellings of a class word, each quoted: `IITTERAE` for `LITTERAE` (ASS 33 (1900) 3, 643; three lines in the sample). */
const HEADING_OCR: readonly [RegExp, string][] = [[/^(\s*)IITTERAE\b/, '$1LITTERAE']];
const HEADING_RE = new RegExp(`^\\s*(?:\\d[\\dOoiIla]{0,3}\\s+)?(?:ACTA ROMANI PONTIFICIS\\s+)?(${CLASS_HEADINGS.map(headingPattern).join('|')})(\\s+in forma [Bb]revis)?\\b\\.?(.*)$`);
/**
 * A page number on a class heading's line, leading (`274 EPISTOLA ENCYCLICA`, ASS 33
 * (1900); `194 ALLOCUTIO SS. D. N. PII PAPAE IX.`, ASS 1 (1865)) or trailing (`LITTERAE
 * 201`, ASS 33; `ALLOCUTIO SS. D. N. PII PAPAE IX. 195`, ASS 1; `MOTU-PROPRIO 525`, ASS
 * 23 (1890)): the line is a running head, never an opening, whatever it names -- the
 * early volumes' running heads carry the pope's name, and a body line naming `Pontifex`
 * (`Benedictus XIII Pontifex Maximus`, ASS 33 p. 201) would otherwise pass the running
 * head as a heading block.
 */
const RUNNING_HEAD_RE = /^\s*[\dOoiIlS][\dOoiIla]{0,3}\s|\s(?=[\dOoiIlS]{0,3}\d)[\dOoiIlS]{1,4}\.?\s*$/;
/** The OCR's accents on a capital (`EPÍSTOLA`, ASS 41 (1908) 299; `XÍII`, ASS 33 (1900) 642), dropped before a heading or a pope is matched; the evidence keeps the line as printed. */
const unaccent = (text: string): string => text.normalize('NFD').replace(/\p{M}/gu, '');
const headingOf = (line: string): RegExpMatchArray | null => HEADING_OCR.reduce((l, [re, to]) => l.replace(re, to), unaccent(line)).match(HEADING_RE);
/**
 * The pope named in a heading block or a salutation: the genitive of the heading
 * (`SANCTISSIMI DOMINI NOSTRI LEONIS XIII`, `SSmi. D. N. Leonis XIII`, `Pii PP. X`, `Leonis
 * Divina Providentia Papae XIII` -- the solemn form of the encyclicals and constitutions,
 * ASS 33 (1900) 341, 385, and of the caps block above the heading, ASS 12 (1879) 97, 225),
 * the nominative of the description (`Qua Pius X laudat`) or of the salutation (`LEO PP.
 * XIII`, `PIUS PP. X`, `LEO EPISCOPUS`), the Italian `LEONE PP. XIII`. The OCR reads
 * `XIII` as `Xlii` (ASS 23 (1890) 526), `Xiil` (ASS 33 449), `XÍII` (ASS 33 642), `Xlil`,
 * `XIIL`, `X-Ill` (the summae): a numeral of `X` and three or four of `I`, `l`, `1`, `L`
 * after an optional hyphen is XIII.
 */
const POPE_RE = /\b(LEONIS|LEO|LEONE|PII|PIUS|PIO)\b\s*(?:PAPAE|PP\.?|Pp\.?|EPISCOPUS|div(?:\.|ina)\s*prov(?:\.|identia)\s*(?:Papae|PP\.?))?\s*(X-?[Il1L]{3,4}|IX|X)\b/i;
const SALUTATION_RE = /^\s*(LEO|PIUS|LEONE|PIO)\s+(PP\.?|PAPA|EPISCOPUS)\b[^\n]{0,40}$/;
/**
 * The addressee, in the dative, set between the by-line and the salutation or the greeting
 * and continued on the lines to the next blank one: `Venerabili Fratri Nostro / Antonino
 * Episcopo Praenestino …` (ASS 12 (1879) 225), `Venerabilibus Fratribus Patriarchis … /
 * Universis Catholici Orbis … / cum Apostolica Sede Habentibus.` (ASS 12 97), `Dilecto Filio
 * Bartholomeo Froget Sodali Dominicano. / Pictavium.` (ASS 33 (1900) 641), `Al Signor
 * Cardinale Mariano Rampolla del Tindaro, / Nostro Segretario di Stato.` (ASS 33 714), `Al
 * diletto Figlio Costanzo Maria Becchi` (ASS 33 641), `AUGUSTISSIMO SERENISSIMOQUE
 * PRINCIPI` (ASS 41 (1908) 18), `A NOS TRÈS CHERS FILS` (ASS 41 361). The vocative of the greeting
 * (`Venerabilis Frater`, `Dilecte Fili`) is not matched: an opening may begin with it
 * (`Venerabilis Frater Augustinus Episcopus Papiae una cum`, ASS 33 198).
 */
const ADDRESSEE_RE = /^\s*(?:Venerabili(?:bus)?\s+Frat|Dilect(?:o|is)\s+Fili|Al\s+(?:Signor|diletto)|Augustissimo|A\s+Nos\s+(?:très\s+)?chers)/i;
/** The addressee set in capitals right after the by-line, with no blank line between (`Qua Pontifex dilaudat … / ricam pro catholico prelo favendo. / VENERABILI FRATRI / OTTOCARO EPISCOPO …`, ASS 41 (1908) 198; `A NOS TRÈS CHERS FILS`, ASS 41 361): where the heading block ends. */
const ADDRESSEE_CAPS_RE = /^\s*(?:VENERABILI(?:BUS)?\s+FRAT|DILECT(?:O|IS)\s+FILI|AL\s+SIGNOR|A\s+NOS\s|AUGUSTISSIMO|SERENISSIMO)/;
/**
 * The greeting, on a line of its own, over two (`Venerabilis Frater et dilecte Fili, /
 * salutem et Apostolicam benedictionem.`, ASS 41 (1908) 198; `Dilecti Filii Nostri ac
 * Venerabiles Fratres, salutem et / Apostolicam benedictionem.`, ASS 41 16) or with the
 * opening after it: `Venerabiles Fratres Salutem et Apostolicam Benedictionem.`, `Dilecte
 * Fili Noster, salutem …`, `Venerabiles Fratres,`, `Signor Cardinale`, a line ending in the greeting (`Augustissime ac
 * serenissima Rex, salutem.`, ASS 41 (1908) 18; `… Imperator, salutem et prosperitatem.`,
 * ASS 41 12), the constitutions' `Ad perpetuam rei memoriam.` (ASS 33 (1900) 341; ASS 41
 * 619) and `SERVUS SERVORUM DEI`; the French letters' `Nos très chers Fils,` (ASS 41 361),
 * `Chers Fils salut et Bénédiction Apostolique.` (ASS 33 716).
 */
const GREETING_RE = /^\s*(?:Venerabil\w+\s+Frat\w+|Dilect\w+\s+Fili\w*|Signor\s+Cardinale|Carissim\w*|Ad perpetuam rei memoriam|Servus Servorum Dei|Salutem|(?:Nos\s+)?(?:très\s+)?chers?\s+Fils|Vénérables?\s+Frères?)(?:\s+(?:Nostr\w+|et|ac|Dilect\w+|Fili\w*|Venerabil\w+|Frat\w+))*\s*[,.]?\s*$|[Bb]enedictionem\.?\s*$|salutem et Apostolicam|\bsalutem\s+et\s*$|\bsalutem\b[^.]*\.\s*$|\bsalut\s+et\s+[Bb]énédiction/i;
/**
 * The greeting set on the opening's own line, the opening after it: `Dilecti filii, salutem
 * et Apostolicam benedictionem. Saecu­` (ASS 33 (1900) 577), `Dilecte Fili, salutem et
 * Apostolicam Benedictionem. — De` (ASS 33 641), `Benedictionem. Praeclarum studium` (ASS
 * 23 (1890) 449). The first two GREETING_RE matches as a greeting, so pastPreamble skips
 * them and readAct finds them among the lines it skipped; the third it does not, so
 * pastPreamble stops there and readAct tests that stop line too (readAct, step 3).
 */
const INLINE_GREETING_RE = /^\s*(.*?\b(?:[Bb]enedictionem|[Bb]énédiction\s+Apostolique)\.)\s*(?:[—–-]\s*)?([A-Za-z«<(].*)$/;
/** A line set in capitals and no lower-case letter (a footnote mark `(i)` aside): the addressee block of ASS 41 (`VENERABILI FRATRI / IOANNI M. FARLEY ARCHIEPISCOPO NEO-EBORACENSIUM / NEO-EBORACUM`, p. 495), the caps by-line of ASS 12 (`AD PATRIARCHAS PRIMATES …`, p. 97; `… SSMI REDEMPTORIS (i).`, p. 273). */
const CAPS_LINE_RE = /^[^a-z]*[A-Z]{2}[^a-z]*$/;
const isCaps = (line: string): boolean => CAPS_LINE_RE.test(line.trim().replace(/\(\w{1,2}\)/g, ''));
/** An allocution's own dating: `in Consistorio secreto diei 16 Decembris 1907`, `die 18 Dec. 1907 habita`. */
const HEADING_DATE_RE = /\bdie[i]?\s+(\d{1,2}|[ivxl]+)\s+([A-Za-z]+)\.?\s+(\d{4})/i;

/** What an act's heading block names that a running head and a body line do not: the pope (POPE_RE), the formula `SSmi D. N.` / `Sanctissimi Domini Nostri`, or `Pontifex` / `SSmus Pater` in the description (`Qua Pontifex mittit Legatum …`, ASS 41 (1908) 65). */
const OPENING_FORMULA_RE = new RegExp(`${POPE_RE.source}|SANCTISSIMI|Sanctissimi|SS(?:MI|mi|ÑI)?\\.?\\s*(?:mi\\.?\\s*)?(?:[DO]\\.?\\s*N\\.|Patris)|\\bPontifex\\b|SS(?:mus|MUS)\\.?\\s+Pater`, 'i');
/** The pope's caps block the early volumes set above the class heading (`SANCTISSIMI DOMINI NOSTRI / LEONIS / DIVINA PROVIDENTIA / PAPAE XIII.` then `EPISTOLA ENCYCLICA.`, ASS 12 (1879) 97, 225, 273, 275, 385, 545; `… PII / DIVINA PROVIDENTIA / PAPAE IX.` then the allocution, ASS 1 (1865) 193): what it names, never `Pontifex`, which the previous act's last lines may carry. */
const ABOVE_FORMULA_RE = /SANCTISSIMI\s+DOMINI\s+NOSTRI|PAPAE\s+(?:X-?[Il1L]{3,4}|IX|X)\b|\b(?:LEONIS|PII)\b/;

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
 * Whether the heading line at `lines[i]` names nothing else of its own and carries no
 * page number: `ALLOCUTIO` alone, versus `274 EPISTOLA ENCYCLICA` -- a running head,
 * whose leading digits `HEADING_RE` swallows into the same uncaptured group as a real
 * heading's own leading whitespace, so its rest-of-line capture (`$3`) is empty too, and
 * the captured groups alone cannot tell the two apart. Only a heading truly alone on its
 * line carries blank lines before its by-line (`ALLOCUTIO`, blank, `SANCTISSIMI DOMINI
 * NOSTRI LEONIS XIII`, ASS 12 (1879) 13; `EPISTOLA ENCYCLICA.`, two blanks, `AD
 * PATRIARCHAS …`, ASS 12 97), which the block reader skips.
 */
const headingAlone = (lines: readonly string[], i: number): boolean => {
  const line = lines[i]!;
  const h = headingOf(line);
  return h !== null && !h[2] && h[3]!.trim() === '' && !RUNNING_HEAD_RE.test(line);
};

/** The blank lines a lone class word is followed by before its by-line (headingAlone), at most three, else none. */
const blanksAfter = (lines: readonly string[], i: number): number => {
  if (!headingAlone(lines, i)) return 0;
  let k = i + 1;
  while (k < lines.length && k <= i + 3 && lines[k]!.trim() === '') k++;
  return k - i - 1;
};

/** The caps lines above a heading, nearest last: the block of ABOVE_FORMULA_RE, bounded at ten lines and stopped by a line of body text (any lower-case letter), a line with a page number, or a caps running head (`ACTA ROMANI PONTIFICIS`, ASS 41; `EX ACTIS CONSISTORIALIBUS`, ASS 1). */
const capsAbove = (lines: readonly string[], i: number): string[] => {
  const out: string[] = [];
  for (let k = i - 1; k >= Math.max(0, i - 10); k--) {
    const l = lines[k]!.trim();
    if (l === '') continue;
    if (!CAPS_LINE_RE.test(l) || RUNNING_HEAD_RE.test(lines[k]!) || /^(?:EX\s|ACTA ROMANI PONTIFICIS$)/.test(l)) break;
    out.unshift(l);
  }
  return out;
};

/**
 * The salutation line after a heading block, or null: from `from`, past the preamble
 * lines (pastPreamble: blanks, greetings, the addressee set in capitals or in the dative
 * with its continuation), within sixteen lines. The acts of ASS 41 set the addressee between the by-line and the
 * salutation (`VENERABILI FRATRI / MARIANO ANTONIO ARCHIEPISCOPO BONAERENSI / BONUM
 * AEREM / PIUS PP. X`, p. 299; pp. 18, 65, 298, 495, 578); ASS 12 (1879) 97 sets seven
 * blank lines and the addressee before `LEO PP. XIII`.
 */
const salutationAfter = (lines: readonly string[], from: number, limit: number): number | null => {
  const k = pastPreamble(lines, from, Math.min(lines.length, from + 16, limit));
  return k < Math.min(lines.length, from + 16, limit) && SALUTATION_RE.test(lines[k]!) ? k : null;
};

/**
 * Whether the class heading at `lines[i]` opens an act. Never a running head
 * (RUNNING_HEAD_RE). Otherwise when its heading block -- the line and the lines after it
 * to the first blank line, four at most (plus the blank lines a bare class word skips
 * before its by-line, headingAlone) -- carries the opening formula (OPENING_FORMULA_RE);
 * or when the caps lines above it do (ABOVE_FORMULA_RE: the early volumes set the pope's
 * name above the class, ASS 12 (1879) 97); or when the salutation follows the block past
 * the preamble (salutationAfter: `MOTU PROPRIO / Quo reformatur Collegium … / Basilicae
 * Lateranensis.` then `PIUS PP. X`, ASS 41 (1908) 34, 35; `CONSTITUTIO APOSTOLICA / De
 * promulgatione legum …` then `PIUS EPISCOPUS`, ASS 41 619; `EXHORTATIO AD CLERUM
 * CATHOLICUM`, ASS 41 555). A running head is followed by body text and fails all three
 * (`274 EPISTOLA ENCYCLICA`; `EPISTOLA ENCYCLICA Hi` for the OCR's 111, ASS 12 (1879)). A
 * body line whose first words the OCR set in capitals as a class word is excluded the
 * same way.
 */
const isOpening = (lines: readonly string[], i: number): boolean => {
  if (!headingOf(lines[i]!) || RUNNING_HEAD_RE.test(lines[i]!)) return false;
  const block: string[] = [lines[i]!];
  let k = i + 1 + blanksAfter(lines, i);
  for (; k < Math.min(lines.length, i + 4 + blanksAfter(lines, i)); k++) {
    if (lines[k]!.trim() === '') break;
    block.push(lines[k]!);
  }
  if (OPENING_FORMULA_RE.test(unaccent(joinBreaks(block)))) return true;
  if (ABOVE_FORMULA_RE.test(capsAbove(lines, i).join(' '))) return true;
  return salutationAfter(lines, k, lines.length) !== null;
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
    if (lines[k]!.trim() === '' || headingOf(lines[k]!)) break;
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
      // The window's line breaks are joined first: the ASS breaks `Pon­ / tificatus` at the
      // line end (ASS 33 (1900) 3, 449; ASS 12 (1879) 481; ASS 23; ASS 41).
      if ((DATUM_RE.test(line) && PONTIFICATUS_RE.test(joinBreaks(lines.slice(i, i + 4))))
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

/**
 * The pope a heading block or salutation names (POPE_RE), or, when it names him without
 * his numeral -- the constitutions' `LEO EPISCOPUS` / `PIUS EPISCOPUS` (ASS 33 (1900)
 * 341, 349; ASS 41 (1908) 619; ASS 23 (1890); ASS 1 (1865)), `LITTERAE SS.mi D. N.
 * Leonis, quibus …` (ASS 33 349) -- the pope of that name reigning in the volume's year
 * (the latest of the name whose pontificate began by the year after it: an act is never
 * printed before its pope's election).
 */
const popeOf = (text: string, year: number): string | null => {
  const m = unaccent(text).match(POPE_RE);
  const name = m ? (m[1]!.toUpperCase().startsWith('L') ? 'LEONIS' : 'PII') : null;
  if (m) {
    const raw = m[2]!.toUpperCase();
    const numeral = raw.startsWith('X') && raw.length >= 4 ? 'XIII' : raw;
    return ACTA_POPES.find((p) => p.genitive === `${name} ${numeral}`)?.pope ?? null;
  }
  // A name a numeral follows that the table lacks (`Leonis XII`, `Pio VII` in a description) is another pope's, and stays unread.
  const bare = unaccent(text).match(/\b(LEONIS|LEO|LEONE|PII|PIUS|PIO)\b(?!\s*(?:PAPAE|PP\.?|Pp\.?|EPISCOPUS)?\s*[IVXL]+\b)/i);
  if (!bare) return null;
  const genitive = bare[1]!.toUpperCase().startsWith('L') ? 'LEONIS' : 'PII';
  const reigning = ACTA_POPES.filter((p) => p.genitive.startsWith(`${genitive} `) && Number(p.began.slice(0, 4)) <= year + 1);
  return reigning.length > 0 ? reigning[reigning.length - 1]!.pope : null;
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
  const h = headingOf(hl[heading.line]!)!;
  const category = normaliseHeading(h[2] ? `${h[1]} in forma Brevis` : h[1]!);
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
  // 6. The page: the PDF page, which the running header must not contradict.
  const header = headerOf(pages[heading.page - 1]!);
  if (!headerAgrees(header, heading.page)) return { defect: { page: heading.page, reason: 'header-mismatch', lines: [header, headingText] } };
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
