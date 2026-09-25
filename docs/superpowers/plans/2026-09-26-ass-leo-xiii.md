# The *Acta Sanctae Sedis* under Leo XIII (phase 2c-ii-c) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Join Leo XIII's twenty-one unjoined volumes — ASS 13–22, 24–32, 34, 35 — to the shelves. ASS 12, 23 and 33 are the sample's and ASS 36 carries his last months (both already joined), so this completes the pontificate and leaves only Pius IX.

**Architecture:** 2c-i's shape with the tooling 2c-ii-a built and 2c-ii-b generalised: `ACTA_SOURCES` rows, the scan to fixtures, a curation round that counts before it writes a rule, the join, the pins, an era report from `tools/ass-era-report.ts 13-35`. The scanner and the summa parser are finished work; this phase adds sources and curated rows, and any rule it reaches for is measured over all 41 volumes first.

**Tech Stack:** TypeScript (ESM, `tsx`), vitest, `gh`.

**Spec:** `docs/superpowers/specs/2026-09-21-ass-volumes-design.md` — §2 (fetch and fixtures), §4 (the summa), §5 (the join), §6 (curation), §7 (report), §10 decision 3 and its *Measured (2026-09-26, phase 2c-ii-b)* section.

## What the survey predicts, and why this era is not the last one

| Vol | Years | Pages | Summa | Acts | Rows | Claimed | Unclaimed | Omits | Defects |
|---|---|---|---|---|---|---|---|---|---|
| 13 | 1880 | 592 | 569–579 | 9 | 16 | 9 | 7 | 0 | 7 |
| 14 | 1881 | 591 | 569–575 | 3 | 9 | 2 | 7 | 1 | 6 |
| 15 | 1882 | 623 | 603–610 | 1 | 10 | 1 | 9 | 0 | 8 |
| 16 | 1883–84 | 656 | 557–564 | 3 | 7 | 2 | 5 | 1 | 6 |
| 17 | 1884 | 624 | 603–610 | 4 | 10 | 3 | 7 | 1 | 4 |
| 18 | 1885 | 768 | 603–610 | 9 | 12 | 6 | 6 | 3 | 3 |
| 19 | 1886–87 | 768 | 604–610 | 6 | 13 | 6 | 7 | 0 | 3 |
| **20** | 1887 | 656 | 635–642 | 9 | **0** | **0** | 0 | 9 | 5 |
| 21 | 1888 | 768 | 744–750 | 13 | 19 | 13 | 6 | 0 | 3 |
| 22 | 1889–90 | 767 | 750–756 | 5 | 10 | 5 | 5 | 0 | 4 |
| 24 | 1891–92 | 768 | 751–760 | 9 | 12 | 8 | 4 | 1 | 5 |
| 25 | 1892–93 | 767 | 751–760 | 9 | 12 | 7 | 5 | 2 | 4 |
| **26** | 1893–94 | 768 | 755–762 | 9 | **0** | **0** | 0 | 9 | 3 |
| **27** | 1894–95 | 768 | 753–760 | 9 | **47** | 4 | **43** | 5 | 8 |
| 28 | 1895–96 | 768 | 753–761 | 10 | 9 | 6 | 3 | 4 | 6 |
| 29 | 1896–97 | 768 | 759–766 | 4 | 9 | 3 | 6 | 1 | 6 |
| 30 | 1897–98 | 767 | 753–761 | 6 | 11 | 4 | 7 | 2 | 7 |
| 31 | 1898–99 | 768 | 759–768 | 10 | 13 | 9 | 4 | 1 | 6 |
| 32 | 1899–00 | 768 | 761–768 | 4 | 7 | 2 | 5 | 2 | 5 |
| 34 | 1901–02 | 768 | 763–768 | 10 | 9 | 6 | 3 | 3 | 5 |
| 35 | 1902–03 | 768 | 759–768 | 20 | 11 | 8 | 3 | 12 | 6 |
| **total** | 1880–1903 | **15,259** | | **162** | **246** | **104** | **142** | **57** | **110** |

