"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
const zod_1 = require("zod");
exports.envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production']).default('development'),
    PORT: zod_1.z.coerce.number().default(3000),
    DB_HOST: zod_1.z.string(),
    DB_PORT: zod_1.z.coerce.number().default(5432),
    DB_USER: zod_1.z.string(),
    DB_PASS: zod_1.z.string(),
    DB_NAME: zod_1.z.string(),
    JWT_SECRET: zod_1.z.string(),
});
//# sourceMappingURL=env.schema.js.map