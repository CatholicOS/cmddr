# The ASS summa parser and the brevia (phase 2c-ii-a) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the *Acta Sanctae Sedis* yield measurable across all 41 volumes — teach the summa parser the papal headings and part-ends the series prints, read the brevia of the *Secretaria Brevium*, split `ass.ts` along its seams — so the eras of 2c-ii-b/c/d are planned against a measurement rather than a floor.

**Architecture:** Rules only, with the whole series as evidence. Every rule added is quoted at the volume and page the survey printed; every rule is measured over all 41 volumes before and after, with `tools/survey-ass.ts` as the instrument. Nothing is joined that was not joined before **except** what the brevia rule reads: that rule alone moves documents, and it moves phase 2c-i's five volumes too, so their fixtures, report and pins regenerate inside this plan.

**Tech Stack:** TypeScript (ESM, `tsx`), vitest, `gh`.

**Spec:** `docs/superpowers/specs/2026-09-21-ass-volumes-design.md` — §3 (the scanner), §4 (the summa), §6 (curation), and §10, the addendum this plan implements. The survey it argues from is `docs/superpowers/reports/2026-09-22-ass-survey.md`.

## Global Constraints

- **Nothing is guessed.** A rule is added only for a shape a volume prints, quoted at its volume and page from the survey's §4b or from the store text; a shape that occurs once gets a curated row (`ASS_READINGS`), not a rule (spec §3, §6).
- **Measure before and after, over all 41 volumes.** Every task that changes a rule re-runs `npx tsx tools/survey-ass.ts` and reports what moved: volumes gaining a papal part, rows, claimed, acts, defects. A rule whose effect is not measured is not finished.
- **`series: 'ASS'` entries are joined, never created** (spec decision 1); the creator holds them `series-not-created`.
- The store is the source: `~/development/sources/ASS/txt/ass-{vol:02}-{year}.txt`, all 41 volumes present. PDFs and text are never checked in.
- Only the five volumes of 2c-i have `ACTA_SOURCES` rows and fixtures. **This plan adds no source and no fixture for the other 36** — the eras do that. It may regenerate the five existing fixtures (the brevia rule does).
- `npm run check` (vitest + tsc + validate) passes at every commit.
- Commit messages end with `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`. **`git commit -S` fails in this environment (pinentry times out); commit unsigned and say so in the report — the owner re-signs before the push.**
- Work in a worktree under `.worktrees/` created from local `main`, branch `feat/ass-parser-brevia`; one PR at the end.

---

## File map

| File | Responsibility |
|---|---|
| `tools/src/acta/ass-dates.ts` (create) | The date reader: `ROMAN_OCR`, `repairRoman`, the month tables, `assDate`. |
| `tools/src/acta/ass-headings.ts` (create) | What a heading is: `CLASS_HEADINGS`, `HEADING_RE`, `RUNNING_HEAD_RE`, `POPE_RE`, `GREETING_RE`, `SALUTATION_RE`, `ADDRESSEE_RE`, `isOpening`, `popeOf`, `unaccent`, `isCaps`. |
| `tools/src/acta/ass.ts` (modify) | The scan alone: the anchors, `readAct`, `scanVolume`, the types. Re-exports what the tests and tools already import. |
| `tools/src/acta/summa.ts` (modify) | `PAPAL_HEAD_RE` (Task 2), `DICASTERY_RE` (Task 3), the column splitter (Task 4). |
| `tools/src/acta/ass.ts` + `summa.ts` (modify) | The brevia anchor and their class (Task 5). |
| `tools/survey-ass.ts` (modify) | Report the brevia as read rather than as defects once Task 5 lands. |
| `tools/fixtures/acta/ass-*.entries.json` (regenerate) | Task 5 only. |
| `data/`, `registry/` (regenerate) | Task 5 only. |
| `docs/superpowers/reports/2026-09-22-ass-survey.md` (regenerate) | Tasks 2–6. |
| `docs/superpowers/reports/2026-09-22-ass-volumes-sample.md` (regenerate) | Task 5. |
| `docs/superpowers/specs/2026-09-21-ass-volumes-design.md` (modify) | §10 gains a *Measured* paragraph (Task 7). |
| `tools/test/acta-summa.test.ts`, `acta-ass.test.ts`, `harvest-data.test.ts` (modify) | The rules' cases and the pins. |

---

### Task 1: Split `ass.ts` along its three seams

A pure refactor: no rule changes, no behaviour change, the five fixtures byte-identical afterwards.

**Files:**
- Create: `tools/src/acta/ass-dates.ts`, `tools/src/acta/ass-headings.ts`
- Modify: `tools/src/acta/ass.ts`
- Test: `tools/test/acta-ass.test.ts` (imports only)

