import 'server-only';

import { randomUUID } from 'node:crypto';
import { Prisma, prisma } from '@trends172tech/db';
import { createStudioProject } from './store';
import { addVaultEntry } from './vault';
import {
  createVercelRequest, disconnectVercelFromStudio, latestVercelDeployment, listAllVercelProjects, publicVercelError,
  repositoryInfo, resolveVercelConfig, synchronizeVercelInventory, validateVercelTeam,
  type SyncProjectResult, type VercelProjectSnapshot,
} from './vercel-discovery';

type ProjectIntegration = {
  id: string; projectId: string; externalProjectId: string; externalProjectName: string; status: string;
  framework: string | null; repositoryFullName: string | null; productionDeploymentId: string | null;
  productionCommitSha: string | null; productionState: string | null; productionBranch: string | null;
  metaJson: { deploymentTarget?: string | null } | null;
};

export type VercelIntegrationSummary = {
  id: string; projectId: string; projectName: string; externalProjectId: string; externalProjectName: string;
  status: string; framework: string | null; repositoryFullName: string | null; repositoryUrl: string | null;
  defaultBranch: string | null; gitProvider: string | null; productionDeploymentId: string | null;
  productionDeploymentUrl: string | null; productionState: string | null; productionCommitSha: string | null;
  productionCommitAuthor: string | null; productionCommitMessage: string | null; productionCommitDate: Date | null;
  productionBranch: string | null; productionCreatedAt: Date | null; deploymentTarget: string | null;
  lastError: string | null; lastSeenAt: Date; lastSyncedAt: Date; disconnectedAt: Date | null;
  createdAt: Date; updatedAt: Date;
};

export type VercelSyncRun = {
  id: string; status: string; startedAt: Date; finishedAt: Date | null; discoveredCount: number;
  createdCount: number; updatedCount: number; skippedCount: number; missingCount: number;
  errorCount: number; errorSummary: string | null; technicalMessage: string | null;
};

function asDate(value: string | number | undefined | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function existingIntegration(externalProjectId: string) {
  const rows = await prisma.$queryRaw<ProjectIntegration[]>(Prisma.sql`
    SELECT "id", "projectId", "externalProjectId", "externalProjectName", "status", "framework",
      "repositoryFullName", "productionDeploymentId", "productionCommitSha", "productionState",
      "productionBranch", "metaJson"
    FROM "StudioProjectIntegration"
    WHERE "provider" = 'VERCEL' AND "externalProjectId" = ${externalProjectId} LIMIT 1
  `);
  return rows[0] || null;
}

async function findStudioProject(repositoryUrl: string | null, externalProjectId: string) {
  const rows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "StudioProject"
    WHERE "vercelProjectId" = ${externalProjectId}
      OR (${repositoryUrl}::text IS NOT NULL AND lower(COALESCE("repositoryUrl", '')) = lower(${repositoryUrl}::text))
    ORDER BY CASE WHEN "vercelProjectId" = ${externalProjectId} THEN 0 ELSE 1 END, "createdAt" ASC LIMIT 1
  `);
  return rows[0]?.id || null;
}

async function createRecoveredProject(snapshot: VercelProjectSnapshot) {
  const { project, repository, deployment } = snapshot;
  const state = deployment?.state || deployment?.readyState || 'UNKNOWN';
  const summary = `Proyecto descubierto automáticamente en Vercel. Estado al importar: ${state}. ${repository.url ? `Repositorio detectado: ${repository.url}.` : 'Repositorio no identificado todavía.'}`;
  const created = await createStudioProject({ origin: 'recovery', name: project.name, summary, marginPercent: 0,
    commercialBudget: 0, localAiRequired: false, repositoryUrl: repository.url || undefined });
  await addVaultEntry({ projectId: created.projectId, type: 'NOTE', title: 'Proyecto descubierto por Infrastructure Sync',
    content: summary, source: 'ENGINEERING_STUDIO', sourceRef: `vercel:${project.id}`,
    meta: { provider: 'VERCEL', externalProjectId: project.id } });
  return created.projectId;
}

async function auditProject(projectId: string, type: string, message: string, meta: Record<string, unknown>) {
  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO "StudioEvent" ("id", "projectId", "type", "actorType", "message", "metaJson", "createdAt")
    VALUES (${randomUUID()}, ${projectId}, ${type}, 'SYSTEM', ${message}, CAST(${JSON.stringify(meta)} AS jsonb), CURRENT_TIMESTAMP)
  `);
}

