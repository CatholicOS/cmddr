/**
 * Circumscription erections whose heading does not say so, confirmed by hand (spec §4.5).
 *
 * Paul VI, John Paul II, Benedict XVI -- and Pius XII -- file these under a bare Latin
 * toponym -- 'Avkaënsis', 'Usbekistaniae', 'Gambomensis' -- with no textual marker at all,
 * and the documents one would most want separated out ('Vacantis Apostolicae Sedis',
 * 'Provida Mater Ecclesia', 'Sacramentum Ordinis', 'Episcopali Consecrationis') sit
 * unmarked on the same shelf. There is therefore no rule that can decide this from the
 * index page: `isErectionCandidate` in keywords.ts only *flags* them for a human to confirm
 * into this table with its evidence -- it never writes a keyword itself.
 *
 * Populated by hand, one entry per confirmed erection, each carrying the evidence (the
 * vatican.va document text) that justifies the tag -- never merely because the title has
 * toponym shape, and never a secondary source in place of the vatican.va text (review
 * finding, 2026-09-08: the exception this comment used to carry contradicted the project's
 * cardinal evidence rule and describes nothing any of the 19 entries below actually does --
 * every one of them cites vatican.va Latin text).
 *
 * Key: `${pageSlug}|${slugify(incipit ?? title)}|${isoDate}`.
 */
