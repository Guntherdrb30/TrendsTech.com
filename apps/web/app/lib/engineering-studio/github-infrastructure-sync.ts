import 'server-only';

import { randomUUID } from 'node:crypto';
import { Prisma, prisma } from '@trends172tech/db';
import { createStudioProject } from './store';
import { addVaultEntry } from './vault';
import {
  createGitHubRequest,
  GitHubDiscoveryError,
  latestGitHubCommit,
  listAllGitHubRepositories,
  publicGitHubError,
  resolveGitHubToken,
  type GitHubCommit,
  type GitHubRepository,
} from './github-discovery';

type ExistingGitHubIntegration = {
  id: string;
  projectId: string;
  externalProjectName: string;
  status: string;
  productionCommitSha: string | null;
  metaJson: Record<string, unknown> | null;
};

export type GitHubIntegrationSummary = {
  id: string;
  projectId: string;
  projectName: string;
  projectDescription: string | null;
  externalProjectId: string;
  externalProjectName: string;
  status: string;
  repositoryFullName: string | null;
  repositoryUrl: string | null;
  defaultBranch: string | null;
  productionCommitSha: string | null;
  productionCommitAuthor: string | null;
  productionCommitMessage: string | null;
  productionCommitDate: Date | null;
  language: string | null;
  visibility: string | null;
  topics: string[];
  homepage: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  archived: boolean;
  lastError: string | null;
  lastSeenAt: Date;
  lastSyncedAt: Date;
};

export type GitHubSyncRun = {
  id: string;
  status: string;
  startedAt: Date;
  finishedAt: Date | null;
  discoveredCount: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  missingCount: number;
  errorCount: number;
  errorSummary: string | null;
  technicalMessage: string | null;
};

function repositorySummary(repository: GitHubRepository) {
  return repository.description?.trim() || `Repositorio ${repository.full_name} descubierto automáticamente en GitHub.`;
}

async function existingIntegration(externalProjectId: string) {
  const rows = await prisma.$queryRaw<ExistingGitHubIntegration[]>(Prisma.sql`
    SELECT "id", "projectId", "externalProjectName", "status", "productionCommitSha", "metaJson"
    FROM "StudioProjectIntegration" WHERE "provider" = 'GITHUB' AND "externalProjectId" = ${externalProjectId} LIMIT 1
  `);
  return rows[0] || null;
}

