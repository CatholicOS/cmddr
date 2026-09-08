import { describe, it, expect } from 'vitest';
import { extractIncipit } from '../src/harvest/incipit.js';

const incipitOf = (h: string) => extractIncipit(h).incipit;

describe('extractIncipit', () => {
  it('is a no-op on a bare incipit, which is the whole flat and Leo XIII era', () => {
    for (const h of ['Quanta semper cura', 'Iucunda equidem', 'Rerum Novarum',
                     'Adiutricem populi', "Dall'alto dell'Apostolico Seggio",
                     'Avkaënsis', 'Tiranensis-Dyrracena', 'Vicariae potestatis in urbe']) {
      expect(extractIncipit(h)).toEqual({ title: h, incipit: h });
    }
  });

  it('always keeps the full heading as the title', () => {
    const h = 'Motu proprio In multis solaciis con il quale conferisce il nome di «Pontificia»';
    expect(extractIncipit(h).title).toBe(h);
  });

  it('strips a leading genre phrase', () => {
    expect(incipitOf('Motu proprio In multis solaciis con il quale conferisce il nome'))
      .toBe('In multis solaciis');
    expect(incipitOf('Lettera Apostolica in forma di «Motu Proprio» La vera bellezza sulla riforma'))
      .toBe('La vera bellezza');
    expect(incipitOf("Lettera Apostolica in forma di 'Motu Proprio' Dominicianus Ordo con la quale"))
      .toBe('Dominicianus Ordo');
  });

  it('prefers the longest matching genre phrase', () => {
    // 'Lettera Apostolica in forma di «Motu Proprio»' must beat 'Lettera Apostolica'.
    expect(incipitOf('Lettera Apostolica in forma di «Motu Proprio» Mutua Concordia del Sommo Pontefice'))
      .toBe('Mutua Concordia');
  });

  it('takes a quoted opening as the incipit', () => {
    expect(incipitOf('"Incomparabilis Magister". Il Santo Padre ha eretto la Provincia Ecclesiastica di Calicut'))
      .toBe('Incomparabilis Magister');
    expect(incipitOf('“C’est la confiance”: Esortazione Apostolica sulla fiducia'))
      .toBe('C’est la confiance');
    expect(incipitOf('Lettera Enciclica "Magnifica Humanitas" di Papa Leone XIV sulla custodia'))
      .toBe('Magnifica Humanitas');
  });

  it('cuts at a gloss connector', () => {
    expect(incipitOf('Quod nobis in condendo, che attribuisce al Pontificio Istituto il potere'))
      .toBe('Quod nobis in condendo');
    expect(incipitOf("Iubilaeum maximum - Bolla di indizione del Giubileo Universale dell'Anno Santo"))
      .toBe('Iubilaeum maximum');
    expect(incipitOf('Ecclesia in Medio Oriente: Esortazione Apostolica Postsinodale sulla Chiesa'))
      .toBe('Ecclesia in Medio Oriente');
    expect(incipitOf('Suavis Nutrix animarum: Il Santo Padre ha eretto la Diocesi di Bariadi'))
      .toBe('Suavis Nutrix animarum');
    expect(incipitOf('Mirabilis Deus, col quale il Pontefice attribuisce a Don Giovanni Bosco'))
      .toBe('Mirabilis Deus');
    expect(incipitOf('Oecumenicum Concilium sulla recita del Rosario per la riuscita del Concilio'))
      .toBe('Oecumenicum Concilium');
    expect(incipitOf('Dès le début ai Capi dei popoli belligeranti invitandoli a trovare la pace'))
      .toBe('Dès le début');
    expect(incipitOf('Il Film Ideale - Esortazioni ai rappresentanti del mondo cinematografico'))
      .toBe('Il Film Ideale');
    expect(incipitOf("Esortazione Apostolica Dilexi te del Santo Padre Leone XIV, sull'amore ai poveri"))
      .toBe('Dilexi te');
  });

  it('returns null when the residue continues the genre phrase in lower case', () => {
    // An incipit is capitalised or quoted; a lower-case residue is gloss, not incipit.
    for (const h of [
      'Lettera Apostolica (breve) che proclama Santa Chiara Patrona Celeste della Televisione',
      'Lettera a S. E. Monsignor Luigi Agostino Marmottin, in occasione della celebrazione',
      'Chirografo al Cardinale Eugenio Pacelli, affidando al Cardinale Segretario di Stato',
      'Lettera Apostolica inviata a nome del Santo Padre dal Segretario di Stato',
      'Lettera Apostolica data Motu Proprio su alcune modifiche alle norme relative',
      'Lettera apostolica in forma di Motu Proprio con la quale si affida alla Congregazione',
      'Lettera Apostolica per la costituzione della Nunziatura Apostolica nella Repubblica',
    ]) {
      expect(incipitOf(h), h).toBeNull();
    }
  });

  it('returns null for a bare genre word and for an empty heading', () => {
    expect(incipitOf('Lettera Apostolica')).toBeNull();
    expect(incipitOf('Bolla')).toBeNull();
    expect(incipitOf('   ')).toBeNull();
  });

  it('returns null for a long uncut heading, which is a gloss the rules did not recognise', () => {
    expect(incipitOf('Sancti Vladimiri Magni in urbe Parisiensi pro Ucrainis ritus Byzantini'))
      .toBeNull();
  });

  it('does not apply the word ceiling to a heading the rules did cut', () => {
    // The ceiling exists to catch un-cut glosses. A cut result is trusted at any length.
    expect(incipitOf('Sancti Vladimiri Magni in urbe Parisiensi pro Ucrainis ritus Byzantini: eretta'))
      .toBe('Sancti Vladimiri Magni in urbe Parisiensi pro Ucrainis ritus Byzantini');
  });

  // The four headings below are real Leo XIII/Pius X shelf-era headings (found by running
  // extractIncipit over all 581 already-harvested shelf-era headings) that a first version of
  // this function truncated wrongly. Two guards fix them (review finding, 2026-09-07):
  //   Guard A -- a gloss-connector cut that would leave fewer than two words before it is
  //   discarded, so the heading falls through to the untouched/word-ceiling path instead.
  //   Guard B -- a residue opening with an article immediately followed by an attested
  //   honorific ('Al Cardinale...', 'Alla Principessa...') or with a third-person narration
  //   opener ('Il Pontefice', ...) is never an incipit, regardless of any connector further
  //   along. A bare article alone ('Al compimento delle riforme') is not enough -- see round
  //   2 below.
  it('does not cut a short residue at a bare prepositional connector (Guard A)', () => {
    // Guard A: cutting at ' sulla ' would leave only 'Vicario' (one word), so the cut is
    // discarded and the whole bare incipit is kept, exactly like the flat/Leo XIII vectors.
    expect(extractIncipit('Vicario sulla terra'))
      .toEqual({ title: 'Vicario sulla terra', incipit: 'Vicario sulla terra' });
  });

  it('does not apply Guard A to a hyphen/colon connector even at one word (Task 13 review)', () => {
    // Pius XII's real 'Palmensis - Lagensis (Palmensis et Xapecoënsis)' has one word
    // ('Palmensis') before its ' - '. Guard A must still discard that cut -- ' - ' is
    // genuinely ambiguous at one word, unlike the CUT_GUARD_EXEMPT connectors below -- so
    // the whole heading (no trailing gloss here) is kept as the untouched-path incipit.
    expect(extractIncipit('Palmensis - Lagensis (Palmensis et Xapecoënsis)'))
      .toEqual({
        title: 'Palmensis - Lagensis (Palmensis et Xapecoënsis)',
        incipit: 'Palmensis - Lagensis (Palmensis et Xapecoënsis)',
      });
  });

  it('exempts specific multi-word relative-clause connectors from Guard A (Task 13 review)', () => {
    // 'Liberopolitanae, con la quale...' and 'Nzerekoreensis, che eleva...' (both real
    // John XXIII apost_constitutions headings) have exactly one word before their
    // earliest connector -- but ' con la quale' and ', che ' are multi-word relative-
    // clause markers that can never themselves continue an incipit, unlike a single
    // ambiguous preposition (see the previous test), so the cut is trusted regardless.
    expect(incipitOf('Liberopolitanae, con la quale la diocesi di Libreville nella Repubblica Gabonese in Africa Centrale, viene eletta al rango di Arcidiocesi Metropolitana'))
      .toBe('Liberopolitanae');                                           // docSlug liberopolitanae
    expect(incipitOf('Nzerekoreensis, che eleva la prefettura apostolica di Nzerekore in Guinea al grado di diocesi'))
      .toBe('Nzerekoreensis');                                            // docSlug nzerekoreensis
  });

  it('treats an address salutation or narrative opener as having no incipit (Guard B)', () => {
    // Guard A alone cannot catch these: three and four words precede their would-be cuts,
    // clearing MIN_WORDS_BEFORE_CUT. Guard B checks the opener itself instead.
    expect(incipitOf('Al Cardinale Pietro Respighi, sui sacerdoti di altre Diocesi che dimorano a Roma'))
      .toBeNull();
    expect(incipitOf('Il Pontefice prescrive alle Diocesi della Provincia di Roma il nuovo Compendio del Catechismo'))
      .toBeNull();
  });

  it('does not treat a bare article as an address salutation on its own (Guard B, round 2)', () => {
    // 'Al compimento delle riforme' (leo-xiii/letters) is a genuine published incipit --
    // article + common noun, not an addressee heading. Round 1 nulled it wrongly by treating
    // any 'Al'/'Ai'/'Alla'/'Agli' opener as an address; the article now only counts as
    // address-salutation evidence when immediately followed by an attested honorific
    // ('Card.', 'Cardinale', 'Principessa'). This is the case that proves the guard is
    // narrow enough -- a future widening of ADDRESS_HONORIFICS that swallowed it again
    // would fail here first.
    expect(extractIncipit('Al compimento delle riforme'))
      .toEqual({ title: 'Al compimento delle riforme', incipit: 'Al compimento delle riforme' });
  });

  it('returns null for real addressee and narrative shelf-era headings with no incipit', () => {
    // Real Pius X letters/motu_proprio-shelf headings with no incipit at all -- confirmed by
    // running extractIncipit over the full 581-heading Leo XIII/Pius X corpus.
    for (const h of [
      'A Mons. Francesco Saverio Haberl, Prelato domestico di S.S. e Presidente generale '
        + 'dell\'Associazione "Santa Cecilia" di Germania, Ratisbona (Baviera)',
      "Ai membri del comitato generale dell'Associazione Cattolica della gioventù francese",
      "Ai componenti la direzione provvisoria dell' Unione economico sociale per i cattolici italiani",
      'Al Cardinale Rampolla del Tindaro, Arciprete della Basilica Vaticana',
      'La protesta del Papa contro il Congresso del libero pensiero',
      "Sull'edificazione di un nuovo Santuario nel territorio di Nettuno come assistenza spirituale della popolazione",
      "Sull'edizione vaticana dei libri liturgici contenenti le melodie gregoriane",
    ]) {
      expect(incipitOf(h), h).toBeNull();
    }
  });

  it('catches three more real addressee headings that were silently wrong before Guard B', () => {
    // Guard B also fixes latent false "successes": before it existed, these short headings
    // never triggered any rule (no genre prefix, no cut, under the word ceiling) and were
    // silently returned as if they were bare incipits. Each is confirmed non-incipit by its
    // own URL slug on vatican.va, which is descriptive rather than incipit-derived
    // (hf_..._catechismo, _cardinale-ferrari, _principessa-belgio) -- unlike a genuine bare
    // incipit's slug, which always abbreviates the incipit itself (e.g. _adiutricem for
    // 'Adiutricem populi'). Each also carries the honorific ('Card.', 'Cardinale',
    // 'Principessa') that distinguishes a real address from 'Al compimento delle riforme'
    // above.
    for (const h of [
      'Al Card. Pietro Respighi',                                     // hf_p-x_let_..._catechismo
      'Al Cardinale Ferrari, Arcivescovo di Milano',                  // hf_p-x_let_..._cardinale-ferrari
      "Alla Principessa del Belgio, Enrichetta, Duchessa di Vendôme", // hf_p-x_let_..._principessa-belgio
    ]) {
      expect(incipitOf(h), h).toBeNull();
    }
  });

  it('is a no-op on the one real shelf-era heading that a gloss-shaped cut would truncate', () => {
    // 'Ad universam' is genuinely the whole incipit; the trailing ': viene eretta...' is a
    // gloss and the ': ' connector correctly cuts it off -- confirmed against the corpus.
    expect(incipitOf('Ad universam: viene eretta la diocesi di Lugano'))
      .toBe('Ad universam');
  });
});

