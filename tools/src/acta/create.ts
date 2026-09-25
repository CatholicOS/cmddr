/**
 * AAS-only documents (AAS-only documents spec, phase 2a of #25): the acts the *Acta
 * Apostolicae Sedis* chronological index names in a category the registry harvests, and
 * which the vatican.va shelves lack, become documents of their own -- id minted from the
 * *Acta* incipit by the shelf's rule, title the index's own entry, `source.shelf`
 * `aas/{year}`, `acta` set -- and everything the rules cannot evidence is **held** with a
 * reason and the candidate ids, for the report.
 *
 * An entry becomes a document when all of §2 holds:
 *  1. its category is one the registry creates from the *Acta* (CREATED_CATEGORIES: the
 *     category maps to one genre class whose vatican.va shelf is harvested);
 *  2. that shelf is harvested for the entry's pope (pontiffs.ts), and the date falls in
 *     his pontificate;
 *  3. the join found no match and the entry is not ambiguous, nor one of two claiming a
 *     document;
 *  4. the duplicate guard (§3) finds nothing;
 *  5. the date resolves (after the curated corrections the matcher applies).
 *
 * The duplicate guard is deliberately wider than the matcher: a false negative of the join
 * must not become a second record of an act the shelf already holds, and the shelf is
 * known to disagree with the *Acta* about class -- vatican.va files canonisation decretals
 * on apost_letters as *Lettera Decretale* and three motu proprio on apost_letters alone
 * (discussion #30) -- so *possible identity* looks at every incipit-less record of the
 * pope on the date, whatever its genre, and *same incipit elsewhere* at every record of
 * the genre or of the year. Measured on 2026-09-12 (PR body): the wider reading holds
 * the decretals vatican.va filed as apostolic letters, which a same-class guard would
 * have created twice. A hold is cheap to release by hand; a duplicate is not.
 */
import { slugify } from '../slug.js';
import { mintId, mintProvisionalId } from '../ids.js';
import { POPES } from '../mappings/pontiffs.js';
import { categoryForHeading, type ActaCategory, type GenreClass } from './categories.js';
import { ACTA_HOLDS, ACTA_INDEX_CORRECTIONS, ACTA_REPRINTS, ACTA_SHARED_PAGES, curationKey, overrideKey } from './curation.js';
import { ACTA_FIXTURES_RETRIEVED, citeKey, sourceOfEntry } from './join.js';
import {
  POPE_ISSUERS, incipitSlug, isMonthOnly, shiftDate, titleHasToponym, type ActaCandidate, type ActaMatchResult,
} from './match.js';
import { ACTA_POPES } from './popes.js';
import type { ActaEntry } from './index.js';
import type { DocumentRecord } from '../types.js';

/** The `source.shelf` prefix of a document created from the *Acta*: `aas/2023`. */
export const ACTA_SHELF_PREFIX = 'aas/';
export const actaShelf = (volumeYear: number): string => `${ACTA_SHELF_PREFIX}${volumeYear}`;
export const isActaShelf = (shelf: string | null | undefined): shelf is string =>
  typeof shelf === 'string' && shelf.startsWith(ACTA_SHELF_PREFIX);

/**
 * The categories created from the *Acta*, each with the vatican.va shelf(s) that harvest
 * its class -- a category is created only for a pope whose shelf list (pontiffs.ts)
 * carries one of them (spec §2.1-2.2) -- and the measurement behind the decision. A
 * harvested category absent from this table is held as `not-created-category`, with the
 * reason in NOT_CREATED.
 */
