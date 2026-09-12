/**
 * What a *Messaggi* series heading prints, and nothing more (messages spec §2.3, §3.2).
 *
 *   LVIII Giornata Mondiale della Pace 2025 - "Rimetti a noi i nostri debiti…"
 *   Messaggio per la 110ª Giornata Mondiale del Migrante e del Rifugiato 2024
 *   Messaggio del Santo Padre per l'XI Giornata Mondiale di Preghiera per la Cura del Creato [1° settembre 2026]
 *   Quaresima 2015: Rinfrancate i vostri cuori (Gc 5,8)
 *
 * The **ordinal** is the token immediately before the word `Giornata` -- a Roman numeral at
 * the head of the title on most numbered series, an Arabic one with a suffix (`110ª`, `62a`,
 * `100ma`) on migration, vocations and Leo XIV's mission shelf, and after "per la"/"per l'"
 * where the heading opens "Messaggio…". A token in that position that is neither (`XXXIIII`,
 * `IX-X`) is reported as unreadable, never guessed at; a heading with no such token has no
 * ordinal, and none is ever computed from the series' first year (§3.2.4).
 *
 * The **occasion year** is the one four-digit year the title prints (the date parenthetical
 * having already been split off by the shelf parser). A title printing none, or printing two
 * different ones (`2022-2023`, `1993-1994`), yields nothing: it is never read off `date`,
 * which is the signing date and routinely falls in the preceding year (§3.2.5), and is left
 * to a curated row instead.
 */

export type OrdinalReading =
  | { kind: 'read'; value: number; form: 'roman' | 'arabic'; printed: string }
  | { kind: 'unreadable'; printed: string }
  | { kind: 'none' };

/** Strict Roman numerals only (`IIII`, `XXXX` and `IX-X` are not numerals). */
const ROMAN = /^(?=[MDCLXVI])M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/;
const ROMAN_VALUES: Record<string, number> = { M: 1000, D: 500, C: 100, L: 50, X: 10, V: 5, I: 1 };

/** Arabic with the Italian ordinal suffixes the shelves print: `110ª`, `62a`, `100ma`, `1°`. */
const ARABIC = /^(\d{1,3})(?:ª|º|°|a|ma)?$/;

export function romanToInt(roman: string): number | null {
  if (!ROMAN.test(roman)) return null;
  let total = 0;
  for (let i = 0; i < roman.length; i++) {
    const v = ROMAN_VALUES[roman[i]!]!;
    const next = i + 1 < roman.length ? ROMAN_VALUES[roman[i + 1]!]! : 0;
    total += v < next ? -v : v;
  }
  return total;
}

/**
 * The token standing immediately before `Giornata` (case-insensitive), with a leading
 * elided article stripped (`l'XI` -> `XI`). Word characters only on the left, so
 * `«Giornata` or `della Giornata` yield `«`/`della`, which are then simply not numerals.
 */
const BEFORE_GIORNATA = /(?:^|\s)(?:l['’])?(\S+)\s+Giornata\b/i;

export function readOrdinal(title: string): OrdinalReading {
  const m = title.match(BEFORE_GIORNATA);
  if (!m) return { kind: 'none' };
  const token = m[1]!;
  const roman = romanToInt(token);
  if (roman !== null) return { kind: 'read', value: roman, form: 'roman', printed: token };
  const arabic = token.match(ARABIC);
  if (arabic) return { kind: 'read', value: Number(arabic[1]), form: 'arabic', printed: token };
  // Anything that *looks* like a numeral but is not one -- letters from the Roman alphabet
  // only, or digits with a stray suffix, or two numerals joined by a dash -- is a printed
  // ordinal the parser cannot read and must be reported. An ordinary word ('della',
  // 'Messaggio') is simply the absence of an ordinal.
  if (/^[IVXLCDM]+(?:-[IVXLCDM]+)?$/.test(token) || /^\d/.test(token)) {
    return { kind: 'unreadable', printed: token };
  }
  return { kind: 'none' };
}

export type YearReading =
  | { kind: 'read'; value: number }
  | { kind: 'none' }
  | { kind: 'ambiguous'; printed: number[] };

const YEAR = /(?<!\d)(1[89]\d{2}|20\d{2})(?!\d)/g;

export function readOccasionYear(title: string): YearReading {
  const years = [...new Set([...title.matchAll(YEAR)].map((m) => Number(m[1])))];
  if (years.length === 0) return { kind: 'none' };
  if (years.length > 1) return { kind: 'ambiguous', printed: years };
  return { kind: 'read', value: years[0]! };
}
