"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_schema_1 = require("./env.schema");
exports.default = () => {
    const parsed = env_schema_1.envSchema.parse(process.env);
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
    };
};
//# sourceMappingURL=configuration.js.map