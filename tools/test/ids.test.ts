import { describe, it, expect } from 'vitest';
import {
  MINTED_ID_RE, PROVISIONAL_ID_RE, issuerLocalPart, mintId, mintProvisionalId, parseId,
} from '../src/ids.js';

describe('issuerLocalPart', () => {
  it('strips the registry prefix', () => {
    expect(issuerLocalPart('rp:leo-xiii')).toBe('leo-xiii');
    expect(issuerLocalPart('oec:vatican-i')).toBe('vatican-i');
  });
  it('rejects an unprefixed issuer', () => {
    expect(() => issuerLocalPart('leo-xiii')).toThrow(/prefix/i);
  });
});

describe('mintId', () => {
  it('mints issuer/incipit-year', () => {
    expect(mintId('rp:leo-xiii', 'Rerum Novarum', '1891-05-15'))
      .toBe('mag:leo-xiii/rerum-novarum-1891');
    expect(mintId('rp:leo-xiii', 'Depuis le Jour', '1899-09-08'))
      .toBe('mag:leo-xiii/depuis-le-jour-1899');
  });

  it('namespaces conciliar documents under the council, not the promulgator', () => {
    expect(mintId('oec:vatican-i', 'Pastor Aeternus', '1870-07-18'))
      .toBe('mag:vatican-i/pastor-aeternus-1870');
  });

  it('distinguishes same-pope same-genre incipit collisions by year', () => {
    expect(mintId('rp:pius-ix', 'Ubi primum', '1847-06-17')).toBe('mag:pius-ix/ubi-primum-1847');
    expect(mintId('rp:pius-ix', 'Ubi primum', '1849-02-02')).toBe('mag:pius-ix/ubi-primum-1849');
  });

  it('extends to the full date when asked', () => {
    expect(mintId('rp:pius-ix', 'Ubi primum', '1849-02-02', { fullDate: true }))
      .toBe('mag:pius-ix/ubi-primum-1849-02-02');
  });

  it('produces ids matching MINTED_ID_RE', () => {
    expect(MINTED_ID_RE.test(mintId('rp:leo-xiii', 'Rerum Novarum', '1891-05-15'))).toBe(true);
  });
});

describe('mintProvisionalId', () => {
  it('uses genre plus full date', () => {
    expect(mintProvisionalId('rp:francis-i', 'angelus', '2015-03-22'))
      .toBe('mag:francis-i/angelus-2015-03-22');
  });
  it('appends an ordinal when a date carries more than one', () => {
    expect(mintProvisionalId('rp:francis-i', 'angelus', '2015-03-22', 2))
      .toBe('mag:francis-i/angelus-2015-03-22-2');
  });
  it('produces ids matching PROVISIONAL_ID_RE', () => {
    expect(PROVISIONAL_ID_RE.test(mintProvisionalId('rp:francis-i', 'angelus', '2015-03-22')))
      .toBe(true);
  });
});

describe('parseId', () => {
  it('round-trips a minted id', () => {
    expect(parseId('mag:leo-xiii/rerum-novarum-1891'))
      .toEqual({ issuer: 'leo-xiii', slug: 'rerum-novarum', year: '1891' });
  });
  it('parses a full-date id', () => {
    expect(parseId('mag:pius-ix/ubi-primum-1849-02-02'))
      .toEqual({ issuer: 'pius-ix', slug: 'ubi-primum', year: '1849' });
  });
  it('returns null for a malformed id', () => {
    expect(parseId('md:leo-xiii/rerum-novarum-1891')).toBeNull();
    expect(parseId('mag:leo-xiii/rerum-novarum')).toBeNull();
  });

  it('parses an ordinal-free provisional id', () => {
    expect(parseId('mag:francis-i/angelus-2015-03-22'))
      .toEqual({ issuer: 'francis-i', slug: 'angelus', year: '2015' });
  });

  it('parses an ordinal-suffixed provisional id', () => {
    expect(parseId('mag:francis-i/angelus-2015-03-22-2'))
      .toEqual({ issuer: 'francis-i', slug: 'angelus', year: '2015' });
  });

  it('parses a collision-resolved minted id to its year', () => {
    expect(parseId('mag:pius-ix/ubi-primum-1849-02-02'))
      .toEqual({ issuer: 'pius-ix', slug: 'ubi-primum', year: '1849' });
  });
});
