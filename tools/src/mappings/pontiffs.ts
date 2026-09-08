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
  {
    pageSlug: 'pius-xi', issuerId: 'rp:pius-xi', era: 'shelf',
    shelves: [
      'apost_constitutions', 'apost_letters', 'briefs', 'bulls',
      'encyclicals', 'letters', 'motu_proprio',
    ],
  },
  {
    pageSlug: 'pius-xii', issuerId: 'rp:pius-xii', era: 'shelf',
    // `speeches` is year-partitioned here and is out of scope in any case (spec §2.7).
    // `letters` is kept despite a 97.9% (93/95) provisional rate -- adjudicated (Task 8,
    // coordinator review) as a genre fact about this shelf (overwhelmingly personal
    // correspondence addressed to named individuals, with no printed incipit ever), not a
    // parser or rule-table gap: `extractIncipit` itself measures clean (nine real bugs
    // fixed, zero regression on the 581-heading Leo XIII/Pius X baseline). Every
    // incipit-less item still lands as a genuine `idStatus: provisional` record -- exactly
    // the mechanism spec §4.2 designed for documents with no conventional name. See
    // task-8-report.md and the per-shelf diagnostic test in harvest-data.test.ts.
    shelves: [
      'apost_constitutions', 'apost_exhortations', 'apost_letters', 'briefs', 'bulls',
      'encyclicals', 'letters', 'motu_proprio',
    ],
  },
  {
    pageSlug: 'benedict-xv', issuerId: 'rp:benedict-xv', era: 'shelf',
    // Note the hyphen: Benedict XV is the only pope who spells this shelf
    // 'apost-constitutions' rather than 'apost_constitutions' (spec §2.5).
    // `letters` is year-partitioned here and so is out of scope (spec §2.7).
    shelves: [
      'apost-constitutions', 'apost_exhortations', 'apost_letters', 'briefs',
      'bulls', 'encyclicals', 'motu_proprio',
    ],
  },
  {
    pageSlug: 'john-xxiii', issuerId: 'rp:john-xxiii', era: 'shelf',
    // apost_constitutions and apost_letters are year-partitioned (1958-1963) and are
    // read through resolveShelfPages; the shelf list does not distinguish them.
    shelves: [
      'apost_constitutions', 'apost_exhortations', 'apost_letters',
      'encyclicals', 'motu_proprio',
    ],
  },
  {
    pageSlug: 'paul-vi', issuerId: 'rp:paul-vi', era: 'shelf',
    // `letters` and `speeches` are year-partitioned and out of scope (spec §2.7). The
    // remaining five aggregate pages carry every item directly, unlike John XXIII's
    // year-partitioned apost_constitutions/apost_letters. apost_constitutions (354) is
    // dominated by circumscription erections filed under a bare Latin toponym -- see the
    // erection-candidate test in harvest-data.test.ts; confirming them into
    // CIRCUMSCRIPTION_ERECTIONS is Task 20's work, not this one's.
    shelves: [
      'apost_constitutions', 'apost_exhortations', 'apost_letters',
      'encyclicals', 'motu_proprio',
    ],
  },
  {
    pageSlug: 'john-paul-i', issuerId: 'rp:john-paul-i', era: 'shelf',
    // The shortest pontificate (26 August - 28 September 1978, 33 days). Unlike Benedict
    // XV and Paul VI, this pope's `letters` shelf is an aggregate page carrying its own
    // four items directly (not year-partitioned), so it is in scope here (spec §2.7).
    // `speeches` is out of scope for every pope from Pius XI on (see the Pius X entry above).
    shelves: ['apost_letters', 'letters'],
  },
  {
    pageSlug: 'john-paul-ii', issuerId: 'rp:john-paul-ii', era: 'shelf',
    // The largest pontificate in scope (elected 16 October 1978). apost_letters is
    // year-partitioned across 1978-2005 and is read through resolveShelfPages; the shelf
    // list does not distinguish it from the five aggregate shelves. `books` and `jubilee`
    // are linked from the landing page but are not document shelves (spec §2.5). `letters`
    // and `speeches` are out of scope (spec §2.7). apost_constitutions (613) is dominated
    // by circumscription erections filed under a bare Latin toponym -- see the
    // erection-candidate test in harvest-data.test.ts; confirming them into
    // CIRCUMSCRIPTION_ERECTIONS is Task 20's work, not this one's.
    shelves: [
      'apost_constitutions', 'apost_exhortations', 'apost_letters',
      'bulls', 'encyclicals', 'motu_proprio',
    ],
  },
  {
    pageSlug: 'benedict-xvi', issuerId: 'rp:benedict-xvi', era: 'shelf',
    // Elected 19 April 2005. `elezione` is linked from the landing page but is not a
    // document shelf (spec §2.5). `letters` and `speeches` are year-partitioned and out of
    // scope (spec §2.7). apost_constitutions (126) is dominated by circumscription
    // erections filed under a bare Latin toponym -- see the erection-candidate test in
    // harvest-data.test.ts; confirming them into CIRCUMSCRIPTION_ERECTIONS is Task 20's
    // work, not this one's.
    shelves: [
      'apost_constitutions', 'apost_exhortations', 'apost_letters',
      'encyclicals', 'motu_proprio',
    ],
  },
  {
    // The vatican.va slug is Italian ('francesco'); the CRPDR id is 'rp:francis-i'. Elected
    // 13 March 2013. The first pontificate whose circumscription erections are tagged
    // textually rather than flagged for curation -- the heading itself states the act
    // ('Il Santo Padre ha eretto...', 'Il Santo Padre ha istituito...'), so `francesco` sits
    // in keywords.ts's TEXTUALLY_TAGGED set rather than being scanned for toponym shape.
    // `letters` and `speeches` are year-partitioned and out of scope (spec §2.7).
    // apost_letters and motu_proprio overlap heavily: many acts are a "Lettera Apostolica
    // in forma di «Motu Proprio»" and are filed on both shelves, so pass 1's same-incipit/
    // same-date merge does real work here.
    pageSlug: 'francesco', issuerId: 'rp:francis-i', era: 'shelf',
    shelves: [
      'apost_constitutions', 'apost_exhortations', 'apost_letters',
      'bulls', 'encyclicals', 'motu_proprio',
    ],
  },
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
