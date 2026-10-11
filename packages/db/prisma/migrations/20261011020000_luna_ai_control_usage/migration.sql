CREATE TABLE "AiControlUsageEvent" (
  "id" TEXT NOT NULL,
  "installationId" TEXT NOT NULL,
  "operationId" TEXT NOT NULL,
  "platform" TEXT NOT NULL,
  "module" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "model" TEXT,
  "environment" TEXT NOT NULL,
  "startedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3) NOT NULL,
  "durationMs" INTEGER NOT NULL,
  "status" TEXT NOT NULL,
  "inputTokens" INTEGER,
  "outputTokens" INTEGER,
  "imageCount" INTEGER,
  "videoCount" INTEGER,
  "documentCount" INTEGER,
  "audioSeconds" DOUBLE PRECISION,
  "errorCode" TEXT,
  "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AiControlUsageEvent_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AiControlUsageEvent_installationId_operationId_key" ON "AiControlUsageEvent"("installationId","operationId");
CREATE INDEX "AiControlUsageEvent_installationId_receivedAt_idx" ON "AiControlUsageEvent"("installationId","receivedAt");
ALTER TABLE "AiControlUsageEvent" ADD CONSTRAINT "AiControlUsageEvent_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "AiControlInstallation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
