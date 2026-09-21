/**
 * The join between the parsed AAS index entries and the harvested documents (acta
 * reference spec §4.3). For each entry in a harvested category, the candidates are the
 * documents of the same issuer on the same date; one candidate of the category's genre
 * class matches, several are told apart by the incipit slug and then, for a
 * constitution, by the toponym against the title, and what is still ambiguous is
 * reported with its candidates. An entry with no candidate on its date is reported with
 * whatever the issuer has on that date (of any class) and within a day of it; the
 * near-miss is never matched.
 *
 * The matcher never loosens itself to absorb a disagreement between the index and the
 * shelves: a class mismatch (an act the index files as *Motu proprio datae* that the
 * shelf did not file on motu_proprio), a date a day off, a category the shelves do not
 * carry -- each is a finding for the report, not a rule to add here. What it takes on
 * trust is curated (curation.ts), with the evidence quoted beside each row: an index
 * correction, for an entry whose printed date the act's own dating formula contradicts,
 * matched by the corrected date; and a match override, for an entry the class rule sends
 * to the wrong act, matched to the document the row names before the class rule runs.
 *
 * One rule is the volumes' (acta volumes spec §4): an entry the index dates to the month
 * only (a printed month and a blank day, the columnar layout of 1909-1931; the parser
 * gives it a `YYYY-MM` date) matches the one document of the pope and the class in that
 * month whose incipit slug equals the entry's -- the month, the class and the incipit
 * together evidence the identity, and the shelf supplies the day. Two such documents, or
 * none, or an entry without an incipit, leave it unmatched; it is never created.
 */
import { slugify } from '../slug.js';
import { categoryForHeading, type GenreClass } from './categories.js';
import { ACTA_INDEX_CORRECTIONS, ACTA_MATCH_OVERRIDES, ACTA_REPRINTS, ACTA_SHARED_PAGES, curationKey, overrideKey } from './curation.js';
import type { Reprint } from './curation.js';
import { ACTA_POPES } from './popes.js';
import type { ActaEntry } from './index.js';
import type { DocumentRecord } from '../types.js';

/**
 * The index's pope heading (nominative, as the parser renders it) to the CRPDR issuer,
 * from the popes table (popes.ts): 'Pius X' -> 'rp:pius-x', 'Franciscus' ->
 * 'rp:francis-i'. The bracketed pope of the 2018-2021 indexes (`[Benedictus PP. XVI: …]`)
 * renders to the same label as the 2012 and 2020 part heading.
 */
export const POPE_ISSUERS: Readonly<Record<string, string>> =
  Object.fromEntries(ACTA_POPES.map((p) => [p.pope, p.issuerId]));

/**
 * The slug an incipit is compared by. vatican.va's headings of John Paul II's letters and
 * constitutions append the addressee or subject in parentheses to tell two acts of one
 * incipit apart -- `Tanta est (Episcopus Ipialensis)`, `Constat Christifideles (Sanctus
 * Franciscus Assisiensis)`, `Quamdiu fecistis (Columbae Gabriel)` -- and the shelf harvest
 * keeps the whole heading as the incipit (251 shelf records, 170 of them John Paul II's,
 * 28 each of John XXIII and Paul VI, 25 of Pius XII; measured on 2026-09-13). The
 * parenthesis is not the incipit: it is dropped before the slug is taken, on the shelf's
 * side and the index's alike, so the matcher's incipit rule and the creator's guard see
 * *Tanta est* on both (47 more references over 1979-2014, measured against the slug with
 * the parenthesis kept). Nothing else is repaired.
 */
export const incipitSlug = (incipit: string): string => slugify(incipit.replace(/\s*\([^()]*\)\s*$/, ''));

/** Whether the parser dated the entry to the month only (`YYYY-MM`). */
export const isMonthOnly = (e: { date: string }): boolean => e.date.length === 7;
/** Whether the index prints no readable year for the entry (`????-MM-DD`, index.ts): matched only through a curated correction. */
export const isUnprintedYear = (e: { date: string }): boolean => e.date.startsWith('????');

