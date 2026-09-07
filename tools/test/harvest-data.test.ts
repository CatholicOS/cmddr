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
    expect(checkDocuments(all, genres)).toEqual([]);
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
    expect(checkDocuments(px, genres)).toEqual([]);
  });

  it('leaves the 383 pilot records untouched', () => {
    expect(all).toHaveLength(383);
  });
});
