import { NextResponse } from 'next/server';
import { z } from 'zod';
import { type RegisteredAgentKey } from '@trends172tech/core';
import { AuthError, requireRole } from '@/lib/auth/guards';
import { requireTenantId } from '@/lib/tenant';
import { enforceRequestRateLimit } from '@/lib/security/rate-limit';
import { AgentPlatformSecurityError } from '@/lib/agent-platform/security';
import { decideToolApproval, executeApprovedTool, requestToolApproval } from '@/lib/agent-platform/approvals';

const channelSchema = z.enum(['web', 'chatgpt', 'whatsapp', 'voice', 'engineering_studio', 'partner_portal', 'api']);
const requestSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('request'),
    agentInstanceId: z.string().min(1),
    sessionId: z.string().min(1),
    agentKey: z.enum(['carpihogar-customer', 'arqui-ai']),
    channel: channelSchema.optional().default('api'),
    toolName: z.string().min(1),
    input: z.record(z.unknown()).default({}),
    endCustomerId: z.string().optional()
  }),
  z.object({
    action: z.enum(['approve', 'reject', 'execute']),
    approvalId: z.string().uuid()
  })
]);

function errorResponse(error: unknown) {
  if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
  if (error instanceof AgentPlatformSecurityError) return NextResponse.json({ error: error.message }, { status: error.status });
  return NextResponse.json({ error: error instanceof Error ? error.message : 'Unexpected error' }, { status: 500 });
}

function requestOrigin(request: Request) {
  return request.headers.get('origin') ?? request.headers.get('referer');
}

export async function POST(request: Request) {
  const limited = enforceRequestRateLimit(request, {
    namespace: 'agent-control-plane-approvals',
    limit: 20,
    windowMs: 60_000
  });
  if (limited) return limited;

  try {
    const body = requestSchema.safeParse(await request.json());
    if (!body.success) {
      return NextResponse.json({ error: 'Validation failed', details: body.error.flatten() }, { status: 400 });
    }
    const tenantId = await requireTenantId();

    if (body.data.action === 'request') {
      const actor = await requireRole('TENANT_OPERATOR');
      const data = await requestToolApproval({
        actorUserId: actor.id,
        tenantId,
        agentInstanceId: body.data.agentInstanceId,
        sessionId: body.data.sessionId,
        agentKey: body.data.agentKey as RegisteredAgentKey,
        channel: body.data.channel,
        toolName: body.data.toolName,
        input: body.data.input,
        endCustomerId: body.data.endCustomerId,
        requestOrigin: requestOrigin(request)
      });
      return NextResponse.json({ data }, { status: 202 });
    }

    const admin = await requireRole('TENANT_ADMIN');
    if (body.data.action === 'execute') {
      const data = await executeApprovedTool({
        approvalId: body.data.approvalId,
        tenantId,
        executorUserId: admin.id
      });
      return NextResponse.json({ data });
    }

    const data = await decideToolApproval({
      approvalId: body.data.approvalId,
      tenantId,
      approverUserId: admin.id,
      decision: body.data.action
    });
    return NextResponse.json({ data });
  } catch (error) {
    return errorResponse(error);
  }
}
