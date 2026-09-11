import * as cheerio from 'cheerio';

/**
 * The argumentum of an apostolic constitution: the all-capitals line printed under the
 * toponym heading, stating the act in the document's own words -- 'IN BENINO NOVA CONDITUR
 * DIOECESIS DIUGUENSIS'. Present on 728 of the 742 circumscription candidates.
 *
 * Delimited by case: it runs from the genre heading to the first mixed-case word, which is
 * where the narrative body starts. Every token inside the argumentum itself is fully
 * capitalised -- including abbreviations like 'S.' and roman numerals -- so even a short
 * mixed-case word ('In', 'Ad') reliably marks where the body begins and is never exempted
 * on length alone.
 *
 * Returns '' only when no genre heading is found at all. When the heading is found but the
 * document prints no argumentum sentence after it, this returns just the bare toponym
 * (e.g. 'KYRGYZSTANIAE*') -- which is why the curation script treats a short result as an
 * abstention rather than a verdict, rather than this function ever returning '' for that
 * case. A document with no argumentum is read individually, never guessed at (spec §6).
 */
export function extractArgumentum(html: string): string {
  const $ = cheerio.load(html);
  $('script, style').remove();
  const stripped = $.root().text().replace(/\s+/g, ' ').trim();
  const start = stripped.match(/CONSTITUTIO APOSTOLICA|LITTERAE APOSTOLICAE|EPISTULA APOSTOLICA/);
  if (!start) return '';
  const rest = stripped.slice(start.index! + start[0].length).trim();
  const kept: string[] = [];
  for (const word of rest.split(' ').slice(0, 90)) {
    const letters = word.replace(/[^A-Za-zÀ-ÿ]/g, '');
    if (letters && letters !== letters.toUpperCase()) break;
    kept.push(word);
  }
  return kept.join(' ').trim();
}
