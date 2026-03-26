import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),

  PORT: z.coerce.number().default(3000),

  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_NAME: z.string(),

  JWT_SECRET: z.string(),
  JWT_ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRY_DAYS: z.coerce.number().default(7),

  ARGON2_MEMORY_COST: z.coerce.number().default(2 ** 16), // 64 MiB
  ARGON2_TIME_COST: z.coerce.number().default(3),
  ARGON2_PARALLELISM: z.coerce.number().default(4),
});
