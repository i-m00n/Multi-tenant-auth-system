import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('development'),

  PORT: z.coerce.number().default(3000),

  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_NAME: z.string(),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_TOKEN_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRY_DAYS: z.coerce.number().default(7),

  ARGON2_MEMORY_COST: z.coerce.number().default(2 ** 16),
  ARGON2_TIME_COST: z.coerce.number().default(3),
  ARGON2_PARALLELISM: z.coerce.number().default(4),

  RATE_LIMIT_LOGIN_LIMIT: z.coerce.number().default(5),
  RATE_LIMIT_LOGIN_WINDOW_SECONDS: z.coerce.number().default(900),
  RATE_LIMIT_REGISTER_LIMIT: z.coerce.number().default(10),
  RATE_LIMIT_REGISTER_WINDOW_SECONDS: z.coerce.number().default(3600),
  RATE_LIMIT_REFRESH_LIMIT: z.coerce.number().default(20),
  RATE_LIMIT_REFRESH_WINDOW_SECONDS: z.coerce.number().default(900),
  RATE_LIMIT_API_LIMIT: z.coerce.number().default(100),
  RATE_LIMIT_API_WINDOW_SECONDS: z.coerce.number().default(60),
});
