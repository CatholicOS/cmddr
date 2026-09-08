/**
 * Documents proven to be genuinely distinct acts that happen to share both a date and a
 * pope, but are filed on different shelves with different incipits. Verified by fetching
 * both documents from vatican.va in their original languages (Latin for encyclicals,
 * Italian for letters) and comparing their addressees and subject matter. Curated by
 * hand, never inferred; each entry's `note` is the textual evidence.
 *
 * Key: `${pageSlug}|${isoDate}|${slugify(incipit1)}|${slugify(incipit2)}` where incipit1
 * and incipit2 are in consistent order (alphabetically by slug) to ensure the same pair
 * is never keyed twice. Suppresses the same-date cross-shelf warning for exactly these
 * pairs; any other same-date cross-shelf pair still warns.
 */
export const ADJUDICATED_DISTINCT: Record<
  string,
  { incipit1: string; shelf1: string; incipit2: string; shelf2: string; note: string }
> = {
  'leo-xiii|1886-01-06|iampridem|non-senza': {
    incipit1: 'Iampridem',
    shelf1: 'encyclicals',
    incipit2: 'Non senza',
    shelf2: 'letters',
    note:
      'Iampridem is addressed to the archbishops and bishops of Prussia on the condition ' +
      'of the Church in Germany (LITTERAE … AD ARCHIEPISCOPOS ET EPISCOPOS BORUSSIAE, DE ' +
      'CONDITIONE REI CATHOLICAE IN GERMANIA). Non senza (Latin incipit Haud sine maximo ' +
      'animi moerore) is a letter of condolence to the King of Portugal on the death of his ' +
      'father Ferdinand.',
  },
  'leo-xiii|1890-11-20|catholicae-ecclesiae|novum-argumentum': {
    incipit1: 'Catholicae Ecclesiae',
    shelf1: 'encyclicals',
    incipit2: 'Novum argumentum',
    shelf2: 'letters',
    note:
      'Catholicae Ecclesiae is a circular letter establishing an annual Epiphany collection ' +
      'for the African missions. Novum argumentum is addressed to the Cardinal Archbishop of ' +
      'Florence, appending a formula of consecration of families and a daily prayer (LITTERAE ' +
      '… AD CARDINALEM ARCHIEPISCOPUM FLORENTINUM).',
  },
  'leo-xiii|1891-03-03|in-ipso|quod-erat-maxime': {
    incipit1: 'In Ipso',
    shelf1: 'encyclicals',
    incipit2: 'Quod erat maxime',
    shelf2: 'letters',
    note:
      'In Ipso is addressed to the ordinaries of the Austro-Hungarian Empire (ad Ordinarios ' +
      'Imperii austriaci), urging them to hold annual congresses. Quod erat maxime grants the ' +
      'feast of St Joseph under both precepts in Piedmont, Liguria, Sardinia and Lombardy.',
  },
  'pius-x|1904-04-25|navitas-egregia|sull-edizione-vaticana-dei-libri-liturgici-contenenti-le-melodie-gregoriane': {
    incipit1: 'Navitas egregia',
    shelf1: 'letters',
    incipit2: "Sull'edizione vaticana dei libri liturgici contenenti le melodie gregoriane",
    shelf2: 'motu_proprio',
    note:
      'Navitas egregia is a personal letter to Fr. Eugène Prévost in Paris praising the society ' +
      'he founded for lapsed, elderly and infirm priests. The motu proprio establishes the ' +
      'Vatican edition of the liturgical books containing Gregorian chant, following up the ' +
      "22 November 1903 motu proprio on sacred music. Both close 'il 25 Aprile 1904, festa di S. " +
      "Marco Evangelista' / 'die XXV Aprilis MDCCCCIV' but are unrelated acts.",
  },
  'pius-x|1907-06-14|ea-semper-fuit|summa-nos': {
    incipit1: 'Ea semper fuit',
    shelf1: 'apost_letters',
    incipit2: 'Summa Nos',
    shelf2: 'letters',
    note:
      'Ea semper fuit establishes the Ruthenian rite hierarchy in the United States (QUIBUS RITUS ' +
      'RUTHENUS CONSTITUITUR IN STATIBUS FOEDERATIS AMERICAE SEPTENTRIONALIS). Summa Nos ' +
      'congratulates Ernest Commer of Vienna on his refutation of the errors of Hermann Schell.',
  },
  'pius-x|1910-02-14|inter-viros|nobis-in-sublimi': {
    incipit1: 'Inter viros',
    shelf1: 'letters',
    incipit2: 'Nobis in sublimi',
    shelf2: 'apost_letters',
    note:
      'Inter viros congratulates Giuseppe Ballerini, an Italian cleric, on his apologetic ' +
      'writings and appointment among the domestic prelates. Nobis in sublimi separates the ' +
      'Ce-li Centralis apostolic vicariate in China from Pao-Ting-Fou.',
  },
  'pius-x|1910-05-03|in-hac-beatissimi-petri|paternam-curam': {
    incipit1: 'In hac Beatissimi Petri',
    shelf1: 'motu_proprio',
    incipit2: 'Paternam curam',
    shelf2: 'letters',
    note:
      'In hac Beatissimi Petri establishes a military vicar (Vicarius Castrensis) for the army of ' +
      'the Republic of Chile. Paternam curam concerns restoring the Josephian College in Manila ' +
      'to the Society of Jesus.',
  },
  'pius-x|1910-05-03|in-hac-beatissimi-petri|vide-quae-sit': {
    incipit1: 'In hac Beatissimi Petri',
    shelf1: 'motu_proprio',
    incipit2: 'Vide quae sit',
    shelf2: 'letters',
    note:
      'In hac Beatissimi Petri establishes a military vicar for the army of the Republic of ' +
      'Chile (see the previous entry). Vide quae sit congratulates Valerio Laspro, Archbishop of ' +
      'Salerno, on the golden jubilee of his episcopal ordination.',
  },
  'pius-x|1910-05-26|editae-saepe|ex-quo': {
    incipit1: 'Editae Saepe',
    shelf1: 'encyclicals',
    incipit2: 'Ex quo',
    shelf2: 'motu_proprio',
    note:
      'Editae Saepe is the encyclical on St Charles Borromeo addressed to the whole episcopate, ' +
      'issued for the third centenary of his canonization (dated on the feast of Corpus Christi, ' +
      "which the motu proprio's own closing formula also names -- 'in solemnibus Corporis Christi' " +
      '-- confirming the shared date is not a transcription accident). Ex quo establishes the ' +
      'Pious Union of St Paul the Apostle for the sanctification of the clergy.',
  },

  // Task 8 (Pius XI, Pius XII). Every entry below is verified by fetching both records'
  // full text from vatican.va and comparing addressee/subject matter.
  'pius-xi|1923-06-11|ceteriores-nos|iam-inde': {
    incipit1: 'Ceteriores nos',
    shelf1: 'letters',
    incipit2: 'Iam inde',
    shelf2: 'apost_letters',
    note:
      "Ceteriores nos is a personal letter to Fr. Paolo Jacuzio on the 50th anniversary of the " +
      "public consecration of the Sorrento archdiocese to the Sacred Heart of Jesus. Iam inde " +
      "('SANCTUARIUM A MATRE DOMINI, INTRA FINES ARCHIDIOECESIS SALERNITANAE, TITULO BASILICAE " +
      "MINORIS AUGETUR') elevates an ancient Marian sanctuary in the Salerno archdiocese to the " +
      'rank of Minor Basilica, petitioned by the Franciscan Procurator General.',
  },
  'pius-xi|1923-06-11|ceteriores-nos|venerabilis-frater': {
    incipit1: 'Ceteriores nos',
    shelf1: 'letters',
    incipit2: 'Venerabilis frater',
    shelf2: 'apost_letters',
    note:
      'Ceteriores nos (see the previous entry) concerns the Sorrento archdiocese anniversary. ' +
      "Venerabilis frater opens 'Venerabilis frater Raymundus Guillamet y Coma, Episcopus " +
      "Barcinonensem...' and elevates the church of Santa Maria del Mar in Barcelona, at the " +
      'request of its bishop, to the rank and dignity of Minor Basilica.',
  },
  'pius-xi|1925-12-11|i-primitivi-cemeteri|quas-primas': {
    incipit1: 'I primitivi cemeteri',
    shelf1: 'motu_proprio',
    incipit2: 'Quas Primas',
    shelf2: 'encyclicals',
    note:
      "I primitivi cemeteri ('CHE ISTITUISCE IL PONTIFICIO ISTITUTO DI ARCHEOLOGIA CRISTIANA') " +
      "establishes the Pontifical Institute of Christian Archaeology to study Rome's early " +
      "Christian cemeteries. Quas Primas ('SULLA REGALITÀ DI CRISTO'), addressed to the whole " +
      'episcopate, institutes the feast of Christ the King.',
  },
  'pius-xi|1923-06-29|orbem-catholicum|studiorum-ducem': {
    incipit1: 'Orbem catholicum',
    shelf1: 'motu_proprio',
    incipit2: 'Studiorum Ducem',
    shelf2: 'encyclicals',
    note:
      'Orbem catholicum establishes a special Curial office to promote catechetical instruction ' +
      "('peculiare Officium instituimus... ad urgendam toto orbe terrarum obtemperationem suis " +
      "legibus de populo, christianae doctrinae praeceptis erudiendo'). Studiorum Ducem, issued " +
      'for the sixth centenary of the canonization of St Thomas Aquinas, examines his doctrine ' +
      'and declares him patron of all Catholic schools.',
  },
  'pius-xi|1930-02-06|gia-da-qualche-tempo|lettera-con-grande-nostra-al-card-bisleti-circa-l-istituzione-di-una-commissione-per-il-conferimento-dei-gradi-accademici-nelle-discipline-sacre':
    {
      incipit1: 'Già da qualche tempo',
      shelf1: 'motu_proprio',
      // No incipit of its own; this is the item's full title (idStatus: provisional).
      incipit2: "Lettera Con grande Nostra, al Card. Bisleti circa l'istituzione di una "
        + 'Commissione per il conferimento dei gradi accademici nelle discipline sacre',
      shelf2: 'letters',
      note:
        "Già da qualche tempo ('CON IL QUALE VIENE ISTITUITA LA «SEZIONE STORICA» DELLA SACRA " +
        "CONGREGAZIONE DEI RITI') creates a Historical Section within the Congregation of Rites " +
        'to apply modern historical method to canonization causes lacking living witnesses. The ' +
        "letters-shelf item -- title 'Lettera Con grande Nostra, al Card. Bisleti circa " +
        "l'istituzione di una Commissione...', no incipit of its own (see extractIncipit's " +
        "mid-string address guard) -- is addressed 'AL CARD. GAETANO BISLETI, PREFETTO DELLA " +
        "SACRA CONGREGAZIONE DEI SEMINARI E DELLE UNIVERSITÀ DEGLI STUDI' and concerns " +
        "'L'ISTITUZIONE DI UNA COMMISSIONE PER IL CONFERIMENTO DEI GRADI ACCADEMICI NELLE " +
        "DISCIPLINE SACRE' and the reorganisation of the ecclesiastical faculties of theology, " +
        'philosophy and canon law -- an unrelated act on an unrelated congregation.',
    },
  'pius-xi|1929-06-07|lettera-al-cardinale-pietro-gasparri-segretario-di-stato-sulla-ratifica-dei-patti-lateranensi|motu-proprio-di-nostro-moto-proprio-che-contiene-la-legge-fondamentale-della-citta-del-vaticano':
    {
      // Neither item carries an incipit of its own (both idStatus: provisional); these are
      // the items' full titles.
      incipit1: 'Lettera al Cardinale Pietro Gasparri, Segretario di Stato, sulla ratifica dei '
        + 'Patti Lateranensi',
      shelf1: 'letters',
      incipit2: 'Motu Proprio Di nostro moto proprio che contiene la Legge Fondamentale della '
        + 'Città del Vaticano',
      shelf2: 'motu_proprio',
      note:
        "The letters-shelf item ('LETTERA DI SUA SANTITÀ PIO XI...SULLO SCAMBIO DI RATIFICHE DEI " +
        "PATTI LATERANENSI', addressed to Cardinal Gasparri) is Pius XI's telegram to King Victor " +
        "Emmanuel III announcing that 'lo scambio delle ratifiche delle Convenzioni Laterane " +
        "è...da pochi istanti un fatto compiuto'. The motu proprio ('Motu Proprio Di nostro moto " +
        "proprio che contiene la Legge Fondamentale della Città del Vaticano', no incipit of its " +
        "own -- see the NARRATIVE_OPENERS 'Di nostro' guard) is the constitutional Fundamental Law " +
        "of Vatican City State itself. Both same-day acts of the Lateran settlement, but the " +
        'telegram announcing ratification and the law creating the state are genuinely distinct.',
    },
  'pius-xii|1958-05-15|huanucensis-huarazensis-huariensis|lettera-al-cardinale-georges-f-x-marie-grente-arcivescovo-di-le-mans-per-il-40-anniversario-della-sua-ordinazione-episcopale':
    {
      incipit1: 'Huanucensis-Huarazensis (Huariensis)',
      shelf1: 'apost_constitutions',
      // No incipit of its own; this is the item's full title (idStatus: provisional).
      incipit2: 'Lettera al Cardinale Georges F. X. Marie Grente, Arcivescovo di Le Mans, per il '
        + '40° anniversario della sua ordinazione episcopale',
      shelf2: 'letters',
      note:
        "Huanucensis-Huarazensis separates territory from the Peruvian dioceses of Huánuco and " +
        "Huaraz to form the new Huari prelature ('a dioecesi Huanucensi omne territorium " +
        "provinciae vulgo Marañon nuncupatae separamus; a dioecesi vero Huarazens[i], territorii " +
        "partem...'). The letters-shelf item is addressed 'AD... CARDINALEM GRENTE, " +
        "ARCHIEPISCOPUM-EPISCOPUM CENOMANENSEM' congratulating him on forty years as a bishop " +
        "('Perquam raro sacrorum Antistites nanciscuntur quadraginta ab inito episcopatu " +
        "annos...') -- an unrelated French prelate's jubilee.",
    },
  'pius-xii|1958-05-15|huanucensis-huancayensis-tarmensis|lettera-al-cardinale-georges-f-x-marie-grente-arcivescovo-di-le-mans-per-il-40-anniversario-della-sua-ordinazione-episcopale':
    {
      incipit1: 'Huanucensis-Huancayensis (Tarmensis)',
      shelf1: 'apost_constitutions',
      // No incipit of its own; this is the item's full title (idStatus: provisional).
      incipit2: 'Lettera al Cardinale Georges F. X. Marie Grente, Arcivescovo di Le Mans, per il '
        + '40° anniversario della sua ordinazione episcopale',
      shelf2: 'letters',
      note:
        "Huanucensis-Huancayensis separates territory from Huánuco and Huancayo to form the new " +
        "Tarma prelature ('a dioecesi Huanucensi civiles provincias vulgo Daniem Carrion et Pasco " +
        "detrahimus; item a dioecesi Huancayensi civilem provinciam... Iunin cognominatam... " +
        "novam praelaturam «nullius» constituimus Tarmensem appellandam'). The Grente letter (see " +
        'the previous entry) is an unrelated episcopal-jubilee congratulation.',
    },
  'pius-xii|1957-07-05|ad-peculiari|kikuitensis-kisantuensis-kengen': {
    incipit1: 'Ad peculiari',
    shelf1: 'apost_letters',
    incipit2: 'Kikuitensis - Kisantuensis (Kengen.)',
    shelf2: 'apost_constitutions',
    note:
      "Ad peculiari elects the Blessed Virgin Mary, under the title 'de San Juan de Los Lagos', " +
      "Patroness of the archdiocese of Guadalajara, Mexico. Kikuitensis - Kisantuensis separates " +
      "territory from the apostolic vicariates of Kikwit and Kisantu (Belgian Congo) to form a " +
      "new apostolic prefecture, Kengensis ('CERTIS DISTRACTIS TERRIS AB APOSTOLICIS VICARIATIBUS " +
      "KIKUITENI ET KISANTUENSI, NOVA CONSTITUITUR APOSTOLICA PRAEFECTURA, KENGENSIS NOMINE') -- " +
      'an unrelated missionary-territory reorganisation, one of a batch of four issued the same day.',
  },
  'pius-xii|1957-07-05|kikuitensis-kisantuensis-kengen|religionis-sedes': {
    incipit1: 'Kikuitensis - Kisantuensis (Kengen.)',
    shelf1: 'apost_constitutions',
    incipit2: 'Religionis sedes',
    shelf2: 'apost_letters',
    note:
      'Kikuitensis - Kisantuensis (see the previous entry) creates the Kengensis apostolic ' +
      "prefecture in the Belgian Congo. Religionis sedes grants the church of Sts Wiro, Plechelm " +
      "and Otger at Sint-Odiliënberg, in the diocese of Roermond (Netherlands), the title and " +
      'dignity of Minor Basilica -- an unrelated act in an unrelated country.',
  },
  'pius-xii|1957-07-05|ad-peculiari|musomensis': {
    incipit1: 'Ad peculiari',
    shelf1: 'apost_letters',
    incipit2: 'Musomensis',
    shelf2: 'apost_constitutions',
    note:
      "Ad peculiari (see above) is the Guadalajara Marian-patronage letter. Musomensis elevates " +
      "the Apostolic Prefecture of Musoma (Tanganyika) to full diocesan status ('Praefecturam " +
      "Apostolicam Musomensem ad dignitatem dioecesis evehimus') -- another of the same day's " +
      'batch of unrelated missionary-territory constitutions.',
  },
  'pius-xii|1957-07-05|musomensis|religionis-sedes': {
    incipit1: 'Musomensis',
    shelf1: 'apost_constitutions',
    incipit2: 'Religionis sedes',
    shelf2: 'apost_letters',
    note:
      'Musomensis (see above) elevates the Musoma prefecture in Tanganyika to a diocese. ' +
      'Religionis sedes (see above) grants a Dutch parish church Minor Basilica status -- ' +
      'unrelated acts.',
  },
  'pius-xii|1957-07-05|ad-peculiari|rabaulensis-kaviengensis': {
    incipit1: 'Ad peculiari',
    shelf1: 'apost_letters',
    incipit2: 'Rabaulensis (Kaviengensis)',
    shelf2: 'apost_constitutions',
    note:
      "Ad peculiari (see above) is the Guadalajara Marian-patronage letter. Rabaulensis " +
      "separates New Ireland and adjacent Papua New Guinea islands from the apostolic vicariate " +
      "of Rabaul to found the new vicariate of Kavieng ('Ab apostolico vicariatu Rabaulensi eam " +
      "partem separamus, qua insula Novae Hiberniae cum insulis vulgo Duke of York... " +
      "continentur; ex eaque novum vicariatum condimus... Kaviengensis') -- another of the same " +
      "day's batch, unrelated to Guadalajara.",
  },
  'pius-xii|1957-07-05|rabaulensis-kaviengensis|religionis-sedes': {
    incipit1: 'Rabaulensis (Kaviengensis)',
    shelf1: 'apost_constitutions',
    incipit2: 'Religionis sedes',
    shelf2: 'apost_letters',
    note:
      'Rabaulensis (see above) founds the Kavieng vicariate in Papua New Guinea. Religionis ' +
      'sedes (see above) grants a Dutch parish church Minor Basilica status -- unrelated acts.',
  },
  'pius-xii|1957-07-05|ad-peculiari|quinhonensis-saigonensis-nhatrangensis': {
    incipit1: 'Ad peculiari',
    shelf1: 'apost_letters',
    incipit2: 'Quinhonensis - Saigonensis (Nhatrangensis)',
    shelf2: 'apost_constitutions',
    note:
      "Ad peculiari (see above) is the Guadalajara Marian-patronage letter. Quinhonensis - " +
      "Saigonensis separates territory from the Vietnamese vicariates of Quinhon and Saigon to " +
      "found the new vicariate of Nhatrang ('Ex quibus terris novum vicariatum condimus, qui ab " +
      "urbe Nhatrang, in provincia Khanhoa sita, Nhatrangensis appellabitur') -- the fourth of " +
      'the same day\'s batch, unrelated to Guadalajara.',
  },
  'pius-xii|1957-07-05|quinhonensis-saigonensis-nhatrangensis|religionis-sedes': {
    incipit1: 'Quinhonensis - Saigonensis (Nhatrangensis)',
    shelf1: 'apost_constitutions',
    incipit2: 'Religionis sedes',
    shelf2: 'apost_letters',
    note:
      'Quinhonensis - Saigonensis (see above) founds the Nhatrang vicariate in Vietnam. ' +
      'Religionis sedes (see above) grants a Dutch parish church Minor Basilica status -- ' +
      'unrelated acts.',
  },
  'pius-xii|1950-03-12|anni-sacri|lettera-ai-rev-padri-della-compagnia-di-gesu-redattori-del-periodico-la-civilta-cattolica':
    {
      incipit1: 'Anni Sacri',
      shelf1: 'encyclicals',
      // No incipit of its own; this is the item's full title (idStatus: provisional).
      incipit2: 'Lettera ai Rev. Padri della «Compagnia di Gesù», redattori del periodico «La '
        + 'Civiltà Cattolica»',
      shelf2: 'letters',
      note:
        "Anni Sacri ('PREGHIERE PER IL RINNOVAMENTO CRISTIANO E LA CONCORDIA DEI POPOLI') calls " +
        "for prayers for Christian renewal and peace during the 1950 Holy Year. The letters-shelf " +
        "item, addressed to the Jesuit editors of La Civiltà Cattolica, commemorates the " +
        "periodical's centenary ('Sono appena trascorsi undici anni da quando... indirizzammo a " +
        "voi una lettera particolarmente elogiativa') -- an unrelated occasion.",
    },
  'pius-xii|1947-03-21|fulgens-radiatur|lettera-all-episcopato-della-cecoslovacchia-ricorrendo-il-950-anniversario-della-morte-di-s-adalberto-vescovo-di-praga-e-martire':
    {
      incipit1: 'Fulgens Radiatur',
      shelf1: 'encyclicals',
      // No incipit of its own; this is the item's full title (idStatus: provisional).
      incipit2: "Lettera all'Episcopato della Cecoslovacchia, ricorrendo il 950° anniversario "
        + 'della morte di S. Adalberto, Vescovo di Praga e Martire',
      shelf2: 'letters',
      note:
        "Fulgens Radiatur ('XIV CENTENARIO DELLA MORTE DI SAN BENEDETTO') commemorates the 1,400th " +
        "anniversary of the death of St Benedict of Nursia. The letters-shelf item, to the " +
        "bishops of Czechoslovakia, commemorates the 950th anniversary of the death of St " +
        "Adalbert, bishop and martyr of Prague ('Nono ac dimidio a Sancti Adalberti obitu exeunte " +
        "saeculo, commemorationem illius... per annum hunc vertentem sacris sollemnibus vos " +
        "celebrandam decrevistis') -- two different saints' centenaries, coincidentally dated the " +
        'same day.',
    },

  // Task 12 (Benedict XV, elected 3 September 1914). Every entry below is verified by
  // fetching both records' full text from vatican.va and comparing subject matter.
  'benedict-xv|1920-02-20|ordo-a-divo|treiensis': {
    incipit1: 'Ordo a divo',
    shelf1: 'apost_letters',
    incipit2: 'Treiensis',
    shelf2: 'apost-constitutions',
    note:
      "Ordo a divo establishes a new Benedictine congregation (the Congregation of the " +
      'Annunciation of the Blessed Virgin Mary), separating and uniting the abbeys of ' +
      "Maretiolo, Regina Caeli (from the Beuron Congregation) and St Andrew of Zevenkerken " +
      '(from the Brazilian Congregation). Treiensis permanently unites the diocese of Treia ' +
      'with the diocese of San Severino under one bishop, Adam Borghini -- an unrelated ' +
      'diocesan reorganisation on the same day.',
  },
  'benedict-xv|1919-05-14|bracarensis|in-hac-tanta': {
    // Keyed on 'Bracarensis', not 'Sedis huius' as in the original Task 12 harvest: once
    // SHELF_SPECIFICITY ranks the hyphenated apost-constitutions shelf beside
    // apost_constitutions (Task 12 review, run.ts), apost-constitutions correctly wins
    // keepMoreSpecific over bulls, so the surviving merged record's own incipit is
    // 'Bracarensis' (see DUPLICATE_MERGES).
    incipit1: 'Bracarensis',
    shelf1: 'apost-constitutions',
    incipit2: 'In Hac Tanta',
    shelf2: 'encyclicals',
    note:
      "Bracarensis (merged with its bulls twin Sedis huius -- see DUPLICATE_MERGES) " +
      'approves a revised Breviary for the Archdiocese of Braga, Portugal. In Hac Tanta ' +
      "commemorates the twelve-hundredth anniversary of St Boniface's mission to Germany, " +
      'addressed to Cardinal Félix von Hartmann, Archbishop of Cologne, and the German ' +
      'bishops -- an unrelated liturgical act in an unrelated country, coincidentally dated ' +
      'the same day.',
  },
  'benedict-xv|1920-09-15|cum-in-honorem|spiritus-paraclitus': {
    incipit1: 'Cum in honorem',
    shelf1: 'apost_letters',
    incipit2: 'Spiritus Paraclitus',
    shelf2: 'encyclicals',
    note:
      'Both mark the fifteenth centenary of the death of St Jerome, issued together the same ' +
      "day: Cum in honorem decrees a specific three-day liturgical triduum at the Basilica of " +
      "St Mary Major (17-19 December 1920) with plenary indulgences for those who attend and " +
      'confess. Spiritus Paraclitus is the doctrinal encyclical proper -- it reaffirms ' +
      "biblical inspiration and inerrancy against modernist criticism and endorses the " +
      'Pontifical Biblical Institute, but (per its own text) decrees no liturgical ' +
      'celebration itself. Two distinct acts for one occasion, not one act filed twice.',
  },
  'benedict-xv|1920-05-23|ex-quo-ecclesia|pacem-dei-munus-pulcherrimum': {
    incipit1: 'Ex quo Ecclesia',
    shelf1: 'apost_letters',
    incipit2: 'Pacem, Dei Munus Pulcherrimum',
    shelf2: 'encyclicals',
    note:
      'Ex quo Ecclesia declares Oliver Plunkett, Archbishop of Armagh and Primate of Ireland, ' +
      'Blessed, recounting his 17th-century martyrdom in England. Pacem, Dei Munus ' +
      'Pulcherrimum is the peace encyclical on restoring Christian peace after the First ' +
      'World War, addressed to the whole Church -- an unrelated act, coincidentally dated the ' +
      'same day.',
  },

  // Task 13 (John XXIII, elected 28 October 1958). Every entry below is verified against
  // each item's own printed descriptive clause on its vatican.va shelf index (the text
  // following the incipit, read directly off the fetched fixture), which already names the
  // distinct territory, dedication or subject of each act -- these are batches of unrelated
  // circumscription/patronage/liturgical acts issued the same day, a routine pattern
  // throughout this pontificate's apost_constitutions and apost_letters shelves.
  'john-xxiii|1959-05-23|angelorum-mexicanae-tlaxcalensis-con-la-quale-viene-eretta-la-diocesi-di-tlaxcala-in-messico-ricavandone-il-territorio-dalle-arcidiocesi-di-citta-del-messico-e-di-puebla-de-los-angeles|urbs-roma':
    {
      // No incipit of its own; this is the item's full title (idStatus: provisional).
      incipit1: 'Angelorum - Mexicanae (Tlaxcalensis), con la quale viene eretta la diocesi di '
        + "Tlaxcala in Messico, ricavandone il territorio dalle arcidiocesi di Città del "
        + 'Messico e di Puebla de los Ángeles',
      shelf1: 'apost_constitutions',
      incipit2: 'Urbs Roma',
      shelf2: 'apost_letters',
      note:
        'Angelorum - Mexicanae erects the diocese of Tlaxcala in Mexico, carving its ' +
        "territory from the archdioceses of Mexico City and Puebla de los Ángeles. Urbs Roma " +
        'confers the title of Minor Basilica on the Church of the Sacro Cuore Immacolato di ' +
        "Maria -- an unrelated act, one of this pontificate's routine same-day batches of " +
        'circumscription and patronage grants.',
    },
  'john-xxiii|1959-05-23|angelorum-mexicanae-tlaxcalensis-con-la-quale-viene-eretta-la-diocesi-di-tlaxcala-in-messico-ricavandone-il-territorio-dalle-arcidiocesi-di-citta-del-messico-e-di-puebla-de-los-angeles|potiora-inter':
    {
      incipit1: 'Angelorum - Mexicanae (Tlaxcalensis), con la quale viene eretta la diocesi di '
        + "Tlaxcala in Messico, ricavandone il territorio dalle arcidiocesi di Città del "
        + 'Messico e di Puebla de los Ángeles',
      shelf1: 'apost_constitutions',
      incipit2: 'Potiora inter',
      shelf2: 'apost_letters',
      note:
        'Angelorum - Mexicanae (see the previous entry) erects the diocese of Tlaxcala in ' +
        "Mexico. Potiora inter declares the Blessed Virgin Mary, under the title 'Nuestra " +
        "Señora del El Soto', Patroness of the Valle del Toranzo in Cantabria, Spain -- an " +
        'unrelated act.',
    },
  'john-xxiii|1959-05-23|angelorum-mexicanae-tlaxcalensis-con-la-quale-viene-eretta-la-diocesi-di-tlaxcala-in-messico-ricavandone-il-territorio-dalle-arcidiocesi-di-citta-del-messico-e-di-puebla-de-los-angeles|augustae-virgini':
    {
      incipit1: 'Angelorum - Mexicanae (Tlaxcalensis), con la quale viene eretta la diocesi di '
        + "Tlaxcala in Messico, ricavandone il territorio dalle arcidiocesi di Città del "
        + 'Messico e di Puebla de los Ángeles',
      shelf1: 'apost_constitutions',
      incipit2: 'Augustae Virgini',
      shelf2: 'apost_letters',
      note:
        'Angelorum - Mexicanae (see above) erects the diocese of Tlaxcala in Mexico. Augustae ' +
        'Virgini confers the title of Minor Basilica on the Church of Nostra Signora di ' +
        'Lourdes in Rio de Janeiro, Brazil -- an unrelated act in an unrelated country.',
    },
  'john-xxiii|1959-05-23|urbs-roma|verae-crucis': {
    incipit1: 'Urbs Roma',
    shelf1: 'apost_letters',
    incipit2: 'Verae Crucis',
    shelf2: 'apost_constitutions',
    note:
      'Urbs Roma (see above) grants Minor Basilica status to a Roman church. Verae Crucis -- ' +
      'Tehuantepecensis erects the diocese of San Andrés Tuxtla in Mexico, carving its ' +
      'territory from the dioceses of Tehuantepec and Veracruz-Jalapa -- an unrelated act, ' +
      "another of this day's batch.",
  },
  'john-xxiii|1959-05-23|potiora-inter|verae-crucis': {
    incipit1: 'Potiora inter',
    shelf1: 'apost_letters',
    incipit2: 'Verae Crucis',
    shelf2: 'apost_constitutions',
    note:
      'Potiora inter (see above) is the Cantabrian Marian-patronage letter. Verae Crucis (see ' +
      'above) erects the San Andrés Tuxtla diocese in Mexico -- unrelated acts.',
  },
  'john-xxiii|1959-05-23|augustae-virgini|verae-crucis': {
    incipit1: 'Augustae Virgini',
    shelf1: 'apost_letters',
    incipit2: 'Verae Crucis',
    shelf2: 'apost_constitutions',
    note:
      'Augustae Virgini (see above) is the Rio de Janeiro Minor Basilica grant. Verae Crucis ' +
      '(see above) erects the San Andrés Tuxtla diocese in Mexico -- unrelated acts.',
  },
  'john-xxiii|1959-05-21|de-diego-suarez|plantaria-novella': {
    incipit1: 'De Diego Suarez',
    shelf1: 'apost_constitutions',
    incipit2: 'Plantaria Novella',
    shelf2: 'apost_letters',
    note:
      'De Diego Suarez - Tananarivensis erects the diocese of Ambatondrazaka in Madagascar, ' +
      'carving its territory from the archdioceses of Diégo Suarez and Tananarive. Plantaria ' +
      "Novella declares St Isidore the Farmer Patron of the diocese of San Isidro in " +
      'Argentina -- an unrelated act in an unrelated country, coincidentally dated the same day.',
  },
  'john-xxiii|1959-05-04|caritatis-unitas|nagasakiensis-qui-cotidie': {
    incipit1: 'Caritatis Unitas',
    shelf1: 'apost_letters',
    incipit2: 'Nagasakiensis (Qui cotidie)',
    shelf2: 'apost_constitutions',
    note:
      'Caritatis Unitas establishes the federation of the Canonici Regolari di Sant\'Agostino ' +
      'Confederati. Nagasakiensis (Qui cotidie) raises the diocese of Nagasaki in Japan to ' +
      'metropolitan-archdiocese rank -- an unrelated act, coincidentally dated the same day.',
  },
  'john-xxiii|1959-01-10|changanacherrensis-et-aliarum|gaudii-nuntia': {
    incipit1: 'Changanacherrensis et aliarum',
    shelf1: 'apost_constitutions',
    incipit2: 'Gaudii nuntia',
    shelf2: 'apost_letters',
    note:
      'Changanacherrensis et aliarum confers the title of Archdiocese on the diocese of ' +
      "Changanacherry in India. Gaudii nuntia declares the parish church of Notre Dame de " +
      "Joie, in the diocese of Vannes (France), a Minor Basilica -- an unrelated act in an " +
      "unrelated country, one of this day's batch.",
  },
  'john-xxiii|1959-01-10|cuschensis-sicuanensi|gaudii-nuntia': {
    incipit1: 'Cuschensis (Sicuanensi)',
    shelf1: 'apost_constitutions',
    incipit2: 'Gaudii nuntia',
    shelf2: 'apost_letters',
    note:
      'Cuschensis (Sicuanensi) creates the territorial prelature of Sicuani, a see suffragan ' +
      "to the archdiocese of Cuzco in Peru. Gaudii nuntia (see above) is the unrelated Vannes " +
      'Minor Basilica grant in France.',
  },
  'john-xxiii|1960-07-25|expedit-sane|lettera-apostolica-motu-proprio-rubricarum-instructum-con-la-quale-si-approva-il-nuovo-codice-delle-rubriche-del-breviario-e-del-messale-romano':
    {
      incipit1: 'Expedit sane',
      shelf1: 'apost_letters',
      // No incipit of its own; this is the item's full title (idStatus: provisional).
      incipit2: 'Lettera Apostolica «Motu Proprio» Rubricarum Instructum con la quale si '
        + 'approva il nuovo Codice delle Rubriche del Breviario e del Messale Romano',
      shelf2: 'motu_proprio',
      note:
        'Expedit sane elects St Raphael as principal Patron and St John Mary Vianney as ' +
        'secondary Patron of the diocese of Dubuque, Iowa. The motu proprio Rubricarum ' +
        'Instructum approves the new Code of Rubrics of the Roman Breviary and Missal -- an ' +
        'unrelated, universal liturgical act coincidentally dated the same day.',
    },
  'john-xxiii|1960-07-25|lettera-apostolica-motu-proprio-rubricarum-instructum-con-la-quale-si-approva-il-nuovo-codice-delle-rubriche-del-breviario-e-del-messale-romano|qui-servatorem':
    {
      // No incipit of its own; this is the item's full title (idStatus: provisional).
      incipit1: 'Lettera Apostolica «Motu Proprio» Rubricarum Instructum con la quale si '
        + 'approva il nuovo Codice delle Rubriche del Breviario e del Messale Romano',
      shelf1: 'motu_proprio',
      incipit2: 'Qui servatorem',
      shelf2: 'apost_letters',
      note:
        'Rubricarum Instructum (see the previous entry) approves the new Code of Rubrics. Qui ' +
        'servatorem elects St Vincent de Paul Patron of the diocese of Cuttack, India -- an ' +
        'unrelated act.',
    },
  'john-xxiii|1960-02-29|de-pontificio-consilio-ecclesiasticis-italiae-tabularis-curandis-motu-proprio-che-stabilisce-il-riordinamento-degli-archivi-ecclesiastici-in-italia-ed-emana-il-nuovo-statuto|diuturno-usu':
    {
      // No incipit of its own; this is the item's full title (idStatus: provisional).
      incipit1: 'De Pontificio Consilio Ecclesiasticis Italiae Tabularis curandis Motu proprio '
        + "che stabilisce il riordinamento degli Archivi Ecclesiastici in Italia ed emana il "
        + 'nuovo Statuto',
      shelf1: 'motu_proprio',
      incipit2: 'Diuturno usu',
      shelf2: 'apost_letters',
      note:
        "This motu proprio reorganises the Ecclesiastical Archives in Italy and gives the " +
        "Pontifical Council for their care a new Statute. Diuturno usu constitutes the " +
        'Apostolic Internunciature in Turkey -- an unrelated act, coincidentally dated the ' +
        'same day.',
    },

  // Task 14 (Paul VI, elected 21 June 1963). Verified by fetching every record's full
  // text from vatican.va. The apost_constitutions shelf for this pontificate is
  // dominated by circumscription erections filed under a bare Latin toponym (Task 20's
  // curation queue, not this one's); every such item below is confirmed distinct from
  // its same-date partner simply because a diocese/territory act can never be the
  // subject-matter of a differently-shelved patronage grant, basilica elevation,
  // encyclical or motu proprio -- and vice-versa.
  'paul-vi|1966-01-03|amidensis-chaldaeorum|motu-proprio-per-le-altre-commissioni-post-conciliari': {
    incipit1: 'Amidensis Chaldaeorum',
    shelf1: 'apost_constitutions',
    incipit2: 'Motu proprio per le altre Commissioni post-Conciliari',
    shelf2: 'motu_proprio',
    note:
      'Amidensis Chaldaeorum elevates the Chaldean see of Amida (Diyarbekir) to an ' +
      "archbishopric. The motu proprio ('LITTERAE APOSTOLICAE MOTU PROPRIO DATAE... FINIS " +
      "CONCILIO OECUMENICO VATICANO II') creates five post-conciliar commissions to carry " +
      'forward the work of Vatican II -- an unrelated act, coincidentally dated the same day.',
  },
  'paul-vi|1966-01-03|ahwaz-chaldaeorum|motu-proprio-per-le-altre-commissioni-post-conciliari': {
    incipit1: 'Ahwaz Chaldaeorum',
    shelf1: 'apost_constitutions',
    incipit2: 'Motu proprio per le altre Commissioni post-Conciliari',
    shelf2: 'motu_proprio',
    note:
      'Ahwaz Chaldaeorum erects a new Chaldean archdiocese (Ahwaz) from the territory of ' +
      'the see of Sehna. The motu proprio (see the previous entry) is the same unrelated ' +
      'act, coincidentally dated the same day.',
  },
  'paul-vi|1965-12-18|maria-virgo|nouakchottensis': {
    incipit1: 'Maria Virgo',
    shelf1: 'apost_letters',
    incipit2: 'Nouakchottensis',
    shelf2: 'apost_constitutions',
    note:
      'Maria Virgo grants patronage of Mary "Mater Ecclesiae" together with St Pius X over ' +
      'the diocese of Montes Claros, Brazil. Nouakchottensis erects the diocese of ' +
      'Nouakchott, Mauritania -- two unrelated dioceses on two different continents, ' +
      'coincidentally dated the same day.',
  },
  'paul-vi|1965-12-18|de-thailandia|maria-virgo': {
    incipit1: 'De Thailandia',
    shelf1: 'apost_constitutions',
    incipit2: 'Maria Virgo',
    shelf2: 'apost_letters',
    note:
      'De Thailandia erects the Thai ecclesiastical hierarchy (two provinces and several ' +
      'sees). Maria Virgo (see the previous entry) concerns Montes Claros, Brazil -- an ' +
      'unrelated act, coincidentally dated the same day.',
  },
  'paul-vi|1965-12-18|bambaritanae|maria-virgo': {
    incipit1: 'Bambaritanae',
    shelf1: 'apost_constitutions',
    incipit2: 'Maria Virgo',
    shelf2: 'apost_letters',
    note:
      'Bambaritanae erects the diocese of Bambari, Central African Republic. Maria Virgo ' +
      '(see above) concerns Montes Claros, Brazil -- an unrelated act, coincidentally ' +
      'dated the same day.',
  },
  'paul-vi|1965-12-07|ambulate-in-dilectione|mirificus-eventus': {
    incipit1: 'Ambulate in dilectione',
    shelf1: 'apost_letters',
    incipit2: 'Mirificus eventus',
    shelf2: 'apost_constitutions',
    note:
      'Mirificus eventus -- despite its shelf, not itself a circumscription act -- ' +
      'proclaims an extraordinary universal Jubilee (1 January - 29 May 1966) to mark the ' +
      'close of Vatican II. Ambulate in dilectione lifts the mutual excommunications of ' +
      '1054 between Rome and Constantinople (the joint declaration with Patriarch ' +
      'Athenagoras I) -- an unrelated act, coincidentally dated the same day (the closing ' +
      'day of the Council).',
  },
  'paul-vi|1965-12-07|mirificus-eventus|quo-firmiores': {
    incipit1: 'Mirificus eventus',
    shelf1: 'apost_constitutions',
    incipit2: 'Quo firmiores',
    shelf2: 'apost_letters',
    note:
      'Mirificus eventus (see the previous entry) proclaims the Jubilee marking the close ' +
      'of Vatican II. Quo firmiores elevates the Apostolic Internunciature in Indonesia to ' +
      'a full Nunciature -- an unrelated act, coincidentally dated the same day.',
  },
  'paul-vi|1965-12-07|altissimi-cantus|mirificus-eventus': {
    incipit1: 'Altissimi cantus',
    shelf1: 'motu_proprio',
    incipit2: 'Mirificus eventus',
    shelf2: 'apost_constitutions',
    note:
      'Altissimi cantus commemorates the seventh centenary of the birth of Dante Alighieri ' +
      'and establishes a Chair of Dante Studies in Milan. Mirificus eventus (see above) ' +
      'proclaims the Vatican II closing Jubilee -- an unrelated act, coincidentally dated ' +
      'the same day.',
  },
  'paul-vi|1965-12-07|integrae-servandae|mirificus-eventus': {
    incipit1: 'Integrae servandae',
    shelf1: 'motu_proprio',
    incipit2: 'Mirificus eventus',
    shelf2: 'apost_constitutions',
    note:
      "Integrae servandae renames the Holy Office to the Congregation for the Doctrine of " +
      'the Faith and reforms its procedure. Mirificus eventus (see above) proclaims the ' +
      'Vatican II closing Jubilee -- an unrelated act, coincidentally dated the same day ' +
      '(both, along with the entries above and below, are among the raft of acts Paul VI ' +
      'promulgated on the Council\'s own closing day).',
  },
  'paul-vi|1965-12-07|altissimi-cantus|ambulate-in-dilectione': {
    incipit1: 'Altissimi cantus',
    shelf1: 'motu_proprio',
    incipit2: 'Ambulate in dilectione',
    shelf2: 'apost_letters',
    note:
      'Altissimi cantus (Dante centenary, see above) and Ambulate in dilectione (lifting ' +
      'the 1054 excommunications, see above) are unrelated acts, coincidentally dated the ' +
      "same day -- the Council's closing day.",
  },
  'paul-vi|1965-12-07|ambulate-in-dilectione|integrae-servandae': {
    incipit1: 'Ambulate in dilectione',
    shelf1: 'apost_letters',
    incipit2: 'Integrae servandae',
    shelf2: 'motu_proprio',
    note:
      'Ambulate in dilectione (lifting the 1054 excommunications, see above) and Integrae ' +
      'servandae (renaming the Holy Office, see above) are unrelated acts, coincidentally ' +
      "dated the same day -- the Council's closing day.",
  },
  'paul-vi|1965-12-07|altissimi-cantus|quo-firmiores': {
    incipit1: 'Altissimi cantus',
    shelf1: 'motu_proprio',
    incipit2: 'Quo firmiores',
    shelf2: 'apost_letters',
    note:
      'Altissimi cantus (Dante centenary, see above) and Quo firmiores (elevating the ' +
      'Indonesian Internunciature, see above) are unrelated acts, coincidentally dated the ' +
      "same day -- the Council's closing day.",
  },
  'paul-vi|1965-12-07|integrae-servandae|quo-firmiores': {
    incipit1: 'Integrae servandae',
    shelf1: 'motu_proprio',
    incipit2: 'Quo firmiores',
    shelf2: 'apost_letters',
    note:
      'Integrae servandae (renaming the Holy Office, see above) and Quo firmiores ' +
      '(elevating the Indonesian Internunciature, see above) are unrelated acts, ' +
      "coincidentally dated the same day -- the Council's closing day.",
  },
  'paul-vi|1965-04-29|flos-multiplici|mense-maio': {
    incipit1: 'Flos multiplici',
    shelf1: 'apost_letters',
    incipit2: 'Mense Maio',
    shelf2: 'encyclicals',
    note:
      'Flos multiplici grants patronage of St Rose of Lima over the Peruvian Guardia ' +
      "Civil. Mense Maio is the encyclical urging May Marian devotions for the Council's " +
      'success and world peace -- an unrelated act, coincidentally dated the same day.',
  },
  'paul-vi|1964-11-04|caguensis|ex-quo-servus': {
    incipit1: 'Caguensis',
    shelf1: 'apost_constitutions',
    incipit2: 'Ex quo Servus',
    shelf2: 'apost_letters',
    note:
      'Caguensis erects the diocese of Caguas, Puerto Rico. Ex quo Servus grants Minor ' +
      'Basilica status to the shrine of Our Lady of Sameiro, Braga, Portugal -- an ' +
      'unrelated act, coincidentally dated the same day.',
  },
  'paul-vi|1964-08-06|ecclesiam-suam|tridentinae': {
    incipit1: 'Ecclesiam Suam',
    shelf1: 'encyclicals',
    incipit2: 'Tridentinae',
    shelf2: 'apost_constitutions',
    note:
      "Ecclesiam Suam is Paul VI's first encyclical, on the Church's self-awareness, " +
      'renewal and dialogue with the world. Tridentinae erects the ecclesiastical province ' +
      'of Trent -- an unrelated act, coincidentally dated the same day.',
  },
  'paul-vi|1964-08-06|ecclesiam-suam|oenipontanae': {
    incipit1: 'Ecclesiam Suam',
    shelf1: 'encyclicals',
    incipit2: 'Oenipontanae',
    shelf2: 'apost_constitutions',
    note:
      'Ecclesiam Suam (see the previous entry) is unrelated to Oenipontanae, which raises ' +
      'Innsbruck-Feldkirch to a diocese -- coincidentally dated the same day (both fall ' +
      'within the same batch of acts promulgated alongside the encyclical).',
  },
  'paul-vi|1964-03-25|barcinonensis|pastoralem-curam': {
    incipit1: 'Barcinonensis',
    shelf1: 'apost_constitutions',
    incipit2: 'Pastoralem curam',
    shelf2: 'apost_letters',
    note:
      'Barcinonensis elevates Barcelona to an archdiocese exempt from Tarragona. ' +
      'Pastoralem curam grants patronage of St Matthew over the Portuguese Guarda Fiscal ' +
      '-- an unrelated act, coincidentally dated the same day.',
  },
  'paul-vi|1964-03-25|matritensis|pastoralem-curam': {
    incipit1: 'Matritensis',
    shelf1: 'apost_constitutions',
    incipit2: 'Pastoralem curam',
    shelf2: 'apost_letters',
    note:
      'Matritensis elevates Madrid to an archdiocese exempt from Toledo. Pastoralem curam ' +
      '(see the previous entry) is unrelated, coincidentally dated the same day.',
  },
  'paul-vi|1964-03-04|adorate-in-monte|chulucanensis': {
    incipit1: 'Adorate in monte',
    shelf1: 'apost_letters',
    incipit2: 'Chulucanensis',
    shelf2: 'apost_constitutions',
    note:
      'Adorate in monte grants Minor Basilica status to the shrine church of Sonntagberg, ' +
      'Austria. Chulucanensis erects the prelature of Chulucanas, Peru -- an unrelated ' +
      'act, coincidentally dated the same day.',
  },
  'paul-vi|1964-02-25|garzonensis-neivensis|ordinis-dominiciani': {
    incipit1: 'Garzonensis-Neivensis',
    shelf1: 'apost_constitutions',
    incipit2: 'Ordinis Dominiciani',
    shelf2: 'apost_letters',
    note:
      'Garzonensis-Neivensis restructures/renames the diocese of Garzón, Colombia, to ' +
      'Garzón-Neiva. Ordinis Dominiciani grants patronage of St Albert the Great over a US ' +
      'Dominican province -- an unrelated act, coincidentally dated the same day.',
  },
  'paul-vi|1963-07-01|hospes-eram|silvae-portuensis': {
    incipit1: 'Hospes eram',
    shelf1: 'apost_letters',
    incipit2: 'Silvae Portuensis',
    shelf2: 'apost_constitutions',
    note:
      'Hospes eram grants patronage of St Martha over Italian hoteliers and restaurant ' +
      'workers. Silvae Portuensis erects the diocese of Lusitânia/Silva Porto (now Kuito), ' +
      'Angola -- an unrelated act, coincidentally dated the same day.',
  },
  'paul-vi|1963-06-25|belemensis-de-para|memoratu-digna': {
    incipit1: 'Belemensis de Parà',
    shelf1: 'apost_constitutions',
    incipit2: 'Memoratu digna',
    shelf2: 'apost_letters',
    note:
      'Belemensis de Parà erects the prelature of Marajó, Brazil (from the territory of ' +
      'Belém do Pará). Memoratu digna grants patronage of St Rose of Lima over the diocese ' +
      'of Santa Rosa, California -- an unrelated act, coincidentally dated the same day.',
  },
  'paul-vi|1966-05-03|mbuji-mayensis|summi-dei-beneficio': {
    incipit1: 'Mbuji-Mayensis',
    shelf1: 'apost_constitutions',
    incipit2: 'Summi Dei beneficio',
    shelf2: 'motu_proprio',
    note:
      'Mbuji-Mayensis erects the diocese of Mbuji-Mayi, Congo. Summi Dei beneficio ' +
      "extends the Mirificus eventus Jubilee (see above) to 8 December 1966 -- an " +
      'unrelated act, coincidentally dated the same day.',
  },

  // This particular collision only arises after DATE_CORRECTIONS moves Arundelliensis -
  // Brichtelmestunensis (the 1967 instance) from its printed 10 June 1967 to its own
  // dating formula's 10 July 1967 -- which happens to land on the same day as an
  // unrelated apost_letters act.
  'paul-vi|1967-07-10|arundelliensis-brichtelmestunensis|propugnaculum-fidei': {
    incipit1: 'Arundelliensis - Brichtelmestunensis',
    shelf1: 'apost_constitutions',
    incipit2: 'Propugnaculum fidei',
    shelf2: 'apost_letters',
    note:
      "Arundelliensis - Brichtelmestunensis opens 'IN ECCLESIA ARUNDELLIENSI-" +
      "BRICHTELMESTUNENSI CATHEDRALE COLLEGIUM CANONICORUM CONSTITUITUR' -- it establishes " +
      "a cathedral chapter of canons for the diocese of Arundel and Brighton (England). " +
      "Propugnaculum fidei opens 'Propugnaculum fidei artisque opus egregium praedicatur " +
      "templum paroeciale Cervenense... intra fines Plocensis dioecesis positum' -- it " +
      'raises the parish church of Czerwińsk, in the diocese of Płock (Poland), to the ' +
      'status of a minor basilica. Two unrelated acts for two unrelated countries, ' +
      'coincidentally dated the same day.',
  },

  // Task 14 review (Paul VI), remaining batch. Verified by fetching each record's own
  // vatican.va page and reading its own heading/dating text.
  'paul-vi|1972-08-15|ad-pascendum|perusinae': {
    incipit1: 'Ad Pascendum',
    shelf1: 'motu_proprio',
    incipit2: 'Perusinae',
    shelf2: 'apost_constitutions',
    note:
      "Ad Pascendum is the motu proprio establishing norms on the diaconate ('con la quale " +
      "vengono stabilite alcune norme sul diaconato'). Perusinae erects the ecclesiastical " +
      "province of Perugia, Italy ('Provincia ecclesiastica Perusina in Italia conditur'). " +
      'Unrelated acts, coincidentally both dated 15 August 1972 (the Assumption, and the ' +
      "10th year of the pontificate -- three Italian provinces (Perusinae, Aquilanae, " +
      'Anconitanae) and two universal disciplinary motu proprios were all issued this same ' +
      'feast day).',
  },
  'paul-vi|1972-08-15|ministeria-quaedam|perusinae': {
    incipit1: 'Ministeria quaedam',
    shelf1: 'motu_proprio',
    incipit2: 'Perusinae',
    shelf2: 'apost_constitutions',
    note:
      "Ministeria quaedam renews the discipline of first tonsure, minor orders and the " +
      "subdiaconate in the Latin Church ('viene rinnovata la disciplina riguardante la " +
      "prima tonsura, gli ordini minori e il suddiaconato'). Perusinae (see above) is " +
      'unrelated, coincidentally dated the same day.',
  },
  'paul-vi|1972-08-15|ad-pascendum|aquilanae': {
    incipit1: 'Ad Pascendum',
    shelf1: 'motu_proprio',
    incipit2: 'Aquilanae',
    shelf2: 'apost_constitutions',
    note:
      "Ad Pascendum (see above) is unrelated to Aquilanae, which erects the ecclesiastical " +
      "province of L'Aquila, Italy ('Provincia ecciesiastica Aquilana Italia conditur') -- " +
      'coincidentally dated the same day.',
  },
  'paul-vi|1972-08-15|aquilanae|ministeria-quaedam': {
    incipit1: 'Aquilanae',
    shelf1: 'apost_constitutions',
    incipit2: 'Ministeria quaedam',
    shelf2: 'motu_proprio',
    note:
      'Aquilanae (see above) is unrelated to Ministeria quaedam (see above), coincidentally ' +
      'dated the same day.',
  },
  'paul-vi|1972-08-15|ad-pascendum|anconitanae': {
    incipit1: 'Ad Pascendum',
    shelf1: 'motu_proprio',
    incipit2: 'Anconitanae',
    shelf2: 'apost_constitutions',
    note:
      "Ad Pascendum (see above) is unrelated to Anconitanae, which erects the ecclesiastical " +
      "province of Ancona, Italy ('Provincia ecclesiastica Anconitana in Italia conditur') " +
      '-- coincidentally dated the same day.',
  },
  'paul-vi|1972-08-15|anconitanae|ministeria-quaedam': {
    incipit1: 'Anconitanae',
    shelf1: 'apost_constitutions',
    incipit2: 'Ministeria quaedam',
    shelf2: 'motu_proprio',
    note:
      'Anconitanae (see above) is unrelated to Ministeria quaedam (see above), coincidentally ' +
      'dated the same day.',
  },
  'paul-vi|1972-03-25|singidaensis|sollemne-semper': {
    incipit1: 'Singidaënsis',
    shelf1: 'apost_constitutions',
    incipit2: 'Sollemne semper',
    shelf2: 'apost_letters',
    note:
      "Singidaënsis (own heading 'Taboraënsis et aliarum (Singidaënsis)') erects the diocese " +
      "of Singida, Tanzania, from Tabora and other dioceses ('Detractis nonnullis " +
      "territoriis a Taboraënsi aliisque dioecesibus, nova conditur dioecesis Singidaënsis " +
      "appellanda'). Sollemne semper declares St Thomas the Apostle 'Apostle of India' and " +
      "raises his feast to a solemnity there ('S. Thomas apostolus «Indiae apostoli» titulo " +
      "decoratur cuius festum datur gradu sollemnitatis celebrari in ea dicione'). Unrelated " +
      'acts (Tanzania vs. India), coincidentally dated the same day.',
  },
  'paul-vi|1972-03-25|ioannopolitanae-a-lacubus-et-gusmanopolitanae|sollemne-semper': {
    incipit1: 'Ioannopolitanae a Lacubus et Gusmanopolitanae',
    shelf1: 'apost_constitutions',
    incipit2: 'Sollemne semper',
    shelf2: 'apost_letters',
    note:
      "This constitution (own heading 'Guadalaiarensis-Colimensi (Ioannopolitanae a Lacubus " +
      "et Gusmanopolitanae)') erects two new Mexican dioceses from the territory of " +
      "Guadalajara and Colima ('Detractis quibusdam territoriis ab Ecclesiis Guadalaiarensi " +
      "et Colimensi duae dioeceses constituuntur, nomine «Ioannopolitana a Lacubus» et " +
      "«Gusmanopolitana»'). Sollemne semper (see above) is unrelated (Mexico vs. India), " +
      'coincidentally dated the same day.',
  },
  'paul-vi|1969-11-19|s-ioannis-portoricensis|sancti-ioannis-maguanensis': {
    incipit1: 'S. Ioannis Portoricensis',
    shelf1: 'apost_letters',
    incipit2: 'Sancti Ioannis Maguanensis',
    shelf2: 'apost_constitutions',
    note:
      'The two incipits both contain "Ioannis" and could look like the same underlying ' +
      'toponym at a glance, but they name two unrelated places in two different countries: ' +
      "Sancti Ioannis Maguanensis raises the prelature of San Juan de la Maguana, Dominican " +
      "Republic, to a diocese, keeping its existing name and boundaries ('Praelatura Sancti " +
      "Ioannis Maguanensis ad dioecesis gradum attollitur, eodem servato nomine iisdemque " +
      "finibus'). S. Ioannis Portoricensis declares Our Lady of Divine Providence principal " +
      "patroness of the whole nation of Puerto Rico ('Beata Maria Virgo a Divina " +
      "Providentia... cunctae Nationis Portoricensis Patrona principalis constituitur ac " +
      "declaratur'). Distinct countries, distinct subjects, coincidentally dated the same day.",
  },
  'paul-vi|1969-06-24|kayanae|sollicitudo-omnium-ecclesiarum': {
    incipit1: 'Kayanae',
    shelf1: 'apost_constitutions',
    incipit2: 'Sollicitudo omnium Ecclesiarum',
    shelf2: 'motu_proprio',
    note:
      "Kayanae (own heading 'Uagaduguensis-Kupelaënsis (Kayanae)') erects the diocese of " +
      "Kaya, Burkina Faso, from Ouagadougou/Koupéla territory ('Ab Ecclesiis Uagaduguensi " +
      "atque Kupelaënsi separato territorio civilis provinciae Kayanae, nova dioecesis " +
      "efficitur, «Kayana» nomine'). Sollicitudo omnium Ecclesiarum is the motu proprio on " +
      "the office of papal representatives ('riguardante l'Ufficio dei rappresentanti del " +
      "Pontefice Romano'). Unrelated acts, coincidentally dated the same day.",
  },
  'paul-vi|1969-06-24|osakaensis|sollicitudo-omnium-ecclesiarum': {
    incipit1: 'Osakaënsis',
    shelf1: 'apost_constitutions',
    incipit2: 'Sollicitudo omnium Ecclesiarum',
    shelf2: 'motu_proprio',
    note:
      "Osakaënsis erects the ecclesiastical province of Osaka, Japan ('Provincia " +
      "ecclesiastica Osakaënsis constituitur'; its own dating formula, 'Datum Romae... die " +
      "quarto et vicesimo mensis iunii... 1969... Pontificatus Nostri septimo', confirms 24 " +
      "June 1969 despite the page's own <title> tag misprinting '29 m. Maii' -- an internal " +
      "vatican.va inconsistency within this one document, not a harvest error, since the " +
      "shelf index and URL slug both already agree with the body's own dating formula). " +
      'Sollicitudo omnium Ecclesiarum (see above) is unrelated, coincidentally dated the ' +
      'same day.',
  },
  'paul-vi|1969-04-25|instans-illa|maganguensis': {
    incipit1: 'Instans illa',
    shelf1: 'apost_letters',
    incipit2: 'Maganguënsis',
    shelf2: 'apost_constitutions',
    note:
      "Instans illa erects the Apostolic Nunciature in Thailand ('In Thailandia Nnntiatura " +
      "Apostolica conditur, nomine Thailandensis'). Maganguënsis (own heading " +
      "'Carthaginensis in Columbia-Sancti Georgii (Maganguënsis)') erects a new Colombian " +
      "diocese from Cartagena and the Vicariate of San Jorge ('Quibusdam detractis " +
      "territoriis ab archidioecesi Carthaginensi in Columbia et ab apostolico vicariatu " +
      "Sancti Georgii, nova dioecesis conditur, nomine «Maganguënsis»'). Unrelated acts " +
      '(Thailand vs. Colombia), coincidentally dated the same day -- one of a six-document ' +
      "batch of unrelated Colombian/Philippine circumscription acts all issued 25 April " +
      '1969 alongside this one Thai nunciature letter.',
  },
  'paul-vi|1969-04-25|instans-illa|monteriensis-s-georgii': {
    incipit1: 'Instans illa',
    shelf1: 'apost_letters',
    incipit2: 'Monteriensis-S. Georgii',
    shelf2: 'apost_constitutions',
    note:
      "Instans illa (see above) is unrelated to Monteriensis-S. Georgii (own heading " +
      "'Monteriensis-Sancti Georgii (Sinuensis Superioris)'), which erects a new prelature " +
      "from the territory of Montería and San Jorge, Colombia ('Detractis quibusdam " +
      "territoriis ab Ecclesiis Monteriensi et S. Georgii, nova praelatura conditur, " +
      "«Sinuensis Superioris» cognominanda') -- coincidentally dated the same day.",
  },
  'paul-vi|1969-04-25|instans-illa|sincelejensis': {
    incipit1: 'Instans illa',
    shelf1: 'apost_letters',
    incipit2: 'Sincelejensis',
    shelf2: 'apost_constitutions',
    note:
      "Instans illa (see above) is unrelated to Sincelejensis (own heading 'Carthaginensis " +
      "in Columbia-Sancti Georgii (Sincelejensis)'), a second new Colombian diocese carved " +
      "from Cartagena and San Jorge that same day ('Detractis quibusdam territoriis ab " +
      "archidioecesi Carthaginensi in Columbia et a vicariatu apostolico Sancti Georgii, " +
      "nova conditur dioecesis, «Sincelejensis» appellanda') -- coincidentally dated the " +
      'same day.',
  },
  'paul-vi|1969-04-25|barranquillensis|instans-illa': {
    incipit1: 'Barranquillensis',
    shelf1: 'apost_constitutions',
    incipit2: 'Instans illa',
    shelf2: 'apost_letters',
    note:
      "Barranquillensis erects the ecclesiastical province of Barranquilla, Colombia " +
      "('Nova provincia ecclesiastica conditur, «Barranquillensis» nomine, cuius erit " +
      "metropolitana Sedes ipsa Barranquillensis'). Instans illa (see above) is unrelated, " +
      'coincidentally dated the same day.',
  },
  'paul-vi|1969-04-25|instans-illa|malaibalaiensis': {
    incipit1: 'Instans illa',
    shelf1: 'apost_letters',
    incipit2: 'Malaibalaiensis',
    shelf2: 'apost_constitutions',
    note:
      "Instans illa (see above) is unrelated to Malaibalaiensis (own heading 'Cagayanae " +
      "(Malaibalaiensis)'), a new Philippine prelature carved from the archdiocese of " +
      "Cagayan de Oro ('Detractis quibusdam territoriis ab archidioecesi Cagayana, nova " +
      "conditur praelatura, nomine «Malaibalaiensis»') -- coincidentally dated the same day.",
  },
  'paul-vi|1969-04-25|instans-illa|valleduparensis': {
    incipit1: 'Instans illa',
    shelf1: 'apost_letters',
    incipit2: 'Valleduparensis',
    shelf2: 'apost_constitutions',
    note:
      "Instans illa (see above) is unrelated to Valleduparensis, which raises the Colombian " +
      "vicariate apostolic of Valledupar to a diocese ('Vicariatus apostolicus " +
      "Valleduparensis ad dignitatem dioecesis evehitur') -- coincidentally dated the same day.",
  },
  'paul-vi|1967-06-28|antofagastensis|nullis-maculis': {
    incipit1: 'Antofagastensis',
    shelf1: 'apost_constitutions',
    incipit2: 'Nullis maculis',
    shelf2: 'apost_letters',
    note:
      "Antofagastensis erects the ecclesiastical province of Antofagasta, Chile ('In " +
      "Chilensi Republica nova constituitur provincia ecclesiastica, «Antofagastensis» " +
      "appellanda'). Nullis maculis declares Our Lady Immaculate and Sts Peter and Paul " +
      "patrons of the diocese of Mazatlán, Mexico ('Beata Maria Virgo Immacolata et Sancti " +
      "Apostoli Petrus et Paulus Patroni caelestes dioecesis Mazatlanensis eliguntur'). " +
      'Unrelated acts (Chile vs. Mexico), coincidentally dated the same day.',
  },
  'paul-vi|1967-06-28|actuose-pietatis|antofagastensis': {
    incipit1: 'Actuose pietatis',
    shelf1: 'apost_letters',
    incipit2: 'Antofagastensis',
    shelf2: 'apost_constitutions',
    note:
      "Actuose pietatis grants minor-basilica status to a Carmelite conventual church in " +
      "Jerez, Spain ('Titulus ac privilegia Basilicae Minoris ecclesiae conventuali, B. " +
      "Mariae Virgini de Monte Carmelo in urbe Xeretio dicatae, attribuuntur'). " +
      'Antofagastensis (see above) is unrelated (Spain vs. Chile), coincidentally dated the ' +
      'same day.',
  },
  'paul-vi|1966-06-25|bellomontensis|praenobile-templum': {
    incipit1: 'Bellomontensis',
    shelf1: 'apost_constitutions',
    incipit2: 'Praenobile templum',
    shelf2: 'apost_letters',
    note:
      "Bellomontensis (own heading 'Galvestoniensis-Houstoniensis (Bellomontensis)') erects " +
      "the diocese of Beaumont, Texas, by dividing Galveston-Houston ('Divisa dioecesi " +
      "Galvestoniensi-Houstoniensi, nova inde efficitur dioecesis «Bellomontensis» " +
      "appellanda'). Praenobile templum grants minor-basilica status to a parish church in " +
      "Elorrio, Spain ('Titulus ac privilegia Basilicae Minoris tribuuntur ecclesiae " +
      "paroeciali... in oppido «Elorrio» exstanti, Flaviobrigensis dioecesis'). Unrelated " +
      'acts (Texas vs. Spain), coincidentally dated the same day -- one of a four-document ' +
      'batch (this pair plus the next two) all issued 25 June 1966.',
  },
  'paul-vi|1966-06-25|bellomontensis|nursia-amoena': {
    incipit1: 'Bellomontensis',
    shelf1: 'apost_constitutions',
    incipit2: 'Nursia, amoena',
    shelf2: 'apost_letters',
    note:
      "Bellomontensis (see above) is unrelated to Nursia amoena, which grants minor-basilica " +
      "status to the church of St Benedict, patron of Europe, in Norcia, Italy ('Titulus ac " +
      "privilegia Basilicae Minoris Nursinae ecclesiae Sancti Benedicti Abbatis, Europae " +
      "Patroni, conferuntur') -- coincidentally dated the same day.",
  },
  'paul-vi|1966-06-25|bellomontensis|lutetiae-parisiorum': {
    incipit1: 'Bellomontensis',
    shelf1: 'apost_constitutions',
    incipit2: 'Lutetiae Parisiorum',
    shelf2: 'apost_letters',
    note:
      "Bellomontensis (see above) is unrelated to Lutetiae Parisiorum, which grants " +
      "minor-basilica status to Notre-Dame du Perpétuel Secours in Paris ('Titulo ac " +
      "privilegiis Basilicae Minoris Parisiense templum Beatae Mariae Virginis a Perpetuo " +
      "Succursu... decoratur') -- coincidentally dated the same day.",
  },
  'paul-vi|1966-04-30|barquisimetensis|humilis-religiosi': {
    incipit1: 'Barquisimetensis',
    shelf1: 'apost_constitutions',
    incipit2: 'Humilis religiosi',
    shelf2: 'apost_letters',
    note:
      "Barquisimetensis erects the ecclesiastical province of Barquisimeto, Venezuela " +
      "('Nova constituitur in Venetiolana Republica provincia ecclesiastica, cuius caput " +
      "est Ecclesia metropolitana «Barquisimetensis»'). Humilis religiosi (its own heading " +
      "prints 'Humilis religionis') grants minor-basilica status to a church in Curvelo, " +
      "Brazil ('Titulo ac privilegiis Basilicae Minoris ecclesia Sancti Gerardi Majella in " +
      "oppido «Curvelo», intra fines archidioecesis Adamantinae posita, decoratur'). " +
      'Unrelated acts (Venezuela vs. Brazil), coincidentally dated the same day -- one of a ' +
      'four-document batch (this pair plus the next three) all issued 30 April 1966.',
  },
  'paul-vi|1966-04-30|barquisimetensis|populus-haitianus': {
    incipit1: 'Barquisimetensis',
    shelf1: 'apost_constitutions',
    incipit2: 'Populus Haitianus',
    shelf2: 'apost_letters',
    note:
      "Barquisimetensis (see above) is unrelated to Populus Haitianus, which declares Our " +
      "Lady of Perpetual Help principal patroness of the ecclesiastical province of Haiti " +
      "('Beata Virgo Maria, quae vulgo «Notre-Dame du Perpétuel Secours» appellatur, " +
      "praecipua ecclesiasticae Haitianae provinciae Patrona eligitur') -- coincidentally " +
      'dated the same day.',
  },
  'paul-vi|1966-04-30|humilis-religiosi|maracaibensis': {
    incipit1: 'Humilis religiosi',
    shelf1: 'apost_letters',
    incipit2: 'Maracaibensis',
    shelf2: 'apost_constitutions',
    note:
      "Humilis religiosi (see above, Brazil) is unrelated to Maracaibensis, which erects " +
      "the ecclesiastical province of Maracaibo, Venezuela ('Nova provincia ecclesiastica " +
      "in Venetiola conditur, cuius metropolitana Sedes «Maracaibensis» erit') -- " +
      'coincidentally dated the same day. (Barquisimeto and Maracaibo are two distinct new ' +
      'Venezuelan provinces erected the same day, each with its own metropolitan see.)',
  },
  'paul-vi|1966-04-30|maracaibensis|populus-haitianus': {
    incipit1: 'Maracaibensis',
    shelf1: 'apost_constitutions',
    incipit2: 'Populus Haitianus',
    shelf2: 'apost_letters',
    note:
      'Maracaibensis (see above) is unrelated to Populus Haitianus (see above), ' +
      'coincidentally dated the same day.',
  },
  'paul-vi|1971-06-29|evangelica-testificatio|magnum-semper': {
    incipit1: 'Evangelica Testificatio',
    shelf1: 'apost_exhortations',
    incipit2: 'Magnum semper',
    shelf2: 'apost_letters',
    note:
      "Evangelica Testificatio is the apostolic exhortation on the renewal of religious " +
      "life. Magnum semper erects the Apostolic Nunciature to Dahomey, seated in Dakar " +
      "('In Republica Dahomeyana Apostolica Nuntiatura constituitur, cuius sedes in urbe " +
      "Dakar collocabitur'). Unrelated acts, coincidentally both dated the feast of Sts " +
      'Peter and Paul, 29 June 1971.',
  },
  'paul-vi|1970-03-19|apostolicae-caritatis|sanctus-ioseph': {
    incipit1: 'Apostolicae caritatis',
    shelf1: 'motu_proprio',
    incipit2: 'Sanctus Ioseph',
    shelf2: 'apost_letters',
    note:
      "Apostolicae caritatis is the motu proprio establishing the Pontifical Commission for " +
      "the Pastoral Care of Migration and Tourism. Sanctus Ioseph raises the church of St " +
      "Joseph on the Via Trionfale, Rome, to a minor basilica ('Templum S. Ioseph ad Viam " +
      "Triumphalem, in Urbe, ad Basilicae Minoris gradum evehitur'). Unrelated acts, " +
      "coincidentally both dated the feast of St Joseph, 19 March 1970.",
  },
  'paul-vi|1966-02-02|quam-sedem|romanae-urbis': {
    incipit1: 'Quam sedem',
    shelf1: 'apost_letters',
    incipit2: 'Romanae Urbis',
    shelf2: 'motu_proprio',
    note:
      "Quam sedem erects the Apostolic Nunciature to Syria ('Apostolica Nuntiatura apud " +
      "Rempublicam Arabicam Syriacam constituitur'). Romanae Urbis is the motu proprio " +
      "reorganising the government of the Diocese of Rome itself ('Romanae dioecesis " +
      "ordinatio ad horum dierum necessitates aptius accommodatur'). Unrelated acts " +
      '(Syria vs. the Diocese of Rome), coincidentally dated the same day.',
  },
  'john-paul-i|1978-09-01|lettera-al-card-joseph-ratzinger-legato-pontificio-al-congresso-mariano-dell-ecuador|lettera-apostolica-in-occasione-della-proclamazione-di-nostra-signora-del-buon-viaggio-a-patrona-di-itabirito-brasile': {
    incipit1: 'Lettera al Card. Joseph Ratzinger, Legato Pontificio al Congresso Mariano '
      + "dell'Ecuador",
    shelf1: 'letters',
    incipit2: 'Lettera Apostolica in occasione della proclamazione di Nostra Signora del '
      + 'Buon Viaggio a patrona di Itabirito, Brasile',
    shelf2: 'apost_letters',
    note:
      "The letter to Cardinal Ratzinger (fetched directly, hf_jp-i_let_19780901_ratzinger.html) " +
      'names him "our Legate Extraordinary" to preside at the Marian Congress in Guayaquil, ' +
      "Ecuador, and closes 'Given at St Peter's, Rome, on the first day of September, in the " +
      "year 1978, the first of our Pontificate'. The apostolic letter (fetched directly, " +
      'hf_jp-i_apl_19780901_propterea-maxime.html) opens \'IOANNES PAULUS PP. I LITTERAE ' +
      "APOSTOLICAE BEATA VIRGO MARIA ... IURE NUNCUPATUR CAELESTIS APUD DEUM PATRONA OPPIDI " +
      "AC MUNICIPII ITABIRITO' and closes 'Datum Romae, apud Sanctum Petrum, sub Anulo " +
      "Piscatoris, die I mensis Septembris, anno MCMLXXVIII, Pontificatus Nostri primo' -- " +
      'declaring Our Lady of the Prosperous Journey patroness of Itabirito, Brazil. Unrelated ' +
      'acts (a legation to Ecuador vs. a Marian patronage for a Brazilian town), ' +
      'coincidentally dated the same day.',
  },
  'john-paul-i|1978-09-01|lettera-al-card-joseph-ratzinger-legato-pontificio-al-congresso-mariano-dell-ecuador|lettera-apostolica-in-occasione-dell-elevazione-del-santuario-di-nostra-signora-della-consolazione-al-titolo-di-basilica-minore-piacenza': {
    incipit1: 'Lettera al Card. Joseph Ratzinger, Legato Pontificio al Congresso Mariano '
      + "dell'Ecuador",
    shelf1: 'letters',
    incipit2: "Lettera Apostolica in occasione dell'elevazione del Santuario di Nostra "
      + 'Signora della Consolazione al titolo di Basilica Minore, Piacenza',
    shelf2: 'apost_letters',
    note:
      "The letter to Cardinal Ratzinger (fetched directly, hf_jp-i_let_19780901_ratzinger.html) " +
      'names him "our Legate Extraordinary" to preside at the Marian Congress in Guayaquil, ' +
      "Ecuador, and closes 'Given at St Peter's, Rome, on the first day of September, in the " +
      "year 1978, the first of our Pontificate'. The apostolic letter (fetched directly, " +
      'hf_jp-i_apl_19780901_progredientibus-iam.html) opens \'IOANNES PAULUS PP. I LITTERAE ' +
      "APOSTOLICAE SACRA DIOECESIS PLACENTINAE AEDES ... LEGITIME ATTOLLITUR AD CONDICIONEM " +
      "DIGNITATEMQUE BASILICAE MINORIS' and closes 'Datum Romae, apud Sanctum Petrum, sub " +
      "Anulo Piscatoris, die I mensis Septembris, anno MCMLXXVIII, Pontificatus Nostri primo' " +
      '-- raising the shrine of Our Lady of Consolation in Piacenza to the rank of minor ' +
      'basilica. Unrelated acts (a legation to Ecuador vs. a basilica elevation in Piacenza), ' +
      'coincidentally dated the same day.',
  },
};
