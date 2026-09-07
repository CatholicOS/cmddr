# Document Registry: Expansion to the Full Modern Archive

*Design spec — 2026-09-07*

## 1. Purpose

The identifier scheme of `2026-09-07-document-registry-identifiers-design.md` (hereafter **the
pilot spec**) has been proved against three pontificates and one council — 383 documents. That
spec deliberately left scaling out of scope "until the scheme has been proved against them."

It has been. This spec defines the expansion to the remaining eleven pontificates on vatican.va,
and the three things that expansion breaks:

1. a **third page shape** — year-partitioned shelves;
2. **headings that are no longer bare incipits**, which the pilot's parser would slugify whole;
3. a **registry file** that is already inconvenient at 383 rows and unusable at ~2,800.

Scope is the **formal document shelves** only — encyclicals, bulls, briefs, apostolic
constitutions, apostolic letters, apostolic exhortations, motu proprio, and (conditionally, §2.6)
letters. The occasional-act shelves — speeches, homilies, audiences, angelus, messages, prayers,
travels, *cotidie* — are out of scope and are the subject of §9.

## 2. Evidence base

All findings below were verified against live vatican.va pages on 2026-09-07.

### 2.1 The archive is twelve pontificates plus two special pages

`https://www.vatican.va/holy_father/index.htm` lists twelve pope pages: `leo-xiii`, `pius-x`,
`benedict-xv`, `pius-xi`, `pius-xii`, `john-xxiii`, `paul-vi`, `john-paul-i`, `john-paul-ii`,
`benedict-xvi`, `francesco`, `leo-xiv`. The two flat-era pages already harvested —
`benedictus-xiv` and `pius-ix` — are reachable directly but not listed there.

Leo XIII is already in the registry. The eleven remaining are this spec's subject.

Note the slug irregularity the pilot spec's §5.2 mapping already anticipates: Francis is
`francesco`, not `francis`, and his CRPDR id is `rp:francis-i`.

### 2.2 A shelf index is one of two things

The pilot spec's §5.1 assumed a shelf index always carries its items. From Benedict XV onward,
about half do not:

```
pius-x/it/encyclicals.index.html         16 × div.item,  0 year links
pius-xii/it/speeches.index.html           0 × div.item, 20 year links → speeches/1939.index.html …
john-paul-ii/it/audiences.index.html      0 × div.item, 28 year links
```

A page with year links renders `speeches/1939.index.html` etc., and **those year pages use the
same `div.item` / `<h2>{heading} ({date})</h2>` markup the pilot's `parseShelfIndex` already
reads**. Verified against `pius-xii/it/speeches/1939` (63 items),
`john-paul-ii/it/apost_letters/1994` (47 items) and `john-xxiii/it/apost_constitutions/1962`
(1 item).

This is therefore **not a new parser**. It is a new *page-resolution* step in front of the
existing one.

### 2.3 An aggregate index that has items has *all* of them

Where an aggregate index carries `div.item` at all, it carries the shelf's full contents — the
year links are an additional navigation affordance, not a paging mechanism. Confirmed against
externally known totals:

| Shelf | Aggregate count | Known total |
|---|---|---|
| Benedict XV encyclicals | 12 | 12 |
| Pius XII encyclicals | 41 | 41 |
| John Paul II encyclicals | 14 | 14 |
| Benedict XVI encyclicals | 3 | 3 |
| Francis encyclicals | 4 | 4 |

So the resolution rule is: **if the aggregate index has items, use it and do not traverse years;
otherwise traverse every year page.** No shelf needs both.

### 2.4 The full formal-shelf inventory

Counts are `div.item` on the aggregate index; **0** means the shelf is year-partitioned and must
be traversed. `–` means the shelf does not exist for that pope.

