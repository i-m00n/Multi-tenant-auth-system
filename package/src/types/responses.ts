// Tenants
export interface TenantResponse {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateTenantResponse {
  tenant: TenantResponse;
  admin: { id: string; email: string };
  roles: { adminRoleId: string };
}

// Users
export interface UserResponse {
  id: string;
  email: string;
  tenantId: string;
  isActive: boolean;
  createdAt: string;
  roles: { id: string; name: string }[];
}

export interface MeResponse extends UserResponse {
  permissions: string[];
}

// Authentication
export interface TokenResponse {
  accessToken: string;
  user: UserResponse;
}

export interface RefreshResponse {
  accessToken: string;
}

// Roles and Permissions
export interface RoleResponse {
  id: string;
  name: string;
  tenantId: string;
  isSystem: boolean;
  permissions: PermissionResponse[];
}

export interface PermissionResponse {
  id: string;
  name: string;
  resource: string;
  action: string;
}

// Audit Logs
export interface AuditLogResponse {
  id: string;
  tenantId: string;
  userId: string | null;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
}

// Generic Responses
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface MessageResponse {
  message: string;
}
