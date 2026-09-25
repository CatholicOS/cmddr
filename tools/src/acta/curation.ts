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
  // *Casti connubii*'s page is the OCR's `530` corrected to 539 (ACTA_PAGE_CORRECTIONS), so
  // its year row is keyed on the act's page; the year is a ditto under the same `1J30`.
  '1930:539': {
    printed: '????-12-31',
    date: '1930-12-31',
    indexLine: '  » Dec. 31 Casti connubii. - Ad venerabiles fratres Patriarchas, Pri­ / mates, Archiepiscopos, Episcopos, aliosque locorum / Ordinarios, pacem et communionem cum Apostolica / Sede habentes: de Matrimonio christiano spectatis / praesentibus familiae et societatis conditionibus, ne­ / cessitatibus, erroribus, vitiis . 530',
    evidence: "The act's own dating formula reads 'Datum Romae apud Sanctum Petrum, die xxxi mensis Decembris anno MDCCCCXXX, Pontificatus Nostri nono. PIUS PP. XI' (the OCR's `xxxr`; AAS 22 (1930) 592, PDF page 592 of AAS-22-1930-ocr.pdf, read 2026-09-21) -- 1930-12-31; the volume opens it at p. 539 under 'LITTERAE ENCYCLICAE / AD VENERABILES FRATRES … DE MATRIMONIO CHRISTIANO … / Casti connubii quanta sit dignitas' (the page correction above). A ditto under the `1J30` of p. 201. The shelf record is `mag:pius-xi/casti-connubii-1930`, dated 1930-12-31.",
  },
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
  // Phase 2b-iii-b: AAS 9-I (1917), whose OCR reads the printed `1916` at the head of a run
  // of nine apostolic letters as `1910` (the sample report §1: nine letters of Benedict XV
  // dated before his election); the eight below the first inherit the year by ditto, so
  // each needs its own row. Every act was read in the store text on 2026-09-21 and its own
  // dating formula quoted (the pages are the index's, kept by the OCR on these lines); the
  // ninth, *Basilica B. M. V.*, is dated 20 May where the index dittoes 13 May.
  '1917:57': {
    printed: '1910-01-13',
    date: '1916-01-13',
    indexLine: '1910 Ian. 13 Eximia fidelium. - Templum B. M. V. vulgo « del Pino » / in Urbe « Las Palmas », Canariensis dioeceseos, ad / Basilicae minoris dignitatem in perpetuum evehitur 57',
    evidence: "The act's own dating formula reads 'Datum Romae apud S. Petrum, sub annulo Piscatoris, die xiii ianuarii MCMXVI, Pontificatus Nostri anno secundo. P. CARD. GASPARRI, a Secretis Status.' (AAS 9-I (1917) 58, PDF page 58 of AAS-09-I-1917-ocr.pdf, read 2026-09-21) -- 1916-01-13, the second year of a pontificate begun 3 September 1914; the volume opens it at p. 57 under 'VII / TEMPLUM B. M. V. VULGO « DEL PINO » IN URBE « LAS PALMAS », CANARIENSIS DIOECESEOS, AD BASILICAE MINORIS DIGNITATEM IN PERPETUUM EVEHITUR. / BENEDICTUS PP. XV / Ad perpetuam rei memoriam. — Eximia fidelium erga Deiparam'. The first entry of the run, whose year the OCR reads `1910`. No shelf record carries the act.",
  },
  '1917:58': {
    printed: '1910-01-18',
    date: '1916-01-18',
    indexLine: '18 Romani Pontifices. - «Parvum sanctuarium Mariae Virginis / perdolentis vulgo " Al Fiumícello „ », quod Neapoli / exstat, pontificio cognomine perpetuo de­ / coratur 58',
    evidence: "The act's own dating formula reads 'Datum Romae apud S. Petrum, sub annulo Piscatoris, die xviii ianuarii MCMXVI, Pontificatus Nostri anno secundo. P. CARD. GASPARRI, a Secretis Status.' (AAS 9-I (1917) 59, PDF page 59 of AAS-09-I-1917-ocr.pdf, read 2026-09-21) -- 1916-01-18; the volume opens it at p. 58 under 'VIII / « PARVUM SANCTUARIUM MARIAE VIRGINIS PERDOLENTIS VULGO \" AL FIUMICELLO „ », QUOD NEAPOLI EXSTAT, PONTIFICIO COGNOMINE PERPETUO DECORATUR. / BENEDICTUS PP. XV / Ad perpetuam rei memoriam. — Romani Pontifices Decessores'. A ditto under the `1910` of p. 57. No shelf record carries the act.",
  },
  '1917:59': {
    printed: '1910-02-16',
    date: '1916-02-16',
    indexLine: "Febr. 16 Nihil est profecto. - Confraternitas sub titulo « Ligue / de l'Evangile », in oppido « Montmagny », dioece­ / seos Versaliensis constituta, in archisodalitatem / perpetuo erigitur, cum facultate aggregandi ubique / terrarum. 59",
    evidence: "The act's own dating formula reads 'Datum Romae apud S. Petrum, sub annulo Piscatoris, die xvi februarii MCMXVI, Pontificatus Nostri anno secundo. P. CARD. GASPARRI, a Secretis Status.' (AAS 9-I (1917) 61, PDF page 61 of AAS-09-I-1917-ocr.pdf, read 2026-09-21) -- 1916-02-16; the volume opens it at p. 59 under 'IX / CONFRATERNITAS SUB TITULO « LIGUE DE L'EVANGILE », IN OPPIDO « MONTMAGNY » DIOECESEOS VERSALIENSIS CONSTITUTA, IN ARCHISODALITATEM PERPETUO ERIGITUR, CUM FACULTATE AGGREGANDI UBIQUE TERRARUM. / BENEDICTUS PP. XV / Ad perpetuam rei memoriam. — Nihil est profecto magis idoneum'. A ditto under the `1910` of p. 57. No shelf record carries the act.",
  },
  '1917:61': {
    printed: '1910-02-25',
    date: '1916-02-25',
    indexLine: "25 Romanorum Pontificum. - Preces quaedam ad Eccle­ / siae unitatem a Domino impetrandam indulgentiis / ditantur.... . . . . . . . . . . '. . 61",
    evidence: "The act's own dating formula reads 'Datum Romae apud S. Petrum, sub annulo Piscatoris, die xxv februarii MCMXVI, Pontificatus Nostri anno secundo.' (AAS 9-I (1917) 62, PDF page 62 of AAS-09-I-1917-ocr.pdf, read 2026-09-21; the OCR's `MGMxvr`) -- 1916-02-25; the volume opens it at p. 61 under 'X / PRECES QUAEDAM AD ECCLESIAE UNITATEM A DOMINO IMPETRANDAM INDULGENTIIS DITANTUR. / BENEDICTUS PP. XV / Ad perpetuam rei memoriam. — Romanorum Pontificum Decessorum'. A ditto under the `1910` of p. 57. No shelf record carries the act.",
  },
  '1917:63': {
    printed: '1910-04-27',
    date: '1916-04-27',
    indexLine: 'Apr. 27 Rhedonensi in Urbe. - Curiale templum Rhedonense, / sub titulo SSmi Salvatoris et B. M. V. de miraculis / et virtutibus, Basilicae minoris dignitate in perpe­ / tuum cohonestatur. . . . . . . . . ... 63',
    evidence: "The act's own dating formula reads 'Datum Romae apud S. Petrum, sub annulo Piscatoris, die xxvii aprilis MCMXVI, Pontificatus Nostri anno secundo. P. CARD. GASPARRI, a Secretis Status.' (AAS 9-I (1917) 64, PDF page 64 of AAS-09-I-1917-ocr.pdf, read 2026-09-21) -- 1916-04-27; the volume opens it at p. 63 under 'XI / CURIALE TEMPLUM RHEDONENSE, SUB TITULO SS.MI SALVATORIS ET B. M. V. DE MIRACULIS ET VIRTUTIBUS, BASILICAE MINORIS DIGNITATE IN PERPETUUM COHONESTATUR. / BENEDICTUS PP. XV / Ad perpetuam rei memoriam. — Rhedonensi in Urbe Curialis Ecclesia' (the OCR's `Rliedonensi`). A ditto under the `1910` of p. 57. No shelf record carries the act.",
  },
  '1917:64': {
    printed: '1910-04-27',
    date: '1916-04-27',
    indexLine: 'Conspicua Dei templa. - Titulus Basilicae minoris pro / parochiali ecclesia Rhedonensi S. Albino Ep. et 64',
    evidence: "The act's own dating formula reads 'Datum Romae apud S. Petrum, sub annulo Piscatoris, die xxvii aprilis MCMXVI, Pontificatus Nostri anno secundo. P. CARD. GASPARRI, a Secretis Status.' (AAS 9-I (1917) 65, PDF page 65 of AAS-09-I-1917-ocr.pdf, read 2026-09-21) -- 1916-04-27; the volume opens it at p. 64, below the end of *Rhedonensi in Urbe*, under 'XII / TITULUS BASILICAE MINORIS PRO PAROCHIALI ECCLESIA RHEDONENSI S. ALBINO EP. ET CONF. AC B. M. V. DE BONIS NUNTIIS DICATA. / BENEDICTUS PP. XV / Ad perpetuam rei memoriam. — Conspicua Dei templa, quae non'. A ditto under the `1910` of p. 57. No shelf record carries the act.",
  },
  '1917:66': {
    printed: '1910-05',
    date: '1916-05-02',
    indexLine: "Maii Dilectus filius Noster. - Sodalitio a catholica veritate, / vulgo « Catholic truth society »,'in Anglia instituto, / partiales ac plenariae indulgentiae conceduntur, / additis peculiaribus privilegiis pro sociis sacerdo­ / tibus 66",
    evidence: "The act's own dating formula reads 'Datum Romae apud sanctum Petrum, sub annulo Piscatoris, die ii maii MCMXVI, Pontificatus Nostri anno secundo. P. CARD. GASPARRI, a Secretis Status.' (AAS 9-I (1917) 68, PDF page 68 of AAS-09-I-1917-ocr.pdf, read 2026-09-21) -- 1916-05-02; the volume opens it at p. 66 under 'XIII / SODALITIO A CATHOLICA VERITATE, VULGO « CATHOLIC TRUTH SOCIETY », IN ANGLIA INSTITUTO, PARTIALES AC PLENARIAE INDULGENTIAE CONCEDUNTUR, ADDITIS PECULIARIBUS PRIVILEGIIS PRO SOCIIS SACERDOTIBUS. / BENEDICTUS PP. XV / Ad perpetuam rei memoriam. — Dilectus Filius Noster Franciscus'. A ditto under the `1910` of p. 57, and the index prints the month with no day (a month-only entry, the sample report §1.3): the formula supplies the day. No shelf record carries the act.",
  },
  '1917:68': {
    printed: '1910-05-13',
    date: '1916-05-13',
    indexLine: '13 Rector Ecclesiae B. M. V. - Christifidelibus loci « Perth », / dioecesis Dunkeldensis, ter salutationem angelicam / pro Scotiae conversione recitantibus, nonnullae / indulgentiae conceduntur . . . . . . . . . 68',
    evidence: "The act's own dating formula reads 'Datum Romae apud S. Petrum, sub annulo Piscatoris, die xiii maii anni MCMXVI, Pontificatus Nostri anno secundo. P. CARD. GASPARRI, a Secretis Status.' (AAS 9-I (1917) 69, PDF page 69 of AAS-09-I-1917-ocr.pdf, read 2026-09-21) -- 1916-05-13; the volume opens it at p. 68 under 'XIV / CHRISTIFIDELIBUS LOCI « PERTH », DIOECESIS DUNKELDENSIS, TER SALUTATIONEM ANGELICAM PRO SCOTIAE CONVERSIONE RECITANTIBUS, NONNULLAE INDULGENTIAE CONCEDUNTUR. / BENEDICTUS PP. XV / Ad perpetuam rei memoriam. — Rector Ecclesiae B. Mariae Virginis'. A ditto under the `1910` of p. 57. No shelf record carries the act.",
  },
  '1917:69': {
    printed: '1910-05-13',
    date: '1916-05-20',
    indexLine: 'Basilica B. M. V. - Sanctuarium B. M. V. Montis Be- / rici indulgentiis ac privilegiis ditatur 69',
    evidence: "The act's own dating formula reads 'Datum Romae apud sanctum Petrum, sub annulo Piscatoris, die xx maii MCMXVI, Pontificatus Nostri anno secundo.' (AAS 9-I (1917) 70, PDF page 70 of AAS-09-I-1917-ocr.pdf, read 2026-09-21) -- 1916-05-20; the volume opens it at p. 69, below the formula of *Rector Ecclesiae B. M. V.*, under 'XV / SANCTUARIUM B. M. VIRGINIS MONTIS BERICI INDULGENTIIS AC PRIVILEGIIS DITATUR. / BENEDICTUS PP. XV / Ad perpetuam rei memoriam. — Basilica B. Mariae Virginis Montis'. A ditto under the `1910` of p. 57 whose day column is blank too, so the parser reads the 13 May of the line above; the act is dated 20 May. No shelf record carries the act.",
  },
  // Phase 2b-iii-b: AAS 3 (1911), whose OCR reads the printed `1911` at the head of the
  // index page that opens the July letters as `191Í` (PDF page 682: `191Í Iulii 10 Nobis
  // quidem`), so that entry and the nine dittos below it, to November, print no readable
  // year. Every act was read in the store text on 2026-09-21 and its own dating formula
  // quoted; the pages are the recovery's (`aas-03-1911.pages.json`, rule `unique`), the
  // index printing none of them. Three dittos and the month-only entries take their day
  // or their date from the formula: *Laetamur utrumque* (12 July under a ditto of 10),
  // *Vobis plane* (`30` under July; dated `xxx Sextilis`, 30 August), *Societatem
  // Goerresianam* (22 July under a ditto of 10). *Ubi accepimus* (September, no day;
  // p. 565, the page *Societatem Goerresianam* opens) has no row: the table is keyed by
  // the page, and one page holds one row -- the era report names it.
  '1911:365': {
    printed: '????-07-10',
    date: '1911-07-10',
    indexLine: '191Í Iulii 10 Nobis quidem. - Ad V. E. Gregorium Mariam S. R. E. / Presb. Card. Aguirre, Archiepiscopum Toletanum.',
    evidence: "The act's own dating formula reads 'Datum Romae apud S. Petrum, die x mensis Iulii MCMXI, Pontificatus Nostri anno octavo. PIUS PP. X.' (AAS 3 (1911) 365, PDF page 365 of AAS-03-1911-ocr.pdf, read 2026-09-21) -- 1911-07-10, the eighth year of a pontificate begun 4 August 1903; the volume opens it at p. 365, below the end of the apostolic letter before it, under 'AD V. E. GREGORIUM MARIAM S. R. E. PRESB. CARD. AGUIRRE ARCHIEPISCOPUM TOLETANUM. / Dilecte fili Noster, salutem et apostolicam benedictionem. — Nobis quidem'. The first entry of the page, whose year the OCR reads `191Í`. No shelf record carries the act.",
  },
  '1911:521': {
    printed: '????-07-10',
    date: '1911-07-12',
    indexLine: 'Laetamur utrumque. - Ad Adamum Iosephum Schmitt, / praesidem coetus virorum Moguntino catholicorum / conventui apparando',
    evidence: "The act's own dating formula reads 'Datum Romae apud S. Petrum, die xii Iulii MCMXI, Pontificatus Nostri anno octavo. PIUS PP. X.' (AAS 3 (1911) 522, PDF page 522 of AAS-03-1911-ocr.pdf, read 2026-09-21; the OCR's `die-xn`) -- 1911-07-12; the volume opens it at p. 521, the first page of the fascicle of 15 October 1911, under 'ACTA PII PP. X / EPISTOLAE / I. / AD ADAMUM IOSEPHUM SCHMITT, PRAESIDEM COETUS VIRORUM CATHOLICORUM MOGUNTINO CONVENTUI APPARANDO. / Dilecte Fili, salutem et apostolicam benedictionem. — Laetamur utrumque'. A ditto under the `191Í` of p. 365, which the parser reads as 10 July; the act is dated 12 July. No shelf record carries the act.",
  },
  '1911:522': {
    printed: '????-07-30',
    date: '1911-08-30',
    indexLine: '30 Vobis plane. - Ad R. P. D. Patriarcham atque Archie­ / piscopos et Episcopos catholicos nationis Armenae / de nationali Synodo Romae celebranda ....',
    evidence: "The act's own dating formula reads 'Datum Romae apud S. Petrum, die xxx Sextilis MCMXI, Pontificatus Nostri anno nono.' (AAS 3 (1911) 523, PDF page 523 of AAS-03-1911-ocr.pdf, read 2026-09-21) -- 30 August 1911 (*Sextilis*, the old name of August; the ninth year of the pontificate began on 4 August 1911, which agrees), 1911-08-30; the volume opens it at p. 522 under 'II. / AD R. P. D. PATRIARCHAM ATQUE ARCHIEPISCOPOS ET EPISCOPOS CATHOLICOS NATIONIS ARMENAE, DE NATIONALI SYNODO ROMAE CELEBRANDA. / Venerabiles fratres, salutem et apostolicam benedictionem. — Vobis plane compertum est'. The index prints `30` under the July run headed `191Í`, so the parser reads 30 July with no year. No shelf record carries the act.",
  },
  '1911:562': {
    printed: '????-07-10',
    date: '1911-07-10',
    indexLine: 'Missam a vobis. - Ad RR. PP. DD. Archiepiscopos et / Episcopos Canadenses, post peractum feliciter Con­ / cilium Plenarium',
    evidence: "The act's own dating formula reads 'Datum Romae apud S. Petrum, die x mensis Iulii anno MCMXI, Pontificatus Nostri anno octavo.' (AAS 3 (1911) 564, PDF page 564 of AAS-03-1911-ocr.pdf, read 2026-09-21; the OCR's `MCMXT`) -- 1911-07-10; the volume opens it at p. 562 under 'EPISTOLAE / I. / AD RR. PP. DD. ARCHIEPISCOPOS ET EPISCOPOS CANADENSES, POST PERACTUM FELICITER CONCILIUM PLENARIUM. / Venerabiles Fratres, salutem et apostolicam benedictionem. — Missam a vobis'. A ditto under the `191Í` of p. 365. No shelf record carries the act.",
  },
  '1911:564': {
    printed: '????-07-10',
    date: '1911-07-10',
    indexLine: 'Quum quingentésimo. - Ad claros viros Balfour of / Burleigh, Rosebery, Iacobum Donaldson, modera­ / tores Universitatis Studiorum Sancti Andreae in / Scotia, de sollemnibus ob annum quingentesimum / ab instituta Universitate.',
    evidence: "The act's own dating formula reads 'Datum Romae apud S. Petrum, die x mensis Iulii MCMXI, Pontificatus Nostri anno octavo.' (AAS 3 (1911) 564, PDF page 564 of AAS-03-1911-ocr.pdf, read 2026-09-21) -- 1911-07-10; the volume opens it at p. 564, below the end of *Missam a vobis*, under 'II. / AD CLAROS VIROS BALFOUR OF BURLEIGH, ROSEBERY, IACOBUM DONALDSON, MODERATORES UNIVERSITATIS STUDIORUM SANCTI ANDREAE IN SCOTIA, DE SOLLEMNIBUS OB ANNUM D AB INSTITUTA UNIVERSITATE. / Clari viri, salutem. — Quum quingentesimo natali istius Academiae'. A ditto under the `191Í` of p. 365. No shelf record carries the act.",
  },
  '1911:565': {
    printed: '????-07-10',
    date: '1911-07-22',
    indexLine: 'Societatem Goerresianam. - Ad R. P. D. Stephanum / Elises, Protonotarium Apostolicum, accepto quinto / volumine operis a Societate Goerresiana instituti / Concilio Tridentino illustrando',
    evidence: "The act's own dating formula reads 'Datum Romae, apud S. Petrum, die xxii mensis Iulii MCMXI, Pontificatus Nostri anno octavo. PIUS PP. X.' (AAS 3 (1911) 565, PDF page 565 of AAS-03-1911-ocr.pdf, read 2026-09-21; the OCR's `xxn`) -- 1911-07-22; the volume opens it at p. 565 under 'III. / AD R. P. D. STEPHANUM EHSES, PROTONOTARIUM APOSTOLICUM, ACCEPTO QUINTO VOLUMINE OPERIS A SOCIETATE GOERRESIANA INSTITUTI CONCILIO TRIDENTINO ILLUSTRANDO. / Dilecte Fili, salutem et apostolicam benedictionem. — Societatem Goerresianam promovendis inter catholicos Germaniae'. A ditto under the `191Í` of p. 365, which the parser reads as 10 July; the act is dated 22 July. The page also opens *Ubi accepimus* (`Sept. Ubi accepimus. - Ad R. P. D. Eduardum Likowski …`, dated 'die xxvi mensis Septembris MCMXI' at p. 566, 1911-09-26), whose row this table cannot hold: the key is the page, and the page is this act's. No shelf record carries the act.",
  },
  '1911:566': {
    printed: '????-10',
    date: '1911-10-05',
    indexLine: 'Oct. Quoniam satis. - Ad R. D. Aloysium Talamoni, in Se­ / minario Modoetiensi professorem, ob exemplar vo- / ummis « Sunto di Storia Politica, terza edizione » / Beatissimo Patri reverenter exhibitum',
    evidence: "The act's own dating formula reads 'Datum Romae, apud Sanctum Petrum, die v Octobris MCMXI, Pontificatus Nostri anno nono.' (AAS 3 (1911) 566, PDF page 566 of AAS-03-1911-ocr.pdf, read 2026-09-21) -- 1911-10-05; the volume opens it at p. 566, below the formula of *Ubi accepimus*, under 'V. / AD R. D. ALOYSIUM TALAMONI, IN SEMINARIO MODOETIENSI PROFESSOREM, OB EXEMPLAR VOLUMINIS \" SUNTO DI STORIA POLITICA, TERZA EDIZIONE \" BEATISSIMO PATRI REVERENTER EXHIBITUM. / Dilecte Fili, salutem et apostolicam benedictionem. — Quoniam satis comperuimus'. The index prints the month with no day under the `191Í` of p. 365: the formula supplies the day. No shelf record carries the act.",
  },
  '1911:567': {
    printed: '????-10-10',
    date: '1911-10-10',
    indexLine: '10 Gratias vobis. - Ad RR. PP. DD. Episcopos Helve­ / tiorum de rebus communiter significatis gratulando / rescribit',
    evidence: "The act's own dating formula reads 'Datum Romae, apud S. Petrum, die x mensis Octobris MCMXI, Pontificatus Nostri anno nono.' (AAS 3 (1911) 567, PDF page 567 of AAS-03-1911-ocr.pdf, read 2026-09-21) -- 1911-10-10; the volume opens it at p. 567 under 'AD RR. PP. DD. EPISCOPOS HELVETIORUM DE REBUS COMMUNITER SIGNIFICATIS GRATULANDO RESCRIBIT. / Venerabiles Fratres, salutem et apostolicam benedictionem. — Gratias vobis'. A ditto under the `191Í` of p. 365. No shelf record carries the act.",
  },
  '1911:654': {
    printed: '????-11',
    date: '1911-11-04',
    indexLine: 'Nov. Expleverunt desiderii. - Ad V. E. Marianum Card. Ram­ / polla, patronum piae societatis a S. Caecilia post / annum primum ex quo schola superior musicae / sacrae, ob eiusdem societatis sollertiam, Romae con­ / dita est',
    evidence: "The act's own dating formula reads 'Datum Romae apud S. Petrum, die iv Novembris MCMXI, Pontificatus Nostri anno nono.' (AAS 3 (1911) 655, PDF page 655 of AAS-03-1911-ocr.pdf, read 2026-09-21) -- 1911-11-04; the volume opens it at p. 654, below the end of the apostolic letter before it, under 'EPISTOLA / AD V. E. MARIANUM CARD. RAMPOLLA, PATRONUM PIAE SOCIETATIS A S. CAECILIA, POST ANNUM PRIMUM EX QUO SCHOLA SUPERIOR MUSICAE SACRAE OB EIUSDEM SOCIETATIS SOLLERTIAM ROMAE CONDITA EST. / Dilecte Fili Noster, salutem et apostolicam benedictionem — Expleverunt desiderii Nostri expectationem'. The index prints the month with no day under the `191Í` of p. 365: the formula supplies the day. No shelf record carries the act.",
  },
  // Phase 2b-iii-b, Task 9: the dates of the acts ACTA_PAGE_READINGS gives a page -- keyed
  // by that page -- where the index prints the month alone, the wrong month, or a ditto of
  // the wrong year, each against the act's own dating formula read in the store text on
  // 2026-09-21 (the reading's evidence quotes the page it opens on).
  '1909:7': {
    printed: '1908-01-29',
    date: '1908-06-29',
    indexLine: '1908 Ian. 29 Constitutio « Sapienti Consilio » / DE ROMANA CURIA.',
    evidence: "The constitution's own dating formula reads 'Datum Romae apud Sanctum Petrum, anno Incarnationis Dominicae millesimo "
      + "nongentesimo octavo, die festo Sanctorum Apostolorum Petri et Pauli, III Kalendas Iulias, Pontificatus Nostri anno quinto' "
      + "(AAS 1 (1909) 19, PDF page 19 of AAS-01-1909-ocr.pdf, read 2026-09-21) -- 29 June 1908, the fifth year of a pontificate begun "
      + "4 August 1903. The index prints `Ian. 29`, its `Iun.` set apart four lines below the entry's sub-items (fixture line 55); the "
      + 'shelf record is `mag:pius-x/sapienti-consilio-1908`, dated 1908-06-29.',
  },
  '1914:565': {
    printed: '1914-11',
    date: '1914-11-01',
    indexLine: '1914 Nov. Ad beatissimi Apostolorum Principis. - Ad venera­ / biles Fratres Patriarchas, Primates, Archiepiscopos, / '
      + 'Episcopos, aliosque locorum Ordinarios pacem et / communionem cum Apostolica Sede habentes . .',
    evidence: "The encyclical's own dating formula reads 'Datum Romae apud S. Petrum die festo Sanctorum omnium, i Novembris mcmxiv, "
      + "Pontificatus Nostri anno primo' (AAS 6 (1914) 581, PDF page 581 of AAS-06-1914-ocr.pdf, read 2026-09-21) -- 1 November 1914. "
      + 'The index prints the month with no day; the shelf record is `mag:benedict-xv/ad-beatissimi-apostolorum-1914`, dated 1914-11-01.',
  },
  '1918:305': {
    printed: '1918-07',
    date: '1918-07-01',
    indexLine: 'Iul. Tribus abhinc annis. - Sodalium Ssmi Crucifixi ad / S. Marcelli novas constitutiones ratas habet. . .',
    evidence: "The motu proprio's own dating formula reads 'Datum Romae apud S. Petrum die i mensis iulii, in festo Pretiosissimi "
      + "Sanguinis D, N. I. C. MDCCCCXVIII, Pontificatus Nostri anno quarto' (AAS 10 (1918) 306, PDF page 306 of AAS-10-1918-ocr.pdf, "
      + 'read 2026-09-21) -- 1 July 1918. The index prints the month with no day. No shelf record carries the act.',
  },
  '1918:473': {
    printed: '1918-12',
    date: '1918-12-01',
    indexLine: '1918 Dec. Per quas publicae indicuntur preces pro conventu / de pace componenda .',
    evidence: "The encyclical's own dating formula reads 'Datum Romae apud S. Petrum die i mensis decembris MDCCCCXVIII, Pontificatus "
      + "Nostri anno quinto' (AAS 10 (1918) 474, PDF page 474 of AAS-10-1918-ocr.pdf, read 2026-09-21) -- 1 December 1918; its incipit, "
      + "which the index does not print, is *Quod iam diu* (p. 473). The index prints the month with no day; the shelf record is "
      + '`mag:benedict-xv/quod-iam-diu-1918`, dated 1918-12-01.',
  },
  '1920:457': {
    printed: '1920-10',
    date: '1920-10-05',
    indexLine: 'Oct. Principi Apostolomtm Petro. - Ad Patriarchas, Prima­ / tes, Archiepiscopos, Episcopos aliosque locorum / '
      + 'Ordinarios, pacem et communionem cum Aposto­ / lica Sede habentes : de sancto Ephrem Syro, monaco / Edesseno, doctore Ecclesiae renuntiando ....',
    evidence: "The encyclical's own dating formula reads 'Datum Romae apud Sanctum Petrum die v mensis Octobris anno MDCGCCXX, "
      + "Pontificatus Nostri septimo' (AAS 12 (1920) 471, PDF page 471 of AAS-12-1920-ocr.pdf, read 2026-09-21; the OCR's `MDCGCCXX`) "
      + '-- 5 October 1920. The index prints the month with no day; the shelf record is `mag:benedict-xv/principi-apostolorum-petro-1920`, '
      + 'dated 1920-10-05.',
  },
  '1920:553': {
    printed: '1920-12',
    date: '1920-12-01',
    indexLine: 'Dec. Annus iam plenus. - Ad Patriarchas, Primates, Archie­ / piscopos, Episcopos aliosque locorum Ordinarios, / '
      + 'pacem et communionem cum Apostolica Sede ha­ / bentes: de pueris ex bello egentioribus iterum / . adiuvandis .',
    evidence: "The encyclical's own dating formula reads 'Datum Romae apud Sanctum Petrum die i mensis Decembris anno MDCCCCXX, "
      + "Pontificatus Nostri septimo' (AAS 12 (1920) 556, PDF page 556 of AAS-12-1920-ocr.pdf, read 2026-09-21) -- 1 December 1920. "
      + 'The index prints the month with no day; the shelf record is `mag:benedict-xv/annus-iam-plenus-1920`, dated 1920-12-01.',
  },
  '1923:137': {
    printed: '1923-07-15',
    date: '1922-07-15',
    indexLine: 'iulii 15 Romani Pontifices. - Aversana. De erectione in Colle­ / giatam ad honorem ecclesiae paroecialis Sancti Sosii / '
      + 'martyris in civitate « Erattamaggiore »',
    evidence: "The constitution's own dating formula reads 'Datum Romae apud Sanctum Petrum, anno Domini millesimo nongentesimo "
      + "vigesimo secundo, die decimaquinta mensis iulii, Pontificatus Nostri' … (AAS 15 (1923) 140, PDF page 140 of AAS-15-1923-ocr.pdf, "
      + "read 2026-09-21) -- 15 July 1922, printed in the fascicle of 5 April 1923 (p. 137, 'CONSTITUTIONES APOSTOLICAE / AVERSANA') "
      + "under a ditto of the index's `1923`. Dated 1923 it was held by the same-incipit guard beside `mag:pius-xi/romani-pontifices-1923` "
      + '(17 March 1923), a different act; no shelf record carries this one.',
  },
  '1923:141': {
    printed: '1923-07-16',
    date: '1922-07-16',
    indexLine: '16 Apostolica Sedes. - Aversana. Do erectione in Collegia­ / tam ad honorem ecclesiae paroecialis Beatae Mariae / '
      + 'Virginis Immaculatae in civitate « Erattamaggiore »',
    evidence: "The constitution's own dating formula reads 'Datum Romae apud Sanctum Petrum, anno Domini millesimo nongentesimo "
      + "vigesimo secundo, die decima sexta mensis iulii, Pontificatus Nostri anno primo' (AAS 15 (1923) 143, PDF page 143 of "
      + 'AAS-15-1923-ocr.pdf, read 2026-09-21) -- 16 July 1922, the first year of a pontificate begun 6 February 1922, printed in the '
      + "fascicle of 5 April 1923 under a ditto of the index's `1923`. No shelf record carries the act.",
  },
  '1923:193': {
    printed: '1923-08-20',
    date: '1923-04-20',
    indexLine: '1923 i apr. 20 Post datam. - De Ordinariorum facultatibus quinquen­ / nalibus',
    evidence: "The motu proprio's own dating formula reads 'Datum Romae apud Sanctum Petrum, die xx mensis aprilis anno MCMXXIII, "
      + "Pontificatus Nostri secundo' (AAS 15 (1923) 194, PDF page 194 of AAS-15-1923-ocr.pdf, read 2026-09-21) -- 20 April 1923. The "
      + 'index OCR sets the month as `i apr.`, which the parser reads as the incipit, and the entry takes August from the line before '
      + 'it; the shelf record is `mag:pius-xi/post-datam-1923`, dated 1923-04-20.',
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
  // Phase 2b-iii-b: incipits the index OCR misspells into a well-formed word, which the
  // damage rule (create.ts) cannot see, on entries whose page the recovery read back by
  // the fuzzy rule -- the body line the sidecar quotes (`aas-XX-YYYY.pages.json`) is the
  // contradiction, read again in the store text on 2026-09-21. Held, not minted under a
  // word the act does not open with, as *Begnum Dei* (1959) and *Bomenorum multitudo*
  // (1983) are; each waits for a curated incipit reading.
  '1913:30': {
    indexLine: '1913 Ian. 23 Una cum ofíiciosis. - Ad R. P. D. Petrum E. Garcia Naranjo, / archiepiscopum Limanum, ceterosque Pe- / ruanae reipublicae. Episcopos, post concilium ab / eisdem Limae celebratum',
    reason: "the index's `ofíiciosis` is the OCR's: the letter to the bishops of Peru (23 January 1913, AAS 5 (1913) 30, PDF page 30 of "
      + "AAS-05-1913-ocr.pdf, read 2026-09-21) opens 'Venerabiles fratres, salutem et apostolicam benedictionem. — Una / cum officiosis "
      + "litteris vestris acta accepimus Limani Concilii'. A record minted from the index line would carry `ofiiciosis`; held until an "
      + 'incipit correction can be curated.',
  },
  '1921:186': {
    indexLine: '» 27 Incumbentes Nobis. - Erigitur Vicariatus Apostolicus de / Ontario Septemtrionali',
    reason: "the index's `Incumbentes` is the OCR's or the index's: the letter erecting the vicariate of Northern Ontario (27 November "
      + "1920, AAS 13 (1921) 186, PDF page 186 of AAS-13-1921-ocr.pdf, read 2026-09-21) opens 'Ad perpetuam rei memoriam. — Incumbentis "
      + "Nobis pastoralis officii', the genitive the sentence needs. A record minted from the index line would carry an incipit the act "
      + 'does not print; held until an incipit correction can be curated.',
  },
  '1921:194': {
    indexLine: '21 Placet oculog. - R. P. Albanus Schachleiter,, Ordinis sancti / Benedicti, abbas de Spanheim renuntiatur.',
    reason: "the index's `oculog` is the OCR's: the letter naming Albanus Schachleiter abbot of Spanheim (21 March 1921, AAS 13 (1921) "
      + "194, PDF page 194 of AAS-13-1921-ocr.pdf, read 2026-09-21) opens 'Dilecte fili, salutem et apostolicam benedictionem. - Placet "
      + "oculos'. A record minted from the index line would carry `oculog`; held until an incipit correction can be curated.",
  },
  '1925:301': {
    indexLine: '14 Eapallensi in civitate. - Titulo et privilegiis Basilicae / minoris exornatur ecclesia paroecialis ad SS. Ger- / vasii et Protasii, in civitate « Rapallo », dioecesis / Clavarensis',
    reason: "the index's `Eapallensi` is the OCR's `E` for `R`: the letter for the parish church of Rapallo (14 June 1925, AAS 17 (1925) "
      + "301, PDF page 301 of AAS-17-1925-ocr.pdf, read 2026-09-21) opens 'Ad perpetuam rei memoriam. — Rapallensi in civitate exstat "
      + "paroecia'. A record minted from the index line would carry `Eapallensi`; held until an incipit correction can be curated.",
  },
  '1925:302': {
    indexLine: '21 Pretioso purpúrala. - Ven. Dei Famuli Ioannes de Bré­ / beuf, Isaacus Jogues, Gabriel Lalemant, Antonius / Daniel, Carolus Garnier, Natalis Chabanel, presby­ / teri; Senatus Goupil et Ioannes de la Lande, coa­ / diutores, omnes e Societate Iesu, Beati renuntiantur.',
    reason: "the index's `purpúrala` is the OCR's: the letter beatifying the Canadian martyrs (21 June 1925, AAS 17 (1925) 302, PDF page "
      + "302 of AAS-17-1925-ocr.pdf, read 2026-09-21) opens 'Ad perpetuam rei memoriam.—Pretioso purpurata martyrum sanguine'. A record "
      + "minted from the index line would carry `purpurala`; held until an incipit correction can be curated.",
  },
};

