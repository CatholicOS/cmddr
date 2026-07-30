# Catholic Open Source CMDDR Project

The home of the **Common Magisterial Document Data Repository** curated by the Catholic Engineering Task Force within the Catholic Digital Commons Foundation.

## What is CMDDR?

The Common Magisterial Document Data Repository (CMDDR) provides a canonicalized list of identifiers
for Magisterial documents or Papal documents, speeches, homilies, etc. of the Catholic Church, along with semantic
distinctions between the types of documents / speeches.

## The Magisterium

The term *magisterium* is based on the Latin word for “teacher” (magister). In contemporary Catholic usage, it has several meanings.

- the **teaching authority** which Christ has given to the Church. *Here the term refers to the authority itself, not those who exercise it. This usage appears in statements like, “The Church exercises its magisterium when it authoritatively proclaims Christ’s teachings.”*
- **those who exercise this teaching authority**. *Here the term refers to the Pope and the bishops teaching in union with him.
  Collectively, they are referred to as the “Magisterium,” as in “the Magisterium has infallibly taught that God is a Trinity.”*
- a particular **body of teachings** that have been authoritatively proclaimed. *This usage appears in statements like, “Humanae Vitae belongs to the magisterium of St. Paul VI.”*

For the purposes of this data repository, we will be taking into account the third meaning, in reference to the **body of teachings**.

## Modeling magisterial authority: genre vs. statement

An earlier draft of this repository used a single table that assigned a fixed *Magisterial Type* and *Infallibility* to each
document **genre**. That approach cannot be made correct, because in Catholic theology **authority attaches to a teaching act,
not to a document genre**. Francis A. Sullivan, in *Creative Fidelity: Weighing and Interpreting Documents of the Magisterium*
(1996), makes the point directly about councils: *“not every statement made by an ecumenical council will express … a ‘solemn
judgment’ … the theologian must be familiar with the criteria by which to distinguish dogmatic definitions from the other kinds
of statements found in conciliar decrees.”* The same document may contain teaching at several levels — e.g. *Lumen Gentium* is a
**Dogmatic Constitution** that defined no new dogma, while *Evangelium Vitae* is an **Encyclical** whose three central moral
judgments are taught by the ordinary and universal magisterium.

We therefore split the model into **two tables**:

1. **[Genre Registry](#table-1--genre-registry)** — properties that are *knowable from the act itself* (issuer, genre, scope) and
   the *presumptive* and *maximum* authority the genre can carry. This is the canonical taxonomy of document / speech **types**,
   and preserves the original registry purpose of the repository.
2. **[Statement Assessments](#table-2--statement-assessments)** — the authority *actually exercised* in a specific paragraph or
   section, which must be discerned by **prudential application** to the text. Infallibility and definitiveness live here, never
   in the Genre Registry.

> **How to read these tables.** A row in the Genre Registry gives a genre’s **default** register and its **ceiling** (the highest
> authority its issuer *could* exercise through it). The real weight of any given passage is read from the Statement Assessments,
> which **override** the genre default at their locus and can never exceed the genre’s ceiling. Most documents (homilies,
> audiences, prayers, most *motu proprios*) carry no definitive statements at all and are fully described by the Genre Registry
> alone.

### Register vocabulary

| Register | Meaning |
|---|---|
| **Extraordinary** | A *solemn judgment* / definition — an ecumenical council or a pope speaking *ex cathedra* defining a doctrine. Rare; per canon law nothing counts as defined “unless this is manifestly the case.” |
| **Ordinary Universal** | The bishops dispersed throughout the world, in union with the pope, concurring that a teaching is to be **held definitively**. This mode is itself capable of infallibility without a solemn definition. |
| **Authentic Ordinary** | The day-to-day, *non-definitive* teaching of the pope or bishops. Authoritative and calls for *religiosum obsequium*, but reformable. Admits many internal degrees. |

---

### Table 1 — Genre Registry

*Registry of document / speech **types**. `Default register` is the genre’s presumption; `Ceiling` is the maximum its issuer can
exercise through it. Neither fixes the authority of any particular passage — see Table 2.*

| Genre | Issuer | Scope | Default register | Ceiling (issuer capacity) | Notes |
|---|---|---|---|---|---|
| Dogmatic Constitution | Ecumenical Council | universal | Authentic Ordinary | Extraordinary | Highest conciliar genre; still non-definitive unless a definition is manifest. |
| Constitution | Ecumenical Council | universal | Authentic Ordinary | Extraordinary | Title deliberately weaker than *Dogmatic* Constitution. |
| Pastoral Constitution | Ecumenical Council | universal | Authentic Ordinary | Ordinary Universal | “Pastoral” signals non-defining intent (e.g. *Gaudium et Spes*). |
| Decree | Ecumenical Council | universal | Authentic Ordinary | Extraordinary | May carry canons/anathemas that *are* definitions (e.g. Trent); assess per canon. |
| Declaration | Ecumenical Council | universal | Authentic Ordinary | Extraordinary | Lowest conciliar genre by presumptive weight. |
| Apostolic Constitution | Pope | universal | Authentic Ordinary | Extraordinary | Solemn papal instrument; *Ineffabilis Deus*, *Munificentissimus Deus* defined *ex cathedra*. |
| Bull | Pope | universal | Authentic Ordinary | Extraordinary | A **sealed form** (lead/wax seal — Latin *bulla*), not a level of authority; “dogmatic” is a property of the content, assessed in Table 2. |
| Encyclical | Pope | universal | Authentic Ordinary | Ordinary Universal | Can invoke the ordinary and universal magisterium (e.g. *Evangelium Vitae*). |
| Apostolic Exhortation | Pope | universal | Authentic Ordinary | Authentic Ordinary | Typically post-synodal, hortatory. |
| Apostolic Letter | Pope | universal | Authentic Ordinary | Ordinary Universal | Can reach definitive language (e.g. *Ordinatio Sacerdotalis*). |
| Motu Proprio | Pope | universal | Authentic Ordinary | Authentic Ordinary | Issued on the Pope’s own initiative; often legislative/administrative. |
| Brief | Pope | universal | Authentic Ordinary | Authentic Ordinary | Less formal papal letter. |
| Letter | Pope | universal | Authentic Ordinary | Authentic Ordinary | |
| Discourse / Address | Pope | universal | Authentic Ordinary | Authentic Ordinary | Pastoral vehicle; cannot host a definition. |
| Homily | Pope | universal | Authentic Ordinary | Authentic Ordinary | |
| Prayer | Pope | universal | Authentic Ordinary | Authentic Ordinary | |
| Audience / Catechesis | Pope | universal | Authentic Ordinary | Authentic Ordinary | |
| Episcopal / Pastoral Letter | Bishop | local | Authentic Ordinary | Authentic Ordinary | An individual bishop shares in the ordinary universal magisterium only collegially, not through a local act. |
| Episcopal Homily | Bishop | local | Authentic Ordinary | Authentic Ordinary | |

Among the conciliar genres, the titles themselves encode a **descending presumptive weight** — Dogmatic Constitution → Constitution
→ Decree → Declaration (with Pastoral Constitution explicitly non-defining) — even though the council’s *capacity* to define
(the ceiling) is the same for each.

---

### Table 2 — Statement Assessments

*The discerned authority of an individual passage, keyed by a `locus` (`document-id` + section/paragraph). This layer is curated
and **interpretive**: entries carry provenance and may be marked `contested`. Reformability is **derived** from `Intent`
(non-definitive ⇒ reformable; definitive ⇒ irreformable); infallibility is **computed** (`Intent = definitive` AND issuer capacity
is the supreme magisterium).*

| Locus | Mode exercised | Intent | Object | Assent owed | Reformability | Source / status |
|---|---|---|---|---|---|---|
| `LG` *(general)* | Authentic Ordinary | Non-definitive | — | *religiosum obsequium* | Reformable | Vatican II defined nothing “even in the two documents which it called ‘dogmatic constitutions’.” |
| `EV-57` (murder) | Ordinary Universal | Definitive | Revealed | *fides divina et catholica* | Irreformable | Taught “by the ordinary and universal magisterium.” |
| `EV-62` (abortion) | Ordinary Universal | Definitive | Revealed / connected | *fides divina et catholica* | Irreformable | idem; object primary-vs-secondary debated. |
| `EV-65` (euthanasia) | Ordinary Universal | Definitive | Secondary / connected | firmly hold (*fides ecclesiastica*) | Irreformable | idem; secondary object — “in harmony with … my Predecessors”; classification debated. |
| `OS-4` (*Ordinatio Sacerdotalis*) | Ordinary Universal | Definitive | Secondary / connected | firmly hold (*fides ecclesiastica*) | Irreformable | “to be definitively held”; not *ex cathedra* per Ratzinger — status debated. |

Note the four-rung **Assent** scale used above and in the schema: *fides divina et catholica* (revealed dogma) → **firmly hold**
(*fides ecclesiastica*, a definitively-taught truth not itself revealed but connected to revelation) → *religiosum obsequium*
(authentic non-definitive teaching) → prudential caution (the lowest sub-level of non-definitive interventions).

---

## Data schema

The machine-readable schema for these two tables — the controlled vocabularies, the `genre → document → assessment` relationships,
the `locus` identifier convention, and the validation invariants (ceiling bound, derived reformability, computed infallibility) —
is specified in **[SCHEMA.md](SCHEMA.md)**, with JSON Schema files under [`schema/`](schema/) and a worked example under
[`examples/`](examples/).

---

N.B. Both tables are an initial draft and will be refined as the repository’s document set grows. The theological framework follows
Francis A. Sullivan, *Creative Fidelity* (1996); see also CDF, *Donum Veritatis* (1990) §§15–24 and John Paul II, *Ad Tuendam Fidem*
(1998) for the levels of assent.
