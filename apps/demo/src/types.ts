import type {
  UserResponse,
  MeResponse,
  RoleResponse,
  AuditLogResponse,
  PaginatedResponse,
  AuditQueryParams,
} from "@auth-moon/sdk";

export type { UserResponse, MeResponse, RoleResponse, AuditLogResponse, PaginatedResponse, AuditQueryParams };

export interface AuthState {
  user: MeResponse | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
