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
    expect(popeForGenitive('LEONIS XIII')).toBeNull();
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

  it('renders the bracketed pope of the 2018-2021 indexes to the same label as the part heading', () => {
    expect(labelForBracket('Benedictus PP. XVI')).toBe('Benedictus XVI');
    expect(labelForBracket('Benedictus XVI')).toBe('Benedictus XVI');
    expect(popeForLabel('Benedictus XVI')?.issuerId).toBe('rp:benedict-xvi');
  });

  it('is printed in the fixtures: every row is a part heading of some source, and no source prints an unmapped one', () => {
    const { parsed } = loadActaIndexes();
    const seen = new Set<string>();
    for (const r of parsed.values()) {
      expect(r.unmappedPopes).toEqual([]);
      for (const e of r.entries) seen.add(e.pope);
    }
    for (const p of ACTA_POPES) expect(seen.has(p.pope), p.pope).toBe(true);
    // And the 1958 volume's two parts that are not a pope's are skipped by name.
    const r1958 = parsed.get('1958')!;
    expect(r1958.skippedParts).toContain('II - ACTA IN MORTE PII PP. XII');
    expect(r1958.skippedParts).toContain('III - ACTA CONCLAVIS');
    void readFileSync;
  });
});
