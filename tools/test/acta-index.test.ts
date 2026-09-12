import { describe, it, expect } from 'vitest';
import { parseActaIndex, splitEntryText, joinLines, romanToInt } from '../src/acta/index.js';

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

  it('reports a date line with no day, and lets its month govern the ditto marks after it', () => {
    // AAS 2018 p. 689: `Sept. » Chengden.:` prints no day. Read as May (the entry before
    // it), the two `» »` entries after it would be May too; the index means September --
    // Prizren-Pristina became a diocese on 5 September 2018, Episcopalis communio is of
    // 15 September 2018 -- and the parser must not date them by the wrong ditto.
    const r = parseActaIndex(index(`V – CONSTITUTIONES APOSTOLICAE
31 Maii 2018 tigren. In Venetiola nova conditur dioecesis Trigrensis.  .  .  1162
  Sept. » Chengden.: In Sinis nova conditur dioecesis Chengdensis  .  .  689
 5 » » Prisrensis-Priscensis: Administratio Apostolica Prisrianen -
sis ad gradum et dignitatem dioecesis evehitur  .  .  .  .  1708
15 » » « Episcopalis Communio ». De Synodo Episcoporum   .  .  .  .  1359
 » » » « Alia ». De alia re   .  .  .  .  1400`, '(An. 2018 et vol. CX)'), { year: 2018 });
    expect(r.entries.map((e) => [e.date, e.incipit ?? e.toponym])).toEqual([
      ['2018-05-31', 'tigren.'],
      ['2018-09-05', 'Prisrensis-Priscensis'],
      ['2018-09-15', 'Episcopalis Communio'],
      ['2018-09-15', 'Alia'],
    ]);
    expect(r.defects).toEqual([{ category: 'CONSTITUTIONES APOSTOLICAE', message: 'entry without a day: Sept. » Chengden.: In Sinis nova conditur dioecesis Chengdensis  .  .  689' }]);
  });

  it('reports a ditto day after a day-less line as unreadable rather than inheriting an older day', () => {
    const r = parseActaIndex(index(`V – CONSTITUTIONES APOSTOLICAE
31 Maii 2018 tigren. In Venetiola nova conditur dioecesis Trigrensis.  .  .  1162
  Sept. » Chengden.: In Sinis nova conditur dioecesis Chengdensis  .  .  689
 » » » Alia.: De alia re   .  .  .  .  1400`, '(An. 2018 et vol. CX)'), { year: 2018 });
    expect(r.entries.map((e) => e.date)).toEqual(['2018-05-31']);
    expect(r.defects.map((d) => d.message.split(':')[0])).toEqual(['entry without a day', 'unreadable date']);
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

describe('joinLines', () => {
  it('drops a line-end hyphen before a lower-case continuation and keeps it before an upper-case one', () => {
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
