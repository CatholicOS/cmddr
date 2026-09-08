# Second Vatican Council Registry Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the sixteen documents of the Second Vatican Council to the registry, so that `mag:vatican-ii/gaudium-et-spes-1965` — the identifier `SCHEMA.md` and the pilot spec already use as their worked example — resolves.

**Architecture:** A third index reader (`council.ts`) beside the flat-era and shelf-era adapters, emitting the same `HarvestItem[]` so everything downstream is untouched. The council index prints neither dates nor genre qualifiers, so dates come from each document's URL slug and the genre labels come from a curated sixteen-row table quoting each document's own printed heading. A conciliar genre map is consulted ahead of the shared one, because the shared map's `'decreto'` already means *papal decree, no registry row*.

**Tech Stack:** TypeScript (ESM, `type: module`), cheerio for HTML parsing, vitest, tsx. Node ≥ 20.10.

**Spec:** `docs/superpowers/specs/2026-09-08-vatican-ii-registry-design.md`

## Global Constraints

- **Fixtures are checked in and the test suite is offline.** Never fetch inside a test or inside `tools/src/`. `tools/fetch-fixtures.sh` is the only thing that touches the network.
- **No document pages become fixtures.** Only the council index page. Per-document facts live in the curated table (spec §4.3).
- **The shared `SOURCE_GENRE_TO_GENRE` mapping `'decreto': { genre: null }` must not change.** `decree` is `issuerTypes: ['ecumenical-council']`, so re-pointing it would make every papal decree fail invariant 17 (spec §3).
- **`descriptiveTitle` stays `'dogmatic' | 'pastoral'`.** *Sacrosanctum Concilium* prints no qualifier and takes no `descriptiveTitle`. Do not add a third enum value (spec §2.4).
- **`lt` is Latin, not Lithuanian** (spec §2.6).
- **Silent drops are this pipeline's worst failure mode.** Every unexpected shape in the council adapter throws; it never skips an item or falls back to `genre: null`.
- **Codepoint order, never locale collation**, for anything that determines the byte order of a checked-in file.
- Run `npm run check` (vitest + `tsc --noEmit` + validate) before every commit.

---

### Task 1: Council source configuration, curated table, and conciliar genre map

Pure data plus one map. No parsing, no I/O.

**Files:**
- Create: `tools/src/mappings/councils.ts`
- Modify: `tools/src/mappings/genres.ts` (append `CONCILIAR_SOURCE_GENRE_TO_GENRE`)
- Modify: `tools/src/mappings/index.ts` (barrel export)
- Modify: `tools/src/mappings/pontiffs.ts` (extend `VATICAN_SLUG_TO_ISSUER`)
- Test: `tools/test/councils.test.ts`

**Interfaces:**
- Consumes: `GenreMapping` from `tools/src/mappings/genres.ts`.
- Produces:
  - `interface CouncilSource { pageSlug: string; issuerId: string; promulgatedBy: string; documents: Record<string, CouncilDocument> }`
  - `interface CouncilDocument { section: CouncilSection; sourceGenreLabel: string; descriptiveTitle?: 'dogmatic' | 'pastoral'; heading: string; printedDate: string }`
  - `type CouncilSection = 'Costituzioni' | 'Dichiarazioni' | 'Decreti'`
  - `const COUNCILS: readonly CouncilSource[]`
  - `const VATICAN_II_DOCUMENTS: Record<string, CouncilDocument>` — keyed by incipit slug
  - `const ARCHIVE_LANGUAGE_SUFFIXES: Record<string, string>`
  - `const CONCILIAR_SOURCE_GENRE_TO_GENRE: Record<string, GenreMapping>`
  - `VATICAN_SLUG_TO_ISSUER` continues to export the same type, now including council slugs.

- [ ] **Step 1: Write the failing test**

