# Adjudicating the Circumscription Candidate Queue

*Design spec — 2026-09-11*

## 1. Purpose

`registry/documents.md` states on its own front page that **742 apostolic constitutions have not
yet been confirmed as circumscription erections**. The number is honest but the queue it describes
cannot empty, and that is the real defect this spec fixes.

A candidate stops being counted only by acquiring a `circumscription-erection` or
`circumscription-elevation` keyword. Nothing records the verdict "read, and it is neither." The
first curation instalment shows the consequence exactly: it read 29 Pius XII candidates and
confirmed 19 as erections, finding that nine were elevations and one (`Leonensis`) was not a
circumscription document at all — it raised a parish church to collegiate status. Those ten were
read, judged, and documented in a code comment, and all ten are still counted among the 742 today.

Grinding the whole queue as erections-only would leave roughly a quarter of it permanently
unconfirmed, with no machine-readable trace that anyone had looked.

This spec adjudicates every one of the 742 to a verdict.

## 2. Evidence base

Every candidate was fetched from vatican.va on 2026-09-11 — all 742, not a sample — and the
findings below come from reading what they print.

### 2.1 The argumentum

Each apostolic constitution prints, immediately under its toponym heading and before the body, an
all-capitals line stating its own act:

```text
DIUGUENSIS*        IN BENINO NOVA CONDITUR DIOECESIS DIUGUENSIS
KASAMAËNSIS ET ALIARUM*  KASAMAËNSIS DIOECESIS AD GRADUM ET DIGNITATEM ECCLESIAE
                         METROPOLITANAE EVEHITUR.
TREIENSIS *        DE UNIONE DIOECESIS TREIENSIS CUM DIOECESI SANCTI SEVERINI
BRACARENSIS *      REVISIO ET APPROBATIO NOVI BREVIARII
HASSELETENSIS*     IN DIOECESI HASSELETENSI, RECENS CONDITA, CANONICORUM COLLEGIUM CONSTITUITUR.
```

This is the document's own summary of what it does, in its own words, and it is present on 728 of
the 742. It is a better basis for adjudication than hunting operative verbs in the body, for a
reason §2.2 makes concrete.

The line is delimited mechanically: it is the run of upper-case tokens following
`CONSTITUTIO APOSTOLICA`, ending at the first mixed-case word, which is where the narrative body
begins.

### 2.2 Operative verbs cannot classify these documents

The first attempt matched Latin verbs in the body across a 25-document sample. It fails, and not
marginally:

| pattern class | matched |
|---|---|
| erection (`condimus`, `erigimus`, `constituimus`…) | 18 / 25 |
| elevation (`evehimus`, `ad gradum et dignitatem`…) | 16 / 25 |
| division (`distrahimus`, `dividimus`…) | 14 / 25 |
| nothing | 3 / 25 |

