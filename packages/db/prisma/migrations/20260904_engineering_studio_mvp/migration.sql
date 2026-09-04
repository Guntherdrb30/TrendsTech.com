-- Trends Engineering Studio MVP
-- Safe additive migration: creates new isolated tables only.

CREATE TABLE "StudioProject" (
  "id" TEXT PRIMARY KEY,
  "adminProjectId" TEXT,
  "name" TEXT NOT NULL,
  "clientName" TEXT,
  "mode" TEXT NOT NULL DEFAULT 'CREATE',
  "stage" TEXT NOT NULL DEFAULT 'IDEA',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
  "summary" TEXT,
  "mvpObjective" TEXT,
  "confidentiality" TEXT NOT NULL DEFAULT 'INTERNAL',
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "repositoryUrl" TEXT,
  "repositoryBranch" TEXT,
  "vercelProjectId" TEXT,
  "neonProjectId" TEXT,
  "localAiRequired" BOOLEAN NOT NULL DEFAULT false,
  "createdByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "StudioConstitution" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL UNIQUE,
  "version" INTEGER NOT NULL DEFAULT 1,
  "rulesJson" JSONB NOT NULL,
  "approvedAt" TIMESTAMP(3),
  "approvedByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudioConstitution_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "StudioBlueprint" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "understanding" TEXT,
  "scopeJson" JSONB,
  "outOfScopeJson" JSONB,
  "assumptionsJson" JSONB,
  "risksJson" JSONB,
  "architectureJson" JSONB,
  "dataModelJson" JSONB,
  "screensJson" JSONB,
  "integrationsJson" JSONB,
  "agentsJson" JSONB,
  "acceptanceCriteriaJson" JSONB,
  "estimatedInternalCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "recommendedPrice" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "estimatedOpexMonthly" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudioBlueprint_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StudioBlueprint_projectId_version_key" UNIQUE ("projectId", "version")
);

CREATE TABLE "StudioBudgetBaseline" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "version" INTEGER NOT NULL DEFAULT 1,
  "internalCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "commercialValue" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "targetMarginPercent" DECIMAL(7,3) NOT NULL DEFAULT 0,
  "contingencyPercent" DECIMAL(7,3) NOT NULL DEFAULT 0,
  "overheadPercent" DECIMAL(7,3) NOT NULL DEFAULT 0,
  "opexMonthly" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "detailsJson" JSONB,
  "approvedAt" TIMESTAMP(3),
  "approvedByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudioBudgetBaseline_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StudioBudgetBaseline_projectId_version_key" UNIQUE ("projectId", "version")
);

CREATE TABLE "StudioBudgetForecast" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "baselineId" TEXT,
  "internalCostForecast" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "actualCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "remainingCostForecast" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "contractedValue" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "potentialChangeValue" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "forecastMarginPercent" DECIMAL(7,3) NOT NULL DEFAULT 0,
  "opexMonthlyForecast" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "detailsJson" JSONB,
  "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudioBudgetForecast_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StudioBudgetForecast_baselineId_fkey" FOREIGN KEY ("baselineId") REFERENCES "StudioBudgetBaseline"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "StudioCostEntry" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "runId" TEXT,
  "category" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'ESTIMATED',
  "description" TEXT,
  "quantity" DECIMAL(18,6),
  "unit" TEXT,
  "unitCost" DECIMAL(18,6),
  "amount" DECIMAL(14,4) NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "isRecurring" BOOLEAN NOT NULL DEFAULT false,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metaJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudioCostEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "StudioApproval" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "gate" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "scopeJson" JSONB,
  "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "decidedAt" TIMESTAMP(3),
  "decidedByUserId" TEXT,
  "decisionNote" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudioApproval_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "StudioChangeRequest" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "reason" TEXT,
  "functionalImpactJson" JSONB,
  "technicalImpactJson" JSONB,
  "internalCostDelta" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "commercialPriceDelta" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "opexMonthlyDelta" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "marginAfterPercent" DECIMAL(7,3),
  "scheduleImpactDays" INTEGER NOT NULL DEFAULT 0,
  "riskLevel" TEXT NOT NULL DEFAULT 'MEDIUM',
  "approvedAt" TIMESTAMP(3),
  "approvedByUserId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudioChangeRequest_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StudioChangeRequest_projectId_code_key" UNIQUE ("projectId", "code")
);

