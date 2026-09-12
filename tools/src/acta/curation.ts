/**
 * Hand-curated readings of the AAS chronological index (AAS-only documents spec §5), in
 * the style of series-curation.ts: nothing here is inferred, every row quotes the index
 * line it applies to and the evidence for the reading, and a row that matches no parsed
 * entry fails the data tests rather than sitting unnoticed.
 *
 * The corrections and holds are keyed `${volume year}:${page}`, the overrides
 * `AAS:${volume}:${page}` -- both the reference the index itself gives an act, unique by
 * invariant 25 (one page opens one act). The matcher (match.ts) reads the corrections and
 * the overrides, the creator (create.ts) the corrections and the holds: a corrected entry
 * matches its shelf record by the corrected date instead of being held or created under
 * the printed one, an overridden entry is the citation of the document the row names, and
 * a held entry is never created whatever the rules would otherwise do.
 */

export interface IndexCorrection {
  /** The date the index prints, ISO, after ditto resolution -- what the parser reads. */
  printed: string;
  /** The act's date, ISO, as its own dating formula gives it. */
  date: string;
  /** The index line, quoted as extracted. */
  indexLine: string;
  /** The act's own dating evidence, quoted, and where it was read. */
  evidence: string;
}

/**
 * Index misprints: an entry whose printed date the act itself contradicts. Phase 1 (PR #29)
 * read three; two are corrections, and the third -- *Episcopalis communio*, 2018 -- was a
 * parser defect, not a misprint: the index prints `  Sept. » Chengden.:` with no day two
 * entries before it, the parser skipped that line, and the two `» »` months that followed
 * inherited May from the entry before it instead of September. The parser now advances
 * the ditto month on a day-less line (index.ts), so *Episcopalis communio* reads 15
 * September 2018 and *Prisrensis-Priscensis* 5 September 2018 from the fixture as printed,
 * and neither needs a row here.
 */
export const ACTA_INDEX_CORRECTIONS: Readonly<Record<string, IndexCorrection>> = {
  '2016:602': {
    printed: '2016-03-31',
    date: '2016-05-31',
    indexLine: '2016 Mart. 31 « De Concordia inter Codices  ». Quibus nonnullae normae / '
      + 'Codicis Iuris Canonici immutantur  .  .  .  .  .  .  .  .  .  602',
    evidence: "The act's own dating formula reads 'Datum Romae, apud Sanctum Petrum, die XXXI "
      + "mensis Maii anno MMXVI, Pontificatus Nostri quarto' (vatican.va, "
      + '…/motu_proprio/documents/papa-francesco-motu-proprio_20160531_de-concordia-inter-codices.html, '
      + 'read 2026-09-12) -- 31 May 2016, the fourth year of a pontificate begun 13 March 2013. '
      + 'The index prints `Mart.` for `Maii`; the shelf record is '
      + '`mag:francis-i/de-concordia-inter-codices-2016`, dated 2016-05-31.',
  },
  '2016:835': {
    printed: '2016-07-29',
    date: '2016-06-29',
    indexLine: ' »  » 29 « Vultum Dei quaerere ». De vita contemplativa mulierum   .  .  835',
    evidence: "The act's own dating formula reads 'Datum Romae apud S. Petrum die XXIX mensis "
      + 'Iunii, in Sollemnitate SS. Petri et Pauli Apostolorum, anno MMXVI, Iubilaeo '
      + "Misericordiae, Pontificatus Nostri quarto' (vatican.va, "
      + '…/apost_constitutions/documents/papa-francesco_costituzione-ap_20160629_vultum-dei-quaerere.html, '
      + 'read 2026-09-12) -- 29 June 2016. The index enters it after the constitution of 20 '
      + 'July 2016 (*Brasiliensium fidelium*) with a ditto month, so it reads 29 July; the '
      + 'shelf record is `mag:francis-i/vultum-dei-quaerere-2016`, dated 2016-06-29.',
  },
};

export interface MatchOverride {
  /** The document the entry is the citation of. */
  documentId: string;
  /** The index line, quoted as extracted. */
  indexLine: string;
  /** The headings of the document chosen and of the one the class rule chose, and why the rule picked wrong. */
  evidence: string;
}

