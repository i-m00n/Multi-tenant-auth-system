export { createAuthClient, AuthClient, type AuthClientOptions } from "./client";

export { SdkError, AuthError, ForbiddenError, NotFoundError, RateLimitError, ValidationError } from "./types/errors";

export type {
  UserResponse,
  MeResponse,
  TokenResponse,
  RoleResponse,
  PermissionResponse,
  AuditLogResponse,
  PaginatedResponse,
  MessageResponse,
} from "./types/responses";

export {
  LoginSchema,
  RegisterUserSchema,
  CreateRoleSchema,
  AuditQuerySchema,
  PERMISSION_VALUES,
} from "./types/schemas";
export type { LoginDto, RegisterUserDto, CreateRoleDto, AuditQueryDto } from "./types/schemas";

export type { AuditQueryParams } from "./modules/audit";
