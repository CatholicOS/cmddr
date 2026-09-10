/**
 * Incipits recovered by hand for documents whose index heading printed none.
 *
 * The harvest reads index pages only, so an act filed under a descriptive heading mints a
 * provisional, genre-and-date-based id (expansion spec §4.3, §4.4) even when the act itself
 * has a perfectly good name. This table restores those names. Nothing here is inferred:
 * every row quotes the source that supplies it, and `source` records which standard it met --
 *
 *   'aas'      Acta Apostolicae Sedis cites the act by this incipit in its own chronological
 *              index, which is the Holy See's authoritative citation form.
 *   'document' AAS carries no such citation -- it prints the act without an incipit, omits it,
 *              or has not yet published that year -- so the incipit is read from the
 *              document's own text or printed heading instead.
 *
 * Keyed `${pageSlug}|${slugify(title)}|${isoDate}`, the shape DATE_CORRECTIONS and
 * CIRCUMSCRIPTION_ERECTIONS already use. A row matching no harvested record fails the data
 * tests rather than sitting unnoticed, so the table cannot drift away from the corpus.
 */
export interface RecoveredIncipit {
  /** The incipit to mint from, exactly as it should be recorded. */
  incipit: string;
  /** Which evidential standard this row met; see the module doc above. */
  source: 'aas' | 'document';
  /** The source text, quoted, so a reader can audit the row without refetching anything. */
  evidence: string;
}

