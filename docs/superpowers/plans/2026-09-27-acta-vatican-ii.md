# Phase 2d: the sixteen Vatican II references — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write an AAS reference onto all sixteen `oec:vatican-ii` records — the last issuer at zero coverage the corpus can reach — by sixteen curated rows whose evidence is the printed page, leaving the pipeline unchanged.

**Architecture:** The AAS *Index documentorum chronologico ordine digestus* files the council's documents in a part of its own (`ACTA SS. OECUMENICI CONCILII VATICANI II`), which `index.ts` reads as a part and then skips, as it skips the dicasteries'. Rather than teach the parser that part — measured reach: 18 entries in 4 volumes that cannot grow — sixteen `ACTA_CURATED_REFERENCES` rows carry the references, each quoting the page as read in the volume, and a new report generator reads the part's lines so the completeness accounting a reader would have bought is still had.

**Tech Stack:** TypeScript (Node ≥20.10, `tsx`), vitest, `pypdf` via `tools/fetch-acta.sh`, no new dependency.

**Spec:** `docs/superpowers/specs/2026-09-13-acta-volumes-design.md` §12 (committed as `1e4e726`, corrected by `f091072`). §12.1–§12.6 are the sections this plan implements; read them before Task 1.

## Global Constraints

- **Phase name:** 2d. **Spec section:** §12. Both are fixed; every comment and report line uses them.
- **No pipeline change.** Nothing in `tools/src/acta/index.ts`, `match.ts` or `create.ts` is touched. If a task seems to need one, stop and report — the spec refused a reader on measurement (§12.2).
- **No fixture is re-extracted** and no `retrieved` date in `ACTA_SOURCES` or `tools/fixtures/acta/README.md` moves: those record a fixture's extraction, and phase 2b-ii-b wrote all three (§12.3). Volumes are fetched in the script's **text** mode only.
- **Every count stated in prose is computed by a generator or asserted by a pin** (the standing rule behind `tools/regenerate-reports.ts`). No hand-typed list of acts in a report.
- **Every curated row is evidence or it does not exist.** A row's `evidence` quotes what the page prints and the act's own dating formula, and names the file and the date it was read, in the shape the table's existing two rows use. **Never compose Latin you have not read.**
- **The report generator must not read the volume store** (`~/development/sources/`), so that CI's `npm run reports -- --skip-store` regenerates it.
- Commit messages: imperative, specific, no type prefix (`Cite the sixteen documents of Vatican II in AAS 56–58`). End every commit with `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`.
- Work in an isolated worktree created **from local `HEAD`**, not from `origin/main` (the spec commits are local). PR via `gh`.

## Review Focus

Five failure modes §12 implies that no obvious task test exercises. Each line's test is assigned to the task that owns the code.

1. **A row whose `acta.page` disagrees with the page its own evidence quotes** — a transposed digit between reading and row would cite a page nothing was read on, and nothing in the pipeline compares the two. Test in Task 1, Step 8.
2. **A conciliar index line that changes or vanishes under a later re-extraction**, leaving a row resting on nothing: the rows are keyed by document id, so no staleness check reaches the index at all. Test in Task 1, Step 9.
3. **A seventeenth conciliar entry appearing in a part** that no row names — the part is unparsed, so a new line is invisible. Pinned count in Task 1, Step 10.
4. **A curated reference row added later with empty evidence**: `mappings.test.ts`'s cardinal note rule lists five tables and `ACTA_CURATED_REFERENCES` is not among them. Fixed in Task 1, Step 11.
5. **The generator finding no conciliar part at all** (a heading whose OCR differs, a fixture re-extracted) and silently reporting zero entries rather than failing. Test in Task 1, Step 10.

Invariant 25 (one page of the *Acta* opens one act) needs no new test: `npm run validate` enforces it, and all eighteen pages were checked clear against the corpus on 2026-09-27.

---

## File Structure

| File | Change | Responsibility |
|---|---|---|
| `tools/src/acta/curation.ts` | Modify — `ACTA_CURATED_REFERENCES` (the table and its doc comment) | The sixteen rows and the table's widened contract |
| `tools/test/acta-join.test.ts` | Modify — the key-list test at l. 73 | Pins which documents carry a curated reference, and the new liveness tests |
| `tools/test/harvest-data.test.ts` | Modify — four pinned counts and the Vatican II assertion | Pins the corpus effect |
| `tools/test/mappings.test.ts` | Modify — the note-rule describe block | Adds `ACTA_CURATED_REFERENCES` to the cardinal rule |
| `tools/src/acta/conciliar.ts` | **Create** | One responsibility: locating a fixture's conciliar part and returning its entry lines. Imported by the tests and the report generator, and by nothing in the harvest path |
| `tools/acta-conciliar-report.ts` | **Create** | Phase 2d's report generator: the `skippedParts` tally, the four parts' lines, the sixteen rows, the corpus totals |
| `tools/regenerate-reports.ts` | Modify — `REPORTS` | Holds the new report to its generator in CI |
| `docs/superpowers/reports/2026-09-27-acta-vatican-ii.md` | **Create** (generated) | The phase report |
| `README.md` | Modify — the 2b-ii-b paragraph, plus a 2d paragraph | The corpus's own account of the phase |
| `SCHEMA.md` | Modify — the `acta` paragraph | Names the curated-reference case for the first time |

---

## Task 1: The sixteen curated rows

