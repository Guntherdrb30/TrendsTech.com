import { prisma } from '@trends172tech/db';
import { ingestUrl } from './ingestUrl';
import { ingestText } from './ingestText';
import { ingestPdf } from './ingestPdf';
import { createKnowledgeLogger } from './logs';
import { readStoredFile } from './storage';

export type KnowledgeJobPayload = {
  sourceId: string;
  tenantId: string;
  actorUserId: string;
};

export async function processKnowledgeJob(payload: KnowledgeJobPayload) {
  const source = await prisma.knowledgeSource.findFirst({
    where: { id: payload.sourceId, tenantId: payload.tenantId }
  });

  if (!source) {
    return;
  }

  const logger = createKnowledgeLogger({
    tenantId: payload.tenantId,
    actorUserId: payload.actorUserId,
    sourceId: source.id,
    agentInstanceId: source.agentInstanceId,
    sourceType: source.type
  });

  if (source.type === 'URL' && source.url) {
    await ingestUrl({
      sourceId: source.id,
      tenantId: payload.tenantId,
      agentInstanceId: source.agentInstanceId,
      url: source.url,
      title: source.title,
      logger
    });
    return;
  }

  if (source.type === 'TEXT' && source.rawText) {
    await ingestText({
      sourceId: source.id,
      tenantId: payload.tenantId,
      agentInstanceId: source.agentInstanceId,
      text: source.rawText,
      title: source.title,
      logger
    });
    return;
  }

  if (source.type === 'PDF') {
    if (source.fileKey) {
      const buffer = await readStoredFile(source.fileKey);
      await ingestPdf({
        sourceId: source.id,
        tenantId: payload.tenantId,
        agentInstanceId: source.agentInstanceId,
        fileName: source.title ?? 'document.pdf',
        fileData: new Uint8Array(buffer),
        title: source.title,
        skipSave: true,
        fileKey: source.fileKey,
        logger
      });
      return;
    }

    if (source.rawText) {
      await ingestText({
        sourceId: source.id,
        tenantId: payload.tenantId,
        agentInstanceId: source.agentInstanceId,
        text: source.rawText,
        title: source.title,
        sourceType: 'PDF',
        section: 'Documento',
        logger
      });
      return;
    }
  }

  throw new Error('Source is missing required data');
}
