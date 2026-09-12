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
import { ACTA_HOLDS, curationKey } from './curation.js';
import { ACTA_FIXTURES_RETRIEVED } from './join.js';
import {
  POPE_ISSUERS, shiftDate, toponymStems, type ActaCandidate, type ActaMatchResult,
} from './match.js';
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
  'Epistulae Apostolicae': 'the twelve unmatched are on the year-partitioned letters shelf, not harvested for Francis (#4)',
  // The category maps to two classes (message, urbi-et-orbi) that only the description
  // tells apart, and the occasional messages are on the year-partitioned pont-messages
  // shelf, not harvested (#4).
  'Nuntii': 'occasional messages are on the pont-messages shelf, not harvested (#4); the category maps to two classes',
  'Nuntii televisifici': 'video messages are on the pont-messages shelf, not harvested (#4)',
};

/**
 * The first day of each harvested pontificate, for the entry the index prints under one
 * pope's part with an earlier act's date in brackets and no pope named (`11 Maii 2018
 * [2010 Sept. 19] « Admodum fideli »`: Newman's beatification letter, Benedict XVI's).
 * Election dates from CRPDR.
 */
export const PONTIFICATE_BEGAN: Readonly<Record<string, string>> = {
  'rp:francis-i': '2013-03-13',
  'rp:benedict-xvi': '2005-04-19',
};

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
  /** §2.5: the printed date is not a calendar date. */
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
  | 'id-collision';

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
 * repaired: an OCR-split word (`A rAbICIs`) stays split.
 */
export function printedToponym(toponym: string): string {
  return toponym.toLowerCase().replace(/(^|[\s–-])(\p{L})/gu, (_, sep: string, c: string) => sep + c.toUpperCase());
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

const titleHasToponym = (title: string, toponym: string): boolean => {
  const words = `-${slugify(title)}-`;
  return toponymStems(toponym).some((stem) => words.includes(`-${stem}`));
};

/** The one genre class a created category maps to (CREATED_CATEGORIES admits no other). */
const classOf = (category: ActaCategory): GenreClass | null =>
  category.classes.length === 1 ? category.classes[0]! : null;

/** The record for an entry that passed every rule (spec §4). */
export function toActaDocument(entry: ActaEntry, issuerId: string, cls: GenreClass, category: ActaCategory, retrieved: string): DocumentRecord {
  const provisional = entry.incipit === null;
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
    source: { url: null, shelf: actaShelf(entry.year), retrieved },
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
  record.acta = { series: entry.series, volume: entry.volume, year: entry.year, page: entry.page };
  return record;
}

/**
 * Entries -> candidate records, applying §2-§5 to the join's result (whose entries carry
 * the curated date corrections already). `docs` are the shelf documents the guard looks
 * at; the created records are not among them. Deterministic: the output follows the
 * entries' order, and every decision is a rule or a curated row.
 */
export function createFromActa(
  result: ActaMatchResult, docs: DocumentRecord[], retrieved: string = process.env.RETRIEVED ?? ACTA_FIXTURES_RETRIEVED,
): ActaCreation {
  const byIssuerDate = new Map<string, DocumentRecord[]>();
  const byIssuerSlug = new Map<string, DocumentRecord[]>();
  for (const d of docs) {
    const k = `${d.issuerId}|${d.date}`;
    byIssuerDate.set(k, [...(byIssuerDate.get(k) ?? []), d]);
    if (d.incipit !== undefined) {
      const s = `${d.issuerId}|${slugify(d.incipit)}`;
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

  for (const u of result.unmatched) {
    const entry = u.entry;
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
    // §2.5 -- the date.
    if (!isCalendarDate(entry.date)) {
      hold(entry, 'unresolvable-date', `${entry.date} is not a calendar date`);
      continue;
    }
    // §5 -- the owner's holds.
    const curated = ACTA_HOLDS[key];
    if (curated !== undefined) {
      hold(entry, 'curated', curated.reason);
      continue;
    }

    // §3 -- the duplicate guard, against every document of the pope.
    const sameDate = on(issuerId, entry.date);
    const slug = entry.incipit === null ? null : slugify(entry.incipit);
    const classMismatch = sameDate.filter((d) =>
      (slug !== null && ((d.incipit !== undefined && slugify(d.incipit) === slug) || titleContainsIncipit(d.title, entry.incipit!)))
      || (entry.toponym !== null && titleHasToponym(d.title, entry.toponym)));
    if (classMismatch.length) {
      hold(entry, 'class-mismatch', `a same-date record carries the entry's ${entry.toponym !== null && slug === null ? 'toponym' : 'incipit'} as ${classMismatch.map((d) => `${d.genre}${d.characteristics?.length ? '+' + d.characteristics.join('+') : ''}`).join(', ')}; the shelf and the Acta disagree about the class (discussion #30)`, classMismatch);
      continue;
    }
    const possibleIdentity = sameDate.filter((d) => d.incipit === undefined);
    if (possibleIdentity.length) {
      hold(entry, 'possible-identity', `a same-date record prints no incipit (${possibleIdentity.map((d) => d.genre).join(', ')}); only the documents' own text can say whether it is this act (#31)`, possibleIdentity);
      continue;
    }
    if (slug !== null) {
      const nearMisses = [-1, 1].flatMap((delta) =>
        on(issuerId, shiftDate(entry.date, delta)).filter((d) => d.genre === cls.genre && d.incipit !== undefined && slugify(d.incipit) === slug));
      if (nearMisses.length) {
        hold(entry, 'near-miss', 'a record of the genre a day off carries the same incipit; needs the act\'s own dating formula and a DATE_CORRECTIONS row, never a guess', nearMisses);
        continue;
      }
      const elsewhere = (byIssuerSlug.get(`${issuerId}|${slug}`) ?? [])
        .filter((d) => d.genre === cls.genre || d.date.slice(0, 4) === entry.date.slice(0, 4));
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
      on(issuerId, shiftDate(entry.date, delta)).filter((d) => d.genre === cls.genre && d.incipit === undefined));
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
