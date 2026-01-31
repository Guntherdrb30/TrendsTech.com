-- DropIndex
DROP INDEX "KnowledgeChunk_embedding_idx";

-- AlterTable
ALTER TABLE "AgentSession" ALTER COLUMN "lastSeenAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "GlobalSettings" ALTER COLUMN "tokenInputUsdPer1M" DROP DEFAULT,
ALTER COLUMN "tokenOutputUsdPer1M" DROP DEFAULT,
ALTER COLUMN "tokenCachedInputUsdPer1M" DROP DEFAULT,
ALTER COLUMN "tokenMarkupPercent" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TokenWallet" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarUrl" TEXT,
ADD COLUMN     "phone" TEXT;

-- AlterTable
ALTER TABLE "WhatsAppChannel" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "AgentInstance_tenantId_baseAgentKey_idx" ON "AgentInstance"("tenantId", "baseAgentKey");
