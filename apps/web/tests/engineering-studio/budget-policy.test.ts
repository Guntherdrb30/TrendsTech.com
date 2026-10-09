import { describe, expect, it } from 'vitest';
import {
  GNB_PILOT_POLICY, evaluateBudgetReservation, validateApprovedActiveLimit
} from '../../app/lib/engineering-studio/budget-policy';

const base = {
  activeLimitCents: GNB_PILOT_POLICY.initialLimitCents,
  globalCeilingCents: GNB_PILOT_POLICY.globalCeilingCents,
  confirmedCents: 0,
  reservedCents: 0
};

describe('Engineering Studio budget policy (pure rules)', () => {
  it('starts at USD 10, not the USD 100 global ceiling', () => {
    expect(GNB_PILOT_POLICY.initialLimitCents).toBe(1000);
    expect(GNB_PILOT_POLICY.globalCeilingCents).toBe(10000);
  });
  it('rejects a USD 11 reservation', () => {
    expect(evaluateBudgetReservation(base, 1100)).toEqual({
      allowed: false, reason: 'ACTIVE_LIMIT_EXCEEDED'
    });
  });
  it('allows exactly USD 10 once', () => {
    expect(evaluateBudgetReservation(base, 1000)).toEqual({
      allowed: true, remainingAfterReservationCents: 0
    });
    expect(evaluateBudgetReservation({ ...base, reservedCents: 1000 }, 1)).toEqual({
      allowed: false, reason: 'ACTIVE_LIMIT_EXCEEDED'
    });
  });
  it('rejects a second USD 6 request against an already reserved USD 6', () => {
    expect(evaluateBudgetReservation({ ...base, reservedCents: 600 }, 600)).toEqual({
      allowed: false, reason: 'ACTIVE_LIMIT_EXCEEDED'
    });
  });
  it('fails closed for invalid currency amounts and snapshots', () => {
    expect(evaluateBudgetReservation(base, Number.NaN)).toEqual({
      allowed: false, reason: 'INVALID_AMOUNT'
    });
    expect(evaluateBudgetReservation(base, 1.5)).toEqual({
      allowed: false, reason: 'INVALID_AMOUNT'
    });
    expect(evaluateBudgetReservation({ ...base, confirmedCents: -1 }, 100)).toEqual({
      allowed: false, reason: 'INVALID_SNAPSHOT'
    });
  });
  it('never permits an active limit above the global ceiling', () => {
    expect(validateApprovedActiveLimit(10001, 10000)).toBe(false);
    expect(validateApprovedActiveLimit(1000, 10000)).toBe(true);
  });
});
