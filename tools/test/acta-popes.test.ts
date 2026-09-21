import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { ACTA_POPES, popeForGenitive, popeForLabel, labelForBracket } from '../src/acta/popes.js';
import { POPES, KNOWN_PONTIFF_IDS } from '../src/mappings/pontiffs.js';
import { POPE_ISSUERS } from '../src/acta/match.js';
import { PONTIFICATE_BEGAN } from '../src/acta/create.js';
import { loadActaIndexes } from '../src/acta/join.js';

describe('the pope headings of the AAS index (acta volumes spec §2)', () => {
  it('maps every genitive heading of the sample to a CRPDR issuer the harvest knows', () => {
    expect(popeForGenitive('PII X')?.issuerId).toBe('rp:pius-x');
    expect(popeForGenitive('BENEDICTI XV')?.issuerId).toBe('rp:benedict-xv');
    expect(popeForGenitive('PII XI')?.issuerId).toBe('rp:pius-xi');
    expect(popeForGenitive('PII XII')?.issuerId).toBe('rp:pius-xii');
    expect(popeForGenitive('IOANNIS XXIII')?.issuerId).toBe('rp:john-xxiii');
    expect(popeForGenitive('PAULI VI')?.issuerId).toBe('rp:paul-vi');
    expect(popeForGenitive('IOANNIS PAULI I')?.issuerId).toBe('rp:john-paul-i');
    expect(popeForGenitive('IOANNIS PAULI II')?.issuerId).toBe('rp:john-paul-ii');
    expect(popeForGenitive('BENEDICTI XVI')?.issuerId).toBe('rp:benedict-xvi');
    expect(popeForGenitive('FRANCISCI')?.issuerId).toBe('rp:francis-i');
    // The OCR of AAS 51 (1959) reads John XXIII's name as `I0A1OTS`: listed beside the row.
    expect(popeForGenitive('I0A1OTS XXIII')?.issuerId).toBe('rp:john-xxiii');
    // `LEONIS XIII` and `PII IX` are now listed too (the ASS's, ass volumes spec §2), so a
    // genitive the table truly does not list is one from before either gazette: Gregory XVI
    // (died 1846, before the ASS begins in 1865).
    expect(popeForGenitive('GREGORII XVI')).toBeNull();
    expect(popeForGenitive('IN MORTE PII XII')).toBeNull();
    for (const p of ACTA_POPES) {
      expect(KNOWN_PONTIFF_IDS.has(p.issuerId), p.issuerId).toBe(true);
      expect(POPES.some((h) => h.issuerId === p.issuerId), p.issuerId).toBe(true);
      expect(p.began).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    // One label per pope, and the labels the parser writes are the keys the matcher reads.
    expect(new Set(ACTA_POPES.map((p) => p.pope)).size).toBe(ACTA_POPES.length);
    expect(Object.keys(POPE_ISSUERS).sort()).toEqual(ACTA_POPES.map((p) => p.pope).sort());
    expect(Object.keys(PONTIFICATE_BEGAN).sort()).toEqual(ACTA_POPES.map((p) => p.issuerId).sort());
  });

  it('names the popes of the Acta Sanctae Sedis (ass volumes spec §2): Pius IX and Leo XIII, before Pius X', () => {
    expect(ACTA_POPES.find((p) => p.genitive === 'PII IX')).toEqual({ genitive: 'PII IX', pope: 'Pius IX', issuerId: 'rp:pius-ix', began: '1846-06-16' });
    expect(ACTA_POPES.find((p) => p.genitive === 'LEONIS XIII')).toEqual({ genitive: 'LEONIS XIII', pope: 'Leo XIII', issuerId: 'rp:leo-xiii', began: '1878-02-20' });
    const i = ACTA_POPES.findIndex((p) => p.genitive === 'PII X');
    expect(ACTA_POPES.slice(0, i).map((p) => p.pope)).toEqual(['Pius IX', 'Leo XIII']);
  });

  it('renders the bracketed pope of the 2018-2021 indexes to the same label as the part heading', () => {
    expect(labelForBracket('Benedictus PP. XVI')).toBe('Benedictus XVI');
    expect(labelForBracket('Benedictus XVI')).toBe('Benedictus XVI');
    expect(popeForLabel('Benedictus XVI')?.issuerId).toBe('rp:benedict-xvi');
  });

  it('is printed in the fixtures: every row is a part heading of some source, and no source prints an unmapped one', () => {
    const { parsed, missing } = loadActaIndexes();
    // Every configured fixture must be present: a missing one would make the checks below vacuous for it.
    expect(missing).toEqual([]);
    const seen = new Set<string>();
    for (const r of parsed.values()) {
      expect(r.unmappedPopes).toEqual([]);
      for (const e of r.entries) seen.add(e.pope);
    }
    // Pius IX and Leo XIII are the ASS's (phase 2c-i); their fixtures are the entries JSON, checked in Task 5.
    for (const p of ACTA_POPES.filter((p) => p.pope !== 'Pius IX' && p.pope !== 'Leo XIII')) expect(seen.has(p.pope), p.pope).toBe(true);
    // And the 1958 volume's two parts that are not a pope's are skipped by name.
    const r1958 = parsed.get('1958')!;
    expect(r1958.skippedParts).toContain('II - ACTA IN MORTE PII PP. XII');
    expect(r1958.skippedParts).toContain('III - ACTA CONCLAVIS');
    // The volumes of 1959-1977: two pope parts where a pontificate ends (1959, 1960: Pius XII's last acts before
    // John XXIII's; 1963, 1964: John XXIII's before Paul VI's), the council's, the synod's and the conclave's parts skipped.
    expect(parsed.get('1959')!.popeHeadings).toEqual(['I - ACTA PII PP. XII', 'II - ACTA I0A1OTS PP. XXIII']);
    expect(parsed.get('1963')!.popeHeadings).toEqual(['I - ACTA IOANNIS PP. XXIII', 'IV - ACTA PAULI PP. VI']);
    expect(parsed.get('1963')!.skippedParts).toContain('II - ACTA IN MORTE IOANNIS PP. XXIII');
    expect(parsed.get('1963')!.skippedParts).toContain('III - ACTA CONCLAVIS');
    expect(parsed.get('1975')!.popeHeadings).toEqual(['I - ACTA. PAULI PP. VI']);
    for (const [key, part] of [['1962', 'ACTA PATRUM S. CONCILII OECUMENICI VATICANI II'], ['1964', 'III - ACTA Ss. OECUMENICI CONCILII'], ['1965', 'II - ACTA SS. OECUMENICI CONCILII'], ['1966', 'II - ACTA SS. OECUMENICI CONCILII'], ['1977', 'II - SYNODUS EPISCOPORUM']]) {
      expect(parsed.get(key!)!.skippedParts, key).toContain(part);
    }
    void readFileSync;
  });
});
