import { NextResponse } from 'next/server';
import { prisma } from '@trends172tech/db';
import { AuthError, requireAuth } from '@/lib/auth/guards';
import { issueInstallationCredential } from '@/lib/luna-ai-control/credentials';

export const runtime = 'nodejs';

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireAuth();
    if (actor.role !== 'ROOT') return NextResponse.json({ error: 'ROOT required' }, { status: 403 });
    const { id } = await params;
    const installation = await prisma.aiControlInstallation.findUnique({ where: { id } });
    if (!installation) return NextResponse.json({ error: 'Installation not found' }, { status: 404 });
    if (!['APPROVED', 'ACTIVE'].includes(installation.status)) {
      return NextResponse.json({ error: 'Installation must be approved or active' }, { status: 409 });
    }
    const issued = issueInstallationCredential();
    await prisma.$transaction(async (tx) => {
      await tx.aiControlCredential.create({
        data: {
          installationId: id,
          keyPrefix: issued.prefix,
          secretHash: issued.hash,
          createdByUserId: actor.id,
        },
      });
      await tx.aiControlInstallationAudit.create({
        data: {
          installationId: id,
          actorUserId: actor.id,
          action: 'credential.issue',
          previousStatus: installation.status,
          nextStatus: installation.status,
        },
      });
    });
    return NextResponse.json(
      { credential: issued.secret, prefix: issued.prefix, installationId: id, warning: 'Copy this secret now; it will not be shown again.' },
      { status: 201, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