**Interfaces:**
- Produces: `ass-dates.ts` exports `assDate(text, span)`; `ass-headings.ts` exports `CLASS_HEADINGS`, `HEADING_RE`, `RUNNING_HEAD_RE`, `POPE_RE`, `GREETING_RE`, `SALUTATION_RE`, `ADDRESSEE_RE`, `OPENING_FORMULA_RE`, `INLINE_GREETING_RE`, `isOpening(lines, i)`, `popeOf(text)`, `unaccent(s)`, `isCaps(l)`, `joinBreaks(lines)`. `ass.ts` keeps `AssEntry`, `AssDefect`, `AssScan`, `AssEvidence`, `Anchor`, `findAnchors`, `scanVolume`, and **re-exports `assDate` and `CLASS_HEADINGS`** so no other file's imports change.

- [ ] **Step 1: Read the file and mark the three regions**

Run: `grep -n "^// --- \|^export \|^const \|^function " tools/src/acta/ass.ts`
The file already carries `// --- dates ---`, `// --- anchors ---` and `// --- the scan ---` rules. Everything above the anchors rule that concerns dates goes to `ass-dates.ts`; the heading, pope, greeting and salutation vocabulary plus `isOpening`, `popeOf`, `unaccent`, `isCaps`, `joinBreaks` go to `ass-headings.ts`; the anchors and the scan stay.

- [ ] **Step 2: Create `ass-dates.ts` by moving, not rewriting**

Move `ROMAN_OCR`, `repairRoman`, `ROMAN_TOKEN`, `IT_MONTHS`, any French month table, and `assDate` verbatim — comments included, every quoted volume line intact. Head the file:

```ts
/**
 * The dates of the *Acta Sanctae Sedis*: the dateline's three Latin spellings, the Italian
 * and French forms the vernacular letters print, and the OCR's readings of a Roman numeral
 * (ass volumes spec §3). Split from ass.ts in phase 2c-ii-a, unchanged: 2c-ii's work is
 * almost entirely adding spellings quoted from a volume, and this is one of the two files
 * that churn while the walk-back algorithm stays fixed.
 */
```

- [ ] **Step 3: Create `ass-headings.ts` the same way**

Move the vocabulary and the predicates verbatim. Head the file:

```ts
/**
 * What a heading, a salutation, an addressee and a greeting look like in the *Acta Sanctae
 * Sedis* (ass volumes spec §3): the vocabulary the scan walks back to and skips past, with
 * the volume and page that prints each spelling quoted beside it. Split from ass.ts in
 * phase 2c-ii-a, unchanged.
 */
```

- [ ] **Step 4: Leave `ass.ts` the scan, and re-export**

`ass.ts` imports from both new files and adds, under its header comment:

```ts
// The vocabulary and the dates live beside this file (phase 2c-ii-a): re-exported so that
// every importer of the scanner -- the tools, the tests, the report -- keeps one import.
export { assDate } from './ass-dates.js';
export { CLASS_HEADINGS } from './ass-headings.js';
```

- [ ] **Step 5: Verify nothing moved**

Run: `npx tsc --noEmit && npm run check`
Expected: 954 tests pass, validator clean.

Run: `npm run scan-ass -- sample && git status --porcelain tools/fixtures/acta/`
Expected: **no output** — the five fixtures are byte-identical. If any moved, the move was not verbatim: revert and redo it.

Run: `npx tsx tools/survey-ass.ts > /tmp/survey-after-split.md && diff <(git show HEAD:docs/superpowers/reports/2026-09-22-ass-survey.md | tail -n +3) <(tail -n +3 /tmp/survey-after-split.md)`
Expected: no diff after the generation line — the survey reads the same series the same way.

- [ ] **Step 6: Commit**

