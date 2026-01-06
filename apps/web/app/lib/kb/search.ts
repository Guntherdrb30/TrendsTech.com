import { prisma, Prisma } from '@trends172tech/db';
import { CONTEXT_MAX_TOKENS } from './config';
import { embedTexts } from './embeddings';
import { toVectorLiteral } from './vector';

export type KnowledgeSearchResult = {
  content: string;
  tokenCount: number;
  sourceId: string;
  score: number;
  metaJson: Record<string, unknown> | null;
};

export async function searchKnowledge(params: {
  tenantId: string;
  agentInstanceId: string;
  query: string;
  topK?: number;
  maxTokens?: number;
}) {
  if (!process.env.OPENAI_API_KEY) {
    return [];
  }
  const topK = params.topK ?? 4;
  const maxTokens = params.maxTokens ?? CONTEXT_MAX_TOKENS;

  if (!params.query.trim()) {
    return [];
  }

  const hasChunks = await prisma.knowledgeChunk.findFirst({
    where: { tenantId: params.tenantId, agentInstanceId: params.agentInstanceId },
    select: { id: true }
  });
  if (!hasChunks) {
    return [];
  }

  const [queryEmbedding] = await embedTexts([params.query]);
  const vectorLiteral = toVectorLiteral(queryEmbedding);

  const rows = await prisma.$queryRaw<KnowledgeSearchResult[]>`
    SELECT
      "content",
      "tokenCount",
      "sourceId",
      "metaJson",
      1 - ("embedding" <=> ${Prisma.raw(`'${vectorLiteral}'::vector`)}) AS score
    FROM "KnowledgeChunk"
    WHERE "tenantId" = ${params.tenantId}
      AND "agentInstanceId" = ${params.agentInstanceId}
    ORDER BY "embedding" <=> ${Prisma.raw(`'${vectorLiteral}'::vector`)}
    LIMIT ${topK * 3}
  `;

  const trimmed: KnowledgeSearchResult[] = [];
  let tokens = 0;
  for (const row of rows) {
    if (trimmed.length >= topK) {
      break;
    }
    if (tokens + row.tokenCount > maxTokens) {
      continue;
    }
    trimmed.push(row);
    tokens += row.tokenCount;
  }

  return trimmed;
}