export interface PageCorrection {
  /** The page the index line prints, as the parser reads it; the row applies only while it still does. */
  printed: number;
  /** The page the volume opens the act at. */
  page: number;
  /** The index line, quoted as extracted. */
  indexLine: string;
  /** What the volume prints at the corrected page (heading, incipit, dating formula), what the printed page opens instead, and where both were read. */
  evidence: string;
}

/**
 * Pages the index prints wrongly for an entry it dates and names -- the OCR's reading of a
 * digit (`530` for 539, `205` for 265) or the index's own slip (`946` for 947) -- keyed
 * `{source}|{pageless key}` as the readings are, each row giving the page the volume
 * opens the act at, with both pages read. Applied first of all in the join (join.ts,
 * applyPageCorrections), so the matcher, the creator and the shared-page check see the
 * act's page; a row whose entry the parser no longer opens, or whose printed page the
 * index no longer reads, is a hard error. The eight rows are the cases phases 2b-ii-c,
 * 2b-iii-a and 2b-iii-b named for this table (PR #37, #40, #41); every page was read in
 * the volume text on 2026-09-21.
 */
export const ACTA_PAGE_CORRECTIONS: Readonly<Record<string, PageCorrection>> = {
  // AAS 17 (1925): the index gives *Ex Apostolico officio* (Valença, 27 March 1925) the page
  // `289`, which the volume gives to *Inter praecipuas* (6 January 1925, a curated reading
  // above); the constitution opens at 516.
  '1925|1925-03-27|CONSTITUTIONES APOSTOLICAE|Ex Apostolico officio|Erectionis dioecesis Valentinae': {
    printed: 289,
    page: 516,
    indexLine: '              martii            27       Ex Apostolico officio. - Erectionis dioecesis Valentinae                                                         289',
    evidence: "AAS 17 (1925) p. 516 (PDF page 516 of AAS-17-1925-ocr.pdf, read 2026-09-21) prints, after the end of the constitution before it, 'II / VALENTINA IN BRASILIA ERECTIONIS DIOECESIS / PIUS EPISCOPUS SERVUS SERVORUM DEI AD PERPETUAM REI MEMORIAM / Ex Apostolico officio Nobis commisso ad Nos spectat …', dated 'anno Domini millesimo nongentesimo vigesimo quinto, die vigesima septima mensis martii, Pontificatus Nostri anno quarto' (p. 518). P. 289 opens *Inter praecipuas* (the ecclesiastical province of San Cristóbal, 6 January 1925), the act the reading above cites there.",
  },
  // AAS 19 (1927): the OCR reads `205` for 265 on *Pro Apostolico* (Vicenza and Padua, 28
  // January 1927) -- p. 205 opens the letter *Quoniam annus* -- and `268` for 267 on *Quae ad
  // rei* (Mackenzie and Athabaska, 15 March 1927), whose last lines and formula are on 268.
  '1927|1927-01-28|CONSTITUTIONES APOSTOLICAE|Pro Apostolico|Dismembrationis et aggregationis, inter dioec. Pata viii. et': {
    printed: 205,
    page: 265,
    indexLine: '   » » 28 Pro Apostolico. - Dismembrationis et aggregationis, inter / dioec. Pata viii. et Vicentin. 205',
    evidence: "AAS 19 (1927) p. 265 (PDF page 265 of AAS-19-1927-ocr.pdf, read 2026-09-21), the first page of the fascicle of 1 August 1927 (Num. 8), prints 'ACTA PII PP. XI / CONSTITUTIO APOSTOLICA / VICENTINA ET PATAVINA / DISMEMBRATIONIS ET AGGREGATIONIS / PIUS EPISCOPUS SERVUS SERVORUM DEI AD PERPETUAM REI MEMORIAM / Pro Apostolico munere quo, licet immerito, fungimur …', dated 'anno Domini millesimo nongentesimo vigesimo septimo, die vigesima octava mensis Ianuarii, Pontificatus Nostri anno quinto' (p. 266). P. 205 opens 'EPISTOLAE / I / AD EMUM P. D. ALEXIUM … CARD. CHAROST … / Quoniam annus mox celebrabitur' (14 March 1927).",
  },
  '1927|1927-03-15|LITTERAE APOSTOLICAE|Quae ad rei|Nova delimitatio inter vicariatus apostolicos de Mackenzie e': {
    printed: 268,
    page: 267,
    indexLine: '   » » 15 Quae ad rei. - Nova delimitatio inter vicariatus apostoli­ / cos de Mackenzie et de Athabaska, qui est in posterum / de Grouard denominandus 268',
    evidence: "AAS 19 (1927) p. 267 (PDF page 267 of AAS-19-1927-ocr.pdf, read 2026-09-21) prints 'LITTERAE APOSTOLICAE / I / NOVA DELIMITATIO INTER VICARIATUS APOSTOLICOS DE MACKENZIE ET DE ATHABASKA, QUI EST IN POSTERUM DE GROUARD DENOMINANDUS. / PIUS PP. XI / Ad futuram rei memoriam. — Quae ad rei sacrae procurationem melius gerendam …', dated 'die xv mensis Martii anno MDCCCCXXVII, Pontificatus Nostri sexto' (p. 268). P. 268 prints the letter's end and then 'II / IMMUTATIO FINIUM INTER VICARIATUM APOSTOLICUM DE ORANGE … / In omnes catholici orbis partes' (16 March 1927), the act the index cites at 268 too.",
  },
  // AAS 22 (1930): three pages the OCR misread -- `323` for 319 (the beatification of Konrad
  // von Parzham, 15 June 1930; p. 323 prints the letter's end and opens the epistle *Nono
  // exeunte saeculo*), `530` for 539 (*Casti connubii*; p. 530 is inside the Christmas
  // address to the cardinals) and `307` for 337 (the motu proprio *In allocutione*; p. 307
  // opens the public consistory of 3 July 1930). Each was held for this table by phase
  // 2b-iii-a (PR #40): the ACTA_HOLDS row on the motu proprio is retired with this one.
  '1930|1930-06-15|LITTERAE APOSTOLICAE|Ordinis Capuccinarum|Venerabilis Servus Dei CoDradus a Parzham, laicus professus ': {
    printed: 323,
    page: 319,
    indexLine: '  » » 15 Ordinis Capuccinarum. - Venerabilis Servus Dei CoDradus / a Parzham, laicus professus Ordinis Minorum Capucci­ / norum, Beatus renuntiatur 323',
    evidence: "AAS 22 (1930) p. 319 (PDF page 319 of AAS-22-1930-ocr.pdf, read 2026-09-21) prints, after a letter dated 8 June 1930, 'III / VENERABILIS SERVUS DEI CONRADUS A PARZHAM LAICUS PROFESSUS ORDINIS MINORUM CAPUCCINORUM BEATUS RENUNTIATUR. / PIUS PP. XI / Ad perpetuam rei memoriam. — Ordinis Capuccinorum sodales inter laicos satis compertum est …' (the index's *Capuccinarum* is its own reading), dated 'die xv mensis Iunii, anno MDCCCCXXX, Pontificatus Nostri nono' (p. 323). P. 323 prints that formula and opens 'V / EPISTOLA / AD EMUM P. D. IUSTINIANUM … CARD. SERÉDI … / Nono exeunte saeculo' (2 June 1930).",
  },
  '1930|????-12-31|LITTERAE ENCYCLICAE|Casti connubii|Ad venerabiles fratres Patriarchas, Primates, Archiepiscopos': {
    printed: 530,
    page: 539,
    indexLine: '  » Dec. 31 Casti connubii. - Ad venerabiles fratres Patriarchas, Pri­ / mates, Archiepiscopos, Episcopos, aliosque locorum / Ordinarios, pacem et communionem cum Apostolica / Sede habentes: de Matrimonio christiano spectatis / praesentibus familiae et societatis conditionibus, ne­ / cessitatibus, erroribus, vitiis . 530',
    evidence: "AAS 22 (1930) p. 539 (PDF page 539 of AAS-22-1930-ocr.pdf, read 2026-09-21) prints, after the last lines of the Christmas address to the cardinals, 'LITTERAE ENCYCLICAE / AD VENERABILES FRATRES PATRIARCHAS, PRIMATES, ARCHIEPISCOPOS, EPISCOPOS ALIOSQUE LOCORUM ORDINARIOS, PACEM ET COMMUNIONEM CUM APOSTOLICA SEDE HABENTES: DE MATRIMONIO CHRISTIANO … / PIUS PP. XI / VENERABILES FRATRES SALUTEM ET APOSTOLICAM BENEDICTIONEM / Casti connubii quanta sit dignitas …', dated 'die xxxi mensis Decembris anno MDCCCCXXX, Pontificatus Nostri nono' (p. 592; the OCR's `xxxr`). P. 530 is inside that address. The entry's year is a ditto under the `1J30` the OCR reads for 1930 (the correction row on *Ad salutem* above); with its page corrected it matches the shelf record `mag:pius-xi/casti-connubii-1930` through the correction keyed on this page.",
  },
  '1930|1930-08-05|MOTU PROPRIO|In allocutione|De novo opere in locum Leoniani operis de Fidei praeservatio': {
    printed: 307,
    page: 337,
    indexLine: '  » Aug. 5 In allocutione. - De novo opere in locum Leoniani operis / de Fidei praeservatione sufficiendo 307',
    evidence: "AAS 22 (1930) p. 337 (PDF page 337 of AAS-22-1930-ocr.pdf, read 2026-09-21), the first page of the fascicle of 7 August 1930 (Num. 8), prints 'ACTA PII PP. XI / MOTU PROPRIO / DE NOVO OPERE IN LOCUM LEONIANI OPERIS DE FIDEI PRAESERVATIONE SUFFICIENDO. / PIUS PP. XI / In Allocutione habita in Consistorio …', dated 'die v mensis Augusti, in festo Dedicationis Sanctae Mariae ad Nives, anno MDCCCCXXX, Pontificatus Nostri nono' (p. 340). P. 307 opens 'II. - CONSISTORIUM PUBLICUM / Feria V, 3 Iulii 1930 …'. The entry's year is the parser's repair of `1030`, confirmed by the row on p. 87 above.",
  },
  // AAS 76 (1984) and 82 (1990), the two pages phase 2b-ii-c found two acts cited at where the
  // volume prints one (PR #37): the index's `946` for Cabinda's constitution, which opens at
  // 947 (p. 946 opens Port Blair's), and its `43` for *Fidelem populum*, which opens at 42
  // (p. 43 opens *Inter sacras aedes*).
  '1984|1984-07-02|CONSTITUTIONES APOSTOLICAE|Catholicae prosperitas|In Angola nova dioecesis conditur Cabindana nomine': {
    printed: 946,
    page: 947,
    indexLine: '  » Iul. 2 CABINDANA. Catholicae prosperitas. - In Angola nova dioecesis / conditur Cabindana nomine 946',
    evidence: "AAS 76 (1984) p. 947 (PDF page 947 of AAS-76-1984-ocr.pdf, read 2026-09-21) prints, after the end of Port Blair's constitution, 'III / CABINDANA / In Angola nova dioecesis conditur Cabindanae nomine. / IOANNES PAULUS EPISCOPUS SERVUS SERVORUM DEI AD PERPETUAM REI MEMORIAM / Catholicae prosperitas communitatis in Angoliensi natione …', dated 'die altero mensis Iulii, anno Domini millesimo nongentesimo octogesimo quarto, Pontificatus Nostri sexto' (p. 948). P. 946 opens *Ex quo Christus* (Portus Blairensis, 22 June 1984), which the index cites there.",
  },
  '1990|1989-10-10|LITTERAE APOSTOLICAE|Fidelem populum|B.M.V, in caelum Assumpta dioecesis Bataënsis Patrona confir': {
    printed: 43,
    page: 42,
    indexLine: '   » » 10 Fidelem populum. - B.M.V, in caelum Assumpta dioecesis Ba- / taënsis Patrona confirmatur 43',
    evidence: "AAS 82 (1990) p. 42 (PDF page 42 of AAS-82-1990-ocr.pdf, read 2026-09-21) prints, after a letter dated 23 September 1989, 'II / Beata Maria Virgo in caelum Assumpta dioecesis Bataënsis Patrona confirmatur. / IOANNES PAULUS PP. II / Ad perpetuam rei memoriam. — Fidelem populum, ad beatam patriam …' (10 October 1989). P. 43 opens *Inter sacras aedes* (Ouidah, 9 November 1989), which the index cites there.",
  },
};

