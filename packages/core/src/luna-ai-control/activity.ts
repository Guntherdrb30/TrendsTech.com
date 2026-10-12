/** Stable event envelope for LUNA installation usage and historical reconstruction. */
export type LunaActivityKind = 'request' | 'tool_call' | 'api_call' | 'deployment' | 'repository_change';
export type LunaActivityOutcome = 'success' | 'failure' | 'denied';
export interface LunaActivityEvent {
  id: string;
  installationId: string;
  projectKey: string;
  occurredAt: string;
  kind: LunaActivityKind;
  outcome: LunaActivityOutcome;
  requestId: string;
  actorId?: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
  durationMs?: number;
  source?: 'runtime' | 'github_import';
  sourceId?: string;
}
export interface LunaDailyUsage {
  day: string;
  projectKey: string;
  requests: number;
  toolCalls: number;
  apiCalls: number;
  failures: number;
  inputTokens: number;
  outputTokens: number;
  costUsd: number;
}
/** Deduplicate retries and backfills by immutable event ID, not by request ID. */
export function summarizeDailyUsage(events: readonly LunaActivityEvent[]): LunaDailyUsage[] {
  const seen = new Set<string>();
  const totals = new Map<string, LunaDailyUsage>();
  for (const event of events) {
    if (seen.has(event.id)) continue;
    seen.add(event.id);
    const day = new Date(event.occurredAt).toISOString().slice(0, 10);
    const key = JSON.stringify([day, event.projectKey]);
    let row = totals.get(key);
    if (!row) {
      row = { day, projectKey: event.projectKey, requests: 0, toolCalls: 0, apiCalls: 0, failures: 0, inputTokens: 0, outputTokens: 0, costUsd: 0 };
      totals.set(key, row);
    }
    if (event.kind === 'request') row.requests++;
    if (event.kind === 'tool_call') row.toolCalls++;
    if (event.kind === 'api_call') row.apiCalls++;
    if (event.outcome === 'failure') row.failures++;
    row.inputTokens += event.inputTokens ?? 0;
    row.outputTokens += event.outputTokens ?? 0;
    row.costUsd += event.costUsd ?? 0;
  }
  return [...totals.values()].sort((a, b) => a.day.localeCompare(b.day) || a.projectKey.localeCompare(b.projectKey));
}
