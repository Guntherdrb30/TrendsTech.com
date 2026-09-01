import { NextResponse } from 'next/server';
import { prisma } from '@trends172tech/db';
import { completeControlAgentRunSchema } from '@/lib/control-center/contract-v1';
import { ControlClientAuthError, requireControlClient } from '@/lib/control-center/service-auth';

export async function POST(request: Request, { params }: { params: Promise<{ runId: string }> }) {
  try {
    const client = await requireControlClient(request, 'agent-runs:write');
    const parsed = completeControlAgentRunSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: 'Validation failed', issues: parsed.error.flatten() }, { status: 400 });
    const { runId } = await params;
    const result = await prisma.controlAgentRun.updateMany({
      where: { id: runId, implementationId: client.implementationId },
      data: { status: parsed.data.status, completedAt: parsed.data.completedAt, safeMetadataJson: { safeSummary: parsed.data.safeSummary, errorCode: parsed.data.errorCode } }
    });
    if (result.count === 0) return NextResponse.json({ error: 'Run not found' }, { status: 404 });
    return NextResponse.json({ runId, status: parsed.data.status });
  } catch (error) {
    if (error instanceof ControlClientAuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
