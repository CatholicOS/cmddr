/**
 * Ecumenical councils harvested from vatican.va's own archive
 * (`/archive/hist_councils/`), which holds exactly two: Vatican I and Vatican II
 * (spec §2.1). Vatican I is already in the registry by a different route -- its two
 * constitutions are filed on Pius IX's own page and reassigned through
 * CONCILIAR_REASSIGNMENTS -- and is deliberately not re-sourced here (spec §9.2).
 */

/** The three section headings the Vatican II index groups its documents under. */
export type CouncilSection = 'Costituzioni' | 'Dichiarazioni' | 'Decreti';

export interface CouncilDocument {
  /** The index section this document is filed under; cross-checked against the page. */
  section: CouncilSection;
  /** The genre label as the document itself prints it, normalised to sentence case. */
  sourceGenreLabel: string;
  /** Only where the document prints the qualifier; three of sixteen do (spec §2.4). */
  descriptiveTitle?: 'dogmatic' | 'pastoral';
  /**
   * The document's own printed heading, verbatim, as the evidence for the two fields
   * above. Never written to a record -- no DocumentRecord field holds it -- so that a
   * reader can audit the label without refetching 1.4 MB of document pages.
   */
  heading: string;
  /**
   * The promulgation date the document itself prints. Checked against the date read
   * from the URL slug (spec §2.3); never used to override it. Twelve documents print
   * it as 'Roma, presso San Pietro, {date}'; Lumen Gentium and Dei Verbum print it in
   * the heading; Sacrosanctum Concilium and Inter Mirifica print a bare '4 dicembre
   * 1963' at the end of the text.
   */
  printedDate: string;
}

export interface CouncilSource {
  /** The vatican.va archive path segment, e.g. 'ii_vatican_council'. Note Vatican I
   *  hyphenates ('i-vatican-council') where Vatican II underscores. */
  pageSlug: string;
  /** The COECDR id, e.g. 'oec:vatican-ii'. */
  issuerId: string;
  /** The pope who promulgated every document of this council (spec §2.5). */
  promulgatedBy: string;
  /** The council's closed document set, keyed by incipit slug. */
  documents: Record<string, CouncilDocument>;
  /**
   * The date this council's fixture was fetched from vatican.va. Councils carry their
   * own date because `FIXTURES_RETRIEVED` in harvest/run.ts records when the *pope*
   * fixtures were fetched (2026-09-07) and must not be restamped onto them; this
   * fixture was fetched a day later.
   */
  retrieved: string;
}

/**
 * The sixteen documents of the Second Vatican Council. A closed set: the adapter
 * fails if the index carries a document not listed here, or if a row here matches
 * no item on the index (spec §6).
 *
 * Every field was read from that document's own page on 2026-09-08, not from the
 * index, which prints neither dates nor genre qualifiers (spec §2.2).
 */
