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
| 2b-ii-a | 24–49 (1932–1957) | Pius XI, Pius XII | 1939 has two popes; *Nuntii radiophonici* are Pius XII's (counted for #27, never created) |
| 2b-ii-b | 51–69 (1959–1977) | John XXIII, Paul VI | 1963 has two popes |
| 2b-ii-c | 71–94 (1979–2002) and the 2010, 2011, 2013, 2014 index PDFs | John Paul II, Benedict XVI | 1983 is a double volume (`part`); the *Ibi vacabimus* reprint (2012 and 2020) needs a curated citation-of-record rule, decided here |
| 2b-iii | 2–23 (1910–1931), and 9-II if it has an index | Pius X, Benedict XV, Pius XI | after deciding how to recover the lost page column: a positional join against the *Index generalis rerum*, or a curated readings table |

Each PR: the volumes' index pages as fixtures (README rows), per-volume parse rate with the
95 % floor and named exemptions, every new category or pope heading mapped with its
quotation, join → report → create by the 2a rule, holds listed, re-minted ids expected none.
A PR whose created count is large is not a reason to loosen anything: the report is the
review instrument, and every creation quotes its index line.
