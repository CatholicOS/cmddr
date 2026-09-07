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
};
