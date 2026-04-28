import { z } from "zod";

// tenant
export const CreateTenantSchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers, and hyphens only"),
  adminEmail: z.email(),
  adminPassword: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export type CreateTenantDto = z.infer<typeof CreateTenantSchema>;

// auth
export const LoginSchema = z.object({
  email: z.email(),
  password: z.string().min(1, "Password is required"),
});

export type LoginDto = z.infer<typeof LoginSchema>;

// user
export const RegisterUserSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(12, "Password must be at least 12 characters")
    .regex(/[A-Z]/, "Must contain an uppercase letter")
    .regex(/[0-9]/, "Must contain a number"),
});

export type RegisterUserDto = z.infer<typeof RegisterUserSchema>;

export const UserResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  tenantId: z.uuid(),
  isActive: z.boolean(),
  createdAt: z.date(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;

// rbac
export const CreateRoleSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, hyphens only"),
});

export type CreateRoleDto = z.infer<typeof CreateRoleSchema>;

export const PERMISSION_VALUES = [
  "user:read",
  "user:create",
  "user:delete",
  "role:read",
  "role:assign",
  "tenant:read",
  "tenant:create",
  "tenant:update",
  "audit:read",
] as const;

export type PermissionValue = (typeof PERMISSION_VALUES)[number];

export const AssignPermissionSchema = z.object({
  permission: z.enum(PERMISSION_VALUES),
});

export type AssignPermissionDto = z.infer<typeof AssignPermissionSchema>;

export const AssignRoleSchema = z.object({
  roleId: z.uuid(),
});

export type AssignRoleDto = z.infer<typeof AssignRoleSchema>;

// audit
export const AuditQuerySchema = z.object({
  userId: z.uuid().optional(),
  action: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
});

export type AuditQueryDto = z.infer<typeof AuditQuerySchema>;
