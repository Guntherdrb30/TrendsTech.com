import { describe, expect, it } from 'vitest';
import { estimateStudioCost } from '../../app/lib/engineering-studio/cost-estimate';

const example = {
  inputTokens: 100_000,
  outputTokens: 20_000,
  inputUsdPerMillion: 2,
  outputUsdPerMillion: 8,
  runs: 1
};

describe('Engineering Studio cost estimation (dry run)', () => {
  it('estimates example without authorizing spend', () => {
    const result = estimateStudioCost(example);
    expect(result.estimatedCents).toBe(36);
    expect(result.billable).toBe(false);
    expect(result.authorizationGranted).toBe(false);
    expect(result.pricingVerified).toBe(false);
  });

  it('scales with the number of runs', () => {
    expect(estimateStudioCost({ ...example, runs: 3 }).estimatedCents).toBe(108);
  });

  it('adds explicit infrastructure estimates without hiding them', () => {
    expect(estimateStudioCost({ ...example, extraCostCents: 50 }).estimatedCents).toBe(86);
  });

  it('rejects negative, fractional or non-finite inputs', () => {
    expect(() => estimateStudioCost({ ...example, runs: 0 })).toThrow();
    expect(() => estimateStudioCost({ ...example, inputTokens: -1 })).toThrow();
    expect(() => estimateStudioCost({ ...example, outputTokens: 1.5 })).toThrow();
    expect(() => estimateStudioCost({ ...example, inputUsdPerMillion: Infinity })).toThrow();
  });
});
