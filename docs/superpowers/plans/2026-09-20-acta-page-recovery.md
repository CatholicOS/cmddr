# AAS page recovery (phase 2b-iii-b) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cite the acts of AAS 1–17 (1909–1925), whose chronological-index OCR lost the page column, by recovering each act's first page from the volume body, then join and create from those seventeen volumes as the earlier phases did.

**Architecture:** The parser keeps the entries it opens without a page as structured `pageless` entries. A recovery tool (`tools/src/acta/recover.ts`, run once per volume by `tools/recover-acta-pages.ts` against the whole-volume text kept in the local store) searches the body for each incipit within the category's page runs from the volume's *Index generalis actorum*, confirms ties by the act's dating formula, and writes a checked-in sidecar per volume (`aas-{vol}-{year}.pages.json`) quoting its evidence. The join reads the sidecar (and a curated `ACTA_PAGE_READINGS` table) offline and turns the recovered entries into ordinary entries marked `pageSource`, so the matcher, the creator and the reports run unchanged.

**Tech Stack:** TypeScript (tsx, vitest), bash + python3/pypdf (`tools/fetch-acta.sh`), the existing `tools/src/acta/*` pipeline.

**Spec:** `docs/superpowers/specs/2026-09-13-acta-volumes-design.md` §10 (the measurement, the design and the store); §4 (parse rate), §6 (report), §9 (the phases).

## Global Constraints

- Nothing is cited without a page; a page is never guessed (spec §10.2, §10.3.2): a recovery is accepted only when unique, or unique after the dating formula, or unique after the bounded fuzzy match; anything else is reported as unrecovered.
- Every curated row quotes what it rests on (index line, body line, running header, dating formula) and says where it was read (`PDF page N of AAS-XX-YYYY-ocr.pdf, read 2026-09-2D`).
- The store (`~/development/sources/AAS`, `ACTA_SOURCES` env var) is never read by tests or by `npm run harvest`; only the fixtures and sidecars under `tools/fixtures/acta/` are (spec §10.4).
- The 95 % parse-rate floor applies to the rate *after* recovery; a volume below it is a finding to explain in the report, never a threshold to lower (spec §4, §10.3.4).
- A sidecar or reading row whose entry the parser no longer opens is a hard error (spec §10.3.3), as a stale `ACTA_INDEX_CORRECTIONS` row is.
- Commit messages end with `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`. Work in a worktree under `.worktrees/` created from local `HEAD` (branch `feat/acta-volumes-1909-1925`).
- Prose in comments, README and reports follows the repository's register: measured facts with the volume and page, no adjectives.

---

## File map

| File | Responsibility |
|---|---|
| `tools/fetch-acta.sh` | Modify: a `text` mode exporting a volume's whole text to `<store>/txt/`; the fixtures of 1909–1925 re-extracted. |
| `tools/fixtures/acta/aas-{01..17}-{1909..1925}[-I].txt` | Create/modify: the seventeen chronological-index fixtures (1909 and 1917-I re-extracted with the interleaving fallback). |
| `tools/fixtures/acta/aas-{vol}-{year}[-I].pages.json` | Create: one sidecar per volume, written by the recovery tool. |
| `tools/fixtures/acta/README.md` | Modify: rows for the seventeen, a section on the sidecars and the text export. |
| `tools/src/acta/index.ts` | Modify: `ActaParseResult.pageless`, `ActaEntry.pageSource`; the entry-building code shared by close and flush. |
| `tools/src/acta/recover.ts` | Create: keys, *Index generalis* runs, Latin dating formulae, incipit search, the recovery rules, sidecar application. |
| `tools/recover-acta-pages.ts` | Create: the CLI that writes the sidecars from the store text. |
| `tools/src/acta/join.ts` | Modify: sources for 1910–1925 (1909, 1917-I re-dated); sidecars and readings applied in `loadActaIndexes`; curated references applied in `applyActa`. |
| `tools/src/acta/curation.ts` | Modify: `ACTA_PAGE_READINGS`, `ACTA_CURATED_REFERENCES`. |
| `tools/acta-volumes-report.ts` | Modify: era `1909-1925`; a recovery section and a `page-not-recovered` hold row for every era. |
| `tools/test/acta-index.test.ts`, `tools/test/acta-recover.test.ts`, `tools/test/acta-join.test.ts` (new), `tools/test/harvest-data.test.ts` | Tests. |
| `README.md`, `SCHEMA.md`, `docs/superpowers/specs/2026-09-13-acta-volumes-design.md` §10, `docs/superpowers/reports/2026-09-2D-acta-volumes-1909-1925.md` | Docs and the era report. |

---

### Task 1: The seventeen fixtures, and the text export to the store

**Files:**
- Modify: `tools/fetch-acta.sh` (the header comment, `get_volume`, the argument dispatch at the end)
- Create/modify: `tools/fixtures/acta/aas-01-1909.txt` … `aas-17-1925.txt`, `tools/fixtures/acta/README.md`
- Modify: `tools/src/acta/join.ts` (`ACTA_SOURCES`), `tools/test/acta-index.test.ts` (the sweep tests naming 1909 and 1917-I)

**Interfaces:**
- Produces: `tools/fetch-acta.sh text <year>|<from>-<to>` writing `<store>/txt/aas-{vol}-{year}[-{part}].txt` (pypdf default mode, one page per `\f`, the whole volume, skipped when present); `ACTA_SOURCES` rows for 1909–1925 with `retrieved: '2026-09-2D'` (the day the fixtures are extracted; use the real date everywhere this plan writes `2026-09-2D`).

- [ ] **Step 1: Add the text export to the script**

In `tools/fetch-acta.sh`, after `extract_index_pages()` and before `get_index()`, add:

```bash
# Export a volume's whole text -- every page, in pypdf's default mode, one page per form
# feed -- to <store>/txt/aas-{vol}-{year}[-{part}].txt, for the page recovery of phase
# 2b-iii-b (acta volumes spec §10.3): the recovery tool (tools/recover-acta-pages.ts)
# reads it from the store and writes the checked-in sidecar; the text itself is never
# checked in (500-1,300 pages a volume). Skipped when the file is already there.
extract_text() { # extract_text <pdf> <out>
  if [ -s "$2" ]; then echo "    cached: $2"; return 0; fi
  mkdir -p "$(dirname "$2")"
  python3 - "$1" "$2" <<'EOF'
import sys
from pypdf import PdfReader
pdf, out = sys.argv[1], sys.argv[2]
reader = PdfReader(pdf)
pages = [(p.extract_text() or '') for p in reader.pages]
with open(out, 'w', encoding='utf-8') as f:
    f.write('\f'.join(pages))
print(f'    {len(pages)} pages -> {out}')
EOF
}
```

Add a `TEXT` flag: near the top, after `ARG="${1:-}"` is read at the bottom, restructure the dispatch so that `text` as the first argument sets a mode and shifts:

```bash
MODE=fixtures
if [ "${1:-}" = "text" ]; then MODE=text; shift; fi
ARG="${1:-}"
```

and in `get_volume`, replace the final `extract_index_pages "$pdf" "$out"` with:

```bash
    if [ "$MODE" = "text" ]; then
      extract_text "$pdf" "${STORE%/pdf}/txt/aas-$vol-$year${part:+-$part}.txt"
    else
      extract_index_pages "$pdf" "$out"
    fi
```

Update the usage block in the header comment:

```bash
#        tools/fetch-acta.sh 1909-1925       # a range of volumes (phase 2b-iii-b: AAS 1-17, the lost page column, spec §10)
#        tools/fetch-acta.sh text 1921       # the whole text of a volume to <store>/txt/ (phase 2b-iii-b's recovery input)
#        tools/fetch-acta.sh text 1909-1925  # the same for a range
```

- [ ] **Step 2: Check the syntax and the cached path**

Run: `bash -n tools/fetch-acta.sh && tools/fetch-acta.sh text 1921 && tools/fetch-acta.sh text 1921`
Expected: the first run prints `    652 pages -> …/sources/AAS/txt/aas-13-1921.txt` (631 pages for AAS 13; the number the volume has), the second prints `    cached: …`.

- [ ] **Step 3: Re-extract the seventeen fixtures**

Run: `tools/fetch-acta.sh 1909-1925 2>&1 | grep -v Rotated`
Expected: seventeen `PDF pages A-B of N -> tools/fixtures/acta/aas-XX-YYYY.txt` lines (1917 prints two, part II `NO CHRONOLOGICAL INDEX FOUND`, as before); `git status` shows 1909 and 1917-I modified (the interleaving fallback now applies to some of their pages) and fifteen new files. Note each range for the README.

Then export the text of all seventeen: `tools/fetch-acta.sh text 1909-1925 2>&1 | grep -v Rotated` (about a minute a volume; 1917 exports part I only — part II has no index and no act to recover).

- [ ] **Step 4: Register the sources and the README rows**

In `tools/src/acta/join.ts`, replace

```ts
  volume(1909, '2026-09-13', { parse: { columnar: true, bareIncipits: false } }),
  volume(1917, '2026-09-13', { part: 'I' }),
```

with

```ts
  // Phase 2b-iii-b (spec §10): AAS 1-17, the volumes of 1909-1925, whose OCR lost the page
  // column on most index pages -- the pages come back from the volume body through the
  // sidecars (recover.ts). 1909 and 1917-I, the sample's, re-extracted on 2026-09-2D with
  // the interleaving fallback of 2b-ii-b. AAS 1 prints incipits only in guillemets after
  // a genre word (sample report §2), hence `bareIncipits: false`.
  volume(1909, '2026-09-2D', { parse: { columnar: true, bareIncipits: false } }),
  ...Array.from({ length: 1916 - 1910 + 1 }, (_, i) => volume(1910 + i, '2026-09-2D')),
  volume(1917, '2026-09-2D', { part: 'I' }),
  ...Array.from({ length: 1925 - 1918 + 1 }, (_, i) => volume(1918 + i, '2026-09-2D')),
```

In `tools/fixtures/acta/README.md`: update the title to `… the volumes of 1909–2002`; the phase sentence in the second bullet to say `1909–1925 are phase 2b-iii-b (spec §10), their pages recovered from the volume bodies into the sidecars below`; the 1909 and 1917-I rows' RETRIEVED to **2026-09-2D** with the note `(re-extracted with the interleaving fallback)`; insert one row per new volume in volume order, `| AAS 2 (1910) | \`aas-02-1910.txt\` | **2026-09-2D** | pypdf 6.14.2, layout mode | A–B (n) | N |` with the ranges from Step 3 (1925's row keeps the locator note from PR #40: `(the OCR reads the title's first line as \`II\`; the locator admits the second alone)`).

- [ ] **Step 5: Run the parser sweep tests and fix what the re-extraction moved**

Run: `npx vitest run tools/test/acta-index.test.ts`
Expected: the sample sweep (`parses every checked-in fixture …`) still exempts 1909 and 1917-I from the 95 % floor and passes; if 1917-I's `harvestedParseRate` moved, nothing pins it there. If `unseenHeadings` or `unmappedPopes` is non-empty for any of the seventeen, add the heading to `tools/src/acta/categories.ts` with a comment quoting the fixture line and volume (as PR #40 did for `NOTIFICATIO`), or the pope to `popes.ts`, and a test line in the new describe block of Task 2.

- [ ] **Step 6: Commit**

```bash
git add tools/fetch-acta.sh tools/fixtures/acta/ tools/src/acta/join.ts tools/src/acta/categories.ts tools/test/acta-index.test.ts
git commit -m "Fetch the chronological-index pages of AAS 1-17 (1909-1925) and export their text to the store (phase 2b-iii-b)"
```