function projectChanged(existing: ProjectIntegration, snapshot: VercelProjectSnapshot) {
  const { project, deployment, repository } = snapshot;
  return existing.status !== 'ACTIVE' || existing.externalProjectName !== project.name
    || existing.framework !== (project.framework || null) || existing.repositoryFullName !== repository.fullName
    || existing.productionDeploymentId !== (deployment?.uid || deployment?.id || null)
    || existing.productionCommitSha !== repository.sha
    || existing.productionState !== (deployment?.state || deployment?.readyState || null)
    || existing.productionBranch !== repository.branch || existing.metaJson?.deploymentTarget !== (deployment?.target || null);
}

async function persistProject(snapshot: VercelProjectSnapshot): Promise<SyncProjectResult> {
  const { project, deployment, repository } = snapshot;
  const integration = await existingIntegration(project.id);
  let projectId = integration?.projectId || await findStudioProject(repository.url, project.id);
  let created = false;
  if (!projectId) { projectId = await createRecoveredProject(snapshot); created = true; }
  const deploymentId = deployment?.uid || deployment?.id || null;
  const deploymentUrl = deployment?.url ? (deployment.url.startsWith('http') ? deployment.url : `https://${deployment.url}`) : null;
  const deploymentState = deployment?.state || deployment?.readyState || null;
  const deploymentCreatedAt = asDate(deployment?.created || deployment?.createdAt);
  const commitDate = asDate(repository.commitDate);
  const meta = {
    vercelUpdatedAt: project.updatedAt || null, vercelCreatedAt: project.createdAt || null, accountId: project.accountId || null,
    gitProvider: repository.provider, productionCommitAuthor: repository.author,
    productionCommitMessage: repository.message, productionCommitDate: commitDate?.toISOString() || null,
    deploymentTarget: deployment?.target || null, lastError: null, disconnectedAt: null,
  };
  const changed = !integration || projectChanged(integration, snapshot);

  if (!integration) {
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "StudioProjectIntegration" (
        "id", "projectId", "provider", "externalProjectId", "externalProjectName", "status", "framework",
        "repositoryFullName", "repositoryUrl", "defaultBranch", "productionDeploymentId",
        "productionDeploymentUrl", "productionState", "productionCommitSha", "productionBranch", "productionCreatedAt",
        "lastSeenAt", "lastSyncedAt", "metaJson", "createdAt", "updatedAt"
      ) VALUES (
        ${randomUUID()}, ${projectId}, 'VERCEL', ${project.id}, ${project.name}, 'ACTIVE', ${project.framework || null},
        ${repository.fullName}, ${repository.url}, ${repository.branch}, ${deploymentId},
        ${deploymentUrl}, ${deploymentState}, ${repository.sha}, ${repository.branch}, ${deploymentCreatedAt}, CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP, CAST(${JSON.stringify(meta)} AS jsonb), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
      )
    `);
  } else {
    await prisma.$executeRaw(Prisma.sql`
      UPDATE "StudioProjectIntegration" SET "externalProjectName" = ${project.name}, "status" = 'ACTIVE',
        "framework" = ${project.framework || null}, "repositoryFullName" = ${repository.fullName},
        "repositoryUrl" = ${repository.url}, "defaultBranch" = ${repository.branch},
        "productionDeploymentId" = ${deploymentId}, "productionDeploymentUrl" = ${deploymentUrl},
        "productionState" = ${deploymentState}, "productionCommitSha" = ${repository.sha},
        "productionBranch" = ${repository.branch}, "productionCreatedAt" = ${deploymentCreatedAt},
        "lastSeenAt" = CURRENT_TIMESTAMP,
        "lastSyncedAt" = CURRENT_TIMESTAMP, "metaJson" = CAST(${JSON.stringify(meta)} AS jsonb), "updatedAt" = CURRENT_TIMESTAMP
      WHERE "id" = ${integration.id}
    `);
  }
  await prisma.$executeRaw(Prisma.sql`
    UPDATE "StudioProject" SET "vercelProjectId" = ${project.id},
      "repositoryUrl" = COALESCE(${repository.url}, "repositoryUrl"),
      "repositoryBranch" = COALESCE(${repository.branch}, "repositoryBranch"), "updatedAt" = CURRENT_TIMESTAMP
    WHERE "id" = ${projectId}
  `);
  await auditProject(projectId, 'VERCEL_SYNCED', `Vercel sincronizó ${project.name}${changed ? ' y actualizó sus datos' : ' sin cambios de datos'}.`, {
    externalProjectId: project.id, deploymentId, deploymentState, target: deployment?.target || null,
    commitSha: repository.sha, changed });
  return created || !integration ? 'created' : changed ? 'updated' : 'skipped';
}

async function markMissing(visibleProjectIds: string[]) {
  const exclusions = visibleProjectIds.length ? Prisma.sql`AND "externalProjectId" NOT IN (${Prisma.join(visibleProjectIds)})` : Prisma.empty;
  const rows = await prisma.$queryRaw<Array<{ id: string; projectId: string; externalProjectName: string }>>(Prisma.sql`
    SELECT "id", "projectId", "externalProjectName" FROM "StudioProjectIntegration"
    WHERE "provider" = 'VERCEL' AND "status" NOT IN ('DISCONNECTED', 'ACCESS_LOST') ${exclusions}
  `);
  for (const row of rows) {
    await prisma.$executeRaw(Prisma.sql`
      UPDATE "StudioProjectIntegration" SET "status" = 'ACCESS_LOST',
        "metaJson" = COALESCE("metaJson", '{}'::jsonb) || jsonb_build_object('lastError', 'El proyecto ya no es visible para el token y equipo configurados.'),
        "lastSyncedAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = ${row.id}
    `);
    await auditProject(row.projectId, 'VERCEL_ACCESS_LOST', `Acceso perdido al proyecto Vercel ${row.externalProjectName}.`, { provider: 'VERCEL' });
  }
  return rows.length;
}

export async function syncVercelProjects() {
  const runId = randomUUID();
  await prisma.$executeRaw(Prisma.sql`INSERT INTO "StudioInfrastructureSyncRun" ("id", "provider", "status", "startedAt", "createdAt") VALUES (${runId}, 'VERCEL', 'RUNNING', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`);
  try {
    const { token, teamId, usedExpectedDefault } = resolveVercelConfig();
    const request = createVercelRequest(token, teamId);
    const team = await validateVercelTeam(request, teamId);
    const counts = await synchronizeVercelInventory({
      discoverProjects: () => listAllVercelProjects(request),
      readProject: async (project) => { const deployment = await latestVercelDeployment(request, project.id); return { project, deployment, repository: repositoryInfo(project, deployment) }; },
      syncProject: persistProject,
      markMissing,
      markProjectError: async (project, error) => {
        const integration = await existingIntegration(project.id);
        if (!integration) return;
        await prisma.$executeRaw(Prisma.sql`UPDATE "StudioProjectIntegration" SET "status" = 'ERROR', "metaJson" = COALESCE("metaJson", '{}'::jsonb) || jsonb_build_object('lastError', ${error.message}), "lastSyncedAt" = CURRENT_TIMESTAMP, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = ${integration.id}`);
        await auditProject(integration.projectId, 'VERCEL_SYNC_ERROR', `Error al sincronizar ${project.name}: ${error.message}`, { code: error.code });
      },
    });
    const status = counts.errorCount ? 'COMPLETED_WITH_ERRORS' : 'COMPLETED';
    const technicalMessage = counts.discoveredCount === 0 ? `El equipo ${teamId} es accesible, pero no contiene proyectos visibles.`
      : `Sincronización del equipo ${team.name || team.slug || teamId} completada${usedExpectedDefault ? ' usando el equipo esperado por defecto' : ''}.`;
    await prisma.$executeRaw(Prisma.sql`
      UPDATE "StudioInfrastructureSyncRun" SET "status" = ${status}, "finishedAt" = CURRENT_TIMESTAMP,
        "discoveredCount" = ${counts.discoveredCount}, "createdCount" = ${counts.createdCount},
        "updatedCount" = ${counts.updatedCount},
        "missingCount" = ${counts.missingCount}, "errorCount" = ${counts.errorCount},
        "detailsJson" = CAST(${JSON.stringify({ teamId, errors: counts.errors, skippedCount: counts.skippedCount, technicalMessage })} AS jsonb)
      WHERE "id" = ${runId}
    `);
    return { runId, status, teamId, technicalMessage, ...counts };
  } catch (error) {
    const safe = publicVercelError(error);
    await prisma.$executeRaw(Prisma.sql`
      UPDATE "StudioInfrastructureSyncRun" SET "status" = 'FAILED', "finishedAt" = CURRENT_TIMESTAMP,
        "errorCount" = 1, "errorSummary" = ${safe.message},
        "detailsJson" = CAST(${JSON.stringify({ code: safe.code, status: safe.status || null, technicalMessage: safe.message })} AS jsonb) WHERE "id" = ${runId}
    `);
    throw error;
  }
}

export async function disconnectVercelProject(projectId: string, actorUserId: string) {
  const rows = await prisma.$queryRaw<Array<{ id: string; externalProjectName: string }>>(Prisma.sql`
    SELECT "id", "externalProjectName" FROM "StudioProjectIntegration" WHERE "provider" = 'VERCEL' AND "projectId" = ${projectId} LIMIT 1
  `);
  const integration = rows[0];
  if (!integration) throw new Error('Este proyecto no tiene una integración de Vercel en Studio.');
  await prisma.$transaction(async (tx) => disconnectVercelFromStudio(
    { projectId, projectName: integration.externalProjectName },
    {
      disconnect: async () => { await tx.$executeRaw(Prisma.sql`UPDATE "StudioProjectIntegration" SET "status" = 'DISCONNECTED', "metaJson" = COALESCE("metaJson", '{}'::jsonb) || jsonb_build_object('disconnectedAt', CURRENT_TIMESTAMP, 'lastError', NULL), "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = ${integration.id}`); },
      audit: async (entry) => { await tx.$executeRaw(Prisma.sql`
        INSERT INTO "StudioEvent" ("id", "projectId", "type", "actorType", "actorRef", "message", "metaJson", "createdAt")
        VALUES (${randomUUID()}, ${projectId}, 'VERCEL_DISCONNECTED', 'USER', ${actorUserId},
          ${`Se desconectó ${integration.externalProjectName} de Engineering Studio sin modificar Vercel.`},
          CAST(${JSON.stringify({ provider: 'VERCEL', destructiveVercelOperation: entry.destructiveVercelOperation })} AS jsonb), CURRENT_TIMESTAMP)
      `); },
    },
  ));
  return { projectId, projectName: integration.externalProjectName };
}

