-- Trends Engineering Studio - Infrastructure Project Sync
-- Additive migration only. Do not apply to production without explicit approval.

CREATE TABLE "StudioProjectIntegration" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "externalProjectId" TEXT NOT NULL,
  "externalProjectName" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "framework" TEXT,
  "repositoryFullName" TEXT,
  "repositoryUrl" TEXT,
  "defaultBranch" TEXT,
  "productionDeploymentId" TEXT,
  "productionDeploymentUrl" TEXT,
  "productionState" TEXT,
  "productionCommitSha" TEXT,
  "productionBranch" TEXT,
  "productionCreatedAt" TIMESTAMP(3),
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metaJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudioProjectIntegration_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StudioProjectIntegration_provider_externalProjectId_key" UNIQUE ("provider", "externalProjectId")
);

CREATE TABLE "StudioInfrastructureSyncRun" (
  "id" TEXT PRIMARY KEY,
  "provider" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'RUNNING',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "finishedAt" TIMESTAMP(3),
  "discoveredCount" INTEGER NOT NULL DEFAULT 0,
  "createdCount" INTEGER NOT NULL DEFAULT 0,
  "updatedCount" INTEGER NOT NULL DEFAULT 0,
  "missingCount" INTEGER NOT NULL DEFAULT 0,
  "errorCount" INTEGER NOT NULL DEFAULT 0,
  "errorSummary" TEXT,
  "detailsJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "StudioProjectIntegration_projectId_provider_idx" ON "StudioProjectIntegration"("projectId", "provider");
CREATE INDEX "StudioProjectIntegration_provider_status_idx" ON "StudioProjectIntegration"("provider", "status");
CREATE INDEX "StudioProjectIntegration_lastSyncedAt_idx" ON "StudioProjectIntegration"("lastSyncedAt");
CREATE INDEX "StudioInfrastructureSyncRun_provider_startedAt_idx" ON "StudioInfrastructureSyncRun"("provider", "startedAt");