**Files:**
- Modify: `tools/src/acta/curation.ts` (`ACTA_CURATED_REFERENCES`, its doc comment and `CuratedReference`'s own comment)
- Modify: `tools/test/acta-join.test.ts:73-82`
- Modify: `tools/test/harvest-data.test.ts` (four pins, listed in Step 12)
- Modify: `tools/test/mappings.test.ts` (the note-rule block)
- Create: `tools/src/acta/conciliar.ts`
- Regenerated: `data/documents/vatican-ii.json`, `registry/documents.md`

**Interfaces:**
- Consumes: `ACTA_CURATED_REFERENCES: Readonly<Record<string, CuratedReference>>` and `interface CuratedReference { acta: { series: 'AAS'; volume: number; year: number; part?: 'I' | 'II'; page: number }; supersedes?: string; evidence: string }`, both in `tools/src/acta/curation.ts`; `applyCuratedReferences(result, docs, table?)` in `tools/src/acta/join.ts`, called by `applyActa`, called by `tools/src/harvest/run.ts`.
- Produces: sixteen new keys in `ACTA_CURATED_REFERENCES`, the ids of Step 7's table; and `export const conciliarPartLines = (fixture: string): string[]` from the new `tools/src/acta/conciliar.ts`, which returns one string per entry of a fixture's conciliar part (continuation lines folded in, AAS 58's fused line split) and throws where the fixture prints no such part. Task 2's generator imports both.

- [ ] **Step 1: Read the spec section**

Read `docs/superpowers/specs/2026-09-13-acta-volumes-design.md` §12 end to end (it is about 190 lines). §12.3's table is the authority for which document takes which page; §12.2 is why no parser change is permitted.

- [ ] **Step 2: Write the first failing test — the key list**

`tools/test/acta-join.test.ts:73` currently reads:

```ts
  it('writes the curated references of the Code\'s constitution and of Ubi arcano Dei, and no other', () => {
    const docs = readdirSync('data/documents').filter((f) => f.endsWith('.json')).flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[]);
    const by = Object.fromEntries(docs.map((d) => [d.id, d]));
    expect(Object.keys(ACTA_CURATED_REFERENCES).sort()).toEqual(['mag:benedict-xv/providentissima-mater-1917', 'mag:pius-xi/ubi-arcano-dei-consilio-1922']);
```

Replace the title and the key-list assertion with these, keeping the four assertions that follow them unchanged:

```ts
  it('writes the curated references of the two the index cannot enter and the sixteen it enters in the council\'s part, and no other', () => {
    const docs = readdirSync('data/documents').filter((f) => f.endsWith('.json')).flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[]);
    const by = Object.fromEntries(docs.map((d) => [d.id, d]));
    // Phase 2d (acta volumes spec §12): the sixteen conciliar documents, whose entries stand in
    // `ACTA SS. OECUMENICI CONCILII VATICANI II`, a part index.ts reads as a part and skips.
    expect(Object.keys(ACTA_CURATED_REFERENCES).sort()).toEqual([
      'mag:benedict-xv/providentissima-mater-1917',
      'mag:pius-xi/ubi-arcano-dei-consilio-1922',
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
```

- [ ] **Step 3: Write the second failing test — the corpus assertion**

In `tools/test/harvest-data.test.ts`, find these four lines (they are the last in the test `cites the acts of John XXIII and Paul VI the era report names (acta volumes spec §9, phase 2b-ii-b)`):

```ts
    // The sixteen conciliar documents are in the volumes' *Acta Ss. Oecumenici Concilii* part, which the parser
    // skips: no `oec:vatican-ii` record carries a reference (report §1, the Vatican II finding).
    expect(everything.filter((d) => d.issuerId === 'oec:vatican-ii' && d.acta !== undefined)).toEqual([]);
  });
```

Replace them with:

```ts
    // Phase 2d (spec §12): the sixteen conciliar documents are in the volumes' *Acta Ss.
    // Oecumenici Concilii Vaticani II* part, which the parser reads as a part and skips, so each
    // carries a curated reference (ACTA_CURATED_REFERENCES) and none a match.
    const conciliar = everything.filter((d) => d.issuerId === 'oec:vatican-ii');
    expect(conciliar).toHaveLength(16);
    expect(Object.fromEntries(conciliar.map((d) => [d.id, d.acta]))).toEqual({
      'mag:vatican-ii/sacrosanctum-concilium-1963': { series: 'AAS', volume: 56, year: 1964, page: 97 },
      'mag:vatican-ii/inter-mirifica-1963': { series: 'AAS', volume: 56, year: 1964, page: 145 },
      'mag:vatican-ii/lumen-gentium-1964': { series: 'AAS', volume: 57, year: 1965, page: 5 },
      'mag:vatican-ii/orientalium-ecclesiarum-1964': { series: 'AAS', volume: 57, year: 1965, page: 76 },
      'mag:vatican-ii/unitatis-redintegratio-1964': { series: 'AAS', volume: 57, year: 1965, page: 90 },
      'mag:vatican-ii/christus-dominus-1965': { series: 'AAS', volume: 58, year: 1966, page: 673 },
      'mag:vatican-ii/perfectae-caritatis-1965': { series: 'AAS', volume: 58, year: 1966, page: 702 },
      'mag:vatican-ii/optatam-totius-1965': { series: 'AAS', volume: 58, year: 1966, page: 713 },
      'mag:vatican-ii/gravissimum-educationis-1965': { series: 'AAS', volume: 58, year: 1966, page: 728 },
      'mag:vatican-ii/nostra-aetate-1965': { series: 'AAS', volume: 58, year: 1966, page: 740 },
      'mag:vatican-ii/dei-verbum-1965': { series: 'AAS', volume: 58, year: 1966, page: 817 },
      'mag:vatican-ii/apostolicam-actuositatem-1965': { series: 'AAS', volume: 58, year: 1966, page: 837 },
      'mag:vatican-ii/dignitatis-humanae-1965': { series: 'AAS', volume: 58, year: 1966, page: 929 },
      'mag:vatican-ii/ad-gentes-1965': { series: 'AAS', volume: 58, year: 1966, page: 947 },
      'mag:vatican-ii/presbyterorum-ordinis-1965': { series: 'AAS', volume: 58, year: 1966, page: 991 },
      'mag:vatican-ii/gaudium-et-spes-1965': { series: 'AAS', volume: 58, year: 1966, page: 1025 },
    });
  });
```

- [ ] **Step 4: Run both tests to verify they fail**

Run: `npx vitest run tools/test/acta-join.test.ts tools/test/harvest-data.test.ts -t 'curated references'` then `npx vitest run tools/test/harvest-data.test.ts -t 'John XXIII and Paul VI'`

Expected: the first FAILS on the key list (received two ids, expected eighteen); the second FAILS with `expected length 16 … received { 'mag:vatican-ii/ad-gentes-1965': undefined, … }`. If either passes, the edit did not land — stop and check.

- [ ] **Step 5: Fetch the three volumes' text**

Run: `tools/fetch-acta.sh text 1964-1966`

Expected: three `AAS-5{6,7,8}-19{64,65,66}-ocr.pdf` downloaded into `~/development/sources/AAS/pdf/` (2–6 MB each, slow — the script allows 600 s per volume) and three whole-volume texts written to `~/development/sources/AAS/txt/aas-5{6,7,8}-19{64,65,66}.txt`, one page per form feed, layout mode with spaces collapsed. The script prints the page count of each.

Verify no fixture moved: `git status --short tools/fixtures/` must print nothing. **Text mode writes no fixture; if a fixture shows as modified, the wrong mode was run — revert it (`git checkout tools/fixtures/`) and re-run with `text`.**

- [ ] **Step 6: Locate the sixteen printed pages**

The PDF's page number is not the printed page number. Write this throwaway script to your scratchpad (not the repo) and run it once per volume; it prints, for a printed page, the candidate PDF pages and the head of each.

```ts
// scratch: locate a printed page in a whole-volume text, by its running header.
import { readFileSync } from 'node:fs';
const [vol, year, ...pages] = process.argv.slice(2);
const store = `${process.env.HOME}/development/sources/AAS/txt`;
const doc = readFileSync(`${store}/aas-${vol}-${year}.txt`, 'utf8').split('\f');
for (const p of pages.map(Number)) {
  // A printed page carries its own number in its running header (first or last line);
  // the index's page is the printed one, so prefer a page whose header holds it.
  const hits = doc.map((t, i) => [i, t] as const)
    .filter(([, t]) => new RegExp(`(^|\\n)\\s*\\W*${p}\\b|\\b${p}\\s*\\W*(\\n|$)`).test(t.trim()));
  console.log(`\n=== printed p.${p}: ${hits.length} candidate PDF page(s): ${hits.map(([i]) => i + 1).join(', ')} ===`);
  for (const [i, t] of hits) {
    console.log(`--- PDF page ${i + 1} (offset ${i + 1 - p}) ---`);
    console.log(t.split('\n').slice(0, 22).join('\n'));
  }
}
```

Run it for each volume, e.g. `npx tsx <scratch>/locate.ts 56 1964 97 145`, then `… 57 1965 5 76 90`, then `… 58 1966 673 702 713 728 740 817 837 929 948 991 1025 10`.

For each of the sixteen, record in your scratch notes: the printed page, the PDF page and the offset between them; the act's Latin **title as the page prints it**; the promulgation formula and Paul VI's subscription; and the **dateline** (`Datum Romae apud S. Petrum …`). Confirm the act *opens* on the page the index gives — if it does not, **stop and report**: that is a finding of the same kind as 2c-ii-d's transposition, and it changes the row, not the reading.

Read AAS 58 printed p. 10 in the same pass (the *Nuntii a Patribus* of 8 December 1965). It takes no row — no registry record holds it — but Task 2's report states what it prints.

- [ ] **Step 7: Write the sixteen rows**

Add them to `ACTA_CURATED_REFERENCES` in `tools/src/acta/curation.ts`, after the two existing rows, under one comment naming the phase. This is the shape — `evidence` must be **what you read in Step 6**, never composed:

```ts
  // Phase 2d (acta volumes spec §12): the sixteen documents of the Second Vatican Council.
  // The AAS enters each in `ACTA SS. OECUMENICI CONCILII VATICANI II`, a part index.ts reads
  // as a part (PART_HEADING_RE matches any heading opening `ACTA`) and then skips, POPE_PART_RE
  // failing on `SS.`; its heading is in the parse result's `skippedParts`. A reader for that
  // part was refused on its measured reach -- four such parts across every source, 18 entries,
  // filed by title and not by incipit (spec §12.1, §12.2) -- so the references are curated, on
  // the owner's ruling that a conciliar act printed under the pope who promulgated it is the
  // same document (ass volumes spec §5, the ruling that cites Vatican I's two).
  'mag:vatican-ii/sacrosanctum-concilium-1963': {
    acta: { series: 'AAS', volume: 56, year: 1964, page: 97 },
    evidence: "AAS 56 (1964) p. 97 (PDF page <N> of AAS-56-1964-ocr.pdf, read <date>) prints "
      + "'<the page's opening lines, quoted>'; dated at p. <N> '<the dateline, quoted>' -- "
      + "4 December 1963, the record's date. The index enters it in the council's part, "
      + "`aas-56-1964.txt` l. 820, '1963 Dec. 4 Constitutio de Sacra Liturgia 97', which the "
      + "parser skips with the part (spec §12.1).",
  },
```

The other fifteen take the same shape. This is every row's `acta` and the fixture line its
evidence must quote, so that nothing has to be looked up twice — the fixture is
`tools/fixtures/acta/aas-{volume}-{year}.txt` in every case:

| Key | `acta` | Fixture line |
|---|---|---|
| `mag:vatican-ii/sacrosanctum-concilium-1963` | 56, 1964, 97 | 820 |
| `mag:vatican-ii/inter-mirifica-1963` | 56, 1964, 145 | 821 |
| `mag:vatican-ii/lumen-gentium-1964` | 57, 1965, 5 | 867 |
| `mag:vatican-ii/orientalium-ecclesiarum-1964` | 57, 1965, 76 | 868 |
| `mag:vatican-ii/unitatis-redintegratio-1964` | 57, 1965, 90 | 869 |
| `mag:vatican-ii/christus-dominus-1965` | 58, 1966, 673 | 790 |
| `mag:vatican-ii/perfectae-caritatis-1965` | 58, 1966, 702 | 791 |
| `mag:vatican-ii/optatam-totius-1965` | 58, 1966, 713 | 792 |
| `mag:vatican-ii/gravissimum-educationis-1965` | 58, 1966, 728 | 793 |
| `mag:vatican-ii/nostra-aetate-1965` | 58, 1966, 740 | 794 |
| `mag:vatican-ii/dei-verbum-1965` | 58, 1966, 817 | 795 (fused) |
| `mag:vatican-ii/apostolicam-actuositatem-1965` | 58, 1966, 837 | 795 (fused) |
| `mag:vatican-ii/dignitatis-humanae-1965` | 58, 1966, 929 | 797 |
| `mag:vatican-ii/ad-gentes-1965` | 58, 1966, **947** (the index's 948 is its own slip — spec §12.3) | 798 |
| `mag:vatican-ii/presbyterorum-ordinis-1965` | 58, 1966, 991 | 799 |
| `mag:vatican-ii/gaudium-et-spes-1965` | 58, 1966, 1025 | 800 |

`dei-verbum-1965` and `apostolicam-actuositatem-1965` share line 795, which the OCR runs
together (`Constitutio dogmatica de divina Revelatione 817 » » Decretum de apostolatu laicorum
837`): each of those two rows quotes the whole line and says which half is its own.

The evidence is written as one string per row, and **only the Latin you read in Step 6 goes in
it.** If a page's text layer is too damaged to quote, say so in the row in those words and quote
what it does hold — an unreadable page is a finding, not a reason to paraphrase.

- [ ] **Step 8: Widen the table's contract, and pin that a row's page is the page its evidence quotes**

Rewrite the doc comment above `ACTA_CURATED_REFERENCES` (currently *"References no index entry can give: …"*) to carry both cases, as spec §12.4 sets out: a reference the **chronological index of the popes' acts** cannot give, either because no entry exists (the Code volumes; *Ubi arcano Dei consilio*, whose line lost its date columns and opens no entry) or because the entry stands in **a part the parser does not read**, with the measurement that refused that part a reader.

Then add this test to `tools/test/acta-join.test.ts`, inside the same `describe` as the key-list test (Review Focus 1):

```ts
  it('states, in every curated reference, the volume and page the row itself cites', () => {
    for (const [id, row] of Object.entries(ACTA_CURATED_REFERENCES)) {
      // A transposed digit between the page read and the page cited would put a reference on a
      // page nothing was read on, and no pipeline check compares the two.
      expect(row.evidence, id).toMatch(new RegExp(`AAS ${row.acta.volume} \\(${row.acta.year}\\)`));
      expect(row.evidence, id).toMatch(new RegExp(`\\bp\\. ${row.acta.page}\\b`));
      expect(row.evidence.length, id).toBeGreaterThan(200);
    }
  });
```

- [ ] **Step 9: Pin that every conciliar row still rests on a line its fixture prints**

Add to the same `describe` (Review Focus 2). The rows are keyed by document id, so nothing otherwise notices if a fixture's conciliar part changes under it:

```ts
  it('keeps every conciliar row live: the index line it quotes is still printed in its fixture', () => {
    const conciliar = Object.entries(ACTA_CURATED_REFERENCES).filter(([id]) => id.startsWith('mag:vatican-ii/'));
    expect(conciliar).toHaveLength(16);
    for (const [id, row] of conciliar) {
      const file = `tools/fixtures/acta/aas-${row.acta.volume}-${row.acta.year}.txt`;
      const fixture = readFileSync(file, 'utf8');
      // The row quotes its index line between single quotes after the fixture's name; the line
      // must still be in the fixture, up to the runs of spaces the layout mode sets.
      const quoted = row.evidence.match(/`aas-\d\d-\d{4}\.txt` l\. \d+, '([^']+)'/);
      expect(quoted, id).not.toBeNull();
      const line = quoted![1]!.replace(/\s+/g, ' ').trim();
      const flat = fixture.replace(/[ \t]+/g, ' ');
      expect(flat, `${id} -> ${file}`).toContain(line);
    }
  });
```

- [ ] **Step 10: Create the conciliar-part locator, and pin how many entries the four parts hold**

The pin of Review Focus 3 needs one thing the repo does not have: a reader for the part's lines.
It is not a pipeline change — nothing in the harvest path imports it — and it has one
responsibility, so it is its own module. Create `tools/src/acta/conciliar.ts`:

```ts
/**
 * The entry lines of a volume's conciliar index part (acta volumes spec §12.1): `ACTA SS.
 * OECUMENICI CONCILII VATICANI II` in AAS 56-58 and `ACTA PATRUM S. CONCILII OECUMENICI
 * VATICANI II` in AAS 54, the part `index.ts` reads as a part (PART_HEADING_RE matches any
 * heading opening `ACTA`) and then skips, POPE_PART_RE failing on `SS.`.
 *
 * Read by the phase 2d report generator (tools/acta-conciliar-report.ts) and by the tests that
 * hold the curated rows to their fixtures. **Nothing in the harvest path imports this**: the
 * spec refused the matcher a reader for this part on its measured reach (§12.2), and this is the
 * accounting that refusal traded for, living where the lines are read.
 */

/**
 * One string per entry of the fixture's conciliar part, spaces collapsed: continuation lines
 * folded into the entry above, the heading's wrapped second line (`VATICANI II`) dropped, and
 * AAS 58's one fused line (l. 795, two entries on one OCR line) split in two. Throws where the
 * fixture prints no conciliar part, so that a heading whose OCR differs is an error and never a
 * silent zero.
 */
/** A line opening an entry: the year in the ANNO column, or a ditto for it (`»`, `•»`, `-»`). */
const ENTRY_START_RE = /^(?:\d{4}\b|[-•,.'’\s]{0,3}»)/;

export const conciliarPartLines = (fixture: string): string[] => {
  const lines = fixture.split('\f').join('\n').split('\n');
  const start = lines.findIndex((l) => /ACTA\s+(SS?\.|PATRUM)/i.test(l) && /OECUMENICI|CONCILII/i.test(l));
  if (start < 0) throw new Error('no conciliar part heading in this fixture');
  const out: string[] = [];
  for (const raw of lines.slice(start + 1)) {
    const l = raw.replace(/\s+/g, ' ').trim();
    if (l === '') continue;
    // The next part heading closes the part.
    if (/^(?:[A-Za-z0-9]{1,4}\.?\s*[–—-]\s*)?(?:ACTA|SACRA|SECRETARIA|DIARIUM)\b/i.test(l)) break;
    // The heading wraps: its second line is not an entry.
    if (/^VATICANI\s+II\.?$/i.test(l)) continue;
    // A line that opens no entry continues the one above (AAS 58's last entry wraps, and AAS 54's
    // only one); with none open it opens one, that part printing no date column at all.
    if (!ENTRY_START_RE.test(l) && out.length > 0) { out[out.length - 1] += ` ${l}`; continue; }
    out.push(l);
    // AAS 58 l. 795 sets two entries on one line: a dittoed title after the first entry's page.
    const fused = l.match(/\d+\s+(»[\s»,]*(?:Constitutio|Decretum|Declaratio)\b.*\d)\s*$/);
    if (fused) {
      out[out.length - 1] = l.slice(0, l.length - fused[1]!.length).trim();
      out.push(fused[1]!);
    }
  }
  return out;
};
```

Then add this test to `tools/test/acta-join.test.ts`, in the same `describe` as the key-list
test, with `import { conciliarPartLines } from '../src/acta/conciliar.js';` beside the file's
other imports:

```ts
  it('pins the four conciliar parts and the eighteen entries they hold, sixteen of them the registry\'s', () => {
    // Measured 2026-09-27 (spec §12.1): AAS 54 one entry, 56 two, 57 three, 58 twelve. The two
    // that no row names are the Fathers' *Nuntius* of 20 October 1962 (AAS 54 (1962) 822) and
    // the *Nuntii a Patribus* of 8 December 1965 (AAS 58 (1966) 10), whose place in the registry
    // is undecided; a nineteenth line means a fixture moved and a row may rest on nothing.
    const parts = [['54', 1962, 1], ['56', 1964, 2], ['57', 1965, 3], ['58', 1966, 12]] as const;
    let total = 0;
    for (const [vol, year, expected] of parts) {
      const lines = conciliarPartLines(readFileSync(`tools/fixtures/acta/aas-${vol}-${year}.txt`, 'utf8'));
      expect(lines.length, `AAS ${vol}`).toBe(expected);
      total += lines.length;
    }
    expect(total).toBe(18);
    expect(Object.keys(ACTA_CURATED_REFERENCES).filter((id) => id.startsWith('mag:vatican-ii/'))).toHaveLength(16);
  });

  it('refuses a fixture that prints no conciliar part, rather than reporting an empty one', () => {
    // A heading whose OCR differs, or a re-extracted fixture, must be an error and not a zero.
    expect(() => conciliarPartLines(readFileSync('tools/fixtures/acta/aas-59-1967.txt', 'utf8')))
      .toThrow(/no conciliar part/i);
  });
```

Run: `npx vitest run tools/test/acta-join.test.ts -t 'conciliar'`
Expected: both PASS.

This locator was run against all four fixtures on 2026-09-27, while this plan was written, and read
1, 2, 3 and 12 entries — so the pinned numbers are measured, not predicted. Two things it must get
right, both of which an earlier draft got wrong: AAS 54's single entry **wraps** (`Nuntius ad
universos homines, … Concilio Oecu­` / `menico ineunte 822`) and must come back whole, and AAS 58's
last two lines, *Gaudium et spes* at 1025 and the *Nuntii* at 10, must stay **separate** — which is
why an entry is recognised by how it begins, a year or a ditto, and never by ending in a page. If a
count comes out wrong, print `conciliarPartLines(...)` for that volume and compare it with the
fixture's lines before changing a pinned number.

- [ ] **Step 11: Add the table to the cardinal note rule**

`tools/test/mappings.test.ts`'s `describe('every curated table entry carries a non-empty note')` lists `DATE_CORRECTIONS`, `DUPLICATE_MERGES`, `ADJUDICATED_DISTINCT`, `CIRCUMSCRIPTION_ERECTIONS` and the two `SERIES_*` tables — and not this one (Review Focus 4). Add, with the import beside the file's others:

```ts
  it('ACTA_CURATED_REFERENCES', () => {
    for (const [key, entry] of Object.entries(ACTA_CURATED_REFERENCES)) {
      expect(entry.evidence, key).toBeTruthy();
    }
  });
```

- [ ] **Step 12: Regenerate the registry and move the four pinned counts**

Run: `npm run harvest && npm run render`

Then, in `tools/test/harvest-data.test.ts`'s test `pins the matched count per source, so a silent drop fails loudly`, make exactly these four changes, each with a comment naming phase 2d:

1. In the `bySource` object: `'1964': 80` → `82`, `'1965': 58` → `61`, `'1966': 106` → `117`.
2. `expect(cited).toHaveLength(225 + 130 + 144 + 800 + 1421 + 66 + 110 + 1 + 5 + 187);` → the same sum `+ 16`.
3. In the `byClass` object, add the three genres the council's documents carry, which no other cited document does: `constitution: 4`, `declaration: 3`, `decree: 9`.
4. In the next test, `pins the sample's references per pope …`, add `'oec:vatican-ii': 16` to the `byIssuer` object (the sixteen have `acta.year < 2015`, so they count in `sample`).

Add above each a one-line comment in the file's idiom, e.g. `// Phase 2d (spec §12): the sixteen conciliar documents by curated reference -- 1964 +2, 1965 +3, 1966 +11.`

- [ ] **Step 13: Run the whole suite**

Run: `npm run check`

Expected: PASS — `1064 passed` becomes `1069 passed` (the five new tests: the evidence pin of Step 8, the liveness pin of Step 9, the two of Step 10, and the note rule of Step 11), `8569 documents and 4 assessments checked, 0 failure(s)`. A failure in invariant 25 means a page collides with an existing reference; all eighteen were clear on 2026-09-27, so investigate rather than adjust the row.

- [ ] **Step 14: Commit**

```bash
git add tools/src/acta/curation.ts tools/src/acta/conciliar.ts tools/test/acta-join.test.ts tools/test/harvest-data.test.ts tools/test/mappings.test.ts data/documents/vatican-ii.json registry/documents.md
git status --short   # must show nothing else; no fixture, no ACTA_SOURCES
git commit -F - <<'MSG'
Cite the sixteen documents of Vatican II in AAS 56-58

The AAS enters the council's documents in a part of its own, which index.ts
reads as a part and then skips as it skips the dicasteries', so all sixteen
`oec:vatican-ii` records carried no reference -- the last issuer at zero the
corpus can reach. Sixteen curated rows write them, each quoting the page as
read in the volume, on the ruling that a conciliar act printed under the pope
who promulgated it is the same document (ass volumes spec §5).

The pipeline is untouched, and so is every fixture: a reader for the part was
refused on its measured reach (spec §12.2). Three new tests hold the rows to
their evidence -- that a row's page is the page its evidence quotes, that the
index line it quotes is still printed in its fixture, and that the four
conciliar parts still hold eighteen entries -- and ACTA_CURATED_REFERENCES
joins the cardinal note rule, which had never listed it.

The part's own lines are read by a module of its own that nothing in the harvest
path imports: the accounting the refused reader would have bought, kept where
the lines are read.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
MSG
```

---

## Task 2: The report generator

**Files:**
- Create: `tools/acta-conciliar-report.ts`
- Modify: `tools/regenerate-reports.ts` (`REPORTS`)
- Create (generated): `docs/superpowers/reports/2026-09-27-acta-vatican-ii.md`
- Regenerated: the twelve other reports under `docs/superpowers/reports/`

**Interfaces:**
- Consumes: `conciliarPartLines` from `./src/acta/conciliar.js` and `ACTA_CURATED_REFERENCES` from `./src/acta/curation.js` (both Task 1's); `ACTA_SOURCES`, `loadActaIndexes` from `./src/acta/join.js`; `DocumentRecord` from `./src/types.js`.
- Produces: a generator that prints markdown to **stdout** and a `REPORTS` row naming it. Nothing imports it.

- [ ] **Step 1: Read a sibling generator**

Read `tools/ass-era-report.ts` lines 1–60 and its last 40 lines. The contract: a generator prints
markdown to **stdout** (`regenerate-reports.ts` captures it and writes the file), reads `data/` as
the harvest wrote it, re-runs the join itself where it needs one, computes every figure it states,
and carries a `Usage:` line in its header comment.

- [ ] **Step 2: Write the generator's skeleton and confirm its inputs**

Create `tools/acta-conciliar-report.ts` with this header and imports, and nothing else yet:

```ts
/**
 * Phase 2d's report (acta volumes spec §12): the sixteen documents of the Second Vatican Council
 * and the references they now carry, with the measurement that refused the council's index part a
 * reader of its own.
 *
 * Reads the fixtures, the curated table and data/ only -- never the volume store -- so that CI's
 * `npm run reports -- --skip-store` regenerates it like any other report.
 *
 * Every figure the prose states is computed here: the tally of skipped part headings from the
 * parser's own `skippedParts`, the parts' entries from the fixtures (src/acta/conciliar.ts), the
 * references from ACTA_CURATED_REFERENCES, and the corpus totals from data/.
 *
 * Usage: npx tsx tools/acta-conciliar-report.ts > docs/superpowers/reports/2026-09-27-acta-vatican-ii.md
 */
import { readFileSync, readdirSync } from 'node:fs';
import { ACTA_SOURCES, loadActaIndexes } from './src/acta/join.js';
import { ACTA_CURATED_REFERENCES } from './src/acta/curation.js';
import { conciliarPartLines } from './src/acta/conciliar.js';
import type { DocumentRecord } from './src/types.js';

const docs = readdirSync('data/documents').filter((f) => f.endsWith('.json'))
  .flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[]);
const { parsed } = loadActaIndexes(ACTA_SOURCES.filter((s) => s.kind !== 'ass'));
```

Run: `npx tsx tools/acta-conciliar-report.ts`
Expected: no output and no error. If `loadActaIndexes` warns of a missing fixture, stop — the
generator must run offline against the committed fixtures alone.

- [ ] **Step 3: Compute the four measurements, and check each against a known value before writing prose**

Add the computations, and print them to stderr once to check them against the values the spec
records (spec §12.1, §12.3). Each must agree before it is written into prose:

```ts
// §2's tally: the parser's own skippedParts over every non-ASS source.
const skipped = new Map<string, string[]>();
for (const [key, r] of parsed) for (const h of r.skippedParts) {
  const n = h.replace(/\s+/g, ' ').trim();
  skipped.set(n, [...(skipped.get(n) ?? []), key]);
}
const council = [...skipped].filter(([h]) => /OECUMENICI|PATRUM/i.test(h) && /CONCILI/i.test(h));
const synod = [...skipped].filter(([h]) => /SYNOD/i.test(h));
// §3's entries: the four parts' lines.
const parts = [['54', 1962], ['56', 1964], ['57', 1965], ['58', 1966]] as const;
const entries = parts.map(([vol, year]) => [vol, year,
  conciliarPartLines(readFileSync(`tools/fixtures/acta/aas-${vol}-${year}.txt`, 'utf8'))] as const);
```

Expected when printed: `skipped.size` **107**; `council.length` **3** headings over **4** sources
(`ACTA PATRUM S. CONCILII OECUMENICI VATICANI II` in 1962, `III - ACTA Ss. OECUMENICI CONCILII` in
1964, `II - ACTA SS. OECUMENICI CONCILII` in 1965 and 1966 — the wrapped `VATICANI II` is not part
of the captured heading); `synod.length` **4** over **8** sources (`II – ACTA SYNODI EPISCOPORUM` and `II. – ACTA SYNODI EPISCOPORUM` are one heading in two OCR spellings, counted separately by the tally); the four parts' line counts
**1, 2, 3, 12**. A different number here is a finding: report it rather than adjusting the prose
to match.

- [ ] **Step 4: Write the report body**

Print the markdown, in the sections the era reports use. Every number comes from Step 3's values or
from `docs`; nothing is typed.

1. **§1 The hole and the ruling** — coverage over the whole corpus (records with `acta` of all
   records) and the issuers at zero with their counts, so that *Benedict XIV 43* and *Leo XIV 40*
   are computed, and the ruling that gives the sixteen a reference (ass volumes spec §5).
2. **§2 The part the parser skips** — `skipped.size`, the council's headings with their sources,
   the synod's listed separately as a different body, and why the reach refused a reader.
3. **§3 What the four parts hold** — one row per entry of all four parts: its line as printed, the
   page it ends in, and either the document id that now cites it or the note that the registry
   holds no record of it. Eighteen rows, sixteen of them with an id.
4. **§4 The agreements** — every date the part prints against its record's `date`, and the
   genre-word counts (*Constitutio*, *Decretum*, *Declaratio*) against the records' `genre`
   counts, both computed and both stated as agreements or disagreements found.
5. **§5 The references written** — the sixteen rows with volume, year, page, and the first sentence
   of each `evidence`.
6. **§6 What stays open** — the two entries no record holds, quoted; and the records still carrying
   no reference, by issuer, computed.

- [ ] **Step 5: Read the report before registering it**

Run: `npx tsx tools/acta-conciliar-report.ts | less`

Check three things by hand: §3's table holds eighteen rows and sixteen ids; §4 reports the
agreements as found rather than asserted; and no sentence states a number that Step 3 did not
compute. A report that states an uncomputed number is the drift issue #58 was opened about.

- [ ] **Step 6: Register the report and regenerate all of them**

In `tools/regenerate-reports.ts`, add to `REPORTS`, after the three ASS era rows:

```ts
  { out: '2026-09-27-acta-vatican-ii.md', generator: 'tools/acta-conciliar-report.ts', args: [] },
```

Run: `npm run reports`

Expected: fourteen reports written, none skipped (the ASS survey's store is present here —
`~/development/sources/ASS/pdf` held 42 PDFs on 2026-09-27). Then `git status --short
docs/superpowers/reports/`: the new report, plus every report whose corpus totals move by the
sixteen references. Read the diff of `2026-09-13-acta-volumes-1959-1977.md` — its §1.4 stated the
sixteen pages as awaiting a curated reference and must now state that they carry one.

- [ ] **Step 7: Verify CI's subset regenerates clean**

Run: `npm run reports -- --skip-store && git diff --exit-code docs/superpowers/reports/`
Expected: exit 0, with only the ASS survey skipped. A non-empty diff means the new generator is not
deterministic or reads the store — fix that; never commit a report CI cannot reproduce.

- [ ] **Step 8: Commit**

```bash
git add tools/acta-conciliar-report.ts tools/regenerate-reports.ts docs/superpowers/reports/
git commit -F - <<'MSG'
Report phase 2d from its own generator

Every committed report is generated, because a count stated in prose must be
computed or pinned. This one computes what the phase measured: the tally of
skipped part headings from the parser's own `skippedParts`, the eighteen entries
of the four conciliar parts, the date and genre-word agreements, the sixteen
references, and what is still uncited.

The generator touches no store, so CI regenerates it with the rest.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
MSG
```

---

## Task 3: The documentation

**Files:**
- Modify: `README.md` (the phase 2b-ii-b paragraph; a new 2d paragraph after the 2c-ii-d one)
- Modify: `SCHEMA.md` (the `acta` paragraph)

**Interfaces:**
- Consumes: the report from Task 2 — every figure quoted here must appear there, or be pinned by a test.
- Produces: nothing code depends on.

- [ ] **Step 1: Correct the README's standing claim**

`README.md` currently states the hole as live, in the phase 2b-ii-b paragraph:

> The sixteen documents of the Second Vatican Council are in those volumes under a part of their own, `Acta Ss. Oecumenici Concilii Vaticani II`, which the parser skips: they stay under `oec:vatican-ii` with no reference, their pages listed in the report for a curated one.

Rewrite that sentence so it records what 2b-ii-b found and points forward: the pages were read and listed there, and phase 2d writes them. Do not restate 2d's measurements in 2b-ii-b's paragraph.

- [ ] **Step 2: Add the phase 2d paragraph**

After the phase 2c-ii-d paragraph, add one in the same shape as the other phase paragraphs (they open with the phase, the issue, the spec section and the report, then state what was measured). It must carry: the sixteen references and their volumes; that the part is read as a part and skipped, and why; the measured reach that refused it a reader (four parts over every source, 18 entries, 16 the registry's); the two entries no record holds; and the corpus coverage after the phase. Every number must be one the Task 2 report computes or a test pins.

- [ ] **Step 3: Name the curated case in SCHEMA.md**

`SCHEMA.md`'s **`acta`** paragraph enumerates how a reference comes to be written — the index sources, the matcher, the reprints, the page corrections — and names **no curated reference at all**. Add one clause: a reference the chronological index cannot give is written from a curated table quoting the page (`ACTA_CURATED_REFERENCES`, `tools/src/acta/curation.ts`), either because no entry exists (the Code volumes) or because the entry stands in a part the parser does not read, the council's sixteen being that case.

- [ ] **Step 4: Verify the prose against the data**

Run: `npm run check`
Expected: PASS, unchanged from Task 1's run (these are documentation edits; `validate` reads `data/`, not the README).

Then re-read your two new paragraphs beside `docs/superpowers/reports/2026-09-27-acta-vatican-ii.md` and confirm every figure appears there. A figure in the README that the report does not compute is the drift issue #58 was opened about.

- [ ] **Step 5: Commit**

```bash
git add README.md SCHEMA.md
git commit -F - <<'MSG'
Record phase 2d in the README and SCHEMA

The README stated the conciliar hole as standing, which it no longer is; the
2b-ii-b paragraph now records what that phase found and 2d's has the phase.
SCHEMA's `acta` paragraph enumerates how a reference is written and had never
named a curated one: it now names the two cases, no entry at all and an entry in
a part the parser does not read.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
MSG
```

---

## Task 4: Verification, the issues, and the PR

**Files:** none modified. This task produces the PR and the issue changes.

- [ ] **Step 1: Verify the whole branch**

Run each, and paste the real output into the PR body — no claim without it:

```bash
npm run check                                   # 1069 tests, 8569 documents, 0 failures
npm run reports -- --skip-store && git diff --exit-code docs/superpowers/reports/   # exit 0
git status --short                              # clean but for the worktree's node_modules symlink
git diff --stat main...HEAD                     # the files this plan names, and no others
```

Then confirm the two constraints the spec is strictest about:

```bash
git diff main...HEAD --name-only | grep -E 'tools/fixtures/|src/acta/(index|match|create)\.ts' || echo 'no fixture and no pipeline file touched'
git diff main...HEAD -- tools/src/acta/join.ts | grep -c retrieved   # expect 0
```

- [ ] **Step 2: Confirm the sixteen in the rendered registry**

Run: `grep -c 'AAS 5[678]' registry/documents.md` and spot-check three rows against spec §12.3's table (`grep -n 'lumen-gentium\|gaudium-et-spes\|inter-mirifica' registry/documents.md`). The reference column is headed `Acta`.

- [ ] **Step 3: Open the PR**

```bash
git push -u origin HEAD
gh pr create --title 'Cite the sixteen documents of Vatican II in AAS 56-58 (phase 2d)' --body-file <the body>
```

The body: what the phase did, the measurement that refused the reader, the verification output from Step 1, `Closes #36`, and that #56 keeps its §2 alone. End with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

- [ ] **Step 4: Comment on #56 and open the successor issue**

On #56: §3 is answered — the sixteen are cited by curated rows, the general rule refused on measurement — so the issue now holds §2 alone, the ASS 8 transposition.

Open a new issue for the registry question the phase raised and did not answer: whether the Fathers' *Nuntius ad universos homines* of 20 October 1962 (AAS 54 (1962) 822) and the *Nuntii a Patribus Oecumenicae Synodi hominibus missi* of 8 December 1965 (AAS 58 (1966) 10) belong in the registry, and under what issuer, neither being one of the sixteen. Quote both index lines, note that AAS 58's was read in the volume and AAS 54's was not, and link the phase report.

- [ ] **Step 5: Await review**

CodeRabbit reviews every PR here. Do not merge on your own: the owner pastes the findings, and each is verified against the current code before anything is changed — a finding already satisfied is answered with where it is satisfied, not implemented again.
