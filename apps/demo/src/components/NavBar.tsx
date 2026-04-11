import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { PermissionGate } from "./PermissionGate";

export function NavBar() {
  const { tenant } = useParams<{ tenant: string }>();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate(`/${tenant}/login`);
  };

  const isActive = (path: string) => location.pathname === `/${tenant}/${path}`;

  const navLink = (path: string): React.CSSProperties => ({
    cursor: "pointer",
    padding: "4px 10px",
    borderRadius: 4,
    fontSize: 14,
    fontWeight: isActive(path) ? 600 : 400,
    color: isActive(path) ? "#0f172a" : "#475569",
    background: isActive(path) ? "#f1f5f9" : "transparent",
    textDecoration: "none",
  });

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        gap: 4,
        padding: "12px 24px",
        borderBottom: "1px solid #e2e8f0",
        marginBottom: 24,
        marginLeft: -24,
        marginRight: -24,
        marginTop: -24,
      }}
    >
      {/* tenant name / home */}
      <span
        onClick={() => navigate(`/${tenant}/dashboard`)}
        style={{
          fontWeight: 700,
          fontSize: 15,
          color: "#0f172a",
          cursor: "pointer",
          marginRight: 12,
          letterSpacing: "-0.3px",
        }}
      >
        {tenant}
      </span>

      <span onClick={() => navigate(`/${tenant}/dashboard`)} style={navLink("dashboard")}>
        Dashboard
      </span>

      <PermissionGate permission="user:read">
        <span onClick={() => navigate(`/${tenant}/users`)} style={navLink("users")}>
          Users
        </span>
      </PermissionGate>

      <PermissionGate permission="role:read">
        <span onClick={() => navigate(`/${tenant}/roles`)} style={navLink("roles")}>
          Roles
        </span>
      </PermissionGate>

      <PermissionGate permission="audit:read">
        <span onClick={() => navigate(`/${tenant}/audit`)} style={navLink("audit")}>
          Audit Logs
        </span>
      </PermissionGate>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 13, color: "#64748b" }}>{user?.email}</span>
        <button
          onClick={handleLogout}
          style={{
            padding: "6px 14px",
            background: "white",
            border: "1px solid #e2e8f0",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 13,
            color: "#475569",
            fontWeight: 500,
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
