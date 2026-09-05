import 'server-only';

import { randomUUID } from 'node:crypto';
import { Prisma, prisma } from '@trends172tech/db';
import { addVaultEntry } from './vault';
import { buildContextPack } from './context-pack';
import { ensureDefaultProjectWorkflows } from './workflow-defaults';

export const WORKFLOW_EVENT_TYPES = [
  'AGENT_RUN_COMPLETED',
  'AGENT_RUN_FAILED',
  'QA_PASSED',
  'QA_FAILED',
  'BUDGET_THRESHOLD_REACHED',
  'PULL_REQUEST_READY',
  'DEPLOYMENT_READY',
  'DEPLOYMENT_FAILED',
  'MIGRATION_READY',
  'HUMAN_APPROVAL_GRANTED',
  'HUMAN_APPROVAL_REJECTED',
  'PROJECT_BLOCKED'
] as const;

export const WORKFLOW_ACTION_TYPES = [
  'BUILD_CONTEXT_PACK',
  'CREATE_BACKLOG_TASK',
  'REQUEST_APPROVAL',
  'RECORD_VAULT_ENTRY',
  'RECORD_VAULT_NOTE',
  'NOTIFY',
  'PREPARE_AGENT_RUN',
  'RUN_QA',
  'PAUSE_PROJECT'
] as const;

export type WorkflowEventType = (typeof WORKFLOW_EVENT_TYPES)[number];

type WorkflowRow = {
  id: string;
  projectId: string | null;
  name: string;
  stopOnFailure: boolean;
  maxExecutionsPerHour: number;
};

type ActionRow = {
  id: string;
  position: number;
  type: string;
  agentKey: string | null;
  configJson: unknown;
  requiresApproval: boolean;
  approvalGate: string | null;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

async function matchingWorkflows(projectId: string, eventType: WorkflowEventType) {
  return prisma.$queryRaw<WorkflowRow[]>(Prisma.sql`
    SELECT w."id",w."projectId",w."name",w."stopOnFailure",w."maxExecutionsPerHour"
    FROM "StudioWorkflow" w
    JOIN "StudioWorkflowTrigger" t ON t."workflowId" = w."id"
    WHERE w."status" = 'ACTIVE'
      AND t."isEnabled" = true
      AND t."type" = 'EVENT'
      AND t."eventType" = ${eventType}
      AND (w."projectId" IS NULL OR w."projectId" = ${projectId})
    ORDER BY w."priority" ASC, w."createdAt" ASC
  `);
}

async function workflowActions(workflowId: string) {
  return prisma.$queryRaw<ActionRow[]>(Prisma.sql`
    SELECT "id","position","type","agentKey","configJson","requiresApproval","approvalGate"
    FROM "StudioWorkflowAction"
    WHERE "workflowId" = ${workflowId} AND "isEnabled" = true
    ORDER BY "position" ASC
  `);
}

async function withinRateLimit(workflow: WorkflowRow) {
  const rows = await prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
    SELECT COUNT(*)::bigint AS "count"
    FROM "StudioWorkflowRun"
    WHERE "workflowId" = ${workflow.id}
      AND "createdAt" >= CURRENT_TIMESTAMP - INTERVAL '1 hour'
  `);
  return Number(rows[0]?.count || 0) < workflow.maxExecutionsPerHour;
}

async function alreadyProcessed(workflowId: string, eventId: string) {
  const rows = await prisma.$queryRaw<Array<{ count: bigint }>>(Prisma.sql`
    SELECT COUNT(*)::bigint AS "count"
    FROM "StudioWorkflowRun"
    WHERE "workflowId" = ${workflowId} AND "triggerEventId" = ${eventId}
  `);
  return Number(rows[0]?.count || 0) > 0;
}

async function requestApproval(projectId: string, workflowRunId: string, action: ActionRow, config: Record<string, unknown>) {
  const approvalId = randomUUID();
  const gate = action.approvalGate || (typeof config.gate === 'string' ? config.gate : 'WORKFLOW_ACTION');
  const note = typeof config.note === 'string' ? config.note : `Workflow ${workflowRunId} requiere aprobación.`;
  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO "StudioApproval" (
      "id","projectId","gate","status","scopeJson","requestedAt","decisionNote","createdAt"
    ) VALUES (
      ${approvalId},${projectId},${gate},'PENDING',
      CAST(${JSON.stringify({ workflowRunId, workflowActionId: action.id, actionType: action.type })} AS jsonb),
      CURRENT_TIMESTAMP,${note},CURRENT_TIMESTAMP
    )
  `);
  return approvalId;
}

