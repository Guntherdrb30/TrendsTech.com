import { NextResponse } from 'next/server';
import { prisma } from '@trends172tech/db';
import { createEndCustomerSchema } from '@/lib/validators/end-customer';
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
    const endCustomers = await prisma.endCustomer.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ data: endCustomers });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(request: Request) {
  try {
    await requireRole('TENANT_ADMIN');
    const tenantId = await requireTenantId();
    const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });

    if (!tenant || tenant.mode !== 'RESELLER') {
      return NextResponse.json({ error: 'End customers are only available for RESELLER tenants.' }, { status: 400 });
    }

    const body = await request.json();
    const parsed = createEndCustomerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    }

    const endCustomer = await prisma.endCustomer.create({
      data: {
        tenantId,
        name: parsed.data.name,
        email: parsed.data.email || null,
        phone: parsed.data.phone || null
      }
    });

    return NextResponse.json({ data: endCustomer }, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
