/**
 * The categories of the *Acta Summi Pontificis* part of the AAS chronological index, and
 * what each corresponds to in the registry (acta reference spec §2.3).
 *
 * A category is read from its heading text, never from a fixed position: the order and
 * the set both vary by year (2015 opens with *Litterae Encyclicae*, 2016 with *Adhortatio
 * Apostolica postsynodalis*; *Consistoria* is absent in 2015, 2016 and 2021). Every heading
 * seen in the ten indexes 2015-2024 is listed under the row it belongs to, in the
 * normalised form `normaliseHeading` produces; a heading not listed here is reported by
 * the parser as unseen, not dropped and not guessed at.
 *
 * `harvested` says whether the registry harvests the class today, which decides whether an
 * unmatched entry is a finding to list in full (`yes`, `partly`) or a count for a future
 * harvest (`no`). `partly` marks a class only part of which is on a harvested shelf: the
 * bulls shelf holds bulls of indiction but no canonisation decretals, and the *Messaggi*
 * harvest covers the annual series but not the year-partitioned pont-messages shelf (#4).
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
    .replace(/[\s,]+$/, '')
    .trim()
    .toUpperCase();
}

export const ACTA_CATEGORIES: readonly ActaCategory[] = [
  // The encyclicals shelf, harvested for every pope. Present in 2015 (Laudato si'), 2020
  // (Fratelli tutti) and 2024 (Dilexit nos); Lumen fidei (2013) precedes the range.
  { id: 'Litterae Encyclicae', headings: ['LITTERAE ENCYCLICAE'],
    classes: [{ genre: 'encyclical' }], harvested: 'yes' },
  // The apost_exhortations shelf. The index prints the singular when the year has one and
  // qualifies the post-synodal ones (Amoris laetitia, Christus vivit, Querida Amazonia).
  { id: 'Adhortationes Apostolicae',
    headings: ['ADHORTATIONES APOSTOLICAE', 'ADHORTATIO APOSTOLICA', 'ADHORTATIO APOSTOLICA POSTSYNODALIS'],
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
  { id: 'Litterae Apostolicae Motu proprio datae', headings: ['LITTERAE APOSTOLICAE MOTU PROPRIO DATAE'],
    classes: [{ genre: 'apostolic-letter', requires: 'motu-proprio' }], harvested: 'yes' },
  // The apost_letters shelf proper: beatification letters and the Latin-incipit tail. A
  // document bearing `motu-proprio` belongs to the category above, so it is excluded here.
  { id: 'Litterae Apostolicae', headings: ['LITTERAE APOSTOLICAE'],
    classes: [{ genre: 'apostolic-letter', excludes: 'motu-proprio' }], harvested: 'yes' },
  // A category the index uses for a few apostolic letters that are not beatifications --
  // Patris corde (2021), Admirabile signum (2019), letters to a named addressee that
  // vatican.va files on apost_letters. Singular when the year has one.
  { id: 'Epistulae Apostolicae', headings: ['EPISTULAE APOSTOLICAE', 'EPISTULA APOSTOLICA'],
    classes: [{ genre: 'apostolic-letter', excludes: 'motu-proprio' }], harvested: 'yes' },
  // Bulls of indiction (Misericordiae Vultus 2015, Spes non confundit 2024) are on the bulls
  // shelf; the four cardinalatial-title erections of 28 November 2020 that the 2020 index
  // files here are the kind vatican.va files on apost_letters ("sub plumbo", README), so
  // they are expected to report as class mismatches.
  { id: 'Litterae Apostolicae sub plumbo datae', headings: ['LITTERAE APOSTOLICAE SUB PLUMBO DATAE'],
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
  // Ordinary papal correspondence: the letters shelf, out of scope for Francis (#4).
  { id: 'Epistulae', headings: ['EPISTULAE', 'EPISTULA'],
    classes: [{ genre: 'letter' }], harvested: 'no' },
  // Chirographs have no Genre Registry row (#4). Three spellings across the years.
  { id: 'Chirographa', headings: ['CHIROGRAPHA', 'CHIROGRAPHUM', 'CHIROGRAPHI'],
    classes: [], harvested: 'no' },
  // Papal decrees have no row; vatican.va files several of these on the motu_proprio
  // shelf, where the registry carries them as apostolic-letter + motu-proprio.
  { id: 'Decreta', headings: ['DECRETA', 'DECRETUM'], classes: [], harvested: 'no' },
  // The homilies shelf is not harvested; the eleven World Day for Consecrated Life
  // homilies on the *Messaggi* shelf are the registry's only Francis homilies.
  { id: 'Homiliae', headings: ['HOMILIAE'], classes: [{ genre: 'homily' }], harvested: 'no' },
  // The speeches shelf is out of scope.
  { id: 'Allocutiones', headings: ['ALLOCUTIONES'], classes: [{ genre: 'discourse-address' }], harvested: 'no' },
  // Messages: the annual series are harvested (PR #26); the occasional messages on the
  // year-partitioned pont-messages shelf are not yet (#4). The Christmas and Easter *Urbi
  // et Orbi* are filed here as *Nuntius et Benedictio « Urbi et Orbi »* (twenty entries,
  // 2015-2024), where the registry keeps its own `urbi-et-orbi` genre (#15).
  { id: 'Nuntii', headings: ['NUNTII'], classes: [{ genre: 'message' }, { genre: 'urbi-et-orbi' }], harvested: 'partly' },
  // Video messages: message + `medium: video` once #27 lands; all on pont-messages today.
  { id: 'Nuntii televisifici', headings: ['NUNTII TELEVISIFICI'], classes: [{ genre: 'message' }], harvested: 'partly' },
  // Consistory announcements, homilies and title assignments; no row.
  { id: 'Consistoria', headings: ['CONSISTORIA', 'CONSISTORIUM'], classes: [], harvested: 'no' },
  // Concordats and agreements with states; no row.
  { id: 'Conventiones', headings: ['CONVENTIONES'], classes: [], harvested: 'no' },
  // Rescripts and notes of the Secretariat of State; no row, and dated sub-lists whose
  // entries can lack a page number.
  { id: 'Secretaria Status', headings: ['SECRETARIA STATUS'], classes: [], harvested: 'no' },
  // The journeys section re-lists the homilies and addresses of each journey under
  // "Dies N." lines that carry no date of their own; nothing to parse, nothing to match.
  { id: 'Itinera Apostolica',
    headings: [
      'ITINERA APOSTOLICA, VISITATIONES PASTORALES, VISITATIONES, ITINERA',
      'ITINERA APOSTOLICA, VISITATIONES PASTORALES, VISITATIONES, PEREGRINATIONES, ITINERA',
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
  { id: 'Lex S.C.V.', headings: ['LEX S.C.V.'], classes: [], harvested: 'no' },
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
