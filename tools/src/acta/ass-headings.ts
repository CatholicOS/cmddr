/**
 * What a heading, a salutation, an addressee and a greeting look like in the *Acta Sanctae
 * Sedis* (ass volumes spec §3): the vocabulary the scan walks back to and skips past, with
 * the volume and page that prints each spelling quoted beside it. Split from ass.ts in
 * phase 2c-ii-a, unchanged but for what that phase added there: the ring of the Fisherman
 * (RING_RE) and the brevia's title and salutation (breveTitle, isBreveOpening).
 */
import { ACTA_POPES } from './popes.js';
// A cycle with ass.ts, which imports this module in turn: deliberate, and safe because every
// use of these three is inside a function body, evaluated after both modules have finished
// loading. Nothing here is read at module scope, and nothing added here may be.
import { DATUM_RE, PONTIFICATUS_RE, salutationAfter } from './ass.js';

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
export const SIGNED_DATELINE_RE = /^\s*(?:Dal\s+Vaticano|Dalle\s+stanze|(?:Romae\s+)?[Ee]x\s+[Aa]edibus\s+Vaticanis|Donné\s+à\s+Rome)\b/;
/** The signature: `PIUS PP. X` (ASS 41 (1908) 19), `LEO PP. XIII` (ASS 33 (1900) 3), the OCR's `LEO PP. XIIL` (ASS 33 198), the French letters' `LEON XIII PAPE.` (ASS 33 722). */
export const SIGNATURE_RE = /^\s*(?:(?:LEO|PIUS)\s+PP\.?\s*(?:X-?[Il1L]{3,4}|IX|X)|LEON\s+XIII\s+PAPE)\.?\s*$/;

/**
 * The ring of the Fisherman, which closes a breve where `Pontificatus Nostri` closes an
 * encyclical. The series prints all four capitalisations of the two words, and each is
 * read: `sub annulo Piscatoris` 131 times (ASS 41 (1908) 301; ASS 39 (1906) 531; ASS 25
 * (1892) 15), `sub Annulo Piscatoris` 54 (ASS 1 (1865) 581; ASS 12 (1879) 637; ASS 33
 * (1900) 212, 214), `sub annulo piscatoris` 5 (ASS 9 (1876) 169; ASS 37 (1904) 684) and
 * `sub Annulo piscatoris` once (counted over the 41 volume texts on 2026-09-23). The
 * preposition is not matched, so the OCR's `sdb` for `sub` (ASS 37 (1904) 641) is read like
 * the rest. It is evidence of a class, not of a date: the anchor is still the dateline the
 * ring stands in.
 */
export const RING_RE = /\b[Aa]nnulo\s+[Pp]iscatoris/;

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
export const HEADING_RE = new RegExp(`^\\s*(?:\\d[\\dOoiIla]{0,3}\\s+)?(?:ACTA ROMANI PONTIFICIS\\s+)?(${CLASS_HEADINGS.map(headingPattern).join('|')})(\\s+in forma [Bb]revis)?\\b\\.?(.*)$`);
/**
 * A page number on a class heading's line, leading (`274 EPISTOLA ENCYCLICA`, ASS 33
 * (1900); `194 ALLOCUTIO SS. D. N. PII PAPAE IX.`, ASS 1 (1865)) or trailing (`LITTERAE
 * 201`, ASS 33; `ALLOCUTIO SS. D. N. PII PAPAE IX. 195`, ASS 1; `MOTU-PROPRIO 525`, ASS
 * 23 (1890)): the line is a running head, never an opening, whatever it names -- the
 * early volumes' running heads carry the pope's name, and a body line naming `Pontifex`
 * (`Benedictus XIII Pontifex Maximus`, ASS 33 p. 201) would otherwise pass the running
 * head as a heading block.
 */
