# CMDDR Data Schema

This document specifies the machine-readable model behind the two tables in the [README](README.md). It defines three entities
and how they relate:

```
Genre  (1) ──────< (n)  Document  (1) ──────< (n)  Assessment
registry of              individual                 discerned authority of a
document TYPES           documents                  passage within a document
```

- **Genre** — a document / speech *type* (Encyclical, Decree, …). Carries the *default register* and the *ceiling*. → [`schema/genre.schema.json`](schema/genre.schema.json)
- **Document** — one concrete document (e.g. *Evangelium Vitae*). References a `genre`. → [`schema/document.schema.json`](schema/document.schema.json)
- **Assessment** — the authority actually exercised in a single passage, keyed by a `locus`. References a `document`. → [`schema/assessment.schema.json`](schema/assessment.schema.json)

A **Genre** row alone fully describes documents that contain no definitive teaching. Doctrinally weighty documents additionally get
one **Assessment** per notable passage.

---

## Controlled vocabularies

**`issuerType`** (role/capacity) — `ecumenical-council` · `pope` · `bishop`. Used by `document.issuerType` (the role that issued it) and by `genre.issuerTypes` (the roles that may issue the genre). The issuer's *identity* (e.g. `rp:john-paul-ii`) is carried separately in `document.issuerId`. When a pope promulgates a document issued by another authority — chiefly a conciliar constitution — the promulgating pope is recorded in the optional `document.promulgatedBy` (e.g. `rp:paul-vi`), which does not change `issuerType`.

**`scope`** — `universal` · `local`

**`characteristics`** (non-exclusive document metadata a papal bull may bear) — `apostolic-constitution` · `dogmatic-definition`. A document may carry neither, either, or both (e.g. *Munificentissimus Deus* carries both).

**`descriptiveTitle`** (optional, mutually-exclusive title of a conciliar Constitution) — `dogmatic` · `pastoral`. Descriptive of purpose only, never a claim of authority; omit for a plain constitution (e.g. *Sacrosanctum Concilium*).

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
