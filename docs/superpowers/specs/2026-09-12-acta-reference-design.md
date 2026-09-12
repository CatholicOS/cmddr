# The AAS reference: joining the *Acta Apostolicae Sedis* index to the registry (phase 1)

Implements phase 1 of [#25](https://github.com/CatholicOS/cmddr/issues/25): an optional
`document.acta` reference, populated for 2015–2024 from the annual *Index generalis* PDFs of
the *Acta Apostolicae Sedis*, with a gap report in both directions. Phase 2 — the in-volume
indexes of 1909–2014, and AAS-only documents for acts the vatican.va shelves lack — is a
separate spec, written once this phase's gap report and an OCR-quality sample exist. The
*Acta Sanctae Sedis* (1865–1908) are out of scope for both phases: their volumes end in a
subject index, not a chronological documents index (measured on ASS 23, 1890–91).

## 1. Decisions already taken

- `acta: { series, volume, year, page }`, with `page` the **first page** as the index cites
  it — the conventional short citation (*AAS 87 (1995) 401*). No range.
- Fixtures are the **extracted text** of each index, one file per year, not the PDFs.
- The join is reported before it is trusted: unmatched rows on either side are findings,
  classified, not noise (the owner's rule: measure the blast radius, curate by hand).
- AAS is a **reference joined to** the shelf harvest, not a substitute for it. In the
  Francis era it is a selection (2023: 39 *Nuntii* against ~66 messages on the shelves),
  and everything it carries is also on a vatican.va shelf, harvested or not yet.

## 2. Evidence

### 2.1 What is on vatican.va

[`/archive/aas/index_it.htm`](https://www.vatican.va/archive/aas/index_it.htm) links a
whole-volume OCR PDF per year 1909–2002 (`documents/AAS-87-1995-ocr.pdf`; 1917 and 1983 are
two volumes), monthly fascicles from 2003 (`documents/2023/acta-gennaio2023.pdf`), and a
separate annual index PDF for 2015–2024 (`documents/2023/aas-indice2023.pdf`, ~1 MB, 88
pages). The index PDFs carry a text layer that `pypdf` extracts cleanly; a whole volume is
2–6 MB (AAS 87: 1,233 pages) and carries the same index at its end (pp. 1175–1200 in 1995).

### 2.2 The chronological index

Each annual index has an *Index documentorum chronologico ordine digestus*, split by pope
(*I – Acta Francisci Pp.*) and then by category in a fixed order, each entry carrying a
date (with `»` ditto marks for a repeated year or month), the incipit or a toponym, a Latin
description, dot leaders, and the first page:

```
IV – LITTERAE APOSTOLICAE MOTU PROPRIO DATAE
  5 Dec. 2022 « Chi è fedele ». De personis iuridicis instrumentalibus Curiae Romanae . . 1
20 Feb. 2023 Ius nativum. De patrimonio Sedis Apostolicae   .  .  .  .  .  .  263
20 Mar. » Vocare peccatores. Quibus nonnulli canones … immutantur   .  .  383
V – CONSTITUTIONES APOSTOLICAE
14 Dec. 2022 VuCArien.: In Nigeria, dismembrato territorio dioecesis Ialingoënsis,
             dioecesis Vucariensis conditur   .  .  .  .  .  .  .  265
  6 Ian. 2023 In Ecclesiarum Communione, de administratione Vicariatus Urbis . . 7
XII – NUNTII
XIII – NUNTII TELEVISIFICI
```

Facts the parser must honour:

- An entry may span several lines; the page number ends it. A running header (*1468 Acta
  Apostolicæ Sedis – Commentarium Officiale*) can interrupt an entry.
- The **date** is the act's date, which can precede the volume year (a December 2022 act
  in the 2023 volume). Ditto marks inherit day/month/year from the previous entry.
- The **incipit** is printed either in guillemets (*« Chi è fedele »*, vernacular) or bare
  (*Ius nativum*, Latin), followed by a full stop. Apostolic constitutions erecting sees
  print a **toponym** in small caps instead (*Vucarien.:*), which OCR renders in mixed case.
- Categories in 2023, in order: *Consistoria · Adhortationes Apostolicae · Litterae
  Decretales · Litterae Apostolicae Motu proprio datae · Constitutiones Apostolicae ·
  Litterae Apostolicae · Epistulae · Chirographa · Decreta · Homiliae · Allocutiones ·
  Nuntii · Nuntii televisifici · Conventiones · … · Secretaria Status*. Other years may add
  *Litterae Encyclicae* and *Bullae*; the parser takes the category from the heading text,
  not from a fixed list, and reports any heading it has never seen.

### 2.3 What the categories correspond to

| AAS category | Registry | Harvested today? |
|---|---|---|
| Litterae Encyclicae | `encyclical` | yes |
| Adhortationes Apostolicae | `apostolic-exhortation` | yes |
| Constitutiones Apostolicae | `papal-bull` + `apostolic-constitution` | yes |
| Litterae Apostolicae Motu proprio datae | `apostolic-letter` + `motu-proprio` | yes |
| Litterae Apostolicae | `apostolic-letter` | yes |
| Litterae Decretales, Bullae | `papal-bull` (canonizations) | partly (bulls shelf) |
| Epistulae | `letter` | not for Francis (*letters* is out of scope) |
| Chirographa | — (no row; #4) | no |
| Decreta | — (papal decrees have no row) | no |
| Homiliae | `homily` | no |
| Allocutiones | `discourse-address` | no (*speeches* out of scope) |
| Nuntii | `message` | series only (PR #26); *pont-messages* not yet |
| Nuntii televisifici | `message` + `medium: video` (#27) | as above |
| Consistoria, Conventiones, Secretaria Status | — | no |

## 3. The `acta` field

```json
"acta": { "series": "AAS", "volume": 115, "year": 2023, "page": 1041 }
```

- `series` ∈ `AAS` · `ASS`. `volume` integer (AAS volume = year − 1908; the index prints it,
  *Vol. CXV*, and the parser reads it rather than computing it). `year` the volume year.
  `page` integer ≥ 1. All four required when the object is present. `additionalProperties:
  false`; an optional `part` (`"I"`/`"II"`) is reserved for the 1917 and 1983 double volumes
  and is not used in this phase.
- Purely bibliographic: **no bearing on register, ceiling or assent**; documented beside
  `keywords`, `series` and `actKind` as never authority-bearing. The only invariant is
  well-formedness (schema) plus **invariant 25: uniqueness** — no two documents share
  `(series, volume, page)`, since one page opens one act.
- The volume or fascicle PDF URL is derivable and is not stored.

## 4. Pipeline

### 4.1 Fetch and extract

`tools/fetch-acta.sh` (or a `.ts` script — the implementer's call, see §4.5) downloads
`documents/{year}/aas-indice{year}.pdf` for 2015–2024 to the scratch directory and writes the
extracted text to `tools/fixtures/acta/aas-indice-{year}.txt`, one page per form-feed. The
text fixtures are checked in; the PDFs are not. The extractor is chosen by comparing
`pdfjs-dist` (Node, no new toolchain) against `pypdf` (Python, already known to work) on
2023: whichever keeps entries on their own lines and the dot-leader/page structure intact.
The choice and the comparison are recorded in the fixture directory's README.

### 4.2 Parse

`tools/src/acta/index.ts` parses one fixture into rows:

```ts
interface ActaEntry {
  series: 'AAS'; volume: number; year: number; page: number;
  pope: string;               // 'Franciscus' as the index heads it
  category: string;           // heading text, normalised case
  date: string;               // ISO, after ditto resolution
  incipit: string | null;     // text before the first full stop, guillemets stripped
  toponym: string | null;     // the small-caps toponym of a constitution, when present
  description: string;        // the rest of the entry
  raw: string;                // the entry as extracted, for the report
}
```

Only the *Acta Summi Pontificis* part of the chronological index is parsed in this phase;
the dicasterial and *Diarium* parts are skipped and their presence noted. A category heading
the parser has not seen before is reported, not dropped. Parsing is deterministic and
tested on excerpts covering every shape in §2.2.

### 4.3 Match

For each entry whose category maps to a harvested genre (§2.3), candidates are the
documents with the same `issuerId` (the index's pope) and the same `date`. Then:

1. one candidate with the matching genre class → **match**;
2. several → discriminate by `slugify(incipit)` equality (guillemets and trailing
   punctuation stripped; the registry's incipit as printed by vatican.va), then by the
   toponym against the document's title for constitutions; still ambiguous → **ambiguous**,
   reported with all candidates;
3. none on that date → try `date ± 1 day` **only to report** a near-miss; never to match.

Matching never writes a record it cannot evidence: every match carries the AAS entry's
`raw` text into the report beside the document id, so the join can be audited line by line.
`acta` is written on matched documents by the harvest (the entries are a checked-in input
like every other fixture), so `npm run harvest` remains byte-deterministic and the CI drift
check keeps holding.

### 4.4 Report (the deliverable that decides phase 2)

Per year and per category: entries parsed; matched; ambiguous (listed); unmatched entries
in a **harvested** category (listed in full — each is a candidate gap in the shelf harvest,
or a parser or matcher defect, and the report says which it believes); unmatched entries in
a **non-harvested** category (counted per category — the material for the *letters*,
*speeches*, *homilies* and *pont-messages* harvests); harvested documents of the pope with
no AAS entry (counted per genre; listed for the formal genres, since an encyclical or
constitution absent from AAS would be surprising). The report goes in the PR body and in
`docs/superpowers/reports/2026-09-12-acta-join-2015-2024.md`.

### 4.5 Where things live

- `tools/fixtures/acta/` — the ten text fixtures and a README recording retrieval date,
  extractor and the comparison.
- `tools/src/acta/` — `index.ts` (parser), `match.ts` (matcher), `categories.ts` (the
  category → genre table of §2.3 with a comment per row).
- `tools/src/harvest/run.ts` — after documents are built, apply the join; write `acta`.
- `tools/src/validate/invariants.ts` — invariant 25.
- Tests: parser excerpts (every shape in §2.2, ditto resolution, a header interrupting an
  entry, a guillemet incipit, a bare Latin incipit, a toponym); matcher (unique, ambiguous,
  none, near-miss reported not matched); schema; invariant 25; data-level assertions
  pinning the matched count per year so a silent drop fails loudly.

## 5. Documentation

- `SCHEMA.md`: `acta` in the controlled vocabularies with the never-authority-bearing
  wording and the citation form; invariant 25; a note that the reference joins the shelf
  harvest and does not replace it.
- `README.md`: a short subsection *The Acta Apostolicae Sedis reference* after *Numbered
  annual series*: what AAS is, the citation, the coverage (2015–2024 in this phase), and the
  phase-2 direction; the *chancery shelves* note gains the sentence that AAS, unlike the
  shelves, is the promulgating instrument.
- The renderer: an *AAS* column on the by-issuer and by-genre tables is likely worth it
  (`AAS 115 (2023) 1041`) — the implementer decides and says so.
- Issue #25 gets the report's headline numbers as a comment; the issue stays open for
  phase 2.

## 6. Out of scope

Phase 2 (in-volume indexes 1909–2014, AAS-only documents, the ASS), any harvesting of
documents from AAS, page ranges, dicasterial acts, and the `part` field's use.