/**
 * Entries the matcher's class rule sends to the wrong document, keyed by the reference
 * the index gives the act (`AAS:{volume}:{page}`) and consulted before the class rule
 * (match.ts): the override names the document outright and does not require it to
 * satisfy the class rule, since the class rule is what was wrong. Each row is a measured
 * harm of the discussion #30 question -- the shelf and the *Acta* disagree about the class
 * -- and quotes the index line and both headings.
 */
export const ACTA_MATCH_OVERRIDES: Readonly<Record<string, MatchOverride>> = {
  'AAS:116:189': {
    documentId: 'mag:francis-i/apostolic-letter-2024-01-16-2',
    indexLine: ' 16 Ian. 2024 « Finis et modus ». De limitibus et de rationibus administratio- / '
      + 'nis ordinariae.  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  189',
    evidence: "The act is vatican.va's 'Lettera Apostolica in forma di Motu Proprio circa i limiti e le "
      + "modalità dell'ordinaria amministrazione' (apost_letters, 16 January 2024, "
      + '`mag:francis-i/apostolic-letter-2024-01-16-2`): the same subject as the index\'s *De limitibus '
      + 'et de rationibus administrationis ordinariae*, and the heading itself says motu proprio. The '
      + 'shelf files it on apost_letters alone, so the record carries no `motu-proprio` characteristic '
      + "(discussion #30), and the class rule found one candidate of the class on the date instead -- the "
      + "'Decreto del Sommo Pontefice Francesco relativo alla pubblicazione di provvedimenti normativi "
      + "nello Stato della Città del Vaticano' (motu_proprio, `mag:francis-i/apostolic-letter-2024-01-16-1`), "
      + 'which the index lists separately under *Decreta* (AAS 116 (2024) 194, *Res quae pertinent ad '
      + 'promulgationem provisionum normarum Status Civitatis Vaticanae*). Phase 1 wrote the reference on '
      + 'the decree; this row sends it to the letter.',
  },
};

/** The override key of an entry: the index's own reference, series, volume and first page. */
export const overrideKey = (e: { series: string; volume: number; page: number }): string =>
  `${e.series}:${e.volume}:${e.page}`;

export interface ActaHold {
  /** The index line, quoted as extracted. */
  indexLine: string;
  /** Why the owner has decided the entry is not to become a document. */
  reason: string;
}

/**
 * Entries the owner has decided are not to be created regardless of the rules (spec §5).
 * Empty until needed: the discussion #30 acts and the Tarragona letters (#31) are held by
 * the duplicate guard and the ambiguity rule, not by a row here.
 */
export const ACTA_HOLDS: Readonly<Record<string, ActaHold>> = {};

/** The curation key of an entry: the volume year and first page the index cites. */
export const curationKey = (e: { year: number; page: number }): string => `${e.year}:${e.page}`;

export interface SharedPage {
  /** The documents the page opens, by id. */
  documentIds: readonly string[];
  /** Where in the volume the page was read, and what it prints. */
  evidence: string;
}

/**
 * Pages of the *Acta* that open more than one act (acta volumes spec, sample report
 * §2): invariant 25 reads "one page opens one act", which holds for every act long
 * enough to fill a page and fails for two short apostolic letters set one after the
 * other. Keyed `AAS:{volume}[-{part}]:{page}`; the validator exempts exactly the listed
 * documents from rule 25 on that page, and any other document citing it still fails.
 * Every row quotes the page as the volume prints it -- never an inference from the index.
 */
export const ACTA_SHARED_PAGES: Readonly<Record<string, SharedPage>> = {
  'AAS:70:150': {
    documentIds: ['mag:paul-vi/sacra-illa-1978', 'mag:paul-vi/quoniam-beatissima-1978'],
    evidence: 'AAS 70 (1978) p. 150 (PDF page 150 of AAS-70-1978-ocr.pdf, read 2026-09-13) prints two '
      + "apostolic letters under one running header: 'Ad perpetuam rei memoriam. — Sacra illa aedes, "
      + "quae, Beatae Ma-' (9 January 1978, the parish church of Nicaea a minor basilica) and, lower on "
      + "the same page, 'Ad perpetuam rei memoriam. — Quoniam beatissima Deipara Virgo' (11 January 1978, "
      + 'Our Lady of Monte Berico patron of Vicenza). The chronological index cites both at 150 '
      + '(`1978 Ian. 9 Sacra illa … 150`, `1978 Ian. 11 Quoniam beatissima … 150`).',
  },
};
