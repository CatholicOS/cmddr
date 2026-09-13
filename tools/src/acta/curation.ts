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
  '1937:200': {
    indexLine: '  » » » Al Episcopado Mejicano sobre la situación religiosa . . . 200',
    reason: 'the Spanish text of the encyclical *Firmissimam constantiam* (28 March 1937; the Latin text at AAS 29 (1937) 189, '
      + "`mag:pius-xi/firmissimam-constantiam-1937`): AAS 29 p. 200 is headed 'CARTA APOSTOLICA DE SU SANTIDAD EL PAPA PIO XI AL "
      + "EPISCOPADO MEJICANO: SOBRE LA SITUACIÓN RELIGIOSA' (PDF page 200 of AAS-29-1937-ocr.pdf, read 2026-09-13). One act, not two.",
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
};
