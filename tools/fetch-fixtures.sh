#!/usr/bin/env bash
# Fetch the vatican.va index pages the harvest parses, into tools/fixtures/.
#
# Fixtures are checked in so the test suite is offline and deterministic: a
# vatican.va redesign then fails a test instead of silently corrupting a harvest.
# After running this, update FIXTURES_RETRIEVED in tools/src/harvest/run.ts to
# today's date and re-run `npm run harvest && npm run render`.
#
# Usage: tools/fetch-fixtures.sh                 # every fixture
#        tools/fetch-fixtures.sh pius-x          # one pope's fixtures
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p tools/fixtures

get() { # get <output-basename> <url>
  echo "  $1"
  curl -fsSL --retry 3 --max-time 60 "$2" -o "tools/fixtures/$1.html"
}

flat() { get "$1" "https://www.vatican.va/content/$1/it.html"; }

shelf() { # shelf <pageSlug> <shelfName>
  get "$1-$2" "https://www.vatican.va/content/$1/it/$2.index.html"
}

year() { # year <pageSlug> <shelfName> <YYYY>
  get "$1-$2-$3" "https://www.vatican.va/content/$1/it/$2/$3.index.html"
}

# years <pageSlug> <shelfName> <first> <last>  -- for a shelf whose aggregate index
# carries no items of its own (see resolveShelfPages).
years() {
  for y in $(seq "$3" "$4"); do year "$1" "$2" "$y"; done
}

want() { [ $# -eq 0 ] || [ "${1:-}" = "$POPE" ]; }
POPE="${1:-}"

if want benedictus-xiv; then flat benedictus-xiv; fi
if want pius-ix; then flat pius-ix; fi

if [ -z "$POPE" ] || [ "$POPE" = leo-xiii ]; then
  for s in apost_constitutions apost_letters briefs bulls encyclicals letters motu_proprio speeches; do
    shelf leo-xiii "$s"
  done
fi

if [ -z "$POPE" ] || [ "$POPE" = pius-x ]; then
  for s in encyclicals apost_constitutions apost_letters apost_exhortations motu_proprio letters; do
    shelf pius-x "$s"
  done
fi

if [ -z "$POPE" ] || [ "$POPE" = pius-xi ]; then
  for s in encyclicals bulls briefs apost_constitutions apost_letters motu_proprio letters; do
    shelf pius-xi "$s"
  done
fi

if [ -z "$POPE" ] || [ "$POPE" = pius-xii ]; then
  for s in encyclicals bulls briefs apost_constitutions apost_letters \
           apost_exhortations motu_proprio letters; do
    shelf pius-xii "$s"
  done
fi

if [ -z "$POPE" ] || [ "$POPE" = benedict-xv ]; then
  for s in encyclicals bulls briefs apost-constitutions apost_letters \
           apost_exhortations motu_proprio; do
    shelf benedict-xv "$s"
  done
fi

if [ -z "$POPE" ] || [ "$POPE" = john-xxiii ]; then
  for s in encyclicals apost_exhortations motu_proprio; do shelf john-xxiii "$s"; done
  # These two carry no items of their own; the aggregate page is still fetched so
  # resolveShelfPages can read its year links. John XXIII reigned 1958-1963 (died 3
  # June 1963), but apost_constitutions' own aggregate page links only 1958-1962 (no
  # apostolic constitution is indexed for 1963) while apost_letters links 1958-1963 --
  # confirmed against the fetched aggregate pages, not assumed from the reign span.
  shelf john-xxiii apost_constitutions
  years john-xxiii apost_constitutions 1958 1962
  shelf john-xxiii apost_letters
  years john-xxiii apost_letters 1958 1963
fi
