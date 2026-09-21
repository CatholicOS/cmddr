import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseActaIndex, splitEntryText, joinLines, romanToInt, parseRate, harvestedParseRate, NESTED_TOC_HEADINGS } from '../src/acta/index.js';
import { categoryForHeading } from '../src/acta/categories.js';

/** Wrap an excerpt of the chronological index in the title page and part heading it needs. */
const index = (body: string, head = '(An. 2023 et Vol. CXV)') => `ACTA  APOSTOLICAE  SEDIS
INDEX GENERALIS ACTORUM
${head}
I – ACTA SUMMI PONTIFICIS
Consistoria: 839.
\fII
INDEX DOCUMENTORUM
CHRONOLOGICO ORDINE DIGESTUS
I – ACTA FRANCISCI PP.
${body}
`;

describe('parseActaIndex', () => {
  it('reads the volume from the heading and checks the printed year against the fixture year', () => {
    const r = parseActaIndex(index('II – ADHORTATIONES APOSTOLICAE\n  4 Oct. 2023 Laudate Deum. De caeli status discrimine .  .  .  1041'), { year: 2023 });
    expect(r.volume).toBe(115);
    expect(r.year).toBe(2023);
    expect(() => parseActaIndex(index(''), { year: 2024 })).toThrow(/prints An\. 2023/);
  });

  it('reads 2015\'s OCR heading "(An. et vol. CvII)" with no year printed', () => {
    const r = parseActaIndex(index('I – LITTERAE ENCYCLICAE\n2015 Maii 24 Laudato si\'. De communi domo colenda  .  .  . 847', '(An. et vol. CvII)'), { year: 2015 });
    expect(r.volume).toBe(107);
    expect(r.entries[0]).toMatchObject({ date: '2015-05-24', incipit: "Laudato si'", page: 847 });
  });

  it('parses a one-line entry with a guillemet incipit, and a bare Latin one', () => {
    const r = parseActaIndex(index(`IV – LITTERAE APOSTOLICAE MOTU PROPRIO DATAE
  5 Dec. 2022 « Chi è fedele ». De personis iuridicis instrumentalibus Curiae
Romanae   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  1
20 Feb. 2023 Ius nativum. De patrimonio Sedis Apostolicae   .  .  .  .  .  .  263`));
    expect(r.entries).toHaveLength(2);
    expect(r.entries[0]).toMatchObject({
      series: 'AAS', volume: 115, year: 2023, page: 1, pope: 'Franciscus',
      category: 'LITTERAE APOSTOLICAE MOTU PROPRIO DATAE', date: '2022-12-05',
      incipit: 'Chi è fedele', toponym: null,
      description: 'De personis iuridicis instrumentalibus Curiae Romanae',
    });
    expect(r.entries[0]!.raw).toBe('  5 Dec. 2022 « Chi è fedele ». De personis iuridicis instrumentalibus Curiae\nRomanae   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  1');
    expect(r.entries[1]).toMatchObject({ date: '2023-02-20', incipit: 'Ius nativum', description: 'De patrimonio Sedis Apostolicae', page: 263 });
  });

  it('resolves » ditto marks for the month and year, and for all three (day-first layout)', () => {
    const r = parseActaIndex(index(`I – CONSISTORIA
  9 Iul. 2023 Consistorium annuntiatur   .  .  .  .  .  .  839
30 Sep. » Titulorum assignatio .  .  .  .  .  .  .  .  1039
 » » » Homilia pro creatione novorum Cardinalium  .  .  .  . 1067
  4 Oct. » Sancta Missa cum novis Cardinalibus  .  .  .  .  1073`));
    expect(r.entries.map((e) => e.date)).toEqual(['2023-07-09', '2023-09-30', '2023-09-30', '2023-10-04']);
    expect(r.entries.map((e) => e.page)).toEqual([839, 1039, 1067, 1073]);
  });

  it('reads the year-first layout of 2015-2016 with its ditto marks and Mart./Febr./Sept.', () => {
    const r = parseActaIndex(index(`X – ALLOCUTIONES
2014 Dec. 20 Ad Consociationem « Communitas Ioannes XXIII Papa »  .   42
 » » 22 Occasione Romanae Curiae Natalicia Omina prosequendi  .   44
 » Mart. 19 De spiritali itinere : In Hungaria Ecclesia   .  .  .  .  504
 » » » In hac suprema: Ecclesia Metropolitana sui iuris  .  .  .  505
2015 Febr. 2 Nel marzo dell’anno. Ad Praesides   .  .  .  .  .  .  130
 » Sept. 5 Ad Excellentissimum Dominum  .  .  .  .  .  .  .  .  .  1071`, '(An. et vol. CvII)'), { year: 2015 });
    expect(r.entries.map((e) => e.date)).toEqual([
      '2014-12-20', '2014-12-22', '2014-03-19', '2014-03-19', '2015-02-02', '2015-09-05',
    ]);
    expect(r.entries[2]).toMatchObject({ incipit: 'De spiritali itinere', description: 'In Hungaria Ecclesia' });
  });

  it('lets a running header interrupt an entry, and joins a word broken at the line end', () => {
    const r = parseActaIndex(index(`IV – LITTERAE APOSTOLICAE MOTU PROPRIO DATAE
16 Apr. 2023 Iam Pridem. Quibus normae quaedam Codicis Canonum Ec -
clesiarum Orientalium immutantur ad Episcopos perti -
\f1468 Acta Apostolicæ Sedis – Commentarium Officiale
nentes, qui octogesimum annum aetatis expleverunt, in
Synodo Episcoporum eorumdem Ecclesiarum sui iuris   .  484
\f Index documentorum chronologico ordine digestus 1469
  8 Aug. » Le Prelature personali. Quibus Canones 295-296 CIC de Prae-
laturis Personalibus mutantur  .  .  .  .  .  .  .  .  .  .  . 951`));
    expect(r.entries).toHaveLength(2);
    expect(r.entries[0]!.description).toBe(
      'Quibus normae quaedam Codicis Canonum Ecclesiarum Orientalium immutantur ad Episcopos '
      + 'pertinentes, qui octogesimum annum aetatis expleverunt, in Synodo Episcoporum eorumdem Ecclesiarum sui iuris',
    );
    expect(r.entries[0]!.page).toBe(484);
    expect(r.entries[1]).toMatchObject({ date: '2023-08-08', incipit: 'Le Prelature personali', page: 951 });
    expect(r.entries[1]!.description).toBe('Quibus Canones 295-296 CIC de Praelaturis Personalibus mutantur');
  });

  it('strips a running header glued to the previous page\'s last line by the form feed', () => {
    const r = parseActaIndex(index(`V – LITTERAE APOSTOLICAE SUB PLUMBO DATAE
  » » » Templum B. Mariae Virginis Divini Amoris ad Castrum Leo -
nis fit Diaconia Cardinalicia .  .  .  .  .  .  .  .  .  .  .  .  1150\f1276 Acta Apostolicæ Sedis – Commentarium Officiale
VI – LITTERAE APOSTOLICAE MOTU PROPRIO DATAE
28 Nov. 2020 Fidem servare. De Pontificio Consilio  .  .  .  .  1152`.replace('» » »', '28 Nov. 2020')));
    expect(r.entries.map((e) => e.page)).toEqual([1150, 1152]);
    expect(r.entries[0]!.incipit).toBeNull();
    expect(r.entries[0]!.description).toBe('Templum B. Mariae Virginis Divini Amoris ad Castrum Leonis fit Diaconia Cardinalicia');
  });

  it('reads the small-caps toponym of a constitution, rendered in mixed case by OCR', () => {
    const r = parseActaIndex(index(`V – CONSTITUTIONES APOSTOLICAE
14 Dec. 2022 VuCArien.: In Nigeria, dismembrato territorio dioecesis Ialin-
goënsis, dioecesis Vucariensis conditur   .  .  .  .  .  .  .  265
  6 Ian. 2023 In Ecclesiarum Communione , de administratione Vicariatus
Urbis  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  7
26 » » de sAnCto petro sulA: In Honduria nova Provincia  .  .  127
  1 Iun. » Cuneen. – fossAnen.: Cuneensis et Fossanensis dioeceses ple-
ne iunguntur   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  625
22 Iul. » Voten.: In Kenia, dismembrato territorio  .  .  .  .  841
31 » » tigren. In Venetiola nova conditur dioecesis Trigrensis.  .  .  1162`));
    expect(r.entries.map((e) => e.toponym)).toEqual([
      'VuCArien.', null, 'de sAnCto petro sulA', 'Cuneen. – fossAnen.', 'Voten.', 'tigren.',
    ]);
    expect(r.entries[0]!.description).toBe('In Nigeria, dismembrato territorio dioecesis Ialingoënsis, dioecesis Vucariensis conditur');
    // A comma is not an incipit terminator, so the 2023 constitution without a toponym
    // prints no incipit at all rather than a wrong one.
    expect(r.entries[1]).toMatchObject({ incipit: null, toponym: null, description: 'In Ecclesiarum Communione , de administratione Vicariatus Urbis' });
    expect(r.entries[5]!.description).toBe('In Venetiola nova conditur dioecesis Trigrensis');
  });

  it('reads 2015\'s constitutions, which print an incipit and a colon instead of a toponym', () => {
    const r = parseActaIndex(index(`V – CONSTITUTIONES APOSTOLICAE
2014 Oct. 23 Contemplationi faventes: In Italia nomen finesque mutantur   122
 » Nov. 6 « Inter eximias  »: Nova in Tanzania erigitur provincia  .  .  1
 » » » Nos, qui successimus : In India nova Exarchia  .  .  .  .  502`, '(An. et vol. CvII)'), { year: 2015 });
    expect(r.entries.map((e) => [e.date, e.incipit, e.toponym])).toEqual([
      ['2014-10-23', 'Contemplationi faventes', null],
      ['2014-11-06', 'Inter eximias', null],
      ['2014-11-06', 'Nos, qui successimus', null],
    ]);
    expect(r.entries[1]!.description).toBe('Nova in Tanzania erigitur provincia');
  });

  it('ends an entry on a page number after leaders, after two spaces, or after one space on a full line', () => {
    const r = parseActaIndex(index(`X – HOMILIAE
12 Dec. 2017 In celebratione liturgica Beatae Mariae Virginis de Guadalupe 45
 6 » » In Sancta Missa   .  .  .  .  .  .  .  .  .  .  .  .  .  .  196
22 » » Statio quadragesimalis, cui praefuit Summus Pontifex  291
25 » » In IV Dominica Verbi Dei, anno Domini 2023
celebrata  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  141`));
    expect(r.entries.map((e) => e.page)).toEqual([45, 196, 291, 141]);
    // 'anno Domini 2023' closes a continuation line and is not a page: the entry goes on.
    expect(r.entries[3]!.description).toBe('In IV Dominica Verbi Dei, anno Domini 2023 celebrata');
  });

  it('reports an entry without a page number, an OCR-split page and an OCR-garbled date as defects', () => {
    const r = parseActaIndex(index(`XI – ALLOCUTIONES
2015 Iun. 8 Ad Clericos, apud Sanctuarium vulgo El Quinche (in Aequatoria) et cetera.   76 4
2015 Iul. 9 Ad Participes II Conventus Mundialis Motuum Popularium  .  .  858
»  ? ? Ad Participes Conventus Theologici Internationalis  .  .  977
V – CONSTITUTIONES APOSTOLICAE
5 Nov.  2024 ioinVillen.: In Brasilia nova Provincia Ecclesiastica   .  .  .
  »  »  » XApeCoën.: In Brasilia nova Provincia Ecclesiastica Xapecoënsis  1441`, '(An. 2024 et Vol. CXVI)'), { year: 2024 });
    expect(r.entries.map((e) => e.page)).toEqual([858, 1441]);
    expect(r.defects.map((d) => d.category)).toEqual(['ALLOCUTIONES', 'ALLOCUTIONES', 'CONSTITUTIONES APOSTOLICAE']);
    expect(r.defects[0]!.message).toMatch(/^entry without a page number: 2015 Iun\. 8/);
    expect(r.defects[1]!.message).toMatch(/^line outside any entry: » {2}\? \?/);
    expect(r.defects[2]!.message).toMatch(/^entry without a page number: 5 Nov\. {2}2024 ioinVillen/);
  });

  it('parses only the pope parts: dicasterial parts are skipped and named, a second pope part is read', () => {
    const r = parseActaIndex(index(`VI – LITTERAE APOSTOLICAE
  4 Sep. 2022 « Dominus potissime ». Venerabili Servo Dei Ioanni Paulo I  .  1223
II – ACTA BENEDICTI XVI
LITTERAE APOSTOLICAE
 30 Maii 2010 « Ego autem ». Venerabili Dei Servae Mariae Petrae De Micheli
caelitum Beatorum tribuitur dignitas  .  .  .  .  .  .  .  .  476
III – ACTA CONGREGATIONUM
CONGREGATIO PRO DOCTRINA FIDEI
 22 Feb. 2020 Quo magis  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  1
IV. – ACTA TRIBUNALIUM
DIARIUM ROMANAE CURIAE
Audientiae sollemniores: 160, 372`));
    expect(r.entries.map((e) => [e.pope, e.category, e.date])).toEqual([
      ['Franciscus', 'LITTERAE APOSTOLICAE', '2022-09-04'],
      ['Benedictus XVI', 'LITTERAE APOSTOLICAE', '2010-05-30'],
    ]);
    expect(r.skippedParts).toEqual(['III – ACTA CONGREGATIONUM', 'IV. – ACTA TRIBUNALIUM', 'DIARIUM ROMANAE CURIAE']);
    expect(r.defects).toEqual([]);
  });

  it('takes the bracketed original date, and pope, of an earlier pontificate\'s act', () => {
    const r = parseActaIndex(index(`VI – LITTERAE APOSTOLICAE
11 Maii 2018 [2010 Sept. 19] « Admodum fideli ». Venerabili Servo Dei Ioanni
Henrico Newman, cardinali, Beatorum honores decernuntur  .  1386
17 Nov. » [Benedictus XVI: 2010 Apr. 25] « Domine, non est ». Venerabili
Dei Servo Iosepho Tous y Soler Beatorum honores decernuntur  .  1795`, '(An. 2018 et vol. CX)'), { year: 2018 });
    expect(r.entries.map((e) => [e.pope, e.date, e.incipit])).toEqual([
      ['Franciscus', '2010-09-19', 'Admodum fideli'],
      ['Benedictus XVI', '2010-04-25', 'Domine, non est'],
    ]);
    expect(r.entries[0]!.raw).toContain('11 Maii 2018 [2010 Sept. 19]');
  });

  it('reads the day-first bracket with the pope\'s PP. of the 2020 and 2021 indexes', () => {
    const r = parseActaIndex(index(`VI – LITTERAE APOSTOLICAE
 17 Iul. 2020 [Benedictus PP. XVI: 6 Iun. 2010] « Testes christianae  ».
Venerabili Servo Dei Georgio Popiełuszko Beatorum honores decernuntur  .  673
 21 » » « Sanctitas ». Venerabili Dei Servo caelitum Beatorum tribuitur dignitas  .  680`, '(An. 2020 et vol. CXII)'), { year: 2020 });
    expect(r.entries.map((e) => [e.pope, e.date, e.incipit, e.quoted])).toEqual([
      ['Benedictus XVI', '2010-06-06', 'Testes christianae', true],
      ['Franciscus', '2020-07-21', 'Sanctitas', true],
    ]);
    expect(r.entries[0]!.description).toBe('Venerabili Servo Dei Georgio Popiełuszko Beatorum honores decernuntur');
  });

  it('keeps a date line with no day as a month-only entry, and lets its month govern the ditto marks after it', () => {
    // AAS 2018 p. 689: `Sept. » Chengden.:` prints no day. Read as May (the entry before
    // it), the two `» »` entries after it would be May too; the index means September --
    // Prizren-Pristina became a diocese on 5 September 2018, Episcopalis communio is of
    // 15 September 2018 -- and the parser must not date them by the wrong ditto. The
    // entry itself is kept with a month-only date (acta volumes spec §4), which the
    // matcher reads by incipit within the month and the creator never creates.
    const r = parseActaIndex(index(`V – CONSTITUTIONES APOSTOLICAE
31 Maii 2018 tigren. In Venetiola nova conditur dioecesis Trigrensis.  .  .  1162
  Sept. » Chengden.: In Sinis nova conditur dioecesis Chengdensis  .  .  689
 5 » » Prisrensis-Priscensis: Administratio Apostolica Prisrianen -
sis ad gradum et dignitatem dioecesis evehitur  .  .  .  .  1708
15 » » « Episcopalis Communio ». De Synodo Episcoporum   .  .  .  .  1359
 » » » « Alia ». De alia re   .  .  .  .  1400`, '(An. 2018 et vol. CX)'), { year: 2018 });
    expect(r.entries.map((e) => [e.date, e.incipit ?? e.toponym])).toEqual([
      ['2018-05-31', 'tigren.'],
      ['2018-09', 'Chengden.'],
      ['2018-09-05', 'Prisrensis-Priscensis'],
      ['2018-09-15', 'Episcopalis Communio'],
      ['2018-09-15', 'Alia'],
    ]);
    expect(r.entries[1]!.page).toBe(689);
    expect(r.stats.monthOnly).toBe(1);
    expect(r.defects).toEqual([]);
  });

  it('reports a ditto day after a day-less line as unreadable rather than inheriting an older day', () => {
    const r = parseActaIndex(index(`V – CONSTITUTIONES APOSTOLICAE
31 Maii 2018 tigren. In Venetiola nova conditur dioecesis Trigrensis.  .  .  1162
  Sept. » Chengden.: In Sinis nova conditur dioecesis Chengdensis  .  .  689
 » » » Alia.: De alia re   .  .  .  .  1400`, '(An. 2018 et vol. CX)'), { year: 2018 });
    expect(r.entries.map((e) => e.date)).toEqual(['2018-05-31', '2018-09']);
    expect(r.defects.map((d) => d.message.split(':')[0])).toEqual(['unreadable date (a ditto day after a month-only entry)']);
  });

  it('reads the incipit a 2017 constitution prints in guillemets after its toponym', () => {
    const r = parseActaIndex(index(`V – CONSTITUTIONES APOSTOLICAE
  2 Ian. 2017 DAnlIensIs. « Insita humanae naturae ». In Honduria, dismembratis
quibusdam territoriis, dioecesis Danliensis conditur   .  .  .  207`, '(An. 2017 et vol. CIX)'), { year: 2017 });
    expect(r.entries[0]).toMatchObject({
      toponym: 'DAnlIensIs.', incipit: 'Insita humanae naturae', quoted: true,
      description: 'In Honduria, dismembratis quibusdam territoriis, dioecesis Danliensis conditur',
    });
  });

  it('joins a two-line heading and reports a heading the category table has never seen', () => {
    const r = parseActaIndex(index(`XV – ITINERA APOSTOLICA, VISITATIONES PASTORALES,
VISITATIONES, PEREGRINATIONES, ITINERA
A die 31 Ianuarii ad diem 5 Februarii, Iter Apostolicum:
Dies 31. All. in Occursu cum Auctoritatibus  .  .  .  .  .  .  .  .  202
XVI – LITTERAE INAUDITAE
  2 Maii 2023 Statuta Caritatis Internationalis  .  .  .  .  .  .  .  .  .  .  .  .  560`));
    expect(r.defects.map((d) => d.category)).toEqual([
      'ITINERA APOSTOLICA, VISITATIONES PASTORALES, VISITATIONES, PEREGRINATIONES, ITINERA',
      'ITINERA APOSTOLICA, VISITATIONES PASTORALES, VISITATIONES, PEREGRINATIONES, ITINERA',
    ]);
    expect(r.entries.map((e) => e.category)).toEqual(['LITTERAE INAUDITAE']);
    expect(r.unseenHeadings).toEqual(['Franciscus: LITTERAE INAUDITAE']);
  });

  it('is deterministic', () => {
    const text = index('II – ADHORTATIONES APOSTOLICAE\n  4 Oct. 2023 Laudate Deum. De caeli  .  .  .  1041');
    expect(parseActaIndex(text)).toEqual(parseActaIndex(text));
  });
});

