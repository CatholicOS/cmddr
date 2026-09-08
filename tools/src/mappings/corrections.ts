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
        "Portus Alexii et Vevakensis's own dating formula reads 'Datunt Roma, apud S. Petrum, " +
        "die duodevicesimo mensis Iunii, anno Domini millesimo nongentesimo quinquagesimo nono, " +
        "Pontificatus Nostri primo' (sic -- 'Datunt Roma' is vatican.va's own OCR artifact for " +
        "the standard 'Datum Romae'; the date, '18 June 1959, 1st year of the pontificate', is " +
        'unaffected and consistent, since John XXIII was elected 28 October 1958 and his 1st ' +
        "year runs 1958-10-28 to 1959-10-27). The printed date is correct; the " +
        "apost_constitutions shelf's own URL slug (19590612, 12 June) is wrong.",
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

  // Task 14 (Paul VI, elected 21 June 1963). Every entry below is adjudicated against the
  // document's own dating formula, read on vatican.va, and cross-checked against its
  // stated pontificate year (year N runs 21 June of calendar year 1962+N to 20 June of
  // 1963+N).
  'paul-vi|apost_constitutions|avkaensis|1977-11-10': {
    date: '1977-11-10',
    note:
      "Avkaënsis's own dating formula reads 'Datum Romae... die decimo mensis Novembris... " +
      "1977, Pontificatus Nostri quinto decimo' (10 November 1977, 15th year of the " +
      'pontificate -- consistent, 1977-06-21 to 1978-06-20). The printed date is correct; ' +
      "the apost_constitutions shelf's own URL slug (19771103, 3 November) is wrong (its " +
      "own document slug is even misspelled 'avkaensiis').",
  },
  'paul-vi|apost_constitutions|iullundurensis|1971-12-06': {
    date: '1971-12-06',
    note:
      "Iullundurensis's own dating formula reads 'die sexto mensis Decembris... 1971... " +
      "Pontificatus Nostri nono' (6 December 1971, 9th year of the pontificate -- " +
      'consistent, 1971-06-21 to 1972-06-20). The printed date is correct; the ' +
      "apost_constitutions shelf's own URL slug (19711129, 29 November) is wrong.",
  },
  'paul-vi|apost_constitutions|insularum-sancti-petri-et-miquelonensis|1970-11-11': {
    date: '1970-11-16',
    note:
      "Insularum Sancti Petri et Miquelonensis's own dating formula reads 'die sextodecimo " +
      "mensis novembris... 1970... Pontificatus Nostri octavo' (16 November 1970, 8th year " +
      'of the pontificate -- consistent, 1970-06-21 to 1971-06-20). The ' +
      "apost_constitutions shelf's printed date ('11 novembre 1970', 11 November) is the " +
      'error; its own URL slug (19701116, 16 November) is correct.',
  },
  'paul-vi|apost_constitutions|chetumaliensis|1970-05-23': {
    date: '1970-05-23',
    note:
      "Chetumaliensis's own dating formula reads 'die vicesimo tertio mensis maii... " +
      "1970... Pontificatus Nostri septimo' (23 May 1970, 7th year of the pontificate -- " +
      'consistent, 1969-06-21 to 1970-06-20). The printed date is correct; the ' +
      "apost_constitutions shelf's own URL slug (19700521, 21 May) is wrong.",
  },
  'paul-vi|apost_constitutions|campitemplensis|1968-12-08': {
    date: '1968-12-08',
    note:
      "Campitemplensis's own dating formula reads 'die octavo mensis decembris... 1968... " +
      "Pontificatus Nostri sexto' (8 December 1968, 6th year of the pontificate -- " +
      'consistent, 1968-06-21 to 1969-06-20). The printed date is correct; the ' +
      "apost_constitutions shelf's own URL slug (19681123, 23 November) is wrong.",
  },
  'paul-vi|apost_constitutions|gruardensis-et-aliarum|1967-07-17': {
    date: '1967-07-13',
    note:
      "Gruardensis et aliarum's own dating formula reads 'die tertiodecimo mensis iulii... " +
      "1967... Pontificatus Nostri quinto' (13 July 1967, 5th year of the pontificate -- " +
      "consistent, 1967-06-21 to 1968-06-20). The apost_constitutions shelf's printed date " +
      "('17 luglio 1967', 17 July) is the error; its own URL slug (19670713, 13 July) is " +
      'correct.',
  },
  'paul-vi|apost_constitutions|arundelliensis-brichtelmestunensis|1967-06-10': {
    date: '1967-07-10',
    note:
      "This (the second of two same-named Arundelliensis - Brichtelmestunensis acts on this " +
      "shelf, dated separately in 1965 and 1967) has its own dating formula reading 'die " +
      "decimo mensis Iulii... 1967... Pontificatus Nostri quinto' (10 July 1967, 5th year " +
      'of the pontificate -- consistent, 1967-06-21 to 1968-06-20). The ' +
      "apost_constitutions shelf's printed date ('10 giugno 1967', 10 June) is the error; " +
      "its own URL slug (19670710, 10 July) is correct.",
  },
  'paul-vi|apost_constitutions|bauropolitanae|1964-02-11': {
    date: '1964-02-15',
    note:
      "Bauropolitanae's own dating formula reads 'die quintodecimo mensis Februarii... " +
      "1964... Pontificatus Nostri primo' (15 February 1964, 1st year of the pontificate -- " +
      'consistent, 1963-06-21 to 1964-06-20). The apost_constitutions shelf\'s printed date ' +
      "('11 febbraio 1964', 11 February) is the error; its own URL slug (19640215, 15 " +
      'February) is correct.',
  },
  'paul-vi|apost_letters|quam-recte|1977-10-10': {
    date: '1977-10-25',
    note:
      "Quam recte's own dating formula reads 'sub anulo Piscatoris die XXV mensis Octobris " +
      "anno MCMLXXVII, Pontificatus Nostri quinto decimo' (25 October 1977, 15th year of " +
      'the pontificate -- consistent, 1977-06-21 to 1978-06-20). The apost_letters shelf\'s ' +
      "printed date ('10 ottobre 1977', 10 October) is the error; its own URL slug " +
      '(19771025, 25 October) is correct.',
  },
  'paul-vi|apost_letters|antiquae-nobilitatis|1969-02-02': {
    date: '1969-02-02',
    note:
      "Antiquae nobilitatis's own dating formula reads 'die II mensis Februarii, in festo " +
      "Purificationis B.M.V.... 1969, Pontificatus Nostri sexto' (2 February 1969, the " +
      'feast of the Purification, 6th year of the pontificate -- consistent, 1968-06-21 to ' +
      "1969-06-20). The printed date is correct; the apost_letters shelf's own URL slug " +
      '(19690214, 14 February) is wrong.',
  },
  'paul-vi|apost_letters|opera-bona|1967-01-27': {
    date: '1968-01-27',
    note:
      "Opera bona's own dating formula reads 'die XXVII mensis Ianuarii... MCMLXVIII, " +
      "Pontificatus Nostri quinto' (27 January 1968, 5th year of the pontificate -- " +
      "consistent, 1967-06-21 to 1968-06-20). The apost_letters shelf's printed date " +
      "('27 gennaio 1967', year 1967) is the error, off by exactly one year; its own URL " +
      'slug (19680127, 1968) is correct.',
  },
  'paul-vi|apost_letters|quantum-utilitatis|1967-08-19': {
    date: '1967-08-19',
    note:
      "This is one of five distinct 'Quantum utilitatis' letters on this shelf (an " +
      'unremarkable homonym, not a duplicate -- each carries its own date and its own URL ' +
      "document slug). This instance's own dating formula reads 'die XIX mensis Augusti, " +
      "anno MCMLXVII, Pontificatus Nostri quinto' (19 August 1967, 5th year of the " +
      'pontificate -- consistent, 1967-06-21 to 1968-06-20). The printed date is correct; ' +
      'this URL slug (19670818, 18 August) is wrong.',
  },
  'paul-vi|motu_proprio|equestres-ordines|1965-04-15': {
    date: '1966-04-15',
    note:
      "Equestres Ordines's own dating formula reads 'die XV mensis Aprilis, anno MCMLXVI, " +
      "Pontificatus Nostri tertio' (15 April 1966, 3rd year of the pontificate -- " +
      "consistent, 1965-06-21 to 1966-06-20). The motu_proprio shelf's printed date " +
      "('15 aprile 1965', year 1965) is the error, off by exactly one year; its own URL " +
      'slug (19660415, 1966) is correct.',
  },
  'paul-vi|apost_letters|merito-celebratur|1966-10-10': {
    date: '1966-10-10',
    note:
      "The shelf index's own <a> for this row is mislinked to an unrelated document " +
      "(hf_p-vi_apl_19661014_quantum-utilitatis.html, an Iraq-nunciature letter -- " +
      "confirmed by fetching it directly), so `source.url` on this record inherits " +
      "vatican.va's own broken href; fixing `source.url` itself is out of scope (no " +
      "correction mechanism exists for it). The real document, found by guessing this " +
      "shelf's own naming convention rather than following the broken link and confirmed " +
      "by fetching it directly (hf_p-vi_apl_19661010_merito-celebratur.html), opens " +
      "'Merito celebratur, Litterae Apostolicae, Titulus ac privilegia Basilicae Minoris " +
      "ecclesiae cathedrali dioecesis Sancti Michaëlis, in Republica Salvatoriana, " +
      "conferuntur' (minor-basilica status for the cathedral of San Miguel, El Salvador) " +
      "and its own dating formula reads 'Datum Romae, apud Sanctum Petrum, sub anulo " +
      "Piscatoris, die X mensis Octobris, anno MCMLXVI, Pontificatus Nostri quarto' (10 " +
      'October 1966, 4th year of the pontificate -- consistent, 1966-06-21 to 1967-06-20). ' +
      "The apost_letters shelf's printed date is correct and needs no change; the apparent " +
      "slug mismatch (14 October) belongs to the unrelated document the broken href " +
      'points at, not to Merito celebratur itself.',
  },
  'paul-vi|apost_letters|amor-dulcissimus|1965-10-23': {
    date: '1965-10-23',
    note:
      "The shelf index's own <a> for this row is mislinked to an unrelated document " +
      "(hf_p-vi_apl_19651017_inter-persecutiones.html, a beatification letter for Fr. " +
      "Jacques Berthieu SJ closing '...die XVII mensis Octobris... anno MCMLXV, " +
      "Pontificatus Nostri tertio', 17 October 1965 -- confirmed by fetching it directly), " +
      "so `source.url` on this record inherits vatican.va's own broken href; fixing " +
      "`source.url` itself is out of scope. The real document, found the same way as " +
      "Merito celebratur above and confirmed by fetching it directly " +
      "(hf_p-vi_apl_19651023_amor-dulcissimus.html), opens 'Amor dulcissimus, Litterae " +
      "Apostolicae, Beata Maria Virgo, «de Vallevenaria» volgo appellata, praecipua " +
      "Patrona totius dioecesis Calaguritanae et Calceatensis-Logrognensis renuntiatur' " +
      "(Our Lady of Vallevenaria declared patroness of the dioceses of Calahorra and " +
      "Calzada-Logroño) and its own dating formula reads 'Datum Romae, apud Sanctum " +
      "Petrum, sub anulo Piscatoris, die XXIII mensis Octobris, anno MCMLXV, Pontificatus " +
      "Nostri tertio' (23 October 1965, 3rd year of the pontificate -- consistent, " +
      "1965-06-21 to 1966-06-20). The apost_letters shelf's printed date is correct and " +
      'needs no change; the apparent slug mismatch (17 October) belongs to the unrelated ' +
      'document the broken href points at, not to Amor dulcissimus itself.',
  },
};
