# Document Registry Expansion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the CMDDR document registry from 383 documents (Benedict XIV, Pius IX, Leo XIII, Vatican I) to roughly 2,800 by harvesting the formal document shelves of the eleven remaining pontificates on vatican.va.

**Architecture:** The existing pure-core pipeline is kept and extended in three places. A per-pope `POPES` table replaces the global `SHELVES` constant, because shelf membership varies by pope. A page-resolution step in front of the unchanged `parseShelfIndex` handles year-partitioned shelves. A new pure `extractIncipit` splits a printed heading into `title` (always) and `incipit` (when the heading actually contains one), with `idStatus: provisional` and a harvest warning for the rest. `registry/documents.md` becomes an index over two generated views, by issuer and by genre.

**Tech Stack:** Node ≥20.10.0, TypeScript (ESM, `tsx`), vitest, cheerio, ajv + ajv-formats.

**Spec:** `docs/superpowers/specs/2026-09-07-document-registry-expansion-design.md`

## Global Constraints

- **Node engine floor is `>=20.10.0`** (`package.json`); CI runs Node 20. Do not raise it.
- **Tests never touch the network.** Every parser test reads `tools/fixtures/*.html`. Fixtures are fetched once, by hand, via `tools/fetch-fixtures.sh` (Task 2) and checked in.
- **`FIXTURES_RETRIEVED = '2026-09-07'`** in `tools/src/harvest/run.ts` is the source-of-truth retrieval date, overridable only by the `RETRIEVED` env var. It must be updated whenever fixtures are refreshed, and every harvested record's `source.retrieved` must equal it.
- **Every curated mapping-table entry carries a `note`** quoting the textual evidence for it. Nothing in a mapping table is ever inferred mechanically; heuristics may *warn*, never *write*.
- **`npm run check`** = `vitest run && tsc --noEmit && tsx tools/src/validate/run.ts`. Every task ends with it green.
- **CI enforces regeneration drift**: after `npm run harvest && npm run render`, `git diff --exit-code data/ registry/` must be clean. A harvest that is not reproducible is a failure.
- **Identifier changes must be explained, not prevented.** Nothing in this repository is published: the registry and every identifier in it are under community and peer review, so the spec's "minted ids are permanent" guarantee describes the scheme's contract *after* publication and is not yet in force. A task may therefore re-mint an existing id when the evidence says the old one was wrong.

  What does **not** relax is the accounting. An id that changes without a stated reason is a bug signal, so every task that touches the harvest must diff `data/` and account for **each** changed `"id"` line — the same standard the document-count procedure applies to a raw-to-deduped delta. An unexplained id change is a stop condition. The 383 pilot records remain the regression fixture in exactly that sense: not "these ids may not move", but "if one moves, say why."
- **`keywords` is never authority-bearing.** No invariant other than vocabulary membership (21) may read it, and it may never influence `genre`, `characteristics`, `register` or any Table 2 assessment.

---

## File Structure

**New source files**

| File | Responsibility |
|---|---|
| `tools/src/harvest/incipit.ts` | Pure: split a printed heading into `{ title, incipit }`. No I/O, no DOM. |
| `tools/src/harvest/shelfPages.ts` | Pure: decide whether a shelf index page carries its items or links year pages. |
| `tools/src/mappings/incipit-rules.ts` | Curated: genre prefixes, gloss connectors, bare-genre rejects, the word ceiling. |
| `tools/src/mappings/keywords.ts` | Curated: `CIRCUMSCRIPTION_ERECTIONS`, plus the textual and morphological patterns of spec §4.5. |
| `tools/src/render/issuerMd.ts` | Pure: render one issuer's table. |
| `tools/src/render/genreMd.ts` | Pure: render one genre's table. |
| `tools/src/render/indexMd.ts` | Pure: render `registry/documents.md`, the index and coverage statement. |
| `tools/fetch-fixtures.sh` | Records the exact vatican.va URLs behind every fixture, so a refresh is reproducible. |
| `data/keywords.json` | The controlled keyword vocabulary, structured like `data/genres.json`. |

**Modified source files**

| File | Change |
|---|---|
| `tools/src/mappings/pontiffs.ts` | `PILOT_POPES` + `SHELVES` → `POPES` with per-pope `shelves`; `VATICAN_SLUG_TO_ISSUER` derived. |
| `tools/src/mappings/genres.ts` | Add `apost_exhortations`, `apost-constitutions`. |
| `tools/src/types.ts` | `HarvestItem.title` (new, required); `HarvestItem.incipit` and `DocumentRecord.incipit` become nullable/optional; `DocumentRecord.keywords`. |
| `tools/src/harvest/shelf.ts` | Call `extractIncipit`; emit `title` and a possibly-null `incipit`. |
| `tools/src/harvest/flat.ts` | Emit `title` alongside `incipit` (always equal in the flat era). |
| `tools/src/harvest/toDocument.ts` | Branch minted/provisional; apply keywords. |
| `tools/src/harvest/run.ts` | Iterate `POPES`; resolve shelf pages; key dedupe on `incipit ?? title`; new warning classes. |
| `tools/src/render/run.ts` | Write the `registry/documents/` tree instead of one file. |
| `tools/src/validate/invariants.ts` | Invariants 18–21. |
| `schema/document.schema.json` | Add the `keywords` property. |
| `tools/src/render/documentsMd.ts` | **Deleted** in Task 4, replaced by the three renderers above. |

**Modified test files**

`tools/test/mappings.test.ts`, `tools/test/shelf.test.ts`, `tools/test/flat.test.ts`, `tools/test/toDocument.test.ts`, `tools/test/render.test.ts`, `tools/test/harvest-data.test.ts`, `tools/test/invariants.test.ts`.

**New test files**

`tools/test/incipit.test.ts`, `tools/test/shelfPages.test.ts`, `tools/test/keywords.test.ts`, `tools/test/keywords-data.test.ts`.

---

## A note on document counts

Several tasks end by harvesting a pontificate and asserting a document count. **The plan cannot predict these counts** — they depend on how many documents dedupe across shelves, which is a fact about vatican.va, not about the code.

The procedure, in every such task, is:

1. Run `npm run harvest`. It prints `N items -> M documents after cross-shelf dedupe` and one warning per unresolved case.
2. **Every unit of the difference `N - M` must be explained** by a merge the code performed, and every warning must be either resolved into a curated table or adjudicated and suppressed.
3. Write `M` into the test *with a comment that explains the arithmetic*, in the style of the existing `harvest-data.test.ts` ("395 raw items in. Twelve Leo XIII documents … 395 - 12 = 383.").

**An unexplained delta or an unexamined warning is a stop condition, not a number to paste in.** If you cannot account for it, stop and report rather than recording a count you cannot justify.

---

## Task 1: Replace `PILOT_POPES` and `SHELVES` with a per-pope `POPES` table

Pure refactor. No pope is added, no fixture is fetched, and `data/` and `registry/` must be byte-identical afterwards. That invariance is the test.

