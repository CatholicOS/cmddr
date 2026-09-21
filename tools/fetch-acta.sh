#!/usr/bin/env bash
# Fetch the *Acta Apostolicae Sedis* index sources and extract their text into
# tools/fixtures/acta/ (acta reference spec §4.1; acta volumes spec §3).
#
# Two kinds of source, both read off the AAS index page
# (https://www.vatican.va/archive/aas/index_it.htm) rather than guessed, since the file
# names vary in case (`aas-indice2015.pdf`, `AAS-indice2012.pdf`, `AAS-INDICE2010.pdf`):
#
# - an annual *Index generalis* PDF (2003-2024): extracted whole, one page per form feed,
#   to aas-indice-{year}.txt; 2003-2009 in the layout mode with spaces collapsed (extract_whole_collapsed);
# - a whole-volume OCR PDF (1909-2002; 1917 and 1983 in two parts, `AAS-09-I-1917-ocr.pdf`
#   and `AAS-75-1983-I-ocr.pdf` -- the part before the year in one, after it in the other): the pages of the
#   *Index documentorum chronologico ordine digestus* are located -- the first by its
#   heading, the last by the next top-level index heading (*Indices nominum*, *Index
#   analyticus*, *Index rerum*, *Index alphabeticus*) -- and only those pages are
#   extracted, to aas-{vol}-{year}[-{part}].txt. The script prints the page range and the
#   volume's page count for the README row.
#
# The PDFs are kept in a local store outside the repository -- ~/development/sources/AAS/pdf
# by default, ACTA_SOURCES to point elsewhere -- named as on vatican.va, and a PDF already in
# the store is not downloaded again (the volumes are 2-6 MB each and vatican.va serves them
# slowly); they are never checked in. The extracted text is, so the parser
# (tools/src/acta/index.ts) and its tests run offline and deterministically. Extraction is by pypdf -- chosen over pdfjs-dist on the 2023 index,
# see tools/fixtures/acta/README.md -- in its default mode for the born-digital index
# PDFs and in `layout` mode for the OCR'd volumes, whose text layer carries the date in
# three columns (ANNO MENSE DIE) beside the entry: the default mode emits each column as
# a run of its own (every month of the page, then every day, then the entries), and only
# the layout mode keeps a date on the line of its entry (README, measured on 1909, 1917
# and 1931) -- except where the layout mode interleaves or fuses a page's lines, which is
# detected per page and falls back to the default mode (extract_index_pages below; most
# pages of eight volumes of 1959-1977). Each page becomes one page of the fixture,
# separated by a form feed (\f).
#
# After running this, update the README's rows and ACTA_SOURCES in tools/src/acta/join.ts
# (retrieval date) and re-run `npm run harvest && npm run render`. The matched and created
# counts pinned in tools/test/harvest-data.test.ts move with the fixtures.
#
# Requires: curl, python3 with pypdf (`pip install pypdf`; measured with pypdf 6.14.2).
#
# Usage: tools/fetch-acta.sh                 # the ten index PDFs, 2015-2024
#        tools/fetch-acta.sh 2023            # one index year (2003-2024; 2003-2009 by the hyphenated URL, layout mode with spaces collapsed -- spec §11.1)
#        tools/fetch-acta.sh 2003-2009       # the seven index PDFs of phase 2b' (spec §11)
#        tools/fetch-acta.sh 1958            # one volume (1909-2002); 1917 and 1983 fetch both parts
#        tools/fetch-acta.sh sample          # the six sources of phase 2b-i: 1909 1917 1931 1958 1978 2012
#        tools/fetch-acta.sh 1932-1957       # a range of volumes (phase 2b-ii-a: AAS 24-49; 1959-1977 is phase 2b-ii-b, AAS 51-69;
#                                            # 1979-2002 with the index PDFs 2010, 2011, 2013 and 2014 is phase 2b-ii-c, AAS 71-94)
#        tools/fetch-acta.sh 1909-1925       # a range of volumes (phase 2b-iii-b: AAS 1-17, the lost page column, spec §10)
#        tools/fetch-acta.sh text 1921       # the whole text of a volume to <store>/txt/ (phase 2b-iii-b's recovery input)
#        tools/fetch-acta.sh text 1909-1925  # the same for a range
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p tools/fixtures/acta

