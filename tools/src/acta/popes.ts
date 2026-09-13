/**
 * The popes of the AAS chronological index (acta volumes spec §2): the part heading names
 * the pope in the Latin genitive -- *I. — ACTA PII PP. X.* (1909), *I - ACTA IOANNIS PP.
 * XXIII* (1958), *III - ACTA IOANNIS PAULI PP. II* (1978), *I – ACTA FRANCISCI PP.* (2023)
 * -- and this table maps each genitive to the CRPDR issuer id, the nominative label the
 * parser and the report use, and the first day of the pontificate (the creator holds an
 * entry dated before it: an earlier pontificate's act printed in the volume, create.ts).
 * A heading the table does not list is reported by the parser (`unmappedPopes`) and its
 * entries are skipped by the matcher (`unknownPope`), never guessed at.
 *
 * The heading is read as `ACTA {name words} [PP.] [numeral]`, and the key is the name
 * words and the numeral with the `PP.` dropped: `PII X`, `IOANNIS PAULI II`, `FRANCISCI`.
 * Election dates are CRPDR's (vendor/crpdr-pontiffs.json carries the ids only; the dates
 * are the conventional ones and are cited beside each row).
 */

export interface ActaPope {
  /** The genitive as the heading prints it, normalised: name words and numeral, no `PP.`. */
  genitive: string;
  /** The nominative label the parser writes on every entry ('Pius X', 'Franciscus'). */
  pope: string;
  issuerId: string;
  /** The first day of the pontificate (election), ISO. */
  began: string;
  /** The genitive as the OCR of a named volume misreads it (`I0A1OTS XXIII`, AAS 51), each quoted beside the row. */
  ocr?: readonly string[];
}

export const ACTA_POPES: readonly ActaPope[] = [
  // `I. — ACTA PII PP. X.` (AAS 1, 1909). Elected 4 August 1903.
  { genitive: 'PII X', pope: 'Pius X', issuerId: 'rp:pius-x', began: '1903-08-04' },
  // `I. - ACTA BENEDICTI PP. XV` (AAS 9-I, 1917). Elected 3 September 1914.
  { genitive: 'BENEDICTI XV', pope: 'Benedictus XV', issuerId: 'rp:benedict-xv', began: '1914-09-03' },
  // `I. - ACTA PII PP. XI` (AAS 23, 1931; AAS 24-31, 1932-1939, with the OCR's `L - ACTA
  // PII PP. XI` in 1935 and 1937). Elected 6 February 1922.
  { genitive: 'PII XI', pope: 'Pius XI', issuerId: 'rp:pius-xi', began: '1922-02-06' },
  // `I - ACTA PII PP. XII` (AAS 50, 1958; AAS 31-49, 1939-1957, where the OCR prints `IV -
  // ACTA PII PP. XII` (1939, after *Acta in morte Pii PP. XI* and *Acta Conclavis*), `1 -
  // ACTA PII PP. XII` (1940), `I - ACTA Pii PP. XII` (1941) and `I - ACTA PII PP. Xll`
  // (1949), which the parser normalises before the lookup, index.ts). Elected 2 March
  // 1939. The 1958 volume's `II - ACTA IN MORTE PII PP. XII` is not a pope part (the name
  // words do not match) and is skipped with the conclave part that follows it.
  { genitive: 'PII XII', pope: 'Pius XII', issuerId: 'rp:pius-xii', began: '1939-03-02' },
  // `IV - ACTA IOANNIS PP. XXIII` (AAS 50, 1958); `II - ACTA IOANNIS PP. XXIII` (AAS 52,
  // 1960, after Pius XII's last acts), `I - ACTA IOANNIS PP. XXIII` (AAS 53-56, 1961-1964).
  // The OCR of AAS 51 (1959) reads the name as `I0A1OTS` (`II - ACTA I0A1OTS PP. XXIII`,
  // p. 933, the part that carries every act of his first full year): listed as an OCR
  // spelling, since no other pope of the AAS bears the numeral XXIII. Elected 28 October 1958.
  { genitive: 'IOANNIS XXIII', pope: 'Ioannes XXIII', issuerId: 'rp:john-xxiii', began: '1958-10-28', ocr: ['I0A1OTS XXIII'] },
  // `I - ACTA PAULI PP. VI` (AAS 70, 1978; AAS 57-69, 1965-1977), `IV - ACTA PAULI PP. VI`
  // (AAS 55, 1963, after *Acta in morte Ioannis PP. XXIII* and *Acta Conclavis*), `II -
  // ACTA PAULI PP. VI` (AAS 56, 1964); AAS 67 (1975) prints `I - ACTA. PAULI PP. VI`, the
  // full stop dropped by the parser. Elected 21 June 1963.
  { genitive: 'PAULI VI', pope: 'Paulus VI', issuerId: 'rp:paul-vi', began: '1963-06-21' },
  // `II - ACTA IOANNIS PAULI PP. I` (AAS 70, 1978). Elected 26 August 1978.
  { genitive: 'IOANNIS PAULI I', pope: 'Ioannes Paulus I', issuerId: 'rp:john-paul-i', began: '1978-08-26' },
  // `III - ACTA IOANNIS PAULI PP. II` (AAS 70, 1978). Elected 16 October 1978.
  { genitive: 'IOANNIS PAULI II', pope: 'Ioannes Paulus II', issuerId: 'rp:john-paul-ii', began: '1978-10-16' },
  // `I – ACTA BENEDICTI XVI` (the 2012 index, and the 2020 index's second part; the 2018,
  // 2020 and 2021 indexes also name him in brackets before an entry, `[Benedictus PP.
  // XVI: 6 Iun. 2010]`, which the parser renders with the same label). Elected 19 April 2005.
  { genitive: 'BENEDICTI XVI', pope: 'Benedictus XVI', issuerId: 'rp:benedict-xvi', began: '2005-04-19' },
  // `I – ACTA FRANCISCI PP.` (2015-2024). Elected 13 March 2013.
  { genitive: 'FRANCISCI', pope: 'Franciscus', issuerId: 'rp:francis-i', began: '2013-03-13' },
];

const BY_GENITIVE = new Map(ACTA_POPES.flatMap((p) => [[p.genitive, p] as const, ...(p.ocr ?? []).map((g) => [g, p] as const)]));
const BY_LABEL = new Map(ACTA_POPES.map((p) => [p.pope, p]));

/** The pope a part heading's genitive names, or null when the table does not list it. */
export const popeForGenitive = (genitive: string): ActaPope | null =>
  BY_GENITIVE.get(genitive.replace(/\s+/g, ' ').trim()) ?? null;

/** The pope an entry's nominative label names, or null. */
export const popeForLabel = (label: string): ActaPope | null => BY_LABEL.get(label) ?? null;

/**
 * The bracketed pope of an earlier pontificate before an entry (`[Benedictus XVI: …]`,
 * `[Benedictus PP. XVI: …]`): the nominative as the index prints it, with the `PP.` dropped,
 * is the label itself.
 */
export const labelForBracket = (bracket: string): string => bracket.replace(/\s*PP\.\s*/, ' ').replace(/\s+/g, ' ').trim();