---

### Task 2: The parser keeps the entries it opens without a page

**Files:**
- Modify: `tools/src/acta/index.ts` (`ActaEntry`, `ActaParseResult`, `flushDefect`, the entry-closing block at the end of `parseActaIndex`)
- Test: `tools/test/acta-index.test.ts`

**Interfaces:**
- Produces: `export type PagelessEntry = Omit<ActaEntry, 'page' | 'alsoPages'>`; `ActaParseResult.pageless: PagelessEntry[]`; `ActaEntry.pageSource?: 'recovered' | 'reading'` (absent for a page read from the index).

- [ ] **Step 1: Write the failing test**

Append to the `describe('parseActaIndex on the early volumes …', …)` block added in PR #40 (search `phase 2b-iii-a`), or create a new `describe('parseActaIndex keeps the entries opened without a page (spec §10.3, phase 2b-iii-b)', …)` block before `describe('splitEntryText', …)`:

```ts
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
```

- [ ] **Step 2: Run it to see it fail**

Run: `npx vitest run tools/test/acta-index.test.ts -t 'pageless'`
Expected: FAIL — `r.pageless` is undefined.

- [ ] **Step 3: Add the types**

In `ActaEntry` (after `raw`):

```ts
  /**
   * Where the page came from when the index did not print it (phase 2b-iii-b, spec §10.3):
   * `recovered` from the volume body by the sidecar, `reading` from a curated row
   * (ACTA_PAGE_READINGS). Absent for a page read from the index line.
   */
  pageSource?: 'recovered' | 'reading';
```

After `ActaEntry`:

```ts
/** An entry the index opened whose page the OCR lost: everything the line prints but the page (spec §10.3). */
export type PagelessEntry = Omit<ActaEntry, 'page' | 'alsoPages' | 'pageSource'>;
```

In `ActaParseResult` (after `entries`):

```ts
  /** The entries opened without a page (`stats.withoutPage` counts them), for the page recovery; each is also a defect. */
  pageless: PagelessEntry[];
```

and in the `result` initialiser (`entries: [], unseenHeadings: [], …`) add `pageless: [],`.

- [ ] **Step 4: Share the entry-building code between close and flush**

The closing block (the code from `let entryText = …` / `let entryDate = …` down to `result.entries.push({ … })`) reads `open`, `page` and `alsoPages`. Extract the part that computes `entryText`, `entryDate`, `entryPope` and the pushed object into a local function declared before the loop, with `page: number | null`:

```ts
  /**
   * The entry an open line group makes: its date (the bracket of an earlier pontificate's
   * act, the dating formula a description prints), its pope, its incipit/toponym/description
   * (splitEntryText). With a page it is an entry; without one (the OCR lost the column) it
   * is a pageless entry, the same fact for the recovery (spec §10.3).
   */
  const build = (o: NonNullable<typeof open>, page: number | null, alsoPages?: number[]): ActaEntry | PagelessEntry => {
    // … the existing computation of entryText / entryDate / entryPope, verbatim, using `o` for `open` …
    const base: PagelessEntry = {
      series: 'AAS', volume, year, ...(opts.part ? { part: opts.part } : {}),
      pope: entryPope, category: o.category, date: entryDate, ...(o.note ? { dateNote: o.note } : {}), ...(o.state?.noteRef ? { dateNoteRef: o.state.noteRef } : {}),
      ...splitEntryText(entryText, { bareIncipits, constitution: categoryForHeading(o.category)?.classes.some((c) => c.requires === 'apostolic-constitution') ?? false }),
      raw: o.lines.map((l) => l.replace(/\s+$/, '')).join('\n'),
    };
    return page === null ? base : { ...base, page, ...(alsoPages ? { alsoPages } : {}) };
  };
```

Keep the `noteRef` assignment (`if (open.state !== undefined && open.state.note !== undefined && open.state.noteRef === undefined) open.state.noteRef = \`${year}:${page}\`;`) in the closing path only — a pageless entry has no page to key a correction by. Keep the stats lines (`stats.monthOnly`, `stats.entries`, `stats.harvestedEntries`, `unseen.add`) in the closing path. The closing path becomes `result.entries.push(build(open, page, alsoPages) as ActaEntry)`.

In `flushDefect`, after `defect(open.category, …)` and before `open = null`, add:

```ts
    result.pageless.push(build(open, null) as PagelessEntry);
```

- [ ] **Step 5: Run the whole parser test file**

Run: `npx vitest run tools/test/acta-index.test.ts`
Expected: all pass, including the new one and the `is deterministic` test. If `build` changed any existing entry (it must not), diff `npx tsx -e "…"` output of a fixture parse before and after — the refactor is a pure extraction.

- [ ] **Step 6: Commit**

```bash
git add tools/src/acta/index.ts tools/test/acta-index.test.ts
git commit -m "Keep the entries the index opens without a page as pageless entries, for the page recovery"
```

---

### Task 3: `recover.ts` — keys and the *Index generalis actorum* page runs

**Files:**
- Create: `tools/src/acta/recover.ts`
- Test: `tools/test/acta-recover.test.ts`

**Interfaces:**
- Produces: `pagelessKey(e)`, `parseIndexGeneralis(pages)`, `PageRun`, `IndexGeneralis`.

- [ ] **Step 1: Write the failing tests**

Create `tools/test/acta-recover.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { pagelessKey, parseIndexGeneralis } from '../src/acta/recover.js';

describe('pagelessKey', () => {
  it('keys a pageless entry by date, category, incipit and the head of its description', () => {
    expect(pagelessKey({ date: '1921-01-06', category: 'LITTERAE ENCYCLICAE', incipit: 'Sacra propediem', description: 'Ad Patriarchas, Primates, Archiepiscopos, Episcopos aliosque locorum Ordinarios, pacem et communionem cum Apostolica Sede habentes' }))
      .toBe('1921-01-06|LITTERAE ENCYCLICAE|Sacra propediem|Ad Patriarchas, Primates, Archiepiscopos, Episcopos aliosque locor');
    expect(pagelessKey({ date: '1926-03-10', category: 'LITTERAE APOSTOLICAE', incipit: null, description: 'Short' })).toBe('1926-03-10|LITTERAE APOSTOLICAE||Short');
  });
});

// AAS 13 (1921) p. 571, pypdf default mode, as the store text carries it.
const AAS13_GENERALIS = `INDEX GENERALIS ACTORUM 
(ANN. XIII — VOL. XIII) 
I. - ACTA BENEDICTI PP. XV 
EPISTOLAE ENCYCLICAE, 34, 209, 329. 
CONSTITUTIONES APOSTOLICAE, 249-255, 
299, 336, 370, 409, 457-469, 489. 
LITTERAE APOSTOLICAE, 6-9,185-194,294-
307, 339-346, 372-377, 412-422, 469-
473, 491-494, 553. 
EPISTOLAE, 10-12, 89-91, 127-131, 195 s., 
218-221, 256, 307, 346 s., 377, 423-429, 
473, 494-496, 528-531, 554. 
SERMO, 93. 
PRECATIONUM FORMULAE, 369, 564. 
SACRA CONSISTORIA, 121-126,281-289,521-
527. 
II. - ACTA 
SACRARUM CONGREGATIONUM 
SUPREMA S. CONGREGATIO S. OFFICII : 
a) Decreta, 42, 197. 
`;

describe('parseIndexGeneralis', () => {
  it('reads the page runs of the pope part, per category, joining a run the line break splits and reading `s.` as the next page', () => {
    const g = parseIndexGeneralis(['front matter', 'body', AAS13_GENERALIS, 'INDEX DOCUMENTORUM\nCHRONOLOGICO ORDINE DIGESTUS']);
    expect(g.page).toBe(3);
    expect(g.runs.get('Litterae Encyclicae')).toEqual([[34, 34], [209, 209], [329, 329]]);
    expect(g.runs.get('Constitutiones Apostolicae')).toEqual([[249, 255], [299, 299], [336, 336], [370, 370], [409, 409], [457, 469], [489, 489]]);
    expect(g.runs.get('Litterae Apostolicae')).toEqual([[6, 9], [185, 194], [294, 307], [339, 346], [372, 377], [412, 422], [469, 473], [491, 494], [553, 553]]);
    expect(g.runs.get('Epistulae')).toEqual([[10, 12], [89, 91], [127, 131], [195, 196], [218, 221], [256, 256], [307, 307], [346, 347], [377, 377], [423, 429], [473, 473], [494, 496], [528, 531], [554, 554]]);
    expect(g.runs.get('Sermones')).toEqual([[93, 93]]);
    // The pope part ends at the dicasteries' part; nothing of it is read.
    expect(g.runs.has('Consistoria')).toBe(true);
    expect([...g.runs.keys()].some((k) => /OFFICII|Decreta/.test(k))).toBe(false);
    expect(g.unmapped).toEqual(['PRECATIONUM FORMULAE']);
  });

  it('returns no page and no runs when the volume has no Index generalis', () => {
    const g = parseIndexGeneralis(['a', 'b', 'INDEX DOCUMENTORUM\nCHRONOLOGICO ORDINE DIGESTUS']);
    expect(g.page).toBeNull();
    expect(g.runs.size).toBe(0);
  });
});
```

(`PRECATIONUM FORMULAE` is unmapped only if `categories.ts` has no row for it; check with `grep -n 'PRECATION' tools/src/acta/categories.ts` and, if a row exists, expect its id instead and `unmapped: []`.)

- [ ] **Step 2: Run to see them fail**

Run: `npx vitest run tools/test/acta-recover.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement**

Create `tools/src/acta/recover.ts`:

```ts
/**
 * The page recovery of phase 2b-iii-b (acta volumes spec §10.3): for an entry the
 * chronological index opened without a page -- the OCR of AAS 1-17 (1909-1925) lost the
 * page column on most index pages, and the numbers are absent from the text layer in every
 * extraction mode (§10.1) -- the act's first page is read from the volume body, where every
 * act opens with its incipit and every page carries its number. The search is constrained
 * to the category's page runs from the volume's *Index generalis actorum* (which prints
 * runs, not pages: `LITTERAE APOSTOLICAE, 6-9, 185-194, …`), a tie between several hits is
 * settled by the act's own dating formula, and an incipit the OCR damaged on one side or
 * the other is retried with a bounded fuzzy match. A recovery is accepted only when it is
 * unique; everything else is reported, never guessed.
 *
 * The tool (tools/recover-acta-pages.ts) runs this once per volume against the whole-volume
 * text in the local store and writes the sidecar `aas-{vol}-{year}.pages.json` beside the
 * fixture, quoting the body line, the running header and the formula each page rests on;
 * the join reads the sidecar offline (applyPageRows, join.ts) and never the store.
 */
import { categoryForHeading } from './categories.js';
import type { ActaEntry, PagelessEntry } from './index.js';

/** The key a sidecar row and a curated reading name a pageless entry by: what the index line prints, minus the page. */
export const pagelessKey = (e: { date: string; category: string; incipit: string | null; description: string }): string =>
  `${e.date}|${e.category}|${e.incipit ?? ''}|${e.description.slice(0, 60)}`;

export type PageRun = [number, number];

export interface IndexGeneralis {
  /** The 1-based page of the *Index generalis actorum* in the volume text, or null when none was found. */
  page: number | null;
  /** The page runs per category id (categories.ts), in print order. */
  runs: Map<string, PageRun[]>;
  /** Headings of the pope part the category table does not list, as printed. */
  unmapped: string[];
}

