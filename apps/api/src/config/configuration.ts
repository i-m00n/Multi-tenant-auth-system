import { envSchema } from './env.schema';

export default () => {
  const parsed = envSchema.parse(process.env);

  return {
    app: {
      port: parsed.PORT,
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
    },
    argon2: {
      memoryCost: parsed.ARGON2_MEMORY_COST,
      timeCost: parsed.ARGON2_TIME_COST,
      parallelism: parsed.ARGON2_PARALLELISM,
    },
  };
};
