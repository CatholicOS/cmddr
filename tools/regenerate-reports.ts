/**
 * Regenerate every committed report of `docs/superpowers/reports/` from its generator.
 *
 * The registry's standing rule is that every count stated in prose is computed by a
 * generator or asserted by a pin (the lesson of PR #51, where a hand-typed list of acts
 * outlived the rule that chose them). A generated report obeys that rule only while it
 * matches what its generator produces today -- and a generator change silently falsifies
 * every report it has already written. That is not hypothetical: issue #58 was opened on
 * six reports left behind by commit 565a76f, and PR #59 then changed
 * `acta-volumes-report.ts` and brought forward one of the seven reports it writes.
 *
 * So the check belongs in CI, beside the one that already holds `data/` and `registry/` to
 * their harvest (`.github/workflows/check.yml`): regenerate, then `git diff --exit-code`.
 * It is not in `npm run check`, which every commit of every phase runs: the generators
 * below cost about 33 seconds together against that suite's 12, and the error they catch
 * arises only when a generator changes.
 *
 * `--skip-store` omits the one generator that reads the local volume store
 * (`~/development/sources/`, never checked in), which is what CI must pass. Run without it
 * -- `npm run reports` -- wherever the store is present, which is the only place the survey
 * can be regenerated at all.
 *
 * Usage: npm run reports            # all of them, store included
 *        npm run reports -- --skip-store   # the CI subset
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

interface Report {
  /** The committed file, under docs/superpowers/reports/. */
  out: string;
  /** The generator and its arguments. */
  generator: string;
  args: readonly string[];
  /**
   * True where the generator reads the volume store (`~/development/sources/`), which is
   * not checked in: such a report cannot be regenerated in CI and is skipped there.
   */
  store?: true;
}

/** Every committed report, with the generator that writes it and the arguments it takes. */
const REPORTS: readonly Report[] = [
  { out: '2026-09-12-acta-join-2015-2024.md', generator: 'tools/acta-report.ts', args: [] },
  { out: '2026-09-13-acta-volumes-sample.md', generator: 'tools/acta-volumes-report.ts', args: ['sample'] },
  { out: '2026-09-13-acta-volumes-1932-1957.md', generator: 'tools/acta-volumes-report.ts', args: ['1932-1957'] },
  { out: '2026-09-13-acta-volumes-1959-1977.md', generator: 'tools/acta-volumes-report.ts', args: ['1959-1977'] },
  { out: '2026-09-13-acta-volumes-1979-2014.md', generator: 'tools/acta-volumes-report.ts', args: ['1979-2014'] },
  { out: '2026-09-18-acta-volumes-1926-1930.md', generator: 'tools/acta-volumes-report.ts', args: ['1926-1930'] },
  { out: '2026-09-21-acta-volumes-1909-1925.md', generator: 'tools/acta-volumes-report.ts', args: ['1909-1925'] },
  { out: '2026-09-21-acta-volumes-2003-2009.md', generator: 'tools/acta-volumes-report.ts', args: ['2003-2009'] },
  { out: '2026-09-22-ass-volumes-sample.md', generator: 'tools/ass-volumes-report.ts', args: [] },
  { out: '2026-09-26-ass-volumes-pius-x.md', generator: 'tools/ass-era-report.ts', args: ['36-40'] },
  { out: '2026-09-26-ass-volumes-leo-xiii.md', generator: 'tools/ass-era-report.ts', args: ['13-35'] },
  { out: '2026-09-26-ass-volumes-pius-ix.md', generator: 'tools/ass-era-report.ts', args: ['1-11'] },
  // Phase 2d (acta volumes spec §12): reads the fixtures, the curated table and data/ only.
  { out: '2026-09-27-acta-vatican-ii.md', generator: 'tools/acta-conciliar-report.ts', args: [] },
  // `tools/survey-ass.ts` reads all 41 ASS volumes from the store, so it is skipped in CI.
  { out: '2026-09-22-ass-survey.md', generator: 'tools/survey-ass.ts', args: [], store: true },
];

const skipStore = process.argv.includes('--skip-store');
let written = 0;
let skipped = 0;
for (const r of REPORTS) {
  if (skipStore && r.store) {
    console.error(`skipped (reads the store): ${r.out}`);
    skipped++;
    continue;
  }
  const md = execFileSync('npx', ['tsx', r.generator, ...r.args], { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
  writeFileSync(`docs/superpowers/reports/${r.out}`, md);
  console.error(`wrote ${r.out}`);
  written++;
}
console.error(`${written} report(s) written${skipped > 0 ? `, ${skipped} skipped` : ''}.`);
