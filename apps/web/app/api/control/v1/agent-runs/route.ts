import { NextResponse } from 'next/server';
import { Prisma, prisma } from '@trends172tech/db';
import { createControlAgentRunSchema } from '@/lib/control-center/contract-v1';
import { ControlClientAuthError, requireControlClient } from '@/lib/control-center/service-auth';

export async function POST(request: Request) {
  try {
    const client = await requireControlClient(request, 'agent-runs:write');
    const parsed = createControlAgentRunSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 });
    }
    if (parsed.data.implementationKey !== client.implementation.key) {
      return NextResponse.json({ error: 'Implementation mismatch' }, { status: 403 });
    }

    const templateVersion = await prisma.controlAgentTemplateVersion.findFirst({
      where: {
        version: parsed.data.agentVersion,
        isApproved: true,
        agentTemplate: {
          key: parsed.data.agentTemplateKey,
          productId: client.implementation.productId
        }
      },
      select: { id: true }
    });
    if (!templateVersion) return NextResponse.json({ error: 'Approved agent version not found' }, { status: 404 });

    if (parsed.data.agentInstanceId) {
      const instance = await prisma.agentInstance.findFirst({
        where: {
          id: parsed.data.agentInstanceId,
          controlImplementationId: client.implementationId,
          controlTemplateVersionId: templateVersion.id
        },
        select: { id: true }
      });
      if (!instance) return NextResponse.json({ error: 'Agent deployment mismatch' }, { status: 403 });
    }

    const run = await prisma.controlAgentRun.upsert({
      where: {
        implementationId_idempotencyKey: {
          implementationId: client.implementationId,
          idempotencyKey: parsed.data.idempotencyKey
        }
      },
      update: {},
      create: {
        implementationId: client.implementationId,
        agentInstanceId: parsed.data.agentInstanceId,
        agentTemplateVersionId: templateVersion.id,
        idempotencyKey: parsed.data.idempotencyKey,
        traceId: parsed.data.traceId,
        externalRunId: parsed.data.externalRunId,
        channel: parsed.data.channel,
        inputClass: parsed.data.inputClass,
        actorJson: parsed.data.actor as Prisma.InputJsonValue | undefined,
        safeMetadataJson: parsed.data.safeMetadata as Prisma.InputJsonValue | undefined,
        status: 'ACCEPTED'
      }
    });
    return NextResponse.json({ runId: run.id, status: run.status, shadowMode: client.implementation.shadowMode }, { status: 202 });
  } catch (error) {
    if (error instanceof ControlClientAuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
