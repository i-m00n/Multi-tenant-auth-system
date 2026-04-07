import { useAuth } from "../hooks/useAuth";
import { PermissionGate } from "../components/PermissionGate";
import { NavBar } from "../components/NavBar";

export function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <NavBar />
      <h1>Welcome, {user?.email}</h1>
      <p>Your permissions: {user?.permissions.join(", ")}</p>

      <PermissionGate permission="role:read">
        <a href="roles">Manage Roles →</a>
      </PermissionGate>

      <PermissionGate permission="audit:read">
        <a href="audit">View Audit Logs →</a>
      </PermissionGate>
    </div>
  );
}
