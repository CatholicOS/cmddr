/**
 * The entry lines of a volume's conciliar index part (acta volumes spec §12.1): `ACTA SS.
 * OECUMENICI CONCILII VATICANI II` in AAS 56-58 and `ACTA PATRUM S. CONCILII OECUMENICI
 * VATICANI II` in AAS 54, the part `index.ts` reads as a part (PART_HEADING_RE matches any
 * heading opening `ACTA`) and then skips, POPE_PART_RE failing on `SS.`.
 *
 * Read by the phase 2d report generator (tools/acta-conciliar-report.ts) and by the tests that
 * hold the curated rows to their fixtures. **Nothing in the harvest path imports this**: the
 * spec refused the matcher a reader for this part on its measured reach (§12.2), and this is
 * the accounting that refusal traded for, living where the lines are read.
 */

/** A line opening an entry: the year in the ANNO column, or a ditto for it (`»`, `•»`, `-»`). */
const ENTRY_START_RE = /^(?:\d{4}\b|[-•,.'’\s]{0,3}»)/;

/**
 * One string per entry of the fixture's conciliar part, spaces collapsed: continuation lines
 * folded into the entry above, the heading's wrapped second line (`VATICANI II`) dropped, and
 * AAS 58's one fused line (two entries on one OCR line) split in two. Throws where the fixture
 * prints no conciliar part **and where the part it prints holds no entry**, so that a heading whose
 * OCR differs, or a re-extraction that dropped the part's lines, is an error and never a silent
 * zero.
 *
 * An entry is recognised by how it **begins** -- a year or a ditto -- and never by ending in a
 * page: AAS 54's only entry wraps onto a second line, and in AAS 58 the last conciliar entry
 * (the *Nuntii*, p. 10) wraps too while the entry above it ends in its own page.
 */
export const conciliarPartLines = (fixture: string): string[] => {
  const lines = fixture.split('\f').join('\n').split('\n');
  const start = lines.findIndex((l) => /ACTA\s+(SS?\.|PATRUM)/i.test(l) && /OECUMENICI|CONCILII/i.test(l));
  if (start < 0) throw new Error('no conciliar part heading in this fixture');
  const out: string[] = [];
  for (const raw of lines.slice(start + 1)) {
    const l = raw.replace(/\s+/g, ' ').trim();
    if (l === '') continue;
    // The next part heading closes the part.
    if (/^(?:[A-Za-z0-9]{1,4}\.?\s*[–—-]\s*)?(?:ACTA|SACRA|SECRETARIA|DIARIUM)\b/i.test(l)) break;
    // The heading wraps: its second line is not an entry.
    if (/^VATICANI\s+II\.?$/i.test(l)) continue;
    if (!ENTRY_START_RE.test(l) && out.length > 0) { out[out.length - 1] += ` ${l}`; continue; }
    out.push(l);
    // AAS 58 sets two entries on one line: a dittoed title after the first entry's page.
    const fused = l.match(/\d+\s+(»[\s»,]*(?:Constitutio|Decretum|Declaratio)\b.*\d)\s*$/);
    if (fused) {
      out[out.length - 1] = l.slice(0, l.length - fused[1]!.length).trim();
      out.push(fused[1]!);
    }
  }
  if (out.length === 0) throw new Error('no conciliar entry under the part heading of this fixture');
  return out;
};
