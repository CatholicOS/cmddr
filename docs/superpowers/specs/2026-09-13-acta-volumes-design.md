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
| 2003–2009 | twelve born-digital monthly fascicles per year, no index file; the December fascicle carries no index (2005: 48 pages, none) | **none online** | **out of scope** — needs a body-heading parser over the fascicles (pope heading → category heading → title → *Datum Romae … die … mensis … anno …*); recorded as phase 2b′ |
| 2010–2014 | monthly fascicles plus an annual index PDF (`AAS-INDICE2010.pdf`, `AAS-indice2012.pdf` — case varies) | as 2015–2024 | as phase 1 |

So phase 2b's corpus is **99 index sources**: 94 volume-tail indexes (96 files, counting
the two double volumes) and 5 index PDFs.

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
await a fascicle parser); `acta.part` is no longer "unused". Issue #25 gets the sample's
headline numbers as a comment.

## 8. Out of scope

2003–2009 (phase 2b′, fascicle bodies); the ASS (2c); the remaining 93 sources (2b-ii);
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
report](../reports/2026-09-21-acta-volumes-1909-1925.md) §1b). Of the 1,136 entries the
indexes opened without a page, the volume bodies gave back **759** (unique 729, dated 5,
fuzzy 25) and **377** stayed without one: 205 described by the index without an incipit
(108 of them AAS 1's, whose index prints incipits only in guillemets after a genre word),
66 whose incipit opens several pages with no formula inside the act's span to settle them,
61 found on no page, 32 found outside the category's runs, 13 under a running header that
contradicts the page. The rate after recovery — entries with a page over every line that
ended in a page or opened without one, the 95 % floor of §4 applying to it — is 70.0 % over
the era and 76.5 % without AAS 1, and under 95 % in every volume (the highest 1917-I at
91.2 %); each volume's reasons are in the report, the floor unchanged. The join wrote 105
references and created 442 documents from the seventeen; 532 entries are held with their
reasons. Two rules of §10.3.2 were tightened before the join ran, on the evidence of five
pages the first sidecars gave wrongly: a paragraph head is the salutation's dash or a line
start under a heading, a numeral, a salutation or the memorial formula — a word that opens a
line inside running text, or follows a full stop inside a line, opens no act — and the
formula that settles a tie is read from the hit's own line on, not from the top of its page
(the previous act's formula). The rows the earlier eras' curation tables take were written
where the era showed their shapes (nineteen index corrections from the acts' formulae,
twelve shared pages read in the volumes, five holds for an incipit the OCR misspelt); the
entries left without a page are neither created nor cited, and the readings of §10.3.5 are
the next task's.
