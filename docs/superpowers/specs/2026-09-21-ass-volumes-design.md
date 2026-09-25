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
| ASS 41 | 1908 | Pius X | *Index analyticus* (pp. 799–810) | `ACTA ROMANI PONTIFICIS`: ≈ 33 rows |

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
line from a fixed list — restated on 2026-09-22 from the measurement, so that it is
`CLASS_HEADINGS` (`ass.ts`) word for word: `EPISTOLA ENCYCLICA`, `LITTERAE ENCYCLICAE`,
`LITTERAE APOSTOLICAE`, `CONSTITUTIO APOSTOLICA`, `MOTU PROPRIO`, `ALLOCUTIO`, `EXHORTATIO`,
`CHIROGRAPHUM`, `CHIROGRAPHUS`, `BREVE`, `LETTERA ENCICLICA`, `LETTERA`, `LITTERAE`,
`EPISTOLA`, longest first so that `EPISTOLA ENCYCLICA` is read before `EPISTOLA`. The two
Italian forms are the sample's own (`LETTERA Enciclica del Papa Leone XIII …`, ASS 23
(1890) 193; `LETTERA / DI / SUA SANTITÀ PAPA LEONE XIII`, ASS 12 (1879) 3), and
`CHIROGRAPHUM` is how the sample spells the chirograph (ASS 33 (1900) 714) where this spec
first wrote `CHIROGRAPHUS`; both are listed, and neither `CHIROGRAPHUS` nor the `LITTERAE
DECRETALES` this spec also named occurs in any of the five volumes — the decretals heading
was struck from the code on 2026-09-22 for that reason (0 occurrences in the five store
texts; the only `decretales` are in running prose, which cannot match a caps class word).
`LITTERAE in forma Brevis` is not a member of the list but an optional tail on it, read with
either case of its `B` because the sample prints both (`LITTERAE in forma Brevis`, ASS 33
(1900) 3, 129, 198, 577; `LITTERAE in forma brevis`, ASS 23 (1890) 437). The list is
extended only by what the sample prints, each addition quoted. The heading must **not be a
running head**: a running head is the class alone beside a page number at the top of a page, an opening carries the pope's
name or a description on the same or the following lines. The walk is bounded by **the
previous anchor** — an act's heading stands after the act before it closes, so a walk never
leaves its own act (`readAct`, `ass.ts`; corrected 2026-09-22 from the "40 lines" this spec
first wrote, which the implementation never used, and which the acts of the sample exceed).
The span such a walk may cross is the act's own, and the longest the sample prints is the
exhortation *Haerent animo* of ASS 41, which opens at p. 555 and is dated at p. 577: a
reading's span, not a measured walk, since the entries fixtures record the page the act
opens on and not the anchor's. Two acts on one page resolve because each has its own anchor
and the walk stops at the nearer heading.

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
R. PONTIFICIS`, `LITTERAE ET ALLOCUTIONES APOSTOLICAE`, `ACTA ROMANI PONTIFICIS`), pausing
at the first dicastery heading (`EX S. CONGR. …`, `EX SECRETARIA BREVIUM`, `EX ACTIS
CONSISTORIALIBUS`, `EX AEDIBUS …`) and reopening at a later papal heading, if one follows —
ASS 8 (1874) 727-728 prints this shape, a second `LITTERAE APOSTOLICAE.` heading nine
further papal rows after its first part closes (§10).

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

- **Report.** `tools/ass-volumes-report.ts` — a sibling of `tools/acta-volumes-report.ts`,
  not an era of it, since that tool loads the AAS sources alone — writes
  `docs/superpowers/reports/2026-09-22-ass-volumes-sample.md` in the era-report shape with
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

## 9. Measured (2026-09-22)

Phase 2c-i ran on the five sample volumes; the numbers are the totals of the era report's
§2 and §3 tables ([`docs/superpowers/reports/2026-09-22-ass-volumes-sample.md`](../reports/2026-09-22-ass-volumes-sample.md)),
which `tools/ass-volumes-report.ts` computes. The numbers below are phase 2c-i's own, as
it merged; phase 2c-ii-a re-read the sample with the brevia rule and the relaxed
`header-mismatch` and regenerated the report, and what it prints now is in §10's *Measured*.

**The scan against the summa (§2).** 3 785 pages read; **63 acts scanned by rule** (ASS 1
0, ASS 12 10, ASS 23 8, ASS 33 18, ASS 41 27) and **24 read by hand** (`ASS_READINGS`, each
row quoting the volume's lines), **85 entries** over the five volumes, 61 of them as the
scanner read them, 7 anchored on a heading rather than a dateline. **37 defects** remain —
21 `no-heading`, 10 `no-date`, 6 `header-mismatch`, 0 `no-opening`, 0 `unknown-pope` — 15 of
them the brevia of the `EX SECRETARIA BREVIUM` part, left as defects rather than curated
because they are a rule's worth. The summae list **87 rows**, a scanned act opens at **57**
of the pages they cite, **28** rows are unclaimed (17 of them answered by a reading, and of
the 11 left 10 are not a papal act opening at that page); **one genuine miss** in 87 rows,
ASS 33 p. 193, whose dateline the OCR broke. 4 scanned acts the summa does not list, three
of them dicastery-part acts. **No volume of the sample shows a page offset**: every
`header-mismatch` of the five is the OCR's reading of the right number (§4's second
question, answered yes *for the sample*). It is not answered for the series: 2c-ii-a found
ASS 7 (1872) PDF pp. 496-547 genuinely offset by +2, which no mismatch had ever counted
because no act opens inside that stretch (§10's *Measured*).

**The join (§3).** Of the 85 entries, **76 fall in a harvested category** and **57 matched**
(75.0 %) — 53 by the unique rule, **4 by the opening rule**, 0 by toponym, 0 curated — with
**0 ambiguous entries** and 0 entries claimed twice. Per volume: ASS 1 0, ASS 12 5, ASS 23
7, ASS 33 16, ASS 41 29. **19 unmatched**, every one held `series-not-created`, and **0
documents created**, as §5 intends; 9 entries are skipped as a category the registry does
not harvest (8 allocutions, 1 chirograph). Five of the 19 are the `LITTERAE in forma Brevis`
the class rule holds against the letters shelf (the report's finding 9), ASS 23 p. 437 among
them since the heading regex learnt that volume's lower-case `brevis` on 2026-09-22. 1 `ACTA_SHARED_PAGES` row (ASS 33 p. 641, two
acts of 1901) and 2 `ACTA_REPRINTS` rows (AAS 1 (1909) 5 and 7, whose citation of record is
ASS 41 (1908) 619 and 425). The reverse gap is **48** shelf documents of the volume years
with no reference; the era holds 496 shelf documents dated 1865–1908, of which **57** now
carry a reference.

**What 2c-ii should expect** (the report's finding 15). (a) The OCR is worst at the start:
ASS 1 (1865) yielded 0 acts by rule and needed 3 hand readings, so the volumes of the 1860s
and 1870s should be assumed unscannable until measured and budgeted as readings; from 1879
the rate is usable and from 1900 good. (b) The `EX SECRETARIA BREVIUM` part is the next
rule and is worth 15 acts in these five volumes — anchoring on the ring formula rather than
on a class heading, a decision to take once, with the owner, since it moves every volume's
counts. (c) One summa page is unreadable and will be again: ASS 23 p. 753 is interleaved
word by word by the OCR, so three papal rows are lost and three dicastery pages read as
papal rows; a re-extraction of that page, or a hand row, is the cheapest fix. (d)
`header-mismatch` may be worth relaxing for this series: 6 of the sample's defects are it,
every one the OCR's reading of the right number, and no volume *of the sample* showed an
offset. Taken in 2c-ii-a on the series' own 48 mismatches — and the one genuine offset they
never reached, ASS 7's, guarded by curation rather than folded into the rule (§10's
*Measured*).

## 10. Addendum (2026-09-22): how 2c-ii is split

Phase 2c-i's report said the sample's scan rate would decide 2c-ii's eras. It could not:
the rate is a property of the summa parser as much as of the scanner, and the parser had
been taught only what five volumes print. So the split was decided from a survey of the
whole series instead — every volume fetched, scanned and checked with the tooling exactly
as 2c-i merged it, adding no source, writing no fixture and touching no document
([the survey](../reports/2026-09-22-ass-survey.md), `tools/survey-ass.ts`).

**What the survey measured.** 41 volumes, 30,021 pages: **380 acts read by rule** (against
63 in the five sampled), 549 summa rows of which 257 claimed (47 %), 386 defects. The yield
by decade — 1860s none claimable, 1870s 75 %, 1880s 20 %, 1890s 37 %, 1900s 62 % — is a
**floor, not a measurement**, because of the finding that reshaped this phase:

**The summa's papal part was headed in at least eight forms the parser did not know, and it
knew three** (all of it answered by 2c-ii-a: the parser now knows 16, and the *Measured*
below says which volumes are left). Twenty volumes found no papal heading at all, so their
summa read as having no papal part and claimed nothing however well the volume scanned: `ACTA SOLEMNIORA ROM. PONTIFICIS PUBLICI
IURIS FACTA` (ASS 5, 6), `ACTA SOLEMNIORA ROMANI PONTIFICIS` (3), `ACTA SOLEMNIORE ROM.
PONTIFICIS` (4), `ACTA SOLEMNIORÂ ROMANI PONTIFICIS` (8), the bare class as the heading —
`LITTERAE APOSTOLICAE` (10, 11) and the mixed-case `Litterae Apostolicae / SS. D. N. P.
Papae IX` (9) — `LITTERAE ET RESPONSUM ROMANI PONTIFICIS` (14), `LITTERAE MOTU PROPRIO ET
CONSTITUTIO R. PONTIFICIS` (15), `LITTERAE ROMANI PONTIFICIS` (16, 17, 18), `LITTERAE R.
PONTIFICIS` (19), and the OCR's `ACTA ROMAM PONTIFICIS` (35). The same defect from the
other side: where the part's **end** is a heading the parser does not know, the part runs on
into the dicasteries and their rows are counted as the pope's (ASS 21: 100 rows, 87
unclaimed; ASS 27: 47 and 43). ASS 20 prints no part heading at all and opens on its rows;
ASS 26's summa opens on a dicastery, its papal part elsewhere; ASS 1, 2 and 7 may have no
papal part at all, which reading will settle.

**Decisions taken by the owner on 2026-09-22.**

1. **2c-ii-a, the parser, first** — rules only, with all 41 volumes as evidence: the summa
   headings and part-ends above, each quoted at the volume and page the survey printed;
   then the survey re-run, so the yield the eras are planned against is a measurement. No
   source is added, no fixture written, no document joined.
2. **The brevia are read** (the survey counted **83** across the series when the ruling was
   taken, 59 of them in the 1900s, against the 15 the sample saw — a miscount: its regex
   read only the lower-case `annulo` and the series prints `Annulo` 54 times as well, so the
   figure the ruling should be read against is **105**): anchored on the ring formula rather than on a
   class heading, the descriptive caps title read as the description, the class `brief`.
   Adopted as its own commit inside 2c-ii-a, so every later era measures against the
   finished scanner and 2c-i's own numbers regenerate once, there, rather than era by era.
3. **Then one era per pontificate**, largest yield first: **2c-ii-b** Pius X (ASS 36–41, the
   two-pope volume 36 included — 62–64 % claimed, the densest shelf), **2c-ii-c** Leo XIII
   (ASS 12–35, the three sampled excepted), **2c-ii-d** Pius IX (ASS 1–11, the least
   scannable and the most hand reading). Each era repeats 2c-i's shape with the tooling
   built: its `ACTA_SOURCES` rows, the scan to fixtures, a curation round that counts before
   it writes a rule, the join, the harvest, the pins, an era report, the documentation, a PR
   and a comment on [#25](https://github.com/CatholicOS/cmddr/issues/25).

**Carried into 2c-ii-a from 2c-i's review.** `tools/src/acta/ass.ts` splits along the seams
its three sections already have — `ass-dates.ts`, `ass-headings.ts`, and the scan — before
the rule churn of the eras, since 2c-ii's work is almost entirely adding quoted spellings.
`header-mismatch` was **38** across the series when this was written (48 once the parser
tasks had re-run the survey) and every instance the survey printed is the OCR's reading of
the right number, none of them in a run of offset pages (ASS 3 `1*97` for 197, ASS 6 `4SI`
for 481, ASS 10 `4<¡` for 49). **That is true of the mismatches and not of the series**: a
mismatch is only ever raised where an act opens and the header is checked, so a stretch no
act opens in is never counted — ASS 7 (1872) PDF pp. 496-547 is exactly that, a genuine +2
offset (see the *Measured* below). The guard is a curated-reading generator, not a
correctness check, and 2c-ii-a decides whether to relax it on that evidence.

**Measured (2026-09-23, phase 2c-ii-a).** The phase wrote rules and re-ran the survey after
each ([the survey](../reports/2026-09-22-ass-survey.md), regenerated 2026-09-23, and the
sample's era report with it). Decision 1 held: no source was added, no fixture written, no
document joined — save the five sample volumes, whose fixtures, report and join the brevia
rule regenerated once, as decision 2 intends.

*What the parser now reads.* **21 of the 41 volumes found a papal part before, 37 after.**
`parseSummaPapalPart` knows **16** papal-heading forms, each cited in a doc comment at the
volume that prints it (`PAPAL_HEAD_FORMS`, `tools/src/acta/summa.ts`), and the part now
**pauses** at the first dicastery heading and **reopens** at a later papal one — the shape
ASS 8 (1874) 727-728 prints, and the only one in the series: the reopening fires **exactly
once** over all 41 summae, a measurement to be repeated whenever `PAPAL_HEAD_RE` grows, since
every alternative added to it is another line that could reopen a paused part. ASS 21's part
was 100 rows with 87 unclaimed and is 19 rows with 6.

*Where the part still ran on, and what is left.* The claim first written here — that no
volume's papal part still runs on into the dicasteries — was **true only of the narrow
marker**. `end === null` catches a part that met no dicastery heading at all, and no volume
shows it; a part that runs *past* a heading the parser does not know and stops at a later one
it does reports that later heading and shows no marker, while the rows in between have already
been counted as the pope's. Four volumes were in that state, and the final fix wave of 2c-ii-a
read each of them:

- **ASS 37 (1904) 799, ASS 38 (1905) 417 and ASS 40 (1907) 770** print `EX SACRO CONSISTORIO`
  over the consistorial `Relatio actorum` rows, which `SACRA\b` does not match; **ASS 35 760,
  36 760, 37 800, 38 418, 39 626, 40 771 and 41 801** print `ACTA ROMANARUM CONGREGATIONUM`,
  which carries no `EX` at all. Both forms are now in `DICASTERY_RE`, quoted at those pages,
  and both were checked against all 41 summae first: over the whole series they match exactly
  those ten heading lines and nothing else — no row, no running header, no body line. The
  three volumes' parts now end where the volumes end them.
- **ASS 27 (1894) cannot be fixed by any rule**, and is recorded instead (survey §4b). Its
  papal part carries 47 rows of which only the first five are the pope's: rows 7-47 are the
  Congregation of the Council's own case rows. The cause is not a missing spelling — the
  volume's first dicastery heading falls on summa p. 753, one of the woven pages of §4c, and
  the extraction has destroyed it, leaving the bare word `EX` glued to the end of the left
  column's line 33 (`Propagarne Fidei » fovetur et EX`) with the rest of the heading absent
  from the page. There is nothing left to teach the parser. **ASS 27's 43 unclaimed rows are a
  known floor**, and the 1890s decade, the Leo XIII pontificate and 2c-ii-c's own span are each
  a floor by that much.

Survey §1's `**runs on**` marker now says what it means and what it does not, and a reopened
part that reaches the summa's end is printed as `**reopened, to the end**` rather than sharing
the defect's marker — two unlike findings that both report `end: null`.

*The yield, before → after* (survey §2 against this section's *What the survey measured*):

| Decade | Summa rows | Claimed | Claimed % |
|---|---|---|---|
| 1860s | 0 → 42 | 0 → 18 | — → 43 % |
| 1870s | 12 → 98 | 9 → 30 | 75 % → 31 % |
| 1880s | 126 → 106 | 25 → 47 | 20 % → 44 % |
| 1890s | 134 → 134 | 50 → 51 | 37 % → 38 % |
| 1900s | 277 → 278 | 173 → 196 | 62 % → 71 % |
| **series** | **549 → 658** | **257 → 342** | **47 % → 52 %** |

Two of those movements are the parser telling the truth rather than a yield falling: the
1870s' 75 % was 9 rows of 12, one volume's, where the decade now shows 98 rows of seven
volumes; and the 1880s' 126 rows were mostly ASS 21's part running into the dicasteries.
**Acts: 380 → 482**, in the two steps below, and **defects 386 → 288**. The 1900s row and the
series row fell in *rows* and rose in *share* because the two dicastery headings above took
away rows that were never the pope's: ten rows left the papal parts of ASS 37, 38 and 40, and
two of them had been claimed. By pontificate, which is how the eras are cut: Pius X (ASS 37-41)
180 acts, 198 rows, **73 %** claimed; ASS 36 38 acts, 36 rows, **61 %**; Leo XIII (ASS 12-35)
203 acts, 296 rows, **46 %**; ASS 11 7 acts, 12 rows, 50 %; Pius IX (ASS 1-10) 54 acts, 116
rows, **28 %**.

*The brevia, read on the ruling of 2026-09-22* (survey §3). Where an act closes under the
ring of the Fisherman and no class heading stands behind it, the walk-back reads it from the
pope's own name standing alone, takes the descriptive title above that name as the
description, and gives it the class `BREVE`. **61 of the 107 such defects became acts**, and
survey §3 now prints the ledger that reconciles that one number with the totals, since
neither difference is 61: **acts 380 → 442** (+62 — the 61, and ASS 11 (1878) 594, which was
no defect before at all and which the rule's third dateline anchor `DATUM_BROKEN_RE` found)
and **defects 386 → 328** (−58: 79 removed, the 107 less the 28 left, and 21 added — 18 of
the 107 landing on an honester reason than `no-heading` once the rule had read the breve and
the page or the date was refused, and 3 the other sites of the third anchor). The two counts
of the one population are both printed: **107** on the anchor text the rule gates on,
**105** on the defect's quoted lines, the measure the survey's `of them brevia` columns use,
which misses two datelines breaking `Annulo­ / Piscatoris` across the line end (ASS 9 (1876)
238, ASS 10 (1877) 93); both end at the same 28. **28 brevia are left** — a breve whose running header
the OCR damaged, one whose dateline prints no `die`, and the shape the eras must watch: the
ASS reprint older briefs inside later acts, guillemets and all (ASS 28 (1895) 112 prints one
of Pius IX of 1851 inside a Congregation's `COMPENDIUM FACTI`), and only `assDate`'s
ten-year span bound refused that one. **An in-span quotation with a pope's name above it
would read as a spurious act**, and nothing in the rule would catch it.

*`header-mismatch`, relaxed for the ASS alone* (survey §5). All **48** of the series'
mismatches were the OCR's reading of the right number, each confirmed against its volume's
neighbouring pages, so `headerAgreesASS` (`ass.ts`) lets a `DIGIT_OCR` letter stand for any
digit rather than the one it is keyed to, and admits an all-digit token one edit from the
page. `headerAgrees` (`recover.ts`) is untouched and the AAS page recovery reads exactly as
before. **48 → 8 mismatches, 442 → 482 acts.** The latitude is measured, not assumed: over
every page of every volume the relaxation admits **2 070 of 30 021 pages (6.9 %)** that
`headerAgrees` refuses, so the next rule that reads more of the body inherits it knowingly.
And it is guarded where it must be: ASS 7 (1872) PDF pp. 496-547 print a genuine +2 offset,
unbroken from p. 496 (printing `498`) to p. 547 (`549`) and closing at p. 548, curated in
`ASS_PAGE_OFFSETS` (`curation.ts`), inside which `headerAgreesASS` refuses as
`headerAgrees` does. It cost nothing downstream because no act opens in that stretch today —
which is also why the 48 never counted it.

*The offset scan, now run corpus-wide* (survey §5). The argument that a genuine offset shows
as a run, and that the 48 show none, was made **only over the 48 pages where an act opens**,
which is the one place an offset is guaranteed not to be looked for; ASS 7 was found by hand.
The final fix wave ran the test properly, over all 30,021 pages: a page supports a delta when
`headerAgrees` refuses its header, `headerAgreesASS` admits it and one of its header tokens
normalises to the page plus that delta; a page whose header prints no number is bridged; a run
is four or more supporting pages sharing a delta. **14 runs, in 7 volumes**, of three kinds.
(a) ASS 7's own offset, in five fragments — the scan rediscovers what is already curated, which
is the test the detector had to pass. (b) Three runs of **separately paginated matter** bound
into a volume: ASS 16's own supplement (the PDF is named `…+supplemento-17-96`) and ASS 38's
French *Supplementum* (§4d of the survey, paginated 1-273); real latitude, no offset. (c) **Six runs that are one digit
misread, repeating across a signature** — the 3/5 confusion this section already documents,
once 5/8: +200 at ASS 8 374-378, ASS 29 385-391 and ASS 33 387-390; +300 at ASS 13 518-521;
and **+20 at ASS 29 530-533 and ASS 33 436-439**, the two that look most like an offset, in
eight pages the relaxation admits, one of the two volumes being a sample fixture.

**The two +20 runs are misreads, and the volumes prove it.** An offset means the printed
numbers in the range exist nowhere else in the volume; here they do. ASS 29 PDF p. 550 prints
`550 CASTRIMARIS` and p. 552 prints `552`, under a different running title from the
`VARSAVIEN. SEU PARISIEN.` of PDF pp. 530-533, which print `550`-`553`; ASS 33 PDF p. 456
prints `456 EX S. G. CONCILII` and p. 458 `458`, while PDF pp. 436-439 print `456`-`459` under
`EX S. C. RITUUM`. Both runs are bounded by pages printing the correct number (ASS 29 p. 529
`529`, p. 534 `534`; ASS 33 p. 435 `435`, p. 440 `440`), and a pagination cannot skip twenty
pages and un-skip them four pages later. The same test disposes of the +200 runs and of ASS 13,
whose volume has only 592 pages and so no p. 818 at all. **Nothing was added to
`ASS_PAGE_OFFSETS`**: an entry there refuses pages whose headers are merely misread, which is
the opposite of what the table is for. ASS 7 remains its only row.

*Two losses measured, and no rule written for either.* (a) **The woven summa columns**
(survey §4c): on **15 pages of 13 volumes** the two columns come back glued, because the
extraction has collapsed the gutter to a single character. Widening the gutter search from
runs of four spaces to three, or to two, moves the gutter on **none** of them; the columns
are not aligned, so a fixed cut would fall inside a word; and the seam's own page token is
too rare to cut on (3 of 38 lines on ASS 27 (1894) 753). The price is **10 papal rows in 3
volumes** (ASS 3, 23, 27), each glued row losing two at once. These are the eras' to curate
by hand, as 2c-i curated ASS 23 (1890) 753. (b) **Five `header-mismatch` pages** stay out of
reach (ASS 8 pp. 373, 686; ASS 10 p. 49; ASS 13 p. 3; ASS 16 p. 241): two edits or worse, or
a page number the OCR split across two lines. The other three are answered by curated
readings already.

*One volume's body was being read wrong* (survey §4d). `locateSumma` ran ASS 38's summa from
p. 417 to p. 702, swallowing a separately paginated 270-page French *Supplementum ad "Acta
S. Sedis"* bound in after the volume's own `IMPRIMATUR` on p. 432. The summa is pp. 417-423
and the body 1-416; the volume's own index cites nothing past p. 415 and indexes the
supplement as one row each, so ASS 38's **13 acts are its real yield** and no era should
look in that dossier for a rule.

*What 2c-i's own numbers became*, the sample re-read with both rules (the era report,
regenerated 2026-09-23, against §9): **78 acts by rule** (63), **97 entries** (85), **73 of
them as the scanner read them** (61), 24 by hand (24), **22 defects** (37), **60 of the 87
summa rows claimed** (57) with the same **one genuine miss** (ASS 33 p. 193), 16 scanned
acts the summa omits (4), 14 of them `BREVE` under the `EX SECRETARIA BREVIUM` heading the
papal part ends at. **References: 57, unchanged**, and **0 documents created**: every entry
the two rules added is a `BREVE`, not one of which the briefs shelves hold, and all are held
`series-not-created`. The reverse gap is still 48.

**What the eras can plan against, and what is still a floor.** The **1900s are a
measurement**: all nine volumes find their papal part, and 196 of 278 rows are claimed.
Each of the other four decades carries **exactly one volume that still finds no papal
heading** and so claims nothing however well it scans — **ASS 1 (1865-66), ASS 7 (1872-73),
ASS 20 (1887), ASS 26 (1893-94)**, whose summa first lines survey §4b prints: ASS 1 and
ASS 7 list the pope's acts under the dicastery that issued them, ASS 20 prints no part
heading and opens on its rows, ASS 26's summa opens on a dicastery. Their 23 scanned acts
(0, 5, 9, 9) sit outside the check altogether, and their decades' percentages are
measurements of the other volumes only. Four further stretches are floors by a known
amount: **ASS 27's 43 unclaimed rows**, whose dicastery heading the woven columns destroyed
outright (above, and survey §4b); the 10 glued papal rows of ASS 3, 23 and 27; the 5
`header-mismatch` pages above; and the 28 brevia the rule does not reach (by decade in survey
§3). Everything else in §2 is now a measurement, so the eras of decision 3 are planned
against, each over the span decision 3 gives it and summed from survey §1: **2c-ii-b**
(Pius X, ASS 36-41) **71 %**, 166 of 234 rows — 73 % over Pius X's own five volumes and 61 %
over ASS 36 — rather than the 62-64 % written there; **2c-ii-c** (Leo XIII, ASS 12-35)
**46 %**, 137 of 296, whose floors are ASS 20, ASS 26, ASS 27 and most of the woven pages;
and **2c-ii-d** (Pius IX, ASS 1-11) **30 %**, 39 of 128 — 28 % over ASS 1-10 and 50 % over
the 12 rows of the two-pope ASS 11 — whose floors are ASS 1 and ASS 7. (The pontificate rows
of survey §2 cut ASS 11 and ASS 36 out into their own lines; decision 3 puts each inside an
era, so the span figures above are the ones to budget against.)

**One act is filed under the wrong class, and it is recorded rather than rule-fixed** (survey
§3). Where the brevia walk-back finds no class word on the heading line, `readAct` falls back
to the class `BREVE` — right for the *Secretaria Brevium*, whose headings are descriptive
titles. **ASS 21 (1888) p. 513** prints `CONSTITUTIO SSmi D. N. Leonis XIII de Licaeo magno
Quebecensi.` over `LEO PP. XIII.` and closes under the ring, so it is filed `BREVE`, shelf
class `brief`, where the volume says *Constitutio*. All 89 `BREVE` entries the series yields
were checked, and this is the only one whose own description names a different class. Adding a bare
`CONSTITUTIO` to `CLASS_HEADINGS` has corpus-wide blast radius and belongs to the era that can
measure it; until then the entry stands as recorded.

**Measured (2026-09-26, phase 2c-ii-b).** The first era, Pius X (ASS 36–40; ASS 41 was 2c-i's),
against what the survey predicted for it ([era report](../reports/2026-09-26-ass-volumes-pius-x.md)).

*The prediction held exactly.* Acts, defects, summa rows, claimed, unclaimed and omitted match
the survey's figures for these five volumes in every column, so the fixture path and the survey
pass read the same volume: **181 acts** over 3,721 pages, **139 of 197** summa rows claimed
(70.6 %), 70 defects. **111 references** written — ASS 36 7, ASS 37 19, ASS 38 9, ASS 39 49,
ASS 40 27 — 91 by the unique rule, 18 by the opening rule, 2 by a curated override.

*What the era cost in curation: three rows.* One `ASS_READINGS` (ASS:39:139, whose opening was
the addressee's style, `Augustissima et potentissima Imperatrix,` — one volume of the 41 prints
that shape) and two `ACTA_MATCH_OVERRIDES` (ASS:37:145, ASS:40:130, both against provisional
date-keyed shelf records carrying no incipit). Three rows for 181 entries is the thinnest any
ASS phase has needed, and it is the parser of 2c-ii-a that made it so.

*One rule, and the sample could not have shown it.* `GREETING_RE`'s repeat group read `Nostri`,
`Nostra` and `Nostrum` but not the nominative `Noster`, which is `Nost-e-r`: so `Dilecte Fili
Noster et Venerabiles Fratres,` was never stripped and stood as four acts' `opening`, telling
them apart from nothing. Measured over all 41 volumes, the fix (`Noste?r\w*`) leaves the
survey's per-volume table byte-identical — it moves no act into or out of the scan, only the
opening the join matches on. The series prints the shape 13 times in that position.

*The holds are a shelf that does not exist.* **50 entries held, every one `series-not-created`,
and 36 of them briefs**: Pius X has neither a briefs nor a bulls shelf (`pontiffs.ts`), so every
act of the *Secretaria Brevium* these volumes print is the registry's gap rather than the
scanner's. **No ambiguity survives**: the corpus totals for ambiguity and double claiming are the
ones they were before the era joined.

*ASS 38's supplement hides nothing.* The bound-in `Supplementum ad " Acta S. Sedis „ (VOL.
XXXVIII)` at pp. 433–702 contains no page carrying `Pontificatus Nostri`, and no scanned entry
falls in it; the volume's own summa at pp. 417–423 lists 16 papal rows and that is its whole
papal account.

*What 2c-ii-c and 2c-ii-d inherit.* 31 volumes: Leo XIII's (ASS 12–35, the three sampled
excepted) and Pius IX's (ASS 1–11). Two things here will not repeat — Pius X's letters shelf is
the era's fullest, and the brevia that had nowhere to go under him **do** have a shelf under Leo
XIII (8 records) and Pius IX (5), so the same acts will behave differently. What should repeat is
the shape of the round: a parser needing almost no rows, and a handful of provisional date-keyed
records only a curated override can tell apart.

**Out of scope for 2c-ii**, unchanged: the ASS-born documents and the reprints of earlier
popes registered under their own issuers (2c-iii, decided from the eras' gap reports).
