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
 * Returns '' when the document prints none. It is never inferred and never guessed at: a
 * document with no argumentum is read individually (spec §6).
 */

/**
 * The HTML4 Latin-1 named character references vatican.va's older apostolic-constitution
 * pages markup diacritics with -- 'Bikoro&Euml;nsis', 'Copiapo&euml;nsis', '&laquo;
 * nullius &raquo;'. Left undecoded, an entity like '&Euml;' reads as the mixed-case letters
 * 'Euml' and trips the case test on the very first word of the argumentum, before the real
 * narrative body has even started. Decoded here into the accented character itself, which
 * the case test's `À-ÿ` range already expects.
 */
const HTML_ENTITIES: Record<string, string> = {
  nbsp: ' ', iexcl: '¡', cent: '¢', pound: '£', curren: '¤', yen: '¥', brvbar: '¦',
  sect: '§', uml: '¨', copy: '©', ordf: 'ª', laquo: '«', not: '¬', shy: '­', reg: '®',
  macr: '¯', deg: '°', plusmn: '±', sup2: '²', sup3: '³', acute: '´', micro: 'µ', para: '¶',
  middot: '·', cedil: '¸', sup1: '¹', ordm: 'º', raquo: '»', frac14: '¼', frac12: '½',
  frac34: '¾', iquest: '¿', Agrave: 'À', Aacute: 'Á', Acirc: 'Â', Atilde: 'Ã', Auml: 'Ä',
  Aring: 'Å', AElig: 'Æ', Ccedil: 'Ç', Egrave: 'È', Eacute: 'É', Ecirc: 'Ê', Euml: 'Ë',
  Igrave: 'Ì', Iacute: 'Í', Icirc: 'Î', Iuml: 'Ï', ETH: 'Ð', Ntilde: 'Ñ', Ograve: 'Ò',
  Oacute: 'Ó', Ocirc: 'Ô', Otilde: 'Õ', Ouml: 'Ö', times: '×', Oslash: 'Ø', Ugrave: 'Ù',
  Uacute: 'Ú', Ucirc: 'Û', Uuml: 'Ü', Yacute: 'Ý', THORN: 'Þ', szlig: 'ß', agrave: 'à',
  aacute: 'á', acirc: 'â', atilde: 'ã', auml: 'ä', aring: 'å', aelig: 'æ', ccedil: 'ç',
  egrave: 'è', eacute: 'é', ecirc: 'ê', euml: 'ë', igrave: 'ì', iacute: 'í', icirc: 'î',
  iuml: 'ï', eth: 'ð', ntilde: 'ñ', ograve: 'ò', oacute: 'ó', ocirc: 'ô', otilde: 'õ',
  ouml: 'ö', divide: '÷', oslash: 'ø', ugrave: 'ù', uacute: 'ú', ucirc: 'û', uuml: 'ü',
  yacute: 'ý', thorn: 'þ', yuml: 'ÿ', amp: '&', lt: '<', gt: '>', quot: '"', apos: '\'',
};

function decodeEntities(text: string): string {
  return text.replace(/&#x([0-9a-fA-F]+);/g, (_m, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_m, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&([A-Za-z]+);/g, (m, name) => HTML_ENTITIES[name] ?? m);
}

export function extractArgumentum(html: string): string {
  const stripped = decodeEntities(
    html
      .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  )
    .replace(/\s+/g, ' ')
    .trim();
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
