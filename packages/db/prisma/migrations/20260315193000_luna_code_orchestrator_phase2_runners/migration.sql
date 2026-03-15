-- CreateEnum
CREATE TYPE "DevRunnerMode" AS ENUM ('LOCAL', 'REMOTE', 'GITHUB');

-- CreateEnum
CREATE TYPE "DevRunnerStatus" AS ENUM ('ONLINE', 'OFFLINE', 'BUSY', 'DISABLED');

-- CreateEnum
CREATE TYPE "DevRunnerEventType" AS ENUM ('HEARTBEAT', 'TASK_CLAIMED', 'TASK_STARTED', 'TASK_PROGRESS', 'TASK_COMPLETED', 'TASK_FAILED', 'TASK_CANCELED');

-- CreateEnum
CREATE TYPE "DevExecutionRuntime" AS ENUM ('DRY_RUN', 'SHELL', 'CODEX_CLI');

-- AlterEnum
ALTER TYPE "DevQueueStatus" ADD VALUE IF NOT EXISTS 'CLAIMED';

-- AlterEnum
ALTER TYPE "DevQueueStatus" ADD VALUE IF NOT EXISTS 'CANCELED';

-- AlterTable
ALTER TABLE "DevExecutionQueue"
ADD COLUMN     "runnerId" TEXT,
ADD COLUMN     "runtime" "DevExecutionRuntime" NOT NULL DEFAULT 'DRY_RUN',
ADD COLUMN     "attemptCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastError" TEXT,
ADD COLUMN     "payloadJson" JSONB;

-- CreateTable
CREATE TABLE "DevRunner" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "mode" "DevRunnerMode" NOT NULL DEFAULT 'LOCAL',
    "status" "DevRunnerStatus" NOT NULL DEFAULT 'OFFLINE',
    "host" TEXT,
    "machineLabel" TEXT,
    "authTokenHash" TEXT NOT NULL,
    "lastHeartbeatAt" TIMESTAMP(3),
    "capabilitiesJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DevRunner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DevRunnerEvent" (
    "id" TEXT NOT NULL,
    "runnerId" TEXT NOT NULL,
    "taskId" TEXT,
    "type" "DevRunnerEventType" NOT NULL,
    "message" TEXT NOT NULL,
    "payloadJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DevRunnerEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DevRunner_tenantId_slug_key" ON "DevRunner"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "DevRunner_tenantId_status_idx" ON "DevRunner"("tenantId", "status");

-- CreateIndex
CREATE INDEX "DevRunner_createdByUserId_idx" ON "DevRunner"("createdByUserId");

-- CreateIndex
CREATE INDEX "DevRunnerEvent_runnerId_createdAt_idx" ON "DevRunnerEvent"("runnerId", "createdAt");

-- CreateIndex
CREATE INDEX "DevRunnerEvent_taskId_createdAt_idx" ON "DevRunnerEvent"("taskId", "createdAt");

-- CreateIndex
CREATE INDEX "DevExecutionQueue_runnerId_status_idx" ON "DevExecutionQueue"("runnerId", "status");

-- AddForeignKey
ALTER TABLE "DevExecutionQueue" ADD CONSTRAINT "DevExecutionQueue_runnerId_fkey" FOREIGN KEY ("runnerId") REFERENCES "DevRunner"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevRunner" ADD CONSTRAINT "DevRunner_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevRunner" ADD CONSTRAINT "DevRunner_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevRunnerEvent" ADD CONSTRAINT "DevRunnerEvent_runnerId_fkey" FOREIGN KEY ("runnerId") REFERENCES "DevRunner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DevRunnerEvent" ADD CONSTRAINT "DevRunnerEvent_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "DevTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;
