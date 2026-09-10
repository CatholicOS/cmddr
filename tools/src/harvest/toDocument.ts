import { slugify } from '../slug.js';
import { mintId, mintProvisionalId } from '../ids.js';
import {
  VATICAN_SLUG_TO_ISSUER, SOURCE_GENRE_TO_GENRE, CONCILIAR_SOURCE_GENRE_TO_GENRE,
  CONCILIAR_REASSIGNMENTS, COUNCILS, RECOVERED_INCIPITS, keywordsFor,
} from '../mappings/index.js';
import type { DocumentRecord, HarvestItem } from '../types.js';

export function toDocument(item: HarvestItem, retrieved: string): DocumentRecord {
  const pageIssuer = VATICAN_SLUG_TO_ISSUER[item.pageSlug];
  if (!pageIssuer) throw new Error(`No CRPDR mapping for vatican.va slug: ${item.pageSlug}`);

  const key = `${item.pageSlug}|${slugify(item.incipit ?? item.title)}|${item.date}`;
  const reassigned = CONCILIAR_REASSIGNMENTS[key];

  const issuerId = reassigned?.issuerId ?? pageIssuer;
  // A council's vocabulary is read first and only for a council: 'decreto' means the
  // Genre Registry's council-only `decree` row here, and a papal decree with no row at
  // all in the shared map. Falling through to the shared map keeps every label the two
  // sources share -- 'costituzione dogmatica' among them -- working from one place.
  const label = item.sourceGenreLabel.toLowerCase();
  const mapping = (issuerId.startsWith('oec:')
    ? CONCILIAR_SOURCE_GENRE_TO_GENRE[label]
    : undefined) ?? SOURCE_GENRE_TO_GENRE[label] ?? { genre: null };
  const issuerType = mapping.issuerType
    ?? (issuerId.startsWith('oec:') ? 'ecumenical-council' : 'pope');

  // An incipit the source itself printed always wins. The curated table is consulted only
  // where the heading printed none -- the provisional shelf -- so a recovered row can never
  // shadow a printed incipit, and the act's own name is restored where the index page
  // simply did not carry it (see recovered-incipits.ts for the evidence behind each row).
  const recovered = item.incipit === null
    ? RECOVERED_INCIPITS[`${item.pageSlug}|${slugify(item.title)}|${item.date}`]
    : undefined;
  const incipit = item.incipit ?? recovered?.incipit ?? null;

  const record: DocumentRecord = {
    id: incipit !== null
      ? mintId(issuerId, incipit, item.date)
      // No incipit is printed and none has been recovered, so the id cannot be name-based.
      // The genre slug plus the full date is the provisional form (spec §3.5); the ordinal,
      // where two share a date, is assigned by the orchestrator, which alone sees the group.
      : mintProvisionalId(issuerId, mapping.genre ?? slugify(item.sourceGenreLabel), item.date),
    title: item.title,
    idStatus: incipit !== null ? 'minted' : 'provisional',
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
  if (incipit !== null) record.incipit = incipit;

  // A document harvested from a pope's page and reassigned to a council carries its
  // promulgator in the reassignment row (Vatican I); one harvested from the council's
  // own index takes it from the council, which is one uniformly evidenced fact about
  // that council rather than sixteen repeated ones (spec §4.1).
  const council = COUNCILS.find((c) => c.pageSlug === item.pageSlug);
  const promulgatedBy = reassigned?.promulgatedBy ?? council?.promulgatedBy;
  if (promulgatedBy) record.promulgatedBy = promulgatedBy;
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
