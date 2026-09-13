#!/usr/bin/env bash
# Fetch the *Acta Apostolicae Sedis* index sources and extract their text into
# tools/fixtures/acta/ (acta reference spec §4.1; acta volumes spec §3).
#
# Two kinds of source, both read off the AAS index page
# (https://www.vatican.va/archive/aas/index_it.htm) rather than guessed, since the file
# names vary in case (`aas-indice2015.pdf`, `AAS-indice2012.pdf`, `AAS-INDICE2010.pdf`):
#
# - an annual *Index generalis* PDF (2010-2024): extracted whole, one page per form feed,
#   to aas-indice-{year}.txt;
# - a whole-volume OCR PDF (1909-2002; 1917 and 1983 in two parts): the pages of the
#   *Index documentorum chronologico ordine digestus* are located -- the first by its
#   heading, the last by the next top-level index heading (*Indices nominum*, *Index
#   analyticus*, *Index rerum*, *Index alphabeticus*) -- and only those pages are
#   extracted, to aas-{vol}-{year}[-{part}].txt. The script prints the page range and the
#   volume's page count for the README row.
#
# The PDFs are downloaded to a scratch directory and are never checked in; the extracted
# text is, so the parser (tools/src/acta/index.ts) and its tests run offline and
# deterministically. Extraction is by pypdf -- chosen over pdfjs-dist on the 2023 index,
# see tools/fixtures/acta/README.md -- in its default mode for the born-digital index
# PDFs and in `layout` mode for the OCR'd volumes, whose text layer carries the date in
# three columns (ANNO MENSE DIE) beside the entry: the default mode emits each column as
# a run of its own (every month of the page, then every day, then the entries), and only
# the layout mode keeps a date on the line of its entry (README, measured on 1909, 1917
# and 1931). Each page becomes one page of the fixture, separated by a form feed (\f).
#
# After running this, update the README's rows and ACTA_SOURCES in tools/src/acta/join.ts
# (retrieval date) and re-run `npm run harvest && npm run render`. The matched and created
# counts pinned in tools/test/harvest-data.test.ts move with the fixtures.
#
# Requires: curl, python3 with pypdf (`pip install pypdf`; measured with pypdf 6.14.2).
#
# Usage: tools/fetch-acta.sh                 # the ten index PDFs, 2015-2024
#        tools/fetch-acta.sh 2023            # one index year (2010-2024)
#        tools/fetch-acta.sh 1958            # one volume (1909-2002); 1917 and 1983 fetch both parts
#        tools/fetch-acta.sh sample          # the six sources of phase 2b-i: 1909 1917 1931 1958 1978 2012
#        tools/fetch-acta.sh 1932-1957       # a range of volumes (phase 2b-ii-a: AAS 24-49)
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p tools/fixtures/acta

SCRATCH="${ACTA_SCRATCH:-${TMPDIR:-/tmp}/cmddr-acta}"
mkdir -p "$SCRATCH"
BASE='https://www.vatican.va/archive/aas'

# The index page, fetched once per run: the source of every file name below.
INDEX_HTML="$SCRATCH/index_it.htm"
curl -fsSL --retry 3 --max-time 60 "$BASE/index_it.htm" -o "$INDEX_HTML"

# The `documents/...` paths the index page links for a year, one per line.
links_for() { # links_for <year>
  grep -oiE "documents/([0-9]{4}/)?aas-(indice)?[0-9I-]*$1[^\"']*\.pdf" "$INDEX_HTML" | sort -u
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
def interleaved(page_text):
    for line in page_text.split('\n')[1:]:
        if not INTERLEAVED.search(line) or re.search(r'\d\s*$', line): continue
        if 'Index documentorum' in line or re.match(r'\s*(ANNO|MENSE|DIE|PAG)', line): continue
        return True
    return False
pages, fallback = [], []
for i in range(start, end):
    layout = reader.pages[i].extract_text(extraction_mode='layout') or ''
    if interleaved(layout):
        fallback.append(i + 1)
        layout = reader.pages[i].extract_text() or ''
    pages.append(layout)
with open(out, 'w', encoding='utf-8') as f:
    f.write('\f'.join(pages))
    f.write('\n')
note = f'; default mode for interleaved page(s) {", ".join(map(str, fallback))}' if fallback else ''
print(f'    PDF pages {start + 1}-{end} of {n} -> {out}{note}')
EOF
}

get_index() { # get_index <year>
  local year="$1"
  local path
  path="$(links_for "$year" | grep -i "indice" | head -n1 || true)"
  if [ -z "$path" ]; then
    echo "    MISSING: no index PDF for $year on $BASE/index_it.htm" >&2
    return 0
  fi
  local pdf="$SCRATCH/$(basename "$path")"
  echo "  $year  ($path)"
  if ! curl -fsSL --retry 3 --max-time 120 "$BASE/$path" -o "$pdf"; then
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
  paths="$(links_for "$year" | grep -E "AAS-[0-9]{2}-(I-|II-)?$year-ocr\.pdf" || true)"
  if [ -z "$paths" ]; then
    echo "    MISSING: no volume PDF for $year on $BASE/index_it.htm" >&2
    return 0
  fi
  local path
  for path in $paths; do
    local file vol part out
    file="$(basename "$path")"
    vol="$(echo "$file" | sed -E 's/^AAS-([0-9]{2})-.*/\1/')"
    part="$(echo "$file" | sed -nE 's/^AAS-[0-9]{2}-(I|II)-.*/\1/p')"
    out="tools/fixtures/acta/aas-$vol-$year${part:+-$part}.txt"
    local pdf="$SCRATCH/$file"
    echo "  $year  ($path)"
    if ! curl -fsSL --retry 3 --max-time 600 "$BASE/$path" -o "$pdf"; then
      echo "    MISSING: $BASE/$path" >&2
      continue
    fi
    extract_index_pages "$pdf" "$out"
  done
}

get() { # get <year>
  if [ "$1" -le 2002 ]; then get_volume "$1"; else get_index "$1"; fi
}

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
