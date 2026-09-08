import { slugify } from '../slug.js';
import {
  GENRE_PREFIXES, GLOSS_CONNECTORS, BARE_GENRE_SLUGS, MAX_INCIPIT_WORDS,
  NARRATIVE_OPENERS, ADDRESS_ARTICLES, ADDRESS_HONORIFICS, MIN_WORDS_BEFORE_CUT,
  CUT_GUARD_EXEMPT, MID_ADDRESS_MIN_WORDS,
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

const escapeRe = (w: string): string => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Matches, at the start of a string and case-insensitively, either a third-person-narration
 * opener (unconditional -- see NARRATIVE_OPENERS) or an address article immediately followed
 * by an attested honorific (see ADDRESS_ARTICLES / ADDRESS_HONORIFICS). A bare article alone
 * does NOT match: 'Al compimento delle riforme' is a genuine incipit, article + common noun,
 * not an address (round 2 review finding, 2026-09-07). The honorific boundary is a
 * lookahead for 'not a letter' rather than \b, since 'Card.' ends in a period and \b would
 * misbehave there.
 */
const OPENER_PATTERN = new RegExp(
  '^(?:'
    + NARRATIVE_OPENERS.map(escapeRe).join('|')
    + ')\\b'
    + '|'
    + `^(?:${ADDRESS_ARTICLES.map(escapeRe).join('|')})`
    + `\\s+(?:${ADDRESS_HONORIFICS.map(escapeRe).join('|')})(?!\\p{L})`,
  'iu',
);

/**
 * Task 8: the same address-article + honorific evidence as OPENER_PATTERN, but matched
 * anywhere in the residue (not anchored at the start) and requiring a comma immediately
 * before the article. A comma there is the tell that whatever precedes it is a narrative
 * phrase, not an incipit -- see ADDRESS_HONORIFICS's doc comment, "Mid-string address
 * salutation", for the evidence.
 */
const MID_ADDRESS_PATTERN = new RegExp(
  `,\\s*(?:${ADDRESS_ARTICLES.map(escapeRe).join('|')})`
    + `\\s+(?:${ADDRESS_HONORIFICS.map(escapeRe).join('|')})(?!\\p{L})`,
  'iu',
);

/**
 * Whether `rest` matches MID_ADDRESS_PATTERN with at least MID_ADDRESS_MIN_WORDS words
 * before the matched comma -- see MID_ADDRESS_MIN_WORDS's evidence in incipit-rules.ts. A
 * match with fewer words is not treated as an address salutation at all (falls through to
 * the rest of extractIncipit, same as no match).
 */
function matchesMidAddress(rest: string): boolean {
  const m = MID_ADDRESS_PATTERN.exec(rest);
  if (!m) return false;
  const wordsBefore = rest.slice(0, m.index).trim().split(/\s+/).filter(Boolean).length;
  return wordsBefore >= MID_ADDRESS_MIN_WORDS;
}

/**
 * Task 8: whether the residue opens with a bare ADDRESS_ARTICLE (no honorific required) and
 * is, in full, longer than MAX_INCIPIT_WORDS -- see ADDRESS_HONORIFICS's doc comment, "Long
 * address opener", for the evidence and for why this is scoped to long residues only.
 */
const LONG_ADDRESS_OPENER = new RegExp(
  `^(?:${ADDRESS_ARTICLES.map(escapeRe).join('|')})\\b`,
  'iu',
);
function isLongAddressOpener(rest: string): boolean {
  return LONG_ADDRESS_OPENER.test(rest)
    && rest.split(/\s+/).filter(Boolean).length > MAX_INCIPIT_WORDS;
}

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

/**
 * The earliest gloss-connector index in the string, or -1. A cut that would leave fewer
 * than MIN_WORDS_BEFORE_CUT words before it is discarded (-1 is returned instead): a short
 * residue is treated as if no connector had fired at all, so it falls through to the
 * untouched/word-ceiling path rather than being trusted at any length (see
 * MIN_WORDS_BEFORE_CUT's evidence in incipit-rules.ts) -- unless the earliest connector is
 * one of CUT_GUARD_EXEMPT, in which case the cut is trusted regardless of word count (see
 * CUT_GUARD_EXEMPT's own evidence).
 */
function glossCut(s: string): number {
  let best = -1;
  let bestConnector: string | null = null;
  for (const c of GLOSS_CONNECTORS) {
    const i = s.indexOf(c);
    if (i > 0 && (best === -1 || i < best)) { best = i; bestConnector = c; }
  }
  if (best === -1) return -1;
  if (bestConnector !== null && CUT_GUARD_EXEMPT.has(bestConnector)) return best;
  const wordsBefore = s.slice(0, best).trim().split(/\s+/).filter(Boolean).length;
  return wordsBefore < MIN_WORDS_BEFORE_CUT ? -1 : best;
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

  // An addressee salutation ('Al Cardinale...') or third-person narration
  // ('Il Pontefice prescrive...') is never an incipit, however many words follow it and
  // regardless of any connector further along -- checked first so a coincidental gloss
  // connector deep in the sentence never gets the chance to mint a false truncation.
  if (OPENER_PATTERN.test(rest)) return { title, incipit: null };

  // Task 8: a narrative phrase followed by a comma-introduced address ('Avendo Noi
  // creduto, al Card. Eugenio Pacelli...') is the same non-incipit shape as OPENER_PATTERN,
  // just not at the very start of the residue -- see ADDRESS_HONORIFICS's doc comment.
  if (matchesMidAddress(rest)) return { title, incipit: null };

  // Task 8: a long residue opening with a bare address article ('Ai Religiosi del
  // Portogallo che hanno partecipato...') is an addressee heading even without a listed
  // honorific -- checked before glossCut so a stray downstream connector cannot bypass the
  // word ceiling that would otherwise catch it. See ADDRESS_HONORIFICS's doc comment,
  // "Long address opener".
  if (isLongAddressOpener(rest)) return { title, incipit: null };

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
