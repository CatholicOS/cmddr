import { slugify } from '../slug.js';
import type { DocumentRecord, HarvestItem } from '../types.js';

/**
 * Circumscription erections whose heading does not say so, confirmed by hand (spec §4.5).
 *
 * Paul VI, John Paul II, Benedict XVI -- and Pius XII -- file these under a bare Latin
 * toponym -- 'Avkaënsis', 'Usbekistaniae', 'Gambomensis' -- with no textual marker at all,
 * and the documents one would most want separated out ('Vacantis Apostolicae Sedis',
 * 'Provida Mater Ecclesia', 'Sacramentum Ordinis', 'Episcopali Consecrationis') sit
 * unmarked on the same shelf. There is therefore no rule that can decide this from the
 * index page: `isErectionCandidate` below only *flags* them for a human to confirm into
 * this table with its evidence -- it never writes a keyword itself.
 *
 * Starts empty. Populated by hand in a later curation task, one entry per confirmed
 * erection, each carrying the evidence (the vatican.va document text, or a secondary
 * source) that justifies the tag -- never merely because the title has toponym shape.
 *
 * Key: `${pageSlug}|${slugify(incipit ?? title)}|${isoDate}`.
 */
export const CIRCUMSCRIPTION_ERECTIONS: Record<string, { note: string }> = {
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
  'pius-xii|santaremensis-obidensis|1957-04-10': {
    note:
      'Detaches territory from the Prelature Nullius of Santarém and erects the new '
      + 'Prelature Nullius of Óbidos: "...ex eoque novam praelaturam «nullius» condimus, '
      + 'Obidensem appellandam...". The heading prints only the twin toponym.',
  },
  'pius-xii|corumbensis-registrensis-campi-grandis-auratopolitanae|1957-06-15': {
    note:
      'Detaches territory from the Diocese of Corumbá and the Prelature Nullius of Registro '
      + 'and erects two new dioceses: "...ex iisque omnibus territoriis dioecesim '
      + 'constituimus, Campi Grandis nuncupandam..." and "...ex eorumque territorio alteram '
      + 'condimus dioecesim, Auratopolitanam appellandam...".',
  },
  'pius-xii|chiapasensis-tapacolensis|1957-06-19': {
    note:
      'Detaches territory from the Diocese of Chiapas and erects the new Diocese of '
      + 'Tapachula: "...Quam regionem in novae formam redigimus dioecesis, Tapacolensis '
      + 'appellandae...".',
  },
  'pius-xii|saltillensis-torreonensis|1957-06-19': {
    note:
      'Detaches territory from the Diocese of Saltillo and erects the new Diocese of '
      + 'Torreón: "...quae omnia in novae dioecesis formam redigimus, Torreonensis '
      + 'appellandae...".',
  },
  'pius-xii|aleppensis-chaldaeorum|1957-07-03': {
    note:
      'Suppresses the Apostolic Administration of Upper Gazira of the Chaldeans and, for its '
      + 'Syrian portion, erects the new Diocese of Aleppo of the Chaldeans: "...Apostolicam '
      + 'administrationem de Gazira superiore Chaldaeorum omnino exstinguimus...in novae '
      + 'formam redigimus dioecesis, Aleppensis Chaldaeorum nuncupandae...".',
  },
  'pius-xii|berytensis-chaldaeorum|1957-07-03': {
    note:
      'The companion constitution to Aleppensis Chaldaeorum, issued the same day: for the '
      + 'Lebanese portion of the same suppressed administration, erects the new Diocese of '
      + 'Beirut of the Chaldeans: "...Libani territorium...in novae dioecesis formam '
      + 'redigimus, Berytensis Chaldaeorum appellandam...".',
  },
  'pius-xii|kikuitensis-kisantuensis-kengen|1957-07-05': {
    note:
      'Detaches territory from the Apostolic Vicariates of Kikwit and Kisantu and erects the '
      + 'new Apostolic Prefecture of Kenge: "...ex iisque novam condi praefecturam '
      + 'apostolicam...eaque in novae formam redigimus apostolicae praefecturae, Kengensis '
      + 'appellandae...".',
  },
  'pius-xii|quinhonensis-saigonensis-nhatrangensis|1957-07-05': {
    note:
      'Detaches territory from the Apostolic Vicariates of Qui Nhon and Saigon and erects '
      + 'the new Apostolic Vicariate of Nha Trang: "...Ex quibus terris novum vicariatum '
      + 'condimus, qui ab urbe Nhatrang...Nhatrangensis appellabitur...".',
  },
  'pius-xii|rabaulensis-kaviengensis|1957-07-05': {
    note:
      'Detaches territory from the Apostolic Vicariate of Rabaul and erects the new '
      + 'Apostolic Vicariate of Kavieng: "...ex eaque novum vicariatum condimus, cui nomen '
      + 'erit ab urbe principe Kaviengensis...".',
  },
  'pius-xii|amargosensis-victoriensis-de-conquista|1957-07-27': {
    note:
      'Detaches territory from the Diocese of Amargosa and erects the new Diocese of '
      + 'Vitória da Conquista: "...quibus ex municipiis...novam constituimus dioecesim '
      + 'Victoriensem de Conquista appellandam.".',
  },
  'pius-xii|puniensis-iuliensis|1957-08-03': {
    note:
      'Detaches territory from the Diocese of Puno and erects the new Prelature Nullius of '
      + 'Juli: "...quibus terris novam praelaturam «nullius» efficimus, Iuliensem '
      + 'appellandam...".',
  },
  'pius-xii|arequipensis-ayacuquensis-caraveliens|1957-11-21': {
    note:
      'Detaches territory from the Archdiocese of Arequipa and the Diocese of Ayacucho and '
      + 'erects the new Prelature Nullius of Caravelí: "...ex quibus ita disiunctis terris '
      + 'novam condimus Praelaturam «nullius», Garaveliensem [Caraveliensem] '
      + 'nuncupandam...". The heading omits the trailing period the harvested candidate '
      + 'list carries after "Caraveliens".',
  },
  'pius-xii|luandensis-silvae-portuensis-malaniensis|1957-11-25': {
    note:
      'Detaches territory from the Archdiocese of Luanda and the Diocese of Silva Porto '
      + '(Angola) and erects the new Diocese of Malanje: "...quibus terris novam dioecesim '
      + 'condimus Malaniensem appellandam.".',
  },
  'pius-xii|rivibambensis-guarandensis|1957-12-29': {
    note:
      'Detaches the province of Bolívar from the Diocese of Riobamba and erects the new '
      + 'Diocese of Guaranda: "...idque in novae dioecesis formam redigimus, Guarandensis '
      + 'appellandae...".',
  },
  'pius-xii|palmensis-lagensis-palmensis-et-xapecoensis|1958-01-14': {
    note:
      'Suppresses the Prelature Nullius of Palmas and, from its territory plus territory '
      + 'detached from the Diocese of Lages, erects two new dioceses: "...ex quibus novam '
      + 'dioecesim condimus Palmensem nominandam..." and "...novam dioecesim condimus '
      + 'Xapecoënsem appellandam...".',
  },
  'pius-xii|niangaraensis-dorumaensis|1958-02-24': {
    note:
      'Detaches territory from the Apostolic Vicariate of Niangara and erects the new '
      + 'Apostolic Prefecture of Doruma: "...Quo territorio novam praefecturam apostolicam '
      + 'condimus, Dorumaënsem appellandam...".',
  },
  'pius-xii|chilapensis-acapulcanae|1958-03-18': {
    note:
      'Detaches territory from the Diocese of Chilapa and erects the new Diocese of '
      + 'Acapulco: "...ex quo distracto territorio novam efficimus dioecesim, Acapulcanam '
      + 'nuncupandam.".',
  },
  'pius-xii|huanucensis-huancayensis-tarmensis|1958-05-15': {
    note:
      'Detaches territory from the Dioceses of Huánuco and Huancayo and erects the new '
      + 'Prelature Nullius of Tarma: "...Quibus terris novam praelaturam «nullius» '
      + 'constituimus Tarmensem appellandam.".',
  },
  'pius-xii|huanucensis-huarazensis-huariensis|1958-05-15': {
    note:
      'The companion constitution to Huanucensis-Huancayensis, issued the same day: '
      + 'detaches further territory from the Diocese of Huánuco and from the Diocese of '
      + 'Huaraz and erects the new Prelature Nullius of Huari: "...quibus ex terris novam '
      + 'praelaturam «nullius» efficimus Huariensem appellandam...".',
  },
};

