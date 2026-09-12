/**
 * The AAS join as the harvest applies it (acta reference spec §4.3): parse the ten
 * checked-in index fixtures, match their entries to the built documents, and write
 * `acta` on every matched document. The fixtures are a checked-in input like every
 * other, so `npm run harvest` stays byte-deterministic.
 */
import { readFileSync, existsSync } from 'node:fs';
import { parseActaIndex, type ActaEntry, type ActaParseResult } from './index.js';
import { matchActa, type ActaMatchResult } from './match.js';
import type { DocumentRecord } from '../types.js';

/** The years whose annual *Index generalis* vatican.va publishes as a separate PDF. */
export const ACTA_YEARS: readonly number[] = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

export const actaFixturePath = (year: number): string => `tools/fixtures/acta/aas-indice-${year}.txt`;

/** Parse every fixture present; a missing year is skipped and named, not fatal. */
export function loadActaIndexes(): { parsed: Map<number, ActaParseResult>; missing: number[] } {
  const parsed = new Map<number, ActaParseResult>();
  const missing: number[] = [];
  for (const year of ACTA_YEARS) {
    const path = actaFixturePath(year);
    if (!existsSync(path)) { missing.push(year); continue; }
    parsed.set(year, parseActaIndex(readFileSync(path, 'utf8'), { year }));
  }
  return { parsed, missing };
}

export interface ActaJoin {
  parsed: Map<number, ActaParseResult>;
  missing: number[];
  entries: ActaEntry[];
  result: ActaMatchResult;
}

/**
 * Match every parsed entry against `docs` and write `acta` on the matched documents.
 * Matching runs over all years at once so a document claimed by two years' entries is
 * a conflict (match.ts) rather than a silent overwrite.
 */
export function applyActa(docs: DocumentRecord[]): ActaJoin {
  const { parsed, missing } = loadActaIndexes();
  const entries = [...parsed.values()].flatMap((p) => p.entries);
  const result = matchActa(entries, docs);
  const byId = new Map(docs.map((d) => [d.id, d]));
  for (const m of result.matches) {
    const { series, volume, year, page } = m.entry;
    byId.get(m.documentId)!.acta = { series, volume, year, page };
  }
  return { parsed, missing, entries, result };
}
