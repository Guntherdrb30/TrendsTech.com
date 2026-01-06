import { prisma } from '@trends172tech/db';

export type KnowledgeLogEvent = {
  message: string;
  progress?: number;
  stage?: string;
  status?: string;
  error?: string;
  sourceType?: string;
};

export type KnowledgeLogger = (event: KnowledgeLogEvent) => Promise<void>;

function clampProgress(value: number) {
  if (!Number.isFinite(value)) {
    return undefined;
  }
  return Math.min(100, Math.max(0, Math.round(value)));
}

export function createKnowledgeLogger(params: {
  tenantId: string;
  actorUserId: string;
  sourceId: string;
  agentInstanceId: string;
  sourceType?: string | null;
}): KnowledgeLogger {
  return async (event) => {
    const progress =
      typeof event.progress === 'number' ? clampProgress(event.progress) : undefined;

    try {
      await prisma.auditLog.create({
        data: {
          actorUserId: params.actorUserId,
          tenantId: params.tenantId,
          action: 'knowledge_ingest',
          entity: 'knowledge_source',
          entityId: params.sourceId,
          metaJson: {
            sourceId: params.sourceId,
            agentInstanceId: params.agentInstanceId,
            sourceType: params.sourceType ?? undefined,
            message: event.message,
            progress,
            stage: event.stage,
            status: event.status,
            error: event.error
          }
        }
      });
    } catch (error) {
      console.error('Knowledge ingest log failed', error);
    }
  };
}