/**
 * The circumscription nouns that guard a bare verb ('erige', 'eleva') against firing on an
 * unrelated document that merely happens to use the same verb -- e.g. a church or cathedral
 * raised 'al rango di Basilica Minore' is an elevation of a building, not a circumscription.
 * Covers the ranks actually seen in the corpus: diocese/archdiocese, eparchy/archeparchy
 * (the Eastern-rite equivalents), exarchate, prefecture and vicariate (the two ranks a
 * mission territory passes through before becoming a diocese or eparchy).
 */
const CIRCUMSCRIPTION_NOUN = '(diocesi|arcidiocesi|eparchia|arcieparchia|esarcato|prefettura|vicariato)';

/**
 * Headings that state the act. Francis and Leo XIV print it in full -- 'Il Santo Padre ha
 * eretto la nuova Diocesi di Caazapá (Paraguay)' -- so the keyword is read from the text
 * rather than guessed. Matched case-insensitively against the whole title.
 *
 * 'erige' alone is guarded by a nearby circumscription noun, the same way 'ha elevato' below
 * is: unguarded, it also fires on non-circumscription acts (Pius XII's chirografo erecting
 * the Istituto per le Opere di Religione; John XXIII's motu proprio erecting the Pontificia
 * Commissione per la Cinematografia).
 */
