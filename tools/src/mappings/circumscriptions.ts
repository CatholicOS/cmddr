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
      + 'dioecesim constituimus, ex urbe Tezpurensern appellandam...". The body prints '
      + '"Tezpurensern", as quoted.',
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
      + 'gradum atque dignitatem metropolitana e Sedis evehatur, novo indito nomine '
      + 'Munhallensi Ruthenorum...". The body prints "metropolitana e Sedis", as quoted. The '
      + 'province is what the argumentum states, so this is an erection under the John XXIII '
      + 'rule.',
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
      + 'others: "...Quattuor in regione quam diximus dioeceses condimus, Opoliensem, '
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
  // The fifth curation instalment (Task 6), and the last: the entire John Paul II
  // apostolic-constitutions candidate queue (390 candidates, 1978-10-28 through 2005-04-01),
  // each read against its own Latin text on vatican.va. 317 confirmed below as erections; the
  // other 73 sit in the tables below -- 59 elevations, 5 unions, and 9 adjudications (two
  // chapters of canons and one restored, a second title added to Leiria, an eparchy's
  // jurisdiction extended over a whole country, Bari's province recognised and Trani's
  // suppressed, Pinsk's boundaries redrawn, and one transfer of suffragans between Kaunas
  // and Vilnius decreed twice, once from each side). Sixty-one of the 317 erect an
  // ecclesiastical province rather than a see, most raising the see at their head in the
  // same breath: the province is what each argumentum leads with, so each is an erection
  // under the John XXIII rule above, which also files fourteen rows the curation script
  // proposed as elevations or unions ('Cascavellensis', 'Mobilensis' -- whose SEIUNGITUR the
  // union idiom IUNGITUR matches inside -- 'Belogradensis', 'Matritensis', 'Lahorensis',
  // 'Emeritensis Augustana-Pacensis', 'Cassoviensis', 'Corensis', 'Bobodiulassensis',
  // 'Kupelaënsis', 'Kumasiensis', 'Barcinonensis', 'Villavicentiensis', and 'Sanggauensis',
  // where the extinctive union of a prefecture with a deanery is the vehicle of the new
  // diocese and no existing see survives it). Ten rows state a diocese, vicariate,
  // administration or province CONDITUR or CONSTITUITUR while their body raises an existing
  // circumscription ('Monroviensis', 'Kisumuensis', 'Berolinensis', 'Gorlicensis',
  // 'Bonaventurensis', 'Tibuensis', 'Tumacoënsis', 'Moscoviensis Matris Dei', 'Bruneiensis'
  // of 2004, 'Usbekistaniae'): the argumentum governs the table (Ruling 9) and each note
  // records the body's clause. The curation script abstained on twenty-two. Two print a
  // lower-case letter inside the capitalised toponym ('IANAUBENSlS', 'PREMISLIENSIS-
  // VARSAVIENSIS ritus BYZANTINI UCRAINORUM'), so the case-delimited reader stopped, and each
  // is quoted by hand as printed; the other twenty state their act with no listed idiom
  // (RESTITUITUR, ADDITUR, DISSOLVITUR, REDIGUNTUR, RECOGNITIO, DEFINITUR, SEIUNGUNTUR,
  // AMPLIFICATUR, INSTITUITUR, a misprinted verb, an elevation in an unlisted word order,
  // or no verb at all where the page drops or cuts a line of its heading) and were read from
  // the body. Every argumentum is verbatim as extracted, the page's own misprints kept and
  // named in the note ('ARCHIIODECESI', 'VOCTORIENSIS', 'BYZANTIBI', 'BELLOMONTESI',
  // 'CONSTITUTITUR', 'CONTITUITUR', 'CONSTITUIITUR'...); one row ('Vratislaviensis-
  // Gedanensis') drops the body's opening quotation mark the reader carried into the
  // heading, and its note says so.
  'john-paul-ii|batteriensis|1978-10-28': {
    argumentum:
      'BATTERIENSIS* QUIBUSDAM LOCIS AB EPARCHIA TIRUVALLENSI DETRACTIS NOVA CONDITUR EPARCHIA '
      + 'NOMINE BATTERIENSIS, IN INDIA',
    note:
      'Detaches the civil districts of Malappuram, Kozhikode, Cannanore, Nilgiris, Mysore, '
      + 'Coorg, Mandya, Hassan, South Canara, Chikmagalur and Shimoga from the Syro-Malankara '
      + 'Eparchy of Tiruvalla and erects the new Eparchy of Bathery (India), suffragan to '
      + 'Trivandrum, confirming what Paul VI had decided and John Paul I confirmed: "...dehinc '
      + 'ab Eparchia Tiruvallensi seiunctis, condatur nova Eparchia Batteriensis nuncupanda, '
      + 'cuius sedes erit in ipsa urbe Battery...".',
  },
  'john-paul-ii|itabunensis|1978-11-07': {
    argumentum:
      'ITABUNENSIS* IN BRASILIAE FINIBUS NOVA DIOECESIS CONDITUR ITABUNENSIS NOMINE, DETRACTIS '
      + 'NONNULLIS TERRITORIIS AB ECCLESIA ILHEOSENSI',
    note:
      'Detaches eighteen municipalities (Itabuna, Ibicarai, Floresta Azul, Santa Cruz da '
      + 'Vitoria, Firmino Alves, Itororo, Itape, Buerarema, Itaju do Colonia, Una, Camaca, Pau '
      + 'Brasil, Mascote, Canavieras, Potiragua, Itapebi, Itagimirim, Belmonte) from the Diocese '
      + 'of Ilheus (Brazil) and erects the new Diocese of Itabuna, suffragan to Sao Salvador da '
      + 'Bahia: "...quibus profecto novam dioecesim condimus, cuius templum cathedrale illud '
      + 'erit quod est S. Ioseph dicatum in urbe Itabuna...".',
  },
  'john-paul-ii|tandagensis|1978-12-09': {
    argumentum:
      'TANDAGENSIS* QUIBUSDAM DETRACTIS TERRITORIIS A DIOECESI SURIGENSI, DIOECESIS '
      + 'TANDAGENSIS IN INSULIS PHILIPPINIS CONDITUR',
    note:
      'Ratifies the erection Paul VI had decreed on 16 June 1978 but died before promulgating: '
      + 'detaches the civil province of Surigao del Sur from the Diocese of Surigao '
      + '(Philippines) and erects the new Diocese of Tandag, suffragan to Cagayan de Oro: "...a '
      + 'dioecesi Surigensi territorium separavit civilis regionis vulgo « Surigao del Sur» '
      + 'nuncupatae eoque novam constituit dioecesim Tandagensem appellandam...".',
  },
  'john-paul-ii|holguinensis|1979-01-08': {
    argumentum:
      'HOLGUINENSIS* DETRACTIS QUIBUSDAM TERRITORIIS AB ARCHIDIOECESI S. IACOBI IN CUBA, NOVA '
      + 'CONDITUR DIOECESIS, «HOLGUINENSIS» APPELLANDA',
    note:
      'Detaches the civil province of Holguin and six municipalities of Las Tunas (Jobabo, '
      + 'Majibacoa, Manati, Menendez, Puerto Padre, Tunas) from the Archdiocese of Santiago de '
      + 'Cuba and erects the new Diocese of Holguin, suffragan to Santiago de Cuba: "...quibus '
      + 'novam dioecesim condimus, Holguinensem appellandam...".',
  },
  'john-paul-ii|tuxtepecensis|1979-01-08': {
    argumentum:
      'TUXTEPECENSIS* QUIBUSDAM LOCIS AB ARCHIDIOECESI ANTEQUERENSI DISTRACTIS, NOVA CONDITUR '
      + 'IN MEXICO DIOECESIS NOMINE «TUXTEPECENSIS»',
    note:
      'Detaches the fourteen municipalities of the civil district of Tuxtepec and two of the '
      + 'district of Cuicatlan (Sochiapan, Tlacoatzintepec) from the Archdiocese of Antequera '
      + '(Oaxaca) and erects the new Diocese of Tuxtepec (Mexico), suffragan to Antequera: '
      + '"...sedecim omnino municipiis lege civili circumscriptis novam condimus dioecesim '
      + 'Tuxtepecensem cognominandam et archidioecesi Antequerensi suffraganeam...".',
  },
  'john-paul-ii|cuautitlanensis|1979-02-05': {
    argumentum:
      'CUAUTITLANENSIS* QUIBUSDAM LOCIS A TLALNEPANTLENSI ALIISQUE A TEXCOCENSI DIOECESI '
      + 'DISTRACTIS, NOVA CONDITUR DIOECESIS NOMINE CUAUTITLANENSIS, IN MEXICO',
    note:
      'Detaches eleven municipalities from the Diocese of Tlalnepantla and eight from the '
      + 'Diocese of Texcoco and erects the new Diocese of Cuautitlan (Mexico), suffragan to '
      + 'Mexico City: "...undeviginti omnino municipiis nominatim descriptis legeque civili '
      + 'definitis novam condimus dioecesim Cuautitlanensem nuncupandam et archidioecesi '
      + 'Mexicanae suffraganeam...".',
  },
  'john-paul-ii|netzahualcoyotlensis|1979-02-05': {
    argumentum:
      'NETZAHUALCOYOTLENSIS* QUIBUSDAM LOCIS A TEXCOCENSI DIOECESI DISTRACTIS, NOVA ERIGITUR '
      + 'DIOECESIS NETZAHUALCOYOTLENSIS, IN MEXICO',
    note:
      'Detaches fifteen municipalities (Amecameca, Chalco, Ixtapaluca, Netzahualcoyotl and '
      + 'others) from the Diocese of Texcoco and erects the new Diocese of Netzahualcoyotl '
      + '(Mexico), suffragan to Mexico City: "...novam condimus dioecesim Netzahualcoyotlensem '
      + 'nuncupandam et Archidioecesi Mexicanae suffraganeam...".',
  },
  'john-paul-ii|irecensis|1979-04-28': {
    argumentum:
      'IRECENSIS* DETRACTIS QUIBUSDAM TERRITORIIS A DIOECESIBUS RUIBARBOSENSI ET BARRENSI, IN '
      + 'BRASILIA DIOECESIS IRECENSIS CONSTITUITUR',
    note:
      'Detaches ten municipalities from the Diocese of Rui Barbosa and five from the Diocese '
      + 'of Barra (Brazil) and erects the new Diocese of Irece, suffragan to Sao Salvador da '
      + 'Bahia: "...quibus omnibus terris novam dioecesim condimus, Irecensem appellandam...".',
  },
  'john-paul-ii|barreriensis|1979-05-21': {
    argumentum:
      'BARRERIENSIS* NONNULLIS TERRITORIIS A DIOECESI BARRENSI DETRACTIS NOVA ECCLESIA '
      + 'CONDITUR, NOMINE BARRERIENSIS',
    note:
      'Detaches twelve municipalities (Angical, Baianopolis, Barreiras, Brejolandia, '
      + 'Catolandia, Cotegipe, Cristopolis, Formosa do Rio Preto, Riachao das Neves, Santa Rita '
      + 'de Cassia, Sao Desiderio, Tabocas do Brejo Velho) from the Diocese of Barra (Brazil) '
      + 'and erects the new Diocese of Barreiras, suffragan to Sao Salvador da Bahia: "...atque '
      + 'ex iis dioecesim condimus Barreriensem appellandam...".',
  },
  'john-paul-ii|rurkelaensis|1979-07-04': {
    argumentum:
      'RURKELAËNSIS* CIVILI REGIONE VULGO «SUNDARGARH» A DIOECESI SAMBALPURENSI DISTRACTA, '
      + 'NOVA CONDITUR IN INDIA DIOECESIS NOMINE «RURKELAËNSIS»',
    note:
      'Detaches the civil district of Sundargarh from the Diocese of Sambalpur and erects the '
      + 'new Diocese of Rourkela (India), suffragan to Cuttack-Bhubaneswar: "...A dioecesi '
      + 'Sambalpurensi civilem regionem « Sundargarh » seiungimus eademque novam erigimus '
      + 'dioecesim nomine Rurkelaënsem...".',
  },
  'john-paul-ii|cascavellensis|1979-10-16': {
    argumentum:
      'CASCAVELLENSIS* QUIBUSDAM TERRITORIIS E PROVINCIA ECCLESIASTICA CURITIBENSI DETRACTIS '
      + 'NOVA ECCLESIASTICA PROVINCIA«CASCAVELLENSIS» CONSTITUITUR CUIUS SEDES EODEM NOMINE '
      + 'VOCATA AD METROPOLITANAE DIGNITATEM EVEHITUR',
    note:
      'Separates the Diocese of Cascavel and the Dioceses of Foz do Iguacu, Palmas and Toledo '
      + '(Brazil) from the province of Curitiba and erects the new ecclesiastical province of '
      + 'Cascavel, raising Cascavel to a metropolitan see at its head: "...Cascavellensem '
      + 'dioecesim ab ecclesiastica provincia Curitibensi seiungimus et ad dignitatem '
      + 'metropolitanae Sedis evehimus...Modo conditam provinciam archidioecesis ipsa '
      + 'Cascavellensis tamquam Sedes metropolitana constituet...". The province constituted is '
      + 'what the argumentum leads with, so this is an erection; the curation script proposed an '
      + 'elevation on the EVEHITUR of its second clause. The heading prints '
      + '"PROVINCIA«CASCAVELLENSIS»" without a space, as quoted.',
  },
  'john-paul-ii|maringaensis|1979-10-16': {
    argumentum:
      'MARINGAËNSIS* IN BRASILIA NOVA PROVINCIA ECCLESIASTICA CONDITUR, MARINGAËNSIS '
      + 'COGNOMINANDA',
    note:
      'Separates the Diocese of Maringa from the province of Londrina (Brazil), raises it to a '
      + 'metropolitan see and erects the new ecclesiastical province of Maringa with Campo '
      + 'Mourao, Paranavai and Umuarama as suffragans: "...Maringaënsem dioecesim a Provincia '
      + 'ecclesiastica Londrinensi separamus, eamque in metropolitanis Ecclesiis '
      + 'annumeramus...Novam autem Provinciam constituent : ipsa Sedes Maringaënsis, atque '
      + 'dioeceses Campi Moranensis, Paranavaiensis et Umuaramensis...".',
  },
  'john-paul-ii|belfortiensis-montis-beligardi|1979-11-03': {
    argumentum:
      'BELFORTIENSIS-MONTIS BELIGARDI* NONNULLIS DETRACTIS TERRITORIIS AB ARCHIIODECESI '
      + 'BISUNTINA, NOVA DIOECESIS CONDITUR, BELFORTIENSIS-MONTIS BELIGARDI NOMINE',
    note:
      'Detaches the Territoire de Belfort, the Pays de Montbeliard (part of the Doubs) and the '
      + 'canton of Hericourt with the commune of Chalonvillars from the Archdiocese of Besancon '
      + 'and erects the new Diocese of Belfort-Montbeliard (France), suffragan to Besancon: '
      + '"...quibus terris simul sumptis novam dioecesim constituimus, Belfortiensem-Montis '
      + 'Beligardi cognominandam, cuius sedem in urbe Belfort ponimus...". The heading prints '
      + '"ARCHIIODECESI", as quoted.',
  },
  'john-paul-ii|cotabatensis|1979-11-05': {
    argumentum:
      'COTABATENSIS* NOVA PROVINCIA ECCLESIASTICA IN INSULIS PHILIPPINIS CONDITUR, NOMINE '
      + 'COTABATENSIS',
    note:
      'Separates the Diocese of Cotabato and the Prelatures of Marbel and Kidapawan from the '
      + 'province of Davao (Philippines), raises Cotabato to a metropolitan see and erects the '
      + 'new ecclesiastical province of Cotabato: "...Cotabatensem dioecesim a provincia '
      + 'ecclesiastica Davaënsi seiungimus atque ad dignitatem metropolitanae Ecclesiae '
      + 'tollimus...Nova ergo ecclesiastica provincia hisce circumscriptionibus constabit : '
      + 'Cotabatensi tamquam metropolitana sede, tamquam vero suffraganeis praelaturis '
      + 'Marbeliana et Kidapavanensi...".',
  },
  'john-paul-ii|digosensis|1979-11-05': {
    argumentum:
      'DIGOSENSIS* CIVILI REGIONE VULGO «DAVAO DEL SUR» AB ARCHIDIOECESI DAVAËNSI DISTRACTA '
      + 'CONDITUR NOVA DIOECESIS NOMINE «DIGOSENSIS»',
    note:
      'Detaches the civil province of Davao del Sur from the Archdiocese of Davao '
      + '(Philippines) and erects the new Diocese of Digos, suffragan to Davao: "...iisdemque '
      + 'ita seiunctis novam condimus dioecesim Digosensem cognominandam ipsique Ecclesiae '
      + 'Davaënsi suffraganeam...".',
  },
  'john-paul-ii|assidonensis-jerezensis|1980-03-03': {
    argumentum:
      'ASSIDONENSIS-JEREZENSIS* QUIBUSDAM LOCIS AB ECCLESIA HISPALENSI ALIISQUE A DIOECESI '
      + 'GADICENSI SEPARATIS NOVA CONDITUR DIOECESIS NOMINE ASSIDONENSIS-JEREZENSIS',
    note:
      'Detaches twenty-five municipalities (Jerez de la Frontera, Arcos de la Frontera, '
      + 'Sanlucar de Barrameda, Puerto de Santa Maria, Rota, Chipiona, Olvera and others) from '
      + 'the Archdiocese of Seville and the villages of La Ina and Torrecera with the southern '
      + 'part of Arcos from the Diocese of Cadiz, and erects the new Diocese of Asidonia-Jerez '
      + '(Spain), suffragan to Seville: "...ex omnibusque simul sumptis locis, quae diximus, '
      + 'novam dioecesim Assidonensem-Jerezensem appellandam...condimus.".',
  },
  'john-paul-ii|hamiltonensis-in-nova-zelandia|1980-03-06': {
    argumentum:
      'HAMILTONENSIS IN NOVA ZELANDIA* IN NOVA ZELANDIA DIOECESIS CONDITUR HAMILTONENSIS IN '
      + 'NOVA ZELANDIA COGNOMINE',
    note:
      'Detaches fifteen counties (Raglan, Waipa, Otorohanga, Taumarunui, Ohinemuri, Piako, '
      + 'Matamata, Tauranga, Rotorua, Taupo, Opotiki, Waiapu, Waikohu, Cook, most of Waikato) '
      + 'and the districts of Whakatane and Waitomo from the Diocese of Auckland and erects the '
      + 'new Diocese of Hamilton in New Zealand, suffragan to Wellington: "...a dioecesi '
      + 'Aucopolitana separamus, quibns novam dioecesim condimus, ab nomine Hamilton '
      + 'Hamiltonensem in Nova Zelandia cognominandam...".',
  },
  'john-paul-ii|mekiensis|1980-03-06': {
    argumentum:
      'MEKIENSIS* IN AETHIOPIA NOVA CONSTITUITUR PRAEFECTURA APOSTOLICA NOMINE MEKIENSIS',
    note:
      'Detaches the regions of Arssi and Bale and the sub-province of Butajira-Haigotch from '
      + 'the Apostolic Vicariate of Harar and erects the new Apostolic Prefecture of Meki '
      + '(Ethiopia), entrusted to the Consolata Missionaries: "...iisque Praefecturam '
      + 'Apostolicam condimus Mekiensem appellandam.".',
  },
  'john-paul-ii|muzaffarpurensis|1980-03-06': {
    argumentum:
      'MUZAFFARPURENSIS* EX INTEGRO NOVA DIOECESI MUZAFFARPURENSIS EXCITATUR IN INDIA LOCIS '
      + 'QUIBUSDAMDETRACTIS A DIOECESI PATNENSI',
    note:
      'Detaches thirteen civil districts (West and East Champaran, Gopalganj, Siwan, Saran, '
      + 'Vaishali, Muzaffarpur, Sitamarhi, Madhubani, Darbhanga, Samastipur, Saharsa, Begusarai) '
      + 'from the Diocese of Patna and erects the new Diocese of Muzaffarpur (India), suffragan '
      + 'to Ranchi: "...proindeque coniungantur in novam dioecesim deinceps nuncupandam '
      + 'Muzaffarpurensem...". The heading prints "QUIBUSDAMDETRACTIS" without a space, as '
      + 'quoted.',
  },
  'john-paul-ii|platensis-et-maris-platensis-chascomusensis|1980-03-07': {
    argumentum:
      'PLATENSIS ET MARIS PLATENSIS (CHASCOMUSENSIS)* IN ARGENTINA, NONNULLIS DETRACTIS AB '
      + 'ECCLESIIS PLATENSI ET MARIS PLATENSIS TERRITORIIS, NOVA CONDITUR DIOECESIS '
      + 'CHASCOMUSENSIS',
    note:
      'Detaches nine partidos (Chascomus, Coronel Brandsen, Castelli, Dolores, General '
      + 'Belgrano, General Guido, General Paz, Monte, Pila) from the Archdiocese of La Plata and '
      + 'three (General Conesa, General Lavalle, Maipu) from the Diocese of Mar del Plata and '
      + 'erects the new Diocese of Chascomus (Argentina), suffragan to La Plata: "...e quibus '
      + 'omnibus terris novam condimus dioecesim Chascomusensem appellandam...".',
  },
  'john-paul-ii|imphalensis|1980-03-13': {
    argumentum:
      'IMPHALENSIS* DIOECESIS KOHIMAENSIS-IMPHALENSIS DIVIDITUR ET NOVA ERIGITUR DIOECESIS '
      + 'IMPHALENSIS',
    note:
      'Detaches the State of Manipur from the Diocese of Kohima-Imphal (India) and erects the '
      + 'new Diocese of Imphal, suffragan to Shillong-Gauhati; the mother see becomes simply '
      + 'Kohima, seated at Kohima instead of Dimapur: "...civile territorium, vulgo « Manipur» '
      + 'appellatum, a finibus dioecesis Kohimaensis-Imphalensis distrahimus et in novam '
      + 'dioecesim Imphalensem denominatam...erigimus...".',
  },
  'john-paul-ii|hallamensis|1980-05-30': {
    argumentum:
      'HALLAMENSIS* DETRACTIS NONNULLIS TERRITORIIS AB ECCLESIIS LOIDENSI ET NOTTINGHAMENSI '
      + 'QUAE SUNT IN MAGNA BRITANNIA, NOVA DIOECESIS CONDITUR HALLAMENSIS COGNOMINANDA',
    note:
      'Detaches the metropolitan county of South Yorkshire from the Diocese of Leeds and, from '
      + 'the Diocese of Nottingham, two Sheffield parishes, the district of Bassetlaw and seven '
      + 'Derbyshire places (Bamford, Chesterfield, Clowne, Dronfield, Eckington, Hathersage, '
      + 'Staveley), and erects the new Diocese of Hallam (England), seated at Sheffield and '
      + 'suffragan to Liverpool: "...Quibus terris novam dioecesim constituimus, Hallamensem '
      + 'appellandam.". The page prints the county as "Metropolitan County of Smith Yorkshire".',
  },
  'john-paul-ii|beniaminacevalensis|1980-06-12': {
    argumentum:
      'BENIAMINACEVALENSIS* QUIBUSDAM LOCIS A VICARIATU APOSTOLICO CIACHENSI IN PARAQUARIA '
      + 'NATIONE ALIISQUE A PILCOMAYOENSI DISTRACTIS NOVA CONDITUR DIOECESIS NOMINE '
      + 'BENIAMINACEVALENSIS',
    note:
      'Detaches territory bounded by the Pilcomayo, Paraguay and Verde rivers from the '
      + 'Apostolic Vicariates of Chaco Paraguayo and Pilcomayo and erects the new Diocese of '
      + 'Benjamin Aceval (Paraguay), suffragan to Asuncion: "...novam constituimus dioecesim '
      + 'Beniaminacevalensem appellandam, eamdemque suffraganeam Ecclesiae Sanctissimae '
      + 'Assumptionis...".',
  },
  'john-paul-ii|mobilensis|1980-07-13': {
    argumentum:
      'MOBILENSIS* NOVA PROVINCIA ECCLESIASTICA NOMINE MOBILENSIS CONSTITUITUR UNOQUE TEMPORE '
      + 'ECCLESIA MOBILENSIS ET A PROVINCIA ECCLESIASTICA NOVAE AURELIAE SEIUNGITUR ET AD GRADUM '
      + 'ARCHIEPISCOPALIS SEDIS METROPOLITANAE EVEHITUR',
    note:
      'Separates the Diocese of Mobile and the Dioceses of Biloxi, Birmingham and Jackson from '
      + 'the province of New Orleans, raises Mobile to a metropolitan see and erects the new '
      + 'ecclesiastical province of Mobile (United States): "...Dioecesim Mobilensem a Provincia '
      + 'Ecclesiastica Novae Aureliae seiungimus et ad dignitatem Metropolitanae Ecclesiae '
      + 'attollimus...Novam praeterea ecclesiasticam Provinciam istic condimus « Mobilensem » '
      + 'cognominandam...". The province constituted is what the argumentum leads with, so this '
      + 'is an erection; the curation script proposed a union only because the union idiom '
      + 'IUNGITUR matches inside SEIUNGITUR.',
  },
  'john-paul-ii|caxiensis|1980-10-11': {
    argumentum:
      'CAXIENSIS* IN BRASILIA NOVA DIOECESIS CAXIENSIS CONSTITUITUR',
    note:
      'Detaches the municipality of Duque de Caxias from the Diocese of Petropolis and Sao '
      + 'Joao de Meriti from the Diocese of Nova Iguacu (Brazil) and erects the new Diocese of '
      + 'Duque de Caxias, suffragan to Sao Sebastiao do Rio de Janeiro: "...ex iisque novam '
      + 'dioecesim creamus : cuius sedem ponimus in urbe Duque de Caxias...Ceterum Sedes '
      + 'Caxiensis appellabitur.".',
  },
  'john-paul-ii|guarabirensis|1980-10-11': {
    argumentum:
      'GUARABIREN* QUIBUSDAM DEMPTIS TERRITORIIS A DIOECESI PARAHYBENSI, NOVA IN BRASILIA '
      + 'DIOECESIS CONDITUR NOMINE GUARABIRENSIS',
    note:
      'Detaches twenty-three municipalities (Guarabira, Alagoinha, Aracagi, Arara, Araruna, '
      + 'Bananeiras, Belem and others) from the Archdiocese of Paraiba and erects the new '
      + 'Diocese of Guarabira (Brazil), suffragan to Paraiba: "...ex quibus ita seiunctis novam '
      + 'iure condimus dicionem ecclesiasticam posthac nempe Guarabirensem nuncupandam '
      + 'habendamque suffraganeam Metropolitanae Ecclesiae Parahybensi...". The heading '
      + 'abbreviates the toponym to "GUARABIREN", as quoted.',
  },
  'john-paul-ii|sorotiensis|1980-11-13': {
    argumentum:
      'SOROTIENSIS* QUIBUSDAM TERRITORIIS AB ECCLESIA TOROROËNSI IN UGANDA DETRACTIS, NOVA '
      + 'CONDITUR DIOECESIS SOROTIENSIS NOMINE',
    note:
      'Detaches the civil districts of Soroti and Kumi from the Diocese of Tororo and erects '
      + 'the new Diocese of Soroti (Uganda), suffragan to Kampala: "...separamus hisque novam '
      + 'condimus dioecesim Sorotiensem appellandam...".',
  },
  'john-paul-ii|ipilensis|1980-12-24': {
    argumentum:
      'IPILENSIS* IN INSULIS PHILIPPINIS NOVA CONDITUR PRAELATURA COGNOMINE IPILENSIS',
    note:
      'Detaches nine parishes (Alicia, Buug, Ipil, Kabasalan, Mabuhay, Malangas, Margosatubig, '
      + 'Siay, Subanipa) from the Archdiocese of Zamboanga and erects the new Prelature of Ipil '
      + '(Philippines), suffragan to Zamboanga: "...quibus terris novam Praelaturam condimus, '
      + 'Ipilensem nomine, cuius Sedem in urbe Ipil collocamus...".',
  },
  'john-paul-ii|mannarensis|1981-01-03': {
    argumentum:
      'MANNARENSIS* NONNULLIS DETRACTIS TERRITORIIS A DIOECESI IAFFNENSI IN TAPROBANE NOVA '
      + 'CONDITUR DIOECESIS «MANNARENSIS» NOMINE',
    note:
      'Detaches the civil districts of Mannar and Vavuniya from the Diocese of Jaffna and '
      + 'erects the new Diocese of Mannar (Sri Lanka), suffragan to Colombo: "...a dioecesi '
      + 'Iaffnensi distrahimus, eosque in novae dioecesis formam redigimus, « Mannarensis » '
      + 'cognominandae...".',
  },
  'john-paul-ii|okiguensis|1981-01-03': {
    argumentum:
      'OKIGUENSIS* IN NIGERIA NOVA CONSTITUITUR DIOECESIS, OKIGUENSIS NOMINE',
    note:
      'Detaches the local government areas of Etiti, Mbano, Okigwe and Isuikwuato from the '
      + 'Diocese of Umuahia and erects the new Diocese of Okigwe (Nigeria), suffragan to '
      + 'Onitsha: "...a dioecesi Umuahiaënsi distrahimus, in novamque dioecesis formam redigimus '
      + 'nomine Okiguensis...". The page prints the first district as "Ekiti".',
  },
  'john-paul-ii|guaruliensis|1981-01-30': {
    argumentum:
      'GUARULIENSIS* QUADAM PLAGA A DIOECESI CRUCISMOGIENSI DETRACTA NOVA CONDITUR DIOECESIS '
      + 'NOMINE GUARULIENSIS',
    note:
      'Detaches the municipality of Guarulhos from the Diocese of Mogi das Cruzes and erects '
      + 'the new Diocese of Guarulhos (Brazil), suffragan to Sao Paulo: "...ex iisque novam '
      + 'dioecesim Guaruliensem appellandam condimus iisdemque finibus circumscribimus talis '
      + 'municipii propriis...".',
  },
  'john-paul-ii|viridariensis|1981-01-30': {
    argumentum:
      'VIRIDARIENSIS* QUIBUSDAM DEMPTIS E CORUMBENSI DIOECESI IN BRASILIA LOCIS EX INTEGRO '
      + 'NOVA CONDITUR IBIDEM DIOECESIS VIRIDARIENSIS POSTHAC NUNCUPANDA',
    note:
      'Detaches ten municipalities (Jardim, Anastacio, Aquidauana, Bela Vista, Bonito, '
      + 'Caracol, Guia Lopes da Laguna, Miranda, Nioaque, Porto Murtinho) from the Diocese of '
      + 'Corumba and erects the new Diocese of Jardim (Brazil), suffragan to Campo Grande: '
      + '"...quibus ex sic locis seiunctis dioecesim condimus posthac scilicet Viridariensem '
      + 'appellandam...".',
  },
  'john-paul-ii|almenarensis|1981-03-13': {
    argumentum:
      'ALMENAREN* QUIBUSDAM LOCIS A DIOECESI ARASSUAHYENSI ALIISQUE AB ECCLESIA OTONIPOLITANA '
      + 'DISTRACTIS NOVA CONDITUR DIOECESIS NOMINE ALMENARENSIS',
    note:
      'Detaches twelve municipalities (Almenara, Bandeira, Felisburgo, Jacinto, Jequitinhonha, '
      + 'Joaima, Jordania, Rio do Prado, Rubim, Salto da Divisa, Santa Maria do Salto, Santo '
      + 'Antonio do Jacinto) from the Diocese of Aracuai and Fronteira dos Vales from the '
      + 'Diocese of Teofilo Otoni and erects the new Diocese of Almenara (Brazil), suffragan to '
      + 'Diamantina: "...Quibus locis ita distractis simul sumpti novam condimus dioecesim '
      + 'Almenarensem appellandam...". The heading abbreviates the toponym to "ALMENAREN", as '
      + 'quoted.',
  },
  'john-paul-ii|cyanguguensis|1981-11-05': {
    argumentum:
      'CYANGUGUENSIS* QUADAM PLAGA A DIOECESI NYUNDOËNSI NOVA IN RUANDA DIOECESIS CONDITUR '
      + 'NOMINE CYANGUGUENSIS',
    note:
      'Detaches the southern region, bounded by the civil prefecture of Cyangugu, from the '
      + 'Diocese of Nyundo and erects the new Diocese of Cyangugu (Rwanda), suffragan to Kigali: '
      + '"...A dioecesi Nyundoensi distrahimus australem regionem ex eaque novam dioecesim '
      + 'Cyanguguensem appellandam condimus...".',
  },
  'john-paul-ii|metuchensis|1981-11-21': {
    argumentum:
      'METUCHENSIS* DETRACTIS NONNULLIS TERRITORIIS E DIOECESI TRENTONENSI, NOVA CONDITUR '
      + 'DIOECESIS METUCHENSIS APPELLANDA',
    note:
      'Detaches the counties of Hunterdon, Middlesex, Somerset and Warren from the Diocese of '
      + 'Trenton and erects the new Diocese of Metuchen (New Jersey), suffragan to Newark: '
      + '"...quibus novam dioecesim constituimus Metuchensem appellandam, cuius sedes '
      + 'episcopalis ponetur in urbe Metuchen...".',
  },
  'john-paul-ii|vannaisensis-ritus-byzantini|1981-12-03': {
    argumentum:
      'VANNAISENSIS RITUS BYZANTINI* DETRACTIS QUIBUSDAM TERRITORIIS AB EPARCHIA PARMENSI '
      + 'RUTHENORUM, IN STATIBUS FOEDERATIS AMERICAE SEPTEMTRIONALIS EPARCHIA VANNAISENSIS RITUS '
      + 'BYZANTIBI CONSTITUITUR',
    note:
      'Detaches thirteen western states (Montana, Wyoming, Nevada, Colorado, New Mexico, '
      + 'Arizona, Utah, Idaho, Washington, Oregon, California, Hawaii, Alaska) from the '
      + 'Ruthenian Eparchy of Parma and erects the new Byzantine Eparchy of Van Nuys, suffragan '
      + 'to the Metropolitan Eparchy of Pittsburgh: "...ex quibus proinde locis et terris '
      + 'Eparchiam creamus ritus Byzantini novam ab urbe vulgaris nominis Van Nuys Vannaisensem '
      + 'in posterum nuncupandam.". The heading prints "BYZANTIBI", as quoted.',
  },
  'john-paul-ii|monroviensis|1981-12-21': {
    argumentum:
      'MONROVIENSIS* PROVINCIA ECCLESIASTICA IN LIBERIA CONSTITUITUR, EX ARCHIEPISCOPALI '
      + 'METROPOLITANA ECCLESIA MONROVIENSI ATQUE DIOECESI SUFFRAGANEA RESIDENTIALI CAPITIS '
      + 'PALMENSIS CONSTANTE',
    note:
      'Constitutes the ecclesiastical province of Liberia by raising the Apostolic Vicariate '
      + 'of Monrovia to a metropolitan archdiocese and the Apostolic Vicariate of Cape Palmas to '
      + 'a diocese, its suffragan: "...Vicariatum Apostolicum Monroviensem ad dignitatem '
      + 'evehimus Ecclesiae Archiepiscopalis-Metropolitanae, atque Vicariatum Apostolicum '
      + 'Capitis Palmensis ad dignitatem dioecesis, Monroviensi suffraganeae.". The province '
      + 'constituted is what the argumentum states (CONSTITUITUR), so this is an erection; the '
      + 'body works it by raising the two vicariates (Ruling 9).',
  },
  'john-paul-ii|sinopensis|1982-02-06': {
    argumentum:
      'SINOPENSIS* IN BRASILIA QUIBUSDAM DETRACTIS A DIOECESI ADAMANTAE LOCIS, NOVA CONDITUR '
      + 'SINOPENSIS NOMINE',
    note:
      'Detaches the parishes of Sinop, Alta Floresta, Colider, Paranatinga, Porto dos Gauchos '
      + 'and Vera from the Diocese of Diamantino and erects the new Diocese of Sinop (Brazil), '
      + 'suffragan to Cuiaba: "...atque ex ita detractis locis novam dioecesim condimus '
      + 'Sinopensem appellandam...".',
  },
  'john-paul-ii|barragartiensis|1982-02-27': {
    argumentum:
      'BARRAGARTIENSIS* QUIBUSDAM LOCIS A DIOECESI GUIRATINGENSI DETRACTIS NOVA CONDITUR',
    note:
      'Detaches the municipalities of Barra do Garcas, Agua Boa, Canarana, General Carneiro '
      + 'and Nova Xavantina from the Diocese of Guiratinga and erects the new Diocese of Barra '
      + 'do Garcas (Brazil), suffragan to Cuiaba: "...novam condimus dioecesim Barragartiensem '
      + 'appellandam, quae ipsa suffraganea erit Ecclesiae Cuiabensi...". The heading names no '
      + 'new see, as quoted.',
  },
  'john-paul-ii|yaundensis-et-aliarum|1982-03-12': {
    argumentum:
      'YAUNDENSIS ET ALIARUM* QUATTUOR PROVINCIAE ECCLESIASTICAE CONSTITUUNTUR IN REPUBLICA '
      + 'CAMMARUNIENSI',
    note:
      'Constitutes four ecclesiastical provinces in Cameroon -- Yaounde (with Doume, Mbalmayo, '
      + 'Sangmelima, Bafia), Douala (Nkongsamba, Bafoussam), Garoua (Maroua-Mokolo, Yagoua) and '
      + 'Bamenda (Buea, and Kumbo erected the same day) -- raising the bishops of the four '
      + 'metropolitan sees to archbishops: "...Quattuor erunt deinceps in Republica '
      + 'Cammaruniensi ecclesiasticae provinciae...Qui hactenus autem Ecclesiis praeerant, quae '
      + 'sunt metropolitanae hasce per Litteras Apostolicas constitutae, eos ad archiepiscopalem '
      + 'dignitatem evehimus.".',
  },
  'john-paul-ii|kumboensis|1982-03-18': {
    argumentum:
      'KUMBOËNSIS* DETRACTA PARTE SEPTEMTRIONALI TERRITORII DIOECESIS BAMENDANAE IN '
      + 'CAMMARUNIENSI REPUBLICA, NOVA CONSTITUITUR CATHEDRALIS SEDES, NOMINE «KUMBOËNSIS»',
    note:
      'Detaches the northern part of the Diocese of Bamenda (the civil divisions of '
      + 'Donga-Mantung and Bui) and erects the new Diocese of Kumbo (Cameroon), suffragan to '
      + 'Bamenda, raised to metropolitan rank the same week: "...A dioecesi Bamendana partem '
      + 'septemtrionalem distrahimus eaque novam constituimus dioecesim a civitate eiusdem '
      + 'regionis principe vulgo « Kumbo » Kumboënsem appellandam...".',
  },
  'john-paul-ii|victoriensis-in-texia|1982-04-13': {
    argumentum:
      'VICTORIENSIS IN TEXIA* QUIBUSDAM LOCIS AB ARCHIDIOECESI S. ANTONII ALIISQUE A '
      + 'GALVESTONIENSI-HOUSTONIENSI ECCLESIA NECNON A DIOECESI CORPORIS CHRISTI RELIQUIS '
      + 'DETRACTIS NOVA CONDITUR ECCLESIA NOMINE VOCTORIENSIS IN TEXIA',
    note:
      'Detaches the counties of Calhoun, Colorado, DeWitt, Fayette, Jackson, Lavaca, Victoria '
      + 'and the western parts of Matagorda and Wharton from the Archdiocese of San Antonio, the '
      + 'eastern parts of Matagorda and Wharton from Galveston-Houston, and Goliad county from '
      + 'Corpus Christi, and erects the new Diocese of Victoria in Texas, suffragan to San '
      + 'Antonio: "...Quibus ipsis ita descriptis locis simul sumptis novam constituimus '
      + 'dioecesim nomine Victoriensis in Texia...". The heading prints "VOCTORIENSIS", as '
      + 'quoted.',
  },
  'john-paul-ii|sanggauensis|1982-06-08': {
    argumentum:
      'SANGGAUENSIS* SEKADAUENSI HUCUSQUE PRAEFECTURA APOSTOLICA «UNIONE EXSTINCTIVA» DEHINC '
      + 'CONIUNCTA CUM SANGGAUENSI VICARIATU FORANEO I.E. DECANATU AB ARCHIDIOECESI '
      + 'PONTIANAKENSI DISTRACTO NOVA IN INDONESIA CONDITUR DIOECESIS NOMINE SANGGAUENSIS',
    note:
      'Suppresses the Apostolic Prefecture of Sekadau (Indonesia), erected by Paul VI in 1968, '
      + 'detaches the deanery of Sanggau (the civil regency of Sanggau) from the Archdiocese of '
      + 'Pontianak and, from both together, erects the new Diocese of Sanggau, suffragan to '
      + 'Pontianak: "...Sekadauensis exstinguatur Praefectura Apostolica ut talis...Quibus '
      + 'omnibus una cum Sekadauensi olim Praefectura Apostolica simul sumptis novam condimus '
      + 'Ecclesiam Sanggauensem appellandam...". The act the argumentum states is the new '
      + 'diocese CONDITUR; the extinctive union of the prefecture with a deanery is its vehicle '
      + 'and no existing see survives it, so this is an erection, not a union of sees -- the '
      + 'curation script proposed a union on UNIONE and CONIUNCTA.',
  },
  'john-paul-ii|yopugonensis|1982-06-08': {
    argumentum:
      'YOPUGONEN.* QUIBUSDAM DETRACTIS AB ARCHIDIOECESI ABIDIANENSI NOVA CONDITUR DIOECESIS '
      + 'NOMINE YOPUGONENSIS',
    note:
      'Detaches the western and northern districts of the Archdiocese of Abidjan (the city of '
      + 'Yopougon and the civil regions of Agboville, Adzope, Tiassale, Sikensi, Dabou and '
      + 'Jacqueville) and erects the new Diocese of Yopougon (Ivory Coast), suffragan to '
      + 'Abidjan: "...quibus novam dioecesim condimus Yopugonensem nomine...". The heading '
      + 'abbreviates the toponym to "YOPUGONEN.", as quoted.',
  },
  'john-paul-ii|cruciensis|1982-08-17': {
    argumentum:
      'CRUCIENSIS* DETRACTIS NONNULLIS TERRITORIIS AB ARCHIDIOECESI S.FIDEI IN AMERICA '
      + 'SEPTEMTRIONALI ET A DIOECESI ELPASENSI, MUTATISQUE FINIBUS, NOVA CONSTITUITUR DIOECESIS '
      + 'CRUCIENSIS',
    note:
      'Detaches the counties of Chaves, Lincoln and Sierra from the Archdiocese of Santa Fe '
      + 'and Dona Ana, Eddy, Grant, Hidalgo, Lea, Luna and Otero from the Diocese of El Paso and '
      + 'erects the new Diocese of Las Cruces (New Mexico), suffragan to Santa Fe: "...atque his '
      + 'distractis territoriis novam condimus dioecesim Cruciensem appellandam, quae iisdem '
      + 'limitabitur finibus, quibus decem nuper memorati « Comitatus »...".',
  },
  'john-paul-ii|toritensis|1983-05-02': {
    argumentum:
      'TORITENSIS* DETRACTIS NONNULLIS TERRITORIIS A METROPOLITANA ECCLESIA IUBAËNSI, NOVA '
      + 'CONDITUR DIOECESIS TORITENSIS APPELLANDA',
    note:
      'Detaches the civil districts of Torit and Kapoeta from the Archdiocese of Juba and '
      + 'erects the new Diocese of Torit (Sudan), suffragan to Juba: "...ex iisque novam '
      + 'condimus dioecesim Toritensem appellandam, quam metropolitanae Ecclesiae Iubaënsi '
      + 'subicimus...".',
  },
  'john-paul-ii|kahamaensis|1983-11-11': {
    argumentum:
      'KAHAMAËNSIS* IN TANZANIA CONSTITUITUR NOVA DIOECESIS NOMINE KAHAMAËNSIS',
    note:
      'Detaches the region of Kahama from the Archdiocese of Tabora and erects the new Diocese '
      + 'of Kahama (Tanzania), suffragan to Tabora: "...ab archidioecesi Taboraënsi plagam vulgo '
      + '« Kahama » nuncupatam seiungimus ex eademque condimus novam dioecesim Kahamaënsem '
      + 'appellandam...".',
  },
  'john-paul-ii|diphuensis|1983-12-05': {
    argumentum:
      'DIPHUËNSIS* IN INDIA NOVA CONDITUR DIOECESIS NOMINE DIPHUËNSIS',
    note:
      'Detaches the civil district of Karbi Anglong from the Archdiocese of Shillong-Gauhati '
      + 'and North Cachar Hills from the Diocese of Silchar and erects the new Diocese of Diphu '
      + '(India), suffragan to Shillong-Gauhati: "...iisque novam dioecesim nomine Diphuënsem '
      + 'condimus eamque archidioecesi Shillongensi-Gauhatinae suffraganeam subicimus.".',
  },
  'john-paul-ii|nkayiensis|1983-12-05': {
    argumentum:
      'NKAYENSIS* NONNULLIS TERRITORIIS DETRACTIS A DIOECESI DE POINTE NOIRE, NOVA '
      + 'CONSTITUITUR DIOECESIS NOMINE NKAYENSIS',
    note:
      'Detaches the eastern part of the Diocese of Pointe-Noire (the civil regions of Niari, '
      + 'Lekoumou and Bouenza) and erects the new Diocese of Nkayi (Congo), suffragan to '
      + 'Brazzaville: "...eamque in novae dioecesis formam redigimus, quae ab urbe principe '
      + 'regionis, Nkayiensis cognominabitur, atque archidioecesi Brazzapolitanae suffraganea '
      + 'erit.".',
  },
  'john-paul-ii|matiensis|1984-02-16': {
    argumentum:
      'MATIENSIS* IN INSULIS PHILIPPINIS CIVILI PROVINCIA «DAVAO ORIENTAL» A DIOECESI TAGAMNA '
      + 'DISTRACTA, NOVA CONDITUR DIOECESIS NOMINE MATIENSIS',
    note:
      'Detaches the civil province of Davao Oriental from the Diocese of Tagum and erects the '
      + 'new Diocese of Mati (Philippines), suffragan to Davao: "...ex itaque seiuncta regione '
      + 'novam condimus iure dioecesim Matiensem in posterum appellandam...".',
  },
  'john-paul-ii|aganiensis|1984-03-08': {
    argumentum:
      'AGANIENSIS* IN INSULIS OCEANI PACIFICI NOVA CONDITUR PROVINCIA ECCLESIASTICA NOMINE '
      + 'AGANIENSIS',
    note:
      'Separates the Diocese of Agana (Guam) from the province of San Francisco, raises it to '
      + 'a metropolitan archdiocese and erects the new ecclesiastical province of Agana with the '
      + 'Diocese of the Caroline and Marshall Islands, withdrawn from the province of Suva, as '
      + 'its suffragan: "...Novam provinciam ecclesiasticam, secundum ea omnia ipsa quae supra '
      + 'particulatim descripta sunt, condimus Aganiensem appellandam...et Aganiensem hucusque '
      + 'dioecesim nunc archidioecesis Metropolitanae dignitate insignimus...".',
  },
  'john-paul-ii|aureatensis-guaduensis|1984-03-13': {
    argumentum:
      'AUREATENSIS - GUADUENSIS* NON NULLIS LOCIS AD ARCHIDIOECESI MANIZALENSI ALIISQUE AUT A '
      + 'FACATATIVENSI ECCLESIA AUT A BARRANCABERMEJENSI SEIUNCTIS NOVA CONDITUR DIOECESIS '
      + 'NOMINE AUREATENSIS-GUADUENSIS',
    note:
      'Detaches fourteen municipalities (Puerto Boyaca, Puerto Triunfo, La Dorada, Puerto '
      + 'Salgar, Guaduas, Caparrapi, Chaguani, Samana, Victoria, La Palma, Yacopi, Marquetalia, '
      + 'Pensilvania, Manzanares) and two smaller districts from the Archdiocese of Manizales '
      + 'and the Dioceses of Facatativa and Barrancabermeja and erects the new Diocese of La '
      + 'Dorada-Guaduas (Colombia), suffragan to Manizales, with a concathedral at Guaduas: '
      + '"...iisque ex locis simul sumptis novam dioecesim condimus Aureatensem-Guaduensem '
      + 'appellandam...". The heading prints "AD ARCHIDIOECESI", as quoted.',
  },
  'john-paul-ii|coatzacoalsensis|1984-03-14': {
    argumentum:
      'COATZACOALSENSIS* QUIBUSDAM LOCIS A DIOECESI SANCTI ANDREAE DE TUXTLA DISTRACTIS NOVA '
      + 'CONDITUR DIOECESIS NOMINE COATZACOALSENSIS',
    note:
      'Detaches nine municipalities (Coatzacoalcos, Cosoleacaque, Ixhuatlan del Sureste, '
      + 'Hidalgotitlan, Minatitlan, Moloacan, Las Choapas, Pajapan, Zaragoza) from the Diocese '
      + 'of San Andres Tuxtla and erects the new Diocese of Coatzacoalcos (Mexico), suffragan to '
      + 'Jalapa: "...ex iisque simul sumptis legeque civili circumscriptis ac definitis novam '
      + 'dioecesim condimus Coatzacoalsensem appellandam.".',
  },
  'john-paul-ii|maputensis-et-aliarum-in-mozambico|1984-06-04': {
    argumentum:
      'MAPUTENSIS ET ALIARUM IN MOZAMBICO* NOVAE PROVINCIAE ECCLESIASTICAE IN DICIONE '
      + 'MOZAMBICANA DUAE CONSTITUUNTUR, NOMINE BEIRENSIS UNA ET NAMPULENSIS ALTERA, MAPUTENSIS '
      + 'VERO VELUTI EX INTEGRO CONSTITUITUR',
    note:
      'Reorders Mozambique into three ecclesiastical provinces: erects the new provinces of '
      + 'Beira (with Quelimane and Tete) and Nampula (with Lichinga and Pemba), raising both '
      + 'sees to metropolitan rank, and reconstitutes the province of Maputo with Inhambane and '
      + 'Xai-Xai: "...Provincias Ecclesiasticas ibi condimus Beirensem et Nampulensem '
      + 'cognominandas, cuius utriusque propriam Sedem hucusque episcopalem ad dignitatem '
      + 'metropolitanam nunc evehimus...".',
  },
  'john-paul-ii|gorakhpurensis|1984-06-21': {
    argumentum:
      'GORAKHPURENSIS* DETRACTIS NONNULLIS TERRITORIIS A DIOECESI VARANASIENSI, IN INDIA, NOVA '
      + 'EPARCHIA RITUS SYRO-MALABARENSIS CONDITUR, NOMINE GORAKHPURENSIS',
    note:
      'Detaches the districts of Gorakhpur, Basti and Deoria from the Diocese of Varanasi and '
      + 'erects the new Syro-Malabar Eparchy of Gorakhpur (India), entrusted to the Congregation '
      + 'of St Teresa (Little Flower): "...Ab Ecclesia Varanasiensi Districtus, quos dicunt, '
      + 'Gorakhpur, Basti ac Deoria distrahimus, eosque in novae Eparchiae formam redigimus, '
      + 'Ritus Syro-Malabarensis...".',
  },
  'john-paul-ii|mbanzacongensis|1984-11-07': {
    argumentum:
      'MBANZACONGENSIS* IN ANGOLA NOVA DIOECESIS CONDITUR NOMINE MBANZACONGENSIS AB URBE '
      + 'REGIONIS PRINCIPE',
    note:
      'Detaches the civil province of Zaire from the Diocese of Uije and erects the new '
      + 'Diocese of Mbanza Congo (Angola), suffragan to Luanda: "...A dioecesi Uiiensi '
      + 'territorium Zairensis provinciae, ut est lege civili circumscripta separamus, in '
      + 'novaeque dioecesis formam redigimus, quae ab urbe vulgo « Mbanza Congo » principe '
      + 'regionis Mbanzacongensis cognominabitur...".',
  },
  'john-paul-ii|geitaensis|1984-11-08': {
    argumentum:
      'GEITAËNSIS* DISTRACTIS NONNULLIS TERRITORIIS A DIOECESI MWANZAËNSI NOVA DIOECESIS '
      + 'GEITAËNSIS CONSTITUITUR',
    note:
      'Detaches the civil districts of Geita and Sengerema from the Diocese of Mwanza and '
      + 'erects the new Diocese of Geita (Tanzania), suffragan to Tabora: "...distrahimus et ex '
      + 'his novam dioecesim Geitaënsem constituimus, Metropolitanae Ecclesiae Taboraënsi '
      + 'subiectam...".',
  },
  'john-paul-ii|vialembensis|1984-11-08': {
    argumentum:
      'VIALEMBENSIS* DISTRACTO TERRITORIO AB ECCLESIA AGANIENSI, NOVA DIOECESIS CONDITUR '
      + 'NOMINE VIALEMBENSIS',
    note:
      'Detaches the Commonwealth of the Northern Mariana Islands from the Archdiocese of Agana '
      + 'and erects the new Diocese of Chalan Kanoa, within the province of Agana erected '
      + 'earlier that year: "...atque ex eo novam constituimus dioecesim nomine Vialembensem, '
      + 'cuius fines iidem erunt ac fines territorii de quo diximus.".',
  },
  'john-paul-ii|udaipurensis|1984-12-03': {
    argumentum:
      'UDAIPURENSIS* QUIBUSDAM LOCIS AB ECCLESIA AIMERENSI ET IAIPURENSI DISTRACTIS NOVA '
      + 'CONDITUR DIOECESIS NOMINE UDAIPURENSIS',
    note:
      'Detaches the civil districts of Bhilwara, Udaipur, Chittorgarh, Dungarpur and Banswara '
      + '(Rajasthan) and the tehsil of Thandla (Madhya Pradesh) from the Dioceses of Ajmer and '
      + 'Jaipur and erects the new Diocese of Udaipur (India), suffragan to Agra: "...Iis ipsis '
      + 'locis simul sumptis novam dioecesim condimus nomine Udaipurensem, quam archidioecesi '
      + 'Agraensi suffraganeam subicimus.". The page prints the fifth district as "Manswara".',
  },
  'john-paul-ii|alaminensis|1985-01-12': {
    argumentum:
      'ALAMINENSIS* DISTRACTIS NONNULLIS TERRITORIIS AB ECCLESIA LINGAYEN-DAGUPANEN., NOVA '
      + 'DIOECESIS ALAMINESIS CONDITUR',
    note:
      'Detaches eighteen parishes and a quasi-parish in western Pangasinan (Agno, Aguilar, '
      + 'Alaminos, Anda, Bani, Bolinao, Bugallon, Burgos, Dasol, Infanta, Labrador, Mabini, '
      + 'Mangatarem, Sual and others) from the Archdiocese of Lingayen-Dagupan and erects the '
      + 'new Diocese of Alaminos (Philippines), suffragan to Lingayen-Dagupan: "...iisque '
      + 'dioecesim condimus Alaminensem appellandam iisdemque finibus circumscribendam quibus '
      + 'paroeciae ac quasi paroecia de quibus diximus terminantur.". The heading prints '
      + '"ALAMINESIS" and abbreviates the mother see, as quoted.',
  },
  'john-paul-ii|urdanetensis|1985-01-12': {
    argumentum:
      'URDANETENSIS* DISTRACTO TERRITORIO AB ARCHIDIOECESI LINGAYENSI-DAGUPANENSI NOVA '
      + 'CONSTITUITUR DIOECESIS URDANETENSIS',
    note:
      'Detaches eighteen parishes and three quasi-parishes in eastern Pangasinan (Alcala, '
      + 'Asingan, Balungao, Binalonan, Natividad, Pozorrubio, Rosales, San Manuel, Santa Maria, '
      + 'San Nicolas, San Quintin, Santo Tomas, Sison, Tayug, Umingan, Urdaneta, Villasis and '
      + 'others) from the Archdiocese of Lingayen-Dagupan and erects the new Diocese of Urdaneta '
      + '(Philippines), suffragan to Lingayen-Dagupan: "...et ex ita deducto utroque territorio '
      + 'novam constituimus dioecesim Urdanetensem...".',
  },
  'john-paul-ii|punalurensis|1985-12-21': {
    argumentum:
      'PUNALURENSIS* IN INDICA NATIONE NOVA DIOECESIS CONSTITUITUR, NOMINE «PUNALURENSIS»',
    note:
      'Detaches the taluks of Pathanamthitta and Pathanapuram and parts of Kottarakara, '
      + 'Kunnathur, Mavelikara and Chengannur -- the territory east of the Main Central Road -- '
      + 'from the Diocese of Quilon and erects the new Diocese of Punalur (India), suffragan to '
      + 'Verapoly: "...a dioecesi Quilonensi, in novae dioecesis formam redigimus Punalurensis '
      + 'appellandae, a nomine scilicet urbis Punalur.".',
  },
  'john-paul-ii|talibonensis|1986-01-09': {
    argumentum:
      'TALIBONENSIS* QUIBUSDAM LOCIS A DIOECESI TAGBILARANA DISTRACTIS NOVA CONDITUR DIOECESIS '
      + 'NOMINE TALIBONENSIS',
    note:
      'Detaches twenty-three parishes in northern Bohol (Anda, Bien-Unido, Clarin, Duero, '
      + 'Jetafe, President Garcia, San Miguel, Sierra Bullones, Ubay, Talibon and others) from '
      + 'the Diocese of Tagbilaran and erects the new Diocese of Talibon (Philippines), '
      + 'suffragan to Cebu: "...ex iisque simul sumptis locis seu paroeciis novam dioecesim '
      + 'condimus nomine Talibonensem...".',
  },
  'john-paul-ii|yeiensis|1986-03-21': {
    argumentum:
      'YEIENSIS* IN SUDANIA NOVA DIOECESIS CONDITUR NOMINE YEIENSIS',
    note:
      'Detaches the civil districts of Yei and Mundri (Eastern Equatoria) from the Diocese of '
      + 'Rumbek and erects the new Diocese of Yei (Sudan), suffragan to Juba: "...a memorata '
      + 'sede disiuncti, novam dioecesim, Yeiensem vocatam conficient, quae Archidioecesis '
      + 'Iubaënsis suffraganea erit...".',
  },
  'john-paul-ii|parramattensis|1986-04-08': {
    argumentum:
      'PARRAMATTENSIS* DETRACTIS NONNULLIS TERRITORIIS AB ARCHIDIOECESI SYDNEYENSI NOVA '
      + 'CONDITUR DIOECESIS «PARRAMATTENSIS» APPELLANDA',
    note:
      'Detaches the municipalities of Parramatta, Baulkham Hills, Blacktown, Holroyd, Penrith, '
      + 'Blue Mountains and Hawkesbury from the Archdiocese of Sydney and erects the new Diocese '
      + 'of Parramatta (Australia), suffragan to Sydney: "...quibus novam dioecesim constituimus '
      + 'Parramattensem appellandam, cuius nempe fines iidem erunt, quibus municipia simul '
      + 'sumpta circumscribuntur.".',
  },
  'john-paul-ii|thamarasserrensis|1986-04-28': {
    argumentum:
      'THAMARASSERRENSIS* QUIBUSDAM LOCIS AB EPARCHIA TELLICHERRIENSI SEIUNCTIS NOVA CONDITUR '
      + 'EPARCHIA NOMINE THAMARASSERRENSIS',
    note:
      'Detaches the regions of Calicut and Malappuram from the Syro-Malabar Eparchy of '
      + 'Tellicherry and erects the new Eparchy of Thamarasserry (India), suffragan to '
      + 'Ernakulam: "...regiones Calicutensem ac Malappuramensem distrahimus novamque ex iisdem '
      + 'Eparchiam condimus nomine Thamarasserrensem...".',
  },
  'john-paul-ii|sonsonatensis|1986-05-31': {
    argumentum:
      'SONSONATENSIS* DISTRACTIS NONNULLIS TERRITORIIS A DIOECESI SANCTAE ANNAE, NOVA '
      + 'DIOECESIS ERIGITUR QUAE SONSONATENSIS APPELLATUR',
    note:
      'Detaches the civil department of Sonsonate from the Diocese of Santa Ana and erects the '
      + 'new Diocese of Sonsonate (El Salvador), suffragan to San Salvador: "...ex quo distratto '
      + 'territorio novam dioecesim Sonsonatensem appellandam condimus, cuius videlicet fines '
      + 'iidem erunt atque provinciae civilis.".',
  },
  'john-paul-ii|embuensis|1986-06-09': {
    argumentum:
      'EMBUENSIS* DISTRACTO TERRITORIO A DIOECESI MERUENSI NOVA CONSTITUITUR DIOECESIS '
      + 'EMBUENSIS APPELLANDA',
    note:
      'Detaches the civil district of Embu from the Diocese of Meru and erects the new Diocese '
      + 'of Embu (Kenya), suffragan to Nairobi: "...territorium districtus civilis, vulgo « Embu '
      + '» dicti, distrahimus idemque dioecesim constituimus, Embuensem appellandam.".',
  },
  'john-paul-ii|sreveportuensis|1986-06-16': {
    argumentum:
      'SREVEPORTUENSIS* NONNULLIS DISTRACTIS TERRITORIIS A DIOECESI '
      + 'ALEXANDRINA-SREVEPORTUENSIS APPELLANDA',
    note:
      'Detaches fifteen parishes (Caddo, Bossier, Webster, Claiborne, Lincoln, Union, '
      + 'Morehouse, West Carroll, De Soto, Bienville, Jackson, Ouachita, Richland, Red River, '
      + 'Sabine) from the Diocese of Alexandria-Shreveport and erects the new Diocese of '
      + 'Shreveport (Louisiana), suffragan to New Orleans, the mother see becoming simply '
      + 'Alexandria: "...quibus novam dioecesim Sreveportuensem appellandam condimus, cuius '
      + 'scilicet fines erunt iidem, quibus memorati Comitatus simul sumpti circumscribuntur.". '
      + 'The page prints only two lines of its heading, dropping the clause that names the act '
      + 'between "A DIOECESI" and "ALEXANDRINA-SREVEPORTUENSIS APPELLANDA" (the cached HTML '
      + 'confirms it), so the argumentum is quoted as printed and the curation script abstained; '
      + 'the act is read from the body.',
  },
  'john-paul-ii|tundurensis-masasiensis|1986-10-17': {
    argumentum:
      'TUNDURUENSIS-MASASIENSIS* QUIBUSDAM LOCIS A DIOECESI NACHINGVEAËNSI DISTRACTIS NOVA '
      + 'ECCLESIA TUNDURUENSIS-MASASIENSIS',
    note:
      'Detaches the civil region of Tunduru and, except the parishes of Ndanda and Chigugu, '
      + 'the region of Masasi from the Diocese of Nachingwea and erects the new Diocese of '
      + 'Tunduru-Masasi (Tanzania), suffragan to Dar-es-Salaam: "...iisque simul sumptis novam '
      + 'dioecesim condimus nomine Tunduruensem-Masasiensem eamque tum Ecclesiae '
      + 'Dar-es-Salaamensi suffraganeam constituimus...". The heading states no verb at all '
      + '("NOVA ECCLESIA TUNDURUENSIS-MASASIENSIS"), so the curation script abstained and the '
      + 'act is read from the body.',
  },
  'john-paul-ii|baniensis|1986-11-08': {
    argumentum:
      'BANIENSIS* SEIUNCTIS QUIBUSDAM TERRITORIIS AB ARCHIDIOECESI SANCTI DOMINICI, NOVA '
      + 'DIOECESIS BANIENSIS NUNCUPATA ERIGITUR',
    note:
      'Detaches the civil provinces of Peravia and San Cristobal from the Archdiocese of Santo '
      + 'Domingo and erects the new Diocese of Bani (Dominican Republic), suffragan to Santo '
      + 'Domingo: "...ex qua novam efficimus dioecesim in posterum tempus Baniensem '
      + 'nuncupandam...".',
  },
  'john-paul-ii|tylerensis|1986-12-12': {
    argumentum:
      'TYLERENSIS* DETRACTIS NONNULLIS TERRITORIIS AB ECCLESIIS GALVESTONIENSI-HOUSTONIENSI, '
      + 'BELLOMONTESI, DALLASENSI, NOVA DIOECESIS CONDITUR «TYLERENSIS» COGNOMINANDA',
    note:
      'Detaches five counties from the Diocese of Galveston-Houston, six from Beaumont and '
      + 'twenty-one from Dallas and erects the new Diocese of Tyler (Texas), suffragan to San '
      + 'Antonio: "...quibus omnibus terris novam dioecesim condimus, Tylerensem cognominandam, '
      + 'scilicet iisdem finibus conterminandam atque comitatus.". The heading prints '
      + '"BELLOMONTESI", as quoted.',
  },
  'john-paul-ii|belogradensis|1986-12-16': {
    argumentum:
      'BELOGRADENSIS* ECCLESIASTICA PROVINCIA CONDITUR BELOGRADENSIS ET ARCHIDIOECESIS EI '
      + 'COGNOMINE AD GRADUM METROPOLITANAE EVEHITUR',
    note:
      'Raises the Archdiocese of Belgrade to a metropolitan see and erects the new '
      + 'ecclesiastical province of Belgrade with Subotica (until now immediately subject to the '
      + 'Holy See) and Zrenjanin as suffragans: "...Novam ita provinciam ecclesiasticam nomine '
      + 'Belogradensem condimus, quae et Ecclesia ei cognomine nunc Metropolitana facta '
      + 'constabit et Ecclesia Suboticana...et Zrenianinensi...". The province is what the '
      + 'argumentum leads with (CONDITUR), so this is an erection; the curation script proposed '
      + 'an elevation on the EVEHITUR of its second clause.',
  },
  'john-paul-ii|mbingensis|1986-12-21': {
    argumentum:
      'MBINGENSIS* DETRACTIS NONNULLIS TERRITORIIS A DIOECESI SONGEANA, IN TANZANIA, NOVA '
      + 'CONSTITUITUR DIOECESIS «MBINGENSIS» APPELLANDA',
    note:
      'Detaches the civil district of Mbinga from the Diocese of Songea and erects the new '
      + 'Diocese of Mbinga (Tanzania), suffragan to Dar-es-Salaam: "...territorium civilis '
      + 'districtus « Mbinga » separamus, quo novam dioecesim condimus Mbingensem nomine, '
      + 'archidioecesi metropolitanae Dar-es-Salaamensi suffraganeam...".',
  },
  'john-paul-ii|sibuensis|1986-12-21': {
    argumentum:
      'SIBUENSIS* DETRACTIS NONNULLIS TERRITORIIS AB ECCLESIAE KUCHINGENSI ET MIRIENSI, NOVA '
      + 'QUAEDAM DIOECESIS CONDITUR, SIBUENSIS APPELLANDA',
    note:
      'Detaches the eastern part of the Archdiocese of Kuching and the southern part of the '
      + 'Diocese of Miri (the Third, Sixth and Seventh Divisions of Sarawak) and erects the new '
      + 'Diocese of Sibu (Malaysia), suffragan to Kuching: "...Quibus terris novam dioecesim '
      + 'condimus, ab eius urbe principe Sibuensem cognominandam...".',
  },
  'john-paul-ii|coloratensis|1987-01-05': {
    argumentum:
      'COLORATENSIS* PRAELATURA TERRITORIALIS COLORATENSIS CONSTITUITUR',
    note:
      'Detaches the region of Santo Domingo de los Colorados, bounded as the text describes in '
      + 'Spanish, from the Archdiocese of Quito and erects the new Territorial Prelature of Los '
      + 'Colorados (Ecuador), suffragan to Quito: "...Ex hoc autem territorio novam Praelaturam '
      + 'territorialem constituimus, Coloratensem appellandam...".',
  },
  'john-paul-ii|gurecsamiensis|1987-02-12': {
    argumentum:
      'GURECSAMIENSIS* DETRACTIS NONNULLIS TERRITORIIS AB ECCLESIA MENEVENSI, NOVA QUAEDAM '
      + 'DIOECESIS CONDITUR, «GURECSAMIENSIS» APPELLANDA; DIOECESI VERO MENEVENSI NOVUM '
      + 'TERRITORIUM ACCEDIT',
    note:
      'Detaches the counties of Gwynedd and Clwyd and the district of Montgomery from the '
      + 'Diocese of Menevia and erects the new Diocese of Wrexham (Wales), suffragan to Cardiff, '
      + 'keeping the former Menevia cathedral; Menevia gains West Glamorgan from Cardiff and '
      + 'moves its seat to Swansea: "...quibus novam dioecesim constituimus, Gurecsamiensem '
      + 'appellandam. Huius sedem in urbe vulgo Wrexham statuimus...".',
  },
  'john-paul-ii|cabancalensis|1987-03-30': {
    argumentum:
      'CABANCALENSIS* IN INSULIS PHILIPPINIS NOVA DIOECESIS CONDITUR CABANCALENSIS APPELLANDA',
    note:
      'Detaches fifteen parishes in southern Negros Occidental (La Castellana, Moises Padilla, '
      + 'Isabela, Binalbagan, Himamaylan, Kabankalan, Candoni, Ilog, Sipalay, Cauayan, Hinobaan '
      + 'and others) from the Diocese of Bacolod and erects the new Diocese of Kabankalan '
      + '(Philippines), suffragan to Jaro: "...quibus territoriis novam dioecesim constituimus '
      + 'Cabancalensem appellandam, nempe iisdem finibus terminandam, quibus paroeciae e quibus '
      + 'coalescit.".',
  },
  'john-paul-ii|bungomaensis|1987-04-27': {
    argumentum:
      'BUNGOMAENSIS* IN KENIA NOVA DIOECESIS CREATUR BUNGOMAËNSIS',
    note:
      'Detaches the civil districts of Bungoma and Busia and the parish of Tongaren from the '
      + 'Diocese of Kakamega and erects the new Diocese of Bungoma (Kenya), suffragan to '
      + 'Nairobi: "...quibus nempe ex coniunctis iam plagis novensilem creamus dioecesim '
      + 'Bungomaënsem posterum in tempus nuncupandam quam suffraganeam simul subdimus '
      + 'Metropolitanae Ecclesiae Nairobiensi...".',
  },
  'john-paul-ii|kurunegalaensis|1987-05-15': {
    argumentum:
      'KURUNEGALAENSIS* IN TAPROBANE INSULA NOVA DIOECESIS KURUNEGALENSIS ERIGITUR',
    note:
      'Detaches the Kurunegala District from the Diocese of Chilaw and erects the new Diocese '
      + 'of Kurunegala (Sri Lanka), suffragan to Colombo: "...Territorium vulgo « Kurunegala '
      + 'District » a dioecesi Chilavensi distrahimus atque in dioecesis formam redigimus '
      + 'Kurunegalaënsis cognominandae...".',
  },
  'john-paul-ii|mymensinghensis|1987-05-15': {
    argumentum:
      'MYMENSINGHENSIS* QUIBUSDAM LOCIS AB ECCLESIA DACCHENSI DISTRACTIS NOVA CONDITUR '
      + 'DIOECESIS NOMINE MYMENSINGHENSIS',
    note:
      'Detaches the civil districts of Mymensingh, Tangail, Kishoreganj, Netrakona, Jamalpur '
      + 'and Sherpur from the Archdiocese of Dhaka and erects the new Diocese of Mymensingh '
      + '(Bangladesh), suffragan to Dhaka: "...et ex his novam dioecesim Mymensinghensem '
      + 'constituimus, Metropolitanae Ecclesiae Dacchensi subiectam...".',
  },
  'john-paul-ii|bondukuensis|1987-07-03': {
    argumentum:
      'BONDUKUENSIS* DIVISA DIOECESI ABENGURUENSI, NOVA DIOECESIS CONDITUR IN RE PUBLICA '
      + 'LITORIS EBURNEI «BONDUKUENSIS» APPELLANDA',
    note:
      'Detaches the civil divisions of Bouna, Tehini, Nassian, Bondoukou, Sandegue and Tanda '
      + '(except the parishes of Assuefry and Transua) from the Diocese of Abengourou and erects '
      + 'the new Diocese of Bondoukou (Ivory Coast): "...iisque novam dioecesim condimus '
      + 'Bondukuensem appellandam.".',
  },
  'john-paul-ii|kottapuramensis|1987-07-03': {
    argumentum:
      'KOTTAPURAMENSIS* IN INDIAE STATU CUI NOMEN «KERALA» NOVA CONDITUR DIOECESIS '
      + 'KOTTAPURAMENSIS',
    note:
      'Detaches the northern part of the Archdiocese of Verapoly (its sixth and seventh '
      + 'deaneries, less the parishes of Manjally and Kottuvally) and erects the new Diocese of '
      + 'Kottapuram (Kerala, India), suffragan to Verapoly: "...Ab archidioecesi Verapolitana '
      + 'partem septentrionalem distrahimus eaque novam Ecclesiam condimus Kattapuramensem '
      + 'appellandam ab urbe principe eiusdem regionis...". The body prints "Kattapuramensem" '
      + 'where the heading has KOTTAPURAMENSIS.',
  },
  'john-paul-ii|sivangaiensis|1987-07-03': {
    argumentum:
      'SIVAGANGAIENSIS* IN INDIAE FINIBUS NOVA CONDITUR DIOECESIS NOMINE SIVAGANGAIENSIS',
    note:
      'Detaches six taluks (Sivagangai, Tirupathur, Tiruvadanai, Ramnad, Paramakudi, '
      + 'Mudukulathur) and the island of Rameswaram from the Archdiocese of Madurai and erects '
      + 'the new Diocese of Sivagangai (India), suffragan to Madurai: "...atque ex iis ita '
      + 'detractis locis novam condimus dioecesim Sivagangaiensem appellandam, quam '
      + 'metropolitanae Sedi Madhuraiensi subicimus...".',
  },
  'john-paul-ii|truxillensis|1987-07-03': {
    argumentum:
      'TRUXILLENSIS IN HONDURIA* IN HONDURIA NOVA CONDITUR DIOECESIS NOMINE TRUXILLENSIS IN '
      + 'HONDURIA',
    note:
      'Detaches the civil departments of Colon and Gracias a Dios from the Diocese of San '
      + 'Pedro Sula and erects the new Diocese of Trujillo (Honduras), suffragan to Tegucigalpa: '
      + '"...ex iisque novam condimus dioecesim Truxillensem in Honduria, appellandam, quam '
      + 'metropolitanae Sedi Tegucigalpensi subicimus...".',
  },
  'john-paul-ii|malangensis-soatensis|1987-07-07': {
    argumentum:
      'MALANGENSIS-SOATENSIS* IN COLUMBIA NOVA CONDITUR DIOECESIS MALANGENSIS-SOATENSIS',
    note:
      'Detaches thirteen municipalities of the province of Garcia Rovira from the Archdiocese '
      + 'of Bucaramanga and thirteen of the provinces of Norte and Gutierrez from the Diocese of '
      + 'Duitama and erects the new Diocese of Malaga-Soata (Colombia), suffragan to '
      + 'Bucaramanga, with a concathedral at Soata: "...atque ex ita distractis territoriis '
      + 'novam condimus dioecesim Malangensem-Soatensem appellandam...".',
  },
  'john-paul-ii|chalatenangensis|1987-12-13': {
    argumentum:
      'CHALATENANGENSIS* SANCTI SALVATORIS IN AMERICA IN CIVITATE NOVA DIOECESIS CONDITUR '
      + 'CHALATENANGENSIS APPELLANDA',
    note:
      'Detaches the civil department of Chalatenango from the Archdiocese of San Salvador and '
      + 'erects the new Diocese of Chalatenango (El Salvador), suffragan to San Salvador: "...ex '
      + 'quo seiuncto territorio novam condimus dioecesim Chalatenangensem appellandam, cuius '
      + 'scilicet fines iidem erunt atque civilis provinciae seu « departamento ».".',
  },
  'john-paul-ii|lexingtonensis|1988-01-14': {
    argumentum:
      'LEXINGTONENSIS* IN CIVITATIBUS FOEDERATIS AMERICAE SEPTEMTRIONALI NOVA CONDITUR '
      + 'DIOECESIS LEXINGTONENSIS APPELLATA',
    note:
      'Detaches seven counties from the Archdiocese of Louisville and forty-three from the '
      + 'Diocese of Covington and erects the new Diocese of Lexington (Kentucky), suffragan to '
      + 'Louisville: "...Quibus de ita seiunctis in unumque conglobatis locis novam ex integro '
      + 'condimus dioecesim posthac videlicet Lexingtonensem vocitandam...".',
  },
  'john-paul-ii|khammamensis|1988-01-18': {
    argumentum:
      'KHAMMAMENSIS* DISTRACTIS QUIBUSDAM TERRITORIIS A DIOECESI VARANGALENSI NOVA DIOECESIS '
      + 'KHAMMAMENSIS CONDITUR',
    note:
      'Detaches the civil district of Khammam from the Diocese of Warangal and erects the new '
      + 'Diocese of Khammam (India), suffragan to Hyderabad: "...civili nominatim regione « '
      + 'Khammam », quam propterea dioecesim Khammamensem nomine condimus suffraganeamque simul '
      + 'Sedi Metropolitanae Hyderabadensi subdimus.".',
  },
  'john-paul-ii|iacmeliensis|1988-02-25': {
    argumentum:
      'IACMELIENSIS* NONNULLIS SEIUNCTIS TERRITORIIS AB ECCLESIA PORTUS PRINCIPIS, NOVA '
      + 'CONSTITUITUR DIOECESIS IACMELIENSIS APPELLANDA',
    note:
      'Detaches the departement du Sud-Est from the Archdiocese of Port-au-Prince and erects '
      + 'the new Diocese of Jacmel (Haiti), suffragan to Port-au-Prince: "...quo novam condimus '
      + 'dioecesim, Iacmeliensem appellandam, cuius scilicet finps iidem erunt atque civilis '
      + 'regionis seu «département ».".',
  },
  'john-paul-ii|knoxvillensis|1988-03-27': {
    argumentum:
      'KNOXVILLENSIS* EX DISTRACTO TERRITORIO A DICIONE NASHVILLENSI, NOVA CONDITUR DIOECESIS '
      + 'KNOXVILLENSIS APPELLANDA',
    note:
      'Detaches thirty-six counties of East Tennessee from the Diocese of Nashville and erects '
      + 'the new Diocese of Knoxville, suffragan to Louisville: "...ex eoque territorio novam '
      + 'condimus dioecesim, Knoxvillensem appellandam, cuius videlicet fines a triginta sex '
      + 'supra memoratis terminantur comitatibus.".',
  },
  'john-paul-ii|callianensis|1988-04-30': {
    argumentum:
      'CALLIANENSIS* NOVA EPARCHIA CALLIANENSIS PRO FIDELIBUS RITUS SYRO-MALABARENSIS IN '
      + 'REGIONE BOMBAYENSI-POONENSI-NASHIKENSI DEGENTIBUS CONDITUR',
    note:
      'Erects the new Syro-Malabar Eparchy of Kalyan for the faithful of that rite in the '
      + 'region of Bombay, Poona and Nashik (India), as announced in the letter to the Indian '
      + 'bishops of 28 May 1987: "...novam in regione quam diximus pro Christifidelibus ritus '
      + 'syro-malabarensis Eparchiam nomine Callianensem condimus eiusque constitutionem lege '
      + 'sancimus, cuius ipsius sedes, una cum Ecclesia Cathedrali, ipsa in urbe « Kalyan » '
      + 'erit.".',
  },
  'john-paul-ii|nashikensis|1988-05-15': {
    argumentum:
      'NASHIKENSIS* DISTRACTIS TERRITORIIS A DIOECESI POONENSI NOVA DIOECESIS NASHIKENSIS '
      + 'CONDITUR',
    note:
      'Detaches the civil districts of Dhulia, Jalgaon, Nashik and Ahmednagar -- the northern '
      + 'part -- from the Diocese of Poona and erects the new Diocese of Nashik (India), '
      + 'suffragan to Bombay: "...unde dioecesim constitui censemus ex provinciae illius urbe '
      + 'principi « Nashikensem » appellandam...".',
  },
  'john-paul-ii|apartadoensis|1988-06-28': {
    argumentum:
      'APARTADOËNSIS* IN COLUMBIA NOVA CONDITUR DIOECESIS APARTADOËNSIS',
    note:
      'Detaches the region of Uraba antioqueno from the Diocese of Antioquia and Uraba '
      + 'chocoano from the Apostolic Vicariate of Quibdo and erects the new Diocese of Apartado '
      + '(Colombia), suffragan to Santa Fe de Antioquia, raised to metropolitan rank ten days '
      + 'earlier: "...atque ex ita distractis territoriis novam condimus dioecesim Apartadoënsem '
      + 'appellandam, iisdem circumscriptam finibus quibus memoratae regiones terminantur.".',
  },
  'john-paul-ii|caldensis|1988-06-28': {
    argumentum:
      'CALDENSIS* IN COLUMBIA NOVA CONDITUR DIOECESIS CALDENSIS',
    note:
      'Detaches ten municipalities (Amaga, Angelopolis, Armenia, Caldas, Fredonia, Heliconia, '
      + 'Montebello, Santa Barbara, Titiribi, Venecia) and the parish of Santa Isabel de la '
      + 'Tablaza from the Archdiocese of Medellin and erects the new Diocese of Caldas '
      + '(Colombia), suffragan to Medellin: "...atque ex ita distractis locis novam condimus '
      + 'dioecesim Caldensem appellandam...".',
  },
  'john-paul-ii|girardotanensis|1988-06-28': {
    argumentum:
      'GIRARDOTANENSIS* NONNULLIS DISIUNCTIS TERRITORIIS A SEDIBUS MEDELLENSI, SONSONENSI RIVI '
      + 'NIGRI ET BARRANCABERMEIENSI NOVA CONDITUR DIOECESIS QUAE GIRARDOTANENSIS APPELLATUR',
    note:
      'Detaches ten municipalities (Girardota, Barbosa, Santo Domingo, Concepcion, Alejandria, '
      + 'San Roque, Caracoli, Maceo, Yolombo, Cisneros) from the Archdiocese of Medellin, two '
      + 'parishes from the Diocese of Sonson-Rionegro and one from Barrancabermeja, and erects '
      + 'the new Diocese of Girardota (Colombia), suffragan to Medellin: "...ex quibus '
      + 'distractis territoriis novam condimus dioecesim Girardotanensem appellandam...".',
  },
  'john-paul-ii|itaitubaensis|1988-08-08': {
    argumentum:
      'ITAITUBAËNSIS* QUADAM PLAGA DE DIOECESI SANTAREMENSI DECUCTA PRAELATURA ITAITUBAËNSIS '
      + 'CONDITUR',
    note:
      'Detaches the municipality of Itaituba from the Diocese of Santarem and erects the new '
      + 'Prelature of Itaituba (Brazil), suffragan to Belem do Para: "...quo ipso novam nunc '
      + 'Praelaturam Itaitubaënsem civilibus eiusdem municipii finibus definitam condimus, eam '
      + 'ipsam Ecclesiae Belemensi de Pará suffraganeam constituentes...". The heading prints '
      + '"DECUCTA", as quoted.',
  },
  'john-paul-ii|loikavensis|1988-11-14': {
    argumentum:
      'LOIKAVENSIS* TERRITORIO SEIUNCTO CIVILIS REGIONIS QUAM KAYAH VOCANT A DIOECESI '
      + 'TAUNGGYIENSI NOVA DIOECESIS CONSTITUITUR LOIKAVENSIS APPELLANDA',
    note:
      'Detaches the Kayah State from the Diocese of Taunggyi and erects the new Diocese of '
      + 'Loikaw (Burma), suffragan to Rangoon: "...quod territorium deinceps novam constituet '
      + 'dioecesim Loikavensem cognominandam, iisdem quidem servatis finibus ipsius regionis '
      + 'quam supra memoravimus.".',
  },
  'john-paul-ii|shimogaensis|1988-11-14': {
    argumentum:
      'SHIMOGAËNSIS* DISTRACTIS QUIBUSDAM TERRITORIIS AB ARCHIDIOECESI BANGALORENSI ET A '
      + 'DIOECESI CHIKMAGALURENSI NOVA CONSTITUTITUR DIOECESIS SHIMOGAËNSIS APPELLANDA',
    note:
      'Detaches the district of Chitradurga from the Archdiocese of Bangalore and the district '
      + 'of Shimoga from the Diocese of Chikmagalur and erects the new Diocese of Shimoga '
      + '(India), suffragan to Bangalore: "...exque his separatis territoriis novam condimus '
      + 'dioecesim « Shimogaënsem » vocandam, archidioecesi Bangalorensi suffraganeam...". The '
      + 'heading misprints the verb as "CONSTITUTITUR", kept as quoted, which is why the '
      + 'curation script abstained.',
  },
  'john-paul-ii|navaliensis|1988-11-29': {
    argumentum:
      'NAVALIENSIS* DISIUNCTIS NONNULLIS TERRITORIIS A PALENSI ARCHIDIOECESI, NOVA ERIGITUR '
      + 'DIOECESIS NAVALIENSIS APPELLANDA',
    note:
      'Detaches twelve parishes on Biliran and northern Leyte (Naval, Almeria, Bawayan, '
      + 'Caibiran, Biliran, Cabucgayan, Culaba, Calubian, San Isidro, Tabango, Leyte, Tucdao) '
      + 'from the Archdiocese of Palo and erects the new Diocese of Naval (Philippines), '
      + 'suffragan to Palo: "...Ex his ergo paroeciarum distractis territoriis novam condimus '
      + 'dioecesim Navaliensem appellandam...".',
  },
  'john-paul-ii|colonensis|1988-12-15': {
    argumentum:
      'COLONENSIS* NOVA CONDITUR DIOECESIS NOMINE COLONENSIS',
    note:
      'Detaches the province of Colon and the Comarca de San Blas from the Apostolic Vicariate '
      + 'of Darien and erects the new Diocese of Colon (Panama), suffragan to Panama: "...quibus '
      + 'conglobatis novam condimus dioecesim ita circumscriptam nomineque Colonensem '
      + 'appellandam necnon praeclarae Ecclesiae Metropolitanae Panamensi suffraganeam...".',
  },
  'john-paul-ii|uyoensis|1989-07-04': {
    argumentum:
      'UYOËNSIS* A DIOECESI CALABARENSI QUIBUSDAM DISTRACTIS LOCIS NOVA CONDITUR DIOECESIS '
      + 'UYOËNSIS NOMINE APPELLANDA',
    note:
      'Detaches part of the civil state of Akwa Ibom from the Diocese of Calabar and erects '
      + 'the new Diocese of Uyo (Nigeria), suffragan to Onitsha: "...Memoratae civilis '
      + 'provinciae « Akwa Ibom » portionem ab Ecclesia Calabarensi separamus novamque dioecesim '
      + 'Uyoënsem...condimus et Metropolitanae Ecclesiae Onitshaënsi suffraganeam subicimus...".',
  },
  'john-paul-ii|kupangensis-et-aliarum|1989-10-23': {
    argumentum:
      'KUPANGENSIS ET ALIARUM* IN INDONESIA NOVA PROVINCIA ECCLESIASTICA CONSTITUITUR '
      + 'KUPANGENSIS NOMINE',
    note:
      'Erects the new ecclesiastical province of Kupang (Indonesia): Kupang becomes a '
      + 'metropolitan see with Atambua and Weetebula, withdrawn from the province of Ende, as '
      + 'suffragans; the islands of Alor and Pantar pass to Kupang and Sumbawa to Denpasar: '
      + '"...Novam provinciam ecclesiasticam in Indonesia condimus Kupangensem nomine, quae '
      + 'coalescet Ecclesiis Kupangensi et Atambuensi...necnon Ecclesia Veetebulaënsi...".',
  },
  'john-paul-ii|gatinensis-hullensis|1989-10-31': {
    argumentum:
      'GATINENSIS-HULLENSIS* IN CANADA NOVA PROVINCIA ECCLESIASTICACONSTITUITUR '
      + 'GATINENSIS-HULLENSIS NOMINE, CUIUS METROPOLITANA ECCLESIA ERIT EADEM SEDES '
      + 'GATINENSIS-HULLENSIS',
    note:
      'Separates the Diocese of Gatineau-Hull from the province of Ottawa, raises it to a '
      + 'metropolitan see and erects the new ecclesiastical province of Gatineau-Hull (Canada) '
      + 'with Mont-Laurier and Rouyn-Noranda (from Ottawa) and Amos (from Quebec) as suffragans: '
      + '"...Gatinensem-Hullensem episcopalem Sedem, seiunctam rite a metropolitana Ecclesia '
      + 'Ottaviensi, ad gradum archiepiscopalis metropolitanae Sedis evehimus...Nova exin '
      + 'constituta Provincia Ecclesiastica Gatinensis-Hullensis constet quidem ex Ecclesia '
      + 'eiusdem nominis et ex iis, quae sequuntur, dioecesibus...". The province is what the '
      + 'argumentum leads with; the heading prints "ECCLESIASTICACONSTITUITUR" without a space, '
      + 'as quoted.',
  },
  'john-paul-ii|novolaredensis|1989-11-06': {
    argumentum:
      'NOVOLAREDENSIS* QUIBUSDAM AB ARCHIDIOECESI MONTERREYENSI ET A DIOECESI METAMORENSI '
      + 'DISTRACTIS TERRITORIIS NOVA CONSTITUITUR DIOECESIS NOVOLAREDENSIS',
    note:
      'Detaches seven municipalities of Nuevo Leon (Anahuac, Bustamante, Lampazos, Paras, '
      + 'Sabinas Hidalgo, Vallecillo, Villaldama) from the Archdiocese of Monterrey and four of '
      + 'Tamaulipas (Nuevo Laredo, Miguel Aleman, Mier, Guerrero) from the Diocese of Matamoros '
      + 'and erects the new Diocese of Nuevo Laredo (Mexico), suffragan to Monterrey: "...et ex '
      + 'ista distractis territoriis novam condimus dioecesim Novolaredensem appellandam...".',
  },
  'john-paul-ii|caracensis-graecorum-melkitarum-catholicorum|1990-02-19': {
    argumentum:
      'CARACENSIS GRECORUM MELKITARUM CATHOLICORUM* APOSTOLICUS EXARCHATUS PRO '
      + 'CHRISTIFIDELIBUS RITUS BYZANTINI GRAECIS MELKITIS IN VENETIOLA DEGENTIBUS CONSTITUITUR',
    note:
      'Erects an apostolic exarchate for the Greek-Melkite faithful of Venezuela, seated at '
      + 'Caracas, at the petition of Patriarch Maximos V Hakim and his synod: "...Apostolicum '
      + 'constituamus Exarchatum pro Christifidelibus ritus byzantini Graecis Melkitis in '
      + 'Venetiola degentibus secundum iuris orientalis praescripta. Iubemus deinde Exarchatus '
      + 'huius sedem in urbe Caracensi collocari...". The heading prints "GRECORUM", as quoted.',
  },
  'john-paul-ii|melipillensis|1990-04-04': {
    argumentum:
      'MELIPILLENSIS* IN CHILIA NOVA DIOECESIS CONDITUR MELIPILLENSIS',
    note:
      'Detaches thirteen municipalities (Melipilla, Maria Pinto, San Pedro, Alhue, Curacavi, '
      + 'San Antonio, El Tabo, Cartagena, Rocas de Santo Domingo, Navidad, Talagante, Penaflor, '
      + 'El Monte) from the Archdiocese of Santiago de Chile and erects the new Diocese of '
      + 'Melipilla, suffragan to Santiago: "...atque ex ita distracto territorio novam condimus '
      + 'dioecesim Melipillensem appellandam...".',
  },
  'john-paul-ii|grodnensis-latinorum|1990-04-13': {
    argumentum:
      'GRODNENSIS LATINORUM* GRODNENSIS CONDITUR LATINORUM DIOECESIS',
    note:
      'Erects the new Latin Diocese of Grodno (Byelorussia, then in the Soviet Union) on the '
      + 'whole territory of the Grodno oblast, suffragan to Minsk-Mohilev, erected the same day: '
      + '"...Cunctis simul sumptis locis, quibus civilis Grodnensis constat regio seu « Oblast '
      + '», dioecesim condimus Grodnensem Latinorum appellandam...".',
  },
  'john-paul-ii|karagandensis-latinorum|1990-04-13': {
    argumentum:
      'KARAGANDENSIS LATINORUM* ADMINISTRATIO APOSTOLICA KARAGANDENSIS LATINORUM CONSTITUITUR',
    note:
      'Erects the Apostolic Administration of Karaganda for Latin-rite Catholics on the whole '
      + 'territory of the Kazakh republic, its administrator also given ad tempus the care of '
      + 'the Catholics of Tajikistan, Kirghizia, Uzbekistan and Turkmenistan: "...territorium '
      + 'Reipublicae Kazakistaniae in Administrationem Apostolicam erigimus Karagandensem '
      + 'appellandam, iisdem circumscriptam finibus, quibus in praesens eadem Respublica '
      + 'terminatur...".',
  },
  'john-paul-ii|minscensis-mohiloviensis-latinorum|1990-04-13': {
    argumentum:
      'MINSCENSIS-MOHILOVIENSIS LATINORUM* MINSCENSIS-MOHILOVIENSIS LATINORUM CONDITUR '
      + 'ARCHIDIOECESIS',
    note:
      'Erects the new Latin metropolitan Archdiocese of Minsk-Mohilev on the oblasts of Minsk, '
      + 'Mohilev and Vitebsk, joining the ancient see of Mohilev to the church of Minsk: '
      + '"...Regiones civiles seu « Oblasti », ut ibidem incolae aiunt, Minsk. Mohilev et '
      + 'Vitebsk Archidioecesim constituent Metropolitanam, Minscensem- Mohiloviensem Latinorum '
      + 'appellandam...".',
  },
  'john-paul-ii|moscoviensis-latinorum|1990-04-13': {
    argumentum:
      'MOSCOVIENSIS LATINORUM* ADMINISTRATIO APOSTOLICA MOSCOVIENSIS LATINORUM CONSTITUITUR',
    note:
      'Separates European Russia from the Archdiocese of Mohilev and erects it as the '
      + 'Apostolic Administration of Moscow for Latin-rite Catholics, seated at Moscow: '
      + '"...omnia loca quae communiter dieta « Russia Europaea » complectitur ab archidioecesi '
      + 'Mohiloviensi seiungi atque in Apostolicam Administrationem converti cui deinceps '
      + 'titulus sit Moscoviensis Latinorum...".',
  },
  'john-paul-ii|novosibirskensis-latinorum|1990-04-13': {
    argumentum:
      'NOVOSIBIRSKENSIS LATINORUM* IN FOEDERATIS CIVITATIBUS SOVIETICIS ADMINISTRATIO '
      + 'APOSTOLICA NOVOSIBIRSKENSIS LATINORUM CONDITUR',
    note:
      'Erects the Apostolic Administration of Novosibirsk for Latin-rite Catholics on the '
      + 'territory of Siberia, formerly part of the Archdiocese of Mohilev, its jurisdiction '
      + 'extending for now to the territory of the Diocese of Vladivostok: "...Territorium '
      + 'regionis Siberiae, quod olim ad Mohiloviensem Archidioecesim pertinebat, in '
      + 'Administrationem Apostolicam erigimus Novosibirskensem Latinorum appellandam...".',
  },
  'john-paul-ii|mandevillensis|1990-04-15': {
    argumentum:
      'MANDEVILLENSIS* VICARIATUS APOSTOLICUS MANDEVILLENSIS INTRA IAMAICANAE NATIONIS FINES '
      + 'CONSTITUITUR',
    note:
      'Erects the new Apostolic Vicariate of Mandeville (Jamaica) on the county of Middlesex '
      + '(the civil parishes of Manchester, Clarendon and St Elizabeth), within the province of '
      + 'Kingston and entrusted to the Passionists: "...In comitatu igitur quem Middlesex '
      + 'vocant, cum antea nulla fuerit, circumscriptionem missionalem constituimus, Vicariatum '
      + 'nempe Apostolicum Mandevillensem appellandum...".',
  },
  'john-paul-ii|colatinensis|1990-04-23': {
    argumentum:
      'COLATINENSIS* DISTRACTIS QUIBUSDAM TERRITORIIS AB ARCHIDIOECESI VICTORIENSI SPIRITUS '
      + 'SANCTI NOVA CONDITUR DIOECESIS COLATINENSIS NOMINE',
    note:
      'Detaches thirteen municipalities (Colatina, Aracruz, Baixo Guandu, Ibiracu, Itaguacu, '
      + 'Itarana, Joao Neiva, Laranja da Terra, Linhares, Marilandia, Pancas, Rio Bananal, Santa '
      + 'Teresa) from the Archdiocese of Vitoria do Espirito Santo and erects the new Diocese of '
      + 'Colatina (Brazil), suffragan to Vitoria: "...ex quibus sic seiunctis inter seque '
      + 'coniunctis dioecesim sui iuris efficimus in posterum tempus COLATINENSEM '
      + 'nuncupandam...".',
  },
  'john-paul-ii|mombasaensis|1990-05-19': {
    argumentum:
      'MOMBASAËNSIS* NOVA PROVINCIA ECCLESIASTICA IN KENIA CONSTITUITUR MOMBASAËNSIS NOMINE',
    note:
      'Erects the new ecclesiastical province of Mombasa (Kenya), raising the Diocese of '
      + 'Mombasa to a metropolitan archdiocese with Garissa, withdrawn from Nairobi, as its '
      + 'suffragan: "...novam, praeter alias, Provinciam ecclesiasticam Mombasaënsem ita '
      + 'instituimus, ut cognominis dioecesis ad gradum evehatur archidioecesis metropolitanae '
      + 'eique tamquam suffraganea dioecesis subiciatur Garissaënsis...".',
  },
  'john-paul-ii|raishahiensis|1990-05-19': {
    argumentum:
      'RAISHAHIENSIS* IN BANGLADESA NOVA CONDITUR DIOECESIS RAISHAHIENSIS NOMINE',
    note:
      'Detaches the civil regions of Rajshahi, Pabna and Bogra (except the Panchbibi upazila) '
      + 'from the Diocese of Dinajpur and erects the new Diocese of Rajshahi (Bangladesh), '
      + 'suffragan to Dhaka: "...In Bangladesa novam dioecesim condimus Raishahiensem nomine, '
      + 'quae constet territorio civilium Regionum vulgo « Rajshahi », « Pabna » et « Bogra » a '
      + 'Dinaipurensi detracto dioecesi...".',
  },
  'john-paul-ii|kotidoensis|1990-05-20': {
    argumentum:
      'KOTIDOENSIS* IN UGANDA NOVA DIOECESIS CONDITUR',
    note:
      'Detaches the civil district of Kotido from the Diocese of Moroto and erects the new '
      + 'Diocese of Kotido (Uganda), suffragan to Kampala, with its cathedral at Kanawat: "...ut '
      + 'civilis regio Kotido nomine ab illa seiuncta efficiatur nova dioecesis in posterum '
      + 'tempus Kotidoensis quae dicetur...".',
  },
  'john-paul-ii|kisumuensis|1990-05-21': {
    argumentum:
      'KISUMUENSIS* IN KENIAE FINIBUS NOVA CONSTITUITUR PROVINCIA ECCLESIASTICA, VIDELICET '
      + 'KISUMUENSIS',
    note:
      'Erects the new ecclesiastical province of Kisumu (Kenya), raising the Diocese of Kisumu '
      + 'to a metropolitan archdiocese with Bungoma, Eldoret, Kakamega, Kisii and Lodwar, '
      + 'withdrawn from Nairobi, as suffragans: "...Dioecesim Kisumuensem attollimus ad '
      + 'dignitatem et statum Archidioecesis Metropolitanae, quae posthac suffraganeas '
      + 'complectetur dioeceses Bungomaënsem, Eldoretensem, Kakamegaënsem, Kisiianam et '
      + 'Loduarinam...". The province constituted is what the argumentum states (Ruling 9).',
  },
  'john-paul-ii|nyeriensis|1990-05-21': {
    argumentum:
      'NYERIENSIS* IN KENIA NOVA PROVINCIA ECCLESIASTICA CONSTITUITUR NYERIENSIS NOMINE',
    note:
      'Detaches the Dioceses of Nyeri, Embu, Marsabit, Meru and Murang\'a from the province of '
      + 'Nairobi and erects the new ecclesiastical province of Nyeri (Kenya), Nyeri becoming its '
      + 'metropolitan see: "...atque ex iis, novam provinciam ecclesiasticam condimus Nyeriensem '
      + 'nomine; quarum quidem Ecclesiarum prima erit metropolitana eodem servato Nyeriensi '
      + 'nomine...".',
  },
  'john-paul-ii|cachoeirensis-australis|1990-06-17': {
    argumentum:
      'CACHOEIRENSIS AUSTRALIS* NONNULLIS DISIUNCTIS TERRITORIIS A SEDE SANCTAE MARIAE NOVA '
      + 'CONDITUR DIOECESIS CACHOEIRENSIS AUSTRALIS COGNOMINANDA',
    note:
      'Detaches ten municipalities (Agudo, Arroio do Tigre, Cacapava do Sul, Cachoeira do Sul, '
      + 'Cerro Branco, Ibarama, Paraiso do Sul, Santana da Boa Vista, Segredo, Sobradinho) from '
      + 'the Diocese of Santa Maria and erects the new Diocese of Cachoeira do Sul (Brazil), '
      + 'suffragan to Porto Alegre: "...Ex hoc territorio distracto dioecesim condimus '
      + 'Cachoeirensem Australem appellandam, iisdem terminata finibus quibus municipia quae '
      + 'diximus.".',
  },
  'john-paul-ii|gokwensis|1990-06-17': {
    argumentum:
      'GOKWENSIS* GOKWENSIS DIOECESIS IN ZIMBABUAE FINIBUS CONDITUR',
    note:
      'Detaches the civil districts of Gokwe and Omay and the part of Nkayi north of the '
      + 'Shangani river from the Diocese of Hwange and erects the new Diocese of Gokwe '
      + '(Zimbabwe), suffragan to Harare: "...Ex quibus distractis agris novam dioecesim '
      + 'condimus Gokwensem cognominandam, quae Metropolitanae Ecclesiae Hararensi in Zimbabua '
      + 'suffraganea erit...".',
  },
  'john-paul-ii|complutensis|1990-07-23': {
    argumentum:
      'COMPLUTENSIS* IN HISPANIA NOVA CONDITUR DIOECESIS COMPLUTENSIS NOMINE',
    note:
      'Detaches fifty-three municipalities east of Madrid (Alcala de Henares, Torrejon de '
      + 'Ardoz, Coslada, Arganda del Rey and others) from the Archdiocese of Madrid and erects '
      + 'the new Diocese of Alcala de Henares (Spain), suffragan to Madrid, which loses its '
      + 'Complutensis title: "...atque ex ita distractis locis novam condimus dioecesim '
      + 'Complutensem appellandam...mandantes ut Complutensis titulus, archidioecesi Matritensi '
      + 'adnexus, nunc et in posterum ab eadem auferatur.".',
  },
  'john-paul-ii|matritensis|1990-07-23': {
    argumentum:
      'MATRITENSIS* NONNULLIS DIVISIS TERRITORIIS MATRITENSIS ARCHIDIOECESIS, PROVINCIA '
      + 'ECCLESIASTICA MATRITENSIS CONSTITUITUR ET MATRITENSIS SEDES AD DIGNITATEM ECCLESIAE '
      + 'METROPOLITANAE EVEHITUR',
    note:
      'Constitutes the new ecclesiastical province of Madrid, raising the Archdiocese of '
      + 'Madrid, until now immediately subject to the Holy See, to a metropolitan see with the '
      + 'Dioceses of Alcala de Henares and Getafe, erected the same day, as suffragans: '
      + '"...Matritensem Sedem, ad hoc usque tempus Sanctae Sedi immediate subiectam, ad '
      + 'dignitatem evehimus Metropolitanae Ecclesiae...Novam constitutam Ecclesiasticam '
      + 'Provinciam Matritensem constare volumus ex Ecclesia cognomini atque noviter conditis '
      + 'dioecesibus Complutensi et Xetafensi...". The province constituted is what the '
      + 'argumentum leads with, so this is an erection; the curation script proposed an '
      + 'elevation on the EVEHITUR of its second clause.',
  },
  'john-paul-ii|xatafensis|1990-07-23': {
    argumentum:
      'XETAFENSIS* IN HISPANIA NOVA ERIGITUR DIOECESIS XATAFENSIS NOMINE',
    note:
      'Detaches forty-eight municipalities south and west of Madrid (Getafe, Leganes, '
      + 'Alcorcon, Mostoles, Fuenlabrada, Parla, Aranjuez and others) from the Archdiocese of '
      + 'Madrid and erects the new Diocese of Getafe (Spain), suffragan to Madrid: "...Ex his '
      + 'distractis territoriis novam condimus dioecesim Xetafensem appellandam, iisdem '
      + 'conclusam finibus quibus praedicta municipia terminantur.". The heading spells the see '
      + '"XATAFENSIS" against the body\'s Xetafensem, as quoted.',
  },
  'john-paul-ii|accraensis|1991-07-06': {
    argumentum:
      'ACCRAËNSIS* IN GANAE FINIBUS NOVA PROVINCIA ECCLESIASTICA CONSTITUITUR ACCRAËNSIS NOMINE',
    note:
      'Erects the new ecclesiastical province of Accra, Ghana\'s third, raising the Diocese of '
      + 'Accra (erected by Pius XII in 1950) to a metropolitan archdiocese with Keta-Ho, '
      + 'withdrawn from Cape Coast, and Koforidua, erected the same day, as suffragans: '
      + '"...Accraënsem dioecesim...metropolitanam facimus archidioecesim eodem servato '
      + 'nomine...novam provinciam ecclesiasticam Accraënsem nomine constituimus.".',
  },
  'john-paul-ii|tabukensis|1991-07-06': {
    argumentum:
      'TABUKENSIS* NOVUS CONSTITUITUR VICARIATUS APOSTOLICUS TABUKENSIS APPELLANDUS',
    note:
      'Detaches the civil provinces of Kalinga-Apayao from the Apostolic Vicariate of the '
      + 'Mountain Provinces and erects the new Apostolic Vicariate of Tabuk (Philippines), '
      + 'within the province of Tuguegarao and entrusted to the CICM missionaries: "...a '
      + 'Vicariatu Apostolico Montano distrahimus, idque deinde novum Vicariatum Apostolicum '
      + 'constituet Tabukensem...".',
  },
  'john-paul-ii|tlapensis|1992-01-04': {
    argumentum:
      'TLAPENSIS* DISTRACTIS TERRITORIIS A DIOECESI CHILPANCINGENSI-CHILAPENSI NOVA DIOECESIS '
      + 'ERIGITUR TLAPENSIS',
    note:
      'Detaches sixteen municipalities of the Montana region (Tlapa, Alcozauca, Alpoyeca, '
      + 'Atlamajalcingo del Monte, Atlixtac, Copanatoyac, Cualac, Huamuxtitlan, Malinaltepec, '
      + 'Metlatonoc, Olinala, Tlacoapa, Tlalixtaquilla, Xalpatlahuac, Xochihuehuetlan, '
      + 'Zapotitlan Tablas) from the Diocese of Chilpancingo-Chilapa and erects the new Diocese '
      + 'of Tlapa (Mexico), suffragan to Acapulco: "...quorum ex summa novam efficimus '
      + 'constituimusque dioecesim posterum in tempus Tlapensem nuncupandam...".',
  },
  'john-paul-ii|ghikongoroensis|1992-03-06': {
    argumentum:
      'GHIKONGOROËNSIS* IN RUANDA NOVA DIOECESIS CONDITUR GHIKONGOROËNSIS',
    note:
      'Detaches the civil prefecture of Gikongoro from the Diocese of Butare and erects the '
      + 'new Diocese of Gikongoro (Rwanda), suffragan to Kigali: "...civilem provinciam, cui '
      + 'vulgare nomen Ghikongoro, totam seiungi atque in sui iuris dioecesim novam, posthac '
      + 'Ghikongoroënsem nuncupandam, converti...".',
  },
  'john-paul-ii|yamussukroensis|1992-03-06': {
    argumentum:
      'YAMUSSUKROËNSIS* IN LITORE EBURNEO NOVA CONDITUR DIOECESIS YAMUSSUKROËNSIS NOMINE',
    note:
      'Detaches the civil district of Yamoussoukro from the Diocese of Bouake and erects the '
      + 'new Diocese of Yamoussoukro (Ivory Coast), suffragan to Abidjan: "...ex eoque novam '
      + 'condimus dioecesim Yamussukroënsem appellandam, quam metropolitanae Sedi Abidianensi '
      + 'suffraganeam facimus...".',
  },
  'john-paul-ii|parralensis|1992-05-11': {
    argumentum:
      'PARRALENSIS* LOCIS NONNULLIS DE ARCHIDIOECESI CHIHUAHUENSI ALIISQUE DE VICARIATU '
      + 'TARAHUMARENSI DETRACTIS NOVA CONDITUR DIOECESIS PARRALENSIS',
    note:
      'Detaches thirteen municipalities (Allende, Balleza, Coronado, El Tule, Hidalgo del '
      + 'Parral, Huejotitan, Jimenez, Lopez, Matamoros, Rosario, San Francisco del Oro, Santa '
      + 'Barbara, Valle de Zaragoza) from the Archdiocese of Chihuahua and the parishes of '
      + 'Guadalupe y Calvo and Atascaderos from the Apostolic Vicariate of Tarahumara and erects '
      + 'the new Diocese of Parral (Mexico), suffragan to Chihuahua: "...quibus quindecim locis '
      + 'ita distractis coniuncteque sumptis novam Ecclesiam particularem condimus nomine '
      + 'Parralensem...".',
  },
  'john-paul-ii|cumanensis|1992-05-16': {
    argumentum:
      'CUMANENSIS* IN BOLIVIA PROVINCIA ECCLESIASTICA CONDITUR CUMANENSIS',
    note:
      'Withdraws the Diocese of Cumana from the province of Ciudad Bolivar, raises it to a '
      + 'metropolitan archdiocese and erects the new ecclesiastical province of Cumana '
      + '(Venezuela) with Barcelona and Margarita as suffragans: "...Cumanensem Ecclesiam a '
      + 'Metropolitana archidioecesi Civitatis Bolivarensis deducimus eandemque ad gradum '
      + 'archiepiscopalis Ecclesiae Metropolitanae evehimus...ita ut nunc condita Provincia '
      + 'Ecclesiastica Cumanensis ex ipsa constet Cumanensi Ecclesia ac dioecesibus Barcinonensi '
      + 'in Venetiola atque Margaritensi...". The province is what the argumentum states '
      + '(CONDITUR).',
  },
  'john-paul-ii|bontocensis-lavagensis|1992-07-25': {
    argumentum:
      'BONTOCEN.-LAVAGEN.* EX DISTRACTO TERRITORIO A VICARIATU APOSTOLICO MONTANO NOVUS '
      + 'INSTITUITUR VICARIATUS APOSTOLICUS BONTONCENSIS-LAVAGENSIS',
    note:
      'Detaches the civil provinces of Mountain Province and Ifugao from the Apostolic '
      + 'Vicariate of the Mountain Provinces and erects the new Apostolic Vicariate of '
      + 'Bontoc-Lagawe (Philippines), within the province of Nueva Segovia: "...illudque '
      + 'Vicariatum Apostolicum constituimus Bontocensem-Lavagensem positura vero intra '
      + 'Provinciae ecclesiasticae Novae Segobiae terminos...". The heading abbreviates the '
      + 'toponym and prints "BONTONCENSIS", as quoted; the curation script abstained because '
      + 'INSTITUITUR matches no idiom.',
  },
  'john-paul-ii|carorensis|1992-07-25': {
    argumentum:
      'CARORENSIS* IN VENETIOLA NOVA DIOECESIS CONDITUR CARORENSIS NOMINE',
    note:
      'Detaches the civil districts of Torres and Urdaneta (Lara) from the Archdiocese of '
      + 'Barquisimeto and erects the new Diocese of Carora (Venezuela), suffragan to '
      + 'Barquisimeto: "...ex quibus ita submotis locis novam dioecesim Carorensem in posterum '
      + 'appellandam constituimus...".',
  },
  'john-paul-ii|vallispaschalensis|1992-07-25': {
    argumentum:
      'VALLISPASCHALENSIS* DIOECESIS CALABOCENSIS DIVIDITUR ET NOVA CONSTITUITUR DIOECESIS '
      + 'VALLISPASCHALENSIS',
    note:
      'Detaches the civil districts of Monagas, Ribas, Infante and Zaraza (Guarico) from the '
      + 'Diocese of Calabozo and erects the new Diocese of Valle de la Pascua (Venezuela), '
      + 'suffragan to Cumana: "...ex iisque novam condimus dioecesim Vallispaschalensem '
      + 'denominandam, iisdem circumscriptam finibus, quibus ipsi districtus, simul sumpti, lege '
      + 'civili ad prresens terminantur.".',
  },
  'john-paul-ii|ernakulamensis-angamaliensis|1992-12-16': {
    argumentum:
      'ERNAKULAMENSIS - ANGAMALIENSIS* ARCHIEPISCOPATUS MAIOR ERNAKULAMENSIS-ANGAMALIENSIS',
    note:
      'Constitutes the Syro-Malabar Church as a major archiepiscopal Church named '
      + 'Ernakulam-Angamaly, its territory the provinces of Ernakulam and Changanacherry and its '
      + 'major archbishop seated at Ernakulam: "...Ecclesiam Syro-Malabarensem constituimus '
      + 'Ecclesiam archiepiscopalem maiorem Ernakulamensem-Angamaliensem nomine appellandam...". '
      + 'The heading states no verb ("ARCHIEPISCOPATUS MAIOR ERNAKULAMENSIS-ANGAMALIENSIS"), so '
      + 'the curation script abstained; filed on the body\'s constituimus as \'Fagarasiensis\' '
      + 'of 2005 is, its argumentum saying ARCHIEPISCOPATUS MAIOR ... CONSTITUITUR.',
  },
  'john-paul-ii|keningauensis|1992-12-17': {
    argumentum:
      'KENINGAUENSIS* NOVA DIOECESIS CONDITUR,KENINGAUENSIS SCILICET IN MALAYSIA ORIENTALI',
    note:
      'Detaches the Interior Division (Bahagian Pendalaman) from the Diocese of Kota Kinabalu '
      + 'and erects the new Diocese of Keningau (Sabah, Malaysia), suffragan to Kuching: "...a '
      + 'dioecesi Kotakinabaluensi separamus, quod efficiet posthac novam dioecesim '
      + 'Keningauensem appellandam a principe huius regionis urbe.". The heading prints '
      + '"CONDITUR,KENINGAUENSIS" without a space, as quoted.',
  },
  'john-paul-ii|esekanensis|1993-03-22': {
    argumentum:
      'ESEKANENSIS* IN CAMMARUNIA NOVA CONDITUR DIOECESIS NOMINE ESEKANENSIS',
    note:
      'Detaches the Departement de Nyong-et-Kelle from the Archdiocese of Douala and erects '
      + 'the new Diocese of Eseka (Cameroon), suffragan to Douala: "...ex eaque novam condimus '
      + 'dioecesim Esekanensem appellandam, quam metropolitanae Sedi Dualaënsi suffraganeam '
      + 'facimus...".',
  },
  'john-paul-ii|maulamyinensis|1993-03-22': {
    argumentum:
      'MAULAMYINENSIS* IN MYANMAR NOVA CONDITUR DIOECESIS MAULAMYINENSIS',
    note:
      'Detaches the southern half of Mon State and the whole Tenasserim Division from the '
      + 'Archdiocese of Yangon and erects the new Diocese of Mawlamyine (Myanmar), suffragan to '
      + 'Yangon: "...ex iisque novam condimus dioecesim nomine Maulamyinensem, quam '
      + 'metropolitanae Sedi Yangonensi suffraganeam facimus...".',
  },
  'john-paul-ii|palangkaraiensis|1993-04-05': {
    argumentum:
      'PALANGKARAIEN.* IN INDONESIA NOVA CONDITUR DIOECESIS PALANGKARAIENSIS',
    note:
      'Detaches the civil province of Central Kalimantan (Kalimantan Tengah) from the Diocese '
      + 'of Banjarmasin and erects the new Diocese of Palangkaraya (Indonesia), suffragan to '
      + 'Pontianak: "...ex eaque novam constituimus dioecesim ab urbe principe eiusdem regionis '
      + 'Palangkaraiensem appellandam...". The heading abbreviates the toponym to '
      + '"PALANGKARAIEN.", as quoted.',
  },
  'john-paul-ii|gumlaensis|1993-05-28': {
    argumentum:
      'GUMLAËNSIS* IN INDIA NOVA CONDITUR DIOECESIS GUMLAËNSIS NOMINE',
    note:
      'Detaches the northern part of the civil district of Gumla from the Archdiocese of '
      + 'Ranchi and erects the new Diocese of Gumla (India), suffragan to Ranchi: "...ex eaque '
      + 'novam constituimus dioecesim ab urbe principe eiusdem regionis Gumlaënsem appellandam, '
      + 'quam suffraganeam metropolitanae Sedi Ranchiensi facimus...".',
  },
  'john-paul-ii|pilznensis|1993-05-28': {
    argumentum:
      'PILZNENSIS* NOVA DIOECESIS IN BOHEMIA PILZNENSIS ERIGITUR',
    note:
      'Detaches eight deaneries from the Archdiocese of Prague, three from the Diocese of '
      + 'Ceske Budejovice and two from Litomerice and erects the new Diocese of Plzen (Czech '
      + 'Republic), suffragan to Prague: "...ex iisque novam condimus dioecesim Pilznensem '
      + 'appellandam, quam metropolitanae Sedi Fragensi subicimus...". The body prints '
      + '"Fragensi" for Pragensi.',
  },
  'john-paul-ii|simdegaensis|1993-05-28': {
    argumentum:
      'SIMDEGAËNSIS* IN INDIA NOVA CONDITUR DIOECESIS SIMDEGAËNSIS',
    note:
      'Detaches the southern part of the civil district of Gumla (the Simdega sub-division) '
      + 'from the Archdiocese of Ranchi and erects the new Diocese of Simdega (India), suffragan '
      + 'to Ranchi: "...ex eaque novam condimus dioecesim ab urbe principe eiusdem regionis '
      + 'Simdegaënsem appellandam, quam suffraganeam metropolitanae Sedi Ranchiensi facimus...".',
  },
  'john-paul-ii|srikakulamensis|1993-07-01': {
    argumentum:
      'SRIKAKULAMENSIS* IN INDIA NOVA CONDITUR DIOECESIS SRIKAKULAMENSIS',
    note:
      'Detaches the civil district of Srikakulam and the taluks of Parvathipuram, Kurupam and '
      + 'Cheepurupalli (Vizianagaram district) from the Diocese of Visakhapatnam and erects the '
      + 'new Diocese of Srikakulam (India), suffragan to Hyderabad, with its cathedral at '
      + 'Palakonda: "...ex iisque novam constituimus dioecesim ab urbe principe eiusdem regionis '
      + 'Srikakulamensem appellandam, quam metropolitanae Sedi Hyderabadensi suffraganeam '
      + 'facimus...".',
  },
  'john-paul-ii|guruensis|1993-12-06': {
    argumentum:
      'GURUENSIS* IN MOZAMBICO NOVA CONDITUR DIOECESIS GURUENSIS',
    note:
      'Detaches the civil districts of Gurue, Namarroi, Ile, Alto Molocue, Gile and Pebane and '
      + 'the Molumbo part of Milange from the Diocese of Quelimane and erects the new Diocese of '
      + 'Gurue (Mozambique), suffragan to Beira: "...ex iisque novam constituimus dioecesim '
      + 'Guruensem, quam metropolitanae Sedi Beirensi suffraganeam facimus...".',
  },
  'john-paul-ii|poenonomensis|1993-12-18': {
    argumentum:
      'POENONOMENSIS* IN PANAMA NOVA CONDITUR DIOECESIS POENONOMENSIS',
    note:
      'Detaches the civil province of Cocle from the Archdiocese of Panama and erects the new '
      + 'Diocese of Penonome (Panama), suffragan to Panama: "...atque ex ita distracto '
      + 'territorio novam constituimus doecesim Poenonomensem appellandam...".',
  },
  'john-paul-ii|baturiensis|1994-02-03': {
    argumentum:
      'BATURIENSIS* INT RA CAMMARUNIAE FINES NOVA CONDITUR DIOECESIS BATURIENSIS',
    note:
      'Detaches the Departement de Kadei from the Diocese of Bertoua and erects the new '
      + 'Diocese of Batouri (Cameroon), suffragan to Yaounde: "...ex eaque novam constituimus '
      + 'dioecesim ab urbe principe eiusdem regionis Baturiensem appellandam, quam '
      + 'metropolitanae Sedi Yaundensi suffraganeam facimus...". The heading prints "INT RA" '
      + 'with a space, as quoted.',
  },
  'john-paul-ii|runduensis|1994-03-14': {
    argumentum:
      'RUNDUENSIS* VICARIATUS APOSTOLICUS CONDITUR IN NAMIBIAE FINIBUS, RUNDUENSIS APPELLANDUS',
    note:
      'Detaches the regions of Okavango and Caprivi and parts of Otjozondjupa and Otjikoto '
      + 'from the Apostolic Vicariate of Windhoek and erects the new Apostolic Vicariate of '
      + 'Rundu (Namibia): "...Novum Vicariatum Apostolicum condimus Runduensem appellandum, qui '
      + 'territorium vel regionem civilem populari loquela Okavango et Caprivi...complectitur, '
      + 'quodque a Vicariatu Apostolico Vindhoekensi distrahitur.".',
  },
  'john-paul-ii|vindhoekensis|1994-03-14': {
    argumentum:
      'VINDHOEKENSIS* PROVINCIA ECCLESIASTICA IN NAMIBIA CONSTITUITUR, VINDHOEKENSIS APPELLANDA',
    note:
      'Erects the ecclesiastical province of Windhoek (Namibia), formed of the Apostolic '
      + 'Vicariate of Windhoek, raised to a metropolitan archdiocese, the Diocese of '
      + 'Keetmanshoop and the Apostolic Vicariate of Rundu, both constituted the same day: '
      + '"...Provinciam Ecclesiasticam condimus Vindhoekensem, quam efformant Vicariatus '
      + 'Apostolicus eiusdem nominis, qui posthac ad Archidioecesim Metropolitanam evehetur...".',
  },
  'john-paul-ii|ibadanensis|1994-03-16': {
    argumentum:
      'IBADANENSIS* IN NIGERIAE FINIBUS NOVA A PROVINCIA ECCLESIASTICA CONSTITUITUR '
      + 'IBADANENSIS NOMINE',
    note:
      'Detaches the Dioceses of Ibadan, Ado-Ekiti, Ondo and Oyo from the province of Lagos and '
      + 'erects the new ecclesiastical province of Ibadan (Nigeria), raising Ibadan to a '
      + 'metropolitan archdiocese: "...atque ex his efficimus Provinciam Ecclesiasticam '
      + 'Ibadanensem, cuius Sedes princeps erit Ecclesia Ibadanensis, quam ad gradum et '
      + 'dignitatem archidioecesis metropolitanae evehimus...". The heading prints "NOVA A '
      + 'PROVINCIA", as quoted.',
  },
  'john-paul-ii|arassatubensis|1994-03-23': {
    argumentum:
      'ARASSATUBENSIS* IN BRASILIA NOVA CONDITUR DIOECESIS ARASSATUBENSIS',
    note:
      'Detaches eighteen municipalities (Aracatuba, Andradina, Bento de Abreu, Bilac, Birigui, '
      + 'Castilho, Coroados, Gabriel Monteiro, Guaracai, Guararapes, Lavinia, Mirandopolis, '
      + 'Murutinga do Sul, Nova Independencia, Piacatu, Rubiacea, Santopolis do Aguapei, '
      + 'Valparaiso) from the Diocese of Lins and erects the new Diocese of Aracatuba (Brazil), '
      + 'suffragan to Botucatu: "...quibus subductis locis dioecesim Arassatubensem posthac '
      + 'appellandam erigimus et constituimus...".',
  },
  'john-paul-ii|abugensis|1994-03-26': {
    argumentum:
      'ABUGENSIS* IN NIGERIA NOVA PROVINCIA ECCLESIASTICA ABUGENSIS CONSTITUITUR',
    note:
      'Detaches the Dioceses of Abuja, Idah, Lokoja and Makurdi from the province of Kaduna '
      + 'and erects the new ecclesiastical province of Abuja (Nigeria), raising Abuja to a '
      + 'metropolitan archdiocese: "...atque ex his efficimus Provinciam Ecclesiasticam '
      + 'Abugensem...cuius Sedes princeps erit Ecclesia Abugensis, quam ad gradum et dignitatem '
      + 'archidioecesis metropolitanae evehimus...".',
  },
  'john-paul-ii|calabarensis|1994-03-26': {
    argumentum:
      'CALABARENSIS* IN NIGERIA NOVA PROVINCIA ECCLESIASTICA CALABARENSIS CONSTITUITUR',
    note:
      'Detaches the Dioceses of Calabar, Ikot Ekpene, Port Harcourt, Ogoja and Uyo from the '
      + 'province of Onitsha and erects the new ecclesiastical province of Calabar (Nigeria), '
      + 'raising Calabar to a metropolitan archdiocese: "...atque ex his efficimus Provinciam '
      + 'ecclesiasticam nomine Calabarensem, cuius Sedes princeps erit Ecclesia Calabarensis, '
      + 'quam ad gradum et dignitatem archidioecesis metropolitanae evehimus...".',
  },
  'john-paul-ii|iosensis|1994-03-26': {
    argumentum:
      'IOSENSIS* NOVA CONSTITUITUR PROVINCIA ECCLESIASTICA IN NIGERIA, IOSENSIS APPELLANDA',
    note:
      'Detaches the Dioceses of Jos, Maiduguri and Yola from the province of Kaduna and erects '
      + 'the new ecclesiastical province of Jos (Nigeria), raising Jos to a metropolitan '
      + 'archdiocese: "...novam condimus Provinciam Ecclesiasticam, Iosensem appellandam, in '
      + 'ipsa Sede Iosensi, quam ad Archidioecesis Metropolitanae dignitatem attollimus...".',
  },
  'john-paul-ii|overriensis|1994-03-26': {
    argumentum:
      'OVERRIENSIS* IN NIGERIAE FINIBUS NOVA PROVINCIA ECCLESIASTICA',
    note:
      'Detaches the Dioceses of Owerri, Aba, Ahiara, Okigwe, Orlu and Umuahia from the '
      + 'province of Onitsha and erects the new ecclesiastical province of Owerri (Nigeria), '
      + 'raising Owerri to a metropolitan archdiocese: "...atque ex his constituimus Provinciam '
      + 'Ecclesiasticam Overriensem, quarum dioecesium primam, scilicet Overriensem, ad gradum '
      + 'et dignitatem archidioecesis metropolitanae attollimus...". The heading states no verb '
      + '("NOVA PROVINCIA ECCLESIASTICA"), so the curation script abstained and the act is read '
      + 'from the body.',
  },
  'john-paul-ii|lahorensis|1994-04-23': {
    argumentum:
      'LAHORENSIS* PROVINCIA ECCLESIASTICA LAHORENSIS CONDITUR ATQUE DIOECESIS EIUSDEM NOMINIS '
      + 'AD ARCHIDIOECESIS STATUM ATTOLLITUR',
    note:
      'Erects the new ecclesiastical province of Lahore (Pakistan), separating the Diocese of '
      + 'Lahore from the province of Karachi, raising it to a metropolitan archdiocese and '
      + 'giving it Faisalabad, Islamabad-Rawalpindi and Multan as suffragans: "...Provinciam '
      + 'ecclesiasticam condimus Lahorensem, quam adhuc dioecesis eiusdem nominis constituet, '
      + 'quae, a metropolitico iure Karachiensis Ecclesiae separata, posthac ad Archidioecesim '
      + 'Metropolitanam evehetur...". The province is what the argumentum leads with (CONDITUR), '
      + 'ATQUE introducing the elevation, so this is an erection; the curation script proposed '
      + 'an elevation on ATTOLLITUR.',
  },
  'john-paul-ii|bulauaiensis|1994-06-10': {
    argumentum:
      'BULAUAIENSIS* NOVA PROVINCIA ECCLESIASTICA IN ZIMBABUANA CIVITATE CONDITUR BULAUAIENSIS '
      + 'COGNOMINANDA',
    note:
      'Erects the new ecclesiastical province of Bulawayo (Zimbabwe), raising Bulawayo to a '
      + 'metropolitan archdiocese with Gweru and Hwange as suffragans: "...Novam Provinciam '
      + 'ecclesiasticam in Zimbabua condimus scilicet Bulauaiensem, quam ad gradum '
      + 'archidioecesis metropolitanae attollimus, cui videlicet veluti suffraganeae nectantur '
      + 'et subiciantur dioeceses Gueruensis et Huangensis.".',
  },
  'john-paul-ii|berolinensis|1994-06-27': {
    argumentum:
      'BEROLINENSIS* PROVINCIA ECCLESIASTICA BEROLINENSIS CONSTITUITUR',
    note:
      'Constitutes the ecclesiastical province of Berlin, raising the Diocese of Berlin to a '
      + 'metropolitan see with Dresden-Meissen and the Diocese of Gorlitz, erected the same day '
      + 'from the apostolic administration, as suffragans, under the concordat: "...Berolinensem '
      + 'sedem episcopalem ad condicionem attollimus metropolitanae ecclesiae...Commemorata '
      + 'autem provincia quam novam fieri iubemus Berolinensis constabit ex ecclesia eiusdem '
      + 'nominis necnon Dresdensi-Misnensi dicione tunc etiam ab integro excitata dioecesi '
      + 'Gorlicensi.". The province constituted is what the argumentum states (Ruling 9).',
  },
  'john-paul-ii|erfordiensis|1994-06-27': {
    argumentum:
      'ERFORDIENSIS* IN REPUBLICA FOEDERATA GERMANIAE NOVA CONSTITUITUR DIOECESIS ERFORDIENSIS '
      + 'NOMINE',
    note:
      'Detaches the fifteen deaneries of the Bischofliches Amt Erfurt-Meiningen from the '
      + 'Dioceses of Fulda and Wurzburg, with boundary adjustments against Magdeburg, '
      + 'Dresden-Meissen, Paderborn and Hildesheim, and erects the new Diocese of Erfurt '
      + '(Germany), suffragan to Paderborn, under the convention with Thuringia of 14 June 1994: '
      + '"...a dioecesi Fuldensi et a dioecesi Herbipolensi separamus atque ex ita distracto '
      + 'territorio, cum mutationibus, quae infra describuntur, novam dioecesim Erfordiensem '
      + 'appellandam constituimus.".',
  },
  'john-paul-ii|gorlicensis|1994-06-27': {
    argumentum:
      'GORLICENSIS* IN REPUBLICA FOEDERATA GERMANIAE GORLICENSIS DIOECESIS CONDITUR',
    note:
      'Constitutes the Apostolic Administration of Gorlitz (the deaneries of Cottbus, '
      + 'Finsterwalde-Lubben, Gorlitz, Neuzelle and Senftenberg, with boundary adjustments) as '
      + 'the new Diocese of Gorlitz (Germany), suffragan to Berlin, raised to metropolitan rank '
      + 'the same day, under the convention with Brandenburg and Saxony of 4 May 1994: "...ut '
      + 'memorata Administratio Apostolica Gorlicensis...ad gradum et dignitatem dioecesis, '
      + 'Gorlicensis appellandae, constituatur ac erigatur.". Stated by the argumentum as a '
      + 'diocese CONDITUR and filed on those words, the body working it by raising the '
      + 'administration (Ruling 9).',
  },
  'john-paul-ii|magdeburgensis|1994-06-27': {
    argumentum:
      'MAGDEBURGENSIS* IN REPUBLICA FOEDERATA GERMANIAE NOVA DIOECESIS ERIGITUR MAGDEBURGENSIS '
      + 'APPELLANDA',
    note:
      'Detaches the thirteen deaneries of the Bischofliches Amt Magdeburg from the Archdiocese '
      + 'of Paderborn and the Diocese of Hildesheim, with boundary adjustments against '
      + 'Hildesheim, Gorlitz, Dresden-Meissen, Erfurt and Fulda, and erects the new Diocese of '
      + 'Magdeburg (Germany), suffragan to Paderborn, under the convention of 13 April 1994: '
      + '"...ab archidioecesi Paderbornensi et a dioecesi Hildesiensi separetur atque ex ita '
      + 'distracto territorio, cum mutationibus quae infra describuntur, nova dioecesis, '
      + 'Magdeburgensis appellanda, constituatur ac erigatur.".',
  },
  'john-paul-ii|anehensis|1994-07-01': {
    argumentum:
      'ANEHENSIS* NOVA DIOECESIS CONDITUR IN TOGO, ANEHENSIS APPELLANDA',
    note:
      'Detaches the civil districts of Lacs, Vo, Yoto and Afagnan from the Diocese of Lome and '
      + 'erects the new Diocese of Aneho (Togo), suffragan to Lome: "...Novam dioecesim condimus '
      + 'Anehensem appellandam, quae territorium districtuum civilium populari sermone « Lacs », '
      + '« Vo », « Yoto » et « Afagnan » complectetur, a dioecesi Lomensi distractum.".',
  },
  'john-paul-ii|emeritensis-augustana-pacensis|1994-07-28': {
    argumentum:
      'EMERITENSIS AUGUSTANA-PACENSIS* NOVA CONSTITUITUR IN HISPANIA PROVINCIA ECCLESIASTICA '
      + 'EMERITENSIS AUGUSTANA-PACENSIS ET SEDES AD METROPOLITANAE ECCLESIAE STATUM ATTOLLITUR',
    note:
      'Erects the new ecclesiastical province of Merida-Badajoz (Extremadura, Spain): the '
      + 'Diocese of Badajoz, renamed Merida-Badajoz, is withdrawn from Seville and raised to a '
      + 'metropolitan see, with Coria-Caceres and Plasencia (from Seville and Toledo) as '
      + 'suffragans and a concathedral at Merida: "...Condimus Provinciam Ecclesiasticam, '
      + 'Emeritensem Augustanam — Pacensem appellandam, ac Pacensem Sedem episcopalem, cuius '
      + 'nomen hoc ipso actu in Emeritensem Augustanam — Pacensem mutatur a Metropolitana '
      + 'Ecclesia Hispalensi seiungitur, atque ad Metropolitanae Ecclesiae gradum evehimus.". '
      + 'The province constituted is what the argumentum leads with, so this is an erection; the '
      + 'curation script proposed an elevation on the ATTOLLITUR of its second clause.',
  },
  'john-paul-ii|hamburgensis|1994-10-24': {
    argumentum:
      'HAMBURGENSIS* NOVA PROVINCIA ECCLESIASTICA HAMBURGENSIS CONSTITUITUR',
    note:
      'Constitutes the new ecclesiastical province of Hamburg (Germany): from the Hamburg and '
      + 'Schleswig-Holstein parts of the Dioceses of Osnabruck and Hildesheim and the '
      + 'Bischofliches Amt Schwerin erects the new metropolitan Archdiocese of Hamburg, with '
      + 'Osnabruck (from Cologne) and Hildesheim (from Paderborn) as suffragans, under the '
      + 'convention of 22 September 1994: "...novam sedem Metropolitanam Hamburgensem '
      + 'appellandam condere eidemque conferre iura et privilegia quibus ceterae metropolitanae '
      + 'sedes, ad normam iuris communis, gaudent. Nova Provincia Hamburgensis constituetur ex '
      + 'Ecclesia Metropolitana noviter constituta...".',
  },
  'john-paul-ii|buakensis|1994-12-19': {
    argumentum:
      'BUAKENSIS* IN LITORE EBURNEO CONSTITUITUR NOVA PROVINCIA ECCLESIASTICA BUAKENSIS, CUIUS '
      + 'METROPOLITANA ECCLESIA ERIT SEDES EIUSDEM NOMINIS',
    note:
      'Detaches the Dioceses of Bouake, Abengourou, Bondoukou and Yamoussoukro from the '
      + 'province of Abidjan and erects the new ecclesiastical province of Bouake (Ivory Coast), '
      + 'raising Bouake to a metropolitan archdiocese: "...atque ex his efficimus Provinciam '
      + 'ecclesiasticam Buakensem, cuius Sedes princeps erit Ecclesia Buakensis, quam ad gradum '
      + 'et dignitatem archidioecesis metropolitanae evehimus...".',
  },
  'john-paul-ii|gagnoaensis|1994-12-19': {
    argumentum:
      'GAGNOAËNSIS* IN LITORIS EBURNEI FINIBUS NOVA PROVINCIA ECCLESIASTICA CONSTITUITUR '
      + 'GAGNOAËNSIS, CUIUS METROPOLITANA ECCLESIA ERIT SEDES EIUSDEM NOMINIS',
    note:
      'Detaches the Dioceses of Gagnoa, Daloa, Man and San Pedro from the province of Abidjan '
      + 'and erects the new ecclesiastical province of Gagnoa (Ivory Coast), raising Gagnoa to a '
      + 'metropolitan archdiocese: "...atque ex his efficimus Provinciam ecclesiasticam '
      + 'Gagnoaënsem, cuius Sedes princeps erit Eccelesia Gagnoaënsis, quam ad gradum et '
      + 'dignitatem archidioecesis metropolitanae evehimus...".',
  },
  'john-paul-ii|iasikanensis|1994-12-19': {
    argumentum:
      'IASIKANENSIS* NOVA IN GANACONDITUR DIOECESIS',
    note:
      'Detaches the northern part of the Diocese of Keta-Ho (the towns of Jasikan, Kadjebi, '
      + 'Kete-Krachi and Nkwanta) and erects the new Diocese of Jasikan (Ghana), suffragan to '
      + 'Accra: "...abducimus inde in novamque convertimus dioecesim posthac Iasikanensem rite '
      + 'nuncupandam, quam simul suffraganeam subdimus metropolitanae Ecclesiae Accraënsi...". '
      + 'The heading prints "GANACONDITUR" without a space, as quoted.',
  },
  'john-paul-ii|ketaensis-akatsienis|1994-12-19': {
    argumentum:
      'KETAËNSIS-AKATSIENSIS* IN GANA NOVA CONDITUR DIOECESIS KETAËNSIS-AKATSIENSIS',
    note:
      'Detaches the southern civil districts of Adidome, Akatsi, Anlo, Ketu and Sogakope from '
      + 'the Diocese of Keta-Ho and erects the new Diocese of Keta-Akatsi (Ghana), suffragan to '
      + 'Accra, seated at Akatsi with a concathedral at Keta: "...ex eoque novam condimus '
      + 'dioecesim Ketaënsem-Akatsiensem, quam metropolitanae Ecclesiae Accraensi suffraganeam '
      + 'facimus...".',
  },
  'john-paul-ii|korhogoensis|1994-12-19': {
    argumentum:
      'KORHOGOËNSIS* IN LITORE EBURNEO CONSTITUITUR NOVA PROVINCIA ECCLESIASTICAKOROGHOËNSIS, '
      + 'CUIUS METROPOLITANA ECCLESIA ERIT SEDES EIUSDEM NOMINIS',
    note:
      'Detaches the Dioceses of Korhogo and Katiola from the province of Abidjan and, with '
      + 'Odienne erected the same day, erects the new ecclesiastical province of Korhogo (Ivory '
      + 'Coast), raising Korhogo to a metropolitan archdiocese: "...atque ex his, adiuncta '
      + 'quoque dioecesi Odiennensi hoc ipso die condita, efficimus Provinciam ecclesiasticam '
      + 'Korhogoënsem, cuius Sedes princeps erit Ecclesia Korhogoënsis, quam ad gradum et '
      + 'dignitatem archidioecesis metropolitanae evehimus...". The heading prints '
      + '"ECCLESIASTICAKOROGHOËNSIS", as quoted.',
  },
  'john-paul-ii|odiennensis|1994-12-19': {
    argumentum:
      'ODIENNENSIS* IN LITORE EBURNEO NOVA CONDITUR DIOECESIS ODIENNENSIS',
    note:
      'Detaches the civil district of Odienne from the Diocese of Korhogo, Touba from Man and '
      + 'Seguela and Mankono from Daloa and erects the new Diocese of Odienne (Ivory Coast), '
      + 'suffragan to Korhogo: "...ex iisque novam condimus dioecesim Odiennensem, quam hoc ipso '
      + 'die constitutae metropolitanae Ecclesiae Korhogoënsi suffraganeam facimus...".',
  },
  'john-paul-ii|damongoensis|1995-02-03': {
    argumentum:
      'DAMONGOËNSIS* IN GANA NOVA CONDITUR DIOECESIS DAMONGOËNSIS',
    note:
      'Detaches the civil districts of Western Gonja and Bole from the Archdiocese of Tamale '
      + 'and erects the new Diocese of Damongo (Ghana), suffragan to Tamale: "...ex eoque novam '
      + 'condimus dioecesim Damongoënsem, quam memoratae metropolitanae Ecclesiae Tamalensi '
      + 'suffraganeam facimus...".',
  },
  'john-paul-ii|ialingoensis|1995-02-03': {
    argumentum:
      'IALINGÖENSIS* IN NIGERIA NOVA CONDITUR DIOECESIS IALINGÖENSIS',
    note:
      'Detaches the civil state of Taraba from the Diocese of Yola and erects the new Diocese '
      + 'of Jalingo (Nigeria), suffragan to Jos: "...ex eoque novam condimus dioecesim '
      + 'Ialingoënsem, quam metropolitanae Ecclesiae Iosensi suffraganeam facimus...".',
  },
  'john-paul-ii|konongensis-mampongana|1995-03-03': {
    argumentum:
      'KONONGENSIS-MAMPONGANA* QUIBUSDAM DISTRACTIS TERRITORIIS A DIOECESIBUS KUMASIENSI ET '
      + 'SUNYANIENSI, NOVA IN GANA CONSTITUITUR DIOECESIS, NOMINE KONONGENSIS-MAMPONGANA',
    note:
      'Detaches eight northern civil districts (Afigya-Sekyere, Asante-Akim North and South, '
      + 'Ejisu-Juabeng, Ejura-Sekyedumasi, Kwabre, Sekyere East and West) from the Diocese of '
      + 'Kumasi and Sene and Atebubu from the Diocese of Sunyani and erects the new Diocese of '
      + 'Konongo-Mampong (Ghana), seated at Mampong and suffragan to Cape Coast: "...ex iis '
      + 'omnibus novam condimus dioecesim Konongensem-Mamponganam appellandam.".',
  },
  'john-paul-ii|obuasiensis|1995-03-03': {
    argumentum:
      'OBUASIENSIS* NOVA DIOECESIS CONDITUR IN GANA, OBUASIENSIS APPELLANDA',
    note:
      'Detaches the southern civil districts of Adansi East and West, Amansie East and West '
      + 'and Bosomtwe-Kwanwoma from the Diocese of Kumasi and erects the new Diocese of Obuasi '
      + '(Ghana), suffragan to Cape Coast: "...Novam dioecesim condimus Obuasiensem appellandam, '
      + 'meridiana parte Sedis Kumasiensis distracta...".',
  },
  'john-paul-ii|campensis|1995-03-21': {
    argumentum:
      'CAMPENSIS* IN FOEDERATIS CIVITATIBUS AMERICAE SEPTEMTRIONALIS NOVA CONDITUR DIOECESIS '
      + 'CAMPENSIS',
    note:
      'Detaches the counties of Clark, Lincoln, White Pine, Nye and Esmeralda from the Diocese '
      + 'of Reno-Las Vegas and erects the new Diocese of Las Vegas (Nevada), suffragan to San '
      + 'Francisco, the mother see becoming simply Reno: "...atque ex ita distracto territorio '
      + 'novam constituimus dioecesim Campensem, iisdem circumscriptam finibus, quibus praefata '
      + 'municipia, simul sumpta, nunc terminantur.".',
  },
  'john-paul-ii|cassoviensis|1995-03-31': {
    argumentum:
      'CASSOVIENSIS* INTRA SLOVAKIAE FINES CONDITUR NOVA PROVINCIA ECCLESIASTICA, CASSOVIENSIS '
      + 'SCILICET, QUAE AD DIGNITATEM ECCLESIAE METROPOLITANAE ATTOLLITUR',
    note:
      'Detaches the Dioceses of Kosice, Spis and Roznava from the province of '
      + 'Bratislava-Trnava and erects the new ecclesiastical province of Kosice (Slovakia), '
      + 'raising Kosice to a metropolitan see: "...Novam Provinciam ecclesiasticam condimus '
      + 'Cassoviensem appellandam et eam archiepiscopalis metropolitanae sedis fruentem '
      + 'dignitate iuribus privilegiisque, quae complectetur Ecclesiam eiusdem nominis et '
      + 'dioeceses Scepusiensem et Rosnaviensem.". The province is what the argumentum leads '
      + 'with (CONDITUR), so this is an erection; the curation script proposed an elevation on '
      + 'the ATTOLLITUR of its relative clause.',
  },
  'john-paul-ii|khuntiensis|1995-04-01': {
    argumentum:
      'KHUNTIENSIS* IN INDIA NOVA CONDITUR DIOECESIS KHUNTIENSIS',
    note:
      'Detaches the deaneries of Khunti and Torpa from the Archdiocese of Ranchi and erects '
      + 'the new Diocese of Khunti (India), suffragan to Ranchi: "...Novam in India condimus '
      + 'dioecesim nomine ipso Khuntiensem quae duobus videlicet Decanatibus constet « Khunti » '
      + 'et « Torpa »...".',
  },
  'john-paul-ii|tellicherriensis|1995-05-18': {
    argumentum:
      'TELLICHERRIENSIS* NOVA PROVINCIA ECCLESIASTICA TELLICHERRIENSIS CONSTITUITUR, CUIUS '
      + 'METROPOLITANA SEDES ERIT ECCLESIA EIUSDEM NOMINIS',
    note:
      'Constitutes the Syro-Malabar ecclesiastical province of Tellicherry (India), raising '
      + 'the Eparchy of Tellicherry to a metropolitan see with the Eparchies of Mananthavady and '
      + 'Thamarasserry, both carved from it, as suffragans: "...Provinciam ecclesiasticam '
      + 'Tellicherriensem constituimus, cuius Ecclesia princeps erit Eparchia hucusque '
      + 'Tellicherriensis, quam ad gradum et dignitatem Metropolitanae Sedis evehimus...".',
  },
  'john-paul-ii|trichuriensis|1995-05-18': {
    argumentum:
      'TRICHURIENSIS* NOVA PROVINCIA ECCLESIASTICA TRICHURIENSIS CONSTITUITUR, CUIUS '
      + 'METROPOLITANA SEDES ERIT ECCLESIA EIUSDEM NOMINIS',
    note:
      'Constitutes the Syro-Malabar ecclesiastical province of Trichur (India), raising the '
      + 'Eparchy of Trichur to a metropolitan see with the Eparchies of Palghat and '
      + 'Irinjalakuda, both carved from it, as suffragans: "...Provinciam ecclesiasticam '
      + 'Trichuriensem constituimus, cuius Ecclesia princeps erit Eparchia hucusque '
      + 'Trichuriensis, quam ad gradum et dignitatem Metropolitanae Sedis evehimus...".',
  },
  'john-paul-ii|diuguensis|1995-06-10': {
    argumentum:
      'DIUGUENSIS* IN BENINO NOVA CONDITUR DIOECESIS DIUGUENSIS',
    note:
      'Detaches the civil districts of Djougou, Bassila, Copargo and Ouake from the Diocese of '
      + 'Natitingou and erects the new Diocese of Djougou (Benin), suffragan to Cotonou: "...ex '
      + 'eoque novam condimus dioecesim Diuguensem, quam metropolitanae Ecclesiae Cotonuensi '
      + 'suffraganeam facimus...".',
  },
  'john-paul-ii|mbaikensis|1995-06-10': {
    argumentum:
      'MBAIKENSIS* IN REPUBLICA AFRICAE MEDIAE NOVA CONDITUR DIOECESIS MBAIKENSIS',
    note:
      'Detaches the civil prefecture of Mbaiki from the Archdiocese of Bangui and erects the '
      + 'new Diocese of Mbaiki (Central African Republic), suffragan to Bangui: "...ex eoque '
      + 'novam condimus dioecesim Mbaikensem, quam metropolitanae Ecclesiae Banguensi '
      + 'suffraganeam facimus...".',
  },
  'john-paul-ii|calabocensis|1995-06-17': {
    argumentum:
      'CALABOCENSIS* IN VENETIOLA CONSTITUITUR NOVA PROVINCIA ECCLESIASTICA CALABOCENSIS, '
      + 'CUIUS METROPOLITANA ECCLESIA ERIT SEDES EIUSDEM NOMINIS',
    note:
      'Withdraws the Diocese of Calabozo from the province of Caracas, raises it to a '
      + 'metropolitan archdiocese and erects the new ecclesiastical province of Calabozo '
      + '(Venezuela) with Valle de la Pascua (from Ciudad Bolivar) and San Fernando de Apure '
      + '(from Caracas) as suffragans: "...Sedem episcopalem Calabocensem a metropolitico iure '
      + 'Ecclesiae Caracensis seiungimus et ad gradum archiepiscopalis metropolitanae Sedis '
      + 'attollimus...Nova condita Provincia ecclesiastica Calabocensis constabit ex '
      + 'metropolitana Ecclesia eiusdem nominis...". The province is what the argumentum states '
      + '(CONSTITUITUR).',
  },
  'john-paul-ii|ecatepecensis|1995-06-28': {
    argumentum:
      'ECATEPECENSIS* IN MEXICO NOVA CONDITUR DIOECESIS ECATEPECENSIS',
    note:
      'Detaches the municipality of Ecatepec de Morelos from the Diocese of Texcoco and the '
      + 'Isla Municipal de Ixhuatepec from the Archdiocese of Tlalnepantla and erects the new '
      + 'Diocese of Ecatepec (Mexico), suffragan to Tlalnepantla: "...atque ex ita distractis '
      + 'territoriis novam constituimus dioecesim Ecatepecensem...".',
  },
  'john-paul-ii|imphalensis|1995-07-10': {
    argumentum:
      'IMPHALENSIS* IN INDIAE FINIBUS CONSTITUITUR NOVA PROVINCIA ECCLESIASTICA IMPHALENSIS, '
      + 'CUIUS METROPOLITANA',
    note:
      'Detaches the Dioceses of Imphal and Kohima from the province of Shillong and erects the '
      + 'new ecclesiastical province of Imphal (India), raising Imphal to a metropolitan '
      + 'archdiocese with Kohima as suffragan: "...atque ex his efficimus novam Provinciam '
      + 'ecclesiasticam Imphalensem, cuius Sedes princeps erit Ecclesia Imphalensis, quam ad '
      + 'gradum et dignitatem archidioecesis metropolitanae evehimus...". The page prints its '
      + 'heading cut off after "CUIUS METROPOLITANA" (the cached HTML confirms it), so the '
      + 'argumentum is quoted as printed.',
  },
  'john-paul-ii|ratnapurensis|1995-11-02': {
    argumentum:
      'RATNAPURENSIS* INTRA SRILANKAE FINES NOVA CONDITUR DIOECESIS RATNAPURENSIS',
    note:
      'Detaches the northern part of the Diocese of Galle (the civil province of Sabaragamuwa) '
      + 'and erects the new Diocese of Ratnapura (Sri Lanka), suffragan to Colombo: "...ex eaque '
      + 'novam constituimus dioecesim ab urbe principe eiusdem regionis Ratnapurensem '
      + 'appellandam, quam metropolitanae Sedi Columbensi in Taprobane suffraganeam facimus...".',
  },
  'john-paul-ii|ielgavensis|1995-12-02': {
    argumentum:
      'IELGAVENSIS* NOVA DIOECESIS CONDITUR IN LETTONIA, IELGAVENSIS APPELLANDA',
    note:
      'Detaches the deaneries of Griva, Ilukste, Jekabpils, Skaistkalne and Jelgava from the '
      + 'Diocese of Liepaja and erects the new Diocese of Jelgava (Latvia), suffragan to Riga: '
      + '"...quibus nova dioecesis constituitur Ielgavensis appellanda, quae iisdem teminatur '
      + 'finibus quibus supra memorati decanatus simul sumpti.".',
  },
  'john-paul-ii|rezeknensis-aglonensis|1995-12-02': {
    argumentum:
      'REZEKNENSIS-AGLONENSIS* IN LETTONIA NOVA CONDITUR DIOECESIS REZEKNENSIS-AGLONENSIS',
    note:
      'Detaches eleven deaneries of Latgale (Daugavpils, Kraslava, Dagda, Aglona, Preili, '
      + 'Livani, Varaklani, Rezekne, Ludza, Nautreni, Vilaka) from the Archdiocese of Riga and '
      + 'erects the new Diocese of Rezekne-Aglona (Latvia), suffragan to Riga, with the shrine '
      + 'of Aglona as concathedral: "...atque ex ita distractis territoriis novam constituimus '
      + 'dioecesim Rezeknensem-Aglonensem, quae iisdem limitatur finibus, quibus praedicti '
      + 'decanatus, simul sumpti, in praesens terminantur.".',
  },
  'john-paul-ii|kerichoensis|1995-12-06': {
    argumentum:
      'KERICHOËNSIS* IN KENIA NOVA CONDITUR DIOECESIS KERICHOËNSIS',
    note:
      'Detaches the civil district of Kericho from the Diocese of Nakuru and erects the new '
      + 'Diocese of Kericho (Kenya), suffragan to Nairobi: "...ex eoque novam constituimus '
      + 'dioecesim Kerichoënsem, quam metropolitanae Ecclesiae Nairobiensi suffraganeam '
      + 'facimus...".',
  },
  'john-paul-ii|kerensis|1995-12-21': {
    argumentum:
      'KERENSIS* NOVA EPARCHIA IN ERYTHRAEA CONSTITUITUR KERENSIS APPELLANDA',
    note:
      'Detaches the regions of Sahel and Senhit from the Eparchy of Asmara and erects the new '
      + 'Eparchy of Keren (Eritrea), suffragan to the Metropolitan Eparchy of Addis Ababa: '
      + '"...novam Eparchiam constituimus ab urbe Keren Kerensis appellanda, ubi eparchialis '
      + 'sedes locatur, quae deinceps regiones quas Sahel et Senhit appellant complectetur...".',
  },
  'john-paul-ii|altensis-quetzaltenanguensis-totonicapensis|1996-02-13': {
    argumentum:
      'ALTENSIS QUETZALTENANGUENSIS-TOTONICAPENSIS* IN GUATIMALA NOVA PROVINCIA ECCLESIASTICA '
      + 'CONSTITUITUR ALTENSIS, QUETZALTENANGUENSIS-TOTONICAPENSIS, CUIUS METROPOLITANA '
      + 'ECCLESSIA ERIT SEDES EIUSDEM NOMINIS',
    note:
      'Withdraws the Diocese of Los Altos from the province of Guatemala, raises it to a '
      + 'metropolitan archdiocese under the name Los Altos, Quetzaltenango-Totonicapan and '
      + 'erects the new ecclesiastical province of that name with San Marcos, Solola, Quiche and '
      + 'Huehuetenango as suffragans: "...Altensem episcopalem Sedem a metropolitico iure '
      + 'Ecclesiae Guatimalensis seiungimus et ad gradum archiepiscopalis metropolitanae '
      + 'Ecclesiae evehimus nomine Altensis, Quetzaltenanguensis-Totonicapensis...Nova exinde '
      + 'Provincia Ecclesiastica constabit sane ex metropolitana Ecclesia eiusdem nominis...". '
      + 'The province is what the argumentum states; the heading prints "ECCLESSIA", as quoted.',
  },
  'john-paul-ii|nebbensis|1996-02-13': {
    argumentum:
      'NEBBENSIS* NOVA IN UGANDA CONSTITUITUR DIOECESIS, NEBBENSIS APPELLANDA',
    note:
      'Detaches the civil district of Nebbi and the Madi-Okollo part of Arua district up to '
      + 'the river Anyau from the Diocese of Arua and erects the new Diocese of Nebbi (Uganda), '
      + 'suffragan to Kampala: "...ex iisque novam constituimus dioecesim Nebbensem appellandam, '
      + 'quam metropolitanae Ecclesiae Kampalaësi suffraganeam facimus...".',
  },
  'john-paul-ii|palmensis-in-brasilia|1996-03-27': {
    argumentum:
      'PALMENSIS IN BRASILIA* NOVA CONDITUR ARCHIDIOECESIS METROPOLITANA PALMENSIS IN BRASILIA '
      + 'SIMULQUE NOVA CONSTITUITUR PROVINCIA ECCLESIASTICA EIUSDEM NOMINIS',
    note:
      'Detaches six municipalities from the Diocese of Porto Nacional and five from Miracema '
      + 'do Tocantins and erects the new metropolitan Archdiocese of Palmas (Tocantins, Brazil), '
      + 'and with it the new province of Palmas with Porto Nacional, Miracema do Tocantins, '
      + 'Tocantinopolis and the Prelature of Cristalandia, withdrawn from Goiania, as '
      + 'suffragans: "...atque ex ita distractis territoriis novam constituimus archidioecesim '
      + 'metropolitanam Palmensem in Brasilia...Itemque constituimus novam Provinciam '
      + 'ecclesiasticam eiusdem nominis...".',
  },
  'john-paul-ii|ostraviensis-opaviensis|1996-05-30': {
    argumentum:
      'OSTRAVIENSIS-OPAVIENSIS* QUIBUSDAM AB ARCHIDIOECESI OLOMUCENSI DSTRACTIS TERRITORIIS '
      + 'NOVA CONSTITUITUR DIOECESIS OSTRAVIENSIS-OPAVIENSIS APPELLANDA',
    note:
      'Detaches eleven deaneries (Bilovec, Bruntal, Frydek, Hlucin, Jesenik, Karvina, Krnov, '
      + 'Mistek, Novy Jicin, Opava, Ostrava) from the Archdiocese of Olomouc and erects the new '
      + 'Diocese of Ostrava-Opava (Czech Republic), suffragan to Olomouc, with a concathedral at '
      + 'Opava: "...atque ex ita distractis territoriis novam dioecesim Ostraviensem-Opaviensem '
      + 'appellandam iisdem circumscriptam finibus quibus praefati decanatus simul sumpti in '
      + 'praesens terminantur, constituimus et erigimus.". The heading prints "DSTRACTIS", as '
      + 'quoted.',
  },
  'john-paul-ii|vratislaviensis-gedanensis|1996-06-01': {
    argumentum:
      'VRATISLAVIENSIS-GEDANENSIS* NOVA CONSTITUITUR EPARCHIA VRATISLAVIENSIS-GEDANENSIS RITUS '
      + 'BYZANTINI UCRAINORUM',
    note:
      'Detaches the deaneries of Wroclaw, Koszalin and Zielona Gora and the parishes of '
      + 'Gliwice, Katowice and Gdansk from the Ukrainian Byzantine Eparchy of Przemysl and '
      + 'erects the new Eparchy of Wroclaw-Gdansk (Poland), seated at Wroclaw and suffragan to '
      + 'Przemysl-Warsaw: "...novam condimus Eparchiam Vratislaviensem-Gedanensem ritus '
      + 'Byzantini Ucrainorum appellandam, cuius Sedem in urbe Vratislavia ponimus...". The '
      + 'reader carried the opening quotation mark of the body\'s first sentence into the '
      + 'extracted argumentum; the cached HTML places it in the next paragraph, so it is dropped '
      + 'here.',
  },
  'john-paul-ii|neyyattinkaraensis|1996-06-14': {
    argumentum:
      'NEYYATTINKARAËNSIS IN INDIA MERIDIONALI NOVA CONDITUR DIOECESIS NEYYATTINKARAËNSIS',
    note:
      'Detaches the taluks of Nedumangad and Neyyattinkara (except the Padroado coast) from '
      + 'the Latin Diocese of Trivandrum and erects the new Diocese of Neyyattinkara (India), '
      + 'suffragan to Verapoly: "...ex iisque novam constituimus dioecesim Neyyattinkaraënsem, '
      + 'quam metropolitanae Ecclesiae Verapolitanae suffraganeam facimus...". The heading '
      + 'prints no asterisk after the toponym, as quoted.',
  },
  'john-paul-ii|thuckalayensis|1996-11-11': {
    argumentum:
      'THUCKALAYENSIS* NOVA EPARCHIA IN INDIA CONSTITUITUR THUCKALAYENSIS APPELLANDA',
    note:
      'Detaches the district of Kanyakumari and the taluk of Shenkottai from the Syro-Malabar '
      + 'Archeparchy of Changanacherry and erects the new Eparchy of Thuckalay (India), its '
      + 'suffragan: "...novam Eparchiam constituimus Thuckalayensem appellandam, eparchialem '
      + 'sedem in oppido «Thuckalay» locantes...".',
  },
  'john-paul-ii|bonaventurensis|1996-11-30': {
    argumentum:
      'BONAVENTURENSIS* NOVA DIOECESIS CONDITUR IN COLUMBIA EX VICARIATU APOSTOLICO '
      + 'BONAVENTURENSI',
    note:
      'Raises the Apostolic Vicariate of Buenaventura (Colombia), entrusted to the Yarumal '
      + 'missionaries, to a diocese of the same name, suffragan to Cali: "...Vicariatum '
      + 'Apostolicum Bonaventurensem ad dioecesis dignitatem attollimus, eodem servato nomine, '
      + 'quam Ecclesiam deinde suffraganeam facimus Metropolitanae Ecclesiae Caliensi...". '
      + 'Stated by the argumentum as a new diocese CONDITUR out of the vicariate and filed on '
      + 'those words; the body works it as an elevation (Ruling 9).',
  },
  'john-paul-ii|guarenensis|1996-11-30': {
    argumentum:
      'GUARENENSIS* IN VENETIOLA NOVA CONDITUR DIOECESIS GUARENENSIS',
    note:
      'Detaches eight municipalities (Acevedo, Andres Bello, Brion, Buroz, Paez, Plaza, Pedro '
      + 'Gual, Zamora), until now the episcopal vicariates of Guarenas and Barlovento, from the '
      + 'Diocese of Los Teques and erects the new Diocese of Guarenas (Venezuela), suffragan to '
      + 'Caracas: "...atque ex ita distracto territorio novam constituimus dioecesim Guarenensem '
      + 'appellandam...".',
  },
  'john-paul-ii|lugasiensis|1996-11-30': {
    argumentum:
      'LUGASIENSIS* IN UGANDA NOVA CONDITUR DIOECESIS LUGASIENSIS APPELLANDA',
    note:
      'Detaches the civil district of Mukono from the Archdiocese of Kampala and erects the '
      + 'new Diocese of Lugazi (Uganda), suffragan to Kampala: "...Praedictam regionem nationis '
      + 'Ugandensis ab archidioecesi Kampalaënsi submoveri volumus novamque constitui '
      + 'dioecesanam circumscriptionem « Lugasiensem » in posterum tempus appellandam.".',
  },
  'john-paul-ii|rresheniensis|1996-12-07': {
    argumentum:
      'RRHËSHENIENSIS* NOVA IN ALBANIA CONSTITUITUR DIOECESIS RRHËSHENIENSIS',
    note:
      'Detaches part of the Archdiocese of Durres-Tirana and the whole Territorial Abbey of '
      + 'Sant\'Alessandro di Orosh (the civil regions of Rreshen, Burrel, Bulqize and Peshkopi) '
      + 'and erects the new Diocese of Rreshen (Albania), suffragan to Shkoder: "...e parte '
      + 'territorii quadam archidioecesis Dyrracensis-Tiranensis atque ex abbatia territoriali '
      + 'S. Alexandri de Orosci novam condimus dioecesim Rrësheniensem appellandam...".',
  },
  'john-paul-ii|lurinensis|1996-12-14': {
    argumentum:
      'LURINENSIS* QUODAM AB ARCHIDIOECESI LIMANA DISTRACTO TERRITORIO NOVA CONSTITUITUR '
      + 'DIOECESIS LURINENSIS APPELLANDA',
    note:
      'Detaches twenty-two parishes of the southern suburbs from the Archdiocese of Lima and '
      + 'erects the new Diocese of Lurin (Peru), suffragan to Lima: "...Ex ita distracto '
      + 'territorio novam condimus dioecesim Lurinensem appellandam, iisdem circumscriptam '
      + 'finibus quibus praefatae paroeciae in territoriali Limanae Ecclesiae ordinatione in '
      + 'praesens terminantur.".',
  },
  'john-paul-ii|trivandrensis-syrorum-malankarensium|1996-12-16': {
    argumentum:
      'TRIVANDRENSIS SYRORUM MALANKARENSIUM* METROPOLITANA EXCITATUR EPARCHIA TRIVANDRENSIS '
      + 'SYRORUM MALANKARENSIUM IN INDIA',
    note:
      'Detaches the civil district of Kanyakumari from the Syro-Malankara Archeparchy of '
      + 'Trivandrum and erects it as the new Eparchy of Marthandom, its suffragan: "...civilem '
      + 'regionem, cui vulgare est nomen Kanyakumari, abscindimus ab memorata Archieparchia '
      + 'Trivandrensi quam in Eparchiam convertimus Marthandomensem...". The heading names only '
      + 'the mother see ("METROPOLITANA EXCITATUR EPARCHIA TRIVANDRENSIS"), as quoted; the new '
      + 'see is named in the body alone.',
  },
  'john-paul-ii|suchitepequensis-retalhulensis|1996-12-31': {
    argumentum:
      'SUCHITEPEQUENSIS-RETALHULENSIS* IN GUATIMALA NOVA CONDITUR DIOECESIS '
      + 'SUCHITEPEQUENSIS-RETALHULENSIS',
    note:
      'Detaches the department of Retalhuleu from the Archdiocese of Los Altos, '
      + 'Quetzaltenango-Totonicapan and the department of Suchitepequez from the Diocese of '
      + 'Solola and erects the new Diocese of Suchitepequez-Retalhuleu (Guatemala), seated at '
      + 'Mazatenango and suffragan to Guatemala: "...atque ex ita distractis territoriis novam '
      + 'constituimus dioecesim Suchitepequensem-Retalhulensem...".',
  },
  'john-paul-ii|dharmapuriensis|1997-01-24': {
    argumentum:
      'DHARMAPURIENSIS* NOVA DIOECESIS CONDITUR IN INDIA, DHARMAPURIENSIS APPELLANDA',
    note:
      'Detaches the northern district of Dharmapuri from the Diocese of Salem and erects the '
      + 'new Diocese of Dharmapuri (India), suffragan to Pondicherry and Cuddalore: "...Novam '
      + 'dioecesim condimus Dharmapuriensem a principi urbe eiusdem regionis Dharmapuriensis '
      + 'appellandam, septentrionali districtu, quem « Dharmapuri » appellant, a Sede Salemensi '
      + 'distracto.".',
  },
  'john-paul-ii|kosiciensis|1997-02-21': {
    argumentum:
      'KOŠICIENSIS* NOVA EXARCHIA APOSTOLICA PRO FIDELIBUS BYZANTINI RITUS IN SLOVACCHIA '
      + 'CONSTITUITUR KOŠICIENSIS APPELLANDA',
    note:
      'Detaches the civil region of Kosice from the jurisdiction of the Byzantine Eparchy of '
      + 'Presov and erects the new Apostolic Exarchate of Kosice for the faithful of the '
      + 'Byzantine rite in Slovakia, immediately subject to the Holy See: "...novam Exarchiam '
      + 'pro fidelibus ritus Byzantini constituimus, Košiciensem appellandam, cuius sedes in '
      + 'urbe Cassovia locabitur...".',
  },
  'john-paul-ii|merlensis-moronensis|1997-05-13': {
    argumentum:
      'MERLENSIS-MORENENSIS* NOVA DIOECESIS CONDITUR IN ARGENTINA, MERLENSIS-MORENSIS '
      + 'APPELLANDA',
    note:
      'Detaches the partidos of Merlo and Moreno from the Diocese of Moron and erects the new '
      + 'Diocese of Merlo-Moreno (Argentina), seated at Moreno and suffragan to Buenos Aires: '
      + '"...quibus nova dioecesis constituitur, Merlensis-Morenensis appellanda, quae iisdem '
      + 'teminatur finibus quibus supra memorati districtus simul sumpti circumscribuntur.". The '
      + 'heading prints "MERLENSIS-MORENSIS" in its second clause, as quoted.',
  },
  'john-paul-ii|matehualensis|1997-05-28': {
    argumentum:
      'MATEHUALENSIS* NOVA DIOECESIS CONDITUR MEXICANA IN NATIONE, MATEHUALENSIS APPELLANDA',
    note:
      'Detaches the municipality of Ciudad del Maiz from the Diocese of Ciudad Valles and '
      + 'eleven municipalities (Matehuala, Catorce, Cedral, Charcas, Guadalcazar, Santo Domingo, '
      + 'Vanegas, Venado, Villa de Guadalupe, Villa de la Paz, Villa de Arista) from the '
      + 'Archdiocese of San Luis Potosi and erects the new Diocese of Matehuala (Mexico), '
      + 'suffragan to San Luis Potosi: "...quibus nova dioecesis constituitur, Matehualensis '
      + 'appellanda, quae iisdem terminatur finibus quibus supra memorata municipia simul sumpta '
      + 'circumscribuntur.".',
  },
  'john-paul-ii|monguensis|1997-06-14': {
    argumentum:
      'MONGUENSIS* A DIOECESI LIVINGSTONENSI IN ZAMBIA QUIBUSDAM DISTRACTIS TERRITORIIS, NOVA '
      + 'CONDITUR MONGUENSIS DIOECESIS',
    note:
      'Detaches the civil districts of Kalabo, Kaoma, Lukulu, Mongu and Senanga from the '
      + 'Diocese of Livingstone and erects the new Diocese of Mongu (Zambia), suffragan to '
      + 'Lusaka: "...a dioecesi Livingstonensi seiungimus atque novam condimus dioecesim, '
      + 'Monguensem appellandam.". The page prints the fifth district as "Sanga".',
  },
  'john-paul-ii|kagiensis-bandorensis|1997-06-28': {
    argumentum:
      'KAGIENSIS-BANDORENSIS* IN AFRICA MEDIA NOVA CONDITUR DIOECESIS KAGIENSIS-BANDORENSIS',
    note:
      'Detaches the civil prefectures of Ouham-Economique (printed "Ibingui-Economique"), '
      + 'Bamingui-Bangoran and Gribingui-Economique from the Archdiocese of Bangui and erects '
      + 'the new Diocese of Kaga-Bandoro (Central African Republic), suffragan to Bangui: "...ex '
      + 'eoque novam constituimus dioecesim Kagiensem-Bandorensem, quam ipsi metropolitanae '
      + 'Ecclesiae Banguensi suffraganeam facimus...".',
  },
  'john-paul-ii|varasdensis|1997-07-05': {
    argumentum:
      'VARASDENSIS* NOVA DIOECESIS CONDITUR CROATIAE IN NATIONE, VARASDENSIS APPELLANDA',
    note:
      'Detaches nine deaneries (Varazdin lower and upper, Varazdinske Toplice, Bednja, '
      + 'Medjimurje lower and upper, Djurdjevac, Koprivnica, Virje) from the Archdiocese of '
      + 'Zagreb and erects the new Diocese of Varazdin (Croatia), suffragan to Zagreb: '
      + '"...quibus nova dioecesis constituitur, Varasdensis appellanda, quae iisdem terminatur '
      + 'finibus quibus supra memorati decanatus simul sumpti eircumscribuntur.".',
  },
  'john-paul-ii|punctifixensis|1997-07-12': {
    argumentum:
      'PUNCTIFIXENSIS* QUODAM DETRACTO TERRITORIO A DIOECESI CORENSI, NOVA IN REPUBLICA '
      + 'VENETIOLANA DIOECESIS CONSTITUITUR, PUNCTIFIXENSIS APPELLANDA',
    note:
      'Detaches the Paraguana peninsula (the municipalities of Carirubana, Los Taques and '
      + 'Falcon) from the Diocese of Coro and erects the new Diocese of Punto Fijo (Venezuela), '
      + 'suffragan to Maracaibo: "...ex eoque novam condimus dioecesim Punctifixensem '
      + 'appellandam, iisdem circumscriptam finibus quibus praefatum territorium in praesens '
      + 'terminatur.".',
  },
  'john-paul-ii|parakuensis|1997-10-16': {
    argumentum:
      'PARAKUENSIS* NOVA CONSTITUITUR PROVINCIA ECCLESIASTICA IN BENINO, PARAKUENSIS NONCUPATA',
    note:
      'Erects the new ecclesiastical province of Parakou (Benin) from the Dioceses of Parakou, '
      + 'Kandi, Natitingou and Djougou, raising Parakou to a metropolitan archdiocese: "...novam '
      + 'Provinciam ecclesiasticam Parakuensem constituimus ex dioecesibus Parakuensi, Kandina, '
      + 'Natitinguensi et Diuguensi, cuius sedes princeps Parakuensis erit deinceps, quae hisce '
      + 'quoque litteris archidioecesis metropolitana efficitur...". The heading prints '
      + '"NONCUPATA", as quoted.',
  },
  'john-paul-ii|asansolensis|1997-10-24': {
    argumentum:
      'ASANSOLENSIS* NOVA DIOECESIS CONTITUITUR IN INDIA, ASANSOLENSIS APPELLANDA',
    note:
      'Detaches the northern part of Burdwan district and nineteen police stations (thanas) of '
      + 'the Bankura and Birbhum districts from the Archdiocese of Calcutta and erects the new '
      + 'Diocese of Asansol (India), suffragan to Calcutta: "...Novam dioecesim condimus '
      + 'Asansolensem appellandam, quae partem aliquam archidioecesis Calcuttensis, scilicet '
      + 'territorium septentrionale districtus « Burdwan »...complectetur.". The heading '
      + 'misprints the verb as "CONTITUITUR", kept as quoted, which is why the curation script '
      + 'abstained.',
  },
  'john-paul-ii|goasoensis|1997-10-24': {
    argumentum:
      'GOASOËNSIS* IN GANA NOVA CONDITUR DIOECESIS GOASOËNSIS',
    note:
      'Detaches the civil districts of Asunafo, Asutifi, Tano and Ahafo Area from the Diocese '
      + 'of Sunyani and erects the new Diocese of Goaso (Ghana), suffragan to Kumasi: "...ex '
      + 'eoque novam condimus dioecesim Goasoënsem, quam metropolitanae Ecclesiae A litore aureo '
      + 'suffraganeam facimus...".',
  },
  'john-paul-ii|bruneiensis|1997-11-21': {
    argumentum:
      'BRUNEIENSIS* PRAEFECTURA APOSTOLICA BRUNEIENSIS CONSTITUITUR',
    note:
      'Detaches the state of Brunei Darussalam from the Diocese of Miri and erects the new '
      + 'Apostolic Prefecture of Brunei, within the province of Kuching: "...segregamus a '
      + 'dioecesi Miriensi illam civilem provinciam quae vulgari nomine « Negara Brunei '
      + 'Darussalam » nuncupatur, ex qua novam propterea constituimus Apostolicam Praefecturam '
      + 'Bruneiensem...".',
  },
  'john-paul-ii|amparensis|1997-12-02': {
    argumentum:
      'AMPARENSIS* AB ECCLESIIS CAMPINENSI ET LIMEIRENSI QUODAM DISCTRACTO TERRITORIO, NOVA '
      + 'CONDITUR DIOECESIS AMPARENSIS APPELLADNA',
    note:
      'Detaches eleven municipalities (Amparo, Aguas de Lindoia, Holambra, Itapira, '
      + 'Jaguariuna, Lindoia, Mogi Mirim, Monte Alegre do Sul, Pedreira, Santo Antonio de Posse, '
      + 'Serra Negra) from the Archdiocese of Campinas and the Diocese of Limeira and erects the '
      + 'new Diocese of Amparo (Brazil), suffragan to Campinas: "...Inde novam dioecesim '
      + 'constituimus, Amparensem appellandam, quae iisdem terminatur finibus quibus supra '
      + 'memorata municipia.". The heading prints "DISCTRACTO" and "APPELLADNA", as quoted.',
  },
  'john-paul-ii|iuinensis|1997-12-02': {
    argumentum:
      'IUINENSIS* IN BRASILIA NOVA CONDITUR DIOECESIS IUINENSIS',
    note:
      'Detaches the municipalities of Juina, Castanheira, Juruena, Cotriguacu, Aripuana and '
      + 'Brasnorte from the Dioceses of Ji-Parana and Diamantino and erects the new Diocese of '
      + 'Juina (Brazil), suffragan to Cuiaba: "...atque ex ita distracto territorio novam '
      + 'constituimus dioecesim Iuinensem appellandam...".',
  },
  'john-paul-ii|paranatinguensis|1997-12-02': {
    argumentum:
      'PARANATINGUENSIS* IN BRASILIA NOVA CONDITUR PRAELATURA TERRITORIALIS PARANATINGUENSIS',
    note:
      'Detaches the municipalities of Paranatinga, Nova Brasilandia, Planalto da Serra, '
      + 'Campinapolis, Novo Sao Joaquim and Gaucha do Norte from the Dioceses of Sinop, Barra do '
      + 'Garcas and Rondonopolis and erects the new Territorial Prelature of Paranatinga '
      + '(Brazil), suffragan to Cuiaba: "...quibus ex ita detractis locia novam Praelaturam '
      + 'territorialem deinceps Paranatinguensem nominandam...erigimus atque constituimus.".',
  },
  'john-paul-ii|vadutiensis|1997-12-02': {
    argumentum:
      'VADUTIENSIS* IN LICHTENSTENO ARCHIDIOECESIS VADUTIENSIS APPELLANDA ERIGITUR',
    note:
      'Detaches the deanery of Liechtenstein from the Diocese of Chur and erects the new '
      + 'Archdiocese of Vaduz, immediately subject to the Holy See: "...territorium decanatus '
      + 'Lichtensteni a dioecesi Curiensi distrahere atque novam ibidem archidioecesim erigere, '
      + 'quam Vadutiensem appellandam decrevimus, finibus praefati decanatus circumscriptam et '
      + 'Nobis immediate subiectam.".',
  },
  'john-paul-ii|taunggyiensis|1998-01-17': {
    argumentum:
      'TAUNGGYIENSISIS* IN MYANMARA ECCLESIASTICA PROVINCIA TAUNGGYENSIS CONDITUR',
    note:
      'Erects the new ecclesiastical province of Taunggyi (Myanmar), raising Taunggyi to a '
      + 'metropolitan archdiocese with Taungngu, Kengtung and Loikaw as suffragans: "...Novam '
      + 'Provinciam ecclesiasticam in Myanmara condimus scilicet Taunggyiensem, quam '
      + 'particularem ecclesiam ad gradum archidioecesis metropolitanae attollimus...". The '
      + 'heading prints "TAUNGGYIENSISIS" and "TAUNGGYENSIS", as quoted.',
  },
  'john-paul-ii|kitalensis|1998-04-03': {
    argumentum:
      'KITALENSISIS* IN KENIA DIOECESIS KITALENSIS CONDITUR',
    note:
      'Detaches the civil districts of Trans Nzoia and West Pokot from the Diocese of Eldoret '
      + 'and erects the new Diocese of Kitale (Kenya), suffragan to Kisumu: "...ex quibus '
      + 'circumscriptionem novam ecclesiasticam constituimus Kitalensem nomine, quam '
      + 'Metropolitanae ecclesiae Kisumuensi suffraganeam esse censemus...". The heading prints '
      + '"KITALENSISIS", as quoted.',
  },
  'john-paul-ii|itapetiningensis|1998-04-15': {
    argumentum:
      'ITAPETININGENSIS* NOVA DIOECESIS CONDITUR IN BRASILIA, ITAPETININGENSIS APPELLANDA',
    note:
      'Detaches fourteen municipalities (Itapetininga, Tatui, Sao Miguel Arcanjo, Pilar do '
      + 'Sul, Angatuba, Paranapanema, Alambari, Campina do Monte Alegre, Cesario Lange, Capela '
      + 'do Alto, Guarei, Sarapui, Porangaba, Torre de Pedra) from the Archdiocese of Sorocaba '
      + 'and the Diocese of Itapeva and erects the new Diocese of Itapetininga (Brazil), '
      + 'suffragan to Sorocaba: "...quibus nova dioecesis constituitur, Itapetiningensis '
      + 'appellanda, quae iisdem teminatur finibus quibus supra memorata municipia simul sumpta '
      + 'circumscribuntur.".',
  },
  'john-paul-ii|puntarenensis|1998-04-17': {
    argumentum:
      'PUNTARENENSIS* IN COSTARICA NOVA CONDITUR DIOECESIS PUNTARENENSIS',
    note:
      'Detaches the cantons of Puntarenas, Montes de Oro, Esparza and Garabito from the '
      + 'Diocese of Tilaran and Parrita and Aguirre from the Diocese of San Isidro de El General '
      + 'and erects the new Diocese of Puntarenas (Costa Rica), suffragan to San Jose: "...atque '
      + 'ex ita distractis territoriis novam constituimus dioecesim Puntarenensem '
      + 'appellandam...".',
  },
  'john-paul-ii|vasaiensis|1998-05-22': {
    argumentum:
      'VASAIENSIS* IN INDIA NOVA CONDITUR DIOECESIS VASAIENSIS',
    note:
      'Detaches nine taluks of northern Thane district (Vasai, Bhiwandi, Shahapur, Wada, '
      + 'Jawhar, Palghar, Mokhada, Dahanu, Talasari) from the Archdiocese of Bombay and erects '
      + 'the new Diocese of Vasai (India), suffragan to Bombay: "...ex eoque novam constituimus '
      + 'dioecesim Vasaiensem, quam metropolitanae Ecclesiae Bombayensi suffraganeam facimus...".',
  },
  'john-paul-ii|criciumensis|1998-05-27': {
    argumentum:
      'CRICIUMENSIS* IN BRASILIA NOVA CONDITUR DIOECESIS CRICIUMENSIS',
    note:
      'Detaches twenty-five municipalities (Criciuma, Ararangua, Icara, Urussanga, Sombrio, '
      + 'Nova Veneza and others) from the Diocese of Tubarao and erects the new Diocese of '
      + 'Criciuma (Brazil), suffragan to Florianopolis: "...atque ex ita distracto territorio '
      + 'novam constituimus dioecesim Criciumensem, quae iisdem limitabitur finibus, quibus '
      + 'praedicta municipia simul sumpta, prout in civili lege exstant, nunc terminantur.".',
  },
  'john-paul-ii|banforensis|1998-06-27': {
    argumentum:
      'BANFORENSIS* IN BURKINA FAO NOVA CONDITUR DIOECESIS BANFORENSIS',
    note:
      'Detaches the civil provinces of Comoe and Leraba from the Diocese of Bobo-Dioulasso and '
      + 'erects the new Diocese of Banfora (Burkina Faso), suffragan to Ouagadougou: '
      + '"...Superiora loca memorata abstrahimus a dicione Bobodiulassensi ex quibus novam '
      + 'condimus laetantes diocesim Banforensem, metropolitanae scilicet ecclesiae Uagaduguensi '
      + 'suffraganeam...". The heading prints "BURKINA FAO", as quoted.',
  },
  'john-paul-ii|bettiahensis|1998-06-27': {
    argumentum:
      'BETTIAHENSIS* IN INDIA NOVA CONDITUR DIOECESIS BETTIAHENSIS',
    note:
      'Detaches the western civil districts of West and East Champaran, Gopalganj, Saran and '
      + 'Siwan from the Diocese of Muzaffarpur and erects the new Diocese of Bettiah (India), '
      + 'suffragan to Ranchi: "...ex iisque novam condimus dioecesim Bettiahensem, quam '
      + 'metropolitanae Ecclesiae Ranchiensi suffraganeam facimus...".',
  },
  'john-paul-ii|francistaunensis|1998-06-27': {
    argumentum:
      'FRANCISTAUNENSIS* IN BOTSUANA NOVUS CONDITUR VICARIATUS APOSTOLICUS FRANCISTAUNENSIS',
    note:
      'Detaches the civil districts of Central, Chobe, Gantsi, Ngamiland and North-East from '
      + 'the Diocese of Gaborone and erects the new Apostolic Vicariate of Francistown '
      + '(Botswana), entrusted to the Divine Word Missionaries: "...atque eo constituimus '
      + 'Vicariatum Apostolicum Francistaunensem, quem sollicitis curis Societatis Verbi Divini '
      + 'concredimus.".',
  },
  'john-paul-ii|purneaensis|1998-06-27': {
    argumentum:
      'PURNEAËNSIS* QUODAM DETRACTO TERRITORIO A DIOECESI DUMKAËNSI, NOVA IN INDIAE FINIBUS '
      + 'DIOECESIS CONSTITUITUR PURNEÄENSIS APPELLANDA',
    note:
      'Detaches the northern civil districts of Purnea, Katihar, Araria and Kishanganj from '
      + 'the Diocese of Dumka and erects the new Diocese of Purnea (India), suffragan to Ranchi: '
      + '"...ab eadem dioecesi Dumkaënsi abstrahimus eoque novam condimus dioecesim Purneaënsem '
      + 'appellandam.". The heading prints "PURNEÄENSIS" in its second clause, as quoted.',
  },
  'john-paul-ii|kannurensis|1998-11-05': {
    argumentum:
      'KANNURENSIS* IN INDIA NOVA CONDITUR DIOECESIS KANNURENSIS',
    note:
      'Detaches the northern civil districts of Kannur and Kasaragod from the Diocese of '
      + 'Calicut and erects the new Diocese of Kannur (India), suffragan to Verapoly: "...ex '
      + 'eoque novam condimus dioecesim Kannurensem, quam metropolitanae Ecclesiae Verapolitanae '
      + 'suffraganeam facimus...".',
  },
  'john-paul-ii|corensis|1998-11-23': {
    argumentum:
      'CORENSIS* INTRA VENETIOLAE FINES CONDITUR NOVA PROVINCIA ECCLESIASTICA, CORENSIS '
      + 'SCILICET, QUAE AD DIGNITATEM ECCLESIAE METROPOLITANAE ATTOLLITUR',
    note:
      'Erects the new ecclesiastical province of Coro (Venezuela), raising Coro to a '
      + 'metropolitan see with Punto Fijo, withdrawn from Maracaibo, as its suffragan: "...Novam '
      + 'Provinciam Ecclesiasticam condimus Corensem appellandam et eam archiepiscopalis '
      + 'metropolitanae sedis fruentem dignitate, iuribus privilegiisque, quae complectetur '
      + 'Ecclesiam eiusdem nominis et dioecesim Punctifixensem...". The province is what the '
      + 'argumentum leads with (CONDITUR), so this is an erection; the curation script proposed '
      + 'an elevation on the ATTOLLITUR of its relative clause.',
  },
  'john-paul-ii|gorensis|1998-11-28': {
    argumentum:
      'GORENSIS* NOVA DIOECESIS CONDITUR IN CIADIA, GORENSIS APPELLANDA',
    note:
      'Detaches the southern sub-prefectures of Gore and Baibokoum from the Dioceses of '
      + 'Moundou and Doba and erects the new Diocese of Gore (Chad), suffragan to N\'Djamena: '
      + '"...Novam dioecesim condimus Gorensem appellandam, quae meridianum territorium '
      + 'Subpraefecturarum civilium, vulgo Goré et Baïbokoum, ipsumque ab Ecclesiis Munduensi et '
      + 'Dobana seiunctum, complectetur.".',
  },
  'john-paul-ii|laiensis|1998-11-28': {
    argumentum:
      'LAIENSIS* IN CIADIA DIOECESIS LAIENSIS CONDITUR',
    note:
      'Detaches the civil province of Tandjile from the Dioceses of Moundou and Doba and '
      + 'erects the new Diocese of Lai (Chad), suffragan to N\'Djamena: "...ex qua novam omnino '
      + 'condimus dioecesim posthac Laiensem nuncupandam, quam simul metropolitanae Ecclesiae '
      + 'Ndiamenanae suffraganeam subicimus...".',
  },
  'john-paul-ii|tibuensis|1998-12-29': {
    argumentum:
      'TIBUENSIS* IN COLUMBIA NOVA CONDITUR DIOECESIS TIBUENSIS',
    note:
      'Raises the Territorial Prelature of Tibu (Colombia) to a diocese, keeping its name and '
      + 'boundaries: "...Commemoratam Praelaturam Tibuensem territorialem ad gradum promovemus '
      + 'ac iuridicialem dioecesis dignitatem, iisdem nimirum finibus adservatis quibus in '
      + 'praesentia circumscribitur...". Stated by the argumentum as a new diocese CONDITUR and '
      + 'filed on those words; the body works it as an elevation (Ruling 9).',
  },
  'john-paul-ii|guluensis|1999-01-02': {
    argumentum:
      'GULUENSIS* IN UGANDA CONSTITUITUR NOVA PROVINCIA ECCLESIASTICA GULUENSIS, CUIUS '
      + 'METROPOLITANA ECCLESIA ERIT SEDES EIUSDEM NOMINIS',
    note:
      'Detaches the Dioceses of Arua, Gulu, Lira and Nebbi from the province of Kampala and '
      + 'erects the new ecclesiastical province of Gulu (Uganda), raising Gulu to a metropolitan '
      + 'archdiocese: "...atque ex his efficimus Provinciam ecclesiasticam Guluensem, cuius '
      + 'Sedes princeps erit Ecclesia Guluensis, quam ad gradum et dignitatem archidioecesis '
      + 'metropolitanae evehimus...".',
  },
  'john-paul-ii|mbararaensis|1999-01-02': {
    argumentum:
      'MBARARAËNSIS* NOVA PROVINCIA ECCLESIASTICA MBARARAËNSIS APPELLATA INTRA FINES UGANDAE '
      + 'CONDITUR',
    note:
      'Separates Mbarara from the province of Kampala, raises it to a metropolitan archdiocese '
      + 'and erects the new ecclesiastical province of Mbarara (Uganda) with Fort Portal, Hoima, '
      + 'Kabale and Kasese as suffragans: "...A metropolitana Ecclesia Kampalaënsi Mbararaënsem '
      + 'sedem separamus quam ad dignitatem archiepiscopalis metropolitanae Ecclesiae '
      + 'evehimus...Novam Provinciam ecclesiasticam constituunt, veluti suffraganeae sedes, '
      + 'dioeceses Arcis Portal, Hoimana, Kabalena et Kasesensis...".',
  },
  'john-paul-ii|tororoensis|1999-01-02': {
    argumentum:
      'TOROROËNSIS* IN UGANDA CONSTITUITUR NOVA PROVINCIA ECCLESIASTICA TOROROËNSIS, CUIUS '
      + 'METROPOLITANA ERIT SEDES EIUDEM NOMINIS',
    note:
      'Detaches the Dioceses of Jinja, Kotido, Moroto, Soroti and Tororo from the province of '
      + 'Kampala and erects the new ecclesiastical province of Tororo (Uganda), raising Tororo '
      + 'to a metropolitan archdiocese: "...atque ex his efficimus Provinciam ecclesiasticam '
      + 'Tororoënsem, cuius Sedes princeps erit Ecclesia Tororoënsis, quam ad gradum et '
      + 'dignitatem archidioecesis metropolitanae evehimus...". The heading prints "EIUDEM", as '
      + 'quoted.',
  },
  'john-paul-ii|gwaliorensis|1999-02-09': {
    argumentum:
      'GWALIORENSIS* IN INDIA NOVA CONDITUR DIOECESIS GWALIORENSIS',
    note:
      'Detaches the western civil districts of Gwalior, Bhind, Morena, Shivpuri, Datia and '
      + 'Sheopur from the Diocese of Jhansi and erects the new Diocese of Gwalior (India), '
      + 'suffragan to Bhopal: "...ex eoque novam condimus dioecesim Gwaliorensem, quam '
      + 'metropolitanae Ecclesiae Bhopalensi suffraganeam facimus...".',
  },
  'john-paul-ii|mamfensis|1999-02-09': {
    argumentum:
      'MAMFENSIS* NOVA DIOECESIS CONDITUR IN CAMARUNIA, MAMFENSIS APPELLANDA',
    note:
      'Detaches the civil divisions of Manyu, Lebialem and Kupe-Manenguba from the Diocese of '
      + 'Buea and erects the new Diocese of Mamfe (Cameroon), suffragan to Bamenda: "...Novam '
      + 'dioecesim condimus Mamfensem appellandam, quae territorium districtuum civilium '
      + 'populari sermone Manyu, Lebialem et Kupe-Manenguba complectetur, a dioecesi Bueaënsi '
      + 'distractum.".',
  },
  'john-paul-ii|masvingensis|1999-02-09': {
    argumentum:
      'MASVINGENSIS* IN ZIMBABUA NOVA CONDITUR DIOECESIS MASVINGENSIS',
    note:
      'Detaches the civil districts of Bikita, Chiredzi, Chivi, Gutu, Masvingo, Mwenezi and '
      + 'Ndanga and parts of Gwanda and Beitbridge from the Diocese of Gweru and erects the new '
      + 'Diocese of Masvingo (Zimbabwe), suffragan to Bulawayo: "...ex iisque novam condimus '
      + 'dioecesim Masvingensem, quam metropolitanae Ecclesiae Bulauaiensi suffraganeam '
      + 'facimus...".',
  },
  'john-paul-ii|caraguatatubensis|1999-03-03': {
    argumentum:
      'CARAGUATATUBENSIS* IN BRASILIA NOVA CONDITUR DIOECESIS CARAGUATATUBENSIS',
    note:
      'Detaches the municipalities of Caraguatatuba, Ilhabela, Sao Sebastiao and Ubatuba from '
      + 'the Diocese of Santos and erects the new Diocese of Caraguatatuba (Brazil), suffragan '
      + 'to Sao Paulo: "...atque ex ita distracto territorio novam constituimus dioecesim '
      + 'Caraguatatubensem...".',
  },
  'john-paul-ii|patnensis|1999-03-16': {
    argumentum:
      'PATNENSIS* PROVINCIA ECCLESIASTICA PATNENSIS IN INDIA CONDITUR',
    note:
      'Detaches the Dioceses of Patna, Bettiah, Bhagalpur, Muzaffarpur and Purnea from the '
      + 'province of Ranchi and erects the new ecclesiastical province of Patna (India), raising '
      + 'Patna to a metropolitan archdiocese: "...novam Provinciam ecclesiasticam ex distractis '
      + 'dioecesibus Patnensi, Bettiahensi, Bhagalpurensi, Muzaffarpurensi et Purneaënsi a '
      + 'metropolitana Sede Ranchiensi, condimus Patnensem appellandam atque pristinam eiusdem '
      + 'nominis dioecesim ad archidioecesis metropolitanae gradum evehimus...".',
  },
  'john-paul-ii|yendensis|1999-03-16': {
    argumentum:
      'YENDENSIS* NOVA DIOECESIS CONDITUR IN GANA, YENDENSIS APPELLANDA',
    note:
      'Detaches the eastern civil districts of Yendi, Gushiegu-Karaga, Bimbilla, '
      + 'Saboba-Chereponi and Zabzugu-Tatale from the Archdiocese of Tamale and erects the new '
      + 'Diocese of Yendi (Ghana), suffragan to Tamale: "...novam dioecesim condimus Yendensem '
      + 'appellandam, quae territorium districtuum civilium Yendi, Gushiegu-Karaga, Bimbilla, '
      + 'Saboba-Chereponi, Zabzugu-Tatale, ab orientali parte distractorum archidioecesis '
      + 'Tamalensis, complectetur.".',
  },
  'john-paul-ii|karagandensis|1999-07-07': {
    argumentum:
      'KARAGANDEN* IN KAZAKISTANIA NOVA CONDITUR DIOECESIS KARAGANDENSIS APOSTOLICAE SEDI '
      + 'IMMEDIATE SUBIECTA',
    note:
      'Suppresses the Apostolic Administration of Kazakhstan for Latins and erects in its '
      + 'place the Diocese of Karaganda, immediately subject to the Holy See, on the regions of '
      + 'East Kazakhstan and central Karaganda, three apostolic administrations being erected by '
      + 'decree alongside: "...Administrationem Apostolicam Kazakistaniae Latinorum supprimimus '
      + 'inque eiusdem locum condimus etiam dioecesim Karagandensem, quam immediate subiectam '
      + 'Apostolicae Sedi facimus...". The heading abbreviates the toponym to "KARAGANDEN", as '
      + 'quoted.',
  },
  'john-paul-ii|adilabadensis|1999-07-23': {
    argumentum:
      'ADILABADEN* IN INDIA NOVA EPARCHIA CONDITUR NOMINE ADILABADENSIS',
    note:
      'Detaches the civil district of Adilabad from the Syro-Malabar Eparchy of Chanda and '
      + 'erects the new Eparchy of Adilabad (India), suffragan to Hyderabad: "...quodam detracto '
      + 'territorio ab Eparchia Chandaënsi, novam condimus Eparchiam Adilabadensem, cuius sedem '
      + 'eparchialem in oppido « Adilabad » poni iubemus...". The heading abbreviates the '
      + 'toponym to "ADILABADEN", as quoted.',
  },
  'john-paul-ii|vitebscensis|1999-10-13': {
    argumentum:
      'VITEBSCEN* IN BIELORUSSIA NOVA CONDITUR DIOECESIS VITEBSCENSIS',
    note:
      'Detaches the Vitebsk region from the Archdiocese of Minsk-Mohilev and erects the new '
      + 'Diocese of Vitebsk (Belarus), suffragan to Minsk-Mohilev: "...separamus Regionem « '
      + 'Vitebsk » atque ex ita distracto territorio novam constituimus dioecesim Vitebscensem, '
      + 'cuius sedem ponimus in urbe « Vitebsk »...". The heading abbreviates the toponym to '
      + '"VITEBSCEN", as quoted.',
  },
  'john-paul-ii|tumacoensis|1999-10-29': {
    argumentum:
      'TUMACOËNSIS * NOVA CONSTITUITUR DIOECESIS IN COLUMBIA, « TUMACOËNSIS » APPELLANDA.',
    note:
      'Makes the Apostolic Vicariate of Tumaco (Colombia), entrusted to the Discalced '
      + 'Carmelites for thirty-eight years, a diocese, suffragan to Popayan, the municipality of '
      + 'Iscuande passing to the Apostolic Prefecture of Guapi: "...ut superius memoratus '
      + 'Vicariatus Apostolicus Tumacoënsis in posterum adnumeretur inter Ecclesiae Catholicae '
      + 'dioeceses...". Stated by the argumentum as a new diocese CONSTITUITUR and filed on '
      + 'those words; the body works it as an elevation (Ruling 9).',
  },
  'john-paul-ii|yopalensis|1999-10-29': {
    argumentum:
      'YOPALENSIS* NOVA DIOECESIS CONDITUR IN COLOMBIA, YOPALENSIS APPELLANDA.',
    note:
      'Detaches twelve municipalities and parts of three others from the Apostolic Vicariate '
      + 'of Casanare, with part of Morcote from the Diocese of Duitama-Sogamoso, and erects the '
      + 'new Diocese of Yopal (Colombia), suffragan to Tunja: "...novam dioecesim Yopalensem '
      + 'appellandam condimus quae territorium, a Vicariatu Apostolico Casanarensi '
      + 'auferendum...complectetur.".',
  },
  'john-paul-ii|osoriensis|1999-11-10': {
    argumentum:
      'OSORIENSIS * NOVA DIOECESIS CONDITUR IN BRASILIA, OSORIENSIS APPELLANDA.',
    note:
      'Detaches twenty-one coastal municipalities (Osorio, Torres, Tramandai, Capao da Canoa, '
      + 'Cidreira, Santo Antonio da Patrulha and others) from the Archdiocese of Porto Alegre '
      + 'and the Diocese of Caxias do Sul and erects the new Diocese of Osorio (Brazil), '
      + 'suffragan to Porto Alegre: "...quibus nova dioecesis constituitur, Osoriensis '
      + 'appellanda, quae iisdem terminatur finibus quibus supra memorata municipia simul sumpta '
      + 'circumscribuntur.".',
  },
  'john-paul-ii|koldaensis|1999-12-22': {
    argumentum:
      'KOLDAËNSIS * IN SENEGALIA NOVA CONDITUR DIOECESIS KOLDAËNSIS.',
    note:
      'Detaches the civil departments of Kolda, Sedhiou and Velingara from the Diocese of '
      + 'Ziguinchor and erects the new Diocese of Kolda (Senegal), suffragan to Dakar: "...ex '
      + 'eoque novam condimus dioecesim Koldaënsem, quam metropolitanae Ecclesiae Dakarensi '
      + 'suffraganeam facimus...".',
  },
  'john-paul-ii|ndaliensis|1999-12-22': {
    argumentum:
      'NDALIENSIS* IN BENINO NOVA DIOECESIS NDALIENSIS APPELLANDA ERIGITUR.',
    note:
      'Detaches the civil districts of N\'Dali, Bembereke, Kalale, Nikki, Perere and Sinende '
      + 'from the Archdiocese of Parakou and erects the new Diocese of N\'Dali (Benin), '
      + 'suffragan to Parakou: "...in supra dicto territorio constituimus dioecesim Ndaliensem '
      + 'nuncupandam, eamque Metropolitanae Ecclesiae Parakuensi suffraganeam...facimus.".',
  },
  'john-paul-ii|viavsensis|1999-12-22': {
    argumentum:
      'VIAVSENSIS* IN GANA NOVA CONDITUR DIOECESIS VIAVSENSIS.',
    note:
      'Detaches the northern civil districts of Juabeso-Bia, Sefwi Wiawso, '
      + 'Bibiani-Anhwiaso-Bekwai and Aowin Suaman from the Diocese of Sekondi-Takoradi and '
      + 'erects the new Diocese of Wiawso (Ghana), suffragan to Cape Coast: "...ex eoque novam '
      + 'condimus dioecesim Viavsensem, quam metropolitanae Sedi A Litore Aureo suffraganeam '
      + 'facimus...".',
  },
  'john-paul-ii|nunensis|2000-04-14': {
    argumentum:
      'NUNENSIS IN BURKINA FASANA NOVA CONDITUR DIOECESIS NUNENSIS APPELLANDA',
    note:
      'Detaches the region of Kossi from the Diocese of Nouna-Dedougou and erects the new '
      + 'Diocese of Nouna (Burkina Faso), suffragan to Ouagadougou: "...a dioecesi '
      + 'Nunensi-Deduguensi regionem vulgo dictam « Kossì » abstrahimus qua nova dioecesis '
      + 'constituatur Nunensis appellanda.". The heading prints no asterisk after the toponym, '
      + 'as quoted.',
  },
  'john-paul-ii|bongaigaonensis|2000-05-10': {
    argumentum:
      'BONGAIGAONENSIS* IN INDIA NOVA CONDITUR DIOECESIS BONGAIGAONENSIS APPELLANDA ERIGITUR',
    note:
      'Detaches the northern civil districts of Bongaigaon, Barpeta, Dhubri, Kokrajhar and '
      + 'Nalbari (except the parish of Kumarikatta) from the Archdiocese of Guwahati and erects '
      + 'the new Diocese of Bongaigaon (India), suffragan to Guwahati: "...atque ex ita '
      + 'distracto territorio nova erigatur dioecesis, Bongaigaonensis appellanda, quam '
      + 'metropolitanae Ecclesiae Guvahatinae suffraganeam...facimus.".',
  },
  'john-paul-ii|prisrianensis|2000-05-24': {
    argumentum:
      'PRISRIANENSIS* ADMINISTRATIO APOSTOLICA PRISRIANENSIS APPELLANDA CONDITUR',
    note:
      'Detaches the part of the Diocese of Skopje-Prizren lying in Yugoslavia (Kosovo) and '
      + 'erects it as the Apostolic Administration of Prizren: "...statuimus et decernimus ut '
      + 'Administratio Apostolica Prisrianensis condatur, quae complectetur, ut supra diximus, '
      + 'territorium quod nunc ad Iugoslaviam pertinet eaque sedem locabit in urbe '
      + 'Prisrianensi.".',
  },
  'john-paul-ii|malindiensis|2000-06-02': {
    argumentum:
      'MALINDIENSIS* IN KENIA NOVA CONDITUR DIOECESIS MALINDIENSIS',
    note:
      'Detaches the civil districts of Lamu and Lower Tana River from the Diocese of Garissa '
      + 'and the district of Malindi from the Archdiocese of Mombasa and erects the new Diocese '
      + 'of Malindi (Kenya), suffragan to Mombasa: "...ex iisque novam condimus dioecesim '
      + 'Malindiensem, quam metropolitanae Sedi Mombasaënsi suffraganeam facimus...".',
  },
  'john-paul-ii|ianaubensis|2000-07-05': {
    argumentum:
      'IANAUBENSlS * IN BRASILIA NOVA CONDITUR DIOECESIS IANAUBENSIS',
    note:
      'Detaches sixteen municipalities from the Diocese of Montes Claros and eight from the '
      + 'Diocese of Januaria and erects the new Diocese of Janauba (Brazil), suffragan to '
      + 'Diamantina: "...atque ex ita distractis locis novam constituimus dioecesim Ianaubensem, '
      + 'quae iisdem limitabitur finibus, quibus praedicta municipia simul sumpta, prout in '
      + 'civili lege exstant, ad praesens terminantur.". The page prints the toponym as '
      + '"IANAUBENSlS", with a lower-case l for the I, so the case-delimited reader stopped at '
      + 'its first word and the curation script abstained; the argumentum is quoted here by hand '
      + 'as the page prints it.',
  },
  'john-paul-ii|likualensis|2000-10-30': {
    argumentum:
      'LIKUALENSIS * NOVA IN CONGO PRAEFECTURA APOSTOLICA CONDITUR LIKUALENSIS APPELLANDA',
    note:
      'Detaches the civil region of Likouala from the Diocese of Ouesso and erects the new '
      + 'Apostolic Prefecture of Likouala (Congo), entrusted to the Spiritans: "...Praefecturam '
      + 'Apostolicam Likualensem condimus, quae in regione civili « Likouala » locatur eaque a '
      + 'dioecesi Uessitana distrahenda...".',
  },
  'john-paul-ii|gambellensis|2000-11-16': {
    argumentum:
      'GAMBELLENSIS* IN AETHIOPIA CONSTITUITUR NOVA PRAEFECTURA APOSTOLICA GAMBELLENSIS',
    note:
      'Detaches the civil district of Gambella and part of Ilubabor from the Apostolic '
      + 'Prefecture of Jimma-Bonga and erects the new Apostolic Prefecture of Gambella '
      + '(Ethiopia), within the province of Addis Ababa and entrusted to the Salesians: '
      + '"...atque ex iis locis constituimus novam Praefecturam Apostolicam Gambellensem, quam '
      + 'metropolitanae Ecclesiae Neanthopolitanae aggregamus...".',
  },
  'john-paul-ii|bobodiulassensis|2000-12-05': {
    argumentum:
      'BOBODIULASSENSIS * NOVA IN BURKINA FASO PROVINCIA ECCLESIASTICA CONDITUR, '
      + 'BOBODIULASSENSIS APPELLANDA, QUAE AD DIGNITATEM ARCHIEPISCOPALEM ET METROPOLITANAM '
      + 'EVEHITUR',
    note:
      'Detaches the Dioceses of Bobo-Dioulasso, Banfora, Dedougou, Diebougou and Nouna from '
      + 'the province of Ouagadougou and erects the new ecclesiastical province of '
      + 'Bobo-Dioulasso (Burkina Faso), raising Bobo-Dioulasso to a metropolitan archdiocese: '
      + '"...novam Provinciam ecclesiasticam condimus Bobodiulassensem appellandam eamque in '
      + 'principali Sede Bobodiulassensi locandam. Ipsa denique ad Archidioecesis metropolitanae '
      + 'dignitatem evehetur...". The province is what the argumentum leads with (CONDITUR), so '
      + 'this is an erection; the curation script proposed an elevation on the EVEHITUR of its '
      + 'relative clause.',
  },
  'john-paul-ii|kupelaensis|2000-12-05': {
    argumentum:
      'KUPELAËNSIS* IN BURKINA FASO NOVA CONDITUR PROVINCIA ECCLESIASTICA, KUPELAËNSIS '
      + 'APPELLANDA, QUAE AD DIGNITATEM ARCHIEPISCOPALEM ET METROPOLITANAM ATTOLLITUR',
    note:
      'Detaches the Dioceses of Koupela, Fada N\'Gourma and Kaya from the province of '
      + 'Ouagadougou and erects the new ecclesiastical province of Koupela (Burkina Faso), '
      + 'raising Koupela to a metropolitan archdiocese: "...novam ex iis Provinciam '
      + 'ecclesiasticam condimus Kupelaënsem appellandam, eiusdem vocabuli obtinentem Sedem, '
      + 'quam ad archidioecesis metropolitanae gradum attollimus...". The province is what the '
      + 'argumentum leads with (CONDITUR), so this is an erection; the curation script proposed '
      + 'an elevation on the ATTOLLITUR of its relative clause.',
  },
  'john-paul-ii|lafiensis|2000-12-05': {
    argumentum:
      'LAFIENSIS* IN NIGERIA NOVA CONDITUR DIOECESIS LAFIENSIS',
    note:
      'Detaches Nasarawa State (ten local government areas) from the Diocese of Makurdi and '
      + 'three local government areas from the Archdiocese of Jos and erects the new Diocese of '
      + 'Lafia (Nigeria), suffragan to Abuja: "...ex iisque novam condimus dioecesim Lafiensem, '
      + 'quam metropolitanae Sedi Abugensi suffraganeam facimus...".',
  },
  'john-paul-ii|zariensis|2000-12-05': {
    argumentum:
      'ZARIENSIS * IN NIGERIA NOVA CONDITUR DIOECESIS ZARIENSIS APPELLANDA',
    note:
      'Detaches ten local government areas of Kaduna State (Zaria, Sabon Gari, Soba, Ikara, '
      + 'Makarfi, Kubau, Kudan, Giwa, Birnin Gwari, Igabi, less the districts of Rigasa and '
      + 'Rigachikun) from the Archdiocese of Kaduna and erects the new Diocese of Zaria '
      + '(Nigeria), suffragan to Kaduna: "...abstrahimus quibus nova dioecesis constituitur '
      + 'Zariensis appellanda.".',
  },
  'john-paul-ii|maradiensis|2001-03-13': {
    argumentum:
      'MARADIENSIS* IN REPUBLICA NIGRITANA NOVA CONDITUR DIOECESIS MARADIENSIS APPELLANDA',
    note:
      'Detaches the civil departments of Maradi, Tahoua, Agadez, Bilma, Diffa and Zinder from '
      + 'the Diocese of Niamey and erects the new Diocese of Maradi (Niger), immediately subject '
      + 'to the Holy See: "...abstrahimus novamque dioecesim constituimus Maradiensem '
      + 'appellandam...Dioecesim Maradiensem Sanctae Sedi immediate subiectam efficimus...".',
  },
  'john-paul-ii|montisclarensis|2001-04-25': {
    argumentum:
      'MONTISCLARENSIS* PROVINCIA ECCLESIASTICA MONTISCLARENSIS CONDITUR',
    note:
      'Withdraws the Diocese of Montes Claros from the province of Diamantina, raises it to a '
      + 'metropolitan archdiocese and erects the new ecclesiastical province of Montes Claros '
      + '(Brazil) with Paracatu (from Brasilia), Janauba and Januaria (from Diamantina) as '
      + 'suffragans: "...Montisclarensem sedem episcopalem a Metropolitico iure Ecclesiae '
      + 'Adamantinae seiungimus ad fastigiumque Archiepiscopalis Metropolitanae Ecclesiae '
      + 'evehimus...Novam hinc conformamus Provinciam ecclesiasticam Montisclarensem...". The '
      + 'province is what the argumentum states (CONDITUR).',
  },
  'john-paul-ii|maralalensis|2001-06-15': {
    argumentum:
      'MARALALENSIS* IN KENIA NOVA CONDITUR DIOECESIS MARALALENSIS',
    note:
      'Detaches the civil district of Maralal (Samburu) from the Diocese of Marsabit and '
      + 'erects the new Diocese of Maralal (Kenya), suffragan to Nyeri: "...ex eoque novam '
      + 'condimus dioecesim Maralalensem, quam metropolitanae Sedi Nyeriensi suffraganeam '
      + 'facimus...".',
  },
  'john-paul-ii|dundensis|2001-11-09': {
    argumentum:
      'DUNDENSIS* NOVA IN ANGOLIA EXCITATUR ECCLESIASTICA DICIO «DUNDENSIS» RITE APPELLATA',
    note:
      'Detaches the civil province of Lunda Norte from the Diocese of Saurimo and erects the '
      + 'new Diocese of Dundo (Angola), suffragan to Luanda: "...in provincia inibi civili vulgo '
      + '« Lunda Norte » novam condimus circumscriptionem ecclesiasticam, cui posthac titulus '
      + 'erit Dundensis...quam propterea a dioecesi Saurimoensi legitime seiungimus.".',
  },
  'john-paul-ii|nneviensis|2001-11-09': {
    argumentum:
      'NNEVIENSIS* NOVA DIOECESIS CONDITUR IN NIGERIA, NNEVIENSIS APPELLANDA',
    note:
      'Detaches the Nnewi region (the local government areas of Nnewi North, Nnewi South, '
      + 'Ekwusigo and Ihiala, less Uli) from the Archdiocese of Onitsha and erects the new '
      + 'Diocese of Nnewi (Nigeria), suffragan to Onitsha: "...Novam dioecesim condimus '
      + 'Nneviensem appellandam, quae territorium regionis civilis, vulgo Nnewi...ab '
      + 'archidioecesi Onitshana seiungendum, complectetur.".',
  },
  'john-paul-ii|quettensis|2001-11-09': {
    argumentum:
      'QUETTENSIS* PRAEFECTURA APOSTOLICA QUETTENSIS CONDITUR',
    note:
      'Detaches the province of Balochistan from the Archdiocese of Karachi and the Diocese of '
      + 'Hyderabad in Pakistan and erects the new Apostolic Prefecture of Quetta, entrusted to '
      + 'the Oblates of Mary Immaculate, Karachi being confined to the city and Hyderabad to '
      + 'Sindh: "...seiungimus indeque Praefecturam Apostolicam excitamus postmodum Quettensem '
      + 'nominandam, cum ea praecipua eius sit civitas.".',
  },
  'john-paul-ii|mongensis|2001-12-01': {
    argumentum:
      'MONGENSIS* PRAEFECTURA APOSTOLICA MONGENSIS APPELLANDA IN CIADIAE FINIBUS CONSTITUITUR',
    note:
      'Detaches the civil prefectures of Batha, Biltine, Guera, Ouaddai and Salamat and the '
      + 'sub-prefecture of Ennedi from the Archdiocese of N\'Djamena and the Diocese of Sarh and '
      + 'erects the new Apostolic Prefecture of Mongo (Chad), entrusted to the care of '
      + 'N\'Djamena: "...novam condimus Praefecturam Apostolicam Mongensem appellandam, atque '
      + 'sollicitis archidioecesis Ndiamenanae curis commisimus.".',
  },
  'john-paul-ii|kumasiensis|2001-12-22': {
    argumentum:
      'KUMASIENSIS* KUMASIENSIS INTRA GANAE FINES CONDITUR NOVA PROVINCIA ECCLESIASTICA, CUIUS '
      + 'SEDES PRINCIPALIS EODEM NOMINE AD DIGNITATEM ARCHIEPISCOPALEM ET METROPOLITANAM '
      + 'ATTOLLITUR',
    note:
      'Detaches the Dioceses of Obuasi, Goaso, Sunyani and Konongo-Mampong from the province '
      + 'of Cape Coast and erects the new ecclesiastical province of Kumasi (Ghana), raising '
      + 'Kumasi to a metropolitan archdiocese: "...omnibus ex iis dicionibus novam Provinciam '
      + 'Ecclesiasticam condimus Kumasiensem appellandam, cuius Sedes principalis Kumasiensis '
      + 'erit. Ipsa insuper ad archidioecesis metropolitanae gradum attollitur...". The province '
      + 'is what the argumentum leads with (CONDITUR), so this is an erection; the curation '
      + 'script proposed an elevation on the ATTOLLITUR of its relative clause.',
  },
  'john-paul-ii|tanjungselorensis|2001-12-22': {
    argumentum:
      'TANJUNGSELORENSIS* IN INDONESIA NOVA CONDITUR DIOECESIS TANJUNGSELORENSIS',
    note:
      'Detaches the eastern part of the Diocese of Samarinda (the civil districts of Bulungan '
      + 'and Berau) and erects the new Diocese of Tanjung Selor (Indonesia), suffragan to '
      + 'Pontianak: "...A Samarindaënsi dioecesi separamus partem orientalis territorii ex eaque '
      + 'novam condimus dioecesim Tanjungselorensem, quam metropolitanae Sedi Pontianakensi '
      + 'suffraganeam facimus...".',
  },
  'john-paul-ii|victoriensis-de-conquista|2002-01-16': {
    argumentum:
      'VICTORIENSIS DE CONQUISTA* IN BRASILIA CONSTITUITUR NOVA PROVINCIA ECCLESIASTICA '
      + 'VICTORIENSIS DE CONQUISTA, CUIUS METROPOLITANA ECCLESIA ERIT SEDES EIUSDEM NOMINIS',
    note:
      'Withdraws the Diocese of Vitoria da Conquista from the province of Sao Salvador da '
      + 'Bahia, raises it to a metropolitan archdiocese and erects the new ecclesiastical '
      + 'province of Vitoria da Conquista (Brazil) with Bom Jesus da Lapa, Caetite, Jequie and '
      + 'Livramento de Nossa Senhora as suffragans: "...Victoriensem de Conquista episcopalem '
      + 'Sedem a metropolitico iure Ecclesiae Sancti Salvatoris in Brasilia seiungimus et ad '
      + 'gradum archiepiscopalis metropolitanae Sedis evehimus...Nova condita provincia '
      + 'ecclesiastica Victoriensis de Conquista efformabitur metropolitana Ecclesia eiusdem '
      + 'nominis...". The province is what the argumentum states (CONSTITUITUR).',
  },
  'john-paul-ii|moscoviensis-matris-dei|2002-02-11': {
    argumentum:
      'MOSCOVIENSIS MATRIS DEI* PROVINCIA ECCLESIASTICA MOSCOVIENSIS MATRIS DEI APPELLANDA IN '
      + 'RUSSIA CONDITUR',
    note:
      'Raises the Apostolic Administration of Northern European Russia for Latins to the '
      + 'Archdiocese of the Mother of God at Moscow and erects the new ecclesiastical province '
      + 'of that name with the Dioceses of St Clement at Saratov, the Transfiguration at '
      + 'Novosibirsk and St Joseph at Irkutsk, all erected the same day, as suffragans: '
      + '"...Administrationem Apostolicam Russiae Europaeae Septemtrionalis Latinorum ad gradum '
      + 'et dignitatem archidioecesis evehimus, Moscoviensis Matris Dei appellandae, atque ex '
      + 'territorio quattuor communitatum ecclesialium noviter erectarum...novam constituimus '
      + 'Provinciam ecclesiasticam Moscoviensem Matris Dei appellandam.". The province is what '
      + 'the argumentum states (CONDITUR); the body works it by raising the administration '
      + '(Ruling 9).',
  },
  'john-paul-ii|saratoviensis-sancti-clementis|2002-02-11': {
    argumentum:
      'SARATOVIENSIS SANCTI CLEMENTIS* IN RUSSIA NOVA DIOECESIS SARATOVIENSIS SANCTI CLEMENTIS '
      + 'APPELLANDA ERIGITUR',
    note:
      'Erects the new Diocese of St Clement at Saratov on the territory of the Apostolic '
      + 'Administration of Southern European Russia for Latins, suffragan to the Mother of God '
      + 'at Moscow: "...in territorio memoratae Administrationis Apostolicae novam erigimus '
      + 'dioecesim Saratoviensem Sancti Clementis nuncupandam, eamque metropolitanae Ecclesiae '
      + 'Moscoviensi Matris Dei suffraganeam...facimus.".',
  },
  'john-paul-ii|jhabuensis|2002-03-01': {
    argumentum:
      'JHABUENSIS* AB ECCLESIIS INDORENSI ET UDAIPURENSI QUODAM DISTRACTO TERRITORIO NOVA '
      + 'CONDITUR DIOECESIS JHABUENSIS APPELLANDA',
    note:
      'Detaches the civil districts of Jhabua, Ratlam, Mandsaur and Neemuch and the tehsil of '
      + 'Sardarpur from the Diocese of Indore and the tehsil of Thandla with four parishes from '
      + 'the Diocese of Udaipur and erects the new Diocese of Jhabua (India), seated at '
      + 'Meghnagar and suffragan to Bhopal: "...Inde novam dioecesim constituimus, quae '
      + 'Jhabuensis appellabitur seu populari loquela Jhabua.".',
  },
  'john-paul-ii|taytayensis|2002-03-26': {
    argumentum:
      'TAYTAYENSIS* VICARIATUS APOSTOLICUS TAYTAYENSIS CONDITUR',
    note:
      'Detaches the northern part of the Apostolic Vicariate of Palawan and erects it as the '
      + 'new Apostolic Vicariate of Taytay (Philippines), entrusted to the Augustinian '
      + 'Recollects: "...Septentrionalem partem Vicariatus Apostolici, qui Palavanensis adhuc '
      + 'nominatur, seiungimus atque in Vicariatum Apostolicum posthac Taytayensem nuncupandum '
      + 'convertimus...".',
  },
  'john-paul-ii|munkacsiensis-latinorum|2002-03-27': {
    argumentum:
      'MUNKACSIENSIS LATINORUM* IN UCRAINA NOVA DIOECESIS MUNKACSIENSIS LATINORUM APPELLANDA '
      + 'ERIGITUR',
    note:
      'Erects the new Latin Diocese of Mukachevo (Ukraine) on the territory of the Apostolic '
      + 'Administration of Transcarpathia for Latins, suffragan to Lviv of the Latins: "...in '
      + 'supra dicto territorio constituimus dioecesim Munkacsiensem Latinorum nuncupandam, '
      + 'eamque facimus metropolitanae Ecclesiae Leopolitanae Latinorum suffraganeam...".',
  },
  'john-paul-ii|ulaanbaatarensis|2002-04-30': {
    argumentum:
      'ULAANBAATARENSIS* NOVA IN MONGOLIA PRAEFECTURA APOSTOLICA CONDITUR ULAANBAATARENSIS '
      + 'APPELLANDA',
    note:
      'Erects the Apostolic Prefecture of Ulaanbaatar (Mongolia) in place of the Mission sui '
      + 'iuris of Urga, entrusted to the CICM missionaries: "...Praefecturam Apostolicam '
      + 'Ulaanbaatarensem condimus, et eam curis demandamus Congregationis Immaculati Cordis '
      + 'Mariae.".',
  },
  'john-paul-ii|kharkiviensis-zaporizhiensis|2002-05-04': {
    argumentum:
      'KHARKIVIENSIS-ZAPORIZHIENSIS* IN UCRAINA ORIENTALI NOVA CONDITUR DIOECESIS '
      + 'KHARKIVIENSIS-ZAPORIZHIENSIS',
    note:
      'Detaches the regions of Kharkiv, Luhansk, Poltava and Sumy from the Diocese of '
      + 'Kyiv-Zhytomyr and Donetsk, Dnipropetrovsk and Zaporizhia from the Latin Diocese of '
      + 'Kamyanets-Podilskyi and erects the new Diocese of Kharkiv-Zaporizhia (Ukraine), '
      + 'suffragan to Lviv of the Latins: "...quibus ex ita seiunctis locis novam dicionem '
      + 'Kharkiviensem-Zaporizhiensem nominandam iisdem profecto definitam finibus...".',
  },
  'john-paul-ii|odesensis-sympheropolitana|2002-05-04': {
    argumentum:
      'ODESENSIS-SYMPHEROPOLITANA* IN UCRAINA NOVA CONDITUR DIOECESIS '
      + 'ODESENSIS-SYMPHEROPOLITANA APPELLANDA',
    note:
      'Detaches the regions of Kherson, Kirovohrad, Mykolaiv and Odessa and the Autonomous '
      + 'Republic of Crimea from the Latin Diocese of Kamyanets-Podilskyi and erects the new '
      + 'Diocese of Odessa-Simferopol (Ukraine), suffragan to Lviv of the Latins: "...atque ex '
      + 'his distractis territoriis novam dioecesim constituimus Odesensem-Sympheropolitanam '
      + 'appellandam.".',
  },
  'john-paul-ii|chingleputensis|2002-06-28': {
    argumentum:
      'CHINGLEPUTENSIS* IN INDIA NOVA CONDITUR DIOECESIS CHINGLEPUTENSIS',
    note:
      'Detaches the civil district of Kancheepuram (less the parish of St Thomas) from the '
      + 'Archdiocese of Madras and Mylapore and erects the new Diocese of Chingleput (India), '
      + 'its suffragan: "...ex eoque novam condimus dioecesim Chingleputensem, seu vulgo '
      + 'Chingleput, quam metropolitanae sedi Madraspolitanae et Meliaporensi suffraganeam '
      + 'facimus...".',
  },
  'john-paul-ii|gandhinagarensis|2002-10-11': {
    argumentum:
      'GANDHINAGARENSIS* PROVINCIA ECCLESIASTICA GANDHINAGARENSIS APPELLANDA IN INDIA CONDITUR',
    note:
      'Detaches the civil districts of Gandhinagar, Mehsana, Patan, Banaskantha and '
      + 'Sabarkantha from the Diocese of Ahmedabad, erects on them the new metropolitan '
      + 'Archdiocese of Gandhinagar (India) and constitutes the province of Gandhinagar with '
      + 'Ahmedabad, Baroda and Rajkot, withdrawn from Bombay, as suffragans: "...atque ex iis '
      + 'archidioecesim metropolitanam condimus...novamque provinciam ecclesiasticam '
      + 'Gandhinagarensem appellandam...".',
  },
  'john-paul-ii|rodriguensis|2002-10-11': {
    argumentum:
      'RODRIGUENSIS* IN MAURITIO NOVUS CONDITUR VICARIATUS APOSTOLICUS RODRIGUENSIS',
    note:
      'Separates the island of Rodrigues from the Diocese of Port-Louis and erects it as the '
      + 'new Apostolic Vicariate of Rodrigues (Mauritius), entrusted to the care of Port-Louis: '
      + '"...novum constituimus Vicariatum Apostolicum Rodriguensem, quem, separatum a dioecesi '
      + 'Portus Ludovici, ipsius Sedis concredimus curae...".',
  },
  'john-paul-ii|nyahururensis|2002-12-05': {
    argumentum:
      'NYAHURURENSIS* IN KENIA NOVA CONDITUR DIOECESIS NYAHURURENSIS',
    note:
      'Detaches the civil district of Nyandarua and the western part of Laikipia from the '
      + 'Archdiocese of Nyeri and erects the new Diocese of Nyahururu (Kenya), suffragan to '
      + 'Nyeri: "...ex iisque locis novam condimus dioecesim Nyahururensem, quam memoratae '
      + 'metropolitanae Ecclesiae Nyeriensi suffraganeam facimus...".',
  },
  'john-paul-ii|paranaquensis|2002-12-07': {
    argumentum:
      'PARANAQUENSIS* IN PHILIPPINIS NOVA CONDITUR DIOECESIS PARANAQUENSIS',
    note:
      'Detaches the cities of Paranaque, Las Pinas and Muntinlupa from the Archdiocese of '
      + 'Manila and erects the new Diocese of Paranaque (Philippines), suffragan to Manila: '
      + '"...atque ex ita distracto territorio novam constituimus dioecesim Paranaquensem '
      + 'appellandam.".',
  },
  'john-paul-ii|idukkensis|2002-12-19': {
    argumentum:
      'IDUKKENSIS* NOVA CONSTITUITUR IN INDIA EPARCHIA SYRORUM-MALABARENSIUM NOMINATA '
      + '«IDUKKENSIS»',
    note:
      'Detaches the taluks of Udumbanchola, Thodupuzha and Devikulam from the Syro-Malabar '
      + 'Eparchy of Kothamangalam and erects the new Eparchy of Idukki (India), suffragan to '
      + 'Ernakulam-Angamaly: "...unde apud urbem Idukki novam condimus eparchiam, in posterum '
      + 'Idukkensem vocandam quam volumus veluti suffraganeam subdi archieparchiae '
      + 'metropolitanae Ernakulamensi-Angamaliensi...".',
  },
  'john-paul-ii|muvattupuzhensis|2002-12-19': {
    argumentum:
      'MUVATTUPUZHENSIS* NOVA EPARCHIA IN INDIA CONSTITUITUR MUVATTUPUZHENSIS APPELLANDA',
    note:
      'Detaches the Syro-Malankara faithful of the districts of Ernakulam, Thrissur and '
      + 'Palakkad (Kerala) and Coimbatore and Tiruchirappalli from the Eparchy of Tiruvalla and '
      + 'erects the new Eparchy of Muvattupuzha (India), suffragan to the Archeparchy of '
      + 'Trivandrum: "...novam eparchiam constituimus ab urbe «Muvattupuzha» Muvattupuzhensis '
      + 'appellandam, ubi eparchialis sedes locatur...".',
  },
  'john-paul-ii|acariguaraurensis|2002-12-27': {
    argumentum:
      'ACARIGUARAURENSIS* IN VENETIOLA NOVA CONDITUR DIOECESIS ACARIGUARAURENSIS',
    note:
      'Detaches the municipalities of Agua Blanca, Araure, Esteller, Paez, San Rafael de '
      + 'Onoto, Santa Rosalia and Turen from the Diocese of Guanare and erects the new Diocese '
      + 'of Acarigua-Araure (Venezuela), suffragan to Barquisimeto: "...atque ex ita distracto '
      + 'territorio novam constituimus dioecesim Acariguaraurensem, quae iisdem limitabitur '
      + 'finibus, quibus memorata municipia simul sumpta terminantur.".',
  },
  'john-paul-ii|saxanigrensis|2003-01-08': {
    argumentum:
      'SAXANIGRENSIS* IN MEXICO NOVA CONDITUR DIOECESIS SAXANIGRENSIS',
    note:
      'Detaches fifteen municipalities (Acuna, Allende, Guerrero, Hidalgo, Jimenez, Juarez, '
      + 'Morelos, Muzquiz, Nava, Piedras Negras, Progreso, Sabinas, San Juan de Sabinas, Villa '
      + 'Union, Zaragoza) and the northern part of Ocampo from the Diocese of Saltillo and '
      + 'erects the new Diocese of Piedras Negras (Mexico), suffragan to Monterrey: "...atque ex '
      + 'ita distractis locis novam constituimus dioecesim Saxanigrensem...".',
  },
  'john-paul-ii|samarindaensis|2003-01-14': {
    argumentum:
      'SAMARINDAËNSIS* IN INDONESIA CONSTITUIITUR NOVA PROVINCIA ECCLESIASTICA SAMARINDAËNSIS, '
      + 'CUIUS METROPOLITANA ECCLESIA ERIT SEDES EIUSDEM',
    note:
      'Detaches the Dioceses of Tanjung Selor, Banjarmasin, Palangkaraya and Samarinda from '
      + 'the province of Pontianak and erects the new ecclesiastical province of Samarinda '
      + '(Indonesia), raising Samarinda to a metropolitan archdiocese: "...ex iisque '
      + 'constituimus novam Provinciam eeclesiasticam Samarindaënsem atque dioecesim eiusdem '
      + 'nominis ad gradum archidioecesis metropolitanae evehimus...". The heading misprints the '
      + 'verb as "CONSTITUIITUR", kept as quoted, which is why the curation script abstained; '
      + 'the page also cuts its heading off after "SEDES EIUSDEM".',
  },
  'john-paul-ii|makokuensis|2003-03-07': {
    argumentum:
      'MAKOKUENSIS* NOVA IN GABONE PRAEFECTURA APOSTOLICA CONDITUR MAKOKUENSIS APPELLANDA',
    note:
      'Detaches the civil province of Ogooue-Ivindo from the Diocese of Oyem and erects the '
      + 'new Apostolic Prefecture of Makokou (Gabon), entrusted to the care of Oyem: "...a '
      + 'dioecesi Oyemensi distrahimus atque ex ista regione Praefecturam Apostolicam '
      + 'Makokuensem condimus eamque sollicitis curis dioecesis Oyemensis committimus.".',
  },
  'john-paul-ii|kimbensis|2003-06-12': {
    argumentum:
      'KIMBENSIS* IN PAPUA NOVA GUINEA NOVA CONDITUR DIOECESIS KIMBENSIS',
    note:
      'Detaches the civil district of New Britain (East and West) from the Archdiocese of '
      + 'Rabaul and erects the new Diocese of Kimbe (Papua New Guinea), suffragan to Rabaul: '
      + '"...ex eoque novam condimus dioecesim Kimbensem seu vulgo Kimbe, quam metropolitanae '
      + 'Sedi Rabaulensi suffraganeam facimus...".',
  },
  'john-paul-ii|palembangensis|2003-06-12': {
    argumentum:
      'PALEMBANGENSIS* IN INDONESIA CONSTITUITUR NOVA PROVINCIA ECCLESIASTICA PALEMBANGENSIS '
      + 'CUIUS METROPOLITANA ECCLESIA ERIT SEDES NOMINIS',
    note:
      'Detaches the Dioceses of Palembang, Pangkalpinang and Tanjungkarang from the province '
      + 'of Medan and erects the new ecclesiastical province of Palembang (Indonesia), raising '
      + 'Palembang to a metropolitan archdiocese: "...ex iisque constituimus novam Provinciam '
      + 'ecclesiasticam Palembangensem atque dioecesim eiusdem nominis ad gradum archidioecesis '
      + 'metropolitanae evehimus...".',
  },
  'john-paul-ii|cubaoensis|2003-06-28': {
    argumentum:
      'CUBAOËNSIS* IN PHILIPPINIS NOVA CONDITUR DIOECESIS CUBAOËNSIS',
    note:
      'Detaches the part of Quezon City south of Tandang Sora and Mactan streets from the '
      + 'Archdiocese of Manila and erects the new Diocese of Cubao (Philippines), suffragan to '
      + 'Manila: "...atque ex ita distracto territorio novam constituimus dioecesim Cubaoënsem.".',
  },
  'john-paul-ii|engativensis|2003-08-06': {
    argumentum:
      'ENGATIVENSIS* IN COLUMBIA NOVA CONDITUR DIOECESIS ENGATIVENSIS',
    note:
      'Detaches fifty-one parishes of north-western Bogota from the Archdiocese of Bogota and '
      + 'erects the new Diocese of Engativa (Colombia), suffragan to Bogota: "...atque ex ita '
      + 'distracto territorio novam constituimus dioecesim Engativensem, iisdem limitatam '
      + 'finibus, quibus praedictae paroeciae simul sumptae nunc terminantur.".',
  },
  'john-paul-ii|fontibonensis|2003-08-06': {
    argumentum:
      'FONTIBONENSIS* IN COLUMBIA NOVA DIOECESIS FONTIBONENSIS APPELLANDA ERIGITUR',
    note:
      'Detaches forty-four parishes of western Bogota from the Archdiocese of Bogota and '
      + 'erects the new Diocese of Fontibon (Colombia), suffragan to Bogota: "...Ex ita definito '
      + 'territorio novam dioecesim Fontibonensem appellandam constituimus, cuius sedem in loco '
      + 'vulgo dicto Fontibón ponimus...".',
  },
  'john-paul-ii|soachaensis|2003-08-06': {
    argumentum:
      'SOACHAËNSIS* EX ARCHIDIOECESI BOGOTENSI IN COLUMBIA QUODAM DISTRACTO TERRITORIO, NOVA '
      + 'DIOECESIS SOACHAËNSIS APPELLANDA ERIGITUR',
    note:
      'Detaches twenty-nine parishes of Soacha, Sibate and southern Bogota from the '
      + 'Archdiocese of Bogota and erects the new Diocese of Soacha (Colombia), suffragan to '
      + 'Bogota: "...atque ex ita distracto territorio novam dioecesim, Soachaënsem appellandam, '
      + 'iisdemque circumscriptam finibus quibus praefatae paroeciae simul sumptae terminantur, '
      + 'erigimus ac constituimus...".',
  },
  'john-paul-ii|dindigulensis|2003-10-30': {
    argumentum:
      'DINDIGULENSIS* IN INDIA NOVA CONDITUR DIOECESIS DINDIGULENSIS.',
    note:
      'Detaches the taluks of Dindigul, Vedasandur, Oddanchatram, Palani and Natham from the '
      + 'Diocese of Tiruchirapalli and six parishes of Dindigul district from the Archdiocese of '
      + 'Madurai and erects the new Diocese of Dindigul (India), suffragan to Madurai: "...ex '
      + 'iisque novam dioecesim Dindigulensem condimus, quam metropolitanae Ecclesiae '
      + 'Madhuraiensi suffraganeam facimus...".',
  },
  'john-paul-ii|mindelensis|2003-11-14': {
    argumentum:
      'MINDELENSIS * IN CAPITE VIRIDI NOVA CONDITUR DIOECESIS MINDELENSIS APPELLANDA.',
    note:
      'Detaches the Barlavento islands (Santo Antao, Sao Vicente, Santa Luzia, Sao Nicolau, '
      + 'Boa Vista, Sal) from the Diocese of Santiago de Cabo Verde and erects the new Diocese '
      + 'of Mindelo (Cape Verde), immediately subject to the Holy See: "...atque ex iis novam '
      + 'dioecesim Mindelensem appellandam erigimus ac constituimus.".',
  },
  'john-paul-ii|emdeberensis|2003-11-25': {
    argumentum:
      'EMDEBERENSIS * IN AETHIOPIA NOVA EPARCHIA CONSTITUITUR NOMINE EMDEBERENSIS.',
    note:
      'Detaches the Gurage Zone and the Wolliso Zone from the Archeparchy of Addis Ababa and '
      + 'erects the new Eparchy of Emdeber (Ethiopia), its suffragan: "...Quodam detracto '
      + 'territorio a memorata archieparchia, novam constituimus eparchiam Emdeberensem, cuius '
      + 'sedem in urbe «Emdeber» poni iubemus...".',
  },
  'john-paul-ii|timikaensis|2003-12-19': {
    argumentum:
      'TIMIKAËNSIS * IN INDONESIA NOVA DIOECESIS ERIGITUR NOMINE TIMIKAËNSIS.',
    note:
      'Detaches the western part of the Diocese of Jayapura (Biak-Numfor, Yapen-Waropen, '
      + 'Nabire, Paniai, Puncak Jaya and Mimika) and erects the new Diocese of Timika '
      + '(Indonesia), suffragan to Merauke: "...Detracta parte occidentali territorii dioecesis '
      + 'Iayapuraënsis, novam dioecesim Timikaënsem erigimus...".',
  },
  'john-paul-ii|irapuatensis|2004-01-03': {
    argumentum:
      'IRAPUATENSIS* IN MEXICO NOVA CONDITUR DIOECESIS IRAPUATENSIS.',
    note:
      'Detaches six municipalities and six parishes of Penjamo from the Archdiocese of Morelia '
      + 'and the municipalities of Irapuato and Pueblo Nuevo from the Diocese of Leon and erects '
      + 'the new Diocese of Irapuato (Mexico), suffragan to San Luis Potosi: "...atque ex ita '
      + 'distractis locis novam constituimus dioecesim Irapuatensem.".',
  },
  'john-paul-ii|bydgostiensis|2004-02-24': {
    argumentum:
      'BYDGOSTIENSIS * IN POLONIA NOVA CONDITUR DIOECESIS «BYDGOSTIENSIS» APPELLANDA.',
    note:
      'Detaches twelve deaneries from the Archdiocese of Gniezno, eighteen parishes from the '
      + 'Diocese of Pelplin and the deanery of Zlotow from Koszalin-Kolobrzeg and erects the new '
      + 'Diocese of Bydgoszcz (Poland), suffragan to Gniezno: "...atque ex ita distractis '
      + 'territoriis novam consituimus dioecesim Bydgostiensem appellandam iisdem circumscriptam '
      + 'finibus quibus praefati decanatus et paroeciae simul sumpti in praesens terminantur.".',
  },
  'john-paul-ii|lodziensis|2004-02-24': {
    argumentum:
      'LODZIENSIS* PROVINCIA ECCLESIASTICA LODZIENSIS APPELLANDA IN POLONIA CONDITUR.',
    note:
      'Raises the Archdiocese of Lodz, until now immediately subject to the Holy See, to a '
      + 'metropolitan see and erects the new ecclesiastical province of Lodz (Poland) with '
      + 'Lowicz as suffragan: "...Lodziensem sedem archiepiscopalem Sanctae Sedi adhuc immediate '
      + 'subiectam ad fastigium metropolitanae Ecclesiae evehimus...Ex territorio porro duarum '
      + 'communitatum ecclesialium, Lodziensis scilicet et Lovicensis, novam constituimus '
      + 'Provinciam ecclesiasticam Lodziensem appellandam.". The province is what the argumentum '
      + 'states (CONDITUR).',
  },
  'john-paul-ii|raipurensis|2004-02-24': {
    argumentum:
      'RAIPURENSIS* IN INDIA CONSTITUITUR NOVA PROVINCIA ECCLESIASTICA RAIPURENSIS, CUIUS '
      + 'METROPOLITANA ECCLESIA ERIT SEDES EIUSDEM NOMINIS.',
    note:
      'Detaches the Dioceses of Ambikapur, Jagdalpur (Syro-Malabar), Raigarh and Raipur from '
      + 'the province of Bhopal and erects the new ecclesiastical province of Raipur (India), '
      + 'raising Raipur to a metropolitan archdiocese: "...ex iisque constituimus novam '
      + 'Provinciam ecclesiasticam Raipurensem atque dioecesim eiusdem nominis ad gradum '
      + 'archidioecesis metropolitanae evehimus...".',
  },
  'john-paul-ii|suidniciensis|2004-02-24': {
    argumentum:
      'SUIDNICIENSIS * IN POLONIA NOVA CONDITUR DIOECESIS SUIDNICIENSIS.',
    note:
      'Detaches thirteen deaneries from the Archdiocese of Wroclaw and nine from the Diocese '
      + 'of Legnica and erects the new Diocese of Swidnica (Poland), suffragan to Wroclaw: '
      + '"...atque ex ita distracto territorio novam dioecesim constituimus Suidniciensem '
      + 'nuncupandam.".',
  },
  'john-paul-ii|trivandrensis-latinorum|2004-06-03': {
    argumentum:
      'TRIVANDRENSIS LATINORUM* IN INDIA NOVA CONSTITUITUR PROVINCIA ECCLESIASTICA '
      + 'TRIVANDRENSIS LATINORUM.',
    note:
      'Detaches the Dioceses of Alleppey, Neyyattinkara, Punalur, Quilon and Trivandrum of the '
      + 'Latins from the province of Verapoly and erects the new Latin ecclesiastical province '
      + 'of Trivandrum (India), Trivandrum becoming a metropolitan archdiocese: "...ex iis novam '
      + 'ecclesiasticam Provinciam Trivandrensem Latinorum constituimus, cuius sedes princeps '
      + 'eri t deinceps, his Litteris constituta, archidioecesis Trivandrensis Latinorum...".',
  },
  'john-paul-ii|barcinonensis|2004-06-15': {
    argumentum:
      'BARCINONENSIS* NOVA CONDITUR PROVINCIA ECCLESIASTICA SCILICET BARCINONENSIS, QUAE SEDES '
      + 'AD DIGNITATEM ECCLESIAE METROPOLITANAE ATTOLLITUR.',
    note:
      'Erects the new ecclesiastical province of Barcelona (Spain), raising the Archdiocese of '
      + 'Barcelona to a metropolitan see with the Dioceses of Terrassa and Sant Feliu de '
      + 'Llobregat, erected the same day, as suffragans: "...Provinciam ecclesiasticam '
      + 'Barcinonensem condimus ac sedem archiepiscopalem Barcinonensem ad metropolitanam '
      + 'Ecclesiam evehimus...". The province is what the argumentum leads with (CONDITUR), so '
      + 'this is an erection; the curation script proposed an elevation on the ATTOLLITUR of its '
      + 'relative clause.',
  },
  'john-paul-ii|terrassensis|2004-06-15': {
    argumentum:
      'TERRASSENSIS * IN HISPANIA NOVA DIOECESIS ERIGITUR NOMINE TERRASSENSIS.',
    note:
      'Detaches twelve deaneries (Montcada, Sant Cugat-Les Planes, Terrassa, Rubi, Sabadell '
      + 'Centre, Nord and Sud, Granollers, Puiggracios, Mollet, Montseny, Montbui) from the '
      + 'Archdiocese of Barcelona and erects the new Diocese of Terrassa (Spain), suffragan to '
      + 'Barcelona: "...ex iis erigimus ac constituimus novam dioecesim Terrassensem. '
      + 'Archiepiscopali item Sedi Barcinonensi eandem suffraganeam constituimus...".',
  },
  'john-paul-ii|uijongbuensis|2004-06-24': {
    argumentum:
      'UIJONGBUENSIS * IN COREA NOVA CONDITUR DIOECESIS UIJONGBUENSIS APPELLANDA.',
    note:
      'Detaches northern Gyeonggi (Uijongbu, Goyang, Guri, Namyangju, Paju, '
      + 'Dongducheon-Yangju, Yeoncheon) from the Archdiocese of Seoul and erects the new Diocese '
      + 'of Uijongbu (Korea), suffragan to Seoul: "...ab archidioecesi quam diximus abstrahimus '
      + 'et ex iis novam dioecesim Uijongbuensem appellandam erigimus ac constituimus.".',
  },
  'john-paul-ii|villavicentiensis|2004-07-03': {
    argumentum:
      'VILLAVICENTIENSIS * NOVA CONDITUR PROVINCIA ECCLESIASTICA SCILICET VILLAVICENTIENSIS, '
      + 'QUAE SEDES AD DIGNITATEM ECCLESIAE METROPOLITANAE ATTOLLITUR.',
    note:
      'Erects the new ecclesiastical province of Villavicencio (Colombia), raising '
      + 'Villavicencio to a metropolitan see with San Jose del Guaviare and Granada, withdrawn '
      + 'from Bogota, as suffragans: "...Provinciam ecclesiasticam Villavicentiensem condimus '
      + 'atque sedem episcopalem Villavicentiensem ad dignitatem metropolitanae Ecclesiae '
      + 'attollimus...". The province is what the argumentum leads with (CONDITUR), so this is '
      + 'an erection; the curation script proposed an elevation on the ATTOLLITUR of its '
      + 'relative clause.',
  },
  'john-paul-ii|bruneiensis|2004-10-20': {
    argumentum:
      'BRUNEIENSIS* IN BRUNEIO DARUSSALAM NOVUS CONDITUR VICARIATUS APOSTOLICUM BRUNEIENSIS',
    note:
      'Raises the Apostolic Prefecture of Brunei, erected in 1997, to an apostolic vicariate '
      + 'of the same name, entrusted to the Mill Hill Missionaries: "...memoratam Praefecturam '
      + 'Apostolicam Bruneiensem ad gradum Vicariatus Apostolici evehimus eodem servato nomine '
      + 'Bruneiensi...". Stated by the argumentum as a new vicariate CONDITUR and filed on those '
      + 'words; the body works it as an elevation (Ruling 9). The heading prints "VICARIATUS '
      + 'APOSTOLICUM", as quoted.',
  },
  'john-paul-ii|doriensis|2004-11-20': {
    argumentum:
      'DORIENSIS* IN REPUBLICA BURKINA FASANA NOVA CONDITUR DIOECESIS DORIENSIS',
    note:
      'Detaches the civil provinces of Seno, Oudalan, Yagha and Soum (Sahel region) from the '
      + 'Dioceses of Fada N\'Gourma and Ouahigouya and erects the new Diocese of Dori (Burkina '
      + 'Faso), suffragan to Koupela: "...ex eoque novam constituimus diocesim Doriensem, quam '
      + 'metropolitanae Ecclesiae Kupelaënsi suffraganeam facimus...".',
  },
  'john-paul-ii|alindaoensis|2004-12-18': {
    argumentum:
      'ALINDAOËNSIS* IN AFRICA MEDIA NOVA CONDITUR DIOECESIS ALINDAOËNSIS APPELLANDA',
    note:
      'Detaches the civil prefecture of Basse-Kotto from the Diocese of Bangassou and erects '
      + 'the new Diocese of Alindao (Central African Republic), suffragan to Bangui: "...atque '
      + 'ex ita distracto territorio novam dioecesim constituimus Alindaoënsem nuncupandam.".',
  },
  'john-paul-ii|castagnalensis-de-para|2004-12-29': {
    argumentum:
      'CASTAGNALENSIS DE PARÁ* IN BRASILIA NOVA CONDITUR DIOECESIS CASTAGNALENSIS DE PARÁ',
    note:
      'Detaches twenty-four municipalities from the Archdiocese of Belem do Para and Sao '
      + 'Domingos do Capim from the Diocese of Braganca do Para and erects the new Diocese of '
      + 'Castanhal (Brazil), suffragan to Belem do Para: "...atque ex ita distractis locis novam '
      + 'constituimus dioecesim Castagnalensem de Pará...".',
  },
  'john-paul-ii|galvestoniensis-houstoniensis|2004-12-29': {
    argumentum:
      'GALVESTONIENSIS-HOUSTONIENSIS* IN FOEDERATIS CIVITATIBUS AMERICAE SEPTEMTRIONALIS NOVA '
      + 'CONSTITUITUR PROVINCIA ECCLESIASTICA GALVESTONIENSIS-HOUSTONIENSIS',
    note:
      'Detaches the Dioceses of Austin, Beaumont, Brownsville, Corpus Christi, '
      + 'Galveston-Houston, Tyler and Victoria in Texas from the province of San Antonio and '
      + 'erects the new ecclesiastical province of Galveston-Houston, its see becoming a '
      + 'metropolitan archdiocese: "...atque summa Nostra apostolica potestate ex iis novam '
      + 'ecclesiasticam provinciam Galvestoniensem-Houstoniensem constituimus, cuius sedes '
      + 'princeps erit deinceps, his Litteris constituta, archidioecesis '
      + 'Galvestoniensis-Houstoniensis...".',
  },
  'john-paul-ii|usbekistaniae|2005-04-01': {
    argumentum:
      'USBEKISTANIAE* ADMINISTRATIO APOSTOLICA CONDITUR IN USBEKISTANIA',
    note:
      'Raises the Mission sui iuris of Uzbekistan to an apostolic administration, entrusted to '
      + 'the Conventual Franciscans: "...Missionem sui iuris in Republica Usbekistaniae ad '
      + 'gradum dignitatemque Administrationis Apostolicae evehimus et eam pariter curis ac '
      + 'pastoralibus sollicitudinibus sodalium Ordinis Fratrum Minorum Conventualium '
      + 'committimus.". Stated by the argumentum as an administration CONDITUR and filed on '
      + 'those words; the body works it as an elevation (Ruling 9).',
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
  // The fifth curation instalment (Task 6), John Paul II: the 59 of the 390 candidates that
  // raise an existing circumscription in rank (1979-03-28 through 2005-01-25). Most raise a
  // prelature, prefecture, vicariate, administration or mission sui iuris to a diocese or
  // vicariate; nine raise a see to metropolitan or archiepiscopal rank ('Lyciensis',
  // 'Monoecensis', 'Pinnensis-Piscariensis', 'Mvanzaënsis', 'Luxemburgensis',
  // 'Argentoratensis', 'Antioquiensis', 'Mercedensis-Luianensis', 'Tiranensis-Dyrracena'),
  // and where a new province follows, the elevation is what the argumentum leads with.
  // 'Premisliensis-Varsaviensis' is quoted by hand because a lower-case 'ritus' in its
  // toponym stopped the reader. Three state the act in a form the elevation idioms do not
  // list ('Guiratingensis et aliarum' AD DIOECESIUM ATTOLLUNTUR GRADUM, 'Iammuensis-
  // Srinagarensis' IURIDICIALIS FORMA DIOECESIS IMPONITUR, 'Izabalensis' AD CANONICUM GRADUM
  // VICARIATUS APOSTOLICI TOLLITUR) and are left for the controller's ruling.
  'john-paul-ii|trudensis|1979-03-28': {
    argumentum:
      'TRUDENSIS* VICARIATUS APOSTOLICUS NORVEGIAE CENTRALIS AD GRADUM PRAELATURAE ERIGITUR, '
      + 'NOMINE TRUDENSIS',
    note:
      'Raises the Apostolic Vicariate of Central Norway to a prelature named Trondheim, '
      + 'immediately subject to the Holy See, with St Olav\'s in Trondheim as its prelatial '
      + 'church: "...Vicariatum Apostolicum Norvegiae Centralis ad dignitatem Praelaturae '
      + 'Apostolicae, Trudensis appellandae, erigimus...". The ERIGITUR of the argumentum raises '
      + 'an existing vicariate in rank; nothing new is carved out.',
  },
  'john-paul-ii|cholutecensis|1979-08-29': {
    argumentum:
      'CHOLUTECENSIS* PRAELATURA CHOLUTECENSIS IN HONDURIA AD GRADUM DIOECESIS ERIGITUR, NOVO '
      + 'INDITO NOMINE CHOLUTECENSIS',
    note:
      'Raises the Prelature of Choluteca (Honduras), erected by Paul VI in 1964, to a diocese '
      + 'under the new Latin name Cholutecensis, keeping its boundaries, suffragan to '
      + 'Tegucigalpa: "...Praelaturam Cholutensem in dioecesium attollimus numerum, novo indito '
      + 'nomine Cholutecensis iisdemque circumscriptam finibus...".',
  },
  'john-paul-ii|guaiaramirensis|1979-10-06': {
    argumentum:
      'GUAIARAMIRENSIS* PRAELATURA GUAIARAMIRENSIS IN BRASILIA AD GRADUM DIOECESIS ATTOLLITUR '
      + 'NOMINE IMMUTATO',
    note:
      'Raises the Prelature of Guajara-Mirim (Brazil) to a diocese, keeping its name and '
      + 'boundaries, suffragan to Cuiaba: "...Praelaturam Guaiaramirensem in dioecesium numero '
      + 'recensemus, immutata appellatione finibusque.".',
  },
  'john-paul-ii|guamensis|1979-10-16': {
    argumentum:
      'GUAMENSIS* PRAELATURA GUAMENSIS IN BRASILIA AD GRADUM DIOECESIS EVEHITUR',
    note:
      'Raises the Prelature of Guama (Brazil) to a diocese, keeping its name and boundaries, '
      + 'suffragan to Belem do Para: "...Praelaturam Guamensem ad gradum et dignitatem dioecesis '
      + 'extollimus in eoque constituimus, servatis eodem nomine iisdemque finibus quibus nunc '
      + 'terminatur.".',
  },
  'john-paul-ii|santaremensis-et-aliae|1979-10-16': {
    argumentum:
      'SANTAREMENSIS ET ALIAE* PRAELATURA SANTAREMENSIS ET QUAEDAM ALIAEAD GRADUM ET '
      + 'DIGNITATEM DIOECESIS EVEHUNTUR NOMINIBUS AC FINIBUS AB UNAQUAQUE SERVATIS',
    note:
      'Raises twelve Brazilian prelatures -- Santarem, Maraba, Porto Velho, Diamantino, '
      + 'Pinheiro, Roraima, Formosa, Carolina, Humaita, Ponta de Pedras (Petrosi Culminis), '
      + 'Rubiataba and Conceicao do Araguaia -- to dioceses, each keeping its name, boundaries '
      + 'and metropolitan: "...praelaturas, quas diximus, ad gradum et dignitatem dioecesis '
      + 'attollimus, eadem servantes nomina iisdemque circumscriptas finibus quibus nunc '
      + 'terminantur.". The heading prints "ALIAEAD" without a space, as quoted.',
  },
  'john-paul-ii|zanzibarensis|1980-03-12': {
    argumentum:
      'ZANZIBARENSIS* ADMINISTRATIO APOSTOLICA ZANZIBARENSIS ET PEMBAENSIS AD GRADUM DIOECESIS '
      + 'EVEHITUR',
    note:
      'Raises the Apostolic Administration of Zanzibar and Pemba (Tanzania) to a diocese, '
      + 'henceforth called simply Zanzibar, suffragan to Dar-es-Salaam: "...Administrationem '
      + 'Apostolicam Zanzibarensem et Pembaensem ad gradum dioecesis provehimus, quae posthac '
      + 'tantum Zanzibarensis appellabitur...".',
  },
  'john-paul-ii|lyciensis|1980-10-20': {
    argumentum:
      'LYCIENSIS* IN ITALIA ECCLESIA LYCIENSIS AD DIGNITATEM METROPOLITANAE SEDIS EVEHITUR '
      + 'NOVAQUE ECCLESIASTICA PROVINCIA CONSTITUITUR EODEM NOMINE',
    note:
      'Raises the Diocese of Lecce (Italy), until now immediately subject to the Holy See, to '
      + 'a metropolitan see and constitutes the new province of Lecce with Brindisi and Otranto '
      + '(which lose their metropolitan office but keep the archiepiscopal title), Gallipoli, '
      + 'Nardo, Ostuni and Ugento-Santa Maria di Leuca as suffragans: "...Cathedralem Ecclesiam '
      + 'Lyciensem, nunc Apostolicae Sedi immediate subiectam, ad gradum metropolitanae Sedis '
      + 'attollimus...". The elevation is what the argumentum leads with; the province is its '
      + 'consequence.',
  },
  'john-paul-ii|sibolgaensis|1980-10-24': {
    argumentum:
      'SIBOLGAËNSIS* PRAEFECTURA APOSTOLICA SIBOLGAËNSIS IN INDONESIA AD DIOECESIS GRADUM ET '
      + 'DIGNITATEM EVEHITUR',
    note:
      'Raises the Apostolic Prefecture of Sibolga (Indonesia) to a diocese, keeping its name '
      + 'and boundaries, suffragan to Medan: "...Praefecturam Sibolgaënsem in dioecesium numerum '
      + 'recensemus, immutata appellatione finibusque.".',
  },
  'john-paul-ii|monoecensis|1981-07-30': {
    argumentum:
      'MONOECENSIS* MONOECENSIS DIOECESIS AD GRADUM ARCHIDIOECESIS EVEHITUR ADHUC ROMANAE SEDI '
      + 'IMMEDIATE SUBIECTA',
    note:
      'Raises the Diocese of Monaco to an archdiocese, still immediately subject to the Holy '
      + 'See and with no suffragans, in execution of article I of the convention of 25 July 1981 '
      + 'between the Holy See and the Principality: "...cathedralem Ecclesiam Monoecensem ad '
      + 'gradum et dignitatem archidioecesis tollimus...quae tamen et Sanctae Sedi perget esse '
      + 'subiecta, nec sedibus suffraganeis praeerit ullis.".',
  },
  'john-paul-ii|abaetiensis-ad-tocantinsum-et-aliarum|1981-08-04': {
    argumentum:
      'ABAETIENSIS AD TOCANTINSUM ET ALIARUM* PRAELATURAE ABAETIENSIS AD TOCANTINSUM, '
      + 'MIRACEMANA SUPERIOR, S. LUDOVICI DE MONTES BELOS ET S. IOSEPH DE GRAIU AD GRADUM ET '
      + 'DIGNITATEM DIOECESIUM EVEHUNTUR',
    note:
      'Raises four Brazilian prelatures -- Abaete do Tocantins (renamed Abaetetuba), Alto '
      + 'Miracema (Miracema do Norte), Sao Luis de Montes Belos and Sao Jose de Grajau -- to '
      + 'dioceses, keeping their boundaries and metropolitans: "...Praelaturas quas supra '
      + 'recensuimus ad dignitatem dioecesium evehimus omnium servato nomine, praeterquam '
      + 'Abaetiensis ad Tocantinsum, quam Abaetetubensem in posterum appellari censemus...".',
  },
  'john-paul-ii|guiratingensis-et-aliarum|1981-10-03': {
    argumentum:
      'GUIRATINGENSIS ET ALIARUM* PRAELATURAE GUIRATINGENSIS, BONI IESU DE PIAUI, MUTATO '
      + 'NOMINE BONI IESU A GURGUEIA, RAYMUNDIANA ET SANCTI ANTONII DE BALSAS, POSTHAC BALSENSIS '
      + 'DICENDA, IN BRASILIA, AD DIOECESIUM ATTOLLUNTUR GRADUM',
    note:
      'Raises four Brazilian prelatures -- Guiratinga, Bom Jesus do Piaui (renamed Bom Jesus '
      + 'do Gurgueia), Sao Raimundo Nonato and Santo Antonio de Balsas (renamed Balsas) -- to '
      + 'dioceses, keeping their boundaries and metropolitans: "...praedictas supra praelaturas '
      + 'ad gradum provehimus et dignitatem dioecesium dioecesesque constituimus, servatis earum '
      + 'nominibus, dummodo excipiantur praelaturae Boni Iesu de Piaui et Sancti Antonii de '
      + 'Balsas...". The curation script abstained because AD DIOECESIUM ATTOLLUNTUR GRADUM is '
      + 'an elevation stated in a word order the idioms do not list.',
  },
  'john-paul-ii|pinnensis-piscariensis|1982-03-02': {
    argumentum:
      'PINNENSIS-PISCARIENSIS* CATHEDRALIS ECCLESIA PINNENSIS-PISCARIENSIS AD HONOREM SEDIS '
      + 'METROPOLITANAE CUI NOMEN PISCARIENSIS-PINNESIS EVEHITUR SIMULQUE ECCLESIASTICA '
      + 'PROVINCIA NOMINE ITA MUTATO IAM NUNC ET IN POSTERUM APPELLANDA EX INTEGRO ILLIC '
      + 'CONSTITUITUR',
    note:
      'Raises the Diocese of Penne-Pescara (Italy), until now immediately subject to the Holy '
      + 'See, to a metropolitan see under the reversed name Pescara-Penne and constitutes the '
      + 'province of Pescara-Penne with Teramo and Atri (united aeque principaliter) as '
      + 'suffragan: "...Cathedralem Ecclesiam, quam diximus, Pinnensem-Piscariensem, hucusque '
      + 'Apostolicae Sedi immediate subiectam, nunc ad Ecclesiae metropolitanae dignitatem '
      + 'extollimus eique et nomen mutamus in Piscariensem-Pinnensem...". The elevation is what '
      + 'the argumentum leads with; the heading prints "PISCARIENSIS-PINNESIS", as quoted.',
  },
  'john-paul-ii|anuradhapurensis|1982-03-12': {
    argumentum:
      'ANURADHAPURENSIS* PRAEFECTURA APOSTOLICA ANURADHAPURENSIS AD DIGNITATEM DIOECESIS '
      + 'EVEHITUR',
    note:
      'Raises the Apostolic Prefecture of Anuradhapura (Sri Lanka) to a diocese, suffragan to '
      + 'Colombo: "...Praefecturam Apostolicam Anuradhapurensem ad gradum et dignitatem '
      + 'dioecesis evehimus, factis nempe iuribus atque oneribus quae dioecesium sunt propria.".',
  },
  'john-paul-ii|coroicensis|1983-07-13': {
    argumentum:
      'COROICENSIS* IN BOLIVIA AD DIOECESIS GRADUM PRAELATURA ATTOLLITUR NOMINE COROICENSIS',
    note:
      'Raises the Prelature of Coroico (Bolivia) to a diocese, keeping its name and '
      + 'boundaries, suffragan to La Paz: "...praelaturam Coroicensem, quam diximus, ad gradum '
      + 'honoremque evehimus dioecesis proprium, non mutato nomine iisdemque servatis '
      + 'finibus...".',
  },
  'john-paul-ii|candimendensis|1983-10-13': {
    argumentum:
      'CANDIMENDENSIS* PRAELATURA CANDIMENDENSIS AD GRADUM DIOECESIS TOLLITUR NOMINE IMMUTATO',
    note:
      'Raises the Prelature of Candido Mendes (Brazil) to a diocese, keeping its name and '
      + 'boundaries, suffragan to Sao Luis do Maranhao: "...Memoratam praelaturam Candimendensem '
      + 'tollimus ad gradum dioecesis atque constituimus talem ecclesiasticam dicionem, servatis '
      + 'iisdem quos adhuc habuit finibus necnon nomine ipso.".',
  },
  'john-paul-ii|garissaensis|1984-02-03': {
    argumentum:
      'GARISSAËNSIS* PRAEFECTURA APOSTOLICA GARISSAËNSIS, IN KENYA, AD GRADUM DIOECESIS '
      + 'TOLLITUR',
    note:
      'Raises the Apostolic Prefecture of Garissa (Kenya) to a diocese, keeping its name and '
      + 'boundaries, suffragan to Nairobi: "...Apostolicam Praefecturam Garissaënsem ad gradum '
      + 'et dignitatem dioecesis evehimus, eodem nomine iisdemque limitibus.".',
  },
  'john-paul-ii|aguaricoensis|1984-07-02': {
    argumentum:
      'AGUARICOËNSIS* PRAEFECTURA APOSTOLICA AGUARICOËNSIS AD GRADUM VICARIATUS APOSTOLICI '
      + 'ATTOLLITUR, NOMINE HAUD MUTATO',
    note:
      'Raises the Apostolic Prefecture of Aguarico (Ecuador), entrusted to the Capuchins, to '
      + 'an apostolic vicariate, keeping its name and boundaries: "...Praefecturam Apostolicam '
      + 'Aguaricoënsem ad gradum honoremque Vicariatus Apostolici evehimus, eodem nomine '
      + 'appellandi iisdemque finibus continendi...".',
  },
  'john-paul-ii|araucensis|1984-07-11': {
    argumentum:
      'ARAUCENSIS* VICARIATUS APOSTOLICUS ARAUCENSIS AD GRADUM DIOECESIS ATTOLLITUR',
    note:
      'Raises the Apostolic Vicariate of Arauca (Colombia) to a diocese, keeping its name and '
      + 'boundaries, suffragan to Nueva Pamplona: "...Vicariatum Apostolicum Araucensem '
      + 'dioecesim constituimus, Ecclesiae Neopampilonensi suffraganeam, eodem nomine iisdemque '
      + 'finibus servatis...".',
  },
  'john-paul-ii|chinhoyiensis|1985-05-28': {
    argumentum:
      'CHINHOYIENSIS* PRAEFECTURA CHINHOIYENSIS AD DIOECESIS GRADUM ATTOLLITUR',
    note:
      'Raises the Apostolic Prefecture of Chinhoyi (Zimbabwe) to a diocese, suffragan to '
      + 'Harare: "...Praefecturam Chinhoyiensem ad dioecesis gradum et dignitatem evehimus, cum '
      + 'iuribus talium Ecclesiarum propriis.". The heading prints "CHINHOIYENSIS", as quoted.',
  },
  'john-paul-ii|tarmensis|1985-12-21': {
    argumentum:
      'TARMENSIS* PRAELATURA TARMENSIS EVEHITUR AD DIGNITATEM DIOECESIS',
    note:
      'Raises the Prelature of Tarma (Peru), erected in 1959, to a diocese, keeping its name '
      + 'and boundaries, suffragan to Huancayo: "...memoratam Praelaturam evehimus ad gradum '
      + 'dioecesis haud mutato tamen nomine seu Tarmensis appellandae iisdemque finibus '
      + 'definitae...".',
  },
  'john-paul-ii|iammuensis-srinagarensis|1986-03-10': {
    argumentum:
      'IAMMUENSIS-SRINAGARENSIS* APOSTOLICAE PRAEFECTURAE IAMMUENSI ET KASHMIRENSI IAM '
      + 'IURIDICIALIS FORMA DIOECESIS IMPONITUR, AC NOMEN INDITUR IAMMUENSIS-SRINAGARENSIS',
    note:
      'Raises the Apostolic Prefecture of Jammu and Kashmir (India) to a diocese under the new '
      + 'name Jammu-Srinagar, keeping its boundaries, suffragan to Delhi: "...Praefecturam '
      + 'Apostolicam Iammuensem et Kashmirensem in dioecesis redigimus figuram, commutato '
      + 'scilicet superiore ipsius nomine in ecclesiam Iammuensem-Srinagarensem, iisdem tamen '
      + 'dicionis manentibus finibus...". The curation script abstained because IURIDICIALIS '
      + 'FORMA DIOECESIS IMPONITUR is an elevation stated in words the idioms do not list.',
  },
  'john-paul-ii|aricensis|1986-08-29': {
    argumentum:
      'ARICENSIS* PRAELATURA ARICENSIS AD GRADUM DIOECESIS ATTOLLITUR',
    note:
      'Raises the Territorial Prelature of Arica (Chile), erected in 1959, to a diocese, '
      + 'keeping its boundaries, suffragan to Antofagasta: "...Praelaturam territorialem '
      + 'Aricensem ad gradum et honorem dioecesis tollimus atque constituimus iisdem nempe '
      + 'circumscriptam finibus quibus in praesentia terminatur.".',
  },
  'john-paul-ii|ariariensis|1987-10-03': {
    argumentum:
      'ARIARIENSIS* PRAEFECTURA APOSTOLICA ARIARIENSIS, IN COLUMBIANA REPUBLICA, AD GRADUM '
      + 'ATTOLLITUR VICARIATUS APOSTOLICI',
    note:
      'Raises the Apostolic Prefecture of Ariari (Colombia), entrusted to the Salesians, to an '
      + 'apostolic vicariate, keeping its name and boundaries: "...Praefecturam Apostolicam '
      + 'Ariariensem ad dignitatem evehimus Vicariatus Apostolici, eodem nomine appellandi...".',
  },
  'john-paul-ii|iuticalpensis|1987-10-31': {
    argumentum:
      'IUTICALPENSIS* IMMACULATAE CONCEPTIONIS B.M.V. IN OLANCHO PRAELATURA TERRITORIALIS AD '
      + 'GRADUM DIOECESIS EVEHITUR QUAE DEINCEPS IUTICALPENSIS ERIT COGNOMINANDA',
    note:
      'Raises the Territorial Prelature of the Immaculate Conception of the BVM in Olancho '
      + '(Honduras), entrusted to the Franciscans, to a diocese under the new name Juticalpa, '
      + 'keeping its boundaries, suffragan to Tegucigalpa: "...Praelaturam quam supra diximus ad '
      + 'gradum et dignitatem dioecesis evehimus et constituimus, servatis nempe iisdem finibus '
      + 'quibus nunc eadem terminatur.".',
  },
  'john-paul-ii|mvanzaensis|1987-11-18': {
    argumentum:
      'MVANZAËNSIS* ECCLESIA MVANZAËNSIS EVEHITUR AD DIGNITATEM ARCHIDIOECESIS METROPOLITANAE '
      + 'EODEMQUE NOMINE NOVA CONDITUR PROVINCIA ECCLESIASTICA',
    note:
      'Raises the Diocese of Mwanza (Tanzania) to a metropolitan archdiocese and constitutes '
      + 'the new province of Mwanza with Bukoba, Geita, Musoma, Rulenge and Shinyanga as '
      + 'suffragans: "...Dioecesim Mvanzaënsem evehimus ad gradum archidioecesis Metropolitanae '
      + 'novamque eodem nomine provinciam ecclesiasticam condimus...". The elevation is what the '
      + 'argumentum leads with; the province is its consequence.',
  },
  'john-paul-ii|rustenburgensis|1987-11-18': {
    argumentum:
      'RUSTENBURGENSIS* PRAEFECTURA APOSTOLICA RUSTENBURGENSIS AD DIGNITATEM DIOECESIS EVEHITUR',
    note:
      'Raises the Apostolic Prefecture of Rustenburg (South Africa), entrusted to the '
      + 'Redemptorists, to a diocese, keeping its name and boundaries, suffragan to Pretoria: '
      + '"...Praefecturam Apostolicam Rustenburgensem ad dignitatem dioecesis elevamus, iisdem '
      + 'servatis finibus ac nomine atque antea, eandemque archidioecesis metropolitanae '
      + 'Praetoriensis suffraganeam facimus.".',
  },
  'john-paul-ii|izabalensis|1988-03-12': {
    argumentum:
      'IZABALENSIS* ADMINISTRATIO APOSTOLICA IZABALENSIS AD CANONICUM GRADUM VICARIATUS '
      + 'APOSTOLICI TOLLITUR',
    note:
      'Raises the Apostolic Administration of Izabal (Guatemala), twenty years after its '
      + 'erection, to an apostolic vicariate, keeping its name and boundaries: "...tollimus '
      + 'Administrationem Apostolicam Izabalensem canonicum ad gradum Vicariatus Apostolici...". '
      + 'The curation script abstained because AD CANONICUM GRADUM VICARIATUS APOSTOLICI '
      + 'TOLLITUR is an elevation stated in a word order the idioms do not list.',
  },
  'john-paul-ii|paciensis-in-california-infer-merid|1988-03-21': {
    argumentum:
      'PACIENSIS IN CALIFORNIA INFERIORI MERIDIONALI* PACIENSIS IN CALIFORNIA INFERIORI '
      + 'MERIDIONALI VICARIATUS APOSTOLICUS AD GRADUM EVEHITUR DIOECESIS',
    note:
      'Raises the Apostolic Vicariate of La Paz en la Baja California Sur (Mexico), entrusted '
      + 'to the Comboni Missionaries, to a diocese, keeping its name and boundaries, suffragan '
      + 'to Hermosillo: "...Paciensem in California Inferiori Meridionali Vicariatum Apostolicum '
      + 'in dioecesis redigimus formam, servatis nempe eodem nomine iisdemque finibus quibus '
      + 'usque adhuc terminatur.".',
  },
  'john-paul-ii|luxemburgensis|1988-04-23': {
    argumentum:
      'LUXEMBURGENSIS* DIOECESIS LUXEMBURGENSIS AD GRADUM ARCHIDIOECESIS EVEHITUR',
    note:
      'Raises the Diocese of Luxembourg to an archdiocese, still immediately subject to the '
      + 'Holy See and with no suffragans: "...Ecclesiam Cathedralem Luxemburgensem ad gradum et '
      + 'dignitatem archidioecesis promovemus, quae Nobis immediate subiecta manebit, sedium '
      + 'suffraganearum expers.".',
  },
  'john-paul-ii|argentoratensis|1988-06-01': {
    argumentum:
      'ARGENTORATENSIS* DIOECESIS ARGENTORATENSIS AD GRADUM ARCHIDIOECESIS EVEHITUR',
    note:
      'Raises the Diocese of Strasbourg, immediately subject to the Holy See, to an '
      + 'archdiocese with no suffragans, the concordat of 1801 still applying to Alsace and '
      + 'Lorraine: "...Ecclesiam dioecesanam Argentoratensem Nobis diretto subiectam ad gradum '
      + 'archidioecesis legitime evehimus, demptis tamen suffraganeis ullis ei dioecesibus.".',
  },
  'john-paul-ii|antioquiensis|1988-06-18': {
    argumentum:
      'ANTIOQUIENSIS* AD METROPOLITANAE ORDINEM ANTIOQUIENSIS EVEHITUR DIOECESIS, QUAE '
      + 'ECCLESIA SANCTAE FIDEI DE ANTIOQUIA POSTHAC VOCABITUR,NOVAQUE EI COGNOMINA PROVINCIA '
      + 'CONDITUR ECCLESIASTICA',
    note:
      'Withdraws the Diocese of Antioquia (Colombia) from the province of Medellin, raises it '
      + 'to a metropolitan archdiocese under the name Santa Fe de Antioquia and constitutes the '
      + 'new province of that name with Santa Rosa de Osos, Apartado (erected days later) and '
      + 'the Apostolic Vicariates of Quibdo and Istmina as suffragans: "...Ecclesiam '
      + 'Antioquiensem metropolitano subtrahimus iuri Ecclesiae Medellensis attollimusque ad '
      + 'metropolitanae archidioecesis gradum...ipsaque vocabitur Ecclesia Sanctae Fidei de '
      + 'Antioquia...". The elevation is what the argumentum leads with; the heading prints '
      + '"VOCABITUR,NOVAQUE" without a space, as quoted.',
  },
  'john-paul-ii|riviascianensis|1988-06-28': {
    argumentum:
      'RIVIASCIANENSIS* VICARIATUS APOSTOLICUS RIOHACHAËNSIS EVEHITUR AD GRADUM DIOECESIS, '
      + 'QUAE RIVIASCIANENSIS VOCABITUR',
    note:
      'Raises the Apostolic Vicariate of Riohacha (Colombia), entrusted to the Capuchins, to a '
      + 'diocese under the Latin name Riviascianensis, keeping its boundaries and seat, '
      + 'suffragan to Barranquilla: "...Vicariatum Apostolicum Riohachaënsem in dignitate '
      + 'dioecesis constituimus nomine Riviascianensis appellandae, iisdem servatis finibus '
      + 'quibus hucusque Riohachaënsis continebatur Vicariatus Apostolicus...".',
  },
  'john-paul-ii|chulucanensis|1988-12-12': {
    argumentum:
      'CHULUCANENSIS* PRAELATURA CHULUCANENSIS AD DIOECESIS DIGNITATEM ATTOLLITUR',
    note:
      'Raises the Territorial Prelature of Chulucanas (Peru), erected in 1964, to a diocese, '
      + 'keeping its name, boundaries and seat, suffragan to Piura: "...memoratam Praelaturam ad '
      + 'dignitatem dioecesis evehimus, haud mutato nomine seu Chulucanensis appellandae et iis '
      + 'finibus circumscribendae, quibus ad hunc usque diem praelaticia ipsa continebatur '
      + 'Ecclesia...".',
  },
  'john-paul-ii|pietersburgensis|1988-12-15': {
    argumentum:
      'PIETERSBURGENSIS* ABBATIA TERRITORIALIS PIETERSBURGENSIS AD GRADUM DIOECESIS EVEHITUR',
    note:
      'Raises the Territorial Abbey of Pietersburg (South Africa), a mission since 1910, to a '
      + 'diocese, keeping its name and boundaries, suffragan to Pretoria: "...commemoratam '
      + 'Abbatiam territorialem Pietersburgensem ad gradum evehimus iuridicialemque dioecesis '
      + 'statum, iisdem nimirum servatis eius finibus qui adhuc fuerunt eodemque publico '
      + 'nomine.".',
  },
  'john-paul-ii|abuiensis|1989-06-19': {
    argumentum:
      'ABUIENSIS* MISSIO SUI IUSRIS ABUIENSIS AD GRADUM DIOECESIS EVEHITUR',
    note:
      'Raises the Mission sui iuris of Abuja (Nigeria), erected eight years earlier and '
      + 'covering the Federal Capital Territory, to a diocese, suffragan to Kaduna: "...Missio « '
      + 'sui iuris » adhuc Abuiensis in Nigeria, Districtum Foederalem Nigeriae complectens, '
      + 'legitime iureque provehatur ad gradum dioecesis in posterum videlicet nuncupanda '
      + 'Dioecesis Abuiensis...". The heading prints "IUSRIS", as quoted.',
  },
  'john-paul-ii|mituensis|1989-06-19': {
    argumentum:
      'MITUENSIS* PRAEFECTURA APOSTOLICA MITUENSIS, IN COLUMBIE FINIBUS, AD DIGNITATEM '
      + 'EVEHITUR VICARIATUS APOSTOLICI, QUI DEINCEPS MITUENSIS-PORTUS INIRIDENSIS APPELLABITUR',
    note:
      'Raises the Apostolic Prefecture of Mitu (Colombia), entrusted to the Yarumal '
      + 'missionaries, to an apostolic vicariate under the new name Mitu-Puerto Inirida, keeping '
      + 'its boundaries: "...Praefecturam Apostolicam Mituensem, iisdem finibus servatis, ad '
      + 'statum attollimus Vicariatus Apostolici, qui subinde Mituensis-Portus Iniridensis '
      + 'appellabitur...". The heading prints "COLUMBIE", as quoted.',
  },
  'john-paul-ii|ingvavumensis|1989-11-19': {
    argumentum:
      'INGVAVUMENSIS* PRAEFECTURA APOSTOLICA INGVAVUMENSIS ATTOLLITUR AD DIGNITATEM VICARIATUS '
      + 'APOSTOLICI',
    note:
      'Raises the Apostolic Prefecture of Ingwavuma (South Africa), entrusted to the Servites, '
      + 'to an apostolic vicariate, keeping its boundaries, within the province of Durban: '
      + '"...Ingvavumensem quam diximus Praefecturam Apostolicam ad gradum honoremque Vicariatus '
      + 'Apostolici evehimus, iisdem finibus servatis...".',
  },
  'john-paul-ii|balasorensis|1989-12-18': {
    argumentum:
      'BALASORENSIS* PRAEFECTURA APOSTOLICA BALASORENSIS AD GRADUM DIOECESIS EVEHITUR',
    note:
      'Raises the Apostolic Prefecture of Balasore (India) to a diocese, suffragan to '
      + 'Cuttack-Bhubaneswar: "...Praefecturam Apostolicam Balasorensem ad gradum extollimus '
      + 'Dioecesis. Eam autem Metropolitanae Ecclesiae Cuttackensi-Bhubanesvarensi subicimus...".',
  },
  'john-paul-ii|iuigalpensis|1990-04-30': {
    argumentum:
      'IUIGALPENSIS* IUIGALPENSIS PRAELATURA TERRITORIALIS AD STATUM ATTOLLITUR DIOECESIS',
    note:
      'Raises the Territorial Prelature of Juigalpa (Nicaragua) to a diocese, keeping its '
      + 'boundaries, suffragan to Managua: "...Praelaturam territorialem Iuigalpensem ad gradum '
      + 'statumque dioecesis evehimus, quae iisdem scilicet terminatur finibus quibus antea ipsa '
      + 'praelatura.".',
  },
  'john-paul-ii|mekiensis|1991-12-21': {
    argumentum:
      'MEKIENSIS* PRAEFECTURA APOSTOLICA MEKIENSIS AD GRADUM VICARIATUS APOSTOLICI ATTOLLITUR '
      + 'NOMINE NIHIL MUTATO',
    note:
      'Raises the Apostolic Prefecture of Meki (Ethiopia), erected in 1980 and entrusted to '
      + 'the Consolata Missionaries, to an apostolic vicariate, keeping its name and boundaries: '
      + '"...Praefecturam Apostolicam Mekiensem ad ordinem gradumque ipsum Vicariatus Apostolici '
      + 'evehentes attollimus...".',
  },
  'john-paul-ii|kankanensis|1993-11-17': {
    argumentum:
      'KANKANENSIS* IN GUINEA PRAEFECTURA APOSTOLICA KANKANENSIS AD GRADUM ET DIGNITATEM '
      + 'DIOECESIS ATTOLLITUR IMMUTATIS FINIBUS ET NOMINE',
    note:
      'Raises the Apostolic Prefecture of Kankan (Guinea) to a diocese, keeping its name and '
      + 'boundaries, suffragan to Conakry: "...memoratam Praefecturam Apostolicam Kankanensem ad '
      + 'gradum et dignitatem dioecesis attollimus immutatis finibus et nomine.".',
  },
  'john-paul-ii|tarahumarensis|1993-12-20': {
    argumentum:
      'TARAHUMARENSIS* IN MEXICO VICARIATUS APOSTOLICUS TARAHUMARENSIS AD GRADUM ET DIGNITATEM '
      + 'DIOECESIS ATTOLLITUR IMMUTATIS FINIBUS ET NOMINE',
    note:
      'Raises the Apostolic Vicariate of Tarahumara (Mexico), entrusted to the Jesuits, to a '
      + 'diocese, keeping its name and boundaries, seated at Guachochi and suffragan to '
      + 'Chihuahua: "...memoratum Vicariatum Apostolicum Tarahumarensem ad gradum et dignitatem '
      + 'dioecesis attollimus immutatis finibus et nomine.".',
  },
  'john-paul-ii|keetmanshoopensis|1994-03-14': {
    argumentum:
      'KEETMANSHOOPENSIS* VICARIATUS APOSTOLICUS KEETMANSHOOPENSIS AD DIGNITATEM ET '
      + 'CONDICIONEM DIOECESIS ATTOLLITUR',
    note:
      'Raises the Apostolic Vicariate of Keetmanshoop (Namibia), forty-five years old, to a '
      + 'diocese, suffragan to Windhoek, raised to metropolitan rank the same day: '
      + '"...commemoratum Vicariatum Apostolicum Keetmanshoopensem promoveri volumus atque hisce '
      + 'Litteris revera edicimus ad dioecesis condicionem...".',
  },
  'john-paul-ii|escuintlensis-in-guatimala|1994-07-28': {
    argumentum:
      'ESCUINTLENSIS IN GUATIMALA* PRAELATURA TERRITORIALIS ESCUINTLENSIS IN GUATIMALA AD '
      + 'GRADUM AC DIGNITATEM DIOECESIS EVEHITUR SERVATIS IISDEM FINIBUS ET NOMINE',
    note:
      'Raises the Territorial Prelature of Escuintla (Guatemala) to a diocese, keeping its '
      + 'name and boundaries, suffragan to Guatemala: "...praelaturam territorialem '
      + 'Escuintlensem ad gradum et dignitatem dioecesis attollimus, servatis iisdem finibus, '
      + 'quibus nunc ipsa terminatur, et nomine.".',
  },
  'john-paul-ii|chiquitosensis-seu-sancti-ignatii-velascani|1994-11-03': {
    argumentum:
      'CHIQUITOSENSIS SEU SANCTI IGNATII VELASCANI* VICARIATUS APOSTOLICUS CHIQUITOSENSIS AD '
      + 'DIOECESIS DIGNITATEM ELEVATUR',
    note:
      'Raises the Apostolic Vicariate of Chiquitos (Bolivia) to a diocese under the new name '
      + 'San Ignacio de Velasco, keeping its boundaries, suffragan to Santa Cruz de la Sierra: '
      + '"...ut memoratus Vicariatus Apostolicus ad gradum dioecesis evehatur, iisdem servatis '
      + 'finibus quibus antea is terminabatur, cui posthac nomen Curiae erit Sancti Ignatii '
      + 'Velascani.".',
  },
  'john-paul-ii|limonensis|1994-12-13': {
    argumentum:
      'LIMONENSIS* VICARIATUS APOSTOLICUS LIMONENSIS IN COSTARICA AD GRADUM AC DIGNITATEM '
      + 'DIOECESIS EVEHITUR SERVATIS IISDEM FINIBUS ET NOMINIBUS SIVE DE CURIA SIVE IN LINGUA '
      + 'LOCI POPRIA',
    note:
      'Raises the Apostolic Vicariate of Limon (Costa Rica) to a diocese, keeping its name and '
      + 'boundaries, suffragan to San Jose de Costa Rica: "...Vicariatum Apostolicum Limonensem '
      + 'ad gradum et dignitatem dioecesis attollimus, iisdem servatis finibus, quibus nunc ipse '
      + 'terminatur, et nominibus sive de Curia sive in lingua loci propria.". The heading '
      + 'prints "POPRIA", as quoted.',
  },
  'john-paul-ii|cuauhtemocensis-materiensis|1995-11-17': {
    argumentum:
      'CUAUHTEMOCENSIS-MATERIENSIS* PRAELATURA TERRITORIALIS MATERIENSIS IN MEXICO AD GRADUM '
      + 'AC DIGNITATEM DIOECESIS EVEHITUR MUTATIS FINIBUS, SEDE ET NOMINE',
    note:
      'Raises the Territorial Prelature of Madera (Mexico) to a diocese under the name '
      + 'Cuauhtemoc-Madera, adding the municipalities of Cuauhtemoc, Riva Palacio and '
      + 'Cusihuiriachi detached from the Archdiocese of Chihuahua, seated at Cuauhtemoc with a '
      + 'concathedral at Madera, suffragan to Chihuahua: "...praelaturam territorialem '
      + 'Materiensem attollimus ad gradum et dignitatem dioecesis Cuauhtemocensis-Materiensis '
      + 'nomine, quae constabit integro territorio eiusdem hucusque praelaturae necnon '
      + 'territoriis, ab archidioecesi Chihuahuensi seiunctis...".',
  },
  'john-paul-ii|bomadiensis|1995-12-15': {
    argumentum:
      'BOMADIENSIS* MISSIO SUI IURIS BOMADIENSIS AD VICARIATUS APOSTOLICI DIGNITATEM EVEHITUR',
    note:
      'Raises the Mission sui iuris of Bomadi (Nigeria), erected six years earlier and '
      + 'entrusted to the St Patrick\'s Missionary Society, to an apostolic vicariate within the '
      + 'province of Benin City: "...Missionem sui iuris Bomadiensem ad gradum evehimus '
      + 'statumque Vicariatus Apostolici cui posthac erit nomen Bomadiensis, quem simul nimirum '
      + 'provinciae ecclesiasticae Urbis Beninensis adiungimus...".',
  },
  'john-paul-ii|kanensis|1995-12-15': {
    argumentum:
      'KANENSIS* IN NIGERIA MISSIO SUI IURIS KANENSIS AD GRADUM ET DIGNITATEM VICARIATUS '
      + 'APOSTOLICI ATTOLLITUR IMMUTATIS FINIBUS ET NOMINE',
    note:
      'Raises the Mission sui iuris of Kano (Nigeria), entrusted to the Society of African '
      + 'Missions, to an apostolic vicariate, keeping its name and boundaries, within the '
      + 'province of Kaduna: "...Missionem sui iuris Kanensem ad gradum et dignitatem Vicariatus '
      + 'Apostolici attollimus immutatis finibus et nomine; quem quidem Provinciae '
      + 'ecclesiasticae Kadunaënsi aggregatum facimus...".',
  },
  'john-paul-ii|premisliensis-varsaviensis|1996-06-01': {
    argumentum:
      'PREMISLIENSIS-VARSAVIENSIS ritus BYZANTINI UCRAINORUM* IN POLONIA EPARCHIA '
      + 'PREMISLIENSIS RITUS BYZANTINI UCRAINORUM AD GRADUM ET DIGNITATEM ARCHIEPARCHIAE '
      + 'METROPOLITANAE PREMISLIENSIS-VARSAVIENSIS RITUS BYZANTINI UCRAINORUM EVEHITUR ITEMQUE '
      + 'PROVINCIA ECCLESIASTICA CONDITUR EIUSDEM NOMINIS AC RITUS QUIBUS MEMORATA NOVA '
      + 'ARCHIEPARCHIA METROPOLITANA',
    note:
      'Raises the Ukrainian Byzantine Eparchy of Przemysl (Poland) to the metropolitan '
      + 'Archeparchy of Przemysl-Warsaw and constitutes the province of that name with the '
      + 'Eparchy of Wroclaw-Gdansk, erected the same day, as its suffragan: "...Eparchiam '
      + 'Premisliensem ritus Byzantini Ucrainorum ad gradum et dignitatem Archieparchiae '
      + 'Metropolitanae Premisliensis-Varsaviensis ritus Byzantini Ucrainorum evehimus itemque '
      + 'Provinciam ecclesiasticam condimus eiusdem nominis ac ritus...". The elevation is what '
      + 'the argumentum leads with, ITEMQUE introducing the province. The page prints "ritus" in '
      + 'lower case inside the capitalised toponym, so the case-delimited reader stopped there '
      + 'and the curation script abstained; the argumentum is quoted here by hand as the page '
      + 'prints it.',
  },
  'john-paul-ii|coloratensis|1996-08-08': {
    argumentum:
      'COLORATENSIS* IN AEQUATORIANA NATIONE PRAELATURA TERRITORIALIS COLORATENSIS AD GRADUM '
      + 'AC DIGNITATEM EVEHITUR SERVATIS IISDEM FINIBUS ET NOMINE',
    note:
      'Raises the Territorial Prelature of Los Colorados (Ecuador), erected in 1987, to a '
      + 'diocese, keeping its name and boundaries, suffragan to Portoviejo: "...Praelaturam '
      + 'territorialem Coloratensem ad gradum et dignitatem dioecesis attollimus, servatis '
      + 'iisdem finibus, quibus nunc ipsa terminatur, et eodem Curiae nomine Coloratensi.".',
  },
  'john-paul-ii|mandevillensis|1997-11-21': {
    argumentum:
      'MANDEVILLENSIS* VICARIATUS APOSTOLICUS MANDEVILLENSIS AD GRADUM ET DIGNITATEM DIOECESIS '
      + 'EVEHITUR',
    note:
      'Raises the Apostolic Vicariate of Mandeville (Jamaica), erected in 1990, to a diocese '
      + 'of the same name, suffragan to Kingston: "...praelaudatum Vicariatum Apostolicum ad '
      + 'dioecesim eodem nomine Mandevillensem appellandam evehimus, quam pariter Metropolitanae '
      + 'Ecclesiae Regiopolitanae in Iamaica suffraganeam facimus...".',
  },
  'john-paul-ii|mercedensis-luianensis|1997-11-21': {
    argumentum:
      'MERCEDENSIS - LUIANENSIS* DIOECESIS MERCEDENSIS-LUIANENSIS AD GRADUM ARCHIDIOECESIS '
      + 'EVEHITUR',
    note:
      'Raises the Diocese of Mercedes-Lujan (Argentina), home of the national shrine of Lujan, '
      + 'to an archdiocese without suffragans, immediately subject to the Holy See: '
      + '"...memoratam dioecesim Mercedensem-Luianensem ad gradum et dignitatem archidioecesis '
      + 'evehimus, quin suffraganeis polleat dioecesibus, statuentes ut ea dehinc huic Sedi '
      + 'Apostolicae immediate substet...".',
  },
  'john-paul-ii|neograndicasensis|2000-06-02': {
    argumentum:
      'NEOGRANDICASENSIS* IN MEXICO PRAELATURA TERRITORIALIS NEOGRANDICASENSIS AD GRADUM AC '
      + 'DIGNITATEM DIOECESIS EVEHITUR IISDEM SERVATIS FINIBUS ET NOMINIBUS SIVE DE CURIA SIVE '
      + 'IN LINGUA LOCI PROPRIA',
    note:
      'Raises the Territorial Prelature of Nuevo Casas Grandes (Mexico) to a diocese, keeping '
      + 'its name and boundaries, suffragan to Chihuahua: "...praelaturam territorialem '
      + 'Neograndicasensem ad gradum et dignitatem dioecesis attollimus, iisdem servatis '
      + 'finibus, quibus nunc ipsa terminatur, et nominibus sive de Curia sive in lingua loci '
      + 'propria.".',
  },
  'john-paul-ii|guapiensis|2001-01-23': {
    argumentum:
      'GUAPIENSIS* PRAEFECTURA APOSTOLICA GUAPIENSIS IN COLUMBIA AD GRADUM VICARIATUS '
      + 'APOSTOLICI ATTOLLITUR IMMUTATIS FINIBUS ET NOMINE',
    note:
      'Raises the Apostolic Prefecture of Guapi (Colombia), entrusted to the Franciscans, to '
      + 'an apostolic vicariate, keeping its name and boundaries: "...Praefecturam Apostolicam '
      + 'Guapiensem ad gradum Vicariatus Apostolici attollimus, immutatis finibus et nomine, '
      + 'atque Ordinis Fratrum Minorum assiduis curis committimus.".',
  },
  'john-paul-ii|chisinauensis|2001-10-27': {
    argumentum:
      'CHISINAUENSIS* ADMINISTRATIO APOSTOLICA MOLDOVENSIS AD GRADUM ATQUE DIGNITATEM '
      + 'DIOECESIS EVEHITUR NOMINE CHISINAUENSIS NONCUPATAE ET APOSTOLICAE SEDI IMMEDIATE '
      + 'SUBIECTAE',
    note:
      'Raises the Apostolic Administration of Moldova to a diocese named Chisinau, immediately '
      + 'subject to the Holy See: "...Territorium Administrationis Apostolicae Moldovensis '
      + 'evehimus ad gradum et dignitatem dioecesis nomine Chisinauensis, quam huic Apostolicae '
      + 'Sedi immediate subiectam facimus.". The heading prints "NONCUPATAE", as quoted.',
  },
  'john-paul-ii|villaricensis|2002-01-05': {
    argumentum:
      'VILLARICENSIS* VICARIATUS APOSTOLICUS ARAUCANIENSIS AD GRADUM DIGNITATEMQUE DIOECESIS '
      + 'EVEHITUR QUAE VILLARICENSIS APPELLABITUR',
    note:
      'Raises the Apostolic Vicariate of Araucania (Chile), less Easter Island which passes to '
      + 'Valparaiso, to a diocese named Villarrica, suffragan to Concepcion: "...Prae laudatum '
      + 'Vicariatum Apostolicum, praeter Insulam Paschalem dioecesi Vallis Paradisi adnexam, '
      + 'Apostolica Nostra potestate ad gradum dignitatemque dioecesis evehimus appellandae '
      + 'Villaricensis...".',
  },
  'john-paul-ii|coxinensis|2002-11-13': {
    argumentum:
      'COXINENSIS* IN BRASILIENSI NATIONE PRAELATURA TERRITORIALIS COXINENSIS AD GRADUM AC '
      + 'DIGNITATEM DIOECESIS EVEHITUR SERVATIS IISDEM FINIBUS ET NOMINIBUS SIVE DE CURIA SIVE '
      + 'LINGUAE LOCI PROPRIIS',
    note:
      'Raises the Territorial Prelature of Coxim (Brazil) to a diocese, keeping its name and '
      + 'boundaries: "...praelaturam territorialem Coxinensem attollimus ad gradum et dignitatem '
      + 'dioecesis, servatis iisdem finibus, quibus nunc ipsa terminatur, atque iisdem nominibus '
      + 'de Curia et linguae loci propriis...".',
  },
  'john-paul-ii|tiranensis-dyrracena|2005-01-25': {
    argumentum:
      'TIRANENSIS-DYRRACENA* IN ALBANIA SEDES CATHEDRALIS TIRANENSIS-DYRRACENA AD '
      + 'METROPOLITANAE GRADUM EVEHITUR NOVAQUE PROVINCIA ECCLESIASTICA CONSTITUITUR',
    note:
      'Renames the Archdiocese of Durres-Tirana as Tirana-Durres, raises it to a metropolitan '
      + 'see and constitutes the new province with the Diocese of Rreshen and the Apostolic '
      + 'Administration of Southern Albania as suffragans: "...eandem item ad gradum '
      + 'dignitatemque metropolitanae Ecclesiae attollimus, omnia iura ac privilegia tribuentes '
      + 'quae huiusmodi Ecclesiis iure communi debentur.". The elevation is what the argumentum '
      + 'leads with; NOVAQUE introduces the province.',
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
  // The fifth curation instalment (Task 6), John Paul II: the five of the 390 candidates that
  // unite existing sees (1983-09-13 through 1991-12-24). Three join sees aeque principaliter
  // under one bishop ('Interamnensis-Narniensis et Amerina', 'Pampilonensis-Tudelensis',
  // 'Terulensis-Albarraciensis'); 'Viterbiensis' merges four dioceses and an abbey into
  // Viterbo by extinctive union, stated as IN UNAM DIOECESIM REDIGUNTUR, which no union idiom
  // lists and is left for the controller's ruling; 'Telsensis' merges the Prelature of
  // Klaipeda into Telsiai by extinctive union.
  'john-paul-ii|interamnensis-narniensis-et-amerina|1983-09-13': {
    argumentum:
      'INTERAMNENSIS - NARNIENSIS ET AMERINA* DIOECESES INTERAMNENSIS NARNIENSIS ET AMERINA '
      + 'AEQUE PRINCIPALITER CONIUNGUNTUR',
    note:
      'Unites the Dioceses of Terni, Narni and Amelia (Umbria) aeque principaliter under one '
      + 'bishop, Terni and Narni having already been so joined and Amelia administered by their '
      + 'bishop: "...sic inter se cathedrales ecclesias Interamnensem, Narniensem et Amerinam '
      + 'aeque principaliter devincimus ut unus idemque sacrorum Antistes cuique communitati '
      + 'praesit...".',
  },
  'john-paul-ii|pampilonensis-tudelensis|1984-08-11': {
    argumentum:
      'PAMPILONENSIS - TUDELENSIS* DIOECESIS TUDELENSIS AEQUE PRINCIPALITER CUM ECCLESIA '
      + 'PAMPILONENSI CONIUNGITUR',
    note:
      'Unites the Diocese of Tudela aeque principaliter with the Archdiocese of Pamplona '
      + '(Spain), one prelate being Archbishop of Pamplona and Bishop of Tudela: "...Dioecesim '
      + 'Tudelensem cum archidioecesi Pampilonensi aeque principaliter coniungimus legeque '
      + 'sancimus ut unus dehinc Archiepiscopus Metropolita sit Pampilonensis idemque Episcopus '
      + 'Tudelensis...".',
  },
  'john-paul-ii|terulensis-albarraciensis|1984-08-11': {
    argumentum:
      'TERULENSIS - ALBARRACIENSIS* ECCLESIA ALBARRACIENSIS AEQUE PRINCIPALITER CUM ECCLESIA '
      + 'TERULENSI CONIUNGITUR',
    note:
      'Unites the Diocese of Albarracin aeque principaliter with the Diocese of Teruel '
      + '(Spain), one bishop for both: "...Ecclesiam Albarraciensem cum Ecclesia Terulensi aeque '
      + 'principaliter coniungimus legeque sancimus ut unus dehinc idemque sit Episcopus '
      + 'Terulensis et Albarraciensis...".',
  },
  'john-paul-ii|viterbiensis|1986-03-27': {
    argumentum:
      'VITERBIENSIS* DIOECESES VITERBIENSIS, AQUIPENDIENSIS, BALNEOREGIENSIS,FALISCODUNENSIS, '
      + 'TUSCANENSIS, ET ABBATIA S. MARTINI AD MONTEM CIMINUM, IN UNAM DUMTAXAT DIOECESIM '
      + 'REDIGUNTUR, «VITERBIENSIS» COGNOMINANDAM',
    note:
      'Unites the Dioceses of Acquapendente, Bagnoregio, Montefiascone and Tuscania and the '
      + 'Abbey of San Martino al Monte Cimino to the Diocese of Viterbo by extinctive union, the '
      + 'enlarged see keeping the name Viterbo and the suppressed cathedrals becoming '
      + 'concathedrals: "...dioecesi Viterbiensi perpetuo unimus, unione, ut dicunt, exstinctiva '
      + '; quae proinde adquiret atque comprehendet in suo territorio uniuscuiusque harum '
      + 'Ecclesiarum territorium. Sic ampliata dioecesis Viterbiensis vocabitur.". A union of '
      + 'existing sees; the curation script abstained because IN UNAM DUMTAXAT DIOECESIM '
      + 'REDIGUNTUR matches no idiom, and the heading prints "BALNEOREGIENSIS,FALISCODUNENSIS" '
      + 'without a space, as quoted.',
  },
  'john-paul-ii|telsensis|1991-12-24': {
    argumentum:
      'TELSENSIS * PRAELATURA KLAIPEDENSIS UNIONE EXSTINCTIVA DIOECESI TELSENSI CONIUNGITUR',
    note:
      'Unites the Territorial Prelature of Klaipeda to the Diocese of Telsiai (Lithuania) by '
      + 'extinctive union, the enlarged see keeping the name Telsiai: "...ut Praelatura '
      + 'territorialis Klaipedensis coniungatur dioecesi Telsensi unione quam appellant '
      + 'exstinctivam, quae idcirco accipiet in se comprehendetque fines ac loca prioris '
      + 'Praelaturae Klaipedensis.".',
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
  // The fifth curation instalment (Task 6), John Paul II: the nine of the 390 candidates that
  // are neither an erection, an elevation nor a union (1980-07-07 through 1991-12-24). Three
  // are not circumscription acts at all: a cathedral chapter restored at Ostia, and a
  // collegiate chapter dissolved for a cathedral chapter at Jerez and a concathedral chapter
  // at Rovigo. Six are circumscription acts this registry mints no term for: the Eparchy of
  // Hajdudorog's jurisdiction extended over all Byzantine-rite faithful in Hungary, the
  // province of Bari recognised and Trani's suppressed, the title of Fatima added to Leiria,
  // Pinsk's boundaries redrawn and its metropolitan changed, and the Dioceses of Kaisiadorys
  // and Panevezys moved from the province of Kaunas to Vilnius, decreed twice on one day.
  'john-paul-ii|haidudoroghensis|1980-07-07': {
    act: 'the jurisdiction of an eparchy extended to every Byzantine-rite faithful in Hungary',
    argumentum:
      'HAIDUDOROGHENSIS* IN IURISDICTIONEM EPARCHIAE HAIDUDOROGHENSIS OMNES PERPETUO ATQUE '
      + 'STABILITER REDIGUNTUR CHRISTIFIDELIBUS RITUS BYZANTINI IN UNIVERSA HUNGARIA COMMORANTES',
    note:
      'A change of jurisdiction, for which this registry mints no term: places all faithful of '
      + 'the Byzantine rite living anywhere in Hungary permanently under the Eparchy of '
      + 'Hajdudorog (until now only ad tempus, since 1968), the rights of the Apostolic '
      + 'Exarchate of Miskolc untouched: "...Christifideles ipsius Byzantini ritus in universa '
      + 'Hungaria degentes in ius et iurisdictionem Eparchiae Haidudoroghensis perpetuo atque '
      + 'stabiliter omnes redigimus, firmis tamen iuribus Exarchatus Apostolici Miskolcensis '
      + 'propriis.". No see is erected, raised or united; the curation script abstained because '
      + 'REDIGUNTUR matches no idiom.',
  },
  'john-paul-ii|barensis|1980-10-20': {
    act: 'an ecclesiastical province reorganised and another suppressed',
    argumentum:
      'BARENSIS* NOVA PROVINCIAE ECCLESIASTICAE BARENSIS RECOGNITIO',
    note:
      'A reorganisation of provinces, for which this registry mints no term: aggregates to the '
      + 'province of Bari every circumscription within the civil province of Bari until now '
      + 'immediately subject to the Holy See, and suppresses the province of Trani, so that Bari '
      + 'has as suffragans Conversano, Ruvo and Bitonto, Trani and Barletta (keeping their '
      + 'archiepiscopal dignity), Bisceglie, Andria, Gravina, Molfetta, Giovinazzo, Terlizzi, '
      + 'Monopoli and the Prelatures of Altamura and Acquaviva: "...Provinciae ecclesiasticae '
      + 'Barensi aggregamus, cuius archiepiscopo Metropolitae ad iuris normam subicientur; '
      + 'Provinciam vero Tranensem exstinguimus.". No see is erected or raised; the curation '
      + 'script abstained because RECOGNITIO matches no idiom.',
  },
  'john-paul-ii|ostiensis|1984-02-20': {
    act: 'a cathedral chapter of canons restored',
    argumentum:
      'OSTIENSIS* IN OSTIENSI DIOECESI CATHEDRALE COLLEGIUM RESTITUITUR',
    note:
      'Not a circumscription act. Restores the cathedral chapter of Ostia, which had lapsed, '
      + 'with an archpriest, eleven canons and six mansionaries, on the petition of Cardinal '
      + 'Poletti as apostolic administrator after the restoration of the church of Sant\'Aurea: '
      + '"...Cathedrale collegium Canonicorum Ostiense qui vario casu perierat, in pristinum '
      + 'restituimus ; quod Archipresbytero constabit atque undecim Canonicis.". The diocese '
      + 'named in the heading keeps its rank and boundaries; the curation script abstained '
      + 'because RESTITUITUR matches no idiom.',
  },
  'john-paul-ii|leiriensis-fatimensis|1984-05-13': {
    act: 'a second title added to a diocese',
    argumentum:
      'LEIRIENSIS - FATIMENSIS* PRIMAEVO TITULO DIOECESIS LEIRIENSIS ADDITUR TITULUS FATIMENSIS',
    note:
      'A change of title, for which this registry mints no term: adds the title of Fatima in '
      + 'perpetuity to the Diocese of Leiria (Portugal), henceforth Leiria-Fatima, at the '
      + 'bishop\'s petition on account of the Marian shrine: "...placet veteri titulo Leiriensis '
      + 'dioecesis etiam « Fatimensem » apponi, sane in perpetuum, ut posthac ea Sedes '
      + 'Leiriensis-Fatimensis cognominetur.". The see keeps its rank and boundaries; the '
      + 'curation script abstained because ADDITUR matches no idiom.',
  },
  'john-paul-ii|assidonensis-jerezensis|1984-05-26': {
    act: 'a collegiate chapter dissolved and a cathedral chapter erected',
    argumentum:
      'ASSIDONENSIS - JEREZENSIS* IN CATHEDRALI DIOECESIS ASSIDONENSIS-JEREZENSIS TEMPLO, QUOD '
      + 'HONORI SANCTISSIMI SALVATORIS DICATUM IN URBE «JEREZ DE LA FRONTERA» EXSTAT, COLLEGIALE '
      + 'DISSOLVITUR ET CATHEDRALE INSTITUITUR CAPITULUM',
    note:
      'Not a circumscription act. Dissolves the collegiate chapter of the church of the Holy '
      + 'Saviour in Jerez de la Frontera, cathedral of the Diocese of Asidonia-Jerez erected in '
      + '1980, and erects in its place a cathedral chapter of twelve canons: "...Capitulum '
      + 'Collegiale memorati templi dissolvimus simul atque Capitulum Cathedrale ibidem condimus '
      + 'duodecim ex Canonicis constans.". The diocese named in the heading keeps its rank and '
      + 'boundaries; the curation script abstained because DISSOLVITUR and INSTITUITUR match no '
      + 'idiom.',
  },
  'john-paul-ii|adriensis-rhodigiensis|1987-05-20': {
    act: 'a collegiate chapter dissolved and a concathedral chapter erected',
    argumentum:
      'ADRIENSIS-RHODIGIENSIS* RHODIGII, IN BASILICA SANCTI STEPHANI, CAPITULUM CONCATHEDRALE '
      + 'DIOECESIS ADRIENSIS-RHODIGIENSIS APOSTOLICA AUCTORITATE CONDITUR',
    note:
      'Not a circumscription act. Dissolves the collegiate chapter of the basilica of Santo '
      + 'Stefano in Rovigo, lately raised to concathedral of the Diocese of Adria-Rovigo, and '
      + 'erects in its place a concathedral chapter under canon 504: "...Capitulum collegiale '
      + 'commemoratae Basilicae Sancti Stephani in urbe Rhodigio dissolvimus iure atque ad '
      + 'normam canonis quingentesimi quarti Codicis Iuris Canonici inibi legitime condimus '
      + 'Capitulum concathedrale dioecesis Adriensis-Rhodigiensis.". The CONDITUR of the '
      + 'argumentum erects a chapter, not a circumscription, which is why the curation script '
      + 'proposed an erection.',
  },
  'john-paul-ii|pinskensis|1990-04-13': {
    act:
      'the boundaries of a diocese redefined and the see made suffragan of a new metropolitan',
    argumentum:
      'PINSKENSIS* TERRITORIUM APTIUS DEFINITUR SIMULQUE DIOECESIS PINSKENSIS SUFFRAGANEA '
      + 'ARCHIDIOECESIS MINSCENSIS-MOHILOVIENSIS DECLARATUR',
    note:
      'A boundary revision and a change of metropolitan, for which this registry mints no '
      + 'term: redraws the Latin Diocese of Pinsk (Byelorussia), whose territory the post-war '
      + 'frontier had cut, to coincide with the oblasts of Brest and Gomel, the seat staying at '
      + 'Pinsk, and makes it suffragan to the newly erected Minsk-Mohilev: "...fines dioecesis '
      + 'Pinskensis Latinorum ita immutamus, ut iidem cum limitibus civilium regionum seu « '
      + 'Oblasti » Brest et Gomel conveniant, sede tamen manente in urbe vulgo Pinsk.". No see '
      + 'is erected, raised or united; the curation script abstained because DEFINITUR and '
      + 'DECLARATUR match no idiom.',
  },
  'john-paul-ii|kaunensis-et-aliarum|1991-12-24': {
    act: 'two suffragan dioceses transferred from one ecclesiastical province to another',
    argumentum:
      'KAUNENSIS ET ALIARUM* DIOECESES KAIŠIADORENSIS AC PANEVEŽENSIS AB ECCLESIASTICA '
      + 'PROVINCIA KAUNENSI SEIUNGUNTUR ET AD VILNENSEM AGGREGANTUR',
    note:
      'A reassignment of suffragans, for which this registry mints no term: withdraws the '
      + 'Dioceses of Kaisiadorys and Panevezys from the province of Kaunas and attaches them to '
      + 'the province of Vilnius, leaving Kaunas with Telsiai and Vilkaviskis: "...Ecclesias '
      + 'Kaišiadorensem et Panevėžensem a Kaunensi Provincia ecclesiastica distrahimus '
      + 'Provinciaeque Vilnensi adiungimus, ita ut Provincia Kaunensis ex cognomini '
      + 'archidioecesi Ecclesiisque Telsensi et Vilkaviskensi iam constet.". No see is erected, '
      + 'raised or united; the curation script abstained because SEIUNGUNTUR and AGGREGANTUR '
      + 'match no idiom. The same transfer is decreed from the Vilnius side by \'Vilnensis\' of '
      + 'the same day.',
  },
  'john-paul-ii|vilnensis-et-aliarum|1991-12-24': {
    act: 'an ecclesiastical province enlarged by two dioceses transferred from another',
    argumentum:
      'VILNENSIS* ECCLESIASTICA PROVINCIA VILNENSIS COMPARATUR ET AMPLIFICATUR',
    note:
      'A reassignment of suffragans, for which this registry mints no term: attaches the '
      + 'Dioceses of Kaisiadorys and Panevezys, withdrawn from the province of Kaunas, to the '
      + 'province of Vilnius, which henceforth consists of the archdiocese and these two: '
      + '"...Sedes Kaišiadorensis aeque ac Panevėžensis coniungantur posthac ad provinciam '
      + 'ecclesiasticam Vilnensem.". The companion of \'Kaunensis et aliarum\' of the same day; '
      + 'no see is erected, raised or united, and the curation script abstained because '
      + 'COMPARATUR and AMPLIFICATUR match no idiom.',
  },
};
