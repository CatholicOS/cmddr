const MONTHS: Record<string, number> = {
  gennaio: 1, febbraio: 2, marzo: 3, aprile: 4, maggio: 5, giugno: 6,
  luglio: 7, agosto: 8, settembre: 9, ottobre: 10, novembre: 11, dicembre: 12,
  ianuarii: 1, februarii: 2, martii: 3, aprilis: 4, maii: 5, iunii: 6,
  iulii: 7, augusti: 8, septembris: 9, octobris: 10, novembris: 11, decembris: 12,
  // 'augusto' is neither the Italian 'agosto' nor the Latin 'augusti': it is vatican.va's
  // own typo, printed verbatim as "Si consentanea (17 augusto 1904)" on the Pius X letters
  // shelf. The URL slug for that same item -- .../hf_p-x_let_19040817_si-consentanea.html --
  // confirms 17 August 1904, so the intended month is unambiguous.
  augusto: 8,
  // 'giungo' is not a real Italian word (the month is 'giugno'): it is vatican.va's own
  // typo, printed verbatim as "Inter Suebiae (14 giungo 1920)" on the Benedict XV
  // apost_letters shelf. The item's own URL slug --
  // .../hf_ben-xv_apl_19200614_inter-suebiae.html -- confirms 14 June 1920, so the intended
  // month is unambiguous.
  giungo: 6,
};

// The month/year separator is `\s*` (zero or more spaces), not `\s+`: vatican.va's own
// Benedict XVI apost_constitutions shelf prints 'Kayangana (14 agosto2008)' and John Paul
// II's apost_constitutions shelf prints 'Kumboënsis (18 marzo1982)' -- a missing space
// between month and year in both, not a misspelling like 'augusto'/'giungo' above, so no
// MONTHS alias can fix either. Their own URL slugs --
// .../hf_ben-xvi_apc_20080814_kayangana.html and
// .../hf_jp-ii_apc_19820318_kumboensis.html -- confirm 14 August 2008 and 18 March 1982
// respectively, so the intended dates are unambiguous. Measured across every heading in
// every fixture: exactly these two headings change, plus the title of one already-
// provisional John Paul II record ('Nuovo ordinamento giuridico della Basilica di San
// Nicola di Bari (8 maggio1989)', whose id was already date-based and unaffected). The
// day/month separator stays `\s+` (a real space always appears there in every fixture on
// record), so this cannot swallow a genuinely dateless run of digits immediately after a
// day number. Task 17 review (coordinator, controller-authorised): the middle case moves
// the existing John Paul II id `kumboensis-18-marzo1982-1982` to `kumboensis-1982` --
// intended, since the old id baked the malformed date straight into the identifier.
const PAT = /(\d{1,2})\s*°?\s+([A-Za-zÀ-ÿ]+)\s*(\d{4})/;

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function daysInMonth(month: number, year: number): number {
  const lengths = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return lengths[month - 1]!;
}

/** Parse a printed vatican.va date (Italian or Latin) to ISO YYYY-MM-DD. */
export function parseSourceDate(text: string): string | null {
  const m = text.match(PAT);
  if (!m) return null;
  const month = MONTHS[m[2]!.toLowerCase()];
  if (month === undefined) return null;
  const day = Number(m[1]);
  const year = Number(m[3]);
  if (day < 1 || day > daysInMonth(month, year)) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${m[3]}-${pad(month)}-${pad(day)}`;
}
