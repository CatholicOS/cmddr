import { describe, it, expect } from 'vitest';
import { assignProvisionalOrdinals } from '../src/harvest/ordinals.js';
import type { DocumentRecord } from '../src/types.js';

/** A minimal synthetic provisional record, all sharing the same base (pre-ordinal) id
 *  unless overridden -- i.e. the same issuer/genre-slug/date collision group. */
const provisional = (over: Partial<DocumentRecord> = {}): DocumentRecord => ({
  id: 'mag:pius-x/letter-1905-06-14',
  title: 'Untitled',
  idStatus: 'provisional',
  genre: 'letter',
  issuerId: 'rp:pius-x',
  issuerType: 'pope',
  date: '1905-06-14',
  ...over,
});

describe('assignProvisionalOrdinals', () => {
  it('gives a group of two a dense, 1-based ordinal in title order', () => {
    const beta = provisional({ title: 'Beta document' });
    const alpha = provisional({ title: 'Alpha document' });
    assignProvisionalOrdinals([beta, alpha]);
    expect(alpha.id).toBe('mag:pius-x/letter-1905-06-14-1');
    expect(beta.id).toBe('mag:pius-x/letter-1905-06-14-2');
  });

  it('leaves a group of one with no ordinal at all', () => {
    const lone = provisional({ title: 'Only document' });
    assignProvisionalOrdinals([lone]);
    expect(lone.id).toBe('mag:pius-x/letter-1905-06-14');
  });

  it('is stable: the same records in a different initial array order get the same ids', () => {
    // Same collision group as the first test, constructed fresh so mutation from one
    // ordering cannot leak into the other, but fed in the opposite array order.
    const alpha1 = provisional({ title: 'Alpha document' });
    const beta1 = provisional({ title: 'Beta document' });
    assignProvisionalOrdinals([beta1, alpha1]);

    const alpha2 = provisional({ title: 'Alpha document' });
    const beta2 = provisional({ title: 'Beta document' });
    assignProvisionalOrdinals([alpha2, beta2]);

    expect(alpha1.id).toBe(alpha2.id);
    expect(beta1.id).toBe(beta2.id);
    expect(alpha1.id).toBe('mag:pius-x/letter-1905-06-14-1');
    expect(beta1.id).toBe('mag:pius-x/letter-1905-06-14-2');
  });

  it('does not touch a minted record sharing no id with any provisional group', () => {
    const minted = provisional({
      id: 'mag:pius-x/quanta-cura-1905', idStatus: 'minted', incipit: 'Quanta Cura',
    });
    assignProvisionalOrdinals([minted]);
    expect(minted.id).toBe('mag:pius-x/quanta-cura-1905');
  });

  it('groups only within the same base id, leaving an unrelated provisional group of one alone', () => {
    const a = provisional({ title: 'Beta document' });
    const b = provisional({ title: 'Alpha document' });
    const other = provisional({ id: 'mag:pius-x/motu-proprio-1911-06-28', date: '1911-06-28', title: 'Solo document' });
    assignProvisionalOrdinals([a, b, other]);
    expect(a.id).toBe('mag:pius-x/letter-1905-06-14-2');
    expect(b.id).toBe('mag:pius-x/letter-1905-06-14-1');
    expect(other.id).toBe('mag:pius-x/motu-proprio-1911-06-28');
  });
});
