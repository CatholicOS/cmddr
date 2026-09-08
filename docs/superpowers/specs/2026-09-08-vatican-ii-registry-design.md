# Document Registry: The Second Vatican Council

*Design spec — 2026-09-08*

## 1. Purpose

The registry holds 4269 documents across fourteen pontificates and one council. It holds **no
Vatican II document at all** — while `SCHEMA.md`, the pilot spec (§3.2) and the README's authority
table all use `mag:vatican-ii/gaudium-et-spes-1965` and `mag:vatican-ii/lumen-gentium-1964#*` as
their worked examples of the minting rule. The scheme's own illustration does not resolve.

This spec adds the sixteen documents of the Second Vatican Council.

It is deliberately narrow. Three adjacent gaps are named in §9 and excluded: the year-partitioned
`letters` shelves, re-sourcing Vatican I, and the nineteen pre-1870 councils.

### 1.1 What this is not

An audit of the whole archive was run before this spec (see §2.1). **No pontificate is missing.**
vatican.va publishes exactly fourteen pope pages and the registry harvests all fourteen; every
formal document shelf on every one of those pages is harvested, but for the year-partitioned
`letters` shelves and the deliberately excluded occasional acts. The gap this spec closes is
conciliar, not papal.

## 2. Evidence base

Every finding below was verified against live vatican.va pages on 2026-09-08, and the per-document
findings of §2.3–§2.6 were read from all sixteen document pages, not sampled.

### 2.1 The archive holds exactly two councils

`https://www.vatican.va/archive/hist_councils/index.htm` links two councils and no others:
`i-vatican-council` and `ii_vatican_council`. Note the slug irregularity — Vatican I hyphenates
where Vatican II underscores.

The Vatican I index lists only *Dei Filius* and *Pastor Aeternus*, both already in the registry
via Pius IX's flat page and `CONCILIAR_REASSIGNMENTS`. **Vatican I is complete.** The other
nineteen councils in `vendor/coecdr-councils.json` have no vatican.va source at all.

The pope-page audit that ran alongside this, diffing each landing page's `*.index.html` links
against the configured `shelves` list, found only two classes of unharvested shelf: the
occasional acts already excluded by the expansion spec §2.7 (`angelus`, `audiences`, `homilies`,
`messages`, `prayers`, `speeches`, `travels`, `cotidie`) and the non-shelves (`biography`,
`biografia`, `books`, `jubilee`, `elezione`); and the year-partitioned `letters` shelves of John
XXIII, Benedict XV, Paul VI, John Paul II, Benedict XVI, Francis and Leo XIV (§9.1).

### 2.2 The council index is a third page shape

`ii_vatican_council/index_it.htm` is an archive-era page. It shares no markup with either page
shape the registry already reads: no `div.item`, no `<h2>{heading} ({date})</h2>`.

```html
<p> <b>Costituzioni</b> </p>
<ul>
 <li><a href="documents/vat-ii_const_19651118_dei-verbum_it.html"><b>Dei Verbum</b></a>
  <br /><font size="2">[<a href="…_ar.html">Arabo</a>, … <a href="…_lt.html">Latino</a>, …]</font></li>
</ul>
```

Each document is one `<li>`: a bold anchor to the Italian text carrying the printed incipit, then
a `<font size="2">` bar of translation links. Documents are grouped under three `<p><b>` headings
in this order — `Costituzioni` (4), `Dichiarazioni` (3), `Decreti` (9) — one `<ul>` per document.

**The index prints no date and no genre qualifier.** Both must come from elsewhere; §2.3 and §2.4
establish where.

### 2.3 Dates: the URL slug, corroborated by every document

Each document's URL carries its own date: `vat-ii_const_19641121_lumen-gentium_it.html`. This is
the only date the index page holds, so the adapter reads it there.

It is not taken on trust. All sixteen document pages print their promulgation date, and all
sixteen agree with the URL slug:

- twelve close with `Roma, presso San Pietro, {date}. Io PAOLO Vescovo della Chiesa Cattolica`;
- *Lumen Gentium* and *Dei Verbum* print the date in the heading and repeat it at the end of the
  text;
- *Sacrosanctum Concilium* and *Inter Mirifica* print a bare `4 dicembre 1963` at the end of the
  text, with no Roman formula.

### 2.4 Genre labels, read from the documents

