import 'server-only';

import { Prisma, prisma } from '@trends172tech/db';

export type WorkflowSummary = {
  id: string;
  projectId: string | null;
  projectName: string | null;
  name: string;
  description: string | null;
  status: string;
  mode: string;
  priority: number;
  maxExecutionsPerHour: number;
  triggerCount: bigint;
  actionCount: bigint;
  runCount: bigint;
  failedRunCount: bigint;
  waitingRunCount: bigint;
  lastRunAt: Date | null;
  lastRunStatus: string | null;
};

export type WorkflowRunSummary = {
  id: string;
  workflowId: string;
  workflowName: string;
  projectId: string | null;
  projectName: string | null;
  triggerType: string;
  triggerEventId: string | null;
  status: string;
  currentPosition: number | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  errorSummary: string | null;
  createdAt: Date;
};

export type WatcherSummary = {
  id: string;
  projectId: string | null;
  projectName: string | null;
  name: string;
  kind: string;
  status: string;
  severity: string;
  cooldownMinutes: number;
  lastCheckedAt: Date | null;
  lastTriggeredAt: Date | null;
  lastState: string | null;
  notifyChannel: string;
};

export type ActionRunSummary = {
  id: string;
  workflowRunId: string;
  workflowName: string;
  actionType: string;
  actionPosition: number;
  status: string;
  agentKey: string | null;
  approvalId: string | null;
  agentRunId: string | null;
  startedAt: Date | null;
  finishedAt: Date | null;
  errorSummary: string | null;
};

export async function getWorkflowControlSnapshot() {
  const [workflows, runs, watchers, actionRuns, totals] = await Promise.all([
    prisma.$queryRaw<WorkflowSummary[]>(Prisma.sql`
      SELECT
        w."id", w."projectId", p."name" AS "projectName", w."name", w."description", w."status", w."mode", w."priority",
        w."maxExecutionsPerHour",
        (SELECT COUNT(*)::bigint FROM "StudioWorkflowTrigger" t WHERE t."workflowId" = w."id") AS "triggerCount",
        (SELECT COUNT(*)::bigint FROM "StudioWorkflowAction" a WHERE a."workflowId" = w."id") AS "actionCount",
        (SELECT COUNT(*)::bigint FROM "StudioWorkflowRun" r WHERE r."workflowId" = w."id") AS "runCount",
        (SELECT COUNT(*)::bigint FROM "StudioWorkflowRun" r WHERE r."workflowId" = w."id" AND r."status" = 'FAILED') AS "failedRunCount",
        (SELECT COUNT(*)::bigint FROM "StudioWorkflowRun" r WHERE r."workflowId" = w."id" AND r."status" IN ('WAITING_APPROVAL','WAITING_EXECUTOR','QUEUED','RUNNING')) AS "waitingRunCount",
        lr."createdAt" AS "lastRunAt", lr."status" AS "lastRunStatus"
      FROM "StudioWorkflow" w
      LEFT JOIN "StudioProject" p ON p."id" = w."projectId"
      LEFT JOIN LATERAL (
        SELECT r."createdAt", r."status" FROM "StudioWorkflowRun" r
        WHERE r."workflowId" = w."id" ORDER BY r."createdAt" DESC LIMIT 1
      ) lr ON true
      ORDER BY w."status" ASC, w."priority" ASC, w."createdAt" DESC
      LIMIT 200
    `),
    prisma.$queryRaw<WorkflowRunSummary[]>(Prisma.sql`
      SELECT r."id", r."workflowId", w."name" AS "workflowName", r."projectId", p."name" AS "projectName",
        r."triggerType", r."triggerEventId", r."status", r."currentPosition", r."startedAt", r."finishedAt",
        r."errorSummary", r."createdAt"
      FROM "StudioWorkflowRun" r
      JOIN "StudioWorkflow" w ON w."id" = r."workflowId"
      LEFT JOIN "StudioProject" p ON p."id" = r."projectId"
      ORDER BY r."createdAt" DESC
      LIMIT 100
    `),
    prisma.$queryRaw<WatcherSummary[]>(Prisma.sql`
      SELECT s."id", s."projectId", p."name" AS "projectName", s."name", s."kind", s."status", s."severity",
        s."cooldownMinutes", s."lastCheckedAt", s."lastTriggeredAt", s."lastState", s."notifyChannel"
      FROM "StudioWatcher" s
      LEFT JOIN "StudioProject" p ON p."id" = s."projectId"
      ORDER BY s."severity" DESC, s."createdAt" DESC
      LIMIT 200
    `),
    prisma.$queryRaw<ActionRunSummary[]>(Prisma.sql`
      SELECT ar."id", ar."workflowRunId", w."name" AS "workflowName", a."type" AS "actionType", a."position" AS "actionPosition",
        ar."status", a."agentKey", ar."approvalId", ar."agentRunId", ar."startedAt", ar."finishedAt", ar."errorSummary"
      FROM "StudioWorkflowActionRun" ar
      JOIN "StudioWorkflowAction" a ON a."id" = ar."workflowActionId"
      JOIN "StudioWorkflowRun" wr ON wr."id" = ar."workflowRunId"
      JOIN "StudioWorkflow" w ON w."id" = wr."workflowId"
      ORDER BY ar."createdAt" DESC
      LIMIT 100
    `),
    prisma.$queryRaw<Array<{
      activeWorkflows: bigint;
      runningRuns: bigint;
      waitingApprovals: bigint;
      failedRuns24h: bigint;
      activeWatchers: bigint;
    }>>(Prisma.sql`
      SELECT
        (SELECT COUNT(*)::bigint FROM "StudioWorkflow" WHERE "status"='ACTIVE') AS "activeWorkflows",
        (SELECT COUNT(*)::bigint FROM "StudioWorkflowRun" WHERE "status" IN ('QUEUED','RUNNING','WAITING_EXECUTOR')) AS "runningRuns",
        (SELECT COUNT(*)::bigint FROM "StudioWorkflowRun" WHERE "status"='WAITING_APPROVAL') AS "waitingApprovals",
        (SELECT COUNT(*)::bigint FROM "StudioWorkflowRun" WHERE "status"='FAILED' AND "createdAt" >= CURRENT_TIMESTAMP - INTERVAL '24 hours') AS "failedRuns24h",
        (SELECT COUNT(*)::bigint FROM "StudioWatcher" WHERE "status"='ACTIVE') AS "activeWatchers"
    `)
  ]);

  return { workflows, runs, watchers, actionRuns, totals: totals[0] };
}

export async function setWorkflowStatus(workflowId: string, status: 'ACTIVE' | 'PAUSED') {
  await prisma.$executeRaw(Prisma.sql`
    UPDATE "StudioWorkflow" SET "status"=${status}, "updatedAt"=CURRENT_TIMESTAMP WHERE "id"=${workflowId}
  `);
}

export async function setWatcherStatus(watcherId: string, status: 'ACTIVE' | 'PAUSED') {
  await prisma.$executeRaw(Prisma.sql`
    UPDATE "StudioWatcher" SET "status"=${status}, "updatedAt"=CURRENT_TIMESTAMP WHERE "id"=${watcherId}
  `);
}
