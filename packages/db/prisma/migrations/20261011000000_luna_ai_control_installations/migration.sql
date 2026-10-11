-- New LUNA AI Control Center installations are separate from legacy widget Install records.
CREATE TYPE "AiControlInstallationStatus" AS ENUM ('REQUESTED','APPROVED','REJECTED','ACTIVE','SUSPENDED','REVOKED');
CREATE TABLE "AiControlInstallation" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "applicationKey" TEXT NOT NULL,
  "environment" TEXT NOT NULL DEFAULT 'production',
  "domain" TEXT,
  "status" "AiControlInstallationStatus" NOT NULL DEFAULT 'REQUESTED',
  "requestedByUserId" TEXT NOT NULL,
  "reviewedByUserId" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "reviewReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AiControlInstallation_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AiControlInstallationAudit" (
  "id" TEXT NOT NULL,
  "installationId" TEXT NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "previousStatus" "AiControlInstallationStatus" NOT NULL,
  "nextStatus" "AiControlInstallationStatus" NOT NULL,
  "reason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiControlInstallationAudit_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "AiControlInstallation_tenantId_createdAt_idx" ON "AiControlInstallation"("tenantId","createdAt");
CREATE INDEX "AiControlInstallation_status_createdAt_idx" ON "AiControlInstallation"("status","createdAt");
CREATE INDEX "AiControlInstallationAudit_installationId_createdAt_idx" ON "AiControlInstallationAudit"("installationId","createdAt");
ALTER TABLE "AiControlInstallation" ADD CONSTRAINT "AiControlInstallation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AiControlInstallationAudit" ADD CONSTRAINT "AiControlInstallationAudit_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "AiControlInstallation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