export const VATICAN_II_DOCUMENTS: Record<string, CouncilDocument> = {
  // -- Costituzioni (4) ----------------------------------------------------------
  'dei-verbum': {
    section: 'Costituzioni',
    sourceGenreLabel: 'Costituzione dogmatica',
    descriptiveTitle: 'dogmatic',
    heading: 'COSTITUZIONE DOGMATICA SULLA DIVINA RIVELAZIONE',
    printedDate: '1965-11-18',
  },
  'lumen-gentium': {
    section: 'Costituzioni',
    sourceGenreLabel: 'Costituzione dogmatica',
    descriptiveTitle: 'dogmatic',
    heading: 'COSTITUZIONE DOGMATICA SULLA CHIESA',
    printedDate: '1964-11-21',
  },
  // The only constitution that prints no qualifier at all -- not 'dogmatica', not
  // 'pastorale'. It therefore takes no descriptiveTitle; the field's enum has no third
  // value and must not grow one to cover a qualifier the source does not print.
  'sacrosanctum-concilium': {
    section: 'Costituzioni',
    sourceGenreLabel: 'Costituzione',
    heading: 'COSTITUZIONE SULLA SACRA LITURGIA',
    printedDate: '1963-12-04',
  },
  'gaudium-et-spes': {
    section: 'Costituzioni',
    sourceGenreLabel: 'Costituzione pastorale',
    descriptiveTitle: 'pastoral',
    // The page prints a footnote marker '(1)' after this heading; the marker is not
    // part of the heading and is omitted here.
    heading: 'COSTITUZIONE PASTORALE SULLA CHIESA NEL MONDO CONTEMPORANEO',
    printedDate: '1965-12-07',
  },

  // -- Dichiarazioni (3) ---------------------------------------------------------
  'gravissimum-educationis': {
    section: 'Dichiarazioni',
    sourceGenreLabel: 'Dichiarazione',
    heading: 'DICHIARAZIONE SULL’EDUCAZIONE CRISTIANA',
    printedDate: '1965-10-28',
  },
  'nostra-aetate': {
    section: 'Dichiarazioni',
    sourceGenreLabel: 'Dichiarazione',
    heading: 'DICHIARAZIONE SULLE RELAZIONI DELLA CHIESA CON LE RELIGIONI NON CRISTIANE',
    printedDate: '1965-10-28',
  },
  'dignitatis-humanae': {
    section: 'Dichiarazioni',
    sourceGenreLabel: 'Dichiarazione',
    heading: 'DICHIARAZIONE SULLA LIBERTÀ RELIGIOSA',
    printedDate: '1965-12-07',
  },

  // -- Decreti (9) ---------------------------------------------------------------
  'ad-gentes': {
    section: 'Decreti',
    sourceGenreLabel: 'Decreto',
    // 'ATTIVITA' is printed without its accent on the page; quoted as printed.
    heading: 'DECRETO SULL’ATTIVITA MISSIONARIA DELLA CHIESA',
    printedDate: '1965-12-07',
  },
  'presbyterorum-ordinis': {
    section: 'Decreti',
    sourceGenreLabel: 'Decreto',
    heading: 'DECRETO SUL MINISTERO E LA VITA DEI PRESBITERI',
    printedDate: '1965-12-07',
  },
  'apostolicam-actuositatem': {
    section: 'Decreti',
    sourceGenreLabel: 'Decreto',
    heading: 'DECRETO SULL’APOSTOLATO DEI LAICI',
    printedDate: '1965-11-18',
  },
  'optatam-totius': {
    section: 'Decreti',
    sourceGenreLabel: 'Decreto',
    heading: 'DECRETO SULLA FORMAZIONE SACERDOTALE',
    printedDate: '1965-10-28',
  },
  'perfectae-caritatis': {
    section: 'Decreti',
    sourceGenreLabel: 'Decreto',
    heading: 'DECRETO SUL RINNOVAMENTO DELLA VITA RELIGIOSA',
    printedDate: '1965-10-28',
  },
  'christus-dominus': {
    section: 'Decreti',
    sourceGenreLabel: 'Decreto',
    heading: 'DECRETO SULLA MISSIONE PASTORALE DEI VESCOVI NELLA CHIESA',
    printedDate: '1965-10-28',
  },
  'unitatis-redintegratio': {
    section: 'Decreti',
    sourceGenreLabel: 'Decreto',
    heading: 'DECRETO SULL’ECUMENISMO',
    printedDate: '1964-11-21',
  },
  'orientalium-ecclesiarum': {
    section: 'Decreti',
    sourceGenreLabel: 'Decreto',
    heading: 'DECRETO SULLE CHIESE CATTOLICHE ORIENTALI',
    printedDate: '1964-11-21',
  },
  'inter-mirifica': {
    section: 'Decreti',
    sourceGenreLabel: 'Decreto',
    heading: 'DECRETO SUGLI STRUMENTI DI COMUNICAZIONE SOCIALE',
    printedDate: '1963-12-04',
  },
};

export const COUNCILS: readonly CouncilSource[] = [
  {
    pageSlug: 'ii_vatican_council',
    issuerId: 'oec:vatican-ii',
    promulgatedBy: 'rp:paul-vi',
    documents: VATICAN_II_DOCUMENTS,
    retrieved: '2026-09-08',
  },
];

/**
 * vatican.va's archive-era translation-link suffixes, mapped to the two-letter
 * uppercase codes the registry records in `source.languages`. These are NOT ISO
 * codes: `lt` is Latin (every document's own printed code bar shows LA and none
 * shows LT), `ge` is German, `sp` Spanish, `po` Portuguese.
 *
 * Verified for all sixteen documents by comparing the set derived from the index's
 * link suffixes against the code bar each document prints (spec §2.6). `hr` occurs
 * once, on Nostra Aetate alone; `he` occurs on Dei Verbum as a PDF and on Nostra
 * Aetate as HTML. Chinese is not a `documents/` link at all and is handled
 * separately by the adapter.
 */
export const ARCHIVE_LANGUAGE_SUFFIXES: Record<string, string> = {
  ar: 'AR', be: 'BE', cs: 'CS', en: 'EN', fr: 'FR', ge: 'DE', he: 'HE', hr: 'HR',
  hu: 'HU', it: 'IT', lt: 'LA', lv: 'LV', po: 'PT', sp: 'ES', sw: 'SW',
};
