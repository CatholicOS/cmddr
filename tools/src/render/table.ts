import type { DocumentRecord } from '../types.js';

/** Escape a Markdown table cell's own column separator; the source is scraped text. */
export const cell = (s: string): string => s.replace(/\|/g, '\\|');

/** Codepoint order, not locale collation -- see ordinals.ts for why: this sort feeds
 *  checked-in rendered files (registry/documents/**), so it must produce the same byte
 *  output on every machine and CI runner regardless of ICU data or LANG. Both `date`
 *  (ISO, all-ASCII) and `id` are plain ASCII, so `<`/`>` is equivalent to a correct
 *  string sort here and carries no locale dependency at all. */
const cmp = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0);

/** Chronological, with the id as a stable tie-break. Shared by both views. */
export const byDateThenId = (a: DocumentRecord, b: DocumentRecord): number =>
  a.date === b.date ? cmp(a.id, b.id) : cmp(a.date, b.date);

/** A provisional id is daggered so the distinction is visible without consulting idStatus. */
export const idCell = (d: DocumentRecord): string =>
  d.idStatus === 'provisional' ? `\`${d.id}\` †` : `\`${d.id}\``;

export const genreCell = (d: DocumentRecord): string =>
  d.genre ?? `— (${cell(d.sourceGenreLabel ?? 'unmapped')})`;

export const FOOTNOTE =
  '† A provisional identifier: the source prints no incipit for this document, '
  + 'so the id is genre-and-date based and may be re-minted if a conventional name '
  + 'is established. See the design spec §3.5.';
