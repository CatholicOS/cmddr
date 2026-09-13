import { describe, it, expect, vi } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { checkDocuments, expectedOrdinal } from '../src/validate/invariants.js';
import { parseShelfIndex } from '../src/harvest/shelf.js';
import {
  shelvesFor, isErectionCandidate, isUnconfirmedCandidate, CIRCUMSCRIPTION_ERECTIONS,
  RECOVERED_INCIPITS, isMessagesShelf, seriesForShelf, SERIES_OCCASION_YEARS, SERIES_ORDINALS,
  SERIES_EXCLUSIONS, SERIES_URBI_OCCASIONS, SERIES, POPES,
} from '../src/mappings/index.js';
import { fixtureName } from '../src/harvest/fixtures.js';
import { readOrdinal, readOccasionYear } from '../src/harvest/seriesTitle.js';
import { easterSunday } from '../src/dates.js';
import { slugify } from '../src/slug.js';
import { isActaShelf, CREATED_CATEGORIES, PONTIFICATE_BEGAN } from '../src/acta/create.js';
import { ACTA_INDEX_CORRECTIONS, ACTA_HOLDS, ACTA_MATCH_OVERRIDES } from '../src/acta/curation.js';
import { loadActaIndexes, ACTA_SOURCES } from '../src/acta/join.js';
import { ACTA_POPES } from '../src/acta/popes.js';
import { bareProvisionalId } from '../src/harvest/ordinals.js';
import type { DocumentRecord } from '../src/types.js';

/** Every record of one issuer's file, whichever shelf or source it came from. */
const loadAll = (n: string) =>
  JSON.parse(readFileSync(`data/documents/${n}.json`, 'utf8')) as DocumentRecord[];
/**
 * The formal-shelf records of one issuer: everything but the `messages/*` shelves, which
 * the per-pontificate blocks below were written and counted before, and which are keyed
 * by occasion rather than incipit (so 'omits the incipit exactly when provisional' holds
 * only here), and but the documents created from the *Acta Apostolicae Sedis* index
 * (`source.shelf` of the `aas/{year}` form), which come from no shelf at all. The
 * *Messaggi* shelves and the AAS-only documents have their own blocks at the end.
 */
const load = (n: string) => loadAll(n)
  .filter((d) => !isMessagesShelf(d.source?.shelf ?? null) && !isActaShelf(d.source?.shelf));
const genres = JSON.parse(readFileSync('data/genres.json', 'utf8')) as
  Array<{ id: string; issuerTypes?: string[]; allowedCharacteristics?: string[] }>;
const keywords = JSON.parse(readFileSync('data/keywords.json', 'utf8')) as Array<{ id: string }>;
const series = JSON.parse(readFileSync('data/series.json', 'utf8')) as
  Array<{ id: string; firstYear?: number }>;
/** The date every pope fixture was fetched (FIXTURES_RETRIEVED in harvest/run.ts). */
const POPE_FIXTURES_RETRIEVED = '2026-09-12';

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
        parseShelfIndex(readFileSync(`tools/fixtures/${fixtureName('leo-xiii', shelf)}.html`, 'utf8'), 'leo-xiii', shelf);
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
    expect(all.every((d) => d.source?.retrieved === POPE_FIXTURES_RETRIEVED)).toBe(true);
    const mismatched = all.filter((d) => d.source?.retrieved !== POPE_FIXTURES_RETRIEVED);
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
    expect(shareOf(pxi)).toBeCloseTo(14 / 158, 5); // 8.9% (Ci si è domandato recovered)
    expect(shareOf(pxii)).toBeCloseTo(95 / 253, 5); // 37.5% (four recovered, see below)
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
      // A recovered incipit is by definition NOT in the heading -- that is precisely why it
      // had to be recovered, from AAS or from the document's own text (recovered-incipits.ts).
      // This invariant is about incipits *extracted from the heading*, so recovered records
      // are exempt here and are pinned instead by the recovered-incipit shelf's own tests.
      const recovered = new Set(Object.values(RECOVERED_INCIPITS).map((r) => r.incipit));
      const fromHeading = withIncipit.filter((d) => !recovered.has(d.incipit!));
      expect(fromHeading.every((d) => d.title.includes(d.incipit!))).toBe(true);
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
    expect(docs).toHaveLength(178);
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
    // below): 33 - 11 - 1 = 21. Final review (2026-09-07): making GLOSS_CONNECTORS
    // case-insensitive (see incipit.ts's glossCut) rescued one more -- 'De Pontificio
    // Consilio Ecclesiasticis Italiae Tabularis curandis' was left fully provisional
    // (no incipit at all) because the listed connector ' Motu Proprio che ' only matched
    // its own capitalisation, not this heading's lower-case 'Motu proprio che'; fixing
    // the asymmetry now cuts it correctly, confirmed genuine by its own URL slug
    // 'pontificio-consilio': 21 -> 20. The remaining 20 are correct: each heading
    // genuinely prints no incipit (see task-13-report.md for the ones investigated and
    // deliberately left this way, e.g. the hyphenated two-toponym shape).
    // Six of these were recovered into RECOVERED_INCIPITS after being confirmed in AAS
    // (Maiora in dies, Superno Dei, Le voci, Celebrandi Concilii Oecumenici, Il religioso
    // convegno) or in the document itself (Centesimo vertente anno). One arrived in the other
    // direction: the Rosary meditations, previously absorbed into the letter by pass 2, are now
    // their own provisional record. 21 - 6 + 1 = 16... minus the pass-1 merge already counted
    // above leaves 15.
    expect(docs.filter((d) => d.idStatus === 'provisional')).toHaveLength(15);
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
      'De Pontificio Consilio Ecclesiasticis Italiae Tabularis curandis',
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
    expect(docs).toHaveLength(687);
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
    // Only 5 of 687 (0.7%) carry no recoverable incipit -- a low rate given the volume,
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
    // Two were recovered into RECOVERED_INCIPITS on AAS evidence -- In Spiritu Sancto (AAS 58)
    // and Positum est (AAS 65) -- and a third left the shelf entirely when the twice-published
    // 1968 beatification letter merged into mag:paul-vi/quem-ad-modum-1968 (see its own tests).
    expect(docs.filter((d) => d.idStatus === 'provisional')).toHaveLength(5);
  });

  it('tags the diocese erections only through the curated tables', () => {
    // The headings print a bare Latin toponym with no marker, so nothing was tagged until
    // the curation pass. The Paul VI instalment of the circumscription adjudication (Task 5)
    // read all 222 candidates and filed 161 erections, 48 elevations and 2 unions by key in
    // circumscriptions.ts; its other 11 rows sit in CANDIDATE_ADJUDICATIONS and carry no
    // keyword. Nothing else is tagged, and a document with a real name never is.
    const tagged = docs.filter((d) => d.keywords !== undefined);
    expect(tagged.filter((d) => d.keywords?.includes('circumscription-erection'))).toHaveLength(161);
    expect(tagged.filter((d) => d.keywords?.includes('circumscription-elevation'))).toHaveLength(48);
    expect(tagged.filter((d) => d.keywords?.includes('circumscription-union'))).toHaveLength(2);
    expect(tagged).toHaveLength(211);
    expect(tagged.every((d) => d.source?.shelf === 'apost_constitutions')).toBe(true);
    expect(docs.find((d) => d.incipit === 'Indulgentiarum Doctrina')?.keywords).toBeUndefined();
    expect(docs.find((d) => d.incipit === 'Romano Pontifici Eligendo')?.keywords).toBeUndefined();
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
    // The heading still yields nothing -- NARRATIVE_OPENERS correctly refuses to mint from
    // it, and the incipit below is nowhere in the title. What changed is the evidence: AAS 65
    // (1973) prints the Latin original opening 'Positum est in Romanorum Pontificum
    // instituto' and cites the act by it, so the name comes from RECOVERED_INCIPITS rather
    // than from the heading this test was written to distrust.
    expect(d.title.includes('Positum est')).toBe(false);
    expect(d.incipit).toBe('Positum est');
    expect(d.id).toBe('mag:paul-vi/positum-est-1973');
  });

  it('satisfies every invariant', () => {
    expect(checkDocuments(docs, genres, keywords)).toEqual([]);
  });

  it('leaves the 383 pilot, 306 Pius X, 158/253 Pius XI/XII, 63 Benedict XV, and 178 John XXIII records untouched', () => {
    expect(all).toHaveLength(383);
    expect(load('pius-x')).toHaveLength(306);
    expect(load('pius-xi')).toHaveLength(158);
    expect(load('pius-xii')).toHaveLength(253);
    expect(load('benedict-xv')).toHaveLength(63);
    expect(load('john-xxiii')).toHaveLength(178);
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

  it('mints from no heading -- the three real incipits come from curation, not the parser', () => {
    // Every heading on both shelves opens with the genre word ('Lettera'/'Lettera
    // Apostolica') followed by a lower-case narrative continuation ('per la costituzione...',
    // 'in occasione...', 'a Mons. ...') -- extractIncipit's own lower-case-residue rule
    // (incipit.ts) correctly declines to mint from any of them, and still does.
    //
    // What changed is where the three real names come from. This test's earlier comment
    // already recorded the finding: 'three of them (Cum probe, Propterea maxime,
    // Progredientibus iam) do open with a genuine Latin incipit in their own body text,
    // printed nowhere on the index page'. All three are cited by those incipits in AAS 70
    // (1978)'s chronological index, so they are now named from RECOVERED_INCIPITS. The
    // parser still reads headings only; the curated table is the only thing that knows
    // what the body says.
    expect(docs.filter((d) => d.idStatus === 'provisional')).toHaveLength(4);
    const named = docs.filter((d) => 'incipit' in d);
    expect(named.map((d) => d.incipit).sort())
      .toEqual(['Cum probe', 'Progredientibus iam', 'Propterea maxime']);
    // None of the three is in its own heading -- which is why the parser could not find them.
    for (const d of named) expect(d.title.includes(d.incipit!), d.id).toBe(false);
    expect(new Set(docs.map((d) => d.id)).size).toBe(7);
  });

  it('emits no printed/slug date-mismatch warnings for either shelf', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let calls: unknown[][];
    try {
      for (const shelf of shelvesFor('john-paul-i')) {
        parseShelfIndex(
          readFileSync(`tools/fixtures/${fixtureName('john-paul-i', shelf)}.html`, 'utf8'), 'john-paul-i', shelf);
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
    expect(docs.every((d) => d.source?.retrieved === POPE_FIXTURES_RETRIEVED)).toBe(true);
  });

  it('leaves the 383 pilot, 306 Pius X, 158/253 Pius XI/XII, 63 Benedict XV, 178 John XXIII, and 687 Paul VI records untouched', () => {
    expect(all).toHaveLength(383);
    expect(load('pius-x')).toHaveLength(306);
    expect(load('pius-xi')).toHaveLength(158);
    expect(load('pius-xii')).toHaveLength(253);
    expect(load('benedict-xv')).toHaveLength(63);
    expect(load('john-xxiii')).toHaveLength(178);
    expect(load('paul-vi')).toHaveLength(687);
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

  it('tags the diocese erections only through the curated tables', () => {
    // 613 apost_constitutions items, the large majority filed under a bare Latin toponym
    // with no textual marker, so nothing was tagged until the curation pass. The John Paul
    // II instalment of the circumscription adjudication (Task 6) read all 390 candidates
    // and filed 317 erections, 59 elevations and 5 unions by key in circumscriptions.ts; its
    // other 9 rows sit in CANDIDATE_ADJUDICATIONS and carry no keyword. Nothing else is
    // tagged, and a document with a real name never is.
    const tagged = docs.filter((d) => d.keywords !== undefined);
    expect(tagged.filter((d) => d.keywords?.includes('circumscription-erection'))).toHaveLength(317);
    expect(tagged.filter((d) => d.keywords?.includes('circumscription-elevation'))).toHaveLength(59);
    expect(tagged.filter((d) => d.keywords?.includes('circumscription-union'))).toHaveLength(5);
    expect(tagged).toHaveLength(381);
    expect(tagged.every((d) => d.source?.shelf === 'apost_constitutions')).toBe(true);
    expect(docs.find((d) => d.incipit === 'Sapientia Christiana')?.keywords).toBeUndefined();
    expect(docs.find((d) => d.incipit === 'Ex Corde Ecclesiae')?.keywords).toBeUndefined();
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
        const index = readFileSync(`tools/fixtures/${fixtureName('john-paul-ii', shelf)}.html`, 'utf8');
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
    expect(docs.every((d) => d.source?.retrieved === POPE_FIXTURES_RETRIEVED)).toBe(true);
  });

  it('leaves the 383 pilot, 306 Pius X, 158/253 Pius XI/XII, 63 Benedict XV, 178 John XXIII, 687 Paul VI, and 7 John Paul I records untouched', () => {
    expect(all).toHaveLength(383);
    expect(load('pius-x')).toHaveLength(306);
    expect(load('pius-xi')).toHaveLength(158);
    expect(load('pius-xii')).toHaveLength(253);
    expect(load('benedict-xv')).toHaveLength(63);
    expect(load('john-xxiii')).toHaveLength(178);
    expect(load('paul-vi')).toHaveLength(687);
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
      const index = readFileSync(`tools/fixtures/${fixtureName('benedict-xvi', shelf)}.html`, 'utf8');
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
      const html = readFileSync(`tools/fixtures/${fixtureName('benedict-xvi', shelf)}.html`, 'utf8');
      const h2s = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/g)].map((m) => m[1]!);
      for (const h2 of h2s) {
        const text = h2.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
        const paren = text.match(/\(([^()]*)\)\s*$/);
        if (!paren) continue;
        expect(paren[1], text).not.toMatch(/^\s*\d{1,2}\s*-\s*\d{1,2}\s+[A-Za-zÀ-ÿ]/);
      }
    }
  });

  it('tags the diocese erections only through the curated tables', () => {
    // 126 apost_constitutions items, the large majority filed under a bare Latin toponym
    // with no textual marker, so nothing was tagged until the curation pass. The Benedict
    // XVI instalment of the circumscription adjudication (Task 4) read all 90 candidates
    // and filed 77 erections and 11 elevations by key in circumscriptions.ts; its other
    // two rows sit in CANDIDATE_ADJUDICATIONS and carry no keyword. Nothing else is
    // tagged, and a document with a real name never is.
    const tagged = docs.filter((d) => d.keywords !== undefined);
    expect(tagged.filter((d) => d.keywords?.includes('circumscription-erection'))).toHaveLength(77);
    expect(tagged.filter((d) => d.keywords?.includes('circumscription-elevation'))).toHaveLength(11);
    expect(tagged).toHaveLength(88);
    expect(tagged.every((d) => d.source?.shelf === 'apost_constitutions')).toBe(true);
    expect(docs.find((d) => d.incipit === 'Anglicanorum coetibus')?.keywords).toBeUndefined();
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
        const index = readFileSync(`tools/fixtures/${fixtureName('benedict-xvi', shelf)}.html`, 'utf8');
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
    expect(docs.every((d) => d.source?.retrieved === POPE_FIXTURES_RETRIEVED)).toBe(true);
  });

  it('leaves the 383 pilot, 306 Pius X, 158/253 Pius XI/XII, 63 Benedict XV, 178 John XXIII, 687 Paul VI, 7 John Paul I, and 1801 John Paul II records untouched', () => {
    expect(all).toHaveLength(383);
    expect(load('pius-x')).toHaveLength(306);
    expect(load('pius-xi')).toHaveLength(158);
    expect(load('pius-xii')).toHaveLength(253);
    expect(load('benedict-xv')).toHaveLength(63);
    expect(load('john-xxiii')).toHaveLength(178);
    expect(load('paul-vi')).toHaveLength(687);
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
      const index = readFileSync(`tools/fixtures/${fixtureName('francesco', shelf)}.html`, 'utf8');
      expect(index.includes('div class="item"'), shelf).toBe(true);
    }
  });

  it('tags the erections the headings state outright', () => {
    // The first pontificate whose circumscription erections are tagged from the heading
    // text rather than flagged for curation (keywords.ts, ERECTION_PHRASES): headings
    // read 'Il Santo Padre ha eretto...' / 'Il Santo Padre ha istituito...' outright. All
    // 34 tagged documents are on apost_constitutions. (Task 20 moved the four 'ha elevato'
    // headings to circumscription-elevation instead -- see the next test.)
    const tagged = docs.filter((d) => d.keywords?.includes('circumscription-erection'));
    expect(tagged.length).toBeGreaterThan(20);
    expect(tagged).toHaveLength(34);
    expect(tagged.every((d) => /ha eretto|ha istituito/i.test(d.title))).toBe(true);
    expect(tagged.every((d) => d.source?.shelf === 'apost_constitutions')).toBe(true);
  });

  it('tags the elevations its headings state outright, as circumscription-elevation rather '
    + 'than circumscription-erection (Task 20)', () => {
    const elevated = docs.filter((d) => d.keywords?.includes('circumscription-elevation'));
    expect(elevated).toHaveLength(4);
    expect(elevated.every((d) => /ha elevato/i.test(d.title))).toBe(true);
    expect(elevated.every((d) => !d.keywords?.includes('circumscription-erection'))).toBe(true);
    expect(elevated.every((d) => d.source?.shelf === 'apost_constitutions')).toBe(true);
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
      const index = readFileSync(`tools/fixtures/${fixtureName('francesco', shelf)}.html`, 'utf8');
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
        const index = readFileSync(`tools/fixtures/${fixtureName('francesco', shelf)}.html`, 'utf8');
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
    expect(docs.every((d) => d.source?.retrieved === POPE_FIXTURES_RETRIEVED)).toBe(true);
  });

  it('leaves every prior pontificate untouched', () => {
    expect(all).toHaveLength(383);
    expect(load('pius-x')).toHaveLength(306);
    expect(load('pius-xi')).toHaveLength(158);
    expect(load('pius-xii')).toHaveLength(253);
    expect(load('benedict-xv')).toHaveLength(63);
    expect(load('john-xxiii')).toHaveLength(178);
    expect(load('paul-vi')).toHaveLength(687);
    expect(load('john-paul-i')).toHaveLength(7);
    expect(load('john-paul-ii')).toHaveLength(1801);
    expect(load('benedict-xvi')).toHaveLength(214);
  });
});

