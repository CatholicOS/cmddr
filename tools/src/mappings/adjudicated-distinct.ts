/**
 * Documents proven to be genuinely distinct acts that happen to share both a date and a
 * pope, but are filed on different shelves with different incipits. Verified by fetching
 * both documents from vatican.va in their original languages (Latin for encyclicals,
 * Italian for letters) and comparing their addressees and subject matter. Curated by
 * hand, never inferred; each entry's `note` is the textual evidence.
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
  'pius-x|1904-04-25|navitas-egregia|sull-edizione-vaticana-dei-libri-liturgici-contenenti-le-melodie-gregoriane': {
    incipit1: 'Navitas egregia',
    shelf1: 'letters',
    incipit2: "Sull'edizione vaticana dei libri liturgici contenenti le melodie gregoriane",
    shelf2: 'motu_proprio',
    note:
      'Navitas egregia is a personal letter to Fr. Eugène Prévost in Paris praising the society ' +
      'he founded for lapsed, elderly and infirm priests. The motu proprio establishes the ' +
      'Vatican edition of the liturgical books containing Gregorian chant, following up the ' +
      "22 November 1903 motu proprio on sacred music. Both close 'il 25 Aprile 1904, festa di S. " +
      "Marco Evangelista' / 'die XXV Aprilis MDCCCCIV' but are unrelated acts.",
  },
  'pius-x|1907-06-14|ea-semper-fuit|summa-nos': {
    incipit1: 'Ea semper fuit',
    shelf1: 'apost_letters',
    incipit2: 'Summa Nos',
    shelf2: 'letters',
    note:
      'Ea semper fuit establishes the Ruthenian rite hierarchy in the United States (QUIBUS RITUS ' +
      'RUTHENUS CONSTITUITUR IN STATIBUS FOEDERATIS AMERICAE SEPTENTRIONALIS). Summa Nos ' +
      'congratulates Ernest Commer of Vienna on his refutation of the errors of Hermann Schell.',
  },
  'pius-x|1910-02-14|inter-viros|nobis-in-sublimi': {
    incipit1: 'Inter viros',
    shelf1: 'letters',
    incipit2: 'Nobis in sublimi',
    shelf2: 'apost_letters',
    note:
      'Inter viros congratulates Giuseppe Ballerini, an Italian cleric, on his apologetic ' +
      'writings and appointment among the domestic prelates. Nobis in sublimi separates the ' +
      'Ce-li Centralis apostolic vicariate in China from Pao-Ting-Fou.',
  },
  'pius-x|1910-05-03|in-hac-beatissimi-petri|paternam-curam': {
    incipit1: 'In hac Beatissimi Petri',
    shelf1: 'motu_proprio',
    incipit2: 'Paternam curam',
    shelf2: 'letters',
    note:
      'In hac Beatissimi Petri establishes a military vicar (Vicarius Castrensis) for the army of ' +
      'the Republic of Chile. Paternam curam concerns restoring the Josephian College in Manila ' +
      'to the Society of Jesus.',
  },
  'pius-x|1910-05-03|in-hac-beatissimi-petri|vide-quae-sit': {
    incipit1: 'In hac Beatissimi Petri',
    shelf1: 'motu_proprio',
    incipit2: 'Vide quae sit',
    shelf2: 'letters',
    note:
      'In hac Beatissimi Petri establishes a military vicar for the army of the Republic of ' +
      'Chile (see the previous entry). Vide quae sit congratulates Valerio Laspro, Archbishop of ' +
      'Salerno, on the golden jubilee of his episcopal ordination.',
  },
  'pius-x|1910-05-26|editae-saepe|ex-quo': {
    incipit1: 'Editae Saepe',
    shelf1: 'encyclicals',
    incipit2: 'Ex quo',
    shelf2: 'motu_proprio',
    note:
      'Editae Saepe is the encyclical on St Charles Borromeo addressed to the whole episcopate, ' +
      'issued for the third centenary of his canonization (dated on the feast of Corpus Christi, ' +
      "which the motu proprio's own closing formula also names -- 'in solemnibus Corporis Christi' " +
      '-- confirming the shared date is not a transcription accident). Ex quo establishes the ' +
      'Pious Union of St Paul the Apostle for the sanctification of the clergy.',
  },
};
