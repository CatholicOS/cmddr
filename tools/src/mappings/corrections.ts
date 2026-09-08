/**
 * Hand-curated adjudications of every printed-vs-URL-slug date conflict found on the
 * Leo XIII and Pius X shelves. Each was resolved by reading the document's own dating
 * formula on vatican.va, cross-checked against its stated pontificate year (Leo XIII
 * was elected 20 February 1878; Pius X, 4 August 1903). `date` is the resolved value
 * the harvest keeps -- equal to the printed date when the printed date was correct (the
 * entry then exists only to document the adjudication and suppress the slug-mismatch
 * warning), or the corrected value when the printed date was wrong. Every entry must
 * carry a `note` quoting the document's own dating formula as evidence; never inferred.
 *
 * Key: `${pageSlug}|${shelf}|${slugify(incipit)}|${printedIsoDate}`.
 */
export const DATE_CORRECTIONS: Record<string, { date: string; note: string }> = {
  'leo-xiii|letters|magni-nobis|1889-05-07': {
    date: '1889-03-07',
    note:
      "The letters shelf prints '7 maggio 1889' but its own URL slug encodes 18890307 (7 March); " +
      "the encyclicals shelf prints '7 marzo 1889' with slug 07031889. Both slugs agree on 7 March, " +
      'and Magni Nobis Gaudii is of 7 March 1889. Treated as a transcription error on the letters shelf.',
  },
  'leo-xiii|apost_letters|non-maius|1891-06-15': {
    date: '1891-06-15',
    note:
      "Non Maius's own dating formula reads 'die XV Iunii anno MDCCCXCI, Pontificatus Nostri XIV' " +
      '(15 June 1891, 14th year of the pontificate -- consistent, since Leo XIII was elected ' +
      "20 February 1878). The printed date is correct; the apost_letters shelf's URL slug " +
      '(18950615, 1895) is wrong.',
  },
  'leo-xiii|briefs|provida-matris|1895-05-15': {
    date: '1895-05-05',
    note:
      "Provida Matris's own dating formula reads 'il 5 maggio 1895, anno decimottavo del Nostro " +
      "Pontificato' (5 May 1895, 18th year of the pontificate -- consistent). The briefs shelf's " +
      "printed date ('15 maggio 1895', 15 May) is the error; its own URL slug (18950505, 5 May) " +
      'is correct.',
  },
  'leo-xiii|letters|le-nostre-ferme-speranze|1901-03-28': {
    date: '1901-03-28',
    note:
      "Le Nostre Ferme Speranze's own dating formula reads 'il giorno 28 marzo dell'anno 1901, " +
      'vigesimoquarto\' (28 March 1901, 24th year of the pontificate -- consistent). The printed ' +
      "date is correct; the letters shelf's URL slug (19010228, 28 February) is wrong.",
  },
  'leo-xiii|letters|consiliorum-quae|1895-07-31': {
    date: '1895-07-31',
    note:
      "Consiliorum Quae's own dating formula reads 'die XXXI Iulii anno MDCCCXCV, Pontificatus " +
      "Nostri decimo octavo' (31 July 1895, 18th year of the pontificate -- consistent). The " +
      "printed date is correct; the letters shelf's URL slug (18930731, 1893) is wrong.",
  },
  'leo-xiii|letters|adnitentibus-nobis|1895-07-02': {
    date: '1895-07-02',
    note:
      "Adnitentibus Nobis's own dating formula reads 'die II Iulii anno MDCCCXCV, Pontificatus " +
      "Nostri decimo octavo' (2 July 1895, 18th year of the pontificate -- consistent). The " +
      "printed date is correct; the letters shelf's URL slug (18960702, 1896) is wrong.",
  },
  'leo-xiii|letters|vi-e-noto|1887-09-20': {
    date: '1887-09-20',
    note:
      "Vi è noto's own dating formula reads 'Dal Vaticano li 20 Sett. 1887' and cites ASS vol. XX " +
      "(1887); the encyclicals-shelf transcription of the same letter (Vi è ben noto) closes 'Dal " +
      "Vaticano, 20 settembre 1887'. The printed date is correct; this record's own URL slug " +
      '(18880920, 1888) is wrong. (This record merges into Vi è ben noto -- see DUPLICATE_MERGES -- ' +
      'but the adjudication is recorded here since the date correction is applied before the merge pass.)',
  },
  'pius-x|apost_constitutions|in-praecipuis|1913-06-29': {
    date: '1913-06-29',
    note:
      "In Praecipuis's own dating formula reads 'die XXIX Iunii, natali SS. Apostolorum Petri et " +
      "Pauli, anno Incarnationis Dominicae MCMXIII, Pontificatus Nostri decimo' (29 June -- the " +
      'feast of Sts Peter and Paul -- 1913, 10th year of the pontificate; Pius X was elected ' +
      '4 August 1903, so his 10th year runs 1912-08-04 to 1913-08-03, consistent). The printed ' +
      "date is correct; the apost_constitutions shelf's URL slug (19130628, 28 June) is wrong.",
  },
  'pius-x|apost_letters|religiosas-familias|1912-09-12': {
    date: '1912-09-16',
    note:
      "Religiosas Familias's own dating formula reads 'die XVI septembris MCMXII, Pontificatus " +
      "Nostri anno decimo' (16 September 1912, 10th year of the pontificate -- consistent). The " +
      "apost_letters shelf's printed date ('12 settembre 1912', 12 September) is the error; its " +
      'own URL slug (19120916, 16 September) is correct.',
  },
  'pius-x|apost_letters|pia-consociatio|1911-05-02': {
    date: '1911-05-02',
    note:
      "Pia Consociatio's own dating formula reads 'die II Maii MDCCCCXI, Pontificatus Nostri anno " +
      'octavo\' (2 May 1911, 8th year of the pontificate -- consistent). The printed date is ' +
      "correct; the apost_letters shelf's URL slug (19110511, 11 May) is wrong.",
  },
  'pius-x|apost_letters|laeto-accepimus|1910-04-09': {
    date: '1910-04-09',
    note:
      "Laeto Accepimus's own dating formula reads 'die IX Aprilis MCMX, Pontificatus Nostri anno " +
      'septimo\' (9 April 1910, 7th year of the pontificate -- consistent). The printed date is ' +
      "correct; the apost_letters shelf's URL slug (19090405, 5 April 1909) is wrong.",
  },
  'pius-x|apost_letters|caritatis-opera|1910-05-09': {
    date: '1910-05-28',
    note:
      "Caritatis Opera's own page title and its closing dating formula both independently read " +
      "28 May 1910 -- the title reads '(die 28 Maii anno 1910)' and the text closes 'Datum Romae " +
      "apud S. Petrum, sub annulo Piscatoris die XXVIII Maii MDCCCCX Pontificatus Nostri anno " +
      "septimo' (28 May 1910, 7th year of the pontificate -- consistent). The apost_letters " +
      "shelf's printed date ('9 maggio 1910') and its URL slug (19100509, both 9 May) are both " +
      'wrong, and happen to agree with each other, which is why no printed/slug warning fired for ' +
      'this record. The error was caught only because the wrong date collided with four unrelated ' +
      "letters genuinely dated 9 May 1910 (Studium quo tenemur, Quod nobis, Delectarum, Non satis) " +
      'in the same-date cross-shelf check, prompting a read of the full text.',
  },
  'pius-x|letters|impertiendi-tibi|1914-01-15': {
    date: '1914-01-15',
    note:
      "Impertiendi Tibi's own dating formula reads 'die XV ianuarii MCMXIV, Pontificatus Nostri " +
      'anno undecimo\' (15 January 1914, 11th year of the pontificate -- consistent). The printed ' +
      "date is correct; the letters shelf's URL slug (19130115, 1913) is wrong.",
  },
  'pius-x|letters|communis-vobiscum|1909-12-12': {
    date: '1909-12-13',
    note:
      "Communis Vobiscum's own dating formula reads 'die XIII mensis Decembris anno MDCCCCIX, " +
      "Pontificatus Nostri septimo' (13 December 1909, 7th year of the pontificate -- consistent). " +
      "The letters shelf's printed date ('12 dicembre 1909', 12 December) is the error; its own " +
      'URL slug (19091213, 13 December) is correct.',
  },
  'pius-x|letters|edita-typis|1904-05-06': {
    date: '1904-05-06',
    note:
      "Edita Typis's own dating formula reads 'die VI Maii MDCCCCIV, Pontificatus Nostri anno " +
      'primo\' (6 May 1904, 1st year of the pontificate -- consistent, since Pius X was elected ' +
      "4 August 1903). The printed date is correct; the letters shelf's URL slug (19050506, 1905) " +
      'is wrong.',
  },
  'pius-x|letters|missale-a-te|1904-05-05': {
    date: '1904-05-05',
    note:
      "Missale A Te's own dating formula reads 'die V Maii MDCCCCIV, Pontificatus Nostri anno " +
      "primo' (5 May 1904, 1st year of the pontificate -- consistent). The printed date is " +
      "correct; the letters shelf's URL slug (19050505, 1905) is wrong.",
  },
  'pius-x|motu_proprio|crux-pectoralis|1905-05-24': {
    date: '1905-05-24',
    note:
      "Crux Pectoralis's own dating formula reads 'questo dì 24 Maggio 1905, festa della B. V. M. " +
      "Auxilium Christianorum, anno secondo del Nostro Pontificato' (24 May 1905, 2nd year of the " +
      "pontificate -- consistent). The printed date is correct; the motu_proprio shelf's URL slug " +
      '(19040524, 1904) is wrong.',
  },
  'pius-x|motu_proprio|arduum-sane-munus|1904-03-19': {
    date: '1904-03-19',
    note:
      "Arduum Sane Munus's own dating formula reads 'Datum Romae apud S. Petrum XIV Cal. April, " +
      "die festo S. Iosephi, Sponsi B. M. V., MDCCCCIV Pontificatus Nostri anno primo' -- the " +
      "14th day before the Kalends of April is 19 March, which the formula itself cross-confirms " +
      "as the feast of St Joseph (19 March), 1st year of the pontificate -- consistent. The " +
      "printed date is correct; the motu_proprio shelf's URL slug (19040414) misreads 'Kal. " +
      "April' as 14 April instead of resolving the Roman date.",
  },
  'pius-x|motu_proprio|peculiaria-quaedam|1903-01-14': {
    date: '1903-12-14',
    note:
      "Peculiaria Quaedam concerns 'GRATIAE ET PRIVILEGIA CLERICIS CONCLAVISTIS POSTREMI CONCLAVIS " +
      "CONCESSA' for those who served 'in Conclavi ... ad Summum Pontificatum assumpti fuimus' -- " +
      'the conclave that elected Pius X on 4 August 1903 -- so it cannot predate that conclave, ' +
      "ruling out both the motu_proprio shelf's printed date (14 January 1903) and its URL slug " +
      "(19030119, 19 January 1903), which fall entirely before the election. Its own dating " +
      "formula reads 'Datum Romae apud S. Petrum decimo nono Kalendas Ianuarii anno primo': the " +
      '19th day before the Kalends of January is 14 December, which in the 1st year of the ' +
      'pontificate (4 August 1903 - 3 August 1904) can only be 14 December 1903.',
  },

  // Task 8 (Pius XI, elected 6 February 1922; Pius XII, elected 2 March 1939). Every entry
  // below is adjudicated against the document's own dating formula, read on vatican.va, and
  // cross-checked against its stated pontificate year.
  'pius-xi|apost_letters|mites-corde|1929-06-30': {
    date: '1929-06-30',
    note:
      "Mites Corde's own dating formula reads 'Datum Romae apud Sanctum Petrum, sub anulo " +
      "Piscatoris, die XXX mensis Iunii anno... 1929, Pontificatus Nostri octavo' (30 June 1929, " +
      '8th year of the pontificate -- consistent, since Pius XI was elected 6 February 1922 and ' +
      "his 8th year runs 1929-02-06 to 1930-02-05). The printed date is correct; the " +
      "apost_letters shelf's URL slug (19290623, 23 June) is wrong.",
  },
  'pius-xi|apost_letters|pastorale-officium|1929-02-20': {
    date: '1929-02-08',
    note:
      "Pastorale Officium's own dating formula reads 'Datum Romae apud Sanctum Petrum, sub anulo " +
      "Piscatoris, die VIII m. Februarii an. 1929, Pontificatus Nostri octavo' (8 February 1929, " +
      "8th year -- consistent). The apost_letters shelf's printed date ('20 febbraio 1929', 20 " +
      "February) is the error; its own URL slug (19290208, 8 February) is correct.",
  },
  'pius-xi|apost_letters|monasterii-sancti-benedicti|1929-02-23': {
    date: '1928-09-18',
    note:
      "Monasterii Sancti Benedicti's (URL slug spells it 'monasterii-sanctae') own dating " +
      "formula reads 'Datum Romae, apud Sanctum Petrum, sub anulo Piscatoris, die XVIII mensis " +
      "Septembris an. 1928, Pontificatus Nostri septimo' (18 September 1928, 7th year -- " +
      "consistent, 1928-02-06 to 1929-02-05). The apost_letters shelf's printed date ('23 " +
      "febbraio 1929', 23 February 1929) is the error; its own URL slug (19280918, 18 September " +
      '1928) is correct.',
  },
  'pius-xi|letters|chirografo-al-cardinale-eugenio-pacelli-segretario-di-stato-col-quale-il-sommo-pontefice-si-riserva-la-prefettura-della-sacra-congregazione-dei-seminari-e-delle-universita-degli-studi|1939-09-03':
    {
      date: '1937-09-03',
      note:
        "This chirografo's own signature line reads 'Castelgandolfo, 3 settembre 1937' -- the " +
        "letters shelf's printed date ('3 settembre 1939', 1939) is the error; its own URL slug " +
        '(19370903, 1937) is correct.',
    },
  'pius-xi|motu_proprio|quod-maxime|1928-09-30': {
    date: '1928-09-30',
    note:
      "Quod Maxime's own dating formula reads 'Datum Romae apud Sanctum Petrum, die XXX mensis " +
      "Septembris, in festo Sancti Hieronymi Doctoris Maximi, anno... 1928, Pontificatus Nostri " +
      "septimo' (30 September 1928, the feast of St Jerome, 7th year -- consistent). The printed " +
      "date is correct; the motu_proprio shelf's URL slug (19280914, 14 September) is wrong.",
  },
  'pius-xii|apost_constitutions|niangaraensis-dorumaensis|1958-02-24': {
    date: '1958-02-24',
    note:
      "Niangaraënsis's own dating formula reads 'Datum Romae, apud S. Petrum, die quarto et " +
      "vicesimo mensis Februarii, anno Domini... 1958, Pontificatus Nostri undevicesimo' (24 " +
      'February 1958, 19th year -- consistent, since Pius XII was elected 2 March 1939 and his ' +
      "19th year runs 1957-03-02 to 1958-03-01). The printed date is correct; the " +
      "apost_constitutions shelf's URL slug (19580124, 24 January) is wrong.",
  },
  'pius-xii|apost_constitutions|thakhekensis|1958-02-24': {
    date: '1958-02-24',
    note:
      "Thakhekensis's own dating formula is identical to Niangaraënsis's (the two dioceses were " +
      "erected the same day): 'Datum Romae, apud S. Petrum, die quarto et vicesimo mensis " +
      "Februarii, anno Domini... 1958, Pontificatus Nostri undevicesimo' (24 February 1958, 19th " +
      "year -- consistent). The printed date is correct; the apost_constitutions shelf's URL " +
      'slug (19580124, 24 January) is wrong.',
  },
  'pius-xii|apost_constitutions|rivibambensis-guarandensis|1958-12-29': {
    date: '1957-12-29',
    note:
      "Rivibambensis's own dating formula reads 'Datum Romae, apud S. Petrum, die vicesimo nono " +
      "mensis Decembris, anno Domini... 1957, Pontificatus Nostri undevicesimo' (29 December " +
      "1957, 19th year -- consistent). The apost_constitutions shelf's printed date ('29 " +
      "dicembre 1958', 1958) is the error; its own URL slug (19571229, 1957) is correct.",
  },
  'pius-xii|apost_constitutions|urawaensis|1958-12-16': {
    date: '1957-12-16',
    note:
      "Urawaënsis's own dating formula reads 'Datum Romae, apud S. Petrum, die sexto decimo " +
      "mensis Decembris, anno Domini... 1957, Pontificatus Nostri undevicesimo' (16 December " +
      "1957, 19th year -- consistent). The apost_constitutions shelf's printed date ('16 " +
      "dicembre 1958', 1958) is the error; its own URL slug (19571216, 1957) is correct.",
  },
  'pius-xii|apost_exhortations|il-film-ideale|1955-06-21': {
    date: '1955-06-21',
    note:
      "'Il Film Ideale' is a two-part exhortation: its own title page gives the span '21 " +
      "giugno 1955 - 25 ottobre 1955' -- 21 June 1955 for the address to Italian cinema " +
      "industry representatives (the part the apost_exhortations shelf prints and dates), and " +
      "25/28 October 1955 for a second address to international cinema exhibitors and " +
      "distributors (the date the URL slug -- 25101955 -- encodes). Both dates are genuinely " +
      "the document's own; the printed date is not an error, so it is kept.",
  },
  'pius-xii|letters|lettera-al-cardinale-francesco-spellman-nel-150-anniversario-di-fondazione-dell-arcidiocesi-di-new-york|1958-02-22':
    {
      date: '1958-02-28',
      note:
        "This letter's own dating formula reads 'Datum Roma, apud Sanctum Petrum die XXVIII " +
        "mensis Februarii, anno... 1958, Pontificatus Nostri undevicesimo' (28 February 1958, " +
        "19th year -- consistent). The letters shelf's printed date ('22 febbraio 1958', 22 " +
        'February) is the error; its own URL slug (19580228, 28 February) is correct.',
    },

  // Task 12 (Benedict XV, elected 3 September 1914). Every entry below is adjudicated
  // against the document's own dating formula, read on vatican.va, and cross-checked
  // against its stated pontificate year.
  'benedict-xv|apost-constitutions|ad-christifidelium-bonum|1922-09-30': {
    date: '1921-09-30',
    note:
      "Ad Christifidelium Bonum's own dating formula reads 'Datum Romae apud Sanctum Petrum, " +
      'anno Domini millesimo nongentesimo vigesimo primo, die trigesima mensis septembris, ' +
      "Pontificatus Nostri anno octavo' (30 September 1921, 8th year of the pontificate -- " +
      'consistent, since Benedict XV was elected 3 September 1914 and his 8th year runs ' +
      "1921-09-03 to 1922-09-02; the printed year, 1922, falls after his death on 22 January " +
      "1922 and cannot be right). The apost-constitutions shelf's printed date ('30 settembre " +
      "1922', 1922) is the error; its own URL slug (19210930, 1921) is correct.",
  },
  'benedict-xv|apost_letters|supremi-apostolatus|1920-04-16': {
    date: '1920-04-17',
    note:
      "Supremi Apostolatus's own dating formula reads 'Datum Romae apud sanctum Petrum sub " +
      "annulo Piscatoris, die XVII aprilis MCMXX, Pontificatus Nostri anno sexto' (17 April " +
      '1920, 6th year of the pontificate -- consistent, 1919-09-03 to 1920-09-02). The ' +
      "apost_letters shelf's printed date ('16 aprile 1920', 16 April) is the error; its own " +
      'URL slug (19200417, 17 April) is correct.',
  },

  // Task 13 (John XXIII, elected 28 October 1958). Every entry below is adjudicated
  // against the document's own dating formula, read on vatican.va, and cross-checked
  // against its stated pontificate year.
  'john-xxiii|apost_constitutions|portus-alexii-et-vevakensis-gorokaensis-montis-hagensis-laensis|1959-06-18':
    {
      date: '1959-06-18',
      note:
        "Portus Alexii et Vevakensis's own dating formula reads 'Datum Romae, apud S. Petrum, " +
        "die duodevicesimo mensis Iunii, anno Domini millesimo nongentesimo quinquagesimo nono, " +
        "Pontificatus Nostri primo' (18 June 1959, 1st year of the pontificate -- consistent, " +
        'since John XXIII was elected 28 October 1958 and his 1st year runs 1958-10-28 to ' +
        "1959-10-27). The printed date is correct; the apost_constitutions shelf's own URL " +
        'slug (19590612, 12 June) is wrong.',
    },
  'john-xxiii|apost_letters|haud-raro|2008-10-24': {
    date: '1959-10-24',
    note:
      "The apost_letters shelf prints '(24 ottobre 2008)' -- a manifest transcription typo " +
      "(2008 for 1959): Haud raro's own dating formula reads 'Datum Roma, apud Sanctum " +
      "Petrum, sub anulo Piscatoris, die XXIV mensis Octobris, anno MCMLIX, Pontificatus " +
      "Nostri primo' (24 October 1959, 1st year of the pontificate -- consistent, 1958-10-28 " +
      "to 1959-10-27). The shelf's own URL slug (19591024, 24 October 1959) is correct.",
  },
  'john-xxiii|apost_letters|luce-collustrans|1960-12-22': {
    date: '1960-12-22',
    note:
      "Luce collustrans's own dating formula reads 'Datum Romae, apud Sanctum Petrum, sub " +
      "anulo Piscatoris, die XXII mensis Decembris, anno MCMLX, Pontificatus Nostri tertio' " +
      '(22 December 1960, 3rd year of the pontificate -- consistent, 1960-10-28 to ' +
      "1961-10-27). The printed date is correct; the apost_letters shelf's own URL slug " +
      '(19601216, 16 December) is wrong.',
  },
};