**104 of 246 claimed — 42.3 %**, against Pius X's 70.6 %. Do not plan as though that were the same kind of number.

**The act density is the real difference.** 162 acts over 15,259 pages, where Pius X gave 181 over 3,721. ASS 15 yields **one act in 623 pages**; ASS 14 three in 591. The 1880s are the thinnest stretch of the series the registry will ever join, and the shelf behind them is thinner too: Leo XIII's letters shelf is not Pius X's.

**And three volumes depress the rate for reasons that are not the volumes' fault.** Excluding them, 100 of 199 rows claim — 50.3 %, still below Pius X but a different story from 42.3 %.

## Four things this era should expect

1. **ASS 20 and ASS 26 have no papal part the parser can find** (survey §4b). ASS 20's summa opens `SUMMA ACTORUM / QUAE IN HOC VOLUMINE XX. CONTINENTUR` and then goes **straight into its rows** — `Litterae SSmi D. N. Leonis PP. XIII ad Emum Card. Marianum Rampolla…` — with no class heading at all. ASS 26's summa opens on a **dicastery** (`EX S. CONGR. RITUUM`), its papal part elsewhere in the summa. Both show 0 rows and all their acts as "omitted", which is an artefact: **the summa is the completeness check, not the source.** Both volumes scan 9 acts each and will yield references regardless. What they lose is the ability to say the volume's own index agrees — report that, and decide per volume whether a rule is worth writing.
2. **ASS 27's 43 unclaimed rows are mostly not the pope's.** Its papal part runs on past its end into the dicasteries, because the part-end heading is one the parser does not know, so 47 rows are counted as papal where only a handful are. Its `unclaimed` is a false floor. Reading the volume's own part-end is the fix; until then the number must not be reported as though the shelf had failed 43 times.
3. **Leo XIII has a briefs shelf, and Pius X did not.** 8 records (`pontiffs.ts`, `categories.ts`). The brevia that 2c-ii-b had to hold — 36 of its 50 holds — can match here. That is the one respect in which this era should go *better* than the last, and the era report should say by how much.
4. **ASS 16 carries a bound-in supplement**, as ASS 38 did: its PDF is `ASS-16-1883-84-1-576+supplemento-17-96-ocr.pdf`, a volume of 1–576 plus a supplement paginated 17–96. Its summa sits at pp. 557–564, inside the volume proper. Check, as 2c-ii-b did for ASS 38, that no scanned entry falls in the supplement and that no page of it carries `Pontificatus Nostri`.

## Global Constraints

