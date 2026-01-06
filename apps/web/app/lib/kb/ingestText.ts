import { prisma } from '@trends172tech/db';
import { chunkText } from './chunker';
import { embedTexts } from './embeddings';
import { buildChunkRecords, clearChunksForSource, insertChunks } from './vector';
import { detectLanguage } from './language';
import { normalizeText } from './text';
import type { KnowledgeLogger } from './logs';

export async function ingestText(params: {
  sourceId: string;
  tenantId: string;
  agentInstanceId: string;
  text: string;
  title?: string | null;
  sourceType?: 'TEXT' | 'PDF' | 'URL';
  section?: string;
  logger?: KnowledgeLogger;
}) {
  const normalized = normalizeText(params.text);
  if (!normalized) {
    throw new Error('Text input is empty');
  }
  const language = detectLanguage(normalized);
  const sourceType = params.sourceType ?? 'TEXT';
  const section = params.section ?? 'General';

  await prisma.knowledgeSource.update({
    where: { id: params.sourceId },
    data: {
      title: params.title ?? 'Texto libre',
      rawText: normalized,
      status: 'PROCESSING'
    }
  });
  await params.logger?.({
    message: 'Text processing started',
    progress: 10,
    status: 'PROCESSING',
    stage: 'start'
  });

  await clearChunksForSource(params.sourceId);

  const chunks = chunkText(normalized, {
    source: sourceType,
    title: params.title ?? 'Texto libre',
    section,
    language
  });
  if (chunks.length === 0) {
    throw new Error('No chunks created from text');
  }
  await params.logger?.({
    message: `Created ${chunks.length} chunks`,
    progress: 60,
    stage: 'chunk'
  });

  const embeddings = await embedTexts(chunks.map((chunk) => chunk.content));
  if (embeddings.length !== chunks.length) {
    throw new Error('Embedding count mismatch');
  }
  await params.logger?.({
    message: 'Embeddings generated',
    progress: 80,
    stage: 'embed'
  });
  const records = buildChunkRecords(
    chunks.map((chunk, index) => ({
      content: chunk.content,
      embedding: embeddings[index] ?? [],
      tokenCount: chunk.tokenCount,
      metaJson: chunk.meta
    }))
  );

  await insertChunks({
    tenantId: params.tenantId,
    agentInstanceId: params.agentInstanceId,
    sourceId: params.sourceId,
    chunks: records
  });
  await params.logger?.({
    message: 'Indexed chunks',
    progress: 95,
    stage: 'index'
  });

  await prisma.knowledgeSource.update({
    where: { id: params.sourceId },
    data: { status: 'READY' }
  });
  await params.logger?.({
    message: 'Ingest completed',
    progress: 100,
    status: 'READY',
    stage: 'done'
  });
}
