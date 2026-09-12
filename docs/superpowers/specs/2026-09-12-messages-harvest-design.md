# Messages: the `message` genre, series-keyed identifiers, and the *Messaggi* harvest

Resolves the *Messages* bullet of [#4](https://github.com/CatholicOS/cmddr/issues/4) (the
comments of 2026-09-06 and 2026-09-12), and gives [#15](https://github.com/CatholicOS/cmddr/issues/15)'s
`urbi-et-orbi` row and [#16](https://github.com/CatholicOS/cmddr/issues/16)'s `series` field their
first data. Curial, conference and commission documents — the rest of #4 — are out of scope.

## 1. Decisions already taken

Editorial decisions recorded on the issues; this spec implements them and does not reopen them.

- One `message` genre row (#4, comment of 2026-09-06), not one per occasion.
- Urbi et Orbi is its own genre and a `liturgical` act (#15, merged in PR #23).
- Series membership is `document.series = { id, ordinal? }` against `data/series.json` (#16, PR #23).
- Documents in a series are keyed by occasion, not incipit (#4, comment of 2026-09-12):
  occasion year in the id, ordinal in the field, series ids in canonical English, the rule
  triggering on series membership rather than on the shelf.
- Scope of this PR: the series sub-shelves and the Urbi et Orbi sub-shelf, for every pope
  whose page has a *Messaggi* shelf (Pius XII → Leo XIV). The year-partitioned
  `pont-messages` / `pont_messages` shelf — occasional messages with no occasion, which take
  the provisional form — is a **second PR**, after the series form has landed.
- Christmas and Easter Urbi et Orbi are two dated series; every other Urbi et Orbi is
  provisional.

## 2. Evidence

### 2.1 Source: the vatican.va shelves, not AAS

The Acta Apostolicae Sedis are on vatican.va as whole-volume OCR PDFs (1909–2002 one per
year, monthly fascicles thereafter) with a separate annual *Index generalis* PDF for
2015–2024, whose text extracts cleanly. Measured on 2023: the AAS index lists **36** *Nuntii*
and **3** *Nuntii televisifici*; vatican.va's Francis pages hold **53** occasional messages on
`pont-messages/2023` plus one message on each of the thirteen series sub-shelves for that
year. AAS publishes a *selection* of messages, lags by more than a year, and is a PDF
pipeline the harvester does not have. It is not the harvest source.

What AAS does establish is the naming convention. Its index cites messages by occasion —
*"Nuntius S.P. pro XCVII Die Mundiali Missionum"*, *"Nuntius S.P. occasione XXXI Diei
Mundialis Infirmorum"* — never by first words. That is the convention the identifier rule of
§3 follows. Recording an AAS page reference per document is a natural later addition and is
not part of this PR.

### 2.2 Shelf shapes

Every *Messaggi* landing page (`/content/{pope}/it/messages.index.html`) carries no items of
its own, only links to sub-shelves. Sub-shelves seen on 2026-09-12:

| Pope | Sub-shelves (aggregate) | Year-partitioned |
|---|---|---|
| pius-xii | `urbi` | — |
| john-xxiii | `urbi_et_orbi` | `pont_messages` |
| paul-vi | `peace communications lent migration missions sick vocations urbi_et_orbi` | `pont-messages` (linked, no year links found) |
| john-paul-i | *(3 items directly on the landing page)* | — |
| john-paul-ii | `peace communications lent migration missions sick vocations youth food consecrated_life tourism literacy urbi` | `pont_messages` |
| benedict-xvi | `peace communications lent migration missions sick vocations youth food urbi` | `pont-messages` |
| francesco | `peace communications lent migration missions sick vocations youth food consecrated_life poveri nonni bambini cura-creato urbi` | `pont-messages` |
| leo-xiv | `peace communications lent migration mission sick vocations youth poor grandparents creation urbi` | `pont-messages` |

Each series sub-shelf is an **aggregate** page carrying `div.item` entries, exactly the shape
`resolveShelfPages` already reads; the existing shelf adapter applies with the shelf name
`messages/{sub-shelf}`.

Two facts force the vocabulary design of §4. **The slugs are not stable across
pontificates**: Leo XIV's page renames `missions` → `mission`, `poveri` → `poor`,
`nonni` → `grandparents`, `cura-creato` → `creation`, and John XXIII and Paul VI spell
`urbi_et_orbi` where later popes have `urbi`. And the same occasion is one series across
five pontificates (World Day of Peace, 1968–). A series row therefore carries a *list* of
shelf slugs, and its id is canonical English, not any of them.

### 2.3 What the items print

```
LVIII Giornata Mondiale della Pace 2025 - "Rimetti a noi i nostri debiti, concedici la tua pace"
  → /content/francesco/it/messages/peace/documents/20241208-messaggio-58giornatamondiale-pace2025.html
XI Giornata Mondiale della Pace 1978: No alla violenza, Sì alla pace
  → /content/paul-vi/it/messages/peace/documents/hf_p-vi_mes_19771208_xi-world-day-for-peace.html
IX Giornata Mondiale della Pace 1976: Le vere armi della pace
  → …/hf_p-vi_mes_19751018_ix-world-day-for-peace.html
Quaresima 2015: Rinfrancate i vostri cuori (Gc 5,8)
```

- The **ordinal** is printed as a Roman numeral at the head of the title on the numbered
  series (Arabic on some: `110ª` on migration, `62a` on vocations), and not at all on the
  dated series (Lent, Missions, Food, Tourism, Literacy, Care of Creation) — even where AAS
  numbers the same occasion (*XCVII Die Mundiali Missionum*).
- The **occasion year** is printed in the title (`Pace 2025`, `Quaresima 2015`,
  `Comunicazioni Sociali, 2018`).
- The **date** is the signing date, in the item and in the URL, and routinely falls in the
  *preceding* year: the 2025 Peace message is dated 8 December 2024; the 1976 one 18 October
  1975. This is why the id carries the occasion year, not the year of `date`.

### 2.4 Urbi et Orbi

Francis's `urbi` shelf holds 26 items: 13 Easter, 11 Christmas, the extraordinary *Momento
straordinario di preghiera* of 27 March 2020, and one Christmas item whose title reads
*"Messaggio natalizio…"*. John Paul II's holds 56: 27 + 27 and the two Jubilee closings of
31 December 1999 and 2000. Paul VI's titles are inconsistent (*"Messaggio Urbi et Orbi -
1975"*). Titles are therefore not the classifier; **the date is**: 25 December is Christmas,
Easter Sunday (by computus) is Easter, anything else is neither.

## 3. Identifier scheme: the series form (normative; extends the identifiers spec §3)

### 3.1 Form

```
mag:{issuer}/{series-id}-{occasion-year}

mag:francis-i/world-day-of-peace-2025    series: { id: "world-day-of-peace", ordinal: 58, year: 2025 }
mag:paul-vi/world-day-of-peace-1968      series: { id: "world-day-of-peace", ordinal: 1,  year: 1968 }
mag:francis-i/lent-2015                  series: { id: "lent", year: 2015 }
mag:francis-i/urbi-et-orbi-christmas-2024
mag:john-paul-ii/urbi-et-orbi-easter-2005
```

| Segment | Rule |
|---|---|
| `{issuer}` | As §3.1 of the identifiers spec. The series spans pontificates; the issuer segment does not. |
| `{series-id}` | `series.id`, verbatim. Already slug-form by the vocabulary's own pattern. |
| `{occasion-year}` | `series.year` — the year of the occasion as the title prints it, **not** the year of `date`. |

### 3.2 Rules

1. **Trigger.** A document takes the series form **iff** `series` is set. The shelf is
   irrelevant: a one-off message on `pont-messages` has no series and takes the provisional
   form; an annual series filed on some other shelf (John Paul II's Holy Thursday letters to
   priests, on `letters`) would take the series form if it were ever harvested.
2. **Status.** Series-form ids are `minted`. The occasion name is as conventional as an
   incipit and as permanent.
3. **No incipit is required, and none is derived from.** The schema's *minted requires
   incipit* rule becomes *minted requires incipit or series*. Where a source ever prints an
   incipit for a series document it is recorded as a fact and does not drive the id; this
   is the one case where a minted id and a printed incipit coexist without the one being
   `slugify` of the other.
4. **Ordinal.** `series.ordinal` is recorded only where the title prints it (Roman or Arabic).
   It is never computed from `firstYear`, because a number the source did not print is not
   evidence. Where the title prints none inside a numbered series (the *consecrated_life*
   2023 item) the field is simply absent.
5. **Occasion year.** `series.year` is read from the title. An item whose title yields no
   four-digit year is **not** guessed from `date`: it is reported by the harvest and left
   for a curated row (see §5.3), exactly as an unrecovered incipit is.
6. **Collision.** One issuer, one series, one occasion year, one document. Two records with
   the same `(issuer, series.id, series.year)` are a harvest error, not a collision to
   discriminate: the run fails.
7. **Urbi et Orbi.** Two dated series, `urbi-et-orbi-christmas` and `urbi-et-orbi-easter`,
   assigned by `date` (§2.4), with `series.year` = the year of `date`. Every other item on
   the `urbi` shelf is `genre: urbi-et-orbi` with no series and a provisional id
   (`mag:francis-i/urbi-et-orbi-2020-03-27`). All Urbi et Orbi records carry
   `actKind: liturgical`. Two curated exceptions, adjudicated on PR #26: an item whose
   heading names the feast while the act bears another date, and for whose year the shelf
   holds no feast-day item, is placed in the series by a curated row quoting the heading
   (John XXIII's *Santo Natale* of 22 December 1962); and an item on the shelf that is not
   a blessing at all — John XXIII's radio messages to the world, broadcast before the feasts
   and on other occasions beside the feast-day messages — is excluded by a curated row and
   harvested as a provisional `message` with no `actKind`, as §5.3's exclusions provide.

### 3.3 Invariants

- **10 (year matches date)** gains a branch: when `series` is set, the id's year equals
  `series.year`; otherwise the year of `date`, as now.
- **12 (slug round-trips)** gains a branch: when `series` is set, the id's slug segment
  equals `series.id`; otherwise `slugify(incipit)`, as now.
- **23 (series reference)** is unchanged.
- **24 (ordinal is consistent with the series' first year)** — new. When `series.ordinal`,
  `series.year` and the vocabulary row's `firstYear` are all present,
  `ordinal = year − firstYear + 1`. This is the check that catches a misread numeral or a
  miscount before it enters a permanent id's neighbourhood; it never fires when any of the
  three is absent.
- **Series-form ids are unique** per `(issuer, series.id, series.year)` — folded into
  invariant 8's uniqueness, since it is the id itself that would collide.

## 4. Vocabulary: `data/series.json`

Row shape becomes:

```json
{
  "id": "world-day-of-peace",
  "label": "World Day of Peace",
  "shelves": ["peace"],
  "numbered": true,
  "firstYear": 1968,
  "gloss": "…",
  "note": "Shelf evidence: … Paul VI's shelf opens with 'I Giornata Mondiale della Pace 1968'."
}
```

- `id` — canonical English, slug form. Renamed from the vatican.va slugs of PR #23 (`peace`
  → `world-day-of-peace`, `nonni` → `world-day-of-grandparents-and-the-elderly`, and so on);
  nothing referenced the old ids, so the rename costs nothing now and would cost ids later.
- `shelves` — every vatican.va sub-shelf slug the occasion has been filed under, across all
  popes (§2.2). The harvester's only way from a shelf to a series. Replaces the single-slug
  reading of `id`.
- `firstYear` — **only where verified** from a shelf that reaches the first occasion
  (`I Giornata…`): Peace 1968 and Communications 1967 are, from the Paul VI shelves. The
  implementer verifies the others against the earliest shelf that carries them and leaves
  the field absent where the shelf does not reach *I*. An unverified first year is not
  recorded.
- Two new rows: `urbi-et-orbi-christmas` and `urbi-et-orbi-easter`, `numbered: false`,
  `shelves: ["urbi", "urbi_et_orbi"]`.
- `keywords.json`-style tests apply: unique ids, slug form, required fields, `shelves`
  non-empty and globally disjoint (one shelf slug maps to one series).

## 5. Harvest

### 5.1 Configuration

`pontiffs.ts` gains, per pope, the `messages/{sub-shelf}` shelves of §2.2 (series and
`urbi`/`urbi_et_orbi`; **not** `pont-messages`/`pont_messages`). `fetch-fixtures.sh` fetches
`/content/{pope}/it/messages/{sub-shelf}.index.html` into
`tools/fixtures/{pope}-messages-{sub-shelf}.html`. John Paul I's three items sit directly on
the landing page; the implementer decides whether that page is worth a one-pope special case
or is left for the `pont-messages` PR, and records which.

### 5.2 Mapping

`SOURCE_GENRE_TO_GENRE` cannot key `messages/peace` by shelf name alone, because the shelf
decides the *series* and the series decides the genre. `toDocument` gains a step ahead of the
generic mapping: if the shelf is `messages/{x}` and `{x}` is in some series row's `shelves`,
then

- genre `message` (or `urbi-et-orbi` for the two Urbi et Orbi series), `actKind: liturgical`
  for Urbi et Orbi, no `characteristics`;
- `series.id` from the row; `series.year` and `series.ordinal` from the title by §2.3
  (Urbi et Orbi: by date, §2.4; an Urbi et Orbi item that is neither Christmas nor Easter
  gets no series and falls to the provisional form);
- the id by §3.1; `idStatus: minted`;
- `sourceGenreLabel` = the shelf name verbatim, as everywhere.

`SHELF_SPECIFICITY` gains the `messages/*` shelves at the least-specific end, beside
`letters`; a message that is also filed on a more specific shelf keeps that shelf and
records `messages/…` in `alsoShelvedAs`, as now. (Whether any such cross-filing exists is a
count to report, not a rule to assume.)

### 5.3 Curated fallbacks

Two hand-curated tables, in the style of `recovered-incipits.ts`, each row quoting the
source: **occasion years** for series items whose title prints none, and **ordinals** for
items whose title prints one the parser cannot read. Both start empty and are populated only
from what the corpus measurement (§5.4) actually turns up. An item that neither the parser
nor a curated row can assign a `series.year` fails the run: a series document without an
occasion year has no id.

### 5.4 Measure before merging

The PR reports, per pope and per series: items harvested; ordinals read (and which were
Arabic); items with no ordinal printed; items whose occasion year needed a curated row;
`firstYear` values verified and from which item; invariant 24 outcomes; Urbi et Orbi items
classified Christmas / Easter / neither (listing the "neither" items). Any of these that
looks wrong is an argument, not a diff to commit.

## 6. Schema and documentation

- `schema/document.schema.json`: `series.year` (integer, 4-digit); the minted branch of
  `allOf` requires `incipit` **or** `series`.
- `data/genres.json` + README Table 1: the `message` row from the #4 comment, placed after
  `audience-catechesis` and before `urbi-et-orbi`.
- `SCHEMA.md`: `series` vocabulary line gains `year` and the id rule; identifier minting
  gains the series form; invariants 10, 12, 24.
- Identifiers spec: a new §3.6 pointing here for the series form, so the normative id rules
  stay findable from one document.
- README *Numbered annual series*: one paragraph on the id form with the December-dating
  evidence; the *chancery shelves* note gains the Leo XIV renaming as one more example.
- The rendered registry gains `by-genre/message.md` and `by-genre/urbi-et-orbi.md` from the
  existing renderer; no new render code unless the by-genre table is unreadable without a
  series column, in which case the implementer says so.

## 7. Out of scope, recorded so it is not forgotten

- `pont-messages` / `pont_messages` (all popes) and John XXIII's `pont_messages` — the next PR.
- An AAS page reference per document.
- The `addressee` field, `regional` and non-juridical scope values (#4, #11).
- The Holy Thursday letters and every other annual series filed outside *Messaggi*.
