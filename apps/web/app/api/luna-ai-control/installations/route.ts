import { assertControlPreviewReady } from '@/lib/luna-ai-control/preview-isolation';
import { readBoundedJson } from '@/lib/luna-ai-control/usage-validation';
import { assertSameOrigin } from '@/lib/luna-ai-control/access';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@trends172tech/db';
import { AuthError, requireAuth } from '@/lib/auth/guards';

export const runtime = 'nodejs';

const requestSchema = z.object({
  tenantId: z.string().min(1).max(80).optional(),
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
    assertControlPreviewReady();
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
    assertSameOrigin(request);
    const user = await requireAuth();
    if (!['ROOT', 'TENANT_ADMIN', 'TENANT_OPERATOR'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const bounded = await readBoundedJson(request);
    if (!bounded.ok) return NextResponse.json({ error: bounded.error }, { status: bounded.status });
    const body = bounded.data;
    const parsed = requestSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Validation failed', details: parsed.error.flatten() }, { status: 400 });
    const { tenantId: requestedTenant, ...input } = parsed.data;
    if (user.role !== 'ROOT' && requestedTenant && requestedTenant !== user.tenantId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    assertControlPreviewReady();
    const tenantId = user.role === 'ROOT' ? requestedTenant ?? user.tenantId : user.tenantId;
    if (!tenantId) return NextResponse.json({ error: 'Tenant required' }, { status: 403 });
    if (!await prisma.tenant.findUnique({ where: { id: tenantId }, select: { id: true } })) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    const data = await prisma.$transaction(async tx => {
      const installation = await tx.aiControlInstallation.create({ data: { ...input, tenantId, requestedByUserId: user.id } });
      await tx.aiControlInstallationAudit.create({ data: { installationId: installation.id, actorUserId: user.id, action: 'request', previousStatus: 'REQUESTED', nextStatus: 'REQUESTED' } });
      return installation;
    });
    return NextResponse.json({ data }, { status: 201 });
  } catch (error) { return fail(error); }
}
