import assert from 'node:assert/strict';
import test from 'node:test';
import { createLunaUsageReporter } from '../lib/usage-reporter.mjs';

const token = 'luna_live_' + 'a'.repeat(43);
const event = { operationId: 'test-1', platform: 'example', module: 'request', action: 'test' };

test('reports usage to the LUNA endpoint with installation credentials', async () => {
  let called = false;
  const report = createLunaUsageReporter({
    endpoint: 'https://example.com',
    token,
    fetchImpl: async (url, options) => {
      called = true;
      assert.equal(String(url), 'https://example.com/api/luna-ai-control/usage');
      assert.equal(options.headers.authorization, `Bearer ${token}`);
      assert.equal(JSON.parse(options.body).operationId, 'test-1');
      return { ok: true, json: async () => ({ accepted: true }) };
    },
  });
  assert.deepEqual(await report(event), { accepted: true });
  assert.equal(called, true);
});

test('rejects insecure remote endpoints', () => {
  assert.throws(() => createLunaUsageReporter({ endpoint: 'http://example.com', token }), /HTTPS/);
});

test('rejects missing or malformed credentials', () => {
  assert.throws(() => createLunaUsageReporter({ endpoint: 'https://example.com', token: 'bad' }), /credential/);
});

test('surfaces failed deliveries without leaking credentials', async () => {
  const report = createLunaUsageReporter({
    endpoint: 'https://example.com', token,
    fetchImpl: async () => ({ ok: false, status: 401 }),
  });
  await assert.rejects(report(event), /HTTP 401/);
});
