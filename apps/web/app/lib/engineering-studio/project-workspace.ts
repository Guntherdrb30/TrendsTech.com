import 'server-only';

import { Prisma, prisma } from '@trends172tech/db';
import { getStudioProjectDetail } from './store';
import { getProjectRoutingProfile } from './routing';
import { listVaultEntries } from './vault';

export async function getProjectAgentWorkspace(projectId: string) {
  const [project, routingProfile, integrations, memory, runs] = await Promise.all([
    getStudioProjectDetail(projectId),
    getProjectRoutingProfile(projectId),
    prisma.$queryRaw<Array<{
      id: string; provider: string; externalProjectName: string; status: string; repositoryFullName: string | null;
      repositoryUrl: string | null; defaultBranch: string | null; productionDeploymentUrl: string | null;
      productionCommitSha: string | null; metaJson: Record<string, unknown> | null; lastSyncedAt: Date;
    }>>(Prisma.sql`
      SELECT "id","provider","externalProjectName","status","repositoryFullName","repositoryUrl","defaultBranch",
        "productionDeploymentUrl","productionCommitSha","metaJson","lastSyncedAt"
      FROM "StudioProjectIntegration" WHERE "projectId"=${projectId} ORDER BY "provider"
    `),
    listVaultEntries(projectId, true),
    prisma.$queryRaw<Array<{
      id: string; agentKey: string; provider: string | null; model: string | null; status: string;
      environment: string; repositoryBranch: string | null; resultJson: Record<string, unknown> | null; createdAt: Date;
    }>>(Prisma.sql`
      SELECT "id","agentKey","provider","model","status","environment","repositoryBranch","resultJson","createdAt"
      FROM "StudioAgentRun" WHERE "projectId"=${projectId} ORDER BY "createdAt" DESC LIMIT 20
    `),
  ]);
  return { project, routingProfile, integrations, memory, runs };
}
