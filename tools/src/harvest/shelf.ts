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

/** Whether an `ISO YYYY-MM-DD` string names a real calendar month/day (year unchecked). */
function isPlausibleIsoDate(iso: string | undefined): iso is string {
  const m = iso?.match(/^\d{4}-(\d{2})-(\d{2})$/);
  if (!m) return false;
  const [, mo, d] = m.map(Number);
  return mo! >= 1 && mo! <= 12 && d! >= 1 && d! <= 31;
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
    const url = resolveItemUrl($item, $h2);
    const slugDates = slugDateReadings(url);
    // This shelf's own convention (see the module doc) is the reading worth trusting as a
    // fallback or for a mismatch comparison; the other reading is still returned above in
    // case a shelf breaks the pattern.
    const [ddmmyyyy, yyyymmdd] = slugDates;
    const preferredSlugDate = shelf === 'encyclicals' ? ddmmyyyy : yyyymmdd;

    const open = full.lastIndexOf('(');
    let headingText = open > 0 ? full.slice(0, open) : full;
    let date = open > 0 ? parseSourceDate(full.slice(open)) : null;

    // Task 16 (John Paul II): a large batch of apost_letters headings -- almost all
    // Marian-image-crowning or beatification/patronage letters -- pack a disambiguating
    // gloss into the SAME parenthetical as the date, dash-separated: 'Christifideles
    // dioecesis (Sancta Victoria - 7 ottobre 1993)'. Recovered here into headingText
    // (mirroring the two-separate-parens gloss shape already handled elsewhere, e.g. Pius
    // XII's 'Niangaraensis (Dorumaensis)(24 febbraio 1958)') rather than being silently
    // discarded with the rest of the date parenthetical. Confirmed against the fetched
    // fixtures: seven such headings share the incipit 'Christifideles dioecesis' and the
    // date 7 October 1993 alone, distinguished only by this gloss (each crowns/confirms a
    // different Marian image or patron saint for a different Polish diocese); six more
    // share 'Fideles ecclesialis' the same day, and two share 'Sancta Christi' on 4 August
    // 1997 -- without recovering the gloss, each batch collapses into a single record
    // under the pass-1 merge key (incipit+date), silently losing the rest. Guarded to fire
    // only when the pre-dash segment does not itself parse as a date, so a genuine date
    // RANGE (Pius XII's 'Il Film Ideale (21 giugno 1955 - 25 ottobre 1955)', its own
    // DATE_CORRECTIONS entry) is untouched -- there both sides of the dash are dates, so
    // the guard fails and the original single-date reading is kept.
    if (open > 0) {
      const close = full.lastIndexOf(')');
      const paren = close > open ? full.slice(open + 1, close) : full.slice(open + 1);
      const dashed = paren.match(/^(.*?)\s*-\s*(\d.*)$/);
      if (dashed) {
        const pre = dashed[1]!.trim();
        const post = dashed[2]!.trim();
        const postDate = parseSourceDate(post);
        if (pre !== '' && postDate !== null && parseSourceDate(pre) === null) {
          headingText = `${full.slice(0, open).trimEnd()} (${pre})`;
          date = postDate;
        }
      }
    }

    // Not every printed date is wrapped in parens: two Paul VI apost_letters headings
    // ('Multiformis Sapientia Dei, 27 settembre 1970'; 'Mirabilis in Ecclesia Deus, 4
    // ottobre 1970') print it as a bare trailing ', <day> <month> <year>' instead --
    // confirmed against each item's own URL slug (19700927; 19701004, both agreeing with
    // the parsed date). Without this, the date text would never be split off headingText
    // and would ride along into extractIncipit, baking itself into the incipit/id (the
    // dangerous silent-mint failure mode, not merely a missed incipit -- Task 14 review).
    // Scoped to only the unparenthesized case and only when the match reaches the very end
    // of the string, so it can never fire on a parenthetical date (already handled above)
    // or on an unrelated comma earlier in a gloss.
    if (!date && open <= 0) {
      const trailing = full.match(/,\s*(\d{1,2}\s*°?\s+[A-Za-zÀ-ÿ]+\s+\d{4})\s*$/);
      const parsed = trailing ? parseSourceDate(trailing[1]!) : null;
      if (parsed) {
        date = parsed;
        headingText = full.slice(0, trailing!.index).trimEnd();
      }
    }

    if (!date) {
      // No printed date at all (two real pius-xii/letters headings, e.g. 'Pontificia
      // Commissione per la Cinematografia', hf_p-xii_lett_01011952_...), or a printed one
      // that fails to parse (e.g. Pius X's 'augusto' transcription typo, tools/dates.ts):
      // either way, a silent `return` here used to drop the item with no trace at all --
      // the worst failure mode in this pipeline, worse than a wrong incipit, since nothing
      // ever surfaces it. Fall back to the URL slug's own date instead, loudly, and only
      // drop -- still with a warning naming the item -- when even that is unavailable.
      // Prefer this shelf's conventional reading, but only when it actually names a real
      // calendar date: both real fallback cases on record (pius-xii/letters) break the
      // shelf's usual YYYYMMDD convention and are only valid read the other way around
      // (e.g. '16121954' is 16 Dec 1954 read as DDMMYYYY; read as YYYYMMDD it is the
      // nonsensical year 1612, month 19).
      const fallbackDate = isPlausibleIsoDate(preferredSlugDate)
        ? preferredSlugDate
        : (slugDates.find(isPlausibleIsoDate) ?? null);
      if (fallbackDate) {
        console.warn(
          `No parseable printed date for '${full}' (${pageSlug}/${shelf}): `
          + `falling back to URL slug date ${fallbackDate}`,
        );
        date = fallbackDate;
        headingText = full; // no parenthetical was found/trusted, so nothing to strip
      } else {
        console.warn(`Dropping '${full}' (${pageSlug}/${shelf}): no printed date and no URL slug date`);
        return;
      }
    }

    const { title, incipit } = extractIncipit(headingText);
    if (!title) {
      // Silent loss is this pipeline's worst failure mode (see the date-fallback warning
      // above, and run.ts's provisional-id tally): an empty title after stripping the
      // date means the heading printed nothing else at all, or a date-extraction rule
      // mis-split it down to nothing -- either way, a human should see it rather than the
      // item vanishing with no trace (review finding, 2026-09-07).
      console.warn(`Dropping empty-title item '${full}' (${pageSlug}/${shelf})`);
      return;
    }

    const languages = extractLanguages($, $item);

    if (slugDates.length > 0 && !slugDates.includes(date)) {
      const correctionKey = `${pageSlug}|${shelf}|${slugify(incipit ?? title)}|${date}`;
      if (!DATE_CORRECTIONS[correctionKey]) {
        console.warn(
          `Printed/slug date mismatch for '${title}' (${pageSlug}/${shelf}): `
          + `printed ${date}, slug ${preferredSlugDate}`,
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
