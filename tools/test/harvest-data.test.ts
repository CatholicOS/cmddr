import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { checkDocuments } from '../src/validate/invariants.js';
import { parseShelfIndex } from '../src/harvest/shelf.js';
import { shelvesFor, isErectionCandidate } from '../src/mappings/index.js';
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

  it("keeps 'Vicario sulla terra' immune to the bare ' sul ' GLOSS_CONNECTORS entry (Task 17 review)", () => {
    // ' sul ' (no trailing 'la') was added to GLOSS_CONNECTORS in Task 17 review to
    // recover John Paul II's 'Rosarium Virginis Mariae'. 'Vicario sulla terra' is
    // structurally immune: the connector's own trailing space means it can only match
    // ' sul ' followed by a non-'la' word, never the substring inside 'sulla '.
    const vst = all.find((d) => d.incipit === 'Vicario sulla terra');
    expect(vst?.id).toBe('mag:leo-xiii/vicario-sulla-terra-1887');
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

describe('the John XXIII corpus', () => {
  const docs = load('john-xxiii');

  it('holds every formal-shelf document, including the year-partitioned shelves', () => {
    // 178 raw items across five shelves: 8 encyclicals + 3 apost_exhortations +
    // 14 motu_proprio (all three aggregate pages) + 48 apost_constitutions (year pages
    // 1958-1962: 8+36+2+1+1) + 105 apost_letters (year pages 1958-1963: 4+40+50+9+1+1).
    // apost_constitutions and apost_letters are the first shelves in this whole corpus
    // whose own aggregate index carries no div.item at all (resolveShelfPages falls
    // through to their year pages -- see the traversal test below). One merges away:
    //   - a devotional pamphlet ('Piccolo saggio di devoti pensieri...') filed on
    //     apost_letters as a formal supplement to 'Il religioso convegno' (also
    //     apost_letters), proven by the shared vatican.va document slug 'religioso-
    //     convegno' -- pass 2, automatic/mechanical, no hand curation needed.
    // 178 - 1 = 177.
    expect(docs).toHaveLength(177);
  });

  it('files them all under the right issuer', () => {
    expect(docs.every((d) => d.issuerId === 'rp:john-xxiii')).toBe(true);
    expect(docs.every((d) => d.id.startsWith('mag:john-xxiii/'))).toBe(true);
  });

  it('gives every document a title', () => {
    expect(docs.every((d) => typeof d.title === 'string' && d.title.length > 0)).toBe(true);
  });

  it('omits the incipit exactly when the id is provisional', () => {
    for (const d of docs) {
      expect('incipit' in d, d.id).toBe(d.idStatus === 'minted');
    }
    // 21 of 177 (11.9%) carry no recoverable incipit -- overwhelmingly circumscription
    // acts (new dioceses/prefectures/vicariates named only by a bare Latin toponym with
    // no printed incipit) and motu proprio/apost_letters items whose heading opens with
    // a restated genre phrase ('Lettera Apostolica «Motu Proprio» ...') followed
    // directly by a gloss, with nothing capitalised in between. Each was checked by hand
    // against its own vatican.va heading. Started at 35 (of 178 raw items, before the
    // Piccolo saggio/Il religioso convegno merge below). Two flipped to minted in the
    // original pass (Iam in Pontificatus, Quotiescumque Nobis -- see the ', la Sacra
    // Gerarchia' test below; Cum inde was already minted, just with the wrong incipit,
    // so fixing it did not change this count): 35 -> 33. The Task 13 review then
    // authorised two further, measured rule-table fixes: eleven more via
    // CUT_GUARD_EXEMPT (see below) and one via MID_ADDRESS_MIN_WORDS (Quod Dilectum, see
    // below): 33 - 11 - 1 = 21. The remaining 21 are correct: each heading genuinely
    // prints no incipit (see task-13-report.md for the ones investigated and
    // deliberately left this way, e.g. the hyphenated two-toponym shape).
    expect(docs.filter((d) => d.idStatus === 'provisional')).toHaveLength(21);
  });

  it('reads the year-partitioned shelves, whose aggregate index carries no items', () => {
    const apc = docs.filter((d) => d.source?.shelf === 'apost_constitutions');
    expect(apc.length).toBeGreaterThan(0);
    expect(docs.some((d) => d.incipit === 'Veterum Sapientia')).toBe(true);
  });

  it('adjudicates three printed/slug date mismatches from each document\'s own dating formula', () => {
    // 'Portus Alexii et Vevakensis' reads 'Datum Romae, apud S. Petrum, die duodevicesimo
    // mensis Iunii, anno Domini millesimo nongentesimo quinquagesimo nono, Pontificatus
    // Nostri primo' -- 18 June 1959, 1st year of the pontificate (John XXIII was elected
    // 28 October 1958, so his 1st year runs 1958-10-28 to 1959-10-27). The printed date
    // is correct; the apost_constitutions shelf's URL slug (19590612, 12 June) is wrong.
    const pa = docs.find((d) => d.incipit === 'Portus Alexii et Vevakensis (Gorokaensis, Montis Hagensis, Laensis)')!;
    expect(pa.date).toBe('1959-06-18');

    // 'Haud raro' prints '(24 ottobre 2008)' -- a manifest transcription typo (2008 for
    // 1959): its own dating formula reads 'die XXIV mensis Octobris, anno MCMLIX,
    // Pontificatus Nostri primo' (24 October 1959, 1st year -- consistent). The
    // apost_letters shelf's URL slug (19591024) is correct.
    const hr = docs.find((d) => d.incipit === 'Haud raro')!;
    expect(hr.date).toBe('1959-10-24');

    // 'Luce collustrans' reads 'die XXII mensis Decembris, anno MCMLX, Pontificatus
    // Nostri tertio' -- 22 December 1960, 3rd year of the pontificate (1960-10-28 to
    // 1961-10-27, consistent). The printed date is correct; the apost_letters shelf's
    // URL slug (19601216, 16 December) is wrong.
    const lc = docs.find((d) => d.incipit === 'Luce collustrans')!;
    expect(lc.date).toBe('1960-12-22');
  });

  it('preserves thirteen adjudicated-distinct same-date cross-shelf pairs as separate documents', () => {
    // This pontificate's apost_constitutions and apost_letters shelves routinely batch
    // several unrelated circumscription/patronage acts on one day; each pair below is
    // proven distinct by its own printed descriptive clause (see adjudicated-distinct.ts).
    const byDate = (date: string) => docs.filter((d) => d.date === date);

    // 1959-05-23: a five-document batch (two apost_constitutions erections, three
    // apost_letters patronage/basilica grants) -- all ten cross-shelf pairs adjudicated.
    const g0523 = byDate('1959-05-23');
    expect(g0523).toHaveLength(5);
    expect(g0523.map((d) => d.incipit ?? d.title).sort()).toEqual([
      'Angelorum - Mexicanae (Tlaxcalensis), con la quale viene eretta la diocesi di '
        + "Tlaxcala in Messico, ricavandone il territorio dalle arcidiocesi di Città del "
        + 'Messico e di Puebla de los Ángeles',
      'Augustae Virgini', 'Potiora inter', 'Urbs Roma', 'Verae Crucis',
    ]);

    expect(byDate('1959-05-21').map((d) => d.incipit).sort())
      .toEqual(['De Diego Suarez', 'Plantaria Novella']);
    expect(byDate('1959-05-04').map((d) => d.incipit).sort())
      .toEqual(['Caritatis Unitas', 'Nagasakiensis (Qui cotidie)']);
    expect(byDate('1959-01-10').map((d) => d.incipit).sort())
      .toEqual(['Changanacherrensis et aliarum', 'Cuschensis (Sicuanensi)', 'Gaudii nuntia']);
    expect(byDate('1960-07-25').map((d) => d.incipit ?? d.title).sort()).toEqual([
      'Expedit sane',
      'Lettera Apostolica «Motu Proprio» Rubricarum Instructum con la quale si approva il '
        + 'nuovo Codice delle Rubriche del Breviario e del Messale Romano',
      'Qui servatorem',
    ]);
    expect(byDate('1960-02-29').map((d) => d.incipit ?? d.title).sort()).toEqual([
      'De Pontificio Consilio Ecclesiasticis Italiae Tabularis curandis Motu proprio che '
        + 'stabilisce il riordinamento degli Archivi Ecclesiastici in Italia ed emana il '
        + 'nuovo Statuto',
      'Diuturno usu',
    ]);
  });

  it('recovers an incipit trailed by a bare genre restatement (Task 13 review)', () => {
    // 'Cum inde Motu Proprio che conferisce al Pontificio Ateneo Lateranense il titolo di
    // "Universitas"' (docSlug cum-inde): without the ' Motu Proprio che ' connector, the
    // bare ' al ' connector already in GLOSS_CONNECTORS still cut, but much later --
    // wrongly minting 'Cum inde Motu Proprio che conferisce' as if 'al Pontificio
    // Ateneo...' were an address salutation, which it is not.
    const d = docs.find((doc) => doc.incipit === 'Cum inde')!;
    expect(d).toBeDefined();
    expect(d.id).toBe('mag:john-xxiii/cum-inde-1959');
  });

  it('recovers a genuine incipit that would otherwise be silently minted with its gloss baked in, or wrongly nulled (Task 13 review)', () => {
    // 'Sacrarum Expeditionum, la Sacra Gerarchia istituita nell'Indonesia' (docSlug
    // sacrarum-expeditionum, confirmed against the document's own printed title): at only
    // seven words, this heading sneaks under MAX_INCIPIT_WORDS on the untouched path
    // without the ', la Sacra Gerarchia' connector, so it was silently minted with the
    // whole gloss baked into its id -- the dangerous failure mode, not merely a missed
    // incipit.
    const se = docs.find((doc) => doc.incipit === 'Sacrarum expeditionum')!;
    expect(se).toBeDefined();
    expect(se.id).toBe('mag:john-xxiii/sacrarum-expeditionum-1961');

    // 'Iam in Pontificatus, la Sacra Gerarchia istituita nel Vietnam' (docSlug
    // iam-in-pontificatus): the same connector, nine words, correctly provisional before
    // the fix but minted correctly after it.
    const ip = docs.find((doc) => doc.incipit === 'Iam in Pontificatus')!;
    expect(ip).toBeDefined();
    expect(ip.id).toBe('mag:john-xxiii/iam-in-pontificatus-1961');

    // 'Quotiescumque Nobis, lo sviluppo della Sacra Gerarchia nell'Isola di Formosa'
    // (docSlug quotiescumque, confirmed against the document's own printed title
    // 'Quotiescumque Nobis, Epistula Apostolica ob tres dioeceses in Insula Formosa
    // noviter erectas'): the sibling ', lo sviluppo della Sacra Gerarchia' connector.
    const qn = docs.find((doc) => doc.incipit === 'Quotiescumque nobis')!;
    expect(qn).toBeDefined();
    expect(qn.id).toBe('mag:john-xxiii/quotiescumque-nobis-1961');
  });

  it('recovers eleven one-word-before-the-comma incipits via CUT_GUARD_EXEMPT (Task 13 review)', () => {
    // Each of these headings has exactly one word before its earliest gloss connector
    // (' con la quale' or ', che '), which MIN_WORDS_BEFORE_CUT would otherwise reject
    // wholesale -- but that connector is itself a multi-word relative-clause marker that
    // can never continue an incipit, so the guard was never protecting anything genuine
    // here (unlike ' sulla '/' - '/': ', which really can be ambiguous at one word --
    // see task-13-report.md for the measured, rejected broader exemption).
    const recovered = [
      'Liberopolitanae', 'Culiacanensis', 'Oturkpoënsis', 'Botucatuensis', 'Munduensis',
      'Chihuahuensis', 'Hiroshimaënsis', 'Nzerekoreensis', 'Praecipuo', 'Quemadmodum',
      'Praeclarissimum',
    ];
    for (const incipit of recovered) {
      const d = docs.find((doc) => doc.incipit === incipit);
      expect(d, incipit).toBeDefined();
      expect(d!.idStatus, incipit).toBe('minted');
    }
  });

  it('recovers Quod Dilectum via MID_ADDRESS_MIN_WORDS, while a Pius XI address salutation stays null (Task 13 review)', () => {
    // 'Quod Dilectum, al Card. V. Gracias in occasione dell'adunanza quinquennale
    // dell'Episcopato dell'India' has only two words ('Quod Dilectum') before its comma-
    // introduced address, unlike the three genuine Pius XI narrative-address precedents
    // (three words each). Its own URL slug quod-dilectum -- incipit-based, not
    // addressee-based -- proves it is a real incipit.
    const qd = docs.find((doc) => doc.incipit === 'Quod Dilectum');
    expect(qd).toBeDefined();
    expect(qd!.id).toBe('mag:john-xxiii/quod-dilectum-1960');

    // Pin the boundary in the other direction too: Pius XI's 'Lettera Avendo Noi
    // creduto, al Card. Eugenio Pacelli...' (docSlug card-pacelli, addressee-based --
    // three words before the comma) must stay provisional; MID_ADDRESS_MIN_WORDS must
    // not have widened far enough to also recover it.
    const pxi = load('pius-xi');
    const avendo = pxi.find((doc) => doc.title.startsWith('Lettera Avendo Noi creduto'));
    expect(avendo).toBeDefined();
    expect(avendo!.idStatus).toBe('provisional');
  });

  it('satisfies every invariant', () => {
    expect(checkDocuments(docs, genres, keywords)).toEqual([]);
  });

  it('leaves the 383 pilot, 306 Pius X, 158/253 Pius XI/XII, and 63 Benedict XV records untouched', () => {
    expect(all).toHaveLength(383);
    expect(load('pius-x')).toHaveLength(306);
    expect(load('pius-xi')).toHaveLength(158);
    expect(load('pius-xii')).toHaveLength(253);
    expect(load('benedict-xv')).toHaveLength(63);
  });
});

describe('the Paul VI corpus', () => {
  const docs = load('paul-vi');

  it('holds every formal-shelf document', () => {
    // 692 raw items across five shelves: 7 encyclicals + 354 apost_constitutions +
    // 270 apost_letters + 12 apost_exhortations + 49 motu_proprio (every fixture's own
    // div.item count matches the task brief's expected aggregate exactly -- no
    // year-partitioning here, unlike John XXIII). Four merge away: Africae terrarum
    // (1967-10-29), Causas matrimoniales (1971-03-28), Apostolatus peragendi
    // (1976-12-10) and Iustitiam et pacem (1976-12-10) are each filed on both
    // apost_letters and motu_proprio under the same incipit and date (pass 1,
    // automatic/mechanical -- apost_letters, the more specific shelf, wins
    // keepMoreSpecific and the motu_proprio filing is recorded as alsoShelvedAs).
    // 692 - 4 = 688.
    expect(docs).toHaveLength(688);
  });

  it('files them all under the right issuer', () => {
    expect(docs.every((d) => d.issuerId === 'rp:paul-vi')).toBe(true);
    expect(docs.every((d) => d.id.startsWith('mag:paul-vi/'))).toBe(true);
  });

  it('gives every document a title', () => {
    expect(docs.every((d) => typeof d.title === 'string' && d.title.length > 0)).toBe(true);
  });

  it('omits the incipit exactly when the id is provisional', () => {
    for (const d of docs) {
      expect('incipit' in d, d.id).toBe(d.idStatus === 'minted');
    }
    // Only 8 of 688 (1.2%) carry no recoverable incipit -- a low rate given the volume,
    // but not the silent-mint trap a low rate can otherwise hide (Task 14 review): every
    // one of the 680 minted incipits was checked for gloss contamination (any minted
    // incipit six words or longer, or containing a known gloss-connector substring) and
    // none were found -- the apparent "long incipit" hits are all genuine multi-word
    // Roman titular-church designations ('Urbis (Templum ...)') or genuine multi-word
    // Latin toponym lists, not truncated glosses. Two real gloss-contamination bugs were
    // caught and fixed instead of silently landing in this count: a bare trailing
    // ', <day> <month> <year>' date with no enclosing parens (shelf.ts) previously rode
    // into the incipit uncut ('Multiformis Sapientia Dei, 27 settembre 1970'; 'Mirabilis
    // in Ecclesia Deus, 4 ottobre 1970' -- both now correctly minted as their bare
    // incipits), and stripping that date off a third heading ('Nomina del Card. Ugo
    // Poletti a Vicario Generale, 6 marzo 1973') incidentally left an 8-word residue that
    // sneaked under MAX_INCIPIT_WORDS and was wrongly minted -- fixed by adding 'Nomina
    // del' to NARRATIVE_OPENERS (incipit-rules.ts), the same failure shape as 'Iam in
    // Pontificatus' in the John XXIII corpus. The remaining 8 are correct: each heading
    // genuinely prints no incipit (see task-14-report.md).
    expect(docs.filter((d) => d.idStatus === 'provisional')).toHaveLength(8);
  });

  it('flags the diocese erections as candidates without tagging any of them', () => {
    // The headings print a bare Latin toponym with no marker, so nothing is tagged
    // until the curation pass. Documents with real names must not be flagged.
    expect(docs.every((d) => d.keywords === undefined)).toBe(true);
    expect(docs.some((d) => d.incipit === 'Indulgentiarum Doctrina')).toBe(true);
    expect(docs.some((d) => d.incipit === 'Romano Pontifici Eligendo')).toBe(true);
  });

  it('deduplicates the four twice-shelved apost_letters/motu_proprio documents', () => {
    const twice = docs.filter((d) => (d.source?.alsoShelvedAs?.length ?? 0) > 0);
    expect(twice).toHaveLength(4);
    expect(twice.map((d) => d.incipit).sort()).toEqual([
      'Africae terrarum', 'Apostolatus peragendi', 'Causas matrimoniales', 'Iustitiam et pacem',
    ]);
    for (const d of twice) {
      expect(d.source!.shelf).toBe('apost_letters');
      expect(d.source!.alsoShelvedAs).toEqual(['motu_proprio']);
    }
  });

  it('re-mints with a full date when two same-year documents share an incipit', () => {
    // Five distinct 'Quantum utilitatis' letters share this pontificate; two of them
    // (1967-07-27 and 1967-08-19) also share a year, so mintId's default year-only
    // suffix would collide -- resolved (invariant 11) by re-minting every id in the
    // colliding group with its full date.
    const qu = docs.filter((d) => d.incipit === 'Quantum utilitatis');
    expect(qu).toHaveLength(5);
    expect(qu.map((d) => d.id).sort()).toEqual([
      'mag:paul-vi/quantum-utilitatis-1966',
      'mag:paul-vi/quantum-utilitatis-1967-07-27',
      'mag:paul-vi/quantum-utilitatis-1967-08-19',
      'mag:paul-vi/quantum-utilitatis-1967-10-31',
      'mag:paul-vi/quantum-utilitatis-1971',
    ]);
  });

  it("adjudicates all fifteen printed/slug date mismatches from each document's own dating formula", () => {
    // A representative sample; the full set of fifteen resolved entries is in
    // DATE_CORRECTIONS (corrections.ts). Two of the fifteen -- 'Merito celebratur' and
    // 'Amor dulcissimus' -- needed an extra step: the shelf index's own <a> for each row
    // is mislinked to an unrelated document (an Iraq-nunciature letter; a beatification
    // letter), so the printed/slug mismatch itself is a broken-href artifact, not either
    // document's own error. Both documents' real pages were found by guessing this
    // shelf's own naming convention rather than following the broken link, and confirmed
    // by fetching them directly -- see corrections.ts and task-14-report.md.
    const bySlugDate = (incipit: string) => docs.find((d) => d.incipit === incipit)!;
    expect(bySlugDate('Insularum Sancti Petri et Miquelonensis').date).toBe('1970-11-16');
    expect(bySlugDate('Gruardensis et aliarum').date).toBe('1967-07-13');
    expect(bySlugDate('Bauropolitanae').date).toBe('1964-02-15');
    expect(bySlugDate('Quam recte').date).toBe('1977-10-25');
    expect(bySlugDate('Opera bona').date).toBe('1968-01-27');
    expect(bySlugDate('Merito celebratur').date).toBe('1966-10-10');
    expect(bySlugDate('Amor dulcissimus').date).toBe('1965-10-23');
    expect(bySlugDate('Equestres Ordines').date).toBe('1966-04-15');
  });

  it('strips a bare trailing date with no enclosing parens instead of baking it into the incipit', () => {
    // Task 14 review: these two headings print their date directly after a comma, with
    // no parentheses at all -- the shape every other shelf in the corpus wraps in
    // '(...)'. Confirmed against each item's own URL slug (19700927; 19701004).
    const ms = docs.find((d) => d.incipit === 'Multiformis Sapientia Dei')!;
    expect(ms.date).toBe('1970-09-27');
    expect(ms.title).toBe('Multiformis Sapientia Dei');
    const me = docs.find((d) => d.incipit === 'Mirabilis in Ecclesia Deus')!;
    expect(me.date).toBe('1970-10-04');
    expect(me.title).toBe('Mirabilis in Ecclesia Deus');
  });

  it('recognises a personnel-appointment narrative title as carrying no incipit', () => {
    // 'Nomina del Card. Ugo Poletti a Vicario Generale' ('the appointment of Cardinal
    // Ugo Poletti as Vicar General') is a narration of a personnel act, not an incipit --
    // its own URL slug, nomina-vicario-generale, is as generic as the phrase itself.
    // Once its trailing date is correctly stripped (see the test above), the ten-word
    // heading falls to exactly eight words -- sneaking under MAX_INCIPIT_WORDS -- so
    // without the NARRATIVE_OPENERS entry added in the Task 14 review, this would have
    // been silently minted instead of correctly landing as provisional.
    const d = docs.find((doc) => doc.title.startsWith('Nomina del Card. Ugo Poletti'))!;
    expect(d).toBeDefined();
    expect(d.idStatus).toBe('provisional');
    expect('incipit' in d).toBe(false);
  });

  it('satisfies every invariant', () => {
    expect(checkDocuments(docs, genres, keywords)).toEqual([]);
  });

  it('leaves the 383 pilot, 306 Pius X, 158/253 Pius XI/XII, 63 Benedict XV, and 177 John XXIII records untouched', () => {
    expect(all).toHaveLength(383);
    expect(load('pius-x')).toHaveLength(306);
    expect(load('pius-xi')).toHaveLength(158);
    expect(load('pius-xii')).toHaveLength(253);
    expect(load('benedict-xv')).toHaveLength(63);
    expect(load('john-xxiii')).toHaveLength(177);
  });
});

describe('the John Paul I corpus', () => {
  const docs = load('john-paul-i');

  it('holds every formal-shelf document', () => {
    // 7 raw items across two shelves (3 apost_letters + 4 letters -- both fixtures'
    // div.item counts match the task brief's expected aggregate exactly). Every heading
    // on both shelves is a narrative Italian description ('Lettera Apostolica per la
    // costituzione...', 'Lettera a Mons. Hugo Aufderbeck...'), never an incipit, so
    // nothing shares an incipit-slug-and-date key and none of the three merge passes
    // fires. The only same-date collisions are three items sharing 1978-09-01 across
    // apost_letters and letters, each adjudicated as a genuinely distinct act (see
    // below) rather than merged. 7 raw items in, zero merged away: 7.
    expect(docs).toHaveLength(7);
  });

  it('files them all under the right issuer', () => {
    expect(docs.every((d) => d.issuerId === 'rp:john-paul-i')).toBe(true);
    expect(docs.every((d) => d.id.startsWith('mag:john-paul-i/'))).toBe(true);
  });

  it('gives every document a title', () => {
    expect(docs.every((d) => typeof d.title === 'string' && d.title.length > 0)).toBe(true);
  });

  it('mints no incipit at all -- every heading is a narrative description, not the shortest pontificate hiding a silent-mint bug', () => {
    // All 7 of 7 (100%) are provisional -- the opposite extreme from a suspiciously low
    // rate, and checked individually rather than sampled (only 7 documents). Every
    // heading on both shelves opens with the genre word ('Lettera'/'Lettera Apostolica')
    // followed by a lower-case narrative continuation ('per la costituzione...', 'in
    // occasione...', 'a Mons. ...', 'ai Vescovi...', 'al Card. ...') -- extractIncipit's
    // own lower-case-residue rule (incipit.ts) correctly declines to mint from any of
    // them. This is a genre fact confirmed by fetching all 7 documents directly from
    // vatican.va: three of them (Cum probe, Propterea maxime, Progredientibus iam) do
    // open with a genuine Latin incipit in their own body text, printed nowhere on the
    // index page -- consistent with how extractIncipit works everywhere else in this
    // pipeline (heading text only, never the URL slug or the document body), so this is
    // not a parser gap.
    expect(docs.filter((d) => d.idStatus === 'provisional')).toHaveLength(7);
    expect(docs.every((d) => 'incipit' in d === false)).toBe(true);
    expect(new Set(docs.map((d) => d.id)).size).toBe(7);
  });

  it('emits no printed/slug date-mismatch warnings for either shelf', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let calls: unknown[][];
    try {
      for (const shelf of shelvesFor('john-paul-i')) {
        parseShelfIndex(
          readFileSync(`tools/fixtures/john-paul-i-${shelf}.html`, 'utf8'), 'john-paul-i', shelf);
      }
    } finally {
      calls = warnSpy.mock.calls;
      warnSpy.mockRestore();
    }
    const mismatches = calls.filter(([msg]) => String(msg).includes('date mismatch'));
    expect(mismatches).toEqual([]);
    // Confirmed by fetching all 7 documents directly: every printed date in the shelf
    // index agrees with its own URL slug's date reading, so DATE_CORRECTIONS needs no
    // entry for this pontificate.
  });

  it('preserves the three same-date (1978-09-01) documents as distinct, not merged', () => {
    // Two apost_letters items (Propterea maxime, Itabirito/Brasile; Progredientibus iam,
    // Piacenza) and one letters item (the Ratzinger legation letter) all fall on 1
    // September 1978, the first day of the pontificate. Each was fetched directly and
    // is a genuinely unrelated act (see ADJUDICATED_DISTINCT for the full evidence).
    const sameDate = docs.filter((d) => d.date === '1978-09-01');
    expect(sameDate).toHaveLength(3);
    expect(sameDate.map((d) => d.source!.shelf).sort()).toEqual([
      'apost_letters', 'apost_letters', 'letters',
    ]);
    expect(new Set(sameDate.map((d) => d.id)).size).toBe(3);
  });

  it('satisfies every invariant', () => {
    expect(checkDocuments(docs, genres, keywords)).toEqual([]);
  });

  it('records the fixture retrieval date for every document', () => {
    expect(docs.every((d) => d.source?.retrieved === '2026-09-07')).toBe(true);
  });

  it('leaves the 383 pilot, 306 Pius X, 158/253 Pius XI/XII, 63 Benedict XV, 177 John XXIII, and 688 Paul VI records untouched', () => {
    expect(all).toHaveLength(383);
    expect(load('pius-x')).toHaveLength(306);
    expect(load('pius-xi')).toHaveLength(158);
    expect(load('pius-xii')).toHaveLength(253);
    expect(load('benedict-xv')).toHaveLength(63);
    expect(load('john-xxiii')).toHaveLength(177);
    expect(load('paul-vi')).toHaveLength(688);
  });
});

describe('the John Paul II corpus', () => {
  const docs = load('john-paul-ii');

  it('holds every formal-shelf document', () => {
    // 1804 raw items across six shelves: 14 encyclicals + 2 bulls + 613 apost_constitutions
    // + 15 apost_exhortations + 31 motu_proprio (five aggregate-page fixtures, each
    // matching the task brief's expected count exactly) + 1129 apost_letters items read
    // through the 28 year pages 1978-2005 (the aggregate apost_letters page itself carries
    // no items of its own -- resolveShelfPages confirms it is year-partitioned). Three
    // merge away: two same-shelf duplicate listings ('Messaggio in occasione del 50°
    // anniversario dell'inizio della II Guerra Mondiale', 1989-08-27; 'Messaggio ai
    // Vescovi sulla situazione civile e politica del Libano', 1989-09-07 -- each printed
    // twice on its own year's apost_letters page under the same incipit and date, pass 1
    // automatic) and one genuine cross-shelf duplicate ('Socialium Scientiarum',
    // 1994-01-01, filed on both apost_letters and motu_proprio, pass 1 automatic).
    // 1804 - 3 = 1801.
    expect(docs).toHaveLength(1801);
  });

  it('files them all under the right issuer', () => {
    expect(docs.every((d) => d.issuerId === 'rp:john-paul-ii')).toBe(true);
    expect(docs.every((d) => d.id.startsWith('mag:john-paul-ii/'))).toBe(true);
  });

  it('gives every document a title', () => {
    expect(docs.every((d) => typeof d.title === 'string' && d.title.length > 0)).toBe(true);
  });

  it('cleans up two ids Task 17 review authorised, sourced from Benedict XVI review', () => {
    // Task 17 (Benedict XVI) found, but did not apply unauthorised, two rule-table gaps
    // that would move existing John Paul II ids. Task 17 review measured both across
    // every heading in every fixture and authorised them:
    //
    // 1. dates.ts's month/year separator relaxed from `\s+` to `\s*`, fixing
    //    'Kumboënsis (18 marzo1982)' (own URL slug: hf_jp-ii_apc_19820318_kumboensis.html
    //    confirms 18 March 1982) -- previously minted with the unparsed parenthetical
    //    baked into the id (kumboensis-18-marzo1982-1982), now clean. The same fix also
    //    corrects the *title* of the unrelated provisional record 'Nuovo ordinamento
    //    giuridico della Basilica di San Nicola di Bari (8 maggio1989)' (its id was
    //    already date-based, not incipit-based, so it is unaffected).
    // 2. A bare ' sul ' GLOSS_CONNECTORS entry, fixing 'Rosarium Virginis Mariae sul
    //    Santo Rosario' -- confirmed the genuine incipit of this 2002 apostolic letter --
    //    previously minted with the gloss baked in
    //    (rosarium-virginis-mariae-sul-santo-rosario-2002).
    //
    // Measured to change nothing else: every other ' sul '-bearing heading in the corpus
    // is already resolved earlier by ' - ', a comma-prefixed connector, or a narrative-
    // opener rule, and 'Vicario sulla terra' (Leo XIII) is structurally immune since
    // ' sul ' with a trailing space is not a substring of 'sulla '.
    const kumbo = docs.find((d) => d.incipit === 'Kumboënsis');
    expect(kumbo?.id).toBe('mag:john-paul-ii/kumboensis-1982');

    const sanNicola = docs.find((d) => d.id === 'mag:john-paul-ii/papal-bull-1989-05-08');
    expect(sanNicola?.title).toBe(
      'Nuovo ordinamento giuridico della Basilica di San Nicola di Bari',
    );
    expect(sanNicola?.idStatus).toBe('provisional');

    const rosarium = docs.find((d) => d.incipit === 'Rosarium Virginis Mariae');
    expect(rosarium?.id).toBe('mag:john-paul-ii/rosarium-virginis-mariae-2002');
  });

  it('reads the 28 year pages of the apostolic letters shelf', () => {
    // apost_letters is year-partitioned 1978-2005 (spec §2.3); resolveShelfPages reads the
    // aggregate page's own year links rather than any items on it (it carries none).
    const apl = docs.filter((d) => d.source?.shelf === 'apost_letters');
    expect(apl.length).toBeGreaterThan(100);
    expect(apl.some((d) => d.date.startsWith('1994'))).toBe(true);
    // Every one of the 28 years is actually represented, not merely the first and last.
    const years = new Set(apl.map((d) => d.date.slice(0, 4)));
    for (let y = 1978; y <= 2005; y++) expect(years.has(String(y)), String(y)).toBe(true);
  });

  it('keeps the named apostolic constitutions minted and distinct from the erections', () => {
    for (const incipit of ['Sapientia Christiana', 'Ex Corde Ecclesiae']) {
      const d = docs.find((x) => x.incipit === incipit);
      expect(d, incipit).toBeDefined();
      expect(d!.idStatus).toBe('minted');
    }
  });

  it('recovers a same-date gloss folded into the same parenthetical as the date, distinguishing a batch of same-incipit letters', () => {
    // 'Christifideles dioecesis (Sancta Victoria - 7 ottobre 1993)' is one of seven
    // apost_letters headings sharing the bare incipit 'Christifideles dioecesis' and the
    // date 7 October 1993, each crowning or confirming a different Marian image or patron
    // saint for a different Polish diocese, distinguished only by a gloss packed into the
    // SAME parenthetical as the date (unlike the two-separate-parens shape already handled
    // for Pius XII's 'Niangaraensis (Dorumaensis)(24 febbraio 1958)'). Before the shelf.ts
    // fix, the gloss was discarded along with the rest of the date parenthetical, and all
    // seven collapsed into one record under the pass-1 merge key; 'Fideles ecclesialis'
    // (six letters, same date) and 'Sancta Christi' (two letters, 4 August 1997) are the
    // same shape. All three groups now survive as fully distinct records.
    const cd = docs.filter(
      (d) => (d.incipit ?? '').startsWith('Christifideles dioecesis') && d.date === '1993-10-07',
    );
    expect(cd).toHaveLength(7);
    expect(new Set(cd.map((d) => d.id)).size).toBe(7);
    const fe = docs.filter(
      (d) => (d.incipit ?? '').startsWith('Fideles ecclesialis') && d.date === '1993-10-07',
    );
    expect(fe).toHaveLength(6);
    const sc = docs.filter((d) => (d.incipit ?? '').startsWith('Sancta Christi'));
    expect(sc).toHaveLength(2);
    // An eighth, unrelated 'Christifideles dioecesis' letter (28 January 1995), and two
    // more unrelated 'Fideles ecclesialis' letters (17 March and 21 September 1994), are
    // separate acts correctly kept distinct by date alone -- not part of either batch.
    expect(docs.filter((d) => (d.incipit ?? '').startsWith('Christifideles dioecesis')))
      .toHaveLength(8);
    expect(docs.filter((d) => (d.incipit ?? '').startsWith('Fideles ecclesialis')))
      .toHaveLength(8);
  });

  it('flags the diocese erections as candidates without tagging any of them', () => {
    // 613 apost_constitutions items, the large majority filed under a bare Latin toponym
    // with no textual marker -- confirming CIRCUMSCRIPTION_ERECTIONS entries for them is
    // Task 20's work, not this one's (see pontiffs.ts). Documents with real names must not
    // be flagged.
    expect(docs.every((d) => d.keywords === undefined)).toBe(true);
  });

  it('omits the incipit exactly when the id is provisional', () => {
    for (const d of docs) {
      expect('incipit' in d, d.id).toBe(d.idStatus === 'minted');
    }
    // 29 of 1801 (1.6%) carry no recoverable incipit -- every one checked individually
    // (not sampled) against its own fetched vatican.va page: five are Latin canonization/
    // beatification decrees whose entire printed heading ('Beato Crispino a Viterbio,
    // Laico professo O.F.M. Capuccinorum, Sanctorum honores decernuntur') is itself the
    // formal proclamation clause, with the document's own prose opening on an unrelated
    // scriptural quotation rather than repeating the heading -- genuinely no incipit to
    // recover, not a parser gap. The rest are Italian narrative titles correctly caught by
    // GENRE_PREFIXES ('Lettera Apostolica', 'Messaggio', 'Epistola Apostolica', 'Motu
    // proprio') stripping to a lower-case residue, or by the MAX_INCIPIT_WORDS ceiling once
    // a disambiguating gloss is folded in (see the previous test) and pushes a heading
    // over eight words. See task-16-report.md for the full per-item review.
    expect(docs.filter((d) => d.idStatus === 'provisional')).toHaveLength(29);
  });

  it('satisfies every invariant', () => {
    expect(checkDocuments(docs, genres, keywords)).toEqual([]);
  });

  it('emits no unadjudicated printed/slug date-mismatch or unmerged same-date warnings', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let calls: unknown[][];
    try {
      for (const shelf of shelvesFor('john-paul-ii')) {
        const index = readFileSync(`tools/fixtures/john-paul-ii-${shelf}.html`, 'utf8');
        if (shelf === 'apost_letters') {
          for (let y = 1978; y <= 2005; y++) {
            parseShelfIndex(
              readFileSync(`tools/fixtures/john-paul-ii-apost_letters-${y}.html`, 'utf8'),
              'john-paul-ii', shelf,
            );
          }
        } else {
          parseShelfIndex(index, 'john-paul-ii', shelf);
        }
      }
    } finally {
      calls = warnSpy.mock.calls;
      warnSpy.mockRestore();
    }
    const mismatches = calls.filter(([msg]) => String(msg).includes('date mismatch'));
    expect(mismatches).toEqual([]);
  });

  it('records the fixture retrieval date for every document', () => {
    expect(docs.every((d) => d.source?.retrieved === '2026-09-07')).toBe(true);
  });

  it('leaves the 383 pilot, 306 Pius X, 158/253 Pius XI/XII, 63 Benedict XV, 177 John XXIII, 688 Paul VI, and 7 John Paul I records untouched', () => {
    expect(all).toHaveLength(383);
    expect(load('pius-x')).toHaveLength(306);
    expect(load('pius-xi')).toHaveLength(158);
    expect(load('pius-xii')).toHaveLength(253);
    expect(load('benedict-xv')).toHaveLength(63);
    expect(load('john-xxiii')).toHaveLength(177);
    expect(load('paul-vi')).toHaveLength(688);
    expect(load('john-paul-i')).toHaveLength(7);
  });
});