Most documents match all three, because an erection decree *contains* an elevation clause — the
new circumscription's principal church is raised to cathedral, `templum … ad statum Cathedralis
Ecclesiae evehimus` — and *contains* a division clause, because territory must be detached to form
it. The verbs are all genuinely present. Only the principal act distinguishes the documents, and
only the argumentum states it.

Two concrete traps from that sample:

- Paul VI's `Hasseletensis` matches erection on `Canonicorum collegium constituimus`, which erects
  a **chapter of canons**, not a circumscription — the same class as the `Leonensis` false positive
  the first instalment caught by hand.
- John Paul II's `Bonaventurensis` matches *only* the elevation verb, on its cathedral clause, and
  a mechanical reading would file an erection as an elevation.

### 2.3 The triage abstains; it does not contradict

Classifying by argumentum was validated against the only batch with human ground truth — the 29
Pius XII candidates the first instalment read by hand:

| human verdict | count | triage |
|---|---|---|
| erection | 19 | 15 erection, **4 abstained** |
| elevation | 9 | 9 elevation |
| not a circumscription act | 1 | 1 not a circumscription act |

**Zero contradictions in 29.** Every failure is an abstention, never a wrong verdict. The four
misses use erection idioms the patterns do not yet know (`NOVA FIT DIOECESIS`, `IN NOVAE DIOECESIS
FORMAM REDIGUNTUR`, `EXSTINGUITUR ATQUE … SEPARANTUR`). This is the property that makes the triage
safe to use as a proposal engine: it can leave work undone, but it does not assert falsehoods.

### 2.4 What the 742 actually contain

| verdict | count | share |
|---|---|---|
| erection | 529 | 71.3% |
| elevation | 139 | 18.7% |
| needs individual reading (31 unclassified + 14 without an argumentum) | 45 | 6.1% |
| not a circumscription act | 16 | 2.2% |
| union | 8 | 1.1% |
| reorganisation | 2 | 0.3% |
| name or title change | 2 | 0.3% |
| restitution of a suppressed see | 1 | 0.1% |

By pontificate:

| issuer | candidates | erection | elevation | other | needs reading |
|---|---|---|---|---|---|
| `rp:john-paul-ii` | 390 | 294 | 67 | 11 | 18 |
| `rp:paul-vi` | 222 | 153 | 48 | 6 | 15 |
| `rp:benedict-xvi` | 90 | 67 | 11 | 2 | 10 |
| `rp:john-xxiii` | 27 | 15 | 4 | 6 | 2 |
| `rp:pius-xii` | 10 | 0 | 9 | 1 | 0 |
| `rp:benedict-xv` | 3 | 0 | 0 | 3 | 0 |

## 3. Vocabulary

`data/keywords.json` states that mergers and boundary changes "get their own terms when evidence
for them appears." Evidence has now appeared, unevenly: eight unions, but only one restitution and
two each of reorganisation and name change.

**One new term is minted: `circumscription-union`.** Eight documents across three pontificates is a
recurring act and earns a term. One or two documents is not yet evidence of a category, and a
Keyword Registry row describing a single document would be a term invented to fit a case rather
than a category the corpus demonstrates.

```json
{
  "id": "circumscription-union",
  "gloss": "The act unites two or more existing ecclesiastical circumscriptions — whether merging them into one, or joining them aeque principaliter under a single bishop.",
  "note": "Covers union only. Does not cover erection (circumscription-erection), elevation in rank (circumscription-elevation), restitution of a suppressed see, boundary revision, or a change of name or title; those are recorded in CANDIDATE_ADJUDICATIONS with the act named, and earn their own terms if further evidence accumulates. Populated from a hand-curated table quoting each document's own argumentum."
}
```

The remaining five act-types are recorded in prose rather than tagged, and will earn terms if more
of them turn up.

## 4. The four tables

All four key on `${pageSlug}|${slugify(incipit ?? title)}|${isoDate}`, the shape `DATE_CORRECTIONS`,
`CIRCUMSCRIPTION_ERECTIONS` and `RECOVERED_INCIPITS` already use, and every row quotes the
document's own argumentum verbatim.

| table | rows | file | effect |
|---|---|---|---|
| `CIRCUMSCRIPTION_ERECTIONS` (exists, 19 rows) | + ~529 | `mappings/keywords.ts` | keyword `circumscription-erection` |
| `CIRCUMSCRIPTION_ELEVATIONS` (new) | ~139 | `mappings/circumscriptions.ts` | keyword `circumscription-elevation` |
| `CIRCUMSCRIPTION_UNIONS` (new) | 8 | `mappings/circumscriptions.ts` | keyword `circumscription-union` |
| `CANDIDATE_ADJUDICATIONS` (new) | ~21 | `mappings/circumscriptions.ts` | no keyword; records the verdict |

`keywords.ts` is already large; the three new tables go in a new `mappings/circumscriptions.ts`
rather than growing it further, and `CIRCUMSCRIPTION_ERECTIONS` moves there with them so the four
sit together.

### 4.1 `CANDIDATE_ADJUDICATIONS` names the act rather than denying one

The table presented in the design discussion was called `ADJUDICATED_NON_CIRCUMSCRIPTION`. That
name is wrong for five of its rows: a restitution, a reorganisation and a name change *are* acts
about circumscriptions — they simply are not acts this registry mints a term for yet. The table
records a verdict, not an absence:

```ts
export const CANDIDATE_ADJUDICATIONS: Record<string, { act: string; note: string }> = {
  'benedict-xv|bracarensis|1919-05-14': {
    act: 'revision and approval of a new Breviary',
    note: 'Argumentum: "BRACARENSIS * REVISIO ET APPROBATIO NOVI BREVIARII". Not a '
        + 'circumscription act at all; the toponym in the heading is the Archdiocese of Braga, '
        + 'whose proper Breviary this revises.',
  },
};
```

`act` is free text naming what the document does. A row here means the document was read and
judged, which is exactly what the 742 count has never been able to express.

## 5. The single code change

`isUnconfirmedCandidate` retires a candidate only when it carries a circumscription keyword:

```ts
if (d.keywords?.includes('circumscription-erection')) return false;
if (d.keywords?.includes('circumscription-elevation')) return false;
```

It must also retire one that appears in `CANDIDATE_ADJUDICATIONS`, or the 21 adjudicated documents
stay in the count forever despite having been read — reproducing, in a new place, the exact defect
§1 describes.

A `DocumentRecord` carries no `pageSlug`, so the key cannot be rebuilt from it directly. The
inverse of `VATICAN_SLUG_TO_ISSUER` supplies it, derived from `POPES` in the same place the forward
map is built, so the two cannot disagree.

The new `circumscription-union` keyword also retires a candidate, by the same rule as the other two.

## 6. The 45 that abstain

31 candidates carry an argumentum the triage cannot classify and 14 carry none at all. These are
read individually against their body text, as the first instalment read all 29 of its own. They are
not guessed at, and they are not left in the queue: each ends in one of the four tables with a note
quoting whatever the document does state.

Their distribution is uneven — 10 of Benedict XVI's 90 have no argumentum, against 1 of John Paul
II's 390 — which is itself worth recording, since it suggests a formatting change in how the
`apost_constitutions` shelf was transcribed for that pontificate rather than anything about the
acts themselves.

## 7. Validation

Beyond the existing invariants:

1. **Every row's quote must fit its table.** An erection row whose argumentum says `EVEHITUR` and no
   erection idiom fails the build. This audits the sorting rather than trusting it, and is the
   check that would catch a systematic misfiling of a whole instalment.
2. **Closed set, both directions.** A row matching no harvested record fails, as
   `RECOVERED_INCIPITS` and the Vatican II table already require.
3. **No document in two tables.** The four tables partition the candidates; an id in two of them is
   a curation error.
4. **The queue reaches zero.** After the final instalment, `isUnconfirmedCandidate` returns false
   for every record in the corpus, and the Coverage section says so rather than naming a number.
5. **Ground truth holds.** The 19 erections the first instalment confirmed by hand keep their
   keyword, and the ten it rejected land as nine elevations and one adjudication.

## 8. Instalments

Committed per pontificate, smallest first: Benedict XV (3), Pius XII (10), John XXIII (27),
Benedict XVI (90), Paul VI (222), John Paul II (390). Each is a reviewable diff, and a systematic
error in method surfaces on three documents rather than on 742.

The first instalment carries the schema work — the new tables, the new keyword, the
`isUnconfirmedCandidate` change, the validation — so the five that follow are data only.

## 9. Out of scope

- **Secondary acts.** An erection that also redraws a neighbour's boundary is tagged an erection.
  The argumentum names the principal act; that is what is recorded. Tagging every act a document
  performs is a different and much larger design.
- **The other 3543 documents.** Only the 742 flagged by `isErectionCandidate` are in scope. A
  circumscription act filed outside the `apost_constitutions` shelves is not sought here.
- **New terms for the five singleton act-types.** Recorded in prose (§3); they earn terms when the
  corpus shows more of them.
- **Re-reading the 19 already-confirmed erections.** They keep their existing hand-written notes,
  which quote body clauses rather than argumenta. Rewriting them to the new evidence convention
  would churn correct rows for uniformity alone.
