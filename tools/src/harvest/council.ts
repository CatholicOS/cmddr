import * as cheerio from 'cheerio';
import { ARCHIVE_LANGUAGE_SUFFIXES } from '../mappings/index.js';
import { slugify } from '../slug.js';
import type { CouncilSource } from '../mappings/councils.js';
import type { HarvestItem } from '../types.js';

const ARCHIVE_BASE = 'https://www.vatican.va/archive/hist_councils';

/** `documents/vat-ii_const_19641121_lumen-gentium_it.html` -> `1964-11-21`. */
function dateFromHref(href: string): string | null {
  const m = href.match(/_(\d{4})(\d{2})(\d{2})_/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

/**
 * The registry language code for one translation link. Chinese is not a `documents/`
 * link at all but a PDF elsewhere on the site, so it is recognised by path rather than
 * by suffix. An unrecognised suffix throws: silently dropping a language would leave a
 * record quietly claiming fewer translations than the source offers.
 */
function languageOf(href: string): string {
  if (href.includes('/chinese/')) return 'ZH';
  const m = href.match(/_([a-z]{2})\.(?:html|pdf)$/);
  const code = m ? ARCHIVE_LANGUAGE_SUFFIXES[m[1]!] : undefined;
  if (!code) throw new Error(`Unknown vatican.va archive language suffix in '${href}'`);
  return code;
}

/**
 * Archive-era council index pages (`/archive/hist_councils/{slug}/index_it.htm`). A
 * third page shape, sharing no markup with the flat-era or shelf-era pope pages: no
 * `div.item`, no `<h2>{heading} ({date})</h2>`. Documents are `<li>` entries grouped
 * under `<p><b>{Section}</b></p>` headings, each `<li>` holding a bold anchor to the
 * Italian text and a `<font size="2">` bar of translation links.
 *
 * The page prints no date and no genre qualifier (spec §2.2), so the date is read from
 * the anchor's own URL slug and the genre label from the council's curated table. The
 * table is a closed set: anything the page carries that the table does not name, or the
 * table names that the page does not carry, throws. Sixteen documents that have not
 * changed since 1965 are not a corpus that grows; a surprise here means the page shape
 * changed and a human must look.
 */
export function parseCouncilIndex(html: string, council: CouncilSource): HarvestItem[] {
  const $ = cheerio.load(html);
  const items: HarvestItem[] = [];
  const seen = new Set<string>();
  let section: string | null = null;

  // `p > b` matches only the three section headings: the page title is wrapped in a
  // <font>, so its <b> is not a direct child of the <p>. css-select returns matches in
  // document order, so a heading is always seen before the items it introduces.
  $('p > b, li').each((_, el) => {
    if (el.tagName === 'b') {
      section = $(el).text().replace(/\s+/g, ' ').trim();
      return;
    }

    const $li = $(el);
    const $anchor = $li.find('a').first();
    const href = $anchor.attr('href');
    const incipit = $anchor.text().replace(/\s+/g, ' ').trim();
    if (!href || !incipit) {
      throw new Error(`Council index item with no anchor or no text: '${$li.text().trim()}'`);
    }

    const slug = slugify(incipit);
    const row = council.documents[slug];
    if (!row) {
      throw new Error(
        `'${incipit}' (${council.pageSlug}) is not in the curated table -- the index `
        + 'carries a document the registry does not know about');
    }
    if (seen.has(slug)) throw new Error(`'${incipit}' appears twice on ${council.pageSlug}`);
    seen.add(slug);

    if (section !== row.section) {
      throw new Error(
        `'${incipit}' is filed under section '${section}' but the curated table `
        + `records '${row.section}'`);
    }

    const date = dateFromHref(href);
    if (!date) throw new Error(`No date in the URL slug for '${incipit}': '${href}'`);
    // The URL slug is the only date the index carries, so it is the date kept. The
    // curated row's printedDate -- read from the document itself -- is a cross-check,
    // never an override: where the two disagree the harvest stops rather than picking
    // a winner (spec §6).
    if (date !== row.printedDate) {
      throw new Error(
        `Date disagreement for '${incipit}': URL slug says ${date}, the document `
        + `prints ${row.printedDate}`);
    }

    // The bold anchor is excluded here and its own language counted through the bar,
    // which lists Italiano too -- so the set matches the code bar each document prints.
    const languages = $li.find('font a').map((_i, a) => {
      const lang = $(a).attr('href');
      if (!lang) throw new Error(`Translation link with no href for '${incipit}'`);
      return languageOf(lang);
    }).get();

    items.push({
      title: incipit,
      incipit,
      date,
      sourceGenreLabel: row.sourceGenreLabel,
      url: href.startsWith('http') ? href
        : href.startsWith('/') ? `https://www.vatican.va${href}`
        : `${ARCHIVE_BASE}/${council.pageSlug}/${href}`,
      languages: [...new Set(languages)],
      shelf: null,
      pageSlug: council.pageSlug,
    });
  });

  const missing = Object.keys(council.documents).filter((slug) => !seen.has(slug));
  if (missing.length > 0) {
    throw new Error(
      `${missing.length} curated row(s) matched no item on ${council.pageSlug}: `
      + missing.join(', '));
  }

  return items;
}
