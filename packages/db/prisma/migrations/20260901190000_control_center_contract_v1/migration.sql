-- Additive migration for Trends172Tech Control Center contract V1.
-- No existing tables or columns are removed or renamed.

CREATE TYPE "ControlProductStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'ARCHIVED');
CREATE TYPE "ControlImplementationKind" AS ENUM ('INTERNAL', 'CUSTOMER', 'DEMO');
CREATE TYPE "ControlImplementationStatus" AS ENUM ('PLANNING', 'SHADOW', 'ACTIVE', 'SUSPENDED', 'RETIRED');
CREATE TYPE "ControlAgentTemplateStatus" AS ENUM ('DRAFT', 'ACTIVE', 'DEPRECATED');
CREATE TYPE "ControlAgentRunStatus" AS ENUM ('ACCEPTED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

CREATE TABLE "ControlProduct" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ControlProductStatus" NOT NULL DEFAULT 'DRAFT',
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ControlProduct_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ControlImplementation" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "tenantId" TEXT,
    "adminProjectId" TEXT,
    "name" TEXT NOT NULL,
    "kind" "ControlImplementationKind" NOT NULL,
    "status" "ControlImplementationStatus" NOT NULL DEFAULT 'PLANNING',
    "environment" TEXT NOT NULL DEFAULT 'production',
    "shadowMode" BOOLEAN NOT NULL DEFAULT true,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ControlImplementation_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ControlAgentTemplate" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "status" "ControlAgentTemplateStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ControlAgentTemplate_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ControlAgentTemplateVersion" (
    "id" TEXT NOT NULL,
    "agentTemplateId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "baseAgentKey" TEXT NOT NULL,
    "promptHash" TEXT,
    "configJson" JSONB,
    "policyJson" JSONB,
    "skillsJson" JSONB,
    "isApproved" BOOLEAN NOT NULL DEFAULT false,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ControlAgentTemplateVersion_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "AgentInstance"
    ADD COLUMN "controlImplementationId" TEXT,
    ADD COLUMN "controlTemplateVersionId" TEXT;

CREATE TABLE "ControlServiceClient" (
    "id" TEXT NOT NULL,
    "implementationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "secretHash" TEXT NOT NULL,
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ControlServiceClient_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ControlAgentRun" (
    "id" TEXT NOT NULL,
    "implementationId" TEXT NOT NULL,
    "agentInstanceId" TEXT,
    "agentTemplateVersionId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "traceId" TEXT NOT NULL,
    "externalRunId" TEXT,
    "status" "ControlAgentRunStatus" NOT NULL DEFAULT 'ACCEPTED',
    "channel" TEXT,
    "actorJson" JSONB,
    "inputClass" TEXT,
    "safeMetadataJson" JSONB,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ControlAgentRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ControlAgentRunEvent" (
    "id" TEXT NOT NULL,
    "agentRunId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "eventType" TEXT NOT NULL,
    "skillKey" TEXT,
    "safeMetadataJson" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ControlAgentRunEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ControlAgentUsageRecord" (
    "id" TEXT NOT NULL,
    "agentRunId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "inputTokens" INTEGER NOT NULL DEFAULT 0,
    "outputTokens" INTEGER NOT NULL DEFAULT 0,
    "cachedTokens" INTEGER NOT NULL DEFAULT 0,
    "latencyMs" INTEGER,
    "costUsdMicros" INTEGER,
    "gpuMillis" INTEGER,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ControlAgentUsageRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ControlProduct_key_key" ON "ControlProduct"("key");
CREATE INDEX "ControlProduct_status_idx" ON "ControlProduct"("status");
CREATE UNIQUE INDEX "ControlImplementation_key_key" ON "ControlImplementation"("key");
CREATE UNIQUE INDEX "ControlImplementation_adminProjectId_key" ON "ControlImplementation"("adminProjectId");
CREATE INDEX "ControlImplementation_productId_status_idx" ON "ControlImplementation"("productId", "status");
CREATE INDEX "ControlImplementation_tenantId_idx" ON "ControlImplementation"("tenantId");
CREATE INDEX "ControlImplementation_kind_status_idx" ON "ControlImplementation"("kind", "status");
CREATE UNIQUE INDEX "ControlAgentTemplate_productId_key_key" ON "ControlAgentTemplate"("productId", "key");
CREATE INDEX "ControlAgentTemplate_productId_status_idx" ON "ControlAgentTemplate"("productId", "status");
CREATE UNIQUE INDEX "ControlAgentTemplateVersion_agentTemplateId_version_key" ON "ControlAgentTemplateVersion"("agentTemplateId", "version");
CREATE INDEX "ControlAgentTemplateVersion_agentTemplateId_isApproved_idx" ON "ControlAgentTemplateVersion"("agentTemplateId", "isApproved");
CREATE INDEX "AgentInstance_controlImplementationId_idx" ON "AgentInstance"("controlImplementationId");
CREATE INDEX "AgentInstance_controlTemplateVersionId_idx" ON "AgentInstance"("controlTemplateVersionId");
CREATE UNIQUE INDEX "ControlServiceClient_keyPrefix_key" ON "ControlServiceClient"("keyPrefix");
CREATE UNIQUE INDEX "ControlServiceClient_secretHash_key" ON "ControlServiceClient"("secretHash");
CREATE INDEX "ControlServiceClient_implementationId_isActive_idx" ON "ControlServiceClient"("implementationId", "isActive");
CREATE UNIQUE INDEX "ControlAgentRun_implementationId_idempotencyKey_key" ON "ControlAgentRun"("implementationId", "idempotencyKey");
CREATE INDEX "ControlAgentRun_implementationId_createdAt_idx" ON "ControlAgentRun"("implementationId", "createdAt");
CREATE INDEX "ControlAgentRun_agentInstanceId_createdAt_idx" ON "ControlAgentRun"("agentInstanceId", "createdAt");
CREATE INDEX "ControlAgentRun_traceId_idx" ON "ControlAgentRun"("traceId");
CREATE INDEX "ControlAgentRun_status_createdAt_idx" ON "ControlAgentRun"("status", "createdAt");
CREATE UNIQUE INDEX "ControlAgentRunEvent_agentRunId_sequence_key" ON "ControlAgentRunEvent"("agentRunId", "sequence");
CREATE INDEX "ControlAgentRunEvent_agentRunId_occurredAt_idx" ON "ControlAgentRunEvent"("agentRunId", "occurredAt");
CREATE INDEX "ControlAgentRunEvent_skillKey_occurredAt_idx" ON "ControlAgentRunEvent"("skillKey", "occurredAt");
CREATE INDEX "ControlAgentUsageRecord_agentRunId_createdAt_idx" ON "ControlAgentUsageRecord"("agentRunId", "createdAt");
CREATE INDEX "ControlAgentUsageRecord_provider_model_createdAt_idx" ON "ControlAgentUsageRecord"("provider", "model", "createdAt");

ALTER TABLE "ControlImplementation" ADD CONSTRAINT "ControlImplementation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ControlProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ControlImplementation" ADD CONSTRAINT "ControlImplementation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ControlImplementation" ADD CONSTRAINT "ControlImplementation_adminProjectId_fkey" FOREIGN KEY ("adminProjectId") REFERENCES "AdminProject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ControlAgentTemplate" ADD CONSTRAINT "ControlAgentTemplate_productId_fkey" FOREIGN KEY ("productId") REFERENCES "ControlProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ControlAgentTemplateVersion" ADD CONSTRAINT "ControlAgentTemplateVersion_agentTemplateId_fkey" FOREIGN KEY ("agentTemplateId") REFERENCES "ControlAgentTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentInstance" ADD CONSTRAINT "AgentInstance_controlImplementationId_fkey" FOREIGN KEY ("controlImplementationId") REFERENCES "ControlImplementation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AgentInstance" ADD CONSTRAINT "AgentInstance_controlTemplateVersionId_fkey" FOREIGN KEY ("controlTemplateVersionId") REFERENCES "ControlAgentTemplateVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ControlServiceClient" ADD CONSTRAINT "ControlServiceClient_implementationId_fkey" FOREIGN KEY ("implementationId") REFERENCES "ControlImplementation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ControlAgentRun" ADD CONSTRAINT "ControlAgentRun_implementationId_fkey" FOREIGN KEY ("implementationId") REFERENCES "ControlImplementation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ControlAgentRun" ADD CONSTRAINT "ControlAgentRun_agentInstanceId_fkey" FOREIGN KEY ("agentInstanceId") REFERENCES "AgentInstance"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ControlAgentRun" ADD CONSTRAINT "ControlAgentRun_agentTemplateVersionId_fkey" FOREIGN KEY ("agentTemplateVersionId") REFERENCES "ControlAgentTemplateVersion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ControlAgentRunEvent" ADD CONSTRAINT "ControlAgentRunEvent_agentRunId_fkey" FOREIGN KEY ("agentRunId") REFERENCES "ControlAgentRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ControlAgentUsageRecord" ADD CONSTRAINT "ControlAgentUsageRecord_agentRunId_fkey" FOREIGN KEY ("agentRunId") REFERENCES "ControlAgentRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
