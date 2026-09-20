import { describe, it, expect } from 'vitest';
import { pagelessKey, parseIndexGeneralis } from '../src/acta/recover.js';

describe('pagelessKey', () => {
  it('keys a pageless entry by date, category, incipit and the head of its description', () => {
    expect(pagelessKey({ date: '1921-01-06', category: 'LITTERAE ENCYCLICAE', incipit: 'Sacra propediem', description: 'Ad Patriarchas, Primates, Archiepiscopos, Episcopos aliosque locorum Ordinarios, pacem et communionem cum Apostolica Sede habentes' }))
      .toBe('1921-01-06|LITTERAE ENCYCLICAE|Sacra propediem|Ad Patriarchas, Primates, Archiepiscopos, Episcopos aliosque locor');
    expect(pagelessKey({ date: '1926-03-10', category: 'LITTERAE APOSTOLICAE', incipit: null, description: 'Short' })).toBe('1926-03-10|LITTERAE APOSTOLICAE||Short');
  });
});

// AAS 13 (1921) p. 571, pypdf default mode, as the store text carries it.
const AAS13_GENERALIS = `INDEX GENERALIS ACTORUM
(ANN. XIII — VOL. XIII)
I. - ACTA BENEDICTI PP. XV
EPISTOLAE ENCYCLICAE, 34, 209, 329.
CONSTITUTIONES APOSTOLICAE, 249-255,
299, 336, 370, 409, 457-469, 489.
LITTERAE APOSTOLICAE, 6-9,185-194,294-
307, 339-346, 372-377, 412-422, 469-
473, 491-494, 553.
EPISTOLAE, 10-12, 89-91, 127-131, 195 s.,
218-221, 256, 307, 346 s., 377, 423-429,
473, 494-496, 528-531, 554.
SERMO, 93.
PRECATIONUM FORMULAE, 369, 564.
SACRA CONSISTORIA, 121-126,281-289,521-
527.
II. - ACTA
SACRARUM CONGREGATIONUM
SUPREMA S. CONGREGATIO S. OFFICII :
a) Decreta, 42, 197.
`;

describe('parseIndexGeneralis', () => {
  it('reads the page runs of the pope part, per category, joining a run the line break splits and reading `s.` as the next page', () => {
    const g = parseIndexGeneralis(['front matter', 'body', AAS13_GENERALIS, 'INDEX DOCUMENTORUM\nCHRONOLOGICO ORDINE DIGESTUS']);
    expect(g.page).toBe(3);
    expect(g.runs.get('Litterae Encyclicae')).toEqual([[34, 34], [209, 209], [329, 329]]);
    expect(g.runs.get('Constitutiones Apostolicae')).toEqual([[249, 255], [299, 299], [336, 336], [370, 370], [409, 409], [457, 469], [489, 489]]);
    expect(g.runs.get('Litterae Apostolicae')).toEqual([[6, 9], [185, 194], [294, 307], [339, 346], [372, 377], [412, 422], [469, 473], [491, 494], [553, 553]]);
    expect(g.runs.get('Epistulae')).toEqual([[10, 12], [89, 91], [127, 131], [195, 196], [218, 221], [256, 256], [307, 307], [346, 347], [377, 377], [423, 429], [473, 473], [494, 496], [528, 531], [554, 554]]);
    expect(g.runs.get('Sermones')).toEqual([[93, 93]]);
    // The pope part ends at the dicasteries' part; nothing of it is read.
    expect(g.runs.has('Consistoria')).toBe(true);
    expect([...g.runs.keys()].some((k) => /OFFICII|Decreta/.test(k))).toBe(false);
    expect(g.unmapped).toEqual(['PRECATIONUM FORMULAE']);
  });

  it('returns no page and no runs when the volume has no Index generalis', () => {
    const g = parseIndexGeneralis(['a', 'b', 'INDEX DOCUMENTORUM\nCHRONOLOGICO ORDINE DIGESTUS']);
    expect(g.page).toBeNull();
    expect(g.runs.size).toBe(0);
  });
});
