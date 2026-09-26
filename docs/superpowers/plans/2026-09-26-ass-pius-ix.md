# The *Acta Sanctae Sedis* under Pius IX (phase 2c-ii-d) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Join Pius IX's ten unjoined volumes — ASS 2–11 — to the shelves. ASS 1 is the sample's (joined by 2c-i, and it reads no act by rule to this day), so these ten complete the pontificate, the series, and phase 2c-ii. ASS 11 carries two popes: Pius IX to his death on 7 February 1878 and Leo XIII from his election on 20 February, the mirror of ASS 36.

**Architecture:** 2c-i's shape with the tooling 2c-ii-a built and the two eras since have generalised: `ACTA_SOURCES` rows, the scan to fixtures, a curation round that counts before it writes a rule, the join, the pins, an era report from `tools/ass-era-report.ts 1-11`. The scanner and the summa parser are finished work; this phase adds sources and curated rows, and any rule it reaches for is measured over all 41 volumes first.

**Tech Stack:** TypeScript (ESM, `tsx`), vitest, `gh`.

**Spec:** `docs/superpowers/specs/2026-09-21-ass-volumes-design.md` — §2 (fetch and fixtures), §4 (the summa), §5 (the join), §6 (curation), §7 (report), §10 decision 3 and its *Measured (2026-09-26, phase 2c-ii-c)* section.

## What the survey predicts

| Vol | Years | Pages | Summa | Acts | Rows | Claimed | Unclaimed | Omits | Defects | of them brevia |
|---|---|---|---|---|---|---|---|---|---|---|
| 2 | 1867 | 719 | 695–701 | 1 | 3 | 1 | 2 | 0 | 4 | 2 |
| 3 | 1867 | 696 | 665–670 | 5 | 15 | 4 | 11 | 1 | 6 | 0 |
| 4 | 1868 | 717 | 684–690 | 9 | 9 | 7 | 2 | 2 | 3 | 1 |
| 5 | 1869–70 | 712 | 691–696 | 6 | 15 | 6 | 9 | 0 | 9 | 0 |
| **6** | 1870–71 | 776 | 597–603 | 7 | 31 | 6 | **25** | 1 | 11 | 1 |
| **7** | 1872–73 | 784 | 751–760 | 5 | **0** | **0** | 0 | 5 | 7 | 1 |
| **8** | 1874–75 | 748 | 727–733 | 6 | 24 | 4 | **20** | 2 | 14 | 0 |
| 9 | 1876 | 690 | 669–674 | 10 | 10 | 2 | 8 | 8 | 16 | 2 |
| 10 | 1877 | 768 | 616–622 | 5 | 9 | 3 | 6 | 2 | 10 | 2 |
| 11 | 1878 | 646 | 621–626 | 7 | 12 | 6 | 6 | 1 | 6 | 0 |
| **total** | 1867–1878 | **7,256** | | **61** | **128** | **39** | **89** | **22** | **86** | **9** |

**39 of 128 claimed — 30.5 %**, against Leo XIII's 46.3 % and Pius X's 71.1 %. Spec §10 budgets this era at 30 %, and that is the figure to plan against.

## Six things this era should expect

