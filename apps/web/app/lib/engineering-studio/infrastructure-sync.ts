import 'server-only';

import { randomUUID } from 'node:crypto';
import { Prisma, prisma } from '@trends172tech/db';
import { createStudioProject } from './store';
import { addVaultEntry } from './vault';

type VercelGitRepo = {
  type?: string;
  repo?: string;
  org?: string;
  repoId?: number | string;
  productionBranch?: string;
};

type VercelProject = {
  id: string;
  name: string;
  framework?: string | null;
  updatedAt?: number;
  link?: VercelGitRepo | null;
};

type VercelDeployment = {
  uid?: string;
  id?: string;
  url?: string | null;
  state?: string;
  readyState?: string;
  target?: string | null;
  created?: number;
  createdAt?: number;
  meta?: Record<string, string | undefined>;
};

type ProjectIntegration = {
  id: string;
  projectId: string;
  externalProjectId: string;
  repositoryFullName: string | null;
  productionDeploymentId: string | null;
  productionCommitSha: string | null;
  productionState: string | null;
};

function config() {
  const token = process.env.VERCEL_STUDIO_TOKEN || process.env.VERCEL_TOKEN;
  const teamId = process.env.VERCEL_STUDIO_TEAM_ID || process.env.VERCEL_TEAM_ID;
  if (!token) throw new Error('Falta VERCEL_STUDIO_TOKEN (o VERCEL_TOKEN).');
  return { token, teamId };
}

async function vercelGet<T>(path: string, query: Record<string,string|number|undefined> = {}) {
  const { token, teamId } = config();
  const url = new URL(`https://api.vercel.com${path}`);
  if (teamId) url.searchParams.set('teamId', teamId);
  for (const [key,value] of Object.entries(query)) if (value !== undefined) url.searchParams.set(key,String(value));
  const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store', signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`Vercel API ${response.status}: ${await response.text()}`);
  return response.json() as Promise<T>;
}

async function listAllVercelProjects() {
  const projects: VercelProject[] = [];
  let from: string | undefined;
  for (let page=0; page<50; page++) {
    const data = await vercelGet<{projects?:VercelProject[];pagination?:{next?:string|number|null}}>('/v10/projects',{limit:100,from});
    projects.push(...(data.projects || []));
    const next = data.pagination?.next;
    if (!next) break;
    from = String(next);
  }
  return projects;
}

async function latestProductionDeployment(projectId: string) {
  const data = await vercelGet<{deployments?:VercelDeployment[]}>('/v7/deployments',{projectId,target:'production',limit:1});
  return data.deployments?.[0] || null;
}

function repositoryInfo(project: VercelProject, deployment: VercelDeployment | null) {
  const meta = deployment?.meta || {};
  const org = project.link?.org || meta.githubCommitOrg;
  const repo = project.link?.repo || meta.githubCommitRepo;
  const fullName = org && repo ? `${org}/${repo}` : null;
  return {
    fullName,
    url: fullName ? `https://github.com/${fullName}` : null,
    branch: project.link?.productionBranch || meta.githubCommitRef || null,
    sha: meta.githubCommitSha || null
  };
}

async function existingIntegration(externalProjectId: string) {
  const rows = await prisma.$queryRaw<ProjectIntegration[]>(Prisma.sql`
    SELECT "id","projectId","externalProjectId","repositoryFullName","productionDeploymentId","productionCommitSha","productionState"
    FROM "StudioProjectIntegration" WHERE "provider"='VERCEL' AND "externalProjectId"=${externalProjectId} LIMIT 1
  `);
  return rows[0] || null;
}

async function findStudioProject(repositoryUrl: string | null, name: string) {
  const rows = await prisma.$queryRaw<Array<{id:string}>>(Prisma.sql`
    SELECT "id" FROM "StudioProject"
    WHERE (${repositoryUrl}::text IS NOT NULL AND lower(COALESCE("repositoryUrl",''))=lower(${repositoryUrl}::text))
       OR lower("name")=lower(${name})
    ORDER BY "createdAt" ASC LIMIT 1
  `);
  return rows[0]?.id || null;
}

