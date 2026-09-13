export type AgentSdkUsage = {
  requests?: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  inputTokensDetails?: Array<Record<string, number>> | Record<string, number>;
};

export type TokenPricing = {
  inputUsdPer1M: number;
  cachedInputUsdPer1M: number;
  outputUsdPer1M: number;
  markupPercent: number;
};

export const DEFAULT_TOKEN_PRICING: TokenPricing = {
  inputUsdPer1M: 0.4,
  cachedInputUsdPer1M: 0.1,
  outputUsdPer1M: 1.6,
  markupPercent: 30
};

function detailRecords(details?: Array<Record<string, number>> | Record<string, number>) {
  if (!details) return [];
  return Array.isArray(details) ? details : [details];
}

export function extractCachedInputTokens(details?: Array<Record<string, number>> | Record<string, number>) {
  return detailRecords(details).reduce((total, record) => {
    return total + Object.entries(record).reduce((subtotal, [key, value]) => {
      if (!/cached/i.test(key) || !Number.isFinite(value)) return subtotal;
      return subtotal + Math.max(0, value);
    }, 0);
  }, 0);
}

export function calculateUsageCost(usage: AgentSdkUsage, pricing: TokenPricing) {
  const cachedInputTokens = Math.min(usage.inputTokens, extractCachedInputTokens(usage.inputTokensDetails));
  const uncachedInputTokens = Math.max(0, usage.inputTokens - cachedInputTokens);

  // Price is USD / 1M tokens. Multiplying tokens by that rate directly yields USD micros.
  const providerCostUsdMicros = Math.round(
    uncachedInputTokens * pricing.inputUsdPer1M +
      cachedInputTokens * pricing.cachedInputUsdPer1M +
      usage.outputTokens * pricing.outputUsdPer1M
  );
  const billableCostUsdMicros = Math.round(providerCostUsdMicros * (1 + pricing.markupPercent / 100));

  return {
    cachedInputTokens,
    uncachedInputTokens,
    providerCostUsdMicros,
    billableCostUsdMicros
  };
}
