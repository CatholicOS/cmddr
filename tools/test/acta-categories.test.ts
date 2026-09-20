import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { ACTA_CATEGORIES, categoryForHeading, normaliseHeading } from '../src/acta/categories.js';
import { parseActaIndex } from '../src/acta/index.js';
import { ACTA_SOURCES, loadActaIndexes } from '../src/acta/join.js';

const genres = JSON.parse(readFileSync('data/genres.json', 'utf8')) as
  Array<{ id: string; allowedCharacteristics?: string[] }>;

describe('the AAS category table', () => {
  it('normalises a heading: roman numeral and dash dropped, case folded, whitespace collapsed', () => {
    expect(normaliseHeading('IV – LITTERAE APOSTOLICAE MOTU PROPRIO DATAE')).toBe('LITTERAE APOSTOLICAE MOTU PROPRIO DATAE');
    expect(normaliseHeading('XVIII  – ITINERA APOSTOLICA, VISITATIONES  ')).toBe('ITINERA APOSTOLICA, VISITATIONES');
    expect(normaliseHeading('IV. – ACTA CONGREGATIONUM')).toBe('ACTA CONGREGATIONUM');
    expect(normaliseHeading('Litterae Decretales')).toBe('LITTERAE DECRETALES');
  });

  it('maps every heading variant to its row, and an unseen one to null', () => {
    expect(categoryForHeading('II – ADHORTATIO APOSTOLICA POSTSYNODALIS')?.id).toBe('Adhortationes Apostolicae');
    expect(categoryForHeading('CHIROGRAPHI')?.id).toBe('Chirographa');
    expect(categoryForHeading('EPISTULA APOSTOLICA')?.classes).toEqual([{ genre: 'apostolic-letter', excludes: 'motu-proprio' }]);
    expect(categoryForHeading('NUNTII')?.classes.map((c) => c.genre)).toEqual(['message', 'urbi-et-orbi']);
    // A bare *Adhortatio* maps to the exhortation class as `partly` since AAS 46 (1954)
    // printed *I rapidi progressi* under it: matched where the shelf has one, never created.
    expect(categoryForHeading('ADHORTATIO')).toMatchObject({ classes: [{ genre: 'apostolic-exhortation' }], harvested: 'partly' });
    expect(categoryForHeading('HORTATIONES')).toMatchObject({ id: 'Hortationes', harvested: 'partly' });
    expect(categoryForHeading('IY. - LITTERAE APOSTOLICAE')?.id).toBe('Litterae Apostolicae');
    expect(categoryForHeading('I r- LITTERAE DECRETALES')?.id).toBe('Litterae Decretales');
    expect(categoryForHeading("LITTERAE DECRETALES'")?.id).toBe('Litterae Decretales');
    expect(categoryForHeading('I - BULLA DOGMATICA-')?.id).toBe('Constitutiones Apostolicae');
    expect(categoryForHeading('LITTERAE INAUDITAE')).toBeNull();
  });

  it('lists each heading once, under one row', () => {
    const all = ACTA_CATEGORIES.flatMap((c) => c.headings);
    expect(new Set(all).size).toBe(all.length);
    expect(all.every((h) => h === normaliseHeading(h))).toBe(true);
  });

  it('names only genres and characteristics the Genre Registry has', () => {
    const byId = new Map(genres.map((g) => [g.id, g.allowedCharacteristics ?? []]));
    for (const c of ACTA_CATEGORIES) {
      for (const k of c.classes) {
        expect(byId.has(k.genre), c.id).toBe(true);
        for (const ch of [k.requires, k.excludes]) {
          if (ch !== undefined) expect(byId.get(k.genre), `${c.id}: ${ch}`).toContain(ch);
        }
      }
    }
  });

  it('follows the spec\'s table (§2.3) on what is harvested', () => {
    const harvested = (id: string) => ACTA_CATEGORIES.find((c) => c.id === id)!.harvested;
    expect(harvested('Litterae Encyclicae')).toBe('yes');
    expect(harvested('Constitutiones Apostolicae')).toBe('yes');
    expect(harvested('Litterae Apostolicae Motu proprio datae')).toBe('yes');
    expect(harvested('Litterae Decretales')).toBe('partly');
    expect(harvested('Nuntii')).toBe('partly');
    // Phase 2b: the letters shelf is harvested for five popes (pontiffs.ts), so the
    // class is partly harvested; the creator decides per pope.
    expect(harvested('Epistulae')).toBe('partly');
    expect(harvested('Nuntii radiophonici')).toBe('partly');
    expect(harvested('Homiliae')).toBe('no');
    expect(harvested('Allocutiones')).toBe('no');
    expect(harvested('Sermones')).toBe('no');
    expect(harvested('Nuntii gratulatorii')).toBe('no');
  });

  it('maps the headings of the volumes (acta volumes spec §2), each as the fixture prints it', () => {
    expect(categoryForHeading('II - EPISTULA ENCYCLICA')?.id).toBe('Litterae Encyclicae');
    expect(categoryForHeading('III. - MOTU PROPRIO.')?.id).toBe('Litterae Apostolicae Motu proprio datae');
    expect(categoryForHeading('III – LITTERAE APOSTOLICAE «MOTU PROPRIO» DATAE')?.id).toBe('Litterae Apostolicae Motu proprio datae');
    expect(categoryForHeading('II. - APOSTOLICAE SUB PLUMBO LITTERAE')?.id).toBe('Litterae Apostolicae sub plumbo datae');
    expect(categoryForHeading('II. - EPISTOLA APOSTOLICA')?.id).toBe('Epistulae Apostolicae');
    expect(categoryForHeading('VII. - EPISTOLAE')?.id).toBe('Epistulae');
    expect(categoryForHeading('VI. - CHIROGRAPHE')?.id).toBe('Chirographa');
    expect(categoryForHeading('VIII. - SERMO')?.id).toBe('Sermones');
    expect(categoryForHeading('VII. - HOMILIA.')?.id).toBe('Homiliae');
    expect(categoryForHeading('IX. - NUNCIUM RADIOPHONICUM')?.id).toBe('Nuntii radiophonici');
    expect(categoryForHeading('IX - NUNTII RADIOTELEVISIFICI')?.classes.map((c) => c.genre)).toEqual(['message', 'urbi-et-orbi']);
    expect(categoryForHeading('VIII - NUNTII SCRIPTO DATI')?.id).toBe('Nuntii');
    expect(categoryForHeading('VIII - NUNTII GRATULATORII')?.id).toBe('Nuntii gratulatorii');
    expect(categoryForHeading('VI - NUNTII TELEGRAPHICI')?.id).toBe('Nuntii telegraphici');
    expect(categoryForHeading('IX. - ACTA SACRI CONSISTORII.')?.id).toBe('Consistoria');
    expect(categoryForHeading('IX - SACRA CONSISTORIA')?.id).toBe('Consistoria');
    expect(categoryForHeading('VI - CONVENTIO')?.id).toBe('Conventiones');
    expect(categoryForHeading('I – ADHORTATIONES APOSTOLICAE POSTSYNODALES:')?.id).toBe('Adhortationes Apostolicae');
    expect(categoryForHeading('VIII. - ADHORTATIO AD POPULORUM BELLIOERANTIUM MODERATORES.')?.id).toBe('Adhortationes Apostolicae');
    expect(categoryForHeading('IX – NUNTIUS TELEVISIFICUS')?.id).toBe('Nuntii televisifici');
    // The volumes of 1959-1977 (phase 2b-ii-b).
    expect(categoryForHeading('VII - NUNTIUS RADIOTELEVISIFICAS')?.id).toBe('Nuntii radiophonici');
    expect(categoryForHeading('NUNTII RADIOPHONICI ET TELEVISIFICI')?.id).toBe('Nuntii radiophonici');
    expect(categoryForHeading('XI - NUNTII SCRIPTI DATI')?.id).toBe('Nuntii');
    expect(categoryForHeading('NUNTII GRATULATOMI')?.id).toBe('Nuntii gratulatorii');
    expect(categoryForHeading('IV - SOLLEMNIA CANONIZATIONIS')?.id).toBe('Sollemnes canonizationes');
    expect(categoryForHeading('SUMMI PONTIFICIS PEREGRINANTES ITER IN ASIAM ET OCEANIAM')?.id).toBe('Itinera Apostolica');
    expect(categoryForHeading('IN SOLLEMNI RITU INEUNDI CONCILII OECU MENICI VATICANI SECUNDI')?.harvested).toBe('no');
    expect(categoryForHeading('I - SOLLEMNIS PROFESSIO FIDEI')?.classes).toEqual([{ genre: 'apostolic-letter', requires: 'motu-proprio' }]);
    expect(categoryForHeading('RESCRIPTUM EX AUDIENTIA')?.id).toBe('Rescriptum');
    expect(categoryForHeading('XX - DECLARATIO')?.id).toBe('Declaratio');
    expect(normaliseHeading('XI- - ALLOCUTIONES')).toBe('ALLOCUTIONES');
    expect(normaliseHeading('IV - LITTERAE APOSTOLICAE « MOTU PROPRIO» DATAE')).toBe('LITTERAE APOSTOLICAE «MOTU PROPRIO» DATAE');
    expect(normaliseHeading('MOTU PROPRIO DATAE^')).toBe('MOTU PROPRIO DATAE');
    expect(normaliseHeading('I. - CONSTITUTIONES APOSTOLICAE.')).toBe('CONSTITUTIONES APOSTOLICAE');
  });

  it('covers every heading every fixture prints (none is unseen)', () => {
    const { parsed, missing } = loadActaIndexes();
    expect(missing).toEqual([]);
    for (const [key, r] of parsed) expect(r.unseenHeadings, key).toEqual([]);
  });

  it('is printed in the fixtures, row by row, except the anticipated Bullae and Monitum (read only by the Index generalis, not the chronological index)', () => {
    const seen = new Set<string>();
    for (const r of loadActaIndexes().parsed.values()) for (const e of r.entries) seen.add(e.category);
    for (const c of ACTA_CATEGORIES) {
      const printed = c.headings.some((h) => seen.has(h));
      // `MONITUM` (AAS 4, 1912, 745) is a category of the *Index generalis rerum* only
      // (recover.ts's parseIndexGeneralis reads it, for the 1912 *Ex litteris* / `AVVERTENZA.`
      // notice at p. 695); the chronological index files that same act under `EPISTOLAE`, so
      // no entry anywhere is ever categorised `MONITUM` and `seen` never carries it.
      expect(printed, c.id).toBe(c.id !== 'Bullae' && c.id !== 'Monitum');
    }
    // And every heading listed is a heading line of some fixture (alone or joined to the
    // next line), so the table carries no guess: the exceptions are the spec's
    // anticipated BULLAE, the correctly spelt BELLIGERANTIUM and OECUMENICI listed beside
    // the 1917 and 1962 fixtures' OCR spellings, and the four headings phase 2b-iii-b (spec
    // §10) read from the *Index generalis rerum* of the store's whole-volume text, not from
    // the checked-in fixture (a chronological-index extract, which never carries them):
    // CONSTITUTIONES (AAS 1, 1909, 833), MOTU PROPRJO (AAS 8, 1916, 497), ACTA SACRORUM
    // CONSISTORIORUM (AAS 11, 1919, 491) and MONITUM (AAS 4, 1912, 745, `MONITUM, 695.`,
    // glued to its page number, never bare even there).
    const printedLines = new Set<string>();
    for (const src of ACTA_SOURCES) {
      const lines = readFileSync(src.file, 'utf8').split(/\f|\n/).map((l) => l.trim()).filter((l) => l !== '');
      lines.forEach((l, i) => {
        printedLines.add(normaliseHeading(l));
        if (i + 1 < lines.length) printedLines.add(normaliseHeading(`${l} ${lines[i + 1]}`));
      });
    }
    const unprinted = ACTA_CATEGORIES.flatMap((c) => c.headings).filter((h) => !printedLines.has(h));
    expect(unprinted).toEqual(['ADHORTATIO AD POPULORUM BELLIGERANTIUM MODERATORES', 'CONSTITUTIONES', 'MOTU PROPRJO', 'BULLAE', 'ACTA SACRORUM CONSISTORIORUM', 'IN SOLLEMNI RITU INEUNDI CONCILII OECUMENICI VATICANI SECUNDI', 'MONITUM']);
    void parseActaIndex;
  });
});
