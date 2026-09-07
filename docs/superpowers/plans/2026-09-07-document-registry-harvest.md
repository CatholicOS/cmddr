# Document Registry & Harvest Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the `mag:` identifier scheme and a Node/TypeScript harvester that turns vatican.va into a validated CMDDR document registry for the Benedict XIV / Pius IX / Leo XIII pilot corpus.

**Architecture:** A pure `slugify` → `mintId` core with no I/O, two DOM adapters (flat era, shelf era) that both emit a common `HarvestItem`, a record builder that applies checked-in mapping tables, and a validator enforcing eight new invariants over the emitted JSON. Every parser test runs against checked-in HTML fixtures, so the suite is offline and deterministic.

**Tech Stack:** Node 20+, TypeScript, vitest, cheerio (DOM), ajv + ajv-formats (JSON Schema draft 2020-12).

**Spec:** `docs/superpowers/specs/2026-09-07-document-registry-identifiers-design.md`

## Global Constraints

- Identifier prefix is `mag:` — never `md:`.
- Minted id form: `mag:{issuer}/{incipit-slug}-{year}`; regex `^mag:[a-z0-9-]+/[a-z0-9]+(?:-[a-z0-9]+)*-\d{4}(?:-\d{2}-\d{2})?$`.
- Provisional id form: `mag:{issuer}/{genre-slug}-{YYYY}-{MM}-{DD}[-{n}]`.
- The id namespace segment is always the **issuer**, never the promulgator.
- `issuerId` and `promulgatedBy` always carry a registry prefix: `rp:` or `oec:`.
- Assessment locus separator is `#`, never `-`.
- Incipits are taken from **DOM text, never URL slugs** (shelf slugs abbreviate: `_adiutricem` is *Adiutricem populi*).
- `slugify(document.incipit)` must equal the id's slug segment (invariant 12).
- Pilot corpus is exactly three pontificates: Benedict XIV, Pius IX, Leo XIII.
- Never fetch vatican.va from a test. Tests read `tools/fixtures/*.html`.

## File Structure

| Path | Responsibility |
|---|---|
| `package.json`, `tsconfig.json`, `vitest.config.ts` | Toolchain |
| `tools/src/slug.ts` | `slugify` — pure, no I/O |
| `tools/src/ids.ts` | Mint and parse identifiers |
| `tools/src/dates.ts` | Italian + Latin printed-date parsing |
| `tools/src/types.ts` | `HarvestItem`, `DocumentRecord` |
| `tools/src/mappings/{pontiffs,genres,conciliar}.ts` | Hand-curated tables |
| `tools/src/harvest/{flat,shelf,toDocument,run}.ts` | Adapters, record builder, CLI |
| `tools/src/validate/{invariants,run}.ts` | Invariants 8–15, CLI |
| `tools/src/render/{documentsMd,run}.ts` | `registry/documents.md` generator |
| `tools/fixtures/*.html` | 11 saved pages |
| `vendor/{crpdr-pontiffs,coecdr-councils}.json` | Vendored id lists |
| `data/genres.json`, `data/documents/*.json` | Registry data |

---

### Task 1: Toolchain and `slugify`

**Files:**
- Create: `package.json`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`
- Create: `tools/src/slug.ts`
- Test: `tools/test/slug.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `slugify(s: string): string`

- [ ] **Step 1: Create the toolchain files**

`package.json`:
```json
{
  "name": "@catholicos/cmddr-tools",
  "private": true,
  "type": "module",
  "engines": { "node": ">=20" },
  "scripts": {
    "test": "vitest run",
    "harvest": "tsx tools/src/harvest/run.ts",
    "validate": "tsx tools/src/validate/run.ts",
    "render": "tsx tools/src/render/run.ts"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "tsx": "^4.19.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0"
  },
  "dependencies": {
    "ajv": "^8.17.1",
    "ajv-formats": "^3.0.1",
    "cheerio": "^1.0.0"
  }
}
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["tools/**/*.ts"]
}
```

`vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { include: ['tools/test/**/*.test.ts'] } });
```

`.gitignore`:
```
node_modules/
```

Run `npm install`.

- [ ] **Step 2: Write the failing test**

`tools/test/slug.test.ts`. Every vector below is a real incipit from the pilot corpus except the `æ` case, which guards a spec rule the corpus does not currently exercise.

```ts
import { describe, it, expect } from 'vitest';
import { slugify } from '../src/slug.js';

describe('slugify', () => {
  it('lowercases and hyphenates plain Latin incipits', () => {
    expect(slugify('Rerum Novarum')).toBe('rerum-novarum');
    expect(slugify('Tametsi Futura Prospicientibus')).toBe('tametsi-futura-prospicientibus');
    expect(slugify('Adiutricem populi')).toBe('adiutricem-populi');
  });

  it('handles vernacular incipits', () => {
    expect(slugify('Depuis le Jour')).toBe('depuis-le-jour');
    expect(slugify('Au Milieu Des Sollicitudes')).toBe('au-milieu-des-sollicitudes');
    expect(slugify('Spesse Volte')).toBe('spesse-volte');
  });

  it('strips Italian grave accents', () => {
    expect(slugify('La tarda età')).toBe('la-tarda-eta');
    expect(slugify('È giunto')).toBe('e-giunto');
    expect(slugify('Più volte')).toBe('piu-volte');
    expect(slugify('Vi è ben noto')).toBe('vi-e-ben-noto');
  });

  it('turns apostrophes into hyphens', () => {
    expect(slugify("Dall'alto dell'Apostolico Seggio")).toBe('dall-alto-dell-apostolico-seggio');
    expect(slugify('Dall’alto')).toBe('dall-alto');
  });

  it('folds non-decomposable letters', () => {
    expect(slugify('Præclara Gratulationis')).toBe('praeclara-gratulationis');
  });

  it('collapses punctuation runs and trims', () => {
    expect(slugify('  Non mediocri,  Roma.  ')).toBe('non-mediocri-roma');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tools/test/slug.test.ts`
Expected: FAIL — `Failed to resolve import "../src/slug.js"`.

- [ ] **Step 4: Implement**

`tools/src/slug.ts`:
```ts
const FOLD: Record<string, string> = {
  'æ': 'ae', 'œ': 'oe', 'ø': 'o', 'ß': 'ss', 'đ': 'd', 'ł': 'l',
};

/**
 * Normalise an incipit to its identifier slug.
 * Must stay round-trippable: slugify(doc.incipit) === slug segment of doc.id (invariant 12).
 */
export function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[æœøßđł]/g, (c) => FOLD[c] ?? c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tools/test/slug.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json tsconfig.json vitest.config.ts .gitignore tools/src/slug.ts tools/test/slug.test.ts
git commit -m "feat: add Node/TypeScript toolchain and incipit slugify"
```

---

### Task 2: Identifier minting and parsing

**Files:**
- Create: `tools/src/ids.ts`
- Test: `tools/test/ids.test.ts`

**Interfaces:**
- Consumes: `slugify` from Task 1.
- Produces:
  - `MINTED_ID_RE: RegExp`, `PROVISIONAL_ID_RE: RegExp`
  - `issuerLocalPart(issuerId: string): string`
  - `mintId(issuerId: string, incipit: string, date: string, opts?: { fullDate?: boolean }): string`
  - `mintProvisionalId(issuerId: string, genreSlug: string, date: string, ordinal?: number): string`
  - `parseId(id: string): { issuer: string; slug: string; year: string } | null`

- [ ] **Step 1: Write the failing test**

`tools/test/ids.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import {
  MINTED_ID_RE, PROVISIONAL_ID_RE, issuerLocalPart, mintId, mintProvisionalId, parseId,
} from '../src/ids.js';

describe('issuerLocalPart', () => {
  it('strips the registry prefix', () => {
    expect(issuerLocalPart('rp:leo-xiii')).toBe('leo-xiii');
    expect(issuerLocalPart('oec:vatican-i')).toBe('vatican-i');
  });
  it('rejects an unprefixed issuer', () => {
    expect(() => issuerLocalPart('leo-xiii')).toThrow(/prefix/i);
  });
});

describe('mintId', () => {
  it('mints issuer/incipit-year', () => {
    expect(mintId('rp:leo-xiii', 'Rerum Novarum', '1891-05-15'))
      .toBe('mag:leo-xiii/rerum-novarum-1891');
    expect(mintId('rp:leo-xiii', 'Depuis le Jour', '1899-09-08'))
      .toBe('mag:leo-xiii/depuis-le-jour-1899');
  });

  it('namespaces conciliar documents under the council, not the promulgator', () => {
    expect(mintId('oec:vatican-i', 'Pastor Aeternus', '1870-07-18'))
      .toBe('mag:vatican-i/pastor-aeternus-1870');
  });

  it('distinguishes same-pope same-genre incipit collisions by year', () => {
    expect(mintId('rp:pius-ix', 'Ubi primum', '1847-06-17')).toBe('mag:pius-ix/ubi-primum-1847');
    expect(mintId('rp:pius-ix', 'Ubi primum', '1849-02-02')).toBe('mag:pius-ix/ubi-primum-1849');
  });

  it('extends to the full date when asked', () => {
    expect(mintId('rp:pius-ix', 'Ubi primum', '1849-02-02', { fullDate: true }))
      .toBe('mag:pius-ix/ubi-primum-1849-02-02');
  });

  it('produces ids matching MINTED_ID_RE', () => {
    expect(MINTED_ID_RE.test(mintId('rp:leo-xiii', 'Rerum Novarum', '1891-05-15'))).toBe(true);
  });
});

describe('mintProvisionalId', () => {
  it('uses genre plus full date', () => {
    expect(mintProvisionalId('rp:francis-i', 'angelus', '2015-03-22'))
      .toBe('mag:francis-i/angelus-2015-03-22');
  });
  it('appends an ordinal when a date carries more than one', () => {
    expect(mintProvisionalId('rp:francis-i', 'angelus', '2015-03-22', 2))
      .toBe('mag:francis-i/angelus-2015-03-22-2');
  });
  it('produces ids matching PROVISIONAL_ID_RE', () => {
    expect(PROVISIONAL_ID_RE.test(mintProvisionalId('rp:francis-i', 'angelus', '2015-03-22')))
      .toBe(true);
  });
});

describe('parseId', () => {
  it('round-trips a minted id', () => {
    expect(parseId('mag:leo-xiii/rerum-novarum-1891'))
      .toEqual({ issuer: 'leo-xiii', slug: 'rerum-novarum', year: '1891' });
  });
  it('parses a full-date id', () => {
    expect(parseId('mag:pius-ix/ubi-primum-1849-02-02'))
      .toEqual({ issuer: 'pius-ix', slug: 'ubi-primum', year: '1849' });
  });
  it('returns null for a malformed id', () => {
    expect(parseId('md:leo-xiii/rerum-novarum-1891')).toBeNull();
    expect(parseId('mag:leo-xiii/rerum-novarum')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tools/test/ids.test.ts`
Expected: FAIL — cannot resolve `../src/ids.js`.

- [ ] **Step 3: Implement**

