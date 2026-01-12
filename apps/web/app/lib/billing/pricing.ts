import { prisma, type Prisma } from '@trends172tech/db';

export const USD_MICROS_PER_DOLLAR = 1_000_000;

export type TokenPricing = {
  inputUsdPer1M: number;
  outputUsdPer1M: number;
  cachedInputUsdPer1M: number;
  markupPercent: number;
};

const DEFAULT_PRICING: TokenPricing = {
  inputUsdPer1M: 0.4,
  outputUsdPer1M: 1.6,
  cachedInputUsdPer1M: 0.1,
  markupPercent: 30
};

function toNumber(value: Prisma.Decimal | number | null | undefined, fallback: number) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : fallback;
  }
  if (!value) {
    return fallback;
  }
  const numeric = Number(value.toString());
  return Number.isFinite(numeric) ? numeric : fallback;
}

export async function getTokenPricing(): Promise<TokenPricing> {
  const settings = await prisma.globalSettings.findUnique({ where: { id: 1 } });
  if (!settings) {
    return DEFAULT_PRICING;
  }

  return {
    inputUsdPer1M: toNumber(settings.tokenInputUsdPer1M, DEFAULT_PRICING.inputUsdPer1M),
    outputUsdPer1M: toNumber(settings.tokenOutputUsdPer1M, DEFAULT_PRICING.outputUsdPer1M),
    cachedInputUsdPer1M: toNumber(settings.tokenCachedInputUsdPer1M, DEFAULT_PRICING.cachedInputUsdPer1M),
    markupPercent: toNumber(settings.tokenMarkupPercent, DEFAULT_PRICING.markupPercent)
  };
}

export function applyMarkup(value: number, markupPercent: number) {
  return value * (1 + markupPercent / 100);
}

export function computeUsageCostUsdMicros({
  inputTokens,
  outputTokens,
  cachedInputTokens = 0,
  pricing
}: {
  inputTokens: number;
  outputTokens: number;
  cachedInputTokens?: number;
  pricing: TokenPricing;
}) {
  const inputRate = applyMarkup(pricing.inputUsdPer1M, pricing.markupPercent);
  const outputRate = applyMarkup(pricing.outputUsdPer1M, pricing.markupPercent);
  const cachedRate = applyMarkup(pricing.cachedInputUsdPer1M, pricing.markupPercent);

  const inputUsd = (inputTokens / 1_000_000) * inputRate;
  const outputUsd = (outputTokens / 1_000_000) * outputRate;
  const cachedUsd = (cachedInputTokens / 1_000_000) * cachedRate;

  const totalUsd = inputUsd + outputUsd + cachedUsd;
  return Math.max(0, Math.round(totalUsd * USD_MICROS_PER_DOLLAR));
}

export function formatUsdFromMicros(micros: number) {
  const usd = micros / USD_MICROS_PER_DOLLAR;
  return usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}
