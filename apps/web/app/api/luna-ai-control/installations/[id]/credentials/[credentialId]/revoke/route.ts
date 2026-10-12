import { assertControlPreviewReady } from '@/lib/luna-ai-control/preview-isolation';
import { assertSameOrigin } from '@/lib/luna-ai-control/access';
import { NextResponse } from 'next/server';
import { prisma } from '@trends172tech/db';
import { AuthError, requireAuth } from '@/lib/auth/guards';

export const runtime = 'nodejs';

export async function POST(request: Request, { params }: { params: Promise<{ id: string; credentialId: string }> }) {
  try {
    assertSameOrigin(request);
    const actor = await requireAuth();
    if (actor.role !== 'ROOT') return NextResponse.json({ error: 'ROOT required' }, { status: 403 });
    assertControlPreviewReady();
    const { id, credentialId } = await params;
    const result = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT "id" FROM "AiControlInstallation" WHERE "id" = ${id} FOR UPDATE`;
      const credential = await tx.aiControlCredential.findFirst({
        where: { id: credentialId, installationId: id, revokedAt: null },
        include: { installation: { select: { status: true } } },
      });
      if (!credential) return false;
      const changed = await tx.aiControlCredential.updateMany({
        where: { id: credentialId, installationId: id, revokedAt: null },
        data: { revokedAt: new Date(), revokedByUserId: actor.id },
      });
      if (changed.count !== 1) return false;
      await tx.aiControlInstallationAudit.create({
        data: {
          installationId: id,
          actorUserId: actor.id,
          action: 'credential.revoke',
          previousStatus: credential.installation.status,
          nextStatus: credential.installation.status,
        },
      });
      return true;
    });
    if (!result) return NextResponse.json({ error: 'Credential not found or already revoked' }, { status: 404 });
    return NextResponse.json({ revoked: true });
  } catch (error) {
    if (error instanceof AuthError) return NextResponse.json({ error: error.message }, { status: error.status });
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
