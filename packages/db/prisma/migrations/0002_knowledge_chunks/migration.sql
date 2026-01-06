-- Enable pgvector for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Alter GlobalSettings for KB URL page limit
ALTER TABLE "GlobalSettings"
ADD COLUMN IF NOT EXISTS "kbUrlPageLimit" INTEGER NOT NULL DEFAULT 5;

-- Create KnowledgeChunk table
CREATE TABLE "KnowledgeChunk" (
  "id" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "agentInstanceId" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "embedding" vector(1536) NOT NULL,
  "tokenCount" INTEGER NOT NULL,
  "metaJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "KnowledgeChunk_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "KnowledgeChunk_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "KnowledgeChunk_agentInstanceId_fkey" FOREIGN KEY ("agentInstanceId") REFERENCES "AgentInstance"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "KnowledgeChunk_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "KnowledgeSource"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX "KnowledgeChunk_tenantId_idx" ON "KnowledgeChunk"("tenantId");
CREATE INDEX "KnowledgeChunk_agentInstanceId_idx" ON "KnowledgeChunk"("agentInstanceId");
CREATE INDEX "KnowledgeChunk_sourceId_idx" ON "KnowledgeChunk"("sourceId");
CREATE INDEX "KnowledgeChunk_embedding_idx" ON "KnowledgeChunk" USING ivfflat ("embedding" vector_cosine_ops);
