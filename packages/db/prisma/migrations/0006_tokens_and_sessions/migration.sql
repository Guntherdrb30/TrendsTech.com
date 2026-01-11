CREATE TABLE "TokenWallet" (
  "tenantId" TEXT NOT NULL,
  "balance" INTEGER NOT NULL DEFAULT 0,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "TokenWallet_pkey" PRIMARY KEY ("tenantId")
);

CREATE TABLE "TokenUsageLog" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "agentInstanceId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "tokensIn" INTEGER,
  "tokensOut" INTEGER,
  "totalTokens" INTEGER NOT NULL,
  "model" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "TokenUsageLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgentSession" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "agentInstanceId" TEXT NOT NULL,
  "sessionId" TEXT NOT NULL,
  "channel" TEXT,
  "endUserJson" JSONB,
  "isDemo" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AgentSession_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "TokenUsageLog_tenantId_idx" ON "TokenUsageLog"("tenantId");
CREATE INDEX "TokenUsageLog_agentInstanceId_idx" ON "TokenUsageLog"("agentInstanceId");
CREATE INDEX "TokenUsageLog_sessionId_idx" ON "TokenUsageLog"("sessionId");

CREATE INDEX "AgentSession_tenantId_idx" ON "AgentSession"("tenantId");
CREATE INDEX "AgentSession_agentInstanceId_idx" ON "AgentSession"("agentInstanceId");
CREATE INDEX "AgentSession_sessionId_idx" ON "AgentSession"("sessionId");
CREATE UNIQUE INDEX "AgentSession_tenantId_sessionId_key" ON "AgentSession"("tenantId", "sessionId");

ALTER TABLE "TokenWallet" ADD CONSTRAINT "TokenWallet_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TokenUsageLog" ADD CONSTRAINT "TokenUsageLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TokenUsageLog" ADD CONSTRAINT "TokenUsageLog_agentInstanceId_fkey" FOREIGN KEY ("agentInstanceId") REFERENCES "AgentInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentSession" ADD CONSTRAINT "AgentSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AgentSession" ADD CONSTRAINT "AgentSession_agentInstanceId_fkey" FOREIGN KEY ("agentInstanceId") REFERENCES "AgentInstance"("id") ON DELETE CASCADE ON UPDATE CASCADE;
