import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1777074209188 implements MigrationInterface {
  name = 'InitialSchema1777074209188';

  async up(queryRunner: QueryRunner): Promise<void> {
    // tenants
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "tenants" (
        "id"        uuid      NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "name"      varchar   NOT NULL,
        "slug"      varchar   NOT NULL,
        "isActive"  boolean   NOT NULL DEFAULT true,
        CONSTRAINT "PK_tenants" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "IDX_tenants_slug" ON "tenants" ("slug")
    `);

    // permissions
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "permissions" (
        "id"          uuid      NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP NOT NULL DEFAULT now(),
        "name"        varchar   NOT NULL,
        "resource"    varchar   NOT NULL,
        "action"      varchar   NOT NULL,
        "description" varchar,
        CONSTRAINT "UQ_permissions_name" UNIQUE ("name"),
        CONSTRAINT "PK_permissions"      PRIMARY KEY ("id")
      )
    `);

    // roles
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "roles" (
        "id"        uuid      NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "name"      varchar   NOT NULL,
        "tenant_id" uuid      NOT NULL,
        "is_system" boolean   NOT NULL DEFAULT false,
        CONSTRAINT "PK_roles" PRIMARY KEY ("id")
      )
    `);

    // role_permissions
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "role_permissions" (
        "role_id"       uuid NOT NULL,
        "permission_id" uuid NOT NULL,
        CONSTRAINT "PK_role_permissions" PRIMARY KEY ("role_id", "permission_id")
      )
    `);

    // users
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id"            uuid      NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt"     TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"     TIMESTAMP NOT NULL DEFAULT now(),
        "email"         varchar   NOT NULL,
        "password_hash" varchar   NOT NULL,
        "tenant_id"     uuid      NOT NULL,
        "is_active"     boolean   NOT NULL DEFAULT true,
        CONSTRAINT "UQ_users_email_tenant_id" UNIQUE ("email", "tenant_id"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // user_roles
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_roles" (
        "id"          uuid      NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt"   TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"   TIMESTAMP NOT NULL DEFAULT now(),
        "user_id"     uuid      NOT NULL,
        "role_id"     uuid      NOT NULL,
        "tenant_id"   uuid      NOT NULL,
        "assigned_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_roles" PRIMARY KEY ("id")
      )
    `);

    // refresh_tokens
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "refresh_tokens" (
        "id"         uuid      NOT NULL DEFAULT uuid_generate_v4(),
        "createdAt"  TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt"  TIMESTAMP NOT NULL DEFAULT now(),
        "token_hash" varchar   NOT NULL,
        "family_id"  uuid      NOT NULL,
        "user_id"    uuid      NOT NULL,
        "tenant_id"  uuid      NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "is_revoked" boolean   NOT NULL DEFAULT false,
        CONSTRAINT "UQ_refresh_tokens_token_hash" UNIQUE ("token_hash"),
        CONSTRAINT "PK_refresh_tokens"            PRIMARY KEY ("id")
      )
    `);

    // audit_logs
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "audit_logs" (
        "id"            uuid         NOT NULL DEFAULT uuid_generate_v4(),
        "tenant_id"     uuid         NOT NULL,
        "user_id"       uuid,
        "action"        varchar(100) NOT NULL,
        "resource_type" varchar(50),
        "resource_id"   uuid,
        "ip_address"    varchar(45),
        "user_agent"    text,
        "metadata"      jsonb        NOT NULL DEFAULT '{}',
        "created_at"    TIMESTAMP    NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
      )
    `);

    // indexes
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_roles_tenant_id"         ON "roles"          ("tenant_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_users_tenant_id"         ON "users"          ("tenant_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_roles_user_id"      ON "user_roles"     ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_roles_tenant_id"    ON "user_roles"     ("tenant_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_refresh_tokens_tenant_id" ON "refresh_tokens" ("tenant_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_refresh_tokens_family_id" ON "refresh_tokens" ("family_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_audit_logs_tenant_id"    ON "audit_logs"     ("tenant_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_audit_logs_user_id"      ON "audit_logs"     ("user_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_audit_logs_action"       ON "audit_logs"     ("action")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_audit_logs_created_at"   ON "audit_logs"     ("created_at" DESC)`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'audit_logs',
      'refresh_tokens',
      'user_roles',
      'users',
      'role_permissions',
      'roles',
      'permissions',
      'tenants',
    ];
    for (const t of tables) {
      await queryRunner.query(`DROP TABLE IF EXISTS "${t}" CASCADE`);
    }
  }
}
