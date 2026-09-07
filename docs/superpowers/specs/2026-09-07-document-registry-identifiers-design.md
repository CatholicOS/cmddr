# Document Registry: Identifier Scheme and Harvest Design

*Design spec — 2026-09-07*

## 1. Purpose

CMDDR has a genre registry (Table 1) and an assessment model (Table 2), but no registry of
concrete **documents**. This spec defines:

1. how a document identifier is minted, and
2. how the initial document set is harvested from vatican.va.

It covers a **pilot** of three pontificates — Benedict XIV, Pius IX, Leo XIII — chosen because they
span both shapes of the vatican.va site and contain the hardest identifier cases. Scaling to the
remaining pontificates is deliberately out of scope until the scheme has been proved against them.

## 2. Evidence base

All findings below were verified against live vatican.va pages on 2026-09-07 and are the reason the
scheme takes the shape it does.

### 2.1 Two site shapes, breaking at Leo XIII

| Era | Shape | Example |
|---|---|---|
| Benedict XIV → Pius IX | One flat, reverse-chronological list on the pope's landing page; the genre is a word in the link text | `pius-ix/it/documents/enciclica-ubi-primum-2-febbraio-1849.html` |
| Leo XIII → present | Per-genre *shelves* (`encyclicals.index.html`, `bulls.index.html`, …), and for modern popes further per-year sub-indexes | `leo-xiii/it/encyclicals/documents/hf_l-xiii_enc_04081879_aeterni-patris.html` |

Document counts: Benedict XIV 43, Pius IX 77, Leo XIII 275 across 8 shelves. **Pilot corpus: 395
raw items**, several of which are the same document filed on two shelves (§5.1, §6) — the harvested
corpus after dedupe is smaller. By contrast Francis's landing page alone fronts 298 index pages over
several thousand items, which is why the pilot stops where it does.

### 2.2 Incipits collide, including within a single pontificate

*Ubi Primum* alone is borne by:

| Issuer | Date | Genre |
|---|---|---|
| Benedict XIV | 1740-12-03 | Encyclical |
| Pius IX | 1847-06-17 | Encyclical |
| Pius IX | 1849-02-02 | Encyclical |
| Leo XIII | 1878-03-28 | Allocution |
| Leo XIII | 1898-10-02 | Apostolic Constitution |

Five documents, three pontificates, four genres. Pius IX's two are the decisive case: **same issuer,
same genre, same incipit**. Neither `incipit`
nor `issuer + incipit` nor `issuer + genre + incipit` is a unique key. Pius IX also has
*Singulari Quidem* ×2 and *Multiplices Inter* ×2 (an allocution of 1865, a bull of 1870).

The Holy See's own slugs solve this with a date: `hf_l-xiii_enc_`**`04081879`**`_aeterni-patris`.

### 2.3 Every pilot document has an incipit; not every incipit is Latin

All 395 raw pilot items carry an incipit — there are **zero** date-only or nameless entries, including
Leo XIII's 18 recorded speeches. But incipits occur in the vernacular at every level of solemnity:
Leo XIII's encyclicals *Depuis Le Jour* (fr) and *Spesse Volte* (it); Pius IX's *La Serie*;
Leo XIII's allocution *Colle Espressioni*.

The operative property is therefore not "is in Latin" but **"is conventionally named by its opening
words."**

### 2.4 The two eras expose the incipit differently

**Flat era** wraps the incipit in `<i>`:

```html
<li><div class="item">
  <h2><a href="/content/benedictus-xiv/it/documents/bolla--i-benedictus-deus--i---25-dicembre-1750--estensione-a-tut.html">
      Bolla <i>Benedictus Deus</i> (25 dicembre 1750) </a></h2>
  <div class="translation-field"><span class="translation"><a href="…">IT</a></span></div>
</div></li>
```

The `<i>` element delimits the incipit exactly. Benedict XIV's URL slugs are truncated at ~60
characters and contain collapsed markup (`<i>` → `--i-`), because the slug is generated *from* this
text.