| Pope | enc | bulls | briefs | ap.const | ap.lett | ap.exh | m.p. | letters |
|---|---|---|---|---|---|---|---|---|
| Pius X | 16 | – | – | 8 | 54 | 1 | 38 | 189 |
| Benedict XV | 12 | 4 | 9 | 5 | 24 | 3 | 11 | **0** |
| Pius XI | 30 | 2 | 1 | 11 | 70 | – | 14 | 33 |
| Pius XII | 41 | 1 | 2 | 49 | 47 | 8 | 11 | 95 |
| John XXIII | 8 | – | – | **0** | **0** | 3 | 14 | **0** |
| Paul VI | 7 | – | – | 354 | 270 | 12 | 49 | **0** |
| John Paul I | – | – | – | – | 3 | – | – | 4 |
| John Paul II | 14 | 2 | – | 613 | **0** | 15 | 31 | **0** |
| Benedict XVI | 3 | – | – | 126 | 68 | 4 | 13 | **0** |
| Francis | 4 | 2 | – | 49 | 114 | 7 | 77 | **0** |
| Leo XIV | 1 | – | – | 7 | 10 | 1 | 8 | **0** |

Three formal shelves require year traversal: John XXIII `apost_constitutions` (6 years),
John XXIII `apost_letters` (6), John Paul II `apost_letters` (28). Roughly 40 year pages.

Two observations that matter for expectations, not for the design:

- Paul VI's 354 and John Paul II's 613 apostolic constitutions are overwhelmingly **diocese
  erections**, titled by Latin place-name (`Avkaënsis`, `Usbekistaniae`, `Gambomensis`). They are
  genuine documents of that genre and are harvested as such, but they are ~1,100 of the ~2,800 and
  will dominate any per-genre view.
- Benedict XV's `letters` shelf, and every `letters` shelf from Paul VI on, is year-partitioned and
  therefore excluded by §2.6.

### 2.5 Shelf names are not uniform

- Benedict XV spells it **`apost-constitutions`** (hyphen); every other pope uses
  `apost_constitutions` (underscore).
- `apost_exhortations` is new since Leo XIII and has no row in `SOURCE_GENRE_TO_GENRE`.
- Every pope page also links `biography` (or `biografia`, Paul VI and John Paul II) and John Paul
  II links `books` and `jubilee`; Benedict XVI links `elezione`. **None of these are document
  shelves** and none may be harvested by pattern.

This is why the global `SHELVES` constant cannot survive: shelf membership is a per-pope fact and
must be curated, not inferred from the page's links.

### 2.6 Headings stop being bare incipits at Pius XI

Leo XIII and Pius X print the incipit alone:

```
Quanta semper cura (16 gennaio 1914)                                  Pius X, motu_proprio
Iucunda equidem (20 gennaio 1914)                                     Pius X, letters
```

From Pius XI onward the heading is *genre phrase + incipit + descriptive gloss*, in varying order,
and some carry no incipit at all:

```
Motu proprio In multis solaciis con il quale conferisce il nome di «Po…       Pius XI
Quod nobis in condendo, che attribuisce al Pontificio Istituto il pote…       Benedict XV
Lettera Apostolica in forma di «Motu Proprio» La vera bellezza sulla r…       Francis
"Incomparabilis Magister". Il Santo Padre ha eretto la Provincia Eccle…       Francis
Lettera Apostolica (breve) che proclama Santa Chiara Patrona Celeste d…       Pius XII — no incipit
Lettera a S. E. Monsignor Luigi Agostino Marmottin, in occasione della…       Pius XII — no incipit
```

`parseShelfIndex` currently takes everything before the last `(` as the incipit, which would mint
`mag:francis-i/lettera-apostolica-in-forma-di-motu-proprio-la-vera-bellezza-sulla-riforma-…-2025`:
long, meaningless, and unstable against any rewording of the gloss.

The pilot spec's §2.3 finding — *every* pilot document has an incipit — is true of the pilot corpus
and false of this one. §4 replaces it.

### 2.7 Scope decisions taken from this evidence

| Shelf | Decision | Reason |
|---|---|---|
| encyclicals, bulls, briefs, apost_constitutions, apost-constitutions, apost_letters, apost_exhortations, motu_proprio | **In**, all eleven popes | Formal documents; incipit-bearing or recoverable per §4 |
| letters | **In where the aggregate index carries items** — Pius X, Pius XI, Pius XII, John Paul I | Pius X's 189 print genuine incipits. Where the shelf is year-partitioned (Benedict XV, Paul VI onward) it is dominated by nuncio and anniversary letters that carry no incipit, and is deferred with the occasional acts |
| speeches | **Out** for the new popes; Leo XIII keeps its existing rows | Leo XIII's are genuine Latin allocutions. From Pius XI on they are descriptive titles of occasional acts |
| homilies, audiences, angelus, messages, prayers, travels, cotidie, books, jubilee | **Out** | Occasional acts; §9 |
| biography, biografia, elezione | **Out** | Not document shelves |

