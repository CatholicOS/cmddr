export type IssuerType = 'ecumenical-council' | 'pope' | 'bishop';
export type IdStatus = 'minted' | 'provisional';

/** One entry as scraped from an index page, before mapping. */
export interface HarvestItem {
  /** The full printed heading, minus its trailing (date). Always present. */
  title: string;
  /** The document's opening words, when the heading contains them (see extractIncipit). */
  incipit: string | null;
  date: string;                 // ISO YYYY-MM-DD
  sourceGenreLabel: string;
  url: string | null;
  languages: string[];
  shelf: string | null;
  alsoShelvedAs?: string[];     // other shelves the same document is filed under
  aliases?: string[];           // incipits of merged-away duplicate records
  pageSlug: string;             // the vatican.va pope slug the page belonged to
}

export interface DocumentRecord {
  id: string;
  title: string;
  incipit?: string;
  incipitLang?: string;
  idStatus: IdStatus;
  genre: string | null;
  sourceGenreLabel?: string;
  issuerId: string;
  issuerType: IssuerType;
  promulgatedBy?: string;
  date: string;
  scope?: 'universal' | 'local';
  characteristics?: string[];
  keywords?: string[];
  /** Absent means teaching. Never authority-bearing; see document.schema.json. */
  actKind?: 'teaching' | 'governance' | 'liturgical';
  /**
   * Membership in an annual series; `id` resolves against data/series.json (invariant 23).
   * `year` is the occasion year the title prints, not the year of `date`; together with
   * `id` it is the document's id (`mag:{issuer}/{id}-{year}`, invariants 10 and 12).
   * `ordinal` is recorded only where the source prints one (invariant 24).
   */
  series?: { id: string; year: number; ordinal?: number };
  descriptiveTitle?: 'dogmatic' | 'pastoral';
  sigla?: string;
  aliases?: string[];
  source?: {
    url: string | null; shelf: string | null; alsoShelvedAs?: string[];
    languages: string[]; retrieved: string;
  };
}