const GENERALIS_RE = /INDEX\s+GENERALIS\s+ACTORUM/;
/** The pope part's end: the dicasteries' part (`II. - ACTA SACRARUM CONGREGATIONUM`, `ACTA SS. CONGREGATIONUM`) or the next index. */
const PART_END_RE = /^\s*(?:[IVX]+\.?\s*[–—-]\s*)?ACTA\s*$|^\s*(?:[IVX]+\.?\s*[–—-]\s*)?ACTA\s+(?:SACRARUM|SS\.)\s+CONGREGATION|^\s*INDEX\s+DOCUMENTORUM/;
/** `EPISTOLAE, 10-12, 89-91, 195 s.,` -- a heading in capitals, a comma, then pages. */
const HEADING_LINE_RE = /^\s*([A-Z][A-Z .'’]+?)\s*[,:]\s*(.*)$/;
/** A continuation line: pages only. */
const PAGES_LINE_RE = /^\s*[\d\s,.\-–s]+$/;

/**
 * The *Index generalis actorum* at the head of a volume's indexes: per category of the
 * pope's part, the pages the volume prints its acts at, as runs. The page is searched from
 * the volume's midpoint (the indexes sit in the tail). A run the line break splits
 * (`294-` / `307`) is joined before reading; `195 s.` (*et sequens*) is the page and the
 * next. Measured on AAS 13 (1921) p. 571.
 */
export function parseIndexGeneralis(pages: readonly string[]): IndexGeneralis {
  const start = pages.findIndex((t, i) => i >= Math.floor(pages.length / 2) && GENERALIS_RE.test(t));
  const runs = new Map<string, PageRun[]>();
  const unmapped: string[] = [];
  if (start < 0) return { page: null, runs, unmapped };
  // The part may run onto the next page; read until the pope part ends.
  const text = pages.slice(start, start + 3).join('\n');
  const lines = text.split('\n').map((l) => l.replace(/\s+$/, ''));
  let inPope = false;
  let heading: string | null = null;
  let buffer = '';
  const flush = () => {
    if (heading === null) return;
    const cat = categoryForHeading(heading);
    const id = cat?.id ?? heading;
    if (cat === null) unmapped.push(heading);
    runs.set(id, [...(runs.get(id) ?? []), ...readRuns(buffer)]);
    heading = null;
    buffer = '';
  };
  for (const line of lines) {
    if (!inPope) { if (/^\s*(?:[IVX]+\.?\s*[–—-]\s*)?ACTA\s+[A-Z]+\s+PP\./.test(line)) inPope = true; continue; }
    if (PART_END_RE.test(line)) { flush(); break; }
    const h = line.match(HEADING_LINE_RE);
    if (h && !PAGES_LINE_RE.test(line)) { flush(); heading = h[1]!.trim(); buffer = h[2]!; continue; }
    if (heading !== null && PAGES_LINE_RE.test(line)) buffer += ' ' + line.trim();
  }
  flush();
  return { page: start + 1, runs, unmapped };
}

/** `6-9,185-194,294- 307, 195 s., 553.` -> runs; a dangling `294-` joins the number after it. */
function readRuns(text: string): PageRun[] {
  const joined = text.replace(/(\d)\s*[-–]\s+(\d)/g, '$1-$2').replace(/\.\s*$/, '');
  const out: PageRun[] = [];
  for (const tok of joined.split(/\s*,\s*/)) {
    const t = tok.trim();
    if (t === '') continue;
    const range = t.match(/^(\d+)\s*[-–]\s*(\d+)$/);
    const seq = t.match(/^(\d+)\s*s\.?$/);
    const one = t.match(/^(\d+)$/);
    if (range) out.push([Number(range[1]), Number(range[2])]);
    else if (seq) out.push([Number(seq[1]), Number(seq[1]) + 1]);
    else if (one) out.push([Number(one[1]), Number(one[1])]);
    // Anything else (`iv, v`, an OCR fragment) is skipped: a run that cannot be read constrains nothing.
  }
  return out;
}
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run tools/test/acta-recover.test.ts`
Expected: PASS. If `Sermo` maps to a different id than `Sermones` in `categories.ts`, adjust the expectation to the table's id (`grep -n "'SERMO'" tools/src/acta/categories.ts`).

- [ ] **Step 5: Commit**

```bash
git add tools/src/acta/recover.ts tools/test/acta-recover.test.ts
git commit -m "recover.ts: the pageless key and the Index generalis actorum's page runs per category"
```

---

### Task 4: `recover.ts` — the Latin dating formula

**Files:**
- Modify: `tools/src/acta/recover.ts`
- Test: `tools/test/acta-recover.test.ts`

**Interfaces:**
- Produces: `latinDate(text: string): string | null` (ISO `YYYY-MM-DD` from a `Datum Romae …` formula); `formulaNear(pages, from, upto): { page: number; date: string; text: string } | null`.

- [ ] **Step 1: Write the failing tests**

Append to `tools/test/acta-recover.test.ts` (add `latinDate, formulaNear` to the import):

```ts
describe('latinDate', () => {
  it('reads the day in roman numerals, the year in roman numerals (MDCCCC and MCM)', () => {
    expect(latinDate('Datum Romae apud Sanctum Petrum, sub anulo Piscatoris, die xxx mensis Martii anno MDCCCCXXX, Pontificatus Nostri nono.')).toBe('1930-03-30');
    expect(latinDate('Datum Romae apud Sanctum Petrum die xx mensis Aprilis, in festo Paschae Resurrectionis D. N. I. C, anno MDCCCCXXX, Pontificatus Nostri nono.')).toBe('1930-04-20');
    expect(latinDate('Datum Romae, apud S. Petrum, die xii mensis Augusti, anno MCMXXI, Pontificatus Nostri septimo.')).toBe('1921-08-12');
  });
  it('reads the day and the year as ordinal words, in either order, with the OCR\'s misreadings of the words', () => {
    expect(latinDate('Datum Romae apud Sanctum Petrum, anno Domini millesimo nongentesimo ac trigesimo, die decimatertia mensis Augusti, Pontificatus Nostri anno nono.')).toBe('1930-08-13');
    expect(latinDate('Datum Romae, apud Sanctum Petrum, anno Domini nnllesimo nongentesimo trigesimo, die duodecima mensis Februarii, Pontificatus Nostri anno nono.')).toBe('1930-02-12');
    expect(latinDate('Datum Romae apud S. Petrum, anno Domini millesimo nongentesimo trigesimo, die trigesima prima mensis Ianuarii, Pontificatus Nostri anno octavo.')).toBe('1930-01-31');
    expect(latinDate('Datum Eomae, apud Sanctum Petrum, anno Domini millesimo nongentesimo vigesimo octavo die decimanona mensis Maii, Pontificatus Nostri anno septimo.')).toBe('1928-05-19');
  });
  it('reads arabic numerals, and returns null for text without a formula', () => {
    expect(latinDate('Datum Romae, ex aedibus Sacrae Congregationis Consistorialis, die 23 Aprilis 1930.')).toBe('1930-04-23');
    expect(latinDate('Datum Romae apud Sanctum Petrum, die 6 mensis Aprilis anno 1930, Pontificatus Nostri nono.')).toBe('1930-04-06');
    expect(latinDate('Ad perpetuam rei memoriam. — Quo maiori rerum fidei incremento')).toBeNull();
    expect(latinDate('Datum Romae apud Sanctum Petrum, die festo, Pontificatus Nostri nono.')).toBeNull();
  });
});

describe('formulaNear', () => {
  it('finds the first formula on or after a page, up to a limit, and says which page', () => {
    const pages = ['', 'opening of the act', 'more text', 'ends. Datum Romae apud Sanctum Petrum, die xxx mensis Martii anno MDCCCCXXX, Pontificatus Nostri nono. E. CARD. PACELLI', 'Datum Romae die i mensis Ianuarii anno MDCCCCXXXI'];
    expect(formulaNear(pages, 2, 4)).toMatchObject({ page: 4, date: '1930-03-30' });
    expect(formulaNear(pages, 5, 5)).toMatchObject({ page: 5, date: '1931-01-01' });
    expect(formulaNear(pages, 1, 3)).toBeNull();
  });
});
```

- [ ] **Step 2: Run to see them fail**

Run: `npx vitest run tools/test/acta-recover.test.ts -t 'latinDate|formulaNear'`
Expected: FAIL — not exported.

- [ ] **Step 3: Implement**

Append to `tools/src/acta/recover.ts`:

```ts
const MONTHS: Record<string, number> = {
  ianuarii: 1, februarii: 2, martii: 3, aprilis: 4, maii: 5, iunii: 6, iulii: 7, augusti: 8, septembris: 9, octobris: 10, novembris: 11, decembris: 12,
};
const UNITS: Record<string, number> = {
  prima: 1, primo: 1, secunda: 2, secundo: 2, altera: 2, tertia: 3, tertio: 3, quarta: 4, quarto: 4, quinta: 5, quinto: 5,
  sexta: 6, sexto: 6, septima: 7, septimo: 7, octava: 8, octavo: 8, nona: 9, nono: 9,
};
const TENS: Record<string, number> = { decima: 10, decimo: 10, vigesima: 20, vigesimo: 20, vicesima: 20, vicesimo: 20, trigesima: 30, trigesimo: 30 };
const TEENS: Record<string, number> = { undecima: 11, duodecima: 12, undecimo: 11, duodecimo: 12 };
const ROMAN: Record<string, number> = { i: 1, v: 5, x: 10, l: 50, c: 100, d: 500, m: 1000 };

/** A roman numeral in either case (`MDCCCCXXX`, `xxx`, `xn` is not one); null when a character is not a numeral. */
function roman(s: string): number | null {
  const u = s.toLowerCase();
  let total = 0;
  for (let i = 0; i < u.length; i++) {
    const v = ROMAN[u[i]!];
    if (v === undefined) return null;
    const next = ROMAN[u[i + 1] ?? ''] ?? 0;
    total += v < next ? -v : v;
  }
  return total > 0 ? total : null;
}

/** `decimatertia`, `decima tertia`, `trigesima prima`, `duodecima`, `nona` -> a day number. */
function ordinalDay(words: string[]): number | null {
  const w = words.join(' ').replace(/(decima|vigesima|vicesima|trigesima)(prima|secunda|tertia|quarta|quinta|sexta|septima|octava|nona)/g, '$1 $2').split(/\s+/);
  let n = 0;
  for (const x of w) {
    if (TEENS[x] !== undefined) n += TEENS[x]!;
    else if (TENS[x] !== undefined) n += TENS[x]!;
    else if (UNITS[x] !== undefined) n += UNITS[x]!;
    else return null;
  }
  return n >= 1 && n <= 31 ? n : null;
}

/** `millesimo nongentesimo [ac] trigesimo [primo]` (the OCR's `nnllesimo`, `noningentesimo`) -> a year. */
function ordinalYear(text: string): number | null {
  const m = text.match(/m\w{1,3}lesimo\s+non\w*gentesimo(?:\s+ac)?(?:\s+(decimo|vigesimo|vicesimo|trigesimo|quadragesimo))?(?:\s+(primo|secundo|tertio|quarto|quinto|sexto|septimo|octavo|nono))?/);
  if (!m) return null;
  const tens: Record<string, number> = { decimo: 10, vigesimo: 20, vicesimo: 20, trigesimo: 30, quadragesimo: 40 };
  return 1900 + (m[1] ? tens[m[1]]! : 0) + (m[2] ? UNITS[m[2]]! : 0);
}

/**
 * The date of an act from its own dating formula: `Datum Romae apud Sanctum Petrum, die
 * xxx mensis Martii anno MDCCCCXXX, Pontificatus Nostri nono` -- the day in roman
 * numerals, arabic numerals or ordinal words (`decimatertia`, `trigesima prima`), the
 * month in the genitive, the year in roman numerals, arabic numerals or ordinal words
 * (`millesimo nongentesimo ac trigesimo`), which the constitutions set before the day. The
 * OCR reads `Eomae`, `Bomae`, `nnllesimo`; the anchor admits them. Null when the text has
 * no formula, or the formula no readable day, month or year.
 */
export function latinDate(text: string): string | null {
  const t = text.replace(/­/g, '').replace(/\s+/g, ' ');
  const anchor = t.search(/Datum [REB]omae/);
  if (anchor < 0) return null;
  const f = t.slice(anchor, anchor + 260).toLowerCase();
  const dm = f.match(/\bdie\s+([a-z0-9]+(?:\s+(?:prima|secunda|tertia|quarta|quinta|sexta|septima|octava|nona))?)\s+(?:mensis\s+)?([a-z]+)/);
  if (!dm) return null;
  const month = MONTHS[dm[2]!];
  if (month === undefined) return null;
  const dayTok = dm[1]!;
  const day = /^\d+$/.test(dayTok) ? Number(dayTok) : (roman(dayTok) ?? ordinalDay(dayTok.split(/\s+/)));
  if (day === null || day < 1 || day > 31) return null;
  const ym = f.match(/\banno\s+(?:domini\s+)?(?:(\d{4})|([mdclxvi]{4,}))/) ;
  const year = ym ? (ym[1] ? Number(ym[1]) : roman(ym[2]!)) : ordinalYear(f);
  if (year === null || year < 1800 || year > 2100) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${year}-${pad(month)}-${pad(day)}`;
}

/** The first dating formula on pages `from`..`upto` (1-based, inclusive) of the volume text, with its page and text. */
export function formulaNear(pages: readonly string[], from: number, upto: number): { page: number; date: string; text: string } | null {
  for (let p = from; p <= Math.min(upto, pages.length); p++) {
    const t = pages[p - 1]!;
    const m = t.replace(/­/g, '').replace(/\s+/g, ' ').match(/Datum [REB]omae[^]{0,260}/);
    if (!m) continue;
    const date = latinDate(m[0]);
    if (date !== null) return { page: p, date, text: m[0].slice(0, 200) };
  }
  return null;
}
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run tools/test/acta-recover.test.ts`
Expected: PASS. If `1921-08-12` fails because `MCMXXI` is read wrongly, check `roman` handles subtractive `CM` (it does: c < m → −100).

- [ ] **Step 5: Commit**

```bash
git add tools/src/acta/recover.ts tools/test/acta-recover.test.ts
git commit -m "recover.ts: the act's date from its Latin dating formula, in numerals or ordinal words"
```

---

### Task 5: `recover.ts` — the incipit search and the recovery rules

**Files:**
- Modify: `tools/src/acta/recover.ts`
- Test: `tools/test/acta-recover.test.ts`

**Interfaces:**
- Produces:

```ts
export interface RecoveredRow { key: string; date: string; category: string; incipit: string; page: number; rule: 'unique' | 'dated' | 'fuzzy'; bodyLine: string; header: string; formula?: string }
export interface UnrecoveredRow { key: string; date: string; category: string; incipit: string | null; reason: 'no-incipit' | 'none' | 'several' | 'outside-runs' | 'header-mismatch'; candidates?: number[] }
export interface PagesSidecar { source: string; generated: string; text: string; rows: RecoveredRow[]; unrecovered: UnrecoveredRow[] }
export function findIncipit(page: string, incipit: string, fuzzy: boolean): { line: string } | null
export function recoverPages(pageless: readonly PagelessEntry[], pages: readonly string[], generalis: IndexGeneralis, opts: { lastBodyPage: number }): { rows: RecoveredRow[]; unrecovered: UnrecoveredRow[] }
```

- [ ] **Step 1: Write the failing tests**

Append to `tools/test/acta-recover.test.ts` (extend the import with `findIncipit, recoverPages`):

```ts
const HEADER = (n: number) => `${n} Acta Apostolicae Sedis - Commentarium Officiale`;
const BODY: string[] = [
  /* 1 */ 'Annus XIII - Vol. XIII 24 Ianuarii 1921 Num. 1 \nACTA APOSTOLICAE SEDIS \nEPISTOLA ENCYCLICA \nSacra propediem celebrari sollemnia, cum septingenti \nerunt anni',
  /* 2 */ `${HEADER(2)} \ntext of the encyclical, which mentions sacra propediem again in passing`,
  /* 3 */ `${HEADER(3)} \nLITTERAE APOSTOLICAE \nI \nPIUS PP. XI \nAd futuram rei memoriam. — Constat apprime quam sit \nDatum Romae apud Sanctum Petrum, die v mensis Martii anno MDCCCCXXI, Pontificatus Nostri septimo.`,
  /* 4 */ `Acta Benedicti PP. XV 4 \nII \nAd futuram rei memoriam. — Constat apprime alia res \nDatum Romae apud Sanctum Petrum, die xx mensis Maii anno MDCCCCXXI, Pontificatus Nostri septimo.`,
  /* 5 */ `${HEADER(5)} \nIII \nAd perpetuam rei memoriam. — Quae catholico nomini bene \nDatum Romae, die i mensis Iunii anno MDCCCCXXI.`,
  /* 6 */ `${HEADER(6)} \nEPISTOLAE \nDilecte fili. — Quoniam annus mox celebrabitur`,
  /* 7 */ `${HEADER(7)} \nIV \nAd futuram rei memoriam. — Placet oculis Nostris \nDatum Romae die ii mensis Iulii anno MDCCCCXXI.`,
  /* 8 */ 'INDEX GENERALIS ACTORUM \nI. - ACTA BENEDICTI PP. XV \nEPISTOLAE ENCYCLICAE, 1. \nLITTERAE APOSTOLICAE, 3-5, 7. \nEPISTOLAE, 6. \nII. - ACTA SACRARUM CONGREGATIONUM',
];
const entry = (date: string, category: string, incipit: string | null, description = 'Ad aliquem'): import('../src/acta/index.js').PagelessEntry =>
  ({ series: 'AAS', volume: 13, year: 1921, pope: 'Benedictus XV', category, date, incipit, quoted: false, toponym: null, description, raw: '' });

describe('findIncipit', () => {
  it('finds an incipit at the head of a paragraph -- after the salutation dash or at a line start -- and not inside running text', () => {
    expect(findIncipit(BODY[0]!, 'Sacra propediem', false)).toMatchObject({ line: 'Sacra propediem celebrari sollemnia, cum septingenti' });
    expect(findIncipit(BODY[1]!, 'Sacra propediem', false)).toBeNull();
    expect(findIncipit(BODY[2]!, 'Constat apprime', false)).toMatchObject({ line: 'Ad futuram rei memoriam. — Constat apprime quam sit' });
  });
  it('folds case, diacritics and soft hyphens, and joins a word the line break split', () => {
    expect(findIncipit('Ad perpetuam rei memoriam. — Quæ cathólico no­\nmini bene', 'Quae catholico nomini', false)).not.toBeNull();
    expect(findIncipit('Ad perpetuam rei memoriam. — Quo maio-\nri rerum fidei', 'Quo maiori rerum', false)).not.toBeNull();
  });
  it('in fuzzy mode admits one wrong character per word of five letters or more, and nothing in a shorter word', () => {
    expect(findIncipit(BODY[6]!, 'Placet oculog', false)).toBeNull();
    expect(findIncipit(BODY[6]!, 'Placet oculog', true)).toMatchObject({ line: 'Ad futuram rei memoriam. — Placet oculis Nostris' });
    expect(findIncipit(BODY[6]!, 'Placet oculogg', true)).toBeNull();
    expect(findIncipit(BODY[6]!, 'Plaset oculis', true)).not.toBeNull();
    expect(findIncipit(BODY[6]!, 'Pl oculis', true)).toBeNull();
  });
});

describe('recoverPages', () => {
  const generalis = parseIndexGeneralis(BODY);
  it('accepts a unique hit within the category\'s runs, quoting the body line and the running header', () => {
    const { rows, unrecovered } = recoverPages([entry('1921-01-06', 'LITTERAE ENCYCLICAE', 'Sacra propediem')], BODY, generalis, { lastBodyPage: 7 });
    expect(unrecovered).toEqual([]);
    expect(rows).toEqual([expect.objectContaining({ page: 1, rule: 'unique', incipit: 'Sacra propediem', header: 'Annus XIII - Vol. XIII 24 Ianuarii 1921 Num. 1', bodyLine: 'Sacra propediem celebrari sollemnia, cum septingenti' })]);
  });
  it('settles two acts of one incipit by the dating formula, and reports the one whose date no formula gives', () => {
    const { rows, unrecovered } = recoverPages([
      entry('1921-03-05', 'LITTERAE APOSTOLICAE', 'Constat apprime', 'First'),
      entry('1921-05-20', 'LITTERAE APOSTOLICAE', 'Constat apprime', 'Second'),
      entry('1921-09-09', 'LITTERAE APOSTOLICAE', 'Constat apprime', 'Third'),
    ], BODY, generalis, { lastBodyPage: 7 });
    expect(rows.map((r) => [r.page, r.rule, r.formula?.slice(0, 11)])).toEqual([[3, 'dated', 'Datum Romae'], [4, 'dated', 'Datum Romae']]);
    expect(unrecovered).toEqual([expect.objectContaining({ reason: 'several', candidates: [3, 4] })]);
  });
  it('retries a missed incipit fuzzily, accepts a unique fuzzy hit, and reports a miss', () => {
    const { rows, unrecovered } = recoverPages([entry('1921-07-02', 'LITTERAE APOSTOLICAE', 'Placet oculog'), entry('1921-07-03', 'LITTERAE APOSTOLICAE', 'Nihil tale')], BODY, generalis, { lastBodyPage: 7 });
    expect(rows).toEqual([expect.objectContaining({ page: 7, rule: 'fuzzy' })]);
    expect(unrecovered).toEqual([expect.objectContaining({ incipit: 'Nihil tale', reason: 'none' })]);
  });
  it('reports a hit outside every run of the category, an entry without an incipit, and a page whose header disagrees', () => {
    const { rows, unrecovered } = recoverPages([
      entry('1921-06-01', 'EPISTOLAE', 'Quae catholico nomini'),   // on p. 5, a Litterae Apostolicae page; Epistolae run is 6
      entry('1921-06-06', 'EPISTOLAE', null),
    ], BODY, generalis, { lastBodyPage: 7 });
    expect(rows).toEqual([]);
    expect(unrecovered.map((u) => u.reason)).toEqual(['outside-runs', 'no-incipit']);
    const bad = BODY.map((p, i) => (i === 4 ? p.replace(HEADER(5), HEADER(9)) : p));
    const r2 = recoverPages([entry('1921-06-01', 'LITTERAE APOSTOLICAE', 'Quae catholico nomini')], bad, parseIndexGeneralis(bad), { lastBodyPage: 7 });
    expect(r2.unrecovered).toEqual([expect.objectContaining({ reason: 'header-mismatch', candidates: [5] })]);
  });
  it('searches the whole pope part, and requires the dating formula, when the Index generalis has no run for the category', () => {
    const noRuns = { page: null, runs: new Map<string, [number, number][]>(), unmapped: [] as string[] };
    const { rows, unrecovered } = recoverPages([entry('1921-06-01', 'LITTERAE APOSTOLICAE', 'Quae catholico nomini'), entry('1921-01-06', 'LITTERAE ENCYCLICAE', 'Sacra propediem')], BODY, noRuns, { lastBodyPage: 7 });
    expect(rows).toEqual([expect.objectContaining({ page: 5, rule: 'dated' })]);
    expect(unrecovered).toEqual([expect.objectContaining({ incipit: 'Sacra propediem', reason: 'several', candidates: [1] })]);
  });
});
```

- [ ] **Step 2: Run to see them fail**

Run: `npx vitest run tools/test/acta-recover.test.ts -t 'findIncipit|recoverPages'`
Expected: FAIL — not exported.

- [ ] **Step 3: Implement**

Append to `tools/src/acta/recover.ts`:

```ts
export interface RecoveredRow {
  key: string; date: string; category: string; incipit: string;
  page: number;
  /** What accepted the page: the only hit in the runs; the hit whose dating formula gives the entry's date; the only fuzzy hit. */
  rule: 'unique' | 'dated' | 'fuzzy';
  /** The body line the incipit opens, as the text prints it. */
  bodyLine: string;
  /** The page's first line (its running header, or the fascicle cover's title line). */
  header: string;
  /** The dating formula that settled a tie, quoted. */
  formula?: string;
}
export interface UnrecoveredRow {
  key: string; date: string; category: string; incipit: string | null;
  reason: 'no-incipit' | 'none' | 'several' | 'outside-runs' | 'header-mismatch';
  /** The pages the incipit was found on, where there were any. */
  candidates?: number[];
}
export interface PagesSidecar {
  /** The source key (`1921`, `1917-I`). */
  source: string;
  generated: string;
  /** The store file the body was read from, with its page count. */
  text: string;
  rows: RecoveredRow[];
  unrecovered: UnrecoveredRow[];
}

/** Lower case, diacritics folded, soft hyphens dropped, a word the line break split joined, spaces collapsed (newlines kept). */
function fold(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/æ/g, 'ae').replace(/œ/g, 'oe')
    .replace(/­\s*\n\s*/g, '').replace(/([a-z])-\s*\n\s*([a-z])/gi, '$1$2')
    .toLowerCase().replace(/[ \t]+/g, ' ');
}

const WORD = /[a-z]+/g;

/** Levenshtein distance capped at 2. */
function dist(a: string, b: string): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > 1) return 2;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let left = i;
    let diag = prev[0]!;
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cur = Math.min(prev[j]! + 1, left + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = prev[j]!; prev[j] = cur; left = cur;
    }
  }
  return Math.min(prev[b.length]!, 2);
}

/**
 * Whether the page opens an act with the incipit: the incipit's words in order, at the
 * head of a paragraph -- the start of a line, or after the salutation's dash or a full
 * stop (`Ad perpetuam rei memoriam. — Quo maiori rerum`) -- and not inside running text.
 * Exact by default; `fuzzy` admits one differing character per word of five letters or
 * more (the OCR's `e`/`c`, `o`/`a`, `t`/`l`), nothing in a shorter word.
 */
export function findIncipit(page: string, incipit: string, fuzzy: boolean): { line: string } | null {
  const want = fold(incipit).match(WORD) ?? [];
  if (want.length === 0) return null;
  const folded = fold(page);
  const lines = folded.split('\n');
  const rawLines = page.replace(/­\s*\n\s*/g, '').split('\n');
  for (let li = 0; li < lines.length; li++) {
    const line = lines[li]!;
    // Candidate heads: the line start, and each position after `— `, `. `, `: `.
    const heads = [0, ...[...line.matchAll(/(?:—|\.|:)\s+/g)].map((m) => m.index! + m[0].length)];
    for (const h of heads) {
      const tail = line.slice(h) + ' ' + (lines[li + 1] ?? '');
      const got = [...tail.matchAll(WORD)].slice(0, want.length).map((m) => m[0]);
      if (got.length < want.length) continue;
      const ok = want.every((w, i) => w === got[i] || (fuzzy && w.length >= 5 && got[i]!.length >= 5 && dist(w, got[i]!) <= 1));
      if (ok) return { line: (rawLines[li] ?? line).trim() };
    }
  }
  return null;
}

/** The page's first non-blank line: `574 Index documentorum`, `Acta Pii PP. XI 483`, `Annus XXII - Vol. XXII 1 Maii 1930 Num. 5`. */
const headerOf = (page: string): string => (page.split('\n').find((l) => l.trim() !== '') ?? '').trim();
/** Whether the header prints the page's own number (a fascicle cover prints none and is admitted). */
const headerAgrees = (header: string, n: number): boolean => /\bNum\.\s*\d/.test(header) || new RegExp(`(^|\\s)${n}(\\s|$)`).test(header);

const inRuns = (runs: PageRun[] | undefined, p: number): boolean =>
  runs === undefined || runs.some(([a, b]) => p >= a - 1 && p <= b + 1);

/**
 * The recovery (spec §10.3.2). For each pageless entry with an incipit: the pages of the
 * pope's part (1..lastBodyPage) that open an act with it, within the category's runs from
 * the Index generalis (±1 page, for the runs' own OCR). One hit is accepted (`unique`);
 * several are settled by the dating formula on and after each hit (`dated`), the one
 * whose date is the entry's; none is retried fuzzily (`fuzzy`, unique only). A category
 * the Index generalis has no run for is searched over the whole part and accepted only
 * when the formula confirms the date. A hit whose running header prints another number
 * is not a page (`header-mismatch`). Anything else is reported with its reason.
 */
export function recoverPages(pageless: readonly PagelessEntry[], pages: readonly string[], generalis: IndexGeneralis, opts: { lastBodyPage: number }): { rows: RecoveredRow[]; unrecovered: UnrecoveredRow[] } {
  const rows: RecoveredRow[] = [];
  const unrecovered: UnrecoveredRow[] = [];
  const last = Math.min(opts.lastBodyPage, pages.length);
  for (const e of pageless) {
    const key = pagelessKey(e);
    const base = { key, date: e.date, category: e.category, incipit: e.incipit };
    if (e.incipit === null) { unrecovered.push({ ...base, reason: 'no-incipit' }); continue; }
    const cat = categoryForHeading(e.category)?.id ?? e.category;
    const runs = generalis.runs.get(cat);
    const hits = (fuzzy: boolean) => {
      const all: { page: number; line: string }[] = [];
      for (let p = 1; p <= last; p++) {
        const f = findIncipit(pages[p - 1]!, e.incipit!, fuzzy);
        if (f) all.push({ page: p, line: f.line });
      }
      return all;
    };
    const decide = (all: { page: number; line: string }[], rule: 'unique' | 'fuzzy'): boolean => {
      if (all.length === 0) return false;
      const inside = all.filter((h) => inRuns(runs, h.page));
      if (inside.length === 0) { unrecovered.push({ ...base, reason: 'outside-runs', candidates: all.map((h) => h.page) }); return true; }
      const accept = (h: { page: number; line: string }, r: RecoveredRow['rule'], formula?: string) => {
        const header = headerOf(pages[h.page - 1]!);
        if (!headerAgrees(header, h.page)) { unrecovered.push({ ...base, reason: 'header-mismatch', candidates: [h.page] }); return; }
        rows.push({ ...base, incipit: e.incipit!, page: h.page, rule: r, bodyLine: h.line, header, ...(formula ? { formula } : {}) });
      };
      if (inside.length === 1 && runs !== undefined) { accept(inside[0]!, rule); return true; }
      // Several hits, or no runs to constrain them: the act's own dating formula decides.
      const dated = inside.filter((h) => {
        const next = inside.find((o) => o.page > h.page)?.page;
        return formulaNear(pages, h.page, Math.min(next !== undefined ? next : last, h.page + 40))?.date === e.date;
      });
      if (dated.length === 1) {
        const h = dated[0]!;
        const next = inside.find((o) => o.page > h.page)?.page;
        accept(h, 'dated', formulaNear(pages, h.page, Math.min(next !== undefined ? next : last, h.page + 40))!.text);
      } else {
        unrecovered.push({ ...base, reason: 'several', candidates: inside.map((h) => h.page) });
      }
      return true;
    };
    if (decide(hits(false), 'unique')) continue;
    if (decide(hits(true), 'fuzzy')) continue;
    unrecovered.push({ ...base, reason: 'none' });
  }
  return { rows, unrecovered };
}
```

Note for the implementer: in `decide`, when `runs === undefined` and the (single) hit's formula does not give the entry's date, the entry is reported `several` with one candidate — that is what the last test expects (`candidates: [1]`); the reason name is kept, the candidates say what was seen.

- [ ] **Step 4: Run the tests**

Run: `npx vitest run tools/test/acta-recover.test.ts`
Expected: PASS. Debug tips: `fold` keeps `\n` so `findIncipit` can look at line heads; `headerAgrees` must see `Acta Benedicti PP. XV 4` as page 4 (`(^|\s)4(\s|$)`).

- [ ] **Step 5: Commit**

```bash
git add tools/src/acta/recover.ts tools/test/acta-recover.test.ts
git commit -m "recover.ts: the incipit search at the head of a paragraph and the unique / dated / fuzzy rules"
```

---

### Task 6: The recovery tool, and the seventeen sidecars

**Files:**
- Create: `tools/recover-acta-pages.ts`
- Create: `tools/fixtures/acta/aas-{vol}-{year}[-I].pages.json` × 17
- Modify: `tools/fixtures/acta/README.md`, `package.json` (a `recover` script)

**Interfaces:**
- Consumes: `parseActaIndex`, `ACTA_SOURCES`/`actaSource` (join.ts), `parseIndexGeneralis`, `recoverPages`, `PagesSidecar`.
- Produces: the sidecar files; `sidecarPath(source: ActaSource): string` exported from `recover.ts` (`source.file.replace(/\.txt$/, '.pages.json')`).

- [ ] **Step 1: Add `sidecarPath` to `recover.ts`**

```ts
import type { ActaSource } from './join.js';
/** The sidecar beside a source's fixture: `tools/fixtures/acta/aas-13-1921.pages.json`. */
export const sidecarPath = (source: Pick<ActaSource, 'file'>): string => source.file.replace(/\.txt$/, '.pages.json');
```

(If importing `join.ts` from `recover.ts` creates a cycle once Task 7 imports `recover.ts` from `join.ts`, type-only imports are fine in TypeScript; keep `import type`.)

- [ ] **Step 2: Write the CLI**

Create `tools/recover-acta-pages.ts`:

```ts
/**
 * Write the page sidecar of a volume whose chronological-index OCR lost the page column
 * (acta volumes spec §10.3; phase 2b-iii-b): parse the fixture, read the whole-volume text
 * from the local store (tools/fetch-acta.sh text <year>), recover each pageless entry's
 * page from the body (tools/src/acta/recover.ts) and write
 * tools/fixtures/acta/aas-{vol}-{year}[-{part}].pages.json, sorted by key, with every
 * recovered page's evidence and every unrecovered entry's reason. Deterministic for a
 * given fixture and text; re-run after either changes.
 *
 * Usage: npx tsx tools/recover-acta-pages.ts 1921
 *        npx tsx tools/recover-acta-pages.ts 1917-I
 *        npx tsx tools/recover-acta-pages.ts 1909-1925      # every volume source in the range
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { parseActaIndex } from './src/acta/index.js';
import { ACTA_SOURCES, actaSource, type ActaSource } from './src/acta/join.js';
import { parseIndexGeneralis, recoverPages, sidecarPath, type PagesSidecar } from './src/acta/recover.js';

const STORE = `${process.env['ACTA_SOURCES'] ?? `${homedir()}/development/sources/AAS`}/txt`;
const textPath = (s: ActaSource) => `${STORE}/aas-${String(s.volume).padStart(2, '0')}-${s.year}${s.part ? `-${s.part}` : ''}.txt`;

const arg = process.argv[2];
if (!arg) throw new Error('usage: recover-acta-pages.ts <source key | from-to>');
const range = arg.match(/^(\d{4})-(\d{4})$/);
const sources = range
  ? ACTA_SOURCES.filter((s) => s.kind === 'volume' && s.year >= Number(range[1]) && s.year <= Number(range[2]))
  : [actaSource(arg) ?? (() => { throw new Error(`unknown source ${arg}`); })()];

const today = new Date().toISOString().slice(0, 10);
for (const s of sources) {
  const text = textPath(s);
  if (!existsSync(text)) { console.error(`${s.key}: no volume text at ${text} (run tools/fetch-acta.sh text ${s.year})`); continue; }
  const pages = readFileSync(text, 'utf8').split('\f');
  const parsed = parseActaIndex(readFileSync(s.file, 'utf8'), { year: s.year, volume: s.volume, ...(s.part ? { part: s.part } : {}), ...s.parse });
  const generalis = parseIndexGeneralis(pages);
  // The pope's part precedes the indexes; the chronological index's first page bounds it.
  const indexStart = pages.findIndex((t, i) => i >= Math.floor(pages.length / 2) && /CHRONOLOGIC\w*\s+ORDINE\s+DIGEST/.test(t));
  const lastBodyPage = (generalis.page ?? (indexStart >= 0 ? indexStart + 1 : pages.length)) - 1;
  const { rows, unrecovered } = recoverPages(parsed.pageless, pages, generalis, { lastBodyPage });
  const byKey = (a: { key: string }, b: { key: string }) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0);
  const sidecar: PagesSidecar = {
    source: s.key, generated: today, text: `${text.replace(`${homedir()}`, '~')} (${pages.length} pages)`,
    rows: rows.sort(byKey), unrecovered: unrecovered.sort(byKey),
  };
  writeFileSync(sidecarPath(s), JSON.stringify(sidecar, null, 2) + '\n');
  const by = (k: string) => rows.filter((r) => r.rule === k).length;
  const why = (k: string) => unrecovered.filter((u) => u.reason === k).length;
  console.log(`${s.key}: ${parsed.pageless.length} without a page -> recovered ${rows.length} (unique ${by('unique')}, dated ${by('dated')}, fuzzy ${by('fuzzy')}); `
    + `unrecovered ${unrecovered.length} (none ${why('none')}, several ${why('several')}, outside-runs ${why('outside-runs')}, header-mismatch ${why('header-mismatch')}, no-incipit ${why('no-incipit')}); `
    + `Index generalis ${generalis.page === null ? 'not found' : `p. ${generalis.page}, ${generalis.runs.size} categories`}${generalis.unmapped.length ? `, unmapped: ${generalis.unmapped.join('; ')}` : ''}`);
}
```

Add to `package.json` scripts: `"recover": "tsx tools/recover-acta-pages.ts"`.

- [ ] **Step 3: Run it on 1921 and read the result against the spike**

Run: `npm run recover -- 1921`
Expected: a summary line; the spike (spec §10.2) recovered 40 of 79 harvested-category entries naively, so `recovered` should be ≥ 40 and `unrecovered` list `several` for *Constat apprime* ×3 only if the formulae were not found. Open `tools/fixtures/acta/aas-13-1921.pages.json` and check three rows by hand against the store text (`sed -n` the page): *Sacra propediem* → 33 (rule `unique`, header `Annus XIII - Vol. XIII 24 Ianuarii 1921 Num. 2`), *In praeclara summorum* → 209, *Quo maiori* → 489.

If a class of failure is systematic (e.g. every constitution missed because the body sets `PIUS EPISCOPUS SERVUS SERVORUM DEI` between the heading and the incipit, or the incipit follows `AD PERPETUAM REI MEMORIAM` in capitals on its own line), fix `findIncipit`'s head detection with a unit test for that shape (Task 5's file), re-run. Do not loosen `fuzzy` beyond one character per word.

- [ ] **Step 4: Run over the seventeen, tabulate, commit**

Run: `npm run recover -- 1909-1925 | tee /tmp/recover.log`
Expected: seventeen summary lines (1917 as `1917-I`). Put the table (source → without a page / recovered by rule / unrecovered by reason) in the commit message. Any `unmapped` Index generalis heading that is a papal category (`MOTU PROPRIO`, `EPISTOLA ENCYCLICA`, …) gets a row or heading in `categories.ts` so its runs constrain the search; re-run.

Add to `tools/fixtures/acta/README.md`, after the fixtures table, a section:

```markdown
## The page sidecars (phase 2b-iii-b)

`aas-{vol}-{year}[-{part}].pages.json`, one per volume of 1909–1925, written by
`npm run recover -- <key>` from the fixture and the whole-volume text in the local store
(`tools/fetch-acta.sh text <year>`; acta volumes spec §10.3). Each `rows[]` entry names a
pageless entry by its key (`date|category|incipit|description head`), the page recovered,
the rule that accepted it (`unique`: the only hit within the category's runs of the *Index
generalis actorum*; `dated`: the hit whose dating formula gives the entry's date; `fuzzy`:
the only hit with one OCR character per word admitted), the body line and the running
header quoted, and the formula where one settled it. `unrecovered[]` lists the rest with a
reason. The join reads the sidecar and never the store; a row whose entry the parser no
longer opens is a hard error.
```

```bash
git add tools/recover-acta-pages.ts tools/fixtures/acta/*.pages.json tools/fixtures/acta/README.md tools/src/acta/recover.ts tools/src/acta/categories.ts package.json
git commit -m "Recover the pages of AAS 1-17 from the volume bodies into per-volume sidecars"
```

---

### Task 7: The join reads the sidecars and the curated readings

**Files:**
- Modify: `tools/src/acta/recover.ts` (`applyPageRows`), `tools/src/acta/join.ts` (`loadActaIndexes`), `tools/src/acta/curation.ts` (`ACTA_PAGE_READINGS`)
- Test: `tools/test/acta-recover.test.ts`, `tools/test/acta-join.test.ts` (new)

**Interfaces:**
- Produces: `applyPageRows(result: ActaParseResult, rows: readonly { key: string; page: number; source: 'recovered' | 'reading' }[], label: string): number` (entries moved from `pageless` to `entries`, throws on a stale key); `ACTA_PAGE_READINGS: Readonly<Record<string, PageReading>>` with `PageReading { page: number; indexLine: string; evidence: string }`, keyed by `${sourceKey}|${pagelessKey}`.

- [ ] **Step 1: Write the failing tests**

Append to `tools/test/acta-recover.test.ts` (import `applyPageRows`; also `parseActaIndex` from `../src/acta/index.js`):

```ts
describe('applyPageRows', () => {
  const parse = () => parseActaIndex(`                                  H

                             INDEX DOCUMENTORUM
               CHRONOLOGICO ORDINE DIGESTUS

                                  I. - ACTA BENEDICTI PP. XV

                                                         I. - LITTERAE ENCYCLICAE.
1921          Ian.          6      Sacra propediem. - Ad Patriarchas, Primates
             Apr.         30       In praeclara summorum. - Dilectis filiis 209
`, { year: 1921, volume: 13, columnar: true });
  it('moves a pageless entry to the entries with the page and its source, in date order, and counts it', () => {
    const r = parse();
    const n = applyPageRows(r, [{ key: '1921-01-06|LITTERAE ENCYCLICAE|Sacra propediem|Ad Patriarchas, Primates', page: 33, source: 'recovered' }], 'test');
    expect(n).toBe(1);
    expect(r.pageless).toEqual([]);
    expect(r.entries.map((e) => [e.incipit, e.page, e.pageSource])).toEqual([['Sacra propediem', 33, 'recovered'], ['In praeclara summorum', 209, undefined]]);
    expect(r.stats.recovered).toBe(1);
  });
  it('refuses a row whose entry the parser no longer opens', () => {
    expect(() => applyPageRows(parse(), [{ key: '1921-01-06|LITTERAE ENCYCLICAE|Sacra propediem|Something else', page: 33, source: 'recovered' }], 'aas-13-1921.pages.json'))
      .toThrow(/stale page row .* aas-13-1921\.pages\.json/);
  });
});
```

Create `tools/test/acta-join.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { loadActaIndexes, actaSource } from '../src/acta/join.js';
import { ACTA_PAGE_READINGS } from '../src/acta/curation.js';

describe('loadActaIndexes with the sidecars (spec §10.3)', () => {
  it('applies every sidecar of 1909-1925: no row is stale, and every recovered entry carries its source', () => {
    const { parsed } = loadActaIndexes();
    for (const year of [1909, 1910, 1911, 1912, 1913, 1914, 1915, 1916, 1918, 1919, 1920, 1921, 1922, 1923, 1924, 1925]) {
      const r = parsed.get(String(year))!;
      expect(r, String(year)).toBeDefined();
      expect(r.stats.recovered, String(year)).toBeGreaterThan(0);
      for (const e of r.entries.filter((e) => e.pageSource !== undefined)) expect(e.page, e.incipit ?? e.raw).toBeGreaterThan(0);
    }
    expect(parsed.get('1917-I')!.stats.recovered).toBeGreaterThan(0);
  });
  it('keys every curated reading to a source that exists and applies it as `reading`', () => {
    const { parsed } = loadActaIndexes();
    for (const key of Object.keys(ACTA_PAGE_READINGS)) {
      const [source] = key.split('|');
      expect(actaSource(source!), key).toBeDefined();
      expect(parsed.get(source!)!.entries.some((e) => e.pageSource === 'reading'), key).toBe(true);
    }
  });
});
```

(The second test passes vacuously while the table is empty; Task 9 fills it.)

- [ ] **Step 2: Run to see them fail**

Run: `npx vitest run tools/test/acta-recover.test.ts tools/test/acta-join.test.ts`
Expected: FAIL — `applyPageRows`, `ACTA_PAGE_READINGS` not exported; `stats.recovered` undefined.

- [ ] **Step 3: Implement**

In `tools/src/acta/index.ts`, add to `ActaParseStats`: `/** Pageless entries given a page by a sidecar or a curated reading (recover.ts). */ recovered: number;` and `recovered: 0` in the initialiser.

In `tools/src/acta/recover.ts`:

```ts
import type { ActaParseResult } from './index.js';

/**
 * Give pageless entries their pages from sidecar rows or curated readings: each row's key
 * names a pageless entry, which becomes an entry with the page and `pageSource`, kept in
 * date order among the entries. A key no pageless entry answers to is a stale row -- the
 * fixture or the parser changed under it -- and a hard error, as a stale correction is.
 * Returns the number of entries moved.
 */
export function applyPageRows(result: ActaParseResult, rows: readonly { key: string; page: number; source: 'recovered' | 'reading' }[], label: string): number {
  let n = 0;
  for (const row of rows) {
    const i = result.pageless.findIndex((e) => pagelessKey(e) === row.key);
    if (i < 0) throw new Error(`stale page row ${row.key} in ${label}: no entry of the fixture is opened without a page under that key`);
    const [e] = result.pageless.splice(i, 1);
    const entry: ActaEntry = { ...e!, page: row.page, pageSource: row.source };
    result.entries.push(entry);
    result.stats.recovered++;
    n++;
  }
  if (n > 0) result.entries.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : a.page - b.page));
  return n;
}
```

In `tools/src/acta/curation.ts`, after `ACTA_HOLDS`:

```ts
export interface PageReading {
  /** The act's first page, read in the volume. */
  page: number;
  /** The index line, quoted as extracted (without a page, as the OCR left it). */
  indexLine: string;
  /** The heading and incipit as the volume prints them at that page, and where they were read. */
  evidence: string;
}

/**
 * Pages read by hand for entries the recovery (recover.ts) leaves without one -- the acts
 * that matter most first: encyclicals, constitutions -- keyed `{source}|{pageless key}`
 * (`1921|1921-12-31|LITTERAE ENCYCLICAE|Casti connubii|Ad venerabiles …`), each quoting the
 * volume. Consulted before the sidecar (join.ts). Empty until phase 2b-iii-b's report
 * names what to read.
 */
export const ACTA_PAGE_READINGS: Readonly<Record<string, PageReading>> = {};
```

In `tools/src/acta/join.ts`, `loadActaIndexes` becomes:

```ts
import { ACTA_PAGE_READINGS } from './curation.js';
import { applyPageRows, sidecarPath, type PagesSidecar } from './recover.js';

export function loadActaIndexes(sources: readonly ActaSource[] = ACTA_SOURCES): { parsed: Map<string, ActaParseResult>; missing: string[] } {
  const parsed = new Map<string, ActaParseResult>();
  const missing: string[] = [];
  for (const s of sources) {
    if (!existsSync(s.file)) { missing.push(s.key); continue; }
    const r = parseActaIndex(readFileSync(s.file, 'utf8'), {
      year: s.year, volume: s.volume, ...(s.part ? { part: s.part } : {}), ...s.parse,
    });
    // The curated readings first, then the sidecar (spec §10.3.3, §10.3.5): a page read by
    // hand outranks one recovered by rule, and a key both name is applied once.
    const readings = Object.entries(ACTA_PAGE_READINGS).filter(([k]) => k.startsWith(`${s.key}|`))
      .map(([k, v]) => ({ key: k.slice(s.key.length + 1), page: v.page, source: 'reading' as const }));
    applyPageRows(r, readings, 'ACTA_PAGE_READINGS');
    const sidecar = sidecarPath(s);
    if (existsSync(sidecar)) {
      const sc = JSON.parse(readFileSync(sidecar, 'utf8')) as PagesSidecar;
      const read = new Set(readings.map((x) => x.key));
      applyPageRows(r, sc.rows.filter((row) => !read.has(row.key)).map((row) => ({ key: row.key, page: row.page, source: 'recovered' as const })), sidecar);
    }
    parsed.set(s.key, r);
  }
  return { parsed, missing };
}
```

- [ ] **Step 4: Run the tests, then the full check**

Run: `npx vitest run tools/test/acta-recover.test.ts tools/test/acta-join.test.ts && npm run check`
Expected: the new tests pass; `npm run check` fails only in `harvest-data.test.ts` pins if `data/` is stale — it is not yet (the harvest runs in Task 8), so it should pass. If `applyPageRows` throws on a real sidecar, the sidecar and the fixture disagree: re-run `npm run recover -- <key>` and commit the sidecar.

- [ ] **Step 5: Commit**

```bash
git add tools/src/acta/recover.ts tools/src/acta/join.ts tools/src/acta/index.ts tools/src/acta/curation.ts tools/test/acta-recover.test.ts tools/test/acta-join.test.ts
git commit -m "The join gives pageless entries their pages from the sidecars and the curated readings, refusing a stale row"
```

---

### Task 8: Harvest, the era report, and the pins

**Files:**
- Modify: `data/documents/*.json` (the harvest), `registry/**` (the render), `tools/acta-volumes-report.ts`, `tools/test/harvest-data.test.ts`, `docs/superpowers/reports/2026-09-13-acta-volumes-*.md` and `2026-09-18-acta-volumes-1926-1930.md` (regenerated), `README.md`, `SCHEMA.md`, `docs/superpowers/specs/2026-09-13-acta-volumes-design.md` §10
- Create: `docs/superpowers/reports/2026-09-2D-acta-volumes-1909-1925.md`

**Interfaces:**
- Consumes: `ActaParseResult.pageless`, `stats.recovered`, `ActaEntry.pageSource`, the sidecars (`sidecarPath`, `PagesSidecar.unrecovered`).

- [ ] **Step 1: Run the harvest and read the numbers**

Run: `npm run harvest 2>&1 | tail -20 && git diff --stat data/`
Expected: Pius X, Benedict XV and Pius XI files change; the summary line names the seventeen sources. Note for the era report: created and matched per source, holds, any re-minted shelf id printed by the run (`shelf id … changed`) — the spec expects none; each one printed is a finding.

- [ ] **Step 2: Add the recovery to the report tool**

In `tools/acta-volumes-report.ts`:

1. Add a `generatedOn: '2026-09-2D'` era `'1909-1925'` (copy the shape of `ERAS['1926-1930']`): `title: '# The AAS volumes of 1909–1925 (AAS 1–17): the phase-2b-iii-b report'`, `covers: (s) => s.year >= 1909 && s.year <= 1925`, `partsSkippedNote: 'dicasteries, tribunals, offices, the consistories of 1917, *Diarium*'`, and the prose functions written *after* Step 3's table is read (leave them returning `['(written in Step 4)']` until then).
2. Add a section **§1b. Pages recovered** rendered right after §1 for every era whose sources have a sidecar (so the sample and later eras print nothing new):

```ts
// §1b: the page recovery (spec §10.3.4), from the sidecars of the era's sources.
const recovered = [...parsedAll].filter(([k]) => ERA.covers(actaSource(k)!) && existsSync(sidecarPath(actaSource(k)!)));
if (recovered.length > 0) {
  p('### 1b. Pages recovered from the volume body (spec §10.3)');
  p('');
  p('| Source | Opened without a page | Recovered | unique | dated | fuzzy | Not recovered | none | several | outside runs | header | no incipit | **Rate after recovery** | Harvested, after |');
  p('|---|---|---|---|---|---|---|---|---|---|---|---|---|---|');
  for (const [k, r] of recovered) {
    const sc = JSON.parse(readFileSync(sidecarPath(actaSource(k)!), 'utf8')) as PagesSidecar;
    const by = (rule: string) => sc.rows.filter((x) => x.rule === rule).length;
    const why = (reason: string) => sc.unrecovered.filter((x) => x.reason === reason).length;
    const after = (r.stats.entries) / (r.stats.pageLines + r.stats.withoutPage);
    const harvestedAfter = r.stats.harvestedPageLines === 0 ? null : r.stats.harvestedEntries / (r.stats.harvestedPageLines + r.pageless.filter((e) => (categoryForHeading(e.category)?.harvested ?? 'no') !== 'no').length + r.entries.filter((e) => e.pageSource !== undefined && (categoryForHeading(e.category)?.harvested ?? 'no') !== 'no').length);
    p(`| ${k} | ${r.stats.withoutPage} | ${sc.rows.length} | ${by('unique')} | ${by('dated')} | ${by('fuzzy')} | ${sc.unrecovered.length} | ${why('none')} | ${why('several')} | ${why('outside-runs')} | ${why('header-mismatch')} | ${why('no-incipit')} | **${pct(after)}**${after < 0.95 ? ' ⚠' : ''} | ${pct(harvestedAfter)} |`);
  }
  p('');
  p('*Opened without a page* is the parser\'s count before recovery (§1); the rate after recovery counts the recovered entries among the entries and the unrecovered among the lines. Every unrecovered entry is listed under §9, *Page not recovered*.');
  p('');
}
```

(`stats.entries` already includes the recovered entries once the sidecar is applied, and `stats.withoutPage` still counts every entry opened without a page; `pageLines` counts only lines that ended in a page, hence the denominator `pageLines + withoutPage`. Check the arithmetic on one volume by hand: entries after = entries read + recovered; lines = pageLines + withoutPage.)

3. In §9 (Held), add a row **Page not recovered** with the count of `r.pageless` per source of the era, and a `<details>` block listing each with its reference-less line (`AAS {vol} ({year}) —`), pope, date, category, entry (incipit or description head) and the sidecar's reason for its key.
4. In §12 (every match) and §8 (every created record), print `(page recovered: unique)` / `(page recovered: dated)` / `(page read: ACTA_PAGE_READINGS)` after the reference when `entry.pageSource` is set — the match and created rows carry the entry; add the suffix where the reference cell is rendered.

- [ ] **Step 3: Generate the draft and read it**

Run: `npx tsx tools/acta-volumes-report.ts 1909-1925 > /tmp/draft.md && sed -n '/^### 1b/,/^## 2/p' /tmp/draft.md && sed -n '/^## 9. Held/,/^| \*\*Total/p' /tmp/draft.md`
Expected: the recovery table with seventeen rows; volumes under 95 % after recovery are ⚠ — each is a finding for the reading (name the volume and why: 1909's descriptions without incipits, a category the Index generalis has no runs for, an OCR that damaged the incipits).

Read the held rows for the shapes the earlier eras curated — an act printed twice (`ACTA_REPRINTS`), a vernacular text beside the Latin (`ACTA_HOLDS`), two acts on one page (`ACTA_SHARED_PAGES`, read the page in the store text with `awk 'BEGIN{RS="\f"} NR==<page>' <store>/txt/aas-XX-YYYY.txt`), a year the OCR lost at a section head (`ACTA_INDEX_CORRECTIONS`, the formula read the same way). Write each row as PR #40 did (quote the index line, the body heading, the formula, the PDF page and the read date), re-run the harvest, re-generate.

- [ ] **Step 4: Write the era's prose**

Fill `reading1`, `reading2`, `mappingsProse`, `radioProse` in the era with the numbers from Step 3, in the register of the earlier eras: (1) the recovery's yield per rule and the volumes under the floor, with why; (2) what the OCR loses in this era beyond the page (the 1917-I `1910` for 1916, the 1909 descriptions); (3) the curated rows written; (4) the shelves of Pius X and Benedict XV being thin, the era is a harvest; (5) the acts left without a page that matter (encyclicals, constitutions), for Task 9; (6) the pope headings and new category headings mapped; the radio prose says the era precedes Vatican Radio (1931). Then:

Run: `for e in sample 1932-1957 1959-1977 1979-2014 1926-1930; do npx tsx tools/acta-volumes-report.ts $e > docs/superpowers/reports/$( [ $e = 1926-1930 ] && echo 2026-09-18 || echo 2026-09-13 )-acta-volumes-$e.md; done; npx tsx tools/acta-volumes-report.ts 1909-1925 > docs/superpowers/reports/2026-09-2D-acta-volumes-1909-1925.md; npm run render`
Expected: the sample report's 1909 and 1917-I numbers move (their fixtures were re-extracted and their pages recovered); the others move only in the totals.

- [ ] **Step 5: Move the pins and add the era test**

Run: `npx vitest run tools/test/harvest-data.test.ts 2>&1 | grep -E '×|^\s+[-+] '`
For each failing pin (matched per source, created per source and class, per issuer, provisional totals, motu-proprio bearers, the sample's `'1909': 2, '1917-I': 8` created counts and `'1917-I': 1` matched), update the number and extend the comment with one sentence naming phase 2b-iii-b and the cause (the recovery; the re-extraction of 1909/1917-I). Then add, after the 2b-iii-a era test:

```ts
  it('joins and creates from the volumes of 1909-1925 with their recovered pages as the era report says (acta volumes spec §10, phase 2b-iii-b)', () => {
    const era = born.filter((d) => d.acta!.year >= 1909 && d.acta!.year <= 1925);
    expect(era).toHaveLength(<created count>);
    for (const d of era) {
      expect(d.acta!.volume, d.id).toBe(d.acta!.year - 1908);
      expect(d.acta!.part, d.id).toBe(d.acta!.year === 1917 ? 'I' : undefined);
      expect(d.source!.shelf, d.id).toBe(`aas/${d.acta!.year}`);
      expect(['rp:pius-x', 'rp:benedict-xv', 'rp:pius-xi'].includes(d.issuerId), d.id).toBe(true);
    }
    const by = Object.fromEntries(everything.map((d) => [d.id, d]));
    // Three pages recovered from the body, one by each rule (the era report §1b names them): replace with real ids and pages.
    expect(by['mag:benedict-xv/<unique-example>']).toMatchObject({ acta: { volume: 13, year: 1921, page: <n> } });
    expect(by['mag:benedict-xv/<dated-example>']).toMatchObject({ acta: { volume: 13, year: 1921, page: <n> } });
    expect(by['mag:benedict-xv/<fuzzy-example>']).toMatchObject({ acta: { volume: 13, year: 1921, page: <n> } });
    // A shelf record cited through a recovered page.
    expect(by['mag:benedict-xv/sacra-propediem-1921']).toMatchObject({ acta: { volume: 13, year: 1921, page: 33 } });
    // An entry the recovery left without a page is neither created nor cited.
    expect(everything.filter((d) => d.acta?.volume === 13 && d.acta.page === <a page from unrecovered>)).toEqual([]);
  });
```

Fill the placeholders from the era report (§8 and §1b) before committing — the test must name real records.

- [ ] **Step 6: Docs**

`README.md`: extend the two phase paragraphs (the one ending `…which recovers the pages from the volume bodies.` and the one ending `…confirmed by hand.`) with phase 2b-iii-b's numbers — references, documents created, the recovery's yield (`N of M entries opened without a page recovered: unique …, dated …, fuzzy …`), the volumes under the floor and why, and the remaining phases (2b′ 2003–2009, 2c the ASS). `SCHEMA.md` `acta` paragraph: `…and of 1909–1925, AAS 1–17, phase 2b-iii-b, whose pages the OCR lost and the volume bodies gave back (\`tools/src/acta/recover.ts\`, the sidecars in \`tools/fixtures/acta/\`)…`. Spec §10: add a closing paragraph **§10.5 Measured** with the recovery table's totals and the date.

Run: `npm run check && npm run harvest > /dev/null && npm run render > /dev/null && git status --short | wc -l`
Expected: check passes; the file count is the same before and after the second harvest+render (idempotent).

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "Join and create from AAS 1-17 (1909-1925) with the recovered pages; report phase 2b-iii-b, regenerate the eras, pin the era"
```

---

### Task 9: Curated page readings for the acts that matter, and the two Code constitutions

**Files:**
- Modify: `tools/src/acta/curation.ts` (`ACTA_PAGE_READINGS` rows; `ACTA_CURATED_REFERENCES`), `tools/src/acta/join.ts` (`applyActa`), `tools/test/acta-join.test.ts`, `tools/test/harvest-data.test.ts`, `data/`, `registry/`, the era report and the sample report

**Interfaces:**
- Produces: `ACTA_CURATED_REFERENCES: Readonly<Record<string, CuratedReference>>` keyed by document id, `CuratedReference { acta: { series: 'AAS'; volume: number; year: number; part?: 'I' | 'II'; page: number }; evidence: string }`, applied in `applyActa` after the matches (a document both a match and a row name is an error).

- [ ] **Step 1: List what the recovery left, by weight**

Run: `npx tsx -e "…"` or read the era report §9 *Page not recovered*: list the encyclicals (*Litterae Encyclicae*, *Epistolae Encyclicae*) and constitutions (*Constitutiones Apostolicae*) first, then motu proprio; for each, find the act in the store text (`grep -n -i '<incipit word>' <store>/txt/aas-XX-YYYY.txt | head`, then `awk 'BEGIN{RS="\f"} NR==<page>'` to read the page and the header). Write a row per act read:

```ts
  // Phase 2b-iii-b: <why the recovery missed it -- the OCR's incipit, several acts of one incipit whose formulae the OCR broke, …>.
  '1921|1921-06-29|LITTERAE ENCYCLICAE|Fausto appetente die|Ad Patriarchas, Primates, Archiepiscopos, Episcopos aliosque locorum': {
    page: 329,
    indexLine: '  » Iun. 29 Fausto appetente die. - Ad Patriarchas, Primates, Ar­ / chiepiscopos, … / habentes : de DCC natali sancti Dominici celebrando',
    evidence: "AAS 13 (1921) p. 329 (PDF page 329 of AAS-13-1921-ocr.pdf, read 2026-09-2D) prints 'EPISTOLA ENCYCLICA / … / Fausto appetente die …', dated '…' (p. NNN).",
  },
```

(That example is illustrative only — the recovery may well have found *Fausto appetente die* itself; write rows only for entries in the *unrecovered* list, and only where the page was read.) Stop at the encyclicals and constitutions unless a motu proprio or decretal is a shelf record awaiting its reference (§11 of the era report lists them).

- [ ] **Step 2: The curated references for the two Codes' constitutions**

*Providentissima Mater Ecclesia* (27 May 1917) opens AAS 9 part II at p. 5; *Sacrae disciplinae leges* (25 January 1983) opens AAS 75 part II at pp. VII–XIV — Roman-numbered, which `acta.page` (an integer) cannot carry: record it in the row's evidence as a finding and give it no reference. Add to `curation.ts`:

```ts
export interface CuratedReference {
  acta: { series: 'AAS'; volume: number; year: number; part?: 'I' | 'II'; page: number };
  evidence: string;
}
/**
 * References no index entry can give: the constitution that promulgates a Code opens the
 * Code's own volume, which has no chronological index (AAS 9-II, 1917; AAS 75-II, 1983).
 * Applied after the join (applyActa); a document the join has also matched is an error.
 */
export const ACTA_CURATED_REFERENCES: Readonly<Record<string, CuratedReference>> = {
  'mag:benedict-xv/providentissima-mater-1917': {
    acta: { series: 'AAS', volume: 9, year: 1917, part: 'II', page: 5 },
    evidence: "AAS 9 (1917) part II (AAS-09-II-1917-ocr.pdf, 594 pages, read 2026-09-2D) opens at p. 5 with 'CONSTITUTIO APOSTOLICA / … / Providentissima Mater Ecclesia …' (27 May 1917), the promulgation of the Codex Iuris Canonici that fills the rest of the part; the part has no chronological index (fixtures README). *Sacrae disciplinae leges* (AAS 75 (1983) part II) opens at pp. VII-XIV, Roman-numbered, which `acta.page` cannot carry: no reference, recorded here.",
  },
};
```

(Read p. 5 in the store: `tools/fetch-acta.sh text 1917` exports part I only by Task 1's rule — export part II by hand for this: `python3 -c "…"` over `~/development/sources/AAS/pdf/AAS-09-II-1917-ocr.pdf` page 5, and quote what it prints; adjust the quotation.)

In `join.ts` `applyActa`, after the loop writing matches:

```ts
  for (const [id, row] of Object.entries(ACTA_CURATED_REFERENCES)) {
    const d = byId.get(id);
    if (d === undefined) throw new Error(`ACTA_CURATED_REFERENCES names ${id}, which no document carries`);
    if (result.matches.some((m) => m.documentId === id)) throw new Error(`ACTA_CURATED_REFERENCES names ${id}, which the join also matched`);
    d.acta = { ...row.acta };
  }
```

Invariant 25 (uniqueness of series/volume/part/page) reads `acta` and needs no change.

- [ ] **Step 3: Tests**

In `tools/test/acta-join.test.ts`, the readings test from Task 7 now runs non-vacuously. Add:

```ts
  it('writes the curated references of the Codes\' constitutions and no other', () => {
    const docs = readdirSync('data/documents').filter((f) => f.endsWith('.json')).flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[]);
    const by = Object.fromEntries(docs.map((d) => [d.id, d]));
    expect(by['mag:benedict-xv/providentissima-mater-1917']!.acta).toEqual({ series: 'AAS', volume: 9, year: 1917, part: 'II', page: 5 });
    expect(by['mag:john-paul-ii/sacrae-disciplinae-leges-1983']!.acta).toBeUndefined();
  });
```

(with the imports `readdirSync, readFileSync` from `node:fs` and `DocumentRecord` from wherever `harvest-data.test.ts` imports it — copy that import line.)

- [ ] **Step 4: Harvest, regenerate, move the pins**

Run: `npm run harvest > /dev/null && npm run render > /dev/null && npx tsx tools/acta-volumes-report.ts 1909-1925 > docs/superpowers/reports/2026-09-2D-acta-volumes-1909-1925.md && npx tsx tools/acta-volumes-report.ts sample > docs/superpowers/reports/2026-09-13-acta-volumes-sample.md && npm run check`
Expected: the pins that the readings moved (matched/created per source) fail; update them with a comment naming the readings; `check` passes. Update the era report's prose finding (5) to say which acts the readings cited and which stay without a page. The sample report's 1917-I row gains *Providentissima Mater*'s reference in §11/§12? — it is not an index match; §11 (documents without an entry) should now show it *with* a reference: check the section reads the document's `acta` and update the prose of its finding 6.

- [ ] **Step 5: Commit, push, PR**

```bash
git add -A
git commit -m "Curated page readings for the encyclicals and constitutions the recovery left, and the reference of Providentissima Mater in AAS 9-II"
git push -u origin feat/acta-volumes-1909-1925
```

Open the PR with `gh pr create`, the body in the shape of PR #40's (Summary with `Refs #25`; Measurements: the recovery table and the join table per source; Decisions with each curated table's rows; Findings for the owner: the volumes under the floor, the unrecovered acts of weight, *Sacrae disciplinae leges*'s Roman pages, any shelf id re-minted), ending with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

---

## Self-review

**Spec coverage (§10.3):** input — Task 1 (text export) and Task 3 (runs); method — Tasks 4–5 (normalisation, runs ±1, unique/dated/fuzzy, no-runs → formula required, header check); output — Tasks 6–7 (sidecar with body line, header, rule, formula; `pageSource`; stale row is a hard error); report — Task 8 (§1b per rule and reason, rate after recovery with the floor, `page-not-recovered` held row); curation — Tasks 7 and 9 (`ACTA_PAGE_READINGS`, consulted before the sidecar). §10.1's rows: 1911 and 1925 are in the range; 9-II's *Providentissima Mater* — Task 9. §10.4 — Task 1 (`<store>/txt/`), and no test reads the store (Tasks 3–5 test on inline excerpts; Task 7's join test reads sidecars only). Out of scope stays out: 1909's incipit-less descriptions are `no-incipit` rows, taken only by Task 9's readings.

**Placeholders:** Task 8 Step 5 and Task 9 Step 1 contain `<…>` values that only the run can supply; each says where to read them (the era report §1b/§8/§9) and that the test must name real records before commit. `2026-09-2D` is the extraction date, defined in Task 1.

**Type consistency:** `PagelessEntry` (Task 2) is what `recoverPages` (Task 5), `pagelessKey` (Task 3) and `applyPageRows` (Task 7) take; `RecoveredRow.rule` values match the CLI's summary and the report's columns; `PagesSidecar` is written by Task 6 and read by Tasks 7–8 with the same fields; `ActaParseStats.recovered` is added in Task 7 before Task 8 reads it; `sidecarPath` is defined in Task 6 (Step 1) before Tasks 7–8 import it; `pageSource` values `'recovered' | 'reading'` are the same in `ActaEntry`, `applyPageRows` and `loadActaIndexes`.
