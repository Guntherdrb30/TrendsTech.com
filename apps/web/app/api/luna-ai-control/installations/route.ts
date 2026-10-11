import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@trends172tech/db';
import { AuthError, requireAuth } from '@/lib/auth/guards';

export const runtime = 'nodejs';

const requestSchema = z.object({
  name: z.string().trim().min(2).max(120),
  applicationKey: z.string().regex(/^[a-z0-9][a-z0-9-]{1,63}$/),
  environment: z.enum(['production', 'preview', 'development']).default('production'),
  domain: z.string().trim().max(253).optional(),
}).strict();

function fail(error: unknown) {
  if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
  return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
}

export async function GET() {
  try {
    const user = await requireAuth();
    if (user.role !== 'ROOT' && !user.tenantId) return NextResponse.json({ error: 'Tenant required' }, { status: 403 });
    const data = await prisma.aiControlInstallation.findMany({
      where: user.role === 'ROOT' ? {} : { tenantId: user.tenantId! },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return NextResponse.json({ data });
  } catch (error) { return fail(error); }
}

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    if (!['ROOT', 'TENANT_ADMIN', 'TENANT_OPERATOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (!user.tenantId) return NextResponse.json({ error: 'Tenant required' }, { status: 403 });
    const body = await request.json().catch(() => null);
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    const data = await prisma.aiControlInstallation.create({
      data: { ...parsed.data, tenantId: user.tenantId, requestedByUserId: user.id },
    });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) { return fail(error); }
}