async function executeSafeAction(projectId: string, workflowRunId: string, action: ActionRow, event: { id: string; type: string; payload?: unknown }) {
  const config = asRecord(action.configJson);
  if (action.requiresApproval) {
    const approvalId = await requestApproval(projectId, workflowRunId, action, config);
    return { status: 'WAITING_APPROVAL', approvalId, result: { gate: action.approvalGate || config.gate || 'WORKFLOW_ACTION' } };
  }

  switch (action.type) {
    case 'BUILD_CONTEXT_PACK': {
      const agentKey = typeof action.agentKey === 'string' ? action.agentKey : 'ORCHESTRATOR';
      const allowed = ['ORCHESTRATOR','FRONTEND','BACKEND','DATABASE','QA','NVIDIA'] as const;
      const target = allowed.includes(agentKey as (typeof allowed)[number]) ? agentKey as (typeof allowed)[number] : 'ORCHESTRATOR';
      const pack = await buildContextPack(projectId, target, 'workflow-engine');
      return { status: 'COMPLETED', result: { contextPackId: pack.id, agentKey: target } };
    }
    case 'RECORD_VAULT_ENTRY':
    case 'RECORD_VAULT_NOTE': {
      const title = typeof config.title === 'string' ? config.title : `Workflow: ${event.type}`;
      const content = typeof config.content === 'string' ? config.content : JSON.stringify({ eventType: event.type, payload: event.payload || {} });
      const entry = await addVaultEntry({ projectId, type: 'NOTE', title, content, source: 'ENGINEERING_STUDIO', sourceRef: workflowRunId, actorUserId: 'workflow-engine' });
      return { status: 'COMPLETED', result: { vaultEntryId: entry.id } };
    }
    case 'CREATE_BACKLOG_TASK': {
      const id = randomUUID();
      const title = typeof config.title === 'string' ? config.title : `Seguimiento: ${event.type}`;
      const description = typeof config.description === 'string' ? config.description : `Creada automáticamente por workflow ${workflowRunId}.`;
      const priority = typeof config.priority === 'string' && ['LOW','MEDIUM','HIGH','CRITICAL'].includes(config.priority) ? config.priority : 'MEDIUM';
      await prisma.$executeRaw(Prisma.sql`
        INSERT INTO "StudioBacklogItem" (
          "id","projectId","title","description","status","priority","assignedAgentKey","estimatedCost","actualCost","acceptanceCriteriaJson","createdAt","updatedAt"
        ) VALUES (
          ${id},${projectId},${title},${description},'READY',${priority},${action.agentKey},0,0,'[]'::jsonb,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
        )
      `);
      return { status: 'COMPLETED', result: { backlogItemId: id, priority, agentKey: action.agentKey } };
    }
    case 'REQUEST_APPROVAL': {
      const approvalId = await requestApproval(projectId, workflowRunId, action, config);
      return { status: 'WAITING_APPROVAL', approvalId, result: { gate: action.approvalGate || config.gate || 'WORKFLOW_ACTION' } };
    }
    case 'PAUSE_PROJECT': {
      const reason = typeof config.reason === 'string' ? config.reason : event.type;
      await prisma.$executeRaw(Prisma.sql`
        UPDATE "StudioProject" SET "status" = 'BLOCKED', "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = ${projectId}
      `);
      await addVaultEntry({ projectId, type: 'NOTE', title: 'Proyecto pausado por Workflow Engine', content: `Motivo: ${reason}`, source: 'ENGINEERING_STUDIO', sourceRef: workflowRunId, actorUserId: 'workflow-engine' });
      return { status: 'COMPLETED', result: { projectStatus: 'BLOCKED', reason } };
    }
    case 'NOTIFY':
      return { status: 'COMPLETED', result: { notification: 'PENDING_DELIVERY', channel: config.channel || 'STUDIO' } };
    case 'PREPARE_AGENT_RUN':
    case 'RUN_QA':
      return { status: 'WAITING_EXECUTOR', result: { actionType: action.type, agentKey: action.agentKey } };
    default:
      return { status: 'SKIPPED', result: { reason: `Acción ${action.type} no implementada.` } };
  }
}

