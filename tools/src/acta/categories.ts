/**
 * The categories of the *Acta Summi Pontificis* part of the AAS chronological index, and
 * what each corresponds to in the registry (acta reference spec §2.3).
 *
 * A category is read from its heading text, never from a fixed position: the order and
 * the set both vary by year (2015 opens with *Litterae Encyclicae*, 2016 with *Adhortatio
 * Apostolica postsynodalis*; *Consistoria* is absent in 2015, 2016 and 2021). Every heading
 * seen in the ten indexes 2015-2024, in the six sources of phase 2b-i (AAS 1, 9-I, 23,
 * 50, 70 and the 2012 index; acta volumes spec §2, §5), in the twenty-six volumes of
 * 1932-1957 (AAS 24-49, phase 2b-ii-a, spec §9) and in the nineteen volumes of 1959-1977
 * (AAS 51-69, phase 2b-ii-b: John XXIII and Paul VI) is listed under the row it belongs to,
 * in the normalised form `normaliseHeading` produces (case-folded, the numeral and the
 * trailing punctuation dropped, the OCR's accents stripped), with the volume it was seen
 * in; an OCR spelling is listed as the fixture prints it. A heading not listed here is
 * reported by the parser as unseen, not dropped and not guessed at. Two headings cover
 * two classes of act at once (*Adhortatio*, *Hortationes*): each is a `partly` row the
 * matcher attempts and the creator never creates from (create.ts, NOT_CREATED).
 *
 * `harvested` says whether the registry harvests the class today, which decides whether an
 * unmatched entry is a finding to list in full (`yes`, `partly`) or a count for a future
 * harvest (`no`). `partly` marks a class only part of which is on a harvested shelf: the
 * bulls shelf holds bulls of indiction but no canonisation decretals, the *Messaggi*
 * harvest covers the annual series but not the year-partitioned pont-messages shelf (#4),
 * and the *letters* shelf is harvested for five popes (pontiffs.ts) and not the others.
 * Whether an entry of a `partly` category is *created* is decided per pope by create.ts.
 */

/** A genre class: a genre id plus a characteristic the document must carry, or must not. */
export interface GenreClass {
  genre: string;
  /** The document must carry this characteristic (e.g. `motu-proprio`). */
  requires?: string;
  /** The document must not carry this characteristic. */
  excludes?: string;
}

export interface ActaCategory {
  /** The canonical name, singular or plural as the 2023 index prints it. */
  id: string;
  /** Every heading seen for this category, as `normaliseHeading` renders it. */
  headings: readonly string[];
  /**
   * The registry classes the category corresponds to -- usually one; *Nuntii* two, since
   * the index files the Christmas and Easter blessings as a *Nuntius et Benedictio* where
   * the registry keeps its own `urbi-et-orbi` row. Empty when the registry has no row.
   */
  classes: readonly GenreClass[];
  harvested: 'yes' | 'partly' | 'no';
}

/**
 * Case-fold a heading, collapse whitespace, drop the roman numeral and dash prefix -- in
 * the OCR's readings of the numeral too (`IY. -`, `XJV -`, `i. -`, `I r-`; AAS 25, 26, 42,
 * 36 of 1933-1950) -- and the OCR's trailing quote or hyphen (`LITTERAE DECRETALES'`,
 * `BULLA DOGMATICA-`; AAS 28, 42) and its accents (`EPISTULA ENCÌCLICA`, AAS 41).
 */