```bash
git add tools/src/acta/ass.ts tools/src/acta/ass-dates.ts tools/src/acta/ass-headings.ts
git commit -m "Split the ASS scanner along its three seams before 2c-ii's rule churn: the dates, the heading vocabulary, the scan

No rule changed and no output moved: the five fixtures re-scan byte-identical and the survey
reproduces its report. 2c-ii adds spellings quoted from volumes, which land in the two moved
files while the walk-back algorithm stays where it is.

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: The summa's papal heading — nineteen volumes that claim nothing

**Files:**
- Modify: `tools/src/acta/summa.ts` (`PAPAL_HEAD_RE` and its doc comment)
- Test: `tools/test/acta-summa.test.ts`

**Interfaces:**
- Consumes: `parseSummaPapalPart(text): { rows, heading, end }` (unchanged signature).
- Produces: nothing new; the same function reads 19 more volumes' parts.

**The evidence** (survey §4b, each quoted from the volume's own summa page — re-read any of them with `awk -v p=<page> 'BEGIN{RS="\f"} NR==p' ~/development/sources/ASS/txt/ass-<vol>-<year>.txt`):

| Volumes | As printed | Note |
|---|---|---|
| 3 | `ACTA SOLEMNIORA ROMANI PONTIFICIS.` | |
| 4 | `ACTA SOLEMNIORE ROM. PONTIFICIS` | the OCR's `SOLEMNIORE` for `SOLEMNIORA` |
| 5, 6 | `ACTA SOLEMNIORA ROM. PONTIFICIS` / `PUBLICI IURIS FACTA.` | two lines; ASS 5's OCR reads `PONriFICIS` |
| 8 | `ACTA SOLEMNIORÂ` / `ROMANI PONTIFICIS.` | two lines, the OCR's `Â` |
| 9 | `Litterae Apostolicae` / `SS. D. Ii. P. Papae IX.` | **mixed case**, the class as the part heading |
| 10, 11 | `LITTERAE APOSTOLICAE` / `LITTERAE APOSTOLICAE.` | the class alone |
| 14 | `LITTERAE ET RESPONSUM` / `ROMANI PONTIFICIS` | two lines |
| 15 | `LITTERAE MOTU PROPRIO` / `ET CONSTITUTIO R. PONTIFICIS` | two lines |
| 16, 17, 18 | `LITTERAE ROMANI PONTIFICIS` (ASS 16's OCR: `L TT E RA R ROMANI PONTIFICIS`) | |
| 19 | `LITTERAE R. PONTIFICIS` | |
| 35 | `ACTA ROMAM PONTIFICIS` | the OCR's `ROMAM` for `ROMANI` |

Three volumes are **not** in this table and must not be forced: ASS 1, 2 and 7 print no papal part heading on their summa's first pages (ASS 1 opens `PROGRAMMA. pag. 3`, ASS 2 and 7 on `EX ACTIS CONSISTORIALIBUS` / `EX ACTIS AD INSTAR CONSISTORIALIUM`), and ASS 20 opens directly on its rows (`Litterae SSmi D. N. Leonis PP. XIII ad Emum Card. Marianum Rampolla`), ASS 26 on a dicastery. Read them in Step 5 and report what they are; they are a finding, not a regex.

- [ ] **Step 1: Write the failing tests**

Append to `tools/test/acta-summa.test.ts`, inside the `parseSummaPapalPart` describe:

```ts
  it('reads the papal part under the headings the series prints beyond the sample (survey §4b)', () => {
    const cases: [string, string, string][] = [
      // [the heading as printed, the row that follows it, the heading parseSummaPapalPart should report]
      ['ACTA SOLEMNIORA ROMANI PONTIFICIS.', 'Allocutio habita die 20 Decembris 1867 . . 289', 'ACTA SOLEMNIORA ROMANI PONTIFICIS'],
      ['ACTA SOLEMNIORE ROM. PONTIFICIS', 'Litterae Apostolicae solemnissimae . . 118', 'ACTA SOLEMNIORE ROM. PONTIFICIS'],
      ['ACTA SOLEMNIORA ROM. PONriFICIS', 'Allocutio habita a SS.mo Patre . . 522', 'ACTA SOLEMNIORA ROM. PONriFICIS'],
      ['ACTA SOLEMNIORÂ', 'Sanctissimi Domini Nostri Pii . . 55', 'ACTA SOLEMNIORÂ'],
      ['LITTERAE APOSTOLICAE', 'Litterae Apostolicae ad Ducem . . 581', 'LITTERAE APOSTOLICAE'],
      ['LITTERAE ET RESPONSUM', 'Litterae Apostolicae; de Ordine s. Ba- . . 433', 'LITTERAE ET RESPONSUM'],
      ['LITTERAE MOTU PROPRIO', 'de curis adhibitis ab Episcopis . . 17', 'LITTERAE MOTU PROPRIO'],
      ['LITTERAE ROMANI PONTIFICIS', 'Litterae Sanctissimi D. N. Leonis . . 305', 'LITTERAE ROMANI PONTIFICIS'],
      ['LITTERAE R. PONTIFICIS', 'Litterae SSmi D. N. Leonis XIII . . 4', 'LITTERAE R. PONTIFICIS'],
      ['ACTA ROMAM PONTIFICIS', 'Epistola SSmi D. N. Leonis XIII ad . . 709', 'ACTA ROMAM PONTIFICIS'],
    ];
    for (const [heading, row, reported] of cases) {
      const { rows, heading: read } = parseSummaPapalPart(`SUMMA ACTORUM\nQUAE IN HOC VOLUMINE CONTINENTUR\n${heading}\n${row}\nEX ACTIS CONSISTORIALIBUS\nDe Consistorio habito . . 99`);
      expect(read, heading).toBe(reported);
      expect(rows.map((r) => r.page), heading).toEqual([Number(row.match(/(\d+)\s*$/)![1])]);
    }
  });

  it('reads the mixed-case papal heading of ASS 9 (1876), where the class itself heads the part', () => {
    const { rows, heading } = parseSummaPapalPart('SUMMA ACTORUM\nQUAE IN HOC NONO VOLUMINE CONTINENTUR\nLitterae Apostolicae\nSS. D. Ii. P. Papae IX.\nLitterae Apostolicae ad Ducem Mutinae . . 581\nEX ACTIS CONSISTORIALIBUS\nDubia et responsa . . 557');
    expect(heading).toBe('Litterae Apostolicae');
    expect(rows.map((r) => r.page)).toEqual([581]);
  });

  it('does not read a dicastery heading as the papal part (ASS 2, 7, 26 open on one)', () => {
    for (const opener of ['EX ACTIS CONSISTORIALIBUS', 'EX ACTIS AD INSTAR CONSISTORIALIUM.', 'EX S. CONGR. RITUUM']) {
      const { rows, heading } = parseSummaPapalPart(`SUMMA ACTORUM\nQUAE IN HOC VOLUMINE CONTINENTUR\n${opener}\nDecretum quoddam . . 42`);
      expect(heading, opener).toBeNull();
      expect(rows, opener).toEqual([]);
    }
  });