`tools/src/ids.ts`:
```ts
import { slugify } from './slug.js';

export const MINTED_ID_RE =
  /^mag:[a-z0-9-]+\/[a-z0-9]+(?:-[a-z0-9]+)*-\d{4}(?:-\d{2}-\d{2})?$/;

export const PROVISIONAL_ID_RE =
  /^mag:[a-z0-9-]+\/[a-z0-9]+(?:-[a-z0-9]+)*-\d{4}-\d{2}-\d{2}(?:-\d+)?$/;

export function issuerLocalPart(issuerId: string): string {
  const m = issuerId.match(/^(rp|oec):([a-z0-9-]+)$/);
  if (!m) throw new Error(`issuerId must carry an 'rp:' or 'oec:' prefix, got: ${issuerId}`);
  return m[2]!;
}

export function mintId(
  issuerId: string,
  incipit: string,
  date: string,
  opts: { fullDate?: boolean } = {},
): string {
  const suffix = opts.fullDate ? date : date.slice(0, 4);
  return `mag:${issuerLocalPart(issuerId)}/${slugify(incipit)}-${suffix}`;
}

export function mintProvisionalId(
  issuerId: string,
  genreSlug: string,
  date: string,
  ordinal?: number,
): string {
  const tail = ordinal === undefined ? '' : `-${ordinal}`;
  return `mag:${issuerLocalPart(issuerId)}/${genreSlug}-${date}${tail}`;
}

export function parseId(id: string): { issuer: string; slug: string; year: string } | null {
  if (!MINTED_ID_RE.test(id)) return null;
  const m = id.match(/^mag:([a-z0-9-]+)\/(.+)-(\d{4})(?:-\d{2}-\d{2})?$/);
  if (!m) return null;
  return { issuer: m[1]!, slug: m[2]!, year: m[3]! };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tools/test/ids.test.ts`
Expected: PASS, 11 tests.

- [ ] **Step 5: Commit**

```bash
git add tools/src/ids.ts tools/test/ids.test.ts
git commit -m "feat: mint and parse mag: document identifiers"
```

---

### Task 3: Printed-date parsing

**Files:**
- Create: `tools/src/dates.ts`
- Test: `tools/test/dates.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: `parseSourceDate(text: string): string | null` — returns ISO `YYYY-MM-DD`.

- [ ] **Step 1: Write the failing test**

Every vector is a real printed date from the fixtures. `1°` occurs 10 times across the eight Leo XIII shelves; the `Roma,` prefix occurs once (*Non mediocri*).

`tools/test/dates.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { parseSourceDate } from '../src/dates.js';

