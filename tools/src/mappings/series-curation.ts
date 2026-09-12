/**
 * Hand-curated occasion years and ordinals for *Messaggi* series items whose heading the
 * parser cannot read (messages spec §5.3), in the style of recovered-incipits.ts: nothing
 * here is inferred, every row quotes the heading it applies to, and a row matching no
 * harvested record fails the data tests rather than sitting unnoticed.
 *
 * Both tables started empty and hold only what the corpus measurement (spec §5.4) turned
 * up: on 2026-09-12, 31 series items whose title prints no occasion year or prints two,
 * and one whose title prints a numeral that is not one; a fourth ordinal row (Leo XIV 2025)
 * records a numeral the document prints but the shelf heading does not. A row is consulted *first*: where
 * it exists it wins over the parser, so that a heading which prints a demonstrably wrong
 * value (a mistyped Roman numeral, a year that contradicts its own ordinal) can be corrected
 * with the evidence beside it -- three such corrections are recorded below, each of which
 * invariant 24 or the series-occasion uniqueness check would otherwise have refused.
 * `printed` records what the heading actually printed, so a reader can tell a fill (the
 * heading printed nothing) from a correction (it printed something else) without re-reading
 * the heading.
 *
 * Keyed `${pageSlug}|${shelf}|${slugify(title)}|${isoDate}` -- the shelf is part of the key
 * because two sub-shelves of one pope can carry identically titled items on one date; the
 * title is the heading minus its date parenthetical, as the shelf parser leaves it.
 */
export interface CuratedOccasionYear {
  /** The occasion year the id carries. */
  year: number;
  /** What the heading printed where a year was looked for: null when it printed none. */
  printed: string | null;
  /** The heading, quoted, and the evidence for the year. */
  evidence: string;
}

export interface CuratedOrdinal {
  /** The ordinal recorded in `series.ordinal`. */
  ordinal: number;
  /** The token the heading printed in the ordinal's position: null when it printed none. */
  printed: string | null;
  /** The heading, quoted, and the evidence for the ordinal. */
  evidence: string;
}

export interface SeriesExclusion {
  /** The heading, quoted, and the reason the item is not a member of the shelf's series. */
  evidence: string;
}

/**
 * Items filed on a series sub-shelf that are not members of the series. An excluded item
 * keeps the shelf's genre (`message`) but gets no `series`, and so takes the provisional
 * form `mag:{issuer}/message-YYYY-MM-DD` rather than the series-form id. One row so far,
 * adjudicated by the repository owner on PR #26.
 */
export const SERIES_EXCLUSIONS: Record<string, SeriesExclusion> = {

  // -- paul-vi -----------------------------------------------------------------
  'paul-vi|messages/sick|giornata-mondiale-del-malato-1975|1975-09-16': {
    evidence: "Heading: 'Giornata Mondiale del Malato - 1975' "
      + '(hf_p-vi_mes_19750916_world-day-of-the-sick-1975.html), the only item on the Paul VI '
      + 'sick shelf. A world day declared for the 1975 Holy Year, not part of the annual World '
      + "Day of the Sick John Paul II instituted in 1992 (first kept in 1993, the series' "
      + 'verified firstYear); vatican.va files it on the same sub-shelf. Excluded so that the '
      + 'series holds only the annual day, and so that its 1975 sits eighteen years before the '
      + "series' first year without pretending to be a member.",
  },
};

/** The evidence shared by the twelve Francis consecrated-life rows. */
const CONSECRATED_LIFE_EVIDENCE =
  'The heading prints the occasion year only inside its date parenthetical, which on this '
  + 'shelf is the day of the occasion itself: the World Day for Consecrated Life is 2 '
  + 'February (the Presentation of the Lord, anticipated to 1 February when the 2nd falls '
  + 'on a Sunday), and each page is the homily or message of that day '
  + '(…_omelia-vita-consacrata.html). The year is that of the printed date, recorded here '
  + 'rather than read off `date` because §3.2.5 forbids the parser that inference.';