export const CIRCUMSCRIPTION_ERECTIONS: Record<string, CircumscriptionRow> = {
  // Task 20's first curation instalment: the entire Pius XII apostolic-constitutions
  // candidate queue (29 candidates, 1957-04-10 through 1958-05-15) read by hand against
  // its own Latin text on vatican.va. 19 confirmed below as erections. The other 10 are
  // not erections and now sit in the tables below: nine are elevations of an existing
  // circumscription's rank ('...ad gradum et dignitatem dioecesis evehimus...',
  // 'Bathurstensis in Gambia', 'Bikoroënsis', 'Musomensis', 'Spinensis', 'Copiapoënsis',
  // 'Esmeraldensis', 'Urawaënsis', 'Tangaënsis', 'Thakhekensis'), filed in
  // CIRCUMSCRIPTION_ELEVATIONS, and one ('Leonensis') is not a circumscription document at
  // all -- it raises a parish church to collegiate-church status -- and is filed in
  // CANDIDATE_ADJUDICATIONS. A bare Latin toponym cannot be told apart from either of
  // these on the index page, which is exactly why each was read individually rather than
  // confirmed by pattern.
  'pius-xii|santaremensis-obidensis|1957-04-10': {
    argumentum:
      'SANTAREMENSIS (OBIDENSIS)* DISTRACTIS QUIBUSDAM MUNICIPIIS A PRAELATURA «NULLIUS» '
      + 'SANTAREMENSI, NOVA CONDITUR PRAELATURA, «OBIDENSI» APPELLANDA.',
    note:
      'Detaches territory from the Prelature Nullius of Santarém and erects the new '
      + 'Prelature Nullius of Óbidos: "...ex eoque novam praelaturam «nullius» condimus, '
      + 'Obidensem appellandam...". The heading prints only the twin toponym.',
  },
  'pius-xii|corumbensis-registrensis-campi-grandis-auratopolitanae|1957-06-15': {
    argumentum:
      'CORUMBENSIS - REGISTRENSIS (CAMPI GRANDIS - AURATOPOLITANAE)* DISTRACTIS QUIBUSDAM '
      + 'MUNICIPIIS A CORUMBENSI DIOECESI ET A PRAELATURA «NULLIUS» REGISTRENSI, DUAE '
      + 'FORMANTUR DIOECESES «CAMPI GRANDIS» ET «AURATOPOLITANA».',
    note:
      'Detaches territory from the Diocese of Corumbá and the Prelature Nullius of Registro '
      + 'and erects two new dioceses: "...ex iisque omnibus territoriis dioecesim '
      + 'constituimus, Campi Grandis nuncupandam..." and "...ex eorumque territorio alteram '
      + 'condimus dioecesim, Auratopolitanam appellandam...".',
  },
  'pius-xii|chiapasensis-tapacolensis|1957-06-19': {
    argumentum:
      'CHIAPASENSIS (TAPACOLENSIS)* DISTRACTIS QUIBUSDAM MUNICIPIIS E CHIAPASENSI DIOECESI, '
      + 'EX IIS NOVA FIT DIOECESIS, «TAPACOLENSIS» NOMINE.',
    note:
      'Detaches territory from the Diocese of Chiapas and erects the new Diocese of '
      + 'Tapachula: "...Quam regionem in novae formam redigimus dioecesis, Tapacolensis '
      + 'appellandae...".',
  },
  'pius-xii|saltillensis-torreonensis|1957-06-19': {
    argumentum:
      'SALTILLENSIS (TORREONENSIS)* QUIBUSDAM TERRITORIIS A DIOECESI SALTILLENSI SEPARATIS, '
      + 'NOVA DIOECESIS CONDITUR QUAE «TORREONENSIS» APPELLABITUR.',
    note:
      'Detaches territory from the Diocese of Saltillo and erects the new Diocese of '
      + 'Torreón: "...quae omnia in novae dioecesis formam redigimus, Torreonensis '
      + 'appellandae...".',
  },
  'pius-xii|aleppensis-chaldaeorum|1957-07-03': {
    argumentum:
      'ALEPPENSIS CHALDAEORUM* SUBLATA APOSTOLICA ADMINISTRATIONE DE GAZIRA SUPERIORE '
      + 'CHALDAEORUM, NOVA CONDITUR DIOECESIS IN REGIONE SYRIA, QUAE «ALEPPENSIS '
      + 'CHALDAEORUM» NUNCUPABITUR.',
    note:
      'Suppresses the Apostolic Administration of Upper Gazira of the Chaldeans and, for its '
      + 'Syrian portion, erects the new Diocese of Aleppo of the Chaldeans: "...Apostolicam '
      + 'administrationem de Gazira superiore Chaldaeorum omnino exstinguimus...in novae '
      + 'formam redigimus dioecesis, Aleppensis Chaldaeorum nuncupandae...".',
  },
  'pius-xii|berytensis-chaldaeorum|1957-07-03': {
    argumentum:
      'BERYTENSIS CHALDAEORUM* IN LIBANI TERRITORIO, ADHUC SUB DICIONE APOSTOLICAE '
      + 'ADMINISTRATIONISDE GAZIRA SUPERIORE CHALDAEORUM, NOVA EFFICITUR DIOECESIS, '
      + '«BERYTENSIS CHALDAEORUM» APPELLANDA.',
    note:
      'The companion constitution to Aleppensis Chaldaeorum, issued the same day: for the '
      + 'Lebanese portion of the same suppressed administration, erects the new Diocese of '
      + 'Beirut of the Chaldeans: "...Libani territorium...in novae dioecesis formam '
      + 'redigimus, Berytensis Chaldaeorum appellandam...".',
  },
  'pius-xii|kikuitensis-kisantuensis-kengen|1957-07-05': {
    argumentum:
      'KIKUITENSIS - KISANTUENSIS (KENGEN.)* CERTIS DISTRACTIS TERRIS AB APOSTOLICIS '
      + 'VICARIATIBUS KIKUITENI ET KISANTUENSI, NOVA CONSTITUITUR APOSTOLICA PRAEFECTURA, '
      + 'KENGENSIS NOMINE.',
    note:
      'Detaches territory from the Apostolic Vicariates of Kikwit and Kisantu and erects the '
      + 'new Apostolic Prefecture of Kenge: "...ex iisque novam condi praefecturam '
      + 'apostolicam...eaque in novae formam redigimus apostolicae praefecturae, Kengensis '
      + 'appellandae...".',
  },
  'pius-xii|quinhonensis-saigonensis-nhatrangensis|1957-07-05': {
    argumentum:
      'QUINHONENSIS-SAIGONENSIS (NHATRANGENSIS)* A VICARIATIBUS APOSTOLICIS QUINHONENSI ET '
      + 'SAIGONENSI QUAEDAM TERRITORIA DETRAHUNTUR, QUIBUS NOVUS CONDITUR APOSTOLICUS '
      + 'VICARIATUS.',
    note:
      'Detaches territory from the Apostolic Vicariates of Qui Nhon and Saigon and erects '
      + 'the new Apostolic Vicariate of Nha Trang: "...Ex quibus terris novum vicariatum '
      + 'condimus, qui ab urbe Nhatrang...Nhatrangensis appellabitur...".',
  },
  'pius-xii|rabaulensis-kaviengensis|1957-07-05': {
    argumentum:
      'RABAULENSIS (KAVIENGENSIS)* AB APOSTOLICO VICARIATU RABAULENSI QUAEDAM TERRITORIA '
      + 'DETRAHUNTUR, QUIBUS NOVUS VICARIATUS APOSTOLICUS «KAVIENGENSIS» CONSTITUITUR.',
    note:
      'Detaches territory from the Apostolic Vicariate of Rabaul and erects the new '
      + 'Apostolic Vicariate of Kavieng: "...ex eaque novum vicariatum condimus, cui nomen '
      + 'erit ab urbe principe Kaviengensis...".',
  },
  'pius-xii|amargosensis-victoriensis-de-conquista|1957-07-27': {
    argumentum:
      'AMARGOSENSIS (VICTORIENSIS DE CONQUISTA)* DETRACTIS ALIQUOT TERRITORIIS A DIOECESI '
      + 'AMARGOSENSI, NOVA ECCLESIA CONDITUR, QUAE «VICTORIENSIS DE CONQUISTA» NOMINABITUR.',
    note:
      'Detaches territory from the Diocese of Amargosa and erects the new Diocese of '
      + 'Vitória da Conquista: "...quibus ex municipiis...novam constituimus dioecesim '
      + 'Victoriensem de Conquista appellandam.".',
  },
  'pius-xii|puniensis-iuliensis|1957-08-03': {
    argumentum:
      'PUNIENSIS (IULIENSIS)* A DIOECESI PUNIENSI QUAEDAM TERRITORIA DETRAHUNTUR, QUIBUS '
      + 'NOVA PRAELATURA «NULLIUS» EFFICITUR, «IULIENSIS» APPELLANDA.',
    note:
      'Detaches territory from the Diocese of Puno and erects the new Prelature Nullius of '
      + 'Juli: "...quibus terris novam praelaturam «nullius» efficimus, Iuliensem '
      + 'appellandam...".',
  },
  'pius-xii|arequipensis-ayacuquensis-caraveliens|1957-11-21': {
    argumentum:
      'AREQÜIPENSIS - AYACUQUENSIS (CARAVELIENS.)* E DISMEMBRATIO ARCHIDIOECESI AREQUIPENSI '
      + 'ET DIOECESI AYACUQUENSI NOVA CONDITUR PRAELATURA «NULLIUS», «CARAVELIENSIS» NOMINE.',
    note:
      'Detaches territory from the Archdiocese of Arequipa and the Diocese of Ayacucho and '
      + 'erects the new Prelature Nullius of Caravelí: "...ex quibus ita disiunctis terris '
      + 'novam condimus Praelaturam «nullius», Garaveliensem [Caraveliensem] '
      + 'nuncupandam...". The heading omits the trailing period the harvested candidate '
      + 'list carries after "Caraveliens".',
  },
  'pius-xii|luandensis-silvae-portuensis-malaniensis|1957-11-25': {
    argumentum:
      'LUANDENSIS-SILVAE PORTUENSIS (MALANIENSIS)* AB ECCLESIIS LUANDENSI ET SILVAE '
      + 'PORTUENSIS QUAEDAM TERRITORIA DETRAHUNTUR, QUIBUS NOVA DIOECESIS EFFICITUR, '
      + '«MALANIENSIS» COGNOMINANDA.',
    note:
      'Detaches territory from the Archdiocese of Luanda and the Diocese of Silva Porto '
      + '(Angola) and erects the new Diocese of Malanje: "...quibus terris novam dioecesim '
      + 'condimus Malaniensem appellandam.".',
  },
  'pius-xii|rivibambensis-guarandensis|1957-12-29': {
    argumentum:
      'RIVIBAMBENSIS (GUARANDENSIS)* QUADAM REGIONE A DIOECESI RIVIBAMBENSI DETRACTA, NOVA '
      + 'ECCLESIA EFFICITUR, «GUARANDENSIS» APPELLANDA.',
    note:
      'Detaches the province of Bolívar from the Diocese of Riobamba and erects the new '
      + 'Diocese of Guaranda: "...idque in novae dioecesis formam redigimus, Guarandensis '
      + 'appellandae...".',
  },
  'pius-xii|palmensis-lagensis-palmensis-et-xapecoensis|1958-01-14': {
    argumentum:
      'PALMENSIS - LAGENSIS (PALMENSIS ET XAPECOËNSIS)* PRAELATURA NULLIUS PALMENSIS '
      + 'EXSTINGUITUR ATQUE A DIOECESI LAGENSI QUAEDAM SEPARANTUR REGIONES, EX IISQUE DUAE '
      + 'NOVAE EFFORMANTUR DIOECESES, «PALMENSIS» ET «XAPECOËNSIS» NUNCUPANDAE.',
    note:
      'Suppresses the Prelature Nullius of Palmas and, from its territory plus territory '
      + 'detached from the Diocese of Lages, erects two new dioceses: "...ex quibus novam '
      + 'dioecesim condimus Palmensem nominandam..." and "...novam dioecesim condimus '
      + 'Xapecoënsem appellandam...".',
  },
  'pius-xii|niangaraensis-dorumaensis|1958-02-24': {
    argumentum:
      'NIANGARAËNSIS (DORUMAËNSIS)* DETRACTIS QUIBUSDAM TERRITORIIS A VICARIATU APOSTOLICO '
      + 'NIANGARAËNSI, NOVA PRAEFECTURA APOSTOLICA CONSTITUITUR, «DORUMAËNSIS» '
      + 'COGNOMINANDA.',
    note:
      'Detaches territory from the Apostolic Vicariate of Niangara and erects the new '
      + 'Apostolic Prefecture of Doruma: "...Quo territorio novam praefecturam apostolicam '
      + 'condimus, Dorumaënsem appellandam...".',
  },
  'pius-xii|chilapensis-acapulcanae|1958-03-18': {
    argumentum:
      'CHILAPENSIS (ACAPULCANAE)* A CHILAPENSI DIOECESI QUAEDAM TERRITORIA SEPARANTUR, QUAE '
      + 'IN NOVAE DIOECESIS FORMAM REDIGUNTUR, «ACAPULCANAE» COGNOMINANDAE.',
    note:
      'Detaches territory from the Diocese of Chilapa and erects the new Diocese of '
      + 'Acapulco: "...ex quo distracto territorio novam efficimus dioecesim, Acapulcanam '
      + 'nuncupandam.".',
  },
  'pius-xii|huanucensis-huancayensis-tarmensis|1958-05-15': {
    argumentum:
      'HUANUCENSIS-HUANCAYENSIS (TARMENSIS)* DETRACTIS QUIBUSDAM TERRITORIIS A DIOECESIBUS '
      + 'HUANUCENSI ATQUE HUANCAYENSI, NOVA PRAELATURA «NULLIUS» CONDITUR, «TARMENSIS» '
      + 'APPELLANDA.',
    note:
      'Detaches territory from the Dioceses of Huánuco and Huancayo and erects the new '
      + 'Prelature Nullius of Tarma: "...Quibus terris novam praelaturam «nullius» '
      + 'constituimus Tarmensem appellandam.".',
  },
  'pius-xii|huanucensis-huarazensis-huariensis|1958-05-15': {
    argumentum:
      'HUANUCENSIS-HUARAZENSIS (HUARIENSIS)* A DIOECESIBUS HUANUCENSI ET HUARAZENSI QUAEDAM '
      + 'TERRITORIA DETRAHUNTUR, QUIBUS NOVA PRAELATURA «NULLIUS» EFFICITUR, «HUARIENSIS» '
      + 'APPELLANDA.',
    note:
      'The companion constitution to Huanucensis-Huancayensis, issued the same day: '
      + 'detaches further territory from the Diocese of Huánuco and from the Diocese of '
      + 'Huaraz and erects the new Prelature Nullius of Huari: "...quibus ex terris novam '
      + 'praelaturam «nullius» efficimus Huariensem appellandam...".',
  },
  // The second curation instalment (Task 3): the entire John XXIII apostolic-constitutions
  // candidate queue (27 candidates, 1958-11-07 through 1959-07-16), each read against its
  // own Latin text on vatican.va. 15 confirmed below as erections; the other 12 sit in the
  // tables below -- 5 elevations, 0 unions, and 7 adjudications (three chapters of canons
  // and four Spanish sees given a second title and a concathedral). Two of the fifteen
  // erect an ecclesiastical province rather than a see ('Durangensis (Chihuahuensis)',
  // 'Tananarivensis'). Rule for an argumentum that states two acts: the act it leads with
  // is the principal act and decides the table, and PRAETEREA / INSUPER introduces the
  // secondary one -- so 'Tananarivensis' (provinces constituted, INSUPER a prefecture
  // raised) is an erection and 'Changanacherrensis' (a see raised, PRAETEREA a province
  // constituted) an elevation; union-before-elevation-before-erection applies only where
  // one act is the vehicle of the other, as when a union's merged see 'constituitur'.
  'john-xxiii|pacensis-in-bolivia-coroicensis|1958-11-07': {
    argumentum:
      'PACENSIS IN BOLIVIA* (COROICENSIS) E PACENSI IN BOLIVIA ARCHIDIOECESI QUIBUSDAM '
      + 'DETRACTIS TERRITORIIS, NOVA CONDITUR PRAELATURA NULLIUS, « COROICENSIS » APPELLANDA.',
    note:
      'Detaches territory from the Archdiocese of La Paz and erects the new Prelature '
      + 'Nullius of Coroico: "...quibus territoriis novam efficimus praelaturam nullius, '
      + 'Coroicensem nuncupandam.".',
  },
  'john-xxiii|durangensis-chihuahuensis|1958-11-22': {
    argumentum:
      'DURANGENSIS* (CHIHUAHUENSIS) E DURANGENSI PROVINCIA ECCLESIASTICA QUIBUSDAM DETRACTIS '
      + 'DIOECESIBUS, NOVA EFFICITUR PROVINCIA ECCLESIASTICA, « CHIHUAHUENSIS » APPELLANDA.',
    note:
      'Releases the Dioceses of Chihuahua, Ciudad Juárez and Sonora from the metropolitan '
      + 'jurisdiction of Durango and erects the new ecclesiastical province of Chihuahua: '
      + '"...ex iisque novam condimus provinciam ecclesiasticam Chihuahuensem '
      + 'appellandam...". The body also makes Chihuahua the metropolitan archdiocese at its '
      + 'head ("Chihuahuensem Sedem titulo ac dignitate condecoramus metropolitanae '
      + 'archidioecesis"); the argumentum states only the erection, which is the act filed.',
  },
  'john-xxiii|durangensis-sinaloensis-mazatlanensis-con-la-quale-viene-costituita-la-diocesi-di-mazatlan-una-sede-della-chiesa-cattolica-suffraganea-dell-arcidiocesi-di-durango-in-messico|1958-11-22': {
    argumentum:
      'DURANGENSIS - SINALOENSIS* (MAZATLANENSIS) AB ARCHIDIOECESI DURANGENSI ATQUE A '
      + 'DIOECESI SINALOENSI QUIBUSDAM DETRACTIS TERRITORIIS, NOVA CONSTITUITUR DIOECESIS '
      + '« MAZATLANENSIS » APPELLANDA.',
    note:
      'Detaches territory from the Archdiocese of Durango and the Diocese of Sinaloa and '
      + 'erects the new Diocese of Mazatlán: "...Quibus territoriis novam dioecesim condimus, '
      + 'Mazatlanensem appellandam...". The record carries no incipit, so its key slugs the '
      + 'harvested Italian title.',
  },
  'john-xxiii|tananarivensis-de-diego-suarez-et-aliarum|1958-12-11': {
    argumentum:
      'TANANARIVENSIS* (DE DIEGO SUAREZ ET ALIARUM) IN INSULA MADAGASCARIA DUAE NOVAE '
      + 'PROVINCIAE ECCLESIASTICAE CONSTITUUNTUR, QUARUM EST APPELLATIO: « DE DIEGO SUAREZ » '
      + 'ET « FIANARANTSOAËNSIS »; APOSTOLICA INSUPER PRAEFECTURA TSIROANOMANDIDYENSIS AD '
      + 'GRADUM DIOECESIS TOLLITUR.',
    note:
      'Divides the ecclesiastical province of Tananarive, which until now took in every '
      + 'diocese of Madagascar, and erects two new provinces, Diégo-Suarez and Fianarantsoa, '
      + 'their sees made metropolitan: "...Ecclesiasticam provinciam Tananarivensem...'
      + 'dividimus, ita ut tres omnino in eadem Insula ecclesiasticae provinciae '
      + 'exsistant...". The secondary act (INSUPER) raises the Apostolic Prefecture of '
      + 'Tsiroanomandidy to a diocese, keeping its name and boundaries. The erection of the '
      + 'provinces is the act the argumentum leads with, and the one filed here.',
  },
  'john-xxiii|cuschensis-sicuanensi|1959-01-10': {
    argumentum:
      'CUSCHENSIS* (SICUANENSI) QUIBUSDAM AB ARCHIDIOECESI CUSCHENSI DETRACTIS TERRITORIIS, '
      + 'NOVA EFFICITUR PRAELATURA NULLIUS, « SICUANENSIS » APPELLANDA.',
    note:
      'Detaches the civil provinces of Canchis, Canas, Espinar and Chumbivilcas from the '
      + 'Archdiocese of Cuzco and erects the new Prelature Nullius of Sicuani: "...ex iisque '
      + 'novam efficimus praelaturam « nullius », Sicuanensem appellandam...".',
  },
  'john-xxiii|caiazeirasensis-campinensis-grandis-patosensis|1959-01-17': {
    argumentum:
      'CAIAZEIRASENSIS-CAMPINENSIS GRANDIS* (PATOSENSIS) E SEDIBUS CAIAZEIRASENSI ATQUE '
      + 'CAMPINENSI GRANDI QUAEDAM TERRITORIA DETRAHUNTUR, QUAE IN NOVAE DIOECESIS FORMAM '
      + 'REDIGUNTUR, « PATOSENSIS » APPELLANDAE.',
    note:
      'Detaches territory from the Dioceses of Cajazeiras and Campina Grande and erects the '
      + 'new Diocese of Patos: "...Quam universam regionem in novae dioecesis formam '
      + 'redigimus, Patosensis appellandae...".',
  },
  'john-xxiii|berberatensis-bossangoaensis|1959-02-09': {
    argumentum:
      'BERBERATENSI* (BOSSANGOAËNSIS) A BERBERATENSI DIOECESI, IN AFRICA AEQUATORIALI '
      + 'GALLICA, QUODDAM DISTRAHITUR TERRITORIUM, EX QUO NOVA CONDITUR APOSTOLICA '
      + 'PRAEFECTURA, « BOSSANGOAËNSIS » APPELLANDA.',
    note:
      'Detaches the regions of Bossangoa, Bouca, Batangafo and Paoua from the Diocese of '
      + 'Berbérati and erects the new Apostolic Prefecture of Bossangoa: "...in novae '
      + 'apostolicae praefecturae formam redigimus, Bossangoaënsis appellandae...". The '
      + 'heading prints "BERBERATENSI", as quoted.',
  },
  'john-xxiii|niameyensis-fadangurmaensis|1959-02-12': {
    argumentum:
      'NIAMEYENSIS* (FADANGURMAËNSIS) A NIAMEYENSI PRAEFECTURA APOSTOLICA, IN AFRICA '
      + 'OCCIDENTALI GALLICA, QUAEDAM SEPARANTUR TERRITORIA, E QUIBUS NOVA EFFICITUR '
      + 'PRAEFECTURA APOSTOLICA « FADANGURMAËNSIS » APPELLANDA.',
    note:
      'Detaches the regions of Dori and Fada from the Apostolic Prefecture of Niamey and '
      + "erects the new Apostolic Prefecture of Fada N'Gourma: \"...ex iisque novam condimus "
      + 'praefecturam apostolicam Fadangurmaënsem appellandam...".',
  },
  'john-xxiii|iquiquensis-aricensis|1959-02-17': {
    argumentum:
      'IQUIQUENSIS* (ARICENSIS) E DIOECESI IQUIQUENSI QUIBUSDAM DETRACTIS TERRITORIIS, NOVA '
      + 'EFFICITUR PRAELATURA NULLIUS, « ARICENSIS » APPELLANDA.',
    note:
      'Detaches the civil department of Arica from the Diocese of Iquique and erects the '
      + 'new Prelature Nullius of Arica: "...ex eoque novam praelaturam « nullius » '
      + 'condimus, Aricensem appellandam...".',
  },
  'john-xxiii|kimberleyensis-et-aliarum-bechuanalandensis|1959-04-02': {
    argumentum:
      'KIMBERLEYENSIS ET ALIARUM* (BECHUANALANDENSIS) A DIOECESIBUS KIMBERLEYENSI ET '
      + 'BULAUAIENSI, ATQUE A VICARIATU APOSTOLICO VINDHOEKENSI, QUIBUSDAM DETRACTIS '
      + 'TERRITORIIS, NOVA CONDITUR PRAEFECTURA APOSTOLICA « BECHUANALANDENSIS » APPELLANDA.',
    note:
      'Detaches the parts of the Bechuanaland Protectorate held by the Dioceses of '
      + 'Kimberley and Bulawayo and the Apostolic Vicariate of Windhoek and erects the new '
      + 'Apostolic Prefecture of Bechuanaland: "...ex iisque novam condimus praefecturam '
      + 'apostolicam, Bechuanalandensem appellandam...".',
  },
  'john-xxiii|luluaburgensis-lueboensis|1959-04-25': {
    argumentum:
      'LULUABURGENSIS* (LUEBOËNSIS) DETRACTIS QUIBUSDAM TERRITORIIS VICARIATU APOSTOLICO '
      + 'LULUABURGENSI, NOVUS VICARIATUS CONSTITUITUR, LUEBOËNSIS NOMINE',
    note:
      'Detaches territory from the Apostolic Vicariate of Luluabourg and erects the new '
      + 'Apostolic Vicariate of Luebo: "...ex eoque novum Vicariatum condimus, Lueboënsem, '
      + 'ab urbe regionis principe Luebo, cognominandum...".',
  },
  'john-xxiii|delhiensis-et-simlensis-simlensis|1959-06-04': {
    argumentum:
      'DELHIENSIS ET SIMLENSIS* (SIMLENSIS) DETRACTIS QUIBUSDAM TERRITORIIS AB ARCHIDIOECESI '
      + 'DELHIENSI ET SIMLENSI, NOVA DIOECESIS EFFICITUR, « SIMLENSIS » COGNOMINANDA',
    note:
      'Detaches districts in the Punjab and in Himachal Pradesh from the Archdiocese of '
      + 'Delhi and Simla and erects the new Diocese of Simla: "...His autem districtibus '
      + 'novam dioecesim condimus, Simlensem nomine, cuius caput urbs Simla erit...".',
  },
  'john-xxiii|ngoziensis-kitegaensis-usumburaensis-con-la-quale-viere-eretto-il-vicariato-apostolico-di-usumbura-in-burundi-ricavandone-il-territorio-dai-vicariati-apostolici-di-kitega-e-di-ngozi|1959-06-11': {
    argumentum:
      'NGOZIENSIS - KITEGAËNSIS* (USUMBURAËNSIS) A VICARIATIBUS APOSTOLICIS NGOZIENSI ET '
      + 'KITEGAËNSI QUIBUSDAM DETRACTIS TERRITORIIS, NOVUS VICARIATUS CONDITUR '
      + '« USUMBURAËNSIS » NOMINE',
    note:
      'Detaches territory from the Apostolic Vicariates of Ngozi and Kitega and erects the '
      + 'new Apostolic Vicariate of Usumbura: "...ex iisque omnibus novum Vicariatum '
      + 'Apostolicum constituimus Usumburaënsem appellandum...". The record carries no '
      + 'incipit, so its key slugs the harvested Italian title.',
  },
  'john-xxiii|portalegrensis-in-brasilia-s-crucis-in-brasilia|1959-06-20': {
    argumentum:
      'PORTALEGRENSIS IN BRASILIA* (S. CRUCIS IN BRASILIA) DETRACTIS QUIBUSDAM TERRITORIIS AB '
      + 'ARCHIDIOECESI PORTALEGRENSI IN BRASILIA, NOVA DIOECESIS CONSTITUITUR, « S. CRUCIS IN '
      + 'BRASILIA » COGNOMINANDA.',
    note:
      'Detaches territory from the Archdiocese of Porto Alegre and erects the new Diocese of '
      + 'Santa Cruz do Sul: "...Quibus terris novam dioecesim condimus, S. Crucis in Brasilia '
      + 'appellandam...".',
  },
  'john-xxiii|bugavuensis-gomaensis|1959-06-30': {
    argumentum:
      'BUKAVUENSIS* (GOMAËNSIS) E VICARIATO APOSTOLICO BUKAVUENSI, IN CONGO BELGICO, QUIBUSDAM '
      + 'DETRACTIS TERRITORIIS NOVUS EFFICITUR VICARIATUS APOSTOLICUS GOMAËNSIS APPELLANDUS.',
    note:
      'Detaches territory from the Apostolic Vicariate of Bukavu and erects the new '
      + 'Apostolic Vicariate of Goma: "...ex iisque novum Vicariatum Apostolicum condimus, '
      + 'Gomaënsem appellandum...". The page prints the salutation ("IOANNES EPISCOPUS '
      + 'SERVUS SERVORUM DEI AD PERPETUAM REI MEMORIAM") after the argumentum instead of '
      + 'before it, so the curation script ran on into it; that salutation is not part of '
      + 'the argumentum and is omitted here. The heading spells the see "Bukavuensis" where '
      + 'the harvested index (and so the key) has "Bugavuensis".',
  },
};

