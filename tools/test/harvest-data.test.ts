import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { checkDocuments } from '../src/validate/invariants.js';
import { parseShelfIndex } from '../src/harvest/shelf.js';
import { shelvesFor } from '../src/mappings/index.js';
import type { DocumentRecord } from '../src/types.js';

const load = (n: string) =>
  JSON.parse(readFileSync(`data/documents/${n}.json`, 'utf8')) as DocumentRecord[];
const genres = JSON.parse(readFileSync('data/genres.json', 'utf8')) as
  Array<{ id: string; issuerTypes?: string[] }>;
const keywords = JSON.parse(readFileSync('data/keywords.json', 'utf8')) as Array<{ id: string }>;

const all = [...load('benedict-xiv'), ...load('pius-ix'), ...load('leo-xiii'), ...load('vatican-i')];

describe('the harvested pilot corpus', () => {
  it('holds the whole pilot corpus', () => {
    // 395 raw items in. Twelve Leo XIII documents are filed on both the encyclicals and
    // letters shelves and merge into one record each: seven share incipit and date
    // (pass 1); two more -- In Plurimis/In plurimis maximisque and Non mediocri/
    // Non mediocri cura -- are proven identical only by their shared URL document-slug
    // (pass 2); and three more -- Quum Diuturnum/Cum diuturnum, Reputantibus/
    // Reputantibus saepe, and Vi è ben noto/Vi è noto -- are proven identical only by
    // comparing full texts against vatican.va, since neither the incipit nor the URL
    // document-slug agrees for them (pass 3, DUPLICATE_MERGES). 395 - 12 = 383.
    expect(all).toHaveLength(383);
  });

  it('deduplicates the twelve twice-shelved Leo XIII documents', () => {
    const twice = all.filter((d) => (d.source?.alsoShelvedAs?.length ?? 0) > 0);
    expect(twice).toHaveLength(12);
    expect(twice.map((d) => d.incipit!.toLowerCase()).sort()).toEqual([
      'in amplissimo', 'in plurimis', 'magni nobis', 'non mediocri', 'omnibus compertum',
      'permoti nos', 'quam aerumnosa', 'quod anniversarius', 'quum diuturnum',
      'reputantibus', 'urbanitatis veteris', 'vi è ben noto',
    ]);
    for (const d of twice) {
      expect(d.source!.shelf).toBe('encyclicals');
      expect(d.source!.alsoShelvedAs).toEqual(['letters']);
    }
  });

  it('records the dropped incipit as an alias for every pass 2 and pass 3 merge', () => {
    const byIncipit = (incipit: string) => all.find((d) => d.incipit === incipit);
    expect(byIncipit('In Plurimis')?.aliases).toEqual(['In plurimis maximisque']);
    expect(byIncipit('Non mediocri')?.aliases).toEqual(['Non mediocri cura']);
    expect(byIncipit('Quum Diuturnum')?.aliases).toEqual(['Cum diuturnum']);
    expect(byIncipit('Reputantibus')?.aliases).toEqual(['Reputantibus saepe']);
    expect(byIncipit('Vi è ben noto')?.aliases).toEqual(['Vi è noto']);
    // The seven pass 1 merges share the same incipit (modulo case), so they gain no alias.
    for (const incipit of [
      'In Amplissimo', 'Magni Nobis', 'Omnibus Compertum', 'Permoti Nos',
      'Quam Aerumnosa', 'Quod Anniversarius', 'Urbanitatis Veteris',
    ]) {
      expect(byIncipit(incipit)?.aliases).toBeUndefined();
    }
  });

  it('satisfies every invariant', () => {
    expect(checkDocuments(all, genres, keywords)).toEqual([]);
  });

  it('files the two Vatican I constitutions under the council', () => {
    const v1 = load('vatican-i');
    expect(v1.map((d) => d.id).sort()).toEqual([
      'mag:vatican-i/dei-filius-1870', 'mag:vatican-i/pastor-aeternus-1870',
    ]);
    expect(v1.every((d) => d.promulgatedBy === 'rp:pius-ix')).toBe(true);
    expect(load('pius-ix').some((d) => d.incipit === 'Pastor Aeternus')).toBe(false);
  });

  it('distinguishes the five Ubi Primum documents', () => {
    const ids = all.filter((d) => d.incipit?.toLowerCase().startsWith('ubi primum')).map((d) => d.id);
    expect(ids.sort()).toEqual([
      'mag:leo-xiii/ubi-primum-1898',
      'mag:leo-xiii/ubi-primum-1878',
      'mag:benedict-xiv/ubi-primum-1740',
      'mag:pius-ix/ubi-primum-1847',
      'mag:pius-ix/ubi-primum-1849',
    ].sort());
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('corrects the letters shelf transcription typo and merges Magni Nobis into one document', () => {
    const mn = all.filter((d) => d.incipit === 'Magni Nobis');
    expect(mn).toHaveLength(1);
    expect(mn[0]!.id).toBe('mag:leo-xiii/magni-nobis-1889');
    expect(mn[0]!.date).toBe('1889-03-07');
    expect(mn[0]!.source!.shelf).toBe('encyclicals');
    expect(mn[0]!.source!.alsoShelvedAs).toEqual(['letters']);
  });

  it('leaves the TBD shelf empty', () => {
    expect(all.filter((d) => d.idStatus === 'provisional')).toEqual([]);
  });

  it('gives every document a title, equal to the incipit except one genuine gloss', () => {
    expect(all.every((d) => typeof d.title === 'string' && d.title.length > 0)).toBe(true);
    // Every pilot-corpus heading carries an incipit (asserted above). Title equals it
    // for all but one: 'Ad universam: viene eretta la diocesi di Lugano' prints a
    // colon-introduced gloss after its true incipit, 'Ad universam' -- title keeps the
    // full heading, incipit keeps only the opening words (spec §4.2).
    const differing = all.filter((d) => d.title !== d.incipit);
    expect(differing.map((d) => d.title)).toEqual(['Ad universam: viene eretta la diocesi di Lugano']);
    expect(differing[0]!.incipit).toBe('Ad universam');
  });

  it('preserves unmapped genres rather than inventing rows', () => {
    const unmapped = all.filter((d) => d.genre === null);
    expect(unmapped.length).toBeGreaterThan(0);
    expect(unmapped.every((d) => Boolean(d.sourceGenreLabel))).toBe(true);
  });

  it('adjudicates Provida Matris to its own dating formula, not its printed date', () => {
    // Provida Matris's own text reads 'il 5 maggio 1895, anno decimottavo del Nostro
    // Pontificato'; the briefs shelf prints '15 maggio 1895'. The slug (5 May) is
    // correct and the printed date is the error -- the only one of the six adjudicated
    // conflicts where the resolved date differs from what the page prints.
    const pm = all.filter((d) => d.incipit === 'Provida Matris');
    expect(pm).toHaveLength(1);
    expect(pm[0]!.date).toBe('1895-05-05');
    expect(pm[0]!.id).toBe('mag:leo-xiii/provida-matris-1895');
  });

  it('emits no printed/slug date-mismatch warnings once every conflict is adjudicated', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let calls: unknown[][];
    try {
      for (const shelf of shelvesFor('leo-xiii')) {
        parseShelfIndex(readFileSync(`tools/fixtures/leo-xiii-${shelf}.html`, 'utf8'), 'leo-xiii', shelf);
      }
    } finally {
      calls = warnSpy.mock.calls;
      warnSpy.mockRestore();
    }
    const mismatches = calls.filter(([msg]) => String(msg).includes('date mismatch'));
    expect(mismatches).toEqual([]);
  });

  it('preserves the three adjudicated-distinct same-date pairs as separate documents', () => {
    // 1886-01-06: Iampridem (encyclicals) vs Non senza (letters) are distinct
    const pair1886 = all.filter((d) => d.date === '1886-01-06');
    expect(pair1886).toHaveLength(2);
    expect(pair1886.map((d) => d.incipit).sort()).toEqual(['Iampridem', 'Non senza']);
    expect(pair1886[0]!.id).toBe('mag:leo-xiii/iampridem-1886');
    expect(pair1886[1]!.id).toBe('mag:leo-xiii/non-senza-1886');

    // 1890-11-20: Catholicae Ecclesiae (encyclicals) vs Novum argumentum (letters) are distinct
    const pair1890 = all.filter((d) => d.date === '1890-11-20');
    expect(pair1890).toHaveLength(2);
    expect(pair1890.map((d) => d.incipit).sort()).toEqual(['Catholicae Ecclesiae', 'Novum argumentum']);
    expect(pair1890[0]!.id).toBe('mag:leo-xiii/catholicae-ecclesiae-1890');
    expect(pair1890[1]!.id).toBe('mag:leo-xiii/novum-argumentum-1890');

    // 1891-03-03: In Ipso (encyclicals) vs Quod erat maxime (letters) are distinct
    const pair1891 = all.filter((d) => d.date === '1891-03-03');
    expect(pair1891).toHaveLength(2);
    expect(pair1891.map((d) => d.incipit).sort()).toEqual(['In Ipso', 'Quod erat maxime']);
    expect(pair1891[0]!.id).toBe('mag:leo-xiii/in-ipso-1891');
    expect(pair1891[1]!.id).toBe('mag:leo-xiii/quod-erat-maxime-1891');
  });

  it('records the fixture retrieval date, not the current clock, for every document', () => {
    // Every document's source.retrieved must match the constant FIXTURES_RETRIEVED,
    // ensuring the harvest is timestamp-independent and does not rewrite data/
    // when run without an explicit env var override.
    expect(all.every((d) => d.source?.retrieved === '2026-09-07')).toBe(true);
    const mismatched = all.filter((d) => d.source?.retrieved !== '2026-09-07');
    expect(mismatched).toEqual([]);
  });
});

describe('the Pius X corpus', () => {
  const px = load('pius-x');

  it('holds every formal-shelf document', () => {
    // 306 raw items across six shelves (16 encyclicals + 8 apostolic constitutions +
    // 54 apostolic letters + 1 exhortation + 38 motu proprio + 189 letters).
    // Eleven printed/slug date mismatches were adjudicated from each document's own
    // dating formula (DATE_CORRECTIONS) -- none of them merges, since none collided
    // with another item once corrected. A twelfth date correction (Caritatis opera,
    // wrongly dated 9 May 1910 on both the shelf and its own URL slug, actually dated
    // 28 May 1910 per its own title and closing formula) was discovered only because
    // the wrong date collided with four unrelated 9 May 1910 letters in the same-date
    // cross-shelf check; correcting it removed those four collisions rather than
    // creating a merge. The remaining six same-date cross-shelf collisions were each
    // adjudicated as genuinely distinct acts (ADJUDICATED_DISTINCT) by comparing full
    // texts, so none of them merges either. 306 raw items in, zero merged away: 306.
    expect(px).toHaveLength(306);
  });

  it('mints most Pius X ids, since it usually prints a bare incipit', () => {
    // Twelve headings (all letters/motu_proprio) are genuine addressee salutations or
    // third-person descriptions -- 'Al Card. Pietro Respighi', 'Il Pontefice prescrive
    // alle Diocesi...' -- with no incipit for extractIncipit to recover. Those, and only
    // those, become provisional.
    const provisional = px.filter((d) => d.idStatus === 'provisional');
    expect(provisional).toHaveLength(12);
    expect(provisional.map((d) => d.title).sort()).toEqual([
      "A Mons. Francesco Saverio Haberl, Prelato domestico di S.S. e Presidente generale dell'Associazione \"Santa Cecilia\" di Germania, Ratisbona (Baviera)",
      'Ai componenti la direzione provvisoria dell\' Unione economico sociale per i cattolici italiani',
      "Ai membri del comitato generale dell'Associazione Cattolica della gioventù francese",
      'Al Card. Pietro Respighi',
      'Al Cardinale Ferrari, Arcivescovo di Milano',
      'Al Cardinale Pietro Respighi, sui sacerdoti di altre Diocesi che dimorano a Roma',
      'Al Cardinale Rampolla del Tindaro, Arciprete della Basilica Vaticana',
      'Alla Principessa del Belgio, Enrichetta, Duchessa di Vendôme',
      'Il Pontefice prescrive alle Diocesi della Provincia di Roma il nuovo Compendio del Catechismo',
      'La protesta del Papa contro il Congresso del libero pensiero',
      "Sull'edificazione di un nuovo Santuario nel territorio di Nettuno come assistenza spirituale della popolazione",
      "Sull'edizione vaticana dei libri liturgici contenenti le melodie gregoriane",
    ].sort());
    expect(provisional.every((d) => 'incipit' in d === false)).toBe(true);
    expect(new Set(provisional.map((d) => d.id)).size).toBe(12);
  });

  it('files them all under Pius X', () => {
    expect(px.every((d) => d.issuerId === 'rp:pius-x')).toBe(true);
    expect(px.every((d) => d.id.startsWith('mag:pius-x/'))).toBe(true);
  });

  it('gives every document a title, equal to the incipit wherever one is printed', () => {
    expect(px.every((d) => typeof d.title === 'string' && d.title.length > 0)).toBe(true);
    const withIncipit = px.filter((d) => 'incipit' in d);
    expect(withIncipit).toHaveLength(306 - 12);
    expect(withIncipit.every((d) => d.title === d.incipit)).toBe(true);
  });

  it('satisfies every invariant', () => {
    expect(checkDocuments(px, genres, keywords)).toEqual([]);
  });

  it('leaves the 383 pilot records untouched', () => {
    expect(all).toHaveLength(383);
  });
});

describe('the Pius XI and Pius XII corpora', () => {
  const pxi = load('pius-xi');
  const pxii = load('pius-xii');

  it('holds every formal-shelf document', () => {
    // Pius XI: 161 raw items across seven shelves (30 encyclicals + 2 bulls + 1 brief +
    // 11 apostolic constitutions + 70 apostolic letters + 14 motu proprio + 33 letters).
    // Three merge away: 'Divini cultus sanctitatem' (apost_constitutions) and 'Divini
    // Cultus' (bulls) are the same constitution on Gregorian chant, proven by comparing
    // the Latin opening against its Italian translation (DUPLICATE_MERGES); the letters
    // shelf lists 'Chirografo al Cardinale Pietro Gasparri...sulla firma dei Trattati
    // Lateranensi' twice, under two different URL slugs (_domandato and _lateranensi),
    // both opening with the identical text 'Ci si è domandato se le relazioni...' --
    // confirmed the same letter, merged automatically (pass 1, same shelf+incipit+date);
    // 'Mirabilis Deus' is filed on both apost_letters and briefs (pass 1). 161 - 3 = 158.
    //
    // Pius XII: 254 raw items across eight shelves (41 encyclicals + 1 bull + 2 briefs +
    // 49 apostolic constitutions + 47 apostolic letters + 8 apostolic exhortations + 11
    // motu proprio + 95 letters). Two of the 95 letters carry no printed date at all and
    // are recovered only via their URL slug date (parseShelfIndex's fallback, Task 8;
    // tools/test/shelf.test.ts covers this directly), so all 254 parse. One merges away:
    // 'Iubilaeum maximum. - Indizione del grande Giubileo' is filed on both apost_letters
    // and bulls (pass 1, automatic). 254 - 1 = 253.
    expect(pxi).toHaveLength(158);
    expect(pxii).toHaveLength(253);
  });

  it('recovers an incipit from a glossed heading', () => {
    const an = pxi.find((d) => d.incipit === 'Auspicantibus Nobis')!;
    expect(an.title).toMatch(/^Auspicantibus Nobis in occasione/);
    expect(an.idStatus).toBe('minted');
  });

  it('keeps the more specific shelf for a document filed twice, aliasing the dropped gloss only when the incipit itself differs', () => {
    // 'Mirabilis Deus' is filed bare on apost_letters and glossed ('Mirabilis Deus, col
    // quale il Pontefice attribuisce a Don Giovanni Bosco il titolo di Beato') on briefs.
    // Both extract to the same incipit, so apost_letters (more specific than briefs) wins
    // outright and no alias is recorded -- the seven-way pass-1 pattern from the pilot
    // corpus, not a new mechanism.
    const md = pxi.find((d) => d.incipit === 'Mirabilis Deus')!;
    expect(md.title).toBe('Mirabilis Deus');
    expect(md.idStatus).toBe('minted');
    expect(md.source!.shelf).toBe('apost_letters');
    expect(md.source!.alsoShelvedAs).toEqual(['briefs']);
    expect(md.aliases).toBeUndefined();
  });

  it('leaves genuinely incipit-less headings provisional, with their title intact', () => {
    const prov = [...pxi, ...pxii].filter((d) => d.idStatus === 'provisional');
    expect(prov.length).toBeGreaterThan(0);
    for (const d of prov) {
      expect(d.title.length, d.id).toBeGreaterThan(0);
      expect('incipit' in d, d.id).toBe(false);
      expect(d.id, d.id).toMatch(/-\d{4}-\d{2}-\d{2}(-\d+)?$/);
    }
  });

  it('records each pontificate\'s provisional share as a diagnostic budget', () => {
    // Measured, not asserted against a target: extractIncipit itself is clean here (nine
    // real rule-table bugs fixed in Task 8, zero regression against the 581-heading Leo
    // XIII/Pius X baseline) -- these numbers are almost entirely a genre fact about which
    // shelves this pontificate's `letters` catalog holds, not a parser or rule-table
    // signal. See the per-shelf test below for the actual go/no-go diagnostic.
    const shareOf = (docs: typeof pxi) =>
      docs.filter((d) => d.idStatus === 'provisional').length / docs.length;
    expect(shareOf(pxi)).toBeCloseTo(15 / 158, 5); // 9.5%
    expect(shareOf(pxii)).toBeCloseTo(99 / 253, 5); // 39.1%
  });

  it('flags exactly the shelves that are almost entirely incipit-less, by name', () => {
    // The spec §8 go/no-go diagnostic, replacing a single blended threshold (Task 8,
    // coordinator review): a combined 25% budget conflated "does extractIncipit work?"
    // with "does this shelf hold formal, incipit-bearing documents at all?" A shelf whose
    // provisional rate exceeds ~90% is a scope fact, not a rule-table gap -- Pius XII's
    // `letters` shelf is 94/95 (98.9%) provisional, with zero minted documents, because it
    // is overwhelmingly personal correspondence addressed to named cardinals, bishops,
    // priests and heads of state (`'Lettera al Presidente degli Stati Uniti, Harry S.
    // Truman'`, etc.), never printing a conventional incipit. Every such incipit-less item
    // still lands as a genuine `idStatus: provisional` record -- exactly the mechanism
    // spec §4.2 designed for documents with no conventional name; the shelf is kept (not
    // excluded), and this test exists so a new near-total shelf in a later pontificate
    // fails loudly, as a scope question, instead of hiding inside a blended average.
    const NEAR_TOTAL_THRESHOLD = 0.9;
    const byShelf = new Map<string, { total: number; provisional: number }>();
    for (const d of [...pxi, ...pxii]) {
      const key = `${d.issuerId} ${d.source?.shelf ?? 'flat'}`;
      const entry = byShelf.get(key) ?? { total: 0, provisional: 0 };
      entry.total++;
      if (d.idStatus === 'provisional') entry.provisional++;
      byShelf.set(key, entry);
    }
    const nearTotal = [...byShelf.entries()]
      .filter(([, v]) => v.provisional / v.total > NEAR_TOTAL_THRESHOLD)
      .map(([key]) => key);
    expect(nearTotal).toEqual(['rp:pius-xii letters']);
  });

  it('files them all under the right pope', () => {
    expect(pxi.every((d) => d.issuerId === 'rp:pius-xi')).toBe(true);
    expect(pxi.every((d) => d.id.startsWith('mag:pius-xi/'))).toBe(true);
    expect(pxii.every((d) => d.issuerId === 'rp:pius-xii')).toBe(true);
    expect(pxii.every((d) => d.id.startsWith('mag:pius-xii/'))).toBe(true);
  });

  it('gives every document a non-empty title that contains its incipit, where one is printed', () => {
    // Unlike the pilot corpus (bare incipits almost everywhere, one genuine gloss) and
    // Pius X (bare incipits, no gloss at all), most Pius XI/XII headings genuinely are
    // genre phrase + incipit + descriptive gloss (spec §4.2) -- title keeps the full
    // heading, incipit keeps only the opening words, so title === incipit is the
    // exception here, not the rule (only 101 of 143 pxi, 102 of 154 pxii titled documents
    // match exactly). A leading genre phrase (e.g. 'Motu Proprio Cum Proxime, sulle
    // nuove...') also means the title does not always *start with* the incipit either --
    // what must always hold is that the title contains it somewhere.
    for (const docs of [pxi, pxii]) {
      expect(docs.every((d) => typeof d.title === 'string' && d.title.length > 0)).toBe(true);
      const withIncipit = docs.filter((d) => 'incipit' in d);
      expect(withIncipit.every((d) => d.title.includes(d.incipit!))).toBe(true);
    }
  });

  it('satisfies every invariant', () => {
    expect(checkDocuments([...pxi, ...pxii], genres, keywords)).toEqual([]);
  });

  it('leaves the 383 pilot and 306 Pius X records untouched', () => {
    expect(all).toHaveLength(383);
    expect(load('pius-x')).toHaveLength(306);
  });
});

describe('the Benedict XV corpus', () => {
  const bxv = load('benedict-xv');

  it('holds every formal-shelf document', () => {
    // 68 raw items across seven shelves (12 encyclicals + 4 bulls + 9 briefs + 5
    // apost-constitutions [hyphenated -- the only pope who spells this shelf that way,
    // spec §2.5] + 24 apost_letters + 3 apost_exhortations + 11 motu_proprio). The
    // year-partitioned `letters` shelf is out of scope (spec §2.7). Five merge away:
    //   - 'Incruentum Altaris' (bulls + apost-constitutions, same incipit and date --
    //     pass 1, automatic);
    //   - 'Divina disponente' (apost_letters + bulls, same incipit and date -- pass 1,
    //     automatic);
    //   - 'Quod nobis' / 'Quod nobis in condendo' (briefs + apost_letters, proven by the
    //     shared vatican.va document-slug 'quod-nobis' -- pass 2, automatic);
    //   - 'Sedis huius' (bulls) into 'Bracarensis' (apost-constitutions, which wins
    //     keepMoreSpecific once SHELF_SPECIFICITY ranks the hyphenated shelf beside
    //     apost_constitutions -- Task 12 review): proven by comparing full texts -- both
    //     approve the same revised Bracarense Breviary for the Archdiocese of Braga,
    //     addressed to the same archbishop, closing with the same dating formula in Latin
    //     and Italian (DUPLICATE_MERGES);
    //   - 'In Africam quisnam' (briefs, its own incipit once the ', sul ' gloss connector
    //     was added -- Task 12 review) into 'In Africam' (apost_letters): proven by
    //     comparing full texts -- both beatify the same twenty-two Ugandan martyrs,
    //     closing with the same dating formula (DUPLICATE_MERGES).
    // 68 - 5 = 63.
    expect(bxv).toHaveLength(63);
  });

  it('files them all under the right issuer', () => {
    expect(bxv.every((d) => d.issuerId === 'rp:benedict-xv')).toBe(true);
    expect(bxv.every((d) => d.id.startsWith('mag:benedict-xv/'))).toBe(true);
  });

  it('gives every document a title', () => {
    expect(bxv.every((d) => typeof d.title === 'string' && d.title.length > 0)).toBe(true);
  });

  it('omits the incipit exactly when the id is provisional', () => {
    // Every Benedict XV heading in scope prints a bare incipit (unlike Pius XI/XII):
    // zero provisional ids once the two genuine duplicates above are merged away rather
    // than minted as their own incipit-less records.
    for (const d of bxv) {
      expect('incipit' in d, d.id).toBe(d.idStatus === 'minted');
    }
    expect(bxv.filter((d) => d.idStatus === 'provisional')).toHaveLength(0);
  });

  it('adjudicates two printed/slug date mismatches from each document\'s own dating formula', () => {
    // 'Ad Christifidelium Bonum' (apost-constitutions) reads 'Datum Romae apud Sanctum
    // Petrum, anno Domini millesimo nongentesimo vigesimo primo, die trigesima mensis
    // septembris, Pontificatus Nostri anno octavo' -- 30 September 1921, 8th year of the
    // pontificate (Benedict XV was elected 3 September 1914, so his 8th year runs
    // 1921-09-03 to 1922-09-02; the shelf's printed year, 1922, falls after his death on
    // 22 January 1922 and cannot be right). The apost-constitutions shelf's printed date
    // (30 September 1922) is the error; the URL slug (1921) is correct.
    const acb = bxv.find((d) => d.incipit === 'Ad christifidelium bonum')!;
    expect(acb.date).toBe('1921-09-30');

    // 'Supremi Apostolatus' (apost_letters) reads 'Datum Romae apud sanctum Petrum sub
    // annulo Piscatoris, die XVII aprilis MCMXX, Pontificatus Nostri anno sexto' -- 17
    // April 1920, 6th year of the pontificate (1919-09-03 to 1920-09-02, consistent).
    // The apost_letters shelf's printed date (16 April) is the error; the URL slug (17
    // April) is correct.
    const sa = bxv.find((d) => d.incipit === 'Supremi Apostolatus')!;
    expect(sa.date).toBe('1920-04-17');
  });

  it('preserves four adjudicated-distinct same-date pairs as separate documents', () => {
    const byDate = (date: string) => bxv.filter((d) => d.date === date);

    // 1920-02-20: Ordo a divo (apost_letters, a new Benedictine congregation) vs
    // Treiensis (apost-constitutions, uniting the dioceses of Treia and San Severino).
    expect(byDate('1920-02-20').map((d) => d.incipit).sort())
      .toEqual(['Ordo a divo', 'Treiensis']);

    // 1919-05-14: In Hac Tanta (encyclicals, the St Boniface centenary) vs Bracarensis
    // (apost-constitutions, the Braga Breviary -- already carrying its bulls twin Sedis
    // huius as alsoShelvedAs, per DUPLICATE_MERGES above).
    const g1919 = byDate('1919-05-14');
    expect(g1919.map((d) => d.incipit).sort()).toEqual(['Bracarensis', 'In Hac Tanta']);
    const bracarensis = g1919.find((d) => d.incipit === 'Bracarensis')!;
    expect(bracarensis.aliases).toEqual(['Sedis huius']);
    expect(bracarensis.source!.alsoShelvedAs).toEqual(['bulls']);

    // 1920-09-15: Cum in honorem (apost_letters, a specific liturgical triduum for the
    // St Jerome centenary) vs Spiritus Paraclitus (encyclicals, the doctrinal encyclical
    // on Scripture for the same centenary) -- two distinct acts for one occasion.
    expect(byDate('1920-09-15').map((d) => d.incipit).sort())
      .toEqual(['Cum in honorem', 'Spiritus Paraclitus']);

    // 1920-05-23: Ex quo Ecclesia (apost_letters, beatifying Oliver Plunkett) vs Pacem,
    // Dei Munus Pulcherrimum (encyclicals, the post-WWI peace encyclical).
    expect(byDate('1920-05-23').map((d) => d.incipit).sort())
      .toEqual(['Ex quo Ecclesia', 'Pacem, Dei Munus Pulcherrimum']);
  });

  it("hyphenates the apost-constitutions shelf, uniquely to this pope, and maps it to the same genre", () => {
    const constitutions = bxv.filter((d) => d.source?.shelf === 'apost-constitutions');
    expect(constitutions.length).toBeGreaterThan(0);
    expect(constitutions.every((d) => d.genre === 'papal-bull')).toBe(true);
    expect(constitutions.every((d) => d.characteristics?.includes('apostolic-constitution')))
      .toBe(true);
  });

  it('keeps the apostolic-constitution characteristic on a document merged across apost-constitutions and bulls (Task 12 review)', () => {
    // A filter on source.shelf === 'apost-constitutions' (the test above) cannot see a
    // regression here on its own: SHELF_SPECIFICITY must rank the hyphenated shelf beside
    // 'apost_constitutions' (run.ts) for these two merged documents to keep
    // characteristics: ['apostolic-constitution'] at all, since 'bulls' alone maps to no
    // characteristics (genres.ts). Checked directly by incipit, independent of which
    // shelf wins the merge.
    for (const incipit of ['Incruentum Altaris', 'Bracarensis']) {
      const d = bxv.find((doc) => doc.incipit === incipit)!;
      expect(d, incipit).toBeDefined();
      expect(d.genre, incipit).toBe('papal-bull');
      expect(d.characteristics, incipit).toContain('apostolic-constitution');
      expect(
        [d.source!.shelf, ...(d.source!.alsoShelvedAs ?? [])].sort(),
        incipit,
      ).toEqual(['apost-constitutions', 'bulls']);
    }
  });

  it('satisfies every invariant', () => {
    expect(checkDocuments(bxv, genres, keywords)).toEqual([]);
  });

  it('leaves the 383 pilot, 306 Pius X, and 158/253 Pius XI/XII records untouched', () => {
    expect(all).toHaveLength(383);
    expect(load('pius-x')).toHaveLength(306);
    expect(load('pius-xi')).toHaveLength(158);
    expect(load('pius-xii')).toHaveLength(253);
  });
});