The index's three section headings are plural bucket names. The label the registry records as
`sourceGenreLabel` is the one the document itself prints, after
`PAOLO VESCOVO SERVO DEI SERVI DI DIO / UNITAMENTE AI PADRI DEL SACRO CONCILIO / A PERPETUA MEMORIA`:

```text
COSTITUZIONE DOGMATICA SULLA CHIESA                        LUMEN GENTIUM
COSTITUZIONE PASTORALE SULLA CHIESA NEL MONDO CONTEMPORANEO GAUDIUM ET SPES
COSTITUZIONE SULLA SACRA LITURGIA                           SACROSANCTUM CONCILIUM
DICHIARAZIONE SULL'EDUCAZIONE CRISTIANA                     GRAVISSIMUM EDUCATIONIS
DECRETO SULLA FORMAZIONE SACERDOTALE                        OPTATAM TOTIUS
```

**Only three of the four constitutions carry a qualifier.** *Sacrosanctum Concilium* prints
`COSTITUZIONE SULLA SACRA LITURGIA` — no "dogmatica", no "pastorale". It therefore takes **no**
`descriptiveTitle`. The field's enum (`'dogmatic' | 'pastoral'`) has no third value and must not
acquire one to paper over a qualifier the source does not print. The split is: *Lumen Gentium* and
*Dei Verbum* dogmatic, *Gaudium et Spes* pastoral, *Sacrosanctum Concilium* unqualified.

### 2.5 Every document was promulgated by Paul VI

All sixteen open `PAOLO VESCOVO SERVO DEI SERVI DI DIO`. This was checked on all sixteen pages,
including the two of 4 December 1963 — Paul VI was elected on 21 June 1963, and John XXIII, who
convoked the council, died before any of its documents was promulgated. `promulgatedBy` is
`rp:paul-vi` on all sixteen and `rp:john-xxiii` on none.

### 2.6 Language suffixes are not ISO codes

The archive's translation links use vatican.va's own suffixes, which diverge from the two-letter
uppercase codes the registry records in `source.languages`. Most dangerously, **`lt` is Latin, not
Lithuanian.**

| suffix | code | | suffix | code | | suffix | code |
|---|---|---|---|---|---|---|---|
| `ar` | `AR` | | `fr` | `FR` | | `lt` | `LA` |
| `be` | `BE` | | `ge` | `DE` | | `lv` | `LV` |
| `cs` | `CS` | | `he` | `HE` | | `po` | `PT` |
| `en` | `EN` | | `hr` | `HR` | | `sp` | `ES` |
| `hu` | `HU` | | `it` | `IT` | | `sw` | `SW` |

Chinese is not a `documents/` link at all but a PDF elsewhere on the site
(`/chinese/concilio/vat-ii_{name}_zh-t.pdf`) and maps to `ZH`. Hebrew (`_he`) is a PDF under
`documents/` on Dei Verbum and HTML under `documents/` on Nostra Aetate. Both count as available
languages.

This table was verified, not assumed: each document page prints its own code bar
(`[ AR - BE - CS - DE - EN - ES - FR - IT - HU - LA - LV - PT - SW - ZH ]`), and the set derived
from the index's link suffixes equals the set printed on the page for all sixteen documents. `LA`
appears in every bar; `LT` appears in none. `hr` occurs once, on *Nostra Aetate* alone.

### 2.7 The Genre Registry is already ready

`data/genres.json` carries `decree` (presumptive weight 2) and `declaration` (weight 1), both
`issuerTypes: ['ecumenical-council']`, both `ceiling: extraordinary`, alongside `constitution`
(weight 3). All three rows exist and are documented in README Table 1. **No authority-bearing
decision is taken by this spec** — it populates rows the registry already defines. `declaration`
and `decree` currently have no documents at all.

## 3. The obstacle in `toDocument`

`toDocument` resolves genre through a single global map keyed on the lowercased source label:

```ts
const mapping = SOURCE_GENRE_TO_GENRE[item.sourceGenreLabel.toLowerCase()] ?? { genre: null };
```

`SOURCE_GENRE_TO_GENRE` already contains `'decreto': { genre: null }` — Pius IX's flat page prints
*papal* decrees, for which the Genre Registry has no row (expansion spec §2.6, §5.2). That mapping
is correct and must not change: `decree` is `issuerTypes: ['ecumenical-council']`, so re-pointing
`'decreto'` at it would make every papal decree fail invariant 17.

Left alone, all nine conciliar decrees would silently land with `genre: null`.