export interface PageReading {
  /** The act's first page, read in the volume. */
  page: number;
  /** The index line, quoted as extracted (without a page, as the OCR left it). */
  indexLine: string;
  /** The heading and incipit as the volume prints them at that page, and where they were read. */
  evidence: string;
}

/**
 * Pages read by hand for entries the recovery (recover.ts) leaves without one -- the acts
 * that matter most first: encyclicals, constitutions -- keyed `{source}|{pageless key}`
 * (`1921|1921-12-31|LITTERAE ENCYCLICAE|Casti connubii|Ad venerabiles ...`), each quoting the
 * volume. Consulted before the sidecar (join.ts). The seventeen rows are the acts of
 * weight the era report of phase 2b-iii-b (AAS 1-17) named in its *Page not recovered*
 * block, each read in the store text; a reading whose act the index also misdates has
 * its ACTA_INDEX_CORRECTIONS row keyed by the page read here.
 */
export const ACTA_PAGE_READINGS: Readonly<Record<string, PageReading>> = {
  // Phase 2b-iii-b, Task 9: the encyclicals, constitutions and motu proprio the recovery
  // (recover.ts) left without a page -- the era report's *Page not recovered* block -- each
  // read in the store text on 2026-09-21 at the page it opens on, with the act's own dating
  // formula; where the index's date is wrong or prints no day, an ACTA_INDEX_CORRECTIONS
  // row keyed by the page read here supplies it. Every row names why the recovery missed
  // the act. Not read: the 1909 motu proprio the index describes without an incipit and
  // *Vix dum* (1914), *Quandoquidem* (1915), none of them a shelf record awaiting its
  // reference; and *Ubi arcano Dei consilio* (AAS 14 (1922) 673), whose index line prints
  // no date at all and opens no entry (index.ts: a line outside any entry), so no key of
  // this table can name it -- ACTA_CURATED_REFERENCES cites it (controller ruling 15).
  '1909|1908-01-29|CONSTITUTIONES APOSTOLICAE|Sapienti Consilio|DE ROMANA CURIA.': {
    page: 7,
    indexLine: '1908 Ian. 29 Constitutio « Sapienti Consilio » / DE ROMANA CURIA.',
    evidence: "AAS 1 (1909) p. 7 (PDF page 7 of AAS-01-1909-ocr.pdf, read 2026-09-21) prints 'CONSTITUTIO APOSTOLICA / DE ROMANA "
      + "CURIA / PIUS EPISCOPUS / SERVUS SERVORUM DEI / AD PERPETUAM REI MEMORIAM / Sapienti consilio sa. me. Pontifex Xystus V' (the "
      + "drop capital sets the S on its own line), under the running header 'Constitutio Apostolica Sapienti consilio.. 7'; dated at "
      + "p. 19 'Datum Romae apud Sanctum Petrum, anno Incarnationis Dominicae millesimo nongentesimo octavo, die festo Sanctorum "
      + "Apostolorum Petri et Pauli, III Kalendas Iulias, Pontificatus Nostri anno quinto' -- 29 June 1908, which the index prints as "
      + '`Ian. 29` (ACTA_INDEX_CORRECTIONS `1909:7`). The recovery found the incipit at p. 295 only, outside the constitutions\' run '
      + "of the Index generalis, because the drop capital breaks 'Sapienti' across two lines at p. 7. The shelf record is "
      + '`mag:pius-x/sapienti-consilio-1908`.',
  },
  '1914|1914-11|LITTERAE ENCYCLICAE|Ad beatissimi Apostolorum Principis|Ad venerabiles Fratres Patriarchas, Primates, Archiepiscopos': {
    page: 565,
    indexLine: '1914 Nov. Ad beatissimi Apostolorum Principis. - Ad venera­ / biles Fratres Patriarchas, Primates, Archiepiscopos, / '
      + 'Episcopos, aliosque locorum Ordinarios pacem et / communionem cum Apostolica Sede habentes . .',
    evidence: "AAS 6 (1914) p. 565 (PDF page 565 of AAS-06-1914-ocr.pdf, read 2026-09-21), the first page of the fascicle of 18 "
      + "November 1914, prints 'ACTA BENEDICTI PP. XV / LITTERAE ENCYCLICAE / AD VENERABILES FRATRES PATRIARCHAS PRIMATES ARCHIEPISCOPOS "
      + "EPISCOPOS ALIOSQUE LOCORUM ORDINARIOS PACEM ET COMMUNIONEM CUM APOSTOLICA SEDE HABENTES. / BENEDICTUS PP. XV / … / Ad beatissimi "
      + "Apostolorum Principis cathedram arcano Dei providentis consilio'; dated at p. 581 'Datum Romae apud S. Petrum die festo Sanctorum "
      + "omnium, i Novembris mcmxiv, Pontificatus Nostri anno primo' -- 1 November 1914 (ACTA_INDEX_CORRECTIONS `1914:565`; the index "
      + "prints the month only). The recovery found the incipit at pp. 565 and 585 both: p. 585 (the fascicle of 25 November) heads the "
      + "'VERSIONES AUTHENTICAE' of the same encyclical (`« AD BEATISSIMI APOSTOLORUM PRINCIPIS », DIEI 1 NOVEMBRIS 1914`). The shelf "
      + 'record is `mag:benedict-xv/ad-beatissimi-apostolorum-1914`.',
  },
  '1915|1915-03-21|CONSTITUTIONES APOSTOLICAE||De Abbatia Sublacensi': {
    page: 197,
    indexLine: 'Mart. 21 Coenobium Sublacense. - De Abbatia Sublacensi . .',
    evidence: "AAS 7 (1915) p. 197 (PDF page 197 of AAS-07-1915-ocr.pdf, read 2026-09-21), the first page of the fascicle of 6 May "
      + "1915, prints 'ACTA BENEDICTI PP. XV / CONSTITUTIO APOSTOLICA / DE ABBATIA SUBLACENSI / BENEDICTUS EPISCOPUS / SERVUS SERVORUM "
      + "DEI / AD PERPETUAM REI MEMORIAM / Coenobium Sublacense, utpote ab ipso Monachorum per occidentem Patriarcha, sancto Benedicto, "
      + "conditum'; dated at p. 200 'Datum Romae apud S. Petrum, anno Incarnationis Dominicae millesimo nongentesimo decimo quinto, die "
      + "vicesima prima martii, in festo sancti Patris Benedicti, Pontificatus Nostri anno primo' -- 21 March 1915, as the index prints. "
      + "The parser reads the index's `Coenobium Sublacense` as a toponym and gives the entry no incipit, so the recovery had nothing to "
      + 'search for; the act opens with those words. No shelf record carries the act.',
  },
  '1918|1918-12|LITTERAE ENCYCLICAE||Per quas publicae indicuntur preces pro conventu de pace com': {
    page: 473,
    indexLine: '1918 Dec. Per quas publicae indicuntur preces pro conventu / de pace componenda .',
    evidence: "AAS 10 (1918) p. 473 (PDF page 473 of AAS-10-1918-ocr.pdf, read 2026-09-21), the first page of the fascicle of 5 "
      + "December 1918, prints 'ACTA BENEDICTI PP. XV / LITTERAE ENCYCLICAE / AD VENERABILES FRATRES, PATRIARCHAS, PRIMATES, "
      + "ARCHIEPISCOPOS, EPISCOPOS ALIOSQUE LOCORUM ORDINARIOS, PACEM ET COMMUNIONEM CUM APOSTOLICA SEDE HABENTES, PER QUAS PUBLICAE "
      + "INDICUNTUR PRECES PRO CONVENTU DE PACE COMPONENDA. / BENEDICTUS PP. XV / … / Quod iam diu orbis terrarum anxie expetebat'; "
      + "dated at p. 474 'Datum Romae apud S. Petrum die i mensis decembris MDCCCCXVIII, Pontificatus Nostri anno quinto' -- 1 December "
      + "1918 (ACTA_INDEX_CORRECTIONS `1918:473`; the index prints the month only). The index describes the act by its heading and "
      + "prints no incipit, so the recovery had nothing to search for; the act is found by the heading's words. The shelf record is "
      + '`mag:benedict-xv/quod-iam-diu-1918`.',
  },
  '1918|1918-07|MOTU PROPRIO|Tribus abhinc annis|Sodalium Ssmi Crucifixi ad S. Marcelli novas constitutiones ': {
    page: 305,
    indexLine: 'Iul. Tribus abhinc annis. - Sodalium Ssmi Crucifixi ad / S. Marcelli novas constitutiones ratas habet. . .',
    evidence: "AAS 10 (1918) p. 305 (PDF page 305 of AAS-10-1918-ocr.pdf, read 2026-09-21), the first page of the fascicle of 1 "
      + "August 1918, prints 'ACTA BENEDICTI PP. XV / MOTU PROPRIO / SODALIUM SS. CRUCIFIXI AD S. MARCELLI NOVAS CONSTITUTIONES RATAS "
      + "HABET / BENEDICTUS PP. XV / Tribus abhinc annis, cum sanctissima Iesu Crucifixi Imago'; dated at p. 306 'Datum Romae apud S. "
      + "Petrum die i mensis iulii, in festo Pretiosissimi Sanguinis D, N. I. C. MDCCCCXVIII, Pontificatus Nostri anno quarto' -- 1 July "
      + "1918 (ACTA_INDEX_CORRECTIONS `1918:305`; the index prints the month only). The recovery found the incipit at p. 305 only, "
      + "outside the motu proprio run of the Index generalis. No shelf record carries the act.",
  },
  '1920|1920-10|LITTERAE ENCYCLICAE|Principi Apostolomtm Petro|Ad Patriarchas, Primates, Archiepiscopos, Episcopos aliosque': {
    page: 457,
    indexLine: 'Oct. Principi Apostolomtm Petro. - Ad Patriarchas, Prima­ / tes, Archiepiscopos, Episcopos aliosque locorum / '
      + 'Ordinarios, pacem et communionem cum Aposto­ / lica Sede habentes : de sancto Ephrem Syro, monaco / Edesseno, doctore Ecclesiae renuntiando ....',
    evidence: "AAS 12 (1920) p. 457 (PDF page 457 of AAS-12-1920-ocr.pdf, read 2026-09-21), the first page of the fascicle of 2 "
      + "November 1920, prints 'ACTA BENEDICTI PP. XV / LITTERAE ENCYCLICAE / AD PATRIARCHAS, PRIMATES, ARCHIEPISCOPOS, EPISCOPOS "
      + "ALIOSQUE LOCORUM ORDINARIOS, PACEM ET COMMUNIONEM CUM APOSTOLICA SEDE HABENTES, DE SANCTO EPHREM SYRO MONACO EDESSENO DOCTORE "
      + "ECCLESIAE RENUNTIANDO. / BENEDICTUS PP. XV / … / Principi Apostolorum Petro illud est a divino Ecclesiae Conditore attributum'; "
      + "dated at p. 471 'Datum Romae apud Sanctum Petrum die v mensis Octobris anno MDCGCCXX, Pontificatus Nostri septimo' (the OCR's "
      + "`MDCGCCXX`) -- 5 October 1920 (ACTA_INDEX_CORRECTIONS `1920:457`; the index prints the month only). The index OCR reads the "
      + "incipit as `Apostolomtm`, which the body does not print, so the recovery found nothing. The shelf record is "
      + '`mag:benedict-xv/principi-apostolorum-petro-1920`.',
  },
  '1920|1920-12|LITTERAE ENCYCLICAE|Annus iam plenus|Ad Patriarchas, Primates, Archiepiscopos, Episcopos aliosque': {
    page: 553,
    indexLine: 'Dec. Annus iam plenus. - Ad Patriarchas, Primates, Archie­ / piscopos, Episcopos aliosque locorum Ordinarios, / '
      + 'pacem et communionem cum Apostolica Sede ha­ / bentes: de pueris ex bello egentioribus iterum / . adiuvandis .',
    evidence: "AAS 12 (1920) p. 553 (PDF page 553 of AAS-12-1920-ocr.pdf, read 2026-09-21), the first page of the fascicle of 1 "
      + "December 1920, prints 'ACTA BENEDICTI PP. XV / EPISTOLA ENCYCLICA / AD PATRIARCHAS, PRIMATES, ARCHIEPISCOPOS, EPISCOPOS ALIOSQUE "
      + "LOCORUM ORDINARIOS, PACEM ET COMMUNIONEM CUM APOSTOLICA SEDE HABENTES I DE PUERIS EX BELLO EGENTIORIBUS ITERUM ADIUVANDIS. / "
      + "BENEDICTUS PP. XV / … / Annus iam plenus est, cum, recenti adhuc bello'; dated at p. 556 'Datum Romae apud Sanctum Petrum die i "
      + "mensis Decembris anno MDCCCCXX, Pontificatus Nostri septimo' -- 1 December 1920 (ACTA_INDEX_CORRECTIONS `1920:553`; the index "
      + "prints the month only). The recovery found the incipit at p. 553 and refused it because the OCR of the running header reads "
      + "'Annus XII • Vol. XII 1 Decembris 1920 Nun. 13'. The shelf record is `mag:benedict-xv/annus-iam-plenus-1920`.",
  },
  '1921|1918-08-02|CONSTITUTIONES APOSTOLICAE||Creantur novae dioeceses Nazarensis et Garanhunensis in Bras': {
    page: 463,
    indexLine: 'Aug. 2 Archidioecesis Olindensis-Recifensis. - Creantur novae / dioeceses Nazarensis et Garanhunensis in Brasilia, / '
      + 'et transfertur sedes episcopalis Florestensis . . .',
    evidence: "AAS 13 (1921) p. 463 (PDF page 463 of AAS-13-1921-ocr.pdf, read 2026-09-21) prints, below the end of the constitution "
      + "before it, 'III / OLINDENSIS-RECIFENSIS / CREANTUR NOVAE DIOECESES NAZARENSIS ET GARANHUNENSIS IN BRASILIA, ET TRANSFERTUR SEDES "
      + "EPISCOPALIS FLORESTENSIS. / BENEDICTUS EPISCOPUS / SERVUS SERVORUM DEI / AD PERPETUAM REI MEMORIAM / Archidioecesis "
      + "Olindensis-Recifensis, quae olim civilem Statum de Pernambuco ex integro complectebatur'; dated at p. 466 'Datum Romae apud "
      + "Sanctum Petrum, anno Domini millesimo nongentesimo decimo octavo, die secunda mensis augusti, Pontificatus Nostri anno quarto' "
      + "-- 2 August 1918, as the index prints (a constitution of 1918 the volume of 1921 prints late, with the two of 1917 and 1918 at "
      + "pp. 457 and 461). The parser reads the index's `Archidioecesis Olindensis-Recifensis` as a toponym and gives the entry no "
      + 'incipit, so the recovery had nothing to search for; the act opens with those words. No shelf record carries the act.',
  },
  '1921|1921-02-16|CONSTITUTIONES APOSTOLICAE|Praedecessorum nostrorum|Erectionis novae provinciae ecclesiasticae S. Iosephi Costar': {
    page: 252,
    indexLine: '» 16 Praedecessorum nostrorum. - Erectionis novae pro­ / vinciae ecclesiasticae S. Iosephi Costaricensis, novae / '
      + 'dioecesis Alajuelensis, novique vicariatus aposto­ / lici Limonensis',
    evidence: "AAS 13 (1921) p. 252 (PDF page 252 of AAS-13-1921-ocr.pdf, read 2026-09-21) prints 'II / SANCTI IOSEPHI COSTARICENSIS / "
      + "ERECTIONIS NOVAE PROVINCIAE ECCLESIASTICAE EIUSDEM NOMINIS, NOVAE DIOECESIS ALAJUELENSIS, NOVIQUE VICARIATUS APOSTOLICI "
      + "LIMONENSIS. / BENEDICTUS EPISCOPUS / SERVUS SERVORUM DEI / AD PERPETUAM REI MEMORIAM / Praedecessorum Nostrorum vestigiis "
      + "inhaerentes'; dated at p. 255 'Datum Romae apud sanctum Petrum, anno Domini millesimo nongentesimo vigesimo primo, die decima "
      + "sexta mensis februarii, Pontificatus Nostri anno septimo' -- 16 February 1921, as the index prints. The recovery found the "
      + "incipit at p. 252 and refused it because the OCR of the running header reads '25Î- Acta Apostolicae Sedis - Commentarium "
      + "Officiale'. No shelf record carries the act.",
  },
  '1921|1921-05-06|CONSTITUTIONES APOSTOLICAE|Eximia Benedictini Ordinis|Dismembrationis et erectionis in abbatiam nullius S. Petri d': {
    page: 290,
    indexLine: 'Maii 6 Eximia Benedictini Ordinis. - Dismembrationis et ere­ / ctionis in abbatiam nullius S. Petri de Muenster.',
    evidence: "AAS 13 (1921) p. 290 (PDF page 290 of AAS-13-1921-ocr.pdf, read 2026-09-21) prints 'CONSTITUTIO APOSTOLICA / SANCTI "
      + "PETRI APUD MUENSTER / DISMEMBRATIONIS ET ERECTIONIS IN ABBATIAM NULLIUS / BENEDICTUS EPISCOPUS / SERVUS SERVORUM DEI / AD "
      + "PERPETUAM REI MEMORIAM / Eximia Benedictini Ordinis tum in Ecclesiam tum in civilem societatem gesta nemo est qui ignoret'; "
      + "dated at p. 293 'Datum Romae apud Sanctum Petrum, anno Domini millesimo nongentesimo vigesimo primo, die sexta mensis maii, "
      + "Pontificatus Nostri anno septimo' -- 6 May 1921, as the index prints. The recovery found the incipit at p. 290 only, outside "
      + "the constitutions' run of the Index generalis (the running header of p. 290 prints no page number). No shelf record carries "
      + 'the act.',
  },
  '1923|1923-08-20|MOTU PROPRIO|i apr|20 Post datam. - De Ordinariorum facultatibus quinquennalibu': {
    page: 193,
    indexLine: '1923 i apr. 20 Post datam. - De Ordinariorum facultatibus quinquen­ / nalibus',
    evidence: "AAS 15 (1923) p. 193 (PDF page 193 of AAS-15-1923-ocr.pdf, read 2026-09-21), the first page of the fascicle of 5 May "
      + "1923, prints 'ACTA PII PP. XI / MOTU PROPRIO / DE ORDINARIORUM FACULTATIBUS QUINQUENNALIBUS / PIUS PP. XI / Post datam "
      + "instructionem et statutam normam pro facultatum quinquennalium concessione'; dated at p. 194 'Datum Romae apud Sanctum Petrum, "
      + "die xx mensis aprilis anno MCMXXIII, Pontificatus Nostri secundo' -- 20 April 1923 (ACTA_INDEX_CORRECTIONS `1923:193`). The "
      + "index OCR sets the month column as `i apr.` and the parser reads it as the incipit, dating the entry 1923-08-20 and searching "
      + "the body for `i apr`; the incipit is *Post datam*. The shelf record is `mag:pius-xi/post-datam-1923` (motu_proprio, 1923-04-20).",
  },
  '1923|1923-07-16|CONSTITUTIONES APOSTOLICAE|Apostolica Sedes|Aversana. Do erectione in Collegiatam ad honorem ecclesiae p': {
    page: 141,
    indexLine: '16 Apostolica Sedes. - Aversana. Do erectione in Collegia­ / tam ad honorem ecclesiae paroecialis Beatae Mariae / '
      + 'Virginis Immaculatae in civitate « Erattamaggiore »',
    evidence: "AAS 15 (1923) p. 141 (PDF page 141 of AAS-15-1923-ocr.pdf, read 2026-09-21) prints 'II / AVERSANA / DE ERECTIONE IN "
      + "COLLEGIATAM AD HONOREM ECCLESIAE PAROECIALIS BEATAE MARIAE VIRGINIS IMMACULATAE IN CIVITATE « FRATTAMAGGIORE ». / PIUS EPISCOPUS "
      + "/ SERVUS SERVORUM DEI / AD PERPETUAM REI MEMORIAM / Apostolica Sedes, quoties eidem se praebuit occasio'; dated at p. 143 "
      + "'Datum Romae apud Sanctum Petrum, anno Domini millesimo nongentesimo vigesimo secundo, die decima sexta mensis iulii, "
      + "Pontificatus Nostri anno primo' -- 16 July 1922, the first year of a pontificate begun 6 February 1922, printed in the fascicle "
      + "of 5 April 1923 under a ditto of the index's `1923` (ACTA_INDEX_CORRECTIONS `1923:141`; the constitution before it, *Romani "
      + "Pontifices* for the same town at p. 137, is dated 15 July 1922 the same way, `1923:137`). The recovery found the incipit at pp. "
      + "141 and 258 both and read no formula to settle them. No shelf record carries the act.",
  },
  '1923|1923-02-18|CONSTITUTIONES APOSTOLICAE|Apostolica Sedes|Clavarensis. Erectionis collegiatae ad honorem': {
    page: 258,
    indexLine: '» 18 Apostolica Sedes. - Clavarensis. Erectionis collegiatae / ad honorem',
    evidence: "AAS 15 (1923) p. 258 (PDF page 258 of AAS-15-1923-ocr.pdf, read 2026-09-21) prints 'CONSTITUTIONES APOSTOLICAE / I / "
      + "CLAVARENSIS / ERECTIONIS COLLEGIATAE AD HONOREM / PIUS EPISCOPUS / SERVUS SERVORUM DEI / AD PERPETUAM REI MEMORIAM / Apostolica "
      + "Sedes, de Ecclesiarum omnium decore sollicita'; dated at p. 260 'Datum Romae apud Sanctum Petrum, anno Domini millesimo "
      + "nongentesimo vigesimo tertio, die decima octava mensis februarii, Pontificatus Nostri anno secundo' (the OCR's `Eomae`) -- 18 "
      + "February 1923, as the index prints. The recovery found the incipit at pp. 141 and 258 both and read no formula to settle them. "
      + 'No shelf record carries the act.',
  },
  '1924|1924-07-25|CONSTITUTIO APOSTOLICA|Ad munus pastorale|Dismembrationis et erectionis Praelaturae Nullius Sancti Ios': {
    page: 424,
    indexLine: '25 Ad munus pastorale. - Dismembrationis et erectionis / Praelaturae Nullius Sancti Iosephi de « Alto To- / cantins »',
    evidence: "AAS 16 (1924) p. 424 (PDF page 424 of AAS-16-1924-ocr.pdf, read 2026-09-21) prints 'II / GOYASENSIS / DISMEMBRATIONIS "
      + "ET ERECTIONIS PRAELATURAE « NULLIUS » SANCTI IOSEPHI DE « ALTO TOCANTINS ». / PIUS EPISCOPUS / SERVUS SERVORUM DEI / AD PERPETUAM "
      + "REI MEMORIAM / Ad muniis pastorale Nobis commissum ab aeterno Pastorum Principe' (the OCR's `muniis`, which is why the recovery "
      + "found no hit); dated at p. 426 'Datum Romae apud Sanctum Petrum, anno Domini millesimo nongentesimo vigesimo quarto, die "
      + "vigesima quinta mensis iulii, Pontificatus Nostri anno tertio' -- 25 July 1924, as the index prints. No shelf record carries "
      + 'the act.',
  },
  '1924|1924-10-20|MOTU PROPRIO|Latinarum litterarum|De peculiari litterarum latinarum schola in Athenaeo Gregori': {
    page: 417,
    indexLine: 'oct. 20 Latinarum litterarum. - De peculiari litterarum lati­ / narum schola in Athenaeo Gregoriano constituenda.',
    evidence: "AAS 16 (1924) p. 417 (PDF page 417 of AAS-16-1924-ocr.pdf, read 2026-09-21), the first page of the fascicle of 5 "
      + "November 1924, prints 'ACTA PII PP. XI / MOTU PROPRIO / DE PECULIARI LITTERARUM LATINARUM SCHOLA IN ATHENAEO GREGORIANO "
      + "CONSTITUENDA. / PIUS PP. XI / Latinarum litterarum quae quantaque sit dignitas ac praestantia' (the OCR's `MOTU PBOPBIO`); "
      + "dated at p. 420 'Datum Romae apud Sanctum Petrum, die xx mensis octobris anno MDCCCCXXIV, Pontificatus Nostri tertio' -- 20 "
      + "October 1924, as the index prints. The recovery found the incipit at p. 417 and refused it because the OCR of the running "
      + "header reads 'Anijius XVI - Vol. XVI 5 Novembris 192á Num. U'. The index heads it `IV.?- MOTU PROPRIO` (the OCR's `?`), a "
      + "heading the parser now reads (index.ts); the shelf record is `mag:pius-xi/latinarum-litterarum-1924` (motu_proprio).",
  },
  '1925|1925-01-06|CONSTITUTIONES APOSTOLICAE|Inter praecipuas|~ Erectionis provinciae ecclesiasticae Sancti Christophori d': {
    page: 289,
    indexLine: '1925 ian. 6 Inter praecipuas. ~ Erectionis provinciae ecclesiasticae / Sancti Christophori de Habana',
    evidence: "AAS 17 (1925) p. 289 (PDF page 289 of AAS-17-1925-ocr.pdf, read 2026-09-21), the first page of the fascicle of 1 July "
      + "1925, prints 'ACTA PII PP. XI / CONSTITUTIO APOSTOLICA / SANCTI CHRISTOPHORI DE HABANA / ERECTIONIS PROVINCIAE ECCLESIASTICAE "
      + "SANCTI CHRISTOPHORI DE HABANA / PIUS EPISCOPUS / SERVUS SERVORUM DEI / AD PERPETUAM REI MEMORIAM / Inter praecipuas Apostolicae "
      + "Sedis curas haec quoque constans fuit' (the OCR's `CHEISTOPHOEI` in the first heading line); dated at p. 290 'Datum Romae apud "
      + "Sanctum Petrum, anno Domini millesimo nongentesimo vigesimo quinto, die sexta mensis ianuarii, Pontificatus Nostri anno "
      + "tertio' -- 6 January 1925, as the index prints. The recovery found the incipit at p. 289 and refused it because the OCR of the "
      + "running header reads 'Annus XVII-Toi. XVII 1 Iulii 1925 Num, 9'. No shelf record carries the act (`inter-praecipuas-1923` is "
      + "the constitution of 11 June 1923 for Caracas). The index's OCR sets this entry's `289` on the line of the entry after it, "
      + "*Ex Apostolico officio* (27 March 1925, the diocese of Valença), which opens at p. 516 ('II / VALENTINA IN BRASILIA / ERECTIONIS "
      + "DIOECESIS / … / Ex Apostolico officio Nobis commisso', dated at p. 519 'die vigesima septima mensis martii'); the two entries "
      + 'cite one page and invariant 25 holds both until a page correction can be curated, as *Casti connubii* (1930) is held.',
  },
  '1925|1925-06-10|CONSTITUTIONES APOSTOLICAE|Vertit in animarum|Dismembrationis et unionis partis territorii dioecesium Medi': {
    page: 569,
    indexLine: '1925 iunii 10 Vertit in animarum. - Dismembrationis et unionis partis / territorii dioecesium Mediolanensis et Papiensis',
    evidence: "AAS 17 (1925) p. 569 (PDF page 569 of AAS-17-1925-ocr.pdf, read 2026-09-21) prints, below the end of the constitution "
      + "before it, 'IV / MEDIOLANEN, ET PAPIEN. / DISMEMBRATIONIS ET UNIONIS / PIUS EPISCOPUS / SERVUS SERVORUM DEI / AD PERPETUAM REI "
      + "MEMORIAM / Vertit in animarum bonum ut paroeciae, quae ab habituali sui Ordinarii residentia distant'; dated at p. 570 'Datum "
      + "Romae apud Sanctum Petrum, anno Domini millesimo nongentesimo vigesimo quinto, die decima mensis iunii, Pontificatus Nostri "
      + "anno quarto' (the OCR's `Eomae`) -- 10 June 1925, as the index prints. The recovery found the incipit at p. 569 only, outside "
      + "the constitutions' run of the Index generalis. No shelf record carries the act.",
  },
};

