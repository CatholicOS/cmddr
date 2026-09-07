import * as cheerio from 'cheerio';
import { parseSourceDate } from '../dates.js';
import { SOURCE_GENRE_TO_GENRE } from '../mappings/index.js';
import { resolveItemUrl, extractLanguages } from './dom.js';
import type { HarvestItem } from '../types.js';

// Longest first, so 'costituzione apostolica' wins over a hypothetical 'costituzione'.
const LABELS = Object.keys(SOURCE_GENRE_TO_GENRE).sort((a, b) => b.length - a.length);

/**
 * Fallback for a heading with no italic tag at all. Every heading in the currently
 * checked-in fixtures carries an italic tag — including 'Epistola Ecclesia Dei
 * (2 marzo 1871)', which uses an uppercase `<I>` that cheerio normalises to lowercase
 * on parse, so `$h2.find('i')` matches it like any other entry — so this branch does
 * not fire against them. It exists as defense-in-depth for a genuinely untagged
 * heading on a flat-era pope page not yet harvested: strip the trailing (date), then
 * the longest matching known genre label; what remains is the incipit.
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
    const parenIdx = full.lastIndexOf('(');
    if (parenIdx === -1) return;
    const date = parseSourceDate(full.slice(parenIdx));
    if (!date) return;

    const italic = $h2.find('i').first().text().replace(/\s+/g, ' ').trim();
    const split = splitGenreAndIncipit(full);
    const incipit = italic || split.incipit;
    if (!incipit) return;

    const cut = italic ? full.indexOf(italic) : -1;
    const sourceGenreLabel = (italic && cut > 0 ? full.slice(0, cut) : split.genre).trim();

    const url = resolveItemUrl($item, $h2);
    const languages = extractLanguages($, $item);

    items.push({
      title: incipit,
      incipit,
      date,
      sourceGenreLabel,
      url,
      languages,
      shelf: null,
      pageSlug,
    });
  });

  return items;
}