describe('parseSourceDate', () => {
  it('parses Italian month names', () => {
    expect(parseSourceDate('2 febbraio 1849')).toBe('1849-02-02');
    expect(parseSourceDate('25 dicembre 1750')).toBe('1750-12-25');
    expect(parseSourceDate('8 settembre 1899')).toBe('1899-09-08');
  });

  it('parses Latin month names', () => {
    expect(parseSourceDate('18 iulii 1870')).toBe('1870-07-18');
    expect(parseSourceDate('16 iunii 1872')).toBe('1872-06-16');
    expect(parseSourceDate('25 septembris 1865')).toBe('1865-09-25');
    expect(parseSourceDate('27 octobris 1871')).toBe('1871-10-27');
  });

  it('handles the ordinal first-of-month marker', () => {
    expect(parseSourceDate('1° novembre 1900')).toBe('1900-11-01');
    expect(parseSourceDate('1° maggio 1894')).toBe('1894-05-01');
  });

  it('ignores a place prefix', () => {
    expect(parseSourceDate('Roma, 25 ottobre 1893')).toBe('1893-10-25');
  });

  it('tolerates surrounding parentheses and whitespace', () => {
    expect(parseSourceDate('  (5 settembre 1895) ')).toBe('1895-09-05');
  });

  it('returns null when no date is present', () => {
    expect(parseSourceDate('Dum Multa')).toBeNull();
    expect(parseSourceDate('12 brumaio 1799')).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tools/test/dates.test.ts`
Expected: FAIL — cannot resolve `../src/dates.js`.

- [ ] **Step 3: Implement**

`tools/src/dates.ts`:
```ts
const MONTHS: Record<string, number> = {
  gennaio: 1, febbraio: 2, marzo: 3, aprile: 4, maggio: 5, giugno: 6,
  luglio: 7, agosto: 8, settembre: 9, ottobre: 10, novembre: 11, dicembre: 12,
  ianuarii: 1, februarii: 2, martii: 3, aprilis: 4, maii: 5, iunii: 6,
  iulii: 7, augusti: 8, septembris: 9, octobris: 10, novembris: 11, decembris: 12,
};

const PAT = /(\d{1,2})\s*°?\s+([A-Za-zÀ-ÿ]+)\s+(\d{4})/;

/** Parse a printed vatican.va date (Italian or Latin) to ISO YYYY-MM-DD. */
export function parseSourceDate(text: string): string | null {
  const m = text.match(PAT);
  if (!m) return null;
  const month = MONTHS[m[2]!.toLowerCase()];
  if (month === undefined) return null;
  const day = Number(m[1]);
  if (day < 1 || day > 31) return null;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${m[3]}-${pad(month)}-${pad(day)}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tools/test/dates.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add tools/src/dates.ts tools/test/dates.test.ts
git commit -m "feat: parse Italian and Latin printed dates"
```

---

### Task 4: Vendored registries and mapping tables

**Files:**
- Create: `vendor/crpdr-pontiffs.json`, `vendor/coecdr-councils.json`
- Create: `tools/src/types.ts`, `tools/src/mappings/pontiffs.ts`, `tools/src/mappings/genres.ts`, `tools/src/mappings/conciliar.ts`
- Test: `tools/test/mappings.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `types.ts`: `HarvestItem`, `DocumentRecord`, `IssuerType`
  - `VATICAN_SLUG_TO_ISSUER: Record<string, string>`
  - `PILOT_POPES: readonly { pageSlug: string; issuerId: string; era: 'flat' | 'shelf' }[]`
  - `SHELVES: readonly string[]`
  - `SOURCE_GENRE_TO_GENRE: Record<string, { genre: string | null; characteristics?: string[]; descriptiveTitle?: 'dogmatic' | 'pastoral'; issuerType?: IssuerType }>`
  - `CONCILIAR_REASSIGNMENTS: Record<string, { issuerId: string; promulgatedBy: string }>`
  - `KNOWN_PONTIFF_IDS: Set<string>`, `KNOWN_COUNCIL_IDS: Set<string>`

- [ ] **Step 1: Vendor the sibling registries**

Extract the id column from each sibling registry into a plain JSON array. Run once, from the repo root:

```bash
mkdir -p vendor
curl -sL https://raw.githubusercontent.com/CatholicOS/crpdr/main/registry/pontiffs.md \
  | grep -oE '`rp:[a-z0-9-]+`' | tr -d '`' | sort -u \
  | python3 -c "import sys,json;print(json.dumps(sorted(l.strip() for l in sys.stdin),indent=2))" \
  > vendor/crpdr-pontiffs.json
curl -sL https://raw.githubusercontent.com/CatholicOS/coecdr/main/registry/councils.md \
  | grep -oE '`oec:[a-z0-9-]+`' | tr -d '`' | sort -u \
  | python3 -c "import sys,json;print(json.dumps(sorted(l.strip() for l in sys.stdin),indent=2))" \
  > vendor/coecdr-councils.json
```

Verify: `vendor/crpdr-pontiffs.json` has 265 entries, `vendor/coecdr-councils.json` has 21.

- [ ] **Step 2: Write the failing test**

`tools/test/mappings.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import {
  VATICAN_SLUG_TO_ISSUER, PILOT_POPES, SHELVES,
  SOURCE_GENRE_TO_GENRE, CONCILIAR_REASSIGNMENTS,
  KNOWN_PONTIFF_IDS, KNOWN_COUNCIL_IDS,
} from '../src/mappings/index.js';

describe('vendored registries', () => {
  it('loads every pontiff and council id', () => {
    expect(KNOWN_PONTIFF_IDS.size).toBe(265);
    expect(KNOWN_COUNCIL_IDS.size).toBe(21);
    expect(KNOWN_PONTIFF_IDS.has('rp:leo-xiii')).toBe(true);
    expect(KNOWN_COUNCIL_IDS.has('oec:vatican-i')).toBe(true);
  });
});

describe('pontiff slug mapping', () => {
  it('maps vatican.va slugs, which differ from CRPDR ids', () => {
    expect(VATICAN_SLUG_TO_ISSUER['benedictus-xiv']).toBe('rp:benedict-xiv');
    expect(VATICAN_SLUG_TO_ISSUER['pius-ix']).toBe('rp:pius-ix');
    expect(VATICAN_SLUG_TO_ISSUER['leo-xiii']).toBe('rp:leo-xiii');
  });

  it('maps every mapped slug onto a real pontiff id', () => {
    for (const id of Object.values(VATICAN_SLUG_TO_ISSUER)) {
      expect(KNOWN_PONTIFF_IDS.has(id)).toBe(true);
    }
  });

  it('describes the pilot corpus and its eras', () => {
    expect(PILOT_POPES.map((p) => p.pageSlug))
      .toEqual(['benedictus-xiv', 'pius-ix', 'leo-xiii']);
    expect(PILOT_POPES.find((p) => p.pageSlug === 'leo-xiii')!.era).toBe('shelf');
    expect(PILOT_POPES.find((p) => p.pageSlug === 'pius-ix')!.era).toBe('flat');
    expect(SHELVES).toHaveLength(8);
  });
});

describe('genre mapping', () => {
  it('maps the common source labels', () => {
    expect(SOURCE_GENRE_TO_GENRE['enciclica']!.genre).toBe('encyclical');
    expect(SOURCE_GENRE_TO_GENRE['bolla']!.genre).toBe('papal-bull');
    expect(SOURCE_GENRE_TO_GENRE['breve']!.genre).toBe('brief');
    expect(SOURCE_GENRE_TO_GENRE['allocuzione']!.genre).toBe('discourse-address');
    expect(SOURCE_GENRE_TO_GENRE['allocutio']!.genre).toBe('discourse-address');
  });

  it('treats apostolic constitution as a papal-bull characteristic, not a genre', () => {
    const m = SOURCE_GENRE_TO_GENRE['costituzione apostolica']!;
    expect(m.genre).toBe('papal-bull');
    expect(m.characteristics).toEqual(['apostolic-constitution']);
  });

  it('maps a dogmatic constitution to the conciliar genre with its descriptive title', () => {
    const m = SOURCE_GENRE_TO_GENRE['constitutio dogmatica']!;
    expect(m.genre).toBe('constitution');
    expect(m.descriptiveTitle).toBe('dogmatic');
    expect(m.issuerType).toBe('ecumenical-council');
  });

  it('leaves genres the registry does not define unmapped', () => {
    for (const label of ['decreto', 'proclama', 'protesta', 'editto']) {
      expect(SOURCE_GENRE_TO_GENRE[label]!.genre).toBeNull();
    }
  });
});

describe('conciliar reassignments', () => {
  it('moves the two Vatican I constitutions off Pius IX', () => {
    expect(CONCILIAR_REASSIGNMENTS['pius-ix|dei-filius|1870-04-24'])
      .toEqual({ issuerId: 'oec:vatican-i', promulgatedBy: 'rp:pius-ix' });
    expect(CONCILIAR_REASSIGNMENTS['pius-ix|pastor-aeternus|1870-07-18'])
      .toEqual({ issuerId: 'oec:vatican-i', promulgatedBy: 'rp:pius-ix' });
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tools/test/mappings.test.ts`
Expected: FAIL — cannot resolve `../src/mappings/index.js`.

- [ ] **Step 4: Implement**

`tools/src/types.ts`:
```ts
export type IssuerType = 'ecumenical-council' | 'pope' | 'bishop';
export type IdStatus = 'minted' | 'provisional';

/** One entry as scraped from an index page, before mapping. */
export interface HarvestItem {
  incipit: string;
  date: string;                 // ISO YYYY-MM-DD
  sourceGenreLabel: string;
  url: string | null;
  languages: string[];
  shelf: string | null;
  pageSlug: string;             // the vatican.va pope slug the page belonged to
}

export interface DocumentRecord {
  id: string;
  title: string;
  incipit: string;
  incipitLang?: string;
  idStatus: IdStatus;
  genre: string | null;
  sourceGenreLabel?: string;
  issuerId: string;
  issuerType: IssuerType;
  promulgatedBy?: string;
  date: string;
  scope?: 'universal' | 'local';
  characteristics?: string[];
  descriptiveTitle?: 'dogmatic' | 'pastoral';
  sigla?: string;
  aliases?: string[];
  source?: { url: string | null; shelf: string | null; languages: string[]; retrieved: string };
}
```

`tools/src/mappings/pontiffs.ts`:
```ts
import pontiffs from '../../../vendor/crpdr-pontiffs.json' with { type: 'json' };
import councils from '../../../vendor/coecdr-councils.json' with { type: 'json' };

export const KNOWN_PONTIFF_IDS = new Set<string>(pontiffs as string[]);
export const KNOWN_COUNCIL_IDS = new Set<string>(councils as string[]);

/** vatican.va URL slugs do not match CRPDR ids; this is the bridge. */
export const VATICAN_SLUG_TO_ISSUER: Record<string, string> = {
  'benedictus-xiv': 'rp:benedict-xiv',
  'pius-ix': 'rp:pius-ix',
  'leo-xiii': 'rp:leo-xiii',
};

export const PILOT_POPES = [
  { pageSlug: 'benedictus-xiv', issuerId: 'rp:benedict-xiv', era: 'flat' },
  { pageSlug: 'pius-ix', issuerId: 'rp:pius-ix', era: 'flat' },
  { pageSlug: 'leo-xiii', issuerId: 'rp:leo-xiii', era: 'shelf' },
] as const;

export const SHELVES = [
  'apost_constitutions', 'apost_letters', 'briefs', 'bulls',
  'encyclicals', 'letters', 'motu_proprio', 'speeches',
] as const;
```

`tools/src/mappings/genres.ts`:
```ts
import type { IssuerType } from '../types.js';

export interface GenreMapping {
  genre: string | null;
  characteristics?: string[];
  descriptiveTitle?: 'dogmatic' | 'pastoral';
  issuerType?: IssuerType;
}

/**
 * Keys are lowercased source labels (flat era) and shelf names (shelf era).
 * A null genre means the Genre Registry has no row for it yet; the raw label is
 * preserved on the record as sourceGenreLabel rather than inventing a taxonomy.
 */
export const SOURCE_GENRE_TO_GENRE: Record<string, GenreMapping> = {
  'enciclica': { genre: 'encyclical' },
  'encyclicals': { genre: 'encyclical' },
  'breve enciclica': { genre: 'encyclical' },
  'bolla': { genre: 'papal-bull' },
  'bulls': { genre: 'papal-bull' },
  'breve': { genre: 'brief' },
  'briefs': { genre: 'brief' },
  'lettera': { genre: 'letter' },
  'epistola': { genre: 'letter' },
  'letters': { genre: 'letter' },
  'lettera apostolica': { genre: 'apostolic-letter' },
  'litterae apostolicae': { genre: 'apostolic-letter' },
  'apost_letters': { genre: 'apostolic-letter' },
  'costituzione apostolica': { genre: 'papal-bull', characteristics: ['apostolic-constitution'] },
  'constitutio apostolica': { genre: 'papal-bull', characteristics: ['apostolic-constitution'] },
  'apost_constitutions': { genre: 'papal-bull', characteristics: ['apostolic-constitution'] },
  'motu proprio': { genre: 'motu-proprio' },
  'motu_proprio': { genre: 'motu-proprio' },
  'allocuzione': { genre: 'discourse-address' },
  'allocutio': { genre: 'discourse-address' },
  'discorso': { genre: 'discourse-address' },
  'speeches': { genre: 'discourse-address' },
  'costituzione dogmatica': {
    genre: 'constitution', descriptiveTitle: 'dogmatic', issuerType: 'ecumenical-council',
  },
  'constitutio dogmatica': {
    genre: 'constitution', descriptiveTitle: 'dogmatic', issuerType: 'ecumenical-council',
  },
  // Genres present in the sources but with no Genre Registry row (spec §2.6, §5.2).
  'decreto': { genre: null },
  'proclama': { genre: null },
  'protesta': { genre: null },
  'editto': { genre: null },
};
```

`tools/src/mappings/conciliar.ts`:
```ts
/**
 * Documents filed on a pope's page that were issued by a council (spec §2.5).
 * Key: `${pageSlug}|${slugify(incipit)}|${isoDate}`. Curated by hand, never inferred.
 */
export const CONCILIAR_REASSIGNMENTS: Record<string, { issuerId: string; promulgatedBy: string }> = {
  'pius-ix|dei-filius|1870-04-24': { issuerId: 'oec:vatican-i', promulgatedBy: 'rp:pius-ix' },
  'pius-ix|pastor-aeternus|1870-07-18': { issuerId: 'oec:vatican-i', promulgatedBy: 'rp:pius-ix' },
};
```

`tools/src/mappings/index.ts`:
```ts
export * from './pontiffs.js';
export * from './genres.js';
export * from './conciliar.js';
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tools/test/mappings.test.ts`
Expected: PASS, 8 tests.

- [ ] **Step 6: Commit**

```bash
git add vendor/ tools/src/types.ts tools/src/mappings/
git add tools/test/mappings.test.ts
git commit -m "feat: vendor CRPDR/COECDR ids and add source mapping tables"
```

---

### Task 5: Genre Registry as data

**Files:**
- Create: `data/genres.json`
- Test: `tools/test/genres-data.test.ts`

**Interfaces:**
- Consumes: `schema/genre.schema.json` (existing, unchanged).
- Produces: `data/genres.json` — an array of Genre objects; the resolution target for invariant 15.

This transcribes README Table 1 verbatim. It introduces no genre and changes no default or ceiling.

- [ ] **Step 1: Write the failing test**

`tools/test/genres-data.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import genreSchema from '../../schema/genre.schema.json' with { type: 'json' };

const genres = JSON.parse(readFileSync('data/genres.json', 'utf8')) as Array<Record<string, unknown>>;

describe('data/genres.json', () => {
  it('validates against genre.schema.json', () => {
    const ajv = new Ajv2020({ strict: false });
    const validate = ajv.compile(genreSchema);
    for (const g of genres) {
      const ok = validate(g);
      if (!ok) throw new Error(`${g.id}: ${JSON.stringify(validate.errors)}`);
      expect(ok).toBe(true);
    }
  });

  it('transcribes all sixteen rows of README Table 1', () => {
    expect(genres).toHaveLength(16);
    expect(genres.map((g) => g.id)).toEqual([
      'constitution', 'decree', 'declaration', 'papal-bull', 'encyclical',
      'apostolic-exhortation', 'apostolic-letter', 'motu-proprio', 'brief', 'letter',
      'discourse-address', 'homily', 'prayer', 'audience-catechesis',
      'episcopal-pastoral-letter', 'episcopal-homily',
    ]);
  });

  it('has unique ids', () => {
    expect(new Set(genres.map((g) => g.id)).size).toBe(genres.length);
  });

  it('keeps the conciliar ceiling at extraordinary and the encyclical ceiling below it', () => {
    const by = Object.fromEntries(genres.map((g) => [g.id as string, g]));
    expect(by['constitution']!.ceiling).toBe('extraordinary');
    expect(by['decree']!.ceiling).toBe('extraordinary');
    expect(by['declaration']!.ceiling).toBe('extraordinary');
    expect(by['encyclical']!.ceiling).toBe('ordinary-universal');
    expect(by['apostolic-letter']!.ceiling).toBe('ordinary-universal');
    expect(by['homily']!.ceiling).toBe('authentic-ordinary');
  });

  it('ranks the conciliar genres by presumptive weight', () => {
    const by = Object.fromEntries(genres.map((g) => [g.id as string, g]));
    expect(by['constitution']!.presumptiveWeight).toBeGreaterThan(
      by['decree']!.presumptiveWeight as number);
    expect(by['decree']!.presumptiveWeight).toBeGreaterThan(
      by['declaration']!.presumptiveWeight as number);
  });

  it('gives bishops local scope only', () => {
    for (const g of genres) {
      if ((g.issuerTypes as string[]).includes('bishop')) expect(g.defaultScope).toBe('local');
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tools/test/genres-data.test.ts`
Expected: FAIL — `ENOENT: no such file or directory, open 'data/genres.json'`.

- [ ] **Step 3: Implement**

`data/genres.json` — every field copied from README Table 1:
```json
[
  { "id": "constitution", "label": "Constitution", "issuerTypes": ["ecumenical-council"], "defaultScope": "universal", "defaultRegister": "authentic-ordinary", "ceiling": "extraordinary", "presumptiveWeight": 3, "description": "The council's most solemn genre. May bear an optional descriptive title; non-definitive unless a definition is manifest." },
  { "id": "decree", "label": "Decree", "issuerTypes": ["ecumenical-council"], "defaultScope": "universal", "defaultRegister": "authentic-ordinary", "ceiling": "extraordinary", "presumptiveWeight": 2, "description": "May carry canons/anathemas that are definitions (e.g. Trent); assess per canon." },
  { "id": "declaration", "label": "Declaration", "issuerTypes": ["ecumenical-council"], "defaultScope": "universal", "defaultRegister": "authentic-ordinary", "ceiling": "extraordinary", "presumptiveWeight": 1, "description": "Lowest conciliar genre by presumptive weight." },
  { "id": "papal-bull", "label": "Papal Bull", "issuerTypes": ["pope"], "defaultScope": "universal", "defaultRegister": "authentic-ordinary", "ceiling": "extraordinary", "description": "The most solemn sealed form of papal document (lead/wax seal, Latin bulla). May bear one or more non-exclusive characteristics." },
  { "id": "encyclical", "label": "Encyclical", "issuerTypes": ["pope"], "defaultScope": "universal", "defaultRegister": "authentic-ordinary", "ceiling": "ordinary-universal", "description": "Circular letter of the pope to the universal Church; can invoke the ordinary and universal magisterium." },
  { "id": "apostolic-exhortation", "label": "Apostolic Exhortation", "issuerTypes": ["pope"], "defaultScope": "universal", "defaultRegister": "authentic-ordinary", "ceiling": "authentic-ordinary", "description": "Typically post-synodal, hortatory." },
  { "id": "apostolic-letter", "label": "Apostolic Letter", "issuerTypes": ["pope"], "defaultScope": "universal", "defaultRegister": "authentic-ordinary", "ceiling": "ordinary-universal", "description": "Can reach definitive language (e.g. Ordinatio Sacerdotalis)." },
  { "id": "motu-proprio", "label": "Motu Proprio", "issuerTypes": ["pope"], "defaultScope": "universal", "defaultRegister": "authentic-ordinary", "ceiling": "authentic-ordinary", "description": "Issued on the Pope's own initiative; often legislative/administrative." },
  { "id": "brief", "label": "Brief", "issuerTypes": ["pope"], "defaultScope": "universal", "defaultRegister": "authentic-ordinary", "ceiling": "authentic-ordinary", "description": "Less formal papal letter." },
  { "id": "letter", "label": "Letter", "issuerTypes": ["pope"], "defaultScope": "universal", "defaultRegister": "authentic-ordinary", "ceiling": "authentic-ordinary", "description": "Papal letter." },
  { "id": "discourse-address", "label": "Discourse / Address", "issuerTypes": ["pope"], "defaultScope": "universal", "defaultRegister": "authentic-ordinary", "ceiling": "authentic-ordinary", "description": "Pastoral vehicle; cannot host a definition." },
  { "id": "homily", "label": "Homily", "issuerTypes": ["pope"], "defaultScope": "universal", "defaultRegister": "authentic-ordinary", "ceiling": "authentic-ordinary", "description": "Papal homily." },
  { "id": "prayer", "label": "Prayer", "issuerTypes": ["pope"], "defaultScope": "universal", "defaultRegister": "authentic-ordinary", "ceiling": "authentic-ordinary", "description": "Papal prayer." },
  { "id": "audience-catechesis", "label": "Audience / Catechesis", "issuerTypes": ["pope"], "defaultScope": "universal", "defaultRegister": "authentic-ordinary", "ceiling": "authentic-ordinary", "description": "Papal audience or catechesis." },
  { "id": "episcopal-pastoral-letter", "label": "Episcopal / Pastoral Letter", "issuerTypes": ["bishop"], "defaultScope": "local", "defaultRegister": "authentic-ordinary", "ceiling": "authentic-ordinary", "description": "An individual bishop shares in the ordinary universal magisterium only collegially, not through a local act." },
  { "id": "episcopal-homily", "label": "Episcopal Homily", "issuerTypes": ["bishop"], "defaultScope": "local", "defaultRegister": "authentic-ordinary", "ceiling": "authentic-ordinary", "description": "Homily of an individual bishop." }
]
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tools/test/genres-data.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add data/genres.json tools/test/genres-data.test.ts
git commit -m "feat: transcribe Genre Registry Table 1 into data/genres.json"
```

---

### Task 6: Schema updates

**Files:**
- Modify: `schema/document.schema.json`
- Modify: `schema/assessment.schema.json`
- Test: `tools/test/schema.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: schemas accepting the new `mag:` ids, prefixed `issuerId`, `#` loci, and the new fields.

- [ ] **Step 1: Write the failing test**

`tools/test/schema.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import documentSchema from '../../schema/document.schema.json' with { type: 'json' };
import assessmentSchema from '../../schema/assessment.schema.json' with { type: 'json' };

function compile(schema: object) {
  const ajv = new Ajv2020({ strict: false });
  addFormats(ajv);
  return ajv.compile(schema);
}

/** ajv distinguishes an absent key from one whose value is undefined; strip them. */
function strip<T extends object>(o: T): T {
  return Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined)) as T;
}

const baseDoc = {
  id: 'mag:john-paul-ii/evangelium-vitae-1995',
  title: 'Evangelium Vitae',
  incipit: 'Evangelium Vitae',
  incipitLang: 'la',
  idStatus: 'minted',
  genre: 'encyclical',
  issuerId: 'rp:john-paul-ii',
  issuerType: 'pope',
  date: '1995-03-25',
  scope: 'universal',
  sigla: 'EV',
};

describe('document.schema.json', () => {
  const validate = compile(documentSchema);

  it('accepts a minted document', () => {
    expect(validate(baseDoc)).toBe(true);
  });

  it('rejects an unprefixed issuerId', () => {
    expect(validate({ ...baseDoc, issuerId: 'john-paul-ii' })).toBe(false);
  });

  it('accepts a conciliar document with promulgatedBy', () => {
    expect(validate(strip({
      ...baseDoc,
      id: 'mag:vatican-i/pastor-aeternus-1870',
      title: 'Pastor Aeternus', incipit: 'Pastor Aeternus',
      genre: 'constitution', descriptiveTitle: 'dogmatic',
      issuerId: 'oec:vatican-i', issuerType: 'ecumenical-council',
      promulgatedBy: 'rp:pius-ix', date: '1870-07-18', sigla: undefined,
    }))).toBe(true);
  });

  it('rejects the old short-sigla id form', () => {
    expect(validate({ ...baseDoc, id: 'EV' })).toBe(false);
  });

  it('rejects the md: prefix', () => {
    expect(validate({ ...baseDoc, id: 'md:john-paul-ii/evangelium-vitae-1995' })).toBe(false);
  });

  it('allows a null genre when sourceGenreLabel is present', () => {
    expect(validate(strip({
      ...baseDoc, id: 'mag:pius-ix/la-serie-1849', title: 'La Serie', incipit: 'La Serie',
      incipitLang: 'it', genre: null, sourceGenreLabel: 'Protesta',
      issuerId: 'rp:pius-ix', date: '1849-02-14', sigla: undefined,
    }))).toBe(true);
  });

  it('accepts a provisional id only when idStatus is provisional', () => {
    const provisional = {
      ...baseDoc, id: 'mag:francis-i/angelus-2015-03-22', idStatus: 'provisional',
      title: 'Angelus, 22 March 2015', genre: 'audience-catechesis',
      issuerId: 'rp:francis-i', date: '2015-03-22', sigla: undefined,
      incipit: undefined, incipitLang: undefined,
    };
    expect(validate(strip(provisional))).toBe(true);
  });

  it('requires incipit when idStatus is minted', () => {
    expect(validate(strip({ ...baseDoc, incipit: undefined }))).toBe(false);
  });

  it('records harvest provenance', () => {
    expect(validate({
      ...baseDoc,
      source: {
        url: 'https://www.vatican.va/content/leo-xiii/it/encyclicals/documents/x.html',
        shelf: 'encyclicals', languages: ['IT', 'LA'], retrieved: '2026-09-07',
      },
    })).toBe(true);
  });
});

describe('assessment.schema.json', () => {
  const validate = compile(assessmentSchema);
  const base = {
    document: 'mag:john-paul-ii/evangelium-vitae-1995',
    section: '62',
    register: 'ordinary-universal',
    intent: 'definitive',
    object: 'revealed',
    assent: 'fides-divina-et-catholica',
    provenance: { status: 'contested' },
  };

  it('accepts a # locus', () => {
    expect(validate({ ...base, id: 'mag:john-paul-ii/evangelium-vitae-1995#62' })).toBe(true);
  });

  it('accepts a document-wide #* locus', () => {
    expect(validate(strip({
      ...base, id: 'mag:john-paul-ii/evangelium-vitae-1995#*', section: '*',
      register: 'authentic-ordinary', intent: 'non-definitive',
      object: undefined, assent: 'religiosum-obsequium',
    }))).toBe(true);
  });

  it('rejects the old hyphen locus', () => {
    expect(validate({ ...base, id: 'EV-62', document: 'EV' })).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tools/test/schema.test.ts`
Expected: FAIL — the old `id` pattern `^[A-Za-z0-9._-]+$` rejects `mag:…` ids, so the first test fails.

- [ ] **Step 3: Implement the document schema changes**

In `schema/document.schema.json`:

1. Change `required` to `["id", "title", "genre", "issuerId", "issuerType", "idStatus"]`.
2. Replace the `id` property:
```json
"id": {
  "type": "string",
  "pattern": "^mag:[a-z0-9-]+/[a-z0-9]+(-[a-z0-9]+)*-[0-9]{4}(-[0-9]{2}-[0-9]{2})?(-[0-9]+)?$",
  "description": "Canonical identifier: 'mag:{issuer}/{incipit-slug}-{year}'. The issuer segment is the local part of issuerId. See the design spec §3."
}
```
3. Replace `issuerId` and `promulgatedBy` with prefixed forms:
```json
"issuerId": {
  "type": "string",
  "pattern": "^(rp|oec):[a-z0-9-]+$",
  "description": "Prefixed registry id of the concrete issuer, e.g. 'rp:john-paul-ii', 'oec:vatican-ii'."
},
"promulgatedBy": {
  "type": "string",
  "pattern": "^rp:[a-z0-9-]+$",
  "description": "Optional prefixed id of the pope who promulgated the document, when distinct from the issuer. Does not change issuerType."
}
```
4. Make `genre` nullable:
```json
"genre": {
  "type": ["string", "null"],
  "description": "Foreign key -> genre.id in data/genres.json. Null when the source genre has no Genre Registry row yet; sourceGenreLabel then records the raw label."
}
```
5. Add the new properties:
```json
"incipit": { "type": "string", "description": "The incipit as printed by the source, unnormalised (e.g. 'Adiutricem populi')." },
"incipitLang": { "type": "string", "pattern": "^[a-z]{2}$", "description": "ISO 639-1 language of the incipit; vernacular incipits are first-class." },
"idStatus": { "enum": ["minted", "provisional"], "default": "minted", "description": "'minted' ids are permanent; 'provisional' ids may be re-minted." },
"sigla": { "type": "string", "pattern": "^[A-Z][A-Za-z]{0,7}$", "description": "Conventional scholarly abbreviation (EV, LG, GS). Display only, never a key." },
"sourceGenreLabel": { "type": "string", "description": "Genre label exactly as the source prints it (e.g. 'Enciclica', 'Protesta')." },
"source": {
  "type": "object",
  "additionalProperties": false,
  "properties": {
    "url": { "type": ["string", "null"] },
    "shelf": { "type": ["string", "null"] },
    "languages": { "type": "array", "items": { "type": "string" } },
    "retrieved": { "type": "string", "format": "date" }
  }
}
```
6. Change the `aliases` description to `"Alternative titles (e.g. 'The Gospel of Life'). Incipits live in the incipit field."`
7. Add to the (currently absent) top-level `allOf` array:
```json
"allOf": [
  {
    "description": "a minted id requires an incipit; a null genre requires the raw source label",
    "if": { "properties": { "idStatus": { "const": "minted" } }, "required": ["idStatus"] },
    "then": { "required": ["incipit"] }
  },
  {
    "if": { "properties": { "genre": { "type": "null" } }, "required": ["genre"] },
    "then": { "required": ["sourceGenreLabel"] }
  }
]
```

- [ ] **Step 4: Implement the assessment schema changes**

In `schema/assessment.schema.json`, replace the `id` and `document` descriptions and add a pattern:
```json
"id": {
  "type": "string",
  "pattern": "^mag:[a-z0-9-]+/[^#]+#(\\*|[^#]+)$",
  "description": "Locus id: '{document.id}#{section}' (e.g. 'mag:john-paul-ii/evangelium-vitae-1995#62'), or '{document.id}#*' for a document-wide assessment."
},
"document": {
  "type": "string",
  "pattern": "^mag:[a-z0-9-]+/.+$",
  "description": "Foreign key -> document.id."
}
```
Also update the `section` description: `"Use '*' for a document-wide assessment"` stays correct.

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tools/test/schema.test.ts`
Expected: PASS, 12 tests.

- [ ] **Step 6: Commit**

```bash
git add schema/document.schema.json schema/assessment.schema.json tools/test/schema.test.ts
git commit -m "feat: adopt mag: ids, prefixed issuerId and # loci in the schemas"
```

---

### Task 7: Flat-era adapter

**Files:**
- Create: `tools/fixtures/benedictus-xiv.html`, `tools/fixtures/pius-ix.html`
- Create: `tools/src/harvest/flat.ts`
- Test: `tools/test/flat.test.ts`

**Interfaces:**
- Consumes: `parseSourceDate` (Task 3), `HarvestItem` (Task 4).
- Produces: `parseFlatIndex(html: string, pageSlug: string): HarvestItem[]`

- [ ] **Step 1: Save the fixtures**

```bash
mkdir -p tools/fixtures
curl -sL https://www.vatican.va/content/benedictus-xiv/it.html -o tools/fixtures/benedictus-xiv.html
curl -sL https://www.vatican.va/content/pius-ix/it.html -o tools/fixtures/pius-ix.html
```

- [ ] **Step 2: Write the failing test**

`tools/test/flat.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseFlatIndex } from '../src/harvest/flat.js';

const bxiv = parseFlatIndex(readFileSync('tools/fixtures/benedictus-xiv.html', 'utf8'), 'benedictus-xiv');
const pix = parseFlatIndex(readFileSync('tools/fixtures/pius-ix.html', 'utf8'), 'pius-ix');

describe('parseFlatIndex', () => {
  it('finds every document on each landing page', () => {
    expect(bxiv).toHaveLength(43);
    expect(pix).toHaveLength(77);
  });

  it('takes the incipit from <i>, not the truncated slug', () => {
    const bd = bxiv.find((d) => d.date === '1750-12-25')!;
    expect(bd.incipit).toBe('Benedictus Deus');
    expect(bd.sourceGenreLabel).toBe('Bolla');
    expect(bd.url).toContain('bolla--i-benedictus-deus');
  });

  it('parses Italian dates', () => {
    const up = pix.filter((d) => d.incipit.toLowerCase() === 'ubi primum');
    expect(up.map((d) => d.date).sort()).toEqual(['1847-06-17', '1849-02-02']);
    expect(up.every((d) => d.sourceGenreLabel === 'Enciclica')).toBe(true);
  });

  it('parses Latin dates', () => {
    const pa = pix.find((d) => d.incipit === 'Pastor Aeternus')!;
    expect(pa.date).toBe('1870-07-18');
    expect(pa.sourceGenreLabel).toBe('Constitutio dogmatica');
  });

  it('records the page slug and available languages', () => {
    expect(pix.every((d) => d.pageSlug === 'pius-ix')).toBe(true);
    expect(pix.every((d) => d.shelf === null)).toBe(true);
    expect(pix.find((d) => d.incipit === 'Pastor Aeternus')!.languages.length).toBeGreaterThan(0);
  });

  it('yields a usable date and incipit for every item', () => {
    for (const d of [...bxiv, ...pix]) {
      expect(d.incipit, JSON.stringify(d)).not.toBe('');
      expect(d.date, JSON.stringify(d)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(d.sourceGenreLabel, JSON.stringify(d)).not.toBe('');
    }
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tools/test/flat.test.ts`
Expected: FAIL — cannot resolve `../src/harvest/flat.js`.

- [ ] **Step 4: Implement**

`tools/src/harvest/flat.ts`:
```ts
import * as cheerio from 'cheerio';
import { parseSourceDate } from '../dates.js';
import type { HarvestItem } from '../types.js';

const BASE = 'https://www.vatican.va';

/**
 * Flat-era pope landing pages (Benedict XIV .. Pius IX): one reverse-chronological
 * list, each item shaped `<h2><a> {Genre} <i>{Incipit}</i> ({date}) </a></h2>`.
 * The URL slug is truncated and carries collapsed markup, so it is never parsed.
 */
export function parseFlatIndex(html: string, pageSlug: string): HarvestItem[] {
  const $ = cheerio.load(html);
  const items: HarvestItem[] = [];

  $('div.item').each((_, el) => {
    const $item = $(el);
    const $h2 = $item.find('h2').first();
    if ($h2.length === 0) return;

    const incipit = $h2.find('i').first().text().replace(/\s+/g, ' ').trim();
    if (!incipit) return;

    const full = $h2.text().replace(/\s+/g, ' ').trim();
    const date = parseSourceDate(full.slice(full.lastIndexOf('(')));
    if (!date) return;

    const cut = full.indexOf(incipit);
    const sourceGenreLabel = (cut > 0 ? full.slice(0, cut) : '').trim();

    const href = $h2.find('a').first().attr('href')
      ?? $item.find('.translation-field a').first().attr('href')
      ?? null;

    const languages = $item.find('.translation-field a')
      .map((_i, a) => $(a).text().trim()).get().filter(Boolean);

    items.push({
      incipit,
      date,
      sourceGenreLabel,
      url: href ? (href.startsWith('http') ? href : BASE + href) : null,
      languages,
      shelf: null,
      pageSlug,
    });
  });

  return items;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tools/test/flat.test.ts`
Expected: PASS, 6 tests.

If the counts differ from 43 and 77, print `items.length` and inspect: the landing page may include a stray `div.item` outside the document list. Filter by requiring the href to contain `/documents/`.

- [ ] **Step 6: Commit**

```bash
git add tools/fixtures/benedictus-xiv.html tools/fixtures/pius-ix.html
git add tools/src/harvest/flat.ts tools/test/flat.test.ts
git commit -m "feat: add flat-era vatican.va adapter with fixtures"
```

---

### Task 8: Shelf-era adapter

**Files:**
- Create: `tools/fixtures/leo-xiii-{apost_constitutions,apost_letters,briefs,bulls,encyclicals,letters,motu_proprio,speeches}.html` (8 files)
- Create: `tools/src/harvest/shelf.ts`
- Test: `tools/test/shelf.test.ts`

**Interfaces:**
- Consumes: `parseSourceDate` (Task 3), `HarvestItem` (Task 4), `SHELVES` (Task 4).
- Produces: `parseShelfIndex(html: string, pageSlug: string, shelf: string): HarvestItem[]`

- [ ] **Step 1: Save the fixtures**

```bash
for s in apost_constitutions apost_letters briefs bulls encyclicals letters motu_proprio speeches; do
  curl -sL "https://www.vatican.va/content/leo-xiii/it/$s.index.html" -o "tools/fixtures/leo-xiii-$s.html"
done
```

- [ ] **Step 2: Write the failing test**

`tools/test/shelf.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { parseShelfIndex } from '../src/harvest/shelf.js';
import { SHELVES } from '../src/mappings/index.js';

const load = (shelf: string) =>
  parseShelfIndex(readFileSync(`tools/fixtures/leo-xiii-${shelf}.html`, 'utf8'), 'leo-xiii', shelf);

const enc = load('encyclicals');
const all = SHELVES.flatMap((s) => load(s));

describe('parseShelfIndex', () => {
  it('finds every encyclical, linked or not', () => {
    expect(enc).toHaveLength(86);
  });

  it('finds the whole Leo XIII corpus across the eight shelves', () => {
    expect(all).toHaveLength(273);
  });

  it('takes the incipit from the heading text, never the abbreviated slug', () => {
    const cases: [string, string][] = [
      ['1895-09-05', 'Adiutricem populi'],
      ['1896-05-01', 'Insignes Deo'],
      ['1895-01-06', 'Longinqua oceani'],
      ['1894-03-19', 'Caritatis providentiaeque'],
    ];
    for (const [date, incipit] of cases) {
      expect(enc.find((d) => d.date === date)!.incipit).toBe(incipit);
    }
  });

  it('resolves URLs that appear only in the translation field', () => {
    const linked = enc.filter((d) => d.url !== null);
    expect(linked).toHaveLength(86);
    expect(enc.find((d) => d.incipit === 'Dum Multa')!.url).not.toBeNull();
  });

  it('handles the ordinal first-of-month and a place prefix', () => {
    expect(enc.find((d) => d.incipit === 'Tametsi Futura Prospicientibus')!.date).toBe('1900-11-01');
    expect(enc.find((d) => d.incipit === 'Non mediocri')!.date).toBe('1893-10-25');
  });

  it('preserves vernacular and accented incipits', () => {
    expect(enc.some((d) => d.incipit === 'Depuis le Jour')).toBe(true);
    expect(enc.some((d) => d.incipit === 'Spesse Volte')).toBe(true);
    expect(enc.some((d) => d.incipit === "Dall'alto dell'Apostolico Seggio")).toBe(true);
    expect(all.some((d) => d.incipit === 'La tarda età')).toBe(true);
  });

  it('labels every item with its shelf', () => {
    expect(enc.every((d) => d.shelf === 'encyclicals')).toBe(true);
    expect(all.every((d) => d.pageSlug === 'leo-xiii')).toBe(true);
  });

  it('yields a usable date and incipit for every item', () => {
    for (const d of all) {
      expect(d.incipit, JSON.stringify(d)).not.toBe('');
      expect(d.date, JSON.stringify(d)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx vitest run tools/test/shelf.test.ts`
Expected: FAIL — cannot resolve `../src/harvest/shelf.js`.

- [ ] **Step 4: Implement**

`tools/src/harvest/shelf.ts`:
```ts
import * as cheerio from 'cheerio';
import { parseSourceDate } from '../dates.js';
import type { HarvestItem } from '../types.js';

const BASE = 'https://www.vatican.va';
const SLUG_DATE = /_(\d{2})(\d{2})(\d{4})_/;

/**
 * Shelf-era index pages (Leo XIII onward). Items are `<h2>{Incipit} ({date})</h2>`,
 * sometimes wrapped in an <a> and sometimes not — 21 of Leo XIII's 86 encyclicals
 * link only from .translation-field. There is no <i> element here, and the URL slug
 * abbreviates the incipit (_adiutricem for 'Adiutricem populi'), so the incipit is
 * always taken from the heading text.
 */
export function parseShelfIndex(html: string, pageSlug: string, shelf: string): HarvestItem[] {
  const $ = cheerio.load(html);
  const items: HarvestItem[] = [];

  $('div.item').each((_, el) => {
    const $item = $(el);
    const $h2 = $item.find('h2').first();
    if ($h2.length === 0) return;

    const full = $h2.text().replace(/\s+/g, ' ').trim();
    const open = full.lastIndexOf('(');
    if (open <= 0) return;

    const incipit = full.slice(0, open).trim();
    const printed = parseSourceDate(full.slice(open));
    if (!incipit || !printed) return;

    const href = $h2.find('a').first().attr('href')
      ?? $item.find('.translation-field a').first().attr('href')
      ?? null;

    // Prefer the slug's DDMMYYYY when present; fall back to the printed date.
    let date = printed;
    const m = href?.match(SLUG_DATE);
    if (m) date = `${m[3]}-${m[2]}-${m[1]}`;

    const languages = $item.find('.translation-field a')
      .map((_i, a) => $(a).text().trim()).get().filter(Boolean);

    items.push({
      incipit,
      date,
      sourceGenreLabel: shelf,
      url: href ? (href.startsWith('http') ? href : BASE + href) : null,
      languages,
      shelf,
      pageSlug,
    });
  });

  return items;
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npx vitest run tools/test/shelf.test.ts`
Expected: PASS, 8 tests.

If a count is off by one or two, the page header's own `<h2>` may sit inside a `div.item`; exclude headings whose text contains `Leone XIII`.

- [ ] **Step 6: Commit**

```bash
git add tools/fixtures/leo-xiii-*.html tools/src/harvest/shelf.ts tools/test/shelf.test.ts
git commit -m "feat: add shelf-era vatican.va adapter with fixtures"
```

---

### Task 9: Record builder

**Files:**
- Create: `tools/src/harvest/toDocument.ts`
- Test: `tools/test/toDocument.test.ts`

**Interfaces:**
- Consumes: `slugify` (T1), `mintId`/`issuerLocalPart` (T2), all mappings (T4), `HarvestItem`/`DocumentRecord` (T4).
- Produces: `toDocument(item: HarvestItem, retrieved: string): DocumentRecord`

- [ ] **Step 1: Write the failing test**

`tools/test/toDocument.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { toDocument } from '../src/harvest/toDocument.js';
import type { HarvestItem } from '../src/types.js';

const item = (over: Partial<HarvestItem>): HarvestItem => ({
  incipit: 'Rerum Novarum', date: '1891-05-15', sourceGenreLabel: 'encyclicals',
  url: 'https://www.vatican.va/x.html', languages: ['IT'], shelf: 'encyclicals',
  pageSlug: 'leo-xiii', ...over,
});

describe('toDocument', () => {
  it('builds a minted papal record', () => {
    const d = toDocument(item({}), '2026-09-07');
    expect(d.id).toBe('mag:leo-xiii/rerum-novarum-1891');
    expect(d.issuerId).toBe('rp:leo-xiii');
    expect(d.issuerType).toBe('pope');
    expect(d.genre).toBe('encyclical');
    expect(d.idStatus).toBe('minted');
    expect(d.incipit).toBe('Rerum Novarum');
    expect(d.source!.retrieved).toBe('2026-09-07');
  });

  it('reassigns conciliar documents to their council', () => {
    const d = toDocument(item({
      incipit: 'Pastor Aeternus', date: '1870-07-18',
      sourceGenreLabel: 'Constitutio dogmatica', shelf: null, pageSlug: 'pius-ix',
    }), '2026-09-07');
    expect(d.id).toBe('mag:vatican-i/pastor-aeternus-1870');
    expect(d.issuerId).toBe('oec:vatican-i');
    expect(d.issuerType).toBe('ecumenical-council');
    expect(d.promulgatedBy).toBe('rp:pius-ix');
    expect(d.genre).toBe('constitution');
    expect(d.descriptiveTitle).toBe('dogmatic');
  });

  it('maps an apostolic constitution to papal-bull with a characteristic', () => {
    const d = toDocument(item({
      incipit: 'Conditae a Christo', date: '1900-12-08',
      sourceGenreLabel: 'apost_constitutions', shelf: 'apost_constitutions',
    }), '2026-09-07');
    expect(d.genre).toBe('papal-bull');
    expect(d.characteristics).toEqual(['apostolic-constitution']);
  });

  it('keeps an unmapped genre null and preserves the raw label', () => {
    const d = toDocument(item({
      incipit: 'La Serie', date: '1849-02-14', sourceGenreLabel: 'Protesta',
      shelf: null, pageSlug: 'pius-ix',
    }), '2026-09-07');
    expect(d.genre).toBeNull();
    expect(d.sourceGenreLabel).toBe('Protesta');
    expect(d.id).toBe('mag:pius-ix/la-serie-1849');
  });

  it('keeps the id slug round-trippable from the incipit', () => {
    const d = toDocument(item({ incipit: "Dall'alto dell'Apostolico Seggio", date: '1890-10-15' }), '2026-09-07');
    expect(d.id).toBe('mag:leo-xiii/dall-alto-dell-apostolico-seggio-1890');
  });

  it('throws on an unknown pope slug rather than guessing', () => {
    expect(() => toDocument(item({ pageSlug: 'francesco' }), '2026-09-07')).toThrow(/francesco/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tools/test/toDocument.test.ts`
Expected: FAIL — cannot resolve `../src/harvest/toDocument.js`.

- [ ] **Step 3: Implement**

`tools/src/harvest/toDocument.ts`:
```ts
import { slugify } from '../slug.js';
import { mintId } from '../ids.js';
import {
  VATICAN_SLUG_TO_ISSUER, SOURCE_GENRE_TO_GENRE, CONCILIAR_REASSIGNMENTS,
} from '../mappings/index.js';
import type { DocumentRecord, HarvestItem } from '../types.js';

export function toDocument(item: HarvestItem, retrieved: string): DocumentRecord {
  const pageIssuer = VATICAN_SLUG_TO_ISSUER[item.pageSlug];
  if (!pageIssuer) throw new Error(`No CRPDR mapping for vatican.va slug: ${item.pageSlug}`);

  const key = `${item.pageSlug}|${slugify(item.incipit)}|${item.date}`;
  const reassigned = CONCILIAR_REASSIGNMENTS[key];

  const issuerId = reassigned?.issuerId ?? pageIssuer;
  const mapping = SOURCE_GENRE_TO_GENRE[item.sourceGenreLabel.toLowerCase()] ?? { genre: null };
  const issuerType = mapping.issuerType
    ?? (issuerId.startsWith('oec:') ? 'ecumenical-council' : 'pope');

  const record: DocumentRecord = {
    id: mintId(issuerId, item.incipit, item.date),
    title: item.incipit,
    incipit: item.incipit,
    idStatus: 'minted',
    genre: mapping.genre,
    issuerId,
    issuerType,
    date: item.date,
    source: {
      url: item.url, shelf: item.shelf, languages: item.languages, retrieved,
    },
  };

  if (reassigned) record.promulgatedBy = reassigned.promulgatedBy;
  if (mapping.characteristics) record.characteristics = [...mapping.characteristics];
  if (mapping.descriptiveTitle) record.descriptiveTitle = mapping.descriptiveTitle;
  if (mapping.genre === null) record.sourceGenreLabel = item.sourceGenreLabel;

  return record;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tools/test/toDocument.test.ts`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add tools/src/harvest/toDocument.ts tools/test/toDocument.test.ts
git commit -m "feat: build document records from harvest items"
```

---

### Task 10: Validation invariants

**Files:**
- Create: `tools/src/validate/invariants.ts`, `tools/src/validate/run.ts`
- Test: `tools/test/invariants.test.ts`

**Interfaces:**
- Consumes: `slugify` (T1), `parseId`/`issuerLocalPart` (T2), `KNOWN_PONTIFF_IDS`/`KNOWN_COUNCIL_IDS` (T4), `DocumentRecord` (T4).
- Produces:
  - `interface Violation { rule: number; id: string; message: string }`
  - `checkDocuments(docs: DocumentRecord[], genreIds: Set<string>): Violation[]`
  - `interface AssessmentLike { id: string; document: string; section: string }`
  - `checkAssessments(assessments: AssessmentLike[], documentIds: Set<string>): Violation[]`

- [ ] **Step 1: Write the failing test**

`tools/test/invariants.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { checkDocuments, checkAssessments } from '../src/validate/invariants.js';
import type { DocumentRecord } from '../src/types.js';

const GENRES = new Set(['encyclical', 'constitution', 'papal-bull']);

const good: DocumentRecord = {
  id: 'mag:leo-xiii/rerum-novarum-1891', title: 'Rerum Novarum', incipit: 'Rerum Novarum',
  idStatus: 'minted', genre: 'encyclical', issuerId: 'rp:leo-xiii', issuerType: 'pope',
  date: '1891-05-15',
};
const rules = (docs: DocumentRecord[]) => checkDocuments(docs, GENRES).map((v) => v.rule);

describe('checkDocuments', () => {
  it('passes a well-formed record', () => {
    expect(checkDocuments([good], GENRES)).toEqual([]);
  });

  it('8: flags a malformed or duplicated id', () => {
    expect(rules([{ ...good, id: 'md:leo-xiii/rerum-novarum-1891' }])).toContain(8);
    expect(rules([good, { ...good, date: '1891-05-16' }])).toContain(8);
  });

  it('9: flags a namespace that disagrees with issuerId', () => {
    expect(rules([{ ...good, issuerId: 'rp:pius-ix' }])).toContain(9);
  });

  it('10: flags a year that disagrees with the date', () => {
    expect(rules([{ ...good, date: '1892-05-15' }])).toContain(10);
  });

  it('11: flags an unresolved same-issuer/incipit/year collision', () => {
    const a = { ...good, id: 'mag:pius-ix/ubi-primum-1849', incipit: 'Ubi primum',
      title: 'Ubi primum', issuerId: 'rp:pius-ix', date: '1849-02-02' };
    const b = { ...a, date: '1849-06-17' };
    expect(rules([a, b])).toContain(11);

    const a2 = { ...a, id: 'mag:pius-ix/ubi-primum-1849-02-02' };
    const b2 = { ...b, id: 'mag:pius-ix/ubi-primum-1849-06-17' };
    expect(rules([a2, b2])).not.toContain(11);
  });

  it('12: flags an id slug that does not round-trip from the incipit', () => {
    expect(rules([{ ...good, id: 'mag:leo-xiii/adiutricem-1891' }])).toContain(12);
  });

  it('13: flags an issuer absent from the vendored registries', () => {
    expect(rules([{ ...good, id: 'mag:nemo-i/rerum-novarum-1891', issuerId: 'rp:nemo-i' }]))
      .toContain(13);
    expect(rules([{ ...good, promulgatedBy: 'rp:nemo-i' }])).toContain(13);
  });

  it('15: flags an unknown genre, and a null genre with no source label', () => {
    expect(rules([{ ...good, genre: 'sonnet' }])).toContain(15);
    expect(rules([{ ...good, genre: null }])).toContain(15);
    expect(rules([{ ...good, genre: null, sourceGenreLabel: 'Protesta' }])).not.toContain(15);
  });

  it('accepts a conciliar record namespaced under its council', () => {
    expect(checkDocuments([{
      id: 'mag:vatican-i/pastor-aeternus-1870', title: 'Pastor Aeternus',
      incipit: 'Pastor Aeternus', idStatus: 'minted', genre: 'constitution',
      issuerId: 'oec:vatican-i', issuerType: 'ecumenical-council',
      promulgatedBy: 'rp:pius-ix', date: '1870-07-18',
    }], GENRES)).toEqual([]);
  });
});

describe('checkAssessments', () => {
  const DOCS = new Set(['mag:john-paul-ii/evangelium-vitae-1995']);
  const ok = {
    id: 'mag:john-paul-ii/evangelium-vitae-1995#62',
    document: 'mag:john-paul-ii/evangelium-vitae-1995',
    section: '62',
  };

  it('passes a well-formed locus', () => {
    expect(checkAssessments([ok], DOCS)).toEqual([]);
  });

  it('passes a document-wide locus', () => {
    expect(checkAssessments([{
      id: 'mag:john-paul-ii/evangelium-vitae-1995#*',
      document: 'mag:john-paul-ii/evangelium-vitae-1995', section: '*',
    }], DOCS)).toEqual([]);
  });

  it('14: flags a locus whose prefix is not its parent document', () => {
    expect(checkAssessments([{ ...ok, id: 'mag:leo-xiii/rerum-novarum-1891#62' }], DOCS)
      .map((v) => v.rule)).toContain(14);
  });

  it('14: flags a locus whose section disagrees with the id', () => {
    expect(checkAssessments([{ ...ok, section: '57' }], DOCS).map((v) => v.rule)).toContain(14);
  });

  it('14: flags the old hyphen locus', () => {
    expect(checkAssessments([{ ...ok, id: 'EV-62' }], DOCS).map((v) => v.rule)).toContain(14);
  });

  it('14: flags a reference to a document that does not exist', () => {
    expect(checkAssessments([{
      id: 'mag:pius-ix/nemo-1849#1', document: 'mag:pius-ix/nemo-1849', section: '1',
    }], DOCS).map((v) => v.rule)).toContain(14);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tools/test/invariants.test.ts`
Expected: FAIL — cannot resolve `../src/validate/invariants.js`.

- [ ] **Step 3: Implement**

`tools/src/validate/invariants.ts`:
```ts
import { slugify } from '../slug.js';
import { MINTED_ID_RE, PROVISIONAL_ID_RE, parseId, issuerLocalPart } from '../ids.js';
import { KNOWN_PONTIFF_IDS, KNOWN_COUNCIL_IDS } from '../mappings/index.js';
import type { DocumentRecord } from '../types.js';

export interface Violation { rule: number; id: string; message: string }

/** Invariants 8-13 and 15 of the design spec §6. (14 lives in the assessment checker.) */
export function checkDocuments(docs: DocumentRecord[], genreIds: Set<string>): Violation[] {
  const out: Violation[] = [];
  const seen = new Map<string, number>();
  const byCollision = new Map<string, DocumentRecord[]>();

  for (const d of docs) {
    const re = d.idStatus === 'provisional' ? PROVISIONAL_ID_RE : MINTED_ID_RE;
    if (!re.test(d.id)) {
      out.push({ rule: 8, id: d.id, message: `id does not match the ${d.idStatus} form` });
      continue;
    }
    seen.set(d.id, (seen.get(d.id) ?? 0) + 1);

    const parts = parseId(d.id);
    if (!parts) { out.push({ rule: 8, id: d.id, message: 'id is unparseable' }); continue; }

    let local: string;
    try { local = issuerLocalPart(d.issuerId); }
    catch (e) { out.push({ rule: 13, id: d.id, message: String(e) }); continue; }

    if (parts.issuer !== local) {
      out.push({ rule: 9, id: d.id, message: `namespace '${parts.issuer}' != issuerId '${d.issuerId}'` });
    }
    if (parts.year !== d.date.slice(0, 4)) {
      out.push({ rule: 10, id: d.id, message: `id year ${parts.year} != date ${d.date}` });
    }
    if (d.idStatus === 'minted' && parts.slug !== slugify(d.incipit)) {
      out.push({ rule: 12, id: d.id, message: `slug '${parts.slug}' != slugify('${d.incipit}')` });
    }

    const known = d.issuerId.startsWith('oec:') ? KNOWN_COUNCIL_IDS : KNOWN_PONTIFF_IDS;
    if (!known.has(d.issuerId)) {
      out.push({ rule: 13, id: d.id, message: `issuerId not in the vendored registry: ${d.issuerId}` });
    }
    if (d.promulgatedBy && !KNOWN_PONTIFF_IDS.has(d.promulgatedBy)) {
      out.push({ rule: 13, id: d.id, message: `promulgatedBy not in CRPDR: ${d.promulgatedBy}` });
    }

    if (d.genre === null) {
      if (!d.sourceGenreLabel) {
        out.push({ rule: 15, id: d.id, message: 'null genre requires sourceGenreLabel' });
      }
    } else if (!genreIds.has(d.genre)) {
      out.push({ rule: 15, id: d.id, message: `unknown genre: ${d.genre}` });
    }

    if (d.idStatus === 'minted') {
      const k = `${local}|${slugify(d.incipit)}|${d.date.slice(0, 4)}`;
      byCollision.set(k, [...(byCollision.get(k) ?? []), d]);
    }
  }

  for (const [id, n] of seen) {
    if (n > 1) out.push({ rule: 8, id, message: `id is not unique (${n} occurrences)` });
  }

  for (const [k, group] of byCollision) {
    if (group.length < 2) continue;
    for (const d of group) {
      if (!/-\d{4}-\d{2}-\d{2}$/.test(d.id)) {
        out.push({ rule: 11, id: d.id, message: `collision on ${k}: both ids must use the full date` });
      }
    }
  }

  return out;
}

export interface AssessmentLike { id: string; document: string; section: string }

/** Invariant 14: a locus is `{document}#{section}` and names an existing document. */
export function checkAssessments(
  assessments: AssessmentLike[],
  documentIds: Set<string>,
): Violation[] {
  const out: Violation[] = [];
  for (const a of assessments) {
    if (!documentIds.has(a.document)) {
      out.push({ rule: 14, id: a.id, message: `unknown document: ${a.document}` });
    }
    const expected = `${a.document}#${a.section}`;
    if (a.id !== expected) {
      out.push({ rule: 14, id: a.id, message: `locus should be '${expected}'` });
    }
  }
  return out;
}
```

`tools/src/validate/run.ts`:
```ts
import { readFileSync, readdirSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { checkDocuments, checkAssessments, type AssessmentLike } from './invariants.js';
import type { DocumentRecord } from '../types.js';

const documentSchema = JSON.parse(readFileSync('schema/document.schema.json', 'utf8'));
const genres = JSON.parse(readFileSync('data/genres.json', 'utf8')) as Array<{ id: string }>;
const genreIds = new Set(genres.map((g) => g.id));

const ajv = new Ajv2020({ strict: false });
addFormats(ajv);
const validateDoc = ajv.compile(documentSchema);

const docs: DocumentRecord[] = [];
let failures = 0;

for (const f of readdirSync('data/documents').filter((f) => f.endsWith('.json'))) {
  for (const d of JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[]) {
    docs.push(d);
    if (!validateDoc(d)) {
      failures++;
      console.error(`schema  ${d.id}: ${ajv.errorsText(validateDoc.errors)}`);
    }
  }
}

// Assessments are hand-curated and currently live only in the example bundles.
const assessments: AssessmentLike[] = [];
const documentIds = new Set(docs.map((d) => d.id));
for (const f of readdirSync('examples').filter((f) => f.endsWith('.json'))) {
  const bundle = JSON.parse(readFileSync(`examples/${f}`, 'utf8'));
  if (bundle.document) documentIds.add(bundle.document.id);
  if (Array.isArray(bundle.assessments)) assessments.push(...bundle.assessments);
}

for (const v of [...checkDocuments(docs, genreIds), ...checkAssessments(assessments, documentIds)]) {
  failures++;
  console.error(`rule ${v.rule}  ${v.id}: ${v.message}`);
}

console.log(`${docs.length} documents and ${assessments.length} assessments checked, ${failures} failure(s)`);
process.exit(failures === 0 ? 0 : 1);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run tools/test/invariants.test.ts`
Expected: PASS, 15 tests.

- [ ] **Step 5: Commit**

```bash
git add tools/src/validate/ tools/test/invariants.test.ts
git commit -m "feat: enforce identifier invariants 8-15"
```

---

### Task 11: Harvest orchestrator and the pilot data

**Files:**
- Create: `tools/src/harvest/run.ts`
- Create: `data/documents/benedict-xiv.json`, `data/documents/pius-ix.json`, `data/documents/leo-xiii.json`, `data/documents/vatican-i.json` (generated)
- Test: `tools/test/harvest-data.test.ts`

**Interfaces:**
- Consumes: everything from Tasks 1–10.
- Produces: `data/documents/{issuer-local}.json`, one array per issuer, sorted by date then id.

- [ ] **Step 1: Implement the orchestrator**

`tools/src/harvest/run.ts`:
```ts
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { parseFlatIndex } from './flat.js';
import { parseShelfIndex } from './shelf.js';
import { toDocument } from './toDocument.js';
import { PILOT_POPES, SHELVES } from '../mappings/index.js';
import { issuerLocalPart } from '../ids.js';
import type { DocumentRecord, HarvestItem } from '../types.js';

const RETRIEVED = process.env.RETRIEVED ?? new Date().toISOString().slice(0, 10);
const fixture = (n: string) => readFileSync(`tools/fixtures/${n}.html`, 'utf8');

const items: HarvestItem[] = [];
for (const pope of PILOT_POPES) {
  if (pope.era === 'flat') {
    items.push(...parseFlatIndex(fixture(pope.pageSlug), pope.pageSlug));
  } else {
    for (const shelf of SHELVES) {
      items.push(...parseShelfIndex(fixture(`${pope.pageSlug}-${shelf}`), pope.pageSlug, shelf));
    }
  }
}

const byIssuer = new Map<string, DocumentRecord[]>();
for (const item of items) {
  const doc = toDocument(item, RETRIEVED);
  const key = issuerLocalPart(doc.issuerId);
  byIssuer.set(key, [...(byIssuer.get(key) ?? []), doc]);
}

if (!existsSync('data/documents')) mkdirSync('data/documents', { recursive: true });
for (const [key, docs] of byIssuer) {
  docs.sort((a, b) => (a.date === b.date ? a.id.localeCompare(b.id) : a.date.localeCompare(b.date)));
  writeFileSync(`data/documents/${key}.json`, JSON.stringify(docs, null, 2) + '\n');
  console.log(`${key}: ${docs.length}`);
}
```

- [ ] **Step 2: Run the harvest**

```bash
RETRIEVED=2026-09-07 npx tsx tools/src/harvest/run.ts
```
Expected output, four files: `benedict-xiv: 43`, `pius-ix: 75`, `leo-xiii: 273`, `vatican-i: 2`.
(Pius IX yields 75, not 77, because *Dei Filius* and *Pastor Aeternus* are reassigned to Vatican I.)

- [ ] **Step 3: Run the validator**

```bash
npx tsx tools/src/validate/run.ts
```
Expected: `393 documents and 4 assessments checked, 0 failure(s)`, exit 0.
(The 4 assessments come from `examples/evangelium-vitae.json`; they still carry the old `EV-…`
loci until Task 13, so rule 14 will fire here until then. That is expected — re-run after Task 13.)

If rule 11 fires, a genuine same-issuer/incipit/year collision exists. Resolve it by adding both documents to a `FULL_DATE_IDS` set consulted by `toDocument`, which passes `{ fullDate: true }` to `mintId` — do not hand-edit the generated JSON.

- [ ] **Step 4: Write the regression test**

`tools/test/harvest-data.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { checkDocuments } from '../src/validate/invariants.js';
import type { DocumentRecord } from '../src/types.js';

const load = (n: string) =>
  JSON.parse(readFileSync(`data/documents/${n}.json`, 'utf8')) as DocumentRecord[];
const genreIds = new Set(
  (JSON.parse(readFileSync('data/genres.json', 'utf8')) as Array<{ id: string }>).map((g) => g.id));

const all = [...load('benedict-xiv'), ...load('pius-ix'), ...load('leo-xiii'), ...load('vatican-i')];

describe('the harvested pilot corpus', () => {
  it('holds the whole pilot corpus', () => {
    expect(all).toHaveLength(393);
  });

  it('satisfies every invariant', () => {
    expect(checkDocuments(all, genreIds)).toEqual([]);
  });

  it('files the two Vatican I constitutions under the council', () => {
    const v1 = load('vatican-i');
    expect(v1.map((d) => d.id).sort()).toEqual([
      'mag:vatican-i/dei-filius-1870', 'mag:vatican-i/pastor-aeternus-1870',
    ]);
    expect(v1.every((d) => d.promulgatedBy === 'rp:pius-ix')).toBe(true);
    expect(load('pius-ix').some((d) => d.incipit === 'Pastor Aeternus')).toBe(false);
  });

  it('distinguishes the four Ubi Primum documents', () => {
    const ids = all.filter((d) => d.incipit.toLowerCase().startsWith('ubi primum')).map((d) => d.id);
    expect(ids).toEqual(expect.arrayContaining([
      'mag:benedict-xiv/ubi-primum-1740',
      'mag:pius-ix/ubi-primum-1847',
      'mag:pius-ix/ubi-primum-1849',
    ]));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('leaves the TBD shelf empty', () => {
    expect(all.filter((d) => d.idStatus === 'provisional')).toEqual([]);
  });

  it('preserves unmapped genres rather than inventing rows', () => {
    const unmapped = all.filter((d) => d.genre === null);
    expect(unmapped.length).toBeGreaterThan(0);
    expect(unmapped.every((d) => Boolean(d.sourceGenreLabel))).toBe(true);
  });
});
```

- [ ] **Step 5: Run the test suite**

Run: `npx vitest run`
Expected: PASS, every test file green.

- [ ] **Step 6: Commit**

```bash
git add tools/src/harvest/run.ts data/documents/ tools/test/harvest-data.test.ts
git commit -m "feat: harvest the Benedict XIV, Pius IX and Leo XIII pilot corpus"
```

---

### Task 12: Human-readable registry table

**Files:**
- Create: `tools/src/render/documentsMd.ts`, `tools/src/render/run.ts`
- Create: `registry/documents.md` (generated)
- Test: `tools/test/render.test.ts`

**Interfaces:**
- Consumes: `DocumentRecord` (T4).
- Produces: `renderDocumentsMd(docs: DocumentRecord[]): string`

- [ ] **Step 1: Write the failing test**

`tools/test/render.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { renderDocumentsMd } from '../src/render/documentsMd.js';
import type { DocumentRecord } from '../src/types.js';

const docs: DocumentRecord[] = [
  { id: 'mag:leo-xiii/rerum-novarum-1891', title: 'Rerum Novarum', incipit: 'Rerum Novarum',
    idStatus: 'minted', genre: 'encyclical', issuerId: 'rp:leo-xiii', issuerType: 'pope',
    date: '1891-05-15' },
  { id: 'mag:vatican-i/pastor-aeternus-1870', title: 'Pastor Aeternus', incipit: 'Pastor Aeternus',
    idStatus: 'minted', genre: 'constitution', issuerId: 'oec:vatican-i',
    issuerType: 'ecumenical-council', promulgatedBy: 'rp:pius-ix', date: '1870-07-18' },
];

describe('renderDocumentsMd', () => {
  const md = renderDocumentsMd(docs);

  it('emits a table header and one row per document', () => {
    expect(md).toContain('| ID | Incipit | Genre | Issuer | Date |');
    expect(md.split('\n').filter((l) => l.startsWith('| `mag:'))).toHaveLength(2);
  });

  it('sorts chronologically', () => {
    expect(md.indexOf('pastor-aeternus')).toBeLessThan(md.indexOf('rerum-novarum'));
  });

  it('backticks ids and shows the promulgator', () => {
    expect(md).toContain('`mag:vatican-i/pastor-aeternus-1870`');
    expect(md).toContain('`oec:vatican-i`');
    expect(md).toContain('`rp:pius-ix`');
  });

  it('marks a generated file', () => {
    expect(md).toMatch(/generated/i);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tools/test/render.test.ts`
Expected: FAIL — cannot resolve `../src/render/documentsMd.js`.

- [ ] **Step 3: Implement**

`tools/src/render/documentsMd.ts`:
```ts
import type { DocumentRecord } from '../types.js';

export function renderDocumentsMd(docs: DocumentRecord[]): string {
  const rows = [...docs].sort((a, b) =>
    a.date === b.date ? a.id.localeCompare(b.id) : a.date.localeCompare(b.date));

  const head = `# Magisterial Documents

Generated by \`npm run render\` from \`data/documents/*.json\` — do not edit by hand.

Identifiers follow \`mag:{issuer}/{incipit-slug}-{year}\`; the issuer segment is always the local
part of \`issuerId\`, so conciliar documents namespace under their council and record the
promulgating pope separately. See the design spec for the minting rules.

${rows.length} documents.

| ID | Incipit | Genre | Issuer | Date | Promulgated by |
| --- | --- | --- | --- | --- | --- |`;

  const body = rows.map((d) =>
    `| \`${d.id}\` | ${d.title} | ${d.genre ?? `— (${d.sourceGenreLabel ?? 'unmapped'})`} `
    + `| \`${d.issuerId}\` | ${d.date} | ${d.promulgatedBy ? `\`${d.promulgatedBy}\`` : ''} |`);

  return `${head}\n${body.join('\n')}\n`;
}
```

`tools/src/render/run.ts`:
```ts
import { readFileSync, writeFileSync, readdirSync, mkdirSync, existsSync } from 'node:fs';
import { renderDocumentsMd } from './documentsMd.js';
import type { DocumentRecord } from '../types.js';

const docs: DocumentRecord[] = readdirSync('data/documents')
  .filter((f) => f.endsWith('.json'))
  .flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[]);

if (!existsSync('registry')) mkdirSync('registry', { recursive: true });
writeFileSync('registry/documents.md', renderDocumentsMd(docs));
console.log(`registry/documents.md: ${docs.length} documents`);
```

- [ ] **Step 4: Run test and generate the table**

Run: `npx vitest run tools/test/render.test.ts`
Expected: PASS, 4 tests.

Run: `npx tsx tools/src/render/run.ts`
Expected: `registry/documents.md: 393 documents`.

- [ ] **Step 5: Commit**

```bash
git add tools/src/render/ registry/documents.md tools/test/render.test.ts
git commit -m "feat: generate registry/documents.md from the harvested data"
```

---

### Task 13: Update the published documents and example

**Files:**
- Modify: `examples/evangelium-vitae.json`
- Modify: `SCHEMA.md`
- Modify: `README.md`
- Test: `tools/test/example-bundle.test.ts`

**Interfaces:**
- Consumes: the schemas from Task 6.
- Produces: nothing consumed by later tasks; this is the documentation catch-up.

- [ ] **Step 1: Write the failing test**

`tools/test/example-bundle.test.ts`:
```ts
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const bundle = JSON.parse(readFileSync('examples/evangelium-vitae.json', 'utf8'));

function compile() {
  const ajv = new Ajv2020({ strict: false });
  addFormats(ajv);
  for (const f of ['genre', 'document', 'assessment']) {
    ajv.addSchema(JSON.parse(readFileSync(`schema/${f}.schema.json`, 'utf8')));
  }
  return ajv.compile(JSON.parse(readFileSync('schema/example-bundle.schema.json', 'utf8')));
}

describe('examples/evangelium-vitae.json', () => {
  it('validates against the bundle schema', () => {
    const validate = compile();
    const ok = validate(bundle);
    if (!ok) throw new Error(JSON.stringify(validate.errors, null, 2));
    expect(ok).toBe(true);
  });

  it('uses the new document id and prefixed issuer', () => {
    expect(bundle.document.id).toBe('mag:john-paul-ii/evangelium-vitae-1995');
    expect(bundle.document.issuerId).toBe('rp:john-paul-ii');
    expect(bundle.document.incipit).toBe('Evangelium Vitae');
    expect(bundle.document.sigla).toBe('EV');
    expect(bundle.document.idStatus).toBe('minted');
  });

  it('keys every assessment with a # locus on the parent document', () => {
    for (const a of bundle.assessments) {
      expect(a.document).toBe('mag:john-paul-ii/evangelium-vitae-1995');
      expect(a.id).toBe(`mag:john-paul-ii/evangelium-vitae-1995#${a.section}`);
    }
    expect(bundle.assessments.map((a: { id: string }) => a.id)).toContain(
      'mag:john-paul-ii/evangelium-vitae-1995#*');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run tools/test/example-bundle.test.ts`
Expected: FAIL — `bundle.document.id` is still `EV`.

- [ ] **Step 3: Update the example**

In `examples/evangelium-vitae.json`:
- `document.id` → `"mag:john-paul-ii/evangelium-vitae-1995"`
- add `"incipit": "Evangelium Vitae"`, `"incipitLang": "la"`, `"idStatus": "minted"`, `"sigla": "EV"`
- `document.issuerId` → `"rp:john-paul-ii"`
- every `assessment.document` → `"mag:john-paul-ii/evangelium-vitae-1995"`
- assessment ids: `EV-general` → `mag:john-paul-ii/evangelium-vitae-1995#*`; `EV-57` → `…#57`; `EV-62` → `…#62`; `EV-65` → `…#65`

- [ ] **Step 4: Update SCHEMA.md**

1. Replace the whole section `## The `locus` identifier convention` with:

```markdown
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
```

2. In `## Controlled vocabularies`, change the `issuerType` paragraph's examples from
   `` `john-paul-ii` `` to `` `rp:john-paul-ii` `` and `` `paul-vi` `` to `` `rp:paul-vi` ``.

3. In `## Example instances`, update the Document and Assessment blocks to the new example (id,
   `issuerId`, `incipit`, `idStatus`, `sigla`, `#` locus).

4. Append to `## Validation invariants` the eight new rules 8–15, copied from spec §6.

- [ ] **Step 5: Update README.md**

In Table 2, replace the `Locus` column values:
- `` `LG` *(general)* `` → `` `mag:vatican-ii/lumen-gentium-1964#*` ``
- `` `EV-57` (murder) `` → `` `mag:john-paul-ii/evangelium-vitae-1995#57` (murder) ``
- `` `EV-62` (abortion) `` → `` `mag:john-paul-ii/evangelium-vitae-1995#62` (abortion) ``
- `` `EV-65` (euthanasia) `` → `` `mag:john-paul-ii/evangelium-vitae-1995#65` (euthanasia) ``
- `` `OS-4` (*Ordinatio Sacerdotalis*) `` → `` `mag:john-paul-ii/ordinatio-sacerdotalis-1994#4` ``

Then add a short subsection after the "On sources" subsection:

```markdown
### The document registry

Concrete documents live in [`data/documents/`](data/documents/), rendered as
[`registry/documents.md`](registry/documents.md). Identifiers follow
`mag:{issuer}/{incipit-slug}-{year}` and reference popes and councils by their
[CRPDR](https://github.com/CatholicOS/crpdr) `rp:` and
[COECDR](https://github.com/CatholicOS/coecdr) `oec:` identifiers. The registry is generated by
`npm run harvest` and checked by `npm run validate`; see
[SCHEMA.md](SCHEMA.md#identifier-minting).
```

- [ ] **Step 6: Run the full suite**

Run: `npx vitest run && npx tsx tools/src/validate/run.ts`
Expected: every test green; `393 documents and 4 assessments checked, 0 failure(s)`.

- [ ] **Step 7: Commit**

```bash
git add examples/evangelium-vitae.json SCHEMA.md README.md tools/test/example-bundle.test.ts
git commit -m "docs: adopt mag: ids and # loci across SCHEMA.md, README and the example"
```

---

## Verification

After Task 13, the following must all hold:

```bash
npx vitest run                      # all suites green
npx tsx tools/src/validate/run.ts   # 393 documents and 4 assessments checked, 0 failure(s)
npx tsc --noEmit                    # no type errors
```

Spot-check the four *Ubi Primum* identifiers are distinct in `registry/documents.md`, and that
`data/documents/vatican-i.json` holds exactly *Dei Filius* and *Pastor Aeternus*.