export interface CuratedReference {
  acta: { series: 'AAS'; volume: number; year: number; part?: 'I' | 'II'; page: number };
  /**
   * The reference key (`AAS:{volume}:{page}`, overrideKey) of the matched entry this
   * reference displaces -- allowed only with evidence in the row that the displaced entry
   * is not the act's citation of record (controller ruling 15). The match moves to
   * `superseded` (join.ts); a key that names no match of the document is a stale row.
   */
  supersedes?: string;
  /** Where the page was read and what it prints, and the act's own dating formula. */
  evidence: string;
}

/**
 * References no index entry can give: the constitution that promulgates a Code opens the
 * Code's own volume, which has no chronological index (AAS 9-II, 1917; AAS 75-II, 1983);
 * and the Latin printing of an encyclical whose index line lost its date columns and opens
 * no entry, while the vernacular printing's entry matched the shelf record (AAS 14 (1922)
 * 673, *Ubi arcano Dei consilio*). Applied after the join (applyActa); a document the join
 * has also matched is an error unless the row names that match in `supersedes`.
 */
export const ACTA_CURATED_REFERENCES: Readonly<Record<string, CuratedReference>> = {
  'mag:benedict-xv/providentissima-mater-1917': {
    acta: { series: 'AAS', volume: 9, year: 1917, part: 'II', page: 5 },
    evidence: "AAS 9 (1917) part II (AAS-09-II-1917-ocr.pdf, 594 pages, PDF page 5 read with pypdf on 2026-09-21) opens at p. 5 with "
      + "'VENERABILIBVS FRATRIBVS ET DILECTIS FILIIS PATRIARCHIS, PRIMATIBVS, ARCHIEPISCOPIS, EPISCOPIS ALIISQVE ORDINARIIS AC PRAETEREA "
      + "CATHOLICARVM STUDIORVM VNIVERSITATVM AC SEMINARIORVM DOCTORIBVS ATQVE AVDITORIBVS. / BENEDICTVS EPISCOPVS / SERVVS SERVORVM DEI / "
      + "AD PERPETVAM REI MEMORIAM. / Providentissima Mater Ecclesia, ita a Conditore Christo constituta' (the drop capital P is not in "
      + "the text layer; the running header of p. 7 reads 'Constitutio Apostolica 7', that of p. 6 'Codex Iuris Canonici'), dated at "
      + "p. 8 'Datum Romae apud S. Petrum die festo Pentecostes anno millesimo nongentesimo decimo septimo, Pontificatus Nostri tertio' "
      + "-- Pentecost, 27 May 1917: the promulgation of the Codex Iuris Canonici that fills the rest of the part, which has no "
      + "chronological index (tools/fixtures/acta/README.md). *Sacrae disciplinae leges* (25 January 1983) opens AAS 75 (1983) part II "
      + "at pp. VII-XIV, Roman-numbered (README.md, the 1979-2014 report), which `acta.page` cannot carry: no reference, recorded here.",
  },
  // Controller ruling 15 (phase 2b-iii-b, Task 9 fix round 1): the 1922 index's line for the
  // Latin prints no date and opens no entry (index.ts: a line outside any entry), so no
  // reading or correction can name it, and the 1923 index's entry for the Italian printing
  // matched the shelf record by date and class. The Latin is the citation of record.
  'mag:pius-xi/ubi-arcano-dei-consilio-1922': {
    acta: { series: 'AAS', volume: 14, year: 1922, page: 673 },
    supersedes: 'AAS:15:5',
    evidence: "AAS 14 (1922) p. 673 (PDF page 673 of AAS-14-1922-ocr.pdf, read 2026-09-21), the first page of the fascicle of 27 "
      + "December 1922, prints 'ACTA PII PP. XI / LITTERAE ENCYCLICAE / AD VENERABILES FRATRES PATRIARCHAS, PRIMATES, ARCHIEPISCOPOS, "
      + "EPISCOPOS, ALIOSQUE LOCORUM ORDINARIOS PACEM ET COMMUNIONEM CUM APOSTOLICA SEDE HABENTES: DE PACE CHRISTI IN REGNO CHRISTI "
      + "QUAERENDA. / PIUS PP. XI / … / Ubi arcano Dei consilio ac nutu Nos, qui nullis sane meritis commendaremur'; dated at p. 700 "
      + "'Datum Romae apud Sanctum Petrum, die xxiii Decembris MDCCCCXXII, Pontificatus Nostri anno primo' -- 23 December 1922, the "
      + "shelf record's date (`mag:pius-xi/ubi-arcano-dei-consilio-1922`, encyclicals). The 1922 index enters it under `I. - LITTERAE "
      + "ENCYCLICAE` with no year, month or day on its line (`Ubi arcano Dei consilio. - Ad venerabiles fratres Pa­ / triarchas, "
      + "Primates, Archiepiscopos, Episcopos / aliisque locorum Ordinarios pacem et communio­ / nem cum Apostolica Sede habentes : de "
      + "pace Chri­ / sti in regno Christi quaerenda`, fixture aas-14-1922.txt lines 123-127), and the parser opens no entry for it. "
      + "The displaced match, AAS 15 (1923) p. 5 (PDF page 5 of AAS-15-1923-ocr.pdf, read 2026-09-21), the first page of the fascicle "
      + "of 15 January 1923, prints the Italian text: 'LETTERA-ENCICLICA / AI VENERABILI FRATELLI, PATRIARCHI, PRIMATI, ARCIVESCOVI, "
      + "VESCOVI ED ALTRI ORDINARI AVENTI PACE E COMUNIONE CON LA SEDE APOSTOLICA: SU LA RESTAURAZIONE DEL REGNO DI CRISTO PER LA "
      + "PACIFICAZIONE IN CRISTO. / PIO PP. XI / … / Fin dal primo momento in cui, per gli imperscrutabili disegni di Dio', which the "
      + "1923 index enters as `1922 dec. 23 Fin dal primo momento. - Ai venerabili fratelli Patriar­ / chi, Primati, Arcivescovi, "
      + "Vescovi ed altri Ordinari / aventi pace e comunione con la Sede Apostolica: / su la restaurazione del regno di Cristo per la "
      + "pacifi­ / cazione in Cristo .` -- one act, two printings: the Latin page is the citation, as for the vernaculars of 1929, "
      + "1933 and 1937 (ACTA_HOLDS).",
  },
};

