import { MigrationInterface, QueryRunner } from 'typeorm';

export class RlsPolicies1777074210241 implements MigrationInterface {
  name = 'RlsPolicies1777074210241';

  async up(queryRunner: QueryRunner): Promise<void> {
    /*    const dbName = process.env.DB_NAME ?? 'auth_db';
    const dbPass = process.env.DB_PASS ?? 'pass';

    // app_user
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
          CREATE USER app_user WITH PASSWORD '${dbPass}';
        END IF;
      END
      $$
    `);

    await queryRunner.query(
      `ALTER DATABASE "${dbName}" SET app.current_tenant_id = ''`,
    );

    await queryRunner.query(
      `GRANT CONNECT ON DATABASE "${dbName}" TO app_user`,
    );
    await queryRunner.query(`GRANT USAGE  ON SCHEMA public TO app_user`);
    await queryRunner.query(`GRANT CREATE ON SCHEMA public TO app_user`);
    await queryRunner.query(
      `GRANT ALL PRIVILEGES ON ALL TABLES    IN SCHEMA public TO app_user`,
    );
    await queryRunner.query(
      `GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user`,
    );
    await queryRunner.query(`
      ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT ALL PRIVILEGES ON TABLES    TO app_user
    `);
    await queryRunner.query(`
      ALTER DEFAULT PRIVILEGES IN SCHEMA public
        GRANT ALL PRIVILEGES ON SEQUENCES TO app_user
    `);

    // helper function
    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION app_current_tenant_id()
      RETURNS uuid AS $$
      BEGIN
        RETURN nullif(current_setting('app.current_tenant_id', true), '')::uuid;
      EXCEPTION
        WHEN OTHERS THEN RETURN NULL;
      END;
      $$ LANGUAGE plpgsql STABLE
    `);
*/
    // tenants
    await queryRunner.query(`ALTER TABLE tenants ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`ALTER TABLE tenants FORCE   ROW LEVEL SECURITY`);
    await queryRunner.query(`
      CREATE POLICY tenants_select ON tenants FOR SELECT USING (true)
    `);
    await queryRunner.query(`
      CREATE POLICY tenants_insert ON tenants FOR INSERT WITH CHECK (true)
    `);
    await queryRunner.query(`
      CREATE POLICY tenants_update ON tenants FOR UPDATE USING (true)
    `);

    // roles
    await queryRunner.query(`ALTER TABLE roles ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`ALTER TABLE roles FORCE   ROW LEVEL SECURITY`);
    await queryRunner.query(`
      CREATE POLICY roles_select ON roles
        FOR SELECT USING (tenant_id::uuid = app_current_tenant_id())
    `);
    await queryRunner.query(`
      CREATE POLICY roles_insert ON roles
        FOR INSERT WITH CHECK (tenant_id::uuid = app_current_tenant_id())
    `);
    await queryRunner.query(`
      CREATE POLICY roles_update ON roles
        FOR UPDATE USING (tenant_id::uuid = app_current_tenant_id())
    `);

    // role_permissions
    await queryRunner.query(
      `ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE role_permissions FORCE   ROW LEVEL SECURITY`,
    );
    await queryRunner.query(`
      CREATE POLICY role_permissions_select ON role_permissions
        FOR SELECT USING (
          role_id IN (
            SELECT id FROM roles
            WHERE tenant_id::uuid = app_current_tenant_id()
          )
        )
    `);
    await queryRunner.query(`
      CREATE POLICY role_permissions_insert ON role_permissions
        FOR INSERT WITH CHECK (
          role_id IN (
            SELECT id FROM roles
            WHERE tenant_id::uuid = app_current_tenant_id()
          )
        )
    `);
    await queryRunner.query(`
      CREATE POLICY role_permissions_delete ON role_permissions
        FOR DELETE USING (
          role_id IN (
            SELECT id FROM roles
            WHERE tenant_id::uuid = app_current_tenant_id()
          )
        )
    `);

    // users
    await queryRunner.query(`ALTER TABLE users ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(`ALTER TABLE users FORCE   ROW LEVEL SECURITY`);
    await queryRunner.query(`
      CREATE POLICY users_select ON users
        FOR SELECT USING (tenant_id::uuid = app_current_tenant_id())
    `);
    await queryRunner.query(`
      CREATE POLICY users_insert ON users
        FOR INSERT WITH CHECK (tenant_id::uuid = app_current_tenant_id())
    `);
    await queryRunner.query(`
      CREATE POLICY users_update ON users
        FOR UPDATE USING (tenant_id::uuid = app_current_tenant_id())
    `);

    // ── user_roles ──────
    await queryRunner.query(`ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(
      `ALTER TABLE user_roles FORCE   ROW LEVEL SECURITY`,
    );
    await queryRunner.query(`
      CREATE POLICY user_roles_select ON user_roles
        FOR SELECT USING (tenant_id::uuid = app_current_tenant_id())
    `);
    await queryRunner.query(`
      CREATE POLICY user_roles_insert ON user_roles
        FOR INSERT WITH CHECK (tenant_id::uuid = app_current_tenant_id())
    `);
    await queryRunner.query(`
      CREATE POLICY user_roles_delete ON user_roles
        FOR DELETE USING (tenant_id::uuid = app_current_tenant_id())
    `);

    // refresh_tokens
    await queryRunner.query(
      `ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY`,
    );
    await queryRunner.query(
      `ALTER TABLE refresh_tokens FORCE   ROW LEVEL SECURITY`,
    );
    await queryRunner.query(`
      CREATE POLICY refresh_tokens_select ON refresh_tokens
        FOR SELECT USING (tenant_id::uuid = app_current_tenant_id())
    `);
    await queryRunner.query(`
      CREATE POLICY refresh_tokens_insert ON refresh_tokens
        FOR INSERT WITH CHECK (tenant_id::uuid = app_current_tenant_id())
    `);
    await queryRunner.query(`
      CREATE POLICY refresh_tokens_update ON refresh_tokens
        FOR UPDATE USING (tenant_id::uuid = app_current_tenant_id())
    `);

    // audit_logs
    await queryRunner.query(`ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY`);
    await queryRunner.query(
      `ALTER TABLE audit_logs FORCE   ROW LEVEL SECURITY`,
    );
    await queryRunner.query(`
      CREATE POLICY audit_logs_insert ON audit_logs
        FOR INSERT WITH CHECK (true)
    `);
    await queryRunner.query(`
      CREATE POLICY audit_logs_select ON audit_logs
        FOR SELECT USING (tenant_id::uuid = app_current_tenant_id())
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'tenants',
      'roles',
      'role_permissions',
      'users',
      'user_roles',
      'refresh_tokens',
      'audit_logs',
    ];
    for (const t of tables) {
      await queryRunner.query(
        `ALTER TABLE IF EXISTS "${t}" DISABLE ROW LEVEL SECURITY`,
      );
    }
    await queryRunner.query(`DROP FUNCTION IF EXISTS app_current_tenant_id()`);
  }
}