STORE="${ACTA_SOURCES:-$HOME/development/sources/AAS}/pdf"
mkdir -p "$STORE"
BASE='https://www.vatican.va/archive/aas'

# The index page, fetched once per run (it is small, and it is where the file names come
# from): the source of every file name below.
INDEX_HTML="$STORE/index_it.htm"
curl -fsSL --retry 3 --max-time 60 "$BASE/index_it.htm" -o "$INDEX_HTML"

# Download a PDF into the store unless it is already there and non-empty. Prints the
# path fetched or `cached`; returns non-zero when the download fails. The download goes
# to a `.part` file that is renamed only once curl has succeeded, so a transfer that
# dies half-way (vatican.va is slow; --max-time is finite) leaves nothing the next run
# would take for a cached volume.
fetch_pdf() { # fetch_pdf <path-on-vatican.va> <local-pdf> <max-time>
  if [ -s "$2" ]; then echo "    cached: $2"; return 0; fi
  local part="$2.part"
  if curl -fsSL --retry 3 --max-time "$3" "$BASE/$1" -o "$part"; then
    mv -f "$part" "$2"
  else
    rm -f "$part"
    return 1
  fi
}

# The `documents/...` paths the index page links for a year, one per line.
links_for() { # links_for <year>
  grep -oiE "documents/([0-9]{4}/)?aas-(indice)?[0-9I-]*$1[^\"']*\.pdf" "$INDEX_HTML" | sort -u
}

# The index page links an *Index generalis* PDF for each of 2003-2009 (`AAS 95` ...
# `AAS 101`) under paths the server does not resolve -- `documents/AAS-Index%202002-2009/
# AAS-Index%202005.pdf` (2004-2007, the spaces encoded; 404) and `documents/AAS-Index-2002-
# 2009-AAS-Index-2003.pdf` (2003, the folder folded into the file name; 404) -- while the
# form the 2008 and 2009 links take, `documents/AAS-Index-2002-2009/AAS-Index-{year}.pdf`,
# serves all seven (measured 2026-09-21; acta volumes spec §11.1). The link is read off the
# page as ever and normalised to that form; the README row records both.
index_path_for_0309() { # index_path_for_0309 <year>  -> "<as-linked>|<fetched>"
  local linked
  linked="$(grep -oiE "documents/[^\"']*AAS-Index[^\"']*$1\.pdf" "$INDEX_HTML" | sort -u | head -n1 || true)"
  [ -z "$linked" ] && return 0
  local fetched
  fetched="$(printf '%s' "$linked" | sed -E 's/%20/-/g; s#AAS-Index-2002-2009-AAS-Index-#AAS-Index-2002-2009/AAS-Index-#')"
  printf '%s|%s\n' "$linked" "$fetched"
}

# The text layer of the 2003-2006 index PDFs drops the spaces between words in pypdf's
# default mode (`I—ACTAIOANNISPAULIPP.II`, `honoresdecernuntur`, a page as `4 3 3`), and
# 2005, 2008 and 2009 fuse the volume heading (`An.etvol.C 31Decembris2008`); `space_width`
# changes nothing (measured at 200, 100, 50, 20). The layout mode keeps every space and
# adds the column gaps these PDFs do not have, so each run of two or more spaces is
# collapsed to one and each line trimmed (spec §11.1). One page per form feed, as ever.
extract_whole_collapsed() { # extract_whole_collapsed <pdf> <out>
  python3 - "$1" "$2" <<'EOF'
import re, sys
from pypdf import PdfReader
pdf, out = sys.argv[1], sys.argv[2]
pages = [(p.extract_text(extraction_mode='layout') or '') for p in PdfReader(pdf).pages]
pages = ['\n'.join(re.sub(r' {2,}', ' ', line).strip() for line in page.split('\n')) for page in pages]
with open(out, 'w', encoding='utf-8') as f:
    f.write('\f'.join(pages))
    f.write('\n')
print(f'    {len(pages)} pages -> {out} (layout mode, spaces collapsed)')
EOF
}

