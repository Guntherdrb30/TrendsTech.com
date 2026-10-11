import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@trends172tech/db';
import { AuthError, requireAuth } from '@/lib/auth/guards';

export const runtime = 'nodejs';

const schema = z.object({
  action: z.enum(['approve', 'reject', 'activate', 'suspend', 'resume', 'revoke']),
  reason: z.string().trim().max(1000).optional(),
}).strict();

const transitions = {
  approve: ['REQUESTED', 'APPROVED'],
  reject: ['REQUESTED', 'REJECTED'],
  activate: ['APPROVED', 'ACTIVE'],
  suspend: ['ACTIVE', 'SUSPENDED'],
  resume: ['SUSPENDED', 'ACTIVE'],
  revoke: ['APPROVED', 'REVOKED'],
} as const;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    if (user.role !== 'ROOT') return NextResponse.json({ error: 'ROOT required' }, { status: 403 });
    const body = await request.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    const { action, reason } = parsed.data;
    if (['reject', 'suspend', 'revoke'].includes(action) && !reason) {
      return NextResponse.json({ error: 'Reason required' }, { status: 400 });
    }
    const { id } = await params;
    const [expected, next] = transitions[action];
    const data = await prisma.$transaction(async (tx) => {
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