export const RECOVERED_INCIPITS: Record<string, RecoveredIncipit> = {

  // -- pius-xi ----------------------------------------------------------------
  'pius-xi|chirografo-al-cardinale-pietro-gasparri-segretario-di-stato-sulla-firma-dei-trattati-lateranensi|1929-05-30': {
    incipit: 'Ci si è domandato',
    source: 'aas',
    evidence: 'AAS 21 (1929) index p. 780: "IV. - CHIROGRAPHI / 1929 Maii 30  Ci si è domandato. '
      + '- Ad Emum P. D. Petrum, tit. S. Laurentii in Lucina, S. R. E. Presb. Card. Gasparri, a '
      + 'Secretis Status: de Conventionibus inter Sanctam Sedem et Italiae Regnum initis". The '
      + 'text is at p. 297, opening "Signor Cardinale, Ci si è domandato se le relazioni...". '
      + 'vatican.va publishes the chirograph at two URLs; only _domandato prints the incipit in '
      + 'its heading, and the two merge on shelf and date.',
  },

  // -- pius-xii ----------------------------------------------------------------
  'pius-xii|epistola-apostolica-all-episcopato-della-bolivia-circa-lo-sviluppo-dei-seminari-e-la-sempre-piu-efficiente-formazione-del-clero|1941-11-23': {
    incipit: 'Haud mediocrem',
    source: 'aas',
    evidence: 'AAS 34 (1942) index: "1941 Nov. 23 Haud mediocrem. - Ad Venerabiles Fratres Danielem '
      + 'Rivero, Archiepiscopum Sucrensem ceterosque Boliviae Episcopos..."',
  },
  'pius-xii|lettera-apostolica-all-opera-vocazioni-sacerdotali-in-brasile|1947-04-23': {
    incipit: 'Volvidos cinco anos',
    source: 'document',
    evidence: 'AAS 39 (1947) p. 285 prints the text opening "VENERAVEIS IRMAOS SAUDE E BENCAO '
      + 'APOSTOLICA / Volvidos cinco anos apos a mensagem que vos enderecamos...", but its '
      + 'chronological index p. 653 lists this letter with no incipit, unlike its neighbours.',
  },
  'pius-xii|quamquam-epistola-apostolica-per-il-xvi-centenario-della-nascita-di-s-agostino|1954-07-25': {
    incipit: 'Quamquam',
    source: 'aas',
    evidence: 'AAS 46 (1954) index p. 787: "1954 Iulii 25 Quamquam. - Ad Revmum Ferdinandum Urquia, '
      + 'Abbatem Generalem Congregationis Ss. Salvatoris Lateranensis..."',
  },
  'pius-xii|lettera-apostolica-breve-che-proclama-santa-chiara-patrona-celeste-della-televisione|1958-08-21': {
    incipit: 'Clarius explendescit',
    source: 'aas',
    evidence: 'AAS 50 (1958) index p. 1037: "Febr. 14 Clarius explendescit. - Sancta Clara Virgo '
      + 'Caelestis Patrona televisifici inventi eligitur 512". AAS dates the act 14 February; '
      + 'vatican.va prints 21 August.',
  },

  // -- john-xxiii --------------------------------------------------------------
  'john-xxiii|lettera-apostolica-motu-proprio-maiora-in-dies-che-attribuisce-il-titolo-di-pontificia-all-accademia-mariana-internazionale|1959-12-08': {
    incipit: 'Maiora in dies',
    source: 'aas',
    evidence: 'AAS 52 (1960) index p. 1033: "1959 Dec. 8 Maiora in dies. - Academia Mariana '
      + 'Internationalis Pontificiae Academiae titulo decoratur 24"',
  },
  'john-xxiii|lettera-apostolica-motu-proprio-superno-dei-che-istituisce-le-commissioni-preparatorie-del-concilio-vaticano-ii|1960-06-05': {
    incipit: 'Superno Dei',
    source: 'aas',
    evidence: 'AAS 52 (1960) index p. 1033: "1960 Iun. 5 Superno Dei. - Commissiones Concilio '
      + 'Vaticano Secundo apparando instituuntur 433". The text reads "Superno Dei nutu '
      + 'factum esse reputavimus"; AAS cites the first two words.',
  },
  'john-xxiii|le-voci-la-protezione-di-s-giuseppe-per-il-concilio-ecumenico-vaticano-ii|1961-03-19': {
    incipit: 'Le voci',
    source: 'aas',
    evidence: 'AAS 53 (1961) index p. 836: "Mart. 19 Le voci. - Ad locorum Ordinarios et '
      + 'christifideles catholici orbis: de pietate erga S. Ioseph, universalis Ecclesiae '
      + 'Patronum..."',
  },
  'john-xxiii|celebrandi-concilii-oecumenici-speciale-supplicazione-nella-solennita-di-pentecoste-per-il-concilio-ecumenico|1961-04-11': {
    incipit: 'Celebrandi Concilii Oecumenici',
    source: 'aas',
    evidence: 'AAS 53 (1961) index p. 836: "Apr. 11 Celebrandi Concilii Oecumenici. - Ad '
      + 'Venerabiles Fratres Patriarchas, Primates, Archiepiscopos, Episcopos aliosque '
      + 'locorum Ordinarios..."',
  },
  'john-xxiii|centesimo-vertente-anno-nel-centenario-della-morte-di-mons-angelo-ramazzotti-fondatore-del-pontificio-istituto-delle-missioni-estere|1961-08-10': {
    incipit: 'Centesimo vertente anno',
    source: 'document',
    evidence: 'The vatican.va index heading prints "Centesimo vertente anno, nel centenario della '
      + 'morte di Mons Angelo Ramazzotti...". Absent from AAS 53 (1961)’s apostolic-letters '
      + 'index; the published ES and IT editions carry a descriptive heading only.',
  },
  'john-xxiii|il-religioso-convegno-la-recita-del-santo-rosario-per-la-giusta-pace-tra-le-nazioni|1961-09-29': {
    incipit: 'Il religioso convegno',
    source: 'aas',
    evidence: 'AAS 53 (1961) p. 641: "Venerabili Fratelli, diletti figli, salute ed Apostolica '
      + 'Benedizione! ... Il religioso convegno della domenica 10 settembre a '
      + 'Castelgandolfo...". Its index p. 837 abbreviates the citation to "Il religioso"; the '
      + 'document’s own opening phrase is kept here.',
  },

  // -- paul-vi -----------------------------------------------------------------
  'paul-vi|decreto-di-chiusura-in-spiritu-sancto-del-concilio-ecumenico-vaticano-ii|1965-12-08': {
    incipit: 'In Spiritu Sancto',
    source: 'aas',
    evidence: 'AAS 58 (1966) index p. 1208: "Dec. 8 In Spiritu Sancto. - Concilio Oecumenico '
      + 'Vaticano Secundo finis imponitur 18"',
  },
  'paul-vi|nomina-del-card-ugo-poletti-a-vicario-generale|1973-03-06': {
    incipit: 'Positum est',
    source: 'aas',
    evidence: 'AAS 65 (1973) index p. 694: "Mart. 6 Positum est. - E.mus P. D. Hugo ... Cardinalis '
      + 'Poletti Vicarius Generalis Summi Pontificis in Urbe eiusque suburbiis et districtu '
      + 'eligitur 215"',
  },

  // -- john-paul-i -------------------------------------------------------------
  'john-paul-i|lettera-apostolica-in-occasione-dell-elevazione-del-santuario-di-nostra-signora-della-consolazione-al-titolo-di-basilica-minore-piacenza|1978-09-01': {
    incipit: 'Progredientibus iam',
    source: 'aas',
    evidence: 'AAS 70 (1978) index p. 1013: "Progredientibus iam. - In dioecesi Piacentina sacra '
      + 'aedes sub titulo a Sancto Marco ad dignitatem Basilicae Minoris evehitur 758"',
  },
  'john-paul-i|lettera-apostolica-in-occasione-della-proclamazione-di-nostra-signora-del-buon-viaggio-a-patrona-di-itabirito-brasile|1978-09-01': {
    incipit: 'Propterea maxime',
    source: 'aas',
    evidence: 'AAS 70 (1978) index p. 1013: "1978 Sept. 1 Propterea maxime. - Beata Maria Virgo '
      + 'titulo « Nossa Senhora da Boa Viagem » caelestis apud Deum Patrona confirmatur '
      + 'oppidi ac municipii «Itabirito» in archidioecesi Marianensi 757"',
  },
  'john-paul-i|lettera-apostolica-per-la-costituzione-della-nunziatura-apostolica-nelle-isole-fiji|1978-09-12': {
    incipit: 'Cum probe',
    source: 'aas',
    evidence: 'AAS 70 (1978) index p. 1013: "Sept. 12 Cum probe. - Nuntiatura Apostolica in Insulis '
      + 'Fisiensibus constituitur 759"',
  },

  // -- leo-xiv -----------------------------------------------------------------
  'leo-xiv|lettera-apostolica-in-forma-di-motu-proprio-sulla-revisione-della-costituzione-apostolica-in-ecclesiarum-communione|2026-06-24': {
    incipit: 'Confirma fratres tuos',
    source: 'document',
    evidence: 'The document heading prints: LETTERA APOSTOLICA IN FORMA DI "MOTU PROPRIO" DEL SOMMO '
      + 'PONTEFICE LEONE XIV "CONFIRMA FRATRES TUOS". AAS 2026 is published only through '
      + 'March, so no AAS citation exists yet.',
  },
};
