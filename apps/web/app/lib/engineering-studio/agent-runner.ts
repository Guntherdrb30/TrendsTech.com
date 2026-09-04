import 'server-only';

import { randomUUID } from 'node:crypto';
import { Prisma, prisma } from '@trends172tech/db';
import { getProjectRoutingProfile } from './routing';
import { buildNvidiaExecutionPlan } from './nvidia-runtime';
import { ensureGitHubWorkspace } from './github-workspace';

const MODEL_ROUTE = {
  ECONOMY: { provider: 'OPENAI', model: 'gpt-5.6-luna', coordinator: 'Engineering Coordinator · Economy' },
  STANDARD: { provider: 'OPENAI', model: 'gpt-5.6-terra', coordinator: 'Engineering Coordinator · Standard' },
  ASTRA: { provider: 'OPENAI', model: 'gpt-6-astra', coordinator: 'Astra · Senior Engineering Director' }
} as const;

export type StudioRunListItem = {
  id: string;
  projectId: string;
  projectName: string;
  status: string;
  provider: string;
  model: string;
  environment: string;
  branchName: string | null;
  costUsd: Prisma.Decimal;
  startedAt: Date | null;
  createdAt: Date;
  resultJson: unknown;
};

function slug(value: string) {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 32) || 'task';
}

export async function prepareAgentRun(projectId: string, actorUserId: string, task: string) {
  if (task.trim().length < 20) throw new Error('Describe la tarea con al menos 20 caracteres.');
  const projects = await prisma.$queryRaw<Array<{ id: string; name: string; repositoryUrl: string | null; localAiRequired: boolean; approvalStatus: string | null }>>(Prisma.sql`
    SELECT p."id", p."name", p."repositoryUrl", p."localAiRequired", a."status" AS "approvalStatus"
    FROM "StudioProject" p
    LEFT JOIN LATERAL (
      SELECT "status" FROM "StudioApproval" WHERE "projectId" = p."id" AND "gate" = 'BLUEPRINT'
      ORDER BY "requestedAt" DESC LIMIT 1
    ) a ON true
    WHERE p."id" = ${projectId}
    LIMIT 1
  `);
  const project = projects[0];
  if (!project) throw new Error('Proyecto no encontrado.');
  if (project.approvalStatus !== 'APPROVED') throw new Error('Approval Gate A debe estar aprobado antes de preparar una ejecución.');
  if (!project.repositoryUrl) throw new Error('El proyecto necesita un repositorio GitHub antes de preparar ejecución de código.');

  const profile = await getProjectRoutingProfile(projectId);
  const route = MODEL_ROUTE[profile];
  const runId = randomUUID();
  const workBranch = `studio/${slug(project.name)}/${slug(task)}-${runId.slice(0, 8)}`;
  const nvidia = buildNvidiaExecutionPlan(project.localAiRequired);
  const workspace = await ensureGitHubWorkspace(project.repositoryUrl, workBranch);
  const status = workspace.configured ? 'READY' : 'BLOCKED_CONFIGURATION';
  const result = {
    task: task.trim(),
    profile,
    coordinator: route.coordinator,
    workspace,
    nvidia,
    safety: {
      productionWrite: false,
      mergeToMain: false,
      productionDeploy: false,
      paidModelExecutionStarted: false,
      nextGate: 'EXECUTION_AUTHORIZATION'
    }
  };

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "StudioAgentRun" (
        "id", "projectId", "status", "provider", "model", "environment", "branchName",
        "inputTokens", "outputTokens", "costUsd", "resultJson", "createdAt", "updatedAt"
      ) VALUES (
        ${runId}, ${projectId}, ${status}, ${route.provider}, ${route.model}, 'PREVIEW', ${workBranch},
        0, 0, 0, CAST(${JSON.stringify(result)} AS jsonb), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `);
    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "StudioEvent" ("id", "projectId", "type", "actorType", "actorRef", "message", "metaJson", "createdAt")
      VALUES (${randomUUID()}, ${projectId}, 'AGENT_RUN_PREPARED', 'USER', ${actorUserId},
        'Ejecución supervisada preparada; todavía no consume modelos.',
        CAST(${JSON.stringify({ runId, profile, model: route.model, branchName: workBranch, workspaceConfigured: workspace.configured })} AS jsonb), CURRENT_TIMESTAMP)
    `);
  });

  return { runId, status, profile, model: route.model, workspace, nvidia };
}

export async function listAgentRuns(): Promise<StudioRunListItem[]> {
  return prisma.$queryRaw<StudioRunListItem[]>(Prisma.sql`
    SELECT r."id", r."projectId", p."name" AS "projectName", r."status", r."provider", r."model",
      r."environment", r."branchName", r."costUsd", r."startedAt", r."createdAt", r."resultJson"
    FROM "StudioAgentRun" r
    JOIN "StudioProject" p ON p."id" = r."projectId"
    ORDER BY r."createdAt" DESC
    LIMIT 100
  `);
}
