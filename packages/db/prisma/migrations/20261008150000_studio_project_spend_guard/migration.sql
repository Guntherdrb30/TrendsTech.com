-- Atomic, project-scoped USD-cent budget ledger. Migration is additive.
CREATE TABLE "StudioProjectSpendBudget" (
 "projectId" TEXT PRIMARY KEY REFERENCES "StudioProject"("id") ON DELETE CASCADE,
 "activeLimitCents" BIGINT NOT NULL DEFAULT 0,
 "globalCeilingCents" BIGINT NOT NULL DEFAULT 0,
 "confirmedCents" BIGINT NOT NULL DEFAULT 0,
 "reservedCents" BIGINT NOT NULL DEFAULT 0,
 "paused" BOOLEAN NOT NULL DEFAULT true,
 "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "StudioSpendBudget_nonnegative" CHECK ("activeLimitCents" >= 0 AND "globalCeilingCents" >= 0 AND "confirmedCents" >= 0 AND "reservedCents" >= 0),
 CONSTRAINT "StudioSpendBudget_limits" CHECK ("activeLimitCents" <= "globalCeilingCents" AND "confirmedCents" + "reservedCents" <= "activeLimitCents")
);
CREATE TABLE "StudioSpendReservation" (
 "id" TEXT PRIMARY KEY,
 "projectId" TEXT NOT NULL REFERENCES "StudioProject"("id") ON DELETE CASCADE,
 "idempotencyKey" TEXT NOT NULL,
 "estimatedCents" BIGINT NOT NULL CHECK ("estimatedCents" > 0),
 "confirmedCents" BIGINT NOT NULL DEFAULT 0 CHECK ("confirmedCents" >= 0),
 "status" TEXT NOT NULL DEFAULT 'RESERVED' CHECK ("status" IN ('RESERVED','SETTLED','RELEASED')),
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 UNIQUE ("projectId", "idempotencyKey")
);
CREATE INDEX "StudioSpendReservation_project_status" ON "StudioSpendReservation"("projectId", "status");
