import { prisma } from '@trends172tech/db';
import { AuthError } from '@/lib/auth/guards';
import { authenticateInstallation } from './access';

// The installation row serializes policy, revoke/suspend and admission decisions.
// Never use process-local counters: Vercel requests may run on different machines.
export async function reserveGateway(request: Request, input: { agent: string; operationId: string }) {
  return prisma.$transaction(async tx => {
    const auth = await authenticateInstallation(request, tx);
    await tx.$queryRaw`SELECT "id" FROM "AiControlInstallation" WHERE "id" = ${auth.installationId} FOR UPDATE`;
    const credential = await authenticateInstallation(request, tx);
    const policy = await tx.aiControlGatewayPolicy.findUnique({ where: { installationId: credential.installationId } });
    if (!policy?.enabled || !policy.allowedAgents.includes(input.agent)) throw new AuthError(403, 'Agent not authorized');
    const now = new Date();
    const previous = await tx.aiControlGatewayLease.findUnique({
      where: { installationId_operationId: { installationId: credential.installationId, operationId: input.operationId } },
    });
    // Operation identifiers are single-use, including expired and released leases.
    if (previous) throw new AuthError(409, 'Operation already reserved');
    const concurrent = await tx.aiControlGatewayLease.count({
      where: { installationId: credential.installationId, releasedAt: null, expiresAt: { gt: now } },
    });
    const freshWindow = now.getTime() - policy.windowStartedAt.getTime() >= 60000;
    const count = freshWindow ? 0 : policy.windowRequests;
    if (count >= policy.requestsPerMinute || concurrent >= policy.maxConcurrent) throw new AuthError(429, 'Gateway limit exceeded');
    await tx.aiControlGatewayPolicy.update({
      where: { installationId: credential.installationId },
      data: { windowRequests: count + 1, ...(freshWindow ? { windowStartedAt: now } : {}) },
    });
    const lease = await tx.aiControlGatewayLease.create({
      data: { installationId: credential.installationId, ...input, expiresAt: new Date(now.getTime() + 60000) },
    });
    await tx.aiControlCredential.update({ where: { id: credential.id }, data: { lastUsedAt: now } });
    return { leaseId: lease.id, expiresAt: lease.expiresAt.toISOString() };
  });
}

export async function releaseGateway(request: Request, leaseId: string) {
  const credential = await authenticateInstallation(request);
  const result = await prisma.aiControlGatewayLease.updateMany({
    where: { id: leaseId, installationId: credential.installationId, releasedAt: null }, data: { releasedAt: new Date() },
  });
  return { released: result.count === 1 };
}
