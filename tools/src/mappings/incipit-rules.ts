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
  'Lettera Decretale',                               // Pius XI, letters: 'Lettera Decretale
                                                      // Geminata Laetitia, per la Canonizzazione di
                                                      // Don Giovanni Bosco' (docSlug geminata-laetitia,
                                                      // Task 8)
  'Motu proprio',                                    // Pius XI, motu_proprio
  'Chirografo',                                      // Pius XI, letters
  'Breve Pontificio',                                // Pius XII, briefs: 'Breve Pontificio con il
                                                      // quale San Francesco d'Assisi e Santa Caterina
                                                      // da Siena vengono proclamati Patroni Primari
                                                      // d'Italia' (docSlug patroni-italia, Task 8) --
                                                      // a bare genre phrase with no incipit at all,
                                                      // reached via the lowercase-residue rule.
  // Re-added (Task 8, with evidence -- Finding 3 in Task 5's review deleted the same phrase
  // for lack of any): 'Epistola Apostolica all'Episcopato della Bolivia circa lo sviluppo dei
  // Seminari...' (pius-xii/apost_letters, docSlug episcopato-bolivia) has no incipit at all.
  'Epistola Apostolica',
  // 'Messaggio al Presidente della Polonia' (pius-xii/letters, docSlug presidente-pologna,
  // Task 8): a bare genre word, not an incipit, with no gloss connector of its own -- needs
  // stripping as a prefix (not just BARE_GENRE_SLUGS) so the lowercase-residue rule can null it.
  'Messaggio',
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
  ' al ',                                                                      // Pius XI, letters (Task 8): the masculine-singular sibling of the
                                                                               // four address prepositions above, missing until now. Confirmed
                                                                               // against thirteen real 'Lettera <Incipit> al <addressee>...' headings
                                                                               // whose own URL slug matches the pre-'al' words, e.g. 'Lettera Quamvis
                                                                               // Nostra al Cardinale Presbitero...' (docSlug quamvis-nostra) and
                                                                               // 'Lettera Ceteriores nos al Reverendo Padre...' (docSlug certiores-nos).
                                                                               // Guarded by MIN_WORDS_BEFORE_CUT and by MID_ADDRESS_PATTERN in
                                                                               // incipit.ts (see there) against the three headings shaped the same
                                                                               // way but with NO incipit before the comma-introduced address.
  ' a tutti ',                                                                // Benedict XV, apost_exhortations (Task 12 review): 'Ubi Primum a
                                                                               // tutti i cattolici del mondo' -- no comma or preposition-with-article
                                                                               // separates the incipit from its address, unlike every sibling above.
                                                                               // Confirmed genuine by the heading's own <i>Ubi Primum</i> markup (the
                                                                               // same typographic incipit signal tools/harvest/flat.ts already reads
                                                                               // for the flat era) and by the URL slug (hf_ben-xv_exh_..._ubi-primum,
                                                                               // not a slug of the full address). Kept as this specific two-word
                                                                               // phrase rather than adopting <i> as a general shelf-era signal: a
                                                                               // corpus-wide measurement (Task 12 review) found 57 headings across the
                                                                               // fixtures carry an <i> span, and naively preferring it would silently
                                                                               // overturn four already-evidenced null results (the MID_ADDRESS_PATTERN
                                                                               // and NARRATIVE_OPENERS guards on 'Lettera Avendo Noi creduto, al Card.
                                                                               // ...', 'Lettera Si compie oggi, al Card. ...', 'Lettera Con grande
                                                                               // Nostra, al Card. ...', and 'Motu Proprio Di nostro moto proprio...')
                                                                               // whose own URL slugs are addressee- or genre-based, proving those
                                                                               // italicised spans are not incipits at all -- a real regression risk,
                                                                               // not a hypothetical one.
  ' in occasione',                                                            // Pius XI, apost_constitutions (Task 8): 'Auspicantibus Nobis in
                                                                               // occasione del Giubileo Straordinario del 1929' -- confirmed genuine
                                                                               // by both its own <i>-italicised heading span and its URL slug
                                                                               // (auspicantibus-nobis). The comma-prefixed sibling ', in occasione'
                                                                               // was deleted for lack of evidence in Task 5's review; this bare form
                                                                               // is a distinct, now-evidenced entry.
  ', per ',                                                                   // Pius XI, letters (Task 8): 'Lettera Decretale Geminata Laetitia, per
                                                                               // la Canonizzazione di Don Giovanni Bosco' (docSlug geminata-laetitia).
                                                                               // Deleted for lack of evidence in Task 5's review; now evidenced.
  ', sul ',                                                                   // Task 12 review: matches exactly two headings in the whole corpus --
                                                                               // Benedict XV's 'In Africam quisnam, sul martirio subito in Uganda...'
                                                                               // (docSlug africam-quisnam) and Pius XI's 'Motu Proprio Ad Musicae
                                                                               // Sacrae, sul consalidamento del Pontificio Instituto di Musica Sacra'
                                                                               // (docSlug ad-musicae-sacrae) -- both already re-minted on this
                                                                               // evidence (see task-12-report.md's identifier accounting). The bare,
                                                                               // comma-less ' sul ' also occurs twice more in the corpus (Pius XII's
                                                                               // 'Sacra loca. - La chiesa...sul Monte Sion...' and 'Lettera a Padre
                                                                               // Pietro Leturia...: sul valore...'), but both are already cut earlier
                                                                               // by ' - ' and ': ' respectively, so the comma-anchored form here is
                                                                               // the tighter, sufficient, and correct choice -- adding the bare form
                                                                               // too would be unevidenced by any heading it would actually change.
  ', Lettera Decretale', ',Lettera Decretale',                                // Pius XI, apost_letters (Task 8): 'Christi nomen, Lettera Decretale
                                                                               // («Beatus Ioannes Baptista Maria Vianney» - 31 maggio 1925)' and
                                                                               // 'Suavis agitata,Lettera Decretale (19 maggio 1935)' (the source page's
                                                                               // own transcription drops the space after the comma for the second
                                                                               // one, hence both literal variants) -- the genre phrase trails the
                                                                               // incipit here instead of leading it.
  ', Lettera Enciclica',                                                      // Benedict XV, encyclicals (Task 12 review): 'In Praeclara Summorum,
                                                                               // Lettera Enciclica in occasione del VI centenario della morte di
                                                                               // Dante Alighieri' (docSlug in-praeclara-summorum) -- the same trailing
                                                                               // genre-restatement shape as ', Lettera Decretale' above, just a
                                                                               // different genre word. Without this, the bare ' in occasione'
                                                                               // connector already in this list still cuts, just later, wrongly
                                                                               // keeping 'Lettera Enciclica' inside the incipit.
  ' che istituisce',                                                          // Pius XI, motu_proprio (Task 8, coordinator review): 'Motu Proprio I
                                                                               // primitivi cemeteri che istituisce il Pontificio Istituto di
                                                                               // Archeologia Cristiana', docSlug primitivi-cemeteri -- confirming 'I
                                                                               // primitivi cemeteri' is the genuine incipit, its leading article
                                                                               // dropped in the slug exactly like the already-evidenced 'I Rapidi
                                                                               // Progressi' (docSlug rapidi-progressi) and 'I felici sviluppi' (docSlug
                                                                               // felici-sviluppi). Deliberately this one literal verb form, not bare
                                                                               // ' che ' -- see the note above on why that stays deleted.
];

