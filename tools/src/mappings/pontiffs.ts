import pontiffs from '../../../vendor/crpdr-pontiffs.json' with { type: 'json' };
import councils from '../../../vendor/coecdr-councils.json' with { type: 'json' };

export const KNOWN_PONTIFF_IDS = new Set<string>(pontiffs as string[]);
export const KNOWN_COUNCIL_IDS = new Set<string>(councils as string[]);

/** vatican.va URL slugs do not match CRPDR ids; this is the bridge. */
export const VATICAN_SLUG_TO_ISSUER: Record<string, string> = {
  'benedictus-xiv': 'rp:benedict-xiv',
  'pius-ix': 'rp:pius-ix',
  'leo-xiii': 'rp:leo-xiii',
};

export const PILOT_POPES = [
  { pageSlug: 'benedictus-xiv', issuerId: 'rp:benedict-xiv', era: 'flat' },
  { pageSlug: 'pius-ix', issuerId: 'rp:pius-ix', era: 'flat' },
  { pageSlug: 'leo-xiii', issuerId: 'rp:leo-xiii', era: 'shelf' },
] as const;

export const SHELVES = [
  'apost_constitutions', 'apost_letters', 'briefs', 'bulls',
  'encyclicals', 'letters', 'motu_proprio', 'speeches',
] as const;
