import { prisma } from '@trends172tech/db';
import { AuthError, requireAuth } from '../auth/guards';

export async function resolveTenantFromUser(user: { tenantId?: string | null }) {
  if (!user.tenantId) {
    return null;
  }
  return prisma.tenant.findUnique({
    where: { id: user.tenantId }
  });
}

export async function requireTenantId() {
  const user = await requireAuth();
  if (!user.tenantId) {
    throw new AuthError(403, 'Tenant required');
  }
  return user.tenantId;
}
