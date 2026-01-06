import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@trends172tech/db';
import { z } from 'zod';
import { AuthError, requireAuth } from '@/lib/auth/guards';
import { resolveTenantFromUser } from '@/lib/tenant';
import { enqueueKnowledgeJob } from '@/lib/kb/queue';
import { createKnowledgeLogger } from '@/lib/kb/logs';
import { savePdfFile } from '@/lib/kb/storage';

const createJsonSchema = z.object({
  agentInstanceId: z.string().min(1),
  type: z.enum(['URL', 'TEXT']),
  title: z.string().optional(),
  url: z.string().url().optional(),
  rawText: z.string().min(1).optional()
});

function buildLogSummary(log: { metaJson: unknown; createdAt: Date }) {
  if (!log.metaJson || typeof log.metaJson !== 'object') {
    return { message: null, progress: null, status: null, stage: null, createdAt: log.createdAt };
  }
  const meta = log.metaJson as Record<string, unknown>;
  return {
    message: typeof meta.message === 'string' ? meta.message : null,
    progress: typeof meta.progress === 'number' ? meta.progress : null,
    status: typeof meta.status === 'string' ? meta.status : null,
    stage: typeof meta.stage === 'string' ? meta.stage : null,
    createdAt: log.createdAt
  };
}

function handleError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const tenant = await resolveTenantFromUser(user);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant required' }, { status: 403 });
    }

    const agentInstanceId = request.nextUrl.searchParams.get('agentInstanceId');
    if (!agentInstanceId) {
      return NextResponse.json({ error: 'agentInstanceId is required' }, { status: 400 });
    }

    const sources = await prisma.knowledgeSource.findMany({
      where: { tenantId: tenant.id, agentInstanceId },
      orderBy: { updatedAt: 'desc' }
    });

    const sourceIds = sources.map((source) => source.id);
    const logsBySource = new Map<string, ReturnType<typeof buildLogSummary>[]>();

    if (sourceIds.length > 0) {
      const maxLogsPerSource = 3;
      const logs = await prisma.auditLog.findMany({
        where: {
          tenantId: tenant.id,
          action: 'knowledge_ingest',
          entity: 'knowledge_source',
          entityId: { in: sourceIds }
        },
        orderBy: { createdAt: 'desc' },
        take: Math.min(sourceIds.length * maxLogsPerSource, 200)
      });

      for (const log of logs) {
        const existing = logsBySource.get(log.entityId) ?? [];
        if (existing.length >= maxLogsPerSource) {
          continue;
        }
        existing.push(buildLogSummary(log));
        logsBySource.set(log.entityId, existing);
      }
    }

    const enriched = sources.map((source) => ({
      ...source,
      logs: logsBySource.get(source.id) ?? []
    }));

    return NextResponse.json({ data: enriched });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const tenant = await resolveTenantFromUser(user);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant required' }, { status: 403 });
    }

    const contentType = request.headers.get('content-type') ?? '';
    if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      const agentInstanceId = form.get('agentInstanceId');
      const file = form.get('file');
      const title = form.get('title');

      if (typeof agentInstanceId !== 'string' || !agentInstanceId) {
        return NextResponse.json({ error: 'agentInstanceId is required' }, { status: 400 });
      }
      if (!(file instanceof File)) {
        return NextResponse.json({ error: 'PDF file is required' }, { status: 400 });
      }

      const agentInstance = await prisma.agentInstance.findFirst({
        where: { id: agentInstanceId, tenantId: tenant.id }
      });
      if (!agentInstance) {
        return NextResponse.json({ error: 'Agent instance not found' }, { status: 404 });
      }

      const source = await prisma.knowledgeSource.create({
        data: {
          tenantId: tenant.id,
          agentInstanceId: agentInstance.id,
          type: 'PDF',
          title: typeof title === 'string' && title ? title : file.name,
          status: 'PENDING'
        }
      });

      try {
        const buffer = new Uint8Array(await file.arrayBuffer());
        const fileKey = await savePdfFile({
          tenantId: tenant.id,
          agentInstanceId: agentInstance.id,
          sourceId: source.id,
          filename: file.name,
          data: buffer
        });
        if (!fileKey) {
          throw new Error('KB storage is not configured for PDF ingestion');
        }

        const updatedSource = await prisma.knowledgeSource.update({
          where: { id: source.id },
          data: { fileKey, status: 'PENDING' }
        });
        const logger = createKnowledgeLogger({
          tenantId: tenant.id,
          actorUserId: user.id,
          sourceId: source.id,
          agentInstanceId: agentInstance.id,
          sourceType: 'PDF'
        });
        await logger({
          message: 'PDF queued for ingestion',
          progress: 0,
          status: 'PENDING',
          stage: 'queued'
        });
        await enqueueKnowledgeJob({ sourceId: source.id, tenantId: tenant.id, actorUserId: user.id });

        return NextResponse.json({ data: updatedSource });
      } catch (error) {
        await prisma.knowledgeSource.update({
          where: { id: source.id },
          data: { status: 'FAILED' }
        });
        const logger = createKnowledgeLogger({
          tenantId: tenant.id,
          actorUserId: user.id,
          sourceId: source.id,
          agentInstanceId: agentInstance.id,
          sourceType: 'PDF'
        });
        const message = error instanceof Error ? error.message : 'Failed to queue PDF';
        await logger({
          message,
          progress: 100,
          status: 'FAILED',
          stage: 'error',
          error: message
        });
        return NextResponse.json({ error: message }, { status: 400 });
      }
    }

    const body = await request.json();
    const parsed = createJsonSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    if (parsed.data.type === 'URL' && !parsed.data.url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }
    if (parsed.data.type === 'TEXT' && !parsed.data.rawText) {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    const agentInstance = await prisma.agentInstance.findFirst({
      where: { id: parsed.data.agentInstanceId, tenantId: tenant.id }
    });
    if (!agentInstance) {
      return NextResponse.json({ error: 'Agent instance not found' }, { status: 404 });
    }

    const source = await prisma.knowledgeSource.create({
      data: {
        tenantId: tenant.id,
        agentInstanceId: agentInstance.id,
        type: parsed.data.type,
        title: parsed.data.title ?? null,
        url: parsed.data.url ?? null,
        rawText: parsed.data.type === 'TEXT' ? parsed.data.rawText ?? null : null,
        status: 'PENDING'
      }
    });

    const logger = createKnowledgeLogger({
      tenantId: tenant.id,
      actorUserId: user.id,
      sourceId: source.id,
      agentInstanceId: agentInstance.id,
      sourceType: source.type
    });
    try {
      await logger({
        message: 'Source queued for ingestion',
        progress: 0,
        status: 'PENDING',
        stage: 'queued'
      });
      await enqueueKnowledgeJob({ sourceId: source.id, tenantId: tenant.id, actorUserId: user.id });
    } catch (error) {
      await prisma.knowledgeSource.update({
        where: { id: source.id },
        data: { status: 'FAILED' }
      });
      const message = error instanceof Error ? error.message : 'Failed to queue source';
      await logger({
        message,
        progress: 100,
        status: 'FAILED',
        stage: 'error',
        error: message
      });
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ data: source });
  } catch (error) {
    return handleError(error);
  }
}