**Resolution.** A separate `CONCILIAR_SOURCE_GENRE_TO_GENRE`, consulted first when
`issuerId.startsWith('oec:')`, falling back to the shared map:

```ts
'decreto':                  { genre: 'decree' }
'dichiarazione':            { genre: 'declaration' }
'costituzione':             { genre: 'constitution' }
'costituzione dogmatica':   { genre: 'constitution', descriptiveTitle: 'dogmatic' }
'costituzione pastorale':   { genre: 'constitution', descriptiveTitle: 'pastoral' }
```

The shared map keeps its existing `'costituzione dogmatica'` entry, which Pius IX's page needs,
unchanged. The two maps agreeing on that one key is a duplication of five words, and preferable to
either map reaching into the other.

`issuerType` needs no change: it already falls out of the `oec:` prefix branch.

## 4. Source model

### 4.1 `COUNCILS`, parallel to `POPES`

A new `tools/src/mappings/councils.ts`:

```ts
export interface CouncilSource {
  /** The vatican.va archive path segment, e.g. 'ii_vatican_council'. */
  pageSlug: string;
  /** The COECDR id, e.g. 'oec:vatican-ii'. */
  issuerId: string;
  /** The pope who promulgated every document of this council (§2.5). */
  promulgatedBy: string;
  /** The date this council's own fixture was fetched from vatican.va. */
  retrieved: string;
  /** The council's closed document set, keyed by incipit slug (§4.2). */
  documents: Record<string, CouncilDocument>;
}

export const COUNCILS: readonly CouncilSource[] = [
  {
    pageSlug: 'ii_vatican_council',
    issuerId: 'oec:vatican-ii',
    promulgatedBy: 'rp:paul-vi',
    retrieved: '2026-09-08',
    documents: VATICAN_II_DOCUMENTS,
  },
];
```

`retrieved` exists because `harvest/run.ts` stamps every record with one `FIXTURES_RETRIEVED`
constant, recording when the *pope* fixtures were fetched — 2026-09-07. This council's fixture is
fetched a day later. Bumping the constant would restamp all 4269 existing records with a date they
were not refetched on; leaving it alone would stamp these sixteen with a date before their own
fixture existed. Both are false provenance, in a registry whose whole discipline is provenance. So
the date is resolved per item: `retrievedFor(item)` returns `process.env.RETRIEVED` ??
this council's `retrieved` ?? `FIXTURES_RETRIEVED`, and `fetch-fixtures.sh` says at the point of
use that a council's date lives on its `COUNCILS` row, not in the constant.

`VATICAN_SLUG_TO_ISSUER` gains `'ii_vatican_council': 'oec:vatican-ii'`, so `toDocument`'s
existing `pageIssuer` lookup resolves without a special case.

`promulgatedBy` sits on the council rather than on each of sixteen rows because it is one fact
about the council's promulgation, uniformly evidenced (§2.5). It is applied in `toDocument` when
the record is council-issued and no `CONCILIAR_REASSIGNMENTS` row already set it, leaving Vatican
I's existing route untouched.

### 4.2 `VATICAN_II_DOCUMENTS`, the curated table

Keyed on incipit slug. Each row carries what the index cannot print, quoting the heading read from
that document's own page — the same evidence discipline as the existing curated adjudications:

```ts
'lumen-gentium': {
  sourceGenreLabel: 'Costituzione dogmatica',
  descriptiveTitle: 'dogmatic',
  /** The document's own heading, verbatim, as the evidence for the two fields above. */
  heading: 'COSTITUZIONE DOGMATICA SULLA CHIESA',
  /** Printed at the head and repeated at the end of the text. */
  printedDate: '1964-11-21',
},
```

`printedDate` exists to be checked against the URL-derived date (§6), never to override it. Where
the two disagree, the harvest fails rather than picking a winner.

`heading` is never written to a record — no `DocumentRecord` field holds it. It is the quoted
evidence for the row's `sourceGenreLabel` and `descriptiveTitle`, kept in the table so a reader can
audit both against the source without refetching the document.

The full sixteen rows, in index order within each section:

| Incipit | Date | Section | `sourceGenreLabel` | `descriptiveTitle` |
|---|---|---|---|---|
| Dei Verbum | 1965-11-18 | Costituzioni | Costituzione dogmatica | dogmatic |
| Lumen Gentium | 1964-11-21 | Costituzioni | Costituzione dogmatica | dogmatic |
| Sacrosanctum Concilium | 1963-12-04 | Costituzioni | Costituzione | — |
| Gaudium et Spes | 1965-12-07 | Costituzioni | Costituzione pastorale | pastoral |
| Gravissimum Educationis | 1965-10-28 | Dichiarazioni | Dichiarazione | — |
| Nostra Aetate | 1965-10-28 | Dichiarazioni | Dichiarazione | — |
| Dignitatis Humanae | 1965-12-07 | Dichiarazioni | Dichiarazione | — |
| Ad Gentes | 1965-12-07 | Decreti | Decreto | — |
| Presbyterorum Ordinis | 1965-12-07 | Decreti | Decreto | — |
| Apostolicam Actuositatem | 1965-11-18 | Decreti | Decreto | — |
| Optatam Totius | 1965-10-28 | Decreti | Decreto | — |
| Perfectae Caritatis | 1965-10-28 | Decreti | Decreto | — |
| Christus Dominus | 1965-10-28 | Decreti | Decreto | — |
| Unitatis Redintegratio | 1964-11-21 | Decreti | Decreto | — |
| Orientalium Ecclesiarum | 1964-11-21 | Decreti | Decreto | — |
| Inter Mirifica | 1963-12-04 | Decreti | Decreto | — |

### 4.3 Fixtures

One new fixture: `tools/fixtures/ii_vatican_council.html`, from
`archive/hist_councils/ii_vatican_council/index_it.htm` — Italian, matching the `/it.html`
convention the pope pages already use, and the language whose printed labels the curated table
quotes.

**No document pages are checked in.** The sixteen Italian texts together are ~1.4 MB (*Lumen
Gentium* alone is 185 KB of extracted text), for a corpus of sixteen documents whose per-document
facts fit in the table of §4.2. The facts were read from those pages; the pages themselves are not
a build input.

`tools/fetch-fixtures.sh` gains a `council()` helper beside `flat()` and `shelf()`:

```bash
council() { get "$1" "https://www.vatican.va/archive/hist_councils/$1/index_it.htm"; }
```

Note this URL shape differs from `flat()`/`shelf()`: the archive is not under `/content/`.

## 5. The adapter — `tools/src/harvest/council.ts`

A third reader beside `flat.ts` and `shelf.ts`, emitting the same `HarvestItem[]` so that
everything downstream — dedupe, minting, ordinals, writing, rendering — is unchanged.

It walks the `<p><b>` / `<ul>` sequence in document order, tracking the current section heading,
and for each `<li>` emits:

| `HarvestItem` field | Source |
|---|---|
| `title`, `incipit` | the bold anchor's printed text, e.g. `Lumen Gentium` |
| `date` | the `YYYYMMDD` in the anchor's URL slug (§2.3) |
| `sourceGenreLabel` | the curated table's label for this incipit (§4.2) |
| `url` | the `_it.html` document page, absolutised |
| `languages` | the `<li>`'s link suffixes mapped through §2.6, in printed order |
| `shelf` | `null`, as Vatican I's records already have |
| `pageSlug` | `ii_vatican_council` |

Three consequences worth stating:

- **`incipit` is never null.** For a conciliar act the printed title *is* the incipit, so no
  Vatican II record is ever provisional and `extractIncipit` is not involved. A missing incipit
  here means the page changed shape, and is an error, not a curation-queue entry.
- **`extractLanguages` cannot be reused.** It returns printed link text, which on this page is
  `Italiano`, `Latino` — language names, not codes.
- **An `<li>` whose incipit slug is absent from the curated table is an error**, not a
  `genre: null` record. Sixteen documents are a closed set; a seventeenth means the council page
  changed and a human must look.

The dedupe passes in `run.ts` operate on `(pageSlug, …)` keys, so council items never merge with
papal ones. The two 4 December 1963 documents share a date but differ in incipit slug, so no merge
key collides; the same-date cross-shelf warning cannot fire, both having `shelf: null`.

## 6. Validation

Beyond the existing invariants, the harvest fails loudly — never silently drops — when:

1. the parsed document count is not 16, or the per-section counts are not 4 / 3 / 9;
2. an `<li>` incipit slug is not in the curated table, or a table row matched no `<li>`;
3. a URL-derived date disagrees with the row's `printedDate`;
4. a language suffix is not in the §2.6 table.

