# The AAS *Index generalis* fixtures, 2015–2024

The extracted text of the ten annual *Index generalis actorum* PDFs of the *Acta Apostolicae
Sedis* that vatican.va publishes separately from the monthly fascicles
(`https://www.vatican.va/archive/aas/documents/{year}/aas-indice{year}.pdf`), one file per
year, one page per form feed (`\f`). They are the input of the AAS join (acta reference spec,
`docs/superpowers/specs/2026-09-12-acta-reference-design.md` §4.1): `tools/src/acta/index.ts`
parses the *Acta Summi Pontificis* part of each *Index documentorum chronologico ordine
digestus*, and `npm run harvest` matches the entries to the documents. The PDFs are not
checked in; `tools/fetch-acta.sh` downloads them to a scratch directory and writes these files.

| | RETRIEVED | Extractor | Pages |
|---|---|---|---|
| all ten | **2026-09-12** | pypdf 6.14.2 (python3), via `tools/fetch-acta.sh` | 2015: 96 · 2016: 72 · 2017: 88 · 2018: 96 · 2019: 96 · 2020: 64 · 2021: 80 · 2022: 88 · 2023: 88 · 2024: 96 |

No year was missing on 2026-09-12. Every year's index has the same three parts (the general
index by category, the chronological index, the indexes of names), so no year differs in
shape at that level; the shapes that differ *inside* the chronological index are listed
below, and each is handled by the parser and covered by a unit test.

## Extractor: pypdf, and why not pdfjs-dist

The spec leaves the choice between `pdfjs-dist` (Node, one toolchain) and `pypdf` (Python,
already known to work) to a comparison on the 2023 index: whichever keeps entries on their own
lines with the dot-leader/page structure intact. Both were run on `aas-indice2023.pdf`
(88 pages) on 2026-09-12 — pdfjs-dist 4.10.38 through `getTextContent()` with a newline on
every `hasEOL` item, pypdf 6.14.2 through `extract_text()` — and the *Index documentorum
chronologico ordine digestus* (1,019 lines in both) compared line by line after collapsing
whitespace and normalising the leaders:

- **Both** keep every entry on its own line, keep the dot leaders and end each entry with
  its page number; both render the running headers as a line of their own at the top of
  each page. Neither produces OCR noise: the text layer is typeset, not recognised.
- **150 line pairs differ.** 110 are pypdf printing a space before a line-end hyphen
  (`cele -` / `brandum`, where pdfjs prints `cele-`); 15 are pdfjs **splitting the initial
  of a small-caps toponym** (`V uCArien.:`, `A gulerien.:`, `C uneen . – fossAnen.:`, where
  pypdf prints `VuCArien.:`, `Agulerien.:`, `Cuneen. – fossAnen.:`); 5 are pypdf printing a
  space before punctuation (`Communione ,`, `Wyszyn ´ski`); the rest are pdfjs dropping the
  full stop after a closing guillemet (`« Vos estis lux mundi » … 394` for `». …`).
- **pypdf is the choice.** Its one systematic artefact is mechanical to undo (`joinLines` in
  the parser rejoins a word broken at the line end whichever way the hyphen is spaced),
  whereas pdfjs's split initial corrupts exactly the field the constitution matcher reads —
  the toponym — in a way that cannot be undone without guessing. The cost is a Python
  dependency in the fetch script only; nothing at harvest or test time reads a PDF.

## Shapes inside the chronological index (what the parser handles)

- **Date layout.** Day-first from 2017 (`5 Dec. 2022`, then `30 Sep. »`, `» » »`);
  year-first in 2015 and 2016 (`2014 Dec. 20`, then `» » 22`, `» Nov. 6`). The `»` ditto
  inherits the previous entry's value. Month abbreviations: `Ian. Feb./Febr. Mar./Mart. Apr.
  Maii Iun. Iul. Aug. Sep./Sept. Oct. Nov. Dec.`, with or without the full stop; the 2017
  index once prints the year as `2017.`.
- **Title page.** `(An. 2023 et Vol. CXV)` from 2017; 2015 and 2016 print `(An. et vol.
  CvII)` — no year, and the volume numeral in mixed case.
- **Part headings.** `I – ACTA FRANCISCI PP.` opens the pope's part; the 2020 index adds
  `II – ACTA BENEDICTI XVI` (two beatification letters of 2010–2011), and the 2018 index
  prints two of Benedict XVI's acts inside Francis's part with the original date in
  brackets (`11 Maii 2018 [2010 Sept. 19] « Admodum fideli »`, `[Benedictus XVI: 2010 Apr.
  25]`). The dicasterial parts are headed `II – ACTA SYNODI EPISCOPORUM`, `IV. – ACTA
  CONGREGATIONUM` (with a full stop after the numeral, 2016–2018) or, for 2018's
  `DIARIUM ROMANAE CURIAE`, with no numeral at all.
- **Category headings.** All capitals, usually numbered; a two-line heading (`XV – ITINERA
  APOSTOLICA, VISITATIONES PASTORALES,` / `VISITATIONES, PEREGRINATIONES, ITINERA`) and an
  unnumbered one (Benedict XVI's `LITTERAE APOSTOLICAE`) both occur. The set of categories
  and their order vary by year; `tools/src/acta/categories.ts` lists every heading seen.
- **Entries.** Multi-line, ended by dot leaders (once an ellipsis) or two spaces and the
  page; on a full line, one space and the page (`… Erbil (Iraquia) 82`). A running header
  (`1468 Acta Apostolicæ Sedis – Commentarium Officiale`, `Index documentorum chronologico
  ordine digestus 1469`) is always the first line of a page and can interrupt an entry;
  pypdf sometimes glues it to the previous page's last line, with only the form feed
  between (`1150\f1276 Acta …`).
- **Incipits.** In guillemets (`« Chi è fedele ».`) or bare (`Ius nativum.`), ended by a full
  stop, a colon (2015's constitutions: `Contemplationi faventes:`) or a double space
  (`While we walk  Ad Episcopos Nigeriae`). Constitutions from 2017 print a small-caps
  toponym instead, which the text layer renders in mixed case (`VuCArien.:`,
  `de sAnCto petro sulA:`, `Cuneen. – fossAnen.:`, `tigren.`).
- **Source defects** the text cannot repair, reported by the parser and listed in the join
  report: a 2018 constitution with no day printed (`  Sept. » Chengden.:` — the line is a
  defect, but its month still governs the ditto marks of the entries after it, which are
  September, not May), a 2024 constitution with no page (`ioinVillen.`), an OCR-split page
  (`76 4`), ditto marks read as `? ?`, a page glued to a footnote digit (`14206`), and two
  acts entered under the wrong month (*Vultum Dei quaerere* by a ditto mark, *De concordia
  inter Codices* by `Mart.` for `Maii`), corrected by `tools/src/acta/curation.ts` with the
  acts' own dating formulae quoted.
- **Earlier pontificates.** An act of Benedict XVI printed in these volumes carries its
  own date, and usually its pope, in brackets before the incipit, in two layouts:
  `[Benedictus XVI: 2010 Apr. 25]` (2018) and `[Benedictus PP. XVI: 6 Iun. 2010]` (2020,
  2021); `[2010 Sept. 19]` (2018, Newman) names no pope and stays under Francis's part,
  where the creator holds it by its date.

The RETRIEVED date above is also stamped as `source.retrieved` on every document created
from these fixtures (`ACTA_FIXTURES_RETRIEVED` in `tools/src/acta/join.ts`): update both
together when the fixtures are refreshed.
