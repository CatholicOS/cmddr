import { slugify } from '../slug.js';
import type { DocumentRecord, HarvestItem } from '../types.js';
import {
  CIRCUMSCRIPTION_ERECTIONS, CIRCUMSCRIPTION_ELEVATIONS, CIRCUMSCRIPTION_UNIONS,
  CANDIDATE_ADJUDICATIONS,
} from './circumscriptions.js';
import { POPES } from './pontiffs.js';

/**
 * The circumscription nouns that guard a bare verb ('erige', 'eleva') against firing on an
 * unrelated document that merely happens to use the same verb -- e.g. a church or cathedral
 * raised 'al rango di Basilica Minore' is an elevation of a building, not a circumscription.
 * Covers the ranks actually seen in the corpus: diocese/archdiocese, eparchy/archeparchy
 * (the Eastern-rite equivalents), exarchate, prefecture and vicariate (the two ranks a
 * mission territory passes through before becoming a diocese or eparchy), plus ecclesiastical
 * province and metropolitan sui iuris church (the two grouping-of-sees ranks, added final
 * review 2026-09-07 -- see ERECTION_PHRASES's own doc comment for why).
 */
const CIRCUMSCRIPTION_NOUN =
  '(diocesi|arcidiocesi|eparchia|arcieparchia|esarcato|prefettura|vicariato'
  + '|provincia ecclesiastica|chiesa metropolitana)';

/**
 * Headings that state the act. Francis and Leo XIV print it in full -- 'Il Santo Padre ha
 * eretto la nuova Diocesi di Caazapá (Paraguay)' -- so the keyword is read from the text
 * rather than guessed. Matched case-insensitively against the whole title.
 *
 * 'ha eretto' / 'ha istituito' are guarded by a nearby circumscription noun too (final
 * review, 2026-09-07), for consistency with 'erige' below and 'ha elevato'/'eleva' further
 * down -- both bare verbs are guarded because, unguarded, they also fire on non-
 * circumscription acts (Pius XII's chirografo erecting the Istituto per le Opere di
 * Religione; John XXIII's motu proprio erecting the Pontificia Commissione per la
 * Cinematografia). Measured before adding: across the full corpus 'ha eretto'/'ha
 * istituito' match 36 + 1 headings, every one of them a genuine circumscription-erection
 * apostolic constitution, so the guard is a no-op today -- but three of those 36
 * ('Il Santo Padre ha eretto la Provincia Ecclesiastica di Calicut...', '...la Chiesa
 * Metropolitana "sui iuris" eritrea...', '...la Provincia Ecclesiastica di Dodoma...')
 * would have been wrongly *un*-tagged by the base CIRCUMSCRIPTION_NOUN list, which had no
 * term for an ecclesiastical province or a metropolitan sui iuris church -- both are
 * themselves a rank of circumscription, just a grouping-of-sees rank the corpus had not
 * needed to name before Francis's headings started stating the act in full. Widened
 * CIRCUMSCRIPTION_NOUN with those two evidenced terms (above) so the guard adds
 * consistency without regressing recall: still exactly 36 + 1 after widening.
 */
const ERECTION_PHRASES: readonly RegExp[] = [
  new RegExp(`\\bha eretto\\b.{0,40}\\b${CIRCUMSCRIPTION_NOUN}\\b`, 'i'),
  new RegExp(`\\bha istituito\\b.{0,40}\\b${CIRCUMSCRIPTION_NOUN}\\b`, 'i'),
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
  if (ELEVATION_PHRASES.some((re) => re.test(item.title))
      || CIRCUMSCRIPTION_ELEVATIONS[curatedKey]) {
    out.push('circumscription-elevation');
  }
  if (CIRCUMSCRIPTION_UNIONS[curatedKey]) out.push('circumscription-union');
  return out;
}

/**
 * Whether this item looks like an unmarked circumscription erection and should be surfaced
 * for a human to confirm. A search aid, in the sense the design spec's conciliar
 * reassignment flagging is one: it warns, it never writes. Returns false once the document
 * has been adjudicated into any of the four curated tables -- an erection, an elevation, a
 * union, or a read-and-rejected candidate -- since a document already judged is no longer
 * awaiting confirmation, whichever way the judgment went.
 */