export function normaliseHeading(text: string): string {
  return text
    .normalize('NFD').replace(/\p{M}/gu, '')   // the OCR's accents (`EPISTULA ENCÌCLICA`, AAS 41)
    .replace(/^\s*[IVXLJYivxl1]+[.-]?\s*[r•]?\s*[–-]\s*/, '')   // `XI- - ALLOCUTIONES` (AAS 66, 1974)
    .replace(/\s+/g, ' ')
    .replace(/«\s+/g, '«').replace(/\s+»/g, '»')   // `« MOTU PROPRIO» DATAE` (AAS 68, 1976)
    .replace(/[\s,.:'’^-]+$/, '')   // the OCR's `^` after a heading (AAS 52, 1960)
    .trim()
    .toUpperCase();
}

export const ACTA_CATEGORIES: readonly ActaCategory[] = [
  // The encyclicals shelf, harvested for every pope. Present in 2015 (Laudato si'), 2020
  // (Fratelli tutti) and 2024 (Dilexit nos); Lumen fidei (2013) precedes the range.
  // 1958 files *Ad Apostolorum Principis* (29 June 1958, to the bishops of China) under
  // its own heading *Epistula encyclica*; vatican.va's encyclicals shelf carries it
  // (`mag:pius-xii/ad-apostolorum-principis-1958`), so the heading maps here. The
  // volumes of 1932-1957 head the encyclical letters to a nation's bishops `EPISTULAE
  // ENCYCLICAE` (1937: *Mit brennender Sorge*, *Firmissimam constantiam*; 1948: *In
  // multiplicibus curis*; 1950: *Anni sacri*, *Summi maeroris*, *Mirabile illud*) and the
  // singular `EPISTULA ENCYCLICA` (1933: *Dilectissima Nobis*; 1936: *Vigilanti cura*;
  // 1940-1954), every one of them on the encyclicals shelf of its pope; the OCR of AAS 41
  // (1949) reads `II - EPISTULA ENCÌCLICA` (*Redemptoris nostri cruciatus*).
  { id: 'Litterae Encyclicae', headings: ['LITTERAE ENCYCLICAE', 'EPISTULA ENCYCLICA', 'EPISTULAE ENCYCLICAE', 'EPISTULA ENCICLICA'],
    classes: [{ genre: 'encyclical' }], harvested: 'yes' },
  // The apost_exhortations shelf. The index prints the singular when the year has one and
  // qualifies the post-synodal ones (Amoris laetitia, Christus vivit, Querida Amazonia).
  // The 2012 index prints the plural *postsynodales* (Africae munus, Ecclesia in Medio
  // Oriente). The 1917 index heads Benedict XV's peace note to the belligerent powers
  // (*Dès le début*, 1 August 1917) `VIII. - ADHORTATIO` / `AD POPULORUM BELLIGERANTIUM
  // MODERATORES.` (the fixture's OCR reads `BELLIOERANTIUM`); vatican.va files it on the
  // apost_exhortations shelf (`mag:benedict-xv/des-le-debut-1917`), so the two-line
  // heading maps here, unlike 2019's bare *Adhortatio* below.
  { id: 'Adhortationes Apostolicae',
    headings: [
      'ADHORTATIONES APOSTOLICAE', 'ADHORTATIO APOSTOLICA', 'ADHORTATIO APOSTOLICA POSTSYNODALIS',
      'ADHORTATIONES APOSTOLICAE POSTSYNODALES',
      'ADHORTATIO AD POPULORUM BELLIGERANTIUM MODERATORES', 'ADHORTATIO AD POPULORUM BELLIOERANTIUM MODERATORES',
    ],
    classes: [{ genre: 'apostolic-exhortation' }], harvested: 'yes' },
  // The apost_constitutions shelf: a papal-bull bearing `apostolic-constitution` (README,
  // Characteristics). Mostly circumscription erections headed by a toponym from 2017 on;
  // 2015-2016 print the incipit instead. AAS 42 (1950) heads the definition of the
  // Assumption `BULLA DOGMATICA` (*Munificentissimus Deus*, 1 November 1950), which
  // vatican.va's apost_constitutions shelf carries (`mag:pius-xii/munificentissimus-deus-1950`).
  { id: 'Constitutiones Apostolicae', headings: ['CONSTITUTIONES APOSTOLICAE', 'BULLA DOGMATICA'],
    classes: [{ genre: 'papal-bull', requires: 'apostolic-constitution' }], harvested: 'yes' },
  // The motu_proprio shelf, merged into apost_letters where a document is filed on both:
  // an apostolic-letter bearing `motu-proprio`. A document vatican.va filed on
  // apost_letters only, though titled "in forma di Motu Proprio", lacks the characteristic
  // and is reported as a class mismatch rather than matched (spec §4.3 -- the matcher is
  // never loosened to absorb a filing difference).
  // The volumes head the category *Motu proprio* alone (1909 `V. - MOTU PROPRIO.`, 1917
  // `III. - MOTU PROPRIO.`, 1931, 1958); the 2012 index sets the words in guillemets. The
  // OCR of AAS 40 (1948) reads `MOTTI PROPRIO`.
  { id: 'Litterae Apostolicae Motu proprio datae',
    headings: ['LITTERAE APOSTOLICAE MOTU PROPRIO DATAE', 'LITTERAE APOSTOLICAE «MOTU PROPRIO» DATAE', 'MOTU PROPRIO', 'MOTTI PROPRIO'],
    classes: [{ genre: 'apostolic-letter', requires: 'motu-proprio' }], harvested: 'yes' },
  // The apost_letters shelf proper: beatification letters and the Latin-incipit tail. A
  // document bearing `motu-proprio` belongs to the category above, so it is excluded here.
  // The OCR spellings of the volumes: `LITTEEAE APOSTOLICAE` (AAS 28, 1936), `LITTEBAE
  // APOSTOLICAE` (AAS 41, 1949).
  { id: 'Litterae Apostolicae', headings: ['LITTERAE APOSTOLICAE', 'LITTEEAE APOSTOLICAE', 'LITTEBAE APOSTOLICAE'],
    classes: [{ genre: 'apostolic-letter', excludes: 'motu-proprio' }], harvested: 'yes' },
  // A category the index uses for a few apostolic letters that are not beatifications --
  // Patris corde (2021), Admirabile signum (2019), letters to a named addressee that
  // vatican.va files on apost_letters. Singular when the year has one.
  // 1931 spells it *Epistola apostolica* (`II. - EPISTOLA APOSTOLICA`: *Antoniana
  // solemnia*, 1 March 1931, to the bishop of Padua for the centenary of St Anthony).
  { id: 'Epistulae Apostolicae', headings: ['EPISTULAE APOSTOLICAE', 'EPISTULA APOSTOLICA', 'EPISTOLA APOSTOLICA'],
    classes: [{ genre: 'apostolic-letter', excludes: 'motu-proprio' }], harvested: 'yes' },
  // Bulls of indiction (Misericordiae Vultus 2015, Spes non confundit 2024) are on the bulls
  // shelf; the four cardinalatial-title erections of 28 November 2020 that the 2020 index
  // files here are the kind vatican.va files on apost_letters ("sub plumbo", README), so
  // they are expected to report as class mismatches.
  // 1917 heads the class `II. - APOSTOLICAE SUB PLUMBO LITTERAE` (*Universalis Ecclesiae
  // procuratio*, the erection of Brentwood, July 1917 -- on vatican.va's bulls shelf for
  // Benedict XV, which is harvested).
  { id: 'Litterae Apostolicae sub plumbo datae',
    headings: ['LITTERAE APOSTOLICAE SUB PLUMBO DATAE', 'APOSTOLICAE SUB PLUMBO LITTERAE'],
    classes: [{ genre: 'papal-bull', excludes: 'apostolic-constitution' }], harvested: 'partly' },
  // Canonisation decretals. The registry's papal-bull row covers them (README, Table 1:
  // "a bull of canonization bears neither" characteristic), but vatican.va's bulls shelf
  // for Francis carries only the two bulls of indiction, so every decretal is expected to
  // report as a shelf gap.
  // The volumes of 1932-1957 print the canonisation decretals of Pius XI and Pius XII
  // under the same heading, in the OCR spellings `LITTEBAE DECRETALES` (AAS 40, 1948) and
  // `LITTERAE DECKETALES` (AAS 47, 1955) too; neither pope's bulls shelf carries them.
  { id: 'Litterae Decretales', headings: ['LITTERAE DECRETALES', 'LITTEBAE DECRETALES', 'LITTERAE DECKETALES'],
    classes: [{ genre: 'papal-bull', excludes: 'apostolic-constitution' }], harvested: 'partly' },
  // Anticipated by the spec (§2.2) for other years; not printed in any index 2015-2024.
  { id: 'Bullae', headings: ['BULLAE'],
    classes: [{ genre: 'papal-bull', excludes: 'apostolic-constitution' }], harvested: 'partly' },
  // Ordinary papal correspondence: the letters shelf, harvested for Leo XIII, Pius X,
  // Pius XI, Pius XII and John Paul I (pontiffs.ts) and out of scope for the others (#4),
  // hence `partly`: the matcher attempts every entry, and the creator creates only for a
  // pope whose letters shelf is harvested (create.ts). The volumes spell it *Epistolae*
  // (1909 `IV. - EPISTOLAE.`, 1917 `V. - EPISTOLAE.`, 1931 `VII. - EPISTOLAE`).
  // The OCR of AAS 30 (1938) reads `BPISTTJLAE`, that of AAS 34 (1942) `EPISTULAS`.
  { id: 'Epistulae', headings: ['EPISTULAE', 'EPISTULA', 'EPISTOLAE', 'BPISTTJLAE', 'EPISTULAS'],
    classes: [{ genre: 'letter' }], harvested: 'partly' },
  // Chirographs have no Genre Registry row (#4). Three spellings across the years, and
  // the 1931 fixture's OCR of the plural (`VI. - CHIROGRAPHE`: two Italian letters of
  // Pius XI to cardinals); the volumes of 1933-1955 print the singular as `CHIROGRAPHUS`
  // (1933 *Tra i sacrosanti*; 1942 and 1943 the statutes of two Vatican charities; 1947
  // *We have just*, to President Truman; 1954 the Biblical Institute; 1955 *Nella sua*).
  { id: 'Chirographa', headings: ['CHIROGRAPHA', 'CHIROGRAPHUM', 'CHIROGRAPHI', 'CHIROGRAPHE', 'CHIROGRAPHUS'],
    classes: [], harvested: 'no' },
  // Papal decrees have no row; vatican.va files several of these on the motu_proprio
  // shelf, where the registry carries them as apostolic-letter + motu-proprio.
  { id: 'Decreta', headings: ['DECRETA', 'DECRETUM'], classes: [], harvested: 'no' },
  // The homilies shelf is not harvested; the eleven World Day for Consecrated Life
  // homilies on the *Messaggi* shelf are the registry's only Francis homilies. AAS 27
  // (1935) heads the canonisation homily for John Fisher and Thomas More (19 May 1935)
  // `HOMILIA IN SOLLEMNI CANONIZATIONE`.
  { id: 'Homiliae', headings: ['HOMILIAE', 'HOMILIA', 'HOMILIA IN SOLLEMNI CANONIZATIONE'], classes: [{ genre: 'homily' }], harvested: 'no' },
  // The canonisation ceremonies of 1940-1954, each entry a proclamation formula and a
  // homily with a page number each (`B. Ioannae de Lestonnac, Viduae, Proclamatio 211
  // Homilia 212`, AAS 41 (1949)): `IN SOLLEMNI CANONIZATIONE` (1938, Andrew Bobola, John
  // Leonardi and Salvator of Horta), `SOLLEMNIA CANONIZATIONUM` (1940), `SOLLEMNES
  // CANONIZATIONIS` (1947), `SOLLEMNES CANONIZATIONES` (1949-1951), `IN SOLLEMNIBUS
  // CANONIZATIONIBUS` (1954, Pius X). No row; counted.
  // AAS 51 (1959) 942 heads John XXIII's first canonisation (Charles of Sezze and Joaquina
  // de Vedruna, 12 April 1959) `IV - SOLLEMNIA CANONIZATIONIS`; AAS 59 (1967) 1141 Paul VI's
  // of Benilde Romançon `SOLLEMNIS CANONIZATIO`.
  { id: 'Sollemnes canonizationes',
    headings: ['IN SOLLEMNI CANONIZATIONE', 'SOLLEMNIA CANONIZATIONUM', 'SOLLEMNES CANONIZATIONIS', 'SOLLEMNES CANONIZATIONES', 'IN SOLLEMNIBUS CANONIZATIONIBUS',
      'SOLLEMNIA CANONIZATIONIS', 'SOLLEMNIS CANONIZATIO'],
    classes: [], harvested: 'no' },
  // The speeches shelf is out of scope. The OCR of AAS 40 (1948) reads `ALIOCUTIONES`.
  { id: 'Allocutiones', headings: ['ALLOCUTIONES', 'ALIOCUTIONES'], classes: [{ genre: 'discourse-address' }], harvested: 'no' },
  // Pius XII's *Hortationes*: the Lenten address to the parish priests and preachers of
  // Rome (1945 `IUSTRUCTIO PASTORALIS`, the OCR's *Instructio*; 1946 `HORTATIO
  // PASTORALIS`, *Ad Parochos Urbis et concionatores sacri temporis quadragesimalis*, 16
  // March 1946; 1948 `HORTATIONES`, the same of 10 March 1948) and the appeal of 31
  // August 1939 to the governments of Britain, France, Germany, Italy and Poland (`X -
  // HORTATIO`, *Le Souverain Pontife*) -- addresses and a diplomatic message, on no
  // harvested shelf -- beside one apostolic exhortation: the 1948 heading also covers *Ad
  // clerum indigenam* of 28 June 1948, which vatican.va's apost_exhortations shelf carries
  // as *In auspicando super* (`mag:pius-xii/in-auspicando-super-1948`). The row maps to
  // the exhortation class as `partly`, so the matcher writes the reference the shelf
  // evidences and the creator holds the rest (create.ts, NOT_CREATED) instead of minting
  // exhortations from them.
  { id: 'Hortationes', headings: ['HORTATIO', 'HORTATIO PASTORALIS', 'HORTATIONES', 'IUSTRUCTIO PASTORALIS'],
    classes: [{ genre: 'apostolic-exhortation' }], harvested: 'partly' },
  // Prayers the pope composed or recited (1942 `ORATIO`: *Consacrazione al Cuore Immacolato
  // di Maria*, 31 October 1942; 1949 *Pro Anno Sacro Iubilari MCML*; 1953 the Marian Year
  // prayer) and, in 1940, a sermon at the Minerva filed under the same word; no row.
  { id: 'Orationes', headings: ['ORATIO'], classes: [], harvested: 'no' },
  // The early volumes' *Sermones* (1909 `VI. - SERMONES.`; 1917 `VII. - SERMO.`, to the
  // Lenten preachers of Rome; 1931 `VIII. - SERMO`, in the consistory hall after a decree
  // on heroic virtues) are addresses in the vernacular, the class of the speeches shelf,
  // which is out of scope; kept apart from *Homiliae*, which 1909 heads separately.
  { id: 'Sermones', headings: ['SERMONES', 'SERMO'], classes: [{ genre: 'discourse-address' }], harvested: 'no' },
  // Messages: the annual series are harvested (PR #26); the occasional messages on the
  // year-partitioned pont-messages shelf are not yet (#4). The Christmas and Easter *Urbi
  // et Orbi* are filed here as *Nuntius et Benedictio « Urbi et Orbi »* (twenty entries,
  // 2015-2024), where the registry keeps its own `urbi-et-orbi` genre (#15).
  // 1958 and 1978 head the written messages *Nuntii scripto dati*: Paul VI's are the
  // annual series (the 1978 World Day of Peace, Vocations, Lent, Communications and
  // Mission messages, every one on a harvested *Messaggi* sub-shelf), so the heading
  // maps here.
  // AAS 48 (1956) prints the singular `NUNTIUS SCRIPTO DATUS` (to the Rennes eucharistic congress);
  // the OCR of AAS 67 (1975) 764 reads `XI - NUNTII SCRIPTI DATI` (Paul VI's World Day of
  // Peace message of 8 December 1974 opens it). John XXIII's and Paul VI's written messages
  // of 1959-1977 are filed here: the annual series among them (Peace from 1968,
  // Communications from 1967, Vocations from 1964, on the harvested *Messaggi* sub-shelves)
  // match, the occasional ones are on the pont-messages shelf, not harvested.
  { id: 'Nuntii', headings: ['NUNTII', 'NUNTII SCRIPTO DATI', 'NUNTIUS SCRIPTO DATUS', 'NUNTII SCRIPTI DATI'], classes: [{ genre: 'message' }, { genre: 'urbi-et-orbi' }], harvested: 'partly' },
  // Video messages: message + `medium: video` once #27 lands; all on pont-messages today.
  // The 2012 index prints the singular.
  { id: 'Nuntii televisifici', headings: ['NUNTII TELEVISIFICI', 'NUNTIUS TELEVISIFICUS'], classes: [{ genre: 'message' }], harvested: 'partly' },
  // Radio messages, from the first (1931 `IX. - NUNCIUM RADIOPHONICUM`: *Qui arcano Dei*,
  // 12 February 1931, the inauguration of Vatican Radio) through Pius XII's and John
  // XXIII's (1958 `VII - NUNTII RADIOPHONICI`) to Paul VI's radio-television messages
  // (1978 `IX - NUNTII RADIOTELEVISIFICI`). The class is `message`, and among them are
  // the Christmas and Easter *Urbi et Orbi* (1958: *Christifidelibus die Paschatis … Urbi
  // et Orbi*; 1978: *Urbi et Orbi datus ex externo Basilicae Vaticanae podio*), which
  // the registry keeps as `urbi-et-orbi` on the harvested *Messaggi* urbi shelves -- so
  // `partly`, as *Nuntii*, and matched; the occasional ones are on no harvested shelf and
  // nothing is created from the category (create.ts). The count is the evidence for a
  // `medium: radio` (#27), which is not applied here.
  // Pius XII's 153 radio messages of 1940-1957 are the bulk of the class, and AAS 44
  // (1952) heads his radio exhortation to the faithful of Rome (*Urbis christifidelibus
  // data*, 10 February 1952) `ADHORTATIO RADIOPHONICA`: a radio message, filed here and
  // counted for #27 with the rest.
  // The volumes of 1959-1977 (John XXIII, Paul VI) add the singular `NUNTIUS RADIOPHONICUS`
  // (AAS 67 (1975) 764: the Christmas *Urbi et Orbi* of 1974 alone under it), the
  // radio-television headings from 1963 -- `VII - NUNTIUS RADIOTELEVISIFICAS` (the OCR's
  // *radiotelevisificus*, AAS 55 (1963) 1081, Paul VI's message for the 175th year of the
  // Georgetown university; AAS 57 (1965) 1042), `NUNTII RADIOTELEVISIFICT` (AAS 58 (1966)
  // 1217) -- and `NUNTII RADIOPHONICI ET TELEVISIFICI` (AAS 68 (1976) 763). Every one is a
  // broadcast message: filed here, counted for #27.
  { id: 'Nuntii radiophonici',
    headings: ['NUNTII RADIOPHONICI', 'NUNCIUM RADIOPHONICUM', 'NUNTII RADIOTELEVISIFICI', 'ADHORTATIO RADIOPHONICA',
      'NUNTIUS RADIOPHONICUS', 'NUNTIUS RADIOTELEVISIFICAS', 'NUNTII RADIOTELEVISIFICT', 'NUNTII RADIOPHONICI ET TELEVISIFICI'],
    classes: [{ genre: 'message' }, { genre: 'urbi-et-orbi' }], harvested: 'partly' },
  // 1978's congratulatory messages to cardinals on their jubilees (`VIII - NUNTII
  // GRATULATORII`; John Paul I's single `V - NUNTIUS GRATULATORIUS`): messages on no
  // harvested shelf.
  // Paul VI's of 1964-1977, in the OCR spellings `NUNTII GRATULATOMI` (AAS 57 (1965) 1041; 59,
  // 60, 62, 65, 67) and `NUNTII GRATULATORI I` (AAS 69 (1977) 763).
  { id: 'Nuntii gratulatorii', headings: ['NUNTII GRATULATORII', 'NUNTIUS GRATULATORIUS', 'NUNTII GRATULATOMI', 'NUNTII GRATULATORI I'],
    classes: [{ genre: 'message' }], harvested: 'no' },
  // John XXIII's two telegrams of 29 October 1958 to Cardinals Mindszenty and Stepinac
  // (1958 `VI - NUNTII TELEGRAPHICI`); Pius XII's of 1955 and 1956 (singular in 1955); no row.
  { id: 'Nuntii telegraphici', headings: ['NUNTII TELEGRAPHICI', 'NUNTIUS TELEGRAPHICUS'], classes: [], harvested: 'no' },
  // Consistory announcements, homilies and title assignments; no row. 1917 numbers the
  // heading among the pope's categories as `IX. - ACTA SACRI CONSISTORII.` (the parser
  // does not take it for a part heading); 1958 prints `IX - SACRA CONSISTORIA`; the
  // volumes of 1934-1948 print `SACRUM CONSISTORIUM` for a year with one, and the OCR of
  // AAS 43 (1951) `SACKA CONSISTORIA`.
  { id: 'Consistoria', headings: ['CONSISTORIA', 'CONSISTORIUM', 'ACTA SACRI CONSISTORII', 'SACRA CONSISTORIA', 'SACRUM CONSISTORIUM', 'SACKA CONSISTORIA'], classes: [], harvested: 'no' },
  // Concordats and agreements with states; no row. Singular in 1958 and 1978; `SOLLEMNIS
  // CONVENTIO` for the Austrian concordat (AAS 26, 1934) and the Spanish (AAS 43, 1951),
  // `SOLLEMNES CONVENTIONES` in AAS 32 (1940).
  { id: 'Conventiones', headings: ['CONVENTIONES', 'CONVENTIO', 'SOLLEMNIS CONVENTIO', 'SOLLEMNES CONVENTIONES'], classes: [], harvested: 'no' },
  // Rescripts and notes of the Secretariat of State; no row, and dated sub-lists whose
  // entries can lack a page number.
  { id: 'Secretaria Status', headings: ['SECRETARIA STATUS'], classes: [], harvested: 'no' },
  // The journeys section re-lists the homilies and addresses of each journey under
  // "Dies N." lines that carry no date of their own; nothing to parse, nothing to match.
  // Paul VI's journeys are headed one by one in the volumes: `PEREGRINATIO SUMMI PONTIFICIS
  // IN PALAESTINAM` (AAS 56 (1964) 1057, January 1964), `SUMMI PONTIFICIS PEREGRINANTIS ITER
  // IN INDIAM` (Bombay, December 1964; AAS 57 (1965) 1036, whose lines are dated *Dies N.*
  // as the 2015-2024 journeys are, so no entry closes under it), `SUMMI PONTIFICIS PEREGRINANTE ITER
  // IN LUSITANIAM` (Fatima, May 1967) and `SUMMI PONTIFICIS ITER IN TURCARUM REMPUBLICAM`
  // (July 1967; AAS 59 (1967) 1150), `SUMMI PONTIFICIS PEREGRINANTE ITER IN COLUMBIAM`
  // (Bogotá, August 1968; AAS 60 (1968) 843), `SUMMI PONTIFICIS PEREGRINANTES ITER IN ASIAM
  // ET OCEANIAM` (November-December 1970, 83 entries; AAS 63 (1971) 969-975): the homilies
  // and addresses of the journey, each with a page, as the 2015-2024 journeys section
  // re-lists them. Nothing to match, nothing to create.
  { id: 'Itinera Apostolica',
    headings: [
      'ITINERA APOSTOLICA, VISITATIONES PASTORALES, VISITATIONES, ITINERA',
      'ITINERA APOSTOLICA, VISITATIONES PASTORALES, VISITATIONES, PEREGRINATIONES, ITINERA',
      'ITINERA APOSTOLICA, VISITATIONES PASTORALES, ITINERA',
      'PEREGRINATIO SUMMI PONTIFICIS IN PALAESTINAM',
      'SUMMI PONTIFICIS PEREGRINANTIS ITER IN INDIAM',
      'SUMMI PONTIFICIS PEREGRINANTE ITER IN LUSITANIAM',
      'SUMMI PONTIFICIS ITER IN TURCARUM REMPUBLICAM',
      'SUMMI PONTIFICIS PEREGRINANTE ITER IN COLUMBIAM',
      'SUMMI PONTIFICIS PEREGRINANTES ITER IN ASIAM ET OCEANIAM',
    ],
    classes: [], harvested: 'no' },
  // One-off categories, each printed in a single year; no row for any of them.
  // AAS 66 (1974) 764 heads the instruction on the pontifical secret (4 February 1974)
  // `RESCRIPTUM EX AUDIENTIA`; AAS 55 (1963) and 56-57 print `RESCRIPTUM` alone.
  { id: 'Rescriptum', headings: ['RESCRIPTUM', 'RESCRIPTUM EX AUDIENTIA'], classes: [], harvested: 'no' },
  // AAS 57 (1965) 1043: `XX - DECLARATIO`, the declaration of 28 November 1964 on the
  // interpretation of n. 23 of the motu proprio *Pastorale munus* -- one act, not a joint
  // declaration (those have their own row below); no registry row.
  { id: 'Declaratio', headings: ['DECLARATIO'], classes: [], harvested: 'no' },
  // The opening and closing rites of the Second Vatican Council, headed on their own in
  // the pope's part: `IN SOLLEMNI RITU INEUNDI CONCILII OECUMENICI VATICANI SECUNDI` (AAS 54
  // (1962) 892, John XXIII's *Gaudet Mater Ecclesia* of 11 October 1962; the OCR breaks
  // *oecumenici* as `OECU MENICI`) and `IN SOLLEMNI RITU CONCLUDENDI CONCILII OECUMENICI
  // VATICANI II` (AAS 58 (1966) 1204, Paul VI's allocutions of 7 and 8 December 1965). The
  // council's own acts are in the volumes' *Acta Ss. Oecumenici Concilii* part, which is
  // skipped: the registry carries them under `oec:vatican-ii`, and nothing here is a
  // conciliar document. Addresses of the speeches class, not harvested.
  { id: 'Concilium Vaticanum II (ritus)',
    headings: ['IN SOLLEMNI RITU INEUNDI CONCILII OECU MENICI VATICANI SECUNDI', 'IN SOLLEMNI RITU INEUNDI CONCILII OECUMENICI VATICANI SECUNDI', 'IN SOLLEMNI RITU CONCLUDENDI CONCILII OECUMENICI VATICANI II'],
    classes: [{ genre: 'discourse-address' }], harvested: 'no' },
  // AAS 60 (1968) 836: `I - SOLLEMNIS PROFESSIO FIDEI`, the Credo of the People of God
  // pronounced on 30 June 1968 (`A Paulo VI Pont. Max. pronuntiata ante Basilicam Petrianam
  // die XXX mensis Iunii anno MCMLXVIII … 433`), which vatican.va files on the motu_proprio
  // shelf (`mag:paul-vi/credo-del-popolo-di-dio-1968`, apostolic-letter + motu-proprio).
  // One heading for one act: the row maps to that class as `partly`, so the matcher writes
  // the reference the shelf evidences and the creator never mints from the heading
  // (create.ts, NOT_CREATED) -- the class is the shelf's filing, not the index's word.
  { id: 'Sollemnis professio fidei', headings: ['SOLLEMNIS PROFESSIO FIDEI'],
    classes: [{ genre: 'apostolic-letter', requires: 'motu-proprio' }], harvested: 'partly' },
  { id: 'Declarationes communes', headings: ['DECLARATIONES COMMUNES', 'DECLARATIO COMMUNIS'],
    classes: [], harvested: 'no' },
  { id: 'Meditatio', headings: ['MEDITATIO'], classes: [], harvested: 'no' },
  { id: 'Documentum', headings: ['DOCUMENTUM'], classes: [], harvested: 'no' },
  // A bare *Adhortatio* is, in 2019, the joint appeal of Francis and Mohammed VI on
  // Jerusalem -- not an apostolic exhortation -- and, in AAS 46 (1954), Pius XII's *I
  // rapidi progressi* to the ordinaries of Italy on television (1 January 1954), which
  // vatican.va's apost_exhortations shelf carries (`mag:pius-xii/i-rapidi-progressi-1954`).
  // One heading, two classes of act: the row maps to the exhortation class as `partly`,
  // so the 1954 entry matches the shelf record and the 2019 appeal, unmatched, is held by
  // the creator (NOT_CREATED) rather than minted as an exhortation. Kept apart from the
  // *Adhortationes Apostolicae* row, which the creator creates from.
  { id: 'Adhortatio', headings: ['ADHORTATIO'], classes: [{ genre: 'apostolic-exhortation' }], harvested: 'partly' },
  { id: 'Statuta', headings: ['STATUTA'], classes: [], harvested: 'no' },
  { id: 'Lex S.C.V.', headings: ['LEX S.C.V'], classes: [], harvested: 'no' },
  { id: 'Nota', headings: ['NOTA'], classes: [], harvested: 'no' },
  { id: 'Vicariatus', headings: ['VICARIATUS URBIS', 'VICARIATUS CIVITATIS VATICANAE'],
    classes: [], harvested: 'no' },
];

const BY_HEADING = new Map<string, ActaCategory>();
for (const c of ACTA_CATEGORIES) for (const h of c.headings) BY_HEADING.set(h, c);

/** The category a normalised heading belongs to, or null when the heading is unseen. */
export function categoryForHeading(heading: string): ActaCategory | null {
  return BY_HEADING.get(normaliseHeading(heading)) ?? null;
}

export const categoryById = (id: string): ActaCategory | undefined =>
  ACTA_CATEGORIES.find((c) => c.id === id);
