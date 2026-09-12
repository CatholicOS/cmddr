import { slugify } from '../slug.js';
import { MINTED_ID_RE, PROVISIONAL_ID_RE, parseId, issuerLocalPart } from '../ids.js';
import { KNOWN_PONTIFF_IDS, KNOWN_COUNCIL_IDS } from '../mappings/index.js';
import { ACTA_SHARED_PAGES } from '../acta/curation.js';
import type { DocumentRecord } from '../types.js';

export interface Violation { rule: number; id: string; message: string }

/**
 * The genre rows this module needs from `data/genres.json`: id plus its allowed issuerTypes
 * and allowed characteristics.
 */
export interface GenreLike { id: string; issuerTypes?: string[]; allowedCharacteristics?: string[] }

/** The keyword rows this module needs from `data/keywords.json`. */
export interface KeywordLike { id: string }

/**
 * The series rows this module needs from `data/series.json`: id, plus `firstYear` where
 * the vocabulary has verified one and any `renumberings` (resets of the printed numbering
 * by the Holy See, each shifting every ordinal from `fromYear` on by `offset`), for
 * invariant 24.
 */
export interface SeriesLike {
  id: string;
  firstYear?: number;
  renumberings?: { fromYear: number; offset: number }[];
}

/**
 * The ordinal invariant 24 expects for `year` in a series with a verified `firstYear`:
 * year - firstYear + 1, plus the offset of every renumbering whose fromYear <= year. The
 * vocabulary records a reset; the registry never re-computes numbers from it.
 */
export function expectedOrdinal(row: SeriesLike, year: number): number {
  return year - row.firstYear! + 1
    + (row.renumberings ?? []).filter((r) => r.fromYear <= year).reduce((sum, r) => sum + r.offset, 0);
}

