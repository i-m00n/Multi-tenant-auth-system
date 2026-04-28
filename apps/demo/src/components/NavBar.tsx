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

  // Helper to generate dynamic classes
  const getNavLinkClass = (path: string) => {
    const activeStyles = isActive(path)
      ? "font-semibold text-slate-900 bg-slate-100"
      : "font-normal text-slate-600 bg-transparent hover:bg-slate-50";

    return `cursor-pointer px-2.5 py-1 rounded text-sm transition-colors ${activeStyles}`;
  };

  return (
    <nav className="flex items-center gap-1 px-6 py-3 border-b border-slate-200 mb-6 -mx-6 -mt-6">
      {/* Tenant Branding */}
      <span
        onClick={() => navigate(`/${tenant}/dashboard`)}
        className="font-bold text-[15px] text-slate-900 cursor-pointer mr-3 tracking-tight"
      >
        {tenant}
      </span>

      {/* Nav Items */}
      <span onClick={() => navigate(`/${tenant}/dashboard`)} className={getNavLinkClass("dashboard")}>
        Dashboard
      </span>

      <PermissionGate permission="user:read">
        <span onClick={() => navigate(`/${tenant}/users`)} className={getNavLinkClass("users")}>
          Users
        </span>
      </PermissionGate>

      <PermissionGate permission="role:read">
        <span onClick={() => navigate(`/${tenant}/roles`)} className={getNavLinkClass("roles")}>
          Roles
        </span>
      </PermissionGate>

      <PermissionGate permission="audit:read">
        <span onClick={() => navigate(`/${tenant}/audit`)} className={getNavLinkClass("audit")}>
          Audit Logs
        </span>
      </PermissionGate>

      {/* User Info & Logout */}
      <div className="ml-auto flex items-center gap-3">
        <span className="text-xs text-slate-500">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="px-3.5 py-1.5 bg-white border border-slate-200 rounded text-xs text-slate-600 font-medium hover:bg-slate-50 transition-colors shadow-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
