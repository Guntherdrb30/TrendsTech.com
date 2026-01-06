import { NextResponse } from 'next/server';
import { prisma } from '@trends172tech/db';
import { randomUUID } from 'crypto';
import { AuthError, requireRole } from '@/lib/auth/guards';
import { requireTenantId } from '@/lib/tenant';
import { createInstallSchema } from '@/lib/validators/install';

function handleError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
}

function buildPublicKey() {
  return `inst_${randomUUID().replace(/-/g, '').slice(0, 24)}`;
}

export async function GET() {
  try {
    const tenantId = await requireTenantId();
    const installs = await prisma.install.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      include: { agentInstance: true }
    });
    return NextResponse.json({ data: installs });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole('TENANT_OPERATOR');
    const tenantId = await requireTenantId();
    const body = await request.json();
    const parsed = createInstallSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const agentInstance = await prisma.agentInstance.findFirst({
      where: { id: parsed.data.agentInstanceId, tenantId }
    });

    if (!agentInstance) {
      return NextResponse.json({ error: 'Agent instance not found' }, { status: 404 });
    }

    const install = await prisma.install.create({
      data: {
        tenantId,
        agentInstanceId: agentInstance.id,
        publicKey: buildPublicKey(),
        allowedDomains: parsed.data.allowedDomains ?? []
      }
    });

    return NextResponse.json({ data: install }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
