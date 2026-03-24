export const PERMISSIONS = {
  USER_READ: 'user:read',
  USER_CREATE: 'user:create',
  USER_DELETE: 'user:delete',
  ROLE_READ: 'role:read',
  ROLE_ASSIGN: 'role:assign',
  TENANT_READ: 'tenant:read',
  TENANT_UPDATE: 'tenant:update',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
