-- Standalone, reversible CRM project-discovery table. Do not apply to production before review.
CREATE TABLE "AdminProjectIntake" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "reference" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "category" TEXT NOT NULL,
    "locale" TEXT NOT NULL DEFAULT 'es',
    "projectTitle" TEXT,
    "details" JSONB,
    "transcript" JSONB,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "company" TEXT,
    "country" TEXT,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "leadId" TEXT,
    "clientEmailStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "internalEmailStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AdminProjectIntake_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AdminProjectIntake_sessionId_key" ON "AdminProjectIntake"("sessionId");
CREATE UNIQUE INDEX "AdminProjectIntake_reference_key" ON "AdminProjectIntake"("reference");
CREATE UNIQUE INDEX "AdminProjectIntake_leadId_key" ON "AdminProjectIntake"("leadId");
CREATE INDEX "AdminProjectIntake_status_createdAt_idx" ON "AdminProjectIntake"("status", "createdAt");
CREATE INDEX "AdminProjectIntake_contactEmail_idx" ON "AdminProjectIntake"("contactEmail");
ALTER TABLE "AdminProjectIntake" ADD CONSTRAINT "AdminProjectIntake_leadId_fkey"
    FOREIGN KEY ("leadId") REFERENCES "AdminLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;
