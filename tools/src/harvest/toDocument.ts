import { slugify } from '../slug.js';
import { mintId, mintProvisionalId } from '../ids.js';
import {
  VATICAN_SLUG_TO_ISSUER, SOURCE_GENRE_TO_GENRE, CONCILIAR_REASSIGNMENTS, keywordsFor,
} from '../mappings/index.js';
import type { DocumentRecord, HarvestItem } from '../types.js';

export function toDocument(item: HarvestItem, retrieved: string): DocumentRecord {
  const pageIssuer = VATICAN_SLUG_TO_ISSUER[item.pageSlug];
  if (!pageIssuer) throw new Error(`No CRPDR mapping for vatican.va slug: ${item.pageSlug}`);

  const key = `${item.pageSlug}|${slugify(item.incipit ?? item.title)}|${item.date}`;
  const reassigned = CONCILIAR_REASSIGNMENTS[key];

  const issuerId = reassigned?.issuerId ?? pageIssuer;
  const mapping = SOURCE_GENRE_TO_GENRE[item.sourceGenreLabel.toLowerCase()] ?? { genre: null };
  const issuerType = mapping.issuerType
    ?? (issuerId.startsWith('oec:') ? 'ecumenical-council' : 'pope');

  const record: DocumentRecord = {
    id: item.incipit !== null
      ? mintId(issuerId, item.incipit, item.date)
      // No incipit is printed, so the id cannot be name-based. The genre slug plus the
      // full date is the provisional form (spec §3.5); the ordinal, where two share a
      // date, is assigned by the orchestrator, which alone can see the whole group.
      : mintProvisionalId(issuerId, mapping.genre ?? slugify(item.sourceGenreLabel), item.date),
    title: item.title,
    idStatus: item.incipit !== null ? 'minted' : 'provisional',
    genre: mapping.genre,
    issuerId,
    issuerType,
    date: item.date,
    source: {
      url: item.url, shelf: item.shelf, languages: item.languages, retrieved,
      ...(item.alsoShelvedAs?.length ? { alsoShelvedAs: item.alsoShelvedAs } : {}),
    },
  };

  // Assigned after the literal so a missing incipit is omitted rather than set to
  // undefined -- JSON.stringify would drop either, but `'incipit' in d` would still
  // see the latter.
  if (item.incipit !== null) record.incipit = item.incipit;

  if (reassigned) record.promulgatedBy = reassigned.promulgatedBy;
  if (item.aliases?.length) record.aliases = [...item.aliases];
  if (mapping.characteristics) record.characteristics = [...mapping.characteristics];
  if (mapping.descriptiveTitle) record.descriptiveTitle = mapping.descriptiveTitle;
  // Never authority-bearing (invariant 21 is the only rule that reads it): read purely
  // from the heading text or the hand-curated table, never from genre/characteristics.
  const keywords = keywordsFor(item);
  if (keywords.length) record.keywords = keywords;
  // The genre label exactly as vatican.va prints it (spec §4.1), preserved unconditionally
  // so the genre mapping stays auditable from the data, not only when genre is null.
  record.sourceGenreLabel = item.sourceGenreLabel;

  return record;
}