1. **The shelf is the ceiling here, and it is a hard one.** Pius IX is a **flat-era pope** (`era: 'flat'`, `shelves: []`, `tools/src/mappings/pontiffs.ts`): vatican.va publishes him as one reverse-chronological list, not as shelves, so every one of his **75** registry records carries `source.shelf: null`. **29** of them are dated 1867–1878, the years these ten volumes print — 1867 3, 1868 3, 1870 6, 1871 6, 1872 1, 1873 3, 1874 3, 1875 2, 1876 1, 1877 1 — and **1869 and 1878 hold none at all**, which matters because ASS 5 is the 1869–70 volume and ASS 11 the 1878 one. Add the **4** Leo XIII records of 1878 that ASS 11's second half could reach and the era's whole ceiling is **33 shelf records against 61 scanned acts**. Twenty of the 29 are encyclicals. **No entry of Pius IX has ever matched**: the registry carries 0 ASS references for him today. Expect the holds to outnumber the matches by more than they did in either earlier era, and expect the report's §4 to be the phase's real finding — *what the registry does not hold of Pius IX*, not *what the scanner did not read*.
2. **ASS 1 and ASS 7 find no papal part** (survey §4b) — two of the four such volumes in the series fall in this era. ASS 7's summa opens `EX ACTIS AD INSTAR CONSISTORIALIUM.` and lists the pope's own acts under the dicastery that issued them; ASS 1's does the same. Both show 0 rows and all their acts as omitted, which is an artefact: **the summa is the completeness check, not the source**. ASS 7 still scans 5 acts. Decide per volume whether a rule is worth writing; if not, say so in the report and leave the check blind rather than curate around it, as 2c-ii-c did for ASS 20 and ASS 26.
3. **The V-for-U spellings are this era's rule candidate, and 2c-i already paid for them by hand.** ASS 1's three acts are `ASS_READINGS` rows (`ASS:1:193`, `ASS:1:578`, `ASS:1:744`), and each row's own `evidence` names the cause: `ALLOCVTIO` (p. 193 l. 12, "the OCR's V for U") and `LITERAE APOSTOLICAE` (pp. 577, 744, "the volume's single-T spelling") are no class headings, so nothing anchored. The shape is not ASS 1's alone: the store text prints `ALLOCVTIO` **7 times in ASS 2** and `LITERAE` **twice in ASS 2 and four times in ASS 4**. Three volumes is a rule by this project's own threshold — **and the blast radius is real and must be counted first**: most of those lines are running headers carrying a page number (`264 ALLOCVTIO.`, `578 LITERAE APOSTOLICAE.`), not act headings, and a `CLASS_HEADINGS` entry that fires on a running header opens a spurious act on every page of the act's body. Measure over all 41 volumes with `tools/survey-ass.ts` before accepting, and expect the act count to move at ASS 1, 2 and 4 and nowhere else. **If it is accepted, ASS 1's fixture and 2c-i's sample report and pins move with it**, exactly as 2c-ii-c's abbreviated months moved 2c-ii-b's — and each of the three `ASS:1:*` rows must be re-checked: a reading is a hard error once it answers no finding, and a row whose act the scan now reads correctly is either a replacement (legitimate) or stale (must go).
4. **The unclaimed rows are the era's largest number and they are not the parser's fault.** 89 of 128 rows unclaimed, 25 in ASS 6 and 20 in ASS 8. This is *not* ASS 27's shape: survey §4b read every caps line inside every papal part of all 41 summae and found no unknown dicastery heading but ASS 27's destroyed one, and both these volumes' parts end at a heading the parser knows (`EX SECRETARIA BREVIUM.`, `EX S. CONGR. S. R. U. ÍNQUISIT.`). So these are papal rows the **scanner did not read** — the honest floor of the 1870s, the series' worst decade at 31 %. Read a sample of them before writing anything, and report what they are.
5. **ASS 7 carries the one genuine page offset in the series**, PDF pp. 496–547 printing +2 (p. 496 prints `498`, p. 547 prints `549`), already curated in `ASS_PAGE_OFFSETS` (`curation.ts`), inside which `headerAgreesASS` refuses as `headerAgrees` does. It cost nothing downstream because no act opens in that stretch *today*. If this era's scan opens one there, **its page is the printed page and not the PDF page**, and it must be read and curated by hand — never handed 502 for PDF p. 500.
6. **ASS 10 carries a bound-in supplement**, as ASS 16 and ASS 38 do and as its PDF's name records: `ASS-10-1877-1-639+supplemento-321-448-ocr.pdf` — 639 pages of volume plus a 128-page supplement paginated 321–448, and the volume's own summa at pp. 616–622 sits inside the volume proper. Check, as 2c-ii-b did for ASS 38 and 2c-ii-c for ASS 16, that no scanned entry falls in the supplement and that no page of it carries `Pontificatus Nostri`.

