import { NextResponse } from 'next/server';
import { Prisma, prisma } from '@trends172tech/db';
import { createControlAgentUsageSchema } from '@/lib/control-center/contract-v1';
import { ControlClientAuthError, requireControlClient } from '@/lib/control-center/service-auth';

export async function POST(request: Request, { params }: { params: Promise<{ runId: string }> }) {
  try {
    const client = await requireControlClient(request, 'usage:write');
    const parsed = createControlAgentUsageSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 });
    const { runId } = await params;
    const run = await prisma.controlAgentRun.findFirst({ where: { id: runId, implementationId: client.implementationId }, select: { id: true } });
    if (!run) return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    const usage = await prisma.controlAgentUsageRecord.create({
      data: {
        agentRunId: run.id,
        provider: parsed.data.provider,
        model: parsed.data.model,
        inputTokens: parsed.data.inputTokens,
        outputTokens: parsed.data.outputTokens,
        cachedTokens: parsed.data.cachedTokens,
        latencyMs: parsed.data.latencyMs,
        costUsdMicros: parsed.data.costUsdMicros,
        gpuMillis: parsed.data.gpuMillis,
        metadataJson: parsed.data.metadata as Prisma.InputJsonValue | undefined
      }
    });
    return NextResponse.json({ usageId: usage.id }, { status: 202 });
  } catch (error) {
    if (error instanceof ControlClientAuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
