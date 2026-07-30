# CMDDR Data Schema

This document specifies the machine-readable model behind the two tables in the [README](README.md). It defines three entities
and how they relate:

```
Genre  (1) ──────< (n)  Document  (1) ──────< (n)  Assessment
registry of              individual                 discerned authority of a
document TYPES           documents                  passage within a document
```

- **Genre** — a document / speech *type* (Encyclical, Decree, …). Carries the *default register* and the *ceiling*. Sub-genres reference a parent via `parent` (e.g. `apostolic-constitution` and `dogmatic-bull` are children of `papal-bull`). → [`schema/genre.schema.json`](schema/genre.schema.json)
- **Document** — one concrete document (e.g. *Evangelium Vitae*). References a `genre`. → [`schema/document.schema.json`](schema/document.schema.json)
- **Assessment** — the authority actually exercised in a single passage, keyed by a `locus`. References a `document`. → [`schema/assessment.schema.json`](schema/assessment.schema.json)

A **Genre** row alone fully describes documents that contain no definitive teaching. Doctrinally weighty documents additionally get
one **Assessment** per notable passage.

---

## Controlled vocabularies

**`issuerType`** (role/capacity) — `ecumenical-council` · `pope` · `bishop`. Used by `document.issuerType` (the role that issued it) and by `genre.issuerTypes` (the roles that may issue the genre). The issuer's *identity* (e.g. `john-paul-ii`) is carried separately in `document.issuerId`.

**`scope`** — `universal` · `local`

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

- `id` = `{DOCUMENT_ID}-{SECTION}` (e.g. `EV-62`, `OS-4`, `LG-25`).
- `document` = the parent Document `id` (foreign key).
- `section` = the citation unit *as the document itself numbers it* (paragraph number, canon number, chapter+number). Store it as a
  string so ranges (`57-66`) and non-numeric units (`can.9`) are expressible.
- A document-wide assessment (e.g. “LG defined nothing”) uses `section: "*"` and `id` `{DOCUMENT_ID}-general`.

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

**Document** (`EV`)
```json
{
  "id": "EV",
  "title": "Evangelium Vitae",
  "genre": "encyclical",
  "issuerId": "john-paul-ii",
  "issuerType": "pope",
  "date": "1995-03-25",
  "scope": "universal"
}
```

**Assessment** (`EV-62`)
```json
{
  "id": "EV-62",
  "document": "EV",
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
