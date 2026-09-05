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
  const project = await getStudioProjectDetail(projectId);
  if (!project) throw new Error('Proyecto no encontrado.');
  const routingProfile = await getProjectRoutingProfile(projectId);
  const entries = await listVaultEntries(projectId, true);
  const allowed = new Set(AGENT_TYPES[agentKey] || AGENT_TYPES.ORCHESTRATOR);
  const selected = entries.filter(entry => allowed.has(entry.type)).slice(0, 100);
  const pack = {
    generatedAt: new Date().toISOString(),
    project: { id: project.id, name: project.name, summary: project.summary, stage: project.stage, repositoryUrl: project.repositoryUrl },
    orchestration: { profile: routingProfile, agentKey },
    blueprint: { version: project.blueprintVersion, status: project.blueprintStatus, understanding: project.understanding, architecture: project.architectureJson, assumptions: project.assumptionsJson, risks: project.risksJson, acceptanceCriteria: project.acceptanceCriteriaJson },
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
