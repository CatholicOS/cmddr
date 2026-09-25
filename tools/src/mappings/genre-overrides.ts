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
 * A row may also name the `characteristics` the corrected genre carries, for the case where
 * the shelf misses not the genre alone but the form of the act -- the briefs the ASS heads
 * `LITTERAE in forma Brevis` that vatican.va files on the letters shelf. Where a row gives
 * them they replace the shelf mapping's, and invariant 22 still holds them to the genre's
 * `allowedCharacteristics`.
 *
 * Key: `${pageSlug}|${slugify(title)}|${isoDate}`, the shape the other curated tables use.
 */
export const GENRE_OVERRIDES: Record<string, { genre: string; characteristics?: readonly string[]; note: string }> = {
  'leo-xiii|opportune-quidem|1891-01-01': {
    genre: 'apostolic-letter',
    characteristics: ['in-forma-brevis'],
    note:
      'What the source shows: the ASS heads the act \'LITTERAE in forma brevis Sanctissimi D. N. Leonis '
      + 'XIII quibus indulgen- / tiae conceduntur, occasione qua solemnia fiunt in honorem s. Aloisii '
      + 'Gonzagae\' at ASS 23 (1890) 437 -- the one line of the five sample volumes that prints the b in '
      + 'lower case. vatican.va files it on Leo XIII\'s letters shelf as a letter '
      + '(/content/leo-xiii/la/letters/documents/hf_l-xiii_let_18910101_opportune-quidem.html) and on no '
      + 'briefs shelf, so the shelf misses the form the act was issued in. The four words the ASS prints '
      + 'name the instrument: litterae apostolicae in forma Brevis, sealed sub anulo Piscatoris (README, '
      + 'The brief and the encyclical, and #49). `sourceGenreLabel` still records `letters` verbatim.',
  },
  'leo-xiii|quas-tu|1900-06-08': {
    genre: 'apostolic-letter',
    characteristics: ['in-forma-brevis'],
    note:
      'What the source shows: the ASS heads the act \'IITTERAE in forma Brevis SSmi. D. N. Leonis XIII '
      + 'ad Emum. Archiepiscopum Me- / diolanensem quoad interessentiam comitiis ad oratores populi '
      + 'eligendos\' (the OCR reads the L as I) at ASS 33 (1900) 3. vatican.va files it on Leo XIII\'s '
      + 'letters shelf as a letter '
      + '(/content/leo-xiii/la/letters/documents/hf_l-xiii_let_19000608_quas-tu.html) and on no briefs '
      + 'shelf, so the shelf misses the form the act was issued in. The four words the ASS prints name '
      + 'the instrument: litterae apostolicae in forma Brevis, sealed sub anulo Piscatoris (README, The '
      + 'brief and the encyclical, and #49). `sourceGenreLabel` still records `letters` verbatim.',
  },
  'leo-xiii|ad-catholicorum-conventum|1900-08-31': {
    genre: 'apostolic-letter',
    characteristics: ['in-forma-brevis'],
    note:
      'What the source shows: the ASS heads the act \'LITTERAE in forma Brevis SSmi. O. N. Leonis XIII, '
      + 'quae mittebantur ad XVII Con- / ventum catholicorum, Romae habitum.\' at ASS 33 (1900) 129. '
      + 'vatican.va files it on Leo XIII\'s letters shelf as a letter '
      + '(/content/leo-xiii/la/letters/documents/hf_l-xiii_let_19000831_ad-catholicorum-conventum.html) '
      + 'and on no briefs shelf, so the shelf misses the form the act was issued in. The four words the '
      + 'ASS prints name the instrument: litterae apostolicae in forma Brevis, sealed sub anulo '
      + 'Piscatoris (README, The brief and the encyclical, and #49). `sourceGenreLabel` still records '
      + '`letters` verbatim.'
  },
  'leo-xiii|venerabilis-frater-augustinus|1900-09-14': {
    genre: 'apostolic-letter',
    characteristics: ['in-forma-brevis'],
    note:
      'What the source shows: the ASS heads the act \'LITTERAE in forma Brevis SSmi. D. N. Leonis XIII; '
      + 'quarum obiectum est trans- / latio Corporis S. Augustini ad Basilicam S. Petri in caelo aureo '
      + 'Civitatis Papiae\' at ASS 33 (1900) 198. vatican.va files it on Leo XIII\'s letters shelf as a '
      + 'letter '
      + '(/content/leo-xiii/la/letters/documents/hf_l-xiii_let_19000914_venerabilis-frater-augustinus.html) '
      + 'and on no briefs shelf, so the shelf misses the form the act was issued in. The four words the '
      + 'ASS prints name the instrument: litterae apostolicae in forma Brevis, sealed sub anulo '
      + 'Piscatoris (README, The brief and the encyclical, and #49). `sourceGenreLabel` still records '
      + '`letters` verbatim.'
  },
  'leo-xiii|saecularis-eventus|1901-05-11': {
    genre: 'apostolic-letter',
    characteristics: ['in-forma-brevis'],
    note:
      'What the source shows: the ASS heads the act \'LITTERAE in forma Brevis SSmi O. N. Leonis XIII, '
      + 'occasione anni centesimi ab in- / stitutione nobilis cohortis Sacratissimum Principem '
      + 'protuentis.\' at ASS 33 (1901) 577. vatican.va files it on Leo XIII\'s letters shelf as a letter '
      + '(/content/leo-xiii/la/letters/documents/hf_l-xiii_let_19010511_saecularis-eventus.html) and on '
      + 'no briefs shelf, so the shelf misses the form the act was issued in. The four words the ASS '
      + 'prints name the instrument: litterae apostolicae in forma Brevis, sealed sub anulo Piscatoris '
      + '(README, The brief and the encyclical, and #49). `sourceGenreLabel` still records `letters` '
      + 'verbatim.'
  },
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
      + 'bishops of Belgium on the social question, not to the universal Church. The ASS heads it the '
      + "same way at ASS 28 (1895) 4: 'LITTERAE SSmi. Domini N. Leonis XIII ad Ordinarios Belgi de "
      + "causa sociali.' "
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
      + "inter eosdem habendis' -- Litterae, convoking the bishops of Latin America to Rome. The ASS "
      + "heads it the same way at ASS 31 (1898) 321: 'LITTERAE S. D. N. Leonis Xiii ad Ordinarios "
      + "Americae Latinae qui Romam deli- / gunt pro consiliis inter eosdem habendis.' "
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
      + "bishops of Bohemia and Moravia on the language question. The ASS heads it the same way at ASS "
      + "34 (1901) 321: 'LITTERAE SSmi. D. N Leonis XIII ad Ordinarios Bohemiae et Moraviae quoad lin- "
      + "/ guarum quaestionem.' The letters shelf titles the act "
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
      + "ATHENIS INSTITUENDO' -- Litterae, erecting a seminary at Athens. The ASS heads it the same way "
      + "at ASS 34 (1901) 257: 'LITTERAE SSmi D. N. Papae Leonis XIII. - De Seminario Clericorum "
      + "Athenis instituendo.' (the OCR reads the De as `Oe`). "
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
      + 'Gibbons and the bishops of the United States on their congratulations for his twenty-fifth '
      + "year. The ASS heads it the same way at ASS 34 (1901) 623 -- the volume running into 1902 -- "
      + "'LITTERAE SSmi. D. N. Leonis Xlii ad Emum. Gibbons Archiepiscopum Baltimorae aliosque "
      + "Ordinarios foederatarum Americae Civitatum'. "
      + 'One of six acts of Leo XIII that vatican.va files on the letters shelf in Latin or '
      + 'Italian and under encyclicals in English alone: the harvester takes the encyclicals '
      + 'page (`languages: [\'EN\']`) and merge.ts folds the letters shelf into `alsoShelvedAs`, '
      + 'so the genre came from the shelf of a translation. `sourceGenreLabel` still records '
      + '`encyclicals` verbatim.',
  },
  // Where this stops, and why the ASS heading cannot be the test.
  //
  // Six more acts of Leo XIII sit on both the encyclicals and the letters shelves: Vi e ben
  // noto (1887), Quod anniversarius and In plurimis (1888), Quam aerumnosa (1888), Magni
  // Nobis (1889), Non mediocri (1893). They are NOT corrected here, and the difference from
  // the six above is vatican.va's own: there the Latin and the Italian stand on the letters
  // shelf and the English alone under encyclicals, so the genre came from a translation's
  // shelf; here the Italian is itself filed as an encyclical.
  //
  // The ASS was read for all six and does not settle it. Four are printed and every one is
  // headed plain `EPISTOLA` -- In plurimis at ASS 20 (1887) 545 ('EPISTOLA Sanctissimi D. N.
  // Leonis XIII ad Episcopos Brasiliae de libertate donata non paucis, qui in illo imperio
  // sub iugo servitutis detenti erant.'), Quam aerumnosa at ASS 21 (1888) 258, Magni Nobis at
  // ASS 21 (1888) 517, Non mediocri at ASS 26 (1893) 199; the other two the series does not
  // print. But In plurimis is Leo XIII's encyclical on the abolition of slavery, on the
  // encyclicals shelf in Italian and English and in every published list of his encyclicals,
  // and those volumes use `EPISTOLA ENCYCLICA` elsewhere (twice in ASS 20, three times in
  // ASS 21, forty-seven times in ASS 26). So a bare `EPISTOLA` or `LITTERAE` heading is
  // compatible with an act the Church calls an encyclical, and the heading corroborates a
  // correction without being able to carry one: what carries the six above is the language
  // split, not the Acta. The owner ruled these six stay encyclicals (2026-09-25).
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
