import { Navigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface Props {
  children: React.ReactNode;
  requirePermission?: string;
}

export function ProtectedRoute({ children, requirePermission }: Props) {
  const { isLoading, isAuthenticated, hasPermission } = useAuth();
  const { tenant } = useParams<{ tenant: string }>();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400 text-sm">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={`/${tenant}/login`} replace />;
  }

  if (requirePermission && !hasPermission(requirePermission)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-sm">Access denied — insufficient permissions.</div>
      </div>
    );
  }

  return <>{children}</>;
}
