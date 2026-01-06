import pdf from 'pdf-parse';
import { prisma } from '@trends172tech/db';
import { chunkText } from './chunker';
import { embedTexts } from './embeddings';
import { buildChunkRecords, clearChunksForSource, insertChunks } from './vector';
import { detectLanguage } from './language';
import { normalizeText } from './text';
import { savePdfFile } from './storage';
import type { KnowledgeLogger } from './logs';

export async function ingestPdf(params: {
  sourceId: string;
  tenantId: string;
  agentInstanceId: string;
  fileName: string;
  fileData: Uint8Array;
  title?: string | null;
  fileKey?: string | null;
  skipSave?: boolean;
  logger?: KnowledgeLogger;
}) {
  const resolvedTitle = params.title ?? params.fileName;
  await prisma.knowledgeSource.update({
    where: { id: params.sourceId },
    data: {
      title: resolvedTitle,
      status: 'PROCESSING'
    }
  });
  await params.logger?.({
    message: 'PDF processing started',
    progress: 5,
    status: 'PROCESSING',
    stage: 'start'
  });

  const parsed = await pdf(Buffer.from(params.fileData));
  const text = normalizeText(parsed.text ?? '');
  if (!text) {
    throw new Error('PDF has no extractable text');
  }
  await params.logger?.({
    message: 'PDF text extracted',
    progress: 30,
    stage: 'extract'
  });
  const language = detectLanguage(text);

  let fileKey: string | null | undefined = params.fileKey;
  if (!params.skipSave) {
    fileKey = await savePdfFile({
      tenantId: params.tenantId,
      agentInstanceId: params.agentInstanceId,
      sourceId: params.sourceId,
      filename: params.fileName,
      data: params.fileData
    });
  }

  const updateData: { rawText: string; status: 'PROCESSING'; fileKey?: string | null } = {
    rawText: text,
    status: 'PROCESSING'
  };
  if (fileKey !== undefined) {
    updateData.fileKey = fileKey;
  }
  await prisma.knowledgeSource.update({
    where: { id: params.sourceId },
    data: updateData
  });
  await params.logger?.({
    message: 'PDF normalized',
    progress: 45,
    stage: 'normalize'
  });

  await clearChunksForSource(params.sourceId);

  const chunks = chunkText(text, {
    source: 'PDF',
    title: resolvedTitle,
    section: 'Documento',
    language
  });
  if (chunks.length === 0) {
    throw new Error('No chunks created from PDF');
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
