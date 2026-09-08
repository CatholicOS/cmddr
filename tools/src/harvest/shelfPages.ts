import * as cheerio from 'cheerio';

export type ShelfPages =
  | { kind: 'aggregate' }
  | { kind: 'years'; years: string[] };

/**
 * Decide how a shelf index page holds its contents (spec §2.2, §2.3).
 *
 * A page carrying `div.item` carries the shelf's *whole* contents -- the year links some
 * such pages also show are navigation, not paging -- so its items are read directly.
 * A page carrying only year links must have each year page fetched and parsed instead.
 *
 * A page with neither is not an empty shelf; it means vatican.va has changed shape, and
 * CI should say so rather than silently harvesting nothing.
 *
 * `shelf` scopes the year-link scan to this shelf's own links: a year-partitioned shelf's
 * page (e.g. John XXIII's apost_constitutions) carries a sidebar of cross-navigation links
 * to *other* shelves' year pages too (letters, speeches, apost_letters, messages,
 * homilies…), all matching the bare `/YYYY.index.html` suffix. Without the `/${shelf}/`
 * prefix check, those sidebar links leak into this shelf's year set -- e.g. picking up
 * apost_letters' 1963 for apost_constitutions, whose own aggregate page links only
 * 1958-1962. First caught on real data in Task 13 (John XXIII).
 */
export function resolveShelfPages(html: string, shelf: string): ShelfPages {
  const $ = cheerio.load(html);
  if ($('div.item').length > 0) return { kind: 'aggregate' };

  const escapedShelf = shelf.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const yearLink = new RegExp(`/${escapedShelf}/((?:18|19|20)\\d{2})\\.index\\.html$`);
  const years = new Set<string>();
  $('a[href]').each((_i, a) => {
    const m = $(a).attr('href')?.match(yearLink);
    if (m) years.add(m[1]!);
  });
  if (years.size === 0) {
    throw new Error('shelf index has neither items nor year links; vatican.va has changed shape');
  }
  return { kind: 'years', years: [...years].sort() };
}
