-- CreateEnum
CREATE TYPE "DevExecutionMode" AS ENUM ('LOCAL', 'REMOTE', 'GITHUB');

-- CreateEnum
CREATE TYPE "DevTaskStatus" AS ENUM ('PENDING', 'QUEUED', 'RUNNING', 'REVIEW', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "DevTaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "DevTaskLogLevel" AS ENUM ('INFO', 'WARNING', 'ERROR', 'SUCCESS');

-- CreateEnum
CREATE TYPE "DevTaskFileChangeType" AS ENUM ('CREATED', 'UPDATED', 'DELETED');

-- CreateEnum
CREATE TYPE "DevAIProviderType" AS ENUM ('CODEX', 'CLAUDE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "RemoteSessionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'REVOKED');

-- CreateEnum
CREATE TYPE "DevQueueStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "DevProject" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "repositoryUrl" TEXT,
    "localPath" TEXT,
    "defaultBranch" TEXT,
    "executionMode" "DevExecutionMode" NOT NULL DEFAULT 'LOCAL',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DevProject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevTask" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "DevTaskStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "DevTaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "branch" TEXT,
    "executionMode" "DevExecutionMode" NOT NULL DEFAULT 'LOCAL',
    "aiProvider" "DevAIProviderType",
    "prompt" TEXT,
    "resultSummary" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DevTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevTaskLog" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "level" "DevTaskLogLevel" NOT NULL DEFAULT 'INFO',
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DevTaskLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevTaskFile" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "changeType" "DevTaskFileChangeType" NOT NULL,
    "summary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DevTaskFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevAIProvider" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" "DevAIProviderType" NOT NULL,
    "label" TEXT NOT NULL,
    "apiKeyEncrypted" TEXT NOT NULL,
    "baseUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DevAIProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RemoteSession" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "status" "RemoteSessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "lastSeenAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RemoteSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevExecutionQueue" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "status" "DevQueueStatus" NOT NULL DEFAULT 'PENDING',
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DevExecutionQueue_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DevProject_tenantId_slug_key" ON "DevProject"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "DevProject_tenantId_isActive_idx" ON "DevProject"("tenantId", "isActive");

-- CreateIndex
CREATE INDEX "DevProject_createdByUserId_idx" ON "DevProject"("createdByUserId");

-- CreateIndex
CREATE INDEX "DevTask_tenantId_status_createdAt_idx" ON "DevTask"("tenantId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "DevTask_projectId_createdAt_idx" ON "DevTask"("projectId", "createdAt");

-- CreateIndex
CREATE INDEX "DevTask_createdByUserId_idx" ON "DevTask"("createdByUserId");

-- CreateIndex
CREATE INDEX "DevTaskLog_taskId_createdAt_idx" ON "DevTaskLog"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "DevTaskFile_taskId_createdAt_idx" ON "DevTaskFile"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "DevAIProvider_userId_isActive_idx" ON "DevAIProvider"("userId", "isActive");

-- CreateIndex
CREATE INDEX "DevAIProvider_userId_isDefault_idx" ON "DevAIProvider"("userId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "RemoteSession_tokenHash_key" ON "RemoteSession"("tokenHash");

-- CreateIndex
CREATE INDEX "RemoteSession_tenantId_status_expiresAt_idx" ON "RemoteSession"("tenantId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "RemoteSession_userId_status_idx" ON "RemoteSession"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "DevExecutionQueue_taskId_key" ON "DevExecutionQueue"("taskId");

-- CreateIndex
CREATE INDEX "DevExecutionQueue_status_createdAt_idx" ON "DevExecutionQueue"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "DevProject" ADD CONSTRAINT "DevProject_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevProject" ADD CONSTRAINT "DevProject_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevTask" ADD CONSTRAINT "DevTask_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevTask" ADD CONSTRAINT "DevTask_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "DevProject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevTask" ADD CONSTRAINT "DevTask_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevTaskLog" ADD CONSTRAINT "DevTaskLog_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "DevTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevTaskFile" ADD CONSTRAINT "DevTaskFile_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "DevTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevAIProvider" ADD CONSTRAINT "DevAIProvider_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemoteSession" ADD CONSTRAINT "RemoteSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemoteSession" ADD CONSTRAINT "RemoteSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevExecutionQueue" ADD CONSTRAINT "DevExecutionQueue_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "DevTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
