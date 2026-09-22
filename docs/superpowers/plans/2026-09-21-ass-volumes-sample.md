# The *Acta Sanctae Sedis* sample (phase 2c-i) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Join ASS references onto the shelf documents of Pius IX, Leo XIII and Pius X from five sample volumes of the *Acta Sanctae Sedis* (ASS 1, 12, 23, 33, 41), by synthesising the chronological index the ASS never printed from each volume's body and checking it against the volume's own *Summa actorum*; report the sample; create nothing.

**Architecture:** A new scanner (`tools/src/acta/ass.ts`) reads a whole volume's text from the local store, finds every papal act by its closing formula, walks back to its heading, and emits `ActaEntry` rows with `series: 'ASS'`, an eight-word `opening` instead of an incipit, and the quoted lines each field rests on; a summa parser (`tools/src/acta/summa.ts`) reads the volume's own list of papal acts and checks the scan's completeness. A CLI (`tools/scan-ass.ts`) writes both as checked-in fixtures. The existing join reads the entries fixture for an `ass` source, matches ASS entries with one new rule (a candidate's incipit slug as a word-boundary prefix of the entry's opening slug), and the creator holds every ASS entry. A sibling report tool (`tools/ass-volumes-report.ts`) writes the era report.

**Tech Stack:** TypeScript (ESM, `tsx`), vitest, bash + python3/pypdf 6.14.2 for the fetch, `gh` for the PR.

**Spec:** `docs/superpowers/specs/2026-09-21-ass-volumes-design.md` (read it first; the acta reference spec `2026-09-12-acta-reference-design.md` §3–§4 and the volumes spec `2026-09-13-acta-volumes-design.md` §10.3 are the patterns it extends).

## Global Constraints

- **Nothing is guessed.** A field the scanner cannot read from a quoted line becomes a defect row, never a value; a rule that fires once in the sample gets a curated row (`ASS_READINGS`), not a branch. Every curated row quotes the volume line it rests on.
- **`series: 'ASS'` entries are joined, never created** (spec: decision 1; §5). The creator holds them with reason `series-not-created`.
- **`acta.year` is the first year of a two-year volume**; the fixture names are `ass-{vol:02}-{firstYear}`; the source key is `ass-{vol}` (ASS 2 and 3 are both 1867, so the key is the volume, never the year).
- **The PDFs and the whole-volume text live in the local store** (`~/development/sources/ASS/pdf`, `.../ASS/txt`; `ACTA_SOURCES` env overrides the root, as for the AAS); only the two fixtures per volume are checked in, under `tools/fixtures/acta/`.
- **Matching never loosens beyond the opening-prefix rule** (spec §5): the near-miss stays reported, the class rule is unchanged, `Allocutiones` stays `harvested: 'no'`.
- **Pinned numbers are pinned, not asserted from a guess**: every count in `harvest-data.test.ts` is read from the harvest's output and the report, with the reason beside it.
- Commit messages end with `Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>`; the PR body ends with `🤖 Generated with [Claude Code](https://claude.com/claude-code)`.
- Work in a worktree under `.worktrees/` created from local `main` (the spec and this plan are committed there), branch `feat/ass-sample`; `npm run check` (vitest + tsc + validate) must pass at every commit that touches `tools/`.
- Line numbers cited below are those of `main` at commit `f0dc727`; re-locate by the quoted text if they have drifted.

---

## File map

| File | Responsibility |
|---|---|
| `tools/fetch-acta.sh` (modify) | `ass` mode: fetch an ASS volume PDF by the name the ASS index page links, extract the whole text in layout mode to the store. |
| `tools/src/acta/ass.ts` (create) | The scanner: anchors, walk-back, fields, defects; the `AssEntry`/`AssScan` types; the tolerant Latin/Italian date readers built on `latinDate`. |
| `tools/src/acta/summa.ts` (create) | Locate the *Summa actorum* pages, parse its papal part into rows, check the scan against it. |
| `tools/scan-ass.ts` (create) | CLI: store text → `ass-{vol}-{year}.summa.txt` + `ass-{vol}-{year}.entries.json`. |
| `tools/src/acta/index.ts` (modify) | `ActaEntry.series: 'AAS' \| 'ASS'`; optional `opening`, `anchor`, `evidence`. |
| `tools/src/acta/join.ts` (modify) | `ActaSource.kind` gains `'ass'`; five sample rows; `sourceKeyOf` series-aware; `loadActaIndexes` reads an entries fixture for an `ass` source and applies `ASS_READINGS`. |
| `tools/src/acta/match.ts` (modify) | `incipitAgrees` helper; `by: 'opening'`. |
| `tools/src/acta/create.ts` (modify) | Hold reason `series-not-created`. |
| `tools/src/acta/curation.ts` (modify) | `curationKey` series-aware; `ASS_READINGS` table. |
| `tools/src/acta/popes.ts` (modify) | Pius IX, Leo XIII. |
| `tools/src/acta/categories.ts` (modify) | ASS headings: `EPISTOLA`, `LITTERAE`, `LITTERAE IN FORMA BREVIS`, `BREVE`, `EXHORTATIO`. |
| `tools/src/acta/recover.ts` (modify) | Export `headerOf`, `headerAgrees`. |
| `tools/ass-volumes-report.ts` (create) | The era report of the sample. |
| `tools/acta-volumes-report.ts` (modify) | Load AAS sources only (the ASS has its own report). |
| `tools/test/acta-ass.test.ts`, `tools/test/acta-summa.test.ts` (create) | Scanner and summa unit tests on quoted excerpts. |
| `tools/test/acta-match.test.ts`, `acta-join.test.ts`, `acta-categories.test.ts`, `acta-popes.test.ts`, `harvest-data.test.ts` (modify) | The rule's cases; the loader; the fixture-printed checks over `.entries.json`; the pins. |
| `tools/fixtures/acta/README.md`, `README.md`, `SCHEMA.md`, the spec (modify) | Documentation. |

---

### Task 1: Fetch the five sample volumes and export their text to the store

**Files:**
- Modify: `tools/fetch-acta.sh` (the usage comment at lines 34–45; the dispatch at lines 327–340; new functions after `extract_text`, line 276)
- Modify: `tools/fixtures/acta/README.md` (a new section, after the 2b-ii-c section at line 462)

**Interfaces:**
- Produces: `~/development/sources/ASS/pdf/ASS-{vol}-{years}-ocr.pdf` and `~/development/sources/ASS/txt/ass-{vol:02}-{firstYear}.txt` (one page per `\f`, pypdf layout mode) for volumes 1, 12, 23, 33, 41 — the input of Task 4.

- [ ] **Step 1: Add the ASS functions to the script**

After `extract_text()` (ends at line 276 with `}`), insert:

```bash
# The *Acta Sanctae Sedis* (ass volumes spec §2, phase 2c): one whole-volume OCR PDF per
# volume on https://www.vatican.va/archive/ass/index_it.htm (`documents/ASS-33-1900-1-ocr.pdf`;
# two names carry `+supplemento`), read off the page as the AAS names are. The PDF goes to
# the ASS store (~/development/sources/ASS/pdf) and the whole text, in pypdf's layout mode
# -- the mode that keeps an act's heading, salutation and incipit on lines of their own
# (measured on ASS 12, 33 and 41, 2026-09-21) -- to <store>/txt/ass-{vol}-{year}.txt, one
# page per form feed; {year} is the first year the file name prints. The scanner
# (tools/scan-ass.ts) reads that text and writes the two checked-in fixtures; nothing else
# of the volume is checked in.
ASS_BASE='https://www.vatican.va/archive/ass'
ASS_STORE="${ACTA_SOURCES:-$HOME/development/sources/ASS}/pdf"

extract_text_layout() { # extract_text_layout <pdf> <out>
  if [ -s "$2" ]; then echo "    cached: $2"; return 0; fi
  mkdir -p "$(dirname "$2")"
  python3 - "$1" "$2" <<'EOF'
import sys
from pypdf import PdfReader
pdf, out = sys.argv[1], sys.argv[2]
reader = PdfReader(pdf)
pages = [(p.extract_text(extraction_mode='layout') or '') for p in reader.pages]
with open(out, 'w', encoding='utf-8') as f:
    f.write('\f'.join(pages))
print(f'    {len(pages)} pages -> {out} (layout mode)')
EOF
}

get_ass() { # get_ass <volume number, 1-41>
  local vol; vol="$(printf '%02d' "$1")"
  mkdir -p "$ASS_STORE"
  local html="$ASS_STORE/index_it.htm"
  [ -s "$html" ] || curl -fsSL --retry 3 --max-time 60 "$ASS_BASE/index_it.htm" -o "$html"
  local path
  path="$(grep -oiE "documents/ASS-$vol-[^\"']*\.pdf" "$html" | sort -u | head -n1 || true)"
  if [ -z "$path" ]; then
    echo "    MISSING: no volume PDF for ASS $vol on $ASS_BASE/index_it.htm" >&2
    return 0
  fi
  local file year pdf
  file="$(basename "$path")"
  year="$(echo "$file" | sed -nE 's/^ASS-[0-9]{2}-([0-9]{4}).*/\1/p')"
  pdf="$ASS_STORE/$file"
  echo "  ASS $vol ($year)  ($path)"
  if [ -s "$pdf" ]; then echo "    cached: $pdf"; else
    local part="$pdf.part"
    if curl -fsSL --retry 3 --max-time 900 "$ASS_BASE/$path" -o "$part"; then mv -f "$part" "$pdf"; else
      rm -f "$part"; echo "    MISSING: $ASS_BASE/$path" >&2; return 0
    fi
  fi
  extract_text_layout "$pdf" "${ASS_STORE%/pdf}/txt/ass-$vol-$year.txt"
}
```

- [ ] **Step 2: Add the dispatch and the usage lines**

Replace the dispatch block (from `MODE=fixtures` to the final `fi`) with:

```bash
MODE=fixtures
if [ "${1:-}" = "text" ]; then MODE=text; shift; fi
if [ "${1:-}" = "ass" ]; then
  shift
  ARG="${1:-sample}"
  if [ "$ARG" = "sample" ]; then
    for v in 1 12 23 33 41; do get_ass "$v"; done
  elif [[ "$ARG" =~ ^([0-9]{1,2})-([0-9]{1,2})$ ]]; then
    for v in $(seq "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}"); do get_ass "$v"; done
  else
    get_ass "$ARG"
  fi
  exit 0
fi
ARG="${1:-}"
if [ "$ARG" = "sample" ]; then
  for y in 1909 1917 1931 1958 1978 2012; do get "$y"; done
elif [[ "$ARG" =~ ^([0-9]{4})-([0-9]{4})$ ]]; then
  for y in $(seq "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}"); do get "$y"; done
elif [ -n "$ARG" ]; then
  get "$ARG"
else
  for y in $(seq 2015 2024); do get "$y"; done
fi
```

In the usage comment, after the `text 1909-1925` line, add:

```bash
#        tools/fetch-acta.sh ass sample      # the five ASS volumes of phase 2c-i (1, 12, 23, 33, 41): PDF and whole text to the ASS store
#        tools/fetch-acta.sh ass 33          # one ASS volume (1-41); ass 1-41 for a range. Then: npx tsx tools/scan-ass.ts ass-33
```

- [ ] **Step 3: Run it for the sample**

Run: `tools/fetch-acta.sh ass sample`
Expected: five lines `ASS 01 (1865) (documents/ASS-01-1865-66-ocr.pdf)` … `ASS 41 (1908) …`; `cached:` for the three PDFs already in the store; five `N pages -> ~/development/sources/ASS/txt/ass-NN-YYYY.txt (layout mode)` lines. Note each volume's page count for the README (ASS 12: 672, 33: 768, 41: 810 measured on 2026-09-21).

Run: `ls ~/development/sources/ASS/txt/`
Expected: `ass-01-1865.txt ass-12-1879.txt ass-23-1890.txt ass-33-1900.txt ass-41-1908.txt`.

- [ ] **Step 4: Document the store in the fixtures README**

