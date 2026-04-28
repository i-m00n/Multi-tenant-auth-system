export { createAuthClient, AuthClient, type AuthClientOptions } from "./client";
export { createPlatformClient, PlatformClient, type PlatformClientOptions } from "./platform-client";

export {
  SdkError,
  AuthError,
  ForbiddenError,
  NotFoundError,
  RateLimitError,
  ValidationError,
  ConflictError,
} from "./types/errors";

export type {
  UserResponse,
  MeResponse,
  TokenResponse,
  RoleResponse,
  PermissionResponse,
  AuditLogResponse,
  PaginatedResponse,
  MessageResponse,
  TenantResponse,
  CreateTenantResponse,
} from "./types/responses";

export {
  LoginSchema,
  RegisterUserSchema,
  CreateRoleSchema,
  AuditQuerySchema,
  CreateTenantSchema,
  PERMISSION_VALUES,
} from "./types/schemas";

export type { LoginDto, RegisterUserDto, CreateRoleDto, AuditQueryDto, CreateTenantDto } from "./types/schemas";

export type { AuditQueryParams } from "./modules/audit";