The `letters` coverage is deliberately partial and must be **recorded as partial** (§6.3), not left
to be mistaken for completeness.

## 3. Source model

### 3.1 The `POPES` table replaces `PILOT_POPES` and `SHELVES`

`tools/src/mappings/pontiffs.ts` gains one curated row per pope, carrying its own shelf list:

```ts
export const POPES = [
  { pageSlug: 'benedictus-xiv', issuerId: 'rp:benedict-xiv', era: 'flat',  shelves: [] },
  { pageSlug: 'pius-ix',        issuerId: 'rp:pius-ix',      era: 'flat',  shelves: [] },
  { pageSlug: 'leo-xiii',       issuerId: 'rp:leo-xiii',     era: 'shelf',
    shelves: ['apost_constitutions','apost_letters','briefs','bulls',
              'encyclicals','letters','motu_proprio','speeches'] },
  { pageSlug: 'pius-x',         issuerId: 'rp:pius-x',       era: 'shelf',
    shelves: ['encyclicals','apost_constitutions','apost_letters',
              'apost_exhortations','motu_proprio','letters'] },
  // … one row per pope, shelves per §2.4 and §2.7
] as const;
```

`VATICAN_SLUG_TO_ISSUER` is derived from this table rather than maintained beside it, removing the
chance of the two disagreeing.

Leo XIII's shelf list is unchanged, including `speeches` — its rows stay in the registry.

### 3.2 Shelf resolution: aggregate, or years

One new function, `tools/src/harvest/shelfPages.ts`:

```ts
resolveShelfPages(html: string): { kind: 'aggregate' } | { kind: 'years'; years: string[] }
```

`kind: 'aggregate'` when the page contains at least one `div.item`; otherwise `kind: 'years'` with
the sorted distinct `(18|19|20)\d{2}` values matched from `/{YYYY}\.index\.html` hrefs. A page with
neither is an error, not an empty shelf — vatican.va changed, and CI should say so.

The harvest then feeds either the aggregate HTML or each year's HTML to the **unmodified**
`parseShelfIndex`, passing the same `(pageSlug, shelf)`. A year page's items are indistinguishable
from an aggregate page's once parsed, which is the point.

### 3.3 Fixtures

Fixtures grow from 10 files to roughly 110 (~5 MB), named by the URL path they came from:

```
tools/fixtures/{pageSlug}-{shelf}.html                aggregate index
tools/fixtures/{pageSlug}-{shelf}-{YYYY}.html         year page
```

They stay checked in. The CI drift job (`npm run harvest && npm run render && git diff
--exit-code`) requires it, and the pilot spec's §6 rationale is unchanged: a vatican.va redesign
must fail a test rather than silently corrupt a harvest.

A `tools/fetch-fixtures.sh` script records the exact URLs, so refreshing is reproducible and the
`FIXTURES_RETRIEVED` constant in `harvest/run.ts` has a documented procedure attached to it.

## 4. Incipit extraction and the provisional shelf

### 4.1 The split between `title` and `incipit`

Today `toDocument` sets `title` and `incipit` to the same value. They separate here:

- **`title`** — always the full printed heading minus the trailing `(date)`. Never null. This is
  what a human reading the registry needs, and for a diocese erection or an occasional letter it is
  the only description there is.
- **`incipit`** — the opening words of the document proper, when the heading actually contains
  them. May be null.

### 4.2 `extractIncipit`

A pure function in `tools/src/harvest/incipit.ts`:

```ts
extractIncipit(heading: string): { title: string; incipit: string | null }
```

Applied in order against the heading, after stripping the trailing parenthetical date:

