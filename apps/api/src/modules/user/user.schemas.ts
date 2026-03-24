import { z } from 'zod';

export const RegisterUserSchema = z.object({
  email: z.email(),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
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
