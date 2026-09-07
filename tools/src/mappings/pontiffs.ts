import pontiffs from '../../../vendor/crpdr-pontiffs.json' with { type: 'json' };
import councils from '../../../vendor/coecdr-councils.json' with { type: 'json' };

export const KNOWN_PONTIFF_IDS = new Set<string>(pontiffs as string[]);
export const KNOWN_COUNCIL_IDS = new Set<string>(councils as string[]);

export interface PopeSource {
  /** The vatican.va URL slug, e.g. 'benedictus-xiv'. Not the CRPDR id. */
  pageSlug: string;
  /** The CRPDR id, e.g. 'rp:benedict-xiv'. */
  issuerId: string;
  /** 'flat' pages carry one reverse-chronological list; 'shelf' pages carry per-genre indexes. */
  era: 'flat' | 'shelf';
  /**
   * The shelves harvested for this pope. Curated per pope, never inferred from the page's
   * links: shelf membership varies (no `bulls` for Pius X), spelling varies (Benedict XV
   * hyphenates `apost-constitutions`), and several linked indexes -- `biography`,
   * `biografia`, `books`, `jubilee`, `elezione` -- are not document shelves at all.
   * Empty for the flat era, which has no shelves.
   */
  shelves: readonly string[];
}

export const POPES: readonly PopeSource[] = [
  { pageSlug: 'benedictus-xiv', issuerId: 'rp:benedict-xiv', era: 'flat', shelves: [] },
  { pageSlug: 'pius-ix', issuerId: 'rp:pius-ix', era: 'flat', shelves: [] },
  {
    pageSlug: 'leo-xiii', issuerId: 'rp:leo-xiii', era: 'shelf',
    shelves: [
      'apost_constitutions', 'apost_letters', 'briefs', 'bulls',
      'encyclicals', 'letters', 'motu_proprio', 'speeches',
    ],
  },
  {
    pageSlug: 'pius-x', issuerId: 'rp:pius-x', era: 'shelf',
    // No bulls or briefs shelf exists for Pius X. `speeches` is excluded here and for
    // every later pope (spec §2.7): from Pius XI on it holds occasional acts with
    // descriptive titles rather than incipits. Leo XIII keeps its speeches, which are
    // genuine Latin allocutions.
    shelves: [
      'apost_constitutions', 'apost_exhortations', 'apost_letters',
      'encyclicals', 'letters', 'motu_proprio',
    ],
  },
  // Pius XI and Pius XII (Task 8): NOT added here. The measured provisional share for
  // both pontificates together is 27.3% (112/410), above the spec §8 go/no-go budget of
  // "roughly a quarter" even after a full round of evidenced rule-table iteration -- see
  // task-8-report.md. Wiring these two rows back in is exactly the "push on" step spec §8
  // says not to take until §4.2 is revisited; the fixtures and the rule-table fixes found
  // along the way are kept (tools/fixtures/pius-xi-*.html, pius-xii-*.html;
  // incipit-rules.ts; incipit.ts; this file's own git history), ready for whoever resumes
  // this once that decision is made.
] as const;

/** The shelves harvested for a pope page; empty for an unknown slug or a flat-era page. */
export function shelvesFor(pageSlug: string): readonly string[] {
  return POPES.find((p) => p.pageSlug === pageSlug)?.shelves ?? [];
}

/**
 * vatican.va URL slugs do not match CRPDR ids; this is the bridge. Derived from POPES
 * rather than maintained beside it, so the two can never disagree.
 */
export const VATICAN_SLUG_TO_ISSUER: Record<string, string> =
  Object.fromEntries(POPES.map((p) => [p.pageSlug, p.issuerId]));
