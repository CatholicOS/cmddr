const MONTHS: Record<string, number> = {
  gennaio: 1, febbraio: 2, marzo: 3, aprile: 4, maggio: 5, giugno: 6,
  luglio: 7, agosto: 8, settembre: 9, ottobre: 10, novembre: 11, dicembre: 12,
  ianuarii: 1, februarii: 2, martii: 3, aprilis: 4, maii: 5, iunii: 6,
  iulii: 7, augusti: 8, septembris: 9, octobris: 10, novembris: 11, decembris: 12,
};

const PAT = /(\d{1,2})\s*°?\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})/;

/** Parse a printed vatican.va date (Italian or Latin) to ISO YYYY-MM-DD. */
export function parseSourceDate(text: string): string | null {
  const m = text.match(PAT);
  if (!m) return null;
  const month = MONTHS[m[2]!.toLowerCase()];
  if (month === undefined) return null;
  const day = Number(m[1]);
  if (day < 1 || day > 31) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${m[3]}-${pad(month)}-${pad(day)}`;
}
