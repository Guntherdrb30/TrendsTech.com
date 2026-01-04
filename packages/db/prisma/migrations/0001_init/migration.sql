-- CreateEnum
CREATE TYPE "TenantMode" AS ENUM ('SINGLE', 'RESELLER');
CREATE TYPE "TenantStatus" AS ENUM ('ACTIVE', 'SUSPENDED');
CREATE TYPE "UserRole" AS ENUM ('ROOT', 'TENANT_ADMIN', 'TENANT_OPERATOR', 'TENANT_VIEWER');
CREATE TYPE "AgentStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED');
CREATE TYPE "Language" AS ENUM ('ES', 'EN');
CREATE TYPE "KnowledgeSourceType" AS ENUM ('URL', 'PDF', 'TEXT');
CREATE TYPE "KnowledgeSourceStatus" AS ENUM ('PENDING', 'PROCESSING', 'READY', 'FAILED');
CREATE TYPE "InstallStatus" AS ENUM ('ACTIVE', 'DISABLED');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED');
CREATE TYPE "ManualPaymentCurrency" AS ENUM ('USD', 'VES');
CREATE TYPE "ManualPaymentStatus" AS ENUM ('PENDING', 'REVIEWING', 'APPROVED', 'REJECTED');
CREATE TYPE "RoundingRule" AS ENUM ('ONE', 'FIVE', 'TEN');

-- CreateTable
CREATE TABLE "Tenant" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "mode" "TenantMode" NOT NULL DEFAULT 'SINGLE',
  "status" "TenantStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "role" "UserRole" NOT NULL DEFAULT 'TENANT_VIEWER',
  "passwordHash" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EndCustomer" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "EndCustomer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AgentInstance" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "endCustomerId" TEXT,
  "name" TEXT NOT NULL,
  "baseAgentKey" TEXT NOT NULL,
  "languageDefault" "Language" NOT NULL DEFAULT 'ES',
  "status" "AgentStatus" NOT NULL DEFAULT 'DRAFT',
  "featuresJson" JSONB,
  "brandingJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "AgentInstance_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "KnowledgeSource" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "agentInstanceId" TEXT NOT NULL,
  "type" "KnowledgeSourceType" NOT NULL,
  "title" TEXT,
  "url" TEXT,
  "fileKey" TEXT,
  "rawText" TEXT,
  "status" "KnowledgeSourceStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "KnowledgeSource_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Install" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "agentInstanceId" TEXT NOT NULL,
  "publicKey" TEXT NOT NULL,
  "allowedDomains" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "status" "InstallStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Install_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Plan" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "name_es" TEXT NOT NULL,
  "name_en" TEXT NOT NULL,
  "priceUsdMonthly" DECIMAL(12,2) NOT NULL,
  "limitsJson" JSONB,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Subscription" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endsAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ManualPayment" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "subscriptionId" TEXT,
  "amountPaid" DECIMAL(12,2) NOT NULL,
  "currencyPaid" "ManualPaymentCurrency" NOT NULL,
  "exchangeRateUsed" DECIMAL(12,4),
  "reference" TEXT NOT NULL,
  "proofUrl" TEXT,
  "status" "ManualPaymentStatus" NOT NULL DEFAULT 'PENDING',
  "reviewedByUserId" TEXT,
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "ManualPayment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "GlobalSettings" (
  "id" INTEGER NOT NULL DEFAULT 1,
  "usdToVesRate" DECIMAL(12,4) NOT NULL,
  "roundingRule" "RoundingRule" NOT NULL DEFAULT 'ONE',
  "usdPaymentDiscountPercent" DECIMAL(5,2) NOT NULL,
  "updatedByUserId" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "GlobalSettings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "actorUserId" TEXT NOT NULL,
  "tenantId" TEXT,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT NOT NULL,
  "metaJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- Indexes
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Install_publicKey_key" ON "Install"("publicKey");
CREATE UNIQUE INDEX "Plan_key_key" ON "Plan"("key");

CREATE INDEX "User_tenantId_idx" ON "User"("tenantId");
CREATE INDEX "EndCustomer_tenantId_idx" ON "EndCustomer"("tenantId");
CREATE INDEX "AgentInstance_tenantId_idx" ON "AgentInstance"("tenantId");
CREATE INDEX "AgentInstance_endCustomerId_idx" ON "AgentInstance"("endCustomerId");
CREATE INDEX "KnowledgeSource_tenantId_idx" ON "KnowledgeSource"("tenantId");
CREATE INDEX "KnowledgeSource_agentInstanceId_idx" ON "KnowledgeSource"("agentInstanceId");
CREATE INDEX "Install_tenantId_idx" ON "Install"("tenantId");
CREATE INDEX "Install_agentInstanceId_idx" ON "Install"("agentInstanceId");
CREATE INDEX "Subscription_tenantId_idx" ON "Subscription"("tenantId");
CREATE INDEX "Subscription_planId_idx" ON "Subscription"("planId");
CREATE INDEX "ManualPayment_tenantId_idx" ON "ManualPayment"("tenantId");
CREATE INDEX "ManualPayment_subscriptionId_idx" ON "ManualPayment"("subscriptionId");
CREATE INDEX "GlobalSettings_updatedByUserId_idx" ON "GlobalSettings"("updatedByUserId");
CREATE INDEX "AuditLog_actorUserId_idx" ON "AuditLog"("actorUserId");
CREATE INDEX "AuditLog_tenantId_idx" ON "AuditLog"("tenantId");

-- Foreign Keys
ALTER TABLE "User" ADD CONSTRAINT "User_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "EndCustomer" ADD CONSTRAINT "EndCustomer_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AgentInstance" ADD CONSTRAINT "AgentInstance_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AgentInstance" ADD CONSTRAINT "AgentInstance_endCustomerId_fkey" FOREIGN KEY ("endCustomerId") REFERENCES "EndCustomer"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "KnowledgeSource" ADD CONSTRAINT "KnowledgeSource_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "KnowledgeSource" ADD CONSTRAINT "KnowledgeSource_agentInstanceId_fkey" FOREIGN KEY ("agentInstanceId") REFERENCES "AgentInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Install" ADD CONSTRAINT "Install_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Install" ADD CONSTRAINT "Install_agentInstanceId_fkey" FOREIGN KEY ("agentInstanceId") REFERENCES "AgentInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManualPayment" ADD CONSTRAINT "ManualPayment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ManualPayment" ADD CONSTRAINT "ManualPayment_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ManualPayment" ADD CONSTRAINT "ManualPayment_reviewedByUserId_fkey" FOREIGN KEY ("reviewedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "GlobalSettings" ADD CONSTRAINT "GlobalSettings_updatedByUserId_fkey" FOREIGN KEY ("updatedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserId_fkey" FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