Create `tools/test/councils.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  COUNCILS, VATICAN_II_DOCUMENTS, ARCHIVE_LANGUAGE_SUFFIXES,
  CONCILIAR_SOURCE_GENRE_TO_GENRE, SOURCE_GENRE_TO_GENRE, VATICAN_SLUG_TO_ISSUER,
} from '../src/mappings/index.js';
import { slugify } from '../src/slug.js';

const genres = JSON.parse(readFileSync('data/genres.json', 'utf8')) as
  Array<{ id: string; issuerTypes?: string[] }>;

describe('COUNCILS', () => {
  it('holds Vatican II, promulgated throughout by Paul VI', () => {
    expect(COUNCILS).toHaveLength(1);
    expect(COUNCILS[0]!.pageSlug).toBe('ii_vatican_council');
    expect(COUNCILS[0]!.issuerId).toBe('oec:vatican-ii');
    // All sixteen documents open 'PAOLO VESCOVO SERVO DEI SERVI DI DIO' (spec 2.5).
    // John XXIII convoked the council but died before any document was promulgated.
    expect(COUNCILS[0]!.promulgatedBy).toBe('rp:paul-vi');
  });

  it('carries its own document table', () => {
    expect(COUNCILS[0]!.documents).toBe(VATICAN_II_DOCUMENTS);
  });

  it('resolves the council page slug to its COECDR id', () => {
    expect(VATICAN_SLUG_TO_ISSUER['ii_vatican_council']).toBe('oec:vatican-ii');
  });

  it('keeps every pope slug resolving as before', () => {
    expect(VATICAN_SLUG_TO_ISSUER['leo-xiii']).toBe('rp:leo-xiii');
    expect(VATICAN_SLUG_TO_ISSUER['francesco']).toBe('rp:francis-i');
  });
});

describe('VATICAN_II_DOCUMENTS', () => {
  const rows = Object.entries(VATICAN_II_DOCUMENTS);

  it('holds sixteen documents, 4 constitutions / 3 declarations / 9 decrees', () => {
    expect(rows).toHaveLength(16);
    const bySection = (s: string) => rows.filter(([, r]) => r.section === s);
    expect(bySection('Costituzioni')).toHaveLength(4);
    expect(bySection('Dichiarazioni')).toHaveLength(3);
    expect(bySection('Decreti')).toHaveLength(9);
  });

  it('is keyed by its own incipit slug', () => {
    for (const [key] of rows) expect(slugify(key)).toBe(key);
    expect(VATICAN_II_DOCUMENTS['gaudium-et-spes']).toBeDefined();
  });

  it('gives Sacrosanctum Concilium no descriptiveTitle, because it prints no qualifier', () => {
    const sc = VATICAN_II_DOCUMENTS['sacrosanctum-concilium']!;
    expect(sc.heading).toBe('COSTITUZIONE SULLA SACRA LITURGIA');
    expect(sc.descriptiveTitle).toBeUndefined();
    expect(sc.sourceGenreLabel).toBe('Costituzione');
  });

  it('marks the two dogmatic constitutions and the one pastoral constitution', () => {
    const qualified = rows.filter(([, r]) => r.descriptiveTitle !== undefined)
      .map(([k, r]) => [k, r.descriptiveTitle]);
    expect(qualified.sort()).toEqual([
      ['dei-verbum', 'dogmatic'],
      ['gaudium-et-spes', 'pastoral'],
      ['lumen-gentium', 'dogmatic'],
    ]);
  });

  it('quotes a heading that actually contains the recorded genre label', () => {
    for (const [key, r] of rows) {
      expect(r.heading.startsWith(r.sourceGenreLabel.toUpperCase()), key).toBe(true);
    }
  });

  it('records an ISO printed date for every document', () => {
    for (const [key, r] of rows) {
      expect(r.printedDate, key).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});

describe('CONCILIAR_SOURCE_GENRE_TO_GENRE', () => {
  it('maps every label the curated table uses', () => {
    for (const [key, r] of Object.entries(VATICAN_II_DOCUMENTS)) {
      const mapping = CONCILIAR_SOURCE_GENRE_TO_GENRE[r.sourceGenreLabel.toLowerCase()];
      expect(mapping, key).toBeDefined();
      expect(mapping!.genre, key).not.toBeNull();
    }
  });

  it('maps only to genres the Genre Registry allows a council to issue', () => {
    const allowed = new Map(genres.map((g) => [g.id, g.issuerTypes ?? []]));
    for (const [label, mapping] of Object.entries(CONCILIAR_SOURCE_GENRE_TO_GENRE)) {
      expect(allowed.get(mapping.genre!), label).toContain('ecumenical-council');
    }
  });

  it("does not disturb the shared map's papal 'decreto'", () => {
    // A papal decree has no Genre Registry row; 'decree' is council-only, so pointing
    // the shared key at it would fail invariant 17 for every Pius IX decree.
    expect(CONCILIAR_SOURCE_GENRE_TO_GENRE['decreto']!.genre).toBe('decree');
    expect(SOURCE_GENRE_TO_GENRE['decreto']!.genre).toBeNull();
  });
});

describe('ARCHIVE_LANGUAGE_SUFFIXES', () => {
  it('maps lt to Latin, not Lithuanian', () => {
    expect(ARCHIVE_LANGUAGE_SUFFIXES['lt']).toBe('LA');
  });

  it('maps the other suffixes that diverge from ISO', () => {
    expect(ARCHIVE_LANGUAGE_SUFFIXES['ge']).toBe('DE');
    expect(ARCHIVE_LANGUAGE_SUFFIXES['sp']).toBe('ES');
    expect(ARCHIVE_LANGUAGE_SUFFIXES['po']).toBe('PT');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tools/test/councils.test.ts`
Expected: FAIL — the module `../src/mappings/councils.js` does not exist, so the import from the barrel resolves nothing (`COUNCILS is not defined` / `Cannot find module`).

- [ ] **Step 3: Create `tools/src/mappings/councils.ts`**

