/**
 * Curated rules for recovering an incipit from a printed vatican.va heading (spec §4.2).
 *
 * Leo XIII and Pius X print bare incipits and none of these rules fire against them --
 * which is asserted by the 725 records harvested before this module existed remaining
 * byte-identical. From Pius XI onward a heading is genre phrase + incipit + descriptive
 * gloss, in varying order, and some carry no incipit at all.
 *
 * Every entry is evidenced by a real heading, cited in the comment beside it.
 */

/**
 * Leading genre phrases, matched case-insensitively and anchored at the start.
 * Sorted longest-first at module load so 'Lettera Apostolica in forma di «Motu Proprio»'
 * always beats the 'Lettera Apostolica' prefix of the same string.
 * The quote characters vary by page (« » " " ' '), so each shape is listed.
 */
export const GENRE_PREFIXES: readonly string[] = [
  'Lettera Apostolica in forma di «Motu Proprio»',   // Francis, apost_letters
  'Lettera Apostolica in forma di "Motu Proprio"',   // Leo XIV, apost_letters
  'Lettera Apostolica in forma di “Motu Proprio”',   // Leo XIV, motu_proprio
  "Lettera Apostolica in forma di 'Motu Proprio'",   // John XXIII, motu_proprio
  'Lettera Apostolica in forma di Motu Proprio',     // John Paul II, motu_proprio
  'Lettera Apostolica data Motu Proprio',            // Benedict XVI, motu_proprio
  'Lettera Apostolica (breve)',                      // Pius XII, apost_letters
  'Esortazione Apostolica Postsinodale',             // Benedict XVI, apost_exhortations
  'Esortazione Apostolica',                          // Leo XIV, apost_exhortations
  // 'Lettera Apostolica inviata a nome del Santo Padre dal Segretario di Stato' and
  // 'Lettera Apostolica per la costituzione della Nunziatura Apostolica...' (both real
  // headings, exercised in incipit.test.ts).
  'Lettera Apostolica',
  'Lettera Enciclica',                               // Leo XIV, encyclicals
  'Motu proprio',                                    // Pius XI, motu_proprio
  'Chirografo',                                      // Pius XI, letters
  // Bare genre word with nothing following: exercised directly by incipit.test.ts
  // ('Bolla' -> null). No real heading in the corpus prints an incipit straight after
  // an unadorned 'Bolla'; kept only for the bare-word case.
  'Bolla',
  // 'Lettera a S. E. Monsignor Luigi Agostino Marmottin, in occasione della celebrazione'
  // and 'Lettera a Mons. ...'-shaped addressee headings (real headings, incipit.test.ts).
  'Lettera',
];

// Deleted for lack of evidence (review finding, 2026-09-07): 'Costituzione Apostolica',
// 'Bolla di indizione', 'Breve Apostolico', 'Epistola'. None was exercised by any test
// vector or by any heading in the 581-record shelf-era corpus; removing all four left
// every existing test green, proving they were speculative. Re-add only against a real
// heading that needs one.

/**
 * Markers that a descriptive gloss has begun. The incipit is what precedes the earliest
 * one found. Longer, more specific forms are listed but order does not matter: the
 * implementation takes the minimum index across all of them.
 */
export const GLOSS_CONNECTORS: readonly string[] = [
  ', col quale',                                                              // 'Mirabilis Deus, col quale il Pontefice attribuisce...' (incipit.test.ts)
  ' con il quale', ' con la quale', ' col quale', ' con cui',                  // Pius XI
  ', che ',                                                                   // 'Quod nobis in condendo, che attribuisce al Pontificio Istituto...' (incipit.test.ts)
  '. Il Santo Padre', '. Il Sommo Pontefice',                                  // Francis
  ' del Santo Padre', ' del Sommo Pontefice', ' di Papa ',                     // Leo XIV
  ": ", ' - ', ' – ', ' — ',                                                   // Pius XII, B XVI
  " sull'", ' sulla ', ' sui ', ' sugli ', ' sopra ',                          // John XXIII; ' sulla ' also confirmed against
                                                                               // 'Oecumenicum Concilium sulla recita del Rosario...' (incipit.test.ts) and, via the
                                                                               // two-word guard, against the real Leo XIII heading 'Vicario sulla terra'
                                                                               // (incipit.test.ts), which must NOT cut here
  ' ai ', ' agli ', ' alle ', ' alla ', " all'",                               // Benedict XV; ' ai ' confirmed against
                                                                               // 'Dès le début ai Capi dei popoli belligeranti...' (incipit.test.ts)
];

