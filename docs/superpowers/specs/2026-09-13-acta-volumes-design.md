# The *Acta* volumes, 1909–2014 (phase 2b of the *Acta* programme)

Extends the AAS join (phase 1, PR #29) and the AAS-only documents (phase 2a, PR #32) from
the ten annual index PDFs of 2015–2024 to every earlier year for which the *Acta
Apostolicae Sedis* have a chronological index online: the whole-volume PDFs of 1909–2002 and
the annual index PDFs of 2010–2014. The record shape, the creation rule and the duplicate
guard are those of the 2a spec (`2026-09-13-acta-only-documents-design.md`) and are not
restated; this spec covers what is new — the fixtures, the parser's generalisation across a
century of typography and OCR, the popes, and the sample-first sequencing.

## 1. Sources, as measured on 2026-09-13

| Years | On vatican.va | Index | Fetch |
|---|---|---|---|
| 1909–2002 | one whole-volume OCR PDF per year (`documents/AAS-{vol}-{year}-ocr.pdf`, 2–6 MB, 500–1,300 pages); 1917 and 1983 in two parts (`AAS-09-I-1917`, `AAS-09-II-1917`; `AAS-75-I-1983`, `-II-`) | *Index documentorum chronologico ordine digestus* in the volume's tail — vol. 1 (1909) p. 835, vol. 23 (1931) p. 531, vol. 50 (1958) p. 1032, vol. 87 (1995) p. 1175 — the same structure as 2015–2024 | download; locate the index pages; extract only those to text |
| 2003–2009 | twelve born-digital monthly fascicles per year, no index file; the December fascicle carries no index (2005: 48 pages, none) | an annual *Index generalis* PDF per year, linked wrongly (§11.1) | as phase 1, by the hyphenated URL, layout mode with spaces collapsed — **phase 2b′, done** (§11) |
| 2010–2014 | monthly fascicles plus an annual index PDF (`AAS-INDICE2010.pdf`, `AAS-indice2012.pdf` — case varies) | as 2015–2024 | as phase 1 |

So phase 2b's corpus is **99 index sources**: 94 volume-tail indexes (96 files, counting
the two double volumes) and 5 index PDFs — **106** once §11 adds the seven annual index
PDFs of 2003–2009 this section had recorded as none online, which makes 12 index PDFs
beside the volume-tail indexes.

## 2. What varies across the century (from the four sampled volumes)

- **1909**: the index opens with a column header (`ANNO MENSE DIE`) and the first entries
  are a nested table of contents of *Sapienti Consilio* (the Curia's congregations listed
  under the constitution) — an entry can contain sub-items that are not acts.
- **1931**: OCR runs several entries onto one physical line; the page number is the only
  reliable entry terminator; `»` ditto marks survive; diacritics and ligatures are noisy
  (`Kerum novarum`, `Advenerabiles`).
- **1958**: clean; constitutions print **toponym in caps, vernacular in parentheses, then
  the incipit** — `SANTAREMENSIS (Obidensis). Cum sit.` — so both are read; category
  headings are numbered Roman (`III - CONSTITUTIONES APOSTOLICAE`).
- **1995**: as 2023, with soft hyphens (`U+00AD`) inside words.
- **Popes**: a volume can carry two or three (`I. — ACTA PII PP. X` / `II. — ACTA
  BENEDICTI PP. XV` in 1914; three in 1978). The pope heading is Latin genitive
  (*Pii PP. X*, *Benedicti PP. XV*, *Ioannis PP. XXIII*, *Pauli PP. VI*, *Ioannis Pauli
  PP. I*, *Ioannis Pauli PP. II*, *Benedicti PP. XVI*) and maps to the CRPDR id by a table
  in `categories.ts` (or a sibling), which reports any heading it cannot map.
- **Categories** will include wordings the 2015–2024 table has not seen (*Epistolae*,
  *Epistola Apostolica*, *Litterae Encyclicae*, *Motu Proprio*, *Chirographum*, *Nuntii
  radiophonici*, *Sermones*, …). An unmapped heading is an explicit `unknown` (PR #29
  review); the sample phase decides each mapping with a comment quoting the heading.
- **Dates before the volume year** are the norm for December acts, and an entry can be
  dated *years* earlier (an act published late); the guard's ±1 day and same-incipit rules
  handle it, and the report counts entries dated more than a year before the volume.

## 3. Fixtures