Append after the 2b-ii-c section (before any trailing section that follows it, keeping the file's order) a section:

```markdown
### The *Acta Sanctae Sedis* volumes (phase 2c-i, the sample)

The ASS (41 volumes, 1865–1908) print no chronological index (ass volumes spec,
`docs/superpowers/specs/2026-09-21-ass-volumes-design.md` §1), so the fixtures are not
index pages but two files per volume written by `tools/scan-ass.ts` from the whole-volume
text in the local store (`tools/fetch-acta.sh ass <vol>`; `~/development/sources/ASS/txt/`,
pypdf 6.14.2 layout mode, never checked in): `ass-{vol}-{year}.summa.txt`, the pages of the
volume's *Summa actorum* (ASS 41: *Index analyticus*), and `ass-{vol}-{year}.entries.json`,
the chronological index synthesised from the body — one row per papal act with its class
heading, pope, description, the first eight words after the salutation (`opening`; no
incipit is asserted), the date from the act's own dateline, the page, and the five quoted
lines each rests on (spec §3). `{year}` is the first year of the volume's span.

| Source | Files | RETRIEVED | Volume pages | Summa pages | Acts scanned | Defects | Summa rows: claimed / unclaimed |
|---|---|---|---|---|---|---|---|
| ASS 1 (1865–66, Pius IX) | `ass-01-1865.*` | **2026-09-2D** | N | a–b | n | n | n / n |
| ASS 12 (1879, Leo XIII) | `ass-12-1879.*` | **2026-09-2D** | 672 | 647–653 | n | n | n / n |
| ASS 23 (1890–91, Leo XIII) | `ass-23-1890.*` | **2026-09-2D** | N | a–b | n | n | n / n |
| ASS 33 (1900–01, Leo XIII) | `ass-33-1900.*` | **2026-09-2D** | 768 | 761–768 | n | n | n / n |
| ASS 41 (1908, Pius X) | `ass-41-1908.*` | **2026-09-2D** | 810 | 799–809 | n | n | n / n |
```

(The `n`/`N`/`a–b`/`2026-09-2D` cells are filled in Task 4 Step 8 from the scanner's output; the section is added now so the commit that adds the store mode also documents it.)

- [ ] **Step 5: Commit**

```bash
git add tools/fetch-acta.sh tools/fixtures/acta/README.md
git commit -m "Fetch the five sample volumes of the Acta Sanctae Sedis and export their text to the store (phase 2c-i, ass volumes spec §2)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: The scanner — types, the dates, the anchors, the openings

**Files:**
- Create: `tools/src/acta/ass.ts`
- Modify: `tools/src/acta/index.ts:132-134` (`ActaEntry.series`), and the field list after `printedPage` (line ~194)
- Modify: `tools/src/acta/recover.ts:458,472` (export `headerOf`, `headerAgrees`)
- Test: `tools/test/acta-ass.test.ts`

**Interfaces:**
- Consumes: `latinDate(text): string | null` (`recover.ts:283`), `headerOf(page)`, `headerAgrees(header, n)` (`recover.ts`), `normaliseHeading` (`categories.ts`), `ACTA_POPES` (`popes.ts`, extended in Task 5).
- Produces (all exported from `ass.ts`):
  - `interface AssEvidence { heading: string; salutation: string | null; opening: string; dateline: string | null; header: string }`
  - `interface AssEntry extends ActaEntry { series: 'ASS'; incipit: null; opening: string; anchor: 'dateline' | 'heading' | 'reading'; evidence: AssEvidence }`
  - `interface AssDefect { page: number; reason: 'no-heading' | 'no-date' | 'no-opening' | 'header-mismatch' | 'unknown-pope'; lines: string[] }`
  - `interface AssScan { source: string; generated: string; text: string; volume: number; year: number; pages: number; entries: AssEntry[]; defects: AssDefect[]; summa: SummaCheck }` (`SummaCheck` from Task 3)
  - `assDate(text: string, span: { from: number; to: number }): string | null`
  - `findAnchors(pages: readonly string[]): Anchor[]` where `interface Anchor { page: number; line: number; kind: 'dateline' | 'heading'; text: string }`
  - `scanVolume(pages: readonly string[], opts: { volume: number; year: number; yearTo: number; lastBodyPage: number }): { entries: AssEntry[]; defects: AssDefect[] }`

- [ ] **Step 1: Widen `ActaEntry` and export the header helpers**

In `tools/src/acta/index.ts`, change `series: 'AAS';` (line 133) to:

```ts
  /** The gazette: the AAS (every parsed index) or the ASS (the entries the scanner synthesises from a volume body, ass.ts). */
  series: 'AAS' | 'ASS';
```

and after the `printedPage?: number;` field (the last field of `ActaEntry`) add:

```ts
  /**
   * An ASS entry's first eight words after the salutation line (ass volumes spec §3): the
   * scanner cannot know how many words the shelf's incipit has, so `incipit` is null and
   * the matcher reads a candidate's incipit slug as a word-boundary prefix of this (match.ts).
   */
  opening?: string;
  /** How an ASS entry was found: from the act's dateline, from an allocution's heading, or from a curated reading (ASS_READINGS). */
  anchor?: 'dateline' | 'heading' | 'reading';
  /** The lines an ASS entry's fields were read from, as extracted (ass.ts, AssEvidence). */
  evidence?: { heading: string; salutation: string | null; opening: string; dateline: string | null; header: string };
```

In `tools/src/acta/recover.ts`, change `const headerOf = ` (line 458) to `export const headerOf = ` and `const headerAgrees = ` (line 472) to `export const headerAgrees = `.

Run: `npx tsc --noEmit`
Expected: no errors (every existing entry construction sets `series: 'AAS'`, which the union admits).

- [ ] **Step 2: Write the failing tests for the date reader**

Create `tools/test/acta-ass.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { assDate, findAnchors, scanVolume } from '../src/acta/ass.js';

const SPAN = { from: 1900, to: 1901 };

describe('assDate (ass volumes spec §3): the three spellings of the ASS dateline and the OCR of its numerals', () => {
  it('reads an arabic day and year', () => {
    expect(assDate('Datum Romae apud Sanctum Petrum, die 28 augusti 1879, Pontificatus Nostri anno secundo.', { from: 1879, to: 1879 })).toBe('1879-08-28');
  });
  it('reads a roman day and an `anno` roman year', () => {
    expect(assDate('Datum Romae apud S. Petrum die XXI Iulii anno MDCCCC, Pontificatus Nostri XXIII.', SPAN)).toBe('1900-07-21');
  });
  it('reads `An.` and `a.` before the year, which latinDate does not (ASS 33 p. 273, ASS 41 p. 19)', () => {
    expect(assDate('Datum Romae apud S. Petrum die i Novembris An. MDCCCC, Pontificatus Nostri vicesimo tertio.', SPAN)).toBe('1900-11-01');
    expect(assDate('Datum Romae apud S. Petrum, die xxv Iunii a. MDCCCCV, Pontificatus Nostri secundo.', { from: 1905, to: 1905 })).toBe('1905-06-25');
  });
  it('repairs the OCR of a roman numeral within the volume span: G for C, H for II, n for ii, an accented I (ASS 33 p. 285; ASS 41 pp. 297, 298, 491)', () => {
    expect(assDate('Datum Romae apud S. Petrum die i Novembris An. MDCGCC, Pontificatus Nostri vicesimo tertio.', SPAN)).toBe('1900-11-01');
    expect(assDate('Datum Romae apud S. Petrum, die xix Februarii MCMVHI, Pontificatus nostri anno quinto.', { from: 1908, to: 1908 })).toBe('1908-02-19');
    expect(assDate('Datum Romae apud Sanctum Petrum, die xxin Martii MCMViii, Pontificatus Nostri anno quinto.', { from: 1908, to: 1908 })).toBe('1908-03-23');
    expect(assDate('Datum Romae apud S. Petrum, die xxxi Martii MCMVIÌI, Pontificatus Nostri anno quinto.', { from: 1908, to: 1908 })).toBe('1908-03-31');
  });
  it('reads the year the constitutions spell in ordinal words before the day', () => {
    expect(assDate('Datum Romae apud Sanctum Petrum anno Incarnationis Dominicae millesimo nongentesimo octavo, tertio Kalendas Iulias, Pontificatus Nostri anno quinto.', { from: 1908, to: 1908 })).toBeNull();
    // The Kalends form is not read by rule (one act in the sample, *Sapienti consilio*): null, so the tool emits a defect and a curated reading supplies the date.
  });
  it('rejects a year outside the span by more than two years, and a formula without a day', () => {
    expect(assDate('Datum Romae apud S. Petrum die XXI Iulii anno MDCCCLXX, Pontificatus Nostri XXIII.', SPAN)).toBeNull();
    expect(assDate('Datum Romae ex Secretaria eiusdem sac. Congregationis 1879.', { from: 1879, to: 1879 })).toBeNull();
  });
  it('reads an Italian dateline (`Dal Vaticano, 20 Settembre 1900`)', () => {
    expect(assDate('Dal Vaticano, 20 Settembre 1900. Del Nostro Pontificato l\'anno XXIII.', SPAN)).toBe('1900-09-20');
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `npx vitest run tools/test/acta-ass.test.ts`
Expected: FAIL — `Cannot find module '../src/acta/ass.js'`.

- [ ] **Step 4: Write `ass.ts` — the date reader**

Create `tools/src/acta/ass.ts`:

```ts
/**
 * The chronological index the *Acta Sanctae Sedis* never printed, synthesised from a
 * volume's body (ass volumes spec §3, phase 2c). Every papal act in the ASS opens with a
 * caps class heading, the pope's name and a description, then the salutation line
 * (`LEO PP. XIII`), then the incipit, and closes with the pope's own dateline (`Datum Romae
 * apud S. Petrum die i Novembris An. MDCCCC, Pontificatus Nostri vicesimo tertio`) -- so
 * the body carries everything the AAS chronological index prints. An act is found from
 * its end (the dateline, or the heading for an allocution, which has none) and read from
 * its start (the nearest preceding class heading that is not a running head). Nothing is
 * guessed: what cannot be read from a quoted line is a defect row for the report and for a
 * curated reading (ASS_READINGS, curation.ts).
 *
 * The tool (tools/scan-ass.ts) runs this once per volume against the whole-volume text in
 * the local store and writes the entries fixture beside the summa fixture; the join reads
 * the fixture offline (join.ts) and never the store.
 */
import { latinDate, headerOf, headerAgrees } from './recover.js';
import { normaliseHeading } from './categories.js';
import { ACTA_POPES } from './popes.js';
import type { ActaEntry } from './index.js';
import type { SummaCheck } from './summa.js';

export interface AssEvidence {
  /** The class heading line(s) as extracted, joined by ` / `. */
  heading: string;
  /** The salutation line (`LEO PP. XIII`), or null when none stands between the heading and the opening (an allocution). */
  salutation: string | null;
  /** The line the opening was read from. */
  opening: string;
  /** The dateline as extracted, or null for a heading-anchored entry. */
  dateline: string | null;
  /** The first non-blank line of the page the heading is on (its running header or page number). */
  header: string;
}

export interface AssEntry extends ActaEntry {
  series: 'ASS';
  incipit: null;
  opening: string;
  anchor: 'dateline' | 'heading' | 'reading';
  evidence: AssEvidence;
}

export interface AssDefect {
  /** The page (1-based, the PDF page) the defect was found on. */
  page: number;
  reason: 'no-heading' | 'no-date' | 'no-opening' | 'header-mismatch' | 'unknown-pope';
  /** The lines the scanner did find, as extracted. */
  lines: string[];
}

export interface AssScan {
  source: string;
  generated: string;
  text: string;
  volume: number;
  year: number;
  pages: number;
  entries: AssEntry[];
  defects: AssDefect[];
  summa: SummaCheck;
}

export interface Anchor {
  /** 1-based page. */
  page: number;
  /** 0-based line within the page. */
  line: number;
  kind: 'dateline' | 'heading';
  text: string;
}

// --- dates ---------------------------------------------------------------------------------

/**
 * The OCR's readings of the letters of a roman numeral, measured on the sample: `MDCGCC`
 * (ASS 33 p. 285), `MCMVHI` (ASS 41 p. 297), `xxin` for `xxiii` (ASS 41 p. 298),
 * `MCMVIÌI` (ASS 41 p. 491). Applied to a numeral token only, never to a word.
 */
const ROMAN_OCR: Readonly<Record<string, string>> = { g: 'c', h: 'ii', n: 'ii', ì: 'i', í: 'i', î: 'i', ï: 'i', j: 'i' };
const repairRoman = (token: string): string => token.toLowerCase().split('').map((c) => ROMAN_OCR[c] ?? c).join('');
const ROMAN_TOKEN = /^[mdclxvighnìíîïj]+$/i;

const IT_MONTHS: Readonly<Record<string, number>> = {
  gennaio: 1, febbraio: 2, marzo: 3, aprile: 4, maggio: 5, giugno: 6, luglio: 7, agosto: 8, settembre: 9, ottobre: 10, novembre: 11, dicembre: 12,
};

/**
 * The date of an ASS act from its own dateline, on top of `latinDate` (recover.ts): the
 * ASS abbreviates `anno` to `An.` and `a.` before the year (`die i Novembris An. MDCCCC`,
 * `die xxv Iunii a. MDCCCCV`), and its OCR misreads letters of the roman numerals
 * (ROMAN_OCR) -- both repaired in the text before `latinDate` reads it, the numeral repair
 * on numeral-shaped tokens after `die`, `anno`/`an.`/`a.` and the month only. An Italian
 * dateline (`Dal Vaticano, 20 Settembre 1900`) is read by its own month table. A year more
 * than two years outside the volume's span (`span`) is rejected: the repair must not make
 * a year out of noise. Null when no readable date; the caller reports a defect.
 */
export function assDate(text: string, span: { from: number; to: number }): string | null {
  const t = text.replace(/­/g, '').replace(/\s+/g, ' ');
  const inSpan = (iso: string | null): string | null => {
    if (iso === null) return null;
    const y = Number(iso.slice(0, 4));
    return y >= span.from - 2 && y <= span.to + 2 ? iso : null;
  };
  // Latin: normalise `An.`/`a.` to `anno`; repair the day token after `die` (pass 1) and any
  // numeral-shaped token of four letters or more that needs a repair (pass 2: a year --
  // `MDCGCC`, `MCMVHI` -- never a Latin word, which the length and the need for a repair
  // exclude; two passes, since one global regex would consume `Novembris anno` and skip
  // the year after it).
  const needsRepair = /[ghnìíîïj]/i;
  const latin = t
    .replace(/\b(?:An|a)\.\s+(?=[MDCLXVIGHNmdclxvighn])/g, 'anno ')
    .replace(/\b(die)\s+([A-Za-zìíîï]{1,6})\b/g, (m, lead: string, tok: string) => (ROMAN_TOKEN.test(tok) && needsRepair.test(tok) ? `${lead} ${repairRoman(tok)}` : m))
    .replace(/\b([MDCLXVIGHNmdclxvighnìíîïj]{4,})\b/g, (tok: string) => (needsRepair.test(tok) && /^[mdclxvi]+$/.test(repairRoman(tok)) ? repairRoman(tok) : tok));
  const fromLatin = inSpan(latinDate(latin));
  if (fromLatin !== null) return fromLatin;
  // Italian: `Dal Vaticano, 20 Settembre 1900` / `Dato a Roma, li 3 Marzo 1901`.
  const it = t.match(/\b(?:Dal|Dato|Data|Roma|Vaticano)\b[^.]{0,60}?\b(?:li|il|addì)?\s*(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  if (it) {
    const month = IT_MONTHS[it[2]!.toLowerCase()];
    const day = Number(it[1]);
    if (month !== undefined && day >= 1 && day <= 31) return inSpan(`${it[3]}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  }
  return null;
}
```

- [ ] **Step 5: Run the date tests**

Run: `npx vitest run tools/test/acta-ass.test.ts -t assDate`
Expected: PASS for every `assDate` case (the `findAnchors`/`scanVolume` imports resolve once Step 7 adds them; until then the file fails to import — so add the two exports as stubs first if you run the tests before Step 7: `export function findAnchors(): Anchor[] { return []; }` etc., and replace them in Step 7). The `repairRoman` guard against real Latin words: `Iulii`, `Maii` contain only roman letters plus others (`u`, `a`) so they never match `ROMAN_TOKEN`; `Novembris` neither. If a case fails, print `latin` inside `assDate` for that input and adjust the replacement, keeping the guard list quoted.

- [ ] **Step 6: Write the failing tests for the anchors and the scan**

Append to `tools/test/acta-ass.test.ts`:

```ts
/** Three pages of a volume in the layout mode's shape: an act that opens on p. 2 and closes on p. 3, after a decree with a dicastery dateline on p. 1. The page numbers the headers print are the PDF pages (2, 3), as in the volumes, where the scanner checks the header against the page (`headerAgrees`). */
const PAGES = [
  [
    '                        DECRETUM',
    'Sacra Congregatio ... respondit.',
    '         Datum Romae ex Secretaria eiusdem sac. Congregationis die 20 Septembris 1879.',
    '',
  ].join('\n'),
  [
    '                                                          2',
    '          EPISTOLA ENCYCLICA Sanctissimi Domini Nostri LEONIS PAPAE XIII.',
    '                                           DE IESU CHRISTO REDEMPTORE.',
    '',
    '                                                        LEO PP. XIII',
    '',
    '      Venerabiles Fratres Salutem et Apostolicam Benedictionem.',
    '',
    '          Tametsi futura prospicientibus, vacuo a sollicitudine animo',
    'esse non licet, immo vero non paucae sunt nec leves extime-',
    'scendae formidines.',
  ].join('\n'),
  [
    '3                                             EPISTOLA ENCYCLICA',
    'communi studio summisque precibus flectere ad misericordiam',
    '         Datum Romae apud S. Petrum die i Novembris An. MDCGCC,',
    'Pontificatus Nostri vicesimo tertio.',
    '',
    '                                                     LEO PP. XIII.',
  ].join('\n'),
];

describe('findAnchors (spec §3): the pope\'s dateline, not a dicastery\'s; an allocution\'s heading', () => {
  it('anchors on `Datum Romae` followed within three lines by `Pontificatus Nostri`, and not on a Congregation\'s `Datum Romae ex Secretaria`', () => {
    const anchors = findAnchors(PAGES);
    expect(anchors).toHaveLength(1);
    expect(anchors[0]).toMatchObject({ page: 3, line: 2, kind: 'dateline' });
    expect(anchors[0]!.text).toContain('Datum Romae apud S. Petrum die i Novembris An. MDCGCC');
  });
  it('anchors an allocution on its heading, since it has no dateline (ASS 12 p. 13)', () => {
    const page = ['                                   la', '', '                ALLOCUTIO', '', '          SANCTISSIMI DOMINI NOSTRI LEONIS XIII', '     AD CATHOLICARUM EPHEMERIDUM REPRAESENTANTES', '', '       Ingenti sane laetitia suavique animi iucunditate hodie per-', 'fundimur ex conspectu frequentiaque vestra, filii dilectissimi,'].join('\n');
    const anchors = findAnchors([page]);
    expect(anchors).toEqual([{ page: 1, line: 2, kind: 'heading', text: 'ALLOCUTIO' }]);
  });
  it('anchors an Italian letter on `Del Nostro Pontificato`', () => {
    const page = ['Signor Cardinale,', 'I luttuosi avvenimenti ...', '   Dal Vaticano, 20 Settembre 1900.', '   Del Nostro Pontificato l\'anno XXIII.', '                     LEONE PP. XIII'].join('\n');
    expect(findAnchors([page])).toMatchObject([{ page: 1, line: 2, kind: 'dateline' }]);
  });
});

describe('scanVolume (spec §3): an act read from its dateline back to its heading', () => {
  const opts = { volume: 33, year: 1900, yearTo: 1901, lastBodyPage: 3 };
  it('reads category, pope, description, opening, date and page, and quotes the five lines', () => {
    const { entries, defects } = scanVolume(PAGES, opts);
    expect(defects).toEqual([]);
    expect(entries).toHaveLength(1);
    const e = entries[0]!;
    expect(e).toMatchObject({
      series: 'ASS', volume: 33, year: 1900, page: 2, pope: 'Leo XIII', category: 'EPISTOLA ENCYCLICA',
      date: '1900-11-01', incipit: null, quoted: false, toponym: null, anchor: 'dateline',
      opening: 'Tametsi futura prospicientibus, vacuo a sollicitudine animo esse',
      description: 'Sanctissimi Domini Nostri LEONIS PAPAE XIII. DE IESU CHRISTO REDEMPTORE.',
    });
    expect(e.evidence).toEqual({
      heading: 'EPISTOLA ENCYCLICA Sanctissimi Domini Nostri LEONIS PAPAE XIII. / DE IESU CHRISTO REDEMPTORE.',
      salutation: 'LEO PP. XIII',
      opening: 'Tametsi futura prospicientibus, vacuo a sollicitudine animo',
      dateline: 'Datum Romae apud S. Petrum die i Novembris An. MDCGCC, Pontificatus Nostri vicesimo tertio.',
      header: '2',
    });
    expect(e.raw).toBe('EPISTOLA ENCYCLICA Sanctissimi Domini Nostri LEONIS PAPAE XIII. / DE IESU CHRISTO REDEMPTORE.');
  });
  it('does not stop the walk-back at a running head (`3   EPISTOLA ENCYCLICA` at the top of the closing page, followed by body text)', () => {
    const { entries } = scanVolume(PAGES, opts);
    expect(entries[0]!.page).toBe(2);
  });
  it('reports an anchor with no heading before it (and after the previous anchor) as `no-heading`, with the dateline quoted', () => {
    const pages = ['Body of a decree.', '   Datum Romae apud S. Petrum die 3 Martii 1901,', 'Pontificatus Nostri vicesimo quarto.'];
    const { entries, defects } = scanVolume(pages, { ...opts, lastBodyPage: 1 });
    expect(entries).toEqual([]);
    expect(defects).toEqual([{ page: 1, reason: 'no-heading', lines: ['Datum Romae apud S. Petrum die 3 Martii 1901,', 'Pontificatus Nostri vicesimo quarto.'] }]);
  });
  it('reports an unreadable date as `no-date`, keeping the heading and the dateline in the lines', () => {
    const pages = [PAGES[0]!, PAGES[1]!, PAGES[2]!.replace('die i Novembris An. MDCGCC', 'anno Incarnationis Dominicae millesimo nongentesimo, tertio Kalendas Iulias')];
    const { entries, defects } = scanVolume(pages, opts);
    expect(entries).toEqual([]);
    expect(defects).toHaveLength(1);
    expect(defects[0]).toMatchObject({ page: 2, reason: 'no-date' });
    expect(defects[0]!.lines[0]).toContain('EPISTOLA ENCYCLICA');
  });
  it('reads an allocution from its heading: opening after the heading block, date `????-??-??` when the heading prints none, anchor `heading`', () => {
    const page = ['                                   la', '', '                ALLOCUTIO', '', '          SANCTISSIMI DOMINI NOSTRI LEONIS XIII', '     AD CATHOLICARUM EPHEMERIDUM REPRAESENTANTES', '', '       Ingenti sane laetitia suavique animi iucunditate hodie per-', 'fundimur ex conspectu frequentiaque vestra, filii dilectissimi,'].join('\n');
    const { entries, defects } = scanVolume([page], { volume: 12, year: 1879, yearTo: 1879, lastBodyPage: 1 });
    expect(defects).toEqual([]);
    expect(entries[0]).toMatchObject({
      category: 'ALLOCUTIO', pope: 'Leo XIII', page: 1, date: '????-??-??', anchor: 'heading',
      opening: 'Ingenti sane laetitia suavique animi iucunditate hodie perfundimur',
      evidence: { salutation: null, dateline: null, header: 'la' },
    });
  });
  it('dates an allocution from its own heading (`in Consistorio secreto diei 16 Decembris 1907`)', () => {
    const page = ['                ALLOCUTIO', '  quam Pius X habuit in Consistorio secreto diei 16 Decembris 1907,', '  de mendaci ac insolenti modernistarum superbia.', '', '   Venerabiles Fratres,', '', '   Quum novissime ad vos verba fecimus, iam tum ...'].join('\n');
    const { entries } = scanVolume([page], { volume: 41, year: 1908, yearTo: 1908, lastBodyPage: 1 });
    expect(entries[0]).toMatchObject({ pope: 'Pius X', date: '1907-12-16', anchor: 'heading', opening: 'Quum novissime ad vos verba fecimus, iam tum' });
  });
  it('reads two acts that open on one page, each from its own anchor', () => {
    const page = [
      '                                                          1',
      '                              EPISTOLA',
      '   Qua Pius X abolet scholas Pontificii Seminarii Vaticani.',
      '',
      '                                                    PIUS PP. X',
      '   Dilecte Fili Noster, salutem et Apostolicam Benedictionem.',
      '   Quum Seminarium Vaticanum, quod Nos ipsi ... constituimus.',
      '         Datum Romae apud S. Petrum, die xxv Iunii a. MDCCCCV, Pontificatus Nostri secundo.',
      '                              EPISTOLA',
      '   Qua Pius X laetatur de habito Concilio provinciali Burgensi.',
      '',
      '                                                    PIUS PP. X',
      '   Venerabilis Frater, salutem et Apostolicam Benedictionem.',
      '   Libenter accepimus litteras tuas quibus ... significas.',
      '         Datum Romae apud S. Petrum, die xxx Iunii a. MDCCCCV, Pontificatus Nostri secundo.',
    ].join('\n');
    const { entries, defects } = scanVolume([page], { volume: 41, year: 1908, yearTo: 1908, lastBodyPage: 1 });
    expect(defects).toEqual([]);
    expect(entries.map((e) => [e.date, e.opening.split(' ').slice(0, 2).join(' ')])).toEqual([['1905-06-25', 'Quum Seminarium'], ['1905-06-30', 'Libenter accepimus']]);
    expect(entries.every((e) => e.page === 1 && e.category === 'EPISTOLA' && e.pope === 'Pius X')).toBe(true);
  });
  it('reports a page whose running header prints another number as `header-mismatch`', () => {
    const pages = [PAGES[0]!, PAGES[1]!.replace(/^\s*2\n/, '   291\n'), PAGES[2]!];
    const { entries, defects } = scanVolume(pages, opts);
    expect(entries).toEqual([]);
    expect(defects[0]).toMatchObject({ page: 2, reason: 'header-mismatch' });
  });
  it('ignores an anchor after `lastBodyPage` (the summa quotes no dateline, but the bound is kept anyway)', () => {
    const { entries } = scanVolume(PAGES, { ...opts, lastBodyPage: 2 });
    expect(entries).toEqual([]);
  });
});
```

- [ ] **Step 7: Implement the anchors, the walk-back and the scan**

Append to `tools/src/acta/ass.ts`:

```ts
// --- anchors -------------------------------------------------------------------------------

/** The pope's own dateline: the anchor, then `Pontificatus Nostri` within the next three lines (a dicastery's `Datum Romae ex Secretaria …` has none). */
const DATUM_RE = /Dat(?:um|\.)\s+[REB]om[ae]{1,2}|\bDat[oa]\s+(?:a|in)\s+Roma|\bDal\s+Vaticano|\bDal\s+Palazzo/;
const PONTIFICATUS_RE = /Pontificatus\s+[NÑ]ostri|(?:del|Del)\s+Nostro\s+Pontificato/;

/**
 * The class headings a papal act opens with in the ASS, longest first so that `EPISTOLA
 * ENCYCLICA` is read before `EPISTOLA` (spec §3; extended only by what a sample volume
 * prints, each addition quoted). `LITTERAE in forma Brevis` is matched case-insensitively
 * on its tail.
 */
export const CLASS_HEADINGS: readonly string[] = [
  'EPISTOLA ENCYCLICA', 'LITTERAE ENCYCLICAE', 'LITTERAE APOSTOLICAE', 'LITTERAE DECRETALES',
  'CONSTITUTIO APOSTOLICA', 'MOTU PROPRIO', 'ALLOCUTIO', 'EXHORTATIO', 'CHIROGRAPHUS', 'BREVE', 'LITTERAE', 'EPISTOLA',
];
const HEADING_RE = new RegExp(`^\\s*(?:\\d[\\dOoiIla]{0,3}\\s+)?(?:ACTA ROMANI PONTIFICIS\\s+)?(${CLASS_HEADINGS.join('|')})(\\s+in forma Brevis)?\\b\\.?(.*)$`);
/**
 * The pope named in a heading block or a salutation: the genitive of the heading
 * (`SANCTISSIMI DOMINI NOSTRI LEONIS XIII`, `SSmi. D. N. Leonis XIII`, `Pii PP. X`), the
 * nominative of the description (`Qua Pius X laudat`) or of the salutation (`LEO PP.
 * XIII`, `PIUS PP. X`, `LEO EPISCOPUS`), the Italian `LEONE PP. XIII`.
 */
const POPE_RE = /\b(LEONIS|LEO|LEONE|PII|PIUS|PIO)\b\s*(?:PAPAE|PP\.?|Pp\.?|EPISCOPUS|div\.\s*prov\.\s*(?:Papae|PP\.?)|Div\.\s*Prov\.\s*(?:Papae|PP\.?))?\s*(XIII|IX|X)\b/i;
const SALUTATION_RE = /^\s*(LEO|PIUS|LEONE|PIO)\s+(PP\.?|PAPA|EPISCOPUS)\b[^\n]{0,40}$/;
/** An address line between the salutation and the opening: `Venerabiles Fratres Salutem et Apostolicam Benedictionem.`, `Dilecte Fili Noster, salutem …`, `Venerabiles Fratres,`. */
const ADDRESS_RE = /^\s*(?:Venerabil|Dilect|Signor|Salutem|Carissim)|Benedictionem\.?\s*$|salutem et Apostolicam/i;
/** An allocution's own dating: `in Consistorio secreto diei 16 Decembris 1907`, `die 18 Dec. 1907 habita`. */
const HEADING_DATE_RE = /\bdie[i]?\s+(\d{1,2}|[ivxl]+)\s+([A-Za-z]+)\.?\s+(\d{4})/i;

/** What an act's heading block names that a running head and a body line do not: the pope (POPE_RE), the formula `SSmi D. N.` / `Sanctissimi Domini Nostri`, or `Pontifex` / `SSmus Pater` in the description (`Qua Pontifex mittit Legatum …`, ASS 41 (1908) 65). */
const OPENING_FORMULA_RE = new RegExp(`${POPE_RE.source}|SANCTISSIMI|Sanctissimi|SS(?:MI|mi|ÑI)?\\.?\\s*[DO]\\.?\\s*N\\.|\\bPontifex\\b|SS(?:mus|MUS)\\.?\\s+Pater`, 'i');

/**
 * Whether the class heading at `lines[i]` opens an act: its heading block -- the line and
 * the lines after it to the first blank line, four at most -- carries the opening formula
 * (OPENING_FORMULA_RE). A running head (`274 EPISTOLA ENCYCLICA`, `EPISTOLA ENCYCLICA Hi`
 * for the OCR's 111, ASS 12 (1879)) is followed by body text and fails the test; an
 * `ALLOCUTIO` alone on its line is followed by `SANCTISSIMI DOMINI NOSTRI LEONIS XIII`
 * (ASS 12 (1879) 13) and passes. A body line whose first words the OCR set in capitals
 * as a class word is excluded the same way.
 */
const isOpening = (lines: readonly string[], i: number): boolean => {
  if (!HEADING_RE.test(lines[i]!)) return false;
  const block: string[] = [];
  for (let k = i; k < Math.min(lines.length, i + 4); k++) {
    if (k > i && lines[k]!.trim() === '') break;
    block.push(lines[k]!);
  }
  return OPENING_FORMULA_RE.test(block.join(' '));
};

/**
 * Every anchor of the body, in page order: the pope's datelines (`dateline`) and the
 * allocution headings (`heading`, since an allocution closes without a dateline). A
 * heading line is an anchor only when it opens an act (isOpening).
 */
export function findAnchors(pages: readonly string[]): Anchor[] {
  const anchors: Anchor[] = [];
  pages.forEach((page, p) => {
    const lines = page.split('\n');
    lines.forEach((line, i) => {
      if (DATUM_RE.test(line) && PONTIFICATUS_RE.test(lines.slice(i, i + 4).join(' '))) {
        anchors.push({ page: p + 1, line: i, kind: 'dateline', text: lines.slice(i, i + 2).map((l) => l.trim()).join(' ').replace(/­/g, '') });
        return;
      }
      const h = line.match(HEADING_RE);
      if (h && h[1] === 'ALLOCUTIO' && isOpening(lines, i)) {
        anchors.push({ page: p + 1, line: i, kind: 'heading', text: line.trim() });
      }
    });
  });
  return anchors;
}

// --- the scan ------------------------------------------------------------------------------

const popeOf = (text: string): string | null => {
  const m = text.match(POPE_RE);
  if (!m) return null;
  const numeral = m[2]!.toUpperCase();
  const name = m[1]!.toUpperCase().startsWith('L') ? 'LEONIS' : 'PII';
  return ACTA_POPES.find((p) => p.genitive === `${name} ${numeral}`)?.pope ?? null;
};

/** Words of a line with the soft hyphens and the `letter-` line breaks joined. */
const joinBreaks = (lines: readonly string[]): string => lines.join('\n').replace(/­\s*\n\s*/g, '').replace(/([a-z])-\s*\n\s*([a-z])/gi, '$1$2').replace(/\s+/g, ' ').trim();

interface Located { page: number; line: number }

/**
 * Read one act: from `anchor` back to its heading, no earlier than `floor` (the previous
 * anchor), then forward from the heading to the salutation and the opening. Returns the
 * entry, or the defect that stopped the reading.
 */
function readAct(pages: readonly string[], anchor: Anchor, floor: Located | null, opts: { volume: number; year: number; yearTo: number }): { entry?: AssEntry; defect?: AssDefect } {
  const at = (p: number) => pages[p - 1]!.split('\n');
  // 1. The heading: walk back line by line, page by page, to the nearest class heading that is not a running head.
  let heading: Located | null = null;
  if (anchor.kind === 'heading') heading = { page: anchor.page, line: anchor.line };
  else {
    outer: for (let p = anchor.page; p >= 1; p--) {
      const lines = at(p);
      const start = p === anchor.page ? anchor.line - 1 : lines.length - 1;
      const stop = floor !== null && floor.page === p ? floor.line + 1 : 0;
      for (let i = start; i >= stop; i--) {
        if (isOpening(lines, i)) { heading = { page: p, line: i }; break outer; }
      }
      if (floor !== null && floor.page === p) break;
    }
  }
  const anchorLines = at(anchor.page).slice(anchor.line, anchor.line + 2).map((l) => l.trim());
  if (heading === null) return { defect: { page: anchor.page, reason: 'no-heading', lines: anchorLines } };

  // 2. The heading block: from the heading line to the first blank line (or the salutation).
  const hl = at(heading.page);
  const block: string[] = [];
  let i = heading.line;
  for (; i < hl.length && hl[i]!.trim() !== '' && !SALUTATION_RE.test(hl[i]!); i++) block.push(hl[i]!.trim());
  const headingText = block.join(' / ');
  const h = hl[heading.line]!.match(HEADING_RE)!;
  const category = normaliseHeading(h[2] ? `${h[1]} in forma Brevis` : h[1]!);
  // 3. The salutation, within the next six lines after the block; then the address lines; then the opening line.
  let salutation: string | null = null;
  let j = i;
  for (let k = i; k < Math.min(hl.length, i + 6); k++) {
    if (SALUTATION_RE.test(hl[k]!)) { salutation = hl[k]!.trim(); j = k + 1; break; }
  }
  while (j < hl.length && (hl[j]!.trim() === '' || ADDRESS_RE.test(hl[j]!))) j++;
  // The opening: the first eight words from the opening line onward (line breaks joined), stopping at the anchor line on the same page.
  const bodyEnd = anchor.page === heading.page && anchor.kind === 'dateline' ? anchor.line : hl.length;
  const openingLines = hl.slice(j, Math.min(bodyEnd, j + 3));
  const words = joinBreaks(openingLines).split(' ').filter((w) => w !== '');
  if (words.length < 3) return { defect: { page: heading.page, reason: 'no-opening', lines: [headingText, ...(salutation ? [salutation] : []), ...openingLines.map((l) => l.trim())] } };
  const opening = words.slice(0, 8).join(' ');
  // 4. The pope, from the block, the salutation or the description.
  const pope = popeOf([headingText, salutation ?? ''].join(' '));
  if (pope === null) return { defect: { page: heading.page, reason: 'unknown-pope', lines: [headingText, ...(salutation ? [salutation] : [])] } };
  // 5. The date: the dateline, or the allocution's own heading, else the unreadable marker.
  const span = { from: opts.year, to: opts.yearTo };
  let date: string | null;
  let dateline: string | null = null;
  if (anchor.kind === 'dateline') {
    dateline = joinBreaks(at(anchor.page).slice(anchor.line, anchor.line + 3));
    date = assDate(dateline, span);
    if (date === null) return { defect: { page: heading.page, reason: 'no-date', lines: [headingText, dateline] } };
  } else {
    const hd = headingText.match(HEADING_DATE_RE);
    const iso = hd ? assDate(`Datum Romae die ${hd[1]} ${hd[2]} anno ${hd[3]}`, span) : null;
    date = iso ?? '????-??-??';
  }
  // 6. The page: the PDF page, which the running header must not contradict.
  const header = headerOf(pages[heading.page - 1]!);
  if (!headerAgrees(header, heading.page)) return { defect: { page: heading.page, reason: 'header-mismatch', lines: [header, headingText] } };
  const description = block.slice(0, 1).map((l) => l.replace(HEADING_RE, '$3').trim()).concat(block.slice(1)).join(' ').replace(/\s+/g, ' ').trim();
  return {
    entry: {
      series: 'ASS', volume: opts.volume, year: opts.year, page: heading.page, pope, category, date,
      incipit: null, quoted: false, toponym: null, description, raw: headingText,
      opening, anchor: anchor.kind,
      evidence: { heading: headingText, salutation, opening: joinBreaks(openingLines.slice(0, 1)), dateline, header },
    },
  };
}

/**
 * Every papal act of a volume body, in page order: each anchor (findAnchors) on or before
 * `lastBodyPage` read back to its heading, no earlier than the previous anchor. Entries and
 * defects are disjoint: an anchor yields one or the other.
 */
export function scanVolume(pages: readonly string[], opts: { volume: number; year: number; yearTo: number; lastBodyPage: number }): { entries: AssEntry[]; defects: AssDefect[] } {
  const entries: AssEntry[] = [];
  const defects: AssDefect[] = [];
  const anchors = findAnchors(pages).filter((a) => a.page <= opts.lastBodyPage);
  let previous: Located | null = null;
  for (const a of anchors) {
    const r = readAct(pages, a, previous, opts);
    if (r.entry) entries.push(r.entry); else defects.push(r.defect!);
    previous = { page: a.page, line: a.line };
  }
  return { entries, defects };
}
```

The `HEADING_RE` capture groups: `$1` the class, `$2` the ` in forma Brevis` tail, `$3` the rest of the line. The `description` takes the heading line's rest (`$3`) plus the block's further lines. The `ALLOCUTIO` heading whose next lines name the pope: the block runs to the first blank line, so `SANCTISSIMI DOMINI NOSTRI LEONIS XIII / AD CATHOLICARUM …` joins the description.

- [ ] **Step 8: Run the tests until they pass**

Run: `npx vitest run tools/test/acta-ass.test.ts`
Expected: PASS. Where a case fails, fix the regex named in the failure and keep the test as the specification — except where the test itself mis-transcribes the sample (check against the quoted volume line); never loosen `DATUM_RE` or `PONTIFICATUS_RE` to admit a dicastery dateline.

Run: `npx tsc --noEmit`
Expected: `ass.ts` compiles once `summa.ts` exists (Task 3); until then, temporarily type `summa: SummaCheck` as `summa: unknown` and restore it in Task 3.

- [ ] **Step 9: Commit**

```bash
git add tools/src/acta/ass.ts tools/src/acta/index.ts tools/src/acta/recover.ts tools/test/acta-ass.test.ts
git commit -m "Scan an ASS volume body for its papal acts: dateline and heading anchors, walk-back to the heading, opening and date read from quoted lines (ass volumes spec §3)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: The summa — locate, parse, check

**Files:**
- Create: `tools/src/acta/summa.ts`
- Test: `tools/test/acta-summa.test.ts`

**Interfaces:**
- Produces (exported from `summa.ts`):
  - `locateSumma(pages: readonly string[]): { from: number; to: number } | null` (1-based, inclusive)
  - `interface SummaRow { description: string; page: number; raw: string }`
  - `parseSummaPapalPart(text: string): { rows: SummaRow[]; heading: string | null; end: string | null }`
  - `interface SummaCheck { pages: { from: number; to: number } | null; rows: SummaRow[]; claimed: number[]; unclaimed: SummaRow[]; omitted: number[] }`
  - `checkSumma(entries: readonly { page: number }[], summa: { pages: { from: number; to: number } | null; rows: SummaRow[] }): SummaCheck`
  - `normalisePage(token: string): number | null`

- [ ] **Step 1: Write the failing tests**

Create `tools/test/acta-summa.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { checkSumma, locateSumma, normalisePage, parseSummaPapalPart } from '../src/acta/summa.js';

describe('normalisePage (spec §4): the OCR of a page number in the summa', () => {
  it('reads the digits and the letters the OCR puts for them: ig3 → 193, 3oo → 300, 3oi → 301, i3o → 130, 6 19 → 619, 5 80 → 580', () => {
    for (const [tok, n] of [['427', 427], ['ig3', 193], ['3oo', 300], ['3oi', 301], ['i3o', 130], ['6 19', 619], ['5 80', 580], ['8oo', 800]] as const) {
      expect(normalisePage(tok), tok).toBe(n);
    }
  });
  it('rejects a token that is not a page: a word, an empty string, 0', () => {
    expect(normalisePage('pag')).toBeNull();
    expect(normalisePage('')).toBeNull();
    expect(normalisePage('0')).toBeNull();
  });
});

const SUMMA_41 = [
  '                     INDEX ANALYTICUS',
  '',
  '                             ACTA ROMANI PONTIFICIS',
  '',
  'Constitutio Apostolica de Romana Curia pag. 427',
  'Lex propria sacrae Romanae Rotae et Signaturae Apostolicae . » 440',
  'Ordo servandus in sacris Congregationibus, Tribunalibus, Officiis',
  '        Romanae Curiae 462 et 683',
  'Constitutio Apostolica de promulgatione legum et evulgatione acto­',
  '        rum S. Sedis » 6 19',
  'Epistola qua Pius X laudat Archiepiscopum Quebecen, ob promotam',
  '        actionem socialem catholicam » ig3',
  'Allocutio Pii PP. X die 18 Dec. 1907 habita ad novos Cardinales. » 31',
  '',
  '                                     EX SECRETARIA BREVIUM',
  '',
  'Pontifex laudat Collegium Americanum Lovanii in Belgio occasione',
  '        quinquagesimi anni ab erectione > 37',
].join('\n');

describe('parseSummaPapalPart (spec §4): the papal part, loosely', () => {
  it('reads one row per page-ended run, two rows for `462 et 683`, and stops at the first dicastery heading', () => {
    const { rows, heading, end } = parseSummaPapalPart(SUMMA_41);
    expect(heading).toBe('ACTA ROMANI PONTIFICIS');
    expect(end).toBe('EX SECRETARIA BREVIUM');
    expect(rows.map((r) => r.page)).toEqual([427, 440, 462, 683, 619, 193, 31]);
    expect(rows[2]!.description).toBe('Ordo servandus in sacris Congregationibus, Tribunalibus, Officiis Romanae Curiae');
    expect(rows[4]!.description).toBe('Constitutio Apostolica de promulgatione legum et evulgatione actorum S. Sedis');
    expect(rows[4]!.raw).toBe('Constitutio Apostolica de promulgatione legum et evulgatione acto­ / rum S. Sedis » 6 19');
  });
  it('reads the 1879 and 1900 headings (`LITTERAE ET ALLOCUTIONES APOSTOLICAE`, `LITTERAE ET ACTA R. PONTIFICIS`) and an interleaved column as rows all the same', () => {
    const text = [
      '647 SUMMA ACTOKTJM QUAE IN HOC VOLUMINE XII CONTINENTUR',
      'LITTERAE ET ALLOCUTIONES Motu Proprio SS. D. N. Leonis',
      'APOSTOLICAE XIII, quo deputatio trium Emorum',
      'Allocutio SSmi D. N. Leonis XIII ad Cardinalium constituitur . . 337',
      'ephemeridum repraesentantes . . 13',
      'EX ACTIS CONSISTORIALIBUS',
      'De Consistorio habito die 19 Septembris 1879 . . 147',
    ].join('\n');
    const { rows, heading } = parseSummaPapalPart(text);
    expect(heading).toBe('LITTERAE ET ALLOCUTIONES');
    expect(rows.map((r) => r.page)).toEqual([337, 13]);
  });
  it('returns no rows and a null heading when the text has no papal part', () => {
    expect(parseSummaPapalPart('INDEX GENERALIS CONCLUSIONUM\nAbbas . . 12')).toEqual({ rows: [], heading: null, end: null });
  });
});

describe('locateSumma: the summa pages, from the volume\'s midpoint', () => {
  it('finds the first page headed SUMMA ACTORUM or INDEX ANALYTICUS and ends before the next index heading', () => {
    const pages = ['body', 'body', 'body', '   647 SUMMA ACTORUM QUAE IN HOC VOLUMINE XII CONTINENTUR', '648 SUMMA. ACTORUM. more', '  INDEX GENERALIS CONCLUSIONUM', 'more'];
    expect(locateSumma(pages)).toEqual({ from: 4, to: 5 });
  });
  it('admits the OCR\'s ACTOKTJM and AGTORUM, and runs to the volume\'s end when no index follows, dropping blank pages', () => {
    expect(locateSumma(['b', 'b', 'b', '  SUMMA ACTOKTJM', 'x', '', ''])).toEqual({ from: 4, to: 5 });
    expect(locateSumma(['b', 'b', 'b', '  SUMMA AGTORUM', 'x'])).toEqual({ from: 4, to: 5 });
  });
  it('returns null when no summa is found', () => {
    expect(locateSumma(['b', 'b', 'b', 'b'])).toBeNull();
  });
});

describe('checkSumma (spec §4): every summa page must be a scanned act\'s page, and every act should sit on a summa page', () => {
  it('splits the rows into claimed and unclaimed and lists the acts the summa omits', () => {
    const rows = [{ description: 'a', page: 427, raw: 'a 427' }, { description: 'b', page: 619, raw: 'b 619' }, { description: 'c', page: 193, raw: 'c 193' }];
    const check = checkSumma([{ page: 427 }, { page: 619 }, { page: 21 }], { pages: { from: 799, to: 809 }, rows });
    expect(check).toEqual({ pages: { from: 799, to: 809 }, rows, claimed: [427, 619], unclaimed: [rows[2]], omitted: [21] });
  });
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npx vitest run tools/test/acta-summa.test.ts`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `summa.ts`**

```ts
/**
 * The *Summa actorum* (ASS 41: *Index analyticus*) that ends every ASS volume, read as the
 * check on the scanner's completeness (ass volumes spec §4): its papal part lists the
 * pope's acts by description and page -- no incipit, no date -- in two columns the OCR
 * interleaves. It is parsed loosely: a row is any run of lines ending in a page number,
 * and its description is kept as printed, interleaving and all, for the report; the pages
 * are what the check reads. Every summa page must be the page of one scanned act
 * (`claimed`); a summa page no act sits on is an act the scan missed or paged wrongly
 * (`unclaimed`, resolved by a curated reading, ASS_READINGS); a scanned act on no summa
 * page is listed (`omitted`) -- the summa lists selectively, so it is a finding, not a defect.
 */
export interface SummaRow {
  /** The row's text, line breaks and leaders removed, page removed. */
  description: string;
  page: number;
  /** The lines as extracted, joined by ` / `. */
  raw: string;
}

export interface SummaCheck {
  /** The summa's pages in the volume (1-based, inclusive), or null when none was located. */
  pages: { from: number; to: number } | null;
  rows: SummaRow[];
  /** Summa pages a scanned act sits on. */
  claimed: number[];
  /** Summa rows no scanned act sits on. */
  unclaimed: SummaRow[];
  /** Pages of scanned acts the summa does not list. */
  omitted: number[];
}

const SUMMA_HEAD_RE = /^[\s\S]{0,60}?(SUMMA\s+A[CGO]TO[RKT]?[UTJ]*M|INDEX\s+ANALYTICUS)/;
const NEXT_INDEX_RE = /^[\s\S]{0,60}?(INDEX\s+GENERALIS|INDEX\s+ALPHABETICUS|INDEX\s+RERUM|INDEX\s+NOMINUM)/;

/**
 * The summa's pages: the first page from the volume's midpoint headed SUMMA ACTORUM (the
 * OCR's `ACTOKTJM`, `AGTORUM` admitted) or INDEX ANALYTICUS, to the page before the next
 * index heading, or the volume's end with trailing blank pages dropped.
 */
export function locateSumma(pages: readonly string[]): { from: number; to: number } | null {
  const n = pages.length;
  let from = -1;
  for (let i = Math.floor(n / 2); i < n; i++) if (SUMMA_HEAD_RE.test(pages[i]!)) { from = i; break; }
  if (from < 0) return null;
  let to = n;
  for (let i = from + 1; i < n; i++) if (NEXT_INDEX_RE.test(pages[i]!)) { to = i; break; }
  while (to - 1 > from && pages[to - 1]!.trim() === '') to--;
  return { from: from + 1, to };
}

/** The OCR's letters for digits in a page number: `ig3` → 193, `3oo` → 300, `3oi` → 301, `i3o` → 130. Spaces inside a number are dropped (`6 19`). */
const DIGIT_OCR: Readonly<Record<string, string>> = { o: '0', O: '0', i: '1', I: '1', l: '1', S: '5', s: '5', g: '9', B: '8' };
export function normalisePage(token: string): number | null {
  const digits = token.replace(/\s+/g, '').split('').map((c) => DIGIT_OCR[c] ?? c).join('');
  if (!/^\d{1,4}$/.test(digits)) return null;
  const n = Number(digits);
  return n >= 1 ? n : null;
}

const PAPAL_HEAD_RE = /^\s*(?:\d+\s+)?(LITTERAE\s+ET\s+A(?:LLOCUTIONES|CTA)(?:\s+R\.\s*PONTIFICIS|\s+APOSTOLICAE)?|ACTA\s+ROMANI\s+PONTIFICIS)/;
const DICASTERY_RE = /^\s*(EX\s+(?:S\.|SS\.|SACRA|SECRETARIA|ACTIS|AEDIBUS|SUPREMA|CANCELLARIA|DATARIA)\b.*)$/;
/** A row's end: a page token after a leader, a sign or a space, possibly `N et M`, possibly a trailing stop. */
const ROW_END_RE = /^(.*?)(?:\s*(?:pag\.|»|>|\*|·|\.{2,}|\s))\s*(\d[\dOoiIlSsgB]{0,3}(?:\s\d{1,2})?)(?:\s+et\s+(\d[\dOoiIlSsgB]{0,3}))?\s*\.?\s*$/;

/**
 * The rows of the papal part: from the papal heading (or the summa's first line, when the
 * heading is interleaved into a row, as ASS 12's `LITTERAE ET ALLOCUTIONES Motu Proprio …`)
 * to the first dicastery heading. A row accumulates lines until one ends in a page token;
 * `N et M` yields two rows of one description. Lines that are only a running header
 * (`8oo Index analyticus`, `SUMMA ACTORUM.`) are skipped.
 */
export function parseSummaPapalPart(text: string): { rows: SummaRow[]; heading: string | null; end: string | null } {
  const lines = text.split('\n');
  let start = -1;
  let heading: string | null = null;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i]!.match(PAPAL_HEAD_RE);
    if (m) { start = i; heading = m[1]!.replace(/\s+/g, ' ').trim(); break; }
  }
  if (start < 0) return { rows: [], heading: null, end: null };
  const rows: SummaRow[] = [];
  let acc: string[] = [];
  let end: string | null = null;
  for (let i = start; i < lines.length; i++) {
    const line = lines[i]!;
    const d = line.match(DICASTERY_RE);
    if (d) { end = d[1]!.replace(/\s+/g, ' ').trim(); break; }
    if (line.trim() === '' || /^\s*(?:\d[\dOoiIl]{0,3}\s+)?(?:Index analyticus|SUMMA\.?\s+A[CGO]TO[RKT]?[UTJ]*M\.?)\s*(?:\d[\dOoiIl]{0,3})?\s*$/.test(line)) continue;
    const content = i === start ? line.replace(PAPAL_HEAD_RE, '').trim() : line;
    if (content.trim() === '') continue;
    acc.push(content.trim());
    const m = content.match(ROW_END_RE);
    if (!m) continue;
    const page = normalisePage(m[2]!);
    const raw = acc.join(' / ');
    const description = acc.slice(0, -1).concat(m[1]!.trim()).join(' ').replace(/­\s*/g, '').replace(/\s*[.»>*·]+\s*$/, '').replace(/\s+/g, ' ').trim();
    acc = [];
    if (page === null) continue;
    rows.push({ description, page, raw });
    const second = m[3] ? normalisePage(m[3]) : null;
    if (second !== null) rows.push({ description, page: second, raw });
  }
  return { rows, heading, end };
}

export function checkSumma(entries: readonly { page: number }[], summa: { pages: { from: number; to: number } | null; rows: SummaRow[] }): SummaCheck {
  const actPages = new Set(entries.map((e) => e.page));
  const rowPages = new Set(summa.rows.map((r) => r.page));
  return {
    pages: summa.pages,
    rows: summa.rows,
    claimed: [...new Set(summa.rows.filter((r) => actPages.has(r.page)).map((r) => r.page))],
    unclaimed: summa.rows.filter((r) => !actPages.has(r.page)),
    omitted: [...new Set(entries.filter((e) => !rowPages.has(e.page)).map((e) => e.page))],
  };
}
```

Note on the second test: `LITTERAE ET ALLOCUTIONES Motu Proprio SS. D. N. Leonis` — `PAPAL_HEAD_RE` matches `LITTERAE ET ALLOCUTIONES` and the rest of the line starts the first row; the next line `APOSTOLICAE XIII, quo …` continues it, and the row closes on `… constituitur . . 337`. The second row `ephemeridum repraesentantes . . 13` is the interleaved column's tail — its description is garbage, its page (13) is right, which is what the check reads.

- [ ] **Step 4: Run the tests**

Run: `npx vitest run tools/test/acta-summa.test.ts tools/test/acta-ass.test.ts && npx tsc --noEmit`
Expected: PASS; restore `summa: SummaCheck` in `ass.ts` if Task 2 left it as `unknown`.

- [ ] **Step 5: Commit**

```bash
git add tools/src/acta/summa.ts tools/src/acta/ass.ts tools/test/acta-summa.test.ts
git commit -m "Read the Summa actorum of an ASS volume as the scanner's completeness check: locate, parse the papal part loosely, claim its pages (ass volumes spec §4)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: The scan tool, the five fixtures, and the first curation round

**Files:**
- Create: `tools/scan-ass.ts`
- Create: `tools/fixtures/acta/ass-{01-1865,12-1879,23-1890,33-1900,41-1908}.summa.txt` and `.entries.json`
- Modify: `tools/src/acta/popes.ts` (Pius IX, Leo XIII — needed by the scanner's `popeOf` before the join)
- Modify: `tools/src/acta/curation.ts` (`ASS_READINGS`, `AssReading`)
- Modify: `tools/fixtures/acta/README.md` (the table of Task 1 Step 4)
- Modify: `package.json` (`"scan-ass": "tsx tools/scan-ass.ts"`)
- Test: `tools/test/acta-popes.test.ts`, `tools/test/acta-ass.test.ts` (fixture determinism)

**Interfaces:**
- Consumes: `scanVolume`, `findAnchors` (Task 2); `locateSumma`, `parseSummaPapalPart`, `checkSumma` (Task 3).
- Produces: the fixtures the join reads (Task 5); `ASS_READINGS: Readonly<Record<string, AssReading>>` keyed `ASS:{volume}:{page}` with `interface AssReading { pope: string; category: string; date: string; opening: string; description: string; evidence: string }`; the popes rows `{ genitive: 'PII IX', pope: 'Pius IX', issuerId: 'rp:pius-ix', began: '1846-06-16' }` and `{ genitive: 'LEONIS XIII', pope: 'Leo XIII', issuerId: 'rp:leo-xiii', began: '1878-02-20' }`.

- [ ] **Step 1: Add the two popes, with a failing test first**

In `tools/test/acta-popes.test.ts`, add inside the first `describe`:

```ts
  it('names the popes of the Acta Sanctae Sedis (ass volumes spec §2): Pius IX and Leo XIII, before Pius X', () => {
    expect(ACTA_POPES.find((p) => p.genitive === 'PII IX')).toEqual({ genitive: 'PII IX', pope: 'Pius IX', issuerId: 'rp:pius-ix', began: '1846-06-16' });
    expect(ACTA_POPES.find((p) => p.genitive === 'LEONIS XIII')).toEqual({ genitive: 'LEONIS XIII', pope: 'Leo XIII', issuerId: 'rp:leo-xiii', began: '1878-02-20' });
    const i = ACTA_POPES.findIndex((p) => p.genitive === 'PII X');
    expect(ACTA_POPES.slice(0, i).map((p) => p.pope)).toEqual(['Pius IX', 'Leo XIII']);
  });
```

Run: `npx vitest run tools/test/acta-popes.test.ts` — Expected: FAIL.

In `tools/src/acta/popes.ts`, before the `PII X` row, insert:

```ts
  // The *Acta Sanctae Sedis* (ass volumes spec §2) print no pope part: the scanner (ass.ts)
  // reads the pope from an act's heading (`SANCTISSIMI DOMINI NOSTRI LEONIS XIII`, ASS 12
  // (1879) 13; `SS. D. N. Pii div. prov. PP. X`, ASS 41 (1908) 3) or its salutation (`LEO
  // PP. XIII`), keyed here by the same genitive form. Pius IX elected 16 June 1846; the ASS
  // begin in 1865. Leo XIII elected 20 February 1878.
  { genitive: 'PII IX', pope: 'Pius IX', issuerId: 'rp:pius-ix', began: '1846-06-16' },
  { genitive: 'LEONIS XIII', pope: 'Leo XIII', issuerId: 'rp:leo-xiii', began: '1878-02-20' },
```

Run: `npx vitest run tools/test/acta-popes.test.ts` — Expected: PASS, except possibly `is printed in the fixtures: every row is a part heading of some source` (line 42), which requires every row to be printed by a fixture: extend that test so that a row whose `pope` is `Pius IX` or `Leo XIII` is satisfied by an `.entries.json` fixture whose entries carry that `pope` — add, in that test, before the assertion over the rows: read every `ACTA_SOURCES` row with `kind === 'ass'` (Task 5 adds them; until then the two rows are exempted with a comment naming Task 5 — and the exemption removed in Task 5 Step 9).

- [ ] **Step 2: Add the readings table**

In `tools/src/acta/curation.ts`, after `ACTA_PAGE_READINGS` (its closing `};`), add:

```ts
export interface AssReading {
  /** The pope as popes.ts labels him ('Leo XIII'). */
  pope: string;
  /** The class heading as the volume prints it, normalised ('EPISTOLA ENCYCLICA'). */
  category: string;
  /** ISO date from the act's own dating formula, or `????-??-??` when the act prints none. */
  date: string;
  /** The first eight words after the salutation, as printed. */
  opening: string;
  description: string;
  /** The heading, salutation, opening and dateline as the volume prints them, and where they were read (the store text, page and lines). */
  evidence: string;
}

/**
 * The papal acts of the ASS the scanner (ass.ts) missed or misread, read by hand in the
 * store text (ass volumes spec §6): keyed `ASS:{volume}:{page}`. A row is applied by the
 * loader (join.ts) as an entry with `anchor: 'reading'` -- added where the scan has no entry
 * at the page, replacing the scanned entry where it has one -- and is stale (a hard error)
 * unless the page is one of the scan's defects, one of the summa's unclaimed rows, or a
 * scanned entry's page: a reading must answer a finding. Every row names why the scan
 * missed the act.
 */
export const ASS_READINGS: Readonly<Record<string, AssReading>> = {
};
```

- [ ] **Step 3: Write the CLI**

Create `tools/scan-ass.ts`:

```ts
/**
 * Write the two fixtures of an ASS volume (ass volumes spec §2-§4, phase 2c): read the
 * whole-volume text from the local store (tools/fetch-acta.sh ass <vol>), locate the
 * *Summa actorum* and copy its pages to tools/fixtures/acta/ass-{vol}-{year}.summa.txt,
 * scan the body before it for the papal acts (tools/src/acta/ass.ts) and check them
 * against the summa's papal part (tools/src/acta/summa.ts), and write
 * tools/fixtures/acta/ass-{vol}-{year}.entries.json with every entry's evidence, every
 * defect's lines and the check. Deterministic for a given text; re-run after the scanner
 * changes. Prints the counts for the fixtures README row.
 *
 * Usage: npx tsx tools/scan-ass.ts ass-33
 *        npx tsx tools/scan-ass.ts sample        # the five volumes of phase 2c-i
 *        npx tsx tools/scan-ass.ts 1-41           # a range of volumes
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { scanVolume, type AssScan } from './src/acta/ass.js';
import { checkSumma, locateSumma, parseSummaPapalPart } from './src/acta/summa.js';
import { ACTA_SOURCES, actaSource, type ActaSource } from './src/acta/join.js';

const STORE = `${process.env['ACTA_SOURCES'] ?? `${homedir()}/development/sources/ASS`}/txt`;
const textPath = (s: ActaSource) => `${STORE}/ass-${String(s.volume).padStart(2, '0')}-${s.year}.txt`;

const arg = process.argv[2];
if (!arg) throw new Error('usage: scan-ass.ts <ass-N | sample | from-to>');
const range = arg.match(/^(\d{1,2})-(\d{1,2})$/);
const sources: ActaSource[] = arg === 'sample'
  ? ACTA_SOURCES.filter((s) => s.kind === 'ass')
  : range
    ? ACTA_SOURCES.filter((s) => s.kind === 'ass' && s.volume >= Number(range[1]) && s.volume <= Number(range[2]))
    : [actaSource(arg) ?? (() => { throw new Error(`unknown source ${arg}`); })()];

const pad2 = (n: number) => String(n).padStart(2, '0');
const now = new Date();
const today = `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;

for (const s of sources) {
  if (s.kind !== 'ass') throw new Error(`${s.key} is not an ASS source`);
  const text = textPath(s);
  if (!existsSync(text)) { console.error(`${s.key}: no volume text at ${text} (run tools/fetch-acta.sh ass ${s.volume})`); continue; }
  const pages = readFileSync(text, 'utf8').split('\f');
  const summaPages = locateSumma(pages);
  const lastBodyPage = summaPages ? summaPages.from - 1 : pages.length;
  const summaText = summaPages ? pages.slice(summaPages.from - 1, summaPages.to).join('\f') + '\n' : '';
  const { entries, defects } = scanVolume(pages, { volume: s.volume, year: s.year, yearTo: s.yearTo ?? s.year, lastBodyPage });
  const parsed = parseSummaPapalPart(summaText);
  const summa = checkSumma(entries, { pages: summaPages, rows: parsed.rows });
  const scan: AssScan = {
    source: s.key, generated: today, text: `${text.replace(homedir(), '~')} (${pages.length} pages)`,
    volume: s.volume, year: s.year, pages: pages.length, entries, defects, summa,
  };
  writeFileSync(s.summaFile!, summaText);
  writeFileSync(s.file, JSON.stringify(scan, null, 2) + '\n');
  const byReason = (r: string) => defects.filter((d) => d.reason === r).length;
  console.log(`${s.key}: ${pages.length} pages; summa ${summaPages ? `${summaPages.from}-${summaPages.to} (${parsed.heading ?? 'no papal heading'} … ${parsed.end ?? 'no dicastery heading'})` : 'NOT FOUND'}; `
    + `${entries.length} acts scanned (${entries.filter((e) => e.anchor === 'heading').length} from a heading), ${defects.length} defects `
    + `(no-heading ${byReason('no-heading')}, no-date ${byReason('no-date')}, no-opening ${byReason('no-opening')}, header-mismatch ${byReason('header-mismatch')}, unknown-pope ${byReason('unknown-pope')}); `
    + `summa rows ${parsed.rows.length}: claimed ${summa.claimed.length}, unclaimed ${summa.unclaimed.length}; acts the summa omits ${summa.omitted.length}`);
  for (const d of defects) console.log(`  defect p.${d.page} ${d.reason}: ${d.lines.join(' / ').slice(0, 160)}`);
  for (const r of summa.unclaimed) console.log(`  unclaimed p.${r.page}: ${r.description.slice(0, 120)}`);
}
```

This needs the `ass` sources in `ACTA_SOURCES` (Task 5 Step 2) — do Task 5 Steps 1–2 now (the type widening and the five rows), then return here; Task 5's remaining steps follow. Add to `package.json` scripts: `"scan-ass": "tsx tools/scan-ass.ts",` after `"recover"`.

- [ ] **Step 4: Run the scan over the sample and read what it prints**

Run: `npm run scan-ass -- sample`
Expected: five lines of counts, then the defects and unclaimed rows of each. Record every number.

Then, per volume, open the store text at each defect's page and each unclaimed row's page (`sed -n` on the `\f`-split page: `awk -v p=273 'BEGIN{RS="\f"} NR==p' ~/development/sources/ASS/txt/ass-33-1900.txt`) and classify each finding:

1. **The scanner's rule is wrong or incomplete in a way the sample shows more than once** (a heading spelling the list lacks and two volumes print, e.g. `LITTERAE APOSTOLICAE` set as `LITTERAE` / `APOSTOLICAE` on two lines; a salutation form; a dateline form) → fix the rule in `ass.ts`, add a unit test quoting the volume line, re-run the scan.
2. **A single act the rules do not reach** (a Kalends date, an act whose heading the OCR broke, a page whose header disagrees) → an `ASS_READINGS` row, quoting the lines and naming the cause.
3. **The summa cites a page that opens no papal act** (a dicastery act listed under the papal part; a page the OCR misnumbered) → left unclaimed and named in the report's reading (Task 7); no row.
4. **A scanned act the summa omits** → a finding, no action.

Rules 1 and 2 are the plan's; which of the two applies is the measurement's — count before deciding, as the spec §3 says. Keep a scratch note of every decision (page, volume, classification, the quoted line) for Task 7's reading and the commit message.

- [ ] **Step 5: Add the fixture-determinism test**

Append to `tools/test/acta-ass.test.ts`:

```ts
import { existsSync, readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { ACTA_SOURCES } from '../src/acta/join.js';
import { checkSumma, locateSumma, parseSummaPapalPart } from '../src/acta/summa.js';

describe('the entries fixtures are what the scanner writes from the store text (skipped when the store is absent)', () => {
  const store = `${process.env['ACTA_SOURCES'] ?? `${homedir()}/development/sources/ASS`}/txt`;
  for (const s of ACTA_SOURCES.filter((x) => x.kind === 'ass')) {
    const text = `${store}/ass-${String(s.volume).padStart(2, '0')}-${s.year}.txt`;
    it.skipIf(!existsSync(text))(`${s.key}: re-scanning the store text gives the fixture's entries, defects and summa check`, () => {
      const pages = readFileSync(text, 'utf8').split('\f');
      const fixture = JSON.parse(readFileSync(s.file, 'utf8'));
      const summaPages = locateSumma(pages);
      const lastBodyPage = summaPages ? summaPages.from - 1 : pages.length;
      const { entries, defects } = scanVolume(pages, { volume: s.volume, year: s.year, yearTo: s.yearTo ?? s.year, lastBodyPage });
      const summaText = summaPages ? pages.slice(summaPages.from - 1, summaPages.to).join('\f') + '\n' : '';
      expect(readFileSync(s.summaFile!, 'utf8')).toBe(summaText);
      expect(entries).toEqual(fixture.entries);
      expect(defects).toEqual(fixture.defects);
      expect(checkSumma(entries, { pages: summaPages, rows: parseSummaPapalPart(summaText).rows })).toEqual(fixture.summa);
    });
  }
});

describe('the entries fixtures are well-formed (runs offline)', () => {
  for (const s of ACTA_SOURCES.filter((x) => x.kind === 'ass')) {
    it(`${s.key}: every entry carries series ASS, the source's volume and year, a page within the volume, a pope the table names, a date or the unreadable marker, an opening of three to eight words and its five evidence lines`, () => {
      const fixture = JSON.parse(readFileSync(s.file, 'utf8'));
      expect(fixture.source).toBe(s.key);
      expect(fixture.entries.length).toBeGreaterThan(0);
      for (const e of fixture.entries) {
        expect(e.series).toBe('ASS');
        expect(e.volume).toBe(s.volume);
        expect(e.year).toBe(s.year);
        expect(e.page).toBeGreaterThanOrEqual(1);
        expect(e.page).toBeLessThanOrEqual(fixture.pages);
        expect(['Pius IX', 'Leo XIII', 'Pius X']).toContain(e.pope);
        expect(e.date).toMatch(/^(\d{4}-\d{2}-\d{2}|\?\?\?\?-\?\?-\?\?)$/);
        expect(e.incipit).toBeNull();
        expect(e.opening.split(' ').length).toBeGreaterThanOrEqual(3);
        expect(e.opening.split(' ').length).toBeLessThanOrEqual(8);
        expect(['dateline', 'heading']).toContain(e.anchor);
        expect(Object.keys(e.evidence).sort()).toEqual(['dateline', 'header', 'heading', 'opening', 'salutation']);
      }
      // One page opens one act -- except the pages two short letters share, which the join's shared-page check reports.
      const pages = fixture.entries.map((e: { page: number }) => e.page);
      expect(new Set(pages).size).toBeGreaterThanOrEqual(pages.length - 6);
    });
  }
});
```

(Move the two `import` lines to the top of the file with the others.)

Run: `npx vitest run tools/test/acta-ass.test.ts`
Expected: PASS (the determinism tests run, since the store is present on this machine).

- [ ] **Step 6: Fill the README table**

In the table added in Task 1 Step 4, replace every `n`, `N`, `a–b` and `2026-09-2D` with the scan's printed counts, the store's page counts and today's date. Under the table add a paragraph listing, per volume, the summa's papal heading and dicastery end as the tool printed them (`ASS 41: ACTA ROMANI PONTIFICIS … EX SECRETARIA BREVIUM`), and the count of `ASS_READINGS` rows keyed to it.

- [ ] **Step 7: Run the whole suite**

Run: `npm run check`
Expected: PASS — except tests Task 5 changes (the join's pins; `acta-categories.test.ts` *is printed in the fixtures*; `writes a reference only … in the AAS`), which are expected to fail until Task 5 completes; list the failing test names in the commit message's body so the next task's reviewer sees them, or complete Task 5 before committing. Prefer the latter: **commit Task 4 and Task 5 together only if Task 5 is finished in the same session; otherwise commit Task 4 with `npm test -- tools/test/acta-ass.test.ts tools/test/acta-summa.test.ts tools/test/acta-popes.test.ts` passing and name the pending failures.**

- [ ] **Step 8: Commit**

```bash
git add tools/scan-ass.ts package.json tools/src/acta/popes.ts tools/src/acta/curation.ts tools/src/acta/ass.ts tools/test/acta-ass.test.ts tools/test/acta-popes.test.ts tools/fixtures/acta/ass-*.summa.txt tools/fixtures/acta/ass-*.entries.json tools/fixtures/acta/README.md
git commit -m "Scan the five sample volumes of the ASS into their entries and summa fixtures; the popes of the ASS; the first curated readings (phase 2c-i)

<one line per volume: acts scanned, defects, summa claimed/unclaimed; one line per rule changed in the first round and why; one line per reading>

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 5: The join reads the ASS

**Files:**
- Modify: `tools/src/acta/join.ts:25-37` (`ActaSource`), `:69-145` (`ACTA_SOURCES`), `:148-151` (`sourceKeyOf`), `:165-192` (`loadActaIndexes`)
- Modify: `tools/src/acta/curation.ts:1381` (`curationKey`)
- Modify: `tools/src/acta/match.ts:63-71` (`ActaMatch.by`), `:230-330` (`matchActa`)
- Modify: `tools/src/acta/create.ts:157-190` (`HoldReason`), `:389-400` (the unmatched loop)
- Modify: `tools/src/acta/categories.ts` (rows `Epistulae` line 192, `Adhortationes Apostolicae` line 104, a new `Brevia` row)
- Modify: `tools/acta-volumes-report.ts:1215` and its `loadActaIndexes()` call (AAS sources only)
- Test: `tools/test/acta-match.test.ts`, `tools/test/acta-join.test.ts`, `tools/test/acta-categories.test.ts`, `tools/test/acta-popes.test.ts`

**Interfaces:**
- Produces: `ActaSource { kind: 'index' | 'volume' | 'ass'; yearTo?: number; summaFile?: string }`; `ACTA_SOURCES` with five `ass(…)` rows keyed `ass-1`, `ass-12`, `ass-23`, `ass-33`, `ass-41`; `sourceKeyOf(e: { series?: string; volume?: number; year: number; part?: 'I' | 'II' })`; `curationKey(e: { series?: string; volume?: number; year: number; page: number })` returning `ASS:{volume}:{page}` for the ASS; `incipitAgrees(entry, doc): boolean` (exported from `match.ts`); `ActaMatch.by` gains `'opening'`; `HoldReason` gains `'series-not-created'`.

- [ ] **Step 1: The source type and rows**

In `tools/src/acta/join.ts`, change `ActaSource`:

```ts
export interface ActaSource {
  /** The key the reports and tests use: the volume year, with the part for a double volume (`1917-I`); for the ASS, `ass-{volume}` (ASS 2 and 3 are both 1867). */
  key: string;
  year: number;
  /** The last year of a two-year ASS volume (ASS 33: 1901); absent otherwise. `acta.year` stays the first (ass volumes spec, decision 3). */
  yearTo?: number;
  volume: number;
  part?: 'I' | 'II';
  /** An annual index PDF, the index pages of an AAS volume, or an ASS volume's synthesised entries (ass.ts). */
  kind: 'index' | 'volume' | 'ass';
  /** The fixture: the extracted index text, or for an `ass` source the entries JSON the scanner writes. */
  file: string;
  /** For an `ass` source, the summa fixture beside the entries. */
  summaFile?: string;
  url: string | null;
  retrieved: string;
  /** The parser options the fixture needs (index.ts): the columnar layout, and whether bare incipits are printed. Unused by an `ass` source. */
  parse: { columnar: boolean; bareIncipits: boolean; fullLine?: 40 | 55 };
}
```

After the `index` constructor, add:

```ts
const ASS_URL = (file: string) => `https://www.vatican.va/archive/ass/documents/${file}`;
/** An ASS volume (ass volumes spec §2): `file` is the PDF's name as the ASS index page links it. */
const ass = (volume: number, year: number, file: string, retrieved: string, yearTo?: number): ActaSource => ({
  key: `ass-${volume}`, year, ...(yearTo !== undefined ? { yearTo } : {}), volume, kind: 'ass',
  file: `tools/fixtures/acta/ass-${String(volume).padStart(2, '0')}-${year}.entries.json`,
  summaFile: `tools/fixtures/acta/ass-${String(volume).padStart(2, '0')}-${year}.summa.txt`,
  url: ASS_URL(file), retrieved,
  parse: { columnar: false, bareIncipits: false },
});
```

At the head of `ACTA_SOURCES` (before the phase 2b-iii-b comment), add:

```ts
  // Phase 2c-i (ass volumes spec §2): the five sample volumes of the Acta Sanctae Sedis --
  // one a decade, every pope of the series -- read from the entries the scanner writes
  // (ass.ts, tools/scan-ass.ts), not from an index the volumes never print.
  ass(1, 1865, 'ASS-01-1865-66-ocr.pdf', '2026-09-2D', 1866),
  ass(12, 1879, 'ASS-12-1879-ocr.pdf', '2026-09-2D'),
  ass(23, 1890, 'ASS-23-1890-91-ocr.pdf', '2026-09-2D', 1891),
  ass(33, 1900, 'ASS-33-1900-1-ocr.pdf', '2026-09-2D', 1901),
  ass(41, 1908, 'ASS-41-1908-ocr.pdf', '2026-09-2D'),
```

(`2026-09-2D` → the date `tools/fetch-acta.sh ass sample` ran, Task 1 Step 3.) Extend the doc comment above `ACTA_SOURCES` with one sentence: `The five ASS volumes of phase 2c-i (ass volumes spec §2) come first, keyed by volume.`

Change `sourceKeyOf` and `sourceOfEntry`:

```ts
export const sourceKeyOf = (e: { series?: string; volume?: number; year: number; part?: 'I' | 'II' }): string =>
  e.series === 'ASS' ? `ass-${e.volume}` : e.part ? `${e.year}-${e.part}` : `${e.year}`;
/** The source an entry was parsed from (or, for the ASS, scanned into). */
export const sourceOfEntry = (e: { series?: string; volume?: number; year: number; part?: 'I' | 'II' }): ActaSource | undefined => actaSource(sourceKeyOf(e));
```

Run: `npx tsc --noEmit` — Expected: errors only in `scan-ass.ts` if Task 4 is not yet done; otherwise none.

- [ ] **Step 2: Write the failing loader test**

Append to `tools/test/acta-join.test.ts`:

```ts
describe('loadActaIndexes with an ASS source (ass volumes spec §5)', () => {
  it('reads the entries fixture of every ass source into a parse result whose entries are the fixture\'s plus the curated readings, with no pageless entry and the scan\'s defects', () => {
    const sources = ACTA_SOURCES.filter((s) => s.kind === 'ass');
    expect(sources.map((s) => s.key)).toEqual(['ass-1', 'ass-12', 'ass-23', 'ass-33', 'ass-41']);
    const { parsed, missing } = loadActaIndexes(sources);
    expect(missing).toEqual([]);
    for (const s of sources) {
      const r = parsed.get(s.key)!;
      const fixture = JSON.parse(readFileSync(s.file, 'utf8'));
      const readings = Object.keys(ASS_READINGS).filter((k) => k.startsWith(`ASS:${s.volume}:`));
      const replaced = readings.filter((k) => fixture.entries.some((e: { page: number }) => `ASS:${s.volume}:${e.page}` === k)).length;
      expect(r.volume).toBe(s.volume);
      expect(r.year).toBe(s.year);
      expect(r.entries).toHaveLength(fixture.entries.length + readings.length - replaced);
      expect(r.entries.filter((e) => e.anchor === 'reading')).toHaveLength(readings.length);
      expect(r.pageless).toEqual([]);
      expect(r.defects).toHaveLength(fixture.defects.length);
      expect(r.entries.every((e) => e.series === 'ASS' && e.incipit === null && typeof e.opening === 'string')).toBe(true);
      // Sorted by page, the readings in their place.
      expect(r.entries.map((e) => e.page)).toEqual([...r.entries.map((e) => e.page)].sort((a, b) => a - b));
    }
  });
  it('rejects a reading that answers no finding', () => {
    expect(() => applyAssReadings({ ...emptyScan(), entries: [], defects: [], summa: { pages: null, rows: [], claimed: [], unclaimed: [], omitted: [] } }, 33, 1900,
      { 'ASS:33:999': { pope: 'Leo XIII', category: 'LITTERAE', date: '1900-01-01', opening: 'a b c', description: 'd', evidence: 'e' } }))
      .toThrow(/stale reading ASS:33:999/);
  });
});
```

Add the imports the file lacks: `ASS_READINGS` from `../src/acta/curation.js`, `applyAssReadings, emptyScan` from `../src/acta/join.js`, `readFileSync` from `node:fs`.

Run: `npx vitest run tools/test/acta-join.test.ts` — Expected: FAIL (`applyAssReadings` not exported).

- [ ] **Step 3: The loader**

In `join.ts`, import `ASS_READINGS, type AssReading` from `./curation.js` and `type AssEntry, type AssScan` from `./ass.js`. Before `loadActaIndexes`, add:

```ts
/** An empty scan, for tests and for a source whose fixture is absent. */
export const emptyScan = (): Omit<AssScan, 'source' | 'generated' | 'text' | 'volume' | 'year' | 'pages'> => ({ entries: [], defects: [], summa: { pages: null, rows: [], claimed: [], unclaimed: [], omitted: [] } });

/**
 * The curated readings of a volume (ASS_READINGS, ass volumes spec §6) applied to its scan:
 * a row at a page the scan has no entry for is added; a row at a scanned entry's page
 * replaces it; a row whose page is neither a scanned entry's, a defect's nor an unclaimed
 * summa row's answers no finding and is a stale row (hard error). Returns the entries
 * sorted by page.
 */
export function applyAssReadings(scan: Pick<AssScan, 'entries' | 'defects' | 'summa'>, volume: number, year: number, table: Readonly<Record<string, AssReading>> = ASS_READINGS): AssEntry[] {
  const entries = [...scan.entries];
  for (const [key, row] of Object.entries(table)) {
    if (!key.startsWith(`ASS:${volume}:`)) continue;
    const page = Number(key.split(':')[2]);
    const at = entries.findIndex((e) => e.page === page);
    const answers = at >= 0 || scan.defects.some((d) => d.page === page) || scan.summa.unclaimed.some((r) => r.page === page);
    if (!answers) throw new Error(`stale reading ${key}: no scanned entry, defect or unclaimed summa row at that page`);
    const entry: AssEntry = {
      series: 'ASS', volume, year, page, pope: row.pope, category: row.category, date: row.date,
      incipit: null, quoted: false, toponym: null, description: row.description, raw: row.evidence,
      opening: row.opening, anchor: 'reading',
      evidence: { heading: row.evidence, salutation: null, opening: row.opening, dateline: null, header: '' },
    };
    if (at >= 0) entries[at] = entry; else entries.push(entry);
  }
  return entries.sort((a, b) => a.page - b.page);
}

/** An ASS source's fixture as a parse result (index.ts): the entries with the readings applied, no pageless entry, the scan's defects, and stats that count the summa's rows as the lines. */
function loadAssSource(s: ActaSource): ActaParseResult {
  const scan = JSON.parse(readFileSync(s.file, 'utf8')) as AssScan;
  const entries = applyAssReadings(scan, s.volume, s.year);
  const harvested = (e: ActaEntry) => (categoryForHeading(e.category)?.harvested ?? 'no') !== 'no';
  const rows = scan.summa.rows.length;
  return {
    volume: s.volume, year: s.year, entries, pageless: [],
    unseenHeadings: [...new Set(entries.filter((e) => categoryForHeading(e.category) === null).map((e) => e.category))],
    unmappedPopes: [], popeHeadings: [...new Set(entries.map((e) => e.pope))], skippedParts: [],
    defects: scan.defects.map((d) => ({ category: '', message: `p. ${d.page} ${d.reason}: ${d.lines.join(' / ')}` })),
    stats: {
      lines: rows, pageLines: rows, harvestedPageLines: scan.summa.claimed.length, harvestedEntries: entries.filter(harvested).length,
      dateLines: entries.filter((e) => !e.date.startsWith('????')).length, entries: entries.length, monthOnly: 0,
      withoutPage: 0, subItems: 0, translations: 0, consumed: scan.defects.length, recovered: entries.filter((e) => e.anchor === 'reading').length,
    },
  };
}
```

and in `loadActaIndexes`, right after `if (!existsSync(s.file)) { missing.push(s.key); continue; }`, add:

```ts
    if (s.kind === 'ass') { parsed.set(s.key, loadAssSource(s)); continue; }
```

Import `categoryForHeading` from `./categories.js` and `type ActaEntry` from `./index.js` if not already imported.

Run: `npx vitest run tools/test/acta-join.test.ts` — Expected: PASS.

- [ ] **Step 4: `curationKey` for the ASS**

In `curation.ts`, replace line 1381:

```ts
/** The key of ACTA_INDEX_CORRECTIONS and ACTA_HOLDS: `{year}:{page}` for the AAS; `ASS:{volume}:{page}` for the ASS, whose volumes 2 and 3 share a year. */
export const curationKey = (e: { series?: string; volume?: number; year: number; page: number }): string =>
  e.series === 'ASS' ? `ASS:${e.volume}:${e.page}` : `${e.year}:${e.page}`;
```

Run: `npx tsc --noEmit` — Expected: no errors.

- [ ] **Step 5: The opening-prefix rule, test first**

Append to `tools/test/acta-match.test.ts` (use the file's existing helpers for building documents — read its top; the `doc()` helper or equivalent, with `issuerId`, `date`, `genre`, `incipit`, `title`):

```ts
describe('the opening-prefix rule for ASS entries (ass volumes spec §5)', () => {
  const entry = (opening: string, page = 273): ActaEntry => ({
    series: 'ASS', volume: 33, year: 1900, page, pope: 'Leo XIII', category: 'EPISTOLA ENCYCLICA', date: '1900-11-01',
    incipit: null, quoted: false, toponym: null, description: 'De Iesu Christo Redemptore', raw: '', opening, anchor: 'dateline',
    evidence: { heading: '', salutation: null, opening, dateline: null, header: '' },
  });
  const tametsi = doc({ id: 'mag:leo-xiii/tametsi-futura-1900', issuerId: 'rp:leo-xiii', date: '1900-11-01', genre: 'encyclical', incipit: 'Tametsi futura', title: 'Tametsi futura' });
  const other = doc({ id: 'mag:leo-xiii/other-1900', issuerId: 'rp:leo-xiii', date: '1900-11-01', genre: 'encyclical', incipit: 'Tametsi', title: 'Tametsi' });
  it('matches the one candidate of the class on the date without reading the opening (`unique`)', () => {
    const r = matchActa([entry('Tametsi futura prospicientibus, vacuo a sollicitudine animo esse')], [tametsi]);
    expect(r.matches).toMatchObject([{ documentId: 'mag:leo-xiii/tametsi-futura-1900', by: 'unique' }]);
  });
  it('tells two candidates apart by the incipit slug as a word-boundary prefix of the opening slug (`opening`), and both candidates are prefixes → ambiguous', () => {
    const r = matchActa([entry('Tametsi futura prospicientibus, vacuo a sollicitudine animo esse')], [tametsi, other]);
    // `tametsi` and `tametsi-futura` are both word-boundary prefixes: nothing separates them.
    expect(r.matches).toEqual([]);
    expect(r.ambiguous).toHaveLength(1);
    const third = doc({ id: 'mag:leo-xiii/tametsi-fut-1900', issuerId: 'rp:leo-xiii', date: '1900-11-01', genre: 'encyclical', incipit: 'Tametsi fut', title: 'x' });
    const r2 = matchActa([entry('Tametsi futura prospicientibus, vacuo a sollicitudine animo esse')], [tametsi, third]);
    expect(r2.matches).toMatchObject([{ documentId: 'mag:leo-xiii/tametsi-futura-1900', by: 'opening' }]);
  });
  it('does not read `tametsi-fut` as a prefix of `tametsi-futura` (word boundary)', () => {
    const third = doc({ id: 'mag:leo-xiii/tametsi-fut-1900', issuerId: 'rp:leo-xiii', date: '1900-11-01', genre: 'encyclical', incipit: 'Tametsi fut', title: 'x' });
    const fourth = doc({ id: 'mag:leo-xiii/alia-1900', issuerId: 'rp:leo-xiii', date: '1900-11-01', genre: 'encyclical', incipit: 'Alia verba', title: 'y' });
    const r = matchActa([entry('Tametsi futura prospicientibus, vacuo a sollicitudine animo esse')], [third, fourth]);
    expect(r.matches).toEqual([]);
    expect(r.ambiguous).toHaveLength(1);
  });
  it('keeps the claim with the opening evidence when two ASS entries claim one document', () => {
    const r = matchActa([entry('Tametsi futura prospicientibus, vacuo a sollicitudine animo esse', 273), entry('Alia verba prorsus diversa hic leguntur nunc', 300)], [tametsi]);
    expect(r.matches).toMatchObject([{ entry: { page: 273 }, by: 'opening' }]);
    expect(r.unmatched).toMatchObject([{ entry: { page: 300 } }]);
    expect(r.conflicts).toEqual([]);
  });
  it('leaves an ASS entry with the unreadable date marker unmatched and without near-misses', () => {
    const r = matchActa([{ ...entry('Ingenti sane laetitia suavique animi iucunditate hodie perfundimur'), date: '????-??-??', category: 'EPISTOLA' }], [tametsi]);
    expect(r.unmatched).toMatchObject([{ sameDate: [], nearMisses: [] }]);
  });
});
```

Run: `npx vitest run tools/test/acta-match.test.ts` — Expected: FAIL on `by: 'opening'`.

- [ ] **Step 6: Implement the rule**

In `match.ts`:

```ts
export interface ActaMatch {
  entry: ActaEntry;
  documentId: string;
  /**
   * What decided the match: the only candidate, the incipit slug, the toponym, a curated
   * override, for a month-only entry the incipit slug within the month, or -- for an ASS
   * entry, which carries an opening and no incipit -- the candidate's incipit slug as a
   * word-boundary prefix of the opening's slug (ass volumes spec §5).
   */
  by: 'unique' | 'incipit' | 'toponym' | 'curated' | 'incipit-month' | 'opening';
}

/**
 * Whether a document's incipit agrees with an entry's: equality of slugs where the entry
 * prints an incipit (the AAS), or -- where it carries an opening and no incipit (the ASS) --
 * the document's incipit slug as a prefix of the opening slug ending at a hyphen or at the
 * end (`tametsi-futura` of `tametsi-futura-prospicientibus-…`; `tametsi-fut` is not).
 * False when the entry carries neither, or the document no incipit.
 */
export function incipitAgrees(entry: Pick<ActaEntry, 'incipit' | 'opening'>, doc: Pick<DocumentRecord, 'incipit'>): boolean {
  if (doc.incipit === undefined) return false;
  const ds = incipitSlug(doc.incipit);
  if (ds === '') return false;
  if (entry.incipit !== null) return incipitSlug(entry.incipit) === ds;
  if (entry.opening === undefined) return false;
  const os = slugify(entry.opening);
  return os === ds || os.startsWith(`${ds}-`);
}
/** The rule an agreeing incipit is recorded under: `incipit` for a printed incipit, `opening` for an ASS opening. */
const agreementRule = (entry: Pick<ActaEntry, 'incipit'>): ActaMatch['by'] => (entry.incipit !== null ? 'incipit' : 'opening');
```

Then in `matchActa`, replace the candidate narrowing block

```ts
    if (candidates.length > 1 && entry.incipit !== null) {
      const slug = incipitSlug(entry.incipit);
      const byIncipit = candidates.filter((d) => d.incipit !== undefined && incipitSlug(d.incipit) === slug);
      if (byIncipit.length >= 1) { candidates = byIncipit; by = 'incipit'; }
    }
```

with

```ts
    if (candidates.length > 1 && (entry.incipit !== null || entry.opening !== undefined)) {
      const byIncipit = candidates.filter((d) => incipitAgrees(entry, d));
      if (byIncipit.length >= 1) { candidates = byIncipit; by = agreementRule(entry); }
    }
```

and in the claims tie-break replace

```ts
      if (e.incipit !== null && doc.incipit !== undefined && incipitSlug(doc.incipit) === incipitSlug(e.incipit)) return { ...m, by: 'incipit' };
```

with

```ts
      if (incipitAgrees(e, doc)) return { ...m, by: agreementRule(e) };
```

The month-only branch keeps its equality test (an ASS entry is never month-only). Extend the file's header comment with one sentence: `An ASS entry (ass.ts) carries an eight-word opening and no incipit; its rule is the candidate's incipit slug as a word-boundary prefix of the opening's (incipitAgrees), recorded as 'opening'; nothing else differs (ass volumes spec §5).`

Run: `npx vitest run tools/test/acta-match.test.ts` — Expected: PASS.

- [ ] **Step 7: The creator holds ASS entries**

In `create.ts`, add to `HoldReason` (after `'ocr-damaged'`):

```ts
  /** An ASS entry (ass volumes spec, decision 1): phase 2c-i joins references only; ASS-born documents are 2c-iii. */
  | 'series-not-created';
```

In the unmatched loop, right after `const entry = u.entry;`, add:

```ts
    if (entry.series === 'ASS') { hold(entry, 'series-not-created', 'an Acta Sanctae Sedis entry: phase 2c-i joins references only (ass volumes spec §5); creation is decided in 2c-iii from this phase\'s gap report', u.sameDate); continue; }
```

Add a test in `tools/test/acta-create.test.ts` (using that file's helpers):

```ts
  it('holds every unmatched ASS entry as series-not-created and creates nothing from the ASS (ass volumes spec, decision 1)', () => {
    const entry: ActaEntry = { series: 'ASS', volume: 33, year: 1900, page: 286, pope: 'Leo XIII', category: 'LITTERAE APOSTOLICAE', date: '1900-10-20', incipit: null, quoted: false, toponym: null, description: 'de Collegio Clericorum Lusitanorum', raw: '', opening: 'Quod iam diu optabamus, ut Collegium Lusitanum', anchor: 'dateline', evidence: { heading: '', salutation: null, opening: '', dateline: null, header: '' } };
    const result = matchActa([entry], []);
    const creation = createFromActa(result, []);
    expect(creation.created).toEqual([]);
    expect(creation.held).toMatchObject([{ reason: 'series-not-created', entry: { page: 286 } }]);
  });
```

Run: `npx vitest run tools/test/acta-create.test.ts` — Expected: PASS.

- [ ] **Step 8: The category headings**

In `categories.ts`: on the `Epistulae` row (line 192) add `'EPISTOLA', 'LITTERAE'` to `headings` with the comment `// The ASS head a letter `EPISTOLA` (ASS 41 (1908) 12, 19, 129 …) or `LITTERAE` (ASS 12 (1879) 273; ASS 33 (1900) 65, 129) — the singular and the bare form, each an act of the letters shelf (ass volumes spec §5).`; on the `Adhortationes Apostolicae` row add `'EXHORTATIO'` with `// `EXHORTATIO AD CLERUM CATHOLICUM` (ASS 41 (1908) 555, *Haerent animo*): the volume heads it `EXHORTATIO` alone on its first line.`; add after the `Epistulae` row:

```ts
  // The ASS print the briefs among the pope's acts: `LITTERAE in forma Brevis SSmi. D. N.
  // Leonis XIII` (ASS 33 (1900) 129, 577) and `BREVE` (ASS 33 (1901) 404, under EX
  // SECRETARIA BREVIUM); the shelf class is `brief` (Leo XIII's briefs shelf, 8 records;
  // Pius IX's, 3). Harvested partly: the shelf exists for these two popes only.
  { id: 'Brevia', headings: ['LITTERAE IN FORMA BREVIS', 'BREVE'], classes: [{ genre: 'brief' }], harvested: 'partly' },
```

Quote, for each heading, the volume and page the scan found it at (from the fixtures — `grep -n '"category": "BREVE"' tools/fixtures/acta/ass-33-1900.entries.json`), correcting the pages above to what the fixtures print. If a heading above is printed by no fixture, do **not** add it (spec §5: a heading the sample never prints gets no row); if a fixture prints a heading none of the rows maps (the loader's `unseenHeadings`), add it to the row it belongs to with the page quoted.

In `tools/test/acta-categories.test.ts`: the tests *covers every heading every fixture prints* (line 117) and *is printed in the fixtures, row by row* (line 123) read the text fixtures; for an `ass` source the printed headings are the `category` values of its `.entries.json` — change the fixture-reading helper in that file (line ~145, `readFileSync(src.file, 'utf8').split(/\f|\n/)…`) so that for `src.kind === 'ass'` it returns `JSON.parse(readFileSync(src.file, 'utf8')).entries.map((e) => e.category)` instead, and the heading-extraction over those lines treats each line as a heading. Add a test:

```ts
  it('maps the headings of the ASS sample (ass volumes spec §5): the singular and bare letter forms, the briefs, the exhortation', () => {
    expect(categoryForHeading('EPISTOLA')?.id).toBe('Epistulae');
    expect(categoryForHeading('LITTERAE')?.id).toBe('Epistulae');
    expect(categoryForHeading('LITTERAE IN FORMA BREVIS')?.id).toBe('Brevia');
    expect(categoryForHeading('BREVE')?.id).toBe('Brevia');
    expect(categoryForHeading('EXHORTATIO')?.id).toBe('Adhortationes Apostolicae');
    expect(categoryForHeading('ALLOCUTIO')?.harvested).toBe('no');
  });
```

Run: `npx vitest run tools/test/acta-categories.test.ts` — Expected: PASS.

- [ ] **Step 9: The popes test over the ASS fixtures**

In `tools/test/acta-popes.test.ts`, the test *is printed in the fixtures* (line 42): extend it so that an `ass` source's printed popes are `JSON.parse(readFileSync(src.file,'utf8')).entries.map((e) => e.pope)` matched against `p.pope` (not the genitive), and remove the Task 4 exemption.

Run: `npx vitest run tools/test/acta-popes.test.ts` — Expected: PASS.

- [ ] **Step 10: The AAS report loads AAS sources only**

In `tools/acta-volumes-report.ts`, find the `loadActaIndexes(` call and every `ACTA_SOURCES` loop (line 1215 `for (const s of ACTA_SOURCES)`; line 1175 `SAMPLE`), and pass/iterate `ACTA_SOURCES.filter((s) => s.kind !== 'ass')` instead, with the comment `// The ASS have their own report (tools/ass-volumes-report.ts); this one reads the AAS.` Define `const AAS_SOURCES = ACTA_SOURCES.filter((s) => s.kind !== 'ass');` once after the imports and use it in the three places. Also make `cite` (line 1205) series-aware: `` `${e.series} ${e.volume}${…}` `` — it is called on AAS entries only after the filter, but the corpus-wide tables (`bornKey`, `docsWithoutEntry`) must not print `AAS` for an ASS reference: in `bornKey` replace `d.acta!.year` with `${d.acta!.series}:${d.acta!.volume}` alongside, and in any table listing a document's `acta` use a helper `citeRef = (a: NonNullable<DocumentRecord['acta']>) => `${a.series} ${a.volume}${a.part ? `-${a.part}` : ''} (${a.year}) ${a.page}``.

Run: `npx tsx tools/acta-volumes-report.ts 2003-2009 > /tmp/claude-1000/-home-johnrdorazio-development-CatholicOS-org-cmddr/94bb5538-008f-41a5-af5e-c67e5c830d13/scratchpad/r.md && diff <(git show HEAD:docs/superpowers/reports/2026-09-21-acta-volumes-2003-2009.md) /tmp/claude-1000/-home-johnrdorazio-development-CatholicOS-org-cmddr/94bb5538-008f-41a5-af5e-c67e5c830d13/scratchpad/r.md`
Expected: no diff before the harvest runs (Task 6) — the report reads `data/`, which the ASS has not touched yet.

- [ ] **Step 11: Whole suite, then commit**

Run: `npm run check`
Expected: PASS, except `harvest-data.test.ts` tests that read `data/` (unchanged until Task 6) — these still pass at this point since the data is unchanged. If `writes a reference only … in the AAS` passes now, it will fail after Task 6; Task 6 changes it.

```bash
git add tools/src/acta/join.ts tools/src/acta/curation.ts tools/src/acta/match.ts tools/src/acta/create.ts tools/src/acta/categories.ts tools/acta-volumes-report.ts tools/test/acta-join.test.ts tools/test/acta-match.test.ts tools/test/acta-create.test.ts tools/test/acta-categories.test.ts tools/test/acta-popes.test.ts
git commit -m "Join the ASS: the five sample sources, the entries loader with the curated readings, the opening-prefix rule, the ASS headings, and the creator's hold (ass volumes spec §5)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 6: Harvest, validate, render; pin the numbers

**Files:**
- Modify: `data/documents/{pius-ix,leo-xiii,pius-x}.json`, `registry/**` (regenerated)
- Modify: `tools/test/harvest-data.test.ts:2745-2760` (the `cited` filter), `:3031-3043` (the AAS-shape test), a new `describe` after the AAS-only block (line 3078 onward — place it after the `describe('the AAS-only documents …')` block's end)

- [ ] **Step 1: Run the harvest and read its output**

Run: `npm run harvest 2>&1 | tee /tmp/claude-1000/-home-johnrdorazio-development-CatholicOS-org-cmddr/94bb5538-008f-41a5-af5e-c67e5c830d13/scratchpad/harvest.log | grep -E "AAS |AAS-only|ASS|conflict|shared|unseen|unmapped"`
Expected: the `AAS …: N index entries …` line now counts the ASS entries too; `AAS-only documents: … held (… series-not-created N …)`; no `unseen category heading` for an ASS source (else Task 5 Step 8 missed one — add it and re-run); the shared-page warnings name any ASS page two matched documents cite — read each such page in the store text and, where the page does print two short acts, add an `ACTA_SHARED_PAGES` row keyed `ASS:{vol}:{page}` quoting them (`curation.ts:1398`), re-run.

Run: `npm run validate && npm run render`
Expected: validate passes (invariant 25 across series); render regenerates `registry/`.

Run: `git diff --stat data/ registry/ | tail -3` and `node -e "…"` (the counting script below) to read the numbers:

```bash
node -e '
const fs=require("fs");let docs=[];for(const f of fs.readdirSync("data/documents")){docs=docs.concat(JSON.parse(fs.readFileSync("data/documents/"+f,"utf8")));}
const ass=docs.filter(d=>d.acta&&d.acta.series==="ASS");
const by={};for(const d of ass){const k=d.acta.volume+"|"+d.issuerId+"|"+d.genre;by[k]=(by[k]||0)+1;}
console.log("ASS references:",ass.length);for(const k of Object.keys(by).sort())console.log(" ",k,by[k]);
console.log("shelf docs 1865-1908 without acta:",docs.filter(d=>d.date>="1865-01-01"&&d.date<="1908-12-31"&&!d.acta).length);
'
```

- [ ] **Step 2: Restrict the AAS describe to AAS references, and pin the ASS**

In `harvest-data.test.ts` line ~2750, change

```ts
  const cited = everything.filter((d) => d.acta !== undefined && !isActaShelf(d.source?.shelf));
```

to

```ts
  // The shelf documents an AAS index entry matched; the ASS references (series 'ASS', phase 2c-i) have their own block below.
  const cited = everything.filter((d) => d.acta !== undefined && d.acta.series === 'AAS' && !isActaShelf(d.source?.shelf));
```

Then add, after the `describe('the AAS-only documents …')` block:

```ts
describe('the ASS reference (ass volumes spec, phase 2c-i: the sample)', () => {
  const everything = readdirSync('data/documents').filter((f) => f.endsWith('.json'))
    .flatMap((f) => loadAll(f.replace(/\.json$/, '')));
  const cited = everything.filter((d) => d.acta?.series === 'ASS');
  const sources = ACTA_SOURCES.filter((s) => s.kind === 'ass');

  it('writes an ASS reference only on a shelf document of Pius IX, Leo XIII or Pius X, citing a sample volume by its number and first year, at a page within the volume, dated no later than the volume\'s last year', () => {
    for (const d of cited) {
      expect(['rp:pius-ix', 'rp:leo-xiii', 'rp:pius-x'], d.id).toContain(d.issuerId);
      expect(isActaShelf(d.source?.shelf), d.id).toBe(false);
      const s = sources.find((x) => x.volume === d.acta!.volume);
      expect(s, d.id).toBeDefined();
      expect(d.acta!.year, d.id).toBe(s!.year);
      expect(d.acta!.part, d.id).toBeUndefined();
      expect(d.acta!.page, d.id).toBeGreaterThanOrEqual(1);
      expect(d.date.slice(0, 4) <= String(s!.yearTo ?? s!.year), d.id).toBe(true);
    }
  });

  it('pins the matched count per volume, so a silent drop fails loudly', () => {
    // <one sentence per volume from the harvest: N references, of which n by the opening rule, n unique; what is thin and why>
    const perVolume = Object.fromEntries(sources.map((s) => [s.key, cited.filter((d) => d.acta!.volume === s.volume).length]));
    expect(perVolume).toEqual({ 'ass-1': 0, 'ass-12': 0, 'ass-23': 0, 'ass-33': 0, 'ass-41': 0 });   // ← the harvest's numbers
    expect(cited).toHaveLength(0);   // ← the total
  });

  it('cites the acts the era report names, each verified against the quoted heading and dateline in the fixture', () => {
    const by = Object.fromEntries(cited.map((d) => [d.id, d.acta!]));
    // *Tametsi futura* -- ASS 33 (1900) 273: `EPISTOLA ENCYCLICA Sanctissimi Domini Nostri LEONIS PAPAE XIII. / DE IESU CHRISTO
    // REDEMPTORE.`, `Datum Romae apud S. Petrum die i Novembris An. MDCGCC` (ass-33-1900.entries.json).
    expect(by['mag:leo-xiii/tametsi-futura-1900']).toEqual({ series: 'ASS', volume: 33, year: 1900, page: 273 });
    // <three more, one per other volume with a match: the encyclical or constitution of weight, page quoted from the fixture>
  });

  it('creates nothing from the ASS: no document carries an ass/ shelf, and every unmatched ASS entry is held series-not-created', () => {
    expect(everything.filter((d) => (d.source?.shelf ?? '').startsWith('ass/'))).toEqual([]);
    const { parsed } = loadActaIndexes(sources);
    const entries = [...parsed.values()].flatMap((p) => p.entries);
    const shelf = everything.filter((d) => !isActaShelf(d.source?.shelf));
    const creation = createFromActa(matchActa(entries, shelf), shelf);
    expect(creation.created).toEqual([]);
    expect(creation.held.filter((h) => h.reason === 'series-not-created')).toHaveLength(creation.held.length - creation.held.filter((h) => ['ambiguous', 'claimed-twice', 'pope-not-harvested', 'reprint'].includes(h.reason)).length);
  });

  it('satisfies invariant 25 across both series', () => {
    expect(checkDocuments(everything, genres, keywords, series).filter((v) => v.rule === 25)).toEqual([]);
  });
});
```

Fill the pins from Step 1's numbers; import `loadActaIndexes`, `matchActa`, `createFromActa` if the file lacks them (check its imports). Delete the placeholder comments in angle brackets, writing the sentences from the harvest log.

- [ ] **Step 3: Run the whole suite**

Run: `npm run check`
Expected: PASS. Any other pinned test that moved (the corpus totals in the existing era tests count `everything`; `re-mints no shelf id` reads ordinals) is updated with a comment naming phase 2c-i and the cause.

- [ ] **Step 4: Commit**

```bash
git add data/ registry/ tools/test/harvest-data.test.ts tools/src/acta/curation.ts
git commit -m "Join the ASS sample: N references on the shelf documents of Pius IX, Leo XIII and Pius X (ASS 1, 12, 23, 33, 41); pin the era (phase 2c-i)

<the per-volume line; the shared pages curated, if any>

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 7: The era report

**Files:**
- Create: `tools/ass-volumes-report.ts`
- Create: `docs/superpowers/reports/2026-09-2D-ass-volumes-sample.md` (the generation date)
- Modify: `docs/superpowers/reports/*acta-volumes-*.md` (regenerated; they print corpus totals)
- Modify: `tools/test/harvest-data.test.ts` (the ASS block gains the report's scan and summa pins)

**Interfaces:**
- Consumes: `loadActaIndexes`, `matchActa`, `applyCuratedReferences`, `createFromActa`, `categoryForHeading`, `ACTA_POPES`, `ASS_READINGS`, the fixtures.

- [ ] **Step 1: Write the report tool**

Create `tools/ass-volumes-report.ts`, modelled on `tools/acta-volumes-report.ts`'s structure (its `p()`/`md()`/`candidateList()` helpers, copied — they are five lines) but with the sections the spec §6 names. Sections, in order, each a computed table with the prose slot marked:

```ts
/**
 * The ASS sample report (ass volumes spec §6-§7, phase 2c-i): for each of the five sample
 * volumes, what the scanner read from the body and the summa said about it, what the join
 * matched and by which rule, what it could not, and the shelf documents of the volume's
 * years with no reference; across the sample, the headings and popes mapped, the readings
 * curated, and the corpus before and after. NEVER run by the harvest: it reads data/ as
 * the harvest wrote it and re-runs the join over the shelf records.
 *
 * Usage: npx tsx tools/ass-volumes-report.ts > docs/superpowers/reports/2026-09-2D-ass-volumes-sample.md
 */
import { readFileSync, readdirSync } from 'node:fs';
import { ACTA_SOURCES, applyCuratedReferences, loadActaIndexes } from './src/acta/join.js';
import { matchActa, POPE_ISSUERS, type ActaCandidate, type ActaUnmatched } from './src/acta/match.js';
import { createFromActa, isActaShelf } from './src/acta/create.js';
import { categoryForHeading } from './src/acta/categories.js';
import { ASS_READINGS } from './src/acta/curation.js';
import type { AssScan, AssEntry } from './src/acta/ass.js';
import type { DocumentRecord } from './src/types.js';

const allDocs = readdirSync('data/documents').filter((f) => f.endsWith('.json'))
  .flatMap((f) => JSON.parse(readFileSync(`data/documents/${f}`, 'utf8')) as DocumentRecord[])
  .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
const docs = allDocs.filter((d) => !isActaShelf(d.source?.shelf));
const sources = ACTA_SOURCES.filter((s) => s.kind === 'ass');
const { parsed } = loadActaIndexes(sources);
const scans = new Map(sources.map((s) => [s.key, JSON.parse(readFileSync(s.file, 'utf8')) as AssScan]));
const entries = [...parsed.values()].flatMap((p) => p.entries) as AssEntry[];
const result = matchActa(entries, docs);
applyCuratedReferences(result, docs);
const creation = createFromActa(result, docs);

const out: string[] = [];
const p = (s = '') => out.push(s);
const md = (s: string) => s.replace(/\|/g, '\\|').replace(/\n/g, ' / ').replace(/\s+/g, ' ');
const cite = (e: AssEntry) => `ASS ${e.volume} (${e.year}) ${e.page}`;
const candidateList = (cs: ActaCandidate[]) => cs.map((c) => `\`${c.id}\`${c.incipit ? ` (*${md(c.incipit)}*)` : ''}`).join(', ') || '—';
const of = (k: string) => entries.filter((e) => `ass-${e.volume}` === k);
const pct = (a: number, b: number) => (b === 0 ? '—' : `${((a / b) * 100).toFixed(1)} %`);

p('# The *Acta Sanctae Sedis* sample (ASS 1, 12, 23, 33, 41): the phase-2c-i report');
p();
p(`Generated by \`tools/ass-volumes-report.ts\` on ${scans.get('ass-41')!.generated} from \`data/documents/\`, the entries and summa fixtures in \`tools/fixtures/acta/\`, and the curated readings (\`ASS_READINGS\`, \`tools/src/acta/curation.ts\`):`);
p('the report of phase 2c-i of [#25](https://github.com/CatholicOS/cmddr/issues/25) as the [ass volumes spec](../specs/2026-09-21-ass-volumes-design.md) §6 defines it.');
p();
p('## 1. Reading');
p();
// <the author's numbered reading, written against the tables below after they are generated: what the scan found, how the summa checked it, what matched, what did not and why, the decisions taken (readings, headings), what 2c-ii should expect>
p();
p('## 2. The scan, per volume (spec §3)');
p();
p('| Source | Pages | Summa pages | Acts scanned | From a heading | Readings | Defects | Summa rows | Claimed | Unclaimed | Acts the summa omits |');
p('|---|---|---|---|---|---|---|---|---|---|---|');
for (const s of sources) {
  const sc = scans.get(s.key)!;
  const es = of(s.key);
  p(`| ${s.key} (${s.year}${s.yearTo ? `–${s.yearTo}` : ''}) | ${sc.pages} | ${sc.summa.pages ? `${sc.summa.pages.from}–${sc.summa.pages.to}` : '—'} | ${es.length} | ${es.filter((e) => e.anchor === 'heading').length} | ${es.filter((e) => e.anchor === 'reading').length} | ${sc.defects.length} | ${sc.summa.rows.length} | ${sc.summa.claimed.length} | ${sc.summa.unclaimed.length} | ${sc.summa.omitted.length} |`);
}
p();
p('### 2.1 Acts scanned, with the lines each rests on');
p();
for (const s of sources) {
  p(`<details><summary><b>${s.key}</b> — ${of(s.key).length} acts</summary>`);
  p();
  p('| Page | Category | Pope | Date | Opening | Description | Anchor | Heading (as printed) | Salutation | Dateline (as printed) | Header |');
  p('|---|---|---|---|---|---|---|---|---|---|---|');
  for (const e of of(s.key)) p(`| ${e.page} | ${md(e.category)} | ${e.pope} | ${e.date} | *${md(e.opening)}* | ${md(e.description)} | ${e.anchor} | ${md(e.evidence.heading)} | ${e.evidence.salutation ? md(e.evidence.salutation) : '—'} | ${e.evidence.dateline ? md(e.evidence.dateline) : '—'} | ${md(e.evidence.header)} |`);
  p();
  p('</details>');
  p();
}
p('### 2.2 Scanner defects');
p();
p('| Source | Page | Reason | Lines found |');
p('|---|---|---|---|');
for (const s of sources) for (const d of scans.get(s.key)!.defects) p(`| ${s.key} | ${d.page} | ${d.reason} | ${md(d.lines.join(' / '))} |`);
p();
p('### 2.3 Summa rows unclaimed (the scan opens no act at the page)');
p();
p('| Source | Page | Row (as printed) |');
p('|---|---|---|');
for (const s of sources) for (const r of scans.get(s.key)!.summa.unclaimed) p(`| ${s.key} | ${r.page} | ${md(r.raw)} |`);
p();
p('### 2.4 Acts the summa omits');
p();
p('| Source | Page | Category | Opening |');
p('|---|---|---|---|');
for (const s of sources) for (const pg of scans.get(s.key)!.summa.omitted) { const e = of(s.key).find((x) => x.page === pg); if (e) p(`| ${s.key} | ${pg} | ${md(e.category)} | *${md(e.opening)}* |`); }
p();
p('### 2.5 Curated readings (ASS_READINGS)');
p();
p('| Key | Pope | Category | Date | Opening | Evidence |');
p('|---|---|---|---|---|---|');
for (const [k, r] of Object.entries(ASS_READINGS)) p(`| ${k} | ${r.pope} | ${md(r.category)} | ${r.date} | *${md(r.opening)}* | ${md(r.evidence)} |`);
p();
p('## 3. The join (spec §5)');
p();
p('| Source | Entries | In a harvested category | Matched | unique | opening | toponym | curated | Ambiguous | Unmatched | Skipped (category not harvested) | Claimed twice | Shared pages |');
p('|---|---|---|---|---|---|---|---|---|---|---|---|---|');
for (const s of sources) {
  const es = of(s.key);
  const ms = result.matches.filter((m) => `ass-${m.entry.volume}` === s.key);
  const by = (b: string) => ms.filter((m) => m.by === b).length;
  p(`| ${s.key} | ${es.length} | ${es.filter((e) => (categoryForHeading(e.category)?.harvested ?? 'no') !== 'no').length} | ${ms.length} | ${by('unique')} | ${by('opening')} | ${by('toponym')} | ${by('curated')} | ${result.ambiguous.filter((a) => `ass-${a.entry.volume}` === s.key).length} | ${result.unmatched.filter((u) => `ass-${u.entry.volume}` === s.key).length} | ${result.skipped.filter((e) => `ass-${e.volume}` === s.key).length} | ${result.conflicts.filter((c) => c.entries.some((e) => `ass-${e.volume}` === s.key)).length} | ${result.sharedPages.filter((sp) => sp.matches.some((m) => `ass-${m.entry.volume}` === s.key)).length} |`);
}
p();
p('### 3.1 Matches');
p();
p('| Reference | Category | Date | Opening | Document | By |');
p('|---|---|---|---|---|---|');
for (const m of result.matches) { const e = m.entry as AssEntry; p(`| ${cite(e)} | ${md(e.category)} | ${e.date} | *${md(e.opening)}* | \`${m.documentId}\` | ${m.by} |`); }
p();
p('### 3.2 Ambiguous');
p();
p('| Reference | Category | Date | Opening | Candidates |');
p('|---|---|---|---|---|');
for (const a of result.ambiguous) { const e = a.entry as AssEntry; p(`| ${cite(e)} | ${md(e.category)} | ${e.date} | *${md(e.opening)}* | ${candidateList(a.candidates)} |`); }
p();
p('### 3.3 Unmatched, with what the pope has on the date and a day off');
p();
p('| Reference | Category | Date | Opening | Description | Same date (any class) | Near-misses (±1 day, the class) |');
p('|---|---|---|---|---|---|---|');
for (const u of result.unmatched as (ActaUnmatched & { entry: AssEntry })[]) p(`| ${cite(u.entry)} | ${md(u.entry.category)} | ${u.entry.date} | *${md(u.entry.opening)}* | ${md(u.entry.description)} | ${candidateList(u.sameDate)} | ${candidateList(u.nearMisses)} |`);
p();
p('### 3.4 Skipped: categories the registry does not harvest (the allocutions), with the shelf\'s same-date address');
p();
p('| Reference | Category | Date | Opening | Shelf address on the date |');
p('|---|---|---|---|---|');
for (const e of result.skipped as AssEntry[]) {
  const same = docs.filter((d) => d.issuerId === POPE_ISSUERS[e.pope] && d.date === e.date && d.genre === 'discourse-address').map((d) => `\`${d.id}\``).join(', ') || '—';
  p(`| ${cite(e)} | ${md(e.category)} | ${e.date} | *${md(e.opening)}* | ${same} |`);
}
p();
p('### 3.5 Claimed twice, and shared pages');
p();
for (const c of result.conflicts) p(`- \`${c.documentId}\` claimed by ${c.entries.map((e) => cite(e as AssEntry)).join(' and ')}`);
for (const sp of result.sharedPages) p(`- page ${sp.page} cited by ${sp.matches.map((m) => `\`${m.documentId}\``).join(' and ')} (not curated in ACTA_SHARED_PAGES; neither written)`);
p();
p('## 4. Held by the creator');
p();
const byReason = new Map<string, number>();
for (const h of creation.held) byReason.set(h.reason, (byReason.get(h.reason) ?? 0) + 1);
p('| Reason | Entries |'); p('|---|---|');
for (const [r, n] of [...byReason].sort()) p(`| ${r} | ${n} |`);
p(); p(`Created: ${creation.created.length} (expected 0: phase 2c-i joins only).`); p();
p('## 5. Shelf documents of the volume years with no reference (the reverse gap)');
p();
for (const s of sources) {
  const issuers = new Set(of(s.key).map((e) => POPE_ISSUERS[e.pope]));
  const ds = docs.filter((d) => issuers.has(d.issuerId) && Number(d.date.slice(0, 4)) >= s.year && Number(d.date.slice(0, 4)) <= (s.yearTo ?? s.year) && d.acta === undefined);
  p(`<details><summary><b>${s.key}</b> — ${ds.length} documents dated ${s.year}${s.yearTo ? `–${s.yearTo}` : ''} with no reference</summary>`);
  p(); p('| Document | Date | Class | Incipit | ASS entries on this date |'); p('|---|---|---|---|---|');
  for (const d of ds) {
    const same = of(s.key).filter((e) => e.date === d.date && POPE_ISSUERS[e.pope] === d.issuerId).map((e) => `${cite(e)} ${md(e.category)} *${md(e.opening)}*`).join('; ') || '—';
    p(`| \`${d.id}\` | ${d.date} | ${d.genre} | ${d.incipit ? `*${md(d.incipit)}*` : '—'} | ${same} |`);
  }
  p(); p('</details>'); p();
}
p('## 6. The provisional records of the era, with what the ASS prints at their date');
p();
p('| Document | Date | Class | ASS entries on this date |'); p('|---|---|---|---|');
for (const d of docs.filter((d) => d.idStatus === 'provisional' && d.date >= '1865-01-01' && d.date <= '1908-12-31')) {
  const same = entries.filter((e) => e.date === d.date && POPE_ISSUERS[e.pope] === d.issuerId).map((e) => `${cite(e)} ${md(e.category)} *${md(e.opening)}*`).join('; ') || '—';
  p(`| \`${d.id}\` | ${d.date} | ${d.genre} | ${same} |`);
}
p();
p('## 7. Corpus');
p();
p(`Documents: ${allDocs.length}; with an ASS reference: ${allDocs.filter((d) => d.acta?.series === 'ASS').length}; shelf documents dated 1865–1908: ${docs.filter((d) => d.date >= '1865-01-01' && d.date <= '1908-12-31').length}, of which with a reference of either series: ${docs.filter((d) => d.date >= '1865-01-01' && d.date <= '1908-12-31' && d.acta).length}.`);
process.stdout.write(out.join('\n') + '\n');
```

- [ ] **Step 2: Generate, read, write the reading**

Run: `npx tsx tools/ass-volumes-report.ts > docs/superpowers/reports/2026-09-2D-ass-volumes-sample.md` (today's date in the name).

Read the tables (§2–§6). Write §1's reading in the tool (numbered findings, in the voice of the earlier eras' readings: each finding a bold sentence then the evidence with the numbers computed in code, not typed), regenerate, and re-read. The reading must cover: the scan rate against the summa per volume; the defects and what was decided for each (rule vs reading, with the spec's §3 bound stated as measured — replace the spec's "40 lines" with what the walk-back actually uses: the previous anchor); the match rate and the opening rule's share; the unmatched, classified (the shelf lacks the act / the shelf dates it differently / the class differs); the reverse gap's size per pope; the allocutions against the speeches shelf, with the count that would decide the `harvested` flag in 2c-ii; the nine provisional records; what 2c-ii should expect (which decade's OCR was worst).

Regenerate the seven AAS era reports (they print corpus totals): `for e in sample 1932-1957 1959-1977 1979-2014 1926-1930 1909-1925 2003-2009; do …; done` with the file names from the tool's usage comment. `git diff --stat docs/superpowers/reports/` should show only total-line changes; read the diff to confirm.

- [ ] **Step 3: Pin the report's scan and summa numbers**

In the ASS `describe` of `harvest-data.test.ts`, add:

```ts
  it('pins the scan and the summa check per volume as the era report §2 says', () => {
    const perVolume = Object.fromEntries(sources.map((s) => {
      const sc = JSON.parse(readFileSync(s.file, 'utf8'));
      return [s.key, { acts: sc.entries.length, defects: sc.defects.length, rows: sc.summa.rows.length, claimed: sc.summa.claimed.length, unclaimed: sc.summa.unclaimed.length, omitted: sc.summa.omitted.length }];
    }));
    // <one sentence per volume: what the numbers say>
    expect(perVolume).toEqual({ /* the report's §2 table */ });
    expect(Object.keys(ASS_READINGS)).toHaveLength(0 /* the count, with each key's cause in §2.5 */);
  });
