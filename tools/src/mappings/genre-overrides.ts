/**
 * Hand-curated genre corrections for documents whose shelf misfiles them.
 *
 * A record's genre normally comes from the shelf it is filed on, or from the genre phrase its
 * heading prints (SOURCE_GENRE_TO_GENRE). That is right almost everywhere, and this table is
 * deliberately tiny: it exists for the case where vatican.va files a document on a shelf whose
 * genre it plainly is not, and the source says so itself. Never inferred from a heading's
 * wording -- every row must quote the evidence, and `sourceGenreLabel` still records the shelf
 * verbatim, so the override never hides what the source actually said.
 *
 * Key: `${pageSlug}|${slugify(title)}|${isoDate}`, the shape the other curated tables use.
 */
export const GENRE_OVERRIDES: Record<string, { genre: string; note: string }> = {
  'john-xxiii|piccolo-saggio-di-devoti-pensieri-distribuiti-per-ogni-decina-del-rosario-come-a-complemento-della-lettera-apostolica-il-religioso-convegno|1961-09-29': {
    genre: 'prayer',
    note:
      'Filed on apost_letters beside the letter it accompanies, but the text is a set of Rosary '
      + 'meditations -- "PICCOLO SAGGIO DI DEVOTI PENSIERI DEI MISTERI DEL ROSARIO A COMPLEMENTO '
      + 'DELLA LETTERA APOSTOLICA IL RELIGIOSO CONVEGNO", then "MISTERI GAUDIOSI / 1. Annunciazione '
      + "dell'Angelo a Maria...\" -- not an apostolic letter. vatican.va says so in the document's "
      + 'own URL, which reads hf_j-xxiii_meditation_19610929_ where every apostolic letter on the '
      + 'shelf reads hf_j-xxiii_apl_. The Genre Registry has no meditation row; `prayer` is the '
      + 'row that fits, and it is papal-issued, so invariant 17 holds.',
  },
};