export async function dispatchStudioEvent(input: { projectId: string; eventType: WorkflowEventType; actorType?: string; actorRef?: string; message: string; payload?: unknown }) {
  await ensureDefaultProjectWorkflows(input.projectId, input.actorRef || 'workflow-dispatcher');

  const eventId = randomUUID();
  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO "StudioEvent" ("id","projectId","type","actorType","actorRef","message","metaJson","createdAt")
    VALUES (${eventId},${input.projectId},${input.eventType},${input.actorType || 'SYSTEM'},${input.actorRef || 'workflow-dispatcher'},${input.message},
      CAST(${JSON.stringify(input.payload || {})} AS jsonb),CURRENT_TIMESTAMP)
  `);

  const workflows = await matchingWorkflows(input.projectId, input.eventType);
  const runs: Array<Record<string, unknown>> = [];

  for (const workflow of workflows) {
    if (await alreadyProcessed(workflow.id, eventId)) {
      runs.push({ workflowId: workflow.id, status: 'DUPLICATE_SKIPPED' });
      continue;
    }
    if (!(await withinRateLimit(workflow))) {
      runs.push({ workflowId: workflow.id, status: 'RATE_LIMITED' });
      continue;
    }

    const runId = randomUUID();
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "StudioWorkflowRun" ("id","workflowId","projectId","triggerType","triggerEventId","status","startedAt","createdAt")
      VALUES (${runId},${workflow.id},${input.projectId},'EVENT',${eventId},'RUNNING',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
    `);

    const actions = await workflowActions(workflow.id);
    let runStatus = 'COMPLETED';
    const actionResults: Array<Record<string, unknown>> = [];

    for (const action of actions) {
      const actionRunId = randomUUID();
      await prisma.$executeRaw(Prisma.sql`
        INSERT INTO "StudioWorkflowActionRun" ("id","workflowRunId","workflowActionId","status","startedAt","createdAt")
        VALUES (${actionRunId},${runId},${action.id},'RUNNING',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
      `);
      try {
        const outcome = await executeSafeAction(input.projectId, runId, action, { id: eventId, type: input.eventType, payload: input.payload });
        const terminal = outcome.status === 'COMPLETED' || outcome.status === 'SKIPPED';
        await prisma.$executeRaw(Prisma.sql`
          UPDATE "StudioWorkflowActionRun" SET "status"=${outcome.status},"finishedAt"=${terminal ? new Date() : null},
            "approvalId"=${'approvalId' in outcome ? outcome.approvalId || null : null},"resultJson"=CAST(${JSON.stringify(outcome.result)} AS jsonb)
          WHERE "id"=${actionRunId}
        `);
        actionResults.push({ actionId: action.id, type: action.type, status: outcome.status, result: outcome.result });
        if (outcome.status === 'WAITING_APPROVAL' || outcome.status === 'WAITING_EXECUTOR') {
          runStatus = outcome.status;
          break;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Workflow action failed';
        await prisma.$executeRaw(Prisma.sql`
          UPDATE "StudioWorkflowActionRun" SET "status"='FAILED',"finishedAt"=CURRENT_TIMESTAMP,"errorSummary"=${message} WHERE "id"=${actionRunId}
        `);
        actionResults.push({ actionId: action.id, type: action.type, status: 'FAILED', error: message });
        runStatus = 'FAILED';
        if (workflow.stopOnFailure) break;
      }
    }

    const workflowTerminal = runStatus === 'COMPLETED' || runStatus === 'FAILED';
    await prisma.$executeRaw(Prisma.sql`
      UPDATE "StudioWorkflowRun" SET "status"=${runStatus},"finishedAt"=${workflowTerminal ? new Date() : null},
        "resultJson"=CAST(${JSON.stringify({ actions: actionResults })} AS jsonb)
      WHERE "id"=${runId}
    `);
    runs.push({ workflowId: workflow.id, workflowName: workflow.name, runId, status: runStatus, actions: actionResults });
  }

  return { eventId, matchedWorkflows: workflows.length, runs };
}
