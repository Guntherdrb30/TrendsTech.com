import { NextResponse } from 'next/server';
import { prisma } from '@trends172tech/db';
import { createTenantSchema } from '@/lib/validators/tenant';
import { AuthError, requireRole } from '@/lib/auth/guards';

function handleError(error: unknown) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'P2002') {
    return NextResponse.json({ error: 'Tenant slug already exists.' }, { status: 409 });
  }

  return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
}

export async function GET() {
  try {
    await requireRole('ROOT');
    const tenants = await prisma.tenant.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ data: tenants });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    const user = await requireRole('ROOT');
    const body = await request.json();
    const parsed = createTenantSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const tenant = await prisma.tenant.create({
      data: {
        name: parsed.data.name,
        slug: parsed.data.slug.trim().toLowerCase(),
        mode: parsed.data.mode
      }
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        tenantId: tenant.id,
        action: 'TENANT_CREATED',
        entity: 'Tenant',
        entityId: tenant.id,
        metaJson: {
          slug: tenant.slug
        }
      }
    });

    return NextResponse.json({ data: tenant }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