async function findProject(repository: GitHubRepository) {
  const normalized = repository.html_url.toLowerCase().replace(/\.git$/, '');
  const rows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT p."id" FROM "StudioProject" p
    LEFT JOIN "StudioProjectIntegration" i ON i."projectId" = p."id" AND i."provider" = 'VERCEL'
    WHERE lower(regexp_replace(COALESCE(p."repositoryUrl", ''), '\\.git$', '')) = ${normalized}
       OR lower(regexp_replace(COALESCE(i."repositoryUrl", ''), '\\.git$', '')) = ${normalized}
       OR lower(COALESCE(i."repositoryFullName", '')) = ${repository.full_name.toLowerCase()}
    ORDER BY p."createdAt" ASC LIMIT 1
  `);
  return rows[0]?.id || null;
}

async function createRecoveredProject(repository: GitHubRepository) {
  const summary = repositorySummary(repository);
  const created = await createStudioProject({
    origin: 'repository',
    name: repository.name,
    summary,
    marginPercent: 0,
    commercialBudget: 0,
    localAiRequired: false,
    repositoryUrl: repository.html_url,
  });
  await addVaultEntry({
    projectId: created.projectId,
    type: 'NOTE',
    title: 'Repositorio descubierto por GitHub Sync',
    content: summary,
    source: 'ENGINEERING_STUDIO',
    sourceRef: `github:${repository.id}`,
    meta: { provider: 'GITHUB', repository: repository.full_name },
  });
  return created.projectId;
}

function repositoryMeta(repository: GitHubRepository, commit: GitHubCommit | null, lastError: string | null = null) {
  return {
    description: repository.description,
    visibility: repository.private ? 'PRIVATE' : 'PUBLIC',
    language: repository.language,
    topics: repository.topics || [],
    homepage: repository.homepage || null,
    stars: repository.stargazers_count || 0,
    forks: repository.forks_count || 0,
    openIssues: repository.open_issues_count || 0,
    archived: repository.archived,
    owner: repository.owner?.login || null,
    pushedAt: repository.pushed_at || null,
    githubUpdatedAt: repository.updated_at || null,
    productionCommitAuthor: commit?.author?.login || commit?.commit?.author?.name || null,
    productionCommitMessage: commit?.commit?.message || null,
    productionCommitDate: commit?.commit?.author?.date || null,
    commitUrl: commit?.html_url || null,
    lastError,
  };
}

async function persistRepository(repository: GitHubRepository, commit: GitHubCommit | null) {
  const externalProjectId = String(repository.id);
  const existing = await existingIntegration(externalProjectId);
  let projectId = existing?.projectId || await findProject(repository);
  let createdProject = false;
  if (!projectId) {
    projectId = await createRecoveredProject(repository);
    createdProject = true;
  }
  const meta = repositoryMeta(repository, commit);
  const changed = !existing
    || existing.status !== 'ACTIVE'
    || existing.externalProjectName !== repository.full_name
    || existing.productionCommitSha !== (commit?.sha || null)
    || JSON.stringify(existing.metaJson || {}) !== JSON.stringify(meta);

  if (existing) {
    await prisma.$executeRaw(Prisma.sql`
      UPDATE "StudioProjectIntegration" SET "projectId"=${projectId}, "externalProjectName"=${repository.full_name},
        "status"='ACTIVE', "repositoryFullName"=${repository.full_name}, "repositoryUrl"=${repository.html_url},
        "defaultBranch"=${repository.default_branch}, "productionCommitSha"=${commit?.sha || null},
        "productionBranch"=${repository.default_branch}, "lastSeenAt"=CURRENT_TIMESTAMP, "lastSyncedAt"=CURRENT_TIMESTAMP,
        "metaJson"=CAST(${JSON.stringify(meta)} AS jsonb), "updatedAt"=CURRENT_TIMESTAMP WHERE "id"=${existing.id}
    `);
  } else {
    await prisma.$executeRaw(Prisma.sql`
      INSERT INTO "StudioProjectIntegration" (
        "id","projectId","provider","externalProjectId","externalProjectName","status","repositoryFullName",
        "repositoryUrl","defaultBranch","productionCommitSha","productionBranch","lastSeenAt","lastSyncedAt","metaJson","createdAt","updatedAt"
      ) VALUES (
        ${randomUUID()},${projectId},'GITHUB',${externalProjectId},${repository.full_name},'ACTIVE',${repository.full_name},
        ${repository.html_url},${repository.default_branch},${commit?.sha || null},${repository.default_branch},CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,
        CAST(${JSON.stringify(meta)} AS jsonb),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP
      )
    `);
  }
  await prisma.$executeRaw(Prisma.sql`
    UPDATE "StudioProject" SET "repositoryUrl"=${repository.html_url}, "repositoryBranch"=${repository.default_branch},
      "summary"=COALESCE(NULLIF(${repository.description || null}, ''), "summary"), "updatedAt"=CURRENT_TIMESTAMP WHERE "id"=${projectId}
  `);
  return createdProject || !existing ? 'created' : changed ? 'updated' : 'skipped';
}

async function markMissing(visibleIds: string[]) {
  const exclusions = visibleIds.length ? Prisma.sql`AND "externalProjectId" NOT IN (${Prisma.join(visibleIds)})` : Prisma.empty;
  const rows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "StudioProjectIntegration" WHERE "provider"='GITHUB' AND "status" <> 'ACCESS_LOST' ${exclusions}
  `);
  if (rows.length) await prisma.$executeRaw(Prisma.sql`
    UPDATE "StudioProjectIntegration" SET "status"='ACCESS_LOST', "lastSyncedAt"=CURRENT_TIMESTAMP,
      "metaJson"=COALESCE("metaJson", '{}'::jsonb) || jsonb_build_object('lastError', 'El repositorio ya no es visible para el token configurado.'),
      "updatedAt"=CURRENT_TIMESTAMP WHERE "id" IN (${Prisma.join(rows.map((row) => row.id))})
  `);
  return rows.length;
}