```ts
/**
 * Ecumenical councils harvested from vatican.va's own archive
 * (`/archive/hist_councils/`), which holds exactly two: Vatican I and Vatican II
 * (spec §2.1). Vatican I is already in the registry by a different route -- its two
 * constitutions are filed on Pius IX's own page and reassigned through
 * CONCILIAR_REASSIGNMENTS -- and is deliberately not re-sourced here (spec §9.2).
 */

/** The three section headings the Vatican II index groups its documents under. */
export type CouncilSection = 'Costituzioni' | 'Dichiarazioni' | 'Decreti';

export interface CouncilDocument {
  /** The index section this document is filed under; cross-checked against the page. */
  section: CouncilSection;
  /** The genre label as the document itself prints it, normalised to sentence case. */
  sourceGenreLabel: string;
  /** Only where the document prints the qualifier; three of sixteen do (spec §2.4). */
  descriptiveTitle?: 'dogmatic' | 'pastoral';
  /**
   * The document's own printed heading, verbatim, as the evidence for the two fields
   * above. Never written to a record -- no DocumentRecord field holds it -- so that a
   * reader can audit the label without refetching 1.4 MB of document pages.
   */
  heading: string;
  /**
   * The promulgation date the document itself prints. Checked against the date read
   * from the URL slug (spec §2.3); never used to override it. Twelve documents print
   * it as 'Roma, presso San Pietro, {date}'; Lumen Gentium and Dei Verbum print it in
   * the heading; Sacrosanctum Concilium and Inter Mirifica print a bare '4 dicembre
   * 1963' at the end of the text.
   */
  printedDate: string;
}

export interface CouncilSource {
  /** The vatican.va archive path segment, e.g. 'ii_vatican_council'. Note Vatican I
   *  hyphenates ('i-vatican-council') where Vatican II underscores. */
  pageSlug: string;
  /** The COECDR id, e.g. 'oec:vatican-ii'. */
  issuerId: string;
  /** The pope who promulgated every document of this council (spec §2.5). */
  promulgatedBy: string;
  /** The council's closed document set, keyed by incipit slug. */
  documents: Record<string, CouncilDocument>;
}

/**
 * The sixteen documents of the Second Vatican Council. A closed set: the adapter
 * fails if the index carries a document not listed here, or if a row here matches
 * no item on the index (spec §6).
 *
 * Every field was read from that document's own page on 2026-09-08, not from the
 * index, which prints neither dates nor genre qualifiers (spec §2.2).
 */
export const VATICAN_II_DOCUMENTS: Record<string, CouncilDocument> = {
  // -- Costituzioni (4) ----------------------------------------------------------
  'dei-verbum': {
    section: 'Costituzioni',
    sourceGenreLabel: 'Costituzione dogmatica',
    descriptiveTitle: 'dogmatic',
    heading: 'COSTITUZIONE DOGMATICA SULLA DIVINA RIVELAZIONE',
    printedDate: '1965-11-18',
  },
  'lumen-gentium': {
    section: 'Costituzioni',
    sourceGenreLabel: 'Costituzione dogmatica',
    descriptiveTitle: 'dogmatic',
    heading: 'COSTITUZIONE DOGMATICA SULLA CHIESA',
    printedDate: '1964-11-21',
  },
  // The only constitution that prints no qualifier at all -- not 'dogmatica', not
  // 'pastorale'. It therefore takes no descriptiveTitle; the field's enum has no third
  // value and must not grow one to cover a qualifier the source does not print.
  'sacrosanctum-concilium': {
    section: 'Costituzioni',
    sourceGenreLabel: 'Costituzione',
    heading: 'COSTITUZIONE SULLA SACRA LITURGIA',
    printedDate: '1963-12-04',
  },
  'gaudium-et-spes': {
    section: 'Costituzioni',
    sourceGenreLabel: 'Costituzione pastorale',
    descriptiveTitle: 'pastoral',
    // The page prints a footnote marker '(1)' after this heading; the marker is not
    // part of the heading and is omitted here.
    heading: 'COSTITUZIONE PASTORALE SULLA CHIESA NEL MONDO CONTEMPORANEO',
    printedDate: '1965-12-07',
  },

  // -- Dichiarazioni (3) ---------------------------------------------------------
  'gravissimum-educationis': {
    section: 'Dichiarazioni',
    sourceGenreLabel: 'Dichiarazione',
    heading: 'DICHIARAZIONE SULL’EDUCAZIONE CRISTIANA',
    printedDate: '1965-10-28',
  },
  'nostra-aetate': {
    section: 'Dichiarazioni',
    sourceGenreLabel: 'Dichiarazione',
    heading: 'DICHIARAZIONE SULLE RELAZIONI DELLA CHIESA CON LE RELIGIONI NON CRISTIANE',
    printedDate: '1965-10-28',
  },
  'dignitatis-humanae': {
    section: 'Dichiarazioni',
    sourceGenreLabel: 'Dichiarazione',
    heading: 'DICHIARAZIONE SULLA LIBERTÀ RELIGIOSA',
    printedDate: '1965-12-07',
  },

  // -- Decreti (9) ---------------------------------------------------------------
  'ad-gentes': {
    section: 'Decreti',
    sourceGenreLabel: 'Decreto',
    // 'ATTIVITA' is printed without its accent on the page; quoted as printed.
    heading: 'DECRETO SULL’ATTIVITA MISSIONARIA DELLA CHIESA',
    printedDate: '1965-12-07',
  },
  'presbyterorum-ordinis': {
    section: 'Decreti',
    sourceGenreLabel: 'Decreto',
    heading: 'DECRETO SUL MINISTERO E LA VITA DEI PRESBITERI',
    printedDate: '1965-12-07',
  },
  'apostolicam-actuositatem': {
    section: 'Decreti',
    sourceGenreLabel: 'Decreto',
    heading: 'DECRETO SULL’APOSTOLATO DEI LAICI',
    printedDate: '1965-11-18',
  },
  'optatam-totius': {
    section: 'Decreti',
    sourceGenreLabel: 'Decreto',
    heading: 'DECRETO SULLA FORMAZIONE SACERDOTALE',
    printedDate: '1965-10-28',
  },
  'perfectae-caritatis': {
    section: 'Decreti',
    sourceGenreLabel: 'Decreto',
    heading: 'DECRETO SUL RINNOVAMENTO DELLA VITA RELIGIOSA',
    printedDate: '1965-10-28',
  },
  'christus-dominus': {
    section: 'Decreti',
    sourceGenreLabel: 'Decreto',
    heading: 'DECRETO SULLA MISSIONE PASTORALE DEI VESCOVI NELLA CHIESA',
    printedDate: '1965-10-28',
  },
  'unitatis-redintegratio': {
    section: 'Decreti',
    sourceGenreLabel: 'Decreto',
    heading: 'DECRETO SULL’ECUMENISMO',
    printedDate: '1964-11-21',
  },
  'orientalium-ecclesiarum': {
    section: 'Decreti',
    sourceGenreLabel: 'Decreto',
    heading: 'DECRETO SULLE CHIESE CATTOLICHE ORIENTALI',
    printedDate: '1964-11-21',
  },
  'inter-mirifica': {
    section: 'Decreti',
    sourceGenreLabel: 'Decreto',
    heading: 'DECRETO SUGLI STRUMENTI DI COMUNICAZIONE SOCIALE',
    printedDate: '1963-12-04',
  },
};

export const COUNCILS: readonly CouncilSource[] = [
  {
    pageSlug: 'ii_vatican_council',
    issuerId: 'oec:vatican-ii',
    promulgatedBy: 'rp:paul-vi',
    documents: VATICAN_II_DOCUMENTS,
  },
];

/**
 * vatican.va's archive-era translation-link suffixes, mapped to the two-letter
 * uppercase codes the registry records in `source.languages`. These are NOT ISO
 * codes: `lt` is Latin (every document's own printed code bar shows LA and none
 * shows LT), `ge` is German, `sp` Spanish, `po` Portuguese.
 *
 * Verified for all sixteen documents by comparing the set derived from the index's
 * link suffixes against the code bar each document prints (spec §2.6). `hr` occurs
 * once, on Nostra Aetate alone; `he` occurs on Dei Verbum and Nostra Aetate, as a
 * PDF. Chinese is not a `documents/` link at all and is handled separately by the
 * adapter.
 */
export const ARCHIVE_LANGUAGE_SUFFIXES: Record<string, string> = {
  ar: 'AR', be: 'BE', cs: 'CS', en: 'EN', fr: 'FR', ge: 'DE', he: 'HE', hr: 'HR',
  hu: 'HU', it: 'IT', lt: 'LA', lv: 'LV', po: 'PT', sp: 'ES', sw: 'SW',
};
```

