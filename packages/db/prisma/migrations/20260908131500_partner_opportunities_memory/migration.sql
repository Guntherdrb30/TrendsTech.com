-- Partner opportunities + per-project agent memory

CREATE TABLE IF NOT EXISTS "PartnerOpportunity" (
  "id" TEXT NOT NULL,
  "partnerId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "targetCompany" TEXT NOT NULL,
  "clientContact" TEXT,
  "stage" TEXT NOT NULL DEFAULT 'DISCOVERY',
  "objective" TEXT,
  "knownContext" TEXT,
  "requestedNeed" TEXT,
  "nextMeetingAt" TIMESTAMP(3),
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PartnerOpportunity_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "PartnerOpportunity_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "PartnerOpportunity_partnerId_idx" ON "PartnerOpportunity"("partnerId");
CREATE INDEX IF NOT EXISTS "PartnerOpportunity_stage_idx" ON "PartnerOpportunity"("stage");
CREATE INDEX IF NOT EXISTS "PartnerOpportunity_status_idx" ON "PartnerOpportunity"("status");

CREATE TABLE IF NOT EXISTS "ProjectAgent" (
  "id" TEXT NOT NULL,
  "opportunityId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "systemPromptVersion" TEXT NOT NULL DEFAULT 'v1',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectAgent_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProjectAgent_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "PartnerOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProjectAgent_opportunityId_key" ON "ProjectAgent"("opportunityId");

CREATE TABLE IF NOT EXISTS "ProjectMemory" (
  "id" TEXT NOT NULL,
  "opportunityId" TEXT NOT NULL,
  "executiveSummary" TEXT,
  "currentStageSummary" TEXT,
  "confirmedFacts" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "assumptions" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "openQuestions" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "risks" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "nextActions" JSONB NOT NULL DEFAULT '[]'::jsonb,
  "readinessScore" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectMemory_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProjectMemory_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "PartnerOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "ProjectMemory_readinessScore_check" CHECK ("readinessScore" >= 0 AND "readinessScore" <= 100)
);

CREATE UNIQUE INDEX IF NOT EXISTS "ProjectMemory_opportunityId_key" ON "ProjectMemory"("opportunityId");

CREATE TABLE IF NOT EXISTS "ProjectMemoryEntry" (
  "id" TEXT NOT NULL,
  "opportunityId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL DEFAULT 'ALLY_INPUT',
  "sourceLabel" TEXT,
  "confidence" TEXT NOT NULL DEFAULT 'CONFIRMED',
  "isCurrent" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProjectMemoryEntry_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProjectMemoryEntry_opportunityId_fkey" FOREIGN KEY ("opportunityId") REFERENCES "PartnerOpportunity"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "ProjectMemoryEntry_opportunityId_idx" ON "ProjectMemoryEntry"("opportunityId");
CREATE INDEX IF NOT EXISTS "ProjectMemoryEntry_category_idx" ON "ProjectMemoryEntry"("category");
CREATE INDEX IF NOT EXISTS "ProjectMemoryEntry_confidence_idx" ON "ProjectMemoryEntry"("confidence");
