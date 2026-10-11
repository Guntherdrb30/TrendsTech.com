import assert from 'node:assert/strict';
import test from 'node:test';
import { readBoundedJson, usageEventSchema } from '../../lib/luna-ai-control/usage-validation';

const event = {
  operationId: 'op-1', platform: 'sample-client', module: 'request',
  action: 'generate', provider: 'test', environment: 'test',
  startedAt: '2026-10-11T12:00:00.000Z', completedAt: '2026-10-11T12:00:01.000Z',
  durationMs: 1000, status: 'success',
};

test('accepts a valid client event', () => {
  assert.equal(usageEventSchema.safeParse(event).success, true);
});
test('rejects negative time intervals and impossible durations', () => {
  assert.equal(usageEventSchema.safeParse({ ...event, completedAt: '2026-10-11T11:59:59.000Z' }).success, false);
  assert.equal(usageEventSchema.safeParse({ ...event, durationMs: 3000 }).success, false);
});
test('rejects unknown fields', () => {
  assert.equal(usageEventSchema.safeParse({ ...event, credential: 'secret' }).success, false);
});
test('reads valid JSON within the size limit', async () => {
  const result = await readBoundedJson(new Request('https://example.test', { method: 'POST', body: JSON.stringify(event) }));
  assert.equal(result.ok, true);
});
test('rejects oversized streamed payloads even without content-length', async () => {
  const request = new Request('https://example.test', {
    method: 'POST',
    body: new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode('x'.repeat(17000))); controller.close(); } }),
    duplex: 'half',
  } as RequestInit & { duplex: string });
  const result = await readBoundedJson(request);
  assert.deepEqual(result, { ok: false, status: 413, error: 'Payload too large' });
});
test('rejects malformed JSON', async () => {
  const result = await readBoundedJson(new Request('https://example.test', { method: 'POST', body: '{broken' }));
  assert.deepEqual(result, { ok: false, status: 400, error: 'Invalid JSON' });
});