describe('the Leo XIV corpus', () => {
  const docs = load('leo-xiv');

  it('holds every formal-shelf document', () => {
    // 1 encyclical + 7 apost_constitutions + 10 apost_letters + 1 apost_exhortations
    // + 8 motu_proprio = 27 raw items, matching the task brief's expected counts on
    // every shelf exactly. apost_letters and motu_proprio overlap (the same
    // "Lettera Apostolica in forma di «Motu Proprio»" shape as Francis): 6 documents
    // merge on shared incipit and date, each dropping exactly one duplicate item
    // (verified: every one carries exactly one alsoShelvedAs entry, 'motu_proprio', and
    // is kept on the more specific apost_letters shelf). 27 - 6 = 21.
    expect(docs).toHaveLength(21);
  });

  it('files them all under the right issuer', () => {
    expect(docs.every((d) => d.issuerId === 'rp:leo-xiv')).toBe(true);
  });

  it('namespaces ids under the CRPDR id, which happens to match the vatican.va slug here', () => {
    expect(docs.every((d) => d.id.startsWith('mag:leo-xiv/'))).toBe(true);
  });

  it('gives every document a title', () => {
    expect(docs.every((d) => typeof d.title === 'string' && d.title.length > 0)).toBe(true);
  });

  it('has no year-partitioned shelf (every fixture is an aggregate page)', () => {
    for (const shelf of shelvesFor('leo-xiv')) {
      const index = readFileSync(`tools/fixtures/${fixtureName('leo-xiv', shelf)}.html`, 'utf8');
      expect(index.includes('div class="item"'), shelf).toBe(true);
    }
  });

  it('tags the erections the headings state outright', () => {
    // Like Francis, Leo XIV's own TEXTUALLY_TAGGED membership (keywords.ts) reads the
    // erection from the heading text rather than flagging it for curation. Three
    // headings read 'il Santo Padre ha eretto...' outright; three more use the present
    // tense 'erige' (task-19-report.md's deferred finding -- ERECTION_PHRASES now
    // matches it too, guarded by a nearby circumscription noun, Task 20). All six are on
    // apost_constitutions.
    const tagged = docs.filter((d) => d.keywords?.includes('circumscription-erection'));
    expect(tagged).toHaveLength(6);
    expect(tagged.every((d) => /ha eretto|ha istituito|erige/i.test(d.title))).toBe(true);
    expect(tagged.every((d) => d.source?.shelf === 'apost_constitutions')).toBe(true);
  });

  it('tags the one elevation its heading states outright, as circumscription-elevation '
    + 'rather than circumscription-erection (Task 20)', () => {
    // The fourth present-tense heading from task-19-report.md's deferred finding --
    // 'eleva' rather than 'erige' -- is an elevation, not an erection.
    const elevated = docs.filter((d) => d.keywords?.includes('circumscription-elevation'));
    expect(elevated).toHaveLength(1);
    expect(elevated[0]!.title).toMatch(/\beleva\b/i);
    expect(elevated[0]!.keywords).not.toContain('circumscription-erection');
    expect(elevated[0]!.source?.shelf).toBe('apost_constitutions');
  });

  it('does not flag any Leo XIV document as an erection candidate', () => {
    // keywords.ts's TEXTUALLY_TAGGED set excludes 'leo-xiv' from isErectionCandidate
    // precisely so a textually-tagged erection is never also double-counted as a
    // candidate awaiting curation. Confirmed against the actual harvested items, not
    // just the exclusion set's presence.
    for (const shelf of shelvesFor('leo-xiv')) {
      const index = readFileSync(`tools/fixtures/${fixtureName('leo-xiv', shelf)}.html`, 'utf8');
      const items = parseShelfIndex(index, 'leo-xiv', shelf);
      expect(items.every((i) => !isErectionCandidate(i)), shelf).toBe(true);
    }
  });

  it('adjudicates the two same-date cross-shelf pairs as genuinely distinct', () => {
    // Both fetched and read in full: 'In unitate fidei' (the apostolic letter for the
    // 1700th anniversary of the Council of Nicaea) is unrelated in subject to either of
    // the two Curia regolamenti, which are themselves two separate texts (personnel
    // rules vs. general organization) issued the same day -- see ADJUDICATED_DISTINCT
    // (Task 19 entries) for the full evidence.
    const byIncipit = (s: string) => docs.find((d) => d.incipit === s);
    expect(byIncipit('In unitate fidei')).toBeDefined();
    expect(byIncipit('Regolamento del Personale della Curia Romana')).toBeDefined();
    expect(byIncipit('Regolamento Generale della Curia Romana')).toBeDefined();
  });

  it('omits the incipit exactly when the id is provisional', () => {
    for (const d of docs) {
      expect('incipit' in d, d.id).toBe(d.idStatus === 'minted');
    }
    // 3 of 21 (14.3%) carry no recoverable incipit from the printed shelf heading. Two
    // are genuinely narrative headings with no incipit anywhere in the document itself
    // (fetched and confirmed). The third, 'confirma-fratres-tuos' (24 giugno 2026, own
    // URL slug), does have a real quoted incipit printed on the document's own page --
    // but the shelf-index heading never prints it at all, unlike every other minted
    // record here, so no rule table can recover text the source heading omits entirely.
    // Confirma fratres tuos is now recovered into RECOVERED_INCIPITS from the document
    // page's own quoted heading -- the curated table is exactly the mechanism this comment
    // said no rule table could provide, since it does not try to parse the shelf heading at
    // all. The two genuinely narrative headings remain provisional, and AAS confirms both:
    // it titles them descriptively (De ordine et moderatione..., de pondere archaeologiae).
    expect(docs.filter((d) => d.idStatus === 'provisional')).toHaveLength(2);
  });

  it('satisfies every invariant', () => {
    expect(checkDocuments(docs, genres, keywords)).toEqual([]);
  });

  it('emits no unadjudicated printed/slug date-mismatch or unmerged same-date warnings', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    let calls: unknown[][];
    try {
      for (const shelf of shelvesFor('leo-xiv')) {
        const index = readFileSync(`tools/fixtures/${fixtureName('leo-xiv', shelf)}.html`, 'utf8');
        parseShelfIndex(index, 'leo-xiv', shelf);
      }
    } finally {
      calls = warnSpy.mock.calls;
      warnSpy.mockRestore();
    }
    const mismatches = calls.filter(([msg]) => String(msg).includes('date mismatch'));
    expect(mismatches).toEqual([]);
  });

  it('records the fixture retrieval date for every document', () => {
    expect(docs.every((d) => d.source?.retrieved === POPE_FIXTURES_RETRIEVED)).toBe(true);
  });

  it('leaves every prior pontificate untouched', () => {
    expect(all).toHaveLength(383);
    expect(load('pius-x')).toHaveLength(306);
    expect(load('pius-xi')).toHaveLength(158);
    expect(load('pius-xii')).toHaveLength(253);
    expect(load('benedict-xv')).toHaveLength(63);
    expect(load('john-xxiii')).toHaveLength(178);
    expect(load('paul-vi')).toHaveLength(687);
    expect(load('john-paul-i')).toHaveLength(7);
    expect(load('john-paul-ii')).toHaveLength(1801);
    expect(load('benedict-xvi')).toHaveLength(214);
    expect(load('francis-i')).toHaveLength(198);
  });
});

describe('the Second Vatican Council', () => {
  const vaticanII = load('vatican-ii');

  it('holds all sixteen documents', () => {
    expect(vaticanII).toHaveLength(16);
  });

  it('mints every identifier -- none is provisional', () => {
    // A conciliar title is its own incipit, so the provisional shelf is never reached.
    expect(vaticanII.every((d) => d.idStatus === 'minted')).toBe(true);
  });

  it('mints the identifiers the spec and SCHEMA.md already cite', () => {
    const ids = vaticanII.map((d) => d.id).sort();
    expect(ids).toEqual([
      'mag:vatican-ii/ad-gentes-1965',
      'mag:vatican-ii/apostolicam-actuositatem-1965',
      'mag:vatican-ii/christus-dominus-1965',
      'mag:vatican-ii/dei-verbum-1965',
      'mag:vatican-ii/dignitatis-humanae-1965',
      'mag:vatican-ii/gaudium-et-spes-1965',
      'mag:vatican-ii/gravissimum-educationis-1965',
      'mag:vatican-ii/inter-mirifica-1963',
      'mag:vatican-ii/lumen-gentium-1964',
      'mag:vatican-ii/nostra-aetate-1965',
      'mag:vatican-ii/optatam-totius-1965',
      'mag:vatican-ii/orientalium-ecclesiarum-1964',
      'mag:vatican-ii/perfectae-caritatis-1965',
      'mag:vatican-ii/presbyterorum-ordinis-1965',
      'mag:vatican-ii/sacrosanctum-concilium-1963',
      'mag:vatican-ii/unitatis-redintegratio-1964',
    ]);
  });

  it('files every document under the council, promulgated by Paul VI', () => {
    for (const d of vaticanII) {
      expect(d.issuerId).toBe('oec:vatican-ii');
      expect(d.issuerType).toBe('ecumenical-council');
      expect(d.promulgatedBy).toBe('rp:paul-vi');
      expect(d.source!.shelf).toBeNull();
    }
  });

  it('splits four constitutions, three declarations and nine decrees', () => {
    const count = (g: string) => vaticanII.filter((d) => d.genre === g).length;
    expect(count('constitution')).toBe(4);
    expect(count('declaration')).toBe(3);
    expect(count('decree')).toBe(9);
  });

  it('qualifies only the three constitutions that print a qualifier', () => {
    const qualified = vaticanII.filter((d) => d.descriptiveTitle !== undefined)
      .map((d) => [d.incipit, d.descriptiveTitle]).sort();
    expect(qualified).toEqual([
      ['Dei Verbum', 'dogmatic'],
      ['Gaudium et Spes', 'pastoral'],
      ['Lumen Gentium', 'dogmatic'],
    ]);
  });

  it('carries no keyword: the circumscription vocabulary is papal', () => {
    for (const d of vaticanII) expect(d.keywords).toBeUndefined();
  });

  it('records Latin among the languages of every document', () => {
    for (const d of vaticanII) expect(d.source!.languages).toContain('LA');
  });

  it('adds no unmapped genre to the corpus', () => {
    for (const d of vaticanII) expect(d.genre).not.toBeNull();
  });

  it('records its own fixture retrieval date, not the pope fixtures\' date', () => {
    for (const d of vaticanII) expect(d.source!.retrieved).toBe('2026-09-08');
  });
});

