/**
 * LUNA AI Security Gateway: pure admission policy.
 * This module does not mutate counters; callers must use atomic shared-store
 * counters and reserve budget before calling a provider.
 */
export type AdmissionInput = {
  authenticated: boolean;
  authorized: boolean;
  agentEnabled: boolean;
  requestsInWindow: number;
  maxRequestsInWindow: number;
  concurrentRequests: number;
  maxConcurrentRequests: number;
  estimatedCostUsd: number;
  remainingBudgetUsd: number;
  circuitOpen: boolean;
};
export type AdmissionDecision =
  | { action: 'allow'; reason: 'within_policy' }
  | { action: 'throttle'; reason: 'rate_limit' | 'concurrency_limit'; retryAfterSeconds: number }
  | { action: 'deny'; reason: 'unauthenticated' | 'forbidden' | 'agent_disabled' | 'budget_exhausted' | 'circuit_open' };

export function evaluateAiAdmission(input: AdmissionInput): AdmissionDecision {
  if (!input.authenticated) return { action: 'deny', reason: 'unauthenticated' };
  if (!input.authorized) return { action: 'deny', reason: 'forbidden' };
  if (!input.agentEnabled) return { action: 'deny', reason: 'agent_disabled' };
  if (![input.requestsInWindow, input.concurrentRequests].every(v => Number.isInteger(v) && v >= 0) ||
      ![input.maxRequestsInWindow, input.maxConcurrentRequests].every(v => Number.isInteger(v) && v > 0)) return { action: 'deny', reason: 'forbidden' };
  if (input.circuitOpen) return { action: 'deny', reason: 'circuit_open' };
  if (!Number.isFinite(input.estimatedCostUsd) || input.estimatedCostUsd < 0 ||
      !Number.isFinite(input.remainingBudgetUsd) || input.remainingBudgetUsd < 0 ||
      input.estimatedCostUsd > input.remainingBudgetUsd) {
    return { action: 'deny', reason: 'budget_exhausted' };
  }
  if (input.concurrentRequests >= input.maxConcurrentRequests) {
    return { action: 'throttle', reason: 'concurrency_limit', retryAfterSeconds: 5 };
  }
  if (input.requestsInWindow >= input.maxRequestsInWindow) {
    return { action: 'throttle', reason: 'rate_limit', retryAfterSeconds: 60 };
  }
  return { action: 'allow', reason: 'within_policy' };
}
