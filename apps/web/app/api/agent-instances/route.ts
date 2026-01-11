import { NextResponse } from 'next/server';
import { prisma } from '@trends172tech/db';
import { createAgentInstanceSchema } from '@/lib/validators/agent-instance';
import { AuthError, requireRole } from '@/lib/auth/guards';
import { requireTenantId } from '@/lib/tenant';

function handleError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
}

export async function GET() {
  try {
    const tenantId = await requireTenantId();
    const agentInstances = await prisma.agentInstance.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: {
        endCustomer: true
      }
    });
    return NextResponse.json({ data: agentInstances });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole('TENANT_OPERATOR');
    const tenantId = await requireTenantId();
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    const body = await request.json();
    const parsed = createAgentInstanceSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    if (parsed.data.endCustomerId && tenant.mode === 'SINGLE') {
      return NextResponse.json({ error: 'End customer is not allowed for SINGLE tenants.' }, { status: 400 });
    }

    const resolvedEndCustomerId = tenant.mode === 'SINGLE' ? null : parsed.data.endCustomerId ?? null;

    if (resolvedEndCustomerId) {
      const endCustomer = await prisma.endCustomer.findFirst({
        where: {
          id: resolvedEndCustomerId,
          tenantId
        }
      });

      if (!endCustomer) {
        return NextResponse.json({ error: 'End customer not found for tenant.' }, { status: 404 });
      }
    }

    const existing = await prisma.agentInstance.findFirst({
      where: {
        tenantId,
        baseAgentKey: parsed.data.baseAgentKey,
        endCustomerId: resolvedEndCustomerId
      }
    });

    const payload = {
      name: parsed.data.name,
      baseAgentKey: parsed.data.baseAgentKey,
      languageDefault: parsed.data.languageDefault,
      status: parsed.data.status,
      endCustomerId: resolvedEndCustomerId,
      featuresJson: parsed.data.contactPhone
        ? {
            contactPhone: parsed.data.contactPhone
          }
        : undefined
    };

    const agentInstance = existing
      ? await prisma.agentInstance.update({
          where: { id: existing.id },
          data: payload
        })
      : await prisma.agentInstance.create({
          data: {
            tenantId,
            ...payload
          }
        });

    return NextResponse.json({ data: agentInstance }, { status: existing ? 200 : 201 });
  } catch (error) {
    return handleError(error);
  }
}
