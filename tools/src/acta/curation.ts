/**
 * Hand-curated readings of the AAS chronological index (AAS-only documents spec §5), in
 * the style of series-curation.ts: nothing here is inferred, every row quotes the index
 * line it applies to and the evidence for the reading, and a row that matches no parsed
 * entry fails the data tests rather than sitting unnoticed.
 *
 * Both tables are keyed `${volume year}:${page}` -- the reference the index itself gives
 * an act, unique by invariant 25 (one page opens one act) -- and both are read by the
 * matcher (match.ts) and the creator (create.ts): a corrected entry matches its shelf
 * record by the corrected date instead of being held or created under the printed one,
 * and a held entry is never created whatever the rules would otherwise do.
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
