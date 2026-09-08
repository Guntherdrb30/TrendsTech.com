-- Partner Portal P0
-- Adds the dedicated PARTNER role and a first-class partner profile table.

ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'PARTNER';

CREATE TABLE IF NOT EXISTS "Partner" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "companyName" TEXT NOT NULL,
  "legalName" TEXT,
  "country" TEXT,
  "website" TEXT,
  "description" TEXT,
  "status" TEXT NOT NULL DEFAULT 'INVITED',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Partner_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Partner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Partner_userId_key" ON "Partner"("userId");
CREATE INDEX IF NOT EXISTS "Partner_status_idx" ON "Partner"("status");
CREATE INDEX IF NOT EXISTS "Partner_companyName_idx" ON "Partner"("companyName");
