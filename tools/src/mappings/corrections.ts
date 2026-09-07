/**
 * Hand-curated adjudications of every printed-vs-URL-slug date conflict found on the
 * Leo XIII shelves. Each was resolved by reading the document's own dating formula on
 * vatican.va, cross-checked against its stated pontificate year (Leo XIII was elected
 * 20 February 1878). `date` is the resolved value the harvest keeps -- equal to the
 * printed date when the printed date was correct (the entry then exists only to
 * document the adjudication and suppress the slug-mismatch warning), or the corrected
 * value when the printed date was wrong. Every entry must carry a `note` quoting the
 * document's own dating formula as evidence; never inferred.
 *
 * Key: `${pageSlug}|${shelf}|${slugify(incipit)}|${printedIsoDate}`.
 */
export const DATE_CORRECTIONS: Record<string, { date: string; note: string }> = {
  'leo-xiii|letters|magni-nobis|1889-05-07': {
    date: '1889-03-07',
    note:
      "The letters shelf prints '7 maggio 1889' but its own URL slug encodes 18890307 (7 March); " +
      "the encyclicals shelf prints '7 marzo 1889' with slug 07031889. Both slugs agree on 7 March, " +
      'and Magni Nobis Gaudii is of 7 March 1889. Treated as a transcription error on the letters shelf.',
  },
  'leo-xiii|apost_letters|non-maius|1891-06-15': {
    date: '1891-06-15',
    note:
      "Non Maius's own dating formula reads 'die XV Iunii anno MDCCCXCI, Pontificatus Nostri XIV' " +
      '(15 June 1891, 14th year of the pontificate -- consistent, since Leo XIII was elected ' +
      "20 February 1878). The printed date is correct; the apost_letters shelf's URL slug " +
      '(18950615, 1895) is wrong.',
  },
  'leo-xiii|briefs|provida-matris|1895-05-15': {
    date: '1895-05-05',
    note:
      "Provida Matris's own dating formula reads 'il 5 maggio 1895, anno decimottavo del Nostro " +
      "Pontificato' (5 May 1895, 18th year of the pontificate -- consistent). The briefs shelf's " +
      "printed date ('15 maggio 1895', 15 May) is the error; its own URL slug (18950505, 5 May) " +
      'is correct.',
  },
  'leo-xiii|letters|le-nostre-ferme-speranze|1901-03-28': {
    date: '1901-03-28',
    note:
      "Le Nostre Ferme Speranze's own dating formula reads 'il giorno 28 marzo dell'anno 1901, " +
      'vigesimoquarto\' (28 March 1901, 24th year of the pontificate -- consistent). The printed ' +
      "date is correct; the letters shelf's URL slug (19010228, 28 February) is wrong.",
  },
  'leo-xiii|letters|consiliorum-quae|1895-07-31': {
    date: '1895-07-31',
    note:
      "Consiliorum Quae's own dating formula reads 'die XXXI Iulii anno MDCCCXCV, Pontificatus " +
      "Nostri decimo octavo' (31 July 1895, 18th year of the pontificate -- consistent). The " +
      "printed date is correct; the letters shelf's URL slug (18930731, 1893) is wrong.",
  },
  'leo-xiii|letters|adnitentibus-nobis|1895-07-02': {
    date: '1895-07-02',
    note:
      "Adnitentibus Nobis's own dating formula reads 'die II Iulii anno MDCCCXCV, Pontificatus " +
      "Nostri decimo octavo' (2 July 1895, 18th year of the pontificate -- consistent). The " +
      "printed date is correct; the letters shelf's URL slug (18960702, 1896) is wrong.",
  },
  'leo-xiii|letters|vi-e-noto|1887-09-20': {
    date: '1887-09-20',
    note:
      "Vi è noto's own dating formula reads 'Dal Vaticano li 20 Sett. 1887' and cites ASS vol. XX " +
      "(1887); the encyclicals-shelf transcription of the same letter (Vi è ben noto) closes 'Dal " +
      "Vaticano, 20 settembre 1887'. The printed date is correct; this record's own URL slug " +
      '(18880920, 1888) is wrong. (This record merges into Vi è ben noto -- see DUPLICATE_MERGES -- ' +
      'but the adjudication is recorded here since the date correction is applied before the merge pass.)',
  },
};