describe('the whole corpus', () => {
  const everything = readdirSync('data/documents')
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[]);

  it('has globally unique identifiers', () => {
    expect(new Set(everything.map((d) => d.id)).size).toBe(everything.length);
  });

  it('satisfies every invariant across every issuer at once', () => {
    expect(checkDocuments(everything, genres, keywords, series)).toEqual([]);
  });

  it('files no document under a motu-proprio genre (#10)', () => {
    // Motu proprio is a characteristic of apostolic-letter, not a genre. Before the
    // change 210 documents across eleven pontificates carried genre 'motu-proprio'; every
    // one now sits on apostolic-letter with the characteristic, and the shelf is still
    // visible in sourceGenreLabel.
    expect(everything.some((d) => d.genre === 'motu-proprio')).toBe(false);
    const fromShelf = everything.filter((d) =>
      ['motu proprio', 'motu_proprio'].includes(d.sourceGenreLabel?.toLowerCase() ?? ''));
    expect(fromShelf).toHaveLength(210);
    for (const d of fromShelf) {
      expect(d.genre, d.id).toBe('apostolic-letter');
      expect(d.characteristics, d.id).toContain('motu-proprio');
    }
  });

  it('carries the motu-proprio characteristic on every document also shelved as motu_proprio (#10)', () => {
    // The 66 apostolic letters kept from apost_letters over motu_proprio by the merge
    // (55 Francis, 6 Leo XIV, 4 Paul VI, 1 John Paul II -- Socialium Scientiarum) would
    // otherwise record the motu proprio fact only in alsoShelvedAs.
    const twice = everything.filter((d) => d.source?.alsoShelvedAs?.includes('motu_proprio'));
    expect(twice).toHaveLength(66);
    for (const d of twice) {
      expect(d.genre, d.id).toBe('apostolic-letter');
      expect(d.characteristics, d.id).toContain('motu-proprio');
    }
    expect(twice.find((d) => d.incipit === 'Socialium Scientiarum')?.characteristics)
      .toEqual(['motu-proprio']);
    // And nothing else bears it: the characteristic is read from the shelves only -- and
    // from the *Motu proprio* category of the AAS index for the records created from the
    // volumes, which are on no shelf (AAS-only documents spec §4: the class's
    // characteristic): two of Pius XI from AAS 23 (1931), *Apostolicae Litterae* and
    // *Praecipua sane*, and 21 more of Pius XI and Pius XII from the volumes of 1932-1957
    // (phase 2b-ii-a), every one under the index's *Motu proprio* heading.
    const bearers = everything.filter((d) => d.characteristics?.includes('motu-proprio'));
    expect(bearers).toHaveLength(210 + 66 + 2 + 21);
    const bornBearers = bearers.filter((d) => isActaShelf(d.source?.shelf));
    expect(bornBearers).toHaveLength(23);
    expect(bornBearers.map((d) => d.id)).toEqual(expect.arrayContaining(['mag:pius-xi/apostolicae-litterae-1931', 'mag:pius-xi/praecipua-sane-1931']));
    expect(bornBearers.every((d) => d.sourceGenreLabel === 'Litterae Apostolicae Motu proprio datae' && ['rp:pius-xi', 'rp:pius-xii'].includes(d.issuerId))).toBe(true);
  });

  it('keeps the 383 pilot identifiers exactly as first minted', () => {
    // A frozen literal set, not just a length check: toHaveLength(383) cannot detect a
    // re-minted id (the same count, a different id) -- exactly the failure mode this
    // test's name promises to catch (review finding, 2026-09-07). Generated once from
    // the committed data/documents/*.json for these four issuers and pinned here; any
    // future re-mint must update this list deliberately, with the id change enumerated
    // in the commit, not slip through unnoticed.
    const FROZEN_PILOT_IDS: readonly string[] = [
    "mag:benedict-xiv/a-quo-primum-1751", "mag:benedict-xiv/accepimus-praestantium-1746",
    "mag:benedict-xiv/allatae-sunt-1755", "mag:benedict-xiv/annus-qui-hunc-1749",
    "mag:benedict-xiv/apostolica-constitutio-1749", "mag:benedict-xiv/benedictus-deus-1750",
    "mag:benedict-xiv/celebrationem-magni-1751", "mag:benedict-xiv/certiores-effecti-1742",
    "mag:benedict-xiv/cum-illud-semper-1742", "mag:benedict-xiv/cum-multorum-charitate-1745",
    "mag:benedict-xiv/cum-religiosi-aeque-1754", "mag:benedict-xiv/cum-semper-oblatas-1744",
    "mag:benedict-xiv/elapso-proxime-anno-1751", "mag:benedict-xiv/etsi-minime-1742",
    "mag:benedict-xiv/ex-omnibus-christiani-1756", "mag:benedict-xiv/ex-quo-primum-1756",
    "mag:benedict-xiv/gravissimo-animi-1749", "mag:benedict-xiv/gravissimum-supremi-1745",
    "mag:benedict-xiv/in-suprema-catholicae-1744", "mag:benedict-xiv/in-suprema-universalis-1741",
    "mag:benedict-xiv/inter-caetera-1748", "mag:benedict-xiv/inter-omnigenas-1744",
    "mag:benedict-xiv/inter-praeteritos-1749", "mag:benedict-xiv/libentissime-quidem-1745",
    "mag:benedict-xiv/magnae-nobis-1748", "mag:benedict-xiv/magno-cum-animi-1751",
    "mag:benedict-xiv/nimiam-licentiam-1743", "mag:benedict-xiv/non-ambigimus-1741",
    "mag:benedict-xiv/officii-nostri-1749", "mag:benedict-xiv/peregrinantes-a-domino-1749",
    "mag:benedict-xiv/pro-eximia-tua-1741", "mag:benedict-xiv/prodiit-jamdudum-1751",
    "mag:benedict-xiv/providas-romanorum-1751", "mag:benedict-xiv/quam-ex-sublimi-1755",
    "mag:benedict-xiv/quam-grave-1757", "mag:benedict-xiv/quamvis-paternae-1741",
    "mag:benedict-xiv/quanta-cura-1741", "mag:benedict-xiv/quemadmodum-nihil-1746",
    "mag:benedict-xiv/quemadmodum-preces-1743", "mag:benedict-xiv/quod-provinciale-1754",
    "mag:benedict-xiv/satis-vobis-compertum-1741", "mag:benedict-xiv/ubi-primum-1740",
    "mag:benedict-xiv/vix-pervenit-1745", "mag:leo-xiii/ad-catholicorum-conventum-1900",
    "mag:leo-xiii/ad-extremas-1893", "mag:leo-xiii/ad-pastoralem-1902",
    "mag:leo-xiii/ad-universam-1888", "mag:leo-xiii/adiutricem-populi-1895",
    "mag:leo-xiii/adnitentibus-nobis-1895", "mag:leo-xiii/aeterni-pastoris-1899",
    "mag:leo-xiii/aeterni-patris-1879", "mag:leo-xiii/affari-vos-1897",
    "mag:leo-xiii/agnovimus-libenter-1892", "mag:leo-xiii/al-compimento-delle-riforme-1901",
    "mag:leo-xiii/alias-iam-1900", "mag:leo-xiii/alumnis-seminarii-vaticani-1892",
    "mag:leo-xiii/amantissimae-voluntatis-1895", "mag:leo-xiii/amplissimum-collegium-1889",
    "mag:leo-xiii/annum-sacrum-1899", "mag:leo-xiii/apostolicae-curae-1896",
    "mag:leo-xiii/arcanum-divinae-1880", "mag:leo-xiii/au-milieu-des-consolations-1900",
    "mag:leo-xiii/au-milieu-des-sollicitudes-1892",
    "mag:leo-xiii/augustissimae-virginis-mariae-1897",
    "mag:leo-xiii/augustum-sanctissimumque-1888",
    "mag:leo-xiii/auspicandae-celebritatis-sacrae-1899", "mag:leo-xiii/auspicato-concessum-1882",
    "mag:leo-xiii/auspicia-rerum-1896", "mag:leo-xiii/benevolentiae-testandae-1895",
    "mag:leo-xiii/caritatis-providentiaeque-1894", "mag:leo-xiii/caritatis-studium-1898",
    "mag:leo-xiii/catholicae-ecclesiae-1890", "mag:leo-xiii/catholicos-homines-1896",
    "mag:leo-xiii/christi-domini-1895", "mag:leo-xiii/christi-nomen-1894",
    "mag:leo-xiii/ci-siamo-grandemente-1879", "mag:leo-xiii/clara-saepenumero-1893",
    "mag:leo-xiii/cogendum-proxime-1903", "mag:leo-xiii/cognita-nobis-1882",
    "mag:leo-xiii/colle-espressioni-1889", "mag:leo-xiii/communes-litteras-1903",
    "mag:leo-xiii/con-vivissima-1896", "mag:leo-xiii/conditae-a-christo-1900",
    "mag:leo-xiii/consiliorum-quae-1895", "mag:leo-xiii/constanti-hungarorum-1893",
    "mag:leo-xiii/cum-apostolica-sedes-1890", "mag:leo-xiii/cum-de-carolinis-1885",
    "mag:leo-xiii/cum-hoc-sit-1880", "mag:leo-xiii/cum-multa-sint-1882",
    "mag:leo-xiii/cum-plura-nobis-1898", "mag:leo-xiii/custodi-di-quella-fede-1892",
    "mag:leo-xiii/da-grave-sventura-1878", "mag:leo-xiii/da-molte-parti-1903",
    "mag:leo-xiii/dall-alto-dell-apostolico-seggio-1890", "mag:leo-xiii/de-ingenii-1901",
    "mag:leo-xiii/depuis-le-jour-1899", "mag:leo-xiii/dilectus-domini-nostri-1897",
    "mag:leo-xiii/diuturni-temporis-1898", "mag:leo-xiii/diuturnum-1881",
    "mag:leo-xiii/divinum-illud-munus-1897", "mag:leo-xiii/dolemus-inter-1886",
    "mag:leo-xiii/dum-multa-1902", "mag:leo-xiii/dum-multorum-1895", "mag:leo-xiii/e-giunto-1889",
    "mag:leo-xiii/ea-animi-sollicitudo-1898", "mag:leo-xiii/egregii-tui-1887",
    "mag:leo-xiii/egregium-sane-1895", "mag:leo-xiii/en-tout-temps-1901",
    "mag:leo-xiii/episcoporum-ordinem-1887", "mag:leo-xiii/est-sane-molestum-1888",
    "mag:leo-xiii/etsi-cunctas-1888", "mag:leo-xiii/etsi-nec-dubia-1888",
    "mag:leo-xiii/etsi-nos-1882", "mag:leo-xiii/etsi-paternam-1897",
    "mag:leo-xiii/ex-epistola-1899", "mag:leo-xiii/ex-litteris-tuis-1887",
    "mag:leo-xiii/ex-tuis-litteris-1902", "mag:leo-xiii/exeunte-iam-anno-1888",
    "mag:leo-xiii/eximia-pietas-1889", "mag:leo-xiii/felicitate-quadam-1897",
    "mag:leo-xiii/felix-nazarethana-1894", "mag:leo-xiii/fidentem-piumque-animum-1896",
    "mag:leo-xiii/fin-dal-principio-1902", "mag:leo-xiii/fra-le-molteplici-1889",
    "mag:leo-xiii/fra-le-principali-1894", "mag:leo-xiii/gia-fin-dagli-esordii-1900",
    "mag:leo-xiii/grande-e-1894", "mag:leo-xiii/grande-est-1891", "mag:leo-xiii/grande-munus-1880",
    "mag:leo-xiii/grata-ci-e-riuscita-1889", "mag:leo-xiii/gratae-vehementer-1893",
    "mag:leo-xiii/graves-de-communi-re-1901", "mag:leo-xiii/gravissimas-1901",
    "mag:leo-xiii/graviter-admodum-1890", "mag:leo-xiii/graviter-molesteque-1890",
    "mag:leo-xiii/hoc-mandatum-1897", "mag:leo-xiii/humanum-genus-1884",
    "mag:leo-xiii/i-luttuosi-avvenimenti-1900", "mag:leo-xiii/iamdudum-pars-1889",
    "mag:leo-xiii/iampridem-1886", "mag:leo-xiii/iampridem-considerando-1879",
    "mag:leo-xiii/il-divisamento-1893", "mag:leo-xiii/illud-est-1894",
    "mag:leo-xiii/immortale-dei-1885", "mag:leo-xiii/in-amplissimo-1902",
    "mag:leo-xiii/in-ipso-1891", "mag:leo-xiii/in-maximis-occupationibus-1901",
    "mag:leo-xiii/in-plurimis-1888", "mag:leo-xiii/in-supremo-1890",
    "mag:leo-xiii/inimica-vis-1892", "mag:leo-xiii/inscrutabili-dei-consilio-1878",
    "mag:leo-xiii/insignes-deo-1896", "mag:leo-xiii/insignis-ecclesia-1892",
    "mag:leo-xiii/inter-graves-1894", "mag:leo-xiii/iucunda-semper-expectatione-1894",
    "mag:leo-xiii/iucundas-scito-1901", "mag:leo-xiii/la-devozione-1889",
    "mag:leo-xiii/la-tarda-eta-1896", "mag:leo-xiii/la-vostra-lettera-1885",
    "mag:leo-xiii/laetitiae-sanctae-1893", "mag:leo-xiii/le-insolite-1895",
    "mag:leo-xiii/le-nostre-ferme-speranze-1901", "mag:leo-xiii/libenter-agnovimus-1887",
    "mag:leo-xiii/libentes-intelleximus-1889", "mag:leo-xiii/libertas-1888",
    "mag:leo-xiii/libet-quidem-1897", "mag:leo-xiii/licet-multa-1881",
    "mag:leo-xiii/literae-tuae-1892", "mag:leo-xiii/litteras-a-vobis-1894",
    "mag:leo-xiii/litteras-ante-annos-1902", "mag:leo-xiii/litteris-ad-te-1889",
    "mag:leo-xiii/longinqua-oceani-1895", "mag:leo-xiii/magnae-dei-matris-1892",
    "mag:leo-xiii/magni-commemoratio-1896", "mag:leo-xiii/magni-nobis-1889",
    "mag:leo-xiii/materna-ecclesiae-caritas-1884", "mag:leo-xiii/maximo-cum-animi-1898",
    "mag:leo-xiii/merito-existimasti-1887", "mag:leo-xiii/militans-iesu-1881",
    "mag:leo-xiii/militantis-ecclesiae-1897", "mag:leo-xiii/mirae-caritatis-1902",
    "mag:leo-xiii/mirifice-delectati-sumus-1890", "mag:leo-xiii/misericors-dei-filius-1883",
    "mag:leo-xiii/moerore-sapientium-1894", "mag:leo-xiii/nihil-nobis-1893",
    "mag:leo-xiii/nobilissima-gallorum-gens-1884", "mag:leo-xiii/nobis-quidem-1903",
    "mag:leo-xiii/noi-rendiamo-grazie-1890", "mag:leo-xiii/non-est-opus-1891",
    "mag:leo-xiii/non-levis-1894", "mag:leo-xiii/non-maius-1891", "mag:leo-xiii/non-mediocri-1893",
    "mag:leo-xiii/non-mediocri-1902", "mag:leo-xiii/non-senza-1886",
    "mag:leo-xiii/nos-quidem-1901", "mag:leo-xiii/nostis-errorem-1889",
    "mag:leo-xiii/nostra-erga-1898", "mag:leo-xiii/notre-consolation-1892",
    "mag:leo-xiii/nous-ne-pouvons-1899", "mag:leo-xiii/novum-argumentum-1890",
    "mag:leo-xiii/octobri-mense-1891", "mag:leo-xiii/officio-sanctissimo-1887",
    "mag:leo-xiii/officiorum-ac-munerum-1897", "mag:leo-xiii/omnibus-compertum-1900",
    "mag:leo-xiii/opportune-quidem-1891", "mag:leo-xiii/optimae-quidem-1891",
    "mag:leo-xiii/opus-tibi-1888", "mag:leo-xiii/orientalium-dignitas-ecclesiarum-1894",
    "mag:leo-xiii/parta-humano-generi-1901", "mag:leo-xiii/pastoralis-officii-1891",
    "mag:leo-xiii/pastoralis-vigilantiae-1891", "mag:leo-xiii/paterna-caritas-1888",
    "mag:leo-xiii/paternae-1899", "mag:leo-xiii/pergrata-nobis-1886",
    "mag:leo-xiii/perlibenti-quidem-1894", "mag:leo-xiii/permoti-nos-1895",
    "mag:leo-xiii/piu-volte-1886", "mag:leo-xiii/placere-nobis-1880",
    "mag:leo-xiii/placuit-tibi-1896", "mag:leo-xiii/plane-congruit-1894",
    "mag:leo-xiii/pontifices-maximi-1879", "mag:leo-xiii/postquam-catholici-1894",
    "mag:leo-xiii/praeclara-gratulationis-1894", "mag:leo-xiii/praeclaro-divinae-1888",
    "mag:leo-xiii/praeclarum-studium-1891", "mag:leo-xiii/praestans-fidei-1903",
    "mag:leo-xiii/praestantiam-assisiensis-1900",
    "mag:leo-xiii/pro-religione-et-pro-ecclesia-1881", "mag:leo-xiii/properante-ad-exitum-1899",
    "mag:leo-xiii/prossimi-come-siamo-1892", "mag:leo-xiii/provida-matris-1895",
    "mag:leo-xiii/providentissimus-deus-1893", "mag:leo-xiii/qua-mente-1900",
    "mag:leo-xiii/quae-ad-nos-1902", "mag:leo-xiii/quae-coniunctim-1892",
    "mag:leo-xiii/quae-diligenter-1887", "mag:leo-xiii/quale-debba-1895",
    "mag:leo-xiii/quam-aerumnosa-1888", "mag:leo-xiii/quam-gratae-1892",
    "mag:leo-xiii/quam-religiosa-1898", "mag:leo-xiii/quamquam-pluries-1889",
    "mag:leo-xiii/quantunque-le-siano-1887", "mag:leo-xiii/quarto-abeunte-saeculo-1892",
    "mag:leo-xiii/quas-tu-1900", "mag:leo-xiii/quo-magis-1892",
    "mag:leo-xiii/quod-anniversarius-1888", "mag:leo-xiii/quod-apostolici-muneris-1878",
    "mag:leo-xiii/quod-auctoritate-1885", "mag:leo-xiii/quod-erat-maxime-1891",
    "mag:leo-xiii/quod-iampridem-1887", "mag:leo-xiii/quod-iubilaei-1903",
    "mag:leo-xiii/quod-multum-1886", "mag:leo-xiii/quod-nuper-1889",
    "mag:leo-xiii/quod-paucis-1890", "mag:leo-xiii/quod-plurimorum-1895",
    "mag:leo-xiii/quod-primo-1887", "mag:leo-xiii/quod-romani-pontifices-1896",
    "mag:leo-xiii/quod-scribis-1893", "mag:leo-xiii/quod-votis-1902",
    "mag:leo-xiii/quoniam-divinae-1899", "mag:leo-xiii/quos-nuper-1903",
    "mag:leo-xiii/quum-adeo-1898", "mag:leo-xiii/quum-diuturnum-1898",
    "mag:leo-xiii/quum-nonnullorum-1898", "mag:leo-xiii/quum-quaestioni-1894",
    "mag:leo-xiii/rei-catholicae-1900", "mag:leo-xiii/religioni-apud-anglos-1896",
    "mag:leo-xiii/rem-magni-1890", "mag:leo-xiii/rem-tu-amplam-1894",
    "mag:leo-xiii/reputantibus-1901", "mag:leo-xiii/rerum-novarum-1891",
    "mag:leo-xiii/romanos-pontifices-1881", "mag:leo-xiii/saecularis-eventus-1901",
    "mag:leo-xiii/saepe-nos-1888", "mag:leo-xiii/saepenumero-considerantes-1883",
    "mag:leo-xiii/sancta-dei-civitas-1880", "mag:leo-xiii/sapienter-olim-1891",
    "mag:leo-xiii/sapientiae-christianae-1890", "mag:leo-xiii/satis-cognitum-1896",
    "mag:leo-xiii/slavorum-gentem-1901", "mag:leo-xiii/sodalium-benedictinorum-ordinem-1897",
    "mag:leo-xiii/spectata-fides-1885", "mag:leo-xiii/spesse-volte-1898",
    "mag:leo-xiii/suffragatione-patrum-1892", "mag:leo-xiii/sullo-scorcio-1894",
    "mag:leo-xiii/summi-pontificatus-1888", "mag:leo-xiii/superiore-anno-1884",
    "mag:leo-xiii/supremi-apostolatus-officio-1883", "mag:leo-xiii/susceptum-a-nobis-1894",
    "mag:leo-xiii/tametsi-futura-prospicientibus-1900", "mag:leo-xiii/tanto-nobis-1887",
    "mag:leo-xiii/tempestivum-quoddam-1889", "mag:leo-xiii/temporis-quidem-1900",
    "mag:leo-xiii/testem-benevolentiae-1899", "mag:leo-xiii/trans-oceanum-1897",
    "mag:leo-xiii/ubi-primum-1878", "mag:leo-xiii/ubi-primum-1898",
    "mag:leo-xiii/unitatis-christianae-1895", "mag:leo-xiii/universis-christi-1895",
    "mag:leo-xiii/urbanitatis-veteris-1901", "mag:leo-xiii/venerabilis-frater-augustinus-1900",
    "mag:leo-xiii/vi-e-ben-noto-1887", "mag:leo-xiii/vicario-sulla-terra-1887",
    "mag:leo-xiii/vigesimo-quinto-anno-1902", "mag:leo-xiii/vigilantiae-studiique-1902",
    "mag:leo-xiii/volumen-tertium-1886", "mag:pius-ix/ad-gravissimum-1859",
    "mag:pius-ix/aeterni-patris-1868", "mag:pius-ix/amantissimi-redemptoris-1858",
    "mag:pius-ix/amantissimus-humani-1862", "mag:pius-ix/apostolici-ministerii-1870",
    "mag:pius-ix/arcano-divinae-1868", "mag:pius-ix/beneficia-dei-1871",
    "mag:pius-ix/cum-catholica-ecclesia-1860", "mag:pius-ix/cum-nuper-1858",
    "mag:pius-ix/cum-sancta-mater-1859", "mag:pius-ix/da-questa-pacifica-1849",
    "mag:pius-ix/dives-in-misericordia-1877", "mag:pius-ix/dolore-haud-mediocri-1860",
    "mag:pius-ix/ecclesia-dei-1871", "mag:pius-ix/etsi-multa-1873",
    "mag:pius-ix/ex-aliis-nostris-1851", "mag:pius-ix/ex-quo-infensissimi-1867",
    "mag:pius-ix/eximiam-tuam-1857", "mag:pius-ix/exultavit-cor-nostrum-1851",
    "mag:pius-ix/graves-ac-diuturnae-1875", "mag:pius-ix/gravibus-ecclesiae-1874",
    "mag:pius-ix/gravissimas-inter-1862", "mag:pius-ix/iam-vos-omnes-1868",
    "mag:pius-ix/iamdudum-cernimus-1861", "mag:pius-ix/in-luctuosissimis-1872",
    "mag:pius-ix/in-magnis-illis-1873", "mag:pius-ix/incredibili-afflictamur-1863",
    "mag:pius-ix/ineffabilis-deus-1854", "mag:pius-ix/inter-multiplices-1853",
    "mag:pius-ix/la-serie-1849", "mag:pius-ix/levate-1867", "mag:pius-ix/maxima-quidem-1862",
    "mag:pius-ix/maximae-quidem-1864", "mag:pius-ix/maximo-animi-1859",
    "mag:pius-ix/meridionali-americae-1865", "mag:pius-ix/multiplices-inter-1865",
    "mag:pius-ix/multiplices-inter-1870", "mag:pius-ix/multis-gravibusque-1860",
    "mag:pius-ix/multis-gravissimis-1864", "mag:pius-ix/nei-giorni-1846",
    "mag:pius-ix/nelle-istituzioni-1848", "mag:pius-ix/neminem-vestrum-1854",
    "mag:pius-ix/nemo-certe-ignorat-1852", "mag:pius-ix/non-semel-1848",
    "mag:pius-ix/non-sine-gravissimo-1870", "mag:pius-ix/nostis-et-nobiscum-1849",
    "mag:pius-ix/novos-et-ante-1860", "mag:pius-ix/nullis-certe-1860",
    "mag:pius-ix/omnem-sollicitudinem-1874", "mag:pius-ix/optime-noscitis-1854",
    "mag:pius-ix/ordinem-vestrum-1871", "mag:pius-ix/praedecessores-nostros-1847",
    "mag:pius-ix/quae-in-patriarchatu-1876", "mag:pius-ix/quanta-cura-1864",
    "mag:pius-ix/quanto-conficiamur-1863", "mag:pius-ix/quartus-supra-1873",
    "mag:pius-ix/qui-nuper-1859", "mag:pius-ix/qui-pluribus-1846",
    "mag:pius-ix/quibus-quantisque-1849", "mag:pius-ix/quo-impensiore-1870",
    "mag:pius-ix/quod-nunquam-1875", "mag:pius-ix/religiosas-regularium-1870",
    "mag:pius-ix/respicientes-ea-1870", "mag:pius-ix/romani-e-quanti-1848",
    "mag:pius-ix/saepe-venerabiles-1871", "mag:pius-ix/si-semper-antea-1850",
    "mag:pius-ix/singulari-quidem-1856", "mag:pius-ix/singulari-quidem-1867",
    "mag:pius-ix/tuas-libenter-1863", "mag:pius-ix/ubi-nos-1871", "mag:pius-ix/ubi-prima-1871",
    "mag:pius-ix/ubi-primum-1847", "mag:pius-ix/ubi-primum-1849", "mag:pius-ix/ubi-urbaniano-1864",
    "mag:pius-ix/vix-dum-a-nobis-1874", "mag:vatican-i/dei-filius-1870",
    "mag:vatican-i/pastor-aeternus-1870"
    ];
    const pilot = [...load('benedict-xiv'), ...load('pius-ix'),
                   ...load('leo-xiii'), ...load('vatican-i')];
    expect(pilot).toHaveLength(383);
    expect(pilot.map((d) => d.id).sort()).toEqual([...FROZEN_PILOT_IDS].sort());
  });

  it('tags no document that was neither stated in its heading nor confirmed by hand', () => {
    const tagged = everything.filter((d) => d.keywords?.includes('circumscription-erection'));
    const textual = tagged.filter((d) => /ha eretto|ha istituito|erige/i.test(d.title));
    const untextual = tagged.length - textual.length;
    // Every tag that is not textual must come from the curated table, and the table
    // contains nothing else -- so the two counts are equal. A tag appearing from
    // anywhere else (a morphological rule leaking into the data, say) breaks this.
    expect(untextual).toBe(Object.keys(CIRCUMSCRIPTION_ERECTIONS).length);
  });

  it('marks every circumscription-keyworded document, and no other, as a governance act (#15)', () => {
    // actKind is derived from the keyword pipeline in toDocument, so today the two sets
    // coincide exactly: 777 documents at the time of writing. A document carrying actKind
    // without a circumscription keyword would mean a second, unevidenced source had crept in.
    const circumscription = new Set([
      'circumscription-erection', 'circumscription-elevation', 'circumscription-union',
    ]);
    const keyworded = everything.filter((d) => d.keywords?.some((k) => circumscription.has(k)));
    const governance = everything.filter((d) => d.actKind === 'governance');
    expect(keyworded.length).toBeGreaterThan(0);
    for (const d of keyworded) expect(d.actKind, d.id).toBe('governance');
    expect(governance.map((d) => d.id).sort()).toEqual(keyworded.map((d) => d.id).sort());
    // The only other actKind source is the Urbi et Orbi shelf, every item of which is a
    // liturgical act (messages spec §3.2.7); nothing else carries the flag at all.
    for (const d of everything) {
      if (keyworded.includes(d)) continue;
      if (d.genre === 'urbi-et-orbi') expect(d.actKind, d.id).toBe('liturgical');
      else expect(d.actKind, d.id).toBeUndefined();
    }
  });

  it('carries a medium on exactly the documents whose heading names one, and no other (#27)', () => {
    // Read from the title's own word and nothing else (toDocument.readMedium). Pinned by
    // id so that a change in the rule, a re-fetched fixture or a new shelf that brings
    // radio and video messages with it (pont-messages, #4) fails here rather than
    // silently moving the set. Nine radio, two video at the time of writing.
    const byMedium = (m: string) => everything.filter((d) => d.medium === m).map((d) => d.id).sort();
    expect(byMedium('radio')).toEqual([
      'mag:john-xxiii/message-1960-12-22', 'mag:john-xxiii/message-1961-09-10',
      'mag:john-xxiii/message-1961-12-21', 'mag:john-xxiii/message-1962-08-12',
      'mag:john-xxiii/message-1963-02-27', 'mag:john-xxiii/message-1963-04-13',
      'mag:john-xxiii/urbi-et-orbi-christmas-1961', 'mag:john-xxiii/urbi-et-orbi-easter-1960',
      'mag:john-xxiii/urbi-et-orbi-easter-1961',
    ]);
    expect(byMedium('video')).toEqual([
      'mag:francis-i/world-youth-day-2019', 'mag:leo-xiv/world-mission-day-2025',
    ]);
    for (const d of everything) {
      const named = /radiomessagg/i.test(d.title) ? 'radio' : /videomessagg/i.test(d.title) ? 'video' : undefined;
      expect(d.medium, d.id).toBe(named);
    }
    // The medium describes delivery, not the act: the three feast-day radio messages keep
    // their Urbi et Orbi genre, liturgical actKind and dated series.
    for (const d of everything.filter((d) => d.medium === 'radio' && d.genre === 'urbi-et-orbi')) {
      expect(d.actKind, d.id).toBe('liturgical');
      expect(d.series?.id, d.id).toMatch(/^urbi-et-orbi-(christmas|easter)$/);
    }
  });

  it('populates series only from the Messaggi shelves (#4)', () => {
    for (const d of everything) {
      if (d.series) expect(isMessagesShelf(d.source?.shelf ?? null), d.id).toBe(true);
    }
  });

  it('keeps the keyword out of every authority-bearing field', () => {
    for (const d of everything) {
      expect(d.characteristics ?? [], d.id).not.toContain('circumscription-erection');
      expect(d.characteristics ?? [], d.id).not.toContain('circumscription-elevation');
    }
  });

  it('never tags a document as both a circumscription erection and a circumscription '
    + 'elevation -- ERECTION_PHRASES and ELEVATION_PHRASES (keywords.ts) are disjoint over '
    + 'the whole harvested corpus, not merely over the synthetic titles exercised in '
    + 'keywords.test.ts', () => {
    const both = everything.filter((d) => d.keywords?.includes('circumscription-erection')
      && d.keywords?.includes('circumscription-elevation'));
    expect(both.map((d) => d.id)).toEqual([]);
  });

  it('tags exactly the circumscription-elevation documents measured for Task 20, enumerated '
    + 'here so a future change to ELEVATION_PHRASES surfaces its effect on the real corpus', () => {
    // Seven earned the keyword from their heading (ELEVATION_PHRASES); the other hundred
    // and thirty-two are the hand-curated CIRCUMSCRIPTION_ELEVATIONS rows of the Pius XII,
    // John XXIII, Benedict XVI, Paul VI and John Paul II instalments, which tag by key
    // rather than by heading.
    const elevated = everything.filter((d) => d.keywords?.includes('circumscription-elevation'));
    expect(elevated.map((d) => d.id).sort()).toEqual([
      'mag:benedict-xvi/cassoviensis-2008',
      'mag:benedict-xvi/galapagensis-2008',
      'mag:benedict-xvi/gimaensis-bongana-2009',
      'mag:benedict-xvi/huariensis-2008',
      'mag:benedict-xvi/impfondensis-2011',
      'mag:benedict-xvi/ipilensis-2010',
      'mag:benedict-xvi/kyrgyzstaniae-2006',
      'mag:benedict-xvi/machiquesensis-2011',
      'mag:benedict-xvi/mongensis-2009',
      'mag:benedict-xvi/obidensis-2011',
      'mag:benedict-xvi/quettensis-2010',
      'mag:francis-i/attenta-deliberatione-2014',
      'mag:francis-i/de-spiritali-itinere-2015',
      'mag:francis-i/qui-successimus-2015',
      'mag:francis-i/undecim-abhinc-annos-2014',
      'mag:john-paul-ii/abaetiensis-ad-tocantinsum-et-aliarum-1981',
      'mag:john-paul-ii/abuiensis-1989',
      'mag:john-paul-ii/aguaricoensis-1984',
      'mag:john-paul-ii/antioquiensis-1988',
      'mag:john-paul-ii/anuradhapurensis-1982',
      'mag:john-paul-ii/araucensis-1984',
      'mag:john-paul-ii/argentoratensis-1988',
      'mag:john-paul-ii/ariariensis-1987',
      'mag:john-paul-ii/aricensis-1986',
      'mag:john-paul-ii/balasorensis-1989',
      'mag:john-paul-ii/bomadiensis-1995',
      'mag:john-paul-ii/candimendensis-1983',
      'mag:john-paul-ii/chinhoyiensis-1985',
      'mag:john-paul-ii/chiquitosensis-seu-sancti-ignatii-velascani-1994',
      'mag:john-paul-ii/chisinauensis-2001',
      'mag:john-paul-ii/cholutecensis-1979',
      'mag:john-paul-ii/chulucanensis-1988',
      'mag:john-paul-ii/coloratensis-1996',
      'mag:john-paul-ii/coroicensis-1983',
      'mag:john-paul-ii/coxinensis-2002',
      'mag:john-paul-ii/cuauhtemocensis-materiensis-1995',
      'mag:john-paul-ii/escuintlensis-in-guatimala-1994',
      'mag:john-paul-ii/garissaensis-1984',
      'mag:john-paul-ii/guaiaramirensis-1979',
      'mag:john-paul-ii/guamensis-1979',
      'mag:john-paul-ii/guapiensis-2001',
      'mag:john-paul-ii/guiratingensis-et-aliarum-1981',
      'mag:john-paul-ii/iammuensis-srinagarensis-1986',
      'mag:john-paul-ii/ingvavumensis-1989',
      'mag:john-paul-ii/iuigalpensis-1990',
      'mag:john-paul-ii/iuticalpensis-1987',
      'mag:john-paul-ii/izabalensis-1988',
      'mag:john-paul-ii/kanensis-1995',
      'mag:john-paul-ii/kankanensis-1993',
      'mag:john-paul-ii/keetmanshoopensis-1994',
      'mag:john-paul-ii/limonensis-1994',
      'mag:john-paul-ii/luxemburgensis-1988',
      'mag:john-paul-ii/lyciensis-1980',
      'mag:john-paul-ii/mandevillensis-1997',
      'mag:john-paul-ii/mekiensis-1991',
      'mag:john-paul-ii/mercedensis-luianensis-1997',
      'mag:john-paul-ii/mituensis-1989',
      'mag:john-paul-ii/monoecensis-1981',
      'mag:john-paul-ii/mvanzaensis-1987',
      'mag:john-paul-ii/neograndicasensis-2000',
      'mag:john-paul-ii/paciensis-in-california-infer-merid-1988',
      'mag:john-paul-ii/pietersburgensis-1988',
      'mag:john-paul-ii/pinnensis-piscariensis-1982',
      'mag:john-paul-ii/premisliensis-varsaviensis-1996',
      'mag:john-paul-ii/riviascianensis-1988',
      'mag:john-paul-ii/rustenburgensis-1987',
      'mag:john-paul-ii/santaremensis-et-aliae-1979',
      'mag:john-paul-ii/sibolgaensis-1980',
      'mag:john-paul-ii/tarahumarensis-1993',
      'mag:john-paul-ii/tarmensis-1985',
      'mag:john-paul-ii/tiranensis-dyrracena-2005',
      'mag:john-paul-ii/trudensis-1979',
      'mag:john-paul-ii/villaricensis-2002',
      'mag:john-paul-ii/zanzibarensis-1980',
      'mag:john-xxiii/changanacherrensis-et-aliarum-1959',
      'mag:john-xxiii/hiroshimaensis-1959',
      'mag:john-xxiii/lagosensis-kadunaensis-1959',
      'mag:john-xxiii/munduensis-1959',
      'mag:john-xxiii/nagasakiensis-qui-cotidie-1959',
      'mag:john-xxiii/nzerekoreensis-1959',
      'mag:john-xxiii/oturkpoensis-1959',
      'mag:leo-xiv/verba-christi-2025',
      'mag:paul-vi/aganensis-1965',
      'mag:paul-vi/amidensis-chaldaeorum-1966',
      'mag:paul-vi/araucensis-1970',
      'mag:paul-vi/banarensis-1970',
      'mag:paul-vi/bangassuensis-1964',
      'mag:paul-vi/barcinonensis-1964',
      'mag:paul-vi/bataensis-1966',
      'mag:paul-vi/bhagalpurensis-1965',
      'mag:paul-vi/bossangoaensis-1964',
      'mag:paul-vi/broomensis-1966',
      'mag:paul-vi/caacupensis-1967',
      'mag:paul-vi/canelosensis-1964',
      'mag:paul-vi/dapagoensis-1965',
      'mag:paul-vi/davaensis-1966',
      'mag:paul-vi/deaarensis-1967',
      'mag:paul-vi/dorumaensis-1967',
      'mag:paul-vi/gaberonensis-1966',
      'mag:paul-vi/hamiltonensis-1967',
      'mag:paul-vi/hermosillensis-1963',
      'mag:paul-vi/ilorinensis-1969',
      'mag:paul-vi/iullundurensis-1971',
      'mag:paul-vi/kabbaensis-1964',
      'mag:paul-vi/kaolackensis-1965',
      'mag:paul-vi/kasamaensis-et-aliarum-1967',
      'mag:paul-vi/kayensis-1963',
      'mag:paul-vi/kengensis-1963',
      'mag:paul-vi/kituiensis-1963',
      'mag:paul-vi/kolensis-1967',
      'mag:paul-vi/machalensis-1969',
      'mag:paul-vi/maidugurensis-1966',
      'mag:paul-vi/matritensis-1964',
      'mag:paul-vi/mendiensis-1965',
      'mag:paul-vi/moptiensis-1964',
      'mag:paul-vi/mvekaensis-1964',
      'mag:paul-vi/palaensis-1964',
      'mag:paul-vi/parakuensis-1964',
      'mag:paul-vi/piurensis-et-aliarum-1966',
      'mag:paul-vi/ptolemaidensis-melchitarum-1964',
      'mag:paul-vi/reykjavikensis-1968',
      'mag:paul-vi/rosariensis-1963',
      'mag:paul-vi/sanensis-1964',
      'mag:paul-vi/shikokuensis-1963',
      'mag:paul-vi/sikassensis-1963',
      'mag:paul-vi/sokotoensis-1964',
      'mag:paul-vi/tigiuanaensis-1963',
      'mag:paul-vi/valleduparensis-1969',
      'mag:paul-vi/villavicentiensis-1964',
      'mag:paul-vi/weetebulaensis-1969',
      'mag:pius-xii/bathurstensis-in-gambia-1957',
      'mag:pius-xii/bikoroensis-1957',
      'mag:pius-xii/copiapoensis-1957',
      'mag:pius-xii/esmeraldensis-1957',
      'mag:pius-xii/musomensis-1957',
      'mag:pius-xii/spinensis-1957',
      'mag:pius-xii/tangaensis-1958',
      'mag:pius-xii/thakhekensis-1958',
      'mag:pius-xii/urawaensis-1957',
    ].sort());
  });
});

