import * as cheerio from 'cheerio';
import { parseSourceDate } from '../dates.js';
import { resolveItemUrl, extractLanguages } from './dom.js';
import { slugify } from '../slug.js';
import { DATE_CORRECTIONS } from '../mappings/index.js';
import { extractIncipit } from './incipit.js';
import type { HarvestItem } from '../types.js';

/**
 * The printed date is always the value we keep (see module doc above), but it can still
 * be cross-checked against the slug's own date, which the encyclicals shelf formats
 * `DDMMYYYY` and the other seven `YYYYMMDD`. Returns both readings of the `_{8 digits}_`
 * group in the resolved URL, or `[]` when the URL carries no such group.
 */
function slugDateReadings(url: string | null): string[] {
  const m = url?.match(/_(\d{8})_/);
  if (!m) return [];
  const g = m[1]!;
  const ddmmyyyy = `${g.slice(4, 8)}-${g.slice(2, 4)}-${g.slice(0, 2)}`;
  const yyyymmdd = `${g.slice(0, 4)}-${g.slice(4, 6)}-${g.slice(6, 8)}`;
  return [ddmmyyyy, yyyymmdd];
}

/**
 * Shelf-era index pages (Leo XIII onward). Items are `<h2>{Incipit} ({date})</h2>`,
 * sometimes wrapped in an <a> and sometimes not — 21 of Leo XIII's 86 encyclicals
 * link only from .translation-field. There is no <i> element here, and the URL slug
 * abbreviates the incipit (_adiutricem for 'Adiutricem populi'), so the incipit is
 * always taken from the heading text. The slug's date is likewise never parsed: the
 * encyclicals shelf formats it DDMMYYYY and the other seven YYYYMMDD, so the printed
 * parenthetical is the only uniform source.
 */
export function parseShelfIndex(html: string, pageSlug: string, shelf: string): HarvestItem[] {
  const $ = cheerio.load(html);
  const items: HarvestItem[] = [];

  $('div.item').each((_, el) => {
    const $item = $(el);
    const $h2 = $item.find('h2').first();
    if ($h2.length === 0) return;

    const full = $h2.text().replace(/\s+/g, ' ').trim();
    const open = full.lastIndexOf('(');
    if (open <= 0) return;

    const { title, incipit } = extractIncipit(full.slice(0, open));
    const date = parseSourceDate(full.slice(open));
    if (!title || !date) return;

    const url = resolveItemUrl($item, $h2);
    const languages = extractLanguages($, $item);

    const slugDates = slugDateReadings(url);
    if (slugDates.length > 0 && !slugDates.includes(date)) {
      const correctionKey = `${pageSlug}|${shelf}|${slugify(incipit ?? title)}|${date}`;
      if (!DATE_CORRECTIONS[correctionKey]) {
        // This shelf's own convention (see the module doc) is the reading worth showing;
        // the other reading was still checked above in case a shelf breaks the pattern.
        const [ddmmyyyy, yyyymmdd] = slugDates;
        const slugDate = shelf === 'encyclicals' ? ddmmyyyy : yyyymmdd;
        console.warn(
          `Printed/slug date mismatch for '${title}' (${pageSlug}/${shelf}): `
          + `printed ${date}, slug ${slugDate}`,
        );
      }
    }

    items.push({
      title,
      incipit,
      date,
      sourceGenreLabel: shelf,
      url,
      languages,
      shelf,
      pageSlug,
    });
  });

  return items;
}