const integrationSelect = Prisma.sql`
  SELECT i."id", i."projectId", p."name" AS "projectName", i."externalProjectId", i."externalProjectName",
    i."status", i."framework", i."repositoryFullName", i."repositoryUrl", i."defaultBranch", i."metaJson"->>'gitProvider' AS "gitProvider",
    i."productionDeploymentId", i."productionDeploymentUrl", i."productionState", i."productionCommitSha",
    i."metaJson"->>'productionCommitAuthor' AS "productionCommitAuthor",
    i."metaJson"->>'productionCommitMessage' AS "productionCommitMessage",
    NULLIF(i."metaJson"->>'productionCommitDate', '')::timestamp AS "productionCommitDate", i."productionBranch",
    i."productionCreatedAt", i."metaJson"->>'deploymentTarget' AS "deploymentTarget",
    i."metaJson"->>'lastError' AS "lastError", i."lastSeenAt", i."lastSyncedAt",
    NULLIF(i."metaJson"->>'disconnectedAt', '')::timestamp AS "disconnectedAt", i."createdAt", i."updatedAt"
  FROM "StudioProjectIntegration" i JOIN "StudioProject" p ON p."id" = i."projectId"
`;

export async function getVercelIntegrationForProject(projectId: string) {
  const integrations = await prisma.$queryRaw<VercelIntegrationSummary[]>(Prisma.sql`${integrationSelect} WHERE i."provider" = 'VERCEL' AND i."projectId" = ${projectId} LIMIT 1`);
  const events = await prisma.$queryRaw<Array<{ id: string; type: string; message: string | null; createdAt: Date }>>(Prisma.sql`
    SELECT "id", "type", "message", "createdAt" FROM "StudioEvent" WHERE "projectId" = ${projectId} AND "type" LIKE 'VERCEL_%' ORDER BY "createdAt" DESC LIMIT 20
  `);
  return { integration: integrations[0] || null, events };
}

export async function getVercelSyncSnapshot() {
  const integrations = await prisma.$queryRaw<VercelIntegrationSummary[]>(Prisma.sql`${integrationSelect} WHERE i."provider" = 'VERCEL' ORDER BY i."externalProjectName"`);
  const runs = await prisma.$queryRaw<VercelSyncRun[]>(Prisma.sql`
    SELECT "id", "status", "startedAt", "finishedAt", "discoveredCount", "createdCount", "updatedCount",
      COALESCE(("detailsJson"->>'skippedCount')::integer, 0) AS "skippedCount", "missingCount", "errorCount", "errorSummary",
      "detailsJson"->>'technicalMessage' AS "technicalMessage"
    FROM "StudioInfrastructureSyncRun" WHERE "provider" = 'VERCEL' ORDER BY "startedAt" DESC LIMIT 20
  `);
  return { integrations, runs };
}