describe('the Benedict XVI corpus', () => {
  const docs = load('benedict-xvi');

  it('holds every formal-shelf document', () => {
    // 3 encyclicals + 126 apost_constitutions + 68 apost_letters + 4 apost_exhortations
    // + 13 motu_proprio = 214 raw items, matching the task brief's expected counts on
    // every shelf exactly. All five aggregate pages carry every item directly (div.item
    // > 0 on each fixture), so none is year-partitioned. Zero items merge away: the two
    // same-date cross-shelf pairs found (Gambomensis/Normas Nonnullas, 2013-02-22;
    // the Maria Luisa Prosperi beatification letter/Intima Ecclesiae natura, 2012-11-11)
    // are adjudicated genuinely distinct (ADJUDICATED_DISTINCT), not merged. 214 - 0 = 214.
    expect(docs).toHaveLength(214);
  });

  it('files them all under the right issuer', () => {
    expect(docs.every((d) => d.issuerId === 'rp:benedict-xvi')).toBe(true);
    expect(docs.every((d) => d.id.startsWith('mag:benedict-xvi/'))).toBe(true);
  });

  it('gives every document a title', () => {
    expect(docs.every((d) => typeof d.title === 'string' && d.title.length > 0)).toBe(true);
  });

  it('has no year-partitioned shelf (every fixture is an aggregate page)', () => {
    for (const shelf of shelvesFor('benedict-xvi')) {
      const index = readFileSync(`tools/fixtures/benedict-xvi-${shelf}.html`, 'utf8');
      expect(index.includes('div class="item"'), shelf).toBe(true);
    }
  });

  it('keeps well-known acts minted and distinct from the erection candidates', () => {
    for (const incipit of ['Anglicanorum coetibus', 'Deus caritas est', 'Summorum Pontificum']) {
      const d = docs.find((x) => x.incipit === incipit);
      expect(d, incipit).toBeDefined();
      expect(d!.idStatus).toBe('minted');
    }
  });

  it('recovers one-word incipits before a trailing genre-restatement connector', () => {
    // 'Quaerebam, Lettera Decretale con la quale...' and 'Sapientia, Lettera Decretale
    // con la quale...' each have only one word before ', Lettera Decretale' -- fewer than
    // MIN_WORDS_BEFORE_CUT (2) -- so the cut was discarded and both fell to provisional
    // until ', Lettera Decretale' was added to CUT_GUARD_EXEMPT (Task 17). Both incipits
    // are confirmed genuine by fetching the documents themselves: each opens with its own
    // one-word incipit verbatim ('«Quaerebam excellentissimum...»'; 'Sapientia «in se
    // permanens omnia innovat...»').
    const q = docs.find((d) => d.incipit === 'Quaerebam');
    expect(q?.idStatus).toBe('minted');
    const s = docs.find((d) => d.incipit === 'Sapientia');
    expect(s?.idStatus).toBe('minted');
  });

  it('does not bake a trailing gloss into a minted incipit', () => {
    // Sampled by cross-checking minted incipits against their own URL slugs (task
    // instruction): four genuine gaps found and fixed with evidenced GLOSS_CONNECTORS
    // entries, each confirmed against the document's own text -- 'Anglicanorum coetibus'
    // (' circa ', the item's own URL slug), 'Totius orbis' (' contenente', the document's
    // own printed title), 'Cum pium' (', Lettera Apostolica', both the URL slug and the
    // document's own opening words), and 'Intima Ecclesiae natura' (a bare ' sul '
    // connector, coordinator-authorised after review measured it changes exactly one
    // more record corpus-wide: the already-committed John Paul II 'Rosarium Virginis
    // Mariae' -- see the id-drift test below).
    for (const incipit of ['Anglicanorum coetibus', 'Totius orbis', 'Cum pium', 'Intima Ecclesiae natura']) {
      const d = docs.find((x) => x.incipit === incipit);
      expect(d, incipit).toBeDefined();
      expect(d!.idStatus).toBe('minted');
    }
  });

  it('recovers a clean incipit from a missing-space month/year typo', () => {
    // 'Kayangana (14 agosto2008)' -- vatican.va's own typo drops the space between month
    // and year. Before Task 17 review authorised relaxing dates.ts's month/year
    // separator to `\s*`, the date still resolved (via the URL-slug fallback in
    // shelf.ts), but the unparsed parenthetical rode along into the incipit/id
    // (kayangana-14-agosto2008-2008). Confirmed genuine by the item's own URL slug,
    // hf_ben-xvi_apc_20080814_kayangana.html.
    const d = docs.find((x) => x.incipit === 'Kayangana');
    expect(d).toBeDefined();
    expect(d!.idStatus).toBe('minted');
    expect(d!.id).toBe('mag:benedict-xvi/kayangana-2008');
  });

  it('carries no compact date-range shape in any heading parenthetical', () => {
    // Watch item carried from Task 16's review of the gloss-recovery branch in shelf.ts
    // (headings whose date parenthetical also carries gloss text, e.g. Christi nomen,
    // Lettera Decretale («Beatus Ioannes Baptista Maria Vianney» - 31 maggio 1925)): its
    // guard does not distinguish a bare day-number fragment of a compact date range, e.g.
    // a hypothetical (12-13 gennaio 1994). No heading of that shape existed in any
    // fixture as of Task 16; this fixture set was checked for it too and none exists --
    // every heading's parenthetical is either a single plain date or the already-handled
    // dash-gloss shape.
    for (const shelf of shelvesFor('benedict-xvi')) {
      const html = readFileSync(`tools/fixtures/benedict-xvi-${shelf}.html`, 'utf8');
      const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => m[1]!);
      for (const h2 of h2s) {
        const text = h2.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        const paren = text.match(/\(([^()]*)\)\s*$/);
        if (!paren) continue;
        expect(paren[1], text).not.toMatch(/^\s*\d{1,2}\s*-\s*\d{1,2}\s+[A-Za-zÀ-ÿ]/);
      }
    }
  });

  it('flags the diocese erections as candidates without tagging any of them', () => {
    // 126 apost_constitutions items, the large majority filed under a bare Latin toponym
    // with no textual marker -- confirming CIRCUMSCRIPTION_ERECTIONS entries for them is
    // Task 20's work, not this one's (see pontiffs.ts).
    expect(docs.every((d) => d.keywords === undefined)).toBe(true);
  });

  it('omits the incipit exactly when the id is provisional', () => {
    for (const d of docs) {
      expect('incipit' in d, d.id).toBe(d.idStatus === 'minted');
    }
    // 34 of 214 (15.9%) carry no recoverable incipit -- every one reviewed against its own
    // heading text. All fall into two already-established genres with no Latin incipit at
    // all: 'Lettera Apostolica/Decretale con la quale il Sommo Pontefice ha iscritto
    // all'albo dei Beati/Santi <name>' (beatification/canonization announcements naming
    // only the honoree, 25 records) and narrative 'Lettera Apostolica'/'Motu Proprio'
    // openers describing the act in the third person (9 records, e.g. 'Motu Proprio per
    // l'approvazione e la pubblicazione del Compendio del Catechismo della Chiesa
    // Cattolica'). One further apost_constitutions heading, 'Sancti Vladimiri Magni in
    // urbe Parisiensi pro Ucrainis ritus Byzantini', is a bare descriptive name of the
    // erected exarchate with no separable incipit, the same shape as John Paul II's
    // 'Nuovo ordinamento giuridico della Basilica di San Nicola di Bari'.
    expect(docs.filter((d) => d.idStatus === 'provisional')).toHaveLength(34);
  });

  it('satisfies every invariant', () => {
    expect(checkDocuments(docs, genres, keywords)).toEqual([]);
  });

  it('emits no unadjudicated printed/slug date-mismatch or unmerged same-date warnings', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let calls: unknown[][];
    try {
      for (const shelf of shelvesFor('benedict-xvi')) {
        const index = readFileSync(`tools/fixtures/benedict-xvi-${shelf}.html`, 'utf8');
        parseShelfIndex(index, 'benedict-xvi', shelf);
      }
    } finally {
      calls = warnSpy.mock.calls;
      warnSpy.mockRestore();
    }
    const mismatches = calls.filter(([msg]) => String(msg).includes('date mismatch'));
    expect(mismatches).toEqual([]);
  });

  it('records the fixture retrieval date for every document', () => {
    expect(docs.every((d) => d.source?.retrieved === '2026-09-07')).toBe(true);
  });

  it('leaves the 383 pilot, 306 Pius X, 158/253 Pius XI/XII, 63 Benedict XV, 177 John XXIII, 688 Paul VI, 7 John Paul I, and 1801 John Paul II records untouched', () => {
    expect(all).toHaveLength(383);
    expect(load('pius-x')).toHaveLength(306);
    expect(load('pius-xi')).toHaveLength(158);
    expect(load('pius-xii')).toHaveLength(253);
    expect(load('benedict-xv')).toHaveLength(63);
    expect(load('john-xxiii')).toHaveLength(177);
    expect(load('paul-vi')).toHaveLength(688);
    expect(load('john-paul-i')).toHaveLength(7);
    expect(load('john-paul-ii')).toHaveLength(1801);
  });
});

