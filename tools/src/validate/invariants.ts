import { slugify } from '../slug.js';
import { MINTED_ID_RE, PROVISIONAL_ID_RE, parseId, issuerLocalPart } from '../ids.js';
import { KNOWN_PONTIFF_IDS, KNOWN_COUNCIL_IDS } from '../mappings/index.js';
import type { DocumentRecord } from '../types.js';

export interface Violation { rule: number; id: string; message: string }

/** Invariants 8-13 and 15 of the design spec §6. (14 lives in the assessment checker.) */
export function checkDocuments(docs: DocumentRecord[], genreIds: Set<string>): Violation[] {
  const out: Violation[] = [];
  const seen = new Map<string, number>();
  const byCollision = new Map<string, DocumentRecord[]>();

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
    if (parts.year !== d.date.slice(0, 4)) {
      out.push({ rule: 10, id: d.id, message: `id year ${parts.year} != date ${d.date}` });
    }
    if (d.idStatus === 'minted' && parts.slug !== slugify(d.incipit)) {
      out.push({ rule: 12, id: d.id, message: `slug '${parts.slug}' != slugify('${d.incipit}')` });
    }

    if (local !== null) {
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

    if (d.idStatus === 'minted' && local !== null) {
      const k = `${local}|${slugify(d.incipit)}|${d.date.slice(0, 4)}`;
      byCollision.set(k, [...(byCollision.get(k) ?? []), d]);
    }
  }

  for (const [id, n] of seen) {
    if (n > 1) out.push({ rule: 8, id, message: `id is not unique (${n} occurrences)` });
  }

  for (const [k, group] of byCollision) {
    if (group.length < 2) continue;
    for (const d of group) {
      if (!/-\d{4}-\d{2}-\d{2}$/.test(d.id)) {
        out.push({ rule: 11, id: d.id, message: `collision on ${k}: both ids must use the full date` });
      }
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