```

- [ ] **Step 2: Run them to see them fail**

Run: `npx vitest run tools/test/acta-summa.test.ts -t "beyond the sample"`
Expected: FAIL — the headings read as `null`.

- [ ] **Step 3: Extend `PAPAL_HEAD_RE`**

In `tools/src/acta/summa.ts`, replace `PAPAL_HEAD_RE` and its comment with:

```ts
/**
 * The heading of the summa's papal part. The sample printed three forms; the survey of the
 * whole series (docs/superpowers/reports/2026-09-22-ass-survey.md §4b) found eight more,
 * each quoted here at the volume that prints it:
 *   `LITTERAE ET ALLOCUTIONES [APOSTOLICAE]`      ASS 12 (1879) 647, 13
 *   `LITTERAE ET ACTA [ROM.|R.] PONTIFICIS`       ASS 21 (1888) 744, 22-25, 27-34
 *   `ACTA ROMANI PONTIFICIS`                      ASS 36 (1903) , 37-41; ASS 35's OCR `ROMAM`
 *   `ACTA SOLEMNIORA ROMANI PONTIFICIS`           ASS 3 (1867) 665
 *   `ACTA SOLEMNIORE ROM. PONTIFICIS`             ASS 4 (1868) 684 (the OCR's -E for -A)
 *   `ACTA SOLEMNIORA ROM. PONriFICIS`             ASS 5 (1869) 691, 6 (the OCR's r for T),
 *                                                 over `PUBLICI IURIS FACTA` on the next line
 *   `ACTA SOLEMNIORÂ`                             ASS 8 (1874) 727, over `ROMANI PONTIFICIS`
 *   `LITTERAE ET RESPONSUM`                       ASS 14 (1881) 569, over `ROMANI PONTIFICIS`
 *   `LITTERAE MOTU PROPRIO`                       ASS 15 (1882) 603, over `ET CONSTITUTIO R. PONTIFICIS`
 *   `LITTERAE [ROMANI|R.] PONTIFICIS`             ASS 16 (1883) 557, 17-19
 *   `LITTERAE APOSTOLICAE`                        ASS 10 (1877) 616, 11
 *   `Litterae Apostolicae` (mixed case)           ASS 9 (1876) 669, over `SS. D. Ii. P. Papae IX.`
 * The mixed-case form is admitted for `Litterae Apostolicae` alone, and only as a whole
 * line: the caps forms cannot be relaxed without reading a row's own first words as a
 * heading, since every row opens `Litterae SSmi D. N. …`.
 */
const PAPAL_HEAD_RE = new RegExp(
  '^\\s*(?:\\d+\\s+)?('
  + 'LITTERAE\\s+ET\\s+A(?:LLOCUTIONES|CTA)(?:\\s+R(?:OM)?\\.\\s*PONTIFICIS|\\s+APOSTOLICAE)?'
  + '|ACTA\\s+(?:ROMANI|ROMAM)\\s+PONTIFICIS'
  + '|ACTA\\s+SOLEMNIOR[AEÂ]?(?:\\s+ROM(?:ANI|\\.)?\\s*PON[TRr]?[iI]?FICIS\\.?)?'
  + '|LITTERAE\\s+ET\\s+RESPONSUM'
  + '|LITTERAE\\s+MOTU\\s+PROPRIO'
  + '|L\\s?TT\\s?E\\s?RA\\s?[ER]?\\s+ROMANI\\s+PONTIFICIS'
  + '|LITTERAE\\s+R(?:OMANI|\\.)\\s*PONTIFICIS'
  + '|LITTERAE\\s+APOSTOLICAE'
  + '|Litterae\\s+Apostolicae\\s*$'
  + ')');