CREATE TABLE "StudioAgentDefinition" (
  "id" TEXT PRIMARY KEY,
  "key" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "description" TEXT,
  "defaultProvider" TEXT,
  "defaultModel" TEXT,
  "capabilitiesJson" JSONB,
  "allowedToolsJson" JSONB,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "StudioProjectAgent" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "agentDefinitionId" TEXT NOT NULL,
  "provider" TEXT,
  "model" TEXT,
  "isEnabled" BOOLEAN NOT NULL DEFAULT true,
  "budgetUsd" DECIMAL(14,4),
  "configJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudioProjectAgent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StudioProjectAgent_agentDefinitionId_fkey" FOREIGN KEY ("agentDefinitionId") REFERENCES "StudioAgentDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "StudioProjectAgent_projectId_agentDefinitionId_key" UNIQUE ("projectId", "agentDefinitionId")
);

CREATE TABLE "StudioBacklogItem" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "changeRequestId" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'IDEA',
  "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
  "assignedAgentKey" TEXT,
  "estimatedCost" DECIMAL(14,4) NOT NULL DEFAULT 0,
  "actualCost" DECIMAL(14,4) NOT NULL DEFAULT 0,
  "acceptanceCriteriaJson" JSONB,
  "dependenciesJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudioBacklogItem_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StudioBacklogItem_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "StudioChangeRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "StudioAgentRun" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "backlogItemId" TEXT,
  "agentKey" TEXT NOT NULL,
  "provider" TEXT,
  "model" TEXT,
  "status" TEXT NOT NULL DEFAULT 'QUEUED',
  "environment" TEXT NOT NULL DEFAULT 'PREVIEW',
  "repositoryBranch" TEXT,
  "commitSha" TEXT,
  "deploymentUrl" TEXT,
  "inputTokens" BIGINT,
  "outputTokens" BIGINT,
  "cachedInputTokens" BIGINT,
  "costUsd" DECIMAL(14,6) NOT NULL DEFAULT 0,
  "startedAt" TIMESTAMP(3),
  "finishedAt" TIMESTAMP(3),
  "errorSummary" TEXT,
  "resultJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudioAgentRun_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StudioAgentRun_backlogItemId_fkey" FOREIGN KEY ("backlogItemId") REFERENCES "StudioBacklogItem"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