describe('extractIncipit against Pius XI and Pius XII (Task 8)', () => {
  it('recovers a genre-suffixed incipit ("Lettera Decretale" trailing the incipit)', () => {
    // 'Christi nomen, Lettera Decretale (...)' (pius-xi/apost_letters, docSlug beatus-vianney
    // for the whole document but confirming 'Christi nomen' is the genuine incipit, not the
    // suffix) and the same page's own transcription typo dropping the space after the comma:
    // 'Suavis agitata,Lettera Decretale' (docSlug saevis-agitata).
    expect(incipitOf('Christi nomen, Lettera Decretale')).toBe('Christi nomen');
    expect(incipitOf('Suavis agitata,Lettera Decretale')).toBe('Suavis agitata');
  });

  it('strips a leading "Lettera Decretale" genre prefix and cuts at ", per "', () => {
    // 'Lettera Decretale Geminata Laetitia, per la Canonizzazione di Don Giovanni Bosco'
    // (pius-xi/letters, docSlug geminata-laetitia).
    expect(incipitOf('Lettera Decretale Geminata Laetitia, per la Canonizzazione di Don Giovanni Bosco'))
      .toBe('Geminata Laetitia');
  });

  it('cuts at a bare " al " the same way as the four other address prepositions', () => {
    // Thirteen real Pius XI letters-shelf headings share the shape 'Lettera <Incipit> al
    // <addressee>...' with no connector between the incipit and the address at all -- each
    // confirmed genuine by its own URL slug matching the words before 'al'.
    expect(incipitOf('Lettera Quamvis Nostra al Cardinale Presbitero Sebastiano Leme de Silveira Cintra'))
      .toBe('Quamvis Nostra');                                            // docSlug quamvis-nostra
    expect(incipitOf('Lettera Ceteriores nos al Reverendo Padre Paolo Jacuzio, in occasione del 50°'))
      .toBe('Ceteriores nos');                                            // docSlug certiores-nos
    expect(incipitOf('Lettera Quando nel principio al Cardinal Pietro Gasparri, in merito ai rapporti'))
      .toBe('Quando nel principio');                                      // docSlug quando-nel-principio
  });

  it('nulls a narrative phrase followed by a comma-introduced address, even though it has the same shape as a genuine "al" heading', () => {
    // Three real Pius XI letters-shelf headings look identical in shape to the 'al'
    // vectors above, but each one's own URL slug is addressee-based rather than
    // incipit-based, proving the words before the comma are narration, not an incipit.
    expect(incipitOf('Lettera Avendo Noi creduto, al Card. Eugenio Pacelli, nominato Segretario di Stato'))
      .toBeNull();                                                        // docSlug card-pacelli
    expect(incipitOf('Lettera Si compie oggi, al Card. Pietro Gasparri, in occasione della presentazione'))
      .toBeNull();                                                        // docSlug dimissioni-gasparri
    expect(incipitOf("Lettera Con grande Nostra, al Card. Bisleti circa l'istituzione di una Commissione"))
      .toBeNull();                                                        // docSlug card-bisleti
  });

  it('does not null a comma-introduced address when fewer than three words precede the comma (Task 13 review)', () => {
    // 'Quod Dilectum, al Card. V. Gracias in occasione dell'adunanza quinquennale
    // dell'Episcopato dell'India' (john-xxiii/apost_letters) has the identical shape to
    // the three Pius XI nulls above, but only two words ('Quod Dilectum') precede the
    // comma -- and its own URL slug is quod-dilectum, incipit-based rather than
    // addressee-based, proving 'Quod Dilectum' genuinely is the incipit. All three Pius
    // XI precedents above have three words before their comma; MID_ADDRESS_MIN_WORDS = 3
    // separates the two groups cleanly.
    expect(incipitOf("Quod Dilectum, al Card. V. Gracias in occasione dell'adunanza quinquennale dell'Episcopato dell'India"))
      .toBe('Quod Dilectum');                                             // docSlug quod-dilectum
  });

  it('nulls a long residue that opens with a bare address article, even with no listed honorific', () => {
    // 'Ai Religiosi del Portogallo che hanno partecipato a Lisbona ad un Convegno sugli
    // stati religiosi di perfezione' (pius-xii/letters, docSlug religiosi-portogallo) has no
    // incipit at all; without this guard a stray ' sugli ' cut would otherwise truncate it to
    // a false twelve-word "incipit" instead of nulling it.
    expect(incipitOf(
      'Ai Religiosi del Portogallo che hanno partecipato a Lisbona ad un Convegno sugli stati religiosi di perfezione',
    )).toBeNull();
  });

  it('does not treat a short bare-article opening as a long address opener', () => {
    // Regression guard: 'Al compimento delle riforme' (four words) must stay a genuine
    // incipit -- the long-address-opener guard above must not fire below the word ceiling.
    expect(incipitOf('Al compimento delle riforme')).toBe('Al compimento delle riforme');
  });

  it('strips "Epistola Apostolica" and "Breve Pontificio" as bare genre prefixes', () => {
    // Both re-added with new evidence (Task 5's review deleted 'Epistola Apostolica' for
    // lack of any at the time): 'Epistola Apostolica all'Episcopato della Bolivia circa lo
    // sviluppo dei Seminari...' (pius-xii/apost_letters, docSlug episcopato-bolivia) and
    // 'Breve Pontificio con il quale San Francesco d'Assisi e Santa Caterina da Siena
    // vengono proclamati Patroni Primari d'Italia' (pius-xii/briefs, docSlug patroni-italia)
    // both have no incipit at all.
    expect(incipitOf("Epistola Apostolica all'Episcopato della Bolivia circa lo sviluppo dei Seminari"))
      .toBeNull();
    expect(incipitOf("Breve Pontificio con il quale San Francesco d'Assisi e Santa Caterina da Siena"))
      .toBeNull();
  });

  it('strips a leading "Messaggio" the same way as other bare genre words', () => {
    // 'Messaggio al Presidente della Polonia' (pius-xii/letters, docSlug presidente-pologna)
    // has no incipit at all.
    expect(incipitOf('Messaggio al Presidente della Polonia')).toBeNull();
  });

  it('recovers an incipit from a bare " in occasione" connector with no comma', () => {
    // 'Auspicantibus Nobis in occasione del Giubileo Straordinario del 1929'
    // (pius-xi/apost_constitutions): confirmed genuine by both its own <i>-italicised
    // heading span and its URL slug (auspicantibus-nobis) on vatican.va.
    expect(incipitOf('Auspicantibus Nobis in occasione del Giubileo Straordinario del 1929'))
      .toBe('Auspicantibus Nobis');
  });

  it('nulls a genre-echoing narrative opener ("Di nostro") after the Motu Proprio prefix', () => {
    // 'Motu Proprio Di nostro moto proprio che contiene la Legge Fondamentale della Città
    // del Vaticano' (pius-xi/motu_proprio, docSlug moto-proprio -- as generic as the genre
    // word itself, evidencing no incipit at all) merely echoes the genre word back at the
    // reader instead of naming a subject.
    expect(incipitOf('Motu Proprio Di nostro moto proprio che contiene la Legge Fondamentale della Città del Vaticano'))
      .toBeNull();
  });

  it('cuts at the literal " che istituisce" connector, recovering an "I <adj> <noun>" incipit', () => {
    // 'Motu Proprio I primitivi cemeteri che istituisce il Pontificio Istituto di
    // Archeologia Cristiana' (pius-xi/motu_proprio, docSlug primitivi-cemeteri) matches the
    // corpus's established 'I <adjective> <noun>' short-incipit pattern with the leading
    // article dropped in the slug, the same as 'I Rapidi Progressi' (docSlug
    // rapidi-progressi) and 'I felici sviluppi' (docSlug felici-sviluppi) elsewhere in this
    // file.
    expect(incipitOf('Motu Proprio I primitivi cemeteri che istituisce il Pontificio Istituto di Archeologia Cristiana'))
      .toBe('I primitivi cemeteri');
  });

  it('cuts at a comma-anchored ", sul " connector, recovering the bare incipit (Task 12 review)', () => {
    // 'Motu Proprio Ad Musicae Sacrae, sul consalidamento del Pontificio Instituto di
    // Musica Sacra' (pius-xi/motu_proprio, docSlug ad-musicae-sacrae) -- missed in Task 8,
    // this previously minted the whole gloss into the id
    // (mag:pius-xi/ad-musicae-sacrae-sul-consalidamento-del-pontificio-instituto-di-musica-sacra-1922).
    // Re-minted to mag:pius-xi/ad-musicae-sacrae-1922 once this connector was added
    // (task-12-report.md's identifier accounting).
    expect(incipitOf('Motu Proprio Ad Musicae Sacrae, sul consalidamento del Pontificio Instituto di Musica Sacra'))
      .toBe('Ad Musicae Sacrae');
  });

  it('cuts at a comma-anchored ", sulle " connector, the feminine-plural sibling of ", sul " (Task 12 round-2 review)', () => {
    // 'Motu Proprio Post datam, sulle facoltà quinquennali degli Ordinari'
    // (pius-xi/motu_proprio, docSlug post-datam) and 'Motu Proprio Cum Proxime, sulle
    // nuove norme a proposito delle riunioni dei cardinali chiamati ad eleggere il nuovo
    // Papa' (pius-xi/motu_proprio, docSlug cum-proxime) -- both previously minted with
    // the whole gloss baked into the id, re-minted to mag:pius-xi/post-datam-1923 and
    // mag:pius-xi/cum-proxime-1922 once this connector was added.
    expect(incipitOf('Motu Proprio Post datam, sulle facoltà quinquennali degli Ordinari'))
      .toBe('Post datam');
    expect(incipitOf('Motu Proprio Cum Proxime, sulle nuove norme a proposito delle riunioni dei cardinali chiamati ad eleggere il nuovo Papa'))
      .toBe('Cum Proxime');
  });

  it('leaves two other real ", sulle "-bearing headings null, unaffected by the new connector', () => {
    // Both are 'Chirografo al Cardinale...' addressee headings, already nulled earlier by
    // the address-opener guard (OPENER_PATTERN) regardless of any gloss connector.
    expect(incipitOf('Chirografo al Cardinale Basilio Pompili, Vicario di Roma, sulle violenze compiute in Russia'))
      .toBeNull();
    expect(incipitOf("Chirografo al Cardinale Gasparri, sulle proposte formulate dalla Commissione Ministeriale circa la legislazione ecclesiastica in Italia"))
      .toBeNull();
  });

  it('never changes a single Leo XIII or Pius X heading (no-op corpus regression check)', () => {
    // The 581-heading Leo XIII/Pius X corpus is byte-identical before and after every rule
    // added in this describe block (verified by hand against tools/fixtures/*.html during
    // Task 8; see task-8-report.md). A representative sample is re-asserted here so a future
    // change to these rules that regresses the pilot corpus fails a fast, local test rather
    // than only being caught by the full harvest.
    for (const h of ['Quanta semper cura', "Dall'alto dell'Apostolico Seggio", 'Al compimento delle riforme']) {
      expect(extractIncipit(h)).toEqual({ title: h, incipit: h });
    }
    expect(incipitOf('Al Card. Pietro Respighi')).toBeNull();
  });
});

