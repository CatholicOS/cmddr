import { slugify } from '../slug.js';
import { mintId } from '../ids.js';
import {
  VATICAN_SLUG_TO_ISSUER, SOURCE_GENRE_TO_GENRE, CONCILIAR_REASSIGNMENTS,
} from '../mappings/index.js';
import type { DocumentRecord, HarvestItem } from '../types.js';

/**
 * Documents whose issuer+incipit+year collides with another (invariant 11) and so
 * must mint with the full date rather than the year alone. Key: the same
 * `${pageSlug}|${slugify(incipit)}|${isoDate}` shape as CONCILIAR_REASSIGNMENTS.
 *
 * Leo XIII's "Magni Nobis" is filed twice: the encyclicals shelf dates it 7 March
 * 1889 (matching its URL slug hf_l-xiii_enc_07031889_magni-nobis.html), while the
 * letters shelf's printed date reads "7 maggio 1889" (7 May) even though its own
 * URL slug (hf_l-xiii_let_18890307_magni-nobis.html) also encodes 7 March — a
 * transcription error on vatican.va's letters page. Since parseShelfIndex trusts
 * the printed date over the URL (see its doc comment), these become two distinct
 * dated entries here rather than being merged by the cross-shelf dedupe, which
 * only merges on an exact date match.
 */
const FULL_DATE_IDS = new Set<string>([
  'leo-xiii|magni-nobis|1889-03-07',
  'leo-xiii|magni-nobis|1889-05-07',
]);

export function toDocument(item: HarvestItem, retrieved: string): DocumentRecord {
  const pageIssuer = VATICAN_SLUG_TO_ISSUER[item.pageSlug];
  if (!pageIssuer) throw new Error(`No CRPDR mapping for vatican.va slug: ${item.pageSlug}`);

  const key = `${item.pageSlug}|${slugify(item.incipit)}|${item.date}`;
  const reassigned = CONCILIAR_REASSIGNMENTS[key];
  const fullDate = FULL_DATE_IDS.has(key);

  const issuerId = reassigned?.issuerId ?? pageIssuer;
  const mapping = SOURCE_GENRE_TO_GENRE[item.sourceGenreLabel.toLowerCase()] ?? { genre: null };
  const issuerType = mapping.issuerType
    ?? (issuerId.startsWith('oec:') ? 'ecumenical-council' : 'pope');

  const record: DocumentRecord = {
    id: mintId(issuerId, item.incipit, item.date, { fullDate }),
    title: item.incipit,
    incipit: item.incipit,
    idStatus: 'minted',
    genre: mapping.genre,
    issuerId,
    issuerType,
    date: item.date,
    source: {
      url: item.url, shelf: item.shelf, languages: item.languages, retrieved,
      ...(item.alsoShelvedAs?.length ? { alsoShelvedAs: item.alsoShelvedAs } : {}),
    },
  };

  if (reassigned) record.promulgatedBy = reassigned.promulgatedBy;
  if (mapping.characteristics) record.characteristics = [...mapping.characteristics];
  if (mapping.descriptiveTitle) record.descriptiveTitle = mapping.descriptiveTitle;
  if (mapping.genre === null) record.sourceGenreLabel = item.sourceGenreLabel;

  return record;
}
