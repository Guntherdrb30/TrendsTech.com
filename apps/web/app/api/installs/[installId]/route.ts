import { NextResponse } from 'next/server';
import { prisma } from '@trends172tech/db';
import { AuthError, requireRole } from '@/lib/auth/guards';
import { requireTenantId } from '@/lib/tenant';
import { updateInstallSchema } from '@/lib/validators/install';

type RouteParams = {
  installId: string;
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
    const { installId } = await params;
    const body = await request.json();
    const parsed = updateInstallSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const install = await prisma.install.findFirst({
      where: { publicKey: installId, tenantId }
    });

    if (!install) {
      return NextResponse.json({ error: 'Install not found' }, { status: 404 });
    }

    const updated = await prisma.install.update({
      where: { id: install.id },
      data: {
        allowedDomains: parsed.data.allowedDomains ?? install.allowedDomains,
        status: parsed.data.status ?? install.status
      }
    });

    return NextResponse.json({ data: updated });
  } catch (error) {
    return handleError(error);
  }
}
