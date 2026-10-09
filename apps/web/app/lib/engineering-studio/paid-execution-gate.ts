import 'server-only';

import { getStudioSpendSnapshot, reserveStudioSpend, settleStudioSpend } from './spend-guard';

/**
 * Single entrypoint for future billable Studio model invocations.
 * No provider is connected here: this module cannot spend money on its own.
 * A provider adapter must report confirmed charges and guarantee a maximum
 * billable amount before it can be passed to this gate.
 */
export type BoundedPaidInvocation<T> = {
  projectId: string;
  runId: string;
  providerRequestKey: string;
  maximumChargeCents: number;
  invoke: () => Promise<{ output: T; confirmedChargeCents: number }>;
};

export async function runBoundedPaidInvocation<T>(input: BoundedPaidInvocation<T>) {
  if (!input.projectId || !input.runId || !input.providerRequestKey) {
    throw new Error('PAID_RUN_MISSING_IDENTITY');
  }
  if (!Number.isSafeInteger(input.maximumChargeCents) || input.maximumChargeCents <= 0) {
    throw new Error('PAID_RUN_UNBOUNDED_COST');
  }
  // A paused/missing project budget is never interpreted as free capacity.
  const snapshot = await getStudioSpendSnapshot(input.projectId);
  if (!snapshot.configured || snapshot.paused || !snapshot.canStartPaidRun) {
    throw new Error('PAID_RUN_BUDGET_NOT_ACTIVE');
  }
  const key = `run:${input.runId}:provider:${input.providerRequestKey}`;
  const reservation = await reserveStudioSpend(input.projectId, key, input.maximumChargeCents);
  // Idempotent reservation is not permission to call a provider twice.
  if (reservation.reused || reservation.status !== 'RESERVED') {
    throw new Error('PAID_RUN_ALREADY_RESERVED');
  }

  try {
    const response = await input.invoke();
    const charge = response.confirmedChargeCents;
    if (!Number.isSafeInteger(charge) || charge < 0 || charge > input.maximumChargeCents) {
      // Leave funds reserved for manual reconciliation: never assume a zero charge.
      throw new Error('PAID_RUN_CHARGE_REQUIRES_RECONCILIATION');
    }
    await settleStudioSpend(input.projectId, reservation.reservationId, charge);
    return response.output;
  } catch (error) {
    // Do not release reservation on unknown provider failure. A timeout can
    // occur after a successful charge. Reconcile with provider first.
    throw error;
  }
}
