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
  'leo-xiii|omnibus-compertum|1900-07-21': {
    genre: 'letter',
    note:
      'What the source shows: the letters shelf carries the Latin and the Italian at '
      + '/content/leo-xiii/it/letters/documents/hf_l-xiii_let_19000721_omnibus-compertum.html, indexed '
      + "'Omnibus compertum (21 luglio 1900)' with IT and LA versions, and that page's own heading reads "
      + "'LEONE XIII EPISTOLA OMNIBUS COMPERTUM'. The encyclicals shelf carries the English alone "
      + '(/en/encyclicals/documents/hf_l-xiii_enc_21071900_omnibus-compertum.html), the page this record was '
      + 'harvested from. The ASS, the series of record for 1900, heads the act `LITTERAE` at '
      + 'ASS 33 (1900) 65. '
      + 'One of six acts of Leo XIII that vatican.va files on the letters shelf in Latin or '
      + 'Italian and under encyclicals in English alone: the harvester takes the encyclicals '
      + 'page (`languages: [\'EN\']`) and merge.ts folds the letters shelf into `alsoShelvedAs`, '
      + 'so the genre came from the shelf of a translation. `sourceGenreLabel` still records '
      + '`encyclicals` verbatim.',
  },
  'leo-xiii|permoti-nos|1895-07-10': {
    genre: 'letter',
    note:
      'What the source shows: the letters shelf carries it at '
      + '/content/leo-xiii/it/letters/documents/hf_l-xiii_let_18950710_permoti-nos.html, headed '
      + "'LITTERAE SSMI. DOMINI N. LEONIS XIII AD ORDINARIOS BELGI DE CAUSA SOCIALI' -- Litterae, to the "
      + 'bishops of Belgium on the social question, not to the universal Church. '
      + 'One of six acts of Leo XIII that vatican.va files on the letters shelf in Latin or '
      + 'Italian and under encyclicals in English alone: the harvester takes the encyclicals '
      + 'page (`languages: [\'EN\']`) and merge.ts folds the letters shelf into `alsoShelvedAs`, '
      + 'so the genre came from the shelf of a translation. `sourceGenreLabel` still records '
      + '`encyclicals` verbatim.',
  },
  'leo-xiii|quum-diuturnum|1898-12-25': {
    genre: 'letter',
    note:
      'What the source shows: the Latin letters shelf carries it at '
      + '/content/leo-xiii/la/letters/documents/hf_l-xiii_let_18981225_cum-diuturnum.html, headed '
      + "'Litterae S. D. N. Leonis XIII ad Ordinarios Americae Latinae qui Romam deligunt pro consiliis "
      + "inter eosdem habendis' -- Litterae, convoking the bishops of Latin America to Rome. "
      + 'One of six acts of Leo XIII that vatican.va files on the letters shelf in Latin or '
      + 'Italian and under encyclicals in English alone: the harvester takes the encyclicals '
      + 'page (`languages: [\'EN\']`) and merge.ts folds the letters shelf into `alsoShelvedAs`, '
      + 'so the genre came from the shelf of a translation. `sourceGenreLabel` still records '
      + '`encyclicals` verbatim.',
  },
  'leo-xiii|reputantibus|1901-08-20': {
    genre: 'letter',
    note:
      'What the source shows: the Latin letters shelf carries it at '
      + '/content/leo-xiii/la/letters/documents/hf_l-xiii_let_19010820_reputantibus-saepe.html, headed '
      + "'Litterae ad Ordinarios Bohemiae et Moraviae quoad Linguarum Quaestionem' -- Litterae, to the "
      + 'bishops of Bohemia and Moravia on the language question. The letters shelf titles the act '
      + '*Reputantibus saepe*, where the encyclicals page this record was harvested from titles it '
      + '*Reputantibus*. '
      + 'One of six acts of Leo XIII that vatican.va files on the letters shelf in Latin or '
      + 'Italian and under encyclicals in English alone: the harvester takes the encyclicals '
      + 'page (`languages: [\'EN\']`) and merge.ts folds the letters shelf into `alsoShelvedAs`, '
      + 'so the genre came from the shelf of a translation. `sourceGenreLabel` still records '
      + '`encyclicals` verbatim.',
  },
  'leo-xiii|urbanitatis-veteris|1901-11-20': {
    genre: 'letter',
    note:
      'What the source shows: the letters shelf carries it at '
      + '/content/leo-xiii/it/letters/documents/hf_l-xiii_let_19011120_urbanitatis-veteris.html, headed '
      + "'SANCTISSIMI DOMINI NOSTRI LEONIS DIVINA PROVIDENTIA PAPAE XIII LITTERAE DE SEMINARIO CLERICORUM "
      + "ATHENIS INSTITUENDO' -- Litterae, erecting a seminary at Athens. "
      + 'One of six acts of Leo XIII that vatican.va files on the letters shelf in Latin or '
      + 'Italian and under encyclicals in English alone: the harvester takes the encyclicals '
      + 'page (`languages: [\'EN\']`) and merge.ts folds the letters shelf into `alsoShelvedAs`, '
      + 'so the genre came from the shelf of a translation. `sourceGenreLabel` still records '
      + '`encyclicals` verbatim.',
  },
  'leo-xiii|in-amplissimo|1902-04-15': {
    genre: 'letter',
    note:
      'What the source shows: the letters shelf carries it at '
      + '/content/leo-xiii/it/letters/documents/hf_l-xiii_let_19020415_in-amplissimo.html, headed '
      + "'SANCTISSIMI DOMINI NOSTRI LEONIS DIVINA PROVIDENTIA PAPAE XIII LITTERAE' -- Litterae, to Cardinal "
      + 'Gibbons and the bishops of the United States on their congratulations for his twenty-fifth year. '
      + 'One of six acts of Leo XIII that vatican.va files on the letters shelf in Latin or '
      + 'Italian and under encyclicals in English alone: the harvester takes the encyclicals '
      + 'page (`languages: [\'EN\']`) and merge.ts folds the letters shelf into `alsoShelvedAs`, '
      + 'so the genre came from the shelf of a translation. `sourceGenreLabel` still records '
      + '`encyclicals` verbatim.',
  },
  'john-xxiii|piccolo-saggio-di-devoti-pensieri-distribuiti-per-ogni-decina-del-rosario-come-a-complemento-della-lettera-apostolica-il-religioso-convegno|1961-09-29': {
    genre: 'prayer',
    note:
      'What the source shows: the document is filed on apost_letters beside the letter it '
      + 'accompanies, but its text is a set of Rosary meditations -- "PICCOLO SAGGIO DI DEVOTI '
      + 'PENSIERI DEI MISTERI DEL ROSARIO A COMPLEMENTO DELLA LETTERA APOSTOLICA IL RELIGIOSO '
      + 'CONVEGNO", then "MISTERI GAUDIOSI / 1. Annunciazione dell\'Angelo a Maria...". '
      + "vatican.va says as much in the document's own URL, which reads "
      + 'hf_j-xxiii_meditation_19610929_ where every apostolic letter on that shelf reads '
      + 'hf_j-xxiii_apl_. That is evidence the act is not an apostolic letter. '
      + 'The classification is a curator\'s judgment, not a quotation: the Genre Registry has no '
      + 'meditation row, and meditation is a form of prayer, so `prayer` -- "Papal prayer", '
      + 'issuerTypes ["pope"] -- is the row it belongs in. No vatican.va text calls this document '
      + 'a prayer, and none is claimed to. `sourceGenreLabel` still records the shelf verbatim.',
  },
};