```

Run: `npm run check` — Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add tools/ass-volumes-report.ts docs/superpowers/reports/ tools/test/harvest-data.test.ts
git commit -m "Report the ASS sample (phase 2c-i): the scan against the summa, the join, the reverse gap; regenerate the AAS era reports' totals

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
```

---

### Task 8: Documentation, PR, issue

**Files:**
- Modify: `README.md:320`, `:397`; `SCHEMA.md:42`; `docs/superpowers/specs/2026-09-21-ass-volumes-design.md` (§3 bound; a closing §9 *Measured*); `tools/fetch-acta.sh` usage (done in Task 1); `tools/fixtures/acta/README.md` title line 1.

- [ ] **Step 1: README**

Line 320: replace `The AAS join now covers 1909–2002 and 2003–2024 without a gap, and the *Acta Sanctae Sedis* of 1865–1908 are phase 2c.` with a sentence of the numbers: `The AAS join covers 1909–2024 without a gap. Phase 2c-i ([era report](docs/superpowers/reports/2026-09-2D-ass-volumes-sample.md), [spec](docs/superpowers/specs/2026-09-21-ass-volumes-design.md)) reaches into the *Acta Sanctae Sedis*, which print no chronological index: for five sample volumes (ASS 1, 12, 23, 33, 41) the index is synthesised from the volume body — every papal act's class heading, salutation, opening words and dateline, quoted beside the entry — and checked against the volume's own *Summa actorum*; **N** references (Pius IX n, Leo XIII n, Pius X n), n of them by the opening rule (the shelf's incipit as a prefix of the act's first words); the remaining 36 volumes are 2c-ii.`

