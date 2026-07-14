import test from 'node:test';
import assert from 'node:assert/strict';
import { checkRateLimit, getRequestIdentifier, resetRateLimitStoreForTests } from '../../app/lib/security/rate-limit';

test('rate limiter blocks requests after the configured limit', () => {
  resetRateLimitStoreForTests();
  const options = { namespace: 'test', limit: 2, windowMs: 60_000 };

  assert.equal(checkRateLimit('client-a', options, 1_000).allowed, true);
  assert.equal(checkRateLimit('client-a', options, 1_001).allowed, true);
  assert.equal(checkRateLimit('client-a', options, 1_002).allowed, false);
  assert.equal(checkRateLimit('client-b', options, 1_002).allowed, true);
});

test('rate limiter resets after the window expires', () => {
  resetRateLimitStoreForTests();
  const options = { namespace: 'reset-test', limit: 1, windowMs: 1_000 };

  assert.equal(checkRateLimit('client', options, 1_000).allowed, true);
  assert.equal(checkRateLimit('client', options, 1_500).allowed, false);
  assert.equal(checkRateLimit('client', options, 2_001).allowed, true);
});

test('request identifier uses the first forwarded address', () => {
  const request = new Request('https://example.com', {
    headers: { 'x-forwarded-for': '203.0.113.10, 10.0.0.1' }
  });
  assert.equal(getRequestIdentifier(request), '203.0.113.10');
});
