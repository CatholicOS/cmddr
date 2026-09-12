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
 * is a `message` -- on the Urbi et Orbi shelf too, where an excluded item is a radio
 * message and not a blessing, so it carries no `actKind` -- gets no `series`, and takes
 * the provisional form `mag:{issuer}/message-YYYY-MM-DD` rather than the series-form id.
 * Adjudicated by the repository owner on PR #26.
 */
export const SERIES_EXCLUSIONS: Record<string, SeriesExclusion> = {

  // -- paul-vi -----------------------------------------------------------------
  'paul-vi|messages/sick|giornata-mondiale-del-malato-1975|1975-09-16': {
    evidence: "Heading: 'Giornata Mondiale del Malato - 1975' "
      + '(hf_p-vi_mes_19750916_world-day-of-the-sick-1975.html), the only item on the Paul VI '
      + 'sick shelf. The document itself places the day in the 1975 Holy Year: it is addressed '
      + "'A tutti i malati del mondo cattolico che, in occasione della speciale celebrazione "
      + "giubilare, si uniranno ai Fratelli sofferenti convenuti nella Basilica', thanks them for "
      + "their 'partecipazione all'Anno Santo', and calls their offering 'una delle componenti "
      + "essenziali del presente Giubileo'. A world day of the Holy Year, then, not the annual "
      + 'World Day of the Sick John Paul II instituted in 1992 (first kept in 1993, the '
      + "series' verified firstYear); vatican.va files it on the same sub-shelf. Excluded so "
      + 'that the series holds only the annual day.',
  },

  // -- john-xxiii --------------------------------------------------------------
  // John XXIII's urbi_et_orbi shelf files, beside the feast-day Urbi et Orbi messages, the
  // radio messages this pope broadcast to the world on other occasions and in the days
  // before Christmas and Easter -- the Christmas-eve radio message being a tradition Pius
  // XII began, whose own are filed under speeches -- and one address given at the Easter
  // Vigil. In 1960, 1961, 1962 (Easter) and 1963 the shelf holds both the pre-feast act
  // and the feast-day message: the feast-day one is the Urbi et Orbi proper and holds the
  // series slot; the pre-feast act is a message. The three remaining broadcasts are not
  // Christmas or Easter acts at all. Each row quotes the heading and, where the heading
  // does not itself say what the act is, the document.
  'john-xxiii|messages/urbi_et_orbi|radiomessaggio-ai-fedeli-e-ai-popoli-del-mondo-intero-22-dicembre-1960|1960-12-22': {
    evidence: "Heading: 'Radiomessaggio ai fedeli e ai popoli del mondo intero, 22 dicembre 1960' "
      + '(hf_j-xxiii_mes_19601222_urbi.html). The pre-Christmas radio message; the shelf holds '
      + "'Messaggio Urbi et Orbi in occasione del Natale (25 dicembre 1960)' for the feast itself, "
      + 'which is the Christmas 1960 entry of the series. A radio message, not a blessing.',
  },
  'john-xxiii|messages/urbi_et_orbi|radiomessaggio-a-tutto-il-mondo-per-la-concordia-tra-le-genti-10-settembre-1961|1961-09-10': {
    evidence: "Heading: 'Radiomessaggio a tutto il mondo per la concordia tra le genti, 10 settembre "
      + "1961' (hf_j-xxiii_mes_19610910_urbi-concordia.html). A radio message on the crisis of "
      + 'September 1961; neither Christmas nor Easter, and not a blessing.',
  },
  'john-xxiii|messages/urbi_et_orbi|radiomessaggio-ai-fedeli-e-ai-popoli-di-tutto-il-mondo-in-occasione-del-natale-21-dicembre-1961|1961-12-21': {
    evidence: "Heading: 'Radiomessaggio ai fedeli e ai popoli di tutto il mondo in occasione del "
      + "Natale, 21 dicembre 1961' (hf_j-xxiii_mes_19611221_urbi-natale.html). The pre-Christmas "
      + "radio message; the shelf holds 'Radiomessaggio a tutti i fedeli del mondo e di Roma, in "
      + "occasione del Natale, 25 dicembre 1961' for the feast itself, which is the Christmas "
      + '1961 entry of the series. A radio message, not a blessing.',
  },
  'john-xxiii|messages/urbi_et_orbi|ai-fedeli-di-tutto-il-mondo-nel-giorno-della-solennita-di-pasqua|1962-04-21': {
    evidence: "Heading: 'Ai fedeli di tutto il mondo nel giorno della Solennità di Pasqua (21 aprile "
      + "1962)' (hf_j-xxiii_mes_19620421_urbi-resurrezione.html). The document is dated '21 aprile "
      + "1962' and opens 'Questa santa notte di vigilia rinnova, ancora una volta … i riti liturgici "
      + "secondo le più antiche tradizioni dell'Oriente e dell'Occidente': the address given at the "
      + 'Easter Vigil. The shelf holds the same heading dated 22 April 1962, Easter Sunday '
      + "(hf_j-xxiii_mes_19620422_urbi-pasqua), whose document is headed 'Piazza San Pietro, "
      + "Domenica di Pasqua, 22 aprile 1962' and begins 'La grande benedizione annunciata in "
      + "Vigilia Paschali, ieri sera, Ci disponiamo ad estenderla, ora, a tutti voi' -- the "
      + 'blessing itself, and the Easter 1962 entry of the series. The Vigil address announced '
      + 'the blessing; it is not the blessing.',
  },
  'john-xxiii|messages/urbi_et_orbi|radiomessaggio-ai-fedeli-di-tutto-il-mondo-in-occasione-delle-imprese-di-navigazione-spaziale-12-agosto-1962-giovanni-xxiii|1962-08-12': {
    evidence: "Heading: 'Radiomessaggio ai fedeli di tutto il mondo in occasione delle imprese di "
      + "navigazione spaziale, 12 agosto 1962, Giovanni XXIII' "
      + '(hf_j-xxiii_mes_19620812_navigazione-spaziale.html). A radio message on the space '
      + 'flights of August 1962; neither Christmas nor Easter, and not a blessing.',
  },
  'john-xxiii|messages/urbi_et_orbi|inizio-della-quaresima-radiomessaggio-di-giovanni-xxiii-27-febbraio-1963|1963-02-27': {
    evidence: "Heading: 'Inizio della Quaresima, Radiomessaggio di Giovanni XXIII, 27 febbraio 1963' "
      + '(hf_j-xxiii_mes_19630227_inizio-quaresima.html). A radio message for Ash Wednesday; '
      + 'neither Christmas nor Easter, and not a blessing.',
  },
  'john-xxiii|messages/urbi_et_orbi|radiomessaggio-ai-fedeli-e-al-mondo-intero-in-occasione-della-solennita-della-resurrezione-13-aprile-1963-giovanni-xxiii|1963-04-13': {
    evidence: "Heading: 'Radiomessaggio ai fedeli e al mondo intero in occasione della Solennità "
      + "della Resurrezione, 13 aprile 1963, Giovanni XXIII' "
      + '(hf_j-xxiii_mes_19630413_messaggio-resurrezione.html) -- Holy Saturday. The shelf holds '
      + "'Messaggio nella Solennità di Pasqua (14 aprile 1963)', Easter Sunday, which is the "
      + 'Easter 1963 entry of the series. The eve broadcast is a message, not a blessing.',
  },
};

