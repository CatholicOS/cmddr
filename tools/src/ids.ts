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
  if (!MINTED_ID_RE.test(id)) return null;
  const m = id.match(/^mag:([a-z0-9-]+)\/(.+)-(\d{4})(?:-\d{2}-\d{2})?$/);
  if (!m) return null;
  return { issuer: m[1]!, slug: m[2]!, year: m[3]! };
}