/** The evidence shared by the six John Paul II tourism rows. */
const TOURISM_EVIDENCE =
  "The heading 'Messaggio per la Giornata Mondiale del Turismo (27 settembre YYYY)' prints "
  + 'the occasion year only inside its date parenthetical, which is the day of the occasion '
  + 'itself -- World Tourism Day is 27 September; the message is signed earlier (the 2004 '
  + "document closes 'Dal Vaticano, 30 maggio 2004'; see DATE_CORRECTIONS) and vatican.va "
  + 'dates the heading by the day, not the signing. The documents themselves number the day '
  + '(XXV in 2004) but the shelf headings do not, so no ordinal is recorded.';

/** The evidence shared by the Francis care-of-creation rows whose heading prints no year. */
const CREATION_EVIDENCE =
  'The heading prints no year outside its date parenthetical; the World Day of Prayer for '
  + 'the Care of Creation is 1 September, and the printed date is either that day itself '
  + 'or the signing date earlier the same year. Later headings on the shelf print the '
  + "occasion in brackets ('[1° settembre 2024]'), which the parser reads; these do not.";

export const SERIES_OCCASION_YEARS: Record<string, CuratedOccasionYear> = {

  // -- paul-vi -----------------------------------------------------------------
  'paul-vi|messages/migration|messaggio-al-cardinale-sebastiano-baggio-in-occasione-della-giornata-del-migrante|1976-11-04': {
    year: 1976,
    printed: null,
    evidence: "Heading: 'Messaggio al Cardinale Sebastiano Baggio in occasione della «Giornata "
      + "del Migrante» (4 novembre 1976)'. No year outside the date parenthetical. The "
      + 'shelf files it between \'Giornata dell\'Emigrazione, 1977\' (signed 25 November '
      + "1977) and 'Giornata dell'Emigrazione, 1963', and the 1977 heading, signed in "
      + 'November, names the day of the year it is signed in; the message of 4 November '
      + '1976 is the one for the day of 1976.',
  },
  'paul-vi|messages/vocations|xiv-giornata-mondiale-di-preghiera-per-le-vocazioni-1976|1976-12-30': {
    year: 1977,
    printed: '1976',
    evidence: "Heading: 'XIV Giornata Mondiale di Preghiera per le Vocazioni, 1976' -- a "
      + 'correction, not a fill. The document is dated \'Dal Vaticano, 30 dicembre 1976\' '
      + "and opens 'In spirito di cristiana letizia celebriamo la XIV «Giornata Mondiale di "
      + "preghiera per le vocazioni»'; the series opens at 'I Giornata Mondiale per le "
      + "Vocazioni, 1964' on the same shelf, so the XIV day is 1977 (Good Shepherd Sunday, "
      + '17 April 1977), and the shelf already carries \'XIII Giornata Mondiale di Preghiera '
      + "per le Vocazioni, 1976' (signed 3 February 1976) for 1976. Left as printed, the two "
      + 'would claim one occasion.',
  },

  // -- john-paul-ii ------------------------------------------------------------
  'john-paul-ii|messages/migration|giornata-mondiale-delle-migrazioni-1993-1994|1993-08-06': {
    year: 1993,
    printed: '1993-1994',
    evidence: "Heading: 'Giornata Mondiale delle Migrazioni, 1993-1994'. The document is "
      + "headed 'Messaggio di Giovanni Paolo II in occasione della celebrazione della "
      + "«Giornata Mondiale del Migrante» 1993-1994' and dated 6 August 1993: before 2005 "
      + 'the day was kept on different dates in different countries, and this one message '
      + 'served the 1993-94 season. A printed range names the occasion by its first year, '
      + "as the IX-X World Youth Day row below does; the range stays in the title. The "
      + "shelf's neighbouring entries are 'Giornata Mondiale delle Migrazioni, 1992' and "
      + "'…, 1995', so 1993 is otherwise unclaimed.",
  },
  'john-paul-ii|messages/youth|ix-x-giornata-mondiale-della-gioventu-1994-1995|1993-11-21': {
    year: 1994,
    printed: '1994-1995',
    evidence: "Heading: 'IX-X Giornata Mondiale della Gioventù, 1994-1995'. One message for "
      + "two days: the document is headed 'Messaggio di Giovanni Paolo II in occasione della "
      + "IX e X Giornata della Gioventù' and says 'Esse avranno luogo … la Domenica delle "
      + "Palme del 1994 e del 1995, mentre il grande incontro internazionale … è fissato a "
      + "Manila … nel gennaio del 1995'; dated 21 November 1993. A printed range names the "
      + 'occasion by its first year (IX, 1994); 1995 has no other document on the shelf, '
      + 'and the title keeps the range.',
  },
  // Keyed on the adjudicated signing date (DATE_CORRECTIONS), not the heading's 27 September.
  ...Object.fromEntries([
    '2004-05-30', '2003-06-11', '2002-06-24', '2001-06-09', '2000-07-29', '1982-09-27',
  ].map((date) => [
    `john-paul-ii|messages/tourism|messaggio-per-la-giornata-mondiale-del-turismo|${date}`,
    { year: Number(date.slice(0, 4)), printed: null, evidence: TOURISM_EVIDENCE },
  ])),

  // -- francesco ---------------------------------------------------------------
  'francesco|messages/youth|xxxvii-giornata-mondiale-della-gioventu-2022-2023-maria-si-alzo-e-ando-in-fretta-lc-1-39|2022-08-15': {
    year: 2022,
    printed: '2022-2023',
    evidence: "Heading: 'XXXVII Giornata Mondiale della Gioventù, 2022-2023: «Maria si alzò e "
      + "andò in fretta» (Lc 1,39)'. The document is headed 'Messaggio del Santo Padre "
      + "Francesco per la XXXVII Giornata Mondiale della Gioventù 2022-2023' and dated 15 "
      + 'August 2022: the XXXVII day was kept in the dioceses in November 2022 and at Lisbon '
      + "in August 2023. A printed range names the occasion by its first year; the shelf's "
      + "'XXXVIII Giornata Mondiale della Gioventù, 2023' already claims 2023.",
  },
  'francesco|messages/food|visita-del-santo-padre-alla-sede-della-fao-a-roma|2017-10-16': {
    year: 2017,
    printed: null,
    evidence: "Heading: 'Visita del Santo Padre alla sede della FAO a Roma (16 ottobre 2017)'. "
      + 'No year outside the date parenthetical, which is World Food Day itself (16 October); '
      + 'the page is …_20171016_messaggio-giornata-alimentazione.html, the same filename '
      + "pattern as every other year's message on the shelf, delivered in person at the FAO "
      + 'that year. The shelf has no other 2017 entry.',
  },
  ...Object.fromEntries([
    ['xxix', '2025-02-01'], ['xxviii', '2024-02-02'], ['xxvi', '2022-02-02'], ['xxv', '2021-02-02'],
    ['xxiv', '2020-02-01'], ['xxiii', '2019-02-02'], ['xxii', '2018-02-02'], ['xxi', '2017-02-02'],
    ['xix', '2015-02-02'], ['xviii', '2014-02-02'],
  ].map(([ord, date]) => [
    `francesco|messages/consecrated_life|${ord}-giornata-mondiale-della-vita-consacrata-festa-della-presentazione-del-signore|${date}`,
    { year: Number(date!.slice(0, 4)), printed: null, evidence: CONSECRATED_LIFE_EVIDENCE },
  ])),
  'francesco|messages/consecrated_life|xx-giornata-mondiale-della-vita-consacrata-giubileo-straordinario-della-misericordia-giubileo-della-vita-consacrata-e-chiusura-dell-anno-della-vita-consacrata|2016-02-02': {
    year: 2016, printed: null, evidence: CONSECRATED_LIFE_EVIDENCE,
  },
  'francesco|messages/consecrated_life|messaggio-del-santo-padre-ai-consacrati-riuniti-nella-basilica-di-s-maria-maggiore-in-occasione-della-giornata-mondiale-della-vita-consacrata|2023-02-02': {
    year: 2023, printed: null, evidence: CONSECRATED_LIFE_EVIDENCE,
  },
  'francesco|messages/cura-creato|messaggio-del-santo-padre-per-la-celebrazione-della-giornata-mondiale-di-preghiera-per-la-cura-del-creato|2022-07-16': {
    year: 2022, printed: null, evidence: `Heading: 'Messaggio del Santo Padre per la celebrazione della Giornata Mondiale di Preghiera per la Cura del Creato (16 luglio 2022)'. ${CREATION_EVIDENCE}`,
  },
  'francesco|messages/cura-creato|messaggio-congiunto-del-santo-padre-francesco-di-sua-santita-bartolomeo-i-patriarca-ecumenico-di-costantinopoli-e-di-sua-grazia-justin-welby-arcivescovo-di-canterbury-per-la-protezione-del-creato|2021-09-01': {
    year: 2021, printed: null, evidence: `Heading: 'Messaggio congiunto del Santo Padre Francesco, di Sua Santità Bartolomeo I, Patriarca Ecumenico di Costantinopoli, e di Sua Grazia Justin Welby, Arcivescovo di Canterbury, per la protezione del Creato (1 settembre 2021)'. ${CREATION_EVIDENCE} A joint message, filed by vatican.va as the shelf's 2021 entry.`,
  },
  'francesco|messages/cura-creato|messaggio-del-santo-padre-per-la-celebrazione-della-vi-giornata-mondiale-di-preghiera-per-la-cura-del-creato|2020-09-01': {
    year: 2020, printed: null, evidence: `Heading: 'Messaggio del Santo Padre per la celebrazione della VI Giornata Mondiale di Preghiera per la Cura del Creato (1° settembre 2020)'. ${CREATION_EVIDENCE} The printed ordinal VI is read by the parser.`,
  },
  'francesco|messages/cura-creato|messaggio-del-santo-padre-per-la-celebrazione-della-giornata-mondiale-di-preghiera-per-la-cura-del-creato|2019-09-01': {
    year: 2019, printed: null, evidence: `Heading: 'Messaggio del Santo Padre per la celebrazione della Giornata mondiale di preghiera per la cura del creato (1 settembre 2019)'. ${CREATION_EVIDENCE}`,
  },
  'francesco|messages/cura-creato|messaggio-del-santo-padre-per-la-celebrazione-della-giornata-mondiale-di-preghiera-per-la-cura-del-creato|2018-09-01': {
    year: 2018, printed: null, evidence: `Heading: 'Messaggio del Santo Padre per la celebrazione della Giornata mondiale di preghiera per la cura del creato (1 settembre 2018)'. ${CREATION_EVIDENCE}`,
  },
  'francesco|messages/cura-creato|messaggio-congiunto-di-papa-francesco-e-del-patriarca-ecumenico-bartolomeo-per-la-giornata-mondiale-di-preghiera-per-il-creato|2017-09-01': {
    year: 2017, printed: null, evidence: `Heading: 'Messaggio congiunto di Papa Francesco e del Patriarca Ecumenico Bartolomeo per la Giornata Mondiale di Preghiera per il Creato (1 settembre 2017)'. ${CREATION_EVIDENCE} A joint message, filed by vatican.va as the shelf's 2017 entry.`,
  },
  'francesco|messages/cura-creato|messaggio-del-santo-padre-per-la-celebrazione-della-giornata-mondiale-di-preghiera-per-la-cura-del-creato|2016-09-01': {
    year: 2016, printed: null, evidence: `Heading: 'Messaggio del Santo Padre per la celebrazione della Giornata mondiale di preghiera per la cura del creato (1 settembre 2016)'. ${CREATION_EVIDENCE}`,
  },
  'francesco|messages/cura-creato|lettera-del-santo-padre-per-l-istituzione-della-giornata-mondiale-di-preghiera-per-la-cura-del-creato-1-settembre|2015-08-06': {
    year: 2015,
    printed: null,
    evidence: "Heading: 'Lettera del Santo Padre per l’istituzione della “Giornata Mondiale di "
      + "Preghiera per la Cura del Creato” [1° settembre] (6 agosto 2015)'. Not a message for "
      + 'the day but the letter instituting it, dated 6 August 2015 for its first celebration '
      + 'on 1 September 2015; vatican.va opens the shelf with it and has no other 2015 entry, '
      + "so it stands as the series' 2015 document. Whether an instituting letter belongs "
      + 'in the series at all is an editorial question the PR records rather than decides.',
  },
};

