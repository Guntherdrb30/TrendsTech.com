import 'server-only';

import { randomUUID } from 'node:crypto';
import { Prisma, prisma } from '@trends172tech/db';
import { getStudioProjectDetail } from './store';
import { getProjectRoutingProfile } from './routing';
import { listVaultEntries } from './vault';

const AGENT_TYPES: Record<string,string[]> = {
  FRONTEND: ['PRD','REQUIREMENT','DECISION','ARCHITECTURE','TASK','CODEX_RESULT','TEST_RESULT'],
  BACKEND: ['PRD','REQUIREMENT','DECISION','ARCHITECTURE','CHANGE_REQUEST','TASK','CODEX_RESULT','TEST_RESULT'],
  DATABASE: ['PRD','REQUIREMENT','DECISION','ARCHITECTURE','CHANGE_REQUEST','TASK','TEST_RESULT'],
  QA: ['PRD','REQUIREMENT','DECISION','TASK','CODEX_RESULT','TEST_RESULT'],
  NVIDIA: ['PRD','REQUIREMENT','DECISION','ARCHITECTURE','CHANGE_REQUEST','TASK','TEST_RESULT'],
  ORCHESTRATOR: ['CONVERSATION_SUMMARY','PRD','REQUIREMENT','DECISION','ARCHITECTURE','CHANGE_REQUEST','TASK','CODEX_RESULT','TEST_RESULT','DEPLOYMENT','NOTE']
};

export async function buildContextPack(projectId: string, agentKey = 'ORCHESTRATOR', actorUserId?: string) {
  const [project, routingProfile, entries, integrations, recentRuns] = await Promise.all([
    getStudioProjectDetail(projectId),
    getProjectRoutingProfile(projectId),
    listVaultEntries(projectId, true),
    prisma.$queryRaw<Array<{
      provider: string; externalProjectName: string; status: string; repositoryFullName: string | null;
      repositoryUrl: string | null; defaultBranch: string | null; productionDeploymentUrl: string | null;
      productionCommitSha: string | null; metaJson: unknown; lastSyncedAt: Date;
    }>>(Prisma.sql`
      SELECT "provider","externalProjectName","status","repositoryFullName","repositoryUrl","defaultBranch",
        "productionDeploymentUrl","productionCommitSha","metaJson","lastSyncedAt"
      FROM "StudioProjectIntegration" WHERE "projectId"=${projectId} ORDER BY "provider"
    `),
    prisma.$queryRaw<Array<{
      id: string; agentKey: string; provider: string | null; model: string | null; status: string;
      environment: string; repositoryBranch: string | null; resultJson: unknown; createdAt: Date;
    }>>(Prisma.sql`
      SELECT "id","agentKey","provider","model","status","environment","repositoryBranch","resultJson","createdAt"
      FROM "StudioAgentRun" WHERE "projectId"=${projectId} ORDER BY "createdAt" DESC LIMIT 10
    `),
  ]);
  if (!project) throw new Error('Proyecto no encontrado.');
  const allowed = new Set(AGENT_TYPES[agentKey] || AGENT_TYPES.ORCHESTRATOR);
  const selected = entries.filter(entry => allowed.has(entry.type)).slice(0, 100);
  const pack = {
    generatedAt: new Date().toISOString(),
    project: { id: project.id, name: project.name, summary: project.summary, stage: project.stage, repositoryUrl: project.repositoryUrl },
    orchestration: { profile: routingProfile, agentKey },
    permissions: {
      blueprintApproved: project.approvalStatus === 'APPROVED',
      environment: 'PREVIEW',
      productionWrite: false,
      mergeToMain: false,
      productionDeploy: false,
      nextGate: 'EXECUTION_AUTHORIZATION',
    },
    blueprint: { version: project.blueprintVersion, status: project.blueprintStatus, understanding: project.understanding, architecture: project.architectureJson, assumptions: project.assumptionsJson, risks: project.risksJson, acceptanceCriteria: project.acceptanceCriteriaJson },
    integrations: integrations.map((integration) => ({ ...integration, lastSyncedAt: integration.lastSyncedAt.toISOString() })),
    continuity: recentRuns.map((run) => ({ ...run, createdAt: run.createdAt.toISOString() })),
    vault: selected.map(entry => ({ id: entry.id, type: entry.type, title: entry.title, content: entry.content, source: entry.source, version: entry.version, createdAt: entry.createdAt.toISOString() }))
  };
  const id = randomUUID();
  const serialized = JSON.stringify(pack);
  const estimatedTokens = Math.ceil(serialized.length / 4);
  await prisma.$executeRaw(Prisma.sql`
    INSERT INTO "StudioContextPack" ("id","projectId","kind","agentKey","status","contentJson","sourceEntryIdsJson","estimatedTokens","createdByUserId","createdAt")
    VALUES (${id},${projectId},'AGENT',${agentKey},'GENERATED',CAST(${serialized} AS jsonb),CAST(${JSON.stringify(selected.map(e=>e.id))} AS jsonb),${estimatedTokens},${actorUserId||null},CURRENT_TIMESTAMP)
  `);
  return { id, estimatedTokens, pack };
}
