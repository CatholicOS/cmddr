import { slugify } from '../slug.js';
import {
  GENRE_PREFIXES, GLOSS_CONNECTORS, BARE_GENRE_SLUGS, MAX_INCIPIT_WORDS,
} from '../mappings/incipit-rules.js';

export interface HeadingParts {
  /** The full printed heading, minus its trailing (date). Never empty for a real item. */
  title: string;
  /** The opening words of the document proper, when the heading contains them. */
  incipit: string | null;
}

const BY_LENGTH = [...GENRE_PREFIXES].sort((a, b) => b.length - a.length);

/** Opening/closing quote pairs seen on vatican.va headings. */
const QUOTES: ReadonlyArray<[string, string]> = [
  ['«', '»'], ['“', '”'], ['‘', '’'], ['"', '"'], ["'", "'"],
];

/**
 * Strip a leading genre phrase, longest first. The phrase must be followed by end-of-string
 * or a non-letter, so 'Lettera' cannot eat the start of a word that merely begins with it.
 */
function stripGenrePrefix(s: string): { rest: string; stripped: boolean } {
  const lower = s.toLowerCase();
  for (const p of BY_LENGTH) {
    if (!lower.startsWith(p.toLowerCase())) continue;
    const after = s[p.length];
    if (after !== undefined && /\p{L}/u.test(after)) continue;
    return { rest: s.slice(p.length).replace(/^[\s.,:;-]+/, ''), stripped: true };
  }
  return { rest: s, stripped: false };
}

/** The content of a quoted span opening the string, or null. */
function quotedOpening(s: string): string | null {
  for (const [open, close] of QUOTES) {
    if (!s.startsWith(open)) continue;
    const end = s.indexOf(close, open.length);
    if (end > open.length) return s.slice(open.length, end).trim();
  }
  return null;
}

/** The earliest gloss-connector index in the string, or -1. */
function glossCut(s: string): number {
  let best = -1;
  for (const c of GLOSS_CONNECTORS) {
    const i = s.indexOf(c);
    if (i > 0 && (best === -1 || i < best)) best = i;
  }
  return best;
}

/**
 * Split a printed heading into its title and, where the heading contains one, its incipit.
 * The heading must already have had its trailing (date) removed. See spec §4.2.
 */
export function extractIncipit(heading: string): HeadingParts {
  const title = heading.trim();
  if (title === '') return { title, incipit: null };

  const { rest, stripped } = stripGenrePrefix(title);
  if (rest === '') return { title, incipit: null };

  const quoted = quotedOpening(rest);
  if (quoted !== null) {
    return { title, incipit: BARE_GENRE_SLUGS.has(slugify(quoted)) ? null : quoted };
  }

  // An incipit is capitalised; a lower-case residue continues the genre phrase as gloss
  // ('Lettera Apostolica (breve) che proclama...', 'Chirografo al Cardinale...').
  const first = rest[0]!;
  if (first === first.toLowerCase() && first !== first.toUpperCase()) {
    return { title, incipit: null };
  }

  const cut = glossCut(rest);
  const candidate = (cut === -1 ? rest : rest.slice(0, cut)).replace(/[\s.,:;-]+$/, '').trim();
  if (candidate === '' || BARE_GENRE_SLUGS.has(slugify(candidate))) {
    return { title, incipit: null };
  }

  // The word ceiling catches a gloss the rules did not recognise. It applies only when
  // nothing was stripped and nothing was cut -- a result the rules did act on is trusted.
  const untouched = !stripped && cut === -1;
  if (untouched && candidate.split(/\s+/).length > MAX_INCIPIT_WORDS) {
    return { title, incipit: null };
  }

  return { title, incipit: candidate };
}
