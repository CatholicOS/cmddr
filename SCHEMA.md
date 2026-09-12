# CMDDR Data Schema

This document specifies the machine-readable model behind the two tables in the [README](README.md). It defines three entities
and how they relate:

```
Genre  (1) ──────< (n)  Document  (1) ──────< (n)  Assessment
registry of              individual                 discerned authority of a
document TYPES           documents                  passage within a document
```

- **Genre** — a document / speech *type* (Encyclical, Decree, …). Carries the *default register*, the *ceiling*, the roles that may issue it (`issuerTypes`) and the characteristics its documents may bear (`allowedCharacteristics`). → [`schema/genre.schema.json`](schema/genre.schema.json)
- **Document** — one concrete document (e.g. *Evangelium Vitae*). References a `genre`. → [`schema/document.schema.json`](schema/document.schema.json)
- **Assessment** — the authority actually exercised in a single passage, keyed by a `locus`. References a `document`. → [`schema/assessment.schema.json`](schema/assessment.schema.json)

A **Genre** row alone fully describes documents that contain no definitive teaching. Doctrinally weighty documents additionally get
one **Assessment** per notable passage. A document whose operative act is not teaching — a blessing, an act of governance — says so
with `actKind`; the act itself is then not a statement Table 2 assesses, and the genre's default register does not describe it.
Any passage in such a document that does teach — the address before an Urbi et Orbi blessing, a doctrinal preamble — is still
assessed per statement, exactly as anywhere else.

---

## Controlled vocabularies

**`issuerType`** (role/capacity) — `ecumenical-council` · `pope` · `bishop`. Used by `document.issuerType` (the role that issued it) and by `genre.issuerTypes` (the roles that may issue the genre). The issuer's *identity* (e.g. `rp:john-paul-ii`) is carried separately in `document.issuerId`. When a pope promulgates a document issued by another authority — chiefly a conciliar constitution — the promulgating pope is recorded in the optional `document.promulgatedBy` (e.g. `rp:paul-vi`), which does not change `issuerType`.

**`scope`** — `universal` · `local`. Juridical reach of the act (whom it binds), not its addressee: *Ordinatio Sacerdotalis* is addressed to the bishops and universal in scope, while the *Letter to Artists* is addressed to everyone and binds no one. `document.scope` overrides `genre.defaultScope`; an omitted `scope` is not materialised — it means the genre default applies, and the harvester never writes one because vatican.va gives it no evidence for it. For an `apostolic-letter`, whose genre spans universal teaching and local governance, it is expected to be set per document rather than inherited. A non-juridical scope is **not representable**: the vocabulary allows only `universal` and `local`, so the *Letter to Artists* currently inherits `letter`'s default and reads as `local`. That is a known limitation of the model, not a claim about the document; representing it, recording the addressee, and a possible `regional` value are all deferred to [#4](https://github.com/CatholicOS/cmddr/issues/4).

**`characteristics`** (non-exclusive document-level metadata a genre row *allows*) — `apostolic-constitution` · `dogmatic-definition` · `motu-proprio`. The vocabulary is flat; which genre may bear which is declared per genre in `genre.allowedCharacteristics` (`papal-bull` allows the first two, `apostolic-letter` the third; a genre row without the field allows none) and enforced by invariant 22. A document may carry none, one, or several of the characteristics its genre allows (e.g. *Munificentissimus Deus* carries both bull characteristics; *Socialium Scientiarum* carries `motu-proprio`). `motu-proprio` records a mode of issuance — the pope acting on his own initiative — not a genre, and makes no authority claim.

**`descriptiveTitle`** (optional, mutually-exclusive title of a conciliar Constitution) — `dogmatic` · `pastoral`. Descriptive of purpose only, never a claim of authority; omit for a plain constitution (e.g. *Sacrosanctum Concilium*).

**`keywords`** (optional, non-exclusive descriptive subject tags, resolving against `data/keywords.json`) — currently `circumscription-erection`, `circumscription-elevation` and `circumscription-union`. Unlike `characteristics`, a keyword is **never authority-bearing**: it makes no claim about the document's register, definitiveness, or solemn form, and no invariant other than vocabulary membership (invariant 21) ever reads it.

**`actKind`** (optional) — `teaching` · `governance` · `liturgical`. What kind of act the document is; absent means `teaching`. A `governance` act erects a diocese, proclaims a patron or approves statutes; a `liturgical` act is a rite or blessing (an Urbi et Orbi). The operative act of a non-teaching document is not a statement Table 2 assesses, and the genre's default register does not describe it; a passage in such a document that does teach (the address before an Urbi et Orbi blessing) is assessed per statement as usual, so the flag never forbids an Assessment. Like `keywords`, `actKind` is **never authority-bearing**: it makes no claim about register or definitiveness, and no invariant reads it — the schema enum is its only check, and no rule couples it to a genre, a ceiling or an Assessment (a sanity note, deliberately not an invariant). The harvester derives it from the keyword pipeline, the single evidenced source: every document carrying a circumscription keyword is `governance`. See [#15](https://github.com/CatholicOS/cmddr/issues/15).

