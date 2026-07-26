# Catholic Open Source CMDDR Project

The home of the **Common Magisterial Document Data Repository**, curated by the **Catholic Engineering Task Force** of the [Catholic Digital Commons Foundation](https://github.com/CatholicOS).

## What is CMDDR?

The Catholic Open Source Common Magisterial Document Data Repository (CMDDR) provides a canonicalized list of identifiers
for Magisterial documents or Papal documents, speeches, homilies, etc. of the Catholic Church, along with semantic
distinctions between the types of documents / speeches.

## The identifier scheme (draft)

```
id:      Rv9Ld3qXm7TkPb2Ns8Hf4c    # canonical, minted once (illustrative value: shape only)
aliases: rerum-novarum · DS 3265 · hf_l-xiii_enc_15051891_rerum-novarum
labels:  "Rerum novarum"@la · "Rerum Novarum"@en · "Rerum novarum"@it
```

CMDDR has not yet minted an identifier, so its canonical IDs can be machine-readable from the first one rather than migrated
to later. Every human-readable citation form already in use for these documents — conventional short titles, Denzinger–Schönmetzer
numbers, vatican.va document stems — is kept as a permanent resolvable alias, and every document carries multilingual labels;
document type, issuer, magisterial weight and scope (the columns of the table below) are properties of the record, never
segments of the identifier. The full proposal is in [docs/schema-proposal.md](docs/schema-proposal.md).
**All IDs are drafts pending committee review.**

## The Magisterium

The term *magisterium* is based on the Latin word for “teacher” (magister). In contemporary Catholic usage, it has several meanings.

- the **teaching authority** which Christ has given to the Church. *Here the term refers to the authority itself, not those who exercise it. This usage appears in statements like, “The Church exercises its magisterium when it authoritatively proclaims Christ’s teachings.”*
- **those who exercise this teaching authority**. *Here the term refers to the Pope and the bishops teaching in union with him.
  Collectively, they are referred to as the “Magisterium,” as in “the Magisterium has infallibly taught that God is a Trinity.”*
- a particular **body of teachings** that have been authoritatively proclaimed. *This usage appears in statements like, “Humanae Vitae belongs to the magisterium of St. Paul VI.”*

For the purposes of this data repository, we will be taking into account the third meaning, in reference to the **body of teachings**.

| Type of Document / Speech | Issuer             | Magisterial Type | Infallability | Scope     | Description                                              |
|---------------------------|--------------------|------------------|---------------|-----------|----------------------------------------------------------|
| Dogmatic Constitution     | Ecumenical Council | Extraordinary    | Infallable    | universal |                                                          |
| Decree                    | Ecumenical Council | Extraordinary    |       -       | universal |                                                          |
| Declaration               | Ecumenical Council | Extraordinary    |       -       | universal |                                                          |
| Apostolic Constitution    | *(see below)*      | *(see below)*    | *(see below)* |*(see below)*| *(see below)*                                          |
| ↳ Dogmatic Bull           | Pope               | Extraordinary    | Infallable    | universal |                                                          |
| ↳ Pastoral Constitution   | Pope               | Ordinary         |       -       | universal |                                                          |
| Encyclical                | Pope               | Ordinary         |       -       | universal |                                                          |
| Motu Proprio              | Pope               | Ordinary         |       -       | universal | issued directly by the Pope on his own initiative        |
| Papal Bull                | Pope               | Ordinary         |       -       | universal | traditionally sealed with a circular seal of lead or wax |
| Apostolic Letter          | Pope               | Ordinary         |       -       | universal |                                                          |
| Apostolic Exhortation     | Pope               | Ordinary         |       -       | universal |                                                          |
| Brief                     | Pope               | Ordinary         |       -       | universal |                                                          |
| Letter                    | Pope               | Ordinary         |       -       | universal |                                                          |
| Discourse                 | Pope               | Ordinary         |       -       | universal |                                                          |
| Homily                    | Pope               | Ordinary         |       -       | universal |                                                          |
| Prayer                    | Pope               | Ordinary         |       -       | universal |                                                          |
| Audience                  | Pope               | Ordinary         |       -       | universal |                                                          |
| Episcopal letter          | Bishop             | Ordinary         |       -       | local     |                                                          |
| Episcopal homily          | Bishop             | Ordinary         |       -       | local     |                                                          |

N.B. The above table is an initial draft, which may need further revision.