describe('the recovered-incipit shelf', () => {
  const everything = readdirSync('data/documents')
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[]);

  it('lands every curated row on exactly one minted record', () => {
    // The closed-set rule: a row that matches nothing is a curation error -- a title that
    // changed on vatican.va, or a key typed by hand -- and must fail loudly rather than
    // sit unnoticed while the record it meant to name stays provisional.
    for (const [key, row] of Object.entries(RECOVERED_INCIPITS)) {
      const date = key.split('|')[2]!;
      const hits = everything.filter((d) => d.date === date && d.incipit === row.incipit);
      expect(hits, key).toHaveLength(1);
      expect(hits[0]!.idStatus, key).toBe('minted');
    }
  });

  it('mints the seventeen identifiers the curation approved', () => {
    const ids = Object.values(RECOVERED_INCIPITS)
      .map((row) => everything.find((d) => d.incipit === row.incipit)!.id)
      .sort();
    expect(ids).toEqual([
      'mag:john-paul-i/cum-probe-1978',
      'mag:john-paul-i/progredientibus-iam-1978',
      'mag:john-paul-i/propterea-maxime-1978',
      'mag:john-xxiii/celebrandi-concilii-oecumenici-1961',
      'mag:john-xxiii/centesimo-vertente-anno-1961',
      'mag:john-xxiii/il-religioso-convegno-1961',
      'mag:john-xxiii/le-voci-1961',
      'mag:john-xxiii/maiora-in-dies-1959',
      'mag:john-xxiii/superno-dei-1960',
      'mag:leo-xiv/confirma-fratres-tuos-2026',
      'mag:paul-vi/in-spiritu-sancto-1965',
      'mag:paul-vi/positum-est-1973',
      'mag:pius-xi/ci-si-e-domandato-1929',
      'mag:pius-xii/clarius-explendescit-1958',
      'mag:pius-xii/haud-mediocrem-1941',
      'mag:pius-xii/quamquam-1954',
      'mag:pius-xii/volvidos-cinco-anos-1947',
    ]);
  });

  it('retires the two John Paul I ordinals, which shared 1978-09-01', () => {
    // Both were provisional on the same date and so carried -1/-2 suffixes; distinct
    // incipits remove the collision that made the ordinals necessary.
    // Filtered to apostolic letters: a plain `letter` to Cardinal Ratzinger shares the date
    // and is untouched by this work.
    const jpi = everything.filter((d) => d.issuerId === 'rp:john-paul-i'
      && d.date === '1978-09-01' && d.genre === 'apostolic-letter');
    expect(jpi.map((d) => d.id).sort()).toEqual([
      'mag:john-paul-i/progredientibus-iam-1978', 'mag:john-paul-i/propterea-maxime-1978',
    ]);
  });

  it('leaves the provisional shelf at 299 on the formal shelves -- sixteen recovered, one merged away', () => {
    // Plus the five Urbi et Orbi dated neither 25 December nor Easter Sunday, which take
    // the provisional form by design (messages spec §3.2.7); counted in their own block.
    // Plus the eight series-shelf items excluded from their series (Paul VI's 1975 day of
    // the sick and John XXIII's seven radio messages), which are provisional messages.
    // Plus the 399 records created from the AAS index without an incipit -- 75 constitutions
    // of 2015-2024 named by toponym only (AAS-only documents spec §4), five of the
    // phase-2b sample (acta volumes spec §5) and 319 of the volumes of 1932-1957 (phase
    // 2b-ii-a: the constitutions of 1932-1945 named by the see and its vernacular, the
    // letters the index enters by their addressee) -- counted in their own block.
    const formal = everything.filter((d) => !isMessagesShelf(d.source?.shelf ?? null) && !isActaShelf(d.source?.shelf));
    expect(formal.filter((d) => d.idStatus === 'provisional')).toHaveLength(299);
    expect(everything.filter((d) => d.idStatus === 'provisional')).toHaveLength(299 + 5 + 8 + 75 + 5 + 320);
  });

  it('keeps the two Leo XIV 2025 letters provisional, which AAS confirms have no incipit', () => {
    const stay = everything.filter((d) => d.issuerId === 'rp:leo-xiv'
      && (d.date === '2025-11-19' || d.date === '2025-12-11'));
    expect(stay).toHaveLength(2);
    for (const d of stay) expect(d.idStatus, d.id).toBe('provisional');
  });
});