describe('extractIncipit against Benedict XV (Task 12 review)', () => {
  it('cuts at a bare " a tutti " address introduction with no comma or preposition-article', () => {
    // 'Ubi Primum a tutti i cattolici del mondo' (benedict-xv/apost_exhortations,
    // docSlug ubi-primum) -- confirmed genuine by the heading's own <i>Ubi Primum</i>
    // markup. Without this connector, the whole gloss was wrongly kept as the incipit.
    expect(incipitOf('Ubi Primum a tutti i cattolici del mondo')).toBe('Ubi Primum');
  });

  it('cuts at a trailing ", Lettera Enciclica" genre restatement the same way as ", Lettera Decretale"', () => {
    // 'In Praeclara Summorum, Lettera Enciclica in occasione del VI centenario della morte
    // di Dante Alighieri' (benedict-xv/encyclicals, docSlug in-praeclara-summorum) -- the
    // Dante encyclical. Without this connector, the bare ' in occasione' connector already
    // in the rule table still cuts, just later, wrongly keeping 'Lettera Enciclica' in the
    // incipit.
    expect(incipitOf('In Praeclara Summorum, Lettera Enciclica in occasione del VI centenario della morte di Dante Alighieri'))
      .toBe('In Praeclara Summorum');
  });

  it('cuts at a comma-anchored ", sul " connector', () => {
    // 'In Africam quisnam, sul martirio subito in Uganda fra il 1885 e il 1887 dai
    // ventidue negri torturati e condannati a morte in quanto cattolici'
    // (benedict-xv/briefs, docSlug africam-quisnam) -- confirmed genuine by fetching the
    // document (task-12-report.md): its own text opens 'In Africam quisnam'.
    expect(incipitOf('In Africam quisnam, sul martirio subito in Uganda fra il 1885 e il 1887 dai ventidue negri torturati e condannati a morte in quanto cattolici'))
      .toBe('In Africam quisnam');
  });

  it("tolerates vatican.va's own 'giungo' date typo without baking the parenthetical into the incipit", () => {
    // 'Inter Suebiae (14 giungo 1920)' (benedict-xv/apost_letters) -- the trailing-date
    // strip in parseShelfIndex depends on parseSourceDate succeeding; once dates.ts
    // recognises 'giungo' (see dates.test.ts), the heading text handed to extractIncipit
    // is just 'Inter Suebiae', not the full string with the date parenthetical attached.
    expect(incipitOf('Inter Suebiae')).toBe('Inter Suebiae');
  });
});