// Deleted for lack of evidence (review finding, 2026-09-07): the comma-prefixed
// ', con il quale' / ', con la quale' / ', colla quale' / ', con cui' variants, the
// comma-prefixed ', il quale' / ', nel ' / ', in occasione' variants, the
// comma-prefixed ', sull'' / ', sulla ' / ', sui ' / ', sugli ' / ', sopra ' line, and the
// bare (no-comma) ' che '. None was exercised by any test vector or by any heading in the
// 581-record shelf-era corpus. The bare ' che ' in particular is the shape that would have
// made Finding 1's false positives worse, since 'che' is one of the commonest words in
// Italian; only its comma-prefixed form (', che ', evidenced above) is kept.
// (Task 8 re-added ', per ' and the bare, non-comma ' in occasione' against real Pius XI
// headings -- see GLOSS_CONNECTORS above. The other deletions above still stand: no
// heading anywhere in the four-pontificate corpus has needed them.)

/**
 * Third-person-narration openers (spec §4.2 review finding, 2026-09-07). A residue
 * beginning with one of these, at a word boundary and case-insensitively, is never an
 * incipit -- it is a narrative description of the pontifical act, unconditionally: unlike
 * the article + honorific construction below, there is no common Italian incipit that opens
 * 'Il Pontefice...' or 'Il Santo/Sommo Pontefice...'.
 *
 * 'Il Pontefice' is evidenced by a real Pius X letters-shelf heading (incipit.test.ts:
 * 'Il Pontefice prescrive alle Diocesi...'). 'Il Santo Padre' and 'Il Sommo Pontefice' have
 * no matching heading in the current corpus but are the synonyms for 'Il Pontefice' already
 * carried elsewhere in GLOSS_CONNECTORS, and were specified by the review finding that
 * introduced this guard.
 */
export const NARRATIVE_OPENERS: readonly string[] = [
  'Il Pontefice', 'Il Santo Padre', 'Il Sommo Pontefice',
  // 'Di nostro' (Task 8, coordinator review): 'Motu Proprio Di nostro moto proprio che
  // contiene la Legge Fondamentale della Città del Vaticano' (pius-xi/motu_proprio) echoes
  // the genre word itself ('moto proprio') back at the reader instead of naming a subject
  // -- a self-referential description of the act, not an incipit. Its own URL slug,
  // moto-proprio, is as generic as the genre word itself and evidences no incipit at all
  // (contrast the specific, incipit-derived slugs on every genuine bare incipit in this
  // corpus). No other heading anywhere in the four-pontificate corpus opens this way.
  'Di nostro',
];

