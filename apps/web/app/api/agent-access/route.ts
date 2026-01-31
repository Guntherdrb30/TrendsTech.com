import { NextResponse } from 'next/server';
import { prisma } from '@trends172tech/db';
import { AuthError, requireRole } from '@/lib/auth/guards';
import { requireTenantId } from '@/lib/tenant';
import { createAgentAccessSchema } from '@/lib/validators/agent-access';

function handleError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
}

export async function GET(request: Request) {
  try {
    const tenantId = await requireTenantId();
    const url = new URL(request.url);
    const agentId = url.searchParams.get('agentId');
    const accesses = await prisma.agentAccess.findMany({
      where: {
        tenantId,
        ...(agentId ? { agentId } : {})
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ data: accesses });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole('TENANT_OPERATOR');
    const tenantId = await requireTenantId();
    const body = await request.json();
    const parsed = createAgentAccessSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const agentInstance = await prisma.agentInstance.findFirst({
      where: { id: parsed.data.agentId, tenantId }
    });

    if (!agentInstance) {
      return NextResponse.json({ error: 'Agent instance not found' }, { status: 404 });
    }

    const access = await prisma.agentAccess.create({
      data: {
        tenantId,
        agentId: agentInstance.id,
        name: parsed.data.name,
        allowedDomains: parsed.data.allowedDomains ?? [],
        maxTokensPerMonth: parsed.data.maxTokensPerMonth ?? null,
        isActive: parsed.data.isActive ?? true
      }
    });

    return NextResponse.json({ data: access }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
