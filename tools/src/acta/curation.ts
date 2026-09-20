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
  // Phase 2b-ii-a (AAS 24-49): dates the OCR of the volumes' text layer misread inside
  // the century, which the parser never repairs (index.ts: AAS 41 prints `1919` for 1948
  // and for 1949 alike), each against the act's own dating formula in the same volume,
  // read in the volume PDF on 2026-09-13. A row whose `date` equals a reading the parser
  // noted (a year no volume can print, `3939` or `1963`, read as the one year of the
  // volume's span a digit off) *confirms* the reading and lets the creator create the
  // entry -- and, through the dittos that inherit the reading, the entries after it.
  '1936:249': {
    printed: '1930-06',
    date: '1936-06-29',
    indexLine: '.1930 Iunii 2$> Vigilanti cura. - Venerabilibus Fratribus Foederatarum / '
      + 'Americae Civitatum Archiepiscopis, Episcopis aliis- / que locorum Ordinariis pacem et communionem cum / '
      + 'Apostolica Sede habentibus: De cinematographicis / spectaculis 249',
    evidence: "The encyclical's own dating formula reads 'Datum Romae, apud Sanctum Petrum, die xxix mensis "
      + "Iunii, in festo Ss. Apostolorum Petri et Pauli, anno MDCCCCXXXVI, Pontificatus Nostri quinto decimo' "
      + '(AAS 28 (1936) 263, PDF page 263 of AAS-28-1936-ocr.pdf, read 2026-09-13) -- 29 June 1936, the '
      + "fifteenth year of a pontificate begun 6 February 1922. The OCR reads the year as `1930` and the day "
      + 'as `2$>`, so the parser dates the entry to the month only, and to the wrong year; the shelf record '
      + 'is `mag:pius-xi/vigilanti-cura-1936`, dated 1936-06-29.',
  },
  '1936:5': {
    printed: '1935-12-26',
    date: '1935-12-20',
    indexLine: '1935 Doc. 26 Ad catholici sacerdotii. - Venerabilibus fratribus Patriar- / chis, Primatibus, Archiepiscopis, Episcopis aliisque / '
      + 'locorum Ordinariis pacem et communionem cum Apo- / stolica Sede habentibus: « De Sacerdotio Catholico ». 5',
    evidence: "The encyclical's own dating formula reads 'Datum Romae apud Sanctum Petrum, die xx mensis Decembris, anno MDCCCCXXXV, "
      + "ab inito a Nobis sacerdotio exeunte LVI, Pontificatus Nostri decimo quarto' (AAS 28 (1936) 53, PDF page 53 of "
      + 'AAS-28-1936-ocr.pdf, read 2026-09-13) -- 20 December 1935; the volume opens it at p. 5, the first page of the fascicle of '
      + "2 January 1936, under 'LITTERAE ENCYCLICAE'. The OCR reads the month as `Doc.` (read as December, index.ts) and the day as "
      + '`26`; the shelf record is `mag:pius-xi/ad-catholici-sacerdotii-1935`, dated 1935-12-20.',
  },
  '1939:413': {
    printed: '1930-10-20',
    date: '1939-10-20',
    indexLine: '1930 Oct. 20 Summi Pontificatus. - Venerabilibus fratribus Patriar- / chis, Primatibus, Archiepiscopis, Episcopis, aliisque / '
      + 'locorum Ordinariis pacem et communionem cum Apo- / stolica Sede habentibus 413',
    evidence: "The encyclical's own dating formula reads 'Datum ex Arce Gandulphi, prope Romam, die xx mensis Octobris, anno "
      + "MDCCCCXXXIX, Pontificatus Nostri primo' (AAS 31 (1939) 453, PDF page 453 of AAS-31-1939-ocr.pdf, read 2026-09-13) -- 20 "
      + "October 1939, the first year of a pontificate begun 2 March 1939; the volume opens it at p. 413, the first page of the "
      + "fascicle of 28 October 1939, under 'LITTERAE ENCYCLICAE'. The OCR reads the year column as `1930`; the shelf record is "
      + '`mag:pius-xii/summi-pontificatus-1939`, dated 1939-10-20.',
  },
  '1949:58': {
    printed: '1919-02-11',
    date: '1949-02-11',
    indexLine: '1919 Febr. 11 Ad universos Archiepiscopos, Episcopos aliosque locorum Ordinarios, / '
      + 'pacem et communionem cum Apostolica Sede habentes : de Missa / votiva celebranda in osorum Dei criminis expiattonem .... 58',
    evidence: "The exhortation's own dating formula reads 'Datum Romae apud Sanctum Petrum die xi Februarii anno "
      + "MCMXLIX, Pontificatus Nostri decimo' (AAS 41 (1949) 61, PDF page 61 of AAS-41-1949-ocr.pdf, read "
      + '2026-09-13) -- 11 February 1949, the tenth year of a pontificate begun 2 March 1939; its incipit, '
      + "which the index does not print, is *Conflictatio bonorum* (p. 58: 'Conflictatio bonorum et maiorum, "
      + "quorum semper commixtis moribus …'). The OCR reads the year as `1919`, before the pontificate; the "
      + 'shelf record is `mag:pius-xii/conflictatio-bonorum-1949`, dated 1949-02-11.',
  },
  // The constitutions of 1948 that AAS 41 (1949) prints under the line `19 IS Ian. 10
  // ICENSIS`, whose year the OCR has broken (index.ts: the year is left unprinted, `????`,
  // and the dittos after it inherit the blank), each against its dating formula.
  '1949:16': {
    printed: '????-07-15',
    date: '1948-07-15',
    indexLine: '  » » 15 GUAYAQUILENSIS (Fluminensis). - Christianae plebis. - A Dioecesi / Guayaquilensi Provincia civilis « Los Rios » '
      + 'dismembratur et / exinde novus erigitur Vicariatus Apostolicus Fluminensis ... 16',
    evidence: "The constitution's own dating formula reads 'Datum Romae apud S. Petrum, anno Domini millesimo nongentesimo "
      + "quadragesimo octavo, die quinta decima Iulii mensis, Pontificatus Nostri anno decimo' (AAS 41 (1949) 17, PDF page 17 of "
      + 'AAS-41-1949-ocr.pdf, read 2026-09-13) -- 15 July 1948, the tenth year of a pontificate begun 2 March 1939; the volume '
      + "opens the act at p. 16 under 'CONSTITUTIONES APOSTOLICAE / I / GUAYAQUILENSIS (FLUMINENSIS)'. The OCR reads the year "
      + 'column as `1919`. No shelf record carries the act.',
  },
  '1949:18': {
    printed: '????-07-17',
    date: '1948-07-17',
    indexLine: '  » » 17 EDMONTONENSIS {S. Pauli in Alberta). - Quo satis. - Ab archidioecesis / Edmontonensis territorio pars distrahitur '
      + 'quae in novam dioece- / sim S. Pauli in Alberta nomine erigitur . . 18',
    evidence: "The constitution's own dating formula reads 'Datum Romae apud S. Petrum, anno Domini millesimo nongentesimo "
      + "quadragesimo octavo, die decima septima Iulii mensis, Pontificatus Nostri anno decimo' (AAS 41 (1949) 20, PDF page 20 of "
      + "AAS-41-1949-ocr.pdf, read 2026-09-13) -- 17 July 1948; the volume opens the act at p. 18 under 'II / EDMONTONENSIS (S. "
      + "PAULI IN ALBERTA)'. The OCR reads the year column as `1919` and the toponym's parenthesis as `{`, so the entry is also "
      + 'held as OCR-damaged until its toponym is curated.',
  },
  '1949:62': {
    printed: '????-05-20',
    date: '1948-05-20',
    indexLine: '  » Maii 20 BOMBAYENSIS (Karachiensis). - Opportunis providentiae studiis. - Ab / Archidioecesi Bombayensi territorii pars '
      + 'seiungitur et nova / exinde erigitur Dioecesis, nomine « Karachiensis ...... 62',
    evidence: "The constitution's own dating formula reads 'Datum Romae apud S. Petrum, anno Domini millesimo nongentesimo "
      + "quadragesimo octavo, die vigesima Maii mensis, Pontificatus Nostri anno decimo' (AAS 41 (1949) 64, PDF page 64 of "
      + "AAS-41-1949-ocr.pdf, read 2026-09-13) -- 20 May 1948; the volume opens the act at p. 62 under 'CONSTITUTIO APOSTOLICA / "
      + "BOMBAYENSIS (KARACHIENSIS)'. The OCR reads the year column as `1919`. No shelf record carries the act.",
  },
  '1949:140': {
    printed: '????-07-08',
    date: '1948-07-08',
    indexLine: '  » Iulii 8 DE LULUA ET KATANGA (Lacus Moëri). - In Congo Belgico. - E Vica- / riatu Apostolico de Lulua et Katanga '
      + 'territorii pars distrahitur / et nova exinde Praefectura Apostolica erigitur, «Lacus Moëri» / nomine 140-',
    evidence: "The constitution's own dating formula reads 'Datum Romae apud S. Petrum, anno Domini millesimo nongentesimo "
      + "quadragesimo octavo, die octava mensis Iulii, Pontificatus Nostri anno decimo' (AAS 41 (1949) 142, PDF page 142 of "
      + 'AAS-41-1949-ocr.pdf, read 2026-09-13) -- 8 July 1948. The OCR reads the year column as `1919`. No shelf record carries the act.',
  },
  '1949:311': {
    printed: '????-08-07',
    date: '1948-08-07',
    indexLine: '  » Aug. 7 " OLIDENSIS ET RECIFENSIS (Caruaruensis). - Quo maiori. - Ab archidioe- / cesi Olidensi et Recifensi et a '
      + 'Dioecesibus Nazarensi et Pesquei- / rensi territoria distrahuntur, ex quibus nova Dioecesis Carua- / ruensis constituitur • 311',
    evidence: "The constitution's own dating formula reads 'Datum ex Arce Gandulphi, anno Domini millesimo nongentesimo "
      + "quadragesimo octavo, die septima Augusti mensis, Pontificatus Nostri anno decimo' (AAS 41 (1949) 313, PDF page 313 of "
      + "AAS-41-1949-ocr.pdf, read 2026-09-13) -- 7 August 1948; the volume opens the act at p. 311 under 'II / OLINDENSIS ET "
      + "RECIFENSIS (CARUARUENSIS)'. The OCR reads the year column as `1919`. No shelf record carries the act.",
  },
  '1949:161': {
    printed: '1919-04-15',
    date: '1949-04-15',
    indexLine: '1919 Aprilis 15 Redemptoris nostri cruciatus. - Ad Venerabiles Fratres Patriarchas, / Primates, Archiepiscopos, Episcopos '
      + 'aliosque locorum Ordinarios, / pacem et communionem cum Apostolica Sede habentes : de Sa- / cris Palaestinae Locis 161',
    evidence: "The encyclical's own dating formula reads 'Datum Romae, apud S. Petrum, die xv mensis Aprilis, feria sexta in "
      + "Parasceve, anno MCMXXXXIX, Pontificatus Nostri undecimo' (AAS 41 (1949) 164, PDF page 164 of AAS-41-1949-ocr.pdf, read "
      + "2026-09-13) -- 15 April 1949, Good Friday; the volume opens it at p. 161, the first page of the fascicle of 25 April 1949, "
      + "under 'EPISTULA ENCYCLICA' (the index's heading, `II - EPISTULA ENCÌCLICA` in the fixture's OCR). The OCR reads the year "
      + 'column as `1919`; the shelf record is `mag:pius-xii/redemptoris-nostri-cruciatus-1949`, dated 1949-04-15.',
  },
  '1940:42': {
    printed: '1939-11-20',
    date: '1939-11-20',
    indexLine: '3939 Nov. 20 Singulari animi. - Ad Exciimm P. D. Ioannem Panico, / Archiepiscopum tit. lustinianensem, eundemque De- / '
      + 'legatum Apostolicum in Australasia, quem Lega- / tum mittit ad Congressum Eucharisticum christifide- / lium Novae Zelandiae, '
      + 'in urbe Wellingtonensi cele- / brandum 42',
    evidence: "A confirmation: the OCR reads the year as `3939`, which no volume prints, and the parser reads 1939 and notes it. The "
      + "letter's own dating formula reads 'Datum Romae apud Sanctum Petrum, die xx mensis Novembris, anno MDCCCCXXXIX, Pontificatus "
      + "Nostri primo' (AAS 32 (1940) 43, PDF page 43 of AAS-32-1940-ocr.pdf, read 2026-09-13) -- 20 November 1939, the first year of "
      + "the pontificate; the volume opens it at p. 42 under 'EPISTULAE / I / AD EXCMUM P. D. IOANNEM PANICO, ARCHIEPISCOPUM TIT. "
      + "IUSTINIANENSEM …'. No shelf record carries the act.",
  },
  // Entries whose year the index does not print: a `»` in the year column with nothing
  // above it (the head of AAS 42's index), a year token the OCR has broken (`19 IS`,
  // `19Ö4`, `3918`) or misread beyond the parser's one-digit repair (`1961`), and the
  // dittos that inherit the blank. The parser dates each `????-MM-DD` (index.ts); these
  // rows supply the year from the act's own dating formula, read in the volume PDF, and
  // every row's month and day agree with the index's print. Where the act's page could
  // not be found under the index's page (AAS 41 (1949) 21, 27, 67, 69; AAS 45 (1953) 176,
  // 177, 266), or the OCR has damaged the incipit a row would mint (AAS 45 (1953) 173
  // `Qementium Solatrix`, 223 `Quanto praeseniius`, 267 `Quemadmodum piantana`, 489 `Qusi
  // praesidium`), no row is written and the entry stays held.
  "1950:753": {
    printed: "????-11-01",
    date: "1950-11-01",
    indexLine: " » Nov,. 1 Munificentissimus Deus. - Fidei Dogma definitur Deiparam Virgi- / nem Mariam corpore et anima fuisse ad caelestem gloriam as- / sumptam ................. 753",
    evidence: "The act's own dating formula reads 'Datum Romae, apud S. Petrum anno Iubilaei Maximi mil lesimo nongentesimo quinquagesimo, die prima mensis Novem bris, in festo omnium Sanctorum, Pontificatus Nostri anno duodecimo' (AAS 42 (1950) 771, PDF page 771 of AAS-42-1950-ocr.pdf, read 2026-09-13) -- 1950-11-01; the volume opens it at p. 753 under 'CONSTITUTIO APOSTOLICA / FIDEI DOGMA DEFINITUR DEIPARAM VIRGINEM MARIAM CORPORE ET ANIMA FUISSE AD CAELESTEM GLORIAM ASSUMPTAM / PIUS EPISCOPUS … Munificentissimus Deus, qui omnia potest', the first page of the fascicle of 4 November 1950. AAS 42's chronological index opens with this entry, whose year column prints `»` with nothing above it to inherit: the OCR lost the printed `1950`. The shelf record is `mag:pius-xii/munificentissimus-deus-1950`, dated 1950-11-01, the registry's dogmatic-definition bull.",
  },
  "1950:561": {
    printed: "????-08-12",
    date: "1950-08-12",
    indexLine: " » Aug. 12 Humani generis. - Ad Venerabiles Fratres Patriarchas, Primates, / Archiepiscopos, Episcopos aliosque Locorum Ordinarios, pacem et / communionem cum Apostolica Sede habentes : de nonnullis falsis / opinionibus, quae catholicae doctrinae fundamenta subruere mi- / minantur 561",
    evidence: "The act's own dating formula reads 'Datum Romae, apud S. Petrum, die xii mensis Augusti, anno MDCCCL, Pontificatus Nostri duodecimo. PIUS PP. XII' (the OCR's `MDCCCL` for MCML; AAS 42 (1950) 578, PDF page 578 of AAS-42-1950-ocr.pdf, read 2026-09-13) -- 1950-08-12, the twelfth year of a pontificate begun 2 March 1939; the volume opens it at p. 561 under 'LITTERAE ENCYCLICAE / AD VENERABILES FRATRES … DE NONNULLIS FALSIS OPINIONIBUS, QUAE CATHOLICAE DOCTRINAE FUNDAMENTA SUBRUERE MINANTUR', the first page of the fascicle of 2 September 1950. The second entry of AAS 42's index, inheriting by ditto the year the OCR lost on the first (`» Nov,. 1 Munificentissimus Deus`). The shelf record is `mag:pius-xii/humani-generis-1950`, dated 1950-08-12.",
  },
  "1955:5": {
    printed: "????-10-07",
    date: "1954-10-07",
    indexLine: "PAG. 19Ö4 Oet. 7 Ad Sinarum gentem. - Ad Venerabiles Fratres ac dilectos Mos / Archiepiscopos aliosque locorum Ordinarios ceterumque cle- / rum ac populum Sinarum, pacem et communionem cum / Apostolica Sede habentes: paterna impertiuntur hortamenta / in praesentibus rerum augustus 5",
    evidence: "The act's own dating formula reads 'Datum Romae, apud S. Petrum, die vii mensis Octobris, in festo Sacratissimi Rosarii Beatae Mariae Virginis, an. MDCCCCLIV, Pontificatus Nostri sexto decimo.' (AAS 47 (1955) 14, PDF page 14 of AAS-47-1955-ocr.pdf, read 2026-09-13) -- 1954-10-07; the volume opens it at p. 5 under 'EPISTULA ENCYCLICA / AD VENERABILES FRATRES AC DILECTOS FILIOS ARCHIEPISCOPOS … CLERUM AC POPULUM SINARUM … Ad Sinarum gentem', the first page of the fascicle of 28 January 1955. AAS 47's index opens with this entry, whose year the OCR reads `19Ö4` beside the column header (`PAG. 19Ö4 Oet. 7`, the page extracted in the default mode); the parser reads the month and day and leaves the year unprinted. The shelf record is `mag:pius-xii/ad-sinarum-gentem-1954`, dated 1954-10-07.",
  },
  "1955:664": {
    printed: "????-04-27",
    date: "1951-04-27",
    indexLine: "1961 Apr. 27 Haud parvae. - Beata Maria V. a Purissimo et Immaculato Corde / pro universa Huancavelicensi dioecesi, in Peruviana dicione, / praecipua Caelestis Patrona declaratur. 664",
    evidence: "The act's own dating formula reads 'Datum Romae, apud Sanctum Petrum, sub anulo Piscatoris, die XXVII mensis Aprilis, anno mcmli, Pontificatus Nostri tertio decimo. De speciali mandato Sanctissimi' (AAS 47 (1955) 665, PDF page 665 of AAS-47-1955-ocr.pdf, read 2026-09-13) -- 1951-04-27; The OCR reads the year as `1961` (`1961 Apr. 27 Haud parvae`), four years after the volume and beyond the parser's one-digit repair, so the year is left unprinted; the volume prints the act at p. 664. No shelf record carries the act.",
  },
  "1949:308": {
    printed: "????-01-10",
    date: "1948-01-10",
    indexLine: "19 IS Ian. 10 ICENSIS. - Cathedralia Capitula. - Canonicorum Capitulum in Cathe- / drali Ecclesia Icensi erigitur 308",
    evidence: "The act's own dating formula reads 'Datum Romae apud S. Petrum, anno Domini millesimo nongentesimo quadragesimo octavo, die decima Ianuarii mensis, Pontificatus Nostri anno nono.' (AAS 41 (1949) 310, PDF page 310 of AAS-41-1949-ocr.pdf, read 2026-09-13) -- 1948-01-10; The entry's year the OCR reads `19 IS` (`19 IS Ian. 10 ICENSIS. - Cathedralia Capitula`); the volume prints the act at p. 308. No shelf record carries the act.",
  },
  "1949:26": {
    printed: "????-08-06",
    date: "1948-08-06",
    indexLine: " » Aug. 6 Quintum ac vicesimum. - Ad Moderatores, Doctores et Alumnos Ca- / tholicae Studiorum Universitatis Noviomagensis, quinto ac vice- / simo anno ab eiusdem universitatis exordio 26",
    evidence: "The act's own dating formula reads 'Datum ex Arce Gandulphi, prope Romam, die Vi mensis Augusti, anno MDCCCCXXXXVIH, Pontificatus Nostri decimo. PIUS PP. XII ,' (AAS 41 (1949) 27, PDF page 27 of AAS-41-1949-ocr.pdf, read 2026-09-13) -- 1948-08-06; Inherits by ditto the year of AAS 41's line `3918 Iulii 11 Quinquagesimo`, which the OCR has broken beyond repair; the volume prints the act at the page the index cites. No shelf record carries the act.",
  },
  "1949:64": {
    printed: "????-12-04",
    date: "1948-12-04",
    indexLine: " » Dec. 4 Quemadmodum. - Ad Revnium P. Clementem a Milwaukee, Ordinis / Franciscanum Capulatorum Ministrum Generalem : de apostolatu / ab eodem Ordine provehendo 64",
    evidence: "The act's own dating formula reads 'Datum Romae, apud Sanetum Petrum, die iv mensis Decembris, anno MDCCCCXXXXVIII, Pontificatus Nostri decimo. Acta Pu Pp. XU 67' (AAS 41 (1949) 66, PDF page 66 of AAS-41-1949-ocr.pdf, read 2026-09-13) -- 1948-12-04; Inherits by ditto the year of AAS 41's line `3918 Iulii 11 Quinquagesimo`, which the OCR has broken beyond repair; the volume prints the act at the page the index cites. No shelf record carries the act.",
  },
  "1949:68": {
    printed: "????-12-15",
    date: "1948-12-15",
    indexLine: " » » 15 Agnovimus perlibenter. - Ad Revmum D. Laurentium Perosi, Anti- / stitem Urbanum, quinquagesimum annum magisterii Chori Xy- / stini a Summo Pontifice Leone XIII eidem crediti expleturum . 68",
    evidence: "The act's own dating formula reads 'Datum Romae apud Sanctum Petrum, die xv mensis Decembris, anno MDCCCCXXxxvni, Pontificatus Nostri decimo. PIUS PP. XII' (AAS 41 (1949) 69, PDF page 69 of AAS-41-1949-ocr.pdf, read 2026-09-13) -- 1948-12-15; Inherits by ditto the year of AAS 41's line `3918 Iulii 11 Quinquagesimo`, which the OCR has broken beyond repair; the volume prints the act at the page the index cites. No shelf record carries the act.",
  },
  "1949:216": {
    printed: "????-12-20",
    date: "1948-12-20",
    indexLine: " » » 20 Disertae admodum litterae. - Ad Emos PP. DD- Michaelem tit. / S. Anastasiae S. R. B. Presb. Card. Faulhaber, Archiepiscopum / Monacensem et Frisingensem, Iosephum tit. S. Ioannis ante Por- / tam Latinam, S. R. E. Presb. Card. Frings, Archiepiscopum Co- / loniensem, Conradum tit. S. Agathae, S. R. E- Presb. Card. / von Preysing, Episcopum Berolinensem ceterosque Germaniae / Archiepiscopos, Episcopos locorumque Ordinarios: omciosis lit- / teris respondet ex episcopali coetu datis 216",
    evidence: "The act's own dating formula reads 'Datum Romae apud Sanctum Petrum, die xx mensis Decembris, anno MDCCCCXXXXVIII, Pontificatus Nostri decimo. PIUS PP. XII' (AAS 41 (1949) 218, PDF page 218 of AAS-41-1949-ocr.pdf, read 2026-09-13) -- 1948-12-20; Inherits by ditto the year of AAS 41's line `3918 Iulii 11 Quinquagesimo`, which the OCR has broken beyond repair; the volume prints the act at the page the index cites. No shelf record carries the act.",
  },
  "1949:175": {
    printed: "????-12-21",
    date: "1948-12-21",
    indexLine: " » » 21 Opportunum. - Ad Revmum P. Gulielmum van Hees, Ordinis San- / ctae Crucis Magistrum Generalem : septimo exeunte saeculo ab / eiusdem Ordinis Constitutionum approbatione . . . . 175",
    evidence: "The act's own dating formula reads 'Datum Romae apud Sanctum Petrum, die xxi mensis Decembris, anno MDCCCCXXXXVIII, Pontificatus Nostri decimo. PIUS PP. XII' (AAS 41 (1949) 176, PDF page 176 of AAS-41-1949-ocr.pdf, read 2026-09-13) -- 1948-12-21; Inherits by ditto the year of AAS 41's line `3918 Iulii 11 Quinquagesimo`, which the OCR has broken beyond repair; the volume prints the act at the page the index cites. No shelf record carries the act.",
  },
  "1953:221": {
    printed: "????-04-13",
    date: "1951-04-13",
    indexLine: "1961 Apr. 13 Vetus est. - Beata Maria V., vulgo « Notre-Dame du Rempart » / invocata, totius civitatis Namurcensis Patrona caelestis / aeque principalis cum Sancto Albano renuntiatur 221",
    evidence: "The act's own dating formula reads 'Datum Romae, apud Sanctum Petrum, sub anulo Piscatoris, die XIII mensis Aprilis, anno MCMLI, Pontificatus Nostri tertio decimo. De speciali mandato Sanctissimi' (AAS 45 (1953) 222, PDF page 222 of AAS-45-1953-ocr.pdf, read 2026-09-13) -- 1951-04-13; The year the OCR reads `1961` (two years before the volume, outside the parser's repair span) is left unprinted; the volume prints the act at p. 221. No shelf record carries the act.",
  },
  "1953:175": {
    printed: "????-10",
    date: "1951-10-04",
    indexLine: " » Oct. Asisinas civis. - Sanctus Franciscus Asisinas, C, paroeciae loci / « Llavallol », intra fines archidioecesis Platensis positae, / praecipuus caelestis Patronus constituitur 175",
    evidence: "The act's own dating formula reads 'Datum ex Arce Gandulphi, sub anulo Piscatoris, die iv mensis Octo bris, anno MCMLI, Pontificatus Nostri tertio decimo. De speciali mandato Sanctissimi' (AAS 45 (1953) 176, PDF page 176 of AAS-45-1953-ocr.pdf, read 2026-09-13) -- 1951-10-04; Inherits by ditto the year of AAS 45's line `1961 Apr. 13 Vetus est`, which the OCR misreads (1951, two years before the volume: outside the parser's repair span); the volume prints the act at the page the index cites. No shelf record carries the act.",
  },
  "1953:149": {
    printed: "????-05-12",
    date: "1952-05-12",
    indexLine: " Maii 12 Vitae huius. - Beatae Mariae V., vulgo « de Làttani » dicta, titulo / « Regina mundi » honestata. dioecesium Calvensis et Thea- / nensis caelestis Patrona confirmatur 149",
    evidence: "The act's own dating formula reads 'Datum Romae, apud Sanctum Petrum, sub anulo Piscatoris, die xn mensis Maii, anno MCMLTI, Pontificatus Nostri quarto decimo. De speciali mandato Sanctissimi' (AAS 45 (1953) 150, PDF page 150 of AAS-45-1953-ocr.pdf, read 2026-09-13) -- 1952-05-12; Inherits by ditto the year of AAS 45's line `1961 Apr. 13 Vetus est`, which the OCR misreads (1951, two years before the volume: outside the parser's repair span); the volume prints the act at the page the index cites. No shelf record carries the act.",
  },
  "1953:150": {
    printed: "????-06-14",
    date: "1952-06-14",
    indexLine: " Iunii 14 Consociati in honesta. - Sanctus Franciscus Xaverius sodalitatis / « Federación Española de Sindicatos de Iniciativa y Turi- / smo » nuncupatae caelestis Patronus confirmatur 150",
    evidence: "The act's own dating formula reads 'Datum Romae, apud Sanctum Petrum, sub anulo Piscatoris, die xiv mensis Iunii, anno MOMLII, Pontificatus Nostri quarto decimo. De speciali mandato Sanctissimi' (AAS 45 (1953) 151, PDF page 151 of AAS-45-1953-ocr.pdf, read 2026-09-13) -- 1952-06-14; Inherits by ditto the year of AAS 45's line `1961 Apr. 13 Vetus est`, which the OCR misreads (1951, two years before the volume: outside the parser's repair span); the volume prints the act at the page the index cites. No shelf record carries the act.",
  },
  "1953:451": {
    printed: "????-08-12",
    date: "1952-08-12",
    indexLine: " 12 Ex quo ut supremus. - Beata Maria V. in Caelum Assumpta Zi- / paquirensis Dioecesis Caelestis Patrona renuntiatur ... 451",
    evidence: "The act's own dating formula reads 'Datum ex Arce Gandulphi, sub anulo Piscatoris, die xn mensis Au gusti, anno MCMLii, Pontificatus Nostri quarto decimo. De speciali mandato Sanctissimi' (AAS 45 (1953) 452, PDF page 452 of AAS-45-1953-ocr.pdf, read 2026-09-13) -- 1952-08-12; Inherits by ditto the year of AAS 45's line `1961 Apr. 13 Vetus est`, which the OCR misreads (1951, two years before the volume: outside the parser's repair span); the volume prints the act at the page the index cites. No shelf record carries the act.",
  },
  "1953:269": {
    printed: "????-10-16",
    date: "1952-10-16",
    indexLine: " Oct. 16 Solent Maximi. - Paroecialis ecclesia Sacratissimo Cordi Iesu / in urbe ac dioecesi Luganensi dicata Basilicis Minoribus / accensetur 269",
    evidence: "The act's own dating formula reads 'Datum ex Arce Gandulphi, sub anulo Piscatoris, die xvi mensis Octobris, anno MCMLII, Pontificatus Nostri quarto decimo. De speciali mandato Sanctissimi' (AAS 45 (1953) 270, PDF page 270 of AAS-45-1953-ocr.pdf, read 2026-09-13) -- 1952-10-16; Inherits by ditto the year of AAS 45's line `1961 Apr. 13 Vetus est`, which the OCR misreads (1951, two years before the volume: outside the parser's repair span); the volume prints the act at the page the index cites. No shelf record carries the act.",
  },
  "1953:452": {
    printed: "????-11",
    date: "1952-11-03",
    indexLine: " » Nov. Praeclaro Templo. - Templum Sancti Antonii, « do Embarè » / nuncupatum, in urbe ac Dioecesi « De Santos » positum, / titulo Basilicae Minoris ornatur 452",
    evidence: "The act's own dating formula reads 'Datum ex Arce Gandulphi, sub anulo Piscatoris, die III mensis Novembris, anno MDCCCCLII, Pontificatus Nostri quarto decimo. De speciali mandato Sanctissimi' (AAS 45 (1953) 453, PDF page 453 of AAS-45-1953-ocr.pdf, read 2026-09-13) -- 1952-11-03; Inherits by ditto the year of AAS 45's line `1961 Apr. 13 Vetus est`, which the OCR misreads (1951, two years before the volume: outside the parser's repair span); the volume prints the act at the page the index cites. No shelf record carries the act.",
  },
  "1953:453": {
    printed: "????-12",
    date: "1952-12-03",
    indexLine: " Dec. Augusta Dei Genetrix. -~ Beata Maria V., «a Septem Dolori- / bus » appellata, Dioecesis Pinnensis-Piscariensis Caelestis / Patrona aeque principalis cum Sancto Cetaeo et Sancto / Maximo declaratur 453",
    evidence: "The act's own dating formula reads 'Datum Romae, apud Sanctum Petrum, sub anulo Piscatoris, die III mensis Decembris, anno MCMLII, Pontificatus Nostri quarto decimo. De speciali mandato Sanctissimi' (AAS 45 (1953) 454, PDF page 454 of AAS-45-1953-ocr.pdf, read 2026-09-13) -- 1952-12-03; Inherits by ditto the year of AAS 45's line `1961 Apr. 13 Vetus est`, which the OCR misreads (1951, two years before the volume: outside the parser's repair span); the volume prints the act at the page the index cites. No shelf record carries the act.",
  },
  '1949:529': {
    printed: '1919-11-08',
    date: '1949-11-08',
    indexLine: '   » Nov. 8 Sollemnibus documentis. - Ad Venerabiles Fratres Patriarchas, Pri- / '
      + 'mates, Archiepiscopos, Episcopos, aliosque locorum Ordinarios / pacem et communionem eum Apostolica Sede habentes: iterum / '
      + 'indicuntur supplicationes pro Sacris Palaestinae Locis . . . 529',
    evidence: "The exhortation's own dating formula reads 'Datum ex Arce Gandulphi, prope Romam, die VIII mensis "
      + "Novembris, anno MDCCCCXXXXIX, Pontificatus Nostri undecimo' (AAS 41 (1949) 530, PDF page 530 of "
      + 'AAS-41-1949-ocr.pdf, read 2026-09-13) -- 8 November 1949, the eleventh year of the pontificate. The '
      + 'entry inherits the year of the line before it (`1919 Febr. 11`, corrected above) by a ditto mark; the '
      + 'shelf record is `mag:pius-xii/sollemnibus-documentis-1949`, dated 1949-11-08, which the corrected entry matches.',
  },
  // Phase 2b-ii-b (AAS 51-69): the head of Pius XII's part in AAS 51 (1959) prints `19Ö8
  // Apr. 19` for his last constitutions -- the year token broken, so the parser dates the
  // entry and the eight dittos after it `????` -- and AAS 55 (1963) 1081 prints `196S` for
  // 1963 on two acts of Paul VI. Each year below was read in the act's own dating formula
  // in the volume PDF on 2026-09-13 and agrees with the index's month and day.
  '1959:90': {
    printed: '????-04-19',
    date: '1958-04-19',
    indexLine: '19Ö8 Apr. 19 S. PAULI IN BRASILIA ET TAUBATENSIS (Apparitiopolitanae et / aliarum). Sacrorum Antistitum. - Ab archidioecesi S. Pauli / '
      + 'in Brasilia et a Taubatensi dioecesi quibusdam distraotis / territoriis, nova conditur archidioecesis, « Apparitiopolitana » / appellanda; … 90',
    evidence: "The constitution's own dating formula reads 'Datum Roma, apud S. Petrum, die undevicesimo mensis Aprilis, anno Domini "
      + "millesimo nongentesimo quinquagesimo octavo, Pontificatus Nostri vicesimo' (AAS 51 (1959) 94, PDF page 94 of AAS-51-1959-ocr.pdf, "
      + "read 2026-09-13; the act opens at p. 90 under 'ACTA PII PP. XII / CONSTITUTIONES APOSTOLICAE / I / S. PAULI IN BRASILIA ET TAUBATENSIS "
      + "(APPARITIOPOLITANAE ET ALIARUM)' with 'Sacrorum Antistitum Provinciae Ecclesiasticae S. Pauli in Brasilia …') -- 19 April 1958, the "
      + 'twentieth year of a pontificate begun 2 March 1939: the erection of Aparecida. The OCR reads the year column as `19Ö8`. No shelf record carries the act.',
  },
  '1959:94': {
    printed: '????-04-28',
    date: '1958-04-28',
    indexLine: '» » 28 KARACHIENSIS (Hyderabadensis in Pakistan). Eius in terris / Vicarii. - Ab archidioecesi Karachiensi quaedam territoria / '
      + 'detrahuntur, quibus nova dioecesis, « Hyderabadensis in Pa­ / kistan », constituitur 94',
    evidence: "The constitution's own dating formula reads 'Datum Roma, apud S. Petrum, die duodetricesimo mensis Aprilis, anno Domini millesimo "
      + "nongentesimo quinquagesimo octavo, Pontificatus Nostri vicesimo' (AAS 51 (1959) 96, PDF page 96 of AAS-51-1959-ocr.pdf; the act opens at "
      + "p. 94, 'II / KARACHIENSIS (HYDERABADENSIS IN PAKISTAN)', with 'Eius in terris Vicarii, qui e caelorum beatitate ignem venit mittere') -- "
      + '28 April 1958, inheriting the broken year of the entry above by ditto. No shelf record carries the act.',
  },
  '1959:21': {
    printed: '????-05-07',
    date: '1958-05-07',
    indexLine: '» Maii 7 G-UYANAE HOLLANDICAE (Paramariboënsis). Cum apostolicus. - / Apostolicus Vicariatus G-uyanae Hollandicae in gradum ca­ / '
      + 'thedralis sedis evehitur, « Paramariboënsis » posthac appel- / landae 21',
    evidence: "The constitution's own dating formula reads 'Datum Roma, apud Sanctum Petrum, die septimo mensis Maii, anno Domini millesimo "
      + "nongentesimo quinquagesimo octavo, Pontificatus Nostri vicesimo' (AAS 51 (1959) 22, PDF page 22 of AAS-51-1959-ocr.pdf; the act opens at "
      + "p. 21, 'CONSTITUTIONES APOSTOLICAE / I / GUYANAE HOLLANDICAE (PARAMARIBOËNSIS)', with 'Cum apostolicus vicariatus Guyanae Hollandicae') -- "
      + '7 May 1958: the erection of Paramaribo. The index prints the toponym as `G-UYANAE` (the OCR\'s), so the entry is also held as OCR-damaged.',
  },
  '1959:97': {
    printed: '????-05-10',
    date: '1958-05-10',
    indexLine: '» » 10 AUSTRALIAE. Singularem huius. - Exarchatus Apostolicus in / Australia pro fidelibus Euthenis ritus Byzantini ibi commo­ / rantibus constituitur 97',
    evidence: "The constitution's own dating formula reads 'Datum Roma, apud S. Petrum, die decimo mensis Maii, anno Domini millesimo nongentesimo "
      + "quinquagesimo octavo, Pontificatus Nostri vicesimo' (AAS 51 (1959) 98, PDF page 98 of AAS-51-1959-ocr.pdf; the act opens at p. 97, 'III / "
      + "AUSTRALIAE', with 'Singularem huius apostolicae et Romanae Sedis sollicitudinem') -- 10 May 1958: the Ukrainian exarchate in Australia. "
      + 'No shelf record carries the act.',
  },
  '1959:23': {
    printed: '????-05-15',
    date: '1958-05-15',
    indexLine: '» » 15 LIMANAE-HUARAZENSIS (Huachensis). Egregia quidem. - Archi­ / dioecesis Limanae et dioecesis Huarazensis quibusdam dis- / '
      + 'membratis territoriis, nova efficitur « Huachensis » dioecesis 23',
    evidence: "The constitution's own dating formula reads 'Datum Roma, apud Sanctum Petrum, die decimo quinto mensis Maii, anno Domini millesimo "
      + "nongentesimo quinquagesimo octavo, Pontificatus Nostri vicesimo' (AAS 51 (1959) 25, PDF page 25 of AAS-51-1959-ocr.pdf; the act opens at "
      + "p. 23, 'II / LIMANAE - HUARAZENSIS (HUACHENSIS)', with 'Egregia quidem spe ducti') -- 15 May 1958: the erection of Huacho. The shelf's two "
      + 'constitutions of the day (Tarma, Huari) are other acts, cited at AAS 50 (1958) 842 and 844.',
  },
  '1959:99': {
    printed: '????-05-19',
    date: '1958-05-19',
    indexLine: '» » 19 CAGAYANAE (Zamboangensis). Quasi mater. - Dioecesis Zam­ / boangensis, in Insulis Philippinis, ad gradum metropolitanae / '
      + 'Ecclesiae perducitur, atque caput novae ecclesiasticae pro­ / vinciae efficitur 99',
    evidence: "The constitution's own dating formula reads 'Datum Roma, apud S. Petrum, die undevicesimo mensis Maii, anno Domini millesimo "
      + "nongentesimo quinquagesimo octavo, Pontificatus Nostri vicesimo' (AAS 51 (1959) 100, PDF page 100 of AAS-51-1959-ocr.pdf; the act opens at "
      + "p. 99, 'IV / CAGAYANAE (ZAMBOANGENSIS)', with 'Quasi mater, quae se ad filiorum necessitates') -- 19 May 1958: Zamboanga a metropolitan see. "
      + 'No shelf record carries the act.',
  },
  '1959:101': {
    printed: '????-05-24',
    date: '1958-05-24',
    indexLine: '» » 24 CIVITATIS BOLIVARENSIS (Maturinensis). Begnum Dei. - Detractis / quibusdam territoriis a dioecesi Civitatis Bolivarensis, nova / '
      + 'dioecesis conditur, « Maturinensis » appellanda 101',
    evidence: "The constitution's own dating formula reads 'Datum Boma [sic, the OCR's], apud S. Petrum, die quarto et vicesimo mensis Maii, anno "
      + "Domini millesimo nongentesimo quinquagesimo octavo, Pontificatus Nostri vicesimo' (AAS 51 (1959) 103, PDF page 103 of AAS-51-1959-ocr.pdf; "
      + "the act opens at p. 101, 'V / CIVITATIS BOLIVARENSIS (MATURINENSIS)', with 'Regnum Dei, quod est Ecclesia') -- 24 May 1958: the erection of "
      + 'Maturín. The index prints the incipit as `Begnum Dei` (the OCR\'s `B` for `R`), so the entry is held by a curated row (ACTA_HOLDS) rather than minted under it.',
  },
  '1959:25': {
    printed: '????-05-25',
    date: '1958-05-25',
    indexLine: '» » 25 S. AUGUSTINI (Miamiensis). Cum supremum. - A dioecesi S. Au­ / gustini quaedam territoria detrahuntur, quibus nova dioe­ / '
      + 'cesis efficitur, « Miamiensis » appellanda 25',
    evidence: "The constitution's own dating formula reads 'Datum Roma, apud S. Petrum, die quinto et vicesimo mensis Maii, anno Domini millesimo "
      + "nongentesimo quinquagesimo octavo, Pontificatus Nostri vicesimo' (AAS 51 (1959) 27, PDF page 27 of AAS-51-1959-ocr.pdf; the act opens at "
      + "p. 25, 'III / S. AUGUSTINI (MIAMIENSIS)', with 'Cum supremum in omnes fideles imperium obtineamus') -- 25 May 1958: the erection of Miami. "
      + 'No shelf record carries the act.',
  },
  '1959:209': {
    printed: '????-06-21',
    date: '1958-06-21',
    indexLine: '» Iunii 21 CARACENSIS-CALABOCENSIS (Maracayensis). Qui Supremi. - Ab / archidioecesi Caracensi et a dioecesi Calabocensi quaedam / '
      + 'territorii pars detrahitur, quae in novae dioecesis formam / redigitur, « Maracayensis » appellandae 209',
    evidence: "The constitution's own dating formula reads 'Datum Roma, apud S. Petrum, die uno et vicesimo mensis Iunii, anno Domini millesimo "
      + "nongentesimo quinquagesimo octavo, Pontificatus Nostri vicesimo' (AAS 51 (1959) 211, PDF page 211 of AAS-51-1959-ocr.pdf; the act opens at "
      + "p. 209, 'ACTA PII PP. XII / CONSTITUTIONES APOSTOLICAE / I / CARACENSIS-CALABOCENSIS (MARACAYENSIS)', with 'Qui Supremi Pontificatus curas "
      + "Dei voluntate suscepimus') -- 21 June 1958: the erection of Maracay, the last of the chain. No shelf record carries the act.",
  },
  '1963:979': {
    printed: '????-11-04',
    date: '1963-11-04',
    indexLine: '196S Nov. 4 Summi Dei. - Ad Patriarchas, Primates, Archiepiscopos, Episcopos / orbis catholici : quarto exacto saeculo post constituta a Concilio / '
      + 'Oecumenico Tridentino sacra Seminaria 979',
    evidence: "The letter's own dating formula reads 'Datum Romae, apud S. Petrum, in festo S. Caroli Borromaei, die iv mensis Novembris anno "
      + "MDCCCCLXIII, Pontificatus Nostri primo' (AAS 55 (1963) 995, PDF page 995 of AAS-55-1963-ocr.pdf, read 2026-09-13; the act opens at p. 979 "
      + "under 'EPISTULA APOSTOLICA' with 'Summi Dei Verbum, lux vera quae illuminat omnem hominem') -- 4 November 1963, the first year of a "
      + 'pontificate begun 21 June 1963. The OCR reads the year as `196S`; the shelf record is `mag:paul-vi/summi-dei-verbum-1963`, dated 1963-11-04.',
  },
  '1963:729': {
    printed: '????-09-14',
    date: '1963-09-14',
    indexLine: '196S Sept. 14 Cum proximus. - Ad universos Episcopos pacem et communionem / cum Apostolica Sede habentes : de felici exitu Concilii Oecume­ / '
      + 'nici Vaticani II precibus et paenitentiae operibus impetrando . 729',
    evidence: "The exhortation's own dating formula reads 'Datum Romae, apud Sanctum Petrum, die xiv mensis Septembris, in Exaltatione S. Crucis, anno "
      + "MCMLXIII, Pontificatus Nostri primo' (AAS 55 (1963) 733, PDF page 733 of AAS-55-1963-ocr.pdf, read 2026-09-13; the act opens at p. 729, the "
      + "first page of the fascicle of 7 October 1963, under 'ACTA PAULI PP. VI / ADHORTATIO APOSTOLICA' with 'CUM PROXIMUS accedat dies, quo altera "
      + "sessio Concilii Oecumenici') -- 14 September 1963. The OCR reads the year as `196S`. No shelf record carries the act.",
  },
  // Two index misprints of the era, each against the act's own dating formula in the volume.
  '1967:257': {
    printed: '1967-05-26',
    date: '1967-03-26',
    indexLine: '1967 Maii 26 Populorum progressio. - Ad Episcopos, ad Sacerdotes, ad Religio­ / sos, ad Christifideles totius Catholici Orbis, itemque ad uni­ / '
      + 'versos bonae voluntatis homines: de populorum progressione / promovenda 257',
    evidence: "The encyclical's own dating formula reads 'Datum Romae, apud S. Petrum, die xxvi mensis Martii, in festo Resurrectionis D. N. I. C., "
      + "anno MDCCCCLXVII, Pontificatus Nostri quarto' (AAS 59 (1967) 299, PDF page 299 of AAS-59-1967-ocr.pdf, read 2026-09-13; the act opens at "
      + "p. 257, the first page of the fascicle of 15 April 1967, under 'ACTA PAULI PP. VI / LITTERAE ENCYCLICAE') -- 26 March 1967, Easter Sunday, "
      + 'the fourth year of a pontificate begun 21 June 1963. The index prints `Maii` for `Mart.`; the shelf record is '
      + '`mag:paul-vi/populorum-progressio-1967`, dated 1967-03-26.',
  },
  // Phase 2b-ii-c (AAS 71-94): the volumes of John Paul II.
  '1984:937': {
    printed: '????-10-10',
    date: '1983-10-16',
    indexLine: '1988 » » II. Beato Leopoldo Mandic" a Castro Novo, Sanctorum caelitum / honores decernuntur 937',
    evidence: "The decretal's own dating formula reads 'Datum Romae apud Sanctum Petrum die decimo sexto mensis Octobris anno Domini "
      + "millesimo nongentesimo octogesimo tertio Pontificatus Nostri sexto' (AAS 76 (1984) 944, PDF page 944 of AAS-76-1984-ocr.pdf, "
      + "read 2026-09-13; the act opens at p. 937 under 'LITTERAE DECRETALES / Beato Leopoldo Mandic a Castro Novo, Sanctorum caelitum "
      + "honores decernuntur') -- 16 October 1983, the canonisation of Leopold Mandić. The index numbers it `II.` under the Kolbe decretal "
      + '(`1982 Oct. 10 I. Beato Maximiliano Mariae Kolbe …`), prints the year as `1988` (a year no 1984 volume can print, one digit from '
      + '1983 and from 1984 alike, so the parser leaves it unprinted) and dittos the month and day, which the act contradicts too.',
  },
  '1993:309': {
    printed: '1992-01-15',
    date: '1993-01-15',
    indexLine: '1992 Ian. 15 Pontificia Commissio « Pro Russia » in Commissionem Interdi\u00adcasterialem Stabilem pro Ecclesia in Europa Orientali im\u00admutatur 309',
    evidence: "The motu proprio's own dating formula reads 'Datum Romae, apud Sanctum Petrum, die xv mensis Ianuarii, anno MCMXCIII, "
      + "Pontificatus Nostri quinto decimo' (AAS 85 (1993) 310, PDF page 310 of AAS-85-1993-ocr.pdf, read 2026-09-13; the act opens at "
      + "p. 309 under 'LITTERAE APOSTOLICAE MOTU PROPRIO DATAE / Pontificia Commissio « Pro Russia » in Commissionem Interdicasterialem "
      + "Stabilem pro Ecclesia in Europa Orientali immutatur' and begins 'Europae Orientalis fidelium solliciti') -- 15 January 1993, "
      + 'the fifteenth year of a pontificate begun 16 October 1978. The index prints `1992`; the shelf record is '
      + '`mag:john-paul-ii/europae-orientalis-1993`, dated 1993-01-15.',
  },
  // The 2013 index prints Francis's first encyclical a day early.
  '2013:555': {
    printed: '2013-06-28',
    date: '2013-06-29',
    indexLine: '2013 Iun. 28 Lumen Fidei  .   .   .   .   .   .   .   .   .   .   .   .   .   .   .   .   .   .   .   . 555',
    evidence: "The encyclical's own dating formula reads 'Datum Romae, apud Sanctum Petrum, die undetricesimo mensis Iunii, in "
      + "sollemnitate Apostolorum Petri et Pauli, anno Domini bis millesimo tertio decimo, ipso Anno Fidei, Pontificatus Nostri primo' "
      + '(AAS 105 (2013) 596, the July 2013 fascicle actaluglio2013.pdf, which opens at p. 555 with \'ACTA FRANCISCI PP. / LITTERAE '
      + "ENCYCLICAE / LUMEN FIDEI', read 2026-09-13) -- 29 June 2013, the solemnity of Peter and Paul. The index prints `Iun. 28`; the "
      + 'shelf record is `mag:francis-i/lumen-fidei-2013`, dated 2013-06-29.',
  },
  '1962:66': {
    printed: '1962-01-05',
    date: '1962-01-06',
    indexLine: '1962 Ian. 5 Sacrae laudis. - Ad Clerum universum pacem et communionem cum Apostolica Sede habentem: de Divino Officio pro felici exitu / '
      + 'Concilii Oecumenici Vaticani II impensiore pietate recitando . 66',
    evidence: "The exhortation's own dating formula reads 'Datum Romae, apud S. Petrum, die vi mensis Ianuarii, in festo Epiphaniae N. D. I. C., anno "
      + "MDCCCCLXII, Pontificatus Nostri quarto' (AAS 54 (1962) 75, PDF page 75 of AAS-54-1962-ocr.pdf, read 2026-09-13; the act opens at p. 66 under "
      + "'ADHORTATIO APOSTOLICA … IOANNES PP. XXIII … SACRAE LAUDIS concentum gratiarumque actiones') -- 6 January 1962, the Epiphany. The index "
      + 'prints `Ian. 5`; the shelf record is `mag:john-xxiii/sacrae-laudis-1962`, dated 1962-01-06.',
  },
  // Phase 2b-iii-a: AAS 22 (1930), whose OCR reads the printed `1930` at the head of three
  // sections as `1J30`, `1030` and `1@30`. The parser repairs `1030` and notes it (the
  // dittos below it inherit the note); `1J30` and `1@30` leave the year unprinted for the
  // entry and every ditto that follows. Each act was read in the volume on 2026-09-18 and
  // its own dating formula quoted; the page the index prints was checked against the page
  // the act opens on, and a row is written only where the two agree. *Casti connubii* (index
  // `530`, the act opening at 539) and *In allocutione* (index `307`, the act at 337) get no
  // row: a date confirmed here would cite them at a page they do not open on, and a page
  // correction is a mechanism this phase does not add (the era report §2 names both).
  '1930:201': {
    printed: '????-04-20',
    date: '1930-04-20',
    indexLine: '1J30 Apr. 20 Ad salutem. - Ad venerabiles fratres Patriarchas, Prima­ / tes, Archiepiscopos, Episcopos, aliosque locorum Ordi­ / narios, pacem et communionem cum Apostolica Sede / habentes: de Sancto Augustino Episcopo Hipponensi / et Ecclesiae Doctore, millesimo et quingentésimo ab / eius obitu exeunte anno 201',
    evidence: "The act's own dating formula reads 'Datum Romae apud Sanctum Petrum die xx mensis Aprilis, in festo Paschae Resurrectionis D. N. I. C, anno MDCCCCXXX, Pontificatus Nostri nono. PIUS PP. XI' (AAS 22 (1930) 234, PDF page 234 of AAS-22-1930-ocr.pdf, read 2026-09-18) -- 1930-04-20; the volume opens it at p. 201, the first page of the fascicle of 1 May 1930, under 'ACTA PII PP. XI / LITTERAE ENCYCLICAE / AD VENERABILES FRATRES PATRIARCHAS, PRIMATES, ARCHIEPISCOPOS, EPISCOPOS, ALIOSQUE LOCORUM ORDINARIOS … DE SANCTO AUGUSTINO EPISCOPO HIPPONENSI ET ECCLESIAE DOCTORE … Ad salutem humani generis constitutae providenter Ecclesiae'. The first entry of the encyclicals section, whose year the OCR reads `1J30`. The shelf record is `mag:pius-xi/ad-salutem-humani-1930`, dated 1930-04-20.",
  },
  '1930:87': {
    printed: '1930-02-06',
    date: '1930-02-06',
    indexLine: '1030 Febr. 6 Già da qualche tempo. - Instituitur « Sectio Historica » pe­ / nes Sacrorum Bituum Congregationem ....... 87',
    evidence: "The act's own heading and text read 'MOTU PROPRIO / INSTITUITUR « SECTIO HISTORICA » PENES SACRORUM RITUUM CONGREGATIONEM. / PIUS PP. XI / Già da qualche tempo è venuta maturando in Noi la persuasione …' at AAS 22 (1930) 87 (PDF page 87 of AAS-22-1930-ocr.pdf, read 2026-09-18), in the fascicle of 6 February 1930, and the volume's own *Index generalis actorum* files the motu proprio at 87. The first entry of the motu proprio section, whose year the OCR reads `1030` and the parser repairs to 1930 with a note; this row confirms the reading, and with it the dittos that inherit it -- *Inde ab inito* (6 April 1930, p. 153, whose formula reads 'Datum Romae apud Sanctum Petrum, die dominico Passionis, vi mensis Aprilis anno MDCCCCXXX, Pontificatus Nostri nono', p. 154). No shelf record carries the act.",
  },
  '1930:309': {
    printed: '????-01-31',
    date: '1930-01-31',
    indexLine: '1@30 Ian. 31 Universa christifidelium cura. - De archidioecesis Begina- / tensis dismembratione et dioecesis Gravelburgensis / erectione 309',
    evidence: "The act's own dating formula reads 'Datum Romae apud S. Petrum, anno Domini millesimo nongentesimo trigesimo, die trigesima prima mensis Ianuarii, Pontificatus Nostri anno octavo. Fr. ANDREAS Card. FRÜHWIRTH, Cancellarius S. R. E.' (AAS 22 (1930) 311, PDF page 311 of AAS-22-1930-ocr.pdf, read 2026-09-18) -- 1930-01-31; the volume opens it at p. 309 under 'CONSTITUTIONES APOSTOLICAE / I / REGINATENSEM DE ARCHIDIOECESIS DISMEMBRATIONE ET DIOECESIS GRAVELBURGENSIS ERECTIONE. / PIUS EPISCOPUS SERVUS SERVORUM DEI AD PERPETUAM REI MEMORIAM / Universa christifidelium cura'. The first entry of the constitutions section, whose year the OCR reads `1@30`; the four dittos below it are the four rows that follow. No shelf record carries the act.",
  },
  '1930:312': {
    printed: '????-02-12',
    date: '1930-02-12',
    indexLine: '» Febr. 12 Ecclesiarum in Orbe. - De dioecesis Bockamptonen. dis­ / membratione ac de dioecesis de Townsville in Statu / Australiensi de Queenslandia erectione 312',
    evidence: "The act's own dating formula reads 'Datum Romae, apud Sanctum Petrum, anno Domini millesimo nongentesimo trigesimo, die duodecima mensis Februarii, Pontificatus Nostri anno nono. FR. ANDREAS CARD. FRÜHWIRTH, G. M. CARD. VAN ROSSUM' (AAS 22 (1930) 315, PDF page 315 of AAS-22-1930-ocr.pdf, read 2026-09-18; the OCR's `nnllesimo`) -- 1930-02-12; the volume opens it at p. 312 under 'II / ROCKAMPTONENSIS DE DIOECESIS DISMEMBRATIONE AC DE NOVAE DIOECESIS DE TOWNSVILLE IN STATU AUSTRALIENSI DE QUEENSLANDIA ERECTIONE. / PIUS EPISCOPUS SERVUS SERVORUM DEI'. A ditto under the `1@30` of p. 309. No shelf record carries the act.",
  },
  '1930:237': {
    printed: '????-02-12',
    date: '1930-02-12',
    indexLine: '» » » Curis ac laboribus. - De Pontificio Seminario seu Collegio / Aethiopico 237',
    evidence: "The act's own dating formula reads 'Datum Romae apud S. Petrum, anno Domini millesimo nongentesimo ac trigesimo, die decima secunda mensis Februarii, Pontificatus Nostri nono. Fr. ANDREAS Card. FRÜHWIRTH, ALOYSIUS Card. SINCERO' (AAS 22 (1930) 240, PDF page 240 of AAS-22-1930-ocr.pdf, read 2026-09-18) -- 1930-02-12; the volume opens it at p. 237 under 'CONSTITUTIO APOSTOLICA / DE PONTIFICIO SEMINARIO SEU COLLEGIO AETHIOPICO / PIUS EPISCOPUS SERVUS SERVORUM DEI AD PERPETUAM REI MEMORIAM / Curis ac laboribus nunquam Apostolica Sedes pepercit'. A ditto under the `1@30` of p. 309. No shelf record carries the act.",
  },
  '1930:340': {
    printed: '????-04-23',
    date: '1930-04-23',
    indexLine: '» Apr. 23 Ubi primum Cecoslovacha. - De Pontificio Collegio Nepo­ / muceno in Urbe 340',
    evidence: "The act's own dating formula reads 'Datum Romae apud S. Petrum, anno Domini millesimo nongentesimo ac trigesimo, die vigesima tertia mensis Aprilis, in festo S. Adalberti Ep. M., Pontificatus Nostri anno nono. FR. ANDREAS CARD. FRÜHWIRTH' (AAS 22 (1930) 342, PDF page 342 of AAS-22-1930-ocr.pdf, read 2026-09-18) -- 1930-04-23; the volume opens it at p. 340, below the end of the motu proprio *In allocutione*, under 'CONSTITUTIO APOSTOLICA / DE PONTIFICIO COLLEGIO NEPOMUCENO IN URBE / PIUS EPISCOPUS SERVUS SERVORUM DEI AD PERPETUAM REI MEMORIAM / Ubi primum Cecoslovacha Respublica'. A ditto under the `1@30` of p. 309. No shelf record carries the act.",
  },
  '1930:381': {
    printed: '????-06-05',
    date: '1930-06-05',
    indexLine: 'Iunii 5 Solemni Conventione. - De nova circumscriptione et ordi­ / natione hierarchica dioecesium rituum tam latini tam / graeci-rumeni in Bomaniae Begno 381',
    evidence: "The act's own dating formula reads 'Datum Romae apud Sanctum Petrum, anno Domini millesimo nongentesimo ac trigesimo, die quinta mensis Iunii, Pontificatus Nostri anno nono. D. CARD. SBARRETTI, FR. A. CARD. FRÜHWIRTH, A. CARD. SINCERO' (AAS 22 (1930) 386, PDF page 386 of AAS-22-1930-ocr.pdf, read 2026-09-18) -- 1930-06-05; the volume opens it at p. 381 under 'CONSTITUTIO APOSTOLICA / DE NOVA CIRCUMSCRIPTIONE ET ORDINATIONE HIERARCHICA DIOECESIUM RITUS TAM LATINI TAM GRAECI-RUMENI IN ROMANIAE REGNO. / PIUS EPISCOPUS SERVUS SERVORUM DEI AD PERPETUAM REI MEMORIAM / Solemni Conventione nuper inita et confirmata inter Apostolicam Sedem et Romaniae Regnum'. The last ditto under the `1@30` of p. 309 (its year column blank in the print). No shelf record carries the act.",
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
  // Phase 2b-ii-a: the volumes of 1933 and 1937 print an encyclical twice -- the Latin text
  // and, at its own page, a vernacular one -- and index both under the encyclical's date,
  // so two entries claim one shelf record and the matcher's evidence rule cannot choose
  // (the OCR has misspelt the Latin incipit: `Dilectissimo, Nobis`, `Firmissimum
  // constantiam`). The override names the document for the entry of the Latin text, whose
  // page is the citation of record; the vernacular entry is held (ACTA_HOLDS below).
  'AAS:25:261': {
    documentId: 'mag:pius-xi/dilectissima-nobis-1933',
    indexLine: '  » Iunii 3 Dilectissimo, Nobis. - Ad Emos PP. DD. Franciscum / S. R. E. Presb. Card. Vidal et Barraquer Archiepisco- / '
      + 'pum Tarraconensem, Eustachium S. R. E. Presb. Card. / Ilundain et Esteban Archiepiscopum Hispalensem, / '
      + 'ceterisque RR. PP. DD. Archiepiscopis et Episcopis / atque universo clero et populo Hispaniae: De iniusta / '
      + 'rei catholicae condicione in Hispania 261',
    evidence: 'AAS 25 (1933) 261 opens the Latin text of the encyclical *Dilectissima Nobis* of 3 June 1933 to the '
      + "bishops of Spain (the shelf record `mag:pius-xi/dilectissima-nobis-1933`, encyclicals, 1933-06-03), whose "
      + 'incipit the OCR of the index reads `Dilectissimo, Nobis`; p. 275 of the same volume prints the Spanish '
      + "text under 'CARTA ENCÍCLICA … PIO PP. XI … Siempre Nos fué sumamente amada la noble Nación Española' "
      + '(PDF pages 261 and 275 of AAS-25-1933-ocr.pdf, read 2026-09-13), which the index enters after it with '
      + 'ditto marks (`» » » Siempre Nos fué. - A los Eminentísimos Señores … 275`). One act, two entries: the '
      + 'Latin page is the citation.',
  },
  'AAS:29:189': {
    documentId: 'mag:pius-xi/firmissimam-constantiam-1937',
    indexLine: '  » » 28 Firmissimum constantiam. - Ad Venerabiles fratres Ar- / chiepiscopos et Episcopos, aliosque locorum Ordinarios / '
      + 'foederatarum Mexici civitatum pacem et communio- / nem cum Apostolica Sede habentes: de rei catholicae / in Mexico condicione . 189',
    evidence: "AAS 29 (1937) 189 opens the Latin text of the encyclical of 28 March 1937 to the bishops of Mexico ('EPISTULA "
      + "ENCYCLICA … Firmissimam constantiam plane cognitam habemus'; the shelf record `mag:pius-xi/firmissimam-constantiam-1937`, "
      + 'encyclicals, 1937-03-28), whose incipit the OCR of the index reads `Firmissimum constantiam`; p. 200 prints the '
      + "Spanish text ('CARTA APOSTOLICA DE SU SANTIDAD EL PAPA PIO XI AL EPISCOPADO MEJICANO: SOBRE LA SITUACIÓN RELIGIOSA'; "
      + 'PDF pages 189 and 200 of AAS-29-1937-ocr.pdf, read 2026-09-13), which the index enters after it with ditto marks '
      + '(`» » » Al Episcopado Mejicano sobre la situación religiosa . . . 200`). The Latin page is the citation.',
  },
  // AAS 49 (1957) 885 and AAS 50 (1958) 24 print two constitutions of 10 April 1957, and
  // the shelf's provisional `Santaremensis (Obidensis)` has no incipit to tell them apart;
  // the 1958 entry's toponym is the OCR's (`SANTABEMENSIS (Obidendis)`), so the evidence
  // rule cannot read it either, and both claims would be dropped (the sample's 1958
  // reference with them). The volume page names the act.
  'AAS:50:24': {
    documentId: 'mag:pius-xii/santaremensis-obidensis-1957',
    indexLine: '1957 Apr. 10 SANTABEMENSIS (Obidendis). Cum sit. - Distractis quibusdam muni- / cipiis a praelatura « nullius » Santaremensi, nova conditur / '
      + 'praelatura, « Obidensis » appellanda 24',
    evidence: "AAS 50 (1958) p. 24 (PDF page 24 of AAS-50-1958-ocr.pdf, read 2026-09-13) opens 'CONSTITUTIONES APOSTOLICAE / I / "
      + 'SANTAREMENSIS / (OBIDENSIS) / DISTRACTIS QUIBUSDAM MUNICIPIIS A PRAELATURA « NULLIUS » SANTAREMENSI, NOVA CONDITUR PRAELATURA, '
      + "« OBIDENSIS » APPELLANDA. / PIUS EPISCOPUS … Cum sit animorum curatio gravissimi ponderis negotium', the act vatican.va's "
      + "apost_constitutions shelf files as 'Santaremensis (Obidensis)' (`mag:pius-xii/santaremensis-obidensis-1957`, 1957-04-10). The "
      + 'other constitution of the day, *In similitudinem* for Ciudad Juárez (AAS 49 (1957) 885), is a different act, which the '
      + 'creator creates.',
  },
  // AAS 60 (1968) 433 opens the Credo of the People of God, and the motu_proprio shelf
  // carries two acts of 30 June 1968 (the Credo, and *Romanae dioecesis* on the benefices
  // of Rome), neither with an incipit the index prints (the entry describes the act:
  // `A Paulo VI Pont. Max. pronuntiata …`), so the class rule leaves the entry ambiguous.
  // The volume page names the act.
  'AAS:60:433': {
    documentId: 'mag:paul-vi/credo-del-popolo-di-dio-1968',
    indexLine: '1968 Iun. 30 A Paulo VT Pont. Max. pronuntiata ante Basilicam Petrianam / die XXX mensis Iunii anno MCMLXVIII, anno a fide vo­ / '
      + 'cato, et saec. xix a martyrio SS. Petri et Pauli App. com­ / pletis 433',
    evidence: "AAS 60 (1968) p. 433 (PDF page 433 of AAS-60-1968-ocr.pdf, read 2026-09-13), the first page of the fascicle of 10 August 1968, "
      + "opens 'ACTA PAULI PP. VI / SOLLEMNIS PROFESSIO FIDEI / A Paulo VI Pont. Max. pronuntiata ante Basilicam Petrianam die XXX mensis Iunii "
      + "anno MCMLXVIII, anno a fide vocato, et saec. XIX a martyrio SS. Petri et Pauli App. completis. / Venerabiles Fratres ac dilecti Filii, / 1. "
      + "Sollemni hac Liturgia concludimus …', the act vatican.va's motu_proprio shelf files as 'Credo del Popolo di Dio - Solenne Professione di "
      + "fede' (`mag:paul-vi/credo-del-popolo-di-dio-1968`, 1968-06-30, …/motu_proprio/documents/hf_p-vi_motu-proprio_19680630_credo.html). "
      + 'The other motu proprio of the day, *Romanae dioecesis* (…/hf_p-vi_motu-proprio_19680630_romanae-dioecesis.html), is a different act.',
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
export const ACTA_HOLDS: Readonly<Record<string, ActaHold>> = {
  // Phase 2b-ii-a: the vernacular text of an encyclical the volume prints beside the
  // Latin, which the index enters as a second act under the same date (four in 1933 and
  // 1937). Not an act of its own: never created, and never the citation (the Latin
  // entry's page is, by the match overrides above and the evidence rule).
  '1933:275': {
    indexLine: '  » » » Siempre Nos fué. - A los Eminentísimos Señores, Cardenal / Francisco Vidal y Barraquer, Arzobispo de Tarragona, / '
      + 'Cardenal Eustaquio Ilundáin y Esteban, Arzobispo de / Sevilla y a los otros Excelentísimos Arzobispos y Obis- / '
      + 'pos y a todo el clero y pueblo de España: Sobre la / injusta situación creada a la Iglesia católica en España. 275',
    reason: 'the Spanish text of the encyclical *Dilectissima Nobis* (3 June 1933; the Latin text at AAS 25 (1933) 261, '
      + '`mag:pius-xi/dilectissima-nobis-1933`): AAS 25 p. 275 is headed \'CARTA ENCÍCLICA … PIO PP. XI … Siempre Nos fué '
      + "sumamente amada la noble Nación Española' (PDF page 275 of AAS-25-1933-ocr.pdf, read 2026-09-13). One act, not two.",
  },
  '1937:168': {
    indexLine: '  » » » Ai Venerabili Fratelli, Arcivescovi e Vescovi e altri Ordi- / narii di Germania, aventi pace e comunione con la Sede / '
      + 'Apostolica: sulla situazione della Chiesa Cattolica nel / Reich Germanico 168',
    reason: 'the Italian text of the encyclical *Mit brennender Sorge* (14 March 1937; the German text at AAS 29 (1937) 145, '
      + "`mag:pius-xi/mit-brennender-sorge-1937`): AAS 29 p. 168 is headed 'LETTERA ENCICLICA AI VENERABILI FRATELLI ARCIVESCOVI "
      + "E VESCOVI E ALTRI ORDINARI DI GERMANIA … PIO PAPA XI' (PDF page 168 of AAS-29-1937-ocr.pdf, read 2026-09-13). One act, not two.",
  },
  '1937:107': {
    indexLine: '  » » » Ai Patriarchi, Primati, Arcivescovi, Vescovi e altri Ordi- / narii aventi pace e comunione con la Sede Apostolica: / « del comunismo ateo 107',
    reason: 'the Italian text of the encyclical *Divini Redemptoris* (19 March 1937; the Latin text at AAS 29 (1937) 65, '
      + "`mag:pius-xi/divini-redemptoris-1937`, matched): AAS 29 p. 107 is headed 'LETTERA ENCICLICA AI PATRIARCHI, PRIMATI, "
      + "ARCIVESCOVI, VESCOVI E ALTRI ORDINARII AVENTI PACE E COMUNIONE CON LA SEDE APOSTOLICA: « DEL COMUNISMO ATEO ». PIO PAPA XI' "
      + '(PDF page 107 of AAS-29-1937-ocr.pdf, read 2026-09-13). One act, not two.',
  },
  // Phase 2b-ii-b: an incipit the OCR misspells into another well-formed word, which the
  // damage rule (create.ts) cannot see and the volume page contradicts. Held, not minted
  // under a word the act does not open with; a curated incipit reading is a mechanism this
  // phase does not add.
  '1959:101': {
    indexLine: '» » 24 CIVITATIS BOLIVARENSIS (Maturinensis). Begnum Dei. - Detractis / quibusdam territoriis a dioecesi Civitatis Bolivarensis, nova / '
      + 'dioecesis conditur, « Maturinensis » appellanda 101',
    reason: "the index's `Begnum Dei` is the OCR's: the constitution erecting Maturín (24 May 1958, AAS 51 (1959) 101, PDF page 101 of "
      + "AAS-51-1959-ocr.pdf, read 2026-09-13) opens 'Regnum Dei, quod est Ecclesia, quodque Christus tam amplum fore'. A record minted from "
      + 'the index line would carry an incipit the act does not print; held until an incipit correction can be curated.',
  },
  // Phase 2b-ii-c: an incipit the OCR misspells into a well-formed word (as *Begnum Dei*
  // above), and a statute the index lists as an entry of its own under the act that gives it.
  '1983:541': {
    indexLine: '         Dec. 4 FOEDERATAE CIVITATES AMERICAE SEPTEUTBIOJÏALIS. Bomenorum / multitudo. - Exarchatus Apostolicus pro fidelibus ritus / '
      + 'byzantini Romenorum in Foederatis Civitatibus Americae / Septentrionalis commorantibus constituitur 541',
    reason: "the index's `Bomenorum multitudo` is the OCR's: the constitution erecting the Romanian exarchate in the United States (4 December "
      + "1982, AAS 75 (1983) 541, PDF page 541 of AAS-75-1983-I-ocr.pdf, read 2026-09-13) opens 'Romenorum multitudo ritus byzantini, exeunte "
      + "superiore saeculo'. A record minted from the index line would carry an incipit the act does not print; held until an incipit "
      + 'correction can be curated.',
  },
  '1994:843': {
    indexLine: '  » » » Officii Laboris Apostolicae Sedis ordinatio . 843',
    reason: 'not an act: AAS 86 (1994) 843 (PDF page 843 of AAS-86-1994-ocr.pdf, read 2026-09-13) prints \'Officii Laboris apud Sedem '
      + "Apostolicam ordinatio. / STATUTO DELL'UFFICIO DEL LAVORO DELLA SEDE APOSTOLICA / Art. 1', the statute the motu proprio *La "
      + "sollecitudine* of 30 September 1994 (p. 841, `mag:john-paul-ii/la-sollecitudine-1994`) gives, which the index lists under the "
      + 'act with the same ditto date as its two *Adnexa* at 851 and 853 (consumed as sub-items, index.ts); this line alone is not headed '
      + '*Adnexum*, so it is held by row.',
  },
  '1937:200': {
    indexLine: '  » » » Al Episcopado Mejicano sobre la situación religiosa . . . 200',
    reason: 'the Spanish text of the encyclical *Firmissimam constantiam* (28 March 1937; the Latin text at AAS 29 (1937) 189, '
      + "`mag:pius-xi/firmissimam-constantiam-1937`): AAS 29 p. 200 is headed 'CARTA APOSTOLICA DE SU SANTIDAD EL PAPA PIO XI AL "
      + "EPISCOPADO MEJICANO: SOBRE LA SITUACIÓN RELIGIOSA' (PDF page 200 of AAS-29-1937-ocr.pdf, read 2026-09-13). One act, not two.",
  },
  // Phase 2b-iii-a: the Italian original of *Divini illius Magistri* (31 December 1929),
  // printed in the December fascicle of AAS 21 (1929) 723-762 under its own heading and
  // entered by the 1929 index as an encyclical of its own; the Latin follows at AAS 22
  // (1930) 49-86, which the shelf record cites (`mag:pius-xi/divini-illius-magistri-1929`).
  // One act, not two: the same shape as the four of 1933 and 1937 above.
  '1929:723': {
    indexLine: '  » » 31 Rappresentanti in terra. — Ad Venerabiles Fratres, Patriar­ / chas, Primates, Archiepiscopos, Episcopos, aliosque / '
      + 'locorum Ordinarios pacem et communionem cum Apo­ / stolica Sede habentes et ad dilectos filios christi­ / '
      + 'fideles orbis universos: De christiana iuventae edu­ / catione 723',
    reason: 'the Italian text of the encyclical *Divini illius Magistri* (31 December 1929; the Latin text at AAS 22 (1930) 49, '
      + "`mag:pius-xi/divini-illius-magistri-1929`): AAS 21 p. 723 is headed 'III / AD VENERABILES FRATRES PATRIARCHAS, PRIMATES, "
      + "ARCHIEPISCOPOS, EPISCOPOS, ALIOSQUE LOCORUM ORDINARIOS … DE CHRISTIANA IUVENTAE EDUCATIONE. / PIO PP. XI / VENERABILI FRATELLI E "
      + "DILETTI FIGLI / SALUTE E APOSTOLICA BENEDIZIONE / Rappresentanti in terra di quel Divino Maestro …' (PDF page 723 of "
      + 'AAS-21-1929-ocr.pdf, read 2026-09-18). One act, not two.',
  },
  // Phase 2b-iii-a: the motu proprio *In allocutione* (5 August 1930), which the 1930 index
  // cites at 307 -- a page that opens the public consistory of 3 July 1930 -- where the
  // volume prints the act at 337-340. Its year is the parser's repair of `1030`, which the
  // row on p. 87 confirms for its dittos; confirmed, it would be created at the index's
  // page, so it is held here until a page correction exists.
  '1930:307': {
    indexLine: '» Aug. 5 In allocutione. - De novo opere in locum Leoniani operis / de Fidei praeservatione sufficiendo 307',
    reason: "the index's page is not the act's: AAS 22 (1930) p. 307 (PDF page 307 of AAS-22-1930-ocr.pdf, read 2026-09-18) opens 'II. - "
      + "CONSISTORIUM PUBLICUM / Feria V, 3 Iulii 1930, in Aula supra porticum Basilicae Vaticanae …', and the motu proprio opens at p. 337 "
      + "('MOTU PROPRIO / DE NOVO OPERE IN LOCUM LEONIANI OPERIS DE FIDEI PRAESERVATIONE SUFFICIENDO. / PIUS PP. XI / In Allocutione habita "
      + "in Consistorio …'), dated at p. 340 'die v mensis Augusti, in festo Dedicationis Sanctae Mariae ad Nives, anno MDCCCCXXX, Pontificatus "
      + 'Nostri nono\'. Held for a page correction, as *Casti connubii* (index `530`, opening at 539) is left unmatched for one.',
  },
};

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
  // Phase 2b-ii-a (AAS 24-49): the volumes of the 1930s and 1950s set two short letters on
  // one page as a matter of course, numbered I and II under one heading. Every page below
  // was read in the volume PDF on 2026-09-13; a page two entries cite that the volume
  // does not print two acts on (an OCR misreading of the page number) is held by the
  // creator instead (create.ts, `page-shared`) and listed in the report.
  'AAS:24:39': {
    documentIds: ['mag:pius-xi/constitutione-apostolica-1931', 'mag:pius-xi/apostolicum-munus-1931'],
    evidence: "AAS 24 (1932) p. 39 (PDF page 39 of AAS-24-1932-ocr.pdf) is headed 'LITTERAE APOSTOLICAE' and prints "
      + "'I / PRAEFECTURAE APOSTOLICAE DE SINU NOMEN FIT A SANCTO GEORGIO / PIUS PP. XI / Ad futuram rei memoriam. — "
      + "Constitutione Apostolica Nostra, die XII mensis Iunii an. MDCCCCXXIV data …' (dated 'die XII mensis Ianuarii an. "
      + "MDCCCCXXXI') and, lower on the same page, 'II / SEPARATO TERRITORIO E VICARIATU APOSTOLICO CAMERONENSI NOVA "
      + "ERIGITUR PRAEFECTURA APOSTOLICA DE DOUALA / PIUS PP. XI / Ad futuram rei memoriam. — Apostolicum munus, quod in "
      + "terris gerimus …'. The index cites both at 39 (`1931 Ian. 12 Constitutione Apostolica … 39`, `» Martii 31 "
      + 'Apostolicum munus … 39`).',
  },
  'AAS:26:19': {
    documentIds: ['mag:pius-xi/quum-perlibenter-1933', 'mag:pius-xi/nobilissima-cui-praesides-1933'],
    evidence: "AAS 26 (1934) p. 19 (PDF page 19 of AAS-26-1934-ocr.pdf) carries the end of the letter 'I / AD EMUM P. D. "
      + "MICHAELEM EPISCOPUM TUSCULANUM S. R. E. CARDINALEM LEGA … / Quum perlibenter cognoverimus …' (begun on p. 18 under "
      + "'EPISTOLAE', dated 'die XIV mensis Septembris, anno MDCCCCXXXIII') and, at its foot, 'II / AD EMUM P. D. CAROLUM "
      + "DALMATIUM TIT. S. EUSEBII S. R. E. PRESB. CARD. MINORETTI, ARCHIEPISCOPUM IANUENSEM … / PIUS PP. XI / Dilecte fili "
      + "Noster, salutem et apostolicam Benedictionem. — Nobilissima, cui praesides, Ecclesia …'. The index cites both at 19 "
      + '(`1933 Sept. 14 Quum perlibenter … 19`, `» Nov. 1 Nobilissima, cui praesides … 19`): the first letter opens on '
      + 'p. 18 in the volume and the index cites its last page, which the second opens on.',
  },
  'AAS:28:102': {
    documentIds: ['mag:pius-xi/cum-in-republica-estoniensi-1933', 'mag:pius-xi/cum-aterradensis-1933'],
    evidence: "AAS 28 (1936) p. 102 (PDF page 102 of AAS-28-1936-ocr.pdf) is headed 'LITTERAE APOSTOLICAE' and prints "
      + "'I / IN REPUBLICA ESTONIENSI NUNTIATURA APOSTOLICA CONSTITUITUR / PIUS PP. XI / Ad perpetuam rei memoriam. — Cum in "
      + "Republica Estoniensi …' (dated 'die XI m. Septembris, an. MCMXXXIII') and, lower on the same page, 'II / S. RAPHAËL "
      + "ARCHANGELUS DIOECESIS ATERRADENSIS PATRONUS COELESTIS DECLARATUR / PIUS PP. XI / Ad perpetuam rei memoriam. — Cum "
      + "Aterradensis dioecesis in Brasilia …'. The index cites both at 102 (`1933 Sept. 11 Cum in República Estoniensi … 102`, "
      + '`» » 29 Cum Aterradensis … 102`).',
  },
  'AAS:45:91': {
    documentIds: ['mag:pius-xii/quinto-ac-vicesimo-1952', 'mag:pius-xii/peculiari-animi-1952'],
    evidence: "AAS 45 (1953) p. 91 (PDF page 91 of AAS-45-1953-ocr.pdf) is headed 'EPISTULAE' and prints 'I / AD EMUM P. D. "
      + "PETRUM TIT. SANCTAE MARIAE TRANS TIBERIM S. R. E. PRESB. CARDINALEM SEGURA Y SAENZ … / PIUS PP. XII / Dilecte Fili "
      + "Noster, salutem et Apostolicam Benedictionem — Quinto ac vicesimo exeunte anno …' (dated 'die VI mensis Decembris, "
      + "anno MDCCCCLII') and, lower on the same page, 'II / AD EMUM P. D. NORMANNUM THOMAM TIT. SANCTORUM QUATTUOR "
      + "CORONATORUM S. R. E. PRESB. CARDINALEM GILROY, ARCHIEPISCOPUM SYDNEYENSEM … / PIUS PP. XII / … Peculiari animi "
      + "delectatione accepimus …'. The index cites both at 91 (`1952 Dec. 6 Quinto ac vicesimo … 91`, `» » 8 Peculiari animi … 91`).",
  },
  // Phase 2b-ii-b (AAS 51-69): Paul VI's apostolic letters of 1973-1977, two to a page,
  // numbered under one heading. Every page below was read in the volume PDF on 2026-09-13.
  'AAS:65:237': {
    documentIds: ['mag:paul-vi/quoniam-universae-1973', 'mag:paul-vi/quam-ardens-1973'],
    evidence: "AAS 65 (1973) p. 237 (PDF page 237 of AAS-65-1973-ocr.pdf) prints 'IV / Nuntiatura Apostolica in Australia conditur. / PAULUS PP. VI / "
      + "Ad perpetuam rei memoriam. — Quoniam universae Ecclesiae regendae …' (dated 'die v mensis Martii, anno MDCCCCLXXIII') and, lower on the "
      + "same page, 'V / Beata Maria Virgo Perdolens patrona Congregationis Passionis Iesu Christi declaratur. / PAULUS PP. VI / Ad perpetuam rei "
      + "memoriam. — Quam ardens usque fuerit …'. The index cites both at 237 (`1973 Mart. 5 Quoniam universae … 237`, `» » 8 Quam ardens … 237`).",
  },
  'AAS:68:256': {
    documentIds: ['mag:paul-vi/summae-ac-paene-1975', 'mag:paul-vi/verba-domini-1975'],
    evidence: "AAS 68 (1976) p. 256 (PDF page 256 of AAS-68-1976-ocr.pdf) carries the end of the letter beatifying Giovanna Francesca Michelotti "
      + "(begun on p. 254 under 'V', dated 'die i mensis Novembris, anno MDCCCCLXXV, Pontificatus Nostri tertio decimo') and, at its foot, 'VI / "
      + "Venerabilis Dei Famulus Gaspar Bertoni, sacerdos et legifer pater Congregationis a Sacris Stigmatibus D.N.I.Ch., Beatorum Caelitum honoribus "
      + "decoratur. / PAULUS PP. VI / Ad perpetuam rei memoriam. — Verba Domini in Evangelio locuti …'. The index cites both at 256 (`» » » Summae ac "
      + 'paene … 256`, `» » » Verba Domini … 256`): the first letter opens earlier in the volume and the index cites its last page, which the second opens on.',
  },
  'AAS:68:400': {
    documentIds: ['mag:paul-vi/usu-iamdudum-1976', 'mag:paul-vi/peculiare-et-assiduum-1976'],
    evidence: "AAS 68 (1976) p. 400 (PDF page 400 of AAS-68-1976-ocr.pdf) prints 'III / Nuntiatura Apostolica in Nigeria constituitur. / PAULUS PP. VI / "
      + "Ad perpetuam rei memoriam. — Usu iam dudum est comprobatum …' (dated 'die XXIX mensis Aprilis, anno MCMLXXVI') and, lower on the same page, "
      + "'IV / Beata Maria Virgo sub titulo Matris Divini Pastoris principalis confirmatur apud Deum Patrona dioecesis S. Caroli in Venetiola. / PAULUS "
      + "PP. VI / Ad perpetuam rei memoriam. — Peculiarem et assiduum considerantes cultum …'. The index cites both at 400 (`» Apr. 29 Usu iamdudum … "
      + '400`, `» Maii 26 Peculiare et assiduum … 400`), the incipits as it spells them.',
  },
  'AAS:69:252': {
    documentIds: ['mag:paul-vi/quo-expeditius-1976', 'mag:paul-vi/omnia-et-in-omnibus-1976'],
    evidence: "AAS 69 (1977) p. 252 (PDF page 252 of AAS-69-1977-ocr.pdf) is headed 'LITTERAE APOSTOLICAE' and prints 'I / In Republica Capitis Viridis "
      + "Nuntiatura Apostolica conditur. / PAULUS PP. VI / Ad perpetuam rei memoriam. — Quo expeditius regimini provideatur …' (dated 'die xiii mensis "
      + "Maii, anno MCMLXXVI') and, lower on the same page, 'II / Beatae Caelitis honores tribuuntur Venerabili Servae Dei Mariae a Iesu López de Rivas "
      + "Carmelitidi Excalceatae. / PAULUS PP. VI / Ad perpetuam rei memoriam. — « Omnia et in omnibus Christus » (Col. 3, 11) …'. The index cites both "
      + 'at 252 (`1976 Maii 13 Quo expeditius … 252`, `» Nov. 14 Omnia et in omnibus … 252`).',
  },
  'AAS:69:198': {
    documentIds: ['mag:paul-vi/vehementi-flagrantes-1977', 'mag:paul-vi/quam-altas-1977'],
    evidence: "AAS 69 (1977) p. 198 (PDF page 198 of AAS-69-1977-ocr.pdf) is headed 'LITTERAE APOSTOLICAE' and prints 'I / In Republica Populari "
      + "Congensi Nuntiatura Apostolica constituitur. / PAULUS PP. VI / Ad perpetuam rei memoriam. — Vehementi flagrantes amore …' (dated 'die XXXI "
      + "mensis Ianuarii, anno MCMLXXVII') and, lower on the same page, 'II / Beata Maria Virgo sub titulo Dominae Nostrae a Salute principalis dioecesis "
      + "Legazpiensis Patrona constituitur ac declaratur. / PAULUS PP. VI / Ad perpetuam rei memoriam. — Quam altas radices …'. The index cites both at "
      + '198 (`1977 Ian. 31 Vehementi flagrantes … 198`, `» Febr. 7 Quam altas … 198`).',
  },
  // Two pages of the era that open two acts the shelves *both* hold: the matcher cites
  // each shelf record at the page the index gives it, and invariant 25 admits the pair.
  'AAS:60:10': {
    documentIds: ['mag:paul-vi/quantum-utilitatis-1967-08-19', 'mag:paul-vi/recte-asseverat-1967'],
    evidence: "AAS 60 (1968) p. 10 (PDF page 10 of AAS-60-1968-ocr.pdf, read 2026-09-13) prints 'V / Nuntiatura Apostolica in Regno Lesothiano "
      + "erigitur / PAULUS PP. VI / Ad perpetuam rei memoriam. — Quantum utilitatis e publicis officiorum rationibus …' (dated 'die xix mensis "
      + "Augusti, anno MCMLXVII') and, lower on the same page, 'VI / Titulo ac privilegiis Basilicae Minoris ecclesia S. Udalrici in oppido "
      + "« Kreuzungen » sita, dioecesis Basileensis, honestatur. / PAULUS PP. VI / Ad perpetuam rei memoriam. — Recte asseverat Sanctus Augustinus "
      + "…'. The index cites both at 10 (`1967 Aug. 19 Quantum utilitatis … 10`, `» » 21 Recte asseverat … 10`); both are on the apost_letters shelf.",
  },
  'AAS:64:471': {
    documentIds: ['mag:paul-vi/cum-sit-1972', 'mag:paul-vi/quantopere-aestimanda-1972'],
    evidence: "AAS 64 (1972) p. 471 (PDF page 471 of AAS-64-1972-ocr.pdf, read 2026-09-13) prints 'II / Nuntiatura Apostolica Reipublicae "
      + "Algeriensis constituitur. / PAULUS PP. VI / Ad perpetuam rei memoriam. — Cum sit e maioribus apostolici officii Nostri munus …' (dated "
      + "'die xiii mensis Aprilis, anno MDCCCCLXXII') and, lower on the same page, 'III / In Republica Tunetana Apostolica Nuntiatura constituitur, "
      + "cuius sedes in urbe Icosio seu Alger, ut gallica lingua, collocatur. / PAULUS PP. VI / Ad perpetuam rei memoriam. — Quantopere aestimanda "
      + "ac facienda sit amicitia …'. The index cites both at 471 (`» Apr. 13 Cum sit … 471`, `» » » Quantopere aestimanda … 471`); both are on the "
      + 'apost_letters shelf.',
  },
  // Phase 2b-ii-c (AAS 71-94): John Paul II's apostolic letters, which the volumes set two
  // to a page as a matter of course -- a nunciature erected and a basilica raised, a
  // patroness confirmed and a beatification -- and which his apost_letters shelf carries
  // both of: eighteen pages of matched pairs, each read in the volume PDF on 2026-09-13
  // (the second act's dating formula stands on the page after). Two more pages the index
  // gives two matched acts (AAS 76 (1984) 946 and AAS 82 (1990) 43) print one -- the OCR's
  // 946 for Cabinda's 947, the index's 43 for *Fidelem populum*'s 42 -- and are withheld by
  // the join (match.ts, `sharedPages`) for a curated page correction this phase does not
  // attempt.
  'AAS:71:920': {
    documentIds: ['mag:john-paul-ii/pro-nostro-1979', 'mag:john-paul-ii/qui-a-pueris-1979'],
    evidence: "AAS 71 (1979) p. 920 (PDF page 920 of AAS-71-1979-ocr.pdf, read 2026-09-13) prints 'V / Regiones Civitatis Beninensis et "
      + "Toganae seiunguntur ab Apostolica Nuntiatura Abidianensi et ad Accraè'nsem adiciuntur. / IOANNES PAULUS PP. II / Ad "
      + "perpetuam rei memoriam. — Pro Nostro munere Patris et Pastoris universae Ecclesiae, intenti quidem ad singulas etiam…' "
      + "(dated 'Datum Romae, apud Sanctum Petrum, sub anulo Piscatoris, die n mensis Maii, anno MCMLXXIX, Pontificatus Nostri "
      + "primo.') and, lower on the same page, 'VI / Christi Mater sub titulo « Immaculatum Cor Beatae Mariae Virginis » Patrona "
      + "dioecesis Sinceleiensis confirmatur. / IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — Qui a pueris, ac fere ab ipsa "
      + "nativitate sincero ac tenero amore in beatissimam Virginem…'. The index cites both at 920; both are on the apost_letters "
      + "shelf.",
  },
  'AAS:71:975': {
    documentIds: ['mag:john-paul-ii/cum-cathedrale-1979', 'mag:john-paul-ii/innumera-fere-1979'],
    evidence: "AAS 71 (1979) p. 975 (PDF page 975 of AAS-71-1979-ocr.pdf, read 2026-09-13) prints 'IV / Templum cathedrale dioecesis "
      + "Galvestoniensis-Houstoniensis ad gradum Basilicae Minoris evehitur. / IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — "
      + "Cum cathedrale dioecesis Galvestoniensis-Houstoniensis templum ut ad Basilicae Minoris g…' (dated 'Datum Romae, apud S. "
      + "Petrum, sub anulo Piscatoris, die II mensis Augusti, anno MCMLXXIX, Pontificatus Nostri primo.') and, lower on the same "
      + "page, 'V / Sacra aedes in dioecesi S. Marci Argentanensis Beatae Mariae Virginis Nativitati dicata, quae vulgari sermone « "
      + "Maria Santissima del Pettoruto » cognominatur, ad gradum et dignitatem Basilicae Minoris evehitur. / IOANNES PAULUS PP. II / "
      + "Ad perpetuam rei memoriam. — Innúmera fere sunt templa a populo Christiano toto terrarum orbe per labentem saeculorum…'. The "
      + "index cites both at 975; both are on the apost_letters shelf.",
  },
  'AAS:72:384': {
    documentIds: ['mag:john-paul-ii/beatam-ac-semper-episcopo-plocensi-1980', 'mag:john-paul-ii/amor-noster-1980'],
    evidence: "AAS 72 (1980) p. 384 (PDF page 384 of AAS-72-1980-ocr.pdf, read 2026-09-13) prints 'III / Episcopo Plocensi conceditur ut "
      + "possit imaginem B. M. V. coronare pretioso diademate, in loco Sierpe, in finibus suae ipsius dioecesis veneratam. / IOANNES "
      + "PAULUS PP. II / Ad perpetuam rei memoriam. — Beatam ac semper Virginem Mariam, Christi Matrem sanctissimam, eandemque "
      + "hominum decus a…' (dated 'Datum Romae, apud S. Petrum, sub Anulo Piscatoris, die xxv mensis Aprilis, anno MDCCCCLXXX, "
      + "Pontificatus Nostri altero.') and, lower on the same page, 'IV / In loco Niepokalanów, qui est in Polonia, templum B. M. V. "
      + "Immaculatae, Mediatricis omnium gratiarum, ad dignitatem Basilicae Minoris evehitur. / IOANNES PAULUS PP. II / Ad perpetuam "
      + "rei memoriam. — Amor Noster in beatissimam Virginem Mariam, Christi Matrem, tam in pectore regnat et tam…'. The index cites "
      + "both at 384; both are on the apost_letters shelf.",
  },
  'AAS:72:592': {
    documentIds: ['mag:john-paul-ii/vigilem-curam-1980', 'mag:john-paul-ii/ecclesia-sancta-1980'],
    evidence: "AAS 72 (1980) p. 592 (PDF page 592 of AAS-72-1980-ocr.pdf, read 2026-09-13) prints 'IV / In Republica Maliana Nuntiatura "
      + "Apostolica constituitur. / IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — Vigilem curam agentes de Christi Ecclesia, "
      + "quae divino mandato omnes populos invitat ad Ev…' (dated 'Datum Romae, apud Sanctum Petrum, sub anulo Piscatoris, die III "
      + "mensis Iunii, anno MCMLXXX, Pontificatus Nostri secundo.') and, lower on the same page, 'V / Templum S. Hyacinthi de "
      + "Yaguachi, in archidioecesi Guayaquilensi, ad dignitatem Basilicae Minoris evehitur. / IOANNES PAULUS PP. II / Ad perpetuam "
      + "rei memoriam. — Ecclesia sancta catholica, a primaeva sui aetate, cultum Sanctorum non modo non reprehen…'. The index cites "
      + "both at 592; both are on the apost_letters shelf.",
  },
  'AAS:73:477': {
    documentIds: ['mag:john-paul-ii/quandoquidem-publicae-1980', 'mag:john-paul-ii/in-variis-vitae-1980'],
    evidence: "AAS 73 (1981) p. 477 (PDF page 477 of AAS-73-1981-ocr.pdf, read 2026-09-13) prints 'I / In Re publica Zimbabuae constituitur "
      + "Apostolica Nuntiatura. / IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — Quandoquidem publicae nuper necessitudinis "
      + "ratione inter Apostolicam Sedem et Civitatem…' (dated 'Datum Romae, apud Sanctum Petrum, sub anulo Piscatoris, die xxvii "
      + "mensis Iunii anno MCMLXXX, Pontificatus Nostri secundo.') and, lower on the same page, 'II / Venerabili Servo Dei Aloisio "
      + "Orione Beatorum honores decernuntur. / IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — « In variis vitae generibus et "
      + "officiis una sanctitas excolitur ab omnibus, qui a Spiritu…'. The index cites both at 477; both are on the apost_letters "
      + "shelf.",
  },
  'AAS:75-I:877': {
    documentIds: ['mag:john-paul-ii/magnopere-curae-1982', 'mag:john-paul-ii/quantum-denique-suetiae-natione-1982'],
    evidence: "AAS 75-I (1983) p. 877 (PDF page 877 of AAS-75-1983-I-ocr.pdf, read 2026-09-13) prints 'III / In Norvegia Nuntiatura "
      + "Apostolica constituitur. / IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — Magnopere curae est Nobis ad effectum "
      + "consilia adducere, quibus putamus commune religionis…' (dated 'Datum, apud Sanctum Petrum, sub anulo Piscatoris, die i "
      + "mensis Augusti, anno Domini MCMLXXXII, Pontificatus Nosfri quarto.') and, lower on the same page, 'IV / In Suetiae natione "
      + "Apostolica constituitur Nuntiatura. / IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — Quantum denique pacis optatae ac "
      + "prosperitatis, quanta insuper ipsius progressionis social…'. The index cites both at 877; both are on the apost_letters "
      + "shelf.",
  },
  'AAS:75-I:17': {
    documentIds: ['mag:john-paul-ii/quecumque-domus-1982', 'mag:john-paul-ii/quantum-denique-santa-rita-de-cascia-1982'],
    evidence: "AAS 75-I (1983) p. 17 (PDF page 17 of AAS-75-1983-I-ocr.pdf, read 2026-09-13) prints 'II / In Italia templum cathedrale "
      + "Calliense, Beatae Mariae Virgini in caelum Assumptae sacrum, ad honorem Basilicae Minoris evehitur. / IOANNES PAULUS PP. II "
      + "/ Ad perpetuam rei memoriam. — Quaecumque Domus Dei decorem Nobis augere videntur, ea libenti animo studemus comparare. Q…' "
      + "(dated 'Datum Romae, apud Sanctum Petrum, sub anulo Piscatoris, die XXIV mensis Septembris, anno MCMLXXXII, Pontificatus "
      + "Nostri quarto.') and, lower on the same page, 'III / Sancta Rita de Cascia oppidi ac municipii « Viçosa », intra fines "
      + "archidioecesis Marianensis in Brasilia, Patrona principalis confirmatur. / IOANNES PAULUS PP. II / Ad perpetuam rei "
      + "memoriam. — Quantum denique cultus Sanctae Ritae de Cascia contulerit Christifidelium pietati inflamma…'. The index cites "
      + "both at 17; both are on the apost_letters shelf.",
  },
  'AAS:77:931': {
    documentIds: ['mag:john-paul-ii/qui-dei-consilio-1983', 'mag:john-paul-ii/sacerdotalis-usquequaque-1984'],
    evidence: "AAS 77 (1985) p. 931 (PDF page 931 of AAS-77-1985-ocr.pdf, read 2026-09-13) prints 'I / Nuntiatura Apostolica in Regno "
      + "Nepaliae conditur. / IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — Qui Dei consilio universae Ecclesiae praesumus, "
      + "sicut in eius negotiis expediendis usum…' (dated 'Datum Romae, apud Sanctum Petrum, sub anulo Piscatoris, die x mensis "
      + "Septembris, anno MCMLXXXIII, Pontificatus Nostri quinto.') and, lower on the same page, 'II / Venerabili Servo Dei Clementi "
      + "Marchisio honores Beatorum caelitum rite decernuntur. / IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — Sacerdotalis "
      + "usquequaque animi ac studii vitae ac disciplinae exemplaria numquam non conqu…'. The index cites both at 931; both are on "
      + "the apost_letters shelf.",
  },
  'AAS:76:262': {
    documentIds: ['mag:john-paul-ii/ex-quo-1983', 'mag:john-paul-ii/ipsum-quo-1983'],
    evidence: "AAS 76 (1984) p. 262 (PDF page 262 of AAS-76-1984-ocr.pdf, read 2026-09-13) prints 'III / Delegationis Apostolicae in "
      + "Malaysia nomen mutatur. / IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — Ipsum quo fungimur munus Christi Ecclesiam "
      + "regendi postulat ut quae sint animarum bono uti…' (dated 'Datum Romae, apud S. Petrum, sub anulo Piscatoris, die VII mensis "
      + "Decembris, anno MCMLXXXIII, Pontificatus Nostri sexto.') and, lower on the same page, 'IV / Delegatio Apostolica Laosiana "
      + "constituitur. / IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — Ex quo Dei consilio beatissimo Petro, Apostolorum "
      + "Principi, in regimen totius Ecclesiae su…'. The index cites both at 262; both are on the apost_letters shelf.",
  },
  'AAS:77:281': {
    documentIds: ['mag:john-paul-ii/ut-ecclesiae-ipsius-1984', 'mag:john-paul-ii/inspicienti-cuique-1984'],
    evidence: "AAS 77 (1985) p. 281 (PDF page 281 of AAS-77-1985-ocr.pdf, read 2026-09-13) prints 'II / Nuntiatura Apostolica in Insulis "
      + "Seicellensibus constituitur. / IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — Ut Ecclesiae ipsius, quae Christi "
      + "caritate nullam non prosequitur per orbem gentem, regimi…' (dated 'Datum Romae, apud Sanctum Petrum, sub anulo Piscatoris, "
      + "die xxvii mensis Iulii anno MCMLXXXIV, Pontificatus Nostri sexto.') and, lower on the same page, 'III / B. Virgo Maria sub "
      + "titulo Immaculati Cordis Patrona Angolae confirmatur. / IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — Inspicienti "
      + "cuique tam ortum Christiani nominis quam ipsius progressum haec quinque per su…'. The index cites both at 281; both are on "
      + "the apost_letters shelf.",
  },
  'AAS:83:18': {
    documentIds: ['mag:john-paul-ii/quo-aptius-1990', 'mag:john-paul-ii/templum-beatae-mariae-virgini-1990'],
    evidence: "AAS 83 (1991) p. 18 (PDF page 18 of AAS-83-1991-ocr.pdf, read 2026-09-13) prints 'IV / In Republica « Myanmar » nuncupata "
      + "Delegatio Apostolica constituitur. / IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — Quo aptius Evangelizationis operi "
      + "necnon Ecclesiae regimini in Republica « Myanmar » nuncu…' (dated 'Datum Romae, apud Sanctum Petrum, sub anulo Piscatoris, "
      + "die XIII mensis Septembris, anno MCMXC, Pontificatus Nostri duodecimo.') and, lower on the same page, 'V / In « Morbio "
      + "Inferiore », quod oppidum ad dioecesim Luganensem pertinet, templum B.M.V, vulgo « Madonna dei Miracoli » dicatum titulo "
      + "Basilicae Minoris exornatur. / IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — Templum Beatae Mariae Virgini « Madonna "
      + "dei Miracoli » vulgo appellatae dicatum, quod in l…'. The index cites both at 18; both are on the apost_letters shelf.",
  },
  'AAS:92:312': {
    documentIds: ['mag:john-paul-ii/armeniam-nationem-1992', 'mag:john-paul-ii/nos-vos-1998'],
    evidence: "AAS 92 (2000) p. 312 (PDF page 312 of AAS-92-2000-ocr.pdf, read 2026-09-13) prints 'III / In Republica Armenia Nuntiatura "
      + "Apostolica conditur. / IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — Armeniam Nationem Romani Pontifices singulari "
      + "prorsus cogitatione curaque per saeculorum…' (dated 'Datum Romae, apud Sanctum Petrum, sub anulo Piscatoris, die xxiv mensis "
      + "Maii, anno MCMXCII, Pontificatus Nostri decimo quarto.') and, lower on the same page, 'IV / Dei Venerabilis Servus, Iosephus "
      + "Antonius Tovini, caelitum Beatorum refertur in fastos. / IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — « Nos vos me "
      + "elegistis, sed Ego elegi vos et posui vos, ut vos eatis et fructum afferatis,…'. The index cites both at 312; both are on "
      + "the apost_letters shelf.",
  },
  'AAS:85:127': {
    documentIds: ['mag:john-paul-ii/qui-pro-nostro-1992', 'mag:john-paul-ii/in-florenti-et-clarissima-1992'],
    evidence: "AAS 85 (1993) p. 127 (PDF page 127 of AAS-85-1993-ocr.pdf, read 2026-09-13) prints 'III / In Foederatis Civitatibus "
      + "Mexicanis conditur Nuntiatura Apostolica. / IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — Qui pro Nostro munere de "
      + "universa Ecclesia solliciti sumus, etiam in Nuntiaturas in Gentib…' (dated 'Datum Romae, apud Sanctum Petrum, sub anulo "
      + "Piscatoris, die xxi mensis Septembris, anno Domini MCMXCII, Pontificatus Nostri quinto decimo.') and, lower on the same "
      + "page, 'IV / Sanctuarium Beatae Mariae Virginis Lapurdensis, quod in urbe Sancti Iacobi in Chilia exstat, ad Basilicae "
      + "Minoris gradum dignitatemque evehitur. / IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — In fiorenti et clarissima "
      + "quidem urbe Sancti Iacobi in Chilia probe novimus eminere Sanctu…'. The index cites both at 127; both are on the "
      + "apost_letters shelf.",
  },
  'AAS:86:394': {
    documentIds: ['mag:john-paul-ii/ad-plenius-1993', 'mag:john-paul-ii/est-quidem-1994'],
    evidence: "AAS 86 (1994) p. 394 (PDF page 394 of AAS-86-1994-ocr.pdf, read 2026-09-13) prints 'I / In Republica Insularum "
      + "Marshallensium Nuntiatura Apostolica conditur. / IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — Ad plenius "
      + "confirmandas necessitudinis rationes, quae inter hanc Apostolicam Sedem et Re…' (dated 'Datum Romae, apud Sanctum Petrum, "
      + "sub anulo Piscatoris, die xxx mensis Decembris, anno MCMXCIII, Pontificatus Nostri sexto decimo.') and, lower on the same "
      + "page, 'II / Beata Maria Virgo titulo « Domina nostra Palaestinae Regina » invocata, Patrona apud Deum Ordinis Equestris S. "
      + "Sepulcri Hierosolymitani confirmatur. / IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — Est quidem notum sodales "
      + "illustris Ordinis Equestris S. Sepulcri Hierosolymitani singula…'. The index cites both at 394; both are on the "
      + "apost_letters shelf.",
  },
  'AAS:86:571': {
    documentIds: ['mag:john-paul-ii/ad-firmiores-republica-africae-australis-1994', 'mag:john-paul-ii/fideles-ecclesialis-de-guadalupe-1994'],
    evidence: "AAS 86 (1994) p. 571 (PDF page 571 of AAS-86-1994-ocr.pdf, read 2026-09-13) prints 'VI / Nuntiatura in Republica Africae "
      + "Australie erigitur. / IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — Ad firmiores magisque frugiferas reddendas "
      + "publicae necessitudinis rationes, quae inter…' (dated 'Datum Romae, apud Sanctum Petrum, sub anulo Piscatoris, die v mensis "
      + "Martii, anno MCMXCIV, Pontificatus Nostri sexto decimo.') and, lower on the same page, 'VII / Beata Maria Virgo sub titulo « "
      + "de Guadalupe » Patrona apud Deum dioecesis Colimensis confirmatur. / IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — "
      + "Fideles ecclesialis communitatis Colimensis, a Leone Pp. XIII die xi mensis Decembris an…'. The index cites both at 571; "
      + "both are on the apost_letters shelf.",
  },
  'AAS:86:791': {
    documentIds: ['mag:john-paul-ii/sacra-illa-loco-podgorze-1994', 'mag:john-paul-ii/notae-sunt-dioecesis-coatzacoalsensis-1994'],
    evidence: "AAS 86 (1994) p. 791 (PDF page 791 of AAS-86-1994-ocr.pdf, read 2026-09-13) prints 'III / Imago Beatae Mariae Virginis de "
      + "Perpetuo Succursu, pie servata in ecclesia paroeciali Sanctissimo Redemptori dicata, loco Podgórze, Cracoviae in regione, "
      + "pretioso diademate redimiri sinitur « nomine et auctoritate Summi Pontificis ». / IOANNES PAULUS PP. II / Ad perpetuam rei "
      + "memoriam. — Sacra illa paroecialis aedes Sanctissimo Redemptori dicata loco Podgórze, Cracoviae in r…' (dated 'Datum Romae, "
      + "apud Sanctum Petrum, sub anulo Piscatoris, die quarto decimo mensis Maii, anno MCMXCIV, Pontificatus Nostri sexto decimo.') "
      + "and, lower on the same page, 'IV / Sanctus Ioseph, Beatae Mariae Virginis Sponsus, Patronus apud Deum dioecesis "
      + "Coatzacoalsensis confirmatur. / IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — Notae sunt pietas ac veneratio quibus "
      + "sanctus Ioseph, Beatae Mariae Virginis Sponsus, coli…'. The index cites both at 791; both are on the apost_letters shelf.",
  },
  'AAS:89:607': {
    documentIds: ['mag:john-paul-ii/evangelii-disseminationem-1997', 'mag:john-paul-ii/inter-sacras-rengo-1997'],
    evidence: "AAS 89 (1997) p. 607 (PDF page 607 of AAS-89-1997-ocr.pdf, read 2026-09-13) prints 'II / Templum cathedrale Deo dicatum in "
      + "honorem S. Ioannis Baptistae in dioecesi Saltensi in Uruguay ad gradum Basilicae Minoris evehitur. / IOANNES PAULUS PP. II / "
      + "Ad perpetuam rei memoriam. — Evangelii disseminationem dum prospicimus per orbem terrarum, singulari ratione communit…' "
      + "(dated 'Datum Romae, apud Sanctum Petrum, sub anulo Piscatoris, die VIII mensis Aprilis, anno MCMXCVII, Pontificatus Nostri "
      + "undevicesimo.') and, lower on the same page, 'III / Templum paroeciale Sanctae Annae, quod in urbe « Rengo » intra fines "
      + "Rancaguensis dioecesis exstat, ad Basilicae Minoris gradum dignitatemque evehitur. / IOANNES PAULUS PP. II / Ad perpetuam "
      + "rei memoriam. — Inter sacras aedes Rancaguensis dioecesis in Chilia merito celebratur templum paroeciale…'. The index cites "
      + "both at 607; both are on the apost_letters shelf.",
  },
  'AAS:90:385': {
    documentIds: ['mag:john-paul-ii/praeclarum-confert-1998', 'mag:john-paul-ii/universos-cohortamur-1998'],
    evidence: "AAS 90 (1998) p. 385 (PDF page 385 of AAS-90-1998-ocr.pdf, read 2026-09-13) prints 'III / Imago Beatae Mariae Virginis sub "
      + "titulo « Nuestra Señora del Remedio », quae in Lucentina ecclesia concathedrali pie colitur, pretioso diademate redimitur. / "
      + "IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — Praeclarum confert donum christifidelibus diligens Deiparae cultus. "
      + "Merito ideo multis i…' (dated 'Datum Romae, apud Sanctum Petrum, sub anulo Piscatoris, die iv mensis Aprilis, anno "
      + "MCMXCVIII, Pontificatus Nostri vicesimo.') and, lower on the same page, 'IV / Ecclesiae paroeciali Assumptionis Beatae "
      + "Virginis Mariae dicatae in loco v.d. « Krzeszów », in dioecesi Legnicensi, Basilicae minoris dignitas tribuitur. / IOANNES "
      + "PAULUS PP. II / Ad perpetuam rei memoriam. — Universos cohortamur homines ut, secundum proprias traditas consuetudines, "
      + "cotidie cum V…'. The index cites both at 385; both are on the apost_letters shelf.",
  },
  // Phase 2b-iii-a (AAS 18-22): the volumes of the late 1920s set two short letters on one
  // page as the 1930s do. Of the four pages the era's index gives two acts each, one was
  // read in the volume PDF on 2026-09-18 and prints two; the other three print one act
  // opening and the other act's *end* -- AAS 19 (1927) 205 (*Pro Apostolico* opens at 265;
  // the index's `205` is the OCR's), 268 (*Quae ad rei* opens at 267 and ends here) and
  // AAS 22 (1930) 323 (*Ordinis Capuccinarum* opens at 320 and ends here) -- and are held
  // by the creator (`page-shared`) with both acts, listed in the report with the true pages.
  'AAS:19:130': {
    documentIds: ['mag:pius-xi/cum-ex-apostolico-munere-1926', 'mag:pius-xi/non-sine-1927'],
    evidence: "AAS 19 (1927) p. 130 (PDF page 130 of AAS-19-1927-ocr.pdf) prints 'III / IMMUTATUR NOMEN VICARIATUS APOSTOLICI DE UELLÉ "
      + "ORIENTALI / PIUS PP. XI / Ad futuram rei memoriam. — Cum ex Apostolico munere, quo fungimur …', dated 'die xiv mensis Decembris, "
      + "anno MDCCCCXXVI Pontificatus Nostri quinto. P. CARD. GASPARRI, a Secretis Status', and, lower on the same page, 'IV / PRAEFECTURA "
      + "APOSTOLICA DE KONG-MOON IN SINIS AD VICARIATUM APOSTOLICUM EVEHITUR. / PIUS PP. XI / Ad futuram rei memoriam. — Non sine magna "
      + "animi Nostri laetitia comperimus …' (3 February 1927). The index cites both at 130 (`» Dec. 14 Cum ex apostólico munere. - "
      + "Immutatur nomen vicariatus / apostolici de Uellé Orientali 130`, `» » » Non sine. - Praefectura apostolica de Kong-moon in Sinis / "
      + "ad vicariatum apostolicum evehitur 130`).",
  },
};

export interface Reprint {
  /** Whether the later printing is a plain re-issue of the act, or a correction the volume marks as such. */
  kind: 'reissue' | 'corrigendum';
  /** The reference of the citation of record (`AAS:104:482`): the first printing for a re-issue, the later one for a corrigendum. */
  citationOf: string;
  /** Both index lines, quoted as extracted: the first printing's and the later one's. */
  indexLines: readonly [string, string];
  /** What the later printing prints, read in the fascicle or volume, and the differences found. */
  evidence: string;
}

/**
 * Acts the *Acta* print twice (acta volumes spec §9, decided in phase 2b-ii-c). One act has
 * one citation of record, and the *Acta* are the promulgating instrument (CIC can. 8 §1):
 * the **first printing** is the citation, since it is the one that promulgated the act and
 * the one every apparatus cites, **unless the volume marks the later printing as a
 * correction** -- a *corrigendum* heading, a note that the earlier text was faulty -- in
 * which case the corrected text is the act as the Holy See wants it read and the later
 * printing is the citation (`kind: 'corrigendum'`). A later printing that re-sets the text
 * without saying why, even with emended readings, is a re-issue (`kind: 'reissue'`): the
 * reader who follows the first citation finds the act, and the emendations are recorded
 * here, not adjudicated. Keyed by the reference of the printing that is *not* the
 * citation; the matcher and the creator read the table (match.ts, create.ts): the entry so
 * keyed is neither a claim on a shelf record nor a record of its own, it is listed as a
 * reprint, and the index's other entry for the act carries the one reference. An entry
 * the index itself cites at two pages (`… 138, 261`, the 2014 index) is created only when
 * the further page is keyed here; otherwise it is held. Every row was read in the
 * fascicles or volumes on 2026-09-13.
 */
export const ACTA_REPRINTS: Readonly<Record<string, Reprint>> = {
  // Benedict XVI's *Ibi vacabimus* (3 July 2011, the beatification of János Scheffler),
  // printed in AAS 104 (2012) 482-485 and again in AAS 112 (2020) 479-482. Both entries
  // were held by the id-collision rule from phase 2b-i to 2b-ii-b.
  'AAS:112:479': {
    kind: 'reissue',
    citationOf: 'AAS:104:482',
    indexLines: [
      '2011 Iul. 3 « Ibi vacabimus». – Venerabili Dei Servo Ioanni Scheffler, Bea- / torum honores decernuntur .  .  .  .  .  .  .  .  .  .  .  . 482',
      '  3 Iul. 2011 « Ibi vacabimus ». Venerabili Servo Dei Ioanni Scheffler Bea - / torum honores decernuntur .  .  .  .  .  .  .  .  .  .  .  . 479',
    ],
    evidence: "AAS 104 (2012) p. 482 (the June 2012 fascicle, giugno2012.pdf, read 2026-09-13) prints 'III / Venerabili Dei Servo Ioanni "
      + "Scheffler, Beatorum honores decernuntur. / BENEDICTUS PP. XVI / Ad perpetuam rei memoriam. — « Ibi vacabimus et videbimus …', "
      + "dated 'die III mensis Iulii, anno MMXI, Pontificatus Nostri septimo', 'In Secret. Status tab., n. 168.425' (p. 485). AAS 112 "
      + "(2020) p. 479 (the May 2020 fascicle, acta-maggio2020.pdf) prints the same letter under a part of its own after the Congregations, "
      + "'ACTA BENEDICTI XVI PP. / LITTERAE APOSTOLICAE / II / Venerabili Servo Dei Ioanni Scheffler Beatorum honores decernuntur', the "
      + 'same text word for word, the same dating formula and the same protocol number (p. 482), with no note of why it is printed again '
      + "and no heading of corrigenda: a re-issue (the 2020 fascicle re-prints two beatification letters of 2010-2011, *Ego autem* at p. 476 "
      + 'with it, which no earlier index lists). The citation of record is the first printing, AAS 104 (2012) 482.',
  },
  // Benedict XVI's *Deus caritas* (8 October 2011, the beatification of Anna Maria Janer
  // Anglarill), printed in AAS 106 (2014) 138-140 (the February fascicle) and again at
  // 261-263 (the March fascicle); the 2014 index cites both pages on one line.
  'AAS:106:261': {
    kind: 'reissue',
    citationOf: 'AAS:106:138',
    indexLines: [
      ' »  Oct. 8 « Deus caritas ». – Venerabili Servae Dei Mariae Janer Angla- / rill Beatorum honores decernuntur 138, 261',
      ' »  Oct. 8 « Deus caritas ». – Venerabili Servae Dei Mariae Janer Angla- / rill Beatorum honores decernuntur 138, 261',
    ],
    evidence: "AAS 106 (2014) p. 138 (acta-febbraio2014.pdf, read 2026-09-13) prints 'ACTA BENEDICTI XVI PP. / LITTERAE APOSTOLICAE / I / "
      + "Venerabili Dei Servae Annae Mariae Janer Anglarill Beatorum honores decernuntur. / BENEDICTUS PP. XVI / Ad perpetuam rei memoriam. — "
      + "« Deus caritas est, et, qui manet in caritate, in Deo manet, et Deus in eo manet » (1 Io 4, 16)'; p. 261 (acta-marzo2014.pdf) prints "
      + "'Acta Benedicti Pp. XVI / II / Venerabili Dei Servae Annae Mariae Janer Anglarill Beatorum honores decernuntur' and the same letter "
      + 'again, re-set in the fascicle\'s small capitals, with two emended readings ("Ipsa est nata familiae prorsus christianae" at p. 138 '
      + 'reads "ipsa est nata ex familia prorsus christiana" at p. 261; "plurimas publicarum eversiones" reads "plurimas publicarum rerum '
      + 'eversiones") and no note of correction and no corrigenda heading. The index enters the act once and cites both pages '
      + '(`138, 261`). A re-issue by this table\'s rule: the citation of record is the first printing, AAS 106 (2014) 138; the emendations '
      + 'are recorded here for the owner, who may re-key the row as a corrigendum.',
  },
  // Phase 2b-iii-a: Pius XI's *Quo maiori rerum* (30 March 1930, the prefecture apostolic
  // of Umtata separated from the vicariate of Mariannhill), printed in AAS 22 (1930)
  // 483-484 and again at the head of AAS 23 (1931) 41-42, whose chronological index
  // enters it a second time. Both entries were held by the id-collision rule before this row.
  'AAS:23:41': {
    kind: 'reissue',
    citationOf: 'AAS:22:483',
    indexLines: [
      '  » » » Quo maiori rerum. - Dis tracto territorio e vicariatu apo­ / stolico de Mariannhill erigitur praefectura apostolica / de umtata 483',
      '1930 Martii 30 Quo maiori rerum. - Distracto territorio e vicariatu apo­ / stolico de Mariannhill erigitur praefectura apostolica / de TTmtata 41',
    ],
    evidence: "AAS 22 (1930) p. 483 (PDF page 483 of AAS-22-1930-ocr.pdf, read 2026-09-18) prints 'VII / DISTRACTO TERRITORIO A VICARIATU "
      + "APOSTOLICO DE MARIANNHILL ERIGITUR PRAEFECTURA APOSTOLICA DE UMTATA. / PIUS PP. XI / Ad perpetuam rei memoriam. — Quo maiori "
      + "rerum fidei incremento consideret, Delegatus Apostolicus Africae Meridionalis …', dated 'die xxx mensis Martii anno MDCCCCXXX, "
      + "Pontificatus Nostri nono. E. CARD. PACELLI, a Secretis Status' (p. 484). AAS 23 (1931) p. 41 (PDF page 41 of AAS-23-1931-ocr.pdf) "
      + "prints, after the constitution that ends the page's top half, 'LITTERAE APOSTOLICAE / I / DISTRACTO TERRITORIO A VICARIATU "
      + "APOSTOLICO DE MARIANNHILL ERIGITUR PRAEFECTURA APOSTOLICA DE UMTATA. / PIUS PP. XI / Ad perpetuam rei memoriam. — Quo maiori rerum "
      + "fidei incremento consuleret, Delegatus Apostolicus Africae Meridionalis …' and the same letter again, the same dating formula and "
      + "signature (p. 42), with no note of why it is printed again and no heading of corrigenda (the one difference the OCR shows, "
      + "'consideret' against 'consuleret', is the OCR's). A re-issue by this table's rule: the citation of record is the first "
      + 'printing, AAS 22 (1930) 483.',
  },
};