describe('the twice-published 1968 beatification letter', () => {
  const pvi = load('paul-vi');

  it('holds the act once, not twice', () => {
    // vatican.va publishes one act on two pages: _19681013_quem-ad-modum (which prints the
    // incipit and the AAS footnote) and _19681030_famulae-mariae (which prints neither).
    // Their texts are identical down to the signatories.
    expect(pvi.filter((d) => d.incipit === 'Quem ad modum')).toHaveLength(1);
  });

  it('dates it as the document dates itself, not as the index heading does', () => {
    // BOTH pages print 'Datum Romae, apud S. Petrum, sub anulo Piscatoris, die tertio decimo
    // mensis Octobris, anno MCMLXVIII' -- 13 October. The 30 October date exists only in the
    // shelf-index heading, contradicted by the very document it points at, and AAS 60's index
    // agrees with the document (Oct. 13, pp. 673-680).
    const d = pvi.find((r) => r.incipit === 'Quem ad modum')!;
    expect(d.date).toBe('1968-10-13');
    expect(d.id).toBe('mag:paul-vi/quem-ad-modum-1968');
    expect(pvi.filter((r) => r.date === '1968-10-30')).toHaveLength(0);
  });

  it('keeps the dropped page\'s heading rather than losing it', () => {
    const d = pvi.find((r) => r.incipit === 'Quem ad modum')!;
    expect(d.aliases).toContain('Venerabili Dei Famulae Mariae ab Apostolis Beatorum honores decernuntur');
  });
});

describe('the 1961 Rosary letter and the meditation published with it', () => {
  const jx = load('john-xxiii');
  // Three documents share 29 September 1961; the third, 'In colle' for the Tibidabo
  // sanctuary, is unrelated to this pair and untouched by the pass-2 change.
  const sameDay = jx.filter((d) => d.date === '1961-09-29'
    && (d.source?.url ?? '').includes('religioso-convegno'));

  it('keeps the meditation as its own record rather than folding it into the letter', () => {
    // Two genuinely different texts share a URL document slug: the apostolic letter
    // (hf_j-xxiii_apl_19610929_religioso-convegno, 15.9k chars) and a complementary set of
    // Rosary meditations (hf_j-xxiii_meditation_19610929_religioso-convegno, 25.4k chars,
    // 'Piccolo saggio di devoti pensieri dei misteri del Rosario'). Only the segment before
    // the date distinguishes them -- apl against meditation -- so a pass-2 key built from the
    // trailing slug alone silently absorbed the second into the first.
    expect(sameDay).toHaveLength(2);
    const letter = sameDay.find((d) => d.incipit === 'Il religioso convegno')!;
    const meditation = sameDay.find((d) => d.title.startsWith('Piccolo saggio'))!;
    expect(letter).toBeDefined();
    expect(meditation).toBeDefined();
    expect(letter.source!.url).toContain('_apl_19610929_religioso-convegno');
    expect(meditation.source!.url).toContain('_meditation_19610929_religioso-convegno');
  });

  it('files the meditation as a prayer, the genre the Genre Registry has for it', () => {
    // Its shelf says apost_letters, but the text is a set of Rosary meditations, not an
    // apostolic letter. `prayer` is the Genre Registry row that fits, and it is papal-issued,
    // so invariant 17 is satisfied. The provisional id follows the genre, as it does everywhere.
    const meditation = sameDay.find((d) => d.title.startsWith('Piccolo saggio'))!;
    expect(meditation.genre).toBe('prayer');
    expect(meditation.id).toBe('mag:john-xxiii/prayer-1961-09-29');
    // The shelf label is still recorded verbatim, so the override stays auditable.
    expect(meditation.sourceGenreLabel).toBe('apost_letters');
  });

  it('no longer records the meditation as a mere alias of the letter', () => {
    const letter = sameDay.find((d) => d.incipit === 'Il religioso convegno')!;
    expect(letter.aliases ?? []).not.toContain(
      'Piccolo saggio di devoti pensieri distribuiti per ogni decina del Rosario, '
      + 'come a complemento della Lettera Apostolica Il religioso convegno');
  });
});

describe('the circumscription queue', () => {
  const everything = readdirSync('data/documents')
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[]);
  const remaining = everything.filter(isUnconfirmedCandidate);

  it('has adjudicated every candidate in the corpus', () => {
    expect(remaining).toEqual([]);
  });

  it('awards Pius XII nine elevations, none of them erections', () => {
    // The first instalment confirmed 19 erections here and rejected these nine by hand.
    const pxii = everything.filter((d) => d.issuerId === 'rp:pius-xii');
    expect(pxii.filter((d) => d.keywords?.includes('circumscription-elevation'))).toHaveLength(9);
    expect(pxii.filter((d) => d.keywords?.includes('circumscription-erection'))).toHaveLength(19);
  });
});

