import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface Props {
  children: React.ReactNode;
  requirePermission?: string;
}

export function ProtectedRoute({ children, requirePermission }: Props) {
  const { isLoading, isAuthenticated, hasPermission } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    const slug = window.location.pathname.split("/")[1];
    return <Navigate to={`/${slug}/login`} replace />;
  }

  if (requirePermission && !hasPermission(requirePermission)) {
    return <div>Access denied: insufficient permissions.</div>;
  }

  return <>{children}</>;
}
