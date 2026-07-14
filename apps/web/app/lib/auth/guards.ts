import { getServerAuthSession } from './session';
import { isRoleAtLeast, type UserRole } from './roles';
import { prisma } from '@trends172tech/db';

export class AuthError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function getCurrentUser() {
  const session = await getServerAuthSession();
  if (!session?.user?.id) return null;

  const currentUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      avatarUrl: true,
      role: true,
      tenantId: true
    }
  });

  if (!currentUser) return null;
  return {
    ...session.user,
    ...currentUser,
    role: currentUser.role as string
  };
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthError(401, 'Unauthorized');
  }
  return user;
}

export async function requireRole(requiredRole: UserRole) {
  const user = await requireAuth();
  const role = user.role as UserRole;
  if (!isRoleAtLeast(role, requiredRole)) {
    throw new AuthError(403, 'Forbidden');
  }
  return user;
}

export async function requireTenant() {
  const user = await requireAuth();
  if (!user.tenantId) {
    throw new AuthError(403, 'Tenant required');
  }
  return user;
}
