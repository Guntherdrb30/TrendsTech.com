import { assertControlPreviewReady } from '@/lib/luna-ai-control/preview-isolation';
import { readBoundedJson } from '@/lib/luna-ai-control/usage-validation';
import { assertSameOrigin } from '@/lib/luna-ai-control/access';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@trends172tech/db';
import { AuthError, requireAuth } from '@/lib/auth/guards';
import { transitionInstallation, type InstallationAction, type InstallationState } from '@trends172tech/core/src/luna-ai-control/installations';

export const runtime = 'nodejs';

const schema = z.object({
  action: z.enum(['approve', 'reject', 'activate', 'suspend', 'resume', 'revoke']),
  reason: z.string().trim().max(1000).optional(),
}).strict();

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    assertSameOrigin(request);
    const user = await requireAuth();
    if (user.role !== 'ROOT') return NextResponse.json({ error: 'ROOT required' }, { status: 403 });
    const bounded = await readBoundedJson(request);
    if (!bounded.ok) return NextResponse.json({ error: bounded.error }, { status: bounded.status });
    const body = bounded.data;
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    const { action, reason } = parsed.data;
    if (['reject', 'suspend', 'revoke'].includes(action) && !reason) {
      return NextResponse.json({ error: 'Reason required' }, { status: 400 });
    }
    assertControlPreviewReady();
    const { id } = await params;
    const existing = await prisma.aiControlInstallation.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: 'Installation not found' }, { status: 404 });
    let change;
    try {
      change = transitionInstallation(existing.status as InstallationState, action as InstallationAction, { id: user.id, role: 'ROOT' }, reason);
    } catch {
      return NextResponse.json({ error: 'Invalid state transition or reason' }, { status: 409 });
    }
    const { previous: expected, next } = change;
    const data = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "AiControlInstallation" WHERE "id" = ${id} FOR UPDATE`;
      const changed = await tx.aiControlInstallation.updateMany({
        where: { id, status: expected },
        data: { status: next, reviewedByUserId: user.id, reviewedAt: new Date(), reviewReason: reason ?? null },
      });
      if (changed.count !== 1) return null;
      await tx.aiControlInstallationAudit.create({
        data: { installationId: id, actorUserId: user.id, action, previousStatus: expected, nextStatus: next, reason },
      });
      return tx.aiControlInstallation.findUnique({ where: { id } });
    });
    if (!data) return NextResponse.json({ error: 'Installation not found or invalid state transition' }, { status: 409 });
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
