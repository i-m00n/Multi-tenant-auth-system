-- extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- database default
ALTER DATABASE auth_db SET app.current_tenant_id = '';

-- app user (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE USER app_user WITH PASSWORD 'pass';
  END IF;
END
$$;

GRANT CONNECT ON DATABASE auth_db TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON TABLES TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL PRIVILEGES ON SEQUENCES TO app_user;

-- helper function
CREATE OR REPLACE FUNCTION app_current_tenant_id()
RETURNS uuid AS $$
BEGIN
  RETURN nullif(current_setting('app.current_tenant_id', true), '')::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- tenants (no tenant_id column, open read)
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenants_isolation ON tenants;
CREATE POLICY tenants_isolation ON tenants USING (true);

-- users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_isolation ON users;
CREATE POLICY users_isolation ON users
  USING (tenant_id = app_current_tenant_id());

-- roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS roles_isolation ON roles;
CREATE POLICY roles_isolation ON roles
  USING (tenant_id = app_current_tenant_id());

-- permissions (global, no RLS)

-- role_permissions
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS role_permissions_isolation ON role_permissions;
CREATE POLICY role_permissions_isolation ON role_permissions
  USING (
    role_id IN (
      SELECT id FROM roles
      WHERE tenant_id = app_current_tenant_id()
    )
  );

-- user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_roles_isolation ON user_roles;
CREATE POLICY user_roles_isolation ON user_roles
  USING (tenant_id = app_current_tenant_id());

-- refresh_tokens
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS refresh_tokens_isolation ON refresh_tokens;
CREATE POLICY refresh_tokens_isolation ON refresh_tokens
  USING (tenant_id = app_current_tenant_id());

-- audit_logs — append only, tenant-isolated reads
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_logs_insert ON audit_logs;
CREATE POLICY audit_logs_insert ON audit_logs
  FOR INSERT TO app_user
  WITH CHECK (true);

DROP POLICY IF EXISTS audit_logs_select ON audit_logs;
CREATE POLICY audit_logs_select ON audit_logs
  FOR SELECT TO app_user
  USING (tenant_id = app_current_tenant_id());

-- no UPDATE policy — updates blocked
-- no DELETE policy — deletes blocked