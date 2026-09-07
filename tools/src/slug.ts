const FOLD: Record<string, string> = {
  'æ': 'ae', 'œ': 'oe', 'ø': 'o', 'ß': 'ss', 'đ': 'd', 'ł': 'l',
};

/**
 * Normalise an incipit to its identifier slug.
 * Must stay round-trippable: slugify(doc.incipit) === slug segment of doc.id (invariant 12).
 */
export function slugify(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[æœøßđł]/g, (c) => FOLD[c] ?? c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