export interface AssReading {
  /** The pope as popes.ts labels him ('Leo XIII'). */
  pope: string;
  /** The class heading as the volume prints it, normalised ('EPISTOLA ENCYCLICA'). */
  category: string;
  /** ISO date from the act's own dating formula, or `????-??-??` when the act prints none. */
  date: string;
  /** The first eight words after the salutation, as printed. */
  opening: string;
  description: string;
  /** The heading, salutation, opening and dateline as the volume prints them, and where they were read (the store text, page and lines). */
  evidence: string;
}

/**
 * The papal acts of the ASS the scanner (ass.ts) missed or misread, read by hand in the
 * store text (ass volumes spec §6): keyed `ASS:{volume}:{page}`, the page the act opens on.
 * A row is applied by the loader (join.ts) as an entry with `anchor: 'reading'` -- added
 * where the scan has no entry at the page, replacing the scanned entry where it has one --
 * and is stale (a hard error) unless it answers a finding (the controller's ruling of the
 * Task 4 fix round, which Task 5 implements): its page is a scanned entry's page, an
 * unclaimed summa row's page, a defect's page, or -- for a `no-heading` defect, whose page
 * is the anchor's -- any page from the previous anchor's page through the defect's page; or
 * the volume's scan and summa are both empty (ASS 1). Every row names why the scan missed
 * the act.
 */
