/**
 * The dates of the *Acta Sanctae Sedis*: the dateline's three Latin spellings, the Italian
 * and French forms the vernacular letters print, and the OCR's readings of a Roman numeral
 * (ass volumes spec §3). Split from ass.ts in phase 2c-ii-a, unchanged: 2c-ii's work is
 * almost entirely adding spellings quoted from a volume, and this is one of the two files
 * that churn while the walk-back algorithm stays fixed.
 */
import { latinDate } from './recover.js';

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
    .replace(/\b(?:[AaÂâ]n{0,2})\.\s+(?=[MDCLXVIGHNmdclxvighn])/g, 'anno ')
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
