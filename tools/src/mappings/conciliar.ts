/**
 * Documents filed on a pope's page that were issued by a council (spec §2.5).
 * Key: `${pageSlug}|${slugify(incipit)}|${isoDate}`. Curated by hand, never inferred.
 */
export const CONCILIAR_REASSIGNMENTS: Record<string, { issuerId: string; promulgatedBy: string }> = {
  'pius-ix|dei-filius|1870-04-24': { issuerId: 'oec:vatican-i', promulgatedBy: 'rp:pius-ix' },
  'pius-ix|pastor-aeternus|1870-07-18': { issuerId: 'oec:vatican-i', promulgatedBy: 'rp:pius-ix' },
};
