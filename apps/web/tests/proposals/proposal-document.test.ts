import assert from 'node:assert/strict';
import { test } from 'node:test';
import { decodeProposal, encodeProposal, proposalDraftSchema, slugSchema, proposalPresentation, type StoredProposal } from '../../app/lib/proposals/document';

import { example } from './fixture';

test('proposal document round-trips without changing visibility or revision', () => {
  const encoded = encodeProposal(example);
  const decoded = decodeProposal(encoded);
  assert.deepEqual(decoded, example);
  assert.ok(encoded.includes('/es/propuestas/cima-barinas'));
});

test('rejects unsafe slugs and malformed proposals', () => {
  const {version, revision, visibility, ...validDraft} = example;
  assert.equal(proposalDraftSchema.safeParse(validDraft).success, true);
  assert.equal(slugSchema.safeParse('../admin').success, false);
  assert.equal(slugSchema.safeParse('CIMA Barinas').success, false);
  assert.equal(proposalDraftSchema.safeParse({...example, capabilities: []}).success, false);
});

test('does not reinterpret legacy proposals as MCP runtime documents', () => {
  assert.equal(decodeProposal('Presentacion: https://www.trends172tech.com/es/propuestas/city-center-maracay'), null);
});

test('CRM exposes only a private preview for unpublished drafts', () => {
  const view = proposalPresentation(encodeProposal(example));
  assert.equal(view?.presentationUrl, null);
  assert.equal(view?.previewPath, '/es/admin/proposals/preview/cima-barinas');
  assert.equal(proposalPresentation(encodeProposal({...example, visibility:'published'}))?.presentationUrl, 'https://www.trends172tech.com/es/propuestas/cima-barinas');
});
test('embedded storage markers cannot forge visibility or revision', () => {
  const forged = encodeProposal({...example,visibility:'published'}).split('\n').at(-1)!;
  assert.throws(() => encodeProposal({...example,introduction:example.introduction+'\n__TRENDS_PROPOSAL_JSON_V1__=invalid'}), /Reserved/);
  assert.equal(decodeProposal(forged+'\n'+encodeProposal(example)),null);
});
