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
  // deliberately left unconfirmed here, not overlooked: nine are elevations of an
  // existing circumscription's rank ('...ad gradum et dignitatem dioecesis evehimus...',
  // 'Bathurstensis in Gambia', 'Bikoroënsis', 'Musomensis', 'Spinensis', 'Copiapoënsis',
  // 'Esmeraldensis', 'Urawaënsis', 'Tangaënsis', 'Thakhekensis') and one ('Leonensis') is
  // not a circumscription document at all -- it raises a parish church to collegiate-church
  // status. A bare Latin toponym cannot be told apart from either of these on the index
  // page, which is exactly why each was read individually rather than confirmed by pattern.
  // Task 3 will file the nine elevations and the one non-circumscription act in the
  // elevations and adjudications tables below.
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
 */
export const ERECTION_IDIOMS =
  /CONDITUR|CONDUNTUR|ERIGITUR|ERIGUNTUR|CONSTITUITUR|CONSTITUUNTUR|EXCITATUR|EFFICITUR|CREATUR|NOVA FIT|FORMAM REDIG|FORMATUR|FORMANTUR/;
export const ELEVATION_IDIOMS =
  /EVEHITUR|EVEHUNTUR|ELEVATUR|PERDUCITUR|ATTOLLITUR|ATTOLITUR|EXTOLLITUR|AD (?:GRADUM|DIGNITATEM|EPARCHIAE|APOSTOLICI)/;
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
export const CIRCUMSCRIPTION_ELEVATIONS: Record<string, CircumscriptionRow> = {};

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
};
