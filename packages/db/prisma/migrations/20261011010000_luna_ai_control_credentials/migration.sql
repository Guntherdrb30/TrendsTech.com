CREATE TABLE "AiControlCredential" (
  "id" TEXT NOT NULL,
  "installationId" TEXT NOT NULL,
  "keyPrefix" TEXT NOT NULL,
  "secretHash" TEXT NOT NULL,
  "createdByUserId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastUsedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "revokedByUserId" TEXT,
  CONSTRAINT "AiControlCredential_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "AiControlCredential_secretHash_key" ON "AiControlCredential"("secretHash");
CREATE INDEX "AiControlCredential_installationId_revokedAt_idx" ON "AiControlCredential"("installationId","revokedAt");
ALTER TABLE "AiControlCredential" ADD CONSTRAINT "AiControlCredential_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "AiControlInstallation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