export const ASS_READINGS: Readonly<Record<string, AssReading>> = {
  // Phase 2c-i, Task 4 (the first curation round): read in the store text on 2026-09-21 at
  // the page the act opens on. The page in the key is the PDF page, which equals the printed
  // page in every sample volume; `evidence` quotes the lines and names the finding the row
  // answers -- a defect of the scan, an unclaimed summa row, or a scanned entry misread.
  // ASS 1 (1865-66): the scan reads no act and the summa has no papal part (its rows sit
  // under the dicasteries), so the volume's three papal acts are read by hand under the
  // ruling's last clause.
  'ASS:1:193': {
    pope: 'Pius IX', category: 'ALLOCUTIO', date: '1865-09-25',
    opening: 'Multiplices inter machinationes artesque, quibus Christiani nominis hostes',
    description: 'SS. D. N. PII PAPAE IX HABITA IN CONSISTORIO SECRETO DIE XXV SEPTEMBRIS MDCCCLXV.',
    evidence: "ASS 1 (1865) 193-197, ass-01-1865.txt. p. 193 l. 2 'EX ACTIS COMTOBIALIBE' (the running head, the OCR's reading of CONSISTORIALIBUS), ll. 6-10 'SANCTISSIMI DOMINI NOSTRI / PII / DIVINA PROVIDENTIA / PAPAE IX.', l. 12 'ALLOCVTIO' (the OCR's V for U), l. 14 'HABITA IN CONSISTORIO SECRETO', l. 17 'DIE XXV SEPTEMBRIS MDCCCLXV.', l. 21 'VENERABILES FRATRES', l. 22 '« Multiplices inter machinationes artesque, quibus Christiani / nominis hostes adoriri Ecclesiam Dei'; no dateline (an allocution), dated from its heading, 25 September 1865; the running heads of the following pages read '194 ALLOCUTIO SS. D. N. PII PAPAE IX.'. Why the scan missed it: `ALLOCVTIO` is no class heading (one line in the sample), so no heading anchor; and ASS 1's summa (pp. 747-752) has no papal part -- its row ('Allocutio SSmi, qua iterum reprobantur et damnantur Massonicae sectae. 193') sits under EX ACTIS CONSISTORIALIBUS -- so the scan and the summa both leave the volume empty (the ruling's last clause).",
  },
  'ASS:1:578': {
    pope: 'Pius IX', category: 'LITTERAE APOSTOLICAE', date: '1866-02-12',
    opening: 'Gravissimum supremi Nostri Apostolici ministerii munus omnino postulat,',
    description: 'Litterae Apostolicae in forma Brevis quibus Romanae ephemeridi cui titulus La Civiltà Cattolica perennitati et perpetuitati consulitur (the editor\'s preface, p. 577).',
    evidence: "ASS 1 (1865) 577-581, ass-01-1865.txt. p. 577 l. 4 'LITERA E APOSTOLICAE,' (the volume's single-T spelling, OCR-split) then the editor's preface, l. 12 'Sequentes Apostolicas Literas in forma Brevi expeditas re- / ferimus, quibus Sanctissimus Dominus Noster … praeclarissima encomiis Romanae ephemeridi / cui titulus - LA CIVILTÀ CATTOLICA - merito tributis, eiusdem peren- / nitati, et perpetuitati consulere dignatus est.'; the act opens p. 578 (running head '578 LITERAE APOSTOLICAE.'): l. 2 'PIUS PP. IX.', l. 3 'AD PERPETUAM REI MEMORIAM.', l. 4 '« Gravissimum supremi Nostri Apostolici ministerii munus / omnino postulat, ut intentissimo studio'. Dated p. 581 ll. 26-28 'Datum Romae apud S. Petrum sub Annulo Piscatoris die XII. / Februarii Anno MDCCCLXVI. Pontificatus Nostri Anno Vicesimo. / Locus*Sigilli PIUS PP. IX.'. Why the scan missed it: `LITERAE APOSTOLICAE` is no class heading of the list (the volume's spelling; two acts in ASS 1, none elsewhere), so the anchor at p. 581 found no heading (the no-heading defect at 581, the anchor's page) and its summa row sits under EX SECRETARIA BREVIUM: the scan and the summa both leave the volume empty (the ruling's last clause). Keyed 578, where the act itself opens after the preface.",
  },
  'ASS:1:744': {
    pope: 'Pius IX', category: 'LITTERAE APOSTOLICAE', date: '1866-04-13',
    opening: 'Quamvis Urbs Roma Beatissimos Apostolorum Principes tamquam praecipuos',
    description: 'Litterae Apostolicae in forma Brevis quibus S. Catharina Senensis inter secundarios Almae Urbis coelestes Patronos recensetur (the editor\'s preface, p. 744).',
    evidence: "ASS 1 (1865) 744-746, ass-01-1865.txt. p. 744 l. 2 'Il SECRETARIA BREVIUM.' (the part's running head), l. 8 'LITERAE APOSTOLICAE,' (the volume's single-T spelling) then the editor's preface, l. 11 'Quamvis iam Decretum retulerimus pag. 630, quo SSmus / Dominus Noster electam Virginem S. Catharinam Senensem in- / ter secundarios Almae Urbis coelestes Patronos recensendam / declaravit; praetermittere tamen nolumus Apostolicas Literas in / forma Brevis', l. 28 'Literae autem Apostolicae sunt sequentis tenoris.', l. 31 'PIUS PP. IX.', l. 32 'AD PERPETUAM REI MEMORIAM.', l. 33 '« Quamvis Urbs Roma Beatissimos Apostolorum Principes tam* / quam praecipuos Patronos suos veneretur'. Dated p. 746 ll. 10-11 'Datum Romae apud S. Petrum sub annulo Piscatoris die XIII. / Aprilis Anno MDCCCLXV1. Pontificatus Nostri Anno Vigesimo.' (the OCR's `1` for `I`). Why the scan missed it: as ASS:1:578 -- `LITERAE APOSTOLICAE` is no class heading, the anchor at p. 746 found no heading (the no-heading defect at 746), the summa lists it under EX SECRETARIA BREVIUM; the scan and the summa both leave the volume empty (the ruling's last clause). Keyed 744, where the heading, the preface and the act's own first words all stand.",
  },
  'ASS:12:3': {
    pope: 'Leo XIII', category: 'LITTERAE', date: '1879-06-01',
    opening: 'Ingens Nobis attulit gaudium pastoralis sollicitudo vestra, Venerabiles',
    description: 'SSMI D. N. LEONIS XIII AD ARCHIEPISCOPOS ET EPISCOPOS ECCLESIASTICARUM PROVINCIARUM TAURINI, VERCELLAE ET GENUAE.',
    evidence: "ASS 12 (1879) 3-12, ass-12-1879.txt. Printed in Italian with the Latin version below it page by page: p. 3 ll. 3-11 'LETTERA / DI / SUA SANTITÀ PAPA LEONE XIII / AGLI ARCIVESCOVI E VESCOVI DELL' ECCLESIASTICHE PROVINCIE / DI TORINO. VERCELLI E GENOVA.', l. 14 'Venerabili Fratelli', l. 16 'Ci siamo grandemente compiaciuti della vostra pastorale solle-'; the Latin at l. 27 '(Versio latina) LITTERAE / SSMI D. N. LEONIS XIII / AD ARCHIEPISCOPOS ET EPISCOPOS ECCLESIASTICARUM PROVINCIARUM / TAURINI, VERCELL-AE ET GENUAE.', l. 35 'Venerabiles Fratres', l. 37 'Ingens Nobis attulit gaudium pastoralis sollicitudo vestra, Ve- / nerabiles Fratres'. Dated p. 12 l. 40 'Romae ex Aedibus Vaticanis, die Pentecostes, 1 Iunii 1879.' (the Italian at l. 19 'Roma dal Vaticano, il giorno di Pentecoste, 1 Giugno 1879.'). Why the scan missed it: the dateline prints neither `Pontificatus Nostri` nor the pope's signature within four lines, so nothing anchors it. Answers the summa's unclaimed row p. 3 ('Litterae SSmi D. N. Leonis XIII ad Archiepiscopos et Episcopos Ecclesiasticarum Provinciarum Taurini, Vercellarum et Genuae').",
  },
  'ASS:23:206': {
    pope: 'Leo XIII', category: 'LITTERAE ENCYCLICAE', date: '1890-10-15',
    opening: 'Ab apostolici Solii celsitudine, ubi Nos ad prospiciendum',
    description: 'SS. D. N. Leonis XIII ad Episcopos, Clerum et Populum Italiae.',
    evidence: "ASS 23 (1890) 206-222, ass-23-1890.txt. p. 206 l. 15 '(Versio latina)', ll. 17-18 'LITTERAE Encyclicae SS. D. N. Leonis XIII ad Episcopos, Clerum / et Populum Italiae.', l. 20 'Ab apostolici Solii celsitudine, ubi Nos ad prospiciendum'; no salutation line. Dated p. 222 'Datum Romae apud Sanet. Petrum Idibus Octobris anno / MDCCCLXXXX. Pontificatus nostri XIII.': the Ides of October, 15 October 1890 -- the date the Italian text prints at p. 206 l. 8 ('Dato a Roma presso S. Pietro, li 15 Ottobre 1890'). The Latin version of the Italian encyclical the scan reads at p. 193 (`LETTERA Enciclica … Dall' alto dell' Apostolico seggio`): one act, two printings. Why the scan missed the date: the Ides form is not read by rule. Answers the scan's no-date defect at p. 206 and the summa's row p. 206 ('Versio latina earumdem litterarum').",
  },
  'ASS:23:318': {
    pope: 'Leo XIII', category: 'LITTERAE', date: '1890-11-20',
    opening: 'Novum argumentum perspecti tui erga hanc Apostolicam Sedem',
    description: 'Sanctissimi Patris N. Leonis XIII ad Emum Archiepiscopum florentinum quoad cultum sacrae Familiae praestandum. — Adiicitur formula consecrationis familiarum et oratio quotidie recitanda.',
    evidence: "ASS 23 (1890) 318-319, ass-23-1890.txt. p. 318 l. 1 '-318' (the running header, the OCR's stray hyphen before the number), ll. 3-5 'LITTERAE Sanctissimi Patris N.Leonis XIII ad Emum Archiepiscopum floren- / tinum quoad cultum sacrae Familiae praestandum. — Adiicitur formula / consecrationis familiarum et oratio quotidie recitanda.', l. 10 'Novum argumentum perspecti tui erga hanc Apostolicam'; no salutation line. Dated p. 319 ll. 22-23 'Datum Romae apud S. Petrum die xx Novembris Anno / MDCCCXC, Pontificatus Nostri Decimotertio.', signed 'LEO PAPA XIII.'. Why the scan refused it: the header token `-318` carries an extra character and headerAgrees (recover.ts) refuses it; the PDF page is the printed page. Answers the scan's header-mismatch defect at p. 318 and the summa's row p. 318.",
  },
  'ASS:23:427': {
    pope: 'Leo XIII', category: 'LITTERAE APOSTOLICAE', date: '1890-11-12',
    opening: 'Religiosus Ordo Benedicti Patris de rationibus Ecclesiae reique',
    description: 'Sanctissimi D. N. Leonis XIII de regimine et disciplina Congregationis Anglo-Benedictinae novanda.',
    evidence: "ASS 23 (1890) 427, ass-23-1890.txt. p. 427 ll. 3-4 'LITTERAE APOSTOLICAE Sanctissimi D. N. Leonis XIII de regimine et / disciplina Congregationis Anglo-Benedictinae novanda.', l. 5 'LEO EPISCOPUS', l. 6 'SERVUS SERVORUM DEI', l. 7 'ad perpetuam rei memoriam', l. 9 'Religiosus Ordo Benedicti Patris de rationibus Ecclesiae rei- / que publicae'. Dated (the dateline the scan quoted in its defect) 'Datum Romae apud S. Petrum, Anno Incarnationis Dominicae Millesimo Octingentesimo Nonagésimo, Pridie Idus Novembris Pontificatus Nostri anno XIII.': the day before the Ides of November, 12 November 1890. Why the scan missed the date: the Ides form is not read by rule. Answers the scan's no-date defect at p. 427 and the summa's row p. 427.",
  },
  'ASS:23:513': {
    pope: 'Leo XIII', category: 'LITTERAE APOSTOLICAE', date: '1890-11-08',
    opening: 'Praeclara inter monumenta, quae maiorum pietas in Italia',
    description: 'Sanctissimi D. N. Leonis XIII; de iuribus Archiepiscopi bariensis et privilegiis magni Prioris Basilicae s. Nicolai.',
    evidence: "ASS 23 (1890) 513-518, ass-23-1890.txt. p. 513 ll. 3-4 'LITTERAE apostolicae Sanctissimi D. N. Leonis XIII ; de iuribus Archiepi- / scopi bariensis et privilegiis magni Prioris Basilicae s. Nicolai.', l. 12 'Praeclara inter monumenta, quae maiorum pietas iii Italia' (the OCR's `iii` for `in`); no salutation line. Dated p. 517 l. 41 - p. 518 l. 3 'Datum Romae apud S. Petrum, Anno Incarnationis Domi- / [p. 518] nicae Millesimo Octingentesimo Nonagésimo, Sexto Idus Novem- / bris, Pontificatus Nostri anno XIII.': the sixth day before the Ides of November, 8 November 1890. Why the scan missed it: the dateline crosses the page break, so `Pontificatus Nostri` is not within the anchor's window, and the Ides form is not read by rule. Answers the summa's unclaimed row p. 513.",
  },
  'ASS:23:522': {
    pope: 'Leo XIII', category: 'MOTU PROPRIO', date: '1891-03-14',
    opening: 'Ut mysticam Sponsam Christi, qui lux vera est,',
    description: 'Sanctissimi D. N. Leonis XIII; de vaticana specula astronomica restituenda et amplificanda.',
    evidence: "ASS 23 (1890) 522-526, ass-23-1890.txt. p. 522 ll. 37-38 'MOTU-PRQPRIO Sanctissimi D. N. Leonis XIII ; de vaticana specula astro- / nomica restituenda et amplificanda.' (the OCR's `PRQPRIO`, the hyphenated class the running heads print too: `MOTU-PROPRIO 525`), l. 40 'Ut mysticam Sponsam Christi, qui lux vera est, in contem- / ptum'; no salutation line. Dated p. 526 ll. 18-19 'Datum Romae apud S. Petrum die xiv Martii anno MDCCCXCI, / Pontificatus Nostri decimo quarto.', signed 'LEO PP. XIII.'. Why the scan missed it: `MOTU-PRQPRIO` is no class heading (one act in the sample: a reading, not a spelling), so the anchor at p. 526 walked back to the previous anchor and found no heading. Answers the scan's no-heading defect at p. 526 (the anchor's page; the act opens at 522) -- the summa's own row (`Motu-Proprio … 522`, summa p. 753) is lost in the OCR's word-by-word interleaving of that page's two columns.",
  },
  'ASS:33:341': {
    pope: 'Leo XIII', category: 'CONSTITUTIO APOSTOLICA', date: '1900-12-08',
    opening: 'Conditae a Christo Ecclesiae ea vis divinitus inest',
    description: 'Sanctissimi Domini Nostri Leonis Divina Providentia Papae XIII de Religiosorum Institutis vota simplicia profitentium.',
    evidence: "ASS 33 (1900) 341-347, ass-33-1900.txt. p. 341 ll. 3-4 'CONSTITUTIO APOSTOLICA Sanctissimi Domini Nostri Leonis Divina Providentia / Papae XIII de Religiosorum Institutis vota simplicia profitentium.', l. 7 'LEO EPISCOPUS', l. 9 'SERVUS SERVORUM DEI', l. 10 'Ad perpetuam rei memoriam.', l. 12 'Conditae a Christo Ecclesiae ea vis divinitus inest ac fe- / cunditas'. Dated p. 347 ll. 26-28 'Datum Romae apud Sanctum Petrum anno Incarnationis / Dominicae millesimo noningentésimo, sexto idus décembres, / Pontificatus Nostri vicesimo tertio.': the sixth day before the Ides of December, 8 December 1900. Why the scan missed the date: the Ides form is not read by rule. Answers the scan's no-date defect at p. 341 and the summa's row p. 341.",
  },
  'ASS:33:349': {
    pope: 'Leo XIII', category: 'LITTERAE', date: '1900-12-25',
    opening: 'Temporis quidem sacri, quod solemni caeremoniarum religione hesterno',
    description: 'SS.mi D. N. Leonis, quibus universalis iubilaeus in urbe celebratus anno Domini millesimo nonigentesimo ad universum catholicum orbem extenditur.',
    evidence: "ASS 33 (1900) 349-355, ass-33-1900.txt. p. 349 l. 1 '5' (the running header, the OCR's reading of 349), ll. 3-4 'LITTERAE SS.mi D. N. Leonis, quibus universalis iubilaeus in urbe celebratus anno / Domini millesimo nonigentesimo ad universum catholicum orbem extenditur.', l. 6 'LEO EPISCOPUS', l. 8 'SERVUS SERVORUM DEI', ll. 9-10 'Universis christifidelibus praesentes litteras inspeeturis / salutem et apostolicam benedictionem.', l. 12 'Temporis quidem sacri, quod solemni caeremoniarum re- / ligione hesterno die conclusimus'. Dated p. 355 ll. 2-4 'Datum Romae apud S. Petrum Anno Incarnationis Domi- / nicae Millesimo nongentesimo, Octavo Calendas Ianuarii, Pon- / tificatus Nostri anno vicesimo tertio.': the eighth day before the Kalends of January, 25 December 1900. Why the scan missed the date: the Kalends form is not read by rule. Answers the scan's no-date defect at p. 349 and the summa's row p. 349.",
  },
  'ASS:33:355': {
    pope: 'Leo XIII', category: 'LITTERAE', date: '1900-12-23',
    opening: "Au milieu des consolations que Nous procurait l'Année",
    description: 'SS.mi D. N. Leonis XIII ad E.mum Archiepiscopum Parisiensem quoad religiosorum Congregationes in Gallia.',
    evidence: "ASS 33 (1900) 355-363, ass-33-1900.txt. p. 355 l. 1 'LITTERAE 555' (the running header, the OCR's `5` for `3`), ll. 23-24 'LITTERAE SS.mi D. N. Leonis Xlil ad E.mum Archiepiscopum Parisiensem / quoad religiosorum Congregationes in Gallia.', l. 26 \"Au milieu des consolations que Nous procurait l'Année / Sainte par le pieux empressement des pèlerins\"; no salutation line. Dated p. 363 \"Donné à Rome, près de Saint-Pierre, le 23 Décembre de / l'an 1900, de Notre Pontificat le vingt-troisième.\", signed 'LEO PP. XIII.'. Why the scan refused it: the header's `555` is another number to headerAgrees (recover.ts); the PDF page is the printed page. Answers the scan's header-mismatch defect at p. 355 and the summa's row p. 355.",
  },
  'ASS:33:385': {
    pope: 'Leo XIII', category: 'EPISTOLA ENCYCLICA', date: '1901-01-18',
    opening: 'Graves de communi re oeconomica disceptationes, quae non',
    description: 'Sanctissimi Domini Nostri Leonis divina providentia Papae XIII de democratia christiana.',
    evidence: "ASS 33 (1900) 385-396, ass-33-1900.txt. p. 385 l. 1 '585' (the running header, the OCR's `5` for `3`), ll. 3-4 'EPISTOLA ENCYCLICA Sanctissimi Domini Nostri Leonis divina providentia Pa- / pae XIII de democratia christiana.', l. 8 'Graves de communi re oeconomica disceptationes, quae'; no salutation line. Dated p. 396 ll. 5-6 'Datum Romae apud Sanctum Petrum die 18 ianuarii an- / no 1901, Pontificatus Nostri vicesimo tertio.', signed 'LEO PP. XIII'. Why the scan refused it: the header's `585` is another number to headerAgrees (recover.ts); the PDF page is the printed page. Answers the scan's header-mismatch defect at p. 385 and the summa's row p. 385.",
  },
  'ASS:33:449': {
    pope: 'Leo XIII', category: 'LITTERAE', date: '1901-02-11',
    opening: 'In maximis occupationibus variisque acerbitatibus solatium Nobis non',
    description: 'SS.mi Patris Leonis XIII ad E.mum Archiepiscopum Vestmonasteriensem et ad alios Provinciae Episcopos de catholicismo liberali et rationalismo.',
    evidence: "ASS 33 (1900) 449-450, ass-33-1900.txt. p. 449 l. 1 'U9' (the running header, the OCR's reading of 449), ll. 3-4 'LITTERAE SS.mi Patris Leonis Xiil ad E.mum Archiepiscopum Vestmonasterien - / sem et ad alios Provinciae Episcopos de catholicismi) liberali et rationalismo.', ll. 7-8 'Venerabiles Fratres / Salutem et Apostolicam Benedictionem.', l. 10 'In maximis occupationibus variisque acerbitatibus solatium'; no salutation line. Dated p. 450 ll. 38-39 'Datum Romae apud Sanctum Petrum, die 11 februarii 1901, / anno Pontificatus Nostri vicesimo tertio.', signed 'LEO PP. XIII.'. Why the scan refused it: the header's `U9` is two characters from 449 and headerAgrees (recover.ts) admits one; the PDF page is the printed page. Answers the scan's header-mismatch defect at p. 449 and the summa's row p. 449.",
  },
  'ASS:33:643': {
    pope: 'Leo XIII', category: 'LITTERAE', date: '1901-06-09',
    opening: 'Iucundas scito Nobis communes litteras vestras fuisse. Memoriam',
    description: 'SSmi D. N. Leonis XIII ad Herbertum Story Praefectum et Vice-Cancellarium, item Rectorem, Doctores atque auditores Universitatis Studiorum Glasgaensis (Glascow), recolentes his diebus annum 450 ab institutione istius universitatis.',
    evidence: "ASS 33 (1900) 643-644, ass-33-1900.txt. p. 643 ll. 29-32 'IITTERAE SSmi D. N. Leonis XIII ad Herbertum Story Praefectum et Vice-Cancel- / larium, item Rectorem, Doctores atque auditores Universitatis Studiorum Glas- / gaensis (Glascow), recolentes his diebus annum 450 ab institutione istius / universitatis.', l. 34 'Iucundas scito Nobis communes litteras vestras fuisse. Me- / moriam beneficiorum colere'; no salutation line. Dated p. 644 'Datum Romae apud S. Petrum die IX Iunii Anno MDCCCCL / Pontificatus Nostri vicesimo quarto (1).', signed 'LFO PP. XIII.': the OCR's `MDCCCCL` (1950) is `MDCCCCI`, 1901 -- the volume's second year, the twenty-fourth of the pontificate the dateline names, and the year of the 450th anniversary the heading names. Why the scan missed the date: the year read is outside the volume's bound, and the `L` for `I` is not among the numeral repairs (one act). Answers the scan's no-date defect at p. 643 and the summa's row p. 643.",
  },
  'ASS:41:3': {
    pope: 'Pius X', category: 'LITTERAE APOSTOLICAE', date: '1907-06-14',
    opening: 'Ea semper fuit Apostolicae Sedis peculiaris quaedam ac',
    description: 'SS. D. N. Pii div. prov. PP. X quibus ritus ruthenus constituitur in Statibus foederatis Americae Septentrionalis.',
    evidence: "ASS 41 (1908) 3-12, ass-41-1908.txt. p. 3 l. 3 'LITTERAE APOSTOLICAE', ll. 4-5 'SS. D. N. Pii div. prov. PP. X quibus ritus ruthenus consti- / tuitur in Statibus foederatis Americae Septentrionalis.', l. 7 'PIUS EPISCOPUS', l. 8 'SERVUS SERVORUM DEI', l. 9 'Ad perpetuam rei memoriam.', l. 11 'Ea semper fuit Apostolicae Sedis peculiaris quaedam ac / propria sollicitudo'. Dated p. 12 'Datum Romae, apud Sanctum Petrum, anno Incarnationis Dominicae millesimo nongentesimo septimo, decimo octavo calendas Iulias, die festo S. Basilii Magni, Pontificatus Nostri …': the eighteenth day before the Kalends of July, 14 June 1907. Why the scan missed the date: the Kalends form is not read by rule. Answers the scan's no-date defect at p. 3 and the summa's row p. 3.",
  },
  'ASS:41:195': {
    pope: 'Pius X', category: 'EPISTOLA', date: '1907-09-28',
    opening: 'Tempus propediem aderit, vestrae maxime genti expectatum, memoriam',
    description: 'Pii X ad Episcopos Hungariae pro solemniis septem saecularibus S. Elisabeth Hungaricae.',
    evidence: "ASS 41 (1908) 195-198, ass-41-1908.txt. p. 195 l. 16 'EPISTOLA', ll. 17-18 'Pii X ad Episcopos Hungariae pro solemniis septem saecu- / laribus S. Elisabeth Hungaricae.', ll. 19-23 the addressee in capitals ('DILECTIS FILIIS NOSTRIS / CLAUDIO S. R. E. PRESB. CARD. VASZARY ARCHIEP. STRIGONIENSI / …'), l. 24 'PIUS PP. X', ll. 25-26 'Dilecti Filii Nostri et Venerabiles Fratres, / salutem et Apostolicam benedictionem.', l. 27 'Tempus propediem aderit, vestrae maxime genti expecta- / tum, memoriam Sanctae Elisabethae'. Dated p. 198 ll. 8-9 'Datum rtomae apud S. Petrum , die xxvni Septem- / bris MCMVii, Pontificatus Nostri anno quinto.', signed 'PIUS PP. X'. Why the scan missed it: the OCR's `rtomae` for `Romae` is no anchor (one act). Answers the summa's unclaimed row p. 195.",
  },
  'ASS:41:298': {
    pope: 'Pius X', category: 'EPISTOLA', date: '1908-03-23',
    opening: 'Nunciasti nobis inter ceteras qui istic strenue pro',
    description: 'Qua Pius PP. X laudat edentes Commentaria a " Nova Gallia „ nuncupata.',
    evidence: "ASS 41 (1908) 298, ass-41-1908.txt. p. 298 ll. 1-3 '2 … Epistola' / '98' (the running header, its number split over two lines by the OCR), l. 4 'EPISTOLA', ll. 5-6 'Qua Pius PP. X laudat edentes Commentaria a \" Nova Gal- / lia „ nuncupata.', ll. 8-11 'VENERABILI FRATRI / LUDOVICO NAZARIO / ARCHIEPISCOPO QUEBECENSIUM.', l. 13 'PIUS PP. X', l. 14 'Venerabilis Frater, salutem et Apostolicam benedictionem.', l. 16 'Nunciasti nobis inter ceteras qui istic strenue pro reli- / gione operantur'. Dated p. 298 ll. 36-37 'Datum Romae apud Sanctum Petrum, die xxin Mar- / tii MCMViii, Pontificatus Nostri anno quinto.' (the OCR's `xxin` for `xxiii`), signed 'PIUS PP. X'. Why the scan refused it: the header's first line prints `2` alone and headerAgrees (recover.ts) reads the first line only; the PDF page is the printed page. Answers the scan's header-mismatch defect at p. 298 and the summa's row p. 298.",
  },
  'ASS:41:361': {
    pope: 'Pius X', category: 'EPISTOLA', date: '1908-05-17',
    opening: 'Le moment Nous parait venu de vous faire',
    description: 'Qua Pius PP. X reprobat Mutualitates ecclesiasticas sic dictas approbatas in Gallia.',
    evidence: "ASS 41 (1908) 361-364, ass-41-1908.txt. p. 361 l. 3 'EPISTOLA', ll. 4-5 'Qua Pius PP. X reprobat Mutualitates ecclesiasticas sic di- / ctas approbatas in Gallia.', l. 7 'PIUS PP. X', ll. 9-10 'A NOS TRÈS CHERS FILS / LES CARDINAUX', ll. 12-15 the four cardinals' names ('VICTOR-LUCIEN Card. LECOT, Archevêque de Bordeaux.' …), l. 17 'Nos très chers Fils,', l. 19 'Le moment Nous parait venu de vous faire connaître les / décisions'. Dated p. 364 ll. 14-15 \"Donné à Rome, 17 Mai de l'année 1908, de Notre Pon- / tificat la cinquième.\", signed 'PIUS PP. X'. Why the scan misread it: the cardinals' names, set in mixed case after a blank line below the caps addressee, are read as the opening (one act: the French addressee list); the reading replaces the scanned entry at p. 361, whose date and heading it keeps.",
  },
  'ASS:41:425': {
    pope: 'Pius X', category: 'CONSTITUTIO APOSTOLICA', date: '1908-06-29',
    opening: 'Sapienti consilio sa. me. Pontifex Xystus V, Decessorum',
    description: 'SS. D. N. Pii div. prov. Papae X, de Romana Curia.',
    evidence: "ASS 41 (1908) 425-440, ass-41-1908.txt. p. 425 l. 1 'CONSTITUTIO APOSTOLICA', l. 3 'SS. D. N. Pii div. prov. Papae X, de Romana Curia.', l. 5 'PIUS EPISCOPUS', l. 7 'SERVUS SERVORUM DEI', l. 9 'A d perpetuam rei memoriam.', l. 11 'Sapienti consilio sa. me. Pontifex Xystus V, Decessorum / vestigiis inhaerens'. Dated p. 440 'Datum Romae apud Sanctum Petrum, anno Incarnationis Dominicae millesimo nongentesimo octavo, die festo Sanctorum Apostolorum Petri et Pauli, III Kal. Iulias, Pontificatus …': the third day before the Kalends of July, 29 June 1908. Why the scan missed the date: the Kalends form is not read by rule. Answers the scan's no-date defect at p. 425; the summa (Index analyticus, p. 799) cites the constitution at `pag. 427`, two pages after its heading, and that row stays unclaimed.",
  },
  'ASS:41:495': {
    pope: 'Pius X', category: 'EPISTOLA', date: '1908-04-09',
    opening: 'Si vota semper, faustiore quavis ecclesiarum redeunte memoria',
    description: 'Pii X ob saecularia solemnia archidioecesis Neo-Eboracensis.',
    evidence: "ASS 41 (1908) 495-496, ass-41-1908.txt. p. 495 ll. 1-2 'Epistola … 5' / '49' (the running header, its number split over two lines by the OCR), l. 30 'EPISTOLA', l. 31 'Pii X ob saecularia solemnia archidioecesis Neo-Eboracensis.', ll. 32-34 'VENERABILI FRATRI / IOANNI M. FARLEY ARCHIEPISCOPO NEO—EBORACENSIUM / NEO—EBORACUM', l. 35 'PIUS PP. x', l. 36 'Venerabilis Frater, salutem et Apostolicam benedictionem.', l. 38 'Si vota semper, faustiore quavis ecclesiarum redeunte me- / moria , placet concipere'. Dated p. 496 ll. 18-19 'Datum Romae apud S. Petrum, die ix Aprilis MCMVIII, / Pontificatus Nostri anno quinto.'. Why the scan refused it: the header's first line prints `5` and headerAgrees (recover.ts) reads the first line only; the PDF page is the printed page. Answers the scan's header-mismatch defect at p. 495 and the summa's row p. 495.",
  },
  // Phase 2c-i, after the final review: the greeting broken before its `salutem` was a
  // scanner branch that fired once in the sample; the branch is gone and the act is read
  // by hand instead (spec §6: a shape that occurs once is a curated row, not a rule).
  'ASS:41:12': {
    pope: 'Pius X', category: 'EPISTOLA', date: '1905-06-08',
    opening: 'Quibus Nos litteris septuagesimum aetatis annum faustum et',
    description: 'Qua Pontifex grati animi sensus profitetur erga imperatorem Sinarum.',
    evidence: "ASS 41 (1908) 12-13, ass-41-1908.txt. p. 12 l. 27 'EPISTOLA', ll. 28-29 'Qua Pontifex grati animi sensus profitetur erga imperatorem / Sinarum.', l. 31 'AUGUSTISSIMO POTENTISSIMOQUE IMPERATORI SINARUM', l. 32 'PEKINUM', l. 33 'PIUS PP. x', ll. 34-35 'Augustissime et potentissime Imperator, / salutem et prosperitatem.', ll. 37-38 'Quibus Nos litteris septuagesimum aetatis annum faustum / et felicem Maiestati Suae Imperatrici Sinarum ominabamur,'. Dated p. 13 ll. 15-16 'Datum Romae apud S. Petrum, die VIII Iunii MDCCCCV, / Pontificatus Nostri anno secundo.'. Why the scan misread it: the greeting is broken before its `salutem`, and its first line ('Augustissime et potentissime Imperator,') carries none of the vocabulary the greeting rule knows, so the preamble skip stops there and the opening is read from the greeting itself. One act of the sample prints the shape (p. 18 l. 13 sets the same greeting on one line, which the rule reads whole), so it is read here rather than given a rule. Answers the scanned entry at p. 12, whose opening it replaces.",
  },
  'ASS:41:555': {
    pope: 'Pius X', category: 'EXHORTATIO', date: '1908-08-04',
    opening: 'Haerent animo penitus, suntque plena formidinis, quae gentium',
    description: 'AD CLERUM CATHOLICUM SS. D. N. Pii div. prov. Papae X in quinquagesimo natali sacerdotii sui.',
    evidence: "ASS 41 (1908) 555-577, ass-41-1908.txt. p. 555 l. 4 'EXHORTATIO AD CLERUM CATHOLICUM', ll. 6-7 'SS. D. N. Pii div. prov. Papae X in quinquagesimo natali / sacerdotii sui.' (after a blank line), l. 9 'PIUS PP. X', l. 10 'Dilecti Filii, salutem et Apostolicam benedictionem.', l. 12 'Haerent animo penitus, suntque plena formidinis, quae / gentium Apostolus'. Dated p. 577 ll. 26-27 'Datum Romae, apud Sanctum Petrum, die iv Augusti / anno MCMVIII, Pontificatus Nostri ineunte sexto.', signed 'PIUS PP. X.'. Why the scan missed it: the heading's block ends at the blank line before the by-line, and the by-line (mixed case) stands between the block and the salutation, so neither the block, the lines above it nor the salutation rule opens the act (one act in the sample); the anchor at p. 577 then found no heading. Answers the summa's unclaimed row p. 555 and the scan's no-heading defect at p. 577.",
  },
  'ASS:41:619': {
    pope: 'Pius X', category: 'CONSTITUTIO APOSTOLICA', date: '1908-09-29',
    opening: 'Promulgandi pontificias Constitutiones ac leges non idem semper',
    description: 'De promulgatione legum et evulgatione actorum S. Sedis.',
    evidence: "ASS 41 (1908) 619-620, ass-41-1908.txt. p. 619 l. 3 'CONSTITUTIO APOSTOLICA', l. 4 'De promulgatione legum et evulgatione actorum S. Sedis.', l. 6 'PIUS EPISCOPUS', l. 7 'SERVUS SERVORUM DEI', l. 8 'Ad perpetuam rei memoriam.', l. 10 'Promulgandi pontificias Constitutiones ac leges non idem / semper decursu temporis'. Dated p. 620 ll. 29-31 'Datum Romae apud S. Petrum, anno Incarnationis Do- / minicae millesimo nongentesimo octavo, in Kalendas Octo- / bres, Pontificatus Nostri sexto.': `in Kalendas` is the OCR's reading of `III Kalendas` (the volume reads `III` as `in` again at p. 298, `xxin` for `xxiii`), the third day before the Kalends of October, 29 September 1908 -- a literal `in Kalendas` is no Roman date. Why the scan missed the date: the Kalends form is not read by rule. Answers the scan's no-date defect at p. 619 and the summa's row p. 619.",
  },
};

