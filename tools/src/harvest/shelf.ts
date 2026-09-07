import * as cheerio from 'cheerio';
import { parseSourceDate } from '../dates.js';
import type { HarvestItem } from '../types.js';

const BASE = 'https://www.vatican.va';

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

    const incipit = full.slice(0, open).trim();
    const date = parseSourceDate(full.slice(open));
    if (!incipit || !date) return;

    const href = $h2.find('a').first().attr('href')
      ?? $item.find('.translation-field a').first().attr('href')
      ?? null;

    const languages = $item.find('.translation-field a')
      .map((_i, a) => $(a).text().trim()).get().filter(Boolean);

    items.push({
      incipit,
      date,
      sourceGenreLabel: shelf,
      url: href ? (href.startsWith('http') ? href : BASE + href) : null,
      languages,
      shelf,
      pageSlug,
    });
  });

  return items;
}
