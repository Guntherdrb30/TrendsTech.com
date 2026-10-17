import assert from 'node:assert/strict';
import test from 'node:test';
import { validateMobileMemory, normalizedGitHubRepo, isRecentGitHubCommit } from '../../app/lib/engineering-studio/memory-contract';

test('mobile memory accepts concise summaries and decisions', () => {
  const valid = validateMobileMemory({type:'DECISION',title:' Sprint 4 ',content:' Se aprobó la arquitectura. '});
  assert.equal(valid.type,'DECISION');
  assert.equal(valid.title,'Sprint 4');
  assert.equal(valid.content,'Se aprobó la arquitectura.');
});

test('mobile memory rejects unknown types or empty content', () => {
  assert.throws(() => validateMobileMemory({type:'SECRET',title:'Privado',content:'Este texto no se guarda.'}));
  assert.throws(() => validateMobileMemory({type:'NOTE',title:' X ',content:'breve'}));
});

test('GitHub repository normalization accepts only exact owner/repo', () => {
  assert.equal(normalizedGitHubRepo('https://github.com/Guntherdrb30/TrendsTech.com.git'), 'Guntherdrb30/TrendsTech.com');
  assert.equal(normalizedGitHubRepo('git@github.com:Guntherdrb30/TrendsTech.com.git'), 'Guntherdrb30/TrendsTech.com');
  assert.equal(normalizedGitHubRepo('https://other.com/no/repo'), null);
  assert.equal(normalizedGitHubRepo('foo/bar/extra'), null);
});

test('recent GitHub activity respects the 24-hour window', () => {
  const now=Date.parse('2026-10-17T12:00:00Z');
  assert.equal(isRecentGitHubCommit('2026-10-17T11:00:00Z',now), true);
  assert.equal(isRecentGitHubCommit('2026-10-15T11:00:00Z',now), false);
  assert.equal(isRecentGitHubCommit('not-a-date',now), false);
});
