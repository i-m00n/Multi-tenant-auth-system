import { z } from 'zod';
export declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        production: "production";
    }>>;
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    DB_HOST: z.ZodString;
    DB_PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    DB_USER: z.ZodString;
    DB_PASS: z.ZodString;
    DB_NAME: z.ZodString;
    JWT_SECRET: z.ZodString;
}, z.core.$strip>;
