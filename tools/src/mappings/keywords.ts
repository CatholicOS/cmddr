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
export const CIRCUMSCRIPTION_ERECTIONS: Record<string, { note: string }> = {};

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