describe('the Messaggi shelves (messages spec)', () => {
  const everything = readdirSync('data/documents')
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[]);
  const messages = everything.filter((d) => isMessagesShelf(d.source?.shelf ?? null));
  const seriesDocs = messages.filter((d) => d.series);
  const urbi = messages.filter((d) => d.genre === 'urbi-et-orbi');
  const pageSlugOf = (d: DocumentRecord) => d.source!.url!.match(/\/content\/([^/]+)\//)![1]!;
  const curationKey = (d: DocumentRecord) =>
    `${pageSlugOf(d)}|${d.source!.shelf}|${slugify(d.title)}|${d.date}`;

  it('holds every item of the sixty series and Urbi et Orbi sub-shelves, one merged away', () => {
    // 691 div.item entries across the 60 fixtures (measured 2026-09-12); Pius XII's urbi
    // shelf lists the Easter 1956 message twice, once under a mistyped 1953 URL date
    // (DATE_CORRECTIONS), and pass 1 merges the pair. 691 - 1 = 690. Pinned per pope so
    // a silently dropped sub-shelf fails here rather than vanishing.
    expect(messages).toHaveLength(690);
    const perPope = Object.fromEntries(
      ['pius-xii', 'john-xxiii', 'paul-vi', 'john-paul-ii', 'benedict-xvi', 'francis-i', 'leo-xiv']
        .map((p) => [p, messages.filter((d) => d.issuerId === `rp:${p}`).length]));
    expect(perPope).toEqual({
      'pius-xii': 7, 'john-xxiii': 15, 'paul-vi': 90, 'john-paul-ii': 304,
      'benedict-xvi': 87, 'francis-i': 168, 'leo-xiv': 19,
    });
  });

  it('pins the per-series counts, so a silent drop fails loudly', () => {
    const perSeries = Object.fromEntries([...new Set(seriesDocs.map((d) => d.series!.id))].sort()
      .map((id) => [id, seriesDocs.filter((d) => d.series!.id === id).length]));
    expect(perSeries).toEqual({
      'lent': 54,
      'urbi-et-orbi-christmas': 67,
      'urbi-et-orbi-easter': 73,
      'world-childrens-day': 1,
      'world-communications-day': 60,
      'world-day-for-consecrated-life': 21,
      'world-day-of-grandparents-and-the-elderly': 6,
      'world-day-of-migrants-and-refugees': 49,
      'world-day-of-peace': 59,
      'world-day-of-prayer-for-the-care-of-creation': 12,
      'world-day-of-prayer-for-vocations': 61,
      'world-day-of-the-poor': 10,
      'world-day-of-the-sick': 34,
      'world-food-day': 42,
      'world-literacy-day': 20,
      'world-mission-day': 64,
      'world-tourism-day': 6,
      'world-youth-day': 38,
    });
    // 5 Urbi et Orbi with no series, and the eight excluded series-shelf items.
    expect(seriesDocs).toHaveLength(690 - 5 - 8);
  });

  it('files every series sub-shelf item as a message -- or a homily, where the URL says so -- and every urbi item as an Urbi et Orbi', () => {
    // Measured over every messages/* shelf: exactly 11 URLs carry `omelia`, all of them
    // Francis's consecrated_life pages (2014-2022, 2024, 2025); the 2023 item is a messaggio.
    const homilies = messages.filter((d) => /omelia/.test(d.source?.url ?? ''));
    expect(homilies.map((d) => d.id).sort()).toEqual([
      2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2024, 2025,
    ].map((y) => `mag:francis-i/world-day-for-consecrated-life-${y}`));
    for (const d of messages) {
      const shelf = seriesForShelf(d.source!.shelf);
      expect(shelf, d.id).not.toBeNull();
      // An excluded item on the urbi shelf is a radio message, not a blessing (SERIES_EXCLUSIONS).
      const excluded = SERIES_EXCLUSIONS[curationKey(d)] !== undefined;
      expect(d.genre, d.id).toBe(excluded ? 'message' : shelf!.kind === 'urbi' ? 'urbi-et-orbi'
        : homilies.includes(d) ? 'homily' : 'message');
      expect(d.sourceGenreLabel, d.id).toBe(d.source!.shelf);
      expect(d.characteristics, d.id).toBeUndefined();
      expect(d.incipit, d.id).toBeUndefined();
    }
    // A homily on the day is a member of the series all the same: the id rule triggers on membership.
    for (const d of homilies) expect(d.series?.id, d.id).toBe('world-day-for-consecrated-life');
  });

  it('gives every message a series in this PR -- the occasional pont-messages shelf is out of scope -- except the evidenced exclusions', () => {
    // Paul VI's 'Giornata Mondiale del Malato - 1975' is a Holy Year day, not the annual
    // World Day of the Sick of 1993 on; John XXIII's seven radio messages to the world are
    // filed on his urbi_et_orbi shelf but are messages, not blessings (SERIES_EXCLUSIONS).
    // Each takes the provisional form, as every pont-messages item will.
    const plain = everything.filter((d) => d.genre === 'message');
    expect(plain).toHaveLength(538 - 11 + 7);
    const excluded = plain.filter((d) => !d.series);
    expect(excluded.map((d) => d.id).sort()).toEqual([
      'mag:john-xxiii/message-1960-12-22', 'mag:john-xxiii/message-1961-09-10',
      'mag:john-xxiii/message-1961-12-21', 'mag:john-xxiii/message-1962-04-21',
      'mag:john-xxiii/message-1962-08-12', 'mag:john-xxiii/message-1963-02-27',
      'mag:john-xxiii/message-1963-04-13', 'mag:paul-vi/message-1975-09-16',
    ]);
    for (const d of excluded) {
      expect(d.idStatus, d.id).toBe('provisional');
      expect(d.actKind, d.id).toBeUndefined();
    }
    expect(excluded.find((d) => d.id === 'mag:paul-vi/message-1975-09-16')!.source!.shelf).toBe('messages/sick');
    for (const d of plain) {
      if (excluded.includes(d)) continue;
      expect(d.series, d.id).toBeDefined();
      expect(d.idStatus, d.id).toBe('minted');
      expect(d.actKind, d.id).toBeUndefined();
    }
  });

  it('gives every series document an occasion year and the series-form id', () => {
    for (const d of seriesDocs) {
      expect(Number.isInteger(d.series!.year), d.id).toBe(true);
      expect(d.id, d.id).toBe(`mag:${d.issuerId.slice(3)}/${d.series!.id}-${d.series!.year}`);
      expect(d.idStatus, d.id).toBe('minted');
    }
  });

  it('marks every Urbi et Orbi as a liturgical act, in a dated series or not', () => {
    expect(urbi).toHaveLength(152 - 7);
    for (const d of urbi) expect(d.actKind, d.id).toBe('liturgical');
  });

  it('classifies the Urbi et Orbi by date -- 25 December, Easter Sunday, or neither -- unless a curated row names the occasion', () => {
    const neither: string[] = [];
    for (const d of urbi) {
      const year = Number(d.date.slice(0, 4));
      const curated = SERIES_URBI_OCCASIONS[curationKey(d)];
      const expected = curated ? curated.series
        : d.date.endsWith('-12-25') ? 'urbi-et-orbi-christmas'
        : d.date === easterSunday(year) ? 'urbi-et-orbi-easter' : null;
      expect(d.series?.id ?? null, d.id).toBe(expected);
      if (curated) expect(d.series!.year, d.id).toBe(curated.year);
      if (expected === null) {
        neither.push(d.id);
        expect(d.idStatus, d.id).toBe('provisional');
        expect(d.id, d.id).toMatch(/^mag:[a-z0-9-]+\/urbi-et-orbi-\d{4}-\d{2}-\d{2}$/);
      }
    }
    expect(neither.sort()).toEqual([
      'mag:benedict-xvi/urbi-et-orbi-2005-04-20',
      'mag:francis-i/urbi-et-orbi-2020-03-27',
      'mag:john-paul-ii/urbi-et-orbi-1999-12-31',
      'mag:john-paul-ii/urbi-et-orbi-2000-12-31',
      'mag:leo-xiv/urbi-et-orbi-2025-05-08',
    ]);
    // The one curated occasion: the shelf's only Christmas 1962 item, headed 'Santo Natale
    // (25 dicembre 1962)' but dated 22 December by the document (SERIES_URBI_OCCASIONS).
    expect(Object.keys(SERIES_URBI_OCCASIONS)).toEqual(['john-xxiii|messages/urbi_et_orbi|santo-natale|1962-12-22']);
    const natale = urbi.find((d) => d.id === 'mag:john-xxiii/urbi-et-orbi-christmas-1962')!;
    expect(natale.date).toBe('1962-12-22');
    expect(natale.idStatus).toBe('minted');
  });

  it('records an ordinal exactly where the title prints one or a curated row supplies it', () => {
    for (const d of seriesDocs) {
      if (d.genre === 'urbi-et-orbi') { expect(d.series!.ordinal, d.id).toBeUndefined(); continue; }
      const curated = SERIES_ORDINALS[curationKey(d)];
      const read = readOrdinal(d.title);
      const expected = curated?.ordinal ?? (read.kind === 'read' ? read.value : undefined);
      expect(d.series!.ordinal, d.id).toBe(expected);
      // A printed token the parser cannot read must have a curated row: nothing is dropped silently.
      if (read.kind === 'unreadable') expect(curated, `${d.id}: '${read.printed}'`).toBeDefined();
    }
  });

  it('reads the ordinal in both scripts, and takes the year from the title, never from date', () => {
    const by = Object.fromEntries(seriesDocs.map((d) => [d.id, d]));
    expect(by['mag:francis-i/world-day-of-peace-2025']!.series).toEqual(
      { id: 'world-day-of-peace', year: 2025, ordinal: 58 });
    expect(by['mag:francis-i/world-day-of-peace-2025']!.date).toBe('2024-12-08');
    expect(by['mag:paul-vi/world-day-of-peace-1968']!.series).toEqual(
      { id: 'world-day-of-peace', year: 1968, ordinal: 1 });
    expect(by['mag:francis-i/world-day-of-migrants-and-refugees-2024']!.series!.ordinal).toBe(110);
    expect(by['mag:francis-i/world-day-of-prayer-for-vocations-2025']!.series!.ordinal).toBe(62);
    expect(by['mag:leo-xiv/world-mission-day-2026']!.series!.ordinal).toBe(100);
    expect(by['mag:francis-i/lent-2015']!.series).toEqual({ id: 'lent', year: 2015 });
    expect(by['mag:francis-i/lent-2015']!.title).toBe('Quaresima 2015: Rinfrancate i vostri cuori (Gc 5,8)');
    // The consecrated-life 2023 entry is titled without an ordinal inside a numbered series.
    expect(by['mag:francis-i/world-day-for-consecrated-life-2023']!.series)
      .toEqual({ id: 'world-day-for-consecrated-life', year: 2023 });
  });

  it("resolves Leo XIV's renamed sub-shelves to the same series as their predecessors'", () => {
    const by = Object.fromEntries(seriesDocs.map((d) => [d.id, d]));
    expect(by['mag:leo-xiv/world-mission-day-2026']!.source!.shelf).toBe('messages/mission');
    expect(by['mag:francis-i/world-mission-day-2025']!.source!.shelf).toBe('messages/missions');
    expect(by['mag:leo-xiv/world-day-of-the-poor-2025']!.source!.shelf).toBe('messages/poor');
    expect(by['mag:leo-xiv/world-day-of-grandparents-and-the-elderly-2025']!.source!.shelf)
      .toBe('messages/grandparents');
    expect(by['mag:leo-xiv/world-day-of-prayer-for-the-care-of-creation-2025']!.source!.shelf)
      .toBe('messages/creation');
    expect(by['mag:john-xxiii/urbi-et-orbi-easter-1963']!.source!.shelf).toBe('messages/urbi_et_orbi');
  });

  it('lands every curated occasion-year and ordinal row on exactly one record (closed set)', () => {
    const keys = new Map(messages.map((d) => [curationKey(d), d]));
    for (const [key, row] of Object.entries(SERIES_OCCASION_YEARS)) {
      const hit = keys.get(key);
      expect(hit, key).toBeDefined();
      expect(hit!.series!.year, key).toBe(row.year);
      // A fill fills a gap; a correction overrides what was printed. Either way the parser
      // alone would not have produced this year.
      const read = readOccasionYear(hit!.title);
      if (row.printed === null) expect(read.kind, key).toBe('none');
      else expect(read.kind === 'read' ? read.value : null, key).not.toBe(row.year);
    }
    for (const [key, row] of Object.entries(SERIES_ORDINALS)) {
      const hit = keys.get(key);
      expect(hit, key).toBeDefined();
      expect(hit!.series!.ordinal, key).toBe(row.ordinal);
      const read = readOrdinal(hit!.title);
      expect(read.kind === 'read' ? read.printed : read.kind === 'unreadable' ? read.printed : null, key)
        .toBe(row.printed);
    }
    for (const [key, row] of Object.entries(SERIES_EXCLUSIONS)) {
      const hit = keys.get(key);
      expect(hit, key).toBeDefined();
      expect(hit!.series, key).toBeUndefined();
      expect(hit!.genre, key).toBe('message');
      expect(row.evidence, key).toBeTruthy();
    }
    for (const [key, row] of Object.entries(SERIES_URBI_OCCASIONS)) {
      const hit = keys.get(key);
      expect(hit, key).toBeDefined();
      expect(hit!.series, key).toEqual({ id: row.series, year: row.year });
      expect(row.evidence, key).toBeTruthy();
    }
    expect(Object.keys(SERIES_OCCASION_YEARS)).toHaveLength(32);
    expect(Object.keys(SERIES_ORDINALS)).toHaveLength(5);
    expect(Object.keys(SERIES_EXCLUSIONS)).toHaveLength(8);
    expect(Object.keys(SERIES_URBI_OCCASIONS)).toHaveLength(1);
  });

  it('checks the printed ordinal against firstYear on 276 documents and finds no disagreement', () => {
    const rows = new Map(SERIES.filter((s) => s.firstYear).map((s) => [s.id, s]));
    const checked = seriesDocs.filter((d) => d.series!.ordinal !== undefined && rows.has(d.series!.id));
    expect(checked).toHaveLength(276);
    for (const d of checked) {
      expect(d.series!.ordinal, d.id).toBe(expectedOrdinal(rows.get(d.series!.id)!, d.series!.year));
    }
    expect(checkDocuments(messages, genres, keywords, series).filter((v) => v.rule === 24)).toEqual([]);
  });

  it('applies the 2025 reset of the Care of Creation numbering: X in 2025 repeats X, 2026 is XI', () => {
    const by = Object.fromEntries(seriesDocs.map((d) => [d.id, d]));
    const s = 'world-day-of-prayer-for-the-care-of-creation';
    expect(by[`mag:francis-i/${s}-2020`]!.series!.ordinal).toBe(6);
    expect(by[`mag:leo-xiv/${s}-2025`]!.series!.ordinal).toBe(10);
    expect(by[`mag:leo-xiv/${s}-2026`]!.series!.ordinal).toBe(11);
  });

  it('satisfies every invariant, alone and beside the formal shelves', () => {
    expect(checkDocuments(messages, genres, keywords, series)).toEqual([]);
    expect(checkDocuments(everything, genres, keywords, series)).toEqual([]);
  });

  it('merges no message with a formal-shelf record: no alsoShelvedAs crosses into messages/*', () => {
    const crossed = everything.filter((d) =>
      d.source?.alsoShelvedAs?.some((s) => isMessagesShelf(s))
      || (isMessagesShelf(d.source?.shelf ?? null) && d.source?.alsoShelvedAs?.length));
    expect(crossed.map((d) => d.id)).toEqual([]);
  });

  it('lists every messages/* shelf of POPES on a series row, and no series row names a shelf no pope has', () => {
    const configured = new Set(POPES.flatMap((p) => p.shelves).filter(isMessagesShelf)
      .map((s) => s.slice('messages/'.length)));
    for (const shelf of configured) expect(() => seriesForShelf(`messages/${shelf}`), shelf).not.toThrow();
    for (const row of SERIES) {
      for (const shelf of row.shelves) expect(configured.has(shelf), `${row.id}: ${shelf}`).toBe(true);
    }
  });

  it('records the fixture retrieval date for every document', () => {
    expect(messages.every((d) => d.source?.retrieved === POPE_FIXTURES_RETRIEVED)).toBe(true);
  });
});

