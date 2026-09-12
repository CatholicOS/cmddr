#!/usr/bin/env bash
# Fetch the vatican.va index pages the harvest parses, into tools/fixtures/.
#
# Fixtures are checked in so the test suite is offline and deterministic: a
# vatican.va redesign then fails a test instead of silently corrupting a harvest.
# After running this, update FIXTURES_RETRIEVED in tools/src/harvest/run.ts to
# today's date -- this covers the *pope* fixtures only -- and re-run
# `npm run harvest && npm run render`. A council fixture's retrieval date lives on
# its own COUNCILS row (tools/src/mappings/councils.ts) and must be updated there
# instead; FIXTURES_RETRIEVED is never restamped onto a council's records.
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

# messages <pageSlug> <subShelf...> -- the *Messaggi* sub-shelves (spec: messages harvest,
# §2.2). Every pope's messages.index.html landing page carries no items of its own, only
# links to sub-shelves, so the landing page is never fetched; each sub-shelf is an aggregate
# page at /messages/{subShelf}.index.html and lands in
# tools/fixtures/{pageSlug}-messages-{subShelf}.html, the name run.ts derives from the
# shelf name 'messages/{subShelf}' by replacing its slash. The year-partitioned
# pont-messages / pont_messages shelf is deliberately not fetched (spec §7).
messages() {
  local pope="$1"; shift
  for s in "$@"; do
    get "$pope-messages-$s" "https://www.vatican.va/content/$pope/it/messages/$s.index.html"
  done
}

# council <pageSlug> -- the archive-era council index. Note this is NOT under /content/,
# unlike every pope page, and its filename is index_it.htm rather than it.html.
council() { get "$1" "https://www.vatican.va/archive/hist_councils/$1/index_it.htm"; }

want() { [ -z "$POPE" ] || [ "${1:-}" = "$POPE" ]; }
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
  # The only *Messaggi* sub-shelf on this page is Urbi et Orbi.
  messages pius-xii urbi
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
  # John XXIII and Paul VI spell the Urbi et Orbi sub-shelf 'urbi_et_orbi'; later popes 'urbi'.
  messages john-xxiii urbi_et_orbi
fi

if [ -z "$POPE" ] || [ "$POPE" = paul-vi ]; then
  for s in encyclicals apost_constitutions apost_letters apost_exhortations motu_proprio; do
    shelf paul-vi "$s"
  done
  messages paul-vi peace communications lent migration missions sick vocations urbi_et_orbi
fi

if [ -z "$POPE" ] || [ "$POPE" = john-paul-i ]; then
  for s in apost_letters letters; do shelf john-paul-i "$s"; done
fi

if [ -z "$POPE" ] || [ "$POPE" = john-paul-ii ]; then
  for s in encyclicals bulls apost_constitutions apost_exhortations motu_proprio; do
    shelf john-paul-ii "$s"
  done
  shelf john-paul-ii apost_letters
  years john-paul-ii apost_letters 1978 2005
  messages john-paul-ii peace communications lent migration missions sick vocations youth \
           food consecrated_life tourism literacy urbi
fi

if [ -z "$POPE" ] || [ "$POPE" = benedict-xvi ]; then
  for s in encyclicals apost_constitutions apost_letters apost_exhortations motu_proprio; do
    shelf benedict-xvi "$s"
  done
  messages benedict-xvi peace communications lent migration missions sick vocations youth food urbi
fi

if [ -z "$POPE" ] || [ "$POPE" = francesco ]; then
  for s in encyclicals bulls apost_constitutions apost_letters apost_exhortations motu_proprio; do
    shelf francesco "$s"
  done
  messages francesco peace communications lent migration missions sick vocations youth food \
           consecrated_life poveri nonni bambini cura-creato urbi
fi

if [ -z "$POPE" ] || [ "$POPE" = leo-xiv ]; then
  # Leo XIV is the reigning pontiff: these fixtures go stale as documents are published.
  # Refresh them, update FIXTURES_RETRIEVED, and re-harvest whenever the registry is
  # brought up to date. The counts in tools/test/harvest-data.test.ts move with them.
  for s in encyclicals apost_constitutions apost_letters apost_exhortations motu_proprio; do
    shelf leo-xiv "$s"
  done
  # Leo XIV's page renames four sub-shelves: missions -> mission, poveri -> poor,
  # nonni -> grandparents, cura-creato -> creation. data/series.json's `shelves` lists
  # every spelling, so each still resolves to the same series as its predecessor.
  messages leo-xiv peace communications lent migration mission sick vocations youth poor \
           grandparents creation urbi
fi

if [ -z "$POPE" ] || [ "$POPE" = ii_vatican_council ]; then council ii_vatican_council; fi