const ERECTION_PHRASES: readonly RegExp[] = [
  /\bha eretto\b/i,
  /\bha istituito\b/i,
  new RegExp(`\\berige\\b.{0,40}\\b${CIRCUMSCRIPTION_NOUN}\\b`, 'i'),
];

/**
 * Headings that state a rise in rank rather than a new erection -- 'ha elevato l'Eparchia di
 * … ad Arcieparchia Metropolitana', 'che eleva la prefettura apostolica di … al grado di
 * diocesi'. Guarded the same way 'erige' is above: unguarded, both verbs fire just as often
 * on a church or cathedral raised 'al rango di Basilica Minore', which is not a
 * circumscription at all. The guard's 40-character window is deliberately tight -- it passes
 * John XXIII's 'Nzerekoreensis' and 'Nagasakiensis (Qui cotidie)', where the circumscription
 * noun sits right beside the verb, but excludes 'Caeruleum mare' ('che eleva la Cattedrale di
 * San Carlo Borromeo nella diocesi di Monterey in California, al rango di Basilica Minore'),
 * where 'diocesi' names the cathedral's location, forty-plus characters from the verb, not
 * what is being elevated.
 */
const ELEVATION_PHRASES: readonly RegExp[] = [
  new RegExp(`\\bha elevato\\b.{0,40}\\b${CIRCUMSCRIPTION_NOUN}\\b`, 'i'),
  new RegExp(`\\beleva\\b.{0,40}\\b${CIRCUMSCRIPTION_NOUN}\\b`, 'i'),
];

/**
 * Latin toponymic morphology, used to *flag candidates only* (never to tag). Tests only
 * the heading's first word, not the whole string: a genuine erection heading on
 * vatican.va is rarely printed as a single bare word once you look past John Paul II's
 * simplest cases -- Pius XII's 1957-58 batch prints a hyphenated twin see
 * ('Huanucensis-Huarazensis'), a parenthetical alternate or former name
 * ('Niangaraënsis (Dorumaënsis)'), a trailing qualifier ('Aleppensis Chaldaeorum',
 * 'Bathurstensis in Gambia'), or several of these together
 * ('Palmensis - Lagensis (Palmensis et Xapecoënsis)'). An earlier version of this regex
 * anchored both ends and so missed all of these -- only the word-alone cases matched. The
 * first word is still the entire signal that matters: 'Sedes Sapientiae', 'Sacramentum
 * Ordinis' and the other named constitutions on the same shelf do not open with a
 * toponym-shaped word, however their later words scan, so anchoring the far end buys
 * nothing but false negatives on real erections.
 *
 * Tested against the diacritic-folded title, because 'Avkaënsis' ends in 'ënsis' and would
 * otherwise miss. Deliberately anchored to the first word only, which means a multi-word
 * see name introduced by a non-toponym word (e.g. 'Sancti Vladimiri Magni in urbe
 * Parisiensi pro Ucrainis ritus Byzantini') is not flagged: an accepted false negative in a
 * search aid, not in the data.
 */
