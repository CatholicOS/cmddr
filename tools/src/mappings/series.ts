import seriesRows from '../../../data/series.json' with { type: 'json' };

/**
 * One row of data/series.json, as the harvester reads it. `shelves` lists every vatican.va
 * *Messaggi* sub-shelf slug the occasion has been filed under across the pontificates
 * (messages spec §2.2, §4): the slugs are not stable -- Leo XIV's page renames `missions`
 * to `mission`, `poveri` to `poor`, `nonni` to `grandparents`, `cura-creato` to `creation`,
 * and John XXIII and Paul VI spell `urbi_et_orbi` where later popes have `urbi` -- while
 * the occasion is one series across five pontificates. The row's `id` is canonical
 * English and is the slug segment of every document id in the series.
 */
export interface SeriesRow {
  id: string;
  label: string;
  shelves: string[];
  numbered: boolean;
  firstYear?: number;
  gloss: string;
  note: string;
}

export const SERIES: readonly SeriesRow[] = seriesRows as SeriesRow[];

const byId = new Map(SERIES.map((s) => [s.id, s]));

/** The two Urbi et Orbi series, told apart by date rather than by shelf (spec §2.4). */
export const URBI_ET_ORBI_CHRISTMAS = 'urbi-et-orbi-christmas';
export const URBI_ET_ORBI_EASTER = 'urbi-et-orbi-easter';

/** Every shelf name a pope's POPES row may carry for the *Messaggi* shelves: `messages/{sub-shelf}`. */
export const MESSAGES_SHELF_PREFIX = 'messages/';

export function isMessagesShelf(shelf: string | null): shelf is string {
  return shelf !== null && shelf.startsWith(MESSAGES_SHELF_PREFIX);
}

/** The vatican.va sub-shelf slug of a `messages/{sub-shelf}` shelf name, or null for any other shelf. */
export function messagesSubShelf(shelf: string | null): string | null {
  return isMessagesShelf(shelf) ? shelf.slice(MESSAGES_SHELF_PREFIX.length) : null;
}

export type ShelfSeries =
  /** A sub-shelf that is one series: the row decides the genre (`message`) and the id's slug. */
  | { kind: 'series'; row: SeriesRow }
  /** The Urbi et Orbi sub-shelf: two dated series plus everything else, decided by date. */
  | { kind: 'urbi'; christmas: SeriesRow; easter: SeriesRow };

const bySubShelf = new Map<string, SeriesRow[]>();
for (const row of SERIES) {
  for (const shelf of row.shelves) bySubShelf.set(shelf, [...(bySubShelf.get(shelf) ?? []), row]);
}

/**
 * The series a `messages/{sub-shelf}` shelf belongs to, read off data/series.json's `shelves`
 * lists -- the harvester's only way from a shelf to a series. A sub-shelf on exactly one row
 * is that series; the shared Urbi et Orbi shelves (`urbi`, `urbi_et_orbi`) carry both the
 * Christmas and the Easter rows and are resolved per item by date. Returns null for a shelf
 * that is not a *Messaggi* shelf at all, and throws for a *Messaggi* sub-shelf the
 * vocabulary does not list: a pope's POPES row naming a sub-shelf no series claims is a
 * configuration error, and must fail the harvest rather than silently mint provisional ids.
 */
export function seriesForShelf(shelf: string | null): ShelfSeries | null {
  const sub = messagesSubShelf(shelf);
  if (sub === null) return null;
  const rows = bySubShelf.get(sub) ?? [];
  const christmas = byId.get(URBI_ET_ORBI_CHRISTMAS)!;
  const easter = byId.get(URBI_ET_ORBI_EASTER)!;
  if (rows.includes(christmas) || rows.includes(easter)) {
    if (rows.length !== 2 || !rows.includes(christmas) || !rows.includes(easter)) {
      throw new Error(`messages sub-shelf '${sub}' mixes the Urbi et Orbi series with another`);
    }
    return { kind: 'urbi', christmas, easter };
  }
  if (rows.length === 0) {
    throw new Error(`messages sub-shelf '${sub}' is claimed by no row of data/series.json`);
  }
  if (rows.length > 1) {
    throw new Error(
      `messages sub-shelf '${sub}' is claimed by ${rows.length} rows of data/series.json: `
      + rows.map((r) => r.id).join(', '),
    );
  }
  return { kind: 'series', row: rows[0]! };
}
