/**
 * The AAS's conciliar index part (acta volumes spec §12.1): `ACTA SS. OECUMENICI CONCILII VATICANI
 * II` in AAS 56-58 and `ACTA PATRUM S. CONCILII OECUMENICI VATICANI II` in AAS 54, the part
 * `index.ts` reads as a part (PART_HEADING_RE matches any heading opening `ACTA`) and then skips,
 * POPE_PART_RE failing on `SS.`.
 *
 * Read by the phase 2d report generator (tools/acta-conciliar-report.ts) and by the tests that hold
 * the curated rows to their fixtures. **Nothing in the harvest path imports this**: the spec refused
 * the matcher a reader for this part on its measured reach (§12.2), and this is the accounting that
 * refusal traded for, living where the lines are read.
 */
import { PART_HEADING_RE, type ActaParseResult } from './index.js';
import type { CuratedReference } from './curation.js';

/** A line opening an entry: the year in the ANNO column, or a ditto for it (`»`, `•»`, `-»`). */
const ENTRY_START_RE = /^(?:\d{4}\b|[-•,.'’\s]{0,3}»)/;
/** The genre word every conciliar entry names its act by; the part prints no incipit. */
const GENRE_WORD_RE = /\b(?:Constitutio|Decretum|Declaratio|Nuntius|Nuntii)\b/i;
/** The heading of a conciliar part, in either of the two forms the AAS prints. */
export const isConciliarPartHeading = (heading: string) =>
  /CONCILI/i.test(heading) && /OECUMENICI|PATRUM/i.test(heading);
/** The page an entry line ends in, which is the page the index gives for its act. */
export const pageOfEntry = (line: string) => Number(line.match(/(\d+)\s*$/)?.[1] ?? 0);

/**
 * One string per entry of the fixture's conciliar part, spaces collapsed: continuation lines folded
 * into the entry above, the heading's wrapped second line (`VATICANI II`) dropped, and AAS 58's one
 * fused line (two entries on one OCR line) split in two.
 *
 * An entry is recognised by how it **begins** -- a year or a ditto -- and never by ending in a page:
 * AAS 54's only entry wraps onto a second line, and in AAS 58 the last conciliar entry wraps too
 * while the entry above it ends in its own page.
 *
 * Throws where the fixture prints no conciliar part, and where the part it prints holds no entry, so
 * that a heading whose OCR differs, or a re-extraction that dropped the part's lines, is an error and
 * never a silent zero.
 */
export const conciliarPartLines = (fixture: string): string[] => {
  const lines = fixture.split('\f').join('\n').split('\n');
  const start = lines.findIndex((l) => /ACTA\s+(SS?\.|PATRUM)/i.test(l) && isConciliarPartHeading(l));
  if (start < 0) throw new Error('no conciliar part heading in this fixture');
  const out: string[] = [];
  for (const raw of lines.slice(start + 1)) {
    const l = raw.replace(/\s+/g, ' ').trim();
    if (l === '') continue;
    // The heading wraps in AAS 56-58: its second line is not an entry. Checked before the part test,
    // since `VATICANI II` opens no part either way.
    if (/^VATICANI\s+II\.?$/i.test(l)) continue;
    // Any heading the parser itself reads as a part closes this one -- not only `ACTA …`, or the
    // synod's part would be folded in and its acts returned as the council's.
    if (PART_HEADING_RE.test(l)) break;
    // A line that opens no entry continues the one above; with none open it opens one, AAS 54's part
    // printing no date column at all.
    if (!ENTRY_START_RE.test(l) && out.length > 0) { out[out.length - 1] += ` ${l}`; continue; }
    out.push(l);
    // AAS 58 sets two entries on one line: a dittoed title after the first entry's page. Both halves
    // must be entries in their own right -- a genre word and a page each -- or a bare year in the
    // ANNO column followed by a dittoed title would be split from its own entry.
    const fused = l.match(/^(.*\d)\s+(»[\s»,]*(?:Constitutio|Decretum|Declaratio)\b.*\d)\s*$/);
    if (fused && GENRE_WORD_RE.test(fused[1]!)) {
      out[out.length - 1] = fused[1]!.trim();
      out.push(fused[2]!);
    }
  }
  if (out.length === 0) throw new Error('no conciliar entry under the part heading of this fixture');
  return out;
};

/** The source keys whose index prints a conciliar part, from the parser's own `skippedParts`. */
export const conciliarSources = (parsed: ReadonlyMap<string, ActaParseResult>): string[] =>
  [...parsed].filter(([, r]) => r.skippedParts.some((h) => isConciliarPartHeading(h))).map(([key]) => key);

/** The index line a curated row's evidence quotes, spaces collapsed. */
export const quotedIndexLine = (evidence: string) =>
  evidence.match(/`aas-\d\d-\d{4}\.txt` l\. \d+, '([^']+)'/)?.[1]?.replace(/\s+/g, ' ').trim() ?? null;

/**
 * The curated row an entry of the conciliar part names, if any.
 *
 * A row quotes its index line, so the entry is matched by **containment** in that quotation rather
 * than equality: AAS 58's fused line is quoted whole by both of the rows it carries, while
 * `conciliarPartLines` returns its two halves. Containment alone therefore leaves those two
 * ambiguous and nothing else, so the page each half ends in is asked for **only** when a line is
 * quoted by more than one row.
 *
 * The page is deliberately not asked for otherwise. A row may cite a page the index does not --
 * *Ad gentes*, whose line ends in 948 where the decree opens at 947 -- and requiring the two to
 * agree would leave that entry unnamed. What holds a row's cited page to the page it was read on is
 * `citesItsOwnPage` in acta-join.test.ts, not this function.
 */
export const rowForConciliarEntry = (
  line: string,
  rows: readonly (readonly [string, CuratedReference])[],
): readonly [string, CuratedReference] | undefined => {
  const l = line.replace(/\s+/g, ' ').trim();
  const candidates = rows.filter(([, row]) => quotedIndexLine(row.evidence)?.includes(l) === true);
  if (candidates.length <= 1) return candidates[0];
  return candidates.find(([, row]) => row.acta.page === pageOfEntry(l));
};