```

- [ ] **Step 4: Run the tests**

Run: `npx vitest run tools/test/acta-summa.test.ts`
Expected: PASS, including the pre-existing cases (the dicastery-opener test proves the new alternatives did not swallow one).

- [ ] **Step 5: Measure over all 41 volumes, and read the four volumes the table leaves out**

Run: `npx tsx tools/survey-ass.ts > /tmp/survey-t2.md && diff docs/superpowers/reports/2026-09-22-ass-survey.md /tmp/survey-t2.md | head -60`

Record, for the commit message and the report: how many volumes now find a papal heading (was 22 of 41), the new totals for rows / claimed / claimed %, and the per-decade movement.

Then read the four volumes the evidence table excludes and write one sentence each into the commit body:

```bash
for v in "01 1865 747" "02 1867 695" "07 1872 751" "20 1887 635" "26 1893 755"; do set -- $v; echo "=== ASS $1"; awk -v p=$3 'BEGIN{RS="\f"} NR==p' ~/development/sources/ASS/txt/ass-$1-$2.txt | grep -vE "^\s*$" | head -8; done
```

If one of them shows a papal heading the table missed, add it with its quote; if it shows none (the part does not exist, or opens on a dicastery, or the rows begin immediately), say so — the era that reaches that volume will curate it.

- [ ] **Step 6: Commit**

```bash
git add tools/src/acta/summa.ts tools/test/acta-summa.test.ts docs/superpowers/reports/2026-09-22-ass-survey.md
git commit -m "Teach the summa parser the eight papal headings the series prints beyond the sample

<the measurement: volumes finding a part N -> M, rows, claimed, claimed % by decade>
<one line per volume of ASS 1, 2, 7, 20, 26: what its summa opens on and why no regex fits>

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: Where the papal part ends

**Files:**
- Modify: `tools/src/acta/summa.ts` (`DICASTERY_RE` and its doc comment)
- Test: `tools/test/acta-summa.test.ts`

**The evidence.** ASS 21's papal part reads 100 rows of which 87 are unclaimed, and the last of them are dicastery decrees — `S. CONGR. INDICIS Decretum quo plures libri prohibentur` (p. 368), `Decretum, quo prohibetur opusculum — Roma e l'Italia` (p. 561), `Decretum quo plures prohibentur libri` (p. 698). `DICASTERY_RE` requires an `EX ` prefix, and this volume heads its dicastery sections without one. Find every form before writing the rule:

```bash
for f in ~/development/sources/ASS/txt/ass-*.txt; do
  awk 'BEGIN{RS="\f"} /SUMMA ACTORUM|INDEX ANALYTICUS/{print}' "$f" \
    | grep -oE "^\s*(EX\s+)?(S+\.?\s*(CONGR|C|CONGREGATIONE)[^|]{0,40}|SECRETARIA BREVIUM|ACTIS CONSISTORIALIBUS|AEDIBUS [A-Z]+)" ;
done | sed 's/^ *//' | sort | uniq -c | sort -rn | head -30
```

- [ ] **Step 1: Write the failing test from what that prints**

Add to `tools/test/acta-summa.test.ts`:

```ts
  it('ends the papal part at a dicastery heading printed without the `EX` prefix (ASS 21 (1888) 744: `S. CONGR. INDICIS`)', () => {
    const { rows, end } = parseSummaPapalPart([
      'LITTERAE ET ACTA ROM. PONTIFICIS',
      'Litterae SSmi D. N. Leonis XIII ad Episcopos Hiberniae . . 3',
      'S. CONGR. INDICIS',
      'Decretum quo plures libri prohibentur . . 368',
    ].join('\n'));
    expect(end).toBe('S. CONGR. INDICIS');
    expect(rows.map((r) => r.page)).toEqual([3]);
  });
```

Add one case per further form the command above printed that is not already admitted, each named by the volume it comes from.

- [ ] **Step 2: Run it, see it fail**

Run: `npx vitest run tools/test/acta-summa.test.ts -t "without the \`EX\` prefix"`
Expected: FAIL — `end` is null and the decree is counted as a papal row.

- [ ] **Step 3: Extend `DICASTERY_RE`**

Make the `EX` prefix optional **only** for the spelt-out dicastery names, so that a row beginning `S. Congr.` mid-sentence cannot end the part:

```ts
/**
 * A dicastery heading, which ends the pope's part. The sample printed the `EX …` forms; the
 * survey found the same names printed without the prefix (ASS 21 (1888) 744: `S. CONGR.
 * INDICIS`, which left 87 dicastery rows counted as the pope's), so the prefix is optional
 * before a dicastery name in capitals and required before nothing else. The abbreviated
 * forms end in a stop (`EX S. C. CONCILII`, ASS 33 (1900) 762), after which no word
 * boundary follows, so the boundary is written per alternative on the spelt-out words only.
 */
const DICASTERY_RE = /^\s*((?:EX\s+)?(?:S{1,2}\.\s*(?:C\.|CONGR\.|CONGREGATIONE\b|CONGREGATIONIS\b|APOSTOLICA\b|POENITENTIARIA\b|OFFICII\b)|SECRETARIA\b|ACTIS\b|AEDIBUS\b|SUPREMA\b|CANCELLARIA\b|DATARIA\b|SACRA\b).*)$/;
```

Adjust the alternatives to exactly what Step 0's command printed — do not carry one this plan lists if no volume prints it, and do add one it printed that this plan lacks.

- [ ] **Step 4: Run the tests**

Run: `npx vitest run tools/test/acta-summa.test.ts`
Expected: PASS, the pre-existing cases included.

- [ ] **Step 5: Measure**

Run: `npx tsx tools/survey-ass.ts > /tmp/survey-t3.md && diff docs/superpowers/reports/2026-09-22-ass-survey.md /tmp/survey-t3.md | head -40`

Expected shape: rows fall (dicastery rows leave the papal part), claimed % rises. Record the numbers. **If a volume's rows fall to zero, the rule ended the part too early** — read that volume's summa and report it rather than loosening the regex.

- [ ] **Step 6: Commit**

```bash
git add tools/src/acta/summa.ts tools/test/acta-summa.test.ts docs/superpowers/reports/2026-09-22-ass-survey.md
git commit -m "End the summa's papal part at a dicastery heading printed without its EX prefix