Existing invariants that these records must satisfy, and which the tests assert:

- **rule 13** — `oec:vatican-ii` is in `vendor/coecdr-councils.json`; `rp:paul-vi` is in the
  pontiff registry.
- **rule 16** — `issuerId` and `issuerType` agree on `ecumenical-council`.
- **rule 17** — `constitution`, `declaration` and `decree` all list `ecumenical-council` among
  their `issuerTypes`. This is the rule that would catch the §3 mistake if the conciliar genre map
  were ever bypassed.

## 7. Expected output

Sixteen minted identifiers, no provisionals, no collisions — no two share an incipit slug within a
year, so every one takes the year-only suffix:

```text
mag:vatican-ii/sacrosanctum-concilium-1963   mag:vatican-ii/inter-mirifica-1963
mag:vatican-ii/lumen-gentium-1964            mag:vatican-ii/orientalium-ecclesiarum-1964
mag:vatican-ii/unitatis-redintegratio-1964   mag:vatican-ii/christus-dominus-1965
mag:vatican-ii/perfectae-caritatis-1965      mag:vatican-ii/optatam-totius-1965
mag:vatican-ii/gravissimum-educationis-1965  mag:vatican-ii/nostra-aetate-1965
mag:vatican-ii/dei-verbum-1965               mag:vatican-ii/apostolicam-actuositatem-1965
mag:vatican-ii/ad-gentes-1965                mag:vatican-ii/presbyterorum-ordinis-1965
mag:vatican-ii/dignitatis-humanae-1965       mag:vatican-ii/gaudium-et-spes-1965
```

`mag:vatican-ii/gaudium-et-spes-1965` and `mag:vatican-ii/lumen-gentium-1964` are the identifiers
`SCHEMA.md`, the pilot spec and README Table 2 already cite. They become real.

Registry totals: **4269 → 4285**. `constitution` 2 → 6; `declaration` 0 → 3; `decree` 0 → 9. The
provisional count is unchanged at 316.

## 8. Rendering

`data/documents/vatican-ii.json` is written by the existing per-issuer loop and picked up by the
renderer without change; `issuerMd` already branches on the `oec:` prefix.

The by-issuer table's **Shelves harvested** column needs no change either: `renderIndexMd`'s
`shelvesOf` already returns `— (conciliar)` for any issuer with no `POPES` row, which is how
Vatican I's cell is produced today. Vatican II gets the same cell by the same fall-through.

One edit to generated prose:

- **Coverage** gains a sentence naming the nineteen pre-1870 councils as absent for want of a
  vatican.va source, so that a registry now holding two councils cannot be read as claiming
  conciliar completeness.

## 9. Out of scope

### 9.1 The year-partitioned `letters` shelves

Seven pontificates have a `letters` shelf that carries no items of its own, only year links: John
XXIII (1958–1963), Benedict XV (1914–1921), Paul VI (1963–1978), John Paul II (1978–2005),
Benedict XVI (2005–2013), Francis (2013–2025), Leo XIV (2025–2026) — 82 year pages, all verified
to carry zero direct items. `resolveShelfPages` already reads year-partitioned shelves, so this is
configuration and fixtures rather than machinery. It is excluded here because Pius XII's `letters`
shelf ran a 98.9% provisional-id rate, and a shelf of that shape deserves its own decision rather
than riding along with sixteen conciliar documents.

**One correction belongs with this spec, not with that work.** `registry/documents.md` states the
gap as "Benedict XV, and Paul VI onward." John XXIII's `letters` is year-partitioned too and is
unharvested, so the Coverage note understates the gap by one pontificate. That sentence is
corrected in this change.

### 9.2 Re-sourcing Vatican I

*Dei Filius* and *Pastor Aeternus* keep their current `source.url` on Pius IX's page and their
`CONCILIAR_REASSIGNMENTS` route. The two councils will therefore reach the registry by different
paths. That asymmetry is accepted: the alternative changes two correct records to gain nothing a
reader can act on.

### 9.3 The other nineteen councils

Nicaea through Trent have no vatican.va source (§2.1). Adding them means sourcing a different
corpus, with its own provenance, language and text-critical questions. Out of scope.

### 9.4 Sections and assessments

`mag:vatican-ii/lumen-gentium-1964#*` — the section-level identifier README Table 2 uses — belongs
to the assessment layer (`schema/assessment.schema.json`), not to the document registry. This spec
adds documents only.
