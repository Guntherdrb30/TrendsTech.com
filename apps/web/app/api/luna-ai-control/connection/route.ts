import { NextResponse } from 'next/server';
import { prisma } from '@trends172tech/db';
import { verifyInstallationCredential, hashInstallationCredential } from '@/lib/luna-ai-control/credentials';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const authorization = request.headers.get('authorization') ?? '';
  if (!authorization.startsWith('Bearer ')) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const secret = authorization.slice(7);
  if (!/^luna_live_[A-Za-z0-9_-]{43}$/.test(secret)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const credential = await prisma.aiControlCredential.findUnique({
      where: { secretHash: hashInstallationCredential(secret) },
      include: { installation: { select: { id: true, tenantId: true, status: true } } },
    });
    if (!credential || credential.revokedAt || !verifyInstallationCredential(secret, credential.secretHash) || credential.installation.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    await prisma.aiControlCredential.update({
      where: { id: credential.id },
      data: { lastUsedAt: new Date() },
    });
    return NextResponse.json(
      { installationId: credential.installation.id, tenantId: credential.installation.tenantId, status: 'ACTIVE' },
      { headers: { 'Cache-Control': 'no-store' } },
    );
  } catch {
    return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
  }
}