const TOPONYM = /^\p{Lu}\p{L}*(?:ensis|iensis|aniae|ensia)/u;

const fold = (s: string): string => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Popes whose headings state the act, so morphological flagging would double-count. */
const TEXTUALLY_TAGGED = new Set(['francesco', 'leo-xiv']);

/** The shelves apostolic constitutions are filed under (Benedict XV hyphenates his). */
const APOST_CONSTITUTIONS_SHELVES = new Set(['apost_constitutions', 'apost-constitutions']);

/** The descriptive keywords this item earns from evidence. Never inferred from shape. */
export function keywordsFor(item: HarvestItem): string[] {
  const out: string[] = [];
  const curatedKey = `${item.pageSlug}|${slugify(item.incipit ?? item.title)}|${item.date}`;
  if (ERECTION_PHRASES.some((re) => re.test(item.title))
      || CIRCUMSCRIPTION_ERECTIONS[curatedKey]) {
    out.push('circumscription-erection');
  }
  if (ELEVATION_PHRASES.some((re) => re.test(item.title))) {
    out.push('circumscription-elevation');
  }
  return out;
}

/**
 * Whether this item looks like an unmarked circumscription erection and should be surfaced
 * for a human to confirm. A search aid, in the sense the design spec's conciliar
 * reassignment flagging is one: it warns, it never writes.
 */
export function isErectionCandidate(item: HarvestItem): boolean {
  if (!item.shelf || !APOST_CONSTITUTIONS_SHELVES.has(item.shelf)) return false;
  if (TEXTUALLY_TAGGED.has(item.pageSlug)) return false;
  const curatedKey = `${item.pageSlug}|${slugify(item.incipit ?? item.title)}|${item.date}`;
  if (CIRCUMSCRIPTION_ERECTIONS[curatedKey]) return false;
  // A toponym-shaped heading that already states an elevation (not an erection) is explained
  // by the text, not merely guessed at from its shape -- textual tagging supersedes the
  // morphological flag rather than sitting alongside it.
  if (ELEVATION_PHRASES.some((re) => re.test(item.title))) return false;
  return TOPONYM.test(fold(item.title.trim()));
}

/** The `issuerId`s of the popes whose headings are read textually rather than flagged. */
const TEXTUALLY_TAGGED_ISSUERS = new Set(['rp:francis-i', 'rp:leo-xiv']);

/**
 * The post-harvest counterpart of `isErectionCandidate`, applied to an already-minted
 * `DocumentRecord` instead of a raw `HarvestItem` (the renderer never sees the latter). A
 * `DocumentRecord` has already gone through `keywordsFor`, so it carries whatever keyword
 * the heading or the curated table earned it -- a document is a candidate only if it earned
 * neither, which is a strictly cheaper check than re-deriving `isErectionCandidate`'s
 * curated-key lookup (a `DocumentRecord` does not carry `pageSlug`, so it could not rebuild
 * that key anyway). Used only to report how many candidates remain unconfirmed (spec §6),
 * never to decide anything about the document itself.
 */
export function isUnconfirmedCandidate(d: DocumentRecord): boolean {
  const shelf = d.source?.shelf;
  if (!shelf || !APOST_CONSTITUTIONS_SHELVES.has(shelf)) return false;
  if (TEXTUALLY_TAGGED_ISSUERS.has(d.issuerId)) return false;
  if (d.keywords?.includes('circumscription-erection')) return false;
  if (d.keywords?.includes('circumscription-elevation')) return false;
  return TOPONYM.test(fold(d.title.trim()));
}
