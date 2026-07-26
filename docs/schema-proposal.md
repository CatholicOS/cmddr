# CMDDR schema proposal (draft for committee review)

CMDDR has not yet minted an identifier. That is an advantage the sibling registries no
longer have: the scheme can be machine-readable from the first ID rather than migrated to
later. What follows proposes exactly that — a canonical identifier that asserts nothing,
and a human-readable layer guaranteed beside it. *Et-et*, not *aut-aut*: the durable
identifier and the interpretable record, each carried in the layer built for it.

## Identifier scheme

```text
id:      Rv9Ld3qXm7TkPb2Ns8Hf4c    # canonical, machine-readable, minted once
                                   # (illustrative value: shape only, not a minted ID)
aliases: rerum-novarum             # permanent, resolvable, never reused
         DS 3265                   # Denzinger–Schönmetzer number
         hf_l-xiii_enc_15051891_rerum-novarum   # vatican.va document stem
labels:  "Rerum novarum"@la · "Rerum Novarum"@en · "Rerum novarum"@it
type:    encyclical                # a property, exactly like every fact below
issuer:  pope
magisterial_type: ordinary
infallibility: none
scope:   universal
promulgated: 1891-05-15
```

The canonical ID is a base62-encoded 128-bit UUID prefixed `R` — the shape already
shipping elsewhere in the organization's ontology work — minted once per magisterial
document and never re-minted. Every value above the rule line is a *name*; every value
below it is a *fact*. The scheme's whole discipline is keeping those two apart.

### Rules

1. **The canonical ID is machine-readable and minted once.** It encodes nothing about the
   document — not the issuing pope, not the year, not the document type, not the language
   of its incipit — so no later correction to any of those can reach it.
2. **Every human-readable citation form is a permanent alias.** Conventional short titles
   (`rerum-novarum`, `humanae-vitae`, `lumen-gentium`), Denzinger–Schönmetzer numbers,
   AAS citations, and the vatican.va URL stems are carried as notations from day one,
   resolvable forever, never deprecated and never reused. Nothing an existing citation
   practice already uses is lost; each is added, not replaced.
3. **Every document carries multilingual labels.** Latin, Italian and English at minimum,
   language-tagged, on one record — the incipit is the Latin title, and the vernacular
   titles in circulation are labels beside it rather than competing identifiers. Naming
   disputes are settled by *adding* a label, never by changing an identifier.
4. **Document type, issuer, magisterial weight and scope are properties, never segments
   of the ID.** The draft table in `README.md` is a taxonomy of exactly these facts —
   `Type of Document / Speech`, `Issuer`, `Magisterial Type`, `Infallability`, `Scope`.
   Each is a field on the record. Where a fact would live both in a field and in the
   identifier, the identifier is the copy that goes stale.
5. **Production surfaces render a label beside every canonical ID.** Source files carry a
   label column or comment next to each ID; serializations carry it inline; interfaces and
   generated code render it. This is the commitment that makes the machine-readable
   canonical ID livable for the humans who review the registry.

## Entry shape

```json
{
  "id": "Rm2Yt7NpQ4vLbXs9Kd3Wg8",
  "notations": [
    { "value": "rerum-novarum", "scheme": "cmddr:scheme/short-title" },
    { "value": "DS 3265", "scheme": "cmddr:scheme/denzinger" },
    {
      "value": "hf_l-xiii_enc_15051891_rerum-novarum",
      "scheme": "cmddr:scheme/vatican-va"
    }
  ],
  "labels": {
    "la": "Rerum novarum",
    "en": "Rerum Novarum",
    "it": "Rerum novarum"
  },
  "type": "encyclical",
  "issuer": "pope",
  "issuer_id": "Rz5Hq8Vn3TdLpX2Mc7Bk9f",
  "magisterial_type": "ordinary",
  "infallibility": "none",
  "scope": "universal",
  "promulgated": "1891-05-15"
}
```

All three `R…` values above are illustrative: they show the shape, not identifiers this
registry has minted. `type`, `issuer`, `magisterial_type`, `infallibility` and `scope`
draw their vocabularies from the `README.md` table; `issuer_id` points at whatever
registry ends up naming popes, councils and bishops, by that registry's canonical ID
rather than by a slug of a name.

## Why start machine-readable, on this repository's own record

This registry has no identifiers to point at yet, but it already has churn — three
commits' worth, all before a single ID existed.

- **The project's own acronym moved.** `132b4f0` opened the repository as "cmddr";
  `c4fd0a7` wrote the heading `## What is CLDDR?`; `13d3de9` — "Fix typo in project name
  from CLDDR to CMDDR" — corrected it the same day. A one-line fix at three commits old.
  The same correction against a shipped slug scheme is a rename of every ID minted under
  the wrong prefix.
- **A misspelling is already load-bearing in the taxonomy.** The table's fourth column
  reads `Infallability` (for *infallibility*), and its cells read `Infallable` (for
  *infallible*). Any identifier scheme that derives segments from these column and cell
  names inherits both misspellings and makes correcting them a migration. As properties,
  the fix is a field rename in one place.
- **Hierarchy is currently encoded in labels.** Two rows read `↳ Dogmatic Bull` and
  `↳ Pastoral Constitution`, subordinated by a glyph to `Apostolic Constitution`, whose
  own cells read `*(see below)*`. A slug scheme would either bake that parentage into the
  ID — `apostolic-constitution/dogmatic-bull` — or lose it. As a `broader` property on a
  canonical ID, the relation is queryable, and re-parenting a type is an edit rather than
  a re-mint. The repository's own note that "the above table is an initial draft, which
  may need further revision" is precisely the promise of further re-parenting.

None of these is an execution error. Each is what happens when a name is asked to serve as
an identifier while the naming is still being worked out — and this registry's naming is,
by its own statement, still being worked out.

The general argument — why canonical identifiers should be machine-readable, what that
costs, and how the human-readable layer is guaranteed rather than left optional — is set
out once in *Identifier Durability: Machine-Readable Canonical IRIs* (CDCF
`foundation-docs`, `research/identifier-durability-opaque-canonical-iris.md`) and is not
restated here.

## Open questions for the committee

1. Whether canonical IDs are minted in one org-wide namespace shared with the other
   registries, or per registry with a `cmddr:` scheme of its own — and, either way, which
   host resolves them.
2. Which citation systems ship as guaranteed notations at v1 (conventional short title,
   Denzinger–Schönmetzer, AAS, vatican.va URL stem, *Enchiridion Vaticanum*), and which
   are added later — noting that a notation scheme, once declared, is permanent.
3. How composite and serial documents are individuated: whether a general-audience cycle
   (e.g. the Wednesday catecheses), a document issued in several *editiones typicae*, and
   a document approved *in forma specifica* by a dicastery each take one canonical ID with
   properties, or several IDs bound by a `broader`/`exact-match` relation.