/**
 * The Latin each table's argumentum must contain. An apostolic constitution states its own
 * act in the all-capitals line printed under its toponym, and these are the verbs it uses.
 * Used only by the tests, to audit that a row sits in the right table -- never to classify:
 * classification is done by reading, because an erection decree also contains elevation and
 * division clauses and cannot be told apart by verb alone (spec §2.2).
 *
 * `FORMATUR`/`FORMANTUR` was added because two of the 19 hand-confirmed Pius XII erections
 * ('Corumbensis-Registrensis', 'Palmensis-Lagensis' -- each erecting two dioceses at once)
 * state the act with this passive idiom rather than any verb already listed here; the
 * pattern also matches `EFFORMATUR`/`EFFORMANTUR` as a substring, the form the second of
 * those two actually uses (spec §2.3).
 *
 * `IN ORDINEM (?:ARCHI)?DIOECESIUM` is the "placed in the rank of (arch)dioceses" idiom
 * John XXIII's 'Changanacherrensis et aliarum' uses for an elevation ('IN ORDINEM
 * ARCHIDIOECESIUM REDIGITUR'), stated with no verb the elevations pattern already listed.
 */
export const ERECTION_IDIOMS =
  /CONDITUR|CONDUNTUR|ERIGITUR|ERIGUNTUR|CONSTITUITUR|CONSTITUUNTUR|EXCITATUR|EFFICITUR|CREATUR|NOVA FIT|FORMAM REDIG|FORMATUR|FORMANTUR/;