<the measurement: rows N -> M, claimed % by decade, the volumes that moved most>

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: The columns that stay woven

**Files:**
- Modify: `tools/src/acta/summa.ts` (`splitColumns`)
- Test: `tools/test/acta-summa.test.ts`

**The evidence.** ASS 27's parsed rows read `Epistola apostolica SSmi D. N. Leo- li. PONTIFICIS nis XIII ad Anglos,` — the left and right columns glued, the same shape 2c-i found at ASS 23 p. 753 (interleaved word by word). `splitColumns` finds the gutter as the column covered by the most lines' four-space runs, at column 25 or beyond, on four or more lines; where the columns touch, no run covers a single column on enough lines and the page is returned as printed.

This task is **measurement first, and a rule only if the measurement shows one**:

- [ ] **Step 1: Count the pages that stay woven**

Write `/tmp/woven.ts` and run it with `npx tsx`:

```ts
import { readFileSync, readdirSync } from 'node:fs';
import { locateSumma, splitColumns } from '/home/johnrdorazio/development/CatholicOS_org/cmddr/tools/src/acta/summa.js';
const dir = `${process.env['HOME']}/development/sources/ASS/txt`;
for (const f of readdirSync(dir).filter((x) => x.startsWith('ass-')).sort()) {
  const pages = readFileSync(`${dir}/${f}`, 'utf8').split('\f');
  const s = locateSumma(pages);
  if (!s) continue;
  const woven: number[] = [];
  for (let p = s.from; p <= s.to; p++) {
    const out = splitColumns(pages[p - 1]!);
    // A page whose split changed nothing but whose lines carry two page tokens is still woven.
    const twoTokens = out.filter((l) => (l.match(/(?:^|\s)[\dOoiIlSsgB]{1,4}(?=\s|$)/g) ?? []).length >= 2).length;
    if (twoTokens >= 3) woven.push(p);
  }
  if (woven.length) console.log(`${f}: ${woven.length} woven page(s): ${woven.join(', ')}`);
}
```

Record the count per volume. This is the number the decision rests on.

- [ ] **Step 2: Read three of the worst pages**

Run, for three volumes the count names: `awk -v p=<page> 'BEGIN{RS="\f"} NR==p' ~/development/sources/ASS/txt/ass-<vol>-<year>.txt | cat -A | head -20` (the `-A` shows where the spaces really are).

Decide from what you see, and say which in the report:
- **the columns are separated by fewer than four spaces** → widen the gutter search to runs of three, and measure the effect on every volume's rows (a narrower run may cut inside a description);
- **the columns touch with no gap at all** → no rule can unweave them; the pages are a finding for the eras, which will curate the rows they lose (2c-i did this for ASS 23 p. 753);
- **the page is a single column the detector cut anyway** → that is the opposite defect; report it.

- [ ] **Step 3: Implement only what Step 2 evidenced**

If the evidence is "fewer than four spaces", change the `\s{4,}` in `gapsOf` to `\s{3,}` and the `Math.max(25, …)` bound as the reading requires, add a test quoting the volume's page as printed, and measure. If the evidence is "no gap", change nothing and write the finding into the survey's §4b prose instead (`tools/survey-ass.ts`), naming the volumes and pages.

- [ ] **Step 4: Measure and commit**

Run: `npx tsx tools/survey-ass.ts > /tmp/survey-t4.md && diff docs/superpowers/reports/2026-09-22-ass-survey.md /tmp/survey-t4.md | head -40` and `npm run check`.