export const CREATED_CATEGORIES: Readonly<Record<string, { shelves: readonly string[]; note: string }>> = {
  'Litterae Encyclicae': { shelves: ['encyclicals'], note: 'every entry 2015-2024 matched; nothing to create' },
  'Adhortationes Apostolicae': { shelves: ['apost_exhortations'], note: 'every entry 2015-2024 matched; nothing to create' },
  'Constitutiones Apostolicae': {
    shelves: ['apost_constitutions', 'apost-constitutions'],
    note: '117 entries 2015-2024 against 49 on the Francis apost_constitutions shelf (phase-1 report §1)',
  },
  'Litterae Apostolicae Motu proprio datae': {
    shelves: ['motu_proprio'],
    note: '58 entries 2015-2024; the four unmatched are the discussion #30 acts and one index misprint',
  },
  'Litterae Apostolicae': {
    shelves: ['apost_letters'],
    note: '206 entries 2015-2024 against 59 plain letters on the Francis apost_letters shelf (phase-1 report §1)',
  },
  // The bull class (papal-bull without apostolic-constitution): categories.ts marks these
  // three `partly`, because the Francis bulls shelf carries only the two bulls of
  // indiction. Decided with a count (spec §2.1): 63 *Litterae Decretales* and 4 *sub
  // plumbo* letters 2015-2024, 0 *Bullae*; every one of the 67 is unmatched, and the
  // registry's papal-bull row is the class of act ("a bull of canonization bears
  // neither" characteristic, README Table 1). vatican.va files nine of the decretals on
  // apost_letters as *Lettera Decretale* -- the guard holds those as possible identities,
  // since the shelf records print no incipit -- and the rest nowhere; the bulls shelf is
  // harvested for Francis, so the class is created.
  'Litterae Decretales': {
    shelves: ['bulls'],
    note: '63 entries 2015-2024, none on the bulls shelf; the papal-bull row is the class (README Table 1)',
  },
  'Litterae Apostolicae sub plumbo datae': {
    shelves: ['bulls'],
    note: '6 entries 2015-2024: the two bulls of indiction matched; the four cardinalatial titles of 28 Nov 2020 are on no shelf',
  },
  'Bullae': { shelves: ['bulls'], note: 'anticipated by the phase-1 spec; printed in no index 2015-2024' },
  // Ordinary correspondence (*Epistulae* / *Epistolae*): the letters shelf, harvested for
  // Pius X, Pius XI, Pius XII and John Paul I among the popes of the AAS (pontiffs.ts;
  // Leo XIII precedes the AAS) and out of scope for the others, so the per-pope shelf
  // rule below creates for those four and holds the rest (Francis's 81 entries of
  // 2015-2024 among them, where before phase 2b the category was not attempted at all).
  // Measured on the 2b-i sample (acta volumes spec §5): 1917 (Benedict XV, held), 1931
  // (Pius XI), 1958 (Pius XII), 1978 (Paul VI and John Paul II held, John Paul I created);
  // the volumes of 1932-1957 (phase 2b-ii-a) create 437 letters of Pius XI and Pius XII,
  // whose letters shelves carry 32 and 95 records.
  'Epistulae': {
    shelves: ['letters'],
    note: 'the letters shelf is harvested for Pius X, Pius XI, Pius XII and John Paul I (pontiffs.ts); held for every other pope',
  },
};

/**
 * Harvested categories deliberately *not* created from the *Acta*, with the reason: each
 * waits for the shelf that carries the class, which is fuller than the *Acta* and brings
 * a URL and a vernacular title (spec §1, the owner's ordering decision).
 */
export const NOT_CREATED: Readonly<Record<string, string>> = {
  // 19 entries 2015-2024: the 7 matched are on apost_letters (Patris corde, Admirabile
  // signum ...); the 12 unmatched were each looked up on vatican.va on 2026-09-12 and are
  // on the year-partitioned `letters` shelf (…/letters/{year}/documents/papa-francesco_
  // 20141221_lettera-cristiani-medio-oriente, _20150302_lettera-vescovi-nigeria,
  // _20160905_regione-pastorale-buenos-aires (the letter and its *Additum*),
  // _20170202_lettera-delegato-ordine-malta, _20170416_santuario-spogliazione-assisi,
  // _20170508_lettera-plenaria-celam, _20170914_lettera-vescovi-giappone,
  // _20171017_lettera-800anni-custodiafrancescana-terrasanta, _20171123_lettera-turkson-
  // encicliche, _20180125_lettera-mons-paglia, _20190106_lettera-accademia-vita), which is
  // not harvested for Francis. Created from the *Acta* they would meet their shelf twins
  // under another class the day `letters` is harvested -- the situation the guard holds.
  // Phase 2b-ii-a: Pius XII's *Epistulae Apostolicae* of 1940-1952 (eight entries) match
  // his apost_letters shelf but for two, held here with the same reason: the class the
  // index names is one vatican.va files on either shelf.
  'Epistulae Apostolicae': 'the twelve unmatched of 2015-2024 are on the year-partitioned letters shelf, not harvested for Francis (#4); the two of Pius XII wait with them',
  // The category maps to two classes (message, urbi-et-orbi) that only the description
  // tells apart, and the occasional messages are on the year-partitioned pont-messages
  // shelf, not harvested (#4).
  'Nuntii': 'occasional messages are on the pont-messages shelf, not harvested (#4); the category maps to two classes',
  'Nuntii televisifici': 'video messages are on the pont-messages shelf, not harvested (#4)',
  // The radio messages of 1931-1978 (categories.ts): the Christmas and Easter Urbi et Orbi
  // among them match the harvested urbi shelves; the rest are occasional messages on no
  // harvested shelf, and the category maps to two classes. The count is #27's evidence.
  'Nuntii radiophonici': 'occasional radio messages are on no harvested shelf; the category maps to two classes; counted for #27 (medium), not applied',
  // One heading, two classes of act (categories.ts): the 2019 joint appeal on Jerusalem
  // is no exhortation, and the 1954 *I rapidi progressi* matched its shelf record.
  'Adhortatio': 'the bare heading covers the 2019 joint appeal on Jerusalem, which is no apostolic exhortation; the 1954 exhortation under it matched the shelf',
  // Pius XII's Lenten addresses to the Roman clergy under a heading that once also
  // covers an apostolic exhortation (*In auspicando super*, matched): the addresses are
  // the speeches class, not harvested, and nothing is minted from the heading.
  'Hortationes': 'the heading covers the Lenten addresses to the parish priests of Rome (speeches, not harvested) beside one apostolic exhortation, which matched the shelf',
  // One heading for one act (AAS 60 (1968) 836): the Credo of the People of God, which
  // vatican.va files on the motu_proprio shelf and the matcher cites there.
  'Sollemnis professio fidei': 'one heading for one act, the Credo of the People of God (30 June 1968), which the motu_proprio shelf carries and the matcher cites; nothing is minted from the heading',
  // One heading for one act (the 2010 index): Benedict XVI's pastoral letter to the
  // Catholics of Ireland, on the year-partitioned letters shelf, not harvested for him.
  'Litterae pastorales': 'one heading for one act, the pastoral letter to the Catholics of Ireland (19 March 2010), which vatican.va files on the year-partitioned letters shelf, not harvested for Benedict XVI (#4)',
  // The briefs of the ASS (categories.ts, phase 2c-i): every ASS entry is held before this
  // table is read (`series-not-created`, ass volumes spec decision 1), and no AAS index
  // prints the heading; whether the class is created is decided in 2c-iii.
  'Brevia': 'printed by the ASS only, whose entries phase 2c-i joins as references and never creates (ass volumes spec, decision 1); creation from the briefs shelf is decided in 2c-iii',
};

