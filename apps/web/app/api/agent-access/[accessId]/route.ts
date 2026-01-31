import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@trends172tech/db';
import { AuthError, requireRole } from '@/lib/auth/guards';
import { requireTenantId } from '@/lib/tenant';
import { updateAgentAccessSchema } from '@/lib/validators/agent-access';

type RouteParams = {
  accessId: string;
};

function handleError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
}

export async function PATCH(request: Request, { params }: { params: Promise<RouteParams> }) {
  try {
    await requireRole('TENANT_OPERATOR');
    const tenantId = await requireTenantId();
    const { accessId } = await params;
    const body = await request.json();
    const parsed = updateAgentAccessSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const access = await prisma.agentAccess.findFirst({
      where: { id: accessId, tenantId }
    });

    if (!access) {
      return NextResponse.json({ error: 'AgentAccess not found' }, { status: 404 });
    }

    const updates: Prisma.AgentAccessUpdateInput = {};

    if (parsed.data.name) {
      updates.name = parsed.data.name;
    }

    if (parsed.data.allowedDomains) {
      updates.allowedDomains = parsed.data.allowedDomains;
    }

    if (Object.prototype.hasOwnProperty.call(parsed.data, 'maxTokensPerMonth')) {
      updates.maxTokensPerMonth = parsed.data.maxTokensPerMonth ?? null;
    }

    if (Object.prototype.hasOwnProperty.call(parsed.data, 'isActive')) {
      updates.isActive = parsed.data.isActive;
    }

    const updated = await prisma.agentAccess.update({
      where: { id: access.id },
      data: updates
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return handleError(error);
  }
}
