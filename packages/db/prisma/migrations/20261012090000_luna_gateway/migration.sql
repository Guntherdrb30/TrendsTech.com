CREATE TABLE "AiControlGatewayPolicy" (
 "installationId" TEXT PRIMARY KEY REFERENCES "AiControlInstallation"("id"),
 "enabled" BOOLEAN NOT NULL DEFAULT false,
 "allowedAgents" TEXT[] NOT NULL,
 "requestsPerMinute" INTEGER NOT NULL DEFAULT 60 CHECK ("requestsPerMinute" BETWEEN 1 AND 10000),
 "maxConcurrent" INTEGER NOT NULL DEFAULT 4 CHECK ("maxConcurrent" BETWEEN 1 AND 100),
 "windowStartedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "windowRequests" INTEGER NOT NULL DEFAULT 0,
 "updatedAt" TIMESTAMP(3) NOT NULL
);
CREATE TABLE "AiControlGatewayLease" (
 "id" TEXT PRIMARY KEY,
 "installationId" TEXT NOT NULL REFERENCES "AiControlInstallation"("id"),
 "operationId" TEXT NOT NULL,
 "agent" TEXT NOT NULL,
 "expiresAt" TIMESTAMP(3) NOT NULL,
 "releasedAt" TIMESTAMP(3),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "AiControlGatewayLease_installationId_operationId_key" ON "AiControlGatewayLease"("installationId", "operationId");
CREATE INDEX "AiControlGatewayLease_installationId_expiresAt_idx" ON "AiControlGatewayLease"("installationId", "expiresAt");