export interface AssPageOffset {
  /** The PDF page range the offset holds over (inclusive), the store text's own page numbers. */
  from: number;
  to: number;
  /** The printed page minus the PDF page, over the range. */
  delta: number;
  /** The pages read to establish the range's bounds, quoted, and where. */
  evidence: string;
}

/**
 * The one genuine page offset the whole-series survey found (2c-ii Task 6, fix round 1):
 * ASS 7 (1872) skips printed pp. 496-497 in the scan, so PDF pp. 496-547 print two more
 * than the PDF page reads and `headerAgreesASS`'s relaxation, which reads a clean
 * digit-for-digit misread as OCR noise, would otherwise admit every one of them -- exactly
 * the guard `header-mismatch` exists to keep. Consulted by the ASS header check
 * (`assPageOffset`, ass.ts): inside a listed range the relaxation does not apply, and the
 * page is refused as `headerAgrees` alone refuses it. Keyed by volume; a volume may have
 * more than one range if a later survey finds one, so the value is an array.
 */
export const ASS_PAGE_OFFSETS: Readonly<Record<number, readonly AssPageOffset[]>> = {
  7: [{
    from: 496, to: 547, delta: 2,
    evidence: "ASS 7 (1872), ass-07-1872.txt (read 2026-09-23). PDF p. 495 prints '495' (correct, the last page "
      + "before the offset), PDF p. 496 prints '498 Litterae Apostolicae' (the offset begins: printed pp. 496-497 "
      + "are absent from the scan), and the +2 delta holds unbroken to PDF p. 547, which prints '549'; PDF p. 548 "
      + "prints '548' again (correct, the offset ends). The range sits inside the scanned body -- the volume's "
      + "summa begins at PDF p. 751 -- but no act opens in it today (its defects there are all `no-heading`), so "
      + "nothing downstream has yet recorded a page from inside it.",
  }],
};