/**
 * The first day of each pontificate the index names (popes.ts), for the entry the index
 * prints under one pope's part with an earlier act's date in brackets and no pope named
 * (`11 Maii 2018 [2010 Sept. 19] « Admodum fideli »`: Newman's beatification letter,
 * Benedict XVI's), and for the acts of a predecessor a volume reprints.
 */
export const PONTIFICATE_BEGAN: Readonly<Record<string, string>> =
  Object.fromEntries(ACTA_POPES.map((p) => [p.issuerId, p.began]));

export type HoldReason =
  /** §2.1: a harvested category the registry does not create from the *Acta* (NOT_CREATED). */
  | 'not-created-category'
  /** §2.2: the class's shelf is not harvested for this pope. */
  | 'shelf-not-harvested'
  /** §2.2: the pope heading maps to no harvested issuer. */
  | 'pope-not-harvested'
  /** §2.2: the entry's date precedes the pope's election -- an earlier pontificate's act. */
  | 'date-before-pontificate'
  /** §2.3: several shelf candidates of the class on the date; none evidenced. */
  | 'ambiguous'
  /** §2.3: the entry and another both match one shelf document. */
  | 'claimed-twice'
  /** §2.5: the printed date is not a calendar date -- or the index prints the month only (acta volumes spec §4). */
  | 'unresolvable-date'
  /** §5: an ACTA_HOLDS row. */
  | 'curated'
  /** §3: a same-date record carries the entry's incipit or toponym under another class. */
  | 'class-mismatch'
  /** §3: a same-date record prints no incipit, so cannot be told apart from the entry. */
  | 'possible-identity'
  /** §3: a record of the genre a day off carries the same incipit. */
  | 'near-miss'
  /** §3: a record of the genre, or of the year, carries the same incipit on another date. */
  | 'same-incipit-elsewhere'
  /** Two entries of one date share an incipit; the id scheme has no discriminator beyond the full date. */
  | 'id-collision'
  /** The entry's page is cited by another entry or a matched document: one page opens one act (invariant 25) unless the page is curated as shared. */
  | 'page-shared'
  /** The later printing of an act the *Acta* print twice (ACTA_REPRINTS), or an entry the index cites at two pages that no row settles: the citation of record is one reference. */
  | 'reprint'
  /** The OCR has damaged the incipit or toponym (a stray character, a digit, an unbalanced bracket): the line is not the line as printed. */
  | 'ocr-damaged'
  /** An ASS entry (ass volumes spec, decision 1): phase 2c-i joins references only; ASS-born documents are 2c-iii. */
  | 'series-not-created';

export interface ActaHoldRow {
  entry: ActaEntry;
  reason: HoldReason;
  /** The shelf records (or, for an id collision, the other entries' references) the hold rests on. */
  candidates: ActaCandidate[];
  note: string;
}
export interface ActaCreated {
  entry: ActaEntry;
  record: DocumentRecord;
  /** Findings that did not hold the entry but that a reader should see beside it. */
  notes: string[];
}
export interface ActaCreation { created: ActaCreated[]; held: ActaHoldRow[] }

/**
 * A small-caps toponym as the index prints it: the text layer renders small capitals in
 * mixed case (`VuCArien.`, `de sAnCto petro sulA`, `phIlArChIIs A rAbICIs unItIs`), and
 * the printed form is an initial capital and lower case for each word. Nothing else is
 * repaired: an OCR-split word (`A rAbICIs`) stays split. The volumes print the toponym in
 * full capitals with the vernacular in parentheses (`SANTAREMENSIS (Obidensis)`,
 * `OLOMUCENSIS et Aliarum`, `CONFINIORIS CALIFORNIAE (Pacensis in California Inferiore)`):
 * each word of capitals takes the same initial-capital form and every other word stays
 * as printed.
 */
