/**
 * The categories of the *Acta Summi Pontificis* part of the AAS chronological index, and
 * what each corresponds to in the registry (acta reference spec §2.3).
 *
 * A category is read from its heading text, never from a fixed position: the order and
 * the set both vary by year (2015 opens with *Litterae Encyclicae*, 2016 with *Adhortatio
 * Apostolica postsynodalis*; *Consistoria* is absent in 2015, 2016 and 2021). Every heading
 * seen in the ten indexes 2015-2024 and in the six sources of phase 2b-i (AAS 1, 9-I, 23,
 * 50, 70 and the 2012 index; acta volumes spec §2, §5) is listed under the row it belongs
 * to, in the normalised form `normaliseHeading` produces (case-folded, the numeral and
 * the trailing punctuation dropped), with the volume it was seen in; an OCR spelling is
 * listed as the fixture prints it. A heading not listed here is reported by the parser as
 * unseen, not dropped and not guessed at.
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

/** Case-fold a heading, collapse whitespace, drop the roman numeral and dash prefix. */
export function normaliseHeading(text: string): string {
  return text
    .replace(/^\s*[IVXL]+\.?\s*[–-]\s*/, '')
    .replace(/\s+/g, ' ')
    .replace(/[\s,.:]+$/, '')
    .trim()
    .toUpperCase();
}