describe('the AAS reference (acta reference spec)', () => {
  const everything = readdirSync('data/documents').filter((f) => f.endsWith('.json'))
    .flatMap((f) => loadAll(f.replace(/\.json$/, '')));
  // The shelf documents an index entry matched; the documents created from the index
  // carry `acta` too and have their own block below.
  const cited = everything.filter((d) => d.acta !== undefined && !isActaShelf(d.source?.shelf));

  const sourceOf = (d: DocumentRecord) => `${d.acta!.year}${d.acta!.part ? `-${d.acta!.part}` : ''}`;

  it('pins the matched count per source, so a silent drop fails loudly', () => {
    // 2,399 entries parsed from the ten annual indexes, 867 in a harvested category; 222
    // matched on 2026-09-12 (the join report in docs/superpowers/reports/ lists the rest),
    // 225 once the two curated index corrections (De concordia inter Codices, Vultum Dei
    // quaerere) and the day-less-date fix of the parser (Episcopalis communio) landed with
    // the AAS-only documents. Phase 2b-i (acta volumes spec §5) adds the six sample
    // sources -- 129 references from 1917-I, 1931, 1958, 1978 and 2012 (none from 1909,
    // whose OCR lost the page column) -- and leaves the ten of 2015-2024 as they were.
    // Phase 2b-ii-a (spec §9) adds the 26 volumes of 1932-1957: 144 references from 24 of
    // them (AAS 26 (1934) and 27 (1935) cite nothing the shelves hold), thin because the
    // Pius XI and Pius XII shelves are (18 and 227 records dated in the era); three of them
    // -- *Munificentissimus Deus*, *Humani generis*, *Ad Sinarum gentem* -- by curated rows
    // supplying the year the index does not print (curation.ts).
    // A change to a fixture, the parser, the matcher or a shelf harvest moves these.
    const bySource = new Map<string, number>();
    for (const d of cited) bySource.set(sourceOf(d), (bySource.get(sourceOf(d)) ?? 0) + 1);
    expect(Object.fromEntries([...bySource].sort())).toEqual({
      '1917-I': 1, '1931': 4,
      '1932': 2, '1933': 2, '1936': 4, '1937': 4, '1938': 1, '1939': 3, '1940': 4, '1941': 2, '1942': 5, '1943': 6, '1944': 8, '1945': 3,
      '1946': 11, '1947': 11, '1948': 10, '1949': 9, '1950': 11, '1951': 5, '1952': 6, '1953': 11, '1954': 11, '1955': 1, '1956': 8, '1957': 6,
      '1958': 71, '1978': 29, '2012': 24,
      '2015': 38, '2016': 26, '2017': 14, '2018': 15, '2019': 17, '2020': 18, '2021': 24, '2022': 18, '2023': 29, '2024': 26,
    });
    expect(cited).toHaveLength(225 + 129 + 144);
    // By class: the index's *Nuntii* carry the Christmas and Easter Urbi et Orbi, and the
    // volumes' *Nuntii radiophonici* / *radiotelevisifici* three more (1958, 1978).
    const byClass = new Map<string, number>();
    for (const d of cited) {
      const k = `${d.genre}${d.characteristics?.length ? '+' + d.characteristics.join('+') : ''}`;
      byClass.set(k, (byClass.get(k) ?? 0) + 1);
    }
    expect(Object.fromEntries([...byClass].sort())).toEqual({
      // Finis et modus moves from the motu_proprio decree to the apost_letters letter by
      // the curated override (curation.ts), hence 24 plain letters and 47 motu proprio
      // in 2015-2024; the rest are the sample's and the 1932-1957 volumes' (45 encyclicals
      // of Pius XI and Pius XII among them, and the three Easter Urbi et Orbi of 1952-1957).
      'apostolic-exhortation': 15, 'apostolic-letter': 75, 'apostolic-letter+motu-proprio': 62, encyclical: 56,
      letter: 68, message: 105, 'papal-bull': 2, 'papal-bull+apostolic-constitution': 87, 'urbi-et-orbi': 28,
    });
    const francisOnly = cited.filter((d) => d.acta!.year >= 2015);
    expect(francisOnly).toHaveLength(225);
    expect(francisOnly.every((d) => d.issuerId === 'rp:francis-i')).toBe(true);
  });

  it('pins the sample\'s references per pope, and the part of every 1917 reference (acta volumes spec §5)', () => {
    const sample = cited.filter((d) => d.acta!.year < 2015);
    const byIssuer = new Map<string, number>();
    for (const d of sample) byIssuer.set(d.issuerId, (byIssuer.get(d.issuerId) ?? 0) + 1);
    // Pius XI's 4 and Pius XII's 70 of the sample, plus 13 and 131 from the volumes of 1932-1957.
    expect(Object.fromEntries([...byIssuer].sort())).toEqual({
      'rp:benedict-xv': 1, 'rp:benedict-xvi': 24, 'rp:john-paul-i': 6, 'rp:john-xxiii': 1, 'rp:paul-vi': 23, 'rp:pius-xi': 17, 'rp:pius-xii': 201,
    });
    // Every reference into AAS 9 (1917) names part I -- part II is the Code and has no
    // index -- and no other reference carries a part.
    for (const d of everything.filter((d) => d.acta !== undefined)) {
      if (d.acta!.year === 1917) expect(d.acta!.part, d.id).toBe('I');
      else expect(d.acta!.part, d.id).toBeUndefined();
    }
    expect(everything.filter((d) => d.acta?.year === 1917)).toHaveLength(9);
    // The examples the sample report names.
    const by = Object.fromEntries(cited.map((d) => [d.id, d.acta!]));
    expect(by['mag:pius-xi/quadragesimo-anno-1931']).toEqual({ series: 'AAS', volume: 23, year: 1931, page: 177 });
    expect(by['mag:pius-xi/non-abbiamo-bisogno-1931']).toEqual({ series: 'AAS', volume: 23, year: 1931, page: 285 });
    expect(by['mag:pius-xii/ad-apostolorum-principis-1958']).toEqual({ series: 'AAS', volume: 50, year: 1958, page: 601 });
    expect(by['mag:pius-xii/urbi-et-orbi-easter-1958']).toEqual({ series: 'AAS', volume: 50, year: 1958, page: 261 });
    expect(by['mag:paul-vi/world-day-of-peace-1978']).toEqual({ series: 'AAS', volume: 70, year: 1978, page: 49 });
    expect(by['mag:paul-vi/urbi-et-orbi-christmas-1977']).toEqual({ series: 'AAS', volume: 70, year: 1978, page: 15 });
    expect(by['mag:benedict-xv/des-le-debut-1917']).toEqual({ series: 'AAS', volume: 9, year: 1917, part: 'I', page: 417 });
    // Resolved among three claims by the toponym the shelf record carries (match.ts).
    expect(by['mag:paul-vi/avkaensis-1977']).toEqual({ series: 'AAS', volume: 70, year: 1978, page: 8 });
  });

  it('cites the acts of Pius XI and Pius XII the era report names (acta volumes spec §9, phase 2b-ii-a)', () => {
    const by = Object.fromEntries(cited.map((d) => [d.id, d.acta!]));
    expect(by['mag:pius-xi/mit-brennender-sorge-1937']).toEqual({ series: 'AAS', volume: 29, year: 1937, page: 145 });
    expect(by['mag:pius-xii/divino-afflante-spiritu-1943']).toEqual({ series: 'AAS', volume: 35, year: 1943, page: 297 });
    expect(by['mag:pius-xii/mediator-dei-1947']).toEqual({ series: 'AAS', volume: 39, year: 1947, page: 521 });
    // The Latin text of an encyclical the index enters twice, by a curated override (curation.ts).
    expect(by['mag:pius-xi/dilectissima-nobis-1933']).toEqual({ series: 'AAS', volume: 25, year: 1933, page: 261 });
    expect(by['mag:pius-xi/firmissimam-constantiam-1937']).toEqual({ series: 'AAS', volume: 29, year: 1937, page: 189 });
    expect(by['mag:pius-xi/divini-redemptoris-1937']).toEqual({ series: 'AAS', volume: 29, year: 1937, page: 65 });
    // Years and days the OCR misread, corrected by curated rows quoting the acts.
    expect(by['mag:pius-xii/summi-pontificatus-1939']).toEqual({ series: 'AAS', volume: 31, year: 1939, page: 413 });
    expect(by['mag:pius-xii/conflictatio-bonorum-1949']).toEqual({ series: 'AAS', volume: 41, year: 1949, page: 58 });
    expect(by['mag:pius-xii/sollemnibus-documentis-1949']).toEqual({ series: 'AAS', volume: 41, year: 1949, page: 529 });
    expect(by['mag:pius-xii/redemptoris-nostri-cruciatus-1949']).toEqual({ series: 'AAS', volume: 41, year: 1949, page: 161 });
    expect(by['mag:pius-xi/ad-catholici-sacerdotii-1935']).toEqual({ series: 'AAS', volume: 28, year: 1936, page: 5 });
    expect(by['mag:pius-xi/vigilanti-cura-1936']).toEqual({ series: 'AAS', volume: 28, year: 1936, page: 249 });
    // The two headings that cover two classes (Adhortatio, Hortationes): matched where the shelf has the act.
    expect(by['mag:pius-xii/i-rapidi-progressi-1954']).toEqual({ series: 'AAS', volume: 46, year: 1954, page: 18 });
    expect(by['mag:pius-xii/in-auspicando-super-1948']).toEqual({ series: 'AAS', volume: 40, year: 1948, page: 374 });
    // The Santarem constitution, by a curated override (its 1958 toponym is the OCR's).
    expect(by['mag:pius-xii/santaremensis-obidensis-1957']).toEqual({ series: 'AAS', volume: 50, year: 1958, page: 24 });
    // The Easter Urbi et Orbi of 1952, under *Nuntii radiophonici*.
    expect(by['mag:pius-xii/urbi-et-orbi-easter-1952']).toEqual({ series: 'AAS', volume: 44, year: 1952, page: 378 });
    // The head of AAS 42's index prints a `»` for the year with nothing above it, and AAS 47's a year read
    // `19Ö4`: the parser dates the entries `????-MM-DD`, and curated rows quoting the acts' dating formulae
    // (AAS 42 pp. 771 and 578, AAS 47 p. 14) supply the year, so the three match their shelf records.
    expect(by['mag:pius-xii/munificentissimus-deus-1950']).toEqual({ series: 'AAS', volume: 42, year: 1950, page: 753 });
    expect(by['mag:pius-xii/humani-generis-1950']).toEqual({ series: 'AAS', volume: 42, year: 1950, page: 561 });
    expect(by['mag:pius-xii/ad-sinarum-gentem-1954']).toEqual({ series: 'AAS', volume: 47, year: 1955, page: 5 });
    // *Auspicia quaedam* (AAS 40 (1948) 433): the text layer drops the page line of its entry, so no entry
    // exists to correct, and the encyclical stays uncited (report §3).
    expect(by['mag:pius-xii/auspicia-quaedam-1948']).toBeUndefined();
  });

  it('matches the three phase-1 misreadings by their corrected dates', () => {
    const by = Object.fromEntries(cited.map((d) => [d.id, d.acta!]));
    // Two curated index corrections (curation.ts), each quoting the act's dating formula.
    expect(by['mag:francis-i/de-concordia-inter-codices-2016']).toEqual({ series: 'AAS', volume: 108, year: 2016, page: 602 });
    expect(by['mag:francis-i/vultum-dei-quaerere-2016']).toEqual({ series: 'AAS', volume: 108, year: 2016, page: 835 });
    // Not a misprint but a day-less date line the parser skipped (index.ts): read from the
    // fixture as printed, the ditto months after `Sept. » Chengden.:` are September.
    expect(by['mag:francis-i/episcopalis-communio-2018']).toEqual({ series: 'AAS', volume: 110, year: 2018, page: 1359 });
  });

  it('writes Finis et modus on the letter it names, by the curated override, not on the decree of the date', () => {
    const by = Object.fromEntries(cited.map((d) => [d.id, d.acta!]));
    expect(by['mag:francis-i/apostolic-letter-2024-01-16-2']).toEqual({ series: 'AAS', volume: 116, year: 2024, page: 189 });
    expect(by['mag:francis-i/apostolic-letter-2024-01-16-1']).toBeUndefined();
  });

  it('keeps every curated match override live: each row names a parsed entry and an existing shelf document', () => {
    const entries = [...loadActaIndexes().parsed.values()].flatMap((p) => p.entries);
    const ids = new Set(everything.filter((d) => !isActaShelf(d.source?.shelf)).map((d) => d.id));
    for (const [key, row] of Object.entries(ACTA_MATCH_OVERRIDES)) {
      const [series, volume, page] = key.split(':');
      expect(entries.some((e) => e.series === series && e.volume === Number(volume) && e.page === Number(page)), key).toBe(true);
      expect(ids.has(row.documentId), key).toBe(true);
    }
  });

  it('keeps every curated index correction live: each row names an entry the parser reads with the printed date', () => {
    const entries = [...loadActaIndexes().parsed.values()].flatMap((p) => p.entries);
    for (const [key, row] of Object.entries(ACTA_INDEX_CORRECTIONS)) {
      const [year, page] = key.split(':').map(Number);
      const entry = entries.find((e) => e.year === year && e.page === page);
      expect(entry, key).toBeDefined();
      expect(entry!.date, key).toBe(row.printed);
      // A correction changes the date; a confirmation (phase 2b-ii-a) keeps a date the
      // parser read from an OCR year no volume prints, and only such an entry may have one.
      if (row.date === row.printed) expect(entry!.dateNote, key).toBeDefined();
      else expect(row.date, key).not.toBe(row.printed);
    }
    for (const key of Object.keys(ACTA_HOLDS)) {
      const [year, page] = key.split(':').map(Number);
      expect(entries.some((e) => e.year === year && e.page === page), key).toBe(true);
    }
  });

  it('writes a reference only on a document of a pope the popes table names, in the AAS, with the volume the year implies', () => {
    const issuers = new Set(ACTA_POPES.map((p) => p.issuerId));
    const years = new Set(ACTA_SOURCES.map((s) => s.year));
    for (const d of cited) {
      expect(issuers.has(d.issuerId), d.id).toBe(true);
      expect(d.acta!.series, d.id).toBe('AAS');
      expect(d.acta!.volume, d.id).toBe(d.acta!.year - 1908);
      expect(years.has(d.acta!.year), d.id).toBe(true);
      expect(d.acta!.page, d.id).toBeGreaterThanOrEqual(1);
      // The act's date is the volume year or earlier (a volume publishes late, never early).
      expect(d.date.slice(0, 4) <= String(d.acta!.year), d.id).toBe(true);
    }
  });

  it('cites every Francis encyclical and exhortation the ten volumes carry', () => {
    const by = Object.fromEntries(cited.map((d) => [d.id, d.acta!]));
    expect(by['mag:francis-i/laudato-si-2015']).toEqual({ series: 'AAS', volume: 107, year: 2015, page: 847 });
    expect(by['mag:francis-i/fratelli-tutti-2020']).toEqual({ series: 'AAS', volume: 112, year: 2020, page: 969 });
    expect(by['mag:francis-i/dilexit-nos-2024']).toEqual({ series: 'AAS', volume: 116, year: 2024, page: 1369 });
    expect(by['mag:francis-i/laudate-deum-2023']).toEqual({ series: 'AAS', volume: 115, year: 2023, page: 1041 });
    expect(by['mag:francis-i/amoris-laetitia-2016']!.page).toBe(351);
    expect(by['mag:francis-i/christus-vivit-2019']!.page).toBe(391);
    expect(by['mag:francis-i/querida-amazonia-2020']!.page).toBe(231);
    expect(by['mag:francis-i/gaudete-et-exsultate-2018']!.page).toBe(1111);
    expect(by['mag:francis-i/c-est-la-confiance-2023']!.page).toBe(1191);
    // A December act is published in the next year's volume: the volume year is not the year of date.
    expect(by['mag:francis-i/world-day-of-peace-2023']).toEqual({ series: 'AAS', volume: 115, year: 2023, page: 90 });
    expect(by['mag:francis-i/urbi-et-orbi-christmas-2022']).toEqual({ series: 'AAS', volume: 115, year: 2023, page: 95 });
    expect(by['mag:francis-i/urbi-et-orbi-easter-2023']).toEqual({ series: 'AAS', volume: 115, year: 2023, page: 515 });
  });

  it('writes no reference on a document the join reports rather than evidences', () => {
    // Ambiguous: the Tarragona beatification letters of 13 October 2013 print no incipit on
    // vatican.va, so the index's incipits cannot tell them apart. Claimed twice: two Nuntii
    // on the date of one series message. Class mismatch: an act the index files as Motu
    // proprio datae that the shelf did not file on motu_proprio.
    const ids = new Set(cited.map((d) => d.id));
    expect([...ids].filter((id) => id.startsWith('mag:francis-i/apostolic-letter-2013-10-13'))).toEqual([]);
    expect(ids.has('mag:francis-i/world-communications-day-2016')).toBe(false);
    expect(ids.has('mag:francis-i/apostolic-letter-2023-11-27')).toBe(false);
  });

  it('satisfies invariant 25 across the whole corpus', () => {
    expect(checkDocuments(everything, genres, keywords, series).filter((v) => v.rule === 25)).toEqual([]);
  });
});

