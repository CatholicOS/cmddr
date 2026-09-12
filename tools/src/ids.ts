import { slugify } from './slug.js';

export const MINTED_ID_RE =
  /^mag:[a-z0-9-]+\/[a-z0-9]+(?:-[a-z0-9]+)*-\d{4}(?:-\d{2}-\d{2})?$/;

export const PROVISIONAL_ID_RE =
  /^mag:[a-z0-9-]+\/[a-z0-9]+(?:-[a-z0-9]+)*-\d{4}-\d{2}-\d{2}(?:-\d+)?$/;

export function issuerLocalPart(issuerId: string): string {
  const m = issuerId.match(/^(rp|oec):([a-z0-9-]+)$/);
  if (!m) throw new Error(`issuerId must carry an 'rp:' or 'oec:' prefix, got: ${issuerId}`);
  return m[2]!;
}

export function mintId(
  issuerId: string,
  incipit: string,
  date: string,
  opts: { fullDate?: boolean } = {},
): string {
  const suffix = opts.fullDate ? date : date.slice(0, 4);
  return `mag:${issuerLocalPart(issuerId)}/${slugify(incipit)}-${suffix}`;
}

/**
 * The series form (messages spec §3.1): `mag:{issuer}/{series-id}-{occasion-year}`. Keyed by
 * occasion, not by first words, because that is how these acts are cited (AAS: "Nuntius
 * S.P. pro XCVII Die Mundiali Missionum") and because the signing date routinely falls in
 * the year before the occasion. `seriesId` is a `data/series.json` id and is already in
 * slug form, so the id round-trips through parseId exactly as an incipit slug does
 * (invariant 12's series branch). The result matches MINTED_ID_RE; a series-form id is
 * never extended to the full date, since one issuer has one document per occasion year
 * and a second is a harvest error rather than a collision to discriminate (§3.2.6).
 */
export function mintSeriesId(issuerId: string, seriesId: string, occasionYear: number): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(seriesId)) {
    throw new Error(`series id is not slug-form: ${seriesId}`);
  }
  if (!Number.isInteger(occasionYear) || occasionYear < 1000 || occasionYear > 9999) {
    throw new Error(`occasion year is not a four-digit integer: ${occasionYear}`);
  }
  return `mag:${issuerLocalPart(issuerId)}/${seriesId}-${occasionYear}`;
}

export function mintProvisionalId(
  issuerId: string,
  genreSlug: string,
  date: string,
  ordinal?: number,
): string {
  const tail = ordinal === undefined ? '' : `-${ordinal}`;
  return `mag:${issuerLocalPart(issuerId)}/${genreSlug}-${date}${tail}`;
}

export function parseId(id: string): { issuer: string; slug: string; year: string } | null {
  const provisional = id.match(/^mag:([a-z0-9-]+)\/(.+?)-(\d{4})-\d{2}-\d{2}(?:-\d+)?$/);
  if (PROVISIONAL_ID_RE.test(id) && provisional) {
    return { issuer: provisional[1]!, slug: provisional[2]!, year: provisional[3]! };
  }
  const minted = id.match(/^mag:([a-z0-9-]+)\/(.+)-(\d{4})(?:-\d{2}-\d{2})?$/);
  if (MINTED_ID_RE.test(id) && minted) {
    return { issuer: minted[1]!, slug: minted[2]!, year: minted[3]! };
  }
  return null;
}
