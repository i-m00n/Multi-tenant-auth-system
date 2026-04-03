export interface UserResponse {
  id: string;
  email: string;
  tenantId: string;
  isActive: boolean;
  createdAt: string;
}

export interface MeResponse extends UserResponse {
  permissions: string[];
}

export interface TokenResponse {
  accessToken: string;
  user: UserResponse;
}

export interface RefreshResponse {
  accessToken: string;
}

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
