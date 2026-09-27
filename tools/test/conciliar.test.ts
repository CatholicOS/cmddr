import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { conciliarPartLines, conciliarSources, rowForConciliarEntry } from '../src/acta/conciliar.js';
import { ACTA_CURATED_REFERENCES } from '../src/acta/curation.js';
import { ACTA_SOURCES, loadActaIndexes } from '../src/acta/join.js';

/**
 * The reader of the AAS's conciliar index part (acta volumes spec §12.1, phase 2d). Its input is
 * four frozen fixtures, so these tests exercise it on those and on hand-built parts for the shapes
 * the fixtures do not print but a re-extraction could.
 */
const fixture = (vol: string, year: number) => readFileSync(`tools/fixtures/acta/aas-${vol}-${year}.txt`, 'utf8');
const PARTS = [['54', 1962, 1], ['56', 1964, 2], ['57', 1965, 3], ['58', 1966, 12]] as const;

describe('conciliarPartLines (the council\'s index part)', () => {
  it('reads the entries of each of the four parts the AAS prints', () => {
    // Measured 2026-09-27: AAS 54 one entry, 56 two, 57 three, 58 twelve.
    let total = 0;
    for (const [vol, year, expected] of PARTS) {
      expect(conciliarPartLines(fixture(vol, year)).length, `AAS ${vol}`).toBe(expected);
      total += expected;
    }
    expect(total).toBe(18);
  });

  it('returns a wrapped entry whole', () => {
    // AAS 54's only entry wraps, and it is the one entry of the four parts that prints no date.
    const [only] = conciliarPartLines(fixture('54', 1962));
    expect(only).toBe('Nuntius ad universos homines, Summo Pontifice assentiente, missus, Concilio Oecu­ menico ineunte 822');
  });

  it('keeps the last two entries of AAS 58 apart, though the first ends in its own page and the second wraps', () => {
    const lines = conciliarPartLines(fixture('58', 1966));
    expect(lines[10]).toContain('Constitutio pastoralis de Ecclesia in mundo huius temporis');
    expect(lines[10]).not.toContain('Nuntii a Patribus');
    expect(lines[11]).toContain('Nuntii a Patribus Oecumenicae Synodi hominibus missi');
  });

  it('splits the one line the OCR fuses into the two entries it carries', () => {
    const lines = conciliarPartLines(fixture('58', 1966));
    expect(lines[5]).toBe('» Nov. 18 Constitutio dogmatica de divina Revelatione 817');
    expect(lines[6]).toBe('» » Decretum de apostolatu laicorum 837');
  });

  it('does not split a line whose left half is a bare year rather than an entry', () => {
    // The fused rule must require a whole entry on the left, not merely digits: a year in the ANNO
    // column followed by a dittoed title is one entry, not two (review round, PR #61).
    const bareYear = 'II - ACTA SS. OECUMENICI CONCILII\nVATICANI II\n1966 » » Decretum de apostolatu laicorum 837\n';
    expect(conciliarPartLines(bareYear)).toEqual(['1966 » » Decretum de apostolatu laicorum 837']);
  });

  it('closes the part at any heading the parser itself reads as a part, not only at `ACTA …`', () => {
    // The synod of bishops' part follows the council's in no committed fixture, but it is a part
    // heading the parser knows (`SYNODUS EPISCOPORUM`), and folding it into the last conciliar entry
    // would return the synod's acts as the council's (review round, PR #61).
    const withSynod = 'III - ACTA Ss. OECUMENICI CONCILII\nVATICANI II\n'
      + '1963 Dec. 4 Constitutio de Sacra Liturgia 97\n'
      + 'II - SYNODUS EPISCOPORUM\n1977 Oct. 1 Allocutio quaedam 764\n';
    expect(conciliarPartLines(withSynod)).toEqual(['1963 Dec. 4 Constitutio de Sacra Liturgia 97']);
  });

  it('closes the part at `EX ACTIBUS …`, `CONCLAVE` and `SEDIS VACANTIS ACTA` too', () => {
    for (const next of ['EX ACTIBUS PAULI PP. VI', 'III – CONCLAVE', 'II – SEDIS VACANTIS ACTA']) {
      const text = `II - ACTA SS. OECUMENICI CONCILII\nVATICANI II\n1963 Dec. 4 Constitutio de Sacra Liturgia 97\n${next}\n1963 Iun. 21 Aliquid aliud 500\n`;
      expect(conciliarPartLines(text), next).toEqual(['1963 Dec. 4 Constitutio de Sacra Liturgia 97']);
    }
  });

  it('refuses a fixture that prints no conciliar part', () => {
    expect(() => conciliarPartLines(fixture('59', 1967))).toThrow(/no conciliar part/i);
  });

  it('refuses a conciliar part that holds no entry', () => {
    const empty = 'II - ACTA SS. OECUMENICI CONCILII\nVATICANI II\n\nIII - ACTA SS. CONGREGATIONUM\n';
    expect(() => conciliarPartLines(empty)).toThrow(/no conciliar entr/i);
  });
});

describe('conciliarSources (which sources print a conciliar part)', () => {
  it('names the four the parser records, computed rather than listed', () => {
    const { parsed } = loadActaIndexes(ACTA_SOURCES.filter((s) => s.kind !== 'ass'));
    expect(conciliarSources(parsed).sort()).toEqual(['1962', '1964', '1965', '1966']);
  });
});

describe('rowForConciliarEntry (which curated row an entry names)', () => {
  const rows = Object.entries(ACTA_CURATED_REFERENCES).filter(([id]) => id.startsWith('mag:vatican-ii/'));

  it('ties sixteen of the eighteen entries to a row of their own, and two to none', () => {
    const seen = new Map<string, number>();
    let unnamed = 0;
    for (const [vol, year] of PARTS) {
      for (const line of conciliarPartLines(fixture(vol, year))) {
        const row = rowForConciliarEntry(line, rows);
        if (row === undefined) { unnamed++; continue; }
        seen.set(row[0], (seen.get(row[0]) ?? 0) + 1);
      }
    }
    // A bijection: every row named once, and only the Fathers' two messages naming none.
    expect(unnamed).toBe(2);
    expect(seen.size).toBe(16);
    expect([...seen.values()].every((n) => n === 1), JSON.stringify([...seen])).toBe(true);
    expect([...seen.keys()].sort()).toEqual(rows.map(([id]) => id).sort());
  });

  it('tells the two halves of the fused line apart by the page each ends in', () => {
    expect(rowForConciliarEntry('» Nov. 18 Constitutio dogmatica de divina Revelatione 817', rows)?.[0])
      .toBe('mag:vatican-ii/dei-verbum-1965');
    expect(rowForConciliarEntry('» » Decretum de apostolatu laicorum 837', rows)?.[0])
      .toBe('mag:vatican-ii/apostolicam-actuositatem-1965');
  });

  it('ties an entry to its row even where the row cites another page than the entry prints', () => {
    // *Ad gentes*: the index's line ends in 948, the row cites 947 (the page the decree opens on).
    const row = rowForConciliarEntry('» » , » Decretum de activitate missionali Ecclesiae . . . . . . . 948', rows);
    expect(row?.[0]).toBe('mag:vatican-ii/ad-gentes-1965');
    expect(row?.[1].acta.page).toBe(947);
  });

  it('ties nothing to an entry no row quotes', () => {
    expect(rowForConciliarEntry('1962 Dec. 8 Decretum de aliqua re prorsus ficta 1234', rows)).toBeUndefined();
  });
});
