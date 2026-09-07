import { describe, it, expect } from 'vitest';
import { extractIncipit } from '../src/harvest/incipit.js';

const incipitOf = (h: string) => extractIncipit(h).incipit;

describe('extractIncipit', () => {
  it('is a no-op on a bare incipit, which is the whole flat and Leo XIII era', () => {
    for (const h of ['Quanta semper cura', 'Iucunda equidem', 'Rerum Novarum',
                     'Adiutricem populi', "Dall'alto dell'Apostolico Seggio",
                     'Avkaënsis', 'Tiranensis-Dyrracena', 'Vicariae potestatis in urbe']) {
      expect(extractIncipit(h)).toEqual({ title: h, incipit: h });
    }
  });

  it('always keeps the full heading as the title', () => {
    const h = 'Motu proprio In multis solaciis con il quale conferisce il nome di «Pontificia»';
    expect(extractIncipit(h).title).toBe(h);
  });

  it('strips a leading genre phrase', () => {
    expect(incipitOf('Motu proprio In multis solaciis con il quale conferisce il nome'))
      .toBe('In multis solaciis');
    expect(incipitOf('Lettera Apostolica in forma di «Motu Proprio» La vera bellezza sulla riforma'))
      .toBe('La vera bellezza');
    expect(incipitOf("Lettera Apostolica in forma di 'Motu Proprio' Dominicianus Ordo con la quale"))
      .toBe('Dominicianus Ordo');
  });

  it('prefers the longest matching genre phrase', () => {
    // 'Lettera Apostolica in forma di «Motu Proprio»' must beat 'Lettera Apostolica'.
    expect(incipitOf('Lettera Apostolica in forma di «Motu Proprio» Mutua Concordia del Sommo Pontefice'))
      .toBe('Mutua Concordia');
  });

  it('takes a quoted opening as the incipit', () => {
    expect(incipitOf('"Incomparabilis Magister". Il Santo Padre ha eretto la Provincia Ecclesiastica di Calicut'))
      .toBe('Incomparabilis Magister');
    expect(incipitOf('“C’est la confiance”: Esortazione Apostolica sulla fiducia'))
      .toBe('C’est la confiance');
    expect(incipitOf('Lettera Enciclica "Magnifica Humanitas" di Papa Leone XIV sulla custodia'))
      .toBe('Magnifica Humanitas');
  });

  it('cuts at a gloss connector', () => {
    expect(incipitOf('Quod nobis in condendo, che attribuisce al Pontificio Istituto il potere'))
      .toBe('Quod nobis in condendo');
    expect(incipitOf("Iubilaeum maximum - Bolla di indizione del Giubileo Universale dell'Anno Santo"))
      .toBe('Iubilaeum maximum');
    expect(incipitOf('Ecclesia in Medio Oriente: Esortazione Apostolica Postsinodale sulla Chiesa'))
      .toBe('Ecclesia in Medio Oriente');
    expect(incipitOf('Suavis Nutrix animarum: Il Santo Padre ha eretto la Diocesi di Bariadi'))
      .toBe('Suavis Nutrix animarum');
    expect(incipitOf('Mirabilis Deus, col quale il Pontefice attribuisce a Don Giovanni Bosco'))
      .toBe('Mirabilis Deus');
    expect(incipitOf('Oecumenicum Concilium sulla recita del Rosario per la riuscita del Concilio'))
      .toBe('Oecumenicum Concilium');
    expect(incipitOf('Dès le début ai Capi dei popoli belligeranti invitandoli a trovare la pace'))
      .toBe('Dès le début');
    expect(incipitOf('Il Film Ideale - Esortazioni ai rappresentanti del mondo cinematografico'))
      .toBe('Il Film Ideale');
    expect(incipitOf("Esortazione Apostolica Dilexi te del Santo Padre Leone XIV, sull'amore ai poveri"))
      .toBe('Dilexi te');
  });

  it('returns null when the residue continues the genre phrase in lower case', () => {
    // An incipit is capitalised or quoted; a lower-case residue is gloss, not incipit.
    for (const h of [
      'Lettera Apostolica (breve) che proclama Santa Chiara Patrona Celeste della Televisione',
      'Lettera a S. E. Monsignor Luigi Agostino Marmottin, in occasione della celebrazione',
      'Chirografo al Cardinale Eugenio Pacelli, affidando al Cardinale Segretario di Stato',
      'Lettera Apostolica inviata a nome del Santo Padre dal Segretario di Stato',
      'Lettera Apostolica data Motu Proprio su alcune modifiche alle norme relative',
      'Lettera apostolica in forma di Motu Proprio con la quale si affida alla Congregazione',
      'Lettera Apostolica per la costituzione della Nunziatura Apostolica nella Repubblica',
    ]) {
      expect(incipitOf(h), h).toBeNull();
    }
  });

  it('returns null for a bare genre word and for an empty heading', () => {
    expect(incipitOf('Lettera Apostolica')).toBeNull();
    expect(incipitOf('Bolla')).toBeNull();
    expect(incipitOf('   ')).toBeNull();
  });

  it('returns null for a long uncut heading, which is a gloss the rules did not recognise', () => {
    expect(incipitOf('Sancti Vladimiri Magni in urbe Parisiensi pro Ucrainis ritus Byzantini'))
      .toBeNull();
  });

  it('does not apply the word ceiling to a heading the rules did cut', () => {
    // The ceiling exists to catch un-cut glosses. A cut result is trusted at any length.
    expect(incipitOf('Sancti Vladimiri Magni in urbe Parisiensi pro Ucrainis ritus Byzantini: eretta'))
      .toBe('Sancti Vladimiri Magni in urbe Parisiensi pro Ucrainis ritus Byzantini');
  });
});