export const ELEVATION_IDIOMS =
  /EVEHITUR|EVEHUNTUR|ELEVATUR|PERDUCITUR|ATTOLLITUR|ATTOLITUR|EXTOLLITUR|AD (?:GRADUM|DIGNITATEM|EPARCHIAE|APOSTOLICI)|IN ORDINEM (?:ARCHI)?DIOECESIUM/;
export const UNION_IDIOMS =
  /DE UNIONE|UNIONE|UNIUNTUR|UNITUR|CONIUNG|AEQUE PRINCIPALITER|DISMEMBRATIONE/;

export interface CircumscriptionRow {
  /** The document's own argumentum, verbatim: the act in its own words. */
  argumentum: string;
  /** What the act does, and anything the argumentum alone does not settle. */
  note: string;
}

/**
 * Candidates raising an existing circumscription in rank. Same evidence rule as the
 * erections table: each row quotes the document's argumentum.
 */
export const CIRCUMSCRIPTION_ELEVATIONS: Record<string, CircumscriptionRow> = {
  // The second curation instalment (Task 3), Pius XII: the nine of the ten candidates the
  // first instalment read and rejected as erections that raise an existing circumscription
  // in rank (1957-06-24 through 1958-02-24). The tenth, 'Leonensis', raises a parish church
  // to collegiate rank and sits in CANDIDATE_ADJUDICATIONS.
  'pius-xii|bathurstensis-in-gambia|1957-06-24': {
    argumentum:
      'BATHURSTENSIS IN GAMBIA* APOSTOLICA PRAEFECTURA BATHURSTENSIS AD DIGNITATEM '
      + 'DIOECESIS EVEHITUR.',
    note: 'Raises the Apostolic Prefecture of Bathurst in the Gambia to the rank of a diocese.',
  },
  'pius-xii|bikoroensis|1957-06-24': {
    argumentum:
      'BIKOROËNSIS* APOSTOLICA PRAEFECTURA BIKOROËNSIS AD GRADUM APOSTOLICI VICARIATUS '
      + 'EVEHITUR, NOMINE AC FINIBUS SERVATIS.',
    note:
      'Raises the Apostolic Prefecture of Bikoro, in the Belgian Congo, to the rank of an '
      + 'apostolic vicariate, keeping its name and boundaries: "...eodem nomine iisdemque '
      + 'finibus servatis, ad gradum apostolici vicariatus provehimus...".',
  },
  'pius-xii|musomensis|1957-07-05': {
    argumentum:
      'MUSOMENSIS* PRAEFECTURA APOSTOLICA MUSOMENSIS AD GRADUM ET DIGNITATEM DIOECESIS '
      + 'EVEHITUR.',
    note:
      'Raises the Apostolic Prefecture of Musoma to the rank of a diocese: "...Praefecturam '
      + 'Apostolicam Musomensem ad dignitatem dioecesis evehimus...".',
  },
  'pius-xii|spinensis|1957-07-15': {
    argumentum:
      'SPINENSIS* VICARIATUS PATRIARCHALIS SYRORUM, IN SUPERIORE GAZIRA, AD EPARCHIAE GRADUM '
      + 'PERDUCITUR, «SPINENSIS» APPELLANDAE.',
    note:
      'Raises the Patriarchal Vicariate of the Syrians in Upper Gazira to the rank of an '
      + 'eparchy, to be called Spinensis after its chief town, within the vicariate\'s '
      + 'existing boundaries: "...Vicariatum patriarchalem superioris Gazirae Syrorum ad '
      + 'eparchiae dignitatem evehimus, Spinensis ab urbe civilis principatus capite '
      + 'appellandae, iisdemque finibus cingendae quibus adhuc hic vicariatus est '
      + 'terminatus...". A change of rank and name for an existing circumscription, not the '
      + 'erection of a new one.',
  },
  'pius-xii|copiapoensis|1957-10-31': {
    argumentum:
      'COPIAPOËNSIS* PRAELATURA « NULLIUS » COPIAPOËNSIS AD DIGNITATEM DIOECESIS EVEHITUR.',
    note:
      'Raises the Prelature Nullius of Copiapó, erected in 1955, to the rank of a diocese, '
      + 'keeping its name and boundaries: "...ad gradum et dignitatem dioecesis extollimus, '
      + 'eodem servato nomine iisdemque finibus...".',
  },
  'pius-xii|esmeraldensis|1957-11-14': {
    argumentum:
      'ESMERALDENSIS* APOSTOLICA PRAEFECTURA ESMERALDENSIS AD DIGNITATEM VICARIATUS '
      + 'APOSTOLICI ELEVATUR, IISDEM FINIBUS ATQUE NOMINE SERVATIS.',
    note:
      'Raises the Apostolic Prefecture of Esmeraldas to the rank of an apostolic vicariate, '
      + 'keeping its name and boundaries: "...ad gradum apostolici Vicariatus evehimus, '
      + 'iisdem finibus, eodem nomine servato...".',
  },
  'pius-xii|urawaensis|1957-12-16': {
    argumentum:
      'URAWAENSIS* APOSTOLICA PRAEFECTURA URAWAËNSIS, IN IAPONIA, AD GRADUM DIOECESIS '
      + 'PERDUCITUR, NOMINE AC FINIBUS IMMUTATIS.',
    note:
      'Raises the Apostolic Prefecture of Urawa, in Japan, to the rank of a diocese, keeping '
      + 'its name and boundaries and making it suffragan to Tokyo: "...ad gradum dioecesis '
      + 'extollimus, eodem nomine iisdemque limitibus servatis...".',
  },
  'pius-xii|tangaensis|1958-02-24': {
    argumentum:
      'TANGAËNSIS* PRAEFECTURA APOSTOLICA TANGAËNSIS AD GRADUM ET DIGNITATEM DIOECESIS '
      + 'EVEHITUR, SERVATO NOMINE ATQUE FINIBUS.',
    note:
      'Raises the Apostolic Prefecture of Tanga to the rank of a diocese, keeping its name '
      + 'and boundaries and making it suffragan to Dar es Salaam: "...ad gradum et '
      + 'dignitatem dioecesis evehimus, eodem servato nomine atque finibus...".',
  },
  'pius-xii|thakhekensis|1958-02-24': {
    argumentum:
      'THAKHEKENSIS* APOSTOLICA PRAEFECTURA «THAKHEKENSIS», IN REGNO LAOTIANO, AD GRADUM '
      + 'APOSTOLICI VICARIATUS EVEHITUR, NOMINE AC FINIBUS IMMUTATIS.',
    note:
      'Raises the Apostolic Prefecture of Thakhek, in the Kingdom of Laos, to the rank of an '
      + 'apostolic vicariate, keeping its name and boundaries: "...ad apostolici vicariatus '
      + 'gradum et dignitatem evehimus, eodem nomine iisdemque finibus servatis...".',
  },
  // The second curation instalment (Task 3), John XXIII: the five of the 27 candidates that
  // raise an existing circumscription in rank (1959-01-10 through 1959-07-16). Two of them
  // ('Changanacherrensis', 'Lagosensis (Kadunaënsis)') raise a see to a metropolitan
  // archdiocese and, as the secondary act, constitute the province it heads; the elevation
  // is what each argumentum leads with (see the rule in the erections table's John XXIII
  // comment).
  'john-xxiii|changanacherrensis-et-aliarum|1959-01-10': {
    argumentum:
      'CHANGANACHERRENSIS ET ALIARUM* DIOECESIS « CHANGANACHERRENSIS » IN ORDINEM '
      + 'ARCHIDIOECESIUM REDIGITUR. NOVA PRAETEREA PROVINCIA ECCLESIASTICA CONSTITUITUR, '
      + 'EIUSDEM NOMINIS.',
    note:
      'Raises the Diocese of Changanacherry, of the Chaldean-Malabar rite, to the rank of an '
      + 'archdiocese: "...Dioecesim Changanacherrensem in ordinem archidioecesium '
      + 'redigimus, cum iuribus et honoribus, oneribus atque obligationibus...". As its '
      + 'consequence (PRAETEREA) a new ecclesiastical '
      + 'province of the same name is constituted with the new archdiocese at its head and '
      + 'Palai and Kottayam as suffragans. The elevation is the principal act; the '
      + 'argumentum states it in the "placed in the rank of archdioceses" idiom.',
  },
  'john-xxiii|munduensis|1959-02-19': {
    argumentum:
      'MUNDUENSIS* PRAEFECTURA APOSTOLICA DE MOUNDOU, IN AFRICA AEQUATORIALI GALLICA, AD '
      + 'DIOECESIS GRADUM EVEHITUR, NOMINE « MUNDUENSIS ».',
    note:
      'Raises the Apostolic Prefecture of Moundou to the rank of a diocese, to be called '
      + 'Munduensis, keeping its boundaries and making it suffragan to Bangui: '
      + '"...Apostolicam praefecturam de Moundou ad gradum et dignitatem dioecesis evehimus, '
      + 'Munduensis nomine, iisdem servatis finibus...".',
  },
  'john-xxiii|oturkpoensis|1959-04-02': {
    argumentum:
      'OTURKPOËNSIS PRAEFECTURA APOSTOLICA AD GRADUM DIOECESIS EVEHITUR, NONIINE ATQUE '
      + 'FINIBUS SERVATIS',
    note:
      'Raises the Apostolic Prefecture of Oturkpo, in Nigeria, to the rank of a diocese, '
      + 'keeping its name and boundaries and making it suffragan to Onitsha: "...Apostolicam '
      + 'praefecturam Oturkponsem in formam dioecesis redigimus, eodem nomine iisdemque '
      + 'limitibus...". The page prints no "CONSTITUTIO APOSTOLICA" heading and no asterisk '
      + 'before its argumentum, which is why the curation script abstained; the argumentum '
      + 'is quoted as the page prints it, "NONIINE" for NOMINE included.',
  },
  'john-xxiii|hiroshimaensis|1959-06-30': {
    argumentum:
      'HIROSHIMAËNSIS* APOSTOLICUS VICARIATUS HIROSHIMAËSIS AD DIGNITATEM DIOECESIS EVEHITUR.',
    note:
      'Raises the Apostolic Vicariate of Hiroshima to the rank of a diocese, keeping its '
      + 'name and boundaries: "...Apostolicum Vicariatum Hiroshimaënsem in ordinem dioecesium '
      + 'redigimus, eodem cognomine iisdemque finibus...". The argumentum prints '
      + '"HIROSHIMAËSIS", as quoted.',
  },
  'john-xxiii|lagosensis-kadunaensis|1959-07-16': {
    argumentum:
      'LAGOSENSIS* (KADUNAËNSIS) DIOECESIS KADUNAËNSIS AD GRADUM ET DIGNITATEM METROPOLITANAE '
      + 'ECCLESIAE ELEVATUR; NOVA INSUPER PROVINCIA ECCLESIASTICA CONSTITUITUR, « KADUNAËNSIS » '
      + 'NUNCUPANDA.',
    note:
      'Raises the Diocese of Kaduna to a metropolitan archdiocese and erects the new '
      + 'ecclesiastical province of Kaduna from the Dioceses of Kaduna, Jos and Oturkpo, '
      + 'released from the metropolitan jurisdiction of Lagos and Onitsha: "...novam condimus '
      + 'provinciam ecclesiasticam Kadunaënsem appellandam...Kadunaënsem praeterea Sedem ad '
      + 'gradum et dignitatem archidioecesis metropolitanae evehimus...". The argumentum '
      + 'states both acts and leads with the elevation; filed with the elevation.',
  },
};

