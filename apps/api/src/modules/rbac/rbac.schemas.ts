import { z } from 'zod';
import { PERMISSIONS } from './permissions.constants';

export const CreateRoleSchema = z.object({
  name: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, hyphens only'),
});

export const AssignPermissionSchema = z.object({
  permission: z.enum(Object.values(PERMISSIONS) as [string, ...string[]]),
});

export const AssignRoleSchema = z.object({
  roleId: z.uuid(),
});