**Files:**
- Modify: `tools/src/mappings/pontiffs.ts`
- Modify: `tools/src/harvest/run.ts:57-65`
- Test: `tools/test/mappings.test.ts`, `tools/test/shelf.test.ts`, `tools/test/harvest-data.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `interface PopeSource { pageSlug: string; issuerId: string; era: 'flat' | 'shelf'; shelves: readonly string[] }`; `POPES: readonly PopeSource[]`; `shelvesFor(pageSlug: string): readonly string[]`; `VATICAN_SLUG_TO_ISSUER: Record<string, string>` (unchanged shape, now derived). `PILOT_POPES` and `SHELVES` no longer exist.

- [ ] **Step 1: Write the failing test**

Replace the `describes the pilot corpus and its eras` test in `tools/test/mappings.test.ts`, and change that file's import of `PILOT_POPES, SHELVES` to `POPES, shelvesFor`:

```ts
describe('the POPES table', () => {
  it('describes each pope page, its era and its own shelf list', () => {
    expect(POPES.map((p) => p.pageSlug))
      .toEqual(['benedictus-xiv', 'pius-ix', 'leo-xiii']);
    expect(POPES.find((p) => p.pageSlug === 'leo-xiii')!.era).toBe('shelf');
    expect(POPES.find((p) => p.pageSlug === 'pius-ix')!.era).toBe('flat');
  });

  it('gives the flat-era popes no shelves', () => {
    for (const slug of ['benedictus-xiv', 'pius-ix']) {
      expect(shelvesFor(slug)).toEqual([]);
    }
  });

  it("keeps Leo XIII's eight shelves exactly as harvested", () => {
    expect(shelvesFor('leo-xiii')).toEqual([
      'apost_constitutions', 'apost_letters', 'briefs', 'bulls',
      'encyclicals', 'letters', 'motu_proprio', 'speeches',
    ]);
  });

  it('derives the slug->issuer map from the table, so the two cannot disagree', () => {
    expect(Object.keys(VATICAN_SLUG_TO_ISSUER).sort()).toEqual(POPES.map((p) => p.pageSlug).sort());
    for (const p of POPES) expect(VATICAN_SLUG_TO_ISSUER[p.pageSlug]).toBe(p.issuerId);
  });

  it('returns an empty shelf list for an unknown slug rather than throwing', () => {
    expect(shelvesFor('not-a-pope')).toEqual([]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tools/test/mappings.test.ts`
Expected: FAIL — `POPES` and `shelvesFor` are not exported from `../src/mappings/index.js`.

- [ ] **Step 3: Write the implementation**

Replace the bottom half of `tools/src/mappings/pontiffs.ts` (everything from `VATICAN_SLUG_TO_ISSUER` down) with:

```ts
export interface PopeSource {
  /** The vatican.va URL slug, e.g. 'benedictus-xiv'. Not the CRPDR id. */
  pageSlug: string;
  /** The CRPDR id, e.g. 'rp:benedict-xiv'. */
  issuerId: string;
  /** 'flat' pages carry one reverse-chronological list; 'shelf' pages carry per-genre indexes. */
  era: 'flat' | 'shelf';
  /**
   * The shelves harvested for this pope. Curated per pope, never inferred from the page's
   * links: shelf membership varies (no `bulls` for Pius X), spelling varies (Benedict XV
   * hyphenates `apost-constitutions`), and several linked indexes -- `biography`,
   * `biografia`, `books`, `jubilee`, `elezione` -- are not document shelves at all.
   * Empty for the flat era, which has no shelves.
   */
  shelves: readonly string[];
}

export const POPES: readonly PopeSource[] = [
  { pageSlug: 'benedictus-xiv', issuerId: 'rp:benedict-xiv', era: 'flat', shelves: [] },
  { pageSlug: 'pius-ix', issuerId: 'rp:pius-ix', era: 'flat', shelves: [] },
  {
    pageSlug: 'leo-xiii', issuerId: 'rp:leo-xiii', era: 'shelf',
    shelves: [
      'apost_constitutions', 'apost_letters', 'briefs', 'bulls',
      'encyclicals', 'letters', 'motu_proprio', 'speeches',
    ],
  },
] as const;

/** The shelves harvested for a pope page; empty for an unknown slug or a flat-era page. */
export function shelvesFor(pageSlug: string): readonly string[] {
  return POPES.find((p) => p.pageSlug === pageSlug)?.shelves ?? [];
}

/**
 * vatican.va URL slugs do not match CRPDR ids; this is the bridge. Derived from POPES
 * rather than maintained beside it, so the two can never disagree.
 */
export const VATICAN_SLUG_TO_ISSUER: Record<string, string> =
  Object.fromEntries(POPES.map((p) => [p.pageSlug, p.issuerId]));
```

- [ ] **Step 4: Update the two tests that imported `SHELVES`**

In `tools/test/shelf.test.ts` and `tools/test/harvest-data.test.ts`, replace the import of `SHELVES` with `shelvesFor` and every use of `SHELVES` with `shelvesFor('leo-xiii')`.

- [ ] **Step 5: Update the harvest orchestrator**

In `tools/src/harvest/run.ts`, change the import of `PILOT_POPES, SHELVES` to `POPES`, and replace the collection loop (currently lines 57–65) with:

```ts
const items: HarvestItem[] = [];
for (const pope of POPES) {
  if (pope.era === 'flat') {
    items.push(...parseFlatIndex(fixture(pope.pageSlug), pope.pageSlug));
  } else {
    for (const shelf of pope.shelves) {
      items.push(...parseShelfIndex(fixture(`${pope.pageSlug}-${shelf}`), pope.pageSlug, shelf));
    }
  }
}
```

- [ ] **Step 6: Run the whole suite and the drift check**

```bash
npm run check
npm run harvest && npm run render
git diff --exit-code data/ registry/
```

Expected: check passes; `git diff` reports no changes. If `data/` changed, the refactor was not behaviour-preserving — the most likely cause is a different shelf order in the Leo XIII list, which changes nothing semantically but does change `alsoShelvedAs` tie-breaks. Restore the alphabetical order shown above.

- [ ] **Step 7: Commit**

```bash
git add tools/src/mappings/pontiffs.ts tools/src/harvest/run.ts tools/test/
git commit -m "refactor: replace PILOT_POPES and SHELVES with a per-pope POPES table

Shelf membership is a per-pope fact, not a global constant: shelves vary
by pope, Benedict XV hyphenates apost-constitutions, and several linked
indexes are not document shelves. VATICAN_SLUG_TO_ISSUER is now derived
from the same table so the two cannot drift apart.

Pure refactor: data/ and registry/ are byte-identical."
```

---

## Task 2: Add Pius X

The first new pontificate. Its headings are bare incipits like Leo XIII's, so this exercises the per-pope shelf mechanism alone with no new parsing.

**Files:**
- Create: `tools/fetch-fixtures.sh`
- Create: `tools/fixtures/pius-x-{encyclicals,apost_constitutions,apost_letters,apost_exhortations,motu_proprio,letters}.html` (6 files)
- Modify: `tools/src/mappings/pontiffs.ts`
- Test: `tools/test/shelf.test.ts`, `tools/test/harvest-data.test.ts`

**Interfaces:**
- Consumes: `POPES`, `shelvesFor` (Task 1).
- Produces: `data/documents/pius-x.json`.

- [ ] **Step 1: Write the fixture-fetching script**

Create `tools/fetch-fixtures.sh`, `chmod +x` it. This is documentation-as-code: it records the exact URL behind every fixture so a refresh is reproducible.

```bash
#!/usr/bin/env bash
# Fetch the vatican.va index pages the harvest parses, into tools/fixtures/.
#
# Fixtures are checked in so the test suite is offline and deterministic: a
# vatican.va redesign then fails a test instead of silently corrupting a harvest.
# After running this, update FIXTURES_RETRIEVED in tools/src/harvest/run.ts to
# today's date and re-run `npm run harvest && npm run render`.
#
# Usage: tools/fetch-fixtures.sh                 # every fixture
#        tools/fetch-fixtures.sh pius-x          # one pope's fixtures
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p tools/fixtures

get() { # get <output-basename> <url>
  echo "  $1"
  curl -fsSL --retry 3 --max-time 60 "$2" -o "tools/fixtures/$1.html"
}

flat() { get "$1" "https://www.vatican.va/content/$1/it.html"; }

shelf() { # shelf <pageSlug> <shelfName>
  get "$1-$2" "https://www.vatican.va/content/$1/it/$2.index.html"
}

year() { # year <pageSlug> <shelfName> <YYYY>
  get "$1-$2-$3" "https://www.vatican.va/content/$1/it/$2/$3.index.html"
}

want() { [ $# -eq 0 ] || [ "${1:-}" = "$POPE" ]; }
POPE="${1:-}"

if want benedictus-xiv; then flat benedictus-xiv; fi
if want pius-ix; then flat pius-ix; fi

if [ -z "$POPE" ] || [ "$POPE" = leo-xiii ]; then
  for s in apost_constitutions apost_letters briefs bulls encyclicals letters motu_proprio speeches; do
    shelf leo-xiii "$s"
  done
fi

if [ -z "$POPE" ] || [ "$POPE" = pius-x ]; then
  for s in encyclicals apost_constitutions apost_letters apost_exhortations motu_proprio letters; do
    shelf pius-x "$s"
  done
fi
```

Later tasks append their own popes to the bottom of this script.

- [ ] **Step 2: Fetch the Pius X fixtures**

```bash
tools/fetch-fixtures.sh pius-x
ls -la tools/fixtures/pius-x-*.html
```

Expected: 6 files. Sanity-check the item counts against spec §2.4 before going further:

```bash
for f in tools/fixtures/pius-x-*.html; do echo "$f $(grep -o 'class="item"' "$f" | wc -l)"; done
```

Expected: `encyclicals 16`, `apost_constitutions 8`, `apost_letters 54`, `apost_exhortations 1`, `motu_proprio 38`, `letters 189`. **If any count is 0, the shelf is year-partitioned and Task 9 is a prerequisite — stop and report.** If a count differs by a small amount, vatican.va has been updated since the spec was written; record the new number and continue.

- [ ] **Step 3: Write the failing test**

Add to `tools/test/shelf.test.ts`:

```ts
describe('parseShelfIndex on Pius X', () => {
  const loadPiusX = (shelf: string) =>
    parseShelfIndex(readFileSync(`tools/fixtures/pius-x-${shelf}.html`, 'utf8'), 'pius-x', shelf);
  const allPiusX = shelvesFor('pius-x').flatMap((s) => loadPiusX(s));

  it('reads the same markup as the Leo XIII shelves', () => {
    expect(loadPiusX('encyclicals')).toHaveLength(16);
    expect(loadPiusX('apost_exhortations')).toHaveLength(1);
    expect(loadPiusX('letters')).toHaveLength(189);
  });

  it('reads bare incipits, which is why Pius X needs no new parsing', () => {
    const mp = loadPiusX('motu_proprio');
    expect(mp.find((d) => d.date === '1914-01-16')!.incipit).toBe('Quanta semper cura');
    expect(loadPiusX('letters').find((d) => d.date === '1914-01-20')!.incipit)
      .toBe('Iucunda equidem');
    expect(loadPiusX('apost_exhortations')[0]!.incipit).toBe('Haerent Animo');
  });

  it('yields a usable date and incipit for every item', () => {
    for (const d of allPiusX) {
      expect(d.incipit, JSON.stringify(d)).not.toBe('');
      expect(d.date, JSON.stringify(d)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run tools/test/shelf.test.ts`
Expected: FAIL — `shelvesFor('pius-x')` returns `[]`, so `allPiusX` is empty and the length assertions fail.

- [ ] **Step 5: Add the Pius X row**

In `tools/src/mappings/pontiffs.ts`, insert after the `leo-xiii` entry:

```ts
  {
    pageSlug: 'pius-x', issuerId: 'rp:pius-x', era: 'shelf',
    // No bulls or briefs shelf exists for Pius X. `speeches` is excluded here and for
    // every later pope (spec §2.7): from Pius XI on it holds occasional acts with
    // descriptive titles rather than incipits. Leo XIII keeps its speeches, which are
    // genuine Latin allocutions.
    shelves: [
      'apost_constitutions', 'apost_exhortations', 'apost_letters',
      'encyclicals', 'letters', 'motu_proprio',
    ],
  },
```

- [ ] **Step 6: Add the genre mapping for the new shelf**

In `tools/src/mappings/genres.ts`, add to `SOURCE_GENRE_TO_GENRE`:

```ts
  'apost_exhortations': { genre: 'apostolic-exhortation' },
  'esortazione apostolica': { genre: 'apostolic-exhortation' },
```

- [ ] **Step 7: Run the harvest and account for every warning**

```bash
npm run harvest 2>&1 | tee /tmp/pius-x-harvest.log
grep -c 'Unmerged same-date' /tmp/pius-x-harvest.log || true
grep 'date mismatch' /tmp/pius-x-harvest.log || true
```

Follow the count procedure in **A note on document counts** above. Resolve each warning:

- a *printed/slug date mismatch* is adjudicated by reading the document's own dating formula on vatican.va and cross-checking it against the stated pontificate year (**Pius X was elected 4 August 1903**), then recorded in `DATE_CORRECTIONS` with the formula quoted in its `note`;
- an *unmerged same-date cross-shelf pair* is resolved by comparing the two documents' full texts: either a `DUPLICATE_MERGES` entry (same act) or an `ADJUDICATED_DISTINCT` entry (different acts), each with its evidence in the `note`.

- [ ] **Step 8: Write the corpus test**

Add to `tools/test/harvest-data.test.ts`, filling `M` from Step 7 and replacing the bracketed text with your actual arithmetic:

```ts
describe('the Pius X corpus', () => {
  const px = load('pius-x');

  it('holds every formal-shelf document', () => {
    // 306 raw items across six shelves (16 encyclicals + 8 apostolic constitutions +
    // 54 apostolic letters + 1 exhortation + 38 motu proprio + 189 letters).
    // [explain every merge here] => M.
    expect(px).toHaveLength(M);
  });

  it('mints every id, since Pius X prints bare incipits', () => {
    expect(px.filter((d) => d.idStatus === 'provisional')).toEqual([]);
  });

  it('files them all under Pius X', () => {
    expect(px.every((d) => d.issuerId === 'rp:pius-x')).toBe(true);
    expect(px.every((d) => d.id.startsWith('mag:pius-x/'))).toBe(true);
  });

  it('satisfies every invariant', () => {
    expect(checkDocuments(px, genres)).toEqual([]);
  });

  it('leaves the 383 pilot records untouched', () => {
    expect(all).toHaveLength(383);
  });
});
```

- [ ] **Step 9: Verify and check drift**

```bash
npm run check
npm run harvest && npm run render
git diff --exit-code data/ registry/
```

Expected: check passes; no drift on a second run.

- [ ] **Step 10: Commit**

```bash
git add tools/fetch-fixtures.sh tools/fixtures/pius-x-*.html \
        tools/src/mappings/ data/ registry/ tools/test/
git commit -m "feat: harvest Pius X's formal shelves

Six shelves, no new parsing: Pius X prints bare incipits like Leo XIII.
Adds tools/fetch-fixtures.sh recording the exact URL behind every fixture,
and the apostolic-exhortation genre mapping for the new shelf."
```

---

## Task 3: Render one issuer's table and one genre's table

Pure renderers, no I/O. The existing `renderDocumentsMd` stays in place until Task 4 so the suite is green throughout.

**Files:**
- Create: `tools/src/render/issuerMd.ts`, `tools/src/render/genreMd.ts`
- Test: `tools/test/render.test.ts`

**Interfaces:**
- Consumes: `DocumentRecord` from `../src/types.js`.
- Produces: `renderIssuerMd(issuerLocal: string, docs: DocumentRecord[]): string`; `renderGenreMd(genreId: string | null, docs: DocumentRecord[]): string`. Both sort by `date`, then `id`, exactly as `renderDocumentsMd` does.

- [ ] **Step 1: Write the failing test**

Replace the whole body of `tools/test/render.test.ts` with:

```ts
import { describe, it, expect } from 'vitest';
import { renderIssuerMd } from '../src/render/issuerMd.js';
import { renderGenreMd } from '../src/render/genreMd.js';
import type { DocumentRecord } from '../src/types.js';

const docs: DocumentRecord[] = [
  { id: 'mag:leo-xiii/rerum-novarum-1891', title: 'Rerum Novarum', incipit: 'Rerum Novarum',
    idStatus: 'minted', genre: 'encyclical', issuerId: 'rp:leo-xiii', issuerType: 'pope',
    date: '1891-05-15' },
  { id: 'mag:leo-xiii/immortale-dei-1885', title: 'Immortale Dei', incipit: 'Immortale Dei',
    idStatus: 'minted', genre: 'encyclical', issuerId: 'rp:leo-xiii', issuerType: 'pope',
    date: '1885-11-01' },
];

const conciliar: DocumentRecord = {
  id: 'mag:vatican-i/pastor-aeternus-1870', title: 'Pastor Aeternus', incipit: 'Pastor Aeternus',
  idStatus: 'minted', genre: 'constitution', issuerId: 'oec:vatican-i',
  issuerType: 'ecumenical-council', promulgatedBy: 'rp:pius-ix', date: '1870-07-18',
};

const provisional: DocumentRecord = {
  id: 'mag:pius-xii/apostolic-letter-1958-08-11', title: 'Lettera Apostolica che proclama…',
  idStatus: 'provisional', genre: 'apostolic-letter', issuerId: 'rp:pius-xii',
  issuerType: 'pope', date: '1958-08-11',
};

describe('renderIssuerMd', () => {
  const md = renderIssuerMd('leo-xiii', docs);

  it('omits the issuer column, which is constant in this view', () => {
    expect(md).toContain('| ID | Title | Incipit | Genre | Date | Promulgated by |');
    expect(md).not.toContain('| Issuer |');
  });

  it('emits one row per document, sorted chronologically', () => {
    expect(md.split('\n').filter((l) => l.startsWith('| `mag:'))).toHaveLength(2);
    expect(md.indexOf('immortale-dei')).toBeLessThan(md.indexOf('rerum-novarum'));
  });

  it('names the issuer and marks the file as generated', () => {
    expect(md).toContain('rp:leo-xiii');
    expect(md).toMatch(/generated/i);
  });

  it('shows the promulgator for a conciliar document', () => {
    expect(renderIssuerMd('vatican-i', [conciliar])).toContain('`rp:pius-ix`');
  });
});

describe('renderGenreMd', () => {
  const md = renderGenreMd('encyclical', docs);

  it('omits the genre column, which is constant in this view', () => {
    expect(md).toContain('| ID | Title | Incipit | Issuer | Date | Promulgated by |');
    expect(md).not.toContain('| Genre |');
  });

  it('shows the issuer, which varies in this view', () => {
    expect(md).toContain('`rp:leo-xiii`');
  });

  it('titles the unmapped page for a null genre', () => {
    const un = renderGenreMd(null, [{ ...docs[0]!, genre: null, sourceGenreLabel: 'Editto' }]);
    expect(un).toMatch(/unmapped/i);
    expect(un).toContain('Editto');
  });
});

describe('both views', () => {
  it('marks a provisional id with a dagger and footnotes it', () => {
    for (const md of [renderIssuerMd('pius-xii', [provisional]), renderGenreMd('apostolic-letter', [provisional])]) {
      expect(md).toContain('`mag:pius-xii/apostolic-letter-1958-08-11` †');
      expect(md).toMatch(/† .*provisional/i);
    }
  });

  it('leaves the incipit cell empty for a provisional record', () => {
    const row = renderIssuerMd('pius-xii', [provisional])
      .split('\n').find((l) => l.startsWith('| `mag:'))!;
    expect(row.split('|')[3]!.trim()).toBe('');
  });

  it('escapes a pipe in scraped text so it cannot break the table', () => {
    const piped = { ...docs[0]!, title: 'A | B', incipit: 'A | B' };
    expect(renderIssuerMd('leo-xiii', [piped])).toContain('A \\| B');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tools/test/render.test.ts`
Expected: FAIL — cannot resolve `../src/render/issuerMd.js`.

- [ ] **Step 3: Write the shared row helpers**

Create `tools/src/render/issuerMd.ts`:

```ts
import type { DocumentRecord } from '../types.js';

/** Escape a Markdown table cell's own column separator; the source is scraped text. */
export const cell = (s: string): string => s.replace(/\|/g, '\\|');

/** Chronological, with the id as a stable tie-break. Shared by both views. */
export const byDateThenId = (a: DocumentRecord, b: DocumentRecord): number =>
  a.date === b.date ? a.id.localeCompare(b.id) : a.date.localeCompare(b.date);

/** A provisional id is daggered so the distinction is visible without consulting idStatus. */
export const idCell = (d: DocumentRecord): string =>
  d.idStatus === 'provisional' ? `\`${d.id}\` †` : `\`${d.id}\``;

export const genreCell = (d: DocumentRecord): string =>
  d.genre ?? `— (${cell(d.sourceGenreLabel ?? 'unmapped')})`;

export const FOOTNOTE =
  '† A provisional identifier: the source prints no incipit for this document, '
  + 'so the id is genre-and-date based and may be re-minted if a conventional name '
  + 'is established. See the design spec §3.5.';

const GENERATED =
  'Generated by `npm run render` from `data/documents/*.json` — do not edit by hand.';

export function renderIssuerMd(issuerLocal: string, docs: DocumentRecord[]): string {
  const rows = [...docs].sort(byDateThenId);
  const prefix = rows[0]?.issuerId.startsWith('oec:') ? 'oec' : 'rp';
  const head = `# Documents of \`${prefix}:${issuerLocal}\`

${GENERATED}

${rows.length} documents.

| ID | Title | Incipit | Genre | Date | Promulgated by |
| --- | --- | --- | --- | --- | --- |`;

  const body = rows.map((d) =>
    `| ${idCell(d)} | ${cell(d.title)} | ${d.incipit ? cell(d.incipit) : ''} `
    + `| ${genreCell(d)} | ${d.date} | ${d.promulgatedBy ? `\`${d.promulgatedBy}\`` : ''} |`);

  return `${head}\n${body.join('\n')}\n\n${FOOTNOTE}\n`;
}
```

Note the `prefix` line: an issuer file holds documents of exactly one issuer, so the first row settles whether it is a pope or a council.

- [ ] **Step 4: Write the genre renderer**

Create `tools/src/render/genreMd.ts`:

```ts
import { cell, byDateThenId, idCell, FOOTNOTE } from './issuerMd.js';
import type { DocumentRecord } from '../types.js';

export function renderGenreMd(genreId: string | null, docs: DocumentRecord[]): string {
  const rows = [...docs].sort(byDateThenId);
  const heading = genreId === null
    ? 'Documents with an unmapped genre'
    : `Documents of genre \`${genreId}\``;
  const preamble = genreId === null
    ? '\nThe source genre has no Genre Registry row yet; the raw label is preserved in the '
      + 'Source label column rather than a taxonomy being invented for it. See the design spec §2.6.\n'
    : '';

  const head = `# ${heading}

Generated by \`npm run render\` from \`data/documents/*.json\` — do not edit by hand.
${preamble}
${rows.length} documents.

| ID | Title | Incipit | Issuer | Date | Promulgated by |${genreId === null ? ' Source label |' : ''}
| --- | --- | --- | --- | --- | --- |${genreId === null ? ' --- |' : ''}`;

  const body = rows.map((d) =>
    `| ${idCell(d)} | ${cell(d.title)} | ${d.incipit ? cell(d.incipit) : ''} `
    + `| \`${d.issuerId}\` | ${d.date} | ${d.promulgatedBy ? `\`${d.promulgatedBy}\`` : ''} |`
    + (genreId === null ? ` ${cell(d.sourceGenreLabel ?? '')} |` : ''));

  return `${head}\n${body.join('\n')}\n\n${FOOTNOTE}\n`;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tools/test/render.test.ts`
Expected: PASS, 11 tests.

- [ ] **Step 6: Commit**

```bash
git add tools/src/render/issuerMd.ts tools/src/render/genreMd.ts tools/test/render.test.ts
git commit -m "feat: add per-issuer and per-genre registry renderers

Each view drops the column it holds constant and adds Title, which is now
distinct from Incipit. A provisional id is daggered and footnoted so the
distinction is visible without consulting idStatus."
```

---

## Task 4: Write the registry tree and its index

Replaces the single `registry/documents.md` table with an index over the two views.

**Files:**
- Create: `tools/src/render/indexMd.ts`
- Delete: `tools/src/render/documentsMd.ts`
- Modify: `tools/src/render/run.ts`
- Test: `tools/test/render.test.ts`

**Interfaces:**
- Consumes: `renderIssuerMd`, `renderGenreMd`, `byDateThenId` (Task 3); `POPES`, `shelvesFor` (Task 1); `issuerLocalPart` from `../ids.js`.
- Produces: `renderIndexMd(docs: DocumentRecord[]): string`. `renderDocumentsMd` no longer exists.

- [ ] **Step 1: Write the failing test**

Append to `tools/test/render.test.ts` (add `renderIndexMd` to the imports):

```ts
describe('renderIndexMd', () => {
  const md = renderIndexMd([...docs, conciliar, provisional]);

  it('counts documents per issuer and links the view', () => {
    expect(md).toContain('[`rp:leo-xiii`](documents/by-issuer/leo-xiii.md)');
    expect(md).toContain('[`oec:vatican-i`](documents/by-issuer/vatican-i.md)');
    expect(md).toMatch(/rp:leo-xiii.*\| 2 \|/);
  });

  it('gives each issuer its date range', () => {
    expect(md).toContain('1885-11-01 – 1891-05-15');
  });

  it('counts documents per genre and links the view', () => {
    expect(md).toContain('[`encyclical`](documents/by-genre/encyclical.md)');
    expect(md).toContain('[`constitution`](documents/by-genre/constitution.md)');
  });

  it('reports the total and the provisional share', () => {
    expect(md).toContain('4 documents');
    expect(md).toMatch(/1 .*provisional/i);
  });

  it('states coverage, naming what is deliberately absent', () => {
    expect(md).toMatch(/## Coverage/);
    expect(md).toMatch(/speeches|occasional/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tools/test/render.test.ts`
Expected: FAIL — cannot resolve `../src/render/indexMd.js`.

- [ ] **Step 3: Write the index renderer**

Create `tools/src/render/indexMd.ts`:

```ts
import { POPES } from '../mappings/index.js';
import { issuerLocalPart } from '../ids.js';
import type { DocumentRecord } from '../types.js';

const group = <K>(docs: DocumentRecord[], key: (d: DocumentRecord) => K): Map<K, DocumentRecord[]> => {
  const out = new Map<K, DocumentRecord[]>();
  for (const d of docs) out.set(key(d), [...(out.get(key(d)) ?? []), d]);
  return out;
};

const range = (docs: DocumentRecord[]): string => {
  const dates = docs.map((d) => d.date).sort();
  return dates.length === 0 ? '' : `${dates[0]} – ${dates[dates.length - 1]}`;
};

/** The genre view's filename; a null genre files under `unmapped`. */
export const genreFile = (genre: string | null): string => genre ?? 'unmapped';

export function renderIndexMd(docs: DocumentRecord[]): string {
  const byIssuer = [...group(docs, (d) => d.issuerId)].sort(
    (a, b) => range(a[1]).localeCompare(range(b[1])));
  const byGenre = [...group(docs, (d) => d.genre)].sort(
    (a, b) => genreFile(a[0]).localeCompare(genreFile(b[0])));
  const provisional = docs.filter((d) => d.idStatus === 'provisional').length;

  const shelvesOf = (issuerId: string): string => {
    const pope = POPES.find((p) => p.issuerId === issuerId);
    if (!pope) return '— (conciliar)';
    return pope.era === 'flat' ? 'whole-pontificate index' : pope.shelves.join(', ');
  };

  const issuerRows = byIssuer.map(([issuerId, ds]) => {
    const local = issuerLocalPart(issuerId);
    return `| [\`${issuerId}\`](documents/by-issuer/${local}.md) | ${ds.length} `
      + `| ${range(ds)} | ${shelvesOf(issuerId)} |`;
  });

  const genreRows = byGenre.map(([genre, ds]) =>
    `| [\`${genre ?? 'unmapped'}\`](documents/by-genre/${genreFile(genre)}.md) `
    + `| ${ds.length} | ${range(ds)} |`);

  return `# Magisterial Documents

Generated by \`npm run render\` from \`data/documents/*.json\` — do not edit by hand.

Identifiers follow \`mag:{issuer}/{incipit-slug}-{year}\`; the issuer segment is always the local
part of \`issuerId\`, so conciliar documents namespace under their council and record the
promulgating pope separately. See the design spec for the minting rules.

**${docs.length} documents**, of which ${provisional} carry a provisional identifier — the source
prints no incipit for them, so their id is genre-and-date based and may be re-minted.

Every document appears in both views below; neither is a subset of the other.

## By issuer

| Issuer | Documents | Dates | Shelves harvested |
| --- | --- | --- | --- |
${issuerRows.join('\n')}

## By genre

| Genre | Documents | Dates |
| --- | --- | --- |
${genreRows.join('\n')}

## Coverage

This registry covers the **formal document shelves** of vatican.va. Deliberately absent:

- **Occasional acts** — speeches (after Leo XIII, whose are genuine Latin allocutions), homilies,
  general audiences, Angelus addresses, messages, prayers, travels and *cotidie*. They are roughly
  99% of the archive by volume and need an identifier rule for documents whose heading is a bare
  date, which this registry does not yet have.
- **Year-partitioned \`letters\` shelves** — Benedict XV, and Paul VI onward. The \`letters\` shelf is
  harvested only where the aggregate index carries its items.
- **Bishops' conferences and dicasterial documents**, which remain outside the repository's scope.

The Shelves harvested column above is generated from the harvest configuration itself, so it cannot
drift from what was actually read.
`;
}
```

- [ ] **Step 4: Rewrite the render entry point**

Replace `tools/src/render/run.ts` entirely:

```ts
import { readFileSync, writeFileSync, readdirSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { renderIssuerMd } from './issuerMd.js';
import { renderGenreMd } from './genreMd.js';
import { renderIndexMd, genreFile } from './indexMd.js';
import { issuerLocalPart } from '../ids.js';
import type { DocumentRecord } from '../types.js';

const docs: DocumentRecord[] = readdirSync('data/documents')
  .filter((f) => f.endsWith('.json'))
  .flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[]);

// Regenerate the tree from scratch so a view for a removed issuer or genre cannot linger.
if (existsSync('registry/documents')) rmSync('registry/documents', { recursive: true });
mkdirSync('registry/documents/by-issuer', { recursive: true });
mkdirSync('registry/documents/by-genre', { recursive: true });

const byIssuer = new Map<string, DocumentRecord[]>();
const byGenre = new Map<string | null, DocumentRecord[]>();
for (const d of docs) {
  const i = issuerLocalPart(d.issuerId);
  byIssuer.set(i, [...(byIssuer.get(i) ?? []), d]);
  byGenre.set(d.genre, [...(byGenre.get(d.genre) ?? []), d]);
}

for (const [issuer, ds] of byIssuer) {
  writeFileSync(`registry/documents/by-issuer/${issuer}.md`, renderIssuerMd(issuer, ds));
}
for (const [genre, ds] of byGenre) {
  writeFileSync(`registry/documents/by-genre/${genreFile(genre)}.md`, renderGenreMd(genre, ds));
}
writeFileSync('registry/documents.md', renderIndexMd(docs));

console.log(
  `registry/documents.md + ${byIssuer.size} issuer and ${byGenre.size} genre views: `
  + `${docs.length} documents`,
);
```

- [ ] **Step 5: Delete the superseded renderer**

```bash
git rm tools/src/render/documentsMd.ts
```

- [ ] **Step 6: Regenerate and inspect**

```bash
npm run render
ls registry/documents/by-issuer/ registry/documents/by-genre/
head -40 registry/documents.md
```

Expected: an issuer file per pope in `data/documents/`, a genre file per distinct genre plus `unmapped.md`, and an index whose counts sum to the total.

- [ ] **Step 7: Verify**

```bash
npm run check
npm run render && git diff --exit-code registry/
```

Expected: check passes; the second render is a no-op.

- [ ] **Step 8: Commit**

```bash
git add -A registry/ tools/src/render/ tools/test/render.test.ts
git commit -m "feat: split the registry into by-issuer and by-genre views

registry/documents.md becomes an index carrying per-issuer and per-genre
counts, date ranges and a Coverage section generated from the harvest
configuration, so it cannot claim coverage the harvest does not have.
Both views render every document; neither is a subset."
```

---

## Task 5: `extractIncipit`

A pure function, no I/O and no DOM. This is the task that can fail interestingly — if the rule table cannot get the provisional share of Pius XI and Pius XII to a workable level in Task 8, stop and revisit spec §4.2 rather than proceeding to Tasks 9 and 12–19.

**Files:**
- Create: `tools/src/harvest/incipit.ts`, `tools/src/mappings/incipit-rules.ts`
- Modify: `tools/src/mappings/index.ts`
- Test: `tools/test/incipit.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `interface HeadingParts { title: string; incipit: string | null }`; `extractIncipit(heading: string): HeadingParts`. The `heading` argument is the printed heading **with its trailing `(date)` already removed** — which is exactly what `parseShelfIndex` computes today as its `incipit` variable.

- [ ] **Step 1: Write the failing test**

Create `tools/test/incipit.test.ts`. Every vector is a real heading from a checked-in or probed vatican.va page.

```ts
import { describe, it, expect } from 'vitest';
import { extractIncipit } from '../src/harvest/incipit.js';

const incipitOf = (h: string) => extractIncipit(h).incipit;

describe('extractIncipit', () => {
  it('is a no-op on a bare incipit, which is the whole flat and Leo XIII era', () => {
    for (const h of ['Quanta semper cura', 'Iucunda equidem', 'Rerum Novarum',
                     'Adiutricem populi', "Dall'alto dell'Apostolico Seggio",
                     'Avkaënsis', 'Tiranensis-Dyrracena', 'Vicariae potestatis in urbe']) {
      expect(extractIncipit(h)).toEqual({ title: h, incipit: h });
    }
  });

  it('always keeps the full heading as the title', () => {
    const h = 'Motu proprio In multis solaciis con il quale conferisce il nome di «Pontificia»';
    expect(extractIncipit(h).title).toBe(h);
  });

  it('strips a leading genre phrase', () => {
    expect(incipitOf('Motu proprio In multis solaciis con il quale conferisce il nome'))
      .toBe('In multis solaciis');
    expect(incipitOf('Lettera Apostolica in forma di «Motu Proprio» La vera bellezza sulla riforma'))
      .toBe('La vera bellezza');
    expect(incipitOf("Lettera Apostolica in forma di 'Motu Proprio' Dominicianus Ordo con la quale"))
      .toBe('Dominicianus Ordo');
  });

  it('prefers the longest matching genre phrase', () => {
    // 'Lettera Apostolica in forma di «Motu Proprio»' must beat 'Lettera Apostolica'.
    expect(incipitOf('Lettera Apostolica in forma di «Motu Proprio» Mutua Concordia del Sommo Pontefice'))
      .toBe('Mutua Concordia');
  });

  it('takes a quoted opening as the incipit', () => {
    expect(incipitOf('"Incomparabilis Magister". Il Santo Padre ha eretto la Provincia Ecclesiastica di Calicut'))
      .toBe('Incomparabilis Magister');
    expect(incipitOf('“C’est la confiance”: Esortazione Apostolica sulla fiducia'))
      .toBe('C’est la confiance');
    expect(incipitOf('Lettera Enciclica "Magnifica Humanitas" di Papa Leone XIV sulla custodia'))
      .toBe('Magnifica Humanitas');
  });

  it('cuts at a gloss connector', () => {
    expect(incipitOf('Quod nobis in condendo, che attribuisce al Pontificio Istituto il potere'))
      .toBe('Quod nobis in condendo');
    expect(incipitOf("Iubilaeum maximum - Bolla di indizione del Giubileo Universale dell'Anno Santo"))
      .toBe('Iubilaeum maximum');
    expect(incipitOf('Ecclesia in Medio Oriente: Esortazione Apostolica Postsinodale sulla Chiesa'))
      .toBe('Ecclesia in Medio Oriente');
    expect(incipitOf('Suavis Nutrix animarum: Il Santo Padre ha eretto la Diocesi di Bariadi'))
      .toBe('Suavis Nutrix animarum');
    expect(incipitOf('Mirabilis Deus, col quale il Pontefice attribuisce a Don Giovanni Bosco'))
      .toBe('Mirabilis Deus');
    expect(incipitOf('Oecumenicum Concilium sulla recita del Rosario per la riuscita del Concilio'))
      .toBe('Oecumenicum Concilium');
    expect(incipitOf('Dès le début ai Capi dei popoli belligeranti invitandoli a trovare la pace'))
      .toBe('Dès le début');
    expect(incipitOf('Il Film Ideale - Esortazioni ai rappresentanti del mondo cinematografico'))
      .toBe('Il Film Ideale');
    expect(incipitOf("Esortazione Apostolica Dilexi te del Santo Padre Leone XIV, sull'amore ai poveri"))
      .toBe('Dilexi te');
  });

  it('returns null when the residue continues the genre phrase in lower case', () => {
    // An incipit is capitalised or quoted; a lower-case residue is gloss, not incipit.
    for (const h of [
      'Lettera Apostolica (breve) che proclama Santa Chiara Patrona Celeste della Televisione',
      'Lettera a S. E. Monsignor Luigi Agostino Marmottin, in occasione della celebrazione',
      'Chirografo al Cardinale Eugenio Pacelli, affidando al Cardinale Segretario di Stato',
      'Lettera Apostolica inviata a nome del Santo Padre dal Segretario di Stato',
      'Lettera Apostolica data Motu Proprio su alcune modifiche alle norme relative',
      'Lettera apostolica in forma di Motu Proprio con la quale si affida alla Congregazione',
      'Lettera Apostolica per la costituzione della Nunziatura Apostolica nella Repubblica',
    ]) {
      expect(incipitOf(h), h).toBeNull();
    }
  });

  it('returns null for a bare genre word and for an empty heading', () => {
    expect(incipitOf('Lettera Apostolica')).toBeNull();
    expect(incipitOf('Bolla')).toBeNull();
    expect(incipitOf('   ')).toBeNull();
  });

  it('returns null for a long uncut heading, which is a gloss the rules did not recognise', () => {
    expect(incipitOf('Sancti Vladimiri Magni in urbe Parisiensi pro Ucrainis ritus Byzantini'))
      .toBeNull();
  });

  it('does not apply the word ceiling to a heading the rules did cut', () => {
    // The ceiling exists to catch un-cut glosses. A cut result is trusted at any length.
    expect(incipitOf('Sancti Vladimiri Magni in urbe Parisiensi pro Ucrainis ritus Byzantini: eretta'))
      .toBe('Sancti Vladimiri Magni in urbe Parisiensi pro Ucrainis ritus Byzantini');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tools/test/incipit.test.ts`
Expected: FAIL — cannot resolve `../src/harvest/incipit.js`.

- [ ] **Step 3: Write the rule table**

Create `tools/src/mappings/incipit-rules.ts`:

```ts
/**
 * Curated rules for recovering an incipit from a printed vatican.va heading (spec §4.2).
 *
 * Leo XIII and Pius X print bare incipits and none of these rules fire against them --
 * which is asserted by the 725 records harvested before this module existed remaining
 * byte-identical. From Pius XI onward a heading is genre phrase + incipit + descriptive
 * gloss, in varying order, and some carry no incipit at all.
 *
 * Every entry is evidenced by a real heading, cited in the comment beside it.
 */

/**
 * Leading genre phrases, matched case-insensitively and anchored at the start.
 * Sorted longest-first at module load so 'Lettera Apostolica in forma di «Motu Proprio»'
 * always beats the 'Lettera Apostolica' prefix of the same string.
 * The quote characters vary by page (« » " " ' '), so each shape is listed.
 */
export const GENRE_PREFIXES: readonly string[] = [
  'Lettera Apostolica in forma di «Motu Proprio»',   // Francis, apost_letters
  'Lettera Apostolica in forma di "Motu Proprio"',   // Leo XIV, apost_letters
  'Lettera Apostolica in forma di “Motu Proprio”',   // Leo XIV, motu_proprio
  "Lettera Apostolica in forma di 'Motu Proprio'",   // John XXIII, motu_proprio
  'Lettera Apostolica in forma di Motu Proprio',     // John Paul II, motu_proprio
  'Lettera Apostolica data Motu Proprio',            // Benedict XVI, motu_proprio
  'Lettera Apostolica (breve)',                      // Pius XII, apost_letters
  'Esortazione Apostolica Postsinodale',             // Benedict XVI, apost_exhortations
  'Costituzione Apostolica',
  'Esortazione Apostolica',                          // Leo XIV, apost_exhortations
  'Lettera Apostolica',
  'Lettera Enciclica',                               // Leo XIV, encyclicals
  'Breve Apostolico',                                // Pius XII, briefs
  'Bolla di indizione',
  'Motu proprio',                                    // Pius XI, motu_proprio
  'Chirografo',                                      // Pius XI, letters
  'Epistola',
  'Bolla',
  'Lettera',
];

/**
 * Markers that a descriptive gloss has begun. The incipit is what precedes the earliest
 * one found. Longer, more specific forms are listed but order does not matter: the
 * implementation takes the minimum index across all of them.
 */
export const GLOSS_CONNECTORS: readonly string[] = [
  ', con il quale', ', con la quale', ', col quale', ', colla quale', ', con cui',
  ' con il quale', ' con la quale', ' col quale', ' con cui',                  // Pius XI
  ', che ', ', il quale', ', nel ', ', per ', ', in occasione',
  ", sull'", ', sulla ', ', sui ', ', sugli ', ', sopra ',                     // Leo XIV
  '. Il Santo Padre', '. Il Sommo Pontefice',                                  // Francis
  ' del Santo Padre', ' del Sommo Pontefice', ' di Papa ',                     // Leo XIV
  ": ", ' - ', ' – ', ' — ',                                                   // Pius XII, B XVI
  " sull'", ' sulla ', ' sui ', ' sugli ', ' sopra ',                          // John XXIII
  ' ai ', ' agli ', ' alle ', ' alla ', " all'",                               // Benedict XV
  ' che ',
];

/**
 * A residue that slugifies to one of these is a genre word standing alone, not an incipit.
 */
export const BARE_GENRE_SLUGS: ReadonlySet<string> = new Set([
  'lettera', 'lettera-apostolica', 'lettera-enciclica', 'bolla', 'breve',
  'breve-apostolico', 'decreto', 'epistola', 'discorso', 'allocuzione',
  'chirografo', 'messaggio', 'omelia', 'costituzione', 'costituzione-apostolica',
  'esortazione', 'esortazione-apostolica', 'motu-proprio',
]);

/**
 * A heading that survived prefix-stripping and connector-cutting unchanged, and still runs
 * longer than this many words, is a gloss the rules above did not recognise -- so no incipit
 * is claimed for it and the document gets a provisional id.
 *
 * A heuristic, deliberately sited here rather than in the parser so it can be tuned against
 * evidence as the corpus grows. Eight words admits every bare incipit observed to date; the
 * longest is Leo XIII's 'Dall'alto dell'Apostolico Seggio' at four and Paul VI's
 * 'Vicariae potestatis in urbe' at four. It rejects
 * 'Sancti Vladimiri Magni in urbe Parisiensi pro Ucrainis ritus Byzantini' (ten), which is a
 * genuine title -- an accepted false negative: a provisional id is recoverable by hand, a
 * wrong minted id is permanent.
 */
export const MAX_INCIPIT_WORDS = 8;
```

- [ ] **Step 4: Write the extractor**

Create `tools/src/harvest/incipit.ts`:

```ts
import { slugify } from '../slug.js';
import {
  GENRE_PREFIXES, GLOSS_CONNECTORS, BARE_GENRE_SLUGS, MAX_INCIPIT_WORDS,
} from '../mappings/incipit-rules.js';

export interface HeadingParts {
  /** The full printed heading, minus its trailing (date). Never empty for a real item. */
  title: string;
  /** The opening words of the document proper, when the heading contains them. */
  incipit: string | null;
}

const BY_LENGTH = [...GENRE_PREFIXES].sort((a, b) => b.length - a.length);

/** Opening/closing quote pairs seen on vatican.va headings. */
const QUOTES: ReadonlyArray<[string, string]> = [
  ['«', '»'], ['“', '”'], ['‘', '’'], ['"', '"'], ["'", "'"],
];

/**
 * Strip a leading genre phrase, longest first. The phrase must be followed by end-of-string
 * or a non-letter, so 'Lettera' cannot eat the start of a word that merely begins with it.
 */
function stripGenrePrefix(s: string): { rest: string; stripped: boolean } {
  const lower = s.toLowerCase();
  for (const p of BY_LENGTH) {
    if (!lower.startsWith(p.toLowerCase())) continue;
    const after = s[p.length];
    if (after !== undefined && /\p{L}/u.test(after)) continue;
    return { rest: s.slice(p.length).replace(/^[\s.,:;-]+/, ''), stripped: true };
  }
  return { rest: s, stripped: false };
}

/** The content of a quoted span opening the string, or null. */
function quotedOpening(s: string): string | null {
  for (const [open, close] of QUOTES) {
    if (!s.startsWith(open)) continue;
    const end = s.indexOf(close, open.length);
    if (end > open.length) return s.slice(open.length, end).trim();
  }
  return null;
}

/** The earliest gloss-connector index in the string, or -1. */
function glossCut(s: string): number {
  let best = -1;
  for (const c of GLOSS_CONNECTORS) {
    const i = s.indexOf(c);
    if (i > 0 && (best === -1 || i < best)) best = i;
  }
  return best;
}

/**
 * Split a printed heading into its title and, where the heading contains one, its incipit.
 * The heading must already have had its trailing (date) removed. See spec §4.2.
 */
export function extractIncipit(heading: string): HeadingParts {
  const title = heading.trim();
  if (title === '') return { title, incipit: null };

  const { rest, stripped } = stripGenrePrefix(title);
  if (rest === '') return { title, incipit: null };

  const quoted = quotedOpening(rest);
  if (quoted !== null) {
    return { title, incipit: BARE_GENRE_SLUGS.has(slugify(quoted)) ? null : quoted };
  }

  // An incipit is capitalised; a lower-case residue continues the genre phrase as gloss
  // ('Lettera Apostolica (breve) che proclama...', 'Chirografo al Cardinale...').
  const first = rest[0]!;
  if (first === first.toLowerCase() && first !== first.toUpperCase()) {
    return { title, incipit: null };
  }

  const cut = glossCut(rest);
  const candidate = (cut === -1 ? rest : rest.slice(0, cut)).replace(/[\s.,:;-]+$/, '').trim();
  if (candidate === '' || BARE_GENRE_SLUGS.has(slugify(candidate))) {
    return { title, incipit: null };
  }

  // The word ceiling catches a gloss the rules did not recognise. It applies only when
  // nothing was stripped and nothing was cut -- a result the rules did act on is trusted.
  const untouched = !stripped && cut === -1;
  if (untouched && candidate.split(/\s+/).length > MAX_INCIPIT_WORDS) {
    return { title, incipit: null };
  }

  return { title, incipit: candidate };
}
```

- [ ] **Step 5: Export the rules from the mappings barrel**

Add to `tools/src/mappings/index.ts`:

```ts
export * from './incipit-rules.js';
```

- [ ] **Step 6: Run test to verify it passes**

Run: `npx vitest run tools/test/incipit.test.ts`
Expected: PASS, 10 tests.

- [ ] **Step 7: Commit**

```bash
git add tools/src/harvest/incipit.ts tools/src/mappings/incipit-rules.ts \
        tools/src/mappings/index.ts tools/test/incipit.test.ts
git commit -m "feat: recover an incipit from a glossed vatican.va heading

From Pius XI onward a heading is genre phrase + incipit + descriptive
gloss, and some carry no incipit at all. Strips a leading genre phrase,
takes a quoted opening, else cuts at the earliest gloss connector; a
lower-case residue is gloss and yields no incipit.

Pure and no-op against the flat and Leo XIII eras, which print bare
incipits. Not yet wired into the harvest."
```

---

## Task 6: Wire `title`/`incipit` through the pipeline and mint provisional ids

The 725 records harvested so far (383 pilot + Pius X) must come out byte-identical except for the new `title` field, which for them equals the incipit.

**Files:**
- Modify: `tools/src/types.ts`, `tools/src/harvest/flat.ts`, `tools/src/harvest/shelf.ts`, `tools/src/harvest/toDocument.ts`, `tools/src/harvest/run.ts`
- Test: `tools/test/toDocument.test.ts`, `tools/test/flat.test.ts`, `tools/test/shelf.test.ts`

**Interfaces:**
- Consumes: `extractIncipit` (Task 5); `mintProvisionalId` from `../ids.js` (already present, never yet exercised).
- Produces: `HarvestItem.title: string` (required); `HarvestItem.incipit: string | null`; `DocumentRecord.incipit?: string`; `toDocument` mints provisional ids.

- [ ] **Step 1: Write the failing test**

Add to `tools/test/toDocument.test.ts`:

```ts
describe('toDocument on a heading with no recoverable incipit', () => {
  const item = {
    title: 'Lettera Apostolica (breve) che proclama Santa Chiara Patrona Celeste della Televisione',
    incipit: null,
    date: '1958-02-14', sourceGenreLabel: 'apost_letters', url: null,
    languages: ['IT'], shelf: 'apost_letters', pageSlug: 'pius-xii',
  } as const;

  it('mints a provisional id from the genre and the full date', () => {
    const d = toDocument(item, '2026-09-07');
    expect(d.idStatus).toBe('provisional');
    expect(d.id).toBe('mag:pius-xii/apostolic-letter-1958-02-14');
  });

  it('keeps the full heading as the title and omits the incipit entirely', () => {
    const d = toDocument(item, '2026-09-07');
    expect(d.title).toBe(item.title);
    expect('incipit' in d).toBe(false);
  });

  it('falls back to the source label when the genre is unmapped', () => {
    const d = toDocument({ ...item, sourceGenreLabel: 'Proclama' }, '2026-09-07');
    expect(d.id).toBe('mag:pius-xii/proclama-1958-02-14');
  });
});

describe('toDocument on a heading with an incipit', () => {
  it('still mints from the incipit and records the title separately', () => {
    const d = toDocument({
      title: 'Mirabilis Deus, col quale il Pontefice attribuisce a Don Giovanni Bosco',
      incipit: 'Mirabilis Deus',
      date: '1934-04-01', sourceGenreLabel: 'briefs', url: null,
      languages: ['IT'], shelf: 'briefs', pageSlug: 'pius-xi',
    }, '2026-09-07');
    expect(d.idStatus).toBe('minted');
    expect(d.id).toBe('mag:pius-xi/mirabilis-deus-1934');
    expect(d.incipit).toBe('Mirabilis Deus');
    expect(d.title).toBe('Mirabilis Deus, col quale il Pontefice attribuisce a Don Giovanni Bosco');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tools/test/toDocument.test.ts`
Expected: FAIL — `toDocument` sets `idStatus: 'minted'` unconditionally and calls `mintId` with a null incipit.

- [ ] **Step 3: Update the types**

In `tools/src/types.ts`:

```ts
export interface HarvestItem {
  /** The full printed heading, minus its trailing (date). Always present. */
  title: string;
  /** The document's opening words, when the heading contains them (see extractIncipit). */
  incipit: string | null;
  date: string;                 // ISO YYYY-MM-DD
  sourceGenreLabel: string;
  url: string | null;
  languages: string[];
  shelf: string | null;
  alsoShelvedAs?: string[];     // other shelves the same document is filed under
  aliases?: string[];           // incipits of merged-away duplicate records
  pageSlug: string;             // the vatican.va pope slug the page belonged to
}
```

and change `DocumentRecord.incipit` from `incipit: string;` to `incipit?: string;`, keeping its position in the interface.

- [ ] **Step 4: Emit `title` from both adapters**

In `tools/src/harvest/flat.ts`, the flat era prints bare incipits in an `<i>` tag, so title and incipit are the same string. Add `title: incipit,` to the pushed object, immediately before `incipit,`.

In `tools/src/harvest/shelf.ts`, add the import `import { extractIncipit } from './incipit.js';` and replace

```ts
    const incipit = full.slice(0, open).trim();
    const date = parseSourceDate(full.slice(open));
    if (!incipit || !date) return;
```

with

```ts
    const { title, incipit } = extractIncipit(full.slice(0, open));
    const date = parseSourceDate(full.slice(open));
    if (!title || !date) return;
```

then use `title` in place of `incipit` in the date-mismatch warning's correction key and message (`slugify(incipit)` → `slugify(incipit ?? title)`, `'${incipit}'` → `'${title}'`), and add `title,` to the pushed object.

- [ ] **Step 5: Branch `toDocument`**

In `tools/src/harvest/toDocument.ts`, add `mintProvisionalId` to the `../ids.js` import and `slugify` is already imported. Replace the `key` line and the `record` construction:

```ts
  const key = `${item.pageSlug}|${slugify(item.incipit ?? item.title)}|${item.date}`;
  const reassigned = CONCILIAR_REASSIGNMENTS[key];
```

```ts
  const record: DocumentRecord = {
    id: item.incipit !== null
      ? mintId(issuerId, item.incipit, item.date)
      // No incipit is printed, so the id cannot be name-based. The genre slug plus the
      // full date is the provisional form (spec §3.5); the ordinal, where two share a
      // date, is assigned by the orchestrator, which alone can see the whole group.
      : mintProvisionalId(issuerId, mapping.genre ?? slugify(item.sourceGenreLabel), item.date),
    title: item.title,
    idStatus: item.incipit !== null ? 'minted' : 'provisional',
    genre: mapping.genre,
    issuerId,
    issuerType,
    date: item.date,
    source: {
      url: item.url, shelf: item.shelf, languages: item.languages, retrieved,
      ...(item.alsoShelvedAs?.length ? { alsoShelvedAs: item.alsoShelvedAs } : {}),
    },
  };

  if (item.incipit !== null) record.incipit = item.incipit;
```

Note that `incipit` is now assigned after the literal so it is omitted rather than set to `undefined`, which `JSON.stringify` would drop but `'incipit' in d` would still see.

- [ ] **Step 6: Key the dedupe passes on `incipit ?? title` and assign ordinals**

In `tools/src/harvest/run.ts`, replace every `slugify(item.incipit)` with `slugify(item.incipit ?? item.title)`, and in `keepMoreSpecific` replace `slugify(drop.incipit) !== slugify(keep.incipit)` with `slugify(drop.incipit ?? drop.title) !== slugify(keep.incipit ?? keep.title)` and `aliases.add(drop.incipit)` with `aliases.add(drop.incipit ?? drop.title)`.

Then, after the `byIssuer` map is built and before the files are written, add the ordinal pass:

```ts
// A provisional id carries an ordinal only when more than one document of that genre
// shares a date. Assigned here rather than in toDocument because only the orchestrator
// can see the whole group. Sorted by title so the numbering is reproducible: without
// that, every harvest would produce a different diff and the CI drift check would be
// meaningless.
for (const docs of byIssuer.values()) {
  const groups = new Map<string, DocumentRecord[]>();
  for (const d of docs.filter((d) => d.idStatus === 'provisional')) {
    groups.set(d.id, [...(groups.get(d.id) ?? []), d]);
  }
  for (const [baseId, group] of groups) {
    if (group.length < 2) continue;
    group.sort((a, b) => a.title.localeCompare(b.title));
    group.forEach((d, i) => { d.id = `${baseId}-${i + 1}`; });
  }
}
```

Finally add a warning for every provisional record, after the same-date pair warnings:

```ts
for (const [issuer, docs] of byIssuer) {
  for (const d of docs.filter((d) => d.idStatus === 'provisional')) {
    console.warn(
      `Provisional id (no incipit recoverable) ${d.issuerId} `
      + `${d.source?.shelf ?? 'flat'} ${d.date}: '${d.title}'`,
    );
  }
  const n = docs.filter((d) => d.idStatus === 'provisional').length;
  if (n > 0) console.warn(`  ${issuer}: ${n} of ${docs.length} provisional`);
}
```

- [ ] **Step 7: Run the tests and fix the fallout**

Run: `npm run check`

Two existing tests will fail and both need updating, not weakening:

- `tools/test/flat.test.ts` and `tools/test/shelf.test.ts` construct or assert on `HarvestItem` shapes. Add `title` wherever an item literal is built.
- `tools/test/harvest-data.test.ts`'s `leaves the TBD shelf empty` assertion still holds — no pope harvested so far produces a provisional record. **If it now fails, `extractIncipit` is rejecting a bare incipit it should accept: fix the rule table, do not relax the test.**

- [ ] **Step 8: Verify no minted id changed**

```bash
npm run harvest && npm run render
git diff --stat data/
git diff data/ | grep '^[-+].*"id"' | sort | uniq -c | head
```

Expected: the only `data/` changes are added `"title"` lines. **No `"id"` line may appear in the diff.** If one does, stop: an existing identifier has moved, which the Global Constraints forbid.

- [ ] **Step 9: Add the title assertion and commit**

Add to `tools/test/harvest-data.test.ts`:

```ts
  it('gives every document a title, equal to the incipit wherever one is printed', () => {
    expect(all.every((d) => typeof d.title === 'string' && d.title.length > 0)).toBe(true);
    expect(all.every((d) => d.title === d.incipit)).toBe(true);
  });
```

```bash
npm run check
git add tools/src/ tools/test/ data/ registry/
git commit -m "feat: split title from incipit and mint provisional ids

title is the full printed heading and is always present; incipit is the
document's opening words and is omitted when the heading has none, in
which case the id is genre-and-date based with idStatus: provisional.
Every provisional record prints a harvest warning: that is the curation
queue.

Ordinals are assigned by the orchestrator, sorted by title, so a harvest
stays reproducible and the CI drift check stays meaningful. No existing
identifier changes."
```

---

## Task 7: Invariants 18, 19 and 20

**Files:**
- Modify: `tools/src/validate/invariants.ts`
- Test: `tools/test/invariants.test.ts`

**Interfaces:**
- Consumes: `DocumentRecord`, `slugify`, `issuerLocalPart`.
- Produces: three new `Violation.rule` values on the existing `checkDocuments` return.

- [ ] **Step 1: Write the failing test**

Add to `tools/test/invariants.test.ts`. The fixture is named `expansionBase` rather than `base` so it cannot collide with a binding the file already has; check for a `genres` binding too and reuse the file's existing one if there is one.

```ts
const expansionBase = {
  title: 'Rerum Novarum', incipit: 'Rerum Novarum', idStatus: 'minted' as const,
  genre: 'encyclical', issuerId: 'rp:leo-xiii', issuerType: 'pope' as const,
  date: '1891-05-15',
};

describe('invariant 18: every document has a title', () => {
  it('rejects an empty title', () => {
    const v = checkDocuments([{ ...expansionBase, id: 'mag:leo-xiii/rerum-novarum-1891', title: '' }], genres);
    expect(v.map((x) => x.rule)).toContain(18);
  });
});

describe('invariant 19: a provisional id is derivable from its record', () => {
  const prov = {
    ...expansionBase, incipit: undefined, idStatus: 'provisional' as const,
    genre: 'apostolic-letter', issuerId: 'rp:pius-xii', date: '1958-02-14',
    title: 'Lettera Apostolica che proclama…',
  };

  it('accepts an id whose genre segment is the genre id', () => {
    const v = checkDocuments([{ ...prov, id: 'mag:pius-xii/apostolic-letter-1958-02-14' }], genres);
    expect(v.map((x) => x.rule)).not.toContain(19);
  });

  it('rejects an id whose genre segment is something else', () => {
    const v = checkDocuments([{ ...prov, id: 'mag:pius-xii/letter-1958-02-14' }], genres);
    expect(v.map((x) => x.rule)).toContain(19);
  });

  it('uses the source label when the genre is null', () => {
    const v = checkDocuments([{
      ...prov, genre: null, sourceGenreLabel: 'Proclama',
      id: 'mag:pius-xii/proclama-1958-02-14',
    }], genres);
    expect(v.map((x) => x.rule)).not.toContain(19);
  });
});

describe('invariant 20: provisional ordinals are dense and 1-based', () => {
  const mk = (id: string, title: string) => ({
    ...expansionBase, id, title, incipit: undefined, idStatus: 'provisional' as const,
    genre: 'apostolic-letter', issuerId: 'rp:pius-xii', date: '1958-02-14',
  });

  it('accepts a lone record with no ordinal', () => {
    const v = checkDocuments([mk('mag:pius-xii/apostolic-letter-1958-02-14', 'A')], genres);
    expect(v.map((x) => x.rule)).not.toContain(20);
  });

  it('accepts a pair numbered 1 and 2', () => {
    const v = checkDocuments([
      mk('mag:pius-xii/apostolic-letter-1958-02-14-1', 'A'),
      mk('mag:pius-xii/apostolic-letter-1958-02-14-2', 'B'),
    ], genres);
    expect(v.map((x) => x.rule)).not.toContain(20);
  });

  it('rejects a gap in the numbering', () => {
    const v = checkDocuments([
      mk('mag:pius-xii/apostolic-letter-1958-02-14-1', 'A'),
      mk('mag:pius-xii/apostolic-letter-1958-02-14-3', 'B'),
    ], genres);
    expect(v.map((x) => x.rule)).toContain(20);
  });

  it('rejects an unordinalled record sharing a group with an ordinalled one', () => {
    const v = checkDocuments([
      mk('mag:pius-xii/apostolic-letter-1958-02-14', 'A'),
      mk('mag:pius-xii/apostolic-letter-1958-02-14-2', 'B'),
    ], genres);
    expect(v.map((x) => x.rule)).toContain(20);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tools/test/invariants.test.ts`
Expected: FAIL — no violation carries rule 18, 19 or 20.

- [ ] **Step 3: Implement invariants 18 and 19**

In `tools/src/validate/invariants.ts`, inside the `for (const d of docs)` loop, after the rule 12 check:

```ts
    if (typeof d.title !== 'string' || d.title.trim() === '') {
      out.push({ rule: 18, id: d.id, message: 'title is missing or empty' });
    }

    if (d.idStatus === 'provisional') {
      // The parallel of rule 12 for a provisional id: its genre segment must be derivable
      // from the record, so the id can be recomputed rather than trusted.
      const expected = slugify(d.genre ?? d.sourceGenreLabel ?? '');
      if (expected === '' || parts.slug !== expected) {
        out.push({
          rule: 19, id: d.id,
          message: `provisional genre segment '${parts.slug}' != '${expected}'`,
        });
      }
    }
```

- [ ] **Step 4: Implement invariant 20**

Add a second collision-style accumulator beside `byCollision`:

```ts
  const byProvisionalGroup = new Map<string, DocumentRecord[]>();
```

populate it inside the loop, after the rule 19 block:

```ts
    if (d.idStatus === 'provisional' && local !== null) {
      const k = `${local}|${slugify(d.genre ?? d.sourceGenreLabel ?? '')}|${d.date}`;
      byProvisionalGroup.set(k, [...(byProvisionalGroup.get(k) ?? []), d]);
    }
```

and check it after the `byCollision` loop:

```ts
  for (const [k, group] of byProvisionalGroup) {
    const ordinals = group.map((d) => {
      const m = d.id.match(/-(\d+)$/);
      return m ? Number(m[1]) : null;
    });
    if (group.length === 1) {
      if (ordinals[0] !== null) {
        out.push({
          rule: 20, id: group[0]!.id,
          message: `sole provisional document of ${k} must carry no ordinal`,
        });
      }
      continue;
    }
    const expected = group.map((_, i) => i + 1);
    const found = [...ordinals].sort((a, b) => (a ?? 0) - (b ?? 0));
    if (ordinals.includes(null) || found.join(',') !== expected.join(',')) {
      for (const d of group) {
        out.push({
          rule: 20, id: d.id,
          message: `provisional ordinals for ${k} must be exactly 1..${group.length}`,
        });
      }
    }
  }
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tools/test/invariants.test.ts`
Expected: PASS.

- [ ] **Step 6: Document the invariants and verify**

Add rows 18, 19 and 20 to the invariants table in `SCHEMA.md`, matching the wording of spec §7.

```bash
npm run check
```

Expected: passes; the 725 existing documents violate none of the new rules (none is provisional yet, and all have titles from Task 6).

- [ ] **Step 7: Commit**

```bash
git add tools/src/validate/invariants.ts tools/test/invariants.test.ts SCHEMA.md
git commit -m "feat: add invariants 18-20 for titles and provisional ids

18: every document has a non-empty title.
19: a provisional id's genre segment is derivable from the record, the
    parallel of invariant 12 for minted ids.
20: provisional ordinals within a group are dense and 1-based, which is
    what makes the orchestrator's deterministic assignment checkable."
```

---

## Task 8: Add Pius XI and Pius XII

The two pontificates where glossed headings first appear. This is the measurement task: it tells you whether the Task 5 rule table works.

**Files:**
- Modify: `tools/fetch-fixtures.sh`, `tools/src/mappings/pontiffs.ts`
- Create: `tools/fixtures/pius-xi-*.html` (8), `tools/fixtures/pius-xii-*.html` (8)
- Test: `tools/test/harvest-data.test.ts`

**Interfaces:**
- Consumes: everything from Tasks 1–7.
- Produces: `data/documents/pius-xi.json`, `data/documents/pius-xii.json`.

- [ ] **Step 1: Extend the fixture script**

Append to `tools/fetch-fixtures.sh`, before the final line:

```bash
if [ -z "$POPE" ] || [ "$POPE" = pius-xi ]; then
  for s in encyclicals bulls briefs apost_constitutions apost_letters motu_proprio letters; do
    shelf pius-xi "$s"
  done
fi

if [ -z "$POPE" ] || [ "$POPE" = pius-xii ]; then
  for s in encyclicals bulls briefs apost_constitutions apost_letters \
           apost_exhortations motu_proprio letters; do
    shelf pius-xii "$s"
  done
fi
```

- [ ] **Step 2: Fetch and sanity-check**

```bash
tools/fetch-fixtures.sh pius-xi
tools/fetch-fixtures.sh pius-xii
for f in tools/fixtures/pius-xi-*.html tools/fixtures/pius-xii-*.html; do
  echo "$f $(grep -o 'class="item"' "$f" | wc -l)"
done
```

Expected against spec §2.4 — Pius XI: encyclicals 30, bulls 2, briefs 1, apost_constitutions 11, apost_letters 70, motu_proprio 14, letters 33. Pius XII: encyclicals 41, bulls 1, briefs 2, apost_constitutions 49, apost_letters 47, apost_exhortations 8, motu_proprio 11, letters 95. **Any count of 0 means the shelf is year-partitioned: stop, and do Task 9 first.**

- [ ] **Step 3: Add the two rows**

In `tools/src/mappings/pontiffs.ts`, after `pius-x`:

```ts
  {
    pageSlug: 'pius-xi', issuerId: 'rp:pius-xi', era: 'shelf',
    shelves: [
      'apost_constitutions', 'apost_letters', 'briefs', 'bulls',
      'encyclicals', 'letters', 'motu_proprio',
    ],
  },
  {
    pageSlug: 'pius-xii', issuerId: 'rp:pius-xii', era: 'shelf',
    // `speeches` is year-partitioned here and is out of scope in any case (spec §2.7).
    shelves: [
      'apost_constitutions', 'apost_exhortations', 'apost_letters', 'briefs', 'bulls',
      'encyclicals', 'letters', 'motu_proprio',
    ],
  },
```

- [ ] **Step 4: Harvest and measure the provisional share**

```bash
npm run harvest 2>&1 | tee /tmp/pius-xi-xii.log
grep '^  pius-x' /tmp/pius-xi-xii.log
grep -c 'Provisional id' /tmp/pius-xi-xii.log
grep 'Provisional id' /tmp/pius-xi-xii.log | head -40
```

**This is the go/no-go measurement.** Read the first 40 provisional warnings and classify each:

- *Correct* — the heading genuinely prints no incipit (`Lettera a S. E. Monsignor…`). Nothing to do.
- *A missed rule* — the heading does print one, but a genre prefix or gloss connector is absent from `incipit-rules.ts`. Add it, with the heading quoted in the comment beside it, and re-run.

Iterate until the remaining provisionals are all of the first kind. **If the provisional share cannot be brought below roughly a quarter of these two pontificates, stop and report** — spec §8 makes this the point at which to revisit §4.2 rather than multiply the problem across eight more pontificates.

- [ ] **Step 5: Resolve the date and duplicate warnings**

Same procedure as Task 2 Step 7. Election dates for the pontificate-year cross-check: **Pius XI 6 February 1922**, **Pius XII 2 March 1939**.

- [ ] **Step 6: Write the corpus test**

Add to `tools/test/harvest-data.test.ts`, filling in the counts you measured:

```ts
describe('the Pius XI and Pius XII corpora', () => {
  const pxi = load('pius-xi');
  const pxii = load('pius-xii');

  it('holds every formal-shelf document', () => {
    // [raw item arithmetic per shelf, every merge explained] => M1 / M2.
    expect(pxi).toHaveLength(M1);
    expect(pxii).toHaveLength(M2);
  });

  it('recovers an incipit from a glossed heading', () => {
    const md = pxi.find((d) => d.incipit === 'Mirabilis Deus')!;
    expect(md.title).toMatch(/^Mirabilis Deus, col quale/);
    expect(md.idStatus).toBe('minted');
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

  it('keeps the provisional share within the phase-3 budget', () => {
    // The go/no-go measurement of spec §8. A rise here means extractIncipit has
    // regressed, not that the budget should be raised.
    const prov = [...pxi, ...pxii].filter((d) => d.idStatus === 'provisional').length;
    expect(prov / (pxi.length + pxii.length)).toBeLessThan(0.25);
  });

  it('satisfies every invariant', () => {
    expect(checkDocuments([...pxi, ...pxii], genres)).toEqual([]);
  });
});
```

- [ ] **Step 7: Verify and commit**

```bash
npm run check
npm run harvest && npm run render
git diff --exit-code data/ registry/
git add tools/fetch-fixtures.sh tools/fixtures/pius-xi-*.html tools/fixtures/pius-xii-*.html \
        tools/src/mappings/ data/ registry/ tools/test/
git commit -m "feat: harvest Pius XI and Pius XII

The two pontificates where glossed headings first appear, and the
measurement that validates the incipit rule table. Records the resulting
provisional share as a test budget so a later regression in
extractIncipit fails rather than silently shelving documents."
```

---

## Task 9: Traverse year-partitioned shelves

**Files:**
- Create: `tools/src/harvest/shelfPages.ts`
- Modify: `tools/src/harvest/run.ts`, `tools/fetch-fixtures.sh`
- Test: `tools/test/shelfPages.test.ts`

**Interfaces:**
- Consumes: nothing new.
- Produces: `type ShelfPages = { kind: 'aggregate' } | { kind: 'years'; years: string[] }`; `resolveShelfPages(html: string): ShelfPages`.

- [ ] **Step 1: Write the failing test**

Create `tools/test/shelfPages.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolveShelfPages } from '../src/harvest/shelfPages.js';

describe('resolveShelfPages', () => {
  it('reports an aggregate page that carries its own items', () => {
    const html = readFileSync('tools/fixtures/leo-xiii-encyclicals.html', 'utf8');
    expect(resolveShelfPages(html)).toEqual({ kind: 'aggregate' });
  });

  it('prefers the items even when year links are also present', () => {
    // Every shelf from Benedict XV on carries year links; where it also carries items,
    // those items are the whole shelf (spec §2.3) and the year links are navigation.
    const html = readFileSync('tools/fixtures/pius-xii-encyclicals.html', 'utf8');
    expect(resolveShelfPages(html)).toEqual({ kind: 'aggregate' });
  });

  it('reports the years of a page that carries only links', () => {
    const html = `<html><body>
      <a href="/content/x/it/apost_letters/1979.index.html">1979</a>
      <a href="/content/x/it/apost_letters/1981.index.html">1981</a>
      <a href="/content/x/it/apost_letters/1979.index.html">1979 again</a>
      <a href="/content/x/it/apost_letters.index.html">all</a>
    </body></html>`;
    expect(resolveShelfPages(html)).toEqual({ kind: 'years', years: ['1979', '1981'] });
  });

  it('throws on a page with neither items nor year links', () => {
    expect(() => resolveShelfPages('<html><body>gone</body></html>'))
      .toThrow(/neither items nor year links/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tools/test/shelfPages.test.ts`
Expected: FAIL — cannot resolve `../src/harvest/shelfPages.js`.

- [ ] **Step 3: Write the resolver**

Create `tools/src/harvest/shelfPages.ts`:

```ts
import * as cheerio from 'cheerio';

export type ShelfPages =
  | { kind: 'aggregate' }
  | { kind: 'years'; years: string[] };

/**
 * Decide how a shelf index page holds its contents (spec §2.2, §2.3).
 *
 * A page carrying `div.item` carries the shelf's *whole* contents -- the year links some
 * such pages also show are navigation, not paging -- so its items are read directly.
 * A page carrying only year links must have each year page fetched and parsed instead.
 *
 * A page with neither is not an empty shelf; it means vatican.va has changed shape, and
 * CI should say so rather than silently harvesting nothing.
 */
export function resolveShelfPages(html: string): ShelfPages {
  const $ = cheerio.load(html);
  if ($('div.item').length > 0) return { kind: 'aggregate' };

  const years = new Set<string>();
  $('a[href]').each((_i, a) => {
    const m = $(a).attr('href')?.match(/\/((?:18|19|20)\d{2})\.index\.html$/);
    if (m) years.add(m[1]!);
  });
  if (years.size === 0) {
    throw new Error('shelf index has neither items nor year links; vatican.va has changed shape');
  }
  return { kind: 'years', years: [...years].sort() };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tools/test/shelfPages.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Use it in the orchestrator**

In `tools/src/harvest/run.ts`, add `import { resolveShelfPages } from './shelfPages.js';` and replace the shelf branch of the collection loop:

```ts
    for (const shelf of pope.shelves) {
      const index = fixture(`${pope.pageSlug}-${shelf}`);
      const pages = resolveShelfPages(index);
      if (pages.kind === 'aggregate') {
        items.push(...parseShelfIndex(index, pope.pageSlug, shelf));
      } else {
        for (const year of pages.years) {
          items.push(...parseShelfIndex(
            fixture(`${pope.pageSlug}-${shelf}-${year}`), pope.pageSlug, shelf));
        }
      }
    }
```

- [ ] **Step 6: Verify nothing changed**

```bash
npm run check
npm run harvest && npm run render
git diff --exit-code data/ registry/
```

Expected: clean. Every shelf harvested so far is an aggregate page, so the new branch is not yet taken. It is exercised for the first time in Task 13 (John XXIII).

- [ ] **Step 7: Extend the fixture script for year pages**

Append to `tools/fetch-fixtures.sh` a helper the later pope blocks use, right after the `year()` definition already added in Task 2:

```bash
# years <pageSlug> <shelfName> <first> <last>  -- for a shelf whose aggregate index
# carries no items of its own (see resolveShelfPages).
years() {
  for y in $(seq "$3" "$4"); do year "$1" "$2" "$y"; done
}
```

- [ ] **Step 8: Commit**

```bash
git add tools/src/harvest/shelfPages.ts tools/src/harvest/run.ts \
        tools/fetch-fixtures.sh tools/test/shelfPages.test.ts
git commit -m "feat: traverse year-partitioned shelf indexes

A shelf index either carries its items or links year pages. Year pages
use the same div.item markup, so this is a page-resolution step in front
of the unchanged parseShelfIndex, not a new parser. A page with neither
throws rather than harvesting nothing silently."
```

---

## Task 10: The `keywords` mechanism

Ships the field, its vocabulary and its invariant with nothing yet tagged. Task 11 supplies the rules that populate it.

**Files:**
- Create: `data/keywords.json`, `tools/test/keywords-data.test.ts`
- Modify: `schema/document.schema.json`, `tools/src/types.ts`, `tools/src/validate/invariants.ts`, `tools/src/validate/run.ts`
- Test: `tools/test/invariants.test.ts`, `tools/test/schema.test.ts`

**Interfaces:**
- Consumes: `checkDocuments(docs, genres)`.
- Produces: `DocumentRecord.keywords?: string[]`; `checkDocuments(docs: DocumentRecord[], genres: GenreLike[], keywords?: KeywordLike[]): Violation[]` where `interface KeywordLike { id: string }`. The third parameter is optional and defaults to `[]`, so existing call sites keep compiling — but `validate/run.ts` and the data tests must pass it.

- [ ] **Step 1: Write the failing test**

Create `tools/test/keywords-data.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const keywords = JSON.parse(readFileSync('data/keywords.json', 'utf8')) as
  Array<{ id: string; gloss: string; note: string }>;

describe('data/keywords.json', () => {
  it('is a non-empty array of slug-shaped ids', () => {
    expect(Array.isArray(keywords)).toBe(true);
    expect(keywords.length).toBeGreaterThan(0);
    for (const k of keywords) expect(k.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it('gives every term a gloss and an evidence note', () => {
    for (const k of keywords) {
      expect(k.gloss, k.id).toBeTruthy();
      expect(k.note, k.id).toBeTruthy();
    }
  });

  it('defines circumscription-erection', () => {
    const ce = keywords.find((k) => k.id === 'circumscription-erection');
    expect(ce).toBeDefined();
    expect(ce!.gloss).toMatch(/diocese|circumscription/i);
  });

  it('has unique ids', () => {
    expect(new Set(keywords.map((k) => k.id)).size).toBe(keywords.length);
  });
});
```

Add to `tools/test/invariants.test.ts`:

```ts
const keywords = [{ id: 'circumscription-erection' }];

describe('invariant 21: keywords resolve against the vocabulary', () => {
  const d = { ...expansionBase, id: 'mag:leo-xiii/rerum-novarum-1891' };

  it('accepts a known keyword', () => {
    const v = checkDocuments([{ ...d, keywords: ['circumscription-erection'] }], genres, keywords);
    expect(v.map((x) => x.rule)).not.toContain(21);
  });

  it('rejects an unknown keyword', () => {
    const v = checkDocuments([{ ...d, keywords: ['diocese-erection'] }], genres, keywords);
    expect(v.map((x) => x.rule)).toContain(21);
  });

  it('accepts a document with no keywords at all', () => {
    expect(checkDocuments([d], genres, keywords).map((x) => x.rule)).not.toContain(21);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tools/test/keywords-data.test.ts tools/test/invariants.test.ts`
Expected: FAIL — `data/keywords.json` does not exist; `checkDocuments` takes two arguments.

- [ ] **Step 3: Write the vocabulary**

Create `data/keywords.json`:

```json
[
  {
    "id": "circumscription-erection",
    "gloss": "The act erects an ecclesiastical circumscription — a diocese, archdiocese, ecclesiastical province, eparchy, ordinariate or prelature.",
    "note": "Covers erection only. Elevations, mergers and boundary changes are deliberately not included and get their own terms when evidence for them appears. Populated from the heading text where vatican.va states the act (Francis, Leo XIV: 'Il Santo Padre ha eretto la Diocesi di …'), and from a hand-curated table for Paul VI, John Paul II and Benedict XVI, whose headings print a bare Latin toponym with no marker. See the design spec §4.5."
  }
]
```

- [ ] **Step 4: Add the schema property**

In `schema/document.schema.json`, add inside `properties`, after `characteristics`:

```json
    "keywords": {
      "type": "array",
      "uniqueItems": true,
      "items": { "type": "string", "pattern": "^[a-z0-9]+(-[a-z0-9]+)*$" },
      "description": "Descriptive subject tags -> keyword.id in data/keywords.json. Never authority-bearing: unlike characteristics, a keyword makes no claim about the document's register or definitiveness, and no invariant other than vocabulary membership reads it."
    },
```

- [ ] **Step 5: Add the type**

In `tools/src/types.ts`, add to `DocumentRecord`, after `characteristics`:

```ts
  keywords?: string[];
```

- [ ] **Step 6: Implement invariant 21**

In `tools/src/validate/invariants.ts`:

```ts
/** The keyword rows this module needs from `data/keywords.json`. */
export interface KeywordLike { id: string }
```

Change the signature to

```ts
export function checkDocuments(
  docs: DocumentRecord[], genres: GenreLike[], keywords: KeywordLike[] = [],
): Violation[] {
```

add `const keywordIds = new Set(keywords.map((k) => k.id));` beside `genreIds`, and inside the document loop, after the rule 19 block:

```ts
    for (const k of d.keywords ?? []) {
      if (!keywordIds.has(k)) {
        out.push({ rule: 21, id: d.id, message: `unknown keyword: ${k}` });
      }
    }
```

- [ ] **Step 7: Load the vocabulary in the validator**

In `tools/src/validate/run.ts`, beside the `genres` load:

```ts
const keywords = JSON.parse(readFileSync('data/keywords.json', 'utf8')) as Array<{ id: string }>;
```

and change the check call to `checkDocuments(docs, genres, keywords)`.

- [ ] **Step 8: Pass the vocabulary in the data tests**

In `tools/test/harvest-data.test.ts`, add the load beside `genres`

```ts
const keywords = JSON.parse(readFileSync('data/keywords.json', 'utf8')) as Array<{ id: string }>;
```

and pass it as the third argument to every `checkDocuments` call in that file.

- [ ] **Step 9: Run tests and verify**

```bash
npx vitest run tools/test/keywords-data.test.ts tools/test/invariants.test.ts
npm run check
```

Expected: PASS. `data/` is unchanged — no document carries a keyword yet.

- [ ] **Step 10: Document and commit**

Add row 21 to the invariants table in `SCHEMA.md`, and a `keywords` row to the document field table, with the sentence that it is never authority-bearing.

```bash
git add data/keywords.json schema/document.schema.json tools/src/ tools/test/ SCHEMA.md
git commit -m "feat: add a controlled keyword vocabulary

keywords is a descriptive subject tag, deliberately not a characteristic:
characteristics are authority-bearing (dogmatic-definition must be backed
by a Table 2 assessment) and a subject tag is not. Invariant 21 is the
only rule that reads keywords, parallel to invariant 15 for genre.

Mechanism only: no document carries a keyword yet."
```

---

## Task 11: Tag circumscription erections

**Files:**
- Create: `tools/src/mappings/keywords.ts`, `tools/test/keywords.test.ts`
- Modify: `tools/src/mappings/index.ts`, `tools/src/harvest/toDocument.ts`, `tools/src/harvest/run.ts`
- Test: `tools/test/keywords.test.ts`

**Interfaces:**
- Consumes: `HarvestItem` (Task 6); `slugify`.
- Produces: `keywordsFor(item: HarvestItem): string[]`; `isErectionCandidate(item: HarvestItem): boolean`; `CIRCUMSCRIPTION_ERECTIONS: Record<string, { note: string }>` keyed `${pageSlug}|${slugify(incipit ?? title)}|${date}`.

- [ ] **Step 1: Write the failing test**

Create `tools/test/keywords.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { keywordsFor, isErectionCandidate } from '../src/mappings/keywords.js';
import type { HarvestItem } from '../src/types.js';

const item = (over: Partial<HarvestItem>): HarvestItem => ({
  title: '', incipit: null, date: '2025-03-22', sourceGenreLabel: 'apost_constitutions',
  url: null, languages: ['IT'], shelf: 'apost_constitutions', pageSlug: 'francesco', ...over,
});

describe('keywordsFor', () => {
  it('tags an erection the heading states outright', () => {
    for (const title of [
      '"Spei accensa lucerna". Il Santo Padre ha eretto la nuova Diocesi di Caazapá (Paraguay)',
      '"Incomparabilis Magister". Il Santo Padre ha eretto la Provincia Ecclesiastica di Calicut',
      '"Quod Manifestatum". Il Santo Padre ha istituito in Cina la Diocesi di Lüliang',
      'Suavis Nutrix animarum: Il Santo Padre ha eretto la Diocesi di Bariadi',
    ]) {
      expect(keywordsFor(item({ title, incipit: 'X' })), title)
        .toEqual(['circumscription-erection']);
    }
  });

  it('tags nothing when the heading only names a document', () => {
    for (const title of ['Praedicate Evangelium', 'Avkaënsis', 'Ex Corde Ecclesiae',
                         'Vicariae potestatis in urbe']) {
      expect(keywordsFor(item({ title, incipit: title })), title).toEqual([]);
    }
  });

  it('tags a curated older erection from the table, not from its shape', () => {
    // Seeded by Task 20's curation pass; empty until then, so this asserts the mechanism
    // via a synthetic key rather than a real document.
    expect(keywordsFor(item({
      pageSlug: 'john-paul-ii', title: 'Usbekistaniae', incipit: 'Usbekistaniae',
      date: '2005-04-01',
    }))).toEqual([]);
  });
});

describe('isErectionCandidate', () => {
  it('flags a bare Latin toponym on the apostolic constitutions shelf', () => {
    for (const title of ['Avkaënsis', 'Boacensis', 'Usbekistaniae', 'Gambomensis',
                         'Katsinensis-Alensis']) {
      expect(isErectionCandidate(item({ pageSlug: 'john-paul-ii', title, incipit: title })), title)
        .toBe(true);
    }
  });

  it('does not flag a document with a real name', () => {
    for (const title of ['Sapientia Christiana', 'Ex Corde Ecclesiae', 'Constans nobis',
                         'Romano Pontifici Eligendo', 'Indulgentiarum Doctrina']) {
      expect(isErectionCandidate(item({ pageSlug: 'paul-vi', title, incipit: title })), title)
        .toBe(false);
    }
  });

  it('does not flag anything off the apostolic constitutions shelf', () => {
    expect(isErectionCandidate(item({ shelf: 'encyclicals', title: 'Avkaënsis' }))).toBe(false);
  });

  it('does not flag a pope whose headings state the act outright', () => {
    // Francis and Leo XIV are tagged textually; flagging them too would double-count.
    expect(isErectionCandidate(item({ pageSlug: 'francesco', title: 'Avkaënsis' }))).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tools/test/keywords.test.ts`
Expected: FAIL — cannot resolve `../src/mappings/keywords.js`.

- [ ] **Step 3: Write the keyword mappings**

Create `tools/src/mappings/keywords.ts`:

```ts
import { slugify } from '../slug.js';
import type { HarvestItem } from '../types.js';

/**
 * Circumscription erections whose heading does not say so, confirmed by hand (spec §4.5).
 *
 * Paul VI, John Paul II and Benedict XVI file these under a bare Latin toponym --
 * 'Avkaënsis', 'Usbekistaniae', 'Gambomensis' -- with no textual marker at all, and the
 * documents one would most want separated out ('Sapientia Christiana', 'Ex Corde
 * Ecclesiae', 'Constans nobis') sit unmarked on the same shelf. There is therefore no
 * rule that can decide this from the index page: `isErectionCandidate` below only
 * *flags* them, and a human confirms each into this table with its evidence.
 *
 * Key: `${pageSlug}|${slugify(incipit ?? title)}|${isoDate}`.
 */
export const CIRCUMSCRIPTION_ERECTIONS: Record<string, { note: string }> = {};

/**
 * Headings that state the act. Francis and Leo XIV print it in full -- 'Il Santo Padre ha
 * eretto la nuova Diocesi di Caazapá (Paraguay)' -- so the keyword is read from the text
 * rather than guessed. Matched case-insensitively against the whole title.
 */
const ERECTION_PHRASES: readonly RegExp[] = [
  /\bha eretto\b/i,
  /\bha istituito\b/i,
  /\bha elevato\b.{0,40}\b(diocesi|arcidiocesi|eparchia)\b/i,
];

/**
 * Latin toponymic morphology, used to *flag candidates only* (never to tag). Matches the
 * adjectival and genitive forms vatican.va uses for a see: 'Boacensis', 'Gambomensis',
 * 'Usbekistaniae', and hyphenated compounds such as 'Katsinensis-Alensis'.
 *
 * Tested against the diacritic-folded title, because 'Avkaënsis' ends in 'ënsis' and would
 * otherwise miss. Deliberately anchored to the first word, which means a multi-word see
 * name such as 'Sancti Vladimiri Magni in urbe Parisiensi pro Ucrainis ritus Byzantini' is
 * not flagged: an accepted false negative in a search aid, not in the data.
 */
const TOPONYM = /^\p{Lu}\p{L}*(?:ensis|iensis|aniae|ensia)(?:[- ]\p{L}+)*$/u;

const fold = (s: string): string => s.normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Popes whose headings state the act, so morphological flagging would double-count. */
const TEXTUALLY_TAGGED = new Set(['francesco', 'leo-xiv']);

/** The descriptive keywords this item earns from evidence. Never inferred from shape. */
export function keywordsFor(item: HarvestItem): string[] {
  const out: string[] = [];
  const curatedKey = `${item.pageSlug}|${slugify(item.incipit ?? item.title)}|${item.date}`;
  if (ERECTION_PHRASES.some((re) => re.test(item.title))
      || CIRCUMSCRIPTION_ERECTIONS[curatedKey]) {
    out.push('circumscription-erection');
  }
  return out;
}

/**
 * Whether this item looks like an unmarked circumscription erection and should be surfaced
 * for a human to confirm. A search aid, in the sense the design spec's conciliar
 * reassignment flagging is one: it warns, it never writes.
 */
export function isErectionCandidate(item: HarvestItem): boolean {
  if (item.shelf !== 'apost_constitutions' && item.shelf !== 'apost-constitutions') return false;
  if (TEXTUALLY_TAGGED.has(item.pageSlug)) return false;
  const curatedKey = `${item.pageSlug}|${slugify(item.incipit ?? item.title)}|${item.date}`;
  if (CIRCUMSCRIPTION_ERECTIONS[curatedKey]) return false;
  return TOPONYM.test(fold(item.title.trim()));
}
```

- [ ] **Step 4: Export from the barrel**

Add to `tools/src/mappings/index.ts`:

```ts
export * from './keywords.js';
```

- [ ] **Step 5: Apply keywords in `toDocument`**

In `tools/src/harvest/toDocument.ts`, add `keywordsFor` to the `../mappings/index.js` import and, beside the `characteristics` assignment:

```ts
  const keywords = keywordsFor(item);
  if (keywords.length) record.keywords = keywords;
```

- [ ] **Step 6: Warn on candidates in the orchestrator**

In `tools/src/harvest/run.ts`, add `isErectionCandidate` to the mappings import and, beside the provisional warnings:

```ts
const candidates = [...mergedByDuplicateTable.values()].filter(isErectionCandidate);
for (const c of candidates) {
  console.warn(
    `Circumscription-erection candidate ${c.pageSlug} ${c.shelf} ${c.date}: '${c.title}'`,
  );
}
if (candidates.length) {
  console.warn(`  ${candidates.length} candidates await confirmation into CIRCUMSCRIPTION_ERECTIONS`);
}
```

- [ ] **Step 7: Run tests and verify**

```bash
npx vitest run tools/test/keywords.test.ts
npm run check
npm run harvest && npm run render
git diff --exit-code data/ registry/
```

Expected: PASS and clean. No pope harvested so far has an `apost_constitutions` shelf full of toponyms, and none states an erection textually, so nothing is tagged or flagged yet.

- [ ] **Step 8: Commit**

```bash
git add tools/src/mappings/keywords.ts tools/src/mappings/index.ts \
        tools/src/harvest/ tools/test/keywords.test.ts
git commit -m "feat: tag circumscription erections from the heading, flag the rest

Francis and Leo XIV state the act ('ha eretto la Diocesi di ...'), so the
keyword is read from the text. Paul VI, John Paul II and Benedict XVI
print a bare Latin toponym with no marker, so the harvest tags nothing and
instead flags candidates by toponymic morphology for a human to confirm
into CIRCUMSCRIPTION_ERECTIONS. The morphological rule never writes."
```

---

## Tasks 12–19: The remaining eight pontificates

Each of these tasks is the same shape and each ends with a green `npm run check` and a clean drift diff. They are separated because each has its own warning queue, and a reviewer should be able to reject one pope's adjudications while accepting another's.

**The shared procedure for each task below:**

1. Append the pope's block to `tools/fetch-fixtures.sh` and run `tools/fetch-fixtures.sh <pageSlug>`.
2. Verify each fixture's `div.item` count against the counts given in the task. A **0** means that shelf is year-partitioned: fetch its year pages with `years <pageSlug> <shelf> <first> <last>` and verify each year page instead.
3. Add the `POPES` row exactly as given in the task.
4. `npm run harvest 2>&1 | tee /tmp/<pageSlug>.log` and work the warning queue to empty:
   - *printed/slug date mismatch* → read the document's own dating formula on vatican.va, cross-check against the pontificate year using the election date given in the task, record in `DATE_CORRECTIONS` with the formula quoted;
   - *unmerged same-date cross-shelf pair* → compare full texts; record in `DUPLICATE_MERGES` or `ADJUDICATED_DISTINCT` with the evidence;
   - *provisional id* → check whether the heading really prints no incipit. If it does, the rule table missed it: add the prefix or connector to `incipit-rules.ts` with the heading quoted, and re-run. If it does not, the provisional id is correct;
   - *circumscription-erection candidate* → leave for Task 20. These are expected in bulk and are not a blocker.
5. Add the pope's `describe` block to `tools/test/harvest-data.test.ts` following the template below, with counts filled in and the arithmetic explained.
6. `npm run check && npm run harvest && npm run render && git diff --exit-code data/ registry/`.
7. Commit.

**The test template each task fills in** (substitute the pope's file name, and replace `M` and the bracketed comment with your measured arithmetic):

```ts
describe('the <Pope> corpus', () => {
  const docs = load('<file>');

  it('holds every formal-shelf document', () => {
    // [raw items per shelf; every merge explained] => M.
    expect(docs).toHaveLength(M);
  });

  it('files them all under the right issuer', () => {
    expect(docs.every((d) => d.issuerId === '<issuerId>')).toBe(true);
  });

  it('gives every document a title', () => {
    expect(docs.every((d) => typeof d.title === 'string' && d.title.length > 0)).toBe(true);
  });

  it('omits the incipit exactly when the id is provisional', () => {
    for (const d of docs) {
      expect('incipit' in d, d.id).toBe(d.idStatus === 'minted');
    }
  });

  it('satisfies every invariant', () => {
    expect(checkDocuments(docs, genres, keywords)).toEqual([]);
  });
});
```

---

### Task 12: Benedict XV

**Files:** `tools/fetch-fixtures.sh`, `tools/fixtures/benedict-xv-*.html`, `tools/src/mappings/pontiffs.ts`, `tools/src/mappings/genres.ts`, `tools/test/harvest-data.test.ts`

**Election date for the pontificate-year cross-check:** 3 September 1914.

**Expected aggregate item counts:** encyclicals 12, bulls 4, briefs 9, `apost-constitutions` 5, apost_letters 24, apost_exhortations 3, motu_proprio 11. The `letters` shelf is year-partitioned and is therefore **excluded** (spec §2.7).

- [ ] **Step 1: Fixture block**

```bash
if [ -z "$POPE" ] || [ "$POPE" = benedict-xv ]; then
  for s in encyclicals bulls briefs apost-constitutions apost_letters \
           apost_exhortations motu_proprio; do
    shelf benedict-xv "$s"
  done
fi
```

- [ ] **Step 2: `POPES` row**

```ts
  {
    pageSlug: 'benedict-xv', issuerId: 'rp:benedict-xv', era: 'shelf',
    // Note the hyphen: Benedict XV is the only pope who spells this shelf
    // 'apost-constitutions' rather than 'apost_constitutions' (spec §2.5).
    // `letters` is year-partitioned here and so is out of scope (spec §2.7).
    shelves: [
      'apost-constitutions', 'apost_exhortations', 'apost_letters', 'briefs',
      'bulls', 'encyclicals', 'motu_proprio',
    ],
  },
```

- [ ] **Step 3: Genre mapping for the hyphenated shelf**

In `tools/src/mappings/genres.ts`, beside the existing `apost_constitutions` row:

```ts
  // Benedict XV's page spells this shelf with a hyphen; same genre either way.
  'apost-constitutions': { genre: 'papal-bull', characteristics: ['apostolic-constitution'] },
```

- [ ] **Step 4: Run the shared procedure** (steps 1–7 above), then commit:

```bash
git add tools/fetch-fixtures.sh tools/fixtures/benedict-xv-*.html \
        tools/src/mappings/ data/ registry/ tools/test/
git commit -m "feat: harvest Benedict XV's formal shelves

Excludes the year-partitioned letters shelf per spec 2.7, and maps the
hyphenated apost-constitutions shelf name unique to this pope."
```

---

### Task 13: John XXIII

The first pope to exercise the year traversal of Task 9.

**Files:** `tools/fetch-fixtures.sh`, `tools/fixtures/john-xxiii-*.html`, `tools/src/mappings/pontiffs.ts`, `tools/test/harvest-data.test.ts`

**Election date:** 28 October 1958.

**Expected counts:** encyclicals 8, apost_exhortations 3, motu_proprio 14. `apost_constitutions` and `apost_letters` are **year-partitioned** (1958–1963) and must be traversed; `letters` and `speeches` are out of scope.

- [ ] **Step 1: Fixture block**

```bash
if [ -z "$POPE" ] || [ "$POPE" = john-xxiii ]; then
  for s in encyclicals apost_exhortations motu_proprio; do shelf john-xxiii "$s"; done
  # These two carry no items of their own; the aggregate page is still fetched so
  # resolveShelfPages can read its year links.
  for s in apost_constitutions apost_letters; do
    shelf john-xxiii "$s"
    years john-xxiii "$s" 1958 1963
  done
fi
```

- [ ] **Step 2: `POPES` row**

```ts
  {
    pageSlug: 'john-xxiii', issuerId: 'rp:john-xxiii', era: 'shelf',
    // apost_constitutions and apost_letters are year-partitioned (1958-1963) and are
    // read through resolveShelfPages; the shelf list does not distinguish them.
    shelves: [
      'apost_constitutions', 'apost_exhortations', 'apost_letters',
      'encyclicals', 'motu_proprio',
    ],
  },
```

- [ ] **Step 3: Verify the year traversal actually fired**

```bash
npm run harvest 2>&1 | head -3
```

The item count must exceed the aggregate-only total of 25. If it does not, `resolveShelfPages` returned `aggregate` for a page it should not have — check that the fetched aggregate fixture really contains no `div.item`.

- [ ] **Step 4: Add a traversal-specific test**

Beyond the template, add:

```ts
  it('reads the year-partitioned shelves, whose aggregate index carries no items', () => {
    const apc = docs.filter((d) => d.source?.shelf === 'apost_constitutions');
    expect(apc.length).toBeGreaterThan(0);
    expect(docs.some((d) => d.incipit === 'Veterum Sapientia')).toBe(true);
  });
```

- [ ] **Step 5: Run the shared procedure**, then commit:

```bash
git add tools/fetch-fixtures.sh tools/fixtures/john-xxiii-*.html \
        tools/src/mappings/ data/ registry/ tools/test/
git commit -m "feat: harvest John XXIII, exercising the year-page traversal

The first pope whose apost_constitutions and apost_letters aggregate
indexes carry no items of their own, so resolveShelfPages falls through
to the 1958-1963 year pages."
```

---

### Task 14: Paul VI

**Files:** `tools/fetch-fixtures.sh`, `tools/fixtures/paul-vi-*.html`, `tools/src/mappings/pontiffs.ts`, `tools/test/harvest-data.test.ts`

**Election date:** 21 June 1963.

**Expected counts:** encyclicals 7, apost_constitutions 354, apost_letters 270, apost_exhortations 12, motu_proprio 49. `letters` and `speeches` are year-partitioned and out of scope.

Expect a large number of circumscription-erection candidate warnings — roughly 316 of the 354 apostolic constitutions. They are Task 20's work, not a blocker here.

- [ ] **Step 1: Fixture block**

```bash
if [ -z "$POPE" ] || [ "$POPE" = paul-vi ]; then
  for s in encyclicals apost_constitutions apost_letters apost_exhortations motu_proprio; do
    shelf paul-vi "$s"
  done
fi
```

- [ ] **Step 2: `POPES` row**

```ts
  {
    pageSlug: 'paul-vi', issuerId: 'rp:paul-vi', era: 'shelf',
    shelves: [
      'apost_constitutions', 'apost_exhortations', 'apost_letters',
      'encyclicals', 'motu_proprio',
    ],
  },
```

- [ ] **Step 3: Add an erection-candidate test**

Beyond the template:

```ts
  it('flags the diocese erections as candidates without tagging any of them', () => {
    // The headings print a bare Latin toponym with no marker, so nothing is tagged
    // until the curation pass. Documents with real names must not be flagged.
    expect(docs.every((d) => d.keywords === undefined)).toBe(true);
    expect(docs.some((d) => d.incipit === 'Indulgentiarum Doctrina')).toBe(true);
    expect(docs.some((d) => d.incipit === 'Romano Pontifici Eligendo')).toBe(true);
  });
```

- [ ] **Step 4: Run the shared procedure**, then commit:

```bash
git add tools/fetch-fixtures.sh tools/fixtures/paul-vi-*.html \
        tools/src/mappings/ data/ registry/ tools/test/
git commit -m "feat: harvest Paul VI's formal shelves

354 apostolic constitutions, mostly circumscription erections filed under
a bare Latin toponym. They are flagged as candidates, not tagged: the
confirmations are a later curation pass."
```

---

### Task 15: John Paul I

The shortest pontificate and the smallest task.

**Files:** `tools/fetch-fixtures.sh`, `tools/fixtures/john-paul-i-*.html`, `tools/src/mappings/pontiffs.ts`, `tools/test/harvest-data.test.ts`

**Election date:** 26 August 1978.

**Expected counts:** apost_letters 3, letters 4. Both are aggregate pages, so `letters` is **in scope** here (spec §2.7). `speeches` is out of scope.

- [ ] **Step 1: Fixture block**

```bash
if [ -z "$POPE" ] || [ "$POPE" = john-paul-i ]; then
  for s in apost_letters letters; do shelf john-paul-i "$s"; done
fi
```

- [ ] **Step 2: `POPES` row**

```ts
  {
    pageSlug: 'john-paul-i', issuerId: 'rp:john-paul-i', era: 'shelf',
    // `letters` is included: its aggregate index carries its four items (spec §2.7).
    shelves: ['apost_letters', 'letters'],
  },
```

- [ ] **Step 3: Run the shared procedure**, then commit:

```bash
git add tools/fetch-fixtures.sh tools/fixtures/john-paul-i-*.html \
        tools/src/mappings/ data/ registry/ tools/test/
git commit -m "feat: harvest John Paul I's formal shelves"
```

---

### Task 16: John Paul II

The largest pontificate in scope, and the second to exercise year traversal.

**Files:** `tools/fetch-fixtures.sh`, `tools/fixtures/john-paul-ii-*.html`, `tools/src/mappings/pontiffs.ts`, `tools/test/harvest-data.test.ts`

**Election date:** 16 October 1978.

**Expected counts:** encyclicals 14, bulls 2, apost_constitutions 613, apost_exhortations 15, motu_proprio 31. `apost_letters` is **year-partitioned** (1978–2005, 28 year pages). `letters` and `speeches` are out of scope.

- [ ] **Step 1: Fixture block**

```bash
if [ -z "$POPE" ] || [ "$POPE" = john-paul-ii ]; then
  for s in encyclicals bulls apost_constitutions apost_exhortations motu_proprio; do
    shelf john-paul-ii "$s"
  done
  shelf john-paul-ii apost_letters
  years john-paul-ii apost_letters 1978 2005
fi
```

- [ ] **Step 2: `POPES` row**

```ts
  {
    pageSlug: 'john-paul-ii', issuerId: 'rp:john-paul-ii', era: 'shelf',
    // apost_letters is year-partitioned across 1978-2005 and is read through
    // resolveShelfPages. `books` and `jubilee` are linked from the landing page but
    // are not document shelves (spec §2.5).
    shelves: [
      'apost_constitutions', 'apost_exhortations', 'apost_letters',
      'bulls', 'encyclicals', 'motu_proprio',
    ],
  },
```

- [ ] **Step 3: Add tests beyond the template**

```ts
  it('reads the 28 year pages of the apostolic letters shelf', () => {
    const apl = docs.filter((d) => d.source?.shelf === 'apost_letters');
    expect(apl.length).toBeGreaterThan(100);
    expect(apl.some((d) => d.date.startsWith('1994'))).toBe(true);
  });

  it('keeps the named apostolic constitutions minted and distinct from the erections', () => {
    for (const incipit of ['Sapientia Christiana', 'Ex Corde Ecclesiae']) {
      const d = docs.find((x) => x.incipit === incipit);
      expect(d, incipit).toBeDefined();
      expect(d!.idStatus).toBe('minted');
    }
  });
```

- [ ] **Step 4: Run the shared procedure**, then commit:

```bash
git add tools/fetch-fixtures.sh tools/fixtures/john-paul-ii-*.html \
        tools/src/mappings/ data/ registry/ tools/test/
git commit -m "feat: harvest John Paul II's formal shelves

The largest pontificate in scope: 613 apostolic constitutions plus a
year-partitioned apostolic letters shelf spanning 1978-2005."
```

---

### Task 17: Benedict XVI

**Files:** `tools/fetch-fixtures.sh`, `tools/fixtures/benedict-xvi-*.html`, `tools/src/mappings/pontiffs.ts`, `tools/test/harvest-data.test.ts`

**Election date:** 19 April 2005.

**Expected counts:** encyclicals 3, apost_constitutions 126, apost_letters 68, apost_exhortations 4, motu_proprio 13. `letters` and `speeches` are year-partitioned and out of scope; `elezione` is not a document shelf.

- [ ] **Step 1: Fixture block**

```bash
if [ -z "$POPE" ] || [ "$POPE" = benedict-xvi ]; then
  for s in encyclicals apost_constitutions apost_letters apost_exhortations motu_proprio; do
    shelf benedict-xvi "$s"
  done
fi
```

- [ ] **Step 2: `POPES` row**

```ts
  {
    pageSlug: 'benedict-xvi', issuerId: 'rp:benedict-xvi', era: 'shelf',
    // `elezione` is linked from the landing page but is not a document shelf (spec §2.5).
    shelves: [
      'apost_constitutions', 'apost_exhortations', 'apost_letters',
      'encyclicals', 'motu_proprio',
    ],
  },
```

- [ ] **Step 3: Run the shared procedure**, then commit:

```bash
git add tools/fetch-fixtures.sh tools/fixtures/benedict-xvi-*.html \
        tools/src/mappings/ data/ registry/ tools/test/
git commit -m "feat: harvest Benedict XVI's formal shelves"
```

---

### Task 18: Francis

The first pope whose erections are tagged textually by Task 11's rule.

**Files:** `tools/fetch-fixtures.sh`, `tools/fixtures/francesco-*.html`, `tools/src/mappings/pontiffs.ts`, `tools/test/harvest-data.test.ts`

**Election date:** 13 March 2013.

**Expected counts:** encyclicals 4, bulls 2, apost_constitutions 49, apost_letters 114, apost_exhortations 7, motu_proprio 77. `letters` and `speeches` are year-partitioned and out of scope.

Note the CRPDR id: the page slug is `francesco`, the id is **`rp:francis-i`**.

- [ ] **Step 1: Fixture block**

```bash
if [ -z "$POPE" ] || [ "$POPE" = francesco ]; then
  for s in encyclicals bulls apost_constitutions apost_letters apost_exhortations motu_proprio; do
    shelf francesco "$s"
  done
fi
```

- [ ] **Step 2: `POPES` row**

```ts
  {
    // The vatican.va slug is Italian ('francesco'); the CRPDR id is 'rp:francis-i'.
    pageSlug: 'francesco', issuerId: 'rp:francis-i', era: 'shelf',
    shelves: [
      'apost_constitutions', 'apost_exhortations', 'apost_letters',
      'bulls', 'encyclicals', 'motu_proprio',
    ],
  },
```

- [ ] **Step 3: Add the keyword tests beyond the template**

```ts
  it('tags the erections the headings state outright', () => {
    const tagged = docs.filter((d) => d.keywords?.includes('circumscription-erection'));
    expect(tagged.length).toBeGreaterThan(20);
    expect(tagged.every((d) => /ha eretto|ha istituito/i.test(d.title))).toBe(true);
  });

  it('does not tag a document that merely sits on the same shelf', () => {
    const pe = docs.find((d) => d.incipit === 'Praedicate Evangelium');
    expect(pe).toBeDefined();
    expect(pe!.keywords).toBeUndefined();
  });

  it('namespaces ids under the CRPDR id, not the vatican.va slug', () => {
    expect(docs.every((d) => d.id.startsWith('mag:francis-i/'))).toBe(true);
    expect(docs.some((d) => d.id.startsWith('mag:francesco/'))).toBe(false);
  });
```

- [ ] **Step 4: Run the shared procedure**, then commit:

```bash
git add tools/fetch-fixtures.sh tools/fixtures/francesco-*.html \
        tools/src/mappings/ data/ registry/ tools/test/
git commit -m "feat: harvest Francis's formal shelves

First pontificate whose circumscription erections are tagged from the
heading text rather than flagged for curation."
```

---

### Task 19: Leo XIV

The last pontificate, and the one whose fixtures will age fastest.

**Files:** `tools/fetch-fixtures.sh`, `tools/fixtures/leo-xiv-*.html`, `tools/src/mappings/pontiffs.ts`, `tools/test/harvest-data.test.ts`, `registry/documents.md`

**Election date:** 8 May 2025.

**Expected counts:** encyclicals 1, apost_constitutions 7, apost_letters 10, apost_exhortations 1, motu_proprio 8. `letters` and `speeches` are year-partitioned and out of scope.

- [ ] **Step 1: Fixture block**

```bash
if [ -z "$POPE" ] || [ "$POPE" = leo-xiv ]; then
  for s in encyclicals apost_constitutions apost_letters apost_exhortations motu_proprio; do
    shelf leo-xiv "$s"
  done
fi
```

- [ ] **Step 2: `POPES` row**

```ts
  {
    pageSlug: 'leo-xiv', issuerId: 'rp:leo-xiv', era: 'shelf',
    shelves: [
      'apost_constitutions', 'apost_exhortations', 'apost_letters',
      'encyclicals', 'motu_proprio',
    ],
  },
```

- [ ] **Step 3: Note the reigning-pontificate caveat**

This is the only pontificate still in progress, so its fixtures go stale as documents are added. Add to `tools/fetch-fixtures.sh`, at the top of the Leo XIV block:

```bash
  # Leo XIV is the reigning pontiff: these fixtures go stale as documents are published.
  # Refresh them, update FIXTURES_RETRIEVED, and re-harvest whenever the registry is
  # brought up to date. The counts in tools/test/harvest-data.test.ts move with them.
```

- [ ] **Step 4: Run the shared procedure**

- [ ] **Step 5: Verify the whole corpus and the index**

```bash
npm run check
npm run harvest && npm run render
git diff --exit-code data/ registry/
head -30 registry/documents.md
wc -l registry/documents/by-issuer/*.md registry/documents/by-genre/*.md
```

Expected: **fifteen** issuer views — fourteen popes (Benedict XIV, Pius IX, Leo XIII, Pius X, Benedict XV, Pius XI, Pius XII, John XXIII, Paul VI, John Paul I, John Paul II, Benedict XVI, Francis, Leo XIV) plus `vatican-i` — a genre view per distinct genre, and an index whose per-issuer counts sum to the stated total.

- [ ] **Step 6: Add the whole-corpus test**

Add `readdirSync` to the `node:fs` import at the top of `tools/test/harvest-data.test.ts` if it is not already there.

```ts
describe('the whole corpus', () => {
  const everything = readdirSync('data/documents')
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[]);

  it('has globally unique identifiers', () => {
    expect(new Set(everything.map((d) => d.id)).size).toBe(everything.length);
  });

  it('satisfies every invariant across every issuer at once', () => {
    expect(checkDocuments(everything, genres, keywords)).toEqual([]);
  });

  it('keeps the 383 pilot identifiers exactly as first minted', () => {
    const pilot = [...load('benedict-xiv'), ...load('pius-ix'),
                   ...load('leo-xiii'), ...load('vatican-i')];
    expect(pilot).toHaveLength(383);
  });
});
```

- [ ] **Step 7: Commit**

```bash
git add tools/fetch-fixtures.sh tools/fixtures/leo-xiv-*.html \
        tools/src/mappings/ data/ registry/ tools/test/
git commit -m "feat: harvest Leo XIV's formal shelves

Completes the eleven pontificates of the expansion. Leo XIV is the
reigning pontiff, so these fixtures need periodic refreshing; the script
says so at the point of use."
```

---

## Task 20: The circumscription curation pass

Additive, touches no identifier, and can be done in instalments. It ends with the by-keyword view.

**Files:**
- Modify: `tools/src/mappings/keywords.ts`, `tools/src/render/run.ts`, `tools/src/render/indexMd.ts`
- Create: `tools/src/render/keywordMd.ts`
- Test: `tools/test/keywords.test.ts`, `tools/test/harvest-data.test.ts`, `tools/test/render.test.ts`

**Interfaces:**
- Consumes: `CIRCUMSCRIPTION_ERECTIONS`, `isErectionCandidate` (Task 11); `renderGenreMd`'s helpers (Task 3).
- Produces: `renderKeywordMd(keywordId: string, docs: DocumentRecord[]): string`; `registry/documents/by-keyword/{keyword}.md`.

- [ ] **Step 1: Produce the candidate worklist**

```bash
npm run harvest 2>&1 | grep 'Circumscription-erection candidate' \
  | sed 's/^Circumscription-erection candidate //' | sort > /tmp/erection-candidates.txt
wc -l /tmp/erection-candidates.txt
```

Expected: roughly 1,100 lines across Paul VI, John Paul II and Benedict XVI.

- [ ] **Step 2: Confirm candidates in instalments**

For each candidate, open its vatican.va document and confirm that its text erects a circumscription — the opening formula is characteristically `Ad aptius consulendum…` / `Quo aptius…` followed by the see and `…dioecesim condimus`. Record each confirmed one in `CIRCUMSCRIPTION_ERECTIONS`:

```ts
  'john-paul-ii|usbekistaniae|2005-04-01': {
    note:
      'The constitution erects the Apostolic Administration of Uzbekistan into a diocese: '
      + '"…Administrationem Apostolicam Uzbekistaniae ad gradum et dignitatem dioecesis '
      + 'evehimus…". The heading prints only the toponym.',
  },
```

**Work in instalments and commit each one.** A partial table is valid at every point: an unconfirmed candidate simply keeps warning. Do not batch-confirm by pattern — that is the thing the design explicitly refuses.

- [ ] **Step 3: Write the failing test for the by-keyword view**

Add to `tools/test/render.test.ts`:

```ts
describe('renderKeywordMd', () => {
  const tagged: DocumentRecord = {
    id: 'mag:john-paul-ii/usbekistaniae-2005', title: 'Usbekistaniae', incipit: 'Usbekistaniae',
    idStatus: 'minted', genre: 'papal-bull', issuerId: 'rp:john-paul-ii', issuerType: 'pope',
    date: '2005-04-01', keywords: ['circumscription-erection'],
  };
  const md = renderKeywordMd('circumscription-erection', [tagged]);

  it('shows issuer and genre, both of which vary in this view', () => {
    expect(md).toContain('| ID | Title | Incipit | Genre | Issuer | Date |');
  });

  it('names the keyword and marks the file as generated', () => {
    expect(md).toContain('circumscription-erection');
    expect(md).toMatch(/generated/i);
  });
});
```

- [ ] **Step 4: Run test to verify it fails**

Run: `npx vitest run tools/test/render.test.ts`
Expected: FAIL — cannot resolve `../src/render/keywordMd.js`.

- [ ] **Step 5: Write the renderer**

Create `tools/src/render/keywordMd.ts`:

```ts
import { cell, byDateThenId, idCell, genreCell, FOOTNOTE } from './issuerMd.js';
import type { DocumentRecord } from '../types.js';

export function renderKeywordMd(keywordId: string, docs: DocumentRecord[]): string {
  const rows = [...docs].sort(byDateThenId);
  const head = `# Documents keyworded \`${keywordId}\`

Generated by \`npm run render\` from \`data/documents/*.json\` — do not edit by hand.

A keyword is a descriptive subject tag. It makes no claim about the document's authority: see
\`data/keywords.json\` for the term's definition and the design spec §4.5 for how it is applied.

${rows.length} documents.

| ID | Title | Incipit | Genre | Issuer | Date |
| --- | --- | --- | --- | --- | --- |`;

  const body = rows.map((d) =>
    `| ${idCell(d)} | ${cell(d.title)} | ${d.incipit ? cell(d.incipit) : ''} `
    + `| ${genreCell(d)} | \`${d.issuerId}\` | ${d.date} |`);

  return `${head}\n${body.join('\n')}\n\n${FOOTNOTE}\n`;
}
```

- [ ] **Step 6: Write the view and index it**

In `tools/src/render/run.ts`, add the import, `mkdirSync('registry/documents/by-keyword', { recursive: true });` beside the other two, and:

```ts
const byKeyword = new Map<string, DocumentRecord[]>();
for (const d of docs) {
  for (const k of d.keywords ?? []) byKeyword.set(k, [...(byKeyword.get(k) ?? []), d]);
}
for (const [keyword, ds] of byKeyword) {
  writeFileSync(`registry/documents/by-keyword/${keyword}.md`, renderKeywordMd(keyword, ds));
}
```

In `tools/src/render/indexMd.ts`, add a By keyword section between By genre and Coverage, rendered only when at least one document carries a keyword:

```ts
  const byKeyword = new Map<string, DocumentRecord[]>();
  for (const d of docs) {
    for (const k of d.keywords ?? []) byKeyword.set(k, [...(byKeyword.get(k) ?? []), d]);
  }
  const keywordSection = byKeyword.size === 0 ? '' : `
## By keyword

A keyword is a descriptive subject tag and carries no claim about authority.

| Keyword | Documents |
| --- | --- |
${[...byKeyword].sort().map(([k, ds]) =>
  `| [\`${k}\`](documents/by-keyword/${k}.md) | ${ds.length} |`).join('\n')}
`;
```

and interpolate `${keywordSection}` into the template before `## Coverage`.

- [ ] **Step 7: Record the curation state in the coverage section**

In the Coverage list of `renderIndexMd`, add a generated line:

```ts
  const candidates = docs.filter(
    (d) => (d.genre === 'papal-bull')
      && d.characteristics?.includes('apostolic-constitution')
      && !d.keywords?.includes('circumscription-erection')
      && ['rp:paul-vi', 'rp:john-paul-ii', 'rp:benedict-xvi'].includes(d.issuerId),
  ).length;
```

and, in the Coverage bullet list:

```
- **Keyword curation is incomplete.** ${candidates} apostolic constitutions of Paul VI, John Paul II
  and Benedict XVI have not yet been confirmed as circumscription erections. Their headings print a
  bare Latin toponym with no marker, so each is confirmed by hand against the document's own text.
```

- [ ] **Step 8: Assert the curation state**

A tagged document must have earned its tag one of exactly two ways: its heading states the act, or it is in the curated table. A `DocumentRecord` does not carry the vatican.va page slug, so it cannot rebuild the curated key by itself — the count is asserted instead, which pins the same property without reconstructing keys.

Add to the `describe('the whole corpus', …)` block in `tools/test/harvest-data.test.ts`, importing `CIRCUMSCRIPTION_ERECTIONS` from `../src/mappings/index.js`:

```ts
  it('tags no document that was neither stated in its heading nor confirmed by hand', () => {
    const tagged = everything.filter((d) => d.keywords?.includes('circumscription-erection'));
    const textual = tagged.filter((d) => /ha eretto|ha istituito|ha elevato/i.test(d.title));
    const untextual = tagged.length - textual.length;
    // Every tag that is not textual must come from the curated table, and the table
    // contains nothing else — so the two counts are equal. A tag appearing from
    // anywhere else (a morphological rule leaking into the data, say) breaks this.
    expect(untextual).toBe(Object.keys(CIRCUMSCRIPTION_ERECTIONS).length);
  });

  it('keeps the keyword out of every authority-bearing field', () => {
    for (const d of everything) {
      expect(d.characteristics ?? [], d.id).not.toContain('circumscription-erection');
    }
  });
```

- [ ] **Step 9: Verify and commit each instalment**

```bash
npm run check
npm run harvest && npm run render
git diff --exit-code data/ registry/
git add tools/src/mappings/keywords.ts tools/src/render/ data/ registry/ tools/test/
git commit -m "feat: confirm circumscription erections and add the by-keyword view

Each entry is confirmed against the document's own text, never inferred
from its toponym. The index reports how many candidates remain, generated
from the data, so the registry cannot claim curation it has not done."
```

---

## Verification: the whole plan

After Task 20, or after any instalment of it:

```bash
npm run check
npm run harvest && npm run render
git diff --exit-code data/ registry/
npx tsc --noEmit
```

All four must succeed. The last is redundant with `npm run check` and is listed so a partial run still catches a type error.

Then confirm against the spec:

| Spec section | Where it lands |
|---|---|
| §2.5 per-pope shelves, hyphen variant, non-document shelves | Tasks 1, 12, 16, 17 |
| §2.2/§2.3 aggregate-or-years resolution | Task 9, exercised in Tasks 13 and 16 |
| §2.7 shelf scope, partial `letters` | Tasks 2, 8, 12, 15; stated in the index (Task 4) |
| §4.1 title/incipit split | Task 6 |
| §4.2 `extractIncipit` | Task 5, measured in Task 8 |
| §4.3 provisional minting and ordinals | Task 6 |
| §4.4 warnings as the curation queue | Task 6, worked in Tasks 8 and 12–19 |
| §4.5 keywords, both population paths | Tasks 10, 11, 18, 20 |
| §5 schema and type changes | Tasks 6, 10 |
| §6 two views plus index and coverage | Tasks 3, 4; third view in Task 20 |
| §7 invariants 18–21 | Tasks 7, 10 |
| §8 phasing | Tasks 1–20 in order |
