import 'server-only';

import { randomUUID } from 'node:crypto';
import {
  DevAIProviderType,
  DevExecutionMode,
  DevExecutionRuntime,
  DevQueueStatus,
  DevTaskPriority,
  DevTaskStatus,
  Prisma,
  TenantMode,
  TenantStatus,
  prisma
} from '@trends172tech/db';
import { buildContextPack } from './context-pack';
import { addVaultEntry } from './vault';
import { dispatchStudioEvent } from './workflow-engine';

export const INTERNAL_TENANT_SLUG = 'trends-engineering-studio';

type JsonRecord = Record<string, unknown>;

type StudioRunRow = {
  id: string;
  projectId: string;
  agentKey: string;
  status: string;
  branchName: string | null;
  resultJson: unknown;
  projectName: string;
  repositoryUrl: string | null;
  repositoryBranch: string | null;
  projectCreatedByUserId: string | null;
};

export type StudioRunLink = {
  studioRunId: string;
  studioProjectId: string;
  contextPackId?: string;
  devProjectId?: string;
  orchestratorTaskId?: string;
  orchestratorQueueId?: string;
  runtime?: string;
};

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function slug(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || 'project';
}

export function getStudioRunLink(payload: unknown): StudioRunLink | null {
  const data = asRecord(payload);
  if (data.source !== 'ENGINEERING_STUDIO') return null;
  if (typeof data.studioRunId !== 'string' || typeof data.studioProjectId !== 'string') return null;
  return {
    studioRunId: data.studioRunId,
    studioProjectId: data.studioProjectId,
    contextPackId: typeof data.contextPackId === 'string' ? data.contextPackId : undefined,
    devProjectId: typeof data.devProjectId === 'string' ? data.devProjectId : undefined,
    orchestratorTaskId: typeof data.orchestratorTaskId === 'string' ? data.orchestratorTaskId : undefined,
    orchestratorQueueId: typeof data.orchestratorQueueId === 'string' ? data.orchestratorQueueId : undefined,
    runtime: typeof data.runtime === 'string' ? data.runtime : undefined
  };
}

async function getStudioRun(runId: string) {
  const rows = await prisma.$queryRaw<StudioRunRow[]>(Prisma.sql`
    SELECT
      r."id",
      r."projectId",
      r."agentKey",
      r."status",
      r."branchName",
      r."resultJson",
      p."name" AS "projectName",
      p."repositoryUrl",
      p."repositoryBranch",
      p."createdByUserId" AS "projectCreatedByUserId"
    FROM "StudioAgentRun" r
    JOIN "StudioProject" p ON p."id" = r."projectId"
    WHERE r."id" = ${runId}
    LIMIT 1
  `);
  return rows[0] ?? null;
}

async function resolveExecutionUser(actorRef: string, projectCreatedByUserId: string | null) {
  const candidates = [actorRef, projectCreatedByUserId].filter((value): value is string => Boolean(value));
  if (candidates.length > 0) {
    const user = await prisma.user.findFirst({ where: { id: { in: candidates } } });
    if (user) return user;
  }

  const root = await prisma.user.findFirst({
    where: { role: 'ROOT' },
    orderBy: { createdAt: 'asc' }
  });
  if (!root) throw new Error('Engineering Studio necesita un usuario ROOT para registrar la ejecución.');
  return root;
}

export async function ensureInternalExecutionTenant() {
  return prisma.tenant.upsert({
    where: { slug: INTERNAL_TENANT_SLUG },
    update: {
      name: 'Trends172Tech Engineering Studio',
      mode: TenantMode.SINGLE,
      status: TenantStatus.ACTIVE
    },
    create: {
      name: 'Trends172Tech Engineering Studio',
      slug: INTERNAL_TENANT_SLUG,
      mode: TenantMode.SINGLE,
      status: TenantStatus.ACTIVE
    }
  });
}

async function ensureDevProject(run: StudioRunRow, actorUserId: string) {
  const tenant = await ensureInternalExecutionTenant();
  const projectSlug = `studio-${slug(run.projectName)}-${run.projectId.slice(0, 8)}`;
  const project = await prisma.devProject.upsert({
    where: {
      tenantId_slug: {
        tenantId: tenant.id,
        slug: projectSlug
      }
    },
    update: {
      name: run.projectName,
      repositoryUrl: run.repositoryUrl,
      defaultBranch: run.repositoryBranch ?? 'main',
      executionMode: DevExecutionMode.LOCAL,
      isActive: true
    },
    create: {
      tenantId: tenant.id,
      createdByUserId: actorUserId,
      name: run.projectName,
      slug: projectSlug,
      repositoryUrl: run.repositoryUrl,
      defaultBranch: run.repositoryBranch ?? 'main',
      executionMode: DevExecutionMode.LOCAL,
      isActive: true
    }
  });
  return { tenant, project };
}