export const RUNNING_HEAD_RE = /^\s*[\dOoiIlS][\dOoiIla]{0,3}\s|\s(?=[\dOoiIlS]{0,3}\d)[\dOoiIlS]{1,4}\.?\s*$/;
/** The OCR's accents on a capital (`EPÍSTOLA`, ASS 41 (1908) 299; `XÍII`, ASS 33 (1900) 642), dropped before a heading or a pope is matched; the evidence keeps the line as printed. */
export const unaccent = (text: string): string => text.normalize('NFD').replace(/\p{M}/gu, '');
export const headingOf = (line: string): RegExpMatchArray | null => HEADING_OCR.reduce((l, [re, to]) => l.replace(re, to), unaccent(line)).match(HEADING_RE);
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
export const POPE_RE = /\b(LEONIS|LEO|LEONE|PII|PIUS|PIO)\b\s*(?:PAPAE|PP\.?|Pp\.?|EPISCOPUS|div(?:\.|ina)\s*prov(?:\.|identia)\s*(?:Papae|PP\.?))?\s*(X-?[Il1L]{3,4}|IX|X)\b/i;
export const SALUTATION_RE = /^\s*(LEO|PIUS|LEONE|PIO)\s+(PP\.?|PAPA|EPISCOPUS)\b[^\n]{0,40}$/;
/**
 * The addressee, in the dative, set between the by-line and the salutation or the greeting
 * and continued on the lines to the next blank one: `Venerabili Fratri Nostro / Antonino
 * Episcopo Praenestino …` (ASS 12 (1879) 225), `Venerabilibus Fratribus Patriarchis … /
 * Universis Catholici Orbis … / cum Apostolica Sede Habentibus.` (ASS 12 97), `Dilecto Filio
 * Bartholomeo Froget Sodali Dominicano. / Pictavium.` (ASS 33 (1900) 641), `Al Signor
 * Cardinale Mariano Rampolla del Tindaro, / Nostro Segretario di Stato.` (ASS 33 714), `Al
 * diletto Figlio Costanzo Maria Becchi` (ASS 33 641), `AUGUSTISSIMO SERENISSIMOQUE
 * PRINCIPI` (ASS 41 (1908) 18), `A NOS TRÈS CHERS FILS` (ASS 41 361), `Dilecto in Christo
 * Filio Nostro / Alphonso XIII Hispaniarum Regi Catholico.` (ASS 35 (1902) 562, where the
 * two words stand apart). The vocative of the greeting
 * (`Venerabilis Frater`, `Dilecte Fili`) is not matched: an opening may begin with it
 * (`Venerabilis Frater Augustinus Episcopus Papiae una cum`, ASS 33 198).
 */
export const ADDRESSEE_RE = /^\s*(?:Venerabili(?:bus)?\s+Frat|Dilect(?:o|is)\s+(?:in\s+Christo\s+)?Fili|Al\s+(?:Signor|diletto)|Augustissimo|A\s+Nos\s+(?:très\s+)?chers)/i;
/**
 * The greeting, on a line of its own, over two (`Venerabilis Frater et dilecte Fili, /
 * salutem et Apostolicam benedictionem.`, ASS 41 (1908) 198; `Dilecti Filii Nostri ac
 * Venerabiles Fratres, salutem et / Apostolicam benedictionem.`, ASS 41 16) or with the
 * opening after it: `Venerabiles Fratres Salutem et Apostolicam Benedictionem.`, `Dilecte
 * Fili Noster, salutem …`, `Venerabiles Fratres,`, `Signor Cardinale`, a line ending in the greeting (`Augustissime ac
 * serenissima Rex, salutem.`, ASS 41 (1908) 18; `… Imperator, salutem et prosperitatem.`,
 * ASS 41 12), the constitutions' `Ad perpetuam rei memoriam.` (ASS 33 (1900) 341; ASS 41
 * 619) with the brevia's `Ad futuram rei memoriam.` beside it (ASS 36 (1903) 17, 660; ASS
 * 40 (1907) 397, 455; the caps `AD FUTURAM REI MEMORIAM`, ASS 41 (1908) 300), and `SERVUS
 * SERVORUM DEI`; the French letters' `Nos très chers Fils,` (ASS 41 361),
 * `Chers Fils salut et Bénédiction Apostolique.` (ASS 33 716).
 */