**Shelf era has no `<i>` element.** The incipit is the `<h2>` text with the trailing date
parenthetical stripped:

```html
<h2><a href="…/hf_l-xiii_enc_05091895_adiutricem.html"> Adiutricem populi (5 settembre 1895) </a></h2>
<h2>Dum Multa (24 dicembre 1902)</h2>
```

Two consequences, both load-bearing:

1. **The shelf slug abbreviates the incipit and must never be minted from.** `_adiutricem` is
   *Adiutricem populi*; `_insignes` is *Insignes Deo*; `_longinqua` is *Longinqua oceani*;
   `_caritatis` is *Caritatis providentiaeque*. Minting from the slug would yield
   `mag:leo-xiii/adiutricem-1895` and fail invariant 12 (§6).
2. **The `<h2>` is often not a link.** Of Leo XIII's 86 encyclical items, 65 link from the `<h2>`
   and 21 link only from `.translation-field`; **none** lacks a link entirely. The URL and its slug
   must be resolved with `.translation-field a` as fallback.

So for both eras: **parse the DOM text, never the URL slug.**

Printed dates carry two irregularities, exhaustively enumerated across all eight shelves: the
ordinal first-of-month `1°` (10 occurrences, e.g. *Tametsi Futura Prospicientibus* — `1° novembre
1900`) and a single place prefix, `Non mediocri (Roma, 25 ottobre 1893)`.

### 2.5 Conciliar documents are filed under popes

Pius IX's page hosts `constitutio-dogmatica-dei-filius-24-aprilis-1870` and
`constitutio-dogmatica-pastor-aeternus-18-iulii-1870`. Both are **First Vatican Council** documents.
Issuer must never be inferred from the page a document was found on.

### 2.6 Pius IX uses genres Table 1 does not define

*Decreto*, *Proclama*, *Protesta*, *Editto* have no row in the Genre Registry.

## 3. Identifier scheme (normative)

### 3.1 Canonical form

```
mag:{issuer}/{incipit-slug}-{year}
```

The prefix is `mag:` (magisterial document), parallel to CRPDR's `rp:` and COECDR's `oec:`.
`md:` was rejected as badly overloaded (Markdown, Moldova, Maryland).

| Segment | Rule |
|---|---|
| `{issuer}` | The **local part** of the issuer's registry id, verbatim: `rp:leo-xiii` → `leo-xiii`; `oec:vatican-ii` → `vatican-ii`. |
| `{incipit-slug}` | `slugify(incipit)` — see §3.3. The incipit is taken as the Holy See names it, at its conventional length (`rerum-novarum`, but `tametsi-futura-prospicientibus`). |
| `{year}` | Four-digit year of `date`. **Always present**, including for documents that collide with nothing. |

Examples:

```
mag:leo-xiii/rerum-novarum-1891
mag:leo-xiii/depuis-le-jour-1899
mag:pius-ix/ubi-primum-1847
mag:pius-ix/ubi-primum-1849
mag:vatican-i/pastor-aeternus-1870
mag:vatican-ii/gaudium-et-spes-1965
```

### 3.2 Two rules that follow from §2

**The namespace is always the issuer, never the promulgator.** *Gaudium et Spes* was issued by the
Second Vatican Council and promulgated by Paul VI; it is `mag:vatican-ii/gaudium-et-spes-1965`, with
Paul VI recorded in the existing `promulgatedBy` field. Putting the promulgating pope in the id would
duplicate a field *and* misattribute the act. The same rule assigns *Pastor Aeternus* to
`mag:vatican-i/`, not to Pius IX.

**The year is unconditional.** A discriminator added only on collision would mean that discovering a
new document could force an existing id to change, or that first-come-first-served decides who keeps
the bare name. Both are unacceptable for an identifier other repositories will reference. The cost is
a redundant year on documents that never collide; the benefit is that every id is mechanically
derivable and permanent.

