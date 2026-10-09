/** Dry-run estimator. No network, database writes, provider calls or authorizations. */
export type StudioCostEstimateInput = {
  inputTokens: number;
  outputTokens: number;
  inputUsdPerMillion: number;
  outputUsdPerMillion: number;
  runs: number;
  extraCostCents?: number;
};

function nonnegativeFinite(value: number) {
  return Number.isFinite(value) && value >= 0;
}

export function estimateStudioCost(input: StudioCostEstimateInput) {
  if (![input.inputTokens, input.outputTokens, input.runs].every(Number.isSafeInteger) ||
      input.inputTokens < 0 || input.outputTokens < 0 || input.runs < 1 ||
      !nonnegativeFinite(input.inputUsdPerMillion) ||
      !nonnegativeFinite(input.outputUsdPerMillion) ||
      !Number.isSafeInteger(input.extraCostCents ?? 0) || (input.extraCostCents ?? 0) < 0) {
    throw new Error('INVALID_ESTIMATE_INPUT');
  }
  const tokensUsd = input.runs * (
    input.inputTokens * input.inputUsdPerMillion +
    input.outputTokens * input.outputUsdPerMillion
  ) / 1_000_000;
  const totalCents = Math.ceil(tokensUsd * 100 - 1e-9) + (input.extraCostCents ?? 0);
  if (!Number.isSafeInteger(totalCents)) throw new Error('INVALID_ESTIMATE_TOTAL');
  return {
    estimatedCents: totalCents,
    estimatedUsd: totalCents / 100,
    billable: false as const,
    authorizationGranted: false as const,
    pricingVerified: false as const,
    note: 'Estimación hipotética; tarifas y límites reales del proveedor deben verificarse antes de cualquier ejecución.'
  };
}
