import { NextResponse } from 'next/server';
import { Prisma, prisma } from '@trends172tech/db';
import { createControlAgentRunEventSchema } from '@/lib/control-center/contract-v1';
import { ControlClientAuthError, requireControlClient } from '@/lib/control-center/service-auth';

export async function POST(request: Request, { params }: { params: Promise<{ runId: string }> }) {
  try {
    const client = await requireControlClient(request, 'agent-runs:write');
    const parsed = createControlAgentRunEventSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 });
    const { runId } = await params;
    const run = await prisma.controlAgentRun.findFirst({ where: { id: runId, implementationId: client.implementationId }, select: { id: true } });
    if (!run) return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    const event = await prisma.controlAgentRunEvent.upsert({
      where: { agentRunId_sequence: { agentRunId: run.id, sequence: parsed.data.sequence } },
      update: {},
      create: { agentRunId: run.id, sequence: parsed.data.sequence, eventType: parsed.data.eventType, occurredAt: parsed.data.occurredAt, skillKey: parsed.data.skillKey, safeMetadataJson: parsed.data.safeMetadata as Prisma.InputJsonValue | undefined }
    });
    return NextResponse.json({ eventId: event.id }, { status: 202 });
  } catch (error) {
    if (error instanceof ControlClientAuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