export const GREETING_RE = /^\s*(?:Venerabil\w+\s+Frat\w+|Dilect\w+\s+Fili\w*|Signor\s+Cardinale|Carissim\w*|Ad (?:perpetuam|futuram) rei memoriam|Servus Servorum Dei|Salutem|(?:Nos\s+)?(?:très\s+)?chers?\s+Fils|Vénérables?\s+Frères?)(?:\s+(?:Nostr\w+|et|ac|Dilect\w+|Fili\w*|Venerabil\w+|Frat\w+))*\s*[,.]?\s*$|[Bb]enedictionem\.?\s*$|salutem et Apostolicam|\bsalutem\s+et\s*$|\bsalutem\b[^.]*\.\s*$|\bsalut\s+et\s+[Bb]énédiction/i;
/**
 * The greeting set on the opening's own line, the opening after it: `Dilecti filii, salutem
 * et Apostolicam benedictionem. Saecu­` (ASS 33 (1900) 577), `Dilecte Fili, salutem et
 * Apostolicam Benedictionem. — De` (ASS 33 641), `Benedictionem. Praeclarum studium` (ASS
 * 23 (1890) 449). The first two GREETING_RE matches as a greeting, so pastPreamble skips
 * them and readAct finds them among the lines it skipped; the third it does not, so
 * pastPreamble stops there and readAct tests that stop line too (readAct, step 3).
 */