export function printedToponym(toponym: string): string {
  // The volumes' mixed-case toponym (`De Nan-King seu Nanchinensis`, `Portalegrensis in
  // Brasilia`, `S. Ludovici de Maragnano`) is printed as it stands.
  if (!/[a-z][A-Z]/.test(toponym) && /^[A-ZÀ-Ý]/.test(toponym) && !/[A-Z]{2}/.test(toponym)) return toponym;
  if (/[a-z][A-Z]/.test(toponym) || !/[A-Z]{2}/.test(toponym)) {
    return toponym.toLowerCase().replace(/(^|[\s–-])(\p{L})/gu, (_, sep: string, c: string) => sep + c.toUpperCase());
  }
  return toponym.replace(/\p{Lu}[\p{Lu}.'’-]+/gu, (w) =>
    w.charAt(0) + w.slice(1).toLowerCase().replace(/([-–])(\p{L})/gu, (_, h: string, c: string) => h + c.toUpperCase()));
}

/**
 * The document's title: the index entry as printed after the date (spec §4) -- the
 * incipit, in its guillemets where the index prints them, a full stop, the description;
 * a toponym in the index's small capitals with the colon or full stop that follows it;
 * a bare description where the entry prints neither.
 */
export function actaTitle(entry: ActaEntry): string {
  const description = entry.description.trim();
  const incipit = entry.incipit === null ? null : entry.quoted ? `« ${entry.incipit} »` : entry.incipit;
  const tail = incipit === null ? description : description === '' ? incipit : `${incipit}. ${description}`;
  if (entry.toponym !== null) {
    const printed = printedToponym(entry.toponym);
    // What follows the toponym on the page: a colon (`Vucarien.:`), or nothing beyond the
    // abbreviation's own full stop (`Chiangraien. In Thailandia`).
    const raw = entry.raw.replace(/\s+/g, ' ');
    const at = raw.indexOf(entry.toponym);
    const colon = at >= 0 && /^\s*:/.test(raw.slice(at + entry.toponym.length));
    const sep = colon ? ':' : printed.endsWith('.') ? '' : '.';
    return tail === '' ? `${printed}${sep}` : `${printed}${sep} ${tail}`;
  }
  return tail;
}

/**
 * An unbalanced bracket, a character outside letters, digits and the index's punctuation,
 * or a lone capital hyphenated to the word after it (`G-UYANAE`, AAS 51 (1959) 21;
 * `G-AUHATINAE`, AAS 62 (1970) 29: the OCR's mark inside a see's name).
 */
export const ocrDamaged = (text: string): boolean =>
  /[^\p{L}\p{N}\s.,;:'’"«»!?()–—-]/u.test(text)
  || /(?:^|\s)\p{Lu}-\p{Lu}/u.test(text)
  // A lone capital before the dash of a double see (`S - KETAËNSIS (Navrongensis)`, AAS 48
  // (1956) 862: the OCR's fragment of *Tamalensis*, the rest of the word lost on the line
  // before) is a see the page does not print so.
  || /^\p{Lu}\s+[–-]\s/u.test(text)
  || (text.match(/\(/g) ?? []).length !== (text.match(/\)/g) ?? []).length;
/**
 * An incipit the OCR of a volume has damaged, beyond `ocrDamaged`: a mark no incipit carries
 * (`Providet!tissimum Deum`, `Honesta"quaelibet`, `I'e?-agenti`, `a Albae iam»`), a digit, a
 * full stop inside it that no abbreviation explains (`Quae. feliciter`; `Tui in S. C. de
 * Propaganda Fide` is whole), a lower-case or non-letter initial (`ut tibi iisque`,
 * `loubilaenm Maximum`, `.Altissimus creavit`), a lone initial with a full stop (`A.
 * Minoriticae`) -- measured on the volumes of 1932-1957. A record minted from such a
 * reading would carry an id the page does not print. The index PDFs are typeset, not
 * recognised, and their incipits (`Lex N. DCXXVI`, `Il 30 novembre 2019`) are read as printed.
 */
export const incipitDamaged = (incipit: string): boolean =>
  /[!?"«»ß$§%&*=+\d]/.test(incipit) || /(?<![A-Z])\.(?!$)/.test(incipit) || !/^[\p{Lu}]/u.test(incipit) || /^\p{L}\.\s/u.test(incipit)
  // Phase 2b-ii-c, measured over every volume's incipits: the OCR splits the first letter
  // from its word (`M ementote sermonis`, AAS 88 (1996) 905, the act being *Mementote
  // sermonis*; `H orti conclusi`, AAS 25; `P er celebre in tota`, AAS 27) -- a lone
  // capital before a lower-case word, unless it is a word (*A*, *E*, *O*, the Italian
  // article *I* and *È*: `A Domino est`, `E supremi`, `I rapidi progressi`, `È certo ben
  // noto`) -- and sets a word in
  // capitals (`QUO maius`, AAS 75 (1983) 597; `EX antiqua`, AAS 44; `IS Stat sublimis`, AAS
  // 43) where the index prints mixed case; and no Latin word opens with a J before a
  // consonant (`Jn vita eorum`, AAS 85 (1993) 221: *In vita eorum*, on the shelf).
  || /^(?![AEIOÈÉÀÒÙ]\s)\p{Lu}\s\p{Ll}/u.test(incipit) || /\b\p{Lu}{2,}(?!\.)\b/u.test(incipit) || /\bJ[^aeiouAEIOU\s]/.test(incipit);

const isCalendarDate = (iso: string): boolean => {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return false;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return d.toISOString().slice(0, 10) === iso;
};

const candidateOf = (d: DocumentRecord): ActaCandidate => ({
  id: d.id, date: d.date, genre: d.genre, characteristics: d.characteristics ?? [], title: d.title,
  ...(d.incipit !== undefined ? { incipit: d.incipit } : {}),
});

/** Case- and accent-insensitive: the title's words contain the incipit's words in order. */
export const titleContainsIncipit = (title: string, incipit: string): boolean => {
  const needle = slugify(incipit);
  return needle !== '' && `-${slugify(title)}-`.includes(`-${needle}-`);
};

/**
 * A record "of the genre" for the guards below. `in-forma-brevis` divides the apostolic-letter
 * genre here as `brief` did while it was a genre of its own: a brief of the briefs shelf
 * sharing a common incipit (*Romanorum Pontificum*, Benedict XV, 1916) holds no apostolic
 * letter of another year (1914, 1921), and a brief entry of the ASS none of the shelf's
 * letters. No other characteristic divides a genre for the guards.
 */
const ofGenre = (d: DocumentRecord, cls: GenreClass): boolean =>
  d.genre === cls.genre
  && (d.characteristics ?? []).includes('in-forma-brevis') === (cls.requires === 'in-forma-brevis');

/** The one genre class a created category maps to (CREATED_CATEGORIES admits no other). */
const classOf = (category: ActaCategory): GenreClass | null =>
  category.classes.length === 1 ? category.classes[0]! : null;

/**
 * The record for an entry that passed every rule (spec §4). `source.url` is the
 * whole-volume PDF for a volume source (1909-2002) and null for an index PDF (the
 * fascicle era), `source.retrieved` the fixture's date, both from the sources table
 * (join.ts); `acta.part` is carried for a double volume.
 */
export function toActaDocument(entry: ActaEntry, issuerId: string, cls: GenreClass, category: ActaCategory, retrieved?: string): DocumentRecord {
  const provisional = entry.incipit === null;
  const source = sourceOfEntry(entry);
  const record: DocumentRecord = {
    id: provisional
      ? mintProvisionalId(issuerId, cls.genre, entry.date)
      : mintId(issuerId, entry.incipit!, entry.date),
    title: actaTitle(entry),
    idStatus: provisional ? 'provisional' : 'minted',
    genre: cls.genre,
    issuerId,
    issuerType: 'pope',
    date: entry.date,
    source: {
      url: source?.url ?? null, shelf: actaShelf(entry.year),
      retrieved: retrieved ?? process.env.RETRIEVED ?? source?.retrieved ?? ACTA_FIXTURES_RETRIEVED,
    },
  };
  // No `incipitLang`, whether the incipit is bare or in guillemets. The spec's first
  // draft read a bare incipit as Latin and a guillemet one as vernacular; measured on
  // the fixtures (PR #32), the index's guillemets mark a quotation, not a language --
  // « Venite benedicti », « Nolite sperare », the beatification letters' Latin incipits,
  // are wrapped exactly as « Chi è fedele » is -- so the mark evidences nothing about the
  // language. And the shelf harvest sets `incipitLang` on 0 of its 4,663 minted records:
  // set here, the field would have the AAS-only records as its only source in the
  // registry, inconsistent with everything else. Spec §4 was corrected accordingly.
  if (entry.incipit !== null) record.incipit = entry.incipit;
  if (cls.requires !== undefined) record.characteristics = [cls.requires];
  record.sourceGenreLabel = category.id;
  record.acta = {
    series: entry.series, volume: entry.volume, year: entry.year,
    ...(entry.part ? { part: entry.part } : {}), page: entry.page,
  };
  return record;
}

/**
 * Entries -> candidate records, applying §2-§5 to the join's result (whose entries carry
 * the curated date corrections already). `docs` are the shelf documents the guard looks
 * at; the created records are not among them. Deterministic: the output follows the
 * entries' order, and every decision is a rule or a curated row.
 */
export function createFromActa(
  result: ActaMatchResult, docs: DocumentRecord[], retrieved?: string,
): ActaCreation {
  const byIssuerDate = new Map<string, DocumentRecord[]>();
  const byIssuerSlug = new Map<string, DocumentRecord[]>();
  for (const d of docs) {
    const k = `${d.issuerId}|${d.date}`;
    byIssuerDate.set(k, [...(byIssuerDate.get(k) ?? []), d]);
    if (d.incipit !== undefined) {
      const s = `${d.issuerId}|${incipitSlug(d.incipit)}`;
      byIssuerSlug.set(s, [...(byIssuerSlug.get(s) ?? []), d]);
    }
  }
  const on = (issuer: string, date: string) => byIssuerDate.get(`${issuer}|${date}`) ?? [];

  const held: ActaHoldRow[] = [];
  const created: ActaCreated[] = [];
  const hold = (entry: ActaEntry, reason: HoldReason, note: string, candidates: DocumentRecord[] | ActaCandidate[] = []) =>
    held.push({
      entry, reason, note,
      candidates: candidates.map((c) => ('issuerId' in c ? candidateOf(c) : c)),
    });

  // §2.3: what the join could not evidence stays with the join's report.
  for (const a of result.ambiguous) {
    hold(a.entry, 'ambiguous', `${a.candidates.length} shelf candidates of the class on the date; neither the incipit nor the toponym separates them`, a.candidates);
  }
  for (const c of result.conflicts) {
    for (const e of c.entries) {
      hold(e, 'claimed-twice', `this entry and ${c.entries.length - 1} other both match the shelf document; neither claim is kept`,
        docs.filter((d) => d.id === c.documentId));
    }
  }
  for (const e of result.unknownPope) hold(e, 'pope-not-harvested', `no issuer for the pope heading '${e.pope}'`);
  for (const e of result.reprints) {
    const row = ACTA_REPRINTS[overrideKey(e)]!;
    // The citation of record is printed as a citation and not as its key, in either series
    // (citeKey, join.ts): an ASS row -- `ASS:41:425` for *Sapienti consilio* -- reads `ASS 41
    // (1908) 425` in the hold note the era reports print beside their AAS column.
    hold(e, 'reprint', `the ${row.kind === 'reissue' ? 'later printing' : 'first printing, superseded by the corrigendum'} of an act the Acta print twice; the citation of record is ${citeKey(row.citationOf)} (ACTA_REPRINTS)`);
  }

  for (const u of result.unmatched) {
    const entry = u.entry;
    // The ASS (ass volumes spec, decision 1): every unmatched entry is held, before any other
    // rule reads it; the ambiguous and conflict loops above hold and never create.
    if (entry.series === 'ASS') { hold(entry, 'series-not-created', 'an Acta Sanctae Sedis entry: phase 2c-i joins references only (ass volumes spec §5); creation is decided in 2c-iii from this phase\'s gap report', u.sameDate); continue; }
    const category = categoryForHeading(entry.category);
    if (category === null) continue;   // unseen heading: matchActa never reaches here, reported by the parser
    const key = curationKey(entry);

    // §2.1 -- the category.
    const row = CREATED_CATEGORIES[category.id];
    const cls = classOf(category);
    if (row === undefined || cls === null) {
      hold(entry, 'not-created-category', NOT_CREATED[category.id] ?? `${category.id} is not created from the Acta`, u.sameDate);
      continue;
    }
    // §2.2 -- the pope and his shelves.
    const issuerId = POPE_ISSUERS[entry.pope];
    const pope = issuerId === undefined ? undefined : POPES.find((p) => p.issuerId === issuerId);
    const began = issuerId === undefined ? undefined : PONTIFICATE_BEGAN[issuerId];
    if (issuerId === undefined || pope === undefined || began === undefined) {
      hold(entry, 'pope-not-harvested', `no harvested issuer for the pope heading '${entry.pope}'`);
      continue;
    }
    if (!row.shelves.some((s) => pope.shelves.includes(s))) {
      hold(entry, 'shelf-not-harvested', `the ${row.shelves.join('/')} shelf is not harvested for ${issuerId}`);
      continue;
    }
    if (entry.date < began) {
      hold(entry, 'date-before-pontificate', `${entry.date} precedes the election of ${issuerId} (${began}): an earlier pontificate's act printed in this volume`);
      continue;
    }
    // §2.5 -- the date. A month-only entry (acta volumes spec §4) is matched by incipit
    // within the month, never created: a record needs the day.
    if (isMonthOnly(entry)) {
      hold(entry, 'unresolvable-date', `the index dates the entry to ${entry.date} with no day printed; matched by incipit within the month only, never created`, u.sameDate);
      continue;
    }
    if (entry.date.startsWith('????')) {
      hold(entry, 'unresolvable-date', `the index prints no readable year for the entry (${entry.date}: a ditto with nothing above it, or a token the OCR has broken); a curated correction quoting the act can supply it (curation.ts)`, u.sameDate);
      continue;
    }
    if (!isCalendarDate(entry.date)) {
      hold(entry, 'unresolvable-date', `${entry.date} is not a calendar date`);
      continue;
    }
    // A date the parser read beyond the print (an OCR digit of the year repaired; index.ts
    // `dateNote`): the matcher may find the shelf record on that date, but nothing is
    // minted from a reading -- unless a curated row confirms it against the act's own
    // dating formula (ACTA_INDEX_CORRECTIONS, whose `date` then equals the reading), on
    // this entry or on the entry whose line carried the token, which the dittos inherit.
    const confirmed = ACTA_INDEX_CORRECTIONS[key]?.date === entry.date
      || (entry.dateNoteRef !== undefined && ACTA_INDEX_CORRECTIONS[entry.dateNoteRef]?.date.slice(0, 4) === entry.date.slice(0, 4));
    if (entry.dateNote !== undefined && !confirmed) {
      hold(entry, 'unresolvable-date', `${entry.dateNote}; the date is the parser's reading, not the index's print`, u.sameDate);
      continue;
    }
    // An incipit or toponym the OCR has damaged (`B (IARENSIS`, 1978) would mint an id and
    // a title from a reading the page does not print; held for a curated correction.
    // For an entry printing neither, the head of the description, which the provisional
    // record's title would carry.
    // The head runs to the first full stop or colon that no abbreviation explains (`Planorum
    // S. Martini - Villavicentiensis (De Mitu). - A Vicariatu` is one head).
    const head = entry.incipit === null && entry.toponym === null ? entry.description.split(/(?<![A-Z])[.:]\s/)[0]!.slice(0, 60) : null;
    const fromVolume = sourceOfEntry(entry)?.kind === 'volume';
    // In a volume, a head or toponym that opens with anything but a capital or a guillemet
    // (`-Hodiernos Namurcensis`, `8. Fidei in Argentina`, `privilegiis Basilicae Minoris` --
    // a continuation line read as an entry), or that mixes cases inside a word (`lAbenti`,
    // `BaMasensis`), is the OCR's too.
    const headDamaged = (t: string) => fromVolume && (!/^[\p{Lu}«]/u.test(t) || /\p{Ll}\p{Lu}/u.test(t));
    const damaged = [entry.incipit, entry.toponym, head].find((t) => t !== null
      && (ocrDamaged(t) || (fromVolume && t === entry.incipit && incipitDamaged(t)) || (t !== entry.incipit && headDamaged(t))));
    if (damaged !== undefined) {
      hold(entry, 'ocr-damaged', `the extracted ${damaged === entry.incipit ? 'incipit' : damaged === entry.toponym ? 'toponym' : 'head of the entry'} '${damaged}' carries a character the index does not print; needs a curated reading, never a guess`);
      continue;
    }
    // An act the index cites at two pages (`138, 261`): one page is the citation, and only
    // a curated row (ACTA_REPRINTS) says which; without one, held.
    if (entry.alsoPages !== undefined) {
      const settled = entry.alsoPages.every((pg) => ACTA_REPRINTS[`${entry.series}:${entry.volume}:${pg}`]?.citationOf === overrideKey(entry));
      if (!settled) {
        hold(entry, 'reprint', `the index cites the act at pages ${[entry.page, ...entry.alsoPages].join(', ')}; the citation of record needs an ACTA_REPRINTS row`);
        continue;
      }
    }
    // §5 -- the owner's holds.
    const curated = ACTA_HOLDS[key];
    if (curated !== undefined) {
      hold(entry, 'curated', curated.reason);
      continue;
    }

    // §3 -- the duplicate guard, against every document of the pope.
    const sameDate = on(issuerId, entry.date);
    const slug = entry.incipit === null ? null : incipitSlug(entry.incipit);
    const classMismatch = sameDate.filter((d) =>
      (slug !== null && ((d.incipit !== undefined && incipitSlug(d.incipit) === slug) || titleContainsIncipit(d.title, entry.incipit!)))
      || (entry.toponym !== null && titleHasToponym(d.title, entry.toponym)));
    if (classMismatch.length) {
      hold(entry, 'class-mismatch', `a same-date record carries the entry's ${entry.toponym !== null && slug === null ? 'toponym' : 'incipit'} as ${classMismatch.map((d) => `${d.genre}${d.characteristics?.length ? '+' + d.characteristics.join('+') : ''}`).join(', ')}; the shelf and the Acta disagree about the class (discussion #30)`, classMismatch);
      continue;
    }
    // … and the entry's side of the same shape (phase 2b-ii-c, measured over every era: one
    // case, AAS 91 (1999) 849, `Nova statuta Academiarum theologicarum approbantur` beside
    // the shelf's *Inter munera academiarum* of the day, which vatican.va files on
    // apost_letters without the motu-proprio characteristic): an entry that prints neither
    // incipit nor toponym, beside a same-date record of the genre, cannot be told from it.
    const possibleIdentity = sameDate.filter((d) => d.incipit === undefined
      || (entry.incipit === null && entry.toponym === null && ofGenre(d, cls)));
    if (possibleIdentity.length) {
      hold(entry, 'possible-identity', entry.incipit === null && entry.toponym === null && possibleIdentity.some((d) => d.incipit !== undefined)
        ? `the entry prints no incipit and a same-date record of the genre stands (${possibleIdentity.map((d) => d.id).join(', ')}); only the documents' own text can say whether it is this act (#31)`
        : `a same-date record prints no incipit (${possibleIdentity.map((d) => d.genre).join(', ')}); only the documents' own text can say whether it is this act (#31)`, possibleIdentity);
      continue;
    }
    if (slug !== null) {
      const nearMisses = [-1, 1].flatMap((delta) =>
        on(issuerId, shiftDate(entry.date, delta)).filter((d) => ofGenre(d, cls) && d.incipit !== undefined && incipitSlug(d.incipit) === slug));
      if (nearMisses.length) {
        hold(entry, 'near-miss', 'a record of the genre a day off carries the same incipit; needs the act\'s own dating formula and a DATE_CORRECTIONS row, never a guess', nearMisses);
        continue;
      }
      const elsewhere = (byIssuerSlug.get(`${issuerId}|${slug}`) ?? [])
        .filter((d) => ofGenre(d, cls) || d.date.slice(0, 4) === entry.date.slice(0, 4));
      if (elsewhere.length) {
        hold(entry, 'same-incipit-elsewhere', `a record of the genre, or of the year, carries the same incipit on ${elsewhere.map((d) => d.date).join(', ')}; two acts can share an incipit, but the index and the shelf are known to disagree on a date, and a human decides`, elsewhere);
        continue;
      }
    }

    const record = toActaDocument(entry, issuerId, cls, category, retrieved);
    const notes: string[] = [];
    // Reported, never a hold: an incipit-less shelf record of the genre a day off is the
    // ordinary run of a beatification weekend as often as a date discrepancy.
    const provisionalNearby = [-1, 1].flatMap((delta) =>
      on(issuerId, shiftDate(entry.date, delta)).filter((d) => ofGenre(d, cls) && d.incipit === undefined));
    if (provisionalNearby.length) {
      notes.push(`a provisional shelf record of the genre stands a day off: ${provisionalNearby.map((d) => `${d.id} (${d.date})`).join(', ')}`);
    }
    created.push({ entry, record, notes });
  }

  // Two created records of one issuer, one date and one incipit (the two *Vos autem*
  // decretals of 13 October 2019) cannot both be minted: the identifiers spec's collision
  // rule stops at the full date. Both are held, neither is chosen. Two of one *year* are
  // not a collision -- the orchestrator's collision pass extends both to the full date.
  const byId = new Map<string, ActaCreated[]>();
  for (const c of created) {
    if (c.record.idStatus !== 'minted') continue;
    const k = `${c.record.issuerId}|${slugify(c.record.incipit!)}|${c.record.date}`;
    byId.set(k, [...(byId.get(k) ?? []), c]);
  }
  const collided = new Set<ActaCreated>();
  // One page opens one act (invariant 25): a created record citing a page another entry
  // cites -- a matched shelf record's, or another created record's -- would fail the
  // invariant, and the volumes of 1932-1957 print both shapes behind it: two short
  // letters on one page (AAS 24 (1932) 39, AAS 45 (1953) 91: curated in
  // ACTA_SHARED_PAGES with the page quoted, and let through) and a page number the OCR
  // misread onto another act's page (AAS 42 (1950) 37 for 373 and 375, AAS 43 (1951)
  // 660 for 666, AAS 45 (1953) 782 for one act indexed twice). Held, for the report,
  // until a curated row says which it is.
  const pageKey = (e: ActaEntry) => `${e.series}:${e.volume}${e.part ? `-${e.part}` : ''}:${e.page}`;
  const citedByMatch = new Set(result.matches.map((m) => pageKey(m.entry)));
  const citedByCreated = new Map<string, ActaCreated[]>();
  for (const c of created) citedByCreated.set(pageKey(c.entry), [...(citedByCreated.get(pageKey(c.entry)) ?? []), c]);
  for (const c of created) {
    const key = pageKey(c.entry);
    if (key in ACTA_SHARED_PAGES) continue;
    const others = (citedByCreated.get(key) ?? []).filter((o) => o !== c);
    const byMatch = citedByMatch.has(key);
    if (!byMatch && others.length === 0) continue;
    collided.add(c);
    const who = [byMatch ? 'a matched shelf document' : '', others.length ? `${others.length} other entr${others.length === 1 ? 'y' : 'ies'} of the index` : ''].filter(Boolean).join(' and ');
    hold(c.entry, 'page-shared', `${who} cite${(byMatch ? 1 : 0) + others.length === 1 ? 's' : ''} the same page (${key}); one page opens one act (invariant 25) unless ACTA_SHARED_PAGES quotes the page`,
      result.matches.filter((m) => pageKey(m.entry) === key).map((m) => docs.find((d) => d.id === m.documentId)).filter((d): d is DocumentRecord => d !== undefined));
  }
  for (const group of byId.values()) {
    if (group.length < 2) continue;
    for (const c of group) {
      collided.add(c);
      hold(c.entry, 'id-collision',
        `${group.length} entries of ${c.entry.date} print the incipit *${c.entry.incipit}*; the identifier scheme cannot tell them apart beyond the full date (AAS ${group.map((g) => `${g.entry.volume} (${g.entry.year}) ${g.entry.page}`).join(', ')})`);
    }
  }
  return { created: created.filter((c) => !collided.has(c)), held };
}
