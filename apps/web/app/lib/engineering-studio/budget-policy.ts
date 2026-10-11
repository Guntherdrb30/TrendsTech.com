/** Pure policy rules. Server-side transactional enforcement is a separate required gate. */
export const GNB_PILOT_POLICY = Object.freeze({
  projectKey: 'gnb-institutional-demo',
  currency: 'USD',
  initialLimitCents: 1_000,
  globalCeilingCents: 10_000,
  warningThresholdsCents: [750, 900] as const
});

export type BudgetSnapshot = {
  activeLimitCents: number;
  globalCeilingCents: number;
  confirmedCents: number;
  reservedCents: number;
};

export type BudgetDecision =
  | { allowed: true; remainingAfterReservationCents: number }
  | { allowed: false; reason: 'INVALID_AMOUNT' | 'INVALID_SNAPSHOT' | 'ACTIVE_LIMIT_EXCEEDED' };

function validCents(value: number) {
  return Number.isSafeInteger(value) && value >= 0;
}

/** All amounts are integer USD cents; no floating-point currency arithmetic. */
export function evaluateBudgetReservation(snapshot: BudgetSnapshot, requestedCents: number): BudgetDecision {
  if (!validCents(requestedCents) || requestedCents === 0) {
    return { allowed: false, reason: 'INVALID_AMOUNT' };
  }
  const values = [
    snapshot.activeLimitCents, snapshot.globalCeilingCents,
    snapshot.confirmedCents, snapshot.reservedCents
  ];
  if (values.some(value => !validCents(value)) ||
      snapshot.activeLimitCents > snapshot.globalCeilingCents ||
      snapshot.confirmedCents + snapshot.reservedCents > snapshot.globalCeilingCents) {
    return { allowed: false, reason: 'INVALID_SNAPSHOT' };
  }
  const available = Math.min(snapshot.activeLimitCents, snapshot.globalCeilingCents)
    - snapshot.confirmedCents - snapshot.reservedCents;
  if (requestedCents > available) {
    return { allowed: false, reason: 'ACTIVE_LIMIT_EXCEEDED' };
  }
  return { allowed: true, remainingAfterReservationCents: available - requestedCents };
}

/**
 * A requested increase must be independently approved and persisted.
 * This function deliberately does not authorize any increase.
 */
export function validateApprovedActiveLimit(nextLimitCents: number, globalCeilingCents: number) {
  return validCents(nextLimitCents) && validCents(globalCeilingCents)
    && nextLimitCents > 0 && nextLimitCents <= globalCeilingCents;
}