1. **Strip a leading genre phrase.** A checked-in, ordered, longest-first list:
   `Lettera Enciclica`, `Lettera Apostolica in forma di «Motu Proprio»` (and its `"…"`, `“…”` and
   unquoted variants), `Lettera Apostolica (breve)`, `Lettera Apostolica`, `Esortazione Apostolica
   Postsinodale`, `Esortazione Apostolica`, `Costituzione Apostolica`, `Breve Apostolico`,
   `Bolla di indizione`, `Bolla`, `Motu proprio`, `Chirografo`, `Epistola`. Matching is
   case-insensitive and anchored at the start.
2. **A quoted opening is the incipit.** If the residue begins with `«…»`, `"…"`, `“…”` or `'…'`,
   the quoted content is the incipit and the rest is gloss.
3. **Otherwise cut at the first gloss connector**: `, con il quale`, `, con la quale`, `, che`,
   `, sulla`, `, sui`, `, sull'`, `, nel`, `, per`, `: `, ` - `, ` — `, `. Il Santo Padre`.
   What precedes the cut is the incipit candidate.
4. **Reject** the candidate — yielding `incipit: null` — when it is empty, is itself a bare genre
   word (`Lettera`, `Bolla`, `Decreto`, …), or survived steps 1–3 unchanged while exceeding eight
   words. The eight-word ceiling is a heuristic against un-cut glosses; it is a **mapping-table
   constant with an evidence note**, tunable as the corpus grows, not a magic number in the parser.

Rules 1 and 3 live in `tools/src/mappings/incipit-rules.ts` alongside the other curated tables, one
evidence note per entry, in the pattern already set by `DATE_CORRECTIONS` and `DUPLICATE_MERGES`.

Nothing in this function is applied to the flat era or to Leo XIII: their headings are bare
incipits, steps 1–3 find nothing to strip, and the function returns the heading unchanged. It is
therefore **safe to apply universally** — and must be, so that the 383 existing records prove it
is a no-op for them. That is a regeneration-drift assertion, not a new test.

### 4.3 Provisional minting

A record with `incipit === null` gets `idStatus: 'provisional'` and

```
mag:{issuer}/{genre-slug}-{YYYY}-{MM}-{DD}[-{n}]
```

via the existing `mintProvisionalId`, exercising the pilot spec's §3.5 mechanism for the first
time. `{genre-slug}` is the `genre.id` — `apostolic-letter`, `letter`, `papal-bull`. When the genre
is null, the slugified `sourceGenreLabel` is used instead.

`{n}` is a 1-based ordinal, present only when more than one provisional record shares
`(issuer, genre-slug, date)`, assigned by sorting those records on their `title` so the numbering is
reproducible across runs. This determinism is load-bearing: without it every harvest would produce
a different diff and the CI drift check would be meaningless.

### 4.4 Every provisional record is a curation-queue entry

The harvest prints one warning per provisional record, grouped by pope:

```
Provisional id (no incipit recoverable) rp:pius-xii apost_letters 1950-08-11:
  'Lettera Apostolica (breve) che proclama Santa Chiara Patrona Celeste della Televisione'
```

This is the same mechanism the date conflicts used and it is the point of the design: the warnings
are the work list, and a document leaves it by having its incipit established and recorded in a
mapping table, not by the parser guessing harder.

## 5. Schema and type changes

`schema/document.schema.json` needs **no change**. It already declares `incipit` optional and
requires it only under `idStatus: minted`, and `title` is already required. The pilot spec provided
for exactly this case.

`tools/src/types.ts`:

| Field | Change |
|---|---|
| `HarvestItem.incipit` | `string` → `string \| null` |
| `HarvestItem.title` | **New, required** — the full printed heading |
| `DocumentRecord.incipit` | `string` → optional (`incipit?: string`), omitted when null |

`toDocument` gains the branch: minted from the incipit when present, provisional otherwise.

The three dedupe passes in `harvest/run.ts`, and the keys of `CONCILIAR_REASSIGNMENTS`,
`DATE_CORRECTIONS`, `DUPLICATE_MERGES` and `ADJUDICATED_DISTINCT`, all key on
`slugify(item.incipit)`. They become `slugify(item.incipit ?? item.title)` — the incipit where
there is one, the title otherwise, since the title is always present and is what distinguishes two
provisional records sharing a date. Every existing key is unaffected: for the pilot corpus the
incipit is present, so the expression reduces to what it already was.

## 6. Registry rendering

### 6.1 Two parallel generated views