### 3.3 Slug normalisation

`slugify(s)`:

1. Unicode NFD normalise.
2. Strip combining marks (`U+0300`–`U+036F`).
3. Fold remaining non-decomposable letters: `æ`→`ae`, `œ`→`oe`, `ø`→`o`, `ß`→`ss`, `đ`→`d`, `ł`→`l`.
4. Lowercase.
5. Replace every run of `[^a-z0-9]+` with a single `-` (this maps spaces, apostrophes, commas and
   elisions uniformly).
6. Trim leading and trailing `-`.

The function must be **round-trippable**: `slugify(document.incipit)` must equal the slug segment of
`document.id`. This is enforced as invariant 12 (§6), which prevents an id drifting from the incipit
it is supposed to name.

### 3.4 Collision rule

If two documents share issuer, incipit-slug **and** year, **both** ids extend to the full date:

```
mag:{issuer}/{incipit-slug}-{YYYY}-{MM}-{DD}
```

Both change, so neither id depends on discovery order. No instance exists in the pilot corpus; the
branch is enforced by invariant 11 rather than exercised by data.

Regex for a minted id:

```
^mag:[a-z0-9-]+/[a-z0-9]+(?:-[a-z0-9]+)*-\d{4}(?:-\d{2}-\d{2})?$
```

### 3.5 Provisional identifiers (the "to be determined" shelf)

Genres with no conventional incipit — Angelus addresses, general audiences, dated homilies — receive
a provisional id:

```
mag:{issuer}/{genre-slug}-{YYYY}-{MM}-{DD}[-{n}]
```

`{n}` is a 1-based ordinal, present only when more than one document of that genre shares a date.
Example: `mag:francis-i/angelus-2015-03-22`.

Regex for a provisional id:

```
^mag:[a-z0-9-]+/[a-z0-9]+(?:-[a-z0-9]+)*-\d{4}-\d{2}-\d{2}(?:-\d+)?$
```

Note that a provisional id without an ordinal is structurally indistinguishable from a minted id that
took the full-date form under §3.4. The two are never confused in practice because `idStatus` selects
which pattern applies and is authoritative; no consumer should infer status from the id's shape.

The distinction is a **stability guarantee**, recorded in `document.idStatus`:

| `idStatus` | Meaning |
|---|---|
| `minted` | Permanent. Never revised. |
| `provisional` | May be re-minted if a conventional name is established for the document. |

The "shelf" is therefore a queryable state (`idStatus = provisional`), not a separate store. It has
**zero members in the pilot corpus** and is defined now so that expanding scope to incipit-less
genres needs no schema change.

## 4. Schema changes

### 4.1 `schema/document.schema.json`

| Field | Change |
|---|---|
| `id` | Pattern widens from `^[A-Za-z0-9._-]+$` to the two forms of §3.4/§3.5, selected by `idStatus` via `if`/`then` (the style already used in these schemas). Values change from `EV` to `mag:john-paul-ii/evangelium-vitae-1995`. |
| `issuerId` | **Now carries the registry prefix**: `john-paul-ii` → `rp:john-paul-ii`; councils → `oec:vatican-i`. Pattern `^(rp\|oec):[a-z0-9-]+$`. |
| `promulgatedBy` | Same prefixing: `paul-vi` → `rp:paul-vi`. |
| `genre` | Becomes nullable. `null` means the source genre has no Genre Registry row yet (§2.6); `sourceGenreLabel` preserves the raw label. |
| `incipit` | **New, required for `idStatus: minted`.** The incipit as printed, unnormalised: `"Rerum Novarum"`, `"Depuis Le Jour"`. |
| `incipitLang` | **New, optional.** ISO 639-1: `la`, `it`, `fr`, … Records that vernacular incipits are first-class. |
| `idStatus` | **New.** `minted` \| `provisional`, default `minted`. |
| `sigla` | **New, optional.** `EV`, `LG`, `GS` — display and human citation only, never a key. Most documents have none, so it cannot be required. |
| `sourceGenreLabel` | **New, optional.** The genre label exactly as vatican.va prints it (`Enciclica`, `Protesta`, `Costituzione dogmatica`). |
| `source` | **New, optional.** `{ url, shelf, languages[], retrieved }` — harvest provenance, so every row traces to a page. |
| `aliases` | Description narrows to alternative *titles* (`"The Gospel of Life"`); incipits now have their own field. |

