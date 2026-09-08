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
 */
export function resolveShelfPages(html: string): ShelfPages {
  const $ = cheerio.load(html);
  if ($('div.item').length > 0) return { kind: 'aggregate' };

  const years = new Set<string>();
  $('a[href]').each((_i, a) => {
    const m = $(a).attr('href')?.match(/\/((?:18|19|20)\d{2})\.index\.html$/);
    if (m) years.add(m[1]!);
  });
  if (years.size === 0) {
    throw new Error('shelf index has neither items nor year links; vatican.va has changed shape');
  }
  return { kind: 'years', years: [...years].sort() };
}
