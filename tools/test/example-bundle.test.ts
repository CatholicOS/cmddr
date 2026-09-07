import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const bundle = JSON.parse(readFileSync('examples/evangelium-vitae.json', 'utf8'));

function compile() {
  const ajv = new Ajv2020({ strict: false });
  addFormats(ajv);
  for (const f of ['genre', 'document', 'assessment']) {
    ajv.addSchema(JSON.parse(readFileSync(`schema/${f}.schema.json`, 'utf8')));
  }
  return ajv.compile(JSON.parse(readFileSync('schema/example-bundle.schema.json', 'utf8')));
}

describe('examples/evangelium-vitae.json', () => {
  it('validates against the bundle schema', () => {
    const validate = compile();
    const ok = validate(bundle);
    if (!ok) throw new Error(JSON.stringify(validate.errors, null, 2));
    expect(ok).toBe(true);
  });

  it('uses the new document id and prefixed issuer', () => {
    expect(bundle.document.id).toBe('mag:john-paul-ii/evangelium-vitae-1995');
    expect(bundle.document.issuerId).toBe('rp:john-paul-ii');
    expect(bundle.document.incipit).toBe('Evangelium Vitae');
    expect(bundle.document.sigla).toBe('EV');
    expect(bundle.document.idStatus).toBe('minted');
  });

  it('keys every assessment with a # locus on the parent document', () => {
    for (const a of bundle.assessments) {
      expect(a.document).toBe('mag:john-paul-ii/evangelium-vitae-1995');
      expect(a.id).toBe(`mag:john-paul-ii/evangelium-vitae-1995#${a.section}`);
    }
    expect(bundle.assessments.map((a: { id: string }) => a.id)).toContain(
      'mag:john-paul-ii/evangelium-vitae-1995#*');
  });
});
