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
  // The third curation instalment (Task 4): the entire Benedict XVI apostolic-constitutions
  // candidate queue (90 candidates, 2005-05-24 through 2013-02-22), each read against its
  // own Latin text on vatican.va. 77 confirmed below as erections; the other 13 sit in the
  // tables below -- 11 elevations, 0 unions, and 2 adjudications (a restored see and a
  // reorganisation of Mexico's provinces). Eleven of the 77 erect an ecclesiastical
  // province rather than a see ('Mariborensis', 'Buiumburaënsis', 'Ioannesburgensis',
  // 'Niameyensis', 'Diacovensis-Osijekensis', 'Toamasinensis', 'Lilongvensis',
  // 'Malaniensis', 'Saurimoënsis', 'Passofundensis', 'Pelotensis'), most of them raising
  // the see at its head in the same breath: the province is what each argumentum leads
  // with, so each is an erection under the John XXIII rule above. Where the argumentum and
  // the body describe the act differently, the argumentum governs the table and the note
  // records the body's operative clause (Ruling 9): so 'Fagarasiensis' (ARCHIEPISCOPATUS
  // MAIOR ... CONSTITUITUR, the body raising the existing metropolitan see),
  // 'Azerbaigianiensis' (CONDITUR, the body raising a mission sui iuris) and 'Cametanensis'
  // (NOVA CONDITUR DIOECESIS, the body raising a territorial prelature) are erections. The
  // curation script abstained on ten. Nine of those print no all-capitals argumentum because the page sets
  // the argumentum in sentence case, in its usual paragraph under the toponym ('In
  // Indonesia nova conditur dioecesis Maumerensis appellanda.'), so the case-delimited
  // reader stops at its first word -- one shape shared by all nine, a difference in how
  // the page was typed, not in the act; each is quoted by hand as the page prints it, and
  // its note says so. The tenth ('Sirmiensis', RESTITUITUR) matched no idiom and is an
  // adjudication. Two rows ('Gambellensis', 'Donkorkromensis' of 2010) found a new
  // apostolic vicariate on the whole territory of a prefecture of the same name -- in
  // substance a raise in rank, stated by the document as an erection and filed on its own
  // words.
  'benedict-xvi|carthaginensis|2005-05-24': {
    argumentum:
      'CARTHAGINENSIS* NOVA DIOECESIS CARTHAGINENSIS APPELLANDA IN COSTA RICA ERIGITUR',
    note:
      'Detaches 30 parishes from the Archdiocese of San José de Costa Rica and 6 from the '
      + 'Diocese of Limón and erects the new Diocese of Cartago, suffragan to San José: "...ex '
      + 'ita distractis territoriis novam dioecesim, Carthaginensem in Costa Rica '
      + 'appellandam...erigimus ac constituimus...".',
  },
  'benedict-xvi|gulbargensis|2005-06-24': {
    argumentum: 'GULBARGENSIS* IN INDIA NOVA CONDITUR DIOECESIS GULBARGENSIS',
    note:
      'Detaches the civil districts of Bidar (from the Archdiocese of Hyderabad), Gulbarga '
      + '(Diocese of Bellary) and Bijapur (Diocese of Belgaum) and erects the new Diocese of '
      + 'Gulbarga, suffragan to Bangalore: "...ex iisque distractis locis novam condimus '
      + 'dioecesim Gulbargensem...".',
  },
  'benedict-xvi|sindhudurgiensis|2005-07-05': {
    argumentum: 'SINDHUDURGIENSIS* IN INDIA NOVA CONDITUR DIOECESIS SINDHUDURGIENSIS',
    note:
      'Detaches the civil districts of Sindhudurg and Ratnagiri and two talukas of Kolhapur '
      + 'from the Diocese of Poona and erects the new Diocese of Sindhudurg, seated at '
      + 'Sawantwadi and suffragan to Bombay: "...ex ita circumscripto territorio novam '
      + 'dioecesim constituimus Sindhudurgiensem nuncupandam.".',
  },
  'benedict-xvi|auguensis|2005-07-08': {
    argumentum: 'AUGUENSIS* IN NIGERIA NOVA CONDITUR DIOECESIS AUGUENSIS APPELLANDA',
    note:
      'Detaches seven Local Government Areas from the Diocese of Enugu and erects the new '
      + 'Diocese of Awgu, suffragan to Onitsha: "...ex his distractis territoriis novam '
      + 'dioecesim constituimus Auguensem appellandam.".',
  },
  'benedict-xvi|iaipurensis|2005-07-20': {
    argumentum: 'IAIPURENSIS* IN INDIA NOVA CONDITUR DIOECESIS IAIPURENSIS APPELLANDA',
    note:
      'Detaches twelve civil districts of Rajasthan from the Diocese of Ajmer and Jaipur and '
      + 'erects the new Diocese of Jaipur, seated at Malviyanagar and suffragan to Agra: '
      + '"...ex iis novam dioecesim constituimus Iaipurensem appellandam.".',
  },
  'benedict-xvi|yorensis|2005-09-19': {
    argumentum: 'YORENSIS* IN HONDURIA NOVA CONDITUR DIOECESIS YORENSIS.',
    note:
      'Detaches nine parishes from the Archdiocese of Tegucigalpa and erects the new Diocese '
      + 'of Yoro, seated at El Progreso and suffragan to Tegucigalpa: "...ex ita distracto '
      + 'territorio novam constituimus dioecesim Yorensem...".',
  },
  'benedict-xvi|serrignensis|2005-09-21': {
    argumentum: 'SERRIGNENSIS* IN BRASILIA NOVA CONDITUR DIOECESIS SERRIGNENSIS APPELLANDA',
    note:
      'Detaches 17 municipalities from the Archdiocese of Feira de Santana and 3 from the '
      + 'Diocese of Paulo Afonso and erects the new Diocese of Serrinha, suffragan to Feira de '
      + 'Santana: "...ex ita distractis territoriis novam dioecesim Serrignensem appellandam '
      + 'erigimus ac constituimus.".',
  },
  'benedict-xvi|barianensis|2005-11-22': {
    argumentum: 'BARIANENSIS* IN VIETNAMIA NOVA CONDITUR DIOECESIS BARIANENSIS',
    note:
      'Detaches the civil province of Ba Ria-Vung Tau from the Diocese of Xuan Loc and erects '
      + 'the new Diocese of Ba Ria, suffragan to Ho Chi Minh City: "...ex eaque novam condimus '
      + 'dioecesim Barianensem...".',
  },
  'benedict-xvi|itanagariensis|2005-12-07': {
    argumentum: 'ITANAGARIENSIS* IN INDIA NOVA CONDITUR DIOECESIS ITANAGARIENSIS.',
    note:
      'Detaches ten civil districts of Arunachal Pradesh from the Diocese of Tezpur and erects '
      + 'the new Diocese of Itanagar, suffragan to Guwahati: "...ex iisque distractis locis '
      + 'novam condimus dioecesim Itanagariensem...".',
  },
  'benedict-xvi|miaoensis|2005-12-07': {
    argumentum: 'MIAOENSIS* IN INDIA NOVA CONDITUR DIOECESIS MIAOENSIS APPELLANDA.',
    note:
      'Detaches six civil districts of Arunachal Pradesh from the Diocese of Dibrugarh and '
      + 'erects the new Diocese of Miao, suffragan to Guwahati: "...ex quibus novam dioecesim '
      + 'Miaoensem nuncupandam erigimus ac constituimus.". The companion of Itanagariensis, '
      + 'issued the same day.',
  },
  'benedict-xvi|buxarensis|2005-12-12': {
    argumentum: 'BUXARENSIS* NOVA IN INDIA ERIGITUR DIOECESIS BUXARENSIS',
    note:
      'Detaches the civil districts of Buxar, Bhojpur, Bhabua and Rohtas from the Archdiocese '
      + 'of Patna and erects the new Diocese of Buxar, suffragan to Patna: "...ab '
      + 'Archidioecesi Patnensi abstrahimus et novam dioecesim Buxarensem nuncupandam '
      + 'constituimus.".',
  },
  'benedict-xvi|fagarasiensis|2005-12-14': {
    argumentum:
      'FAGARASIENSIS ET ALBAE IULIENSIS ROMENORUM* ARCHIEPISCOPATUS MAIOR FAGARASIENSIS ET '
      + 'ALBAE IULIENSIS ROMENORUM CONSTITUITUR.',
    note:
      'Constitutes the Major Archiepiscopal Church of Făgăraş and Alba Iulia of the '
      + 'Romanians, seated at Blaj. The body raises the existing metropolitan see within its '
      + 'own boundaries to that rank, on the petition "ut Ecclesia haec ad statum '
      + 'dignitatemque Archiepiscopatus Maioris attolleretur": "...memoratam Sedem in '
      + 'Ecclesiam Archiepiscopalem Maiorem titulo Fagarasiensem et Albae Iuliensis Romenorum '
      + 'erigimus, quae iisdem finibus circumscribitur, quibus antiqua Ecclesia '
      + 'Metropolitana...". The argumentum names the act constituted, and governs the table '
      + '(Ruling 9). The heading names the see in full where the harvested index (and so the '
      + 'key) has only "Fagarasiensis".',
  },
  'benedict-xvi|maumerensis|2005-12-14': {
    argumentum: 'MAUMERENSIS* In Indonesia nova conditur dioecesis Maumerensis appellanda.',
    note:
      'Detaches the eastern part (the civil regency of Sikka) of the Archdiocese of Ende and '
      + 'erects the new Diocese of Maumere, suffragan to Ende: "...ab archidioecesi Endehena '
      + 'separamus partem orientalem territorii ex quo novam dioecesim constituimus '
      + 'Maumerensem appellandam...". The page prints this argumentum in sentence case rather '
      + 'than capitals, so the case-delimited reader stopped at its first word and the '
      + 'curation script abstained; it is quoted here by hand as the page prints it.',
  },
  'benedict-xvi|uromiensis|2005-12-14': {
    argumentum: 'UROMIENSIS* Nova dioecesis constituitur in Nigeria Uromiensis appellanda.',
    note:
      'Detaches five Local Government Areas of Esan from the Archdiocese of Benin City and '
      + 'erects the new Diocese of Uromi, suffragan to Benin City: "...Novam dioecesim '
      + 'condimus Uromiensem appellandam...ab archidioecesi Urbis Beninensis seiungenda...". '
      + 'The page prints this argumentum in sentence case rather than capitals, so the '
      + 'case-delimited reader stopped at its first word and the curation script abstained; it '
      + 'is quoted here by hand as the page prints it.',
  },
  'benedict-xvi|pekhonensis|2005-12-15': {
    argumentum: 'PEKHONENSIS* IN MYANMAR NOVA CONDITUR DIOECESIS PEKHONENSIS.',
    note:
      'Detaches the southern part of the Archdiocese of Taunggyi (the townships of Pekhon, Pin '
      + 'Laung, Hsi Hseng and Maukmai) and erects the new Diocese of Pekhon, suffragan to '
      + 'Taunggyi: "...ex ita distracto territorio novam dioecesim constituimus Pekhonensem '
      + 'nuncupandam.".',
  },
  'benedict-xvi|bancoensis|2006-01-17': {
    argumentum: 'BANCOËNSIS* NOVA DIOECESIS CONDITUR IN COLUMBIA, BANCOËNSIS APPELLANDA.',
    note:
      'Detaches nine parishes from the Diocese of Santa Marta and two from the Diocese of '
      + 'Valledupar and erects the new Diocese of El Banco, suffragan to Barranquilla: "...ex '
      + 'detractis territoriis nova constituitur dioecesis, Bancoënsis appellanda...".',
  },
  'benedict-xvi|iovaiensis|2006-01-28': {
    argumentum: 'IOVAIENSIS* NOVA IN INDIA CONDITUR DIOECESIS IOVAIENSIS APPELLANDA.',
    note:
      'Detaches the civil district of Jaintia Hills from the Archdiocese of Shillong and '
      + 'erects the new Diocese of Jowai, suffragan to Shillong: "...ex quo novam dioecesim, '
      + 'Iovaiensem appellandam, constituimus.".',
  },
  'benedict-xvi|nongstoinensis|2006-01-28': {
    argumentum: 'NONGSTOINENSIS* IN INDIA NOVA CONDITUR DIOECESIS NONGSTOINENSIS.',
    note:
      'Detaches the civil district of West Khasi Hills from the Archdiocese of Shillong and '
      + 'erects the new Diocese of Nongstoin, suffragan to Shillong: "...ex eoque novam '
      + 'condimus dioecesim Nongstoinensem...". The companion of Iovaiensis, issued the same '
      + 'day.',
  },
  'benedict-xvi|iashpuriensis|2006-03-23': {
    argumentum: 'IASHPURIENSIS* IN INDIA NOVA CONDITUR DIOECESIS IASHPURIENSIS.',
    note:
      'Detaches the civil district of Jashpur from the Diocese of Raigarh and erects the new '
      + 'Diocese of Jashpur, seated at Kunkuri and suffragan to Raipur: "...ex eoque novam '
      + 'condimus dioecesim Iashpuriensem...".',
  },
  'benedict-xvi|celeiensis|2006-04-07': {
    argumentum:
      'CELEIENSIS* NOVA CONDITUR DIOECESIS IN REPUBLICA SLOVENA CELEIENSIS APPELLANDA',
    note:
      'Detaches eleven deaneries from the Archdiocese of Maribor and erects the new Diocese of '
      + 'Celje, suffragan to Maribor: "...ex ita distracto territorio novam dioecesim, '
      + 'Celeiensem appellandam, erigimus ac constituimus.". One of the three Slovenian '
      + 'constitutions of this date, with Mariborensis and Sombotiensis.',
  },
  'benedict-xvi|mariborensis|2006-04-07': {
    argumentum:
      'MARIBORENSIS* In Slovenia constituitur nova Provincia Ecclesiastica Mariborensis, cuius '
      + 'metropolitana Ecclesia erit Sedes eiusdem nominis.',
    note:
      'Releases the see of Maribor from the metropolitan jurisdiction of Ljubljana, raises it '
      + 'to a metropolitan archdiocese and erects the new ecclesiastical province of Maribor, '
      + 'made up of the new archdiocese and the Dioceses of Celje and Murska Sobota erected '
      + 'the same day: "...Nova condita Provincia Ecclesiastica Mariborensis efformabitur '
      + 'metropolitana Ecclesia eiusdem nominis atque dioecesibus Celeiensi et Sombotiensi.". '
      + 'The argumentum leads with the province constituted, which is the act filed; the '
      + 'elevation of the see is stated in its relative clause. The page prints this '
      + 'argumentum in sentence case rather than capitals, so the case-delimited reader '
      + 'stopped at its first word and the curation script abstained; it is quoted here by '
      + 'hand as the page prints it.',
  },
  'benedict-xvi|sombotiensis|2006-04-07': {
    argumentum: 'SOMBOTIENSIS* IN SLOVENIA NOVA CONDITUR DIOECESIS SOMBOTIENSIS APPELLANDA.',
    note:
      'Detaches the deaneries of Lendava, Ljutomer and Murska Sobota from the Archdiocese of '
      + 'Maribor and erects the new Diocese of Murska Sobota, suffragan to Maribor: "...ex ita '
      + 'distracto territorio novam constituimus dioecesim Sombotiensem appellandam.".',
  },
  'benedict-xvi|banmavensis|2006-08-28': {
    argumentum: 'BANMAVENSIS* IN MYANMAR NOVA CONDITUR DIOECESIS BANMAVENSIS.',
    note:
      'Detaches the southern part of the Diocese of Myitkyina (the townships of Banmaw, Mansi, '
      + 'Momauk and Shwegu) and erects the new Diocese of Banmaw, suffragan to Mandalay: '
      + '"...ex eaque novam constituimus dioecesim Banmavensem...".',
  },
  'benedict-xvi|agbovillensis|2006-10-14': {
    argumentum:
      'AGBOVILLENSIS* NOVA IN LITORE EBURNEO CONDITUR DIOECESIS AGBOVILLENSIS APPELLANDA.',
    note:
      'Detaches the civil districts of Agboville, Adzopé and Tiassalé from the Diocese of '
      + 'Yopougon and erects the new Diocese of Agboville, suffragan to Abidjan: "...ex eo '
      + 'novam dioecesim, Agbovillensem appellandam, constituimus.".',
  },
  'benedict-xvi|sydneyensis|2006-10-21': {
    argumentum:
      'SYDNEYENSIS* Eparchia Chaldaea Oceaniae Sancti Thomae Apostoli in urbe Sydneyensi '
      + 'conditur pro Christifidelibus ritus Chaldaei in Oceania commorantibus.',
    note:
      'Erects the Chaldean Eparchy of Saint Thomas the Apostle of Sydney for the Chaldean '
      + 'faithful of Oceania, seated at Sydney: "...constituimus Eparchiam Chaldaeam Oceaniae '
      + 'Sancti Thomae Apostoli in urbe Sydneyensi pro Christifidelibus catholicis ritus '
      + 'Chaldaei in Oceania commorantibus...". A personal (ritual) circumscription erected '
      + 'new, with no territory detached from any Latin see. The page prints this argumentum '
      + 'in sentence case rather than capitals, so the case-delimited reader stopped at its '
      + 'first word and the curation script abstained; it is quoted here by hand as the page '
      + 'prints it.',
  },
  'benedict-xvi|buiumburaensis|2006-11-25': {
    argumentum:
      'BUIUMBURAËNSIS* In Burundia constituitur nova Provincia Ecclesiastica Buiumburaënsis, '
      + 'cuius metropolitana Ecclesia erit Sedes eiusdem nominis.',
    note:
      'Releases the Dioceses of Bujumbura, Bubanza and Bururi from the metropolitan '
      + 'jurisdiction of Gitega, erects the new ecclesiastical province of Bujumbura from them '
      + 'and raises Bujumbura to a metropolitan archdiocese at its head: "...ex iisque '
      + 'constituimus novam Provinciam Ecclesiasticam Buiumburaënsem atque dioecesim eiusdem '
      + 'nominis ad Archidioecesis Metropolitanae gradum evehimus...". The argumentum leads '
      + 'with the province constituted, which is the act filed. The page prints this '
      + 'argumentum in sentence case rather than capitals, so the case-delimited reader '
      + 'stopped at its first word and the curation script abstained; it is quoted here by '
      + 'hand as the page prints it.',
  },
  'benedict-xvi|sinuensis|2007-01-26': {
    argumentum: 'SINUENSIS* IN MEXICO NOVA CONDITUR DIOECESIS SINUENSIS.',
    note:
      'Detaches 24 parishes from the Archdiocese of Tijuana and 2 from the Diocese of Mexicali '
      + 'and erects the new Diocese of Ensenada, suffragan to Tijuana: "...ex ita distractis '
      + 'locis novam constituimus dioecesim Sinuensem.".',
  },
  'benedict-xvi|shendamensis|2007-06-02': {
    argumentum: 'SHENDAMENSIS* IN NIGERIA NOVA CONDITUR DIOECESIS SHENDAMENSIS.',
    note:
      'Detaches six Local Government Areas and part of a seventh from the Archdiocese of Jos '
      + 'and erects the new Diocese of Shendam, suffragan to Jos: "...ex iisque distractis '
      + 'locis novam constituimus dioecesim Shendamensem...".',
  },
  'benedict-xvi|ioannesburgensis|2007-06-05': {
    argumentum:
      'IOANNESBURGENSIS* In Africa Australi constituitur nova Provincia Ecclesiastica '
      + 'Ioannesburgensis, cuius metropolitana Ecclesia erit Sedes eiusdem nominis',
    note:
      'Releases the Dioceses of Johannesburg, Manzini, Klerksdorp and Witbank from the '
      + 'metropolitan jurisdiction of Pretoria, erects the new ecclesiastical province of '
      + 'Johannesburg from them and raises Johannesburg to a metropolitan archdiocese at its '
      + 'head: "...ex iisque constituimus novam Provinciam Ecclesiasticam Ioannesburgensem '
      + 'atque dioecesim eiusdem nominis ad Archidioecesis Metropolitanae gradum evehimus...". '
      + 'The argumentum leads with the province constituted, which is the act filed. The page '
      + 'prints this argumentum in sentence case rather than capitals, so the case-delimited '
      + 'reader stopped at its first word and the curation script abstained; it is quoted here '
      + 'by hand as the page prints it.',
  },
  'benedict-xvi|caxitonensis|2007-06-06': {
    argumentum: 'CAXITONENSIS* IN ANGOLIA NOVA CONDITUR DIOECESIS CAXITONENSIS APPELLANDA.',
    note:
      'Detaches nine municipalities from the Archdiocese of Luanda and erects the new Diocese '
      + 'of Caxito, suffragan to Luanda: "...ex quibus novam dioecesim constituimus '
      + 'Caxitonensem appellandam.".',
  },
  'benedict-xvi|viananensis|2007-06-06': {
    argumentum: 'VIANENSIS* NOVA DIOECESIS CONSTITUITUR IN ANGOLIA, VIANANENSIS APPELLANDA.',
    note:
      'Detaches thirteen localities from the Archdiocese of Luanda and erects the new Diocese '
      + 'of Viana, suffragan to Luanda: "...Novam dioecesim condimus Viananensem '
      + 'appellandam...ab archidioecesi Luandensi seiungenda...". The companion of '
      + 'Caxitonensis, issued the same day. The heading prints the toponym "VIANENSIS", as '
      + 'quoted, where the body and the harvested index (and so the key) have "Viananensis".',
  },
  'benedict-xvi|donkorkromensis|2007-06-12': {
    argumentum:
      'DONKORKROMENSIS* IN GHANA CONSTITUITUR PRAEFECTURA APOSTOLICA DONKORKROMENSIS.',
    note:
      'Detaches the civil district of Donkorkrom from the Diocese of Koforidua and erects the '
      + 'new Apostolic Prefecture of Donkorkrom, entrusted to the Society of the Divine Word: '
      + '"...ex eoque constituimus Praefecturam Apostolicam Donkorkromensem...". The '
      + 'prefecture was replaced by an apostolic vicariate of the same name on 2010-01-19, '
      + 'filed below.',
  },
  'benedict-xvi|niameyensis|2007-06-25': {
    argumentum:
      'NIAMEYENSIS* In Nigritana Natione constituitur nova Provincia Ecclesiastica '
      + 'Niameyensis, cuius metropolitana Ecclesia erit Sedes eiusdem nominis.',
    note:
      'Erects the new ecclesiastical province of Niamey from the Diocese of Niamey, raised to '
      + 'a metropolitan archdiocese at its head, and the Diocese of Maradi as its suffragan: '
      + '"...constituimus novam Provinciam Ecclesiasticam Niameyensem efformatam dioecesi '
      + 'Niameyensi, quam ad gradum Archidioecesis Metropolitanae evehimus, et dioecesi '
      + 'Maradensi...". The argumentum leads with the province constituted, which is the act '
      + 'filed. The page prints this argumentum in sentence case rather than capitals, so the '
      + 'case-delimited reader stopped at its first word and the curation script abstained; it '
      + 'is quoted here by hand as the page prints it.',
  },
  'benedict-xvi|sandakanensis|2007-07-16': {
    argumentum: 'SANDAKANENSIS* IN MALAESIA NOVA CONDITUR DIOECESIS SANDAKANENSIS APPELLANDA.',
    note:
      'Detaches the eastern part of the Diocese of Kota Kinabalu (the civil divisions of '
      + 'Sandakan and Tawau) and erects the new Diocese of Sandakan, suffragan to Kuching: '
      + '"...ex qua novam dioecesim appellandam Sandakanensem erigimus.".',
  },
  'benedict-xvi|techimanensis|2007-12-28': {
    argumentum: 'TECHIMANENSIS* IN GANA NOVA CONDITUR DIOECESIS TECHIMANENSIS',
    note:
      'Detaches seven civil districts from the Dioceses of Sunyani and Konongo-Mampong and '
      + 'erects the new Diocese of Techiman, suffragan to Kumasi: "...ex iisque distractis '
      + 'locis novam condimus dioecesim Techimanensem...".',
  },
  'benedict-xvi|florianensis|2008-02-27': {
    argumentum:
      'FLORIANENSIS* IN BRASILIA FLORIANENSIS DIOECESIS CONDITUR ATQUE TERESIANAE ET '
      + 'RAYMUNDIANAE SEDIUM FINES MUTANTUR.',
    note:
      'Detaches 23 municipalities from the Diocese of Oeiras-Floriano and erects the new '
      + 'Diocese of Floriano, suffragan to Teresina: "...ex ita distracto territorio novam '
      + 'dioecesim Florianensem appellandam...erigimus ac constituimus.". The secondary act '
      + '(ATQUE) leaves the remainder as the Diocese of Oeiras and moves municipalities '
      + 'between it, the Archdiocese of Teresina and the Diocese of São Raimundo Nonato; the '
      + 'erection is the act the argumentum leads with.',
  },
  'benedict-xvi|faiardensis-humacaensis|2008-03-11': {
    argumentum:
      'FAIARDENSIS-HUMACAENSIS* IN PORTU DIVITE NOVA CONDITUR DIOECESIS '
      + 'FAIARDENSIS-HUMACAENSIS APPELLANDA',
    note:
      'Detaches four municipalities from the Archdiocese of San Juan de Puerto Rico and six '
      + 'from the Diocese of Caguas and erects the new Diocese of Fajardo-Humacao, seated at '
      + 'Fajardo with a concathedral at Humacao, suffragan to San Juan: "...ex ita distractis '
      + 'territoriis novam constituimus dioecesim Faiardensem-Humacaensem...".',
  },
  'benedict-xvi|diacovensis-osijekensis|2008-06-18': {
    argumentum:
      'DIACOVENSIS-OSIJEKENSIS* Nova conditur Provincia Ecclesiastica, scilicet '
      + 'Diacovensis-Osijekensis quae sedes ad dignitatem Ecclesiae metropolitanae attollitur',
    note:
      'Erects the new ecclesiastical province of Đakovo-Osijek, made up of the see of Đakovo '
      + '(or Bosnia), renamed Đakovo-Osijek, released from the metropolitan jurisdiction of '
      + 'Zagreb and raised to a metropolitan archdiocese at its head, with the Dioceses of '
      + 'Srijem (restored the same day, filed in CANDIDATE_ADJUDICATIONS) and Požega as '
      + 'suffragans: "...Nova condita Provincia Ecclesiastica Diacovensis-Osijekensis '
      + 'complectitur metropolitanam Ecclesiam eiusdem nominis et dioeceses Sirmiensem et '
      + 'Poseganam.". The argumentum leads with the province constituted, which is the act '
      + 'filed; the renaming, the elevation and a concathedral at Osijek are its consequences. '
      + 'The page prints this argumentum in sentence case rather than capitals, so the '
      + 'case-delimited reader stopped at its first word and the curation script abstained; it '
      + 'is quoted here by hand as the page prints it.',
  },
  'benedict-xvi|kribensis|2008-06-19': {
    argumentum: 'KRIBENSIS* IN CAMMARUNIA NOVA CONDITUR DIOECESIS KRIBENSIS.',
    note:
      'Detaches the civil department of Océan from the Diocese of Ebolowa-Kribi and erects the '
      + 'new Diocese of Kribi, suffragan to Yaoundé: "...ex eoque novam condimus dioecesim '
      + 'Kribensem...".',
  },
  'benedict-xvi|sinuvitullensis-miragoanensis|2008-07-13': {
    argumentum:
      'SINUVITULLENSIS-MIRAGOANENSIS* IN HAITIA NOVA CONDITUR DIOECESIS '
      + 'SINUVITULLENSIS-MIRAGOANENSIS',
    note:
      'Detaches the civil department of Nippes from the Diocese of Les Cayes and erects the '
      + 'new Diocese of Anse-à-Veau-Miragoâne, seated at Anse-à-Veau and suffragan to '
      + 'Port-au-Prince: "...ex ita distracto territorio novam dioecesim constituimus '
      + 'Sinuvitullensem-Miragoanensem appellandam...".',
  },
  'benedict-xvi|hpaanensis|2009-01-24': {
    argumentum: 'HPAANENSIS* IN MYANMAR NOVA CONDITUR DIOECESIS HPAANENSIS APPELLANDA.',
    note:
      'Detaches the eastern part of the Archdiocese of Yangon (twelve townships of Kayin and '
      + 'Mon States) and erects the new Diocese of Hpa-an, suffragan to Yangon: "...ex qua '
      + 'novam dioecesim erigimus Hpaanensem appellandam.".',
  },
  'benedict-xvi|esquelensis|2009-03-14': {
    argumentum: 'ESQUELENSIS* IN ARGENTINA NOVA CONDITUR PRAELATURA TERRITORIALIS ESQUELENSIS',
    note:
      'Detaches seven parishes and two quasi-parishes from the Diocese of Comodoro Rivadavia '
      + 'and erects the new Territorial Prelature of Esquel, suffragan to Bahía Blanca: "...ex '
      + 'ita distracto territorio iisdemque circumscriptam finibus novam constituimus '
      + 'praelaturam territorialem Esquelensem...".',
  },
  'benedict-xvi|namibensis|2009-03-21': {
    argumentum: 'NAMIBENSIS* IN ANGOLIA NOVA CONDITUR DIOECESIS NAMIBENSIS APPELLANDA.',
    note:
      'Detaches the civil province of Namibe from the Archdiocese of Lubango and erects the '
      + 'new Diocese of Namibe, suffragan to Lubango: "...ex quo novam dioecesim erigimus '
      + 'Namibensem appellandam.".',
  },
  'benedict-xvi|oberensis|2009-06-13': {
    argumentum: 'OBERENSIS* IN ARGENTINA NOVA CONDITUR DIOECESIS OBERENSIS',
    note:
      'Detaches parishes from the Diocese of Posadas and from the Diocese of Puerto Iguazú and '
      + 'erects the new Diocese of Oberá, suffragan to Corrientes: "...ex ita distractis '
      + 'duobus territoriis iisdemque circumscriptam finibus novam constituimus dioecesim '
      + 'Oberensem.". The secondary act (ITEM) moves two further parishes from Posadas to '
      + 'Puerto Iguazú.',
  },
  'benedict-xvi|bellovariensis-crisiensis|2009-12-05': {
    argumentum:
      'BELLOVARIENSIS-CRISIENSIS* IN CROATIA NOVA CONDITUR DIOECESIS '
      + 'BELLOVARIENSIS-CRISIENSIS.',
    note:
      'Detaches seven deaneries from the Archdiocese of Zagreb and erects the new Diocese of '
      + 'Bjelovar-Križevci, seated at Bjelovar with a concathedral at Križevci, suffragan to '
      + 'Zagreb: "...ex ita distractis locis novam constituimus dioecesim '
      + 'Bellovariensem-Crisiensem...". The companion of Sisciensis, issued the same day.',
  },
  'benedict-xvi|gambellensis|2009-12-05': {
    argumentum:
      'GAMBELLENSIS* VICARIATUS APOSTOLICUS CONDITUR IN AETHIOPIAE FINIBUS, GAMBELLENSIS '
      + 'APPELLANDUS.',
    note:
      'Erects the new Apostolic Vicariate of Gambella, entrusted to the Salesians, on the '
      + 'whole territory of the Apostolic Prefecture of Gambella, which the body says has '
      + 'matured enough to be raised: "...statuimus et decernimus in Aethiopia novum '
      + 'Vicariatum Apostolicum Gambellensem appellandum condere, qui eodem constet territorio '
      + 'ac prior Praefectura Apostolica Gambellensis.". In substance the prefecture is raised '
      + 'to a vicariate; the document states the act as founding a new vicariate rather than '
      + 'raising the prefecture, and is filed on its own words.',
  },
  'benedict-xvi|sisciensis|2009-12-05': {
    argumentum: 'SISCIENSIS* IN CROATIA NOVA CONDITUR DIOECESIS SISCIENSI.',
    note:
      'Detaches six deaneries and five further parishes from the Archdiocese of Zagreb and '
      + 'erects the new Diocese of Sisak, suffragan to Zagreb: "...ex ita distracto territorio '
      + 'novam dioecesim constituimus Sisciensem appellandam...". The argumentum prints '
      + '"SISCIENSI" for Sisciensis, as quoted.',
  },
  'benedict-xvi|donkorkromensis|2010-01-19': {
    argumentum:
      'DONKORKROMENSIS* VICARIATUS APOSTOLICUS, DONKORKROMENSIS APPELLANDUS, IN GHANAE FINIBUS '
      + 'CONDITUR.',
    note:
      'Erects the new Apostolic Vicariate of Donkorkrom, entrusted to the Society of the '
      + 'Divine Word, on the whole territory of the Apostolic Prefecture of Donkorkrom erected '
      + 'in 2007 (filed above): "...novum Vicariatum Apostolicum Donkorkromensem appellandum '
      + 'condere, qui eodem constet territorio ac prior Praefectura Apostolica eiusdem '
      + 'nominis.". As with Gambellensis, the document states the act as founding a new '
      + 'vicariate rather than raising the prefecture, and is filed on its own words.',
  },
  'benedict-xvi|hosannensis|2010-01-20': {
    argumentum: 'HOSANNENSIS* IN AETHIOPIA NOVUS CONDITUR VICARIATUS APOSTOLICUS HOSANNENSIS.',
    note:
      'Detaches the Hosanna territory from the Apostolic Vicariate of Soddo-Hosanna and erects '
      + 'it as the new Apostolic Vicariate of Hosanna: "...A Vicariatu Apostolico '
      + 'Soddensi-Hosannensi separamus territorium Hosannense et erigimus in novum Vicariatum '
      + 'Apostolicum Hosannensem.".',
  },
  'benedict-xvi|malianensis|2010-01-30': {
    argumentum:
      'MALIANENSIS* IN TIMORIA ORIENTALI NOVA CONDITUR DIOECESIS MALIANENSIS APPELLANDA.',
    note:
      'Detaches the western part of the Diocese of Díli (the civil districts of Liquiçá, '
      + 'Bobonaro and Cova Lima) and erects the new Diocese of Maliana, immediately subject to '
      + 'the Holy See: "...ex qua novam dioecesim erigimus Malianensem appellandam.".',
  },
  'benedict-xvi|toamasinensis|2010-02-26': {
    argumentum:
      'TOAMASINENSIS* IN MADAGASCARIA NOVA CONDITUR PROVINCIA ECCLESIASTICA, TOAMASINENSIS '
      + 'APPELLANDA.',
    note:
      'Releases the Dioceses of Ambatondrazaka and Moramanga from the metropolitan '
      + 'jurisdiction of Antananarivo and Toamasina and Fenoarivo Atsinanana from that of '
      + 'Antsiranana and erects the new ecclesiastical province of Toamasina from them, with '
      + 'its metropolitan seat at Toamasina: "...ex iis novam Provinciam Ecclesiasticam '
      + 'Toamasinensem constituimus, cum sede principe in urbe Toamasinensi...". The '
      + 'argumentum states only the province erected.',
  },
  'benedict-xvi|salicensis|2010-06-16': {
    argumentum: 'SALICENSIS* IN BRASILIA NOVA CONDITUR DIOECESIS SALICENSIS',
    note:
      'Detaches fourteen municipalities from the Diocese of Petrolina and Cabrobó from the '
      + 'Diocese of Floresta and erects the new Diocese of Salgueiro, suffragan to Olinda e '
      + 'Recife: "...ex ita distractis duobus territoriis novam constituimus dioecesim '
      + 'Salicensem.".',
  },
  'benedict-xvi|camassariensis|2010-12-15': {
    argumentum: 'CAMASSARIENSIS* IN BRASILIA NOVA CONDITUR DIOECESIS CAMASSARIENSIS',
    note:
      'Detaches eight municipalities from the Archdiocese of São Salvador da Bahia and erects '
      + 'the new Diocese of Camaçari, suffragan to São Salvador: "...ex ita distractis '
      + 'municipiis novam dioecesim Camassariensem constituimus.".',
  },
  'benedict-xvi|boensis|2011-01-15': {
    argumentum: 'BOËNSIS* IN MONTE LEONINA NOVA DIOECESIS BOËNSIS APPELLANDA ERIGITUR',
    note:
      'Detaches the civil districts of Bo, Bonthe, Moyamba and Pujehun from the Archdiocese of '
      + 'Freetown and Bo and erects the new Diocese of Bo, suffragan to Freetown: "...idque in '
      + 'novam dioecesim erigimus, Boënsem appellandam...".',
  },
  'benedict-xvi|lilongvensis|2011-02-09': {
    argumentum:
      'LILONGVENSIS* PROVINCIA ECCLESIASTICA IN MALAVIO ERIGITUR ET DIOECESIS LILONGVENSIS '
      + 'ADGRADUM ARCHIDIOECESIS ERIGITUR',
    note:
      'Erects the new ecclesiastical province of Lilongwe and raises the Diocese of Lilongwe '
      + 'to a metropolitan archdiocese at its head, with the Dioceses of Dedza, Mzuzu and '
      + 'Karonga as suffragans: "...novam Provinciam Ecclesiasticam erigimus et dioecesim '
      + 'Lilongvensem ad gradum et dignitatem archidioecesis metropolitanae attollimus...". '
      + 'The argumentum states both acts and leads with the province erected; filed with the '
      + 'erections. It prints "ADGRADUM", as quoted.',
  },
  'benedict-xvi|kondoaensis|2011-03-12': {
    argumentum: 'KONDOAËNSIS* IN TANZANIA NOVA CONDITUR DIOECESIS KONDAËNSIS',
    note:
      'Detaches the civil districts of Kondoa and Usandawe from the Diocese of Dodoma and '
      + 'erects the new Diocese of Kondoa, suffragan to Dar es Salaam: "...ex eoque novam '
      + 'condimus dioecesim Kondoaënsem...". The argumentum prints the new see "KONDAËNSIS", '
      + 'as quoted, where the heading and body have Kondoaënsis.',
  },
  'benedict-xvi|malaniensis|2011-04-12': {
    argumentum:
      'MALANIENSIS* IN ANGOLIA CONSTITUITUR NOVA PROVINCIA ECCLESIASTICA MALANIENSIS, CUIUS '
      + 'METROPOLITANA ECCLESIA ERIT SEDES EIUSDEM NOMINIS',
    note:
      'Erects the new ecclesiastical province of Malanje, made up of the Diocese of Malanje as '
      + 'its metropolitan see and the Dioceses of Uíje and Ndalatando as suffragans: "...Novam '
      + 'Ecclesiasticam Provinciam constituimus Malaniensem efformatam dioecesi Malaniensi, '
      + 'quae erit metropolitana Sedes...". The argumentum states only the province '
      + 'constituted. The companion of Saurimoënsis, issued the same day.',
  },
  'benedict-xvi|saurimoensis|2011-04-12': {
    argumentum:
      'SAURIMOËNSIS* IN ANGOLIA NOVA ERIGITUR PROVINCIA ECCLESIASTICA SAURIMOËNSIS, CUIUS '
      + 'DIOCESANA SEDES EIUSDEM NOMINIS AD DIGNITATEM ECCLESIAE METROPOLITANAE EVEHITUR',
    note:
      'Erects the new ecclesiastical province of Saurimo and raises the Diocese of Saurimo to '
      + 'a metropolitan archdiocese at its head, with the Dioceses of Dundo and Lwena as '
      + 'suffragans: "...novam Provinciam Ecclesiasticam erigimus et dioecesim Saurimoënsem ad '
      + 'gradum et dignitatem archidioecesis metropolitanae attollimus...". The argumentum '
      + 'states both acts and leads with the province erected; filed with the erections, as '
      + 'Lilongvensis is. The heading spells the see "Saurimoënsis" where the harvested index '
      + '(and so the key) has "Saurimoensis".',
  },
  'benedict-xvi|passofundensis|2011-04-13': {
    argumentum:
      'PASSOFUNDENSIS* NOVA CONDITUR PROVICIA ECCLESIASTICA SCILICET PASSOFUNDENSIS CUIUS '
      + 'SEDES AD DIGNITATEM ECCLESIAE METROPOLITANAE ATTOLLITUR',
    note:
      'Releases the see of Passo Fundo from the metropolitan jurisdiction of Porto Alegre, '
      + 'raises it to a metropolitan archdiocese and erects the new ecclesiastical province of '
      + 'Passo Fundo from it and the Dioceses of Vacaria, Frederico Westphalen and Erexim: '
      + '"...Nova condita Provincia Ecclesiastica Passofundensis constituitur Ecclesia eiusdem '
      + 'nominis et dioecesibus Vaccariensi, Vestphaleniana et Ereximensi.". The argumentum '
      + 'leads with the province constituted, which is the act filed; it prints "PROVICIA" for '
      + 'PROVINCIA, as quoted. The companion of Pelotensis, issued the same day.',
  },
  'benedict-xvi|pelotensis|2011-04-13': {
    argumentum:
      'PELOTENSIS* IN BRASILIA CONSTITUITUR NOVA PROVINCIA ECCLESIASTICA PELOTENSIS, CUIUS '
      + 'METROPOLITANA ECCLESIA ERIT SEDES EIUSDEM NOMINIS',
    note:
      'Releases the see of Pelotas from the metropolitan jurisdiction of Porto Alegre, raises '
      + 'it to a metropolitan archdiocese and erects the new ecclesiastical province of '
      + 'Pelotas from it and the Dioceses of Bagé and Rio Grande: "...Nova condita Provincia '
      + 'Ecclesiastica Pelotensis efformabitur metropolitana Ecclesia eiusdem nominis atque '
      + 'dioecesibus Bagensi et Rivograndensi...". The argumentum leads with the province '
      + 'constituted, which is the act filed.',
  },
  'benedict-xvi|naviraiensis|2011-06-01': {
    argumentum:
      'NAVIRAIENSIS* DETRACTIS A DIOECESI AURATOPOLITANA NONNULLIS MUNICIPIIS NOVA DIOECESIS '
      + 'IN BRASILIA CONSTITUITUR, NAVIRAIENSIS APPELLANDA',
    note:
      'Detaches nineteen municipalities from the Diocese of Dourados and erects the new '
      + 'Diocese of Naviraí, suffragan to Campo Grande: "...e quibus novam dioecesim '
      + 'constituimus, quae a nomine urbis Naviraí Naviraiensis appellabitur.".',
  },
  'benedict-xvi|sylethensis|2011-07-08': {
    argumentum: 'SYLHETENSIS* IN BANGLADESA NOVA CONDITUR DIOECESIS SYLHETENSIS',
    note:
      'Detaches the civil districts of Sylhet, Sunamganj, Habiganj and Moulvibazar from the '
      + 'Archdiocese of Dhaka and erects the new Diocese of Sylhet, seated at Lokhipur and '
      + 'suffragan to Dhaka: "...ex quibus novam Dioecesim erigimus Sylhetensem appellandam.". '
      + 'The heading spells the see "Sylhetensis" where the harvested index (and so the key) '
      + 'has "Sylethensis".',
  },
  'benedict-xvi|azerbaigianiensis|2011-08-04': {
    argumentum:
      'AZERBAIGIANIENSIS* IN AZERBAIGIANIA PRAEFECTURA APOSTOLICA CONDITUR AZERBAIGIANIENSIS '
      + 'APPELLANDA',
    note:
      'Founds the Apostolic Prefecture of Azerbaijan, entrusted to the Salesians. The body '
      + 'states the act as raising the existing Mission sui iuris of Baku to that rank: '
      + '"...Missionem « sui iuris » Bacuensem ad gradum Praefecturae Apostolicae '
      + 'Azerbaigianiensis appellandae elevamus...". The argumentum names a prefecture '
      + 'founded (CONDITUR), and governs the table (Ruling 9).',
  },
  'benedict-xvi|kabvensis|2011-10-29': {
    argumentum: 'KABVENSIS* IN ZAMBIA NOVA CONDITUR DIOECESIS KABVENSIS',
    note:
      'Detaches four civil districts from the Archdiocese of Lusaka and Serenje from the '
      + 'Diocese of Mpika and erects the new Diocese of Kabwe, suffragan to Lusaka: "...ex '
      + 'iisque distractis locis novam condimus dioecesim Kabvensem...".',
  },
  'benedict-xvi|ceibensis|2011-12-30': {
    argumentum: 'CEIBENSIS* IN HONDURIA NOVA CONDITUR DIOECESIS CEIBENSIS',
    note:
      'Detaches the civil departments of Atlántida and Islas de la Bahía from the Diocese of '
      + 'San Pedro Sula and erects the new Diocese of La Ceiba, suffragan to Tegucigalpa: '
      + '"...ex eoque novam condimus dioecesim Ceibensem...".',
  },
  'benedict-xvi|ifakarensis|2012-01-14': {
    argumentum: 'IFAKARENSIS* IN TANZANIA NOVA CONDITUR DIOECESIS IFAKARENSIS',
    note:
      'Detaches the civil district of Kilombero from the Diocese of Mahenge and erects the new '
      + 'Diocese of Ifakara, suffragan to Dar es Salaam: "...ex eoque distracto loco novam '
      + 'constituimus dioecesim Ifakarensem...".',
  },
  'benedict-xvi|robensis|2012-02-11': {
    argumentum: 'ROBENSIS* IN AETHIPIA CONSTITUITUR PRAEFECTURA APOSTOLICA ROBENSIS',
    note:
      'Detaches the civil district of Robe from the Apostolic Vicariate of Meki and erects the '
      + 'new Apostolic Prefecture of Robe, entrusted to the Capuchins: "...ex eoque '
      + 'constituimus Praefecturam Apostolicam Robensem...". The argumentum prints "AETHIPIA" '
      + 'for Aethiopia, as quoted.',
  },
  'benedict-xvi|tenkodogoensis|2012-02-11': {
    argumentum: 'TENKODOGOËNSIS* IN TANZANIA NOVA CONDITUR DIOECESIS',
    note:
      'Detaches the civil provinces of Boulgou and Koulpélogo from the Archdiocese of Koupéla '
      + 'and the Diocese of Fada N\'Gourma, in Burkina Faso, and erects the new Diocese of '
      + 'Tenkodogo, suffragan to Koupéla: "...ex iisque distractis locis novam condimus '
      + 'dioecesim Tenkodogoënsem...". The argumentum places the new see "IN TANZANIA" and '
      + 'does not name it, as quoted; the body places it in Burkina Faso.',
  },
  'benedict-xvi|segheneitensis|2012-02-13': {
    argumentum: 'SEGHENEITENSIS* IN ERYTHRAEA NOVA EPARCHIA SEGHENEITENSIS CONDITUR',
    note:
      'Detaches territory from the Eparchy of Asmara and erects the new Eparchy of Segheneity, '
      + 'suffragan to the metropolitan Archeparchy of Addis Abeba: "...Ab Eparchia Asmarensi '
      + 'detrahimus quoddam territorium ex quo condimus novam Eparchiam Segheneitensem...".',
  },
  'benedict-xvi|faridabadensis-syro-malabarensium|2012-03-06': {
    argumentum:
      'FARIDABADENSIS SYRO-MALABARENSIUM* IN INDIA NOVA EPARCHIA FARIDABADENSIS '
      + 'SYRO-MALABARENSIUM CONDITUR',
    note:
      'Erects the new Syro-Malabar Eparchy of Faridabad for the Syro-Malabar faithful of Delhi '
      + 'and the surrounding northern states: "...constituimus Eparchiam Faridabadensem '
      + 'Syro-Malabarensium cum omnibus iuribus atque obligationibus, cuius sedem ponimus in '
      + 'urbe Faridabad.". A ritual circumscription erected new, with no territory detached '
      + 'from a Latin see.',
  },
  'benedict-xvi|bafangensis|2012-05-26': {
    argumentum: 'BAFANGENSIS* IN CAMARUNIA NOVA DIOECESIS CONSTITUITUR BAFANGENSIS APPELLANDA',
    note:
      'Detaches the civil departments of Nkam and Haut-Nkam from the Diocese of Nkongsamba and '
      + 'erects the new Diocese of Bafang, suffragan to Douala: "...ex quo novam erigimus et '
      + 'constituimus dioecesim quae Bafangensis nuncupabitur.".',
  },
  'benedict-xvi|batticaloaensis|2012-07-03': {
    argumentum: 'BATTICALOAËNSIS* IN SRI LANKA NOVA CONDITUR DIOECESIS BATTICALOAËNSIS.',
    note:
      'Detaches the civil districts of Batticaloa and Ampara from the Diocese of '
      + 'Trincomalee-Batticaloa and erects the new Diocese of Batticaloa, suffragan to '
      + 'Colombo: "...ex iisque novam condimus dioecesim Batticaloaënsem...".',
  },
  'benedict-xvi|udupiensis|2012-07-16': {
    argumentum: 'UDUPIENSIS * NOVA DIOECESIS CONSTITUITUR IN INDIA, UDUPIENSIS APPELLANDA',
    note:
      'Detaches the civil taluks of Udupi, Kundapura and Karkala from the Diocese of Mangalore '
      + 'and erects the new Diocese of Udupi, suffragan to Bangalore: "...Novam dioecesim '
      + 'condimus Udupiensem appellandam...a dioecesi Mangalorensi seiungenda...".',
  },
  'benedict-xvi|gbokensis|2012-12-29': {
    argumentum: 'GBOKENSIS* IN NIGERIA NOVA CONDITUR DIOECESIS GBOKENSIS APPELLANDA',
    note:
      'Detaches seven Local Government Areas from the Diocese of Makurdi and erects the new '
      + 'Diocese of Gboko, suffragan to Abuja: "...ex quibus novam dioecesim erigimus '
      + 'Gbokensem appellandam.". The companion of Katsinensis-Alensis, issued the same day.',
  },
  'benedict-xvi|katsinensis-alensis|2012-12-29': {
    argumentum: 'KATSINENSIS-ALENSIS* IN NIGERIA NOVA CONDITUR DIOECESIS KATSINENSIS-ALENSIS',
    note:
      'Detaches the Local Government Areas of Katsina-Ala, Logo and Ukum from the Diocese of '
      + 'Makurdi and erects the new Diocese of Katsina-Ala, suffragan to Abuja: "...ex ita '
      + 'distracto territorio novam dioecesim constituimus Katsinensem-Alensem '
      + 'appellandam...".',
  },
  'benedict-xvi|cametanensis|2013-02-06': {
    argumentum: 'CAMETANENSIS* IN BRASILIA NOVA CONDITUR DIOECESIS CAMETANENSIS',
    note:
      'Founds the Diocese of Cametá, suffragan to Belém do Pará, its prelate confirmed as '
      + 'first bishop. The body states the act as raising the existing Territorial Prelature '
      + 'of Cametá, keeping its name and territory: "...praelaturam territorialem '
      + 'Cametanensem evehimus ad gradum dioecesis, eodem servato nomine ac territorio.", the '
      + 'words the Huariensis and Obidensis constitutions use under an EVEHITUR argumentum. '
      + 'The argumentum names a diocese founded (NOVA CONDITUR DIOECESIS), and governs the '
      + 'table (Ruling 9).',
  },
  'benedict-xvi|gambomensis|2013-02-22': {
    argumentum:
      'GAMBOMENSIS* DETRACTO A DIOECESI OUANDOËNSI DISTRICTU CIVILI VULGO « PLATEAUX » NOVA '
      + 'DIOECESIS IN CONGO CONSTITUITUR, GAMBOMENSIS APPELLANDA',
    note:
      'Detaches the civil district of Plateaux from the Diocese of Owando and erects the new '
      + 'Diocese of Gamboma, suffragan to Brazzaville: "...e quo novam dioecesim constituimus, '
      + 'quae Gambomensis appellabitur a nomine urbis Gamboma.".',
  },
  // The fourth curation instalment (Task 5): the entire Paul VI apostolic-constitutions
  // candidate queue (222 candidates, 1963-06-25 through 1977-11-10), each read against its
  // own Latin text on vatican.va. 161 confirmed below as erections; the other 61 sit in the
  // tables below -- 48 elevations, 2 unions, and 11 adjudications (five chapters of canons,
  // a concathedral with a second title, an abbatial title granted to a bishop, new norms
  // for a collegiate basilica, a see withdrawn from its province, a reassignment of
  // suffragans between two provinces, and a see renamed and made suffragan ad instar).
  // Nineteen of the 161 erect an ecclesiastical province rather than a see ('Caliensis',
  // 'Tunquensis', 'Vashingtonensis', 'Oceaniae Meridionalis' -- three provinces and a whole
  // hierarchy at once -- 'Barquisimetensis', 'Maracaibensis', 'Ayacuquensis',
  // 'Huancayensis', 'Meraukensis', 'Antofagastensis', 'Gruardensis et aliarum', 'Labacensis',
  // 'Munhallensis Ruthenorum', 'Barranquillensis', 'Osakaënsis', 'Fluminensis-Seniensis',
  // 'Davaënsis', 'Londrinensis', 'Lipensis'), most raising the see at their head in the
  // same breath: the province is what each argumentum leads with, so each is an erection
  // under the John XXIII rule above. The same rule files three rows the curation script
  // proposed as elevations ('Arundelliensis-Brichtelmestunensis' of 1965, 'Miamiensis et
  // aliarum', 'Iliganensis'): a new see is what each argumentum leads with, and INSUPER or
  // PRAETEREA introduces the raising of the mother see. 'Kalamazuensis et Gaylordensis' leads
  // with boundary changes and introduces its two new dioceses with PRAETEREA; it is filed
  // here because the changes are the vehicle of the erections (EX IIS...CONSTITUUNTUR), on
  // the reading the Pius XII 'Catamarcensis-Saltensis' union row records, and its note says
  // so. 'Fluminensis-Seniensis' names only a province constituted while its body unites two
  // sees with Rijeka and raises the result: the argumentum governs the table (Ruling 9).
  // 'Mahengensis' is the one page whose all-capitals heading is not its own -- vatican.va
  // pasted the Barcelona elevation of a month earlier over a body that erects Mahenge -- so
  // its argumentum is quoted by hand from the sentence-case line the page prints as its
  // title, and the note quotes the mis-pasted heading. Every other argumentum is verbatim
  // as extracted, the page's own misprints kept and named in the note ('DOVA DIOECESIS',
  // 'PIUSBURGENSI', 'ARCHIDIOECCSI'...); two of them break the verb itself ('Tulcanensis'
  // COOSTITUITUR, 'Balasorensis' CONSTI. TUITUR), which the audit regex now lists as
  // misprints (Ruling 10) rather than the quote being repaired. The curation script
  // abstained on
  // thirteen: two print a lower-case l inside the capitalised toponym ('SHlKOKUENSIS',
  // 'CZĘSTOCHOVlENSlS'), so the case-delimited reader stopped at its first word and each is
  // quoted by hand as printed; the other eleven state their act with no listed idiom
  // (RESTITUITUR, CONCEDITUR, EDUNTUR, SEIUNGITUR, ATTRIBUUNTUR, a misprinted verb, or an
  // elevation idiom in an unlisted word order) and were read from the body.
  'paul-vi|belemensis-de-para|1963-06-25': {
    argumentum:
      'BELEMENSIS DE PARÁ (PETROSI CULMINIS) * DIVISO TERRITORIO ARCHIDIOECESIS BELEMENSIS '
      + 'DE PARÁ, NOVA PRAELATURA NULLIUS CONDITUR «PETROSI CULMINIS».',
    note:
      'Detaches the municipalities of Cachoeira do Arari, Ponta de Pedras, Santa Cruz do '
      + 'Arari, Muana, Sao Sebastiao da Boa Vista and Curralinho (Marajo island) from the '
      + 'Archdiocese of Belem do Para and erects the new Prelature Nullius of Ponta de '
      + 'Pedras (Petrosi Culminis): "...quibus omnibus novam praelaturam «nullius» '
      + 'constituimus Petrosi Culminis appellandam...".',
  },
  'paul-vi|pittsburgensis|1963-07-06': {
    argumentum:
      'PITTSBURGENSIS (PASSAICENSIS-PITTSBURGENSIS) * DIVISO TERRITORIO EXARCHATUS '
      + 'PITTSBURGENSIS, DUAE EPARCHIAE CONSTITUUNTUR, QUARUM ALTERA «PASSAICENSIS» NOMINE, '
      + 'ALTERA «PITTSBURGENSIS».',
    note:
      'Divides the Apostolic Exarchate of Pittsburgh for the Ruthenians into two '
      + 'eparchies, Passaic (the Atlantic states and eastern Pennsylvania) and Pittsburgh '
      + '(the remainder): "...Exarchatus apostolicus Pittsburgensis in duas '
      + 'circumscriptiones dividatur, quae quidem nomen et dignitatem eparchiae '
      + 'obtineant...". Stated by the argumentum as two eparchies constituted, and filed on '
      + 'those words.',
  },
  'paul-vi|manaensis-et-parintinensis|1963-07-13': {
    argumentum:
      'MANAËNSIS-PARINTINENSIS* AB ECCLESIIS MANAËNSI ET PARINTINENSI QUAEDAM TERRITORIA '
      + 'DETRAHUNTUR, QUIBUS TRES NOVAE PRAELATURAE NULLIUS CONSTITUUNTUR, «BORBENSIS», '
      + '«COARITANA » ET «ITACOATIARENSIS» APPELLANDAE.',
    note:
      'Detaches municipalities from the Archdiocese of Manaus and the Prelature Nullius of '
      + 'Parintins and erects three new prelatures nullius, Borba, Coari and Itacoatiara: '
      + '"...quibus territoriis novam praelaturam constituimus Borbensem nomine...novamque '
      + 'ex iis praelaturam condimus, Coaritanam appellandam...". The page prints '
      + '"«COARITANA »" with the space, as quoted.',
  },
  'paul-vi|nampulensis|1963-07-21': {
    argumentum:
      'NAMPULENSIS (CABRALOPOLITANAE) * DETRACTO AB ECCLESIA NAMPULENSI TERRITORIO, NOVA '
      + 'EX EO CONDITUR DIOECESIS, «CABRALOPOLITANA» APPELLANDA.',
    note:
      'Detaches the civil district of Niassa from the Diocese of Nampula (Mozambique) and '
      + 'erects the new Diocese of Vila Cabral (Cabralopolitana): "...civilem districtum '
      + 'quem Nyassa vocant, eumque in dioecesis formam redigimus...Cabralopolitanae nomine '
      + 'appellandae...".',
  },
  'paul-vi|nachingweaensis|1963-08-05': {
    argumentum:
      'NACHINGWEAENSIS * AB ABBATIA NULLIUS NDANDAËNSI QUAEDAM TERRITORIA DETRAHUNTUR, '
      + 'QUIBUS NOVA DIOECESIS CONSTITUITUR, «NACHINGWEAENSIS» APPELLANDA.',
    note:
      'Detaches the districts of Tunduru and Masasi from the Abbey Nullius of Ndanda '
      + '(Tanganyika) and erects the new Diocese of Nachingwea, entrusted to the '
      + 'Salvatorians: "...quibus territoriis novam dioecesim condimus, Nachingweaensem '
      + 'appellandam...".',
  },
  'paul-vi|cordubensis|1963-08-12': {
    argumentum:
      'CORDUBENSIS (CRUCIS AXEATE) * EX QUIBUSDAM TERRITORIIS A CORDUBENSI ARCHIDIOECESI '
      + 'SEPARATIS NOVA CONSTITUITUR CATHEDRALIS SEDES, NOMINE «CRUCIS AXEATAE».',
    note:
      'Detaches eight civil departments (San Javier, San Alberto, Pocho, Minas, Cruz del '
      + 'Eje, Ischilin, Sobremonte, Tulumba) from the Archdiocese of Cordoba (Argentina) and '
      + 'erects the new Diocese of Cruz del Eje, suffragan to Cordoba: "...ex iisque novam '
      + 'condimus dioecesim, nomine Crucis Axeatae...". The heading prints "CRUCIS AXEATE", '
      + 'as quoted.',
  },
  'paul-vi|tucumanensis|1963-08-12': {
    argumentum:
      'TUCUMANENSIS (SS. CONOEPTIONIS IN ARGENTINA) * AB ARCHIDIOECESI TUCUMANENSI QUAEDAM '
      + 'TERRITORIA DETRAHUNTUR, QUIBUS NOVA DIOECESIS CONDITUR, «SANCTISSIMAE CONCEPTIONIS '
      + 'IN ARGENTINA» COGNOMINANDA.',
    note:
      'Detaches the departments of Chicligasta, Graneros, Leales, Monteros and Rio Chico '
      + 'from the Archdiocese of Tucuman and erects the new Diocese of Concepcion '
      + '(Argentina), suffragan to Tucuman: "...quo territorio novam dioecesim condimus '
      + 'Sanctissimae Conceptionis in Argentina appellandam...". The heading prints "SS. '
      + 'CONOEPTIONIS", as quoted.',
  },
  'paul-vi|abidjanensis-et-aliarum|1963-09-13': {
    argumentum:
      'ABIDJANENSIS ET ALIARUM (ABENGURUENSIS) * EX QUIBUSDAM DETRACTIS TERRITORIIS AB '
      + 'ARCHIDIOECESI ABIDJANENSI ET A DIOECESIBUS KATIOLAËNSI ET BUAKENSI NOVA CONDITUR '
      + 'DIOECESIS, «ABENGURUENSIS» NOMINE.',
    note:
      'Detaches civil sub-prefectures from the Archdiocese of Abidjan and the Dioceses of '
      + 'Katiola and Bouake and erects the new Diocese of Abengourou (Ivory Coast): '
      + '"...atque ex iis novam dioecesim condimus, Abenguruensem appellandam.".',
  },
  'paul-vi|aitapensis|1963-09-13': {
    argumentum:
      'AITAPENSIS (VANIMOËNSIS) * QUIBUSDAM DISTRACTIS TERRITORIIS A VICARIATU APOSTOLICO '
      + 'AITAPENSI, IN NOVA GUINAEA, PRAEFECTURA APOSTOLICA CONDITUR NOMINE «VANIMOËNSIS».',
    note:
      'Detaches the whole western part of the Apostolic Vicariate of Aitape (New Guinea) '
      + 'and erects the new Apostolic Prefecture of Vanimo: "...integram vicariatus '
      + 'apostolici Aitapensis occidentalem partem distrahimus atque ex ea praefecturam '
      + 'apostolicam constituimus, Vanimoënsem appellandam...".',
  },
  'paul-vi|indorensis-jabalpurensis-aimerensis-jaipurensis|1963-09-13': {
    argumentum:
      'INDORENSIS - JABALPURENSIS AIMERENSIS-JAIPURENSIS (BHOPALENSIS) * EX ECCLESIIS '
      + 'INDORENSI, JABALPURENSI, AIMERENSI-JAIPURENSI QUAEDAM TERRITORIA DETRAHUNTUR, '
      + 'QUIBUS NOVA SEDES METROPOLITANA CONDITUR, «BHOPALENSIS» COGNOMINANDA.',
    note:
      'Detaches the civil districts of Hoshangabad, Sehore, Raisen, Sagar and Vidisha from '
      + 'the Dioceses of Indore, Jabalpur and Ajmer-Jaipur and erects the new metropolitan '
      + 'Archdiocese of Bhopal, with Indore, Jabalpur and Raigarh-Ambikapur as suffragans: '
      + '"...quibus terris novam archidioecesim metropolitanam condimus, Bhopalensem '
      + 'appellandam...".',
  },
  'paul-vi|sobralensis-iguatuvinae|1963-09-28': {
    argumentum:
      'SOBRALENSIS - IGUATUVINAE (CRATEOPOLITANAE) * EX QUIBUSDAM TERRITORIIS DIOECESIUM '
      + 'SOBRALENSIS ET IGUATUVINAE NOVA FIT DIOECESIS, NOMINE «CRATEOPOLITANA».',
    note:
      'Detaches eight municipalities from the Diocese of Sobral and three from the Diocese '
      + 'of Iguatu and erects the new Diocese of Crateus (Brazil): "...ex omnibusque novam '
      + 'condimus dioecesim, Crateopolitanam appellandam...".',
  },
  'paul-vi|seulensis|1963-10-07': {
    argumentum:
      'SEULENSIS (SUVONENSIS)* EX QUIBUSDAM TERRITORIIS ARCHIDIOECESIS SEULENSIS NOVA '
      + 'EFFICITUR DIOECESIS, NOMINE « SUVONENSIS ».',
    note:
      'Detaches the city of Suwon and ten civil districts of Kyonggi province from the '
      + 'Archdiocese of Seoul and erects the new Diocese of Suwon, entrusted to the native '
      + 'Korean clergy: "...ex iisque dioecesim constituimus, Suvonensem appellandam...".',
  },
  'paul-vi|zamboangensis|1963-10-12': {
    argumentum:
      'ZAMBOANGENSIS (ISABELLOPOLITANAE) * DETRACTIS QUIBUSDAM TERRITORIIS AB '
      + 'ARCHIDIOECESI ZAMBOANGENSI, IN INSULIS PHILIPPINIS, NOVA CONDITUR PRAELATURA '
      + 'NULLIUS, NOMINE «ISABELLOPOLITANA».',
    note:
      'Detaches the civil territory of Basilan City from the Archdiocese of Zamboanga '
      + '(Philippines) and erects the new Prelature Nullius of Isabela, giving effect to a '
      + 'decree of John XXIII: "...ex iisque praelaturam «nullius» condi, ab urbe vulgo '
      + 'Isabela Isabellopolitanam nuncupandam...".',
  },
  'paul-vi|mysuriensis|1963-11-16': {
    argumentum:
      'MYSURIENSIS (CHIKMAGALURENSIS) * A DIOECESI MYSURIENSI QUIBUSDAM DETRACTIS '
      + 'TERRITORIIS, NOVA DIOECESIS CONSTITUITUR, «CHIKMAGALURENSIS» NOMINE.',
    note:
      'Detaches the civil districts of Shimoga, Chikmagalur and Hassan (the page prints '
      + 'Rassan) from the Diocese of Mysore and erects the new Diocese of Chikmagalur '
      + '(India): "...ex iisque novam dioecesim constituimus, Chikmagalurensem '
      + 'appellandam...".',
  },
  'paul-vi|quitensis|1963-12-05': {
    argumentum:
      'QUITENSIS (LATACUNGENSIS)* EX QUODAM TERRITORIO ARCHIDIOECESIS QUITENSIS NOVA FIT '
      + 'DIOECESIS, «LATACUNGENSIS» APPELLANDA.',
    note:
      'Detaches the civil province of Cotopaxi from the Archdiocese of Quito and erects '
      + 'the new Diocese of Latacunga (Ecuador): "...ex eoque dioecesim constituimus, cuius '
      + 'nomen Latacungensis...".',
  },
  'paul-vi|moshiensis|1963-12-10': {
    argumentum:
      'MOSHIENSIS (DE SAME)* TERRITORIO CIVILIS DISTRICTUS, QUEM DICUNT, PARE A DIOECESI '
      + 'MOSHIENSI SEPARATO, NOVA PRAEFECTURA APOSTOLICA CONDITUR, «SAMENSIS» NOMINE.',
    note:
      'Detaches the civil district of Pare from the Diocese of Moshi (Tanganyika) and '
      + 'erects the new Apostolic Prefecture of Same: "...in novaeque praefecturae '
      + 'apostolicae formam redigimus, Samensis, ab urbe principe «Same», appellandae...".',
  },
  'paul-vi|nagpurensis|1964-01-16': {
    argumentum:
      'NAGPURENSIS (RAIPURENSIS) * DIVISO TERRITORIO ARCHIDIOECESIS NAGPURENSIS, NOVA '
      + 'PRAEFECTURA APOSTOLICA CONDITUR, «RAIPURENSIS» APPELLANDA.',
    note:
      'Detaches the civil districts of Raipur, Bilaspur and Drug from the Archdiocese of '
      + 'Nagpur and erects the new Apostolic Prefecture of Raipur (India): "...ex iisque '
      + 'novam praefecturam apostolicam constituimus, Raipurensem ab urbe Raipur '
      + 'cognominandam...".',
  },
  'paul-vi|shillongensis-dibrugarhensis|1964-01-16': {
    argumentum:
      'SHILLONGENSIS - DIBRUGARHENSIS (TEZPURENSIS) * DISTRACTIS QUIBUSDAM TERRITORIIS A '
      + 'DIOECESIBUS SHILLONGENSI ET DIBRUGARHENSI IN INDIA, ALIA DIOECESIS CONDITUR NOMINE '
      + '«TEZPURENSIS».',
    note:
      'Detaches districts north of the Brahmaputra from the Dioceses of Shillong and '
      + 'Dibrugarh and erects the new Diocese of Tezpur (India): "...ex iisque omnibus novam '
      + 'dioecesim constituimus, ex urbe Tezpurensem appellandam...".',
  },
  'paul-vi|villavicentiensis-ariariensis|1964-01-16': {
    argumentum:
      'VILLAVICENTIENSIS (ARIARIENSIS) * DIVISO TERRITORIO VICARIATUS APOSTOLICI '
      + 'VILLAVICENTIENSIS, NOVA PRAEFECTURA APOSTOLICA CONDITUR «ARIARIENSIS» NOMINE.',
    note:
      'Detaches the western part of the Apostolic Vicariate of Villavicencio (Colombia) '
      + 'and erects the new Apostolic Prefecture of Ariari: "...partem occidentalem '
      + 'distrahimus ex eaque novam praefecturam apostolicam constituimus Ariariensem '
      + 'cognominandam.".',
  },
  'paul-vi|parakuensis-natitinguensis|1964-02-10': {
    argumentum:
      'PARAKUENSIS (NATITINGUENSIS) * DIVISO TERRITORIO PRAEFECTURAE APOSTOLICAE '
      + 'PARAKUENSIS, NOVA DIOECESIS CONDITUR, «NATITINGUENSIS» NOMINE.',
    note:
      'Detaches the civil district of Natitingou from the Apostolic Prefecture of Parakou '
      + '(Dahomey) and erects the new Diocese of Natitingou: "...ex eaque novam dioecesim '
      + 'constituimus, Natitinguensem ab urbe principe appellandam...". Its companion of the '
      + 'same day raises the reduced prefecture of Parakou to a diocese.',
  },
  'paul-vi|florestensis|1964-02-15': {
    argumentum:
      'PESQUEIRENSIS - PETROLINENSIS (FLORESTENSIS)* DETRACTIS QUIBUSDAM TERRITORIIS AH '
      + 'ECCLESIIS PESQUEIRENSI ET PETROLINENSI, NOVA QUAEDAM DIOECESIS EFFICITUR, '
      + '«FLORESTENSIS» NOMINE.',
    note:
      'Detaches territory from the Dioceses of Pesqueira and Petrolina (Brazil) and erects '
      + 'the new Diocese of Floresta, suffragan to Olinda and Recife: "...quibus sane '
      + 'territoriis novam dioecesim constituimus Florestensem nomine...". The heading '
      + 'prints "AH ECCLESIIS", as quoted.',
  },
  'paul-vi|chulucanensis|1964-03-04': {
    argumentum:
      'PIURENSIS (CHULUCANENSIS)* DETRACTIS QUIBUSDAM TERRITORIIS EX DIOECESI PIURENSI, '
      + 'CONDITUR PRAELATURA «NULLIUS», NOMINE «CHULUCANENSIS».',
    note:
      'Detaches the civil provinces of Morropon, Huancabamba and Ayabaca from the Diocese '
      + 'of Piura (Peru) and erects the new Prelature Nullius of Chulucanas: "...ex iisque '
      + 'praelaturam «nullius» constituimus Chulucanensem appellandam...".',
  },
  'paul-vi|varrensis|1964-03-10': {
    argumentum:
      'URBIS BENINENSIS (VARRENSIS)* EX QUODAM TERRITORIO A DIOECESI URBIS BENINENSIS, IN '
      + 'NIGERIA, DETRACTO, ALIA CONDITUR DIOECESIS, «VARRENSIS» NOMINE.',
    note:
      'Detaches the civil province of Warri from the Diocese of Benin City (Nigeria) and '
      + 'erects the new Diocese of Warri, entrusted to the native clergy: "...ex ea novam '
      + 'dioecesim constituimus, Varrensem cognominandam...".',
  },
  'paul-vi|mahengensis|1964-04-21': {
    argumentum:
      'Ex quibusdam distractis territoriis ab archidioecesi Daressalaamensi nova efficitur '
      + 'dioecesis, «Mahengensis» nomine',
    note:
      'Detaches the civil district of Mahenge, part of the Game Reserve and a small part '
      + 'of the Nachingwea district from the Archdiocese of Dar-es-Salaam (Tanganyika) and '
      + 'erects the new Diocese of Mahenge, entrusted to the native clergy: "...ex iisque '
      + 'territoriis cathedralem Sedem condimus nomine Mahengensem quam clero natu '
      + 'Tanganyicano regendam committimus.". The page prints, in the place of the '
      + 'argumentum, the all-capitals heading of the Barcelona constitution of 1964-03-25 '
      + '("BARCINONENSIS* CATHEDRALIS ECCLESIA BARCINONENSIS AD GRADUM ARCHIDIOECESIS '
      + 'EVEHITUR."), pasted over a body that erects Mahenge -- a page misprint, not a '
      + 'statement of this act -- which is why the curation script proposed an elevation. '
      + 'The argumentum quoted here is the one the page prints for this document in its own '
      + 'title line, in sentence case, and is quoted by hand as printed.',
  },
  'paul-vi|caliensis|1964-06-20': {
    argumentum:
      'CALIENSIS* QUIBUSDAM ECCLESIIS A METROPOLITANA ARCHIDIOECESI POPAYANENSI DETRACTIS, '
      + 'NOVA PROVINCIA ECCLESIASTICA EFFICITUR, «CALIENSIS» NOMINE.',
    note:
      'Withdraws Cali from the metropolitan jurisdiction of Popayan, raises it to a '
      + 'metropolitan see and erects the new ecclesiastical province of Cali (Colombia): '
      + '"...eamque ad gradum metropolitanae Sedis tollimus...praeterea novam condimus '
      + 'provinciam ecclesiasticam...". The province is what the argumentum leads with, so '
      + 'this is an erection under the John XXIII rule.',
  },
  'paul-vi|tunquensis|1964-06-20': {
    argumentum:
      'TUNQUENSIS* NOVA IN COLUMBIA PROVINCIA ECCLESIASTICA CONDITUR «TUNQUENSIS», CUIUS '
      + 'ECCLESIA PRINCEPS TUNQUENSIS AD METROPOLITANAE SEDIS GRADUM TOLLITUR.',
    note:
      'Erects the new ecclesiastical province of Tunja (Colombia), withdrawing Tunja from '
      + 'the metropolitan jurisdiction of Bogota and raising it to a metropolitan see: '
      + '"...Dioecesim Tunquensem a iure metropolitano Ecclesiae Bogotensis eximimus eamque '
      + 'in metropolitanae Sedis formam redigimus...". The province is what the argumentum '
      + 'leads with, so this is an erection under the John XXIII rule.',
  },
  'paul-vi|cholutensis|1964-09-08': {
    argumentum:
      'TEGUCIGALPENSIS (CHOLUTENSIS)* EX DETRACTIS TERRITORIIS QUIBUSDAM AB ARCHIDIOECESI '
      + 'TEGUCIGALPENSI NOVA CONDITUR PRAELATURA «NULLIUS», NOMINE «CHOLUTENSIS».',
    note:
      'Detaches the civil departments of Choluteca and Valle from the Archdiocese of '
      + 'Tegucigalpa and erects the new Prelature Nullius of Choluteca (Honduras): "...ex '
      + 'iis novam praelaturam «nullius» constituimus, Cholutensem appellandam...".',
  },
  'paul-vi|ipialensis|1964-09-23': {
    argumentum:
      'PASTOPOLITANAE-TUMACOENSIS-SIBUNDOYENSIS (IPIALENSIS)* DETRACTIS QUIBUSDAM '
      + 'TERRITORIIS A DIOECESI PASTOPOLITANA ATQUE VICARIATIBUS APOSTOLICIS TUMACOËNSI ET '
      + 'SIBUNDOYENSI, NOVA IN COLUMBIANA REPUBLICA CONDITUR DIOECESIS, «IPIALENSIS» NOMINE.',
    note:
      'Detaches municipalities from the Diocese of Pasto and territory from the Apostolic '
      + 'Vicariates of Tumaco and Sibundoy and erects the new Diocese of Ipiales (Colombia), '
      + 'suffragan to Popayan: "...ex iisque simul sumptis dioecesim constituimus, '
      + 'Ipialensem appellandam...".',
  },
  'paul-vi|atakpamensis|1964-09-29': {
    argumentum:
      'LOMENSIS (ATAKPAMENSIS)* EX QUIBUSDAM TERRITORIIS ARCHIDIOECESIS LOMENSIS ALIA '
      + 'CONDITUR DIOECESIS, NOMINE «ATAKPAMENSIS».',
    note:
      'Detaches the administrative circumscriptions of Atakpame, Akposso and Nuatja from '
      + 'the Archdiocese of Lome (Togo) and erects the new Diocese of Atakpame, suffragan to '
      + 'Lome: "...ex eoque dioecesim condimus nomine Atakpamensem...".',
  },
  'paul-vi|tuxtlensis|1964-10-27': {
    argumentum:
      'CHIAPENSIS ET ALIARUM (TUXTLENSIS)* NONNULLIS TERRITORIIS AB ECCLESIIS CHIAPENSI, '
      + 'TAPACOLENSI ET TABASQUENSI DETRACTIS, NOVA DIOECESIS CONDITUR, NOMINE «TUXTLENSIS».',
    note:
      'Detaches municipalities from the Dioceses of Chiapas, Tapachula and Tabasco and '
      + 'erects the new Diocese of Tuxtla (Mexico): "...His autem omnibus terris novam '
      + 'dioecesim constituimus, Tuaxtlensem nomine...". The same act renames the Diocese of '
      + 'Chiapas San Cristobal de Las Casas.',
  },
  'paul-vi|caguensis|1964-11-04': {
    argumentum:
      'S. IOANNIS PORTORICENSIS-PONCENSIS (CAGUENSIS)* AB ECCLESIIS S. IOANNIS '
      + 'PORTORICENSIS ET PONCENSIS QUAEDAM TERRITORIA DETRAHUNTUR, QUIBUS NOVA DIOECESIS '
      + 'CONDITUR, «CAGUENSIS» APPELLANDA.',
    note:
      'Detaches parishes from the Archdiocese of San Juan de Puerto Rico and from the '
      + 'Diocese of Ponce and erects the new Diocese of Caguas: "...quibus omnibus '
      + 'territoriis novam dioecesim condimus, Caguensem appellandam...".',
  },
  'paul-vi|minnaensis|1964-11-09': {
    argumentum:
      'KADUNAËNSIS (MINNAENSIS)* E QUODAM TERRITORIO ARCHIDIOECESIS KADUNAËNSIS NOVA FIT '
      + 'PRAEFECTURA APOSTOLICA, NOMINE «MINNAENSIS».',
    note:
      'Detaches the civil province of Niger from the Archdiocese of Kaduna and erects the '
      + 'new Apostolic Prefecture of Minna (Nigeria), attached to the province of Kaduna and '
      + 'entrusted to the Society of St Patrick: "...ex eoque novam praefecturam condimus ab '
      + 'eius urbe principe Minnaensem appellandam...".',
  },
  'paul-vi|budjalaensis|1964-11-25': {
    argumentum:
      'BUDJALAËNSIS (LISALAËNSIS)* DETRACTO QUODAM TERRITORIO E DIOECESI LISALAËNSI, NOVA '
      + 'DIOECESIS CONDITUR, «BUDIALAËNSIS» APPELLANDA.',
    note:
      'Detaches the western part of the Diocese of Lisala (Congo) and erects the new '
      + 'Diocese of Budjala, entrusted to the Scheut Fathers: "...quo aliam dioecesim '
      + 'constituimus, Budjalaënsem e principe regionis urbe appellandam...". The heading '
      + 'prints "«BUDIALAËNSIS»", as quoted.',
  },
  'paul-vi|marsabitensis|1964-11-25': {
    argumentum:
      'NYERIENSIS (MARSABITENSIS)* QUIBUSDAM TERRITORIIS E DIOECESI NYERIENSI DETRACTIS, '
      + 'NOVA CONDITUR SEDES CATHEDRALIS, «MARSABITENSIS» COGNOMINANDA.',
    note:
      'Detaches the districts of Marsabit and Samburu from the Diocese of Nyeri (Kenya) '
      + 'and erects the new Diocese of Marsabit, entrusted to the Consolata missionaries: '
      + '"...quibus aliam dioecesim condimus, ab urbe principe regionis Marsabitensem '
      + 'appellandam...".',
  },
  'paul-vi|apucaranensis|1964-11-28': {
    argumentum:
      'LONDRINENSIS - CAMPI MORANENSIS (APUCARANENSIS) * NONNULLIS TERRITORIIS EX '
      + 'ECCLESIIS LONDRINENSI ET CAMPI MORANENSIS DETRACTIS, NOVA QUAEDAM DIOECESIS '
      + 'CONDITUR «APUCARANENSIS» APPELLANDA.',
    note:
      'Detaches municipalities from the Diocese of Londrina and the municipality of '
      + 'Ivaipora from the Diocese of Campo Mourao and erects the new Diocese of Apucarana '
      + '(Brazil), suffragan to Curitiba: "...quibus terris novam dioecesim constituimus, '
      + 'Apucaranensem appellandam.".',
  },
  'paul-vi|tulcanensis|1965-03-17': {
    argumentum:
      'IBARRENS (TULCANENSIS) * DETRACTIS QUIBUSDAM TERRITORIIS A DIOECESI IBARRENSI, NOVA '
      + 'EX IIS DIOECESIS COOSTITUITUR, «TULCANENSIS» APPELLANDA.',
    note:
      'Detaches the civil province of Carchi from the Diocese of Ibarra and erects the new '
      + 'Diocese of Tulcan (Ecuador), suffragan to Quito: "...ex iisque novam condimus '
      + 'dioecesim Tulcanensem appellandam...". The heading prints "IBARRENS" and '
      + '"COOSTITUITUR", as quoted; the misprinted verb matched no idiom, so the curation '
      + 'script abstained.',
  },
  'paul-vi|morotoensis|1965-03-22': {
    argumentum:
      'GULUENSIS (MOROTOËNSIS) * A DIOECESI GULUENSI TERRITORIUM, VOLGARI LINGUA KARAMOJA '
      + 'COGNOMINATUM, SEPARATUR IDEMQUE IN DIOECESIS FORMAM REDIGITUR, «MOROTOËNSIS» '
      + 'APPELLANDAE.',
    note:
      'Detaches the district of Karamoja from the Diocese of Gulu (Uganda) and erects the '
      + 'new Diocese of Moroto, entrusted to the Comboni missionaries and suffragan to '
      + 'Rubaga: "...ex eoque novam dioecesim constituimus, a principe regionis urbe '
      + 'Morotoënsem appellandam...".',
  },
  'paul-vi|nakornrajasimaensis|1965-03-22': {
    argumentum:
      'UBONENSIS (NAKORNRAJASIMAENSIS) * DIVISO TERRITORIO VICARIATUS APOSTOLICI '
      + 'UBONENSIS, NOVUS APOSTOLICUS VICARIATUS CONDITUR, «NAKORNRAJASIMAENSIS» NOMINE.',
    note:
      'Detaches the civil districts of Nakhon Ratchasima, Buriram and Chaiyaphum from the '
      + 'Apostolic Vicariate of Ubon (Thailand) and erects the new Apostolic Vicariate of '
      + 'Nakhon Ratchasima, entrusted to the Paris Foreign Missions: "...ex iis novum '
      + 'Vicariatum Apostolicum constituimus Nakornrajasimaensem appellandum...".',
  },
  'paul-vi|voniuensis|1965-03-22': {
    argumentum:
      'CHUNCHEONENSIS (VONIUENSIS) * DETRACTIS AB ECCLESIA CHUNCHEONENSI QUIBUSDAM '
      + 'TERRITORIIS, NOVA DIOECESIS IN COREA CONDITUR, «VONIUENSIS» APPELLANDA.',
    note:
      'Detaches the civil circumscriptions of Wonseong, Yeongwol, Samcheok, Jeongseon and '
      + 'Uljin from the Diocese of Chuncheon and erects the new Diocese of Wonju (Korea), '
      + 'entrusted to the secular clergy: "...ex eo novam dioecesim constituimus Voniuensem '
      + 'ab urbe principe, appellandam...".',
  },
  'paul-vi|arundelliensis-brichtelmestunensis|1965-05-28': {
    argumentum:
      'SOUTHVARCENSIS (ARUNDELLIENSIS - BRICHTELMESTUNENSIS) * QUIBUSDAM DISTRACTIS '
      + 'TERRITORIIS A DIOECESI SOUTHVARCENSI, NOVA CONDITUR DIOECESIS, «ARUNDELLIENSIS - '
      + 'BRICHTELMESTUNENSIS» APPELLANDA. EADEM INSUPER ECCLESIA SOUTHVARCENSIS IN ORDINEM '
      + 'METROPOLITANARUM EVEHITUR.',
    note:
      'Detaches the counties of Surrey and Sussex from the Diocese of Southwark and erects '
      + 'the new Diocese of Arundel and Brighton: "...ex iisque novam dioecesim condimus '
      + 'nomine Arundelliensem-Brichtelmestunensem...". INSUPER, as the secondary act, '
      + 'Southwark is raised to a metropolitan see at the head of a new province. The '
      + 'erection is what the argumentum leads with, so this is an erection under the John '
      + 'XXIII rule; the curation script proposed an elevation on the EVEHITUR of the second '
      + 'sentence.',
  },
  'paul-vi|itabirensis|1965-06-14': {
    argumentum:
      'MARIANENSIS - ADAMANTINAE (ITABIRENSIS) * SEIUNCTIS AB ARCHIDIOECESIBUS MARIANENSI '
      + 'ET ADAMANTINA NONNULLIIS TERRITORIIS, NOVA CONSTITUITUR DIOECESIS, NOMINE '
      + '«ITABIRENSIS».',
    note:
      'Detaches municipalities from the Archdioceses of Mariana and Diamantina and erects '
      + 'the new Diocese of Itabira (Brazil), suffragan to Mariana: "...atque iis novam '
      + 'dioecesim condimus, Itabirensem appellandam...". The heading prints "NONNULLIIS", '
      + 'as quoted.',
  },
  'paul-vi|bafiensis|1965-07-06': {
    argumentum:
      'YAUNDENSIS (BAFIENSIS) * SEIUNCTO TERRITORIO AB ARCHIDIOECESI YAUNDENSI, NOVA '
      + 'EFFICITUR PRAEFECTURA APOSTOLICA, NOMINE «BAFIENSIS».',
    note:
      'Detaches the civil district of Mbam from the Archdiocese of Yaounde (Cameroon) and '
      + 'erects the new Apostolic Prefecture of Bafia, entrusted to the Holy Ghost Fathers: '
      + '"...eoque novam praefecturam condimus Bafiensem nomine...".',
  },
  'paul-vi|brownsvillensis|1965-07-10': {
    argumentum:
      'CORPORIS CHRISTI (BROWNSVILLENSIS)* DETRACTIS QUIBUSDAM TERRITORIIS E DIOECESI '
      + 'CORPORIS CHRISTI, NOVA EFFICITUR DIOECESIS, «BROWNSVILLENSIS» APPELLANDA.',
    note:
      'Detaches four counties at the southern end of the Diocese of Corpus Christi (Texas) '
      + 'and erects the new Diocese of Brownsville, suffragan to San Antonio: "...his novam '
      + 'dioecesim constituimus, quae a principe urbe Brownsville...Brownsvillensis '
      + 'appellabitur.".',
  },
  'paul-vi|calamensis-in-chilia|1965-07-21': {
    argumentum:
      'ANTOFAGASTENSIS - IQUIQUENSIS (CALAMENSIS IN CHILIA)* QUIBUSDAM DETRACTIS '
      + 'TERRITORIIS A DIOECESIBUS ANTOFAGASTENSI ET IQUIQUENSI, NOVA PRAELATURA CONDITUR, '
      + '«CALAMENSIS IN CHILIA» APPELLANDA.',
    note:
      'Detaches the department of El Loa and the district of Pampa Union from the Dioceses '
      + 'of Antofagasta and Iquique and erects the new Prelature Nullius of Calama (Chile): '
      + '"...iisque novam praelaturam «nullius» condimus, Calamensem in Chilia '
      + 'appellandam...".',
  },
  'paul-vi|barinensis|1965-07-23': {
    argumentum:
      'EMERITENSIS - CALABOCENSIS (BARINENSIS) * DETRACTO A DIOECESIBUS EMERITENSI ET '
      + 'CALABOCENSI QUODAM TERRITORIO, NOVA CONDITUR DIOECESIS, NOMINE «BARINENSIS».',
    note:
      'Detaches the state of Barinas from the Archdiocese of Merida and the Diocese of '
      + 'Calabozo and erects the new Diocese of Barinas (Venezuela), suffragan to Merida: '
      + '"...eoque dioecesim condimus, Barinensem appellandam...".',
  },
  'paul-vi|cabimensis|1965-07-23': {
    argumentum:
      'MARACAIBENSIS (CABIMENSIS) * DETRACTIS A DIOECESI MARACAIBENSI TERRITORIIS, NOVA '
      + 'DIOECESIS CONDITUR, «CABIMENSIS» NOMINE.',
    note:
      'Detaches the civil districts of Miranda, Bolivar, Baralt and Sucre in the state of '
      + 'Zulia from the Diocese of Maracaibo and erects the new Diocese of Cabimas '
      + '(Venezuela): "...ex eo novam dioecesim constituimus, Cabimensem ab urbe principe '
      + 'appellandam...".',
  },
  'paul-vi|tequinensis|1965-07-23': {
    argumentum:
      'CARACENSIS (TEQUINENSIS) * TERRITORIO QUODAM AB ARCHIDIOECESI CARACENSI SEPARATO, '
      + 'NOVA DIOECESIS CONDITUR «TEQUINENSIS» APPELLANDA.',
    note:
      'Detaches the state of Miranda, less the district of Sucre, from the Archdiocese of '
      + 'Caracas and erects the new Diocese of Los Teques (Venezuela), suffragan to Caracas: '
      + '"...novam ex eo dioecesim condimus, quam censemus Tequinensem appellari...".',
  },
  'paul-vi|vashingtonensis|1965-10-12': {
    argumentum:
      'VASHINGTONENSIS * IN FOEDERATIS AMERICAE SEPTEMTRIONALIS CIVITATIBUS NOVA PROVINCIA '
      + 'ECCLESIASTICA CONSTITUITUR, «VASHINGTONENSIS» NOMINE.',
    note:
      'Erects the new ecclesiastical province of Washington (United States), raising the '
      + 'archiepiscopal see of Washington, until now immediately subject to the Holy See, to '
      + 'metropolitan rank with the Prelature Nullius of the Virgin Islands as its '
      + 'suffragan: "...Archiepiscopalem sedem Vashingtonensem...ad gradum dignitatemque '
      + 'metropolitanae attollimus...". The province is what the argumentum states, so this '
      + 'is an erection under the John XXIII rule.',
  },
  'paul-vi|phucuongensis|1965-10-14': {
    argumentum:
      'SAIGONENSIS (PHUCUONGENSIS)* NONNULLIS TERRITORIIS AB ARCHIDIOECESI SAIGONENSI '
      + 'DETRACTIS, NOVA DIOECESIS CONDITUR, «PHUCUONGENSIS» APPELLANDA.',
    note:
      'Detaches the civil circumscriptions of Phuoc Thanh, Binh Duong, Tay Ninh and Binh '
      + 'Long from the Archdiocese of Saigon and erects the new Diocese of Phu Cuong '
      + '(Vietnam), suffragan to Saigon: "...novam ex iis dioecesim condimus, quam '
      + 'Phucuongensem appellari decernimus.".',
  },
  'paul-vi|xuanlocensis|1965-10-14': {
    argumentum:
      'SAIGONENSIS (XUANLOCENSIS) * QUIBUSDAM DETRACTIS TERRITORIIS EX ARCHIDIOECESI '
      + 'SAIGONENSI, NOVA IN VIETNAMENSI REGIONE DIOECESIS CONDITUR, «XUANLOCENSIS» NOMINE.',
    note:
      'Detaches the civil circumscriptions of Bien Hoa, Long Khanh and Phuoc Tuy from the '
      + 'Archdiocese of Saigon and erects the new Diocese of Xuan Loc (Vietnam), suffragan '
      + 'to Saigon: "...iisque dioecesim fundamus, Xuanlocensem nomine...".',
  },
  'paul-vi|guarapuavensis|1965-12-16': {
    argumentum:
      'DE PONTA GROSSA ET ALIARUM (GUARAPUAVENSIS)* QUIBUSDAM TERRITORIIS DIOECESIUM DE '
      + 'PONTA GROSSA, CAMPI MORANENSIS ET TOLETANAE IN BRASILIA NOVA CONDITUR DIOECESIS '
      + '«GUARAPUAVENSIS».',
    note:
      'Detaches six municipalities from the Diocese of Ponta Grossa, territory from the '
      + 'Diocese of Campo Mourao and the municipality of Laranjeiras do Sul from the Diocese '
      + 'of Toledo and erects the new Diocese of Guarapuava (Brazil): "...iisque novam '
      + 'dioecesim constituimus, Guarapuavensem appellandam...".',
  },
  'paul-vi|nouakchottensis|1965-12-18': {
    argumentum:
      'S. LUDOVICI SENEGALENSIS (NOUAKCROTTENSIS)* SEPARATO A PRAEFECTURA APOSTOLICA '
      + 'SANCTI LUDOVICI SENEGALENSIS QUODAM TERRITORIO, NOVA DIOECESIS CONDITUR, '
      + '«NOUAKCHOTTENSIS» APPELLANDA.',
    note:
      'Detaches the territory of the Republic of Mauritania from the Apostolic Prefecture '
      + 'of Saint-Louis du Senegal and erects the new Diocese of Nouakchott, suffragan to '
      + 'Dakar: "...eoque novam dioecesim condimus, Nouakchottensem appellandam...". The '
      + 'heading prints "NOUAKCROTTENSIS" in the parenthesis, as quoted.',
  },
  'paul-vi|maldonadensis-orientalis-orae|1966-01-10': {
    argumentum:
      'FODINENSIS (MALDONADENSIS - ORIENTALIS ORAE)* QUIBUSDAM DISTRACTIS TERRITORIIS A '
      + 'DIOECESI FODINENSI, NOVA CONDITUR SEDES CATHEDRALIS, «MALDONADENSIS-ORIENTALIS '
      + 'ORAE» APPELLANDA.',
    note:
      'Detaches the departments of Maldonado (less the parish of Aigua) and Rocha (less '
      + 'the parish of Lascano) from the Diocese of Minas and erects the new Diocese of '
      + 'Maldonado-Punta del Este (Uruguay): "...ex iisque novam dioecesim condimus '
      + 'Maldonadensem-Orientalis Orae appellandam...".',
  },
  'paul-vi|ancoragiensis|1966-01-22': {
    argumentum:
      'DE FAIRBANKS - JUNELLENSIS (ANCORAGIENSIS)* DETRACTIS QUIBUSDAM TERRITORIIS EX '
      + 'ECCLESIIS CATHEDRALIBUS DE FAIRBANKS ET JUNELLENSI, NOVA ECCLESIA CONDITUR '
      + 'METROPOLITANA «ANCORAGIENSIS» NOMINE. NOVA PRAETEREA CONSTITUITUR PROVINCIA '
      + 'ECCLESIASTICA EODEM NOMINE ANCORAGIENSI.',
    note:
      'Detaches the Third Judicial Division of Alaska from the Dioceses of Fairbanks and '
      + 'Juneau and erects the new metropolitan Archdiocese of Anchorage: "...Quo territorio '
      + 'novam archidioecesim condimus ab urbe Ancorage...Ancoragiensem appellandam...". '
      + 'PRAETEREA, as the secondary act, the province of Anchorage is constituted with '
      + 'Fairbanks and Juneau as suffragans.',
  },
  'paul-vi|masanensis|1966-02-15': {
    argumentum:
      'PUSANENSIS (MASANENSIS)* QUIBUSDAM DETRACTIS TERRITORIIS A DIOECESI PUSANENSI, IN '
      + 'COREA, NOVA DIOECESIS CONSTITUITUR, NOMINE «MASANENSIS».',
    note:
      'Detaches the cities of Masan, Jinju, Samcheonpo, Jinhae and Chungmu and thirteen '
      + 'civil circumscriptions from the Diocese of Pusan and erects the new Diocese of '
      + 'Masan (Korea): "...eoque novam dioecesim condimus, Masanensem cognominandam.".',
  },
  'paul-vi|mexicalensis|1966-03-25': {
    argumentum:
      'HERMOSILLENSIS - TIGIUANAËNSIS (MEXICALENSIS)* AB ECCLESIIS HERMOSILLENSI ATQUE '
      + 'TIGIUANAËNSI QUAEDAM TERRITORIA DETRAHUNTUR, QUIBUS NOVA DIOECESIS CONSTITUITUR, '
      + '«MEXICALENSIS» APPELLANDA.',
    note:
      'Detaches the municipalities of Mexicali and San Luis Rio Colorado and part of '
      + 'Ensenada from the Diocese of Tijuana, and Puerto Penasco from the Archdiocese of '
      + 'Hermosillo, and erects the new Diocese of Mexicali (Mexico): "...quibus omnibus '
      + 'terris novam dioecesim constituimus, Mexicalensem appellandam...".',
  },
  'paul-vi|materiensis|1966-04-25': {
    argumentum:
      'CHIHUAHUENSIS ET ALIARUM (MATERIENSIS)* QUIBUSDAM TERRITORIIS SEPARATIS EX '
      + 'ECCLESIIS CHIHUAHUENSI, CIVITATIS JUAREZENSIS ET CIVITATIS OBREGONENSIS, NOVA '
      + 'PRELATURA CONSTITUITUR, «MATERIENSIS» APPELLANDA.',
    note:
      'Detaches the municipalities of Guerrero and Bachiniva from the Archdiocese of '
      + 'Chihuahua, seven municipalities from the Diocese of Ciudad Juarez and the territory '
      + 'of Yecora from the Diocese of Ciudad Obregon and erects the new Prelature of Madera '
      + '(Mexico), suffragan to Chihuahua: "...quibus sane terris novam praelaturam '
      + 'constituimus, Materiensem appellandam...". The heading prints "PRELATURA", as '
      + 'quoted.',
  },
  'paul-vi|barquisimetensis|1966-04-30': {
    argumentum:
      'BARQUISIMETENSIS* NOVA CONSTITUITUR IN VENETIOLANA REPUBLICA PROVINCIA '
      + 'ECCLESIASTICA, CUIUS CAPUT EST ECCLESIA METROPOLITANA «BARQUISIMETENSIS».',
    note:
      'Erects the new ecclesiastical province of Barquisimeto (Venezuela), separating '
      + 'Barquisimeto from the province of Caracas and raising it to a metropolitan see with '
      + 'Guanare as its suffragan: "...ad dignitatem et gradum metropolitanae '
      + 'attollimus...eamque simul caput efficimus novae provinciae ecclesiasticae, '
      + 'Barquisimetensis nomine...". The province is what the argumentum leads with, so '
      + 'this is an erection under the John XXIII rule.',
  },
  'paul-vi|maracaibensis|1966-04-30': {
    argumentum:
      'MARACAIBENSIS* NOVA PROVINCIA ECCLESIASTICA IN VENETIOLA CONDITUR, CUIUS '
      + 'METROPOLITANA SEDES «MARACAIBENSIS» ERIT.',
    note:
      'Erects the new ecclesiastical province of Maracaibo (Venezuela), of Maracaibo as '
      + 'metropolitan see with Cabimas and Coro as suffragans, the first two taken from the '
      + 'province of Merida and the third from Caracas: "...novam provinciam ecclesiasticam '
      + 'condimus, quae constabit Ecclesiis Maracaibensi, Cabimensi, Corensi...".',
  },
  'paul-vi|oceaniae-meridionalis|1966-06-21': {
    argumentum:
      'OCEANIAE MERIDIONALIS * IN INSULIS OCEANIAE MERIDIONALIS SACRA HIERARCHIA '
      + 'CONSTITUITUR.',
    note:
      'Establishes the episcopal hierarchy of the South Pacific islands: erects three '
      + 'ecclesiastical provinces -- Noumea (with Port-Vila and Wallis and Futuna), Suva '
      + '(with Apia and Tarawa) and Papeete (with Taiohae) -- turning the apostolic '
      + 'vicariates at their heads and among their suffragans into metropolitan sees and '
      + 'dioceses, and erects two more dioceses, Rarotonga (suffragan to Wellington) and '
      + 'Tonga (immediately subject to the Holy See): "...ita sacram Hierarchiam condimus, '
      + 'ut tres provinciae exstent ecclesiasticae atque duae dioeceses...Praeterea has duas '
      + 'dioeceses condimus...". Provinces and sees are founded, so this is an erection, not '
      + 'a reorganisation of what existed.',
  },
  'paul-vi|bellomontensis|1966-06-25': {
    argumentum:
      'GALVESTONIENSIS - HOUSTONIENSIS (BELLOMONTENSIS)* DIVISA DIOECESI '
      + 'GALVESTONIENSI-HOUSTONIENSI, NOVA INDE EFFICITUR DIOECESIS «BELLOMONTENSIS» '
      + 'APPELLANDA.',
    note:
      'Detaches counties in south-eastern Texas from the Diocese of Galveston-Houston and '
      + 'erects the new Diocese of Beaumont, suffragan to San Antonio: "...quibus sane '
      + 'territoriis novam dioecesim condimus, ab urbe vulgo Beaumont...Bellomontensem '
      + 'appellandam.".',
  },
  'paul-vi|buguensis|1966-06-29': {
    argumentum:
      'PALMIRANAE - CALIENSIS (BUGUENSIS)* QUIBUSDAM TERRITORIIS AB ARCHIDIOECESI CALIENSI '
      + 'ET DIOECESI PALMIRANA SEPARATIS, NOVA IN COLUMBIANA REPUBLICA DIOECESIS CONDITUR, '
      + '«BUGUENSIS» APPELLANDA.',
    note:
      'Detaches eight municipalities from the Diocese of Palmira and the municipalities of '
      + 'Trujillo and Riofrio from the Archdiocese of Cali and erects the new Diocese of '
      + 'Buga (Colombia), suffragan to Cali; four other municipalities pass from Cali to '
      + 'Palmira: "...ex iisque novam dioecesim condimus, Buguensem appellandam...".',
  },
  'paul-vi|ayacuquensis|1966-06-30': {
    argumentum:
      'AYACUQUENSIS* IN PERUVIANA REPUBLICA NOVA CONDITUR PROVINCIA ECCLESIASTICA, NOMINE '
      + '«AYACUQUENSIS».',
    note:
      'Erects the new ecclesiastical province of Ayacucho (Peru), withdrawing Ayacucho '
      + 'from the province of Cuzco and raising it to a metropolitan see, with the Diocese '
      + 'of Huancavelica and the Prelature of Caraveli as suffragans: "...ita statuentes ut '
      + 'tribus his sedibus nova provincia ecclesiastica formetur, Ayacuquensis '
      + 'appellanda...". The province is what the argumentum states, so this is an erection '
      + 'under the John XXIII rule.',
  },
  'paul-vi|huancayensis|1966-06-30': {
    argumentum:
      'HUANCAYENSIS* IN PERUVIANA REPUBLICA NOVA PROVINCIA ECCLESIASTICA CONSTITUITUR, '
      + 'NOMINE «HUANCAYENSIS».',
    note:
      'Erects the new ecclesiastical province of Huancayo (Peru), separating Huancayo from '
      + 'Lima and raising it to a metropolitan see, with the Diocese of Huanuco and the '
      + 'Prelature of Tarma as suffragans: "...Huancayensem cathedralem sedem a '
      + 'metropolitana Ecclesia Limana seiungimus atque ad gradum archiepiscopalis '
      + 'metropolitanae sedis attollimus...Nova constituta provincia formabitur...". The '
      + 'province is what the argumentum states, so this is an erection under the John XXIII '
      + 'rule.',
  },
  'paul-vi|barodensis|1966-09-29': {
    argumentum:
      'BARODENSIS (BOMBAYENSIS) * DIVISA ARCHIDIOECESI BOMBAYENSI, NOVA DIOECESIS '
      + 'CONSTITUITUR, «BARODENSIS» APPELLANDA.',
    note:
      'Detaches the civil districts of Panchmahals, Baroda, Broach, Surat and Dangs in '
      + 'Gujarat from the Archdiocese of Bombay and erects the new Diocese of Baroda '
      + '(India), entrusted to the Indian secular clergy: "...detrahimus inque formam '
      + 'dioecesis redigimus, nomine Barodensis...".',
  },
  'paul-vi|nemptodurensis-et-aliarum|1966-10-09': {
    argumentum:
      'PARISIENSIS - VERSALIENSIS (NEMPTODURENSIS ET ALIARUM) * ECCLESIIS PARISIENSI ATQUE '
      + 'VERSALIENSI DIVISIS, NOVAE CONSTITUUNTUR: «NEMPTODURENSIS», «S. DIONYSII IN '
      + 'FRANCIA», «CHRISTOLIENSIS», «CORBILIENSIS» ATQUE «PONTISARENSIS».',
    note:
      'Divides the Archdiocese of Paris and the Diocese of Versailles along the new civil '
      + 'departments and erects five new dioceses: Nanterre (Hauts-de-Seine), Saint-Denis '
      + '(Seine-Saint-Denis), Creteil (Val-de-Marne), Corbeil (Essonne) and Pontoise (Val-d '
      + 'Oise): "...eaque novam dioecesim constituimus, a nomine urbis Nanterre '
      + 'Nemptodurensem appellandam...novam item dioecesim condimus, S. Dionysii in '
      + 'Francia...aliam dioecesim constituimus, Christoliensem nomine...dioecesim '
      + 'Corbiliensem efficimus...in formamque novae dioecesis redigimus, Pontisarensis...".',
  },
  'paul-vi|bayombongensis|1966-11-07': {
    argumentum:
      'TUGUEGARAOANAE (BAYOMBONGENSIS) * DETRACTIS QUIBUSDAM TERRITORIIS A DIOECESI '
      + 'TUGUEGARAOANA, NOVA PRAELATURA CONDITUR, «BAYOMBONGENSIS» NOMINE.',
    note:
      'Detaches the civil province of Nueva Vizcaya from the Diocese of Tuguegarao and '
      + 'erects the new Prelature of Bayombong (Philippines): "...Hoc territorio novam '
      + 'praelaturam efficimus, ab urbe vulgo Bayombong...Bayombongensem appellandam.".',
  },
  'paul-vi|iundiaiensis|1966-11-07': {
    argumentum:
      'SANCTI PAULI IN BRASILIA - CAMPINENSIS (IUNDIAIENSIS) * QUIBUSDAM DETRACTIS '
      + 'TERRITORIIS ARCHIDIOECESIUM S. PAULI IN BRASILIA ET CAMPINENSIS, NOVA CONDITUR '
      + 'DIOECESIS, NOMINE «IUNDIAIENSIS».',
    note:
      'Detaches ten municipalities from the Archdiocese of Sao Paulo and the municipality '
      + 'of Louveira from the Archdiocese of Campinas and erects the new Diocese of Jundiai '
      + '(Brazil): "...ex iisque dioecesim constituimus Iundiaiensem...".',
  },
  'paul-vi|meraukensis|1966-11-15': {
    argumentum:
      'MERAUKENSIS * IN TERRITORIIS QUAE VULGO IRIAN OCCIDENTALIS APPELLANTUR NOVA '
      + 'PROVINCIA ECCLESIASTICA CONDITUR, «MERAUKENSIS» NOMINE.',
    note:
      'Erects the new ecclesiastical province of Merauke in West Irian, making the '
      + 'Apostolic Vicariate of Merauke its metropolitan see and the Apostolic Vicariate of '
      + 'Sukarnapura and the Apostolic Prefecture of Manokwari its suffragan dioceses: '
      + '"...Provinciam ecclesiasticam Meraukensem ita constituimus, ut Sede ipsa '
      + 'Meraukensi, antea vicariatu apostolico, tamquam metropolitana constet...". The '
      + 'province is what the argumentum states, so this is an erection under the John XXIII '
      + 'rule.',
  },
  'paul-vi|nakhornsavanensis|1967-02-09': {
    argumentum:
      'BANGKOKENSIS (NAKHORNSAVANENSIS) * DISTRACTIS NONNULLIS TERRITORIIS A SEDE '
      + 'BANGKOKENSI, NOVA QUAEDAM DIOECESIS CONDITUR, «NAKHORNSAVANENSIS» NOMINE.',
    note:
      'Detaches twelve civil circumscriptions from the Archdiocese of Bangkok and erects '
      + 'the new Diocese of Nakhon Sawan (Thailand), suffragan to Bangkok: "...ab '
      + 'archidioecesi Bangkokensi detrahimus, idque in dioecesis formam redigimus, quae '
      + 'Nakhornsavanensis appellabitur...".',
  },
  'paul-vi|carmonensis-soteropolitanae|1967-03-14': {
    argumentum:
      'LUANDENSIS (CARMONENSIS-SOTEROPOLITANAE) * DISTRACTIS QUIBUSDAM TERRITORIIS EX '
      + 'ARCHIDIOECESI LUANDENSI, NOVA EFFICITUR DIOECESIS, NOMINE '
      + '«CARMONENSIS-SOTEROPOLITANA».',
    note:
      'Detaches the civil districts of Uige and Zaire from the Archdiocese of Luanda and '
      + 'erects the new Diocese of Carmona e Sao Salvador (Angola): "...iisque novam '
      + 'dioecesim condimus, Carmonensem-Soteropolitanam appellandam...".',
  },
  'paul-vi|butuanensis|1967-03-20': {
    argumentum:
      'SURIGENSIS (BUTUANENSIS)* DETRACTIS QUIBUSDAM REGIONIBUS A DIOECESI SURIGENSI, ALIA '
      + 'DIOECESIS CONDITUR, NOMINE «BUTUANENSIS».',
    note:
      'Detaches the civil province of Agusan and Butuan City from the Diocese of Surigao '
      + 'and erects the new Diocese of Butuan (Philippines): "...ex eaque novam dioecesim '
      + 'condimus Butuanensem cognominandam...".',
  },
  'paul-vi|ihosiensis|1967-04-13': {
    argumentum:
      'FARAFANGANENSIS - ARCIS DELPHINI (IHOSIENSIS)* NONNULLIS DETRACTIS TERRITORIIS AB '
      + 'ECCLESIIS FARAFANGANENSI ET ARCIS DELPHINI, NOVA CONDITUR DIOECESIS, «IHOSIENSIS» '
      + 'NOMINE.',
    note:
      'Detaches the sub-prefectures of Ihosy, Ivohibe and Midongy-Sud from the Diocese of '
      + 'Farafangana and Betroka from the Diocese of Fort-Dauphin and erects the new Diocese '
      + 'of Ihosy (Madagascar), suffragan to Fianarantsoa: "...his territoriis novam '
      + 'dioecesim constituimus, quae Ihosiensis cognominabitur...".',
  },
  'paul-vi|kupangensis|1967-04-13': {
    argumentum:
      'ATAMBUENSIS (KUPANGENSIS)* NONNULLIS INSULIS A DIOECESI ATAMBUENSI DETRACTIS, NOVA '
      + 'DIOECESIS CONDITUR, «KUPANGENSIS» APPELLANDA.',
    note:
      'Detaches the regions of Timor Tengah and Kupang and the islands of Semau, Roti and '
      + 'Sawu from the Diocese of Atambua and erects the new Diocese of Kupang (Indonesia), '
      + 'suffragan to Ende: "...iisque novam dioecesim condimus, nomine Kupangensem...".',
  },
  'paul-vi|quicensis|1967-04-27': {
    argumentum:
      'SOLOLENSIS (QUICENSIS)* TERRITORIO DIOECESIS SOLOLENSIS DIVISO, NOVA QUAEDAM '
      + 'DIOECESIS «QUICENSIS» NOMINE CONDITUR; PRAETEREA AB ARCHIDIOECESI GUATIMALENSI '
      + 'REGIO CHIMALTENANGO SEPARATUR, QUOD PERPETUO DIOECESI SOLOLENSI ADDICITUR.',
    note:
      'Detaches the department of El Quiche from the Diocese of Solola and erects the new '
      + 'Diocese of Quiche (Guatemala): "...quo territorio dioecesim condimus Quicensem '
      + 'nomine.". PRAETEREA, as the secondary act, the department of Chimaltenango passes '
      + 'from the Archdiocese of Guatemala to Solola.',
  },
  'paul-vi|callaensis|1967-04-29': {
    argumentum:
      'LIMANAE (CALLAËNSIS)* DETRACTIS EX ARCHIDIOECESI LIMANA QUIBUSDAM TERRITORIIS, NOVA '
      + 'EFFICITUR DIOECESIS, NOMINE «CALLAËNSIS».',
    note:
      'Detaches the districts of Callao, Bellavista, La Punta and Carmen de la '
      + 'Legua-Reynoso and four islands from the Archdiocese of Lima and erects the new '
      + 'Diocese of Callao (Peru): "...iisque dioecesim condimus, Callaënsem '
      + 'appellandam...".',
  },
  'paul-vi|hasseletensis|1967-05-31': {
    argumentum:
      'LEODIENSIS (HASSELETENSIS)* IN BELGICA NATIONE NOVA DIOECESIS CONSTITUITUR, '
      + '«HASSELETENSIS» NOMINE.',
    note:
      'Detaches the civil province of Limburg from the Diocese of Liege and erects the new '
      + 'Diocese of Hasselt (Belgium), suffragan to Mechelen-Brussels; the canton of Landen '
      + 'passes from Liege to Mechelen-Brussels: "...qua dioecesim condimus, Hasseletensem '
      + 'appellandam...".',
  },
  'paul-vi|kurnoolensis|1967-06-12': {
    argumentum:
      'NELLORENSIS (KURNOOLENSIS) * E DIVISO TERRITORIO DIOECESIS NELLORENSIS DOVA '
      + 'DIOECESIS EFFICITUR «KURNOOLENSIS» APPELLANDA.',
    note:
      'Detaches the districts of Kurnool and Anantapur in Andhra Pradesh from the Diocese '
      + 'of Nellore and erects the new Diocese of Kurnool (India), entrusted to the secular '
      + 'clergy: "...novam dioecesim constituimus, a principe terrae urbe Kurnoolensem '
      + 'appellandam...". The heading prints "DOVA DIOECESIS", as quoted.',
  },
  'paul-vi|paksensis|1967-06-12': {
    argumentum:
      'PAKSENSIS* IN LAOTIANA REGIONE NOVUS VICARIATUS APOSTOLICUS CONDITUR, « PAKSENSIS » '
      + 'NOMINE.',
    note:
      'Divides the Apostolic Vicariate of Savannakhet (Laos) and, from the districts of '
      + 'Saravane, Vapikhamthong, Sedone, Champassak, Attopeu and Sithandone, erects the new '
      + 'Apostolic Vicariate of Pakse, entrusted to the Paris Foreign Missions: "...novus '
      + 'vicariatus condatur, nomine Paksensi...".',
  },
  'paul-vi|banmethuotensis|1967-06-22': {
    argumentum:
      'KONTUMENSIS-DALATENSIS (BANMETHUOTENSIS)* IN VIETNAMITA NATIONE NOVA DIOECESIS '
      + 'CONDITUR, «BANMETHUOTENSIS» NOMINE.',
    note:
      'Detaches the civil province of Darlac from the Diocese of Kontum and Quang Duc and '
      + 'Phuoc Long from the Diocese of Da Lat and erects the new Diocese of Ban Me Thuot '
      + '(Vietnam), suffragan to Hue: "...quibus territoriis novam dioecesim constituimus, '
      + 'Banmethuotensem nomine...".',
  },
  'paul-vi|antofagastensis|1967-06-28': {
    argumentum:
      'ANTOFAGASTENSIS* IN CHILENSI REPUBLICA NOVA CONSTITUITUR PROVINCIA ECCLESIASTICA, '
      + '«ANTOFAGASTENSIS» APPELLANDA.',
    note:
      'Erects the new ecclesiastical province of Antofagasta (Chile), separating '
      + 'Antofagasta from the province of La Serena and making it metropolitan, with the '
      + 'Diocese of Iquique and the Prelatures of Arica and Calama as suffragans: "...eamque '
      + 'novae provinciae ecclesiasticae caput constituimus...". The province is what the '
      + 'argumentum states, so this is an erection under the John XXIII rule.',
  },
  'paul-vi|gruardensis-et-aliarum|1967-07-13': {
    argumentum:
      'GRUARDENSIS ET ALIARUM* IN CANADIAE SEPTEMTRIONALIS REGIONE DUAE CONSTITUUNTUR '
      + 'PROVINCIAE ECCLESIASTICAE, NOMINE «GRUARDENSIS-MCLENNANPOLITANA» ET «KIVOTINA- '
      + 'LEPASANA».',
    note:
      'Erects two new ecclesiastical provinces in northern Canada, Grouard-McLennan (with '
      + 'Prince George, Mackenzie-Fort Smith and Whitehorse) and Keewatin-Le Pas (with '
      + 'Churchill, Moosonee and Labrador-Schefferville), turning the apostolic vicariates '
      + 'into metropolitan sees and dioceses: "...novam provinciam ecclesiasticam condimus, '
      + 'nomine Gruardensem - McLennanpolitanam...Condimus praeterea provinciam '
      + 'ecclesiasticam Kivotinam-Lepasanam...". The heading prints "KIVOTINA- LEPASANA" '
      + 'with the space, as quoted.',
  },
  'paul-vi|montereyensis-fresnensis|1967-10-06': {
    argumentum:
      'MONTEREYENSIS - FRESNENSIS* QUIBUSDAM DETRACTIS TERRITORIIS A DIOECESI '
      + 'MONTEREYENSI.FRESNENSI, NOVA DIOECESIS CONDITUR, NOMINE «MONTEREYENSIS IN '
      + 'CALIFORNIA». PRIORIS AUTEM DIOECESIS NOMEN ERIT DEINCEPS «FRESNENSIS».',
    note:
      'Detaches the counties of Santa Cruz, Monterey, San Benito and San Luis Obispo from '
      + 'the Diocese of Monterey-Fresno and erects the new Diocese of Monterey in '
      + 'California, suffragan to Los Angeles; the remaining diocese is renamed Fresno: '
      + '"...iisque novam dioecesim condimus, Montereyensem in California appellandam...". '
      + 'The heading prints "MONTEREYENSI.FRESNENSI", as quoted.',
  },
  'paul-vi|nakurensis|1968-01-11': {
    argumentum:
      'NAIROBIENSIS - ELDORETENSIS - KISUMUENSIS (NAKURENSIS)* QUIBUSDAM TERRITORIIS '
      + 'DETRACTIS AB ECCLESIIS NAIROBIENSI, ELDORETENSI, ATQUE KISUMUENSI, NOVA DIOECESIS '
      + 'CONSTITUITUR «NAKURENSIS» APPELLANDA.',
    note:
      'Detaches the Nakuru and Kericho districts from the Archdiocese of Nairobi and the '
      + 'Dioceses of Eldoret and Kisumu and erects the new Diocese of Nakuru (Kenya), '
      + 'entrusted to the Society of St Patrick and suffragan to Nairobi: "...eaque in novae '
      + 'dioecesis formam redigimus...Nakurensis appellandae...".',
  },
  'paul-vi|paranaviensis|1968-01-20': {
    argumentum:
      'MARINGAËNSIS (PARANAVIENSIS)* DISMEMBRATIS E MARINGAËNSI DIOECESI TERRITORIIS, NOVA '
      + 'CONDITUR DIOECESIS «PARANAVIENSIS» APPELLANDA.',
    note:
      'Detaches municipalities from the Diocese of Maringa and erects the new Diocese of '
      + 'Paranavai (Brazil), suffragan to Curitiba: the body separates the listed '
      + 'municipalities and makes the new see suffragan ("...Hanc novam dioecesim '
      + 'suffraganeam facimus metropolitanae Sedi Curitibensi...").',
  },
  'paul-vi|bonaerensis|1968-02-09': {
    argumentum:
      'BONAËRENSIS* EXARCHATUS APOSTOLICUS PRO FIDELIBUS RITUS BYZANTINI UCRAINORUM IN '
      + 'ARGENTINA CONDITUR',
    note:
      'Erects the Apostolic Exarchate for the Ukrainian faithful of the Byzantine rite in '
      + 'Argentina, with Andres Sapelak, until now their apostolic visitor, as exarch: '
      + '"...exarchatum apostolicum pro fidelibus ritus byzantini Ucrainorum in Argentina '
      + 'commorantibus condimus...". A circumscription for a rite, not a territory detached '
      + 'from another see.',
  },
  'paul-vi|itapevensis|1968-03-02': {
    argumentum:
      'SOROCABANAE ET ALIARUM (ITAPEVENSIS)* DETRACTIS QUIBUSDAM TERRITORIIS AB ECCLESIIS '
      + 'SOROCABANA, BOTUCATUENSI ET SANTOSENSI, ALIA CONSTITUITUR DIOECESIS, «ITAPEVENSIS» '
      + 'COGNOMINANDA.',
    note:
      'Detaches municipalities from the Diocese of Sorocaba, the Archdiocese of Botucatu '
      + 'and the Diocese of Santos and erects the new Diocese of Itapeva (Brazil), suffragan '
      + 'to Sao Paulo: "...quibus territoriis omnibus novam dioecesim condimus, Itapevensem '
      + 'cognominandam...".',
  },
  'paul-vi|miamiensis-s-augustini-mobiliensis-birminghamiensis-s-petri-in-florida-et-orlandensis|1968-03-02': {
    argumentum:
      'MIAMIENSIS - S. AUGUSTINI - MOBILIENSIS BIRMINGHAMIENSISS. PETRI IN FLORIDA ET '
      + 'ORLANDENSIS* QUIBUSDAM DISTRACTIS TERRITORIIS A DIOECESIBUS MIAMIENSI ET S. '
      + 'AUGUSTINI, DUO NOVAE CONDUNTUR DIOECESES «SANCTI PETRI IN FLORIDA» ET «ORLANDENSIS» '
      + 'APPELLANDAE; EADEM INSUPER ECCLESIA MIAMIENSIS IN ORDINEM METROPOLITANARUM '
      + 'EVEHITUR; TANDEM FINES DIOECESIUM S. AUGUSTINI ET MOBILIENSIS-BIRMINGHAMIENSIS '
      + 'MUTANTUR.',
    note:
      'Detaches eleven counties from the Dioceses of Miami and St Augustine and erects the '
      + 'new Diocese of St Petersburg, and thirteen more from the same two sees and erects '
      + 'the new Diocese of Orlando: "...ex iis autem undecim Comitatibus novam dioecesim '
      + 'condimus...Sancti Petri in Florida appellanda erit...alteram et distinctam erigimus '
      + 'dioecesim Orlandensem nuncupandam...". INSUPER, as the secondary acts, Miami is '
      + 'raised to a metropolitan see and ten counties pass from Mobile-Birmingham to St '
      + 'Augustine. The erection is what the argumentum leads with, so this is an erection '
      + 'under the John XXIII rule; the curation script proposed an elevation on the '
      + 'EVEHITUR of the second clause. The heading prints "BIRMINGHAMIENSISS. PETRI", as '
      + 'quoted.',
  },
  'paul-vi|lokossensis|1968-03-11': {
    argumentum:
      'COTONUENSIS (LOKOSSENSIS)* EX QUIBUSDAM TERRITORIIS AB ARCHIDIOECESI COTONUENSI '
      + 'DETRACTIS, NOVA CONDITUR DIOECESIS, «LOKOSSENSIS» APPELLANDA.',
    note:
      'Detaches the civil circumscription of Mono from the Archdiocese of Cotonou and '
      + 'erects the new Diocese of Lokossa (Dahomey), entrusted to the secular clergy: '
      + '"...ex eo novam dioecesim constituimus, Lokossensem ab urbe principe '
      + 'appellandam...".',
  },
  'paul-vi|maasinensis|1968-03-23': {
    argumentum:
      'PALENSIS (MAASINENSIS)* DETRACTIS QUIBUSDAM TERRITORIIS A DIOECESI PALENSI, NOVA '
      + 'CONDITUR DIOECESIS, «MAASINENSIS» APPELLANDA.',
    note:
      'Detaches the civil province of Southern Leyte from the Diocese of Palo and erects '
      + 'the new Diocese of Maasin (Philippines), suffragan to Cebu: "...His autem omnibus '
      + 'terris novam dioecesim condimus, Maasinensem cognominandam...".',
  },
  'paul-vi|masbatensis|1968-03-23': {
    argumentum:
      'SORSOGONENSIS (MASBATENSIS)* DISTRACTIS QUIBUSDAM TERRITORIIS E DIOECESI '
      + 'SORSOGONENSI, NOVA DIOECESIS CONDITUR, NOMINE «MASBATENSIS».',
    note:
      'Detaches the civil province of Masbate from the Diocese of Sorsogon and erects the '
      + 'new Diocese of Masbate (Philippines): "...eoque novam dioecesim condimus, '
      + 'Masbatensem appellandam...".',
  },
  'paul-vi|mananjariensis|1968-04-09': {
    argumentum:
      'FIANARANTSOAËNSIS - TAMATAVENSIS (MANANJARIENSIS) * DETRACTIS NONNULLIS TERRITORIIS '
      + 'AB ARCHIDIOECESI FIANARANTSOAËNSI ET A DIOECESI TAMATAVENSI, NOVA QUAEDAM DIOECESIS '
      + 'CONDITUR, «MANANJARIENSIS» APPELLANDA.',
    note:
      'Detaches the civil districts of Mananjary and Ifanadiana from the Archdiocese of '
      + 'Fianarantsoa and Nosy Varika from the Diocese of Tamatave and erects the new '
      + 'Diocese of Mananjary (Madagascar), suffragan to Fianarantsoa: "...eosque in novae '
      + 'dioecesis formam redigimus quae Mananjariensis appellabitur...".',
  },
  'paul-vi|sekadauensis|1968-04-09': {
    argumentum:
      'KETAPANGENSIS - PONTIANAKENSIS (SEKADAUENSIS)* DETRACTIS QUIBUSDAM TERRITORIIS AB '
      + 'ECCLESIIS KETAPANGENSI ET PONTIANAKENSI, NOVA PRAEFECTURA APOSTOLICA CONDITUR, '
      + 'NOMINE «SEKADAUENSIS».',
    note:
      'Detaches the part of the Sanggau district south of the Kapuas from the Diocese of '
      + 'Ketapang and the part of the Sekadau sub-district north of it from the Archdiocese '
      + 'of Pontianak and erects the new Apostolic Prefecture of Sekadau (Indonesia), '
      + 'entrusted to the Passionists: "...ambasque in praefecturae apostolicae formam '
      + 'redigimus, Sekadauensis appellandae...".',
  },
  'paul-vi|chuquibambillensis|1968-04-26': {
    argumentum:
      'ABANCAIENSIS (CHUQUIBAMBILLENSIS)* DETRACTIS QUIBUSDAM TERRITORIIS A DIOECESI '
      + 'ABANCAIENSI, NOVA PRAELATURA CONDITUR, «CHUQUIBAMBILLENSIS» APPELLANDA.',
    note:
      'Detaches the civil provinces of Grau, Antabamba and Cotabambas from the Diocese of '
      + 'Abancay and erects the new Prelature of Chuquibambilla (Peru), suffragan to Cuzco: '
      + '"...earumque territorio novam praelaturam condimus, Chuquibambillensem '
      + 'appellandam...".',
  },
  'paul-vi|claravallensis-in-brasilia|1968-05-11': {
    argumentum:
      'GUAXUPENSIS (CLARAVALLENSIS IN BRASILIA) * DISMEMBRATIS A GUAXUPENSI DIOECESI '
      + 'TERRITORIIS, NOVA CONDITUR ABBATIA NULLIUS, «CARAVALLENSIS IN BRASILIA» APPELLANDA.',
    note:
      'Detaches the municipalities of Claraval and Ibiraci from the Diocese of Guaxupe and '
      + 'erects the new secular Abbey Nullius of Claraval (Brazil), suffragan to Pouso '
      + 'Alegre: "...idemque territorium in novae Abbatiae nullius saecularis formam '
      + 'redigimus, Claravallensis in Brasilia appellandae...". The heading prints '
      + '"«CARAVALLENSIS IN BRASILIA»", as quoted.',
  },
  'paul-vi|balasorensis|1968-06-08': {
    argumentum:
      'CALCUTTENSIS (BALASORENSIS) * QUIBUSDAM DETRACTIS TERRITORIIS EX ARCHIDIOECESI '
      + 'CALCUTTENSI, NOVA CONSTI. TUITUR PRAEFECTURA APOSTOLICA, «BALASORENSIS» NOMINE',
    note:
      'Detaches the districts of Balasore, Mayurbhanj and Keonjhar from the Archdiocese of '
      + 'Calcutta and erects the new Apostolic Prefecture of Balasore (India), attached to '
      + 'the province of Ranchi and entrusted to the Vincentians: "...eandemque praefecturam '
      + 'apostolicam constituimus, ex urbe Balasore Balasorensem appellandam.". The heading '
      + 'prints "CONSTI. TUITUR", the verb broken in two, as quoted; it matched no idiom, so '
      + 'the curation script abstained.',
  },
  'paul-vi|manensis|1968-06-08': {
    argumentum:
      'DALOAËNSIS (MANENSIS)* DIVISA DIOECESI DALOAËNSIS, NOVA DIOECESIS CONSTITUITUR, '
      + '«MANENSIS» COGNOMINANDA.',
    note:
      'Detaches the civil province of Man from the Diocese of Daloa and erects the new '
      + 'Diocese of Man (Ivory Coast), suffragan to Abidjan: "...eamque in dioecesis formam '
      + 'redigimus, Manensem ab urbe principe cognominandam...".',
  },
  'paul-vi|saltensis-in-mexico|1968-06-10': {
    argumentum:
      'DURANGENSIS - MAZATLANENSIS (SALTENSIS IN MEXICO) * E NONNULLIS TERRITORIIS '
      + 'ECCLESIARUM DURANGENSIS ET MAZATLANENSIS NOVA CONSTITUITUR PRAELATURA, «SALTENSIS '
      + 'IN MEXICO» NOMINE.',
    note:
      'Detaches the municipality of Pueblo Nuevo from the Archdiocese of Durango and five '
      + 'municipalities and one parish from the Diocese of Mazatlan and erects the new '
      + 'Prelature of El Salto (Mexico): "...quibus omnibus terris novam praelaturam '
      + 'condimus, cuius erit nomen Saltensis in Mexico.".',
  },
  'paul-vi|bacabalensis|1968-06-22': {
    argumentum:
      'S. LUDOVICI IN MARAGNANO - S. IOSEPHI DE GRAJAU (BACABALENSIS) * DISTRACTIS '
      + 'QUIBUSDAM TERRITORIIS AB ARCHIDIOECESI S. LUDOVICI IN MARAGNANO ET A PRAELATURA S. '
      + 'IOSEPHI DE GRAJAU, NOVA CONDITUR DIOECESIS NOMINE «BACABALENSIS».',
    note:
      'Detaches municipalities from the Archdiocese of Sao Luis do Maranhao and '
      + 'Esperantinopolis from the Prelature of Sao Jose do Grajau and erects the new '
      + 'Diocese of Bacabal (Brazil): "...quibus omnibus terris novam condimus dioecesim '
      + 'Bacabalensem appellandam...".',
  },
  'paul-vi|azoguensis|1968-06-26': {
    argumentum:
      'CONCHENSIS IN AEQUATORE (AZOGUENSIS)* QUIBUSDAM DETRACTIS TERRITORIIS AB '
      + 'ARCHIDIOECESI CONCHENSI IN AEQUATORE, NOVA CONDITUR DIOECESIS, NOMINE «AZOGUENSIS».',
    note:
      'Detaches the civil province of Canar from the Archdiocese of Cuenca and erects the '
      + 'new Diocese of Azogues (Ecuador): "...ex eo novam dioecesim constituimus Azoguensem '
      + 'appellandam...".',
  },
  'paul-vi|lirensis|1968-07-12': {
    argumentum:
      'GULUENSIS (LIRENSIS)* DISTRACTIS QUIBUSDAM TERRITORIIS E DIOECESI GULUENSI, NOVA '
      + 'CONDITUR DIOECESIS, «LIRENSIS» NOMINE.',
    note:
      'Detaches the civil district of Lango from the Diocese of Gulu and erects the new '
      + 'Diocese of Lira (Uganda), suffragan to Kampala: "...eamque in novae dioecesis '
      + 'formam redigimus Lirensis nuncupandae...".',
  },
  'paul-vi|sagarensis|1968-07-29': {
    argumentum:
      'BHOPALENSIS (SAGARENSIS) * QUIBUSDAM DETRACTIS TERRITORIIS EX ARCHIDIOECESI '
      + 'BHOPALENSI, NOVUS CONDITUR EXARCHATUS APOSTOLICUS, NOMINE «SAGARENSIS».',
    note:
      'Detaches the civil districts of Sagar, Raisen and Vidisha from the Archdiocese of '
      + 'Bhopal and erects the new Apostolic Exarchate of Sagar of the Syro-Malabar rite '
      + '(India), entrusted to the Carmelites of Mary Immaculate: "...iisque exarchatum '
      + 'apostolicum ritus Malabarensis constituimus, nomine Sagarensem...".',
  },
  'paul-vi|satnensis|1968-07-29': {
    argumentum:
      'JABALPURENSIS (SATNENSIS) * DETRACTIS QUIBUSDAM TERRITORIIS E DIOECESI '
      + 'JABALPURENSI, NOVUS EXARCHATUS APOSTOLICUS CONDITUR, NOMINE «SATNENSIS».',
    note:
      'Detaches the civil districts of Tikamgarh, Chhatarpur, Panna, Satna, Rewa and Sidhi '
      + 'from the Diocese of Jabalpur and erects the new Apostolic Exarchate of Satna of the '
      + 'Syro-Malabar rite (India), entrusted to the Vincentian Congregation: "...atque iis '
      + 'exarchatum apostolicum ritus Malabarensis condimus...".',
  },
  'paul-vi|ujjaiensis|1968-07-29': {
    argumentum:
      'INDORENSIS (UJJAIENSIS) * DETRACTIS QUIBUSDAM TERRITORIIS A DIOECESI INDORENSI, '
      + 'NOVUS EXARCHATUS APOSTOLICUS CONDITUR, NOMINE «UJJAIENSIS».',
    note:
      'Detaches the civil districts of Ujjain, Shajapur and Rajgarh from the Diocese of '
      + 'Indore and erects the new Apostolic Exarchate of Ujjain of the Syro-Malabar rite '
      + '(India), entrusted to the Missionary Society of St Thomas: "...iisque exarchatum '
      + 'apostolicum ritus Malabarensis condimus...".',
  },
  'paul-vi|kibugensis|1968-09-05': {
    argumentum:
      'KABGAYENSIS (KIBUNGENSIS) * DETRACTIS QUIBUSDAM TERRITORIIS AB ARCHIDIOECESI '
      + 'KABGAYENSI, NOVA DIOECESIS CONDITUR, «KIBUNGENSIS» APPELLANDA.',
    note:
      'Detaches the eastern part of the Archdiocese of Kabgayi, along the prefectures of '
      + 'Kibungo and Kigali, and erects the new Diocese of Kibungo (Rwanda), suffragan to '
      + 'Kabgayi: "...partem orientalem territorii distrahimus atque in novae dioecesis '
      + 'formam redigimus...".',
  },
  'paul-vi|battambangensis|1968-09-26': {
    argumentum:
      'PHNOM PENH (BATTAMBANGENSIS)* DISTRACTIS NONNULLIS TERRITORIIS A VICARIATU '
      + 'APOSTOLICO DE PHNOM PENH, NOVA QUAEDAM APOSTOLICA PRAEFECTURA CONDITUR, '
      + '«BATTAMBANGENSIS» NOMINE.',
    note:
      'Detaches the civil districts of Battambang, Siem Reap, Kompong Thom-Preah Vihear, '
      + 'Kompong Chhnang and Pursat from the Apostolic Vicariate of Phnom Penh and erects '
      + 'the new Apostolic Prefecture of Battambang (Cambodia), entrusted to the Cambodian '
      + 'clergy: "...iisque novam praefecturam apostolicam constituimus, quam '
      + 'Battambangensem appellari iubemus...".',
  },
  'paul-vi|chomponchamensis|1968-09-26': {
    argumentum:
      'PHNOM PENH (CHOMPONCHAMENSIS) * QUIBUSDAM DETRACTIS TERRITORIIS A VICARIATU '
      + 'APOSTOLICO NOMINE «PHNOM PENH», NOVA CONDITUR PRAEFECTURA APOSTOLICA '
      + '«CHOMPONCHAMENSIS» APPELLANDA.',
    note:
      'Detaches the civil districts of Kompong Cham, Prey Veng, Svay Rieng, Kratie, '
      + 'Mondulkiri, Ratanakiri and Stung Treng from the Apostolic Vicariate of Phnom Penh '
      + 'and erects the new Apostolic Prefecture of Kompong Cham (Cambodia): "...iisque '
      + 'praefecturam apostolicam constituimus omnibus datis iuribus...".',
  },
  'paul-vi|diebuguensis|1968-10-18': {
    argumentum:
      'BOBODIULASSENSIS (DIEBUGUENSIS) * DETRACTIS QUIBUSDAM TERRITORIIS E DIOECESI '
      + 'BOBODIULASSENSI, NOVA CONSTITUITUR DIOECESIS, «DIEBUGUENSIS» APPELLANDA.',
    note:
      'Detaches the civil regions of Diebougou and Gaoua from the Diocese of '
      + 'Bobo-Dioulasso and erects the new Diocese of Diebougou (Upper Volta), entrusted to '
      + 'the secular clergy: "...ex iisque novam dioecesim constituimus, Diebuguensem '
      + 'appellandam...".',
  },
  'paul-vi|labacensis|1968-11-22': {
    argumentum:
      'LABACENSIS * IN IUGOSLAVIA NOVA PROVINCIA ECCLESIASTICA CONSTITUITUR, CUIUS SEDES '
      + 'METROPOLITANA LABACENSIS ECCLESIA ERIT.',
    note:
      'Erects the new ecclesiastical province of Ljubljana (Slovenia), with Ljubljana as '
      + 'metropolitan see and Maribor-Lavant, until now immediately subject to the Holy See, '
      + 'as suffragan: "...provinciam ecclesiasticam, Labacensem nomine, in Sloveniae '
      + 'regione constituimus...".',
  },
  'paul-vi|campitemplensis|1968-12-08': {
    argumentum:
      'OENIPONTANAE (CAMPITEMPLENSIS) * DETRACTA PARTE A DIOECESI OENIPONTANA, NOVA '
      + 'DIOECESIS CONDITUR, QUAE «CAMPITEMPLENSIS» NOMINABITUR.',
    note:
      'Detaches the civil region of Vorarlberg, less the Abbey of Mehrerau (Maris Stella), '
      + 'from the Diocese of Innsbruck and erects the new Diocese of Feldkirch (Austria), '
      + 'suffragan to Salzburg: "...eoque novam dioecesim condimus, Campitemplensem '
      + 'appellandam...".',
  },
  'paul-vi|munhallensis-ruthenorum|1969-02-21': {
    argumentum:
      'PITTSBURGENSIS RUTHENORUM (MUNHALLENSIS RUTHENORUM) * DIVISA EPARCHIA PITTSBURGENSI '
      + 'RUTHENORUM, ATQUE PARMENSI CONDITA, NOVA PROVINCIA ECCLESIASTICA CONSTITUITUR, '
      + '«MUNHALLENSIS» COGNOMINANDA.',
    note:
      'Erects the new ecclesiastical province of Munhall for the Ruthenians (United '
      + 'States), formed of the Eparchies of Pittsburgh (raised to metropolitan rank under '
      + 'the new name Munhall), Passaic and Parma: "...Eparchiis Pittsburgensi, Passaicensi '
      + 'atque Parmensi provinciam ecclesiasticam efficimus...ut Ecclesia Pittsburgensis ad '
      + 'gradum atque dignitatem metropolitanae Sedis evehatur, novo indito nomine '
      + 'Munhallensi Ruthenorum...". The province is what the argumentum states, so this is '
      + 'an erection under the John XXIII rule.',
  },
  'paul-vi|parmensis-ruthenorum|1969-02-21': {
    argumentum:
      'PITTSBURGENSIS RUTHENORUM (PARMENSIS RUTHENORUM) * DETRACTIS QUIBUSDAM TERRITORIIS '
      + 'AB EPARCHIA PIUSBURGENSI, NOVA QUAEDAM EPARCHIA CONSTITUITUR, «PARMENSIS '
      + 'RUTHENORUM» COGNOMINANDA.',
    note:
      'Divides the Eparchy of Pittsburgh of the Ruthenians and erects the new Eparchy of '
      + 'Parma (United States): "...Eparchiam Pittsburgensem Ruthenorum in duas '
      + 'circumscriptiones dividimus, seu eparchias, quarum sit alterius Sedes in urbe '
      + 'Pittsburgh, alterius vero in urbe Parma.". The heading prints "PIUSBURGENSI", as '
      + 'quoted.',
  },
  'paul-vi|barranquillensis|1969-04-25': {
    argumentum:
      'BARRANQUILLENSIS * NOVA PROVINCIA ECCLESIASTICA CONDITUR, «BARRANQUILLENSIS» '
      + 'NOMINE, CUIUS ERIT METROPOLITANA SEDES IPSA BARRANQUILLENSIS.',
    note:
      'Erects the new ecclesiastical province of Barranquilla (Colombia), withdrawing '
      + 'Barranquilla from the province of Cartagena and raising it to a metropolitan see, '
      + 'with Santa Marta and the Diocese of Valledupar (erected the same day) as '
      + 'suffragans: "...Barranquillensem dioecesim...ad gradum et dignitatem Sedis '
      + 'metropolitanae evehimus...". The province is what the argumentum leads with, so '
      + 'this is an erection under the John XXIII rule.',
  },
  'paul-vi|maganguensis|1969-04-25': {
    argumentum:
      'CARTHAGINENSIS IN COLUMBIA - SANCTI GEORGII (MAGANGUËNSIS)* QUIBUSDAM DETRACTIS '
      + 'TERRITORIIS AB ARCHIDIOECCSI CARTHAGINENSI IN COLUMBIA ET AB APOSTOLICO VICARIATU '
      + 'SANCTI GEORGII, NOVA DIOECESIS CONDITUR, NOMINE «MAGANGUËNSIS».',
    note:
      'Detaches seven municipalities from the Archdiocese of Cartagena and six from the '
      + 'Apostolic Vicariate of San Jorge and erects the new Diocese of Magangue (Colombia): '
      + '"...iisque dioecesim condimus Maganguënsem appellandam...". The heading prints '
      + '"ARCHIDIOECCSI", as quoted.',
  },
  'paul-vi|malaibalaiensis|1969-04-25': {
    argumentum:
      'CAGAYANAE (MALAIBALAIENSIS) * DETRACTIS QUIBUSDAM TERRITORIIS AB ARCHIDIOECESI '
      + 'CAGAYANA, NOVA CONDITUR PRAELATURA, NOMINE «MALAIBALAIENSIS».',
    note:
      'Detaches the civil province of Bukidnon from the Archdiocese of Cagayan de Oro and '
      + 'erects the new Prelature of Malaybalay (Philippines), suffragan to Cagayan de Oro: '
      + '"...eoque novam praelaturam condimus, Malaibalaiensem appellandam...".',
  },
  'paul-vi|monteriensis-s-georgii|1969-04-25': {
    argumentum:
      'MONTERIENSIS - S. GEORGII (SINUENSIS SUPERIORIS)* DETRACTIS QUIBUSDAM TERRITORIIS '
      + 'AB ECCLESIIS MONTERIENSI ET S. GEORGII, NOVA PRAELATURA CONDITUR, «SINUENSIS '
      + 'SUPERIORIS» COGNOMINANDA.',
    note:
      'Detaches the municipality of Tierralta from the Diocese of Monteria and territory '
      + 'from the Apostolic Vicariate of San Jorge and erects the new Prelature of Alto Sinu '
      + '(Colombia), seated at Montelibano: "...His autem territoriis novam praelaturam '
      + 'constituimus, Sinuensis Superioris appellatione...".',
  },
  'paul-vi|sincelejensis|1969-04-25': {
    argumentum:
      'CARTHAGINENSIS IN COLUMBIA - SANCTI GEORGII (SINCELEJENSIS)* DETRACTIS QUIBUSDAM '
      + 'TERRITORIIS AB ARCHIDIOECESI CARTHAGINENSI IN COLUMBIA ET A VICARIATU APOSTOLICO '
      + 'SANCTI GEORGII, NOVA CONDITUR DIOECESIS, «SINCELEJENSIS» APPELLANDA.',
    note:
      'Detaches eleven municipalities from the Archdiocese of Cartagena and others from '
      + 'the Apostolic Vicariate of San Jorge and erects the new Diocese of Sincelejo '
      + '(Colombia): "...quibus omnibus distractis territoriis novam condimus dioecesim '
      + 'Sincelejensem appellandam...".',
  },
  'paul-vi|escuintlensis|1969-05-09': {
    argumentum:
      'GUATIMALENSIS (ESCUINTLENSIS)* QUODAM SEPARATO TERRITORIO AB ARCHIDIOECESI '
      + 'GUATIMALENSI, NOVA CONDITUR PRAELATURA, NOMINE «ESCUINTLENSIS».',
    note:
      'Detaches the department of Escuintla from the Archdiocese of Guatemala and erects '
      + 'the new Prelature of Escuintla, suffragan to Guatemala: "...eoque novam praelaturam '
      + 'condimus, Escuintlensem appellandam...".',
  },
  'paul-vi|agatsensis|1969-05-29': {
    argumentum:
      'MERAUKENSIS (AGATSENSIS)* DETRACTIS QUIBUSDAM TERRITORIIS AB ECCLESIA MERAUKENSI, '
      + 'NOVA DIOECESIS « AGATSENSIS » CONDITUR.',
    note:
      'Detaches the Asmat territory, five civil districts, from the Archdiocese of Merauke '
      + 'and erects the new Diocese of Agats (West Irian), suffragan to Merauke: "...atque '
      + 'in novae dioecesis formam redigimus, Agatsensis nomine...".',
  },
  'paul-vi|andongensis|1969-05-29': {
    argumentum:
      'TAEGUENSIS - WONIUENSIS (ANDONGENSIS)* DETRACTIS QUIBUSDAM TERRITORIIS AB ECCLESIIS '
      + 'TAEGUENSI ATQUE WONIUENSI, ALIA DIOECESIS EFFICITUR, CUI NOMEN ERIT « ANDONGENSIS '
      + '».',
    note:
      'Detaches eleven civil circumscriptions from the Archdiocese of Taegu and the '
      + 'Diocese of Wonju and erects the new Diocese of Andong (Korea), suffragan to Taegu: '
      + '"...in novaeque dioecesis formam redigimus, Andongensis appellandae...".',
  },
  'paul-vi|fortjohnstonensis|1969-05-29': {
    argumentum:
      'ZOMBAËNSIS (FORTJOHNSTONENSIS)* DETRACTIS QUIBUSDAM TERRITORIIS A DIOECESI '
      + 'ZOMBAËNSI, NOVA CONDITUR PRAEFECTURA APOSTOLICA, NOMINE «FORTJOHNSTONENSIS».',
    note:
      'Detaches the civil district of Fort Johnston and most of Kasupe from the Diocese of '
      + 'Zomba and erects the new Apostolic Prefecture of Fort Johnston (Malawi): "...iisque '
      + 'praefecturam apostolicam constituimus, FortJohnstonensem appellandam.".',
  },
  'paul-vi|machakosensis|1969-05-29': {
    argumentum:
      'NAIROBIENSIS (MACHAKOSENSIS) * IN KENIAE TERRITORIO NOVA QUAEDAM DIOECESIS '
      + 'CONDITUR, « MACHAKOSENSIS » NOMINE.',
    note:
      'Detaches the civil district of Machakos from the Archdiocese of Nairobi and erects '
      + 'the new Diocese of Machakos (Kenya), suffragan to Nairobi and entrusted to the '
      + 'secular clergy: "...ex eoque novam dioecesim condimus...Machakosensem '
      + 'appellandam...".',
  },
  'paul-vi|oyemensis|1969-05-29': {
    argumentum:
      'LIBEROPOLITANAE (OYEMENSIS)* DETRACTIS QUIBUSDAM TERRITORIIS AB ARCHIDIOECESI '
      + 'LIBEROPOLITANA, NOVA CONDITUR DIOECESIS, «OYEMENSIS» APPELLANDA',
    note:
      'Detaches the civil districts of Oyem and Makokou from the Archdiocese of Libreville '
      + 'and erects the new Diocese of Oyem (Gabon), suffragan to Libreville: "...in novae '
      + 'dioecesis formam redigimus, Oyemensis nuncupandae...".',
  },
  'paul-vi|osakaensis|1969-06-24': {
    argumentum: 'OSAKAËNSIS * PROVINCIA ECCLESIASTICA OSAKAËNSIS CONSTITUITUR.',
    note:
      'Erects the new ecclesiastical province of Osaka (Japan), making Osaka, until now '
      + 'suffragan to Tokyo, a metropolitan see with Hiroshima, Kyoto, Nagoya and Takamatsu '
      + 'as suffragans: "...In Iaponia novam provinciam ecclesiasticam constituimus, cuius '
      + 'Osakaënsis Ecclesia...sit metropolitana...".',
  },
  'paul-vi|suratthanensis|1969-06-26': {
    argumentum:
      'RATCHABURENSIS (SURATTHANENSIS)* DIVISA DIOECESI RATCHABURENSI, NOVA DIOECESIS '
      + 'CONSTITUITUR, «SURATTHANENSIS» COGNOMINANDA.',
    note:
      'Detaches fifteen civil districts of southern Thailand from the Diocese of '
      + 'Ratchaburi and erects the new Diocese of Surat Thani, suffragan to Bangkok: '
      + '"...quibus omnibus novam erigimus dioecesim Suratthanensem cognominandam...".',
  },
  'paul-vi|phoenicensis|1969-06-28': {
    argumentum:
      'GALLUPIENSIS - TUCSONENSIS (PHOENICENSIS) * NONNULLIS TERRITORIIS AB ECCLESIIS '
      + 'GALLUPIENSI ATQUE TUCSONENSI SEPARATIS, NOVA QUAEDAM DIOECESIS CONDITUR, QUAE '
      + '«PHOENICENSIS» COGNOMINABITUR.',
    note:
      'Detaches Mohave and Yavapai counties and part of Coconino from the Diocese of '
      + 'Gallup, and Maricopa county and part of Pinal from the Diocese of Tucson, and '
      + 'erects the new Diocese of Phoenix (Arizona), suffragan to Santa Fe: "...His ergo '
      + 'terris novam dioecesim condimus, Phoenicensem cognominandam...".',
  },
  'paul-vi|margaritensis|1969-07-18': {
    argumentum:
      'CUMANENSIS (MARGARITENSIS) * DETRACTIS QUIBUSDAM A DIOECESI CUMANENSI PARTIBUS, '
      + 'NOVA DIOECESIS CONDITUR, «MARGARITENSIS» NOMINE.',
    note:
      'Detaches the state of Nueva Esparta from the Diocese of Cumana and erects the new '
      + 'Diocese of Margarita (Venezuela): "...eaque novam dioecesim condimus, Margaritensem '
      + 'appellandam...".',
  },
  'paul-vi|fluminensis-seniensis|1969-07-27': {
    argumentum:
      'FLUMINENSIS - SENIENSIS * NOVA IN IUGOSLAVIA CONSTITUITUR PROVINCIA ECCLESIASTICA, '
      + 'NOMINE «FLUMINENSIS-SENIENSIS».',
    note:
      'Erects the new ecclesiastical province of Rijeka-Senj (Yugoslavia): unites Modrus '
      + '(by extinctive union) and Senj (aeque principaliter) with the Diocese of Rijeka, '
      + 'renamed Rijeka-Senj and raised to a metropolitan see: "...Dioecesim Modrussensem '
      + 'unione exstinctiva et dioecesim Seniensem unione aeque principali cum dioecesi '
      + 'Fluminensi coniungimus...eamque ad gradum metropolitanae archiepiscopalis Ecclesiae '
      + 'attollimus...". The argumentum names only the province constituted and governs the '
      + 'table (Ruling 9); the union and elevation are the body of the act.',
  },
  'paul-vi|cafayatensis|1969-09-08': {
    argumentum:
      'SALTENSIS - TUCUMANENSIS - CATAMARCENSIS (CAFAYATENSIS) * QUIBUSDAM DISTRACTIS '
      + 'TERRITORIIS AB ARCHIDIOECESIBUS SALTENSI ET TUCUMANENSI AC DIOECESI CATAMARCENSI, '
      + 'NOVA CONDITUR PRAELATURA, «CAFAYATENSIS» APPELLANDA.',
    note:
      'Detaches parishes from the Archdioceses of Salta and Tucuman and the Diocese of '
      + 'Catamarca and erects the new Prelature of Cafayate (Argentina): "...novamque his '
      + 'praelaturam constituimus Cafayatensem appellandam...".',
  },
  'paul-vi|humahuacensis|1969-09-08': {
    argumentum:
      'JUJUYENSIS (HUMAHUACENSIS) * QUIBUSDAM TERRITORIIS DETRACTIS A DIOECESI JUJUYENSI, '
      + 'NOVA CONDITUR PRAELATURA, «HUMAHUACENSIS» APPELLANDA.',
    note:
      'Detaches the departments of Humahuaca, Cochinoca, Rinconada, Santa Catalina, Yavi '
      + 'and Susques from the Diocese of Jujuy and erects the new Prelature of Humahuaca '
      + '(Argentina): "...novam condimus praelaturam, Humahuacensem appellandam...".',
  },
  'paul-vi|sekondiensis-takoradiensis|1969-11-20': {
    argumentum:
      'LITORIS CAPITIS (SEKONDIENSIS-TAKORADIENSIS) * DETRACTA CIVILI REGIONE «WESTERN '
      + 'REGION» A B ARCHIDIOECESI LITORIS CAPITIS, NOVA QUAEDAM DIOECESIS CONDITUR, '
      + '«SEKONDIENSIS-TAKORADIENSIS» NOMINE.',
    note:
      'Detaches the Western Region from the Archdiocese of Cape Coast and erects the new '
      + 'Diocese of Sekondi-Takoradi (Ghana), suffragan to Cape Coast: "...eamque in '
      + 'dioecesis formam redigimus, Sekondiensis- Takoradiensis appellandae...". The '
      + 'heading prints "A B ARCHIDIOECESI", as quoted.',
  },
  'paul-vi|ilaganensis|1970-01-31': {
    argumentum:
      'TUGUEGARAOANAE-INFANTENSIS (ILAGANENSIS)* DETRACTO TERRITORIO PROVINCIAE «ISABELLA» '
      + 'AB ECCLESIIS TUGUEGARAOANA INFANTENSI, IN INSULIS PHILIPPINIS, NOVA CONDITUR '
      + 'DIOECESIS, «ILAGANENSIS» NOMINE.',
    note:
      'Detaches the province of Isabela from the Diocese of Tuguegarao and the Prelature '
      + 'of Infanta and erects the new Diocese of Ilagan (Philippines), suffragan to Nueva '
      + 'Segovia: "...ac novam dioecesim condimus, Ilaganensem appellandam...".',
  },
  'paul-vi|bafussamensis|1970-02-05': {
    argumentum:
      'NKONGSAMBENSIS (BAFUSSAMENSIS)* QUIBUSDAM DETRACTIS TERRITORIIS A DIOECESI '
      + 'NKONGSAMBENSI, IN CAMMARUNIA, NOVA ALIA CONDITUR, NOMINE «BAFUSSAMENSIS».',
    note:
      'Detaches the civil districts of Bamoun, Mifi, Baboutos, Menoua and Nde from the '
      + 'Diocese of Nkongsamba and erects the new Diocese of Bafoussam (Cameroon), suffragan '
      + 'to Yaounde: "...iisque dioecesim condimus Bafussamensem nomine...".',
  },
  'paul-vi|guairiensis|1970-04-15': {
    argumentum:
      'CARACENSIS (GUAIRIENSIS)* DETRACTO QUODAM TERRITORIO AB ARCHIDIOECESI CARACENSI, '
      + 'NOVA DIOECESIS CONDITUR «GUAIRIENSIS» NOMINE.',
    note:
      'Detaches the department of Vargas from the Archdiocese of Caracas and erects the '
      + 'new Diocese of La Guaira (Venezuela): "...eaque novam dioecesim condimus '
      + 'Guairiensem cognominandam...".',
  },
  'paul-vi|chetumaliensis|1970-05-23': {
    argumentum:
      'YUCATANENSIS-CAMPECORENSIS (CHETUMALIENSIS)* DETRACTO AB ECCLESIIS YUCATANENSI ET '
      + 'CAMPECORENSI TERRITORIO QUINTANA ROO, NOVA PRAELATURA EFFICITUR, QUAE '
      + '«CHETUMALIENSIS» COGNOMINABITUR.',
    note:
      'Detaches the territory of Quintana Roo from the Archdiocese of Yucatan and the '
      + 'Diocese of Campeche and erects the new Prelature of Chetumal (Mexico): "...novam ex '
      + 'eo Praelaturam condimus, ab urbe Chetumal Chetumaliensem cognominandam...".',
  },
  'paul-vi|benguelensis|1970-06-06': {
    argumentum:
      'NOVAE LISBONAE (BENGUELENSIS) * DETRACTIS QUIBUSDAM TERRITORIIS E DIOECESI NOVAE '
      + 'LISBONAE, NOVA DIOECESIS CONDITUR «BENGUELENSIS» APPELLANDA.',
    note:
      'Detaches the civil district of Benguela from the Diocese of Nova Lisboa and erects '
      + 'the new Diocese of Benguela (Angola): "...eoque novam dioecesim condimus '
      + 'Benguelensem appellandam...".',
  },
  'paul-vi|davaensis|1970-06-29': {
    argumentum:
      'CAGAYANAE (DAVAËNSIS) * A PROVINCIA ECCLESIASTICA CAGAYANA QUIBUSDAM SEPARATIS '
      + 'TERRITORIIS NOVA CONSTITUITUR PROVINCIA ECCLESIASTICA, NOMINE «DAVAËNSI».',
    note:
      'Erects the new ecclesiastical province of Davao (Philippines), withdrawing the '
      + 'Diocese of Davao and the Prelatures of Cotabato, Marbel and Tagum from the province '
      + 'of Cagayan de Oro, with Davao as metropolitan see: "...iisque provinciam '
      + 'ecclesiasticam Davaënsem constituimus, quae Sede Davaënsi ipsa tamquam '
      + 'metropolitana constabit...".',
  },
  'paul-vi|londrinensis|1970-10-31': {
    argumentum:
      'CURITIBENSIS (LONDRINENSIS) * DIVISA PROVINCIA ECCLESIASTICA CURITIBENSI, NOVA ALIA '
      + 'CONSTITUITUR, NOMINE «LONDRINENSIS».',
    note:
      'Erects the new ecclesiastical province of Londrina (Brazil), withdrawing Londrina, '
      + 'Apucarana, Campo Mourao, Jacarezinho, Maringa and Paranavai from the province of '
      + 'Curitiba, with Londrina as metropolitan see: "...iisque novam provinciam '
      + 'ecclesiasticam condimus, quae Ecclesia Londrinensi constabit tamquam '
      + 'metropolitana...".',
  },
  'paul-vi|kenemaensis|1970-11-11': {
    argumentum:
      'LIBERAE URBIS ET BOËNSIS (KENEMAËNSIS)* E TERRITORIO CIRCUMSCRIPTIONIS '
      + 'ECCLESIASTICAE LIBERAE URBIS ET BOËNSIS NOVA DIOECESIS CONDITUR, QUAE «KENEMAËNSIS» '
      + 'COGNOMINABITUR.',
    note:
      'Detaches the Eastern Province of Sierra Leone from the circumscription of Freetown '
      + 'and Bo and erects the new Diocese of Kenema, suffragan to Freetown and Bo, made '
      + 'metropolitan the same day: "...novam dioecesim constituimus, Kenemaënsem, ab urbe '
      + 'principe appellandam...".',
  },
  'paul-vi|kalamazuensis-et-gaylordensis|1970-12-19': {
    argumentum:
      'DETROITENSIS ET ALIARUM (KALAMAZUENSIS ET GAYLORDENSIS)* DIOECESIUM LANSINGENSIS, '
      + 'GRANDORMENSIS, SAGINAVENSIS, ATQUE ARCHIDIOECESIS DETROITENSIS FINES IMMUTANTUR; EX '
      + 'IIS PRAETEREA DUAE NOVAE DIOECESES CONSTITUUNTUR, «KALAMAZUENSIS» ET «GAYLORDENSIS» '
      + 'NOMINE.',
    note:
      'Redraws the boundaries of the Archdiocese of Detroit and the Dioceses of Lansing, '
      + 'Grand Rapids and Saginaw and, from the counties so detached, erects two new '
      + 'dioceses, Kalamazoo (nine counties) and Gaylord (twenty-one), suffragan to Detroit: '
      + '"...novam dioecesim condimus Kalamazuensem cognominandam...novam aliam dioecesim '
      + 'constituimus, Gaylordensem appellandam...". The argumentum leads with the boundary '
      + 'changes and introduces the erections with PRAETEREA, but the changes are the '
      + 'vehicle of the erections (EX IIS...CONSTITUUNTUR), the only act here this registry '
      + 'mints a term for: filed as an erection on that reading, as the Pius XII '
      + 'Catamarcensis-Saltensis row files a dismemberment that serves a union as the union.',
  },
  'paul-vi|iliganensis|1971-02-17': {
    argumentum:
      'OZAMISANAE (ILIGANENSIS)* DETRACTIS QUIBUSDAM TERRITORIES A PRAELATURA OZAMISANA, '
      + 'NOVA PRAELATURA CONDITUR, «ILIGANENSIS» NOMINE EADEM PRAETEREA OZAMISANA PRAELATURA '
      + 'AD GRADUM ET DIGNITATEM DIOECESIS EVEHITUR.',
    note:
      'Detaches the provinces of Lanao del Norte and Lanao del Sur from the Prelature of '
      + 'Ozamis and erects the new Prelature of Iligan (Philippines), suffragan to Cagayan '
      + 'de Oro: "...quo novam praelaturam condimus Iliganensem appellandam.". PRAETEREA, as '
      + 'the secondary act, the reduced Prelature of Ozamis is raised to a diocese. The '
      + 'erection is what the argumentum leads with, so this is an erection under the John '
      + 'XXIII rule; the curation script proposed an elevation on the EVEHITUR of the second '
      + 'clause. The heading prints "TERRITORIES", as quoted.',
  },
  'paul-vi|manoensis|1971-04-25': {
    argumentum:
      'KONGOLOËNSIS ET ALIARUM (MANOËNSIS)* DIVISIS DIOECESIBUS KONGOLOËNSI, '
      + 'BALDUINOPOLITANA ET KILWAËNSI, NOVA DIOECESIS CONSTITUITUR «MANOËNSIS» '
      + 'COGNOMINANDA.',
    note:
      'Detaches the territories of Manono and Malemba-Nkulu from the Dioceses of Kongolo, '
      + 'Baudouinville and Kilwa and erects the new Diocese of Manono (Congo), suffragan to '
      + 'Lubumbashi: "...quibus omnibus novam constituimus dioecesim Manoënsem '
      + 'cognominandam...".',
  },
  'paul-vi|ereximensis-crucis-altae-rivograndensem|1971-05-27': {
    argumentum:
      'PASSOFUNDENSIS ET ALIARUM (EREXIMENSIS-CRUCIS ALTAE-RIVOGRANDENSIS)* DETRACTIS '
      + 'QUIBUSDAM TERRITORIIS AB ECCLESIIS PASSOFUNDENSI, S. MARIAE ET PELOTENSI, NOVAE '
      + 'DIOECESES EREXIMENSIS, CRUCIS ALTAE ET RIVOGRANDENSIS CONSTITUUNTUR.',
    note:
      'Detaches municipalities from the Diocese of Passo Fundo, the Diocese of Santa Maria '
      + 'and the Diocese of Pelotas and erects three new dioceses, Erexim, Cruz Alta and Rio '
      + 'Grande (Brazil), suffragan to Porto Alegre: "...quibus terris novam dioecesim '
      + 'condimus Ereximensem appellandam...tertiam dioecesim constituimus, Rivograndensem '
      + 'cognominandam...".',
  },
  'paul-vi|daltonganiensis|1971-06-05': {
    argumentum:
      'RANCHIENSIS (DALTONGANIENSIS)* AB ARCHIDIOECESI RANCHIENSI QUIBUSDAM DETRACTIS '
      + 'TERRITORIIS DIOECESIS CONDITUR, NOMINE «DALTONGANIENSIS».',
    note:
      'Detaches the civil districts of Hazaribagh and Palamau from the Archdiocese of '
      + 'Ranchi and erects the new Diocese of Daltonganj (India), suffragan to Ranchi: '
      + '"...iisque novam dioecesim fundamus, Daltonganiensem appellandam...".',
  },
  'paul-vi|cheiudoensis|1971-06-28': {
    argumentum:
      'KWANGIUENSIS (CHEITTDOENSIS)* QUIBUSDAM DETRACTIS TERRITORIIS AB ARCHIDIOECESI '
      + 'KWANGIUENSI NOVA PRAEFECTURA APOSTOLICA CONSTITUITUR, NOMINE «CHEIUDOENSIS».',
    note:
      'Detaches the island of Cheju-do from the Archdiocese of Kwangju and erects the new '
      + 'Apostolic Prefecture of Cheju (Korea), entrusted to the Columban Fathers: "...eoque '
      + 'praefecturam apostolicam constituimus, Cheiudoensem appellandam...". The heading '
      + 'prints "CHEITTDOENSIS" in the parenthesis, as quoted.',
  },
  'paul-vi|rustenburgensis|1971-06-28': {
    argumentum:
      'PRAETORIENSIS (RUSTENBURGENSIS)* IN AFRICA MERIDIONALI NOVA PRAEFECTURA CONDITUR, '
      + '«RUSTENBURGENSIS» NOMINE.',
    note:
      'Detaches parts of the civil districts of Rustenburg, Koster, Swartruggens, Marico '
      + 'and Thabazimbi from the Archdiocese of Pretoria and erects the new Apostolic '
      + 'Prefecture of Rustenburg (South Africa): "...easque in Praefecturae apostolicae '
      + 'formam redigimus, Rustenburgensis cognominandae...".',
  },
  'paul-vi|breiensis|1971-09-14': {
    argumentum:
      'S. LUDOVICI IN MARAGNANO (BREIENSIS)* DETRACTIS QUIBUSDAM TERRITORIIS AB '
      + 'ARCHIDIOECESI S. LUDOVICI IN MARAGNANO, ALIA CONDITUR DIOECESIS, APPELLATIONE '
      + '«BREIENSIS».',
    note:
      'Detaches sixteen municipalities from the Archdiocese of Sao Luis do Maranhao and '
      + 'erects the new Diocese of Brejo (Brazil): "...ex iisque dioecesim condimus, '
      + 'Breiensem appellandam...".',
  },
  'paul-vi|paulalfonsanensis|1971-09-14': {
    argumentum:
      'BONFIMENSIS (PAULALFONSANENSIS)* DETRACTIS QUIBUSDAM TERRITORIIS A DIOECESI '
      + 'BONFIMENSI ALIA CONDITUR, NOMINE «PAULALFONSANENSIS».',
    note:
      'Detaches eighteen municipalities from the Diocese of Bonfim and erects the new '
      + 'Diocese of Paulo Afonso (Brazil): "...ex iisque novam dioecesim constituimus, '
      + 'Paulalfonsanensem appellandam...".',
  },
  'paul-vi|korhogoensis|1971-10-15': {
    argumentum:
      'KATIOLAËNSIS (KORHOGOËNSIS)* DETRACTIS QUIBUSDAM TERRITORIIS AB ECCLESIA '
      + 'KATIOLAËNSI, NOVA DIOECESIS CONDITUR, KORHOGOËNSIS NOMINE.',
    note:
      'Detaches the civil prefectures of Korhogo, Boundiali and Odienne from the Diocese '
      + 'of Katiola and erects the new Diocese of Korhogo (Ivory Coast), suffragan to '
      + 'Abidjan: "...easque in novae dioecesis formam redigimus...Korhogoënsis '
      + 'appellandae.".',
  },
  'paul-vi|pagadianensis|1971-11-12': {
    argumentum:
      'ZAMBOANGENSIS (PAGADIANENSIS)* DETRACTIS QUIBUSDAM TERRITORIIS AB ARCHIDIOECESI '
      + 'ZAMBOANGENSI, NOVA CONDITUR DIOECESIS, NOMINE «PAGADIANENSIS».',
    note:
      'Detaches parishes from the Archdiocese of Zamboanga and erects the new Diocese of '
      + 'Pagadian (Philippines): "...iisque novam dioecesim condimus, Pagadianensem '
      + 'appellandam...".',
  },
  'paul-vi|iagdalpurensis|1972-03-23': {
    argumentum:
      'RAIPURENSIS (IAGDALPURENSIS)* DETRACTO TERRITORIO COGNOMINE BASTAR A PRAEFECTURA '
      + 'APOSTOLICA RAIPURENSI, APOSTOLICUS EXARCHATUS «IAGDALPURENSIS» CONDITUR RITUS '
      + 'MALABARENSIS.',
    note:
      'Detaches the civil district of Bastar from the Apostolic Prefecture of Raipur and '
      + 'erects the new Apostolic Exarchate of Jagdalpur of the Syro-Malabar rite (India), '
      + 'entrusted to the Carmelites of Mary Immaculate: "...eo territorio...apostolicum '
      + 'Exarchatum Iagdalpurensem, constituimus...".',
  },
  'paul-vi|meerutensis|1972-03-23': {
    argumentum:
      'MEERUTENSIS* NONNULLIS TERRITORIIS DETRACTIS A DIOECESI MEERUTENSI, EFFICITUR NOVUS '
      + 'EXARCHATUS APOSTOLICUS RITUS MALABARENSIS NOMINE «BIJNORENSIS».',
    note:
      'Detaches the districts of Bijnor (less Dhampur), Garhwal, Tehri, Chamoli and '
      + 'Uttarkashi from the Diocese of Meerut and erects the new Apostolic Exarchate of '
      + 'Bijnor of the Syro-Malabar rite (India), suffragan to Agra: "...eosque in formam '
      + 'apostolici Exarchatus ritus malabarensis redigimus, cuius Sedes orbs Bijnor erit, '
      + 'cuique nomen Bijnorensis.".',
  },
  'paul-vi|singidaensis|1972-03-25': {
    argumentum:
      'TABORAËNSIS ET ALIARUM (SINGIDAËNSIS)* DETRACTIS NONNULLIS TERRITORIIS A TABORAËNSI '
      + 'ALIISQUE DIOECESIBUS, NOVA CONDITUR DIOECESIS SINGIDAËNSIS APPELLANDA.',
    note:
      'Detaches the Singida region (the districts of Iramba, Singida and Manyoni and part '
      + 'of Tabora) from the Dioceses of Tabora, Mbulu, Dodoma and Mbeya and erects the new '
      + 'Diocese of Singida (Tanzania), suffragan to Tabora: "...quibus terris novam '
      + 'dioecesim condimus...Singidaënsem appellandam...".',
  },
  'paul-vi|hinchensis|1972-04-20': {
    argumentum:
      'GONAYVESENSIS - CAPITIS HAITIANI (HINCHENSIS)* DETRACTIS QUIBUSDAM TERRITORIIS A '
      + 'DIOECESIBUS GONAYVESENSI ET CAPITIS HAITIANI NOVA EFFICITUR DIOECESIS, NOMINE '
      + '«HINCHENSIS».',
    note:
      'Detaches ten parishes and a quasi-parish from the Dioceses of Gonaives and '
      + 'Cap-Haitien and erects the new Diocese of Hinche (Haiti): "...iisque dioecesim '
      + 'condimus, Hinchensem appellandam...".',
  },
  'paul-vi|lipensis|1972-06-20': {
    argumentum:
      'MANILENSIS (LIPENSIS)* SEPARATIS ECCLESIIS LIPENSI, LUCENENSI, INFANTENSI ATQUE '
      + 'CALAPANENSI A PROVINCIA ECCLESIASTICA MANILENSI, NOVA CONDITUR, LIPENSIS '
      + 'COGNOMINANDA.',
    note:
      'Erects the new ecclesiastical province of Lipa (Philippines), withdrawing the '
      + 'Dioceses of Lipa and Lucena, the Prelature of Infanta and the Apostolic Vicariate '
      + 'of Calapan from the province of Manila, with Lipa as metropolitan see: "...Ex '
      + 'quibus Ecclesiis novam provinciam ecclesiasticam creamus, Lipensem appellandam...".',
  },
  'paul-vi|vratislaviensis-berolinensis-et-aliarum|1972-06-28': {
    argumentum:
      'VRATISLAVIENSIS - BEROLINENSIS ET ALIARUM* NOVAE IN POLONIA DIOECESES '
      + 'CONSTITUUNTUR, NOMINE OPOLIENSIS, GORZOVIENSIS, SEDINENSIS-CAMINENSIS, '
      + 'COSLINENSIS-COLUBREGANAE.',
    note:
      'Reorganises the Church in western and northern Poland: erects four new dioceses, '
      + 'Opole, Gorzow, Szczecin-Kamien and Koszalin-Kolobrzeg, from territory of the '
      + 'Archdiocese of Wroclaw, the Diocese of Berlin, the Prelature of Schneidemuhl and '
      + 'others: "...Quattuor in regione quam diximir dioeceses condimus, Opoliensem, '
      + 'Gorzoviensem, Sedinensem-Caminensem et Coslinensem-Colubreganam appellandas...".',
  },
  'paul-vi|neivensis|1972-07-24': {
    argumentum:
      'GARZONENSIS - NEIVENSIS (NEIVENSIS)* TERRITORIIS QUIBUSDAM A DIOECESI '
      + 'GARZONENSI-NEIVENSI DETRACTIS NOVA CONDITUR, NOMINE «NEIVENSIS».',
    note:
      'Detaches six parishes in the city of Neiva and nineteen other territories from the '
      + 'Diocese of Garzon-Neiva and erects the new Diocese of Neiva (Colombia), suffragan '
      + 'to Popayan: "...iisque novam dioecesim constituimus, nomine Neivensem...".',
  },
  'paul-vi|adoekitiensis|1972-07-30': {
    argumentum:
      'ONDOËNSIS (ADOËKITIENSIS)* DETRACTIS QUIBUSDAM TERRITORIIS AB ECCLESIA ONDOËNSI, '
      + 'NOVA DIOECESIS CONDITUR NOMINE «ADOËKITIENSIS».',
    note:
      'Detaches the Ekiti region from the Diocese of Ondo and erects the new Diocese of '
      + 'Ado-Ekiti (Nigeria), suffragan to Lagos: "...eamque in novae dioecesis formam '
      + 'redigimus...Adoëkitiensis appellandae.".',
  },
  'paul-vi|boacensis|1977-04-02': {
    argumentum:
      'BOACENSIS* DETRACTA AB ECCLESIA LUCENENSI, IN INSULIS PHILIPPINIS, PROVINCIA VULGO '
      + 'MARINDUQUE, NOVA DIOECESIS CONDITUR « BOACENSIS » APPELLANDA',
    note:
      'Detaches the civil province of Marinduque from the Diocese of Lucena and erects the '
      + 'new Diocese of Boac (Philippines), suffragan to Lipa: "...eoque novam dioecesim '
      + 'condimus, « Boacensem » appellandam...".',
  },
  'paul-vi|vianensis-castelli|1977-11-03': {
    argumentum:
      'VIANENSIS CASTELLI* IN LUSITANIAE FINIBUS DIOECESIS VIANENSIS CASTELLI '
      + 'CONSTITUITUR, DISMEMBRATO TERRITORIO ARCHIDIOECESIS BRACARENSIS',
    note:
      'Detaches the region of Viana do Castelo from the Archdiocese of Braga and erects '
      + 'the new Diocese of Viana do Castelo (Portugal): "...eoque dioecesim condimus, '
      + 'Vianensem Castelli nuncupandam...".',
  },
  'paul-vi|avkaensis|1977-11-10': {
    argumentum:
      'AVKAËNSIS* DETRACTIS NONNULLIS TERRITORIIS AB ARCHIDIOECESI ONITSHAËNSI, NOVA IN '
      + 'NIGERIA DIOECESIS CONDITUR, AVKAËNSIS NOMINE',
    note:
      'Detaches the administrative districts of Awka, Njikoka and Aguata and part of Oji '
      + 'River from the Archdiocese of Onitsha and erects the new Diocese of Awka (Nigeria), '
      + 'suffragan to Onitsha: "...iisque novam dioecesim condimus, quae ab urbe principe '
      + 'regionis, Avhaënsis cognominabitur...".',
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
 *
 * The audit is case-insensitive (Ruling 8) because nine Benedict XVI pages print the
 * argumentum in sentence case in its usual place under the toponym ('In Indonesia nova
 * conditur dioecesis Maumerensis appellanda.'), and the quote stays verbatim.
 *
 * `COOSTITUITUR` and `CONSTI\. TUITUR` (Ruling 10) are two page misprints of CONSTITUITUR
 * -- Paul VI's 'Tulcanensis' of 1965 and 'Balasorensis' of 1968 -- kept verbatim in their
 * rows, so the audit learns the misprint rather than the row being corrected.
 *
 * `DIOECESIUM ORDINEM`, `IN FORMAM DIOECESIS` and `AD DIOECESIS DIGNITATEM` (Ruling 10)
 * are the word orders four Paul VI elevations use ('Hamiltonensis' and 'Banarensis' IN/AD
 * DIOECESIUM ORDINEM REDIGITUR, 'Sanensis' IN FORMAM DIOECESIS REDIGITUR, 'Machalensis' AD
 * DIOECESIS DIGNITATEM TOLLITUR); each hits only elevation rows across all four tables,
 * whereas bare TOLLITUR was rejected because it also hits two province erections
 * ('Tananarivensis', 'Tunquensis').
 *
 * `IUNGITUR` (Ruling 10) is the verb Paul VI's 'Spalatensis-Macarscensis' union leads
 * with; it also appears in three John XXIII title-change adjudications ('APPELLATIO
 * IUNGITUR'), which this regex does not audit.
 */
export const ERECTION_IDIOMS =
  /CONDITUR|CONDUNTUR|ERIGITUR|ERIGUNTUR|CONSTITUITUR|CONSTITUUNTUR|EXCITATUR|EFFICITUR|CREATUR|NOVA FIT|FORMAM REDIG|FORMATUR|FORMANTUR|COOSTITUITUR|CONSTI\. TUITUR/i;
export const ELEVATION_IDIOMS =
  /EVEHITUR|EVEHUNTUR|ELEVATUR|PERDUCITUR|ATTOLLITUR|ATTOLITUR|EXTOLLITUR|AD (?:GRADUM|DIGNITATEM|EPARCHIAE|APOSTOLICI)|IN ORDINEM (?:ARCHI)?DIOECESIUM|DIOECESIUM ORDINEM|IN FORMAM DIOECESIS|AD DIOECESIS DIGNITATEM/i;
export const UNION_IDIOMS =
  /DE UNIONE|UNIONE|UNIUNTUR|UNITUR|CONIUNG|AEQUE PRINCIPALITER|DISMEMBRATIONE|IUNGITUR/i;

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
  // The third curation instalment (Task 4), Benedict XVI: the 11 of the 90 candidates that
  // raise an existing circumscription in rank (2006-03-18 through 2011-11-09). Three more
  // whose body raises an existing see under an argumentum that says CONDITUR or
  // CONSTITUITUR ('Fagarasiensis', 'Azerbaigianiensis', 'Cametanensis') sit in the
  // erections table under Ruling 9: the argumentum governs the table. 'Kyrgyzstaniae' is
  // quoted by hand in the sentence case its page prints.
  'benedict-xvi|kyrgyzstaniae|2006-03-18': {
    argumentum:
      'KYRGYZSTANIAE* Missio sui iuris in Republica Kyrgyzstaniae ad gradum Administrationis '
      + 'Apostolicae evehitur.',
    note:
      'Raises the Mission sui iuris of Kyrgyzstan to the rank of an apostolic administration: '
      + '"...Missionem sui iuris in Republica Kyrgyzstaniae...ad gradum dignitatemque '
      + 'Administrationis Apostolicae evehimus atque attollimus.". The page prints this '
      + 'argumentum in sentence case rather than capitals, so the case-delimited reader '
      + 'stopped at its first word and the curation script abstained; it is quoted here by '
      + 'hand as the page prints it.',
  },
  'benedict-xvi|cassoviensis|2008-01-30': {
    argumentum:
      'EXARCHIA APOSTOLICA KOSICENSIS PRO CHRISTIFIDELIBUS ECCLESIAE RITUS BYZANTINI IN '
      + 'SLOVACHIA COMMORANTIBUS AD GRADUM EPARCHIAE EVEHITUR NOMINE CASSOVIENSIS.*',
    note:
      'Raises the Apostolic Exarchate of Košice for the Byzantine-rite faithful of Slovakia to '
      + 'the rank of an eparchy, named Košice, keeping its cathedral and made suffragan to the '
      + 'metropolitan see of Prešov: "...eandem Exarchiam Apostolicam ad gradum Eparchiae '
      + 'evehimus nomine Cassoviensis...". The page prints this argumentum in place of the '
      + 'toponym line, with the asterisk after it, so the script\'s extraction begins with the '
      + 'argumentum itself rather than with "CASSOVIENSIS*".',
  },
  'benedict-xvi|huariensis|2008-04-02': {
    argumentum:
      'HUARIENSIS* IN PERUVIA PRAELATURA TERRITORIALIS HUARIENSIS AD GRADUM AC DIGNITATEM '
      + 'DIOECESIS EVEHITUR SERVATIS IISDEM FINIBUS ET NOMINE.',
    note:
      'Raises the Territorial Prelature of Huari to the rank of a diocese, keeping its name '
      + 'and boundaries and confirming it suffragan to Trujillo: "...Praelaturam territorialem '
      + 'Huariensem ad gradum ac dignitatem dioecesis attollimus, servatis iisdem finibus, '
      + 'quibus nunc ipsa terminatur, et nomine.".',
  },
  'benedict-xvi|galapagensis|2008-07-15': {
    argumentum:
      'GALAPAGENSIS* IN AEQUATORIA GALAPAGENSIS PRAEFECTURA APOSTOLICA AD APOSTOLICI '
      + 'VICARIATUS DIGNITATEM ATTOLITUR.',
    note:
      'Raises the Apostolic Prefecture of Galápagos, erected by Pius XII, to the rank of an '
      + 'apostolic vicariate, keeping its name and boundaries and its care by the Friars '
      + 'Minor: "...Praefecturam Apostolicam Galapagensem ad Apostolici Vicariatus dignitatem, '
      + 'iisdem finibus eodemque nomine servatis, attollimus...". The argumentum prints '
      + '"ATTOLITUR", as quoted.',
  },
  'benedict-xvi|mongensis|2009-06-03': {
    argumentum:
      'MONGENSIS* IN CIADIA PRAEFECTURA APOSTOLICA MONGENSIS AD GRADUM VICARIATUS APOSTOLICI '
      + 'ATTOLLITUR IMMUTATIS FINIBUS ET NOMINE',
    note:
      'Raises the Apostolic Prefecture of Mongo, in Chad, to the rank of an apostolic '
      + 'vicariate, keeping its name and boundaries: "...Praefecturam Apostolicam Mongensem ad '
      + 'gradum Vicariatus Apostolici attollimus immutatis finibus et nomine.".',
  },
  'benedict-xvi|gimaensis-bongana|2009-12-05': {
    argumentum:
      'GIMMAËNSIS-BONGANA* IN AETHIOPIA PRAEFECTURA APOSTOLICA GIMMAËNSIS-BONGANA AD GRADUM '
      + 'VICARIATUS APOSTOLICI ATTOLLITUR IMMUTATIS FINIBUS ET NOMINE',
    note:
      'Raises the Apostolic Prefecture of Jimma-Bonga, in Ethiopia, to the rank of an '
      + 'apostolic vicariate, keeping its name and boundaries and its care by the Congregation '
      + 'of the Mission: "...Praefecturam Apostolicam Gimmaënsem-Bonganam ad gradum Vicariatus '
      + 'Apostolici attollimus immutatis finibus et nomine.". The heading spells the see '
      + '"Gimmaënsis-Bongana" where the harvested index (and so the key) has '
      + '"Gimaënsis-Bongana".',
  },
  'benedict-xvi|quettensis|2010-04-29': {
    argumentum:
      'QUETTENSIS* PRAEFECTURA APOSTOLICA QUETTENSIS AD GRADUM VICARIATUS APOSTOLICI EVEHITUR, '
      + 'EODEM SERVATO NOMINE.',
    note:
      'Raises the Apostolic Prefecture of Quetta, in Pakistan, to the rank of an apostolic '
      + 'vicariate, keeping its name and entrusted to the Oblates of Mary Immaculate: '
      + '"...Praefecturam Apostolicam Quettensem, eodem servato nomine, ad gradum Vicariatus '
      + 'Apostolici evehimus...".',
  },
  'benedict-xvi|ipilensis|2010-05-01': {
    argumentum:
      'IPILENSIS* PRAELATURA TERRITORIALIS IPILENSIS AD GRADUM AC DIGNITATEM DIOECESIS '
      + 'EVEHITUR',
    note:
      'Raises the Territorial Prelature of Ipil, in the Philippines, to the rank of a diocese, '
      + 'keeping its name and boundaries: "...Praelaturam Ipilensem in dioecesium numerum '
      + 'recensemus, immutata appellatione finibusque.".',
  },
  'benedict-xvi|impfondensis|2011-02-11': {
    argumentum:
      'IMPFONDENSIS* IN CONGO PRAEFECTURA APOSTOLICA LIKAULENSIS EXTOLLITUR AD GRADUM '
      + 'DIOECESIS IMPFONDENSIS APPELLANDAE',
    note:
      'Raises the Apostolic Prefecture of Likouala, in Congo, to the rank of a diocese under '
      + 'the new name of Impfondo, keeping its boundaries: "...Praefecturam Apostolicam '
      + 'Likualensem ad dioecesis dignitatem attollimus et mutato nomine in dioecesim '
      + 'Impfondensem erigimus, iisdem finibus servatis...". A change of rank and name for an '
      + 'existing circumscription, not the erection of a new one.',
  },
  'benedict-xvi|machiquesensis|2011-04-09': {
    argumentum:
      'MACHIQUESENSIS* VICARIATUS APOSTOLICUS MACHIQUESENSIS IN VENETIOLA AD GRADUM AC '
      + 'DIGNITATEM DIOECESIS EVEHITUR SERVATIS IISDEM FINIBUS ET NOMINIBUS SIVE DE CURIA SIVE '
      + 'IN LINGUA LOCI PROPRIA',
    note:
      'Raises the Apostolic Vicariate of Machiques, in Venezuela, to the rank of a diocese, '
      + 'keeping its boundaries and its Latin and Spanish names, suffragan to Maracaibo: '
      + '"...Vicariatum Apostolicum Machiquesensem ad gradum ac dignitatem dioecesis '
      + 'attollimus, iisdem servatis finibus...et nominibus sive de Curia sive in lingua loci '
      + 'propria.".',
  },
  'benedict-xvi|obidensis|2011-11-09': {
    argumentum:
      'OBIDENSIS* IN BRASILIA PRAELATURA TERRITORIALIS OBIDENSIS AD GRADUM AC DIGNITATEM '
      + 'DIOECESIS EVEHITUR SERVATIS IISDEM FINIBUS ET NOMINE',
    note:
      'Raises the Territorial Prelature of Óbidos (erected by Pius XII in 1957, filed in the '
      + 'erections table) to the rank of a diocese, keeping its name and boundaries and '
      + 'confirming it suffragan to Belém do Pará: "...praelaturam territorialem Obidensem ad '
      + 'gradum ac dignitatem dioecesis attollimus, servatis iisdem finibus, quibus nunc ipsa '
      + 'terminatur, et nomine.".',
  },
  // The fourth curation instalment (Task 5), Paul VI: the 48 of the 222 candidates that
  // raise an existing circumscription in rank (1963-07-06 through 1971-12-06). Most raise an
  // apostolic prefecture or vicariate, a prelature or a mission sui iuris to a diocese;
  // eight raise a see to metropolitan or archiepiscopal rank ('Hermosillensis',
  // 'Rosariensis', 'Barcinonensis', 'Matritensis', 'Piurensis et aliarum', 'Kasamaënsis et
  // aliarum', 'Amidensis Chaldaeorum', 'Ptolemaidensis Melchitarum'), and where a new
  // province follows, the elevation is what the argumentum leads with. 'Shikokuensis' is
  // quoted by hand because a lower-case l in its toponym stopped the reader. 'Dapagoënsis'
  // carries, verbatim, the Mendi argumentum its page mis-pastes over the Dapango body; both
  // are elevations. Four state the act in a form the elevation idioms do not list
  // ('Sanensis' IN FORMAM DIOECESIS REDIGITUR, 'Hamiltonensis' IN DIOECESIUM ORDINEM
  // REDIGITUR, 'Banarensis' AD DIOECESIUM ORDINEM REDIGITUR, 'Machalensis' AD DIOECESIS
  // DIGNITATEM TOLLITUR); the audit regex lists those word orders under Ruling 10.
  'paul-vi|kayensis|1963-07-06': {
    argumentum:
      'KAYENSIS* PRAEFECTURA APOSTOLICA KAYENSIS AD GRADUM ET DIGNITATEM DIOECESIS '
      + 'EVEHITUR, EODEM NOMINE SERVATO.',
    note:
      'Raises the Apostolic Prefecture of Kayes (Mali) to the rank of a diocese, keeping '
      + 'its name and boundaries, suffragan to Bamako: "...Apostolicam praefecturam Kayensem '
      + 'in dioecesis formam redigimus, servato nomine et finibus...".',
  },
  'paul-vi|kengensis|1963-07-06': {
    argumentum:
      'KENGENSIS * APOSTOLICA PRAEFECTURA KENGENSIS AD GRADUM ET DIGNITATEM DIOECESIS '
      + 'EVEHITUR, IISDEM FINIBUS EODEMQUE NOMINE.',
    note:
      'Raises the Apostolic Prefecture of Kenge (Congo) to the rank of a diocese, keeping '
      + 'its name and boundaries: "...Praefecturam Kengensem in formam dioecesis redigimus '
      + 'eodem nomine atque finibus.".',
  },
  'paul-vi|sikassensis|1963-07-06': {
    argumentum:
      'SIKASSENSIS* PRAEFECTURA APOSTOLICA SIKASSENSIS, IN REPUBLICA VULGO MALI '
      + 'COGNOMINATA, AD DIOECESIS GRADUM EVEHITUR, NOMINE IMMUTATO.',
    note:
      'Raises the Apostolic Prefecture of Sikasso (Mali) to the rank of a diocese, keeping '
      + 'its name: "...Praefecturam apostolicam Sikassensem ad gradum et dignitatem '
      + 'dioecesis extollimus...".',
  },
  'paul-vi|hermosillensis|1963-07-13': {
    argumentum:
      'HERMOSILLENSIS * HERMOSILLENSIS ECCLESIA AD GRADUM SEDIS METROPOLITANAE EVEHITUR, '
      + 'CUI SUFFRAGANEAE SUBICIUNTUR DIOECESES OBREGONENSIS ET TIGIUANAËNSIS.',
    note:
      'Separates Hermosillo from the province of Chihuahua and raises it to a metropolitan '
      + 'see, with Tijuana and Ciudad Obregon as suffragans: "...Hermosillensem Sedem '
      + 'seiungimus, eamque ad gradum et ordinem metropolitanae Sedis evehimus...". The '
      + 'elevation is what the argumentum leads with; the new province is its consequence.',
  },
  'paul-vi|tigiuanaensis|1963-07-13': {
    argumentum:
      'TIGIUANAËNSIS * VICARIATUS APOSTOLICUS TIGIUANAËNSIS AD GRADUM EVEHITUR DIOECESIS, '
      + 'EODEM NOMINE IISDEMQUE SERVATIS FINIBUS.',
    note:
      'Raises the Apostolic Vicariate of Tijuana to the rank of a diocese, keeping its '
      + 'name and boundaries: "...vicariatum apostolicum Tigiuanaënsem ad dioecesis '
      + 'dignitatem extollimus, eodem serrato nomine iisdemque...finibus.".',
  },
  'paul-vi|rosariensis|1963-08-12': {
    argumentum:
      'ROSARIENSIS * ROSARIENSIS DIOECESIS AD GRADUM ET DIGNITATEM METROPOLITANAE '
      + 'ECCLESIAE EVEHITUR, CUI SUFFRAGANEAE SUBICIUNTUR DIOECESES S. NICOLAI DE LOS '
      + 'ARROYOS ET CERVI LUSCI.',
    note:
      'Raises the Diocese of Rosario (Argentina) to a metropolitan see, with San Nicolas '
      + 'de los Arroyos and the Diocese of Venado Tuerto (erected the same day) as '
      + 'suffragans: "...Rosariensem Sedem ad gradum et dignitatem metropolitanae Ecclesiae '
      + 'attollimus...".',
  },
  'paul-vi|shikokuensis|1963-09-13': {
    argumentum:
      'SHlKOKUENSIS (TAKAMATSUENSIS) * PRAEFECTURA APOSTOLICA SHIKOKUENSIS AD GRADUM '
      + 'EXTOLLITUR DIOECESIS, NOMINE INDICTO «TAKAMATSUENSIS».',
    note:
      'Raises the Apostolic Prefecture of Shikoku (Japan) to the rank of a diocese under '
      + 'the new name Takamatsu, suffragan to Tokyo: "...praefecturam Shikokuensem, quam '
      + 'nominavimus, in dioecesis formam redigimus, Takamatsuensis appellandae.". The page '
      + 'prints the toponym as "SHlKOKUENSIS", with a lower-case l for the I, so the '
      + 'case-delimited reader stopped at its first word and the curation script abstained; '
      + 'the argumentum is quoted here by hand as the page prints it.',
  },
  'paul-vi|kituiensis|1963-11-16': {
    argumentum:
      'KITUIENSIS* APOSTOLICA PRAEFECTURA KITUIENSIS AD GRADUM DIOECESIS EVEHITUR, EODEM '
      + 'NOMINE SERVATO.',
    note:
      'Raises the Apostolic Prefecture of Kitui (Kenya) to the rank of a diocese, keeping '
      + 'its name and boundaries: "...Apostolicam praefecturam Kituiensem ad gradum '
      + 'dioecesis attollimus eiusdem nominis, iisdemque finibus servatis...".',
  },
  'paul-vi|bossangoaensis|1964-01-16': {
    argumentum:
      'BOSSANGOAËNSIS * APOSTOLICA PRAEFECTURA BOSSANGOAËNSIS AD GRADUM DIOECESIS '
      + 'EVEHITUR.',
    note:
      'Raises the Apostolic Prefecture of Bossangoa (Central African Republic) to the rank '
      + 'of a diocese, keeping its name and boundaries: "...ad dignitatem et gradum '
      + 'dioecesis attollimus eodem nomine iisdemque finibus servatis.".',
  },
  'paul-vi|palaensis|1964-01-16': {
    argumentum:
      'PALAËNSIS * PRAEFECTURA APOSTOLICA PALAËNSIS, IN TERRITORIO VULGO TCHAD, AD GRADUM '
      + 'DIOECESIS EVEHITUR, NOMINE FINIBUSQUE IMMUTATIS.',
    note:
      'Raises the Apostolic Prefecture of Pala (Chad) to the rank of a diocese, keeping '
      + 'its name and boundaries: "...praefecturam apostolicam Palaënsem ad dioecesis gradum '
      + 'attollimus...".',
  },
  'paul-vi|bangassuensis|1964-02-10': {
    argumentum:
      'BANGASSUENSIS * APOSTOLICA PRAEFECTURA BANGASSUENSIS AD GRADUM DIOECESIS '
      + 'ATTOLLITUR, EODEM NOMINE SERVATO.',
    note:
      'Raises the Apostolic Prefecture of Bangassou (Central African Republic) to the rank '
      + 'of a diocese, keeping its name and boundaries, suffragan to Bangui: "...Apostolicam '
      + 'praefecturam Bangassuensem ad gradum dioecesis attollimus, eodem nomine iisdemque '
      + 'finibus servatis...".',
  },
  'paul-vi|parakuensis|1964-02-10': {
    argumentum:
      'PARAKUENSIS* PRAEFECTURA APOSTOLICA PARAKUENSIS AD GRADUM ET DIGNITATEM DIOECESIS '
      + 'EVEHITUR, EODEM NOMINE SED MUTATIS FINIBUS.',
    note:
      'Raises the Apostolic Prefecture of Parakou (Dahomey), reduced the same day to the '
      + 'single civil district of Parakou, to the rank of a diocese: "...Praefecturam '
      + 'apostolicam Parakuensem ad gradum dioecesis evehimus, quae quidem idem nomen '
      + 'servabit, at uno civili districtu de Parakou constabit.".',
  },
  'paul-vi|villavicentiensis|1964-02-11': {
    argumentum:
      'VILLAVICENTIENSIS* VICARIATUS APOSTOLICUS VILLAVICENTIENSIS, IN COLUMBIA, AD GRADUM '
      + 'DIOECESIS ATTOLLITUR, NOMINE FINIBUSQUE SERVATIS.',
    note:
      'Raises the Apostolic Vicariate of Villavicencio (Colombia) to the rank of a '
      + 'diocese, keeping its name and boundaries: "...Vicariatum apostolicum '
      + 'Villavicentiensem ad dioecesis dignitatem attollimus...".',
  },
  'paul-vi|barcinonensis|1964-03-25': {
    argumentum:
      'BARCINONENSIS* CATHEDRALIS ECCLESIA BARCINONENSIS AD GRADUM ARCHIDIOECESIS '
      + 'EVEHITUR.',
    note:
      'Raises the Diocese of Barcelona to an archdiocese, withdrawn from the metropolitan '
      + 'jurisdiction of Tarragona and immediately subject to the Holy See, with no '
      + 'suffragans assigned: "...cathedralem Ecclesiam Barcinonensem a metropolitana '
      + 'iurisdictione Sedis Tarraconensis eximimus atque Sedi Apostolicae subiectam '
      + 'facimus...". Its chapter is raised to archiepiscopal rank in the same breath.',
  },
  'paul-vi|matritensis|1964-03-25': {
    argumentum:
      'MATRITENSIS* CATHEDRALIS ECCLESIA MATRITEOSIS AD GRADUM SEDIS ARCHIEPISCOPALIS '
      + 'EVEHITUR.',
    note:
      'Raises the Diocese of Madrid to an archdiocese, withdrawn from the metropolitan '
      + 'jurisdiction of Toledo and immediately subject to the Holy See, with no suffragans '
      + 'assigned: "...dioecesim Matritensem ad gradum archiepiscopalis Ecclesiae '
      + 'evehimus...". The heading prints "MATRITEOSIS", as quoted.',
  },
  'paul-vi|sokotoensis|1964-06-16': {
    argumentum:
      'SOKOTOËNSIS* PRAEFECTURA APOSTOLICA SOKOTOËNSIS AD GRADUM DIOECESIS EXTOLLITUR, '
      + 'NOMINE IMMUTATO.',
    note:
      'Raises the Apostolic Prefecture of Sokoto (Nigeria) to the rank of a diocese, '
      + 'keeping its name and boundaries: "...Praefecturam apostolicam Sokotoënsem ad gradum '
      + 'et dignitatem Sedis cathedralis attollimus, finibus atque nomine immutatis.".',
  },
  'paul-vi|kabbaensis|1964-07-06': {
    argumentum:
      'KABBAËNSIS* PRAEFECTURA APOSTOLICA KABBAËNSIS, IN NIGERIA, AD GRADUM DIOECESIS '
      + 'EXTOLLITUR.',
    note:
      'Raises the Apostolic Prefecture of Kabba (Nigeria) to the rank of a diocese, keeping '
      + 'its name and boundaries, suffragan to Onitsha: "...E numero praefecturarum '
      + 'apostolicarum eam tollentes, Ecclesiam Kabbaënsem ad gradum et dignitatem dioecesium '
      + 'efferimus, iisdem finibus eodemque servato nomine...".',
  },
  'paul-vi|canelosensis|1964-09-29': {
    argumentum:
      'CANELOSENSIS* APOSTOLICA PRAEFECTURA CANELOSENSIS AD GRADUM VICARIATUS APOSTOLICI '
      + 'ATTOLLITUR.',
    note:
      'Raises the Apostolic Prefecture of Canelos (Ecuador) to the rank of an apostolic '
      + 'vicariate, keeping its name and boundaries, entrusted to the Dominicans: '
      + '"...Apostolicam praefecturam Canelosensem ad vicariatus apostolici gradum '
      + 'attollimus...".',
  },
  'paul-vi|moptiensis|1964-09-29': {
    argumentum:
      'GAOËNSIS (MOPTIENSIS)* PRAEFECTURA APOSTOLICA GAOËNSIS AD GRADUM ET DIGNITATEM '
      + 'DIOECESIS EVEHITUR, «MOPTIENSIS» NOMINE.',
    note:
      'Raises the Apostolic Prefecture of Gao (Mali), less the district of Djenne given '
      + 'the same day to San, to the rank of a diocese under the new name Mopti, suffragan '
      + 'to Bamako: "...in ordinem dioecesium redigimus, Moptiensem appellandam...".',
  },
  'paul-vi|mvekaensis|1964-09-29': {
    argumentum:
      'MVEKAËNSIS* PRAEFECTURA APOSTOLICA MVEKAËNSIS, IN CONGO, AD GRADUM DIOECESIS '
      + 'EVEHITUR.',
    note:
      'Raises the Apostolic Prefecture of Mweka (Congo) to the rank of a diocese, keeping '
      + 'its name and boundaries, entrusted to the Josephites of Geraardsbergen: '
      + '"...Praefecturam apostolicam Mvekaënsem in dioecesium numerum conferimus, eodem '
      + 'nomine servato iisdemque finibus...".',
  },
  'paul-vi|sanensis|1964-09-29': {
    argumentum:
      'SANENSIS* MISSIO SANENSIS, QUAE SUI IURIS ERAT, IN FORMAM DIOECESIS REDIGITUR, '
      + 'EODEM QUIDEM NOMINE, AT MUTATIS FINIBUS.',
    note:
      'Raises the Mission sui iuris of San (Mali), enlarged with part of the Ke-Macina '
      + 'district from the Diocese of Segou and the whole Djenne district from the Apostolic '
      + 'Prefecture of Gao, to the rank of a diocese, keeping its name, suffragan to Bamako: '
      + '"...Missionem sui iuris Sanensem, sequentibus territoriis auctam...in ordinem '
      + 'dioecesium redigimus, eodem nomine Sanensi servato.". The argumentum names the '
      + 'existing mission as the subject turned into a diocese (IN FORMAM DIOECESIS '
      + 'REDIGITUR), which matches no idiom of any table, so the curation script abstained.',
  },
  'paul-vi|ptolemaidensis-melchitarum|1964-11-13': {
    argumentum:
      'PTOLEMAIDENSIS MELCHITARUM* ECCLESIA EPISCOPALIS PTOLEMAIDENSIS MELCHITARUM AD '
      + 'GRADUM ARCHIDIOECESIS EVEHITUR.',
    note:
      'Raises the episcopal see of Akka (Ptolemais) of the Melkites to archiepiscopal '
      + 'rank, confirming a synodal decision of the Melkite patriarchate: "...Sedem '
      + 'Ptolemaidensem Melchitarum, hactenus episcopalem, ad gradum et dignitatem '
      + 'archiepiscopalis redigimus...".',
  },
  'paul-vi|bhagalpurensis|1965-01-11': {
    argumentum:
      'BHAGALPURENSIS* APOSTOLICA PRAEFECTURA BHAGALPURENSIS AD GRADUM DIOECESIS EVEHITUR, '
      + 'EODEM NOMINE SERVATO.',
    note:
      'Raises the Apostolic Prefecture of Bhagalpur (India) to the rank of a diocese, '
      + 'keeping its name and boundaries, suffragan to Calcutta: "...apostolicam '
      + 'praefecturam Bhagalpurensem ad dioecesis gradum extollimus, eodem nomine iisdemque '
      + 'servatis finibus...".',
  },
  'paul-vi|dapagoensis|1965-07-06': {
    argumentum:
      'DAPAGOËNSIS * APOSTOLICA PRAEFECTURA MENDIENSIS AD GRADUM ET DIGNITATEM VICARIATUS '
      + 'APOSTOLICI EVEHITUR, IISDEM ET NOMINE ET FINIBUS SERVATIS.',
    note:
      'Raises the Apostolic Prefecture of Dapango (Togo) to the rank of a diocese, keeping '
      + 'its name, suffragan to Lome: "...Apostolicam praefecturam Dapangoënsem ad gradum '
      + 'dioecesis tollimus, eodem nomine.". The page prints under the DAPAGOËNSIS toponym '
      + 'the argumentum of the Mendi constitution of the same day (a prefecture raised to an '
      + 'apostolic vicariate), a page misprint quoted here as printed; the page title states '
      + 'this act as "Apostolica praefectura Dapangoënsis ad gradum dioecesis evehitur, '
      + 'eodem nomine servato". Both are elevations, so the table is unaffected.',
  },
  'paul-vi|kaolackensis|1965-07-06': {
    argumentum:
      'KAOLACKENSIS * PRAEFECTURA APOSTOLICA KAOLACKENSIS, IN SENEGALIA, AD DIGNITATEM '
      + 'DIOECESIS EVEHITUR.',
    note:
      'Raises the Apostolic Prefecture of Kaolack (Senegal) to the rank of a diocese, '
      + 'keeping its name, suffragan to Dakar: "...Praefecturam Kaolackensem in dioecesis '
      + 'formam redigimus, cum debitis iuribus, eodem imposito nomine...".',
  },
  'paul-vi|mendiensis|1965-07-06': {
    argumentum:
      'MENDIENSIS * APOSTOLICA PRAEFECTURA MENDIENSIS AD GRADUM ET DIGNITATEM VICARIATUS '
      + 'APOSTOLICI EVEHITUR, IISDEM ET NOMINE ET FINIBUS SERVATIS.',
    note:
      'Raises the Apostolic Prefecture of Mendi (New Guinea) to the rank of an apostolic '
      + 'vicariate, keeping its name and boundaries: "...praefecturam Mendiensem ad '
      + 'dignitatem vicariatus apostolici tollimus...servatis nempe et finibus et nomine '
      + 'Mendiensi.".',
  },
  'paul-vi|aganensis|1965-10-14': {
    argumentum:
      'GUAMENSIS (AGANENSIS) * VICARIATUS APOSTOLICUS GUAMENSIS AD GRADUM DIOECESIS '
      + 'ATTOLLITUR, «AGANENSIS» NOMINE.',
    note:
      'Raises the Apostolic Vicariate of Guam, entrusted to the Capuchins, to the rank of '
      + 'a diocese under the name Agana, keeping its boundaries: "...Vicariatum apostolicum '
      + 'Guamensem...ad gradum et dignitatem dioecesis attollimus Aganensis ab urbe principe '
      + 'appellandae...".',
  },
  'paul-vi|amidensis-chaldaeorum|1966-01-03': {
    argumentum:
      'AMIDENSIS CHALDAEORUM* EPISCOPALIS SEDES AMIDENSIS CHALDAEORUM, IN TURCARUM '
      + 'DITIONE, AD ARCHIEPISCOPALIS GRADUM ATTOLLITUR.',
    note:
      'Raises the episcopal see of Amida (Diyarbakir) of the Chaldeans, in Turkey, to '
      + 'archiepiscopal rank, confirming a decision of the Chaldean synod: "...sedemque '
      + 'episcopalem Amidensem Chaldaeorum ad gradum archiepiscopalis attollimus...".',
  },
  'paul-vi|bataensis|1966-05-04': {
    argumentum:
      'BATAËNSIS (RIVI MUNIENSIS)* VICARIATUS APOSTOLICUS RIVI MUNIENSIS AD DIGNITATEM '
      + 'DIOECESIS EVEHITUR, «BATAËNSIS» APPELLANDAE.',
    note:
      'Raises the Apostolic Vicariate of Rio Muni (Equatorial Guinea) to the rank of a '
      + 'diocese under the new name Bata, keeping its boundaries and immediately subject to '
      + 'the Holy See: "...Placet ergo vicariatum apostolicum Rivi Muniensis ad dignitatem '
      + 'dioecesis tolli, iisdem servatis finibus, mutato nomine, quod erit Bataënse...".',
  },
  'paul-vi|broomensis|1966-06-07': {
    argumentum:
      'KIMBERLISIENSIS (BROOMENSIS)* VICARIATUS APOSTOLICUS KIMBERLISIENSIS AD GRADUM ET '
      + 'DIGNITATEM DIOECESIS ATTOLLITUR, NOMINE «BROOMENSIS».',
    note:
      'Raises the Apostolic Vicariate of Kimberley (Australia) to the rank of a diocese '
      + 'under the new name Broome, keeping its boundaries, suffragan to Perth: '
      + '"...Vicariatum apostolicum Kimberlisiensem ad gradum et dignitatem dioecesis '
      + 'evehimus, nova addita nominatione Broomensi...".',
  },
  'paul-vi|maidugurensis|1966-06-07': {
    argumentum:
      'MAIDUGURIENSIS* PRAEFECTURA APOSTOLICA MAIDUGURIENSIS AD GRADUM ET DIGNITATEM '
      + 'DIOECESIS EVEHITUR, SERVATO NOMINE ATQUE FINIBUS.',
    note:
      'Raises the Apostolic Prefecture of Maiduguri (Nigeria) to the rank of a diocese, '
      + 'keeping its name and boundaries, entrusted to the Augustinians: "...Apostolicam '
      + 'praefecturam Maiduguriensem in dioecesibus annumeramus, iisdem limitibus atque '
      + 'nomine...".',
  },
  'paul-vi|piurensis-et-aliarum|1966-06-30': {
    argumentum:
      'PIURENSIS ET ALIARUM* PIURENSIS ECCLESIA AD DIGNITATEM METROPOLITANAE SEDIS '
      + 'EVEHITUR NOVAE PROVINCIAE ECCLESIASTICAE EIUSDEM NOMINIS.',
    note:
      'Raises the Diocese of Piura (Peru) to a metropolitan see at the head of a new '
      + 'province of the same name, with Chachapoyas, Chiclayo, Chota and Chulucanas as '
      + 'suffragans: "...ita statuentes ut ex his omnibus Sedibus nova provincia '
      + 'ecclesiastica coalescat, Piurensis appellanda...". The elevation is what the '
      + 'argumentum leads with (PIURENSIS ECCLESIA...EVEHITUR), the province its '
      + 'consequence, so this is an elevation under the John XXIII rule, unlike the Ayacucho '
      + 'and Huancayo constitutions of the same day whose argumenta lead with the province.',
  },
  'paul-vi|davaensis|1966-07-11': {
    argumentum:
      'DAVAËNSIS* PRAELATURA DAVAËNSIS, IN INSULIS PHILIPPINIS, AD GRADUM DIOECESIS '
      + 'EVEHITUR',
    note:
      'Raises the Prelature of Davao (Philippines) to the rank of a diocese, keeping its '
      + 'name and boundaries, suffragan to Cagayan de Oro: "...Praelaturam Davaënsem ad '
      + 'gradum et dignitatem dioecesis attollimus, eodem nomine iisdemque servatis '
      + 'finibus...".',
  },
  'paul-vi|gaberonensis|1966-08-05': {
    argumentum:
      'BECHUANALANDENSIS (GABERONESENSIS) * PRAEFECTURA APOSTOLICA BECHUAUALANDENSIS AD '
      + 'DIOECESIS GRADUM ATTOLLITUR, NOMINE «GABERONESENSIS».',
    note:
      'Raises the Apostolic Prefecture of Bechuanaland to the rank of a diocese under the '
      + 'new name Gaborone, suffragan to Bloemfontein: "...praefecturam apostolicam '
      + 'Bechuanalandensem ad dignitatem dioecesis attollimus, nomine Gaberonesensis...". '
      + 'The heading prints "BECHUAUALANDENSIS", as quoted.',
  },
  'paul-vi|caacupensis|1967-03-29': {
    argumentum:
      'CAACUPENSIS* PRAELATURA CAACUPENSIS, IN REIPUBLICAE PARAQUARIANAE FINIBUS, AD '
      + 'GRADUM DIOECESIS EVEHITUR.',
    note:
      'Raises the Prelature of Caacupe (Paraguay) to the rank of a diocese, keeping its '
      + 'name and boundaries, suffragan to Asuncion: "...Caacupensem praelaturam ad '
      + 'dignitatem dioecesis attollimus, eodem nomine iisdemque servatis finibus...".',
  },
  'paul-vi|deaarensis|1967-04-13': {
    argumentum:
      'DEAARENSIS* PRAEFECTURA APOSTOLICA DEAARENSIS AD DIOECESIS DIGNITATEM EXTOLLITUR.',
    note:
      'Raises the Apostolic Prefecture of De Aar (South Africa) to the rank of a diocese, '
      + 'keeping its name, entrusted to the Priests of the Sacred Heart: "...Praefecturam '
      + 'apostolicam Deaarensem ad dioecesis dignitatem attollimus, eodem retento '
      + 'nomine...".',
  },
  'paul-vi|hamiltonensis|1967-06-12': {
    argumentum:
      'INSULARUM BERMUDARUM (HAMILTONENSIS)* VICARIATUS APOSTOLICUS INSULARUM BERMUDARUM '
      + 'IN DIOECESIUM ORDINEM REDIGITUR, NOMINE IMMUTATO, QUOD ERIT «HAMILTONENSIS».',
    note:
      'Raises the Apostolic Vicariate of the Bermuda Islands to the rank of a diocese '
      + 'under the new name Hamilton in Bermuda: "...Vicariatum apostolicum Insularum '
      + 'Bermudarum in dioecesibus annumeramus, nomine Hamiltonensi in Bermuda...". The '
      + 'argumentum states the elevation as IN DIOECESIUM ORDINEM REDIGITUR, a word order '
      + 'the elevation idioms do not list, so the curation script abstained.',
  },
  'paul-vi|kasamaensis-et-aliarum|1967-06-12': {
    argumentum:
      'KASAMAËNSIS ET ALIARUM* KASAMAËNSIS DIOECESIS AD GRADUM ET DIGNITATEM ECCLESIAE '
      + 'METROPOLITANAE EVEHITUR.',
    note:
      'Raises the Diocese of Kasama (Zambia) to a metropolitan see at the head of a new '
      + 'province formed with Abercorn, both until now suffragan to Lusaka: "...Dioecesibus '
      + 'Kasamaënsi, Abercornensi, ad hunc diem Lusakensi Sedi subiectis, novam provinciam '
      + 'ecclesiasticam condimus, cuius metropolitana Sedes erit Kasamaënsis...". The '
      + 'elevation is what the argumentum states, the province its consequence.',
  },
  'paul-vi|kolensis|1967-09-14': {
    argumentum: 'KOLENSIS* PRAEFECTURA APOSTOLICA KOLENSIS AD GRADUM DIOECESIS EVEHITUR.',
    note:
      'Raises the Apostolic Prefecture of Kole (Congo) to the rank of a diocese, keeping '
      + 'its name and boundaries, suffragan to Luluabourg: "...praefecturam Kolensem ad '
      + 'dioecesis gradum attollimus, eodem nomine iisdemque servatis finibus.".',
  },
  'paul-vi|dorumaensis|1967-09-26': {
    argumentum:
      'DORUMAËNSIS* PRAEFECTURA APOSTOLICA DORUMAËNSIS AD GRADUM DIOECESIS ATTOLLITUR.',
    note:
      'Raises the Apostolic Prefecture of Doruma (Congo) to the rank of a diocese, keeping '
      + 'its name and boundaries: "...Praefecturam apostolicam Dorumaënsem ad dignitatem '
      + 'dioecesis evehimus, nomine finibusque immutatis...".',
  },
  'paul-vi|reykjavikensis|1968-10-18': {
    argumentum:
      'ISLANDIAE (REYKJAVIKENSIS) * APOSTOLICUS VICARIATUS ISLANDIAE AD DIOECESIS '
      + 'DIGNITATEM EVEHITUR, NOMINE «REYKJAVIKENSIS».',
    note:
      'Restores the hierarchy in Iceland by raising the Apostolic Vicariate of Iceland to '
      + 'the rank of a diocese under the name Reykjavik, immediately subject to the Holy '
      + 'See: "...vicariatum apostolicum Islandiae...ad gradum et dignitatem dioecesis '
      + 'evehimus...nomine Reykjavikensis, Apostolicae Sedi recto subiecta...".',
  },
  'paul-vi|machalensis|1969-01-31': {
    argumentum:
      'DE EL ORO (MACHALENSIS) * PRAELATURA DE EL ORO AD DIOECESIS DIGNITATEM TOLLITUR, '
      + '«MACHALENSIS» NOMINE.',
    note:
      'Raises the Prelature of El Oro (Ecuador) to the rank of a diocese under the name '
      + 'Machala, suffragan to Cuenca: "...Praelaturam de El Oro ad gradum dioecesis '
      + 'tollimus, cui nomen erit Machalensis...". The argumentum states the elevation with '
      + 'TOLLITUR and AD DIOECESIS DIGNITATEM, forms the elevation idioms do not list, so '
      + 'the curation script abstained.',
  },
  'paul-vi|weetebulaensis|1969-02-06': {
    argumentum:
      'WEETEBULAËNSIS * PRAEFECTURA APOSTOLICA WEETEBULAËNSIS AD DIOECESIS DIGNITATEM '
      + 'EVEHITUR, EODEM NOMINE ATQUE FINIBUS.',
    note:
      'Raises the Apostolic Prefecture of Weetebula (Indonesia) to the rank of a diocese, '
      + 'keeping its name and boundaries, suffragan to Ende: "...Praefecturam apostolicam '
      + 'Weetebulaënsem ad gradum dioecesis tollimus, iisdem finibus et nomine servatis...".',
  },
  'paul-vi|valleduparensis|1969-04-25': {
    argumentum:
      'VALLEDUPARENSIS * VICARIATUS APOSTOLICUS VALLEDUPARENSIS AD DIGNITATEM DIOECESIS '
      + 'EVEHITUR.',
    note:
      'Raises the Apostolic Vicariate of Valledupar (Colombia) to the rank of a diocese, '
      + 'keeping its name and boundaries, suffragan to Barranquilla, made metropolitan the '
      + 'same day: "...Vicariatum apostolicum Valleduparensem ad gradum dioecesis evehimus, '
      + 'eodem nomine atque finibus.".',
  },
  'paul-vi|ilorinensis|1969-05-29': {
    argumentum:
      'ILORINENSIS* PRAEFECTURA APOSTOLICA DORINENSIS AD GRADUM DIOECESIS EVEHITUR, EODEM '
      + 'NOMINE.',
    note:
      'Raises the Apostolic Prefecture of Ilorin (Nigeria) to the rank of a diocese, '
      + 'keeping its name, suffragan to Kaduna: "...Praefecturam apostolicam Ilorinensem ad '
      + 'dignitatem dioecesis tollimus, eodem nomine...". The heading prints "DORINENSIS", '
      + 'as quoted.',
  },
  'paul-vi|banarensis|1970-06-05': {
    argumentum:
      'BENARES-GORAKHPUR (BANARENSIS)* PRAEFECTURA DE BENARES-GORAKHPUR AD DIOECESIUM '
      + 'ORDINEM REDIGITUR, «BANARENSIS» APPELLANDA.',
    note:
      'Raises the Apostolic Prefecture of Benares-Gorakhpur (India) to the rank of a '
      + 'diocese under the name Varanasi (Banarensis), suffragan to Agra: "...Apostolicam '
      + 'Praefecturam de Benares-Gorakhpur ad gradum dioecesis tollimus, Banarensis '
      + 'nomine.". The argumentum states the elevation as AD DIOECESIUM ORDINEM REDIGITUR, a '
      + 'word order the elevation idioms do not list, so the curation script abstained.',
  },
  'paul-vi|araucensis|1970-11-11': {
    argumentum:
      'ARAUCENSIS * PRAEFECTURA APOSTOLICA ARAUCENSIS, IN COLUMBIANA REPUBLICA, AD GRADUM '
      + 'VICARIATUS APOSTOLICI EVEHITUR.',
    note:
      'Raises the Apostolic Prefecture of Arauca (Colombia) to the rank of an apostolic '
      + 'vicariate, keeping its name and boundaries: "...praefecturam apostolicam Araucensem '
      + 'in Columbiana Republica ad Apostolici Vicariatus dignitatem attollimus iisdem '
      + 'finibus eodemque nomine servato...".',
  },
  'paul-vi|iullundurensis|1971-12-06': {
    argumentum:
      'DE IULLUNDUR (IULLUNDURENSIS)* PRAEFECTURA APOSTOLICA DE IULLUNDUR AD GRADUM '
      + 'DIOECESIS TOLLITUR, IULLUNDURENSIS NOMINE.',
    note:
      'Raises the Apostolic Prefecture of Jullundur (India) to the rank of a diocese, '
      + 'suffragan to Delhi: "...Apostolicam Praefecturam de Iullundur ad dignitatem '
      + 'dioecesis evehimus, Jullundurensis nomine...".',
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
  // The fourth curation instalment (Task 5), Paul VI: the two of the 222 candidates that
  // unite existing sees (1966-04-26 and 1969-07-27). 'Chamberiensis et aliarum' joins two
  // Savoy dioceses aeque principaliter to Chambery; 'Spalatensis-Macarscensis' merges
  // Makarska into Split by extinctive union and raises the merged see to metropolitan rank
  // -- the union is what its argumentum leads with (IUNGITUR) and the vehicle of the
  // elevation, so it sits here, and IUNGITUR joined the union idioms under Ruling 10.
  'paul-vi|chamberiensis-et-aliarum|1966-04-26': {
    argumentum:
      'CHAMBERIENSIS ET ALIARUM* DIOECESES MAURIANENSIS ET TARANTASIENSIS, IN SABAUDIAE '
      + 'REGIONE, METROPOLITANAE SEDI CHAMBERIENSI AEQUE PRINCIPALITER UNIUNTUR.',
    note:
      'Unites the Dioceses of Maurienne (Saint-Jean-de-Maurienne) and Tarentaise aeque '
      + 'principaliter to the metropolitan Archdiocese of Chambery, one prelate governing '
      + 'all three: "...Maurianensem et Tarantasiensem dioeceses archidioecesi Chamberiensi '
      + 'aeque principaliter unimus, ita scilicet ut unus idemque Antistes tribus praesit '
      + 'Ecclesiis...".',
  },
  'paul-vi|spalatensis-et-macarscensis|1969-07-27': {
    argumentum:
      'SPALATENSIS - MACARSCENSIS * DIOECESIS MACARSCENSIS DIOECESI SPALATENSI IUNGITUR ET '
      + 'AD GRADUM METROPOLITANAE EVEHITUR, NOMINE «SPALATENSIS-MACARSCENSIS».',
    note:
      'Unites the Diocese of Makarska to the Diocese of Split by extinctive union, the '
      + 'merged see named Split-Makarska and raised to a metropolitan see at the head of a '
      + 'new province: "...Dioecesim Macarscensem unione ut dicitur exstintiva coniungimus '
      + 'cum Spalatensi ita ut haec in posterum Spalatensis-Macarscensis appelletur, eamque '
      + 'ad gradum et dignitatem metropolitanae attollimus...". The union is what the '
      + 'argumentum leads with (IUNGITUR) and the vehicle of the elevation, so this is a '
      + 'union; the curation script proposed an elevation because IUNGITUR is not among the '
      + 'union idioms.',
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
  // The third curation instalment (Task 4), Benedict XVI: the two of the 90 candidates that
  // are circumscription acts this registry mints no term for (2006-11-25 and 2008-06-18):
  // a reorganisation of every ecclesiastical province of Mexico, and the restoration of
  // the Diocese of Srijem by separating it from the see it was united to.
  'benedict-xvi|tigiuanaensis-et-aliarum|2006-11-25': {
    act: 'a reorganisation of every ecclesiastical province of Mexico',
    argumentum:
      'TIGIUANAËNSIS ET ALIARUM* ECCLESIASTICARUM PROVINCIARUM MEXICI NOVA FIT ORDINATIO.',
    note:
      'A province reorganisation, for which this registry mints no term: at the request of the '
      + 'Mexican episcopal conference, redraws the ecclesiastical provinces of Mexico to match '
      + 'the civil states, erecting four new provinces (Baja California, Bajío, Hidalgo and '
      + 'Chiapas), raising Tijuana, León, Tulancingo and Tuxtla Gutiérrez to metropolitan '
      + 'archdioceses at their heads, and restating the suffragans of every existing province: '
      + '"...postulavit ut ecclesiasticae provinciae in Mexico noviter '
      + 'recognoscerentur...Tigiuanaënsem, Leonensem, Tulancingensem et Tuxtlensem dioeceses '
      + 'ad gradum et dignitatem Ecclesiarum metropolitanarum evehimus...Nova erecta '
      + 'ecclesiastica provincia vulgo dicta Baja California constabit...". The NOVA FIT of '
      + 'the argumentum is the new ordering itself (NOVA FIT ORDINATIO), not a see erected, '
      + 'which is why the curation script proposed an erection.',
  },
  'benedict-xvi|sirmiensis|2008-06-18': {
    act: 'a see united aeque principaliter separated and restored as a diocese of its own',
    argumentum: 'SIRMIENSIS* IN SERBIA RESTITUITUR DIOECESIS SIRMIENSIS.',
    note:
      'Separates the ancient Diocese of Srijem, until now united aeque principaliter with the '
      + 'Diocese of Đakovo (or Bosnia), and restores it as a diocese of its own, seated at '
      + 'Srijemska Mitrovica and suffragan to the metropolitan see of Đakovo-Osijek erected '
      + 'the same day: "...A dioecesi Diacovensi seu Bosnensi integrum separamus territorium '
      + 'antiquae dioecesis Sirmiensis...Huius restitutae dioecesis sedem...statuimus...". A '
      + 'restitution (RESTITUITUR), for which this registry mints no term: neither a see '
      + 'erected new nor one raised in rank.',
  },
  // The fourth curation instalment (Task 5), Paul VI: the eleven of the 222 candidates that
  // are neither an erection, an elevation nor a union (1964-02-25 through 1969-10-02). Seven
  // are not circumscription acts at all: five chapters of canons (two of them collegiate
  // chapters restored in a parish church), the title of Abbot of Pomposa granted to the
  // Bishop of Comacchio, and new norms for the Basilica of St Nicholas in Bari. Four are
  // circumscription acts this registry mints no term for: a concathedral with a second
  // title for Garzon, a reassignment of suffragans between Buenos Aires and La Plata,
  // Nouakchott withdrawn from its province, and Skopje renamed Skopje-Prizren and made
  // suffragan ad instar of Vrhbosna.
  'paul-vi|garzonensis-neivensis|1964-02-25': {
    act: 'a concathedral erected and a second title added to a diocese',
    argumentum:
      'GARZONENSIS (GARZONENSIS - NEIVENSIS)* IN URBE NEIVA COGNOMINATA ECCLESIA '
      + 'CONCATHEDRALIS CONDITUR ET NOMEN GARZONENSIS DIOECESIS IMMUTATUR.',
    note:
      'A change of title, not of rank or boundaries: makes the church of the Immaculate '
      + 'Conception in Neiva a concathedral, renames the Diocese of Garzon and its bishop '
      + 'Garzon-Neiva, and allows the bishop to reside in Neiva: "...templum...in urbe Neiva '
      + 'exstans tamquam ecclesia Concathedralis habeatur...Garzonensis dioecesis eiusque '
      + 'pro tempore sacrorum Antistes inde ab hoc tempore cognomine Garzanensi-Neivensi '
      + 'vocentur.". The CONDITUR of the argumentum erects a concathedral, not a '
      + 'circumscription, which is why the curation script proposed an erection.',
  },
  'paul-vi|comaclensis|1964-05-18': {
    act: 'the title of Abbot of Pomposa granted to the Bishop of Comacchio',
    argumentum:
      'COMACLENSIS* EPISCOPO «PRO TEMPORE» COMACLENSI TITULUS ABBATIS POMPOSIANI '
      + 'CONCEDITUR.',
    note:
      'Not a circumscription act. Grants the Bishop of Comacchio pro tempore the title of '
      + 'Abbot of Pomposa, the restored abbey lying in his diocese: "...decernimus ut, in '
      + 'hoc rerum statu et donec aliter caveatur, Episcopus pro tempore Comaclensis Abbas '
      + 'Pomposianus vocari possit eoque titulo frui.". The diocese named in the heading '
      + 'keeps its rank and boundaries; the curation script abstained because CONCEDITUR '
      + 'matches no idiom.',
  },
  'paul-vi|antverpiensis|1964-05-31': {
    act: 'a chapter of canons erected in a cathedral',
    argumentum:
      'ANTVERPIENSIS* CATHEDRALIS TEMPLI ANTVERPIENSIS, IN BELGIO, COLLEGIUM CANONICORUM '
      + 'CONSTITUITUR.',
    note:
      'Not a circumscription act. Constitutes a chapter of canons in the cathedral of '
      + 'Antwerp, of one dignity (the dean) and as many canonries as there are prebends: '
      + '"...In cathedrali ecclesia Antverpiensi Canonicorum collegium constituimus, quod '
      + 'una constabit dignitate, nempe decanatu, atque tot canonicatibus quot sunt '
      + 'praebendae.". The CONSTITUITUR of the argumentum erects the chapter, not a '
      + 'circumscription, which is why the curation script proposed an erection.',
  },
  'paul-vi|culmensis|1964-11-01': {
    act: 'a collegiate chapter restored in a parish church',
    argumentum:
      'CULMENSIS* IN URBE KAMIÉN-KRAJENSKI, IN DIOECESI CULMENSI, CAPITULUM COLLEGIALE '
      + 'RESTITUITUR IN TEMPLO SS. PETRI ET PAULI.',
    note:
      'Not a circumscription act. Raises the parish church of SS Peter and Paul in Kamien '
      + 'Krajenski (Diocese of Chelmno) to collegiate rank and restores there a chapter of '
      + 'four canons and one dignity: "...templum paroeciale...ad gradum Collegiatae aedis '
      + 'tollimus...ibique Canonicorum collegium condimus...". The curation script abstained '
      + 'because RESTITUITUR matches no idiom.',
  },
  'paul-vi|czestochoviensis|1965-10-20': {
    act: 'a collegiate chapter restored in a parish church',
    argumentum:
      'CZĘSTOCHOVlENSlS* IN URBE WIELUŃ, IN DIOECESI CZĘSTOCHOVIENSI, CAPITULUM COLLEGIALE '
      + 'RESTITUITUR IN TEMPIO VISITATIONIS BEATAE MARIAE VIRGINIS.',
    note:
      'Not a circumscription act. Raises the parish church of the Visitation in Wielun '
      + '(Diocese of Czestochowa) to collegiate rank and restores there a chapter of six '
      + 'canons and three dignities: "...templum paroeciale...ad gradum collegiatae aedis '
      + 'tollimus...ibique Canonicorum collegium condimus...". The page prints the toponym '
      + 'as "CZĘSTOCHOVlENSlS", with lower-case l for two of the letters I, so the '
      + 'case-delimited reader stopped at its first word and the curation script abstained; '
      + 'the argumentum is quoted here by hand as the page prints it, "TEMPIO" included.',
  },
  'paul-vi|bonaerensis-platensis|1967-05-05': {
    act:
      'a reassignment of four suffragan dioceses between the provinces of Buenos Aires and '
      + 'La Plata',
    argumentum:
      'BONAËRENSIS - PLATENSIS* DIOECESES AVELLANEDIENSIS ET CLIVI ZAMOERENSIS, A IURE '
      + 'METROPOLITANO ARCHIDIOECESIS PLATENSIS SUBTRACTAE, ARCHIDIOECESI BONAËRENSI '
      + 'ATTRIBUUNTUR; ITEM DIOECESES MERCEDENSIS ATQUE NOVEM IULII, AB HAC SEPARATAE, ILLI '
      + 'SEDI ADDICUNTUR.',
    note:
      'A reassignment of suffragans between two provinces, for which this registry mints '
      + 'no term: moves the Dioceses of Avellaneda and Lomas de Zamora from the metropolitan '
      + 'jurisdiction of La Plata to that of Buenos Aires, and Mercedes and Nueve de Julio '
      + 'from Buenos Aires to La Plata: "...dioeceses Avellanediensem et Clivi Zamoerensis, '
      + 'Archiepiscopi Bonaërensis iuris dictioni metropolitanae subicimus...dioeceses '
      + 'Mercedensem atque S. Dominici Novem Iulii eximimus, easque...Platensi addicimus.". '
      + 'No see is erected or raised; the curation script abstained because ATTRIBUUNTUR and '
      + 'ADDICUNTUR match no idiom.',
  },
  'paul-vi|arundelliensis-brichtelmestunensis|1967-07-10': {
    act: 'a chapter of canons erected in a cathedral',
    argumentum:
      'ARUNDELLIENSIS - BRICHTELMESTUNENSIS* IN ECCLESIA ARUNDELLIENSI-BRICHTELMESTUNENSI '
      + 'CATHEDRALE COLLEGIUM CANONICORUM CONSTITUITUR.',
    note:
      'Not a circumscription act. Constitutes a chapter of one dignity (the provost) and '
      + 'eleven canons in the cathedral of Arundel and Brighton, erected two years earlier: '
      + '"...In templo cathedrali Arundelliensi-Brichtelmestunensi Canonicorum collegium '
      + 'constituimus, quod una constabit Dignitate, nempe Praeposito, atque undecim '
      + 'Canonicis.". The CONSTITUITUR of the argumentum erects the chapter, not a '
      + 'circumscription, which is why the curation script proposed an erection.',
  },
  'paul-vi|hasseletensis|1967-11-18': {
    act: 'a chapter of canons erected in a newly founded diocese',
    argumentum:
      'HASSELETENSIS* IN DIOECESI HASSELETENSI, RECENS CONDITA, CANONICORUM COLLEGIUM '
      + 'CONSTITUITUR.',
    note:
      'Not a circumscription act. Constitutes a chapter of canons of one dignity (the '
      + 'dean) and as many canons as there are prebends in the Diocese of Hasselt, erected '
      + 'six months earlier: "...In dioecesi Hasseletensi Canonicorum collegium '
      + 'constituimus, quod una constabit Dignitate, nempe Decanatu, atque certo Canonicorum '
      + 'numero, iuxta praebendarum numerum.". The CONSTITUITUR of the argumentum erects the '
      + 'chapter, not a circumscription, which is why the curation script proposed an '
      + 'erection.',
  },
  'paul-vi|barensis|1968-02-11': {
    act: 'new norms issued for the collegiate Basilica of St Nicholas in Bari',
    argumentum:
      'BARENSIS* NORMAE DE BASILICA COLLEGIALI SANCTI NICOLAI, IN URBE BARIO, NOVA RATIONE '
      + 'EDUNTUR.',
    note:
      'Not a circumscription act. Re-issues the norms governing the collegiate Basilica of '
      + 'St Nicholas in Bari, exempt from the archbishop and entrusted to the Dominicans, '
      + 'replacing those of Pius XII: "...statuimus ut dehinc rerum ordinationes in Basilica '
      + 'Sancti Nicolai, Barii, et in continentibus aedibus his, quae sequuntur normis '
      + 'regantur.". The archdiocese named in the heading is untouched; the curation script '
      + 'abstained because EDUNTUR matches no idiom.',
  },
  'paul-vi|nuakchottensis|1968-06-08': {
    act: 'a diocese withdrawn from its province and made immediately subject to the Holy See',
    argumentum:
      'NUAKCHOTTENSIS * DIOECESIS NUAKCHOTTENSIS, QUAE IN REIPUBLICAE MAURITANIACAE '
      + 'FINIBUS EXSTAT, A METROPOLITANA SEDE DAKARENSI SEIUNGITUR ET APOSTOLICAE SEDI '
      + 'DIRECTO OBNOXIA FIT.',
    note:
      'A change of metropolitan subjection, for which this registry mints no term: '
      + 'withdraws the Diocese of Nouakchott (Mauritania) from the province of Dakar and '
      + 'makes it immediately subject to the Holy See: "...cathedralem Sedem Nuakchottensem '
      + 'a iure metropolitanae Ecclesiae Dakarensis eximimus eamque Apostolicae Sedi directo '
      + 'subiectam in posterum esse...declaramus et statuimus.". The see keeps its rank and '
      + 'boundaries; the curation script abstained because SEIUNGITUR and OBNOXIA FIT match '
      + 'no idiom.',
  },
  'paul-vi|scopiensis-prisrianensis|1969-10-02': {
    act:
      'a diocese renamed, part of its territory ceded, and the see made suffragan ad '
      + 'instar of another province',
    argumentum:
      'SCOPIENSIS (SCOPIENSIS-PRISRIANENSIS) * DIOECESIS SCOPIENSIS, QUIBUSDAM DETRACTIS '
      + 'TERRITORIIS, NOMINE «SCOPIENSIS-PRISRIANENSIS» APPELLATUR ET SUFFRAGANEA «AD INSTAR '
      + 'ET AD TEMPUS» SEDIS METROPOLITANAE VRHBOSNENSIS SEU SERAJENSIS CONSTITUITUR.',
    note:
      'A change of title and boundaries, for which this registry mints no term: annexes '
      + 'the Montenegrin part of the Diocese of Skopje to the Archdiocese of Bar, unites the '
      + 'titular see of Prizren to Skopje with full right, renames the diocese '
      + 'Skopje-Prizren, makes it suffragan ad instar et ad tempus of Vrhbosna (Sarajevo) '
      + 'and raises a church in Prizren to concathedral: "...eandemque dioecesim Scopiensem, '
      + 'cui Sedem titulo Prisrianensem pleno iure unimus, nomine Scopiensem-Prisrianensem '
      + 'in posterum appellari volumus et suffraganeam ad instar et ad tempus Sedis '
      + 'Metropolitanae Vrhbosnensis seu Serajensis constituimus...". No see is erected or '
      + 'raised; the CONSTITUITUR of the argumentum makes a suffragan, which is why the '
      + 'curation script proposed an erection.',
  },
};