- **Nothing is guessed.** A reading is curated only where the volume's own line is quoted (`ASS_READINGS`); a shape recurring across volumes is a rule, and a rule is measured over all 41 volumes with `tools/survey-ass.ts` before it is accepted (spec §3, §6). With 21 volumes in scope, "recurs" is easier to satisfy than it was in 2c-ii-b — count before writing either way.
- **`series: 'ASS'` entries are joined, never created** (spec decision 1).
- The store is the source: `~/development/sources/ASS/{txt,pdf}/`. PDFs and text are never checked in.
- `npm run check` passes at every commit, and `npm run harvest && npm run render` runs before any commit that moves data.
- Every count stated in prose is computed by a generator or asserted by a pin. Prose naming acts reads them from the tables.
- Work in a worktree under `.worktrees/` from local `main`, branch `feat/ass-leo-xiii`; one PR, and a comment on [#25](https://github.com/CatholicOS/cmddr/issues/25).

---

## File map

| File | Responsibility |
|---|---|
| `tools/src/acta/join.ts` (modify) | Twenty-one `ass(...)` rows under a phase comment. |
| `tools/fixtures/acta/ass-{13..35}-*.{entries.json,summa.txt}` (create) | 42 fixtures, written by `tools/scan-ass.ts 13-35`. |
| `tools/fixtures/acta/README.md` (modify) | A row per volume, and a note on ASS 16's supplement. |
| `tools/src/acta/curation.ts` (modify) | `ASS_READINGS`, `ACTA_MATCH_OVERRIDES` and `ACTA_SHARED_PAGES` rows, each quoting its page. |
| `tools/src/acta/summa.ts` (modify, only if measured) | A papal-head form or part-end for ASS 20, 26, 27 — a rule, so measured over 41 volumes first. |
| `docs/superpowers/reports/2026-09-26-ass-volumes-leo-xiii.md` (create) | `npx tsx tools/ass-era-report.ts 13-35`. |
| `tools/test/harvest-data.test.ts` (modify) | Pins: matched per volume, held and its reasons, readings, corpus counts. |
| `data/`, `registry/` (regenerate) | The references this era writes. |
| `README.md`, spec §10 (modify) | The phase paragraph and a *Measured (…, phase 2c-ii-c)* section. |

---

## Task 1 — The twenty-one sources

- [ ] Add twenty-one `ass(...)` rows to `ACTA_SOURCES` under a phase comment naming 2c-ii-c and spec §10 decision 3, each with the PDF's name as the ASS index page links it and `retrieved: '2026-09-22'` (when the series was fetched for the survey). The two-year volumes take a `yearTo`: 16 (1884), 19 (1887), 22 (1890), 24 (1892), 25 (1893), 26 (1894), 27 (1895), 28 (1896), 29 (1897), 30 (1898), 31 (1899), 32 (1900), 34 (1902), 35 (1903).
- [ ] `npm run check` — expect failures only where a test asserts the ASS source list or reads an absent fixture. Record which.

## Task 2 — The scan

- [ ] `npx tsx tools/scan-ass.ts 13-35`, which writes both fixtures per volume and prints each volume's counts.
- [ ] Compare every volume against the survey table above. **A divergence is a finding**: the same scanner runs in both paths, so a difference means the fixture path sees something the store pass did not.
- [ ] Add the rows to `tools/fixtures/acta/README.md`.
- [ ] ASS 16: confirm the summa located is the volume's own and that no entry falls in the supplement; check whether any page of the supplement carries `Pontificatus Nostri`.

## Task 3 — The curation round

- [ ] Group every defect, unclaimed summa row and summa-omitted act by reason, per volume, **before writing anything**. With 110 defects this is the largest round the series has had.
- [ ] Decide rule against row by counting: a shape in three or more volumes is a rule and is measured over all 41 before acceptance; a shape in one is an `ASS_READINGS` row quoting the volume's own heading and dateline.
- [ ] ASS 20, 26 and 27: decide whether the summa parser learns their papal part. This is a `summa.ts` rule with corpus-wide reach — measure it, and if it is not worth writing, say so in the report and leave the volumes' completeness check blind rather than curate around it.
- [ ] Any ambiguity is settled by a curated row quoting its evidence or reported as an editorial question — never guessed. 2c-ii-b's six all had a cause; expect the same and find it.
- [ ] Any page two matched acts share needs an `ACTA_SHARED_PAGES` row, or invariant 25 withholds **both** references.

## Task 4 — The join, the pins, the report

- [ ] `npm run harvest && npm run render`; record the summary line's movement.
- [ ] Update the pins to the state each commit leaves, in the shape 2c-i's and 2c-ii-b's already have.
- [ ] `npx tsx tools/ass-era-report.ts 13-35 > docs/superpowers/reports/2026-09-26-ass-volumes-leo-xiii.md`. The generator is era-agnostic since PR #54; if it needs a change for this era, the change must keep 36–40 and 1–11 working.
- [ ] The report's findings answer: how much of Leo XIII's shelf now carries a reference, what the brevia gained now that a shelf exists for them, what ASS 20, 26 and 27 cost, and what 2c-ii-d should expect from Pius IX's eleven.

## Task 5 — Documentation, PR, and the issue

- [ ] README's phase paragraph with the era's numbers; spec §10 gains *Measured (…, phase 2c-ii-c)*.
- [ ] `npm run check` green; PR opened; a comment on [#25](https://github.com/CatholicOS/cmddr/issues/25).