### 4.2 `schema/assessment.schema.json`

The locus separator becomes `#`, because `evangelium-vitae-1995-62` cannot be parsed — `62` is
indistinguishable from part of the date.

```
id:       mag:john-paul-ii/evangelium-vitae-1995#62
document: mag:john-paul-ii/evangelium-vitae-1995
section:  "62"
```

A document-wide assessment uses `section: "*"` and id `{document.id}#*`, replacing
`{DOCUMENT_ID}-general`.

### 4.3 `data/genres.json` (new)

Table 1 of the README exists only as prose. Invariant 15 ("`genre` resolves to a registry id")
requires it as data, so this spec includes transcribing Table 1 verbatim into `data/genres.json`,
validated by the existing `schema/genre.schema.json`. This is mechanical transcription of already
published and argued content — it introduces no new genre and changes no default or ceiling.

### 4.4 Documents to update

- `SCHEMA.md` — rewrite §"The `locus` identifier convention"; add §"Identifier minting" (§3 above);
  extend the invariants list.
- `README.md` — Table 2 loci (`EV-57` → `mag:john-paul-ii/evangelium-vitae-1995#57`).
- `examples/evangelium-vitae.json` — re-key to the new document id, prefixed `issuerId`, `#` loci.

## 5. Harvest pipeline

### 5.1 Adapters

Both eras share the `div.item` container; field extraction differs substantially.

| | Flat era (Benedict XIV, Pius IX) | Shelf era (Leo XIII) |
|---|---|---|
| Entry point | `content/{slug}/it.html` | 8 × `content/{slug}/it/{shelf}.index.html` |
| Genre | text node before `<i>` | the shelf (1:1 with its code) |
| Incipit | `<i>` content | `<h2>` text minus the trailing `(date)` — **never the slug**, which abbreviates (§2.4) |
| URL | `<h2> > a[href]` | `<h2> > a[href]`, falling back to `.translation-field a[href]` — 21 of 86 encyclicals |
| Date | trailing `(2 febbraio 1849)`; **both** Italian and Latin month vocabularies occur (`18 iulii 1870`) | `DDMMYYYY` from the resolved slug; the printed parenthetical is the cross-check |
| Dedupe | by href | by slug tail `{DDMMYYYY}_{slug}`; language variants inflate raw link counts 3–4× |
| Languages | `.translation-field a` text | idem |

Shelf codes, confirmed 1:1: `apost_constitutions`→`apc`, `apost_letters`→`apl`, `briefs`→`brief`,
`bulls`→`bulls`, `encyclicals`→`enc`, `letters`→`let`, `motu_proprio`→`motu-proprio`,
`speeches`→`speeches`.

### 5.2 Mapping tables (checked in, hand-curated)

**Pope slug → CRPDR id.** vatican.va slugs do not match CRPDR ids: `benedictus-xiv` → `rp:benedict-xiv`,
`pius-ix` → `rp:pius-ix`, `leo-xiii` → `rp:leo-xiii`.

**Source genre → `genre.id`.**