export function isErectionCandidate(item: HarvestItem): boolean {
  if (!item.shelf || !APOST_CONSTITUTIONS_SHELVES.has(item.shelf)) return false;
  if (TEXTUALLY_TAGGED.has(item.pageSlug)) return false;
  const curatedKey = `${item.pageSlug}|${slugify(item.incipit ?? item.title)}|${item.date}`;
  if (CIRCUMSCRIPTION_ERECTIONS[curatedKey] || CIRCUMSCRIPTION_ELEVATIONS[curatedKey]
      || CIRCUMSCRIPTION_UNIONS[curatedKey] || CANDIDATE_ADJUDICATIONS[curatedKey]) return false;
  // A toponym-shaped heading that already states an elevation (not an erection) is explained
  // by the text, not merely guessed at from its shape -- textual tagging supersedes the
  // morphological flag rather than sitting alongside it.
  if (ELEVATION_PHRASES.some((re) => re.test(item.title))) return false;
  return TOPONYM.test(fold(item.title.trim()));
}

/** The `issuerId`s of the popes whose headings are read textually rather than flagged. */
const TEXTUALLY_TAGGED_ISSUERS = new Set(['rp:francis-i', 'rp:leo-xiv']);

/** vatican.va page slug for an issuer -- the inverse of VATICAN_SLUG_TO_ISSUER, derived from
 *  the same table so the two cannot disagree. A DocumentRecord carries no pageSlug, so this
 *  is how a curated key is rebuilt from a harvested record. */
const ISSUER_TO_VATICAN_SLUG: Record<string, string> =
  Object.fromEntries(POPES.map((p) => [p.issuerId, p.pageSlug]));

/**
 * The three keywords the circumscription tables award, and the only ones that retire a
 * candidate (spec §5). Named rather than matched by prefix so that a keyword this module
 * does not know -- one minted later, or one a hand-edited record carries by mistake --
 * cannot silently drop a document from the count without an adjudication row.
 */
const CIRCUMSCRIPTION_KEYWORDS = new Set([
  'circumscription-erection', 'circumscription-elevation', 'circumscription-union',
]);

/**
 * The post-harvest counterpart of `isErectionCandidate`, applied to an already-minted
 * `DocumentRecord` instead of a raw `HarvestItem` (the renderer never sees the latter). A
 * `DocumentRecord` has already gone through `keywordsFor`, so it carries whatever keyword
 * the heading or the curated tables earned it -- a document that earned one is not a
 * candidate. One that earned none may still have been read and rejected, and a rejection
 * leaves no keyword behind, so the function rebuilds the curated key (`pageSlug` via
 * `ISSUER_TO_VATICAN_SLUG`, since a `DocumentRecord` carries only the `issuerId`) and looks
 * it up in `CANDIDATE_ADJUDICATIONS`. Used only to report how many candidates remain
 * unconfirmed (spec §6), never to decide anything about the document itself.
 */
export function isUnconfirmedCandidate(d: DocumentRecord): boolean {
  const shelf = d.source?.shelf;
  if (!shelf || !APOST_CONSTITUTIONS_SHELVES.has(shelf)) return false;
  if (TEXTUALLY_TAGGED_ISSUERS.has(d.issuerId)) return false;
  if (d.keywords?.some((k) => CIRCUMSCRIPTION_KEYWORDS.has(k))) return false;
  // A document read and judged to be none of the three is no longer awaiting confirmation.
  // Without this the adjudicated records stay in the count for ever, which is exactly the
  // defect this work exists to fix (spec §1, §5).
  const pageSlug = ISSUER_TO_VATICAN_SLUG[d.issuerId];
  const key = `${pageSlug}|${slugify(d.incipit ?? d.title)}|${d.date}`;
  if (pageSlug && CANDIDATE_ADJUDICATIONS[key]) return false;
  return TOPONYM.test(fold(d.title.trim()));
}