/**
 * Candidates uniting existing circumscriptions -- merging them outright, or joining them
 * `aeque principaliter` under one bishop.
 */
export const CIRCUMSCRIPTION_UNIONS: Record<string, CircumscriptionRow> = {
  'benedict-xv|treiensis|1920-02-20': {
    argumentum: 'TREIENSIS * DE UNIONE DIOECESIS TREIENSIS CUM DIOECESI SANCTI SEVERINI',
    note:
      'Unites the Diocese of Treia with the Diocese of San Severino. A union of two existing '
      + 'sees, not the erection of a new one.',
  },
  'benedict-xv|catamarcensis-saltensis|1920-05-22': {
    argumentum:
      'CATAMARCENSIS-SALTENSIS * DE DISMEMBRATIONE TERRITORII « DE LOS ANDES » A DIOECESI '
      + 'CATAMARCENSI AC DE EIUS UNIONE DIOECESI SALTENSI',
    note:
      'Detaches the territory of Los Andes from the Diocese of Catamarca and unites it to the '
      + 'Diocese of Salta. The dismemberment serves the union; no new circumscription is '
      + 'erected, so this is a union rather than an erection.',
  },
};

export interface AdjudicationRow {
  /** What the document actually does, in plain words. Free text, not a controlled term. */
  act: string;
  argumentum: string;
  note: string;
}

