import type { Cheerio, CheerioAPI } from 'cheerio';
import type { Element } from 'domhandler';

/**
 * Shared vatican.va DOM helpers for the flat-era and shelf-era adapters. Both sources
 * share the same `div.item` structure for URL and language extraction — only the
 * incipit/genre extraction differs, because the two layouts' headings genuinely differ.
 */
export const VATICAN_BASE = 'https://www.vatican.va';

/**
 * Resolves an item's absolute URL: prefer the heading's own anchor, falling back to
 * the first `.translation-field a` when the heading carries no link of its own (true
 * for 21 of Leo XIII's 86 encyclicals). Returns null if neither exists. A root-relative
 * href is prefixed with {@link VATICAN_BASE}; an already-absolute href is returned as-is.
 */
export function resolveItemUrl(
  $item: Cheerio<Element>,
  $heading: Cheerio<Element>,
): string | null {
  const href = $heading.find('a').first().attr('href')
    ?? $item.find('.translation-field a').first().attr('href')
    ?? null;
  if (!href) return null;
  return href.startsWith('http') ? href : VATICAN_BASE + href;
}

/** Trimmed, non-empty text of every `.translation-field a` in the item, in document order. */
export function extractLanguages($: CheerioAPI, $item: Cheerio<Element>): string[] {
  return $item.find('.translation-field a')
    .map((_i, a) => $(a).text().trim()).get().filter(Boolean);
}
