-- enable extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- placeholder for future RLS
ALTER DATABASE auth_db SET app.current_tenant_id = '';

CREATE OR REPLACE FUNCTION app_current_tenant_id()
RETURNS uuid AS $$
BEGIN
  RETURN current_setting('app.current_tenant_id')::uuid;
EXCEPTION
  WHEN OTHERS THEN
    RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;
