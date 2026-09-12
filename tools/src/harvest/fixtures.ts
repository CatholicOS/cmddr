/**
 * The checked-in fixture a shelf index page lives in: `tools/fixtures/{name}.html`, where
 * `name` is `{pageSlug}-{shelf}` (plus `-{year}` for one page of a year-partitioned shelf).
 * A *Messaggi* sub-shelf's shelf name is `messages/{sub-shelf}`; its slash becomes a hyphen
 * on disk (`francesco-messages-peace`), exactly as fetch-fixtures.sh names the file.
 */
export function fixtureName(pageSlug: string, shelf: string, year?: string): string {
  const base = `${pageSlug}-${shelf.replace(/\//g, '-')}`;
  return year === undefined ? base : `${base}-${year}`;
}
