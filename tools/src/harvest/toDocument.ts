import { slugify } from '../slug.js';
import { mintId } from '../ids.js';
import {
  VATICAN_SLUG_TO_ISSUER, SOURCE_GENRE_TO_GENRE, CONCILIAR_REASSIGNMENTS,
} from '../mappings/index.js';
import type { DocumentRecord, HarvestItem } from '../types.js';

export function toDocument(item: HarvestItem, retrieved: string): DocumentRecord {
  const pageIssuer = VATICAN_SLUG_TO_ISSUER[item.pageSlug];
  if (!pageIssuer) throw new Error(`No CRPDR mapping for vatican.va slug: ${item.pageSlug}`);

  const key = `${item.pageSlug}|${slugify(item.incipit)}|${item.date}`;
  const reassigned = CONCILIAR_REASSIGNMENTS[key];

  const issuerId = reassigned?.issuerId ?? pageIssuer;
  const mapping = SOURCE_GENRE_TO_GENRE[item.sourceGenreLabel.toLowerCase()] ?? { genre: null };
  const issuerType = mapping.issuerType
    ?? (issuerId.startsWith('oec:') ? 'ecumenical-council' : 'pope');

  const record: DocumentRecord = {
    id: mintId(issuerId, item.incipit, item.date),
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
