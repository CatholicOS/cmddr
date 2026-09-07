/**
 * Documents proven to be genuinely distinct acts that happen to share both a date and a
 * pope (leo-xiii), but are filed on different shelves with different incipits. Verified
 * by fetching both documents from vatican.va in their original languages (Latin for
 * encyclicals, Italian for letters) and comparing their addressees and subject matter.
 * Curated by hand, never inferred; each entry's `note` is the textual evidence.
 *
 * Key: `${pageSlug}|${isoDate}|${slugify(incipit1)}|${slugify(incipit2)}` where incipit1
 * and incipit2 are in consistent order (alphabetically by slug) to ensure the same pair
 * is never keyed twice. Suppresses the same-date cross-shelf warning for exactly these
 * pairs; any other same-date cross-shelf pair still warns.
 */
export const ADJUDICATED_DISTINCT: Record<
  string,
  { incipit1: string; shelf1: string; incipit2: string; shelf2: string; note: string }
> = {
  'leo-xiii|1886-01-06|iampridem|non-senza': {
    incipit1: 'Iampridem',
    shelf1: 'encyclicals',
    incipit2: 'Non senza',
    shelf2: 'letters',
    note:
      'Iampridem is addressed to the archbishops and bishops of Prussia on the condition ' +
      'of the Church in Germany (LITTERAE … AD ARCHIEPISCOPOS ET EPISCOPOS BORUSSIAE, DE ' +
      'CONDITIONE REI CATHOLICAE IN GERMANIA). Non senza (Latin incipit Haud sine maximo ' +
      'animi moerore) is a letter of condolence to the King of Portugal on the death of his ' +
      'father Ferdinand.',
  },
  'leo-xiii|1890-11-20|catholicae-ecclesiae|novum-argumentum': {
    incipit1: 'Catholicae Ecclesiae',
    shelf1: 'encyclicals',
    incipit2: 'Novum argumentum',
    shelf2: 'letters',
    note:
      'Catholicae Ecclesiae is a circular letter establishing an annual Epiphany collection ' +
      'for the African missions. Novum argumentum is addressed to the Cardinal Archbishop of ' +
      'Florence, appending a formula of consecration of families and a daily prayer (LITTERAE ' +
      '… AD CARDINALEM ARCHIEPISCOPUM FLORENTINUM).',
  },
  'leo-xiii|1891-03-03|in-ipso|quod-erat-maxime': {
    incipit1: 'In Ipso',
    shelf1: 'encyclicals',
    incipit2: 'Quod erat maxime',
    shelf2: 'letters',
    note:
      'In Ipso is addressed to the ordinaries of the Austro-Hungarian Empire (ad Ordinarios ' +
      'Imperii austriaci), urging them to hold annual congresses. Quod erat maxime grants the ' +
      'feast of St Joseph under both precepts in Piedmont, Liguria, Sardinia and Lombardy.',
  },
};
