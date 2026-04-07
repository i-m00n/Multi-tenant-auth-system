import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { PermissionGate } from "./PermissionGate";

export function NavBar() {
  const { tenant } = useParams<{ tenant: string }>();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate(`/${tenant}/login`);
  };

  return (
    <nav
      style={{ display: "flex", gap: "1rem", alignItems: "center", padding: "1rem", borderBottom: "1px solid #eee" }}
    >
      <span style={{ cursor: "pointer", fontWeight: "bold" }} onClick={() => navigate(`/${tenant}/dashboard`)}>
        {tenant}
      </span>

      <PermissionGate permission="role:read">
        <span style={{ cursor: "pointer" }} onClick={() => navigate(`/${tenant}/roles`)}>
          Roles
        </span>
      </PermissionGate>

      <PermissionGate permission="audit:read">
        <span style={{ cursor: "pointer" }} onClick={() => navigate(`/${tenant}/audit`)}>
          Audit Logs
        </span>
      </PermissionGate>

      <span style={{ marginLeft: "auto" }}>{user?.email}</span>

      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}
