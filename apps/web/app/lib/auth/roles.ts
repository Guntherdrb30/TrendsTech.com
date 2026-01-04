export const userRoles = ['ROOT', 'TENANT_ADMIN', 'TENANT_OPERATOR', 'TENANT_VIEWER'] as const;
export type UserRole = (typeof userRoles)[number];

const roleRank: Record<UserRole, number> = {
  ROOT: 4,
  TENANT_ADMIN: 3,
  TENANT_OPERATOR: 2,
  TENANT_VIEWER: 1
};

export function isRoleAtLeast(role: UserRole, required: UserRole) {
  return roleRank[role] >= roleRank[required];
}
