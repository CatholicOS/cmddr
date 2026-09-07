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
  'Costituzione Apostolica',
  'Esortazione Apostolica',                          // Leo XIV, apost_exhortations
  'Lettera Apostolica',
  'Lettera Enciclica',                               // Leo XIV, encyclicals
  'Breve Apostolico',                                // Pius XII, briefs
  'Bolla di indizione',
  'Motu proprio',                                    // Pius XI, motu_proprio
  'Chirografo',                                      // Pius XI, letters
  'Epistola',
  'Bolla',
  'Lettera',
];

/**
 * Markers that a descriptive gloss has begun. The incipit is what precedes the earliest
 * one found. Longer, more specific forms are listed but order does not matter: the
 * implementation takes the minimum index across all of them.
 */
export const GLOSS_CONNECTORS: readonly string[] = [
  ', con il quale', ', con la quale', ', col quale', ', colla quale', ', con cui',
  ' con il quale', ' con la quale', ' col quale', ' con cui',                  // Pius XI
  ', che ', ', il quale', ', nel ', ', per ', ', in occasione',
  ", sull'", ', sulla ', ', sui ', ', sugli ', ', sopra ',                     // Leo XIV
  '. Il Santo Padre', '. Il Sommo Pontefice',                                  // Francis
  ' del Santo Padre', ' del Sommo Pontefice', ' di Papa ',                     // Leo XIV
  ": ", ' - ', ' – ', ' — ',                                                   // Pius XII, B XVI
  " sull'", ' sulla ', ' sui ', ' sugli ', ' sopra ',                          // John XXIII
  ' ai ', ' agli ', ' alle ', ' alla ', " all'",                               // Benedict XV
  ' che ',
];

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
