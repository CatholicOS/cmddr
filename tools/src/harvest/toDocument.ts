import { slugify } from '../slug.js';
import { mintId, mintProvisionalId, mintSeriesId } from '../ids.js';
import { easterSunday } from '../dates.js';
import {
  VATICAN_SLUG_TO_ISSUER, SOURCE_GENRE_TO_GENRE, CONCILIAR_SOURCE_GENRE_TO_GENRE,
  CONCILIAR_REASSIGNMENTS, COUNCILS, RECOVERED_INCIPITS, GENRE_OVERRIDES, keywordsFor,
  CIRCUMSCRIPTION_KEYWORDS, seriesForShelf, SERIES_OCCASION_YEARS, SERIES_ORDINALS,
  SERIES_EXCLUSIONS,
} from '../mappings/index.js';
import { readOrdinal, readOccasionYear } from './seriesTitle.js';
import type { DocumentRecord, HarvestItem } from '../types.js';

/** Thrown for a series item that neither the parser nor a curated row can give an occasion year. */
export class MissingOccasionYearError extends Error {
  constructor(readonly item: HarvestItem, readonly reason: string) {
    super(
      `No occasion year for '${item.title}' (${item.pageSlug}/${item.shelf}, ${item.date}): `
      + `${reason}; a series document without an occasion year has no id -- add a row to `
      + 'SERIES_OCCASION_YEARS quoting the heading, or correct the title parser',
    );
  }
}

const curationKey = (item: HarvestItem) =>
  `${item.pageSlug}|${item.shelf}|${slugify(item.title)}|${item.date}`;

/**
 * The series step (messages spec §5.2), taken ahead of the generic genre mapping for every
 * item of a `messages/{sub-shelf}` shelf. The shelf decides the series and the series
 * decides the genre, so SOURCE_GENRE_TO_GENRE cannot key these by shelf name alone.
 * Returns null for any other shelf.
 */
function seriesStep(item: HarvestItem, issuerId: string): Pick<
  DocumentRecord, 'id' | 'idStatus' | 'genre' | 'series' | 'actKind'