/** The reasoning shared by the Francis consecrated-life rows; each row quotes its own heading first. */
const CONSECRATED_LIFE_EVIDENCE =
  'The heading prints the occasion year only inside its date parenthetical, which on this '
  + 'shelf is the day of the occasion itself: the World Day for Consecrated Life is 2 '
  + 'February (the Presentation of the Lord, anticipated to 1 February when the 2nd falls '
  + 'on a Sunday), and each page is the homily or message of that day '
  + '(…_omelia-vita-consacrata.html). The year is that of the printed date, recorded here '
  + 'rather than read off `date` because §3.2.5 forbids the parser that inference.';

/** The reasoning shared by the John Paul II tourism rows; each row quotes its own heading first. */
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
  'john-paul-ii|messages/tourism|messaggio-per-la-giornata-mondiale-del-turismo|2004-05-30': {
    year: 2004, printed: null,
    evidence: "Heading: 'Messaggio per la Giornata Mondiale del Turismo (27 settembre 2004)'. " + TOURISM_EVIDENCE,
  },
  'john-paul-ii|messages/tourism|messaggio-per-la-giornata-mondiale-del-turismo|2003-06-11': {
    year: 2003, printed: null,
    evidence: "Heading: 'Messaggio per la Giornata Mondiale del Turismo (27 settembre 2003)'. " + TOURISM_EVIDENCE,
  },
  'john-paul-ii|messages/tourism|messaggio-per-la-giornata-mondiale-del-turismo|2002-06-24': {
    year: 2002, printed: null,
    evidence: "Heading: 'Messaggio per la Giornata Mondiale del Turismo (27 settembre 2002)'. " + TOURISM_EVIDENCE,
  },
  'john-paul-ii|messages/tourism|messaggio-per-la-giornata-mondiale-del-turismo|2001-06-09': {
    year: 2001, printed: null,
    evidence: "Heading: 'Messaggio per la Giornata Mondiale del Turismo (27 settembre 2001)'. " + TOURISM_EVIDENCE,
  },
  'john-paul-ii|messages/tourism|messaggio-per-la-giornata-mondiale-del-turismo|2000-07-29': {
    year: 2000, printed: null,
    evidence: "Heading: 'Messaggio per la Giornata Mondiale del Turismo (27 settembre 2000)'. " + TOURISM_EVIDENCE,
  },
  'john-paul-ii|messages/tourism|messaggio-per-la-giornata-mondiale-del-turismo|1982-09-27': {
    year: 1982, printed: null,
    evidence: "Heading: 'Messaggio per la Giornata Mondiale del Turismo (27 settembre 1982)'. " + TOURISM_EVIDENCE,
  },

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
  'francesco|messages/consecrated_life|xxix-giornata-mondiale-della-vita-consacrata-festa-della-presentazione-del-signore|2025-02-01': {
    year: 2025, printed: null,
    evidence: "Heading: 'XXIX Giornata Mondiale della Vita Consacrata - Festa della Presentazione del Signore (1° febbraio 2025)'. " + CONSECRATED_LIFE_EVIDENCE,
  },
  'francesco|messages/consecrated_life|xxviii-giornata-mondiale-della-vita-consacrata-festa-della-presentazione-del-signore|2024-02-02': {
    year: 2024, printed: null,
    evidence: "Heading: 'XXVIII Giornata Mondiale della Vita Consacrata - Festa della Presentazione del Signore (2 febbraio 2024)'. " + CONSECRATED_LIFE_EVIDENCE,
  },
  'francesco|messages/consecrated_life|xxvi-giornata-mondiale-della-vita-consacrata-festa-della-presentazione-del-signore|2022-02-02': {
    year: 2022, printed: null,
    evidence: "Heading: 'XXVI Giornata Mondiale della Vita Consacrata - Festa della presentazione del Signore (2 febbraio 2022)'. " + CONSECRATED_LIFE_EVIDENCE,
  },
  'francesco|messages/consecrated_life|xxv-giornata-mondiale-della-vita-consacrata-festa-della-presentazione-del-signore|2021-02-02': {
    year: 2021, printed: null,
    evidence: "Heading: 'XXV Giornata Mondiale della Vita Consacrata - Festa della presentazione del Signore (2 febbraio 2021)'. " + CONSECRATED_LIFE_EVIDENCE,
  },
  'francesco|messages/consecrated_life|xxiv-giornata-mondiale-della-vita-consacrata-festa-della-presentazione-del-signore|2020-02-01': {
    year: 2020, printed: null,
    evidence: "Heading: 'XXIV Giornata Mondiale della Vita Consacrata - Festa della Presentazione del Signore (1 febbraio 2020)'. " + CONSECRATED_LIFE_EVIDENCE,
  },
  'francesco|messages/consecrated_life|xxiii-giornata-mondiale-della-vita-consacrata-festa-della-presentazione-del-signore|2019-02-02': {
    year: 2019, printed: null,
    evidence: "Heading: 'XXIII Giornata Mondiale della Vita Consacrata - Festa della Presentazione del Signore (2 febbraio 2019)'. " + CONSECRATED_LIFE_EVIDENCE,
  },
  'francesco|messages/consecrated_life|xxii-giornata-mondiale-della-vita-consacrata-festa-della-presentazione-del-signore|2018-02-02': {
    year: 2018, printed: null,
    evidence: "Heading: 'XXII Giornata Mondiale della Vita Consacrata - Festa della Presentazione del Signore (2 febbraio 2018)'. " + CONSECRATED_LIFE_EVIDENCE,
  },
  'francesco|messages/consecrated_life|xxi-giornata-mondiale-della-vita-consacrata-festa-della-presentazione-del-signore|2017-02-02': {
    year: 2017, printed: null,
    evidence: "Heading: 'XXI Giornata Mondiale della Vita Consacrata - Festa della Presentazione del Signore (2 febbraio 2017)'. " + CONSECRATED_LIFE_EVIDENCE,
  },
  'francesco|messages/consecrated_life|xix-giornata-mondiale-della-vita-consacrata-festa-della-presentazione-del-signore|2015-02-02': {
    year: 2015, printed: null,
    evidence: "Heading: 'XIX Giornata Mondiale della Vita Consacrata - Festa della Presentazione del Signore (2 febbraio 2015)'. " + CONSECRATED_LIFE_EVIDENCE,
  },
  'francesco|messages/consecrated_life|xviii-giornata-mondiale-della-vita-consacrata-festa-della-presentazione-del-signore|2014-02-02': {
    year: 2014, printed: null,
    evidence: "Heading: 'XVIII Giornata Mondiale della Vita Consacrata - Festa della Presentazione del Signore (2 febbraio 2014)'. " + CONSECRATED_LIFE_EVIDENCE,
  },
  'francesco|messages/consecrated_life|xx-giornata-mondiale-della-vita-consacrata-giubileo-straordinario-della-misericordia-giubileo-della-vita-consacrata-e-chiusura-dell-anno-della-vita-consacrata|2016-02-02': {
    year: 2016, printed: null,
    evidence: "Heading: 'XX Giornata Mondiale della Vita Consacrata - Giubileo Straordinario della Misericordia: Giubileo della Vita Consacrata e Chiusura dell’Anno della Vita Consacrata (2 febbraio 2016)'. " + CONSECRATED_LIFE_EVIDENCE,
  },
  'francesco|messages/consecrated_life|messaggio-del-santo-padre-ai-consacrati-riuniti-nella-basilica-di-s-maria-maggiore-in-occasione-della-giornata-mondiale-della-vita-consacrata|2023-02-02': {
    year: 2023, printed: null,
    evidence: "Heading: 'Messaggio del Santo Padre ai consacrati riuniti nella Basilica di S. Maria Maggiore in occasione della Giornata Mondiale della Vita Consacrata (2 febbraio 2023)'. " + CONSECRATED_LIFE_EVIDENCE,
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

export interface UrbiOccasion {
  /** The series the item belongs to, by the occasion the heading names. */
  series: 'urbi-et-orbi-christmas' | 'urbi-et-orbi-easter';
  /** The occasion year. */
  year: number;
  /** The heading, quoted, and the evidence that the item is the feast's Urbi et Orbi. */
  evidence: string;
}

/**
 * Urbi et Orbi items whose `date` is neither 25 December nor Easter Sunday but which are
 * the feast's Urbi et Orbi message all the same, by the heading's own word and because the
 * shelf holds no feast-day item for that year. Consulted ahead of the date rule (spec
 * §2.4, §3.2.7), which stays the rule for every uncurated item. Adjudicated by the
 * repository owner on PR #26.
 */
export const SERIES_URBI_OCCASIONS: Record<string, UrbiOccasion> = {
  // Keyed on the adjudicated date (DATE_CORRECTIONS), not the heading's 25 December.
  'john-xxiii|messages/urbi_et_orbi|santo-natale|1962-12-22': {
    series: 'urbi-et-orbi-christmas', year: 1962,
    evidence: "Heading: 'Santo Natale (25 dicembre 1962)' (hf_j-xxiii_mes_19621222_urbi-natale.html). "
      + 'vatican.va names the feast in the heading; the document is the radio message of '
      + "Saturday 22 December 1962 (see DATE_CORRECTIONS). Unlike 1960 and 1961, the shelf holds "
      + 'no 25 December item for 1962, so this is the Christmas 1962 message of the series, '
      + 'keyed by the occasion year as every series-form id is.',
  },
};
