# The *Acta Sanctae Sedis*, 1865–1908 (phase 2c of the *Acta* programme)

Extends the *Acta* reference (phase 1, PR #29; phase 2a, PR #32; phase 2b and its eras,
PRs #33–#43) from the *Acta Apostolicae Sedis* to their predecessor, the *Acta Sanctae
Sedis* (ASS, 41 volumes, 1865–1908), where the acts of Pius IX from 1865, of Leo XIII and
of Pius X's first five years stand. The record shape, the reference's schema and the join's
rules are those of the earlier specs and are not restated; this spec covers what is new —
a series whose volumes print **no chronological index**, so that the index the join reads
has to be synthesised from the volume body, with the volume's own summary as the check on
its completeness.

Decisions taken by the owner on 2026-09-21: **phase 2c-i joins references only** (ASS-born
documents and the reprints of earlier popes are 2c-iii, decided from this phase's gap
report); **a five-volume sample first** (ASS 1, 12, 23, 33, 41), then the remaining 36 in
eras (2c-ii); `acta.year` is the **first year** of a two-year volume; the mechanism is the
body scan of §3 with the summa of §4 as the completeness check.

## 1. Sources, as measured on 2026-09-21

[`/archive/ass/index_it.htm`](https://www.vatican.va/archive/ass/index_it.htm) links one
whole-volume OCR PDF per volume, `documents/ASS-{vol}-{years}-ocr.pdf` — `ASS-12-1879`,
`ASS-33-1900-1`, `ASS-41-1908`; two names carry a supplement (`ASS-10-1877-1-639+supplemento-321-448`,
`ASS-16-1883-84-1-576+supplemento-17-96`); 22 of the 41 labels span two years. The three
volumes in the local store (ASS 12, 33, 41: 672, 768, 810 pages) extract in pypdf's layout
mode at the OCR quality of AAS 1909–1930.

| Volume | Years | Pope | What ends the volume | Papal part of it |
|---|---|---|---|---|
| ASS 12 | 1879 | Leo XIII | *Summa actorum quae in hoc volumine XII continentur* (pp. 647–653), then an *Index generalis conclusionum* (pp. 654–671, a subject index) | `LITTERAE ET ALLOCUTIONES APOSTOLICAE`: ≈ 6 rows |
| ASS 33 | 1900–01 | Leo XIII | *Summa actorum* (pp. 761–768) | `LITTERAE ET ACTA R. PONTIFICIS`: ≈ 11 rows |
| ASS 41 | 1908 | Pius X | *Index analyticus* (pp. 799–809) | `ACTA ROMANI PONTIFICIS`: ≈ 33 rows |

The phase-1 spec's note that the ASS "end in a subject index" (measured on ASS 23) saw the
*Index generalis conclusionum* and not the *Summa actorum* before it; every volume measured
here has the summa. Its papal part is a list of **description + page** — `Constitutio
Apostolica de Romana Curia pag. 427`, `Epistola qua Pius X laudat Archiepiscopum Quebecen,
ob promotam actionem socialem catholicam » ig3` — with **no incipit and no date** (the
allocutions alone carry their date in the description: `Allocutio Pii PP. X die 18 Dec.
1907 habita ad novos Cardinales » 31`), set in two columns the OCR interleaves.

**The body carries everything the AAS index prints.** Each papal act opens with a caps
class heading, the pope's name and a description, then the salutation line, then the
incipit, and closes with the dateline:

```
          EPISTOLA ENCYCLICA Sanctissimi Domini Nostri LEONIS PAPAE XIII.
                                           DE IESU CHRISTO REDEMPTORE.

                                                        LEO PP. XIII

      Venerabiles Fratres Saluterà et Apostolieam Benedictionem.

          Tametsi futura prospicientibus, vacuo a sollicitudine animo
…
         Datum Romae apud S. Petrum die i Novembris An. MDCGCC,
Pontificatus Nostri vicesimo tertio.
                                                     LEO PP. XIII.
```
(ASS 33, p. 273; the shelf record is `mag:leo-xiii/tametsi-futura-1900`, 1900-11-01.)

Continuation pages carry a running head — the class alone beside the page number (`274
EPISTOLA ENCYCLICA`). Many letters open mid-page: ASS 41 pp. 12–20 hold nine epistolae,
one to a page or less. The dateline is in three spellings across the sample — `die 28
augusti 1879`, `die XXI Iulii anno MDCCCC`, `die xxv Iunii a. MDCCCCV` — with OCR noise in
the numerals (`MDCGCC`, `MCMVHI`, `xxin`); a Congregation's dateline (`Datum Romae ex
Secretaria eiusdem sac. Congregationis die 20 Septembris 1879`) has no `Pontificatus
Nostri` and is not the pope's. Counted over the three volumes, the pope's closing formula
occurs 8 / 19 / 34 times against ≈ 6 / 11 / 33 summa rows; a scan of page tops alone
finds 7 / 12 / 14 openings, which is why the scan of §3 anchors on the formula and not on
the page.

**The join target.** 496 shelf documents are dated 1865–1908: Pius IX 31 (17 encyclicals),
Leo XIII 263 (108 letters, 86 encyclicals, 34 apostolic letters, 18 addresses), Pius X
200 (143 letters, 42 apostolic letters, 11 encyclicals), Vatican I 2; 487 carry an incipit,
9 are provisional, 2 carry an `acta` already (the 1908 acts AAS 1 reprinted). Pius X's
letters shelf is dense where the ASS is most legible (55, 47, 34, 22, 31 documents a year
over 1904–1908).

## 2. Fetch and fixtures

`tools/fetch-acta.sh ass 33` (and `ass 1-41`, `ass sample`) reads the file name off the
ASS index page, downloads the PDF once to the local store (`~/development/sources/ASS/pdf`,
which already holds 12, 33 and 41; `ACTA_SOURCES` to point elsewhere) and extracts the
whole volume in layout mode to `<store>/txt/ass-{vol}-{year}.txt`, one page per form feed
— the script's `text` mode, pointed at the ASS. The PDFs and the whole text stay out of
the repository as the AAS volumes do (1.7–2 MB of text a volume).

Two fixtures per volume are checked in under `tools/fixtures/acta/`, so the join and its
tests run offline and deterministically:

- `ass-{vol}-{year}.summa.txt` — the pages of the *Summa actorum* / *Index analyticus*
  only (7–11 pages), located by their heading and extracted as the AAS index pages are;
- `ass-{vol}-{year}.entries.json` — the scanner's output (§3): one row per papal act with
  its fields and the **quoted lines each field rests on**, the sidecar discipline of
  phase 2b-iii-b's `pages.json`.

`{year}` is the first year of the volume's span (`ass-33-1900`; ASS 1 is `ass-01-1865`),
and so is `acta.year`. The fixtures README gains a row per volume: page count, summa
range, the year span as the title page prints it (`1900-901`), retrieval date, pypdf
version.

The sample is ASS 1 (1865–66, Pius IX), 12 (1879), 23 (1890–91), 33 (1900–01) and 41
(1908) — one a decade, every pope, three already in the store, and the volume the
phase-1 measurement read (23). `popes.ts` gains Pius IX (`PII IX`, `rp:pius-ix`, from
1846-06-16) and Leo XIII (`LEONIS XIII`, `rp:leo-xiii`, from 1878-02-20), keyed on the
genitive and nominative forms the ASS prints.

## 3. The scanner: synthesising the chronological index

`tools/src/acta/ass.ts`, run by `tools/scan-ass.ts` once per volume against the store
text, as `tools/recover-acta-pages.ts` runs `recover.ts`. An act is found from its **end**
and read from its **start**:

**Anchor.** The pope's closing formula: `Datum Romae …` (`apud S. Petrum`, `apud Sanctum
Petrum`, `sub annulo Piscatoris`) followed within three lines by `Pontificatus Nostri`; the
vernacular letters' `Dato a Roma … / Dal Vaticano … Del Nostro Pontificato` likewise. A
`Datum Romae` without `Pontificatus Nostri` is a dicastery's and is not an anchor (ASS 41
p. 361, the letter Card. Segna signs, is the trap). **Allocutions have no dateline** and are
anchored on their heading (`ALLOCUTIO` with the pope's name within two lines), dated from
the heading's own formula (`in Consistorio … diei 16 Decembris 1907`) or, failing that,
left `????-??-??` for a curated reading (§6) that quotes the summa's row, which prints the
allocution's date; marked `anchor: 'heading'`.

**Opening.** From the anchor, walk back to the nearest preceding **class heading**: a caps
line from a fixed list — `EPISTOLA ENCYCLICA`, `LITTERAE ENCYCLICAE`, `LITTERAE
APOSTOLICAE`, `LITTERAE`, `LITTERAE in forma Brevis`, `EPISTOLA`, `CONSTITUTIO APOSTOLICA`,
`MOTU PROPRIO`, `BREVE`, `EXHORTATIO`, `ALLOCUTIO`, `CHIROGRAPHUS` (extended only by what
the sample prints, each addition quoted) — that is **not a running head**: a running head
is the class alone beside a page number at the top of a page, an opening carries the pope's
name or a description on the same or the following lines. The walk is bounded (40 lines,
measured on the sample); two acts on one page resolve because each has its own anchor and
the walk stops at the nearer heading.

**Fields.**

| Field | Read from | Example (ASS 33 p. 273) |
|---|---|---|
| `category` | the heading, normalised to upper case | `EPISTOLA ENCYCLICA` |
| `pope` | the heading's or the salutation's name, through `popes.ts` | `Leo XIII` |
| `description` | the lines between heading and salutation | `Sanctissimi Domini Nostri LEONIS PAPAE XIII. DE IESU CHRISTO REDEMPTORE.` |
| `opening` | the first **eight words** after the salutation line (`LEO PP. XIII`, `LEO EPISCOPUS`, `PIUS PP. X`), or after `Venerabiles Fratres Salutem …` when that follows it; after the heading block for an allocution | `Tametsi futura prospicientibus, vacuo a sollicitudine animo esse` |
| `date` | the dateline: `die N mensis anno`, the day and year arabic or Roman, the month a Latin genitive; Roman numerals read tolerantly (`MDCGCC` → 1900, `MCMVHI` → 1908, `xxin` → 23) within the volume's year span as the sanity bound; else `????-MM-DD` as the AAS parser marks an unreadable year | `1900-11-01` |
| `page` | the running header's number on the page holding the heading (as `recover.ts` reads it), `8oo` / `3oi` / `6 19` normalised | `273` |

`incipit` is null on an ASS entry: the scanner cannot know how many words the shelf's
incipit has (*Tametsi futura* against the body's *Tametsi futura prospicientibus*), and the
registry's convention is the owner's, not the scanner's (§5 of the join). Each row carries
`series: 'ASS'`, `anchor: 'dateline' | 'heading'`, and `evidence: { heading, salutation,
opening, dateline, header }` — the five lines as extracted.

**Nothing is guessed.** An anchor with no heading within the bound, a heading with no
readable date, an opening the OCR broke (fewer than three words before the line ends):
each is emitted as a **defect row** with the lines it did find, for the report (§6) and for
curation (§5). The scanner's rules are learnt on the five sample volumes and then measured
on the 36 others in 2c-ii — a rule that fires once gets a curated row, not a branch.

## 4. The completeness check: the summa

The summa pages (heading `SUMMA ACTORUM` or `INDEX ANALYTICUS`) are located and extracted
to the `.summa.txt` fixture; the **papal part** runs from its heading (`LITTERAE ET ACTA
R. PONTIFICIS`, `LITTERAE ET ALLOCUTIONES APOSTOLICAE`, `ACTA ROMANI PONTIFICIS`) to the
first dicastery heading (`EX S. CONGR. …`, `EX SECRETARIA BREVIUM`, `EX ACTIS
CONSISTORIALIBUS`, `EX AEDIBUS …`).

It is parsed **loosely**: a row is any run of lines ending in a page number (after `pag.`,
`»`, `>`, `*`, or dot leaders; `ig3` → 193, `3oo` → 300, `6 19` → 619, `5 80` → 580
normalised); two pages on one row (`462 et 683`) are two rows. Descriptions are kept as
printed, interleaving and all — they are reported, never matched or parsed.

**The check**: every summa page must be the `page` of one scanned act; every scanned act
should sit on a summa page. Per volume the report prints three findings with the quoted
rows — **summa rows unclaimed** (the scan missed an act, or read its page wrong: each
resolved by a curated reading, §5), **scanned acts the summa omits** (the summa lists
selectively; a finding, not a defect), and the **count per class both ways**. The pinned
numbers of the era include the claimed and unclaimed counts.

## 5. The join

- **Types.** `ActaEntry.series` widens to `'AAS' | 'ASS'`; an entry gains the optional
  `opening`, `anchor` and `evidence` of §3. The reference written is `{ series: 'ASS',
  volume: 33, year: 1900, page: 273 }` — the schema admits `ASS` already; no schema change.
  Invariant 25 keys on the series, so an ASS page never collides with an AAS page;
  `ACTA_SHARED_PAGES` takes the pages the ASS prints two short letters on, as for the AAS.
- **Sources.** `ACTA_SOURCES` gains the five sample rows — `kind: 'ass'`, key `ass-33`,
  the volume, the year, the two fixture files, the PDF URL, the retrieval date.
  `loadActaIndexes` reads the `.entries.json` of an `ass` source (validated against the
  entry shape) where it parses the text fixture of an AAS source; downstream — `matchActa`,
  `applyActa`, the reports — takes the entries as it takes the parser's.
- **Categories.** `categories.ts` already heads `EPISTOLA ENCYCLICA`, `LITTERAE
  APOSTOLICAE`, `CONSTITUTIO APOSTOLICA`, `MOTU PROPRIO`, `ALLOCUTIO` and `CHIROGRAPHUS`;
  it gains the ASS's singular and bare forms the sample prints — `EPISTOLA` and `LITTERAE`
  on the *Epistulae* row (`letter`), `LITTERAE IN FORMA BREVIS` and `BREVE` on a *Brevia*
  row (`brief`), `EXHORTATIO` on the exhortation row — each with the volume and page of its
  first occurrence in the row's comment. A heading the sample never prints gets no row.
  *Allocutiones* stays `harvested: 'no'` (the matcher skips the category): the report
  lists the sample's allocutions with the shelf's same-date address where there is one
  (Leo XIII has 18 addresses on the speeches shelf), and whether the flag should lift for
  the ASS is decided from that count in 2c-ii, not here — lifting it moves every AAS era's
  pinned numbers.
- **One matching rule is new, for ASS entries only: the opening-prefix rule.** Where the
  AAS rule tells candidates apart by equality of incipit slugs, an ASS entry matches the
  candidate whose incipit slug is a **word-boundary prefix** of the entry's `opening` slug
  (`tametsi-futura` of `tametsi-futura-prospicientibus-vacuo-a-sollicitudine-animo-esse`;
  `tametsi-fut` is not). Same candidates (the pope's documents on the entry's date), the
  same class rule first, the same toponym rule for a constitution, the same ambiguity
  reporting; the match is recorded `by: 'opening'`. Nothing else loosens: the near-miss
  (±1 day) stays reported and never matched — the dateline is the act's own date, so a
  shelf date a day off is a finding about the shelf.
- **Popes.** Vatican I's two constitutions (`oec:vatican-i`, `promulgatedBy: rp:pius-ix`)
  fall in ASS 5–6, outside the sample; how the matcher treats a conciliar act the ASS
  prints under the pope is decided when 2c-ii reaches those volumes.

## 6. Curation and the hand confirmation

**What the owner confirms is the era report, not each act.** Every scanned act is printed
with its five quoted lines and its outcome, so a wrong reading stands beside its evidence;
the tables are those of every era report — matches by rule (`unique` / `opening` /
`toponym` / `curated`), ambiguities with their candidates, unmatched entries with the
shelf's same-date acts and near-misses, the shelf documents of the volume's years with no
reference — plus the scanner's defect rows (§3) and the summa's unclaimed rows (§4).

Three curated tables carry the hand's decisions, each row quoting its evidence:

- `ACTA_INDEX_CORRECTIONS` (a date the OCR broke, keyed by the entry) and
  `ACTA_MATCH_OVERRIDES` (the class rule sends an entry to the wrong act) apply to ASS
  entries unchanged;
- **`ASS_READINGS`**, new: an act the scanner missed or misread — heading, page, date,
  opening, pope, category — quoted from the volume, applied before the join as 2b-iii-b's
  readings are (`applyPageRows`), keyed by volume and page; a reading no defect or
  unclaimed summa row answers to is stale and a hard error.

No regex is added for a defect that occurs once. The nine provisional records of the era
are listed with what the ASS prints at their date; a re-mint is the owner's decision and
out of scope.

## 7. Report, tests, documentation

- **Report.** `tools/acta-volumes-report.ts ass-sample` writes
  `docs/superpowers/reports/2026-09-2D-ass-volumes-sample.md` in the era-report shape with
  the scanner and summa sections of §6; its headline numbers — references per source and
  pope, matches by rule, unmatched, defects, summa claimed / unclaimed — are pinned in
  `tools/test/harvest-data.test.ts` as every era's are, and the seven AAS era reports are
  regenerated (they print the corpus totals).
- **Tests.** The scanner's rules — the anchor and its dicastery exclusion, the walk-back
  and the running-head rejection, the three date spellings and the tolerant numerals, the
  page normalisation, the summa row parser — are unit-tested on short quoted excerpts of
  the sample volumes, inline in the test. The entries fixtures are tested for determinism
  by re-scanning when the store text is present and skipping offline, as `recover.ts`'s
  tool is. The opening-prefix rule gets its own cases: prefix match, non-boundary
  non-match, two candidates → ambiguous, no candidate → unmatched.
- **Documentation.** README's two phase paragraphs (the join now reaches 1865; the
  numbers); SCHEMA.md's `acta` paragraph (the ASS joined, the first-year convention); the
  fixtures README (five rows and the ASS paragraph); `fetch-acta.sh`'s usage comment; this
  spec's tables restated from the measurement; a comment on #25 with the numbers.
- **Sequencing.** One PR for the sample (fetch + scanner + fixtures; join + report + pins;
  docs), as 2b-i was — the plan splits the commits.

## 8. Out of scope

2c-ii, the remaining 36 volumes, in eras the sample's scan rate decides; 2c-iii, ASS-born
documents and the reprints of earlier popes registered under their issuers (`rp:leo-xii`,
`rp:pius-vii`, `rp:pius-viii`, `rp:gregory-xvi` exist), decided from 2c-i's reverse-gap
table; the summa's descriptions as data; the dicasteries' acts, the *Rota* cases and the
appendices; lifting *Allocutiones*' `harvested` flag; any re-mint of a provisional record.