- [ ] **Step 4: Append the conciliar genre map to `tools/src/mappings/genres.ts`**

Add at the end of the file, after `SOURCE_GENRE_TO_GENRE`:

```ts
/**
 * Genre labels as read from a *council's* documents. Consulted by toDocument ahead of
 * SOURCE_GENRE_TO_GENRE when the issuer is a council, and never otherwise.
 *
 * It exists because the two vocabularies genuinely collide. SOURCE_GENRE_TO_GENRE maps
 * 'decreto' to `genre: null` -- correctly, for the papal decrees Pius IX's flat page
 * prints, which the Genre Registry has no row for. The Genre Registry's `decree` row is
 * `issuerTypes: ['ecumenical-council']`, so pointing the shared key at it would make
 * every papal decree fail invariant 17. A conciliar decree, filed under the same word,
 * genuinely is that row.
 *
 * 'costituzione dogmatica' is deliberately present in both maps: Pius IX's page prints
 * it for the two Vatican I constitutions, and Vatican II's own documents print it for
 * Lumen Gentium and Dei Verbum. Duplicating five words is preferable to either map
 * reaching into the other.
 */
export const CONCILIAR_SOURCE_GENRE_TO_GENRE: Record<string, GenreMapping> = {
  'costituzione': { genre: 'constitution' },
  'costituzione dogmatica': { genre: 'constitution', descriptiveTitle: 'dogmatic' },
  'costituzione pastorale': { genre: 'constitution', descriptiveTitle: 'pastoral' },
  'dichiarazione': { genre: 'declaration' },
  'decreto': { genre: 'decree' },
};
```

- [ ] **Step 5: Export from the barrel**

In `tools/src/mappings/index.ts`, add after the `pontiffs` line:

```ts
export * from './councils.js';
```

- [ ] **Step 6: Extend `VATICAN_SLUG_TO_ISSUER` in `tools/src/mappings/pontiffs.ts`**

Add the import at the top of the file, beside the existing vendor imports:

```ts
import { COUNCILS } from './councils.js';
```

Replace the existing `VATICAN_SLUG_TO_ISSUER` declaration (at the end of the file) with:

```ts
/**
 * vatican.va URL slugs do not match CRPDR/COECDR ids; this is the bridge. Derived from
 * POPES and COUNCILS rather than maintained beside them, so the three can never
 * disagree. A council's slug is its archive path segment ('ii_vatican_council'), not a
 * `/content/` slug.
 */
export const VATICAN_SLUG_TO_ISSUER: Record<string, string> = Object.fromEntries([
  ...POPES.map((p) => [p.pageSlug, p.issuerId]),
  ...COUNCILS.map((c) => [c.pageSlug, c.issuerId]),
]);
```

`councils.ts` imports nothing from `pontiffs.ts`, so this introduces no cycle.

- [ ] **Step 7: Run the test to verify it passes**

Run: `npx vitest run tools/test/councils.test.ts`
Expected: PASS, all cases.

- [ ] **Step 8: Run the full check**

Run: `npm run check`
Expected: PASS. No data has changed yet, so every existing test and invariant must still hold.

- [ ] **Step 9: Commit**

```bash
git add tools/src/mappings/councils.ts tools/src/mappings/genres.ts \
        tools/src/mappings/index.ts tools/src/mappings/pontiffs.ts \
        tools/test/councils.test.ts
git commit -m "Add the Vatican II source config, curated table and conciliar genre map"
```

---

### Task 2: The council index adapter

**Files:**
- Create: `tools/src/harvest/council.ts`
- Create: `tools/fixtures/ii_vatican_council.html` (fetched, checked in)
- Modify: `tools/fetch-fixtures.sh`
- Test: `tools/test/council.test.ts`

**Interfaces:**
- Consumes: `CouncilSource`, `VATICAN_II_DOCUMENTS`, `ARCHIVE_LANGUAGE_SUFFIXES` from Task 1; `slugify` from `tools/src/slug.js`; `HarvestItem` from `tools/src/types.js`.
- Produces: `parseCouncilIndex(html: string, council: CouncilSource): HarvestItem[]`.

- [ ] **Step 1: Fetch the fixture**

Add to `tools/fetch-fixtures.sh`, immediately after the `years()` helper definition:

```bash
# council <pageSlug> -- the archive-era council index. Note this is NOT under /content/,
# unlike every pope page, and its filename is index_it.htm rather than it.html.
council() { get "$1" "https://www.vatican.va/archive/hist_councils/$1/index_it.htm"; }
```

And at the end of the file, after the last pope block:

```bash
if [ -z "$POPE" ] || [ "$POPE" = ii_vatican_council ]; then council ii_vatican_council; fi
```

Run: `tools/fetch-fixtures.sh ii_vatican_council`
Expected: `tools/fixtures/ii_vatican_council.html` exists, roughly 25 KB.

Verify it is the page expected before going further:

```bash
grep -o -i '<li[ >]' tools/fixtures/ii_vatican_council.html | wc -l            # expect 16
grep -o '<b>Costituzioni</b>\|<b>Dichiarazioni</b>\|<b>Decreti</b>' tools/fixtures/ii_vatican_council.html
grep -o -i '<font size="2">' tools/fixtures/ii_vatican_council.html | wc -l    # expect 16
```

Expected: 16 `<li>` elements — the page has no other list anywhere, which is why the adapter's
`li` selector needs no scoping — the three section headings once each, and 16 language bars. If
the page shape has changed, stop and report rather than adapting the parser to an unexamined page.

- [ ] **Step 2: Write the failing test**