/** The key of ACTA_INDEX_CORRECTIONS and ACTA_HOLDS: `{year}:{page}` for the AAS (the volume year and first page the index cites); `ASS:{volume}:{page}` for the ASS, whose volumes 2 and 3 share a year. */
export const curationKey = (e: { series?: string; volume?: number; year: number; page: number }): string =>
  e.series === 'ASS' ? `ASS:${e.volume}:${e.page}` : `${e.year}:${e.page}`;

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
  // Phase 2b-iii-b (AAS 1-17): the volumes of 1909-1925 set two short letters on one page
  // as the later ones do. Of the eight pages the era's index gives two acts each (seven of
  // them through the pages the recovery read back from the body: two incipits found on
  // one page), six were read in the store text on 2026-09-21 and print two acts; they are
  // the rows below. AAS 5 (1913) 361 opens *Eximiae caritatis* alone (the index's `361` for
  // the French letter *L'échéance jubilaire* is the OCR's; the letter opens at p. 362), and
  // AAS 2 (1910) 905 prints *Binas nuper* and *Communes litterae* both, but the second is
  // dated `die xxvi Octobris MDMX` at p. 906 where the index dittoes 13 October under the
  // first: a correction keyed `1910:905` would move both entries, so the page stays
  // uncurated and both letters held (the era report names it).
  'AAS:4:269': {
    documentIds: ['mag:pius-x/quae-tu-nuper-1911', 'mag:pius-x/praeclarum-sane-1911'],
    evidence: "AAS 4 (1912) p. 269 (PDF page 269 of AAS-04-1912-ocr.pdf, read 2026-09-21) prints 'EPISTOLAE. / I. / AD R. P. D. RUDOLPHUM "
      + "H1TTMAIR, EPISCOPUM LINCIENSEM, RESCRIBENS, EIUS PASTORALEM DILIGENTIAM LAUDAT. / Venerabilis Frater, salutem et apostolicam "
      + "benedictionem. — Quae tu nuper scripsisti ad Nos …', dated 'Datum Romae apud S. Petrum, die xx Decembris MCMXI, Pontificatus Nostri "
      + "anno nono. PIUS PP. X.', and, lower on the same page, 'IL / AD R. D. ANTONIUM FIAT, ANTISTITEM GENERALEM CONGREGATIONIS VINCENTIANAE, "
      + "MODERATOREM ARCHISODALITATIS AB AGONIA D. N. I. C. NUNCUPATAE, GRATULANDO RESCRIBIT. / Dilecte Fili, salutem et apostolicam "
      + "benedictionem. — Praeclarum sane munus cum pietatis tum etiam caritatis …' (dated at p. 270 'die xx Decembris MCMXI'). The index "
      + "prints neither page (`Dec. 20 Quae tu nuper. - Ad R. P. D. Rodulphum Hittmair, / Episcopum Linciensem, ob eius pastoralem diligen­ / "
      + "tiam, gratulationis ergo`, `Praeclarum sane. - Ad R. D. Antonium Fiat, Anti­ / stitem generalem Congregationis Vincentianae, mo­ / "
      + "deratorem Archisodalitatis ab agonia D. N. I. C. nun­ / cupatae, gratulandi causa`); both pages are the recovery's "
      + '(`aas-04-1912.pages.json`, rule `unique`).',
  },
  'AAS:5:424': {
    documentIds: ['mag:pius-x/iamdudum-noveramus-1913', 'mag:pius-x/levandis-opificum-1913'],
    evidence: "AAS 5 (1913) p. 424 (PDF page 424 of AAS-05-1913-ocr.pdf, read 2026-09-21) prints 'III. / AD CAROLUM CARD. DE HORNIG, "
      + "VESZPRIMIENSIUM EPISCOPUM, VIGESIMUM QUINTUM EPISCOPALIS MUNERIS ANNUM EXPLENTEM. / Dilecte Fili Noster, salutem et apostolicam "
      + "benedictionem. — Iamdudum noveramus te nullam unquam officii partem deserere …', dated 'Datum Romae apud S. Petrum, die i mensis "
      + "augusti anno MCMXIII, Pontificatus Nostri decimo. PIUS PP. X.', and, lower on the same page, 'IV. / AD R. P. D. MICHAELEM C. VASQUEZ, "
      + "EPISCOPUM TIT. LEGIONENSEM, PRAESIDEM VIRORUM COETUS REGENDO OPERI A LEONE XIII NUNCUPATO … / Venerabilis Frater, salutem et "
      + "apostolicam benedictionem. — Levandis opificum angustiis fovendaeque in iisdem religioni …' (dated at p. 425 'die i augusti MCMXIII'). "
      + "The index cites the first at 424 (`Aug. 1 Iamdudum noveramus. - Ad Carolum card. de Hornig, / Veszprimiensium episcopum, vigesimum "
      + "quintum / episcopalis muneris annum explentem 424`) and prints no page for the second (`Levandis opificum. - Ad R. P. D. Michaelem C. "
      + "Va- / squez, episcopum tit. Legionensem, praesidem vi­ / rorum coetus regendo Operi a Leone XIII nuncu­ / pato …`), which the recovery "
      + 'read back (`aas-05-1913.pages.json`, rule `unique`).',
  },
  'AAS:9-I:53': {
    documentIds: ['mag:benedict-xv/benigne-annuentes-1915', 'mag:benedict-xv/cum-in-sancta-1915'],
    evidence: "AAS 9-I (1917) p. 53 (PDF page 53 of AAS-09-I-1917-ocr.pdf, read 2026-09-21) prints 'IV / PLENARIA INDULGENTIA CONCEDITUR PRO "
      + "FESTO BB. AGATHANGELI ET CASSIANI. / BENEDICTUS PP. XV / Ad perpetuam rei memoriam. — Benigne annuentes piis precibus nobis "
      + "porrectis a Procuratore Generali Ordinis Minorum …', dated 'Datum Romae apud S. Petrum, sub annulo Piscatoris, die xi augusti MCMXV, "
      + "Pontificatus Nostri anno primo. P. CARD. GASPARRI, a Secretis Status.', and, lower on the same page, 'V / CONCEDUNTUR PLENARIAE ET "
      + "PARTIALES INDULGENTIAE SODALITATIBUS SUB TITULO « FOEDUS MISSAE QUOTIDIANAE » IN HIBERNIA ERECTIS VEL ERIGENDIS. / BENEDICTUS PP. XV / "
      + "Ad perpetuam rei memoriam. — Cum in sancta Altaris Hostia Christus Redemptor Noster …' (16 September 1915). The index cites the "
      + "first at 53 (`Aug. 11 Benigne annuentes. - Plenaria indulgentia conceditur / pro festo Bb. Agathangeli et Cassiani ..... 53`) and "
      + "prints no page for the second (`Sept. 16 Cum in sancta. - Conceduntur plenariae et partiales / indulgentiae sodalitatibus sub titulo "
      + "« Foedus Mis­ / sae quotidianae » in Hibernia erectis vel erigendis.`), which the recovery read back (`aas-09-1917-I.pages.json`, "
      + 'rule `unique`).',
  },
  'AAS:9-I:424': {
    documentIds: ['mag:benedict-xv/ad-augendam-fidelium-religionem-1917', 'mag:benedict-xv/ut-aucto-pastorum-numero-1917'],
    evidence: "AAS 9-I (1917) p. 424 (PDF page 424 of AAS-09-I-1917-ocr.pdf, read 2026-09-21) prints 'LITTERAE APOSTOLICAE / I / VISITANTIBUS, "
      + "CERTIS DIEBUS, ECCLESIAM PAROCHIALEM S. VINCENTII A PAULO IN CIVITATE NANCEYENSI INDULGENTIA PLENARIA IN PERPETUUM CONCEDITUR. / "
      + "BENEDICTUS PP. XV / Ad perpetuam rei memoriam. — Ad augendam fidelium religionem animarumque salutem procurandam …', dated 'Datum "
      + "Romae apud S. Petrum, sub annulo Piscatoris, die x iulii MCMXVII, Pontificatus Nostri anno tertio. P. CARD. GASPARRI, a Secretis "
      + "Status.', and, lower on the same page, 'II / ERIGITUR NOVA DIOECESIS DE WAGGA-WAGGA IN AUSTRALIA / BENEDICTUS PP. XV / Ad perpetuam "
      + "rei memoriam. — Ut, aucto Pastorum numero, potiore studio dominici gregis custodiae provideretur …' (10 July 1917). The index cites "
      + "the first at 424 (`Iul. 10 Ad augendam fidelium religionem. - Visitantibus, cer­ / tis diebus, ecclesiam parochialem S. Vincentii a / "
      + "Paulo in civitate Nanceyensi indulgentia plenaria in / perpetuum conceditur, .v 424`) and prints no page for the second (`Ut, aucto "
      + "Pastorum numero. - Erigitur nova dioecesis / de Wagga-Wagga in Australia. .......`), which the recovery read back "
      + '(`aas-09-1917-I.pages.json`, rule `unique`).',
  },
  'AAS:14:499': {
    documentIds: ['mag:pius-xi/felicis-exitus-1922', 'mag:pius-xi/dimisso-conventu-1922'],
    evidence: "AAS 14 (1922) p. 499 (PDF page 499 of AAS-14-1922-ocr.pdf, read 2026-09-21) prints 'IV / AD R. P. D. LUCAM PIERGIOVANNI, "
      + "EPISCOPUM CORNETANUM ET CENTUMCELLARUM, CETEROSQUE EPISCOPOS LATII SUPERIORIS: DE COMMUNI CONVENTU NUPER HABITO. / Venerabiles "
      + "fratres, salutem et apostolicam benedictionem. — Felicis exitus conventus, quem proxime celebraturi estis …', dated 'Datum Romae "
      + "apud Sanctum Petrum, die xvi maii MCMXXII, Pontificatus Nostri anno primo. PIUS PP. XI', and, lower on the same page, 'V / AD R. P. "
      + "D. IOANNEM BEDAM CARDINALE, ARCHIEPISCOPUM PERUSINUM, CETEROSQUE UMBRIAE EPISCOPOS: OFFICIOSIS LITTERIS RESPONDET EX ANNUO CONVENTU "
      + "DATIS. / Venerabiles fratres, salutem et apostolicam benedictionem. — Dimisso conventu, quem Asisii dudum egistis …' (dated at p. 500 "
      + "'die xviii maii MCMXXII'). The index prints neither page (`16 Felicis exitus. - Ad R. P. D. Lucam Piergiovanni, / episcopum Latii "
      + "superioris : de communi conventu / nuper habito`, `18 Dimisso conventu. - Ad R. P. D. Ioannem Bedam / Cardinale, archiepiscopum "
      + "Perusinum, ceterosque / Umbriae Episcopos: officiosis litteris respondet ex / annuo conventu datis .`); both pages are the recovery's "
      + '(`aas-14-1922.pages.json`, rule `unique`).',
  },
  'AAS:15:510': {
    documentIds: ['mag:pius-xi/probe-meminimus-1923', 'mag:pius-xi/quae-ab-initio-1923'],
    evidence: "AAS 15 (1923) p. 510 (PDF page 510 of AAS-15-1923-ocr.pdf, read 2026-09-21; the running header reads `5ie`) prints 'XIII / AD "
      + "MARIAM PRINCIPEM VIDUAM RADZIWILL: DE TEMPLO IN HONOREM SACRATISSIMI CORDIS IESU IN VARSAVIAE SUBURBIO EIUS SUMPTIBUS EXSTRUCTO. / "
      + "Dilecta in Christo filia, salutem et apostolicam benedictionem. — Probe meminimus, Nos, cum Nuntii Apostolici munere istic "
      + "fungeremur …', dated 'Datum Romae apud Sanctum Petrum, die xxiii mensis augusti, anno MDCCCCXXIII, Pontificatus Nostri secundo. PIUS "
      + "PP. XI', and, lower on the same page, 'XIV / AD R. P. D. ELIAM HUAYEK, PATRIARCHAM ANTIOCHENSEM MARONITARUM: AD GRATULANDUM QUINTUM AC "
      + "VICESIMUM PATRIARCHALIS DIGNITATIS ANNUM. / Venerabilis frater, salutem et apostolicam benedictionem. — Quae ab initio vertentis anni "
      + "Syri Maronitae agunt …' (dated at p. 511 'die xxvii mensis augusti, anno MDCCCCXXIII'). The index cites both at 510 (`23 Probe "
      + "meminimus. - Ad Mariam principem viduam / Eadziwill: de templo in honorem Sacratissimi / Cordis Iesu in Varsaviae suburbio eius "
      + "sumptibus / exstructo 510`, `27 Quae ab initio. - Ad E. P. D. Eliam Huayek, patriar­ / cham Antiochensem Maronitarum: ad gratulandum "
      + "/ quintum ac vicesimum patriarchalis dignitatis annum 510`).",
  },
  // Phase 2b-iii-b, the pages two *matched* shelf letters cite through the recovery (the
  // join withholds both references unless the page is curated, match.ts): the six below
  // were read in the store text on 2026-09-21 and each prints two letters. Pius X's and
  // Pius XI's letters of 1910 and 1923 are short, and the fascicles set them two to a page.
  'AAS:2:51': {
    documentIds: ['mag:pius-x/libentissime-legimus-1910', 'mag:pius-x/venerabilem-fratrem-1910'],
    evidence: "AAS 2 (1910) p. 51 (PDF page 51 of AAS-02-1910-ocr.pdf, read 2026-09-21) prints, after the end of the letter before it, 'IV. / "
      + "VENERABILI FRATRI VINCENTIO, EPISCOPO FANENSI, DE SEMINARIO THEOLOGICO TOTIUS PICENI SUPERIORIS. / Venerabilis Frater, salutem et "
      + "apostolicam benedictionem. — Libentissime legimus tuas litteras …', dated 'Datum Romae apud S. Petrum, die x Ianuarii MCMX, "
      + "Pontificatus Nostri anno septimo. PIUS PP. X.', and, lower on the same page, 'V. / DILECTIS FILIIS ALOISIO SALVATORELLI ARCHIPRESBYTERO "
      + "ET CANONICIS ECCLESIAE PERUSINAE, OB LIBENTER EXCEPTUM DELEGATUM APOSTOLICUM. / Dilecti filii, salutem et apostolicam benedictionem. — "
      + "Venerabilem Fratrem, quem istuc ad dioecesim procurandam misimus Delegatum …' (10 January 1910). The index prints neither page "
      + "(`Libentissime legimus. - Ad R. P. D. Vincentium Fran¬ / ceschini Episcopum Fanensem, de seminario theo­ / logico totius Piceni "
      + "superioris.`, `Venerabilem Fratrem. - Ad R. D. Aloysium Salvatorelli / Archipresbyterum et Canonicos Perusinos, ob libenter / exceptum "
      + 'Delegatum Apostolicum`); both are the recovery\'s (`aas-02-1910.pages.json`, rule `unique`), and both letters are on the letters shelf.',
  },
  'AAS:2:53': {
    documentIds: ['mag:pius-x/gratias-primum-1910', 'mag:pius-x/ex-annalibus-1910'],
    evidence: "AAS 2 (1910) p. 53 (PDF page 53 of AAS-02-1910-ocr.pdf, read 2026-09-21) prints 'VII. / VENERABILI FRATRI PAULO, EPISCOPO "
      + "BRUNENSI, DE NUPER HABITA SYNODO DIOECESANA. / Venerabilis frater, salutem et apostolicam benedictionem. — Gratias primum …', dated "
      + "'Datum Romae apud S. Petrum, die xxiv Ianuarii MCMX, Pontificatus Nostri anno septimo. PIUS PP. X.', and, lower on the same page, "
      + "'VIII. / DILECTO FILIO H. OSTER CONSOCIATIONIS « A SANCTA IESU INFANTIA » MODERATORI PER GERMANIAM, OB COLLECTAM STIPEM IN FAVOREM "
      + "OPERIS « A SANCTA IESU INFANTIA ». / Dilecte fili, salutem et apostolicam benedictionem. — Ex annalibus …' (January 1910, the index "
      + "printing no day). The index prints neither page (`Gratias primum. - Ad R. P. D. Paulum Huyn, Episco­ / pum Brunensem, de nuper habita "
      + "synodo dioecesana`, `1910 Ian. Ex annalibus. - Ad R. D. H. Oster, consociationis / « A Sancta Iesu Infantia » Moderatorem per Ger­ / "
      + 'maniam ob collectam stipem …`); both are the recovery\'s (`aas-02-1910.pages.json`, rule `unique`), and both letters are on the '
      + 'letters shelf (the second matched within its month by incipit).',
  },
  'AAS:2:191': {
    documentIds: ['mag:pius-x/exeunte-anno-1910', 'mag:pius-x/quae-nuper-1910'],
    evidence: "AAS 2 (1910) p. 191 (PDF page 191 of AAS-02-1910-ocr.pdf, read 2026-09-21) prints 'III. / DILECTIS FILIIS CAROLO KANTER ADLECTO "
      + "INTER ANTISTITES DOM. PONT. ET MARCHIONISSAE ADELI PALLAVICINI PRAESIDIBUS PIAE SOCIETATIS « AB ALTARI », IN QUINQUAGESIMO A CONDITA "
      + "SOCIETATE ANNIVERSARIO. / Dilecti filii, salutem et apostolicam benedictionem. — Exeunte anno …', dated 'Datum Romae, apud S. Petrum "
      + "die XXVII Februarii MCMX, Pontificatus Nostri anno septimo. PIUS PP. X.', and, lower on the same page, 'IV. / DILECTO FILIO NOSTRO PETRO "
      + "S. R. E. PRESB. CARD. COUILLIÉ, ARCHIEPISCOPO LUGDUNENSI. / Dilecte fili Noster, salutem et apostolicam benedictionem. — Quae nuper "
      + "facta sunt Romae hostiliter et contumeliose in Ecclesiam sanctam …' (14 March 1910). The index prints neither page (`27 Exeunte anno. "
      + "- Ad R. D. Carolum Kanter et Marchio­ / nissam Ad elem Pallavicini Praesides piae Societatis / ab altari …`, `Mart. 14 Quae nuper. - Ad "
      + 'Petrum S. R. E. presbyterum Car­ / dinalem Coullié, Archiepiscopum Lugdunensem`); both are the recovery\'s (`aas-02-1910.pages.json`, '
      + 'rule `unique`), and both letters are on the letters shelf.',
  },
  'AAS:2:446': {
    documentIds: ['mag:pius-x/litteras-istinc-1910', 'mag:pius-x/optimum-sane-1910'],
    evidence: "AAS 2 (1910) p. 446 (PDF page 446 of AAS-02-1910-ocr.pdf, read 2026-09-21) prints 'EPISTOLAE. / I. / AD R. P. D. SEPTIMIUM "
      + "CARACCIOLO DI TORCHIAROLO, EPISCOPUM ALIPHANUM, SACERDOTII SUI ANNIVERSARIUM VIGESIMUM QUINTUM CELEBRANTEM, GRATULANDI CAUSA. / … "
      + "Litteras istinc accepimus communis laetitiae nuncias …', dated 'Datum Romae apud S. Petrum, die xx Maii MCMX, Pontificatus Nostri anno "
      + "septimo. PIUS PP. X.', and, lower on the same page, 'II. / AD R. P. D. IOSEPHUM DERNAZ, LAUSANENSIUM ET GENEVENSIUM EPISCOPUM, "
      + "SEXAGESIMUM SACERDOTII SUI ANNIVERSARIUM EXPLENTEM, GRATULATIONIS ERGO. / … Optimum sane consilium iniisti cum, appetente sacerdotii "
      + "tui natali sexagesimo …' (21 May 1910). The index prints neither page (`20 Litterae istinc. - Ad R. P. D. Septimium Caracciolo / di "
      + "Torchiarolo, Episcopum Aliphanum, sacerdotii / sui anniversarium vigesimum quintum celebrantem, / gratulandi causa`, `21 Optimum sane. - "
      + "Ad R. P. D. Iosephum Deruaz, Lau­ / sanensium et Genevensium Episcopum, sexagesi­ / mum sacerdotii sui anniversarium explentem, gra­ / "
      + "tulationis ergo`); both are the recovery's (`aas-02-1910.pages.json`, the first fuzzy -- the index's `Litterae` for the volume's "
      + "`Litteras` -- the second unique), and both letters are on the letters shelf.",
  },
  'AAS:2:509': {
    documentIds: ['mag:pius-x/qui-tristia-saepius-1910', 'mag:pius-x/etsi-pro-tua-modestia-1910'],
    evidence: "AAS 2 (1910) p. 509 (PDF page 509 of AAS-02-1910-ocr.pdf, read 2026-09-21) prints 'EPISTOLAE / I. / AD R. P. D. ALFREDUM WILLIEZ, "
      + "ATREBATENSIUM EPISCOPUM, DE VIGESIMO QUINTO SACERDOTII ANNIVERSARIO GRATULANDI CAUSA. / Venerabilis Frater, salutem et apostolicam "
      + "benedictionem. — Qui tristia saepius …', dated 'Datum Romae apud Sanctum Petrum, die XXIII Maii MCMX, Pontificatus Nostri anno "
      + "septimo. PIUS PP. X.', and, lower on the same page, 'II. / AD R. P. D. GUGLIELMUM VAN DE VEN, BUSCODUCENSEM EPISCOPUM. / Venerabilis "
      + "Frater, salutem et apostolicam benedictionem. — Etsi pro tua modestia …' (23 May 1910). The index prints neither page (`23 Qui tristia "
      + "saepius. - Ad R. P. D. Alfredum Williez, / Atrebatensium Episcopum, de vigesimo quinto sa­ / cerdotii anniversario gratulandi causa`, "
      + "`Etsi pro tua modestia. - Ad R. P. D. Guglielmum van / de Ven, Buscoducensem Episcopum`); both are the recovery's "
      + "(`aas-02-1910.pages.json`, rule `unique`), and both letters are on the letters shelf.",
  },
  'AAS:15:353': {
    documentIds: ['mag:pius-xi/ceteriores-nos-1923', 'mag:pius-xi/quando-nel-principio-1923'],
    evidence: "AAS 15 (1923) p. 353 (PDF page 353 of AAS-15-1923-ocr.pdf, read 2026-09-21) prints 'XII / AD R. P. D. PAULUM JACUZIO, "
      + "ARCHIEPISCOPUM SURRENTINUM: QUINQUAGESIMO EXEUNTE ANNO EX QUO ARCHIDIOECESIS PUBLICE CORDI SACRATISSIMO IESU CONSECRATA EST. / "
      + "Venerabilis frater, salutem et apostolicam benedictionem. — Certiores Nos nuper fecisti …', dated 'Datum Romae apud Sanctum Petrum, "
      + "die xi mensis iunii, anno MDCCCCXXIII, Pontificatus Nostri secundo. PIUS PP. XI', and, lower on the same page, 'XIII / AD EMUM P. D. "
      + "PETRUM TIT. S. LAURENTII IN LUCINA S. R. E. CARD. GASPARRI, A SECRETIS STATUS: DE DISSIDIIS COMPONENDIS QUAE PACEM POPULIS AFFULGERE "
      + "NONDUM SINUNT. / Signor Cardinale. — Quando nel principio del Nostro Pontificato …' (24 June 1923). The index cites both at 353 (`11 "
      + "Certiores. - Ad E. P. D. Paulum Jacuzio, Archiepi­ / scopum Surrentinum: quinquagesimo exeunte anno / ex quo archidioecesis publice "
      + "Cordi Sacratissimo / Iesu consecrata est 353`, `24 Quando nel principio. - Ad Emum P. D. Petrum titulo / S. Laurentii in Lucina, S. E. "
      + "E. Card. Ga- / sparri, a secretis Status: de dissidiis componendis / quae pacem populis affulgere nondum sinunt . . 353`); both letters "
      + "are on the letters shelf (the shelf's slug of the first reads `ceteriores-nos`, vatican.va's own spelling).",
  },
  // Phase 2c-i (the ASS sample): the one page of the five sample volumes that two matched
  // shelf letters cite. Read in the store text on 2026-09-21; the ASS sets Leo XIII's short
  // letters one after the other under their own headings, as the AAS fascicles do.
  // Phase 2c-i finding 9, settled in this change: p. 3 opens two acts of different classes,
  // and both are matched only once the brevis carries `in-forma-brevis` (GENRE_OVERRIDES).
  // Until that row was written the page held one matched act and invariant 25 never fired.
  'ASS:33:3': {
    documentIds: ['mag:leo-xiii/i-luttuosi-avvenimenti-1900', 'mag:leo-xiii/quas-tu-1900'],
    evidence: "ASS 33 (1900) p. 3 (page 3 of ass-33-1900.txt) prints 'IITTERAE Sanctissimi D. N. Leonis XIII ad Emum. Cardinalem "
      + "Vicarium ut exci- / tet Religiosorum Communitates ad effundendas Deo preces pro luctuosis fidelium in Sinis casibus' (the OCR "
      + "reads the L as I), opening 'I luttuosi avvenimenti, che si succedono in Gina,' and dated 16 July 1900, and, lower on the same "
      + "page, 'IITTERAE in forma Brevis SSmi. D. N. Leonis XIII ad Emum. Archiepiscopum Me- / diolanensem quoad interessentiam comitiis "
      + "ad oratores populi eligendos', opening 'Quas Tu caeterique provinciae Antistites ad nos communiter' and dated 8 June 1900. The "
      + "scanner enters both at 3 (ass-33-1900.entries.json, anchor `dateline`). They are of different classes -- the first a letter of "
      + "the letters shelf, the second an apostolic letter in forma Brevis -- and vatican.va files both on Leo XIII's letters shelf.",
  },
  'ASS:33:641': {
    documentIds: ['mag:leo-xiii/de-ingenii-1901', 'mag:leo-xiii/le-nostre-ferme-speranze-1901'],
    evidence: "ASS 33 (1900) p. 641 (page 641 of ass-33-1900.txt, read 2026-09-21) prints 'LITTERAE SS.mi Patris Leonis XIII ad "
      + "auctorem libri in quo exposita est admira­ / bilis inhabitatio Sancti Spiritus in animis iustis. / Dilecto Filio Bartholomeo "
      + "Froget Sodali Dominicano. / Pictavium. / Dilecte Fili, salutem et Apostolicam Benedictionem. — De ingenii doctrinaeque "
      + "fructibus quos nobis frequentes catholicorum exhibet pietas …', dated on the same page 'Datum Romae apud Sanctum Petrum die 20 "
      + "februarii 1901, Pontificatus Nostri vicesimo quarto. LEO PP. XIII.', and, lower on the same page, 'LITTERAE SS.mi D. N. Leonis "
      + "XIII quoad consociationem Rosarii perpetui. / Al diletto Figlio Costanzo Maria Becchi, dei Predicatori, Direttore dell'Assoc. "
      + "del Rosario Perpetuo in Italia. / Le nostre ferme speranze di quattro anni fa, quando scrivemmo l'Enciclica sul Rosario di "
      + "Maria …', which runs onto p. 642 and is dated there 'Dato a Roma, presso S. Pietro, il giorno 28 marzo dell'anno 1901, "
      + "vigesimoquarto del Nostro Pontificato. LEO PP. XIII.' (the shelf's URL slug dates it 19010228, its record 1901-03-28, the "
      + "dateline's). The scanner enters both at 641 (ass-33-1900.entries.json, anchor `dateline`), and both letters are on the "
      + "letters shelf.",
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
  // Phase 2c-i (the ASS sample): the two constitutions of 1908 the first fascicle of the AAS
  // (1 January 1909) prints again from ASS 41 -- *Sapienti consilio* (29 June 1908, the
  // Roman Curia) and *Promulgandi* (29 September 1908, the AAS itself instituted). Until the
  // ASS was joined, AAS 1 (1909) 7 and 5 were the registry's references (phase 2b-iii-b, a
  // curated page reading and a recovered page); with ASS 41 read, each act is claimed twice
  // and this table's rule decides: the first printing is the citation of record, the ASS
  // being the Holy See's official organ since 1904 (*Ex actis*, 23 May 1904). The owner may
  // prefer the AAS by canonical usage (the *Fontes* cite both at AAS 1); that needs a kind
  // this table does not have (a later printing cited over a plain first one), so the rule
  // stands and the era report names both printings. The first "index line" of each row is
  // the ASS heading the reading quotes, the ASS having no chronological index.
  'AAS:1:7': {
    kind: 'reissue',
    citationOf: 'ASS:41:425',
    indexLines: [
      'CONSTITUTIO APOSTOLICA / SS. D. N. Pii div. prov. Papae X, de Romana Curia.',
      '1908    Ian.   29    Constitutio « Sapienti Consilio » / DE ROMANA CURIA.',
    ],
    evidence: "ASS 41 (1908) p. 425 (page 425 of ass-41-1908.txt, read 2026-09-21; the curated reading ASS:41:425) prints "
      + "'CONSTITUTIO APOSTOLICA / SS. D. N. Pii div. prov. Papae X, de Romana Curia. / PIUS EPISCOPUS / SERVUS SERVORUM DEI / "
      + "A d perpetuam rei memoriam. / Sapienti consilio sa. me. Pontifex Xystus V, Decessorum / vestigiis inhaerens eorumque coepta "
      + "perficiens, sacros Car- / dinalium coetus, seu Romanas Congregationes …', dated p. 440 'Datum Romae apud Sanctum Petrum, anno "
      + "Incarnationis Dominicae millesimo nongentesimo octavo, die festo Sanctorum Apostolorum Petri et Pauli, III Kal. Iulias' -- 29 "
      + "June 1908 -- in the fascicle of the summer of 1908. AAS 1 (1909) p. 7 (page 7 of aas-01-1909.txt, read 2026-09-21), under the "
      + "running head 'Constitutio Apostolica Sapienti consilio.. 7', prints 'CONSTITUTIO APOSTOLICA / DE ROMANA CURIA / PIUS EPISCOPUS "
      + "/ SERVUS SERVORUM DEI / AD PERPETUAM REI MEMORIAM / Sapienti consilio sa. me. Pontifex Xystus V, Decessorum ve- / stigiis "
      + "inhaerens eorumque coepta perficiens, sacros Cardi- / nalium coetus, seu Romanas Congregationes …', the same text (the ASS's "
      + "'suis quaeque finibus' reads 'suis quamque finibus' in the AAS) and the same dating formula at p. 19 ('Datum Romae apud Sanctum "
      + "Petrum, anno Incarnationis … III Kalendas Iulias'), in the first fascicle of the AAS (1 January 1909, 'Annus I. - Vol. I. Die 1 "
      + "Ianuarii 1909. Num. 1.'), with no note of why it is printed again and no heading of corrigenda: a re-issue. The 1909 index "
      + "enters it under `I. - CONSTITUTIONES APOSTOLICAE` as `1908 Ian. 29 Constitutio « Sapienti Consilio » / DE ROMANA CURIA.` (the "
      + "`Ian.` corrected to June by ACTA_INDEX_CORRECTIONS '1909:7', the page read by ACTA_PAGE_READINGS). The citation of record is the "
      + "first printing, ASS 41 (1908) 425.",
  },
  'AAS:1:5': {
    kind: 'reissue',
    citationOf: 'ASS:41:619',
    indexLines: [
      'ACTA ROMANI PONTIFICIS / CONSTITUTIO APOSTOLICA / De promulgatione legum et evulgatione actorum S. Sedis.',
      '             Sept.                Constitutio « Promulgandi », de promulgatione legum / et evulgatione actorum S. Sedis',
    ],
    evidence: "ASS 41 (1908) p. 619 (page 619 of ass-41-1908.txt, read 2026-09-21; the curated reading ASS:41:619) prints 'ACTA ROMANI "
      + "PONTIFICIS / CONSTITUTIO APOSTOLICA / De promulgatione legum et evulgatione actorum S. Sedis. / PIUS EPISCOPUS / SERVUS SERVORUM "
      + "DEI / Ad perpetuam rei memoriam. / Promulgandi pontificias Constitutiones ac leges non idem / semper decursu temporis in Ecclesia "
      + "catholica fuit modus …', dated p. 620 'Datum Romae apud S. Petrum, anno Incarnationis Do- / minicae millesimo nongentesimo "
      + "octavo, in Kalendas Octo- / bres, Pontificatus Nostri sexto.' (the OCR's `in` for `III`: 29 September 1908), signed 'A. Card. "
      + "Di PIETRO R. Card. MERRY DEL VAL / Datarius a Secretis Status'. AAS 1 (1909) p. 5 (page 5 of aas-01-1909.txt, read 2026-09-21), "
      + "the first page of the first fascicle ('Annus I. - Vol. I. Die 1 Ianuarii 1909. Num. 1.'), prints 'CONSTITUTIO APOSTOLICA / DE "
      + "PROMULGATIONE LEGUM ET EVULGATIONE ACTORUM S. SEDIS / PIUS EPISCOPUS / SERVUS SERVORUM DEI / AD PERPETUAM REI MEMORIAM / "
      + "Promulgandi pontificias Constitutiones ac leges non idem / semper decursu temporis in Ecclesia catholica fuit modus …', the same "
      + "text, the same formula at p. 6 ('… nicae millesimo nongentesimo octavo, III Kalendas Octobres, / Pontificatus Nostri sexto.') and "
      + "the same signatures, with no note of why it is printed again and no heading of corrigenda: a re-issue -- the AAS opening with "
      + "the constitution that instituted it. The 1909 index enters it as `Sept. Constitutio « Promulgandi », de promulgatione legum / et "
      + "evulgatione actorum S. Sedis` (the page recovered from the body, aas-01-1909.pages.json). The citation of record is the first "
      + "printing, ASS 41 (1908) 619.",
  },
};
