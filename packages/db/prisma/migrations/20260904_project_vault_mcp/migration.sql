-- Trends Engineering Studio - Project Vault + Context Pack
-- Additive migration only. Do not apply to production without Approval Gate.

CREATE TABLE "StudioVaultEntry" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'CURRENT',
  "source" TEXT NOT NULL DEFAULT 'ENGINEERING_STUDIO',
  "sourceRef" TEXT,
  "version" INTEGER NOT NULL DEFAULT 1,
  "supersedesId" TEXT,
  "createdByUserId" TEXT,
  "metaJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudioVaultEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StudioVaultEntry_supersedesId_fkey" FOREIGN KEY ("supersedesId") REFERENCES "StudioVaultEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "StudioContextPack" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "kind" TEXT NOT NULL DEFAULT 'PROJECT',
  "agentKey" TEXT,
  "status" TEXT NOT NULL DEFAULT 'GENERATED',
  "contentJson" JSONB NOT NULL,
  "sourceEntryIdsJson" JSONB,
  "estimatedTokens" INTEGER,
  "createdByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudioContextPack_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "StudioVaultEntry_projectId_type_status_idx" ON "StudioVaultEntry"("projectId", "type", "status");
CREATE INDEX "StudioVaultEntry_projectId_createdAt_idx" ON "StudioVaultEntry"("projectId", "createdAt");
CREATE INDEX "StudioVaultEntry_source_sourceRef_idx" ON "StudioVaultEntry"("source", "sourceRef");
CREATE INDEX "StudioContextPack_projectId_createdAt_idx" ON "StudioContextPack"("projectId", "createdAt");
CREATE INDEX "StudioContextPack_agentKey_createdAt_idx" ON "StudioContextPack"("agentKey", "createdAt");
