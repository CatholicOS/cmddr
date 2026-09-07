export type IssuerType = 'ecumenical-council' | 'pope' | 'bishop';
export type IdStatus = 'minted' | 'provisional';

/** One entry as scraped from an index page, before mapping. */
export interface HarvestItem {
  incipit: string;
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
  incipit: string;
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
  descriptiveTitle?: 'dogmatic' | 'pastoral';
  sigla?: string;
  aliases?: string[];
  source?: {
    url: string | null; shelf: string | null; alsoShelvedAs?: string[];
    languages: string[]; retrieved: string;
  };
}