/**
 * Candidates read and judged to be neither an erection, an elevation nor a union.
 *
 * Two kinds sit here. Some are circumscription acts this registry mints no term for -- a
 * suppressed see restored, a province reorganised, a title changed -- because one or two
 * documents is not yet evidence of a category (spec §3). The rest are not about
 * circumscriptions at all: their heading is a bare toponym because the *place* is the
 * subject, but the act is a revised Breviary, a chapter of canons, a parish church raised
 * to collegiate rank.
 *
 * A row here means the document was read. That is the verdict the 742 count could never
 * express, and the reason it could never reach zero (spec §1).
 */
export const CANDIDATE_ADJUDICATIONS: Record<string, AdjudicationRow> = {
  'benedict-xv|bracarensis|1919-05-14': {
    act: 'revision and approval of a new Breviary',
    argumentum: 'BRACARENSIS * REVISIO ET APPROBATIO NOVI BREVIARII',
    note:
      'Not a circumscription act. The toponym is the Archdiocese of Braga, whose proper '
      + 'Breviary this revises and approves; the heading names the see because the see owns '
      + 'the Breviary, not because the act touches its boundaries or rank.',
  },
  // The second curation instalment (Task 3), Pius XII: the one of the ten rejected
  // candidates that is not a circumscription act (1958-03-25).
  'pius-xii|leonensis|1958-03-25': {
    act: 'a parish church raised to collegiate rank',
    argumentum:
      'LEONENSIS* PAROECIALE TEMPLUM DOMINAE NOSTRAE DE GUANAJUATO, IN CIVITATE LEONENSI, AD '
      + 'GRADUM ET DIGNITATEM COLLEGIALIS AEDIS EVEHITUR.',
    note:
      'Not a circumscription act. The parish church of Our Lady of Guanajuato in León is '
      + 'raised to collegiate rank; the diocese named in the heading is untouched. The first '
      + "curation instalment identified this one by hand and recorded it in that table's "
      + 'comment, where it could not retire the candidate.',
  },
  // The second curation instalment (Task 3), John XXIII: the seven of the 27 candidates
  // that are neither an erection, an elevation nor a union (1959-01-08 through
  // 1959-04-06). Three erect a chapter of canons; four give a Spanish see a second title
  // and raise a church in the newly named city to concathedral -- a change of a
  // circumscription's title, for which this registry mints no term (spec §3).
  'john-xxiii|chihuahuensis|1959-01-08': {
    act: 'a chapter of canons erected in a metropolitan cathedral',
    argumentum:
      'CHIHUAHUENSIS* IN METROPOLITANO TEMPLO CHIHUAHUENSIS ECCLESIAE CANONICORUM COLLEGIUM '
      + 'CONSTITUITUR.',
    note:
      'Not a circumscription act. Constitutes a chapter of six canons and two prebendaries '
      + 'in the metropolitan church of Chihuahua, made metropolitan seven weeks earlier: '
      + '"...In metropolitano templo Chihuahuensi coetum Canonicorum constituimus, quod sex '
      + 'Canonicis constabit atque duobus Praebendatis...". The CONSTITUITUR of the '
      + 'argumentum erects the chapter, not a circumscription.',
  },
  'john-xxiii|botucatuensis|1959-03-07': {
    act: 'a chapter of canons erected in a metropolitan cathedral',
    argumentum:
      'BOTUCATUENSIS* IN METROPOLITANO TEMPLO BOTUCATUENSI CANONICORUM COLLEGIUM CONSTITUITUR.',
    note:
      'Not a circumscription act. Erects a chapter of two dignities and six canons in the '
      + 'metropolitan church of Botucatu: "...In metropolitano templo Botucatuensi '
      + 'Canonicorum Collegium condimus, quod ex duabus constabit Dignitatibus...atque sex '
      + 'Canonicis...". The CONSTITUITUR of the argumentum erects the chapter, not a '
      + 'circumscription.',
  },
  'john-xxiii|mindoniensis-ferrolensis|1959-03-09': {
    act: 'a second title added to a diocese and its bishop, and a church raised to concathedral',
    argumentum:
      'MINDONIENSIS* (FERROLENSIS) DIOECESI MINDONIENSI EIUSQUE ANTISTITI APPELLATIO IUNGITUR '
      + '« FERROLENS1S », CUIUS CIVITATIS TEMPLUM PRINCEPS AD DIGNITATEM CONCATHEDRALIS '
      + 'EVEHITUR.',
    note:
      'A change of title, not of rank or boundaries: joins the name "Ferrolensis" to the '
      + 'Diocese of Mondoñedo and its bishop, and raises the church of St Julian in Ferrol '
      + 'to concathedral: "...Ecclesiae Mindoniensi eiusque sacrorum Antistiti Ordinario '
      + 'titulum ac denominationem iungimus « Ferrolensem »...servata, dioecesis Mindoniensis '
      + 'cathedrae episcopalis dignitate, templum S. Iuliani...ad dignitatem concathedralis '
      + 'extollatur...". The EVEHITUR of the argumentum raises a building; the diocese keeps '
      + 'its rank. The heading prints "FERROLENS1S", as quoted.',
  },
  'john-xxiii|oriolensis-lucentinae|1959-03-09': {
    act: 'a concathedral erected and a second title added to a diocese',
    argumentum:
      'ORIOLENSIS* (LUCENTINAE) IN ORIOLENSI DIOECESI CONCATHEDRALIS AEDES CONDITUR, '
      + 'EIDEMQUE DIOECESI « LUCENTINA » DENOMINATIO ADIUNGITUR',
    note:
      'A change of title, not of rank or boundaries: joins the name "Lucentina" to the '
      + 'Diocese of Orihuela and its bishop, and raises the church of St Nicholas in Alicante '
      + 'to concathedral: "...Oriolensis Ecclesiae nomini appellationem adiungimus '
      + 'Lucentinam...templum...in urbe Lucento exstans ad gradum concathedralis '
      + 'evehimus...". The CONDITUR of the argumentum erects a church, not a circumscription.',
  },
  'john-xxiii|oxomensis-sorianae|1959-03-09': {
    act: 'a second title added to a diocese and a church raised to concathedral',
    argumentum:
      'OXOMENSIS* (SORIANAE) OXOMENSI DIOECESI DENOMINATIO SORIANA IUNGITUR. PRAETEREA '
      + 'TEMPLUM S. PETRI APOSTOLI, IBIDEM EXSTANS, AD CONCATHEDRALIS HONOREM EVEHITUR',
    note:
      'A change of title, not of rank or boundaries: joins the name "Soriana" to the Diocese '
      + 'of Osma and its bishop, and makes the church of St Peter the Apostle in Soria a '
      + 'concathedral: "...Episcopali Ecclesiae Oxomensi titulum ac denominationem Sorianae '
      + 'iungimus...templum S. Petri Apostoli quod est in urbe Soria, in ordinem '
      + 'concathedralium aedium redigimus...". The EVEHITUR of the argumentum raises a '
      + 'building; the diocese keeps its rank.',
  },
  'john-xxiii|tudensis-vicensis|1959-03-09': {
    act: 'a second title added to a diocese and a church raised to concathedral',
    argumentum:
      'TUDENSIS* (VICENSIS) TUDENSI ECCLESIAE TITULUS AC DENOMINATIO « VICENSIS » IUNGITUR; '
      + 'TEMPLUM B. MARIAE VIRG. IN CIVITATE VIGO AD GRADUM CONCATHEDRALIS EDUCITUR',
    note:
      'A change of title, not of rank or boundaries: joins the name "Vicensis" to the '
      + 'Diocese of Tui and its bishop in perpetuity, and raises the church of the Blessed '
      + 'Virgin Mary in Vigo to concathedral: "...Episcopali Ecclesiae Tudensi eiusque '
      + 'Praesuli Ordinario titulum ac denominationem Vicensis in perpetuum iungimus...templum '
      + '...in urbe Vigo, ad gradum concathedralis tollimus...". The AD GRADUM of the '
      + 'argumentum raises a building; the diocese keeps its rank.',
  },
  'john-xxiii|culiacanensis|1959-04-06': {
    act: 'a chapter of canons erected in a cathedral',
    argumentum:
      'CULIACANENSIS* IN CATHEDRALI ECCLESIA CULIACANENSI CANONICORUM COLLEGIUM CONSTITUITUR',
    note:
      'Not a circumscription act. Erects a chapter of six canons and two prebendaries in the '
      + 'cathedral of Culiacán: "...In cathedrali templo Culiacanensi Canonicorum Collegium '
      + 'condimus, quod sex constabit canonicis et duobus praebendatis...". The CONSTITUITUR '
      + 'of the argumentum erects the chapter, not a circumscription.',
  },
};