Create `tools/test/council.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseCouncilIndex } from '../src/harvest/council.js';
import { COUNCILS, VATICAN_II_DOCUMENTS } from '../src/mappings/index.js';
import { slugify } from '../src/slug.js';

const vaticanII = COUNCILS[0]!;
const html = readFileSync('tools/fixtures/ii_vatican_council.html', 'utf8');
const items = parseCouncilIndex(html, vaticanII);
const by = (incipit: string) => items.find((i) => i.incipit === incipit)!;

describe('parseCouncilIndex', () => {
  it('reads all sixteen documents', () => {
    expect(items).toHaveLength(16);
  });

  it('gives every item the council page slug and no shelf', () => {
    for (const i of items) {
      expect(i.pageSlug).toBe('ii_vatican_council');
      expect(i.shelf).toBeNull();
    }
  });

  it('never emits a null incipit, because a conciliar title is its incipit', () => {
    // No Vatican II record can be provisional: extractIncipit is not involved at all.
    for (const i of items) {
      expect(i.incipit).not.toBeNull();
      expect(i.title).toBe(i.incipit);
    }
  });

  it('reads the date from the URL slug', () => {
    expect(by('Lumen Gentium').date).toBe('1964-11-21');
    expect(by('Gaudium et Spes').date).toBe('1965-12-07');
    expect(by('Sacrosanctum Concilium').date).toBe('1963-12-04');
  });

  it('agrees with every printed date in the curated table', () => {
    for (const i of items) {
      const row = VATICAN_II_DOCUMENTS[slugify(i.incipit!)]!;
      expect(i.date, i.incipit!).toBe(row.printedDate);
    }
  });

  it('takes the genre label from the curated table, not the section heading', () => {
    expect(by('Lumen Gentium').sourceGenreLabel).toBe('Costituzione dogmatica');
    expect(by('Sacrosanctum Concilium').sourceGenreLabel).toBe('Costituzione');
    expect(by('Nostra Aetate').sourceGenreLabel).toBe('Dichiarazione');
    expect(by('Ad Gentes').sourceGenreLabel).toBe('Decreto');
  });

  it('resolves the Italian document page as the source url', () => {
    expect(by('Lumen Gentium').url).toBe(
      'https://www.vatican.va/archive/hist_councils/ii_vatican_council/documents/'
      + 'vat-ii_const_19641121_lumen-gentium_it.html');
  });

  it('maps language suffixes to registry codes, reading lt as Latin', () => {
    const langs = by('Lumen Gentium').languages;
    expect(langs).toContain('LA');
    expect(langs).not.toContain('LT');
    expect(langs).toContain('DE');   // _ge.html
    expect(langs).toContain('ES');   // _sp.html
    expect(langs).toContain('PT');   // _po.html
    expect(langs).toContain('ZH');   // /chinese/concilio/*.pdf
    expect(langs).toContain('IT');
  });

  it('picks up the languages that occur on only one or two documents', () => {
    expect(by('Nostra Aetate').languages).toContain('HR');
    expect(by('Dei Verbum').languages).toContain('HE');   // a PDF under documents/
    expect(by('Ad Gentes').languages).not.toContain('AR');
  });

  it('emits no duplicate language code for a document', () => {
    for (const i of items) {
      expect(new Set(i.languages).size, i.incipit!).toBe(i.languages.length);
    }
  });

  it('throws when the index carries a document the curated table does not name', () => {
    const stray = html.replace(
      'vat-ii_const_19641121_lumen-gentium_it.html',
      'vat-ii_const_19641121_lumen-fictum_it.html')
      .replace('<b>Lumen Gentium</b>', '<b>Lumen Fictum</b>');
    expect(() => parseCouncilIndex(stray, vaticanII))
      .toThrow(/not in the curated table/i);
  });

  it('throws when a curated row matches no item on the page', () => {
    const short = html.replace(/<li><a href="documents\/vat-ii_decree_19631204_inter-mirifica_it\.html"[\s\S]*?<\/li>/, '');
    expect(() => parseCouncilIndex(short, vaticanII))
      .toThrow(/matched no item/i);
  });

  it('throws when a section heading disagrees with the curated table', () => {
    const moved = html.replace('<b>Dichiarazioni</b>', '<b>Decreti</b>');
    expect(() => parseCouncilIndex(moved, vaticanII)).toThrow(/section/i);
  });

  it('throws on an unknown language suffix rather than dropping it', () => {
    const odd = html.replace('_lumen-gentium_ar.html', '_lumen-gentium_qq.html');
    expect(() => parseCouncilIndex(odd, vaticanII)).toThrow(/language suffix/i);
  });

  it('throws when the URL date disagrees with the date the document prints', () => {
    // The cross-check that makes the URL-derived date safe to trust (spec §2.3, §6).
    const wrong = html.replace('vat-ii_const_19641121_lumen-gentium_it.html',
                               'vat-ii_const_19641122_lumen-gentium_it.html');
    expect(() => parseCouncilIndex(wrong, vaticanII)).toThrow(/disagreement/i);
  });

  it('throws when an anchor carries no date in its slug', () => {
    const undated = html.replace('vat-ii_const_19641121_lumen-gentium_it.html',
                                 'vat-ii_const_lumen-gentium_it.html');
    expect(() => parseCouncilIndex(undated, vaticanII)).toThrow(/date/i);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tools/test/council.test.ts`
Expected: FAIL — `Cannot find module '../src/harvest/council.js'`.

- [ ] **Step 4: Write the adapter**

Create `tools/src/harvest/council.ts`:

```ts
import * as cheerio from 'cheerio';
import { ARCHIVE_LANGUAGE_SUFFIXES } from '../mappings/index.js';
import { slugify } from '../slug.js';
import type { CouncilSource } from '../mappings/councils.js';
import type { HarvestItem } from '../types.js';

const ARCHIVE_BASE = 'https://www.vatican.va/archive/hist_councils';

/** `documents/vat-ii_const_19641121_lumen-gentium_it.html` -> `1964-11-21`. */
function dateFromHref(href: string): string | null {
  const m = href.match(/_(\d{4})(\d{2})(\d{2})_/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

/**
 * The registry language code for one translation link. Chinese is not a `documents/`
 * link at all but a PDF elsewhere on the site, so it is recognised by path rather than
 * by suffix. An unrecognised suffix throws: silently dropping a language would leave a
 * record quietly claiming fewer translations than the source offers.
 */
function languageOf(href: string): string {
  if (href.includes('/chinese/')) return 'ZH';
  const m = href.match(/_([a-z]{2})\.(?:html|pdf)$/);
  const code = m ? ARCHIVE_LANGUAGE_SUFFIXES[m[1]!] : undefined;
  if (!code) throw new Error(`Unknown vatican.va archive language suffix in '${href}'`);
  return code;
}

/**
 * Archive-era council index pages (`/archive/hist_councils/{slug}/index_it.htm`). A
 * third page shape, sharing no markup with the flat-era or shelf-era pope pages: no
 * `div.item`, no `<h2>{heading} ({date})</h2>`. Documents are `<li>` entries grouped
 * under `<p><b>{Section}</b></p>` headings, each `<li>` holding a bold anchor to the
 * Italian text and a `<font size="2">` bar of translation links.
 *
 * The page prints no date and no genre qualifier (spec §2.2), so the date is read from
 * the anchor's own URL slug and the genre label from the council's curated table. The
 * table is a closed set: anything the page carries that the table does not name, or the
 * table names that the page does not carry, throws. Sixteen documents that have not
 * changed since 1965 are not a corpus that grows; a surprise here means the page shape
 * changed and a human must look.
 */
export function parseCouncilIndex(html: string, council: CouncilSource): HarvestItem[] {
  const $ = cheerio.load(html);
  const items: HarvestItem[] = [];
  const seen = new Set<string>();
  let section: string | null = null;

  // `p > b` matches only the three section headings: the page title is wrapped in a
  // <font>, so its <b> is not a direct child of the <p>. css-select returns matches in
  // document order, so a heading is always seen before the items it introduces.
  $('p > b, li').each((_, el) => {
    if (el.tagName === 'b') {
      section = $(el).text().replace(/\s+/g, ' ').trim();
      return;
    }

    const $li = $(el);
    const $anchor = $li.find('a').first();
    const href = $anchor.attr('href');
    const incipit = $anchor.text().replace(/\s+/g, ' ').trim();
    if (!href || !incipit) {
      throw new Error(`Council index item with no anchor or no text: '${$li.text().trim()}'`);
    }

    const slug = slugify(incipit);
    const row = council.documents[slug];
    if (!row) {
      throw new Error(
        `'${incipit}' (${council.pageSlug}) is not in the curated table -- the index `
        + 'carries a document the registry does not know about');
    }
    if (seen.has(slug)) throw new Error(`'${incipit}' appears twice on ${council.pageSlug}`);
    seen.add(slug);

    if (section !== row.section) {
      throw new Error(
        `'${incipit}' is filed under section '${section}' but the curated table `
        + `records '${row.section}'`);
    }

    const date = dateFromHref(href);
    if (!date) throw new Error(`No date in the URL slug for '${incipit}': '${href}'`);
    // The URL slug is the only date the index carries, so it is the date kept. The
    // curated row's printedDate -- read from the document itself -- is a cross-check,
    // never an override: where the two disagree the harvest stops rather than picking
    // a winner (spec §6).
    if (date !== row.printedDate) {
      throw new Error(
        `Date disagreement for '${incipit}': URL slug says ${date}, the document `
        + `prints ${row.printedDate}`);
    }

    // The bold anchor is excluded here and its own language counted through the bar,
    // which lists Italiano too -- so the set matches the code bar each document prints.
    const languages = $li.find('font a').map((_i, a) => {
      const lang = $(a).attr('href');
      if (!lang) throw new Error(`Translation link with no href for '${incipit}'`);
      return languageOf(lang);
    }).get();

    items.push({
      title: incipit,
      incipit,
      date,
      sourceGenreLabel: row.sourceGenreLabel,
      url: href.startsWith('http') ? href
        : href.startsWith('/') ? `https://www.vatican.va${href}`
        : `${ARCHIVE_BASE}/${council.pageSlug}/${href}`,
      languages: [...new Set(languages)],
      shelf: null,
      pageSlug: council.pageSlug,
    });
  });

  const missing = Object.keys(council.documents).filter((slug) => !seen.has(slug));
  if (missing.length > 0) {
    throw new Error(
      `${missing.length} curated row(s) matched no item on ${council.pageSlug}: `
      + missing.join(', '));
  }

  return items;
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run tools/test/council.test.ts`
Expected: PASS, all cases.

- [ ] **Step 6: Run the full check**

Run: `npm run check`
Expected: PASS. The adapter is not yet wired into the harvest, so no data has changed.

- [ ] **Step 7: Commit**

```bash
git add tools/src/harvest/council.ts tools/test/council.test.ts \
        tools/fixtures/ii_vatican_council.html tools/fetch-fixtures.sh