export const SERIES_ORDINALS: Record<string, CuratedOrdinal> = {

  // -- john-paul-ii ------------------------------------------------------------
  'john-paul-ii|messages/vocations|xxiv-giornata-mondiale-per-le-vocazioni-1997|1996-10-28': {
    ordinal: 34,
    printed: 'XXIV',
    evidence: "Heading: 'XXIV Giornata Mondiale per le Vocazioni, 1997' -- a correction. The "
      + "document is headed 'Messaggio di Giovanni Paolo II per la XXXIV Giornata Mondiale "
      + "per le Vocazioni' and dated 'Dal Vaticano, 28 ottobre 1996'; the shelf's own "
      + "'XXIV Giornata Mondiale per le Vocazioni, 1987' is the XXIV, and 1997 - 1964 + 1 = 34. "
      + 'Invariant 24 refuses the heading as printed.',
  },
  'john-paul-ii|messages/youth|ix-x-giornata-mondiale-della-gioventu-1994-1995|1993-11-21': {
    ordinal: 9,
    printed: 'IX-X',
    evidence: "Heading: 'IX-X Giornata Mondiale della Gioventù, 1994-1995'. One message for "
      + 'the IX (1994) and X (1995) days; the occasion is recorded by its first year and so '
      + 'by its first ordinal (see the SERIES_OCCASION_YEARS row), and the title keeps both.',
  },
  'john-paul-ii|messages/food|xv-giornata-mondiale-dell-alimentazione-1996|1996-10-15': {
    ordinal: 16,
    printed: 'XV',
    evidence: "Heading: 'XV Giornata Mondiale dell'Alimentazione, 1996' -- a correction. The "
      + "shelf prints XV for both 1995 and 1996; its own URL for the 1996 page is "
      + "hf_jp-ii_mes_19961015_xvi-world-food-day.html, and the series opens at 'I Giornata "
      + "Mondiale dell'Alimentazione, 1981' on the same shelf, so 1996 is the XVI. The "
      + 'document itself (English page; the Italian one is empty) prints no ordinal. '
      + 'Invariant 24 refuses the heading as printed.',
  },

  // -- leo-xiv -----------------------------------------------------------------
  'leo-xiv|messages/creation|messaggio-del-santo-padre-in-occasione-della-giornata-mondiale-di-preghiera-per-la-cura-del-creato-1-settembre-2025|2025-06-30': {
    ordinal: 10,
    printed: null,
    evidence: "Heading: 'Messaggio del Santo Padre in occasione della Giornata Mondiale di "
      + "Preghiera per la Cura del Creato [1° settembre 2025] (30 giugno 2025)' -- no ordinal "
      + "on the shelf. The document itself is headed 'MESSAGGIO DI SUA SANTITÀ PAPA LEONE XIV "
      + 'PER LA X GIORNATA MONDIALE DI PREGHIERA PER LA CURA DEL CREATO 2025 [1° settembre '
      + "2025]' and dated 'Dal Vaticano, 30 giugno 2025' (retrieved 2026-09-12). X repeats "
      + "2024's X: the Holy See reset the numbering so that the edition number matched the "
      + "tenth anniversary of Laudato si' in the 2025 Jubilee, and 2026 is XI. The series row's "
      + '`renumberings` records the reset (offset -1 from 2025), so invariant 24 accepts 10 here.',
  },

  // -- francesco ---------------------------------------------------------------
  'francesco|messages/sick|xxxiiii-giornata-mondiale-del-malato-2025|2025-01-14': {
    ordinal: 33,
    printed: 'XXXIIII',
    evidence: "Heading: 'XXXIIII Giornata Mondiale del Malato, 2025'. Not a Roman numeral. The "
      + "document is headed 'Messaggio del Santo Padre Francesco in occasione della XXXIII "
      + "Giornata Mondiale del Malato, 11 febbraio 2025' and opens 'Celebriamo la XXXIII "
      + "Giornata Mondiale del Malato nell’Anno Giubilare 2025'; 2025 - 1993 + 1 = 33.",
  },
};
