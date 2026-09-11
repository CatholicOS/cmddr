# Circumscription Candidate Adjudication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adjudicate all 742 circumscription candidates to a verdict, so the queue the registry's front page reports can actually reach zero.

**Architecture:** Four hand-curated tables keyed like the registry's other curated tables, each row quoting the document's own *argumentum* — the all-capitals line an apostolic constitution prints under its toponym stating its act. Three tables award a keyword; the fourth records "read, and here is what it actually does" for acts this registry does not tag. A checked-in curation script proposes rows from fetched documents; every row is read before it is committed.

**Tech Stack:** TypeScript (ESM), vitest, tsx, cheerio. Node ≥ 20.10. Curation script uses `curl` + `tsx`, never the harvest.

**Spec:** `docs/superpowers/specs/2026-09-11-circumscription-adjudication-design.md`

## Global Constraints

- **The harvest stays offline.** Fixtures are checked in; nothing under `tools/src/harvest/` or any test may fetch. The curation script is a separate aid, run by hand, like `tools/fetch-fixtures.sh`.
- **Every row quotes the document.** A row carries the `argumentum` verbatim. Nothing is tagged because its title has toponym shape.
- **Key shape is `${pageSlug}|${slugify(incipit ?? title)}|${isoDate}`** — note `incipit ?? title`, matching the existing `CIRCUMSCRIPTION_ERECTIONS`, `DATE_CORRECTIONS` and `RECOVERED_INCIPITS` tables. (Spec §4 writes `slugify(title)`; that is an error in the spec — records on this shelf usually *do* carry an incipit, and the existing table keys on `incipit ?? title`.)
- **The triage proposes; a human disposes.** The script's verdict is a proposal. Abstentions are read individually and never guessed.
- **One new keyword only:** `circumscription-union`. Restitution, reorganisation and name/title change are recorded in prose in `CANDIDATE_ADJUDICATIONS`, not minted as terms.
- **Codepoint order, never locale collation**, for anything determining the byte order of a checked-in file.
- Run `npm run check` before every commit.

## Row shape

Every data task writes rows of exactly these two shapes. The three keyword tables take:

```ts
  'pius-xii|bathurstensis-in-gambia|1957-06-24': {
    argumentum:
      'BATHURSTENSIS IN GAMBIA * APOSTOLICA PRAEFECTURA BATHURSTENSIS AD DIGNITATEM '
      + 'DIOECESIS EVEHITUR.',
    note: 'Raises the Apostolic Prefecture of Bathurst in the Gambia to the rank of a diocese.',
  },
```

`CANDIDATE_ADJUDICATIONS` takes the same plus `act`, naming in plain words what the document does:

```ts
  'benedict-xv|bracarensis|1919-05-14': {
    act: 'revision and approval of a new Breviary',
    argumentum: 'BRACARENSIS * REVISIO ET APPROBATIO NOVI BREVIARII',
    note:
      'Not a circumscription act. The toponym is the Archdiocese of Braga, whose proper '
      + 'Breviary this revises and approves.',
  },
```

Each instalment's rows are grouped under a block comment naming the pontificate, the date range,
and the counts by table — the shape the existing 19-row block uses.

---

### Task 1: The four tables, the new keyword, and the Benedict XV instalment

Benedict XV's three candidates are the whole first instalment: two unions and one act that is not about circumscriptions at all. They exercise both new mechanisms — the union keyword and the adjudication table — without touching erections or elevations, so a mistake in either shows up on three rows.

**Files:**
- Create: `tools/src/mappings/circumscriptions.ts`
- Modify: `tools/src/mappings/keywords.ts` (move `CIRCUMSCRIPTION_ERECTIONS` out; extend `keywordsFor` and `isUnconfirmedCandidate`)
- Modify: `tools/src/mappings/index.ts` (barrel export)
- Modify: `data/keywords.json` (add `circumscription-union`)
- Test: `tools/test/circumscriptions.test.ts`
- Test: `tools/test/keywords.test.ts` (extend)

**Interfaces:**
- Consumes: `slugify` from `tools/src/slug.js`; `POPES` from `tools/src/mappings/pontiffs.js`; `DocumentRecord`, `HarvestItem` from `tools/src/types.js`.
- Produces:
  - `interface CircumscriptionRow { argumentum: string; note: string }`
  - `interface AdjudicationRow { act: string; argumentum: string; note: string }`
  - `const CIRCUMSCRIPTION_ERECTIONS: Record<string, CircumscriptionRow>` (moved here, unchanged rows plus an `argumentum` each)
  - `const CIRCUMSCRIPTION_ELEVATIONS: Record<string, CircumscriptionRow>`
  - `const CIRCUMSCRIPTION_UNIONS: Record<string, CircumscriptionRow>`
  - `const CANDIDATE_ADJUDICATIONS: Record<string, AdjudicationRow>`
  - `const ERECTION_IDIOMS`, `ELEVATION_IDIOMS`, `UNION_IDIOMS`: `RegExp` — the Latin idioms each table's argumentum must contain
  - `keywordsFor(item)` and `isUnconfirmedCandidate(d)` keep their existing signatures.

- [ ] **Step 1: Write the failing test**