/** Wrap an excerpt of a volume's chronological index (no title page: the volume is the caller's). */
const volume = (body: string, pope = 'I. - ACTA PII PP. XI') => `                                  H

                             INDEX DOCUMENTORUM
               CHRONOLOGICO ORDINE DIGESTUS

                                  ${pope}

${body}
`;
const columnar = { columnar: true };

describe('parseActaIndex on the volumes (acta volumes spec §4)', () => {
  it('takes the volume and part from the caller when the fixture prints no title page', () => {
    const r = parseActaIndex(volume(`                                      I. - LITTERAE ENCYCLICAE
1917       Iun.      15     Humani generis redemptionem. - Ad Patriarchas, Pri­
                                mates, Archiepiscopos . . 305`, 'I. - ACTA BENEDICTI PP. XV'), { year: 1917, volume: 9, part: 'I', ...columnar });
    expect(r).toMatchObject({ volume: 9, year: 1917, part: 'I' });
    expect(r.entries[0]).toMatchObject({
      pope: 'Benedictus XV', part: 'I', date: '1917-06-15', page: 305, incipit: 'Humani generis redemptionem',
      description: 'Ad Patriarchas, Primates, Archiepiscopos', category: 'LITTERAE ENCYCLICAE',
    });
    expect(() => parseActaIndex(volume(''), { year: 1917 })).toThrow(/no volume given/);
  });

  it('maps the genitive pope headings of every era, and reports one the table does not list', () => {
    const r = parseActaIndex(volume(`                                      I - LITTERAE ENCYCLICAE
1958 Iulii 14 Meminisse iuvat. - Ad Venerabiles Fratres 449
                      II - ACTA IN MORTE PII PP. XII
1958 Oct. 9 Nuntius . . 1
                      III - ACTA CONCLAVIS
                    ELECTIONIS ET CORONATIONE IOANNIS PP. XXIII
1958 Oct. 28 Habemus Papam . . 2
                 IV - ACTA IOANNIS PP. XXIII
                       III - MOTU PROPRIO
1958 Nov. 12 Divini Pastoris. - De Commissione 981
                 V - ACTA LEONIS PP. XIII
                       I - EPISTULAE
1958 Nov. 13 Olim scripsit. - Ad aliquem 982`, 'I - ACTA PII PP. XII'), { year: 1958, volume: 50, ...columnar });
    expect(r.entries.map((e) => [e.pope, e.category, e.incipit])).toEqual([
      ['Pius XII', 'LITTERAE ENCYCLICAE', 'Meminisse iuvat'],
      ['Ioannes XXIII', 'MOTU PROPRIO', 'Divini Pastoris'],
      ['LEONIS XIII', 'EPISTULAE', 'Olim scripsit'],
    ]);
    expect(r.skippedParts).toEqual(['II - ACTA IN MORTE PII PP. XII', 'III - ACTA CONCLAVIS']);
    expect(r.unmappedPopes).toEqual(['ACTA LEONIS PP. XIII']);
  });

  it('reads 1909: the column header, the blank-column dittos, and the nested table of contents as sub-items', () => {
    const r = parseActaIndex(volume(`ANNO   MENSE   DIE
                                I. - CONSTITUTIONES APOSTOLICAE.
1908    Ian.   29    Constitutio « Sapienti Consilio »
                                    DE ROMANA CURIA.
                                   1. - SACRAE CONGREGATIONES.
                      1.° Congregatio Sancti Officii .
                      2.° Congregatio Consistorialis
                                        II. - TRIBUNALIA.
                      1.° Sacra Poenitentiaria
                                                              LEX PROPRIA.
                                  SACRAE ROMANAE ROTAE ET SIGNATURAE APOSTOLICAE.
                                                    TIT. I. - SACRA ROMANA ROTA.
   »             »           »       CAP. IV. - De horis ac disciplina Officiorum ....                                             41
                                                       II. - LITTERAE APOSTOLICAE.
                          11 Regia primitiva archisodalitas Matritensis B. Mariae
                                       virginis a prodigiis pontificiae titulo condecoratur .                                      197
              Oct.        16 Pia congregatio Matritensis nostrae Dominae de la Pa­
                                        loma indulgentia plenaria ditatur                                                          229
1909        Febr.                 Plenaria indulgentia conceditur pro festo S. Ioannis
                                       Baptistae de la Salle                                                                       301
                                  Ecclesia metropolitana Lancianensis titulo basilicae
                                       minoris augetur                                                                             302
                         18       Praefectura Apostolica de Basuto-Land in Africa au­
                                       strali erigitur in Vicariatum Apostolicum . . . .                                           303
           April.        11      Venerabilis Ioanna de Arc virgo, Aurelianensis nun­
                                      cupata, renunciatur Beata                                                                    573
                                 Ecclesia S. Mariae Angelorum de portiuncula declara­
                                      tur basilica patriarchalis                                                                   575`, 'I. — ACTA PII PP. X.'),
    { year: 1909, volume: 1, columnar: true, bareIncipits: false });
    // The constitution's own entry has no page (the sub-items follow), the sub-items are
    // consumed, and none of the eleven capitalised or numbered lines becomes a heading.
    expect(r.unseenHeadings).toEqual([]);
    expect(r.stats.subItems).toBe(9);
    expect(r.defects.map((d) => d.message.slice(0, 61))).toEqual(['entry without a page number: 1908    Ian.   29    Constitutio']);
    expect(r.entries.map((e) => [e.date, e.page, e.incipit, e.description.slice(0, 29)])).toEqual([
      // A day alone inherits year and month; a month alone inherits the year and reads
      // month-only; a blank line under a blank month is the previous entry's day.
      ['1908-01-11', 197, null, 'Regia primitiva archisodalita'],
      ['1908-10-16', 229, null, 'Pia congregatio Matritensis n'],
      ['1909-02', 301, null, 'Plenaria indulgentia concedit'],
      ['1909-02', 302, null, 'Ecclesia metropolitana Lancia'],
      ['1909-02-18', 303, null, 'Praefectura Apostolica de Bas'],
      ['1909-04-11', 573, null, 'Venerabilis Ioanna de Arc vir'],
      ['1909-04-11', 575, null, 'Ecclesia S. Mariae Angelorum '],
    ]);
    expect(r.entries.map((e) => e.category)).toEqual(Array(7).fill('LITTERAE APOSTOLICAE'));
    // Every line of the nested table of contents the parser is told about is a 1909 line.
    const fixture = readFileSync('tools/fixtures/acta/aas-01-1909.txt', 'utf8');
    for (const h of NESTED_TOC_HEADINGS) expect(fixture, h).toMatch(new RegExp(h.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  });

  it('swallows the nested table of contents in AAS 1 only: in another volume the same words are a heading', () => {
    // The Sapienti Consilio sub-items are a shape of vol. 1; a later volume printing
    // 'SACRA ROMANA ROTA' or 'APPENDIX' inside the pope's part must see a heading, and
    // report it as unseen rather than silently consume the entries that follow it.
    const text = volume(`                                   I - LITTERAE APOSTOLICAE
1958    Ian.   10    Quae de fidelibus. - Templum paroeciale S. Ioannis . . 41
                                   III - SACRA ROMANA ROTA
1957    Dec.   16    Vic Apost. Aegypti. - Nullitatis matrimonii (Dentrice - Montano) . 55`, 'I - ACTA PII PP. XII');
    const r1958 = parseActaIndex(text, { year: 1958, volume: 50, columnar: true });
    expect(r1958.stats.subItems).toBe(0);
    expect(r1958.unseenHeadings).toEqual(['Pius XII: SACRA ROMANA ROTA']);
    expect(r1958.entries.map((e) => [e.category, e.page])).toEqual([['LITTERAE APOSTOLICAE', 41], ['SACRA ROMANA ROTA', 55]]);
    // The same text as AAS 1 consumes the heading as a sub-item and nothing follows it.
    const r1909 = parseActaIndex(text, { year: 1909, volume: 1, columnar: true });
    expect(r1909.stats.subItems).toBeGreaterThan(0);
    expect(r1909.unseenHeadings).toEqual([]);
  });

  it('reads a 1909 incipit only in guillemets after a genre word, never from a bare description', () => {
    const r = parseActaIndex(volume(`                                        III. - LITTERAE ENCYCLICAE.
1909 Apr.        21      Litt. encycl. « Communium rerum », de saecularibus
                         solemniis in honorem S. Anselmi  . . 573
                                                 IV. - EPISTOLAE.
 Nov.         3      Pontificium Institutum Biblicum in Urbe erigitur. — Leges
                         pontificio Instituto Biblico regendo . . 601`, 'I. — ACTA PII PP. X.'),
    { year: 1909, volume: 1, columnar: true, bareIncipits: false });
    expect(r.entries.map((e) => [e.incipit, e.quoted, e.description])).toEqual([
      ['Communium rerum', true, 'de saecularibus solemniis in honorem S. Anselmi'],
      [null, false, 'Pontificium Institutum Biblicum in Urbe erigitur. — Leges pontificio Instituto Biblico regendo'],
    ]);
    // The year column is blank on the second entry, across a category heading: inherited.
    expect(r.entries.map((e) => e.date)).toEqual(['1909-04-21', '1909-11-03']);
  });

  it('reads the century\'s month spellings, with and without the full stop', () => {
    const r = parseActaIndex(volume(`                                      V. - LITTERAE APOSTOLICAE
1930 Ianuarii 3 A. - a 1
» Februarii 4 B. - b 2
» Martii 5 C. - c 3
» April. 6 D. - d 4
» Maii 7 E. - e 5
» Mai. 8 F. - f 6
» Iunii 9 G. - g 7
» Iulii 10 H. - h 8
» Augusti 11 I. - i 9
» Septembris 12 K. - k 10
» Octobris 13 L. - l 11
» Novembris 14 M. - m 12
» Decembris 15 N. - n 13
» Ian 16 O. - o 14`), { year: 1931, volume: 23, ...columnar });
    expect(r.entries.map((e) => e.date.slice(5))).toEqual(['01-03', '02-04', '03-05', '04-06', '05-07', '05-08', '06-09', '07-10', '08-11', '09-12', '10-13', '11-14', '12-15', '01-16']);
  });

  it('splits 1931\'s run-together line at each page number a date follows, and drops OCR noise in the date', () => {
    // AAS 23 p. 531 in pypdf's default mode (fetch-acta.sh falls back to it where the
    // layout mode interleaves): four encyclicals on two physical lines.
    const r = parseActaIndex(volume(`I. - LITTERAE ENCYCLICAE
1931 Maii 15 Quadragesimo anno. - Advenerabiles fratres Patriarchas, Primates: De ordine sociali instaurando, in annum XL post editas Leonis XIII Litteras encyclicas « Kerum novarum ». . 177 » Iunii Jl 29 Non abbiamo bisogno. - Ai venerabili fratelli Patriarchi: Per la « Azio­ne Cattolica » . . • 285 » Oct. 2 Nova impendet. - Ad venerabiles fratres Patriarchas: De asperrimo rei oeconomicae discrimine ¿ . . 393
» Dec. 25 Lux veritatis. - Ad venerabiles fratres Patriarchas: De oecumenica Ephesina Synodo quindecim ante saeculis celebrata 493`), { year: 1931, volume: 23, ...columnar });
    expect(r.entries.map((e) => [e.date, e.page, e.incipit])).toEqual([
      ['1931-05-15', 177, 'Quadragesimo anno'],
      ['1931-06-29', 285, 'Non abbiamo bisogno'],
      ['1931-10-02', 393, 'Nova impendet'],
      ['1931-12-25', 493, 'Lux veritatis'],
    ]);
    expect(r.entries[0]!.description).toBe('Advenerabiles fratres Patriarchas, Primates: De ordine sociali instaurando, in annum XL post editas Leonis XIII Litteras encyclicas « Kerum novarum »');
    expect(parseRate(r.stats)).toBe(1);
  });

  it('reads 1958\'s constitutions: the toponym in capitals with its vernacular, then the incipit', () => {
    const r = parseActaIndex(volume(`                                  III - CONSTITUTIONES APOSTOLICAE

1957 Apr. 10 SANTAREMENSIS (Obidensis). Cum sit. - Distractis quibusdam muni-
                       cipiis a praelatura « nullius » Santaremensi, nova conditur
                       praelatura, « Obidensis » appellanda 24
 » Iunii » DE BRITANNIA. Quia Christus. - In regionibus Angliae et Valliae
                       Exarchatus Apostolicus conditur pro Ruthenis Ritus Byzantini
                       ibidem commorantibus 345
 » » 15 CORUMBENSIS - REGISTRENSIS (Campi Grandis - Auratopolitanae).
                       Inter gravissima. - Distractis quibusdam municipiis a Corum-
                       bensi dioecesi, duae for­
                       mantur dioeceses « Campi Grandis » et « Auratopolitana » . 57
 » Nov. 18 S. PAULI DE MINNESOTA (Novae Ulmae). Qui Cristi. - Ab archidioe­
                        cesi S. Pauli de Minnesota quaedam regiones detrahuntur . 351`, 'I - ACTA PII PP. XII'), { year: 1958, volume: 50, ...columnar });
    expect(r.entries.map((e) => [e.date, e.page, e.toponym, e.incipit])).toEqual([
      ['1957-04-10', 24, 'SANTAREMENSIS (Obidensis)', 'Cum sit'],
      ['1957-06-10', 345, 'DE BRITANNIA', 'Quia Christus'],
      ['1957-06-15', 57, 'CORUMBENSIS - REGISTRENSIS (Campi Grandis - Auratopolitanae)', 'Inter gravissima'],
      ['1957-11-18', 351, 'S. PAULI DE MINNESOTA (Novae Ulmae)', 'Qui Cristi'],
    ]);
    expect(r.entries[0]!.description).toBe('Distractis quibusdam municipiis a praelatura « nullius » Santaremensi, nova conditur praelatura, « Obidensis » appellanda');
    // A soft hyphen (U+00AD) at a line end joins the word; the page after a single space
    // ends the entry when the next line opens another.
    expect(r.entries[3]!.description).toBe('Ab archidioecesi S. Pauli de Minnesota quaedam regiones detrahuntur');
  });

  it('reads 1978\'s constitutions (toponym, dash, incipit), its three popes, and the OCR ditto and day variants', () => {
    const r = parseActaIndex(volume(`                               III - CONSTITUTIONES APOSTOLICAE

1977 Apr. 2 BOACENSIS. - Cum tempora. Detracta ab Ecclesia Lucenensi pro­
                            vincia v. Marinduque, nova in Insulis Philippinis conditur dioe­
                            cesis Boacensis 5
  » Mai. 80 BARUIPURENSIS. - Ad supernam. Dioecesis Baruipurensis in
                            Indiae finibus constituitur 233
  » Nov. 3 VIANENSIS CASTELLI. - Ad aptiorem. In Lusitaniae finibus dioe­
                            cesis Vianensis Castelli conditur 7
  » » » AVKAËNSIS. - Verba Christi. In Nigeria dioecesis Avkaënsis
                            constituitur 8
 » » 30 OLOMUCENSIS et Aliarum. - Praescriptionum sacrosancti. Ec­
                            clesiarum Olomucensis nova finium dispositio 273
1978 Ian. - 3 COXINENSIS. - Qui ad beatissimi. Praelatura Coxinensis in Bra­
                                 silia constituitur . .. . . . . . . . 148
  » . » 8 RAIGANENSIS. - Ut Pater. Nova in India conditur dioecesis
                                 Raiganensis 446
», » » S. MICHAELIS. - Tutius ut consuleretur. Dioecesis S. Michaelis
                                 in Argentina conditur 448
                                     II - ACTA IOANNIS PAULI PP. I
                                          I - LITTERAE APOSTOLICAE
1978 Sept. 1 Progredientibus iam. - Quae . 703
                                     III - ACTA IOANNIS PAULI PP. II
                                          I - HOMILIAE
.1978 Oct. 22 In foro Sancti Petri, initio ministerii 944`, 'I - ACTA PAULI PP. VI'), { year: 1978, volume: 70, ...columnar });
    expect(r.entries.map((e) => [e.pope, e.date, e.page, e.toponym, e.incipit])).toEqual([
      ['Paulus VI', '1977-04-02', 5, 'BOACENSIS', 'Cum tempora'],
      // An OCR-misread day (80) reads month-only and is reported; the dittos after it keep the month.
      ['Paulus VI', '1977-05', 233, 'BARUIPURENSIS', 'Ad supernam'],
      ['Paulus VI', '1977-11-03', 7, 'VIANENSIS CASTELLI', 'Ad aptiorem'],
      ['Paulus VI', '1977-11-03', 8, 'AVKAËNSIS', 'Verba Christi'],
      ['Paulus VI', '1977-11-30', 273, 'OLOMUCENSIS et Aliarum', 'Praescriptionum sacrosancti'],
      ['Paulus VI', '1978-01-03', 148, 'COXINENSIS', 'Qui ad beatissimi'],
      ['Paulus VI', '1978-01-08', 446, 'RAIGANENSIS', 'Ut Pater'],
      ['Paulus VI', '1978-01-08', 448, 'S. MICHAELIS', 'Tutius ut consuleretur'],
      ['Ioannes Paulus I', '1978-09-01', 703, null, 'Progredientibus iam'],
      ['Ioannes Paulus II', '1978-10-22', 944, null, null],
    ]);
    expect(r.entries[0]!.description).toBe('Detracta ab Ecclesia Lucenensi provincia v. Marinduque, nova in Insulis Philippinis conditur dioecesis Boacensis');
    expect(r.defects).toEqual([{ category: 'CONSTITUTIONES APOSTOLICAE', message: 'day 80 out of range, read as month-only: » Mai. 80 BARUIPURENSIS. - Ad supernam. Dioecesis Baruipurensis in' }]);
  });

  it('reads 1917: a printed month with a blank day is month-only, a blank-dated entry starts at the entry column', () => {
    const r = parseActaIndex(volume(`                                             IV. - LITTERAE APOSTOLICAE.
 1915         Ian.                  Cum antiquius. - Consociatio vulgo «Delle Dame Sa­
                                         cramentine » dicta, in archi­
                                        sodalitatem erigitur                                                                       51
              Aug.         11      Benigne annuentes. - Plenaria indulgentia conceditur
                                         pro festo Bb. Agathangeli et Cassiani .....                                                53
              Apr.         27      Rhedonensi in Urbe. - Curiale templum Rhedonense                                                63
                                   Conspicua Dei templa. - Titulus Basilicae minoris pro
                                        parochiali ecclesia Rhedonensi                                                             64
                                                       V. - EPISTOLAE.
1916         Maii                 Votre touchante supplique. - Adm
                                  t R. P. Emmanuele
                                       Bailly, magistrum generalem                                                                 70`, 'I. - ACTA BENEDICTI PP. XV'),
    { year: 1917, volume: 9, part: 'I', ...columnar });
    expect(r.entries.map((e) => [e.date, e.page, e.incipit])).toEqual([
      ['1915-01', 51, 'Cum antiquius'],
      ['1915-08-11', 53, 'Benigne annuentes'],
      ['1915-04-27', 63, 'Rhedonensi in Urbe'],
      ['1915-04-27', 64, 'Conspicua Dei templa'],
      ['1916-05', 70, 'Votre touchante supplique'],
    ]);
    expect(r.stats.monthOnly).toBe(2);
    expect(r.entries.every((e) => e.part === 'I')).toBe(true);
  });

  it('drops a running header the layout mode glued to a line, and a page number on a line of its own closes the entry', () => {
    const r = parseActaIndex(volume(`                                      IV - LITTERAE APOSTOLICAE
1957 Dec. 5 Perfugium rebus. - Beata Maria Virgo, nomine « Auxilium Christia­
                         norum » invocata, Patrona principalis et S. Leo PP. I Patro-                       Index documentor
\fum chronologico ordine digestus                                        1035
                        nus minus principalis eliguntur abbatiae « nullius » Beatae Ma­
                        riae Auxiliatricis de Belmont 621
                                          VI - HOMILIAE
1958         Ian.          1       Die ad pacem inter nationes fovendam undecimum celebrato,
                                                    89
» » 29 In Basilica Vaticana 155`, 'I - ACTA PII PP. XII'), { year: 1958, volume: 50, ...columnar });
    expect(r.entries.map((e) => [e.page, e.incipit])).toEqual([[621, 'Perfugium rebus'], [89, null], [155, null]]);
    expect(r.entries[0]!.description).toBe('Beata Maria Virgo, nomine « Auxilium Christianorum » invocata, Patrona principalis et S. Leo PP. I Patronus minus principalis eliguntur abbatiae « nullius » Beatae Mariae Auxiliatricis de Belmont');
  });

  it('reports a page number with a leading zero instead of citing it, and a repeated date at a page top is a continuation', () => {
    const r = parseActaIndex(volume(`                                      IV - LITTERAE APOSTOLICAE
 » » » Pietatis artisque. - Titulo ac privilegiis Basilicae Minoris ditatur
                         ecclesia vulgo « Do Senhor Bom Jesus » appellata . . 030
 » Dec. 16 URAWAËNSIS. Qui superna Dei. - Apostolica praefectura Urawaën-
1957 Dec. 16 sis, in Iaponia, ad gradum dioecesis perducitur, nomine ac fini­
                        bus immutatis 505`.replace('» » »', '1957 Iul. 26'), 'I - ACTA PII PP. XII'), { year: 1958, volume: 50, ...columnar });
    expect(r.entries.map((e) => [e.date, e.page, e.toponym, e.incipit])).toEqual([['1957-12-16', 505, 'URAWAËNSIS', 'Qui superna Dei']]);
    expect(r.entries[0]!.description).toBe('Apostolica praefectura Urawaënsis, in Iaponia, ad gradum dioecesis perducitur, nomine ac finibus immutatis');
    expect(r.defects.map((d) => d.message.slice(0, 48))).toEqual(['entry without a page number: 1957 Iul. 26 Pietat']);
  });

  it('flags a line the layout mode interleaved from two entries, and reads nothing from it', () => {
    const r = parseActaIndex(volume(`                                      I. - LITTERAE ENCYCLICAE
1931 Maii 15 Quadragesimo anno. - Advenerabiles fratres Patriarchas,                                     Primates, Archiepiscopos, Episcopos
  » Iunii 29 Non abbiamo bisogno. - Ai venerabili fratelli Patriarchi,                            Primatis XIII Litteras encyclicas « Rerum novarum ». . 177
  » Dec. 25 Lux veritatis. - Ad venerabiles fratres 493`), { year: 1931, volume: 23, ...columnar });
    expect(r.entries.map((e) => [e.page, e.incipit])).toEqual([[493, 'Lux veritatis']]);
    expect(r.defects.map((d) => d.message.slice(0, 16))).toEqual(['interleaved line', 'interleaved line']);
  });

  it('measures the parse rate over the pope parts and over the harvested categories', () => {
    const r = parseActaIndex(volume(`                                      IV - LITTERAE APOSTOLICAE
1958 Ian. 9 Velut amica. - Beata Maria Virgo 669
                                      IX - SACRA CONSISTORIA
1958 Iunii 9 I. Consistorium secretum 393
                  II. Optio Ecclesiarum 393`, 'I - ACTA PII PP. XII'), { year: 1958, volume: 50, ...columnar });
    // The consistory's second numbered item does not open a new entry, so the first runs
    // on to it: two of the three page lines end an entry, one of the one harvested does.
    expect(r.stats).toMatchObject({ entries: 2, pageLines: 3, harvestedEntries: 1, harvestedPageLines: 1 });
    expect(parseRate(r.stats)).toBeCloseTo(2 / 3);
    expect(harvestedParseRate(r.stats)).toBe(1);
    expect(parseRate({ ...r.stats, pageLines: 0 })).toBeNull();
  });

  it('parses every checked-in fixture with no unseen heading and no unmapped pope, and the sample above 95 % over the harvested categories', () => {
    const sources: [string, object][] = [
      ['aas-01-1909', { year: 1909, volume: 1, columnar: true, bareIncipits: false }],
      ['aas-09-1917-I', { year: 1917, volume: 9, part: 'I', columnar: true }],
      ['aas-23-1931', { year: 1931, volume: 23, columnar: true }],
      ['aas-50-1958', { year: 1958, volume: 50, columnar: true }],
      ['aas-70-1978', { year: 1978, volume: 70, columnar: true }],
      ['aas-indice-2012', { year: 2012 }],
    ];
    for (const [file, opts] of sources) {
      const r = parseActaIndex(readFileSync(`tools/fixtures/acta/${file}.txt`, 'utf8'), opts);
      expect(r.unseenHeadings, file).toEqual([]);
      expect(r.unmappedPopes, file).toEqual([]);
      // AAS 1 and AAS 9-I are the exceptions: the OCR lost the page column of most of their
      // index pages (sample report §1) -- two entries of 114 carry a page in 1909, and 1917-I
      // reaches 94.6 % over the harvested categories. Every other source clears the spec's
      // 95 % floor (§4); the two are explained in the report, not lowered into the threshold.
      if (file !== 'aas-01-1909' && file !== 'aas-09-1917-I') expect(harvestedParseRate(r.stats)!, file).toBeGreaterThanOrEqual(0.95);
    }
  });
});

describe('parseActaIndex on the volumes of 1932-1957 (acta volumes spec §9, phase 2b-ii-a)', () => {
  const xii = { year: 1950, volume: 42, columnar: true };

  it('reads the pope heading in the OCR\'s spellings and records each as printed', () => {
    // AAS 32 (1940) `1 - ACTA PII PP. XII`; AAS 33 (1941) `I - ACTA Pii PP. XII`; AAS 41 (1949) `I - ACTA PII PP. Xll`.
    for (const heading of ['1 - ACTA PII PP. XII', 'I - ACTA Pii PP. XII', 'I - ACTA PII PP. Xll']) {
      const r = parseActaIndex(volume(`                                   I - LITTERAE ENCYCLICAE
1949 Nov. 8 Sollemnibus documentis. - Ad Venerabiles Fratres 529`, heading), xii);
      expect(r.entries.map((e) => e.pope), heading).toEqual(['Pius XII']);
      expect(r.popeHeadings, heading).toEqual([heading]);
      expect(r.unmappedPopes, heading).toEqual([]);
    }
    // AAS 32 (1940) numbers the dicasteries' part `U - ACTA SS. CONGREGATIONUM`: it ends the pope's part.
    const r = parseActaIndex(volume(`                                   I - LITTERAE ENCYCLICAE
1949 Nov. 8 Sollemnibus documentis. - Ad Venerabiles Fratres 529
                       U - ACTA SS. CONGREGATIONUM
                     VI - SACRA CONGREGATIO DE PROPAGANDA FIDE
1940 Ian. 28 Romana seu Sancti Ludovici. - Decretum de miraculis 70`, '1 - ACTA PII PP. XII'), xii);
    expect(r.entries).toHaveLength(1);
    expect(r.skippedParts).toEqual(['U - ACTA SS. CONGREGATIONUM']);
  });

  it('reads a category heading whose numeral the OCR misdrew, a known one in mixed case, and drops every column header', () => {
    // `IY. -` (AAS 25, 1933), `1 -` (AAS 33, 1941), `XI •- SERMO` (AAS 31, 1939), `XIV - Sacra Consistoria` (AAS 46, 1954),
    // `X - HORTATIO` followed by the column header `PAG..` on the next line (AAS 31), `PAO.` / `PAS.` (AAS 30, 1938), and
    // `IV.?- MOTU PROPRIO` (AAS 16 (1924) 510, the one heading of the fixtures with a `?` after the numeral; before it was
    // read, the three motu proprio under it fell under the constitutions heading before it).
    const r = parseActaIndex(volume(`                                        IY. - LITTERAE APOSTOLICAE
                                                                              PAO.
1933 Febr. 20 A venerabili fratre. - Basilicae minoris titulo ornatur 61
                                         1 - LITTERAE DECRETALES
                                                                              PAS.
1940 Maii 2 Sanctitudinis culmen. - B. Gemmae Galgani, virgini 97
                                     X - HORTATIO
                                                                              PAG..
1939 Iunii 24 Sollemnis conventus. - Quem Beatissimus Pater 245
                                      XI •- SERMO
1939 Dec. 24 Nel quarto. - A Ssmo D. N. habitus 5
                                                  XIV - Sacra Consistoria
1950 Maii 20 Camerarius Sacri Collegii 289
                                                                       IV.?- MOTU PROPRIO
1924 apr. 27 Bibliorum scientiam. - De disciplinae biblicae magisteriis 180`), xii);
    expect(r.entries.map((e) => [e.category, e.page])).toEqual([
      ['LITTERAE APOSTOLICAE', 61], ['LITTERAE DECRETALES', 97], ['HORTATIO', 245], ['SERMO', 5], ['SACRA CONSISTORIA', 289],
      ['MOTU PROPRIO', 180],
    ]);
    expect(r.unseenHeadings).toEqual([]);
    expect(r.defects).toEqual([]);
  });

  it('reads the OCR\'s ditto marks and the junk stuck to a date token', () => {
    // `y> » 20` (AAS 32, 1940), `» h 3` and `» »> »` (AAS 24, 1932), `» D »` (AAS 27, 1935), `)) )) 31` (AAS 28, 1936),
    // `»• » »` (AAS 29), `" » » 28` (AAS 25), `» Nov. 8 -Caebuana` (AAS 34), `.1933 Martii 2` (AAS 25), `1950 Ian. • 14`
    // (AAS 42), `1947 Oct. ; 20` (AAS 39), `» » .16` (AAS 28), `» Dec. 20\` (AAS 34), `« Apr. 20` (AAS 24).
    const r = parseActaIndex(volume(`                                   III - CONSTITUTIONES APOSTOLICAE
.1933 Martii 2 Tra i sacrosanti. - Ad Emum P. D. Franciscum 73
  y> » 20 De Multan. - Praefectura Apostolica de Multan 31
  » h 3 Quae rei sacrae. - Fines immutantur inter vicariatum 295
  » »> » Cum diffusis. - Ex vicariatu apostolico 294
  » D » De Leopoldville. - Erectionis vicariatus apost. 71
  )) )) 31 Urbis. - S. Rochi paroecia supprimitur 227
  »• » » Cincinnatensis et Columbensis. - Ab Archidioecesi 153
  " » » 28 Auspicatus profecto. - Ad Emum P. D. Carolum 80
  » Nov. 8 -Caebuana (Tagbilarana). - Ab Archidioecesi Nominis 25
1950 Ian. • 14 CAMPIFONTIS (Wigorniensis). Ad animarum bonum. - A dioecesi 3
1947 Oct. ; 20 Inter asperrimas. - Ad Excmum P. D. Angelum Rotta 421
  » » .16 Compertum habemus. - Sanctuarium B. Mariae V. 100
  » Dec. 20\\ Bellohorizontinae (Oliveirensis). - Ab Archidioecesi 200
  « Apr. 20 Romanorum Pontificum. - Dismembrato territorio 300`), xii);
    expect(r.entries.map((e) => [e.date, e.page])).toEqual([
      ['1933-03-02', 73], ['1933-03-20', 31], ['1933-03-03', 295], ['1933-03-03', 294], ['1933-03-03', 71], ['1933-03-31', 227],
      ['1933-03-31', 153], ['1933-03-28', 80], ['1933-11-08', 25], ['1950-01-14', 3], ['1947-10-20', 421], ['1947-10-16', 100],
      ['1947-12-20', 200], ['1947-04-20', 300],
    ]);
    expect(r.entries.map((e) => e.incipit)).toContain('Quae rei sacrae');
    expect(r.entries[8]).toMatchObject({ toponym: null, description: expect.stringContaining('Ab Archidioecesi') });
    expect(r.defects).toEqual([]);
  });

  it('reads the OCR\'s month spellings where a day follows, and leaves an unlisted one -- and what inherits it -- unreadable', () => {
    // `» Ott. 3` (AAS 45, 1953), `1935 Doc. 26` (AAS 28), `1932 Man 2` (AAS 25; *Maii*, the constitution's own dating formula at
    // AAS 25 p. 28). `» Xyz. 4` is no month: the entry is reported, the next inherits the unreadable month and the year, and
    // a printed month restores the chain. `Deo dicatum 14` is a continuation line, never a December.
    const r = parseActaIndex(volume(`                                   IV - LITTERAE APOSTOLICAE
1932 Man 2 Apostolica Sedes. - De novae archidioecesis 25
  » Ott. 3 Quum octogesimum aetatis. - Ad Emum P. D. Fridericum 500
1935 Doc. 26 Ad catholici sacerdotii. - Venerabilibus fratribus 5
  » Xyz. 4 Ignota. - Ad quemdam 10
  » » 5 Item ignota. - Ad alium 11
  » Iulii 18 Romanorum Pontificum. - Titulo ac privilegiis Basilicae
                              Minoris honestatur templum in civitate Mediolanensi
                              Deo dicatum 14`), xii);
    expect(r.entries.map((e) => [e.date, e.page, e.incipit])).toEqual([
      ['1932-05-02', 25, 'Apostolica Sedes'], ['1932-10-03', 500, 'Quum octogesimum aetatis'], ['1935-12-26', 5, 'Ad catholici sacerdotii'],
      ['1935-07-18', 14, 'Romanorum Pontificum'],
    ]);
    expect(r.defects.map((d) => d.message.slice(0, 49))).toEqual([
      "unreadable date (unreadable month 'Xyz.'): » Xyz.",
      'unreadable date (inherits an unreadable month): »',
    ]);
  });

  it('repairs a year the OCR misdrew beyond the century, notes it, and dates a leading ditto year `????`', () => {
    // `1047 Maii 15` (AAS 39, 1947) and `1048 Maii 1` (AAS 40) -- here `1049` against a 1950 volume -- `3950 Dec. 10` (AAS 42), `i944 Maii 11` and `i 945 Apr. 15` (AAS 37),
    // `19.49 Nov. 7` (AAS 42); a `»` in the year column with nothing before it (AAS 42 (1950) 911, *Munificentissimus Deus*).
    const r = parseActaIndex(volume(`                                   I - BULLA DOGMATICA- ,
   » Nov,. 1 Munificentissimus Deus. - Fidei Dogma definitur 753
                                   II - LITTERAE DECRETALES
1049 Maii 15 Periucundum nobis. - Beato Nicolao de Flüe 1
3950 Dec. 10 Delegatis Viris ab Actione Catholica 118
i944 Maii 11 De Bangkok (de Chanthaburi). - E Vicariatu Apostolico 305
i 945 Apr. 15 Communium interpretes dolorum. - Ad Venerabiles Fratres 97
19.49 Nov. 7 Iam plures. - Ad Emum P. D. Normannum 139
1919 Febr. 11 Ad universos Archiepiscopos 58`), xii);
    // A `»` in the year column with nothing above it: the year is not printed, the entry is
    // dated `????-MM-DD` and noted, so that a curated correction can supply the year from the
    // act (AAS 42 (1950) 911, *Munificentissimus Deus*) and the creator mints nothing from it.
    expect(r.entries.map((e) => [e.date, e.dateNote?.slice(0, 22)])).toEqual([
      ['????-11-01', 'the year column prints'], ['1949-05-15', 'year 1049 read as 1949'], ['1950-12-10', 'year 3950 read as 1950'],
      ['1944-05-11', undefined], ['1945-04-15', undefined], ['1949-11-07', undefined], ['1919-02-11', undefined],
    ]);
    // A year inside the century is never repaired: AAS 41 prints `1919` for 1948 and 1949 alike (the creator holds it).
    expect(r.entries[6]).toMatchObject({ date: '1919-02-11' });
    expect(r.defects.map((d) => d.message.replace(/: .*$/, ''))).toEqual([
      'the year column prints a ditto with nothing above it, or a token the OCR has broken', 'year 1049 read as 1949 (an OCR digit)', 'year 3950 read as 1950 (an OCR digit)',
    ]);
    // A broken year token (`19 IS`, `19Ö4`, `3918` with no one-digit repair) is unprinted too, and the
    // dittos after it inherit the blank until a year is printed; a `PAG.` the default mode glued before
    // the date is dropped.
    const broken = parseActaIndex(volume(`                                   II - LITTERAE DECRETALES
19 IS Ian. 10 ICENSIS. - Cathedralia Capitula. - Canonicorum Capitulum 308
  » Maii 20 BOMBAYENSIS (Karachiensis). - Opportunis providentiae studiis. - Ab Archidioecesi 62
PAG. 19Ö4 Oet. 7 Ad Sinarum gentem. - Ad Venerabiles Fratres 5
3918 Iulii 11 Quinquagesimo. - Ad R. P. Matthaeum 21
1950 Aug. 6 Quintum ac vicesimum. - Ad Moderatores 26`), xii);
    expect(broken.entries.map((e) => [e.date, e.page, e.incipit])).toEqual([
      ['????-01-10', 308, 'Cathedralia Capitula'], ['????-05-20', 62, 'Opportunis providentiae studiis'], ['????-10-07', 5, 'Ad Sinarum gentem'],
      ['????-07-11', 21, 'Quinquagesimo'], ['1950-08-06', 26, 'Quintum ac vicesimum'],
    ]);
    // The dittos after a repaired year inherit the reading and its note.
    const d = parseActaIndex(volume(`                                   II - LITTERAE DECRETALES
1049 Maii 15 Periucundum nobis. - Beato Nicolao de Flüe 1
  » Iunii 22 Beato Iosepho Cafasso Sanctorum honores decernuntur 217
1950 Iulii 1 Alia. - Ad quemdam 300`), xii);
    expect(d.entries.map((e) => [e.date, e.dateNote?.slice(0, 22)])).toEqual([['1949-05-15', 'year 1049 read as 1949'], ['1949-06-22', 'year 1049 read as 1949'], ['1950-07-01', undefined]]);
  });

  it('skips a date token the OCR doubled, and reads a damaged day as month-only', () => {
    // `» Apr. Apr. 1` (AAS 26, 1934); `.1930 Iunii 2$>` (AAS 28 (1936), *Vigilanti cura*: 29 June 1936 on the shelf).
    const r = parseActaIndex(volume(`                                   I - LITTERAE DECRETALES
1934 Martii 19 Benignissimus Deus. - Beato Iosepho Benedicto Cottolengo 209
  » Apr. Apr. 1 Geminata laetitia. - Beato Ioanni Bosco 281
.1930 Iunii 2$> Vigilanti cura. - Venerabilibus Fratribus 249`), xii);
    expect(r.entries.map((e) => [e.date, e.incipit])).toEqual([
      ['1934-03-19', 'Benignissimus Deus'], ['1934-04-01', 'Geminata laetitia'], ['1930-06', 'Vigilanti cura'],
    ]);
    expect(r.defects.map((d) => d.message.slice(0, 44))).toEqual(["day '2$>' unreadable, read as month-only: .1"]);
  });

  it('gives a date the layout mode set beside a continuation line to the blank-dated entry after it', () => {
    // AAS 27 (1935) 509: `» Apr. 4` sits on the last line of the entry before, and *Paterna caritas* has no date column.
    const r = parseActaIndex(volume(`                                   IV - LITTERAE APOSTOLICAE
1934 Martii 5                   E religiosae pietatis. - Ecclesiae S. Agathae et S. Mariae
                                      Novae in Urbe ad honorem et praerogativas ecclesia­
   » Apr. 4                          rum stationalium evehuntur . 363
                                Paterna caritas. - Sancta Teresia a Puero Iesu. Virgo, Pa­
                                     trona principalis constituuntur dioecesis Floridensis 40
   » » »                        In loco. - Beata Maria Virgo sub titulo « dell'Arco » 41`), xii);
    expect(r.entries.map((e) => [e.date, e.page, e.incipit])).toEqual([
      ['1934-03-05', 363, 'E religiosae pietatis'], ['1934-04-04', 40, 'Paterna caritas'], ['1934-04-04', 41, 'In loco'],
    ]);
    expect(r.entries[0]!.description).toBe('Ecclesiae S. Agathae et S. Mariae Novae in Urbe ad honorem et praerogativas ecclesiarum stationalium evehuntur');
  });

  it('closes an entry whose page follows one space when a blank-dated entry comes next, and reads a hanging-indent entry', () => {
    // AAS 24 (1932) 420: *Sub anulo* and *Cum, aucto pastorum* print no date column; AAS 33 (1941) 533: the dated entries'
    // text sits right after the date while *Tui in S. C.* keeps the page's hanging indent, two columns short of the
    // continuations; AAS 47 (1955) 869: a continuation line at the entry column, opened with a capital, is not an entry
    // on a page whose entries open `Incipit. - Description`.
    const r = parseActaIndex(volume(`                                   IV - LITTERAE APOSTOLICAE
1932 Martii 31            Apostolicum munus. - Separato territorio e vicariatu 39
         Apr.            Expostularunt a Nobis. - Distracto territorio a vicariatu
                              apostolico de Kwango, novus erigitur vicariatus apo­
                              stolicus de Kisantu in Congo Belgico . 40
                         Sub anulo. - Vicariatus apostolici Cameronensis nomen
                             in appellationem de Yaounde immutatur 42
                         Cum, aucto pastorum. - Separato territorio e vicariatu
                              apostolico de Tsinan erigitur nova praefectura apo­
                              stolica de Lintsing cleroque indigenae committitur. . 42
\f                                   V - EPISTULAE
1941 Febr. 24 It is with heartfelt affection. - Ad Praesidem, Doctores
                                   et alumnos Studiorum Universitatis « Fordham » in
                                   civitate Neo-Eboracensi : primo saeculo ab eius ortu 325
  » Apr. 3 Nonagesimum aetatis annum. - Ad Emum P. D. Ianua­
                                   rium Episcopum Ostiensem et Albanensem S. R. E.
                                   Cardinalem Granito Pignatelli di Belmonte 494
                                 Tui in S. C. de Propaganda Fide. - Ad Emum P. D.
                                   Petrum tit. S. Crucis in Hierusalem S. R. E. Presb.
                                   Cardinalem Fumasoni Biondi, Praefectum 495
  » Maii 1 Sedecim ante saeculis. - Ad ecclesiasticam hierarchiam
                                   Sanctorum honores decernuntur 161
  » » 2 Explenti feliciter tibi. - Ad Emum P. D. Iosephum 162`), xii);
    expect(r.entries.map((e) => [e.date, e.page, e.incipit])).toEqual([
      ['1932-03-31', 39, 'Apostolicum munus'], ['1932-04', 40, 'Expostularunt a Nobis'], ['1932-04', 42, 'Sub anulo'], ['1932-04', 42, 'Cum, aucto pastorum'],
      ['1941-02-24', 325, 'It is with heartfelt affection'], ['1941-04-03', 494, 'Nonagesimum aetatis annum'],
      ['1941-04-03', 495, 'Tui in S. C. de Propaganda Fide'], ['1941-05-01', 161, 'Sedecim ante saeculis'], ['1941-05-02', 162, 'Explenti feliciter tibi'],
    ]);
    expect(r.defects).toEqual([]);
  });

  it('consumes the translations listed under an act as sub-items outside the parse rate, and reports a page fused with a glued header\'s', () => {
    // AAS 33 (1941) 530: the Christmas message's versions; AAS 31 (1939): `E textu latino versio anglica`;
    // AAS 46 (1954) 788: `appellandae. 33788   Index documentorum …`, the entry's 337 and the header's 788 sharing a digit.
    const r = parseActaIndex(volume(`                                   IX - NUNTII RADIOPHONICI
1940 Dec. 24 Grazie, Venerabili Fratelli. - A Ssmo D. N. in pervigilio 5
                                   Eius versiones a Statione radiophonica Civitatis Vati­
                                   canae editae :
                                   lingua gallica . . . . . . . . . . . . 205
                                   lingua anglica 216
1941 Ian. 6 Sertum laetitiae. - Ad Dilectos Filios 645
                                   E textu latino versio anglica 651
                                   IV - CONSTITUTIONES APOSTOLICAE
\f788                       Index documentorum chronologico ordine digestus
1950 Maii 7 DE MERU (Meruensis). Progreditur continenter. - Apostolica
                    Praefectura de Meru, in Africa Orientali Britannica, ad
                    dignitatem provehitur dioecesis, « Meruensis » appellandae. 33788                       Index documentorum chronologico ordine diges`), xii);
    expect(r.entries.map((e) => [e.page, e.incipit])).toEqual([[5, 'Grazie, Venerabili Fratelli'], [645, 'Sertum laetitiae']]);
    expect(r.stats).toMatchObject({ entries: 2, pageLines: 2, subItems: 5, translations: 4, harvestedPageLines: 2, harvestedEntries: 2, withoutPage: 1 });
    expect(r.defects.map((d) => d.message.slice(0, 40))).toEqual(['entry without a page number: 1950 Maii 7']);
  });

  it('reads a page glued to a leader dot or followed by OCR junk, and text opening with an OCR mark', () => {
    // `.154` (AAS 30, 1938), `47'` and `226 ,` (AAS 24, 1932), `549-` (AAS 32), `8. Fidei` (AAS 40, 1948), `$. Iacobi` (AAS 33).
    const r = parseActaIndex(volume(`                                   V - MOTU PROPRIO
1938 Martii 25 Sancta Dei Ecclesia. - De iurisdictione Sacrae Congre­
                              gationis pro Ecclesia Orientali .154
  » » 1 Ob nimiam. - E vicariatu apostolico de Changteh sepa­
                              rato territorio nova conditur praefectura apostolica 47'
  » Nov. 1 Ut, aucto Pastorum. - Distracto territorio e vicariatu 226 ,
  » » 2 Dans la tristesse. - Ad Emum P. D. Iosephum Erne­
                              stum Van Roey, Archiepiscopum Mechliniensem . . 549-
1947 Iulii 19 8. Fidei in Argentina. - Capitulum Metropolitanum eligitur . 64
  » Sept. 4 $. Iacobi Capitis Viridis et aliarum. - In Coloniis Lusitanis 14`), xii);
    expect(r.entries.map((e) => e.page)).toEqual([154, 47, 226, 549, 64, 14]);
    expect(r.entries[4]!.description).toContain('Capitulum Metropolitanum eligitur');
    expect(r.defects).toEqual([]);
  });

  it('dates a blank-dated entry by the formula its own description prints, and an act before the first heading feeds the ditto chain', () => {
    // AAS 31 (1939) 740: the radio messages of 1939 have no date column; AAS 25 (1933) 515: the bull of indiction stands
    // before the first category heading, reported, and `» Iunii 3` after it inherits 1933.
    const r = parseActaIndex(volume(`1933 Ian. 6 INDICTIO Anni Sancti extra ordinem ac generalis maximi-
                                 que Iubilaei undevicesimo exeunte saeculo 5
                                         I. - EPISTULA ENCYCLICA
  » Iunii 3 Dilectissima Nobis. - Ad Emos PP. DD. Franciscum 261
                                        IX - NUNTII RADIOPHONICI
                            Con inmenso gozo. - A Ssmo D. N. Pio Div. Prov.
                                 Papa XII ad universos Hispaniae christifideles da­
                                 tus, die 16 mensis Aprilis, anno 1939 151
                            Pour la douzième fois. - A Beatissimo Patre, die 7 men­
                                 sis Maii anno 1939, christifidelibus datus 221`), xii);
    expect(r.entries.map((e) => [e.date, e.page])).toEqual([['1933-06-03', 261], ['1939-04-16', 151], ['1939-05-07', 221]]);
    expect(r.defects.map((d) => d.message.slice(0, 45))).toEqual([
      'Pius XI: line before any category heading: 19', 'Pius XI: line before any category heading: qu',
    ]);
  });

  it('parses every fixture of 1932-1957 with no unseen heading and no unmapped pope, above 95 % over the harvested categories except the four named', () => {
    // 1936 (92 %): *Vigilanti cura*'s day is `2$>` and the Academy's member list under a motu proprio has four page lines;
    // 1939 (94 %): two radio messages with no date column or formula, an appendix line and an OCR page (`i.62`);
    // 1948 (94 %): six OCR pages (`43G`, `III`, a page lost on *Auspicia quaedam*, a line of dittos alone);
    // 1950 (92 %): the ceremony of the Assumption listed after the bull (five page lines), the volume's first entry with a `»` for its year, a month read `Die.`, and OCR pages (`c`, `1S8`, `5 M`);
    // 1949 and 1953 fell below the floor while a year the OCR reads `3918` or `1961` broke the ditto chain of the letters
    // after it; ACTA_INDEX_CORRECTIONS now supplies those years from the acts' own dating formulae, and both clear 95 %.
    // Each is listed in the report (docs/superpowers/reports/2026-09-13-acta-volumes-1932-1957.md §1); none is a shape
    // the parser could read without guessing.
    const exempt: Record<string, number> = { 1936: 0.92, 1939: 0.94, 1948: 0.94, 1950: 0.91 };
    for (let year = 1932; year <= 1957; year++) {
      const vol = year - 1908;
      const r = parseActaIndex(readFileSync(`tools/fixtures/acta/aas-${vol}-${year}.txt`, 'utf8'), { year, volume: vol, columnar: true });
      expect(r.unseenHeadings, String(year)).toEqual([]);
      expect(r.unmappedPopes, String(year)).toEqual([]);
      expect(r.popeHeadings.length, String(year)).toBe(year === 1939 ? 2 : 1);
      expect(harvestedParseRate(r.stats)!, String(year)).toBeGreaterThanOrEqual(exempt[year] ?? 0.95);
    }
  });
});

describe('parseActaIndex on the volumes of 1959-1977 (acta volumes spec §9, phase 2b-ii-b)', () => {
  const vi = { year: 1966, volume: 58, columnar: true };
  /** A page in pypdf's default mode: every line at the margin, the index's title after the entries (AAS 52 (1960) 1032). */
  const flat = (body: string, pope = 'I - ACTA PAULI PP. VI') => `II \n${pope} \n${body}\nINDEX DOCUMENTORUM \nCHRONOLOGICO ORDINE DIGESTUS \n`;

  it('reads the pope headings the OCR prints with a full stop after ACTA and with digits in the name', () => {
    // AAS 67 (1975) `I - ACTA. PAULI PP. VI`; AAS 51 (1959) `II - ACTA I0A1OTS PP. XXIII` after Pius XII's part.
    const r = parseActaIndex(volume(`                                    I - ADHORTATIONES APOSTOLICAE
1975 Maii 9 Gaudete in Domino. - Ad Episcopos, Sacerdotes et Christifideles 289`, 'I - ACTA. PAULI PP. VI'), { year: 1975, volume: 67, ...columnar });
    expect(r.entries.map((e) => [e.pope, e.page])).toEqual([['Paulus VI', 289]]);
    expect(r.popeHeadings).toEqual(['I - ACTA. PAULI PP. VI']);
    const j = parseActaIndex(volume(`                                    LITTERAE APOSTOLICAE
1958 Febr. 18 Quantum iuniores. - Beata Maria Virgo 405
                                  II - ACTA I0A1OTS PP. XXIII
                                    I - LITTERAE DECRETALES
1959 Apr. 12 Militantis Ecclesiae. - Beato Carolo a Setia 617`, 'I - ACTA PII PP. XII'), { year: 1959, volume: 51, ...columnar });
    expect(j.entries.map((e) => [e.pope, e.page])).toEqual([['Pius XII', 405], ['Ioannes XXIII', 617]]);
    expect(j.popeHeadings).toEqual(['I - ACTA PII PP. XII', 'II - ACTA I0A1OTS PP. XXIII']);
    expect(j.unmappedPopes).toEqual([]);
    // AAS 69 (1977) numbers the synod's part without the word: `II - SYNODUS EPISCOPORUM` ends the pope's part.
    const k = parseActaIndex(volume(`                                    XII - NUNTII TELEGRAPHICI
1977 Mart. 23 Ad Georgium Singha, Episcoporum Congi Decanum 204
                                  II - SYNODUS EPISCOPORUM
1977 Sept. 30 Ineunte V Synodo Episcoporum, Summi Pontificis allocutio 625`, 'I - ACTA PAULI PP. VI'), { year: 1977, volume: 69, ...columnar });
    expect(k.entries).toHaveLength(1);
    expect(k.skippedParts).toEqual(['II - SYNODUS EPISCOPORUM']);
  });

  it('reads a flat (default-mode) page: the title after the entries is skipped, a capitalised continuation is not an entry', () => {
    // AAS 52 (1960) 1032-1036: the default mode sets every line at the margin and renders the index's title last.
    const r = parseActaIndex(flat(`I - LITTERAE APOSTOLICAE 
PAG. 
1959 Nov. 25 Luctifera bella. - Beata Maria Virgo « Regina Pacis » Consocia­
tionis Nationalis Victimarum Civilium belli in Italia (vulgo 
« Associazione Nazionale delle Vittime Civili della guerra ») 
Patrona caelestis constituitur 382 
» » 30 Caelesti coruscans. - Beata Maria V. Immaculata in praecipuam 
Patronam et S. Ioannes Maria Vianney, Conf., in Patronum 
minus principalem dioecesis Lafayettensis eliguntur ... 144 `, 'II - ACTA IOANNIS PP. XXIII'), { year: 1960, volume: 52, ...columnar });
    expect(r.entries.map((e) => [e.incipit, e.page])).toEqual([['Luctifera bella', 382], ['Caelesti coruscans', 144]]);
    expect(r.entries[0]!.description).toBe('Beata Maria Virgo « Regina Pacis » Consociationis Nationalis Victimarum Civilium belli in Italia (vulgo « Associazione Nazionale delle Vittime Civili della guerra ») Patrona caelestis constituitur');
    expect(r.unseenHeadings).toEqual([]);
    expect(r.defects).toEqual([]);
  });

  it('reads the unnumbered headings of 1967, in capitals or in mixed case, only where the words are a known category', () => {
    // AAS 59 (1967) 1140-1152: `Litterae Encyclicae`, `Litterae Apostolicae` between the entries, with no numeral.
    const r = parseActaIndex(volume(`                                                       Litterae Encyclicae
1967 Mart. 26 Populorum progressio. - Ad Episcopos, ad Sacerdotes 257
                                                  CONSTITUTIONES APOSTOLICAE
  » Aug. 15 Regimini Ecclesiae universae. - De Romana Curia 885
                                                        Litterae Apostolicae
                                                        Patrona declaratur
1965 Sept. 18 Templis praeclaris. - Titulus ac privilegia Basilicae Minoris paroe­
                                  ciali templo Sanctorum Apostolorum tribuuntur 5
1965 Dec. 18 Maria Virgo. - Beata Maria Virgo « Mater Ecclesiae » principalis
                               Patrona totius dioecesis Montisclarensis eligitur 215`, 'I - ACTA PAULI PP. VI'), { year: 1967, volume: 59, ...columnar });
    expect(r.entries.map((e) => [e.category, e.page])).toEqual([
      ['LITTERAE ENCYCLICAE', 257], ['CONSTITUTIONES APOSTOLICAE', 885], ['LITTERAE APOSTOLICAE', 5], ['LITTERAE APOSTOLICAE', 215],
    ]);
    // `Patrona declaratur` is no category: reported as a line outside any entry, not read as a heading.
    expect(r.defects.map((d) => d.message)).toEqual(['line outside any entry: Patrona declaratur']);
  });

  it('reads a heading with the column header glued, an OCR mark after it, the guillemets apart, and the numeral as `XI- -`', () => {
    // AAS 51 (1959) 946 `XIV - NUNTII SCRIPTO DATI PAG.`; AAS 52 (1960) 1033 `LITTERAE APOSTOLICAE` / `MOTU PROPRIO DATAE^`;
    // AAS 68 (1976) 756 `IV - LITTERAE APOSTOLICAE « MOTU PROPRIO» DATAE`; AAS 66 (1974) 762 `XI- - ALLOCUTIONES`.
    const r = parseActaIndex(volume(`                                         XIV - NUNTII SCRIPTO DATI PAG.
1959 Ian. 1 Ad universos catholicos 5
                                              LITTERAE APOSTOLICAE
                                              MOTU PROPRIO DATAE^
1959 Dec. 8 Maiora in dies. - Academia Mariana 24
                                  IV - LITTERAE APOSTOLICAE « MOTU PROPRIO» DATAE
1976 Ian. 7 Apostolatus peragendi. - Consilium de Laicis 696
                                                           XI- - ALLOCUTIONES
1973 Dec. 13 Ad Excellentissimum Virum Gustavum Adolfum Guerrero 8`), { year: 1976, volume: 68, ...columnar });
    expect(r.entries.map((e) => [e.category, e.page])).toEqual([
      ['NUNTII SCRIPTO DATI', 5], ['LITTERAE APOSTOLICAE MOTU PROPRIO DATAE', 24], ['LITTERAE APOSTOLICAE «MOTU PROPRIO» DATAE', 696], ['ALLOCUTIONES', 8],
    ]);
    expect(r.unseenHeadings).toEqual([]);
  });

  it('reads the era\'s OCR ditto marks and months, and dates a year with its last digit broken `????`', () => {
    // `% » » PORTUS MORESBY` (AAS 52, 1960), `-> » »` (AAS 53, 1961), `Ä » 20` (AAS 58, 1966); `Maü` (AAS 54, 1962),
    // `Dee.` and `Mail` (AAS 66, 1974); `196S Nov. 4 Summi Dei` (AAS 55, 1963).
    const r = parseActaIndex(volume(`                                    VII - CONSTITUTIONES APOSTOLICAE
1959 Iun. 3 KADUNAËNSIS. Quandoquidem. - Nova dioecesis 72
  % » » PORTUS MORESBY (Insulae Yule et Daruensis). Qui per electionem. - Quibusdam territoriis 74
  -> » 5 Quemadmodum. - Sanctus Patricius, Ep. et Conf., caelestis Patronus 150
  Ä » 20 Adulescentium patris. - Titulus ac privilegia Basilicae Minoris 282
1961 Maü 5 URBIS. Inter frequentissima. - Templum S. Teresiae Virginis 703
1973 Dee. 13 Quod pastorale. - In Republica Ciadensi constituitur Delegatio Apostolica 190
  » Mail 11 Mira eademque. - Beata Maria Virgo 378
196S Nov. 4 Summi Dei. - Ad Patriarchas, Primates 979`), { year: 1974, volume: 66, ...columnar });
    expect(r.entries.map((e) => [e.date, e.page])).toEqual([
      ['1959-06-03', 72], ['1959-06-03', 74], ['1959-06-05', 150], ['1959-06-20', 282], ['1961-05-05', 703],
      ['1973-12-13', 190], ['1973-05-11', 378], ['????-11-04', 979],
    ]);
    expect(r.entries[1]!.toponym).toBe('PORTUS MORESBY (Insulae Yule et Daruensis)');
    expect(r.entries[7]!.dateNote).toMatch(/the year is not printed/);
  });

  it('reads a page number alone on its line after a line the OCR cut short, but not after a line that already ends in a page', () => {
    // AAS 58 (1966) 1207: `Illustri laude. - Titulo ac privilegiis Basilicae Minoris ecclesia` / `PAG.` / `569`, the entry's
    // other lines lost; AAS 48 (1956) 861: `… nuncupandus 647` / `9`, the `9` being the OCR's for the next entry's ditto.
    const r = parseActaIndex(flat(`I - LITTERAE APOSTOLICAE 
1965 Dec. 11 Illustri laude. - Titulo ac privilegiis Basilicae Minoris ecclesia 
PAG. 
569 
» » » Camposinae urbis. - Titulo ac privilegiis Basilicae Minoris ecclesia 
cathedralis Camposina decoratur 571 
» » 23 Apostolica Sedes. - Ab Apostolicis Vicariatibus Kongoloënsi quaedam separantur territoria, quibus 
novus Vicariatus constituitur, « Kinduensis » nuncupandus 647 
9 
» » 25 Semper fuit. - A Dioecesibus Tamalensi et Ketaënsi quaedam territoria detrahuntur 649 `), vi);
    expect(r.entries.map((e) => [e.incipit, e.page])).toEqual([
      ['Illustri laude', 569], ['Camposinae urbis', 571], ['Apostolica Sedes', 647], ['Semper fuit', 649],
    ]);
    expect(r.defects.map((d) => d.message)).toEqual(['a bare number after a page-ended line, not read as a page: 9']);
    // Both bare numbers are page lines of the denominator; the second is consumed.
    expect(r.stats).toMatchObject({ pageLines: 5, entries: 4, consumed: 1 });
  });

  it('reads a page number with a quote before it', () => {
    // AAS 58 (1966) 1206: `… ad gradum dioecesis evehitur '563`.
    const r = parseActaIndex(volume(`                                    VII - CONSTITUTIONES APOSTOLICAE
1965 Nov. 6 MVEKAËNSIS. Sanctorum mater. - Praefectura apostolica Mvekaën­
                            sis, in Congo, ad gradum dioecesis evehitur '563`), vi);
    expect(r.entries.map((e) => [e.incipit, e.page])).toEqual([['Sanctorum mater', 563]]);
  });

  it('parses every fixture of 1959-1977 with no unseen heading and no unmapped pope, above 95 % over the harvested categories', () => {
    // The overall rate falls below 95 % in eight volumes for the parts the join does not act on -- Paul VI's journeys,
    // listed under their own headings with a page per homily and address and dated `Dies N.` (1965: India; 1967: Fatima,
    // Turkey; 1968: Bogotá; 1971: Asia and Oceania, 83 entries), the consistories' numbered items, and the head of his
    // allocutions in 1963 and 1964 printing a ditto for the year with nothing above it -- and every volume clears the
    // floor over the harvested categories (1974, the lowest, at 97.6 %: `Dee.` and `Mail` before they were listed;
    // an OCR page `46S`). AAS 51 carries Pius XII's last acts and John XXIII's, AAS 55 John XXIII's and Paul VI's.
    for (let year = 1959; year <= 1977; year++) {
      const vol = year - 1908;
      const r = parseActaIndex(readFileSync(`tools/fixtures/acta/aas-${vol}-${year}.txt`, 'utf8'), { year, volume: vol, columnar: true });
      expect(r.unseenHeadings, String(year)).toEqual([]);
      expect(r.unmappedPopes, String(year)).toEqual([]);
      expect(r.popeHeadings.length, String(year)).toBe([1959, 1960, 1963, 1964].includes(year) ? 2 : 1);
      expect(harvestedParseRate(r.stats)!, String(year)).toBeGreaterThanOrEqual(0.95);
    }
  });
});

describe('parseActaIndex on the volumes of 1979-2002 and the index PDFs of 2010-2014 (acta volumes spec §9, phase 2b-ii-c)', () => {
  const jp2 = 'I - ACTA IOANNIS PAULI PP. II';
  /** An excerpt of a 2010-2011 index PDF, whose chronological index the parser finds by its title. */
  const index2010 = (body: string, pope = 'I – ACTA BENEDICTI XVI') => `An. et vol. CII 31 Decembris 2010 (Index generalis)
ACTA APOSTOLICAE SEDIS
I
INDEX GENERALIS ACTORUM
(An.etvol.CII )
${pope}
Homiliae: 17, 21.
\fIndex generalis actorum 959II
INDEX DOCUMENTORUM
CHRONOLOGICO ORDINE DIGESTUS
${pope}
${body}
`;

  it('reads the pope part numbered with a full stop and no dash, the em dash, the OCR `Il`, and Paul VI\'s act under EX ACTIBUS', () => {
    // AAS 86 (1994) 1028 `I. ACTA IOANNIS PAULI PP. II`; AAS 87 (1995) `I — ACTA …`; AAS 80 (1988) `PP. Il`;
    // AAS 71 (1979) 1641 `EX ACTIBUS PAULI PP. VI` / `LITTERAE APOSTOLICAE` at the end of John Paul II's part.
    for (const heading of ['I. ACTA IOANNIS PAULI PP. II', 'I — ACTA IOANNIS PAULI PP. II', 'I - ACTA IOANNIS PAULI PP. Il']) {
      const r = parseActaIndex(volume(`                               I - EPISTULA APOSTOLICA
1994 Maii 22 Ordinatio sacerdotalis - De Sacerdotali ordinatione viris tantum
                        reservanda 545`, heading), { year: 1994, volume: 86, ...columnar });
      expect(r.entries.map((e) => [e.pope, e.page]), heading).toEqual([['Ioannes Paulus II', 545]]);
      expect(r.unmappedPopes, heading).toEqual([]);
    }
    const r = parseActaIndex(volume(`                                    XIII - NUNTII TELEGRAPHICI
1979 Mart. 23 Ad Georgium Singha 204
                                     EX ACTIBUS PAULI PP. VI
                                               LITTERAE APOSTOLICAE
1978 Mai. 7 Quae per caritatem. - Venerabili Servae Dei Mariae Henricae
                                      Dominici, Beatorum honores decernuntur 1617`, jp2), { year: 1979, volume: 71, ...columnar });
    expect(r.entries.map((e) => [e.pope, e.category, e.incipit, e.page])).toEqual([
      ['Ioannes Paulus II', 'NUNTII TELEGRAPHICI', null, 204], ['Paulus VI', 'LITTERAE APOSTOLICAE', 'Quae per caritatem', 1617],
    ]);
    expect(r.popeHeadings).toEqual([jp2, 'EX ACTIBUS PAULI PP. VI']);
  });

  it('skips the 2013 index\'s SEDIS VACANTIS ACTA and CONCLAVE as parts, and reads both popes\' parts', () => {
    const r = parseActaIndex(`ACTA  APOSTOLICAE  SEDIS
INDEX GENERALIS ACTORUM
(An. 2013 et Vol. CV)
I – ACTA BENEDICTI XVI
\fII
INDEX DOCUMENTORUM
CHRONOLOGICO ORDINE DIGESTUS
I – ACTA BENEDICTI XVI
I – DECLARATIO
2013 Febr. 10 De muneris Episcopi Romae, Successoris Sancti Petri, abdi-
catione   .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  .  239
II – SEDIS VACANTIS ACTA
Instrumenta confecta:
2013 Febr. 28 I. Apposizione dei sigilli alla porta principale   .  .  .  .  336
III – CONCLAVE
2013 Mart. 11 Obsignatio locorum   .   .   .   .   .   .   .   .   .   .   .   .   .   .   .   .   . 358
IV – ACTA FRANCISCI PP.
I – PONTIFICATUS EXORDIA
2013 Mart. 14 Prima Hom. S.P. concelebrantis cum Cardinalibus .  .  .  .  . 365
III – LITTERAE ENCYCLICAE
2013 Iun. 28 Lumen Fidei  .   .   .   .   .   .   .   .   .   .   .   .   .   .   .   .   .   .   .   . 555
`, { year: 2013 });
    expect(r.entries.map((e) => [e.pope, e.category, e.page])).toEqual([
      ['Benedictus XVI', 'DECLARATIO', 239], ['Franciscus', 'PONTIFICATUS EXORDIA', 365], ['Franciscus', 'LITTERAE ENCYCLICAE', 555],
    ]);
    expect(r.skippedParts).toEqual(['II – SEDIS VACANTIS ACTA', 'III – CONCLAVE']);
    expect(r.unseenHeadings).toEqual([]);
  });

  it('reads the journeys\' headings by shape, with the OCR\'s Ex and PEBAGBAT, and a heading numbered with a full stop', () => {
    // AAS 74 (1982) 1330, AAS 80 (1988) 1836, AAS 84 (1992) 1220 (`ex`), AAS 89 (1997) 895; AAS 91 (1999) 1204 `I. LITTERAE ENCYCLICAE`.
    const r = parseActaIndex(volume(`                                    I. LITTERAE ENCYCLICAE
1998 Sept. 14 Fides et ratio. - Ad Episcopos 5
                                   XVI - ITINERA APOSTOLICA
                              EX HABITIS DUM SUMMUS PONTIFEX AFRICAM PERAGRAT
                                        DELECTAE ALLOCUTIONES
1982 Febr. 12 Lagi, ad Nationum legatos 550
                              Ex HABITIS DUM SUMMUS PONTIFEX URUQUARIAM, CHILIAM ET ARGENTINAM
                                        PEBAGBAT DETECTAE ALLOCUTIONES
1987 Apr. 1 Montevidei, ad nationis moderatores 1090
                              ex HABITIS DUM SUMMUS PONTIFEX POLONIAM
                                    PERAGRAT DELECTAE ALLOCUTIONES
1991 Iun. 2 Intra fines dioecesis Premisliensis habita 356
                                   XII - ITINERA APOSTOLICA
             SUMMUS PONTIFEX HAS NATIONES INVISIT:
1997 Apr. 12-13 Bosniam 311`, jp2), { year: 1999, volume: 91, ...columnar });
    expect(r.entries.map((e) => [e.category, e.page])).toEqual([
      ['LITTERAE ENCYCLICAE', 5],
      // The first journey's sub-heading follows the known `ITINERA APOSTOLICA` and is consumed as its subtitle; the next journeys' headings stand alone.
      ['ITINERA APOSTOLICA', 550],
      ['EX HABITIS DUM SUMMUS PONTIFEX URUQUARIAM, CHILIAM ET ARGENTINAM PEBAGBAT DETECTAE ALLOCUTIONES', 1090],
      ['EX HABITIS DUM SUMMUS PONTIFEX POLONIAM PERAGRAT DELECTAE ALLOCUTIONES', 356],
    ]);
    expect(r.unseenHeadings).toEqual([]);
    expect(r.entries.map((e) => categoryForHeading(e.category)?.id)).toEqual(['Litterae Encyclicae', 'Itinera Apostolica', 'Itinera Apostolica', 'Itinera Apostolica']);
    // `1997 Apr. 12-13 Bosniam` is dated to a span: not an entry, reported.
    expect(r.defects.some((d) => d.message.includes('Bosniam'))).toBe(true);
  });

  it('reads a page above 1,500 (AAS 80 has 1,868 pages), the OCR months Iuli, Oec and Mal, and the dittos yf, jff and y?', () => {
    const r = parseActaIndex(volume(`                                    I - EPISTULAE APOSTOLICAE
1988 Ian. 25 Euntes in mundum universum. - Ob expletum millennium 935
yf Mai. 22 Litterae Encyclicae. - Ad personas consecratas 1639
jff Aug. 15 Mulieris dignitatem. - De dignitate et vocatione mulieris 1653
                         II - LITTERAE APOSTOLICAE MOTU PROPRIO DATAE
  » Iuli. 2 Ecclesia Dei. - Commissio quaedam instituitur 1495
                                    III - LITTERAE APOSTOLICAE
  » Oec. 11 Qui loco Petri. - In Manilensi archidioecesi templum 367
  » Mal. 22 « Il tempo è compiuto ». - Em.mo P. D. Praesidi Consilii 1292
            » y? 30 REGIO CAMPANA. Quamquam Ecclesia. - Campanae regionis 562`, jp2), { year: 1988, volume: 80, ...columnar });
    expect(r.entries.map((e) => [e.date, e.page])).toEqual([
      ['1988-01-25', 935], ['1988-05-22', 1639], ['1988-08-15', 1653], ['1988-07-02', 1495], ['1988-12-11', 367], ['1988-05-22', 1292], ['1988-05-30', 562],
    ]);
    expect(r.entries[6]!.toponym).toBe('REGIO CAMPANA');
    // A four-digit number of the century is still a year, never a page: the line stays open.
    const y = parseActaIndex(volume(`                                    III - LITTERAE APOSTOLICAE
1988 Ian. 25 Euntes in. - Ob expletum millennium a Baptismo anno 1988
                            Regionis Rus' Kiovensis 935`, jp2), { year: 1988, volume: 80, ...columnar });
    expect(y.entries.map((e) => e.page)).toEqual([935]);
  });

  it('leaves a year one digit from two years of the volume\'s span unprinted, and drops the numeral numbering the acts of one heading', () => {
    // AAS 76 (1984) 1108-1109: `1988 » » II. Beato Leopoldo Mandic"` under `1982 Oct. 10 I. Beato Maximiliano Mariae Kolbe`.
    const r = parseActaIndex(volume(`                                    IV - LITTERAE DECRETALES
1982 Oct. 10 I. Beato Maximiliano Mariae Kolbe, Sacerdoti professi Ordi­
                          nis Fratrum Minorum Conventualium, Sanctorum honores
                          decernuntur 5
1988 » » II. Beato Leopoldo Mandic" a Castro Novo, Sanctorum caelitum
                          honores decernuntur 937
                                    II - EPISTULAE APOSTOLICAE
1984 Febr. 11 I. « Salvifici Doloris ». - Ad totius Catholicae Ecclesiae Episcopos 201`, jp2), { year: 1984, volume: 76, ...columnar });
    expect(r.entries.map((e) => [e.date, e.incipit, e.description.slice(0, 22)])).toEqual([
      ['1982-10-10', null, 'Beato Maximiliano Mari'], ['????-10-10', null, 'Beato Leopoldo Mandic"'], ['1984-02-11', 'Salvifici Doloris', 'Ad totius Catholicae E'],
    ]);
    expect(r.entries[1]!.dateNote).toMatch(/the year is not printed/);
  });

  it('reads a margin-noisy page (AAS 89 (1997) 890) without the scan\'s marks, and leaves a mark after a page elsewhere reported', () => {
    const noisy = `                                    VI - CONSTITUTIONES APOSTOLICAE
1996 Iun. 14 De universis. - A dioecesi Livingstonensi in Zambia qui- *
                       busdam distractis territoriis, nova conditur Monguen-
                       sis dioecesis 673 \\
  » » 28 Cum ad aeternam. - In Africa Media nova conditur dioe­
                       cesis Kagiensis-Bandorensis 748 :
                                                                                                     è
                                                                                                     S'
                      VII - LITTERAE APOSTOLICAE [
                                                                                                     i i
1995 Maii 12 «Docete omnes». - Venerabili Dei Servo Ianuario Mariae ;
                       Sarnelli Beatorum honores decernuntur .... 157 j
  » Oct. 1 « Beati pauperes ». - Venerabili Servo Dei Petro Casani I
                       Beatorum honores decernuntur 19 ^
  » » » Ecclesia primo. - Venerabilibus Servis Dei Angelae a San- §
                       cto Ioseph Lloret Marti et XVI Sociis martyribus f
                       Beatorum honores decernuntur 21 j
1996 Mart. 17 « Euntes in ». — Venerabili Servo Dei Danieli Comboni I
                       Beatorum honores decernuntur 10 I`;
    const r = parseActaIndex(volume(noisy, jp2), { year: 1997, volume: 89, ...columnar });
    expect(r.entries.map((e) => [e.category, e.incipit, e.page])).toEqual([
      ['CONSTITUTIONES APOSTOLICAE', 'De universis', 673], ['CONSTITUTIONES APOSTOLICAE', 'Cum ad aeternam', 748],
      ['LITTERAE APOSTOLICAE', 'Docete omnes', 157], ['LITTERAE APOSTOLICAE', 'Beati pauperes', 19], ['LITTERAE APOSTOLICAE', 'Ecclesia primo', 21], ['LITTERAE APOSTOLICAE', 'Euntes in', 10],
    ]);
    expect(r.entries[4]!.description).toBe('Venerabilibus Servis Dei Angelae a Sancto Ioseph Lloret Marti et XVI Sociis martyribus Beatorum honores decernuntur');
    expect(r.entries[5]!.description).toBe('Venerabili Servo Dei Danieli Comboni Beatorum honores decernuntur');
    expect(r.unseenHeadings).toEqual([]);
    // Alone on a quiet page, `5 M` (AAS 42 (1950) 212) is still the OCR's page: the entry is reported without one.
    const quiet = parseActaIndex(volume(`                                    III - LITTERAE APOSTOLICAE
1949 Dec. 8 Quae Deo. - Ecclesia Sancti Iosephi, privilegiis Basilicae
                                  Minoris honestatur 5 M
1950 Ian. 6 Alia quaedam. - Ecclesia 27`, jp2), { year: 1950, volume: 42, ...columnar });
    expect(quiet.entries.map((e) => e.page)).toEqual([27]);
    expect(quiet.stats.withoutPage).toBe(1);
  });

  it('consumes the annexes and undated statutes listed under an act as sub-items, and closes the act on its own page', () => {
    // AAS 86 (1994) 1029; AAS 28 (1936) 40 (*In multis solaciis* at 421, its statutes at 427 and 437); the 2011 index.
    const r = parseActaIndex(volume(`                         IV - LITTERAE APOSTOLICAE MOTU PROPRIO DATAE
1994 Ian. 1 Socialium Scientiarum. - Pontificia Academia Scientiarum So­
                        cialium constituitur . . . . . 209
  » » » Adnexum: Pontificiae Academiae Scientiarum Socialium ordi­
                        natio 213
  » Sept. 30 La sollecitudine. - Ultima ordinatio Officii Laboris Apostolicae
                        Sedis foras datur . 841
  » » » Adnexum I: Albo degli Avvocati presso il Collegio di conciliazio­
                        ne e arbitrato dell'Ufficio del Lavoro della Sede Apostolica
                         (ULSA) 851
1936 Oct. 28 In multis solaeiis. - De Pontificia Academia Scientiarum. 421
                       Statuta Pontificiae Academiae Scientiarum 427
                       Statuto delia Pont. Accademia delle Scienze . . . . . . 437`, jp2), { year: 1994, volume: 86, ...columnar });
    expect(r.entries.map((e) => [e.incipit, e.page])).toEqual([['Socialium Scientiarum', 209], ['La sollecitudine', 841], ['In multis solaeiis', 421]]);
    expect(r.stats).toMatchObject({ entries: 3, pageLines: 3, harvestedPageLines: 3, translations: 4, withoutPage: 0 });
    expect(r.defects).toEqual([]);
  });

  it('never takes the OCR\'s doubled year at the head of a line for a page, and reads a 9 in the year column before two dittos as the ditto', () => {
    // AAS 78 (1986) 1333 ` 1986 1986   Mart.  10  IAMMUENSIS`; AAS 48 (1956) 862 ` 9 » » TAMALENSIS - KETAËNSIS (Navrongensis). Semper fuit.`
    const r = parseActaIndex(volume(`                                    VI - CONSTITUTIONES APOSTOLICAE
1986 Febr. 15 RONDONOPOLITANA. Laetantes omnino. - Praelatura Rondonopoli­
                            tana ad gradum dioecesis attollitur 703
 1986 1986   Mart.          10     IAMMUENSIS-SRINAGARENSIS. Qui Sanctissimi Numinis. - Ap. Prae­
                                            fecturae Iammuensi et Kashmirensi iam iuridicialis forma
                                            dioecesis imponitur 903
  » Apr. 23 KONGOLOENSIS (Kinduensis). Apostolica Sedes. - Ab Apostolicis
                            Vicariatibus quaedam separantur territoria 647
 9 » » TAMALENSIS - KETAËNSIS (Navrongensis). Semper fuit. - A Dioe­
                           cesibus Tamalensi et Ketaënsi quaedam territoria detrahuntur 649`, jp2), { year: 1986, volume: 78, ...columnar });
    expect(r.entries.map((e) => [e.date, e.incipit, e.page])).toEqual([
      ['1986-02-15', 'Laetantes omnino', 703], ['1986-03-10', 'Qui Sanctissimi Numinis', 903], ['1986-04-23', 'Apostolica Sedes', 647], ['1986-04-23', 'Semper fuit', 649],
    ]);
  });

  it('reads the 2010-2011 index PDFs: spaced digits, the doubled ditto, a glued header and heading, a full stop after the day, a narrow full line', () => {
    const r = parseActaIndex(index2010(`I – ADHORTATIO APOSTOLICA POSTSYNODALIS
2010 Sept. 30 Verbum Domini ................ 6 8 1
II – LITTERAE DECRETALES
2008 Oct. 12 « Animadverto me oblationem ». - Quibus Beatae Alfonsae ab
Immaculata Conceptione Sanctorum honores decernuntur . . . 521
»» » « Gaudium et spes ». - Quibus Beatae Narcissae a Iesu Mar-
tillo Mora´n Sanctorum honores decernuntur .... 8 6 8
» Oct. 18 Ad Sacrorum Alumnos Sacerdotali exeunte Anno .... 7 9 3IV – LITTERAE APOSTOLICAE « MOTU PROPRIO » DATAE
2009 Oct. 26 Omnium in mentem . - Quaedam in Codice Iuris Canonici
immutantur ................ 8
V – LITTERAE APOSTOLICAE SUB PLUMBO DATAE
2010 Nov. 20. S. Maria Odigitria Siculorum, fit Titulus Cardinalicius
Presbyteralis ................ 8 7 5
VI – CONSTITUTIONES APOSTOLICAE
2010 Ian. 20 Cum esset petitum. - In Aethiopia novus conditur Vicariatus
Apostolicus Hosannensis ........... 1 3 7
»» 3 0 Missionalem Ecclesiae. - In Timoria Orientali nova conditur
dioecesis Malianensis appellanda ........ 1 3 8
\fIndex documentorum chronologico ordine digestus 9612010 Maii 1 Divini Salvatoris . - Vicariatus Apostolicus conditur in
Archipelago Comorensi appellandus ................ 3 1 3
VII – LITTERAE APOSTOLICAE
» » » « Misericordiae Domini ». - Venerabili Servo Dei Euphrasio
a Iesu Infante, Beatorum honores decernuntur 444
» Oct. 15 Internationali adveniente Die Alimoniae dicato, anno 2010 846
\f962 Acta Apostolicae Sedis – Commentarium OfficialeVIII – LITTERAE PASTORALES
2010 Mart. 19 Litterae Pastorales ad christifideles catholicos in Hibern ia 209`), { year: 2010, volume: 102, fullLine: 40 });
    expect(r.entries.map((e) => [e.date, e.category, e.page])).toEqual([
      ['2010-09-30', 'ADHORTATIO APOSTOLICA POSTSYNODALIS', 681],
      ['2008-10-12', 'LITTERAE DECRETALES', 521], ['2008-10-12', 'LITTERAE DECRETALES', 868], ['2008-10-18', 'LITTERAE DECRETALES', 793],
      ['2009-10-26', 'LITTERAE APOSTOLICAE «MOTU PROPRIO» DATAE', 8],
      ['2010-11-20', 'LITTERAE APOSTOLICAE SUB PLUMBO DATAE', 875],
      ['2010-01-20', 'CONSTITUTIONES APOSTOLICAE', 137], ['2010-01-30', 'CONSTITUTIONES APOSTOLICAE', 138], ['2010-05-01', 'CONSTITUTIONES APOSTOLICAE', 313],
      ['2010-05-01', 'LITTERAE APOSTOLICAE', 444], ['2010-10-15', 'LITTERAE APOSTOLICAE', 846],
      ['2010-03-19', 'LITTERAE PASTORALES', 209],
    ]);
    expect(r.entries[2]!.incipit).toBe('Gaudium et spes');
    expect(r.unseenHeadings).toEqual([]);
    expect(parseRate(r.stats)).toBe(1);
    // Without `fullLine: 40` the two full lines of the narrow column are not read as page lines (as 2012-2024 print none so).
    const wide = parseActaIndex(index2010(`VII – LITTERAE APOSTOLICAE
» » » « Misericordiae Domini ». - Venerabili Servo Dei Euphrasio
a Iesu Infante, Beatorum honores decernuntur 444
» Oct. 15 Internationali adveniente Die Alimoniae dicato, anno 2010 846`.replace('» » »', '2007 Oct. 28')), { year: 2010, volume: 102 });
    expect(wide.entries).toHaveLength(0);
  });

  it('reads an act the index cites at two pages, keeping the first as the page and the rest as alsoPages', () => {
    // The 2014 index, AAS 106 (2014) 1083: *Deus caritas*, printed at 138 and again at 261.
    const r = parseActaIndex(index(`VII – LITTERAE APOSTOLICAE
 »  Oct. 8 « Deus caritas ». – Venerabili Servae Dei Mariae Janer Angla-
rill Beatorum honores decernuntur 138, 261
 »  » 23 « Secundum eum ». – Venerabili Dei Servo Iustino Mariae Russolillo
caelitum Beatorum tribuitur dignitas .  .  .  .  .  .  .  .  .  .  142`.replace(' »  Oct. 8', '8 Oct. 2011'), '(An. 2014 et Vol. CVI)'), { year: 2014 });
    expect(r.entries.map((e) => [e.incipit, e.page, e.alsoPages])).toEqual([['Deus caritas', 138, [261]], ['Secundum eum', 142, undefined]]);
  });

  it('drops a stray mark the OCR set inside the guillemets, and keeps the unprinted-year marker whole', () => {
    // AAS 81 (1989) 1397 `«.Deus tantum »`; the `????` a broken year leaves (AAS 43 (1951) `1ÍS50 Ian. 29`).
    const r = parseActaIndex(volume(`                                    III - LITTERAE DECRETALES
1989 Oct. 2 «.Deus tantum ». - Beata Magdalena de Canossa Sancta esse
                              decernitur 1001
                                    IV - LITTERAE APOSTOLICAE
1ÍS50 Ian. 29 Benedixisti, Domine. - Basilicae Minoris honoribus 71
  » » 30 In finibus. - Paroeciale Templum 73`, jp2), { year: 1989, volume: 81, ...columnar });
    expect(r.entries.map((e) => [e.date, e.incipit, e.quoted])).toEqual([
      ['1989-10-02', 'Deus tantum', true], ['????-01-29', 'Benedixisti, Domine', false], ['????-01-30', 'In finibus', false],
    ]);
  });

  it('parses every fixture of 1979-2002 and 2010-2014 with no unseen heading and no unmapped pope, above 95 % over the harvested categories except 1988', () => {
    // AAS 80 (1988) reads at 91.1 % over the harvested categories: its text layer drops the text of eight messages under
    // *Nuntii scripto dati* and *Nuntii televisifici* (pp. 1834-1835) and prints their date and page alone, so the lines
    // end in a page and open no entry -- a loss of the file, named here, not a shape the parser lacks. The overall rate
    // falls below 95 % in seven sources for the journeys, the consistories' items and the 2013 index's inaugural ceremonies.
    const sources = [...Array.from({ length: 24 }, (_, i) => 1979 + i), 2010, 2011, 2013, 2014];
    for (const year of sources) {
      const vol = year - 1908;
      const file = year <= 2002 ? `tools/fixtures/acta/aas-${vol}-${year}${year === 1983 ? '-I' : ''}.txt` : `tools/fixtures/acta/aas-indice-${year}.txt`;
      const r = parseActaIndex(readFileSync(file, 'utf8'), year <= 2002
        ? { year, volume: vol, ...(year === 1983 ? { part: 'I' as const } : {}), columnar: true }
        : { year, volume: vol, ...([2010, 2011].includes(year) ? { fullLine: 40 as const } : {}) });
      expect(r.unseenHeadings, String(year)).toEqual([]);
      expect(r.unmappedPopes, String(year)).toEqual([]);
      expect(r.popeHeadings.length, String(year)).toBe([1979, 2013, 2014].includes(year) ? 2 : 1);
      if (year === 1988) {
        expect(harvestedParseRate(r.stats)!).toBeGreaterThanOrEqual(0.91);
        expect(r.stats.harvestedPageLines - r.stats.harvestedEntries).toBe(8);
      } else {
        expect(harvestedParseRate(r.stats)!, String(year)).toBeGreaterThanOrEqual(0.95);
      }
      if (year === 1983) expect(r.entries.every((e) => e.part === 'I'), '1983').toBe(true);
    }
  });
});

describe('parseActaIndex on the early volumes whose OCR kept the page column (acta volumes spec §10, phase 2b-iii-a)', () => {
  it('reads a pope heading the layout mode doubled on one line (AAS 3, 1911), and keeps the printed line', () => {
    const r = parseActaIndex(volume(`                                                   I. - CONSTITUTIONES APOSTOLICAE.
1911          Oct.        28      Si qua est. - De nova ecclesiasticae hierarchiae in
                                                                                                                               553
   »         Nov.           1     Divino afflatu. - De nova Psalterii in Breviario Romano
                                        dispositione                                                                           633`, 'I. — ACTA PII PP. X. I. — ACTA PII PP. X.'), { year: 1911, volume: 3, ...columnar });
    expect(r.popeHeadings).toEqual(['I. — ACTA PII PP. X. I. — ACTA PII PP. X.']);
    expect(r.skippedParts).toEqual([]);
    expect(r.entries.map((e) => [e.pope, e.date, e.incipit, e.page])).toEqual([
      ['Pius X', '1911-10-28', 'Si qua est', 553],
      ['Pius X', '1911-11-01', 'Divino afflatu', 633],
    ]);
  });

  it('maps the headings of 1926-1930: the O spelling of Epistulae Apostolicae, a bare Notificatio, and the OCR of Chirographi', () => {
    expect(categoryForHeading('EPISTOLAE APOSTOLICAE')?.id).toBe('Epistulae Apostolicae');
    expect(categoryForHeading('NOTIFICATIO')).toMatchObject({ id: 'Notificatio', harvested: 'no' });
    expect(categoryForHeading('CHTRO GRAPHIS')?.id).toBe('Chirographa');
    expect(categoryForHeading('CHIEOGRAPHI')?.id).toBe('Chirographa');
  });

  it('parses every fixture of 1926-1930 with no unseen heading and no unmapped pope, above 95 % over the harvested categories', () => {
    for (const year of [1926, 1927, 1928, 1929, 1930]) {
      const vol = year - 1908;
      const r = parseActaIndex(readFileSync(`tools/fixtures/acta/aas-${String(vol).padStart(2, '0')}-${year}.txt`, 'utf8'), { year, volume: vol, ...columnar });
      expect(r.unseenHeadings, String(year)).toEqual([]);
      expect(r.unmappedPopes, String(year)).toEqual([]);
      expect(r.popeHeadings.length, String(year)).toBe(1);
      expect(harvestedParseRate(r.stats)!, String(year)).toBeGreaterThanOrEqual(0.95);
      // The page column survived in these five (spec §10.1): few entries open without a page.
      expect(r.stats.withoutPage / r.stats.dateLines, String(year)).toBeLessThan(0.1);
    }
  });

  it('parses the seventeen fixtures of 1909-1925 with no unseen heading and no unmapped pope (phase 2b-iii-b, spec §10); their pages are recovered by a later task, not asserted here', () => {
    const sources: [string, object][] = [
      ['aas-01-1909', { year: 1909, volume: 1, columnar: true, bareIncipits: false }],
      ...[1910, 1911, 1912, 1913, 1914, 1915, 1916].map((year): [string, object] => [`aas-${String(year - 1908).padStart(2, '0')}-${year}`, { year, volume: year - 1908, ...columnar }]),
      ['aas-09-1917-I', { year: 1917, volume: 9, part: 'I', ...columnar }],
      ...[1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925].map((year): [string, object] => [`aas-${String(year - 1908).padStart(2, '0')}-${year}`, { year, volume: year - 1908, ...columnar }]),
    ];
    for (const [file, opts] of sources) {
      const r = parseActaIndex(readFileSync(`tools/fixtures/acta/${file}.txt`, 'utf8'), opts);
      expect(r.unseenHeadings, file).toEqual([]);
      expect(r.unmappedPopes, file).toEqual([]);
    }
  });
});

describe('parseActaIndex keeps the entries opened without a page (spec §10.3, phase 2b-iii-b)', () => {
  it('keeps an entry the OCR lost the page of as a pageless entry with everything but the page (AAS 13, 1921)', () => {
    const r = parseActaIndex(volume(`                                                         I. - LITTERAE ENCYCLICAE.
1921          Ian.          6      Sacra propediem. - Ad Patriarchas, Primates, Archie­
                                        piscopos, Episcopos aliosque locorum Ordinarios,
                                        pacem et communionem cum Apostolica Sede ha­
                                        bentes: septimo saeculo exeunte a Tertio Ordine
                                        Franciscanum condito . .
             Apr.         30       In praeclara summorum. - Dilectis filiis doctoribus
                                        et alumnis litterarum artiumque optimarum orbis
                                        catholici, saeculo sexto exeunte ab obitu Dantis
                                        Aligherii 209`, 'I. - ACTA BENEDICTI PP. XV'), { year: 1921, volume: 13, ...columnar });
    expect(r.entries.map((e) => [e.incipit, e.page, e.pageSource])).toEqual([['In praeclara summorum', 209, undefined]]);
    expect(r.pageless).toHaveLength(1);
    expect(r.pageless[0]).toMatchObject({
      series: 'AAS', volume: 13, year: 1921, pope: 'Benedictus XV', category: 'LITTERAE ENCYCLICAE', date: '1921-01-06',
      incipit: 'Sacra propediem', quoted: false, toponym: null,
      description: 'Ad Patriarchas, Primates, Archiepiscopos, Episcopos aliosque locorum Ordinarios, pacem et communionem cum Apostolica Sede habentes: septimo saeculo exeunte a Tertio Ordine Franciscanum condito',
    });
    expect('page' in r.pageless[0]!).toBe(false);
    expect(r.pageless[0]!.raw.split('\n')).toHaveLength(5);
    // The defect and the count are as before: the pageless entry is the same fact, structured.
    expect(r.stats.withoutPage).toBe(1);
    expect(r.defects.filter((d) => d.message.startsWith('entry without a page number'))).toHaveLength(1);
  });
});

describe('parseActaIndex on the index PDFs of 2003-2009 (acta volumes spec §11, phase 2b\')', () => {
  it('reads the ditto marks the layout mode glues: to the guillemet, to the day, and the day to the text', () => {
    const r = parseActaIndex(index(`IV – LITTERAE DECRETALES
2004 Maii 16 « Cum liber essem ». – Beato Aloisio Orione Sanctorum ho-
nores decernuntur .............. 6
» » »« Cum dilexisset suos ». – Beatae Ioannae Beretta Molla
Sanctorum honores decernuntur ........ 9
»» »« Qui manet». – Beato Alberto Hurtado Cruchaga Sancto-
rum honores decernuntur ........... 300
»»30 Pertransiit benefaciendo. – Beato Carolo a S. Andrea
Houben Sanctorum honores decernuntur ..... 361
»»3 0 Salutis omnium. – Beato Simoni de Lipnica, presbytero,
Sanctorum honores decernuntur ......... 121
V – CONSTITUTIONES APOSTOLICAE
2004 Ian. 14 De universo dominico. – In Madagascaria nova conditur
Provincia ecclesiastica, Toliarana appellanda ..... 87
» » 25Ad universae incrementum. – In Aethiopia nova Eparchia
constituitur nomine Emdeberensis ........ 251
2004 Dec. 25Deus Caritas est. – Episcopis, presbyteris et diaconis, viris
et mulieribus consecratis ............ 217`, '(An. 2004 et Vol. XCVI)'), { year: 2004 });
    expect(r.defects).toEqual([]);
    expect(r.entries.map((e) => [e.date, e.incipit, e.page])).toEqual([
      ['2004-05-16', 'Cum liber essem', 6],
      ['2004-05-16', 'Cum dilexisset suos', 9],
      ['2004-05-16', 'Qui manet', 300],
      ['2004-05-30', 'Pertransiit benefaciendo', 361],
      ['2004-05-30', 'Salutis omnium', 121],
      ['2004-01-14', 'De universo dominico', 87],
      ['2004-01-25', 'Ad universae incrementum', 251],
      ['2004-12-25', 'Deus Caritas est', 217],
    ]);
  });

  it('starts 2006\'s index, which prints no title line, at the page before the first running header, and reads ACTA SUMMI PONTIFICIS as a container of the pope sub-headings', () => {
    const text = `ACTA APOSTOLICAE SEDIS
INDEX GENERALIS ACTORUM
(An. 2006 et Vol. XCVIII)
I – ACTA SUMMI PONTIFICIS
Litterae Encyclicae: 217.
\fIndex generalis actorum 963
In Civitate Vaticana: 215, 295.
\fI — ACTA SUMMI PONTIFICIS

ACTA BENEDICTI XVI

I – LITTERAE ENCYCLICAE

2005 Dec. 25 Deus Caritas est. – Episcopis, presbyteris et diaconis, viris
et mulieribus consecratis ............ 217
\fIndex documentorum chronologico ordine digestus 965

II – LITTERAE DECRETALES

2005 Oct. 23 « Iustus Dominus ». – Beato Caietano Catanoso Sanctorum
honores decernuntur ............. 297

ACTA IOANNIS PAULI II

I – LITTERAE APOSTOLICAE

2005 Mart. 19 « Sit vobis ». – Venerabili Servo Dei Marino
Beatorum honores decernuntur .......... 7
`;
    const r = parseActaIndex(text, { year: 2006 });
    expect(r.volume).toBe(98);
    expect(r.skippedParts).toEqual([]);
    expect(r.popeHeadings).toEqual(['ACTA BENEDICTI XVI', 'ACTA IOANNIS PAULI II']);
    expect(r.defects).toEqual([]);
    expect(r.entries.map((e) => [e.pope, e.date, e.incipit, e.page])).toEqual([
      ['Benedictus XVI', '2005-12-25', 'Deus Caritas est', 217],
      ['Benedictus XVI', '2005-10-23', 'Iustus Dominus', 297],
      ['Ioannes Paulus II', '2005-03-19', 'Sit vobis', 7],
    ]);
    // The general index's own `I – ACTA SUMMI PONTIFICIS` (page 1) is before the start: its page list is neither an entry nor a defect.
  });

  it('still throws for an index PDF with neither a title line nor a running header', () => {
    expect(() => parseActaIndex('ACTA APOSTOLICAE SEDIS\n(An. 2006 et Vol. XCVIII)\nI – ACTA BENEDICTI XVI\n', { year: 2006 })).toThrow(/CHRONOLOGICO ORDINE DIGESTUS/);
  });

  it('reads SYNODUS EPISCOPORUM as a category of the pope part where its numeral continues the part\'s, and as a part where it does not', () => {
    const asCategory = parseActaIndex(index(`VII – ITINERA APOSTOLICA
2005 Aug. 18-21 Germaniam .................. 933
VIII – SYNODUS EPISCOPORUM
2005 Oct. 22 Nuntius datus ab XI Coetu Generali Ordinario Synodi
Episcoporum ............... 988
IX – SECRETARIA STATUS
2005 Ian. 10 Conventio inter Sanctam Sedem et Rempublicam Slovacam .... 12`, '(An. 2005 et Vol. XCVII)'), { year: 2005 });
    expect(asCategory.skippedParts).toEqual([]);
    expect(asCategory.entries.map((e) => [e.category, e.date, e.page])).toEqual([
      ['SYNODUS EPISCOPORUM', '2005-10-22', 988],
      ['SECRETARIA STATUS', '2005-01-10', 12],
    ]);
    const asPart = parseActaIndex(index(`XII – NUNTII
2005 Aug. 18 Ad iuvenes Coloniae congregatos ........ 933
II – SYNODUS EPISCOPORUM
2005 Oct. 22 Nuntius datus ab XI Coetu Generali Ordinario Synodi
Episcoporum ............... 988`, '(An. 2005 et Vol. XCVII)'), { year: 2005 });
    expect(asPart.skippedParts).toEqual(['II – SYNODUS EPISCOPORUM']);
    expect(asPart.entries.map((e) => e.category)).toEqual(['NUNTII']);
  });
});

describe('splitEntryText', () => {
  it('strips guillemets and takes the rest as description, whatever follows the closing one', () => {
    expect(splitEntryText('« Venite benedicti  ». - Venerabili Dei Servo')).toEqual({ incipit: 'Venite benedicti', quoted: true, toponym: null, description: 'Venerabili Dei Servo' });
    expect(splitEntryText('« Fondo Pensioni »: De statutorum recognitione')).toEqual({ incipit: 'Fondo Pensioni', quoted: true, toponym: null, description: 'De statutorum recognitione' });
    expect(splitEntryText('« Hoc est praeceptum » Venerabilibus Dei Servis')).toEqual({ incipit: 'Hoc est praeceptum', quoted: true, toponym: null, description: 'Venerabilibus Dei Servis' });
    expect(splitEntryText('« Vos estis lux mundi »')).toEqual({ incipit: 'Vos estis lux mundi', quoted: true, toponym: null, description: '' });
  });

  it('ends a bare incipit at a full stop, a colon or a double space, but not at an abbreviation', () => {
    expect(splitEntryText('Sublimitas et miseria hominis . IV Centesima occurrente')).toMatchObject({ incipit: 'Sublimitas et miseria hominis', description: 'IV Centesima occurrente' });
    expect(splitEntryText('Mitis Iudex Dominus Iesus: Quibus canones')).toMatchObject({ incipit: 'Mitis Iudex Dominus Iesus' });
    expect(splitEntryText('While we walk  Ad Episcopos Nigeriae')).toMatchObject({ incipit: 'While we walk', description: 'Ad Episcopos Nigeriae' });
    expect(splitEntryText("Laudato si'. De communi domo colenda")).toMatchObject({ incipit: "Laudato si'" });
    expect(splitEntryText('Occasione XXV anniversariae memoriae Itineris Apostolici S. Ioannis Pauli II in Cubam').incipit).toBeNull();
    expect(splitEntryText('Ad Em.mum ac Rev.mum Dominum Petrum Kodwo Appiah S.E.R. Cardinalem Turkson').incipit).toBeNull();
    expect(splitEntryText('Lex N. DCXXVI quae dispositiones adfert').incipit).toBeNull();
  });

  it('takes prose with no terminator, or too long for an incipit, as description only', () => {
    expect(splitEntryText('Pro LVI Die Mundiali Pacis')).toEqual({ incipit: null, quoted: false, toponym: null, description: 'Pro LVI Die Mundiali Pacis' });
    expect(splitEntryText('Misericordiae Vultus').incipit).toBeNull();
    expect(splitEntryText('Consistorium annuntiatur die XXX mensis Septembris celebrandum pro novis Cardinalibus creandis. Et cetera').incipit).toBeNull();
  });

  it('tells a toponym from an incipit by OCR small caps, a lower-case initial or a Latin adjective', () => {
    expect(splitEntryText('ChiAngrAien. In Thailandia nova conditur dioecesis')).toMatchObject({ toponym: 'ChiAngrAien.', incipit: null });
    expect(splitEntryText('isiolAnus: In Kenia Vicariatus')).toMatchObject({ toponym: 'isiolAnus' });
    expect(splitEntryText('Prisrensis-Priscensis: Administratio Apostolica')).toMatchObject({ toponym: 'Prisrensis-Priscensis' });
    expect(splitEntryText('Quo satius : In Mexico nova conditur dioecesis')).toMatchObject({ incipit: 'Quo satius', toponym: null });
  });
});

describe('splitEntryText on the volumes', () => {
  it('reads the incipit before ` - ` and the description after it, the volumes\' convention', () => {
    expect(splitEntryText('Humani generis redemptionem. - Ad Patriarchas, Primates')).toEqual({ incipit: 'Humani generis redemptionem', quoted: false, toponym: null, description: 'Ad Patriarchas, Primates' });
    // The description may open with a toponym and a colon (1931): the incipit still wins.
    expect(splitEntryText('Sollicitudo. - Goyasen.: de dioecesis dismembratione')).toMatchObject({ incipit: 'Sollicitudo', toponym: null, description: 'Goyasen.: de dioecesis dismembratione' });
    // A toponym-shaped head before the dash stays a toponym (the 2023 index).
    expect(splitEntryText('Cuneen. – fossAnen.: Cuneensis et Fossanensis dioeceses plene iunguntur')).toMatchObject({ incipit: null, toponym: 'Cuneen. – fossAnen.' });
  });

  it('reads the capitalised toponym of 1958 and 1978, and a bare head only when the fixture prints bare incipits', () => {
    expect(splitEntryText('BOACENSIS. - Cum tempora. Detracta ab Ecclesia')).toEqual({ incipit: 'Cum tempora', quoted: false, toponym: 'BOACENSIS', description: 'Detracta ab Ecclesia' });
    expect(splitEntryText('KIKUITENSIS - KISANTUENSIS (Kengen.). Illa spei. - Certis distractis terris')).toMatchObject({ toponym: 'KIKUITENSIS - KISANTUENSIS (Kengen.)', incipit: 'Illa spei', description: 'Certis distractis terris' });
    expect(splitEntryText('MAOËNSIS-MONTIS CHRISTI. - Studiosi instar. In Republica')).toMatchObject({ toponym: 'MAOËNSIS-MONTIS CHRISTI', incipit: 'Studiosi instar' });
    // A caps head of fewer than four letters (an abbreviation) is not a toponym.
    expect(splitEntryText('S. Ioannes de Deo et S. Camillus de Lellis caelestes declarantur').toponym).toBeNull();
    // An OCR-damaged head is kept as printed (the creator holds it); a parenthesis is never in an incipit.
    expect(splitEntryText('B (IARENSIS. - Peramplum Berberatensis. In Africae').incipit).toBeNull();
    expect(splitEntryText('Constitutio « Promulgandi », de promulgatione legum', { bareIncipits: false })).toMatchObject({ incipit: 'Promulgandi', quoted: true, description: 'de promulgatione legum' });
    expect(splitEntryText('Pontificium Institutum Biblicum in Urbe erigitur. — Leges', { bareIncipits: false }).incipit).toBeNull();
    expect(splitEntryText('Pontificium Institutum Biblicum in Urbe erigitur. — Leges').incipit).toBe('Pontificium Institutum Biblicum in Urbe erigitur');
  });
});

describe('splitEntryText on the volumes of 1932-1957', () => {
  it('reads a mixed-case toponym with its vernacular in parentheses, and the incipit after it where one is printed', () => {
    expect(splitEntryText('De Sienhsien (De Kinghsien). - Vicariatus Apostolicus de Sienhsien bipartitur')).toEqual({ incipit: null, quoted: false, toponym: 'De Sienhsien (De Kinghsien)', description: 'Vicariatus Apostolicus de Sienhsien bipartitur' });
    expect(splitEntryText('S. Ludovici de Maragnano, S. Ioseph de Grajahu (Pinerensis). - Archidioecesis S. Ludovici')).toMatchObject({ toponym: 'S. Ludovici de Maragnano, S. Ioseph de Grajahu (Pinerensis)', incipit: null });
    expect(splitEntryText('Transvaallensis Septemtrionalis (de Pietersburg).-Praefectura Apostolica')).toMatchObject({ toponym: 'Transvaallensis Septemtrionalis (de Pietersburg)', description: 'Praefectura Apostolica' });
    expect(splitEntryText('Aleppensis (Berytensis). Solent caeli. - Ex territorio Apostolici')).toEqual({ incipit: 'Solent caeli', quoted: false, toponym: 'Aleppensis (Berytensis)', description: 'Ex territorio Apostolici' });
    // An addressee is never a toponym, and a dash set without its spaces still ends the incipit.
    expect(splitEntryText('Ad Emum P. D. Petrum (Praefectum). - De re quadam').toponym).toBeNull();
    expect(splitEntryText('Quae rei sacrae.-Fines immutantur inter vicariatum')).toMatchObject({ incipit: 'Quae rei sacrae', description: 'Fines immutantur inter vicariatum' });
    expect(splitEntryText('Ad pastorale ministerium..-De dioecesis Quilonensis')).toMatchObject({ incipit: 'Ad pastorale ministerium', description: 'De dioecesis Quilonensis' });
  });
});

describe('joinLines', () => {
  it('drops a line-end hyphen before a lower-case continuation and keeps it before an upper-case one', () => {
    expect(joinLines(['Pri\u00ad', 'mates, Archiepiscopos'])).toBe('Primates, Archiepiscopos');
    expect(joinLines(['Sanc-', 'torum honores'])).toBe('Sanctorum honores');
    expect(joinLines(['cele -', 'brandum pro novis'])).toBe('celebrandum pro novis');
    expect(joinLines(['Syro-  ', 'Malankarensium appellanda'])).toBe('Syro-Malankarensium appellanda');
    expect(joinLines(['De patrimonio ', ' Sedis'])).toBe('De patrimonio Sedis');
  });
});

describe('romanToInt', () => {
  it('reads the volume numerals, upper or lower case', () => {
    expect(romanToInt('CXV')).toBe(115);
    expect(romanToInt('CvII')).toBe(107);
    expect(romanToInt('CIX')).toBe(109);
    expect(() => romanToInt('CXQ')).toThrow();
  });
});
