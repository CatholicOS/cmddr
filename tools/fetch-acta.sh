#!/usr/bin/env bash
# Fetch the annual *Index generalis* PDFs of the Acta Apostolicae Sedis (2015-2024) and
# extract their text into tools/fixtures/acta/, one file per year (acta reference spec
# §4.1).
#
# The PDFs are downloaded to a scratch directory and are never checked in; the extracted
# text is, so the parser (tools/src/acta/index.ts) and its tests run offline and
# deterministically. Extraction is by pypdf, chosen over pdfjs-dist on the 2023 index --
# see tools/fixtures/acta/README.md for the comparison. Each page of the PDF becomes one
# page of the fixture, separated by a form feed (\f), so the running header at the top
# of every page is always the first line after a form feed.
#
# After running this, update RETRIEVED in tools/fixtures/acta/README.md and re-run
# `npm run harvest && npm run render`. The matched counts in
# tools/test/harvest-data.test.ts move with the fixtures.
#
# Requires: curl, python3 with pypdf (`pip install pypdf`; measured with pypdf 6.14.2).
#
# Usage: tools/fetch-acta.sh                 # every year, 2015-2024
#        tools/fetch-acta.sh 2023            # one year
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p tools/fixtures/acta

SCRATCH="${ACTA_SCRATCH:-${TMPDIR:-/tmp}/cmddr-acta}"
mkdir -p "$SCRATCH"

get() { # get <year>
  local year="$1"
  local pdf="$SCRATCH/aas-indice$year.pdf"
  local url="https://www.vatican.va/archive/aas/documents/$year/aas-indice$year.pdf"
  echo "  $year"
  if ! curl -fsSL --retry 3 --max-time 120 "$url" -o "$pdf"; then
    # A missing year is recorded, not fatal (spec §4.1): the README notes it and the
    # remaining years are still extracted.
    echo "    MISSING: $url" >&2
    return 0
  fi
  python3 - "$pdf" "tools/fixtures/acta/aas-indice-$year.txt" <<'EOF'
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

YEAR="${1:-}"
if [ -n "$YEAR" ]; then
  get "$YEAR"
else
  for y in $(seq 2015 2024); do get "$y"; done
fi
