import * as cheerio from 'cheerio';
import { parseSourceDate } from '../dates.js';
import { SOURCE_GENRE_TO_GENRE } from '../mappings/index.js';
import type { HarvestItem } from '../types.js';

const BASE = 'https://www.vatican.va';

// Longest first, so 'costituzione apostolica' wins over a hypothetical 'costituzione'.
const LABELS = Object.keys(SOURCE_GENRE_TO_GENRE).sort((a, b) => b.length - a.length);

/**
 * Fallback for the one entry whose incipit carries no <i> wrapper
 * ('Epistola Ecclesia Dei (2 marzo 1871)'): strip the trailing (date), then the
 * longest matching known genre label; what remains is the incipit.
 */
function splitGenreAndIncipit(full: string): { genre: string; incipit: string } {
  const body = full.replace(/\s*\([^)]*\)\s*$/, '').trim();
  const lower = body.toLowerCase();
  for (const label of LABELS) {
    if (lower.startsWith(label + ' ')) {
      return { genre: body.slice(0, label.length).trim(), incipit: body.slice(label.length).trim() };
    }
  }
  return { genre: '', incipit: body };
}

/**
 * Flat-era pope landing pages (Benedict XIV .. Pius IX): one reverse-chronological
 * list, each item shaped `<h2><a> {Genre} <i>{Incipit}</i> ({date}) </a></h2>`.
 * The URL slug is truncated and carries collapsed markup, so it is never parsed.
 */
export function parseFlatIndex(html: string, pageSlug: string): HarvestItem[] {
  const $ = cheerio.load(html);
  const items: HarvestItem[] = [];

  $('div.item').each((_, el) => {
    const $item = $(el);
    const $h2 = $item.find('h2').first();
    if ($h2.length === 0) return;

    const full = $h2.text().replace(/\s+/g, ' ').trim();
    const date = parseSourceDate(full.slice(full.lastIndexOf('(')));
    if (!date) return;

    const italic = $h2.find('i').first().text().replace(/\s+/g, ' ').trim();
    const split = splitGenreAndIncipit(full);
    const incipit = italic || split.incipit;
    if (!incipit) return;

    const cut = italic ? full.indexOf(italic) : -1;
    const sourceGenreLabel = (italic && cut > 0 ? full.slice(0, cut) : split.genre).trim();

    const href = $h2.find('a').first().attr('href')
      ?? $item.find('.translation-field a').first().attr('href')
      ?? null;

    const languages = $item.find('.translation-field a')
      .map((_i, a) => $(a).text().trim()).get().filter(Boolean);

    items.push({
      incipit,
      date,
      sourceGenreLabel,
      url: href ? (href.startsWith('http') ? href : BASE + href) : null,
      languages,
      shelf: null,
      pageSlug,
    });
  });

  return items;
}