**And one arithmetic trap: ASS 2 and ASS 3 are both 1867.** The `ass()` helper keys and names fixtures by volume (`ass-02-1867.*`, `ass-03-1867.*`), so nothing collides, but every count, table row and reference in the report must name the **volume**, not the year.

## Global Constraints

- **Nothing is guessed.** A reading is curated only where the volume's own line is quoted (`ASS_READINGS`); a shape recurring across volumes is a rule, and a rule is measured over all 41 volumes with `tools/survey-ass.ts` before it is accepted (spec §3, §6). Count before writing either way.
- **`series: 'ASS'` entries are joined, never created** (spec decision 1). Every unmatched entry is held; none is minted.
- The store is the source: `~/development/sources/ASS/{txt,pdf}/`. PDFs and text are never checked in.
- `npm run check` passes at every commit, and `npm run harvest && npm run render` runs before any commit that moves data.
- Every count stated in prose is computed by a generator or asserted by a pin. Prose naming acts reads them from the tables, never from a list typed by hand (the lesson of PR #51).
- A rule that reaches a volume of an earlier era regenerates that era's fixtures, report and pins in the same commit (the precedent: 2c-ii-c's abbreviated months moving ASS 39 and 2c-ii-b's report).
- Work in a worktree under `.worktrees/` created from local `main` (not `EnterWorktree`, whose base would drop this plan's own commit), branch `feat/ass-pius-ix`; one PR, and a comment on [#25](https://github.com/CatholicOS/cmddr/issues/25).

## Review Focus

Five ways this era can write something false, none of them exercised by a test that exists today:

1. **A V-spelling class heading firing on a running header.** `578 LITERAE APOSTOLICAE.` and `264 ALLOCVTIO.` are body-page running heads, not act headings; a rule that reads them opens a spurious act on every page of the act it is running over. Pinned in Task 3 by the corpus measurement and by ASS 1's and ASS 2's entry pages.
2. **A reference inside ASS 7's offset range.** An act opening at PDF p. 500 must cite printed p. 502 — or be held. Pinned in Task 3.
3. **An act of ASS 11 matched to the wrong pope.** Pius IX died 7 February 1878 and Leo XIII was elected on 20 February; an entry dated between must match neither, and a Pius IX entry dated after 7 February 1878 is a date misread and not a match. Pinned in Task 4.
4. **An entry of 1869 or 1878 matching anything of Pius IX.** The registry holds no record of his in either year, so any match there is a date misread or a wrong issuer. Pinned in Task 4.
5. **Two short acts on one page.** Nine of the era's defects are brevia and the volumes set brevia two to a page; invariant 25 withholds **both** references unless `ACTA_SHARED_PAGES` quotes the page. Pinned in Task 3.

---

## File map

| File | Responsibility |
|---|---|
| `tools/src/acta/join.ts` (modify) | Ten `ass(...)` rows under a phase comment naming 2c-ii-d and spec §10 decision 3. |
| `tools/fixtures/acta/ass-{02..11}-*.{entries.json,summa.txt}` (create) | 20 fixtures, written by `tools/scan-ass.ts 2-11`. |
| `tools/fixtures/acta/README.md` (modify) | A row per volume, a note on ASS 10's supplement and on ASS 7's offset. |
| `tools/src/acta/curation.ts` (modify) | `ASS_READINGS`, `ACTA_MATCH_OVERRIDES`, `ACTA_SHARED_PAGES` and, if an act opens there, `ASS_PAGE_OFFSETS` checks — each row quoting its page. |
| `tools/src/acta/ass-headings.ts` (modify, only if measured) | `ALLOCVTIO` / `LITERAE` as class headings — a rule, so measured over all 41 volumes first. |
| `tools/src/acta/summa.ts` (modify, only if measured) | A papal-head form for ASS 7 — a rule, same discipline. |
| `docs/superpowers/reports/2026-09-26-ass-volumes-pius-ix.md` (create) | `npx tsx tools/ass-era-report.ts 1-11`. |
| `docs/superpowers/reports/2026-09-22-ass-survey.md`, `2026-09-22-ass-volumes-sample.md` (regenerate, if a rule reaches them) | The survey after each rule; the sample report if ASS 1's fixture moves. |
| `tools/test/harvest-data.test.ts` (modify) | Pins: matched per volume, held and its reasons, readings, corpus counts, and the five Review Focus lines. |
| `data/`, `registry/` (regenerate) | The references this era writes. |
| `README.md`, spec §10 (modify) | The phase paragraph and a *Measured (…, phase 2c-ii-d)* section; and what 2c-iii inherits, this being the last era of 2c-ii. |

---

## Task 1 — The ten sources

- [ ] Add ten `ass(...)` rows to `ACTA_SOURCES` under a phase comment naming 2c-ii-d and spec §10 decision 3, `retrieved: '2026-09-22'` (when the series was fetched for the survey), each with the PDF's name as the store holds it:

```ts
  ass(2, 1867, 'ASS-02-1867-ocr.pdf', '2026-09-22'),
  ass(3, 1867, 'ASS-03-1867-ocr.pdf', '2026-09-22'),
  ass(4, 1868, 'ASS-04-1868-ocr.pdf', '2026-09-22'),
  ass(5, 1869, 'ASS-05-1869-70-ocr.pdf', '2026-09-22', 1870),
  ass(6, 1870, 'ASS-06-1870-71-ocr.pdf', '2026-09-22', 1871),
  ass(7, 1872, 'ASS-07-1872-73-ocr.pdf', '2026-09-22', 1873),
  ass(8, 1874, 'ASS-08-1874-75-ocr.pdf', '2026-09-22', 1875),
  ass(9, 1876, 'ASS-09-1876-ocr.pdf', '2026-09-22'),
  ass(10, 1877, 'ASS-10-1877-1-639+supplemento-321-448-ocr.pdf', '2026-09-22'),
  ass(11, 1878, 'ASS-11-1878-ocr.pdf', '2026-09-22'),
```

  The comment records what the era inherits: 39 of 128 summa rows claimed (30.5 %), the series' thinnest; ASS 7 finds no papal part and carries the series' one genuine page offset (PDF pp. 496–547, `ASS_PAGE_OFFSETS`); ASS 10 carries a bound-in supplement paginated 321–448; ASS 11 prints two popes, Pius IX to 7 February 1878 and Leo XIII from 20 February; ASS 2 and ASS 3 are both 1867.
- [ ] `npm run check` — expect failures only where a test asserts the ASS source list or reads an absent fixture. Record which.

## Task 2 — The scan

- [ ] `npx tsx tools/scan-ass.ts 2-11`, which writes both fixtures per volume and prints each volume's counts.
- [ ] Compare every volume against the survey table above. **A divergence is a finding**: the same scanner runs in both paths, so a difference means the fixture path sees something the store pass did not. Both earlier eras matched in every column; say so or say why not.
- [ ] Add the rows to `tools/fixtures/acta/README.md`, in the shape the existing ASS rows have.
- [ ] ASS 10: confirm the summa located is pp. 616–622 (the volume's own, not the supplement's), that no scanned entry falls in PDF pp. 640–768, and whether any page of the supplement carries `Pontificatus Nostri`.
- [ ] ASS 7: list every scanned entry whose PDF page falls in 496–547. Record the list even if it is empty — it is what Review Focus 2 pins.
- [ ] Commit: the sources, the fixtures, the README rows.

## Task 3 — The curation round

- [ ] Group every defect, unclaimed summa row and summa-omitted act by reason, per volume, **before writing anything**. 86 defects and 89 unclaimed rows; the unclaimed are the larger population and the one no earlier era has had to explain.
- [ ] **The V-spellings first, because they decide the era's shape.** Measure `ALLOCVTIO` and `LITERAE` / `LITERAE APOSTOLICAE` as `CLASS_HEADINGS` entries over all 41 volumes with `tools/survey-ass.ts`: report acts, defects and per-volume movement before and after. Accept only if the movement is confined to ASS 1, 2 and 4 and no running header opens an act. If accepted: regenerate ASS 1's fixture, 2c-i's sample report and the survey in the same commit, and re-check each of `ASS:1:193`, `ASS:1:578`, `ASS:1:744` — a row the scan now reads correctly is a replacement or it is stale, and stale is a hard error.
- [ ] **ASS 7's papal part.** Decide whether the summa parser learns it. Its summa lists the pope's acts under `EX ACTIS AD INSTAR CONSISTORIALIUM.`, which is a dicastery heading, not a papal one — so this may be a volume with genuinely no papal part rather than a spelling the parser lacks. Measure any rule over all 41 summae; if none is worth writing, say so in the report and leave the check blind, as 2c-ii-c did for ASS 20 and ASS 26.
- [ ] **Read a sample of the 89 unclaimed rows**, weighted to ASS 6 (25) and ASS 8 (20), and say what they are: acts the scanner's anchors do not reach, dicastery rows inside the papal part, or rows for acts the volume prints elsewhere. This is the era's headline number and the report must not leave it uncharacterised.
- [ ] Decide rule against row by counting: a shape in three or more volumes is a rule and is measured over all 41 before acceptance; a shape in one is an `ASS_READINGS` row quoting the volume's own heading, salutation, opening and dateline, and naming the finding it answers.
- [ ] Any ambiguity is settled by a curated row quoting its evidence or reported as an editorial question for the owner — never guessed.
- [ ] Any page two matched acts share needs an `ACTA_SHARED_PAGES` row quoting the page, or invariant 25 withholds **both** references. The nine brevia are where to look.
- [ ] Commit each rule separately, with its corpus measurement in the message; commit the rows together.

## Task 4 — The join, the pins, the report

- [ ] `npm run harvest && npm run render`; record the summary line's movement.
- [ ] Update the pins to the state each commit leaves, in the shape 2c-i's, 2c-ii-b's and 2c-ii-c's already have: matched per volume, held and its reasons, readings, corpus counts.
- [ ] Add the Review Focus pins: no reference into ASS 7's offset range that the offset table does not account for; no Pius IX match dated after 1878-02-07 or in 1869; no Leo XIII match dated before 1878-02-20 from ASS 11; every ASS reference naming its volume and a page within it.
- [ ] `npx tsx tools/ass-era-report.ts 1-11 > docs/superpowers/reports/2026-09-26-ass-volumes-pius-ix.md`. The range covers ASS 1 as 2c-ii-c's covered the sampled 23 and 33; the generator is era-agnostic since PR #54, and any change it needs must keep 13-35, 36-40 and 1-11 working.
- [ ] The report's findings answer: how many of Pius IX's 29 records of these years now carry a reference and how many of the 4 of Leo XIII's 1878; what the 89 unclaimed rows are; what the V-spellings cost or bought; what ASS 7 and ASS 1 cost; and — this being the last era of 2c-ii — **what 2c-iii inherits**, the reverse gap over the whole series.
- [ ] Commit: data, registry, pins, report.

## Task 5 — Documentation, PR, and the issue

- [ ] README's phase paragraph with the era's numbers, and the sentence that 2c-ii is complete: 41 volumes, the whole series joined.
- [ ] Spec §10 gains *Measured (…, phase 2c-ii-d)*, in the shape the two before it have, closing with what is left for 2c-iii.
- [ ] `npm run check` green; PR opened from `feat/ass-pius-ix`; a comment on [#25](https://github.com/CatholicOS/cmddr/issues/25).