export async function syncGitHubRepositories() {
  const runId = randomUUID();
  await prisma.$executeRaw(Prisma.sql`INSERT INTO "StudioInfrastructureSyncRun" ("id","provider","status","startedAt","createdAt") VALUES (${runId},'GITHUB','RUNNING',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`);
  try {
    const request = createGitHubRequest(resolveGitHubToken());
    const repositories = await listAllGitHubRepositories(request);
    let createdCount = 0;
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    const errors: Array<{ repository: string; message: string }> = [];
    for (const repository of repositories) {
      try {
        let commit: GitHubCommit | null = null;
        try { commit = await latestGitHubCommit(request, repository); }
        catch (error) {
          const emptyRepository = error instanceof GitHubDiscoveryError && error.code === 'API_ERROR' && (error.status === 409 || error.status === 404);
          if (!emptyRepository) throw error;
        }
        const result = await persistRepository(repository, commit);
        if (result === 'created') createdCount += 1;
        else if (result === 'updated') updatedCount += 1;
        else skippedCount += 1;
      } catch (error) {
        errorCount += 1;
        errors.push({ repository: repository.full_name, message: publicGitHubError(error).message });
      }
    }
    const missingCount = await markMissing(repositories.map((repository) => String(repository.id)));
    const status = errorCount ? 'COMPLETED_WITH_ERRORS' : 'COMPLETED';
    const technicalMessage = `Sincronización GitHub completada: ${repositories.length} repositorios visibles.`;
    await prisma.$executeRaw(Prisma.sql`
      UPDATE "StudioInfrastructureSyncRun" SET "status"=${status}, "finishedAt"=CURRENT_TIMESTAMP,
        "discoveredCount"=${repositories.length}, "createdCount"=${createdCount}, "updatedCount"=${updatedCount},
        "missingCount"=${missingCount}, "errorCount"=${errorCount},
        "detailsJson"=CAST(${JSON.stringify({ skippedCount, errors, technicalMessage })} AS jsonb) WHERE "id"=${runId}
    `);
    return { runId, status, discoveredCount: repositories.length, createdCount, updatedCount, skippedCount, missingCount, errorCount };
  } catch (error) {
    const safe = publicGitHubError(error);
    await prisma.$executeRaw(Prisma.sql`
      UPDATE "StudioInfrastructureSyncRun" SET "status"='FAILED', "finishedAt"=CURRENT_TIMESTAMP, "errorCount"=1,
        "errorSummary"=${safe.message}, "detailsJson"=CAST(${JSON.stringify({ code: safe.code, technicalMessage: safe.message })} AS jsonb) WHERE "id"=${runId}
    `);
    throw error;
  }
}

const githubIntegrationSelect = Prisma.sql`
  SELECT i."id",i."projectId",p."name" AS "projectName",
    COALESCE(NULLIF(i."metaJson"->>'description',''),NULLIF(p."summary",''),NULLIF(p."mvpObjective",'')) AS "projectDescription",
    i."externalProjectId",i."externalProjectName",i."status",i."repositoryFullName",i."repositoryUrl",i."defaultBranch",
    i."productionCommitSha",i."metaJson"->>'productionCommitAuthor' AS "productionCommitAuthor",
    i."metaJson"->>'productionCommitMessage' AS "productionCommitMessage",
    NULLIF(i."metaJson"->>'productionCommitDate','')::timestamp AS "productionCommitDate",
    i."metaJson"->>'language' AS "language",i."metaJson"->>'visibility' AS "visibility",
    COALESCE(i."metaJson"->'topics','[]'::jsonb) AS "topics",i."metaJson"->>'homepage' AS "homepage",
    COALESCE((i."metaJson"->>'stars')::integer,0) AS "stars",COALESCE((i."metaJson"->>'forks')::integer,0) AS "forks",
    COALESCE((i."metaJson"->>'openIssues')::integer,0) AS "openIssues",COALESCE((i."metaJson"->>'archived')::boolean,false) AS "archived",
    i."metaJson"->>'lastError' AS "lastError",i."lastSeenAt",i."lastSyncedAt"
  FROM "StudioProjectIntegration" i JOIN "StudioProject" p ON p."id"=i."projectId"
`;

export async function getGitHubIntegrationForProject(projectId: string) {
  const rows = await prisma.$queryRaw<GitHubIntegrationSummary[]>(Prisma.sql`${githubIntegrationSelect} WHERE i."provider"='GITHUB' AND i."projectId"=${projectId} LIMIT 1`);
  return rows[0] || null;
}

export async function getGitHubSyncSnapshot() {
  const integrations = await prisma.$queryRaw<GitHubIntegrationSummary[]>(Prisma.sql`${githubIntegrationSelect} WHERE i."provider"='GITHUB' ORDER BY i."externalProjectName"`);
  const runs = await prisma.$queryRaw<GitHubSyncRun[]>(Prisma.sql`
    SELECT "id","status","startedAt","finishedAt","discoveredCount","createdCount","updatedCount",
      COALESCE(("detailsJson"->>'skippedCount')::integer,0) AS "skippedCount","missingCount","errorCount","errorSummary",
      "detailsJson"->>'technicalMessage' AS "technicalMessage"
    FROM "StudioInfrastructureSyncRun" WHERE "provider"='GITHUB' ORDER BY "startedAt" DESC LIMIT 20
  `);
  return { integrations, runs };
}
