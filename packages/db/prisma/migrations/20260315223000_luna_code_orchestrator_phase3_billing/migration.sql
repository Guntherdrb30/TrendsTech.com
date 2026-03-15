CREATE TYPE "DevUsageMetricType" AS ENUM (
  'TASKS_CREATED',
  'TASKS_EXECUTED',
  'TASKS_FAILED',
  'REMOTE_SESSIONS',
  'RUNNERS_REGISTERED',
  'AI_PROVIDERS_SAVED'
);

CREATE TABLE "DevUsageMetric" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "metricType" "DevUsageMetricType" NOT NULL,
  "periodMonth" INTEGER NOT NULL,
  "periodYear" INTEGER NOT NULL,
  "value" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "DevUsageMetric_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "DevUsageMetric_tenantId_metricType_periodMonth_periodYear_key"
  ON "DevUsageMetric"("tenantId", "metricType", "periodMonth", "periodYear");

CREATE INDEX "DevUsageMetric_tenantId_periodYear_periodMonth_idx"
  ON "DevUsageMetric"("tenantId", "periodYear", "periodMonth");

CREATE INDEX "DevUsageMetric_metricType_periodYear_periodMonth_idx"
  ON "DevUsageMetric"("metricType", "periodYear", "periodMonth");

ALTER TABLE "DevUsageMetric"
  ADD CONSTRAINT "DevUsageMetric_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