```
registry/documents.md                        index
registry/documents/by-issuer/{issuer}.md     one per issuer, mirroring data/documents/{issuer}.json
registry/documents/by-genre/{genre}.md       one per genre.id, plus unmapped.md for genre: null
```

Both views render every document; neither is a subset. They are generated from the same
`data/documents/*.json` by one `npm run render`, so they cannot diverge, and neither is ever
hand-edited.

The by-issuer split takes the seam the data already has, so it needs no rule about where a document
belongs. The by-genre view answers the question the by-issuer split structurally cannot — *every
encyclical from Benedict XIV to Leo XIV in one table* — which is the query the registry exists to
serve.

### 6.2 Row and column shape

Six columns in each view. Against today's single table, `Title` is added and the column each view
holds constant is dropped:

| View | Columns |
|---|---|
| by-issuer | ID, Title, Incipit, Genre, Date, Promulgated by |
| by-genre | ID, Title, Incipit, Issuer, Date, Promulgated by |

`Title` is the full printed heading; `Incipit` is empty for a provisional record. A provisional id
is rendered with a trailing `†` and the page footnotes it, so the distinction is visible without
consulting `idStatus`.

### 6.3 The index

`registry/documents.md` carries the corpus totals and the coverage statement:

- a per-issuer table — issuer, document count, date range, link, and **which shelves were
  harvested** for that pope;
- a per-genre table — genre, count, link;
- an explicit **Coverage** section naming what is *not* here: the occasional-act shelves, and the
  year-partitioned `letters` shelves of §2.7.

The coverage statement is generated from the `POPES` table, so it cannot drift from what was
actually harvested.

## 7. Validation

Invariants 8–17 are unchanged and all continue to apply. Three are added:

| # | Rule |
|---|---|
| 18 | `title` is present and non-empty on every document. |
| 19 | A `provisional` id's genre segment equals `slugify(genre)` — or `slugify(sourceGenreLabel)` when `genre` is null — so a provisional id is derivable from the record, exactly as invariant 12 requires of a minted one. |
| 20 | Provisional ordinals within an `(issuer, genre-slug, date)` group are dense and 1-based: a group of *n* carries exactly `-1 … -n`, and a group of 1 carries no ordinal. |

Invariant 20 is what makes §4.3's determinism checkable rather than merely intended.

## 8. Phasing

Each phase ends with `npm run check` green and `git diff --exit-code data/ registry/` clean after a
regeneration, and is independently reviewable.

| Phase | Work | Adds |
|---|---|---|
| 1 | `POPES` table refactor; Pius X | ~342 documents. No new parsing — Pius X's headings are bare incipits. Proves the per-pope shelf mechanism alone. |
| 2 | Registry split (§6) | Both views and the index, while the corpus is still small enough to read end to end. |
| 3 | `extractIncipit`, provisional minting, invariants 18–20; Pius XI and Pius XII | ~440 documents. Lands the hard parsing change against the two pontificates where gloss headings first appear, with the previous 725 records asserting it is a no-op for them. |
| 4 | `resolveShelfPages` year traversal | The three shelves of §2.4. |
| 5 | Benedict XV, John XXIII, Paul VI, John Paul I, John Paul II, Benedict XVI, Francis, Leo XIV | ~2,000 documents, worked pope by pope through the warning queue. |

Phase 3 is the one that can fail interestingly. If the rule table cannot get provisional records
below a workable fraction of Pius XI and Pius XII, that is the signal to stop and revisit §4.2
before phases 4 and 5 multiply the problem by eight pontificates.

## 9. Out of scope

**The occasional-act shelves** — speeches (post-Leo XIII), homilies, audiences, angelus, messages,
prayers, travels, *cotidie* — are ~99% of the archive's volume and are excluded here. They need two
things this spec does not provide: a minting rule for documents whose heading is a bare date
(`19 dicembre 1979`), and a fixture strategy for a corpus that would not sensibly be checked into
git. `idStatus: provisional` gives them a home when they are taken up; nothing in this spec
forecloses them.

**Bishops' conferences and dicasterial documents** remain out of scope, as in the pilot spec.

**Statement assessments (Table 2)** are untouched. This spec adds documents, not judgements about
their authority.
