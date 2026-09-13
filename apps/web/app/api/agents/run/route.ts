import { NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthError, requireRole } from '@/lib/auth/guards';
import { requireTenantId } from '@/lib/tenant';
import { enforceRequestRateLimit } from '@/lib/security/rate-limit';
import { inspectCarpiHogarPilot, runCarpiHogarPilotTool } from '@/lib/agent-platform/runtime';

const requestSchema = z.object({
  agentInstanceId: z.string().min(1),
  sessionId: z.string().min(1),
  message: z.string().min(1).max(4000),
  channel: z.enum(['web', 'chatgpt', 'whatsapp', 'voice', 'engineering_studio', 'partner_portal', 'api']).optional(),
  userId: z.string().optional(),
  projectId: z.string().optional(),
  endCustomerId: z.string().optional(),
  tool: z.object({
    name: z.string().min(1),
    input: z.record(z.unknown()).default({})
  }).optional(),
  inspect: z.boolean().optional().default(false)
});

function errorResponse(error: unknown) {
  if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
  const message = error instanceof Error ? error.message : 'Unexpected error';
  return NextResponse.json({ error: message }, { status: 500 });
}

export async function POST(request: Request) {
  const limited = enforceRequestRateLimit(request, {
    namespace: 'agent-control-plane-run',
    limit: 30,
    windowMs: 60_000
  });
  if (limited) return limited;

  try {
    await requireRole('TENANT_OPERATOR');
    const tenantId = await requireTenantId();
    const body = requestSchema.safeParse(await request.json());
    if (!body.success) {
      return NextResponse.json({ error: 'Validation failed', details: body.error.flatten() }, { status: 400 });
    }

    if (body.data.inspect) {
      const inspection = await inspectCarpiHogarPilot();
      return NextResponse.json({ data: inspection });
    }

    if (!body.data.tool) {
      return NextResponse.json({
        error: 'Pilot runtime currently requires an explicit tool. Model orchestration is the next stage.'
      }, { status: 400 });
    }

    const data = await runCarpiHogarPilotTool({
      request: {
        tenantId,
        agentInstanceId: body.data.agentInstanceId,
        sessionId: body.data.sessionId,
        message: body.data.message,
        channel: body.data.channel,
        userId: body.data.userId,
        projectId: body.data.projectId,
        endCustomerId: body.data.endCustomerId
      },
      toolName: body.data.tool.name,
      input: body.data.tool.input
    });

    return NextResponse.json({ data });
  } catch (error) {
    return errorResponse(error);
  }
}
