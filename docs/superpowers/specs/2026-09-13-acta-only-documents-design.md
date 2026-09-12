# AAS-only documents, 2015–2024 (phase 2a of the *Acta* programme)

Phase 1 of [#25](https://github.com/CatholicOS/cmddr/issues/25) (PR #29) joined the *Acta
Apostolicae Sedis* index to the registry and found that the vatican.va shelves are
selections even in the current pontificate: over 2015–2024 the index names 117 apostolic
constitutions and 206 apostolic letters where the Francis `apost_constitutions` and
`apost_letters` shelves carry 49 and 59. This phase registers the acts the *Acta* have and
the shelves lack, from the fixtures already checked in, and settles the record shape and the
duplicate guard that phases 2b (AAS 1909–2014) and 2c (ASS 1865–1908) reuse.

## 1. The programme, so the phases are findable from one place

| Phase | Source | Index shape (measured 2026-09-12/13) | Mode |
|---|---|---|---|
| 1 (done) | AAS annual index PDFs 2015–2024 | *Index documentorum chronologico ordine digestus*: pope → category → date · incipit · description · page | parse, join, report |
| **2a (this)** | the same fixtures | — | create AAS-only documents for the gaps |
| 2b | AAS volumes 1909–2014 (116 PDFs, 2–6 MB) | the same index at each volume's tail, from vol. 1 (1909); OCR workable (1931 runs entries together; 1958 clean, toponym and incipit) | extract index pages → parse → join → report → create; five sample volumes first |
| 2c | ASS 1904–1908 (vols 37–41) | *Index analyticus — Acta Romani Pontificis*: category + description + page, **no date or incipit** | parse index, read the cited page's heading, confirm by hand |
| 2c | ASS 1865–1903 (vols 1–36) | subject index only; papal acts among decrees and Rota cases under OCR-noisy caps headings; earlier acts reprinted as appendices (*Quo graviora*, Leo XII, 1825, vol. 1 p. 301) | candidate scan of caps headings, each confirmed by hand; reprints registered under their own issuers (`rp:leo-xii`, `rp:pius-vii`, `rp:pius-viii`, `rp:gregory-xvi` exist in CRPDR) |

Decisions taken by the owner on 2026-09-13: this order; AAS-only documents are created
**only in categories whose vatican.va shelf has been harvested for that pope**, so that the
*letters*, *speeches*, *homilies* and *pont-messages* shelves — fuller than AAS, and carrying
URLs and vernacular titles — are harvested first and AAS fills their residue afterwards; the
ASS private era is scan-and-confirm, with reprints registered under their issuers.

## 2. What is created

An entry of the chronological index becomes a document when **all** of the following hold:

1. Its category maps (`categories.ts`) to a genre class with `harvested: 'yes'` — today
   *Litterae Encyclicae*, *Adhortationes Apostolicae*, *Constitutiones Apostolicae*,
   *Litterae Apostolicae Motu proprio datae*, *Litterae Apostolicae*, and *Bullae* /
   *Litterae Decretales* / *sub plumbo* only insofar as the pope's `bulls` shelf is harvested
   (it is for Francis: `harvested: 'yes'` for the bull class, with the decretals' own
   `partly` reviewed and decided by the implementer with a measured count — the 63
   canonisation decretals are a real class of act the registry has a row for).
2. Its pope's shelves for that class are harvested (`pontiffs.ts`): Francis and Benedict
   XVI in these fixtures; an entry for a pope whose shelf is not harvested is held.
3. The join (PR #29) produced **no match**, and the entry is **not ambiguous**.
4. The **duplicate guard** finds nothing (§3).
5. The entry has a resolvable date (after the curated index corrections of §5).

Everything else is **held**, with a reason, in the report. Nothing is created that the rules
cannot evidence.

## 3. The duplicate guard

A false negative in the join must not become a second record of an act the shelf already
holds. Before creation, the guard looks for any existing document of the same pope:

- on the **same date**, whose `incipit` slug equals the entry's, or whose `title` contains
  the entry's incipit (case- and accent-insensitive) — **held: class mismatch** (the
  discussion [#30](https://github.com/CatholicOS/cmddr/discussions/30) case: shelf and
  *Acta* disagree about the class; the committee decides, the harvest does not);
- on the same date, in the same class, that carries **no incipit** (a provisional shelf
  record) — **held: possible identity** (the Tarragona shape, [#31](https://github.com/CatholicOS/cmddr/issues/31));
- within **±1 day**, in the same class, with the same incipit slug — **held: near-miss**
  (needs the act's own dating formula and a `DATE_CORRECTIONS` row, never a guess);
- **anywhere in the pontificate** with the same incipit slug and the same class —
  **held: same incipit elsewhere** (two acts can share an incipit, but the shelf harvest
  has shown the index and the shelf sometimes disagree on a date by more than a day, and
  a human decides which).

Each hold is a row of the report with the entry's `raw` text and the candidate's id.

## 4. The record

```json
{
  "id": "mag:francis-i/ius-nativum-2023",
  "title": "Ius nativum. De patrimonio Sedis Apostolicae",
  "idStatus": "minted",
  "genre": "apostolic-letter",
  "characteristics": ["motu-proprio"],
  "issuerId": "rp:francis-i",
  "issuerType": "pope",
  "date": "2023-02-20",
  "incipit": "Ius nativum",
  "sourceGenreLabel": "Litterae Apostolicae Motu proprio datae",
  "source": { "url": null, "shelf": "aas/2023", "retrieved": "2026-09-12" },
  "acta": { "series": "AAS", "volume": 115, "year": 2023, "page": 263 }
}
```

- **id**: minted from the *Acta* incipit by the existing rule (`mag:{issuer}/{slug}-{year}`,
  year of `date`, full-date form on collision). An entry with no incipit — a constitution
  the index names by toponym only — takes the provisional form
  `mag:{issuer}/{genre-slug}-{date}[-n]` exactly as a shelf record without an incipit does;
  the toponym goes into the title. `series`-form ids never arise here (§2.1: no series
  category is created from AAS).
- **title**: the index entry as printed after the date — incipit, full stop, description —
  the *Acta*'s own naming, as a shelf record's title is the shelf's own heading. For a
  toponym entry: `Vucarien.: In Nigeria, dismembrato territorio …`, toponym case as
  printed, OCR mixed case repaired only by the small-caps rule the parser already applies.
- **incipit**: the incipit as the index prints it, guillemets stripped. No `incipitLang`.
  *(Corrected in PR #32: this bullet first read a bare incipit as Latin, `la`, and a
  guillemet incipit as vernacular with its language unevidenced. Measured on the fixtures,
  the index's guillemets mark a quotation, not a vernacular — « Venite benedicti »,
  « Nolite sperare », the beatification letters' Latin incipits, are wrapped exactly as
  « Chi è fedele » is; 190 of the 191 minted AAS-only records would have carried no
  language and one `la`. And the shelf harvest sets `incipitLang` on none of its 4,663
  minted records, so an AAS-born record setting it would be the field's only source in
  the registry. The field is therefore omitted on every AAS-born record.)*
- **sourceGenreLabel**: the category heading as printed, in the index's own case.
- **source**: `shelf: "aas/{volume-year}"`; `url` is the whole-volume PDF for years that
  have one (`…/AAS-{vol}-{year}-ocr.pdf`, ≤ 2002 — none in this phase) and **`null`** for
  the fascicle era, since which monthly fascicle holds a given page is not derivable from
  the index; `retrieved` is the fixture's retrieval date. `languages` omitted.
- **acta**: as phase 1.
- No `keywords`, `actKind`, `series`, `medium`: none is evidenced by an index line. The
  circumscription keywords are read from headings and curated tables that do not cover
  these records; a constitution created from AAS is therefore *not* `actKind: governance`
  until a keyword row evidences it — the report counts how many AAS-born constitutions
  the index describes with *conditur* / *erigitur* / *dismembrato* so that the
  circumscription tables can be extended in their own PR.

Every existing invariant applies unchanged (id form and slug round-trip, year matches date,
issuer namespace, genre reference, issuer type, characteristics allowed, invariant 25).

## 5. Curated tables

`tools/src/acta/curation.ts`, in the style of `series-curation.ts`, each row quoting the
index line:

- `ACTA_INDEX_CORRECTIONS` — an index misprint corrected with the evidence quoted from the
  act itself: the three phase-1 cases (*De concordia inter Codices*, printed `2016 Mart.
  31` for 31 May; *Vultum Dei quaerere* and *Episcopalis communio*, entered under the wrong
  month by a ditto mark). The matcher and the creator both read it, so those three match
  their shelf records instead of being held or created.
- `ACTA_HOLDS` — entries the owner has decided are not to be created regardless of the
  rules (empty until needed; the discussion #30 acts are held by rule, not by row).

## 6. Pipeline

- `tools/src/acta/create.ts`: entries → candidate records, applying §2–§5, returning
  `{ created, held }`. Deterministic; unit-tested on excerpts for every rule and every hold.
- `tools/src/harvest/run.ts`: after the join, append the created records to the pope's
  file in the same ordering the file already uses (by date, then id), so the file stays
  byte-deterministic and the CI drift check holds.
- `tools/acta-report.ts`: a new section *Created from the Acta* (per year and category,
  with the index line under each) and *Held* (per reason), and the headline table gains
  both columns; regenerate `docs/superpowers/reports/2026-09-12-acta-join-2015-2024.md`.
- Ordinal densification (invariant 20) and collision handling (invariant 11) run over the
  merged set, so a created provisional record and a shelf provisional record on one date
  get dense ordinals together — the report lists any shelf id that changes as a result.

## 7. Measure before merging

Created per year and category; held per reason (listed); constitutions described as
erections/elevations/unions (counted); shelf ids re-minted by densification (listed —
expected none, and a non-empty list is a finding); total documents before/after; per-pope
counts before/after. The `motu-proprio` characteristic count and the class-mismatch holds
are cross-checked against discussion #30's list of twelve.

## 8. Documentation

- SCHEMA.md: `source.shelf` gains the `aas/{year}` form and `url: null` for the fascicle
  era; the *Identifier minting* section says an *Acta* incipit mints exactly as a shelf
  incipit does; a sentence in the `acta` vocabulary line that the reference is also, for
  these records, the source.
- README: the *Acta Apostolicae Sedis reference* subsection gains a paragraph on AAS as a
  second source, the creation rule and the duplicate guard, and the measured numbers; the
  *chancery shelves* note gains the finding that the shelves are selections even for the
  current pontificate, with the 117/49 and 206/59 figures.
- The by-issuer and by-genre views already show the AAS column; the implementer decides
  whether a created record needs any visible mark (its `source.shelf` is the evidence) and
  says so.
- Issue #25: a comment with the measured numbers; the issue stays open for 2b and 2c.

## 9. Out of scope

Phases 2b and 2c; any category whose shelf is not harvested for the pope; fascicle-level
URLs; `actKind`/keywords for AAS-born constitutions (own PR, from the counted evidence);
the discussion #30 acts (held); the Tarragona letters (#31).
