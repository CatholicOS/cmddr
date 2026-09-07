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
  'breve': { genre: 'brief' },
  'briefs': { genre: 'brief' },
  'lettera': { genre: 'letter' },
  'epistola': { genre: 'letter' },
  'letters': { genre: 'letter' },
  'lettera apostolica': { genre: 'apostolic-letter' },
  'litterae apostolicae': { genre: 'apostolic-letter' },
  'apost_letters': { genre: 'apostolic-letter' },
  'costituzione apostolica': { genre: 'papal-bull', characteristics: ['apostolic-constitution'] },
  'constitutio apostolica': { genre: 'papal-bull', characteristics: ['apostolic-constitution'] },
  'apost_constitutions': { genre: 'papal-bull', characteristics: ['apostolic-constitution'] },
  'motu proprio': { genre: 'motu-proprio' },
  'motu_proprio': { genre: 'motu-proprio' },
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
