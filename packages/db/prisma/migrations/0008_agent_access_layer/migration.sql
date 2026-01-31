-- CreateTable
CREATE TABLE "AgentAccess" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "allowedDomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "channel" TEXT NOT NULL DEFAULT 'embedded_web',
    "maxTokensPerMonth" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AgentAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccessLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "agentInstanceId" TEXT NOT NULL,
    "agentAccessId" TEXT NOT NULL,
    "domain" TEXT,
    "channel" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "metaJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccessLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AgentAccess_tenantId_idx" ON "AgentAccess"("tenantId");

-- CreateIndex
CREATE INDEX "AgentAccess_agentId_idx" ON "AgentAccess"("agentId");

-- CreateIndex
CREATE INDEX "AgentAccess_tenantId_isActive_idx" ON "AgentAccess"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "AgentAccess_agentId_isActive_idx" ON "AgentAccess"("agentId", "isActive");

-- CreateIndex
CREATE INDEX "AccessLog_tenantId_idx" ON "AccessLog"("tenantId");

-- CreateIndex
CREATE INDEX "AccessLog_agentInstanceId_idx" ON "AccessLog"("agentInstanceId");

-- CreateIndex
CREATE INDEX "AccessLog_agentAccessId_idx" ON "AccessLog"("agentAccessId");

-- AddForeignKey
ALTER TABLE "AgentAccess" ADD CONSTRAINT "AgentAccess_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentAccess" ADD CONSTRAINT "AgentAccess_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "AgentInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_agentInstanceId_fkey" FOREIGN KEY ("agentInstanceId") REFERENCES "AgentInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccessLog" ADD CONSTRAINT "AccessLog_agentAccessId_fkey" FOREIGN KEY ("agentAccessId") REFERENCES "AgentAccess"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