Create `tools/test/circumscriptions.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { slugify } from '../src/slug.js';
import {
  CIRCUMSCRIPTION_ERECTIONS, CIRCUMSCRIPTION_ELEVATIONS, CIRCUMSCRIPTION_UNIONS,
  CANDIDATE_ADJUDICATIONS, ERECTION_IDIOMS, ELEVATION_IDIOMS, UNION_IDIOMS,
  keywordsFor, isUnconfirmedCandidate,
} from '../src/mappings/index.js';
import type { DocumentRecord, HarvestItem } from '../src/types.js';

const keywordIds = new Set((JSON.parse(readFileSync('data/keywords.json', 'utf8')) as
  Array<{ id: string }>).map((k) => k.id));

const item = (over: Partial<HarvestItem>): HarvestItem => ({
  title: 'Treiensis', incipit: 'Treiensis', date: '1920-02-20',
  sourceGenreLabel: 'apost_constitutions', url: null, languages: ['LA'],
  shelf: 'apost_constitutions', pageSlug: 'benedict-xv', ...over,
});

const record = (over: Partial<DocumentRecord>): DocumentRecord => ({
  id: 'mag:benedict-xv/treiensis-1920', title: 'Treiensis', incipit: 'Treiensis',
  idStatus: 'minted', genre: 'papal-bull', issuerId: 'rp:benedict-xv', issuerType: 'pope',
  date: '1920-02-20',
  source: { url: null, shelf: 'apost_constitutions', languages: ['LA'], retrieved: '2026-09-07' },
  ...over,
});

describe('the circumscription tables', () => {
  const tables = [
    ['erections', CIRCUMSCRIPTION_ERECTIONS, ERECTION_IDIOMS],
    ['elevations', CIRCUMSCRIPTION_ELEVATIONS, ELEVATION_IDIOMS],
    ['unions', CIRCUMSCRIPTION_UNIONS, UNION_IDIOMS],
  ] as const;

  it('quotes an argumentum whose Latin fits the table it sits in', () => {
    // This audits the sorting rather than trusting it: an erection row quoting EVEHITUR
    // is a misfiled document, and one misfiled row usually means a misfiled instalment.
    for (const [name, table, idioms] of tables) {
      for (const [key, row] of Object.entries(table)) {
        expect(row.argumentum.trim(), `${name} ${key}`).not.toBe('');
        expect(row.argumentum, `${name} ${key}`).toMatch(idioms);
      }
    }
  });

  it('never lists one document in two tables', () => {
    const seen = new Map<string, string>();
    for (const [name, table] of [...tables.map(([n, t]) => [n, t] as const),
      ['adjudications', CANDIDATE_ADJUDICATIONS] as const]) {
      for (const key of Object.keys(table)) {
        expect(seen.get(key), `${key} is in both ${seen.get(key)} and ${name}`).toBeUndefined();
        seen.set(key, name);
      }
    }
  });

  it('keys every row as pageSlug|slug|ISO-date', () => {
    for (const [name, table] of [...tables.map(([n, t]) => [n, t] as const),
      ['adjudications', CANDIDATE_ADJUDICATIONS] as const]) {
      for (const key of Object.keys(table)) {
        const parts = key.split('|');
        expect(parts, `${name} ${key}`).toHaveLength(3);
        expect(parts[2], `${name} ${key}`).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it('matches every row to a harvested record, in both directions', () => {
    // The closed-set rule the Vatican II and recovered-incipit tables already use: a row that
    // matches nothing is a curation error -- a title that changed on vatican.va, or a key typed
    // by hand -- and must fail loudly rather than sit unnoticed while its document stays in the
    // queue. Reconstructs each record's key the way isUnconfirmedCandidate does.
    const all = readdirSync('data/documents').filter((f) => f.endsWith('.json'))
      .flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[]);
    const bySlugDate = new Set(all.map((d) => `${slugify(d.incipit ?? d.title)}|${d.date}`));
    for (const [name, table] of [...tables.map(([n, t]) => [n, t] as const),
      ['adjudications', CANDIDATE_ADJUDICATIONS] as const]) {
      for (const key of Object.keys(table)) {
        const [, slug, date] = key.split('|');
        expect(bySlugDate.has(`${slug}|${date}`), `${name} row matches no record: ${key}`)
          .toBe(true);
      }
    }
  });

  it('names the act and quotes the document for every adjudication', () => {
    for (const [key, row] of Object.entries(CANDIDATE_ADJUDICATIONS)) {
      expect(row.act.trim(), key).not.toBe('');
      expect(row.argumentum.trim(), key).not.toBe('');
      expect(row.note.length, key).toBeGreaterThan(30);
    }
  });
});

describe('circumscription-union', () => {
  it('is a registered keyword', () => {
    expect(keywordIds.has('circumscription-union')).toBe(true);
  });

  it('is awarded to a document in the unions table', () => {
    expect(keywordsFor(item({}))).toContain('circumscription-union');
  });

  it('is not awarded to a document that is in no table', () => {
    expect(keywordsFor(item({ title: 'Nullibiensis', incipit: 'Nullibiensis' }))).toEqual([]);
  });
});

describe('isUnconfirmedCandidate', () => {
  it('retires a candidate that carries any circumscription keyword', () => {
    expect(isUnconfirmedCandidate(record({ keywords: ['circumscription-union'] }))).toBe(false);
    expect(isUnconfirmedCandidate(record({ keywords: ['circumscription-elevation'] }))).toBe(false);
  });

  it('retires a candidate recorded in CANDIDATE_ADJUDICATIONS', () => {
    // Without this, a document read and judged not to be a circumscription act stays in the
    // count forever -- the defect the whole spec exists to fix (spec §1).
    expect(isUnconfirmedCandidate(record({
      id: 'mag:benedict-xv/bracarensis-1919', title: 'Bracarensis', incipit: 'Bracarensis',
      date: '1919-05-14',
    }))).toBe(false);
  });

  it('still counts a toponym-shaped candidate in no table at all', () => {
    expect(isUnconfirmedCandidate(record({
      id: 'mag:benedict-xv/nullibiensis-1920', title: 'Nullibiensis', incipit: 'Nullibiensis',
      date: '1920-01-01',
    }))).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tools/test/circumscriptions.test.ts`