describe('the AAS-only documents (AAS-only documents spec, phase 2a)', () => {
  const everything = readdirSync('data/documents').filter((f) => f.endsWith('.json'))
    .flatMap((f) => loadAll(f.replace(/\.json$/, '')));
  const born = everything.filter((d) => isActaShelf(d.source?.shelf));
  const shelf = everything.filter((d) => !isActaShelf(d.source?.shelf));
  const cls = (d: DocumentRecord) => `${d.genre}${d.characteristics?.length ? '+' + d.characteristics.join('+') : ''}`;

  const sourceOf = (d: DocumentRecord) => `${d.acta!.year}${d.acta!.part ? `-${d.acta!.part}` : ''}`;

  it('pins the created count per source and per class, so a silent drop or a flood fails loudly', () => {
    // 266 created on 2026-09-12 from 642 candidate entries (867 in harvested categories
    // minus 225 matched); the 376 held are listed per reason in the join report. One
    // fewer of 2020 since phase 2b-i joined the 2012 index: Benedict XVI's *Ibi vacabimus*
    // (3 July 2011) is printed in both AAS 104 (2012) 482 and AAS 112 (2020) 479, and
    // the id-collision rule holds both entries (sample report §2). The sample adds 147.
    // Phase 2b-ii-a adds 1,633 from the 26 volumes of 1932-1957 (the era report lists every
    // one with its index line), and the sample's 1978 count drops by one: *Ut Pater*, whose
    // incipit the OCR prints `ut Pater`, is now held as OCR-damaged (create.ts).
    const bySource = new Map<string, number>();
    for (const d of born) bySource.set(sourceOf(d), (bySource.get(sourceOf(d)) ?? 0) + 1);
    expect(Object.fromEntries([...bySource].sort())).toEqual({
      '1909': 2, '1917-I': 8, '1931': 60,
      '1932': 85, '1933': 62, '1934': 39, '1935': 81, '1936': 67, '1937': 56, '1938': 69, '1939': 49, '1940': 57, '1941': 28, '1942': 35,
      '1943': 17, '1944': 23, '1945': 38, '1946': 27, '1947': 48, '1948': 55, '1949': 75, '1950': 79, '1951': 94, '1952': 119, '1953': 87,
      '1954': 77, '1955': 96, '1956': 88, '1957': 82,
      '1958': 36, '1978': 28, '2012': 12,
      '2015': 7, '2016': 15, '2017': 30, '2018': 31, '2019': 73, '2020': 23, '2021': 19, '2022': 18, '2023': 32, '2024': 17,
    });
    expect(born).toHaveLength(265 + 146 + 1633);
    const byClass = new Map<string, number>();
    for (const d of born) byClass.set(cls(d), (byClass.get(cls(d)) ?? 0) + 1);
    expect(Object.fromEntries([...byClass].sort())).toEqual({
      // The one exhortation is Pius XII's of 13 September 1951 to the teaching nuns'
      // congress, entered without an incipit (a provisional id); no encyclical is created
      // (the four vernacular texts the index enters twice are held by curated rows).
      'apostolic-exhortation': 1, 'apostolic-letter': 789, 'apostolic-letter+motu-proprio': 23, letter: 456, 'papal-bull': 75, 'papal-bull+apostolic-constitution': 700,
    });
    // Francis and Benedict XVI from the ten indexes (five beatification letters of
    // 2010-2011 printed in the 2018, 2020 and 2021 volumes, the sixth held as above), and
    // the popes of the sample: Pius X (the two 1909 entries with a page), Benedict XV,
    // Pius XI, Pius XII, Paul VI, and Benedict XVI again from 2012. No John XXIII, John
    // Paul I or John Paul II record: every 1958 and 1978 entry of theirs matched or is held.
    const byIssuer = new Map<string, number>();
    for (const d of born) byIssuer.set(d.issuerId, (byIssuer.get(d.issuerId) ?? 0) + 1);
    expect(Object.fromEntries([...byIssuer].sort())).toEqual({
      'rp:benedict-xv': 8, 'rp:benedict-xvi': 17, 'rp:francis-i': 260, 'rp:paul-vi': 28, 'rp:pius-x': 2, 'rp:pius-xi': 532, 'rp:pius-xii': 1197,
    });
    expect(born.every((d) => d.issuerId in PONTIFICATE_BEGAN && d.date >= PONTIFICATE_BEGAN[d.issuerId]!)).toBe(true);
    // The *Epistulae* are created only where the letters shelf is harvested (Pius XI, Pius XII).
    expect(born.filter((d) => d.genre === 'letter').map((d) => d.issuerId).every((i) => ['rp:pius-xi', 'rp:pius-xii'].includes(i))).toBe(true);
  });

  it('carries the record shape of spec §4 and nothing the index does not evidence', () => {
    const sources = new Map(ACTA_SOURCES.map((s) => [s.key, s]));
    for (const d of born) {
      // source.url is the whole-volume PDF for a volume source (1909-2002) and null for an
      // index PDF (2012, 2015-2024); retrieved is the fixture's date (acta volumes spec §3).
      const src = sources.get(sourceOf(d))!;
      expect(src, d.id).toBeDefined();
      expect(d.source, d.id).toEqual({ url: src.url, shelf: `aas/${d.acta!.year}`, retrieved: src.retrieved });
      if (d.acta!.year <= 2002) {
        expect(d.source!.url, d.id).toBe(`https://www.vatican.va/archive/aas/documents/AAS-${String(d.acta!.volume).padStart(2, '0')}-${d.acta!.part ? `${d.acta!.part}-` : ''}${d.acta!.year}-ocr.pdf`);
      } else {
        expect(d.source!.url, d.id).toBeNull();
      }
      expect(d.acta!.series, d.id).toBe('AAS');
      expect(d.acta!.volume, d.id).toBe(d.acta!.year - 1908);
      expect(d.issuerType, d.id).toBe('pope');
      expect(d.keywords, d.id).toBeUndefined();
      expect(d.actKind, d.id).toBeUndefined();
      expect(d.series, d.id).toBeUndefined();
      expect(d.medium, d.id).toBeUndefined();
      expect(d.aliases, d.id).toBeUndefined();
      expect(d.sourceGenreLabel !== undefined && d.sourceGenreLabel in CREATED_CATEGORIES, d.id).toBe(true);
      expect('incipit' in d, d.id).toBe(d.idStatus === 'minted');
      // No incipitLang (spec §4 as corrected in PR #32): the index's guillemets mark a
      // quotation, not a language, and the shelf harvest sets the field nowhere.
      expect(d.incipitLang, d.id).toBeUndefined();
      // The title is the index entry: the incipit as printed, then the description.
      if (d.incipit !== undefined) expect(d.title, d.id).toContain(d.incipit);
    }
    expect(everything.filter((d) => d.incipitLang !== undefined)).toEqual([]);
    expect(born.filter((d) => d.idStatus === 'provisional')).toHaveLength(75 + 5 + 320);
  });

  it('creates the examples the sample report names (acta volumes spec §5)', () => {
    const by = Object.fromEntries(born.map((d) => [d.id, d]));
    // 1931: a constitution and a motu proprio on no shelf of Pius XI, minted from the incipit.
    expect(by['mag:pius-xi/pastoris-aeterni-1931']).toMatchObject({
      genre: 'papal-bull', characteristics: ['apostolic-constitution'], date: '1931-03-27',
      title: 'Pastoris aeterni. Lacus Salsi et Sacramentensis: dismembrationis et erectionis novae dioecesis Renensis',
      acta: { series: 'AAS', volume: 23, year: 1931, page: 366 },
    });
    expect(by['mag:pius-xi/praecipua-sane-1931']).toMatchObject({ genre: 'apostolic-letter', characteristics: ['motu-proprio'], date: '1931-04-24' });
    // 1931: an Epistula of Pius XI, whose letters shelf is harvested.
    expect(by['mag:pius-xi/quoniam-annus-1930']).toMatchObject({ genre: 'letter', sourceGenreLabel: 'Epistulae', acta: { page: 49 } });
    // 1978: the two constitutions released to the creator by the evidence rule, printing
    // toponym and incipit both -- minted from the incipit, the toponym in the title.
    expect(by['mag:paul-vi/ut-fert-creditum-1977']).toMatchObject({
      date: '1977-11-10', acta: { page: 81 }, title: expect.stringMatching(/^Mohaleshoekensis\. Ut fert creditum\. /),
    });
    expect(by['mag:paul-vi/votis-concedere-1977']).toMatchObject({ date: '1977-11-10', acta: { page: 82 } });
    // 1978: the page two short letters share, both created (ACTA_SHARED_PAGES exempts
    // exactly these two from invariant 25).
    expect(by['mag:paul-vi/sacra-illa-1978']).toMatchObject({ date: '1978-01-09', acta: { series: 'AAS', volume: 70, year: 1978, page: 150 } });
    expect(by['mag:paul-vi/quoniam-beatissima-1978']).toMatchObject({ date: '1978-01-11', acta: { page: 150 } });
    // 1917: a letter of Benedict XV with part I on its reference and in its URL.
    expect(by['mag:benedict-xv/benigne-annuentes-1915']).toMatchObject({
      date: '1915-08-11', acta: { series: 'AAS', volume: 9, year: 1917, part: 'I', page: 53 },
      source: { url: 'https://www.vatican.va/archive/aas/documents/AAS-09-I-1917-ocr.pdf', shelf: 'aas/1917', retrieved: '2026-09-13' },
    });
    // 1909: the two entries with a page, provisional (the index prints no incipit).
    expect(born.filter((d) => d.acta!.year === 1909).map((d) => d.id).sort()).toEqual(['mag:pius-x/apostolic-letter-1909-05-20', 'mag:pius-x/apostolic-letter-1909-06-25']);
    // Held, not created: Ibi vacabimus (printed twice), B (IARENSIS (OCR-damaged), the
    // 1917 letters dated 1910 (an OCR year before the pontificate).
    expect(by['mag:benedict-xvi/ibi-vacabimus-2011']).toBeUndefined();
    expect(born.filter((d) => d.date.startsWith('1910'))).toEqual([]);
    // The OCR-damaged guard reads the incipit, the toponym and the head of a description-only
    // entry, not the description (whose OCR noise -- `P. I).` for `P. D.` in the volumes of
    // 1932-1957 -- is the index's own text, as *Kerum novarum* was in 1931): no born incipit
    // carries a bracket, and no sample title does.
    expect(born.filter((d) => d.incipit !== undefined && /[()]/.test(d.incipit))).toEqual([]);
    expect(born.filter((d) => [1909, 1917, 1931, 1958, 1978, 2012].includes(d.acta!.year) && /\(/.test(d.title) && !/\)/.test(d.title))).toEqual([]);
  });

  it('creates the examples the spec and the phase-1 report name', () => {
    const by = Object.fromEntries(born.map((d) => [d.id, d]));
    // The four sub plumbo cardinalatial titles of 28 November 2020: papal-bull, provisional.
    expect(born.filter((d) => d.sourceGenreLabel === 'Litterae Apostolicae sub plumbo datae').map((d) => d.id).sort())
      .toEqual([1, 2, 3, 4].map((n) => `mag:francis-i/papal-bull-2020-11-28-${n}`));
    // Prisrensis-Priscensis, 5 September 2018, dated by the day-less `Sept. »` line before it.
    const prizren = born.find((d) => d.title.startsWith('Prisrensis-Priscensis'));
    expect(prizren?.date).toBe('2018-09-05');
    expect(prizren?.id).toBe('mag:francis-i/papal-bull-2018-09-05');
    // A 2017 constitution printing both toponym and incipit mints from the incipit.
    expect(by['mag:francis-i/insita-humanae-naturae-2017']?.title)
      .toBe('Danliensis. « Insita humanae naturae ». In Honduria, dismembratis quibusdam territoriis ecclesiasticae circumscriptionis Tegucigalpensis, dioecesis Danliensis conditur');
    // Two beatification letters of one year sharing an incipit take the full-date form (invariant 11).
    expect(by['mag:francis-i/venite-benedicti-2013-04-07']).toBeDefined();
    expect(by['mag:francis-i/venite-benedicti-2013-11-10']).toBeDefined();
    // Benedict XVI's letters, read through the `[Benedictus PP. XVI: 6 Iun. 2010]` bracket.
    expect(by['mag:benedict-xvi/testes-christianae-2010']?.date).toBe('2010-06-06');
  });

  it('joins and creates from the volumes of 1932-1957 as the era report says (acta volumes spec §9, phase 2b-ii-a)', () => {
    const era = born.filter((d) => d.acta!.year >= 1932 && d.acta!.year <= 1957);
    expect(era).toHaveLength(1633);
    // Every AAS-born record of the era cites the whole-volume PDF of its volume, whose
    // number the year implies, and belongs to Pius XI or Pius XII.
    for (const d of era) {
      expect(d.acta!.volume, d.id).toBe(d.acta!.year - 1908);
      expect(d.acta!.part, d.id).toBeUndefined();
      expect(d.source!.url, d.id).toBe(`https://www.vatican.va/archive/aas/documents/AAS-${d.acta!.volume}-${d.acta!.year}-ocr.pdf`);
      expect(d.source!.shelf, d.id).toBe(`aas/${d.acta!.year}`);
      expect(d.source!.retrieved, d.id).toBe('2026-09-13');
      expect(['rp:pius-xi', 'rp:pius-xii'].includes(d.issuerId), d.id).toBe(true);
      expect(d.date >= PONTIFICATE_BEGAN[d.issuerId]!, d.id).toBe(true);
    }
    const by = Object.fromEntries(everything.map((d) => [d.id, d]));
    // Two short letters on one page, each read in the volume and curated (ACTA_SHARED_PAGES).
    expect(by['mag:pius-xi/constitutione-apostolica-1931']).toMatchObject({ date: '1931-01-12', acta: { series: 'AAS', volume: 24, year: 1932, page: 39 }, sourceGenreLabel: 'Litterae Apostolicae' });
    expect(by['mag:pius-xi/apostolicum-munus-1931']).toMatchObject({ date: '1931-03-31', acta: { volume: 24, page: 39 } });
    expect(by['mag:pius-xi/quum-perlibenter-1933']).toMatchObject({ genre: 'letter', acta: { volume: 26, page: 19 } });
    expect(by['mag:pius-xi/nobilissima-cui-praesides-1933']).toMatchObject({ genre: 'letter', acta: { volume: 26, page: 19 } });
    expect(by['mag:pius-xi/cum-in-republica-estoniensi-1933']).toMatchObject({ acta: { volume: 28, year: 1936, page: 102 } });
    expect(by['mag:pius-xi/cum-aterradensis-1933']).toMatchObject({ acta: { volume: 28, page: 102 } });
    expect(by['mag:pius-xii/quinto-ac-vicesimo-1952']).toMatchObject({ genre: 'letter', acta: { volume: 45, year: 1953, page: 91 } });
    expect(by['mag:pius-xii/peculiari-animi-1952']).toMatchObject({ genre: 'letter', acta: { volume: 45, page: 91 } });
    // Constitutions of 1948 whose year the OCR reads `1919`, corrected by curated rows quoting the acts.
    expect(by['mag:pius-xii/christianae-plebis-1948']).toMatchObject({ date: '1948-07-15', acta: { volume: 41, year: 1949, page: 16 }, title: expect.stringMatching(/^Guayaquilensis \(Fluminensis\)\. Christianae plebis\. /) });
    expect(by['mag:pius-xii/opportunis-providentiae-studiis-1948']).toMatchObject({ date: '1948-05-20', acta: { page: 62 } });
    expect(by['mag:pius-xii/quo-maiori-1948']).toMatchObject({ date: '1948-08-07', acta: { page: 311 } });
    // A year no volume prints (`3939`), read as 1939, noted, and confirmed by a curated row.
    expect(by['mag:pius-xii/singulari-animi-1939-11-20']).toMatchObject({ genre: 'letter', date: '1939-11-20', acta: { volume: 32, year: 1940, page: 42 } });
    // Years the index does not print (`????`), supplied by curated rows quoting the acts: the chain after
    // `3918 Iulii 11` in AAS 41, after `1961 Apr. 13` in AAS 45, and `1961 Apr. 27` in AAS 47.
    expect(by['mag:pius-xii/cathedralia-capitula-1948']).toMatchObject({ date: '1948-01-10', acta: { volume: 41, page: 308 } });
    expect(by['mag:pius-xii/quintum-ac-vicesimum-1948']).toMatchObject({ genre: 'letter', date: '1948-08-06', acta: { volume: 41, page: 26 } });
    // … and one of that chain matches a provisional shelf letter of its day once the year is supplied.
    expect(by['mag:pius-xii/letter-1948-12-20']).toMatchObject({ source: { shelf: 'letters' }, acta: { volume: 41, year: 1949, page: 216 } });
    expect(by['mag:pius-xii/vetus-est-1951']).toMatchObject({ genre: 'apostolic-letter', date: '1951-04-13', acta: { volume: 45, year: 1953, page: 221 } });
    expect(by['mag:pius-xii/haud-parvae-1951']).toMatchObject({ date: '1951-04-27', acta: { volume: 47, year: 1955, page: 664 } });
    // And none is minted from an unprinted year no row supplies (AAS 43 (1951): `1ÍS50 Ian. 29` and the
    // seventeen letters after it, dated 1949 by the earlier parser and now held).
    expect(born.filter((d) => d.acta!.year === 1951 && d.genre === 'apostolic-letter' && [71, 73, 75, 268, 362, 106, 108, 76, 111, 156, 455, 157, 660, 456, 426, 205].includes(d.acta!.page))).toEqual([]);
    expect(born.filter((d) => d.date.startsWith('????'))).toEqual([]);
    // A constitution of 1939-1945 named by the see and its vernacular, no incipit: provisional, the see in the title.
    expect(born.filter((d) => d.acta!.year === 1939 && d.date === '1939-04-25' && d.genre === 'papal-bull').map((d) => d.title.split('.')[0]).sort())
      .toEqual(['De Dakar (Ziguinchorensis)', 'De Seul (Sunsenensis)', 'De Sienhsien (De Kinghsien)']);
    // The other constitution of 10 April 1957, beside the shelf's Santarem (matched by a curated override).
    expect(by['mag:pius-xii/in-similitudinem-1957']).toMatchObject({ acta: { volume: 49, year: 1957, page: 885 }, title: expect.stringMatching(/^Chihuahuensis \(Civitatis Iuarezensis\)\. In similitudinem\. /) });
    // Held, not created: the vernacular texts of four encyclicals (ACTA_HOLDS), the pages two acts cite where the
    // volume prints one (page-shared), *Ut Pater* of 1978 (an OCR lower-case initial).
    expect(born.filter((d) => d.issuerId === 'rp:pius-xi' && d.genre === 'encyclical')).toEqual([]);
    expect(born.filter((d) => d.acta!.year === 1950 && [37, 42].includes(d.acta!.page))).toEqual([]);
    expect(by['mag:paul-vi/ut-pater-1978']).toBeUndefined();
    // No Nuntii radiophonici is created: the category is counted for #27, never created.
    expect(born.filter((d) => d.sourceGenreLabel === 'Nuntii radiophonici')).toEqual([]);
  });

  it('holds rather than creates: no discussion #30 act has an AAS-born twin, and the Tarragona letters stay held', () => {
    // The twelve ids of discussion #30; a twin would be an AAS-born record of the same
    // pope on the same date (the shelf records print no incipit to compare by).
    const thirty = [
      'mag:francis-i/apostolic-letter-2015-05-28', 'mag:francis-i/apostolic-letter-2023-11-27',
      'mag:francis-i/apostolic-letter-2024-06-29', 'mag:francis-i/apostolic-letter-2024-01-16-2',
      'mag:benedict-xvi/totius-orbis-2005', 'mag:benedict-xvi/antiqua-ordinatione-2008',
      'mag:benedict-xvi/ecclesiae-unitatem-2009', 'mag:benedict-xvi/apostolic-letter-2009-07-07',
      'mag:benedict-xvi/omnium-in-mentem-2009', 'mag:benedict-xvi/ubicumque-et-semper-2010',
      'mag:john-xxiii/maiora-in-dies-1959', 'mag:john-xxiii/superno-dei-1960',
    ];
    const byId = new Map(shelf.map((d) => [d.id, d]));
    for (const id of thirty) {
      const d = byId.get(id);
      expect(d, id).toBeDefined();
      const twins = born.filter((b) => b.issuerId === d!.issuerId && b.date === d!.date
        && (b.incipit === undefined || d!.incipit === undefined || slugify(b.incipit) === slugify(d!.incipit)));
      expect(twins.map((t) => t.id), id).toEqual([]);
    }
    expect(born.filter((d) => d.issuerId === 'rp:francis-i' && d.date === '2013-10-13')).toEqual([]);
    // The decretals vatican.va filed on apost_letters as *Lettera Decretale* (2013-05-12,
    // 2014-04-03, 2014-04-27, 2014-11-23, 2015-05-17, 2022-05-15) are held, not doubled.
    for (const date of ['2013-05-12', '2014-04-03', '2014-04-27', '2014-11-23', '2015-05-17', '2022-05-15']) {
      expect(born.filter((d) => d.issuerId === 'rp:francis-i' && d.date === date), date).toEqual([]);
    }
  });

  it('re-mints no shelf id: no AAS-born provisional record shares an ordinal group with a shelf record', () => {
    const shelfBare = new Set(shelf.filter((d) => d.idStatus === 'provisional').map((d) => bareProvisionalId(d.id)));
    expect(born.filter((d) => d.idStatus === 'provisional' && shelfBare.has(bareProvisionalId(d.id)))).toEqual([]);
    // And no AAS-born minted id collides with a shelf minted id on (issuer, slug, year).
    const shelfKeys = new Set(shelf.filter((d) => d.idStatus === 'minted' && d.incipit !== undefined && !d.series)
      .map((d) => `${d.issuerId}|${slugify(d.incipit!)}|${d.date.slice(0, 4)}`));
    expect(born.filter((d) => d.incipit !== undefined && shelfKeys.has(`${d.issuerId}|${slugify(d.incipit)}|${d.date.slice(0, 4)}`))).toEqual([]);
  });

  it('satisfies every invariant over the merged corpus', () => {
    expect(checkDocuments(everything, genres, keywords, series)).toEqual([]);
  });
});