// Deleted for lack of evidence (review finding, 2026-09-07): the comma-prefixed
// ', con il quale' / ', con la quale' / ', colla quale' / ', con cui' variants, the
// comma-prefixed ', il quale' / ', nel ' / ', per ' / ', in occasione' variants, the
// comma-prefixed ', sull'' / ', sulla ' / ', sui ' / ', sugli ' / ', sopra ' line, and the
// bare (no-comma) ' che '. None was exercised by any test vector or by any heading in the
// 581-record shelf-era corpus. The bare ' che ' in particular is the shape that would have
// made Finding 1's false positives worse, since 'che' is one of the commonest words in
// Italian; only its comma-prefixed form (', che ', evidenced above) is kept.

/**
 * Address-salutation and third-person-narration openers (spec §4.2 review finding,
 * 2026-09-07). A residue beginning with one of these, at a word boundary and
 * case-insensitively, is never an incipit -- it is either an addressee heading (a letter to
 * a named cardinal or bishop) or a narrative description of the pontifical act. Checked
 * before any gloss-connector cut, because a short cut alone cannot catch these: cutting
 * 'Al Cardinale Pietro Respighi, sui sacerdoti...' at ', sui ' still leaves four words
 * ('Al Cardinale Pietro Respighi'), clearing MIN_WORDS_BEFORE_CUT.
 *
 * 'Al' and 'Il Pontefice' are each evidenced by a real Pius X letters-shelf heading (see
 * incipit.test.ts: 'Al Cardinale Rampolla del Tindaro...' and 'Il Pontefice prescrive alle
 * Diocesi...'); 'Ai' by two ('Ai membri del comitato...', 'Ai componenti la direzione
 * provvisoria...'). 'Alla', 'Agli', 'Il Santo Padre' and 'Il Sommo Pontefice' have no
 * matching heading in the current corpus but are the grammatical siblings of the evidenced
 * forms (definite-article variants of the same address construction, and the synonyms for
 * 'Il Pontefice' already carried elsewhere in GLOSS_CONNECTORS) and were specified by the
 * review finding that introduced this guard.
 */
export const ADDRESS_OR_NARRATIVE_OPENERS: readonly string[] = [
  'Al', 'Alla', 'Ai', 'Agli', 'Il Pontefice', 'Il Santo Padre', 'Il Sommo Pontefice',
];

/**
 * A gloss-connector cut is discarded, and the heading falls through to the
 * untouched/word-ceiling path, when fewer than this many words would precede it. Evidenced
 * by the real Leo XIII heading 'Vicario sulla terra' (incipit.test.ts): cutting at ' sulla '
 * would leave only 'Vicario' (one word), but the phrase is the whole incipit. Two words
 * still lets 'Oecumenicum Concilium sulla recita del Rosario...' cut correctly.
 */
export const MIN_WORDS_BEFORE_CUT = 2;

/**
 * A residue that slugifies to one of these is a genre word standing alone, not an incipit.
 */
export const BARE_GENRE_SLUGS: ReadonlySet<string> = new Set([
  'lettera', 'lettera-apostolica', 'lettera-enciclica', 'bolla', 'breve',
  'breve-apostolico', 'decreto', 'epistola', 'discorso', 'allocuzione',
  'chirografo', 'messaggio', 'omelia', 'costituzione', 'costituzione-apostolica',
  'esortazione', 'esortazione-apostolica', 'motu-proprio',
]);

/**
 * A heading that survived prefix-stripping and connector-cutting unchanged, and still runs
 * longer than this many words, is a gloss the rules above did not recognise -- so no incipit
 * is claimed for it and the document gets a provisional id.
 *
 * A heuristic, deliberately sited here rather than in the parser so it can be tuned against
 * evidence as the corpus grows. Eight words admits every bare incipit observed to date; the
 * longest is Leo XIII's 'Dall'alto dell'Apostolico Seggio' at four and Paul VI's
 * 'Vicariae potestatis in urbe' at four. It rejects
 * 'Sancti Vladimiri Magni in urbe Parisiensi pro Ucrainis ritus Byzantini' (ten), which is a
 * genuine title -- an accepted false negative: a provisional id is recoverable by hand, a
 * wrong minted id is permanent.
 */
export const MAX_INCIPIT_WORDS = 8;