describe('the Francis corpus', () => {
  const docs = load('francis-i');

  it('holds every formal-shelf document', () => {
    // 4 encyclicals + 2 bulls + 49 apost_constitutions + 114 apost_letters
    // + 7 apost_exhortations + 77 motu_proprio = 253 raw items, matching the task
    // brief's expected counts on every shelf exactly. apost_letters and motu_proprio
    // overlap heavily for this pope (many acts are a "Lettera Apostolica in forma di
    // «Motu Proprio»" filed on both shelves): 55 documents merge on shared incipit and
    // date, each dropping exactly one duplicate item (verified: zero records carry more
    // than one alsoShelvedAs entry). 253 - 55 = 198.
    expect(docs).toHaveLength(198);
  });

  it('files them all under the right issuer', () => {
    expect(docs.every((d) => d.issuerId === 'rp:francis-i')).toBe(true);
  });

  it('namespaces ids under the CRPDR id, not the vatican.va slug', () => {
    // The vatican.va page slug is Italian ('francesco'); the CRPDR id is 'rp:francis-i'
    // (see pontiffs.ts). Every minted id must bridge through issuerId, never the slug.
    expect(docs.every((d) => d.id.startsWith('mag:francis-i/'))).toBe(true);
    expect(docs.some((d) => d.id.startsWith('mag:francesco/'))).toBe(false);
  });

  it('gives every document a title', () => {
    expect(docs.every((d) => typeof d.title === 'string' && d.title.length > 0)).toBe(true);
  });

  it('has no year-partitioned shelf (every fixture is an aggregate page)', () => {
    for (const shelf of shelvesFor('francesco')) {
      const index = readFileSync(`tools/fixtures/francesco-${shelf}.html`, 'utf8');
      expect(index.includes('div class="item"'), shelf).toBe(true);
    }
  });

  it('tags the erections the headings state outright', () => {
    // The first pontificate whose circumscription erections are tagged from the heading
    // text rather than flagged for curation (keywords.ts, ERECTION_PHRASES): headings
    // read 'Il Santo Padre ha eretto...' / 'Il Santo Padre ha istituito...' / '...ha
    // elevato...' outright. All 36 tagged documents are on apost_constitutions.
    const tagged = docs.filter((d) => d.keywords?.includes('circumscription-erection'));
    expect(tagged.length).toBeGreaterThan(20);
    expect(tagged).toHaveLength(36);
    expect(tagged.every((d) => /ha eretto|ha istituito|ha elevato/i.test(d.title))).toBe(true);
    expect(tagged.every((d) => d.source?.shelf === 'apost_constitutions')).toBe(true);
  });

  it('does not tag a document that merely sits on the same shelf', () => {
    const pe = docs.find((d) => d.incipit === 'Praedicate Evangelium');
    expect(pe).toBeDefined();
    expect(pe!.keywords).toBeUndefined();
  });

  it('does not flag any Francis document as an erection candidate', () => {
    // keywords.ts's TEXTUALLY_TAGGED set excludes 'francesco' from isErectionCandidate
    // precisely so a textually-tagged erection is never also double-counted as a
    // candidate awaiting curation. Confirmed against the actual harvested items, not
    // just the exclusion set's presence.
    for (const shelf of shelvesFor('francesco')) {
      const index = readFileSync(`tools/fixtures/francesco-${shelf}.html`, 'utf8');
      const items = parseShelfIndex(index, 'francesco', shelf);
      expect(items.every((i) => !isErectionCandidate(i)), shelf).toBe(true);
    }
  });

  it('keeps well-known acts minted and distinct from the erection candidates', () => {
    for (const incipit of [
      "Laudato si'", 'Evangelii gaudium', 'Amoris laetitia', 'Fratelli tutti',
      'Praedicate Evangelium', 'Gaudete et exsultate',
    ]) {
      const d = docs.find((x) => x.incipit === incipit);
      expect(d, incipit).toBeDefined();
      expect(d!.idStatus).toBe('minted');
    }
  });

  it('resolves the sub plumbo collision into three distinct records', () => {
    // Three genuinely distinct apost_letters acts of 22 February 2014 -- each raising a
    // different Roman church to a cardinalatial title (San Giacomo in Augusta; Santi
    // Simone e Giuda Taddeo a Torre Angela; Sant'Angela Merici) -- all open 'Lettera
    // Apostolica "sub plumbo" con la quale...'. Before 'sub-plumbo' was added to
    // BARE_GENRE_SLUGS (incipit-rules.ts), all three collided on the pass-1 merge key
    // (pageSlug|slugify(incipit)|date) and two of the three silently vanished. Fetched
    // all three documents from vatican.va: each opens 'FRANCISCUS EPISCOPUS SERVUS
    // SERVORUM DEI...LITTERAE APOSTOLICAE SUB PLUMBO DATAE' (the seal-type genre
    // descriptor -- 'issued under lead' -- not any document's own opening words), with
    // the substantive text itself opening 'Purpuratis Patribus...'.
    const subPlumbo = docs.filter((d) => d.title.includes('sub plumbo'));
    expect(subPlumbo).toHaveLength(3);
    expect(subPlumbo.every((d) => d.idStatus === 'provisional')).toBe(true);
    expect(new Set(subPlumbo.map((d) => d.id)).size).toBe(3);
  });

  it('corrects the Izcalliensis erection date to its own dating formula', () => {
    // The apost_constitutions shelf and the document's own page-heading subtitle both
    // print '9 giugno 2014' (9 June), but the document's own closing dating formula
    // reads 'die nono mensis Iulii...anno Domini bis millesimo quarto decimo,
    // Pontificatus Nostri secundo' (9 July 2014) -- matching the URL slug (20140709).
    const d = docs.find((x) => x.incipit === 'Christi voluntate');
    expect(d).toBeDefined();
    expect(d!.date).toBe('2014-07-09');
  });

  it('adjudicates the four same-date cross-shelf pairs as genuinely distinct', () => {
    // Each pair verified by fetching both documents from vatican.va and comparing
    // subject matter -- see ADJUDICATED_DISTINCT (Task 18 entries) for the full evidence.
    const byTitle = (s: string) => docs.find((d) => d.title.includes(s));
    expect(byTitle('Costituzione Apostolica In Ecclesiarum Communione')).toBeDefined();
    expect(byTitle('Decreto del Santo Padre Francesco per l’assegnazione')).toBeDefined();
    expect(byTitle("circa i limiti e le modalità dell'ordinaria amministrazione")).toBeDefined();
    expect(byTitle('Decreto del Sommo Pontefice Francesco relativo alla pubblicazione')).toBeDefined();
    expect(byTitle('si istituisce il Dicastero per il Servizio dello Sviluppo Umano Integrale')).toBeDefined();
    expect(byTitle('Statuto del Dicastero per il Servizio dello Sviluppo Umano Integrale')).toBeDefined();
    expect(byTitle('Come una madre amorevole')).toBeDefined();
    expect(byTitle('Statuto del Dicastero per i Laici, la Famiglia e la Vita')).toBeDefined();
  });

  it('omits the incipit exactly when the id is provisional', () => {
    for (const d of docs) {
      expect('incipit' in d, d.id).toBe(d.idStatus === 'minted');
    }
    // 89 of 198 (44.9%) carry no recoverable incipit -- reviewed against their own
    // heading text. The two dominant genres are the same shape already established for
    // Benedict XVI: beatification/canonization announcements naming only the honoree
    // (many sent in the Pope's name by the Secretary of State), and narrative
    // 'Lettera Apostolica'/'Motu Proprio'/'Decreto' openers describing an administrative
    // or juridical act in the third person with no Latin incipit at all -- Francis's
    // pontificate carries an unusually large volume of the latter (Curia and financial
    // reform decrees), which is why this rate runs well above Benedict XVI's 15.9%.
    expect(docs.filter((d) => d.idStatus === 'provisional')).toHaveLength(89);
  });

  it('satisfies every invariant', () => {
    expect(checkDocuments(docs, genres, keywords)).toEqual([]);
  });

  it('emits no unadjudicated printed/slug date-mismatch or unmerged same-date warnings', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let calls: unknown[][];
    try {
      for (const shelf of shelvesFor('francesco')) {
        const index = readFileSync(`tools/fixtures/francesco-${shelf}.html`, 'utf8');
        parseShelfIndex(index, 'francesco', shelf);
      }
    } finally {
      calls = warnSpy.mock.calls;
      warnSpy.mockRestore();
    }
    const mismatches = calls.filter(([msg]) => String(msg).includes('date mismatch'));
    expect(mismatches).toEqual([]);
  });

  it('records the fixture retrieval date for every document', () => {
    expect(docs.every((d) => d.source?.retrieved === '2026-09-07')).toBe(true);
  });

  it('leaves every prior pontificate untouched', () => {
    expect(all).toHaveLength(383);
    expect(load('pius-x')).toHaveLength(306);
    expect(load('pius-xi')).toHaveLength(158);
    expect(load('pius-xii')).toHaveLength(253);
    expect(load('benedict-xv')).toHaveLength(63);
    expect(load('john-xxiii')).toHaveLength(177);
    expect(load('paul-vi')).toHaveLength(688);
    expect(load('john-paul-i')).toHaveLength(7);
    expect(load('john-paul-ii')).toHaveLength(1801);
    expect(load('benedict-xvi')).toHaveLength(214);
  });
});