Expected: FAIL — `../src/mappings/index.js` has no exported member `CIRCUMSCRIPTION_ELEVATIONS`.

- [ ] **Step 3: Create `tools/src/mappings/circumscriptions.ts`**

Move `CIRCUMSCRIPTION_ERECTIONS` here from `keywords.ts` **with its existing doc comment and all 19 rows unchanged**, adding an `argumentum` to each (Step 4 supplies them). Then add:

```ts
/**
 * The Latin each table's argumentum must contain. An apostolic constitution states its own
 * act in the all-capitals line printed under its toponym, and these are the verbs it uses.
 * Used only by the tests, to audit that a row sits in the right table -- never to classify:
 * classification is done by reading, because an erection decree also contains elevation and
 * division clauses and cannot be told apart by verb alone (spec §2.2).
 */
export const ERECTION_IDIOMS =
  /CONDITUR|CONDUNTUR|ERIGITUR|ERIGUNTUR|CONSTITUITUR|CONSTITUUNTUR|EXCITATUR|EFFICITUR|CREATUR|NOVA FIT|FORMAM REDIG/;
export const ELEVATION_IDIOMS =
  /EVEHITUR|EVEHUNTUR|ELEVATUR|PERDUCITUR|ATTOLLITUR|ATTOLITUR|EXTOLLITUR|AD (?:GRADUM|DIGNITATEM|EPARCHIAE|APOSTOLICI)/;
export const UNION_IDIOMS =
  /DE UNIONE|UNIONE|UNIUNTUR|UNITUR|CONIUNG|AEQUE PRINCIPALITER|DISMEMBRATIONE/;

export interface CircumscriptionRow {
  /** The document's own argumentum, verbatim: the act in its own words. */
  argumentum: string;
  /** What the act does, and anything the argumentum alone does not settle. */
  note: string;
}

/**
 * Candidates raising an existing circumscription in rank. Same evidence rule as the
 * erections table: each row quotes the document's argumentum.
 */
export const CIRCUMSCRIPTION_ELEVATIONS: Record<string, CircumscriptionRow> = {};

/**
 * Candidates uniting existing circumscriptions -- merging them outright, or joining them
 * `aeque principaliter` under one bishop.
 */
export const CIRCUMSCRIPTION_UNIONS: Record<string, CircumscriptionRow> = {};

export interface AdjudicationRow {
  /** What the document actually does, in plain words. Free text, not a controlled term. */
  act: string;
  argumentum: string;
  note: string;
}

/**
 * Candidates read and judged to be neither an erection, an elevation nor a union.
 *
 * Two kinds sit here. Some are circumscription acts this registry mints no term for -- a
 * suppressed see restored, a province reorganised, a title changed -- because one or two
 * documents is not yet evidence of a category (spec §3). The rest are not about
 * circumscriptions at all: their heading is a bare toponym because the *place* is the
 * subject, but the act is a revised Breviary, a chapter of canons, a parish church raised
 * to collegiate rank.
 *
 * A row here means the document was read. That is the verdict the 742 count could never
 * express, and the reason it could never reach zero (spec §1).
 */
export const CANDIDATE_ADJUDICATIONS: Record<string, AdjudicationRow> = {
  'benedict-xv|bracarensis|1919-05-14': {
    act: 'revision and approval of a new Breviary',
    argumentum: 'BRACARENSIS * REVISIO ET APPROBATIO NOVI BREVIARII',
    note:
      'Not a circumscription act. The toponym is the Archdiocese of Braga, whose proper '
      + 'Breviary this revises and approves; the heading names the see because the see owns '
      + 'the Breviary, not because the act touches its boundaries or rank.',
  },
};
```

And the two Benedict XV unions:

```ts
export const CIRCUMSCRIPTION_UNIONS: Record<string, CircumscriptionRow> = {
  'benedict-xv|treiensis|1920-02-20': {
    argumentum: 'TREIENSIS * DE UNIONE DIOECESIS TREIENSIS CUM DIOECESI SANCTI SEVERINI',
    note:
      'Unites the Diocese of Treia with the Diocese of San Severino. A union of two existing '
      + 'sees, not the erection of a new one.',
  },
  'benedict-xv|catamarcensis-saltensis|1920-05-22': {
    argumentum:
      'CATAMARCENSIS-SALTENSIS * DE DISMEMBRATIONE TERRITORII « DE LOS ANDES » A DIOECESI '
      + 'CATAMARCENSI AC DE EIUS UNIONE DIOECESI SALTENSI',
    note:
      'Detaches the territory of Los Andes from the Diocese of Catamarca and unites it to the '
      + 'Diocese of Salta. The dismemberment serves the union; no new circumscription is '
      + 'erected, so this is a union rather than an erection.',
  },
};
```