- `tools/fetch-acta.sh` gains a volume mode: download the volume PDF to scratch, find the
  chronological index's first page by its heading and its last page by the next top-level
  index heading (*Index alphabeticus*, *Index nominum*, *Index rerum* — measured per
  sample and recorded), extract **only those pages** with `pypdf` (phase 1's extractor) to
  `tools/fixtures/acta/aas-{vol}-{year}[-{part}].txt`, one page per form feed. The README
  records, per file, the PDF page range extracted, the volume's page count and the
  retrieval date. Index PDFs (2010–2014) are extracted whole, as in phase 1.
- The PDFs are never checked in. Expected fixture size: ~25 pages × ~3 KB × 96 ≈ 7 MB.

## 4. Parser generalisation

`tools/src/acta/index.ts` must parse every sample with a **measured parse rate**: entries
parsed ÷ lines ending in a page number within the *Acta Summi Pontificis* part, per
volume, plus the count of lines the parser consumed without producing an entry. The rate
is reported per volume; a volume under **95 %** is a finding to explain, not a fixture to
use silently. Specific shapes to handle, each with a unit test on an excerpt: the 1909
column header and nested sub-items; 1931's run-together lines; the 1958 toponym-plus-
incipit constitution; multi-pope volumes; `part` for the double volumes; Latin month
spellings across the century (*Ian.*, *Febr.*, *Mart.*, *Apr.*, *Maii*, *Iun.*, *Iul.*,
*Aug.*, *Sept.*, *Oct.*, *Nov.*, *Dec.*, and the full forms); OCR ditto-mark variants.

## 5. Sequencing: the sample PR, then the rest

**PR 2b-i (this PR)** — six volumes chosen for their variance, run through the *whole*
pipeline (fetch → parse → join → report → create), so the century's shapes are met before
the scale is:

| Volume | Why |
|---|---|
| 1 (1909) | the first; the column header and *Sapienti Consilio*'s sub-items |
| 9-I and 9-II (1917) | a double volume; `acta.part` used for the first time |
| 23 (1931) | run-together OCR lines |
| 50 (1958) | two popes (Pius XII, John XXIII); toponym-plus-incipit constitutions |
| 70 (1978) | three popes |
| 104 (2012) | an index PDF with the uppercase filename |

Creation follows the 2a rule: only categories whose shelf is harvested for that pope
(`pontiffs.ts`: Pius X, Benedict XV, Pius XI, Pius XII, John XXIII, Paul VI, John Paul I,
John Paul II, Benedict XVI — with `letters` harvested for Pius X, Pius XI and Pius XII,
so *Epistulae* are creatable there and held elsewhere). Holds as in 2a.

**PR 2b-ii** — the remaining 93 sources, once the sample's parse rates and mappings are
accepted. It may be split by era if the created count is large; the report says how large.

## 6. Report and measurement

The phase-1 report generator gains volumes as a dimension. Per volume: parse rate; entries;
unknown headings (listed); matched / ambiguous / claimed twice; created per category; held
per reason (listed); entries dated more than a year before the volume; documents of the
volume's popes with no reference. Plus, across the sample: unknown category headings and
the mapping decided for each; pope headings and their ids; toponym-plus-incipit
constitutions read; total and per-pope documents before and after; re-minted shelf ids
(expected none). Written to `docs/superpowers/reports/2026-09-13-acta-volumes-sample.md`.

## 7. Documentation

SCHEMA.md and README: the coverage sentence of the *Acta Apostolicae Sedis reference*
subsection is extended (which years are joined, which created from, and that 2003–2009
await a fascicle parser — superseded by §11, which joins them from the index PDFs the
index page links wrongly; the README and SCHEMA.md say so instead); `acta.part` is no
longer "unused". Issue #25 gets the sample's
headline numbers as a comment.

## 8. Out of scope

2003–2009 (phase 2b′, §11 — done); the ASS (2c); the remaining 93 sources (2b-ii);
releasing guard holds (needs its own curated mechanism, noted in PR #32); keywords /
`actKind` / `medium` on AAS-born records (*Nuntii radiophonici* is #27's evidence and is
counted, not applied).

## 9. Addendum (2026-09-13, after PR #33): how 2b-ii is split

The sample's parse rates — 100 % (1931), 98.2 % (1978), 91–93 % (1958, 2012) over all
lines and ≥ 98.5 % over the harvested categories, against 7.4 % (1909) and 90.2 % (1917-I)
where the OCR lost the page column — settle the order: the clean era first, the early
volumes last. Three PRs, sequential (they share the fetch script, `categories.ts`, the
curated tables and the pinned-count tests), each with its own report and its own
`Refs #25` comment:

| PR | Volumes | Popes | Notes |
|---|---|---|---|
| 2b-ii-a | 24–49 (1932–1957) | Pius XI, Pius XII | 1939 has two popes; *Nuntii radiophonici* are Pius XII's (counted for #27, never created) — **done** (PR #34) |
| 2b-ii-b | 51–69 (1959–1977) | John XXIII, Paul VI | 1963 has two popes — **done** (PR #35) |
| 2b-ii-c | 71–94 (1979–2002) and the 2010, 2011, 2013, 2014 index PDFs | John Paul II, Benedict XVI | 1983 is a double volume (`part`); the *Ibi vacabimus* reprint (2012 and 2020) needs a curated citation-of-record rule, decided here — **done**: `ACTA_REPRINTS` (the first printing is the citation unless the volume marks the later as a correction; *Deus caritas*, printed twice in AAS 106 (2014), decided the same way); AAS 75 part II is the Code of 1983 and has no index, so every 1983 reference carries part I; the 2013 index carries Francis's first year too |
| 2b-iii-a | 18–22 (1926–1930) | Pius XI | the early volumes whose OCR kept the page column (§10): parsed as the phases above |
| 2b-iii-b | 1–8, 9-I, 10–17 (1909–1925) | Pius X, Benedict XV, Pius XI | the volumes whose OCR lost the page column on 56–99 % of entries: the page recovery of §10, then the join as above; 9-II has no chronological index (the Code of 1917) and its one act, *Providentissima Mater*, takes a curated reference |

Each PR: the volumes' index pages as fixtures (README rows), per-volume parse rate with the
95 % floor and named exemptions, every new category or pope heading mapped with its
quotation, join → report → create by the 2a rule, holds listed, re-minted ids expected none.
A PR whose created count is large is not a reason to loosen anything: the report is the
review instrument, and every creation quotes its index line.

## 10. Addendum (2026-09-18, after PR #37): the early volumes and the lost page column

### 10.1 What the twenty remaining volumes measure

The sample (PR #33, report §1) found the OCR of AAS 1 (1909) and 9-I (1917) without its
page column on most index pages and deferred the decision to this phase. On 2026-09-18 the
twenty volumes of 1910–1930 were fetched (into the local store, §10.4) and their
chronological indexes parsed with the phase-2b parser, unchanged:

| Volumes | Entries opened without a page | Reading |
|---|---|---|
| AAS 1–17 (1909–1925; 17 fixtures, 9-II having no index) | 56–99 % per volume, ≈ 1,100 entries in all | the page column is lost — the rule for the era, not the exception. Two of them first looked otherwise: AAS 3 (1911) parsed to nothing because the layout mode doubled its pope heading on one line (`I. — ACTA PII PP. X. I. — ACTA PII PP. X.`, read once now), and AAS 17 (1925) was not located because the OCR reads its title as `II` / `CHRONOLOGICO ORDINE DIGESTUS` (admitted now); read, 1911 keeps the column on ten index pages of sixteen and 1925 on two of fourteen (its months in lower case: `iunii`, `dec.`) |
| AAS 18–23 (1926–1931) | 3–6 % | the column survived |

Two extraction facts settle what can and cannot recover the pages. **The numbers are
absent from the text layer itself**: pypdf's default mode, which keeps the date columns as
runs of their own, holds no run of page numbers either — only the dot leaders survive
(`Franciscanum condito . .`), so no extraction mode or fallback yields them. **The *Index
generalis actorum* at the head of each volume's indexes cannot supply them by position**: it
prints, per category, page *runs* rather than pages (`LITTERAE APOSTOLICAE, 6-9, 185-194,
294-307, …`, AAS 13 p. 571), each run holding several acts and naming none, so there is
nothing to align an entry to. A curated readings table for a thousand entries is not a
mechanism. What remains is the volume body.

### 10.2 The body carries the page

Every act opens with its incipit on its first page, every page carries its printed number
in its running header, and in these volumes the PDF page number *is* the printed page
(AAS 13: 472 of 480 numbered headers agree, offset 0; the disagreements are OCR of the
header). The citation convention is the act's first page even when that page is a
fascicle cover with no printed number — measured on AAS 23 (1931), whose chronological
index kept its pages: *Quadragesimo anno* 177, *Nova impendet* 393, *Lux veritatis* 493,
*Deus scientiarum* 241, all on covers, all cited at the cover; and the index generalis's
`34` for *Sacra propediem* (AAS 13) is the OCR's reading of the cover page 33.

Measured on the clean volume, a search of the body for each index incipit finds it on
exactly the cited page for 60 of 73 entries; 10 misses are OCR noise on the index side
(`Dioeeesis`, `Ex hae`, `Ea verla`) and 3 are wrong (an incipit quoted inside another act,
or two acts on adjacent pages). Measured on 1921's 79 lost entries in harvested categories,
an exact search constrained to the category's runs recovers 40 uniquely; the rest are
*ambiguous* — several acts sharing one incipit in one category (*Constat apprime* three
times, *Quae catholico nomini* three times), which only the act's own dating formula
separates — and *no hit*, OCR noise on one side or the other (`Placet oculog`, `Quoniam
por est`), which a fuzzy match takes a share of. The recovery of §10.3 is expected to land
well above the naive 40 of 79; what it does not recover is reported, never guessed.

### 10.3 Phase 2b-iii-b: the page recovery

A **recovery step** between the parser and the join, for the volumes of §10.1's first row:

1. **Input.** The chronological-index fixture (as today) and the volume's whole text,
   which `fetch-acta.sh` exports once per volume to the local store
   (`<store>/txt/aas-{vol}-{year}.txt`, one page per form feed, default mode) and which is
   never checked in; plus the *Index generalis actorum*'s page runs per category, parsed
   from the volume's first index page (the same export).
2. **Method**, in `tools/src/acta/recover.ts`, unit-tested on excerpts. For each entry the
   parser opened without a page: normalise the incipit as `match.ts` does and search the
   body pages *within the category's runs* (±1 page, for the runs' own OCR) for the incipit
   at the head of a paragraph; accept a **unique** hit. Where the hits are several, read
   the dating formula on the hit page and the following ones (*Datum Romae … die … mensis
   … anno …*) and accept the one whose date is the entry's; where there is no exact hit,
   retry with a bounded edit distance per word (the OCR's `e`/`c`, `o`/`a`, `t`/`l`),
   accepting a unique hit only. Anything else — none, several, a hit outside every run —
   stays without a page.
3. **Output.** A checked-in sidecar per volume, `tools/fixtures/acta/aas-{vol}-{year}.pages.json`:
   one row per recovered entry keyed as the parser keys it (date, category, incipit), with
   the page, the body line quoted, the running header quoted, and the rule that accepted
   it (`unique`, `dated`, `fuzzy`). The join reads the sidecar offline, as it reads the
   fixtures; an entry with a recovered page carries `pageSource: 'recovered'` into the
   report, and a reference created from it is cited exactly as one read from the index —
   the sidecar row *is* the evidence, as the curated tables are. A sidecar row whose entry
   the parser no longer opens is a hard error, as a stale correction is.
4. **Report.** Per volume: entries opened without a page, recovered by each rule, still
   without a page (each listed with its text), and the parse rate before and after; the
   95 % floor applies to the rate *after* recovery, and a volume below it is a finding.
   The report's held section lists the unrecovered entries under their own reason
   (`page-not-recovered`), never created and never cited.
5. **Curation.** `ACTA_PAGE_READINGS` in `curation.ts`, for the entries that matter and
   that the recovery leaves — the encyclicals and constitutions first — each row quoting
   the body's heading and dating formula as read in the PDF; consulted before the sidecar.

Out of scope for 2b-iii-b: recovering pages for entries without an incipit (1909's
descriptions, the consistory items), beyond what the curated table takes; and the
dicasteries' parts, as ever.

### 10.4 The local store

`fetch-acta.sh` keeps the PDFs in `~/development/sources/AAS/pdf` (`ACTA_SOURCES` to
point elsewhere), named as on vatican.va, and downloads a volume only when the store lacks
it (PR 2b-iii-a; measured on AAS 50: the fixture extracted from the stored PDF is
byte-identical to the committed one). The whole-volume text of §10.3 goes beside it in
`<store>/txt/`. Nothing in the store is tracked; the fixtures and sidecars in the
repository are what the parser, the recovery's consumers and the tests read.

### 10.5 Measured

Phase 2b-iii-b ran on 2026-09-21 over the seventeen volumes (the [era
report](../reports/2026-09-21-acta-volumes-1909-1925.md) §1b, whose numbers the report tool
computes from the sidecars and the parse results). Of the 1,136 entries the
indexes opened without a page, the volume bodies gave back **770** (unique 732, dated 13,
fuzzy 25) and **366** stayed without one: 205 described by the index without an incipit
(108 of them AAS 1's, whose index prints incipits only in guillemets after a genre word),
58 whose incipit opens several pages with no formula inside the act's span to settle them,
61 found on no page, 26 found outside the category's runs, 14 under a running header that
contradicts the page, and 2 -- the two letters *Communis vestra* of AAS 7 (1915), both
dated 10 November by the index -- whose one page of that date another entry of the same
category and incipit claims (`claimants`: a page goes to one claimant only, or to neither).
The rate after recovery — entries with a page over every line that
ended in a page or opened without one, the 95 % floor of §4 applying to it — is 71.8 % over
the era and 78.4 % without AAS 1, and under 95 % in every volume (the highest 1917-I at
91.2 %); each volume's reasons are in the report, the floor unchanged. 113 documents carry
a reference into the seventeen volumes (111 matched from a quoted index line, two curated),
458 documents were created from them and 537 entries are held with their
reasons. Two rules of §10.3.2 were tightened before the join ran, on the evidence of five
pages the first sidecars gave wrongly: a paragraph head is the salutation's dash or a line
start under a heading, a numeral, a salutation or the memorial formula — a word that opens a
line inside running text, or follows a full stop inside a line, opens no act — and the
formula that settles a tie is read from the hit's own line on, not from the top of its page
(the previous act's formula). The rows the earlier eras' curation tables take were written
where the era showed their shapes (nineteen index corrections from the acts' formulae,
twelve shared pages read in the volumes, five holds for an incipit the OCR misspelt); the
entries left without a page are neither created nor cited. The readings of §10.3.5 are
seventeen rows of `ACTA_PAGE_READINGS` -- every encyclical and constitution the report's
*Page not recovered* block listed, three motu proprio -- each read in the store text at the
page the act opens on with its dating formula quoted, and nine `ACTA_INDEX_CORRECTIONS`
rows keyed by those pages where the index prints the month alone, the wrong month
(*Sapienti Consilio*, `Ian. 29` for 29 June 1908; *Post datam*, the OCR's `i apr.` read as
the incipit) or a ditto of the wrong year (the two Aversa constitutions of July 1922 under
`1923`): seven shelf records cited, eleven documents created. *Providentissima Mater*
*Ecclesia* takes the one curated reference (`ACTA_CURATED_REFERENCES`, AAS 9-II (1917) 5,
applied after the join and never over a match); *Sacrae disciplinae leges* (AAS 75-II, pp.
VII–XIV, Roman-numbered) cannot, `acta.page` being an integer. Two things the readings
showed: the 1924 index heads its motu proprio `IV.?- MOTU PROPRIO` (the OCR's `?`, the one
such heading of the fixtures), which the parser now reads, so two of the three come back by
the recovery's own rule; and *Inter praecipuas* (AAS 17 (1925) 289) opens the page the index's
OCR sets on the next entry's line (*Ex Apostolico officio*, which opens at 516), so invariant
25 held both until `ACTA_PAGE_CORRECTIONS` (2026-09-21) -- a row keyed as the readings are,
naming the printed page and the act's, both read in the volume, applied before the join
matches or creates -- gave the second its page; the eight cases the phases had named for it
(PR #37, #40, #41) are its first rows. *Ubi arcano Dei consilio* is cited at
its Latin printing (AAS 14 (1922) 673) by the second curated reference: the 1922 line for the
Latin prints no date and opens no entry, and a reading is keyed to an entry, so the row names
the match it displaces (`supersedes: 'AAS:15:5'`, the Italian printing, quoted beside the
Latin with its dating formula; controller ruling 15) and the join moves that match to
`superseded` -- neither a claim nor a record, listed in the report's §5 beside the reprints.
The final review of the branch (2026-09-21) settled three readings of §10.3.2 the first
run had left implicit, each measured in the report's §1.2: a (category, incipit) group
with two or more claimants -- pageless entries and the volume's paged entries counted
together -- never takes the `unique` or `fuzzy` rule, and a page two rows of a group land
on goes to neither; the last section start of a category runs to the pope part's end; a
heading whose page list the OCR spoils (AAS 16 (1924) 507, `LITTERAE ENCYCLICAE, 5 (12)`)
constrains nothing; and the dating formula reads a roman year set right after the month
with no `anno` (`die x novembris MCMXV`, AAS 7 (1915) 569). The regeneration moved
thirteen rows -- three to `unique`, eight to `dated`, two to `claimants` -- and the join
created five more documents (four apostolic letters of AAS 13 (1921), one letter of AAS 4
(1912)), each at a page its own formula dates.

## 11. Addendum (2026-09-21): phase 2b′, the index PDFs of 2003–2009

§1 recorded 2003–2009 as **none online** and phase 2b′ as a body-heading parser over the
monthly fascicles. Measured again on 2026-09-21, the premise is wrong: the AAS index page
links an annual *Index generalis* PDF for each of the seven years (`AAS 95` … `AAS 101`),
and only the links are broken — space-encoded paths for 2004–2007
(`documents/AAS-Index%202002-2009/AAS-Index%202005.pdf`, 404) and a folder name folded
into the file name for 2003 (`documents/AAS-Index-2002-2009-AAS-Index-2003.pdf`, 404),
while the hyphenated form the 2008 and 2009 links use,
`documents/AAS-Index-2002-2009/AAS-Index-{year}.pdf`, serves all seven (200; 0.6–1.3 MB,
56–88 pages). Each carries the *Index documentorum chronologico ordine digestus* at PDF
p. 4, in the shape of 2010–2014. Phase 2b′ is therefore **seven more index sources of the
2b-ii-c kind**, not a fascicle parser; the fascicles stay unread.

### 11.1 Fetch and fixtures

`fetch-acta.sh` gains the years 2003–2009 in its index mode. The file name is read off
the index page as ever, then **normalised** to the hyphenated form (`%20` → `-`, and the
2003 name's folded folder restored), since that is the form the server resolves; the
README row records the link as printed beside the URL fetched. The PDFs go to the store
as `AAS-Index-{year}.pdf`.

The text layer of 2003–2006 drops the spaces between words in the default mode — the
pope heading is `I—ACTAIOANNISPAULIPP.II`, a category heading `I–LITTERAEENCYCLICAE`,
an entry's tail `honoresdecernuntur`, a page `4 3 3` — and 2005, 2008 and 2009 fuse the
volume heading (`An.etvol.C 31Decembris2008`); pypdf's `space_width` changes nothing
(measured at 200, 100, 50 and 20). The **layout mode keeps every space**, at the cost of
the column gaps the index PDFs do not have. The fixture for these seven is therefore the
layout-mode text with each run of two or more spaces collapsed to one and each line
trimmed (`aas-indice-{year}.txt`, one page per form feed, as the others), which the
parser reads with the index options (`columnar: false`); the README row names the
extractor as `pypdf 6.14.2, layout mode, spaces collapsed`. Measured before any parser
change, over all lines: 2003 90.5 %, 2004 84.8 %, 2005 86.8 %, 2007 91.3 %, 2008 90.4 %,
2009 90.4 % (2006 does not parse, §11.2). The 2010–2024 fixtures are not re-extracted.

### 11.2 What the seven print that the parser has not seen

Measured on the collapsed fixtures (the census in the era report):

- **The ditto marks glued.** The layout mode sets the third ditto against the opening
  guillemet (`» » »« Cum vis ut ». – Beato Humili …`), the year and month dittos against
  the day (`»»14 De universo dominico`) and the day against the text (`» » 12Ad
  Congressum`; 2006's `2005 Dec. 25Deus Caritas est`). Counted on 2026-09-21 over the
  seven committed fixtures as *lines the rule rewrites*, each rule in its place in
  `untangleIndexLine` (so the ditto-day rule's output is what the guillemet rule sees),
  the parse run as `ACTA_SOURCES` configures it:

  | Shape | 2003 | 2004 | 2005 | 2006 | 2007 | 2008 | 2009 | All |
  |---|---|---|---|---|---|---|---|---|
  | ditto glued to the guillemet | 11 | 16 | 15 | 18 | 4 | 8 | 11 | 83 |
  | dittos glued to the day | 0 | 6 | 5 | 6 | 6 | 9 | 6 | 38 |
  | day glued to the text | 0 | 0 | 0 | 2 | 8 | 0 | 1 | 11 |

  Every year prints at least one of the three; 2006 and 2009, which the first statement of
  this bullet omitted, print two each. Counted instead as *entries the parse loses when
  that one rule is disabled*, the guillemet row is identical and the other two are lower
  where a glued line still opens an entry, wrongly dated or with the day inside its text:
  ditto-day 0, 6, 5, 6, **5**, **8**, **5** and day-text 0, 0, 0, 2, **7**, 0, 1. The
  date-line reading admits a ditto with no space before the guillemet or the day, and a
  day with no space before a capital, in the index PDFs only; its blast radius is measured
  over the 2010–2024 fixtures before it is accepted (measured: 0 lines match, none). Every
  continuation line the census lists as *outside any entry* follows one of these openers.
- **2006's index has no title line and one pope part.** Its p. 4 opens `I — ACTA SUMMI
  PONTIFICIS` / `ACTA BENEDICTI XVI` / `I – LITTERAE ENCYCLICAE` and prints `INDEX
  DOCUMENTORUM / CHRONOLOGICO ORDINE DIGESTUS` nowhere in the text layer (the running
  header `Index documentorum chronologico ordine digestus 965` opens p. 5). The parser
  admits the running header, in lower case with its page, as the title where the capitals
  are absent, and reads `ACTA SUMMI PONTIFICIS` as a part whose pope is named by the
  `ACTA {pope}` sub-headings under it (`ACTA BENEDICTI XVI`, then `ACTA IOANNIS PAULI II`
  for the acts of the late pope printed in 2006), each sub-heading switching the pope as
  a pope part does. 2005 prints two pope parts in the usual way (`I — ACTA IOANNIS PAULI
  PP. II`, `II — ACTA BENEDICTI PP. XVI`).
- **Headings.** `ADHORTATIO APOSTOLICA POST-SYNODALIS` (2003, hyphenated) and `EPISTULA
  APOSTOLICA MOTU PROPRIO DATA` (2009) map as their unhyphenated and plural forms do;
  `COSTITUTIONES APOSTOLICAE` (2007) is the index's own misprint and maps to the
  constitutions with the heading quoted; `SYNODUS EPISCOPORUM` under Benedict XVI in 2005
  (`VIII – SYNODUS EPISCOPORUM`, a numbered category of the pope part, not a part) is a
  category of the pope's part where its numeral continues the part's (VIII after VII; AAS
  93 (2001) prints XV after XIV the same way) and a part where it does not (AAS 69 (1977),
  II after the pope's XII). `CONSISTORIUM` (2005) is the consistory, not
  harvested, as before.
- **The journeys.** The *Itinera apostolica* entries of 2003–2005 are dated by a range
  (`2003 Iun. 5-9 in Croatiam … 492`) and those of 2007–2008 by a sub-list under the
  heading (`V. Assisium.` / `die 17 Iunii Assisium in Italia.`, no page on the line): both
  are lines of a category the registry does not harvest, counted in the rate's denominator
  where they end in a page and listed in the report as the era's shape, never parsed into
  entries.

The 95 % floor of §4 applies per source after the ditto reading; a source below it is
explained line by line in the era report, as in every era.

### 11.3 Join, creation, report

As phase 2b-ii-c: the popes are John Paul II (2003–2005) and Benedict XVI (2005–2009),
whose shelves the registry harvests; the creation rule and the duplicate guard are the 2a
spec's; `ACTA_REPRINTS` is consulted for any act these volumes print that a later index
enters again (`Ibi vacabimus` is 2012's; none is expected from 2003–2009 and the report
says what it found). `source.url` is `null` for a document created from these sources, as
for every fascicle-era source, since the monthly fascicle holding a page is not derivable
from the index. The era report, `docs/superpowers/reports/2026-09-21-acta-volumes-2003-2009.md`,
follows the 2b-ii-c report's sections: the census of §11.2 with counts per year, the
parse rate per source before and after the ditto reading, the references and creations
per pope and class, every hold with its reason. The pinned counts in
`tools/test/harvest-data.test.ts`, `ACTA_SOURCES`, the fixtures README, SCHEMA.md's
`acta` paragraph and the README's two phase paragraphs move as in every era; §1's row
for 2003–2009 and §8's *out of scope* line are corrected to point here. The six earlier
eras' reports are regenerated with this one, as in every era (2026-09-21): five move only
by the corpus totals (John Paul II's AAS-created records 43 → 57, Benedict XVI's 69 → 134,
the registry 8,490 → 8,569), and 1979–2014 moves besides by the 2001 index's `SYNODUS
EPISCOPORUM` part, read here as a category (§11.2) rather than skipped -- twelve more lines
counted, two more entries, one more defect, 96.6 % → 95.9 % -- and by the acts of 1992, 2001
and 2002 that now carry a reference from AAS 95–101, which leave its §11 lists.

### 11.4 Out of scope

The monthly fascicles of 2003–2009 (nothing reads them); the ASS (2c, its own spec — its
volumes carry no chronological index, measured on ASS 12, 23, 33 and 41).

## 12. Addendum (2026-09-27): phase 2d, the sixteen Vatican II references

The corpus carries a reference on **6,975 of its 8,569** records, and three issuers stand at
zero. Two of them cannot be reached: Benedict XIV's 43 records predate the *Acta Sanctae
Sedis*, which begins in 1865, and Leo XIV's 40 postdate the printed *Acta Apostolicae
Sedis*. The third is **`oec:vatican-ii`, all sixteen of whose records carry no `acta` at
all** — and the ASS phase has already ruled on why they should.

Phase 2c-ii-d implemented the owner's ruling of 2026-09-26 (ass volumes spec §5): a
conciliar act printed under the pope who promulgated it *is the same document* and takes a
reference, which is why *Dei Filius* (ASS 5 (1869) 481) and *Pastor Aeternus* (ASS 6 (1870)
40) are cited on their `oec:vatican-i` records. Every Vatican II record carries
`promulgatedBy: rp:paul-vi`, the registry itself asserting what that ruling asserts, so the
same reasoning gives all sixteen an AAS reference. The AAS prints them in AAS 56–58
(1964–1966). Phase 2d writes those sixteen references, and closes
[#36](https://github.com/CatholicOS/cmddr/issues/36) and
[#56](https://github.com/CatholicOS/cmddr/issues/56) §3.

### 12.1 The part the parser skips, and what it holds

`PART_HEADING_RE` (`index.ts`) matches any part heading opening `ACTA`, so the council's
part **is** read as a part — and then `POPE_PART_RE` fails on it, `SS.` being no name word,
and it falls through to the skip the dicasteries take. Its heading is therefore recorded in
the parse result's `skippedParts`, which is where this phase's blast radius was measured
rather than guessed.

*Measured on 2026-09-26* over every non-ASS source of `ACTA_SOURCES`, tallying
`skippedParts`: **107 distinct skipped part headings, of which four are the council's** and
no more —

| Heading, as `skippedParts` records it | Sources |
|---|---|
| `ACTA PATRUM S. CONCILII OECUMENICI VATICANI II` | 1962 |
| `III - ACTA Ss. OECUMENICI CONCILII` | 1964 |
| `II - ACTA SS. OECUMENICI CONCILII` | 1965, 1966 |

The heading wraps in all four volumes (`… OECUMENICI CONCILII` / `VATICANI II`) and the
parser keeps only its first line, which is why `VATICANI II` is absent from the tally. Three
further headings of the same shape belong to the **synod of bishops**, not the council, and
are not this phase's: `II - SYNODUS EPISCOPORUM` (1977), `XIV - ACTA SYNODALIA` (1980) and
`ACTA SYNODI EPISCOPORUM` (2014, 2015, 2018 — `II. –` there — 2019, 2023, 2024).

The four conciliar parts hold **18 entries**: AAS 54 one, AAS 56 two (fixture
`aas-56-1964.txt` ll. 820–821), AAS 57 three (`aas-57-1965.txt` ll. 867–869) and AAS 58
twelve (`aas-58-1966.txt` ll. 790–802). Sixteen are the registry's sixteen documents. **Two
are not**, and stay out of the registry until it is decided whether they belong: the
Fathers' *Nuntius ad universos homines, Summo Pontifice assentiente, missus, Concilio
Oecumenico ineunte* of 20 October 1962 at AAS 54 (1962) 822, and the *Nuntii a Patribus
Oecumenicae Synodi hominibus missi e variis socialibus humanae consortionis ordinibus* of
8 December 1965 at AAS 58 (1966) 10.

Two agreements are worth recording, because they are the checks a title-matching reader
would have had to make and the curated rows make once: **every date the part prints agrees
with its record's** — 4 December 1963 (2), 21 November 1964 (3), 28 October 1965 (5), 18
November 1965 (2), 7 December 1965 (4) — and **every genre word agrees with its category**,
the part printing *Constitutio* 4 times, *Decretum* 9 and *Declaratio* 3 against the
registry's 4 constitutions, 9 decrees and 3 declarations.

### 12.2 Sixteen curated rows, and why not a reader

The references are written by **sixteen `ACTA_CURATED_REFERENCES` rows** and the pipeline is
not changed: nothing is added to `index.ts`, `match.ts` or `create.ts`.

A reader for the conciliar part was considered and rejected on the measurement above, by the
test this project applies to every rule. Its whole reach is 18 entries in 4 volumes, and
that reach **cannot grow**, the council having closed in 1965. Two rules have already been
refused here on exactly this ground: the general `promulgatedBy` rule, built and measured
over all 41 ASS volumes to a match set identical to two curated rows (ass volumes spec §5),
and `LITERAE`, which read 0 acts over the same 41 volumes. A reader would also need
machinery the corpus needs nowhere else:

- **a title axis.** The part files its acts by title and never by incipit — `Constitutio
  Dogmatica de Ecclesia`, not *Lumen Gentium* — while the matcher keys candidates by
  issuer, date and incipit throughout.
- **an undated line.** AAS 54's entry prints no date columns at all (`Nuntius ad universos
  homines, … Concilio Oecu­ / menico ineunte 822`), so no reader can date it; a curated row
  or a report line can state the date from the act.
- **a fused line.** `aas-58-1966.txt` l. 795 runs two entries onto one OCR line
  (`Constitutio dogmatica de divina Revelatione 817 » » Decretum de apostolatu laicorum
  837`), which a reader would have to split and a row quotes as printed.

What a reader would have bought — the completeness accounting the ASS summa gives — is
bought instead by the **report generator** reading the part's lines (§12.5). The accounting
lives where it is read; the matcher stays as it is.

### 12.3 The rows and their evidence

Each row is keyed by document id, carries `acta: { series: 'AAS', volume, year, page }` and
an `evidence` string, and **no row carries `supersedes`**: the join matches none of the
sixteen, so `applyCuratedReferences`'s guards — a row the join also matched, a stale
`supersedes`, a `supersedes` in a two-part volume — stay quiet, and the existing type needs
no change (`series` is already `'AAS'`-only; Vatican I's two ASS references are
`ACTA_MATCH_OVERRIDES`). `applyActa` runs on every document after each id is final
(`harvest/run.ts`), which is the same pass that writes Vatican I's two, so the sixteen land
without an ordering change.

| Document | Index line, as printed | AAS |
|---|---|---|
| `mag:vatican-ii/sacrosanctum-concilium-1963` | `1963 Dec. 4 Constitutio de Sacra Liturgia 97` | 56 (1964) 97 |
| `mag:vatican-ii/inter-mirifica-1963` | `» » » Decretum de instrumentis communicationis socialis 145` | 56 (1964) 145 |
| `mag:vatican-ii/lumen-gentium-1964` | `1964 Nov. 21 Constitutio Dogmatica de Ecclesia . 5` | 57 (1965) 5 |
| `mag:vatican-ii/orientalium-ecclesiarum-1964` | `» » » Decretum de Ecclesiis Orientalibus Catholicis 76` | 57 (1965) 76 |
| `mag:vatican-ii/unitatis-redintegratio-1964` | `» » » Decretum de Oecumenismo 90` | 57 (1965) 90 |
| `mag:vatican-ii/christus-dominus-1965` | `1965 Oct. 28 Decretum de pastorali Episcoporum munere in Ecclesia .... 673` | 58 (1966) 673 |
| `mag:vatican-ii/perfectae-caritatis-1965` | `» » » Decretum de accommodata renovatione vitae religiosae .... 702` | 58 (1966) 702 |
| `mag:vatican-ii/optatam-totius-1965` | `» » » Decretum de institutione sacerdotali 713` | 58 (1966) 713 |
| `mag:vatican-ii/gravissimum-educationis-1965` | `» » » Declaratio de educatione christiana 728` | 58 (1966) 728 |
| `mag:vatican-ii/nostra-aetate-1965` | `» » » Declaratio de Ecclesiae habitudine ad religiones non-christianas . 740` | 58 (1966) 740 |
| `mag:vatican-ii/dei-verbum-1965` | `» Nov. 18 Constitutio dogmatica de divina Revelatione 817` (l. 795, fused) | 58 (1966) 817 |
| `mag:vatican-ii/apostolicam-actuositatem-1965` | `» » Decretum de apostolatu laicorum 837` (l. 795, fused) | 58 (1966) 837 |
| `mag:vatican-ii/dignitatis-humanae-1965` | `» Dec. 7 Declaratio de libertate religiosa 929` | 58 (1966) 929 |
| `mag:vatican-ii/ad-gentes-1965` | `» » , » Decretum de activitate missionali Ecclesiae . . . . . . . 948` | 58 (1966) 948 |
| `mag:vatican-ii/presbyterorum-ordinis-1965` | `» » » Decretum de presbyterorum ministerio et vita , 991` | 58 (1966) 991 |
| `mag:vatican-ii/gaudium-et-spes-1965` | `-» » » Constitutio pastoralis de Ecclesia in mundo huius temporis . . 1025` | 58 (1966) 1025 |

**The evidence is the printed page, not the index line.** Every existing row of this table
quotes what a page prints and the act's own dating formula, read in the volume; a row
resting on an index line alone would be the weakest in the table, and phase 2c-ii-d has just
measured why that matters, finding a summa page misread by a digit and two leaves printed
out of order. So `fetch-acta.sh` fetches **AAS 56, 57 and 58** — the store held none of the
three on 2026-09-26, carrying 1909–1931, 1958, 1984, 1990 and the 2003–2009 index PDFs —
and the sixteen opening pages are read. Each row quotes its page's Latin title, the
promulgation formula, Paul VI's subscription and the dateline, beside the index line with
its fixture line number, and states whether the page the index gives is the page the act
opens on -- the printed page, located by its running header, never assumed to be the PDF's
page of the same number.

**Nothing about the fixtures changes.** The volumes are fetched in the script's text mode
(`fetch-acta.sh text 1964-1966`), which writes each volume's whole text to the store's
`txt/` and touches no fixture; the three index fixtures are **not** re-extracted, phase
2b-ii-b having written them, and `ACTA_SOURCES`'s `retrieved` dates stay as it left them,
since they record when a fixture was extracted and no fixture is. The date a page was read
is recorded where every other row records it, in the row's own `evidence`.

AAS 58 p. 10 is read in the same pass, the volume being in hand, so the *Nuntii* of 8
December 1965 is recorded from the printing. **AAS 54 is not fetched**, so the Fathers'
*Nuntius* of 20 October 1962 is recorded from its index line alone and stays unread — the
one thing in the conciliar dossier this phase leaves unverified, and it rests on no
reference.

### 12.4 What `ACTA_CURATED_REFERENCES` now means

The table's doc comment reads *"References no index entry can give"*, which after this phase
is no longer the whole truth. It becomes: a reference the **chronological index of the
popes' acts** cannot give — either because no entry exists (the Code volumes, which carry no
chronological index; *Ubi arcano Dei consilio*, whose line lost its date columns and opens
no entry) **or because the entry stands in a part the parser does not read**, `ACTA SS.
OECUMENICI CONCILII VATICANI II`. The second case names the part and carries the
measurement that refused it a reader — four parts across every source, 18 entries, filed by
title, one line undated and one pair fused — so that a later reader finds the reasoning and
not merely the decision.

### 12.5 Tests, report, documentation

`tools/test/harvest-data.test.ts` currently **asserts the hole**
(`expect(everything.filter((d) => d.issuerId === 'oec:vatican-ii' && d.acta !== undefined)).toEqual([])`,
with the comment that the parser skips the part): it inverts into an assertion of all
sixteen with their volumes and pages, and the per-year pinned counts move — 1964 by 2, 1965
by 3, 1966 by 11. `mappings.test.ts`'s standing rule, that every curated row carries a
non-empty note, already covers the sixteen; `applyCuratedReferences`'s three errors are
already tested and gain no case, no row needing `supersedes`.

The report is **generated, not written**: the standing rule is that a count stated in prose
is computed by a generator or asserted by a pin (`tools/regenerate-reports.ts`). A new
generator writes `docs/superpowers/reports/2026-09-27-acta-vatican-ii.md` and is added to
`REPORTS`; it must **not** read the volume store, so that CI's `--skip-store` run
regenerates it. It computes what it states: the `skippedParts` tally of §12.1 over every
non-ASS source; the four conciliar parts' lines, located by their heading and closed by the
next part heading, listed entry by entry with the document each names or the note that the
registry holds none; the date and genre-word agreements; the sixteen rows with their
evidence; and the corpus totals before and after. Reading those lines in the generator is
what replaces a reader in the pipeline (§12.2).

Three documents move. The README's phase 2b-ii-b paragraph states the hole as standing
("they stay under `oec:vatican-ii` with no reference, their pages listed in the report for a
curated one") and is rewritten, with a paragraph of its own for 2d as every phase has.
SCHEMA.md's `acta` paragraph enumerates how a reference is written and names **no** curated
reference at all: it gains one clause, that a reference the chronological index cannot give
is written from a curated table quoting the page, the conciliar part being its largest case.
§8 needs no correction: it never listed the conciliar part, which was recorded as a hole in
the README and in the 2b-ii-b report §1.4 and nowhere else. The generated reports are
regenerated with this one. Two
issues close, [#36](https://github.com/CatholicOS/cmddr/issues/36) and
[#56](https://github.com/CatholicOS/cmddr/issues/56) §3, leaving #56 its §2 alone; **a new
issue** carries the registry question the two messages raise — whether the Fathers' *Nuntius*
of 20 October 1962 and the *Nuntii* of 8 December 1965 belong in the registry, and under
what issuer, neither being one of the sixteen.

### 12.6 Out of scope

A reader for the conciliar part (§12.2, refused on the measurement); the synod of bishops' parts --
three headings over eight sources (§12.1) -- a different body whose acts wait on [#4](https://github.com/CatholicOS/cmddr/issues/4);
AAS 54, hence the Fathers' *Nuntius* as a printing; creating a record for either message
(the new issue decides whether the registry wants one); and the 1,578 records that still
carry no reference after this phase, whose largest holds are John Paul II's 682, the ASS
reverse gap of 2c-iii, and the two issuers no gazette can reach.
