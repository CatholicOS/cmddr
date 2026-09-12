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
 */
import { slugify } from '../slug.js';
import { categoryForHeading, type GenreClass } from './categories.js';
import { ACTA_INDEX_CORRECTIONS, ACTA_MATCH_OVERRIDES, curationKey, overrideKey } from './curation.js';
import type { ActaEntry } from './index.js';
import type { DocumentRecord } from '../types.js';

/** The index's pope heading (nominative, as the parser renders it) to the CRPDR issuer. */
export const POPE_ISSUERS: Readonly<Record<string, string>> = {
  Franciscus: 'rp:francis-i',
  // The 2020 index carries two beatification letters of 2010-2011 in a part of their own,
  // and the 2018 index one with the pope named in brackets before the incipit.
  'Benedictus XVI': 'rp:benedict-xvi',
};

export interface ActaMatch {
  entry: ActaEntry;
  documentId: string;
  /** What decided the match: the only candidate, the incipit slug, the toponym, or a curated override. */
  by: 'unique' | 'incipit' | 'toponym' | 'curated';
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
  /** Documents claimed by more than one entry; none of those claims is kept as a match. */
  conflicts: { documentId: string; entries: ActaEntry[] }[];
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

const titleHasToponym = (title: string, toponym: string): boolean => {
  const words = `-${slugify(title)}-`;
  return toponymStems(toponym).some((stem) => words.includes(`-${stem}`));
};

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
  for (const d of docs) {
    const k = `${d.issuerId}|${d.date}`;
    byIssuerDate.set(k, [...(byIssuerDate.get(k) ?? []), d]);
  }
  const on = (issuer: string, date: string) => byIssuerDate.get(`${issuer}|${date}`) ?? [];
  const byId = new Map(docs.map((d) => [d.id, d]));

  const result: ActaMatchResult = {
    matches: [], ambiguous: [], unmatched: [], skipped: [], unknownPope: [], conflicts: [],
  };

  for (const entry of entries) {
    const category = categoryForHeading(entry.category);
    if (category === null || category.harvested === 'no' || category.classes.length === 0) {
      result.skipped.push(entry);
      continue;
    }
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

    const sameDate = on(issuer, entry.date);
    const inClasses = (d: DocumentRecord) => category.classes.some((c) => inClass(d, c));
    let candidates = sameDate.filter(inClasses);
    let by: ActaMatch['by'] = 'unique';

    if (candidates.length > 1 && entry.incipit !== null) {
      const slug = slugify(entry.incipit);
      const byIncipit = candidates.filter((d) => d.incipit !== undefined && slugify(d.incipit) === slug);
      if (byIncipit.length >= 1) { candidates = byIncipit; by = 'incipit'; }
    }
    if (candidates.length > 1 && entry.toponym !== null && category.classes.some((c) => c.requires === 'apostolic-constitution')) {
      const byToponym = candidates.filter((d) => titleHasToponym(d.title, entry.toponym!));
      if (byToponym.length >= 1) { candidates = byToponym; by = 'toponym'; }
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
  // claimed twice is a finding, not a choice. Neither claim is kept.
  const claims = new Map<string, ActaEntry[]>();
  for (const m of result.matches) claims.set(m.documentId, [...(claims.get(m.documentId) ?? []), m.entry]);
  for (const [documentId, es] of claims) {
    if (es.length > 1) result.conflicts.push({ documentId, entries: es });
  }
  const conflicted = new Set(result.conflicts.map((c) => c.documentId));
  result.matches = result.matches.filter((m) => !conflicted.has(m.documentId));
  return result;
}