async function createRecoveredProject(project: VercelProject, repositoryUrl: string | null, deployment: VercelDeployment | null) {
  const state = deployment?.state || deployment?.readyState || 'UNKNOWN';
  const summary = `Proyecto descubierto automáticamente en Vercel. Estado de producción al importar: ${state}. ${repositoryUrl ? `Repositorio detectado: ${repositoryUrl}.` : 'Repositorio no identificado todavía.'}`;
  const created = await createStudioProject({ origin:'recovery', name:project.name, summary, marginPercent:0, commercialBudget:0, localAiRequired:false, repositoryUrl:repositoryUrl || undefined });
  await addVaultEntry({ projectId:created.projectId, type:'NOTE', title:'Proyecto descubierto por Infrastructure Sync', content:summary, source:'ENGINEERING_STUDIO', sourceRef:`vercel:${project.id}`, meta:{provider:'VERCEL',externalProjectId:project.id} });
  return created.projectId;
}

export async function syncVercelProjects() {
  const runId = randomUUID();
  await prisma.$executeRaw(Prisma.sql`INSERT INTO "StudioInfrastructureSyncRun" ("id","provider","status","startedAt","createdAt") VALUES (${runId},'VERCEL','RUNNING',CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)`);
  let discoveredCount=0, createdCount=0, updatedCount=0, errorCount=0;
  const errors: Array<{project:string;error:string}> = [];
  try {
    const projects = await listAllVercelProjects();
    discoveredCount = projects.length;
    for (const external of projects) {
      try {
        const deployment = await latestProductionDeployment(external.id);
        const repo = repositoryInfo(external,deployment);
        let integration = await existingIntegration(external.id);
        let projectId = integration?.projectId || await findStudioProject(repo.url, external.name);
        if (!projectId) { projectId = await createRecoveredProject(external,repo.url,deployment); createdCount++; }
        const deploymentId = deployment?.uid || deployment?.id || null;
        const deploymentUrl = deployment?.url ? `https://${deployment.url}` : null;
        const productionState = deployment?.state || deployment?.readyState || null;
        const productionCreatedAt = deployment?.created || deployment?.createdAt ? new Date(deployment.created || deployment.createdAt || 0) : null;
        const meta = { framework:external.framework || null, vercelUpdatedAt:external.updatedAt || null, gitProvider:external.link?.type || null };
        if (!integration) {
          await prisma.$executeRaw(Prisma.sql`
            INSERT INTO "StudioProjectIntegration" ("id","projectId","provider","externalProjectId","externalProjectName","status","framework","repositoryFullName","repositoryUrl","defaultBranch","productionDeploymentId","productionDeploymentUrl","productionState","productionCommitSha","productionBranch","productionCreatedAt","lastSeenAt","lastSyncedAt","metaJson","createdAt","updatedAt")
            VALUES (${randomUUID()},${projectId},'VERCEL',${external.id},${external.name},'ACTIVE',${external.framework||null},${repo.fullName},${repo.url},${repo.branch},${deploymentId},${deploymentUrl},${productionState},${repo.sha},${repo.branch},${productionCreatedAt},CURRENT_TIMESTAMP,CURRENT_TIMESTAMP,CAST(${JSON.stringify(meta)} AS jsonb),CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)
          `);
        } else {
          await prisma.$executeRaw(Prisma.sql`
            UPDATE "StudioProjectIntegration" SET "externalProjectName"=${external.name},"status"='ACTIVE',"framework"=${external.framework||null},"repositoryFullName"=${repo.fullName},"repositoryUrl"=${repo.url},"defaultBranch"=${repo.branch},"productionDeploymentId"=${deploymentId},"productionDeploymentUrl"=${deploymentUrl},"productionState"=${productionState},"productionCommitSha"=${repo.sha},"productionBranch"=${repo.branch},"productionCreatedAt"=${productionCreatedAt},"lastSeenAt"=CURRENT_TIMESTAMP,"lastSyncedAt"=CURRENT_TIMESTAMP,"metaJson"=CAST(${JSON.stringify(meta)} AS jsonb),"updatedAt"=CURRENT_TIMESTAMP WHERE "id"=${integration.id}
          `);
        }
        if (repo.url) await prisma.$executeRaw(Prisma.sql`UPDATE "StudioProject" SET "repositoryUrl"=COALESCE("repositoryUrl",${repo.url}),"updatedAt"=CURRENT_TIMESTAMP WHERE "id"=${projectId}`);
        const changed = !integration || integration.productionDeploymentId !== deploymentId || integration.productionCommitSha !== repo.sha || integration.productionState !== productionState;
        if (changed && integration) {
          await addVaultEntry({ projectId, type:'DEPLOYMENT', title:'Vercel producción actualizado', content:`Deployment ${deploymentId || 'sin id'} · ${productionState || 'UNKNOWN'} · commit ${repo.sha || 'no identificado'}`, source:'ENGINEERING_STUDIO', sourceRef:`vercel-deployment:${deploymentId || external.id}`, meta:{provider:'VERCEL',deploymentId,deploymentUrl,productionState,commitSha:repo.sha,branch:repo.branch} });
        }
        updatedCount++;
      } catch (error) {
        errorCount++; errors.push({project:external.name,error:error instanceof Error ? error.message : String(error)});
      }
    }
    const missingRows = await prisma.$queryRaw<Array<{count:bigint}>>(Prisma.sql`SELECT COUNT(*)::bigint AS count FROM "StudioProjectIntegration" WHERE "provider"='VERCEL' AND "lastSeenAt" < CURRENT_TIMESTAMP - INTERVAL '36 hours' AND "status"='ACTIVE'`);
    const missingCount = Number(missingRows[0]?.count || 0);
    await prisma.$executeRaw(Prisma.sql`UPDATE "StudioInfrastructureSyncRun" SET "status"=${errorCount?'COMPLETED_WITH_ERRORS':'COMPLETED'},"finishedAt"=CURRENT_TIMESTAMP,"discoveredCount"=${discoveredCount},"createdCount"=${createdCount},"updatedCount"=${updatedCount},"missingCount"=${missingCount},"errorCount"=${errorCount},"detailsJson"=CAST(${JSON.stringify({errors})} AS jsonb) WHERE "id"=${runId}`);
    return {runId,status:errorCount?'COMPLETED_WITH_ERRORS':'COMPLETED',discoveredCount,createdCount,updatedCount,missingCount,errorCount,errors};
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.$executeRaw(Prisma.sql`UPDATE "StudioInfrastructureSyncRun" SET "status"='FAILED',"finishedAt"=CURRENT_TIMESTAMP,"discoveredCount"=${discoveredCount},"createdCount"=${createdCount},"updatedCount"=${updatedCount},"errorCount"=${errorCount+1},"errorSummary"=${message} WHERE "id"=${runId}`);
    throw error;
  }
}

