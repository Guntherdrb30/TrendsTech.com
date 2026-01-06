import { NextResponse } from 'next/server';
import { prisma } from '@trends172tech/db';
import { AuthError, requireAuth } from '@/lib/auth/guards';
import { resolveTenantFromUser } from '@/lib/tenant';
import { enqueueKnowledgeJob } from '@/lib/kb/queue';
import { createKnowledgeLogger } from '@/lib/kb/logs';

type RouteParams = {
  sourceId: string;
};

function handleError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
}

export async function POST(_: Request, { params }: { params: Promise<RouteParams> }) {
  try {
    const user = await requireAuth();
    const tenant = await resolveTenantFromUser(user);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant required' }, { status: 403 });
    }

    const { sourceId } = await params;
    const source = await prisma.knowledgeSource.findFirst({
      where: { id: sourceId, tenantId: tenant.id }
    });

    if (!source) {
      return NextResponse.json({ error: 'Knowledge source not found' }, { status: 404 });
    }

    const updatedSource = await prisma.knowledgeSource.update({
      where: { id: source.id },
      data: { status: 'PENDING' }
    });

    const logger = createKnowledgeLogger({
      tenantId: tenant.id,
      actorUserId: user.id,
      sourceId: source.id,
      agentInstanceId: source.agentInstanceId,
      sourceType: source.type
    });
    try {
      await logger({
        message: 'Reindex queued',
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
      const message = error instanceof Error ? error.message : 'Failed to queue reindex';
      await logger({
        message,
        progress: 100,
        status: 'FAILED',
        stage: 'error',
        error: message
      });
      return NextResponse.json({ error: message }, { status: 400 });
    }

    return NextResponse.json({ data: updatedSource });
  } catch (error) {
    return handleError(error);
  }
}
