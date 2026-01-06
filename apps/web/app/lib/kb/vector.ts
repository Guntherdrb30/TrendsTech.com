import { Prisma, prisma } from '@trends172tech/db';
import { randomUUID } from 'crypto';
import { EMBEDDING_DIMENSION } from './config';

export type StoredChunk = {
  id: string;
  content: string;
  embedding: number[];
  tokenCount: number;
  metaJson?: Record<string, unknown> | null;
};

export function toVectorLiteral(values: number[]) {
  if (values.length !== EMBEDDING_DIMENSION) {
    throw new Error('Embedding dimension mismatch');
  }
  const safe = values.map((value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) {
      throw new Error('Invalid embedding value');
    }
    return num.toFixed(6);
  });
  return `[${safe.join(',')}]`;
}

export function buildChunkRecords(chunks: Omit<StoredChunk, 'id'>[]) {
  return chunks.map((chunk) => ({
    id: randomUUID(),
    ...chunk
  }));
}

export async function clearChunksForSource(sourceId: string) {
  await prisma.knowledgeChunk.deleteMany({
    where: { sourceId }
  });
}

export async function insertChunks(params: {
  tenantId: string;
  agentInstanceId: string;
  sourceId: string;
  chunks: StoredChunk[];
}) {
  if (params.chunks.length === 0) {
    return;
  }

  const rows = params.chunks.map((chunk) => {
    const vectorLiteral = toVectorLiteral(chunk.embedding);
    return Prisma.sql`(
      ${chunk.id},
      ${params.tenantId},
      ${params.agentInstanceId},
      ${params.sourceId},
      ${chunk.content},
      ${Prisma.raw(`'${vectorLiteral}'::vector`)},
      ${chunk.tokenCount},
      ${chunk.metaJson ? JSON.stringify(chunk.metaJson) : null}::jsonb,
      NOW()
    )`;
  });

  await prisma.$executeRaw`
    INSERT INTO "KnowledgeChunk" (
      "id",
      "tenantId",
      "agentInstanceId",
      "sourceId",
      "content",
      "embedding",
      "tokenCount",
      "metaJson",
      "createdAt"
    ) VALUES ${Prisma.join(rows)}
  `;
}
