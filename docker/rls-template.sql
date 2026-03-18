-- Enable RLS
ALTER TABLE {{table}} ENABLE ROW LEVEL SECURITY;
ALTER TABLE {{table}} FORCE ROW LEVEL SECURITY;

-- SELECT
CREATE POLICY {{table}}_select_policy
ON {{table}}
FOR SELECT
USING (tenant_id = app_current_tenant_id());

-- INSERT
CREATE POLICY {{table}}_insert_policy
ON {{table}}
FOR INSERT
WITH CHECK (tenant_id = app_current_tenant_id());

-- UPDATE
CREATE POLICY {{table}}_update_policy
ON {{table}}
FOR UPDATE
USING (tenant_id = app_current_tenant_id());

-- DELETE
CREATE POLICY {{table}}_delete_policy
ON {{table}}
FOR DELETE
USING (tenant_id = app_current_tenant_id());