export interface ActaMatch {
  entry: ActaEntry;
  documentId: string;
  /**
   * What decided the match: the only candidate, the incipit slug, the toponym, a curated
   * override, or -- for a month-only entry -- the incipit slug within the month.
   */
  by: 'unique' | 'incipit' | 'toponym' | 'curated' | 'incipit-month';
}
export interface ActaCandidate { id: string; date: string; genre: string | null; characteristics: string[]; title: string; incipit?: string }
export interface ActaAmbiguity { entry: ActaEntry; candidates: ActaCandidate[] }
export interface ActaUnmatched {
  entry: ActaEntry;
  /** What the issuer has on the entry's date, whatever its class. */
  sameDate: ActaCandidate[];
  /** Documents of the entry's class a day before or after (reported, never matched). */
  nearMisses: ActaCandidate[];
}
export interface ActaMatchResult {
  matches: ActaMatch[];
  ambiguous: ActaAmbiguity[];
  unmatched: ActaUnmatched[];
  /** Entries in a category the registry does not harvest, or has no row for: not attempted. */
  skipped: ActaEntry[];
  /** Entries whose pope heading maps to no issuer. */
  unknownPope: ActaEntry[];
  /**
   * Entries the curated reprint table names as the later printing of an act the *Acta*
   * print twice (ACTA_REPRINTS): not attempted, since the act's citation of record is the
   * other printing's; listed by the reports.
   */
  reprints: ActaEntry[];
  /** Documents claimed by more than one entry; none of those claims is kept as a match. */
  conflicts: { documentId: string; entries: ActaEntry[] }[];
  /**
   * Pages two matched documents would cite that ACTA_SHARED_PAGES does not list: one page
   * opens one act (invariant 25) unless the volume was read and the pair curated, so neither
   * reference is written and the page is reported. Two of the era's twenty such pages print
   * one act (AAS 76 (1984) 946, AAS 82 (1990) 43): the OCR's or the index's page for one
   * of the two, which a page correction, not the join, would settle.
   */
  sharedPages: { page: string; matches: ActaMatch[] }[];
  /**
   * Matches a curated reference displaced (ACTA_CURATED_REFERENCES, `supersedes`; join.ts):
   * the entry is a printing of the act that is not its citation of record -- the Italian
   * text of *Ubi arcano Dei consilio* at AAS 15 (1923) 5 -- and the row names the page that
   * is. Neither a claim nor a record, as a reprint is; listed by the reports. Empty until
   * applyCuratedReferences runs.
   */
  superseded: ActaMatch[];
}

const inClass = (d: DocumentRecord, c: GenreClass): boolean =>
  d.genre === c.genre
  && (c.requires === undefined || (d.characteristics ?? []).includes(c.requires))
  && (c.excludes === undefined || !(d.characteristics ?? []).includes(c.excludes));

const candidate = (d: DocumentRecord): ActaCandidate => ({
  id: d.id, date: d.date, genre: d.genre, characteristics: d.characteristics ?? [], title: d.title,
  ...(d.incipit !== undefined ? { incipit: d.incipit } : {}),
});

/** ISO date shifted by `days` (UTC, so no DST step can skip a day). */
export function shiftDate(iso: string, days: number): string {
  const t = Date.UTC(Number(iso.slice(0, 4)), Number(iso.slice(5, 7)) - 1, Number(iso.slice(8, 10)));
  return new Date(t + days * 86_400_000).toISOString().slice(0, 10);
}

/**
 * The stems a printed toponym can take in a vatican.va title: `Vucarien.` -> `vucarien`,
 * `vucariensis`, `vucariensi`; a double toponym (`Cuneen. – fossAnen.`) yields both.
 */
export function toponymStems(toponym: string): string[] {
  return toponym.split(/\s*[–-]\s*/).flatMap((part) => {
    const t = slugify(part.replace(/\.$/, ''));
    if (t === '') return [];
    return t.endsWith('en') ? [t, `${t.slice(0, -2)}ensis`, `${t.slice(0, -2)}ensi`] : [t];
  });
}

/**
 * Whether a vatican.va title carries the index's toponym. The index prints a
 * constitution's toponym as the mother see, a double see joined by a hyphen or *et*, and
 * the new see in parentheses (`DURANGENSIS-SINALOENSIS (Mazatlanensis)`, `CORDUBENSIS
 * (Crucis Axeatae)`, `CHUNCHEONENSIS (Voniuensis)`, AAS 51-69); the shelves of John XXIII
 * and Paul VI title the same acts by the mother see alone (`Cordubensis`, 1963), by both
 * (`Durangensis (Chihuahuensis)`, `Durangensis - Sinaloensis (Mazatlanensis)`, 1958) or,
 * from 1965, by the new see alone (`Voniuensis`, `Bafiensis`, `Cabimensis`), and a day
 * can carry two erections from one mother see (Durango, 22 November 1958: Chihuahua and
 * Mazatlán). So the title must carry every word of the head (before the parenthesis) or
 * every word of the parenthesis. Measured on AAS 51-69: the rule that took any one stem
 * anywhere in the title left 164 entries ambiguous between the erections of one day.
 * The 2017-2024 index's abbreviated adjectives (`VuCArien.`) still meet their full form.
 */