export const ACTA_CATEGORIES: readonly ActaCategory[] = [
  // The encyclicals shelf, harvested for every pope. Present in 2015 (Laudato si'), 2020
  // (Fratelli tutti) and 2024 (Dilexit nos); Lumen fidei (2013) precedes the range.
  // 1958 files *Ad Apostolorum Principis* (29 June 1958, to the bishops of China) under
  // its own heading *Epistula encyclica*; vatican.va's encyclicals shelf carries it
  // (`mag:pius-xii/ad-apostolorum-principis-1958`), so the heading maps here.
  { id: 'Litterae Encyclicae', headings: ['LITTERAE ENCYCLICAE', 'EPISTULA ENCYCLICA'],
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
  // 2015-2016 print the incipit instead.
  { id: 'Constitutiones Apostolicae', headings: ['CONSTITUTIONES APOSTOLICAE'],
    classes: [{ genre: 'papal-bull', requires: 'apostolic-constitution' }], harvested: 'yes' },
  // The motu_proprio shelf, merged into apost_letters where a document is filed on both:
  // an apostolic-letter bearing `motu-proprio`. A document vatican.va filed on
  // apost_letters only, though titled "in forma di Motu Proprio", lacks the characteristic
  // and is reported as a class mismatch rather than matched (spec §4.3 -- the matcher is
  // never loosened to absorb a filing difference).
  // The volumes head the category *Motu proprio* alone (1909 `V. - MOTU PROPRIO.`, 1917
  // `III. - MOTU PROPRIO.`, 1931, 1958); the 2012 index sets the words in guillemets.
  { id: 'Litterae Apostolicae Motu proprio datae',
    headings: ['LITTERAE APOSTOLICAE MOTU PROPRIO DATAE', 'LITTERAE APOSTOLICAE «MOTU PROPRIO» DATAE', 'MOTU PROPRIO'],
    classes: [{ genre: 'apostolic-letter', requires: 'motu-proprio' }], harvested: 'yes' },
  // The apost_letters shelf proper: beatification letters and the Latin-incipit tail. A
  // document bearing `motu-proprio` belongs to the category above, so it is excluded here.
  { id: 'Litterae Apostolicae', headings: ['LITTERAE APOSTOLICAE'],
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
  { id: 'Litterae Decretales', headings: ['LITTERAE DECRETALES'],
    classes: [{ genre: 'papal-bull', excludes: 'apostolic-constitution' }], harvested: 'partly' },
  // Anticipated by the spec (§2.2) for other years; not printed in any index 2015-2024.
  { id: 'Bullae', headings: ['BULLAE'],
    classes: [{ genre: 'papal-bull', excludes: 'apostolic-constitution' }], harvested: 'partly' },
  // Ordinary papal correspondence: the letters shelf, harvested for Leo XIII, Pius X,
  // Pius XI, Pius XII and John Paul I (pontiffs.ts) and out of scope for the others (#4),
  // hence `partly`: the matcher attempts every entry, and the creator creates only for a
  // pope whose letters shelf is harvested (create.ts). The volumes spell it *Epistolae*
  // (1909 `IV. - EPISTOLAE.`, 1917 `V. - EPISTOLAE.`, 1931 `VII. - EPISTOLAE`).
  { id: 'Epistulae', headings: ['EPISTULAE', 'EPISTULA', 'EPISTOLAE'],
    classes: [{ genre: 'letter' }], harvested: 'partly' },
  // Chirographs have no Genre Registry row (#4). Three spellings across the years, and
  // the 1931 fixture's OCR of the plural (`VI. - CHIROGRAPHE`: two Italian letters of
  // Pius XI to cardinals).
  { id: 'Chirographa', headings: ['CHIROGRAPHA', 'CHIROGRAPHUM', 'CHIROGRAPHI', 'CHIROGRAPHE'],
    classes: [], harvested: 'no' },
  // Papal decrees have no row; vatican.va files several of these on the motu_proprio
  // shelf, where the registry carries them as apostolic-letter + motu-proprio.
  { id: 'Decreta', headings: ['DECRETA', 'DECRETUM'], classes: [], harvested: 'no' },
  // The homilies shelf is not harvested; the eleven World Day for Consecrated Life
  // homilies on the *Messaggi* shelf are the registry's only Francis homilies.
  { id: 'Homiliae', headings: ['HOMILIAE', 'HOMILIA'], classes: [{ genre: 'homily' }], harvested: 'no' },
  // The speeches shelf is out of scope.
  { id: 'Allocutiones', headings: ['ALLOCUTIONES'], classes: [{ genre: 'discourse-address' }], harvested: 'no' },
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
  { id: 'Nuntii', headings: ['NUNTII', 'NUNTII SCRIPTO DATI'], classes: [{ genre: 'message' }, { genre: 'urbi-et-orbi' }], harvested: 'partly' },
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
  { id: 'Nuntii radiophonici', headings: ['NUNTII RADIOPHONICI', 'NUNCIUM RADIOPHONICUM', 'NUNTII RADIOTELEVISIFICI'],
    classes: [{ genre: 'message' }, { genre: 'urbi-et-orbi' }], harvested: 'partly' },
  // 1978's congratulatory messages to cardinals on their jubilees (`VIII - NUNTII
  // GRATULATORII`; John Paul I's single `V - NUNTIUS GRATULATORIUS`): messages on no
  // harvested shelf.
  { id: 'Nuntii gratulatorii', headings: ['NUNTII GRATULATORII', 'NUNTIUS GRATULATORIUS'],
    classes: [{ genre: 'message' }], harvested: 'no' },
  // John XXIII's two telegrams of 29 October 1958 to Cardinals Mindszenty and Stepinac
  // (1958 `VI - NUNTII TELEGRAPHICI`); no row.
  { id: 'Nuntii telegraphici', headings: ['NUNTII TELEGRAPHICI'], classes: [], harvested: 'no' },
  // Consistory announcements, homilies and title assignments; no row. 1917 numbers the
  // heading among the pope's categories as `IX. - ACTA SACRI CONSISTORII.` (the parser
  // does not take it for a part heading); 1958 prints `IX - SACRA CONSISTORIA`.
  { id: 'Consistoria', headings: ['CONSISTORIA', 'CONSISTORIUM', 'ACTA SACRI CONSISTORII', 'SACRA CONSISTORIA'], classes: [], harvested: 'no' },
  // Concordats and agreements with states; no row. Singular in 1958 and 1978.
  { id: 'Conventiones', headings: ['CONVENTIONES', 'CONVENTIO'], classes: [], harvested: 'no' },
  // Rescripts and notes of the Secretariat of State; no row, and dated sub-lists whose
  // entries can lack a page number.
  { id: 'Secretaria Status', headings: ['SECRETARIA STATUS'], classes: [], harvested: 'no' },
  // The journeys section re-lists the homilies and addresses of each journey under
  // "Dies N." lines that carry no date of their own; nothing to parse, nothing to match.
  { id: 'Itinera Apostolica',
    headings: [
      'ITINERA APOSTOLICA, VISITATIONES PASTORALES, VISITATIONES, ITINERA',
      'ITINERA APOSTOLICA, VISITATIONES PASTORALES, VISITATIONES, PEREGRINATIONES, ITINERA',
      'ITINERA APOSTOLICA, VISITATIONES PASTORALES, ITINERA',
    ],
    classes: [], harvested: 'no' },
  // One-off categories, each printed in a single year; no row for any of them.
  { id: 'Rescriptum', headings: ['RESCRIPTUM'], classes: [], harvested: 'no' },
  { id: 'Declarationes communes', headings: ['DECLARATIONES COMMUNES', 'DECLARATIO COMMUNIS'],
    classes: [], harvested: 'no' },
  { id: 'Meditatio', headings: ['MEDITATIO'], classes: [], harvested: 'no' },
  { id: 'Documentum', headings: ['DOCUMENTUM'], classes: [], harvested: 'no' },
  // 2019's bare *Adhortatio* is the joint appeal of Francis and Mohammed VI on Jerusalem,
  // not an apostolic exhortation -- kept apart from the row above.
  { id: 'Adhortatio', headings: ['ADHORTATIO'], classes: [], harvested: 'no' },
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