export async function getVercelSyncSnapshot() {
  const integrations = await prisma.$queryRaw<Array<{id:string;projectId:string;projectName:string;externalProjectName:string;framework:string|null;repositoryFullName:string|null;productionDeploymentUrl:string|null;productionState:string|null;productionCommitSha:string|null;productionBranch:string|null;productionCreatedAt:Date|null;lastSyncedAt:Date}>>(Prisma.sql`
    SELECT i."id",i."projectId",p."name" AS "projectName",i."externalProjectName",i."framework",i."repositoryFullName",i."productionDeploymentUrl",i."productionState",i."productionCommitSha",i."productionBranch",i."productionCreatedAt",i."lastSyncedAt" FROM "StudioProjectIntegration" i JOIN "StudioProject" p ON p."id"=i."projectId" WHERE i."provider"='VERCEL' ORDER BY i."externalProjectName"
  `);
  const runs = await prisma.$queryRaw<Array<{id:string;status:string;startedAt:Date;finishedAt:Date|null;discoveredCount:number;createdCount:number;updatedCount:number;missingCount:number;errorCount:number;errorSummary:string|null}>>(Prisma.sql`SELECT "id","status","startedAt","finishedAt","discoveredCount","createdCount","updatedCount","missingCount","errorCount","errorSummary" FROM "StudioInfrastructureSyncRun" WHERE "provider"='VERCEL' ORDER BY "startedAt" DESC LIMIT 20`);
  return {integrations,runs};
}