/** Invariants 8-13, 15-25 of the design specs. (14 lives in the assessment checker.) */
export function checkDocuments(
  docs: DocumentRecord[], genres: GenreLike[], keywords: KeywordLike[] = [],
  series: SeriesLike[] = [],
): Violation[] {
  const genreIds = new Set(genres.map((g) => g.id));
  const keywordIds = new Set(keywords.map((k) => k.id));
  const seriesIds = new Set(series.map((s) => s.id));
  const rowsWithFirstYear = new Map(series.filter((s) => s.firstYear !== undefined)
    .map((s) => [s.id, s]));
  const issuerTypesByGenre = new Map(genres.map((g) => [g.id, g.issuerTypes]));
  const characteristicsByGenre = new Map(genres.map((g) => [g.id, g.allowedCharacteristics]));
  const out: Violation[] = [];
  const seen = new Map<string, number>();
  const byCollision = new Map<string, DocumentRecord[]>();
  const byProvisionalGroup = new Map<string, DocumentRecord[]>();
  const bySeriesOccasion = new Map<string, DocumentRecord[]>();
  const byActaPage = new Map<string, DocumentRecord[]>();

  for (const d of docs) {
    const re = d.idStatus === 'provisional' ? PROVISIONAL_ID_RE : MINTED_ID_RE;
    if (!re.test(d.id)) {
      out.push({ rule: 8, id: d.id, message: `id does not match the ${d.idStatus} form` });
      continue;
    }
    seen.set(d.id, (seen.get(d.id) ?? 0) + 1);

    const parts = parseId(d.id);
    if (!parts) { out.push({ rule: 8, id: d.id, message: 'id is unparseable' }); continue; }

    // A failed issuerLocalPart is reported as rule 13, but must not suppress the
    // independent checks (10, 12, 15) below — only rule 9 and the collision
    // grouping actually depend on `local`.
    let local: string | null = null;
    try { local = issuerLocalPart(d.issuerId); }
    catch (e) { out.push({ rule: 13, id: d.id, message: String(e) }); }

    if (local !== null && parts.issuer !== local) {
      out.push({ rule: 9, id: d.id, message: `namespace '${parts.issuer}' != issuerId '${d.issuerId}'` });
    }
    // Rule 10's series branch (messages spec §3.3): a series-form id carries the occasion
    // year the title prints, which routinely differs from the year of `date` (the 2025
    // Peace message is signed 8 December 2024). Otherwise the year of `date`, as before.
    if (d.series) {
      if (parts.year !== String(d.series.year)) {
        out.push({
          rule: 10, id: d.id,
          message: `id year ${parts.year} != series.year ${d.series.year}`,
        });
      }
    } else if (parts.year !== d.date.slice(0, 4)) {
      out.push({ rule: 10, id: d.id, message: `id year ${parts.year} != date ${d.date}` });
    }
    // Rule 18 runs before rule 12 (review finding, 2026-09-08): rule 12 falls back to
    // d.title when d.incipit is absent, and slugify() throws on a non-string argument
    // rather than returning a mismatch. A record with neither a usable incipit nor a
    // string title must be reported by rule 18 and skip rule 12's slug check, rather than
    // crashing the validator on malformed input.
    const hasTitle = typeof d.title === 'string' && d.title.trim() !== '';
    if (!hasTitle) {
      out.push({ rule: 18, id: d.id, message: 'title is missing or empty' });
    }

    // Rule 12's series branch: the slug segment of a series-form id is the series id
    // itself, whatever incipit the source may print (messages spec §3.2.3). Otherwise
    // slugify(incipit), as before.
    if (d.series) {
      if (parts.slug !== d.series.id) {
        out.push({ rule: 12, id: d.id, message: `slug '${parts.slug}' != series.id '${d.series.id}'` });
      }
    } else if (
      d.idStatus === 'minted'
      && (typeof d.incipit === 'string' || hasTitle)
      && parts.slug !== slugify(d.incipit ?? d.title)
    ) {
      out.push({ rule: 12, id: d.id, message: `slug '${parts.slug}' != slugify('${d.incipit}')` });
    }

    if (d.idStatus === 'provisional') {
      // The parallel of rule 12 for a provisional id: its genre segment must be derivable
      // from the record, so the id can be recomputed rather than trusted.
      const expected = slugify(d.genre ?? d.sourceGenreLabel ?? '');
      if (expected === '' || parts.slug !== expected) {
        out.push({
          rule: 19, id: d.id,
          message: `provisional genre segment '${parts.slug}' != '${expected}'`,
        });
      }
    }

    for (const k of d.keywords ?? []) {
      if (!keywordIds.has(k)) {
        out.push({ rule: 21, id: d.id, message: `unknown keyword: ${k}` });
      }
    }

    // Rule 23 mirrors rule 21: vocabulary membership. `series` has no bearing on register,
    // ceiling or assent; what the other rules read off it (10, 12, 24 and the uniqueness
    // fold below) concerns only the id and the ordinal.
    if (d.series && !seriesIds.has(d.series.id)) {
      out.push({ rule: 23, id: d.id, message: `unknown series: ${d.series.id}` });
    }

    // Rule 24: where the vocabulary row has a verified first year and the title printed an
    // ordinal, the two must agree -- ordinal = year - firstYear + 1, plus the offset of every
    // renumbering the row records from a year <= this one (expectedOrdinal). This catches a
    // misread numeral or a miscounted day before it enters a permanent id's neighbourhood.
    // It never fires when any of the three is absent: an ordinal is never computed from
    // firstYear.
    if (d.series && d.series.ordinal !== undefined) {
      const row = rowsWithFirstYear.get(d.series.id);
      if (row !== undefined) {
        const expected = expectedOrdinal(row, d.series.year);
        if (d.series.ordinal !== expected) {
          const resets = (row.renumberings ?? []).filter((r) => r.fromYear <= d.series!.year);
          out.push({
            rule: 24, id: d.id,
            message: `series.ordinal ${d.series.ordinal} != ${d.series.year} - ${row.firstYear} + 1`
              + resets.map((r) => ` ${r.offset < 0 ? '-' : '+'} ${Math.abs(r.offset)} (reset from ${r.fromYear})`).join('')
              + ` = ${expected} for ${d.series.id}`,
          });
        }
      }
    }

    if (local !== null) {
      // `local` is non-null here, so d.issuerId is already known to carry a registered
      // prefix (oec: or rp:) - this checks it resolves to a *known* issuer of that kind,
      // not merely that it is prefixed (an unprefixed issuerId was already reported above).
      const known = d.issuerId.startsWith('oec:') ? KNOWN_COUNCIL_IDS : KNOWN_PONTIFF_IDS;
      if (!known.has(d.issuerId)) {
        out.push({ rule: 13, id: d.id, message: `issuerId not in the vendored registry: ${d.issuerId}` });
      }
    }
    if (d.promulgatedBy && !KNOWN_PONTIFF_IDS.has(d.promulgatedBy)) {
      out.push({ rule: 13, id: d.id, message: `promulgatedBy not in CRPDR: ${d.promulgatedBy}` });
    }

    if (d.genre === null) {
      if (!d.sourceGenreLabel) {
        out.push({ rule: 15, id: d.id, message: 'null genre requires sourceGenreLabel' });
      }
    } else if (!genreIds.has(d.genre)) {
      out.push({ rule: 15, id: d.id, message: `unknown genre: ${d.genre}` });
    }

    const isCouncilIssuer = d.issuerId.startsWith('oec:');
    if (isCouncilIssuer !== (d.issuerType === 'ecumenical-council')) {
      out.push({
        rule: 16, id: d.id,
        message: `issuerId '${d.issuerId}' and issuerType '${d.issuerType}' disagree on ecumenical-council`,
      });
    }

    if (d.genre !== null) {
      const allowed = issuerTypesByGenre.get(d.genre);
      if (allowed && !allowed.includes(d.issuerType)) {
        out.push({
          rule: 17, id: d.id,
          message: `issuerType '${d.issuerType}' not among ${d.genre}'s issuerTypes (${allowed.join(', ')})`,
        });
      }
    }

    // The characteristic parallel of rule 17: a genre row lists what its documents may bear,
    // and a row with no allowedCharacteristics at all allows none. Only checked when the
    // genre resolves -- an unknown genre is already reported by rule 15, and a null genre
    // has no row to consult.
    if (d.genre !== null && genreIds.has(d.genre)) {
      const allowedCharacteristics = characteristicsByGenre.get(d.genre) ?? [];
      for (const c of d.characteristics ?? []) {
        if (!allowedCharacteristics.includes(c)) {
          out.push({
            rule: 22, id: d.id,
            message: `characteristic '${c}' not among ${d.genre}'s allowedCharacteristics `
              + `(${allowedCharacteristics.length ? allowedCharacteristics.join(', ') : 'none'})`,
          });
        }
      }
    }

    // Guarded the same way as rule 12 above (review finding, 2026-09-08): slugify()
    // throws on a non-string argument, so this collision key must not be built from a
    // record with neither a usable incipit nor a string title -- such a record is
    // already reported via rule 18 above and simply takes no part in collision grouping.
    // A series-form id is keyed by occasion, not incipit, so it takes no part in rule 11's
    // incipit-collision grouping; its own uniqueness rule is the fold into rule 8 below.
    if (d.series) {
      if (local !== null) {
        const k = `${local}|${d.series.id}|${d.series.year}`;
        bySeriesOccasion.set(k, [...(bySeriesOccasion.get(k) ?? []), d]);
      }
    } else if (d.idStatus === 'minted' && local !== null && (typeof d.incipit === 'string' || hasTitle)) {
      const k = `${local}|${slugify(d.incipit ?? d.title)}|${d.date.slice(0, 4)}`;
      byCollision.set(k, [...(byCollision.get(k) ?? []), d]);
    }

    if (d.idStatus === 'provisional' && local !== null) {
      const k = `${local}|${slugify(d.genre ?? d.sourceGenreLabel ?? '')}|${d.date}`;
      byProvisionalGroup.set(k, [...(byProvisionalGroup.get(k) ?? []), d]);
    }

    // Rule 25 (acta reference spec §3): one page of the Acta opens one act, so no two
    // documents share (series, volume, part, page) -- the two-part volumes of 1917 and
    // 1983 restart their pagination per part, so `part` is in the key even though phase 1
    // never sets it. Well-formedness is the schema's; this is the only invariant that
    // reads `acta`, which bears on nothing but the citation.
    if (d.acta) {
      const k = `${d.acta.series}|${d.acta.volume}${d.acta.part ? `-${d.acta.part}` : ''}|${d.acta.page}`;
      byActaPage.set(k, [...(byActaPage.get(k) ?? []), d]);
    }
  }

  for (const [id, n] of seen) {
    if (n > 1) out.push({ rule: 8, id, message: `id is not unique (${n} occurrences)` });
  }

  // Folded into rule 8 (messages spec §3.3): one issuer, one series, one occasion year, one
  // document. The id is derived from exactly this triple, so two such records would share
  // an id as well; naming the triple says why, which a bare duplicate-id report does not.
  for (const [k, group] of bySeriesOccasion) {
    if (group.length < 2) continue;
    for (const d of group) {
      out.push({
        rule: 8, id: d.id,
        message: `series-form id is not unique: ${group.length} documents share (issuer, series, year) ${k}`,
      });
    }
  }

  for (const [k, group] of byCollision) {
    if (group.length < 2) continue;
    for (const d of group) {
      if (!/-\d{4}-\d{2}-\d{2}$/.test(d.id)) {
        out.push({ rule: 11, id: d.id, message: `collision on ${k}: both ids must use the full date` });
      }
    }
  }

  for (const [k, group] of byProvisionalGroup) {
    // Only a suffix trailing the full `-YYYY-MM-DD` date is an ordinal; a naive
    // `/-(\d+)$/` would misread the date's own day-of-month segment as one.
    const ordinals = group.map((d) => {
      const m = d.id.match(/-\d{4}-\d{2}-\d{2}(?:-(\d+))?$/);
      return m?.[1] ? Number(m[1]) : null;
    });
    if (group.length === 1) {
      if (ordinals[0] !== null) {
        out.push({
          rule: 20, id: group[0]!.id,
          message: `sole provisional document of ${k} must carry no ordinal`,
        });
      }
      continue;
    }
    const expected = group.map((_, i) => i + 1);
    const found = [...ordinals].sort((a, b) => (a ?? 0) - (b ?? 0));
    if (ordinals.includes(null) || found.join(',') !== expected.join(',')) {
      for (const d of group) {
        out.push({
          rule: 20, id: d.id,
          message: `provisional ordinals for ${k} must be exactly 1..${group.length}`,
        });
      }
    }
  }

  for (const [k, group] of byActaPage) {
    if (group.length < 2) continue;
    // A page the volume itself prints two short acts on (ACTA_SHARED_PAGES, with the page
    // quoted): the listed documents may share it; any other document citing it still fails.
    const shared = ACTA_SHARED_PAGES[k.replace(/\|/g, ':')];
    if (shared !== undefined && group.every((d) => shared.documentIds.includes(d.id))) continue;
    for (const d of group) {
      out.push({
        rule: 25, id: d.id,
        message: `acta reference ${k.replace(/\|/g, ' ')} is shared by ${group.length} documents`,
        // (k reads 'AAS 115 1041', or 'AAS 9-I 41' for a two-part volume)
      });
    }
  }

  return out;
}

export interface AssessmentLike { id: string; document: string; section: string }

/** Invariant 14: a locus is `{document}#{section}` and names an existing document. */
export function checkAssessments(
  assessments: AssessmentLike[],
  documentIds: Set<string>,
): Violation[] {
  const out: Violation[] = [];
  for (const a of assessments) {
    if (!documentIds.has(a.document)) {
      out.push({ rule: 14, id: a.id, message: `unknown document: ${a.document}` });
    }
    const expected = `${a.document}#${a.section}`;
    if (a.id !== expected) {
      out.push({ rule: 14, id: a.id, message: `locus should be '${expected}'` });
    }
  }
  return out;
}