export const INLINE_GREETING_RE = /^\s*(.*?\b(?:[Bb]enedictionem|[Bb]énédiction\s+Apostolique)\.)\s*(?:[—–-]\s*)?([A-Za-z«<(].*)$/;
/** A line set in capitals and no lower-case letter (a footnote mark `(i)` aside): the addressee block of ASS 41 (`VENERABILI FRATRI / IOANNI M. FARLEY ARCHIEPISCOPO NEO-EBORACENSIUM / NEO-EBORACUM`, p. 495), the caps by-line of ASS 12 (`AD PATRIARCHAS PRIMATES …`, p. 97; `… SSMI REDEMPTORIS (i).`, p. 273). */
const CAPS_LINE_RE = /^[^a-z]*[A-Z]{2}[^a-z]*$/;
export const isCaps = (line: string): boolean => CAPS_LINE_RE.test(line.trim().replace(/\(\w{1,2}\)/g, ''));

/** What an act's heading block names that a running head and a body line do not: the pope (POPE_RE), the formula `SSmi D. N.` / `Sanctissimi Domini Nostri`, or `Pontifex` / `SSmus Pater` in the description (`Qua Pontifex mittit Legatum …`, ASS 41 (1908) 65). */
export const OPENING_FORMULA_RE = new RegExp(`${POPE_RE.source}|SANCTISSIMI|Sanctissimi|SS(?:MI|mi|ÑI)?\\.?\\s*(?:mi\\.?\\s*)?(?:[DO]\\.?\\s*N\\.|Patris)|\\bPontifex\\b|SS(?:mus|MUS)\\.?\\s+Pater`, 'i');
/** The pope's caps block the early volumes set above the class heading (`SANCTISSIMI DOMINI NOSTRI / LEONIS / DIVINA PROVIDENTIA / PAPAE XIII.` then `EPISTOLA ENCYCLICA.`, ASS 12 (1879) 97, 225, 273, 275, 385, 545; `… PII / DIVINA PROVIDENTIA / PAPAE IX.` then the allocution, ASS 1 (1865) 193): what it names, never `Pontifex`, which the previous act's last lines may carry. */
export const ABOVE_FORMULA_RE = /SANCTISSIMI\s+DOMINI\s+NOSTRI|PAPAE\s+(?:X-?[Il1L]{3,4}|IX|X)\b|\b(?:LEONIS|PII)\b/;

/** The blank lines a lone class word is followed by before its by-line (headingAlone), at most three, else none. */
export const blanksAfter = (lines: readonly string[], i: number): number => {
  if (!headingAlone(lines, i)) return 0;
  let k = i + 1;
  while (k < lines.length && k <= i + 3 && lines[k]!.trim() === '') k++;
  return k - i - 1;
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

/** The caps lines above a heading, nearest last: the block of ABOVE_FORMULA_RE, bounded at ten lines and stopped by a line of body text (any lower-case letter), a line with a page number, or a caps running head (`ACTA ROMANI PONTIFICIS`, ASS 41; `EX ACTIS CONSISTORIALIBUS`, ASS 1). */
export const capsAbove = (lines: readonly string[], i: number): string[] => {
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
export const isOpening = (lines: readonly string[], i: number): boolean => {
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

/** How many lines a breve's title runs to: four in the volumes that print the longest of them (`Breve SS. D. N. Pii div. prov. PP. X quo sacerdotibus qui / operam suam impendent pio Operi Propagationis Fidei / facultas benedicendi Rosaria eisque adnectendi indulgen- / tias a Patribus Crucigeris appellatas conceditur.`, ASS 41 (1908) 301; `Litterae in forma Brevis quibus SSmus D. N. Antistites qui …`, four lines, ASS 3 (1867) 157). Five is the bound, and what runs longer is the body of the act above, not a title. */
const BREVE_TITLE_LINES = 5;

/**
 * The descriptive title a breve prints where a class word should stand, as the index of
 * its first line, or null when none stands above the pope's own name at `lines[s]`.
 *
 * It is the run of non-blank lines above the salutation, past at most four blank lines
 * (`Indulgentia toties quoties pro visitantibus ecclesias congre­ / gationis SS. Sacramenti
 * in festo Corporis Christi.`, blank, `PIUS PP. X`, ASS 41 (1908) 300; the volumes of Pius
 * X set none between the two, ASS 37 (1904) 367, 684; ASS 38 (1905) 140 sets two above the
 * title). Three things are not a title and end the reading, each of which stands exactly
 * where a title would:
 *   - a run longer than BREVE_TITLE_LINES, which is the previous act's last paragraph and
 *     not a title (`… ut patet ex sequentibus Apostolicis Literis in earum favorem datis
 *     (1).`, seven lines over `PIUS PP. IX.`, ASS 2 (1867) 181);
 *   - a run carrying a dateline or a pontificate's year, which is the previous act's close
 *     with the pope's signature under it and no act of its own between (`Datum Romae apud
 *     S. Petrum, die xxiv Aprilis MCMVIII, / Pontificatus Nostri anno quinto.` over `PIUS
 *     PP. X`, ASS 41 (1908) 300; `Pontificatus Nostri Anno XXIII.` alone, ASS 4 (1868) 553);
 *   - a page number, which bounds the run from above rather than ending it, since what
 *     stands over a page number is another page's (`1.` set between the two lines of the
 *     title, ASS 9 (1876) 279, where the title is read from the line under it).
 *
 * An addressee (ADDRESSEE_RE) is passed over rather than read: the volumes that set
 * one between the title and the pope's name set the title above it (`PROROGATIO privilegii
 * Bullae Cruciatae pro Ditione Hispanica,` over `Dilecto in Christo Filio Nostro /
 * Alphonso XIII Hispaniarum Regi Catholico.` over `LEO PP. XIII.`, ASS 35 (1902) 562).
 * One is passed over, not two: what stands two blocks above an addressee is the previous
 * act's.
 */
export const breveTitle = (lines: readonly string[], s: number): number | null => {
  for (let below = s, hops = 0; hops < 2; hops++) {
    const run = titleAbove(lines, below);
    if (run === null || !ADDRESSEE_RE.test(lines[run]!)) return run;
    below = run;
  }
  return null;
};

/** One block above `below`: the run of non-blank lines past at most four blank ones, or null when what stands there is none of a title's shapes (breveTitle). */
const titleAbove = (lines: readonly string[], below: number): number | null => {
  let end = below - 1;
  for (let blanks = 0; end >= 0 && lines[end]!.trim() === ''; end--, blanks++) if (blanks >= 4) return null;
  if (end < 0) return null;
  let start = end;
  while (start > 0 && lines[start - 1]!.trim() !== '' && !RUNNING_HEAD_RE.test(lines[start - 1]!)) {
    if (end - start + 1 >= BREVE_TITLE_LINES) return null;
    start--;
  }
  if (RUNNING_HEAD_RE.test(lines[start]!)) return null;
  if (lines.slice(start, end + 1).some((l) => DATUM_RE.test(l) || PONTIFICATUS_RE.test(l))) return null;
  return start;
};

/**
 * Whether a breve opens at `lines[i]`, where the pope's own name stands alone as it does
 * over every breve of the *Secretaria Brevium* (`PIUS PP. X`, ASS 41 (1908) 300; `LEO PAPA
 * XIII.`, ASS 25 (1892) 15; `PIUS PP. IX.`, ASS 9 (1876) 279) with the descriptive title
 * above it (breveTitle). It is the second reading of readAct's walk-back and is tried only
 * where the act closes under the ring (RING_RE) and no class heading stands behind it.
 *
 * This is what tells the pope's breve from a dicastery's own act, which the summa files
 * under the same heading `EX SECRETARIA BREVIUM`: a cardinal signs his act in his own name
 * (`Ex Secretaria eiusdem S. C. die 6 Maii 1876.` / `Dominicus Sarra, Substitutus.`, ASS 9
 * (1876) 280), which is no pope's name and no salutation, and his countersignature of a
 * breve (`Pro Dno Card. MACCHI`, ASS 41 (1908) 301; `F. Card. ASQUINIUS.`, ASS 9 280)
 * stands under the dateline, never over the act where the pope's name stands.
 */
export const isBreveOpening = (lines: readonly string[], i: number): boolean =>
  SALUTATION_RE.test(lines[i]!) && breveTitle(lines, i) !== null;

/**
 * The lines quoted from `start` on -- a dateline, or the lines above an anchor with no
 * heading before it -- stopping at a blank line or the next act's heading, capped at
 * `max`: shared by the dateline extraction (readAct), the anchor's own quoted text
 * (findAnchors) and the `no-heading` defect's lines (readAct), so a run-on page (two acts
 * with no blank between them, ASS 41 (1908); an anchor with nothing above it) is bounded
 * the same way everywhere the body is quoted.
 */
export const quotedLines = (lines: readonly string[], start: number, max = 3): string[] => {
  const out: string[] = [lines[start]!];
  for (let k = start + 1; k < Math.min(lines.length, start + max); k++) {
    if (lines[k]!.trim() === '' || headingOf(lines[k]!)) break;
    out.push(lines[k]!);
  }
  return out;
};

/**
 * The pope a heading block or salutation names (POPE_RE), or, when it names him without
 * his numeral -- the constitutions' `LEO EPISCOPUS` / `PIUS EPISCOPUS` (ASS 33 (1900)
 * 341, 349; ASS 41 (1908) 619; ASS 23 (1890); ASS 1 (1865)), `LITTERAE SS.mi D. N.
 * Leonis, quibus …` (ASS 33 349) -- the pope of that name reigning in the volume's year
 * (the latest of the name whose pontificate began by the year after it: an act is never
 * printed before its pope's election).
 */
export const popeOf = (text: string, year: number): string | null => {
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
export const joinBreaks = (lines: readonly string[]): string => lines.join('\n').replace(/­\s*\n\s*/g, '').replace(/([a-z])-\s*\n\s*([a-z])/gi, '$1$2').replace(/\s+/g, ' ').trim();
