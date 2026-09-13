# The AAS index fixtures: the *Index generalis* PDFs of 2012 and 2015–2024, the sample volumes of 1909–1978, and the volumes of 1932–1957

The extracted text of the *Index documentorum chronologico ordine digestus* of the *Acta
Apostolicae Sedis*, one file per source, one page per form feed (`\f`), from two kinds of
source on vatican.va (`https://www.vatican.va/archive/aas/index_it.htm`, which
`tools/fetch-acta.sh` reads for every file name, since their case varies):

- the annual *Index generalis actorum* PDFs published separately from the monthly
  fascicles (`documents/{year}/aas-indice{year}.pdf`, 2015–2024; `documents/2012/AAS-indice2012.pdf`),
  extracted whole (`aas-indice-{year}.txt`);
- the whole-volume OCR PDFs of 1909–2002 (`documents/AAS-{vol}-{year}-ocr.pdf`; 1917 and
  1983 in two parts, `AAS-09-I-1917-ocr.pdf`), of which only the pages of the chronological
  index are extracted (`aas-{vol}-{year}[-{part}].txt`; acta volumes spec,
  `docs/superpowers/specs/2026-09-13-acta-volumes-design.md` §3) — the six sources of phase
  2b-i are the sample below, and the twenty-six volumes of 1932–1957 (AAS 24–49, Pius XI and
  Pius XII) are phase 2b-ii-a (spec §9); 1959–1977, 1979–2002 with the 2010–2014 index PDFs,
  and 1910–1931 follow in 2b-ii-b, 2b-ii-c and 2b-iii.

They are the input of the AAS join (acta reference spec, `docs/superpowers/specs/2026-09-12-acta-reference-design.md`
§4.1): `tools/src/acta/index.ts` parses the *Acta Summi Pontificis* parts, and `npm run
harvest` matches the entries to the documents and creates documents for the acts the shelves
lack. The PDFs are not checked in; `tools/fetch-acta.sh` downloads them to a scratch directory
and writes these files. `tools/src/acta/join.ts` (`ACTA_SOURCES`) lists every source with its
retrieval date and parser options; update it with this table.

