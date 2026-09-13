import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateUsageCost, extractCachedInputTokens } from '../../app/lib/agent-platform/usage-cost';

test('extractCachedInputTokens aggregates cached detail records', () => {
  assert.equal(extractCachedInputTokens([{ cached_tokens: 250 }, { cachedTokens: 100 }]), 350);
});

test('calculateUsageCost separates cached input and applies markup', () => {
  const result = calculateUsageCost(
    {
      inputTokens: 1_000_000,
      outputTokens: 500_000,
      totalTokens: 1_500_000,
      inputTokensDetails: [{ cached_tokens: 250_000 }]
    },
    {
      inputUsdPer1M: 0.4,
      cachedInputUsdPer1M: 0.1,
      outputUsdPer1M: 1.6,
      markupPercent: 30
    }
  );

  assert.equal(result.cachedInputTokens, 250_000);
  assert.equal(result.uncachedInputTokens, 750_000);
  assert.equal(result.providerCostUsdMicros, 1_125_000);
  assert.equal(result.billableCostUsdMicros, 1_462_500);
});

test('cached tokens never exceed total input tokens', () => {
  const result = calculateUsageCost(
    { inputTokens: 100, outputTokens: 0, totalTokens: 100, inputTokensDetails: [{ cached_tokens: 500 }] },
    { inputUsdPer1M: 1, cachedInputUsdPer1M: 0.5, outputUsdPer1M: 2, markupPercent: 0 }
  );
  assert.equal(result.cachedInputTokens, 100);
  assert.equal(result.uncachedInputTokens, 0);
});
