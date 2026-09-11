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
 */
export const ERECTION_IDIOMS =
  /CONDITUR|CONDUNTUR|ERIGITUR|ERIGUNTUR|CONSTITUITUR|CONSTITUUNTUR|EXCITATUR|EFFICITUR|CREATUR|NOVA FIT|FORMAM REDIG|FORMATUR|FORMANTUR/i;
export const ELEVATION_IDIOMS =
  /EVEHITUR|EVEHUNTUR|ELEVATUR|PERDUCITUR|ATTOLLITUR|ATTOLITUR|EXTOLLITUR|AD (?:GRADUM|DIGNITATEM|EPARCHIAE|APOSTOLICI)|IN ORDINEM (?:ARCHI)?DIOECESIUM/i;
export const UNION_IDIOMS =
  /DE UNIONE|UNIONE|UNIUNTUR|UNITUR|CONIUNG|AEQUE PRINCIPALITER|DISMEMBRATIONE/i;

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
};