function buildExecutionPrompt(params: {
  task: string;
  projectName: string;
  branchName: string;
  contextPack: unknown;
}) {
  return [
    'You are executing an approved Trends172Tech Engineering Studio task.',
    `Project: ${params.projectName}`,
    `Authorized working branch: ${params.branchName}`,
    '',
    'Task:',
    params.task,
    '',
    'Safety and delivery rules:',
    '- Work only inside the assigned repository workspace and the authorized branch.',
    '- Do not merge to main/master.',
    '- Do not deploy to production.',
    '- Do not modify production secrets or production databases.',
    '- Run the relevant typecheck/tests/lint/build checks that are safe for this repository.',
    '- Keep changes limited to the requested task.',
    '- Finish with a concise summary of changes, verification performed, and any remaining blocker.',
    '',
    'Engineering Studio Context Pack:',
    JSON.stringify(params.contextPack, null, 2)
  ].join('\n');
}

export async function dispatchAgentRunToOrchestrator(
  runId: string,
  actorRef: string,
  runtime: DevExecutionRuntime = DevExecutionRuntime.CODEX_CLI
) {
  const run = await getStudioRun(runId);
  if (!run) throw new Error('Agent Run no encontrado.');

  const existingMeta = asRecord(run.resultJson);
  if (typeof existingMeta.orchestratorTaskId === 'string') {
    return {
      alreadyDispatched: true,
      runId,
      taskId: existingMeta.orchestratorTaskId,
      queueId: typeof existingMeta.orchestratorQueueId === 'string' ? existingMeta.orchestratorQueueId : null,
      runtime: existingMeta.runtime ?? runtime
    };
  }

  if (run.status !== 'READY') {
    throw new Error(`El Agent Run debe estar READY antes de enviarlo al Orchestrator. Estado actual: ${run.status}.`);
  }
  if (!run.repositoryUrl) throw new Error('El proyecto no tiene repositorio configurado.');
  if (!run.branchName) throw new Error('El Agent Run no tiene rama de trabajo aislada.');

  const task = typeof existingMeta.task === 'string' ? existingMeta.task : 'Ejecutar tarea preparada por Engineering Studio.';
  const actor = await resolveExecutionUser(actorRef, run.projectCreatedByUserId);
  const { tenant, project } = await ensureDevProject(run, actor.id);
  const context = await buildContextPack(run.projectId, run.agentKey || 'ORCHESTRATOR', actor.id);
  const prompt = buildExecutionPrompt({
    task,
    projectName: run.projectName,
    branchName: run.branchName,
    contextPack: context.pack
  });

  const approvalId = randomUUID();

  const result = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "StudioApproval" (
        "id","projectId","gate","status","scopeJson","requestedAt","decidedAt","decidedByUserId","decisionNote","createdAt"
      ) VALUES (
        ${approvalId},${run.projectId},'EXECUTION_AUTHORIZATION','APPROVED',
        CAST(${JSON.stringify({ runId, runtime })} AS jsonb),
        CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,${actor.id},
        'Ejecución autorizada explícitamente desde Engineering Studio.',CURRENT_TIMESTAMP
      )
    `);

    const devTask = await tx.devTask.create({
      data: {
        tenantId: tenant.id,
        projectId: project.id,
        createdByUserId: actor.id,
        title: task.slice(0, 180),
        description: `Engineering Studio run ${run.id} · ${run.agentKey}`,
        status: DevTaskStatus.QUEUED,
        priority: DevTaskPriority.HIGH,
        branch: run.branchName,
        executionMode: DevExecutionMode.LOCAL,
        aiProvider: DevAIProviderType.CODEX,
        prompt
      }
    });

    const queue = await tx.devExecutionQueue.create({
      data: {
        taskId: devTask.id,
        status: DevQueueStatus.PENDING,
        runtime,
        payloadJson: {
          source: 'ENGINEERING_STUDIO',
          studioRunId: run.id,
          studioProjectId: run.projectId,
          contextPackId: context.id,
          devProjectId: project.id,
          orchestratorTaskId: devTask.id,
          runtime
        }
      }
    });

    await tx.devTaskLog.create({
      data: {
        taskId: devTask.id,
        level: 'INFO',
        message: 'Engineering Studio autorizó la ejecución y envió la tarea al Runner.',
        metadata: {
          studioRunId: run.id,
          studioProjectId: run.projectId,
          contextPackId: context.id,
          branch: run.branchName,
          runtime
        }
      }
    });

    const mergedResult = {
      ...existingMeta,
      executionApprovalId: approvalId,
      contextPackId: context.id,
      devProjectId: project.id,
      orchestratorTaskId: devTask.id,
      orchestratorQueueId: queue.id,
      runtime,
      dispatchedAt: new Date().toISOString()
    };

    await tx.$executeRaw(Prisma.sql`
      UPDATE "StudioAgentRun"
      SET "status"='QUEUED_EXECUTION',
          "resultJson"=CAST(${JSON.stringify(mergedResult)} AS jsonb)
      WHERE "id"=${run.id}
    `);

    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "StudioEvent" ("id","projectId","runId","type","actorType","actorRef","message","metaJson","createdAt")
      VALUES (
        ${randomUUID()},${run.projectId},${run.id},'AGENT_RUN_DISPATCHED','USER',${actorRef},
        'Agent Run enviado a LUNA Code Orchestrator.',
        CAST(${JSON.stringify({ taskId: devTask.id, queueId: queue.id, runtime, branchName: run.branchName })} AS jsonb),
        CURRENT_TIMESTAMP
      )
    `);

    return { taskId: devTask.id, queueId: queue.id };
  });

  return {
    alreadyDispatched: false,
    runId,
    projectId: run.projectId,
    ...result,
    runtime,
    branchName: run.branchName,
    contextPackId: context.id
  };
}

