import type { IssuerType } from '../types.js';

export interface GenreMapping {
  genre: string | null;
  characteristics?: string[];
  descriptiveTitle?: 'dogmatic' | 'pastoral';
  issuerType?: IssuerType;
}

/**
 * Keys are lowercased source labels (flat era) and shelf names (shelf era).
 * A null genre means the Genre Registry has no row for it yet; the raw label is
 * preserved on the record as sourceGenreLabel rather than inventing a taxonomy.
 */
export const SOURCE_GENRE_TO_GENRE: Record<string, GenreMapping> = {
  'enciclica': { genre: 'encyclical' },
  'encyclicals': { genre: 'encyclical' },
  'breve enciclica': { genre: 'encyclical' },
  'bolla': { genre: 'papal-bull' },
  'bulls': { genre: 'papal-bull' },
  // A brief is an apostolic letter in forma Brevis -- sealed sub anulo Piscatoris and issued
  // through the Secretaria Brevium -- not a genre standing beside it: the ASS head these
  // acts `LITTERAE in forma Brevis` (ASS 23 (1890) 437; ASS 33 (1900) 3), and vatican.va files
  // Mirabilis Deus (Pius XI) and Quod nobis (Benedict XV) on both apost_letters and briefs.
  // Modelled as motu_proprio is below -- the base genre plus a characteristic.
  'breve': { genre: 'apostolic-letter', characteristics: ['in-forma-brevis'] },
  'briefs': { genre: 'apostolic-letter', characteristics: ['in-forma-brevis'] },
  'lettera': { genre: 'letter' },
  'epistola': { genre: 'letter' },
  'letters': { genre: 'letter' },
  'lettera apostolica': { genre: 'apostolic-letter' },
  'litterae apostolicae': { genre: 'apostolic-letter' },
  'apost_letters': { genre: 'apostolic-letter' },
  'costituzione apostolica': { genre: 'papal-bull', characteristics: ['apostolic-constitution'] },
  'constitutio apostolica': { genre: 'papal-bull', characteristics: ['apostolic-constitution'] },
  'apost_constitutions': { genre: 'papal-bull', characteristics: ['apostolic-constitution'] },
  // Benedict XV's page spells this shelf with a hyphen; same genre either way.
  'apost-constitutions': { genre: 'papal-bull', characteristics: ['apostolic-constitution'] },
  // A motu proprio is a mode of issuance, not a genre standing beside the apostolic letter
  // (#10): vatican.va labels these acts 'Lettera Apostolica in forma di Motu Proprio' and
  // files Socialium Scientiarum (1994) on both apost_letters and motu_proprio. Modelled the
  // way apost_constitutions is above -- the base genre plus a characteristic.
  'motu proprio': { genre: 'apostolic-letter', characteristics: ['motu-proprio'] },
  'motu_proprio': { genre: 'apostolic-letter', characteristics: ['motu-proprio'] },
  'apost_exhortations': { genre: 'apostolic-exhortation' },
  'esortazione apostolica': { genre: 'apostolic-exhortation' },
  'allocuzione': { genre: 'discourse-address' },
  'allocutio': { genre: 'discourse-address' },
  'discorso': { genre: 'discourse-address' },
  'speeches': { genre: 'discourse-address' },
  'costituzione dogmatica': {
    genre: 'constitution', descriptiveTitle: 'dogmatic', issuerType: 'ecumenical-council',
  },
  'constitutio dogmatica': {
    genre: 'constitution', descriptiveTitle: 'dogmatic', issuerType: 'ecumenical-council',
  },
  // Genres present in the sources but with no Genre Registry row (spec §2.6, §5.2).
  'decreto': { genre: null },
  'proclama': { genre: null },
  'protesta': { genre: null },
  'editto': { genre: null },
};

/**
 * Genre labels as read from a *council's* documents. Consulted by toDocument ahead of
 * SOURCE_GENRE_TO_GENRE when the issuer is a council, and never otherwise.
 *
 * It exists because the two vocabularies genuinely collide. SOURCE_GENRE_TO_GENRE maps
 * 'decreto' to `genre: null` -- correctly, for the papal decrees Pius IX's flat page
 * prints, which the Genre Registry has no row for. The Genre Registry's `decree` row is
 * `issuerTypes: ['ecumenical-council']`, so pointing the shared key at it would make
 * every papal decree fail invariant 17. A conciliar decree, filed under the same word,
 * genuinely is that row.
 *
 * 'costituzione dogmatica' is deliberately present in both maps: Pius IX's page prints
 * it for the two Vatican I constitutions, and Vatican II's own documents print it for
 * Lumen Gentium and Dei Verbum. Duplicating five words is preferable to either map
 * reaching into the other.
 */
export const CONCILIAR_SOURCE_GENRE_TO_GENRE: Record<string, GenreMapping> = {
  'costituzione': { genre: 'constitution' },
  'costituzione dogmatica': { genre: 'constitution', descriptiveTitle: 'dogmatic' },
  'costituzione pastorale': { genre: 'constitution', descriptiveTitle: 'pastoral' },
  'dichiarazione': { genre: 'declaration' },
  'decreto': { genre: 'decree' },
};
