-- tenants
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS tenants_select ON tenants;
DROP POLICY IF EXISTS tenants_insert ON tenants;
CREATE POLICY tenants_select ON tenants
  FOR SELECT USING (true);
CREATE POLICY tenants_insert ON tenants
  FOR INSERT WITH CHECK (true);

-- users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE users FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS users_select ON users;
DROP POLICY IF EXISTS users_insert ON users;
DROP POLICY IF EXISTS users_update ON users;
CREATE POLICY users_select ON users
  FOR SELECT USING (tenant_id::uuid = app_current_tenant_id());
CREATE POLICY users_insert ON users
  FOR INSERT WITH CHECK (tenant_id::uuid = app_current_tenant_id());
CREATE POLICY users_update ON users
  FOR UPDATE USING (tenant_id::uuid = app_current_tenant_id());

-- roles
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS roles_select ON roles;
DROP POLICY IF EXISTS roles_insert ON roles;
DROP POLICY IF EXISTS roles_update ON roles;
CREATE POLICY roles_select ON roles
  FOR SELECT USING (tenant_id::uuid = app_current_tenant_id());
CREATE POLICY roles_insert ON roles
  FOR INSERT WITH CHECK (tenant_id::uuid = app_current_tenant_id());
CREATE POLICY roles_update ON roles
  FOR UPDATE USING (tenant_id::uuid = app_current_tenant_id());

-- role_permissions
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS role_permissions_select ON role_permissions;
DROP POLICY IF EXISTS role_permissions_insert ON role_permissions;
CREATE POLICY role_permissions_select ON role_permissions
  FOR SELECT USING (
    role_id IN (
      SELECT id FROM roles WHERE tenant_id::uuid = app_current_tenant_id()
    )
  );
CREATE POLICY role_permissions_insert ON role_permissions
  FOR INSERT WITH CHECK (
    role_id IN (
      SELECT id FROM roles WHERE tenant_id::uuid = app_current_tenant_id()
    )
  );
CREATE POLICY role_permissions_delete ON role_permissions
  FOR DELETE USING (
    role_id IN (
      SELECT id FROM roles WHERE tenant_id::uuid = app_current_tenant_id()
    )
  );

-- user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS user_roles_select ON user_roles;
DROP POLICY IF EXISTS user_roles_insert ON user_roles;
CREATE POLICY user_roles_select ON user_roles
  FOR SELECT USING (tenant_id::uuid = app_current_tenant_id());
CREATE POLICY user_roles_insert ON user_roles
  FOR INSERT WITH CHECK (tenant_id::uuid = app_current_tenant_id());
CREATE POLICY user_roles_delete ON user_roles
  FOR DELETE USING (tenant_id::uuid = app_current_tenant_id());

-- refresh_tokens
ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE refresh_tokens FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS refresh_tokens_select ON refresh_tokens;
DROP POLICY IF EXISTS refresh_tokens_insert ON refresh_tokens;
DROP POLICY IF EXISTS refresh_tokens_update ON refresh_tokens;
CREATE POLICY refresh_tokens_select ON refresh_tokens
  FOR SELECT USING (tenant_id::uuid = app_current_tenant_id());
CREATE POLICY refresh_tokens_insert ON refresh_tokens
  FOR INSERT WITH CHECK (tenant_id::uuid = app_current_tenant_id());
CREATE POLICY refresh_tokens_update ON refresh_tokens
  FOR UPDATE USING (tenant_id::uuid = app_current_tenant_id());

-- audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs FORCE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS audit_logs_insert ON audit_logs;
DROP POLICY IF EXISTS audit_logs_select ON audit_logs;
CREATE POLICY audit_logs_insert ON audit_logs
  FOR INSERT WITH CHECK (true);
CREATE POLICY audit_logs_select ON audit_logs
  FOR SELECT USING (tenant_id::uuid = app_current_tenant_id());