export const titleHasToponym = (title: string, toponym: string): boolean => {
  const words = `-${slugify(title)}-`;
  const has = (w: string) => toponymStems(w).some((stem) => words.includes(`-${stem}-`));
  const paren = toponym.match(/\(([^()]*)\)/);
  const head = toponymWords(toponym.replace(/\(.*$/, ''));
  const inner = paren ? toponymWords(paren[1]!) : [];
  return (head.length > 0 && head.every(has)) || (inner.length > 0 && inner.every(has));
};
/**
 * Where two titles carry the head, the new see in parentheses tells them apart: a word
 * of the entry's parenthesis is in the title's (`(Chihuahuensis)` against `(Chihuahuensis)`
 * and `(Mazatlanensis)`). Only a separator among candidates that all carry the toponym --
 * never a reason to drop the one that does, since the shelf spells a new see in its own
 * case (`Cuschensis (Sicuanensi)` for the index's `CUSCHENSIS (Sicuanensis)`).
 */
export const titleHasToponymInner = (title: string, toponym: string): boolean => {
  const paren = toponym.match(/\(([^()]*)\)/);
  const titleParen = title.match(/\(([^()]*)\)/);
  if (!paren || !titleParen) return false;
  const inner = toponymWords(paren[1]!);
  const titleInner = `-${slugify(titleParen[1]!)}-`;
  // Every word of the entry's parenthesis, not some: a shared word such as `Ioannis` between
  // two different sees must not decide a tie. Measured on every fixture through 1977 before
  // the change (CodeRabbit, PR #35): `some` and `every` produce the same 3,966 matches.
  return inner.every((w) => titleInner.includes(`-${w}-`));
};
/** The words of a toponym part, slugged, the connectors and abbreviations (`S.`, `et`, `in`) dropped. */
const toponymWords = (part: string): string[] =>
  [...new Set(part.split(/\s*[–-]\s*|\s+/).map((w) => slugify(w.replace(/\.$/, ''))).filter((w) => w.length >= 4))];
/**
 * Whether a title's own toponym -- what precedes its first comma, the Italian gloss of
 * the John XXIII shelf aside (`Durangensis (Chihuahuensis), con la quale …`) -- is the
 * entry's toponym word for word: the tie-break where two shelf titles carry the head
 * (`Liberopolitanae` and `Liberopolitanae (Muilaënsis)`, 11 December 1958).
 */
export const titleIsToponym = (title: string, toponym: string): boolean =>
  slugify(title.split(',')[0]!) === slugify(toponym.replace(/\.$/, ''));

/**
 * Where an entry stands with the reprint table (curation.ts, ACTA_REPRINTS). A row keyed by
 * this entry's page names it the printing that is *not* the citation of record: the later
 * printing of a re-issue, or the first printing a corrigendum supersedes -- a reprint, no
 * claim. Except when the row's `citationOf` is one of the entry's own `alsoPages`: the
 * index cited the act at both pages on one line (`138, 261`), and a corrigendum keyed by
 * the first page whose citation is the second means the entry is cited *at the second
 * page* -- so the entry is re-pointed there and matched or created as usual, its other
 * pages set aside (CodeRabbit, PR #37). The table is a parameter so the shape can be tested
 * without a curated row.
 */
export function citedAt(entry: ActaEntry, reprints: Readonly<Record<string, Reprint>> = ACTA_REPRINTS): { entry: ActaEntry; reprint: boolean } {
  const row = reprints[overrideKey(entry)];
  if (row === undefined) return { entry, reprint: false };
  const m = row.citationOf.match(/^([A-Z]+):(\d+):(\d+)$/);
  const page = m !== null && m[1] === entry.series && Number(m[2]) === entry.volume ? Number(m[3]) : undefined;
  if (page !== undefined && entry.alsoPages?.includes(page)) {
    const { alsoPages: _also, ...rest } = entry;
    return { entry: { ...rest, page }, reprint: false };
  }
  return { entry, reprint: true };
}

/**
 * The entry with its curated index correction applied (curation.ts), or the entry itself.
 * A row applies only while the parser still reads the printed date the row records, so a
 * fixture or parser change that alters the printed date surfaces as a row that no longer
 * fires (the data tests assert every row does) rather than as a silent second correction.
 * `raw` is untouched: the report quotes the line as printed.
 */
export function correctedEntry(entry: ActaEntry): ActaEntry {
  const row = ACTA_INDEX_CORRECTIONS[curationKey(entry)];
  return row !== undefined && row.printed === entry.date ? { ...entry, date: row.date } : entry;
}

export function matchActa(rawEntries: ActaEntry[], docs: DocumentRecord[]): ActaMatchResult {
  const entries = rawEntries.map(correctedEntry);
  const byIssuerDate = new Map<string, DocumentRecord[]>();
  const byIssuerMonth = new Map<string, DocumentRecord[]>();
  for (const d of docs) {
    const k = `${d.issuerId}|${d.date}`;
    byIssuerDate.set(k, [...(byIssuerDate.get(k) ?? []), d]);
    const m = `${d.issuerId}|${d.date.slice(0, 7)}`;
    byIssuerMonth.set(m, [...(byIssuerMonth.get(m) ?? []), d]);
  }
  const on = (issuer: string, date: string) => byIssuerDate.get(`${issuer}|${date}`) ?? [];
  const inMonth = (issuer: string, month: string) => byIssuerMonth.get(`${issuer}|${month}`) ?? [];
  const byId = new Map(docs.map((d) => [d.id, d]));

  const result: ActaMatchResult = {
    matches: [], ambiguous: [], unmatched: [], skipped: [], unknownPope: [], conflicts: [], reprints: [], sharedPages: [], superseded: [],
  };

  for (const raw of entries) {
    const category = categoryForHeading(raw.category);
    if (category === null || category.harvested === 'no' || category.classes.length === 0) {
      result.skipped.push(raw);
      continue;
    }
    // The printing that is not the citation of record (curation.ts, ACTA_REPRINTS): no
    // claim -- unless the row re-points a two-page entry to its other page (citedAt).
    const cited = citedAt(raw);
    if (cited.reprint) { result.reprints.push(raw); continue; }
    const entry = cited.entry;
    const issuer = POPE_ISSUERS[entry.pope];
    if (issuer === undefined) { result.unknownPope.push(entry); continue; }

    // A curated override (curation.ts) names the document outright, before and without the
    // class rule: it exists precisely where the class rule picked the wrong act. A row
    // whose document is not in `docs` is ignored here and caught by the data tests.
    const override = ACTA_MATCH_OVERRIDES[overrideKey(entry)];
    const overridden = override === undefined ? undefined : byId.get(override.documentId);
    if (overridden !== undefined) {
      result.matches.push({ entry, documentId: overridden.id, by: 'curated' });
      continue;
    }

    const inClasses = (d: DocumentRecord) => category.classes.some((c) => inClass(d, c));
    // No year printed and no curated correction: nothing to match against, no near-miss.
    if (isUnprintedYear(entry)) { result.unmatched.push({ entry, sameDate: [], nearMisses: [] }); continue; }
    if (isMonthOnly(entry)) {
      const slug = entry.incipit === null ? null : incipitSlug(entry.incipit);
      const monthly = inMonth(issuer, entry.date).filter(inClasses);
      const byIncipit = slug === null || slug === '' ? []
        : monthly.filter((d) => d.incipit !== undefined && incipitSlug(d.incipit) === slug);
      if (byIncipit.length === 1) {
        result.matches.push({ entry, documentId: byIncipit[0]!.id, by: 'incipit-month' });
      } else if (byIncipit.length > 1) {
        result.ambiguous.push({ entry, candidates: byIncipit.map(candidate) });
      } else {
        // Reported with what the pope has of the class in the month; no near-miss for a
        // date that has no day.
        result.unmatched.push({ entry, sameDate: monthly.map(candidate), nearMisses: [] });
      }
      continue;
    }
    const sameDate = on(issuer, entry.date);
    let candidates = sameDate.filter(inClasses);
    let by: ActaMatch['by'] = 'unique';

    if (candidates.length > 1 && entry.incipit !== null) {
      const slug = incipitSlug(entry.incipit);
      const byIncipit = candidates.filter((d) => d.incipit !== undefined && incipitSlug(d.incipit) === slug);
      if (byIncipit.length >= 1) { candidates = byIncipit; by = 'incipit'; }
    }
    if (candidates.length > 1 && entry.toponym !== null && category.classes.some((c) => c.requires === 'apostolic-constitution')) {
      const byToponym = candidates.filter((d) => titleHasToponym(d.title, entry.toponym!));
      if (byToponym.length >= 1) { candidates = byToponym; by = 'toponym'; }
      if (candidates.length > 1) {
        const byInner = candidates.filter((d) => titleHasToponymInner(d.title, entry.toponym!));
        if (byInner.length >= 1) candidates = byInner;
      }
      if (candidates.length > 1) {
        const exact = candidates.filter((d) => titleIsToponym(d.title, entry.toponym!));
        if (exact.length === 1) candidates = exact;
      }
    }

    if (candidates.length === 1) {
      result.matches.push({ entry, documentId: candidates[0]!.id, by });
    } else if (candidates.length > 1) {
      result.ambiguous.push({ entry, candidates: candidates.map(candidate) });
    } else {
      const nearMisses = [-1, 1].flatMap((delta) =>
        on(issuer, shiftDate(entry.date, delta)).filter(inClasses).map(candidate));
      result.unmatched.push({ entry, sameDate: sameDate.map(candidate), nearMisses });
    }
  }

  // One page opens one act (invariant 25), and one act has one first page: a document
  // claimed twice is a finding, not a choice -- unless exactly one of the claims carries
  // positive evidence the others lack: the document's incipit slug is the entry's, or (a
  // constitution) its title carries the entry's toponym. The volumes print several
  // constitutions of one day where the shelf holds one (10 November 1977: *Avkaënsis*,
  // *Mohaleshoekensis*, *Ambikapurensis* against the shelf's *Avkaensis*), and the
  // `unique` rule sends every entry to it; the entry the document names keeps the match
  // and the others are released as unmatched, with the document listed beside them, so
  // the creator's guard sees it. With no such evidence, or with two, neither claim is kept.
  const claims = new Map<string, ActaMatch[]>();
  for (const m of result.matches) claims.set(m.documentId, [...(claims.get(m.documentId) ?? []), m]);
  const dropped = new Set<ActaMatch>();
  for (const [documentId, ms] of claims) {
    if (ms.length < 2) continue;
    const doc = byId.get(documentId)!;
    const evidenced = ms.map((m): ActaMatch | null => {
      const e = m.entry;
      // A curated override (curation.ts) is evidence the row quotes: it keeps the match
      // against unevidenced claims (the vernacular text of an encyclical the index enters
      // a second time, AAS 25 (1933) 275).
      if (m.by === 'curated') return m;
      if (e.incipit !== null && doc.incipit !== undefined && incipitSlug(doc.incipit) === incipitSlug(e.incipit)) return { ...m, by: 'incipit' };
      const category = categoryForHeading(e.category);
      if (e.toponym !== null && category?.classes.some((c) => c.requires === 'apostolic-constitution')
        && titleHasToponym(doc.title, e.toponym)) return { ...m, by: 'toponym' };
      return null;
    });
    const winners = evidenced.filter((m): m is ActaMatch => m !== null);
    if (winners.length === 1) {
      const winner = winners[0]!;
      for (const [k, m] of ms.entries()) {
        if (evidenced[k] !== null) { Object.assign(m, winner); continue; }
        dropped.add(m);
        const e = m.entry;
        const issuer = POPE_ISSUERS[e.pope]!;
        const nearMisses = isMonthOnly(e) || isUnprintedYear(e) ? [] : [-1, 1].flatMap((delta) =>
          on(issuer, shiftDate(e.date, delta)).filter((d) => categoryForHeading(e.category)!.classes.some((c) => inClass(d, c))).map(candidate));
        result.unmatched.push({ entry: e, sameDate: (isMonthOnly(e) ? inMonth(issuer, e.date) : on(issuer, e.date)).map(candidate), nearMisses });
      }
      continue;
    }
    result.conflicts.push({ documentId, entries: ms.map((m) => m.entry) });
  }
  const conflicted = new Set(result.conflicts.map((c) => c.documentId));
  result.matches = result.matches.filter((m) => !conflicted.has(m.documentId) && !dropped.has(m));
  // One page opens one act (invariant 25): two matched documents on one page are both
  // withheld unless ACTA_SHARED_PAGES quotes the page (the creator holds a created record
  // the same way, create.ts). The pair the table lists is written with the table's ids.
  const byPage = new Map<string, ActaMatch[]>();
  for (const m of result.matches) {
    const key = `${m.entry.series}:${m.entry.volume}${m.entry.part ? `-${m.entry.part}` : ''}:${m.entry.page}`;
    byPage.set(key, [...(byPage.get(key) ?? []), m]);
  }
  const withheld = new Set<ActaMatch>();
  for (const [page, ms] of byPage) {
    if (ms.length < 2) continue;
    const curated = ACTA_SHARED_PAGES[page];
    if (curated !== undefined && ms.every((m) => curated.documentIds.includes(m.documentId))) continue;
    for (const m of ms) withheld.add(m);
    result.sharedPages.push({ page, matches: ms });
  }
  result.matches = result.matches.filter((m) => !withheld.has(m));
  return result;
}
