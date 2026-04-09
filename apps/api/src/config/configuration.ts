import { envSchema } from './env.schema';

export default () => {
  const parsed = envSchema.parse(process.env);

  return {
    app: {
      port: parsed.PORT,
      env: parsed.NODE_ENV,
    },
    db: {
      host: parsed.DB_HOST,
      port: parsed.DB_PORT,
      user: parsed.DB_USER,
      pass: parsed.DB_PASS,
      name: parsed.DB_NAME,
    },
    jwt: {
      secret: parsed.JWT_SECRET,
      accessTokenExpiry: parsed.JWT_ACCESS_TOKEN_EXPIRY,
      refreshTokenExpiryDays: parsed.JWT_REFRESH_TOKEN_EXPIRY_DAYS,
    },
    argon2: {
      memoryCost: parsed.ARGON2_MEMORY_COST,
      timeCost: parsed.ARGON2_TIME_COST,
      parallelism: parsed.ARGON2_PARALLELISM,
    },
    throttler: {
      ttl: parsed.THROTTLER_TTL_MS,
      limit: parsed.THROTTLER_LIMIT,
    },
    rateLimit: {
      login: {
        limit: parsed.RATE_LIMIT_LOGIN_LIMIT,
        windowSeconds: parsed.RATE_LIMIT_LOGIN_WINDOW_SECONDS,
      },
      register: {
        limit: parsed.RATE_LIMIT_REGISTER_LIMIT,
        windowSeconds: parsed.RATE_LIMIT_REGISTER_WINDOW_SECONDS,
      },
      refresh: {
        limit: parsed.RATE_LIMIT_REFRESH_LIMIT,
        windowSeconds: parsed.RATE_LIMIT_REFRESH_WINDOW_SECONDS,
      },
      api: {
        limit: parsed.RATE_LIMIT_API_LIMIT,
        windowSeconds: parsed.RATE_LIMIT_API_WINDOW_SECONDS,
      },
    },
  };
};
