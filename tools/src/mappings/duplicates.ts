/**
 * Documents proven to be the same act filed twice under genuinely different printed
 * incipits -- verified by fetching both records from vatican.va and comparing full
 * texts (English translation against the Latin/Italian original, or two transcriptions
 * of one letter). Neither the shared-incipit pass nor the shared-URL-document-slug
 * pass catches these: the incipits differ *and* the URL slugs differ. Curated by hand,
 * never inferred; each entry's `note` is the textual evidence.
 *
 * Key: `${pageSlug}|${shelf}|${slugify(incipit)}|${isoDate}` of the *dropped* record
 * (the printed date here is the already-adjudicated one -- see DATE_CORRECTIONS, applied
 * earlier in the pipeline). `mergeIntoIncipit` is the surviving record's own incipit
 * exactly as printed, so `${pageSlug}|${slugify(mergeIntoIncipit)}|${isoDate}` recovers
 * the pass-1 merge key of the kept (encyclicals-shelf) record.
 */
export const DUPLICATE_MERGES: Record<string, { mergeIntoIncipit: string; note: string }> = {
  'leo-xiii|letters|cum-diuturnum|1898-12-25': {
    mergeIntoIncipit: 'Quum Diuturnum',
    note:
      'English text "As We remember the long course of Our pontificate… venerable brothers" is a ' +
      'translation of the Latin "Cum diuturnum recolimus Pontificatus Nostri cursum… manet apud ' +
      'vos memoria et gratia, Venerabiles Fratres"; both addressed to the bishops of Latin America ' +
      'on their Plenary Council. Quum/Cum is orthographic variation of one word.',
  },
  'leo-xiii|letters|reputantibus-saepe|1901-08-20': {
    mergeIntoIncipit: 'Reputantibus',
    note:
      'English "As We reflect often on the condition of your churches, it seems to Us that at ' +
      'this moment nearly everywhere everything is full of fear, full of concern" translates ' +
      '"Reputantibus saepe animo, quae sit conditio ecclesiarum vestrarum… plena omnia metus, ' +
      'plena curarum"; both addressed to the bishops of Bohemia and Moravia on the language question.',
  },
  'leo-xiii|letters|vi-e-noto|1887-09-20': {
    mergeIntoIncipit: 'Vi è ben noto',
    note:
      'Both are the same Italian letter to the bishops of Italy on the Rosary, in two ' +
      'transcriptions, ending with the same dating formula -- "Dal Vaticano, 20 settembre 1887" ' +
      'and "Dal Vaticano li 20 Sett. 1887" -- the second citing ASS vol. XX (1887), pp. 209-215.',
  },
  'pius-xi|bulls|divini-cultus|1928-12-20': {
    mergeIntoIncipit: 'Divini cultus sanctitatem',
    note:
      'The apost_constitutions record opens (Latin) "Divini cultus sanctitatem tuendi cum ' +
      'Ecclesia a Conditore Christo munus acceperit..."; the bulls record is the Italian ' +
      'translation of the very same opening, "Poiché la Chiesa ha ricevuto da Cristo, suo ' +
      'Fondatore, il mandato di tutelare..." -- both on the same date, both on the same subject ' +
      '(the restoration and regulation of Gregorian chant and sacred music), one act filed ' +
      'twice under a fuller and a shortened form of its own incipit.',
  },

  // Task 12 (Benedict XV). Verified by fetching both records' full text from vatican.va.
  'benedict-xv|apost-constitutions|bracarensis|1919-05-14': {
    mergeIntoIncipit: 'Sedis huius',
    note:
      "The apost-constitutions record (Latin, 'Bracarensis') and the bulls record " +
      "(Italian, 'Sedis huius') are the same act: both approve the same revised edition of " +
      'the Bracarense Breviary for the Archdiocese of Braga, addressed to the same ' +
      "Archbishop (Emmanuele Vieira de Mattos), and close with the same dating formula in " +
      "each language -- Latin 'Datum Romae apud sanctum Petrum, anno Incarnationis Dominicae " +
      "millesimo nongentesimo decimo nono, pridie Idus Maii, die Octava Solemnitatis sancti " +
      "Ioseph...Pontificatus Nostri anno quinto' and Italian 'Dato a Roma, presso San Pietro, " +
      "l'anno dell'Incarnazione del Signore 1919, il 14 maggio, Ottava della Solennità di San " +
      "Giuseppe...anno quinto del Nostro Pontificato' -- one act filed twice under its Latin " +
      'and Italian titles.',
  },
  'benedict-xv|briefs|in-africam-quisnam-sul-martirio-subito-in-uganda-fra-il-1885-e-il-1887-dai-ventidue-negri-torturati-e-condannati-a-morte-in-quanto-cattolici|1920-06-06':
    {
      mergeIntoIncipit: 'In Africam',
      note:
        "The briefs record ('In Africam quisnam', full title continuing with the Italian " +
        "gloss) and the apost_letters record ('In Africam') are the same act: both beatify " +
        'the twenty-two Ugandan martyrs (Charles Lwanga, Matthew Kalemba Murumba and their ' +
        "companions, executed 1885-1887 under King Muanga), both close 'Datum Romae apud " +
        "sanctum Petrum sub annulo Piscatoris, die VI mensis iunii anno MCMXX, Pontificatus " +
        "Nostri sexto' / 'Dato a Roma, presso San Pietro, sotto l'anello del Pescatore, il 6 " +
        "giugno 1920, anno sesto del Nostro Pontificato' -- one act filed twice under the bare " +
        "incipit and its fuller printed form. (The briefs record's own printed heading has no " +
        "connector this parser's rule table recognises before the gloss ('In Africam quisnam, " +
        "sul martirio...'), so it would otherwise be provisional; recording it here as a " +
        "confirmed duplicate resolves it without adding a new gloss-connector rule that would " +
        "also touch an already-minted id elsewhere in the corpus -- see task-12-report.md.)",
    },
};
