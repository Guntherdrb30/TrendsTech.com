import assert from 'node:assert/strict';
import test from 'node:test';
import { summarizeDailyUsage, type LunaActivityEvent } from '../../core/src/luna-ai-control/activity';

const base: LunaActivityEvent = {
  id: 'event-1', installationId: 'installation-1', projectKey: 'luna-football',
  occurredAt: '2026-10-11T12:00:00.000Z', kind: 'request', outcome: 'success',
  requestId: 'request-1', inputTokens: 120, outputTokens: 40, costUsd: 0.01,
};

test('daily usage deduplicates reimported events', () => {
  const result = summarizeDailyUsage([base, base]);
  assert.equal(result.length, 1);
  assert.equal(result[0].requests, 1);
  assert.equal(result[0].inputTokens, 120);
});

test('requests and internal tool calls are counted separately', () => {
  const result = summarizeDailyUsage([
    base,
    { ...base, id: 'event-2', kind: 'tool_call', outcome: 'failure' },
    { ...base, id: 'event-3', projectKey: 'carpihogar', kind: 'api_call' },
  ]);
  assert.equal(result.length, 2);
  assert.equal(result.find(x => x.projectKey === 'luna-football')?.requests, 1);
  assert.equal(result.find(x => x.projectKey === 'luna-football')?.toolCalls, 1);
  assert.equal(result.find(x => x.projectKey === 'luna-football')?.failures, 1);
  assert.equal(result.find(x => x.projectKey === 'carpihogar')?.apiCalls, 1);
});