ALTER TABLE "StudioCostEntry"
  ADD CONSTRAINT "StudioCostEntry_runId_fkey" FOREIGN KEY ("runId") REFERENCES "StudioAgentRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "StudioDecision" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'ENGINEERING_STUDIO',
  "title" TEXT NOT NULL,
  "decision" TEXT NOT NULL,
  "rationale" TEXT,
  "sourceRef" TEXT,
  "decidedByUserId" TEXT,
  "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metaJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudioDecision_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "StudioIntegration" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT,
  "provider" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DISCONNECTED',
  "externalRef" TEXT,
  "scopeJson" JSONB,
  "lastUsedAt" TIMESTAMP(3),
  "metaJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudioIntegration_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "StudioHardwareAsset" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT,
  "kind" TEXT NOT NULL DEFAULT 'REFERENCE',
  "name" TEXT NOT NULL,
  "vendor" TEXT,
  "gpu" TEXT,
  "gpuMemoryGb" DECIMAL(10,2),
  "cpu" TEXT,
  "ramGb" DECIMAL(10,2),
  "storageJson" JSONB,
  "purchasePrice" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "importCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "installationCost" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "idleWatts" DECIMAL(12,2),
  "averageWatts" DECIMAL(12,2),
  "maxWatts" DECIMAL(12,2),
  "electricityUsdPerKwh" DECIMAL(12,6),
  "usefulLifeMonths" INTEGER,
  "maintenanceMonthly" DECIMAL(14,2) NOT NULL DEFAULT 0,
  "sourceUrl" TEXT,
  "sourceDate" TIMESTAMP(3),
  "metaJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudioHardwareAsset_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "StudioHardwareBenchmark" (
  "id" TEXT PRIMARY KEY,
  "hardwareAssetId" TEXT NOT NULL,
  "modelName" TEXT NOT NULL,
  "runtime" TEXT,
  "quantization" TEXT,
  "contextTokens" INTEGER,
  "concurrency" INTEGER,
  "tokensPerSecond" DECIMAL(14,4),
  "ttftMs" DECIMAL(14,2),
  "vramUsedGb" DECIMAL(10,3),
  "averageWatts" DECIMAL(12,2),
  "notes" TEXT,
  "measuredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "metaJson" JSONB,
  CONSTRAINT "StudioHardwareBenchmark_hardwareAssetId_fkey" FOREIGN KEY ("hardwareAssetId") REFERENCES "StudioHardwareAsset"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE "StudioEvent" (
  "id" TEXT PRIMARY KEY,
  "projectId" TEXT,
  "runId" TEXT,
  "type" TEXT NOT NULL,
  "actorType" TEXT NOT NULL DEFAULT 'SYSTEM',
  "actorRef" TEXT,
  "message" TEXT,
  "metaJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "StudioEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "StudioProject"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "StudioEvent_runId_fkey" FOREIGN KEY ("runId") REFERENCES "StudioAgentRun"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX "StudioProject_stage_status_idx" ON "StudioProject"("stage", "status");
CREATE INDEX "StudioProject_adminProjectId_idx" ON "StudioProject"("adminProjectId");
CREATE INDEX "StudioBlueprint_projectId_status_idx" ON "StudioBlueprint"("projectId", "status");
CREATE INDEX "StudioBudgetForecast_projectId_calculatedAt_idx" ON "StudioBudgetForecast"("projectId", "calculatedAt");
CREATE INDEX "StudioCostEntry_projectId_category_idx" ON "StudioCostEntry"("projectId", "category");
CREATE INDEX "StudioCostEntry_occurredAt_idx" ON "StudioCostEntry"("occurredAt");
CREATE INDEX "StudioApproval_projectId_status_idx" ON "StudioApproval"("projectId", "status");
CREATE INDEX "StudioChangeRequest_projectId_status_idx" ON "StudioChangeRequest"("projectId", "status");
CREATE INDEX "StudioBacklogItem_projectId_status_idx" ON "StudioBacklogItem"("projectId", "status");
CREATE INDEX "StudioAgentRun_projectId_status_idx" ON "StudioAgentRun"("projectId", "status");
CREATE INDEX "StudioAgentRun_createdAt_idx" ON "StudioAgentRun"("createdAt");
CREATE INDEX "StudioDecision_projectId_decidedAt_idx" ON "StudioDecision"("projectId", "decidedAt");
CREATE INDEX "StudioIntegration_provider_status_idx" ON "StudioIntegration"("provider", "status");
CREATE INDEX "StudioHardwareAsset_kind_idx" ON "StudioHardwareAsset"("kind");
CREATE INDEX "StudioHardwareBenchmark_hardwareAssetId_measuredAt_idx" ON "StudioHardwareBenchmark"("hardwareAssetId", "measuredAt");
CREATE INDEX "StudioEvent_projectId_createdAt_idx" ON "StudioEvent"("projectId", "createdAt");
CREATE INDEX "StudioEvent_runId_createdAt_idx" ON "StudioEvent"("runId", "createdAt");
