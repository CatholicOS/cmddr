/**
 * Documentation only, not behaviour: a checked-in record of the six vatican.va Leo XIII
 * records where the printed date and the URL slug's date disagree and neither is a
 * demonstrable transcription error (contrast `DATE_CORRECTIONS`, whose one entry -
 * Magni Nobis - is resolved because both shelves' slugs agree with each other against
 * the letters shelf's own printed text). The harvest keeps the *printed* date as the
 * value for every one of these; it does not read this table.
 *
 * Key: `${pageSlug}|${shelf}|${slugify(incipit)}|${printedIsoDate}`, matching
 * `DATE_CORRECTIONS`. Which date is correct is a domain judgment reserved for the
 * repository owner (see the harvest fix-wave report) - do not resolve unilaterally.
 */
export const DISPUTED_DATES: Record<string, { slugDate: string; note: string }> = {
  'leo-xiii|letters|le-nostre-ferme-speranze|1901-03-28': {
    slugDate: '1901-02-28',
    note:
      "The letters shelf prints '28 marzo 1901' (28 March) but its own URL slug encodes " +
      '19010228 (28 February). Conflict awaits adjudication; the printed date is kept.',
  },
  'leo-xiii|letters|consiliorum-quae|1895-07-31': {
    slugDate: '1893-07-31',
    note:
      "The letters shelf prints '31 luglio 1895' (1895) but its own URL slug encodes " +
      '18930731 (1893). Conflict awaits adjudication; the printed date is kept.',
  },
  'leo-xiii|letters|adnitentibus-nobis|1895-07-02': {
    slugDate: '1896-07-02',
    note:
      "The letters shelf prints '2 luglio 1895' (1895) but its own URL slug encodes " +
      '18960702 (1896). Conflict awaits adjudication; the printed date is kept.',
  },
  'leo-xiii|letters|vi-e-noto|1887-09-20': {
    slugDate: '1888-09-20',
    note:
      "The letters shelf prints '20 settembre 1887' (1887) but its own URL slug encodes " +
      '18880920 (1888). Conflict awaits adjudication; the printed date is kept.',
  },
  'leo-xiii|apost_letters|non-maius|1891-06-15': {
    slugDate: '1895-06-15',
    note:
      "The apost_letters shelf prints '15 giugno 1891' (1891) but its own URL slug encodes " +
      '18950615 (1895). Conflict awaits adjudication; the printed date is kept.',
  },
  'leo-xiii|briefs|provida-matris|1895-05-15': {
    slugDate: '1895-05-05',
    note:
      "The briefs shelf prints '15 maggio 1895' (15 May) but its own URL slug encodes " +
      '18950505 (5 May). Conflict awaits adjudication; the printed date is kept.',
  },
};