| Source | File | RETRIEVED | Extractor | PDF pages extracted | Volume pages |
|---|---|---|---|---|---|
| 2015–2024 index PDFs | `aas-indice-{year}.txt` | **2026-09-12** | pypdf 6.14.2 (python3), default mode | whole: 2015: 96 · 2016: 72 · 2017: 88 · 2018: 96 · 2019: 96 · 2020: 64 · 2021: 80 · 2022: 88 · 2023: 88 · 2024: 96 | — |
| 2012 index PDF (`AAS-indice2012.pdf`) | `aas-indice-2012.txt` | **2026-09-13** | pypdf 6.14.2, default mode | whole: 64 | — |
| AAS 1 (1909) | `aas-01-1909.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 835–860 (26) | 908 |
| AAS 9 part I (1917) | `aas-09-1917-I.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 595–607 (13) | 639 |
| AAS 9 part II (1917) | — | — | — | **no chronological index**: the volume is the *Codex Iuris Canonici* (594 pages), with *Providentissima Mater Ecclesia* (27 May 1917, p. 5) before it and the Code's own index after | 594 |
| AAS 23 (1931) | `aas-23-1931.txt` | **2026-09-13** | pypdf 6.14.2, layout mode; p. 531 default mode | 531–540 (10) | 566 |
| AAS 24 (1932) | `aas-24-1932.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 419–430 (12) | 462 |
| AAS 25 (1933) | `aas-25-1933.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 515–526 (12) | 560 |
| AAS 26 (1934) | `aas-26-1934.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 655–665 (11) | 695 |
| AAS 27 (1935) | `aas-27-1935.txt` | **2026-09-13** | pypdf 6.14.2, layout mode (pypdf warns of rotated text on the volume; the index pages are complete) | 507–517 (11) | 558 |
| AAS 28 (1936) | `aas-28-1936.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 503–514 (12) | 546 |
| AAS 29 (1937) | `aas-29-1937.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 503–513 (11) | 551 |
| AAS 30 (1938) | `aas-30-1938.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 423–434 (12) | 471 |
| AAS 31 (1939) | `aas-31-1939.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 733–745 (13) | 800 |
| AAS 32 (1940) | `aas-32-1940.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 579–592 (14) | 650 |
| AAS 33 (1941) | `aas-33-1941.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 529–538 (10) | 566 |
| AAS 34 (1942) | `aas-34-1942.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 403–411 (9) | 441 |
| AAS 35 (1943) | `aas-35-1943.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 411–418 (8) | 509 |
| AAS 36 (1944) | `aas-36-1944.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 345–352 (8) | 380 |
| AAS 37 (1945) | `aas-37-1945.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 339–347 (9) | 384 |
| AAS 38 (1946) | `aas-38-1946.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 455–464 (10) | 610 |
| AAS 39 (1947) | `aas-39-1947.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 651–659 (9) | 700 |
| AAS 40 (1948) | `aas-40-1948.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 571–580 (10) | 618 |
| AAS 41 (1949) | `aas-41-1949.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 659–669 (11) | 722 |
| AAS 42 (1950) | `aas-42-1950.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 911–924 (14) | 980 |
| AAS 43 (1951) | `aas-43-1951.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 883–896 (14) | 938 |
| AAS 44 (1952) | `aas-44-1952.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 899–912 (14) | 947 |
| AAS 45 (1953) | `aas-45-1953.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 867–882 (16) | 923 |
| AAS 46 (1954) | `aas-46-1954.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 787–802 (16) | 839 |
| AAS 47 (1955) | `aas-47-1955.txt` | **2026-09-13** | pypdf 6.14.2, layout mode; p. 867 default mode | 867–880 (14) | 912 |
| AAS 48 (1956) | `aas-48-1956.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 859–872 (14) | 918 |
| AAS 49 (1957) | `aas-49-1957.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 1059–1073 (15) | 1112 |
| AAS 50 (1958) | `aas-50-1958.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 1032–1047 (16) | 1130 |
| AAS 70 (1978) | `aas-70-1978.txt` | **2026-09-13** | pypdf 6.14.2, layout mode | 1008–1017 (10) | 1130 |

No source was missing on its retrieval date, and every volume of 1932–1957 has a chronological
index. Every index has the same three parts (the general index by category, the
chronological index, the indexes of names), so no source differs in shape at that level; the
shapes that differ *inside* the chronological index are listed below, and each is handled by
the parser and covered by a unit test. Three volumes needed the index locator extended
(`fetch-acta.sh`, measured): the OCR reads the heading's initial as `Í` (AAS 25 (1933) `ÍNDEX
DOCUMENTORUM`; AAS 32 (1940) `ÍNDICES NOMINUM`, which the first extraction ran past, into the
index of names), AAS 46 (1954) sets a full stop after it (`INDEX. DOCUMENTORUM`), and pypdf's
default mode drops the heading of AAS 25's first index page altogether, so the script
searches the layout mode when the default finds nothing.

## The volumes: what the `-ocr.pdf` files are, and the two extraction modes

The whole-volume PDFs carry **no page images**: each is typeset from the OCR text in Times
(`AAS-09-I-1917-ocr.pdf`: fonts Times-Roman, Times-Bold, Times-Italic; no image objects on any
page checked). Their rendering is therefore the text layer's, errors included — *Nihil est
A'obis antiquius*, a `1910` that can only be 1916 under Benedict XV, page numbers absent where
the OCR lost them — and nothing in the file can be checked against a scan. What the parser
reads is the document.

Two facts of that text layer decided the extraction (acta volumes spec §3; the parser's
header comment records the shapes):

- **pypdf's default mode breaks the date columns.** From 1909 to 1931 the index prints the
  date in three columns (`ANNO MENSE DIE`) beside the entry, and the default mode emits each
  column as a run of its own — every month of the page, then every day, then the entries —
  so no entry can be dated. The **layout mode** (`extract_text(extraction_mode='layout')`)
  keeps each date on the line of its entry, with positional padding the parser ignores, and
  is used for every volume page.
- **The layout mode interleaves a page whose OCR line boxes overlap.** On AAS 23 p. 531 (the
  1931 encyclicals, the spec's "run-together" page) it sets two entries' words on one line
  and lands the page numbers on the wrong entries; `fetch-acta.sh` detects such a page (a
  line with prose on both sides of a wide gap, ending in a word) and extracts it in the
  default mode instead, where the four entries run together on one line but in order, each
  page number before the next date, and the parser splits them there. Only p. 531 needed it
  in the sample; the script prints the pages it falls back on.
- **The page column is lost on most index pages of AAS 1 and AAS 9-I.** The rendering shows
  none (two page numbers at the foot of p. 839 of vol. 1, none above them), so the entries of
  those pages are parsed to their dates and text and reported without a page (sample report
  §1, §3); nothing is cited without a page. The parse rates of 1909 (7 %) and 1917-I (90 %)
  are this finding, explained in the sample report, not fixtures used silently.

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

## Shapes inside the index PDFs' chronological index, 2012–2024 (what the parser handles)

- **Date layout.** Day-first from 2017 (`5 Dec. 2022`, then `30 Sep. »`, `» » »`);
  year-first in 2012, 2015 and 2016 (`2014 Dec. 20`, then `» » 22`, `» Nov. 6`). The `»` ditto
  inherits the previous entry's value. Month abbreviations: `Ian. Feb./Febr. Mar./Mart. Apr.
  Maii Iun. Iul. Aug. Sep./Sept. Oct. Nov. Dec.`, with or without the full stop; the 2017
  index once prints the year as `2017.`.
- **Title page.** `(An. 2023 et Vol. CXV)` from 2017; 2012, 2015 and 2016 print `(An. et vol.
  CvII)` — no year, and the volume numeral in mixed case.
- **Part headings.** `I – ACTA FRANCISCI PP.` opens the pope's part (`I – ACTA BENEDICTI XVI`
  in 2012); the 2020 index adds
  `II – ACTA BENEDICTI XVI` (two beatification letters of 2010–2011), and the 2018 index
  prints two of Benedict XVI's acts inside Francis's part with the original date in
  brackets (`11 Maii 2018 [2010 Sept. 19] « Admodum fideli »`, `[Benedictus XVI: 2010 Apr.
  25]`). The dicasterial parts are headed `II – ACTA SYNODI EPISCOPORUM`, `IV. – ACTA
  CONGREGATIONUM` (with a full stop after the numeral, 2016–2018) or, for 2018's
  `DIARIUM ROMANAE CURIAE`, with no numeral at all.
- **Category headings.** All capitals, usually numbered; a two-line heading (`XV – ITINERA
  APOSTOLICA, VISITATIONES PASTORALES,` / `VISITATIONES, PEREGRINATIONES, ITINERA`) and an
  unnumbered one (Benedict XVI's `LITTERAE APOSTOLICAE`) both occur, and 2012 sets a heading's
  words in guillemets (`III – LITTERAE APOSTOLICAE «MOTU PROPRIO» DATAE`). The set of categories
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
  report: a 2018 constitution with no day printed (`  Sept. » Chengden.:` — since phase 2b a
  month-only entry, never created, and its month still governs the ditto marks of the
  entries after it, which are September, not May), a 2024 constitution with no page (`ioinVillen.`), an OCR-split page
  (`76 4`), ditto marks read as `? ?`, a page glued to a footnote digit (`14206`), and two
  acts entered under the wrong month (*Vultum Dei quaerere* by a ditto mark, *De concordia
  inter Codices* by `Mart.` for `Maii`), corrected by `tools/src/acta/curation.ts` with the
  acts' own dating formulae quoted.
- **Earlier pontificates.** An act of Benedict XVI printed in these volumes carries its
  own date, and usually its pope, in brackets before the incipit, in two layouts:
  `[Benedictus XVI: 2010 Apr. 25]` (2018) and `[Benedictus PP. XVI: 6 Iun. 2010]` (2020,
  2021); `[2010 Sept. 19]` (2018, Newman) names no pope and stays under Francis's part,
  where the creator holds it by its date.

## Shapes inside the volumes' chronological index (1909–1978, and 1932–1957)

- **Date layout.** Year-first in three columns (`1931 Maii 15`, `1917       Iun.      15`); a
  `»` is a ditto, and in the columnar layout of 1909–1931 a **blank** column is one too — a
  blank year or month inherits, a blank day under a blank month is the previous entry's day,
  and a **printed month with a blank day** is an act the index dates to the month only
  (`1917 Iul. Universalis Ecclesiae procuratio`; `1909 Febr. Plenaria indulgentia`), kept
  with a month-precision date, matched by incipit within the month and never created. An
  entry whose three columns are all blank is told from a continuation line by its column
  (the median text column of the page's dated entries). Month spellings: `Ian.`, `Febr.`,
  `Mart.`/`Martii`, `Apr.`/`April.`, `Maii`/`Mai.`, `Iun.`/`Iunii`, `Iul.`/`Iulii`, `Aug.`,
  `Sept.`, `Oct.`, `Nov.`, `Dec.` and the full forms. OCR noise between the tokens (`1978
  Ian. - 3`, `» . » 8`, `», » »`) is dropped; an OCR word where the day stands (`» Maii la`,
  `Aug. ii`, `» Iunii Jl 29`) reads as an unreadable day unless a day follows it; a day out
  of range (`» Mai. 80`) reads month-only and is reported; a year before the pontificate
  (`1910` for 1916 in 1917-I) is held by the creator.
- **Title page.** None: the fixture starts at the index's own title (`INDEX DOCUMENTORUM /
  CHRONOLOGICO ORDINE DIGESTUS`), and the volume and part come from `ACTA_SOURCES`.
- **Part headings.** Latin genitive: `I. — ACTA PII PP. X.` (1909), `I. - ACTA BENEDICTI PP.
  XV`, `I. - ACTA PII PP. XI`, `I - ACTA PII PP. XII` and `IV - ACTA IOANNIS PP. XXIII`
  (1958, with `II - ACTA IN MORTE PII PP. XII` and `III - ACTA CONCLAVIS` between them,
  skipped), `I - ACTA PAULI PP. VI`, `II - ACTA IOANNIS PAULI PP. I`, `III - ACTA IOANNIS
  PAULI PP. II` (1978), `I – ACTA BENEDICTI XVI` (2012); `tools/src/acta/popes.ts` maps them.
  1917's `IX. - ACTA SACRI CONSISTORII.` is a category, not a part.
- **Category headings.** Numbered `I. - …` with a trailing full stop (1909, 1917), `I - …`
  (1958, 1978); the OCR spellings `CHIROGRAPHE`, `BELLIOERANTIUM`; two-line headings whose
  second line is a subtitle (`I. - LITTERAE ENCYCLICAE` / `DE PRAEDICATIONE DIVINI VERBI.`)
  or part of the heading (`VIII. - ADHORTATIO` / `AD POPULORUM BELLIGERANTIUM MODERATORES.`).
  `tools/src/acta/categories.ts` lists every heading seen with the volume it was seen in.
- **Running headers.** `836 Index documentorum` / `chronologico ordine digestus. 837` at the
  top of each page; the layout mode sometimes glues one to the end of a line
  (`… Coloniensem,536   Index documentorum`) or breaks it across a form feed (`Index
  documentor` / `um chronologico …`); column headers (`ANNO MENSE DIE`, `PAG.`) recur per page.
- **Entries.** Ended by the page number after leaders, two spaces, or — in the layout mode —
  one space (`riae Virginis Caelo receptae 449`), sometimes on a line of its own (1978's
  homilies), sometimes with a trailing full stop (`278.`); a page with a leading zero (`030`
  for 930, AAS 50 p. 1035) is an OCR misreading and is reported, not cited; the layout mode
  repeats the date at the top of a page where an entry runs on (`» Dec. 16 URAWAËNSIS …
  Urawaën-` / `1957 Dec. 16 sis, in Iaponia …`). A soft hyphen (U+00AD) ends a broken word.
- **Incipits.** `Incipit. - Description` from 1917 to 1978 (`Humani generis redemptionem. -
  Ad Patriarchas …`; 1931's descriptions can open with a toponym and a colon, `Sollicitudo.
  - Goyasen.: de dioecesis …`). **1909 prints no bare incipits**: an incipit only in
  guillemets after a genre word (`Constitutio « Sapienti Consilio »`, `Litt. encycl.
  « Communium rerum »`), every other act by description, so the fixture is parsed with
  `bareIncipits: false`.
- **Toponyms.** In capitals with the vernacular in parentheses, then the incipit:
  `SANTAREMENSIS (Obidensis). Cum sit. -` (1958), `BOACENSIS. - Cum tempora.` (1978),
  `CORUMBENSIS - REGISTRENSIS (Campi Grandis - Auratopolitanae). Inter gravissima. -`,
  `OLOMUCENSIS et Aliarum. -`; both toponym and incipit are read.
- **The 1909 table of contents.** *Sapienti Consilio*'s entry is followed by the
  constitution's own contents (`1.° Congregatio Sancti Officii`, `II. - TRIBUNALIA.`, `LEX
  PROPRIA.`, `» » » CAP. IV. - De horis … 41`), consumed as sub-items
  (`NESTED_TOC_HEADINGS` in the parser lists the capitalised division titles).
- **Source defects the text cannot repair**, reported and listed in the sample report: the
  lost page column of 1909 and 1917-I; `1910` for 1916; `B (IARENSIS` for *Buarensis*
  (held as OCR-damaged); `Tempia Dei` for *Templa Dei* (ambiguous against the shelf's);
  an act printed in two volumes (*Ibi vacabimus*, AAS 104 (2012) 482 and AAS 112 (2020)
  479, held by the id-collision rule); and two short letters opening on one page (AAS 70
  (1978) 150, `ACTA_SHARED_PAGES` in `curation.ts`, which invariant 25 honours).

### The volumes of 1932–1957 (phase 2b-ii-a)

The page column survives on every index page of AAS 24–49; what the OCR loses is a token here
and there, and the parser reads through each loss it can measure (`index.ts` names the volume
for every one; the report `docs/superpowers/reports/2026-09-13-acta-volumes-1932-1957.md`
lists what it could not read):

- **Pope headings** in OCR spellings: `L - ACTA PII PP. XI` (1935, 1937), `1 - ACTA PII PP.
  XII` (1940), `I - ACTA Pii PP. XII` (1941), `I - ACTA PII PP. Xll` (1949); the dicasteries'
  part as `IL -` and `U - ACTA SS. CONGREGATIONUM`.
- **Category headings**: the numeral as `IY.`, `XJV`, `i.`, `1`, `I r-`, `XI •-`; one heading in
  mixed case (`XIV - Sacra Consistoria`, 1954); OCR spellings listed in `categories.ts`
  (`LITTEEAE APOSTOLICAE`, `BPISTTJLAE`, `MOTTI PROPRIO`, `SACKA CONSISTORIA` …); the column
  header as `PAO.`, `PAS.`, `PAß.`, `PA6.`, `PAe`, `PV(J.`, `PAG..`; an act printed before the
  first category heading (1933's bull of indiction), reported.
- **Dates**: the ditto as `»>`, `>>`, `))`, `.)`, `y>`, `«` (only where a date token follows)
  or a lone letter (`» h 3`, `» D »`); junk stuck to a token (`.16`, `20\`, `.Martii`, `Nov,.`,
  `1950 Ian. • 14`, `1947 Oct. ; 20`); a doubled token (`» Apr. Apr. 1`); the months `Man`,
  `Mah` (*Maii*, verified against the act at AAS 25 p. 28), `Marth`, `Innii`, `Apri`, `Âpr`,
  `Ott`, `Noy`, `NOT`, `ÏTov`, `Doc`, each accepted only where a day follows, and any other
  word there an unreadable month that the ditto chain does not inherit; the years `1047`,
  `1048`, `3950` (read as the volume span's year one digit off, and noted on the entry, which
  the creator holds), `i944`, `i 945`, `19.49`; a year the index does not print -- a ditto in
  the year column with nothing above it (the head of AAS 42, 1950), a token the OCR has broken
  (`19 IS`, `19Ö4`, `1ÍS50`, `3918`) -- dates the entry `????-MM-DD`, inherited by the dittos
  after it, and only a curated correction quoting the act supplies the year; a year inside the
  century is never repaired (`1919` for 1949, `1930` for 1936: curated corrections quoting the
  acts). A date the layout
  mode set beside the last line of the entry before goes to the blank-dated entry after it
  (1935); a blank-dated entry can keep the page's hanging indent while dated entries' text
  sits after the date (1941), and on a page whose entries open `Incipit. - …` a capitalised
  continuation line at the entry column is not an entry (1955); a blank-dated entry that
  dates itself in its description (`… datus, die 16 mensis Aprilis, anno 1939`, the radio
  messages of 1939) takes that date.
- **Entries**: a page glued to a leader dot (`.154`) or followed by junk (`47'`, `226 ,`,
  `549-`); a page fused with a glued running header's (`33788`, reported without a page);
  letters to several addressees of up to sixteen lines; the translations listed under an act
  (`E textu latino versio anglica 645`, `lingua gallica … 205`), consumed as sub-items and
  left out of the parse rate; the lists under one act with a page per item (the Academy's
  members, 1936; the Assumption ceremony, 1950), reported; an encyclical indexed twice, the
  vernacular text at its own page (1933, 1937), held by curated rows.
- **Incipits and toponyms**: the dash without its spaces (`Quae rei sacrae.-Fines`), a doubled
  full stop (`Ad pastorale ministerium..-De`), a stray mark before the incipit (`.Mirabilis
  Deus`); a mixed-case toponym with the vernacular in parentheses and no incipit (`De Sienhsien
  (De Kinghsien). - Vicariatus …`, 1939–1945), read as a toponym, or with an incipit after it
  (`Aleppensis (Berytensis). Solent caeli. -`, 1954).
- **Pages two acts cite**: two short letters on one page (AAS 24 (1932) 39, AAS 26 (1934) 19,
  AAS 28 (1936) 102, AAS 45 (1953) 91 -- each read in the volume and curated in
  `ACTA_SHARED_PAGES`), and a page the OCR misread onto another act's (AAS 42 (1950) 37 and 42,
  AAS 43 (1951) 660, AAS 46 (1954) 753, AAS 49 (1957) 825, AAS 45 (1953) 782), which the
  creator holds (`page-shared`).

The RETRIEVED dates above are also stamped as `source.retrieved` on every document created
from these fixtures (`ACTA_SOURCES` in `tools/src/acta/join.ts`): update both together when
a fixture is refreshed.