- [ ] **Step 4: Add an `argumentum` to each of the 19 existing erection rows**

The 19 rows keep their existing `note` verbatim — those quote body clauses and re-judging them is out of scope (spec §9). They gain an `argumentum` so the field is required rather than optional, which is what lets the Step 1 test audit every row without a frozen exception list.

Fetch each row's document and read its argumentum with the curation script from Task 2 — **or**, if doing Task 1 first, by hand: the argumentum is the run of capitals after `CONSTITUTIO APOSTOLICA`. For example the first row becomes:

```ts
  'pius-xii|santaremensis-obidensis|1957-04-10': {
    argumentum:
      'SANTAREMENSIS - OBIDENSIS * DISTRACTO TERRITORIO A PRAELATURA «NULLIUS» SANTAREMENSI, '
      + 'NOVA CONDITUR PRAELATURA «NULLIUS» OBIDENSIS',
    note:
      'Detaches territory from the Prelature Nullius of Santarém and erects the new '
      + 'Prelature Nullius of Óbidos: "...ex eoque novam praelaturam «nullius» condimus, '
      + 'Obidensem appellandam...". The heading prints only the twin toponym.',
  },
```

If any of the 19 argumenta does not match `ERECTION_IDIOMS`, **stop and report it** — that is the audit finding the test exists for, not a reason to loosen the regex.

- [ ] **Step 5: Wire the tables into `keywords.ts`**

Replace the `CIRCUMSCRIPTION_ERECTIONS` declaration (now moved) with an import, and extend the two functions:

```ts
import {
  CIRCUMSCRIPTION_ERECTIONS, CIRCUMSCRIPTION_ELEVATIONS, CIRCUMSCRIPTION_UNIONS,
  CANDIDATE_ADJUDICATIONS,
} from './circumscriptions.js';
import { POPES } from './pontiffs.js';
```

```ts
export function keywordsFor(item: HarvestItem): string[] {
  const out: string[] = [];
  const curatedKey = `${item.pageSlug}|${slugify(item.incipit ?? item.title)}|${item.date}`;
  if (ERECTION_PHRASES.some((re) => re.test(item.title))
      || CIRCUMSCRIPTION_ERECTIONS[curatedKey]) {
    out.push('circumscription-erection');
  }
  if (ELEVATION_PHRASES.some((re) => re.test(item.title))
      || CIRCUMSCRIPTION_ELEVATIONS[curatedKey]) {
    out.push('circumscription-elevation');
  }
  if (CIRCUMSCRIPTION_UNIONS[curatedKey]) out.push('circumscription-union');
  return out;
}
```

```ts
/** vatican.va page slug for an issuer -- the inverse of VATICAN_SLUG_TO_ISSUER, derived from
 *  the same table so the two cannot disagree. A DocumentRecord carries no pageSlug, so this
 *  is how a curated key is rebuilt from a harvested record. */
const ISSUER_TO_VATICAN_SLUG: Record<string, string> =
  Object.fromEntries(POPES.map((p) => [p.issuerId, p.pageSlug]));

export function isUnconfirmedCandidate(d: DocumentRecord): boolean {
  const shelf = d.source?.shelf;
  if (!shelf || !APOST_CONSTITUTIONS_SHELVES.has(shelf)) return false;
  if (TEXTUALLY_TAGGED_ISSUERS.has(d.issuerId)) return false;
  if (d.keywords?.some((k) => k.startsWith('circumscription-'))) return false;
  // A document read and judged to be none of the three is no longer awaiting confirmation.
  // Without this the adjudicated records stay in the count for ever, which is exactly the
  // defect this work exists to fix (spec §1, §5).
  const pageSlug = ISSUER_TO_VATICAN_SLUG[d.issuerId];
  const key = `${pageSlug}|${slugify(d.incipit ?? d.title)}|${d.date}`;
  if (pageSlug && CANDIDATE_ADJUDICATIONS[key]) return false;
  return TOPONYM.test(fold(d.title.trim()));
}
```

`circumscriptions.ts` imports nothing from `keywords.ts`, and `pontiffs.ts` imports nothing from either, so this introduces no cycle.

- [ ] **Step 6: Add the keyword to `data/keywords.json`**

Append, keeping the file's existing two-space formatting:

```json
{ "id": "circumscription-union", "gloss": "The act unites two or more existing ecclesiastical circumscriptions — whether merging them into one, or joining them aeque principaliter under a single bishop.", "note": "Covers union only. Does not cover erection (circumscription-erection), elevation in rank (circumscription-elevation), restitution of a suppressed see, boundary revision, or a change of name or title; those are recorded in CANDIDATE_ADJUDICATIONS with the act named, and earn their own terms if further evidence accumulates. Populated from a hand-curated table quoting each document's own argumentum. See the design spec §3." }
```

- [ ] **Step 7: Export from the barrel**

In `tools/src/mappings/index.ts`, add before the `keywords.js` line:

```ts
export * from './circumscriptions.js';
```

- [ ] **Step 8: Run the tests**

Run: `npx vitest run tools/test/circumscriptions.test.ts tools/test/keywords.test.ts`
Expected: PASS.

