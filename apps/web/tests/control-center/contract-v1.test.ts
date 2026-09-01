import test from 'node:test';
import assert from 'node:assert/strict';
import {
  completeControlAgentRunSchema,
  createControlAgentRunEventSchema,
  createControlAgentRunSchema,
  createControlAgentUsageSchema
} from '../../app/lib/control-center/contract-v1';
import { hashControlClientToken } from '../../app/lib/control-center/service-auth';

test('run contract accepts metadata-only shadow telemetry', () => {
  const parsed = createControlAgentRunSchema.safeParse({
    idempotencyKey: 'carpihogar-run-0001',
    implementationKey: 'luna.carpihogar',
    agentTemplateKey: 'sales-agent',
    agentVersion: 1,
    traceId: 'trace-carpihogar-0001',
    channel: 'web',
    inputClass: 'catalog.search',
    actor: { type: 'user', id: 'opaque-user-id' },
    safeMetadata: { source: 'carpihogar' }
  });
  assert.equal(parsed.success, true);
});

test('run contract rejects unbounded identifiers', () => {
  const parsed = createControlAgentRunSchema.safeParse({
    idempotencyKey: 'x'.repeat(129),
    implementationKey: 'luna.carpihogar',
    agentTemplateKey: 'sales-agent',
    agentVersion: 1,
    traceId: 'trace-carpihogar-0001'
  });
  assert.equal(parsed.success, false);
});

test('events, usage, and completion enforce safe shapes', () => {
  assert.equal(createControlAgentRunEventSchema.safeParse({ sequence: 0, eventType: 'skill.started', occurredAt: new Date().toISOString(), skillKey: 'catalog.search' }).success, true);
  assert.equal(createControlAgentUsageSchema.safeParse({ provider: 'openai', model: 'configured-model', inputTokens: 10, outputTokens: 5 }).success, true);
  assert.equal(completeControlAgentRunSchema.safeParse({ status: 'SUCCEEDED' }).success, true);
  assert.equal(completeControlAgentRunSchema.safeParse({ status: 'RUNNING' }).success, false);
});

test('service credential hashing is deterministic without storing plaintext', () => {
  const token = 'trc_carpi01.abcdefghijklmnopqrstuvwxyz123456';
  assert.equal(hashControlClientToken(token), hashControlClientToken(token));
  assert.notEqual(hashControlClientToken(token), token);
});