extract_whole() { # extract_whole <pdf> <out>
  python3 - "$1" "$2" <<'EOF'
import sys
from pypdf import PdfReader
pdf, out = sys.argv[1], sys.argv[2]
pages = [p.extract_text() for p in PdfReader(pdf).pages]
with open(out, 'w', encoding='utf-8') as f:
    f.write('\f'.join(pages))
    f.write('\n')
print(f'    {len(pages)} pages -> {out}')
EOF
}

# Locate the chronological index inside a volume and extract only its pages, in layout
# mode. The first page is the one whose text carries the heading INDEX DOCUMENTORUM /
# CHRONOLOGICO ORDINE DIGESTUS in capitals (the running header of the following pages is
# in lower case); the last is the page before the next top-level index heading, in
# capitals, at the head of a page. Both are searched from the volume's midpoint, since
# the indexes sit in the tail. Trailing blank pages are dropped.
extract_index_pages() { # extract_index_pages <pdf> <out>
  python3 - "$1" "$2" <<'EOF'
import re, sys
from pypdf import PdfReader
pdf, out = sys.argv[1], sys.argv[2]
reader = PdfReader(pdf)
n = len(reader.pages)
# The OCR reads the heading's initial as `Í` (AAS 25, 1933; AAS 32, 1940: `ÍNDICES NOMINUM`) and
# once sets a full stop after it (AAS 46, 1954: `INDEX. DOCUMENTORUM`), measured on the volumes
# of 1932-1957; both spellings are admitted, and nothing looser.
START = re.compile(r'[IÍ]NDEX\.?\s+DOCUMENTORUM[\s\S]{0,40}CHRONOLOGIC\w*\s+ORDINE\s+DIGEST\w*')
# AAS 17 (1925): the OCR reads the title's first line as `II` and keeps only its second,
# so the heading is also admitted as CHRONOLOGICO ORDINE DIGESTUS alone in capitals at the
# head of a page (the running header of the following pages is in lower case), and
# nothing looser.
START_ALONE = re.compile(r'^[\s\S]{0,40}CHRONOLOGIC\w*\s+ORDINE\s+DIGEST\w*')
END = re.compile(r'^[\s\S]{0,120}?([IÍ]NDICES\s+NOMINUM|[IÍ]NDEX\s+NOMINUM|[IÍ]NDEX\s+ANALYTICUS|[IÍ]NDEX\s+RERUM|[IÍ]NDEX\s+ALPHABETICUS)')
texts = {}
def text(i):
    if i not in texts:
        texts[i] = reader.pages[i].extract_text() or ''
    return texts[i]
start = next((i for i in range(n // 2, n) if START.search(text(i))), None)
if start is None:
    # AAS 25 (1933): the default mode drops the heading of the index's first page altogether
    # (the page's text opens at the pope part); the layout mode keeps it. A second pass in
    # that mode, only when the first finds nothing.
    start = next((i for i in range(n // 2, n) if START.search(reader.pages[i].extract_text(extraction_mode='layout') or '')), None)
if start is None:
    start = next((i for i in range(n // 2, n) if START_ALONE.search(text(i))), None)
if start is None:
    print(f'    NO CHRONOLOGICAL INDEX FOUND in {pdf} ({n} pages)', file=sys.stderr)
    sys.exit(0)
end = next((i for i in range(start + 1, n) if END.search(text(i))), n)
while end - 1 > start and text(end - 1).strip() == '':
    end -= 1
# Layout mode keeps a date on the line of its entry, but where the OCR's line boxes
# overlap (AAS 23 p. 531: the entries run together) it interleaves two entries' words
# on one line and the page numbers land on the wrong entries; such a page shows a line
# with text on both sides of a wide gap that ends in a word rather than a page number
# (a running header or column header excepted; the gap must follow two words of text,
# since a date's own columns are separated by such gaps). That page is extracted in the
# default mode instead, where the entries run together on one line but in order, with
# each page number before the next date -- the parser splits them there.
INTERLEAVED = re.compile(r'[A-Za-z]{2,},? [A-Za-z]{2,}[,.]? {12,}[A-Za-z]')
# The volumes of 1959-1977 (AAS 51-69) interleave differently: the layout mode fuses two
# physical lines into one with no gap between them, and the seam is a word the OCR broke
# at the line end (its soft hyphen, U+00AD) followed at once by the next line's text --
# `Basilicae Mino\u00adris evehitur ecclesia cathedralis`, `privile\u00adin Caelum Assumptae sacra 76`
# (AAS 52 (1960) 1035), so that continuation lines and page numbers land on the wrong
# entries. Measured over every fixture: 25-70 such seams per volume in eight volumes of
# 1959-1977 (AAS 52, 54-58, 60, 68), 0-4 per volume before 1959 and none after 1968 --
# and in this era the default mode keeps each date on the line of its entry (the same
# count of date-headed lines as the layout mode, measured page by page), where in
# 1909-1957 it emits the date columns as runs of their own. A page with a seam is
# therefore extracted in the default mode only when that mode keeps at least as many
# date-headed lines as the layout mode did: AAS 54 (1962) 894 and 901, where the default
# mode breaks the columns (0 and 8 date lines against 18 and 19), stay in the layout mode
# and are reported by the parser for what they are.
FUSED = re.compile('\u00ad\\S')
DATE_LINE = re.compile(r'^\s*(?:\d{4}|[»>)]{1,2})\s+(?:[A-Za-zÀ-ÿ]{3,10}\.?|[»>)]{1,2})\s+(?:\d{1,2}|[»>)]{1,2})\s+\S')
def date_lines(page_text):
    return sum(1 for line in page_text.split('\n') if DATE_LINE.match(line))
def interleaved(page_text, default_text):
    for line in page_text.split('\n')[1:]:
        if not INTERLEAVED.search(line) or re.search(r'\d\s*$', line): continue
        if 'Index documentorum' in line or re.match(r'\s*(ANNO|MENSE|DIE|PAG)', line): continue
        return True
    if FUSED.search(page_text) and date_lines(default_text) >= date_lines(page_text):
        return True
    return False
pages, fallback = [], []
for i in range(start, end):
    layout = reader.pages[i].extract_text(extraction_mode='layout') or ''
    default = reader.pages[i].extract_text() or ''
    if interleaved(layout, default):
        fallback.append(i + 1)
        layout = default
    pages.append(layout)
with open(out, 'w', encoding='utf-8') as f:
    f.write('\f'.join(pages))
    f.write('\n')
note = f'; default mode for interleaved page(s) {", ".join(map(str, fallback))}' if fallback else ''
print(f'    PDF pages {start + 1}-{end} of {n} -> {out}{note}')
EOF
}

# Export a volume's whole text -- every page, in pypdf's default mode, one page per form
# feed -- to <store>/txt/aas-{vol}-{year}[-{part}].txt, for the page recovery of phase
# 2b-iii-b (acta volumes spec §10.3): the recovery tool (tools/recover-acta-pages.ts)
# reads it from the store and writes the checked-in sidecar; the text itself is never
# checked in (500-1,300 pages a volume). Skipped when the file is already there.
extract_text() { # extract_text <pdf> <out>
  if [ -s "$2" ]; then echo "    cached: $2"; return 0; fi
  mkdir -p "$(dirname "$2")"
  python3 - "$1" "$2" <<'EOF'
import sys
from pypdf import PdfReader
pdf, out = sys.argv[1], sys.argv[2]
reader = PdfReader(pdf)
pages = [(p.extract_text() or '') for p in reader.pages]
with open(out, 'w', encoding='utf-8') as f:
    f.write('\f'.join(pages))
print(f'    {len(pages)} pages -> {out}')
EOF
}

get_index() { # get_index <year>
  local year="$1"
  if [ "$year" -ge 2003 ] && [ "$year" -le 2009 ]; then
    local pair
    pair="$(index_path_for_0309 "$year")"
    if [ -z "$pair" ]; then
      echo "    MISSING: no index PDF for $year on $BASE/index_it.htm" >&2
      return 0
    fi
    local linked="${pair%%|*}" fetched="${pair##*|}"
    local pdf="$STORE/AAS-Index-$year.pdf"
    echo "  $year  ($fetched; linked as $linked)"
    if ! fetch_pdf "$fetched" "$pdf" 300; then
      echo "    MISSING: $BASE/$fetched" >&2
      return 0
    fi
    extract_whole_collapsed "$pdf" "tools/fixtures/acta/aas-indice-$year.txt"
    return 0
  fi
  local path
  path="$(links_for "$year" | grep -i "indice" | head -n1 || true)"
  if [ -z "$path" ]; then
    echo "    MISSING: no index PDF for $year on $BASE/index_it.htm" >&2
    return 0
  fi
  local pdf="$STORE/$(basename "$path")"
  echo "  $year  ($path)"
  if ! fetch_pdf "$path" "$pdf" 120; then
    # A missing year is recorded, not fatal (spec §4.1): the README notes it and the
    # remaining years are still extracted.
    echo "    MISSING: $BASE/$path" >&2
    return 0
  fi
  extract_whole "$pdf" "tools/fixtures/acta/aas-indice-$year.txt"
}

get_volume() { # get_volume <year>
  local year="$1"
  local paths
  # The two double volumes name their parts differently, measured on the index page:
  # 1917 puts the part before the year (`AAS-09-I-1917-ocr.pdf`, `AAS-09-II-1917-ocr.pdf`),
  # 1983 after it (`AAS-75-1983-I-ocr.pdf`, `AAS-75-1983-II-ocr.pdf`). Both are read from
  # the page, never guessed; ACTA_SOURCES (join.ts) carries the URL of each part as printed.
  paths="$(links_for "$year" | grep -E "AAS-[0-9]{2}-((I|II)-)?$year(-(I|II))?-ocr\.pdf" || true)"
  if [ -z "$paths" ]; then
    echo "    MISSING: no volume PDF for $year on $BASE/index_it.htm" >&2
    return 0
  fi
  local path
  for path in $paths; do
    local file vol part out
    file="$(basename "$path")"
    # In text mode, a part II (1917, 1983) is skipped outright: it has no chronological
    # index and so no act to recover (extract_index_pages already reports as much in
    # fixture mode; there is nothing for the recovery tool to read from its text).
    if [ "$MODE" = "text" ] && [[ "$file" == *-II-* ]]; then continue; fi
    vol="$(echo "$file" | sed -E 's/^AAS-([0-9]{2})-.*/\1/')"
    part="$(echo "$file" | sed -nE 's/^AAS-[0-9]{2}-(I|II)-.*/\1/p; s/^AAS-[0-9]{2}-[0-9]{4}-(I|II)-.*/\1/p')"
    out="tools/fixtures/acta/aas-$vol-$year${part:+-$part}.txt"
    local pdf="$STORE/$file"
    echo "  $year  ($path)"
    if ! fetch_pdf "$path" "$pdf" 600; then
      echo "    MISSING: $BASE/$path" >&2
      continue
    fi
    if [ "$MODE" = "text" ]; then
      extract_text "$pdf" "${STORE%/pdf}/txt/aas-$vol-$year${part:+-$part}.txt"
    else
      extract_index_pages "$pdf" "$out"
    fi
  done
}

get() { # get <year>
  if [ "$1" -le 2002 ]; then get_volume "$1"; else get_index "$1"; fi
}

MODE=fixtures
if [ "${1:-}" = "text" ]; then MODE=text; shift; fi
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