```bash
git add -A tools/src/acta/summa.ts tools/test/acta-summa.test.ts tools/survey-ass.ts docs/superpowers/reports/2026-09-22-ass-survey.md
git commit -m "<what the woven columns turned out to be, and what was done about it>

<the count per volume; the pages read; the rule added or the finding recorded>

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: The brevia of the *Secretaria Brevium*

The owner's ruling of 2026-09-22 (spec §10): 83 acts across the series is worth a rule. This is the only task that moves documents — it adds entries to the five volumes of 2c-i too, so their fixtures, their era report, the corpus and the pins regenerate here.

**Files:**
- Modify: `tools/src/acta/ass.ts` (the anchor), `tools/src/acta/ass-headings.ts` (the title), `tools/src/acta/categories.ts` (if the heading needs a row)
- Modify: `tools/fixtures/acta/ass-*.entries.json` (regenerated), `data/`, `registry/`
- Test: `tools/test/acta-ass.test.ts`, `tools/test/harvest-data.test.ts`
- Modify: `docs/superpowers/reports/2026-09-22-ass-volumes-sample.md` (regenerated)

**What a breve looks like.** Read five before writing anything:

```bash
for v in "41 1908" "33 1900" "09 1876"; do set -- $v; echo "=== ASS $1"; grep -n -B25 "annulo Piscatoris" ~/development/sources/ASS/txt/ass-$1-$2.txt | grep -E "BREVE|LITTERAE|^[0-9]+-\s{6,}[A-ZÀ-Þ ]{10,}$|annulo" | head -12; done
```

The sample's report says they "print a descriptive caps title where a class word should stand and are listed by the summa under the dicastery". The rule must therefore read the **title** as the description and give the act the class `brief`, and must not fire on a dicastery's own act.

- [ ] **Step 1: Write the failing test from a real page**

Choose one breve from the reading above; quote its page verbatim into `tools/test/acta-ass.test.ts` as the existing tests do (heading block, salutation if any, opening, the ring dateline), and assert `scanVolume` returns one entry with `category: 'BREVE'` (or the category the reading shows), the pope, the date, the opening, and `anchor: 'dateline'`.

- [ ] **Step 2: Run it, see it fail**

Run: `npx vitest run tools/test/acta-ass.test.ts -t "annulo Piscatoris"`
Expected: FAIL — the act is a `no-heading` defect.

- [ ] **Step 3: Implement the anchor**

In `ass.ts`, where `findAnchors` already reads `DATUM_RE` + `PONTIFICATUS_RE` and `SIGNED_DATELINE_RE` + `SIGNATURE_RE`, add the ring: `Datum Romae … sub annulo Piscatoris …` closes a breve, and the walk-back must accept a **descriptive caps title** as the opening where no class word stands. Put the title predicate in `ass-headings.ts` beside `isOpening`, with the volume and page quoted. Do not loosen `DATUM_RE` or `PONTIFICATUS_RE`.

- [ ] **Step 4: Measure over the series before touching a fixture**

Run: `npx tsx tools/survey-ass.ts > /tmp/survey-t5.md && diff docs/superpowers/reports/2026-09-22-ass-survey.md /tmp/survey-t5.md | head -50`

Expected: acts rise by roughly the 83 the survey counted as brevia, and the `brevia` column falls to near zero. **If acts rise by materially more than 83, the rule is reading something else too** — find out what before continuing.

- [ ] **Step 5: Regenerate the sample's fixtures and read what changed**

Run: `npm run scan-ass -- sample && git diff --stat tools/fixtures/acta/`
Read the new entries: `git diff tools/fixtures/acta/ | grep -E '^\+.*"(category|opening|page)"' | head -30`. Every new entry should be a breve. If one is not, report it.

- [ ] **Step 6: Join, and read what the harvest says**

Run: `npm run harvest 2>&1 | grep -iE "ASS|series-not-created|shared|conflict|unseen"` then `npm run validate && npm run render`.

The brevia may match shelf documents of class `brief` (Leo XIII has 8, Pius IX 3) — so the ASS reference count may rise above 57. Record the new count and the per-volume split with the counting script:

```bash
node -e 'const fs=require("fs");let n=0,by={};for(const f of fs.readdirSync("data/documents")){for(const d of JSON.parse(fs.readFileSync("data/documents/"+f,"utf8"))){if(d.acta&&d.acta.series==="ASS"){n++;by[d.acta.volume]=(by[d.acta.volume]||0)+1;}}}console.log("ASS references:",n,JSON.stringify(by));'
```

Any new `ACTA_SHARED_PAGES` warning: read the page in the store text and curate a row quoting it, or report why not.

- [ ] **Step 7: Re-pin and regenerate the sample's era report**

Update every moved pin in `tools/test/harvest-data.test.ts` (the ASS block's per-volume scan numbers, the readings count if a reading is now redundant, the reference totals, the `series-not-created` count), each with a sentence naming phase 2c-ii-a and the brevia as the cause. Then:

Run: `npx tsx tools/ass-volumes-report.ts > docs/superpowers/reports/2026-09-22-ass-volumes-sample.md`

Read the regenerated §1: findings whose numbers moved must still read true. Where a finding's prose is now wrong (finding 9's five *in forma Brevis*, the defect counts of finding 2), fix the prose in `tools/ass-volumes-report.ts` so it regenerates correctly — the numbers are computed, the reading is not.

- [ ] **Step 8: `npm run check` and commit**

```bash
git add -A
git commit -m "Read the brevia of the Secretaria Brevium: anchor on the ring of the Fisherman, the caps title as the description

<acts across the series N -> M; the sample's five volumes' movement; references 57 -> N; the pins moved>

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: `header-mismatch` on the evidence

**Files:**
- Modify: `tools/src/acta/recover.ts` (`headerAgrees`) **only if the evidence says so**
- Test: `tools/test/acta-ass.test.ts`