| Source label / code | `genre.id` | Notes |
|---|---|---|
| Enciclica / `enc` | `encyclical` | |
| Bolla / `bulls` | `papal-bull` | |
| Breve / `brief` | `brief` | |
| Lettera, Epistola / `let` | `letter` | |
| Litterae Apostolicae, Lettera Apostolica / `apl` | `apostolic-letter` | |
| Costituzione Apostolica / `apc` | `papal-bull` | plus characteristic `apostolic-constitution` — per README, apostolic constitution is a *characteristic*, not a genre |
| Motu Proprio / `motu-proprio` | `motu-proprio` | |
| Allocuzione, Allocutio, Discorso / `speeches` | `discourse-address` | |
| Costituzione dogmatica | `constitution` | conciliar; `descriptiveTitle: dogmatic`; issuer is a council |
| Decreto, Proclama, Protesta, Editto | `null` | §2.6 — `sourceGenreLabel` preserved |

Leaving the last row unmapped is deliberate. Adding Genre Registry rows requires arguing each from
the act, which the README explicitly demands and which the existence of a vatican.va shelf does not
by itself supply. Harvesting them with `genre: null` lands the data without forcing a premature
taxonomy decision.

### 5.3 Manual review step

Two pilot documents — *Dei Filius* and *Pastor Aeternus* — are reassigned from `rp:pius-ix` to
`oec:vatican-i` with `promulgatedBy: rp:pius-ix` (§2.5). The harvester flags candidates by genre
(`Costituzione dogmatica` / conciliar genres) and a human confirms; the reassignment is recorded in
the checked-in mapping, not inferred at run time.

### 5.4 Repository layout

Mirrors the sibling registries' `registry/*.md` + `data/*.json` split.

```
data/genres.json                      # Table 1 as data (§4.3)
data/documents/{issuer-local}.json    # per issuer, chronological — keeps diffs reviewable
registry/documents.md                 # generated table, in the style of registry/pontiffs.md
tools/harvest/                        # adapters, mapping tables, HTML fixtures
```

`registry/documents.md` and `data/documents/*.json` are generated; both are regenerated by one npm
script and never hand-edited.

## 6. Validation

CI enforces the following, in addition to SCHEMA.md's existing invariants 1–7.

| # | Rule |
|---|---|
| 8 | `id` matches the form required by its `idStatus` (§3.4, §3.5), and is globally unique. |
| 9 | The id's namespace segment equals the local part of `issuerId`. |
| 10 | The id's year equals the year of `date`. |
| 11 | No two documents share (issuer, incipit-slug, year) unless **both** carry the full-date form. |
| 12 | `slugify(incipit)` equals the id's slug segment (round-trip). |
| 13 | `issuerId` and `promulgatedBy` resolve against vendored copies of the CRPDR and COECDR id lists. |
| 14 | An assessment's `id` is `{document}#{section}`, and `document` names an existing document. |
| 15 | `genre`, when non-null, resolves to an id in `data/genres.json`; when null, `sourceGenreLabel` is present. |
| 16 | `issuerId` begins with `oec:` **iff** `issuerType = ecumenical-council`. |
| 17 | `issuerType`, when `genre` is non-null, is one of that genre's `issuerTypes` in `data/genres.json`. |

Parser tests run against checked-in HTML fixtures, so they are offline and deterministic: a
vatican.va redesign fails a test rather than silently corrupting a harvest. Fixtures are the ten
pages already retrieved: the two flat-era pontiff landing pages and the eight Leo XIII shelf indexes.

## 7. Toolchain

Node + TypeScript. `cheerio` for DOM parsing, `ajv` for JSON Schema validation — ajv is the reference
implementation for draft 2020-12, which the existing schemas already target. This is the repository's
first executable code; it introduces `package.json`, `tsconfig.json` and a `tools/` tree, leaving the
existing data and schema files' layout untouched.

## 8. Out of scope

- Pontificates outside the pilot trio.
- Incipit-less genres (Angelus, audiences, homilies). The provisional-id mechanism exists for them;
  no such documents are harvested.
- Full document text and translations. Only the available language codes are recorded, in
  `source.languages`.
- Table 2 assessments for harvested documents. Assessments remain hand-curated and interpretive; the
  harvest produces documents only.
- New Genre Registry rows for *Decreto*, *Proclama*, *Protesta*, *Editto* (§5.2).