export async function syncStudioRunProgressFromQueue(payload: unknown, message: string) {
  const link = getStudioRunLink(payload);
  if (!link) return { linked: false };

  await prisma.$transaction(async (tx) => {
    await tx.$executeRaw(Prisma.sql`
      UPDATE "StudioAgentRun"
      SET "status"='RUNNING',
          "startedAt"=COALESCE("startedAt", CURRENT_TIMESTAMP)
      WHERE "id"=${link.studioRunId}
    `);
    await tx.$executeRaw(Prisma.sql`
      INSERT INTO "StudioEvent" ("id","projectId","runId","type","actorType","actorRef","message","metaJson","createdAt")
      VALUES (
        ${randomUUID()},${link.studioProjectId},${link.studioRunId},'AGENT_RUN_PROGRESS','SYSTEM','luna-runner',
        ${message.slice(0, 4000)},CAST(${JSON.stringify(link)} AS jsonb),CURRENT_TIMESTAMP
      )
    `);
  });

  return { linked: true, ...link };
}

export async function syncStudioRunCompletionFromQueue(
  payload: unknown,
  input: {
    status: 'DONE' | 'FAILED' | 'CANCELED';
    resultSummary?: string | null;
    lastError?: string | null;
    commitSha?: string | null;
    files?: Array<{ filePath: string; changeType: string; summary?: string }>;
  }
) {
  const link = getStudioRunLink(payload);
  if (!link) return { linked: false };

  const studioStatus = input.status === 'DONE' ? 'COMPLETED' : 'FAILED';
  const summary = input.resultSummary || input.lastError || `Runner finalizó con estado ${input.status}.`;
  const resultPatch = {
    orchestratorResult: {
      status: input.status,
      summary,
      commitSha: input.commitSha ?? null,
      files: input.files ?? [],
      completedAt: new Date().toISOString()
    }
  };

  await prisma.$executeRaw(Prisma.sql`
    UPDATE "StudioAgentRun"
    SET "status"=${studioStatus},
        "commitSha"=COALESCE(${input.commitSha ?? null}, "commitSha"),
        "errorSummary"=${input.lastError ?? null},
        "finishedAt"=CURRENT_TIMESTAMP,
        "resultJson"=COALESCE("resultJson",'{}'::jsonb) || CAST(${JSON.stringify(resultPatch)} AS jsonb)
    WHERE "id"=${link.studioRunId}
  `);

  await addVaultEntry({
    projectId: link.studioProjectId,
    type: 'CODEX_RESULT',
    title: input.status === 'DONE' ? 'Resultado de Agent Run' : 'Agent Run fallido',
    content: summary,
    source: 'CODEX',
    sourceRef: link.studioRunId,
    actorUserId: 'luna-runner',
    meta: {
      studioRunId: link.studioRunId,
      orchestratorTaskId: link.orchestratorTaskId,
      commitSha: input.commitSha ?? null,
      files: input.files ?? []
    }
  });

  try {
    await dispatchStudioEvent({
      projectId: link.studioProjectId,
      eventType: input.status === 'DONE' ? 'AGENT_RUN_COMPLETED' : 'AGENT_RUN_FAILED',
      actorType: 'SYSTEM',
      actorRef: 'luna-runner',
      message: summary,
      payload: {
        studioRunId: link.studioRunId,
        orchestratorTaskId: link.orchestratorTaskId,
        commitSha: input.commitSha ?? null
      }
    });
  } catch (error) {
    console.error('[engineering-studio] workflow dispatch after runner completion failed', error);
  }

  return { linked: true, ...link, studioStatus };
}