The survey counts 38 across the series and prints each with the header as read: `1*97` for 197 (ASS 3), `302` for 502 (ASS 4), `4SI` for 481 (ASS 6), `4<¡` for 49 (ASS 10). Every one is the OCR's reading of the right number; none is a run of offset pages.

- [ ] **Step 1: Confirm that over all 38**

Read the survey's §5 table in full (`sed -n '/## 5\./,/## 6\./p' docs/superpowers/reports/2026-09-22-ass-survey.md`). For each volume with three or more, check whether its mismatched pages are consecutive — a genuine offset would be. Report the finding.

- [ ] **Step 2: Decide, and say which in the commit**

- **Every instance is OCR noise** → relax `headerAgrees` for the ASS: accept the header when its digits, with the OCR's letter-for-digit substitutions applied (the `DIGIT_OCR` table in `summa.ts` already has them), equal the page. Add a test per quoted spelling. Measure: defects fall by up to 38, acts rise by the same.
- **Some volume shows a run** → leave the guard, and record that volume as one whose pages the era must read by hand.

- [ ] **Step 3: Measure, check and commit**

Run: `npx tsx tools/survey-ass.ts > /tmp/survey-t6.md && diff docs/superpowers/reports/2026-09-22-ass-survey.md /tmp/survey-t6.md | head -30` and `npm run check`; if the sample's fixtures move, re-scan, re-harvest and re-pin as Task 5 did.

```bash
git add -A
git commit -m "<relax header-mismatch for the ASS on the evidence of 38 | keep it, and name the volumes to read by hand>

<the evidence: the spellings, whether any volume shows a run>

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: The re-survey, the spec, and the PR

**Files:**
- Modify: `docs/superpowers/reports/2026-09-22-ass-survey.md` (final regeneration)
- Modify: `docs/superpowers/specs/2026-09-21-ass-volumes-design.md` (§10 gains *Measured*)
- Modify: `README.md`, `SCHEMA.md` **only if a number they quote moved**

- [ ] **Step 1: Regenerate the survey and read it whole**

Run: `npx tsx tools/survey-ass.ts > docs/superpowers/reports/2026-09-22-ass-survey.md && sed -n '/## 2\./,/## 4\./p' docs/superpowers/reports/2026-09-22-ass-survey.md`

- [ ] **Step 2: Write §10's *Measured* paragraph**

Append to the spec's §10 a paragraph headed `**Measured (2026-09-2D, phase 2c-ii-a).**` giving: volumes finding a papal part before and after; rows, claimed and claimed % by decade before and after; acts before and after; the brevia read; what `header-mismatch` was decided and why; and — the sentence the eras need — **which decades are now measurable and which are still floors**, with the volumes that remain unreadable named.

- [ ] **Step 3: Restate any number the docs quote that moved**

Run: `grep -n "57\b\|380\b\|83\b\|41 volumes\|36 volumes" README.md SCHEMA.md docs/superpowers/specs/2026-09-21-ass-volumes-design.md | head -20` and fix what the measurement moved. The README's ASS paragraph quotes the reference count; if Task 5 changed it, this is where it is restated.

- [ ] **Step 4: `npm run check`, then the PR**

```bash
npm run check
git add -A && git commit -m "Re-survey the series after the parser and the brevia, and record the measurement in spec §10

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
git push -u origin feat/ass-parser-brevia
```

Then `gh pr create --base main --title "Teach the ASS summa parser the series' headings and read the brevia (phase 2c-ii-a)"` with a body that leads on the measurement: volumes claiming before and after, acts before and after, references before and after, and what the eras can now be planned against. End the body with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.

- [ ] **Step 5: The comment on #25**

Only after the PR is open, and in the house style of the previous ones (measurement first, then what it means for the next phase):

```bash
gh issue comment 25 --body "<phase 2c-ii-a: what the parser now reads, the brevia read, and which eras are next>"
```

---

## Self-review

- **Spec coverage.** §10's decision 1 (the parser first, with all 41 volumes' evidence, survey re-run) → Tasks 2, 3, 4, 7; decision 2 (the brevia, as its own commit, 2c-i regenerating with it) → Task 5; the carried-over `ass.ts` split → Task 1; the `header-mismatch` question → Task 6. §10's "no source added, no fixture written, no document joined" holds for Tasks 1–4 and 6–7; Task 5 is the named exception and says so.
- **Placeholders.** Tasks 4 and 6 deliberately branch on a measurement the implementer takes — each branch names the exact change and the exact evidence that selects it, which is the plan's discipline (measure before the rule), not a deferral. The commit messages carry `<…>` slots for numbers that do not exist until the task runs; every one names what must fill it.
- **Type consistency.** `parseSummaPapalPart`, `splitColumns`, `locateSumma`, `checkSumma` keep their signatures; `assDate` and `CLASS_HEADINGS` stay importable from `ass.ts` after Task 1's re-export, so no other file's imports change; the brevia rule adds no exported type.
