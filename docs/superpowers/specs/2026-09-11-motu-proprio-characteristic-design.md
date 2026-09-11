# Motu Proprio as a Characteristic of the Apostolic Letter

*Design spec — 2026-09-11 — closes [#10](https://github.com/CatholicOS/cmddr/issues/10)*

## 1. Purpose

Table 1 listed **Motu Proprio** as a genre row beside **Apostolic Letter**. The Holy See's own
filing says otherwise: a *motu proprio* is a **mode of issuance** — the pope acting on his own
initiative — and not a document type standing beside the apostolic letter. This spec demotes
`motu-proprio` from a genre to a document-level **characteristic** that the `apostolic-letter`
genre allows, exactly as `apostolic-constitution` and `dogmatic-definition` are characteristics
the `papal-bull` genre allows.

The registry already had the pattern; what it lacked was a way to say *which* genre allows *which*
characteristic. That is the one piece of new machinery here.

## 2. Evidence

All from vatican.va, as the issue records it.

- The John Paul II [*Motu Proprio* index](https://www.vatican.va/content/john-paul-ii/it/motu_proprio.index.html)
  labels its entries in so many words: *E sancti Thomae Mori* (2000) and *Spes Aedificandi* (1999)
  are each a **"Lettera Apostolica in forma di Motu Proprio"**. The harvester's incipit rules
  already strip six spellings of that prefix (`GENRE_PREFIXES` in `incipit-rules.ts`, varying
  by pontificate in quotation marks and in *in forma di* versus *data*), which is itself
  evidence that the sources treat the phrase as a qualifier on *Lettera Apostolica*, not as a
  genre word.
- The shelves are **not disjoint**. *Socialium Scientiarum* (1 January 1994) is filed both under
  [`apost_letters/1994`](https://www.vatican.va/content/john-paul-ii/it/apost_letters/1994.index.html)
  and under `motu_proprio`. One act, two shelves: one records the genre, the other how it was
  issued.
- The harvest already knew this and had nowhere to put it. `SHELF_SPECIFICITY` ranks
  `apost_letters` above `motu_proprio`, so a document filed on both keeps `apost_letters` and
  records the other filing only as `source.alsoShelvedAs: ["motu_proprio"]`. Measured on the
  corpus before this change: **66** apostolic letters were in that position (55 Francis, 6 Leo XIV,
  4 Paul VI, 1 John Paul II — *Socialium Scientiarum*). For all 66 the motu proprio fact survived
  nowhere but in a provenance field.

## 3. Decision

The repository owner decided the open questions in #10 before this spec was written; they are
recorded here, not re-argued.

1. **Open question 1 → option (b).** `genre.allowedCharacteristics` (an array) is added to the
   genre schema and to `data/genres.json`. A new validation invariant checks every
   `document.characteristics` entry against its genre's `allowedCharacteristics`, mirroring how
   `issuerTypes` constrains `document.issuerType` (invariant 17). Validation stays local to the
   data: the allow-list is read from the genre row, not from code.
2. **Open question 2** (the juridical tail of `apostolic-letter`) is handled separately
   (`actKind`, #15) and is not touched here.
3. **Migration** is by the harvester's mapping, never by editing `data/documents/*.json`, which
   is regenerated: `'motu proprio'` and `'motu_proprio'` now map to
   `{ genre: 'apostolic-letter', characteristics: ['motu-proprio'] }`.

### 3.1 Schema

- `schema/genre.schema.json`: optional `allowedCharacteristics: string[]`, `uniqueItems`, items
  drawn from the characteristics vocabulary. A genre row without the field allows none.
- `schema/document.schema.json`: the `characteristics` enum becomes `apostolic-constitution` ·
  `dogmatic-definition` · `motu-proprio`, and its description no longer says "a papal bull may
  bear". The `dogmatic-definition` backing requirement is kept verbatim. The vocabulary is
  deliberately flat: the schema says what a characteristic *is*, the genre row says who may bear
  it, and invariant 22 joins the two.

### 3.2 Data

`data/genres.json` loses the `motu-proprio` row (16 rows → 15). `papal-bull` gains
`allowedCharacteristics: ["apostolic-constitution", "dogmatic-definition"]`; `apostolic-letter`
gains `allowedCharacteristics: ["motu-proprio"]`. Row order and every description are otherwise
unchanged — the `apostolic-letter` and `letter` descriptions had just been rewritten (#22) and
are kept as they were; the new field carries the fact on its own.

### 3.3 Harvester

Two changes in `toDocument`, both reading shelves only, never heading wording:

1. The mapping above, so a record kept from the `motu_proprio` shelf lands on
   `apostolic-letter` with the characteristic.
2. When `item.alsoShelvedAs` includes `motu_proprio`, `motu-proprio` is added to
   `characteristics`. This is what rescues the 66 records of §2. The array is built as a set,
   sorted, and only written when non-empty, so the harvest is reproducible whichever shelf won
   the merge.

`SHELF_SPECIFICITY` is untouched: the shelf still exists and the rank list still names it.
`BARE_GENRE_SLUGS` in `incipit-rules.ts` still lists `'motu-proprio'` — that is the slug of a
heading residue, not the genre id, and is unaffected. `GENRE_OVERRIDES`, `corrections.ts`,
`recovered-incipits.ts` and `adjudicated-distinct.ts` key on shelf names (`motu_proprio`) and
never on the genre id, so none of them changes.

### 3.4 Invariant 22

**Characteristics allowed by genre.** Every entry of `document.characteristics`, when `genre` is
non-null, is one of that genre's `allowedCharacteristics` in `data/genres.json`; a genre row
without the field allows none. Not evaluated for an unknown genre (invariant 15 already reports
it) nor for a null genre (there is no row to consult).

Checked against the real corpus: with `apostolic-letter`'s allow-list removed, the rule reports
exactly 276 violations (the 210 + 66 bearers below) and nothing else; with the committed
`genres.json`, zero.

## 4. Blast radius

Measured on the committed data before and after `npm run harvest`, 4285 documents throughout.

| | before | after |
|---|---|---|
| documents with `genre: "motu-proprio"` | **210** (11 pontificates) | **0** |
| documents with `genre: "apostolic-letter"` | 1920 | **2130** (+210) |
| `apostolic-letter` with `alsoShelvedAs` containing `motu_proprio` | 66 | 66 |
| documents bearing `characteristics: ["motu-proprio"]` | 0 | **276** (210 + 66) |
| genre rows | 16 | 15 |
| `registry/documents/by-genre/motu-proprio.md` | present | removed by the renderer |
| documents whose id changed | — | **39**, all provisional |
| documents with any other field change | — | 0 |

The 210 by pontificate: Paul VI 45, Pius X 38, John Paul II 30, Francis 22, John XXIII 14,
Pius XI 14, Benedict XVI 13, Benedict XV 11, Pius XII 11, Leo XIII 10, Leo XIV 2. All 210 carry
`sourceGenreLabel: "motu_proprio"`, so the shelf they came from is still visible on every record.

### 4.1 Re-minted provisional ids

A provisional id is `mag:{issuer}/{genre-slug}-{YYYY}-{MM}-{DD}[-{n}]`, so migrating the genre
re-mints it; provisional ids are re-mintable by design (identifiers spec §3.5). Minted ids embed
the incipit, not the genre, and none changed. 37 of the 210 were provisional; all 37 re-mint:

| old | new |
|---|---|
| `mag:benedict-xvi/motu-proprio-2005-06-28` | `mag:benedict-xvi/apostolic-letter-2005-06-28` |
| `mag:benedict-xvi/motu-proprio-2007-06-11` | `mag:benedict-xvi/apostolic-letter-2007-06-11` |
| `mag:benedict-xvi/motu-proprio-2010-12-30` | `mag:benedict-xvi/apostolic-letter-2010-12-30` |
| `mag:benedict-xvi/motu-proprio-2013-02-22` | `mag:benedict-xvi/apostolic-letter-2013-02-22` |
| `mag:francis-i/motu-proprio-2013-08-08` | `mag:francis-i/apostolic-letter-2013-08-08` |
| `mag:francis-i/motu-proprio-2016-06-04` | `mag:francis-i/apostolic-letter-2016-06-04` |
| `mag:francis-i/motu-proprio-2016-08-17` | `mag:francis-i/apostolic-letter-2016-08-17-2` |
| `mag:francis-i/motu-proprio-2018-11-25` | `mag:francis-i/apostolic-letter-2018-11-25` |
| `mag:francis-i/motu-proprio-2020-03-16` | `mag:francis-i/apostolic-letter-2020-03-16` |
| `mag:francis-i/motu-proprio-2022-08-01` | `mag:francis-i/apostolic-letter-2022-08-01` |
| `mag:francis-i/motu-proprio-2022-09-03` | `mag:francis-i/apostolic-letter-2022-09-03` |
| `mag:francis-i/motu-proprio-2023-01-06` | `mag:francis-i/apostolic-letter-2023-01-06` |
| `mag:francis-i/motu-proprio-2023-07-04` | `mag:francis-i/apostolic-letter-2023-07-04` |
| `mag:francis-i/motu-proprio-2023-08-01` | `mag:francis-i/apostolic-letter-2023-08-01` |
| `mag:francis-i/motu-proprio-2023-09-14` | `mag:francis-i/apostolic-letter-2023-09-14` |
| `mag:francis-i/motu-proprio-2024-01-16` | `mag:francis-i/apostolic-letter-2024-01-16-1` |
| `mag:francis-i/motu-proprio-2024-07-01` | `mag:francis-i/apostolic-letter-2024-07-01` |
| `mag:john-paul-ii/motu-proprio-1978-12-13` | `mag:john-paul-ii/apostolic-letter-1978-12-13` |
| `mag:john-paul-ii/motu-proprio-1989-01-01` | `mag:john-paul-ii/apostolic-letter-1989-01-01` |
| `mag:john-paul-ii/motu-proprio-1989-07-01` | `mag:john-paul-ii/apostolic-letter-1989-07-01` |
| `mag:john-paul-ii/motu-proprio-2000-11-26` | `mag:john-paul-ii/apostolic-letter-2000-11-26` |
| `mag:john-paul-ii/motu-proprio-2003-12-15` | `mag:john-paul-ii/apostolic-letter-2003-12-15` |
| `mag:john-paul-ii/motu-proprio-2004-11-26` | `mag:john-paul-ii/apostolic-letter-2004-11-26` |
| `mag:john-xxiii/motu-proprio-1959-02-22` | `mag:john-xxiii/apostolic-letter-1959-02-22` |
| `mag:john-xxiii/motu-proprio-1960-07-25` | `mag:john-xxiii/apostolic-letter-1960-07-25` |
| `mag:john-xxiii/motu-proprio-1961-03-10` | `mag:john-xxiii/apostolic-letter-1961-03-10` |
| `mag:john-xxiii/motu-proprio-1962-02-02` | `mag:john-xxiii/apostolic-letter-1962-02-02` |
| `mag:john-xxiii/motu-proprio-1962-04-11` | `mag:john-xxiii/apostolic-letter-1962-04-11` |
| `mag:john-xxiii/motu-proprio-1962-04-15` | `mag:john-xxiii/apostolic-letter-1962-04-15` |
| `mag:john-xxiii/motu-proprio-1962-08-06` | `mag:john-xxiii/apostolic-letter-1962-08-06` |
| `mag:john-xxiii/motu-proprio-1962-09-05` | `mag:john-xxiii/apostolic-letter-1962-09-05` |
| `mag:john-xxiii/motu-proprio-1962-09-11` | `mag:john-xxiii/apostolic-letter-1962-09-11` |
| `mag:john-xxiii/motu-proprio-1962-10-01` | `mag:john-xxiii/apostolic-letter-1962-10-01` |
| `mag:paul-vi/motu-proprio-1966-01-03` | `mag:paul-vi/apostolic-letter-1966-01-03` |
| `mag:pius-x/motu-proprio-1904-04-25` | `mag:pius-x/apostolic-letter-1904-04-25` |
| `mag:pius-x/motu-proprio-1911-06-28` | `mag:pius-x/apostolic-letter-1911-06-28` |
| `mag:pius-xi/motu-proprio-1929-06-07` | `mag:pius-xi/apostolic-letter-1929-06-07` |

### 4.2 Ordinal changes

Two of the 37 land on a date that already held a provisional apostolic letter, so invariant 20
re-densifies the group. Two pre-existing ids therefore gain an ordinal, which is the other two of
the 39 id changes. Ordinals are assigned in codepoint title order (`ordinals.ts`):

| group | member (title, shelf) | old id | new id |
|---|---|---|---|
| Francis, 2016-08-17 | *Lettera Apostolica in forma di 'Motu Proprio' con la quale si istituisce il Dicastero per il Servizio dello Sviluppo Umano Integrale* (`apost_letters`) | `…/apostolic-letter-2016-08-17` | `…/apostolic-letter-2016-08-17-1` |
| | *Statuto del Dicastero per il Servizio dello Sviluppo Umano Integrale* (`motu_proprio`) | `…/motu-proprio-2016-08-17` | `…/apostolic-letter-2016-08-17-2` |
| Francis, 2024-01-16 | *Decreto del Sommo Pontefice Francesco relativo alla pubblicazione di provvedimenti normativi nello Stato della Città del Vaticano* (`motu_proprio`) | `…/motu-proprio-2024-01-16` | `…/apostolic-letter-2024-01-16-1` |
| | *Lettera Apostolica in forma di Motu Proprio circa i limiti e le modalità dell'ordinaria amministrazione* (`apost_letters`) | `…/apostolic-letter-2024-01-16` | `…/apostolic-letter-2024-01-16-2` |

Both pairs were adjudicated distinct before this change (`adjudicated-distinct.ts`) and remain
so; only their ids move.

## 5. Rendering

The renderer prints no characteristics anywhere — the by-genre, by-issuer and by-keyword tables
have no column for them, and `apostolic-constitution` has never appeared in a rendered view
either. No column is added in this change; the by-genre `apostolic-letter` page simply grows by
210 rows and the `motu-proprio` page disappears (`render/run.ts` regenerates the tree from
scratch, so no stale file needs removing by hand).

## 6. What the measurement shows about the shelves

Two things surfaced while counting that are worth recording. Neither is acted on here — both
would be a heading-based judgment, and this registry's rule for genre corrections
(`genre-overrides.ts`) is that nothing is inferred from a heading's wording.

- **12 apostolic letters whose heading prints "in forma di Motu Proprio" sit on `apost_letters`
  only** (Benedict XVI 6, Francis 4, John XXIII 2 — e.g. *Ecclesiae unitatem* 2009, *Omnium in
  mentem* 2009, *Maiora in Dies* 1959) and so bear no characteristic. The shelf did not record the
  mode of issuance for them; the heading does. A curated table quoting each heading could add
  the characteristic later, and invariant 22 would accept it.
- **21 records on the `motu_proprio` shelf (or twice-shelved with it) have headings naming a
  different instrument** — *Statuto …* (7), *Decreto …* (8), *Regolamento …* (3), *Norme …* (2),
  a *Rescriptum ex audientia* (1) — all Francis and Leo XIV. They were `genre: "motu-proprio"`
  before and are `apostolic-letter` + `motu-proprio` now; the shelf is the only thing either
  classification ever rested on, and `sourceGenreLabel` still says which shelf. Whether any of
  them warrants a `GENRE_OVERRIDES` row is an editorial question about statutes and decrees, not
  about motu proprio, and is left open.

## 7. Validation

Beyond invariant 22 itself:

1. `npm run check` passes: 506 tests, `tsc --noEmit` clean, 4285 documents and 4 assessments
   with 0 failures.
2. `npm run harvest && npm run render && git diff --exit-code data/ registry/` is clean after the
   commit — the committed data is exactly what the pipeline produces.
3. `harvest-data.test.ts` pins the counts: no document has `genre: "motu-proprio"`; all 210
   `motu_proprio`-labelled records are `apostolic-letter` with the characteristic; all 66
   `alsoShelvedAs: motu_proprio` records carry it; exactly 276 bear it in total.
4. `genres-data.test.ts` pins the fifteen rows and the two allow-lists, and rejects an
   `allowedCharacteristics` entry outside the vocabulary.
5. Unit tests cover the two mapping keys, the `alsoShelvedAs`-derived characteristic (including
   deduplication and a non-`motu_proprio` second shelf), the provisional id re-mint, and
   invariant 22's pass, fail, no-field, unknown-genre and null-genre cases.

## 8. Out of scope

- **A second characteristic or `actKind` for the juridical tail of `apostolic-letter`** — #15.
- **Heading-derived characteristics** for the 12 letters of §6.
- **Reclassifying the statutes, decrees and regulations of §6.**
- **A rendered characteristics column.**