Line 397: replace `The remaining phase is 2c, the *Acta Sanctae Sedis* of 1865–1908, whose indexes carry no date or incipit and are confirmed by hand.` with `Phase 2c-i joined the ASS sample without creating from it (the ASS-born documents and the reprints of earlier popes are 2c-iii, decided from the sample's reverse gap: **N** shelf documents of the volume years with no reference, n of them of the formal genres); the remaining 36 volumes are 2c-ii.`

- [ ] **Step 2: SCHEMA.md**

In the `acta` paragraph (line 42), after `… whose pages the OCR lost and the volume bodies gave back (…)`, insert: `, and — before 1909 — the *Acta Sanctae Sedis* of the five sample volumes of phase 2c-i (ASS 1, 12, 23, 33, 41; ass volumes spec), whose entries are synthesised from the volume body (`tools/src/acta/ass.ts`, the fixtures `ass-{vol}-{year}.entries.json` with every line quoted) since the ASS print no chronological index; an ASS `year` is the first year of a two-year volume (ASS 33 is 1900)`. And in the sentence `matches by issuer, date and incipit` append `(for the ASS, the shelf's incipit as a word-boundary prefix of the act's opening words)`.

- [ ] **Step 3: The spec**

§3, the *Opening* paragraph: replace `The walk is bounded (40 lines, measured on the sample)` with `The walk is bounded by the previous anchor (an act's heading stands after the act before it closes), measured on the sample: <the longest walk in pages, from the report>`. Append `## 9. Measured (2026-09-2D)` with the §2 and §3 tables' totals of the report, the readings count, and the 2c-ii recommendation from the reading.

