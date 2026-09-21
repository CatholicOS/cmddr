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

**Why a ceiling can sit below its issuer’s capacity.** A pope can define, yet most papal genres are capped at Authentic
Ordinary, and two genres of the same diplomatic family split — Apostolic Letter reaches Ordinary Universal while Letter
and Brief do not. The gap is a claim about the *instrument*, not about the issuer. A papal document does not itself
exercise the ordinary and universal magisterium, which belongs to the bishops dispersed throughout the world in union with
the pope; what it does is **attest** that such teaching exists and is to be held definitively (*Evangelium Vitae* 62:
taught “by the ordinary and universal Magisterium”). An attestation of definitive teaching is a solemn act, and the Holy
See does not make it through unsealed occasional correspondence: the formality of the instrument is what earns the higher
ceiling. This is a defended editorial position, not a record of what popes have so far happened to do. Should a plain
letter ever be found attesting definitive teaching, the answer is to **raise that genre’s ceiling** — a reviewable change
to Table 1 — rather than to absorb the document as an exception; invariant 1 (ceiling bound) then keeps doing real work.
The same reasoning applies to every genre capped below its issuer’s capacity; the discussion is recorded in
[#13](https://github.com/CatholicOS/cmddr/issues/13).

---

### Table 1 — Genre Registry

*Registry of document / speech **types**. `Default register` is the genre’s presumption; `Ceiling` is the maximum its issuer can
exercise through it. Neither fixes the authority of any particular passage — see Table 2. `Scope` is juridical — whom the act
binds — not who it is addressed to: *Ordinatio Sacerdotalis* is addressed to the bishops and universal in scope, while the
*Letter to Artists* is addressed to everyone and binds no one. An omitted `document.scope` inherits the genre's default, so a
letter is presumed `local`; a non-juridical scope is not representable — both vocabularies allow only `universal` and `local` —
and the *Letter to Artists* therefore currently reads as `local`, a known limitation. Representing that case, recording the
addressee, and a possible `regional` value are all deferred to [#4](https://github.com/CatholicOS/cmddr/issues/4).*

| Genre | Issuer | Scope | Default register | Ceiling (issuer capacity) | Notes |
|---|---|---|---|---|---|
| Constitution | Ecumenical Council | universal | Authentic Ordinary | Extraordinary | The council’s most solemn genre. May bear an optional descriptive *title* (below); non-definitive unless a definition is manifest. |
| Decree | Ecumenical Council | universal | Authentic Ordinary | Extraordinary | May carry canons/anathemas that *are* definitions (e.g. Trent); assess per canon. |
| Declaration | Ecumenical Council | universal | Authentic Ordinary | Extraordinary | Lowest conciliar genre by presumptive weight. |
| Papal Bull | Pope | universal | Authentic Ordinary | Extraordinary | The most solemn **sealed form** of papal document (lead/wax seal — Latin *bulla*). May bear one or more of the non-exclusive *characteristics* listed below the table. |
| Encyclical | Pope | universal | Authentic Ordinary | Ordinary Universal | Can invoke the ordinary and universal magisterium (e.g. *Evangelium Vitae*). |
| Apostolic Exhortation | Pope | universal | Authentic Ordinary | Authentic Ordinary | Typically post-synodal, hortatory. |
| Apostolic Letter | Pope | universal | Authentic Ordinary | Ordinary Universal | Formal papal act in the pope’s own name (*Litterae Apostolicae*; vatican.va’s *Lettere Apostoliche* shelf): Latin incipit, entered in the acts, juridical effect. Spans universal teaching (*Ordinatio Sacerdotalis*, *Tertio Millennio Adveniente*) and local governance — erecting dioceses, proclaiming patrons (*Regionis Capitanatae*) — so `document.scope` is expected per document. *Ordinatio Sacerdotalis* is the exception within the genre, not the type. May bear the `motu-proprio` *characteristic* listed below the table. |
| Brief | Pope | universal | Authentic Ordinary | Authentic Ordinary | Less formal papal letter. |
| Letter | Pope | local | Authentic Ordinary | Authentic Ordinary | Ordinary papal correspondence (*Epistula*; vatican.va’s *Lettere* shelf): someone is written to, on an occasion, usually in a vernacular, with no formal instrument behind it; titled by addressee and occasion, never by incipit. What separates it from the Apostolic Letter is form, not audience or weight — the *Letter to Artists* (1999) addresses the whole world and is still a letter. Weight is per statement, not per addressee. |
| Discourse / Address | Pope | universal | Authentic Ordinary | Authentic Ordinary | Pastoral vehicle; cannot host a definition. |
| Homily | Pope | universal | Authentic Ordinary | Authentic Ordinary | |
| Prayer | Pope | universal | Authentic Ordinary | Authentic Ordinary | |
| Audience / Catechesis | Pope | universal | Authentic Ordinary | Authentic Ordinary | |
| Message | Pope | universal | Authentic Ordinary | Authentic Ordinary | Covers both the annual World Day / Lent series and occasional messages to a congress, dicastery or body. Non-defining pastoral vehicle; sits beside Discourse, Homily and Audience. |
| Urbi et Orbi | Pope | universal | Authentic Ordinary | Authentic Ordinary | A solemn papal **blessing** to the City and the World (vatican.va’s *Urbi et Orbi* shelf under *Messaggi*), with a plenary indulgence attached under the usual conditions — extended by the Apostolic Penitentiary to those who receive it by radio, television or internet. The blessing is the act; only the accompanying address carries teaching, assessed per statement. See *Acts that do not teach* below. |
| Episcopal / Pastoral Letter | Bishop | local | Authentic Ordinary | Authentic Ordinary | An individual bishop shares in the ordinary universal magisterium only collegially, not through a local act. |
| Episcopal Homily | Bishop | local | Authentic Ordinary | Authentic Ordinary | |

Among the conciliar genres, presumptive weight descends **Constitution → Decree → Declaration**, even though the council’s
*capacity* to define (the ceiling) is the same for each.

#### Constitution descriptive titles

A conciliar **Constitution** may bear an optional, mutually-exclusive descriptive **title** indicating its purpose (or none). The
title is *descriptive of purpose, not a claim of authority* — *Lumen Gentium* is titled a "Dogmatic Constitution" yet defined no new
dogma. Any actual definition is recorded as a Table 2 assessment, never inferred from the title.

| Descriptive title | Meaning | Example |
|---|---|---|
| `dogmatic` | Treats doctrine as its primary subject. | *Lumen Gentium*, *Dei Verbum* |
| `pastoral` | Explicitly pastoral, signalling non-defining intent. | *Gaudium et Spes* |
| *(none)* | A plain constitution on a solemn matter. | *Sacrosanctum Concilium* (liturgy) |

#### Characteristics

Some distinctions the sources draw are not genres but qualities a document of a given genre may have. Rather than being
sub-genres, these are non-exclusive, document-level **characteristics** that a genre row *allows*: a document may carry none,
one, or several of the characteristics its genre allows, and none that it does not (invariant 22 in [SCHEMA.md](SCHEMA.md)).
Modeling them as document-level metadata (not separate genres) keeps the base genre stable, so it can be baked into a document’s
canonical id without forcing a mutually-exclusive choice. Two genres currently allow characteristics: **Papal Bull** allows
`apostolic-constitution` and `dogmatic-definition`; **Apostolic Letter** allows `motu-proprio`.

| Characteristic | Allowed by | Meaning | Bearing on authority |
|---|---|---|---|
| `apostolic-constitution` | Papal Bull | The most solemn form of papal *legislation* — governance, laws, promulgations (e.g. *Pastor Bonus*, *Fidei Depositum*). | Formal solemnity; the register of any teaching is still assessed per statement. |
| `dogmatic-definition` | Papal Bull | Contains an *ex cathedra* dogmatic definition (e.g. *Ineffabilis Deus*, 1854; *Munificentissimus Deus*, 1950). | Its defining statement is **Extraordinary / infallible** — recorded as a Table 2 assessment. |
| `motu-proprio` | Apostolic Letter | Issued on the pope’s own initiative — a mode of issuance, not a genre; *Litterae Apostolicae motu proprio datae* (e.g. *Summorum Pontificum*, *Traditionis Custodes*, *Ad Tuendam Fidem*). | None; the register of any statement is assessed per statement in Table 2. |

*Munificentissimus Deus* bears **both** bull characteristics: it is an apostolic constitution that also defines a dogma. A bull
of canonization bears **neither**. *Socialium Scientiarum* (1994) is an apostolic letter that bears `motu-proprio`; *Ordinatio
Sacerdotalis* is one that does not.

#### On sources: chancery shelves are not a magisterial taxonomy

The document categories on [vatican.va](https://www.vatican.va/) — *Encicliche*, *Lettere Apostoliche*, *Lettere*, *Motu Proprio*,
*Bolle* and the rest — are a **chancery filing system**. They sort documents by the diplomatic form of the instrument used to issue
them, which is not the same question as the authority the issuer exercised. They are first-rate evidence of what forms exist and of
how the Holy See itself distinguishes them, and they should **inform** this registry; they do not **govern** it. Nor are they the
record: the *Acta Apostolicae Sedis*, unlike the shelves, are the promulgating instrument, and the registry records where an act
stands in them (*The Acta Apostolicae Sedis reference*, below). Nor are they complete, even for the current pontificate: over
2015–2024 the AAS index names **118** apostolic constitutions and **202** apostolic letters of Francis where the
`apost_constitutions` and `apost_letters` shelves carry **49** and **59** — the shelves are selections, and the acts they omit
(most circumscription erections, most beatification letters, every canonisation decretal) are registered from the *Acta* instead.

Three features of those shelves make the point. First, they sort by *form*, not by weight or audience: *Ordinatio Sacerdotalis* and a
letter erecting a diocese share the *Lettere Apostoliche* shelf, while the universally-addressed *Letter to Artists* (1999) sits
under *Lettere*. Second, they are not disjoint — *Socialium Scientiarum* (1994) is filed **both** as an Apostolic Letter and as a
*Motu Proprio*, because issuing a document *motu proprio* is a mode of acting rather than a genre standing beside the apostolic
letter. Third, their names are not stable even for one occasion: the *Messaggi* sub-shelf that holds the World Mission Day
messages is `missions` on every page from Paul VI to Francis and `mission` on Leo XIV's, whose page also renames `poveri` to
`poor`, `nonni` to `grandparents` and `cura-creato` to `creation`, while John XXIII and Paul VI spell the Urbi et Orbi shelf
`urbi_et_orbi` where every later pope has `urbi` — the same series, filed under five different names. This registry handles that kind of relation with **characteristics** rather than sub-genres (see *Characteristics*
above), and `motu-proprio` is one: a document filed on the *Motu Proprio* shelf, or on that shelf as well as another, is an
`apostolic-letter` bearing the `motu-proprio` characteristic, and the shelf it came from is still recorded on the document.

Our own genre rows accordingly mix two axes: diplomatic **form** (Papal Bull, Apostolic Letter, Brief, Letter) and **content type**
(Encyclical, Apostolic Exhortation) — an Encyclical being, formally, itself a species of letter (*Litterae Encyclicae*). That
mixture is deliberate and follows ordinary usage, but it means the existence of a vatican.va shelf is never by itself an argument
for a genre row, a default, or a ceiling. Each of those has to be argued from the act.

#### Acts that do not teach

Every row in Table 1 is a vehicle of **teaching**, and its default register and ceiling answer one question: how much authority
does the teaching carry? A good deal of what the popes issue never asks it. An Urbi et Orbi is a solemn blessing with an
indulgence attached, preceded by an address — vatican.va files it under *Messaggi*, and the
[Francis shelf](https://www.vatican.va/content/francesco/it/messages/urbi.index.html) also holds the extraordinary *Momento
straordinario di preghiera* of 27 March 2020, plainly a liturgical event. A bull of canonization pronounces a formula. And the
Latin-incipit tail of the *Lettere Apostoliche* shelf — *Regionis Capitanatae*, *Sanctus Adalbertus*, *Ad aptius fovendas* — and
the toponym-headed apostolic constitutions beside it are acts of **governance**: erecting and reorganising dioceses, proclaiming
patrons, approving statutes. For these a default register of Authentic Ordinary is not so much wrong as beside the point. A
decree that erects a diocese teaches nothing that could be assessed.

The registry therefore carries an optional document-level flag, **`actKind`** — `teaching` · `governance` · `liturgical` — with
absence meaning `teaching`. The operative act of such a document is not a statement Table 2 assesses, and its genre’s default
register does not describe it; a passage in it that does teach — the address before the blessing — is assessed per statement as
anywhere else, so the flag never forbids an Assessment. The flag is **never authority-bearing**: like `keywords`, it makes no
claim about register or definitiveness, and no invariant couples it to a genre, a ceiling or an Assessment. It is populated today from one evidenced source only: the **777** apostolic
constitutions whose circumscription keyword (an erection, elevation or union of sees, read from the heading or from the
hand-curated adjudication tables) carry `actKind: governance`; the flag is derived from the keyword in the harvester, so the two
cannot disagree. The *Lettere Apostoliche* tail is not yet flagged, because no keyword yet evidences it. Urbi et Orbi keeps its
own Table 1 row so that a reader finds it where they expect to: the row’s ceiling describes the address, and the flag
(`liturgical`) describes the act — every one of the **145** Urbi et Orbi harvested from the *Messaggi* shelves carries it, whether
or not the item belongs to the Christmas or Easter series. Seven items on John XXIII’s *Urbi et Orbi* shelf do not carry it,
because they are not blessings: the radio messages this pope broadcast to the world before Christmas and Easter and on other
occasions, which vatican.va files beside the feast-day messages, are harvested as `message` on curated rows quoting each heading. The discussion is in [#15](https://github.com/CatholicOS/cmddr/issues/15).

Some acts are delivered by a medium the source names in the heading — those same radio messages are *Radiomessaggi*, and
the World Youth Day 2019 and World Mission Day 2025 messages are *Videomessaggi* — and the medium is a fact about the act of
the kind Table 1 records, distinct from what the act does (`actKind`) and from what instrument it is (genre). The registry
records it in an optional **`medium`** — `radio` · `video` — absent meaning the ordinary written or delivered text; a
*Radiomessaggio* that is a feast-day Urbi et Orbi keeps its genre and its `liturgical` flag and simply gains `medium: radio`.
Like `actKind` and `keywords`, the field is **never authority-bearing**: no invariant reads it, and nothing couples it to a
register or a ceiling. It is read from the heading's own word and from nothing else, measured across the corpus first —
**9** *Radiomessaggi* (all John XXIII's) and **2** *Videomessaggi* today; the bare words *radio* and *video*, which would
also tag a commission for cinema, radio and television or a Communications Day theme on videocassettes, are not the rule.
The discussion is in [#27](https://github.com/CatholicOS/cmddr/issues/27).

#### Numbered annual series

A large body of papal messages belongs to **annual series** that run for decades and across pontificates. The World Day of
Peace message opens with Paul VI’s *I Giornata Mondiale della Pace 1968* and continues through John Paul II, Benedict XVI,
Francis and Leo XIV; World Communications Day opens in 1967. vatican.va carries the ordinal in the title as a Roman numeral —
*LI Giornata Mondiale della Pace 2018*, *LII Giornata Mondiale delle Comunicazioni Sociali, 2018* — while the Lent messages are
dated only (*Quaresima 2015: Rinfrancate i vostri cuori*). A series is an entity that outlives its issuer, and tracing a theme
across one — how fifty-odd messages treat migration, or communications — is exactly the kind of traversal this data should
support.

The registry records this with an optional **`series`** object on the document,
`{ "id": "world-day-of-peace", "year": 2018, "ordinal": 51 }`, the ordinal optional; `id` resolves against
[`data/series.json`](data/series.json), one row per occasion under a canonical English id, each row listing every vatican.va
sub-shelf slug the occasion has been filed under (`missions` and `mission`, `nonni` and `grandparents`), recording whether the
series is numbered and, where a shelf reaches the first occasion (*I Giornata…*), the verified `firstYear` — nine of the sixteen
occasions, from Paul VI's Peace 1968 and Communications 1967 to Francis's World Children's Day 2024. Consistent with the
chancery-shelves note above, these are a vocabulary of **occasions**, not of genres: a World Day of Peace message is a message
whichever day it is for, and `series` says only where it stands in a sequence. It is discovery metadata with **no bearing on
register, ceiling or assent**. The discussion is in [#16](https://github.com/CatholicOS/cmddr/issues/16).

A document in a series is keyed by its occasion, not by its first words: `mag:francis-i/world-day-of-peace-2025`,
`mag:paul-vi/world-day-of-peace-1968`, `mag:francis-i/lent-2015`. The year in the id is the **occasion year** the title prints
(`series.year`), not the year of `date`, because the two routinely disagree — the message for the LVIII World Day of Peace,
1 January 2025, is signed *Dal Vaticano, 8 dicembre 2024*, and the Peace messages are dated 8 December of the preceding year as
a rule; the 1976 message is dated 18 October 1975. Under the incipit rule "the 2025 Peace message" would have been minted as
`…-2024`, an id nobody would guess on a document nobody cites by its first words (the *Acta Apostolicae Sedis* index cites these
by occasion: *Nuntius S.P. pro XCVII Die Mundiali Missionum*). The ordinal is recorded only where the title prints it — as a
Roman numeral on most numbered series, Arabic on migration and vocations (*110ª*, *62a*), not at all on Lent, Missions, Food or
Literacy — and is never computed from `firstYear`; where both are present, invariant 24 checks one against the other, which is
how a mistyped *XXXIIII* and a *XXIV* printed for a XXXIV were caught before entering an id. A series' printed numbering can
also be reset by the Holy See — the Care of Creation message of 2025 is titled *X*, repeating 2024's *X*, so that the edition
matched the tenth anniversary of *Laudato si'* in the Jubilee year, and 2026 is *XI* — and the vocabulary records such a
reset (`renumberings`) rather than the registry re-computing numbers. **537** series documents across sixteen series and five
pontificates (Paul VI → Leo XIV) are harvested this way — 526 messages and the 11 homilies Francis gave on the World Day for
Consecrated Life, which vatican.va files on the series shelf and which are members of the series whatever their genre —
together with the **145** Urbi et Orbi, of which the Christmas and Easter ones form two dated series assigned by date — or, for
the one item whose heading names the feast while the act bears another date (John XXIII’s *Santo Natale* of 22 December 1962,
the shelf’s only Christmas 1962 item), by a curated row. The occasional messages on the year-partitioned
`pont-messages` shelf are not yet harvested ([#4](https://github.com/CatholicOS/cmddr/issues/4)).

#### The Acta Apostolicae Sedis reference

The *Acta Apostolicae Sedis* (AAS, 1909–), and before them the *Acta Sanctae Sedis* (ASS, 1865–1908), are the Holy See's
official gazette. Unlike the shelves, the AAS are the **promulgating instrument**: publication there is what promulgates a
universal law, unless another manner of promulgation has been prescribed in a particular case (CIC can. 8 §1), and an AAS citation — *AAS 87 (1995) 401* for *Evangelium Vitae*, *AAS 115 (2023) 1041* for
*Laudate Deum* — is the citation of record in every scholarly apparatus. The registry records it in an optional
**`acta`** object, `{ "series": "AAS", "volume": 115, "year": 2023, "page": 1041 }`: the series, the volume as the index
prints it, the volume year (a December act is published in the next year's volume) and the **first page**. It is purely
bibliographic — like `keywords` and `series` it has **no bearing on register, ceiling or assent** — and the only invariant
that reads it is 25 in [SCHEMA.md](SCHEMA.md): one page opens one act.

The reference is **joined to** the shelf harvest, not substituted for it. vatican.va publishes a separate annual *Index
generalis* PDF for 2003–2024 and a whole-volume OCR PDF for each year 1909–2002, which carries the same chronological index
in its tail; the harvest parses the *Acta Summi Pontificis* part of each (checked in as text under `tools/fixtures/acta/`:
the ten index PDFs of 2015–2024, the 2003–2014 indexes, the index pages of the five sample volumes of phase 2b — AAS 1 (1909),
9-I (1917), 23 (1931), 50 (1958) and 70 (1978) — of the twenty-six volumes of 1932–1957, AAS 24–49, the pontificates of
Pius XI and Pius XII, of the nineteen of 1959–1977, AAS 51–69, John XXIII and Paul VI, of the twenty-four of 1979–2002,
AAS 71–94, John Paul II, and of the five of 1926–1930, AAS 18–22, Pius XI) and matches every entry in a
harvested category to a document of the pope the
part heading names (Pius X → Francis) by issuer, date and incipit, writing `acta` only where one candidate is evidenced. The join
is reported before it is trusted: **225** Francis documents carry a reference from the ten annual indexes, and every ambiguous
entry, every act the shelves lack and every document two entries claim is listed, classified, in the
[join report](docs/superpowers/reports/2026-09-12-acta-join-2015-2024.md) — whose headline is that vatican.va's Francis shelves
for constitutions and apostolic letters are selections (49 and 59 against the index's 118 and 202), while the *Acta* are the
record. The [sample report](docs/superpowers/reports/2026-09-13-acta-volumes-sample.md) of phase 2b-i measures the century's
typography and OCR the same way, volume by volume, with a parse rate per volume: **131** references from the five volumes and
the 2012 index (Pius XII's 1958 alone carries 73), and the findings that decide the rest of 2b — the OCR text of AAS 1 and 9-I
has lost the page column of most index pages, the columnar layout of 1909–1931 dates some acts to the month only, and a volume
can print an act another volume already published. Phase 2b-ii-a ([era report](docs/superpowers/reports/2026-09-13-acta-volumes-1932-1957.md))
joined the twenty-six volumes of 1932–1957 the same way: **144** references, thin because the Pius XI and Pius XII shelves are
(18 and 227 records dated in the era), twenty-two of the volumes above the 95 % parse-rate floor and the four below it
explained line by line, every OCR misreading of a date the parser admits measured on a named volume, a year the index
does not print (a `»` with nothing above it, a token the OCR has broken) left blank and supplied only by a curated row
quoting the act's own dating formula — so that *Munificentissimus Deus* and *Humani generis*, at the head of AAS 42, are
cited — and a year the OCR misread inside the century never repaired but corrected the same way. Phase 2b-ii-b ([era
report](docs/superpowers/reports/2026-09-13-acta-volumes-1959-1977.md)) joined the nineteen volumes of 1959–1977: **800**
references, full where the earlier eras were thin because the John XXIII and Paul VI shelves carry their acts up to 1972,
every volume above the floor once eight of them were extracted in pypdf's default mode (in this era the layout mode fuses
lines and the default mode keeps the dates, the opposite of 1909–1957), the join's toponym rule reading the mother see and
the new see the index prints in parentheses against shelves that title an erection by either. The sixteen documents of the
Second Vatican Council are in those volumes under a part of their own, `Acta Ss. Oecumenici Concilii Vaticani II`, which the
parser skips: they stay under `oec:vatican-ii` with no reference, their pages listed in the report for a curated one. Phase
2b-ii-c ([era report](docs/superpowers/reports/2026-09-13-acta-volumes-1979-2014.md)) joined the twenty-four volumes of
1979–2002 and the index PDFs of 2010, 2011, 2013 and 2014: **1,421** references, the era being a join rather than a harvest
because John Paul II's shelves are the registry's largest, the matcher reading the shelf's incipit without the addressee
vatican.va appends in parentheses (*Tanta est (Episcopus Ipialensis)*), every source but one above the 95 % floor (AAS 80's
text layer drops the words of eight messages), eighteen pages the volumes set two apostolic letters on read and curated,
and the join's largest residue characterised rather than loosened: from 1989 the index prints a constitution without its
toponym while vatican.va titles it by the see alone, so 167 same-day erections stay ambiguous. An act the *Acta* print twice
— *Ibi vacabimus* in 2012 and 2020, *Deus caritas* twice in 2014 — carries one reference, the first printing's, by a curated
table (`ACTA_REPRINTS`) that quotes both fascicles. Phase 2b-iii-a ([era report](docs/superpowers/reports/2026-09-18-acta-volumes-1926-1930.md))
joined the five volumes of 1926–1930, the early volumes whose OCR kept the page column: **66** references, 53 of them AAS 21's
(1929), the one year Pius XI's apostolic-letters shelf holds in number, and the year the 1930 index's OCR lost at the head of
three sections (`1J30`, `1030`, `1@30`) supplied by curated rows quoting each act's dating formula. A page the index prints
wrongly for an act it dates and names — the OCR's `530` for *Casti connubii* at 539, `307` for the motu proprio *In allocutione*
at 337, the index's own `946` for a constitution that opens at 947 — is replaced from a curated table (`ACTA_PAGE_CORRECTIONS`,
`tools/src/acta/curation.ts`, both pages read in the volume; eight rows on 2026-09-21), applied before the join matches or creates,
so the act is cited at its page and the page it shared with another act by the misprint holds neither. Phase 2b-iii-b
([era report](docs/superpowers/reports/2026-09-21-acta-volumes-1909-1925.md), [spec §10](docs/superpowers/specs/2026-09-13-acta-volumes-design.md))
joined the seventeen volumes of 1909–1925, whose OCR lost the page column on most index pages, after recovering the pages from
the volume bodies (`tools/src/acta/recover.ts`, the sidecars beside the fixtures): of the 1,136 entries opened without a page,
**770** recovered (unique 732, dated 13, fuzzy 25; the era report §1b) and 366 not (205 described by the index without an incipit,
108 of them AAS 1's; 58 incipits opening several pages with no formula to settle them; 61 found nowhere; 26 outside the category's
runs; 14 under a damaged running header; 2 whose one page another entry of the same incipit claims), seventeen more read by hand,
and **113** documents carrying a reference into the seventeen volumes — 111 matched from a quoted index line and two curated; sixteen
encyclicals of Pius X, Benedict XV and Pius XI cite their page, eleven of them recovered. No volume clears the 95 % floor after
recovery (the era's rate is 71.8 %, 78.4 % without AAS 1, whose index describes its acts without incipits): the rate counts every
line the recovery cannot reach, and the reasons are listed per volume rather than the floor lowered. Nineteen curated rows supply
the year the OCR read `1910` for 1916 over nine letters of AAS 9-I (1917) and `191Í` for 1911 over ten of AAS 3, from each act's own
dating formula; twelve pages the volumes set two short letters on are read and curated. Phase 2b′
([era report](docs/superpowers/reports/2026-09-21-acta-volumes-2003-2009.md),
[spec §11](docs/superpowers/specs/2026-09-13-acta-volumes-design.md)) joined the seven annual index PDFs of 2003–2009
(AAS 95–101), which vatican.va serves under a URL its own index page links wrongly — the spec had recorded them as **none
online**, and the premise was the era's first finding: **186** references, every one from a quoted index line (John Paul II 90,
Benedict XVI 96), the fixtures taken from pypdf's layout mode because the default mode drops the spaces between words in
2003–2006, the ditto marks that mode glues to the guillemet, to the day and to the text read at the date position, and the
narrow column's `fullLine: 40` — which the 2010 and 2011 indexes already carry — recovering thirteen acts of harvested
categories that the parser had been dropping in silence, since the line whose page it missed counted in neither term of the
parse rate. All seven parse at 100 % over the harvested categories and 98.6–100 % over all pope-part page lines, and every one
of the hundred lines left unread falls in a category the registry does not harvest. The AAS join now covers 1909–2002 and
2003–2024 without a gap, and the *Acta Sanctae Sedis* of 1865–1908 are phase 2c.

The *Acta* are therefore also a **second source**. An index entry the join leaves unmatched becomes a document of its own
(phase 2a, `tools/src/acta/create.ts`) when its category is one the registry creates from the *Acta* — encyclicals,
exhortations, constitutions, motu proprio, apostolic letters, and the bull class of canonisation decretals and *sub plumbo*
letters — **and** the vatican.va shelf that carries that class is harvested for the pope, so that the fuller shelves (`letters`,
`speeches`, `homilies`, the occasional `pont-messages`), which bring a URL and a vernacular title, are harvested first and the
*Acta* fill their residue afterwards. The record is minted from the index's incipit exactly as a shelf incipit mints (provisional
where the index names a constitution by toponym alone), titled with the index's own entry, and carries `source.shelf` of the form
`aas/{year}` with `url: null` and its `acta` reference as source and citation both; it carries no `keywords` or `actKind`, since an
index line evidences neither. A **duplicate guard** holds, rather than creates, anything the shelf may already have: a same-date
record carrying the entry's incipit or toponym under another class (the shelf and the *Acta* disagree about class, discussion
[#30](https://github.com/CatholicOS/cmddr/discussions/30)), a same-date record with no incipit (vatican.va files canonisation
decretals on `apost_letters` without one; the Tarragona letters of [#31](https://github.com/CatholicOS/cmddr/issues/31)), a
same-incipit record a day off or anywhere in the pontificate, and two entries of one date with one incipit, which no form of the
id tells apart. Measured on 2026-09-13, with the 2012 index joined: **265** AAS-only documents created from the ten annual
indexes (260 of Francis, 5 of Benedict XVI; 150 apostolic letters, 76 constitutions, 39 bulls) — one fewer than on
2026-09-12, since Benedict XVI's *Ibi vacabimus* is printed in both the 2012 and the 2020 volumes and the id-collision rule
now holds both — and **460** entries held with a reason: 267 in categories that wait for their shelf, 81 *Epistulae* whose
pope's *letters* shelf is not harvested, 43 by the guard, 40 ambiguous, 24 claimed twice, 3 id collisions, 1 dated before the
pontificate, 1 with no resolvable date; no shelf id changed. The [join report](docs/superpowers/reports/2026-09-12-acta-join-2015-2024.md)
lists every creation with the index line it rests on and every hold with its candidates. Phase 2b-i added **146** documents
from the sample volumes and the 2012 index (Pius XI's 1931 volume alone 60: the shelves of the early twentieth century are
thinner still than Francis's), created by the same rule — an *Epistula* only where the pope's `letters` shelf is harvested, a
constitution or apostolic letter minted from the incipit the volumes print beside the toponym — with `source.url` the
whole-volume PDF, and held **98** ([sample report](docs/superpowers/reports/2026-09-13-acta-volumes-sample.md)). Phase 2b-ii-a
added **1,636** from the twenty-six volumes of 1932–1957 — 472 of Pius XI and 1,164 of Pius XII from this era (532 and 1,234 in all); 631 constitutions and bulls, most
of them named by the see alone and therefore provisional, 563 apostolic letters, 441 letters — and held **434**, among them the
vernacular texts of four encyclicals the index enters a second time (curated), the entries whose page another act cites where
the volume prints one (a new *page-shared* hold), and every incipit the OCR has damaged, which is never minted into an id the
page does not print ([era report](docs/superpowers/reports/2026-09-13-acta-volumes-1932-1957.md)); four pages the volumes print
two short letters on were read and curated. Phase 2b-ii-b added **655** from the nineteen volumes of 1959–1977 — 294 of John
XXIII, 327 of Paul VI, 34 last acts of Pius XII; 331 constitutions and 321 apostolic letters, minted from the incipit the
volumes print beside the toponym — none from 1967–1970 and 1972, where Paul VI's shelves hold what the index prints, and
45–59 a year from 1973, where vatican.va's shelves for his constitutions and letters stop; the *Epistulae* and canonisation
decretals of both popes are held, their `letters` and `bulls` shelves not being harvested. It held **775**, among them the
twenty-nine cardinalatial-title constitutions of 1965 and 1967 the index names by incipit and the shelf by church, and it
re-minted one id of the sample (three constitutions *Qui divino* of 1977 take the full-date form) and no shelf id
([era report](docs/superpowers/reports/2026-09-13-acta-volumes-1959-1977.md)). Phase 2b-ii-c added **94** from the
twenty-four volumes of 1979–2002 and the four index PDFs of 2010–2014 — 43 of John Paul II (his constitutions of 1982–1983
and 1989, where his shelf is thin, and six canonisation decretals, the rest of which the guard holds as the class mismatches
of discussion #30) and 51 of Benedict XVI (the beatification letters of 2007–2012 his shelf lacks) — and held **750**, 266 of
them the toponym-less constitutions the join could not tell apart; it re-minted no shelf id, and its rule for an incipit the OCR
split or set in capitals (*H orti conclusi*, *QUO gravius*) holds sixteen records the earlier eras had minted under such
readings ([era report](docs/superpowers/reports/2026-09-13-acta-volumes-1979-2014.md)). Phase 2b-iii-a added **277** of
Pius XI from the five volumes of 1926–1930 — 138 apostolic letters, 87 letters (his letters shelf being harvested), 41
constitutions, 5 decretals and 6 motu proprio, the era being a harvest more than a join since vatican.va holds fifteen of
his acts of 1926, 1927 and 1930 — and held **53**; *Quo maiori rerum* (30 March 1930), printed in AAS 22 and again in AAS 23,
is created from the first printing by the reprint table, and the Italian text of *Divini illius Magistri* the 1929 index enters
as an encyclical of its own is held as the 1933 and 1937 vernaculars are
([era report](docs/superpowers/reports/2026-09-18-acta-volumes-1926-1930.md)). Phase 2b-iii-b
([#25](https://github.com/CatholicOS/cmddr/issues/25), [spec §10](docs/superpowers/specs/2026-09-13-acta-volumes-design.md),
[era report](docs/superpowers/reports/2026-09-21-acta-volumes-1909-1925.md)) added **458** from the seventeen volumes of
1909–1925 with the pages the volume bodies gave back — 192 letters of Pius X and Pius XI (Benedict XV's letters shelf is not
harvested, so his 279 stay held), 190 apostolic letters, 56 constitutions, 12 motu proprio, 4 *sub plumbo* and 4 decretal
letters — and held **537**; the shelves of Pius X and Benedict XV being thin, the era is a harvest. Five entries whose incipit
the index OCR misspells into a well-formed word the body contradicts (*Placet oculog* for *oculos*) are held by curated rows, as
*Begnum Dei* is. The acts of weight the recovery left without a page were read by hand (`ACTA_PAGE_READINGS`, seventeen rows,
each quoting the page the act opens on and its dating formula): the encyclicals *Ad beatissimi Apostolorum Principis*, *Quod iam
diu*, *Principi Apostolorum Petro* and *Annus iam plenus* and the constitution *Sapienti Consilio* now cite their pages, and
eleven constitutions and motu proprio are created at theirs; the 349 entries still without a page are neither created nor
cited. Two references are curated (`ACTA_CURATED_REFERENCES`): *Providentissima Mater Ecclesia* (27 May 1917) opens AAS 9 part
II — the Code of 1917, which has no chronological index — at p. 5; and *Ubi arcano Dei consilio* (23 December 1922) is cited at
its Latin printing, AAS 14 (1922) 673, whose index line lost its date columns and opens no entry, the row displacing the match
of the Italian printing (AAS 15 (1923) 5) it names and quotes. Phase 2b′
([era report](docs/superpowers/reports/2026-09-21-acta-volumes-2003-2009.md),
[spec §11](docs/superpowers/specs/2026-09-13-acta-volumes-design.md)) added **79** from the seven index PDFs of 2003–2009 —
65 of Benedict XVI and 14 of John Paul II; 67 apostolic letters of the beatification series, 6 constitutions, 4 canonisation
decretals and 2 motu proprio — and held **232**: 79 in categories that wait for their shelf (72 of them *Nuntii*), 60
ambiguous, 36 on shelves not harvested for these popes, 34 by the guard, 14 claimed twice, 7 id collisions and 2 incipits the
text layer damaged. It re-minted no shelf id and needed no curated row of any kind. Forty-five of the sixty ambiguous entries
are circumscription constitutions of a single day, which the index names by incipit and vatican.va by see. The era report's
§11 lists **163** shelf documents of the two popes dated in the volume years that carry no reference, 119 of them of the formal
genres, most dated to a canonisation or beatification day whose decretal the *next* volume prints; the one act of weight with
an entry of its own and no reference is John Paul II's *Pastores gregis*, which the 2004 index dates 5 October 2003, the
closing of the Synod, and vatican.va's shelf 16 October, the signing, so the guard holds the entry rather than mint a second
record. The
remaining phase is 2c, the *Acta Sanctae Sedis* of 1865–1908, whose indexes carry no date or incipit and are confirmed by hand.

### The document registry

Concrete documents live in [`data/documents/`](data/documents/), rendered as
[`registry/documents.md`](registry/documents.md). Identifiers follow
`mag:{issuer}/{incipit-slug}-{year}` — or `mag:{issuer}/{series-id}-{occasion-year}` for a document in an annual series (see
*Numbered annual series* above) — and reference popes and councils by their
[CRPDR](https://github.com/CatholicOS/crpdr) `rp:` and
[COECDR](https://github.com/CatholicOS/coecdr) `oec:` identifiers. The registry is generated by
`npm run harvest` and checked by `npm run validate`; see
[SCHEMA.md](SCHEMA.md#identifier-minting).

---

### Table 2 — Statement Assessments

*The discerned authority of an individual passage, keyed by a `locus` (`document-id` + section/paragraph). This layer is curated
and **interpretive**: entries carry provenance and may be marked `contested`. Reformability is **derived** from `Intent`
(non-definitive ⇒ reformable; definitive ⇒ irreformable); infallibility is **computed** (`Intent = definitive` AND issuer capacity
is the supreme magisterium).*

| Locus | Mode exercised | Intent | Object | Assent owed | Reformability | Source / status |
|---|---|---|---|---|---|---|
| `mag:vatican-ii/lumen-gentium-1964#*` | Authentic Ordinary | Non-definitive | — | *religiosum obsequium* | Reformable | Vatican II defined nothing “even in the two documents which it called ‘dogmatic constitutions’.” |
| `mag:john-paul-ii/evangelium-vitae-1995#57` (murder) | Ordinary Universal | Definitive | Revealed | *fides divina et catholica* | Irreformable | Taught “by the ordinary and universal magisterium.” |
| `mag:john-paul-ii/evangelium-vitae-1995#62` (abortion) | Ordinary Universal | Definitive | Revealed / connected | *fides divina et catholica* | Irreformable | idem; object primary-vs-secondary debated. |
| `mag:john-paul-ii/evangelium-vitae-1995#65` (euthanasia) | Ordinary Universal | Definitive | Secondary / connected | firmly hold (*fides ecclesiastica*) | Irreformable | idem; secondary object — “in harmony with … my Predecessors”; classification debated. |
| `mag:john-paul-ii/ordinatio-sacerdotalis-1994#4` | Ordinary Universal | Definitive | Secondary / connected | firmly hold (*fides ecclesiastica*) | Irreformable | “to be definitively held”; not *ex cathedra* per Ratzinger — status debated. |

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
