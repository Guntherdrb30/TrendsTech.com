import 'server-only';

import { randomUUID } from 'node:crypto';
import { Prisma, prisma } from '@trends172tech/db';
import { dispatchStudioEvent } from './workflow-engine';

type WatcherRow = {
  id: string;
  projectId: string | null;
  name: string;
  kind: string;
  severity: string;
  conditionJson: unknown;
  cooldownMinutes: number;
  lastTriggeredAt: Date | null;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

async function activeWatchers(projectId?: string) {
  return prisma.$queryRaw<WatcherRow[]>(Prisma.sql`
    SELECT "id","projectId","name","kind","severity","conditionJson","cooldownMinutes","lastTriggeredAt"
    FROM "StudioWatcher"
    WHERE "status"='ACTIVE'
      AND (${projectId || null}::text IS NULL OR "projectId" IS NULL OR "projectId"=${projectId || null})
    ORDER BY "createdAt" ASC
  `);
}

async function evaluate(watcher: WatcherRow) {
  const cfg = record(watcher.conditionJson);
  const projectId = watcher.projectId;
  if (!projectId) return { triggered: false, state: 'GLOBAL_REQUIRES_AGGREGATOR', details: {} };

  switch (watcher.kind) {
    case 'FAILED_RUNS': {
      const minutes = Number(cfg.lookbackMinutes || 60);
      const rows = await prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
        SELECT COUNT(*)::bigint AS "count" FROM "StudioAgentRun"
        WHERE "projectId"=${projectId} AND "status" IN ('FAILED','ERROR')
          AND "createdAt" >= CURRENT_TIMESTAMP - (${minutes} * INTERVAL '1 minute')
      `);
      const count = Number(rows[0]?.count || 0);
      return { triggered: count > 0, state: count > 0 ? 'ALERT' : 'OK', details: { failedRuns: count, lookbackMinutes: minutes } };
    }
    case 'BLOCKED_RUNS': {
      const rows = await prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
        SELECT COUNT(*)::bigint AS "count" FROM "StudioAgentRun"
        WHERE "projectId"=${projectId} AND "status" IN ('BLOCKED','BLOCKED_CONFIGURATION','WAITING_APPROVAL')
      `);
      const count = Number(rows[0]?.count || 0);
      return { triggered: count > 0, state: count > 0 ? 'ALERT' : 'OK', details: { blockedRuns: count } };
    }
    case 'PENDING_APPROVALS': {
      const hours = Number(cfg.olderThanHours || 4);
      const rows = await prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
        SELECT COUNT(*)::bigint AS "count" FROM "StudioApproval"
        WHERE "projectId"=${projectId} AND "status"='PENDING'
          AND "requestedAt" <= CURRENT_TIMESTAMP - (${hours} * INTERVAL '1 hour')
      `);
      const count = Number(rows[0]?.count || 0);
      return { triggered: count > 0, state: count > 0 ? 'ALERT' : 'OK', details: { pendingApprovals: count, olderThanHours: hours } };
    }
    case 'BUDGET_THRESHOLD': {
      const percent = Number(cfg.percent || 80);
      const forecast = await prisma.$queryRaw<Array<{ internalForecast: unknown }>>(Prisma.sql`
        SELECT "internalForecast" FROM "StudioBudgetForecast" WHERE "projectId"=${projectId} ORDER BY "version" DESC LIMIT 1
      `);
      const costs = await prisma.$queryRaw<Array<{ total: unknown }>>(Prisma.sql`
        SELECT COALESCE(SUM("amount"),0) AS "total" FROM "StudioCostEntry" WHERE "projectId"=${projectId}
      `);
      const budget = Number(forecast[0]?.internalForecast || 0);
      const actual = Number(costs[0]?.total || 0);
      const usage = budget > 0 ? (actual / budget) * 100 : 0;
      return { triggered: budget > 0 && usage >= percent, state: budget > 0 && usage >= percent ? 'ALERT' : 'OK', details: { thresholdPercent: percent, usagePercent: usage, actual, forecast: budget } };
    }
    default:
      return { triggered: false, state: 'UNSUPPORTED', details: { kind: watcher.kind } };
  }
}

export async function runStudioWatchers(projectId?: string) {
  const watchers = await activeWatchers(projectId);
  const results: Array<Record<string, unknown>> = [];
  const now = new Date();

  for (const watcher of watchers) {
    const evaluation = await evaluate(watcher);
    const cooldownActive = watcher.lastTriggeredAt
      ? now.getTime() - watcher.lastTriggeredAt.getTime() < watcher.cooldownMinutes * 60_000
      : false;

    await prisma.$executeRaw(Prisma.sql`
      UPDATE "StudioWatcher" SET "lastCheckedAt"=CURRENT_TIMESTAMP,"lastState"=${evaluation.state},"updatedAt"=CURRENT_TIMESTAMP WHERE "id"=${watcher.id}
    `);

    let eventId: string | null = null;
    if (evaluation.triggered && !cooldownActive && watcher.projectId) {
      const eventType = watcher.kind === 'BUDGET_THRESHOLD' ? 'BUDGET_THRESHOLD_REACHED' : 'PROJECT_BLOCKED';
      const dispatched = await dispatchStudioEvent({
        projectId: watcher.projectId,
        eventType,
        actorType: 'WATCHER',
        actorRef: watcher.id,
        message: `${watcher.name}: ${watcher.severity}`,
        payload: { watcherId: watcher.id, kind: watcher.kind, severity: watcher.severity, ...evaluation.details }
      });
      eventId = dispatched.eventId;
      await prisma.$executeRaw(Prisma.sql`UPDATE "StudioWatcher" SET "lastTriggeredAt"=CURRENT_TIMESTAMP WHERE "id"=${watcher.id}`);
    }
    results.push({ watcherId: watcher.id, name: watcher.name, ...evaluation, cooldownActive, eventId });
  }

  return { runId: randomUUID(), checkedAt: now.toISOString(), checked: watchers.length, results };
}
