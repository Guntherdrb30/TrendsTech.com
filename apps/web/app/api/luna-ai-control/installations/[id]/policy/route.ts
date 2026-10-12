import { assertControlPreviewReady } from '@/lib/luna-ai-control/preview-isolation';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@trends172tech/db';
import { requireRole, AuthError } from '@/lib/auth/guards';
import { assertSameOrigin } from '@/lib/luna-ai-control/access';
import { readBoundedJson } from '@/lib/luna-ai-control/usage-validation';
const schema = z.object({ enabled: z.boolean(), allowedAgents: z.array(z.string().regex(/^[a-zA-Z0-9_-]{1,80}$/)).min(1).max(100), requestsPerMinute: z.number().int().min(1).max(10000), maxConcurrent: z.number().int().min(1).max(100) }).strict();
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const actor = await requireRole('ROOT');
    assertControlPreviewReady();
    const { id } = await params;
    const body = await readBoundedJson(request);
    if (!body.ok) return NextResponse.json({ error: body.error }, { status: body.status });
    const parsed = schema.safeParse(body.data);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid policy' }, { status: 400 });
    await prisma.$transaction(async tx => {
      await tx.$queryRaw`SELECT "id" FROM "AiControlInstallation" WHERE "id" = ${id} FOR UPDATE`;
      const installation = await tx.aiControlInstallation.findUnique({ where: { id } });
      if (!installation) throw new AuthError(404, 'Installation not found');
      await tx.aiControlGatewayPolicy.upsert({ where: { installationId: id }, create: { installationId: id, ...parsed.data }, update: parsed.data });
      await tx.aiControlInstallationAudit.create({ data: { installationId: id, actorUserId: actor.id, action: 'gateway.policy', previousStatus: installation.status, nextStatus: installation.status, reason: JSON.stringify(parsed.data) } });
    });
    return NextResponse.json({ saved: true }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) { return NextResponse.json({ error: e instanceof AuthError ? e.message : 'Policy unavailable' }, { status: e instanceof AuthError ? e.status : 503 }); }
}