> | null {
  const shelfSeries = seriesForShelf(item.shelf);
  if (shelfSeries === null) return null;

  if (shelfSeries.kind === 'urbi') {
    // Two dated series, assigned by date (§2.4, §3.2.7): the shelf's titles are
    // inconsistent ('Messaggio Urbi et Orbi - 1975'), the date is not. Every other item on
    // the shelf -- a first blessing after election, a Jubilee closing, the Momento
    // straordinario di preghiera of 27 March 2020 -- is an Urbi et Orbi with no series and
    // takes the provisional form; the orchestrator adds an ordinal where two share a date.
    const year = Number(item.date.slice(0, 4));
    const row = item.date.endsWith('-12-25') ? shelfSeries.christmas
      : item.date === easterSunday(year) ? shelfSeries.easter
      : null;
    return row === null
      ? {
        id: mintProvisionalId(issuerId, 'urbi-et-orbi', item.date), idStatus: 'provisional',
        genre: 'urbi-et-orbi', actKind: 'liturgical',
      }
      : {
        id: mintSeriesId(issuerId, row.id, year), idStatus: 'minted',
        genre: 'urbi-et-orbi', series: { id: row.id, year }, actKind: 'liturgical',
      };
  }

  // An item filed on a series sub-shelf that is not a member of the series (Paul VI's
  // 'Giornata Mondiale del Malato - 1975', a Holy Year day, not the annual day of 1993 on)
  // keeps the shelf's genre and takes the provisional form, exactly as a pont-messages
  // item will: no occasion, no series-form id (SERIES_EXCLUSIONS, one row so far).
  const key = curationKey(item);
  if (SERIES_EXCLUSIONS[key]) {
    return {
      id: mintProvisionalId(issuerId, 'message', item.date), idStatus: 'provisional', genre: 'message',
    };
  }

  // A curated row is consulted first and wins where it exists, so that a heading which
  // prints a demonstrably wrong value can be corrected with its evidence beside it; the
  // parser reads only what the title prints, and never derives a year from `date` or an
  // ordinal from the vocabulary's firstYear (§3.2.4, §3.2.5).
  const curatedYear = SERIES_OCCASION_YEARS[key];
  const readYear = readOccasionYear(item.title);
  const year = curatedYear?.year
    ?? (readYear.kind === 'read' ? readYear.value : undefined);
  if (year === undefined) {
    throw new MissingOccasionYearError(item, readYear.kind === 'ambiguous'
      ? `the title prints more than one year (${readYear.printed.join(', ')})`
      : 'the title prints no four-digit year');
  }

  const curatedOrdinal = SERIES_ORDINALS[key];
  const readOrd = readOrdinal(item.title);
  const ordinal = curatedOrdinal?.ordinal
    ?? (readOrd.kind === 'read' ? readOrd.value : undefined);
  if (curatedOrdinal === undefined && readOrd.kind === 'unreadable') {
    console.warn(
      `Unreadable ordinal '${readOrd.printed}' in '${item.title}' (${item.pageSlug}/${item.shelf}): `
      + 'recorded without one; add a SERIES_ORDINALS row quoting the heading if it is a numeral',
    );
  }

  // The series rule triggers on membership, not genre: a homily given on the day and filed
  // by vatican.va on the series sub-shelf is a member of the series with the series-form
  // id, but its genre is what the act is. Measured over every messages/* shelf on
  // 2026-09-12: exactly 11 items carry `omelia` in their URL, all of them Francis's
  // consecrated_life pages 2014-2022, 2024 and 2025 (…_omelia-vita-consacrata.html,
  // …_omelia-vitaconsacrata.html, …-omelia-presentazione-del-signore.html); the 2023 item is
  // a messaggio. Adjudicated by the repository owner on PR #26.
  const genre = /omelia/.test(item.url ?? '') ? 'homily' : 'message';
  const row = shelfSeries.row;
  return {
    id: mintSeriesId(issuerId, row.id, year), idStatus: 'minted', genre,
    series: { id: row.id, year, ...(ordinal !== undefined ? { ordinal } : {}) },
  };
}

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

  // A shelf can misfile a document -- vatican.va lists John XXIII's Rosary meditations on
  // apost_letters, beside the letter they accompany. The override replaces the genre only;
  // `sourceGenreLabel` below still records the shelf verbatim, so what the source said is
  // never hidden, and the provisional id follows the corrected genre as it does everywhere.
  const genre = GENRE_OVERRIDES[`${item.pageSlug}|${slugify(item.title)}|${item.date}`]?.genre
    ?? mapping.genre;

  // An incipit the source itself printed always wins. The curated table is consulted only
  // where the heading printed none -- the provisional shelf -- so a recovered row can never
  // shadow a printed incipit, and the act's own name is restored where the index page
  // simply did not carry it (see recovered-incipits.ts for the evidence behind each row).
  const recovered = item.incipit === null
    ? RECOVERED_INCIPITS[`${item.pageSlug}|${slugify(item.title)}|${item.date}`]
    : undefined;
  const incipit = item.incipit ?? recovered?.incipit ?? null;

  // A *Messaggi* series item is keyed by occasion, not by first words (messages spec §3):
  // the id, its status, the genre and the series come from the series step, and the
  // incipit rules above are not consulted. The step is null for every other shelf.
  const series = seriesStep(item, issuerId);

  const record: DocumentRecord = {
    id: series?.id ?? (incipit !== null
      ? mintId(issuerId, incipit, item.date)
      // No incipit is printed and none has been recovered, so the id cannot be name-based.
      // The genre slug plus the full date is the provisional form (spec §3.5); the ordinal,
      // where two share a date, is assigned by the orchestrator, which alone sees the group.
      : mintProvisionalId(issuerId, genre ?? slugify(item.sourceGenreLabel), item.date)),
    title: item.title,
    idStatus: series?.idStatus ?? (incipit !== null ? 'minted' : 'provisional'),
    genre: series ? series.genre : genre,
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
  if (series?.series) record.series = series.series;
  // Every Urbi et Orbi is a liturgical act -- the blessing is the act, the address before
  // it is assessed per statement (#15) -- whether or not it belongs to a dated series.
  if (series?.actKind) record.actKind = series.actKind;

  // A document harvested from a pope's page and reassigned to a council carries its
  // promulgator in the reassignment row (Vatican I); one harvested from the council's
  // own index takes it from the council, which is one uniformly evidenced fact about
  // that council rather than sixteen repeated ones (spec §4.1).
  const council = COUNCILS.find((c) => c.pageSlug === item.pageSlug);
  const promulgatedBy = reassigned?.promulgatedBy ?? council?.promulgatedBy;
  if (promulgatedBy) record.promulgatedBy = promulgatedBy;
  if (item.aliases?.length) record.aliases = [...item.aliases];
  // Characteristics come from the mapping of the *kept* record's label, and a merge keeps the
  // more specific shelf (merge.ts): a document filed on both apost_letters and motu_proprio
  // keeps apost_letters and records the other filing only in alsoShelvedAs. The motu proprio
  // fact would otherwise survive nowhere else -- Socialium Scientiarum (John Paul II, 1994)
  // is the issue #10 example, and 66 apostolic letters across four pontificates (55 Francis,
  // 6 Leo XIV, 4 Paul VI, 1 John Paul II) were in that position when the characteristic was
  // introduced -- so the second shelf contributes its characteristic here. Sorted and
  // deduplicated so the harvest stays reproducible whichever shelf won the merge.
  // A series item carries no characteristics (messages spec §5.2): the generic mapping of
  // its `messages/…` label is `genre: null` and contributes none, and no message is filed
  // on motu_proprio.
  const characteristics = new Set(series ? [] : mapping.characteristics ?? []);
  if (item.alsoShelvedAs?.includes('motu_proprio')) characteristics.add('motu-proprio');
  if (characteristics.size) record.characteristics = [...characteristics].sort();
  if (mapping.descriptiveTitle) record.descriptiveTitle = mapping.descriptiveTitle;
  // Never authority-bearing (invariant 21 is the only rule that reads it): read purely
  // from the heading text or the hand-curated table, never from genre/characteristics.
  const keywords = keywordsFor(item);
  if (keywords.length) record.keywords = keywords;
  // Derived from the keyword pipeline, the single evidenced source: each of the three
  // circumscription keywords names an act of governance (an erection, an elevation or a
  // union of sees), so a document that earned one is a governance act, not a teaching act
  // (#15). Absent means teaching. Read off the named set, not off `keywords.length`, so a
  // keyword minted later for a teaching subject does not make its documents governance
  // acts by accident. Like `keywords`, `actKind` is never authority-bearing: the schema
  // enum is the only check, and no invariant couples it to a genre or a ceiling.
  if (!record.actKind && keywords.some((k) => CIRCUMSCRIPTION_KEYWORDS.has(k))) {
    record.actKind = 'governance';
  }
  // The genre label exactly as vatican.va prints it (spec §4.1), preserved unconditionally
  // so the genre mapping stays auditable from the data, not only when genre is null.
  record.sourceGenreLabel = item.sourceGenreLabel;

  return record;
}