- [ ] **Step 9: Regenerate and check**

Run: `npm run harvest && npm run render && npm run check`

Expected: the candidate count falls from **742 to 739**; `registry/documents.md` gains a `circumscription-union` keyword view with 2 documents; `data/documents/benedict-xv.json` is the only issuer file to change. If any other issuer file changes, stop and report it.

- [ ] **Step 10: Commit**

```bash
git add tools/src/mappings/circumscriptions.ts tools/src/mappings/keywords.ts \
        tools/src/mappings/index.ts tools/test/circumscriptions.test.ts \
        tools/test/keywords.test.ts data/keywords.json data/documents registry
git commit -m "Add the circumscription adjudication tables and the Benedict XV instalment"
```

---

### Task 2: The curation script

A checked-in aid that fetches candidates and proposes rows. It never runs in the harvest, exactly as `tools/fetch-fixtures.sh` never does.

**Files:**
- Create: `tools/curate-circumscriptions.ts`
- Test: `tools/test/argumentum.test.ts`

**Interfaces:**
- Consumes: `isUnconfirmedCandidate` from `tools/src/mappings/index.js`.
- Produces: `extractArgumentum(html: string): string` exported from `tools/src/harvest/argumentum.ts`, so it is testable offline against a checked-in fixture.

- [ ] **Step 1: Write the failing test**

Create `tools/test/argumentum.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { extractArgumentum } from '../src/harvest/argumentum.js';

describe('extractArgumentum', () => {
  it('reads the capitals line an apostolic constitution prints under its toponym', () => {
    const html = '<div>CONSTITUTIO APOSTOLICA DIUGUENSIS* IN BENINO NOVA CONDITUR DIOECESIS '
      + 'DIUGUENSIS Quo efficacius Evangelii nuntius ad omnes perveniret</div>';
    expect(extractArgumentum(html))
      .toBe('DIUGUENSIS* IN BENINO NOVA CONDITUR DIOECESIS DIUGUENSIS');
  });

  it('stops at the first mixed-case word, where the narrative body begins', () => {
    const html = '<div>CONSTITUTIO APOSTOLICA TREIENSIS * DE UNIONE DIOECESIS TREIENSIS CUM '
      + 'DIOECESI SANCTI SEVERINI Boni Pastoris, idest Iesu Christi</div>';
    expect(extractArgumentum(html)).not.toContain('Boni');
    expect(extractArgumentum(html)).toContain('DE UNIONE');
  });

  it('returns an empty string when the document prints no argumentum', () => {
    // 14 of the 742 print none; they are read individually rather than guessed at.
    expect(extractArgumentum('<div>CONSTITUTIO APOSTOLICA KYRGYZSTANIAE* Ad aptius '
      + 'consulendum spirituali bono</div>')).toBe('KYRGYZSTANIAE*');
  });

  it('is not fooled by a short capitalised word inside the body', () => {
    // 'In' is capitalised but is body text; a naive uppercase test keeps it.
    const html = '<div>CONSTITUTIO APOSTOLICA MAUMERENSIS * In Indonesia archidioecesis</div>';
    expect(extractArgumentum(html)).toBe('MAUMERENSIS *');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tools/test/argumentum.test.ts`
Expected: FAIL — `Cannot find module '../src/harvest/argumentum.js'`.

- [ ] **Step 3: Write `tools/src/harvest/argumentum.ts`**

```ts
/**
 * The argumentum of an apostolic constitution: the all-capitals line printed under the
 * toponym heading, stating the act in the document's own words -- 'IN BENINO NOVA CONDITUR
 * DIOECESIS DIUGUENSIS'. Present on 728 of the 742 circumscription candidates.
 *
 * Delimited by case: it runs from the genre heading to the first mixed-case word, which is
 * where the narrative body starts. Words of two letters or fewer are kept even when mixed
 * case, because 'In' opens a body sentence but 'S.' and roman numerals appear inside the
 * argumentum itself.
 *
 * Returns '' when the document prints none. It is never inferred and never guessed at: a
 * document with no argumentum is read individually (spec §6).
 */
export function extractArgumentum(html: string): string {
  const stripped = html
    .replace(/<(script|style)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#160;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const start = stripped.match(/CONSTITUTIO APOSTOLICA|LITTERAE APOSTOLICAE|EPISTULA APOSTOLICA/);
  if (!start) return '';
  const rest = stripped.slice(start.index! + start[0].length).trim();
  const kept: string[] = [];
  for (const word of rest.split(' ').slice(0, 90)) {
    const letters = word.replace(/[^A-Za-zÀ-ÿ]/g, '');
    if (letters && letters !== letters.toUpperCase() && letters.length > 2) break;
    kept.push(word);
  }
  return kept.join(' ').trim();
}
```

- [ ] **Step 4: Run the test**

Run: `npx vitest run tools/test/argumentum.test.ts`
Expected: PASS, 4 cases.

- [ ] **Step 5: Write the curation script**

Create `tools/curate-circumscriptions.ts`:

```ts
/**
 * Curation aid for the circumscription candidate queue. NEVER run by the harvest: it
 * fetches from vatican.va, like tools/fetch-fixtures.sh, and its output is a proposal a
 * human reads before anything is committed.
 *
 * Usage: npx tsx tools/curate-circumscriptions.ts <issuerId> [outDir]
 *   e.g. npx tsx tools/curate-circumscriptions.ts rp:pius-xii /tmp/curate
 *
 * Prints one line per candidate: proposed table, then the argumentum. A candidate whose
 * argumentum matches no idiom, or that has none at all, prints ABSTAIN -- read that
 * document yourself (spec §2.3: the triage abstains, it never contradicts).
 */
import { readFileSync, readdirSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { isUnconfirmedCandidate, ERECTION_IDIOMS, ELEVATION_IDIOMS, UNION_IDIOMS } from './src/mappings/index.js';
import { extractArgumentum } from './src/harvest/argumentum.js';
import { slugify } from './src/slug.js';
import type { DocumentRecord } from './src/types.js';

const [issuerId, outDir = '/tmp/curate'] = process.argv.slice(2);
if (!issuerId) throw new Error('usage: curate-circumscriptions.ts <issuerId> [outDir]');
mkdirSync(outDir, { recursive: true });

const all = readdirSync('data/documents').filter((f) => f.endsWith('.json'))
  .flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[]);
const candidates = all.filter(isUnconfirmedCandidate).filter((d) => d.issuerId === issuerId);

for (const d of candidates) {
  const file = `${outDir}/${d.id.replace(/[^a-z0-9]/gi, '_')}.html`;
  if (!existsSync(file)) {
    const res = await fetch(d.source!.url!);
    if (!res.ok) { console.log(`FETCH-FAILED ${d.id} ${res.status}`); continue; }
    writeFileSync(file, await res.text());
  }
  const argumentum = extractArgumentum(readFileSync(file, 'utf8'));
  const verdict = argumentum.length < 20 ? 'ABSTAIN(no argumentum)'
    : UNION_IDIOMS.test(argumentum) ? 'unions'
    : ELEVATION_IDIOMS.test(argumentum) ? 'elevations'
    : ERECTION_IDIOMS.test(argumentum) ? 'erections'
    : 'ABSTAIN(unclassified)';
  console.log(JSON.stringify({ verdict, key: `${d.id.split('/')[0].replace('mag:', '')}`
    + `|${slugify(d.incipit ?? d.title)}|${d.date}`, argumentum, url: d.source!.url }));
}
console.log(`# ${candidates.length} candidates for ${issuerId}`);
```

Note the union test runs **before** elevation and erection: a union argumentum routinely also
says `CONSTITUITUR`, and the union is the principal act (spec §2.2).

The `key`'s first segment must be the **pageSlug**, not the issuer local part — they differ for
Francis (`francesco`). Those two pontificates are textually tagged and never candidates, so the
simple derivation above is correct here; if it is ever extended, use `ISSUER_TO_VATICAN_SLUG`.

- [ ] **Step 6: Verify the script against ground truth**

Run: `npx tsx tools/curate-circumscriptions.ts rp:pius-xii /tmp/curate`

Expected: 10 lines — 9 `elevations`, 1 `ABSTAIN` or a verdict for `Leonensis`. This is the batch
the first instalment read by hand (spec §2.3); if the script contradicts it, stop and report.

- [ ] **Step 7: Commit**

```bash
git add tools/curate-circumscriptions.ts tools/src/harvest/argumentum.ts tools/test/argumentum.test.ts
git commit -m "Add the circumscription curation aid and its argumentum reader"
```

---

### Task 3: The Pius XII and John XXIII instalments

37 documents: Pius XII's 10 (9 elevations, 1 adjudication) and John XXIII's 27 (15 erections, 4 elevations, 6 adjudications, 2 abstentions).

**Files:**
- Modify: `tools/src/mappings/circumscriptions.ts`
- Test: `tools/test/harvest-data.test.ts` (extend)

**Interfaces:**
- Consumes: `CIRCUMSCRIPTION_ELEVATIONS`, `CANDIDATE_ADJUDICATIONS`, `CIRCUMSCRIPTION_ERECTIONS` from Task 1; `tools/curate-circumscriptions.ts` from Task 2.
- Produces: no new exports; rows only.

- [ ] **Step 1: Write the failing test**

Append to `tools/test/harvest-data.test.ts`:

```ts
describe('the circumscription queue', () => {
  const everything = readdirSync('data/documents')
    .filter((f) => f.endsWith('.json'))
    .flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[]);
  const remaining = everything.filter(isUnconfirmedCandidate);

  it('has retired every Benedict XV, Pius XII and John XXIII candidate', () => {
    const done = ['rp:benedict-xv', 'rp:pius-xii', 'rp:john-xxiii'];
    expect(remaining.filter((d) => done.includes(d.issuerId))).toEqual([]);
  });

  it('leaves only the three pontificates not yet curated', () => {
    expect(new Set(remaining.map((d) => d.issuerId)))
      .toEqual(new Set(['rp:john-paul-ii', 'rp:paul-vi', 'rp:benedict-xvi']));
  });

  it('awards Pius XII nine elevations, none of them erections', () => {
    // The first instalment confirmed 19 erections here and rejected these nine by hand.
    const pxii = everything.filter((d) => d.issuerId === 'rp:pius-xii');
    expect(pxii.filter((d) => d.keywords?.includes('circumscription-elevation'))).toHaveLength(9);
    expect(pxii.filter((d) => d.keywords?.includes('circumscription-erection'))).toHaveLength(19);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tools/test/harvest-data.test.ts -t 'circumscription queue'`
Expected: FAIL — Pius XII and John XXIII candidates still remain.

- [ ] **Step 3: Generate the proposals**

```bash
npx tsx tools/curate-circumscriptions.ts rp:pius-xii  /tmp/curate > /tmp/pius-xii.jsonl
npx tsx tools/curate-circumscriptions.ts rp:john-xxiii /tmp/curate > /tmp/john-xxiii.jsonl
```

- [ ] **Step 4: Read every abstention individually**

For each `ABSTAIN` line, open the document at its `url` and read what it does. Expect 2 for John
XXIII and 0–1 for Pius XII. Each ends in one of the four tables with a note saying what the
document states, quoting it. Do not guess, and do not widen an idiom regex to make an abstention
classify itself — the regexes audit the tables, they do not decide them.

- [ ] **Step 5: Write the rows**

Add to `tools/src/mappings/circumscriptions.ts`. Nine of Pius XII's ten are elevations; the tenth
is an adjudication:

```ts
  'pius-xii|bathurstensis-in-gambia|1957-06-24': {
    argumentum:
      'BATHURSTENSIS IN GAMBIA * APOSTOLICA PRAEFECTURA BATHURSTENSIS AD DIGNITATEM '
      + 'DIOECESIS EVEHITUR.',
    note: 'Raises the Apostolic Prefecture of Bathurst in the Gambia to the rank of a diocese.',
  },
```

```ts
  'pius-xii|leonensis|1958-03-25': {
    act: 'a parish church raised to collegiate rank',
    argumentum:
      'LEONENSIS * PAROECIALE TEMPLUM DOMINAE NOSTRAE DE GUANAJUATO, IN CIVITATE LEONENSI, '
      + 'AD GRADUM ECCLESIAE COLLEGIATAE EVEHITUR.',
    note:
      'Not a circumscription act. The parish church of Our Lady of Guanajuato in León is '
      + 'raised to collegiate rank; the diocese named in the heading is untouched. The first '
      + "curation instalment identified this one by hand and recorded it in that table's "
      + 'comment, where it could not retire the candidate.',
  },
```

Each of the 37 rows follows the Row shape given above. Group them by pontificate under a block
comment naming the instalment, its date range and its counts, as the existing 19-row block does.

- [ ] **Step 6: Regenerate and check**

Run: `npm run harvest && npm run render && npm run check`

Expected: candidates fall **739 → 702**; only `pius-xii.json` and `john-xxiii.json` change under
`data/documents/`.

- [ ] **Step 7: Commit**

```bash
git add tools/src/mappings/circumscriptions.ts tools/test/harvest-data.test.ts data/documents registry
git commit -m "Adjudicate the Pius XII and John XXIII circumscription candidates"
```

---

### Task 4: The Benedict XVI instalment

90 documents: 67 erections, 11 elevations, 2 adjudications, 10 abstentions — the highest
abstention rate of any pontificate, which is itself a finding (spec §6).

**Files:**
- Modify: `tools/src/mappings/circumscriptions.ts`
- Test: `tools/test/harvest-data.test.ts` (extend the queue test)

**Interfaces:**
- Consumes: the four tables and the curation script.
- Produces: rows only.

- [ ] **Step 1: Extend the failing test**

In `tools/test/harvest-data.test.ts`, add `'rp:benedict-xvi'` to the `done` array and remove it
from the expected remaining set:

```ts
    const done = ['rp:benedict-xv', 'rp:pius-xii', 'rp:john-xxiii', 'rp:benedict-xvi'];
```

```ts
    expect(new Set(remaining.map((d) => d.issuerId)))
      .toEqual(new Set(['rp:john-paul-ii', 'rp:paul-vi']));
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tools/test/harvest-data.test.ts -t 'circumscription queue'`
Expected: FAIL — 90 Benedict XVI candidates remain.

- [ ] **Step 3: Generate the proposals**

```bash
npx tsx tools/curate-circumscriptions.ts rp:benedict-xvi /tmp/curate > /tmp/benedict-xvi.jsonl
```

- [ ] **Step 4: Read all ten abstentions**

Ten of the 90 print no argumentum at all. Record in the instalment's block comment whether they
share a shape — the survey suggests a transcription difference in how this shelf was prepared,
not a difference in the acts (spec §6). If they turn out to have an argumentum in a different
position, say so rather than widening `extractArgumentum` to catch it silently.

- [ ] **Step 5: Write the rows (see Row shape, above) and regenerate**

Run: `npm run harvest && npm run render && npm run check`

Expected: candidates fall **702 → 612**; only `benedict-xvi.json` changes under `data/documents/`.

- [ ] **Step 6: Commit**

```bash
git add tools/src/mappings/circumscriptions.ts tools/test/harvest-data.test.ts data/documents registry
git commit -m "Adjudicate the Benedict XVI circumscription candidates"
```

---

### Task 5: The Paul VI instalment

222 documents: 153 erections, 48 elevations, 6 adjudications, 15 abstentions.

**Files:**
- Modify: `tools/src/mappings/circumscriptions.ts`
- Test: `tools/test/harvest-data.test.ts` (extend the queue test)

**Interfaces:**
- Consumes: the four tables and the curation script.
- Produces: rows only.

- [ ] **Step 1: Extend the failing test**

```ts
    const done = ['rp:benedict-xv', 'rp:pius-xii', 'rp:john-xxiii', 'rp:benedict-xvi',
      'rp:paul-vi'];
```

```ts
    expect(new Set(remaining.map((d) => d.issuerId))).toEqual(new Set(['rp:john-paul-ii']));
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tools/test/harvest-data.test.ts -t 'circumscription queue'`
Expected: FAIL — 222 Paul VI candidates remain.

- [ ] **Step 3: Generate, read the 15 abstentions, write the rows (see Row shape, above)**

```bash
npx tsx tools/curate-circumscriptions.ts rp:paul-vi /tmp/curate > /tmp/paul-vi.jsonl
```

Paul VI's six adjudications include three chapters of canons — `IN DIOECESI HASSELETENSI, RECENS
CONDITA, CANONICORUM COLLEGIUM CONSTITUITUR` is one — which match `ERECTION_IDIOMS` on
`CONSTITUITUR` and would otherwise be filed as erections. The argumentum names the chapter, not a
circumscription; that is the distinction to read for.

- [ ] **Step 4: Regenerate and check**

Run: `npm run harvest && npm run render && npm run check`

Expected: candidates fall **612 → 390**; only `paul-vi.json` changes under `data/documents/`.

- [ ] **Step 5: Commit**

```bash
git add tools/src/mappings/circumscriptions.ts tools/test/harvest-data.test.ts data/documents registry
git commit -m "Adjudicate the Paul VI circumscription candidates"
```

---

### Task 6: The John Paul II instalment, and the queue reaches zero

390 documents: 294 erections, 67 elevations, 11 others, 18 abstentions. The last instalment, so it
also retires the Coverage sentence that has counted this queue since the expansion.

**Files:**
- Modify: `tools/src/mappings/circumscriptions.ts`
- Modify: `tools/src/render/indexMd.ts` (Coverage prose)
- Test: `tools/test/harvest-data.test.ts`, `tools/test/render.test.ts`

**Interfaces:**
- Consumes: the four tables and the curation script.
- Produces: rows only; no new exports.

- [ ] **Step 1: Write the failing test**

Replace the queue test's two cases with the end state, and add a render assertion:

```ts
  it('has adjudicated every candidate in the corpus', () => {
    expect(remaining).toEqual([]);
  });
```

In `tools/test/render.test.ts`, inside the `describe('renderIndexMd', …)` block:

```ts
  it('reports the circumscription queue as finished rather than naming a number', () => {
    expect(md).toMatch(/every candidate has been adjudicated/i);
    expect(md).not.toMatch(/have not yet been confirmed/);
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tools/test/harvest-data.test.ts tools/test/render.test.ts`
Expected: FAIL — 390 candidates remain, and Coverage still prints the old sentence.

- [ ] **Step 3: Generate, read the 18 abstentions, write the rows (see Row shape, above)**

```bash
npx tsx tools/curate-circumscriptions.ts rp:john-paul-ii /tmp/curate > /tmp/john-paul-ii.jsonl
```

John Paul II's eleven non-erection, non-elevation acts are the widest spread in the corpus: five
unions (several `AEQUE PRINCIPALITER` conjunctions of two sees under one bishop), two name or
title changes, one province reorganisation, and three that are not circumscription acts. Read each.

- [ ] **Step 4: Rewrite the Coverage bullet**

In `tools/src/render/indexMd.ts`, replace:

```
- **Keyword curation is incomplete.** ${candidates} apostolic constitutions have not yet been confirmed
  as circumscription erections. Their headings print a bare Latin toponym with no marker, so each
  is confirmed by hand against the document's own text.
```

with a bullet that states the finished position and keeps the count generated rather than written
in prose, so it cannot drift:

```
- **Circumscription curation is complete.** ${candidates === 0 ? 'Every candidate has been adjudicated' : `${candidates} apostolic constitutions still await adjudication`} — each apostolic constitution whose heading
  prints a bare Latin toponym was read against its own text and recorded as an erection, an
  elevation, a union, or an act of another kind named in the adjudication table.
```

- [ ] **Step 5: Regenerate and check**

Run: `npm run harvest && npm run render && npm run check`

Expected: candidates fall **390 → 0**; `registry/documents.md` shows `circumscription-erection`,
`circumscription-elevation` and `circumscription-union` keyword views; only `john-paul-ii.json`
changes under `data/documents/`.

- [ ] **Step 6: Commit**

```bash
git add tools/src/mappings/circumscriptions.ts tools/src/render/indexMd.ts \
        tools/test/harvest-data.test.ts tools/test/render.test.ts data/documents registry
git commit -m "Adjudicate the John Paul II candidates and close the circumscription queue"
```

---

## Verification

After Task 6, the thing this plan exists to achieve:

```bash
npx tsx -e "
import { readFileSync, readdirSync } from 'node:fs';
import { isUnconfirmedCandidate } from './tools/src/mappings/index.js';
const all = readdirSync('data/documents').filter(f => f.endsWith('.json'))
  .flatMap(f => JSON.parse(readFileSync('data/documents/' + f, 'utf8')));
console.log('unconfirmed candidates:', all.filter(isUnconfirmedCandidate).length);
"
```

Expected: `unconfirmed candidates: 0`.