`tools/fixtures/acta/README.md` line 1: title becomes `# The AAS index fixtures … and the volumes of 1909–2002; the ASS sample (1865–1908)`.

- [ ] **Step 4: Check, commit, PR**

Run: `npm run check` — Expected: PASS.

```bash
git add README.md SCHEMA.md docs/superpowers/specs/2026-09-21-ass-volumes-design.md tools/fixtures/acta/README.md
git commit -m "Restate the README, SCHEMA.md and the ASS spec from the sample's measurement (phase 2c-i)

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>"
git push -u origin feat/ass-sample
gh pr create --title "Join the Acta Sanctae Sedis sample (phase 2c-i)" --body "$(cat <<'EOF'
Phase 2c-i of #25, [spec](docs/superpowers/specs/2026-09-21-ass-volumes-design.md): the *Acta Sanctae Sedis* print no chronological index, so for five sample volumes (ASS 1, 12, 23, 33, 41 — Pius IX, Leo XIII, Pius X) the index is synthesised from the volume body by a scanner (`tools/src/acta/ass.ts`) that finds each papal act from its dateline, walks back to its class heading, and reads the pope, description, first eight words and date from quoted lines; the volume's own *Summa actorum* is parsed loosely as the completeness check (`summa.ts`). The join reads the entries fixture with one new rule (a candidate's incipit slug as a word-boundary prefix of the opening's slug) and creates nothing.

- **N** references (Pius IX n, Leo XIII n, Pius X n); per volume …
- Scan against the summa: … claimed / … unclaimed; … curated readings (`ASS_READINGS`), each quoting the volume.
- Reverse gap: **N** shelf documents of the volume years without a reference ([era report](docs/superpowers/reports/2026-09-2D-ass-volumes-sample.md) §5).
- 2c-ii (the 36 other volumes) and 2c-iii (ASS-born documents, the reprints) are named in the spec §8.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 5: Comment on #25**

`gh issue comment 25 --body "Phase 2c-i (PR #<n>): the ASS sample — five volumes, the index synthesised from the body and checked against the summa; <N> references, 0 created; era report in the PR."`

---

## Self-review

- **Spec coverage.** §1 (sources) → Task 1; §2 (fetch, fixtures, popes) → Tasks 1, 4, 5; §3 (scanner: anchor, opening, fields, defects) → Task 2; §4 (summa) → Task 3; §5 (types, sources, categories, opening rule, popes, creator) → Task 5 (creator hold Step 7; Vatican I noted only, as the spec says); §6 (curation: `ASS_READINGS`, corrections and overrides unchanged, the report as the confirmation) → Tasks 4, 5, 7; §7 (report, tests, docs, one PR) → Tasks 6–8; §8 (out of scope) → nothing built. The spec's "40 lines" bound is superseded by the previous-anchor bound and the spec is corrected in Task 8 Step 3.
- **Placeholders.** The `n`/`N`/`2026-09-2D` cells and the angle-bracketed sentences are deliberate: they are the measurement the tasks produce, and each step says which output fills them. No step defers a mechanism.
- **Type consistency.** `AssEntry` (Task 2) = `ActaEntry` + `opening`/`anchor`/`evidence`, which `index.ts` declares optional (Task 2 Step 1) and `AssEntry` narrows; `ActaSource.yearTo`/`summaFile`/`kind: 'ass'` (Task 5 Step 1) are what `scan-ass.ts` (Task 4) and the tests read; `applyAssReadings`/`emptyScan` (Task 5 Step 3) are what the join test (Task 5 Step 2) imports; `incipitAgrees`/`'opening'` (Task 5 Step 6) are what the match test asserts; `HoldReason 'series-not-created'` (Task 5 Step 7) is what the pins test (Task 6) filters; `curationKey` (Task 5 Step 4) keys `ASS:{vol}:{page}` as `ASS_READINGS` does.