/**
 * Address-salutation articles (spec §4.2 review finding, 2026-09-07, round 2). A bare
 * article is NOT on its own evidence of an addressee heading -- 'Al compimento delle
 * riforme' (leo-xiii/letters; incipit.test.ts) is a genuine published incipit, article +
 * common noun, whose id is already live in main. Round 1 nulled it wrongly by treating any
 * 'Al'/'Ai'/'Alla'/'Agli' opener as an address, which is over-broad.
 *
 * An article is address-salutation evidence only when immediately followed by one of
 * ADDRESS_HONORIFICS (see there). The article itself still needs listing, since the guard
 * must match 'Al Cardinale...', 'Ai membri...'-shaped strings at the true start of the
 * residue, not just anywhere the honorific appears.
 */
export const ADDRESS_ARTICLES: readonly string[] = ['Al', 'Alla', 'Ai', 'Agli'];

/**
 * Honorifics that turn a leading article into address-salutation evidence, per
 * ADDRESS_ARTICLES. Deliberately exactly three tokens, each independently evidenced by a
 * real Pius X letters-shelf heading (incipit.test.ts): 'Card.' by 'Al Card. Pietro
 * Respighi', 'Cardinale' by both 'Al Cardinale Rampolla del Tindaro...' and 'Al Cardinale
 * Pietro Respighi, sui sacerdoti...', 'Principessa' by 'Alla Principessa del Belgio,
 * Enrichetta...'.
 *
 * A longer list was proposed and rejected (round 2 re-review) against the full 581-heading
 * corpus: 'Mons.', 'Monsignor', 'Vescovo', 'Arcivescovo', 'Principe', 'Em.', 'Ecc.', 'S.E.'
 * never occur as the word immediately following an article anywhere in the corpus.
 * 'Arcivescovo' in particular occurs only mid-heading after a comma, in 'Al Cardinale
 * Ferrari, Arcivescovo di Milano', where the trigger is already 'Cardinale'. Do not add
 * tokens here without a heading that needs one -- that is the unevidenced-rule mistake round
 * 1 fixed elsewhere in this file.
 */
export const ADDRESS_HONORIFICS: readonly string[] = ['Card.', 'Cardinale', 'Principessa'];

/**
 * Two more uses of ADDRESS_ARTICLES / ADDRESS_HONORIFICS, added in Task 8 against the
 * Pius XI/XII corpus, both implemented in incipit.ts rather than as new curated lists here
 * (no new tokens were needed -- only new positions to check them in):
 *
 * 1. **Mid-string address salutation.** A genre-prefix-stripped residue that opens with a
 *    short narrative phrase before addressing a cardinal reads exactly like a genuine
 *    "<Incipit> al <addressee>" heading (see ' al ' in GLOSS_CONNECTORS) UNLESS a comma
 *    sits between the phrase and the address -- the comma is the tell that the phrase is
 *    narrative, not an incipit. Evidenced by three real Pius XI letters-shelf headings whose
 *    own URL slug is addressee-based, not incipit-based: 'Lettera Avendo Noi creduto, al
 *    Card. Eugenio Pacelli...' (docSlug card-pacelli, not avendo-noi-creduto), 'Lettera Si
 *    compie oggi, al Card. Pietro Gasparri...' (docSlug dimissioni-gasparri), 'Lettera Con
 *    grande Nostra, al Card. Bisleti...' (docSlug card-bisleti) -- contrasted with thirteen
 *    siblings with the identical shape but NO comma, whose slug confirms a genuine incipit
 *    (e.g. 'Lettera Quamvis Nostra al Cardinale...', docSlug quamvis-nostra). incipit.ts's
 *    `MID_ADDRESS_PATTERN` matches ', ' + an ADDRESS_ARTICLE + an ADDRESS_HONORIFIC anywhere
 *    in the residue (not anchored at the start, unlike OPENER_PATTERN) and returns null.
 *
 * 2. **Long address opener.** A residue that opens with a bare ADDRESS_ARTICLE and no
 *    honorific is not, on its own, address-salutation evidence (see ADDRESS_ARTICLES's own
 *    doc comment and 'Al compimento delle riforme'). But when the *whole* residue also runs
 *    longer than MAX_INCIPIT_WORDS, a stray downstream GLOSS_CONNECTORS match can otherwise
 *    produce a false truncation that escapes the word ceiling entirely (the ceiling normally
 *    catches an over-long address sentence, but only when nothing was cut at all). Evidenced
 *    by 'Ai Religiosi del Portogallo che hanno partecipato a Lisbona ad un Convegno sugli
 *    stati religiosi di perfezione' (pius-xii/letters, docSlug religiosi-portogallo, no
 *    incipit at all) -- seventeen words, which a stray ' sugli ' cut would otherwise truncate
 *    to a twelve-word non-incipit instead of correctly nulling. Does not affect 'Al
 *    compimento delle riforme' (four words, under the ceiling) or 'Sancti Vladimiri Magni...:
 *    eretta' (does not open with an address article).
 */

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