**`series`** (optional object `{ "id", "ordinal"? }`, with `id` resolving against `data/series.json`) — membership in a numbered or dated annual series: the World Day of Peace, World Communications Day, the Lent message. `id` is the occasion, taken from vatican.va's own message sub-shelf slugs (`peace`, `lent`, `communications`, …); `ordinal` (integer ≥ 1) is the document's number within the series as the source prints it, omitted for a series that is dated but not numbered. Each vocabulary row records whether the series is `numbered` and the shelf evidence for saying so. `series` is discovery metadata with **no bearing on register, ceiling or assent**, and no invariant other than vocabulary membership (invariant 23) reads it. See [#16](https://github.com/CatholicOS/cmddr/issues/16).

**`register`** (mode of teaching)
| id | label |
|---|---|
| `extraordinary` | Extraordinary — solemn judgment / definition |
| `ordinary-universal` | Ordinary and Universal Magisterium |
| `authentic-ordinary` | Authentic Ordinary (non-definitive) magisterium |

**`intent`** — `definitive` · `non-definitive`

**`object`** (only meaningful when `intent = definitive`)
| id | label |
|---|---|
| `revealed` | Primary object — a divinely revealed truth (dogma) |
| `secondary` | Secondary object — not itself revealed, but strictly connected to revelation |

**`assent`** (four rungs, descending)
| id | label | owed to |
|---|---|---|
| `fides-divina-et-catholica` | Divine and Catholic faith | revealed dogma |
| `fides-ecclesiastica` | Firm acceptance / “firmly hold” | definitive teaching of the secondary object |
| `religiosum-obsequium` | Religious submission of intellect and will | authentic non-definitive teaching |
| `prudential` | Prudential caution | interventions in the prudential order |

**`reformability`** — `irreformable` · `reformable` *(derived — see invariants)*

**`status`** (provenance) — `settled` · `contested` · `draft`

---

## The `locus` identifier convention

An assessment is keyed to a passage by `document` + `section`:

- `id` = `{document.id}#{section}` (e.g. `mag:john-paul-ii/evangelium-vitae-1995#62`).
- `document` = the parent Document `id` (foreign key).
- `section` = the citation unit *as the document itself numbers it* (paragraph number, canon number,
  chapter+number). Store it as a string so ranges (`57-66`) and non-numeric units (`can.9`) are
  expressible.
- A document-wide assessment uses `section: "*"` and id `{document.id}#*`.

The separator is `#`, not `-`, because a document id already ends in a year: `…-1995-62` cannot be
parsed. The scholarly sigla (`EV`, `LG`) survives as the optional, display-only `document.sigla`, so
`EV 62` remains available as a human citation without being a key.

## Identifier minting

Document identifiers take the form `mag:{issuer}/{incipit-slug}-{year}`. The `{issuer}` segment is
the local part of `issuerId` and is always the **issuer**, never the promulgator — so a conciliar
constitution is `mag:vatican-ii/gaudium-et-spes-1965`, with the promulgating pope in
`promulgatedBy`. The year is unconditional: incipits collide even within one pontificate (Pius IX
issued two encyclicals titled *Ubi Primum*, in 1847 and 1849), and a discriminator added only on
collision would force existing identifiers to change. Documents with no conventional incipit take a
`provisional` id of the form `mag:{issuer}/{genre-slug}-{YYYY}-{MM}-{DD}[-{n}]`, marked by
`idStatus`. Full rules are in
[the design spec](docs/superpowers/specs/2026-09-07-document-registry-identifiers-design.md).

---

## Validation invariants

These are the rules a linter/CI should enforce so the data can never re-collapse into the genre-fixes-authority error:

1. **Ceiling bound.** `register(assessment)` may not exceed `ceiling(genre(document))` on the ordering
   `authentic-ordinary < ordinary-universal < extraordinary`.
2. **Derived reformability.** `reformability = irreformable` **iff** `intent = definitive`. Do not store a value that contradicts
   `intent`; it may be omitted and computed.
3. **Object requires definitiveness.** `object` is set **iff** `intent = definitive`.
4. **Assent ↔ intent/object consistency.**
   - `intent = non-definitive` ⇒ `assent ∈ {religiosum-obsequium, prudential}`.
   - `intent = definitive` ⇒ `assent = fides-divina-et-catholica` (if `object = revealed`) or `fides-ecclesiastica` (if `object = secondary`).
5. **Computed infallibility.** Infallibility is **not stored**. It is `true` when `intent = definitive` **and** the document’s
   `issuerType` is the supreme magisterium (`issuerType ∈ {ecumenical-council, pope}` acting for the universal Church).
   Individual-bishop loci (`issuerType = bishop`) are never infallible.
6. **Extraordinary must be manifest.** An assessment with `register = extraordinary` **must** have `intent = definitive` and carry a
   non-empty `provenance.note` justifying that the intent to define is manifest (canon-law standard), and **must not** be
   `status: draft`.
7. **`dogmatic-definition` characteristic must be backed (bundle-level).** If a document has the `dogmatic-definition` characteristic,
   at least one of its assessments must have `register = extraordinary` and `intent = definitive`. (Cross-resource; enforceable where
   a document and its assessments are validated together, e.g. an example bundle.) A conciliar Constitution's `descriptiveTitle` of
   `dogmatic` carries **no** such requirement — it is a title, not a definition.
8. **Id form and uniqueness.** `id` matches the form required by its `idStatus` (minted or provisional), and is globally unique.
9. **Namespace matches issuer.** The id's namespace segment equals the local part of `issuerId`.
10. **Year matches date.** The id's year equals the year of `date`.
11. **Collision requires the full-date form.** No two documents share (issuer, incipit-slug, year) unless **both** carry the
    full-date form.
12. **Slug round-trips.** `slugify(incipit)` equals the id's slug segment.
13. **Issuer ids resolve.** `issuerId` and `promulgatedBy` resolve against vendored copies of the CRPDR and COECDR id lists.
14. **Assessment id and document reference.** An assessment's `id` is `{document}#{section}`, and `document` names an existing
    document.
15. **Genre reference.** `genre`, when non-null, resolves to an id in `data/genres.json`; when null, `sourceGenreLabel` is present.
16. **Issuer namespace matches issuer type.** `issuerId` begins with `oec:` **iff** `issuerType = ecumenical-council`.
17. **Issuer type is valid for the genre.** `issuerType`, when `genre` is non-null, is one of that genre's `issuerTypes` in `data/genres.json`.
18. **Title is present.** `title` is present and non-empty on every document.
19. **Provisional slug round-trips.** A `provisional` id's genre segment equals `slugify(genre)` — or `slugify(sourceGenreLabel)` when
    `genre` is null — so a provisional id is derivable from the record, exactly as invariant 12 requires of a minted one.
20. **Provisional ordinals are dense.** Provisional ordinals within an `(issuer, genre-slug, date)` group are dense and 1-based: a
    group of *n* carries exactly `-1 … -n`, and a group of 1 carries no ordinal.
21. **Keyword reference.** Every entry of `keywords`, when present, resolves to an id in `data/keywords.json`. This is the only
    invariant that reads `keywords` — the field carries no authority claim, unlike `characteristics`.
22. **Characteristics allowed by genre.** Every entry of `characteristics`, when `genre` is non-null, is one of that genre's
    `allowedCharacteristics` in `data/genres.json`; a genre row without the field allows none. The characteristic parallel of
    invariant 17.
23. **Series reference.** `series.id`, when present, resolves to an id in `data/series.json`. This is the only invariant that reads
    `series` — the field is discovery metadata with no bearing on register, ceiling or assent.

There is deliberately no invariant on `actKind`: the schema enum is its only check, and nothing couples it to a genre, a
ceiling or an Assessment. A rule that forbade `governance` on an `encyclical` would be re-deriving the act from the genre, and a
rule that rejected an Assessment on a `liturgical` document would forbid assessing the address that precedes an Urbi et Orbi
blessing — in both cases inferring what a passage does from what its document is, the very inference the two-table model exists
to refuse.

---

## Example instances

**Genre** (`encyclical`)
```json
{
  "id": "encyclical",
  "label": "Encyclical",
  "issuerTypes": ["pope"],
  "defaultScope": "universal",
  "defaultRegister": "authentic-ordinary",
  "ceiling": "ordinary-universal",
  "description": "Circular letter of the pope to the universal Church; can invoke the ordinary and universal magisterium."
}
```

**Document** (`mag:john-paul-ii/evangelium-vitae-1995`)
```json
{
  "id": "mag:john-paul-ii/evangelium-vitae-1995",
  "title": "Evangelium Vitae",
  "genre": "encyclical",
  "issuerId": "rp:john-paul-ii",
  "issuerType": "pope",
  "date": "1995-03-25",
  "scope": "universal",
  "incipit": "Evangelium Vitae",
  "incipitLang": "la",
  "idStatus": "minted",
  "sigla": "EV"
}
```

**Assessment** (`mag:john-paul-ii/evangelium-vitae-1995#62`)
```json
{
  "id": "mag:john-paul-ii/evangelium-vitae-1995#62",
  "document": "mag:john-paul-ii/evangelium-vitae-1995",
  "section": "62",
  "topic": "The direct abortion of an innocent human being is gravely immoral.",
  "register": "ordinary-universal",
  "intent": "definitive",
  "object": "revealed",
  "assent": "fides-divina-et-catholica",
  "reformability": "irreformable",
  "provenance": {
    "assessedBy": "CMDDR editors",
    "sources": ["Sullivan, Creative Fidelity (1996), ch. 8"],
    "status": "contested",
    "note": "Taught 'by the ordinary and universal magisterium'; whether the object is primary or secondary is debated among theologians."
  }
}
```

A fuller worked example (the whole of *Evangelium Vitae* with several loci) is in
[`examples/evangelium-vitae.json`](examples/evangelium-vitae.json). It bundles a genre, a document, and its assessments in one
file, validated as a unit by the envelope schema [`schema/example-bundle.schema.json`](schema/example-bundle.schema.json), which
`$ref`s the three resource schemas so each nested resource is still checked strictly.