git commit -m "Read the Vatican II council index into HarvestItems"
```

---

### Task 3: Conciliar genre resolution and promulgator in `toDocument`

**Files:**
- Modify: `tools/src/harvest/toDocument.ts`
- Test: `tools/test/toDocument.test.ts` (append)

**Interfaces:**
- Consumes: `CONCILIAR_SOURCE_GENRE_TO_GENRE` and `COUNCILS` from Task 1.
- Produces: no signature change. `toDocument(item, retrieved)` keeps returning a `DocumentRecord`; council-issued items now resolve a genre and carry `promulgatedBy`.

- [ ] **Step 1: Write the failing tests**

Append to `tools/test/toDocument.test.ts`, inside the existing `describe('toDocument', …)` block:

```ts
  const conciliarItem = (over: Partial<HarvestItem>): HarvestItem => item({
    title: 'Lumen Gentium', incipit: 'Lumen Gentium', date: '1964-11-21',
    sourceGenreLabel: 'Costituzione dogmatica', shelf: null,
    pageSlug: 'ii_vatican_council', url: 'https://www.vatican.va/x.html', ...over,
  });

  it('builds a Vatican II constitution', () => {
    const d = toDocument(conciliarItem({}), '2026-09-08');
    expect(d.id).toBe('mag:vatican-ii/lumen-gentium-1964');
    expect(d.issuerId).toBe('oec:vatican-ii');
    expect(d.issuerType).toBe('ecumenical-council');
    expect(d.genre).toBe('constitution');
    expect(d.descriptiveTitle).toBe('dogmatic');
    expect(d.idStatus).toBe('minted');
    expect(d.sourceGenreLabel).toBe('Costituzione dogmatica');
  });

  it('records Paul VI as the promulgator of every Vatican II document', () => {
    expect(toDocument(conciliarItem({}), '2026-09-08').promulgatedBy).toBe('rp:paul-vi');
    expect(toDocument(conciliarItem({
      title: 'Inter Mirifica', incipit: 'Inter Mirifica', date: '1963-12-04',
      sourceGenreLabel: 'Decreto',
    }), '2026-09-08').promulgatedBy).toBe('rp:paul-vi');
  });

  it('maps a conciliar decree to the decree genre', () => {
    const d = toDocument(conciliarItem({
      title: 'Ad Gentes', incipit: 'Ad Gentes', date: '1965-12-07',
      sourceGenreLabel: 'Decreto',
    }), '2026-09-08');
    expect(d.id).toBe('mag:vatican-ii/ad-gentes-1965');
    expect(d.genre).toBe('decree');
    expect(d.descriptiveTitle).toBeUndefined();
  });

  it('maps a conciliar declaration to the declaration genre', () => {
    const d = toDocument(conciliarItem({
      title: 'Nostra Aetate', incipit: 'Nostra Aetate', date: '1965-10-28',
      sourceGenreLabel: 'Dichiarazione',
    }), '2026-09-08');
    expect(d.genre).toBe('declaration');
  });

  it('gives an unqualified conciliar constitution no descriptiveTitle', () => {
    const d = toDocument(conciliarItem({
      title: 'Sacrosanctum Concilium', incipit: 'Sacrosanctum Concilium',
      date: '1963-12-04', sourceGenreLabel: 'Costituzione',
    }), '2026-09-08');
    expect(d.genre).toBe('constitution');
    expect(d.descriptiveTitle).toBeUndefined();
  });

  it('leaves a papal decreto mapped to no genre', () => {
    // Pius IX's flat page prints papal decrees, for which the Genre Registry has no
    // row. 'decree' is issuerTypes: ['ecumenical-council'], so mapping this to it
    // would fail invariant 17.
    const d = toDocument(item({
      title: 'Quod aliquantulum', incipit: 'Quod aliquantulum', date: '1847-03-01',
      sourceGenreLabel: 'Decreto', shelf: null, pageSlug: 'pius-ix',
    }), '2026-09-08');
    expect(d.issuerType).toBe('pope');
    expect(d.genre).toBeNull();
    expect(d.sourceGenreLabel).toBe('Decreto');
  });

  it('keeps Vatican I on its reassignment route, promulgated by Pius IX', () => {
    const d = toDocument(item({
      title: 'Dei Filius', incipit: 'Dei Filius', date: '1870-04-24',
      sourceGenreLabel: 'Costituzione dogmatica', shelf: null, pageSlug: 'pius-ix',
    }), '2026-09-08');
    expect(d.id).toBe('mag:vatican-i/dei-filius-1870');
    expect(d.promulgatedBy).toBe('rp:pius-ix');
    expect(d.descriptiveTitle).toBe('dogmatic');
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tools/test/toDocument.test.ts`
Expected: FAIL. The Vatican II cases fail first on `No CRPDR mapping for vatican.va slug` only if Task 1 was skipped; with Task 1 in place they fail on `genre` — `'decreto'` resolves through the shared map to `null`, and `promulgatedBy` is `undefined`.

- [ ] **Step 3: Make the change**

In `tools/src/harvest/toDocument.ts`, extend the import from `../mappings/index.js` to include the two new names:

```ts
import {
  VATICAN_SLUG_TO_ISSUER, SOURCE_GENRE_TO_GENRE, CONCILIAR_SOURCE_GENRE_TO_GENRE,
  CONCILIAR_REASSIGNMENTS, COUNCILS, keywordsFor,
} from '../mappings/index.js';
```

Replace the single `mapping` line:

```ts
  const mapping = SOURCE_GENRE_TO_GENRE[item.sourceGenreLabel.toLowerCase()] ?? { genre: null };
```

with:

```ts
  // A council's vocabulary is read first and only for a council: 'decreto' means the
  // Genre Registry's council-only `decree` row here, and a papal decree with no row at
  // all in the shared map. Falling through to the shared map keeps every label the two
  // sources share -- 'costituzione dogmatica' among them -- working from one place.
  const label = item.sourceGenreLabel.toLowerCase();
  const mapping = (issuerId.startsWith('oec:')
    ? CONCILIAR_SOURCE_GENRE_TO_GENRE[label]
    : undefined) ?? SOURCE_GENRE_TO_GENRE[label] ?? { genre: null };
```

Then replace:

```ts
  if (reassigned) record.promulgatedBy = reassigned.promulgatedBy;
```

with:

```ts
  // A document harvested from a pope's page and reassigned to a council carries its
  // promulgator in the reassignment row (Vatican I); one harvested from the council's
  // own index takes it from the council, which is one uniformly evidenced fact about
  // that council rather than sixteen repeated ones (spec §4.1).
  const council = COUNCILS.find((c) => c.pageSlug === item.pageSlug);
  const promulgatedBy = reassigned?.promulgatedBy ?? council?.promulgatedBy;
  if (promulgatedBy) record.promulgatedBy = promulgatedBy;
```

Keep this assignment where the old one was — after `incipit`, before `aliases` — so the JSON key order of the checked-in data files does not change.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run tools/test/toDocument.test.ts tools/test/councils.test.ts`
Expected: PASS.

- [ ] **Step 5: Run the full check**

Run: `npm run check`
Expected: PASS. No harvested data has changed yet: no council is wired into `run.ts`, and for every existing item `issuerId.startsWith('oec:')` is only true on the two Vatican I records, whose label `'Costituzione dogmatica'` maps identically in both tables.

- [ ] **Step 6: Commit**

```bash
git add tools/src/harvest/toDocument.ts tools/test/toDocument.test.ts
git commit -m "Resolve conciliar genres and promulgator in toDocument"
```

---

### Task 4: Wire the council into the harvest, regenerate, and correct the Coverage prose

**Files:**
- Modify: `tools/src/harvest/run.ts`
- Modify: `tools/src/render/indexMd.ts` (Coverage prose)
- Create: `data/documents/vatican-ii.json` (generated — `npm run harvest`)
- Modify: `registry/documents.md` and `registry/documents/**` (generated — `npm run render`)
- Test: `tools/test/harvest-data.test.ts` (append), `tools/test/render.test.ts` (append)

**Interfaces:**
- Consumes: `parseCouncilIndex` from Task 2; `COUNCILS` from Task 1.
- Produces: `data/documents/vatican-ii.json`, sixteen minted records.

- [ ] **Step 1: Write the failing tests**

Append to `tools/test/harvest-data.test.ts` a new top-level describe block, after the existing per-issuer count block:

```ts
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
});
```

Append to `tools/test/render.test.ts`, inside the `describe('renderIndexMd', …)` block (the one that already asserts `## Coverage`):

```ts
  it('names the councils vatican.va does not publish', () => {
    expect(md).toMatch(/nineteen/);
    expect(md).toMatch(/Councils before 1870/);
  });

  it('counts John XXIII among the year-partitioned letters shelves', () => {
    // His letters shelf is year-partitioned (1958-1963) and unharvested, like Benedict
    // XV's and Paul VI's onward; the note used to begin at Benedict XV.
    expect(md).toMatch(/John XXIII, Benedict XV, and Paul VI onward/);
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tools/test/harvest-data.test.ts tools/test/render.test.ts`
Expected: FAIL — `ENOENT: no such file or directory, open 'data/documents/vatican-ii.json'`, and the two Coverage assertions fail on the current prose.

- [ ] **Step 3: Wire the council into the harvest**

In `tools/src/harvest/run.ts`, extend the mappings import to include `COUNCILS`:

```ts
import {
  POPES, COUNCILS, DATE_CORRECTIONS, DUPLICATE_MERGES, ADJUDICATED_DISTINCT, isErectionCandidate,
} from '../mappings/index.js';
```

Add the adapter import beside the other two:

```ts
import { parseCouncilIndex } from './council.js';
```

And immediately after the `for (const pope of POPES) { … }` loop, add:

```ts
// Councils are read from their own archive index, not from a pope's page. Their items
// carry `shelf: null` and a council pageSlug, so the three dedupe passes below -- all
// keyed on pageSlug -- can never merge a conciliar act with a papal one.
for (const council of COUNCILS) {
  items.push(...parseCouncilIndex(fixture(council.pageSlug), council));
}
```

- [ ] **Step 4: Correct the Coverage prose**

In `tools/src/render/indexMd.ts`, in the template literal's Coverage list, replace this bullet:

```
- **Year-partitioned \`letters\` shelves** — Benedict XV, and Paul VI onward. The \`letters\` shelf is
  harvested only where the aggregate index carries its items.
```

with:

```
- **Year-partitioned \`letters\` shelves** — John XXIII, Benedict XV, and Paul VI onward. The
  \`letters\` shelf is harvested only where the aggregate index carries its items.
```

And add this bullet immediately after the bishops'-conferences bullet:

```
- **Councils before 1870.** vatican.va's council archive publishes only Vatican I and Vatican II;
  the other nineteen ecumenical councils have no source there, so a registry holding two councils
  is not a registry of the councils.
```

- [ ] **Step 5: Regenerate the data and the registry**

Run: `npm run harvest`
Expected: the run log gains a `vatican-ii: 16` line among the per-issuer counts, and the total after dedupe rises by 16. No new warning should mention `ii_vatican_council`: council items are never erection candidates (`isErectionCandidate` returns false on a null shelf) and never provisional.

Run: `npm run render`

Then confirm the shape of what changed before trusting it:

```bash
git diff --stat data/documents registry
python3 -c "import json;d=json.load(open('data/documents/vatican-ii.json'));print(len(d));print(d[0])"
grep -n 'vatican-ii' registry/documents.md
```

Expected: `data/documents/vatican-ii.json` is new with 16 records; **no other `data/documents/*.json` file changes at all** — if one does, stop and find out why before committing. `registry/documents.md` gains a `oec:vatican-ii` row reading `— (conciliar)` in the Shelves harvested column, `declaration` and `decree` rows in the by-genre table, and shows 4285 documents with 316 provisional.

- [ ] **Step 6: Run the tests to verify they pass**

Run: `npx vitest run tools/test/harvest-data.test.ts tools/test/render.test.ts`
Expected: PASS.

- [ ] **Step 7: Run the full check**

Run: `npm run check`
Expected: PASS. In particular `the whole corpus` must still report globally unique ids and zero invariant violations across all 4285 records, and `keeps the 383 pilot identifiers exactly as first minted` must still pass — Vatican II is not in the pilot set and must not disturb it.

- [ ] **Step 8: Commit**

```bash
git add tools/src/harvest/run.ts tools/src/render/indexMd.ts \
        tools/test/harvest-data.test.ts tools/test/render.test.ts \
        data/documents/vatican-ii.json registry
git commit -m "Harvest the Second Vatican Council into the registry"
```

---

## Verification

After Task 4, confirm the thing this plan exists to fix:

```bash
grep -rn 'mag:vatican-ii/gaudium-et-spes-1965' data/documents/vatican-ii.json SCHEMA.md
```

Expected: the identifier `SCHEMA.md` uses as its worked example now appears in the data too.
