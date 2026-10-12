import { NextResponse } from 'next/server';
import { prisma } from '@trends172tech/db';
import { AuthError } from '@/lib/auth/guards';
import { authenticateInstallation } from '@/lib/luna-ai-control/access';
export const runtime = 'nodejs';
export async function GET(request: Request) {
  try {
    const credential = await authenticateInstallation(request);
    const policy = await prisma.aiControlGatewayPolicy.findUnique({ where: { installationId: credential.installationId } });
    await prisma.aiControlCredential.update({ where: { id: credential.id }, data: { lastUsedAt: new Date() } });
    return NextResponse.json({ installationId: credential.installationId, tenantId: credential.installation.tenantId,
      status: 'ACTIVE', gatewayEnabled: policy?.enabled ?? false, allowedAgents: policy?.allowedAgents ?? [] }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) { return NextResponse.json({ error: error instanceof AuthError ? error.message : 'Connection unavailable' }, { status: error instanceof AuthError ? error.status : 503, headers: { 'Cache-Control': 'no-store' } }); }
}
